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
 * @summary A subtype of TP.core.ActionElementNode that knows how to create new
 *     types in the TIBET system.
 */

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.defineSubtype('tsh:method');

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

        methodTrack,

        methodKind,

        defMethod,
        target,

        newMethod,

        methodSrc,

        patchText,
        patchPath,
        successfulPatch;

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

    methodTrack = shell.getArgument(aRequest, 'tsh:track', null, false);
    if (TP.isEmpty(methodTrack)) {
        //  TODO: Raise an exception
        return;
    }

    methodKind = shell.getArgument(aRequest, 'tsh:kind', null, false);
    if (TP.isEmpty(methodTrack)) {
        //  TODO: Raise an exception
        return;
    }

    if (methodKind === 'handler') {
        defMethod = 'defineHandler';
    } else {
        defMethod = 'defineMethod';
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

    newMethod = target[defMethod](
                    methodName,
                    function() {
                        //  empty
                    });

    newMethod[TP.LOAD_PATH] = methodOwnerType[TP.LOAD_PATH];
    newMethod[TP.SOURCE_PATH] = methodOwnerType[TP.SOURCE_PATH];

    methodSrc = '\n' + TP.src(newMethod);

    patchText = newMethod.getMethodPatch(methodSrc, false);

    if (TP.notEmpty(patchText)) {

        //  Note that this returns a virtual URI, which is what the
        //  'postDiffPatch' call wants.
        patchPath = TP.objectGetSourcePath(newMethod);

        successfulPatch = TP.core.URL.postDiffPatch(
                                        patchText,
                                        patchPath);

        if (successfulPatch) {
            this.signal('MethodAdded');
        }
    }

    aRequest.complete(TP.TSH_NO_INPUT);

    return;
});

//  ------------------------------------------------------------------------

TP.tsh.method.Type.defineMethod('getContentForAssistant',
function() {

    var assistantTPElem;

    assistantTPElem = TP.tsh.method_assistant.getResourceElement(
                        'template',
                        TP.ietf.Mime.XHTML);

    return TP.unwrap(assistantTPElem);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
