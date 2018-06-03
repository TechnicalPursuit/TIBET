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
 * @type {TP.tsh.type}
 * @summary A subtype of TP.tag.ActionTag that knows how to create new
 *     types in the TIBET system.
 */

//  ------------------------------------------------------------------------

TP.tag.ActionTag.defineSubtype('tsh:type');

TP.tsh.type.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.type.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Runs the receiver, effectively invoking its action.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {TP.sig.Request} The request.
     */

    var shell,
        shouldAssist,

        typeName;

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
                        'title', 'Type Assistant',
                        'assistantParams', TP.hc('originalRequest', aRequest)));

        return aRequest.complete(TP.TSH_NO_VALUE);
    }

    //  Make sure that the type isn't already defined
    typeName = shell.getArgument(aRequest, 'tsh:name');
    if (TP.isType(TP.sys.getTypeByName(typeName))) {
        aRequest.stderr('Type already exists: ' + typeName);
    } else {

        //  Fire a 'RemoteConsoleCommand' with a 'type ...' command, supplying
        //  the original request.
        TP.signal(null,
                    'RemoteConsoleCommand',
                    TP.hc('originalRequest', aRequest,
                            TP.ONSUCCESS,
                                function(aResponse) {

                                    //  Subscribe to 'script imported' - those
                                    //  will be the scripts for the new type(s)
                                    //  that got created by executing our
                                    //  command remotely. Note that we do this
                                    //  each time we are run, since we will
                                    //  remove this observation below in our
                                    //  handler. We're not interested in all
                                    //  'script imported' signals.
                                    this.observe(TP.sys, 'ScriptImported');
                                }.bind(this),
                            TP.ONFAIL,
                                function(aResponse) {
                                    //  TODO: Raise an exception;
                                }
                    ));
    }

    aRequest.complete(TP.TSH_NO_VALUE);

    return aRequest;
});

//  ------------------------------------------------------------------------

TP.tsh.type.Type.defineMethod('getContentForAssistant',
function() {

    /**
     * @method getContentForAssistant
     * @summary Returns the Element representing the root node of the content
     *     for the receiver's 'assistant'.
     * @returns {Element} The root node of the receiver's assistant content.
     */

    var assistantTPElem;

    assistantTPElem = TP.tsh.type_assistant.getResourceElement(
                        'template',
                        TP.ietf.mime.XHTML);

    return TP.unwrap(assistantTPElem);
});

//  ------------------------------------------------------------------------

TP.tsh.type.Type.defineHandler('ScriptImported',
function(aSignal) {

    /**
     * @method handleScriptImported
     * @summary Handles notifications of when a script node has been imported
     *     into the system. Typically we set up an observation for these when we
     *     create a new type and are waiting for the system to signal that that
     *     new type has been imported and created on-the-fly. At that point, we
     *     let the rest of the system know that a type has been added.
     * @param {TP.sig.ScriptImported} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.tsh.type} The receiver.
     */

    //  Unsubscribe us from this signal each time we run the handler. We're only
    //  interested in this signal when we're defining new types.
    this.ignore(TP.sys, 'ScriptImported');

    //  Tell the system that we defined new types.
    this.signal('TypeAdded', aSignal.getPayload());

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
