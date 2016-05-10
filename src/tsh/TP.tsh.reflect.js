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
 * @summary A subtype of TP.core.ActionElementNode that knows how to
 *     conditionally process its child actions based on a binding expression.
 */

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.defineSubtype('tsh:reflect');

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
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue. Common values are TP.CONTINUE, TP.DESCEND, and
     *     TP.BREAK.
     */

    var shell,

        usage,
        arg0,
        meta,
        obj,
        regex,
        keys,
        types,
        methods,
        owners,
        slots,
        filter,
        interface,
        text,
        file,
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

    arg0 = shell.getArgument(aRequest, 'ARG0');
    if (TP.isString(arg0)) {
        arg0 = arg0.unquoted();
    }

    filter = shell.getArgument(aRequest, 'tsh:filter');
    if (TP.isString(filter)) {
        filter = filter.unquoted();
    }

    interface = shell.getArgument(aRequest, 'tsh:interface');
    if (TP.isString(interface)) {
        interface = interface.unquoted();
    }

    types = shell.getArgument(aRequest, 'tsh:types', false);
    methods = shell.getArgument(aRequest, 'tsh:methods', false);
    owners = shell.getArgument(aRequest, 'tsh:owners', false);
    slots = shell.getArgument(aRequest, 'tsh:slots', false);

    //  We collect data based on potentially multiple flags so the best way to
    //  start is with an empty array we can add to.
    results = TP.ac();

    //  No specification for an object means we need a flag of some kind saying
    //  what we should list (types vs. methods).
    if (TP.isEmpty(arg0)) {

        //  Must have something to list or we just output usage.
        if (!types && !methods && !slots) {
            aRequest.stdout(usage);
            return aRequest.complete();
        }

        if (types) {
            results.addAll(
                TP.sys.getTypes().getValues().collect(function(type) {
                    return TP.name(type);
                }));
        }

        if (methods) {
            results.addAll(
                TP.sys.getMetadata('methods').getKeys().collect(
                function(key) {
                    TP.regex.UNDERSCORES.lastIndex = 0;
                    return key.replace(TP.regex.UNDERSCORES, '.');
                }));
        }

        if (slots) {
            results.addAll(
                TP.sys.getMetadata('owners').getKeys().collect(
                function(key) {
                    TP.regex.UNDERSCORES.lastIndex = 0;
                    return key.replace(TP.regex.UNDERSCORES, '.');
                }));
        }

        results.sort();

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
                regex = RegExp.construct('\\.' + arg0 + '$');
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
                if (TP.notValid(obj)) {
                    obj = meta.at(arg0.replace(/\./g, '_'));
                }
            }
        }

        if (TP.isValid(obj)) {
            //  If we resolve the object reference our goal is to provide
            //  reflection data appropriate to the nature of that object.

            if (TP.isNamespace(obj)) {

                //  Namespaces don't support getInterface so we ignore any
                //  --interface value and focus on --slots, --methods, and
                //  --types as the things we can list for a namespace.

                if (slots) {
                    results.addAll(TP.keys(obj));
                } else {
                    if (methods) {
                        results.addAll(TP.keys(obj).filter(
                                    function(key) {
                                        if (TP.owns(obj, key)) {
                                            if (TP.isFunction(obj[key])) {
                                                return true;
                                            }
                                        }

                                        return false;
                                    }));
                    } else if (types) {
                        results.addAll(TP.keys(obj).filter(
                                    function(key) {
                                        if (TP.owns(obj, key)) {
                                            if (TP.isType(obj[key])) {
                                                return true;
                                            }
                                        }

                                        return false;
                                    }));
                    }
                }
                results.sort();
                results.push(TP.objectGetSourcePath(obj) || '');

            } else if (TP.isType(obj)) {

                //  Types can support getInterface so we let any --interface
                //  value override any request for slots, methods, or types.

                if (TP.notEmpty(interface)) {
                    results.addAll(TP.interface(obj, interface));
                } else {
                    if (slots) {
                        results.addAll(TP.keys(obj));
                    } else {
                        if (methods) {
                            results.addAll(TP.keys(obj).filter(
                                        function(key) {
                                            if (TP.owns(obj, key)) {
                                                if (TP.isFunction(obj[key])) {
                                                    return true;
                                                }
                                            }

                                            return false;
                                        }));
                        } else {
                            results.addAll(TP.keys(obj));
                        }
                    }
                }
                results.sort();
                results.push(TP.objectGetSourcePath(obj) || '');

            } else if (TP.isFunction(obj)) {

                if (owners) {
                    // Query for owners, but just names.
                    results = TP.sys.getMethodOwners(arg0, true);
                    if (TP.notEmpty(results)) {
                        regex = RegExp.construct('\\.' + arg0 + '$');
                        if (TP.isValid(regex)) {
                            meta = TP.sys.getMetadata('methods');
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
                    }
                } else {

                    results.push(obj.getSignature());
                    text = obj.getCommentText();

                    if (TP.isEmpty(text)) {

                        //  Note how we go after load path here, since source
                        //  paths will never be minified and that's what we
                        //  check below.
                        file = TP.objectGetLoadPath(obj);

                        if (TP.notEmpty(file)) {
                            if (file.match(/\.min\./)) {
                                results.push(
                                    'Source minified.' +
                                    ' No comment text available.');
                            } else {
                                results.push(
                                    'Uncommented :(.' +
                                    ' No comment text available.');
                            }
                        } else {
                            results.push(
                                'No source file. Native code?');
                        }
                    } else {
                        results.push(text);
                    }

                    //  But here we go after the source path for reporting
                    //  purposes.
                    results.push(TP.objectGetSourcePath(obj) || '');
                }

            } else if (!TP.isMutable(obj)) {
                //  Simple values should just output as values.
                results.push(TP.str(obj));
                results.push(TP.objectGetSourcePath(obj) || '');
            } else {
                if (TP.notEmpty(interface)) {
                    results.addAll(TP.interface(obj, interface));
                } else {
                    if (slots) {
                        results.addAll(TP.keys(obj));
                    } else {
                        if (methods) {
                            results.addAll(TP.keys(obj).filter(
                                        function(key) {
                                            if (TP.owns(obj, key)) {
                                                if (TP.isFunction(obj[key])) {
                                                    return true;
                                                }
                                            }

                                            return false;
                                        }));
                        } else {
                            results.addAll(TP.keys(obj));
                        }
                    }
                }
                results.sort();
            }
        } else if (TP.isDefined(obj)) {
            results.push(arg0 + ' defined but has no default value.');
        }

        if (TP.isEmpty(results)) {
            results.push(arg0 + ' not found.');
        }
    }

    if (results.length > 0) {

        //  If we have a filter try to apply it now.
        if (TP.notEmpty(filter)) {

            filter = filter.unquoted();
            regex = RegExp.construct(filter);

            results = results.filter(
                                function(result) {
                                    if (TP.isValid(regex)) {
                                        return regex.test(result);
                                    } else {
                                        return result.indexOf(filter) !==
                                                                TP.NOT_FOUND;
                                    }
                                });
        }

        //  PhantomJS/CLI support requires output line-by-line.
        if (TP.sys.cfg('boot.context') === 'phantomjs') {
            results.forEach(
                    function(result) {
                        aRequest.stdout(result);
                    });

            aRequest.complete();

            return;
        }

        aRequest.complete(results);
    } else {
        aRequest.complete();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.TSH.addHelpTopic(
    TP.tsh.reflect.Type.getMethod('cmdRunContent'),
    'Output targeted reflection data/metadata.',
    ':reflect [target] [--interface <interface>]' +
    ' [-filter <filter> [--types] [--methods] [--owners] [--slots]',
    '');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
