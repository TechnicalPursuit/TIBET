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
 * @type {TP.tsh.reflect}
 * @summary A subtype of TP.tag.ActionTag that knows how to
 *     conditionally process its child actions based on a binding expression.
 */

//  ------------------------------------------------------------------------

TP.tag.ActionTag.defineSubtype('tsh:reflect');

TP.tsh.reflect.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.reflect.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Runs the receiver, effectively invoking its action.
     * @description This command provides reflection data dependent on the
     *     object and parameters provided. Output from this command is based on
     *     the nature of the object being reflected upon.
     *     - An empty set of arguments returns usage data.
     *     - A standard namespace without arguments provides types on that
     *     namespace. The APP root typically lists namespaces found below that
     *     root. TP will list any namespaces and primitives available for
     *     further reflection.
     *     - A type will normally default to listing type, instance, and local
     *     methods.
     *     - An instance will typically default to local and instance method
     *     listings.
     *     The ultimate goal is to support exploration and filtering across the
     *     metadata from types to methods to method owners.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {TP.sig.Request} The request.
     */

    var getTIBETMethodInfoOrNull,
        renderResults,

        shell,
        arg0,
        meta,
        obj,
        regex,
        str,
        name,
        names,
        path,
        keys,
        types,
        methods,
        owners,
        attributes,
        filter,
        interf,
        pwd,
        docsonly,
        text,
        file,
        inputStr,
        locStr,
        results,
        nativeref;

    getTIBETMethodInfoOrNull = function(aMethod, methodResults) {

        if (TP.canInvoke(aMethod, 'getMethodName')) {
            methodResults.push(aMethod.getMethodName(), '');
        }
        methodResults.push(aMethod.getSignature());

        text = aMethod.getCommentText();

        if (TP.isEmpty(text)) {

            //  Note how we go after load path here, since source
            //  paths will never be minified and that's what we
            //  check below.
            file = TP.objectGetLoadPath(aMethod);

            if (TP.notEmpty(file)) {
                if (file.match(/\.min\./)) {
                    methodResults.push(
                        'Source minified.' +
                        ' No comment text available.');
                } else {
                    methodResults.push(
                        'Uncommented :(.' +
                        ' No comment text available.');
                }
            } else {
                methodResults.push(
                    'No source file. Native code?');
            }
        } else {
            methodResults.push('');
            methodResults.push(text.replace(/\n\s+\*/g, '\n *'));
        }
    };

    renderResults = function(inputKeys, inputResults, inputRequest) {

        if (TP.sys.cfg('boot.context') === 'headless') {
            inputResults.addAll(inputKeys);
        } else {
            inputRequest.atPut('cmdAsIs', true);

            inputResults.push('<ul>');
            inputKeys.forEach(
                    function(aKey) {
                        results.push(
                            '<li>',
                            '<a href="#" onclick="TP.bySystemId(\'SherpaConsoleService\').sendConsoleRequest(\':reflect ' + aKey + '\'); return false;">',
                            aKey,
                            '</a>',
                            '</li>');
                    });
            inputResults.push('</ul>');
        }
    };

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

    arg0 = shell.getArgument(aRequest, 'ARG0');
    if (TP.isString(arg0)) {
        arg0 = arg0.unquoted();
    }

    filter = shell.getArgument(aRequest, 'tsh:filter');
    if (TP.isString(filter)) {
        filter = filter.unquoted();
    }

    interf = shell.getArgument(aRequest, 'tsh:interface');
    if (TP.isString(interf)) {
        interf = interf.unquoted();
    }

    types = shell.getArgument(aRequest, 'tsh:types', false);
    methods = shell.getArgument(aRequest, 'tsh:methods', false);
    owners = shell.getArgument(aRequest, 'tsh:owners', false);
    attributes = shell.getArgument(aRequest, 'tsh:attributes', false);

    pwd = shell.getArgument(aRequest, 'tsh:pwd', false);

    docsonly = shell.getArgument(aRequest, 'tsh:docsonly', false);

    //  We collect data based on potentially multiple flags so the best way to
    //  start is with an empty array we can add to.
    results = TP.ac();

    //  No specification for an object means we need a flag of some kind saying
    //  what we should list (types vs. methods).
    /* eslint-disable no-extra-parens */
    if (TP.notValid(arg0) || (TP.isString(arg0) && TP.isEmpty(arg0))) {
    /* eslint-enable no-extra-parens */

        //  By default we'll dump the type list.
        if (!types && !methods && !attributes) {
            types = true;
        }

        if (types) {
            results.addAll(
                TP.sys.getTypes().getValues().collect(function(type) {
                    return TP.name(type);
                }));
        } else if (methods) {
            results.addAll(
                TP.sys.getMetadata('methods').getKeys().collect(
                function(key) {
                    TP.regex.UNDERSCORES.lastIndex = 0;
                    return key.replace(TP.regex.UNDERSCORES, '.').replace(
                        '.Primitive.', '.');
                }));
        } else if (attributes) {
            results.addAll(
                TP.sys.getMetadata('attributes').getKeys().collect(
                function(key) {
                    TP.regex.UNDERSCORES.lastIndex = 0;
                    return key.replace(TP.regex.UNDERSCORES, '.').replace(
                        '.Primitive.', '.');
                }));
        }

        results.sort();
    } else if (docsonly) {
        nativeref = arg0;

        locStr = this.$computeDevDocsURI(null, nativeref);

        if (TP.notEmpty(locStr)) {
            aRequest.atPut('cmdAsIs', true);
            results.push(
                '<a href="' + locStr + '" target="_blank">',
                locStr,
                '</a>');
        } else {
            results.push(
                'No source file. Native code?');
        }
    } else {

        //  First attempt to resolve the target as a specific object name.
        obj = shell.resolveObjectReference(arg0, aRequest);

        //  Second attempt :) We try to support shortened input with respect to
        //  method names in particular. If we find it via that name in the owner
        //  list we can use that list to filter back through the method keys.
        //  NOTE we don't go here for 'null' values since those actually DID
        //  resolve, probably to an attribute slot or other defined slot value.
        if (TP.notDefined(obj)) {

            meta = TP.sys.getMetadata('methods');

            //  Query for owners, but just names. We don't want to ass_ume
            //  types.
            results = TP.sys.getMethodOwners(arg0, true);
            if (TP.notEmpty(results)) {
                //  Primitives are things like TP_Primitive_str while methods
                //  are typically A.Type.Name_Inst_foo.
                regex = RegExp.construct('(\\.|_)' + arg0 + '(_|$)');
                if (TP.isValid(regex)) {
                    keys = meta.getKeys().filter(
                        function(key) {
                            return TP.notEmpty(regex.match(key));
                        });

                    if (TP.notEmpty(keys) && keys.getSize() > 1) {
                        results = keys.collect(
                                        function(key) {
                                            TP.regex.UNDERSCORES.lastIndex = 0;
                                            return key.replace(
                                                    TP.regex.UNDERSCORES, '.');
                                        });
                    } else {
                        obj = meta.at(keys.first());
                    }
                }
            } else {
                obj = meta.at(arg0);
                if (TP.notValid(obj) && TP.canInvoke(arg0, 'replace')) {
                    obj = meta.at(arg0.replace(/\./g, '_'));
                }
            }
        }

        if (TP.isValid(obj)) {
            //  If we resolve the object reference our goal is to provide
            //  reflection data appropriate to the nature of that object.

            if (TP.isNamespace(obj)) {

                results.push('# Namespace');

                name = TP.name(obj);
                keys = TP.interface(obj, interf);

                keys = keys.map(
                        function(key) {
                            return name + '.' + key;
                        });
                keys.sort();

                renderResults(keys, results, aRequest);

            } else if (TP.isType(obj)) {

                results.push('# Type: ' + TP.name(obj));
                //  NOTE no separator here to avoid issues with headless vs.
                //  browser for things like >> etc.
                names = TP.stnames(obj);
                results.push('# Supertypes: ' + names.join(' '), '');

                interf = TP.ifEmpty(interf, TP.SLOT_FILTERS.introduced_methods);

                //  Iterate across the type, the type.Type, and the type.Inst
                //  objects to get a complete picture of the type.
                TP.ac(obj, obj.getPrototype(), obj.getInstPrototype()).forEach(
                function(thing, index) {
                    var id;

                    //  Some rare cases have trouble, at least on headless,
                    //  producing a viable name so build them up as needed.
                    switch (index) {
                        case 0:
                            id = TP.name(obj);
                            break;
                        case 1:
                            id = TP.name(obj) + '.Type';
                            break;
                        case 2:
                            id = TP.name(obj) + '.Inst';
                            break;
                        default:
                            id = TP.id(thing);
                            break;
                    }
                    results.push('# ' + id);

                    keys = TP.interface(thing, interf);
                    keys = keys.map(
                            function(key) {
                                return id + '.' + key;
                            });
                    keys.sort();

                    renderResults(keys, results, aRequest);

                    if (index < 2) {
                        results.push('');
                    }
                });

            } else if (TP.isPrototype(obj)) {

                results.push('# Prototype');

                name = arg0;

                keys = TP.interface(obj, interf);
                keys = keys.map(
                        function(key) {
                            return name + '.' + key;
                        });
                keys.sort();

                renderResults(keys, results, aRequest);

            } else if (TP.isFunction(obj)) {

                if (owners) {
                    //  Query for owners, but just names.
                    results = TP.sys.getMethodOwners(arg0, true);
                    if (TP.notEmpty(results)) {
                        regex = RegExp.construct('(\\.|_)' + arg0 + '(_|$)');
                        if (TP.isValid(regex)) {
                            meta = TP.sys.getMetadata('methods');
                            keys = meta.getKeys().filter(
                                            function(key) {
                                                return TP.notEmpty(
                                                        regex.match(key));
                                            });

                            if (TP.notEmpty(keys) && keys.getSize() > 1) {
                                results = keys.collect(
                                        function(key) {
                                            TP.regex.UNDERSCORES.lastIndex = 0;
                                            return key.replace(
                                                    TP.regex.UNDERSCORES, '.');
                                        });
                            } else {
                                obj = meta.at(keys.first());
                            }
                        }
                    }
                    results.sort();

                    renderResults(keys, results, aRequest);

                } else {

                    results = TP.ac();

                    //  If we're running in a Headless/CLI environment, then
                    //  try to use reflection the best we can to find some
                    //  printable information about the function/method
                    if (TP.sys.cfg('boot.context') === 'headless') {
                        getTIBETMethodInfoOrNull(obj, results);
                    } else {
                        //  We're running in a browser, so we try to use
                        //  reflection the best we can to find some printable
                        //  information about the function/method and if that
                        //  fails, we assume that it's a native function/method
                        //  and we will try to generate a link to the
                        //  documentation on devdocs.io.

                        //  Note how we go after load path here, since source
                        //  paths will never be minified and that's what we
                        //  check below.
                        file = TP.objectGetLoadPath(obj);

                        if (TP.notEmpty(file)) {
                            getTIBETMethodInfoOrNull(obj, results);
                        } else {

                            inputStr = shell.getArgument(
                                                aRequest, 'ARG0',
                                                null, false, true);

                            locStr = this.$computeDevDocsURI(obj, inputStr);

                            if (TP.notEmpty(locStr)) {
                                aRequest.atPut('cmdAsIs', true);
                                results.push(
                                    '<a href="' + locStr + '" target="_blank">',
                                    locStr,
                                    '</a>');
                            } else {
                                results.push(
                                    'No source file. Native code?');
                            }
                        }
                    }
                }

            } else if (!TP.isMutable(obj)) {

                //  Simple values should just output as values.
                try {
                    str = JSON.stringify(obj);
                } catch (e) {
                    str = TP.str(obj);
                }
                results.push(str);

            } else {
                //  Mutable object, but not a Type, Function, etc.
                name = arg0;
                keys = TP.interface(obj, interf);

                keys = keys.map(
                        function(key) {
                            return name + '.' + key;
                        });
                keys.sort();

                renderResults(keys, results, aRequest);
            }
        } else if (TP.isDefined(obj)) {
            results.push(arg0 + ' => null.');
        }

        if (results.getSize() === 0 && TP.notDefined(obj)) {

            inputStr = shell.getArgument(aRequest, 'ARG0', null, false, true);

            locStr = this.$computeDevDocsURI(arg0, inputStr);

            if (TP.notEmpty(locStr)) {
                aRequest.atPut('cmdAsIs', true);
                results.push(
                    '<a href="' + locStr + '" target="_blank">',
                    locStr,
                    '</a>');
            } else {
                results.push(
                    arg0 + ' not found.');
            }
        }
    }

    if (results.getSize() > 0) {

        results.unshift('');

        //  If we have a filter try to apply it now.
        if (TP.notEmpty(filter)) {

            filter = filter.unquoted();
            regex = RegExp.construct(filter);

            results = results.filter(
                        function(result) {

                            //  preserve blank lines from prior constructions
                            if (TP.isEmpty(result)) {
                                return true;
                            }

                            if (TP.isValid(regex)) {
                                return regex.test(result);
                            } else {
                                return result.indexOf(filter) !== TP.NOT_FOUND;
                            }
                        });
        }

        path = TP.objectGetSourcePath(obj);
        if (TP.notEmpty(path)) {
            results.push('');

            if (TP.notEmpty(pwd)) {
                results.push(TP.uriRelativeToPath(path, pwd));
            } else {
                results.push(path);
            }
        }

        //  Headles/CLI support requires output line-by-line.
        if (TP.sys.cfg('boot.context') === 'headless') {
            results.forEach(
                    function(result) {
                        aRequest.stdout(result);
                    });
            aRequest.complete('');

            return;
        }

        aRequest.complete(results.join('\n'));
    } else {
        if (TP.sys.cfg('boot.context') === 'headless') {
            return aRequest.complete('');
        }
        aRequest.complete(TP.TSH_NO_VALUE);
    }

    return aRequest;
});

//  ------------------------------------------------------------------------

TP.tsh.reflect.Type.defineMethod('$computeDevDocsURI',
function(anObj, anInputStr) {

    var httpStr,

        obj,

        pathParts,

        owner,
        track,
        slotName,
        slot,

        nativeSlotExists,
        trackNotSupplied,

        realOwner;

    //  If we're running in a Headless/CLI environment, then we always return
    //  null here since we can't go get Web-based docs.
    if (TP.sys.cfg('boot.context') === 'headless') {
        return null;
    }

    httpStr = 'http://devdocs.io/';

    if (TP.isString(anObj)) {
        obj = anObj;
    } else {
        obj = anInputStr;
    }

    if (TP.isString(obj) ||
        obj.contains('.Inst.') ||
        obj.contains('.Type.')) {

        pathParts = anInputStr.split('.');

        //  If the user typed the special syntax of 'CSS.<css_property_name>',
        //  then compute a URI based on that.
        switch (pathParts.at(0)) {
            case 'CSS':
                httpStr += 'css/' + pathParts.at(1);
                return httpStr;
            default:
                break;
        }

        pathParts = obj.split('.');

        //  If we can't find the first path part on the global object, then we
        //  can't even proceed, so we just return null.
        owner = TP.global[pathParts.at(0)];
        if (TP.notValid(owner)) {
            return null;
        }

        //  If we only had one path part, then it needed to be resolved directly
        //  as a slot on the global object. It either did or didn't, but in any
        //  case don't need to do any further computation.
        if (pathParts.getSize() === 1) {
            nativeSlotExists = true;
        } else {
            trackNotSupplied = false;

            //  If they didn't supply a track, then we assume TP.INST_TRACK
            //  first (but we'll also try the TP.TYPE_TRACK second below).
            if (pathParts.getSize() === 2) {
                track = TP.INST_TRACK;
                trackNotSupplied = true;
                slotName = pathParts.at(1);
            } else {
                track = pathParts.at(1);
                slotName = pathParts.at(2);
            }

            try {
                //  Try the 'instance track' which, for natives, is basically
                //  getting their instance prototype and using that.
                if (track === TP.INST_TRACK || track === 'prototype') {
                    //  Force the track to TP.INST_TRACK in case it was
                    //  'prototype'
                    track = TP.INST_TRACK;
                    slot = owner.getInstPrototype()[slotName];

                    //  Couldn't find it on the instance prototype and the track
                    //  wasn't supplied? Try the (constructor) object itself
                    //  (which is the 'type track' for natives).
                    if (TP.notValid(slot) && trackNotSupplied) {
                        slot = owner[slotName];
                        track = TP.TYPE_TRACK;
                    }
                } else {

                    //  Otherwise, just use the constructor object itself (which
                    //  is the 'type track' for natives).
                    slot = owner[slotName];
                    track = TP.TYPE_TRACK;
                }

                //  Make sure it's a native Function.
                nativeSlotExists = TP.isNativeFunction(slot);
            } catch (e) {
                nativeSlotExists = TP.isValid(
                                    Object.getOwnPropertyDescriptor(
                                        owner.getInstPrototype(), slotName));
            }
        }
    } else {
        slot = obj;
        owner = obj[TP.OWNER];
        if (slot !== owner) {
            slotName = TP.name(obj);
        }
        nativeSlotExists = TP.isNativeFunction(slot);
    }

    if (nativeSlotExists && TP.isNativeType(owner)) {

        //  There is still one issue left to resolve - the owner might *not*
        //  actually be the object that 'owns' the slot. For instance, if the
        //  slotName is 'appendChild' and the owner is 'Element' (prototype),
        //  then the owner should actually be 'Node' (since devdocs.io wants to
        //  see 'Node.appendChild'). To do this, we iterate up the chain,
        //  looking for the slot that actually owns the slot named slotName

        realOwner = owner;
        while (TP.isValid(realOwner)) {
            if (track === TP.INST_TRACK) {
                if (realOwner.prototype.hasOwnProperty(slotName)) {
                    break;
                }
            } else if (track === TP.TYPE_TRACK) {
                if (realOwner.hasOwnProperty(slotName)) {
                    break;
                }
            }

            realOwner = Object.getPrototypeOf(realOwner);
        }

        //  Traversed all of the way to the top and still didn't find the real
        //  owner? Then just default to the original owner.
        if (TP.notValid(realOwner)) {
            realOwner = owner;
        }

        if (Node.prototype.isPrototypeOf(realOwner.prototype) ||
            realOwner.prototype === Node.prototype) {
            httpStr += 'dom/' + TP.name(realOwner);
            if (TP.isValid(slotName)) {
                httpStr += '/' + slotName;
            }
        } else {
            httpStr += 'javascript/global_objects/' + TP.name(realOwner);
            if (TP.isValid(slotName)) {
                httpStr += '/' + slotName;
            }
        }

        httpStr = httpStr.toLowerCase();

        return httpStr;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.shell.TSH.addHelpTopic('reflect',
    TP.tsh.reflect.Type.getMethod('tshExecute'),
    'Output targeted reflection data/metadata.',
    ':reflect [target] [--interface <interface>]' +
    ' [-filter <filter>] [--types] [--methods] [--owners] [--slots]',
    'Coming Soon');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
