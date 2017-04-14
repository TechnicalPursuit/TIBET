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
 * @type {TP.tsh.type_assistant}
 */

//  ------------------------------------------------------------------------

TP.core.CustomTag.defineSubtype('tsh.type_assistant');

//  Note how this property is TYPE_LOCAL, by design.
TP.tsh.type_assistant.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.tsh.type_assistant.Inst.defineAttribute('originalRequest');

TP.tsh.type_assistant.Inst.defineAttribute('head',
    TP.cpc('> .head', TP.hc('shouldCollapse', true)));

TP.tsh.type_assistant.Inst.defineAttribute('body',
    TP.cpc('> .body', TP.hc('shouldCollapse', true)));

TP.tsh.type_assistant.Inst.defineAttribute('generatedCmdLine',
    TP.cpc('> .body > #generatedCmdLine', TP.hc('shouldCollapse', true)));

TP.tsh.type_assistant.Inst.defineAttribute('foot',
    TP.cpc('> .foot', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tsh.type_assistant.Inst.defineMethod('awaken',
function() {

    /**
     * @method awaken
     * @summary This method invokes the 'awaken' functionality of the tag
     *     processing system, to provide 'post-render' awakening of various
     *     features such as events and CSS styles.
     * @returns {TP.tsh.type_assistant} The receiver.
     */

    this.callNextMethod();

    setTimeout(function() {
        var modelURI;

        modelURI = TP.uc('urn:tibet:type_cmd_source');
        modelURI.$changed();
    }, 50);

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.type_assistant.Inst.defineHandler('DialogCancel',
function(anObject) {

    /**
     * @method handleDialogCancel
     * @summary
     * @returns {TP.tsh.type_assistant} The receiver.
     */

    var modelURI;

    modelURI = TP.uc('urn:tibet:type_cmd_source');
    this.ignore(modelURI, 'ValueChange');

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.type_assistant.Inst.defineHandler('DialogOk',
function(anObject) {

    /**
     * @method handleDialogOk
     * @summary
     * @returns {TP.tsh.type_assistant} The receiver.
     */

    var modelURI,

        result,
        data,
        typeInfo,
        str;

    modelURI = TP.uc('urn:tibet:type_cmd_source');
    this.ignore(modelURI, 'ValueChange');

    result = TP.uc('urn:tibet:type_cmd_source').getResource().get('result');

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

TP.tsh.type_assistant.Inst.defineMethod('generateCommand',
function(info) {

    /**
     * @method generateCommand
     * @summary
     * @returns {TP.tsh.type_assistant} The receiver.
     */

    var str,

        val;

    str = ':type --name=\'' +
            info.at('topLevelNS') + '.' + info.at('typeNSAndName') + '\'';

    if (TP.notEmpty(val = info.at('dna'))) {
        str += ' --dna=\'' + val + '\'';
    }

    if (TP.notEmpty(val = info.at('package'))) {
        str += ' --package=\'' + val + '\'';
    }

    if (TP.notEmpty(val = info.at('config'))) {
        str += ' --config=\'' + val + '\'';
    }

    if (TP.notEmpty(val = info.at('dir'))) {
        str += ' --dir=\'' + val + '\'';
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.tsh.type_assistant.Inst.defineHandler('ValueChange',
function() {

    /**
     * @method handleValueChange
     * @summary
     * @returns {TP.tsh.type_assistant} The receiver.
     */

    var result,
        data,
        typeInfo,
        str;

    result = TP.uc('urn:tibet:type_cmd_source').getResource().get('result');

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

TP.tsh.type_assistant.Inst.defineMethod('setAssistantParams',
function(paramsObj) {

    /**
     * @method setAssistantParams
     * @summary
     * @returns {TP.tsh.type_assistant} The receiver.
     */

    this.setOriginalRequest(paramsObj.at('originalRequest'));

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.type_assistant.Inst.defineMethod('setOriginalRequest',
function(anObj) {

    /**
     * @method setOriginalRequest
     * @summary
     * @returns {TP.tsh.type_assistant} The receiver.
     */

    var shell,
        args,

        typeInfo,
        topLevelInfo,

        name,
        nameParts,

        modelURI,
        modelObj,

        str;

    this.$set('originalRequest', anObj);

    shell = anObj.at('cmdShell');
    args = shell.getArguments(anObj);

    topLevelInfo = TP.hc();

    typeInfo = TP.hc();
    topLevelInfo.atPut('info', typeInfo);

    name = args.at('tsh:name');
    if (TP.notEmpty(name)) {
        nameParts = name.split(/[:.]/g);

        if (nameParts.getSize() === 3) {
            typeInfo.atPut('topLevelNS', nameParts.at(0));
            typeInfo.atPut('typeNSAndName',
                            nameParts.at(1) + '.' + nameParts.at(2));
        } else if (nameParts.getSize() === 2) {
            typeInfo.atPut('topLevelNS', 'APP');
            typeInfo.atPut('typeNSAndName',
                            nameParts.at(0) + '.' + nameParts.at(1));
        } else if (nameParts.getSize() === 1) {
            typeInfo.atPut('topLevelNS', 'APP');
            typeInfo.atPut('typeNSAndName',
                            TP.sys.cfg('project.name') + '.' + nameParts.at(0));
        }
    } else {
        typeInfo.atPut('topLevelNS', 'APP');
        typeInfo.atPut('typeNSAndName', '');
    }

    typeInfo.atPut('package',
                    TP.ifInvalid(args.at('tsh:package'), ''));
    typeInfo.atPut('config',
                    TP.ifInvalid(args.at('tsh:config'), ''));
    typeInfo.atPut('dir',
                    TP.ifInvalid(args.at('tsh:dir'), ''));
    typeInfo.atPut('dna',
                    TP.ifInvalid(args.at('tsh:dna'), ''));

    str = this.generateCommand(typeInfo);
    this.get('generatedCmdLine').setTextContent(str);

    modelURI = TP.uc('urn:tibet:type_cmd_source');

    modelObj = TP.core.JSONContent.construct(TP.js2json(topLevelInfo));

    modelURI.setResource(modelObj, TP.hc('observeResource', true));

    this.observe(modelURI, 'ValueChange');

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
