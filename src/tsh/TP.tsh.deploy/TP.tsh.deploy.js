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
 * @type {TP.tsh.deploy}
 * @summary A subtype of TP.tag.ActionTag that knows how to deploy applications
 *     in the TIBET system.
 */

//  ------------------------------------------------------------------------

TP.tag.ActionTag.defineSubtype('tsh:deploy');

TP.tsh.deploy.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.deploy.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Runs the receiver, effectively invoking its action.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {TP.sig.Request|Number} The request or a TSH shell loop control
     *     constant which controls how the outer TSH processing loop should
     *     continue. Common values are TP.CONTINUE, TP.DESCEND, and TP.BREAK.
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
                        'title', 'Deploy Assistant',
                        'assistantParams', TP.hc('originalRequest', aRequest)));

        return aRequest.complete(TP.TSH_NO_VALUE);
    }

    //  Fire a 'RemoteConsoleCommand' with a 'deploy ...' command, supplying the
    //  original request.
    TP.signal(null, 'RemoteConsoleCommand',
        TP.hc('originalRequest', aRequest,
            'timeout', 60000,
            TP.ONSUCCESS, function(aResponse) {
                //  empty
            },
            TP.ONFAIL, function(aResponse) {
                //  empty
            }
        ));

    aRequest.complete('delegated to :cli');

    return aRequest;
});

//  ------------------------------------------------------------------------

TP.tsh.deploy.Type.defineMethod('getContentForAssistant',
function() {

    /**
     * @method getContentForAssistant
     * @summary Returns the Element representing the root node of the content
     *     for the receiver's 'assistant'.
     * @returns {Element} The root node of the receiver's assistant content.
     */

    var assistantTPElem;

    assistantTPElem = TP.tsh.deploy_assistant.getResourceElement(
                        'template',
                        TP.ietf.mime.XHTML);

    return TP.unwrap(assistantTPElem);
});

//  ------------------------------------------------------------------------

TP.shell.TSH.addHelpTopic('deploy',
    TP.tsh.deploy.Type.getMethod('tshExecute'),
    'Deploys a release of a TIBET application.',
    ':deploy',
    'See CLI documentation');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
