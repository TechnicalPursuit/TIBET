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
 * @type {TP.tsh.apropos}
 * @summary A subtype of TP.tag.ActionTag that knows how to
 *     conditionally process its child actions based on a binding expression.
 */

//  ------------------------------------------------------------------------

TP.tag.ActionTag.defineSubtype('tsh:apropos');

TP.tsh.apropos.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.apropos.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Runs the receiver, effectively invoking its action.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {TP.sig.Request} The request.
     */

    var shell,
        methods,
        terms,
        limit,
        comments,
        ignorecase,
        minified,
        byName,
        byComments,
        results;

    shell = aRequest.at('cmdShell');

    //  If either one of the debugging flags is turned on, then echo the
    //  debugging information.
    if (shell.getArgument(aRequest, 'tsh:debug', null, false)) {
        return this.printDebug(aRequest, true, false);
    }

    if (shell.getArgument(aRequest, 'tsh:debugresolve', null, false)) {
        return this.printDebug(aRequest, true, true);
    }

    //  No arguments means we dump usage.
    if (!shell.hasArguments(aRequest)) {
        return this.printUsage(aRequest);
    }

    terms = shell.getArgument(aRequest, 'ARGV');
    limit = Math.max(1, shell.getArgument(aRequest, 'tsh:limit', 2));
    comments = shell.getArgument(aRequest, 'tsh:comments', false);
    ignorecase = shell.getArgument(aRequest, 'tsh:ignorecase', true);

    //  Convert terms into regular expressions if possible. Otherwise use the
    //  original term and we'll try indexOf during checking.
    terms = terms.map(
                function(term) {
                    var regex,
                        str,
                        parts;

                    //  Use a global regex so we can capture counts which form a
                    //  basis for determining which matches are most relevant.
                    str = term.unquoted();
                    parts = TP.stringRegExpComponents(str);
                    if (TP.notTrue(/g/.test(parts[1]))) {
                        parts[1] += 'g';
                    }

                    if (TP.notFalse(ignorecase)) {
                        parts[1] += 'i';
                    }

                    regex = RegExp.construct(parts[0], parts[1]);
                    if (TP.notValid(regex)) {
                        return str;
                    }
                    return regex;
                });

    byName = TP.ac();
    byComments = TP.ac();

    methods = TP.sys.getMetadata('methods');
    methods.perform(
            function(item) {
                var name,
                    method,
                    nameMatch,
                    func,
                    text,
                    file,
                    ands,
                    count;

                //  Metadata stores methods as Owner_Track_Name so split here.
                name = item.at(0);
                method = name.split('_').last();

                func = item.at(1);

                //  Note how we go after load path and not source path. Load
                //  path is where the code was actually loaded from, which may
                //  vary from sourcePath when working with minified code.
                file = TP.objectGetLoadPath(func);
                text = comments ? func.getCommentText() : '';

                //  When there's no comment text in the method body we need to
                //  know if that's because it's minified or not.
                if (TP.isEmpty(text)) {
                    if (TP.notEmpty(file) && file.match(/\.min\./)) {
                        minified = true;
                    }
                }

                ands = 0;
                count = 0;

                //  When we have multiple terms we want to treat them as an AND
                //  condition (since you can easily do OR via RegExp).
                terms.forEach(
                        function(term) {
                            var parts,
                                found,
                                match;

                            if (TP.isString(term)) {
                                //  Split the comment using the string. The
                                //  number of parts represents one more than the
                                //  number of times that string was in the text.
                                parts = text.split(term);
                                count += parts.getSize() - 1;

                                if (method.indexOf(term) !== TP.NOT_FOUND) {
                                    nameMatch = true;
                                    count += 1;
                                    ands += 1;
                                }

                            } else {
                                //  Our regular expressions are global so
                                //  they'll provide a match count for the total
                                //  string.
                                match = term.match(text);
                                if (TP.isValid(match)) {
                                    count += match.getSize();
                                    found = true;
                                    ands += 1;
                                }

                                match = term.match(method);
                                if (TP.isValid(match)) {
                                    nameMatch = true;
                                    count += match.getSize();

                                    //  If we haven't already counted this term
                                    //  count it as having matched.
                                    if (!found) {
                                        ands += 1;
                                    }
                                }
                            }
                        });

                if (ands !== terms.getSize()) {
                    return;
                }

                if (nameMatch) {
                    byName.push(TP.ac(name, count, true));
                } else if (count >= limit) {
                    byComments.push(TP.ac(name, count, false));
                }
            });

    //  Convert common encodings back into proper form for reflection.
    byName = byName.map(function(pair) {
        return pair.atPut(0, pair.at(0).replace('_Primitive_', '.').replace(
                '_Type_', '.Type.').replace('_Inst_', '.Inst.'));
    });

    byComments = byComments.map(function(pair) {
        return pair.atPut(0, pair.at(0).replace('_Primitive_', '.').replace(
            '_Type_', '.Type.').replace('_Inst_', '.Inst.'));
    });

    //  The name matches come first but we still want to sort them by any
    //  additional count information they may have.
    byName = byName.sort(
                function(a, b) {
                    if (a[1] < b[1]) {
                        return 1;
                    } else if (a[1] > b[1]) {
                        return -1;
                    } else {
                        //  counts match, order by character sequencing
                        if ([a, b].sort()[1] === b) {
                            return -1;
                        } else {
                            return 0;
                        }
                    }
                });

    //  Sort comment-based matches by count. We'll append this list to the name
    //  matches for the output sequence.
    byComments = byComments.sort(
                    function(a, b) {
                        if (a[1] < b[1]) {
                            return 1;
                        } else if (a[1] > b[1]) {
                            return -1;
                        } else {
                            //  counts match, order by character sequencing
                            if ([a, b].sort()[1] === b) {
                                return -1;
                            } else {
                                return 0;
                            }
                        }
                    });

    //  Throw some separator content into the output between chunks...
    byName.unshift(TP.ac('#', 0));
    byName.unshift(TP.ac('# by name', 0));
    byName.unshift(TP.ac('', 0));

    if (comments) {
        byName.push(TP.ac('#', 0));
        byName.push(TP.ac('# by comment', 0));
        byName.push(TP.ac('#', 0));
        results = byName.concat(byComments);
    } else {
        results = byName;
    }

    results = results.map(
                function(result) {
                    var str;

                    str = result.at(0);
                    if (comments && result.at(1) >= limit) {
                        str += ' (' + result.at(1) + ')';
                    }

                    return str;
                });

    //  If we found any minified source along the way point that out.
    if (minified) {
        results.unshift(
            'Partial results. Some package@config files were minified.');
    }

    //  Headless/CLI support requires output line-by-line.
    if (TP.sys.cfg('boot.context') === 'headless') {

        results.forEach(
                function(result) {
                    aRequest.stdout(result);
                });

        aRequest.complete('');
        return aRequest;
    }

    //  Filter blank lines and comment output
    aRequest.complete(results.join('\n'));

    return aRequest;
});

//  ------------------------------------------------------------------------

TP.shell.TSH.addHelpTopic('apropos',
    TP.tsh.apropos.Type.getMethod('tshExecute'),
    'List methods related to a topic.',
    ':apropos <terms> [--comments] [--limit=N] [--no-ignorecase]',
    'See CLI documentation');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
