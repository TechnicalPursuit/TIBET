//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  ========================================================================
//  TP.lang.Object Extensions
//  ========================================================================

TP.lang.Object.Type.defineMethod('constructContentObject',
function(content, aURI) {

    /**
     * @method constructContentObject
     * @summary Returns a content handler for the URI provided. This method is
     *     invoked as part of MIME-type specific handling for URIs.
     * @param {Object} content The content to set into the content object.
     * @param {TP.uri.URI} aURI The source URI. Ignored for this type.
     * @returns {Object} The object representation of the content.
     */

    return this.construct(content);
});

//  ========================================================================
//  TP.core.Selection
//  ========================================================================

/**
 * @type {TP.core.Selection}
 * @summary A type, usually added as a trait, that manages selection indexes.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.Selection');

//  can't construct concrete instances of this
TP.core.Selection.isAbstract(true);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  An Array of indexes representing the selection
TP.core.Selection.Inst.defineAttribute('selectionIndexes');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Selection.Inst.defineMethod('addSelectionIndexes',
function(newIndexes) {

    /**
     * @method addSelectionIndexes
     * @summary Adds the supplied index or indexes to the selection indexes for
     *     the receiver. Note that selection indexes are uniqued by this method,
     *     so repeated indexes will only be represented once.
     * @param {Number[]} newIndexes The indexes to add to the tracked selection
     *     indexes.
     * @returns {Number[]} An Array of numbers representing the selection
     *     indexes.
     */

    var indexes;

    indexes = this.get('selectionIndexes');

    //  Add all of the indexes from the supplied Array.
    indexes.addAll(newIndexes);

    //  Unique the indexes so that we don't have more than one represented.
    indexes.unique();

    return indexes;
});

//  ------------------------------------------------------------------------

TP.core.Selection.Inst.defineMethod('getSelectionIndex',
function() {

    /**
     * @method getSelectionIndex
     * @summary Return the index of the first item of the current selection.
     * @returns {Number} The first item's index.
     */

    var indexes;

    if (!TP.isArray(indexes = this.$get('selectionIndexes'))) {
        return TP.NO_SIZE;
    }

    return indexes.first();
});

//  ------------------------------------------------------------------------

TP.core.Selection.Inst.defineMethod('getSelectionIndexes',
function() {

    /**
     * @method getSelectionIndexes
     * @summary Return the indexes of the current selection.
     * @returns {Number[]} An Array of numbers representing the selection
     *     indexes.
     */

    var indexes;

    if (!TP.isArray(indexes = this.$get('selectionIndexes'))) {
        indexes = TP.ac();
        this.set('selectionIndexes', indexes, false);
    }

    return indexes;
});

//  ------------------------------------------------------------------------

TP.core.Selection.Inst.defineMethod('removeSelectionIndexes',
function(oldIndexes) {

    /**
     * @method removeSelectionIndexes
     * @summary Removes the supplied index or indexes from the selection indexes
     *     for the receiver.
     * @param {Number[]} oldIndexes The indexes to remove from the tracked
     *     selection indexes.
     * @returns {Number[]} An Array of numbers representing the selection
     *     indexes.
     */

    var indexes;

    indexes = this.get('selectionIndexes');

    //  Remove all of the indexes from the supplied Array.
    indexes.removeAll(oldIndexes);

    return indexes;
});

//  ========================================================================
//  TP.core.Content
//  ========================================================================

/**
 * @type {TP.core.Content}
 * @summary A content handler specific to the TP.core.Content format.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.Content');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation
TP.core.Content.addTraits(TP.core.Selection);

//  This type's constructor functions to locate the best matching subtype.
TP.core.Content.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Content.Type.defineMethod('constructContentObject',
function(content, aURI) {

    /**
     * @method constructContentObject
     * @summary Returns a content handler for the URI provided. This method is
     *     invoked as part of MIME-type specific handling for URIs.
     * @param {String} content The string content to process.
     * @param {TP.uri.URI} [aURI] The source URI.
     * @returns {Object} The object representation of the content.
     */

    return this.construct(content, aURI);
});

//  ------------------------------------------------------------------------

TP.core.Content.Type.defineMethod('getConcreteType',
function(content, aURI) {

    /**
     * @method getConcreteType
     * @summary Returns the type to use for a particular access path.
     * @param {Object} content The data to find a concrete type for.
     * @param {TP.uri.URI} [aURI] The source URI.
     * @returns {TP.meta.core.Content} A viable subtype for enclosing the
     *     content.
     */

    if (TP.isNode(content) || TP.isKindOf(content, TP.dom.Node)) {
        return TP.core.XMLContent;
    }

    if (TP.core.XMLContent.canConstruct(content, aURI)) {
        return TP.core.XMLContent;
    }

    if (TP.core.CSSStyleSheetContent.canConstruct(content, aURI)) {
        return TP.core.CSSStyleSheetContent;
    }

    if (TP.core.JSONContent.canConstruct(content, aURI)) {
        return TP.core.JSONContent;
    }

    return TP.core.TextContent;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  A URI that is acting as our public reference
TP.core.Content.Inst.defineAttribute('$publicURI');

//  The source URI providing our data, if any.
TP.core.Content.Inst.defineAttribute('sourceURI');

//  The content's JavaScript representation
TP.core.Content.Inst.defineAttribute('data');

//  does this content act transactionally?
TP.core.Content.Inst.defineAttribute('transactional');

//  current checkpoint index, used by back/forward and getData to manage which
//  version of a transactional content object is current.
TP.core.Content.Inst.defineAttribute('currentIndex');

//  the snapshot stack when the receiver is using transactions
TP.core.Content.Inst.defineAttribute('snaps');

//  the checkpoint hash, used when the receiver is checkpointing
TP.core.Content.Inst.defineAttribute('points');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Content.Type.defineMethod('fromString',
function(aString, aURI) {

    /**
     * @method fromString
     * @summary Returns a new instance from the string provided.
     * @param {Object} data The data to use for this content.
     * @param {TP.uri.URI} aURI The source URI.
     * @returns {TP.core.Content} A new instance.
     */

    return this.construct(aString, aURI);
});

//  ------------------------------------------------------------------------

TP.core.Content.Type.defineMethod('fromTP_core_Content',
function(aContent) {

    /**
     * @method fromTP.core.Content
     * @summary Returns the TP.core.Content object provided.
     * @param {TP.core.Content} aContent A content object.
     * @returns {TP.core.Content} The supplied object.
     */

    return aContent;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('init',
function(data, aURI) {

    /**
     * @method init
     * @summary Returns a newly constructed Object from inbound content.
     * @param {Object} data The data to use for this content.
     * @param {TP.uri.URI} aURI The source URI.
     * @returns {TP.core.Content} A new instance.
     */

    this.callNextMethod();

    this.set('sourceURI', aURI, false);
    this.set('data', data, false);

    //  Execute the data getter once just to get private data structures
    //  initialized.
    if (TP.isValid(data)) {
        this.get('data');
    }

    this.set('transactional', false, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('addObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method addObserver
     * @summary Adds a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe() call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Object[]} anOrigin One or more origins to observe.
     * @param {Object|Object[]} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to add the observation, false otherwise.
     */

    var facetFunctions;

    facetFunctions = this.$get('$facetFunctions');

    if (TP.isURI(aHandler) && TP.isEmpty(facetFunctions)) {
        this.setupFacetObservations();
        this.$set('$publicURI', aHandler, false);
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('asString',
function() {

    /**
     * @method asString
     * @summary Returns the common string representation of the receiver.
     * @returns {String} The content object in string form.
     */

    return TP.str(this.get('data'));
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('asCleanString',
function(storageInfo) {

    /**
     * @method asCleanString
     * @summary Returns the 'clean' string representation of the receiver.
     *     This may have transformations in it to 'clean' the String, such as
     *     removing unnecessary namespace definitions, etc.
     * @param {TP.core.Hash} [storageInfo] A hash containing various flags for
     *     and results of the serialization process. Notable keys include:
     *          'wantsXMLDeclaration': Whether or not the receiver's document
     *          node should include an 'XML declaration' at the start of its
     *          serialization. The default is false.
     *          'wantsPrefixedXMLNSAttrs': Whether or not the receiver and its
     *          decendant elements should generate prefixed (i.e. 'xmlns:foo')
     *          attributes to support their proper serialization. The default is
     *          true.
     * @returns {String} The content object in clean string form.
     */

    //  At this level, we just return the String representation.
    return this.asString();
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('changed',
function(anAspect, anAction, aDescription) {

    /**
     * @method changed
     * @summary Notifies observers that some aspect of the receiver has
     *     changed. The fundamental data-driven dependency method.
     * @description We override this method at this level to tell the underlying
     *     data to signal a change.
     * @param {String} anAspect The aspect of the receiver that changed. This is
     *     usually an attribute name.
     * @param {String} anAction The action which caused the change. This usually
     *     'add', 'remove', etc.
     * @param {TP.core.Hash} aDescription A hash describing details of the
     *     change.
     * @returns {TP.core.Content} The receiver.
     * @fires Change
     */

    var srcURI;

    //  NB: For new objects, this relies on 'undefined' being a 'falsey' value.
    //  We don't normally do this in TIBET, but this method is used heavily and
    //  is a hotspot.
    if (!this.shouldSignalChange()) {
        return this;
    }

    //  when a change has happened we need to adjust to the current index so
    //  things like a combination of a back() and a set() will throw away the
    //  data after the current data, but when the aspect is current index itself
    //  we skip this since what's happening is just a forward or back call
    //  shifting the current "visible" data
    if (TP.isEmpty(anAspect) || anAspect !== 'currentIndex') {
        this.discardCheckpointSnaps();
    }

    //  with possible snaps list adjustments we now need to update the name
    //  to index hash entries
    this.discardCheckpointNames();

    if (anAspect === 'currentIndex') {
        this.callNextMethod();
        this.$changed('value', TP.UPDATE);
    } else {
        if (TP.isValid(this.get('data'))) {
            this.$changed(anAspect, anAction, aDescription);
        }

        srcURI = this.get('sourceURI');
        if (TP.isURI(srcURI)) {
            srcURI.isDirty(true, true);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('copy',
function() {

    /**
     * @method copy
     * @summary Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver.
     * @returns {TP.core.Content} A copy of the receiver.
     */

    var dataCopy,
        newinst;

    dataCopy = TP.copy(this.get('data'));

    newinst = this.getType().construct(dataCopy, this.get('sourceURI'));

    //  NB: We do *not* copy '$publicURI' here

    newinst.$set('transactional', this.$get('transactional'), false);
    newinst.$set('currentIndex', this.$get('currentIndex'), false);
    newinst.$set('snaps', TP.copy(this.$get('snaps')), false);
    newinst.$set('points', TP.copy(this.$get('points')), false);

    return newinst;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('getData',
function() {

    /**
     * @method getData
     * @summary Returns the underlying data object.
     * @returns {Object} The receiver's underlying data object.
     */

    var ndx,
        data,
        snaps;

    if (!this.$get('transactional')) {
        return this.$get('data');
    }

    ndx = this.$get('currentIndex');
    snaps = this.$get('snaps');

    //  NOTE:   we use $get here since we don't want to recurse over
    //          getProperty() calls that use getNativeNode
    if (TP.isValid(ndx)) {
        data = snaps.at(ndx);
    } else {
        data = this.$get('data');
    }

    return data;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('$getEqualityValue',
function() {

    /**
     * @method $getEqualityValue
     * @summary Returns the value which should be used for testing equality
     *     for the receiver.
     * @returns {Object} A value appropriate for use in equality comparisons.
     */

    var data;

    data = this.get('data');

    if (TP.canInvoke(data, '$getEqualityValue')) {
        return data.$getEqualityValue();
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('getFacetedAspectNames',
function() {

    /**
     * @method getFacetedAspectNames
     * @summary Returns an Array of the names of the aspects that are faceted on
     *     the receiver.
     * @returns {String[]} A list of the names of aspects that are faceted on
     *     the receiver.
     */

    var aspectsToCheck,
        index;

    aspectsToCheck = this.callNextMethod();

    //  We want to filter out the 'data' slot
    if ((index = aspectsToCheck.indexOf('data')) !== TP.NOT_FOUND) {
        aspectsToCheck.splice(index, 1);
    }

    return aspectsToCheck;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('getNativeObject',
function(aRequest) {

    /**
     * @method getNativeObject
     * @summary Returns the underlying data object.
     */

    return this.getData();
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('getPathSource',
function(aPath) {

    /**
     * @method getPathSource
     * @summary Return the current source object being used by the executeGet()
     *     and executeSet() methods. At this level, this method returns the
     *     underlying data object.
     * @param {TP.path.AccessPath} aPath The path that the path source will be
     *     used with.
     * @returns {Object} The object used as the current path source object.
     */

    return this.$get('data');
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('getResource',
function(aRequest) {

    /**
     * @method getResource
     * @summary Returns the underlying data object.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An optional request object.
     * @returns {TP.sig.Response} A response for the request containing the
     *     receiver's data.
     */

    var request,
        response,
        data;

    request = TP.request(aRequest);
    response = request.getResponse();

    data = this.getData();

    request.complete(data);

    return response;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('getValue',
function() {

    /**
     * @method getValue
     * @summary Returns the 'value' of the receiver. For this type, this method
     *     returns the underlying data.
     * @returns {Object} The value of the receiver - in this case, it's 'data'.
     */

    return this.get('data');
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('getValidatingAspectNames',
function() {

    /**
     * @method getValidatingAspectNames
     * @summary Returns an Array of the names of the aspects to validate on the
     *     receiver.
     * @returns {String[]} A list of the names of aspects to validate on the
     *     receiver.
     */

    var aspectsToCheck,
        index;

    aspectsToCheck = this.callNextMethod();

    //  We want to filter out the 'data' slot
    if ((index = aspectsToCheck.indexOf('data')) !== TP.NOT_FOUND) {
        aspectsToCheck.splice(index, 1);
    }

    return aspectsToCheck;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('isEmpty',
function() {

    /**
     * @method isEmpty
     * @summary Returns whether or not the receiver is considered 'empty'.
     * @description For content objects, they are considered empty if their data
     *     is considered empty.
     * @returns {Boolean} Whether or not the receiver is empty.
     */

    return TP.isEmpty(this.getData());
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineHandler('Change',
function(aSignal) {

    /**
     * @method handleChange
     * @summary Handles changes to the receiver's resource.
     * @description Content objects listen for changes to their data objects and
     *     then, using their access path aliases, rebroadcast those changes to
     *     listeners.
     * @param {TP.sig.Change} aSignal The signal indicating a change has
     *     happened in the resource.
     * @returns {TP.core.Content} The receiver.
     */

    var sigName,
        payload,

        aspect,
        action,

        pathAspectAliases,
        aliasesLen,

        description,

        oldTarget,

        originID,

        i,

        aspectName,
        aspectSigName;

    payload = aSignal.getPayload();

    aspect = payload.at('aspect');

    action = payload.at('action');
    switch (action) {
        case TP.CREATE:
        case TP.INSERT:
        case TP.APPEND:

            //  CREATE, INSERT or APPEND means an 'insertion structural change'
            //  in the data.
            sigName = 'TP.sig.StructureInsert';
            break;

        case TP.DELETE:

            //  DELETE means a 'deletion structural change' in the data.
            sigName = 'TP.sig.StructureDelete';
            break;

        case TP.UPDATE:

            //  UPDATE means just a value changed.
            sigName = 'TP.sig.ValueChange';
            break;

        default:

            //  The default is the TP.sig.ValueChange signal.
            sigName = 'TP.sig.ValueChange';
            break;
    }

    pathAspectAliases = this.getAccessPathAliases(aspect);

    description = payload.copy();

    //  Because we want any querying of the signal's value to happen with *this*
    //  object as the query target, we grab the old target and put ourself in as
    //  the target.
    oldTarget = description.at('target');
    description.atPut('target', this);

    originID = this.getID();

    //  If we found any path aliases, then loop over them and dispatch
    //  using their aspect name.
    if (TP.isValid(pathAspectAliases)) {
        aliasesLen = pathAspectAliases.getSize();

        for (i = 0; i < aliasesLen; i++) {
            aspectName = pathAspectAliases.at(i);

            description.atPut('aspect', aspectName);

            aspectSigName = TP.makeStartUpper(aspectName) + 'Change';

            //  Note that we force the firing policy here. This allows observers
            //  of a generic Change to see 'aspect'Change notifications, even if
            //  those 'aspect'Change signals haven't been defined as being
            //  subtypes of Change.

            //  Also note how we supply either 'TP.sig.Change' (the top level
            //  for simple attribute changes) or one of the subtypes of
            //  'TP.sig.StructureChange' (the top level for structural changes,
            //  mostly used in 'path'ed attributes) as the default signal type
            //  here so that undefined aspect signals will use that type.
            TP.signal(originID, aspectSigName, description,
                        TP.INHERITANCE_FIRING, sigName);
        }
    } else {
        //  Otherwise send the generic signal.
        TP.signal(originID, sigName, description);
    }

    //  Restore the old target since we mucked with it.
    description.atPut('target', oldTarget);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineHandler('ClearContent',
function(aSignal) {

    /**
     * @method handleClearContent
     * @summary Handles when the receiver's data is to be cleared.
     * @param {TP.sig.ClearContent} aSignal The signal instance which triggered
     *     this handler.
     * @returns {TP.core.Content} The receiver.
     */

    TP.todo();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineHandler('CloneItem',
function(aSignal) {

    /**
     * @method handleCloneItem
     * @summary Handles when an item is to be cloned and inserted into the
     *     receiver's data.
     * @param {TP.sig.CloneItem} aSignal The signal instance which triggered
     *     this handler.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidURI
     * @returns {TP.core.Content} The receiver.
     */

    TP.override();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineHandler('DeleteItem',
function(aSignal) {

    /**
     * @method handleDeleteItem
     * @summary Handles when an item is to be deleted and removed from the
     *     receiver's data.
     * @param {TP.sig.DeleteItem} aSignal The signal instance which triggered
     *     this handler.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidURI
     * @returns {TP.core.Content} The receiver.
     */

    var scope,
        scopeURI,

        index,

        targetElem;

    //  The 'scope' should be a URI location to find the overall collection to
    //  insert the item into. It should be either the whole collection
    //  representing the data of the receiver or a subcollection of that data.
    if (TP.isEmpty(scope = aSignal.at('scope'))) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  Make sure we can create a real URI from it.
    if (!TP.isURI(scopeURI = TP.uc(scope))) {
        return this.raise('TP.sig.InvalidURI');
    }

    //  Grab the index if one was specified in the signal.
    index = aSignal.at('index');
    if (index === TP.TARGET) {

        //  If the index was 'TP.TARGET', then we're going to use the 'repeat
        //  index' of the target.
        targetElem = aSignal.at('trigger').getTarget();
        if (TP.isElement(targetElem)) {
            index = TP.wrap(targetElem).$getNearestRepeatIndex();
        }
    } else {
        //  Otherwise, if the index is a Number, then we use. If not, then we
        //  set it to null, instructing the insertion method just use the end of
        //  the collection
        index = parseInt(index, 10);
        if (TP.isNaN(index)) {
            index = null;
        }
    }

    //  Remove a row from that collection, using the deletion index in the
    //  signal.
    this.removeRowFromAt(scopeURI, index);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineHandler('InsertItem',
function(aSignal) {

    /**
     * @method handleInsertItem
     * @summary Handles when an item is to be inserted into the receiver's data.
     * @param {TP.sig.InsertItem} aSignal The signal instance which triggered
     *     this handler.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidURI
     * @returns {TP.core.Content} The receiver.
     */

    var scope,
        scopeURI,

        source,

        index,

        targetElem;

    //  The 'scope' should be a URI location to find the overall collection to
    //  insert the item into. It should be either the whole collection
    //  representing the data of the receiver or a subcollection of that data.
    if (TP.isEmpty(scope = aSignal.at('scope'))) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  Make sure we can create a real URI from it.
    if (!TP.isURI(scopeURI = TP.uc(scope))) {
        return this.raise('TP.sig.InvalidURI');
    }

    //  This could be undefined, but if it's real we want to make URI out of it.
    source = aSignal.at('source');
    if (TP.notEmpty(source)) {
        source = source.unquoted();

        if (TP.isURIString(source)) {
            source = TP.uc(source);
        } else if (source.charAt(0) === '#') {

            //  If it's not an XPointer, then make a 'direct to GUI' URI out of
            //  it.
            if (!TP.regex.ANY_POINTER.test(source)) {
                source = 'tibet://uicanvas#tibet(' + source + ')';
            }

            source = TP.uc(source);
        } else {

            //  Otherwise, try to create an access path from it.
            source = TP.apc(source);
        }
    }

    //  Grab the index if one was specified in the signal.
    index = aSignal.at('index');
    if (index === TP.TARGET) {

        //  If the index was 'TP.TARGET', then we're going to use the 'repeat
        //  index' of the target.
        targetElem = aSignal.at('trigger').getTarget();
        if (TP.isElement(targetElem)) {
            index = TP.wrap(targetElem).$getNearestRepeatIndex();
        }
    } else {
        //  Otherwise, if the index is a Number, then we use. If not, then we
        //  set it to null, instructing the insertion method just use the end of
        //  the collection
        index = parseInt(index, 10);
        if (TP.isNaN(index)) {
            index = null;
        }
    }

    //  Go ahead and insert the cloned data.
    this.insertRowIntoAt(
            scopeURI,
            source,
            index,
            aSignal.at('position'),
            aSignal.at('copy'),
            aSignal.at('clear'));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineHandler('SetContent',
function(aSignal) {

    /**
     * @method handleSetContent
     * @summary Handles when the receiver's data is to be set to the source
     *     specified in the 'source' parameter of the supplied signal. The
     *     source should resolve to a value that a URI can be constructed from.
     *     The signal should also specify via a 'copy' Boolean flag as to
     *     whether the source's data should be copied.
     * @param {TP.sig.SetContent} aSignal The signal instance which triggered
     *     this handler.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidURI
     * @exception TP.sig.InvalidSource
     * @returns {TP.core.Content} The receiver.
     */

    var scope,
        scopeURI,

        sourceURI,
        source;

    //  The 'scope' should be a URI location to find the overall collection to
    //  insert the item into. It should be either the whole collection
    //  representing the data of the receiver or a subcollection of that data.
    if (TP.isEmpty(scope = aSignal.at('scope'))) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  Make sure we can create a real URI from it.
    if (!TP.isURI(scopeURI = TP.uc(scope))) {
        return this.raise('TP.sig.InvalidURI');
    }

    //  Make sure we can create a real URI from the source.
    source = aSignal.at('source');
    if (TP.isEmpty(source)) {
        return this.raise('TP.sig.InvalidSource');
    }

    source = source.unquoted();

    if (!TP.isURI(sourceURI = TP.uc(source))) {
        return this.raise('TP.sig.InvalidURI');
    }

    scopeURI.setResourceToResultOf(
        sourceURI,
        TP.hc('signalChange', true),
        TP.bc(aSignal.at('copy')));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('removeObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method removeObserver
     * @summary Removes a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Object[]} anOrigin One or more origins to ignore.
     * @param {Object|Object[]} aSignal One or more signals to ignore from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn off observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to remove the observation, false otherwise.
     */

    if (TP.isURI(aHandler) && aHandler === this.$get('$publicURI')) {
        this.teardownFacetObservations();
        this.$set('$publicURI', null, false);
    }

    //  Always tell the notification to remove our handler, etc.
    return true;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('set',
function(attributeName, attributeValue, shouldSignal) {

    /**
     * @method set
     * @summary Sets the value of the named attribute to the value provided. If
     *     no value is provided the value null is used.
     * @description This is overridden from its supertype to automatically check
     *     facets after the value is set.
     * @param {String|TP.path.AccessPath} attributeName The name of the
     *     attribute to set.
     * @param {Object} attributeValue The value to set.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {TP.core.Content} The receiver.
     */

    var retVal,
        attrName;

    retVal = this.callNextMethod();

    //  This might be an access path
    attrName = attributeName.asString();

    if (attrName !== 'data' &&
        attrName !== 'sourceURI' &&
        attrName !== 'transactional') {
        this.checkFacets(attrName);
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('setContent',
function(aDataObject, shouldSignal) {

    /**
     * @method setContent
     * @summary Sets the receiver's data object to the supplied object.
     * @param {Object} aDataObject The object to set the receiver's internal
     *     data to.
     * @param {Boolean} [shouldSignal=false] Whether or not to signal change.
     * @returns {TP.core.Content} The receiver.
     */

    return this.setData(aDataObject, shouldSignal);
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('setData',
function(aDataObject, shouldSignal) {

    /**
     * @method setData
     * @summary Sets the receiver's data object to the supplied object.
     * @param {Object} aDataObject The object to set the receiver's internal
     *     data to.
     * @param {Boolean} [shouldSignal=false] Whether or not to signal change.
     * @returns {TP.core.Content} The receiver.
     */

    var oldDataObject;

    //  NB: We use '$get()' here because we want access to the real underlying
    //  object - subtypes and local objects might have reprogrammed 'getData()'
    //  to return other objects or have special handling logic.
    oldDataObject = this.$get('data');
    if (TP.isValid(oldDataObject) && TP.isMutable(oldDataObject)) {
        this.ignore(oldDataObject, 'Change');
    }

    this.$set('data', aDataObject, false);

    //  If the data object is mutable, then we observe it for change. NOTE: This
    //  will also 'turn on' change signaling for this object. That way, change
    //  signals will propagate 'up' from the data object, through us, to
    //  observers.
    if (TP.isMutable(aDataObject)) {
        this.observe(aDataObject, 'Change');
    } else {
        //  Otherwise, we manually turn on change signaling for this object.
        //  That way, change signals from our swapping out the non-mutable
        //  object that is our data will still inform any objects observing us.
        this.shouldSignalChange(true);
    }

    if (TP.notFalse(shouldSignal)) {

        //  Note that we do not use $changed here - we still let the data
        //  object decide whether it wants to send changed.
        //  TODO: Find out why this needs to be this way. If shouldSignal is
        //  true, we should be forcing change via $changed(). But changing that
        //  here causes all of the tests to break.
        this.changed('value', TP.UPDATE);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('setID',
function(anID) {

    /**
     * @method setID
     * @summary Sets the public ID of the receiver.
     * @param {String} anID The value to use as a public ID.
     * @returns {String} The ID that was set.
     */

    var dataObject,
        retVal;

    //  NB: We use '$get()' here because we want access to the real underlying
    //  object - subtypes and local objects might have reprogrammed 'getData()'
    //  to return other objects or have special handling logic.
    if (TP.isValid(dataObject = this.$get('data'))) {

        //  Ignore our data object under our 'old ID'
        this.ignore(dataObject, 'Change');

        //  Go ahead and get new ID assigned.
        retVal = this.callNextMethod();

        //  Observe our data object under our 'new ID'
        this.observe(dataObject, 'Change');
    } else {

        //  We have no data - just do whatever our supertype does.
        retVal = this.callNextMethod();
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('shouldSignalChange',
function(aFlag) {

    /**
     * @method shouldSignalChange
     * @summary Defines whether the receiver should actively signal change
     *     notifications.
     * @description In general objects do not signal changes when no observers
     *     exist. This flag is triggered by observe where the signal being
     *     observed is a form of Change signal to "arm" the object for change
     *     notification. You can also manipulate it during multi-step
     *     manipulations to signal only when a series of changes has been
     *     completed.
     * @param {Boolean} aFlag true/false signaling status.
     * @returns {Boolean} The current status.
     */

    var data,

        dataChanges,
        receiverChanges;

    data = this.get('data');

    if (TP.isValid(data)) {
        if (TP.canInvoke(data, 'shouldSignalChange')) {
            //  Note we can't do 'if (flag)' here because of its Boolean nature.
            if (arguments.length) {
                dataChanges = data.shouldSignalChange(aFlag);
            } else {
                dataChanges = data.shouldSignalChange();
            }
        }
    }

    receiverChanges = this.callNextMethod();

    return receiverChanges || dataChanges;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('toJSON',
function() {

    /**
     * @method toJSON
     * @summary Returns the object to use in JSON representations.
     * @returns {Object} The object to use in a JSON representation.
     */

    var data;

    data = this.getData();

    if (TP.canInvoke(data, 'toJSON')) {
        return data.toJSON();
    }

    return data;
});

//  ------------------------------------------------------------------------
//  CONTENT "TRANSACTIONS"
//  ------------------------------------------------------------------------

/*
Operations which form the core of the TP.core.Content "transaction" support
which allows content to serve as a model supporting undo/redo operations via
back/forward (temporary) and commit/rollback (permanent) methods.
*/

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('back',
function(aName) {

    /**
     * @method back
     * @summary Moves the receiver's current snapshot index back to the named
     *     checkpoint index, or by one checkpoint such that requests for
     *     information about the receiver resolve to that state. No checkpoints
     *     are removed and a forward() will undo the effect of this call --
     *     unless you alter the state of the snapshot after calling back().
     * @param {String} aName The name of a specific checkpoint to index to.
     *     Defaults to the prior checkpoint location.
     * @exception TP.sig.InvalidCheckpoint
     * @returns {TP.core.Content} The receiver.
     */

    var snaps,
        points,
        ndx;

    if (!this.isTransactional()) {
        return this;
    }

    if (TP.notValid(snaps = this.get('snaps'))) {
        //  if user thought there was a named checkpoint but we don't have any
        //  then we consider that an error
        if (TP.isString(aName)) {
            return this.raise('TP.sig.InvalidCheckpoint',
                'No active checkpoints have been made.');
        } else {
            //  if no name provided we can consider this a no-op
            return this;
        }
    }

    if (TP.notEmpty(aName)) {

        points = this.get('points');
        if (TP.notValid(points)) {
            //  if user thought there was a checkpoint but we don't have any
            //  then we consider that an error
            return this.raise('TP.sig.InvalidCheckpoint',
                'No active checkpoints have been named.');
        }

        ndx = points.at(aName);
        if (TP.notValid(ndx)) {
            return this.raise('TP.sig.InvalidCheckpoint',
                'Checkpoint ' + aName + ' not found.');
        }

    } else {

        //  decrement the index, but don't let it go below 0
        ndx = this.get('currentIndex');
        if (ndx === 0) {
            return this;
        } else if (TP.notValid(ndx)) {
            //  Set to the end of the snapshot list.
            ndx = snaps.getSize() - 1;
        }

        //  back up one index
        ndx = ndx - 1;
    }

    //  Make sure we're not backing up past the start of the list.
    ndx = ndx.max(0);

    //  if the value changes here a change notice will fire...
    this.set('currentIndex', ndx);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('checkpoint',
function(aName) {

    /**
     * @method checkpoint
     * @summary Checkpoints the current content, making it available for future
     *     rollback operations via either name or position.
     * @param {String} aName An optional name to assign to the checkpoint which
     *     can be supplied to rollback() calls.
     * @returns {Number} The number of checkpoints after the new checkpoint has
     *     been added.
     */

    var snaps,
        ndx,
        points;

    if (!this.isTransactional()) {
        return this;
    }

    //  if no snaps list yet then construct one so we can store the data
    if (TP.notValid(snaps = this.get('snaps'))) {
        snaps = TP.ac();
        this.$set('snaps', snaps, false);
    }

    //  here's a bit of a twist, if we checkpoint while looking at an indexed
    //  location we have to clear the rest of the list and remove any checkpoint
    //  name references to points later in the list
    if (TP.isNumber(ndx = this.get('currentIndex'))) {
        //  set length to trim off elements past the current index location,
        //  discarding their changes, this will cause the discardCheckpoint
        //  routine to consider checkpoints referencing indexes past that
        //  point to be invalid so they get removed
        snaps.length = ndx + 1;

        //  since we've adjusted the snaps list length we need to update the
        //  index reference data
        this.discardCheckpointNames();
    }

    //  are we naming this one?
    if (TP.notEmpty(aName)) {
        //  construct a hash for named checkpoint references
        if (TP.notValid(points = this.get('points'))) {
            points = TP.hc();
            this.$set('points', points, false);
        }

        //  correlate name with current 'end of list' index which points to
        //  the snaps just prior to cloning it to save state at the "old"
        //  location
        points.atPut(aName, snaps.getSize());
    }

    //  with the snaps list in shape we can now add the new data.
    snaps.add(this.snapshotData());

    //  clear the current index since we're essentially saying we want to
    //  operate at the current location and start to float with checkpoint
    //  state again
    this.set('currentIndex', null);

    return snaps.getSize();
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('commit',
function() {

    /**
     * @method commit
     * @summary Collapses the list of available snaps into a single committed
     *     copy of the receiver containing all changes made.
     * @returns {TP.core.Content} The receiver.
     */

    var data,
        snaps,
        points;

    if (!this.isTransactional()) {
        return this;
    }

    //  Get the data - if there were snapshots in place, this will get the data
    //  from the 'currently active' one.
    data = this.get('data');

    snaps = this.$get('snaps');
    if (TP.isValid(snaps)) {
        snaps.length = 1;
    }

    points = this.$get('points');
    if (TP.isValid(points)) {
        points.getKeys().forEach(
            function(point) {
                if (points.at(point) > 0) {
                    points.removeKey(point);
                }
            });
    }

    this.$set('currentIndex', 0, false);

    //  Note how we use the regular 'set()' call here (because we might want
    //  custom setter logic to run), but we don't signal change because, to all
    //  outward appearances, this is the same data.
    this.set('data', data, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('discardCheckpointSnaps',
function() {

    /**
     * @method discardCheckpointSnaps
     * @summary Flushes any stored checkpoint data after the current snapshot
     *     index. When using back() and forward() along with checkpoint,
     *     rollback, or any mutation operations this method will be called to
     *     clear the obsolete data itself.
     * @returns {TP.core.Content} The receiver.
     */

    var ndx,
        snaps;

    if (!this.isTransactional()) {
        return this;
    }

    if (TP.notValid(snaps = this.get('snaps'))) {
        //  no-op since we've never checkpointed
        return this;
    }

    //  when there's no index set there have been no back calls and so we're
    //  at the end, or a previous forward cleared it because we reached the
    //  end...
    if (TP.notValid(ndx = this.get('currentIndex'))) {
        return this;
    }

    //  we've got a valid index, which indicates where we're currently
    //  looking. we want to discard everything from that point on...
    snaps.length = ndx + 1;

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('discardCheckpointNames',
function() {

    /**
     * @method discardCheckpointNames
     * @summary Flushes any stored checkpoint names which come after the
     *     current snapshot list length.
     * @description When using back() and forward() along with checkpoint,
     *     rollback, or any mutation operations this method will be called to
     *     clear name references to indexes into the snaps list which no longer
     *     exist.
     * @returns {TP.core.Content} The receiver.
     */

    var snaps,
        points;

    if (!this.isTransactional()) {
        return this;
    }

    if (TP.notValid(snaps = this.get('snaps'))) {
        //  no-op since we've never checkpointed
        return this;
    }

    if (TP.isEmpty(snaps)) {
        //  when there are no snaps all points are invalid...
        this.set('points', null);
    } else if (TP.isArray(points = this.get('points'))) {
        //  clear out point references to non-existent entries
        points.perform(
            function(item) {

                if (item.last() > snaps.getSize() - 1) {
                    points.removeKey(item.first());
                }
            });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('forward',
function(aName) {

    /**
     * @method forward
     * @summary Moves the receiver's current snapshot index forward to the named
     *     checkpoint index, or by one checkpoint such that requests for
     *     information about the receiver resolve to that state.
     * @param {String} aName The name of a specific checkpoint to index to.
     *     Defaults to the next checkpoint location available.
     * @exception TP.sig.InvalidCheckpoint
     * @returns {TP.core.Content} The receiver.
     */

    var snaps,
        ndx,
        points;

    if (!this.isTransactional()) {
        return this;
    }

    if (TP.notValid(snaps = this.get('snaps'))) {
        //  no-op since we've never checkpointed
        return this;
    }

    //  when there's no index set there have been no back calls and so we're
    //  at the end, or a previous forward cleared it because we reached the
    //  end...
    if (TP.notValid(ndx = this.get('currentIndex'))) {
        return this;
    }

    if (TP.notEmpty(aName)) {
        if (TP.notValid(points = this.get('points'))) {
            //  if user thought there was a checkpoint but we don't have
            //  any then we consider that an error
            return this.raise('TP.sig.InvalidCheckpoint',
                                'No active checkpoints have been named.');
        }

        ndx = points.at(aName);
        if (TP.notValid(ndx)) {
            return this.raise('TP.sig.InvalidCheckpoint',
                                'Checkpoint ' + aName + ' not found.');
        }

        //  this will trigger a change notice so observers can update
        this.set('currentIndex', ndx);
    } else {
        //  increment the index, but don't let it go off the end
        ndx = this.get('currentIndex') + 1;
        if (ndx < snaps.getSize()) {
            this.set('currentIndex', ndx);
        } else {
            //  if forward would go off the end then we'll reset so we
            //  start to float again. Note here how we do *not* signal change.
            this.set('currentIndex', null);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('isTransactional',
function(aFlag) {

    /**
     * @method isTransactional
     * @summary Combined setter/getter for whether the receiver has been told
     *     to support transactional behavior via checkpoint, commit, and
     *     rollback.
     * @param {Boolean} aFlag The state of the content's transaction flag, which
     *     will be set when provided.
     * @returns {Boolean} The current transaction state, after any optional
     *     set() operation has occurred.
     */

    if (TP.isBoolean(aFlag)) {

        if (TP.isTrue(this.$get('transactional'))) {

            if (!aFlag) {
                //  was transactional, clearing it now...

                //  TODO: check for unsaved changes etc...

                this.$set('snaps', null, false);
                this.$set('points', null, false);
                this.$set('currentIndex', null, false);
            }

        } else {

            if (aFlag) {
                //  wasn't transactional, turning it on...

                this.$set('transactional', aFlag, false);
                this.checkpoint();
            }
        }

        this.$set('transactional', aFlag, false);

        if (aFlag && !TP.sys.shouldUseContentCheckpoints()) {
            TP.ifWarn() ?
                TP.warn('Content transactions have been activated but ' +
                            'content is not being checkpointed.') : 0;
        }
    }

    return this.$get('transactional');
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('hasCheckpoint',
function(aName) {

    /**
     * @method hasCheckpoint
     * @summary Looks up the named checkpoint and returns true if it exists.
     * @param {String} aName An optional name to look up.
     * @returns {Boolean} True if the receiver has the named checkpoint.
     */

    var points;

    if (!TP.isString(aName)) {
        return false;
    }

    if (TP.notValid(points = this.get('points'))) {
        return false;
    }

    return TP.isValid(points.at(aName));
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('rollback',
function(aName) {

    /**
     * @method rollback
     * @summary Rolls back changes made since the named checkpoint provided in
     *     the first parameter, or all changes if no checkpoint name is
     *     provided. Note that unlike 'back' this routine will discard any
     *     checkpoints after the target checkpoint.
     * @param {String} aName An optional name provided when a checkpoint call
     *     was made, identifying the specific point to roll back to.
     * @exception TP.sig.InvalidRollback
     * @returns {TP.core.Content} The receiver.
     */

    var snaps,
        points,
        ndx;

    if (!this.isTransactional()) {
        return this;
    }

    if (TP.notValid(snaps = this.get('snaps'))) {
        //  if user thought there was a named checkpoint but we don't have any
        //  then we consider that an error
        if (TP.isString(aName)) {
            return this.raise('TP.sig.InvalidCheckpoint',
                'No active checkpoints have been made.');
        } else {
            //  if no name provided we can consider this a no-op
            return this;
        }
    }

    points = this.get('points');
    if (TP.notEmpty(aName)) {

        if (TP.notValid(points)) {
            //  if user thought there was a checkpoint but we don't have any
            //  then we consider that an error
            return this.raise('TP.sig.InvalidCheckpoint',
                'No active checkpoints have been named.');
        }

        ndx = points.at(aName);
        if (TP.notValid(ndx)) {
            return this.raise('TP.sig.InvalidCheckpoint',
                'Checkpoint ' + aName + ' not found.');
        }

    } else {

        //  If no checkpoint name is provided then we're resetting to the
        //  initial snapshot.
        ndx = 0;
    }

    //  Make sure we're not backing up past the start of the list.
    ndx = ndx.max(0);

    //  throw away snapshots beyond the one we'll be adjusting to.
    snaps.length = ndx + 1;

    //  NOTE we also have to remove any named checkpoints which point to
    //  indexes beyond our current index.
    if (TP.isValid(points)) {
        points.getKeys().forEach(
            function(point) {
                if (points.at(point) > ndx) {
                    points.removeKey(point);
                }
            });
    }

    //  if the value changes here a change notice will fire...
    this.set('currentIndex', ndx);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('snapshotData',
function() {

    /**
     * @method snapshotData
     * @summary Returns a snapshot of the receiver's underlying data for use by
     *     the transactional data management routines of the receiver.
     * @returns {Object} The snapshot data.
     */

    return TP.override();
});

//  ========================================================================
//  TP.core.CSSStyleSheetContent
//  ========================================================================

/**
 */

//  ------------------------------------------------------------------------

TP.core.Content.defineSubtype('core.CSSStyleSheetContent');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.CSSStyleSheetContent.Type.defineMethod('canConstruct',
function(data, uri) {

    /**
     * @method canConstruct
     * @summary Returns true if the receiver can construct a valid instance
     *     given the parameters provided.
     * @param {String} data The content data in question.
     * @param {URI} uri The TIBET URI object which loaded the content.
     * @returns {Boolean} Whether or not an instance of this can be constructed
     *     from the parameters provided.
     */

    if (TP.regex.CONTAINS_CSS.test(data)) {
        return true;
    }

    //  Not all style sheets have actual content. Check the URI.
    if (TP.canInvoke(uri, 'getExtension')) {
        return uri.getExtension() === 'css';
    }
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.CSSStyleSheetContent.Inst.defineMethod('getContentMIMEType',
function() {

    /**
     * @method getContentMIMEType
     * @summary Returns the receiver's "content MIME type", the MIME type the
     *     content can render most effectively.
     * @returns {String} The content MIME type.
     */

    return TP.CSS_TEXT_ENCODED;
});

//  ========================================================================
//  TP.core.JSONContent
//  ========================================================================

/**
 * @type {TP.core.JSONContent}
 * @summary A content handler specific to the TP.core.JSONContent format.
 */

//  ------------------------------------------------------------------------

TP.core.Content.defineSubtype('core.JSONContent');

//  ------------------------------------------------------------------------

TP.definePrimitive('jsoncc',
function(data) {

    /**
     * @method jsoncc
     * @summary Returns a newly initialized JSONContent instance.
     * @param {Object} data The data to use for this content.
     * @returns {TP.core.JSONContent} The new instance.
     */

    return TP.core.JSONContent.construct(data);
});

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.JSONContent.Type.defineMethod('canConstruct',
function(data, uri) {

    /**
     * @method canConstruct
     * @summary Returns true if the receiver can construct a valid instance
     *     given the parameters provided.
     * @param {String} data The content data in question.
     * @param {URI} uri The TIBET URI object which loaded the content.
     * @returns {Boolean} Whether or not an instance of this can be constructed
     *     from the parameters provided.
     */

    return TP.isJSONString(data);
});

//  ------------------------------------------------------------------------

TP.core.JSONContent.Type.defineMethod('validate',
function(anObject, includeFacetChecks) {

    /**
     * @method validate
     * @summary Returns true if the string parameter is valid
     *     TP.core.JSONContent.
     * @param {Object} anObject The object to test.
     * @param {Boolean} [includeFacetChecks=true] Whether or not to include
     *     'facet checks' or just do trivial checking to see if the data is even
     *     in the correct format for this content type.
     * @returns {Boolean} True if the object can be validated.
     */

    var anObj,
        str,

        isJSON;

    if (TP.notValid(anObj = anObject.get('data'))) {
        anObj = anObject;
    }

    //  First, check to make sure that it's even valid JSON. If it is, then call
    //  next method to check facets, etc.
    str = TP.js2json(anObj);
    isJSON = TP.isJSONString(str);

    if (isJSON && TP.notFalse(includeFacetChecks)) {
        return this.callNextMethod();
    }

    return isJSON;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.JSONContent.Inst.defineMethod('asHTTPValue',
function() {

    /**
     * @method asHTTPValue
     * @summary Returns the best value to be used for the receiver to send via
     *     HTTP.
     * @returns {String} The best value for HTTP sending.
     */

    return this.asJSONSource();
});

//  ------------------------------------------------------------------------

TP.core.JSONContent.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    //  Callers will be interested in our data, not the 'data' structure
    //  itself.
    return TP.json(this.get('data'));
});

//  ------------------------------------------------------------------------

TP.core.JSONContent.Inst.defineMethod('asString',
function() {

    /**
     * @method asString
     * @summary Returns the common string representation of the receiver.
     * @returns {String} The content object in string form.
     */

    return this.asJSONSource();
});

//  ------------------------------------------------------------------------

TP.core.JSONContent.Inst.defineMethod('getContentMIMEType',
function() {

    /**
     * @method getContentMIMEType
     * @summary Returns the receiver's "content MIME type", the MIME type the
     *     content can render most effectively.
     * @returns {String} The content MIME type.
     */

    return TP.JSON_ENCODED;
});

//  ------------------------------------------------------------------------

TP.core.JSONContent.Inst.defineMethod('getData',
function() {

    /**
     * @method getData
     * @summary Returns the underlying data object.
     * @returns {Object|undefined} The receiver's underlying data object.
     */

    var jsonData;

    jsonData = this.$get('data');

    //  If a String was handed in, it's probably JSON - try to convert it.
    if (TP.isString(jsonData) && TP.notEmpty(jsonData)) {

        jsonData = TP.json2js(jsonData);

        //  When first loading from server content the first pass can often
        //  return just a transformed string. If the first char of that is a
        //  curly brace we want to do a second pass.
        if (TP.isString(jsonData) && jsonData.charAt(0) === '{') {
            jsonData = TP.json2js(jsonData);
        }

        //  TP.json2js will raise for us.
        if (TP.notValid(jsonData)) {
            return;
        }

        this.set('data', jsonData, false);
    }

    return jsonData;
});

//  ------------------------------------------------------------------------

TP.core.JSONContent.Inst.defineMethod('getPathSource',
function(aPath) {

    /**
     * @method getPathSource
     * @summary Return the current source object being used by the executeGet()
     *     and executeSet() methods. At this level, this method returns the
     *     underlying data object.
     * @param {TP.path.AccessPath} aPath The path that the path source will be
     *     used with.
     * @returns {Object} The object used as the current path source object.
     */

    //  If we're going to be used with a JSONPath, then we are the path source -
    //  otherwise our data is.
    if (TP.isKindOf(aPath, TP.path.JSONPath)) {
        return this;
    }

    //  Make sure to call the specific getData() handler here so that any
    //  necessary conversion takes place.
    return this.getData();
});

//  ------------------------------------------------------------------------

TP.core.JSONContent.Inst.defineHandler('CloneItem',
function(aSignal) {

    /**
     * @method handleCloneItem
     * @summary Handles when an item is to be cloned and inserted into the
     *     receiver's data.
     * @param {TP.sig.CloneItem} aSignal The signal instance which triggered
     *     this handler.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidURI
     * @returns {TP.core.JSONContent} The receiver.
     */

    var scope,
        scopeURI,

        source,

        index,

        targetElem;

    //  The 'scope' should be a URI location to find the overall collection to
    //  insert the item into. It should be either the whole collection
    //  representing the data of the receiver or a subcollection of that data.
    if (TP.isEmpty(scope = aSignal.at('scope'))) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  Make sure we can create a real URI from it.
    if (!TP.isURI(scopeURI = TP.uc(scope))) {
        return this.raise('TP.sig.InvalidURI');
    }

    source = TP.tpc(TP.str(aSignal.atIfInvalid('source', '[0]')));

    //  Grab the index if one was specified in the signal.
    index = aSignal.at('index');
    if (index === TP.TARGET) {

        //  If the index was 'TP.TARGET', then we're going to use the 'repeat
        //  index' of the target.
        targetElem = aSignal.at('trigger').getTarget();
        if (TP.isElement(targetElem)) {
            index = TP.wrap(targetElem).$getNearestRepeatIndex();
        }
    } else {
        //  Otherwise, if the index is a Number, then we use. If not, then we
        //  set it to null, instructing the insertion method just use the end of
        //  the collection
        index = parseInt(index, 10);
        if (TP.isNaN(index)) {
            index = null;
        }
    }

    //  Go ahead and insert the cloned data.
    this.insertRowIntoAt(
            scopeURI,
            source,
            index,
            aSignal.at('position'),
            true,
            true);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JSONContent.Inst.defineMethod('insertRowIntoAt',
function(aCollectionURIOrPath, aDataRowOrURIOrPath, anInsertIndex, aPosition,
         shouldClone, shouldEmpty) {

    /**
     * @method insertRowIntoAt
     * @summary Inserts a row of data into the collection as defined by the
     *     supplied collection URI. This collection should be either the whole
     *     collection representing the data of the receiver or a subcollection
     *     of that data.
     * @param {TP.uri.URI|TP.path.AccessPath} aCollectionURIOrPath The URI
     *     pointing to the collection to add the row to or a path that, in
     *     combination with the receiver's 'public facing' URI, can be used to
     *     obtain a collection to add the row to.
     * @param {Array|TP.uri.URI|TP.path.AccessPath} aDataRowOrURIOrPath The URI
     *     or path that points to data or the object itself to insert into the
     *     collection.
     * @param {Number} [anInsertIndex] The index to insert the item at in the
     *     collection. Note that this works with the supplied position to
     *     determine whether the insertion should happen before or after. If not
     *     specified, the item will be inserted at the end of the collection.
     * @param {String} [aPosition=TP.AFTER] A value of TP.BEFORE, TP.AFTER or
     *     null. This determines the position of the insertion. If no position
     *     is supplied, TP.AFTER is assumed.
     * @param {Boolean} [shouldClone=false] Whether or not to clone the data
     *     before inserting it. The default is false.
     * @param {Boolean} [shouldEmpty=false] Whether or not to empty any cloned
     *     data before inserting it. The default is false. NOTE: This parameter
     *     is only used if the shouldClone parameter is true.
     * @returns {TP.core.Content} The receiver.
     */

    var targetURIOrPath,

        targetURI,
        publicURI,

        targetCollection,

        dataRow,

        keys,

        fragmentExpr,

        queryURI,

        insertIndex,

        changedAddresses,
        changedIndex,
        changedAspect,
        changedPaths,

        batchID;

    //  Obtain a URI that will be pointing at a collection.

    targetURIOrPath = aCollectionURIOrPath;
    publicURI = this.get('$publicURI');

    //  If targetURIOrPath is null or is not a TP.uri.URI (maybe its a
    //  path...), then set targetURI to publicURI (if its real).
    if (!TP.isURI(targetURIOrPath)) {

        //  publicURI isn't real - nothing to do here.
        if (!TP.isURI(publicURI)) {
            //  TODO: Raise exception
            return this;
        }

        targetURI = publicURI;
        if (targetURIOrPath.isAccessPath()) {
            //  NB: We assume 'async' of false here.
            targetCollection =
                targetURI.getResource(
                    TP.hc('async', false)).get('result').get(targetURIOrPath);

            //  Now, make sure that we're dealing with an Array
            if (!TP.isArray(targetCollection)) {
                targetCollection = TP.ac(targetCollection);
            }

            fragmentExpr = targetURIOrPath.asString();

        } else {
            //  Not a real path either.
            //  TODO: Raise exception
            return this;
        }

    } else {

        //  A URI was supplied to begin with.
        targetURI = targetURIOrPath;

        //  We should make sure that at least the primary URIs of the supplied
        //  URI and our source content URI are the same.
        if (targetURI.getPrimaryURI() !== publicURI.getPrimaryURI()) {
            //  TODO: Raise exception
            return this;
        }

        //  NB: We assume 'async' of false here.
        targetCollection = targetURI.getResource(
                            TP.hc('async', false,
                                    'shouldCollapse', false)).get('result');

        //  Now, make sure that we're dealing with an Array
        if (!TP.isArray(targetCollection)) {
            targetCollection = TP.ac(targetCollection);
        }

        fragmentExpr = targetURI.getFragmentExpr();
    }

    if (TP.isURI(aDataRowOrURIOrPath)) {
        //  NB: We assume 'async' of false here.
        dataRow = aDataRowOrURIOrPath.getResource(
                                TP.hc('async', false)).get('result');

    } else if (aDataRowOrURIOrPath.isAccessPath()) {

        queryURI = aCollectionURIOrPath;

        if (!TP.isURI(queryURI)) {

            queryURI = publicURI;

            //  Neither aCollectionURIOrPath or publicURI isn't real - nothing
            //  to do here.
            if (!TP.isURI(queryURI)) {
                //  TODO: Raise exception
                return this;
            }
        }

        //  NB: We assume 'async' of false here.
        dataRow =
            queryURI.getResource(
                TP.hc('async', false)).get('result').get(aDataRowOrURIOrPath);

    } else {
        dataRow = aDataRowOrURIOrPath;
    }

    if (TP.isTrue(shouldClone)) {

        dataRow = TP.copy(dataRow);

        if (TP.isTrue(shouldEmpty)) {
            if (TP.canInvoke(dataRow, 'clearTextContent')) {
                //  Clear out all of the 'text content' - that is, all of the
                //  scalar values in the newly cloned item. This will descend
                //  through the new item's data structure and cleanse it all of
                //  previous values.
                dataRow.clearTextContent();
            } else {
                keys = TP.keys(dataRow);
                keys.forEach(
                    function(aKey) {
                        dataRow[aKey] = '';
                    });
            }
        }
    }

    //  NB: The insertion index is computed to represent the row that will come
    //  *after* the new row after the insertion operation is complete (per
    //  'insertBefore()' semantics).

    if (TP.isNumber(insertIndex = anInsertIndex)) {
        insertIndex++;
    } else {

        //  No index specified - we will be manipulating the end of the
        //  collection.
        insertIndex = targetCollection.getSize();
    }

    //  TP.BEFORE was specified - subtract a position back off.
    if (aPosition === TP.BEFORE) {
        insertIndex--;
    }

    //  Splice it into the collection.
    targetCollection.splice(insertIndex, 0, dataRow);

    //  NB: We *must* reset the targetURI's resource here since we've modified
    //  it 'outside' of the normal set()/get() behavior and observers that are
    //  observing this object for changes will be depending on having a
    //  queryable structure when they receive their notification. Note also how
    //  we do *not* signal change when we set this value. We don't want those
    //  observers to trigger early, but instead use the richer notification
    //  they'll receive from the code below.
    targetURI.setResource(targetCollection, TP.request('signalChange', false));

    //  The index that changed.
    changedIndex = insertIndex;

    //  The aspect that changed is just the collection along with the index that
    //  changed.
    changedAspect = fragmentExpr + '[' + changedIndex + ']';

    //  For these paths, the changed addresses are just an Array of the changed
    //  aspect.
    changedAddresses = TP.ac(changedAspect);

    //  Construct a 'changed paths' data structure that observers will expect to
    //  see.
    changedPaths = TP.hc(changedAspect, TP.hc(TP.INSERT, changedAddresses));

    //  We need this purely so that any machinery that relies on signal batching
    //  (i.e. the markup-based data binding) knows that this signal represents
    //  an entire batch.
    batchID = TP.genID('SIGNAL_BATCH');

    TP.signal(this.getID(),
                'TP.sig.StructureInsert',
                TP.hc('action', TP.INSERT,
                        'addresses', changedAddresses,
                        'aspect', changedAspect,
                        'facet', 'value',
                        TP.CHANGE_PATHS, changedPaths,
                        'target', this,
                        'indexes', TP.ac(changedIndex),
                        TP.CHANGE_URIS, null,
                        TP.START_SIGNAL_BATCH, batchID,
                        TP.END_SIGNAL_BATCH, batchID));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JSONContent.Inst.defineMethod('removeRowFromAt',
function(aCollectionURI, aDeleteIndex) {

    /**
     * @method removeRowFromAt
     * @summary Removes a row of data from the collection as defined by the
     *     supplied collection URI. This collection should be either the whole
     *     collection representing the data of the receiver or a subcollection
     *     of that data.
     * @param {TP.uri.URI} aCollectionURI The URI pointing to the collection to
     *     remove the row from.
     * @param {Number} aDeleteIndex The index to remove the item from in the
     *     collection.
     * @returns {TP.core.Content} The receiver.
     */

    var targetCollection,

        deleteIndexes,

        removedData,

        changedAddresses,

        len,
        i,

        changedAspect,
        changedPaths,

        batchID;

    //  If the supplied URI really resolves to an Array, then remove the proper
    //  row.

    //  NB: We assume 'async' of false here.
    if (TP.isArray(
        targetCollection =
            aCollectionURI.getResource(TP.hc('async', false)).get('result'))) {

        //  If a deletion index was supplied or we have numbers in our selection
        //  indexes, then use those as the deletion indexes.
        if (TP.isNumber(deleteIndexes = aDeleteIndex)) {
            deleteIndexes = TP.ac(aDeleteIndex);
        } else if (TP.notEmpty(deleteIndexes = this.get('selectionIndexes'))) {
            //  empty
        } else {
            deleteIndexes = TP.ac(targetCollection.getSize() - 1);
        }

        //  If we have an Array of deletion indexes, use a TIBET convenience
        //  method.
        if (TP.isArray(deleteIndexes)) {
            removedData = targetCollection.atAll(deleteIndexes);
            targetCollection.removeAtAll(deleteIndexes);
        } else {
            removedData = targetCollection.splice(deleteIndexes, 1);
        }

    } else {
        //  Allocate and push 0 separately to avoid oldtime JS behavior around
        //  an Array with a single Number as its argument.
        deleteIndexes = TP.ac();
        deleteIndexes.push(0);
    }

    changedAddresses = TP.ac();

    len = deleteIndexes.getSize();
    for (i = 0; i < len; i++) {
        //  The aspect that changed is just the collection along with the index
        //  that changed.
        changedAspect = aCollectionURI.getFragmentExpr() +
                        '[' + deleteIndexes.at(i) + ']';

        //  For these paths, the changed addresses are just an Array of the
        //  changed aspect.
        changedAddresses.push(changedAspect);
    }

    //  Just set the changed aspect to the first address that changed -
    //  observers can dig into the changedAddresses Array to find out exactly
    //  which aspects changed if more than 1 did.
    changedAspect = changedAddresses.first();

    //  Construct a 'changed paths' data structure that observers will expect to
    //  see.
    changedPaths = TP.hc(changedAspect, TP.hc(TP.DELETE, changedAddresses));

    //  We need this purely so that any machinery that relies on signal batching
    //  (i.e. the markup-based data binding) knows that this signal represents
    //  an entire batch.
    batchID = TP.genID('SIGNAL_BATCH');

    TP.signal(this.getID(),
                'TP.sig.StructureDelete',
                TP.hc('action', TP.DELETE,
                        'addresses', changedAddresses,
                        'aspect', changedAspect,
                        'facet', 'value',
                        TP.CHANGE_PATHS, changedPaths,
                        'target', this,
                        'indexes', deleteIndexes,
                        'removedData', removedData,
                        TP.CHANGE_URIS, null,
                        TP.START_SIGNAL_BATCH, batchID,
                        TP.END_SIGNAL_BATCH, batchID));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JSONContent.Inst.defineMethod('snapshotData',
function() {

    /**
     * @method snapshotData
     * @summary Returns a snapshot of the receiver's underlying data for use by
     *     the transactional data management routines of the receiver.
     * @returns {Object} The snapshot data.
     */

    var data;

    data = TP.js2json(this.getData());
    data = TP.json2js(data);

    return data;
});

//  ========================================================================
//  TP.core.TextContent
//  ========================================================================

/**
 */

//  ------------------------------------------------------------------------

TP.core.Content.defineSubtype('core.TextContent');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.TextContent.Type.defineMethod('canConstruct',
function(data, uri) {

    /**
     * @method canConstruct
     * @summary Returns true if the receiver can construct a valid instance
     *     given the parameters provided.
     * @param {String} data The content data in question.
     * @param {URI} uri The TIBET URI object which loaded the content.
     * @returns {Boolean} Whether or not an instance of this can be constructed
     *     from the parameters provided.
     */

    return TP.isString(data);
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.TextContent.Inst.defineMethod('getContentMIMEType',
function() {

    /**
     * @method getContentMIMEType
     * @summary Returns the receiver's "content MIME type", the MIME type the
     *     content can render most effectively.
     * @returns {String} The content MIME type.
     */

    return TP.PLAIN_TEXT_ENCODED;
});

//  ========================================================================
//  TP.core.XMLContent
//  ========================================================================

/**
 * @type {TP.core.XMLContent}
 * @summary A content handler specific to the TP.core.XMLContent format.
 */

//  ------------------------------------------------------------------------

TP.core.Content.defineSubtype('core.XMLContent');

//  ------------------------------------------------------------------------

TP.definePrimitive('xmlcc',
function(data, aURI) {

    /**
     * @method xmlcc
     * @summary Returns a newly initialized XMLContent instance.
     * @param {Object} data The data to use for this content.
     * @param {TP.uri.URI|String} aURI The source URI.
     * @returns {TP.core.XMLContent} The new instance.
     */

    return TP.core.XMLContent.construct(data, aURI);
});

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.XMLContent.Type.defineMethod('canConstruct',
function(data, uri) {

    /**
     * @method canConstruct
     * @summary Returns true if the receiver can construct a valid instance
     *     given the parameters provided.
     * @param {String} data The content data in question.
     * @param {URI} uri The TIBET URI object which loaded the content.
     * @returns {Boolean} Whether or not an instance of this can be constructed
     *     from the parameters provided.
     */

    return TP.isNode(data) || TP.isXMLString(TP.str(data));
});

//  ------------------------------------------------------------------------

TP.core.XMLContent.Type.defineMethod('validate',
function(anObject, includeFacetChecks) {

    /**
     * @method validate
     * @summary Returns true if the string parameter is valid
     *     TP.core.XMLContent.
     * @param {Object} anObject The object to test.
     * @param {Boolean} [includeFacetChecks=true] Whether or not to include
     *     'facet checks' or just do trivial checking to see if the data is even
     *     in the correct format for this content type.
     * @returns {Boolean} True if the object can be validated.
     */

    var anObj,
        str,

        isNode;

    if (TP.notValid(anObj = anObject.get('data'))) {
        anObj = anObject;
    }

    //  First, check to make sure that it's even valid XML. If it is, then call
    //  next method to check facets, etc.
    str = TP.str(anObj);
    isNode = TP.isNode(TP.node(str));

    if (isNode && TP.notFalse(includeFacetChecks)) {
        return this.callNextMethod();
    }

    return isNode;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.XMLContent.Inst.defineMethod('init',
function(data, aURI) {

    /**
     * @method init
     * @summary Returns a newly constructed Object from inbound content.
     * @param {Object} data The data to use for this content.
     * @param {TP.uri.URI} aURI The source URI.
     * @returns {TP.core.XMLContent} A new instance.
     */

    var contentData;

    contentData = data;

    if (TP.isKindOf(contentData, TP.dom.Node)) {
        contentData = contentData.getNativeNode();
    }

    this.callNextMethod(contentData, aURI);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.XMLContent.Inst.defineHandler('CloneItem',
function(aSignal) {

    /**
     * @method handleCloneItem
     * @summary Handles when an item is to be cloned and inserted into the
     *     receiver's data.
     * @param {TP.sig.CloneItem} aSignal The signal instance which triggered
     *     this handler.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidURI
     * @returns {TP.core.XMLContent} The receiver.
     */

    var scope,
        scopeURI,

        source,

        index,

        targetElem;

    //  The 'scope' should be a URI location to find the overall collection to
    //  insert the item into. It should be either the whole collection
    //  representing the data of the receiver or a subcollection of that data.
    if (TP.isEmpty(scope = aSignal.at('scope'))) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  Make sure we can create a real URI from it.
    if (!TP.isURI(scopeURI = TP.uc(scope))) {
        return this.raise('TP.sig.InvalidURI');
    }

    source = aSignal.at('source');
    if (TP.notEmpty(source)) {
        source = TP.str(source.unquoted());
        source = TP.xpc(source);
    } else {
        source = TP.tpc(TP.str(aSignal.atIfInvalid('source', '[0]')));
    }

    //  Grab the index if one was specified in the signal.
    index = aSignal.at('index');
    if (index === TP.TARGET) {

        //  If the index was 'TP.TARGET', then we're going to use the 'repeat
        //  index' of the target.
        targetElem = aSignal.at('trigger').getTarget();
        if (TP.isElement(targetElem)) {
            index = TP.wrap(targetElem).$getNearestRepeatIndex();
        }
    } else {
        //  Otherwise, if the index is a Number, then we use. If not, then we
        //  set it to null, instructing the insertion method just use the end of
        //  the collection
        index = parseInt(index, 10);
        if (TP.isNaN(index)) {
            index = null;
        }
    }

    //  Go ahead and insert the cloned data.
    this.insertRowIntoAt(
            scopeURI,
            source,
            index,
            aSignal.at('position'),
            true,
            true);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.XMLContent.Inst.defineMethod('insertRowIntoAt',
function(aCollectionURIOrPath, aDataRowOrURIOrPath, anInsertIndex, aPosition,
         shouldClone, shouldEmpty) {

    /**
     * @method insertRowIntoAt
     * @summary Inserts a row of data into the collection as defined by the
     *     supplied collection URI. This collection should be either the whole
     *     collection representing the data of the receiver or a subcollection
     *     of that data.
     * @param {TP.uri.URI|TP.path.AccessPath} aCollectionURIOrPath The URI
     *     pointing to the collection to add the row to or a path that, in
     *     combination with the receiver's 'public facing' URI, can be used to
     *     obtain a collection to add the row to.
     * @param {Array|TP.uri.URI|TP.path.AccessPath} aDataRowOrURIOrPath The URI
     *     or path that points to data or the object itself to insert into the
     *     collection.
     * @param {Number} [anInsertIndex] The index to insert the item at in the
     *     collection. Note that this works with the supplied position to
     *     determine whether the insertion should happen before or after. If not
     *     specified, the item will be inserted at the end of the collection.
     * @param {String} [aPosition=TP.AFTER] A value of TP.BEFORE, TP.AFTER or
     *     null. This determines the position of the insertion. If no position
     *     is supplied, TP.AFTER is assumed.
     * @param {Boolean} [shouldClone=false] Whether or not to clone the data
     *     before inserting it. The default is false.
     * @param {Boolean} [shouldEmpty=false] Whether or not to empty any cloned
     *     data before inserting it. The default is false. NOTE: This parameter
     *     is only used if the shouldClone parameter is true.
     * @returns {TP.core.Content} The receiver.
     */

    var targetURIOrPath,

        targetURI,
        publicURI,

        targetCollection,

        dataRow,

        fragmentExpr,

        queryURI,

        insertIndex,

        insertionNode,

        insertionPath,

        newTPNode,

        changedAddresses,
        changedIndex,
        changedAspect,
        changedPaths,

        batchID;

    //  Obtain a URI that will be pointing at a collection.

    targetURIOrPath = aCollectionURIOrPath;
    publicURI = this.get('$publicURI');

    //  If targetURIOrPath is null or is not a TP.uri.URI (maybe its a
    //  path...), then set targetURI to publicURI (if its real).
    if (!TP.isURI(targetURIOrPath)) {

        //  publicURI isn't real - nothing to do here.
        if (!TP.isURI(publicURI)) {
            //  TODO: Raise exception
            return this;
        }

        targetURI = publicURI;
        if (targetURIOrPath.isAccessPath()) {
            //  NB: We assume 'async' of false here.
            targetCollection =
                targetURI.getResource(
                    TP.hc('async', false)).get('result').get(targetURIOrPath);

            //  Now, make sure that we're dealing with an Array
            if (!TP.isArray(targetCollection)) {
                targetCollection = TP.ac(targetCollection);
            }

            fragmentExpr = targetURIOrPath.asString();

        } else {
            //  Not a real path either.
            //  TODO: Raise exception
            return this;
        }

    } else {

        //  A URI was supplied to begin with.
        targetURI = targetURIOrPath;

        //  We should make sure that at least the primary URIs of the supplied
        //  URI and our source content URI are the same.
        if (targetURI.getPrimaryURI() !== publicURI.getPrimaryURI()) {
            //  TODO: Raise exception
            return this;
        }

        //  Make sure that we have a TP.dom.CollectionNode

        //  NB: We assume 'async' of false here.
        targetCollection = targetURI.getResource(
                            TP.hc('resultType', TP.WRAP,
                                    'async', false,
                                    'shouldCollapse', false)).get('result');

        if (!TP.isArray(targetCollection)) {
            targetCollection = TP.ac(targetCollection);
        }

        fragmentExpr = targetURI.getFragmentExpr();
    }

    if (TP.isURI(aDataRowOrURIOrPath)) {
        //  NB: We assume 'async' of false here.
        dataRow = aDataRowOrURIOrPath.getResource(
                                TP.hc('async', false)).get('result');

    } else if (aDataRowOrURIOrPath.isAccessPath()) {

        queryURI = aCollectionURIOrPath;

        if (!TP.isURI(queryURI)) {

            queryURI = publicURI;

            //  Neither aCollectionURIOrPath or publicURI isn't real - nothing
            //  to do here.
            if (!TP.isURI(queryURI)) {
                //  TODO: Raise exception
                return this;
            }
        }

        //  NB: We assume 'async' of false here.
        dataRow =
            queryURI.getResource(
                TP.hc('async', false)).get('result').get(aDataRowOrURIOrPath);

    } else {
        dataRow = aDataRowOrURIOrPath;
    }

    if (TP.isTrue(shouldClone)) {

        //  Get the item to clone and clone it.
        dataRow = dataRow.clone(true);

        if (TP.isTrue(shouldEmpty)) {
            //  Clear out all of the 'text content' - that is, all of the scalar
            //  values in the newly cloned item. This will descend through the
            //  new item's data structure and cleanse it all of previous values.
            dataRow.clearTextContent();
        }
    }

    //  NB: The insertion index is computed to represent the row that will come
    //  *after* the new row after the insertion operation is complete (per
    //  'insertBefore()' semantics).

    if (TP.isNumber(insertIndex = anInsertIndex)) {

        if (aPosition !== TP.BEFORE) {
            insertIndex++;
        }

        insertionPath = './*[' + insertIndex + ']';

    } else {

        //  No index specified - we will be manipulating the end of the
        //  collection.
        if (aPosition === TP.BEFORE) {
            insertionPath = './*[last()]';
            insertIndex = targetCollection.getSize();
        } else {
            //  Add one because the collection size isn't taking our new size
            //  into account.
            insertIndex = targetCollection.getSize() + 1;
        }
    }

    insertionNode = targetCollection.first().getParentNode();

    //  If the insertion path is not empty, that means that we're not just
    //  appending to the end.
    if (TP.notEmpty(insertionPath)) {
        newTPNode = insertionNode.insertRawContent(
                            dataRow, insertionPath, null, false);
    } else {
        //  We're just appending to the end.
        newTPNode = insertionNode.addRawContent(
                            dataRow, null, false);
    }

    //  Grab the address of the node that changed.
    changedAddresses = TP.ac(newTPNode.getDocumentPosition());

    //  And the index that changed.
    changedIndex = insertIndex;

    //  The aspect that changed is just the collection along with the
    //  index that changed.
    changedAspect = fragmentExpr + '[' + changedIndex + ']';

    //  Construct a 'changed paths' data structure that observers will expect to
    //  see.
    changedPaths = TP.hc(changedAspect, TP.hc(TP.INSERT, changedAddresses));

    //  We need this purely so that any machinery that relies on signal batching
    //  (i.e. the markup-based data binding) knows that this signal represents
    //  an entire batch.
    batchID = TP.genID('SIGNAL_BATCH');

    TP.signal(this.getID(),
                'TP.sig.StructureInsert',
                TP.hc('action', TP.INSERT,
                        'addresses', changedAddresses,
                        'aspect', changedAspect,
                        'facet', 'value',
                        TP.CHANGE_PATHS, changedPaths,
                        'target', this,
                        'indexes', TP.ac(changedIndex),
                        TP.CHANGE_URIS, null,
                        TP.START_SIGNAL_BATCH, batchID,
                        TP.END_SIGNAL_BATCH, batchID));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.XMLContent.Inst.defineMethod('getContentMIMEType',
function() {

    /**
     * @method getContentMIMEType
     * @summary Returns the receiver's "content MIME type", the MIME type the
     *     content can render most effectively.
     * @returns {String} The content MIME type.
     */

    return TP.XML_ENCODED;
});

//  ------------------------------------------------------------------------

TP.core.XMLContent.Inst.defineMethod('getData',
function() {

    /**
     * @method getData
     * @summary Returns the underlying data object.
     * @returns {Object|undefined} The receiver's underlying data object.
     */

    var xmlData,

        uri,

        newData,

        defaultNS,
        mimeType,
        nsEntry;

    xmlData = this.callNextMethod();

    uri = this.get('sourceURI');

    newData = false;

    if (TP.isString(xmlData) && TP.notEmpty(xmlData)) {

        defaultNS = null;

        //  Try to determine a default namespace based on the extension of the
        //  URI.
        if (TP.notEmpty(uri)) {

            //  Guess the MIME type based on the data and the URI
            mimeType = TP.ietf.mime.guessMIMEType(xmlData, uri);

            //  Try to get a 'namespace entry' from that. The namespace URI can
            //  be found under 'uri'.
            nsEntry = TP.w3.Xmlns.fromMIMEType(mimeType);
            if (TP.isValid(nsEntry)) {
                defaultNS = nsEntry.at('uri');
            }
        }

        //  TP.tpdoc() will raise for us if we supply 'true' as the 3rd
        //  parameter.
        xmlData = TP.tpdoc(xmlData, defaultNS, true);

        if (TP.notValid(xmlData)) {
            return;
        }

        newData = true;
    } else if (TP.isNode(xmlData)) {
        xmlData = TP.wrap(xmlData);
        newData = true;
    }

    if (newData) {
        //  If we have a valid URI, set the underlying XML wrapper node's 'uri'
        //  property and trigger it to add 'tibet:src' and 'xml:base'. NB: This
        //  *MUST* be done *before* we call set('data', ...) below, otherwise
        //  the underlying XML will end up with bad global IDs.
        if (TP.notEmpty(uri)) {
            xmlData.$set('uri', uri, false);
            xmlData.addTIBETSrc(uri);
            xmlData.addXMLBase(uri);
        }

        this.set('data', xmlData, false);
    }

    return xmlData;
});

//  ------------------------------------------------------------------------

TP.core.XMLContent.Inst.defineMethod('getNativeNode',
function() {

    /**
     * @method getNativeNode
     * @summary Returns the native node of the underlying data object.
     * @returns {Object} The receiver's underlying data object's native node.
     */

    var xmlData;

    xmlData = this.get('data');

    if (TP.isKindOf(xmlData, TP.dom.Node)) {
        xmlData = xmlData.getNativeNode();
    }

    return xmlData;
});

//  ------------------------------------------------------------------------

TP.core.XMLContent.Inst.defineMethod('removeRowFromAt',
function(aCollectionURI, aDeleteIndex) {

    /**
     * @method removeRowFromAt
     * @summary Removes a row of data from the collection as defined by the
     *     supplied collection URI. This collection should be either the whole
     *     collection representing the data of the receiver or a subcollection
     *     of that data.
     * @param {TP.uri.URI} aCollectionURI The URI pointing to the collection to
     *     remove the row from.
     * @param {Number} aDeleteIndex The index to remove the item from in the
     *     collection.
     * @exception TP.sig.InvalidNode
     * @returns {TP.core.Content} The receiver.
     */

    var targetCollection,

        preDeleteSize,

        deleteIndexes,
        deletionPath,

        itemParent,

        i,

        path,

        removedData,

        changedAddresses,
        changedIndex,
        changedAspect,
        changedPaths,

        batchID;

    //  Make sure that we have a TP.dom.CollectionNode

    //  NB: We assume 'async' of false here.
    targetCollection = aCollectionURI.getResource(
                    TP.hc('resultType', TP.WRAP, 'async', false)).get('result');

    if (!TP.isArray(targetCollection)) {
        targetCollection = TP.ac(targetCollection);
    }

    preDeleteSize = targetCollection.getSize();

    //  Compute an XPath to do the deletion.

    //  If a deletion index was supplied or we have numbers in our selection
    //  indexes, then use those as the deletion indexes.
    if (TP.isNumber(deleteIndexes = aDeleteIndex)) {

        deletionPath = './*[' + aDeleteIndex + ']';

        deleteIndexes = TP.ac(aDeleteIndex);
    } else if (TP.notEmpty(deleteIndexes = this.get('selectionIndexes'))) {

        deletionPath = './*[';

        for (i = 0; i < deleteIndexes.getSize(); i++) {
            deletionPath += 'position = ' + deleteIndexes.at(i) + ' or ';
        }

        deletionPath = deletionPath.slice(0, -4) + ']';
    } else {

        //  Otherwise, just delete the last item.
        deletionPath = './*[last()]';

        //  Allocate and push a Number representing the end of the collection
        //  separately to avoid oldtime JS behavior around an Array with a
        //  single Number as its argument.
        deleteIndexes = TP.ac();

        //  Don't substract 1 due XPath 1-based-ness
        deleteIndexes.push(preDeleteSize);
    }

    itemParent = TP.wrap(targetCollection.first()).getParentNode();

    //  Create an XPathPath object from the computed path and execute a delete.
    //  Note here how we supply 'false' as to whether we want the path machinery
    //  to signal a change. We'll do that here.
    path = TP.xpc(deletionPath);
    removedData = path.exec(itemParent, false);

    changedAddresses = path.execRemove(itemParent, false);

    //  And the first index that changed.
    changedIndex = deleteIndexes.first();

    //  The aspect that changed is just the collection along with the
    //  index that changed.
    changedAspect = aCollectionURI.getFragmentExpr() + '[' + changedIndex + ']';

    //  Construct a 'changed paths' data structure that observers will expect to
    //  see.
    changedPaths = TP.hc(changedAspect, TP.hc(TP.DELETE, changedAddresses));

    //  We need this purely so that any machinery that relies on signal batching
    //  (i.e. the markup-based data binding) knows that this signal represents
    //  an entire batch.
    batchID = TP.genID('SIGNAL_BATCH');

    TP.signal(this.getID(),
                'TP.sig.StructureDelete',
                TP.hc('action', TP.DELETE,
                        'addresses', changedAddresses,
                        'aspect', changedAspect,
                        'facet', 'value',
                        TP.CHANGE_PATHS, changedPaths,
                        'target', this,
                        'indexes', deleteIndexes,
                        'removedData', removedData,
                        TP.CHANGE_URIS, null,
                        TP.START_SIGNAL_BATCH, batchID,
                        TP.END_SIGNAL_BATCH, batchID));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.XMLContent.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Returns an XML string representation of the receiver.
     * @returns {String} An XML-formatted string.
     */

    //  Callers will be interested in our data, not the 'data' structure
    //  itself.
    return TP.str(this.get('data'));
});

//  ------------------------------------------------------------------------

TP.core.XMLContent.Inst.defineMethod('asHTTPValue',
function() {

    /**
     * @method asHTTPValue
     * @summary Returns the best value to be used for the receiver to send via
     *     HTTP.
     * @returns {Node} The best value for HTTP sending.
     */

    return this.getNativeNode();
});

//  ------------------------------------------------------------------------

TP.core.XMLContent.Inst.defineMethod('asString',
function() {

    /**
     * @method asString
     * @summary Returns the common string representation of the receiver.
     * @returns {String} The content object in string form.
     */

    return this.asXMLString();
});

//  ------------------------------------------------------------------------

TP.core.XMLContent.Inst.defineMethod('asCleanString',
function(storageInfo) {

    /**
     * @method asCleanString
     * @summary Returns the 'clean' string representation of the receiver.
     *     This may have transformations in it to 'clean' the String, such as
     *     removing unnecessary namespace definitions, etc.
     * @param {TP.core.Hash} [storageInfo] A hash containing various flags for
     *     and results of the serialization process. Notable keys include:
     *          'wantsXMLDeclaration': Whether or not the receiver's document
     *          node should include an 'XML declaration' at the start of its
     *          serialization. The default is false.
     *          'wantsPrefixedXMLNSAttrs': Whether or not the receiver and its
     *          decendant elements should generate prefixed (i.e. 'xmlns:foo')
     *          attributes to support their proper serialization. The default is
     *          true.
     * @returns {String} The content object in clean string form.
     */

    var serializationStorage,

        data,

        uri,
        loc,

        str;

    if (TP.isHash(storageInfo)) {
        serializationStorage = TP.copy(storageInfo);
    } else {
        serializationStorage = TP.hc();
    }

    data = this.get('data');

    uri = this.get('sourceURI');
    loc = uri.getLocation();

    //  Set a location for the 'store' based on our URI location. This is the
    //  'top-level' store in the serialization mechanism, so it should be
    //  representative of the 'whole document'.
    serializationStorage.atPut('store', loc);

    //  Message the TP.dom.Document to begin the serialization.
    data.serializeForStorage(serializationStorage);

    //  The representation we're interested in will be the one at our URI, since
    //  we're interested in the 'whole document'.
    str = serializationStorage.at('stores').at(loc);

    return str;
});

//  ------------------------------------------------------------------------

TP.core.XMLContent.Inst.defineMethod('snapshotData',
function() {

    /**
     * @method snapshotData
     * @summary Returns a snapshot of the receiver's underlying data for use by
     *     the transactional data management routines of the receiver.
     * @returns {Object} The snapshot data.
     */

    var data;

    data = this.getNativeNode();
    data = TP.nodeCloneNode(data, true, true);

    return TP.wrap(data);
});

//  ------------------------------------------------------------------------

TP.core.XMLContent.Inst.defineMethod('transform',
function(anObject, aParamHash) {

    /**
     * @method transform
     * @summary Transforms the supplied Node (or TP.dom.Node) by using the
     *     content of the receiver.
     * @param {Object} anObject The object supplying the data to use in the
     *     transformation.
     * @param {TP.core.Hash|TP.sig.Request} aParamHash A parameter container
     *     responding to at(). For string transformations a key of 'repeat' with
     *     a value of true will cause iteration to occur (if anObject is an
     *     'ordered collection' this flag needs to be set to 'true' in order to
     *     have 'automatic' iteration occur). Additional keys of '$STARTINDEX'
     *     and '$REPEATCOUNT' determine the range of the iteration. A special
     *     key of 'xmlns:fixup' should be set to true to fix up 'xmlns'
     *     attributes such that they won't be lost during the transformation.
     * @returns {String} The string resulting from the transformation process.
     */

    var xmlData;

    xmlData = this.get('data');

    if (TP.isKindOf(xmlData, TP.dom.Node)) {
        return xmlData.transform(anObject, aParamHash);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.core.XMLContent.Inst.defineMethod('setNativeNode',
function(aNode, shouldSignal) {

    /**
     * @method setNativeNode
     * @summary Sets the receiver's native DOM node object.
     * @param {Node} aNode The node to wrap.
     * @param {Boolean} shouldSignal If false this operation will not trigger a
     *     change notification. This defaults to the return value of sending
     *     shouldSignalChange() to the receiver.
     * @exception TP.sig.InvalidNode
     * @returns {TP.core.XMLContent} The receiver.
     */

    var oldNode,

        nodes,
        ndx,

        flag;

    if (!TP.isNode(aNode)) {
        return this.raise('TP.sig.InvalidNode', aNode);
    }

    //  Notice here how we use the 'fast' native node get method to avoid any
    //  sorts of recursion issues.
    oldNode = this.getNativeNode();

    //  what we do here varies by whether we're checkpointing or not...
    if (TP.isArray(nodes = this.get('snaps'))) {
        ndx = this.get('currentIndex');
        if (TP.isValid(ndx)) {
            //  working in the middle of the list, have to truncate
            nodes.length = ndx;
            nodes.add(aNode);

            //  clear the index since we're basically defining the end of
            //  the list now
            this.$set('currentIndex', null, false);
        } else {
            nodes.atPut(nodes.getSize() - 1, aNode);
        }
    } else {
        this.get('data').$set('node', aNode, false);
    }

    //  NB: Use this construct this way for better performance
    if (TP.notValid(flag = shouldSignal)) {
        flag = this.shouldSignalChange();
    }

    if (flag) {
        this.$changed('content', TP.UPDATE,
                        TP.hc(TP.OLDVAL, oldNode, TP.NEWVAL, aNode));
    }

    return this;
});

//  ========================================================================
//  TP.path.AccessPath
//  ========================================================================

/**
 * @type {TP.path.AccessPath}
 * @summary A common supertype for access paths, which can get used in TIBET
 *     get() and set() calls to provide sophisticated data access. Common
 *     subtypes include types to access TIBETan JS objects, 'plain' JSON data
 *     objects and XML data objects.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('path.AccessPath');

//  This is an abstract supertype - need a concrete subtype to get real work
//  done.
TP.path.AccessPath.isAbstract(true);

//  ------------------------------------------------------------------------

TP.definePrimitive('apc',
function(aPath, config) {

    /**
     * @method apc
     * @summary Returns a newly initialized access path instance.
     * @param {String} aPath The path as a String.
     * @param {TP.core.Hash} config The configuration for this path.
     * @returns {TP.path.AccessPath} The new instance.
     */

    return TP.path.AccessPath.construct(aPath, config);
});

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.path.AccessPath.Type.defineAttribute('$observedAddresses');

TP.path.AccessPath.Type.defineAttribute('$executedPaths');

TP.path.AccessPath.Type.defineAttribute('$changedAddresses');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.path.AccessPath.Type.defineMethod('construct',
function(aPath, config) {

    /**
     * @method construct
     * @summary Returns a new instance of an access path or aPath if it is
     *     already a path.
     * @param {String} aPath The String to build the instance from.
     * @param {TP.core.Hash} config The configuration for this path.
     * @returns {TP.path.AccessPath} A new instance or aPath if it's already a
     *     path.
     */

    if (aPath.isAccessPath()) {
        return aPath;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Type.defineMethod('getConcreteType',
function(aPath) {

    /**
     * @method getConcreteType
     * @summary Returns the type to use for a particular access path.
     * @param {String} aPath A path string from which the subtype will be
     *     determined.
     * @returns {TP.meta.path.AccessPath} A TP.path.AccessPath subtype type
     *     object.
     */

    var path;

    //  Need at least a path to test.
    if (TP.isEmpty(path = aPath)) {
        return TP.raise(this, 'TP.sig.InvalidPath',
                        'Unable to create an path from empty spec.');
    }

    //  If the path is a composite path, then create one and let it handle
    //  creation of its subpaths.
    if (TP.regex.COMPOSITE_PATH.test(aPath)) {
        return TP.path.CompositePath;
    }

    //  If the path is just '.', then that's the shortcut to just return the
    //  target object itself.
    if (TP.regex.ONLY_PERIOD.test(aPath)) {
        return TP.path.SimpleTIBETPath;
    }

    //  Note that we only allow numeric ACP expressions in paths
    if (TP.regex.HAS_ACP.test(path)) {

        //  Strip out any numeric expressions and recheck
        TP.regex.ACP_NUMERIC.lastIndex = 0;
        path = path.replace(TP.regex.ACP_NUMERIC, TP.DEFAULT);

        //  If it still has ACP expressions, then it's an invalid path
        if (TP.regex.HAS_ACP.test(path)) {
            return this.raise('TP.sig.InvalidPath');
        }

        //  Now, so as to not change the overall meaning of the path, go back
        //  to the original path and substitute '0's - remember that we're only
        //  doing path type detection here, so we're not changing the meaning
        //  of the path.
        TP.regex.ACP_NUMERIC.lastIndex = 0;
        path = aPath.replace(TP.regex.ACP_NUMERIC, '0');
    }

    //  If we're handed a '#jpath(...)' pointer, then we know what kind of
    //  path it is (or should be, anyway)
    if (TP.regex.JSON_POINTER.test(path)) {
        return TP.path.JSONPath;
    }

    //  If we're handed a '#tibet(...)' pointer, then we know what kind of
    //  path it is (or should be, anyway)
    if (TP.regex.TIBET_POINTER.test(path)) {

        path = TP.regex.TIBET_POINTER.match(path);

        if (TP.regex.COMPOSITE_PATH.test(path.at(1))) {
            return TP.path.CompositePath;
        } else if (TP.regex.TIBET_PATH.test(path.at(1))) {
            //  Otherwise, if it just has 'TIBETan' access path characters,
            //  create a 'complex' TIBET path to deal with it.
            return TP.path.ComplexTIBETPath;
        } else {
            //  Otherwise, it's just a simple path
            return TP.path.SimpleTIBETPath;
        }
    }

    //  Barename (i.e. ID) paths
    if (TP.regex.BARENAME.test(path)) {
        return TP.path.BarenamePath;
    }

    //  It could be some kind of XPointer - either xpointer(), xpath1() or
    //  element() scheme
    if (TP.regex.XPOINTER.test(path)) {

        //  If we're handed an '#element(...)' pointer, then we know what kind
        //  of path it is (or should be, anyway)

        //  NB: We do *not* check against TP.regex.ELEMENT_PATH here, since it
        //  matches all IDs ("#"), attributes ("@"), etc.
        if (TP.regex.ELEMENT_POINTER.test(path)) {
            return TP.path.ElementPath;
        } else {
            return TP.path.XPathPath;
        }
    }

    //  If we're handed an '#css(...)' or other kind of 'xtension' pointer,
    //  then we know what kind of path it is (or should be, anyway)
    if (TP.regex.XTENSION_POINTER.test(path)) {
        return TP.path.XTensionPath;
    }

    //  attribute paths
    if (TP.regex.ATTRIBUTE.test(path)) {
        return TP.path.SimpleXMLPath;
    }

    //  Other kinds of XML paths
    if (TP.regex.XPATH_PATH.test(path) ||
        TP.regex.HAS_SLASH.test(path)) {
        return TP.path.XPathPath;
    }

    //  JSON Paths
    if (TP.regex.JSON_PATH.test(path)) {
        return TP.path.JSONPath;
    }

    //  If there is no 'path punctuation' (only JS identifer characters), or
    //  it's a simple numeric path like '2' or '[2]', that means it's a 'simple
    //  path'.
    //  TODO: This is hacky - figure out how to combine them into one RegExp.
    if (TP.regex.JS_IDENTIFIER.test(path) ||
        TP.regex.ONLY_NUM.test(path) ||
        TP.regex.SIMPLE_NUMERIC_PATH.test(path)) {
        return TP.path.SimpleTIBETPath;
    }

    //  Otherwise, if it has 'TIBETan' access path characters, create a TIBET
    //  path to deal with it.
    if (TP.regex.TIBET_PATH.test(path)) {
        return TP.path.ComplexTIBETPath;
    }

    return TP.path.CSSPath;
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Type.defineMethod('$getExecutedPaths',
function() {

    /**
     * @method $getExecutedPaths
     * @summary Returns the hash to use to register executed paths. This
     *     method is supplied to avoid problems with this hash not being
     *     initialized when TIBET is starting up.
     * @returns {TP.core.Hash} The executed paths hash.
     */

    var theHash;

    if (TP.notValid(theHash = this.$get('$executedPaths'))) {
        theHash = TP.hc();
        this.set('$executedPaths', theHash);
    }

    return theHash;
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Type.defineMethod('$getChangedAddresses',
function() {

    /**
     * @method $getChangedAddresses
     * @summary Returns the Array to use to register changed addresses. This
     *     method is supplied to avoid problems with this hash not being
     *     initialized when TIBET is starting up.
     * @returns {String[]} The changed addresses array.
     */

    var theArray;

    if (TP.notValid(theArray = this.$get('$changedAddresses'))) {
        theArray = TP.ac();
        this.set('$changedAddresses', theArray);
    }

    return theArray;
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Type.defineMethod('$getObservedAddresses',
function() {

    /**
     * @method $getObservedAddresses
     * @summary Returns the hash to use to register observed addresses. This
     *     method is supplied to avoid problems with this hash not being
     *     initialized when TIBET is starting up.
     * @returns {TP.core.Hash} The observed addresses hash.
     */

    var theHash;

    if (TP.notValid(theHash = this.$get('$observedAddresses'))) {
        theHash = TP.hc();
        this.set('$observedAddresses', theHash);
    }

    return theHash;
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Type.defineMethod('registerChangedAddress',
function(anAddress, anAction) {

    /**
     * @method registerChangedAddress
     * @summary Registers a 'data address' (i.e. a unique location in the
     *     source object that is currently being processed by the receiver) as
     *     a 'changed' address (i.e. a location where the data has been
     *     changed).
     * @param {String} anAddress The data address where the data change took
     *     place.
     * @param {String} anAction The 'action' that was taken by the 'set'
     *     machinery. This should be one of:
     *          TP.CREATE
     *          TP.UPDATE
     *          TP.DELETE
     * @returns {Object} The receiver.
     */

    TP.path.AccessPath.$getChangedAddresses().push(
        TP.hc('address', anAddress, 'action', anAction));

    return this;
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Type.defineMethod('registerObservedAddress',
function(anAddress, sourceObjectID, interestedPath) {

    /**
     * @method registerObservedAddress
     * @summary Registers a 'data address' (i.e. a unique location in the
     *     source object that is currently being processed by the receiver) as
     *     an 'observed' address (i.e. a location where the data has been
     *     retrieved and observers might be interested in changes there).
     * @param {String} anAddress The data address where the data retrieval took
     *     place.
     * @param {String} sourceObjectID The unique ID of the source object.
     * @param {String} interestedPath The String representation of the path
     *     that is interested in changes at the supplied address.
     * @returns {Object} The receiver.
     */

    var addressMap,

        sources,
        paths;

    //  Build a map that looks like this:
    //  {
    //      <sourceObjID>  :    {
    //                              <address>   :   [pathStr1, pathStr2, ...]
    //                          }
    //  }

    //  All observed addresses in the system
    addressMap = TP.path.AccessPath.$getObservedAddresses();

    //  Observed addresses are only interesting in the combination between the
    //  path *and* the data object it was executed against.

    sources = addressMap.atPutIfAbsent(sourceObjectID, TP.hc());

    paths = sources.atPutIfAbsent(anAddress, TP.ac());
    paths.add(interestedPath);

    //  Make sure to unique the paths so that we don't have more than one
    //  occurrence of the same path for a particular address.
    paths.unique();

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The path's internal path
TP.path.AccessPath.Inst.defineAttribute('srcPath');

//  Whether or not to make data structures on execution
TP.path.AccessPath.Inst.defineAttribute('shouldMakeStructures');

//  How to make data structures on execution (if we are making them)
TP.path.AccessPath.Inst.defineAttribute('packageWith');

//  Whether or not to collapse results into a single value
TP.path.AccessPath.Inst.defineAttribute('shouldCollapse');

//  How to extract a 'final value'
TP.path.AccessPath.Inst.defineAttribute('extractWith');

//  If a 'not valid' value is found, this Function can create values
TP.path.AccessPath.Inst.defineAttribute('fallbackWith');

//  Paths that would have been invalidated due to structural mutations
TP.path.AccessPath.Inst.defineAttribute('$invalidatedPaths');

//  Addresses to remove due to structural mutations
TP.path.AccessPath.Inst.defineAttribute('$addressesToRemove');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.path.AccessPath.Inst.defineMethod('init',
function(aPath, config) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {String} aPath The String to build the instance from.
     * @param {TP.core.Hash} config The configuration for this path.
     * @returns {TP.path.AccessPath} The receiver.
     */

    this.callNextMethod();

    this.set('srcPath', aPath);

    if (TP.isHash(config)) {
        this.set('shouldMakeStructures',
                    config.atIfInvalid('shouldMakeStructures', false));
        this.set('packageWith', config.atIfInvalid('packageWith', null));
        this.set('shouldCollapse', config.atIfInvalid('shouldCollapse', false));
        this.set('extractWith', config.atIfInvalid('extractWith', null));
        this.set('fallbackWith', config.atIfInvalid('fallbackWith', null));
    } else {
        this.set('shouldMakeStructures', false);
        this.set('shouldCollapse', false);
    }

    this.set('$invalidatedPaths', TP.ac());
    this.set('$addressesToRemove', TP.ac());

    return this;
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Inst.defineMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    var str,
        val;

    str = TP.tname(this) + '.construct(\'' + this.get('srcPath') +
           '\')';

    if ((val = this.get('shouldMakeStructures')) === true) {
        str += '.set(\'shouldMakeStructures\', ' + val + ')';
    }

    if ((val = this.get('shouldCollapse')) === true) {
        str += '.set(\'shouldCollapse\', ' + val + ')';
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Inst.defineMethod('asDumpString',
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var path,
        repStr,
        str;

    str = '[' + TP.tname(this) + ' :: ';

    path = this.$get('srcPath');

    repStr = TP.isEmpty(path) ? this.toString() : this.asString();

    str += '(' + repStr + ')' + ']';

    return str;
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    return '<span class="TP_path_AccessPath ' +
                    TP.escapeTypeName(TP.tname(this)) + '">' +
                this.asString() +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var str;

    try {
        str = '{"type":' + TP.tname(this).quoted('"') + ',' +
                '"data":' + this.$get('srcPath').asString().quoted('"') + '}';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    return '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) + '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' +
                        this.getTypeName() +
                    '</dd>' +
                    '<dt class="pretty key">Path:</dt>' +
                    '<dd class="pretty value">' +
                        this.asString() +
                    '</dd>' +
                    '</dl>';
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Inst.defineMethod('asString',
function() {

    /**
     * @method asString
     * @summary Returns the String representation of the receiver.
     * @returns {String} The String representation of the receiver.
     */

    return this.get('srcPath');
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    return '<instance type="' + TP.tname(this) + '"' +
                    ' path="' + this.asString() + '"/>';
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Inst.defineMethod('isAccessPath',
function() {

    /**
     * @method isAccessPath
     * @summary Returns whether or not the receiver is an access path object.
     * @returns {Boolean} True - the receiver is an access path.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Inst.defineMethod('isEmpty',
function() {

    /**
     * @method isEmpty
     * @summary Returns whether or not the receiver is an 'empty object',
     *     according to a collection API. This type returns false.
     * @returns {Boolean} Whether or not the receiver is empty. Always false
     *     for this type.
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Inst.defineMethod('executeGet',
function(targetObj, varargs) {

    /**
     * @method executeGet
     * @summary Returns the result of executing the path in a 'get' fashion -
     *     i.e. with the intent of retrieving data from the supplied target
     *     object.
     * @param {Object} targetObj The object to execute the receiver against
     *     to get data.
     * @param {arguments} varargs The arguments to execute the get with. The
     *     first argument should be the object to execute the receiver against
     *     to retrieve data. Any remaining arguments will be used as values for
     *     a templated substitution in the path itself.
     * @returns {Object} The result of executing a 'get' against the target
     *     object using the receiver.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Inst.defineMethod('executeSet',
function(targetObj, attributeValue, shouldSignal, varargs) {

    /**
     * @method executeSet
     * @summary Executes the path in a 'set' fashion - i.e. with the intent of
     *     setting the supplied data into the supplied target object.
     * @param {Object} targetObj The object to execute the receiver against to
     *     set data.
     * @param {Object} attributeValue The object to use as the value to set
     *     into the target object.
     * @param {Boolean} shouldSignal If false, no signaling occurs. Defaults to
     *     targetObj.shouldSignalChange().
     * @param {arguments} varargs Any remaining arguments will be used as values
     *     for a templated substitution in the path itself.
     * @returns {Object} The result of executing a 'set' against the target
     *     object using the receiver.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Inst.defineMethod('getFirstSimplePath',
function() {

    /**
     * @method getFirstSimplePath
     * @summary Returns the first 'simple path' of the receiver. For instance,
     *     in a simple path such as '1.2.3', this method will return '1'.
     * @returns {String} The first simple path of the receiver.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Inst.defineMethod('getPathParts',
function() {

    /**
     * @method getPathParts
     * @summary Returns the receiver's parts.
     * @returns {String[]} An Array of the receiver's parts.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Inst.defineMethod('getPathType',
function() {

    /**
     * @method getPathType
     * @summary Returns the receiver's 'path type'.
     * @returns {String} A path type
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Inst.defineMethod('getPointerScheme',
function() {

    /**
     * @method getPointerScheme
     * @summary Returns the receiver's 'pointer scheme'.
     * @returns {String} An XPointer scheme depending on path type.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Inst.defineMethod('getLastChangedPathsInfo',
function(targetObj, filterOutSignalSupertypes) {

    /**
     * @method getLastChangedPathsInfo
     * @summary Retrieves a set of 'path info records' that contain data about
     *     the last changed paths, data addresses and signal types that got
     *     computed the last time the receiving path was executed.
     * @param {Object} targetObj The object to use to retrieve the 'last changed
     *     paths' for.
     * @param {Boolean} [filterOutSignalSupertypes=true] Whether or not to
     *     filter out records where a signal subtype is already present in
     *     another record in the result set (and, therefore, the signal
     *     supertype will be signaled anyway, assuming INHERITANCE_FIRING). The
     *     default is true.
     * @returns {TP.core.Hash[]} An Array of 'path info records' that could
     *     contain a signal name, a 'signal description' record, a signal policy
     *     and a signal type.
     */

    var target,

        allAddresses,

        observedAddresses,

        executedPaths,

        changedAddresses,
        changedPaths,

        signalNameForAction,

        infos,

        pathKeys,
        keysLen,
        i,

        pathAspectAliases,
        j,

        pathEntry,
        actions,
        description,

        actionsLen,

        pathAction,
        pathAddresses,

        sigName,

        aliasesLen,
        k,
        aspectName,
        aspectSigName,

        filteredInfos,

        leni,
        lenj,

        iAspect,
        iSigType,

        shouldAdd,

        jAspect,
        jSigType;

    //  TODO: This logic is very similar to sendChangedSignal() (and, in fact,
    //  was derived from there). Refactor that method to use the data from this
    //  one.

    //  '$observedAddresses' is a map that looks like this:
    //  {
    //      <sourceObjID>  :    {
    //                              <address>   :   [path1, path2, ...]
    //                          }
    //  }

    target = targetObj;
    if (TP.isKindOf(target, TP.core.Content)) {
        target = target.$get('data');
    }

    allAddresses = TP.path.AccessPath.$getObservedAddresses();

    observedAddresses = allAddresses.at(TP.id(target));

    //  If we couldn't find any 'observed' addresses for the target object,
    //  then we should try to compute them - at least for this path. This is
    //  normally done by doing a 'get'.

    if (TP.isEmpty(observedAddresses)) {
        this.executeGet(target);

        observedAddresses = allAddresses.at(TP.id(target));

        //  If we still can't find any, then we just exit
        if (TP.isEmpty(observedAddresses)) {
            return TP.ac();
        }
    } else {

        //  Make sure that this path is registered in 'executed paths' - to
        //  make sure that at least observers of this path will be notified.
        executedPaths = TP.path.AccessPath.$getExecutedPaths().at(
                            TP.id(target));

       //  If we can't find any executed paths for the source, or not one for
       //  this path, then execute a get - this will register this path in both
       //  'executed paths' and, more importantly, will register any addresses
       //  that this path references in the data object
        if (TP.notValid(executedPaths) ||
            TP.notValid(executedPaths.at(this.get('srcPath')))) {
            this.executeGet(target);
        }
    }

    //  Grab all of the data addresses that changed. We'll iterate over this,
    //  comparing with the 'observed' addresses and then collect the paths that
    //  did those observations.

    changedAddresses = TP.path.AccessPath.$getChangedAddresses();

    //  Generate a data structure with a data path as its key and
    //  action/addresses as the value:
    //
    //  {
    //      <path1>  :  {
    //                      <action>   :   [address1, address2, ...]
    //                  }
    //  }

    changedPaths = TP.hc();

    observedAddresses.perform(
        function(addressPair) {
            var observedAddress,
                interestedPaths,

                l,
                record,

                m,

                action,
                thePath,

                addressesEntry,
                actionEntry;

            observedAddress = addressPair.first();

            //  Note that this is an Array of paths
            interestedPaths = addressPair.last();

            for (l = 0; l < changedAddresses.getSize(); l++) {

                record = changedAddresses.at(l);

                //  We found an address match between changed and observed
                //  addresses. Add the paths from the observed address and
                //  the action from the changed address into the Array of
                //  'changed paths'.

                if (record.at('address') === observedAddress) {
                    action = record.at('action');

                    //  Loop over all of the interested paths
                    for (m = 0; m < interestedPaths.getSize(); m++) {
                        thePath = interestedPaths.at(m);

                        //  If there isn't an action/addresses entry for the
                        //  path, create one.
                        if (TP.notValid(actionEntry =
                                        changedPaths.at(thePath))) {

                            addressesEntry = TP.ac();
                            actionEntry = TP.hc(action, addressesEntry);

                            changedPaths.atPut(thePath, actionEntry);
                        } else {
                            //  Otherwise, if there was an entry for the path,
                            //  but not for the action, create one.
                            if (TP.notValid(addressesEntry =
                                            actionEntry.at(action))) {

                                addressesEntry = TP.ac();
                                actionEntry.atPut(action, addressesEntry);
                            }
                        }

                        //  Push the observed address into the list of addresses
                        //  for this action for this path.
                        addressesEntry.push(observedAddress);
                    }
                }
            }
        });

    //  Define a Function to compute a signal name from an action
    signalNameForAction = function(anAction) {

        switch (anAction) {
            case TP.CREATE:
            case TP.INSERT:
            case TP.APPEND:

                //  CREATE, INSERT or APPEND means an 'insertion structural
                //  change' in the data.
                return 'TP.sig.StructureInsert';

            case TP.DELETE:

                //  DELETE means a 'deletion structural change' in the data.
                return 'TP.sig.StructureDelete';

            case TP.UPDATE:
            default:

                //  UPDATE means just a value changed.
                return 'TP.sig.ValueChange';
        }
    };

    infos = TP.ac();

    //  Now, process all of the changed paths and send changed signals. The
    //  signal type sent will be based on their action.

    pathKeys = changedPaths.getKeys();

    //  Loop over all of the changed paths.
    keysLen = pathKeys.getSize();
    for (i = 0; i < keysLen; i++) {

        //  Get any aliases that are associated with the particular path.
        pathAspectAliases = target.getAccessPathAliases(pathKeys.at(i));

        //  This will be a hash
        pathEntry = changedPaths.at(pathKeys.at(i));

        //  Loop over all of the entries for this particular path. Each one
        //  will contain an Array of the addresses that changed and the action
        //  that changed them (TP.CREATE, TP.DELETE or TP.UPDATE)
        actions = pathEntry.getKeys();

        description = TP.hc(
                        'target', target,
                        'facet', 'value',
                        TP.CHANGE_PATHS, changedPaths);

        actionsLen = actions.getSize();
        for (j = 0; j < actionsLen; j++) {

            pathAction = actions.at(j);
            description.atPut('action', pathAction);

            pathAddresses = pathEntry.at(pathAction);
            description.atPut('addresses', pathAddresses);

            //  Compute the signal name based on the action.
            sigName = signalNameForAction(pathAction);

            //  If we found any path aliases, then loop over them and dispatch
            //  individual signals using their aspect name.
            if (TP.isValid(pathAspectAliases)) {

                aliasesLen = pathAspectAliases.getSize();

                for (k = 0; k < aliasesLen; k++) {
                    aspectName = pathAspectAliases.at(k);

                    description.atPut('aspect', aspectName);

                    aspectSigName = TP.makeStartUpper(aspectName) + 'Change';

                    infos.push(
                        TP.hc('sigName', aspectSigName,
                                'description', TP.copy(description),
                                'policy', TP.INHERITANCE_FIRING,
                                'sigType', sigName));
                }
            } else {

                description.atPut('aspect', pathKeys.at(i));

                infos.push(
                    TP.hc('sigName', sigName,
                            'description', TP.copy(description),
                            'sigType', sigName));
            }
        }
    }

    //  De-dup the records according to a 'aspect :: sigType' key
    infos.unique(
        function(anInfo) {
            return anInfo.at('description').at('aspect') +
                    ' :: ' +
                    anInfo.at('sigType');
        });

    //  If we're not filtering records by signal types, then just return them
    //  all here.
    if (TP.isFalse(filterOutSignalSupertypes)) {
        return infos;
    }

    //  Now, iterate through all of the records, looking for ones that have the
    //  same aspect but different signal types. Filter out those that are signal
    //  supertypes of others, since those will be signaled anyway.

    filteredInfos = TP.ac();

    leni = infos.getSize();
    for (i = 0; i < leni; i++) {

        iAspect = infos.at(i).at('description').at('aspect');
        iSigType = TP.sys.getTypeByName(infos.at(i).at('sigType'));

        shouldAdd = true;

        lenj = filteredInfos.getSize();
        for (j = 0; j < lenj; j++) {

            jAspect = filteredInfos.at(j).at('description').at('aspect');
            jSigType = TP.sys.getTypeByName(filteredInfos.at(j).at('sigType'));

            if (jAspect === iAspect) {
                if (TP.isSubtypeOf(jSigType, iSigType)) {
                    //  What is already in the filtered records is a subtype of
                    //  what we're trying to add - don't add.
                    shouldAdd = false;
                    break;
                } else if (TP.isKindOf(iSigType, jSigType)) {
                    //  What is already in the filtered records is a supertype
                    //  of what we're trying to add - replace what's already
                    //  there (and don't add it again, obviously).
                    filteredInfos.splice(j, 1, infos.at(i));
                    shouldAdd = false;
                    break;
                }
            }
        }

        if (shouldAdd) {
            filteredInfos.push(infos.at(i));
        }
    }

    return filteredInfos;
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Inst.defineMethod('processFinalValue',
function(aReturnValue, targetObj) {

    /**
     * @method processFinalValue
     * @summary Processes the final value before it is returned from the
     *     receiver
     * @description This method postprocesses the final value before it is
     *     returned from the receiver. This postprocessing includes the
     *     following steps, if they are configured on the receiver:
     *          1.  Collapsing any single-valued Collection results
     *          2.  Using an extractor to extract a final value 'beyond' the
     *          last path step
     *          3.  Packaging any remaining results into a type or by using a
     *          Function
     *          4.  Using a fallback Function to create a result if one
     *          couldn't be found (i.e. the value is not valid).
     * @param {Object} aReturnValue The initial return value from this path.
     * @param {Object} targetObj The object to that the receiver has just
     *     executed against.
     * @returns {Object} The final value to be returned from this path.
     */

    var isEmptyArray,

        retVal,

        extractWith,

        keys,

        packageWith,
        packageType,

        fallbackWith;

    isEmptyArray = TP.isArray(aReturnValue) && TP.isEmpty(aReturnValue);

    retVal = aReturnValue;

    //  NB: We only do this if the return value is valid *and* its not an empty
    //  Array. Otherwise, we run the fallback function below if it's available.
    if (TP.isValid(retVal) && !isEmptyArray) {

        //  If we're configured to collapse, then do it.

        /* eslint-disable no-extra-parens */
        if (this.get('shouldCollapse')) {
            retVal = TP.collapse(retVal);
        }
        /* eslint-enable no-extra-parens */

        //  If we're configured to extract with either an aspect name or a
        //  Function, then do that. Note that if we have a collection then we
        //  extract each value in the collection using our extractor.
        if (TP.isValid(extractWith = this.get('extractWith'))) {
            if (TP.isCollection(retVal)) {
                keys = TP.keys(retVal);

                keys.perform(
                        function(aKey) {
                            retVal.atPut(
                                aKey,
                                TP.val(retVal.at(aKey), extractWith));
                        });
            } else {
                retVal = TP.val(retVal, extractWith);
            }
        }

        //  If we have a 'packageWith' configured, then it's either a Function
        //  or a Type (or String type name or format). Use it to package the
        //  results.
        if (TP.isValid(packageWith = this.get('packageWith'))) {
            if (TP.isCallable(packageWith)) {
                retVal = packageWith(retVal);
            } else if (TP.isType(packageWith)) {
                retVal = packageWith.construct(retVal);
            } else if (TP.isString(packageWith)) {
                if (TP.isType(packageType =
                            TP.sys.getTypeByName(packageWith)) &&
                        packageType !== Object) {
                    retVal = packageType.construct(retVal);
                } else {
                    retVal = TP.format(retVal,
                                        packageWith,
                                        TP.hc('shouldWrap', true));
                }
            }
        }
    } else if (TP.isCallable(fallbackWith = this.get('fallbackWith'))) {
        //  If we didn't have a suitable return value, but we were configured
        //  with a fallback Function, then go ahead and use it to try to return
        //  an initial value.
        retVal = fallbackWith(targetObj);
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Inst.defineMethod('updateRegistrationsAfterSignaling',
function(targetObj) {

    /**
     * @method updateRegistrationsAfterSignaling
     * @summary Updates any path registrations and their attendant address
     *     information after signaling a change. This method is called to
     *     provide any 'cleanup' for paths that reference data that no longer
     *     exist and to reset them to data that might now exist at the same
     *     address.
     * @param {Object} targetObj The object to update the path and address
     *     information for.
     * @returns {TP.path.AccessPath} The receiver.
     */

    var observedAddresses,

        executedPaths,

        invalidatedPaths,
        addressesToRemove;

    observedAddresses = TP.path.AccessPath.$getObservedAddresses().at(
                            TP.id(targetObj));

    if (TP.isEmpty(observedAddresses)) {
        return this;
    }

    addressesToRemove = this.get('$addressesToRemove');

    //  Remove old addresses that are now no longer valid (since we signaled
    //  them with a TP.DELETE). If we created structure as well (i.e. replaced
    //  one tree with another tree), then executing the 'get' below will
    //  repopulate this with addresses that are still valid.
    observedAddresses.removeKeys(addressesToRemove);

    executedPaths = TP.path.AccessPath.$getExecutedPaths().at(
                            TP.id(targetObj));
    invalidatedPaths = this.get('$invalidatedPaths');

    if (TP.notEmpty(invalidatedPaths)) {
        //  Remove the matching paths that were invalid from the executed paths.
        //  Again, if we created structure, then executing the 'get' below will
        //  repopulate this with paths that are still valid.
        executedPaths.removeAtAll(invalidatedPaths);

        //  Now, we need to go through the invalidated paths and rerun their
        //  'get' to re-execute and re-register their path.
        invalidatedPaths.perform(
                function(aPath) {
                    TP.apc(aPath).executeGet(targetObj);
                });

        invalidatedPaths.empty();
    }

    addressesToRemove.empty();

    return this;
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Inst.defineMethod('updateRegistrationsBeforeSignaling',
function(targetObj) {

    /**
     * @method updateRegistrationsBeforeSignaling
     * @summary Updates any path registrations and their attendant address
     *     information before signaling a change. This method is called to
     *     mark any paths that match addresses that reference data that might
     *     be being deleted or whose structure is changing. This information is
     *     then used after signaling change to 'clean up' these referred to
     *     paths and addresses.
     * @param {Object} targetObj The object to update the path and address
     *     information for.
     * @returns {TP.path.AccessPath} The receiver.
     */

    var observedAddresses,
        observedAddressesKeys,

        changedAddresses,

        invalidatedPaths,
        addressesToRemove;

    //  We need to clear the path information registered for the addresses
    //  'under' the data that changed.
    observedAddresses = TP.path.AccessPath.$getObservedAddresses().at(
                            TP.id(targetObj));

    if (TP.isEmpty(observedAddresses)) {
        return this;
    }

    observedAddressesKeys = TP.keys(observedAddresses);

    //  Go through the addresses that changed and match them against any
    //  entries in observedAddresses
    changedAddresses = TP.path.AccessPath.$getChangedAddresses();

    invalidatedPaths = this.get('$invalidatedPaths');
    addressesToRemove = this.get('$addressesToRemove');

    changedAddresses.perform(
            function(locAddrPair) {
                var anAddress,

                    i,
                    len,

                    theKey;

                anAddress = locAddrPair.at('address');

                len = observedAddressesKeys.getSize();
                for (i = 0; i < len; i++) {

                    theKey = observedAddressesKeys.at(i);

                    //  Since we're removing keys along the way (and altering
                    //  the data structure as we go), we need this check
                    if (!observedAddresses.hasKey(theKey)) {
                        continue;
                    }

                    if (theKey === anAddress) {
                        //  An address/action pair has already been entered for
                        //  the actual changed address at the root, so we don't
                        //  need to do anything here.
                        continue;
                    } else if (theKey.startsWith(anAddress)) {
                        invalidatedPaths = invalidatedPaths.concat(
                                        observedAddresses.at(theKey));
                        addressesToRemove.push(theKey);

                        TP.path.AccessPath.registerChangedAddress(
                                theKey, TP.DELETE);
                    }
                }
            });

    invalidatedPaths = invalidatedPaths.unique();

    this.set('$invalidatedPaths', invalidatedPaths);
    this.set('$addressesToRemove', addressesToRemove);

    return this;
});

//  ------------------------------------------------------------------------

TP.path.AccessPath.Inst.defineMethod('sendChangedSignal',
function(targetObj) {

    /**
     * @method sendChangedSignal
     * @summary Sends a signal using the supplied target object as the origin
     *     to let observers know that we have changed.
     * @param {Object} targetObj The object to send the 'changed signal' from.
     * @returns {TP.path.AccessPath} The receiver.
     */

    var allAddresses,

        observedAddresses,

        executedPaths,

        changedAddresses,
        changedPaths,

        signalNameForAction,

        pathKeys,
        keysLen,
        i,

        pathAspectAliases,
        j,

        pathEntry,
        actions,
        description,
        batchID,

        actionsLen,

        pathAction,
        pathAddresses,

        sigName,

        aliasesLen,
        k,
        aspectName,
        aspectSigName;

    //  '$observedAddresses' is a map that looks like this:
    //  {
    //      <sourceObjID>  :    {
    //                              <address>   :   [path1, path2, ...]
    //                          }
    //  }

    allAddresses = TP.path.AccessPath.$getObservedAddresses();

    observedAddresses = allAddresses.at(TP.id(targetObj));

    //  If we couldn't find any 'observed' addresses for the target object,
    //  then we should try to compute them - at least for this path. This is
    //  normally done by doing a 'get'.

    if (TP.isEmpty(observedAddresses)) {
        this.executeGet(targetObj);

        observedAddresses = allAddresses.at(TP.id(targetObj));

        //  If we still can't find any, then we just exit
        if (TP.isEmpty(observedAddresses)) {
            return this;
        }
    } else {

        //  Make sure that this path is registered in 'executed paths' - to
        //  make sure that at least observers of this path will be notified.
        executedPaths = TP.path.AccessPath.$getExecutedPaths().at(
                            TP.id(targetObj));

       //  If we can't find any executed paths for the source, or not one for
       //  this path, then execute a get - this will register this path in both
       //  'executed paths' and, more importantly, will register any addresses
       //  that this path references in the data object
        if (TP.notValid(executedPaths) ||
            TP.notValid(executedPaths.at(this.get('srcPath')))) {
            this.executeGet(targetObj);
        }
    }

    //  Grab all of the data addresses that changed. We'll iterate over this,
    //  comparing with the 'observed' addresses and then collect the paths that
    //  did those observations.

    changedAddresses = TP.path.AccessPath.$getChangedAddresses();

    //  Generate a data structure with a data path as its key and
    //  action/addresses as the value:
    //
    //  {
    //      <path1>  :  {
    //                      <action>   :   [address1, address2, ...]
    //                  }
    //  }

    changedPaths = TP.hc();

    observedAddresses.perform(
        function(addressPair) {
            var observedAddress,
                interestedPaths,

                l,
                record,

                m,

                action,
                thePath,

                addressesEntry,
                actionEntry;

            observedAddress = addressPair.first();

            //  Note that this is an Array of paths
            interestedPaths = addressPair.last();

            for (l = 0; l < changedAddresses.getSize(); l++) {

                record = changedAddresses.at(l);

                //  We found an address match between changed and observed
                //  addresses. Add the paths from the observed address and
                //  the action from the changed address into the Array of
                //  'changed paths'.

                if (record.at('address') === observedAddress) {
                    action = record.at('action');

                    //  Loop over all of the interested paths
                    for (m = 0; m < interestedPaths.getSize(); m++) {
                        thePath = interestedPaths.at(m);

                        //  If there isn't an action/addresses entry for the
                        //  path, create one.
                        if (TP.notValid(actionEntry =
                                        changedPaths.at(thePath))) {

                            addressesEntry = TP.ac();
                            actionEntry = TP.hc(action, addressesEntry);

                            changedPaths.atPut(thePath, actionEntry);
                        } else {
                            //  Otherwise, if there was an entry for the path,
                            //  but not for the action, create one.
                            if (TP.notValid(addressesEntry =
                                            actionEntry.at(action))) {

                                addressesEntry = TP.ac();
                                actionEntry.atPut(action, addressesEntry);
                            }
                        }

                        //  Push the observed address into the list of addresses
                        //  for this action for this path.
                        addressesEntry.push(observedAddress);
                    }
                }
            }
        });

    //  Define a Function to compute a signal name from an action
    signalNameForAction = function(anAction) {

        switch (anAction) {
            case TP.CREATE:
            case TP.INSERT:
            case TP.APPEND:

                //  CREATE, INSERT or APPEND means an 'insertion structural
                //  change' in the data.
                return 'TP.sig.StructureInsert';

            case TP.DELETE:

                //  DELETE means a 'deletion structural change' in the data.
                return 'TP.sig.StructureDelete';

            case TP.UPDATE:
            default:

                //  UPDATE means just a value changed.
                return 'TP.sig.ValueChange';
        }
    };

    //  Now, process all of the changed paths and send changed signals. The
    //  signal type sent will be based on their action.

    pathKeys = changedPaths.getKeys();

    //  Loop over all of the changed paths.
    keysLen = pathKeys.getSize();
    for (i = 0; i < keysLen; i++) {

        //  Get any aliases that are associated with the particular path.
        pathAspectAliases = targetObj.getAccessPathAliases(pathKeys.at(i));

        //  This will be a hash
        pathEntry = changedPaths.at(pathKeys.at(i));

        //  Loop over all of the entries for this particular path. Each one
        //  will contain an Array of the addresses that changed and the action
        //  that changed them (TP.CREATE, TP.DELETE or TP.UPDATE)
        actions = pathEntry.getKeys();

        description = TP.hc(
                        'target', targetObj,
                        'facet', 'value',
                        TP.CHANGE_PATHS, changedPaths);

        //  This method supports 'batching' of signals. Some receivers (like
        //  TIBET's markup-based binding machinery) only want to update when the
        //  end of a 'batch' of signals is received. Therefore, we mark our
        //  signals with a unique 'batch ID'.
        //  For the first signal in the batch, we stamp in the unique batch ID
        //  under the TP.START_SIGNAL_BATCH key in the signal's payload and,
        //  conversely under the TP.END_SIGNAL_BATCH key for the last signal in
        //  the batch. All signals carry the batch ID under the TP.SIGNAL_BATCH
        //  key.

        //  First signal... generate and stamp in the batch ID under both
        //  TP.START_SIGNAL_BATCH and TP.SIGNAL_BATCH. We'll clear
        //  TP.START_SIGNAL_BATCH below, after the signal is sent.
        if (i === 0) {
            batchID = TP.genID('SIGNAL_BATCH');
            description.atPut(TP.START_SIGNAL_BATCH, batchID);

            description.atPut(TP.SIGNAL_BATCH, batchID);
        }

        actionsLen = actions.getSize();
        for (j = 0; j < actionsLen; j++) {

            pathAction = actions.at(j);
            description.atPut('action', pathAction);

            pathAddresses = pathEntry.at(pathAction);
            description.atPut('addresses', pathAddresses);

            //  Compute the signal name based on the action.
            sigName = signalNameForAction(pathAction);

            //  Last signal... stamp in the batch ID under TP.END_SIGNAL_BATCH
            if (i === keysLen - 1 && j === actionsLen - 1) {
                description.atPut(TP.END_SIGNAL_BATCH, batchID);
            }

            //  If we found any path aliases, then loop over them and dispatch
            //  individual signals using their aspect name.
            if (TP.isValid(pathAspectAliases)) {

                aliasesLen = pathAspectAliases.getSize();

                for (k = 0; k < aliasesLen; k++) {
                    aspectName = pathAspectAliases.at(k);

                    description.atPut('aspect', aspectName);

                    aspectSigName = TP.makeStartUpper(aspectName) + 'Change';

                    //  Note that we force the firing policy here. This allows
                    //  observers of a generic Change to see 'aspect'Change
                    //  notifications, even if those 'aspect'Change signals
                    //  haven't been defined as being subtypes of Change.

                    //  Also note how we supply either 'TP.sig.Change' (the top
                    //  level for simple attribute changes) or one of the
                    //  subtypes of 'TP.sig.StructureChange' (the top level for
                    //  structural changes, mostly used in 'path'ed attributes)
                    //  as the default signal type here so that undefined aspect
                    //  signals will use that type.
                    TP.signal(targetObj, aspectSigName, description,
                                TP.INHERITANCE_FIRING, sigName);
                }
            } else {

                description.atPut('aspect', pathKeys.at(i));

                TP.signal(targetObj, sigName, description);
            }
        }

        //  First signal... remove the batch ID under TP.START_SIGNAL_BATCH
        if (i === 0) {
            description.removeKey(TP.START_SIGNAL_BATCH);
        }
    }

    return this;
});

//  ========================================================================
//  TP.path.CompositePath
//  ========================================================================

TP.path.AccessPath.defineSubtype('CompositePath');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The set of paths that this composite path holds. It chains them together to
//  get or set a value when executing.
TP.path.CompositePath.Inst.defineAttribute('paths');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.path.CompositePath.Inst.defineMethod('init',
function(aPath, config) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {String} aPath The String to build the instance from.
     * @param {TP.core.Hash} config The configuration for this path.
     * @returns {TP.path.CompositePath} The receiver.
     */

    var path,

        pathStrs,
        i,

        paths;

    this.callNextMethod('value', config);

    path = aPath;

    //  If the path has a '#tibet(...)' scheme wrapping it, slice that off. It
    //  will cause the split below to be off.
    if (TP.regex.TIBET_POINTER.test(path)) {
        path = path.slice(7, -1);
    }

    //  Split along '.(' or ').'
    pathStrs = path.split(/(\.\(|\)\.)/);

    //  Strip any leading parenthesis from the first item and any trailing
    //  parenthesis from the last item.
    pathStrs.atPut(0, pathStrs.first().strip(/^\(/));
    pathStrs.atPut(pathStrs.getSize() - 1, pathStrs.last().strip(/\)$/));

    //  Create the set of subpaths that we will use by iterating over the path
    //  strings that we extracted. Note that the 'odd' positions will contain
    //  the '.(' or ').' that we split on, so we skip those by incrementing by
    //  2.
    paths = TP.ac();
    for (i = 0; i < pathStrs.getSize(); i += 2) {
        paths.push(TP.apc(pathStrs.at(i), TP.hc('shouldCollapse', true)));
    }

    if (TP.isValid(config)) {
        //  Configure the 'last path' to honor the shouldCollapse flag.
        paths.last().set('shouldCollapse', config.at('shouldCollapse'));
    }

    this.set('paths', paths);

    return this;
});

//  ------------------------------------------------------------------------

TP.path.CompositePath.Inst.defineMethod('executeGet',
function(targetObj, varargs) {

    /**
     * @method executeGet
     * @summary Returns the result of executing the path in a 'get' fashion -
     *     i.e. with the intent of retrieving data from the supplied target
     *     object.
     * @param {Object} targetObj The object to execute the receiver against to
     *     get data.
     * @param {arguments} varargs The arguments to execute the get with. The
     *     first argument should be the object to execute the receiver against
     *     to retrieve data. Any remaining arguments will be used as values for
     *     a templated substitution in the path itself.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidPath
     * @returns {Object} The result of executing a 'get' against the target
     *     object using the receiver.
     */

    var paths,
        i,
        retVal,
        nextPath;

    if (TP.notValid(targetObj)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  The initial return value is the object itself.
    retVal = targetObj;

    //  Iterate over this object's subpaths.
    paths = this.get('paths');
    for (i = 0; i < paths.getSize(); i++) {

        //  If it's null or undefined, don't try to message it - just exit here.
        if (TP.notValid(retVal)) {
            break;
        }

        //  If the return value cannot execute a 'get', then wrap it.
        if (!TP.canInvoke(retVal, 'get')) {
            retVal = TP.wrap(retVal);
        }

        nextPath = paths.at(i);

        //  If the path is a JSON path, but the content isn't a JSONContent,
        //  convert it so that the path runs correctly.
        if (nextPath.getPathType() === TP.JSON_PATH_TYPE &&
            !TP.isKindOf(retVal, TP.core.JSONContent)) {
            retVal = TP.core.JSONContent.construct(retVal);
        }

        //  Execute the 'get()' and reassign the return value.
        retVal = retVal.get(nextPath);

        //  If the return value is a callable Function, then call it and
        //  reassign the return value to the result.
        if (TP.isCallable(retVal)) {
            retVal = retVal(targetObj);
        }
    }

    return this.processFinalValue(retVal, targetObj);
});

//  -----------------------------------------------------------------------

TP.path.CompositePath.Inst.defineMethod('executeSet',
function(targetObj, attributeValue, shouldSignal, varargs) {

    /**
     * @method executeSet
     * @summary Executes the path in a 'set' fashion - i.e. with the intent of
     *     setting the supplied data into the supplied target object.
     * @param {Object} targetObj The object to execute the receiver against to
     *     set data.
     * @param {Object} attributeValue The object to use as the value to set
     *     into the target object.
     * @param {Boolean} shouldSignal If false, no signaling occurs. Defaults to
     *     targetObj.shouldSignalChange().
     * @param {arguments} varargs Any remaining arguments will be used as values
     *     for a templated substitution in the path itself.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidPath
     * @returns {Object} The result of executing a 'set' against the target
     *     object using the receiver.
     */

    var paths,
        i,
        retVal;

    if (TP.notValid(targetObj)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  The initial return value is the object itself.
    retVal = targetObj;

    //  Iterate over this object's subpaths, except the last one, and perform a
    //  'get()'.
    paths = this.get('paths');
    for (i = 0; i < paths.getSize() - 1; i++) {

        //  If it's null or undefined, don't try to message it - just exit here.
        if (TP.notValid(retVal)) {
            break;
        }

        //  Execute the 'get()' and reassign the return value.
        retVal = retVal.get(paths.at(i));

        //  If the return value is a callable Function, then call it and
        //  reassign the return value to the result.
        if (TP.isCallable(retVal)) {
            retVal = retVal(targetObj);
        }
    }

    //  Execute the 'set()' and reassign the return value.
    retVal = retVal.set(paths.last(), attributeValue, shouldSignal);

    return retVal;
});

//  ------------------------------------------------------------------------

TP.path.CompositePath.Inst.defineMethod('getPathParts',
function() {

    /**
     * @method getPathParts
     * @summary Returns the receiver's parts.
     * @returns {String[]} An Array of the receiver's parts.
     */

    var paths,

        parts,
        i;

    //  Iterate over this object's subpaths and concatenate together the Arrays
    //  produced by getting the path parts of each subpath.
    paths = this.get('paths');

    parts = paths.at(0).getPathParts();
    for (i = 1; i < paths.getSize(); i++) {
        parts = parts.concat(paths.at(i).getPathParts());
    }

    return parts;
});

//  ------------------------------------------------------------------------

TP.path.CompositePath.Inst.defineMethod('getPathType',
function() {

    /**
     * @method getPathType
     * @summary Returns the receiver's 'path type'.
     * @returns {String} A path type
     */

    return TP.COMPOSITE_PATH_TYPE;
});

//  ========================================================================
//  TP.path.JSONPath
//  ========================================================================

/**
 * @type {TP.path.JSONPath}
 */

//  ------------------------------------------------------------------------

TP.path.AccessPath.defineSubtype('JSONPath');

//  ------------------------------------------------------------------------

//  avoid binding and apply issues by creating our alias as a wrapper
TP.definePrimitive('jpc',
function(aPath, config) {

    /**
     * @method jpc
     * @summary Returns a newly initialized JSONPath instance. Note that if
     * @param {String} aPath The JSONPath as a String.
     * @param {TP.core.Hash} config The configuration for this path.
     * @returns {TP.path.XPathPath} The new instance.
     */

    return TP.path.JSONPath.construct.apply(TP.path.JSONPath, arguments);
});

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.path.JSONPath.Type.defineAttribute('$mirroredAttributes');

//  ------------------------------------------------------------------------

TP.path.JSONPath.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    //  These are properties whose values get 'mirrored' over to our internal
    //  XML path. Note that we only mirror over ones that makes sense for XML
    //  paths.
    this.Type.set('$mirroredAttributes',
                    TP.ac('shouldMakeStructures', 'shouldCollapse'));

    return;
});

//  ------------------------------------------------------------------------

TP.path.JSONPath.Type.defineMethod('asXPath',
function(srcPath, templateArgs) {

    /**
     * @method asXPath
     * @summary Returns an XPath representation of the supplied source path.
     *     This is used to query the special XML representation of a JavaScript
     *     object sourced from JSON data and converted to XML. This is only used
     *     for TIBET's JSONPath support.
     * @param {String} srcPath The source JSONPath string representation to
     *     build an XPath from.
     * @param {Object[]} templateArgs An optional Array of template arguments.
     *     If the receiver is a templated path, these values will be used to
     *     fill in the template values and the computed XPath will *not* be
     *     cached.
     * @returns {String} An XPath representation of the receiver.
     */

    var path,
        tokens,

        xmlStr,
        prevStepIsDescent,

        pathTokens,
        i,

        token,
        operation,
        scope,

        tokenRecord,
        exprRecord,

        from,
        to,

        fromExpr,
        toExpr,

        indexes,
        j,
        item,

        content;

    path = srcPath;

    if (TP.regex.HAS_ACP.test(path)) {
        path = path.transform(templateArgs);
    }

    //  Tokenize the JSONPath string.
    try {
        tokens = TP.$JSONPathParser.parse(path);
    } catch (e) {
        return this.raise(
                'TP.sig.JSONPathTokenizationFailed',
                TP.ec(e,
                    TP.sc('Tokenization failed at: ', e.line || 'unknown',
                            ' with source: ' + srcPath)));
    }

    xmlStr = '';

    prevStepIsDescent = false;

    //  The individual path tokens start at this place under the root
    pathTokens = tokens[0].expression.value;

    for (i = 0; i < pathTokens.getSize(); i++) {

        token = pathTokens.at(i);

        //  JSONPath root operator
        if (token === '$') {

            xmlStr += '//*';
            continue;
        }

        operation = token.operation;
        scope = token.scope;
        tokenRecord = token.value;

        if (tokenRecord) {
            exprRecord = tokenRecord.expression;
        } else {
            exprRecord = {
                type: 'none',
                value: 'none'
            };
        }

        switch (operation) {

            case 'member':

                prevStepIsDescent = false;

                switch (scope) {

                    //  JSONPath recursive descent
                    //  '..'    ->  '//'
                    case 'descendant':
                        xmlStr += '//';
                        prevStepIsDescent = true;
                        break;
                    //  JSONPath child operator
                    //  '.'     ->  '/'
                    case 'child':
                        xmlStr += '/';
                        break;
                    //  JSONPath parent operator (enhanced JSONPath)
                    //  '^'     ->  '/..'
                    case 'parent':
                        xmlStr += '/..';
                        continue;

                    default:
                        break;
                }

                switch (exprRecord.type) {

                    case 'identifier':
                        xmlStr += exprRecord.value;
                        break;
                    case 'wildcard':
                        xmlStr += '*';
                        break;

                    default:
                        break;
                }

                break;

            case 'subscript':

                //  Note how with all of these expressions we add 1 to the
                //  various computations to account for XPath's 1-based
                //  indexing.

                switch (exprRecord.type) {

                    //  JSONPath subscript operator (numeric values only)
                    //  '[<number>]' ->  '[position() = ... + 1]'
                    case 'index':

                        //  If the previous step was a 'recursive descent'
                        //  operator (i.e. '..' converted to '//'), then we
                        //  filter out same-named nodes that really represent
                        //  the Array of this item. This is so that recursive
                        //  descent operators don't also pick up the Element
                        //  representing the Array itself. Otherwise, we add an
                        //  'all element's step to make the query work properly.
                        xmlStr += prevStepIsDescent ?
                                    '[not(@type="array")]' :
                                    '/*';

                        xmlStr += '[position() = ' +
                               (exprRecord.value.asNumber() + 1) +
                               ']';

                        break;

                    //  JSONPath subscript operator with wildcard
                    case 'wildcard':

                        //  Find the last slash and double it
                        xmlStr = xmlStr.slice(0, xmlStr.lastIndexOf('/')) +
                                    '/' +
                                    xmlStr.slice(xmlStr.lastIndexOf('/'));

                        break;

                    //  JSONPath slice expression
                    //  '[<number>:<number>]' ->  '[...]'
                    case 'slice':

                        //  See above for what this is used for.
                        xmlStr += prevStepIsDescent ?
                                    '[not(@type="array")]' :
                                    '/*';

                        if (TP.isValid(exprRecord.value.start)) {
                            from = exprRecord.value.start;
                        }

                        if (TP.isValid(exprRecord.value.end)) {
                            to = exprRecord.value.end;
                        }

                        if (TP.isNumber(from) &&
                            TP.isNumber(to) &&
                            to === from + 1) {

                            xmlStr += '[position() = ' + (from + 1) + ']';

                        } else {

                            if (TP.isNumber(from)) {
                                if (!TP.isNaN(from)) {
                                    if (from.isNegative()) {
                                        fromExpr =
                                            'position() >= last() + ';
                                    } else {
                                        fromExpr = 'position() >= ';
                                    }

                                    fromExpr += from + 1;
                                }
                            }

                            if (TP.isNumber(to)) {
                                if (!TP.isNaN(to)) {
                                    if (to.isNegative()) {
                                        toExpr =
                                            'position() < last() - ';
                                        toExpr += to.abs() - 1;
                                    } else {
                                        toExpr = 'position() < ';
                                        toExpr += to + 1;
                                    }
                                }
                            }

                            xmlStr += '[';

                            if (TP.notEmpty(fromExpr)) {
                                xmlStr += fromExpr;
                            }

                            if (TP.notEmpty(fromExpr) &&
                                TP.notEmpty(toExpr)) {
                                xmlStr += ' and ';
                            }

                            if (TP.notEmpty(toExpr)) {
                                xmlStr += toExpr;
                            }

                            xmlStr += ']';
                        }

                        break;

                    //  JSONPath union operator
                    //  '[... , ...]' ->  '[... or ...]'
                    case 'union':

                        //  See above for what this is used for.
                        xmlStr += prevStepIsDescent ?
                                    '[not(@type="array")]' :
                                    '/*';

                        indexes = exprRecord.value;

                        xmlStr += '[';

                        for (j = 0; j < indexes.getSize(); j++) {

                            item = indexes.at(j).expression.value;
                            if (TP.isNumber(item.asNumber())) {
                                xmlStr += 'position() = ' +
                                        (item.asNumber() + 1);
                            } else {
                                xmlStr += 'local-name() = "' + item + '"';
                            }

                            xmlStr += ' or ';
                        }

                        //  slice off the last ' or '
                        xmlStr = xmlStr.slice(0, -4);

                        xmlStr += ']';

                        break;

                    //  JSONPath script expression
                    //  '[(...)]'  ->  '[...]'
                    case 'script_expression':

                        //  See above for what this is used for.
                        xmlStr += prevStepIsDescent ?
                                    '[not(@type="array")]' :
                                    '/*';

                        content = exprRecord.value;

                        xmlStr += '[';

                        if (/@\.length/.test(content)) {
                            xmlStr +=
                                'position() = ' +
                                content.replace(/@\.length/, 'last() + 1');
                        } else {
                            //  JSONPath current object
                            //  '@'     ->  '.'
                            xmlStr += content.replace(/@\./g, './');
                        }

                        /* eslint-disable no-div-regex */
                        xmlStr = xmlStr.replace(/==/, '=');
                        /* eslint-enable no-div-regex */

                        xmlStr = xmlStr.replace(/&&/, 'and');
                        xmlStr = xmlStr.replace(/\|\|/, 'or');

                        xmlStr += ']';

                        break;

                    //  JSONPath filter expression
                    //  '[?(...)]'  ->  '[...]'
                    case 'filter_expression':

                        //  See above for what this is used for.
                        xmlStr += prevStepIsDescent ?
                                    '[not(@type="array")]' :
                                    '/*';

                        content = exprRecord.value;

                        xmlStr += '[';

                        //  JSONPath current object
                        //  '@'     ->  '.'
                        xmlStr += content.replace(/@\./g, './');

                        /* eslint-disable no-div-regex */
                        xmlStr = xmlStr.replace(/==/, '=');
                        /* eslint-enable no-div-regex */

                        xmlStr = xmlStr.replace(/&&/, 'and');
                        xmlStr = xmlStr.replace(/\|\|/, 'or');

                        xmlStr += ']';

                        break;

                    default:
                        break;
                }
                break;

            default:
                break;
        }
    }

    //  Adjust as necessary for the 'rootObj' top-level element that will
    //  get generated as the root-level element.
    if (xmlStr.startsWith('/') && !xmlStr.startsWith('//')) {
        xmlStr = '/rootObj' + xmlStr;
    }

    return xmlStr;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Our internal XPath
TP.path.JSONPath.Inst.defineAttribute('$xmlPath');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.path.JSONPath.Inst.defineMethod('init',
function(aPath, config) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {String} aPath The String to build the instance from.
     * @param {TP.core.Hash} config The configuration for this path.
     * @returns {TP.path.SimpleTIBETPath} The receiver.
     */

    var path;

    //  Make sure that any 'access path' scheme is stripped off
    if (TP.regex.JSON_POINTER.test(aPath)) {
        path = TP.regex.JSON_POINTER.match(aPath).at(1);
    } else {
        path = aPath;
    }

    this.callNextMethod(path, config);

    if (TP.isHash(config)) {
        this.set('shouldCollapse', config.atIfInvalid('shouldCollapse', true));
    } else {
        this.set('shouldCollapse', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.path.JSONPath.Inst.defineMethod('executeGet',
function(targetObj, varargs) {

    /**
     * @method executeGet
     * @summary Returns the result of executing the path in a 'get' fashion -
     *     i.e. with the intent of retrieving data from the supplied target
     *     object.
     * @param {targetObj} Object The object to execute the receiver against to
     *     get data.
     * @param {arguments} varargs The arguments to execute the get with. The
     *     first argument should be the object to execute the receiver against
     *     to retrieve data. Any remaining arguments will be used as values for
     *     a templated substitution in the path itself.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidPath
     * @exception TP.sig.InvalidNode
     * @returns {Object} The result of executing a 'get' against the target
     *     object using the receiver.
     */

    var target,

        targetNdx,
        targetSnaps,
        targetData,

        tpXMLDoc,

        currentJSONData,

        xmlPath,

        retVal,
        retValKeys,

        srcPath,
        args;

    if (TP.notValid(targetObj)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    target = targetObj;

    //  This kind of path will only work against TP.core.JSONContent objects
    if (!TP.isKindOf(target, TP.core.JSONContent)) {
        target = target.$get('$$realData');
        if (!TP.isKindOf(target, TP.core.JSONContent)) {
            return this.raise('TP.sig.InvalidPath');
        }
    }

    if (targetObj.$get('transactional')) {

        targetNdx = targetObj.$get('currentIndex');
        targetSnaps = targetObj.$get('snaps');

        //  NOTE:   we use $get here since we don't want to recurse over
        //          getProperty() calls that use getNativeNode
        if (TP.isValid(targetNdx)) {
            targetData = targetSnaps.at(targetNdx);
        } else {
            targetData = targetObj.$get('data');
        }

        tpXMLDoc = targetData;
    } else {
        tpXMLDoc = target.$get('data');
    }

    //  See if the JSONContent object already has corresponding XML content. If
    //  not, create it.
    if (!TP.isKindOf(tpXMLDoc, TP.dom.XMLDocumentNode)) {

        //  Some sleight-of-hand to get our target content object to hold XML
        //  rather than JSON, but pretend to outside observers like it's holding
        //  JSON.

        //  To do this, we locally rewrite its getData()/setData() to read/write
        //  the xmlDocument.

        //  Make sure to get the JavaScript Object data *first* before we
        //  redefine getData(). Note that if this is just a String, then it
        //  hasn't been packaged yet - which is good - we'll package it using
        //  'plain JSON'. Note that the regular getData() call will package this
        //  an 'enhanced' JSON, which is why - if the data isn't a String - we
        //  get a JSON String representation and then turn it into 'plain JSON'.
        if (TP.isString(currentJSONData = target.$get('data'))) {
            currentJSONData = TP.json2js(currentJSONData, false);
        } else if (TP.isValid(currentJSONData) &&
                !TP.isKindOf(currentJSONData, TP.dom.Node)) {
            currentJSONData = TP.json2js(TP.js2json(currentJSONData), false);
        }

        //  ---

        target.defineMethod(
            '$convertXMLValueDocToJSON',
            function(someTPXML) {
                var result;

                if (TP.isValid(
                    result = TP.$xml2jsonObj(TP.unwrap(someTPXML)))) {

                    //  Locally program a reference to ourself on the
                    //  generated XML TP.dom.Document.
                    someTPXML.defineAttribute('$$realData');
                    someTPXML.$set('$$realData', this);

                    //  NB: In our particular encoding of JS<->XML, we use
                    //  the 'rootObj' slot as a top-level value. See below.
                    return TP.json(result.rootObj);
                } else {
                    TP.ifWarn() ?
                        TP.warn(TP.annotate(
                                this,
                                'Unable to produce JSON data' +
                                ' for path: ' + this.get('srcPath'))) : 0;
                }
            });

        //  ---

        //  Define a local version of 'getData' to return the result of
        //  converting the entire XML data structure to a "plain" JavaScript
        //  object. Note that this is very rarely done - normally a 'slice' of
        //  the data will be retrieved by executing the path and just that slice
        //  will be converted.
        target.defineMethod(
            'getData',
            function() {
                var tpValueDoc,

                    ndx,
                    data,
                    snaps;

                if (this.$get('transactional')) {

                    ndx = this.$get('currentIndex');
                    snaps = this.$get('snaps');

                    //  NOTE:   we use $get here since we don't want to recurse
                    //  over getProperty() calls that use getNativeNode
                    if (TP.isValid(ndx)) {
                        data = snaps.at(ndx);
                    } else {
                        data = this.$get('data');
                    }

                    tpValueDoc = data;
                } else {
                    //  Retrieve the XML representation that is sitting in the
                    //  actual 'data' slot (using $get() to avoid getting
                    //  recursively called here).
                    tpValueDoc = this.$get('data');
                }

                if (TP.isValid(tpValueDoc)) {
                    return TP.json2js(
                            this.$convertXMLValueDocToJSON(tpValueDoc));
                }

                return;
            });

        //  ---

        //  Define a local version of 'setData' to set the supplied JavaScript
        //  Object data as an XML representation under the covers.
        target.defineMethod(
            'setData',
            function(aDataObject, shouldSignal) {
                var dataObj,

                    rootObj,
                    tpValueDoc;

                //  If the data we got handed is a String, then we need to parse
                //  it into a JS structure from the JSON. If a JS structure
                //  can't be produced from the String, then log an Error and
                //  return.
                if (TP.isString(aDataObject)) {
                    dataObj = JSON.parse(aDataObject);
                } else {
                    dataObj = aDataObject;
                }

                if (TP.notValid(dataObj)) {

                    //  Call 'up' to our super method.
                    this.callNextMethod(dataObj, shouldSignal);

                    return this;
                }

                //  We always place this behind a 'rootObj' slot - if the JSON
                //  describes a top-level Hash with multiple properties, then we
                //  need to have this anyway so that the XML can have a single
                //  root element. The TP.$jsonObj2xml() call will do this for us
                //  automatically, but we want to have a well-known handle.
                rootObj = {
                    rootObj: dataObj
                };
                tpValueDoc = TP.wrap(TP.$jsonObj2xml(rootObj));

                if (TP.isKindOf(tpValueDoc, TP.dom.DocumentNode)) {
                    //  Locally program a reference to ourself on the generated
                    //  XML TP.dom.Document.
                    tpValueDoc.defineAttribute('$$realData');
                    tpValueDoc.$set('$$realData', this);
                } else {
                    TP.ifWarn() ?
                        TP.warn(TP.annotate(
                                this,
                                'Unable to generate underlying XML data' +
                                ' for path: ' + this.get('srcPath'))) : 0;
                }

                //  Call 'up' to our super method to set the real underlying
                //  'data' slot to our XML data.
                this.callNextMethod(tpValueDoc, shouldSignal);

                return this;
            });

        //  ---

        //  Define a local version of 'changed' to cause the *underlying XML
        //  data representation* to signal Change (with the JSONPath as the
        //  aspect - yes, weird, but it works). Note the "this.$get('data')"
        //  here to get that XML representation.
        target.defineMethod(
            'changed',
            function(anAspect, anAction, aDescription) {

                var data;

                if (anAspect === 'value' || anAspect === 'currentIndex') {
                    return this.callNextMethod();
                }

                if (anAspect === 'data') {
                    return this.$changed(anAspect, anAction, aDescription);
                }

                if (TP.isValid(data = this.$get('data'))) {
                    return data.changed(anAspect, anAction, aDescription);
                }
            }, {
                patchCallee: true
            });

        //  ---

        target.defineMethod('CloneItem',
        function(aSignal) {

            var scope,
                scopeURI,

                source,

                index,

                targetElem;

            //  The 'scope' should be a URI location to find the overall
            //  collection to insert the item into. It should be either the whole
            //  collection representing the data of the receiver or a
            //  subcollection of that data.
            if (TP.isEmpty(scope = aSignal.at('scope'))) {
                return this.raise('TP.sig.InvalidParameter');
            }

            //  Make sure we can create a real URI from it.
            if (!TP.isURI(scopeURI = TP.uc(scope))) {
                return this.raise('TP.sig.InvalidURI');
            }

            source = aSignal.at('source');
            if (TP.notEmpty(source)) {
                source = TP.str(source.unquoted());
                source = TP.xpc(source);
            } else {
                source = TP.tpc(TP.str(aSignal.atIfInvalid('source', '[0]')));
            }

            //  Grab the index if one was specified in the signal.
            index = aSignal.at('index');
            if (index === TP.TARGET) {

                //  If the index was 'TP.TARGET', then we're going to use the
                //  'repeat index' of the target.
                targetElem = aSignal.at('trigger').getTarget();
                if (TP.isElement(targetElem)) {
                    index = TP.wrap(targetElem).$getNearestRepeatIndex();
                }
            } else {
                //  Otherwise, if the index is a Number, then we use. If not,
                //  then we set it to null, instructing the insertion method
                //  just use the end of the collection
                index = parseInt(index, 10);
                if (TP.isNaN(index)) {
                    index = null;
                }
            }

            //  Go ahead and insert the cloned data.
            this.insertRowIntoAt(
                    scopeURI,
                    source,
                    index,
                    aSignal.at('position'),
                    true,
                    true);

            return this;
        });

        //  ---

        //  Define a local version of 'insertRowIntoAt' to adjust for the fact
        //  that the indexes, etc. will be supplied using the 0-based indexes of
        //  JSON, but it is the underlying XML data representation that needs to
        //  be changed and, therefore, we need to adjust those indexes and use
        //  XPaths against that representation.
        target.defineMethod('insertRowIntoAt',
        function(aCollectionURIOrPath, aDataRowOrURIOrPath, anInsertIndex,
                 aPosition, shouldClone, shouldEmpty) {

            var targetURIOrPath,

                targetURI,
                publicURI,

                targetCollection,

                dataRow,

                fragmentExpr,

                xpath,

                queryURI,

                nodeName,

                insertIndex,

                insertionPath,

                newTPNode,

                changedAddresses,
                changedIndex,
                changedAspect,
                changedPaths,

                batchID;

            //  Obtain a URI that will be pointing at a collection.

            targetURIOrPath = aCollectionURIOrPath;
            publicURI = this.get('$publicURI');

            //  If targetURIOrPath is null or is not a TP.uri.URI (maybe its a
            //  path...), then set targetURI to publicURI (if its real).
            if (!TP.isURI(targetURIOrPath)) {

                //  publicURI isn't real - nothing to do here.
                if (!TP.isURI(publicURI)) {
                    //  TODO: Raise exception
                    return this;
                }

                targetURI = publicURI;
                if (targetURIOrPath.isAccessPath()) {

                    fragmentExpr = targetURIOrPath.asString();

                } else {
                    //  Not a real path either.
                    //  TODO: Raise exception
                    return this;
                }

            } else {

                //  A URI was supplied to begin with.
                targetURI = targetURIOrPath;

                fragmentExpr = targetURI.getFragmentExpr();
            }

            //  Grab the XPath version of the JSONPath that should be the
            //  fragment expression of the supplied URI.
            xpath = TP.path.JSONPath.asXPath(fragmentExpr);

            //  Grab the underlying XML data structure that we will manipulate.
            //  Note how we do this with a primitive call, so that we avoid
            //  registering XPath paths for the target object, which we
            //  definitely don't want.
            targetCollection = TP.wrap(TP.nodeEvaluateXPath(
                                        this.$get('data').getNativeNode(),
                                        xpath));

            if (TP.isURI(aDataRowOrURIOrPath)) {
                //  NB: We assume 'async' of false here.
                dataRow = aDataRowOrURIOrPath.getResource(
                                        TP.hc('async', false)).get('result');

            } else if (aDataRowOrURIOrPath.isAccessPath()) {

                queryURI = aCollectionURIOrPath;

                if (!TP.isURI(queryURI)) {

                    queryURI = publicURI;

                    //  Neither aCollectionURIOrPath or publicURI isn't real -
                    //  nothing to do here.
                    if (!TP.isURI(queryURI)) {
                        //  TODO: Raise exception
                        return this;
                    }
                }

                //  NB: We assume 'async' of false here.
                dataRow =
                    queryURI.getResource(
                        TP.hc('async', false)).get('result').get(
                                                    aDataRowOrURIOrPath);

            } else {
                dataRow = aDataRowOrURIOrPath;
            }

            //  If we have an empty collection, then we just use the name of the
            //  root node to populate children.
            if (targetCollection.isEmpty()) {
                nodeName = targetCollection.getLocalName();
            } else {
                nodeName = targetCollection.first().getLocalName();
            }

            //  If we got a JSON content object, then we want it's data.
            //  Otherwise, serialization will endlessly recurse because we don't
            //  have the underlying data.
            if (TP.isKindOf(dataRow, TP.core.JSONContent)) {
                dataRow = dataRow.get('data');
            }

            //  If it's a TP.core.Hash, then we want it as a POJO.
            if (TP.isHash(dataRow)) {
                dataRow = dataRow.asObject();
            }

            dataRow = TP.$jsonObj2xml(dataRow, nodeName);

            dataRow = TP.wrap(dataRow.documentElement);

            if (TP.isTrue(shouldClone)) {

                //  Get the item to clone and clone it.
                dataRow = dataRow.clone(true);

                if (TP.isTrue(shouldEmpty)) {
                    //  Clear out all of the 'text content' - that is, all of
                    //  the scalar values in the newly cloned item. This will
                    //  descend through the new item's data structure and
                    //  cleanse it all of previous values.
                    dataRow.clearTextContent();
                }
            }

            //  NB: The insertion index is computed to represent the row that
            //  will come *after* the new row after the insertion operation is
            //  complete (per 'insertBefore()' semantics).

            if (TP.isNumber(insertIndex = anInsertIndex)) {

                if (aPosition !== TP.BEFORE) {
                    insertIndex++;
                }

                //  We add 1 to account for indexing differences between
                //  JSONPath and XPath
                insertionPath = './*[' + (insertIndex + 1) + ']';

            } else {

                //  No index specified - we will be manipulating the end of the
                //  collection.
                if (aPosition === TP.BEFORE) {
                    insertionPath = './*[last()]';
                    insertIndex = targetCollection.getSize() - 1;
                } else {
                    //  Add one because the collection size isn't taking our new
                    //  size into account.
                    insertIndex = targetCollection.getSize();
                }
            }

            //  If the insertion path is not empty, that means that we're not
            //  just appending to the end.
            if (TP.notEmpty(insertionPath)) {
                newTPNode = targetCollection.insertRawContent(
                                    dataRow, insertionPath, null, false);
            } else {
                //  We're just appending to the end.
                newTPNode = targetCollection.addRawContent(
                                    dataRow, null, false);
            }

            //  Grab the address of the node that changed.
            changedAddresses = TP.ac(newTPNode.getDocumentPosition());

            //  And the index that changed.
            changedIndex = insertIndex;

            //  The aspect that changed is just the collection along with the
            //  index that changed.
            changedAspect = fragmentExpr + '[' + changedIndex + ']';

            //  Construct a 'changed paths' data structure that observers will
            //  expect to see.
            changedPaths =
                TP.hc(changedAspect, TP.hc(TP.INSERT, changedAddresses));

            //  We need this purely so that any machinery that relies on signal
            //  batching (i.e. the markup-based data binding) knows that this
            //  signal represents an entire batch.
            batchID = TP.genID('SIGNAL_BATCH');

            TP.signal(this.getID(),
                        'TP.sig.StructureInsert',
                        TP.hc('action', TP.INSERT,
                                'addresses', changedAddresses,
                                'aspect', changedAspect,
                                'facet', 'value',
                                TP.CHANGE_PATHS, changedPaths,
                                'target', this,
                                'indexes', TP.ac(changedIndex),
                                TP.CHANGE_URIS, null,
                                TP.START_SIGNAL_BATCH, batchID,
                                TP.END_SIGNAL_BATCH, batchID));

            return this;
        });

        //  ---

        //  Define a local version of 'removeRowFromAt' to adjust for the fact
        //  that the indexes, etc. will be supplied using the 0-based indexes of
        //  JSON, but it is the underlying XML data representation that needs to
        //  be changed and, therefore, we need to adjust those indexes and use
        //  XPaths against that representation.
        target.defineMethod('removeRowFromAt',
        function(aCollectionURI, aDeleteIndex) {

            var xpath,
                targetCollection,

                preDeleteSize,

                deleteIndexes,
                deletionPath,

                deleteIndex,
                i,

                path,

                removedData,

                changedAddresses,
                changedIndex,
                changedAspect,
                changedPaths,

                batchID;

            //  Grab the XPath version of the JSONPath that should be the
            //  fragment expression of the supplied URI.
            xpath = TP.path.JSONPath.asXPath(aCollectionURI.getFragmentExpr());

            //  Grab the underlying XML data structure that we will manipulate.
            //  Note how we do this with a primitive call, so that we avoid
            //  registering XPath paths for the target object, which we
            //  definitely don't want.
            targetCollection = TP.wrap(TP.nodeEvaluateXPath(
                                        this.$get('data').getNativeNode(),
                                        xpath));

            preDeleteSize = targetCollection.getSize();

            //  Compute an XPath to do the deletion. Note that the numbers
            //  contained in 'deleteIndexes' will always be 0-based whereas the
            //  expression will be built using 1-based.

            //  If a deletion index was supplied or we have numbers in our
            //  selection indexes, then use those as the deletion indexes. Note
            //  that, as we build up the XPath expression, we have to shift
            //  these numbers by 1 to accomodate XPath's 1-based-ness.
            if (TP.isNumber(aDeleteIndex)) {

                deletionPath = './*[' + (aDeleteIndex + 1) + ']';

                deleteIndexes = TP.ac(aDeleteIndex);
            } else if (TP.notEmpty(
                            deleteIndexes = this.get('selectionIndexes'))) {

                deletionPath = './*[';

                for (i = 0; i < deleteIndexes.getSize(); i++) {
                    //  Add 1 for XPath
                    deleteIndex = deleteIndexes.at(i) + 1;
                    deletionPath += 'position = ' + deleteIndex + ' or ';
                }

                deletionPath = deletionPath.slice(0, -4) + ']';
            } else {

                //  Otherwise, just delete the last item.
                deletionPath = './*[last()]';

                //  Allocate and push a Number representing the end of the
                //  collection separately to avoid oldtime JS behavior around an
                //  Array with a single Number as its argument.
                deleteIndexes = TP.ac();

                deleteIndexes.push(preDeleteSize - 1);
            }

            path = TP.xpc(deletionPath);

            removedData = path.exec(targetCollection, false);
            removedData = TP.$xml2jsonObj(removedData);
            removedData = TP.json2js(TP.json(removedData));

            //  Create an XPathPath object from the computed path and execute a
            //  delete. Note here how we supply 'false' as to whether we want
            //  the path machinery to signal a change. We'll do that here.
            changedAddresses = path.execRemove(targetCollection, false);

            //  And the first index that changed.
            changedIndex = deleteIndexes.first();

            //  The aspect that changed is just the collection along with the
            //  index that changed (using the JSON compatible index, not the
            //  XPath compatible one).
            changedAspect =
                    aCollectionURI.getFragmentExpr() +
                    '[' + changedIndex + ']';

            //  Construct a 'changed paths' data structure that observers will
            //  expect to see.
            changedPaths =
                TP.hc(changedAspect, TP.hc(TP.DELETE, changedAddresses));

            //  We need this purely so that any machinery that relies on signal
            //  batching (i.e. the markup-based data binding) knows that this
            //  signal represents an entire batch.
            batchID = TP.genID('SIGNAL_BATCH');

            TP.signal(this.getID(),
                        'TP.sig.StructureDelete',
                        TP.hc('action', TP.DELETE,
                                'addresses', changedAddresses,
                                'aspect', changedAspect,
                                'facet', 'value',
                                TP.CHANGE_PATHS, changedPaths,
                                'target', this,
                                'indexes', deleteIndexes,
                                'removedData', removedData,
                                TP.CHANGE_URIS, null,
                                TP.START_SIGNAL_BATCH, batchID,
                                TP.END_SIGNAL_BATCH, batchID));

            return this;
        });

        //  ---

        target.defineMethod(
            'snapshotData',
            function() {
                var tpValueDoc;

                tpValueDoc = this.$get('data');

                if (TP.isKindOf(tpValueDoc, TP.dom.DocumentNode)) {
                    return tpValueDoc.clone(true, true);
                }
            });

        //  ---

        //  Now that we've redefined setData(), push the current data back
        //  through it, causing the XML representation to be created.

        //  Note here how we pass 'false' to not signal change, since all we're
        //  doing is a data conversion.
        target.set('data', currentJSONData, false);

        //  Now, retrieve the XML representation that is sitting in the actual
        //  'data' slot (using $get() to bypass the redefined getData() call
        //  above).
        tpXMLDoc = target.$get('data');
    }

    //  Make sure that we're holding wrapped XML node
    if (!TP.isValid(tpXMLDoc)) {
        return this.raise('JSONPathException',
            'Unable to convert to internal rep for JSONPath execution.');
    }

    srcPath = this.get('srcPath');

    //  If the path is empty or just '$', then that's the shortcut to just
    //  return the target object itself.
    if (TP.isEmpty(srcPath) || srcPath === '$') {
        return target;
    }

    //  If we don't have a valid XPath representation of ourself, then try to
    //  build one.
    if (TP.notValid(xmlPath = this.get('$xmlPath'))) {

        //  Grab ourself as an XPath - if we're a templated path, we get 'fully
        //  realized' here.
        if (TP.regex.HAS_ACP.test(srcPath)) {

            //  Grab the arguments and slice the first one off (we're not going
            //  to use it)
            args = TP.args(arguments, 1);

            //  Build an XPath version of ourself with the template arguments.
            //  This won't be cached, since templated paths aren't.
            xmlPath = this.$setupXMLPath(args);
        } else {
            //  Build an XPath version of ourself. Since it's not templated,
            //  this will be cached and will only happen once.
            xmlPath = this.$setupXMLPath();
        }
    }

    //  Execute the actual get through the XML document
    retVal = xmlPath.executeGet(tpXMLDoc);

    //  If we got a valid value back, then convert it using our internal XML to
    //  JavaScript object (JSON friendly) conversion routine.
    if (TP.isValid(retVal)) {

        //  If it's an Array, then convert each value.
        if (TP.isArray(retVal)) {
            retVal = retVal.convert(
                            function(item) {
                                var result,
                                    resultKeys;

                                result = TP.$xml2jsonObj(item);
                                resultKeys = TP.objectGetKeys(result);

                                //  If the converted data structure only has 1
                                //  key, then return the object at that key.
                                if (resultKeys.length === 1) {
                                    return result[resultKeys[0]];
                                }

                                return result;
                            });

            //  Because the conversion process will always yield an Array, make
            //  sure to collapse it so that, if there's only one item in the
            //  Array, that item is used as the return value.
            retVal = TP.collapse(retVal);

        } else if (TP.isNode(retVal)) {

            retVal = TP.$xml2jsonObj(retVal);
            retValKeys = TP.objectGetKeys(retVal);

            //  If the converted data structure only has 1 key, then return the
            //  object at that key.
            if (retValKeys.length === 1) {
                retVal = retVal[retValKeys[0]];
            }
        }

        if (TP.isPlainObject(retVal)) {
            retVal = TP.hc(retVal);
        }

        //  Make sure to process the final value using converters, etc.
        //  configured for this object.
        return this.processFinalValue(retVal, target);
    }

    return null;
}, {
    patchCallee: false
});

//  -----------------------------------------------------------------------

TP.path.JSONPath.Inst.defineMethod('executeSet',
function(targetObj, attributeValue, shouldSignal, varargs) {

    /**
     * @method executeSet
     * @summary Executes the path in a 'set' fashion - i.e. with the intent of
     *     setting the supplied data into the supplied target object.
     * @param {targetObj} Object The object to execute the receiver against to
     *     set data.
     * @param {attributeValue} Object The object to use as the value to set
     *     into the target object.
     * @param {shouldSignal} Boolean If false, no signaling occurs. Defaults to
     *     targetObj.shouldSignalChange().
     * @param {arguments} varargs Any remaining arguments will be used as values
     *     for a templated substitution in the path itself.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidPath
     * @returns {TP.path.JSONPath} The receiver.
     */

    var srcPath,

        args,

        oldVal,

        tpXMLDoc,
        xmlPath,

        objVal,
        valueXMLDoc,
        attrVal;

    if (TP.notValid(targetObj)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  This kind of path will only work against TP.core.JSONContent objects
    if (!TP.isKindOf(targetObj, TP.core.JSONContent)) {
        return this.raise('TP.sig.InvalidPath');
    }

    //  This should create the XML representation and paths in ourself

    srcPath = this.get('srcPath');
    if (TP.regex.HAS_ACP.test(srcPath)) {
        //  Grab the arguments and slice the first three off (we're not
        //  going to use them)
        args = TP.args(arguments, 3);

        args.unshift(targetObj);
        oldVal = this.executeGet.apply(this, args);
    } else {
        oldVal = this.executeGet(targetObj);
    }

    //  If the old value is equal to the value that we're setting, then there
    //  is nothing to do here and we exit. This is important to avoid endless
    //  recursion when doing a 'two-ended bind' to data referenced by this
    //  path.
    //  Note that we handle empty Arrays specially here since, if we're not
    //  reducing Arrays, an empty Array handed in as the value will compare as
    //  'true' here and this routine will exit.
    if (TP.equal(oldVal, attributeValue)) {
        if (TP.isArray(attributeValue) && TP.isEmpty(attributeValue)) {
            void 0;
        } else {
            return oldVal;
        }
    }

    //  Make sure that we're holding wrapped XML node
    if (!TP.isValid(tpXMLDoc = targetObj.$get('data'))) {
        //  Raise an exception - this should've been created in the executeGet()
        //  method.
        return this.raise('TP.sig.InvalidParameter');
    }

    if (TP.notValid(xmlPath = this.get('$xmlPath'))) {

        //  Grab ourself as an XPath - if we're a templated path, we get 'fully
        //  realized' here.
        if (TP.regex.HAS_ACP.test(srcPath)) {

            //  We don't want the targetObject that we unshifted onto the front
            //  of this from above.
            args = args.slice(1);

            //  Build an XPath version of ourself with the template arguments.
            //  This won't be cached, since templated paths aren't.
            xmlPath = this.$setupXMLPath(args);
        } else {
            //  Build an XPath version of ourself. Since it's not templated,
            //  this will be cached and will only happen once.
            xmlPath = this.$setupXMLPath();
        }
    }

    //  If we were handed a Hash, then we need to convert the attribute value to
    //  a DocumentFragment that contains the individual hash items as little
    //  chunks of XML. Note that nested Hashes will be handled by the
    //  'finalizeSetValue()' call *inside* of the XML path's 'executeSet' call.
    if (TP.isHash(attributeValue)) {

        //  First, grab the native plain JS Object under the Hash, then run it
        //  through the conversion process.
        objVal = attributeValue.asObject();
        valueXMLDoc = TP.$jsonObj2xml(
            {
                rootObj: objVal
            });

        //  This will extract the child nodes as a DocumentFragment *and remove
        //  them from their current parent node*.
        attrVal = TP.nodeListAsFragment(valueXMLDoc.documentElement.childNodes);
    } else {
        attrVal = attributeValue;
    }

    //  If there are more than 3 args, then we have to gather them up,
    //  substitute the first two for the arguments that we computed here and
    //  apply.
    if (arguments.length > 3) {
        args = TP.args(arguments);
        args.atPut(0, tpXMLDoc);
        args.atPut(1, attrVal);

        xmlPath.executeSet.apply(xmlPath, args);
    } else {
        xmlPath.executeSet(tpXMLDoc, attrVal, shouldSignal);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.path.JSONPath.Inst.defineMethod('getPathParts',
function() {

    /**
     * @method getPathParts
     * @summary Returns the receiver's parts.
     * @returns {String[]} An Array of the receiver's parts.
     */

    return TP.getAccessPathParts(this.get('srcPath'), 'jpath');
});

//  ------------------------------------------------------------------------

TP.path.JSONPath.Inst.defineMethod('getPathType',
function() {

    /**
     * @method getPathType
     * @summary Returns the receiver's 'path type'.
     * @returns {String} A path type
     */

    return TP.JSON_PATH_TYPE;
});

//  ------------------------------------------------------------------------

TP.path.JSONPath.Inst.defineMethod('getPointerScheme',
function() {

    /**
     * @method getPointerScheme
     * @summary Returns the receiver's 'pointer scheme'.
     * @returns {String} An XPointer scheme depending on path type.
     */

    return 'jpath';
});

//  ------------------------------------------------------------------------

TP.path.JSONPath.Inst.defineMethod('set',
function(attributeName, attributeValue, shouldSignal) {

    /**
     * @method set
     * @summary Sets the value of the named attribute to the value provided. If
     *     no value is provided the value null is used.
     * @description This is overridden from its supertype to make sure to copy
     *     over attributes that also need to be populated onto the receiver's
     *     internal XPath.
     * @param {String|TP.path.AccessPath} attributeName The name of the
     *     attribute to set.
     * @param {Object} attributeValue The value to set.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {TP.core.Content} The receiver.
     */

    var xmlPath,
        mirroredAttrs;

    //  For certain properties we mirror their settings onto our internal
    //  xmlPath.
    mirroredAttrs = this.getType().get('$mirroredAttributes');
    if (TP.isValid(mirroredAttrs) && mirroredAttrs.contains(attributeName)) {
        if (TP.isValid(xmlPath = this.get('$xmlPath'))) {
            xmlPath.set(attributeName, attributeValue, shouldSignal);
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.path.JSONPath.Inst.defineMethod('$setupXMLPath',
function(templateArgs) {

    /**
     * @method $setupXMLPath
     * @summary Sets up an XML path for the receiver that will represent it when
     *     being executed an XML data source that is used by TP.core.JSONContent
     *     objects when they are accessed with a JSONPath.
     * @param {Object[]} templateArgs An optional Array of template arguments.
     *     If the receiver is a templated path, these values will be used to
     *     fill in the template values and the computed XPath will *not* be
     *     cached.
     * @returns {TP.path.XPathPath} The new instance of the computed XPath pate
     *     object.
     */

    var xPath,

        xmlPath,

        mirroredAttributes;

    xPath = this.getType().asXPath(this.get('srcPath'), templateArgs);

    xmlPath = TP.xpc(xPath);

    //  Configure this path with the same sorts of flags as we have. We have
    //  also overridden 'set()' on this type to do this whenever 'set()' is
    //  called.
    mirroredAttributes = this.getType().get('$mirroredAttributes');
    mirroredAttributes.perform(
        function(aProperty) {
            xmlPath.set(aProperty, this.get(aProperty));
        }.bind(this));

    //  Define a local version of '$$getContentForSetOperation' to massage
    //  the XML that will be being manipulated by the XPath.
    xmlPath.defineMethod('$$getContentForSetOperation',
        function(aNode, flagChanges) {

            var result,
                doc,

                newElems,

                pathParts;

            //  Allow the normal XPath path machinery to create the nodes
            //  that we need.
            result = this.callNextMethod();

            //  If we got real XML nodes built and returned to us, massage
            //  them into what we need for our special XML format.
            if (TP.notEmpty(result)) {

                doc = TP.doc(result.first());

                //  Find any new elements that were created
                newElems = TP.byCSSPath('*[tibet|crud*="create"]',
                                    doc,
                                    false,
                                    false);

                //  Split the path along '/' and shift the initial 'root'
                //  off of the path.
                pathParts = this.asString().split('/');
                pathParts.shift();

                newElems.perform(
                    function(anElem) {
                        var pathRef,
                            elemsWithSameName;

                        //  If the new element doesn't have a 'type'
                        //  attribute, then search *under* it (*child-level
                        //  only*) for any elements with the same name
                        if (!anElem.hasAttribute('type')) {

                            elemsWithSameName = TP.byCSSPath(
                                                '> ' + anElem.nodeName,
                                                anElem.parentNode,
                                                false,
                                                false);

                            //  If we found *child* elements with the same
                            //  name
                            if (TP.notEmpty(elemsWithSameName)) {

                                //  Get the part of the path that names the
                                //  same level that we're at by using the
                                //  element's position relative to it's
                                //  ancestor, which will (at least in a
                                //  simple path of names) be the name we're
                                //  interested in
                                pathRef = pathParts.at(
                                    TP.nodeGetAncestorPositions(
                                                    anElem).getSize());

                                //  if that piece of the path has a
                                //  'position' function call in a predicate,
                                //  then assume that the user really wants
                                //  this to be an Array
                                if (TP.notEmpty(pathRef) &&
                                    /position/.test(pathRef)) {
                                    anElem.parentNode.setAttribute(
                                                    'type', 'array');
                                } else {

                                    //  Otherwise, set it to be an Object
                                    //  structure.
                                    anElem.parentNode.setAttribute(
                                                    'type', 'object');
                                }
                            }

                            //  If the element is empty, then mark it as
                            //  'undefined'.
                            if (TP.isEmpty(anElem)) {
                                anElem.setAttribute('type', 'undefined');
                            }
                        }
                    });
            }

            return result;
        });

    //  Define a local version of 'finalizeSetValue' to convert JavaScript
    //  Object values into the proper XML structure.
    xmlPath.defineMethod(
            'finalizeSetValue',
            function(content, value) {

                var val,
                    nodeName,

                    theType;

                val = value;

                //  If it's an Array, convert to XML and then return the
                //  child node list as a fragment
                if (TP.isArray(val)) {

                    nodeName = content.nodeName;
                    val = TP.$jsonObj2xml(val, nodeName);
                    val = TP.nodeListAsFragment(
                                val.documentElement.childNodes);

                    //  Tag the content as being an 'array'
                    content.setAttribute('type', 'array');

                } else if (TP.isPlainObject(val)) {

                    //  Otherwise, if its a "plain" Object, return the root
                    //  node that was generated
                    nodeName = content.nodeName;
                    val = TP.$jsonObj2xml(val, nodeName);

                    //  Tag the content as being an 'object'
                    content.setAttribute('type', 'object');
                } else {
                    theType = typeof value;

                    //  null will report itself as undefined when using
                    //  'typeof' - we want to be more specific.
                    if (TP.isNull(value)) {
                        theType = 'null';
                    }

                    switch (theType) {
                        case 'undefined':
                        case 'null':
                        case 'boolean':
                        case 'number':
                        case 'string':
                            /* eslint-disable no-fallthrough */
                            val = TP.nodeGetDocument(content).createTextNode(
                                                                        value);
                            /* eslint-enable no-fallthrough */
                        case 'object':
                            //  Tag the content with the computed data type.
                            content.setAttribute('type', theType);
                            break;
                        default:
                            break;
                    }
                }

                return val;
            });

    xmlPath.defineMethod('valueIsStructural',
            function(content, value) {
                var typeAttr;

                if (TP.isElement(content)) {
                    typeAttr = content.getAttribute('type');

                    switch (typeAttr) {
                        case 'undefined':
                        case 'null':
                        case 'boolean':
                        case 'number':
                        case 'string':
                            return false;
                        default:
                            break;
                    }
                }

                return true;
            });

    xmlPath.defineMethod('$updateOpsBecomeDeleteInsertOps',
            function(aNode, prevNode) {

                var currentType,
                    prevType;

                //  If there was no previous content, then nothing to compare -
                //  just return false.
                if (!TP.isNode(prevNode)) {
                    return false;
                }

                //  Grab the 'type' for both the current and previous node
                currentType =
                    TP.elementGetAttribute(aNode, 'type', true);
                prevType =
                    TP.elementGetAttribute(prevNode, 'type', true);

                //  If its not the same type, then return true to turn the
                //  'update' into a 'delete'/'insert'.
                if (currentType !== prevType) {
                    return true;
                }

                if (currentType === 'array' ||
                    currentType === 'object' ||
                    prevType === 'array' ||
                    prevType === 'object') {
                    return true;
                }

                return false;
            });

    xmlPath.defineMethod('updateRegistrationsAfterSignaling',
            function(targetObj) {

                var observedAddresses,

                    executedPaths,

                    invalidatedPaths,
                    invalidInternalPaths,

                    jsonObj,

                    addressesToRemove;

                observedAddresses =
                    TP.path.AccessPath.$getObservedAddresses().at(
                                        TP.id(targetObj));

                if (TP.isEmpty(observedAddresses)) {
                    return this;
                }

                addressesToRemove = this.get('$addressesToRemove');

                //  Remove old addresses that are now no longer valid (since we
                //  signaled them with a TP.DELETE). If we created structure as
                //  well (i.e. replaced one tree with another tree), then
                //  executing the 'get' below will repopulate this with
                //  addresses that are still valid.
                observedAddresses.removeKeys(addressesToRemove);

                executedPaths = TP.path.AccessPath.$getExecutedPaths().at(
                                        TP.id(targetObj));

                invalidatedPaths = this.get('$invalidatedPaths');

                if (TP.notEmpty(invalidatedPaths)) {

                    //  Copy the currently invalidated paths Array and convert
                    //  the items in that Array to their XPath equivalent -
                    //  that's what will be found in the executedPaths
                    invalidInternalPaths = invalidatedPaths.copy();
                    invalidInternalPaths.convert(
                            function(aJSONPath) {
                                return TP.path.JSONPath.asXPath(aJSONPath);
                            });

                    //  Remove the matching paths that were invalid from the
                    //  executed paths. Again, if we created structure, then
                    //  executing the 'get' below will repopulate this with
                    //  paths that are still valid.
                    executedPaths.removeAtAll(invalidInternalPaths);

                    //  Grab the original JSON object that 'get's will be
                    //  executed against. This is programmed as a local slot on
                    //  the object itself in the code above.
                    jsonObj = targetObj.get('$$realData');

                    //  Now, we need to go through the invalidated paths and
                    //  rerun their 'get' to re-execute and re-register their
                    //  path.
                    invalidatedPaths.perform(
                            function(aPath) {
                                TP.apc(aPath).executeGet(jsonObj);
                            });

                    invalidatedPaths.empty();
                }

                addressesToRemove.empty();
            });

    //  Cache our internal XPath representation, but only if we weren't a
    //  templated path.
    if (!TP.regex.HAS_ACP.test(this.get('srcPath'))) {
        this.set('$xmlPath', xmlPath);
    }

    //  Set our string representation as the 'interested path' representation
    //  for use during change notification.
    xmlPath.set('$interestedPath', this.asString());

    return xmlPath;
}, {
    patchCallee: false
});

//  ========================================================================
//  TP.path.SimpleTIBETPath
//  ========================================================================

/**
 * @type {TP.path.SimpleTIBETPath}
 */

//  ------------------------------------------------------------------------

TP.path.AccessPath.defineSubtype('SimpleTIBETPath');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.path.SimpleTIBETPath.Type.defineAttribute('$traversalLevel');
TP.path.SimpleTIBETPath.Type.defineAttribute('$prefixParts');

TP.path.SimpleTIBETPath.Type.defineAttribute('$currentSource');
TP.path.SimpleTIBETPath.Type.defineAttribute('$currentPath');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.path.SimpleTIBETPath.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    this.Type.set('$traversalLevel', 0);
    this.Type.set('$prefixParts', TP.ac());

    return;
});

//  ------------------------------------------------------------------------

TP.path.SimpleTIBETPath.Type.defineMethod('endChangedAddress',
function() {

    /**
     * @method endChangedAddress
     * @returns {TP.meta.path.SimpleTIBETPath} The receiver.
     */

    this.get('$prefixParts').pop();

    return this;
});

//  ------------------------------------------------------------------------

TP.path.SimpleTIBETPath.Type.defineMethod('endObservedAddress',
function() {

    /**
     * @method endObservedAddress
     * @returns {TP.meta.path.SimpleTIBETPath} The receiver.
     */

    var srcObj;

    srcObj = TP.path.SimpleTIBETPath.get('$currentSource');
    if (TP.owns(srcObj, '$$noPathTracking')) {
        return this;
    }

    this.get('$prefixParts').pop();

    return this;
});

//  ------------------------------------------------------------------------

TP.path.SimpleTIBETPath.Type.defineMethod('getChangedAddress',
function() {

    /**
     * @method getChangedAddress
     * @returns {String}
     */

    //  Note here the conversion from 'foo.[1]' to 'foo[1]'
    return this.get('$prefixParts').join('.').replace(/\.\[/g, '[');
});

//  ------------------------------------------------------------------------

TP.path.SimpleTIBETPath.Type.defineMethod('startChangedAddress',
function(addressPart) {

    /**
     * @method startChangedAddress
     * @param {String} addressPart
     * @returns {TP.meta.path.SimpleTIBETPath} The receiver.
     */

    var prefixParts;

    prefixParts = this.get('$prefixParts');

    prefixParts.push(addressPart);

    return this;
});

//  ------------------------------------------------------------------------

TP.path.SimpleTIBETPath.Type.defineMethod('startObservedAddress',
function(addressPart) {

    /**
     * @method startObservedAddress
     * @param {String} addressPart
     * @returns {TP.meta.path.SimpleTIBETPath} The receiver.
     */

    var srcObj,

        prefixParts,

        sourceObjectID,
        srcPath,

        address;

    srcObj = TP.path.SimpleTIBETPath.get('$currentSource');
    if (TP.owns(srcObj, '$$noPathTracking')) {
        return this;
    }

    prefixParts = this.get('$prefixParts');

    prefixParts.push(addressPart);

    //  Note here the conversion from 'foo.[1]' to 'foo[1]'
    address = prefixParts.join('.').replace(/\.\[/g, '[');

    srcPath = TP.path.SimpleTIBETPath.get('$currentPath').get('srcPath');

    //  Note here the conversion from 'foo.[1]' to 'foo[1]'
    srcPath = srcPath.replace(/\.\[/g, '[');

    //  Grab the ID of the current source object
    sourceObjectID = TP.id(srcObj);

    this.registerObservedAddress(address, sourceObjectID, srcPath);

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Whether or not the receiver 'created structure' on it's latest run. This is
//  reset after each 'setter run' of the path.
TP.path.SimpleTIBETPath.Inst.defineAttribute('$createdStructure');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.path.SimpleTIBETPath.Inst.defineMethod('init',
function(aPath, config) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {String} aPath The String to build the instance from.
     * @param {TP.core.Hash} config The configuration for this path.
     * @returns {TP.path.SimpleTIBETPath} The receiver.
     */

    var path;

    //  Make sure that any 'access path' scheme is stripped off
    if (TP.regex.TIBET_POINTER.test(aPath)) {
        path = TP.regex.TIBET_POINTER.match(aPath).at(1);
    } else {
        path = aPath;
    }

    this.callNextMethod(path, config);

    if (TP.isHash(config)) {
        this.set('shouldCollapse', config.atIfInvalid('shouldCollapse', true));
    } else {
        this.set('shouldCollapse', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.path.SimpleTIBETPath.Inst.defineMethod('executeGet',
function(targetObj, varargs) {

    /**
     * @method executeGet
     * @summary Returns the result of executing the path in a 'get' fashion -
     *     i.e. with the intent of retrieving data from the supplied target
     *     object.
     * @param {targetObj} Object The object to execute the receiver against to
     *     get data.
     * @param {arguments} varargs The arguments to execute the get with. The
     *     first argument should be the object to execute the receiver against
     *     to retrieve data. Any remaining arguments will be used as values for
     *     a templated substitution in the path itself.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidPath
     * @returns {Object} The result of executing a 'get' against the target
     *     object using the receiver.
     */

    var args,

        path,
        srcPath,

        retVal;

    if (TP.notValid(targetObj)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  This kind of path won't work against native XML (but will against
    //  wrapped XML).
    if (TP.isNode(targetObj)) {
        return this.raise('TP.sig.InvalidPath');
    }

    //  Fill in any templated expressions in the path (which must be numeric
    //  positions) with data from the passed arguments.
    srcPath = this.get('srcPath');

    //  If the path is empty or just '.', then that's the shortcut to just
    //  return the target object itself.
    if (TP.isEmpty(srcPath) || TP.regex.ONLY_PERIOD.test(srcPath)) {
        return targetObj;
    }

    path = srcPath;

    if (TP.regex.HAS_ACP.test(path)) {
        //  Grab the arguments and slice the first one off (since it's the
        //  targetObj, which we already have).
        args = TP.args(arguments, 1);

        path = path.transform(args);
    }

    //  Trigger the actual 'get' mechanism, tracking addresses as we go.

    this.preGetAccess(targetObj);

    //  NB: We use the original source path to register with the address change
    //  notification mechanism
    this.getType().startObservedAddress(srcPath);

    //  If the path is something like '[0]', then slice off the brackets to
    //  just produce '0'.
    if (TP.regex.SIMPLE_NUMERIC_PATH.test(path)) {
        path = path.slice(1, -1);
    }

    retVal = targetObj.get(path);

    this.getType().endObservedAddress();

    this.postGetAccess(targetObj);

    return this.processFinalValue(retVal, targetObj);
});

//  -----------------------------------------------------------------------

TP.path.SimpleTIBETPath.Inst.defineMethod('executeSet',
function(targetObj, attributeValue, shouldSignal, varargs) {

    /**
     * @method executeSet
     * @summary Executes the path in a 'set' fashion - i.e. with the intent of
     *     setting the supplied data into the supplied target object.
     * @param {targetObj} Object The object to execute the receiver against to
     *     set data.
     * @param {attributeValue} Object The object to use as the value to set
     *     into the target object.
     * @param {shouldSignal} Boolean If false, no signaling occurs. Defaults to
     *     targetObj.shouldSignalChange().
     * @param {arguments} varargs Any remaining arguments will be used as values
     *     for a templated substitution in the path itself.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidPath
     * @returns {Object} The result of executing a 'set' against the target
     *     object using the receiver.
     */

    var srcPath,
        path,

        thisType,

        oldVal,

        op,

        args,

        retVal,
        traversalLevel,

        executedPaths,

        obsAddresses,

        sigFlag,

        mutatedStructure;

    if (TP.notValid(targetObj)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  This kind of path won't work against native XML (but will against
    //  wrapped XML).
    if (TP.isNode(targetObj)) {
        return this.raise('TP.sig.InvalidPath');
    }

    srcPath = this.get('srcPath');
    path = srcPath;

    thisType = this.getType();

    if (TP.notValid(attributeValue)) {
        op = TP.DELETE;
    } else if (TP.isDefined(oldVal = targetObj.get(srcPath))) {
        op = TP.UPDATE;
    } else {
        op = TP.CREATE;
        //  Make sure to let this path know that we created structure - this
        //  makes a difference when signaling change if we're being used as part
        //  of an over 'complex' TIBET path.
        this.set('$createdStructure', true);
    }

    //  If the old value is equal to the value that we're setting, then there
    //  is nothing to do here and we exit. This is important to avoid endless
    //  recursion when doing a 'two-ended bind' to data referenced by this
    //  path.
    if (TP.equal(oldVal, attributeValue)) {
        return oldVal;
    }

    if (TP.regex.HAS_ACP.test(path)) {
        //  Grab the arguments and slice the first three off (since they're
        //  targetObj, attributeValue and shouldSignal which we already have).
        args = TP.args(arguments, 3);

        path = path.transform(args);
    }

    traversalLevel = TP.path.SimpleTIBETPath.get('$traversalLevel');
    if (traversalLevel === 0) {

        //  Empty the changed addresses before we start another run.
        TP.path.AccessPath.$getChangedAddresses().empty();
    }

    //  Trigger the actual 'set' mechanism, tracking changed addresses as we
    //  go.

    this.preSetAccess(targetObj);

    //  NB: We use the original source path to register with the address change
    //  notification mechanism
    thisType.startChangedAddress(srcPath);

    //  If the path is something like '[0]', then slice off the brackets to
    //  just produce '0'.
    if (TP.regex.SIMPLE_NUMERIC_PATH.test(path)) {
        path = path.slice(1, -1);
    }

    //  If we're doing a TP.UPDATE, but we're replacing something that has
    //  structure (i.e. it's not just a scalar value), then we change to
    //  registering a TP.DELETE, followed by a TP.CREATE for that.
    if (op === TP.UPDATE && TP.isReferenceType(oldVal)) {
        thisType.registerChangedAddress(thisType.getChangedAddress(),
                                        TP.DELETE);
        thisType.registerChangedAddress(thisType.getChangedAddress(),
                                        TP.CREATE);
    } else {
        thisType.registerChangedAddress(thisType.getChangedAddress(), op);
    }

    //  Note here how we always do the set with a 'false' and then send a
    //  'changed' message later with additional information. We also pass a
    //  second 'false' to avoid warnings on undeclared attributes.

    //  If it's not a hash, then define it as an attribute. A 'set()' on a hash
    //  will do an atPut().
    if (!TP.isKindOf(targetObj, TP.core.Hash)) {
        targetObj.defineAttribute(path);
    }
    retVal = targetObj.set(path, attributeValue, false);

    thisType.endChangedAddress();

    this.postSetAccess(targetObj);

    //  We're all done - acquire the traversal level again. We have to do this
    //  a second time, since the pre/post calls manipulate it.
    traversalLevel = TP.path.SimpleTIBETPath.get('$traversalLevel');

    if (traversalLevel === 0) {

        //  If we 'created structure', that means that all of the previously
        //  executed paths need to be run, because they could now refer to new
        //  addresses.
        if (this.get('$createdStructure')) {
            executedPaths = TP.path.AccessPath.$getExecutedPaths().at(
                                    TP.id(targetObj));

            if (TP.notEmpty(executedPaths)) {
                obsAddresses = TP.path.AccessPath.$getObservedAddresses().at(
                                                TP.id(targetObj));
                if (TP.notEmpty(obsAddresses)) {
                    obsAddresses.empty();
                }

                executedPaths.perform(
                        function(pathEntry) {
                            pathEntry.last().executeGet(targetObj);
                        });
            }
        }

        if (TP.isValid(shouldSignal)) {
            sigFlag = shouldSignal;
        } else if (TP.isValid(targetObj)) {
            sigFlag = targetObj.shouldSignalChange();
        }

        if (sigFlag) {

            mutatedStructure = TP.isReferenceType(attributeValue);

            if (mutatedStructure) {
                this.updateRegistrationsBeforeSignaling(targetObj);
            }

            //  Send the changed signal
            this.sendChangedSignal(targetObj);

            if (mutatedStructure) {
                this.updateRegistrationsAfterSignaling(targetObj);
            }
        }
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.path.SimpleTIBETPath.Inst.defineMethod('getFirstSimplePath',
function() {

    /**
     * @method getFirstSimplePath
     * @summary Returns the first 'simple path' of the receiver. For instance,
     *     in a simple path such as '1.2.3', this method will return '1'.
     * @returns {String} The first simple path of the receiver.
     */

    //  For simple paths, our whole path is the first simple path.
    return this.get('srcPath');
});

//  ------------------------------------------------------------------------

TP.path.SimpleTIBETPath.Inst.defineMethod('getPathParts',
function() {

    /**
     * @method getPathParts
     * @summary Returns the receiver's parts.
     * @returns {String[]} An Array of the receiver's parts.
     */

    return TP.getAccessPathParts(this.get('srcPath'), 'tibet');
});

//  ------------------------------------------------------------------------

TP.path.SimpleTIBETPath.Inst.defineMethod('getPathType',
function() {

    /**
     * @method getPathType
     * @summary Returns the receiver's 'path type'.
     * @returns {String} A path type
     */

    return TP.TIBET_PATH_TYPE;
});

//  ------------------------------------------------------------------------

TP.path.SimpleTIBETPath.Inst.defineMethod('getPointerScheme',
function() {

    /**
     * @method getPointerScheme
     * @summary Returns the receiver's 'pointer scheme'.
     * @returns {String} An XPointer scheme depending on path type.
     */

    return 'tibet';
});

//  ------------------------------------------------------------------------

TP.path.SimpleTIBETPath.Inst.defineMethod('preGetAccess',
function(targetObj) {

    /**
     * @method preGetAccess
     * @param {targetObj} Object
     * @returns {TP.path.SimpleTIBETPath} The receiver.
     */

    var executedPaths;

    executedPaths = TP.path.AccessPath.$getExecutedPaths().atPutIfAbsent(
                    TP.id(targetObj),
                    TP.hc());

    executedPaths.atPut(this.get('srcPath'), this);

    TP.path.SimpleTIBETPath.set(
        '$currentSource',
        TP.ifInvalid(
            TP.path.SimpleTIBETPath.get('$currentSource'), targetObj));
    TP.path.SimpleTIBETPath.set(
        '$currentPath',
        TP.ifInvalid(
            TP.path.SimpleTIBETPath.get('$currentPath'), this));

    TP.path.SimpleTIBETPath.set(
        '$traversalLevel',
        TP.path.SimpleTIBETPath.get('$traversalLevel') + 1);

    return this;
});

//  ------------------------------------------------------------------------

TP.path.SimpleTIBETPath.Inst.defineMethod('preSetAccess',
function(targetObj) {

    /**
     * @method preSetAccess
     * @param {targetObj} Object
     * @returns {TP.path.SimpleTIBETPath} The receiver.
     */

    TP.path.SimpleTIBETPath.set(
        '$traversalLevel',
        TP.path.SimpleTIBETPath.get('$traversalLevel') + 1);

    return this;
});

//  ------------------------------------------------------------------------

TP.path.SimpleTIBETPath.Inst.defineMethod('postGetAccess',
function(targetObj) {

    /**
     * @method postGetAccess
     * @param {targetObj} Object
     * @returns {TP.path.SimpleTIBETPath} The receiver.
     */

    var traversalLevel;

    traversalLevel = TP.path.SimpleTIBETPath.get('$traversalLevel') - 1;

    TP.path.SimpleTIBETPath.set('$traversalLevel', traversalLevel);

    if (traversalLevel === 0) {
        TP.path.SimpleTIBETPath.set('$currentSource', null);
        TP.path.SimpleTIBETPath.set('$currentPath', null);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.path.SimpleTIBETPath.Inst.defineMethod('postSetAccess',
function(targetObj) {

    /**
     * @method postSetAccess
     * @param {targetObj} Object
     * @returns {TP.path.SimpleTIBETPath} The receiver.
     */

    var traversalLevel;

    traversalLevel = TP.path.SimpleTIBETPath.get('$traversalLevel') - 1;

    TP.path.SimpleTIBETPath.set('$traversalLevel', traversalLevel);

    return this;
});

//  ========================================================================
//  TP.path.ComplexTIBETPath
//  ========================================================================

/**
 * @type {TP.path.ComplexTIBETPath}
 */

//  ------------------------------------------------------------------------

TP.path.SimpleTIBETPath.defineSubtype('ComplexTIBETPath');

//  ------------------------------------------------------------------------

//  avoid binding and apply issues by creating our alias as a wrapper
TP.definePrimitive('tpc',
function(aPath, config) {

    /**
     * @method tpc
     * @summary Returns a newly initialized SimpleTIBETPath or ComplexTIBETPath
     *     instance.
     * @param {String} aPath The path as a String.
     * @param {TP.core.Hash} config The configuration for this path.
     * @returns {TP.path.SimpleTIBETPath|TP.path.ComplexTIBETPath} The new
     *     instance.
     */

    var path;

    //  Make sure that any 'access path' scheme is stripped off
    if (TP.regex.TIBET_POINTER.test(aPath)) {
        path = TP.regex.TIBET_POINTER.match(aPath).at(1);
    } else {
        path = aPath;
    }

    //  If there is no 'path punctuation' (only JS identifer characters), or
    //  it's a simple numeric path like '2' or '[2]', that means it's a 'simple
    //  path'.
    //  TODO: This is hacky - figure out how to combine them into one RegExp.
    if (TP.regex.JS_IDENTIFIER.test(path) ||
        TP.regex.ONLY_NUM.test(path) ||
        TP.regex.ONLY_PERIOD.test(path) ||
        TP.regex.SIMPLE_NUMERIC_PATH.test(path)) {
        return TP.path.SimpleTIBETPath.construct.apply(
                        TP.path.SimpleTIBETPath, arguments);
    }

    //  Otherwise, if it has 'TIBETan' access path characters, create a TIBET
    //  path to deal with it.
    if (TP.regex.TIBET_PATH.test(path)) {
        return TP.path.ComplexTIBETPath.construct.apply(
                            TP.path.ComplexTIBETPath, arguments);
    }

    return null;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The transformed path we actually execute - it may have templated
//  expressions.
TP.path.ComplexTIBETPath.Inst.defineAttribute('$transformedPath');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.path.ComplexTIBETPath.Inst.defineMethod('init',
function(aPath, config) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {String} aPath The String to build the instance from.
     * @param {TP.core.Hash} config The configuration for this path.
     * @returns {TP.path.ComplexTIBETPath} The receiver.
     */

    var path;

    //  Make sure that any 'access path' scheme is stripped off
    if (TP.regex.TIBET_POINTER.test(aPath)) {
        path = TP.regex.TIBET_POINTER.match(aPath).at(1);
    } else {
        path = aPath;
    }

    return this.callNextMethod(path, config);
});

//  ------------------------------------------------------------------------

TP.path.ComplexTIBETPath.Inst.defineMethod('checkValueEquality',
function(objectA, objectB) {

    /**
     * @method checkValueEquality.
     * @summary Checks to see if the two supplied parameters 'lead to' equal
     *     values. This is used when trying to determine whether or not to
     *     proceed with a 'set' operation (and broadcast changes).
     * @description This method takes into account the kind of data that this
     *     path manages when doing it's comparison.
     * @param {objectA} Object The first object to compare.
     * @param {objectB} Object The second object to compare.
     * @returns {Boolean} Whether or not the two values are equal.
     */

    if (TP.isArray(objectA) && objectA.getSize() === 1) {
        return TP.equal(objectA.first(), objectB);
    }

    if (TP.isArray(objectB) && objectB.getSize() === 1) {
        return TP.equal(objectA, objectB.first());
    }

    return TP.equal(objectA, objectB);
});

//  ------------------------------------------------------------------------

TP.path.ComplexTIBETPath.Inst.defineMethod('executeGet',
function(targetObj, varargs) {

    /**
     * @method executeGet
     * @summary Returns the result of executing the path in a 'get' fashion -
     *     i.e. with the intent of retrieving data from the supplied target
     *     object.
     * @param {targetObj} Object The object to execute the receiver against to
     *     get data.
     * @param {arguments} varargs The arguments to execute the get with. The
     *     first argument should be the object to execute the receiver against
     *     to retrieve data. Any remaining arguments will be used as values for
     *     a templated substitution in the path itself.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidPath
     * @returns {Object} The result of executing a 'get' against the target
     *     object using the receiver.
     */

    var args,

        srcPath,
        path,

        retVal;

    if (TP.notValid(targetObj)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  This kind of path won't work against native XML (but will against
    //  wrapped XML).
    if (TP.isNode(targetObj)) {
        return this.raise('TP.sig.InvalidPath');
    }

    this.preGetAccess(targetObj);

    //  Fill in any templated expressions in the path (which must be numeric
    //  positions) with data from the passed arguments.
    srcPath = this.get('srcPath');

    //  If the path is empty or just '.', then that's the shortcut to just
    //  return the target object itself.
    if (TP.isEmpty(srcPath) || TP.regex.ONLY_PERIOD.test(srcPath)) {
        return targetObj;
    }

    path = srcPath;

    if (TP.regex.HAS_ACP.test(path)) {
        //  Grab the arguments and slice the first one off (since it's the
        //  targetObj, which we already have).
        args = TP.args(arguments, 1);

        path = path.transform(args);
    }
    this.set('$transformedPath', path);

    if (TP.isString(targetObj)) {
        retVal = this.$executeStringGet(targetObj);
    } else if (TP.isArray(targetObj)) {
        retVal = this.$executeArrayGet(targetObj);
    } else {
        retVal = this.$executeObjectGet(targetObj);
    }

    this.postGetAccess(targetObj);

    return this.processFinalValue(retVal, targetObj);
});

//  ------------------------------------------------------------------------

TP.path.ComplexTIBETPath.Inst.defineMethod('executeSet',
function(targetObj, attributeValue, shouldSignal, varargs) {

    /**
     * @method executeSet
     * @summary Executes the path in a 'set' fashion - i.e. with the intent of
     *     setting the supplied data into the supplied target object.
     * @param {targetObj} Object The object to execute the receiver against to
     *     set data.
     * @param {attributeValue} Object The object to use as the value to set
     *     into the target object.
     * @param {shouldSignal} Boolean If false, no signaling occurs. Defaults to
     *     targetObj.shouldSignalChange().
     * @param {arguments} varargs Any remaining arguments will be used as values
     *     for a templated substitution in the path itself.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidPath
     * @returns {Object} The result of executing a 'set' against the target
     *     object using the receiver.
     */

    var srcPath,
        path,

        args,

        retVal,
        traversalLevel,
        oldVal,

        executedPaths,
        obsAddresses,

        sigFlag,

        mutatedStructure;

    if (TP.notValid(targetObj)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  This kind of path won't work against native XML (but will against
    //  wrapped XML).
    if (TP.isNode(targetObj)) {
        return this.raise('TP.sig.InvalidPath');
    }

    //  Fill in any templated expressions in the path (which must be numeric
    //  positions) with data from the passed arguments.
    srcPath = this.get('srcPath');
    path = srcPath;

    if (TP.regex.HAS_ACP.test(path)) {
        //  Grab the arguments and slice the first three off (since they're
        //  targetObj, attributeValue and shouldSignal which we already have).
        args = TP.args(arguments, 3);

        path = path.transform(args);
    }
    this.set('$transformedPath', path);

    //  Trigger the actual 'set' mechanism, tracking changed addresses as we
    //  go.

    this.set('$createdStructure', false);

    //  If our traversal level is 0, that means we're the top level path and we
    //  can check to see if the end result value is equal to the value we're
    //  setting. If so, we can just bail out here.
    traversalLevel = TP.path.SimpleTIBETPath.get('$traversalLevel');
    if (traversalLevel === 0) {

        if (TP.regex.HAS_ACP.test(srcPath)) {
            //  Grab the arguments and slice the first three off (since they're
            //  targetObj, attributeValue and shouldSignal which we already
            //  have).
            args = TP.args(arguments, 3);

            args.unshift(targetObj);
            oldVal = this.executeGet.apply(this, args);
        } else {
            oldVal = this.executeGet(targetObj);
        }

        //  If the old value is equal to the value that we're setting, then
        //  there is nothing to do here and we exit. This is important to avoid
        //  endless recursion when doing a 'two-ended bind' to data referenced
        //  by this path and to avoid a lot of unnecessary signaling.
        if (this.checkValueEquality(oldVal, attributeValue)) {
            return oldVal;
        }

        //  Empty the changed addresses before we start another run.
        TP.path.AccessPath.$getChangedAddresses().empty();
    }

    //  Note here how we always do the set with a 'false' and then send a
    //  'changed' message later with additional information.

    this.preSetAccess(targetObj);

    if (TP.isArray(targetObj)) {
        retVal = this.$executeArraySet(targetObj, attributeValue, false);
    } else {
        retVal = this.$executeObjectSet(targetObj, attributeValue, false);
    }

    this.postSetAccess(targetObj);

    //  We're all done - acquire the traversal level again. We have to do this
    //  a second time, since the pre/post calls manipulate it.
    traversalLevel = TP.path.SimpleTIBETPath.get('$traversalLevel');

    //  Only signal change if we're the 'top level' TIBET path - we could've
    //  had more 'complex paths' buried under us.
    if (traversalLevel === 0) {

        //  If we 'created structure', that means that all of the previously
        //  executed paths need to be run, because they could now refer to new
        //  addresses.
        if (this.get('$createdStructure')) {
            executedPaths = TP.path.AccessPath.$getExecutedPaths().at(
                                    TP.id(targetObj));

            if (TP.notEmpty(executedPaths)) {
                obsAddresses = TP.path.AccessPath.$getObservedAddresses().at(
                                                TP.id(targetObj));
                if (TP.notEmpty(obsAddresses)) {
                    obsAddresses.empty();
                }

                executedPaths.perform(
                        function(pathEntry) {
                            pathEntry.last().executeGet(targetObj);
                        });
            }
        }

        if (TP.isValid(shouldSignal)) {
            sigFlag = shouldSignal;
        } else if (TP.isValid(targetObj)) {
            sigFlag = targetObj.shouldSignalChange();
        }

        if (sigFlag) {

            mutatedStructure = TP.isReferenceType(attributeValue);

            if (mutatedStructure) {
                this.updateRegistrationsBeforeSignaling(targetObj);
            }

            //  Send the changed signal
            this.sendChangedSignal(targetObj);

            if (mutatedStructure) {
                this.updateRegistrationsAfterSignaling(targetObj);
            }
        }

        //  Flip this back off for the next run.
        this.set('$createdStructure', false);
    }

    return retVal;
});

//  ------------------------------------------------------------------------
//  Getter Methods
//  ------------------------------------------------------------------------

TP.path.ComplexTIBETPath.Inst.defineMethod('$executeArrayGet',
function(targetObj) {

    /**
     * @method $executeArrayGet
     * @summary Returns the result of executing the path in a 'get' fashion
     *     against an object of type 'Array'.
     * @param {targetObj} Array The object to execute the receiver against to
     *     retrieve data.
     * @returns {Object} The result of executing a 'get' against the target
     *     object using the receiver.
     */

    var path,

        parts,
        head,
        tail,

        thisType,

        hadNaN,

        queryParts,

        val,

        tailPath,

        retVal;

    path = this.get('$transformedPath');

    //  See if we need to traverse down via a period ('.') or if this is a
    //  a complete range that we handle here.

    parts = this.$extractPathHeadAndTail(path);
    head = parts.at(0);
    tail = parts.at(1);

    thisType = this.getType();

    if (/[,:]/.test(head)) {
        val = TP.ac();

        if (TP.regex.HAS_COLON.test(head)) {

            //  If there is no tail, that means that there was nothing left
            //  after consuming our own head. In that case, we just return an
            //  Array with our items.
            if (TP.notValid(tail)) {
                targetObj.vslice(head).perform(
                        function(index) {

                            var itemVal;

                            thisType.startObservedAddress(index);

                            itemVal = targetObj.at(index);

                            //  If the return value is a callable Function, then
                            //  call it and reassign the return value to the
                            //  result.
                            if (TP.isCallable(itemVal)) {
                                itemVal = itemVal(targetObj);
                            }

                            val.push(itemVal);

                            thisType.endObservedAddress();
                        });
            } else {
                //  Otherwise, we take each one of our items and capture the
                //  return value of its 'get'.
                targetObj.vslice(head).perform(
                        function(index) {

                            var itemVal;

                            thisType.startObservedAddress(index);

                            itemVal = targetObj.at(index);

                            //  If the return value is a callable Function, then
                            //  call it and reassign the return value to the
                            //  result.
                            if (TP.isCallable(itemVal)) {
                                itemVal = itemVal(targetObj);
                            }

                            val.push(itemVal.get(TP.tpc(tail)));

                            thisType.endObservedAddress();
                        });
            }
        } else {
            //  Make sure to strip off the leading '[' and trailing ']'
            head = head.slice(1, head.getSize() - 1);

            hadNaN = false;

            queryParts = head.split(',').convert(
                                function(item) {

                                    var itemVal;

                                    if (!TP.isNumber(
                                            itemVal = item.asNumber())) {
                                        hadNaN = true;
                                    }

                                    return itemVal;
                                });

            if (hadNaN) {
                return undefined;
            }

            //  If there is no tail, that means that there was nothing left
            //  after consuming our own head. In that case, we just return an
            //  Array with our items.
            if (TP.notValid(tail)) {
                targetObj.performOver(
                        function(item, key) {

                            var itemVal;

                            thisType.startObservedAddress(key);

                            itemVal = item;

                            //  If the return value is a callable Function, then
                            //  call it and reassign the return value to the
                            //  result.
                            if (TP.isCallable(itemVal)) {
                                itemVal = itemVal(targetObj);
                            }

                            val.push(itemVal);

                            thisType.endObservedAddress();
                        }, queryParts);
            } else {
                //  Otherwise, we take each one of our items and capture the
                //  return value of its 'get'.
                targetObj.performOver(
                        function(item, key) {

                            var itemVal;

                            thisType.startObservedAddress(key);

                            itemVal = item;

                            //  If the return value is a callable Function, then
                            //  call it and reassign the return value to the
                            //  result.
                            if (TP.isCallable(itemVal)) {
                                itemVal = itemVal(targetObj);
                            }

                            if (TP.isValid(itemVal)) {
                                val.push(itemVal.get(TP.tpc(tail)));
                            } else {
                                val.push(itemVal);
                            }

                            thisType.endObservedAddress();

                        }, queryParts);
            }
        }

        return val;
    }

    //  call back in with first part of access path
    if (TP.notValid(val = targetObj.get(head))) {
        return val;
    }

    //  If the return value is a callable Function, then call it and reassign
    //  the return value to the result.
    if (TP.isCallable(val)) {
        val = val(targetObj);
    }

    //  only continue if the tail is valid and the result object can
    //  stay with the program :)
    if (TP.isString(tail) && TP.canInvoke(val, 'get')) {
        thisType.startObservedAddress(head);

        tailPath = TP.tpc(tail);
        tailPath.set('shouldCollapse', this.get('shouldCollapse'));

        retVal = val.get(tailPath);

        thisType.endObservedAddress();

        return retVal;
    } else if (TP.isString(tail) && TP.isPlainObject(val)) {
        thisType.startObservedAddress(head);

        if (tail.indexOf('.') !== TP.NOT_FOUND) {
            return TP.objectValue(val, tail);
        } else {
            retVal = val[tail];
        }

        thisType.endObservedAddress();

        return retVal;
    } else {
        return val;
    }
});

//  ------------------------------------------------------------------------

TP.path.ComplexTIBETPath.Inst.defineMethod('$executeObjectGet',
function(targetObj) {

    /**
     * @method $executeObjectGet
     * @summary Returns the result of executing the path in a 'get' fashion
     *     against an object of type 'Object'.
     * @param {targetObj} Object The object to execute the receiver against to
     *     retrieve data.
     * @returns {Object} The result of executing a 'get' against the target
     *     object using the receiver.
     */

    var path,

        parts,
        head,
        tail,

        thisType,

        queryParts,

        val,

        tailPath,

        retVal;

    path = this.get('$transformedPath');

    parts = this.$extractPathHeadAndTail(path);
    head = parts.at(0);
    tail = parts.at(1);

    thisType = this.getType();

    if (/,/.test(head)) {
        //  Make sure to strip off the leading '[' and trailing ']'
        head = head.slice(1, head.getSize() - 1);

        queryParts = head.split(',');

        val = TP.ac();

        //  If there is no tail, that means that there was nothing left
        //  after consuming our own head. In that case, we just return an Array
        //  with our items.
        if (TP.notValid(tail)) {
            targetObj.performOver(
                    function(item, key) {

                        var itemVal;

                        thisType.startObservedAddress(key);

                        itemVal = item;

                        //  If the return value is a callable Function, then
                        //  call it and reassign the return value to the result.
                        if (TP.isCallable(itemVal)) {
                            itemVal = itemVal(targetObj);
                        }

                        val.push(itemVal);

                        thisType.endObservedAddress();
                    }, queryParts);
        } else {
            //  Otherwise, we take each one of our items and capture the return
            //  value of its 'get'.
            targetObj.performOver(
                    function(item, key) {

                        var itemVal;

                        thisType.startObservedAddress(key);

                        itemVal = item;

                        //  If the return value is a callable Function, then
                        //  call it and reassign the return value to the result.
                        if (TP.isCallable(itemVal)) {
                            itemVal = itemVal(targetObj);
                        }

                        if (TP.isValid(itemVal)) {
                            val.push(itemVal.get(TP.tpc(tail)));
                        } else {
                            val.push(itemVal);
                        }

                        thisType.endObservedAddress();

                    }, queryParts);
        }

        return val;
    }

    //  call back in with first part of access path
    if (head !== tail) {

        if (TP.notValid(val = targetObj.get(head))) {
            //  could be a hash key instead...
            return targetObj.getProperty(tail);
        }
    }

    //  If the return value is a callable Function, then call it and reassign
    //  the return value to the result.
    if (TP.isCallable(val)) {
        val = val(targetObj);
    }

    //  only continue if the tail is valid and the result object can stay
    //  with the program :)
    if (TP.isString(tail) && TP.canInvoke(val, 'get')) {
        thisType.startObservedAddress(head);

        tailPath = TP.tpc(tail);
        tailPath.set('shouldCollapse', this.get('shouldCollapse'));

        retVal = val.get(tailPath);

        thisType.endObservedAddress();

        return retVal;
    } else if (TP.isString(tail) && TP.isPlainObject(val)) {
        thisType.startObservedAddress(head);

        if (tail.indexOf('.') !== TP.NOT_FOUND) {
            return TP.objectValue(val, tail);
        } else {
            retVal = val[tail];
        }

        thisType.endObservedAddress();

        return retVal;
    } else {
        return val;
    }
});

//  ------------------------------------------------------------------------

TP.path.ComplexTIBETPath.Inst.defineMethod('$executeStringGet',
function(targetObj) {

    /**
     * @method $executeStringGet
     * @summary Returns the result of executing the path in a 'get' fashion
     *     against an object of type 'String'.
     * @param {targetObj} String The object to execute the receiver against to
     *     retrieve data.
     * @returns {Object} The result of executing a 'get' against the target
     *     object using the receiver.
     */

    var path,

        parts,
        head,
        tail,

        val,

        hadNaN,
        queryParts;

    path = this.get('$transformedPath');

    parts = this.$extractPathHeadAndTail(path);
    head = parts.at(0);
    tail = parts.at(1);

    if (/[,:]/.test(tail)) {
        val = TP.ac();

        if (TP.regex.HAS_COLON.test(tail)) {

            targetObj.asArray().vslice(tail).perform(
                    function(index) {

                        var itemVal;

                        itemVal = targetObj.at(index);

                        //  If the return value is a callable Function, then
                        //  call it and reassign the return value to the
                        //  result.
                        if (TP.isCallable(itemVal)) {
                            itemVal = itemVal(targetObj);
                        }

                        val.push(itemVal);
                    });
        } else {
            //  Make sure to strip off the leading '[' and trailing ']'
            head = head.slice(1, head.getSize() - 1);

            hadNaN = false;

            queryParts = head.split(',').convert(
                        function(item) {

                            var itemVal;

                            if (!TP.isNumber(itemVal = item.asNumber())) {
                                hadNaN = true;
                            }

                            return itemVal;
                        });

            if (hadNaN) {
                return undefined;
            }

            targetObj.asArray().performOver(
                    function(item) {

                        val.push(item);
                    }, queryParts);
        }

        return val.join('');
    }

    if (TP.notValid(tail)) {
        return undefined;
    }

    //  Had an access character, but it must be one that Strings don't support
    //  - let standard method do the work
    return targetObj.get(tail);
});

//  ------------------------------------------------------------------------
//  Setter Methods
//  ------------------------------------------------------------------------

TP.path.ComplexTIBETPath.Inst.defineMethod('$executeArraySet',
function(targetObj, attributeValue, shouldSignal) {

    /**
     * @method $executeArraySet
     * @summary Executes the path in a 'set' fashion against an object of type
     *     'Array'.
     * @param {targetObj} Array The object to execute the receiver against to
     *     set data.
     * @param {attributeValue} Object The object to use as the value to set
     *     into the target object.
     * @param {shouldSignal} Boolean If false, no signaling occurs. Defaults to
     *     targetObj.shouldSignalChange().
     * @returns {Array|undefined} The targetObj or undefined.
     */

    var path,

        parts,
        head,
        tail,

        thisType,
        shouldMake,

        val,

        queryParts,

        attrIsNumber,
        firstSimplePath,

        setPath;

    path = this.get('$transformedPath');

    parts = this.$extractPathHeadAndTail(path);
    head = parts.at(0);
    tail = parts.at(1);

    thisType = this.getType();

    shouldMake = this.get('shouldMakeStructures');

    if (/[,:]/.test(head)) {

        if (TP.regex.HAS_COLON.test(head)) {
            //  If there is no tail, that means that there was nothing left
            //  after consuming our own head. In that case, we just set our own
            //  items using the supplied attribute value.
            if (TP.notValid(tail)) {
                targetObj.vslice(head).perform(
                        function(index, count) {

                            var op;

                            if (TP.notValid(attributeValue)) {
                                op = TP.DELETE;
                            } else if (TP.isDefined(targetObj.at(index))) {
                                op = TP.UPDATE;
                            } else {
                                op = TP.CREATE;
                            }

                            thisType.startChangedAddress(index);

                            thisType.registerChangedAddress(
                                thisType.getChangedAddress(), op);

                            targetObj.atPut(
                                    index,
                                    attributeValue);

                            thisType.endChangedAddress();
                        });
            } else {
                //  Otherwise, we take each one of our items and send it a
                //  'set' message with the attribute value.

                firstSimplePath = TP.tpc(tail).getFirstSimplePath();
                attrIsNumber = TP.isNumber(firstSimplePath.asNumber());

                //  If an Array was not supplied, then we use the supplied
                //  value in a repeating fashion.
                targetObj.vslice(head).perform(
                    function(index, count) {

                        var indexVal,
                            op;

                        indexVal = targetObj.at(index);

                        thisType.startChangedAddress(index);

                        //  If item is not valid, or it's not a reference type,
                        //  then we blow away the entry and make it a reference
                        //  type - we need to set the slot...
                        if (shouldMake &&
                            (TP.notValid(indexVal) ||
                             !TP.isReferenceType(indexVal))) {

                            //  If the slot was already defined, but wasn't a
                            //  reference type, then we're just updating it.
                            if (TP.isDefined(indexVal)) {
                                op = TP.UPDATE;
                            } else {
                                op = TP.CREATE;
                                targetObj.defineAttribute(index);
                            }

                            if (attrIsNumber) {
                                indexVal = TP.ac();
                            } else {
                                indexVal = TP.lang.Object.construct();
                                indexVal.defineAttribute(firstSimplePath);
                            }

                            //  And we set it back onto the targetObj
                            targetObj.atPut(index, indexVal);

                            //  Need to register this as a changed address
                            //  since we altered what was at this slot.
                            thisType.registerChangedAddress(
                                thisType.getChangedAddress(), op);

                            //  Make sure to let this path know that we created
                            //  structure - this makes a difference when
                            //  signaling change.
                            this.set('$createdStructure', true);
                        }

                        if (TP.notValid(indexVal) ||
                            !TP.isReferenceType(indexVal)) {
                            thisType.endChangedAddress();

                            return;
                        }

                        //  This 'set' call will take care of registering the
                        //  changed address.
                        indexVal.set(
                            TP.tpc(
                                tail,
                                TP.hc('shouldMakeStructures', shouldMake)),
                            attributeValue,
                            false);

                        thisType.endChangedAddress();
                    }.bind(this));
            }
        } else if (/,/.test(head)) {
            //  Make sure to strip off the leading '[' and trailing ']'
            head = head.slice(1, head.getSize() - 1);

            queryParts = head.split(',').convert(
                                function(item) {

                                    return item.asNumber();
                                });

            //  If there is no tail, that means that there was nothing left
            //  after consuming our own head. In that case, we just set our own
            //  items using the supplied attribute value.
            if (TP.notValid(tail)) {
                targetObj.performOver(
                        function(item, index, count) {

                            var op;

                            if (TP.notValid(attributeValue)) {
                                op = TP.DELETE;
                            } else if (TP.isDefined(targetObj.at(index))) {
                                op = TP.UPDATE;
                            } else {
                                op = TP.CREATE;
                            }

                            thisType.startChangedAddress(index);

                            thisType.registerChangedAddress(
                                thisType.getChangedAddress(), op);

                            targetObj.atPut(
                                    index,
                                    attributeValue);

                            thisType.endChangedAddress();
                        }, queryParts);
            } else {
                //  Otherwise, we take each one of our items and send it a
                //  'set' message with the attribute value.

                firstSimplePath = TP.tpc(tail).getFirstSimplePath();
                attrIsNumber = TP.isNumber(firstSimplePath.asNumber());

                targetObj.performOver(
                    function(item, index, count) {

                        var itemVal,
                            op;

                        itemVal = item;

                        thisType.startChangedAddress(index);

                        //  If item is not valid, or it's not a reference type,
                        //  then we blow away the entry and make it a reference
                        //  type - we need to set the slot...
                        if (shouldMake &&
                            (TP.notValid(itemVal) ||
                             !TP.isReferenceType(itemVal))) {

                            //  If the slot was already defined, but wasn't a
                            //  reference type, then we're just updating it.
                            if (TP.isDefined(itemVal)) {
                                op = TP.UPDATE;
                            } else {
                                op = TP.CREATE;
                                targetObj.defineAttribute(index);
                            }

                            if (attrIsNumber) {
                                itemVal = TP.ac();
                            } else {
                                itemVal = TP.lang.Object.construct();
                                itemVal.defineAttribute(firstSimplePath);
                            }

                            //  And we set it back onto the targetObj
                            targetObj.set(index, itemVal, false);

                            //  Need to register this as a changed address
                            //  since we altered what was at this slot.
                            thisType.registerChangedAddress(
                                thisType.getChangedAddress(), op);

                            //  Make sure to let this path know that we created
                            //  structure - this makes a difference when
                            //  signaling change.
                            this.set('$createdStructure', true);
                        }

                        if (TP.notValid(itemVal) ||
                            !TP.isReferenceType(itemVal)) {
                            thisType.endChangedAddress();

                            return;
                        }

                        //  This 'set' call will take care of registering the
                        //  changed address.
                        itemVal.set(
                            TP.tpc(
                                tail,
                                TP.hc('shouldMakeStructures', shouldMake)),
                            attributeValue,
                            false);

                        thisType.endChangedAddress();
                    }.bind(this), queryParts);
            }
        }

        return targetObj;
    }

    //  Retrieve what's at the first part of access path in targetObj

    val = targetObj.get(head);

    //  If we should create structural data and targetObj either doesn't have a
    //  value or doesn't have a reference type value at the place pointed to by
    //  'head', then we create a reference type (either an Object or an Array)
    //  and set it into place.
    if (shouldMake && (TP.notValid(val) || !TP.isReferenceType(val))) {
        firstSimplePath = TP.tpc(tail).getFirstSimplePath();
        if (TP.isNumber(firstSimplePath.asNumber())) {
            val = TP.ac();
        } else {
            val = TP.lang.Object.construct();
            val.defineAttribute(firstSimplePath);
        }

        setPath = TP.tpc(head, TP.hc('shouldMakeStructures', shouldMake));
        targetObj.set(setPath, val, false);

        //  If the setter path created structure, we flip our value of that flag
        //  to 'true' to 'propagate it up' the setter chain and rest the setter
        //  path's value back to 'false' for future runs. Note that we only do
        //  this is the setter path's value is 'true'.
        if (TP.isTrue(setPath.get('$createdStructure'))) {
            this.set('$createdStructure', true);
            setPath.set('$createdStructure', false);
        }
    }

    if (TP.notValid(val) || !TP.isReferenceType(val)) {
        //  Had an access character and needed a reference type, but we can't
        //  create the Object (probably had shouldMake turned off)
        return;
    }

    //  only continue if the result object can stay with the program :)
    if (TP.isString(tail) && TP.canInvoke(val, 'set')) {
        thisType.startChangedAddress(head);

        setPath = TP.tpc(tail, TP.hc('shouldMakeStructures', shouldMake));

        //  This 'set' call will take care of registering the changed address.
        val.set(setPath, attributeValue, false);

        //  If the setter path created structure, we flip our value of that flag
        //  to 'true' to 'propagate it up' the setter chain and rest the setter
        //  path's value back to 'false' for future runs. Note that we only do
        //  this is the setter path's value is 'true'.
        if (TP.isTrue(setPath.get('$createdStructure'))) {
            this.set('$createdStructure', true);
            setPath.set('$createdStructure', false);
        }

        thisType.endChangedAddress();

        //  typically we want to return the original object from a set()
        return targetObj;
    }

    //  Had an access character, but we can't compute the path.
    return;
});

//  ------------------------------------------------------------------------

TP.path.ComplexTIBETPath.Inst.defineMethod('$executeObjectSet',
function(targetObj, attributeValue, shouldSignal) {

    /**
     * @method $executeObjectSet
     * @summary Executes the path in a 'set' fashion against an object of type
     *     'Object'.
     * @param {targetObj} Object The object to execute the receiver against to
     *     set data.
     * @param {attributeValue} Object The object to use as the value to set
     *     into the target object.
     * @param {shouldSignal} Boolean If false, no signaling occurs. Defaults to
     *     targetObj.shouldSignalChange().
     * @returns {Object|undefined} The targetObj or undefined.
     */

    var path,

        parts,
        head,
        tail,

        thisType,
        shouldMake,

        val,

        queryParts,

        attrIsNumber,
        firstSimplePath,

        setPath;

    path = this.get('$transformedPath');

    parts = this.$extractPathHeadAndTail(path);
    head = parts.at(0);
    tail = parts.at(1);

    thisType = this.getType();

    shouldMake = this.get('shouldMakeStructures');

    if (/,/.test(head)) {
        //  Make sure to strip off the leading '[' and trailing ']'
        head = head.slice(1, head.getSize() - 1);

        queryParts = head.split(',');

        //  If there is no tail, that means that there was nothing left
        //  after consuming our own head. In that case, we just set our own
        //  items using the supplied attribute value.
        if (TP.notValid(tail)) {
            targetObj.performOver(
                    function(item, index, count) {

                        var op;

                        if (TP.notValid(attributeValue)) {
                            op = TP.DELETE;
                        } else if (TP.isDefined(targetObj.get(index))) {
                            op = TP.UPDATE;
                        } else {
                            op = TP.CREATE;
                        }

                        thisType.startChangedAddress(index);

                        thisType.registerChangedAddress(
                            thisType.getChangedAddress(), op);

                        targetObj.set(index, attributeValue, false);

                        thisType.endChangedAddress();
                    }, queryParts);
        } else {
            //  Otherwise, we take each one of our items and send it a 'set'
            //  message with the attribute value.

            firstSimplePath = TP.tpc(tail).getFirstSimplePath();
            attrIsNumber = TP.isNumber(firstSimplePath.asNumber());

            targetObj.performOver(
                function(item, index, count) {

                    var itemVal,
                        op;

                    itemVal = item;

                    thisType.startChangedAddress(index);

                    //  If item is not valid, or it's not a reference type,
                    //  then we blow away the entry and make it a reference
                    //  type - we need to set the slot...
                    if (shouldMake &&
                        (TP.notValid(itemVal) ||
                         !TP.isReferenceType(itemVal))) {

                        //  If the slot was already defined, but wasn't a
                        //  reference type, then we're just updating it.
                        if (TP.isDefined(itemVal)) {
                            op = TP.UPDATE;
                        } else {
                            op = TP.CREATE;
                            targetObj.defineAttribute(index);
                        }

                        if (attrIsNumber) {
                            itemVal = TP.ac();
                        } else {
                            itemVal = TP.lang.Object.construct();
                            itemVal.defineAttribute(firstSimplePath);
                        }

                        //  And we set it back onto the targetObj
                        targetObj.set(index, itemVal, false);

                        //  Need to register this as a changed address since we
                        //  altered what was at this slot.
                        thisType.registerChangedAddress(
                            thisType.getChangedAddress(), op);

                        //  Make sure to let this path know that we created
                        //  structure - this makes a difference when signaling
                        //  change.
                        this.set('$createdStructure', true);
                    }

                    if (TP.notValid(itemVal) ||
                        !TP.isReferenceType(itemVal)) {
                        thisType.endChangedAddress();

                        return;
                    }

                    //  This 'set' call will take care of registering the
                    //  changed address.
                    itemVal.set(TP.tpc(tail, TP.hc('shouldMakeStructures',
                                                                shouldMake)),
                            attributeValue,
                            false);

                    thisType.endChangedAddress();
                }.bind(this), queryParts);
        }

        return targetObj;
    }

    //  Retrieve what's at the first part of access path in targetObj

    val = targetObj.get(head);

    //  If we should create structural data and targetObj either doesn't have a
    //  value or doesn't have a reference type value at the place pointed to by
    //  'head', then we create a reference type (either an Object or an Array)
    //  and set it into place.
    if (shouldMake && (TP.notValid(val) || !TP.isReferenceType(val))) {
        firstSimplePath = TP.tpc(tail).getFirstSimplePath();
        if (TP.isNumber(firstSimplePath.asNumber())) {
            val = TP.ac();
        } else {
            val = TP.lang.Object.construct();
            val.defineAttribute(firstSimplePath);
        }

        setPath = TP.tpc(head, TP.hc('shouldMakeStructures', shouldMake));
        targetObj.set(setPath, val, false);

        if (TP.isTrue(setPath.get('$createdStructure'))) {
            this.set('$createdStructure', true);
            setPath.set('$createdStructure', false);
        }
    }

    if (TP.notValid(val) || !TP.isReferenceType(val)) {
        //  Had an access character and needed a reference type, but we can't
        //  create the Object (probably had shouldMake turned off)
        return;
    }

    //  only continue if the result object can stay with the program :)
    if (TP.isString(tail) && TP.canInvoke(val, 'set')) {
        thisType.startChangedAddress(head);

        setPath = TP.tpc(tail, TP.hc('shouldMakeStructures', shouldMake));

        //  This 'set' call will take care of registering the changed address.
        val.set(setPath, attributeValue, false);

        if (TP.isTrue(setPath.get('$createdStructure'))) {
            this.set('$createdStructure', true);
            setPath.set('$createdStructure', false);
        }

        thisType.endChangedAddress();

        //  typically we want to return the original object from a set()
        return targetObj;
    }

    //  Had an access character, but we can't compute the path.
    return;
});

//  ------------------------------------------------------------------------

TP.path.ComplexTIBETPath.Inst.defineMethod('$extractPathHeadAndTail',
function(aPath) {

    /**
     * @method $extractPathHeadAndTail
     * @summary Returns the head and tail of the supplied path.
     * @param {String} aPath The path to extract the head and tail from.
     * @returns {String[]} A pair of the [head, tail].
     */

    var dottedPath,

        parts,

        head,
        tail;

    //  Split along '[', if there are some, and add a leading '.' (unless that
    //  bracket already has a leading '.')
    dottedPath = aPath.replace(/([^\.])\[/, '$1.[');
    parts = dottedPath.split('.');

    //  If the first item was empty, then slice it off.
    if (dottedPath.at(0) === '') {
        parts = parts.slice(1);
    }

    //  The head will always be the first item
    head = parts.at(0);

    //  If we ended up with more than 2 parts, slice off the first one and join
    //  the rest together with a '.'
    if (parts.getSize() > 2) {
        tail = parts.slice(1).join('.');
    } else {
        //  Otherwise, the tail is just the second item.
        tail = parts.at(1);
    }

    return TP.ac(head, tail);
});

//  ------------------------------------------------------------------------

TP.path.ComplexTIBETPath.Inst.defineMethod('getFirstSimplePath',
function() {

    /**
     * @method getFirstSimplePath
     * @summary Returns the first 'simple path' of the receiver. For instance,
     *     in a simple path such as '1.2.3', this method will return '1'.
     * @returns {String} The first simple path of the receiver.
     */

    var srcPath,

        paths,
        firstPath;

    srcPath = this.get('srcPath');

    //  First, split by '.'
    paths = srcPath.split('.');

    firstPath = paths.first();

    if (/[,:]/.test(firstPath)) {

        //  Strip off the leading and trailing '[' and ']'
        firstPath = firstPath.slice(1, firstPath.getSize() - 1);

        if (TP.regex.HAS_COLON.test(firstPath)) {
            firstPath = firstPath.split(':').first();
        } else {
            firstPath = firstPath.split(',').first();
        }
    }

    return firstPath;
});

//  ========================================================================
//  TP.path.XMLPath
//  ========================================================================

/**
 * @type {TP.path.XMLPath}
 */

//  ------------------------------------------------------------------------

TP.path.AccessPath.defineSubtype('XMLPath');

//  This is an abstract supertype - need a concrete subtype to get real work
//  done.
TP.path.XMLPath.isAbstract(true);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The path we use to register interest for change notification
TP.path.XMLPath.Inst.defineAttribute('$interestedPath');

//  The transformed path we actually execute - it may have templated
//  expressions.
TP.path.XMLPath.Inst.defineAttribute('$transformedPath');

//  Whether or not to make scalar data slots on execution
TP.path.XMLPath.Inst.defineAttribute('shouldMakeValues');

//  -----------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.path.XMLPath.Inst.defineMethod('init',
function(aPath, config) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {String} aPath The String to build the instance from.
     * @param {TP.core.Hash} config The configuration for this path.
     * @returns {TP.path.XMLPath} The receiver.
     */

    this.callNextMethod();

    if (TP.isHash(config)) {
        this.set('shouldMakeValues',
                    config.atIfInvalid('shouldMakeValues', true));
    } else {
        this.set('shouldMakeValues', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.path.XMLPath.Inst.defineMethod('$addChangedAddressFromNode',
function(aNode, prevNode, aValue) {

    /**
     * @method $addChangedAddressFromNode
     * @summary Adds the supplied node's address and action to
     *     TP.path.AccessPath's 'changed address list'.
     * @param {Node} aNode The Node to extract the address and action from.
     * @param {Node} prevNode Any previous content that was at the place in the
     *     data structure where aNode is now. This is used to determine what
     *     kind of change action to compute.
     * @param {Object} aValue The value that the node is being set to. Note that
     *     this isn't necessary a Node / markup value, but is useful for
     *     comparison purposes.
     * @returns {TP.path.XMLPath} The receiver.
     */

    var address,

        attrName,
        elem,

        action;

    if (TP.isAttributeNode(aNode)) {

        attrName = TP.attributeGetLocalName(aNode);
        elem = TP.attributeGetOwnerElement(aNode);

        //  We need to test the owner element to see if it already has an
        //  appropriate action (i.e. TP.CREATE if this attribute has just been
        //  created). Otherwise, we set it to TP.UPDATE.

        if (TP.notValid(action = TP.elementGetChangeAction(
                                                elem, TP.ATTR + attrName))) {
            action = TP.UPDATE;
        }

        //  Obtain the node's document position - we will use this as our
        //  address.
        address = TP.nodeGetDocumentPosition(aNode);

    } else if (TP.isTextNode(aNode)) {

        elem = aNode.parentNode;

        //  We need to test the owner element to see if it already has an
        //  appropriate action (i.e. TP.CREATE if this text node has just been
        //  created). Otherwise, we set it to TP.UPDATE.

        if (TP.notValid(action = TP.elementGetChangeAction(elem, TP.SELF))) {
            action = TP.UPDATE;
        }

        //  Obtain our parent node's document position - we will use this as
        //  our address.
        address = TP.nodeGetDocumentPosition(aNode.parentNode);

    } else if (TP.isElement(elem = aNode)) {

        //  We need to flag changes on the content element, but not if the
        //  '$$getContentForSetOperation()' created this element. It will
        //  have tagged it with a TP.CREATE action already.

        if (TP.notValid(action = TP.elementGetChangeAction(elem, TP.SELF))) {
            action = TP.UPDATE;
        }

        //  Obtain the node's document position - we will use this as our
        //  address.
        address = TP.nodeGetDocumentPosition(aNode);
    }

    //  If we're doing a TP.UPDATE *with a valid value*, we message ourself to
    //  determine whether to change an 'update' to a 'delete'/'create'
    //  combination. If so, then we change to registering a TP.DELETE, followed
    //  by a TP.CREATE for that. Note that this is an invalid value (null or
    //  undefined) then the new value is 'nulling out' the old and it is indeed
    //  an update, not a combination of delete followed by create.
    if (TP.isValid(aValue) &&
        action === TP.UPDATE &&
        this.$updateOpsBecomeDeleteInsertOps(aNode, prevNode)) {
        TP.path.AccessPath.registerChangedAddress(address, TP.DELETE);
        TP.path.AccessPath.registerChangedAddress(address, TP.CREATE);
    } else {
        TP.path.AccessPath.registerChangedAddress(address, action);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.path.XMLPath.Inst.defineMethod('checkValueEquality',
function(objectA, objectB) {

    /**
     * @method checkValueEquality.
     * @summary Checks to see if the two supplied parameters 'lead to' equal
     *     values. This is used when trying to determine whether or not to
     *     proceed with a 'set' operation (and broadcast changes).
     * @description This method takes into account the kind of data that this
     *     path manages when doing it's comparison.
     * @param {objectA} Object The first object to compare.
     * @param {objectB} Object The second object to compare.
     * @returns {Boolean} Whether or not the two values are equal.
     */

    if (TP.isArray(objectA) && objectA.getSize() === 1) {
        return TP.equal(objectA.first(), objectB);
    }

    if (TP.isArray(objectB) && objectB.getSize() === 1) {
        return TP.equal(objectA, objectB.first());
    }

    if (TP.isNode(objectA) && !TP.isReferenceType(objectB)) {
        return TP.nodeGetTextContent(objectA) === TP.str(objectB);
    }

    if (!TP.isReferenceType(objectA) && TP.isNode(objectB)) {
        return TP.str(objectA) === TP.nodeGetTextContent(objectB);
    }

    return TP.equal(objectA, objectB);
});

//  ------------------------------------------------------------------------

TP.path.XMLPath.Inst.defineMethod('executeGet',
function(targetObj, varargs) {

    /**
     * @method executeGet
     * @summary Returns the result of executing the path in a 'get' fashion -
     *     i.e. with the intent of retrieving data from the supplied target
     *     object.
     * @param {targetObj} Object The object to execute the receiver against to
     *     get data.
     * @param {arguments} varargs The arguments to execute the get with. The
     *     first argument should be the object to execute the receiver against
     *     to retrieve data. Any remaining arguments will be used as values for
     *     a templated substitution in the path itself.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidNode
     * @returns {Object} The result of executing a 'get' against the target
     *     object using the receiver.
     */

    var target,

        args,

        srcPath,

        executedPaths,

        natTargetObj,

        path,

        nodes,
        finalValue,

        nodePath,

        addresses,

        doc,
        sourceObjectID,

        interestedPath,

        extractWith;

    target = targetObj;

    if (TP.notValid(target)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    if (TP.isKindOf(target, TP.core.XMLContent)) {
        target = target.get('data');
    }

    //  This kind of path only works against XML
    if (!TP.isNode(target) && !TP.isKindOf(target, TP.dom.Node)) {
        if (TP.isWindow(target) || TP.isKindOf(target, TP.core.Window)) {
            target = TP.unwrap(target).document;
            if (!TP.isXMLDocument(target)) {
                return this.raise('InvalidDocument');
            }
        } else {
            return this.raise('TP.sig.InvalidNode');
        }
    }

    srcPath = this.get('srcPath');

    //  If the path is empty or just '.', then that's the shortcut to just
    //  return the target object itself.
    if (TP.isEmpty(srcPath) || TP.regex.ONLY_PERIOD.test(srcPath)) {
        return target;
    }

    executedPaths = TP.path.AccessPath.$getExecutedPaths().atPutIfAbsent(
                    TP.id(target),
                    TP.hc());

    executedPaths.atPut(srcPath, this);

    //  Fill in any templated expressions in the path (which must be numeric
    //  positions) with data from the passed arguments.
    path = this.get('srcPath');
    if (TP.regex.HAS_ACP.test(path)) {
        //  Grab the arguments and slice the first one off (since it's the
        //  target, which we already have).
        args = TP.args(arguments, 1);

        path = path.transform(args);
    }
    this.set('$transformedPath', path);

    //  Make sure the target object is unwrapped
    natTargetObj = TP.unwrap(target);

    nodes = TP.nodeEvaluatePath(
                natTargetObj, path, this.getPathType(), false);

    //  If the return value is not an Array, that means a scalar value was
    //  returned (because we forced false on autoCollapse).
    if (!TP.isArray(nodes)) {

        //  Capture the scalar as the final value - we want to return this.
        finalValue = nodes;

        //  Compute a 'node path' by starting with the path.
        nodePath = path;

        //  If there's a 'wrapping scalar conversion' (i.e. 'string(...)'), then
        //  we need to strip it off of the path so that we can get to nodes, not
        //  scalar values.
        if (TP.regex.XPATH_HAS_SCALAR_CONVERSION.test(nodePath)) {
            nodePath = TP.regex.XPATH_HAS_SCALAR_CONVERSION.match(
                                                        nodePath).at(1);
        }

        //  If the path ends with some sort of attribute path, then we
        //  reevaluate, using a construct at the end that will return an
        //  Attribute *node*.
        if (TP.regex.ATTRIBUTE_ENDS.test(nodePath)) {
            nodes = TP.nodeEvaluatePath(
                        natTargetObj,
                        nodePath +
                            '/../' +
                            nodePath.slice(nodePath.indexOf('@')),
                        this.getPathType(),
                        false);
        } else if (TP.regex.TEXT_NODE_ENDS.test(nodePath)) {
            nodes = TP.nodeEvaluatePath(
                        natTargetObj,
                        nodePath.slice(0, -7),
                        this.getPathType(),
                        false);
        } else {
            //  Otherwise, reevaluate and just try to capture the Node above
            //  the result.
            nodes = TP.nodeEvaluatePath(
                        natTargetObj,
                        nodePath + '/..',
                        this.getPathType(),
                        false);
        }
    }

    addresses = TP.ac();

    //  Gather all addresses from the returned nodes. Each call to
    //  TP.nodeGetAncestorPositions() returns an Array of positions all the way
    //  down
    nodes.perform(
            function(aNode) {
                var address;

                address = TP.nodeGetAncestorPositions(aNode, true);

                if (address !== TP.NOT_FOUND) {
                    addresses = addresses.concat(address);
                }
            });

    //  Now unique the values in addresses, in case there were duplicates
    addresses.unique();

    doc = !TP.isDocument(natTargetObj) ?
                natTargetObj.ownerDocument :
                natTargetObj;

    sourceObjectID = TP.wrap(doc).getID();

    //  Get our 'interested path' (the path representation used to register
    //  interest for change notification). This will default to the path we just
    //  created above.
    interestedPath = TP.ifInvalid(this.get('$interestedPath'), path);

    addresses.perform(
            function(anAddress) {
                TP.path.AccessPath.registerObservedAddress(
                    anAddress, sourceObjectID, interestedPath);
            });

    //  If there is a valid final value *or* we were trying to do a scalar
    //  conversion (and maybe got a null value - which is what we would want if
    //  we were trying to get scalar and the node was empty or some such) then
    //  just return the final value here.
    if (TP.isValid(finalValue) ||
        TP.regex.XPATH_HAS_SCALAR_CONVERSION.test(path)) {
        return finalValue;
    }

    //  To maintain consistency with other data types, if we ended up with an
    //  empty Array of result nodes and the caller has defined a property to
    //  extract a value with, then just return the result of doing that.
    if (TP.isArray(nodes) && TP.isEmpty(nodes)) {
        extractWith = this.get('extractWith');

        if (TP.notEmpty(extractWith)) {
            return TP.val(targetObj, extractWith);
        }
    }

    return this.processFinalValue(nodes, target);
});

//  -----------------------------------------------------------------------

TP.path.XMLPath.Inst.defineMethod('executeSet',
function(targetObj, attributeValue, shouldSignal, varargs) {

    /**
     * @method executeSet
     * @summary Executes the path in a 'set' fashion - i.e. with the intent of
     *     setting the supplied data into the supplied target object.
     * @param {targetObj} Object The object to execute the receiver against to
     *     set data.
     * @param {attributeValue} Object The object to use as the value to set
     *     into the target object.
     * @param {shouldSignal} Boolean If false, no signaling occurs. Defaults to
     *     targetObj.shouldSignalChange().
     * @param {arguments} varargs Any remaining arguments will be used as values
     *     for a templated substitution in the path itself.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidPath
     * @returns {TP.path.XPathPath} The receiver.
     */

    var target,

        args,
        oldVal,

        newVal,

        natTargetObj,
        targetDoc,
        targetTPDoc,

        signalChange,

        leaveFlaggedChanges,

        path,

        traversalLevel,

        createdStructure,
        changeAction,

        sigFlag,

        content,

        mutatedStructure,

        attrValue,
        value,

        oldcontent,

        affectedElems,

        tpcontent,

        ownerElem,

        len,
        i,

        contentnode,

        executedPaths,
        obsAddresses;

    if (TP.notValid(targetObj)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    target = targetObj;

    if (TP.isKindOf(target, TP.core.XMLContent)) {
        target = target.$get('data');
    }

    //  This kind of path only works against XML
    if (!TP.isNode(target) && !TP.isKindOf(target, TP.dom.Node)) {
        if (TP.isWindow(target) || TP.isKindOf(target, TP.core.Window)) {
            target = TP.wrap(TP.unwrap(target).document);
        } else {
            return this.raise('TP.sig.InvalidNode');
        }
    }

    if (TP.regex.HAS_ACP.test(this.get('srcPath'))) {
        //  Grab the arguments and slice the first three off (since they're
        //  target, attributeValue and shouldSignal which we already have).
        args = TP.args(arguments, 3);

        args.unshift(target);
        oldVal = this.executeGet.apply(this, args);
    } else {
        oldVal = this.executeGet(target);
    }

    newVal = attributeValue;

    /* eslint-disable no-extra-parens */
    if (this.get('shouldCollapse')) {

        //  By default, if newVal is an Array and is empty, collapsing it will
        //  set newVal to null, but we don't want that there. So we only do this
        //  if it's not empty
        if (TP.notEmpty(newVal)) {
            newVal = TP.collapse(newVal);
        }
    }
    /* eslint-enable no-extra-parens */

    //  If the old value is equal to the value that we're setting, then there
    //  is nothing to do here and we exit. This is important to avoid endless
    //  recursion when doing a 'two-ended bind' to data referenced by this path
    //  and to avoid a lot of unnecessary signaling.

    //  Note that we handle empty Arrays specially here since, if we're not
    //  reducing Arrays, an empty Array handed in as the value will compare as
    //  'true' here and this routine will exit.
    if (this.checkValueEquality(oldVal, newVal)) {
        if (TP.isArray(newVal) && TP.isEmpty(newVal)) {
            void 0;
        } else {
            return oldVal;
        }
    }

    natTargetObj = TP.unwrap(target);

    targetDoc = !TP.isDocument(natTargetObj) ?
                        TP.wrap(natTargetObj.ownerDocument) :
                        TP.wrap(natTargetObj);

    targetTPDoc = TP.wrap(targetDoc);

    if (TP.isValid(shouldSignal)) {
        signalChange = shouldSignal;
    } else if (TP.isValid(targetTPDoc)) {
        signalChange = targetTPDoc.shouldSignalChange();
    }

    //  If the target object is flagging changes, then we set a flag to leave
    //  the flagged changes to true. Otherwise, we set the flag to false to
    //  strip them out.
    if (TP.wrap(target).shouldFlagChanges()) {
        leaveFlaggedChanges = true;
    } else {
        leaveFlaggedChanges = false;
    }

    path = this.get('srcPath');
    if (TP.regex.HAS_ACP.test(path)) {
        //  Grab the arguments and slice the first three off (since they're
        //  target, attributeValue and shouldSignal which we already have).
        args = TP.args(arguments, 3);

        path = path.transform(args);
    }
    this.set('$transformedPath', path);

    traversalLevel = TP.path.SimpleTIBETPath.get('$traversalLevel');
    if (traversalLevel === 0) {

        //  Empty the changed addresses before we start another run.
        TP.path.AccessPath.$getChangedAddresses().empty();
    }

    //  First, we have to get the nodes that we can use to set the value - if
    //  we can't do that, then we're dead in the water...

    //  Note here how we pass 'true' to *always* flag changes in any content
    //  that we generate
    if (TP.notValid(content = this.$$getContentForSetOperation(
                                                natTargetObj, true))) {

        //  unable to build nodes...path may not be specific enough
        TP.ifWarn() ?
            TP.warn(TP.annotate(
                        this,
                        'Unable to set value for path: ' + path)) : 0;

        return this;
    }

    //  Turn off 'DOMContentLoaded' signaling here - but capture the current
    //  setting to restore it before we exit this method.
    sigFlag = TP.sys.shouldSignalDOMLoaded();
    TP.sys.shouldSignalDOMLoaded(false);

    //  At this point, content will always be a TP.NODESET... see if we can
    //  collapse it down to a single node. Our tests later are optimized for
    //  single nodes, so it's better if we collapse down.
    content = TP.collapse(content);

    createdStructure = false;

    if (!TP.isArray(content)) {
        if (TP.isElement(content)) {
            changeAction = TP.elementGetChangeAction(content, TP.SELF);
        } else if (TP.isAttributeNode(content)) {
            changeAction = TP.elementGetChangeAction(
                                TP.attributeGetOwnerElement(content),
                                TP.ATTR + content.name);
        } else if (TP.isTextNode(content)) {
            changeAction = TP.elementGetChangeAction(
                                content.parentNode,
                                TP.SELF);
        }

        /* eslint-disable no-extra-parens */
        createdStructure = (changeAction === TP.CREATE);
        /* eslint-enable no-extra-parens */
    } else {
        createdStructure =
            TP.isValid(
                    content.detect(
                        function(item) {
                            if (TP.isElement(item)) {
                                return TP.elementGetChangeAction(
                                            item, TP.SELF) === TP.CREATE;
                            }
                            return false;
                        }));
    }

    //  ---
    //  update target node values
    //  ---

    //  normalize inbound nodes to elements so we don't try to put a document
    //  where it can't be appended
    attrValue = TP.isDocument(newVal) ? TP.elem(newVal) : newVal;

    //  there are four primary variations we have to account for if we're
    //  going to get this correct: S-M, S-S, M-M, M-S. also, we have to keep
    //  in mind that we've got a second set of considerations about elements
    //  vs. attributes, and a third set around nodes vs. javascript objects

    affectedElems = TP.ac();

    if (TP.isNode(content)) {

        //  If the attrValue is a Node, clone it so that we don't remove it
        //  from it's original DOM, etc.
        if (TP.isNode(value = attrValue)) {
            value = TP.nodeCloneNode(attrValue, true);
        }

        oldcontent = TP.nodeCloneNode(content);

        //  Finalize the set value.
        mutatedStructure = this.valueIsStructural(content, value);
        value = this.finalizeSetValue(content, value);

        //  If the value is null or undefined, then we're removing the value so
        //  empty the content.
        if (TP.notValid(value)) {
            TP.nodeEmptyContent(content);
        } else {
            //  leverage TP.dom.Node wrappers to manage update intelligently
            tpcontent = TP.wrap(content);
            tpcontent.setRawContent(value);
        }

        //  99% is single value targeting a single element, attribute node or
        //  text node
        if (TP.isElement(content)) {
            ownerElem = TP.isDocument(content.parentNode) ?
                        content :
                        content.parentNode;

            //  add the element's address to the list of changed addresses.
            affectedElems.push(content);

            //  Note here how we pass in 'false', because we don't want to
            //  overwrite any existing change flag record for the TP.SELF
            //  address on this element.
            TP.elementFlagChange(content, TP.SELF, TP.UPDATE, false);

            this.$addChangedAddressFromNode(content, oldcontent, value);

            if (TP.notEmpty(
                TP.elementGetChangeAction(ownerElem, TP.SELF))) {
                affectedElems.push(ownerElem);
                this.$addChangedAddressFromNode(ownerElem, null, false);
            }
        } else if (TP.isAttributeNode(content)) {
            ownerElem = TP.attributeGetOwnerElement(content);

            //  add the attribute's address to the list of changed addresses.
            affectedElems.push(ownerElem);

            //  Note here how we pass in 'false', because we don't want to
            //  overwrite any existing change flag record for the TP.ATTR +
            //  content.name address on this element.
            TP.elementFlagChange(
                    ownerElem, TP.ATTR + content.name, TP.UPDATE, false);

            this.$addChangedAddressFromNode(content, null, false);
        } else if (TP.isTextNode(content)) {
            ownerElem = content.parentNode;

            //  Add the element's address to the list of changed addresses.
            affectedElems.push(ownerElem);

            //  Note here how we pass in 'false', because we don't want to
            //  overwrite any existing change flag record for the TP.ATTR +
            //  content.name address on this element.
            TP.elementFlagChange(
                    ownerElem, TP.SELF, TP.UPDATE, false);

            this.$addChangedAddressFromNode(content, null, false);
        }
    } else if (TP.isArray(content)) {
        len = content.getSize();
        for (i = 0; i < len; i++) {
            contentnode = content.at(i);

            //  If the attrValue is a Node, clone it so that we don't remove it
            //  from it's original DOM, etc.
            if (TP.isNode(value = attrValue)) {
                value = TP.nodeCloneNode(attrValue, true);
            }

            oldcontent = TP.nodeCloneNode(contentnode);

            mutatedStructure = this.valueIsStructural(contentnode, value);
            value = this.finalizeSetValue(contentnode, value);

            //  If the value is null or undefined, then we're removing the value
            //  so empty the content.
            if (TP.notValid(value)) {
                TP.nodeEmptyContent(contentnode);
            } else {
                //  leverage TP.dom.Node wrappers to manage update
                //  intelligently
                tpcontent = TP.wrap(contentnode);
                tpcontent.setRawContent(value);
            }

            if (TP.isNode(contentnode)) {
                if (TP.isElement(contentnode)) {
                    ownerElem = TP.isDocument(contentnode.parentNode) ?
                                contentnode :
                                contentnode.parentNode;

                    //  Add the element's address to the list of changed
                    //  addresses.
                    affectedElems.push(contentnode);

                    //  Note here how we pass in 'false', because we don't
                    //  want to overwrite any existing change flag record
                    //  for the TP.SELF address on this element.
                    TP.elementFlagChange(
                            contentnode, TP.SELF, TP.UPDATE, false);

                    this.$addChangedAddressFromNode(contentnode,
                                                    oldcontent,
                                                    value);

                    if (TP.notEmpty(TP.elementGetChangeAction(
                                                    ownerElem, TP.SELF))) {
                        affectedElems.push(ownerElem);
                        this.$addChangedAddressFromNode(ownerElem,
                                                        null,
                                                        value);
                    }
                } else if (TP.isAttributeNode(contentnode)) {
                    ownerElem = TP.attributeGetOwnerElement(contentnode);

                    //  Add the attribute's address to the list of changed
                    //  addresses.
                    affectedElems.push(ownerElem);

                    //  Note here how we pass in 'false', because we don't
                    //  want to overwrite any existing change flag record
                    //  for the TP.ATTR + contentnode.name address on this
                    //  element.
                    TP.elementFlagChange(
                            ownerElem,
                            TP.ATTR + contentnode.name,
                            TP.UPDATE,
                            false);

                    this.$addChangedAddressFromNode(contentnode,
                                                    null,
                                                    value);
                } else if (TP.isTextNode(contentnode)) {
                    ownerElem = contentnode.parentNode;

                    //  Add the attribute's address to the list of changed
                    //  addresses.
                    affectedElems.push(ownerElem);

                    //  Note here how we pass in 'false', because we don't
                    //  want to overwrite any existing change flag record
                    //  for the TP.ATTR + contentnode.name address on this
                    //  element.
                    TP.elementFlagChange(
                            ownerElem,
                            TP.SELF,
                            TP.UPDATE,
                            false);

                    this.$addChangedAddressFromNode(contentnode,
                                                    null,
                                                    value);
                } else {
                    //  not a node or collection of them? only real option is
                    //  that the XPath returned a scalar value, which we can't
                    //  process anyway...
                    TP.ifWarn() ?
                        TP.warn(TP.annotate(
                                    this,
                                    'Path probably points to scalar value.' +
                                    ' Unable to set value.')) : 0;

                    //  Make sure to put the 'shouldSignalDOMLoaded' flag back
                    //  to it's prior setting before exiting.
                    TP.sys.shouldSignalDOMLoaded(sigFlag);

                    return this;
                }
            }
        }
    } else {
        //  not a node or collection of them? only real option is that the
        //  XPath returned a scalar value, which we can't process anyway...

        TP.ifWarn() ?
            TP.warn(TP.annotate(
                        this,
                        'Path probably points to scalar value.' +
                        ' Unable to set value.')) : 0;

        //  Make sure to put the 'shouldSignalDOMLoaded' flag back to it's prior
        //  setting before exiting.
        TP.sys.shouldSignalDOMLoaded(sigFlag);

        return this;
    }

    //  If we 'created structure', that means that all of the previously
    //  executed paths need to be run, because they could now refer to new
    //  addresses.
    if (createdStructure) {
        if (TP.notEmpty(
            executedPaths = TP.path.AccessPath.$getExecutedPaths().at(
                                                targetTPDoc.getID()))) {
            if (TP.notEmpty(executedPaths)) {
                obsAddresses = TP.path.AccessPath.$getObservedAddresses().at(
                                                TP.id(targetObj));
                if (TP.notEmpty(obsAddresses)) {
                    obsAddresses.empty();
                }

                executedPaths.perform(
                        function(pathEntry) {
                            pathEntry.last().executeGet(target);
                        });
            }
        }
    }

    if (signalChange) {

        //  If it was a structural change, then we need to clear the path
        //  information registered for the addresses 'under' the node that
        //  changed.
        if (mutatedStructure) {
            this.updateRegistrationsBeforeSignaling(targetTPDoc);
        }

        //  Send the changed signal
        this.sendChangedSignal(target);

        if (mutatedStructure) {
            this.updateRegistrationsAfterSignaling(targetTPDoc);
        }
    }

    //  If the node wasn't originally configured to flag changes, then (now
    //  that we've registered all addresses that have changed) we need to
    //  strip it out.
    if (!leaveFlaggedChanges) {
        affectedElems.perform(
                function(anElem) {
                    TP.elementStripChangeFlags(anElem);
                });
    }

    //  Make sure to put the 'shouldSignalDOMLoaded' flag back to it's prior
    //  setting before exiting.
    TP.sys.shouldSignalDOMLoaded(sigFlag);

    return this;
});

//  -----------------------------------------------------------------------

TP.path.XMLPath.Inst.defineMethod('finalizeSetValue',
function(content, value) {

    /**
     * @method finalizeSetValue
     * @summary 'Finalizes' the value used when calling executeSet(). This may
     *     adjust the value to allow for more intelligent placement in the
     *     storage data structure.
     * @param {content} Node The content node that the value will be placed
     *     into.
     * @param {value} Object The value to finalize.
     * @returns {Object} The finalized value.
     */

    if (TP.isNode(value)) {
        return value;
    }

    return TP.str(value);
});

//  ------------------------------------------------------------------------

TP.path.XMLPath.Inst.defineMethod('$$getContentForSetOperation',
function(aNode, flagChanges) {

    /**
     * @method $$getContentForSetOperation
     * @summary Creates any content that is required in order to perform a
     *     'set' operation.
     * @param {aNode} Node The node to use as the common ancestor to build out
     *     any content that is required for a 'set' operation.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged.
     * @returns {Node[]} The array of Nodes that got built.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.path.XMLPath.Inst.defineMethod('getPathType',
function() {

    /**
     * @method getPathType
     * @summary Returns the receiver's 'path type'.
     * @returns {String} A path type
     */

    //  Note here that we return null, allowing the low-level primitive call to
    //  determine the path type. Subtypes of this type can override this to
    //  specify the path type.
    return null;
});

//  ------------------------------------------------------------------------

TP.path.XMLPath.Inst.defineMethod('getPathParts',
function() {

    /**
     * @method getPathParts
     * @summary Returns the receiver's parts.
     * @returns {String[]} An Array of the receiver's parts.
     */

    return TP.getAccessPathParts(this.get('srcPath'), 'xpointer');
});

//  ------------------------------------------------------------------------

TP.path.XMLPath.Inst.defineMethod('getPointerScheme',
function() {

    /**
     * @method getPointerScheme
     * @summary Returns the receiver's 'pointer scheme'.
     * @returns {String} An XPointer scheme depending on path type.
     */

    //  Note here that we return null, allowing the low-level primitive call to
    //  determine the path type. Subtypes of this type can override this to
    //  specify the path type.
    return null;
});

//  ------------------------------------------------------------------------

TP.path.XMLPath.Inst.defineMethod('$updateOpsBecomeDeleteInsertOps',
function(aNode, prevNode) {

    /**
     * @method $updateOpsBecomeDeleteInsertOps
     * @summary Returns whether 'update's to the data model should instead
     *     become 'delete'/'insert' pairs. This is dependent on the semantics of
     *     the underlying data structure.
     * @param {Node} aNode The current content Node.
     * @param {Node} prevNode Any previous content that was at the place in the
     *     data structure where aNode is now. This is used to determine what
     *     kind of change action to compute.
     * @returns {Boolean} Whether or not to change 'update's into
     *     'delete'/'insert's.
     */

    //  If we're doing a TP.UPDATE, but we're replacing a Node that had child
    //  Element content (detected either by new element child content or by
    //  previous Element content) then we return 'true' to turn 'update's into
    //  'delete/insert's.
    return TP.isCollectionNode(aNode) &&
               (TP.notEmpty(TP.nodeGetChildElements(aNode)) ||
                    TP.notEmpty(TP.nodeGetChildElements(prevNode)));
});

//  -----------------------------------------------------------------------

TP.path.XMLPath.Inst.defineMethod('valueIsStructural',
function(content, value) {

    /**
     * @method valueIsStructural
     * @summary Returns whether or not the value is considered 'structural', and
     *     will therefore 'mutate structure' if it is used as the value to set
     *     using the receiver.
     * @param {content} Node The content node that the value was placed into.
     * @param {value} Object The value to test.
     * @returns {Boolean} Whether or not the value is considered to be
     *     'structural'
     */

    return TP.isNode(value);
});

//  ========================================================================
//  TP.path.SimpleXMLPath
//  ========================================================================

TP.path.XMLPath.defineSubtype('SimpleXMLPath');

//  ------------------------------------------------------------------------

TP.path.SimpleXMLPath.Inst.defineMethod('$$getContentForSetOperation',
function(aNode, flagChanges) {

    /**
     * @method $$getContentForSetOperation
     * @summary Creates any content that is required in order to perform a
     *     'set' operation.
     * @param {aNode} Node The node to use as the common ancestor to build out
     *     any content that is required for a 'set' operation.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged.
     * @returns {Node[]} The array of Nodes that got built.
     */

    var path,
        attrName,

        retVal;

    if (TP.notValid(path = this.get('$transformedPath'))) {
        path = this.get('srcPath');
    }

    //  We can create an Attribute, if this is an attribute-only path (and
    //  shouldMakeStructures is true)
    if (TP.isElement(aNode) && TP.regex.ATTRIBUTE.test(path)) {

        attrName = path.slice(1);

        if (TP.elementHasAttribute(aNode, attrName, true)) {
            return TP.elementGetAttributeNode(aNode, attrName);
        }

        if (this.get('shouldMakeStructures')) {
            TP.elementSetAttribute(aNode, attrName, '', true);
            retVal = TP.elementGetAttributeNode(aNode, attrName);
            TP.elementFlagChange(aNode, TP.ATTR + attrName, TP.CREATE);
        }

        return retVal;
    }

    return null;
});

//  ========================================================================
//  TP.path.ElementPath
//  ========================================================================

TP.path.XMLPath.defineSubtype('ElementPath');

//  ------------------------------------------------------------------------

TP.path.ElementPath.Inst.defineMethod('$$getContentForSetOperation',
function(aNode, flagChanges) {

    /**
     * @method $$getContentForSetOperation
     * @summary Creates any content that is required in order to perform a
     *     'set' operation.
     * @param {aNode} Node The node to use as the common ancestor to build out
     *     any content that is required for a 'set' operation.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged.
     * @returns {Node[]} The array of Nodes that got built.
     */

    var path,
        content;

    if (TP.notValid(path = this.get('$transformedPath'))) {
        path = this.get('srcPath');
    }

    //  element schemes are fine as long as they reference an existing object.
    //  we can't build new content down an element path

    //  Note that TP.nodeEvaluateElementScheme() will only ever return one node
    //  (the 'path' down to the node must be unique).
    content = TP.nodeEvaluateElementScheme(aNode, path);

    if (!TP.isElement(content)) {
        TP.ifWarn() ?
            TP.warn(TP.annotate(
                        this,
                        'Unable to obtain content to set for path: ' +
                        path)) : 0;
    } else {
        //  To be API compliant, we wrap the single Element in an Array
        content = TP.ac(content);
    }

    return content;
});

//  ========================================================================
//  TP.path.XTensionPath
//  ========================================================================

TP.path.XMLPath.defineSubtype('XTensionPath');

//  ------------------------------------------------------------------------

TP.path.XTensionPath.Inst.defineMethod('$$getContentForSetOperation',
function(aNode, flagChanges) {

    /**
     * @method $$getContentForSetOperation
     * @summary Creates any content that is required in order to perform a
     *     'set' operation.
     * @param {aNode} Node The node to use as the common ancestor to build out
     *     any content that is required for a 'set' operation.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged.
     * @returns {Node[]} The array of Nodes that got built.
     */

    var path,
        content;

    if (TP.notValid(path = this.get('$transformedPath'))) {
        path = this.get('srcPath');
    }

    //  Evaluate the XTension syntax.
    content = TP.nodeEvaluateXTension(aNode, path, false);

    if (TP.notValid(content)) {
        TP.ifWarn() ?
            TP.warn(TP.annotate(
                        this,
                        'Unable to obtain content to set for path: ' +
                        path)) : 0;
    }

    return content;
});

//  ========================================================================
//  TP.path.CSSPath
//  ========================================================================

TP.path.XTensionPath.defineSubtype('CSSPath');

//  ------------------------------------------------------------------------

//  avoid binding and apply issues by creating our alias as a wrapper
TP.definePrimitive('cpc',
function(aPath, config) {

    /**
     * @method cpc
     * @summary Returns a newly initialized CSSPath instance.
     * @param {String} aPath The CSS path as a String.
     * @param {TP.core.Hash} config The configuration for this path.
     * @returns {TP.path.CSSPath} The new instance.
     */

    return TP.path.CSSPath.construct.apply(TP.path.CSSPath, arguments);
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.path.CSSPath.Inst.defineMethod('getPathType',
function() {

    /**
     * @method getPathType
     * @summary Returns the receiver's 'path type'.
     * @returns {String} A path type
     */

    return TP.CSS_PATH_TYPE;
});

//  ------------------------------------------------------------------------

TP.path.CSSPath.Inst.defineMethod('getPathParts',
function() {

    /**
     * @method getPathParts
     * @summary Returns the receiver's parts.
     * @returns {String[]} An Array of the receiver's parts.
     */

    return TP.getAccessPathParts(this.get('srcPath'), 'css');
});

//  ------------------------------------------------------------------------

TP.path.CSSPath.Inst.defineMethod('getPointerScheme',
function() {

    /**
     * @method getPointerScheme
     * @summary Returns the receiver's 'pointer scheme'.
     * @returns {String} An XPointer scheme depending on path type.
     */

    return 'css';
});

//  ========================================================================
//  TP.path.BarenamePath
//  ========================================================================

TP.path.XMLPath.defineSubtype('BarenamePath');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.path.BarenamePath.Inst.defineMethod('$$getContentForSetOperation',
function(aNode, flagChanges) {

    /**
     * @method $$getContentForSetOperation
     * @summary Creates any content that is required in order to perform a
     *     'set' operation.
     * @param {aNode} Node The node to use as the common ancestor to build out
     *     any content that is required for a 'set' operation.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged.
     * @returns {Node[]} The array of Nodes that got built.
     */

    var path,
        content;

    if (TP.notValid(path = this.get('$transformedPath'))) {
        path = this.get('srcPath');
    }

    //  Note we return an Array if we didn't get one to keep the API
    //  consistent (we can get an Array of attributes here due to 'special
    //  TIBET barename' syntax).
    if (!TP.isArray(content = TP.nodeEvaluateBarename(
                                    aNode,
                                    path,
                                    false,
                                    this.get('shouldMakeStructures')))) {
        content = TP.ac(content);
    }

    if (TP.notValid(content)) {
        TP.ifWarn() ?
            TP.warn(TP.annotate(
                        this,
                        'Unable to obtain content to set for path: ' +
                        path)) : 0;
    }

    return content;
});

//  ------------------------------------------------------------------------

TP.path.BarenamePath.Inst.defineMethod('getPathType',
function() {

    /**
     * @method getPathType
     * @summary Returns the receiver's 'path type'.
     * @returns {String} A path type
     */

    return TP.BARENAME_PATH_TYPE;
});

//  ------------------------------------------------------------------------

TP.path.BarenamePath.Inst.defineMethod('getPointerScheme',
function() {

    /**
     * @method getPointerScheme
     * @summary Returns the receiver's 'pointer scheme'.
     * @returns {String} An XPointer scheme depending on path type.
     */

    return '';
});

//  ========================================================================
//  XPath support
//  ========================================================================

//  ========================================================================
//  TP.extern.XPathFunctionResolver
//  ========================================================================

/*
Note that the setup for this type is handled dynamically during processing
of the getFunctionResolver method on TP.path.XPathPath.
*/

/* eslint-disable no-empty-function */
TP.extern.XPathFunctionResolver = function() {};
/* eslint-enable no-empty-function */

//  ========================================================================
//  TP.extern.XPathNamespaceResolver
//  ========================================================================

/*
Note that the setup for this type is handled dynamically during processing
of the getNSResolver method on TP.path.XPathPath.
*/

/* eslint-disable no-empty-function */
TP.extern.XPathNamespaceResolver = function() {};
/* eslint-enable no-empty-function */

//  ========================================================================
//  TP.extern.XPathVariableResolver
//  ========================================================================

/*
Note that the setup for this type is handled dynamically during processing
of the getVariableResolver method on TP.path.XPathPath.
*/

/* eslint-disable no-empty-function */
TP.extern.XPathVariableResolver = function() {};
/* eslint-enable no-empty-function */

//  ========================================================================
//  TP.path.XPathPath
//  ========================================================================

/**
 * @type {TP.path.XPathPath}
 */

//  ------------------------------------------------------------------------

TP.path.XMLPath.defineSubtype('XPathPath');

//  ------------------------------------------------------------------------

//  avoid binding and apply issues by creating our alias as a wrapper
TP.definePrimitive('xpc',
function(aPath, config, forceNative) {

    /**
     * @method xpc
     * @summary Returns a newly initialized XPathPath instance. Note that if
     *     you specify a non native path, the external XPath parser will be
     *     loaded. The default is a native path, unless namespace-qualified
     *     extension functions are found.
     * @param {String} aPath The XPath as a String.
     * @param {TP.core.Hash} config The configuration for this path.
     * @param {Boolean} forceNative Whether or not the path should be 'forced'
     *     to be a native path, rather than letting this type compute whether
     *     it is either a native or non-native path. See this type's
     *     discussion for more information.
     * @returns {TP.path.XPathPath} The new instance.
     */

    return TP.path.XPathPath.construct.apply(TP.path.XPathPath, arguments);
});

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  This RegExp detects paths with either custom XPath variable references
//  in it ('$' followed by word characters) or custom XPath namespaced
//  functions in it (word characters followed by colon followed by word
//  characters followed by an opening parenthesis).
TP.path.XPathPath.Type.defineConstant('NON_NATIVE_PATH_REGEX',
                                TP.rc('\\$\\w+|\\w+:[\\w-]+\\('));

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.path.XPathPath.Type.defineAttribute('$tpParser');
TP.path.XPathPath.Type.defineAttribute('$nsResolver');
TP.path.XPathPath.Type.defineAttribute('$fnResolver');
TP.path.XPathPath.Type.defineAttribute('$varResolver');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.path.XPathPath.Inst.defineAttribute('isNative');

TP.path.XPathPath.Inst.defineAttribute('$origPath');
TP.path.XPathPath.Inst.defineAttribute('$tpPath');
TP.path.XPathPath.Inst.defineAttribute('$tpContext');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.path.XPathPath.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    this.defineDependencies('TP.extern.XPathParser');

    return;
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Type.defineMethod('canonicalizePath',
function(aPath) {

    /**
     * @method canonicalizePath
     * @summary Returns the 'canonical' version of the supplied path. The
     *     canonical version is one where all shortcuts have been expanded.
     *     Note that this call will force loading of the non-native XPath
     *     parser to provide the canonical path expansion.
     * @param {String} aPath The path to canonicalize.
     * @returns {String} The canonicalized path.
     */

    var parser,
        primitiveXPathObj;

    parser = this.getParser();

    primitiveXPathObj = parser.parse(aPath);

    return primitiveXPathObj.expression.toString();
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Type.defineMethod('getFunctionResolver',
function() {

    /**
     * @method getFunctionResolver
     * @summary Returns the function resolver instance, a single instance used
     *     by the type to resolve XPaths with extension functions.
     * @returns {TP.extern.XPathFunctionResolver} A function resolver instance.
     */

    var resolver;

    if (TP.notValid(resolver = this.$get('$fnResolver'))) {
        //  Make sure to force the parser to load.
        this.getParser();

        //  now we can set up the TP.extern.XPathFunctionResolver type
        //  properly since we've got the TP.extern.XPathParser imported
        TP.extern.XPathFunctionResolver.prototype =
                        new TP.extern.XPathParser.FunctionResolver();

        TP.extern.XPathFunctionResolver.prototype.constructor =
                        TP.extern.XPathFunctionResolver;
        TP.extern.XPathFunctionResolver.prototype.superclass =
                        TP.extern.XPathParser.FunctionResolver.prototype;

        TP.extern.XPathFunctionResolver.prototype.getFunctionWithName =
            function(ns, ln, c) {

                var canonicalPrefix,
                    namespaceType;

                if (TP.notEmpty(ns) &&
                    TP.notEmpty(canonicalPrefix =
                                TP.w3.Xmlns.getCanonicalPrefix(ns))) {
                    if (TP.isType(namespaceType =
                                    (canonicalPrefix + ':').asType())) {
                        if (TP.isCallable(namespaceType[ln])) {
                            return namespaceType[ln];
                        }
                    }
                }

                return this.superclass.getFunctionWithName.bind(this)(
                                                                ns, ln, c);
            };

        resolver = new TP.extern.XPathFunctionResolver();

        this.$set('$fnResolver', resolver);
    }

    return resolver;
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Type.defineMethod('getNSResolver',
function() {

    /**
     * @method getNSResolver
     * @summary Returns the namespace resolver instance, a single instance
     *     used by the type to resolve namespace-related XPaths.
     * @returns {TP.extern.XPathNamespaceResolver} A namespace resolver
     *     instance.
     */

    var resolver;

    if (TP.notValid(resolver = this.$get('$nsResolver'))) {
        //  Make sure to force the parser to load.
        this.getParser();

        //  now we can set up the TP.extern.XPathNamespaceResolver type
        //  properly since we've got the TP.extern.XPathParser imported
        TP.extern.XPathNamespaceResolver.prototype =
                        new TP.extern.XPathParser.NamespaceResolver();

        TP.extern.XPathNamespaceResolver.prototype.constructor =
                        TP.extern.XPathNamespaceResolver;
        TP.extern.XPathNamespaceResolver.prototype.superclass =
                        TP.extern.XPathParser.NamespaceResolver.prototype;

        TP.extern.XPathNamespaceResolver.prototype.getNamespace =
            function(prefix, n) {

                var namespace;

                if (TP.notEmpty(prefix) &&
                    TP.isString(namespace =
                                TP.w3.Xmlns.getPrefixURI(prefix))) {
                    return namespace;
                }

                return this.superclass.getNamespace.bind(this)(prefix, n);
            };

        resolver = new TP.extern.XPathNamespaceResolver();

        this.$set('$nsResolver', resolver);
    }

    return resolver;
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Type.defineMethod('getParser',
function() {

    /**
     * @method getParser
     * @summary Returns the receiver's non-native XPath parser instance.
     * @returns {TP.extern.XPathParser|undefined} A function resolver instance.
     */

    var parser;

    if (TP.notValid(parser = this.$get('$tpParser'))) {
        if (TP.notValid(TP.extern.XPathParser)) {
            TP.ifWarn() ?
                TP.warn(TP.annotate(
                            this,
                            'Unable to obtain valid XPath parser')) : 0;
            return;
        }

        parser = new TP.extern.XPathParser();
        this.$set('$tpParser', parser);
    }

    return parser;
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Type.defineMethod('getVariableResolver',
function() {

    /**
     * @method getVariableResolver
     * @summary Returns the variable resolver instance, a single instance used
     *     by the type to resolve XPaths with variables.
     * @returns {TP.extern.XPathVariableResolver} A variable resolver instance.
     */

    var resolver;

    if (TP.notValid(resolver = this.$get('$varResolver'))) {
        //  Make sure to force the parser to load.
        this.getParser();

        //  now we can set up the TP.extern.XPathVariableResolver type
        //  properly since we've got the TP.extern.XPathParser imported
        TP.extern.XPathVariableResolver.prototype =
                        new TP.extern.XPathParser.VariableResolver();

        TP.extern.XPathVariableResolver.prototype.constructor =
                        TP.extern.XPathVariableResolver;
        TP.extern.XPathVariableResolver.prototype.superclass =
                        TP.extern.XPathParser.VariableResolver.prototype;

        TP.extern.XPathVariableResolver.prototype.getVariableWithName =
            function(ns, ln, c) {

                var $$result,

                    newNodeSet;

                switch (ln) {
                    case 'rowIndex':

                        return new TP.extern.XPathParser.XNumber(100);

                    default:

                        /* eslint-disable no-eval */
                        eval('$$result = ' + ln);
                        /* eslint-enable no-eval */

                        if (TP.isNumber($$result)) {
                            return new TP.extern.XPathParser.XNumber(
                                                                $$result);
                        } else if (TP.isBoolean($$result)) {
                            return new TP.extern.XPathParser.XBoolean(
                                                                $$result);
                        } else if (TP.isNode($$result)) {
                            newNodeSet =
                                    new TP.extern.XPathParser.XNodeSet();
                            newNodeSet.add($$result);
                        } else {
                            return new TP.extern.XPathParser.XString(
                                                    $$result.asString());
                        }

                        break;
                }

                return;
            };

        resolver = new TP.extern.XPathVariableResolver();

        this.$set('$varResolver', resolver);
    }

    return resolver;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.path.XPathPath.Inst.defineMethod('init',
function(aPath, config, forceNative) {

    /**
     * @method init
     * @summary Returns a newly initialized instance. Note that if you specify
     *     a non native path the external XPath parser will be loaded. The
     *     default is a native path, unless namespace-qualified extension
     *     functions are found.
     * @param {String} aPath The XPath as a String.
     * @param {TP.core.Hash} config The configuration for this path.
     * @param {Boolean} forceNative Whether or not the path should be 'forced'
     *     to be a native path, rather than letting this type compute whether
     *     it is either a native or non-native path. See this type's
     *     discussion for more information.
     * @returns {TP.path.XPathPath} The new instance.
     */

    var thePath,
        tnTestPath;

    //  Make sure that any 'xpath path' scheme is stripped off
    if (TP.regex.XPATH_POINTER.test(aPath)) {
        thePath = TP.regex.XPATH_POINTER.match(aPath).at(2);
    } else {
        thePath = aPath;
    }

    this.set('$origPath', thePath);

    //  Allow the shortcut convenience that TIBET provides of specifying the
    //  '$def:' prefix (intentionally illegal because it leads with a '$')
    //  for elements that are in the default namespace.
    TP.regex.XPATH_DEFAULTNS.lastIndex = 0;
    thePath = thePath.replace(TP.regex.XPATH_DEFAULTNS, '*[name()="$1"]');

    this.setPath(thePath, forceNative);

    //  Note here how we pass the modified path so that 'srcPath' gets properly
    //  set (even though 'setPath' did that above, our supertype won't know
    //  that).
    this.callNextMethod(thePath, config);

    if (TP.regex.XPATH_HAS_SCALAR_CONVERSION.test(thePath)) {
        tnTestPath = TP.regex.XPATH_HAS_SCALAR_CONVERSION.match(thePath).at(1);
    } else {
        tnTestPath = thePath;
    }

    if (TP.regex.TEXT_NODE_ENDS.test(tnTestPath)) {
        if (TP.isHash(config)) {
            this.set('shouldCollapse',
                        config.atIfInvalid('shouldCollapse', true));
        } else {
            this.set('shouldCollapse', true);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Inst.defineMethod('asReplacedString',
function(replacementFunction) {

    /**
     * @method asReplacedString
     * @summary Returns a String representation of the receiver after
     *     substitutions have taken place at each location step.
     * @description For a non-native path substitutions will be performed by
     *     the supplied Function which should take a single argument, that of
     *     the location step that the parser is currently at. For a native
     *     path no alteration occurs and the path's string value is returned
     *     unchanged.
     * @param {Function} replacementFunction The Function that will perform the
     *     replacement at each location step in the receiver.
     * @returns {String} The replaced String representation of the receiver.
     */

    var path;

    if (TP.notEmpty(path = this.$get('$tpPath'))) {
        return path.expression.toReplacedString(replacementFunction);
    }

    return this.asString();
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Inst.defineMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    var str,
        val;

    str = 'TP.path.XPathPath.construct(\'' + this.get('$origPath') +
            '\', ' +
            this.get('isNative') + ')';

    if ((val = this.get('shouldMakeStructures')) === true) {
        str += '.set(\'shouldMakeStructures\', ' + val + ')';
    }

    if ((val = this.get('shouldCollapse')) === true) {
        str += '.set(\'shouldCollapse\', ' + val + ')';
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @method asString
     * @summary Returns the String representation of the receiver. For
     *     non-native paths this is the string representation of the parsed
     *     expression (which is canonicalized).
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.path.XPathPath's String representation. The default is
     *     true.
     * @returns {String} The String representation of the receiver.
     */

    var wantsVerbose,

        path,
        repStr;

    wantsVerbose = TP.ifInvalid(verbose, true);

    if (wantsVerbose && TP.notEmpty(path = this.$get('$tpPath'))) {
        repStr = path.expression.toString();
    } else {
        repStr = this.$get('$origPath');
    }

    return repStr;
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Inst.defineMethod('$$createNodesForPath',
function(aNode, flagChanges) {

    /**
     * @method $$createNodesForPath
     * @summary Builds a set of nodes into the receiver's native node using
     *     the supplied path expression.
     * @description This method traverses up the given path expression, looking
     *     for matching nodes. If it finds them, it then works back down the
     *     expression, building out the nodes necessary for the expression to
     *     be able to work against a real tree.
     * @param {Node} aNode The node to start building the node tree based on
     *     the supplied expression.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged.
     * @returns {Node[]} The array of Nodes that got built.
     */

    var wasNative,
        oldMakeStruct,

        results;

    //  We need to temporarily switch the XPath to make sure it uses the
    //  non-native parser, so we save the settings of the path type and whether
    //  the parser is configured to create nodes as it executes.
    wasNative = this.get('isNative');
    oldMakeStruct = this.get('shouldMakeStructures');

    //  Switch the path type to a non native path and the create nodes on
    //  execution to true.
    this.set('isNative', false);
    this.set('shouldMakeStructures', true);

    //  created. note that we pass the flagging state here so the path can flag
    //  anything it has to create when the node is flagging changes
    results = this.execOnNative(aNode, TP.NODESET, false, flagChanges);

    //  Set the path type and the create nodes on execution switches back to
    //  their previous value.
    this.set('isNative', wasNative);
    this.set('shouldMakeStructures', oldMakeStruct);

    return results;
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Inst.defineMethod('$createNonNativeParserContext',
function(aPath) {

    /**
     * @method $createNonNativeParserContext
     * @summary Sets up the context information for the non-native XPath
     *     parser for the receiver.
     * @param {String} aPath The XPath as a String. Defaults to the receiver's
     *     current path.
     * @returns {TP.path.XPathPath} The receiver.
     */

    var path,
        context,
        parser;

    //  have we been here before for this path?
    if (aPath === this.$get('srcPath') &&
        TP.isValid(this.$get('$tpContext'))) {
        return this;
    }

    //  default to our internal path if one isn't provided
    path = TP.ifEmpty(aPath, this.$get('srcPath'));

    //  Use the parser that we allocated on the type and parse the path into
    //  the path construct used by the non-native parser. NOTE that
    //  requesting the parser in this fashion will force loading of the
    //  TP.extern.XPathParser code if it isn't already loaded
    parser = this.getType().getParser();

    this.$set('$tpPath', parser.parse(path));

    //  Allocate and initialize a TP.extern.XPathParser.XPathContext and
    //  supply the namespace and function resolver that we defined on the
    //  type.
    context = new TP.extern.XPathParser.XPathContext(
                                this.getType().getVariableResolver(),
                                this.getType().getNSResolver(),
                                this.getType().getFunctionResolver());

    context.shouldCreateNodes = false;

    this.$set('$tpContext', context);

    return this;
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Inst.defineMethod('exec',
function(aTPNode, resultType, logErrors, flagChanges) {

    /**
     * @method exec
     * @summary 'Executes' the XPath by evaluating it against the supplied
     *     TP.dom.Node.
     * @param {TP.dom.Node} aTPNode The TP.dom.Node to execute the receiver
     *     against.
     * @param {Number} resultType The type of result desired, either TP.NODESET
     *     or TP.FIRST_NODE.
     * @param {Boolean} logErrors Used to turn off error notification,
     *     particularly during operations such as String localization which can
     *     cause recusion issues.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged. Defaults to the value set by the TP.dom.Node being
     *     processed.
     * @returns {Object} The result of evaluating the receiver against the
     *     supplied TP.dom.Node. Will be one of: String, Number, Boolean or
     *     Array (of Nodes).
     */

    var flag;

    if (TP.isValid(flag)) {
        flag = flagChanges;
    } else {
        flag = aTPNode.shouldFlagChanges();
    }

    return this.execOnNative(
                    aTPNode.getNativeNode(),
                    resultType,
                    logErrors,
                    flag);
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Inst.defineMethod('execOnNative',
function(aNode, resultType, logErrors, flagChanges) {

    /**
     * @method execOnNative
     * @summary 'Executes' the XPath by evaluating it against the supplied
     *     Node.
     * @param {Node} aNode The Node to execute the receiver against.
     * @param {Number} resultType The type of result desired, either TP.NODESET
     *     or TP.FIRST_NODE.
     * @param {Boolean} logErrors Used to turn off error notification,
     *     particularly during operations such as string localization which can
     *     cause recusion issues.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged.
     * @returns {Object} The result of evaluating the receiver against the
     *     supplied TP.dom.Node. Will be one of: String, Number, Boolean or
     *     Array (of Nodes).
     */

    var flag,
        path,
        context,
        result;

    flag = TP.ifEmpty(flagChanges, false);

    if (TP.notValid(path = this.get('$transformedPath'))) {
        path = this.get('srcPath');
    }

    //  One thing to note is that if you run an XPath against an HTML document
    //  you have to use the external XPath parser _EVEN_ if there are no
    //  non-native constructs in the path. Which means, in essence, that
    //  we're only a native path at execution time if we're native in terms of
    //  syntax, AND being evaluated against a valid XML document... oh and we
    //  can't be requesting to flag changes :)
    if (this.isNativePath() &&
        TP.isXMLDocument(TP.nodeGetDocument(aNode)) &&
        !flag) {
        //  Note here how we use the primitive call. If we used
        //  TP.dom.Node's evaluateXPath(), we'd likely recurse because we
        //  are most likely being called from there.
        return TP.nodeEvaluateXPath(aNode, path, resultType, logErrors);
    }

    //  If we're here its because we're either not a native path, or we're
    //  being run against an HTML document, or we're being asked to flag
    //  changes.
    //  Either way we need to process the path using the non-native XPath
    //  processor...

    //  create a non-native context if necessary
    if (TP.notValid(context = this.$get('$tpContext'))) {
        this.$createNonNativeParserContext(path);
        context = this.$get('$tpContext');
    }

    //  configure the context node to the node provided
    context.expressionContextNode = aNode;

    //  tag the context with our change flagging status
    context.shouldFlagNodes = flag;

    //  set error logging control flag as well
    context.logErrors = TP.ifInvalid(logErrors, true);

    //  run that baby!
    result = this.$get('$tpPath').evaluate(context);

    //  We need to switch on result's constructor to find out the type of what
    //  was returned and then convert it to a native JavaScript object. Note
    //  that the default case is for when we've had a node set returned and we
    //  must convert it to a JS array.
    switch (result.constructor) {
        case TP.extern.XPathParser.XString:

            return result.stringValue();

        case TP.extern.XPathParser.XNumber:

            return result.numberValue();

        case TP.extern.XPathParser.XBoolean:

            return result.booleanValue();

        default:

            if (resultType === TP.FIRST_NODE) {
                return result.first();
            } else {
                return result.toArray();
            }
    }
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Inst.defineMethod('execRemove',
function(aTPNode, shouldSignal) {

    /**
     * @method execRemove
     * @summary Removes all nodes under the receiver which match the XPath
     *     provided. This method is typically called via remove when an XPath
     *     is provided as the attributeName.
     * @param {TP.dom.Node} aTPNode The TP.dom.Node to execute the receiver
     *     against.
     * @param {shouldSignal} Boolean If false, no signaling occurs. Defaults to
     *     targetObj.shouldSignalChange().
     * @returns {String[]} An Array of the changed Node addresses.
     */

    var node,

        oldMakeStruct,
        results,

        targetTPDoc,
        signalChange,

        changedAddresses,

        len,
        i,

        elem;

    node = aTPNode.getNativeNode();

    oldMakeStruct = this.get('shouldMakeStructures');
    this.set('shouldMakeStructures', false);

    this.set('isNative', false);
    results = this.execOnNative(node, TP.NODESET, false);

    this.set('shouldMakeStructures', oldMakeStruct);

    //  If there were no results, there probably wasn't a valid XPath.
    //  Exit here.
    if (TP.notValid(results) || results.getSize() === 0) {
        return this;
    }

    targetTPDoc = aTPNode.getDocument();

    if (TP.isValid(shouldSignal)) {
        signalChange = shouldSignal;
    } else if (TP.isValid(targetTPDoc)) {
        signalChange = targetTPDoc.shouldSignalChange();
    }

    changedAddresses = TP.ac();

    len = results.getSize();

    //  Found something, so now we have to remove it (and/or flag as needed)
    for (i = 0; i < len; i++) {
        node = results[i];

        changedAddresses.push(TP.nodeGetDocumentPosition(node));

        //  If what we have is an attribute then we are being asked to remove
        //  it from it's containing element
        if (node.nodeType === Node.ATTRIBUTE_NODE) {
            elem = TP.attributeGetOwnerElement(node);

            //  flag the attribute's owner element as having changed
            if (aTPNode.shouldFlagChanges()) {
                TP.elementFlagChange(elem, TP.ATTR + node.name, TP.DELETE);
            }

            //  Rip out the attribute itself so it won't be seen in any
            //  serialization of the DOM. Unfortunately our current flagging
            //  model doesn't allow filtering as we do at the element level, so
            //  we have to do this here and rely on the flagging to say that
            //  this attribute once existed.
            elem.removeAttributeNode(node);

            if (signalChange) {
                this.$changed('@' + node.name, TP.DELETE);
            }
        } else {
            //  when dealing with other elements we get their parent node so
            //  we can remove when needed
            elem = node.parentNode;

            if (aTPNode.shouldFlagChanges()) {
                //  if we're flagging rather than 'doing' then we set the
                //  change flag to TP.DELETE and that's all
                TP.elementFlagChange(node, TP.SELF, TP.DELETE);

                TP.ifTrace() && TP.$DEBUG ?
                    TP.trace('Node flagged: ' + TP.nodeAsString(node)) : 0;
            } else {
                //  if we're not flagging then just rip it out of the DOM
                TP.nodeRemoveChild(elem, node);
            }

            if (signalChange) {
                TP.wrap(elem).$changed('content', TP.DELETE);
            }
        }
    }

    return changedAddresses;
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Inst.defineMethod('$$getContentForSetOperation',
function(aNode, flagChanges) {

    /**
     * @method $$getContentForSetOperation
     * @summary Creates any content that is required in order to perform a
     *     'set' operation.
     * @param {aNode} Node The node to use as the common ancestor to build out
     *     any content that is required for a 'set' operation.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged.
     * @returns {Node[]} The array of Nodes that got built.
     */

    var shouldMake,

        newPath,

        results,

        path,
        lastSegment,
        ndx;

    shouldMake = this.get('shouldMakeStructures');

    if (TP.notValid(path = this.get('$transformedPath'))) {
        path = this.get('srcPath');
    }

    if (TP.regex.XPATH_HAS_SCALAR_CONVERSION.test(path)) {
        newPath = TP.regex.XPATH_HAS_SCALAR_CONVERSION.match(path).at(1);

        if (TP.notEmpty(newPath)) {
            newPath = TP.xpc(newPath);

            //  Since we're now dealing with a scalar path, we change shouldMake
            //  to be the value of 'shouldMakeValues'.
            shouldMake = this.get('shouldMakeValues');

            results = newPath.execOnNative(
                                    aNode, TP.NODESET, false, flagChanges);
        }
    } else {
        //  We pass 'false' to not log errors here - we may be constructing.
        results = this.execOnNative(aNode, TP.NODESET, false, flagChanges);
    }

    //  If we found content by executing ourself against the target object,
    //  then most other concerns are moot - we got at least one targeted node
    //  (even if that's an attribute node) and we can set it's value.

    //  If we didn't, well we've more work to do.
    if (TP.isEmpty(results)) {

        //  only support build on demand behavior if the flag is set
        if (TP.notTrue(shouldMake)) {
            TP.ifWarn() ?
                TP.warn(TP.annotate(
                            this,
                            'Unable to obtain content to set for path: ' +
                            path)) : 0;

            return TP.ac();
        }

        //  attribute-targeting paths can make life interesting since we may
        //  want to access the elements and add the attribute when not found,
        //  or we may want to only operate on pre-existing attribute nodes.
        //  Although standard technologies such as XForms (section 4.2.2)
        //  implies we don't build new attributes when they're missing from
        //  existing instances, we don't think that's particularly practical
        //  from a development perspective so we tend to build them and manage
        //  relevancy separately from whether the data exists or not
        if (TP.regex.HAS_AT.test(path)) {
            lastSegment = path;

            if ((ndx = path.lastIndexOf('/')) !== TP.NOT_FOUND) {
                lastSegment = path.slice(ndx + 1);
            }

            //  We have a choice here based on how we want to deal with
            //  attribute-targeting paths where the nodes don't exist yet. If
            //  we only want to process those nodes that exist we leave the
            //  attribute portion on the XPath and let it return attribute
            //  nodes. If we want to be able to build those attributes on the
            //  fly when they're missing we need to strip off the attribute
            //  portion of the path and run it to get the elements being
            //  targeted. As it turns out we always build them for binding
            //  support so we have to strip off the tail and run with that.

            //  If the first character of the last segment is a '@', or the
            //  last segment starts with 'attribute::' then we're dealing with
            //  an attribute path after all
            if (lastSegment.charAt(0) === '@') {
                newPath = TP.xpc(path.slice(0, ndx));
            } else if (lastSegment.startsWith('attribute::')) {
                newPath = TP.xpc(path.slice(0, ndx));
            }
        }

        if (TP.notValid(newPath)) {
            /* eslint-disable consistent-this */
            newPath = this;
            /* eslint-enable consistent-this */
        }

        //  Note that results will always be a TP.NODESET
        results = newPath.$$createNodesForPath(aNode, flagChanges);

        if (TP.isEmpty(results)) {
            //  unable to build nodes... path may not be specific enough
            TP.ifWarn() ?
                TP.warn(TP.annotate(
                            this,
                            'Unable to build content for path: ' + path)) : 0;

            return TP.ac();
        }
    }

    return results;
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Inst.defineMethod('getPathType',
function() {

    /**
     * @method getPathType
     * @summary Returns the receiver's 'path type'.
     * @returns {String} A path type
     */

    return TP.XPATH_PATH_TYPE;
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Inst.defineMethod('getPointerScheme',
function() {

    /**
     * @method getPointerScheme
     * @summary Returns the receiver's 'pointer scheme'.
     * @returns {String} An XPointer scheme depending on path type.
     */

    return 'xpath1';
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Inst.defineMethod('getShouldMakeStructures',
function() {

    /**
     * @method getShouldMakeStructures
     * @summary Returns whether the receiver is currently configured to create
     *     Nodes as it is executed against a particular context node.
     * @returns {Boolean} Whether the receiver is configured to create nodes as
     *     it executes.
     */

    var context;

    //  if we have a context it will know, otherwise we assume false since
    //  we'd have to have a context to process otherwise
    if (TP.isValid(context = this.$get('$tpContext'))) {
        return context.shouldCreateNodes;
    }

    //  Note that we use $get() here to avoid endless recursion
    return this.$get('shouldMakeStructures');
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Inst.defineMethod('getReferencedNodes',
function(aNode) {

    /**
     * @method getReferencedNodes
     * @summary Returns an Array of the Nodes that are referenced by this
     *     path, using aNode as the 'context node' (e.g. starting point).
     * @param {Node|TP.dom.Node} aNode The Node to execute the receiver
     *     against.
     * @returns {TP.dom.Node[]} The array of TP.dom.Nodes referenced by the
     *     receiver.
     */

    var context,

        pathExprs,
        parser,
        stepNodes,

        len,
        i,
        expr,

        tpPath,
        tpResult;

    //  force creation of a non-native path processing context
    if (TP.notValid(context = this.$get('$tpContext'))) {
        this.$createNonNativeParserContext();
        context = this.$get('$tpContext');
    }

    //  collect the location "subpaths" in this XPath
    pathExprs = this.getReferencedLocationPaths();

    //  if the location subpaths contains 1 path it's the path itself, so there
    //  are no 'referenced nodes'
    if (pathExprs.getSize() === 1) {
        return TP.ac();
    }

    //  Grab the non-native context and parser objects and configure them
    //  in preparation for executing the path at each referenced location

    //  Make sure to TP.unwrap() aNode - it might have been a TP.dom.Node.
    context.expressionContextNode = TP.unwrap(aNode);

    parser = this.getType().getParser();

    stepNodes = TP.ac();

    //  Loop over each referenced location path, parsing and evaluating
    //  each path and adding the results to stepNodes.
    len = pathExprs.getSize();
    for (i = 0; i < len; i++) {
        expr = pathExprs.at(i);

        tpPath = parser.parse(expr);
        tpResult = tpPath.evaluate(context);

        stepNodes.add(tpResult.toArray());
    }

    //  flatten stepNodes out as it probably has multiple Arrays (if more
    //  than one stepExpr had results, which is highly likely).
    stepNodes = stepNodes.flatten();

    return stepNodes;
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Inst.defineMethod('getReferencedLocationPaths',
function() {

    /**
     * @method getReferencedLocationPaths
     * @summary Returns an Array of the location path Strings that are used by
     *     this path any place in its expression.
     * @returns {String[]} An array of Strings that represent location paths
     *     referenced by the expression in the receiver.
     */

    var locationPaths;

    //  Grab all of the location paths referenced by the receiver and
    //  transform them into their String representation.
    locationPaths = this.$getReferencedLocationPathObjects();
    locationPaths.convert(
            function(aPathObj) {
                //  These are Objects produced by the custom XPath parser - we
                //  need to '.toString()' them.
                return aPathObj.toString();
            });

    return locationPaths;
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Inst.defineMethod('$getReferencedLocationPathObjects',
function() {

    /**
     * @method $getReferencedLocationPathObjects
     * @summary Returns an Array of the location path objects that are used by
     *     this path any place in its expression.
     * @returns {String[]} The array of PathExpr objects that represent location
     *     paths referenced by the expression in the receiver.
     */

    var locationPaths;

    //  force creation of a non-native path processing context, which will
    //  ensure that we get a parsed path set in the tpPath attribute
    if (TP.notValid(this.$get('$tpContext'))) {
        this.$createNonNativeParserContext();
    }

    locationPaths = TP.ac();

    //  Grab all of the location paths referenced by the receiver.
    this.$get('$tpPath').expression.gatherLocationPathsInto(locationPaths);

    return locationPaths;
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Inst.defineMethod('getReferencedLocationStepsAtPath',
function(aPathIndex) {

    /**
     * @method getReferencedLocationStepsAtPath
     * @summary Returns an Array of location steps that make up the location
     *     path at the index supplied.
     * @param {Number} aPathIndex The index of the location path to obtain the
     *     steps for. This will default to 0 if not supplied.
     * @returns {String[]} An array of Strings that represent location steps
     *     that make up the location path at the supplied index.
     */

    var pathIndex,
        locationPaths,
        locationSteps;

    pathIndex = TP.ifInvalid(aPathIndex, 0);

    //  Grab all of the location paths referenced by the receiver.
    locationPaths = this.$getReferencedLocationPathObjects();

    if (TP.isEmpty(locationPaths)) {
        return TP.ac();
    }

    locationSteps = locationPaths.at(pathIndex).locationPath.steps;
    locationSteps.convert(
            function(aStepObj) {
                //  These are Objects produced by the custom XPath parser - we
                //  need to '.toString()' them.
                return aStepObj.toString();
            });

    return locationSteps;
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Inst.defineMethod('isAbsolute',
function() {

    /**
     * @method isAbsolute
     * @summary Returns whether or not the receiver contains an 'absolute'
     *     XPath (that is, one that starts with a '/').
     * @returns {Boolean} Whether or not the receiver contains an 'absolute'
     *     XPath.
     */

    var path;

    //  if we've got a tpPath (non-native parsed path content) we can ask it
    if (TP.isValid(path = this.$get('$tpPath'))) {
        return path.expression.locationPath.absolute;
    }

    //  simple check on native paths is does it start with "/"
    return this.$get('srcPath').startsWith('/');
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Inst.defineMethod('isNativePath',
function(aFlag) {

    /**
     * @method isNativePath
     * @summary Returns true if the receiver can execute using the browser's
     *     native XPath parser. The default for most paths is true, however if
     *     you've requested special processing such as node creation or
     *     extension function handling this will return false.
     * @param {Boolean} aFlag True will force the path to be a native path if
     *     possible, false will set it to non native path.
     * @returns {Boolean} Whether or not native processing is sufficient.
     */

    var path;

    if (TP.isBoolean(aFlag)) {
        path = this.$get('srcPath');

        if (aFlag) {
            if (TP.path.XPathPath.NON_NATIVE_PATH_REGEX.test(path)) {
                TP.ifWarn() ?
                    TP.warn('Found non-native XPath constructs in XPath: ' +
                            path +
                            '. Forcing XPath to use non native parser.') : 0;

                this.set('isNative', false);

                this.$createNonNativeParserContext(path);
            } else {
                this.set('isNative', true);
            }
        } else {
            this.set('isNative', false);

            this.$createNonNativeParserContext(path);
        }
    }

    return this.get('isNative');
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Inst.defineMethod('setShouldMakeStructures',
function(shouldMakeStruct) {

    /**
     * @method setShouldMake
     * @summary Sets whether the receiver is currently configured to create
     *     Nodes as it is executed against a particular context node.
     * @param {shouldMakeStruct} Boolean the receiver should be configured to
     *     create nodes as it executes.
     * @returns {TP.path.XPathPath} The receiver.
     */

    var context;

    if (TP.isTrue(shouldMakeStruct)) {
        //  force creation of a non-native parsing context, and set ourselves
        //  to be a non-native path (can't do this operation with native paths)
        this.isNativePath(false);
    }

    //  If we've got a context already then update it, but don't create one
    //  just to say "false"
    if (TP.isValid(context = this.$get('$tpContext'))) {
        context.shouldCreateNodes = shouldMakeStruct;
    }

    //  Note that we use $set() here to avoid endless recursion
    this.$set('shouldMakeStructures', shouldMakeStruct);

    return this;
});

//  ------------------------------------------------------------------------

TP.path.XPathPath.Inst.defineMethod('setPath',
function(aPath, forceNative) {

    /**
     * @method setPath
     * @summary Sets the XPath expression for the receiver to the supplied
     *     path. The caller can also force the path type to be of a particular
     *     type, but if the path contains namespace-qualified extension
     *     functions it will force the path to be a non native path.
     * @param {String} aPath The XPath as a String.
     * @param {Boolean} forceNative Whether or not the path should be 'forced'
     *     to be a native path, rather than letting this type compute whether
     *     it is either a native or non-native path. See this type's
     *     discussion for more information.
     * @returns {TP.path.XPathPath} The receiver.
     */

    var pathType;

    if (TP.notValid(forceNative)) {
        //  based on whether it looks like a non-native path we'll either
        //  accept their input or ensure consistent processing
        if (TP.path.XPathPath.NON_NATIVE_PATH_REGEX.test(aPath)) {
            if (forceNative) {
                TP.ifWarn() ?
                    TP.warn('Found non-native XPath constructs in XPath: ' +
                            aPath +
                            '. Forcing XPath to use non native parser.') : 0;
            }

            pathType = false;
        } else {
            pathType = true;
        }
    } else {
        pathType = forceNative;
    }

    this.set('isNative', pathType);

    //  If we're a non-native path we'll need additional processing assistance
    //  so we get that configured once at initialization time
    if (pathType === TP.path.XPathPath.NON_NATIVE_PATH) {
        this.$createNonNativeParserContext(aPath);
    }

    //  Save the path itself, but NOTE that we do this last so that the
    //  $createNonNativeParserContext processing can test against the "current"
    //  path, not the new one to see if a new context needs to be created.
    this.$set('srcPath', aPath);

    return this;
});

//  ========================================================================
//  TP.w3.DTDInfo
//  ========================================================================

/**
 * @type {TP.w3.DTDInfo}
 * @summary This type of JSONContent provides convenience routines for
 *     accessing and validating DTD data as processed by the scripts located
 *     here: https://github.com/djwmarks/html4-dtd-json
 * @description This type accesses data that has a structure that could contain
 *     items such as these. Note that this is not a complete description of the
 *     data schema. See the data file itself for more structural elements:
 *
 *     'data': { 'element': { 'ul': { 'attributes': { 'id': { 'default': '',
 *     'type': '#implied', 'value': 'cdata', } }, 'cdata': false,
 *     'childElements': [], 'contentType': 'element', 'contentModel': {
 *     'expanded': { 'sequenceGroup': { 'children': [], 'elements': ['li'],
 *     'text': false } } }, 'empty': false, 'omitStart': false, 'omitEnd':
 *     false, 'text': false } } }
 */

//  ------------------------------------------------------------------------

TP.core.JSONContent.defineSubtype('w3.DTDInfo');

TP.w3.DTDInfo.Type.defineAttribute('schemaInfo');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.w3.DTDInfo.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    var dtdInfo;

    dtdInfo = this.$get('schemaInfo');
    if (TP.isValid(dtdInfo)) {
        TP.w3.DocType.HTML_401_STRICT.set('dtdInfo', this.construct(dtdInfo));
    }

    return;
});

//  ------------------------------------------------------------------------

TP.w3.DTDInfo.Type.defineMethod('canConstruct',
function(data, uri) {

    /**
     * @method canConstruct
     * @summary Returns true if the receiver can construct a valid instance
     *     given the parameters provided.
     * @param {String} data The content data in question.
     * @param {URI} uri The TIBET URI object which loaded the content.
     * @returns {Boolean} Whether or not an instance of this can be constructed
     *     from the parameters provided.
     */

    //  Must be JSON for starters...but we also want to restrict it to
    //  JSON with keys hopefully unique to the DTD result dataset.
    return TP.isJSONString(data) &&
            /childElements/.test(data) &&
            /contentModel/.test(data);
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.w3.DTDInfo.Inst.defineAttribute(
    'elements', TP.apc('element', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.w3.DTDInfo.Inst.defineMethod('elementIsValidChildOf',
function(childElementName, parentElementName) {

    /**
     * @method elementIsValidChildOf
     * @summary Returns whether or not the child element is a valid child of
     *     the parent element given the information in the contained schema.
     * @param {String} childElementName The name of the child element.
     * @param {String} parentElementName The name of the parent element.
     * @returns {Boolean} Whether or not the child element is a valid child of
     *     the parent element.
     */

    var parentContentModels,
        groupElem,
        childElems,
        len,
        i,
        contentModel;

    parentContentModels = this.get('elements').at(
                            parentElementName).at(
                            'contentModel').at(
                            'expanded');

    //  There could be more than one parent content model describing valid
    //  child elements. We must iterate through them all. They can take the
    //  form of an 'orGroup', 'andGroup' or 'sequenceGroup'.
    len = parentContentModels.getSize();
    for (i = 0; i < len; i++) {
        contentModel = parentContentModels.at(i);

        if (TP.isEmpty(groupElem = contentModel.at('orGroup'))) {
            if (TP.isEmpty(groupElem =
                            contentModel.at('sequenceGroup'))) {
                groupElem = contentModel.at('andGroup');
            }
        }

        if (TP.isElement(groupElem) &&
                TP.isArray(childElems = groupElem.at('elements'))) {
            break;
        }
    }

    if (TP.isEmpty(childElems)) {
        return false;
    }

    return childElems.contains(childElementName);
});

//  ========================================================================
//  JSONPath Parser
//  ========================================================================

//  Generate this by executing the following command (assuming NodeJS is
//  available):

//  pegjs --export-var 'TP.$JSONPathParser' <tibet_dir>/src/tibet/grammars/jsonpath_parser.pegjs

/* eslint-disable */
TP.$JSONPathParser = (function() {
  /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleFunctions = { start: peg$parsestart },
        peg$startRuleFunction  = peg$parsestart,

        peg$c0 = [],
        peg$c1 = peg$FAILED,
        peg$c2 = function(body) {return {expression: {type: "root", value: body}}},
        peg$c3 = function(body) {return {operation: "member", scope: "child", expression:{ type: "identifier", value: body }}},
        peg$c4 = function() {return {expression: {type: "root", value: "$"}}},
        peg$c5 = function(body) {body.operation = "member"; return body},
        peg$c6 = function(body) {body.operation = "subscript"; return body},
        peg$c7 = function(body) {return {scope: "descendant", value: body}},
        peg$c8 = function(body) {return {scope: "child", value: body}},
        peg$c9 = function(body) {return {scope: "parent", value: body}},
        peg$c10 = null,
        peg$c11 = void 0,
        peg$c12 = function(body) {return body},
        peg$c13 = function(body) {return {scope: "child", operation: "member", value: body}},
        peg$c14 = function(body) {return {expression: {type: "wildcard", value: body}}},
        peg$c15 = function(body) {return {expression: {type: "identifier", value: body}}},
        peg$c16 = function(body) {return {expression: {type: "script_expression", value: body}}},
        peg$c17 = function(body) {return {expression: {type: "numeric_literal", value: parseInt(body)}}},
        peg$c18 = "[",
        peg$c19 = { type: "literal", value: "[", description: "\"[\"" },
        peg$c20 = "]",
        peg$c21 = { type: "literal", value: "]", description: "\"]\"" },
        peg$c22 = ",",
        peg$c23 = { type: "literal", value: ",", description: "\",\"" },
        peg$c24 = function(content) {return content},
        peg$c25 = function(first, rest) {return {expression: {type: "union", value: [first].concat(rest)}}},
        peg$c26 = function(body) {return {expression: {type:"wildcard", value: body}}},
        peg$c27 = function(body) {return {expression: {type:"slice", value: body}}},
        peg$c28 = function(body) {return {expression: {type:"index", value: body}}},
        peg$c29 = function(body) {return {expression: {type:"identifier", value: body}}},
        peg$c30 = function(body) {return {expression: {type:"script_expression", value: body}}},
        peg$c31 = function(body) {return {expression: {type:"filter_expression", value: body}}},
        peg$c32 = function(body) {return {expression: {type:"string_literal", value: body}}},
        peg$c33 = /^[a-zA-Z0-9_{}]/,
        peg$c34 = { type: "class", value: "[a-zA-Z0-9_{}]", description: "[a-zA-Z0-9_{}]" },
        peg$c35 = function(body) {return body.join("")},
        peg$c36 = ":",
        peg$c37 = { type: "literal", value: ":", description: "\":\"" },
        peg$c38 = function(start, end) {return {start:start, end:end}},
        peg$c39 = function() {return parseInt(text());},
        peg$c40 = function(chars) {return chars.join("")},
        peg$c41 = "?",
        peg$c42 = { type: "literal", value: "?", description: "\"?\"" },
        peg$c43 = function(inner) {return inner},
        peg$c44 = "(",
        peg$c45 = { type: "literal", value: "(", description: "\"(\"" },
        peg$c46 = ")",
        peg$c47 = { type: "literal", value: ")", description: "\")\"" },
        peg$c48 = { type: "any", description: "any character" },
        peg$c49 = "\\(",
        peg$c50 = { type: "literal", value: "\\(", description: "\"\\\\(\"" },
        peg$c51 = function(body) {return "(" + body.join("") + ")"},
        peg$c52 = function(body) {return "("+ body.join("") +")"},
        peg$c53 = "$",
        peg$c54 = { type: "literal", value: "$", description: "\"$\"" },
        peg$c55 = "..",
        peg$c56 = { type: "literal", value: "..", description: "\"..\"" },
        peg$c57 = ".",
        peg$c58 = { type: "literal", value: ".", description: "\".\"" },
        peg$c59 = "*",
        peg$c60 = { type: "literal", value: "*", description: "\"*\"" },
        peg$c61 = "^",
        peg$c62 = { type: "literal", value: "^", description: "\"^\"" },
        peg$c63 = { type: "other", description: "number" },
        peg$c64 = function() { return parseFloat(text()); },
        peg$c65 = /^[1-9]/,
        peg$c66 = { type: "class", value: "[1-9]", description: "[1-9]" },
        peg$c67 = /^[eE]/,
        peg$c68 = { type: "class", value: "[eE]", description: "[eE]" },
        peg$c69 = "-",
        peg$c70 = { type: "literal", value: "-", description: "\"-\"" },
        peg$c71 = "+",
        peg$c72 = { type: "literal", value: "+", description: "\"+\"" },
        peg$c73 = "0",
        peg$c74 = { type: "literal", value: "0", description: "\"0\"" },
        peg$c75 = { type: "other", description: "string" },
        peg$c76 = function(chars) { return chars.join(""); },
        peg$c77 = "\"",
        peg$c78 = { type: "literal", value: "\"", description: "\"\\\"\"" },
        peg$c79 = "\\",
        peg$c80 = { type: "literal", value: "\\", description: "\"\\\\\"" },
        peg$c81 = "/",
        peg$c82 = { type: "literal", value: "/", description: "\"/\"" },
        peg$c83 = "b",
        peg$c84 = { type: "literal", value: "b", description: "\"b\"" },
        peg$c85 = function() { return "\b"; },
        peg$c86 = "f",
        peg$c87 = { type: "literal", value: "f", description: "\"f\"" },
        peg$c88 = function() { return "\f"; },
        peg$c89 = "n",
        peg$c90 = { type: "literal", value: "n", description: "\"n\"" },
        peg$c91 = function() { return "\n"; },
        peg$c92 = "r",
        peg$c93 = { type: "literal", value: "r", description: "\"r\"" },
        peg$c94 = function() { return "\r"; },
        peg$c95 = "t",
        peg$c96 = { type: "literal", value: "t", description: "\"t\"" },
        peg$c97 = function() { return "\t"; },
        peg$c98 = "u",
        peg$c99 = { type: "literal", value: "u", description: "\"u\"" },
        peg$c100 = function(digits) {
                  return String.fromCharCode(parseInt(digits, 16));
                },
        peg$c101 = function(sequence) { return sequence; },
        peg$c102 = /^[ -!#-[\]-\u10FFFF]/,
        peg$c103 = { type: "class", value: "[ -!#-[\\]-\\u10FFFF]", description: "[ -!#-[\\]-\\u10FFFF]" },
        peg$c104 = /^[0-9]/,
        peg$c105 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c106 = /^[0-9a-f]/i,
        peg$c107 = { type: "class", value: "[0-9a-f]i", description: "[0-9a-f]i" },
        peg$c108 = { type: "other", description: "whitespace" },
        peg$c109 = /^[ \t\n\r]/,
        peg$c110 = { type: "class", value: "[ \\t\\n\\r]", description: "[ \\t\\n\\r]" },

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        peg$reportedPos
      );
    }

    function error(message) {
      throw peg$buildException(message, null, peg$reportedPos);
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, pos) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var posDetails = peg$computePosDetails(pos),
          found      = pos < input.length ? input.charAt(pos) : null;

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
    }

    function peg$parsestart() {
      var s0, s1;

      s0 = [];
      s1 = peg$parseJSON_PATH();
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        s1 = peg$parseJSON_PATH();
      }

      return s0;
    }

    function peg$parseJSON_PATH() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseDOLLAR();
      if (s1 !== peg$FAILED) {
        s2 = peg$parsePATH_COMPONENTS();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c2(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseLEADING_CHILD_MEMBER_EXPRESSION();
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseLEADING_CHILD_MEMBER_EXPRESSION();
          if (s1 !== peg$FAILED) {
            s2 = peg$parsePATH_COMPONENTS();
            if (s2 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c3(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseDOLLAR();
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c4();
            }
            s0 = s1;
          }
        }
      }

      return s0;
    }

    function peg$parsePATH_COMPONENTS() {
      var s0, s1;

      s0 = [];
      s1 = peg$parsePATH_COMPONENT();
      if (s1 !== peg$FAILED) {
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          s1 = peg$parsePATH_COMPONENT();
        }
      } else {
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parsePATH_COMPONENT() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseMEMBER_COMPONENT();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c5(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseSUBSCRIPT_COMPONENT();
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c6(s1);
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parseMEMBER_COMPONENT() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseDESCENDANT_MEMBER_COMPONENT();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c7(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseCHILD_MEMBER_COMPONENT();
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c8(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parsePARENT_MEMBER_COMPONENT();
          if (s1 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c9(s1);
          }
          s0 = s1;
        }
      }

      return s0;
    }

    function peg$parseCHILD_MEMBER_COMPONENT() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parseDOT();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseMEMBER_EXPRESSION();
        if (s2 === peg$FAILED) {
          s2 = peg$c10;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          peg$silentFails++;
          s4 = peg$parseCIRCUMFLEX();
          peg$silentFails--;
          if (s4 === peg$FAILED) {
            s3 = peg$c11;
          } else {
            peg$currPos = s3;
            s3 = peg$c1;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c12(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseDESCENDANT_MEMBER_COMPONENT() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parseDOT_DOT();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseMEMBER_EXPRESSION();
        if (s2 === peg$FAILED) {
          s2 = peg$c10;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          peg$silentFails++;
          s4 = peg$parseCIRCUMFLEX();
          peg$silentFails--;
          if (s4 === peg$FAILED) {
            s3 = peg$c11;
          } else {
            peg$currPos = s3;
            s3 = peg$c1;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c12(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parsePARENT_MEMBER_COMPONENT() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseDOT();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseCIRCUMFLEX();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseMEMBER_EXPRESSION();
          if (s3 === peg$FAILED) {
            s3 = peg$c10;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c12(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseLEADING_CHILD_MEMBER_EXPRESSION() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseMEMBER_EXPRESSION();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c13(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseMEMBER_EXPRESSION() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseSTAR();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c14(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseIDENTIFIER();
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c15(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseSCRIPT_EXPRESSION();
          if (s1 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c16(s1);
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseINDEX();
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c17(s1);
            }
            s0 = s1;
          }
        }
      }

      return s0;
    }

    function peg$parseSUBSCRIPT_COMPONENT() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseDESCENDANT_SUBSCRIPT_COMPONENT();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c7(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseCHILD_SUBSCRIPT_COMPONENT();
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c8(s1);
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parseCHILD_SUBSCRIPT_COMPONENT() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 91) {
        s1 = peg$c18;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c19); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseSUBSCRIPT();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 93) {
            s3 = peg$c20;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c21); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c12(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseDESCENDANT_SUBSCRIPT_COMPONENT() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parseDOT_DOT();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 91) {
          s2 = peg$c18;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c19); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseSUBSCRIPT();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 93) {
              s4 = peg$c20;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c21); }
            }
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c12(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseSUBSCRIPT() {
      var s0;

      s0 = peg$parseSUBSCRIPT_EXPRESSION_LIST();
      if (s0 === peg$FAILED) {
        s0 = peg$parseSUBSCRIPT_EXPRESSION();
      }

      return s0;
    }

    function peg$parseSUBSCRIPT_EXPRESSION_LIST() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parseSUBSCRIPT_EXPRESSION();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = [];
        s5 = peg$parsewhitespace();
        while (s5 !== peg$FAILED) {
          s4.push(s5);
          s5 = peg$parsewhitespace();
        }
        if (s4 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s5 = peg$c22;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c23); }
          }
          if (s5 !== peg$FAILED) {
            s6 = [];
            s7 = peg$parsewhitespace();
            while (s7 !== peg$FAILED) {
              s6.push(s7);
              s7 = peg$parsewhitespace();
            }
            if (s6 !== peg$FAILED) {
              s7 = peg$parseSUBSCRIPT_EXPRESSION();
              if (s7 !== peg$FAILED) {
                peg$reportedPos = s3;
                s4 = peg$c24(s7);
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c1;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c1;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c1;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c1;
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$currPos;
            s4 = [];
            s5 = peg$parsewhitespace();
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$parsewhitespace();
            }
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 44) {
                s5 = peg$c22;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c23); }
              }
              if (s5 !== peg$FAILED) {
                s6 = [];
                s7 = peg$parsewhitespace();
                while (s7 !== peg$FAILED) {
                  s6.push(s7);
                  s7 = peg$parsewhitespace();
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseSUBSCRIPT_EXPRESSION();
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s3;
                    s4 = peg$c24(s7);
                    s3 = s4;
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c1;
                  }
                } else {
                  peg$currPos = s3;
                  s3 = peg$c1;
                }
              } else {
                peg$currPos = s3;
                s3 = peg$c1;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c1;
            }
          }
        } else {
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c25(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseSUBSCRIPT_EXPRESSION() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseSTAR();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c26(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseARRAY_SLICE();
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c27(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseINDEX();
          if (s1 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c28(s1);
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$parseIDENTIFIER();
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c29(s1);
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              s1 = peg$parseSCRIPT_EXPRESSION();
              if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c30(s1);
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parseFILTER_EXPRESSION();
                if (s1 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c31(s1);
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  s1 = peg$parseSTRING_LITERAL();
                  if (s1 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c32(s1);
                  }
                  s0 = s1;
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parseSTRING_LITERAL() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parsestring();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c12(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseQ_STRING();
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c12(s1);
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parseIDENTIFIER() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = [];
      if (peg$c33.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c34); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c33.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c34); }
          }
        }
      } else {
        s1 = peg$c1;
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$c33.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c34); }
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (peg$c33.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c34); }
          }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c35(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseARRAY_SLICE() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parseINDEX();
      if (s1 === peg$FAILED) {
        s1 = peg$c10;
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsewhitespace();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsewhitespace();
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 58) {
            s3 = peg$c36;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c37); }
          }
          if (s3 !== peg$FAILED) {
            s4 = [];
            s5 = peg$parsewhitespace();
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$parsewhitespace();
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseINDEX();
              if (s5 === peg$FAILED) {
                s5 = peg$c10;
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c38(s1, s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c1;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseINDEX() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseminus();
      if (s1 === peg$FAILED) {
        s1 = peg$c10;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseint();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c39();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseQ_STRING() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsechar();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsechar();
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c40(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseSCRIPT_EXPRESSION() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseEXPR();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c35(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseFILTER_EXPRESSION() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 63) {
        s1 = peg$c41;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c42); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseEXPR();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c35(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseEXPR() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseEXPR_START();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseEXPR_INNER();
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseEXPR_INNER();
          }
        } else {
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseEXPR_END();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c43(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseEXPR_START() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 40) {
        s0 = peg$c44;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c45); }
      }

      return s0;
    }

    function peg$parseEXPR_END() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 41) {
        s0 = peg$c46;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c47); }
      }

      return s0;
    }

    function peg$parseEXPR_INNER() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseEXPR_CONTENT();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c12(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseEMPTY_EXPR_CONTENT();
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c12(s1);
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$currPos;
          peg$silentFails++;
          s2 = peg$parseEXPR_END();
          peg$silentFails--;
          if (s2 === peg$FAILED) {
            s1 = peg$c11;
          } else {
            peg$currPos = s1;
            s1 = peg$c1;
          }
          if (s1 !== peg$FAILED) {
            if (input.length > peg$currPos) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c48); }
            }
            if (s2 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c12(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c49) {
              s1 = peg$c49;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c50); }
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c12(s1);
            }
            s0 = s1;
          }
        }
      }

      return s0;
    }

    function peg$parseEMPTY_EXPR_CONTENT() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c44;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c45); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 === peg$FAILED) {
          s2 = peg$c10;
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 41) {
            s3 = peg$c46;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c47); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c51(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseEXPR_CONTENT() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c44;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c45); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseEXPR_CONTENT_INNER();
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseEXPR_CONTENT_INNER();
          }
        } else {
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 41) {
            s3 = peg$c46;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c47); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c52(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseEXPR_CONTENT_INNER() {
      var s0, s1, s2;

      s0 = peg$parseEMPTY_EXPR_CONTENT();
      if (s0 === peg$FAILED) {
        s0 = [];
        s1 = peg$parseEXPR_CONTENT();
        if (s1 !== peg$FAILED) {
          while (s1 !== peg$FAILED) {
            s0.push(s1);
            s1 = peg$parseEXPR_CONTENT();
          }
        } else {
          s0 = peg$c1;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$currPos;
          peg$silentFails++;
          if (input.charCodeAt(peg$currPos) === 41) {
            s2 = peg$c46;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c47); }
          }
          peg$silentFails--;
          if (s2 === peg$FAILED) {
            s1 = peg$c11;
          } else {
            peg$currPos = s1;
            s1 = peg$c1;
          }
          if (s1 !== peg$FAILED) {
            if (input.length > peg$currPos) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c48); }
            }
            if (s2 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c12(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        }
      }

      return s0;
    }

    function peg$parseDOLLAR() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 36) {
        s0 = peg$c53;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c54); }
      }

      return s0;
    }

    function peg$parseDOT_DOT() {
      var s0;

      if (input.substr(peg$currPos, 2) === peg$c55) {
        s0 = peg$c55;
        peg$currPos += 2;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c56); }
      }

      return s0;
    }

    function peg$parseDOT() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 46) {
        s0 = peg$c57;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c58); }
      }

      return s0;
    }

    function peg$parseSTAR() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 42) {
        s0 = peg$c59;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c60); }
      }

      return s0;
    }

    function peg$parseCIRCUMFLEX() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 94) {
        s0 = peg$c61;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c62); }
      }

      return s0;
    }

    function peg$parseBRACKET_LEFT() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 91) {
        s0 = peg$c18;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c19); }
      }

      return s0;
    }

    function peg$parseBRACKET_RIGHT() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 93) {
        s0 = peg$c20;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c21); }
      }

      return s0;
    }

    function peg$parsenumber() {
      var s0, s1, s2, s3, s4;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseminus();
      if (s1 === peg$FAILED) {
        s1 = peg$c10;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseint();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsefrac();
          if (s3 === peg$FAILED) {
            s3 = peg$c10;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parseexp();
            if (s4 === peg$FAILED) {
              s4 = peg$c10;
            }
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c64();
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c1;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c63); }
      }

      return s0;
    }

    function peg$parsedecimal_point() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 46) {
        s0 = peg$c57;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c58); }
      }

      return s0;
    }

    function peg$parsedigit1_9() {
      var s0;

      if (peg$c65.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c66); }
      }

      return s0;
    }

    function peg$parsee() {
      var s0;

      if (peg$c67.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c68); }
      }

      return s0;
    }

    function peg$parseexp() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parsee();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseminus();
        if (s2 === peg$FAILED) {
          s2 = peg$parseplus();
        }
        if (s2 === peg$FAILED) {
          s2 = peg$c10;
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseDIGIT();
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseDIGIT();
            }
          } else {
            s3 = peg$c1;
          }
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parsefrac() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parsedecimal_point();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseDIGIT();
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseDIGIT();
          }
        } else {
          s2 = peg$c1;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }

      return s0;
    }

    function peg$parseint() {
      var s0, s1, s2, s3;

      s0 = peg$parsezero();
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsedigit1_9();
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parseDIGIT();
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseDIGIT();
          }
          if (s2 !== peg$FAILED) {
            s1 = [s1, s2];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      }

      return s0;
    }

    function peg$parseminus() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 45) {
        s0 = peg$c69;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c70); }
      }

      return s0;
    }

    function peg$parseplus() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 43) {
        s0 = peg$c71;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c72); }
      }

      return s0;
    }

    function peg$parsezero() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 48) {
        s0 = peg$c73;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c74); }
      }

      return s0;
    }

    function peg$parsestring() {
      var s0, s1, s2, s3;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parsequotation_mark();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parsechar();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parsechar();
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsequotation_mark();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c76(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c1;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c75); }
      }

      return s0;
    }

    function peg$parsechar() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

      s0 = peg$parseunescaped();
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseescape();
        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 34) {
            s2 = peg$c77;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c78); }
          }
          if (s2 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 92) {
              s2 = peg$c79;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c80); }
            }
            if (s2 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 47) {
                s2 = peg$c81;
                peg$currPos++;
              } else {
                s2 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c82); }
              }
              if (s2 === peg$FAILED) {
                s2 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 98) {
                  s3 = peg$c83;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c84); }
                }
                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s2;
                  s3 = peg$c85();
                }
                s2 = s3;
                if (s2 === peg$FAILED) {
                  s2 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 102) {
                    s3 = peg$c86;
                    peg$currPos++;
                  } else {
                    s3 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c87); }
                  }
                  if (s3 !== peg$FAILED) {
                    peg$reportedPos = s2;
                    s3 = peg$c88();
                  }
                  s2 = s3;
                  if (s2 === peg$FAILED) {
                    s2 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 110) {
                      s3 = peg$c89;
                      peg$currPos++;
                    } else {
                      s3 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c90); }
                    }
                    if (s3 !== peg$FAILED) {
                      peg$reportedPos = s2;
                      s3 = peg$c91();
                    }
                    s2 = s3;
                    if (s2 === peg$FAILED) {
                      s2 = peg$currPos;
                      if (input.charCodeAt(peg$currPos) === 114) {
                        s3 = peg$c92;
                        peg$currPos++;
                      } else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c93); }
                      }
                      if (s3 !== peg$FAILED) {
                        peg$reportedPos = s2;
                        s3 = peg$c94();
                      }
                      s2 = s3;
                      if (s2 === peg$FAILED) {
                        s2 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 116) {
                          s3 = peg$c95;
                          peg$currPos++;
                        } else {
                          s3 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c96); }
                        }
                        if (s3 !== peg$FAILED) {
                          peg$reportedPos = s2;
                          s3 = peg$c97();
                        }
                        s2 = s3;
                        if (s2 === peg$FAILED) {
                          s2 = peg$currPos;
                          if (input.charCodeAt(peg$currPos) === 117) {
                            s3 = peg$c98;
                            peg$currPos++;
                          } else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c99); }
                          }
                          if (s3 !== peg$FAILED) {
                            s4 = peg$currPos;
                            s5 = peg$currPos;
                            s6 = peg$parseHEXDIG();
                            if (s6 !== peg$FAILED) {
                              s7 = peg$parseHEXDIG();
                              if (s7 !== peg$FAILED) {
                                s8 = peg$parseHEXDIG();
                                if (s8 !== peg$FAILED) {
                                  s9 = peg$parseHEXDIG();
                                  if (s9 !== peg$FAILED) {
                                    s6 = [s6, s7, s8, s9];
                                    s5 = s6;
                                  } else {
                                    peg$currPos = s5;
                                    s5 = peg$c1;
                                  }
                                } else {
                                  peg$currPos = s5;
                                  s5 = peg$c1;
                                }
                              } else {
                                peg$currPos = s5;
                                s5 = peg$c1;
                              }
                            } else {
                              peg$currPos = s5;
                              s5 = peg$c1;
                            }
                            if (s5 !== peg$FAILED) {
                              s5 = input.substring(s4, peg$currPos);
                            }
                            s4 = s5;
                            if (s4 !== peg$FAILED) {
                              peg$reportedPos = s2;
                              s3 = peg$c100(s4);
                              s2 = s3;
                            } else {
                              peg$currPos = s2;
                              s2 = peg$c1;
                            }
                          } else {
                            peg$currPos = s2;
                            s2 = peg$c1;
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c101(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c1;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c1;
        }
      }

      return s0;
    }

    function peg$parseescape() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 92) {
        s0 = peg$c79;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c80); }
      }

      return s0;
    }

    function peg$parsequotation_mark() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 34) {
        s0 = peg$c77;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c78); }
      }

      return s0;
    }

    function peg$parseunescaped() {
      var s0;

      if (peg$c102.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c103); }
      }

      return s0;
    }

    function peg$parseDIGIT() {
      var s0;

      if (peg$c104.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c105); }
      }

      return s0;
    }

    function peg$parseHEXDIG() {
      var s0;

      if (peg$c106.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c107); }
      }

      return s0;
    }

    function peg$parse_() {
      var s0, s1;

      peg$silentFails++;
      s0 = [];
      s1 = peg$parsewhitespace();
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        s1 = peg$parsewhitespace();
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c108); }
      }

      return s0;
    }

    function peg$parsewhitespace() {
      var s0;

      if (peg$c109.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c110); }
      }

      return s0;
    }

    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse:       parse
  };
})();
/* eslint-enable */

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
