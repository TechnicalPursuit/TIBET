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
 * @type {TP.tsh.tag_assistant}
 */

//  ------------------------------------------------------------------------

TP.core.CustomTag.defineSubtype('tsh.tag_assistant');

//  Note how this property is TYPE_LOCAL, by design.
TP.tsh.tag_assistant.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.tsh.tag_assistant.Inst.defineAttribute('tileTPElem');
TP.tsh.tag_assistant.Inst.defineAttribute('originalRequest');

TP.tsh.tag_assistant.Inst.defineAttribute(
        'head',
        {value: TP.cpc('> .head', TP.hc('shouldCollapse', true))});

TP.tsh.tag_assistant.Inst.defineAttribute(
        'body',
        {value: TP.cpc('> .body', TP.hc('shouldCollapse', true))});

TP.tsh.tag_assistant.Inst.defineAttribute(
        'generatedCmdLine',
        {value: TP.cpc('> .body > #generatedCmdLine', TP.hc('shouldCollapse', true))});

TP.tsh.tag_assistant.Inst.defineAttribute(
        'foot',
        {value: TP.cpc('> .foot', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tsh.tag_assistant.Inst.defineMethod('awaken',
function() {

    /**
     * @method awaken
     * @summary This method invokes the 'awaken' functionality of the tag
     *     processing system, to provide 'post-render' awakening of various
     *     features such as events and CSS styles.
     * @returns {TP.tsh.tag_assistant} The receiver.
     */

    this.callNextMethod();

    (function() {
        var modelURI;

        modelURI = TP.uc('urn:tibet:tag_cmd_source');
        modelURI.$changed();
    }).fork(50);

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.tag_assistant.Inst.defineHandler('CancelAction',
function(anObject) {

    /**
     * @method handleCancelAction
     * @summary
     * @returns {TP.tsh.tag_assistant} The receiver.
     */

    this.get('tileTPElem').setAttribute('hidden', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.tag_assistant.Inst.defineHandler('ExecuteCommand',
function(anObject) {

    /**
     * @method handleExecuteCommand
     * @summary
     * @returns {TP.tsh.tag_assistant} The receiver.
     */

    var result,
        data,
        tagInfo,
        str;

    result = TP.uc('urn:tibet:tag_cmd_source').getResource().get('result');

    if (TP.notValid(result)) {
        return this;
    }

    if (TP.notValid(data = result.get('data'))) {
        return this;
    }

    tagInfo = TP.hc(data).at('info');

    str = this.generateCommand(tagInfo);

    this.get('tileTPElem').setAttribute('hidden', true);

    //  Fire a 'ConsoleCommand' with a ':tag' command, supplying the name and
    //  the template.
    TP.signal(null, 'ConsoleCommand', TP.hc('cmdText', str));

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.tag_assistant.Inst.defineMethod('generateCommand',
function(info) {

    /**
     * @method generateCommand
     * @summary
     * @returns {TP.tsh.tag_assistant} The receiver.
     */

    var str,

        val;

    str = ':tag --name=\'' +
            info.at('topLevelNS') + '.' + info.at('tagNSAndName') + '\'';

    if (TP.notEmpty(val = info.at('package'))) {
        str += ' --package=\'' + val + '\'';
    }

    if (TP.notEmpty(val = info.at('config'))) {
        str += ' --config=\'' + val + '\'';
    }

    if (TP.notEmpty(val = info.at('dir'))) {
        str += ' --dir=\'' + val + '\'';
    }

    if (TP.isTrue(val = TP.bc(info.at('compiled')))) {
        str += ' --compiled';
    }

    if (TP.notEmpty(val = info.at('template'))) {
        str += ' --template=\'' + val + '\'';
    }

    if (TP.notEmpty(val = info.at('style'))) {
        str += ' --style=\'' + val + '\'';
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.tsh.tag_assistant.Inst.defineHandler('ValueChange',
function() {

    /**
     * @method handleValueChange
     * @summary
     * @returns {TP.tsh.tag_assistant} The receiver.
     */

    var result,
        data,
        tagInfo,
        str;

    result = TP.uc('urn:tibet:tag_cmd_source').getResource().get('result');

    if (TP.notValid(result)) {
        return this;
    }

    if (TP.notValid(data = result.get('data'))) {
        return this;
    }

    tagInfo = TP.hc(data).at('info');

    str = this.generateCommand(tagInfo);
    this.get('generatedCmdLine').setTextContent(str);

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.tag_assistant.Inst.defineMethod('setAssistantParams',
function(paramsObj) {

    this.setOriginalRequest(paramsObj.at('originalRequest'));
});

//  ------------------------------------------------------------------------

TP.tsh.tag_assistant.Inst.defineMethod('setOriginalRequest',
function(anObj) {

    /**
     * @method setOriginalRequest
     * @summary
     * @returns {TP.tsh.tag_assistant} The receiver.
     */

    var shell,
        args,

        tagInfo,
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

    tagInfo = TP.hc();
    topLevelInfo.atPut('info', tagInfo);

    name = args.at('tsh:name');
    if (TP.notEmpty(name)) {
        nameParts = name.split(/[:.]/g);

        if (nameParts.getSize() === 3) {
            tagInfo.atPut('topLevelNS', nameParts.at(0));
            tagInfo.atPut('tagNSAndName',
                            nameParts.at(1) + '.' + nameParts.at(2));
        } else if (nameParts.getSize() === 2) {
            tagInfo.atPut('topLevelNS', 'APP');
            tagInfo.atPut('tagNSAndName',
                            nameParts.at(0) + '.' + nameParts.at(1));
        } else if (nameParts.getSize() === 1) {
            tagInfo.atPut('topLevelNS', 'APP');
            tagInfo.atPut('tagNSAndName',
                            TP.sys.cfg('project.name') + '.' + nameParts.at(0));
        }
    } else {
        tagInfo.atPut('topLevelNS', 'APP');
        tagInfo.atPut('tagNSAndName', '');
    }

    tagInfo.atPut('package',
                    TP.ifInvalid(args.at('tsh:package'), ''));
    tagInfo.atPut('config',
                    TP.ifInvalid(args.at('tsh:config'), ''));
    tagInfo.atPut('dir',
                    TP.ifInvalid(args.at('tsh:dir'), ''));
    tagInfo.atPut('compiled',
                    TP.ifInvalid(TP.bc(args.at('tsh:compiled')), false));
    tagInfo.atPut('template',
                    TP.ifInvalid(args.at('tsh:template'), ''));
    tagInfo.atPut('style',
                    TP.ifInvalid(args.at('tsh:style'), ''));

    str = this.generateCommand(tagInfo);
    this.get('generatedCmdLine').setTextContent(str);

    modelURI = TP.uc('urn:tibet:tag_cmd_source');

    modelObj = TP.core.JSONContent.construct(TP.js2json(topLevelInfo));

    modelURI.setResource(modelObj, TP.hc('observeResource', true));

    this.observe(modelURI, 'ValueChange');

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.tag_assistant.Inst.defineMethod('setSourceObject',
function(anObj) {

    /**
     * @method setSourceObject
     * @summary
     * @returns {TP.tsh.tag_assistant} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
