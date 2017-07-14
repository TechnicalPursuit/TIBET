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

TP.sherpa.urieditor.defineSubtype('methodeditor');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineAttribute('serverSourceObject');
TP.sherpa.methodeditor.Inst.defineAttribute('sourceObject');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('applyResource',
function() {

    /**
     * @method applyResource
     * @summary Applies changes from the editor text down into the resource.
     * @returns {TP.sherpa.methodeditor} The receiver.
     */

    var editor,

        newSourceText,

        sourceObj,
        newSourceObj;

    editor = this.get('editor');

    //  If the editor doesn't have a valid display value, make sure to set it to
    //  the empty String, mark it as not dirty and return. Nothing else to do
    //  here.
    if (TP.notValid(newSourceText = editor.getDisplayValue())) {
        editor.setDisplayValue('');

        this.isDirty(false);

        return this;
    }

    sourceObj = this.get('sourceObject');

    //  Make sure to set a flag that we're changing the content out from under
    //  the source object. That way, ValueChange notifications, et. al. won't
    //  cause strange recursions, etc.
    this.set('$changingSourceContent', true);

    //  Replace the text of the method object with the text from the editor.
    newSourceObj = sourceObj.replaceWithSourceText(newSourceText);

    //  NB: We use '$set()' here to avoid calling our setter and blowing other
    //  references away.
    this.$set('sourceObject', newSourceObj);

    //  Capture this into the 'local' version of the source content. This is
    //  used to compare against what is currently in the source URI to determine
    //  whether the editor content is currently dirty.
    this.set('localSourceContent', newSourceText);

    //  Mark our source URI as dirty, since we just set new content into it.
    this.get('sourceURI').isDirty(true);

    //  Now that we've marked things dirty that need to be, mark ourself as
    //  *not* dirty. This will cause other controls watching us to update.
    this.isDirty(false);

    //  Now that we've set the content and various flags to false, we can unset
    //  the 'changing content' flag.
    this.set('$changingSourceContent', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles when the underlying value of the resource we are
     *     currently editing changes.
     * @param {TP.sig.ValueChange} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.sherpa.methodeditor} The receiver.
     */

    var refreshFunc;

    //  If the 'changing content' flag is set, that means that the receiver is
    //  doing the changing of the value, so we don't want to proceed any
    //  further. Endless recursion and other nasty things are down that road.
    if (this.get('$changingSourceContent')) {
        return this;
    }

    refreshFunc = function(anObj) {

        var newObj;

        //  Grab the 'refreshed instance' of the method object.
        newObj = anObj.getRefreshedInstance();

        //  Set both our sourceObject and serverSourceObject to that refreshed
        //  instance. This will have the effect of making the editor not dirty.
        this.$set('sourceObject', newObj);
        this.$set('serverSourceObject', newObj);
    }.bind(this);

    //  If we're dirty, that means that we have applied, but unpushed, changes.
    //  Make sure the user wants to abandon those.

    //  NB: If the user cancels this operation, that means that the content of
    //  the underlying resource and what is currently displayed in the editor
    //  are different, but then again that just means that the editor is dirty.
    if (this.isDirty()) {
        TP.confirm('Remote content changed. Abandon local changes?').then(
            function(abandonChanges) {

                if (abandonChanges) {

                    refreshFunc(this.get('sourceObject'));

                    //  NB: This will reset both the localSourceContent cache
                    //  and our editor to whatever is in the URI and set the
                    //  URI's 'dirty' flag to false.
                    //  NB: render could be an asynchronous operation
                    this.render();
                }
            }.bind(this));
    } else {
        refreshFunc(this.get('sourceObject'));

        //  NB: render could be an asynchronous operation
        this.render();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('pushResource',
function() {

    /**
     * @method pushResource
     * @summary Pushes changes that have been made to the editor's underlying
     *     resource to the remote endpoint denoted by our source URI.
     * @returns {TP.sherpa.methodeditor} The receiver.
     */

    var newSourceText,

        serverSourceObject,
        sourceObject,

        patchResults,
        diffPatch,
        newContent,

        patchPromise;

    newSourceText = this.get('editor').getDisplayValue();

    //  This is the method as the *server* sees it. This got replaced when we
    //  'applied' whatever changes to it that we did in the applyResource()
    //  method.
    serverSourceObject = this.get('serverSourceObject');

    //  This is the method as the *client* currently sees it.
    sourceObject = this.get('sourceObject');

    //  Compute a diff patch by comparing the server source object against the
    //  new source text.

    patchResults = serverSourceObject.getMethodPatch(newSourceText);
    diffPatch = patchResults.first();
    newContent = patchResults.last();

    if (TP.notEmpty(diffPatch)) {

        patchPromise = TP.tds.TDSURLHandler.sendPatch(
                            this.get('sourceURI'),
                            diffPatch);

        patchPromise.then(
            function(successfulPatch) {

                var sourceURI;

                if (successfulPatch) {
                    this.set('serverSourceObject', sourceObject);

                    sourceURI = this.get('sourceURI');
                    sourceURI.$set('resource', newContent, false);
                    sourceURI.isLoaded(true);

                    //  Mark our source URI as *not* dirty, since we just pushed
                    //  it's new content to the server.
                    sourceURI.isDirty(false);

                    //  We need to signal that we are not dirty - we're not
                    //  really dirty anyway, since the applyResource() above set
                    //  us to not be dirty, but there are controls that rely on
                    //  us signaling when either us or our sourceURI's 'dirty'
                    //  state changes.
                    this.changed('dirty',
                                    TP.UPDATE,
                                    TP.hc(TP.OLDVAL, true, TP.NEWVAL, false));
                }
            }.bind(this));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver.
     * @returns {TP.sherpa.methodeditor} The receiver.
     */

    var editor,
        editorObj,

        sourceURI,
        sourceObj,
        sourceText,

        mimeType;

    //  Grab our underlying editor object (an xctrls:codeeditor)
    editor = this.get('editor');

    sourceURI = this.get('sourceURI');

    if (TP.isValid(sourceURI)) {
        sourceObj = this.get('sourceObject');
    }

    //  If we don't have a valid source URI or we have an empty source object as
    //  that URI's resource, then just set both our local version of the source
    //  content and the editor display value to the empty String and return.
    //  Nothing else to do here.
    if (TP.notValid(sourceURI) ||
        TP.isEmpty(sourceObj)) {

        this.set('localSourceContent', '');
        editor.setDisplayValue('');

        return this;
    }

    //  Grab the real underlying editor object beneath the xctrls:codeeditor.
    //  This is an instance of CodeMirror.
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

    //  Set the editor's 'mode' to the computed MIME type.
    editorObj.setOption('mode', mimeType);

    //  Grab our source text that we want by converting the source object to
    //  text.
    sourceText = TP.src(sourceObj);

    //  Initialize our local copy of the content with the source String and set
    //  the dirty flag to false.
    this.set('localSourceContent', sourceText);
    this.isDirty(false);

    //  Set the CodeMirror object's value to the source string.
    editorObj.setValue(sourceText);

    /* eslint-disable no-extra-parens */
    (function() {
        editor.refreshEditor();

        //  Signal to observers that this control has rendered.
        this.signal('TP.sig.DidRender');

    }.bind(this)).queueForNextRepaint(this.getNativeWindow());
    /* eslint-enable no-extra-parens */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('revertResource',
function() {

    /**
     * @method revertResource
     * @summary Reverts any changes in the editor text since the last 'accept'
     *     to the value as it was then.
     * @returns {TP.sherpa.methodeditor} The receiver.
     */

    var editor,
        sourceText,
        editorObj,
        sourceObj,
        serverSourceObj;

    //  Grab our underlying editor object (an xctrls:codeeditor)
    editor = this.get('editor');

    sourceObj = this.get('sourceObject');
    serverSourceObj = this.get('serverSourceObject');

    //  Grab our source text that we want to transition (back) to by converting
    //  the server source object to text.
    sourceText = TP.src(serverSourceObj);

    //  If we don't have a valid source URI, then just set both our local
    //  version of the source content and the editor display value to the empty
    //  String and return. Nothing else to do here.
    if (TP.notValid(sourceText)) {

        editor.setDisplayValue('');
        this.set('localSourceContent', '');

        this.isDirty(false);

        return this;
    }

    //  Initialize our local copy of the content with the source String and set
    //  the dirty flag to false.
    this.set('localSourceContent', sourceText);
    this.isDirty(false);

    //  Grab the real underlying editor object beneath the xctrls:codeeditor.
    //  This is an instance of CodeMirror.
    editorObj = this.get('editor').$get('$editorObj');

    //  Set the CodeMirror object's value to the source string.
    editorObj.setValue(sourceText);

    //  Revert our current source object with the source object as the server
    //  sees it.
    sourceObj = sourceObj.replaceWith(serverSourceObj);

    //  NB: We use '$set()' here to avoid calling our setter and blowing other
    //  references away.
    this.$set('sourceObject', sourceObj);

    /* eslint-disable no-extra-parens */
    (function() {
        editor.refreshEditor();

        //  Signal to observers that this control has rendered.
        this.signal('TP.sig.DidRender');

    }).queueForNextRepaint(this.getNativeWindow());
    /* eslint-enable no-extra-parens */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('setSourceObject',
function(anObj) {

    /**
     * @method setSourceObject
     * @summary Sets the source object (a method Function) of the receiver to
     *     the supplied object.
     * @param {Function} anObj The object to set as the source object that the
     *     receiver will edit.
     * @returns {TP.sherpa.methodeditor} The receiver.
     */

    var sourceURI;

    //  Grab the current source URI and ignore it for changes. This is important
    //  because we observe the source URI whenever it gets set on the receiver.
    if (TP.isURI(sourceURI = this.get('sourceURI'))) {
        this.ignore(sourceURI, 'TP.sig.ValueChange');
    }

    //  Grab the source URI of the Function by creating it from it's source
    //  path.
    sourceURI = TP.uc(TP.objectGetSourcePath(anObj));

    if (!TP.isURI(sourceURI)) {
        //  NB: render could be an asynchronous operation
        this.render();

        return this;
    }

    //  Observe the source URI for changes.
    this.observe(sourceURI, 'TP.sig.ValueChange');

    //  Note the use of '$set' to avoid recursion.
    this.$set('sourceURI', sourceURI);

    //  Capture the Function object as both our source object and what the
    //  server sees as our source object. When these are both the same (from a
    //  source text perspective) then we are not 'dirty'.
    this.$set('sourceObject', anObj);
    this.$set('serverSourceObject', anObj);

    //  NB: render could be an asynchronous operation
    this.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.methodeditor.Inst.defineMethod('teardown',
function() {

    /**
     * @method teardown
     * @summary Tears down the receiver by performing housekeeping cleanup, like
     *     ignoring signals it's observing, etc.
     * @returns {TP.sherpa.methodeditor} The receiver.
     */

    this.callNextMethod();

    this.$set('sourceObject', null, false);
    this.$set('serverSourceObject', null, false);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
