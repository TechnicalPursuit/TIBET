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
 * @type {TP.sherpa.methodeditor}
 */

//  ------------------------------------------------------------------------

TP.sherpa.Element.defineSubtype('sherpa:methodeditor');

TP.sherpa.methodeditor.Inst.defineAttribute('didSetup');

TP.sherpa.methodeditor.Inst.defineAttribute('serverSourceObject');
TP.sherpa.methodeditor.Inst.defineAttribute('sourceObject');

TP.sherpa.methodeditor.Inst.defineAttribute(
        'head',
        {value: TP.cpc('> .head', TP.hc('shouldCollapse', true))});

TP.sherpa.methodeditor.Inst.defineAttribute(
        'body',
        {value: TP.cpc('> .body', TP.hc('shouldCollapse', true))});

TP.sherpa.methodeditor.Inst.defineAttribute(
        'foot',
        {value: TP.cpc('> .foot', TP.hc('shouldCollapse', true))});

TP.sherpa.methodeditor.Inst.defineAttribute(
        'editor',
        {value: TP.cpc('> .body > xctrls|codeeditor', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('acceptMethod',
function() {

    var newSourceText,
        newMethodObj;

    newSourceText = this.get('editor').getDisplayValue();

    newMethodObj = this.get('sourceObject').replaceWithSourceText(
                                                        newSourceText);

    //  Note that we *must* use '$set()' here to avoid using our setter and
    //  resetting the server source object.
    this.$set('sourceObject', newMethodObj);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     */

    var editorObj;

    editorObj = this.get('editor').$get('$editorObj');

    editorObj.setOption('theme', 'zenburn');
    editorObj.setOption('mode', 'javascript');
    editorObj.setOption('tabMode', 'indent');
    editorObj.setOption('lineNumbers', true);
    editorObj.setOption('lineWrapping', true);

    this.$set('didSetup', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('handleTP_sig_MethodAccept',
function(aSignal) {

    this.acceptMethod();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('handleTP_sig_MethodPush',
function(aSignal) {

    var newSourceText,

        serverSourceObject,

        patchText,
        patchPath;

    this.acceptMethod();

    newSourceText = this.get('editor').getDisplayValue();

    serverSourceObject = this.get('serverSourceObject');

    patchText = serverSourceObject.getMethodPatch(newSourceText);

    if (TP.notEmpty(patchText)) {

        patchPath = TP.objectGetSourcePath(this.get('sourceObject'));

        TP.bySystemId('Sherpa').postPatch(patchText, patchPath);

        //  TODO: Only do this if the patch operation succeeded
        this.set('serverSourceObject', this.get('sourceObject'));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('refresh',
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

    str = TP.src(sourceObj);

    editor.setDisplayValue(str);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('setSourceObject',
function(anObj) {

    this.$set('sourceObject', anObj);
    this.$set('serverSourceObject', anObj);

    this.refresh();

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
