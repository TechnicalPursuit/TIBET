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
 * @type {TP.xctrls.WayfinderSource}
 */

TP.lang.Object.defineSubtype('TP.xctrls.WayfinderSource');

TP.xctrls.WayfinderSource.addTraitTypes(TP.xctrls.WayfinderAPI);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  The maximum number of characters that will be allowed in content editor.
//  Content sizes greater than this will produce a read-only String viewer.
TP.xctrls.WayfinderSource.Type.defineConstant('MAX_EDITOR_CONTENT_SIZE',
                                                25000);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.WayfinderSource.Inst.defineAttribute('entries');
TP.xctrls.WayfinderSource.Inst.defineAttribute('wayfinderSourceName');

TP.xctrls.WayfinderSource.Inst.defineAttribute('additionalConfig');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.WayfinderSource.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.xctrls.WayfinderSource} The receiver.
     */

    this.callNextMethod();

    this.$set('entries', TP.hc(), false);
    this.$set('additionalConfig', TP.hc(), false);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.WayfinderSource.Inst.defineMethod('addEntry',
function(sourcePathParts, newSource) {

    /**
     * @method addEntry
     * @summary Adds a new source entry to the receiver.
     * @description This type of wayfinder source holds 1..n navigable sources.
     *     This method registers a new source using the supplied path.
     * @param {String[]} sourcePathParts The Array of Strings to register the
     *     supplied source under.
     * @param {Object} newSource The source object to register under the
     *     supplied path.
     * @returns {TP.xctrls.WayfinderSource} The receiver.
     */

    var pathParts,
        resolver,

        len,

        newEntryPathPart,

        i;

    /* eslint-disable consistent-this */

    if (TP.isString(sourcePathParts)) {
        pathParts = TP.ac(sourcePathParts);
    } else {
        pathParts = sourcePathParts;
    }

    resolver = this;

    len = pathParts.getSize();

    //  If we were handed more than 1 path part, then...
    if (len > 1) {

        //  Grab the last part - that will be the aspect we want to use to
        //  resolve the last object in the chain.
        newEntryPathPart = pathParts.last();

        //  Reset the path parts by slicing off the last item - this will get us
        //  all the way up to the last item.
        pathParts = pathParts.slice(0, -1);

        //  Loop over the remaining parts of the path. Try at each step to get a
        //  'resolver' for the next step in the path by getting whatever source
        //  object is there.
        len = pathParts.getSize();
        for (i = 0; i < len; i++) {

            //  Traverse down, performing a getEntryAt() at each step, which
            //  will return the next resolver.
            resolver = resolver.getEntryAt(pathParts.at(i));

            if (TP.notValid(resolver)) {
                //  TODO: Log a warning.
                return this;
            }
        }

        //  Now that we've found the source at the end, register it with the
        //  resolved object using the last part that we grabbed before the loop.
        resolver.addEntry(TP.ac(newEntryPathPart), newSource);
    } else {

        if (TP.isMutable(newSource) && TP.canInvoke(newSource, 'set')) {
            newSource.defineAttribute('wayfinderSourceName');
            //  Set the source's name to be the only item in the path parts.
            newSource.set('wayfinderSourceName', pathParts.first());
        }

        this.get('entries').atPut(pathParts.first(), newSource);
    }

    /* eslint-enable consistent-this */

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.WayfinderSource.Inst.defineMethod('canReuseContentForWayfinder',
function(options) {

    /**
     * @method canReuseContentForWayfinder
     * @summary Returns whether or not content hosted in a wayfinder bay can be
     *     'reused', even though the underlying data will change. If this
     *     returns true, then the underlying content needs to be able to respond
     *     to its data changing underneath it. It can leverage the TIBET data
     *     binding system to do this.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     check the content. This will have the following keys, amongst
     *     others:
     *          'targetObject':         The object being queried using the
     *                                  targetAspect to produce the object being
     *                                  displayed.
     *          'targetAspect':         The property of the target object
     *                                  currently being displayed.
     *          'pathParts':            The Array of parts that make up the
     *                                  currently selected path.
     *          'bayWayfinderItem':     The element that is representing the bay
     *                                  that is being queried for content reuse.
     *          'resolver':             The object currently being used to
     *                                  resolve object references for the
     *                                  supplied bay wayfinder item.
     *          TP.ATTR + '_childtype': The tag name of the content being put
     *                                  into the bay.
     * @returns {Boolean} Whether or not the current content can be reused even
     *     though the underlying data is changing.
     */

    var bayWayfinderItem,

        firstChildTPElem,

        bayContentElementName;

    //  Grab the TP.xctrls.wayfinderitem representing the bay. If there is none,
    //  we can't proceed because we can't test.
    bayWayfinderItem = options.at('bayWayfinderItem');
    if (TP.notValid(bayWayfinderItem)) {
        return false;
    }

    //  Grab the first child *element* under bay. If there is none, we can't
    //  proceed because we can't test.
    firstChildTPElem = bayWayfinderItem.getFirstChildElement();
    if (!TP.isValid(firstChildTPElem)) {
        return false;
    }

    //  Grab the element's full name. If it matches what the caller would be
    //  generated as it's 'child type' element, then we can reuse content.
    bayContentElementName = firstChildTPElem.getFullName();
    if (bayContentElementName === options.at('attr_childtype')) {
        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.xctrls.WayfinderSource.Inst.defineMethod('getConfigForWayfinder',
function(options) {

    /**
     * @method getConfigForWayfinder
     * @summary Returns the source's configuration data to configure the bay
     *     that the source's content will be hosted in.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the configuration data. This will have the following keys,
     *     amongst others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {TP.core.Hash} Configuration data used by the wayfinder for bay
     *     configuration. This could have the following keys, amongst others:
     *          TP.ATTR + '_childtype':   The tag name of the content being
     *                                      put into the bay
     *          TP.ATTR + '_class':         Any additional CSS classes to put
     *                                      onto the bay wayfinder item itself
     *                                      to adjust to the content being
     *                                      placed in it.
     */

    options.atPut(TP.ATTR + '_childtype', 'xctrls:list');

    return options.merge(this.get('additionalConfig'));
});

//  ------------------------------------------------------------------------

TP.xctrls.WayfinderSource.Inst.defineMethod('getContentForWayfinder',
function(options) {

    /**
     * @method getContentForWayfinder
     * @summary Returns the source's content that will be hosted in an wayfinder
     *     bay.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the content. This will have the following keys, amongst
     *     others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     *          'bindLoc':          The URI location where the data for the
     *                              content can be found.
     * @returns {Element} The Element that will be used as the content for the
     *     bay.
     */

    var dataURI,
        elem;

    dataURI = TP.uc(options.at('bindLoc'));

    elem = TP.elem(
            '<xctrls:list filter="true"' +
            ' alwayschange="true" itemtoggle="false"/>');

    TP.elementSetAttribute(
            elem, 'bind:in', '{data: ' + dataURI.asString() + '}', true);

    return elem;
});

//  ------------------------------------------------------------------------

TP.xctrls.WayfinderSource.Inst.defineMethod('getDataForWayfinder',
function(options) {

    /**
     * @method getDataForWayfinder
     * @summary Returns the source's data that will be supplied to the content
     *     hosted in an wayfinder bay. In most cases, this data will be bound to
     *     the content using TIBET data binding. Therefore, when this data
     *     changes, the content will be refreshed to reflect that.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the data. This will have the following keys, amongst others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     *          'bindLoc':          The URI location where the data for the
     *                              content can be found.
     * @returns {Object} The data that will be supplied to the content hosted in
     *     a bay.
     */

    var sourceEntries,
        data;

    //  This logic must produce values in its first slot that can then be
    //  resolved by 'resolveAspectForWayfinder' below.

    sourceEntries = this.get('entries');
    if (TP.isValid(sourceEntries)) {
        data = sourceEntries.collect(
                    function(kvPair) {
                        return TP.ac(
                                kvPair.first(),
                                this.getEntryLabel(kvPair.last()));
                    }.bind(this));
        data.sort(TP.sort.FIRST_ITEM);
    } else {
        data = TP.ac();
    }

    return data;
});

//  ------------------------------------------------------------------------

TP.xctrls.WayfinderSource.Inst.defineMethod('getEntryLabel',
function(anItem) {

    /**
     * @method getEntryLabel
     * @summary Returns the 'entry label' used in the receiver for the supplied
     *     Object in the receiver.
     * @param {Object} anItem The object to return the label for.
     * @returns {String} The label to be used for the supplied item.
     */

    var sourceName;

    if (TP.isNull(anItem)) {
        return 'null';
    }

    if (!TP.isDefined(anItem)) {
        return 'undefined';
    }

    if (TP.isString(anItem)) {
        return anItem;
    }

    //  Try to get the wayfinder label - it's faster here to just let this throw
    //  than test to see if the item responds to the method.
    try {
        return anItem.getXCtrlsWayfinderInspectorLabel();
    } catch (e) {
        void 0;
    }

    if (TP.isMethod(anItem)) {
        return anItem[TP.DISPLAY];
    }

    if (TP.isElement(anItem) || TP.isKindOf(anItem, TP.dom.ElementNode)) {
        return TP.name(anItem) + ' - #' + TP.lid(anItem);
    }

    sourceName = anItem.$get('wayfinderSourceName');
    if (TP.notEmpty(sourceName)) {
        return sourceName;
    }

    return TP.name(anItem);
});

//  ------------------------------------------------------------------------

TP.xctrls.WayfinderSource.Inst.defineMethod('getEntryAt',
function(aSourceName) {

    /**
     * @method getEntryAt
     * @summary Returns the 'entry' in the receiver for the supplied source
     *     name. This will be the singular name used to register the entry.
     * @param {String} aSourceName The name of the entry to retrieve.
     * @returns {Object} The entry object registered under the supplied source
     *     name in the receiver.
     */

    var srcName;

    //  Sometimes entries come in with escaped slashes. Unescape that.
    srcName = TP.stringUnescapeSlashes(aSourceName);

    return this.get('entries').at(srcName);
});

//  ------------------------------------------------------------------------

TP.xctrls.WayfinderSource.Inst.defineMethod('getResolverForWayfinder',
function(anAspect, options) {

    /**
     * @method getResolverForWayfinder
     * @summary Returns the object that is produced when resolving the aspect
     *     against the receiver. This type's method returns the source itself.
     * @param {String} anAspect The aspect to resolve against the receiver to
     *     produce the return value.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the configuration data. This will have the following keys,
     *     amongst others:
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {Object} The object produced when resolving the aspect against
     *     the receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.WayfinderSource.Inst.defineMethod('refreshContentForWayfinder',
function(options) {

    /**
     * @method refreshContentForWayfinder
     * @summary Refreshes content that already exists in a particular bay. This
     *     will only be called if 'canReuseContentForWayfinder' has returned
     *     true for the bay in question. This leverages the TIBET data binding
     *     system to change the data while reusing the bay content.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the data. This will have the following keys, amongst others:
     *          'targetObject':         The object being queried using the
     *                                  targetAspect to produce the object being
     *                                  displayed.
     *          'targetAspect':         The property of the target object
     *                                  currently being displayed.
     *          'pathParts':            The Array of parts that make up the
     *                                  currently selected path.
     *          'bindLoc':              The URI location where the data for the
     *                                  content can be found.
     *          'bayWayfinderItem':     The element that is representing the bay
     *                                  that is being queried for content reuse.
     *          TP.ATTR + '_childtype': The tag name of the content being put
     *                                  into the bay.
     * @returns {Object|null} The data that will be supplied to the content
     *     hosted in a bay.
     */

    var bayWayfinderItem,

        dataURI,
        firstChildTPElem;

    //  Grab the TP.xctrls.wayfinderitem representing the bay. If there is none,
    //  we can't proceed because we can't test.
    bayWayfinderItem = options.at('bayWayfinderItem');
    if (TP.notValid(bayWayfinderItem)) {
        return this;
    }

    dataURI = TP.uc(options.at('bindLoc'));

    //  Grab the first child *element* under bay. If there is none, we can't
    //  proceed because we can't test.
    firstChildTPElem = bayWayfinderItem.getFirstChildElement();
    if (!TP.isValid(firstChildTPElem)) {
        return this;
    }

    //  Set the 'bind:in' attribute to bind the elements 'data' aspect to the
    //  data URI.
    firstChildTPElem.setAttribute('bind:in',
                                    '{data: ' + dataURI.asString() + '}');

    //  Remove the attribute that would designate this bay as 'filler'.
    bayWayfinderItem.removeAttribute('filler');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.WayfinderSource.Inst.defineMethod('resolveAspectForWayfinder',
function(anAspect, options) {

    /**
     * @method resolveAspectForWayfinder
     * @summary Returns the object that is produced when resolving the aspect
     *     against the receiver.
     * @param {String} anAspect The aspect to resolve against the receiver to
     *     produce the return value.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the configuration data. This will have the following keys,
     *     amongst others:
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {Object} The object produced when resolving the aspect against
     *     the receiver.
     */

    return this.getEntryAt(anAspect);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
