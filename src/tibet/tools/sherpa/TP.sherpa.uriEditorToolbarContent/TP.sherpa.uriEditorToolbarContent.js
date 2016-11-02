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
 * @type {TP.sherpa.uriEditorToolbarContent}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('uriEditorToolbarContent');

TP.sherpa.uriEditorToolbarContent.Inst.defineAttribute('$editor');
TP.sherpa.uriEditorToolbarContent.Inst.defineAttribute('$editorURI');

TP.sherpa.uriEditorToolbarContent.Inst.defineAttribute(
    'applyButton',
    {value: TP.cpc('> button[action="apply"]', TP.hc('shouldCollapse', true))});

TP.sherpa.uriEditorToolbarContent.Inst.defineAttribute(
    'detachMark',
    {value: TP.cpc('> .detach_mark', TP.hc('shouldCollapse', true))});

TP.sherpa.uriEditorToolbarContent.Inst.defineAttribute(
    'pushButton',
    {value: TP.cpc('> button[action="push"]', TP.hc('shouldCollapse', true))});

TP.sherpa.uriEditorToolbarContent.Inst.defineAttribute(
    'revertButton',
    {value: TP.cpc('> button[action="revert"]', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.uriEditorToolbarContent.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        editorTPElem,
        uri;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    //  NB: We need to cache references to our editor and it's URI - they might
    //  get detached before we do.

    editorTPElem = TP.byId('inspectorEditor', TP.doc(elem));
    tpElem.$set('$editor', editorTPElem, false);

    uri = editorTPElem.get('sourceURI');
    tpElem.$set('$editorURI', uri);

    // tpElem.observe(editorTPElem, TP.ac('DirtyChange', 'SourceURIChange'));
    tpElem.observe(editorTPElem, 'DirtyChange');
    tpElem.observe(editorTPElem, 'SourceURIChange');

    tpElem.observe(uri, 'DirtyChange');

    tpElem.refreshControls();

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.uriEditorToolbarContent.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
     * @summary Tears down runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem;

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    tpElem.ignore(tpElem.$get('$editor'), 'DirtyChange');
    tpElem.ignore(tpElem.$get('$editor'), 'SourceURIChange');

    tpElem.ignore(tpElem.$get('$editorURI'), 'DirtyChange');

    //  this makes sure we maintain parent processing - but we need to do it
    //  last because it nulls out our wrapper reference.
    this.callNextMethod();

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.uriEditorToolbarContent.Inst.defineHandler('DirtyChange',
function(aSignal) {

    var isDirty;

    isDirty = aSignal.at(TP.NEWVAL);

    if (isDirty) {
        this.get('pushButton').removeAttribute('disabled');
    } else {
        this.get('pushButton').setAttribute('disabled', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.uriEditorToolbarContent.Inst.defineHandler(
{signal: 'DirtyChange', origin: 'inspectorEditor'},
function(aSignal) {

    var isDirty;

    isDirty = aSignal.at(TP.NEWVAL);

    if (isDirty) {
        this.get('applyButton').removeAttribute('disabled');
        this.get('revertButton').removeAttribute('disabled');
    } else {
        this.get('applyButton').setAttribute('disabled', true);
        this.get('revertButton').setAttribute('disabled', true);
    }

    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.uriEditorToolbarContent.Inst.defineHandler('SourceURIChange',
function(aSignal) {

    var uri;

    uri = TP.uc(aSignal.at(TP.OLDVAL));

    if (TP.isURI(uri)) {
        this.ignore(uri, 'Change');
    }

    uri = TP.uc(aSignal.at(TP.NEWVAL));

    if (TP.isURI(uri)) {

        //  Update our reference to the latest URI object.
        this.$set('$editorURI', uri);

        this.observe(uri, 'Change');

        this.refreshControls();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.uriEditorToolbarContent.Inst.defineMethod('refreshControls',
function(aSignal) {

    var editorTPElem,
        isDirty;

    editorTPElem = TP.byId('inspectorEditor', this.getNativeDocument());
    isDirty = editorTPElem.isDirty();

    if (isDirty) {
        this.get('applyButton').removeAttribute('disabled');
        this.get('revertButton').removeAttribute('disabled');
    } else {
        this.get('applyButton').setAttribute('disabled', true);
        this.get('revertButton').setAttribute('disabled', true);
    }

    isDirty = editorTPElem.get('sourceURI').isDirty();

    if (isDirty) {
        this.get('pushButton').removeAttribute('disabled');
    } else {
        this.get('pushButton').setAttribute('disabled', true);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
