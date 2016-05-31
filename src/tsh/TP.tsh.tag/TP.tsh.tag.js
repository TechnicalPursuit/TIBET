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
 * @type {TP.tsh.tag}
 * @summary A subtype of TP.core.ActionElementNode that knows how to
 *     conditionally process its child actions based on a binding expression.
 */

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.defineSubtype('tsh:tag');

TP.tsh.tag.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.tag.Type.defineMethod('tshExecute',
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
        shouldAssist;

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
                        'title', 'Tag Assistant',
                        'assistantParams', TP.hc('originalRequest', aRequest)));

        return aRequest.complete(TP.TSH_NO_VALUE);
    }

    //  Fire a 'ConsoleCommand' with a ':cli tag ...' command, supplying the
    //  name and the template.
    TP.signal(null,
                'ConsoleCommand',
                TP.hc('cmdText',
                        ':cli tag' +
                        ' --name=\'' +
                            shell.getArgument(aRequest, 'tsh:name') +
                            '\'' +
                        ' --template=\'' +
                            shell.getArgument(aRequest, 'tsh:template') +
                            '\''));

    aRequest.complete(TP.TSH_NO_INPUT);

    return;
});

//  ------------------------------------------------------------------------

TP.tsh.tag.Type.defineMethod('getContentForAssistant',
function() {

    var assistantTPElem;

    assistantTPElem = TP.tsh.tag_assistant.getResourceElement(
                        'template',
                        TP.ietf.Mime.XHTML);

    return TP.unwrap(assistantTPElem);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
