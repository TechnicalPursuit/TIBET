//  ========================================================================
/*
NAME:   tsh_Codebase.js
AUTH:   Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

*/
//  ------------------------------------------------------------------------

/**
 * @type {TP.tsh.Codebase}
 * @synopsis A subtype of TP.core.ActionElementNode that knows how to collect
 *     "cases" based on an object specification and knowledge of how to reflect
 *     across the codebase. This is a common supertype for testing, linting,
 *     documentation generation, etc.
 */

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.defineSubtype('tsh:Codebase');

TP.tsh.Codebase.addTraitsFrom(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.Codebase.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @name tshExecute
     * @synopsis Runs the receiver, effectively invoking its action.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue. Common values are TP.CONTINUE, TP.DESCEND, and
     *     TP.BREAK.
     */

    var node,
        shell,

        ref,
        full,
        obj,

        fileCases,
        moduleCases,
        subtypeCases,
        supertypeCases,

        nsTypes,

        deep,

        path,
        types,
        cases,

        args,
        subrequest;

    TP.debug('break.tsh_codebase');

    node = aRequest.at('cmdNode');
    shell = aRequest.at('cmdShell');

    //  NB: We supply 'null' or 'false' as the default values here
    ref = shell.getArgument(aRequest, 'tsh:ref', null, true);
    if (TP.isEmpty(ref)) {
        ref = shell.getArgument(aRequest, 'tsh:href', null, true);
        if (TP.isEmpty(ref)) {
            full = shell.getArgument(aRequest, 'tsh:full', false, true);
            if (TP.notTrue(full)) {
                aRequest.fail(TP.FAILURE, 'Empty object specification.');

                return;
            }
        }
    }

    if (TP.notTrue(full)) {
        //  this can resolve both memory and URI-based references
        obj = shell.resolveObjectReference(ref, aRequest);
        if (TP.notValid(obj)) {
            aRequest.fail(TP.FAILURE, 'Unable to resolve object: ' + ref);

            return;
        }

        fileCases = shell.getArgument(aRequest, 'tsh:file', false);
        moduleCases = shell.getArgument(aRequest, 'tsh:module', false);
        subtypeCases = shell.getArgument(aRequest, 'tsh:subtypes', false);
        supertypeCases = shell.getArgument(aRequest, 'tsh:supertypes', false);

        //  Try to output something that indicates what kind of overall
        //  worklist we've created.
        if (fileCases || moduleCases || subtypeCases || supertypeCases) {
            aRequest.stdout('Assembling ' + ref +
                            '[' +
                            (fileCases ? 'f' : '') +
                            (moduleCases ? 'm' : '') +
                            (subtypeCases ? 's' : '') +
                            (supertypeCases ? 'S' : '') +
                            '] worklist.');
        } else {
            aRequest.stdout('Assembling ' + ref + '-only worklist.');
        }

        //  if 'obj' is a 'namespace', then we need to get all types 'under'
        //  it and loop.
        if (TP.isNamespace(obj)) {
            nsTypes = obj.getTypeNames().collect(
                        function(aTypeName) {

                            return aTypeName.asType();
                        });

            cases = TP.ac();
            nsTypes.perform(
                    function(aType) {

                        if (moduleCases) {
                            path = TP.objectGetLoadModule(aType);
                            if (TP.notEmpty(path)) {
                                types = TP.sys.getModuleTypes(path);
                            }
                        } else if (fileCases) {
                            path = TP.objectGetLoadPath(aType);
                            if (TP.notEmpty(path)) {
                                types = TP.sys.getScriptTypes(path);
                            }
                        }

                        if (TP.notEmpty(types)) {
                            cases.addAll(types);
                        }

                        //  the type itself
                        cases.add(aType);

                        if (subtypeCases) {
                            deep = shell.getArgument(aRequest,
                                                        'tsh:deep',
                                                        false,
                                                        true);
                            cases.addAll(aType.getSubtypes(deep));
                        }

                        if (supertypeCases) {
                            cases.addAll(aType.getSupertypes());
                        }
                    });
        } else {
            //  module/file cases provide us with the first "expansion" of
            //  the root object in creating a set of cases to trigger.
            if (moduleCases) {
                path = TP.objectGetLoadModule(obj);
                if (TP.notEmpty(path)) {
                    types = TP.sys.getModuleTypes(path);
                }
            } else if (fileCases) {
                path = TP.objectGetLoadPath(obj);
                if (TP.notEmpty(path)) {
                    types = TP.sys.getScriptTypes(path);
                }
            }

            cases = types || TP.ac();

            //  the type itself
            cases.unshift(obj);

            if (subtypeCases) {
                deep = shell.getArgument(aRequest, 'tsh:deep', false, true);
                cases.addAll(obj.getSubtypes(deep));
            }

            if (supertypeCases) {
                cases.addAll(obj.getSupertypes());
            }
        }

        //  remove any duplicate cases (types/objects)
        cases.unique();
    } else {
        //  we don't set append here, so this message should clear the
        //  output
        aRequest.stdout('Assembling full coverage worklist.');

        cases = TP.sys.getTypes();
    }

    aRequest.atPut('cmdAppend', true);
    aRequest.stdout('Found ' + cases.length + ' worklist cases.');
    aRequest.stdout('');

    //  set up a work request we can use and configure it to use the same
    //  STDIO hooks for consistent tracing output on our progress.
    args = shell.getArguments(aRequest);
    subrequest = this.getRequestType().construct(
                                aRequest.getPayload().copy().addAll(args));
    subrequest.configureSTDIO(aRequest);

    //  hook job control from subrequest to our main request.
    aRequest.andJoinChild(subrequest);

    //  inject the object list the iteration should operate on.
    subrequest.atPut('targetObj', ref);
    subrequest.atPut('targetCases', cases);

    //  trigger the subrequest, which can have async behavior.
    subrequest.fire();

    return TP.CONTINUE;
});

//  ------------------------------------------------------------------------

TP.tsh.Codebase.Type.defineMethod('getRequestType',
function() {

    /**
     * @name getRequestType
     * @synopsis Returns the type of request which should be constructed to do
     *     the actual processing of the codebase.
     * @returns {TP.lang.RootObject.<TP.core.Request>} A TP.core.Request subtype
     *     type object.
     */

    return TP.sys.require(this.get('REQUEST_TYPE'));
});

//  ========================================================================
//  TP.sig.CodebaseResponse
//  ========================================================================

TP.sig.ShellResponse.defineSubtype('CodebaseResponse');

//  ========================================================================
//  TP.sig.CodebaseRequest
//  ========================================================================

TP.sig.ShellRequest.defineSubtype('CodebaseRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.CodebaseRequest.Type.defineAttribute('responseType',
                                        'TP.sig.CodebaseResponse');

//  ========================================================================
//  TP.core.CodebaseService
//  ========================================================================

TP.core.Service.defineSubtype('CodebaseService');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
