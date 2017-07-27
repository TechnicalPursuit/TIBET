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
 * @type {TP.tsh.CommandAssistant}
 */

//  ------------------------------------------------------------------------

TP.core.CustomTag.defineSubtype('tsh.CommandAssistant');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.tsh.CommandAssistant.Inst.defineAttribute('originalRequest');

TP.tsh.CommandAssistant.Inst.defineAttribute('head',
    TP.cpc('> .head', TP.hc('shouldCollapse', true)));

TP.tsh.CommandAssistant.Inst.defineAttribute('body',
    TP.cpc('> .body', TP.hc('shouldCollapse', true)));

TP.tsh.CommandAssistant.Inst.defineAttribute('generatedCmdLine',
    TP.cpc('> .body > #generatedCmdLine', TP.hc('shouldCollapse', true)));

TP.tsh.CommandAssistant.Inst.defineAttribute('foot',
    TP.cpc('> .foot', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tsh.CommandAssistant.Inst.defineMethod('generateCommand',
function(info) {

    /**
     * @method generateCommand
     * @summary Generates the command text that will be sent to the shell if the
     *     user dismisses the assistant by clicking 'ok'. At this type level,
     *     this method returns the empty String.
     * @param {TP.core.Hash} info The hash containing the command parameters.
     * @returns {String} The generated command string.
     */

    return '';
});

//  ------------------------------------------------------------------------

TP.tsh.CommandAssistant.Inst.defineHandler('DialogCancel',
function(anObject) {

    /**
     * @method handleDialogCancel
     * @summary Handles when the user has 'canceled' the dialog (i.e. wants to
     *     proceed without taking any action).
     * @param {TP.sig.DialogCancel} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.tsh.CommandAssistant} The receiver.
     */

    var modelURI;

    //  We observed the model URI when we were set up - we need to ignore it now
    //  on our way out.
    modelURI = TP.uc('urn:tibet:method_cmd_source');
    this.ignore(modelURI, 'ValueChange');

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.CommandAssistant.Inst.defineHandler('DialogOk',
function(anObject) {

    /**
     * @method handleDialogOk
     * @summary Handles when the user has 'ok-ed' the dialog (i.e. wants to
     *     proceed by taking the default action).
     * @param {TP.sig.DialogOk} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.tsh.CommandAssistant} The receiver.
     */

    var modelURI,

        result,
        data,
        typeInfo,
        str;

    //  We observed the model URI when we were set up - we need to ignore it now
    //  on our way out.
    modelURI = TP.uc('urn:tibet:method_cmd_source');
    this.ignore(modelURI, 'ValueChange');

    result = TP.uc('urn:tibet:method_cmd_source').getResource().get('result');

    if (TP.notValid(result)) {
        return this;
    }

    if (TP.notValid(data = result.get('data'))) {
        return this;
    }

    typeInfo = TP.hc(data).at('info');

    str = this.generateCommand(typeInfo);

    //  Fire a 'ConsoleCommand' with a ':type' command, supplying the name and
    //  the template.
    TP.signal(null, 'ConsoleCommand', TP.hc('cmdText', str));

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.CommandAssistant.Inst.defineHandler('ValueChange',
function() {

    /**
     * @method handleValueChange
     * @summary Handles when the user changes the value of the underlying model.
     * @param {ValueChange} aSignal The signal that caused this handler to trip.
     * @returns {TP.tsh.CommandAssistant} The receiver.
     */

    var result,
        data,
        typeInfo,
        str;

    result = TP.uc('urn:tibet:method_cmd_source').getResource().get('result');

    if (TP.notValid(result)) {
        return this;
    }

    if (TP.notValid(data = result.get('data'))) {
        return this;
    }

    typeInfo = TP.hc(data).at('info');

    str = this.generateCommand(typeInfo);
    this.get('generatedCmdLine').setTextContent(str);

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.CommandAssistant.Inst.defineMethod('setAssistantParams',
function(paramsObj) {

    /**
     * @method setAssistantParams
     * @summary Sets the assistant state from parameters that were given in the
     *     original signaling request.
     * @param {TP.core.Hash} paramsObj The command parameters that were handed
     *     to the request. The original request will be in this hash under the
     *     'originalRequest' key.
     * @returns {TP.tsh.CommandAssistant} The receiver.
     */

    this.setOriginalRequest(paramsObj.at('originalRequest'));

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.CommandAssistant.Inst.defineMethod('setOriginalRequest',
function(anObj) {

    /**
     * @method setOriginalRequest
     * @summary Sets the original request received by the command that triggered
     *     the assistant.
     * @param {TP.sig.Request} anObj The original request that was supplied to
     *     the assistant via the command.
     * @returns {TP.tsh.CommandAssistant} The receiver.
     */

    this.$set('originalRequest', anObj);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
