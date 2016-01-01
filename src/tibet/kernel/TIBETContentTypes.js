//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/* JSHint checking */

/* jshint evil:true
*/

//  ========================================================================
//  TP.lang.Object Extensions
//  ========================================================================

TP.lang.Object.Type.defineMethod('constructContentObject',
function(aURI, content) {

    /**
     * @method constructContentObject
     * @summary Returns a content handler for the URI provided. This method is
     *     invoked as part of MIME-type specific handling for URIs.
     * @param {TP.core.URI} aURI The URI containing the content.
     * @param {Object} content The content to set into the content object.
     * @returns {Object} The object representation of the content.
     */

    return this.construct(content);
});

//  ========================================================================
//  TP.core.CSSStyleSheet
//  ========================================================================

/**
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.CSSStyleSheet');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.CSSStyleSheet.Type.defineMethod('constructContentObject',
function(aURI, content) {

    /**
     * @method constructContentObject
     * @summary Returns a content handler for the URI provided. This method is
     *     invoked as part of MIME-type specific handling for URIs.
     * @param {TP.core.URI} aURI The URI containing the content.
     * @param {String} content The string content to process.
     * @returns {Object} The object representation of the content.
     */

    return this.construct(aURI, content);
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The URI that this stylesheet is coming from, either because it maps to a
//  '.css' file somewhere or its part of an embedded 'style' element that
//  has an ID (either assigned by the author or auto-assigned by TIBET)
//  which is then used as an XPointer.
TP.core.CSSStyleSheet.Inst.defineAttribute('sourceURI');

//  The stylesheet's XML & indexed representation.
TP.core.CSSStyleSheet.Inst.defineAttribute('cssSheet');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.CSSStyleSheet.Inst.defineMethod('init',
function(aURI, content) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {TP.core.URI|String} aURI A TP.core.URI or String containing a
     *     proper URI.
     * @param {String} content The string content to process.
     * @returns {TP.core.CSSStyleSheet} A new instance.
     */

    this.callNextMethod();

    this.set('sourceURI', aURI);
    this.set('cssSheet', content);

    return this;
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

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Content.Type.defineMethod('constructContentObject',
function(aURI, content) {

    /**
     * @method constructContentObject
     * @summary Returns a content handler for the URI provided. This method is
     *     invoked as part of MIME-type specific handling for URIs.
     * @param {TP.core.URI} aURI The URI containing the content.
     * @param {String} content The string content to process.
     * @returns {Object} The object representation of the content.
     */

    return this.construct(content);
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  A URI that is acting as our public reference
TP.core.Content.Inst.defineAttribute('$publicURI');

//  The content's JavaScript representation
TP.core.Content.Inst.defineAttribute('data');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('init',
function(data) {

    /**
     * @method init
     * @summary Returns a newly constructed Object from inbound JSON content.
     * @param {Object} data The data to use for this content.
     * @returns {TP.core.Content} A new instance.
     */

    this.callNextMethod();

    this.set('data', data, false);

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
     * @param {Object|Array} anOrigin One or more origins to observe.
     * @param {Object|Array} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as 'capture'
     *     or a specific function to manage the observe process. IGNORED.
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

    var data;

    if (TP.isValid(data = this.get('data'))) {
        data.changed(anAspect, anAction, aDescription);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('getData',
function() {

    /**
     * @method getData
     * @summary Returns the underlying data object.
     * @returns {Object} The receiver's underlying data object.
     */

    return this.$get('data');
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('getFacetedAspectNames',
function() {

    /**
     * @method getFacetedAspectNames
     * @summary Returns an Array of the names of the aspects that are faceted on
     *     the receiver.
     * @returns {Array} A list of the names of aspects that are faceted on the
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

TP.core.Content.Inst.defineMethod('getPathSource',
function(aPath) {

    /**
     * @method getPathSource
     * @summary Return the current source object being used by the executeGet()
     *     and executeSet() methods. At this level, this method returns the
     *     underlying data object.
     * @param {TP.core.AccessPath} aPath The path that the path source will be
     *     used with.
     * @returns {Object} The object used as the current path source object.
     */

    return this.$get('data');
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

    return this.$get('data');
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('getValidatingAspectNames',
function() {

    /**
     * @method getValidatingAspectNames
     * @summary Returns an Array of the names of the aspects to validate on the
     *     receiver.
     * @returns {Array} A list of the names of aspects to validate on the
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

            aspectSigName = aspectName.asStartUpper() + 'Change';

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

TP.core.Content.Inst.defineHandler('CreateItem',
function(aSignal) {

    /**
     * @method handleCreateItem
     * @summary Handles when an item is to be created and inserted into the
     *     receiver's data.
     * @param {TP.sig.CreateItem} aSignal The signal instance which triggered
     *     this handler.
     * @exception TP.sig.InvalidParameter,TP.sig.InvalidURI
     */

    var scope,
        scopeURI;

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

    //  Insert a row into that collection, using the cloning index, insertion
    //  index and position given in the signal.
    this.insertRowIntoAt(scopeURI,
                            TP.nc(aSignal.at('cloneIndex')),
                            TP.nc(aSignal.at('index')),
                            aSignal.at('position'));

    //  Signal a 'changed' from ourself so that observers reflect our new
    //  reality.
    this.changed(scopeURI.getFragmentExpr(), TP.INSERT);

    return;
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
     * @exception TP.sig.InvalidParameter,TP.sig.InvalidURI
     */

    var scope,
        scopeURI;

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

    //  Remove a row from that collection, using the deletion index in the
    //  signal.
    this.removeRowFromAt(scopeURI, aSignal.at('index'));

    //  Signal a 'changed' from ourself so that observers reflect our new
    //  reality.
    this.changed(scopeURI.getFragmentExpr(), TP.DELETE);

    return;
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
     * @param {Object|Array} anOrigin One or more origins to ignore.
     * @param {Object|Array} aSignal One or more signals to ignore from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn off observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as 'capture'
     *     or a specific function to manage the observe process. IGNORED.
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
     * @param {String|TP.core.AccessPath} attributeName The name of the
     *     attribute to set.
     * @param {Object} attributeValue The value to set.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {TP.core.Content} The receiver.
     */

    var retVal;

    retVal = this.callNextMethod();

    if (attributeName !== 'data') {
        this.checkFacets(attributeName);
    }

    return retVal;
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
    if (TP.isValid(oldDataObject = this.$get('data'))) {
        this.ignore(oldDataObject, 'Change');
    }

    this.$set('data', aDataObject, false);

    if (TP.isValid(aDataObject)) {
        if (TP.isMutable(aDataObject)) {
            this.observe(aDataObject, 'Change');
        }
    }

    if (TP.notFalse(shouldSignal)) {
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

    var data;

    if (TP.isValid(data = this.get('data'))) {
        return data.shouldSignalChange(aFlag);
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.Content.Inst.defineMethod('toJSON',
function() {

    /**
     * @method toJSON
     * @summary Returns the object to use in JSON representations.
     * @returns {Object} The object to use in a JSON representation.
     */

    return this.getData().toJSON();
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

TP.core.JSONContent.Inst.defineMethod('defineTypes',
function() {

    /**
     * @method defineTypes
     * @summary Defines any JSON Schema types defined by the data of the
     *     receiver.
     * @returns {TP.core.JSONContent} The receiver.
     */

    var data,
        definitions;

    if (TP.isEmpty(data = this.get('data'))) {
        return this.raise('TP.sig.InvalidValue',
                            'JSON content is empty.');
    }

    if (TP.notValid(definitions = data.at('definitions'))) {
        return this.raise('TP.sig.InvalidContext',
                            'JSON content is not JSON Schema.');
    }

    //  Iterate over each definition found in the 'definitions' hash
    definitions.perform(
        function(kvPair) {
            var defName,
                schema,

                typeName,
                type;

            defName = kvPair.first();
            schema = kvPair.last();

            //  If the schema entry doesn't have a separate 'name' entry, then
            //  use the definition name.
            if (TP.isEmpty(typeName = schema.at('name'))) {
                typeName = defName;
            }

            //  Make sure that the typeName has a namespace.
            if (!/\./.test(typeName)) {
                typeName = 'TP.json.' + typeName;
            }

            //  If the system doesn't have a type by that name, then define one
            //  as a subtype of TP.json.JSONSchemaType.
            if (!TP.isType(type = TP.sys.getTypeByName(typeName))) {
                type = TP.json.JSONSchemaType.defineSubtype(typeName);
            }

            type.set('schema', schema);
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JSONContent.Inst.defineMethod('getData',
function() {

    /**
     * @method getData
     * @summary Returns the underlying data object.
     * @returns {Object} The receiver's underlying data object.
     */

    var jsonData;

    jsonData = this.$get('data');

    //  If a String was handed in, it's probably JSON - try to convert it.
    if (TP.isString(jsonData) && TP.notEmpty(jsonData)) {

        jsonData = TP.json2js(jsonData);

        //  TP.json2js will raise for us.
        if (TP.notValid(jsonData)) {
            return;
        }

        this.set('data', jsonData);
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
     * @param {TP.core.AccessPath} aPath The path that the path source will be
     *     used with.
     * @returns {Object} The object used as the current path source object.
     */

    //  If we're going to be used with a JSONPath, then we are the path source -
    //  otherwise our data is.
    if (TP.isKindOf(aPath, TP.core.JSONPath)) {
        return this;
    }

    return this.$get('data');
});

//  ------------------------------------------------------------------------

TP.core.JSONContent.Inst.defineMethod('insertRowIntoAt',
function(aCollectionURI, aCloneIndex, anInsertIndex, aPosition) {

    /**
     * @method insertRowIntoAt
     * @summary Inserts a row of data into the collection as defined by the
     *     supplied collection URI. This collection should be either the whole
     *     collection representing the data of the receiver or a subcollection
     *     of that data.
     * @param {TP.core.URI} aCollectionURI The URI pointing to the collection to
     *     add the row to.
     * @param {Number} aCloneIndex The index of the item to clone when creating
     *     the new item.
     * @param {Number} anInsertIndex The index to insert the item at in the
     *     collection. Note that this works with the supplied position to
     *     determine whether the insertion should happen before or after.
     * @param {Constant} aPosition A value of TP.BEFORE, TP.AFTER or null. This
     *     determines the position of the insertion. If no position is supplied,
     *     TP.AFTER is assumed.
     * @returns {TP.core.Content} The receiver.
     */

    var targetCollection,

        cloneIndex,
        itemToClone,
        newItem,

        insertIndex;

    //  Make sure that we have an Array as our collection. If we end up with a
    //  non-Array, we wrap it into one.

    //  NB: We assume 'async' of false here.
    if (!TP.isArray(targetCollection =
                    aCollectionURI.getResource().get('result'))) {
        targetCollection = TP.ac(targetCollection);
    }

    //  Clone the first row if no clone index was supplied
    if (!TP.isNumber(cloneIndex = aCloneIndex)) {
        cloneIndex = 0;
    }

    //  Get the item to clone and clone it.
    itemToClone = targetCollection.get(cloneIndex);
    newItem = TP.copy(itemToClone);

    //  Clear out all of the 'text content' - that is, all of the scalar values
    //  in the newly cloned item. This will descend through the new item's data
    //  structure and cleanse it all of previous values.
    newItem.clearTextContent();

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
    targetCollection.splice(insertIndex, 0, newItem);

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
     * @param {TP.core.URI} aCollectionURI The URI pointing to the collection to
     *     remove the row from.
     * @param {Number} aDeleteIndex The index to remove the item from in the
     *     collection.
     * @returns {TP.core.Content} The receiver.
     */

    var targetCollection,

        deleteIndexes;

    //  If the supplied URI really resolves to an Array, then remove the proper
    //  row.

    //  NB: We assume 'async' of false here.
    if (TP.isArray(targetCollection =
                    aCollectionURI.getResource().get('result'))) {

        //  If a deletion index was supplied or we have numbers in our selection
        //  indexes, then use those as the deletion indexes.
        if (TP.isNumber(deleteIndexes = aDeleteIndex)) {
            //  empty
        } else if (TP.notEmpty(deleteIndexes = this.get('selectionIndexes'))) {
            //  empty
        } else {
            deleteIndexes = targetCollection.getSize() - 1;
        }

        //  If we have an Array of deletion indexes, use a TIBET convenience
        //  method.
        if (TP.isArray(deleteIndexes)) {
            targetCollection.removeAtAll(deleteIndexes);
        } else {
            targetCollection.splice(deleteIndexes, 1);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JSONContent.Inst.defineMethod('shouldSignalChange',
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

    var data;

    //  Sometimes this object holds a TIBET-wrapped piece of XML data (when it
    //  is being used by a JSONPath). In this case, we want to pass through this
    //  setting. Otherwise, it's holding a plain JavaScript Object created from
    //  JSON, so it won't respond to this.

    data = this.get('data');

    if (TP.canInvoke(data, 'shouldSignalChange')) {
        //  Note we can't do 'if (flag)' here because of its Boolean nature.
        if (arguments.length) {
            return data.shouldSignalChange(aFlag);
        } else {
            return data.shouldSignalChange();
        }
    }

    return false;
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
function(data) {

    /**
     * @method xmlcc
     * @summary Returns a newly initialized XMLContent instance.
     * @param {Object} data The data to use for this content.
     * @returns {TP.core.XMLContent} The new instance.
     */

    return TP.core.XMLContent.construct(data);
});

//  ------------------------------------------------------------------------
//  Type Methods
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

TP.core.XMLContent.Inst.defineMethod('getData',
function() {

    /**
     * @method getData
     * @summary Returns the underlying data object.
     * @returns {Object} The receiver's underlying data object.
     */

    var xmlData;

    xmlData = this.$get('data');

    //  If a String was handed in, it's probably JSON - try to convert it.
    if (TP.isString(xmlData) && TP.notEmpty(xmlData)) {

        //  TP.tpdoc() will raise for us if we supply 'true' as the 3rd
        //  parameter.
        xmlData = TP.tpdoc(xmlData, null, true);

        if (TP.notValid(xmlData, null, true)) {
            return;
        }

        this.set('data', xmlData);

    } else if (TP.isNode(xmlData)) {

        xmlData = TP.wrap(xmlData);
        this.set('data', xmlData);
    }

    return xmlData;
});

//  ------------------------------------------------------------------------

TP.core.XMLContent.Inst.defineMethod('insertRowIntoAt',
function(aCollectionURI, aCloneIndex, anInsertIndex, aPosition) {

    /**
     * @method insertRowIntoAt
     * @summary Inserts a row of data into the collection as defined by the
     *     supplied collection URI. This collection should be either the whole
     *     collection representing the data of the receiver or a subcollection
     *     of that data.
     * @param {TP.core.URI} aCollectionURI The URI pointing to the collection to
     *     add the row to.
     * @param {Number} aCloneIndex The index of the item to clone when creating
     *     the new item.
     * @param {Number} anInsertIndex The index to insert the item at in the
     *     collection. Note that this works with the supplied position to
     *     determine whether the insertion should happen before or after.
     * @param {Constant} aPosition A value of TP.BEFORE, TP.AFTER or null. This
     *     determines the position of the insertion. If no position is supplied,
     *     TP.AFTER is assumed.
     * @exception TP.sig.InvalidNode
     * @returns {TP.core.Content} The receiver.
     */

    var targetCollection,

        cloneIndex,
        itemToClone,
        newItem,

        insertIndex,

        insertionPath;

    //  Make sure that we have a TP.core.CollectionNode

    //  NB: We assume 'async' of false here.
    targetCollection = aCollectionURI.getResource(
                        TP.hc('resultType', TP.WRAP)).get('result');

    if (!TP.isKindOf(targetCollection, TP.core.CollectionNode)) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  Clone the first row if no clone index was supplied
    if (!TP.isNumber(cloneIndex = aCloneIndex)) {
        //  XPath starts indexing at 1
        cloneIndex = 1;
    }

    //  Get the item to clone and clone it.
    itemToClone = targetCollection.get('./*[' + cloneIndex + ']');
    newItem = itemToClone.clone(true);

    //  Clear out all of the 'text content' - that is, all of the scalar values
    //  in the newly cloned item. This will descend through the new item's data
    //  structure and cleanse it all of previous values.
    newItem.clearTextContent();

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
        }
    }

    //  If the insertion path is not empty, that means that we're not just
    //  appending to the end.
    if (TP.notEmpty(insertionPath)) {
        targetCollection.insertRawContent(newItem, insertionPath, null, false);
    } else {
        //  We're just appending to the end.
        targetCollection.addRawContent(newItem, null, false);
    }

    return this;
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
     * @param {TP.core.URI} aCollectionURI The URI pointing to the collection to
     *     remove the row from.
     * @param {Number} aDeleteIndex The index to remove the item from in the
     *     collection.
     * @exception TP.sig.InvalidNode
     * @returns {TP.core.Content} The receiver.
     */

    var targetCollection,

        deleteIndexes,
        deletionPath,
        i;

    //  Make sure that we have a TP.core.CollectionNode

    //  NB: We assume 'async' of false here.
    targetCollection = aCollectionURI.getResource(
                        TP.hc('resultType', TP.WRAP)).get('result');

    if (!TP.isKindOf(targetCollection, TP.core.CollectionNode)) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  Compute an XPath to do the deletion.

    //  If a deletion index was supplied or we have numbers in our selection
    //  indexes, then use those as the deletion indexes.
    if (TP.isNumber(deleteIndexes = aDeleteIndex)) {

        deletionPath = './*[' + deleteIndexes + ']';

    } else if (TP.notEmpty(deleteIndexes = this.get('selectionIndexes'))) {
        deletionPath = './*[';
        for (i = 0; i < deleteIndexes.getSize(); i++) {
            deletionPath += 'position = ' + deleteIndexes.at(i) + ' or ';
        }

        deletionPath = deletionPath.slice(0, -4) + ']';
    } else {

        //  Otherwise, just delete the last item.
        deletionPath = './*[last()]';
    }

    //  Create an XPathPath object from the computed path and execute a delete.
    TP.xpc(deletionPath).execRemove(targetCollection, false);

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

TP.core.XMLContent.Inst.defineMethod('asString',
function() {

    /**
     * @method asString
     * @summary Returns the common string representation of the receiver.
     * @returns {String} The content object in string form.
     */

    return this.asXMLString();
});

//  ========================================================================
//  TP.core.AccessPath
//  ========================================================================

/**
 * @type {TP.core.AccessPath}
 * @summary A common supertype for access paths, which can get used in TIBET
 *     get() and set() calls to provide sophisticated data access. Common
 *     subtypes include types to access TIBETan JS objects, 'plain' JSON data
 *     objects and XML data objects.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.AccessPath');

//  This is an abstract supertype - need a concrete subtype to get real work
//  done.
TP.core.AccessPath.isAbstract(true);

//  ------------------------------------------------------------------------

TP.definePrimitive('apc',
function(aPath, config) {

    /**
     * @method apc
     * @summary Returns a newly initialized access path instance.
     * @param {String} aPath The path as a String.
     * @param {TP.core.Hash} config The configuration for this path.
     * @returns {TP.core.AccessPath} The new instance.
     */

    return TP.core.AccessPath.construct(aPath, config);
});

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.defineAttribute('$observedAddresses');

TP.core.AccessPath.Type.defineAttribute('$executedPaths');

TP.core.AccessPath.Type.defineAttribute('$changedAddresses');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.defineMethod('construct',
function(aPath, config) {

    /**
     * @method construct
     * @summary Returns a new instance of an access path or aPath if it is
     *     already a path.
     * @param {String} aPath The String to build the instance from.
     * @param {TP.core.Hash} config The configuration for this path.
     * @returns {TP.core.AccessPath} A new instance or aPath if it's already a
     *     path.
     */

    if (aPath.isAccessPath()) {
        return aPath;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.defineMethod('getConcreteType',
function(aPath) {

    /**
     * @method getConcreteType
     * @summary Returns the type to use for a particular access path.
     * @param {String} aPath A path string from which the subtype will be
     *     determined.
     * @returns {TP.lang.RootObject.<TP.core.AccessPath>} A TP.core.AccessPath
     *     subtype type object.
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
        return TP.core.CompositePath;
    }

    //  If the path is just '.', then that's the shortcut to just return the
    //  target object itself.
    if (TP.regex.ONLY_PERIOD.test(aPath)) {
        return TP.core.SimpleTIBETPath;
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

    //  If we're handed a '#json(...)' pointer, then we know what kind of
    //  path it is (or should be, anyway)
    if (TP.regex.JSON_POINTER.test(path)) {
        return TP.core.JSONPath;
    }

    //  If we're handed a '#tibet(...)' pointer, then we know what kind of
    //  path it is (or should be, anyway)
    if (TP.regex.TIBET_POINTER.test(path)) {

        path = TP.regex.TIBET_POINTER.match(path);

        if (TP.regex.COMPOSITE_PATH.test(path.at(1))) {
            return TP.core.CompositePath;
        } else if (TP.regex.TIBET_PATH.test(path.at(1))) {
            //  Otherwise, if it just has 'TIBETan' access path characters,
            //  create a 'complex' TIBET path to deal with it.
            return TP.core.ComplexTIBETPath;
        } else {
            //  Otherwise, it's just a simple path
            return TP.core.SimpleTIBETPath;
        }
    }

    //  Barename (i.e. ID) paths
    if (TP.regex.BARENAME.test(path)) {
        return TP.core.BarenamePath;
    }

    //  It could be some kind of XPointer - either xpointer(), xpath1() or
    //  element() scheme
    if (TP.regex.XPOINTER.test(path)) {

        //  If we're handed an '#element(...)' pointer, then we know what kind
        //  of path it is (or should be, anyway)

        //  NB: We do *not* check against TP.regex.ELEMENT_PATH here, since it
        //  matches all IDs ("#"), attributes ("@"), etc.
        if (TP.regex.ELEMENT_POINTER.test(path)) {
            return TP.core.ElementPath;
        } else {
            return TP.core.XPathPath;
        }
    }

    //  If we're handed an '#css(...)' or other kind of 'xtension' pointer,
    //  then we know what kind of path it is (or should be, anyway)
    if (TP.regex.XTENSION_POINTER.test(path)) {
        return TP.core.XTensionPath;
    }

    //  attribute paths
    if (TP.regex.ATTRIBUTE.test(path)) {
        return TP.core.SimpleXMLPath;
    }

    //  Other kinds of XML paths
    if (TP.regex.XPATH_PATH.test(path) ||
        TP.regex.HAS_SLASH.test(path)) {
        return TP.core.XPathPath;
    }

    //  JSON Paths
    if (TP.regex.JSON_PATH.test(path)) {
        return TP.core.JSONPath;
    }

    //  If there is no 'path punctuation' (only JS identifer characters), or
    //  it's a simple numeric path like '2' or '[2]', that means it's a 'simple
    //  path'.
    //  TODO: This is hacky - figure out how to combine them into one RegExp.
    if (TP.regex.JS_IDENTIFIER.test(path) ||
        TP.regex.ONLY_NUM.test(path) ||
        TP.regex.SIMPLE_NUMERIC_PATH.test(path)) {
        return TP.core.SimpleTIBETPath;
    }

    //  Otherwise, if it has 'TIBETan' access path characters, create a TIBET
    //  path to deal with it.
    if (TP.regex.TIBET_PATH.test(path)) {
        return TP.core.ComplexTIBETPath;
    }

    return TP.core.CSSPath;
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.defineMethod('$getExecutedPaths',
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

TP.core.AccessPath.Type.defineMethod('$getChangedAddresses',
function() {

    /**
     * @method $getChangedAddresses
     * @summary Returns the Array to use to register changed addresses. This
     *     method is supplied to avoid problems with this hash not being
     *     initialized when TIBET is starting up.
     * @returns {Array} The changed addresses array.
     */

    var theArray;

    if (TP.notValid(theArray = this.$get('$changedAddresses'))) {
        theArray = TP.ac();
        this.set('$changedAddresses', theArray);
    }

    return theArray;
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.defineMethod('$getObservedAddresses',
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

TP.core.AccessPath.Type.defineMethod('registerChangedAddress',
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

    TP.core.AccessPath.$getChangedAddresses().push(
        TP.hc('address', anAddress, 'action', anAction));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Type.defineMethod('registerObservedAddress',
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
    addressMap = TP.core.AccessPath.$getObservedAddresses();

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
TP.core.AccessPath.Inst.defineAttribute('srcPath');

//  Whether or not to make data structures on execution
TP.core.AccessPath.Inst.defineAttribute('shouldMakeStructures');

//  How to make data structures on execution (if we are making them)
TP.core.AccessPath.Inst.defineAttribute('packageWith');

//  Whether or not to collapse results into a single value
TP.core.AccessPath.Inst.defineAttribute('shouldCollapse');

//  How to extract a 'final value'
TP.core.AccessPath.Inst.defineAttribute('extractWith');

//  If a 'not valid' value is found, this Function can create values
TP.core.AccessPath.Inst.defineAttribute('fallbackWith');

//  Paths that would have been invalidated due to structural mutations
TP.core.AccessPath.Inst.defineAttribute('$invalidatedPaths');

//  Addresses to remove due to structural mutations
TP.core.AccessPath.Inst.defineAttribute('$addressesToRemove');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('init',
function(aPath, config) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {String} aPath The String to build the instance from.
     * @param {TP.core.Hash} config The configuration for this path.
     * @returns {TP.core.AccessPath} The receiver.
     */

    this.callNextMethod();

    this.set('srcPath', aPath);

    if (TP.isKindOf(config, TP.core.Hash)) {
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

TP.core.AccessPath.Inst.defineMethod('asSource',
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

TP.core.AccessPath.Inst.defineMethod('asDumpString',
function() {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var repStr,
        str;

    repStr = this.$get('srcPath').asString();

    try {
        str = TP.tname(this) + ' :: ' + '(' + repStr + ')';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    return '<span class="TP_core_AccessPath ' +
                    TP.escapeTypeName(TP.tname(this)) + '">' +
                this.asString() +
            '<\/span>';
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('asJSONSource',
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

TP.core.AccessPath.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    return '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) + '">' +
                    '<dt>Type name<\/dt>' +
                    '<dd class="pretty typename">' +
                        this.getTypeName() +
                    '<\/dd>' +
                    '<dt class="pretty key">Path:<\/dt>' +
                    '<dd class="pretty value">' +
                        this.asString() +
                    '<\/dd>' +
                    '<\/dl>';
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('asString',
function() {

    /**
     * @method asString
     * @summary Returns the String representation of the receiver.
     * @returns {String} The String representation of the receiver.
     */

    return this.get('srcPath');
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    return '<instance type="' + TP.tname(this) + '"' +
                    ' path="' + this.asString() + '"\/>';
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('isAccessPath',
function() {

    /**
     * @method isAccessPath
     * @summary Returns whether or not the receiver is an access path object.
     * @returns {Boolean} True - the receiver is an access path.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('isEmpty',
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

TP.core.AccessPath.Inst.defineMethod('executeGet',
function(targetObj, varargs) {

    /**
     * @method executeGet
     * @summary Returns the result of executing the path in a 'get' fashion -
     *     i.e. with the intent of retrieving data from the supplied target
     *     object.
     * @param {Object} targetObj The object to execute the receiver against
     *     to get data.
     * @param {Array} varargs The arguments to execute the get with. The
     *     first argument should be the object to execute the receiver against
     *     to retrieve data. Any remaining arguments will be used as values for
     *     a templated substitution in the path itself.
     * @returns {Object} The result of executing a 'get' against the target
     *     object using the receiver.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('executeSet',
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
     * @param {Array} varargs Any remaining arguments will be used as values
     *     for a templated substitution in the path itself.
     * @returns {Object} The result of executing a 'set' against the target
     *     object using the receiver.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('getFirstSimplePath',
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

TP.core.AccessPath.Inst.defineMethod('getPathParts',
function() {

    /**
     * @method getPathParts
     * @summary Returns the receiver's parts.
     * @returns {Array} An Array of the receiver's parts.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('getPathType',
function() {

    /**
     * @method getPathType
     * @summary Returns the receiver's 'path type'.
     * @returns {String} A path type
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.AccessPath.Inst.defineMethod('processFinalValue',
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

    var retVal,

        extractWith,

        keys,

        packageWith,
        packageType,

        fallbackWith;

    if (TP.isValid(retVal = aReturnValue)) {

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

TP.core.AccessPath.Inst.defineMethod('updateRegistrationsAfterSignaling',
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
     * @returns {TP.core.AccessPath} The receiver.
     */

    var observedAddresses,

        executedPaths,

        invalidatedPaths,
        addressesToRemove;

    observedAddresses = TP.core.AccessPath.$getObservedAddresses().at(
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

    executedPaths = TP.core.AccessPath.$getExecutedPaths().at(
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

TP.core.AccessPath.Inst.defineMethod('updateRegistrationsBeforeSignaling',
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
     * @returns {TP.core.AccessPath} The receiver.
     */

    var observedAddresses,
        observedAddressesKeys,

        changedAddresses,

        invalidatedPaths,
        addressesToRemove;

    //  We need to clear the path information registered for the addresses
    //  'under' the data that changed.
    observedAddresses = TP.core.AccessPath.$getObservedAddresses().at(
                            TP.id(targetObj));

    if (TP.isEmpty(observedAddresses)) {
        return this;
    }

    observedAddressesKeys = TP.keys(observedAddresses);

    //  Go through the addresses that changed and match them against any
    //  entries in observedAddresses
    changedAddresses = TP.core.AccessPath.$getChangedAddresses();

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

                        TP.core.AccessPath.registerChangedAddress(
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

TP.core.AccessPath.Inst.defineMethod('sendChangedSignal',
function(targetObj) {

    /**
     * @method sendChangedSignal
     * @summary Sends a signal using the supplied target object as the origin
     *     to let observers know that we have changed.
     * @param {Object} targetObj The object to send the 'changed signal' from.
     * @returns {TP.core.AccessPath} The receiver.
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

    allAddresses = TP.core.AccessPath.$getObservedAddresses();

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
        executedPaths = TP.core.AccessPath.$getExecutedPaths().at(
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

    changedAddresses = TP.core.AccessPath.$getChangedAddresses();

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

        //  Last signal... stamp in the batch ID under TP.END_SIGNAL_BATCH
        if (i === keysLen - 1) {
            description.atPut(TP.END_SIGNAL_BATCH, batchID);
        }

        for (j = 0; j < actions.getSize(); j++) {

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

                    aspectSigName = aspectName.asStartUpper() + 'Change';

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
//  TP.core.CompositePath
//  ========================================================================

TP.core.AccessPath.defineSubtype('CompositePath');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The set of paths that this composite path holds. It chains them together to
//  get or set a value when executing.
TP.core.CompositePath.Inst.defineAttribute('paths');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.CompositePath.Inst.defineMethod('init',
function(aPath, config) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {String} aPath The String to build the instance from.
     * @param {TP.core.Hash} config The configuration for this path.
     * @returns {TP.core.CompositePath} The receiver.
     */

    var pathStrs,
        i,

        paths;

    this.callNextMethod('value', config);

    //  Split along '.(' or ').'
    pathStrs = aPath.split(/(\.\(|\)\.)/);

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

TP.core.CompositePath.Inst.defineMethod('executeGet',
function(targetObj, varargs) {

    /**
     * @method executeGet
     * @summary Returns the result of executing the path in a 'get' fashion -
     *     i.e. with the intent of retrieving data from the supplied target
     *     object.
     * @param {Object} targetObj The object to execute the receiver against to
     *     get data.
     * @param {Array} varargs The arguments to execute the get with. The
     *     first argument should be the object to execute the receiver against
     *     to retrieve data. Any remaining arguments will be used as values for
     *     a templated substitution in the path itself.
     * @exception TP.sig.InvalidParameter,TP.sig.InvalidPath
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

TP.core.CompositePath.Inst.defineMethod('executeSet',
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
     * @param {Array} varargs Any remaining arguments will be used as values
     *     for a templated substitution in the path itself.
     * @exception TP.sig.InvalidParameter,TP.sig.InvalidPath
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

TP.core.CompositePath.Inst.defineMethod('getPathParts',
function() {

    /**
     * @method getPathParts
     * @summary Returns the receiver's parts.
     * @returns {Array} An Array of the receiver's parts.
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

//  ========================================================================
//  TP.core.JSONPath
//  ========================================================================

/**
 * @type {TP.core.JSONPath}
 */

//  ------------------------------------------------------------------------

TP.core.AccessPath.defineSubtype('JSONPath');

//  ------------------------------------------------------------------------

//  avoid binding and apply issues by creating our alias as a wrapper
TP.definePrimitive('jpc',
function(aPath, config) {

    /**
     * @method jpc
     * @summary Returns a newly initialized JSONPath instance. Note that if
     * @param {String} aPath The JSONPath as a String.
     * @param {TP.core.Hash} config The configuration for this path.
     * @returns {TP.core.XPathPath} The new instance.
     */

    return TP.core.JSONPath.construct.apply(TP.core.JSONPath, arguments);
});

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.JSONPath.Type.defineAttribute('$mirroredAttributes');

//  ------------------------------------------------------------------------

TP.core.JSONPath.Type.defineMethod('initialize',
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

TP.core.JSONPath.Type.defineMethod('asXPath',
function(srcPath, templateArgs) {

    /**
     * @method asXPath
     * @summary Returns an XPath representation of the supplied source path.
     *     This is used to query the special XML representation of a JavaScript
     *     object sourced from JSON data and converted to XML. This is only used
     *     for TIBET's JSONPath support.
     * @param {String} srcPath The source JSONPath string representation to
     *     build an XPath from.
     * @param {Array} templateArgs An optional Array of template arguments. If
     *     the receiver is a templated path, these values will be used to fill
     *     in the template values and the computed XPath will *not* be cached.
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
            exprRecord = {type: 'none', value: 'none'};
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
                            from = exprRecord.value.start.asNumber();
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

                        if (TP.isValid(exprRecord.value.end)) {
                            to = exprRecord.value.end.asNumber();

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
TP.core.JSONPath.Inst.defineAttribute('$xmlPath');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.JSONPath.Inst.defineMethod('init',
function(aPath, config) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {String} aPath The String to build the instance from.
     * @param {TP.core.Hash} config The configuration for this path.
     * @returns {TP.core.SimpleTIBETPath} The receiver.
     */

    var path;

    //  Make sure that any 'access path' scheme is stripped off
    if (TP.regex.JSON_POINTER.test(aPath)) {
        path = TP.regex.JSON_POINTER.match(aPath).at(1);
    } else {
        path = aPath;
    }

    this.callNextMethod(path, config);

    if (TP.isKindOf(config, TP.core.Hash)) {
        this.set('shouldCollapse', config.atIfInvalid('shouldCollapse', true));
    } else {
        this.set('shouldCollapse', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JSONPath.Inst.defineMethod('executeGet',
function(targetObj, varargs) {

    /**
     * @method executeGet
     * @summary Returns the result of executing the path in a 'get' fashion -
     *     i.e. with the intent of retrieving data from the supplied target
     *     object.
     * @param {targetObj} Object The object to execute the receiver against to
     *     get data.
     * @param {Array} varargs The arguments to execute the get with. The
     *     first argument should be the object to execute the receiver against
     *     to retrieve data. Any remaining arguments will be used as values for
     *     a templated substitution in the path itself.
     * @exception TP.sig.InvalidParameter,TP.sig.InvalidPath,TP.sig.InvalidNode
     * @returns {Object} The result of executing a 'get' against the target
     *     object using the receiver.
     */

    var target,

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

    //  See if the JSONContent object already has corresponding XML content. If
    //  not, create it.
    tpXMLDoc = target.$get('data');
    if (!TP.isKindOf(tpXMLDoc, TP.core.XMLDocumentNode)) {

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
                !TP.isKindOf(currentJSONData, TP.core.Node)) {
            currentJSONData = TP.json2js(TP.js2json(currentJSONData), false);
        }

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
                    result;

                //  Retrieve the XML representation that is sitting in the
                //  actual 'data' slot (using $get() to avoid getting
                //  recursively called here).
                if (TP.isValid(tpValueDoc = this.$get('data'))) {

                    if (TP.isValid(
                        result = TP.$xml2jsonObj(TP.unwrap(tpValueDoc)))) {

                        //  Locally program a reference to ourself on the
                        //  generated XML TP.core.Document.
                        tpValueDoc.defineAttribute('$$realData');
                        tpValueDoc.$set('$$realData', this);

                        //  NB: In our particular encoding of JS<->XML, we use
                        //  the 'rootObj' slot as a top-level value. See below.
                        return result.rootObj;
                    }
                }

                return null;
            });

        //  ---

        //  Define a local version of 'setData' to set the supplied JavaScript
        //  Object data as an XML representation under the covers.
        target.defineMethod(
            'setData',
            function(aDataObject, shouldSignal) {
                var rootObj,
                    tpValueDoc;

                //  We always place this behind a 'rootObj' slot - if the JSON
                //  describes a top-level Hash with multiple properties, then we
                //  need to have this anyway so that the XML can have a single
                //  root element. The TP.$jsonObj2xml() call will do this for us
                //  automatically, but we want to have a well-known handle.
                rootObj = {rootObj: aDataObject};
                tpValueDoc = TP.wrap(TP.$jsonObj2xml(rootObj));

                if (TP.isValid(tpValueDoc)) {
                    //  Locally program a reference to ourself on the generated
                    //  XML TP.core.Document.
                    tpValueDoc.defineAttribute('$$realData');
                    tpValueDoc.$set('$$realData', this);
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

                if (TP.isValid(data = this.$get('data'))) {
                    return data.changed(anAspect, anAction, aDescription);
                }
            });

        //  ---

        //  Define a local version of 'insertRowIntoAt' to adjust for the fact
        //  that the indexes, etc. will be supplied using the 0-based indexes of
        //  JSON, but it is the underlying XML data representation that needs to
        //  be changed and, therefore, we need to adjust those indexes and use
        //  XPaths against that representation.
        target.defineMethod('insertRowIntoAt',
        function(aCollectionURI, aCloneIndex, anInsertIndex, aPosition) {

            var xpath,
                targetCollection,

                cloneIndex,

                itemToClone,
                newItem,

                insertIndex,

                insertionPath;

            xpath = TP.core.JSONPath.asXPath(aCollectionURI.getFragmentExpr());

            targetCollection = this.$get('data').get(xpath);

            //  Clone the first row if no clone index was supplied
            if (!TP.isNumber(cloneIndex = aCloneIndex)) {
                cloneIndex = 0;
            }

            //  We add 1 to account for indexing differences between JSONPath
            //  and XPath
            cloneIndex++;

            //  Get the item to clone and clone it.
            itemToClone = targetCollection.get('./*[' + cloneIndex + ']');
            newItem = itemToClone.clone(true);

            //  Clear out all of the 'text content' - that is, all of the scalar
            //  values in the newly cloned item. This will descend through the
            //  new item's data structure and cleanse it all of previous values.
            newItem.clearTextContent();

            //  NB: The insertion index is computed to represent the row that
            //  will come *after* the new row after the insertion operation is
            //  complete (per 'insertBefore()' semantics).

            if (TP.isNumber(insertIndex = anInsertIndex)) {

                if (aPosition !== TP.BEFORE) {
                    insertIndex++;
                }

                //  We add 1 to account for indexing differences between
                //  JSONPath and XPath
                insertIndex++;

                insertionPath = './*[' + insertIndex + ']';

            } else {

                //  No index specified - we will be manipulating the end of
                //  the collection.
                if (aPosition === TP.BEFORE) {
                    insertionPath = './*[last()]';
                } else {
                    targetCollection.addRawContent(newItem, null, false);
                }
            }

            if (TP.notEmpty(insertionPath)) {
                targetCollection.insertRawContent(
                                    newItem, insertionPath, null, false);
            }

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

                deleteIndexes,
                deletionPath,

                deleteIndex,
                i;

            xpath = TP.core.JSONPath.asXPath(aCollectionURI.getFragmentExpr());

            targetCollection = this.$get('data').get(xpath);

            //  Compute an XPath to do the deletion.

            //  If a deletion index was supplied or we have numbers in our
            //  selection indexes, then use those as the deletion indexes.
            if (TP.isNumber(deleteIndexes = aDeleteIndex)) {

                deleteIndexes++;

                deletionPath = './*[' + deleteIndexes + ']';

            } else if (TP.notEmpty(
                            deleteIndexes = this.get('selectionIndexes'))) {
                deletionPath = './*[';
                for (i = 0; i < deleteIndexes.getSize(); i++) {
                    deleteIndex = deleteIndexes.at(i) + 1;

                    deletionPath += 'position = ' + deleteIndex + ' or ';
                }

                deletionPath = deletionPath.slice(0, -4) + ']';
            } else {

                //  Otherwise, just delete the last item.
                deletionPath = './*[last()]';
            }

            //  Create an XPathPath object from the computed path and execute a
            //  delete.
            TP.xpc(deletionPath).execRemove(targetCollection, false);

            return this;
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
                                resultKeys = Object.keys(result);

                                //  If the converted data structure only has 1
                                //  key, then return the object at that key.
                                if (resultKeys.length === 1) {
                                    return result[resultKeys[0]];
                                }

                                return result;
                            });
        } else if (TP.isNode(retVal)) {

            retVal = TP.$xml2jsonObj(retVal);
            retValKeys = Object.keys(retVal);

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
});

//  -----------------------------------------------------------------------

TP.core.JSONPath.Inst.defineMethod('executeSet',
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
     * @param {Array} varargs Any remaining arguments will be used as values
     *     for a templated substitution in the path itself.
     * @exception TP.sig.InvalidParameter,TP.sig.InvalidPath,TP.sig.InvalidNode
     * @returns {TP.core.JSONPath} The receiver.
     */

    var srcPath,

        args,

        oldVal,

        tpXMLDoc,
        xmlPath;

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

    xmlPath.executeSet(tpXMLDoc, attributeValue, shouldSignal);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JSONPath.Inst.defineMethod('getPathParts',
function() {

    /**
     * @method getPathParts
     * @summary Returns the receiver's parts.
     * @returns {Array} An Array of the receiver's parts.
     */

    return TP.getAccessPathParts(this.get('srcPath'), 'json');
});

//  ------------------------------------------------------------------------

TP.core.JSONPath.Inst.defineMethod('getPathType',
function() {

    /**
     * @method getPathType
     * @summary Returns the receiver's 'path type'.
     * @returns {String} A path type
     */

    return TP.JSON_PATH_TYPE;
});

//  ------------------------------------------------------------------------

TP.core.JSONPath.Inst.defineMethod('set',
function(attributeName, attributeValue, shouldSignal) {

    /**
     * @method set
     * @summary Sets the value of the named attribute to the value provided. If
     *     no value is provided the value null is used.
     * @description This is overridden from its supertype to make sure to copy
     *     over attributes that also need to be populated onto the receiver's
     *     internal XPath.
     * @param {String|TP.core.AccessPath} attributeName The name of the
     *     attribute to set.
     * @param {Object} attributeValue The value to set.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {TP.core.Content} The receiver.
     */

    var xmlPath;

    //  For certain properties we mirror their settings onto our internal
    //  xmlPath.
    if (this.getType().get('$mirroredAttributes').contains(attributeName)) {
        if (TP.isValid(xmlPath = this.get('$xmlPath'))) {
            xmlPath.set(attributeName, attributeValue, shouldSignal);
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.JSONPath.Inst.defineMethod('$setupXMLPath',
function(templateArgs) {

    /**
     * @method $setupXMLPath
     * @summary Sets up an XML path for the receiver that will represent it when
     *     being executed an XML data source that is used by TP.core.JSONContent
     *     objects when they are accessed with a JSONPath.
     * @param {Array} templateArgs An optional Array of template arguments. If
     *     the receiver is a templated path, these values will be used to fill
     *     in the template values and the computed XPath will *not* be cached.
     * @returns {TP.core.XPathPath} The new instance of the computed XPath pate
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
                    TP.core.AccessPath.$getObservedAddresses().at(
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

                executedPaths = TP.core.AccessPath.$getExecutedPaths().at(
                                        TP.id(targetObj));

                invalidatedPaths = this.get('$invalidatedPaths');

                if (TP.notEmpty(invalidatedPaths)) {

                    //  Copy the currently invalidated paths Array and convert
                    //  the items in that Array to their XPath equivalent -
                    //  that's what will be found in the executedPaths
                    invalidInternalPaths = invalidatedPaths.copy();
                    invalidInternalPaths.convert(
                            function(aJSONPath) {
                                return TP.core.JSONPath.asXPath(aJSONPath);
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
});

//  ========================================================================
//  TP.core.SimpleTIBETPath
//  ========================================================================

/**
 * @type {TP.core.SimpleTIBETPath}
 */

//  ------------------------------------------------------------------------

TP.core.AccessPath.defineSubtype('SimpleTIBETPath');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Type.defineAttribute('$traversalLevel');
TP.core.SimpleTIBETPath.Type.defineAttribute('$prefixParts');

TP.core.SimpleTIBETPath.Type.defineAttribute('$currentSource');
TP.core.SimpleTIBETPath.Type.defineAttribute('$currentPath');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Type.defineMethod('initialize',
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

TP.core.SimpleTIBETPath.Type.defineMethod('endChangedAddress',
function() {

    /**
     * @method endChangedAddress
     * @returns {TP.core.SimpleTIBETPath} The receiver.
     */

    this.get('$prefixParts').pop();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Type.defineMethod('endObservedAddress',
function() {

    /**
     * @method endObservedAddress
     * @returns {TP.core.SimpleTIBETPath} The receiver.
     */

    var srcObj;

    srcObj = TP.core.SimpleTIBETPath.get('$currentSource');
    if (TP.owns(srcObj, '$$noPathTracking')) {
        return this;
    }

    this.get('$prefixParts').pop();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Type.defineMethod('getChangedAddress',
function() {

    /**
     * @method getChangedAddress
     * @returns {String}
     */

    //  Note here the conversion from 'foo.[1]' to 'foo[1]'
    return this.get('$prefixParts').join('.').replace(/\.\[/g, '[');
});

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Type.defineMethod('startChangedAddress',
function(addressPart) {

    /**
     * @method startChangedAddress
     * @param {String} addressPart
     * @returns {TP.core.SimpleTIBETPath} The receiver.
     */

    var prefixParts;

    prefixParts = this.get('$prefixParts');

    prefixParts.push(addressPart);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Type.defineMethod('startObservedAddress',
function(addressPart) {

    /**
     * @method startObservedAddress
     * @param {String} addressPart
     * @returns {TP.core.SimpleTIBETPath} The receiver.
     */

    var srcObj,

        prefixParts,

        sourceObjectID,
        srcPath,

        address;

    srcObj = TP.core.SimpleTIBETPath.get('$currentSource');
    if (TP.owns(srcObj, '$$noPathTracking')) {
        return this;
    }

    prefixParts = this.get('$prefixParts');

    prefixParts.push(addressPart);

    //  Note here the conversion from 'foo.[1]' to 'foo[1]'
    address = prefixParts.join('.').replace(/\.\[/g, '[');

    srcPath = TP.core.SimpleTIBETPath.get('$currentPath').get('srcPath');

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
TP.core.SimpleTIBETPath.Inst.defineAttribute('$createdStructure');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Inst.defineMethod('init',
function(aPath, config) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {String} aPath The String to build the instance from.
     * @param {TP.core.Hash} config The configuration for this path.
     * @returns {TP.core.SimpleTIBETPath} The receiver.
     */

    var path;

    //  Make sure that any 'access path' scheme is stripped off
    if (TP.regex.TIBET_POINTER.test(aPath)) {
        path = TP.regex.TIBET_POINTER.match(aPath).at(1);
    } else {
        path = aPath;
    }

    this.callNextMethod(path, config);

    if (TP.isKindOf(config, TP.core.Hash)) {
        this.set('shouldCollapse', config.atIfInvalid('shouldCollapse', true));
    } else {
        this.set('shouldCollapse', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Inst.defineMethod('executeGet',
function(targetObj, varargs) {

    /**
     * @method executeGet
     * @summary Returns the result of executing the path in a 'get' fashion -
     *     i.e. with the intent of retrieving data from the supplied target
     *     object.
     * @param {targetObj} Object The object to execute the receiver against to
     *     get data.
     * @param {Array} varargs The arguments to execute the get with. The
     *     first argument should be the object to execute the receiver against
     *     to retrieve data. Any remaining arguments will be used as values for
     *     a templated substitution in the path itself.
     * @exception TP.sig.InvalidParameter,TP.sig.InvalidPath
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

TP.core.SimpleTIBETPath.Inst.defineMethod('executeSet',
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
     * @param {Array} varargs Any remaining arguments will be used as values
     *     for a templated substitution in the path itself.
     * @exception TP.sig.InvalidParameter,TP.sig.InvalidPath
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

    targetObj.defineAttribute(path);
    retVal = targetObj.set(path, attributeValue, false);

    thisType.endChangedAddress();

    this.postSetAccess(targetObj);

    traversalLevel = TP.core.SimpleTIBETPath.get('$traversalLevel');

    if (traversalLevel === 0) {

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

        //  Empty the changed addresses now that we've sent the signal.
        TP.core.AccessPath.$getChangedAddresses().empty();
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Inst.defineMethod('getFirstSimplePath',
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

TP.core.SimpleTIBETPath.Inst.defineMethod('getPathParts',
function() {

    /**
     * @method getPathParts
     * @summary Returns the receiver's parts.
     * @returns {Array} An Array of the receiver's parts.
     */

    return TP.getAccessPathParts(this.get('srcPath'), 'tibet');
});

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Inst.defineMethod('getPathType',
function() {

    /**
     * @method getPathType
     * @summary Returns the receiver's 'path type'.
     * @returns {String} A path type
     */

    return TP.TIBET_PATH_TYPE;
});

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Inst.defineMethod('preGetAccess',
function(targetObj) {

    /**
     * @method preGetAccess
     * @param {targetObj} Object
     * @returns {TP.core.SimpleTIBETPath} The receiver.
     */

    var executedPaths;

    executedPaths = TP.core.AccessPath.$getExecutedPaths().atPutIfAbsent(
                    TP.id(targetObj),
                    TP.hc());

    executedPaths.atPut(this.get('srcPath'), this);

    TP.core.SimpleTIBETPath.set(
        '$currentSource',
        TP.ifInvalid(
            TP.core.SimpleTIBETPath.get('$currentSource'), targetObj));
    TP.core.SimpleTIBETPath.set(
        '$currentPath',
        TP.ifInvalid(
            TP.core.SimpleTIBETPath.get('$currentPath'), this));

    TP.core.SimpleTIBETPath.set(
        '$traversalLevel',
        TP.core.SimpleTIBETPath.get('$traversalLevel') + 1);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Inst.defineMethod('preSetAccess',
function(targetObj) {

    /**
     * @method preSetAccess
     * @param {targetObj} Object
     * @returns {TP.core.SimpleTIBETPath} The receiver.
     */

    TP.core.SimpleTIBETPath.set(
        '$traversalLevel',
        TP.core.SimpleTIBETPath.get('$traversalLevel') + 1);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Inst.defineMethod('postGetAccess',
function(targetObj) {

    /**
     * @method postGetAccess
     * @param {targetObj} Object
     * @returns {TP.core.SimpleTIBETPath} The receiver.
     */

    var traversalLevel;

    traversalLevel = TP.core.SimpleTIBETPath.get('$traversalLevel') - 1;

    TP.core.SimpleTIBETPath.set('$traversalLevel', traversalLevel);

    if (traversalLevel === 0) {
        TP.core.SimpleTIBETPath.set('$currentSource', null);
        TP.core.SimpleTIBETPath.set('$currentPath', null);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.Inst.defineMethod('postSetAccess',
function(targetObj) {

    /**
     * @method postSetAccess
     * @param {targetObj} Object
     * @returns {TP.core.SimpleTIBETPath} The receiver.
     */

    var traversalLevel;

    traversalLevel = TP.core.SimpleTIBETPath.get('$traversalLevel') - 1;

    TP.core.SimpleTIBETPath.set('$traversalLevel', traversalLevel);

    return this;
});

//  ========================================================================
//  TP.core.ComplexTIBETPath
//  ========================================================================

/**
 * @type {TP.core.ComplexTIBETPath}
 */

//  ------------------------------------------------------------------------

TP.core.SimpleTIBETPath.defineSubtype('ComplexTIBETPath');

//  ------------------------------------------------------------------------

//  avoid binding and apply issues by creating our alias as a wrapper
TP.definePrimitive('tpc',
function(aPath, config) {

    /**
     * @method tpc
     * @summary Returns a newly initialized TIBETSimplePath or
     *     TIBETComplexPath instance.
     * @param {String} aPath The path as a String.
     * @param {TP.core.Hash} config The configuration for this path.
     * @returns {TP.core.SimpleTIBETPath|TP.core.ComplexTIBETPath} The new
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
        TP.regex.SIMPLE_NUMERIC_PATH.test(path)) {
        return TP.core.SimpleTIBETPath.construct.apply(
                        TP.core.SimpleTIBETPath, arguments);
    }

    //  Otherwise, if it has 'TIBETan' access path characters, create a TIBET
    //  path to deal with it.
    if (TP.regex.TIBET_PATH.test(path)) {
        return TP.core.ComplexTIBETPath.construct.apply(
                            TP.core.ComplexTIBETPath, arguments);
    }

    return null;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The transformed path we actually execute - it may have templated
//  expressions.
TP.core.ComplexTIBETPath.Inst.defineAttribute('$transformedPath');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.ComplexTIBETPath.Inst.defineMethod('init',
function(aPath, config) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {String} aPath The String to build the instance from.
     * @param {TP.core.Hash} config The configuration for this path.
     * @returns {TP.core.ComplexTIBETPath} The receiver.
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

TP.core.ComplexTIBETPath.Inst.defineMethod('checkValueEquality',
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

TP.core.ComplexTIBETPath.Inst.defineMethod('executeGet',
function(targetObj, varargs) {

    /**
     * @method executeGet
     * @summary Returns the result of executing the path in a 'get' fashion -
     *     i.e. with the intent of retrieving data from the supplied target
     *     object.
     * @param {targetObj} Object The object to execute the receiver against to
     *     get data.
     * @param {Array} varargs The arguments to execute the get with. The
     *     first argument should be the object to execute the receiver against
     *     to retrieve data. Any remaining arguments will be used as values for
     *     a templated substitution in the path itself.
     * @exception TP.sig.InvalidParameter,TP.sig.InvalidPath
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

TP.core.ComplexTIBETPath.Inst.defineMethod('executeSet',
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
     * @param {Array} varargs Any remaining arguments will be used as values
     *     for a templated substitution in the path itself.
     * @exception TP.sig.InvalidParameter, TP.sig.InvalidPath
     * @returns {Object} The result of executing a 'set' against the target
     *     object using the receiver.
     */

    var srcPath,
        path,

        args,

        retVal,
        traversalLevel,
        oldVal,

        sigFlag,

        mutatedStructure,
        executedPaths;

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
    //  NB: We have to do this *after* the preSetAccess call so that change
    //  path data structures are set up properly.
    traversalLevel = TP.core.SimpleTIBETPath.get('$traversalLevel');
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
    traversalLevel = TP.core.SimpleTIBETPath.get('$traversalLevel');

    //  Only signal change if we're the 'top level' TIBET path - we could've
    //  had more 'complex paths' buried under us.
    if (traversalLevel === 0) {

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

            if (this.get('$createdStructure')) {
                executedPaths = TP.core.AccessPath.$getExecutedPaths().at(
                                        TP.id(targetObj));

                executedPaths.perform(
                        function(pathEntry) {
                            pathEntry.last().executeGet(targetObj);
                        });
            }

            //  Send the changed signal
            this.sendChangedSignal(targetObj);

            if (mutatedStructure) {
                this.updateRegistrationsAfterSignaling(targetObj);
            }
        }

        //  Empty the changed addresses now that we've sent the signal.
        TP.core.AccessPath.$getChangedAddresses().empty();

        //  Flip this back off for the next run.
        this.set('$createdStructure', false);
    }

    return retVal;
});

//  ------------------------------------------------------------------------
//  Getter Methods
//  ------------------------------------------------------------------------

TP.core.ComplexTIBETPath.Inst.defineMethod('$executeArrayGet',
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

        retVal = val.get(TP.tpc(tail));

        thisType.endObservedAddress();

        return retVal;
    } else {
        return val;
    }

    //  Had an access character, but we can't compute the path.
    return;
});

//  ------------------------------------------------------------------------

TP.core.ComplexTIBETPath.Inst.defineMethod('$executeObjectGet',
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

        retVal = val.get(TP.tpc(tail));

        thisType.endObservedAddress();

        return retVal;
    } else {
        return val;
    }

    //  Had an access character, but we can't compute the path.
    return;
});

//  ------------------------------------------------------------------------

TP.core.ComplexTIBETPath.Inst.defineMethod('$executeStringGet',
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

TP.core.ComplexTIBETPath.Inst.defineMethod('$executeArraySet',
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
     * @returns {Array|null} The targetObj or null.
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
                        indexVal.set(TP.tpc(tail, TP.hc('shouldMakeStructures',
                                                                shouldMake)),
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
                        itemVal.set(TP.tpc(tail, TP.hc('shouldMakeStructures',
                                                                shouldMake)),
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

TP.core.ComplexTIBETPath.Inst.defineMethod('$executeObjectSet',
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
     * @returns {Object|null} The targetObj or null.
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

TP.core.ComplexTIBETPath.Inst.defineMethod('$extractPathHeadAndTail',
function(aPath) {

    /**
     * @method $extractPathHeadAndTail
     * @summary Returns the head and tail of the supplied path.
     * @param {String} aPath The path to extract the head and tail from.
     * @returns {Array} A pair of the [head, tail].
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

TP.core.ComplexTIBETPath.Inst.defineMethod('getFirstSimplePath',
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
//  TP.core.XMLPath
//  ========================================================================

/**
 * @type {TP.core.XMLPath}
 */

//  ------------------------------------------------------------------------

TP.core.AccessPath.defineSubtype('XMLPath');

//  This is an abstract supertype - need a concrete subtype to get real work
//  done.
TP.core.XMLPath.isAbstract(true);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The path we use to register interest for change notification
TP.core.XMLPath.Inst.defineAttribute('$interestedPath');

//  The transformed path we actually execute - it may have templated
//  expressions.
TP.core.XMLPath.Inst.defineAttribute('$transformedPath');

//  Whether or not to make scalar data slots on execution
TP.core.XMLPath.Inst.defineAttribute('shouldMakeValues');

//  -----------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.XMLPath.Inst.defineMethod('init',
function(aPath, config) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {String} aPath The String to build the instance from.
     * @param {TP.core.Hash} config The configuration for this path.
     * @returns {TP.core.XMLPath} The receiver.
     */

    this.callNextMethod();

    if (TP.isKindOf(config, TP.core.Hash)) {
        this.set('shouldMakeValues',
                    config.atIfInvalid('shouldMakeValues', true));
    } else {
        this.set('shouldMakeValues', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.XMLPath.Inst.defineMethod('$addChangedAddressFromNode',
function(aNode, prevNode) {

    /**
     * @method $addChangedAddressFromNode
     * @summary Adds the supplied node's address and action to
     *     TP.core.AccessPath's 'changed address list'.
     * @param {Node} aNode The Node to extract the address and action from.
     * @param {Node} prevNode Any previous content that was at the place in the
     *     data structure where aNode is now. This is used to determine what
     *     kind of change action to compute.
     * @returns {TP.core.XMLPath} The receiver.
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

    } else if (TP.isTextNode(aNode)) {

        elem = aNode.parentNode;

        //  We need to test the owner element to see if it already has an
        //  appropriate action (i.e. TP.CREATE if this text node has just been
        //  created). Otherwise, we set it to TP.UPDATE.

        if (TP.notValid(action = TP.elementGetChangeAction(elem, TP.SELF))) {
            action = TP.UPDATE;
        }

    } else if (TP.isElement(elem = aNode)) {

        //  We need to flag changes on the content element, but not if the
        //  '$$getContentForSetOperation()' created this element. It will
        //  have tagged it with a TP.CREATE action already.

        if (TP.notValid(action = TP.elementGetChangeAction(elem, TP.SELF))) {
            action = TP.UPDATE;
        }
    }

    //  Obtain the node's document position - we will use this as our address.
    address = TP.nodeGetDocumentPosition(aNode);

    //  If we're doing a TP.UPDATE, we message ourself to determine whether to
    //  change an 'update' to a 'delete'/'create' combination. If so, then we
    //  change to registering a TP.DELETE, followed by a TP.CREATE for that.
    if (action === TP.UPDATE &&
        this.$updateOpsBecomeDeleteInsertOps(aNode, prevNode)) {
        TP.core.AccessPath.registerChangedAddress(address, TP.DELETE);
        TP.core.AccessPath.registerChangedAddress(address, TP.CREATE);
    } else {
        TP.core.AccessPath.registerChangedAddress(address, action);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.XMLPath.Inst.defineMethod('checkValueEquality',
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

TP.core.XMLPath.Inst.defineMethod('executeGet',
function(targetObj, varargs) {

    /**
     * @method executeGet
     * @summary Returns the result of executing the path in a 'get' fashion -
     *     i.e. with the intent of retrieving data from the supplied target
     *     object.
     * @param {targetObj} Object The object to execute the receiver against to
     *     get data.
     * @param {Array} varargs The arguments to execute the get with. The
     *     first argument should be the object to execute the receiver against
     *     to retrieve data. Any remaining arguments will be used as values for
     *     a templated substitution in the path itself.
     * @exception TP.sig.InvalidParameter, TP.sig.InvalidNode
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

        interestedPath;

    target = targetObj;

    if (TP.notValid(target)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    if (TP.isKindOf(target, TP.core.XMLContent)) {
        target = target.$get('data');
    }

    //  This kind of path only works against XML
    if (!TP.isNode(target) && !TP.isKindOf(target, TP.core.Node)) {
        return this.raise('TP.sig.InvalidNode');
    }

    srcPath = this.get('srcPath');

    //  If the path is empty or just '.', then that's the shortcut to just
    //  return the target object itself.
    if (TP.isEmpty(srcPath) || TP.regex.ONLY_PERIOD.test(srcPath)) {
        return target;
    }

    executedPaths = TP.core.AccessPath.$getExecutedPaths().atPutIfAbsent(
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
                TP.core.AccessPath.registerObservedAddress(
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

    return this.processFinalValue(nodes, target);
});

//  -----------------------------------------------------------------------

TP.core.XMLPath.Inst.defineMethod('executeSet',
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
     * @param {Array} varargs Any remaining arguments will be used as values
     *     for a templated substitution in the path itself.
     * @exception TP.sig.InvalidParameter, TP.sig.InvalidPath
     * @returns {TP.core.XPathPath} The receiver.
     */

    var target,

        args,
        oldVal,

        newVal,

        natTargetObj,
        targetDoc,
        targetTPDoc,

        signalChange,

        flagChanges,
        leaveFlaggedChanges,

        path,

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

        executedPaths;

    if (TP.notValid(targetObj)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    target = targetObj;

    if (TP.isKindOf(target, TP.core.XMLContent)) {
        target = target.$get('data');
    }

    //  This kind of path only works against XML
    if (!TP.isNode(target) && !TP.isKindOf(target, TP.core.Node)) {
        return this.raise('TP.sig.InvalidPath');
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

    //  If the target object is flagging changes, then we set both flags to
    //  true. Otherwise, we set whether we flag changes as to whether we want
    //  to signal change (in which case we have to, in order to get the proper
    //  set of addresses) but we don't want to leave those flags around, so we
    //  set the 'leaveFlaggedChanges' to false to strip them out.
    if (TP.wrap(target).shouldFlagChanges()) {
        flagChanges = true;
        leaveFlaggedChanges = true;
    } else {
        flagChanges = signalChange;
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

    //  First, we have to get the nodes that we can use to set the value - if
    //  we can't do that, then we're dead in the water...

    //  Note here how we pass 'true' to *always* flag changes in any content
    //  that we generate
    if (TP.notValid(content = this.$$getContentForSetOperation(
                                                natTargetObj, flagChanges))) {

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

    if (signalChange) {
        affectedElems = TP.ac();
    }

    if (TP.isNode(content)) {

        //  If the attrValue is a Node, clone it so that we don't remove it
        //  from it's original DOM, etc.
        if (TP.isNode(value = attrValue)) {
            value = TP.nodeCloneNode(attrValue, true);
        } else {
            value = attrValue;
        }

        oldcontent = TP.nodeCloneNode(content);

        //  Finalize the set value.
        value = this.finalizeSetValue(content, value);
        mutatedStructure = this.valueIsStructural(content, value);

        //  leverage TP.core.Node wrappers to manage update intelligently
        tpcontent = TP.wrap(content);
        tpcontent.setRawContent(value);

        //  99% is single value targeting a single element, attribute node or
        //  text node
        if (TP.isElement(content)) {
            ownerElem = TP.isDocument(content.parentNode) ?
                        content :
                        content.parentNode;

            //  If we're gonna signal a change, then add the element's address
            //  to the list of changed addresses.
            if (signalChange) {
                affectedElems.push(content);

                //  Note here how we pass in 'false', because we don't want to
                //  overwrite any existing change flag record for the TP.SELF
                //  address on this element.
                TP.elementFlagChange(content, TP.SELF, TP.UPDATE, false);

                this.$addChangedAddressFromNode(content, oldcontent);

                if (TP.notEmpty(TP.elementGetChangeAction(ownerElem, TP.SELF))) {
                    affectedElems.push(ownerElem);
                    this.$addChangedAddressFromNode(ownerElem);
                }
            } else if (flagChanges) {
                //  Note here how we pass in 'false', because we don't want to
                //  overwrite any existing change flag record for the TP.SELF
                //  address on this element.
                TP.elementFlagChange(content, TP.SELF, TP.UPDATE, false);

                if (TP.notEmpty(TP.elementGetChangeAction(ownerElem, TP.SELF))) {
                    affectedElems.push(ownerElem);
                }
            }
        } else if (TP.isAttributeNode(content)) {
            ownerElem = TP.attributeGetOwnerElement(content);

            //  If we're gonna signal a change, then add the attribute's
            //  address to the list of changed addresses.
            if (signalChange) {
                affectedElems.push(ownerElem);

                //  Note here how we pass in 'false', because we don't want to
                //  overwrite any existing change flag record for the TP.ATTR +
                //  content.name address on this element.
                TP.elementFlagChange(
                        ownerElem, TP.ATTR + content.name, TP.UPDATE, false);

                this.$addChangedAddressFromNode(content);
            } else if (flagChanges) {
                //  Note here how we pass in 'false', because we don't want to
                //  overwrite any existing change flag record for the TP.ATTR +
                //  content.name address on this element.
                TP.elementFlagChange(
                        ownerElem, TP.ATTR + content.name, TP.UPDATE, false);
            }
        } else if (TP.isTextNode(content)) {
            ownerElem = content.parentNode;

            //  If we're gonna signal a change, then add the element's address
            //  to the list of changed addresses.
            if (signalChange) {
                affectedElems.push(ownerElem);

                //  Note here how we pass in 'false', because we don't want to
                //  overwrite any existing change flag record for the TP.ATTR +
                //  content.name address on this element.
                TP.elementFlagChange(
                        ownerElem, TP.SELF, TP.UPDATE, false);

                this.$addChangedAddressFromNode(content);
            } else if (flagChanges) {
                //  Note here how we pass in 'false', because we don't want to
                //  overwrite any existing change flag record for the TP.ATTR +
                //  content.name address on this element.
                TP.elementFlagChange(
                        ownerElem, TP.SELF, TP.UPDATE, false);
            }
        }
    } else if (TP.isArray(content)) {
        len = content.getSize();
        for (i = 0; i < len; i++) {
            contentnode = content.at(i);

            //  If the value is a Node, clone it so that we don't remove it
            //  from it's original DOM, etc.
            if (TP.isNode(value = attrValue)) {
                value = TP.nodeCloneNode(attrValue, true);
            } else {
                value = attrValue;
            }

            oldcontent = TP.nodeCloneNode(contentnode);

            value = this.finalizeSetValue(contentnode, value);
            mutatedStructure = this.valueIsStructural(contentnode, value);

            //  leverage TP.core.Node wrappers to manage update intelligently
            tpcontent = TP.wrap(contentnode);
            tpcontent.setRawContent(value);

            if (TP.isNode(contentnode)) {
                if (TP.isElement(contentnode)) {
                    ownerElem = TP.isDocument(contentnode.parentNode) ?
                                contentnode :
                                contentnode.parentNode;

                    //  If we're gonna signal a change, then add the element's
                    //  address to the list of changed addresses.
                    if (signalChange) {
                        affectedElems.push(contentnode);

                        //  Note here how we pass in 'false', because we don't
                        //  want to overwrite any existing change flag record
                        //  for the TP.SELF address on this element.
                        TP.elementFlagChange(
                                contentnode, TP.SELF, TP.UPDATE, false);

                        this.$addChangedAddressFromNode(contentnode,
                                                        oldcontent);

                        if (TP.notEmpty(TP.elementGetChangeAction(
                                                        ownerElem, TP.SELF))) {
                            affectedElems.push(ownerElem);
                            this.$addChangedAddressFromNode(ownerElem);
                        }
                    } else if (flagChanges) {
                        //  Note here how we pass in 'false', because we don't
                        //  want to overwrite any existing change flag record
                        //  for the TP.SELF address on this element.
                        TP.elementFlagChange(
                                contentnode, TP.SELF, TP.UPDATE, false);
                        if (TP.notEmpty(TP.elementGetChangeAction(
                                                        ownerElem, TP.SELF))) {
                            affectedElems.push(ownerElem);
                        }
                    }
                } else if (TP.isAttributeNode(contentnode)) {
                    ownerElem = TP.attributeGetOwnerElement(contentnode);

                    //  If we're gonna signal a change, then add the
                    //  attribute's address to the list of changed addresses.
                    if (signalChange) {
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

                        this.$addChangedAddressFromNode(contentnode);
                    } else if (flagChanges) {
                        //  Note here how we pass in 'false', because we don't
                        //  want to overwrite any existing change flag record
                        //  for the TP.ATTR + contentnode.name address on this
                        //  element.
                        TP.elementFlagChange(
                                ownerElem,
                                TP.ATTR + contentnode.name,
                                TP.UPDATE,
                                false);
                    }
                } else if (TP.isTextNode(contentnode)) {
                    ownerElem = contentnode.parentNode;

                    //  If we're gonna signal a change, then add the
                    //  attribute's address to the list of changed addresses.
                    if (signalChange) {
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

                        this.$addChangedAddressFromNode(contentnode);
                    } else if (flagChanges) {
                        //  Note here how we pass in 'false', because we don't
                        //  want to overwrite any existing change flag record
                        //  for the TP.ATTR + contentnode.name address on this
                        //  element.
                        TP.elementFlagChange(
                                ownerElem,
                                TP.SELF,
                                TP.UPDATE,
                                false);
                    }
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

                    return;
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

        return;
    }

    if (signalChange) {

        //  If it was a structural change, then we need to clear the path
        //  information registered for the addresses 'under' the node that
        //  changed.
        if (mutatedStructure) {
            this.updateRegistrationsBeforeSignaling(targetTPDoc);
        }

        //  If we 'created structure', that means that all of the previously
        //  executed paths need to be run, because they could now refer to new
        //  addresses.
        if (createdStructure) {
            if (TP.notEmpty(
                executedPaths = TP.core.AccessPath.$getExecutedPaths().at(
                                                    targetTPDoc.getID()))) {
                executedPaths.perform(
                        function(pathEntry) {
                            pathEntry.last().executeGet(target);
                        });
            }
        }

        //  Send the changed signal
        this.sendChangedSignal(target);

        if (mutatedStructure) {
            this.updateRegistrationsAfterSignaling(targetTPDoc);
        }

        //  Empty the changed addresses now that we've sent the signal.
        TP.core.AccessPath.$getChangedAddresses().empty();

        //  If the node wasn't originally configured to flag changes, then (now
        //  that we've registered all addresses that have changed) we need to
        //  strip it out.
        if (!leaveFlaggedChanges) {
            affectedElems.perform(
                    function(anElem) {
                        TP.elementStripChangeFlags(anElem);
                    });
        }
    }

    //  Make sure to put the 'shouldSignalDOMLoaded' flag back to it's prior
    //  setting before exiting.
    TP.sys.shouldSignalDOMLoaded(sigFlag);

    return this;
});

//  -----------------------------------------------------------------------

TP.core.XMLPath.Inst.defineMethod('finalizeSetValue',
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

TP.core.XMLPath.Inst.defineMethod('$$getContentForSetOperation',
function(aNode, flagChanges) {

    /**
     * @method $$getContentForSetOperation
     * @summary Creates any content that is required in order to perform a
     *     'set' operation.
     * @param {aNode} Node The node to use as the common ancestor to build out
     *     any content that is required for a 'set' operation.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged.
     * @returns {Array} The array of Nodes that got built.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.XMLPath.Inst.defineMethod('getPathType',
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

TP.core.XMLPath.Inst.defineMethod('getPathParts',
function() {

    /**
     * @method getPathParts
     * @summary Returns the receiver's parts.
     * @returns {Array} An Array of the receiver's parts.
     */

    return TP.getAccessPathParts(this.get('srcPath'), 'xpointer');
});

//  ------------------------------------------------------------------------

TP.core.XMLPath.Inst.defineMethod('$updateOpsBecomeDeleteInsertOps',
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

TP.core.XMLPath.Inst.defineMethod('valueIsStructural',
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
//  TP.core.SimpleXMLPath
//  ========================================================================

TP.core.XMLPath.defineSubtype('SimpleXMLPath');

//  ------------------------------------------------------------------------

TP.core.SimpleXMLPath.Inst.defineMethod('$$getContentForSetOperation',
function(aNode, flagChanges) {

    /**
     * @method $$getContentForSetOperation
     * @summary Creates any content that is required in order to perform a
     *     'set' operation.
     * @param {aNode} Node The node to use as the common ancestor to build out
     *     any content that is required for a 'set' operation.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged.
     * @returns {Array} The array of Nodes that got built.
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
//  TP.core.ElementPath
//  ========================================================================

TP.core.XMLPath.defineSubtype('ElementPath');

//  ------------------------------------------------------------------------

TP.core.ElementPath.Inst.defineMethod('$$getContentForSetOperation',
function(aNode, flagChanges) {

    /**
     * @method $$getContentForSetOperation
     * @summary Creates any content that is required in order to perform a
     *     'set' operation.
     * @param {aNode} Node The node to use as the common ancestor to build out
     *     any content that is required for a 'set' operation.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged.
     * @returns {Array} The array of Nodes that got built.
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
//  TP.core.XTensionPath
//  ========================================================================

TP.core.XMLPath.defineSubtype('XTensionPath');

//  ------------------------------------------------------------------------

TP.core.XTensionPath.Inst.defineMethod('$$getContentForSetOperation',
function(aNode, flagChanges) {

    /**
     * @method $$getContentForSetOperation
     * @summary Creates any content that is required in order to perform a
     *     'set' operation.
     * @param {aNode} Node The node to use as the common ancestor to build out
     *     any content that is required for a 'set' operation.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged.
     * @returns {Array} The array of Nodes that got built.
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
//  TP.core.CSSPath
//  ========================================================================

TP.core.XTensionPath.defineSubtype('CSSPath');

//  ------------------------------------------------------------------------

//  avoid binding and apply issues by creating our alias as a wrapper
TP.definePrimitive('cpc',
function(aPath, config) {

    /**
     * @method cpc
     * @summary Returns a newly initialized CSSPath instance.
     * @param {String} aPath The CSS path as a String.
     * @param {TP.core.Hash} config The configuration for this path.
     * @returns {TP.core.CSSPath} The new instance.
     */

    return TP.core.CSSPath.construct.apply(TP.core.CSSPath, arguments);
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.CSSPath.Inst.defineMethod('getPathType',
function() {

    /**
     * @method getPathType
     * @summary Returns the receiver's 'path type'.
     * @returns {String} A path type
     */

    return TP.CSS_PATH_TYPE;
});

//  ------------------------------------------------------------------------

TP.core.CSSPath.Inst.defineMethod('getPathParts',
function() {

    /**
     * @method getPathParts
     * @summary Returns the receiver's parts.
     * @returns {Array} An Array of the receiver's parts.
     */

    return TP.getAccessPathParts(this.get('srcPath'), 'css');
});

//  ========================================================================
//  TP.core.BarenamePath
//  ========================================================================

TP.core.XMLPath.defineSubtype('BarenamePath');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.BarenamePath.Inst.defineMethod('$$getContentForSetOperation',
function(aNode, flagChanges) {

    /**
     * @method $$getContentForSetOperation
     * @summary Creates any content that is required in order to perform a
     *     'set' operation.
     * @param {aNode} Node The node to use as the common ancestor to build out
     *     any content that is required for a 'set' operation.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged.
     * @returns {Array} The array of Nodes that got built.
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

TP.core.BarenamePath.Inst.defineMethod('getPathType',
function() {

    /**
     * @method getPathType
     * @summary Returns the receiver's 'path type'.
     * @returns {String} A path type
     */

    return TP.BARENAME_PATH_TYPE;
});

//  ========================================================================
//  XPath support
//  ========================================================================

//  ========================================================================
//  TP.extern.XPathFunctionResolver
//  ========================================================================

/*
Note that the setup for this type is handled dynamically during processing
of the getFunctionResolver method on TP.core.XPathPath.
*/

TP.extern.XPathFunctionResolver = function() {};

//  ========================================================================
//  TP.extern.XPathNamespaceResolver
//  ========================================================================

/*
Note that the setup for this type is handled dynamically during processing
of the getNSResolver method on TP.core.XPathPath.
*/

TP.extern.XPathNamespaceResolver = function() {};

//  ========================================================================
//  TP.extern.XPathVariableResolver
//  ========================================================================

/*
Note that the setup for this type is handled dynamically during processing
of the getVariableResolver method on TP.core.XPathPath.
*/

TP.extern.XPathVariableResolver = function() {};

//  ========================================================================
//  TP.core.XPathPath
//  ========================================================================

/**
 * @type {TP.core.XPathPath}
 */

//  ------------------------------------------------------------------------

TP.core.XMLPath.defineSubtype('XPathPath');

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
     * @returns {TP.core.XPathPath} The new instance.
     */

    return TP.core.XPathPath.construct.apply(TP.core.XPathPath, arguments);
});

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  This RegExp detects paths with either custom XPath variable references
//  in it ('$' followed by word characters) or custom XPath namespaced
//  functions in it (word characters followed by colon followed by word
//  characters followed by an opening parenthesis).
TP.core.XPathPath.Type.defineConstant('NON_NATIVE_PATH_REGEX',
                                TP.rc('\\$\\w+|\\w+:[\\w-]+\\('));

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.XPathPath.Type.defineAttribute('$tpParser');
TP.core.XPathPath.Type.defineAttribute('$nsResolver');
TP.core.XPathPath.Type.defineAttribute('$fnResolver');
TP.core.XPathPath.Type.defineAttribute('$varResolver');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.defineAttribute('isNative');

TP.core.XPathPath.Inst.defineAttribute('$origPath');
TP.core.XPathPath.Inst.defineAttribute('$tpPath');
TP.core.XPathPath.Inst.defineAttribute('$tpContext');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.XPathPath.Type.defineMethod('canonicalizePath',
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

TP.core.XPathPath.Type.defineMethod('getFunctionResolver',
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

TP.core.XPathPath.Type.defineMethod('getNSResolver',
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

TP.core.XPathPath.Type.defineMethod('getParser',
function() {

    /**
     * @method getParser
     * @summary Returns the receiver's non-native XPath parser instance.
     * @returns {TP.extern.XPathParser} A function resolver instance.
     */

    var parser;

    if (TP.notValid(parser = this.$get('$tpParser'))) {
        if (TP.notValid(TP.extern.XPathParser)) {
            //  NOTE the dependency here because TP.extern.XPathParser isn't
            //  a true TIBET type and has no load node information
            TP.sys.importScript(TP.sys.cfg('path.xpath_parser'));
        }

        parser = new TP.extern.XPathParser();
        this.$set('$tpParser', parser);
    }

    return parser;
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Type.defineMethod('getVariableResolver',
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

TP.core.XPathPath.Inst.defineMethod('init',
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
     * @returns {TP.core.XPathPath} The new instance.
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
        if (TP.isKindOf(config, TP.core.Hash)) {
            this.set('shouldCollapse',
                        config.atIfInvalid('shouldCollapse', true));
        } else {
            this.set('shouldCollapse', true);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.defineMethod('asReplacedString',
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

TP.core.XPathPath.Inst.defineMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    var str,
        val;

    str = 'TP.core.XPathPath.construct(\'' + this.get('$origPath') +
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

TP.core.XPathPath.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @method asString
     * @summary Returns the String representation of the receiver. For
     *     non-native paths this is the string representation of the parsed
     *     expression (which is canonicalized).
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.core.XPathPath's String representation. The default is
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

TP.core.XPathPath.Inst.defineMethod('$$createNodesForPath',
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
     * @returns {Array} The array of Nodes that got built.
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

TP.core.XPathPath.Inst.defineMethod('$createNonNativeParserContext',
function(aPath) {

    /**
     * @method $createNonNativeParserContext
     * @summary Sets up the context information for the non-native XPath
     *     parser for the receiver.
     * @param {String} aPath The XPath as a String. Defaults to the receiver's
     *     current path.
     * @returns {TP.core.XPathPath} The receiver.
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

TP.core.XPathPath.Inst.defineMethod('exec',
function(aTPNode, resultType, logErrors, flagChanges) {

    /**
     * @method exec
     * @summary 'Executes' the XPath by evaluating it against the supplied
     *     TP.core.Node.
     * @param {TP.core.Node} aTPNode The TP.core.Node to execute the receiver
     *     against.
     * @param {Number} resultType The type of result desired, either TP.NODESET
     *     or TP.FIRST_NODE.
     * @param {Boolean} logErrors Used to turn off error notification,
     *     particularly during operations such as String localization which can
     *     cause recusion issues.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged. Defaults to the value set by the TP.core.Node being
     *     processed.
     * @returns {Object} The result of evaluating the receiver against the
     *     supplied TP.core.Node. Will be one of: String, Number, Boolean or
     *     Array (of Nodes).
     */

    return this.execOnNative(
                    aTPNode.getNativeNode(),
                    resultType,
                    logErrors,
                    TP.ifInvalid(flagChanges, aTPNode.shouldFlagChanges()));
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.defineMethod('execOnNative',
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
     *     supplied TP.core.Node. Will be one of: String, Number, Boolean or
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
        //  TP.core.Node's evaluateXPath(), we'd likely recurse because we
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

TP.core.XPathPath.Inst.defineMethod('execRemove',
function(aTPNode, shouldSignal) {

    /**
     * @method execRemove
     * @summary Removes all nodes under the receiver which match the XPath
     *     provided. This method is typically called via remove when an XPath
     *     is provided as the attributeName.
     * @param {TP.core.Node} aTPNode The TP.core.Node to execute the receiver
     *     against.
     * @param {shouldSignal} Boolean If false, no signaling occurs. Defaults to
     *     targetObj.shouldSignalChange().
     * @returns {TP.core.XPathPath} The receiver.
     */

    var node,

        oldMakeStruct,
        results,

        targetTPDoc,
        signalChange,

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

    len = results.getSize();

    //  Found something, so now we have to remove it (and/or flag as needed)
    for (i = 0; i < len; i++) {
        node = results[i];

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
                this.changed('@' + node.name, TP.DELETE);
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
                TP.wrap(elem).changed('content', TP.DELETE);
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.defineMethod('$$getContentForSetOperation',
function(aNode, flagChanges) {

    /**
     * @method $$getContentForSetOperation
     * @summary Creates any content that is required in order to perform a
     *     'set' operation.
     * @param {aNode} Node The node to use as the common ancestor to build out
     *     any content that is required for a 'set' operation.
     * @param {Boolean} flagChanges True if any newly created nodes should be
     *     flagged.
     * @returns {Array} The array of Nodes that got built.
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
            newPath = this;
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

TP.core.XPathPath.Inst.defineMethod('getPathType',
function() {

    /**
     * @method getPathType
     * @summary Returns the receiver's 'path type'.
     * @returns {String} A path type
     */

    return TP.XPATH_PATH_TYPE;
});

//  ------------------------------------------------------------------------

TP.core.XPathPath.Inst.defineMethod('getShouldMakeStructures',
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

TP.core.XPathPath.Inst.defineMethod('getReferencedNodes',
function(aNode) {

    /**
     * @method getReferencedNodes
     * @summary Returns an Array of the Nodes that are referenced by this
     *     path, using aNode as the 'context node' (e.g. starting point).
     * @param {Node|TP.core.Node} aNode The Node to execute the receiver
     *     against.
     * @returns {Array} The array of TP.core.Nodes referenced by the receiver.
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

    //  Make sure to TP.unwrap() aNode - it might have been a TP.core.Node.
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

TP.core.XPathPath.Inst.defineMethod('getReferencedLocationPaths',
function() {

    /**
     * @method getReferencedLocationPaths
     * @summary Returns an Array of the location path Strings that are used by
     *     this path any place in its expression.
     * @returns {Array} An array of Strings that represent location paths
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

TP.core.XPathPath.Inst.defineMethod('$getReferencedLocationPathObjects',
function() {

    /**
     * @method $getReferencedLocationPathObjects
     * @summary Returns an Array of the location path objects that are used by
     *     this path any place in its expression.
     * @returns {Array} The array of PathExpr objects that represent location
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

TP.core.XPathPath.Inst.defineMethod('getReferencedLocationStepsAtPath',
function(aPathIndex) {

    /**
     * @method getReferencedLocationStepsAtPath
     * @summary Returns an Array of location steps that make up the location
     *     path at the index supplied.
     * @param {Number} aPathIndex The index of the location path to obtain the
     *     steps for. This will default to 0 if not supplied.
     * @returns {Array} An array of Strings that represent location steps
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

TP.core.XPathPath.Inst.defineMethod('isAbsolute',
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

TP.core.XPathPath.Inst.defineMethod('isNativePath',
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
            if (TP.core.XPathPath.NON_NATIVE_PATH_REGEX.test(path)) {
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

TP.core.XPathPath.Inst.defineMethod('setShouldMakeStructures',
function(shouldMakeStruct) {

    /**
     * @method setShouldMake
     * @summary Sets whether the receiver is currently configured to create
     *     Nodes as it is executed against a particular context node.
     * @param {shouldMakeStruct} Boolean the receiver should be configured to
     *     create nodes as it executes.
     * @returns {TP.core.XPathPath} The receiver.
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

TP.core.XPathPath.Inst.defineMethod('setPath',
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
     * @returns {TP.core.XPathPath} The receiver.
     */

    var pathType;

    if (TP.notValid(forceNative)) {
        //  based on whether it looks like a non-native path we'll either
        //  accept their input or ensure consistent processing
        if (TP.core.XPathPath.NON_NATIVE_PATH_REGEX.test(aPath)) {
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
    if (pathType === TP.core.XPathPath.NON_NATIVE_PATH) {
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
 *     here: https://github.com/dominicmarks/html4-dtd-json
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
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.w3.DTDInfo.Inst.defineAttribute(
        'elements',
        {value: TP.apc('element', TP.hc('shouldCollapse', true))});

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

        childElems;

    parentContentModels = this.get('elements').at(
                            parentElementName).at(
                            'contentModel').at(
                            'expanded');

    //  There could be more than one parent content model describing valid
    //  child elements. We must iterate through them all. They can take the
    //  form of an 'orGroup', 'andGroup' or 'sequenceGroup'.
    parentContentModels.perform(
        function(contentModel) {

            var groupElem;

            if (TP.isEmpty(groupElem = contentModel.at('orGroup'))) {
                if (TP.isEmpty(groupElem =
                                contentModel.at('sequenceGroup'))) {
                    groupElem = contentModel.at('andGroup');
                }
            }

            if (TP.isElement(groupElem) &&
                TP.isArray(childElems = groupElem.at('elements'))) {
                return TP.BREAK;
            }
        });

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
/* jshint ignore:start */
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
/* jshint ignore:end */

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
