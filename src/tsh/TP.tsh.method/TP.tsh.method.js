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
 * @type {TP.tsh.method}
 * @summary A subtype of TP.core.ActionTag that knows how to create new
 *     types in the TIBET system.
 */

//  ------------------------------------------------------------------------

TP.core.ActionTag.defineSubtype('tsh:method');

TP.tsh.method.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.method.Type.defineMethod('tshExecute',
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
        shouldAssist,

        methodOwner,
        methodOwnerType,

        methodName,

        wholeName,

        methodTrack,

        methodKind,

        defMethod,
        desc,
        target,

        newMethod,

        methodSrc,

        patchText,

        sourceLoc,
        sourceURI,

        existingMethodResource,

        putParams,
        saveRequest;

    shell = aRequest.at('cmdShell');

    shouldAssist = TP.bc(shell.getArgument(
                                    aRequest, 'tsh:assist', null, false));

    if (shouldAssist) {

        //  Fire a 'AssistObject' signal, supplying the target object to focus
        //  on.
        TP.signal(
                null,
                'AssistObject',
                TP.hc('targetObject', this,
                        'title', 'Method Assistant',
                        'assistantParams', TP.hc('originalRequest', aRequest)));

        return aRequest.complete(TP.TSH_NO_VALUE);
    }

    methodOwner = shell.getArgument(aRequest, 'tsh:owner', null, false);
    if (TP.isEmpty(methodOwner)) {
        //  TODO: Raise an exception
        return;
    } else {

        methodOwnerType = TP.sys.getTypeByName(methodOwner);
        if (!TP.isType(methodOwnerType)) {
            //  TODO: Raise an exception
            return;
        }
    }

    methodName = shell.getArgument(aRequest, 'tsh:name', null, false);
    if (TP.isEmpty(methodName)) {
        //  TODO: Raise an exception
        return;
    }

    //  It can be either a regular method or a handler

    methodKind = shell.getArgument(aRequest, 'tsh:kind', null, false);
    if (TP.isEmpty(methodKind)) {
        //  TODO: Raise an exception
        return;
    }

    if (methodKind === 'handler') {
        defMethod = 'defineHandler';
        desc = {
            signal: methodName
        };
        wholeName = TP.composeHandlerName(desc);
    } else {
        defMethod = 'defineMethod';
        wholeName = methodName;
    }

    //  It can be a type, instance or type local method

    methodTrack = shell.getArgument(aRequest, 'tsh:track', null, false);
    if (TP.isEmpty(methodTrack)) {
        //  TODO: Raise an exception
        return;
    }

    if (methodTrack === 'type') {
        target = methodOwnerType.Type;
    } else if (methodTrack === 'instance') {
        target = methodOwnerType.Inst;
    } else if (methodTrack === 'typelocal') {
        target = methodOwnerType;
    }

    if (TP.notValid(target) || !TP.isMethod(target[defMethod])) {
        //  TODO Raise an exception
        return;
    }

    //  Make sure that the method isn't already defined
    if (TP.owns(target, wholeName)) {
        aRequest.stderr('Method already exists: ' + wholeName);
        aRequest.complete(TP.TSH_NO_VALUE);

        return;
    }

    //  Define the method (by invoking the computed method definition name
    //  against the target) dynamically in the system.

    //  NOTE NOTE NOTE: The following method bodies are formatted this way
    //  because they, along with their embedded whitespace, will be used as the
    //  templates for new, empty method bodies at the global scope in the
    //  receiving type. Therefore, indenting lint rules have been switched off
    //  and they have been formatted this way on purpose.

    /* eslint-disable indent */

    //  If it's a handler, make sure to include the 'aSignal' parameter.
    if (methodKind === 'handler') {
        newMethod = target[defMethod](
                        methodName,
                        function(aSignal) {
    //  empty
});
    } else {
        newMethod = target[defMethod](
                        methodName,
                        function() {
    //  empty
});
    }

    /* eslint-enable indent */

    newMethod[TP.LOAD_PATH] = methodOwnerType[TP.LOAD_PATH];
    newMethod[TP.SOURCE_PATH] = methodOwnerType[TP.SOURCE_PATH];
    newMethod[TP.LOAD_PACKAGE] = methodOwnerType[TP.LOAD_PACKAGE];
    newMethod[TP.LOAD_CONFIG] = methodOwnerType[TP.LOAD_CONFIG];

    //  Tag this method as 'not yet having persisted'
    newMethod[TP.IS_PERSISTED] = false;

    methodSrc = '\n' + TP.src(newMethod);

    //  The patch text will be the first item in the Array returned by
    //  getMethodPatch.
    patchText = newMethod.getMethodPatch(methodSrc, false).first();

    //  If the path is a URI and the patch contains '@@', then there were diffs
    //  and the URI should be dirtied.
    if (patchText.contains('@@')) {

        //  Grab the source URI and it's existing method resource.
        sourceLoc = TP.objectGetSourcePath(newMethod);
        sourceURI = TP.uc(sourceLoc);

        existingMethodResource = sourceURI.getResource();
        existingMethodResource.then(
            function(aResult) {
                var finalContent;

                //  Apply the patch to the source URI's current content and set
                //  the result as the URI's new content.
                finalContent = TP.extern.JsDiff.applyPatch(aResult, patchText);
                sourceURI.setResource(finalContent);

                //  If the '--push' flag was supplied, then save the URI
                //  contents to the server immediately.
                if (shell.getArgument(aRequest, 'tsh:push', null, false)) {

                    putParams = TP.hc('method', TP.HTTP_PUT);
                    saveRequest = sourceURI.constructRequest(putParams);

                    saveRequest.defineHandler('RequestSucceeded',
                        function(aResponse) {
                            delete newMethod[TP.IS_PERSISTED];
                            this.signal('MethodAdded');
                        }.bind(this));

                    saveRequest.defineHandler('RequestFailed',
                        function(aResponse) {
                            //  empty
                        });

                    saveRequest.defineHandler('RequestCompleted',
                        function(aResponse) {
                            //  empty
                        });

                    //  Do the deed.
                    sourceURI.save(saveRequest);
                } else {
                    this.signal('MethodAdded');
                }
            }.bind(this));
    }

    aRequest.complete(TP.TSH_NO_VALUE);

    return;
});

//  ------------------------------------------------------------------------

TP.tsh.method.Type.defineMethod('getContentForAssistant',
function() {

    /**
     * @method getContentForAssistant
     * @summary Returns the Element representing the root node of the content
     *     for the receiver's 'assistant'.
     * @returns {Element} The root node of the receiver's assistant content.
     */

    var assistantTPElem;

    assistantTPElem = TP.tsh.method_assistant.getResourceElement(
                        'template',
                        TP.ietf.mime.XHTML);

    return TP.unwrap(assistantTPElem);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
