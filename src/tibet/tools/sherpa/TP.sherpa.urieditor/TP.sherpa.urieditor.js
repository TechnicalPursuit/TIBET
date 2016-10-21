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
        'editor',
        {value: TP.cpc('> .body > xctrls|codeeditor', TP.hc('shouldCollapse', true))});

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

        sourceObj,

        editorObj;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    if (TP.isURI(sourceObj = tpElem.get('$sourceURI'))) {
        tpElem.ignore(sourceObj, 'TP.sig.ValueChange');
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

    var editor,

        newSourceText,

        sourceObj,

        resourceObj,
        contentObj;

    editor = this.get('editor');

    if (TP.notValid(newSourceText = editor.getDisplayValue())) {
        editor.setDisplayValue('');

        return this;
    }

    sourceObj = this.get('$sourceURI');

    resourceObj = sourceObj.getResource();
    contentObj = resourceObj.get('result');

    this.set('$changingURIs', true);

    if (TP.isKindOf(contentObj, TP.core.Content)) {
        contentObj.setData(newSourceText);
    } else {
        sourceObj.setResource(newSourceText);
    }

    sourceObj.$changed();
    sourceObj.isDirty(true);

    this.set('localSourceContent', newSourceText);

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

    this.set('changeHandler', this.updateButtons.bind(this));

    editorObj.on('change', this.get('changeHandler'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('getApplyButton',
function() {
    return TP.byCSSPath('button[action="apply"]', this.getToolbar(), true);
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('getDetachMark',
function() {
    return TP.byCSSPath('.detach_mark', this.getToolbar(), true);
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('getPushButton',
function() {
    return TP.byCSSPath('button[action="push"]', this.getToolbar(), true);
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('getRevertButton',
function() {
    return TP.byCSSPath('button[action="revert"]', this.getToolbar(), true);
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('getSourceID',
function() {

    var sourceObj;

    if (TP.isValid(sourceObj = this.get('$sourceURI'))) {
        return sourceObj.getLocation();
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

    var sourceObj,

        fetchOptions,

        content;

    if (this.get('$changingURIs')) {
        return this;
    }

    sourceObj = this.get('$sourceURI');

    fetchOptions = TP.hc('async', false,
                            'resultType', TP.TEXT,
                            'refresh', true);
    content = sourceObj.getResource(fetchOptions).get('result');

    this.set('remoteSourceContent', content);
    this.set('localSourceContent', content);

    this.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('pushResource',
function() {

    var sourceObj,

        putParams,
        putRequest;

    this.applyResource();

    sourceObj = this.get('$sourceURI');

    putParams = TP.hc('method', TP.HTTP_PUT);
    putRequest = sourceObj.constructRequest(putParams);

    putRequest.defineHandler('RequestSucceeded',
        function(aResponse) {
        });

    putRequest.defineHandler('RequestFailed',
        function(aResponse) {
        });

    putRequest.defineHandler('RequestCompleted',
        function(aResponse) {
        });

    sourceObj.save(putRequest);

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

        sourceStr,

        editorObj,

        sourceObj,
        resourceObj,
        contentObj;

    editor = this.get('editor');

    if (TP.notValid(sourceStr = this.get('remoteSourceContent'))) {
        editor.setDisplayValue('');

        return this;
    }

    editorObj = this.get('editor').$get('$editorObj');

    editorObj.setValue(sourceStr);

    //  Now, update the local content to match what the remote content has
    sourceObj = this.get('$sourceURI');

    resourceObj = sourceObj.getResource();
    contentObj = resourceObj.get('result');

    this.set('$changingURIs', true);

    if (TP.isKindOf(contentObj, TP.core.Content)) {
        contentObj.setData(sourceStr);
    } else {
        sourceObj.setResource(sourceStr);
    }

    sourceObj.$changed();
    sourceObj.isDirty(false);

    this.set('localSourceContent', sourceStr);

    this.set('$changingURIs', false);

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

        this.setAttribute('detached', true);
    }

    this.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('setSourceObject',
function(anObj) {

    var sourceObj,

        wasDirty,

        localResult,

        fetchRequest,
        fetchResponse;

    if (TP.isURI(sourceObj = this.get('$sourceURI'))) {
        this.ignore(sourceObj, 'TP.sig.ValueChange');
    }

    sourceObj = anObj;

    if (!TP.isURI(sourceObj)) {

        this.set('remoteSourceContent', null);
        this.set('localSourceContent', null);

        this.render();

        return this;
    }

    this.observe(sourceObj, 'TP.sig.ValueChange');

    this.$set('$sourceURI', sourceObj);

    wasDirty = sourceObj.isDirty();
    localResult = sourceObj.getResource().get('result');

    fetchRequest = TP.request('resultType', TP.TEXT, 'refresh', true);
    fetchResponse = fetchRequest.getResponse();

    fetchResponse.then(
        function(aResult) {

            var sourceStr,
                mimeType;

            sourceStr = aResult;

            //  NB: We need to any massaging of the content here, before we set
            //  the remote & local source content. The 'difference' between
            //  these two will be used to do diffing and drive GUI updates (like
            //  the Revert/Save buttons, etc.) and so they both need to
            //  initially be in sync.
            if (TP.notEmpty(mimeType = sourceObj.getMIMEType())) {
                switch (mimeType) {

                    //  If it's JSON, then prettify it - otherwise, it's ugly
                    case TP.JSON_ENCODED:
                        sourceStr =
                            TP.sherpa.pp.runJSONModeOn(
                                sourceStr,
                                TP.hc('outputFormat', TP.PLAIN_TEXT_ENCODED));

                        break;

                    default:
                        break;
                }
            }

            this.set('remoteSourceContent', sourceStr);

            if (wasDirty) {
                this.set('localSourceContent', localResult.asString());
            } else {
                this.set('localSourceContent', sourceStr);
            }

            this.render();
        }.bind(this)).catch(
        function(err) {
            TP.ifError() ?
                TP.error('Error fetching source content in URI editor: ' +
                            TP.str(err)) : 0;
        });

    sourceObj.getResource(fetchRequest);

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

    //  On first refresh, the toolbar isn't populated yet, so just exit.
    if (TP.notValid(this.get('revertButton'))) {
        return this;
    }

    if (currentEditorStr !== localSourceStr) {
        this.get('applyButton').removeAttribute('disabled');
    } else {
        this.get('applyButton').setAttribute('disabled', true);
    }

    if (TP.notValid(remoteSourceStr = this.get('remoteSourceContent'))) {
        return this;
    }

    if (currentEditorStr !== remoteSourceStr) {
        this.get('revertButton').removeAttribute('disabled');
        this.get('pushButton').removeAttribute('disabled');
    } else {
        this.get('revertButton').setAttribute('disabled', true);
        this.get('pushButton').setAttribute('disabled', true);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
