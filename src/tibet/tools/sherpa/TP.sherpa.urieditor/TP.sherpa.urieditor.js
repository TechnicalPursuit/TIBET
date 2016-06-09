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

TP.sherpa.urieditor.Inst.defineAttribute('$changingURIs');

TP.sherpa.urieditor.Inst.defineAttribute('$sourceURI');
TP.sherpa.urieditor.Inst.defineAttribute('$editingCSS');

TP.sherpa.urieditor.Inst.defineAttribute('remoteSourceContent');
TP.sherpa.urieditor.Inst.defineAttribute('localSourceContent');

TP.sherpa.urieditor.Inst.defineAttribute('changeHandler');

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
        'detachMark',
        {value: TP.cpc('> .foot > .detach_mark', TP.hc('shouldCollapse', true))});

TP.sherpa.urieditor.Inst.defineAttribute(
        'editor',
        {value: TP.cpc('> .body > xctrls|codeeditor', TP.hc('shouldCollapse', true))});

TP.sherpa.urieditor.Inst.defineAttribute(
        'applyButton',
        {value: TP.cpc('> .foot > button[action="apply"]', TP.hc('shouldCollapse', true))});

TP.sherpa.urieditor.Inst.defineAttribute(
        'pushButton',
        {value: TP.cpc('> .foot > button[action="push"]', TP.hc('shouldCollapse', true))});

TP.sherpa.urieditor.Inst.defineAttribute(
        'revertButton',
        {value: TP.cpc('> .foot > button[action="revert"]', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    TP.wrap(elem).configure();

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
     * @summary Tears down runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        sourceURI,

        editorObj;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    if (TP.isURI(sourceURI = tpElem.get('$sourceURI'))) {
        tpElem.ignore(sourceURI, 'TP.sig.ValueChange');
    }

    tpElem.$set('remoteSourceContent', null, false);
    tpElem.$set('localSourceContent', null, false);

    editorObj = tpElem.get('editor').$get('$editorObj');
    editorObj.off('change', tpElem.get('changeHandler'));

    tpElem.$set('editor', null, false);
    tpElem.$set('changeHandler', null, false);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('applyResource',
function() {

    var newSourceText,
        sourceObj,
        resourceObj,
        contentObj,

        doc,
        existingLinkElem;

    newSourceText = this.get('editor').getDisplayValue();

    sourceObj = this.get('$sourceURI');

    resourceObj = sourceObj.getResource();

    contentObj = resourceObj.get('result');

    this.set('$changingURIs', true);

    if (TP.isKindOf(contentObj, TP.core.Content)) {
        contentObj.setData(newSourceText);
    } else {
        sourceObj.setResource(newSourceText);

        if (!this.get('$editingCSS')) {
            sourceObj.$changed();
        }
    }

    if (this.get('$editingCSS')) {

        doc = TP.sys.getUICanvas().getNativeDocument();
        existingLinkElem = TP.byCSSPath(
                                'link[href^="' + sourceObj.getLocation() + '"]',
                                doc,
                                true,
                                false);
        existingLinkElem.sheet.disabled = true;

        TP.documentInlineCSSURIContent(
                doc,
                sourceObj,
                newSourceText,
                existingLinkElem.nextSibling);
    }

    this.set('$changingURIs', false);

    this.set('localSourceContent', newSourceText);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('configure',
function() {

    var editorObj;

    editorObj = this.get('editor').$get('$editorObj');

    editorObj.setOption('theme', 'elegant');
    editorObj.setOption('tabMode', 'indent');
    editorObj.setOption('lineNumbers', true);
    editorObj.setOption('lineWrapping', true);

    this.set('changeHandler', this.updateButtons.bind(this));

    editorObj.on('change', this.get('changeHandler'));

    this.set('$editingCSS', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('getSourceID',
function() {

    var obj;

    if (TP.isValid(obj = this.get('$sourceURI'))) {
        return obj.getLocation();
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineHandler('ResourceApply',
function(aSignal) {

    this.applyResource();

    this.updateButtons(this.get('editor').$get('$editorObj'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineHandler('ResourcePush',
function(aSignal) {

    this.pushResource();

    this.updateButtons(this.get('editor').$get('$editorObj'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineHandler('ResourceRevert',
function(aSignal) {

    this.revertResource();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineHandler('ValueChange',
function(aSignal) {

    var sourceURI,

        fetchOptions,

        content;

    if (this.get('$changingURIs')) {
        return this;
    }

    sourceURI = this.get('$sourceURI');

    fetchOptions = TP.hc('async', false,
                            'resultType', TP.TEXT,
                            'refresh', true);
    content = sourceURI.getResource(fetchOptions).get('result');

    this.set('remoteSourceContent', content);
    this.set('localSourceContent', content);

    this.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('pushResource',
function() {

    var sourceURI,

        patchableURI,

        patchSourceLocation,
        sourceLocation,

        patchText;

    sourceURI = this.get('$sourceURI');

    //  TODO: Fix this!
    patchableURI = true;

    sourceLocation = TP.uriInTIBETFormat(sourceURI.getLocation());
    if (patchableURI) {

        patchSourceLocation = sourceLocation.slice(
                                sourceLocation.lastIndexOf('/') + 1);

        patchText = TP.extern.JsDiff.createPatch(
                            patchSourceLocation,
                            this.get('remoteSourceContent'),
                            this.get('localSourceContent'));

        TP.bySystemId('Sherpa').postPatch(patchText, sourceLocation);

        this.set('remoteSourceContent', this.get('localSourceContent'));
    } else {

        //  An unpatchable URI

        // newSourceText = this.get('localSourceContent');
        // sourceLocation = sourceURI.getSourcePath();
        TP.warn('not a patchable URI: ' + sourceLocation);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('render',
function() {

    var editor,
        editorObj,

        sourceObj,
        sourceStr,

        mimeType;

    editor = this.get('editor');

    if (TP.notValid(sourceStr = this.get('localSourceContent'))) {
        editor.setDisplayValue('');

        return this;
    }

    editorObj = this.get('editor').$get('$editorObj');

    sourceObj = this.get('$sourceURI');

    //  Try to get a MIME type from the URI - if we can't, then we just treat
    //  the content as plain text.
    if (TP.isEmpty(mimeType = sourceObj.getMIMEType())) {
        mimeType = TP.PLAIN_TEXT_ENCODED;
    }

    //  CodeMirror won't understand XHTML as distinct from XML.
    if (mimeType === TP.XHTML_ENCODED) {
        mimeType = TP.XML_ENCODED;
    }

    if (mimeType === TP.CSS_TEXT_ENCODED) {
        this.set('$editingCSS', true);
    }

    //  Set the editor's 'mode' to the computed MIME type
    editorObj.setOption('mode', mimeType);

    editorObj.setValue(sourceStr);

    /* eslint-disable no-extra-parens */
    (function() {
        editor.refreshEditor();
    }).fork(200);
    /* eslint-enable no-extra-parens */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('revertResource',
function() {

    var editor,
        editorObj,

        sourceStr;

    editor = this.get('editor');

    if (TP.notValid(sourceStr = this.get('localSourceContent'))) {
        editor.setDisplayValue('');

        return this;
    }

    editorObj = this.get('editor').$get('$editorObj');

    editorObj.setValue(sourceStr);

    /* eslint-disable no-extra-parens */
    (function() {
        editor.refreshEditor();
    }).fork(200);
    /* eslint-enable no-extra-parens */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('setDetached',
function(isDetached, aNewURI) {

    var detachMark,

        oldURI,
        newURI,

        sourceObj;

    detachMark = TP.byCSSPath('.detach_mark', this.getNativeNode(), true, false);
    TP.elementHide(detachMark);

    //  Rewrite binding URI
    if (this.hasAttribute('bind:in')) {

        oldURI = TP.uc(this.getAttribute('bind:in'));

        newURI = TP.ifInvalid(
                    aNewURI, TP.uc('urn:tibet:' + this.getLocalID()));

        this.set('$changingURIs', true);
        oldURI.setResource(null);
        this.set('$changingURIs', false);

        this.setAttribute('bind:in', newURI.getLocation());

        sourceObj = this.get('$sourceURI');
        newURI.setResource(sourceObj,
                            TP.request('signalChange', false));
    }

    this.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('setSourceObject',
function(anObj) {

    var sourceURI,

        fetchOptions,
        content;

    if (TP.isURI(sourceURI = this.get('$sourceURI'))) {
        this.ignore(sourceURI, 'TP.sig.ValueChange');
    }

    sourceURI = anObj;
    this.observe(sourceURI, 'TP.sig.ValueChange');

    this.$set('$sourceURI', sourceURI);

    fetchOptions = TP.hc('async', false,
                            'resultType', TP.TEXT,
                            'refresh', true);
    content = sourceURI.getResource(fetchOptions).get('result');

    this.set('remoteSourceContent', content);
    this.set('localSourceContent', content);

    this.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('setValue',
function(aValue, shouldSignal) {

    /**
     * @method setValue
     * @summary Sets the value of the receiver's node. For this type, this
     *     method sets the underlying data and renders the receiver.
     * @param {Object} aValue The value to set the 'value' of the node to.
     * @param {Boolean} shouldSignal Should changes be notified. For this type,
     *     this flag is ignored.
     * @returns {TP.sherpa.urieditor} The receiver.
     */

    if (this.get('$changingURIs')) {
        return this;
    }

    //  NB: This will call render()
    this.setSourceObject(aValue);

    //  By forking this, we give the console a chance to focus the input cell
    //  (which it really wants to do after executing a command) and then we can
    //  shift the focus back to us.
    (function() {
        this.get('editor').refreshEditor();
        this.get('editor').focus();
    }).bind(this).fork(500);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('updateButtons',
function(editorObj) {

    var currentEditorStr,

        localSourceStr,
        remoteSourceStr;

    currentEditorStr = editorObj.getValue();

    if (TP.notValid(localSourceStr = this.get('localSourceContent'))) {
        return this;
    }

    if (currentEditorStr !== localSourceStr) {
        TP.elementRemoveAttribute(
                TP.unwrap(this.get('revertButton')),
                'disabled',
                true);
        TP.elementRemoveAttribute(
                TP.unwrap(this.get('applyButton')),
                'disabled',
                true);
    } else {
        TP.elementSetAttribute(
                TP.unwrap(this.get('revertButton')),
                'disabled',
                'disabled',
                true);
        TP.elementSetAttribute(
                TP.unwrap(this.get('applyButton')),
                'disabled',
                'disabled',
                true);
    }

    if (TP.notValid(remoteSourceStr = this.get('remoteSourceContent'))) {
        return this;
    }

    if (currentEditorStr !== remoteSourceStr) {
        TP.elementRemoveAttribute(
                TP.unwrap(this.get('pushButton')),
                'disabled',
                true);
    } else {
        TP.elementSetAttribute(
                TP.unwrap(this.get('pushButton')),
                'disabled',
                'disabled',
                true);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
