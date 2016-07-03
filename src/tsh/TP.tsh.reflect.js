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

    interf = shell.getArgument(aRequest, 'tsh:interface');
    if (TP.isString(interf)) {
        interf = interf.unquoted();
    }

    types = shell.getArgument(aRequest, 'tsh:types', false);
    methods = shell.getArgument(aRequest, 'tsh:methods', false);
    owners = shell.getArgument(aRequest, 'tsh:owners', false);
    attributes = shell.getArgument(aRequest, 'tsh:attributes', false);

    pwd = shell.getArgument(aRequest, 'tsh:pwd', false);

    //  We collect data based on potentially multiple flags so the best way to
    //  start is with an empty array we can add to.
    results = TP.ac();

    //  No specification for an object means we need a flag of some kind saying
    //  what we should list (types vs. methods).
    if (TP.isEmpty(arg0)) {

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
                if (TP.notValid(obj)) {
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

                keys = keys.map(function(key) {
                    return name + '.' + key;
                });
                keys.sort();
                results.addAll(keys);

            } else if (TP.isType(obj)) {

                names = TP.stnames(obj);
                names.unshift(TP.name(obj));
                results.push('# Type: ' + names.join(' << '), '');

                //  Iterate across the type, the type.Type, and the type.Inst
                //  objects to get a complete picture of the type.
                [obj, obj.getPrototype(), obj.getInstPrototype()].forEach(
                function(thing, index) {
                    var id;

                    //  Some rare cases have trouble, at least on PhantomJS,
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
                    keys = keys.map(function(key) {
                        return id + '.' + key;
                    });
                    keys.sort();
                    results.addAll(keys);

                    if (index < 2) {
                        results.push('');
                    }
                });

            } else if (TP.isPrototype(obj)) {

                results.push('# Prototype');

                name = arg0;

                keys = TP.interface(obj, interf);
                keys = keys.map(function(key) {
                    return name + '.' + key;
                });
                keys.sort();
                results.addAll(keys);

            } else if (TP.isFunction(obj)) {

                if (owners) {
                    // Query for owners, but just names.
                    results = TP.sys.getMethodOwners(arg0, true);
                    if (TP.notEmpty(results)) {
                        regex = RegExp.construct('(\\.|_)' + arg0 + '(_|$)');
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
                    results.sort();

                } else {

                    results = [];
                    if (TP.canInvoke(obj, 'getMethodName')) {
                        results.push(obj.getMethodName(), '');
                    }
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
                        results.push('');
                        results.push(text.replace(/\n\s+\*/g, '\n *'));
                    }
                }

            } else if (!TP.isMutable(obj)) {

                //  Simple values should just output as values.
                try {
                    str = JSON.stringify(obj);
                }  catch (e) {
                    str = TP.str(obj);
                }
                results.push(str);

            } else {
                //  Mutable object, but not a Type, Function, etc.
                name = arg0;
                keys = TP.interface(obj, interf);

                keys = keys.map(function(key) {
                    return name + '.' + key;
                });
                keys.sort();
                results.addAll(keys);
            }
        } else if (TP.isDefined(obj)) {
            results.push(arg0 + ' => null.');
        }

        if (results.getSize() === 0 && TP.notDefined(obj)) {
            results.push(arg0 + ' not found.');
        }
    }

    if (results.getSize() > 0) {

        results.unshift('');

        //  If we have a filter try to apply it now.
        if (TP.notEmpty(filter)) {

            filter = filter.unquoted();
            regex = RegExp.construct(filter);

            results = results.filter(function(result) {

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

        //  PhantomJS/CLI support requires output line-by-line.
        if (TP.sys.cfg('boot.context') === 'phantomjs') {
            results.forEach(function(result) {
                aRequest.stdout(result);
            });
            aRequest.complete('');
            return;
        }

        aRequest.complete(results.join('\n'));
    } else {
        if (TP.sys.cfg('boot.context') === 'phantomjs') {
            return aRequest.complete('');
        }
        aRequest.complete(TP.TSH_NO_INPUT);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.TSH.addHelpTopic(
    TP.tsh.reflect.Type.getMethod('tshExecute'),
    'Output targeted reflection data/metadata.',
    ':reflect [target] [--interface <interface>]' +
    ' [-filter <filter> [--types] [--methods] [--owners] [--attributes]',
    '');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
