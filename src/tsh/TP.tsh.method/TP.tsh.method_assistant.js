//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 * @type {TP.tsh.method_assistant}
 */

//  ------------------------------------------------------------------------

TP.tsh.CommandAssistant.defineSubtype('tsh.method_assistant');

//  Note how this property is TYPE_LOCAL, by design.
TP.tsh.method_assistant.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tsh.method_assistant.Inst.defineMethod('generateCommand',
function(info) {

    /**
     * @method generateCommand
     * @summary Generates the command text that will be sent to the shell if the
     *     user dismisses the assistant by clicking 'ok'.
     * @param {TP.core.Hash} info The hash containing the command parameters.
     * @returns {String} The generated command string.
     */

    var track,
        name,

        str;

    if (info.at('methodTrack') === 'instance') {
        track = TP.INST_TRACK;
    } else if (info.at('methodTrack') === 'typelocal') {
        track = TP.TYPE_LOCAL_TRACK;
    } else {
        track = TP.TYPE_TRACK;
    }

    if (info.at('methodKind') === 'handler') {
        name = 'handle' + info.at('methodName') + 'FromANYWhenANY';
    } else {
        name = info.at('methodName');
    }

    str = ':method --name=\'' + info.at('methodName') + '\'' +
            ' --kind=\'' + info.at('methodKind') + '\'' +
            ' --owner=\'' + info.at('methodOwnerTypeName') + '\'' +
            ' --track=\'' + info.at('methodTrack') + '\'' +
            '; ' +
            ':inspect ' + info.at('methodOwnerTypeName') + '.' +
                            track + '.' +
                            name;

    return str;
});

//  ------------------------------------------------------------------------

TP.tsh.method_assistant.Inst.defineMethod('getAssistantModelURI',
function() {

    /**
     * @method getAssistantModelURI
     * @summary Returns the URI containing the model that the assistant is using
     *     to manage all of the selections in its panel.
     * @returns {TP.uri.URI} The URI containing the assistant model.
     */

    return TP.uc('urn:tibet:method_cmd_source');
});

//  ------------------------------------------------------------------------

TP.tsh.method_assistant.Inst.defineHandler('DialogCancel',
function(anObject) {

    /**
     * @method handleDialogCancel
     * @summary Handles when the user has 'canceled' the dialog (i.e. wants to
     *     proceed without taking any action).
     * @param {TP.sig.DialogCancel} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.tsh.method_assistant} The receiver.
     */

    this.callNextMethod();

    this.signal('MethodAdditionCancelled');

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.method_assistant.Inst.defineMethod('setOriginalRequest',
function(anObj) {

    /**
     * @method setOriginalRequest
     * @summary Sets the original request received by the command that triggered
     *     the assistant.
     * @param {TP.sig.Request} anObj The original request that was supplied to
     *     the assistant via the command.
     * @returns {TP.tsh.method_assistant} The receiver.
     */

    var shell,
        args,

        typeInfo,
        topLevelInfo,

        modelURI,
        modelObj;

    this.callNextMethod();

    //  Configure the GUI using the argument values that we can derive from the
    //  original request

    shell = anObj.at('cmdShell');
    args = shell.getArguments(anObj);

    topLevelInfo = TP.hc();

    typeInfo = TP.hc();
    topLevelInfo.atPut('info', typeInfo);

    typeInfo.atPut('methodName',
                    TP.ifInvalid(args.at('tsh:name'), 'newMethod'));
    typeInfo.atPut('methodKind',
                    TP.ifInvalid(args.at('tsh:kind'), 'method'));
    typeInfo.atPut('methodOwnerTypeName',
                    TP.ifInvalid(args.at('tsh:owner'), ''));
    typeInfo.atPut('methodTrack',
                    TP.ifInvalid(args.at('tsh:track'), 'instance'));

    //  Set up a model URI and observe it for change ourself. This will allow us
    //  to regenerate the tag representation as the model changes.
    modelURI = this.getAssistantModelURI();
    this.observe(modelURI, 'ValueChange');

    //  Construct a JSONContent object around the model object so that we can
    //  bind to it using the more powerful JSONPath constructs
    modelObj = TP.core.JSONContent.construct(TP.js2json(topLevelInfo));

    //  Set the resource of the model URI to the model object, telling the URI
    //  that it should observe changes to the model (which will allow us to get
    //  notifications from the URI which we're observing above) and to go ahead
    //  and signal change to kick things off.
    modelURI.setResource(
        modelObj, TP.hc('observeResource', true, 'signalChange', true));

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.defineSubtype('MethodAdditionCancelled');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
