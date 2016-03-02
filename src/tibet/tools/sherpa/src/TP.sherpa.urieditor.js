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
 * @type {TP.sherpa.urieditor}
 */

//  ------------------------------------------------------------------------

TP.sherpa.Element.defineSubtype('urieditor');

TP.sherpa.urieditor.Inst.defineAttribute('didSetup');

TP.sherpa.urieditor.Inst.defineAttribute('remoteSourceContent');
TP.sherpa.urieditor.Inst.defineAttribute('localSourceContent');

TP.sherpa.urieditor.Inst.defineAttribute('sourceObject');

TP.sherpa.urieditor.Inst.defineAttribute(
        'head',
        {value: TP.cpc('> .head', TP.hc('shouldCollapse', true))});

TP.sherpa.urieditor.Inst.defineAttribute(
        'body',
        {value: TP.cpc('> .body', TP.hc('shouldCollapse', true))});

TP.sherpa.urieditor.Inst.defineAttribute(
        'foot',
        {value: TP.cpc('> .foot', TP.hc('shouldCollapse', true))});

TP.sherpa.urieditor.Inst.defineAttribute(
        'editor',
        {value: TP.cpc('> .body > xctrls|codeeditor', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('acceptResource',
function() {

    var newSourceText,
        sourceObj,
        resourceObj,
        contentObj;

    newSourceText = this.get('editor').getDisplayValue();

    sourceObj = this.get('sourceObject');

    resourceObj = sourceObj.getResource();

    contentObj = resourceObj.get('result');
    if (TP.isKindOf(contentObj, TP.core.Content)) {
        contentObj.setData(newSourceText);
    } else {
        sourceObj.setResource(newSourceText);
        sourceObj.$changed();
    }

    this.set('localSourceContent', newSourceText);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('formatJSON',
function(anObject) {

    var str,
        level,
        tabSpaces;

    if (TP.isValid(TP.extern.CodeMirror)) {

        str = '';
        level = 0;
        tabSpaces = 4;

        TP.extern.CodeMirror.runMode(
            anObject.asString(),
            {
                name: 'application/ld+json'
            },
            function(text, style) {

                //  Collapse a brace followed by a comma with a brace coming
                //  next to a single line
                if (text === '{' && str.slice(-2) === '},\n') {
                    str = str.slice(0, -1) + ' ';
                } else if (str.slice(-1) === '\n') {
                    //  Otherwise, if we're starting a new line, 'tab in' the
                    //  proper number of spaces.
                    str += ' '.times(level * tabSpaces);
                }

                if (style) {
                    str += text;
                } else {
                    if (text === '{' || text === '[') {
                        level++;
                        str += text + '\n';
                    }
                    if (text === '}' || text === ']') {
                        level--;
                        str += '\n' +
                                ' '.times(level * tabSpaces) + text;
                    }
                    if (text === ':') {
                        str += ' ' + text + ' ';
                    }
                    if (text === ',') {
                        str += text + '\n';
                    }
                }
            });
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('formatXML',
function(anObject) {

    var str;

    if (TP.isValid(TP.extern.CodeMirror)) {

        TP.extern.CodeMirror.runMode(
            anObject.asString(),
            {
                name: 'application/xml'
            },
            function(text, style) {

                if (style) {
                    str += '<span class="cm-' + style + '">' +
                             text.asEscapedXML() +
                             '</span>';
                } else {
                    str += text.asEscapedXML();
                }
            });
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineHandler('ResourceAccept',
function(aSignal) {

    this.acceptResource();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineHandler('ResourcePush',
function(aSignal) {

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('render',
function() {

    var editor,
        editorObj,

        sourceObj,

        str;

    if (TP.notTrue(this.$get('didSetup'))) {
        this.setup();
    }

    editor = this.get('editor');

    if (TP.notValid(sourceObj = this.get('localSourceContent'))) {
        editor.setDisplayValue('');

        return this;
    }

    editorObj = this.get('editor').$get('$editorObj');

    if (TP.isJSONString(sourceObj)) {

        editorObj.setOption('mode', 'application/json');
        str = this.formatJSON(sourceObj);

    } else if (TP.isXMLString(sourceObj)) {

        editorObj.setOption('mode', 'application/xml');
        str = sourceObj;
    } else {
        editorObj.setOption('mode', 'text/plain');
    }

    editor.setDisplayValue(str);

    /* eslint-disable no-extra-parens */
    (function() {
        editor.refreshEditor();
    }).fork(200);
    /* eslint-enable no-extra-parens */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     */

    var editorObj;

    editorObj = this.get('editor').$get('$editorObj');

    editorObj.setOption('theme', 'elegant');
    editorObj.setOption('tabMode', 'indent');
    editorObj.setOption('lineNumbers', true);
    editorObj.setOption('lineWrapping', true);

    //  By forking this, we give the console a chance to focus the input cell
    //  (which it really wants to do after executing a command) and then we can
    //  shift the focus back to us.
    (function() {
        this.get('editor').refreshEditor();
        this.get('editor').focus();
    }).bind(this).fork(500);

    this.$set('didSetup', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('setSourceObject',
function(anObj) {

    var fetchOptions,
        content;

    this.$set('sourceObject', anObj);

    fetchOptions = TP.hc('async', false, 'resultType', TP.TEXT, 'refresh', true);
    content = anObj.getResource(fetchOptions).get('result');

    this.set('remoteSourceContent', content);
    this.set('localSourceContent', content);

    this.render();

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
