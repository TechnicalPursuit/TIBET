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
TP.sherpa.urieditor.Inst.defineAttribute('$changingSourceObject');

TP.sherpa.urieditor.Inst.defineAttribute('sourceURI');

TP.sherpa.urieditor.Inst.defineAttribute('dirty');

TP.sherpa.urieditor.Inst.defineAttribute('localSourceContent');

TP.sherpa.urieditor.Inst.defineAttribute('changeHandler');

TP.sherpa.urieditor.Inst.defineAttribute(
    'head', {
        value: TP.cpc('> .head', TP.hc('shouldCollapse', true))
    });

TP.sherpa.urieditor.Inst.defineAttribute(
    'body', {
        value: TP.cpc('> .body', TP.hc('shouldCollapse', true))
    });

TP.sherpa.urieditor.Inst.defineAttribute(
    'foot', {
        value: TP.cpc('> .foot', TP.hc('shouldCollapse', true))
    });

TP.sherpa.urieditor.Inst.defineAttribute(
    'editor', {
        value: TP.cpc('> .body > xctrls|codeeditor', TP.hc('shouldCollapse', true))
    });

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

    var elem;

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    TP.wrap(elem).teardown();

    //  this makes sure we maintain parent processing - but we need to do it
    //  last because it nulls out our wrapper reference.
    this.callNextMethod();

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('applyResource',
function() {

    var editor,

        newSourceText,

        sourceURI;

    editor = this.get('editor');

    if (TP.notValid(newSourceText = editor.getDisplayValue())) {
        editor.setDisplayValue('');

        this.isDirty(false);

        return this;
    }

    sourceURI = this.get('sourceURI');

    this.set('$changingURIs', true);

    sourceURI.setContent(newSourceText,
                            TP.request('resultType', TP.core.Content));
    this.set('localSourceContent', newSourceText);
    this.isDirty(false);

    this.set('$changingURIs', false);

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

    this.set('changeHandler', this.updateEditorState.bind(this));

    editorObj.on('change', this.get('changeHandler'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('getSourceID',
function() {

    var sourceURI;

    if (TP.isValid(sourceURI = this.get('sourceURI'))) {
        return sourceURI.getLocation();
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('getToolbar',
function() {

    var toolbar;

    //  This is different depending on whether we're embedded in the inspector
    //  or in a tile

    if (TP.isTrue(this.hasAttribute('detached'))) {
        toolbar = TP.byCSSPath('> .foot', this, true);
    } else {
        toolbar = TP.byId('SherpaToolbar', this.getWindow());
    }

    return toolbar;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineHandler('DirtyChange',
function(aSignal) {

    var payload;

    //  This handler is invoked when the underlying source URI that the receiver
    //  is editing is dirty

    payload = aSignal.getPayload();

    this.changed('sourceDirty',
                    TP.UPDATE,
                    TP.hc(TP.OLDVAL, payload.at(TP.OLDVAL),
                            TP.NEWVAL, payload.at(TP.NEWVAL)));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineHandler('ResourceApply',
function(aSignal) {

    this.applyResource();

    this.updateEditorState(this.get('editor').$get('$editorObj'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineHandler('ResourcePush',
function(aSignal) {

    this.pushResource();

    this.updateEditorState(this.get('editor').$get('$editorObj'));

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

    if (this.get('$changingURIs')) {
        return this;
    }

    if (this.isDirty()) {
        TP.confirm('Remote content changed. Abandon local changes?').then(
            function(abandonChanges) {

                if (abandonChanges) {
                    //  NB: This will reset both the localSourceContent cache
                    //  and our editor to whatever is in the URI and set the
                    //  URI's 'dirty' flag to false.
                    this.render();
                }
            }.bind(this));
    } else {
        this.render();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('pushResource',
function() {

    var sourceURI,

        putParams,
        putRequest;

    this.applyResource();

    sourceURI = this.get('sourceURI');

    putParams = TP.hc('method', TP.HTTP_PUT);
    putRequest = sourceURI.constructRequest(putParams);

    putRequest.defineHandler('RequestSucceeded',
        function(aResponse) {
            //  empty
        });

    putRequest.defineHandler('RequestFailed',
        function(aResponse) {
            //  empty
        });

    putRequest.defineHandler('RequestCompleted',
        function(aResponse) {
            //  empty
        });

    sourceURI.save(putRequest);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('render',
function() {

    var editor,

        sourceURI,
        sourceResult,
        sourceStr,

        editorObj,

        mimeType;

    //  If we're not actually changing our source object, then we don't really
    //  need to 'rerender'
    if (!this.get('$changingSourceObject')) {
        return this;
    }

    editor = this.get('editor');

    sourceURI = this.get('sourceURI');

    if (TP.isValid(sourceURI)) {
        sourceResult =
            sourceURI.getResource(
                TP.hc('async', false, 'resultType', TP.core.Content)
            ).get('result');
    }

    if (TP.notValid(sourceURI) ||
        TP.isEmpty(sourceResult)) {
        this.set('localSourceContent', '');
        editor.setDisplayValue('');

        return this;
    }

    sourceStr = sourceResult.asCleanString();

    if (TP.notValid(sourceStr)) {
        editor.setDisplayValue('');
        this.set('localSourceContent', '');

        this.isDirty(false);

        return this;
    }

    this.set('localSourceContent', sourceStr);
    this.isDirty(false);

    editorObj = this.get('editor').$get('$editorObj');

    //  Try to get a MIME type from the URI - if we can't, then we just treat
    //  the content as plain text.
    if (TP.isEmpty(mimeType = sourceURI.getMIMEType())) {
        mimeType = TP.PLAIN_TEXT_ENCODED;
    }

    //  CodeMirror won't understand XHTML as distinct from XML.
    if (mimeType === TP.XHTML_ENCODED) {
        mimeType = TP.XML_ENCODED;
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

        sourceURI,
        sourceResult,
        sourceStr,

        editorObj;

    editor = this.get('editor');

    //  Now, update the local content to match what the remote content has
    sourceURI = this.get('sourceURI');

    if (TP.isValid(sourceURI)) {
        sourceResult =
            sourceURI.getResource(
                TP.hc('async', false, 'resultType', TP.core.Content)
            ).get('result');
    }

    if (TP.notValid(sourceURI) ||
        TP.isEmpty(sourceResult)) {
        this.set('localSourceContent', '');
        editor.setDisplayValue('');

        return this;
    }

    sourceStr = sourceResult.asCleanString();

    if (TP.notValid(sourceStr)) {
        editor.setDisplayValue('');
        this.set('localSourceContent', '');

        this.isDirty(false);

        return this;
    }

    this.set('localSourceContent', sourceStr);
    this.isDirty(false);

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

        sourceURI;

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

        sourceURI = this.get('sourceURI');
        newURI.setResource(sourceURI,
                            TP.request('signalChange', false));

        this.setAttribute('detached', true);
    }

    this.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('setSourceObject',
function(anObj) {

    var sourceURI;

    if (TP.isURI(sourceURI = this.get('sourceURI'))) {
        this.ignore(sourceURI, TP.ac('TP.sig.DirtyChange', 'TP.sig.ValueChange'));
    }

    sourceURI = anObj;

    if (!TP.isURI(sourceURI)) {
        this.render();

        return this;
    }

    this.observe(sourceURI, TP.ac('TP.sig.DirtyChange', 'TP.sig.ValueChange'));

    this.$set('sourceURI', sourceURI);

    this.set('$changingSourceObject', true);
    this.render();
    this.set('$changingSourceObject', false);

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

    if (!TP.isValid(aValue)) {
        this.teardown();

        return this;
    }

    //  NB: This will call render()
    this.setSourceObject(aValue);

    this.get('editor').focus();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('updateEditorState',
function() {

    var editorObj,
        currentEditorStr,

        localSourceStr;

    editorObj = this.get('editor').$get('$editorObj');

    currentEditorStr = editorObj.getValue();

    if (TP.notValid(localSourceStr = this.get('localSourceContent'))) {
        return this;
    }

    this.isDirty(currentEditorStr !== localSourceStr);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('teardown',
function() {

    var sourceURI,
        editorObj;

    if (TP.isURI(sourceURI = this.get('sourceURI'))) {
        this.ignore(sourceURI, 'TP.sig.ValueChange');
    }

    editorObj = this.get('editor').$get('$editorObj');
    editorObj.off('change', this.get('changeHandler'));

    this.$set('editor', null, false);
    this.$set('changeHandler', null, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('$flag',
function(aProperty, aFlag) {

    /**
     * @method $flag
     * @summary Sets a specific property value to a boolean based on aFlag.
     * @param {String} aProperty The name of the boolean property being tested
     *     and/or manipulated.
     * @param {Boolean} [aFlag] The new value to optionally set.
     * @exception {TP.sig.InvalidParameter} When aProperty isn't a String.
     * @returns {?Boolean} The current flag state.
     */

    if (!TP.isString(aProperty)) {
        this.raise('TP.sig.InvalidParameter');
        return;
    }

    if (TP.isBoolean(aFlag)) {
        this.$set(aProperty, aFlag);
    }

    return this.$get(aProperty);
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('isDirty',
function(aFlag) {

    /**
     * @method isDirty
     * @summary Returns true if the receiver's content has changed since it was
     *     last loaded from it's source URI or content data without being saved.
     * @param {Boolean} [aFlag] The new value to optionally set.
     * @returns {Boolean} Whether or not the content of the receiver is 'dirty'.
     */

    return this.$flag('dirty', aFlag);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
