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

TP.core.CustomTag.defineSubtype('tsh.method_assistant');

//  Note how this property is TYPE_LOCAL, by design.
TP.tsh.method_assistant.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.tsh.method_assistant.Inst.defineAttribute('originalRequest');

TP.tsh.method_assistant.Inst.defineAttribute('head',
    TP.cpc('> .head', TP.hc('shouldCollapse', true)));

TP.tsh.method_assistant.Inst.defineAttribute('body',
    TP.cpc('> .body', TP.hc('shouldCollapse', true)));

TP.tsh.method_assistant.Inst.defineAttribute('generatedCmdLine',
    TP.cpc('> .body > #generatedCmdLine', TP.hc('shouldCollapse', true)));

TP.tsh.method_assistant.Inst.defineAttribute('foot',
    TP.cpc('> .foot', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tsh.method_assistant.Inst.defineHandler('DialogCancel',
function(anObject) {

    /**
     * @method handleDialogCancel
     * @summary
     * @returns {TP.tsh.method_assistant} The receiver.
     */

    var modelURI;

    modelURI = TP.uc('urn:tibet:method_cmd_source');
    this.ignore(modelURI, 'ValueChange');

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.method_assistant.Inst.defineHandler('DialogOk',
function(anObject) {

    /**
     * @method handleDialogOk
     * @summary
     * @returns {TP.tsh.method_assistant} The receiver.
     */

    var modelURI,

        result,
        data,
        typeInfo,
        str;

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

    // TP.info('gonna execute: ' + str);

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.method_assistant.Inst.defineMethod('generateCommand',
function(info) {

    /**
     * @method generateCommand
     * @summary
     * @returns {TP.tsh.method_assistant} The receiver.
     */

    var str;

    str = ':method --name=\'' + info.at('methodName') + '\'' +
            ' --kind=\'' + info.at('methodKind') + '\'' +
            ' --owner=\'' + info.at('methodOwnerTypeName') + '\'' +
            ' --track=\'' + info.at('methodTrack') + '\'';

    return str;
});

//  ------------------------------------------------------------------------

TP.tsh.method_assistant.Inst.defineHandler('ValueChange',
function() {

    /**
     * @method handleValueChange
     * @summary
     * @returns {TP.tsh.method_assistant} The receiver.
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

TP.tsh.method_assistant.Inst.defineMethod('setAssistantParams',
function(paramsObj) {

    /**
     * @method setAssistantParams
     * @summary
     * @returns {TP.tsh.method_assistant} The receiver.
     */

    this.setOriginalRequest(paramsObj.at('originalRequest'));

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.method_assistant.Inst.defineMethod('setOriginalRequest',
function(anObj) {

    /**
     * @method setOriginalRequest
     * @summary
     * @returns {TP.tsh.method_assistant} The receiver.
     */

    var shell,
        args,

        typeInfo,
        topLevelInfo,

        modelURI,
        modelObj,

        str;

    this.$set('originalRequest', anObj);

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

    str = this.generateCommand(typeInfo);
    this.get('generatedCmdLine').setTextContent(str);

    modelURI = TP.uc('urn:tibet:method_cmd_source');

    modelObj = TP.core.JSONContent.construct(TP.js2json(topLevelInfo));

    this.observe(modelURI, 'ValueChange');
    modelURI.setResource(
        modelObj, TP.hc('observeResource', true, 'signalChange', true));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
