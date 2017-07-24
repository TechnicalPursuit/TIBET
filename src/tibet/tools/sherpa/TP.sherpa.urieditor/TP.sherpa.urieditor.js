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

    TP.wrap(elem).setup();

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
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineAttribute('$changingSourceContent');

TP.sherpa.urieditor.Inst.defineAttribute('sourceURI');

TP.sherpa.urieditor.Inst.defineAttribute('dirty');

TP.sherpa.urieditor.Inst.defineAttribute('localSourceContent');

TP.sherpa.urieditor.Inst.defineAttribute('changeHandler');

TP.sherpa.urieditor.Inst.defineAttribute('extraLoadHeaders');
TP.sherpa.urieditor.Inst.defineAttribute('extraSaveHeaders');

TP.sherpa.urieditor.Inst.defineAttribute('head',
    TP.cpc('> .head', TP.hc('shouldCollapse', true)));

TP.sherpa.urieditor.Inst.defineAttribute('body',
    TP.cpc('> .body', TP.hc('shouldCollapse', true)));

TP.sherpa.urieditor.Inst.defineAttribute('foot',
    TP.cpc('> .foot', TP.hc('shouldCollapse', true)));

TP.sherpa.urieditor.Inst.defineAttribute('editor',
    TP.cpc('> .body > xctrls|codeeditor', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('applyResource',
function() {

    /**
     * @method applyResource
     * @summary Applies changes from the editor text down into the resource.
     * @returns {TP.sherpa.urieditor} The receiver.
     */

    var editor,

        newSourceText,

        sourceURI;

    editor = this.get('editor');

    //  If the editor doesn't have a valid display value, make sure to set it to
    //  the empty String, mark it as not dirty and return. Nothing else to do
    //  here.
    if (TP.notValid(newSourceText = editor.getDisplayValue())) {
        editor.setDisplayValue('');

        this.isDirty(false);

        return this;
    }

    sourceURI = this.get('sourceURI');

    //  Make sure to set a flag that we're changing the content out from under
    //  the source URI. That way, ValueChange notifications, et. al. won't cause
    //  strange recursions, etc.
    this.set('$changingSourceContent', true);

    //  Set the content of our source URI to the source text extracted from the
    //  editor.
    sourceURI.setContent(newSourceText,
                            TP.request('resultType', TP.core.Content));

    //  Capture this into the 'local' version of the source content. This is
    //  used to compare against what is currently in the source URI to determine
    //  whether the editor content is currently dirty.
    this.set('localSourceContent', newSourceText);

    //  We mark the editor as not dirty since we just propagated the changes
    //  down into the markup.
    this.isDirty(false);

    //  Now that we've set the content and various flags to false, we can unset
    //  the 'changing content' flag.
    this.set('$changingSourceContent', false);

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

TP.sherpa.urieditor.Inst.defineHandler('ResourceApply',
function(aSignal) {

    /**
     * @method handleResourceApply
     * @summary Handles when the user has clicked the 'Apply' button to apply
     *     changes to the resource we are currently editing.
     * @param {TP.sig.ResourceApply} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.urieditor} The receiver.
     */

    //  Apply the changes from the editor to the resource.
    this.applyResource();

    //  Update the editor's state, including its dirty state.
    this.updateEditorState();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineHandler('ResourcePush',
function(aSignal) {

    /**
     * @method handleResourcePush
     * @summary Handles when the user has clicked the 'Push' button to push
     *     changes that have been applied to the resource to the remote endpoint
     *     denoted by our source URI.
     * @param {TP.sig.ResourcePush} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.urieditor} The receiver.
     */

    //  NB: This is an asynchronous operation.
    this.pushResource();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineHandler('ResourceRevert',
function(aSignal) {

    /**
     * @method handleResourceRevert
     * @summary Handles when the user has clicked the 'Revert' button to revert
     *     changes to the resource we are currently editing to the state when
     *     changes were last applied (or the original state as retrieved from
     *     the remote endpoint if no changes have been applied).
     * @param {TP.sig.ResourceRevert} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.urieditor} The receiver.
     */

    var refresh;

    refresh = TP.bc(aSignal.at('refresh'));

    //  NB: This is an asynchronous operation.
    this.revertResource(refresh);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles when the underlying value of the resource we are
     *     currently editing changes.
     * @param {TP.sig.ValueChange} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.sherpa.urieditor} The receiver.
     */

    //  If the 'changing content' flag is set, that means that the receiver is
    //  doing the changing of the value, so we don't want to proceed any
    //  further. Endless recursion and other nasty things are down that road.
    if (this.get('$changingSourceContent')) {
        return this;
    }

    //  If we're dirty, that means that we have applied, but unpushed, changes.
    //  Make sure the user wants to abandon those.

    //  NB: If the user cancels this operation, that means that the content of
    //  the underlying resource and what is currently displayed in the editor
    //  are different, but then again that just means that the editor is dirty.
    if (this.isDirty()) {

        TP.confirm('Remote content changed. Abandon local changes?').then(
            function(abandonChanges) {

                if (abandonChanges) {
                    //  NB: This will reset both the localSourceContent cache
                    //  and our editor to whatever is in the URI and set the
                    //  URI's 'dirty' flag to false.
                    //  NB: render could be an asynchronous operation
                    this.render();
                }
            }.bind(this));
    } else {
        //  NB: render could be an asynchronous operation
        this.render();
    }

    return this;
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

TP.sherpa.urieditor.Inst.defineMethod('isSourceDirty',
function() {

    /**
     * @method isSourceDirty
     * @summary Returns true if the receiver's *source* has changed since it was
     *     last loaded. For this type, this effectively means whether the source
     *     URI is dirty.
     * @returns {Boolean} Whether or not the *source* of the receiver is
     *     'dirty'.
     */

    return this.get('sourceURI').isDirty();
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('pushResource',
function() {

    /**
     * @method pushResource
     * @summary Pushes changes that have been made to the editor's underlying
     *     resource to the remote endpoint denoted by our source URI.
     * @returns {TP.sherpa.urieditor} The receiver.
     */

    var sourceURI,

        putParams,
        extraHeaders,

        saveRequest;

    sourceURI = this.get('sourceURI');

    //  We start out by configuring the HTTP method on the save request to be an
    //  HTTP PUT, but if we're pushing to the TDS, this very well might be reset
    //  to be an HTTP PATCH.
    putParams = TP.hc('method', TP.HTTP_PUT);

    //  If any extra save headers were configured on ourself as an attribute,
    //  then they'll be in this instance variable. Add them to the put
    //  parameters.
    extraHeaders = this.get('extraSaveHeaders');
    if (TP.notEmpty(extraHeaders)) {
        putParams.addAll(extraHeaders);
    }

    saveRequest = sourceURI.constructRequest(putParams);

    saveRequest.defineHandler('RequestSucceeded',
        function(aResponse) {
            //  We need to signal that we are not dirty - we're not really dirty
            //  anyway, since the applyResource() above set us to not be dirty,
            //  but there are controls that rely on us signaling when either us
            //  or our sourceURI's 'dirty' state changes.
            this.changed('dirty',
                            TP.UPDATE,
                            TP.hc(TP.OLDVAL, true, TP.NEWVAL, false));
        }.bind(this));

    saveRequest.defineHandler('RequestFailed',
        function(aResponse) {
            //  empty
        });

    saveRequest.defineHandler('RequestCompleted',
        function(aResponse) {
            //  empty
        });

    //  Make sure to let the save request know that we're not interested in
    //  serializing 'xmlns:' attributes.
    saveRequest.atPut('serializationParams',
                        TP.hc('wantsPrefixedXMLNSAttrs', false));

    //  Do the deed.
    sourceURI.save(saveRequest);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver.
     * @returns {TP.sherpa.urieditor} The receiver.
     */

    var editor,

        sourceURI,

        getParams,
        extraHeaders,

        sourceResource;

    //  Grab our underlying editor object (an xctrls:codeeditor)
    editor = this.get('editor');

    sourceURI = this.get('sourceURI');

    //  If we don't have a valid source URI, then just set both our local
    //  version of the source content and the editor display value to the empty
    //  String and return. Nothing else to do here.
    if (!TP.isURI(sourceURI)) {

        this.set('localSourceContent', '');
        editor.setDisplayValue('');

        return this;
    }

    //  Make sure to set a flag that we're changing the content out from under
    //  the source URI. That way, ValueChange notifications, et. al. won't cause
    //  strange recursions, etc.
    this.set('$changingSourceContent', true);

    //  Grab our source URI's resource. Note that this may be an asynchronous
    //  fetch. Note also that we specify that we want the result wrapped in some
    //  sort of TP.core.Content instance.

    getParams = TP.hc('resultType', TP.core.Content);

    //  If any extra load headers were configured on ourself as an attribute,
    //  then they'll be in this instance variable. Add them to the get
    //  parameters.
    extraHeaders = this.get('extraLoadHeaders');
    if (TP.notEmpty(extraHeaders)) {
        getParams.addAll(extraHeaders);
    }

    sourceResource = sourceURI.getResource(getParams);

    sourceResource.then(
        function(sourceResult) {

            var sourceStr,
                editorObj,
                mimeType;

            //  Now that we're done reverting the content, we can unset the
            //  'changing content' flag.
            this.set('$changingSourceContent', false);

            //  If we don't have a valid result, then just set both our local
            //  version of the source content and the editor display value to
            //  the empty String and return. Nothing else to do here.
            if (TP.isEmpty(sourceResult)) {

                this.set('localSourceContent', '');
                editor.setDisplayValue('');

                return this;
            }

            //  Grab a 'clean String' from the underlying content. This will be
            //  the 'most canonicalized' version that TIBET can produce. For
            //  these serializations, we do *not* want 'xmlns:' attributes to be
            //  output. TIBET handles prefixed markup very well through its
            //  'auto-prefixing' mechanism.
            sourceStr = sourceResult.asCleanString(
                                    TP.hc('wantsPrefixedXMLNSAttrs', false));

            //  If the source String isn't valid (not even the empty String),
            //  then set our editor's display value to the empty String, our
            //  local copy of the content to the empty String and mark ourself
            //  as not dirty. Nothing else to do here.
            if (TP.notValid(sourceStr)) {

                editor.setDisplayValue('');
                this.set('localSourceContent', '');

                this.isDirty(false);

                return this;
            }

            //  Grab the real underlying editor object beneath the
            //  xctrls:codeeditor. This is an instance of CodeMirror.
            editorObj = this.get('editor').$get('$editorObj');

            //  Try to get a MIME type from the URI - if we can't, then we just
            //  treat the content as plain text.
            if (TP.isEmpty(mimeType = sourceURI.getMIMEType())) {
                mimeType = TP.PLAIN_TEXT_ENCODED;
            }

            //  CodeMirror won't understand XHTML as distinct from XML.
            if (mimeType === TP.XHTML_ENCODED) {
                mimeType = TP.XML_ENCODED;
            }

            //  Set the editor's 'mode' to the computed MIME type.
            editorObj.setOption('mode', mimeType);

            //  If the content was JSON encoded, then try to format it using the
            //  'plain text encoding' (i.e. newlines and spaces). CodeMirror
            //  will format that into the proper markup for display.
            if (mimeType === TP.JSON_ENCODED) {
                sourceStr = TP.sherpa.pp.runFormattedJSONModeOn(
                            sourceStr,
                            TP.hc('outputFormat', TP.PLAIN_TEXT_ENCODED));
            }

            //  Set the CodeMirror object's value to the source string.
            editorObj.setValue(sourceStr);

            //  Initialize our local copy of the content with the source String
            //  and set the dirty flag to false.
            this.set('localSourceContent', sourceStr);
            this.isDirty(false);

            //  Update the editor's state, including its dirty state.
            this.updateEditorState();

            /* eslint-disable no-extra-parens */
            (function() {
                editor.refreshEditor();

                //  Signal to observers that this control has rendered.
                this.signal('TP.sig.DidRender');

            }.bind(this)).queueForNextRepaint(this.getNativeWindow());
            /* eslint-enable no-extra-parens */

        }.bind(this));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('revertResource',
function(shouldRefresh) {

    /**
     * @method revertResource
     * @summary Reverts any changes in the editor text since the last 'accept'
     *     to the value as it was then.
     * @param {Boolean} [shouldRefresh=false] Whether or not to revert the
     *     content from the remote resource. The default is false.
     * @returns {TP.sherpa.urieditor} The receiver.
     */

    var editor,

        sourceURI,

        getParams,
        extraHeaders,

        refresh,

        sourceResource;

    //  Grab our underlying editor object (an xctrls:codeeditor)
    editor = this.get('editor');

    sourceURI = this.get('sourceURI');

    //  If we don't have a valid source URI, then just set both our local
    //  version of the source content and the editor display value to the empty
    //  String and return. Nothing else to do here.
    if (!TP.isURI(sourceURI)) {

        this.set('localSourceContent', '');
        editor.setDisplayValue('');

        return this;
    }

    refresh = TP.ifInvalid(shouldRefresh, false);

    //  Make sure to set a flag that we're changing the content out from under
    //  the source URI. That way, ValueChange notifications, et. al. won't cause
    //  strange recursions, etc.
    this.set('$changingSourceContent', true);

    //  Capture the current scroll position so that we can try restoring it
    //  below after we refresh the editor. This attempts to prevent the 'scroll
    //  jumping' that happens when the editor refreshes and sets the scroll
    //  position back to 0,0.
    editor.captureCurrentScrollInfo();

    //  Grab our source URI's resource. Note that this may be an asynchronous
    //  fetch. Note also that we specify that we want the result wrapped in some
    //  sort of TP.core.Content instance.

    getParams = TP.hc('resultType', TP.core.Content, 'refresh', refresh);

    //  If any extra load headers were configured on ourself as an attribute,
    //  then they'll be in this instance variable. Add them to the get
    //  parameters.
    extraHeaders = this.get('extraLoadHeaders');
    if (TP.notEmpty(extraHeaders)) {
        getParams.addAll(extraHeaders);
    }

    sourceResource = sourceURI.getResource(getParams);

    sourceResource.then(
        function(sourceResult) {

            var sourceStr,
                editorObj;

            //  Now that we're done reverting the content, we can unset the
            //  'changing content' flag.
            this.set('$changingSourceContent', false);

            //  If we don't have a valid result, then just set both our local
            //  version of the source content and the editor display value to
            //  the empty String and return. Nothing else to do here.
            if (TP.isEmpty(sourceResult)) {

                this.set('localSourceContent', '');
                editor.setDisplayValue('');

                return this;
            }

            //  Grab a 'clean String' from the underlying content. This will be
            //  the 'most canonicalized' version that TIBET can produce. For
            //  these serializations, we do *not* want 'xmlns:' attributes to be
            //  output. TIBET handles prefixed markup very well through its
            //  'auto-prefixing' mechanism.
            sourceStr = sourceResult.asCleanString(
                                    TP.hc('wantsPrefixedXMLNSAttrs', false));

            //  If the source String isn't valid (not even the empty String),
            //  then set our editor's display value to the empty String, our
            //  local copy of the content to the empty String and mark ourself
            //  as not dirty. Nothing else to do here.
            if (TP.notValid(sourceStr)) {

                editor.setDisplayValue('');
                this.set('localSourceContent', '');

                this.isDirty(false);

                //  Update the editor's state, including its dirty state.
                this.updateEditorState();

                return this;
            }

            //  Initialize our local copy of the content with the source String
            //  and set the dirty flag to false.
            this.set('localSourceContent', sourceStr);
            this.isDirty(false);

            //  Update the editor's state, including its dirty state.
            this.updateEditorState();

            //  Grab the real underlying editor object beneath the
            //  xctrls:codeeditor. This is an instance of CodeMirror.
            editorObj = this.get('editor').$get('$editorObj');

            //  Set the CodeMirror object's value to the source string.
            editorObj.setValue(sourceStr);

            /* eslint-disable no-extra-parens */
            (function() {

                //  Refresh the editor and try to put the scroll position back
                //  to what it was before we refreshed it. This is an attempt to
                //  prevent 'scroll jumping'.

                editor.refreshEditor();

                editor.scrollUsingLastScrollInfo();

                //  Signal to observers that this control has rendered.
                this.signal('TP.sig.DidRender');

            }).queueForNextRepaint(this.getNativeWindow());
            /* eslint-enable no-extra-parens */
        }.bind(this),
        function(error) {

            //  We had an error reverting the content, but make sure we unset
            //  the 'changing content' flag.
            this.set('$changingSourceContent', false);

        }.bind(this));

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

        newURI = aNewURI;
        if (TP.notValid(newURI)) {
            newURI = TP.uc('urn:tibet:' + this.getLocalID());
        }

        this.set('$changingSourceContent', true);
        oldURI.setResource(null);
        this.set('$changingSourceContent', false);

        this.setAttribute('bind:in', newURI.getLocation());

        sourceURI = this.get('sourceURI');
        newURI.setResource(sourceURI,
                            TP.request('signalChange', false));

        this.setAttribute('detached', true);
    }

    //  NB: render could be an asynchronous operation
    this.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('setSourceObject',
function(anObj) {

    /**
     * @method setSourceObject
     * @summary Sets the source object (a URI) of the receiver to the supplied
     *     object.
     * @param {TP.core.URI} anObj The object to set as the source object that
     *     the receiver will edit.
     * @returns {TP.sherpa.urieditor} The receiver.
     */

    var sourceURI;

    //  Grab the current source URI and ignore it for changes. This is important
    //  because we observe the source URI whenever it gets set on the receiver.
    if (TP.isURI(sourceURI = this.get('sourceURI'))) {
        this.ignore(sourceURI, 'TP.sig.ValueChange');
    }

    sourceURI = anObj;

    if (!TP.isURI(sourceURI)) {

        //  NB: render could be an asynchronous operation
        this.render();

        return this;
    }

    //  Observe the source URI for changes.
    this.observe(sourceURI, 'TP.sig.ValueChange');

    //  Note the use of '$set' to avoid recursion.
    this.$set('sourceURI', sourceURI);

    //  NB: render could be an asynchronous operation
    this.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.sherpa.urieditor} The receiver.
     */

    var editorObj,

        attrVal;

    //  Grab the underlying editor's editor ;-), which is a CodeMirror object.
    editorObj = this.get('editor').$get('$editorObj');

    //  Set the various CodeMirror options to the themes and modes that TIBET
    //  uses.
    editorObj.setOption('theme', 'elegant');
    editorObj.setOption('tabMode', 'indent');
    editorObj.setOption('lineNumbers', true);
    editorObj.setOption('lineWrapping', true);

    //  Set a change handler that will be installed on our underlying editor
    //  object that will pdate the editor's state, including its dirty state,
    //  when the user changes the content of the editor.
    this.set('changeHandler', this.updateEditorState.bind(this));

    //  Install that handler onto CodeMirror.
    editorObj.on('change', this.get('changeHandler'));

    //  If there are an 'extra load headers' defined on ourself as an attribute,
    //  grab and store them.
    attrVal = this.getAttribute('extraLoadHeaders');
    if (TP.notEmpty(attrVal)) {

        //  Convert the JSON-y like value into real JSON
        attrVal = TP.reformatJSToJSON(attrVal);
        if (TP.isJSONString(attrVal)) {
            this.set('extraLoadHeaders', TP.json2js(attrVal));
        }
    }

    //  If there are an 'extra save headers' defined on ourself as an attribute,
    //  grab and store them.
    attrVal = this.getAttribute('extraSaveHeaders');
    if (TP.notEmpty(attrVal)) {

        //  Convert the JSON-y like value into real JSON
        attrVal = TP.reformatJSToJSON(attrVal);
        if (TP.isJSONString(attrVal)) {
            this.set('extraSaveHeaders', TP.json2js(attrVal));
        }
    }

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

    if (this.get('$changingSourceContent')) {
        return this;
    }

    if (!TP.isValid(aValue)) {
        this.teardown();

        return this;
    }

    //  NB: This will call render()
    this.setSourceObject(aValue);

    //  Focus the editor. Note this is done in a setTimeout to allow the GUI to
    //  'settle'.
    setTimeout(
        function() {

            var inspector,

                extraInfo,
                findContent;

            this.get('editor').focus();

            inspector = TP.byId('SherpaInspector', this.getNativeWindow());

            extraInfo = inspector.get('extraTargetInfo');

            if (TP.notEmpty(extraInfo)) {

                findContent = extraInfo.at('findContent');

                if (TP.notEmpty(findContent)) {
                    this.get('editor').findAndScrollTo(findContent);
                }
            }

        }.bind(this), TP.sys.cfg('editor.select.delay', 50));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('updateEditorState',
function() {

    /**
     * @method updateEditorState
     * @summary Updates the editor's state, such as its dirty state, to reflect
     *     the state of the editor vis-a-vis the resource it is editing.
     * @returns {TP.sherpa.urieditor} The receiver.
     */

    var editorObj,
        currentEditorStr,

        localSourceStr;

    editorObj = this.get('editor').$get('$editorObj');

    currentEditorStr = editorObj.getValue();

    //  Make sure we have a local copy of the source content to compare against,
    //  (i.e. it's valid) or we'll always show as 'dirty' ;-).
    if (TP.notValid(localSourceStr = this.get('localSourceContent'))) {
        return this;
    }

    this.isDirty(currentEditorStr !== localSourceStr);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('teardown',
function() {

    /**
     * @method teardown
     * @summary Tears down the receiver by performing housekeeping cleanup, like
     *     ignoring signals it's observing, etc.
     * @returns {TP.sherpa.urieditor} The receiver.
     */

    var sourceURI,
        editorObj;

    //  Grab the current source URI and ignore it for changes. This is important
    //  because we observe the source URI whenever it gets set on the receiver.
    if (TP.isURI(sourceURI = this.get('sourceURI'))) {
        this.ignore(sourceURI, 'TP.sig.ValueChange');
    }

    //  Grab the underlying editor's editor ;-), which is a CodeMirror object.
    editorObj = this.get('editor').$get('$editorObj');

    //  Uninstall the change handler we put onto it in the setup method.
    editorObj.off('change', this.get('changeHandler'));

    this.$set('editor', null, false);
    this.$set('changeHandler', null, false);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
