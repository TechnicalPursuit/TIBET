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

TP.tsh.tag_assistant.Inst.defineHandler('DoInput',
function(anObject) {

    var result,
        data,
        tagInfo,
        str,

        consoleGUI;

    result = TP.uc('urn:tibet:tag_cmd_source').getResource().get('result');

    if (TP.notValid(result)) {
        return this;
    }

    if (TP.notValid(data = result.get('data'))) {
        return this;
    }

    tagInfo = TP.hc(data).at('info');

    str = this.generateCommand(tagInfo);

    consoleGUI = TP.bySystemId('SherpaConsoleService').get('$consoleGUI');
    consoleGUI.setInputContent(str);

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.tag_assistant.Inst.defineMethod('generateCommand',
function(info) {

    var str,

        val;

    str = ':tag ' +
            info.at('topLevelNS') + '.' + info.at('tagNSAndName');

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

TP.tsh.tag_assistant.Inst.defineMethod('setOriginalRequest',
function(anObj) {

    var shell,
        args,

        tagInfo,

        name,
        nameParts,

        modelURI,

        str;

    this.$set('originalRequest', anObj);

    shell = anObj.at('cmdShell');
    args = shell.getArguments(anObj);

    tagInfo = TP.hc();

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
    modelURI.getResource().get('result').set('$.info', tagInfo);

    this.observe(modelURI, 'ValueChange');

    return this;
});

//  ------------------------------------------------------------------------

TP.tsh.tag_assistant.Inst.defineMethod('setSourceObject',
function(anObj) {

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
