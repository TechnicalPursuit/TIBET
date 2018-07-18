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
 * @type {TP.dom.UIElementNode}
 * @summary TP.dom.UIElementNode is the common supertype for all UI node
 *     types. In particular, this includes the entire html: tree and most of
 *     the xctrls: namespace, which constitute the majority of UI nodes in
 *     TIBET.
 */

//  ========================================================================
//  TP.dom.UIElementNode
//  ========================================================================

TP.dom.ElementNode.defineSubtype('UIElementNode');

//  need a node of a specific subtype, almost always a node in a specific
//  namespace such as html:
TP.dom.UIElementNode.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  The map of keys to signals for any keybindings for this type.
TP.dom.UIElementNode.Type.defineAttribute('keybindings');

//  Whether or not resources like style are inlined
TP.dom.UIElementNode.Type.defineAttribute('resourcesInlined');

//  The Array of loaded stylesheet element GIDs
TP.dom.UIElementNode.Type.defineAttribute('loadedStylesheetDocumentGIDs');

//  The attributes that are toggleable on this type and subtypes. By default,
//  no states are toggleable.
TP.dom.UIElementNode.Type.defineAttribute('toggleableStateNames', TP.ac());

//  Note how these properties are TYPE_LOCAL, by design.

//  The TP.dom.UIElementNode that focus is moving to, based on TIBET
//  calculations.
TP.dom.UIElementNode.defineAttribute('$calculatedFocusingTPElem');

//  The Element that the system is trying to move the focus to because we're
//  manually focusing on an Element, but which TIBET will do its best to prevent
//  in favor of the TIBET-calculated element (i.e. focus/blur events are not
//  cancellable - sigh).
TP.dom.UIElementNode.defineAttribute('$manuallyFocusingElement');
TP.dom.UIElementNode.defineAttribute('$manuallyBlurringElement');

//  The currently calculated focus context
TP.dom.UIElementNode.defineAttribute('$calculatedFocusContext');

//  Whether or not focus is shifting because of a mouse click/down/up
TP.dom.UIElementNode.defineAttribute('$focusingViaMouseEvent');

//  The element that was the last activated.
TP.dom.UIElementNode.defineAttribute('$lastActiveElement');

//  Whether or not we're switching focus contexts in an asynchronous fashion.
TP.dom.UIElementNode.defineAttribute('$asyncSwitchingContexts');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('$addStylesheetResource',
function(aDocument, sheetElemID, aStyleURI) {

    /**
     * @method $addStylesheetResource
     * @summary Finds the receiver's stylesheet resource and adds to the
     *     supplied document. If the stylesheet is already present, this method
     *     will *not* add another instance.
     * @param {Document} aDocument Document to add the stylesheet resource to.
     * @param {String} sheetElemID The ID to use as the stylesheet element ID.
     * @param {String} aStyleURI The stylesheet URI to use as the source of the
     *     style content.
     * @returns {Element|undefined} The newly inserted style element containing
     *     the stylesheet resource or null if no new style element was added
     *     because an existing one was found.
     * @exception TP.sig.InvalidDocument Raised when an invalid Document is
     *     provided to the method.
     */

    var styleURI,
        styleLoc,

        styleElem,

        docHead,
        existingStyleElems,
        insertionPoint,

        inlined,

        inlinedStyleElem,
        fetchOptions,
        inlineStyleContent,

        insertedStyleElem;

    if (!TP.isDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    //  First, see if another occurrence of this UI element node (and which
    //  uses this same stylesheet) has already been processed and has placed
    //  that stylesheet in the document. We don't want the same stylesheet
    //  placed into the document over and over for each occurrence of the
    //  same type of element node.
    if (TP.isElement(styleElem = TP.byId(sheetElemID, aDocument, false))) {
        return;
    }

    //  Capture this into a local since we may reassign it below.
    styleURI = aStyleURI;

    styleLoc = styleURI.getLocation();

    //  Make sure we have a 'head' element and query it for existing 'style'
    //  elements.
    docHead = TP.documentEnsureHeadElement(aDocument);

    //  Initially, set insertionPoint to null (which is the same as doing an
    //  append child).
    insertionPoint = null;

    //  Start by looking for style elements that have a 'tibet:originalhref' on
    //  them - these will have been placed here by the system as part of
    //  processing, possibly inline processing.
    existingStyleElems = TP.byCSSPath('> style[tibet|originalhref]',
                                        docHead,
                                        false,
                                        false);

    //  If we found one, use the *nextSibling* after the last one as the
    //  insertion point (i.e. the place where we want to 'insert before').
    if (TP.notEmpty(existingStyleElems)) {
        insertionPoint = existingStyleElems.last().nextSibling;
    } else {

        //  Otherwise, if there were existing style elements (without a
        //  'tibet:originalhref they were most likely hand authored by the page
        //  author), we choose the first one as our insertion point.

        //  This is done because stylesheets added using this mechanism should
        //  come before any further stylesheet elements in the page, which have
        //  probably been added by the page author to further customize the
        //  style and that style should have higher precedence than the style
        //  we're adding here.
        existingStyleElems = TP.nodeGetElementsByTagName(docHead, 'style');

        if (TP.notEmpty(existingStyleElems)) {
            insertionPoint = existingStyleElems.first();
        }
    }

    //  If the system is running with inlined resources we create 'style'
    //  elements rather than 'link' elements for CSS files.
    inlined = TP.uriIsInlined(styleLoc);

    //  If we're inlined and pointed at LESS files redirect to their CSS
    //  counterpart. Part of inlining is that we serve compiled/cached CSS.
    if (inlined && styleURI.getExtension() === 'less') {
        styleURI = TP.uc(styleURI.getLocation().replace(/less$/, 'css'));
        styleLoc = styleURI.getLocation();
    }

    //  We don't support packaging for other kinds of files besides pure CSS.
    //  Other styling languages (i.e. LESS) must be translated into native CSS
    //  in order to take advantage of inlined mode.
    if (styleURI.getMIMEType() !== TP.CSS_TEXT_ENCODED) {
        inlined = false;
    }

    //  We track whether our resources are inlined or not.
    this.set('resourcesInlined', inlined);

    if (inlined) {

        //  First, see if we've processed this style URI before.
        inlinedStyleElem = TP.byCSSPath('html|style[tibet|originalhref=' +
                                            '"' +
                                            styleURI.getOriginalSource() +
                                            '"]',
                                        aDocument,
                                        true,
                                        false);

        //  If so, we can just exit here.
        if (TP.isElement(inlinedStyleElem)) {
            return;
        }

        //  Fetch content from the URI's resource

        //  Note how we force 'refresh' to false, since we'll be reading
        //  from inlined content.
        fetchOptions = TP.hc('async', false,
                                'resultType', TP.TEXT,
                                'refresh', false);
        inlineStyleContent = styleURI.getResource(fetchOptions).get('result');

        //  Set the content of a new style element that contains the inlined
        //  style, resolving @import statements and possible rewriting
        //  CSS url(...) values.
        inlinedStyleElem = TP.documentInlineCSSURIContent(
                                        aDocument,
                                        styleURI,
                                        inlineStyleContent,
                                        insertionPoint);

        if (TP.notEmpty(sheetElemID)) {

            //  Make sure also to set the style element's 'id' attribute, so
            //  that the above 'uniquing' logic will work for future occurrences
            //  of this element being processed (which ensures that we don't add
            //  the same element more than once).
            TP.elementSetAttribute(inlinedStyleElem,
                                    'id',
                                    sheetElemID,
                                    true);
        }

        insertedStyleElem = inlinedStyleElem;

    } else {

        //  Otherwise, since it very well may have TIBET-isms (i.e. be a 'TIBET
        //  CSS' kind of CSS)  - set up a 'tibet:style' element, with a type
        //  that denotes that, and let the processing machinery handle it.
        styleElem = TP.documentConstructElement(
                        aDocument,
                        'tibet:style',
                        TP.w3.Xmlns.TIBET);

        TP.elementSetAttribute(styleElem, 'href', styleLoc, true);
        TP.elementSetAttribute(styleElem, 'type', TP.ietf.mime.TIBET_CSS, true);

        //  Make sure also to set the style element's 'id' attribute, so that
        //  the above 'uniquing' logic will work for future occurrences of this
        //  element being processed (which ensures that we don't add the same
        //  element more than once).

        //  Note also how we do this *before* we insert/awaken the content - if
        //  the system hasn't started and the content needs to be awakened (see
        //  below), the awaken machinery will set up an observation on this
        //  element's URI - we want that to be set up using the proper ID.
        TP.elementSetAttribute(styleElem, 'id', sheetElemID, true);

        //  Make sure to set the 'shouldAwake' parameter to the inverse of
        //  whether the system has started or not. This is because, if the
        //  system has already started, the MutationObserver machinery will take
        //  care of awakening this content (i.e. the 'tibet:style' element) but
        //  if it hasn't already started, then we need to do that manually.

        //  Go ahead and insert the new element - note here how we *always*
        //  awaken the content. Because we could be being called as part of an
        //  asychronous populating of the page, it's impossible to tell if we're
        //  already part of an awaken cycle or not. But, because of our check
        //  above to determine whether we already exist, we don't have to worry
        //  about multiple awakenings.
        styleElem = TP.nodeInsertBefore(docHead,
                                        styleElem,
                                        insertionPoint,
                                        true);

        if (TP.isElement(styleElem)) {

            insertedStyleElem = styleElem;

            //  Track the original source from the URI - this is what the author
            //  originally typed and might be a virtual URI. We'd like to track
            //  it here.
            TP.elementSetAttribute(styleElem,
                                    'tibet:originalhref',
                                    styleURI.getOriginalSource(),
                                    true);
        }
    }

    //  Stamp our TIBET type name onto the newly created style element.
    TP.elementSetAttribute(
        insertedStyleElem, 'tibet:type', TP.name(this), true);

    return insertedStyleElem;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('addStylesheetTo',
function(aDocument) {

    /**
     * @method addStylesheetTo
     * @summary Adds the receiver's stylesheet to the supplied document. If the
     *     stylesheet is already present, this method will *not* add another
     *     instance.
     * @param {Document} aDocument Document to add the stylesheet to.
     * @exception TP.sig.InvalidDocument Raised when an invalid Document is
     *     provided to the method.
     * @returns {TP.meta.dom.UIElementNode} The receiver.
     */

    var computeObservationID,

        ourID,
        themeName,

        themeNewStyleElem,
        newStyleElem,

        styleURI,

        observeID,

        projectThemes,
        libThemes,
        allThemes,

        len,
        i,

        doc,

        styleElemToObserve,
        inlined;

    if (!TP.isDocument(aDocument)) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    computeObservationID = function(aStyleElem) {

        var tagName;

        //  If a 'tibet:style' element is being inserted, then that means that
        //  we're executing in a non-inlined environment that will allow
        //  alternate style content (like LESS) to be brought in directly.
        tagName = TP.elementGetFullName(aStyleElem);
        if (tagName === 'tibet:style') {
            //  The *real* stylesheet that will eventually come in when the LESS
            //  or whatever is finished processing will be the ID with the word
            //  '_generated' appended to it.
            return TP.elementGetAttribute(aStyleElem, 'id', true) +
                    '_generated';
        }

        return TP.elementGetAttribute(aStyleElem, 'id', true);
    };

    //  We compute an 'id' by taking our *resource* type name and escaping it.
    //  The resource type name is usually the type name, but can be overridden
    //  for special types that need to supply a different name here for use in
    //  resource location computations.
    ourID = TP.escapeTypeName(this.getResourceTypeName());

    //  Add any theme name we might be using. The presumption is that a theme
    //  sheet that isn't standalone will @import what it requires.

    //  Note that we try to see if the document already has a theme, which will
    //  override any application-level theme (which is computed from the current
    //  UI canvas document or system properties if a theme cannot be found
    //  there). Note that this will be either the 'project' theme or the 'lib'
    //  theme. If the 'project' theme cannot be found, then by passing true as
    //  the second parameter, the 'lib' theme will be returned, if it can be
    //  found.
    if (TP.isEmpty(themeName = TP.documentGetTheme(aDocument, true))) {
        themeName = TP.sys.getApplication().getTheme();
    }

    //  Add the core stylesheet for the receiver. Note that we supply ourID for
    //  both the unique identifier for the receiver and as the element ID to use
    //  for this stylesheet.
    styleURI = this.getResourceURI('style', TP.ietf.mime.CSS);
    if (TP.isValid(styleURI) && styleURI !== TP.NO_RESULT) {
        newStyleElem = this.$addStylesheetResource(
                                aDocument, ourID, styleURI);
    }

    observeID = null;

    //  If there is a theme, add the corresponding them stylesheet for the
    //  receiver.
    if (TP.notEmpty(themeName)) {

        //  Grab the resource URI for the theme. Note here how we specify no
        //  fallback for the resource URI, because .
        styleURI = this.getResourceURI(
                            'style_' + themeName, TP.ietf.mime.CSS, false);

        //  The themeing resource specifically indicated that it has no result,
        //  so we skip any themeing fallback here
        if (styleURI === TP.NO_RESULT) {
            //  empty
        } else {

            //  Otherwise, we were meant to get a meaningful result, but didn't.
            //  Let's try iterating through all of the other themes that the
            //  system knows about and see if there's a defined URI that
            //  matches.
            if (TP.notValid(styleURI)) {
                TP.ifWarn() ?
                    TP.warn(
                        'Couldn\'t compute a theme URI for type: ' +
                        this.getName() +
                        ' and theme: ' +
                        themeName +
                        '. Attempting fallback.') : 0;

                //  Grab all of the 'project' and 'lib' themes.
                projectThemes = TP.sys.getcfg('project.theme.list');
                libThemes = TP.sys.getcfg('tibet.theme.list');

                //  If we had a real set of 'project' themes, then copy them and
                //  set all themes to that. This allows us to consider each
                //  project theme, in order.
                if (TP.isArray(projectThemes)) {
                    allThemes = TP.copy(projectThemes);
                } else {
                    //  Otherwise, set all themes to an empty Array.
                    allThemes = TP.ac();
                }

                //  If we have 'lib' themes, then we'll consider them after all
                //  of the project themes, again in the order in which they were
                //  defined.
                if (TP.isArray(libThemes)) {
                    allThemes = allThemes.concat(TP.copy(libThemes));
                }

                //  Iterate over all of the themes. If there is a defined URI
                //  for the receiver and theme, then break.
                len = allThemes.getSize();
                for (i = 0; i < len; i++) {
                    styleURI = this.getResourceURI(
                                    'style_' + allThemes.at(i),
                                    TP.ietf.mime.CSS,
                                    false);
                    if (TP.isValid(styleURI)) {
                        break;
                    }
                }
            }

            //  Got a valid style URI? Use it.
            if (TP.isValid(styleURI)) {
                themeNewStyleElem = this.$addStylesheetResource(
                                        aDocument,
                                        ourID + '_' + themeName,
                                        styleURI);

                if (TP.isElement(themeNewStyleElem)) {
                    //  if we inserted a new style element for the theme
                    //  stylesheet, set the new style element to be that style
                    //  element.
                    newStyleElem = themeNewStyleElem;
                }
            }
        }
    }

    //  if we inserted a new style element for either the core or theme
    //  stylesheet, set the observation ID using the style element inserted for
    //  the core sheet
    if (TP.isElement(newStyleElem)) {
        observeID = computeObservationID(newStyleElem);
    }

    //  If we computed a valid observation ID, then set up the necessary
    //  observations.
    if (TP.isValid(observeID)) {

        doc = TP.nodeGetDocument(newStyleElem);

        //  If we can't find the style element that matches the observation ID,
        //  then we set up a subtree query to notify us when that element is
        //  created.
        styleElemToObserve = TP.byId(observeID, doc, false);

        inlined = TP.isTrue(this.get('resourcesInlined'));

        if (!TP.isElement(styleElemToObserve)) {

            //  We register a query that, if any subtree mutations occur under
            //  the new style element's document element, to notify any
            //  instances of this type know that the stylesheet (one that they
            //  probably rely on to render) is available.

            //  Note that this calls our 'mutationAddedFilteredNodes' method
            //  below with just the nodes that got added or removed.
            TP.sig.MutationSignalSource.addSubtreeQuery(
                                                this,
                                                TP.cpc('#' + observeID),
                                                doc);
        } else if (inlined) {

            //  If the resources are inlined, then we notify any existing
            //  instances of this type that the stylesheet has already been
            //  loaded (since loading inlined resources is a synchronous
            //  operation).
            this.$notifyInstancesThatStylesheetLoaded(
                                        TP.wrap(styleElemToObserve));
        } else {

            //  Set up a notification that will let any instances of this type
            //  know that the stylesheet (one that they probably rely on to
            //  render) is available.
            this.$notifyInstancesWhenStylesheetLoaded(
                                        TP.wrap(styleElemToObserve));
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('canHandleKey',
function(aSignal) {

    /**
     * @method canHandleKey
     * @summary Whether or not the receiver can be handle the key that
     *     generated the supplied event.
     * @param {aSignal} aSignal A signal containing key information or an actual
     *     key name.
     * @returns {Boolean} Whether or not the receiver can handle the key.
     */

    var sigNames,

        keyname,

        len,
        i;

    sigNames = aSignal.getSignalNames();

    len = sigNames.getSize();
    for (i = 0; i < len; i++) {

        //  Compute the key name by slicing off everything up through the last
        //  period ('.'). I.e. the 'TP.sig.'.
        keyname = sigNames.at(i).slice(sigNames.at(i).lastIndexOf('.') + 1);

        switch (keyname) {

            //  These are the standard keys used for activating.

            case 'DOM_Enter_Down':
            case 'DOM_Enter_Up':

                return true;

            default:
                //  Look in the keybindings map. If there's an entry there,
                //  then we handle the key.
                if (TP.notEmpty(this.getKeybinding(keyname))) {
                    return true;
                }
        }
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('populateCompilationAttrs',
function(aRequest) {

    /**
     * @method populateCompilationAttrs
     * @summary Populates attributes on the element that is produced by this
     *     type when it is compiled.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {TP.meta.dom.UIElementNode} The receiver.
     */

    var elem,

        sources,
        sourceElem,

        classes;

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return null;
    }

    //  If we have source elements, grab the first one and get it's 'class name'
    //  values.
    if (TP.isArray(sources = aRequest.getPayload().at('sources'))) {
        if (TP.isElement(sourceElem = sources.first())) {
            classes = TP.elementGetAttribute(sourceElem, 'class').split(' ');
        }
    }

    //  If we have class names, add them to the destination element if they're
    //  not already there.
    if (TP.isArray(classes)) {
        classes.forEach(
                function(aClassName) {
                    //  This will only add the class if it isn't already there.
                    TP.elementAddClass(elem, aClassName);
                });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('getKeybinding',
function(keyname) {

    /**
     * @method getKeybinding
     * @summary Returns a unique binding for a TIBET keyname by seaching the
     *     receiver's type inheritance chain for a matching binding.
     * @param {String} keyname The name of the key such as DOM_Ctrl_Z_Down.
     * @returns {String|undefined} A signal name if a matching binding is found.
     */

    var map,
        sigName,
        ancestor;

    map = this.getKeybindings();
    if (TP.isValid(map)) {
        sigName = map.at(keyname);
        if (TP.notEmpty(sigName)) {
            return sigName;
        }
    }

    ancestor = this.getSupertype();
    if (TP.canInvoke(ancestor, 'getKeybinding')) {
        return ancestor.getKeybinding(keyname);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('getKeybindings',
function() {

    /**
     * @method getKeybindings
     * @summary Returns the receiving type's unique keybinding map. This is a
     *     hash containing the specific bindings made for this particular type.
     *     Note that you cannot use this map to see all available mappings since
     *     it does not attempt to capture data from supertype maps. Use
     *     canHandleKey and/or getKeybinding to check for specific signal
     *     mappings for a key since those methods will iterate up through the
     *     supertype maps in an attempt to find a viable map entry.
     * @returns {TP.core.Hash|null} The key bindings map or null.
     */

    return this.$get('keybindings');
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('isOpaqueCapturerFor',
function(anElement, aSignal) {

    /**
     * @method isOpaqueCapturerFor
     * @summary Returns whether the elements of this type are considered to be
     *     an 'opaque capturer' for the supplied signal (i.e. it won't let the
     *     signal 'descend' further into its descendant hierarchy). This means
     *     that they will handle the signal themselves and not allow targeted
     *     descendants underneath them to handle it.
     * @description At this level, the supplied element is checked to see if it
     *     can handle a particular key signal. If so, it is considered to be an
     *     opaque capturer.
     * @param {Element} anElem The element to check for the
     *     'tibet:opaquecapturing' attribute.
     * @param {String} aSignalName The signal to check.
     * @returns {Boolean} Whether or not the receiver is opaque during the
     *     capture phase for the signal.
     */

    //  If it's a keyboard signal, we test to see if it can handle the key. If
    //  so, then this type can be considered an 'opaque capturer' for the
    //  supplied key signal.
    if (TP.isKindOf(aSignal, TP.sig.DOMKeySignal)) {
        if (this.canHandleKey(aSignal)) {
            return true;
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('getLoadedStylesheetDocumentGIDs',
function() {

    /**
     * @method getLoadedStylesheetDocumentGIDs
     * @summary Returns an Array of Document global IDs where the 'main'
     *     stylesheet of this type (either it's core stylesheet or it's themed
     *     stylesheet if the receiver is executing in a themed environment) is
     *     currently installed.
     * @returns {String[]} The Array of Document global IDs.
     */

    var gids;

    gids = this.$get('loadedStylesheetDocumentGIDs');

    if (TP.notValid(gids)) {
        gids = TP.ac();
        this.$set('loadedStylesheetDocumentGIDs', gids, false);
    }

    return gids;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('isResponderForUIFocusChange',
function(aNode, aSignal) {

    /**
     * @method isResponderForUIFocusChange
     * @summary Returns true if the node has a 'tabindex' attribute (but not if
     *     it has a 'disabled' attribute) to match (X)HTML semantics.
     * @param {Node} aNode The node to check which may have further data as to
     *     whether this type should be considered to be a responder.
     * @param {TP.sig.Signal} aSignal The signal that responders are being
     *     computed for.
     * @returns {Boolean} True when the receiver should respond to aSignal.
     */

    return TP.elementHasAttribute(aNode, 'tabindex', true) &&
            !TP.elementHasAttribute(aNode, 'disabled', true);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('isResponderForUIFocusComputation',
function(aNode, aSignal) {

    /**
     * @method isResponderForUIFocusComputation
     * @summary Returns true if the node has a 'tabindex' attribute (but not if
     *     it has a 'disabled' attribute) to match (X)HTML semantics.
     * @param {Node} aNode The node to check which may have further data as to
     *     whether this type should be considered to be a responder.
     * @param {TP.sig.Signal} aSignal The signal that responders are being
     *     computed for.
     * @returns {Boolean} True when the receiver should respond to aSignal.
     */

    return TP.elementHasAttribute(aNode, 'tabindex', true) &&
            !TP.elementHasAttribute(aNode, 'disabled', true);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('mutationAddedFilteredNodes',
function(addedNodes, queryInfo) {

    /**
     * @method mutationAddedFilteredNodes
     * @summary Handles when nodes got added to the DOM we're in, filtered by
     *     the query that we registered with the MutationSignalSource.
     * @param {Node[]} addedNodes The Array of nodes that got added to the DOM,
     *     then filtered by our query.
     * @param {TP.core.Hash} queryInfo Information that was registered for this
     *     query when it was originally set up.
     * @returns {TP.meta.dom.UIElementNode} The receiver.
     */

    var queryStr,
        queryID,

        len,
        i,

        addedNodeID;

    //  The query will be a CSS 'ID query' path object.
    queryStr = queryInfo.at('path').asString();

    //  Slice off the '#'.
    queryID = queryStr.slice(1);

    //  Iterate over all of the added nodes.
    len = addedNodes.getSize();
    for (i = 0; i < len; i++) {
        if (TP.isElement(addedNodes.at(i))) {

            //  Iterate over all of the added nodes. If the Node is an Element
            //  and it's ID matches that of the queryID, then set up a
            //  notification that will let any instances of this type know that
            //  the stylesheet (one that they probably rely on to render) is
            //  available.
            addedNodeID = TP.elementGetAttribute(addedNodes.at(i), 'id', true);
            if (addedNodeID === queryID) {

                this.$notifyInstancesWhenStylesheetLoaded(
                                                TP.wrap(addedNodes.at(i)));
            }
        }
    }

    TP.sig.MutationSignalSource.removeSubtreeQuery(this);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('$notifyInstancesThatStylesheetLoaded',
function(styleTPElem) {

    /**
     * @method $notifyInstancesThatStylesheetLoaded
     * @summary Notifies instances of the receiver that the stylesheet that they
     *     (probably) rely on to render is available.
     * @param {TP.html.style} styleTPElem The stylesheet element that got
     *     loaded.
     * @returns {TP.meta.dom.UIElementNode} The receiver.
     */

    var body,

        gids,
        existingInstances;

    //  Grab the body and, if its a real Element, then reset the CSS rule caches
    //  of all of the elements in it.
    body = TP.documentGetBody(styleTPElem.getNativeDocument());
    if (TP.isElement(body)) {
        TP.elementResetAppliedNativeStyleRules(body);
    }

    //  Add the Document global ID of the stylesheet Element to our list of
    //  where the stylesheet has been successfully installed.
    gids = this.get('loadedStylesheetDocumentGIDs');
    gids.push(styleTPElem.getDocument().getGlobalID());
    gids.unique();

    //  Grab all of the existing instances in that document and then iterate
    //  and notify them.
    existingInstances = TP.byCSSPath(
                            this.getQueryPath(true, true),
                            styleTPElem.getNativeDocument(),
                            false,
                            true);

    existingInstances.forEach(
        function(aTPElem) {
            aTPElem.stylesheetReady(styleTPElem);
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('$notifyInstancesWhenStylesheetLoaded',
function(styleTPElemToObserve) {

    /**
     * @method $notifyInstancesWhenStylesheetLoaded
     * @summary Sets up an observation on the supplied style element that will
     *     notify instances of the receiver that the stylesheet that they
     *     (probably) rely on to render is available.
     * @param {TP.html.style} styleTPElemToObserve The stylesheet element to
     *     observe for when it is loaded.
     * @returns {TP.meta.dom.UIElementNode} The receiver.
     */

    var loadedHandler;

    //  Create a loaded handler (bound to the receiver) that will notify all
    //  instances that the stylesheet has loaded.
    loadedHandler = function(aSignal) {

        var origin;

        //  Make sure to ignore() the signal once we've been notified.
        origin = aSignal.getOrigin();
        loadedHandler.ignore(origin, 'TP.sig.DOMReady');

        //  Make sure we have a real TP.xhtml.style element
        if (TP.isString(origin)) {
            origin = TP.bySystemId(origin);
        }

        //  Notify any existing instances of this type that the stylesheet has
        //  been loaded.
        this.$notifyInstancesThatStylesheetLoaded(origin);

    }.bind(this);

    //  Observe TP.sig.DOMReady, which is what an XHTML style element will
    //  signal when it is loaded, it's style has been parsed and that style has
    //  been applied.
    loadedHandler.observe(styleTPElemToObserve, 'TP.sig.DOMReady');

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('onblur',
function(aTargetElem, anEvent) {

    /**
     * @method onblur
     * @summary Handles a 'blur' native event that was dispatched against the
     *     supplied native element.
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @param {Event} anEvent The native event that was triggered.
     * @exception TP.sig.InvalidElement
     * @returns {TP.meta.dom.UIElementNode} The receiver.
     */

    var manuallyBlurringElement,

        evtTargetTPElem,
        focusIDs,

        manuallyFocusingElement;

    if (!TP.isElement(aTargetElem)) {
        return this.raise('TP.sig.InvalidElement');
    }

    /* Uncomment for low-level focus stack debugging
    console.log(
        'Invoking the "onblur" event handler. The event target is: \n' +
        TP.gid(aTargetElem));
    */

    manuallyBlurringElement =
        TP.dom.UIElementNode.get('$manuallyBlurringElement');

    if (TP.isElement(manuallyBlurringElement)) {

        //  Reset this to null for the next pass.
        TP.dom.UIElementNode.set('$manuallyBlurringElement', null);

        return this;
    }

    //  If the 'manually focusing element' that we're tracking as the one that
    //  the system will try to focus is the same as the target element *and it
    //  doesn't exist somewhere in our focusing stack* (we might be trying to
    //  focus elements ourselves from our focus stack, which is perfectly ok and
    //  isn't considered to "be the system focusing outside of our control"),
    //  then we prevent any signaling of UI* signals.

    //  See the 'onfocus' and other focus calculation machinery methods for more
    //  information.
    manuallyFocusingElement =
        TP.dom.UIElementNode.get('$manuallyFocusingElement');

    if (TP.isValid(manuallyFocusingElement)) {

        if (manuallyFocusingElement === aTargetElem) {

            focusIDs = TP.$focus_stack.collect(
                            function(item) {
                                return item.getLocalID();
                            });

            if (!focusIDs.contains(TP.lid(manuallyFocusingElement))) {
                return this;
            }
        }
    }

    //  Grab the event target element and wrap it
    evtTargetTPElem = TP.wrap(aTargetElem);

    //  NB: This only is triggered for non-XHTML element if a 'blur' event is
    //  thrown directly at it via a manual trigger.
    if (!TP.isXHTMLNode(aTargetElem)) {
        evtTargetTPElem = TP.wrap(aTargetElem);
        evtTargetTPElem.blur();
    } else {
        evtTargetTPElem.signal('TP.sig.UIBlur',
                                TP.hc('trigger', TP.wrap(anEvent)));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('onfocus',
function(aTargetElem, anEvent) {

    /**
     * @method onfocus
     * @summary Handles a 'focus' native event that was dispatched against the
     *     supplied native element.
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @param {Event} anEvent The native event that was triggered.
     * @exception TP.sig.InvalidElement
     * @returns {TP.meta.dom.UIElementNode} The receiver.
     */

    var focusedElem,

        evtTargetTPElem,
        focusingTPElem,

        oldMFE;

    if (!TP.isElement(aTargetElem)) {
        return this.raise('TP.sig.InvalidElement');
    }

    if (TP.elementIsDisabled(aTargetElem)) {
        return this;
    }

    /* Uncomment for low-level focus stack debugging
    console.log(
        'Invoking the "onfocus" event handler. The event target is: \n' +
        TP.gid(aTargetElem));
    */

    //  If there is a manually focusing element, that means that the system is
    //  trying to focus an element.
    //  Because focus/blur events are not cancellable, this will be called even
    //  though we don't want it, but we can prevent having any TIBET-level UI*
    //  signals from being dispatched.
    if (TP.isValid(TP.dom.UIElementNode.get('$manuallyFocusingElement'))) {
        //  Reset this to null for the next pass.
        TP.dom.UIElementNode.set('$manuallyFocusingElement', null);

        return this;
    }

    //  If there is a calculated TIBET focusing TP.dom.ElementNode, and its
    //  native node isn't the target element, then configure 'manually focusing
    //  element' to be the target element, and force the calculated one to
    //  focus. Note that we return here. That will avoid any extraneous TIBET
    //  signaling of UI* signals. These will be signaled when the 'focus()' call
    //  here comes back through this mechanism and the calculated one *will* be
    //  the same as the target.
    focusingTPElem = TP.dom.UIElementNode.get('$calculatedFocusingTPElem');

    if (TP.isValid(focusingTPElem)) {

        if (focusingTPElem.getNativeNode() !== aTargetElem) {

            oldMFE = TP.dom.UIElementNode.get('$manuallyFocusingElement');
            TP.dom.UIElementNode.set('$manuallyFocusingElement', aTargetElem);

            focusingTPElem.focus();

            TP.dom.UIElementNode.set('$manuallyFocusingElement', oldMFE);
        }

        //  Reset this to null for the next pass.
        TP.dom.UIElementNode.set('$calculatedFocusingTPElem', null);

        //  Whether or not this was the calculated element, we return here - the
        //  rest of the machinery will take care of things.
        return this;
    }

    //  See if there's a focused element (without considering the
    //  '.activeElement' property)
    focusedElem = TP.documentGetFocusedElement(
                            TP.nodeGetDocument(aTargetElem), false);

    //  If it's the same as the target element, then the browser is being stupid
    //  and is trying to focus the same element. This will screw up our focus
    //  stack semantics, so we exit here.
    if (focusedElem === aTargetElem) {
        return this;
    }

    //  If the target element is the same as the current active element (which
    //  we access directly here) and we *weren't* focusing via a mouse event of
    //  some sort, then we just return. Otherwise, the focusing machinery gets
    //  invoked all over again.
    if (aTargetElem === TP.nodeGetDocument(aTargetElem).activeElement &&
        TP.notTrue(TP.dom.UIElementNode.get('$focusingViaMouseEvent'))) {
        return this;
    }

    //  Grab the event target element and wrap it
    evtTargetTPElem = TP.wrap(aTargetElem);

    //  NB: This only is triggered for non-XHTML element if a 'focus' event is
    //  thrown directly at it via a manual trigger.
    if (!TP.isXHTMLNode(aTargetElem)) {
        evtTargetTPElem = TP.wrap(aTargetElem);
        evtTargetTPElem.focus();
    } else {
        evtTargetTPElem.signal('TP.sig.UIFocus',
                                TP.hc('trigger', TP.wrap(anEvent)));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('onkeydown',
function(aTargetElem, anEvent) {

    /**
     * @method onkeydown
     * @summary Handles a 'keydown' native event that was dispatched against
     *     the supplied native element.
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @param {Event} anEvent The native event that was triggered.
     * @exception TP.sig.InvalidElement
     * @returns {TP.meta.dom.UIElementNode} The receiver.
     */

    var focusedTPElem,

        evtTargetTPElem,

        signal,

        keyname,
        activateSignal,
        bindingsType,

        sigName,
        sigType;

    if (!TP.isElement(aTargetElem)) {
        return this.raise('TP.sig.InvalidElement');
    }

    //  Grab the event target element and wrap it
    evtTargetTPElem = TP.wrap(aTargetElem);

    //  If the event target element is the same as the documentElement (i.e. the
    //  HTML element) that means that the browser might be being stupid and
    //  refusing to dispatch key events to the focused element because the
    //  focused element is a non-XHTML element. Grab the focused element and set
    //  the target to be that element anyway.
    if (aTargetElem === TP.nodeGetDocument(aTargetElem).documentElement) {
        focusedTPElem = evtTargetTPElem.getFocusedElement(true);
        evtTargetTPElem = focusedTPElem;

        //  Note here how we have to reset the resolvedTarget on the Event as
        //  well.
        anEvent.$$_resolvedTarget = focusedTPElem.getNativeNode();
    }

    signal = TP.wrap(anEvent);

    //  If the event target element can handle the key indicated by the signal
    if (evtTargetTPElem.getType().canHandleKey(signal)) {
        //  Grab the TIBET 'key name' from the event.
        keyname = TP.eventGetDOMSignalName(anEvent);

        if (keyname === 'DOM_Enter_Down') {
            //  Try to activate the event target element
            activateSignal = evtTargetTPElem.signal(
                                'TP.sig.UIActivate',
                                TP.hc('trigger', signal));

            //  Cache a reference to the target element that we sent the
            //  'TP.sig.UIActivate' signal from.
            TP.dom.UIElementNode.set('$lastActiveElement', evtTargetTPElem);

            if (activateSignal.shouldPrevent()) {
                //  Since the activation signal was cancelled, we cancel the
                //  native event
                anEvent.preventDefault();
            }

            return this;
        } else if (/DOM(.*)_Tab_Down/.test(keyname)) {

            //  If the target element is configured to want manual tab mgmt,
            //  then allow for that by just returning here.
            if (TP.elementHasAttribute(aTargetElem, 'tibet:manualtabs', true)) {
                return this;
            }

            //  We're going to handle this key down to move the focus ourselves,
            //  so we don't want the browser's natural 'tabbing' code to do
            //  anything. To prevent this, we preventDefault() on the event.
            anEvent.preventDefault();
        }

        sigName = null;

        //  Look in the external keybindings map. If there's an entry there,
        //  then we get the signal name from there.

        //  We compute the 'bindings' type (where we might find key bindings)
        //  from the target TP.dom.ElementNode.
        if (TP.isType(bindingsType = evtTargetTPElem.getType())) {

            //  Query for a signal name via the getKeybinding method. This call
            //  will look up through the supertype chain for the first match.
            sigName = bindingsType.getKeybinding(keyname);
            if (TP.isEmpty(sigName)) {
                return this;
            }

            //  If the signal name is a real TIBET type, then go ahead and
            //  signal using the name, using the currently focused
            //  TP.dom.ElementNode as the 'target' of this signal.
            sigType = TP.sys.getTypeByName(sigName);
            if (TP.isType(sigType)) {
                if (TP.notValid(focusedTPElem)) {
                    focusedTPElem = evtTargetTPElem.getFocusedElement(true);
                }
                focusedTPElem.signal(sigName,
                                        TP.hc('trigger', TP.wrap(anEvent)));
                if (TP.isKindOf(sigType, TP.sig.UIFocusComputation)) {
                    TP.eventPreventDefault(anEvent);
                }
            } else {
                //  Otherwise, it should just be sent as a keyboard event. We
                //  found a map entry for it, but there was no real type.
                evtTargetTPElem.signal(sigName,
                                        TP.hc('trigger', TP.wrap(anEvent)),
                                        TP.DOM_FIRING,
                                        'TP.sig.' + keyname);
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('onkeyup',
function(aTargetElem, anEvent) {

    /**
     * @method onkeyup
     * @summary Handles a 'keyup' native event that was dispatched against the
     *     supplied native element.
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @param {Event} anEvent The native event that was triggered.
     * @exception TP.sig.InvalidElement
     * @returns {TP.meta.dom.UIElementNode} The receiver.
     */

    var evtTargetTPElem,

        signal,

        keyname,
        deactivateSignal,
        bindingsType,
        sigName,
        sigType,
        incrementalVal,
        focusedTPElem;

    if (!TP.isElement(aTargetElem)) {
        return this.raise('TP.sig.InvalidElement');
    }

    //  Grab the event target element and wrap it
    evtTargetTPElem = TP.wrap(aTargetElem);

    //  If the event target element is the same as the documentElement (i.e. the
    //  HTML element) that means that the browser might be being stupid and
    //  refusing to dispatch key events to the focused element because the
    //  focused element is a non-XHTML element. Grab the focused element and set
    //  the target to be that element anyway.
    if (aTargetElem === TP.nodeGetDocument(aTargetElem).documentElement) {
        focusedTPElem = evtTargetTPElem.getFocusedElement(true);
        evtTargetTPElem = focusedTPElem;

        //  Note here how we have to reset the resolvedTarget on the Event as
        //  well.
        anEvent.$$_resolvedTarget = focusedTPElem.getNativeNode();
    }

    //  Compute the target to send the 'TP.sig.UIDeactivate' signal from. We
    //  look at (in order):
    //      - the last active element
    //      - the currently focused element
    //      - the target element supplied to this method
    evtTargetTPElem = TP.ifInvalid(
                        TP.dom.UIElementNode.get('$lastActiveElement'),
                        focusedTPElem);
    if (TP.notValid(evtTargetTPElem)) {
        evtTargetTPElem = TP.wrap(aTargetElem);
    }

    signal = TP.wrap(anEvent);

    //  If the event target element can handle the key indicated by the signal
    if (evtTargetTPElem.getType().canHandleKey(signal)) {
        //  Grab the TIBET 'key name' from the event.
        keyname = TP.eventGetDOMSignalName(anEvent);

        if (keyname === 'DOM_Enter_Up') {
            //  Try to deactivate the event target element
            deactivateSignal = evtTargetTPElem.signal(
                                'TP.sig.UIDeactivate',
                                TP.hc('trigger', signal));

            if (deactivateSignal.shouldPrevent()) {
                //  Since the activation signal was cancelled, we cancel the
                //  native event
                anEvent.preventDefault();
            }

            return this;
        }

        //  Look in the external keybindings map. If there's an entry there,
        //  then we get the signal name from there.

        //  We compute the 'bindings' type (where we might find key bindings)
        //  from the target TP.dom.ElementNode.
        if (TP.isType(bindingsType = evtTargetTPElem.getType())) {

            //  Query for a signal name via the getKeybinding method. This call
            //  will look up through the supertype chain for the first match.
            sigName = bindingsType.getKeybinding(keyname);
            if (TP.isEmpty(sigName)) {
                return this;
            }

            //  If the signal name is a real TIBET type, then go ahead and
            //  signal using the name, using the currently focused
            //  TP.dom.ElementNode as the 'target' of this signal.
            sigType = TP.sys.getTypeByName(sigName);
            if (TP.isType(sigType)) {
                if (TP.notValid(focusedTPElem)) {
                    focusedTPElem = evtTargetTPElem.getFocusedElement(true);
                }
                focusedTPElem.signal(sigName,
                                        TP.hc('trigger', TP.wrap(anEvent)));
                if (TP.isKindOf(sigType, TP.sig.UIFocusComputation)) {
                    TP.eventPreventDefault(anEvent);
                }
            } else {
                //  Otherwise, it should just be sent as a keyboard event. We
                //  found a map entry for it, but there was no real type.
                evtTargetTPElem.signal(sigName,
                                        TP.hc('trigger', TP.wrap(anEvent)),
                                        TP.DOM_FIRING,
                                        'TP.sig.' + keyname);
            }
        }
    } else if (evtTargetTPElem.isBoundElement()) {
        //  If the target is a bound element, then we should check to see if it
        //  wants incremental value updates.
        incrementalVal = evtTargetTPElem.getAttribute('ui:incremental');

        //  There are 3 possible values for 'ui:incremental' - 'control',
        //  'model' and 'both'. We handle 'model' and 'both' here.
        if (incrementalVal === 'model' || incrementalVal === 'both') {
            evtTargetTPElem.setBoundValueIfBound(
                                    evtTargetTPElem.getDisplayValue());
        }
    }

    //  Make sure to null out the last active element for the 'next run'.
    TP.dom.UIElementNode.set('$lastActiveElement', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('onmousedown',
function(aTargetElem, anEvent) {

    /**
     * @method onmousedown
     * @summary Handles a 'mousedown' native event that was dispatched against
     *     the supplied native element.
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @param {Event} anEvent The native event that was triggered.
     * @exception TP.sig.InvalidElement
     * @returns {TP.meta.dom.UIElementNode} The receiver.
     */

    var evtTargetTPElem,

        activateSignal;

    if (!TP.isElement(aTargetElem)) {
        return this.raise('TP.sig.InvalidElement');
    }

    //  We will only signal UIActivate and focus if the button that was
    //  depressed was TP.LEFT.
    if (TP.eventGetButton(anEvent) !== TP.LEFT) {
        return this;
    }

    //  Grab the event target element and wrap it
    evtTargetTPElem = TP.wrap(aTargetElem);

    //  Try to activate the event target element
    activateSignal = evtTargetTPElem.signal(
                            'TP.sig.UIActivate',
                            TP.hc('trigger', TP.wrap(anEvent)));

    //  Cache a reference to the target element that we sent the
    //  'TP.sig.UIActivate' signal from.
    TP.dom.UIElementNode.set('$lastActiveElement', evtTargetTPElem);

    if (activateSignal.shouldPrevent()) {
        //  Since the activation signal was cancelled, we cancel the native
        //  event
        anEvent.preventDefault();
    }

    //  If the target can be focused, do what the 'moveFocus' instance method
    //  does after it computes a 'successor element to focus' - in this case,
    //  that successor element is the element that is our target.
    if (evtTargetTPElem.canFocus()) {
        TP.dom.UIElementNode.set('$calculatedFocusingTPElem', evtTargetTPElem);
    }

    //  Set the flag to let the rest of the focusing machinery know that this is
    //  happening due to a mouse event.
    TP.dom.UIElementNode.set('$focusingViaMouseEvent', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('onmouseup',
function(aTargetElem, anEvent) {

    /**
     * @method onmouseup
     * @summary Handles a 'mouseup' native event that was dispatched against
     *     the supplied native element.
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @param {Event} anEvent The native event that was triggered.
     * @exception TP.sig.InvalidElement
     * @returns {TP.meta.dom.UIElementNode} The receiver.
     */

    var evtTargetTPElem,

        deactivateSignal;

    if (!TP.isElement(aTargetElem)) {
        return this.raise('TP.sig.InvalidElement');
    }

    //  We will only signal UIDeactivate and focus if the button that was
    //  depressed was TP.LEFT.
    if (TP.eventGetButton(anEvent) !== TP.LEFT) {
        return this;
    }

    //  Compute the target to send the 'TP.sig.UIDeactivate' signal from. We
    //  look at (in order):
    //      - the last active element
    //      - the target element supplied to this method
    evtTargetTPElem = TP.dom.UIElementNode.get('$lastActiveElement');
    if (TP.notValid(evtTargetTPElem)) {
        evtTargetTPElem = TP.wrap(aTargetElem);
    }

    //  Try to deactivate the event target element
    deactivateSignal = evtTargetTPElem.signal(
                            'TP.sig.UIDeactivate',
                            TP.hc('trigger', TP.wrap(anEvent)));

    if (deactivateSignal.shouldPrevent()) {
        //  Since the deactivation signal was cancelled, we cancel the
        //  native event
        anEvent.preventDefault();
    }

    if (evtTargetTPElem.canFocus() && !TP.isXHTMLNode(aTargetElem)) {
        evtTargetTPElem.focus();
    }

    //  Make sure to null out the last active element for the 'next run'.
    TP.dom.UIElementNode.set('$lastActiveElement', null);

    TP.dom.UIElementNode.set('$calculatedFocusingTPElem', null);

    //  Reset the flag that let's the rest of the focusing machinery know that
    //  this is happening due to a mouse event to false.
    TP.dom.UIElementNode.set('$focusingViaMouseEvent', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('popOffFocusStack',
function() {

    /**
     * @method popOffFocusStack
     * @summary Pops the last entry (which should be a TP.dom.ElementNode) from
     *     the focus stack and returns it.
     * @returns {TP.dom.ElementNode} The last entry from the focus stack.
     */

    var focusStack,
        retVal;

    focusStack = TP.$focus_stack;

    /* Uncomment for low-level focus stack debugging
    console.log(
        'getting ready to pop. Stack is currently: \n' +
        TP.$focus_stack.collect(
            function(aTPElem) {
                return TP.gid(aTPElem);
            }).join('\n'));
    */

    retVal = focusStack.pop();

    /* Uncomment for low-level focus stack debugging
    console.log(
        'we popped. Stack is currently: \n' +
        TP.$focus_stack.collect(
            function(aTPElem) {
                return TP.gid(aTPElem);
            }).join('\n'));
    */

    return retVal;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('pushOnFocusStack',
function(aTPElem) {

    /**
     * @method pushOnFocusStack
     * @summary Pushes the supplied TP.dom.ElementNode onto the focus stack.
     * @param {TP.dom.ElementNode} aTPElem The TP.dom.ElementNode to push onto
     *     the focus stack.
     */

    var focusStack;

    focusStack = TP.$focus_stack;

    if (focusStack.last() === aTPElem) {
        TP.ifWarn() ?
            TP.warn('Element at top of focus stack is the same.') : 0;
    }

    /* Uncomment for low-level focus stack debugging
    console.log(
        'getting ready to push. Stack is currently: \n' +
        TP.$focus_stack.collect(
            function(fooTPElem) {
                return TP.gid(fooTPElem);
            }).join('\n'));
    */

    focusStack.push(aTPElem);

    /* Uncomment for low-level focus stack debugging
    console.log(
        'we pushed. Stack is currently: \n' +
        TP.$focus_stack.collect(
            function(fooTPElem) {
                return TP.gid(fooTPElem);
            }).join('\n'));
    */

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('registerKeybinding',
function(keyname, signal) {

    /**
     * @method registerKeybinding
     * @summary Registers a unique binding to a TIBET keyname. The binding is
     *     essentially a signal name to be fired when the matching key or
     *     sequence is triggered.
     * @param {String} keyname The name of the key such as DOM_Ctrl_Z_Down.
     * @param {String|TP.sig.Signal} signal The name of the signal to be fired.
     */

    var map,
        name;

    name = signal.getSignalName();

    map = this.getKeybindings();
    if (TP.notValid(map)) {
        map = TP.hc();
        this.$set('keybindings', map, false);
    }

    map.atPut(keyname, name);

    return this;
});

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @method tagCompile
     * @summary Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @description This method operates differently depending on a variety of
     *     factors:
     *          - If the current node has a 'tibet:ctrl', but not a
     *              'tibet:tag', and its operating in a native namespace,
     *              this method returns with no transformation occurring and no
     *              child content being processed.
     *          - If the request contains a command target document and that
     *              target document is not an HTML document, then this element
     *              remains untransformed but its children are processed.
     *          - Otherwise, the element is transformed into a 'div' or 'span',
     *              depending on the return value of the 'isBlockLevel' method.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Element} The element that this tag has become.
     */

    var elem,
        ns,

        targetDoc,

        newElem;

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    //  Populate any 'compilation attributes' from the request onto the element
    //  that we're producing.
    this.populateCompilationAttrs(aRequest);

    //  We may have gotten here because the tag processing system was able
    //  to obtain a 'concrete type' for this node using the 'tibet:ctrl'
    //  attribute (which is really just defining a controller type) not a
    //  'tibet:tag' attribute.

    //  Therefore, we want to check the namespace URI of the element and if
    //  its a 'native namespace' (i.e. this element is supported natively on
    //  the platform) and we don't have a 'tibet:tag' attribute we
    //  don't want to transform the tag, so we just exit here.
    if (TP.notEmpty(ns = elem.namespaceURI) &&
        TP.w3.Xmlns.isNative(ns) &&
        !TP.elementHasAttribute(elem, 'tibet:tag', true)) {
        return elem;
    }

    //  One last check is to see if we're not operating in an HTML document.
    //  We may be operating in an *XHTML* document, in which case we do
    //  *not* 'auto transform' into a 'div' or 'span', but just leave things
    //  alone.
    if (TP.isValid(targetDoc = aRequest.at('doc'))) {
        if (!TP.isHTMLDocument(targetDoc)) {
            return elem;
        }
    }

    //  Create a new XHTML element from elem, using either 'div' or 'span'
    //  depending on whether the element is block level or not
    newElem = TP.elementBecome(elem, this.isBlockLevel() ? 'div' : 'span');

    return newElem;
});

//  ------------------------------------------------------------------------
//  TSH Execution Content
//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Type.defineMethod('cmdRunContent',
function(aRequest) {

    /**
     * @method cmdRunContent
     * @summary Runs the receiver, effectively invoking its action. This method
     *     is invoked any time a tag is being run as part of the processing of
     *     an enclosing tsh:script, which happens most often when the tag is
     *     being run interactively.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue. TP.CONTINUE and TP.BREAK are common values.
     */

    var interactive,
        node,
        shell,
        str;

    interactive = TP.ifKeyInvalid(aRequest, 'cmdBuildGUI', false);
    if (interactive) {
        shell = aRequest.at('cmdShell');
        node = shell.updateCommandNode(aRequest);

        str = TP.wrap(node).asString();

        //  Have to output the action to get it into the DOM for
        //  awakening etc, otherwise it can't register/run/display.
        aRequest.stdout(str, TP.hc('cmdBox', false,
                                    'cmdAsIs', true,
                                    'cmdEcho', true));

        aRequest.set('result', str);
        aRequest.complete();

        return TP.CONTINUE;
    }

    return this.tshExecute(aRequest);
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('act',
function(aSignal) {

    /**
     * @method act
     * @summary Runs the receiver as if it were an action tag. For UI tags this
     *     is a noop.
     * @param {TP.sig.Signal} aSignal The signal (typically a request) which
     *     triggered this activity.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('acceptFocusedResponder',
function() {

    /**
     * @method acceptFocusedResponder
     * @summary Asks the receiver to accept its role as 'focused responder'.
     * @returns {Boolean} Whether or not the receiver should accept focused
     *     responder status.
     */

    var focusTPElem;

    //  If the type is holding a real $calculatedFocusingTPElem, then we want to
    //  reject accepting focused responder status because this means that the
    //  element that we *really* want to focus on (and which is now contained in
    //  this type's '$calculatedFocusingTPElem' property) is a different element
    //  than the one we're processing focused responder status for. So we reject
    //  focused responder status here and then this property will be cleared
    //  and when the desired target element is focused, we will accept it.
    focusTPElem = TP.dom.UIElementNode.get('$calculatedFocusingTPElem');

    if (TP.isKindOf(focusTPElem, TP.dom.UIElementNode) &&
        !focusTPElem.identicalTo(this)) {

        return false;
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('becomeFocusedResponder',
function() {

    /**
     * @method becomeFocusedResponder
     * @summary Tells the receiver that it is now the 'focused responder'.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    //  Push ourself and signal 'TP.sig.UIDidPushFocus'
    this.getType().pushOnFocusStack(this);
    this.signal('TP.sig.UIDidPushFocus');

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('canFocus',
function() {

    /**
     * @method canFocus
     * @summary Whether or not the receiver can be focused. In TIBET, this
     *     means that it would have some sort of 'tabindex' attribute, since we
     *     require that for GUI elements that want focus.
     * @returns {Boolean} Whether or not the receiver can be focused.
     */

    return this.hasAttribute('tabindex');
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('clearStyleProperty',
function(aProperty) {

    /**
     * @method clearStyleProperty
     * @summary Clears the receiver's style property named by the supplied
     *     property name.
     * @param {String} aProperty The name of the style property to clear.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    TP.elementClearStyleProperty(this.getNativeNode(), aProperty);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('computeSuccessorFocusElement',
function(focusedTPElem, moveAction) {

    /**
     * @method computeSuccessorFocusElement
     * @summary Computes the 'successor' focus element using the currently
     *     focused element (if there is one) and the move action.
     * @param {TP.dom.ElementNode} focusedTPElem The currently focused element.
     *     This may be null if no element is currently focused.
     * @param {String} moveAction The type of 'move' that the user requested.
     *     This can be one of the following:
     *         TP.FIRST
     *         TP.LAST
     *         TP.NEXT
     *         TP.PREVIOUS
     *         TP.FIRST_IN_GROUP
     *         TP.LAST_IN_GROUP
     *         TP.FIRST_IN_NEXT_GROUP
     *         TP.FIRST_IN_PREVIOUS_GROUP
     *         TP.FOLLOWING
     *         TP.PRECEDING
     * @returns {TP.dom.ElementNode} The element that is the successor focus
     *     element.
     */

    var currentIsInGroup,

        win,

        bodyTPElem,

        currentGroupName,
        currentGroup,

        bodyElem,
        focusedElem,

        theMoveAction,

        currentGroupWraps,

        computedGroup,

        results,

        nextGroupName,
        prevGroupName,

        resultTPElem,

        currentGroupResults,
        computedGroupResults,

        focusableQuery,

        noGroupResults;

    currentIsInGroup = false;

    win = this.getNativeWindow();

    //  If there is a current element, find the closest group to it - this
    //  dictates the 'context' of the search.
    if (TP.isValid(focusedTPElem)) {
        bodyTPElem = focusedTPElem.getDocument().getBody();

        //  If the current element has a group, then we use it.
        if (TP.notEmpty(currentGroupName = focusedTPElem.getGroupName())) {
            currentGroup = TP.byId(currentGroupName, win);
            currentIsInGroup = true;
        } else {
            //  Otherwise, the 'context' is the body element.
            currentGroup = bodyTPElem;
        }
    } else {
        bodyTPElem = this.getDocument().getBody();

        //  Otherwise, the 'context' is the body element.
        currentGroup = bodyTPElem;
    }

    bodyElem = TP.unwrap(bodyTPElem);
    focusedElem = TP.unwrap(focusedTPElem);

    theMoveAction = moveAction;

    //  Compute whether the current group 'wraps' or not. It will wrap if it
    //  has a 'wrapWhen' attribute and the value of that is not 'false'.
    currentGroupWraps =
            currentGroup.hasAttribute('wrapWhen') &&
            currentGroup.getAttribute('wrapWhen') !== 'false';

    //  If the current group doesn't wrap, then the move action turns from a
    //  TP.NEXT into a TP.FOLLOWING or from a TP.PREVIOUS into a
    //  TP.PRECEDING.
    if (!currentGroupWraps) {
        if (theMoveAction === TP.NEXT) {
            theMoveAction = TP.FOLLOWING;
        } else if (theMoveAction === TP.PREVIOUS) {
            theMoveAction = TP.PRECEDING;
        }
    }

    //  If we're moving between groups, then we need to query for them and
    //  set the computed group element appropriately.

    switch (theMoveAction) {
        case TP.FIRST:
        case TP.LAST:
        case TP.NEXT:
        case TP.PREVIOUS:
        case TP.FIRST_IN_GROUP:
        case TP.LAST_IN_GROUP:

            //  No computed group needed for these actions
            break;

        case TP.FIRST_IN_NEXT_GROUP:

            //  If the currently focused element isn't in a group, the 'next
            //  group' is going to be the first group (or the wrapped body).
            if (!currentIsInGroup) {
                if (TP.notEmpty(results = bodyTPElem.get(
                                'tibet:group'.asType().getQueryPath(
                                                    false, false, false)))) {

                    //  There was no group found, so the 'next group' is
                    //  going to be the first group (or the only group).
                    if (TP.isArray(results)) {
                        computedGroup = TP.wrap(results.first());
                    } else {
                        computedGroup = results;
                    }
                } else {
                    //  Couldn't find any groups - use the body element.
                    computedGroup = bodyTPElem;
                }
            } else {
                //  Grab the next group name from the current group (which
                //  may be nested, and we are interested in wrapping)
                nextGroupName =
                        this.getNextGroupName(currentGroupName, true, true);
                if (TP.isValid(nextGroupName)) {
                    computedGroup = TP.byId(nextGroupName, win);
                }
            }

            break;

        case TP.FIRST_IN_PREVIOUS_GROUP:

            //  If the currently focused element isn't in a group, the 'previous
            //  group' is going to be the last group (or the wrapped body).
            if (!currentIsInGroup) {
                if (TP.notEmpty(results = bodyTPElem.get(
                                'tibet:group'.asType().getQueryPath(
                                                    false, false, false)))) {

                    //  There was no group found, so the 'next group' is
                    //  going to be the last group (or the only group).
                    if (TP.isArray(results)) {
                        computedGroup = TP.wrap(results.last());
                    } else {
                        computedGroup = results;
                    }
                } else {
                    //  Couldn't find any groups - use the body element.
                    computedGroup = bodyTPElem;
                }
            } else {
                //  Grab the previous group name from the current group
                //  (which may be nested, and we are interested in wrapping)
                prevGroupName =
                        this.getPreviousGroupName(currentGroupName, true, true);
                if (TP.isValid(prevGroupName)) {
                    computedGroup = TP.byId(prevGroupName, win);
                }
            }

            break;

        case TP.FOLLOWING:

            //  If the currently focused element isn't in a group, the 'next
            //  group' is going to be the first group (or the wrapped body).
            if (!currentIsInGroup) {
                if (TP.notEmpty(results = bodyTPElem.get(
                                'tibet:group'.asType().getQueryPath(
                                                    false, false, false)))) {

                    //  There was more than 1 group found, so the 'next group'
                    //  is going to be the first group (or the only group).
                    if (TP.isArray(results)) {
                        computedGroup = TP.wrap(results.first());
                    } else {
                        computedGroup = results;
                    }

                    //  If we're not wrapping, then we need to make sure that
                    //  the 'next group' falls *after* this element - otherwise,
                    //  we're not interested in it.
                    if (!currentGroupWraps &&
                        !TP.nodeComparePosition(
                            this.getNativeNode(),
                            computedGroup.getNativeNode(),
                            TP.FOLLOWING_NODE)) {
                        computedGroup = null;
                    }
                } else {
                    //  Couldn't find any groups - use the body element.
                    computedGroup = bodyTPElem;
                }
            } else {
                //  Try to grab the next group name, which may be nested, but we
                //  are not interested in wrapping - we want to see if we need
                //  to check the body for focusable elements.
                nextGroupName =
                    this.getNextGroupName(currentGroupName, false, true);

                //  If we're not wrapping, then we need to make sure that the
                //  'next group' falls *after* this element - otherwise, we're
                //  not interested in it.
                if (TP.notEmpty(nextGroupName) &&
                    !currentGroupWraps &&
                    !TP.nodeComparePosition(
                        this.getNativeNode(),
                        TP.byId(nextGroupName, this.getNativeDocument(), false),
                        TP.FOLLOWING_NODE)) {
                    nextGroupName = null;
                }

                //  If there was no next group without wrapping and the current
                //  group doesn't have a parent group, then the computed group
                //  may be the body if it has focusable elements.
                if (TP.notValid(nextGroupName) &&
                    TP.notValid(this.getParentGroupName(currentGroupName))) {
                    //  Check to see if the body has focusable elements - if so,
                    //  then set the computedGroup to be the wrapped body.
                    if (TP.notEmpty(bodyTPElem.findFocusableElements())) {
                        computedGroup = bodyTPElem;
                    }
                }

                if (TP.notValid(computedGroup)) {
                    //  Grab the next group name from the current group (which
                    //  may be nested). This time we wrap.
                    nextGroupName =
                        this.getNextGroupName(currentGroupName, true, true);

                    //  If we couldn't compute a next group or if its the same
                    //  as the current group (in which case, it's a 'leaf' group
                    //  with no sibling groups), then see if we can use the
                    //  parent group.
                    if (TP.notValid(nextGroupName) ||
                        nextGroupName === currentGroupName) {
                        nextGroupName =
                                this.getParentGroupName(currentGroupName);
                    }

                    computedGroup = TP.byId(nextGroupName, win);
                }
            }

            break;

        case TP.PRECEDING:

            //  If the currently focused element isn't in a group, the 'previous
            //  group' is going to be the last group (or the wrapped body).
            if (!currentIsInGroup) {
                if (TP.notEmpty(results = bodyTPElem.get(
                                'tibet:group'.asType().getQueryPath(
                                                    false, false, false)))) {

                    //  There was more than 1 group found, so the 'previous
                    //  group' is going to be the last group (or the only
                    //  group).
                    if (TP.isArray(results)) {
                        computedGroup = TP.wrap(results.last());
                    } else {
                        computedGroup = results;
                    }

                    //  If we're not wrapping, then we need to make sure that
                    //  the 'previous group' falls *before* this element -
                    //  otherwise, we're not interested in it.
                    if (!currentGroupWraps &&
                        !TP.nodeComparePosition(
                            this.getNativeNode(),
                            computedGroup.getNativeNode(),
                            TP.PRECEDING_NODE)) {
                        computedGroup = null;
                    }
                } else {
                    //  Couldn't find any groups - use the body element.
                    computedGroup = bodyTPElem;
                }
            } else {
                //  Try to grab the previous group name, which may be nested,
                //  but we are not interested in wrapping - we want to see if we
                //  need to check the body for focusable elements.
                prevGroupName =
                    this.getPreviousGroupName(currentGroupName, false, true);

                //  If we're not wrapping, then we need to make sure that the
                //  'previous group' falls *before* this element - otherwise,
                //  we're not interested in it.
                if (TP.notEmpty(prevGroupName) &&
                    !currentGroupWraps &&
                    !TP.nodeComparePosition(
                        this.getNativeNode(),
                        TP.byId(prevGroupName, this.getNativeDocument(), false),
                        TP.PRECEDING_NODE)) {
                    prevGroupName = null;
                }

                //  If there was no previous group without wrapping and the
                //  current group doesn't have a parent group, then the computed
                //  group may be the body if it has focusable elements.
                if (TP.notValid(prevGroupName) &&
                    TP.notValid(this.getParentGroupName(currentGroupName))) {
                    //  Check to see if the body has focusable elements - if so,
                    //  then set the computedGroup to be the wrapped body.
                    if (TP.notEmpty(bodyTPElem.findFocusableElements())) {
                        computedGroup = bodyTPElem;
                    }
                }

                if (TP.notValid(computedGroup)) {
                    //  Grab the previous group name from the current group
                    //  (which may be nested). This time we wrap.
                    prevGroupName =
                        this.getPreviousGroupName(currentGroupName, true, true);

                    //  If we couldn't compute a previous group or if its the
                    //  same as the current group (in which case, it's a 'leaf'
                    //  group with no sibling groups), then see if we can use
                    //  the parent group.
                    if (TP.notValid(prevGroupName) ||
                        prevGroupName === currentGroupName) {
                        prevGroupName =
                                this.getParentGroupName(currentGroupName);
                    }

                    computedGroup = TP.byId(prevGroupName, win);
                }
            }

            break;

        default:

            return null;
    }

    resultTPElem = null;

    //  Based on the move action, grab the first, last, next or previous
    //  focusable element (using the current element for next and previous)
    switch (theMoveAction) {
        case TP.FIRST:

            //  We always use the body here - we don't care what the
            //  currentGroup is.

            if (TP.notEmpty(
                    TP.byCSSPath('tibet|group', bodyElem, false, false))) {
                focusableQuery = TP.computeFocusableQuery(
                                    'tibet|group:first > ', ':first');

                results = TP.byCSSPath(focusableQuery, bodyElem);
                results = TP.wrap(results);
            } else {
                results = bodyTPElem.findFocusableElements();
            }

            if (TP.isEmpty(results)) {
                return null;
            }

            resultTPElem = results.first();

            break;

        case TP.LAST:

            //  We always use the body here - we don't care what the
            //  currentGroup is.

            if (TP.notEmpty(
                    TP.byCSSPath('tibet|group', bodyElem, false, false))) {
                focusableQuery = TP.computeFocusableQuery(
                                    'tibet|group:last > ', ':last');

                results = TP.byCSSPath(focusableQuery, bodyElem, false);
            } else {
                results = bodyTPElem.findFocusableElements();
            }

            if (TP.isEmpty(results)) {
                return null;
            }

            resultTPElem = results.last();

            break;

        case TP.NEXT:

            if (TP.isEmpty(currentGroupResults =
                            currentGroup.findFocusableElements(true))) {
                //  The current group had no focusable elements.
                return null;
            }

            if (TP.notValid(focusedTPElem) ||
                TP.notValid(resultTPElem = currentGroupResults.after(
                                            focusedTPElem.getNativeNode(),
                                            TP.EQUALITY,
                                            true))) {

                //  NB: This assumes that we're wrapping - if we're not,
                //  then this operation got converted into a 'TP.FOLLOWING'
                //  above.

                resultTPElem = currentGroupResults.first();
            }

            break;

        case TP.PREVIOUS:

            if (TP.isEmpty(currentGroupResults =
                            currentGroup.findFocusableElements(true))) {
                //  The current group had no focusable elements.
                return null;
            }

            if (TP.notValid(focusedTPElem) ||
                TP.notValid(resultTPElem = currentGroupResults.before(
                                            focusedTPElem.getNativeNode(),
                                            TP.EQUALITY,
                                            true))) {

                //  NB: This assumes that we're wrapping - if we're not,
                //  then this operation got converted into a 'TP.PRECEDING'
                //  above.

                resultTPElem = currentGroupResults.last();
            }

            break;

        case TP.FIRST_IN_GROUP:

            if (TP.isEmpty(currentGroupResults =
                            currentGroup.findFocusableElements())) {
                //  The current group had no focusable elements.
                return null;
            }

            resultTPElem = currentGroupResults.first();

            break;

        case TP.LAST_IN_GROUP:

            if (TP.isEmpty(currentGroupResults =
                            currentGroup.findFocusableElements())) {
                //  The current group had no focusable elements.
                return null;
            }

            resultTPElem = currentGroupResults.last();

            break;

        case TP.FIRST_IN_NEXT_GROUP:
        case TP.FIRST_IN_PREVIOUS_GROUP:

            if (!TP.isValid(computedGroup) ||
                TP.isEmpty(computedGroupResults =
                            computedGroup.findFocusableElements())) {
                //  The computed group had no focusable elements.
                return null;
            }

            resultTPElem = computedGroupResults.first();

            break;

        case TP.FOLLOWING:

            if (TP.isEmpty(currentGroupResults =
                            currentGroup.findFocusableElements(true))) {
                //  The current group had no focusable elements.
                return null;
            }

            //  First, we check to see if the focused element is itself the
            //  body. If so, we just return the first result (which will have
            //  been properly sorted by tabindex by the 'findFocusableElements'
            //  call above)
            if (focusedElem === bodyElem) {

                //  The focused element was the body itself (which means that
                //  current group is as well), which means we should just use
                //  the first result element that got returned.
                resultTPElem = currentGroupResults.first();
            } else {

                //  We try to see if the current group has a focusable field
                //  following the current one.
                resultTPElem = currentGroupResults.after(
                                            focusedTPElem, TP.EQUALITY, true);

                if (TP.notValid(focusedTPElem) || TP.notValid(resultTPElem)) {

                    if (!TP.isValid(computedGroup)) {
                        if (currentGroupResults.last() === focusedTPElem) {
                            return currentGroupResults.first();
                        }

                        return null;
                    }

                    //  Try to get the first focusable field of the computed
                    //  group (which will be the 'next group' according to the
                    //  group computation which occurred above).

                    //  First, we query with wanting groups, to see if there are
                    //  any focusable items after our current group.
                    computedGroupResults =
                                computedGroup.findFocusableElements(true);

                    if (TP.isEmpty(computedGroupResults)) {
                        return null;
                    }

                    resultTPElem = computedGroupResults.after(
                                    currentGroup, TP.EQUALITY, true);

                    //  If there are no focusable items after our current group,
                    //  then we re-query, but this time with no groups.
                    if (TP.notValid(resultTPElem)) {
                        noGroupResults =
                            computedGroup.findFocusableElements(false);

                        if (TP.notEmpty(noGroupResults)) {
                            resultTPElem = noGroupResults.first();
                        } else {
                            resultTPElem = computedGroupResults.first();
                        }
                    }
                }
            }

            break;

        case TP.PRECEDING:

            if (TP.isEmpty(currentGroupResults =
                            currentGroup.findFocusableElements(true))) {
                //  The current group had no focusable elements.
                return null;
            }

            //  First, we check to see if the focused element is itself the
            //  body. If so, we just return the first result (which will have
            //  been properly sorted by tabindex by the 'findFocusableElements'
            //  call above)
            if (focusedElem === bodyElem) {

                //  The focused element was the body itself (which means that
                //  current group is as well), which means we should just use
                //  the last result element that got returned.
                resultTPElem = currentGroupResults.last();
            } else {
                //  We try to see if the current group has a focusable field
                //  preceding the current one.
                resultTPElem = currentGroupResults.before(
                                            focusedTPElem, TP.EQUALITY, true);

                if (TP.notValid(focusedTPElem) || TP.notValid(resultTPElem)) {

                    if (!TP.isValid(computedGroup)) {
                        if (currentGroupResults.first() === focusedTPElem) {
                            return currentGroupResults.last();
                        }

                        return null;
                    }

                    //  Try to get the last focusable field of the computed
                    //  group (which will be the 'last group' according to the
                    //  group computation which occurred above).

                    //  First, we query with wanting groups, to see if there are
                    //  any focusable items after our current group.
                    computedGroupResults =
                                computedGroup.findFocusableElements(true);

                    if (TP.isEmpty(computedGroupResults)) {
                        return null;
                    }

                    resultTPElem = computedGroupResults.before(
                                    currentGroup, TP.EQUALITY, true);

                    //  If there are no focusable items after our current group,
                    //  then we re-query, but this time with no groups.
                    if (TP.notValid(resultTPElem)) {
                        noGroupResults =
                            computedGroup.findFocusableElements(false);

                        if (TP.notEmpty(noGroupResults)) {
                            resultTPElem = noGroupResults.last();
                        } else {
                            resultTPElem = computedGroupResults.last();
                        }
                    }
                }
            }

            break;

        default:

            return null;
    }

    //  If there's a real result element, then return it. Otherwise return
    //  null.
    if (TP.isValid(resultTPElem)) {
        return resultTPElem;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('dispatchResponderSignalFromAttr',
function(aSignalName, aTriggerSignal) {

    /**
     * @method dispatchResponderSignalFromAttr
     * @summary Dispatches a signal with the supplied name that uses
     *     RESPONDER_FIRING and should have a corresponding 'on:' attribute on
     *     the receiver (i.e. 'on:UIActivate') that contains configuration and
     *     firing information.
     * @param {String} aSignalName The name of the signal that has a
     *     RESPONDER_FIRING policy. This is the name that will be used to look
     *     for an attribute of the same name (or shortened signal name, if
     *     applicable).
     * @param {TP.sig.Signal} aTriggerSignal The signal that triggered the
     *     machinery to get to this point. This is usually some kind of signal
     *     wrapping a native GUI Event.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var originElem,

        sigName,
        sigData;

    originElem = this.getNativeNode();

    //  First, try the full signal name.
    sigName = 'on:' + TP.expandSignalName(aSignalName);
    if (TP.elementHasAttribute(originElem, sigName, true)) {
        sigData = TP.elementGetAttribute(originElem, sigName, true);
    } else {
        //  Next, try the shortened version of that name.
        sigName = 'on:' + TP.contractSignalName(aSignalName);
        sigData = TP.elementGetAttribute(originElem, sigName, true);
    }

    //  If we were able to successfully extract signal data, then queue up a
    //  signal that will fire based on this data.
    if (TP.notEmpty(sigData)) {
        TP.queueSignalFromData(
                    sigData,
                    originElem,
                    aTriggerSignal,
                    null,   //  payload
                    null,   //  policy
                    TP.sig.ResponderSignal);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('findFocusableElements',
function(includesGroups) {

    /**
     * @method findFocusableElements
     * @summary Finds focusable elements under the receiver and returns an
     *     Array of TP.dom.ElementNodes of them.
     * @param {Boolean} includesGroups Whether or not to include 'tibet:group'
     *     elements as 'focusable' elements under the receiver. The default is
     *     false.
     * @returns {TP.dom.ElementNode[]} An Array of TP.dom.ElementNodes under the
     *     receiver that can be focused.
     */

    var elem,

        results,

        queryStr,

        noIntermediateGroups;

    //  Query for any elements under the context element that are focusable.

    //  Note here that the query only includes:
    //  -   elements that are focusable that are *direct* children of the
    //      receiver
    //  -   elements that are focusable that are descendants of any element
    //      under the receiver that is *not* a tibet:group element.
    //  This allows us to filter out elements that are focusable but nested
    //  under another tibet:group that is in the receiver (we don't want
    //  these elements).

    elem = this.getNativeNode();

    //  NOTE: Because of how these queries are structured, they have to be
    //  executed separately and their results combined.
    results = TP.ac();

    //  Query for any immediate children that have a 'tibet:group' attribute
    //  that matches our group ID.
    queryStr = TP.computeFocusableQuery('> ');

    results.push(
        TP.byCSSPath(queryStr,
                        elem,
                        false,
                        false));

    queryStr = TP.computeFocusableQuery('*:not(tibet|group) ');

    //  Query for any descendants that have a 'tibet:group' attribute that
    //  matches our group ID.
    noIntermediateGroups = TP.byCSSPath(queryStr,
                                        elem,
                                        false,
                                        false);
    //  Now, filter that result set to make sure that there are no 'tibet:group'
    //  elements between each result node and our own element.
    noIntermediateGroups = noIntermediateGroups.filter(
                            function(focusableElem) {
                                return !TP.isElement(
                                            TP.nodeAncestorMatchingCSS(
                                                focusableElem,
                                                'tibet|group',
                                                elem));
                            });

    results.push(noIntermediateGroups);

    if (includesGroups) {
        results.push(
            TP.byCSSPath('> tibet|group, *:not(tibet|group) tibet|group',
                            elem,
                            false,
                            false));
    }

    //  Flatten out the results and unique them.
    results = results.flatten();
    results.unique();

    //  Iterate over them and see if they're displayed (not hidden by CSS -
    //  although they could currently not be visible to the user).
    results = results.select(
                    function(anElem) {
                        return TP.elementIsDisplayed(anElem);
                    });

    //  Sort the Array of elements by their 'tabindex' according to the
    //  HTML5 tabindex rules.
    results.sort(TP.sort.TABINDEX_ORDER);

    //  Wrap the results to make TP.dom.ElementNodes
    return TP.wrap(results);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getComputedStyleProperty',
function(aProperty, inPixels) {

    /**
     * @method getComputedStyleProperty
     * @summary Returns the receiver's *computed* style property named by the
     *     supplied property name.
     * @param {String} aProperty The name of the style property to retrieve.
     * @param {Boolean} [inPixels=false] Whether or not we want this value back
     *     as a Number of pixels. Obviously this will only work with values of
     *     properties that contain some sort of size. The default is false.
     * @returns {Object} The current computed value of the style property named
     *     by aProperty on the supplied element.
     */

    var elem,
        val;

    elem = this.getNativeNode();

    if (TP.isTrue(inPixels)) {
        val = TP.elementGetComputedStyleValueInPixels(
                                                elem, aProperty.asDOMName());
    } else {
        val = TP.elementGetComputedStyleProperty(elem, aProperty);
    }

    return val;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getDisplayValue',
function(anAttribute) {

    /**
     * @method getDisplayValue
     * @summary Gets the display, or visual, value of the receiver's node. This
     *     is the value the HTML, or other UI tag, is actually displaying to the
     *     user at the moment.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getFocusContextElement',
function() {

    /**
     * @method getFocusContextElement
     * @summary Returns the TP.dom.UIElementNode that forms the receiver's
     *     'focus context'. This is normally the document's 'body' element, but
     *     it can be any ancestor element with the 'tibet:focuscontext'
     *     attribute.
     * @returns {TP.dom.UIElementNode} The TP.dom.UIElementNode acting as the
     *      'focus context' element of the receiver.
     */

    var focusContextTPElem;

    if (TP.isValid(focusContextTPElem =
            this.getFirstAncestorByAttribute('tibet:focuscontext'))) {
        return focusContextTPElem;
    } else {
        return this.getDocument().getBody();
    }
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getFocusedElement',
function(includeBody) {

    /**
     * @method getFocusedElement
     * @summary Returns the TP.dom.UIElementNode representing the element in
     *     the document that currently has focus.
     * @param {Boolean} includeBody Whether or not to include the 'body' element
     *     if another element can't be found. HTML5 says that the 'body' will
     *     be the 'active' element if another element can't be found, but
     *     sometimes callers don't want that. This defaults to true.
     * @exception TP.sig.InvalidDocument
     * @returns {TP.dom.UIElementNode} The TP.dom.UIElementNode that currently
     *     has focus in the document.
     */

    var currentDoc,
        currentElement;

    if (!TP.isDocument(currentDoc = this.getNativeDocument())) {
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    //  Couldn't find a focused element
    if (!TP.isElement(currentElement =
                         TP.documentGetFocusedElement(currentDoc))) {
        return null;
    }

    if (TP.notTrue(includeBody) &&
         currentElement === TP.documentGetBody(currentDoc)) {

        //  The caller doesn't want the body back
        return null;
    }

    //  Found a currently focused element - wrap it.
    return TP.wrap(currentElement);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getHeight',
function() {

    /**
     * @method getHeight
     * @summary Returns the receiver's height in pixels.
     * @returns {Number} The receiver's height in pixels.
     */

    return TP.elementGetHeight(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getGlobalPoint',
function(wantsTransformed) {

    /**
     * @method getGlobalPoint
     * @summary Returns the receiver's global position as a TP.gui.Point. The
     *     global position is the element's position relative to its overall
     *     *top level* window.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @returns {TP.gui.Point} The receiver's global position.
     */

    var coords;

    coords = TP.elementGetGlobalXY(this.getNativeNode(),
                                    TP.BORDER_BOX,
                                    null,
                                    wantsTransformed);

    return TP.pc(coords);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getGlobalRect',
function(wantsTransformed) {

    /**
     * @method getGlobalRect
     * @summary Returns the receiver's global position and size as a
     *     TP.gui.Rect. The global position is the element's position relative
     *     to its overall *top level* window.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @returns {TP.gui.Rect} The receiver's global position and size.
     */

    var coords;

    coords = TP.elementGetGlobalBox(this.getNativeNode(),
                                    TP.BORDER_BOX,
                                    null,
                                    wantsTransformed);

    return TP.rtc(coords);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getGroupChainNames',
function() {

    /**
     * @method getGroupChainNames
     * @summary Returns an Array of the 'tibet:group' element names that the
     *     receiver is a member of, from the most specific group to the least
     *     specific group (i.e. up the group hierarchy).
     * @returns {String[]} The Array of 'tibet:group' names that the receiver is
     *     a member of or the empty Array.
     */

    var groupName,
        allNames,

        win,

        currentGroupName,
        currentGroupElem,
        currentGroupTPElem;

    //  First, get our group name
    groupName = this.getGroupName();

    if (TP.isEmpty(groupName)) {
        return null;
    }

    allNames = TP.ac();

    win = this.getNativeWindow();

    currentGroupName = groupName;
    while (TP.isElement(currentGroupElem =
                        TP.byId(currentGroupName, win, false))) {
        allNames.push(currentGroupName);

        currentGroupTPElem = TP.wrap(currentGroupElem);

        if (TP.notValid(currentGroupName =
                        currentGroupTPElem.getGroupName())) {
            break;
        }
    }

    return allNames;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getGroupName',
function() {

    /**
     * @method getGroupName
     * @summary Returns the 'tibet:group' element name that the receiver is a
     *     member of.
     * @returns {String} The 'tibet:group' name that the receiver is a member of
     *     or null.
     */

    //  If we don't have a 'tibet:group' attribute, then just return a null
    if (!this.hasAttribute('tibet:group')) {
        return null;
    }

    return this.getAttribute('tibet:group');
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getGroupElements',
function() {

    /**
     * @method getGroupElements
     * @summary Returns an Array containing other TP.dom.UIElementNodes that
     *     are members of the same group as the receiver.
     * @returns {TP.dom.UIElementNode[]} The array of other
     *     TP.dom.UIElementNodes belonging to the same group as the receiver.
     */

    var groupID,

        tpGroupElem;

    if (TP.notEmpty(groupID = this.getGroupName())) {

        tpGroupElem = TP.byId(groupID, this.getDocument(), true);

        if (TP.isValid(tpGroupElem) && !TP.isArray(tpGroupElem)) {
            return tpGroupElem.getMemberElements();
        }
    }

    return TP.ac();
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getNextGroupName',
function(startGroupName, alwaysWrap, wantsNested) {

    /**
     * @method getNextGroupName
     * @summary Returns the 'next' group name. If a starting group name is
     *     supplied, it is used as the starting point. Otherwise, the group name
     *     of the receiver is used as the starting point.
     * @param {String} startGroupName The group name to start the search for the
     *     next group at.
     * @param {Boolean} alwaysWrap Whether or not to ignore wrapping behavior
     *     and 'always wrap' around. Defaults to false.
     * @param {Boolean} wantsNested Whether or not to consider nested groups as
     *     part of this query. Defaults to false.
     * @returns {String|null} The name of the 'next' group or null if one can't
     *     be computed (or it would be the same group).
     */

    var ourGroupName,
        fromGroupName,

        shouldWrap,

        chainNames,

        win,

        fromGroupTPElem,

        parentGroupName,
        allGroups,

        memberGroupTPElems,

        nextGroupTPElem,

        parentGroupTPElem;

    if (TP.isEmpty(ourGroupName = this.getGroupName())) {
        return null;
    }

    fromGroupName = TP.ifEmpty(startGroupName, ourGroupName);

    shouldWrap = TP.ifInvalid(alwaysWrap, false);

    //  Grab the 'chain' of group names up the group hierarchy
    chainNames = this.getGroupChainNames();

    win = this.getNativeWindow();

    fromGroupTPElem = TP.byId(fromGroupName, win);

    //  Look for the 'parent group' name, which should be in the chain after
    //  the 'from' group name.
    if (TP.isEmpty(parentGroupName = chainNames.after(fromGroupName))) {
        //  Can't find the parent group - check the body by obtaining all of
        //  the tibet:groups under the body.
        if (TP.notEmpty(allGroups = this.getDocument().getBody().get(
                        'tibet:group'.asType().getQueryPath(
                                                wantsNested, false, false)))) {

            //  If there is only one group and it's the same group as the one
            //  we're coming from, then just return null
            if (!TP.isArray(allGroups) && allGroups === fromGroupTPElem) {
                return null;
            }

            //  Wrap all of them.
            memberGroupTPElems = TP.wrap(allGroups);

            //  Look for the group out of all of the groups that comes after
            //  the 'from' group.
            if (TP.notValid(nextGroupTPElem = memberGroupTPElems.after(
                                    fromGroupTPElem, TP.EQUALITY, true))) {
                //  There is no 'next' group after the 'from group'. If
                //  shouldWrap is true, set the next group element to be the
                //  first element - otherwise, return null
                if (shouldWrap) {
                    nextGroupTPElem = memberGroupTPElems.first();
                } else {
                    return null;
                }
            }
        } else {
            //  There are no tibet:group elements - return null
            return null;
        }
    } else {
        //  Grab the parent group's TP.dom.ElementNode and its member
        //  groups.
        parentGroupTPElem = TP.byId(parentGroupName, win);
        memberGroupTPElems = parentGroupTPElem.getMemberGroups();

        //  If there is only one member group, then it is the 'from' group
        //  itself - choose the parent group
        if (memberGroupTPElems.getSize() === 1) {
            nextGroupTPElem = parentGroupTPElem;
        } else if (TP.notValid(nextGroupTPElem = memberGroupTPElems.after(
                                    fromGroupTPElem, TP.EQUALITY, true))) {

            //  Otherwise, loop for the group out of all of the groups *of only
            //  the parent group* that comes after the 'from' group.

            //  If the parent tibet:group has a 'wrapWhen' attribute on it
            //  use that to determine whether we should wrap... unless we
            //  should always wrap, ignoring 'wrapWhen'
            if (parentGroupTPElem.hasAttribute('wrapWhen') || shouldWrap) {
                //  TODO: There are other values for 'wrapWhen'
                nextGroupTPElem = memberGroupTPElems.first();
            } else {
                //  Can't find the next group and we're not wrapping -
                //  return null
                return null;
            }
        }
    }

    return nextGroupTPElem.getAttribute('id');
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getOffsetParent',
function() {

    /**
     * @method getOffsetParent
     * @summary Returns the receiver's 'offset parent'.
     * @returns {TP.dom.UIElementNode} The receiver's 'offset parent' in the
     *     DOM.
     */

    return TP.wrap(TP.elementGetOffsetParent(this.getNativeNode()));
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getOffsetPoint',
function(wantsTransformed) {

    /**
     * @method getOffsetPoint
     * @summary Returns the receiver's offset position as a TP.gui.Point. The
     *     offset position is the element's position relative to its offset
     *     parent.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @returns {TP.gui.Point} The receiver's offset position.
     */

    var coords;

    coords = TP.elementGetOffsetXY(this.getNativeNode(),
                                    TP.BORDER_BOX,
                                    wantsTransformed);

    return TP.pc(coords);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getOffsetRect',
function(wantsTransformed) {

    /**
     * @method getOffsetRect
     * @summary Returns the receiver's offset position and size as a
     *     TP.gui.Rect. The offset position is the element's position relative
     *     to its offset parent.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @returns {TP.gui.Rect} The receiver's offset position and size.
     */

    var coords;

    coords = TP.elementGetOffsetBox(this.getNativeNode(),
                                    TP.BORDER_BOX,
                                    wantsTransformed);

    return TP.rtc(coords);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getPagePoint',
function(wantsTransformed) {

    /**
     * @method getPagePoint
     * @summary Returns the receiver's page position as a TP.gui.Point. The
     *     page position is the element's position relative to its overall page.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @returns {TP.gui.Point} The receiver's page position.
     */

    var coords;

    coords = TP.elementGetPageXY(this.getNativeNode(),
                                    TP.BORDER_BOX,
                                    null,
                                    wantsTransformed);

    return TP.pc(coords);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getPageRect',
function(wantsTransformed) {

    /**
     * @method getPageRect
     * @summary Returns the receiver's page position and size as a
     *     TP.gui.Rect. The page position is the element's position relative to
     *     its overall page.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @returns {TP.gui.Rect} The receiver's page position and size.
     */

    var coords;

    coords = TP.elementGetPageBox(this.getNativeNode(),
                                    TP.BORDER_BOX,
                                    null,
                                    wantsTransformed);

    return TP.rtc(coords);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getParentGroupName',
function(startGroupName) {

    /**
     * @method getParentGroupName
     * @summary Returns the 'next' group name. If a starting group name is
     *     supplied, it is used as the starting point. Otherwise, the group name
     *     of the receiver is used as the starting point.
     * @param {String} startGroupName The group name to start the search for the
     *     next group at.
     * @param {Boolean} alwaysWrap Whether or not to ignore wrapping behavior
     *     and 'always wrap' around.
     * @returns {String} The name of the 'next' group.
     */

    var ourGroupName,
        fromGroupName,

        chainNames,

        parentGroupName;

    if (TP.isEmpty(ourGroupName = this.getGroupName())) {
        return null;
    }

    fromGroupName = TP.ifEmpty(startGroupName, ourGroupName);

    //  Grab the 'chain' of group names up the group hierarchy
    chainNames = this.getGroupChainNames();

    //  Look for the 'parent group' name, which should be in the chain after
    //  the 'from' group name.
    if (TP.isEmpty(parentGroupName = chainNames.after(fromGroupName))) {
        return null;
    }

    return parentGroupName;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getPreviousGroupName',
function(startGroupName, alwaysWrap, wantsNested) {

    /**
     * @method getPreviousGroupName
     * @summary Returns the 'previous' group name. If a starting group name is
     *     supplied, it is used as the starting point. Otherwise, the group name
     *     of the receiver is used as the starting point.
     * @param {String} startGroupName The group name to start the search for the
     *     next group at.
     * @param {Boolean} alwaysWrap Whether or not to ignore wrapping behavior
     *     and 'always wrap' around. Defaults to false.
     * @param {Boolean} wantsNested Whether or not to consider nested groups as
     *     part of this query. Defaults to false.
     * @returns {String|null} The name of the 'previous' group or null if one
     *     can't be computed (or it would be the same group).
     */

    var ourGroupName,
        fromGroupName,

        shouldWrap,

        chainNames,

        win,

        fromGroupTPElem,

        parentGroupName,

        allGroups,

        memberGroupTPElems,

        prevGroupTPElem,

        parentGroupTPElem;

    if (TP.isEmpty(ourGroupName = this.getGroupName())) {
        return null;
    }

    fromGroupName = TP.ifEmpty(startGroupName, ourGroupName);

    shouldWrap = TP.ifInvalid(alwaysWrap, false);

    //  Grab the 'chain' of group names up the group hierarchy
    chainNames = this.getGroupChainNames();

    win = this.getNativeWindow();

    fromGroupTPElem = TP.byId(fromGroupName, win);

    //  Look for the 'parent group' name, which should be in the chain after
    //  the 'from' group name.
    if (TP.isEmpty(parentGroupName = chainNames.after(fromGroupName))) {
        //  Can't find the parent group - check the body by obtaining all of
        //  the tibet:groups under the body.
        if (TP.notEmpty(allGroups = this.getDocument().getBody().get(
                        'tibet:group'.asType().getQueryPath(
                                                wantsNested, false, false)))) {

            //  If there is only one group and it's the same group as the one
            //  we're coming from, then just return null
            if (!TP.isArray(allGroups) && allGroups === fromGroupTPElem) {
                return null;
            }

            //  Wrap all of them.
            memberGroupTPElems = TP.wrap(allGroups);

            //  Look for the group out of all of the groups that comes
            //  before the 'from' group.
            if (TP.notValid(prevGroupTPElem = memberGroupTPElems.before(
                                    fromGroupTPElem, TP.EQUALITY, true))) {
                //  There is no 'previous' group before the 'from group'. If
                //  shouldWrap is true, set the previous group element to be
                //  the last element - otherwise, return null
                if (shouldWrap) {
                    prevGroupTPElem = memberGroupTPElems.last();
                } else {
                    return null;
                }
            }
        } else {
            //  There are no tibet:group elements - return null
            return null;
        }
    } else {
        //  Grab the parent group's TP.dom.ElementNode and its member
        //  groups.
        parentGroupTPElem = TP.byId(parentGroupName, win);
        memberGroupTPElems = parentGroupTPElem.getMemberGroups();

        //  If there is only one member group, then it is the 'from' group
        //  itself - choose the parent group
        if (memberGroupTPElems.getSize() === 1) {
            prevGroupTPElem = parentGroupTPElem;
        } else if (TP.notValid(prevGroupTPElem = memberGroupTPElems.before(
                                    fromGroupTPElem, TP.EQUALITY, true))) {

            //  Otherwise, look for the group out of all of the groups *of only
            //  the parent group* that comes before the 'from' group.

            //  If the parent tibet:group has a 'wrapWhen' attribute on it
            //  use that to determine whether we should wrap... unless we
            //  should always wrap, ignoring 'wrapWhen'
            if (parentGroupTPElem.hasAttribute('wrapWhen') || shouldWrap) {
                //  TODO: There are other values for 'wrapWhen'
                prevGroupTPElem = memberGroupTPElems.last();
            } else {
                //  Can't find the previous group and we're not wrapping -
                //  return null
                return null;
            }
        }
    }

    return prevGroupTPElem.getAttribute('id');
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getScrollOffsetPoint',
function() {

    /**
     * @method getScrollOffsetPoint
     * @summary Returns the receiver's scroll offset position (i.e. scrollLeft &
     *     scrollTop) as a TP.gui.Point.
     * @returns {TP.gui.Point} The receiver's scroll offset position.
     */

    var elem;

    elem = this.getNativeNode();

    return TP.pc(elem.scrollLeft, elem.scrollTop);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getStyleProperty',
function(aProperty) {

    /**
     * @method getStyleProperty
     * @summary Gets the receiver's style property named by the supplied
     *     property name. Note that this will be the *local* style value - not
     *     the *computed* style value.
     * @param {String} aProperty The name of the style property to get.
     * @returns {Object} The current value of the local style property named by
     *     aProperty on the supplied element.
     */

    return TP.elementGetStyleProperty(this.getNativeNode(), aProperty);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getSubmitName',
function() {

    /**
     * @method getSubmitName
     * @summary Returns the name under which the receiver would be submitted
     *     when used in a forms context. This defaults to the value of the id
     *     attribute, followed by the name attribute.
     * @returns {String} The receiver's submission name.
     */

    var node;

    node = this.getNativeNode();

    //  ID is our first choice, followed by Name
    return TP.elementGetAttribute(node, 'id') ||
            TP.elementGetAttribute(node, 'name');
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getStylesheetForStyleResource',
function() {

    /**
     * @method getStylesheetForStyleResource
     * @summary Returns a native CSSStylesheet object for the receiver's style
     *     resource (i.e. the stylesheet that would've been added via the
     *     'addStylesheetTo' method).
     * @returns {CSSStylesheet} The native CSSStyleSheet object.
     */

    var cssElementID,
        cssElement,

        stylesheet;

    //  We compute an 'id' by taking our *resource* type name and escaping
    //  it. The resource type name is usually the type name, but can be
    //  overridden for special types that need to supply a different name
    //  here for use in resource location computations.
    cssElementID = TP.escapeTypeName(this.getType().getResourceTypeName());

    //  Try to find the style element in our document given the computed ID.
    cssElement = TP.byId(cssElementID, this.getNativeDocument(), false);
    if (!TP.isElement(cssElement)) {
        return null;
    }

    //  If a 'tibet:style' element was found, then that means that we're
    //  executing in a non-inlined environment that will allow alternate style
    //  content (like LESS) to be brought in directly. But we're not interested
    //  in that element - we're only interested in native CSS elements that are
    //  generated from those.
    if (TP.elementGetFullName(cssElement) === 'tibet:style') {
        //  The *real* stylesheet is the one created when the LESS or whatever
        //  is finished processing will be the ID with the word '_generated'
        //  appended to it.
        cssElement = TP.byId(cssElementID + '_generated',
                                this.getNativeDocument(),
                                false);
    }

    //  If we couldn't find it, then exit.
    if (!TP.isElement(cssElement)) {
        return null;
    }

    //  Obtain the CSSStyleSheet object associated with that style element.
    stylesheet = TP.cssElementGetStyleSheet(cssElement);

    return stylesheet;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getWidth',
function() {

    /**
     * @method getWidth
     * @summary Returns the receiver's width in pixels.
     * @returns {Number} The receiver's width in pixels.
     */

    return TP.elementGetWidth(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getWidthAndHeight',
function() {

    /**
     * @method getWidthAndHeight
     * @summary Returns the receiver's width and height as an Array of pixels.
     * @returns {Number[]} An Array of the receiver's width and height in
     *     pixels.
     */

    return TP.ac(TP.elementGetWidth(this.getNativeNode()),
                    TP.elementGetHeight(this.getNativeNode()));
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('hasFocus',
function(includeDescendants) {

    /**
     * @method hasFocus
     * @summary Returns whether or not the receiver (or any of its descendants,
     *     by default), are currently the focused element.
     * @param {Boolean} [includeDescendants=true] Should descendant elements be
     *     considered when trying to determine whether the receiver has focus.
     * @returns {Boolean} Whether or not the receiver has focus.
     */

    var focusedTPElem,
        hasFocus;

    focusedTPElem = this.getFocusedElement();
    if (TP.notValid(focusedTPElem)) {
        return false;
    }

    hasFocus = focusedTPElem.identicalTo(this);
    if (!hasFocus && TP.notFalse(includeDescendants)) {
        hasFocus = this.contains(focusedTPElem);
    }

    return hasFocus;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('hide',
function(preserveSpace) {

    /**
     * @method hide
     * @summary Hides the receiver's node.
     * @param {Boolean} preserveSpace Whether or not to 'preserve the space'
     *     taken up by the element in its document. The default is false.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    TP.elementHide(this.getNativeNode(), preserveSpace);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('ignoreKeybindingsDirectly',
function() {

    /**
     * @method ignoreKeybindingsDirectly
     * @summary Ignore any handler that's been installed to observe signals
     *     (normally those that use OBSERVER_FIRING) that are thrown from keys
     *     that are bound using the receiver's key bindings. This is normally
     *     used in a 'temporary mode' for a GUI element.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var keySignalHandler;

    //  Grab the private, instance-level key handler that would've gotten
    //  installed when the observation was made in the
    //  'observeKeybindingsDirectly' method.
    keySignalHandler = this.$get('$$keybindingSignalHandler');

    if (TP.isCallable(keySignalHandler)) {
        this.ignore(TP.core.Keyboard.getCurrentKeyboard(),
                    'TP.sig.DOMKeySignal',
                    keySignalHandler);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('isDisabled',
function() {

    /**
     * @method isDisabled
     * @summary Returns whether or not the receiver is *really* disabled. This
     *     includes whether any of the receiver's parent nodes are disabled,
     *     which means that the receiver is disabled.
     * @returns {Boolean} Whether or not anElement is disabled.
     */

    return TP.elementIsDisabled(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('isDisplayed',
function() {

    /**
     * @method isDisplayed
     * @summary Returns whether or not the receiver is displayed to the user.
     *     This is dependent not only on its own 'display' and 'visibility'
     *     settings, but on those settings of its parents.
     * @description Note that this only tests whether the receiver is currently
     *     being displayed insofar as CSS is concerned. The receiver very well
     *     may be scrolled off screen or under the influence of a CSS transform
     *     that would cause it to not be visible to the user. Use the
     *     isVisible() method to test whether the element is truly visible.
     * @returns {Boolean} Whether or not anElement is displayed.
     */

    return TP.elementIsDisplayed(this.getNativeNode());
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('isOverflowing',
function(direction) {

    /**
     * @method isOverflowing
     * @summary Returns whether or not the receiver is overflowing its
     *     containing block.
     * @param {String} [direction] The direction to test overflowing. If
     *     specified, this should be either TP.HORIZONTAL or TP.VERTICAL. If
     *     this is not specified, then both directions will be tested.
     * @returns {Boolean} Whether or not the receiver is overflowing its
     *     containing block.
     */

    var elem;

    elem = this.getNativeNode();

    switch (direction) {

        case TP.VERTICAL:
            if (elem.offsetHeight === 0) {
                return false;
            }
            return elem.scrollHeight > elem.offsetHeight;

        case TP.HORIZONTAL:
            if (elem.offsetWidth === 0) {
                return false;
            }
            return elem.scrollWidth > elem.offsetWidth;

        default:
            if (elem.offsetWidth === 0 && elem.offsetHeight === 0) {
                return false;
            }
            return elem.scrollHeight > elem.offsetHeight ||
                    elem.scrollWidth > elem.offsetWidth;
    }
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('isReadyToRender',
function() {

    /**
     * @method isReadyToRender
     * @summary Whether or not the receiver is 'ready to render'. Normally, this
     *     means that all of the resources that the receiver relies on to render
     *     have been loaded.
     * @returns {Boolean} Whether or not the receiver is ready to render.
     */

    var styleURI,
        gids;

    styleURI = this.getType().getResourceURI('style', TP.ietf.mime.CSS);
    if (TP.notValid(styleURI) || styleURI === TP.NO_RESULT) {
        return true;
    }

    //  Check with the set of global IDs that our type is keeping and see if
    //  that contains our document's global ID. If so, then that means that our
    //  style sheets have been loaded into our document.
    gids = this.getType().get('loadedStylesheetDocumentGIDs');

    return gids.indexOf(this.getDocument().getGlobalID()) !== TP.NOT_FOUND;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('isVisible',
function(partial, direction, wantsTransformed) {

    /**
     * @method isVisible
     * @summary Returns whether or not the receiver is *really* visible to the
           user, no matter what its CSS setting is.
     * @description In addition to the standard CSS properties of 'display' and
           'visibility', this call also takes into account scrolling and any
           CSS transformation that has been applied to the element.
     * @param {Boolean} [partial=false] Whether or not the element can be
     *     partially visible or has to be completely visible. The default is
     *     false (i.e. it should be completely visible).
     * @param {String} [direction] The direction to test visibility in. If
     *     specified, this should be either TP.HORIZONTAL or TP.VERTICAL. If
     *     this is not specified, then both directions will be tested.
     * @param {Boolean} [wantsTransformed=false] An optional parameter that
     *     determines whether to use 'transformed' values if the element has
     *     been transformed with a CSS transformation. The default is false.
     * @returns {Boolean} Whether or not anElement is visible.
     */

    return TP.elementIsVisible(this.getNativeNode(),
                                partial, direction, wantsTransformed);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('observeKeybindingsDirectly',
function() {

    /**
     * @method observeKeybindingsDirectly
     * @summary Installed a handler to observe signals (normally those that use
     *     OBSERVER_FIRING) that are thrown from keys that are bound using the
     *     receiver's key bindings. This is normally used in a 'temporary mode'
     *     for a GUI element.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var keySignalHandler;

    //  Define a handler that will trigger a signal based on a mapping in a
    //  keybindings map.

    keySignalHandler = function(aSignal) {

        var evt,
            keyname,

            sigName,
            sigType;

        //  Look in the external keybindings map. If there's an entry there,
        //  then we get the signal name from there.

        evt = aSignal.getPayload();
        keyname = TP.eventGetDOMSignalName(evt);

        //  Query for a signal name via the getKeybinding method. This call will
        //  look up through the supertype chain for the first match.
        sigName = this.getType().getKeybinding(keyname);
        if (TP.isEmpty(sigName)) {
            return this;
        }

        //  If the signal name is a real TIBET type, then go ahead and signal
        //  using the name, using the currently focused TP.dom.ElementNode as
        //  the 'target' of this signal.
        sigType = TP.sys.getTypeByName(sigName);
        if (TP.isType(sigType)) {
            this.signal(sigName, TP.hc('trigger', TP.wrap(evt)));
        }

        return this;
    }.bind(this);

    //  Set up the observation.
    this.observe(TP.core.Keyboard.getCurrentKeyboard(),
                    'TP.sig.DOMKeySignal',
                    keySignalHandler);

    this.defineAttribute('$$keybindingSignalHandler');
    this.$set('$$keybindingSignalHandler', keySignalHandler);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('moveFocus',
function(moveAction) {

    /**
     * @method moveFocus
     * @summary Moves the focus to a 'successor' element based on the
     *     information contained in the supplied event and on the move action.
     * @param {String} moveAction The type of 'move' that the user requested.
     *     This can be one of the following:
     *          TP.FIRST
     *          TP.LAST
     *          TP.NEXT
     *          TP.PREVIOUS
     *          TP.FIRST_IN_GROUP
     *          TP.LAST_IN_GROUP
     *          TP.FIRST_IN_NEXT_GROUP
     *          TP.FIRST_IN_PREVIOUS_GROUP
     *          TP.FOLLOWING
     *          TP.PRECEDING
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var currentTPElem,

        successorTPElem;

    //  NB: We pass 'true' here because we want the 'body' element returned if
    //  no other element is focused
    currentTPElem = this.getFocusedElement(true);

    //  If there was a real currently focused element, then we move away from it
    //  to the desired element.
    if (TP.isKindOf(currentTPElem, TP.dom.UIElementNode)) {
        //  Now, compute the 'successor' element to focus based on the move
        //  action, the event and the currently focused element (which is
        //  ourself since the signal was fired at us). This could be null if
        //  there is no successor element.
        successorTPElem = this.computeSuccessorFocusElement(
                                        currentTPElem, moveAction);
    } else {
        //  Otherwise, there was no currently focused element, so we compute
        //  the successor element in a different way.
        successorTPElem = this.computeSuccessorFocusElement(
                                        null, moveAction);
    }

    //  If there's a real successor element, then focus it. This will cause the
    //  standard focusing behavior to take over which should cause
    //  UIFocus/UIDidFocus to be signaled, etc. etc.
    if (TP.isKindOf(successorTPElem, TP.dom.UIElementNode)) {

        TP.dom.UIElementNode.set('$calculatedFocusingTPElem', successorTPElem);

        //  We do this to match the native focusing behavior that haven't been
        //  sent through this computation routine (i.e. clicks, etc.)

        //  Note that we pass the moveAction here - if this is a group, it will
        //  act as a hint as to where to put the focus within the group.
        successorTPElem.focus(moveAction);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('removeAttrActive',
function() {

    /**
     * @method removeAttrActive
     * @summary Remove the attribute corresponding to the receiver's active
     *     state.
     * @returns {Boolean} false
     */

    return this.$isInState('pclass:active', false);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('removeAttrBusy',
function() {

    /**
     * @method removeAttrBusy
     * @summary Remove the attribute corresponding to the receiver's busy
     *     state.
     * @returns {Boolean} false
     */

    return this.$isInState('pclass:busy', false);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('removeAttrClosed',
function() {

    /**
     * @method removeAttrClosed
     * @summary Remove the attribute corresponding to the receiver's closed
     *     state.
     * @returns {Boolean} false
     */

    return this.$isInState('pclass:closed', false);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('removeAttrCollapsed',
function() {

    /**
     * @method removeAttrCollapsed
     * @summary Remove the attribute corresponding to the receiver's collapsed
     *     state.
     * @returns {Boolean} false
     */

    return this.$isInState('pclass:collapsed', false);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('removeAttrDisabled',
function() {

    /**
     * @method removeAttrDisabled
     * @summary Remove the attribute corresponding to the receiver's disabled
     *     state.
     * @returns {Boolean} false
     */

    this.$removeAttribute('disabled');

    return this.$isInState('pclass:disabled', false);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('removeAttrFocused',
function() {

    /**
     * @method removeAttrFocused
     * @summary Remove the attribute corresponding to the receiver's focused
     *     state.
     * @returns {Boolean} false
     */

    return this.$isInState('pclass:focus', false);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('removeAttrHidden',
function() {

    /**
     * @method removeAttrHidden
     * @summary Remove the attribute corresponding to the receiver's hidden
     *     state.
     * @returns {Boolean} false
     */

    return this.$isInState('pclass:hidden', false);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('removeAttrInvalid',
function() {

    /**
     * @method removeAttrInvalid
     * @summary Remove the attribute corresponding to the receiver's invalid
     *     state.
     * @returns {Boolean} false
     */

    return this.$isInState('pclass:invalid', false);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('removeAttrOutOfRange',
function() {

    /**
     * @method removeAttrOutOfRange
     * @summary Remove the attribute corresponding to the receiver's
     *     out-of-range state.
     * @returns {Boolean} false
     */

    return this.$isInState('pclass:out-of-range', false);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('removeAttrReadonly',
function() {

    /**
     * @method removeAttrReadonly
     * @summary Remove the attribute corresponding to the receiver's readonly
     *     state.
     * @returns {Boolean} false
     */

    return this.$isInState('pclass:readonly', false);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('removeAttrRequired',
function() {

    /**
     * @method removeAttrRequired
     * @summary Remove the attribute corresponding to the receiver's required
     *     state.
     * @returns {Boolean} false
     */

    return this.$isInState('pclass:required', false);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('removeAttrSelected',
function() {

    /**
     * @method removeAttrSelected
     * @summary Remove the attribute corresponding to the receiver's selected
     *     state.
     * @returns {Boolean} false
     */

    return this.$isInState('pclass:selected', false);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('removeStyleProperty',
function(aProperty) {

    /**
     * @method removeStyleProperty
     * @summary Removes the receiver's style property named by the supplied
     *     property name.
     * @param {String} aProperty The name of the style property to remove.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    TP.elementRemoveStyleProperty(this.getNativeNode(), aProperty);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('removeTransform',
function() {

    /**
     * @method removeTransform
     * @summary Removes any CSS transform set on the receiver.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    TP.elementRemoveTransform(this.getNativeNode());

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('resignFocusedResponder',
function() {

    /**
     * @method resignFocusedResponder
     * @summary Tells the receiver that it is no longer the 'focused
     *     responder'.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var newFocusTPElem,
        newFocusContext,

        currentFocusContext,

        foundPreviousContext,

        foundContext,
        tpElementToFocus;

    //  The element that the focus is moving to. This might be null if we aren't
    //  being told to resign focus because of the TIBET focus manager.
    newFocusTPElem = TP.dom.UIElementNode.get('$calculatedFocusingTPElem');

    //  Now, we should clear the $calculatedFocusingTPElem property so that
    //  focusing on the new element will succeed. We'll adjust this below as
    //  necessary in case we don't want the focusing to happen on the 'current
    //  new element' that the system thinks it wants to focus on, but another
    //  element of our own choosing.
    TP.dom.UIElementNode.set('$calculatedFocusingTPElem', null);

    //  If the system has this flag on, that must mean that a component with a
    //  different focus context will be taking focus, but in an asynchronous
    //  fashion. Therefore, we do *not* want to proceed with manipulating the
    //  focus stack. We want to leave the current element on there.
    if (TP.dom.UIElementNode.get('$asyncSwitchingContexts')) {
        TP.dom.UIElementNode.set('$asyncSwitchingContexts', false);
        return this;
    }

    //  If the focus stack is empty, exit here - the 'becomeFocusedResponder'
    //  routine will take care of pushing the new element on the stack.
    if (TP.isEmpty(TP.$focus_stack)) {
        return this;
    }

    //  We are the currently focused element, get our focus context
    currentFocusContext = this.getFocusContextElement();

    //  Grab the new focus context. This will either be the calculated focus
    //  context or a focus context that can be computed from the element that
    //  TIBET wants us to focus. Since the focusing element is becoming the
    //  focused responder, this context will be considered to be the 'new'
    //  context.
    newFocusContext = TP.dom.UIElementNode.get('$calculatedFocusContext');
    if (TP.notValid(newFocusContext)) {
        if (TP.isKindOf(newFocusTPElem, TP.dom.UIElementNode)) {
            newFocusContext = newFocusTPElem.getFocusContextElement();
        }
    }

    //  If we haven't been able to calculate a new focus context and the focus
    //  stack has at least 2 elements on it, then use the focus context of the
    //  element that is the *second to the last* (because the element that we're
    //  resigning is the last element).
    foundPreviousContext = false;
    if (TP.notValid(newFocusContext) && TP.$focus_stack.getSize() > 1) {
        newFocusContext = TP.$focus_stack.at(-2).getFocusContextElement();
        if (TP.isValid(newFocusContext)) {

            //  Track whether or not we found a previous context.
            foundPreviousContext = true;
        }
    }

    //  If the two focus contexts are the same, then we pop the old focused
    //  element, and exit here. The new element will be pushed by the
    //  becomeFocusedResponder() method.
    if (TP.notValid(newFocusContext) ||
        newFocusContext.identicalTo(currentFocusContext)) {

        this.getType().popOffFocusStack();

        this.signal('TP.sig.UIDidPopFocus');

        return this;
    }

    //  Look at the stack to see if the focus context for the 'new' element is
    //  the same as the focus context of one of the elements that has already
    //  been pushed at some point.

    foundContext = TP.$focus_stack.detect(
            function(aTPElement) {
                return aTPElement.getFocusContextElement().identicalTo(
                                                        newFocusContext);
            });

    //  We found a context back on the stack that is the same focus context as
    //  the 'new' element.
    if (TP.isValid(foundContext)) {
        //  Pop the stack once to get back to the previously focused element.
        this.getType().popOffFocusStack();

        this.signal('TP.sig.UIDidPopFocus');

        //  Pop it again (and capture the value because this will be the element
        //  that we want to refocus) to get back to the element *before* the
        //  previously focused element. We're gonna re-push the previously
        //  focused element when we focus it below.
        tpElementToFocus = this.getType().popOffFocusStack();

        //  If we found a previous context, then we go ahead and focus what was
        //  previously the *second to last* (but is now the last) element on the
        //  focus stack.
        if (foundPreviousContext) {
            tpElementToFocus.focus();
        } else {

            //  Otherwise, reset the 'focusing element' to be the previously
            //  focused element. The presence of this element will cause the
            //  currently focusing element to *not* be focused (the event will
            //  be cancelled) and then the 'focus' call below will try to focus
            //  this element *after it is forked* (allowing the stack to
            //  unwind). See 'acceptFocusedResponder' for more information.
            TP.dom.UIElementNode.set(
                    '$calculatedFocusingTPElem', tpElementToFocus);
        }
    }

    //  The new element's focusing context has never been encountered before -
    //  leave the stack alone and just return.

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('scrollBy',
function(direction, incrementValue, cssProperty) {

    /**
     * @method scrollBy
     * @summary Scrolls the receiver (which should be clipped in some fashion)
     *     in the supplied direction by the supplied incrementValue. Note that
     *     this increment value can be provided as a non-pixel value ('1em' or
     *     '30%') and this will be converted to a pixel value.
     * @param {String} direction A named direction to scroll the element. Any
     *     one of:
     *          TP.UP
     *          TP.RIGHT
     *          TP.DOWN
     *          TP.LEFT
     * @param {String|Number} incrementValue The amount to scroll by. If this is
     *     a Number, it will be assumed to be a number of pixels. Otherwise, it
     *     will be used as a CSS value that a number of pixels will be computed
     *     from.
     * @param {String} [cssProperty] The name of the property being used to
     *     compute a pixel value from the supplied incrementValue. This is only
     *     required if a percentage value is given, but is desired to produce
     *     the most accurate results.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var elem,
        bufferSize,
        computedIncrement;

    elem = this.getNativeNode();

    //  If we're paging, then we want to go one whole 'page' (i.e. offset
    //  width/height) minus 2em of 'buffer' to give the user a visual cue.
    if (incrementValue === TP.PAGE) {

        bufferSize = TP.elementGetPixelValue(
                            elem,
                            TP.sys.cfg('tibet.ui_paging_buffer', '20px'),
                            cssProperty);

        if (direction === TP.UP || direction === TP.DOWN) {
            computedIncrement = TP.elementGetHeight(elem) - bufferSize;
        } else if (direction === TP.LEFT || direction === TP.RIGHT) {
            computedIncrement = TP.elementGetWidth(elem) - bufferSize;
        } else {
            computedIncrement = 0;
        }
    } else if (incrementValue === TP.LINE) {

        computedIncrement = TP.elementGetPixelValue(
                            elem,
                            TP.sys.cfg('tibet.ui_scrolling_lineheight', '20px'),
                            cssProperty);

    } else {
        computedIncrement = TP.elementGetPixelValue(
                                    elem, incrementValue, cssProperty);
    }

    switch (direction) {
        case TP.UP:
            elem.scrollTop -= computedIncrement;
            break;
        case TP.RIGHT:
            elem.scrollLeft += computedIncrement;
            break;
        case TP.DOWN:
            elem.scrollTop += computedIncrement;
            break;
        case TP.LEFT:
            elem.scrollLeft -= computedIncrement;
            break;
        default:
            break;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('scrollTo',
function(direction, scrollValue, cssProperty) {

    /**
     * @method scrollTo
     * @summary Scrolls the receiver (which should be clipped in some fashion)
     *     to either a side (TP.TOP, TP.RIGHT, TP.BOTTOM, TP.LEFT) directly or
     *     to a value of a particular direction (TP.HORIZONTAL or TP.VERTICAL).
     * @param {String} direction A named direction to scroll the element. Any
     *     one of:
     *          TP.TOP
     *          TP.RIGHT
     *          TP.BOTTOM
     *          TP.LEFT
     *
     *          TP.HORIZONTAL
     *          TP.VERTICAL
     * @param {String|Number} scrollValue The value to scroll to. If this is
     *     a Number, it will be assumed to be a number of pixels. Otherwise, it
     *     will be used as a CSS value that a number of pixels will be computed
     *     from. This parameter will not be used unless TP.HORIZONTAL or
     *     TP.VERTICAL is used.
     * @param {String} [cssProperty] The name of the property being used to
     *     compute a pixel value from the supplied incrementValue. This is only
     *     required if a percentage value is given, but is desired to produce
     *     the most accurate results. This parameter will not be used unless
     *     TP.HORIZONTAL or TP.VERTICAL is used.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var elem,
        computedValue;

    elem = this.getNativeNode();

    if (direction === TP.HORIZONTAL || direction === TP.VERTICAL) {
        computedValue = TP.elementGetPixelValue(
                                    elem, scrollValue, cssProperty);
    }

    switch (direction) {
        case TP.TOP:
            elem.scrollTop = 0;
            break;
        case TP.RIGHT:
            elem.scrollLeft = elem.scrollWidth;
            break;
        case TP.BOTTOM:
            elem.scrollTop = elem.scrollHeight;
            break;
        case TP.LEFT:
            elem.scrollLeft = 0;
            break;
        case TP.HORIZONTAL:
            elem.scrollLeft = computedValue;
            break;
        case TP.VERTICAL:
            elem.scrollTop = computedValue;
            break;
        default:
            break;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('$setAttribute',
function(attributeName, attributeValue, shouldSignal) {

    /**
     * @method $setAttribute
     * @summary Sets the value of the named attribute. This version overrides
     *     the one inherited from TP.dom.ElementNode to not bother with
     *     snapshotting changes to a transactionally consistent DOM, since this
     *     object's native node is an on-screen control.
     * @param {String} attributeName The attribute name to set.
     * @param {Object} attributeValue The value to set.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {undefined} Undefined according to the spec for DOM
     *     'setAttribute'.
     */

    var node,

        hadAttribute,

        flag,

        nameParts,
        prefix,
        name,

        url,

        attrNode,
        attrTPNode,
        attrFlag,

        id,
        attrURI;

    node = this.getNativeNode();

    hadAttribute = TP.elementHasAttribute(node, attributeName, true);

    //  NB: Use this construct this way for better performance
    if (TP.notValid(flag = shouldSignal)) {
        flag = this.shouldSignalChange();
    }

    //  if this is a prefixed attribute then we'll attempt to "do the right
    //  thing" by finding the registered namespace and placing the attribute
    //  in that namespace
    if (TP.regex.NS_QUALIFIED.test(attributeName)) {
        nameParts = attributeName.match(TP.regex.NS_QUALIFIED);
        prefix = nameParts.at(1);
        name = nameParts.at(2);

        if (attributeName.startsWith('xmlns')) {
            //  If the caller was trying to add an 'xmlns' attribute, then
            //  first check to make sure that they weren't trying to set the
            //  default namespace - can't do that :-(.
            if (attributeName === 'xmlns') {
                //  TODO: Throw an error - you cannot reset the default
                //  namespace :-(.
                return;
            }

            //  Otherwise, they're trying to add a prefixed namespace
            //  definition.
            TP.elementAddNamespace(node,
                                    prefix + ':' + name,
                                    attributeValue);

            if (flag) {
                this.$changed('@' + attributeName, TP.UPDATE);
            }

            return;
        }

        //  seems like we're dealing with a prefixed attribute that isn't an
        //  xmlns attribute, so the question is do we know a URI so we can
        //  map it properly?
        if (TP.notEmpty(url = TP.w3.Xmlns.getPrefixURI(prefix))) {
            TP.elementSetAttributeInNS(node,
                                        prefix + ':' + name,
                                        attributeValue,
                                        url);
        } else {
            //  no known prefix, just set it as an attribute whose name
            //  happens to include a colon
            TP.elementSetAttribute(node, attributeName, attributeValue, true);
        }
    } else {
        TP.elementSetAttribute(node, attributeName, attributeValue, true);
    }

    if (flag) {
        this.$changed('@' + attributeName,
                        hadAttribute ? TP.UPDATE : TP.CREATE,
                        TP.hc(TP.OLDVAL,
                                TP.elementGetAttribute(
                                    node, attributeName, true),
                                TP.NEWVAL,
                                attributeValue));

        attrNode = TP.elementGetAttributeNode(node, attributeName, true);

        //  Now, in case anyone is bound to this attribute, wrap it, configure
        //  it to signal Change and send it.
        attrTPNode = TP.wrap(attrNode);

        //  Capture the value of whether the attribute node is configured to
        //  signal changes and then configure it to definitely signal a Change.
        attrFlag = attrTPNode.shouldSignalChange();
        attrTPNode.shouldSignalChange(true);

        //  Signal the Change
        attrTPNode.$changed('value', TP.UPDATE);

        //  If the attribute is on an Element that's in the UICANVAS, then
        //  build a URI from it and signal a 'change' from that URI, for any
        //  data bindings that are using 'direct to GUI' binding.
        if (TP.nodeGetWindow(attrNode) === TP.sys.getUICanvas(true)) {
            id = this.getLocalID();
            attrURI = TP.uc('tibet://uicanvas#' + id + '@' + attributeName);
            attrURI.$changed();
        }

        //  Put the 'should signal change' value back to whatever it was.
        attrTPNode.shouldSignalChange(attrFlag);
    }

    //  setAttribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('$setFacet',
function(aspectName, facetName, facetValue, shouldSignal) {

    /**
     * @method $setFacet
     * @summary Sets the value of the named facet of the named aspect to the
     *     value provided. This method should be called from any 'custom facet
     *     setter' in order to a) set the property and b) signal a change, if
     *     configured.
     * @param {String} aspectName The name of the aspect to set.
     * @param {String} facetName The name of the facet to set.
     * @param {Object} facetValue The value to set the facet to.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {Object} The receiver.
     */

    var funcName;

    //  If the facet is 'value', then use the standard 'set' mechanism.
    if (facetName === 'value') {

        //  See if there is a specific Attribute setter on this element. If so,
        //  use it to set any attribute named with the aspect name. This will be
        //  done in addition to any internal value of the aspect on the
        //  receiver (i.e. both attribute 'foo' and the internal 'foo' property
        //  will be set).

        funcName = this.computeAttrMethodName('setAttr', aspectName);

        if (TP.canInvoke(this, funcName)) {
            this[funcName](facetValue);
        } else {

            //  NB: This will signal the standard TP.sig.ValueChange (where
            //  'value' is the facet that changed).
            this.set(aspectName, facetValue, shouldSignal);
        }

        return this;
    }

    //  This will signal with the facet name as the facet that changed.
    this.signalUsingFacetAndValue(facetName, facetValue);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setGroupElement',
function(aTPElem) {

    /**
     * @method setGroupElement
     * @summary Sets the supplied tibet:group element as a grouping element for
     *     the receiver.
     * @param {tibet:group|null} aTPElem The element to use as the grouping
     *     element for the receiver. If this parameter is null, then the
     *     receiver will be disassociated from any group.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (TP.isValid(aTPElem)) {
        this.setAttribute('tibet:group', aTPElem.getLocalID());
    } else {
        this.removeAttribute('tibet:group');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setHeight',
function(aHeight) {

    /**
     * @method setHeight
     * @summary Sets the receiver's height.
     * @description If a Number is supplied to aHeight a default unit of 'px' is
     *     assumed.
     * @param {Number|String} aHeight The height dimension to set the receiver's
     *     height to.
     */

    return TP.elementSetHeight(this.getNativeNode(), aHeight);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setGlobalPosition',
function(aPointOrObject) {

    /**
     * @method setGlobalPosition
     * @summary Sets the position of the receiver by manipulating its top and
     *     left style properties. This method expects that these values are
     *     provided *relative to the top-level window containing the receiver*
     *     and that the receiver is positioned in some fashion.
     * @param {TP.gui.Point|TP.core.Hash|Number[]} aPointOrObject A TP.gui.Point
     *     to use or an object that has 'x' and 'y' slots or an Array that has
     *     x in the first position, and y in the second position.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var elem,
        elemWin,

        xVal,
        yVal,

        winFrameElem,
        frameOffsetXAndY,

        pagePosition;

    elem = this.getNativeNode();

    if (!TP.isWindow(elemWin = TP.nodeGetWindow(elem))) {
        return TP.raise(this, 'TP.sig.InvalidWindow');
    }

    if (TP.isKindOf(aPointOrObject, TP.gui.Point)) {
        xVal = aPointOrObject.getX();
        yVal = aPointOrObject.getY();
    } else if (TP.isHash(aPointOrObject)) {
        xVal = aPointOrObject.at('x');
        yVal = aPointOrObject.at('y');
    } else if (TP.isArray(aPointOrObject)) {
        xVal = aPointOrObject.at(0);
        yVal = aPointOrObject.at(1);
    } else {
        xVal = aPointOrObject.x;
        yVal = aPointOrObject.y;
    }

    if (TP.isElement(winFrameElem = elemWin.frameElement)) {
        //  Note here that we pass 'top' as the first argument since we
        //  really just want the offset of winFrameElem from the top (which
        //  will be 0,0 offset from itself).
        frameOffsetXAndY = TP.windowComputeWindowOffsets(
                            top,
                            TP.elementGetIFrameWindow(winFrameElem));
    } else {
        frameOffsetXAndY = TP.ac(0, 0);
    }

    pagePosition = TP.pc(xVal - frameOffsetXAndY.first(),
                            yVal - frameOffsetXAndY.last());

    this.setPagePosition(pagePosition);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setGlobalPositionAndSize',
function(aRectOrObject) {

    /**
     * @method setGlobalPositionAndSize
     * @summary Sets the position of the receiver by manipulating its top and
     *     left style properties. This method expects that these values are
     *     provided *relative to the top-level window containing the receiver*
     *     and that the receiver is positioned in some fashion. It also sets the
     *     width and height according to the data supplied.
     * @param {TP.gui.Rect|TP.core.Hash|Number[]} aRectOrObject A TP.gui.Rect to
     *     use or an object that has 'x', 'y', 'width' and 'height' slots or an
     *     Array that has x in the first position, y in the second position,
     *     width in the third position and height in the fourth position.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var elem,
        elemWin,

        xVal,
        yVal,
        widthVal,
        heightVal,

        winFrameElem,
        frameOffsetXAndY,

        pagePositionAndSize;

    elem = this.getNativeNode();

    if (!TP.isWindow(elemWin = TP.nodeGetWindow(elem))) {
        return TP.raise(this, 'TP.sig.InvalidWindow');
    }

    if (TP.isKindOf(aRectOrObject, TP.gui.Rect)) {
        xVal = aRectOrObject.getX();
        yVal = aRectOrObject.getY();
        widthVal = aRectOrObject.getWidth();
        heightVal = aRectOrObject.getHeight();
    } else if (TP.isHash(aRectOrObject)) {
        xVal = aRectOrObject.at('x');
        yVal = aRectOrObject.at('y');
        widthVal = aRectOrObject.at('width');
        heightVal = aRectOrObject.at('height');
    } else if (TP.isArray(aRectOrObject)) {
        xVal = aRectOrObject.at(0);
        yVal = aRectOrObject.at(1);
        widthVal = aRectOrObject.at(2);
        heightVal = aRectOrObject.at(3);
    } else {
        xVal = aRectOrObject.x;
        yVal = aRectOrObject.y;
        widthVal = aRectOrObject.width;
        heightVal = aRectOrObject.height;
    }

    if (TP.isElement(winFrameElem = elemWin.frameElement)) {
        //  Note here that we pass 'top' as the first argument since we
        //  really just want the offset of winFrameElem from the top (which
        //  will be 0,0 offset from itself).
        frameOffsetXAndY = TP.windowComputeWindowOffsets(
                            top,
                            TP.elementGetIFrameWindow(winFrameElem));
    } else {
        frameOffsetXAndY = TP.ac(0, 0);
    }

    pagePositionAndSize = TP.rtc(
                            xVal - frameOffsetXAndY.first(),
                            yVal - frameOffsetXAndY.last(),
                            widthVal,
                            heightVal);

    this.setPagePositionAndSize(pagePositionAndSize);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setOffsetPosition',
function(aPointOrObject) {

    /**
     * @method setOffsetPosition
     * @summary Sets the position of the receiver by manipulating its top and
     *     left style properties. This method expects that these values are
     *     provided *relative to the offset parent of the receiver* and that the
     *     receiver is positioned in some fashion.
     * @param {TP.gui.Point|TP.core.Hash|Number[]} aPointOrObject A TP.gui.Point
     *     to use or an object that has 'x' and 'y' slots or an Array that has
     *     x in the first position, and y in the second position.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var styleObj;

    styleObj = TP.elementGetStyleObj(this.getNativeNode());

    if (TP.isKindOf(aPointOrObject, TP.gui.Point)) {
        styleObj.left = aPointOrObject.getX() + 'px';
        styleObj.top = aPointOrObject.getY() + 'px';
    } else if (TP.isHash(aPointOrObject)) {
        styleObj.left = aPointOrObject.at('x') + 'px';
        styleObj.top = aPointOrObject.at('y') + 'px';
    } else if (TP.isArray(aPointOrObject)) {
        styleObj.left = aPointOrObject.at(0) + 'px';
        styleObj.top = aPointOrObject.at(1) + 'px';
    } else {
        styleObj.left = aPointOrObject.x + 'px';
        styleObj.top = aPointOrObject.y + 'px';
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setOffsetPositionAndSize',
function(aRectOrObject) {

    /**
     * @method setOffsetPositionAndSize
     * @summary Sets the position of the receiver by manipulating its top and
     *     left style properties. This method expects that these values are
     *     provided *relative to the offset parent of the receiver* and that the
     *     receiver is positioned in some fashion. It also sets the width and
     *     height according to the data supplied.
     * @param {TP.gui.Rect|TP.core.Hash|Number[]} aRectOrObject A TP.gui.Rect to
     *     use or an object that has 'x', 'y', 'width' and 'height' slots or an
     *     Array that has x in the first position, y in the second position,
     *     width in the third position and height in the fourth position.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var styleObj;

    styleObj = TP.elementGetStyleObj(this.getNativeNode());

    if (TP.isKindOf(aRectOrObject, TP.gui.Rect)) {
        styleObj.left = aRectOrObject.getX() + 'px';
        styleObj.top = aRectOrObject.getY() + 'px';
        styleObj.width = aRectOrObject.getWidth() + 'px';
        styleObj.height = aRectOrObject.getHeight() + 'px';
    } else if (TP.isHash(aRectOrObject)) {
        styleObj.left = aRectOrObject.at('x') + 'px';
        styleObj.top = aRectOrObject.at('y') + 'px';
        styleObj.width = aRectOrObject.at('width') + 'px';
        styleObj.height = aRectOrObject.at('height') + 'px';
    } else if (TP.isArray(aRectOrObject)) {
        styleObj.left = aRectOrObject.at(0) + 'px';
        styleObj.top = aRectOrObject.at(1) + 'px';
        styleObj.width = aRectOrObject.at(2) + 'px';
        styleObj.height = aRectOrObject.at(3) + 'px';
    } else {
        styleObj.left = aRectOrObject.x + 'px';
        styleObj.top = aRectOrObject.y + 'px';
        styleObj.width = aRectOrObject.width + 'px';
        styleObj.height = aRectOrObject.height + 'px';
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setPagePosition',
function(aPointOrObject) {

    /**
     * @method setPagePosition
     * @summary Sets the position of the receiver by manipulating its top and
     *     left style properties. This method expects that these values are
     *     provided *relative to the whole page of the receiver* and that the
     *     receiver is positioned in some fashion.
     * @param {TP.gui.Point|TP.core.Hash|Number[]} aPointOrObject A TP.gui.Point
     *     to use or an object that has 'x' and 'y' slots or an Array that has
     *     x in the first position, and y in the second position.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var xVal,
        yVal,

        elem,
        offsets,
        styleObj;

    if (TP.isKindOf(aPointOrObject, TP.gui.Point)) {
        xVal = aPointOrObject.getX();
        yVal = aPointOrObject.getY();
    } else if (TP.isHash(aPointOrObject)) {
        xVal = aPointOrObject.at('x');
        yVal = aPointOrObject.at('y');
    } else if (TP.isArray(aPointOrObject)) {
        xVal = aPointOrObject.at(0);
        yVal = aPointOrObject.at(1);
    } else {
        xVal = aPointOrObject.x;
        yVal = aPointOrObject.y;
    }

    elem = this.getNativeNode();

    offsets = TP.elementGetOffsetFromContainer(TP.elementGetOffsetParent(elem));

    styleObj = TP.elementGetStyleObj(elem);

    /* eslint-disable no-extra-parens */
    styleObj.left = (xVal - offsets.first()) + 'px';
    styleObj.top = (yVal - offsets.last()) + 'px';
    /* eslint-enable no-extra-parens */

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setPagePositionAndSize',
function(aRectOrObject) {

    /**
     * @method setPagePositionAndSize
     * @summary Sets the position of the receiver by manipulating its top and
     *     left style properties. This method expects that these values are
     *     provided *relative to the whole page of the receiver* and that the
     *     receiver is positioned in some fashion. It also sets the width and
     *     height according to the data supplied.
     * @param {TP.gui.Rect|TP.core.Hash|Number[]} aRectOrObject A TP.gui.Rect to
     *     use or an object that has 'x', 'y', 'width' and 'height' slots or an
     *     Array that has x in the first position, y in the second position,
     *     width in the third position and height in the fourth position.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var xVal,
        yVal,

        elem,
        offsets,
        styleObj;

    styleObj = TP.elementGetStyleObj(this.getNativeNode());

    if (TP.isKindOf(aRectOrObject, TP.gui.Rect)) {
        xVal = aRectOrObject.getX();
        yVal = aRectOrObject.getY();
        styleObj.width = aRectOrObject.getWidth() + 'px';
        styleObj.height = aRectOrObject.getHeight() + 'px';
    } else if (TP.isHash(aRectOrObject)) {
        xVal = aRectOrObject.at('x');
        yVal = aRectOrObject.at('y');
        styleObj.width = aRectOrObject.at('width') + 'px';
        styleObj.height = aRectOrObject.at('height') + 'px';
    } else if (TP.isArray(aRectOrObject)) {
        xVal = aRectOrObject.at(0);
        yVal = aRectOrObject.at(1);
        styleObj.width = aRectOrObject.at(2) + 'px';
        styleObj.height = aRectOrObject.at(3) + 'px';
    } else {
        xVal = aRectOrObject.x;
        yVal = aRectOrObject.y;
        styleObj.width = aRectOrObject.width + 'px';
        styleObj.height = aRectOrObject.height + 'px';
    }

    elem = this.getNativeNode();

    offsets = TP.elementGetOffsetFromContainer(elem);

    /* eslint-disable no-extra-parens */
    styleObj.left = (xVal - offsets.first()) + 'px';
    styleObj.top = (yVal - offsets.last()) + 'px';
    /* eslint-enable no-extra-parens */

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setPageX',
function(aPointOrObject) {

    /**
     * @method setPageX
     * @summary Sets the X position of the receiver by manipulating its left
     *     style property. This method expects that this value is provided
     *     *relative to the whole page of the receiver* and that the receiver is
     *     positioned in some fashion.
     * @param {TP.gui.Point|TP.core.Hash|Array|Number} aPointOrObject A
     *     TP.gui.Point to use or an object that has an 'x' slot or an Array
     *     that has x in the first position or a Number.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var xVal,

        elem,
        offsets,
        styleObj;

    if (TP.isKindOf(aPointOrObject, TP.gui.Point)) {
        xVal = aPointOrObject.getX();
    } else if (TP.isHash(aPointOrObject)) {
        xVal = aPointOrObject.at('x');
    } else if (TP.isArray(aPointOrObject)) {
        xVal = aPointOrObject.at(0);
    } else if (TP.isPlainObject(aPointOrObject)) {
        xVal = aPointOrObject.x;
    } else {
        xVal = aPointOrObject;
    }

    elem = this.getNativeNode();

    offsets = TP.elementGetOffsetFromContainer(TP.elementGetOffsetParent(elem));

    styleObj = TP.elementGetStyleObj(elem);

    /* eslint-disable no-extra-parens */
    styleObj.left = (xVal - offsets.first()) + 'px';
    /* eslint-enable no-extra-parens */

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setPageY',
function(aPointOrObject) {

    /**
     * @method setPageY
     * @summary Sets the Y position of the receiver by manipulating its top
     *     style property. This method expects that this value is provided
     *     *relative to the whole page of the receiver* and that the receiver is
     *     positioned in some fashion.
     * @param {TP.gui.Point|TP.core.Hash|Array|Number} aPointOrObject A
     *     TP.gui.Point to use or an object that has an 'y' slot or an Array
     *     that has y in the first position or a Number.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var yVal,

        elem,
        offsets,
        styleObj;

    if (TP.isKindOf(aPointOrObject, TP.gui.Point)) {
        yVal = aPointOrObject.getY();
    } else if (TP.isHash(aPointOrObject)) {
        yVal = aPointOrObject.at('y');
    } else if (TP.isArray(aPointOrObject)) {
        yVal = aPointOrObject.at(1);
    } else if (TP.isPlainObject(aPointOrObject)) {
        yVal = aPointOrObject.y;
    } else {
        yVal = aPointOrObject;
    }

    elem = this.getNativeNode();

    offsets = TP.elementGetOffsetFromContainer(TP.elementGetOffsetParent(elem));

    styleObj = TP.elementGetStyleObj(elem);

    /* eslint-disable no-extra-parens */
    styleObj.top = (yVal - offsets.last()) + 'px';
    /* eslint-enable no-extra-parens */

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setStyleProperty',
function(aProperty, aPropertyValue) {

    /**
     * @method setStyleProperty
     * @summary Sets the receiver's style property named by the supplied
     *     property name.
     * @param {String} aProperty The name of the style property to set.
     * @param {String|Number} aPropertyValue The value to set the style property
     *     to.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    TP.elementSetStyleProperty(this.getNativeNode(), aProperty, aPropertyValue);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setTransform',
function(aTransformStr) {

    /**
     * @method setTransform
     * @summary Sets the CSS transform of the receiver using the supplied
     *     String (which should conform to one of the values specified in the
     *     CSS Transform specification).
     * @param {String} aTransformStr The value to set on the receiver as its CSS
     *     Transform.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    TP.elementSetTransform(this.getNativeNode(), aTransformStr);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setTransformOrigin',
function(xValue, yValue, zValue) {

    /**
     * @method setTransformOrigin
     * @summary Sets the transformation origin of the receiver using the
     *     supplied X and Y and (possibly) Z values.
     * @description The X and Y values supplied to this method can be any CSS
     *     'length' value (i.e. a number with a unit or a percentage) or one of
     *     the approved CSS keywords. If a Number is supplied, 'px' is assumed.
     *     The Z value must be a length, not keyword or percentage.
     * @param {Number|String} xValue The 'X value' to set the transformation
     *     origin to.
     * @param {Number|String} yValue The 'Y value' to set the transformation
     *     origin to.
     * @param {Number|String} [zValue] The 'Z value' to set the transformation
     *     origin to. Note that this *cannot* be a keyword or percentage.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    TP.elementSetTransformOrigin(this.getNativeNode(), xValue, yValue, zValue);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setWidth',
function(aWidth) {

    /**
     * @method setWidth
     * @summary Sets the receiver's width.
     * @description If a Number is supplied to aWidth a default unit of 'px' is
     *     assumed.
     * @param {Number|String} aWidth The width dimension to set the receiver's
     *     width to.
     */

    return TP.elementSetWidth(this.getNativeNode(), aWidth);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('show',
function() {

    /**
     * @method show
     * @summary Show's the receiver's node.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    TP.elementShow(this.getNativeNode());

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('signalUsingFacetAndValue',
function(facetName, facetValue) {

    /**
     * @method signalUsingFacetAndValue
     * @summary Signals one of the UI state change signals based on the facet
     *     name and value supplied.
     * @param {String} facetName The name of the facet to use to compute the
     *     signal to send.
     * @param {Boolean} facetValue The value of the facet to use to compute the
     *     signal to send.
     * @returns {Object} The receiver.
     */

    var signalName;

    //  Generate a proper signal name based on the facet name and whether the
    //  value is true or false

    switch (facetName) {

        case 'readonly':

            if (TP.isTrue(facetValue)) {
                signalName = 'TP.sig.UIReadonly';
            } else {
                signalName = 'TP.sig.UIReadwrite';
            }

            break;

        case 'relevant':

            if (TP.isTrue(facetValue)) {
                signalName = 'TP.sig.UIEnabled';
            } else {
                signalName = 'TP.sig.UIDisabled';
            }

            break;

        case 'required':

            if (TP.isTrue(facetValue)) {
                signalName = 'TP.sig.UIRequired';
            } else {
                signalName = 'TP.sig.UIOptional';
            }

            break;

        case 'valid':

            if (TP.isTrue(facetValue)) {
                signalName = 'TP.sig.UIValid';
            } else {
                signalName = 'TP.sig.UIInvalid';
            }

            break;

        default:
            break;
    }

    //  Signal the signal name - because the signals above are all responder
    //  policy signals, this will trigger this object's handler as part of the
    //  responder chain. Note we supply the facet name here as a convenience.
    this.signal(signalName, TP.hc('facet', facetName));

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('smartScrollIntoView',
function(direction, wantsTransformed) {

    /**
     * @method smartScrollIntoView
     * @summary Scrolls the receiver into view if necessary.
     * @param {String} [direction] The direction to test visibility in. If
     *     specified, this should be either TP.HORIZONTAL or TP.VERTICAL. If
     *     this is not specified, then both directions will be tested.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to use 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var elem,

        offsetParentRect,
        ourPoint,

        corner;

    elem = this.getNativeNode();

    //  If we're already visible, just exit here.
    if (TP.elementIsVisible(elem, false, direction, wantsTransformed)) {
        return this;
    }

    //  Get our offsetParent's global rect and our global (top, left) point
    offsetParentRect = this.getOffsetParent().getGlobalRect(wantsTransformed);
    ourPoint = this.getGlobalPoint(wantsTransformed);

    //  Get the 'compass corner' for our global point within our offsetParent's
    //  global rect.
    corner = offsetParentRect.getCompassCorner(ourPoint);

    switch (corner) {
        case TP.NORTH:
        case TP.NORTHEAST:
        case TP.NORTHWEST:

            //  It's towards the top - scroll up.
            elem.scrollIntoView(true);
            break;

        case TP.SOUTHEAST:
        case TP.SOUTH:
        case TP.SOUTHWEST:

            //  It's towards the bottom - scroll up.
            elem.scrollIntoView(false);
            break;

        case TP.EAST:
        case TP.WEST:
            //  Pure TP.EAST or TP.WEST will scroll to the bottom by default.
            elem.scrollIntoView(false);
            break;

        default:
            break;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('stylesheetReady',
function(aStyleTPElem) {

    /**
     * @method stylesheetReady
     * @summary A method that is invoked when the supplied stylesheet is
     *     'ready', which means that it's attached to the receiver's Document
     *     and all of it's style has been parsed and applied.
     * @description Typically, the supplied stylesheet Element is the one that
     *     the receiver is waiting for so that it can finalized style
     *     computations. This could be either the receiver's 'core' stylesheet
     *     or it's current 'theme' stylesheet, if the receiver is executing in a
     *     themed environment.
     * @param {TP.html.style} aStyleTPElem The XHTML 'style' element that is
     *     ready.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('yieldFocusedResponder',
function(focusingElement) {

    /**
     * @method yieldFocusedResponder
     * @summary Asks the receiver to yield its role as 'focused responder'.
     * @description At this level, this type just returns true, but subtypes may
     *     run various checks for valid values, etc. and return false if those
     *     checks don't pass.
     * @param {TP.dom.UIElementNode} focusingElement The element that the focus
     *     is moving to. This might be null if we aren't being asked to yield
     *     focus because of the TIBET focus manager.
     * @returns {Boolean} Whether or not the receiver should yield focused
     *     responder status.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('toggleDisplay',
function() {

    /**
     * @method toggleDisplay
     * @summary Toggles the 'display' of the receiver from 'node' to it's
     *     default display state or vice-versa, depending on the current
     *     visibility state.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var elem;

    elem = this.getNativeNode();

    if (TP.elementIsDisplayed(elem)) {
        TP.elementHide(elem);
    } else {
        TP.elementShow(elem);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('toggleVisibility',
function() {

    /**
     * @method toggleVisibility
     * @summary Toggles the 'visibility' of the receiver from 'hidden' to
     *     'visible' or vice-versa, depending on the current visibility state.
     * @exception TP.sig.InvalidStyleDeclaration
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var elem,

        styleObj,
        computedStyle;

    elem = this.getNativeNode();

    //  Grab the style object for the element
    if (TP.notValid(styleObj = TP.elementGetStyleObj(elem))) {
        return this.raise('TP.sig.InvalidStyleDeclaration');
    }

    //  Grab the computed style object for the element
    if (TP.notValid(computedStyle = TP.elementGetComputedStyleObj(elem))) {
        return this.raise('TP.sig.InvalidStyleDeclaration');
    }

    if (computedStyle.visibility === 'visible') {
        styleObj.visibility = 'hidden';
    } else {
        styleObj.visibility = 'visible';
    }

    return this;
});

//  ------------------------------------------------------------------------
//  LOCAL CSS TRANSFORMS
//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('addLocalTransform',
function(transformType, varargs) {

    /**
     * @method addLocalTransform
     * @summary Adds a "local" transform to the receiver. This will be a CSS3
     *     transform that will affect just the receiver by using it's local
     *     '.style' attribute.
     * @param {String} transformType The type of transformation to add to the
     *     local transformations. This should be one of the following:
     *     TP.ROTATE, TP.SKEW, TP.SCALE,
     *     TP.TRANSLATE.
     * @param {arguments} varargs One or more additional arguments to provide to
     *     configure the transform.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var localTransforms;

    //  If our native node already has an attribute that contains the local
    //  transforms, we use that (decoding it's value from the string JSON
    //  representation that is used). Otherwise, we create one.
    if (TP.isEmpty(localTransforms = this.getAttribute('localTransforms'))) {
        localTransforms = TP.ac();
    } else {
        localTransforms = TP.json2js(localTransforms);
    }

    //  Push on a TP.core.Hash containing the transform type and an Array
    //  containing the arguments to this method (after slicing off the transform
    //  type).
    localTransforms.push(
        TP.hc('type', transformType, 'args', TP.ac(arguments).slice(1)));

    //  JSONify the local transforms data structure and set the attribute.
    this.setAttribute('localTransforms', TP.js2json(localTransforms));

    //  Set the local transform style from the local transforms that we're
    //  managing.
    this.setTransformFromLocalTransforms();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('generateCSSValueFromTransformRecord',
function(aTransformRecord) {

    /**
     * @method generateCSSValueFromTransformRecord
     * @summary Generates a CSS value from the supplied transform 'record'.
     * @description A transform record consists of a TP.core.Hash that has two
     *     keys: the transform 'type' that should consist of one of the
     *     following values: TP.ROTATE, TP.SKEW, TP.SCALE, TP.TRANSLATE and the
     *     transform 'args', which are arguments to the transformation.
     * @param {TP.core.Hash} aTransformRecord The transformation record to use
     *     to generate the CSS value.
     * @exception TP.sig.InvalidParameter
     * @returns {String} The generated CSS value String.
     */

    var str,
        transformArgs;

    if (TP.notValid(aTransformRecord)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Must supply a valid transform record.');
    }

    str = '';

    transformArgs = aTransformRecord.at('args');

    switch (aTransformRecord.at('type')) {

        case TP.ROTATE:

            str += 'rotate(' +
                    transformArgs + 'deg)';

            break;

        case TP.SKEW:

            str += 'skewX(' +
                    transformArgs.first() + 'deg) ' +
                    'skewY(' +
                    transformArgs.last() + 'deg)';

            break;

        case TP.SCALE:

            str += 'scaleX(' +
                    transformArgs.first() + ') ' +
                    'scaleY(' +
                    transformArgs.last() + ')';

            break;

        case TP.TRANSLATE:

            str += 'translateX(' +
                    transformArgs.first() + 'px) ' +
                    'translateY(' +
                    transformArgs.last() + 'px)';
            break;

        default:
            break;
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getLocalTransformValue',
function(transformType, transformIndex) {

    /**
     * @method getLocalTransformValue
     * @summary Returns the values of a particular local transform that has
     *     been added to the receiver as a CSS value.
     * @param {String} transformType The type of transformation to return the
     *     CSS value of. This should be one of the following:
     *     TP.ROTATE, TP.SKEW, TP.SCALE, TP.TRANSLATE, TP.ANY.
     * @param {Number} transformIndex The index of the transform to return the
     *     CSS value of. If this argument is not supplied or invalid, 0 (the
     *     first transform of the specified type) is assumed.
     * @returns {String} The generated CSS value String.
     */

    var localTransforms,

        recordIndex,

        transformRecords,
        typeIndex;

    //  If our native node has an attribute that contains the local transforms,
    //  we use that. Otherwise, there is nothing to do here, so we exit here.
    if (TP.isEmpty(localTransforms = this.getAttribute('localTransforms'))) {
        return '';
    } else {
        localTransforms = TP.json2js(localTransforms);
    }

    //  If a Number wasn't supplied in the transformIndex, we assume a value of
    //  0.
    recordIndex = TP.ifInvalid(transformIndex, 0);

    transformRecords = null;

    //  Find the transform, given our transform type and index
    if (transformType === TP.ANY) {
        //  We're looking for any transform - just return the one at that index.
        return this.generateCSSValueFromTransformRecord(
                                    localTransforms.at(recordIndex));
    } else {
        //  We're looking for a particular type of transform at a particular
        //  index. Keep track of the index which will increment every time we
        //  encounter a transform of that type.
        typeIndex = 0;
        transformRecords = localTransforms.select(
            function(aTransformRecord) {
                if (aTransformRecord.at('type') === transformType) {
                    if (typeIndex === recordIndex) {
                        return aTransformRecord;
                    }
                    typeIndex++;
                }
            });
    }

    //  We found a valid transform record - generate a CSS value from it and
    //  return that.
    if (TP.notEmpty(transformRecords)) {
        return this.generateCSSValueFromTransformRecord(
                                    transformRecords.first());
    }

    return '';
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('removeAllLocalTransforms',
function() {

    /**
     * @method removeAllLocalTransforms
     * @summary Removes all of the local transforms from the receiver.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    return this.removeLocalTransform(TP.ANY, TP.ALL);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('removeLocalTransform',
function(transformType, transformIndex) {

    /**
     * @method removeLocalTransform
     * @summary Removes a particular local transform from the receiver.
     * @param {String} transformType The type of transformation to remove.
     *     This should be one of the following:
     *     TP.ROTATE, TP.SKEW, TP.SCALE, TP.TRANSLATE, TP.ANY.
     * @param {Number} transformIndex The index of the transform to remove.
     *     If this argument is not supplied or invalid, 0 (the first transform
     *     of the specified type) is assumed. This argument can also have a
     *     value of TP.ALL, in which case all transforms of the specified type
     *     will be removed.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var localTransforms,

        recordIndex,

        transformRecords,

        typeIndex,

        i,
        len;

    //  If our native node has an attribute that contains the local transforms,
    //  we use that. Otherwise, there is nothing to do here, so we exit here.
    if (TP.isEmpty(localTransforms = this.getAttribute('localTransforms'))) {
        return this;
    } else {
        localTransforms = TP.json2js(localTransforms);
    }

    //  If a value wasn't supplied in the transformIndex, we assume a value of
    //  0.
    recordIndex = TP.ifInvalid(transformIndex, 0);

    if (transformType === TP.ANY && recordIndex === TP.ALL) {
        transformRecords = TP.ac();
    } else {
        transformRecords = localTransforms;

        //  If it's any kind of transform, then just splice out the one at the
        //  recordIndex
        if (transformType === TP.ANY) {
            transformRecords.splice(recordIndex, 1);
        } else {
            typeIndex = 0;

            len = transformRecords.getSize();
            for (i = 0; i < len; i++) {
                if (transformRecords.at(i).at('type') === transformType) {
                    if (recordIndex === TP.ALL) {
                        transformRecords.splice(i, 1);
                        len--;
                        i--;
                    } else if (recordIndex === typeIndex) {
                        transformRecords.splice(i, 1);
                        break;
                    }
                    typeIndex++;
                }
            }
        }
    }

    //  JSONify the local transforms data structure and set the attribute.
    this.setAttribute('localTransforms', TP.js2json(transformRecords));

    //  Set the local transform style from the local transforms that we're
    //  managing.
    this.setTransformFromLocalTransforms();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('rotate',
function(degrees) {

    /**
     * @method rotate
     * @summary Rotates the receiver by the amount indicated by using a 'local
     *     transformation'.
     * @param {Number} degrees The amount in degrees to rotate the receiver
     *     by.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    this.addLocalTransform(TP.ROTATE, degrees);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('scale',
function(x, y) {

    /**
     * @method scale
     * @summary Scales the receiver by the amount indicated by using a 'local
     *     transformation'. Note that, if the 'y' value isn't supplied, it is
     *     defaulted to the 'x' value.
     * @param {Number} x The amount to scale the receiver along the X axis.
     * @param {Number} y The amount to scale the receiver along the Y axis.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var yVal;

    //  If a Y value wasn't supplied, use x
    yVal = TP.ifInvalid(y, x);

    this.addLocalTransform(TP.SCALE, x, yVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setLocalTransform',
function(transformType, transformIndex, varargs) {

    /**
     * @method setLocalTransform
     * @summary Sets the values of a particular local transform that has been
     *     added for the receiver.
     * @param {String} transformType The type of transformation to set the
     *     values of. This should be one of the following:
     *     TP.ROTATE, TP.SKEW, TP.SCALE, TP.TRANSLATE, TP.ANY.
     * @param {Number} transformIndex The index of the transform to set the
     *     values of. If this argument is not supplied or invalid, 0 (the first
     *     transform of the specified type) is assumed.
     * @param {arguments} varargs One or more additional arguments to provide to
     *     configure the transform.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var localTransforms,

        recordIndex,

        transformRecords,
        typeIndex;

    //  If our native node has an attribute that contains the local transforms,
    //  we use that. Otherwise, there is nothing to do here, so we exit here.
    if (TP.isEmpty(localTransforms = this.getAttribute('localTransforms'))) {
        return this;
    } else {
        localTransforms = TP.json2js(localTransforms);
    }

    //  If a Number wasn't supplied in the transformIndex, we assume a value of
    //  0.
    recordIndex = TP.ifInvalid(transformIndex, 0);

    //  Find the transform, given our transform type and index
    if (transformType === TP.ANY) {
        //  We're looking for any transform - just return the one at that index
        //  (but wrap it in an Array for use below).
        transformRecords = TP.ac(localTransforms.at(recordIndex));
    } else {
        //  We're looking for a particular type of transform at a particular
        //  index. Keep track of the index which will increment every time we
        //  encounter a transform of that type.
        typeIndex = 0;
        transformRecords = localTransforms.select(
                    function(aTransformRecord) {
                        if (aTransformRecord.at('type') === transformType) {
                            if (typeIndex === recordIndex) {
                                return true;
                            }
                            typeIndex++;
                        }
                    });
    }

    //  Couldn't find any transform records matching our criteria - bail out.
    if (TP.isEmpty(transformRecords)) {
        return this;
    }

    //  Get the first TP.core.Hash in the result array and put new arguments
    //  into it's 'args' Array that are the arguments to this method (after
    //  slicing off the transform type and index).
    transformRecords.first().atPut('args', TP.ac(arguments).slice(2));

    //  JSONify the local transforms data structure and set the attribute.
    this.setAttribute('localTransforms', TP.js2json(localTransforms));

    //  Set the local transform style from the local transforms that we're
    //  managing.
    this.setTransformFromLocalTransforms();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setTransformFromLocalTransforms',
function() {

    /**
     * @method setTransformFromLocalTransforms
     * @summary Sets the receiver's CSS3 'transforms' style property to the
     *     local transforms that have been populated on the receiver by adding
     *     them.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var localTransforms,
        transformStr;

    //  If our native node does not have an attribute that contains the local
    //  transforms, there is nothing to do, so we set the CSS3 transform to
    //  nothing and exit here.
    if (!this.hasAttribute('localTransforms')) {
        this.setTransform('');

        return this;
    }

    //  If our native node has no local transforms, there is nothing to do, so
    //  we exit here.
    if (TP.isEmpty(localTransforms = this.getAttribute('localTransforms'))) {
        return this;
    } else {
        localTransforms = TP.json2js(localTransforms);
    }

    transformStr = '';

    //  Loop over the local transforms and build up a String containing their
    //  'CSS value'.
    localTransforms.perform(
        function(aRecord) {
            transformStr +=
                    this.generateCSSValueFromTransformRecord(aRecord) + ' ';
        }.bind(this));

    //  Set the CSS transform to the generated String
    this.setTransform(transformStr);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('skew',
function(x, y) {

    /**
     * @method skew
     * @summary Skews the receiver by the amount indicated by using a 'local
     *     transformation'. Note that, if the 'y' value isn't supplied, it is
     *     defaulted to the 'x' value.
     * @param {Number} x The amount in degrees to skew the receiver along the X
     *     axis.
     * @param {Number} y The amount in degrees to skew the receiver along the Y
     *     axis.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var yVal;

    //  If a Y value wasn't supplied, use x
    yVal = TP.ifInvalid(y, x);

    this.addLocalTransform(TP.SKEW, x, yVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('translate',
function(x, y) {

    /**
     * @method translate
     * @summary Translates the receiver by the amount indicated by using a
     *     'local transformation'. Note that, if the 'y' value isn't supplied,
     *     it is defaulted to the 'x' value.
     * @param {Number} x The amount in pixels to translate the receiver along
     *     the X axis.
     * @param {Number} y The amount in pixels to translate the receiver along
     *     the Y axis.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var yVal;

    //  If a Y value wasn't supplied, use x
    yVal = TP.ifInvalid(y, x);

    this.addLocalTransform(TP.TRANSLATE, x, yVal);

    return this;
});

//  ------------------------------------------------------------------------
//  STATE TESTING/MANIPULATION
//  ------------------------------------------------------------------------

/*
Most state flags in TIBET are stored as pclass: attributes on the elements.
This implies that for TIBET we see states as pseudo-classes, much like the
W3 might think of hover. Methods for checking/setting these states all use
the is* pattern common to Boolean attributes. TIBET's get() and set() calls
will look for is* as part of their lookup mechanisms so this all plays well
together.
*/

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('$isInState',
function(stateAttribute, stateFlag, shouldSignal) {

    /**
     * @method $isInState
     * @summary A combined setter/getter for manipulating a particular Boolean
     *     state attribute on the receiver.
     * @param {String} stateAttribute The name of the attribute which maintains
     *     this state.
     * @param {Boolean} stateFlag Optional parameter which defines the whether
     *     the state is in effect.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {Boolean} Whether the receiver's state is active.
     */

    var flag;

    //  NB: we use the '$' versions of setAttribute/getAttribute here or
    //  otherwise we'll endlessly recurse.

    if (TP.isBoolean(stateFlag)) {
        if (stateFlag) {
            this.$setAttribute(stateAttribute, 'true', false);
        } else {
            this.$removeAttribute(stateAttribute, false);
        }

        //  NB: Use this construct this way for better performance
        if (TP.notValid(flag = shouldSignal)) {
            flag = this.shouldSignalChange();
        }

        if (flag) {
            this.$changed(stateAttribute.slice(7),
                            TP.UPDATE,
                            TP.hc('baseSignalType', TP.sig.AttributeChange));
        }
    }

    return this.hasAttribute(stateAttribute);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getAttrActive',
function() {

    /**
     * @method getAttrActive
     * @summary The getter for the receiver's active state.
     * @returns {Boolean} Whether the receiver's state is active.
     */

    return this.$isInState('pclass:active');
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getAttrBusy',
function() {

    /**
     * @method getAttrBusy
     * @summary The getter for the receiver's busy state.
     * @returns {Boolean} Whether the receiver's state is busy.
     */

    return this.$isInState('pclass:busy');
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getAttrClosed',
function() {

    /**
     * @method getAttrClosed
     * @summary The getter for the receiver's closed state.
     * @returns {Boolean} Whether the receiver's state is closed.
     */

    return this.$isInState('pclass:closed');
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getAttrDisabled',
function() {

    /**
     * @method getAttrDisabled
     * @summary The getter for the receiver's disabled state.
     * @returns {Boolean} Whether the receiver's state is disabled.
     */

    return this.$isInState('pclass:disabled');
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getAttrFocused',
function() {

    /**
     * @method getAttrFocused
     * @summary The getter for the receiver's focus state.
     * @returns {Boolean} Whether the receiver's state is focus.
     */

    return this.$isInState('pclass:focus');
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getAttrHidden',
function() {

    /**
     * @method getAttrHidden
     * @summary The getter for the receiver's hidden state.
     * @returns {Boolean} Whether the receiver's state is hidden.
     */

    return this.$isInState('pclass:hidden');
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getAttrInvalid',
function() {

    /**
     * @method getAttrInvalid
     * @summary The getter for the receiver's invalid state.
     * @returns {Boolean} Whether the receiver's state is invalid.
     */

    return this.$isInState('pclass:invalid');
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getAttrOutOfRange',
function() {

    /**
     * @method getAttrOutOfRange
     * @summary The getter for the receiver's out-of-range state.
     * @returns {Boolean} Whether the receiver's state is out-of-range.
     */

    return this.$isInState('pclass:out-of-range');
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getAttrReadonly',
function() {

    /**
     * @method getAttrReadonly
     * @summary The getter for the receiver's readonly state.
     * @returns {Boolean} Whether the receiver's state is readonly.
     */

    return this.$isInState('pclass:readonly');
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getAttrRequired',
function() {

    /**
     * @method getAttrRequired
     * @summary The getter for the receiver's required state.
     * @returns {Boolean} Whether the receiver's state is required.
     */

    return this.$isInState('pclass:required');
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getAttrSelected',
function() {

    /**
     * @method getAttrSelected
     * @summary The getter for the receiver's selected state.
     * @returns {Boolean} Whether the receiver's state is selected.
     */

    return this.$isInState('pclass:selected');
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setAttrActive',
function(beActive) {

    /**
     * @method setAttrActive
     * @summary The setter for the receiver's active state.
     * @param {Boolean} beActive Whether or not the receiver is in an active
     *     state.
     * @returns {Boolean} Whether the receiver's state is active.
     */

    this.$isInState('pclass:active', beActive);

    if (TP.isTrue(beActive)) {
        this.signalAfterRepaint('TP.sig.UIDidActivate');
    } else {
        this.signalAfterRepaint('TP.sig.UIDidDeactivate');
    }

    return this.$isInState('pclass:active');
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setAttrBusy',
function(beBusy, busyMsg) {

    /**
     * @method setAttrBusy
     * @summary The setter for the receiver's busy state.
     * @param {Boolean} beBusy Whether or not the receiver is in a busy state.
     * @param {String} busyMsg The message to display while busy.
     * @returns {Boolean} Whether the receiver's state is busy.
     */

    this.$isInState('pclass:busy', beBusy);

    if (TP.isTrue(beBusy)) {
        this.displayBusy(busyMsg);

        this.signalAfterRepaint('TP.sig.UIDidBusy');
    } else {
        this.hideBusy();

        this.signalAfterRepaint('TP.sig.UIDidIdle');
    }

    return this.$isInState('pclass:busy');
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setAttrClosed',
function(beClosed) {

    /**
     * @method setAttrClosed
     * @summary The setter for the receiver's closed state.
     * @param {Boolean} beClosed Whether or not the receiver is in a closed
     *     state.
     * @returns {Boolean} Whether the receiver's state is closed.
     */

    this.$isInState('pclass:closed', beClosed);

    if (TP.isTrue(beClosed)) {
        this.signalAfterRepaint('TP.sig.UIDidClose');
    } else {
        this.signalAfterRepaint('TP.sig.UIDidOpen');
    }

    return this.$isInState('pclass:closed');
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setAttrCollapsed',
function(beCollapsed) {

    /**
     * @method setAttrCollapsed
     * @summary The setter for the receiver's collapsed state.
     * @param {Boolean} beCollapsed Whether or not the receiver is in a
     *     collapsed state.
     * @returns {Boolean} Whether the receiver's state is collapsed.
     */

    this.$isInState('pclass:collapsed', beCollapsed);

    if (TP.isTrue(beCollapsed)) {
        this.signalAfterRepaint('TP.sig.UIDidCollapse');
    } else {
        this.signalAfterRepaint('TP.sig.UIDidExpand');
    }

    return this.$isInState('pclass:collapsed');
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setAttrDisabled',
function(beDisabled) {

    /**
     * @method setAttrDisabled
     * @summary The setter for the receiver's disabled state.
     * @param {Boolean} beDisabled Whether or not the receiver is in a disabled
     *     state.
     * @returns {Boolean} Whether the receiver's state is disabled.
     */

    if (TP.isTrue(beDisabled)) {

        //  Make sure to remove the pseudoclass attributes for active and focus
        //  when disabling.
        this.$isInState('pclass:active', false, false);
        this.$isInState('pclass:focus', false, false);

        //  We go ahead and set a generic 'disabled' attribute here that is used
        //  for (X)HTML. Note the '$setAttribute()' call to avoid calling back
        //  into ourself here. Note also how we do *not* signal change here.
        this.$setAttribute('disabled', true, false);
    } else {
        this.removeAttribute('disabled');
    }

    return this.$isInState('pclass:disabled', beDisabled);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setAttrFocused',
function(beFocused) {

    /**
     * @method setAttrFocused
     * @summary The setter for the receiver's focus state.
     * @param {Boolean} beFocused Whether or not the receiver is in a focus
     *     state.
     * @returns {Boolean} Whether the receiver's state is focused.
     */

    return this.$isInState('pclass:focus', beFocused);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     * @summary The setter for the receiver's hidden state.
     * @param {Boolean} beHidden Whether or not the receiver is in a hidden
     *     state.
     * @returns {Boolean} Whether the receiver's state is hidden.
     */

    this.$isInState('pclass:hidden', beHidden);

    if (TP.isTrue(beHidden)) {
        this.signalAfterRepaint('TP.sig.UIDidHide');
    } else {
        this.signalAfterRepaint('TP.sig.UIDidShow');
    }

    return this.$isInState('pclass:hidden');
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setAttrInvalid',
function(beInvalid) {

    /**
     * @method setAttrInvalid
     * @summary The setter for the receiver's invalid state.
     * @param {Boolean} beInvalid Whether or not the receiver is in a invalid
     *     state.
     * @returns {Boolean} Whether the receiver's state is invalid.
     */

    return this.$isInState('pclass:invalid', beInvalid);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setAttrOutOfRange',
function(beOutOfRange) {

    /**
     * @method setAttrOutOfRange
     * @summary The setter for the receiver's out-of-range state.
     * @param {Boolean} beOutOfRange Whether or not the receiver is in a
     *     out-of-range state.
     * @returns {Boolean} Whether the receiver's state is out-of-range.
     */

    return this.$isInState('pclass:out-of-range', beOutOfRange);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setAttrReadonly',
function(beReadonly) {

    /**
     * @method setAttrReadonly
     * @summary The setter for the receiver's readonly state.
     * @param {Boolean} beReadonly Whether or not the receiver is in a readonly
     *     state.
     * @returns {Boolean} Whether the receiver's state is readonly.
     */

    return this.$isInState('pclass:readonly', beReadonly);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setAttrRequired',
function(beRequired) {

    /**
     * @method setAttrRequired
     * @summary The setter for the receiver's required state.
     * @param {Boolean} beRequired Whether or not the receiver is in a required
     *     state.
     * @returns {Boolean} Whether the receiver's state is required.
     */

    return this.$isInState('pclass:required', beRequired);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setAttrSelected',
function(beSelected) {

    /**
     * @method setAttrSelected
     * @summary The setter for the receiver's selected state.
     * @param {Boolean} beSelected Whether or not the receiver is in a selected
     *     state.
     * @returns {Boolean} Whether the receiver's state is selected.
     */

    return this.$isInState('pclass:selected', beSelected);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('toggle',
function(stateName) {

    /**
     * @method toggle
     * @summary Toggles the value for a particular piece of the receiver's
     *     state. Note that if the attribute representing the state is not set
     *     on the receiver, that this will default to setting the attribute to
     *     true.
     * @param {String} stateName The name of the piece of state to toggle.
     * @returns {Boolean} The value of the piece of state after toggling it.
     */

    var attrName,
        stateValue;

    //  The attribute will have a 'pclass:' namespace prefix.
    attrName = 'pclass:' + stateName;

    if (this.hasAttribute(attrName)) {
        stateValue = TP.bc(this.getAttribute(stateName));
        stateValue = !stateValue;
    } else {
        stateValue = true;
    }

    this.setAttribute(stateName, stateValue);

    return TP.bc(this.getAttribute(stateName));
});

//  ------------------------------------------------------------------------
//  DISPLAY SUPPORT
//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('asyncActivatingFocusContext',
function() {

    /**
     * @method asyncActivatingFocusContext
     * @summary Prepares the system for a situation where a component with a
     *     different focus context than the currently focused element will want
     *     to focus, but do so in an asynchronous fashion. Therefore, we need to
     *     manage the focus stack in a slightly different fashion.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    TP.dom.UIElementNode.set('$asyncSwitchingContexts', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('blur',
function() {

    /**
     * @method blur
     * @summary Blurs the receiver for keyboard input.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var node,
        oldMBE;

    node = this.getNativeNode();

    /* Uncomment for low-level focus stack debugging
    console.log(
        'Invoking the "blur" method. The receiver is: \n' +
        TP.gid(node));
    */

    //  Note that we do not need to set our 'focused' attribute to 'false'
    //  here, since our event handler defined on our type does that whenever
    //  this node is focused, whether by this mechanism or some other user
    //  interaction.

    oldMBE = TP.dom.UIElementNode.get('$manuallyBlurringElement');
    TP.dom.UIElementNode.set('$manuallyBlurringElement', node);

    node.blur();

    TP.dom.UIElementNode.set('$manuallyBlurringElement', oldMBE);

    this.signal('TP.sig.UIBlur');

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('blurFocusedDescendantElement',
function() {

    /**
     * @method blurFocusedDescendantElement
     * @summary Blurs the currently focused element if it is a descendant of the
     *     receiver.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var node;

    node = this.getNativeNode();

    TP.elementBlurFocusedDescendantElement(node);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('focus',
function(moveAction) {

    /**
     * @method focus
     * @summary Focuses the receiver for keyboard input.
     * @param {String} moveAction The type of 'move' that the user requested.
     *     This can be one of the following:
     *          TP.FIRST
     *          TP.LAST
     *          TP.NEXT
     *          TP.PREVIOUS
     *          TP.FIRST_IN_GROUP
     *          TP.LAST_IN_GROUP
     *          TP.FIRST_IN_NEXT_GROUP
     *          TP.FIRST_IN_PREVIOUS_GROUP
     *          TP.FOLLOWING
     *          TP.PRECEDING.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var node,

        focusedElem,

        calculatedTPElem,
        calculatedFocusContext,

        oldMFE;

    node = this.getNativeNode();

    /* Uncomment for low-level focus stack debugging
    console.log(
        'Invoking the "focus" method. The receiver is: \n' +
        TP.gid(node));
    */

    //  Make sure that we reset the 'async switching contexts' flag that might
    //  have been set to let us know about an asynchronous focusing situation.
    TP.dom.UIElementNode.set('$asyncSwitchingContexts', false);

    //  If the element is disabled, then just bail here - no sense in going any
    //  further.
    if (TP.elementIsDisabled(node)) {
        return this;
    }

    //  First, see if there's a focused element (without considering the
    //  '.activeElement' property)
    focusedElem = TP.documentGetFocusedElement(node.ownerDocument, false);

    //  If so and it's identical to our native node, then just return.
    if (focusedElem === node) {
        return this;
    }

    //  Then, see if there's a focused element (including considering the
    //  '.activeElement')
    focusedElem = TP.documentGetFocusedElement(node.ownerDocument);

    //  If that's not identical to our native node, then calculate a focusing
    //  context (either from any set calculated focusing TP.dom.ElementNode or
    //  from ourself) and blur the currently focused element. This will cause
    //  focus stack management to occur.
    if (focusedElem !== node) {

        calculatedTPElem =
            TP.dom.UIElementNode.get('$calculatedFocusingTPElem');
        if (TP.isValid(calculatedTPElem)) {
            calculatedFocusContext = calculatedTPElem.getFocusContextElement();
        } else {
            calculatedFocusContext = this.getFocusContextElement();
        }

        TP.dom.UIElementNode.set('$calculatedFocusContext',
                                    calculatedFocusContext);

        TP.wrap(focusedElem).blur();
        TP.dom.UIElementNode.set('$calculatedFocusContext', null);
    }

    //  Grab whatever TIBET is trying to focus. If it's real, set 'node' to it.
    calculatedTPElem = TP.dom.UIElementNode.get('$calculatedFocusingTPElem');
    if (TP.isValid(calculatedTPElem)) {
        node = calculatedTPElem.getNativeNode();
    }

    //  Go ahead and call the native 'focus' routine (and set the 'manually
    //  focusing element' trap to avoid recursion).
    oldMFE = TP.dom.UIElementNode.get('$manuallyFocusingElement');
    TP.dom.UIElementNode.set('$manuallyFocusingElement', node);

    node.focus();

    TP.dom.UIElementNode.set('$manuallyFocusingElement', oldMFE);

    //  Signal that the node focused.
    TP.wrap(node).signal('TP.sig.UIFocus');

    //  We've done what TIBET asked and we've focused the element - set this to
    //  null.
    TP.dom.UIElementNode.set('$calculatedFocusingTPElem', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod(
'focusAutofocusedOrFirstFocusableDescendant',
function() {

    /**
     * @method focusAutofocusedOrFirstFocusableDescendant.
     * @summary Focuses either any descendant that has an 'autofocus' attribute
     *     or the first focusable descendant if an autofocusable descendant
     *     cannot be found.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var focusedAutofocus,
        focusables;

    //  Try to focus any descendant that has an 'autofocus' attribute.
    focusedAutofocus = TP.elementFocusAutofocusedElement(this.getNativeNode());

    //  Couldn't find one - focus the first focusable descendant.
    if (!focusedAutofocus) {

        //  Note here that we supply true to return 'tibet:group' elements as
        //  well - groups can be focused :-).
        focusables = this.findFocusableElements(true);
        if (TP.notEmpty(focusables)) {
            focusables.first().focus();
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('select',
function() {

    /**
     * @method select
     * @summary Selects the receiver for keyboard input (this also focuses the
     *     receiver).
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var node;

    node = this.getNativeNode();

    //  Set our attributes so that the proper visuals, etc. are showing that
    //  we are both selected and focused.

    this.setAttrSelected(true);
    this.setAttrFocused(true);

    //  TODO: Should we also invoke 'focus' here? If so, we won't need to
    //  set 'selected' above since the focus handler does that.

    if (TP.canInvoke(node, 'select')) {
        node.select();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('setSelected',
function(aFlag) {

    /**
     * @method setSelected
     * @summary Set whether or not the receiver is selected.
     * @param {Boolean} aFlag Whether or not the receiver should be selected.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    this.setAttrSelected(aFlag);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('toggleSelectedItem',
function(oldItem, newItem) {

    /**
     * @method toggleSelectedItem
     * @summary Sets the old item to be deselected and the new item to be
     *     selected.
     * @param {Element} oldItem The old element to deselect.
     * @param {Element} newItem The new element to select.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var item,
        deselectSignal;

    if (TP.isValid(oldItem)) {
        item = TP.wrap(oldItem);
        deselectSignal = item.signal('TP.sig.UIDeselect');

        //  Note how we make sure that the UIDeselect signal doesn't want it's
        //  default prevented before we proceed.
        if (deselectSignal.shouldPrevent()) {
            return this;
        }
    }

    if (TP.isValid(newItem)) {
        item = TP.wrap(newItem);
        item.signal('TP.sig.UISelect');
    }

    return this;
});

//  ------------------------------------------------------------------------
//  UI ACCESSORY DISPLAY
//  ------------------------------------------------------------------------

/*
Per XForms there are several "accessories" (our terminology) which can be
associated with an element. In particular, there is help, hint, and alert
content which can be associated with the element for display when particular
states or events are triggered. We add "busy" to this so that an element can
also be provided with content to display while loading data or performing
other processing that keeps its normal UI from being displayed.
*/

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('displayAlert',
function(content) {

    /**
     * @method displayAlert
     * @summary Displays alert content for the receiver, if any.
     * @param {String} content The alert content to be displayed.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    //  At this level, we do nothing. Override this method to take action.

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('displayBusy',
function(content) {

    /**
     * @method displayBusy
     * @summary Displays busy content for the receiver, if any.
     * @param {String} [content=""] The busy content to be displayed.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    TP.elementShowBusyMessage(this.getNativeNode(), content);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('displayHelp',
function(content) {

    /**
     * @method displayHelp
     * @summary Displays help content for the receiver, if any.
     * @param {String} content The help content to be displayed.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    //  At this level, we do nothing. Override this method to take action.

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('displayHint',
function(content) {

    /**
     * @method displayHint
     * @summary Displays hint content for the receiver, if any.
     * @param {String} content The hint content to be displayed.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    //  At this level, we do nothing. Override this method to take action.

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('hideAlert',
function() {

    /**
     * @method hideAlert
     * @summary Hides alert content for the receiver, if any.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    //  At this level, we do nothing.

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('hideBusy',
function() {

    /**
     * @method hideBusy
     * @summary Hides busy content for the receiver, if any.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    TP.elementHideBusyMessage(this.getNativeNode());

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('hideHelp',
function() {

    /**
     * @method hideHelp
     * @summary Hides help content for the receiver, if any.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    //  At this level, we do nothing.

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('hideHint',
function() {

    /**
     * @method hideHint
     * @summary Hides hint content for the receiver, if any.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    //  At this level, we do nothing.

    return this;
});

//  ------------------------------------------------------------------------
//  Focus Computation Handlers
//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIFocusFirst',
function(aSignal) {

    /**
     * @method handleUIFocusFirst
     * @param {TP.sig.UIFocusFirst} aSignal The signal that caused this handler
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    this.moveFocus(TP.FIRST);

    //  Make sure to stop the signal propagation here - we've already moved the
    //  focus.
    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIFocusLast',
function(aSignal) {

    /**
     * @method handleUIFocusLast
     * @param {TP.sig.UIFocusLast} aSignal The signal that caused this handler
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    this.moveFocus(TP.LAST);

    //  Make sure to stop the signal propagation here - we've already moved the
    //  focus.
    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIFocusNext',
function(aSignal) {

    /**
     * @method handleUIFocusNext
     * @param {TP.sig.UIFocusNext} aSignal The signal that caused this handler
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    this.moveFocus(TP.NEXT);

    //  Make sure to stop the signal propagation here - we've already moved the
    //  focus.
    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIFocusPrevious',
function(aSignal) {

    /**
     * @method handleUIFocusPrevious
     * @param {TP.sig.UIFocusPrevious} aSignal The signal that caused this
     *     handler trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    this.moveFocus(TP.PREVIOUS);

    //  Make sure to stop the signal propagation here - we've already moved the
    //  focus.
    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIFocusFollowing',
function(aSignal) {

    /**
     * @method handleUIFocusFollowing
     * @param {TP.sig.UIFocusFollowing} aSignal The signal that caused this
     *     handler trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    this.moveFocus(TP.FOLLOWING);

    //  Make sure to stop the signal propagation here - we've already moved the
    //  focus.
    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIFocusPreceding',
function(aSignal) {

    /**
     * @method handleUIFocusPreceding
     * @param {TP.sig.UIFocusPreceding} aSignal The signal that caused this
     *     handler trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    this.moveFocus(TP.PRECEDING);

    //  Make sure to stop the signal propagation here - we've already moved the
    //  focus.
    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIFocusFirstInGroup',
function(aSignal) {

    /**
     * @method handleUIFocusFirstInGroup
     * @param {TP.sig.UIFocusFirstInGroup} aSignal The signal that caused this
     *     handler trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    this.moveFocus(TP.FIRST_IN_GROUP);

    //  Make sure to stop the signal propagation here - we've already moved the
    //  focus.
    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIFocusLastInGroup',
function(aSignal) {

    /**
     * @method handleUIFocusLastInGroup
     * @param {TP.sig.UIFocusLastInGroup} aSignal The signal that caused this
     *     handler trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    this.moveFocus(TP.LAST_IN_GROUP);

    //  Make sure to stop the signal propagation here - we've already moved the
    //  focus.
    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIFocusFirstInPreviousGroup',
function(aSignal) {

    /**
     * @method handleUIFocusFirstInPreviousGroup
     * @param {TP.sig.UIFocusFirstInPreviousGroup} aSignal The signal that
     *     caused this handler trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    this.moveFocus(TP.FIRST_IN_PREVIOUS_GROUP);

    //  Make sure to stop the signal propagation here - we've already moved the
    //  focus.
    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIFocusFirstInNextGroup',
function(aSignal) {

    /**
     * @method handleUIFocusFirstInNextGroup
     * @param {TP.sig.UIFocusFirstInNextGroup} aSignal The signal that
     *     caused this handler trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    this.moveFocus(TP.FIRST_IN_NEXT_GROUP);

    //  Make sure to stop the signal propagation here - we've already moved the
    //  focus.
    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------
//  Action Event Handlers
//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIActivate',
function(aSignal) {

    /**
     * @method handleUIActivate
     * @param {TP.sig.UIActivate} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrActive(true);
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIActivate'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIActivate', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIAlert',
function(aSignal) {

    /**
     * @method handleUIAlert
     * @summary Causes alert content to be displayed for the receiver. The
     *     alert content should be encoded into the signal payload.
     * @param {TP.sig.UIAlert} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.displayAlert(aSignal.getPayload().at('msg'));

        this.signalAfterRepaint('TP.sig.UIDidAlert');
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIAlert'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIAlert', aSignal.at('trigger'));

    //  Make sure to stop the signal propagation here - we've already handled
    //  the alert signal.
    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIBlur',
function(aSignal) {

    /**
     * @method handleUIBlur
     * @summary Blurs the receiver's native control. For some controls this has
     *     the side-effect of deselecting any selections in the control.
     * @param {TP.sig.UIBlur} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var focusingTPElem;

    //  The receiver is the currently focused element, but TIBET's focus
    //  navigation machinery stashes a reference to the element we're going to
    //  next. If we're blurring but not coming through the TIBET focus manager,
    //  this will be null.

    focusingTPElem = TP.dom.UIElementNode.get('$calculatedFocusingTPElem');

    if (!this.shouldPerformUIHandler(aSignal) ||
        !this.yieldFocusedResponder(focusingTPElem)) {

        aSignal.preventDefault();

        return this;
    }

    //  We're blurring... set 'focused' to false.
    //  NOTE: We *MUST* do this *before* we try to resign the focused responder.
    //  Otherwise, when that method's machinery tries to compute the currently
    //  focused element, it will sometimes (depending on whether the new target
    //  already got a 'pclass:focus' attribute) warn that there are two elements
    //  that are currently focused.
    this.setAttrFocused(false);

    //  Go ahead and tell ourself to resign from being the focused responder
    this.resignFocusedResponder();

    this.signalAfterRepaint('TP.sig.UIDidBlur');

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIBlur'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIBlur', aSignal.at('trigger'));

    //  Make sure to stop the signal propagation here - we've now blurred.
    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIBlurred',
function(aSignal) {

    /**
     * @method handleUIBlurred
     * @summary Causes the receiver to be put into its 'blurred state'.
     * @param {TP.sig.UIBlurred} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {

        if (this.getType().isResponderForUIFocusChange(
                                    this.getNativeNode(), aSignal)) {
            this.blur();
        }

        //  Make sure to stop the signal propagation here - we've already moved
        //  the focus.
        aSignal.stopPropagation();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIBusy',
function(aSignal) {

    /**
     * @method handleUIBusy
     * @summary Causes the receiver to be put into its 'busy state'. Content to
     *     be displayed as part of being busy should be encoded into the signal
     *     payload.
     * @param {TP.sig.UIBusy} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrBusy(true, aSignal.getPayload().at('msg'));
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIBusy'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIBusy', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIClose',
function(aSignal) {

    /**
     * @method handleUIClose
     * @summary Causes the receiver to be put into its 'closed state'.
     * @param {TP.sig.UIClose} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrClosed(true);
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIClose'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIClose', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UICollapse',
function(aSignal) {

    /**
     * @method handleUICollapse
     * @summary Collapses the receiver, if that's an appropriate action.
     * @param {TP.sig.UICollapse} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrCollapsed(true);
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UICollapse'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UICollapse', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIDeactivate',
function(aSignal) {

    /**
     * @method handleUIDeactivate
     * @param {TP.sig.UIDeactivate} aSignal The signal that caused this handler
     *     to trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrActive(false);
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIDeactivate'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIDeactivate', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIDelete',
function(aSignal) {

    /**
     * @method handleUIDelete
     * @param {TP.sig.UIDelete} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIDelete'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIDelete', aSignal.at('trigger'));

    TP.todo();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIDeselect',
function(aSignal) {

    /**
     * @method handleUIDeselect
     * @summary Deselects the receiver's native data.
     * @param {TP.sig.UIDeselect} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var node;

    if (this.shouldPerformUIHandler(aSignal)) {
        node = this.getNativeNode();

        //  focus and blur are handled by setAttrSelected when implemented
        if (TP.canInvoke(this, 'setAttrSelected')) {
            this.setAttrSelected(false);
        } else if (TP.canInvoke(node, 'blur')) {
            this.getNativeNode().blur();
        }

        this.removeAttribute('selected');

        this.signalAfterRepaint('TP.sig.UIDidDeselect');
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIDeselect'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIDeselect', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIDidBlur',
function(aSignal) {

    /**
     * @method handleUIDidBlur
     * @param {TP.sig.UIDidBlur} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
    //  alert('got to did blur');
        void 0;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIDidFocus',
function(aSignal) {

    /**
     * @method handleUIDidFocus
     * @param {TP.sig.UIDidFocus} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
    //  alert('got to did focus');
        void 0;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIDidPopFocus',
function(aSignal) {

    /**
     * @method handleUIDidPopFocus
     * @param {TP.sig.UIDidPopFocus} aSignal The signal that caused this
     *     handler to trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        void 0;

        /*
        TP.ifInfo() ?
            TP.info('Popped the focus stack. Stack now has:\n' +
                 $focus_stack.collect(
                     function (item) {return item.asString()}).join('\n')) : 0;
        */
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIDidPushFocus',
function(aSignal) {

    /**
     * @method handleUIDidPushFocus
     * @param {TP.sig.UIDidPushFocus} aSignal The signal that caused this
     *     handler to trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        void 0;

        /*
        TP.ifInfo() ?
            TP.info('Pushed the focus stack. Stack now has:\n' +
                 $focus_stack.collect(
                     function (item) {return item.asString()}).join('\n')) : 0;
        */
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIDisabled',
function(aSignal) {

    /**
     * @method handleUIDisabled
     * @summary Causes the receiver to be put into its 'disabled state'.
     * @param {TP.sig.UIDisabled} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrDisabled(true);
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIDisabled'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIDisabled', aSignal.at('trigger'));

    //  By default, all GUI elements do not allow UIDisabled/UIEnabled signals
    //  to bubble outside of themselves. This prevents whole chunks of GUI from
    //  being inadvertently disabled such that they can never be enabled again.
    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIDuplicate',
function(aSignal) {

    /**
     * @method handleUIDuplicate
     * @param {TP.sig.UIDuplicate} aSignal The signal that caused this handler
     *     to trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIDuplicate'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIDuplicate', aSignal.at('trigger'));

    TP.todo();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIEnabled',
function(aSignal) {

    /**
     * @method handleUIEnabled
     * @summary Causes the receiver to be put into its 'enabled state'.
     * @param {TP.sig.UIEnabled} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrDisabled(false);
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIEnabled'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIEnabled', aSignal.at('trigger'));

    //  By default, all GUI elements do not allow UIDisabled/UIEnabled signals
    //  to bubble outside of themselves. This prevents whole chunks of GUI from
    //  being inadvertently disabled such that they can never be enabled again.
    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIExpand',
function(aSignal) {

    /**
     * @method handleUIExpand
     * @summary Expands the receiver, if that's an appropriate action.
     * @param {TP.sig.UIExpand} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrCollapsed(false);
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIExpand'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIExpand', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIFocus',
function(aSignal) {

    /**
     * @method handleUIFocus
     * @summary Focuses the receiver's native control.
     * @param {TP.sig.UIFocus} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (!this.shouldPerformUIHandler(aSignal) ||
        !this.acceptFocusedResponder()) {

        aSignal.preventDefault();

        return this;
    }

    //  Go ahead and tell ourself to become the focused responder
    this.becomeFocusedResponder();

    //  We're focusing... set 'focused' to true
    this.setAttrFocused(true);

    this.signalAfterRepaint('TP.sig.UIDidFocus');

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIFocus'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIFocus', aSignal.at('trigger'));

    //  Make sure to stop the signal propagation here - we've now focused.
    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIFocusAndSelect',
function(aSignal) {

    /**
     * @method handleUIFocusAndSelect
     * @summary Focuses the receiver, and selects its active content.
     * @param {TP.sig.UIFocusAndSelect} aSignal The signal that caused this
     *     handler to trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        if (!this.acceptFocusedResponder()) {
            aSignal.preventDefault();
        } else {
            //  NB: This should automatically focus and, through a series of
            //  events, the 'UIFocus' handler above will be called.
            this.select();
        }

        //  Make sure to stop the signal propagation here - we've already moved
        //  the focus.
        aSignal.stopPropagation();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIFocused',
function(aSignal) {

    /**
     * @method handleUIFocused
     * @summary Causes the receiver to be put into its 'focused state'.
     * @param {TP.sig.UIFocused} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {

        if (this.getType().isResponderForUIFocusChange(
                                    this.getNativeNode(), aSignal)) {
            this.focus();
        }

        //  Make sure to stop the signal propagation here - we've already moved
        //  the focus.
        aSignal.stopPropagation();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIHelp',
function(aSignal) {

    /**
     * @method handleUIHelp
     * @summary Causes help content to be displayed for the receiver. The help
     *     content should be encoded into the signal payload.
     * @param {TP.sig.UIHelp} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.displayHelp(aSignal.getPayload().at('msg'));

        this.signalAfterRepaint('TP.sig.UIDidHelp');
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIHelp'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIHelp', aSignal.at('trigger'));

    //  Make sure to stop the signal propagation here - we've already handled
    //  the help signal.
    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIHide',
function(aSignal) {

    /**
     * @method handleUIHide
     * @summary Hides the receiver, if that's an appropriate action.
     * @param {TP.sig.UIHide} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrHidden(true);
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIHide'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIHide', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIHint',
function(aSignal) {

    /**
     * @method handleUIHint
     * @summary Causes hint content to be displayed for the receiver. The hint
     *     content should be encoded into the signal payload.
     * @param {TP.sig.UIHint} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.displayHint(aSignal.getPayload().at('msg'));

        this.signalAfterRepaint('TP.sig.UIDidHint');
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIHint'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIHint', aSignal.at('trigger'));

    //  Make sure to stop the signal propagation here - we've already handled
    //  the hint signal.
    aSignal.stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIIdle',
function(aSignal) {

    /**
     * @method handleUIIdle
     * @summary Causes the receiver to be put into its 'idle state'.
     * @param {TP.sig.UIIdle} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrBusy(false);
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIIdle'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIIdle', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIInRange',
function(aSignal) {

    /**
     * @method handleUIInRange
     * @summary Causes the receiver to be put into its 'in range state'.
     * @param {TP.sig.UIInRange} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrOfOutRange(false);
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIInRange'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIInRange', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIInsert',
function(aSignal) {

    /**
     * @method handleUIInsert
     * @param {TP.sig.UIInsert} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIInsert'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIInsert', aSignal.at('trigger'));

    TP.todo();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIInvalid',
function(aSignal) {

    /**
     * @method handleUIInvalid
     * @summary Causes the receiver to be put into its 'invalid state'.
     * @param {TP.sig.UIInvalid} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrInvalid(true);
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIInvalid'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIInvalid', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIOpen',
function(aSignal) {

    /**
     * @method handleUIOpen
     * @summary Causes the receiver to be put into its 'open state'.
     * @param {TP.sig.UIOpen} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrClosed(false);
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIOpen'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIOpen', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIOptional',
function(aSignal) {

    /**
     * @method handleUIOptional
     * @summary Causes the receiver to be put into its 'optional state'.
     * @param {TP.sig.UIOptional} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrRequired(false);
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIOptional'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIOptional', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIOutOfRange',
function(aSignal) {

    /**
     * @method handleUIOutOfRange
     * @summary Causes the receiver to be put into its 'out of range state'.
     * @param {TP.sig.UIOutOfRange} aSignal The signal that caused this handler
     *     to trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrOfOutRange(true);
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIOutOfRange'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIOutOfRange', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIReadonly',
function(aSignal) {

    /**
     * @method handleUIReadonly
     * @summary Causes the receiver to be put into its 'read only state'.
     * @param {TP.sig.UIReadonly} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrReadonly(true);
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIReadonly'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIReadonly', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIReadwrite',
function(aSignal) {

    /**
     * @method handleUIReadwrite
     * @summary Causes the receiver to be put into its 'read write state'.
     * @param {TP.sig.UIReadwrite} aSignal The signal that caused this handler
     *     to trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrReadonly(false);
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIReadwrite'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIReadwrite', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIRequired',
function(aSignal) {

    /**
     * @method handleUIRequired
     * @summary Causes the receiver to be put into its 'required state'.
     * @param {TP.sig.UIRequired} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrRequired(true);
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIRequired'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIRequired', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIScroll',
function(aSignal) {

    /**
     * @method handleUIScroll
     * @param {TP.sig.UIScroll} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIScroll'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIScroll', aSignal.at('trigger'));

    TP.todo();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UISelect',
function(aSignal) {

    /**
     * @method handleUISelect
     * @summary Selects the receiver's native data.
     * @param {TP.sig.UISelect} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var node;

    if (this.shouldPerformUIHandler(aSignal)) {
        node = this.getNativeNode();

        //  focus and blur are handled by setAttrSelected when implemented
        if (TP.canInvoke(this, 'setAttrSelected')) {
            this.setAttrSelected(true);
        } else if (TP.canInvoke(node, 'focus')) {
            node.focus();
        }

        this.setAttribute('selected', 'true');

        this.signalAfterRepaint('TP.sig.UIDidSelect');
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UISelect'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UISelect', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIShow',
function(aSignal) {

    /**
     * @method handleUIShow
     * @summary Shows the receiver, if that's an appropriate action.
     * @param {TP.sig.UIShow} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrHidden(false);
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIShow'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIShow', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIToggle',
function(aSignal) {

    /**
     * @method handleUIToggle
     * @summary Causes the receiver to toggle the name of the state supplied in
     *     the signal payload. This state name is defaulted to 'closed'.
     * @param {TP.sig.UIToggle} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var stateName,

        toggled,
        toggleableStates;

    stateName = aSignal.atIfInvalid('stateName', 'closed');

    toggled = false;

    if (this.shouldPerformUIHandler(aSignal)) {

        toggleableStates = this.getType().get('toggleableStateNames');
        if (toggleableStates.contains(stateName)) {
            this.toggle(stateName);
            toggled = true;
        }
    }

    //  If the receiver has an 'on:' attribute matching this signal name
    //  (i.e. 'on:UIToggle'), then dispatch whatever signal is configured to
    //  fire when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIToggle', aSignal.at('trigger'));

    if (toggled) {
        aSignal.stopPropagation();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIValid',
function(aSignal) {

    /**
     * @method handleUIValid
     * @summary Causes the receiver to be put into its 'valid state'.
     * @param {TP.sig.UIValid} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldPerformUIHandler(aSignal)) {
        this.setAttrInvalid(false);
    }

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIValid'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIValid', aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineHandler('UIValueChange',
function(aSignal) {

    /**
     * @method handleUIValueChange
     * @param {TP.sig.UIValueChange} aSignal The signal that caused this
     *     handler to trip.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    //  If the receiver has an 'on:' attribute matching this signal name (i.e.
    //  'on:UIValueChange'), then dispatch whatever signal is configured to fire
    //  when this signal is processed.
    this.dispatchResponderSignalFromAttr('UIValueChange',
                                            aSignal.at('trigger'));

    return this;
});

//  ------------------------------------------------------------------------
//  Signaling Methods
//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('configureSignalFromAttributes',
function(aSignal) {

    /**
     * @method configureSignalFromAttributes
     * @summary Configures the supplied signal according to any 'ev:'
     *     attributes present on the receiver. These might include attributes to
     *     stop propagation of the signal, prevent the receiver from performing
     *     its default action for that kind of signal or configure the receiver
     *     to perform its action during the capturing phase of the signal
     *     processing.
     * @param {TP.sig.ResponderSignal} aSignal The signal to configure from any
     *     present 'ev:' attributes on the receiver.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    if (this.shouldStopSignal(aSignal)) {
        aSignal.stopPropagation();
    }

    if (this.shouldPreventSignal(aSignal)) {
        aSignal.preventDefault();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('shouldCaptureSignal',
function(aSignal) {

    /**
     * @method shouldCaptureSignal
     * @summary Returns whether or not the signal should be processed as a
     *     capturing signal based on whether the receiver has an 'ev:event'
     *     attribute that contains the supplied signal's name and an 'ev:phase'
     *     of 'capture'.
     * @param {TP.sig.ResponderSignal} aSignal The signal to check to see if it
     *     should be considered to be a 'capturing' signal.
     * @returns {Boolean} Whether or not the signal should be considered to be a
     *     'capturing' signal.
     */

    var node;

    node = this.getNativeNode();

    //  If our native node has an 'ev:event' attribute value matching that
    //  of the signal's name, then check to see if it has an 'ev:phase'
    //  attribute value of 'capture', which means that it would be capturing
    //  the signal.
    if (TP.elementHasAttributeValue(node,
                                    'ev:event',
                                    aSignal.getSignalName())) {
        if (TP.elementHasAttributeValue(node, 'ev:phase', 'capture')) {
            return true;
        }
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('shouldPerformUIHandler',
function(aSignal) {

    /**
     * @method shouldPerformUIHandler
     * @summary Returns whether or not the receiver should perform its UI
     *     handler. This method configures the signal from any 'ev:' attributes
     *     on the receiver and then returns true if the signal is *not*
     *     configured to prevent its default action.
     * @param {TP.sig.ResponderSignal} aSignal The signal to check to see if the
     *     receiver should perform its UI handler for the supplied signal.
     * @returns {Boolean} Whether or not the receiver should perform its UI
     *     handler for the supplied signal.
     */

    this.configureSignalFromAttributes(aSignal);

    return !aSignal.shouldPrevent();
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('shouldPreventSignal',
function(aSignal) {

    /**
     * @method shouldPreventSignal
     * @summary Returns whether or not the signal should be prevented from
     *     performing its default action based on whether the receiver has an
     *     'ev:event' attribute that contains the supplied signal's name and an
     *     'ev:defaultAction' of 'cancel'.
     * @param {TP.sig.ResponderSignal} aSignal The signal to check to see if it
     *     should be prevented.
     * @returns {Boolean} Whether or not the signal should be prevented.
     */

    var node;

    node = this.getNativeNode();

    //  If our native node has an 'ev:event' attribute value matching that
    //  of the signal's name, then check to see if it has an
    //  'ev:defaultAction' attribute value of 'cancel', which means that it
    //  would be cancelling the signal's default action.
    if (TP.elementHasAttributeValue(node,
                                    'ev:event',
                                    aSignal.getSignalName())) {
        if (TP.elementHasAttributeValue(node, 'ev:defaultAction', 'cancel')) {
            return true;
        }
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('shouldStopSignal',
function(aSignal) {

    /**
     * @method shouldStopSignal
     * @summary Returns whether or not the signal should be stopped from
     *     propagating based on whether the receiver has an 'ev:event' attribute
     *     that contains the supplied signal's name and an 'ev:propagate' of
     *     'stop'.
     * @param {TP.sig.ResponderSignal} aSignal The signal to check to see if it
     *     should be stopped.
     * @returns {Boolean} Whether or not the signal should be stopped.
     */

    var node;

    node = this.getNativeNode();

    //  If our native node has an 'ev:event' attribute value matching that
    //  of the signal's name, then check to see if it has an
    //  'ev:propagate' attribute value of 'stop', which means that it
    //  would be stopping propagation of the signal.
    if (TP.elementHasAttributeValue(node,
                                    'ev:event',
                                    aSignal.getSignalName())) {
        if (TP.elementHasAttributeValue(node, 'ev:propagate', 'stop')) {
            return true;
        }
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('signal',
function(aSignal, aPayload, aPolicy, aType, isCancelable, isBubbling) {

    /**
     * @method signal
     * @summary Signals activity to registered observers. Any additional
     *     arguments are passed to the registered handlers along with the origin
     *     and event.
     * @description We override the standard 'signal' method on this type to
     *     possibly alter the firing policy based on whether the signal was
     *     spoofed or not. In the core signaling system, if the signal is
     *     spoofed and a specific firing policy isn't supplied in this call,
     *     then TP.OBSERVER_FIRING is used. This call changes that so that, if a
     *     specific firing policy isn't supplied for a spoofed signal,
     *     TP.RESPONDER_FIRING is used.
     * @param {String|TP.sig.Signal} aSignal The signal to fire.
     * @param {Object} aPayload Optional argument object (unused in this
     *     override).
     * @param {Function} aPolicy A "firing" policy that will define how the
     *     signal is fired.
     * @param {String|TP.sig.Signal} aType A default type to use when the signal
     *     type itself isn't found and a new signal subtype must be created
     *     (unused in this override).
     * @param {Boolean} isCancelable Optional flag for dynamic signals defining
     *     if they can be cancelled.
     * @param {Boolean} isBubbling Optional flag for dynamic signals defining
     *     whether they bubble (when using TP.DOM_FIRING).
     * @returns {TP.sig.Signal} The signal instance which was fired.
     */

    var sigType,
        policy;

    //  Determine whether this is a spoofed signal by getting the signal type.
    if (TP.isString(aSignal)) {
        sigType = TP.sys.getTypeByName(TP.expandSignalName(aSignal));
    } else {
        sigType = aSignal.getType();
    }

    //  Capture any supplied policy.
    policy = aPolicy;

    //  If a policy wasn't explicitly provided, then use TP.RESPONDER_FIRING for
    //  spoofed signals.
    if (TP.notValid(policy)) {
        if (!TP.isType(sigType)) {
            policy = TP.RESPONDER_FIRING;
        } else {
            policy = sigType.getDefaultPolicy();
        }
    }

    //  Dispatch it with the computed firing policy.
    return this.dispatch(aSignal,
                            this.getNativeNode(),
                            aPayload,
                            policy,
                            isCancelable,
                            isBubbling);
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('signalAfterRepaint',
function(aSignal, aPayload, aPolicy, aType, isCancelable, isBubbling) {

    /**
     * @method signalAfterRepaint
     * @summary Signals activity to registered observers, but does so just
     *     after the browser has repainted. This is useful when the signaler
     *     doesn't care about the possibility that the signal could be cancelled
     *     and wants the UI to update before the signal is fired.
     * @param {String|TP.sig.Signal} aSignal The signal to fire.
     * @param {Object} aPayload Optional argument object (unused in this
     *     override).
     * @param {Function} aPolicy A "firing" policy that will define how the
     *     signal is fired.
     * @param {String|TP.sig.Signal} aType A default type to use when the signal
     *     type itself isn't found and a new signal subtype must be created
     *     (unused in this override).
     * @param {Boolean} isCancelable Optional flag for dynamic signals defining
     *     if they can be cancelled.
     * @param {Boolean} isBubbling Optional flag for dynamic signals defining
     *     whether they bubble (when using TP.DOM_FIRING).
     * @returns {TP.sig.Signal}
     */

    var elem;

    elem = this.getNativeNode();

    setTimeout(function() {
        //  do the actual dispatch work here using TIBET's standard
        //  TP.dispatch() call (this can handle keyboard events etc)
        return TP.dispatch(null, //  'V' will be computed from our native node
                            aSignal,
                            elem,
                            aPayload,
                            aPolicy,
                            isCancelable,
                            isBubbling);
    }, TP.sys.cfg('fork.delay'));
});

//  ========================================================================
//  TP.dom.NonNativeUIElementNode
//  ========================================================================

/**
 * @type {TP.dom.NonNativeUIElementNode}
 * @summary A type that represents 'non-native' (to a User Agent) element nodes
 *     that need various things like stylesheets to be attached to a hosting DOM
 *     so that they can be rendered properly. This type is normally 'traited in'
 *     to other types.
 */

//  ------------------------------------------------------------------------

TP.dom.ElementNode.defineSubtype('dom.NonNativeUIElementNode');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation
TP.dom.NonNativeUIElementNode.isAbstract(true);

//  ------------------------------------------------------------------------

TP.dom.NonNativeUIElementNode.Type.defineMethod('tagAttachStyle',
function(aRequest) {

    /**
     * @method tagAttachStyle
     * @summary Sets up runtime style for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var doc;

    //  We see if the request has a target document. If so, we use that as the
    //  document.
    if (!TP.isDocument(doc = aRequest.at('doc'))) {
        //  TODO: Raise an exception
        return;
    }

    this.addStylesheetTo(doc);

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
