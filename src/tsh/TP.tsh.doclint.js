//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.tsh.doclint}
 * @summary A subtype of TP.core.ActionTag that knows how to
 *     conditionally process its child actions based on a binding expression.
 */

//  ------------------------------------------------------------------------

TP.core.ActionTag.defineSubtype('tsh:doclint');

TP.tsh.doclint.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.doclint.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Runs the receiver, effectively invoking its action.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue. Common values are TP.CONTINUE, TP.DESCEND, and
     *     TP.BREAK.
     */

    var shell,

        methods,
        results,
        context,
        missing,
        filter,
        arg0,
        target,
        owner,
        pattern,
        tags,
        aliases,
        keys,
        dups,
        fileDict,
        totalErrors,
        errorFiles,
        totalFiles,
        prefix;

    shell = aRequest.at('cmdShell');

    //  If either one of the debugging flags is turned on, then echo the
    //  debugging information.
    if (shell.getArgument(aRequest, 'tsh:debug', null, false)) {
        return this.printDebug(aRequest, true, false);
    }

    if (shell.getArgument(aRequest, 'tsh:debugresolve', null, false)) {
        return this.printDebug(aRequest, true, true);
    }

    //  TODO:   migrate the actual checking code to a more reusable location.

    aRequest.atPut('cmdTAP',
        shell.getArgument(aRequest, 'tsh:tap', null, true));

    missing = shell.getArgument(aRequest, 'tsh:missing', null, false);

    results = TP.ac();

    //  The following tags allow duplicate entries for the same tag. This list is
    //  not strictly exhaustive, but it should be adequate for now.
    dups = TP.ac(
            '@param', '@throws', '@exception', '@fires', '@listens', '@mixes',
            '@example', '@author');

    tags = TP.ac(
            '@abstract', '@virtual', '@access', '@alias', '@augments',
            '@extends', '@author', '@borrows', '@callback', '@class',
            '@constructor', '@classdesc', '@constant', '@const', '@constructs',
            '@copyright', '@default', '@defaultvalue', '@deprecated',
            '@description', '@desc', '@enum', '@event', '@example', '@exports',
            '@external', '@host', '@file', '@fileoverview', '@overview', '@fires',
            '@emits', '@function', '@func', '@method', '@global', '@ignore',
            '@implements', '@inheritdoc', '@inner', '@instance', '@interface',
            '@kind', '@lends', '@license', '@listens', '@member', '@var',
            '@memberof', '@mixes', '@mixin', '@module', '@name', '@namespace',
            '@overide', '@param', '@arg', '@argument', '@private', '@property',
            '@prop', '@protected', '@public', '@readonly', '@requires',
            '@returns', '@return', '@see', '@since', '@static', '@summary',
            '@this', '@throws', '@exception', '@todo', '@tutorial', '@type',
            '@typedef', '@variation', '@version');

    aliases = TP.hc(
            '@virtual', '@abstract',
            '@return', '@returns',
            '@extends', '@augments',
            '@const', '@constant',
            '@defaultvalue', '@default',
            '@desc', '@description',
            '@host', '@external',
            '@fileoverview', '@overview',
            '@file', '@overview',
            '@emits', '@fires',
            //  NOTE we don't convert @exception to @throws, they're different
            //  in TIBET. @exception is based on raise() and @throws is via
            //  throw.
            '@function', '@method',
            '@func', '@method',
            '@member', '@var',
            '@arg', '@param',
            '@argument', '@param',
            '@prop', '@property');

    keys = TP.keys(aliases);

    fileDict = TP.hc();

    arg0 = shell.getArgument(aRequest, 'ARG0');
    if (TP.isValid(arg0)) {
        owner = arg0;
        target = TP.id(arg0);
    } else {
        //  Target is an optional "owner" specification for filtering by method
        //  owner. The value must be resolvable via TP.bySystemId.
        target = shell.getArgument(aRequest, 'tsh:target', null);
        if (TP.notEmpty(target)) {
            target = target.unquoted();
            owner = TP.bySystemId(target);
        }
    }

    if (TP.notEmpty(target) && TP.notValid(owner)) {
        return aRequest.fail('Unable to resolve target: ' + target);
    }

    //  Context determines whether we care about app, lib, or both. It is always
    //  in effect and defaults to app.
    context = shell.getArgument(aRequest, 'tsh:context', 'app');
    if (TP.isEmpty(context)) {
        if (/^APP/.test(target)) {
            context = 'app';
        } else if (/^TP/.test(target)) {
            context = 'lib';
        }
    }

    if (TP.isString(context)) {
        context = context.unquoted();
    }

    filter = shell.getArgument(aRequest, 'tsh:filter', null);
    if (TP.notEmpty(filter)) {
        filter = filter.unquoted();

        //  TODO: generalize this
        if (/^\/.+\/([ig]*)$/.test(filter)) {
            pattern = RegExp.construct(filter);
        }
    }

    methods = TP.sys.getMetadata('methods');
    methods.perform(
        function(item) {
            var name,
                func,
                file,
                lines,
                names,
                match,
                found,
                tagline,
                type,
                desc,
                taglines,
                dict,
                text,
                result,
                source,
                error,
                fParams,
                cParams,
                defaultMatch;

            name = item.at(0);
            func = item.at(1);

            //  Owner is our resolved target, used for filtering by method owner.
            if (TP.isValid(owner)) {
                if (!name.startsWith(target)) {
                    return;
                }
            }

            //  Note how we go after load path here, since source paths will
            //  never be minified and that's what we check below.
            file = TP.objectGetLoadPath(func);

            error = {
                file: file,
                name: name,
                errors: TP.ac()
            };

            //  Context can be either app, lib, or both. We use that to
            //  determine if a particular component should be checked at a very
            //  broad level.
            if (context === 'app') {
                if (!TP.boot.$uriInTIBETFormat(file).startsWith('~app')) {
                    return;
                }
            } else if (context === 'lib') {
                if (!TP.boot.$uriInTIBETFormat(file).startsWith('~lib')) {
                    return;
                }
            }

            if (TP.notEmpty(filter)) {
                if (TP.isValid(pattern)) {
                    //  Regular expression as filter.
                    if (!pattern.match(name)) {
                        return;
                    }
                } else {
                    //  Normal text string as filter.
                    if (!name.contains(filter)) {
                        return;
                    }
                }
            }

            //  Create an entry for every file. This will let us count total
            //  files in addition to just error files.
            if (TP.notEmpty(file)) {
                fileDict.atPut(file, null);
            }

            lines = func.getCommentLines();
            source = func.getSourceText();

            if (TP.notValid(lines)) {
                //  Most common issue here is running against a system that's
                //  loading minified code.
                if (TP.notEmpty(file) &&
                    !file.match(/\.min\./) &&
                    !func.$resolutionMethod) {

                    text = func.toString();
                    if (!TP.regex.NATIVE_CODE.test(text)) {
                        results.push(
                            {
                                file: file,
                                name: name,
                                errors: TP.ac('missing comment')
                            });
                    }
                }
            } else if (lines.length === 0) {
                results.push(
                    {
                        file: file,
                        name: name,
                        errors: TP.ac('empty comment')
                    });
            } else {

                //  Comment. Question is, is it viable?

                //  If we're only interested in missing/empty comment blocks
                //  don't worry about processing details in ones that exist.
                if (missing) {
                    return;
                }

                //  ---
                //  tag validity and aliasing
                //  ---

                lines.forEach(
                    function(line, index) {
                        var tag;

                        //  Skip lines for examples etc. which won't start with
                        //  @
                        if (line.charAt(0) !== '@') {
                            return;
                        }

                        //  Alias over any tags so our lint checks focus on
                        //  a canonical variant.
                        keys.forEach(
                                function(key) {
                                    var value;

                                    value = aliases.at(key);

                                    //  NOTE the trailing space. This ensures we
                                    //  don't match @description and think it's
                                    //  @desc etc.
                                    if (line.startsWith(key + ' ')) {
                                        result = TP.ifInvalid(result, error);
                                        result.errors.push(
                                            'prefer ' + value + ' to ' + key);
                                        lines[index] = line.replace(key, value);
                                    }
                                });

                        //  Verify all tags are known.
                        tag = line.split(' ').first();
                        if (tags.indexOf(tag) === TP.NOT_FOUND) {
                            result = TP.ifInvalid(result, error);
                            result.errors.push(tag + ' unknown');
                        }
                    });

                //  ---
                //  @method
                //  ---

                names = lines.filter(
                            function(line) {
                                return line.startsWith('@method ') ||
                                        line.startsWith('@alias ');
                            });

                if (TP.isEmpty(names)) {
                    result = TP.ifInvalid(result, error);
                    result.errors.push('@method missing');
                } else {

                    //  The name is of the form A_B_method_name_parts where we
                    //  can even have double-underscore. As a result we have to
                    //  use a regex rather than split or other approaches.
                    match = name.match(/^(.*)_(.*?)_(.*?)$/);

                    found = false;
                    names.forEach(
                            function(line) {
                                var lineParts;

                                //  Throw away tag, keeping remainder.
                                lineParts = line.split(' ').last();

                                if (match && match.at(3) === lineParts) {
                                    found = true;
                                }
                            });

                    if (!found) {

                        result = TP.ifInvalid(result, error);
                        result.errors.push('@method incorrect');
                    }
                }

                //  ---
                //  duplicates
                //  ---

                //  Collect all tag-prefixed lines.
                taglines = lines.filter(
                                    function(line) {
                                        return line.startsWith('@');
                                    });

                dict = TP.hc();

                taglines.forEach(
                            function(line) {
                                var tag;

                                //  Slice the tag off the front.
                                tag = line.split(' ').first();

                                //  Check to see if dups are allowed for this
                                //  tag.
                                if (dups.indexOf(tag) !== TP.NOT_FOUND) {
                                    return;
                                }

                                //  Verify via hash lookup and add any new ones.
                                if (dict.at(tag)) {
                                    result = TP.ifInvalid(result, error);
                                    result.errors.push(
                                                'multiple ' + tag + '\'s');
                                } else {
                                    dict.atPut(tag, tag);
                                }
                            });

                //  ---
                //  summary/description
                //  ---

                //  Have to have a summary or description (preferably both ;)).
                taglines = lines.filter(
                                function(line) {
                                    return line.startsWith('@summary ') ||
                                            line.startsWith('@description ');
                                });

                if (TP.isEmpty(taglines)) {
                    result = TP.ifInvalid(result, error);
                    result.errors.push('@summary/@description missing');
                }

                //  ---
                //  @param
                //  ---

                //  Collect the comment parameters...
                cParams = lines.filter(
                                function(line) {
                                    return line.startsWith('@param ');
                                });

                //  Collect comment parameter names. While we're processing
                //  these verify that each @param has a type definition.
                cParams =
                    cParams.map(
                        function(param) {
                            var theParam,

                                paramType,
                                paramParts,
                                count,
                                i,
                                c,
                                len,
                                pname,
                                pdesc,
                                needName,
                                optional,
                                defaulted;

                            theParam = param.slice('@param '.length);

                            //  Check for parameter type references...
                            if (theParam.indexOf('{') !== 0) {

                                //  Apparently not formatted with a type for the
                                //  param.
                                result = TP.ifInvalid(result, error);
                                result.errors.push('missing type for @param ');
                                needName = true;

                            } else {

                                //  Since some parameter type descriptions
                                //  involve the use of nested {}'s we need to
                                //  actually do a simple count here to be
                                //  certain of our result.
                                len = theParam.length;
                                paramType = '';
                                count = 0;

                                for (i = 0; i < len; i++) {

                                    c = theParam.charAt(i);

                                    if (c === '}') {
                                        count--;

                                        if (count === 0) {
                                            theParam =
                                                theParam.slice(i + 1).trim();
                                            break;
                                        }

                                    } else if (c === '{') {
                                        count++;
                                    }

                                    paramType += c;
                                }

                                //  If the braces aren't balanced we can fall
                                //  off the end. Watch out for that.
                                if (count !== 0) {
                                    result = TP.ifInvalid(result, error);
                                    result.errors.push(
                                            'unbalanced {}\'s in @param ');
                                    needName = true;

                                    //  Take our best guess at what the real
                                    //  type and parameter name are.
                                    paramType = theParam.slice(
                                                1, theParam.lastIndexOf('}'));
                                    paramType =
                                        '{' +
                                        paramType.strip('{').strip('}') +
                                        '}';

                                    theParam = theParam.slice(
                                        theParam.lastIndexOf('}') + 1).trim();
                                } else {

                                    //  Otherwise, append a closing '}' to match
                                    //  the logic above
                                    paramType += '}';
                                }

                                //  We want to use a leading '?' not 'null' in
                                //  types.
                                if (paramType.match(/null/)) {

                                    result = TP.ifInvalid(result, error);
                                    result.errors.push(
                                        'prefer {?...} in @param ');

                                    needName = true;
                                }

                                //  We want function() instead of Function for
                                //  function parameters so there's a tendency to
                                //  document signature.
                                if (paramType.match(/Function/)) {

                                    result = TP.ifInvalid(result, error);
                                    result.errors.push(
                                        'prefer {function(...)} in @param ');

                                    needName = true;
                                }

                                //  We want to use Type[] rather than
                                //  Array.<Type>
                                if (paramType.match(/Array/)) {

                                    result = TP.ifInvalid(result, error);
                                    result.errors.push(
                                        'prefer {Type[]} in @param ');

                                    needName = true;
                                }

                                //  We want to use {key: type} rather than
                                //  Object.<>
                                if (paramType.match(/Object\./)) {

                                    result = TP.ifInvalid(result, error);
                                    result.errors.push(
                                        'prefer @param name.slot for @param ');

                                    needName = true;
                                }
                            }

                            //  Param name should be next non-whitespace
                            //  sequence... or the content of ['s before any =
                            //  for signifying a default value.
                            if (theParam.charAt(0) === '[') {

                                optional = true;

                                pname = theParam.slice(1, theParam.indexOf(']'));
                                defaulted = pname.indexOf('=') !== TP.NOT_FOUND;
                                pname = pname.split('=').first();

                                pdesc = theParam.slice(
                                        theParam.lastIndexOf(']') + 1).trim();
                            } else {
                                paramParts = theParam.split(' ');
                                pname = paramParts.shift();
                                pdesc = paramParts.join(' ');
                            }

                            //  Verify the parameter has a description.
                            if (TP.isEmpty(pdesc)) {
                                result = TP.ifInvalid(result, error);
                                result.errors.push(
                                            'missing description for @param ');

                                needName = true;
                            } else {

                                //  There's a description. Does it indicate that
                                //  we may need optional/default value content
                                //  for the pname?
                                if (pdesc.match(/[Oo]ptional/) &&
                                    !optional) {

                                    result = TP.ifInvalid(result, error);
                                    result.errors.push(
                                        'use [name] for optional @param ');

                                    needName = true;
                                }

                                if (pdesc.match(/[Dd]efault/) &&
                                    !defaulted) {

                                    result = TP.ifInvalid(result, error);
                                    result.errors.push(
                                        'use [name=value] for defaulted' +
                                        ' @param ');

                                    needName = true;

                                } else {

                                    defaultMatch = RegExp.construct(
                                        'TP\\.if(Invalid|Null|Undefined)\\(' +
                                        pname);

                                    if (source.match(defaultMatch) &&
                                        !defaulted) {

                                        result = TP.ifInvalid(result, error);
                                        result.errors.push(
                                            'use [name=value] for defaulted' +
                                            ' @param ');

                                        needName = true;
                                    }
                                }
                            }

                            //  If we flagged a missing type we need to append
                            //  the name to the last message.
                            if (needName) {
                                result.errors.atPut(
                                        result.errors.length - 1,
                                        result.errors.last() + pname);
                            }

                            //  If the param is a varargs param we should see
                            //  '...' in the type definition.
                            if (pname === 'varargs' &&
                                    TP.notValid(paramType.match(/\.\.\./))) {

                                result = TP.ifInvalid(result, error);
                                result.errors.push(
                                        '@param varargs needs \'...\' in type');
                            }

                            if (source.match(/arguments\.length/)) {

                                result = TP.ifInvalid(result, error);
                                result.errors.push(
                                        '@param list needs a param of' +
                                        ' \'varargs\' and that params needs' +
                                        ' \'...\' in type');
                            }

                            return pname;
                        });

                //  Get the function's parameter name list.
                fParams = func.getParameterNames();

                //  Filter comment parameters to remove any nested ones.
                cParams = cParams.filter(
                                    function(pname) {
                                        return pname.indexOf('.') ===
                                                                TP.NOT_FOUND;
                                    });

                //  Order matters here so loop over the function signature and
                //  make sure that a) all items are accounted for, and b) the
                //  order of the items (not including "nested properties") is
                //  consistent.
                fParams.forEach(
                            function(pname, index) {

                                //  Does the parameter exist?
                                if (cParams.indexOf(pname) === TP.NOT_FOUND) {

                                    result = TP.ifInvalid(result, error);
                                    result.errors.push(
                                        '@param ' + pname + ' missing');

                                } else if (cParams[index] !== pname) {

                                    result = TP.ifInvalid(result, error);
                                    result.errors.push(
                                        '@param ' + pname + ' mismatch');
                                }
                            });

                //  Now for the other direction, comment parameters which are
                //  found but which are not valid in the function signature...
                cParams.forEach(
                            function(pname) {
                                if (fParams.indexOf(pname) === TP.NOT_FOUND) {

                                    result = TP.ifInvalid(result, error);
                                    result.errors.push(
                                        '@param ' +
                                        pname +
                                        ' not in signature');
                                }
                            });

                //  ---
                //  @returns
                //  ---

                tagline = lines.detect(
                                function(line) {
                                    return line.startsWith('@returns ');
                                });

                //  Returns should include a type at a minimum.
                if (TP.notEmpty(tagline)) {

                    type = tagline.slice(
                            tagline.indexOf('{'),
                            tagline.lastIndexOf('}') + 1);

                    if (TP.isEmpty(type)) {
                        result = TP.ifInvalid(result, error);
                        result.errors.push('no @returns type(s)');
                    } else {
                        desc = tagline.slice(tagline.lastIndexOf('}') + 1);
                        if (TP.isEmpty(desc)) {
                            result = TP.ifInvalid(result, error);
                            result.errors.push('no @returns description');
                        }
                    }
                }

                //  Remaining checks are sanity checks comparing the type and
                //  the nature of the return calls in the code.
                if (source.match(/return (.*?)/)) {

                    //  Complex returns, so there should be a real @returns tag.
                    if (TP.isEmpty(tagline)) {

                        //  If there's at least one occurrence of one that's not
                        //  just 'return;', then we should have a tag, otherwise
                        //  we shouldn't.
                        if (source.match(/return (.+?)/)) {
                            result = TP.ifInvalid(result, error);
                            result.errors.push(
                                    'no @returns for non-empty return(s)');
                        }
                    } else if (type) {
                        if (source.match(/return;/)) {
                            //  At least one nullable return. Make sure the type
                            //  accounts for that.
                            if (type && !type.match(/(null|\?)/)) {
                                result = TP.ifInvalid(result, error);
                                result.errors.push(
                                    'missing {?...} for nullable @returns');
                            }
                        } else if (type && type.match(/null/)) {
                            result = TP.ifInvalid(result, error);
                            result.errors.push(
                                'prefer {?...} for nullable @returns');
                        }
                    }
                } else {

                    //  No complex returns in the code.
                    if (TP.notEmpty(tagline)) {
                        result = TP.ifInvalid(result, error);
                        result.errors.push('extraneous @returns');
                    }
                }

                //  ---
                //  other type checks
                //  ---

                //  @throws, @exception, @signal, @listens should all be done so
                //  we have a separate type and description per line.
                taglines = lines.filter(
                                function(line) {
                                    return line.match(
                                        /@(throws|exception|fires|listens) /);
                                });

                taglines.forEach(
                            function(line) {
                                var tag;

                                tag = line.split(' ').first();

                                if (TP.notEmpty(line)) {

                                    type = line.slice(line.indexOf('{'),
                                            line.lastIndexOf('}'));

                                    if (TP.isEmpty(type)) {

                                        result = TP.ifInvalid(result, error);
                                        result.errors.push(
                                            'no ' + tag + ' type(s)');
                                    } else if (type.match(/[,|]/)) {
                                        result = TP.ifInvalid(result, error);
                                        result.errors.push(
                                            'prefer one type per ' + tag);
                                    }
                                }
                            });

                //  ---
                //  source checks
                //  ---

                if (source.match(/\.todo\(/)) {
                    tagline = lines.detect(
                                    function(line) {
                                        return line.startsWith('@todo ');
                                    });

                    if (TP.isEmpty(tagline)) {
                        result = TP.ifInvalid(result, error);
                        result.errors.push('no @todo for TP.todo()');
                    }
                }

                if (source.match(/\.signal\(/)) {
                    tagline = lines.detect(
                                    function(line) {
                                        return line.startsWith('@fires ');
                                    });

                    if (TP.isEmpty(tagline)) {
                        result = TP.ifInvalid(result, error);
                        result.errors.push('no @fires for signal()');
                    }
                }

                if (source.match(/\.observe\(/)) {
                    tagline = lines.detect(
                                    function(line) {
                                        return line.startsWith('@listens ');
                                    });

                    if (TP.isEmpty(tagline)) {
                        result = TP.ifInvalid(result, error);
                        result.errors.push('no @listens for observe()');
                    }
                }

                if (source.match(/\.raise\(/)) {
                    tagline = lines.detect(
                                    function(line) {
                                        return line.startsWith('@exception ');
                                    });

                    if (TP.isEmpty(tagline)) {
                        result = TP.ifInvalid(result, error);
                        result.errors.push('no @exception for raise()');
                    }
                }

                if (source.match(/throw (.*?);/)) {
                    tagline = lines.detect(
                                    function(line) {
                                        return line.startsWith('@throws ');
                                    });

                    if (TP.isEmpty(tagline)) {
                        result = TP.ifInvalid(result, error);
                        result.errors.push('no @throws for throw');
                    }
                }
            }

            if (result) {
                results.push(result);
            }
        });

    //  Output the results. Our content looks like this:
    //  [ { file: filename, name: funcname, errors: [a, b, c] }, ... ]
    //  Our goal is to coalesce by file name so we can output the set of errors
    //  specific to that file in a set.

    totalFiles = fileDict.getKeys().getSize();
    errorFiles = 0;
    totalErrors = 0;

    results.forEach(
            function(result) {
                var errors;

                errors = fileDict.at(result.file);
                if (TP.notValid(errors)) {
                    errors = TP.ac();
                }
                fileDict.atPut(result.file, errors);

                errors.push(result);
            });

    //  Now that we've reorganized the results truncate that list. We'll use it
    //  again for line-by-line output below.
    results.length = 0;

    //  Loop over the files, sorted by name, and dump the file name and then all
    //  errors for that file.
    fileDict.getKeys().sort().forEach(
            function(key) {

                var entries;

                entries = fileDict.at(key);
                if (TP.notValid(entries)) {
                    if (TP.notEmpty(key)) {
                        results.push('ok - ' + key);
                    }
                    return;
                }

                errorFiles++;

                //  Output the file name.
                results.push('not ok - ' + key);

                entries.forEach(
                        function(entry) {
                            var name,
                                errors;

                            TP.regex.UNDERSCORES.lastIndex = 0;
                            name = entry.name.replace(
                                    TP.regex.UNDERSCORES, '.');
                            errors = entry.errors;

                            totalErrors += errors.length;

                            results.push(
                                '# ' + name + ' (' + errors.length +
                                ') -> [' + errors.join(', ') + ']');
                        });
            });

    //  Output some summary data.
    if (totalErrors > 0) {
        prefix = '# FAIL: ';
    } else {
        prefix = '# PASS: ';
    }

    results.push(prefix + totalErrors + ' errors in ' + errorFiles +
                    ' of ' + totalFiles + ' files.');

    //  PhantomJS/CLI support requires output line-by-line.
    if (TP.sys.cfg('boot.context') === 'phantomjs') {

        results.forEach(
                function(result) {
                    TP.sys.logTest(result);
                });

        aRequest.complete(TP.TSH_NO_VALUE);

        return;
    }

    //  When outputting outside of PhantomJS/CLI, just join all of the results
    //  together with a newline. Because we specified 'cmdTAP' above, this
    //  output will be untouched.
    aRequest.complete(results.join('\n'));

    return;
});

//  ------------------------------------------------------------------------

TP.shell.TSH.addHelpTopic('doclint',
    TP.tsh.doclint.Type.getMethod('tshExecute'),
    'Run a lint check on all method comments.',
    ':doclint [<target>] [--filter <filter>] [--context <app|lib|all>]',
    'See CLI documentation');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
