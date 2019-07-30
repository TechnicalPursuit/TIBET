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

TP.sherpa.urieditor.Inst.defineAttribute('loadheaders');
TP.sherpa.urieditor.Inst.defineAttribute('saveheaders');

TP.sherpa.urieditor.Inst.defineAttribute('$pathParts');
TP.sherpa.urieditor.Inst.defineAttribute('$schemaContent');

TP.sherpa.urieditor.Inst.defineAttribute('head',
    TP.cpc('> .head', TP.hc('shouldCollapse', true)));

TP.sherpa.urieditor.Inst.defineAttribute('body',
    TP.cpc('> .body', TP.hc('shouldCollapse', true)));

TP.sherpa.urieditor.Inst.defineAttribute('foot',
    TP.cpc('> .foot', TP.hc('shouldCollapse', true)));

TP.sherpa.urieditor.Inst.defineAttribute('panelBox',
    TP.cpc('> .body > xctrls|panelbox', TP.hc('shouldCollapse', true)));

TP.sherpa.urieditor.Inst.defineAttribute('editor',
    TP.cpc('> .body xctrls|codeeditor', TP.hc('shouldCollapse', true)));

TP.sherpa.urieditor.Inst.defineAttribute('schemaDisplay',
    TP.cpc('> .body .schemaDisplay', TP.hc('shouldCollapse', true)));

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
    sourceURI.setContent(newSourceText, TP.request(
        'resultType', TP.CONTENT,
        'contentType', TP.core.Content));

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

TP.sherpa.urieditor.Inst.defineMethod('$computeDetachedValueAndName',
function() {

    /**
     * @method $computedDetachedValueAndName
     * @summary Computes the receiver's 'value' and 'name' that will be used by
     *     the control that it is being detached into
     * @returns {String[]} A pair with the value as the item in the first
     *     position and the name as the item in the last position.
     */

    var sourceURI,
        sourceLoc,

        tabValue,
        tabName;

    //  Grab our source URI's location.
    sourceURI = this.get('sourceURI');
    sourceLoc = sourceURI.getLocation();

    //  The value will be our source location, which is unique.
    tabValue = sourceLoc;

    //  The name is the URL end location.
    tabName = sourceLoc.slice(sourceLoc.lastIndexOf('/') + 1);

    return TP.ac(tabValue, tabName);
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
     * @returns {Boolean|undefined} The current flag state.
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

TP.sherpa.urieditor.Inst.defineMethod('getConnectorData',
function(aSourceTPElement) {

    /**
     * @method getConnectorData
     * @summary Returns data for a connector dragging session. This is called by
     *     the Sherpa infrastructure to supply data when the connector has
     *     successfully connected and data about the connector source is needed.
     * @param {TP.dom.ElementNode} aSourceTPElement The source element that the
     *     connection was dragged from.
     * @returns {TP.core.Hash|null} The data to be used for this connector
     *     dragging session.
     */

    var dataIndex,

        pathParts,
        fragParts,

        sourceURI,
        uriMIMEType,

        schema,

        propInfo,

        isLeaf,

        loc,
        uriWithFrag;

    //  Grab the index of the data from the source element and convert it to a
    //  Number.
    dataIndex = TP.pick(aSourceTPElement, '@dataindex', Number);

    //  If we got a valid number, then grab the data that we computed when we
    //  drew the schema view.
    if (TP.isNumber(dataIndex)) {

        //  Make sure to copy this array as we might be modifying it below.
        pathParts = TP.copy(this.get('$pathParts').at(dataIndex));

        //  Build a URI with a fragment that includes all our path parts.

        fragParts = TP.copy(pathParts);

        sourceURI = this.get('sourceURI');
        uriMIMEType = sourceURI.getMIMEType();

        //  If we're currently displaying content from a JSON URL, then we can
        //  use JSONPath-specific separators.
        if (uriMIMEType === TP.JSON_ENCODED) {

            //  Query the schema content for the data type of the property at
            //  the end of our path.
            schema = this.get('$schemaContent');

            //  Populate all of the schema property names (and their sub
            //  property names) into an empty hash.
            propInfo = TP.hc();
            schema.populateSchemaPropertyNamesInto(propInfo);

            //  Query the schema to determine whether the path leads to a
            //  property that has other properties. We want to know whether
            //  we're dealing with a 'leaf' property or not.
            isLeaf = !schema.schemaPropertyHasSubproperties(
                                                pathParts.join('.'));

            //  If the path parts don't start with '$', unshift one on. We need
            //  this to form correct JSONPaths.
            if (pathParts.first() !== '$') {
                fragParts.unshift('$');
            }
        }

        //  Unshift the location of the source URI onto the Array of fragment
        //  parts.
        fragParts.unshift(sourceURI.getLocation());

        //  Compute a location from the fragment parts and create a URI from it.
        //  This will be the URI that is used as the 'source URI' that
        //  represents the data chunk that the connector was dragged from.
        loc = TP.uriJoinFragments.apply(TP, fragParts);
        uriWithFrag = TP.uc(loc);

        return TP.hc('sourceURI', uriWithFrag,
                        'propInfo', propInfo,
                        'isLeaf', isLeaf);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineHandler('DetachIntoConsoleTab',
function(aSignal) {

    /**
     * @method handleDetachIntoConsoleTab
     * @summary Handles when the user has clicked the 'detach' arrow button to
     *     detach ourself into a Sherpa console tab.
     * @param {TP.sig.ResourceApply} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.urieditor} The receiver.
     */

    var sourceURI,

        console,
        inspector,

        detachedValueAndName,
        newPanel,
        editorLID,
        panelContentElem,
        toolbar,
        toolbarContent,
        tdcDrawer,
        elem;

    sourceURI = this.get('sourceURI');

    //  Since we're going to change our ID, we need to ignore these signals
    //  coming from the sourceURI and re-observe at the end of this method when
    //  we're done doing that.
    this.ignore(sourceURI, TP.ac('TP.sig.ValueChange', 'DirtyChange'));

    console = TP.byId('SherpaConsole', this.getNativeWindow());
    inspector = TP.byId('SherpaInspector', this.getNativeWindow());

    //  Compute the value and name for the receiver that it will use as the name
    //  and value for the tab.
    detachedValueAndName = this.$computeDetachedValueAndName();

    //  Ask the console to create a new console tab with that value and name.
    //  This will return the new panel that we can add content to it. Note here
    //  how we pass true so that a profile entry is made for this tab for when
    //  the profile is saved.
    newPanel = console.makeNewConsoleTabPanel(
                    detachedValueAndName.first(),
                    detachedValueAndName.last(),
                    true);

    //  We don't want moving this object and it's toolbar around in the DOM to
    //  cause mutation signals to be processed.
    newPanel.setAttribute('tibet:nomutationtracking', 'true');

    //  Compute a unique ID for the editor, based on the number of tabs that are
    //  already in the console tab view.
    editorLID = 'editor_' + (console.getTabCount() - 1);

    //  Grab the 'xctrls:content' element from it.
    panelContentElem = newPanel.get('contentElement').getNativeNode();

    //  First we move the toolbar content that is already in inspector down into
    //  our tab panel content.

    //  Grab the inspector's tab control and the content under it. This will
    //  have been placed by the inspector when this editor was first shown
    toolbar = TP.byId('SherpaToolbar', this.getNativeWindow());
    toolbarContent = toolbar.getFirstChildElement();

    //  Grab the toolbar's native element and reset the 'tibet:ctrl' attribute
    //  (used for dispatching responder signals) to the new unique ID that we
    //  computed above so that responder signals from this particular toolbar
    //  will go to the right place (ourself, via our new ID).
    elem = TP.unwrap(toolbarContent);
    TP.elementSetAttribute(elem, 'tibet:ctrl', editorLID, true);
    TP.elementAddClass(elem, 'tabbed');

    //  Move the toolbar into place in our panel content.
    TP.nodeAppendChild(panelContentElem, elem, false);

    //  Grab our native element and reset the 'id' to the new unique ID that we
    //  computed above. This will tie us together with the toolbar via it's
    //  now-reset 'tibet:ctrl' attribute above.
    elem = TP.unwrap(this);
    TP.elementSetAttribute(elem, 'id', editorLID, true);

    //  Remove our bind:in so that we're no longer bound - we don't want to
    //  change along with the inspector anymore ;-).
    TP.elementRemoveAttribute(elem, 'bind:in', editorLID);

    //  Add a class of 'tabbed' and move ourself into place in our panel
    //  content.
    TP.elementAddClass(elem, 'tabbed');
    TP.nodeAppendChild(panelContentElem, elem, false);

    //  Re-run the toolbar's setup  This will cause the toolbar to adjust its
    //  signal observations, etc. based on the new DOM structure.
    toolbarContent.setup();

    //  Repopulate the current bay content. This should cause a message to
    //  display to the user that the content can now be found in the tabbed
    //  view.
    inspector.repopulateBay();

    //  Signal TDC drawer to open
    tdcDrawer = TP.byCSSPath('#south', TP.sys.getUIRoot(), true);
    if (TP.isValid(tdcDrawer)) {
        TP.signal(tdcDrawer, 'UIOpen');
    }

    //  Re-observe our source URI for changes, now that we've changed our ID.
    this.observe(sourceURI, TP.ac('TP.sig.ValueChange', 'DirtyChange'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineHandler('DirtyChange',
function(aSignal) {

    /**
     * @method handleDirtyChange
     * @summary Handles when the source object's 'dirty' state changes.
     * @param {TP.sig.DirtyChange} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.urieditor} The receiver.
     */

    if (this.get('$changingSourceContent')) {
        return this;
    }

    //  NB: render could be an asynchronous operation
    this.render();

    return this;
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

TP.sherpa.urieditor.Inst.defineHandler('ShowData',
function(aSignal) {

    /**
     * @method handleShowData
     * @summary Handles when the user has chose the 'data' radio button to show
     *     the JSON data in the URI (if the URI has JSON as its content).
     * @param {TP.sig.ShowData} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.urieditor} The receiver.
     */

    //  Switch the panel box to the 'data' panel.
    this.get('panelBox').set('value', 'data');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineHandler('ShowSchema',
function(aSignal) {

    /**
     * @method handleShowSchema
     * @summary Handles when the user has chose the 'schema' radio button to
     *     show the JSON schema in the URI (if the URI has JSON as its content).
     * @param {TP.sig.ShowSchema} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.urieditor} The receiver.
     */

    var displayElem,

        editor,
        editorValue,

        jsonData,

        pojoSchema,

        schemaContent,
        schemaText,

        pathParts;

    //  Switch the panel box to the 'data' panel.
    this.get('panelBox').set('value', 'schema');

    //  Grab the element to display the schema in.
    displayElem = TP.unwrap(this.get('schemaDisplay'));

    //  Grab the value from the editor
    editor = this.get('editor');
    editorValue = editor.getValue();

    //  Create a JavaScript version of the JSON editor value.
    jsonData = TP.json2js(editorValue);

    if (TP.notValid(jsonData)) {
        displayElem.innerHTML = TP.sc('Not valid JSON');
        return this;
    }

    //  Build a 'plain object' full of JSON Schema of that data.
    pojoSchema = TP.json.JSONSchema.buildSchemaFrom(jsonData);
    if (TP.notValid(pojoSchema)) {
        displayElem.innerHTML = TP.sc('Could not build JSON Schema');
        return this;
    }

    //  Build a content object with the POJO schema data.
    schemaContent = TP.json.JSONSchemaContent.construct(TP.json(pojoSchema));
    this.set('$schemaContent', schemaContent, false);

    //  Grab a JSON String version of it.
    schemaText = TP.json(pojoSchema);

    pathParts = TP.ac();
    this.set('$pathParts', pathParts, false);

    //  Run a JSON formatter on the resultant schema text and have XHTML as the
    //  desired output format.
    schemaContent = TP.sherpa.pp.runFormattedJSONModeOn(
        schemaText,
        TP.XHTML_ENCODED,
        function(srcText, keyPath) {

            var propNames,

                infoNum,

                str;

            //  If the second to last item in the key path is the word
            //  'properties', then we tag this source as being a 'property
            //  name'.
            if (keyPath.slice(-2, -1).first() === 'properties') {
                propNames = keyPath.collect(
                    function(aKey, index) {
                        if (keyPath.at(index - 1) === 'properties') {
                            return aKey;
                        }
                        return null;
                    });

                //  Remove all of nulls from the propNames Array and push it
                //  onto the Array of path parts that we're maintaining.
                propNames = propNames.removeValue(null);
                pathParts.push(propNames);

                //  Compute an XHTML span that will have various attributes
                //  tagging it as a connector source for data bindings and will
                //  also mark the index of where property data can be found in
                //  the overall Array of path parts that we're tracking.
                infoNum = pathParts.getSize() - 1;
                str = '<span class="jsonPropName"' +
                        ' sherpa:connector-vend="bindingsource"' +
                        ' sherpa:connector-source="inspectorEditor"' +
                        ' dataindex="' + infoNum + '">' +
                        srcText.asEscapedXML() +
                        '</span>';

                return str;
            }

            return srcText.asEscapedXML();
        });

    displayElem.innerHTML = schemaContent;

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

    var uri;

    uri = this.get('sourceURI');

    if (TP.isURI(uri)) {
        return uri.isDirty();
    }

    return false;
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
    extraHeaders = this.get('saveheaders');
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

            //  Let the editor know that the push succeeded.
            this.pushResourceSucceeded(aResponse);
        }.bind(this));

    saveRequest.defineHandler('RequestFailed',
        function(aResponse) {

            //  Let the editor know that the push failed.
            this.pushResourceFailed(aResponse);
        }.bind(this));

    saveRequest.defineHandler('RequestCompleted',
        function(aResponse) {
            //  empty
        });

    //  Make sure to let the save request know that we're not interested in
    //  serializing 'xmlns:' attributes.
    saveRequest.atPut('serializationParams',
                        TP.hc('wantsPrefixedXMLNSAttrs', false,
                                'lockStore', true));

    //  Do the deed.
    sourceURI.save(saveRequest);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('pushResourceFailed',
function(aResponse) {

    /**
     * @method pushResourceFailed
     * @summary Invoked when pushing to the server failed.
     * @param {TP.sig.Response} aResponse The response for the request that
     *     failed.
     * @returns {TP.sherpa.urieditor} The receiver.
     */

    //  Notify the user of failure
    TP.bySystemId('SherpaConsoleService').notify(
        'Resource FAILED saving to: ' +
                this.get('sourceURI').getLocation());

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.urieditor.Inst.defineMethod('pushResourceSucceeded',
function(aResponse) {

    /**
     * @method pushResourceSucceeded
     * @summary Invoked when pushing to the server succeeded.
     * @param {TP.sig.Response} aResponse The response for the request that
     *     succeeded.
     * @returns {TP.sherpa.urieditor} The receiver.
     */

    //  Notify the user of success
    TP.bySystemId('SherpaConsoleService').notify(
        'Resource successfully saved to: ' +
                this.get('sourceURI').getLocation());

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

    //  Grab our source URI's resource. Note that we *always* configure this to
    //  be an asynchronous fetch due to the fact that, we're *not* refreshing
    //  from the server, but we may change the result higher 'up' in the stack
    //  and we want the result provided to the then() to be the latest. Note
    //  also that we specify that we want the result wrapped in some sort of
    //  TP.core.Content instance.

    getParams = TP.hc(
        'resultType', TP.CONTENT,
        'contentType', TP.core.Content,
        'async', true);

    //  If any extra load headers were configured on ourself as an attribute,
    //  then they'll be in this instance variable. Add them to the get
    //  parameters.
    extraHeaders = this.get('loadheaders');
    if (TP.notEmpty(extraHeaders)) {
        getParams.addAll(extraHeaders);
    }

    sourceResource = sourceURI.getResource(getParams);

    sourceResource.then(
        function(sourceResult) {

            var sourceStr,
                mimeType,

                themeName;

            //  Now that we're done reverting the content, we can unset the
            //  'changing content' flag.
            this.set('$changingSourceContent', false);

            //  If we don't have a valid result, then just set both our local
            //  version of the source content and the editor display value to
            //  the empty String and return. Nothing else to do here.
            //  NB: We use TP.notValid here rather than TP.isEmpty since, if we
            //  have an empty Element, we still want to display it.
            if (TP.notValid(sourceResult)) {

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
                                    TP.hc('wantsPrefixedXMLNSAttrs', false,
                                            'lockStore', true));

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

            if (TP.isKindOf(sourceURI, TP.uri.URL)) {

                //  Try to get a MIME type from the URL - if we can't, then we
                //  just treat the content as plain text.
                if (TP.isEmpty(mimeType = sourceURI.getMIMEType())) {
                    mimeType = TP.PLAIN_TEXT_ENCODED;
                }

                //  CodeMirror won't understand XHTML as distinct from XML.
                if (mimeType === TP.XHTML_ENCODED) {
                    mimeType = TP.XML_ENCODED;
                }
            } else {
                if (TP.isKindOf(sourceResult, TP.core.Content)) {
                    mimeType = sourceResult.getContentMIMEType();
                    if (mimeType === TP.OCTET_ENCODED) {
                        if (TP.isJSONString(sourceStr)) {
                            mimeType = TP.JSON_ENCODED;
                        } else if (TP.isXMLString(sourceStr)) {
                            mimeType = TP.XML_ENCODED;
                        }
                    }
                } else if (TP.regex.FUNCTION_LITERAL.test(sourceResult)) {
                    mimeType = TP.JS_TEXT_ENCODED;
                } else {
                    mimeType = TP.PLAIN_TEXT_ENCODED;
                }
            }

            //  If the content was JSON encoded, then try to format it using the
            //  'plain text encoding' (i.e. newlines and spaces). CodeMirror
            //  will format that into the proper markup for display.
            if (mimeType === TP.JSON_ENCODED) {
                sourceStr = TP.sherpa.pp.runFormattedJSONModeOn(
                            sourceStr,
                            TP.hc('outputFormat', TP.PLAIN_TEXT_ENCODED));
            }

            editor.setEditorModeFromMIMEType(mimeType);

            themeName = TP.sys.cfg('sherpa.rich_input_theme', 'dawn');
            editor.setEditorTheme('ace/theme/' + themeName);

            editor.unsetEditorEventHandler('change', this.get('changeHandler'));
            editor.setValue(sourceStr);
            editor.setEditorEventHandler('change', this.get('changeHandler'));

            //  Initialize our local copy of the content with the source String
            //  and set the dirty flag to false.
            this.set('localSourceContent', sourceStr);

            //  Update the editor's state, including its dirty state.
            this.isDirty(false);
            this.changed('dirty', TP.UPDATE);

            /* eslint-disable no-extra-parens */
            (function() {
                editor.focus();

                //  Signal to observers that this control has rendered.
                this.signal('TP.sig.DidRender');

            }.bind(this)).queueForNextRepaint(this.getNativeWindow());
            /* eslint-enable no-extra-parens */

            return this;
        }.bind(this)).catch(
        function(err) {
            var sourceLoc;

            //  We had an error reverting the content, but make sure we unset
            //  the 'changing content' flag.
            this.set('$changingSourceContent', false);

            sourceLoc = sourceURI.getLocation();

            //  Alert to the user that the content at the location cannot be
            //  loaded.
            TP.alert(TP.sc('The content at: ',
                            sourceLoc,
                            ' could not be loaded.')).then(
                    function() {
                        var sherpaConsole,
                            tabHasValue;

                        //  If the location has a tab in the console, then ask
                        //  the user if they want to remove it.

                        sherpaConsole = TP.byId('SherpaConsole',
                                                TP.sys.getUIRoot());

                        tabHasValue = sherpaConsole.hasTabForValue(sourceLoc);

                        if (tabHasValue) {
                            TP.confirm('Remove tabbed editor entry?').then(
                                function(shouldRemove) {

                                    //  Message the Sherpa console object to
                                    //  remove the tab panel. This will also
                                    //  save the user's profile to make the
                                    //  change permanent.
                                    if (shouldRemove) {
                                        sherpaConsole.removeConsoleTabPanel(
                                                                    sourceLoc);
                                    }
                                });
                        }
                    });
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
    //  editor.captureCurrentScrollInfo();

    //  If we're refreshing from the server, then just configure the get
    //  parameters that way.
    if (refresh) {
        getParams = TP.hc(
            'resultType', TP.CONTENT,
            'contentType', TP.core.Content,
            'refresh', true);
    } else {
        //  Grab our source URI's resource. Note that we *always* configure this
        //  to be an asynchronous fetch due to the fact that, we're *not*
        //  refreshing from the server, but we may change the result higher 'up'
        //  in the stack and we want the result provided to the then() to be the
        //  latest. Note also that we specify that we want the result wrapped in
        //  some sort of TP.core.Content instance.
        getParams = TP.hc(
            'resultType', TP.CONTENT,
            'contentType', TP.core.Content,
            'async', true);
    }

    //  If any extra load headers were configured on ourself as an
    //  attribute, then they'll be in this instance variable. Add them to
    //  the get parameters.
    extraHeaders = this.get('loadheaders');
    if (TP.notEmpty(extraHeaders)) {
        getParams.addAll(extraHeaders);
    }

    sourceResource = sourceURI.getResource(getParams);

    sourceResource.then(
        function(sourceResult) {

            var sourceStr;

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
                                    TP.hc('wantsPrefixedXMLNSAttrs', false,
                                            'lockStore', true));

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

            editor.unsetEditorEventHandler('change', this.get('changeHandler'));
            editor.setValue(sourceStr);
            editor.setEditorEventHandler('change', this.get('changeHandler'));

            //  Initialize our local copy of the content with the source String
            //  and set the dirty flag to false.
            this.set('localSourceContent', sourceStr);

            if (refresh) {
                sourceURI.processRefreshedContent();
            }

            //  Update the editor's state, including its dirty state.
            this.isDirty(false);
            this.changed('dirty', TP.UPDATE);

            /* eslint-disable no-extra-parens */
            (function() {
                editor.focus();
                //  editor.scrollUsingLastScrollInfo();

                //  Signal to observers that this control has rendered.
                this.signal('TP.sig.DidRender');

            }.bind(this)).queueForNextRepaint(this.getNativeWindow());
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

    detachMark = TP.byCSSPath('> .detach_mark',
                                this.getNativeNode(),
                                true,
                                false);
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
     * @param {TP.uri.URI} anObj The object to set as the source object that
     *     the receiver will edit.
     * @returns {TP.sherpa.urieditor} The receiver.
     */

    var sourceURI;

    //  Grab the current source URI and ignore it for changes. This is important
    //  because we observe the source URI whenever it gets set on the receiver.
    if (TP.isURI(sourceURI = this.get('sourceURI'))) {
        this.ignore(sourceURI, TP.ac('TP.sig.ValueChange', 'DirtyChange'));
    }

    sourceURI = anObj;

    if (!TP.isURI(sourceURI)) {

        //  NB: render could be an asynchronous operation
        this.render();

        return this;
    }

    //  Observe the source URI for changes.
    this.observe(sourceURI, TP.ac('TP.sig.ValueChange', 'DirtyChange'));

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

    var editor,
        readyHandler,

        attrVal,

        panelBox;

    editor = this.get('editor');

    if (!editor.isReadyToRender()) {
        readyHandler = function() {
            readyHandler.ignore(editor, 'TP.sig.DOMReady');

            this.setup();
        }.bind(this);

        readyHandler.observe(editor, 'TP.sig.DOMReady');

        return this;
    }

    editor.setWrap(true);

    //  Set a change handler that will be installed on our underlying editor
    //  object that will pdate the editor's state, including its dirty state,
    //  when the user changes the content of the editor.
    this.set('changeHandler', this.updateEditorState.bind(this));

    editor.setEditorEventHandler('change', this.get('changeHandler'));

    //  If there are an 'extra load headers' defined on ourself as an attribute,
    //  grab and store them.
    attrVal = this.getAttribute('loadheaders');
    if (TP.notEmpty(attrVal)) {

        //  Convert the JSON-y like value into real JSON
        attrVal = TP.reformatJSToJSON(attrVal);
        if (TP.isJSONString(attrVal)) {
            this.set('loadheaders', TP.json2js(attrVal));
        }
    }

    //  If there are an 'extra save headers' defined on ourself as an attribute,
    //  grab and store them.
    attrVal = this.getAttribute('saveheaders');
    if (TP.notEmpty(attrVal)) {

        //  Convert the JSON-y like value into real JSON
        attrVal = TP.reformatJSToJSON(attrVal);
        if (TP.isJSONString(attrVal)) {
            this.set('saveheaders', TP.json2js(attrVal));
        }
    }

    //  If we have a panel box, start with it switched to the 'data' panel.
    panelBox = this.get('panelBox');
    if (TP.isValid(panelBox)) {
        panelBox.set('value', 'data');
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
     * @returns {Boolean} Whether or not the value was changed from the value it
     *     had before this method was called.
     */

    if (this.get('$changingSourceContent')) {
        return false;
    }

    if (!TP.isValid(aValue)) {
        this.teardown();

        return true;
    }

    //  NB: This will call render()
    this.setSourceObject(aValue);

    //  Focus the editor. Note this is done in a setTimeout to allow the GUI to
    //  'settle'.
    setTimeout(
        function() {

            var editor,

                inspector,

                extraInfo,
                findContent;

            editor = this.get('editor');
            editor.focus();

            inspector = TP.byId('SherpaInspector', this.getNativeWindow());

            extraInfo = inspector.get('extraTargetInfo');

            if (TP.notEmpty(extraInfo)) {

                findContent = extraInfo.at('findContent');

                if (TP.notEmpty(findContent)) {
                    editor.findAndScrollTo(findContent);
                }
            }

        }.bind(this), TP.sys.cfg('editor.select.delay', 50));

    return true;
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

    var currentEditorStr,

        localSourceStr;

    currentEditorStr = this.get('editor').getValue();

    //  Make sure we have a local copy of the source content to compare against,
    //  (i.e. it's valid) or we'll always show as 'dirty' ;-).
    if (TP.notValid(localSourceStr = this.get('localSourceContent'))) {
        return this;
    }

    this.isDirty(currentEditorStr !== localSourceStr);

    //  We need to signal that we are not dirty - we're not really dirty
    //  anyway, since the applyResource() above set us to not be dirty,
    //  but there are controls that rely on us signaling when either us
    //  or our sourceURI's 'dirty' state changes.
    this.changed('dirty', TP.UPDATE);

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

    var sourceURI;

    //  Grab the current source URI and ignore it for changes. This is important
    //  because we observe the source URI whenever it gets set on the receiver.
    if (TP.isURI(sourceURI = this.get('sourceURI'))) {
        this.ignore(sourceURI, TP.ac('TP.sig.ValueChange', 'DirtyChange'));
    }

    this.get('editor').unsetEditorEventHandler(
                        'change', this.get('changeHandler'));

    this.$set('editor', null, false);
    this.$set('changeHandler', null, false);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
