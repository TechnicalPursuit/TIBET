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

TP.sherpa.Element.defineSubtype('methodeditor');

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
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        editorObj;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    editorObj = TP.wrap(elem).get('editor').$get('$editorObj');

    editorObj.setOption('theme', 'elegant');
    editorObj.setOption('mode', 'javascript');
    editorObj.setOption('tabMode', 'indent');
    editorObj.setOption('lineNumbers', true);
    editorObj.setOption('lineWrapping', true);

    return;
});

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

TP.sherpa.methodeditor.Inst.defineHandler('MethodAccept',
function(aSignal) {

    this.acceptMethod();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineHandler('MethodPush',
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

TP.sherpa.methodeditor.Inst.defineMethod('render',
function() {

    var editor,

        sourceObj,

        str;

    editor = this.get('editor');

    if (TP.notValid(sourceObj = this.get('sourceObject'))) {
        editor.setDisplayValue('');

        return this;
    }

    str = TP.src(sourceObj);

    editor.setDisplayValue(str);

    /* eslint-disable no-extra-parens */
    (function() {
        editor.refreshEditor();
    }).fork(200);
    /* eslint-enable no-extra-parens */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('setSourceObject',
function(anObj) {

    this.$set('sourceObject', anObj);
    this.$set('serverSourceObject', anObj);

    this.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('setValue',
function(aValue, shouldSignal) {

    /**
     * @method setValue
     * @summary Sets the value of the receiver's node. For this type, this
     *     method sets the underlying data and renders the receiver.
     * @param {Object} aValue The value to set the 'value' of the node to.
     * @param {Boolean} shouldSignal Should changes be notified. For this type,
     *     this flag is ignored.
     * @returns {TP.core.D3Tag} The receiver.
     */

    this.setSourceObject(aValue);

    //  By forking this, we give the console a chance to focus the input cell
    //  (which it really wants to do after executing a command) and then we can
    //  shift the focus back to us.
    (function() {
        this.get('editor').refreshEditor();
        this.get('editor').focus();
    }).bind(this).fork(500);

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
