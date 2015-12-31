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
 * @type {TP.sherpa.elementeditor}
 */

//  ------------------------------------------------------------------------

TP.sherpa.Element.defineSubtype('sherpa:elementeditor');

TP.sherpa.elementeditor.Inst.defineAttribute('didSetup');

TP.sherpa.elementeditor.Inst.defineAttribute('serverSourceObject');
TP.sherpa.elementeditor.Inst.defineAttribute('sourceObject');

TP.sherpa.elementeditor.Inst.defineAttribute(
        'head',
        {value: TP.cpc('> .head', TP.hc('shouldCollapse', true))});

TP.sherpa.elementeditor.Inst.defineAttribute(
        'body',
        {value: TP.cpc('> .body', TP.hc('shouldCollapse', true))});

TP.sherpa.elementeditor.Inst.defineAttribute(
        'foot',
        {value: TP.cpc('> .foot', TP.hc('shouldCollapse', true))});

TP.sherpa.elementeditor.Inst.defineAttribute(
        'editor',
        {value: TP.cpc('> .body > xctrls|codeeditor', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.elementeditor.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     */

    var editorObj;

    editorObj = this.get('editor').$get('$editorObj');

    editorObj.setOption('theme', 'zenburn');
    editorObj.setOption('mode', 'xml');
    editorObj.setOption('tabMode', 'indent');
    editorObj.setOption('lineNumbers', true);
    editorObj.setOption('lineWrapping', true);

    editorObj.refresh();

    this.$set('didSetup', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.elementeditor.Inst.defineMethod('acceptMarkup',
function() {

    var newSourceText,
        newElem,
        sourceObject,
        newSourceTPElem;

    newSourceText = this.get('editor').getDisplayValue();

    if (!TP.isElement(newElem = TP.nodeFromString(newSourceText))) {
        //  TODO: Warn
        return this;
    }

    sourceObject = this.get('sourceObject');

    newSourceTPElem = sourceObject.replaceContent(newElem);

    this.$set('sourceObject', newSourceTPElem);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.elementeditor.Inst.defineHandler('MarkupAccept',
function(aSignal) {

    this.acceptMarkup();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.elementeditor.Inst.defineHandler('MarkupPush',
function(aSignal) {

    var newSourceText,

        sourceObject,
        sourceLocation;

    this.acceptMarkup();

    sourceObject = this.get('sourceObject');

    newSourceText = sourceObject.getDocument().asString();
    sourceLocation = sourceObject.getSourcePath();

    TP.bySystemId('Sherpa').saveFile(sourceLocation, newSourceText);

    /*
    newSourceText = this.get('editor').getDisplayValue();

    serverSourceObject = this.get('serverSourceObject');

    patchText = serverSourceObject.getMarkupPatch(newSourceText);

    if (TP.notEmpty(patchText)) {

        patchPath = TP.objectGetSourcePath(this.get('sourceObject'));

        TP.bySystemId('Sherpa').postPatch(patchText, patchPath);

        //  TODO: Only do this if the patch operation succeeded
        this.set('serverSourceObject', this.get('sourceObject'));
    }
    */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.elementeditor.Inst.defineMethod('render',
function() {

    var editor,

        sourceObj,

        str;

    if (TP.notTrue(this.$get('didSetup'))) {
        this.setup();
    }

    editor = this.get('editor');

    if (TP.notValid(sourceObj = this.get('sourceObject'))) {
        editor.setDisplayValue('');

        return this;
    }

    str = TP.str(sourceObj);

    editor.setDisplayValue(str);

    /* eslint-disable no-extra-parens */
    (function() {
        editor.refreshEditor();
    }).fork(200);
    /* eslint-enable no-extra-parens */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.elementeditor.Inst.defineMethod('setSourceObject',
function(anObj) {

    this.$set('sourceObject', anObj);
    this.$set('serverSourceObject', anObj);

    this.render();

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
