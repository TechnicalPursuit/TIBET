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
 * @type {TP.lama.methodeditor}
 */

//  ------------------------------------------------------------------------

TP.lama.urieditor.defineSubtype('methodeditor');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.lama.methodeditor.Inst.defineAttribute('serverSourceObject');
TP.lama.methodeditor.Inst.defineAttribute('sourceObject');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.methodeditor.Inst.defineMethod('applyResource',
function() {

    /**
     * @method applyResource
     * @summary Applies changes from the editor text down into the resource.
     * @returns {TP.lama.methodeditor} The receiver.
     */

    var editor,

        newSourceText,

        sourceObj,
        newSourceObj,

        serverSourceObject,
        loadedFromSourceFile,

        patchResults,
        diffPatch,

        sourceURI,
        existingMethodResource;

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

    //  This is the method as the *server* sees it. This got replaced when we
    //  'applied' whatever changes to it that we did in the applyResource()
    //  method.
    serverSourceObject = this.get('serverSourceObject');

    //  If we haven't persisted this method yet, then we explicitly tell the
    //  getMethodPatch() method below that it wasn't loaded from a source file.
    if (serverSourceObject[TP.IS_PERSISTED] === false) {
        loadedFromSourceFile = false;
    } else {
        loadedFromSourceFile = true;
    }

    //  Compute a diff patch by comparing the server source object against the
    //  new source text.
    patchResults = serverSourceObject.getMethodPatch(
                                        newSourceText, loadedFromSourceFile);
    diffPatch = patchResults.first();

    sourceURI = this.get('sourceURI');
    existingMethodResource = sourceURI.getResource();
    existingMethodResource.then(
        function(aResult) {
            var finalContent;

            finalContent = TP.extern.Diff.applyPatch(aResult, diffPatch);

            //  This will mark our source URI as dirty.
            sourceURI.setResource(finalContent);

            //  But, since the toolbar only observes us for dirty changed, we
            //  need to signal the fact that our dirty state changed. Not that
            //  it really did - it was our URI's dirty state that changed. But
            //  the toolbar will refresh from both sources.
            this.changed('dirty');

            //  Now that we've set the content and various flags to false, we can
            //  unset the 'changing content' flag.
            this.set('$changingSourceContent', false);
        }.bind(this));

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.methodeditor.Inst.defineMethod('$computeDetachedValueAndName',
function() {

    /**
     * @method $computedDetachedValueAndName
     * @summary Computes the receiver's 'value' and 'name' that will be used by
     *     the control that it is being detached into
     * @returns {String[]} A pair with the value as the item in the first
     *     position and the name as the item in the last position.
     */

    var sourceObj,

        tabValue,
        tabName;

    //  Grab our source object.
    sourceObj = this.get('sourceObject');

    //  The value will be our TP.DISPLAY name, for uniqueness.
    tabValue = sourceObj[TP.DISPLAY];

    //  The name will be our user-visible name.
    tabName = sourceObj[TP.NAME];

    return TP.ac(tabValue, tabName);
});

//  ------------------------------------------------------------------------

TP.lama.methodeditor.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles when the underlying value of the resource we are
     *     currently editing changes.
     * @param {TP.sig.ValueChange} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.lama.methodeditor} The receiver.
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
        TP.confirm('Remote content changed. Abandon local changes?',
                TP.hc('dialogWindow', TP.sys.getUIRoot())).then(
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

TP.lama.methodeditor.Inst.defineMethod('pushResourceFailed',
function(aResponse) {

    /**
     * @method pushResourceFailed
     * @summary Invoked when pushing to the server failed.
     * @param {TP.sig.Response} aResponse The response for the request that
     *     failed.
     * @returns {TP.lama.urieditor} The receiver.
     */

    //  Notify the user of success
    TP.bySystemId('LamaConsoleService').notify(
        'Resource FAILED saving to: ' + this.get('sourceURI').getLocation());

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.methodeditor.Inst.defineMethod('pushResourceSucceeded',
function(aResponse) {

    /**
     * @method pushResourceSucceeded
     * @summary Invoked when pushing to the server succeeded.
     * @param {TP.sig.Response} aResponse The response for the request that
     *     succeeded.
     * @returns {TP.lama.urieditor} The receiver.
     */

    var serverSourceObject,
        sourceObject;

    //  This is the method as the *server* sees it. This got replaced when we
    //  'applied' whatever changes to it that we did in the applyResource()
    //  method.
    serverSourceObject = this.get('serverSourceObject');
    delete serverSourceObject[TP.IS_PERSISTED];

    //  This is the method as the *client* currently sees it.
    sourceObject = this.get('sourceObject');

    //  Now that they're sync'ed and the client changes have been pushed to the
    //  server, make them be the same object.
    this.set('serverSourceObject', sourceObject);

    //  We need to signal that we are not dirty - we're not
    //  really dirty anyway, since the applyResource() above set
    //  us to not be dirty, but there are controls that rely on
    //  us signaling when either us or our sourceURI's 'dirty'
    //  state changes.
    this.changed('dirty',
                    TP.UPDATE,
                    TP.hc(TP.OLDVAL, true, TP.NEWVAL, false));

    //  Notify the user of success
    TP.bySystemId('LamaConsoleService').notify(
        'Method successfully patched.');

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.methodeditor.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver.
     * @returns {TP.lama.methodeditor} The receiver.
     */

    var editor,

        sourceURI,
        sourceObj,
        sourceText,

        themeName;

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

        //  Signal to observers that this control has rendered.
        this.signal('TP.sig.DidRender');

        return this;
    }

    //  Grab our source text that we want by converting the source object to
    //  text.
    sourceText = TP.src(sourceObj);

    //  Initialize our local copy of the content with the source String and set
    //  the dirty flag to false.
    this.set('localSourceContent', sourceText);
    this.isDirty(false);

    editor.setEditorModeFromMIMEType(TP.JS_TEXT_ENCODED);

    themeName = TP.sys.cfg('lama.rich_input_theme', 'dawn');
    editor.setEditorTheme('ace/theme/' + themeName);

    editor.setValue(sourceText);

    //  Signal to observers that this control has rendered.
    this.signal('TP.sig.DidRender');

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.methodeditor.Inst.defineMethod('revertResource',
function(shouldRefresh) {

    /**
     * @method revertResource
     * @summary Reverts any changes in the editor text since the last 'accept'
     *     to the value as it was then.
     * @param {Boolean} [shouldRefresh=false] Whether or not to revert the
     *     content from the remote resource. The default is false.
     * @returns {TP.lama.methodeditor} The receiver.
     */

    var editor,

        sourceObj,
        serverSourceObj,

        refresh,

        sourceText;

    //  Grab our underlying editor object (an xctrls:codeeditor)
    editor = this.get('editor');

    sourceObj = this.get('sourceObject');
    serverSourceObj = this.get('serverSourceObject');

    refresh = TP.ifInvalid(shouldRefresh, false);

    //  Grab our source text that we want to transition (back) to by converting
    //  the either the source object or server source object to text, depending
    //  on whether we're refreshing (from server) or not.
    if (refresh) {
        sourceText = TP.src(serverSourceObj);
    } else {
        sourceText = TP.src(sourceObj);
    }

    //  If we don't have a valid source URI, then just set both our local
    //  version of the source content and the editor display value to the empty
    //  String and return. Nothing else to do here.
    if (TP.notValid(sourceText)) {

        editor.setDisplayValue('');
        this.set('localSourceContent', '');

        this.isDirty(false);

        return this;
    }

    //  Capture the current scroll position so that we can try restoring it
    //  below after we refresh the editor. This attempts to prevent the 'scroll
    //  jumping' that happens when the editor refreshes and sets the scroll
    //  position back to 0,0.
    //  editor.captureCurrentScrollInfo();

    //  Initialize our local copy of the content with the source String and set
    //  the dirty flag to false.
    this.set('localSourceContent', sourceText);
    this.isDirty(false);

    editor.setValue(sourceText);

    //  Revert our current source object with the source object as the server
    //  sees it.
    sourceObj = sourceObj.replaceWith(serverSourceObj);

    //  NB: We use '$set()' here to avoid calling our setter and blowing other
    //  references away.
    this.$set('sourceObject', sourceObj);

    //  Force an update of the 'dirty' flag here. Because of how apply vs. push
    //  vs. revert vs. refresh works, the dirty flag might have already been
    //  false when we set isDirty(false) above, but we need other components,
    //  like the toolbar, to refresh based on not just our dirty state, but our
    //  source's dirty state.
    this.changed('dirty');

    /* eslint-disable no-extra-parens */
    (function() {

        //  editor.scrollUsingLastScrollInfo();

        //  Signal to observers that this control has rendered.
        this.signal('TP.sig.DidRender');

    }).queueBeforeNextRepaint(this.getNativeWindow());
    /* eslint-enable no-extra-parens */

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.methodeditor.Inst.defineMethod('setSourceObject',
function(anObj) {

    /**
     * @method setSourceObject
     * @summary Sets the source object (a method Function) of the receiver to
     *     the supplied object.
     * @param {Function} anObj The object to set as the source object that the
     *     receiver will edit.
     * @returns {TP.lama.methodeditor} The receiver.
     */

    var sourceURI;

    //  Grab the current source URI and ignore it for changes. This is important
    //  because we observe the source URI whenever it gets set on the receiver.
    if (TP.isURI(sourceURI = this.get('sourceURI'))) {
        this.ignore(sourceURI, TP.ac('TP.sig.ValueChange', 'DirtyChange'));
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
    this.observe(sourceURI, TP.ac('TP.sig.ValueChange', 'DirtyChange'));

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

TP.lama.methodeditor.Inst.defineMethod('teardown',
function() {

    /**
     * @method teardown
     * @summary Tears down the receiver by performing housekeeping cleanup, like
     *     ignoring signals it's observing, etc.
     * @returns {TP.lama.methodeditor} The receiver.
     */

    this.callNextMethod();

    this.$set('sourceObject', null, false);
    this.$set('serverSourceObject', null, false);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
