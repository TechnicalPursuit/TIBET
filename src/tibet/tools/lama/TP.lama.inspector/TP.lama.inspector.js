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
//  TP.lama.InspectorSource
//  ========================================================================

/**
 * @type {TP.lama.InspectorSource}
 */

TP.lang.Object.defineSubtype('lama.InspectorSource');

TP.lama.InspectorSource.addTraits(TP.lama.ToolAPI);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  The maximum number of characters that will be allowed in content editor.
//  Content sizes greater than this will produce a read-only String viewer.
TP.lama.InspectorSource.Type.defineConstant('MAX_EDITOR_CONTENT_SIZE',
                                                25000);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.lama.InspectorSource.Inst.defineAttribute('entries');
TP.lama.InspectorSource.Inst.defineAttribute('lamaSourceName');

TP.lama.InspectorSource.Inst.defineAttribute('additionalConfig');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.InspectorSource.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.lama.InspectorSource} The receiver.
     */

    this.callNextMethod();

    this.$set('entries', TP.hc(), false);
    this.$set('additionalConfig', TP.hc(), false);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.InspectorSource.Inst.defineMethod('addEntry',
function(sourcePathParts, newSource) {

    /**
     * @method addEntry
     * @summary Adds a new source entry to the receiver.
     * @description This type of inspector source holds 1..n navigable sources.
     *     This method registers a new source using the supplied path.
     * @param {String[]} sourcePathParts The Array of Strings to register the
     *     supplied source under.
     * @param {Object} newSource The source object to register under the
     *     supplied path.
     * @returns {TP.lama.InspectorSource} The receiver.
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
            newSource.defineAttribute('lamaSourceName');
            //  Set the source's name to be the only item in the path parts.
            newSource.set('lamaSourceName', pathParts.first());
        }

        this.get('entries').atPut(pathParts.first(), newSource);
    }

    /* eslint-enable consistent-this */

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.InspectorSource.Inst.defineMethod('getConfigForInspector',
function(options) {

    /**
     * @method getConfigForInspector
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
     * @returns {TP.core.Hash} Configuration data used by the inspector for bay
     *     configuration. This could have the following keys, amongst others:
     *          TP.ATTR + '_childtype':   The tag name of the content being
     *                                      put into the bay
     *          TP.ATTR + '_class':         Any additional CSS classes to put
     *                                      onto the bay inspector item itself
     *                                      to adjust to the content being
     *                                      placed in it.
     */

    options.atPut(TP.ATTR + '_childtype', 'xctrls:list');

    return options.merge(this.get('additionalConfig'));
});

//  ------------------------------------------------------------------------

TP.lama.InspectorSource.Inst.defineMethod('getContentForInspector',
function(options) {

    /**
     * @method getContentForInspector
     * @summary Returns the source's content that will be hosted in an inspector
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

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem(
            '<xctrls:list bind:in="{data: ' +
            dataURI.asString() +
            '}" filter="true" alwayschange="true" itemtoggle="false"/>');
});

//  ------------------------------------------------------------------------

TP.lama.InspectorSource.Inst.defineMethod('getDataForInspector',
function(options) {

    /**
     * @method getDataForInspector
     * @summary Returns the source's data that will be supplied to the content
     *     hosted in an inspector bay. In most cases, this data will be bound to
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
    //  resolved by 'resolveAspectForInspector' below.

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

TP.lama.InspectorSource.Inst.defineMethod('getEntryLabel',
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

    //  Try to get the inspector label - it's faster here to just let this throw
    //  than test to see if the item responds to the method.
    try {
        return anItem.getLamaInspectorLabel();
    } catch (e) {
        void 0;
    }

    if (TP.isMethod(anItem)) {
        return anItem[TP.DISPLAY];
    }

    if (TP.isElement(anItem) || TP.isKindOf(anItem, TP.dom.ElementNode)) {
        return TP.name(anItem) + ' - #' + TP.lid(anItem);
    }

    sourceName = anItem.$get('lamaSourceName');
    if (TP.notEmpty(sourceName)) {
        return sourceName;
    }

    return TP.name(anItem);
});

//  ------------------------------------------------------------------------

TP.lama.InspectorSource.Inst.defineMethod('getEntryAt',
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

TP.lama.InspectorSource.Inst.defineMethod('resolveAspectForInspector',
function(anAspect, options) {

    /**
     * @method resolveAspectForInspector
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

//  ========================================================================
//  TP.lama.SingleEntryInspectorSource
//  ========================================================================

/**
 * @type {TP.lama.SingleEntryInspectorSource}
 */

TP.lama.InspectorSource.defineSubtype('SingleEntryInspectorSource');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.SingleEntryInspectorSource.Inst.defineMethod('getConfigForInspector',
function(options) {

    /**
     * @method getConfigForInspector
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
     * @returns {TP.core.Hash} Configuration data used by the inspector for bay
     *     configuration. This could have the following keys, amongst others:
     *          TP.ATTR + '_childtype':   The tag name of the content being
     *                                      put into the bay
     *          TP.ATTR + '_class':         Any additional CSS classes to put
     *                                      onto the bay inspector item itself
     *                                      to adjust to the content being
     *                                      placed in it.
     */

    options.atPut(TP.ATTR + '_childtype', 'html:div');

    return options.merge(this.get('additionalConfig'));
});

//  ------------------------------------------------------------------------

TP.lama.SingleEntryInspectorSource.Inst.defineMethod('getContentForInspector',
function(options) {

    /**
     * @method getContentForInspector
     * @summary Returns the source's content that will be hosted in an inspector
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

    var dataURI;

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.xhtmlnode(
            '<div class="cm-s-elegant scrollable wrapped noselect readonly"' +
                ' id="SingleEntrySource" bind:in="{value: ' +
                dataURI.asString() +
            '}"/>');
});

//  ------------------------------------------------------------------------

TP.lama.SingleEntryInspectorSource.Inst.defineMethod('getDataForInspector',
function(options) {

    /**
     * @method getDataForInspector
     * @summary Returns the source's data that will be supplied to the content
     *     hosted in an inspector bay. In most cases, this data will be bound to
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

    var targetObj,

        data;

    targetObj = this.getEntryAt('primary');

    data = TP.str(targetObj);
    if (data.getSize() < TP.lama.InspectorSource.MAX_EDITOR_CONTENT_SIZE) {
        if (TP.notEmpty(data)) {

            if (TP.canInvoke(data, 'as')) {
                data = data.as('TP.lama.pp');
            } else {
                data = TP.lama.pp.fromString(data);
            }
        }
    }

    return data;
});

//  ------------------------------------------------------------------------

TP.lama.SingleEntryInspectorSource.Inst.defineMethod('setPrimaryEntry',
function(aSourceObject) {

    /**
     * @method setPrimaryEntry
     * @summary Sets the receiver's 'primary entry to the supplied object.
     * @param {Object} aSourceObject The source object to register as the
     *     primary entry for the receiver.
     * @returns {TP.lama.SingleEntryInspectorSource} The receiver.
     */

    this.addEntry('primary', aSourceObject);

    return this;
});

//  ========================================================================
//  TP.lama.InspectorPathSource
//  ========================================================================

/**
 * @type {TP.lama.InspectorPathSource}
 */

TP.lama.InspectorSource.defineSubtype('lama.InspectorPathSource');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.lama.InspectorPathSource.Inst.defineAttribute('methodRegister');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.InspectorPathSource.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.lama.InspectorPathSource} The receiver.
     */

    this.callNextMethod();

    this.set('methodRegister', TP.hc());

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.InspectorPathSource.Inst.defineMethod('dispatchMethodForPath',
function(pathParts, methodPrefix, anArgArray) {

    /**
     * @method dispatchMethodForPath
     * @summary Dispatches the method that can be computed by using the supplied
     *     path parts and the method prefix along with any registered method
     *     suffixes.
     * @param {String[]} pathParts An Array of parts making up the path to
     *     attempt the dispatch against.
     * @param {String} methodPrefix The prefix of the method to use to try with
     *     the various registered suffixes to see if the receiver has a method
     *     named by that construct.
     * @param {arguments} anArgArray An array or arguments object containing the
     *     arguments to pass to the method invocation, if a method was found.
     * @returns {Object} The object produced when the method was invoked against
     *     the receiver.
     */

    var path,

        methodRegister,
        methodKeys,

        len,
        i,

        matcher,

        method;

    //  Join the path together with the PATH_SEP and then bookend it PATH_START
    //  and PATH_END. This will provide the most accurate match with the
    //  registered method matchers.
    path = TP.PATH_START + pathParts.join(TP.PATH_SEP) + TP.PATH_END;

    methodRegister = this.get('methodRegister');

    //  Grab the keys from the method register. These will be the method
    //  suffixes that were registered for lookup.
    methodKeys = methodRegister.getKeys();
    methodKeys.sort(
            function(key1, key2) {

                var len1,
                    len2;

                //  Each key points to an entry that has a RegExp in its first
                //  position and the length of the parts making up the RegExp.
                //  We want to sort that so that the most specific comes first.
                len1 = methodRegister.at(key1).last();
                len2 = methodRegister.at(key2).last();

                if (len1 > len2) {
                    return -1;
                }

                if (len1 < len2) {
                    return 1;
                }

                return 0;
            });

    //  Iterate over the entries, looking for a RegExp that matches the supplied
    //  method prefix with the registered suffix appended to it.
    len = methodKeys.getSize();
    for (i = 0; i < len; i++) {

        //  The RegExp is in the first position of the entry.
        matcher = methodRegister.at(methodKeys.at(i)).first();

        //  If we found a method, exit here. This is in keeping with trying to
        //  favor the 'most specific' RegExps first (per our sorting above).
        if (matcher.test(path)) {
            method = this[methodPrefix + methodKeys.at(i)];
            break;
        }
    }

    //  If we found a method, invoke it and return the result.
    if (TP.isMethod(method)) {
        return method.apply(this, anArgArray);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.lama.InspectorPathSource.Inst.defineMethod('getConfigForInspector',
function(options) {

    /**
     * @method getConfigForInspector
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
     * @returns {TP.core.Hash} Configuration data used by the inspector for bay
     *     configuration. This could have the following keys, amongst others:
     *          TP.ATTR + '_childtype':   The tag name of the content being
     *                                      put into the bay
     *          TP.ATTR + '_class':         Any additional CSS classes to put
     *                                      onto the bay inspector item itself
     *                                      to adjust to the content being
     *                                      placed in it.
     */

    return this.dispatchMethodForPath(options.at('pathParts'),
                                        'getConfigForInspectorFor',
                                        arguments);
});

//  ------------------------------------------------------------------------

TP.lama.InspectorPathSource.Inst.defineMethod('getContentForInspector',
function(options) {

    /**
     * @method getContentForInspector
     * @summary Returns the source's content that will be hosted in an inspector
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

    return this.dispatchMethodForPath(options.at('pathParts'),
                                        'getContentForInspectorFor',
                                        arguments);
});

//  ------------------------------------------------------------------------

TP.lama.InspectorPathSource.Inst.defineMethod('getChildTypeForCanvas',
function(options) {

    /**
     * @method getChildTypeForCanvas
     * @summary Returns the unique 'child type' used when inserting content
     *     modeled by the receiver into the current canvas.
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
     * @returns {String} The content type, which should be unique, that will
     *     inform the canvas of the type of data being inserted.
     */

    return this.dispatchMethodForPath(options.at('pathParts'),
                                        'getChildTypeForCanvasFor',
                                        arguments);
});

//  ------------------------------------------------------------------------

TP.lama.InspectorPathSource.Inst.defineMethod('getContentForToolbar',
function(options) {

    /**
     * @method getContentForToolbar
     * @summary Returns the source's content that will be hosted in an inspector
     *     toolbar.
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
     * @returns {Element} The Element that will be used as the content for the
     *     toolbar.
     */

    return this.dispatchMethodForPath(options.at('pathParts'),
                                        'getContentForToolbarFor',
                                        arguments);
});

//  ------------------------------------------------------------------------

TP.lama.InspectorPathSource.Inst.defineMethod('getDataForInspector',
function(options) {

    /**
     * @method getDataForInspector
     * @summary Returns the source's data that will be supplied to the content
     *     hosted in an inspector bay. In most cases, this data will be bound to
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

    return this.dispatchMethodForPath(options.at('pathParts'),
                                        'getDataForInspectorFor',
                                        arguments);
});

//  ------------------------------------------------------------------------

TP.lama.InspectorPathSource.Inst.defineMethod('registerMethodSuffixForPath',
function(methodSuffix, regExpParts) {

    /**
     * @method registerMethodSuffixForPath
     * @summary Registers a method suffix with the attendant parts that will be
     *     used to form a RegExp. The RegExp will be computed from the supplied
     *     parts and, when matched, will indicate that the supplied method
     *     suffix should be used to compute a method name.
     * @param {String} methodSuffix The suffix to register for matching.
     * @param {String[]} regExpParts The parts used to form the RegExp.
     * @returns {TP.lama.InspectorPathSource} The receiver.
     */

    //  Compute a RegExp from the path parts joined together with the path
    //  separator, looking for an exact match from start to end and register
    //  that, along with the number of parts, in the method register.
    this.get('methodRegister').atPut(
        methodSuffix,
        TP.ac(
            TP.rc(
                '^' +
                TP.PATH_START + regExpParts.join(TP.PATH_SEP) + TP.PATH_END +
                '$'),
            regExpParts.getSize()));

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.InspectorPathSource.Inst.defineMethod('resolveAspectForInspector',
function(anAspect, options) {

    /**
     * @method resolveAspectForInspector
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

    this.addEntry(anAspect, this);

    return this;
});

//  ========================================================================
//  TP.lama.Inspector
//  ========================================================================

/**
 * @type {TP.lama.inspector}
 */

//  ------------------------------------------------------------------------

TP.lama.TemplatedTag.defineSubtype('inspector');

//  The inspector itself is an inspector source for the 'root' entries.
TP.lama.inspector.addTraits(TP.lama.InspectorSource);

TP.lama.inspector.Inst.resolveTrait('init', TP.lama.TemplatedTag);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  Path aliases for use in the system
TP.lama.inspector.Type.defineConstant(
    'ALIASES', TP.hc(
        '_TYPES_', TP.ac('TIBET', 'Types')
    ));

//  Commonly used options
TP.lama.inspector.Type.defineConstant(
    'OPTIONS', TP.ac(
        TP.ATTR + '_childtype',
        TP.ATTR + '_class'
    ));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.lama.inspector.Type.defineMethod('buildPath',
function(varargs) {

    /**
     * @method buildPath
     * @summary Builds a path, using all of the arguments supplied to the
     *     method, by resolving each alias and then joining it all back together
     *     with TP.PATH_SEP.
     * @param {arguments} varargs 0 to N variable args to put together to form a
     *     path.
     * @returns {String} The path, with aliases resolved, joined together with
     *     TP.PATH_SEP.
     */

    var args,
        pathParts;

    args = TP.args(arguments);

    pathParts = this.resolvePathAliases(args);

    return pathParts.join(TP.PATH_SEP);
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Type.defineMethod('resolvePathAliases',
function(pathParts) {

    /**
     * @method resolvePathAliases
     * @summary Resolves aliases in each supplied path part.
     * @param {String[]} pathParts The Array of path parts to resolve aliases
     *     in.
     * @returns {String[]} The supplied path parts, with the aliases resolved.
     */

    var methodInfo,
        methodParts,
        methodName,

        isHandler,

        trackName,
        typeName,

        newPathParts,

        haloTarget,

        uriPath,

        aliases,

        i,
        pathPart;

    if (TP.isEmpty(pathParts)) {
        return pathParts;
    }

    if (pathParts.first() === '_METHOD_') {

        methodInfo = pathParts.last();
        methodParts = methodInfo.split('.');

        methodName = methodParts.last();

        isHandler = TP.regex.HANDLER_NAME.test(methodName);

        if (/Inst\./.test(methodInfo)) {
            if (isHandler) {
                trackName = 'Instance Handlers';
            } else {
                trackName = 'Instance Methods';
            }
            typeName = methodParts.slice(0, -2).join('.');
        } else if (/Type\./.test(methodInfo)) {
            if (isHandler) {
                trackName = 'Type Handlers';
            } else {
                trackName = 'Type Methods';
            }
            typeName = methodParts.slice(0, -2).join('.');
        } else {
            trackName = '';
            typeName = methodParts.slice(0, -1).join('.');
        }

        newPathParts = TP.ac('TIBET', 'Types', typeName, trackName, methodName);

    } else if (pathParts.first() === '_HALO_') {

        haloTarget = TP.byId('LamaHalo', TP.sys.getUIRoot()).get(
                                                        'currentTargetTPElem');
        if (TP.isValid(haloTarget)) {
            newPathParts = pathParts.slice(1);
            newPathParts.unshift(haloTarget.getID());
        }
    } else if (pathParts.first() === '_URIS_') {

        uriPath = TP.stringUnescapeSlashes(pathParts.at(1));

        newPathParts = TP.ac('TIBET', 'URIs', uriPath);
    } else {

        newPathParts = TP.ac();

        aliases = this.get('ALIASES');

        for (i = 0; i < pathParts.getSize(); i++) {

            pathPart = pathParts.at(i);

            if (aliases.hasKey(pathPart)) {
                newPathParts.push(aliases.at(pathPart));
            } else {
                newPathParts.push(pathPart);
            }
        }

        newPathParts = newPathParts.flatten();
    }

    return newPathParts;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineAttribute('$haloAddedTarget');
TP.lama.inspector.Inst.defineAttribute('$lastHaloTargetGID');

TP.lama.inspector.Inst.defineAttribute('dynamicContentEntries');

TP.lama.inspector.Inst.defineAttribute('selectedItems');

TP.lama.inspector.Inst.defineAttribute('pathStack');
TP.lama.inspector.Inst.defineAttribute('pathStackIndex');

TP.lama.inspector.Inst.defineAttribute('extraTargetInfo');

TP.lama.inspector.Inst.defineAttribute('container',
    TP.cpc('> .content', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('init',
function(aNode, aURI) {

    /**
     * @method init
     * @summary Returns a newly initialized instance.
     * @param {Node} aNode A native node.
     * @param {TP.uri.URI|String} aURI An optional URI from which the Node
     *     received its content.
     * @returns {TP.lama.inspector} The initialized instance.
     */

    this.callNextMethod();

    this.$set('entries', TP.hc(), false);
    this.$set('additionalConfig', TP.hc(), false);

    this.$set('pathStack', TP.ac(), false);
    this.$set('pathStackIndex', -1, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('addDynamicRoot',
function(target, forceRebuild) {

    /**
     * @method addDynamicRoot
     * @summary Adds a 'dynamic' root entry. That is, a root entry that can be
     *     added, renamed or removed at will.
     * @param {Object} target The target object to add as a dynamic root.
     * @param {Boolean} [forceRebuild=false] Whether or not to rebuild the
     *     receiver's root data.
     * @returns {TP.lama.inspector} The receiver.
     */

    //  TODO: Update root with label config - look for it in the current list.
    //  If it's there, we should highlight it. Otherwise, add to the 'recents'
    //  part of the list (a LIFO queue with a 'lama.inspector.recent_max'
    //  count).

    var dynamicEntries;

    dynamicEntries = this.get('dynamicContentEntries');

    //  If the halo currently added the target, then we don't have to modify the
    //  dynamic entries or refresh the root data entries, but we do have to flip
    //  this flag so that when the halo blurs this target, it doesn't remove it.
    if (this.get('$haloAddedTarget')) {
        this.set('$haloAddedTarget', false);
        return this;
    }

    //  Make sure that we don't already have the target in our list of dynamic
    //  entries.
    if (!dynamicEntries.contains(target, TP.IDENTITY)) {

        //  It wasn't found - add it and rebuild the root data.
        dynamicEntries.unshift(target);
        this.buildRootBayData();

    } else if (forceRebuild) {

        //  The caller wanted to force rebuild - do it.
        this.buildRootBayData();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('addBay',
function(bayContent, bayConfig) {

    /**
     * @method addBay
     * @summary Adds a bay to the receiver using the supplied content and
     *     configuration.
     * @param {Element} bayContent The element containing the content of the
     *     bay.
     * @param {TP.core.Hash} bayConfig The bay configuration. This could have
     *     the following keys, amongst others:
     *          TP.ATTR + '_childtype':   The tag name of the content being
     *                                      put into the bay
     *          TP.ATTR + '_class':         Any additional CSS classes to put
     *                                      onto the bay inspector item itself
     *                                      to adjust to the content being
     *                                      placed in it.
     * @returns {TP.lama.inspector} The receiver.
     */

    var id,
        childType,
        pathParts,
        bay;

    id = '';

    //  Start computing the unique ID by using the 'childType' (i.e. the type of
    //  control) if available.
    childType = bayConfig.at('attr_childtype');
    if (TP.notEmpty(childType)) {
        id += childType;
    }

    //  Then, if there are path parts, join them using '_' and append them to
    //  the id.
    pathParts = bayConfig.at('pathParts');
    if (TP.notEmpty(pathParts)) {
        id += '_' + pathParts.join('_');
    } else {
        //  Otherwise, this must be the ROOT list.
        id += '_' + 'ROOT';
    }

    //  Replace any invalid characters in the ID with '_'.
    TP.regex.INVALID_ID_CHARS.lastIndex = 0;
    id = id.replace(TP.regex.INVALID_ID_CHARS, '_');

    //  Create an inspectoritem element with that ID.
    bay = TP.tpelem('<lama:inspectoritem id="' + id + '"/>');

    //  NOTE: We use setRawContent() here to avoid compiling twice. The content
    //  will be processed when it, along with it's item, is added to the
    //  inspector's overall container.
    bay.setRawContent(TP.wrap(bayContent));

    //  Append the new inspector item to the container here. Content compilation
    //  will take place here.
    //  Note the reassignment here.
    bay = this.get('container').addContent(bay);

    //  Awaken the content here.
    bay.awaken();

    //  Configure the bay.
    this.configureBay(bay, bayConfig);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('buildRootBayData',
function() {

    /**
     * @method buildRootBayData
     * @summary Builds the root bay data.
     * @returns {TP.lama.inspector} The receiver.
     */

    var data,
        dataURI;

    data = this.getDataForInspector(TP.hc());

    dataURI = TP.uc('urn:tibet:lama_bay_0');
    dataURI.setResource(data);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('createHistoryEntry',
function(newPathParts) {

    /**
     * @method createHistoryEntry
     * @summary Creates a history entry for the receiver using the provided path
     *     parts.
     * @param {String[]} newPathParts The path parts used to create a history
     *     entry from.
     * @returns {TP.lama.inspector} The receiver.
     */

    var pathStack,
        pathStackIndex,
        historyPathParts;

    pathStack = this.get('pathStack');
    pathStackIndex = this.get('pathStackIndex');

    //  If the supplied index is somewhere in the current range of the entries
    //  that we're holding, then slice from the start through that index plus 1
    //  to create the new path stack. This clears everything "after" the
    //  supplied index.
    if (pathStackIndex < pathStack.getSize() - 1) {
        pathStack = pathStack.slice(0, pathStackIndex + 1);
        this.set('pathStack', pathStack);
    }

    //  See if the caller supplied specific path parts we should use for our
    //  history entry. If not, just use the currently selected path.
    historyPathParts = newPathParts;
    if (TP.isEmpty(historyPathParts)) {
        historyPathParts = TP.copy(this.get('selectedItems'));
    }

    pathStack.push(historyPathParts);
    this.set('pathStackIndex', pathStack.getSize() - 1);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('configureBay',
function(aBay, bayConfig) {

    /**
     * @method configureBay
     * @summary Configures the bay to accept a particular content using the
     *     configuration data provided.
     * @param {TP.lama.inspectorItem} aBay The bay element to configure.
     * @param {TP.core.Hash} bayConfig The bay configuration. This could have
     *     the following keys, amongst others:
     *          TP.ATTR + '_childtype':   The tag name of the content being
     *                                      put into the bay
     *          TP.ATTR + '_class':         Any additional CSS classes to put
     *                                      onto the bay inspector item itself
     *                                      to adjust to the content being
     *                                      placed in it.
     * @returns {TP.lama.inspector} The receiver.
     */

    var bayConfigKeys,
        commonOptions;

    bayConfigKeys = bayConfig.getKeys();

    //  Iterate over the common options and, if the key starts with 'TP.ATTR'
    //  and it's not in the config we're about to set, make sure that that value
    //  is removed from the bay's item element to give us a 'clean slate'.
    commonOptions = this.getType().OPTIONS;
    commonOptions.forEach(
            function(aKey) {

                //  Note here how we slice off 5 characters for the value of
                //  TP.ATTR.
                if (aKey.startsWith(TP.ATTR + '_') &&
                    bayConfigKeys.indexOf(aKey.slice(5)) === TP.NOT_FOUND) {
                    aBay.removeAttribute(aKey.slice(5));
                }
            });

    //  Iterate over the supplied configuration data and, if the key starts with
    //  'TP.ATTR', then use that key/value pair to set an attribute on the bay's
    //  item element.
    bayConfigKeys.forEach(
            function(aKey) {

                //  Note here how we slice off 5 characters for the value of
                //  TP.ATTR.
                if (aKey.startsWith(TP.ATTR + '_')) {
                    aBay.setAttribute(aKey.slice(5), bayConfig.at(aKey));
                }
            });

    aBay.set('config', bayConfig);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('emptyBay',
function(aBay) {

    /**
     * @method emptyBay
     * @summary Empties a bay in the receiver.
     * @param {TP.lama.inspectoritem} aBay The bay element to empty.
     * @returns {TP.lama.inspector} The receiver.
     */

    aBay.empty();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('emptyBaysAfter',
function(startBay) {

    /**
     * @method emptyBaysAfter
     * @summary Empties all of the bays that occur after the supplied bay.
     * @param {TP.lama.inspectoritem} startBay The bay element to begin
     *     emptying from. This bay itself will *not* be emptied.
     * @returns {TP.lama.inspector} The receiver.
     */

    var existingBays,

        startIndex,

        len,
        i;

    existingBays = TP.byCSSPath(' lama|inspectoritem', this);
    if (TP.isEmpty(existingBays)) {
        return this;
    }

    startIndex = existingBays.indexOf(startBay, TP.IDENTITY);

    len = existingBays.getSize();
    for (i = startIndex + 1; i < len; i++) {
        this.emptyBay(existingBays.at(i));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('finishUpdateAfterNavigation',
function(info) {

    /**
     * @method finishUpdateAfterNavigation
     * @summary Finishes updating the inspector, including the inspector target
     *     and toolbar. This also sizes and scrolls the inspector to the last
     *     bay.
     * @param {TP.core.Hash} info A hash containing the target object and aspect
     *     and the path parts.
     * @returns {TP.lama.inspector} The receiver.
     */

    var target,
        aspect,

        targetURI,

        selectedItems,
        params,

        toolbar,
        toolbarContent,

        inspectorBays;

    target = info.at('targetObject');
    aspect = info.at('targetAspect');

    //  Update the target value holder with the current target object.
    targetURI = TP.uc('urn:tibet:lama_inspector_target');
    if (targetURI !== TP.NO_RESULT) {
        targetURI.setResource(target, TP.request('signalChange', false));
    }

    (function() {
        //  Scroll them to the end
        this.scrollBaysToEnd();

        //  Update the toolbar (or clear it)

        selectedItems = this.get('selectedItems');
        params = TP.hc('targetAspect', aspect,
                        'targetObject', target,
                        'pathParts', selectedItems);

        toolbar = TP.byId('LamaToolbar', this.getNativeDocument());
        toolbarContent = TP.getContentForTool(
                            target,
                            'toolbar',
                            params);

        if (TP.isElement(toolbarContent)) {
            toolbarContent = toolbar.setContent(toolbarContent);
            toolbarContent.awaken();
        } else {
            toolbar.empty();
        }

        inspectorBays = TP.byCSSPath(' lama|inspectoritem', this);
        if (TP.notEmpty(inspectorBays)) {
            inspectorBays.last().focus();
        }
    }.bind(this)).queueAfterNextRepaint(this.getNativeWindow());

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('focusInspectorOnHome',
function() {

    /**
     * @method focusInspectorOnHome
     * @summary Focus the inspector on the 'home' target, which is when there is
     *     no target selected, the leftmost bay is showing the root content and
     *     there are no selected items.
     * @returns {TP.lama.inspector} The receiver.
     */

    var info;

    info = TP.hc('targetObject', this,
                    'targetAspect', this.getID(),
                    'bayIndex', 0);

    //  Note here how we pass false to avoid creating a history entry for this
    //  action.
    this.populateBayUsing(info, false);

    this.finishUpdateAfterNavigation(info);

    this.get('selectedItems').empty();

    this.signal('InspectorDidFocus');

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('focusUsingInfo',
function(anInfo) {

    /**
     * @method focusUsingInfo
     * @summary Focuses the receiver using the information provided in anInfo.
     * @param {TP.core.Hash} options A hash of data available to the receiver to
     *     focus. This will have the following keys, amongst others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object to be
     *                              focused.
     *          'targetAspect':     The property of the target object to be
     *                              focused.
     *          'targetPath':       A specific path to navigate the receiver to.
     *          'showBusy':         Whether or not show the 'busy' animation
     *                              while focusing.
     *          'extraTargetInfo':  Extra target information to pass along to
     *                              the focusing process.
     *          'addTargetAsRoot':  Whether or not to add the target object as a
     *                              'root' level entry in the receiver.
     * @returns {TP.lama.inspector} The receiver.
     */

    var currentBayIndex,

        domTarget,
        inspectorBay,
        inspectorBays,

        target,
        targetAspect,
        targetPath,

        initialSelectedItemValues,

        resolver,

        info,

        dynamicContentEntries,

        haloDidAddTarget,

        rootEntryResolver,
        rootBayItem,

        originalPathParts,
        pathParts,
        rootInfo,

        i,

        nextBay,

        historyPathParts;

    targetAspect = anInfo.at('targetAspect');
    target = anInfo.at('targetObject');
    targetPath = anInfo.at('targetPath');

    if (TP.notEmpty(targetPath)) {
        //  Convert '/'s to TP.PATH_SEP (but preserve backslashed '/'s)
        targetPath = TP.stringSplitSlashesAndRejoin(targetPath, TP.PATH_SEP);
    }

    //  Grab all of the inspector bays in the receiver.
    //  NB: inspectorBays could be empty here, and that's ok.
    inspectorBays = TP.byCSSPath(' lama|inspectoritem', this);

    //  Pass along any extra targeting information that editors or property
    //  panels would want by putting that onto one of our slots.
    this.set('extraTargetInfo', anInfo.at('extraTargetInfo'));

    initialSelectedItemValues = this.get('selectedItems');

    //  If the path is already selected, then we're already there - exit early.
    if (TP.notEmpty(initialSelectedItemValues) &&
        initialSelectedItemValues.join(TP.PATH_SEP) === targetPath) {
        return this;
    }

    //  Try to determine the current bay index.

    currentBayIndex = anInfo.at('bayIndex');
    domTarget = anInfo.at('domTarget');

    //  If one isn't provided, but a DOM target is, then try to compute one from
    //  there.
    if (!TP.isNumber(currentBayIndex) && TP.isNode(domTarget)) {

        inspectorBay = TP.nodeGetFirstAncestorByTagName(
                                domTarget, 'lama:inspectoritem');

        inspectorBay = TP.wrap(inspectorBay);

        currentBayIndex = inspectorBay.getBayIndex();
    }

    //  Try to determine the current target.

    //  If a valid target wasn't supplied, but we do have a current bay index,
    //  go to the inspector item located in that bay and obtain it's 'resolver'.
    if (TP.notValid(target) && TP.isNumber(currentBayIndex)) {

        inspectorBay = inspectorBays.at(currentBayIndex);
        resolver = inspectorBay.get('config').at('resolver');

        //  If we have a valid resolver, use it to compute the target from the
        //  target aspect.
        if (TP.isValid(resolver)) {
            target = TP.resolveAspectForTool(
                        resolver,
                        'inspector',
                        targetAspect,
                        TP.hc('pathParts',
                                this.get('selectedItems')));
        }

        if (target === TP.BREAK) {
            return this;
        }
    }

    info = TP.hc('targetObject', target, 'targetAspect', targetAspect);

    dynamicContentEntries = this.get('dynamicContentEntries');

    //  If the target is the inspector itself, build the root data, load up bay
    //  0 and return.
    if (target === this) {

        this.buildRootBayData();

        //  Populate bay 0
        info.atPut('bayIndex', 0);
        info.atPut('targetAspect', this.getID());

        this.populateBayUsing(info);

        this.finishUpdateAfterNavigation(info);

        this.signal('InspectorDidFocus');

        return this;
    }

    if (TP.isTrue(anInfo.at('addTargetAsRoot'))) {

        //  Add the target as a 'dynamic root' (if it's not already there).
        this.addDynamicRoot(target);

        this.selectItemInBay(this.getEntryLabel(target), 0);

        info.atPut('bayIndex', 1);

        //  Select the item (in bay 0) and populate bay 1
        this.populateBayUsing(info);

        //  Now that we have more inspector items, obtain the list again.
        inspectorBays = TP.byCSSPath(' lama|inspectoritem', this);

    } else if (TP.isValid(target) && TP.isValid(resolver)) {

        //  No target object was supplied, but the current bay had a resolver
        //  that it resolved the target aspect against to get the target object.

        if (TP.isNumber(currentBayIndex)) {
            info.atPut('bayIndex', currentBayIndex + 1);
        }

        info.atPut('targetObject', target);

        this.populateBayUsing(info);

        this.finishUpdateAfterNavigation(info);

        this.signal('InspectorDidFocus');

        return this;
    } else if (TP.isValid(target) && TP.isEmpty(targetPath)) {

        //  We're not going to add as dynamic root, but try to traverse to
        //  instead.

        //  First, see if the target can produce a path that we can try.
        originalPathParts = TP.getPathPartsForTool(
                                target,
                                'Inspector',
                                TP.hc('pathParts',
                                        this.get('selectedItems')));

        if (TP.isEmpty(originalPathParts)) {
            //  TODO: Raise an exception
            return this;
        }

        //  If any of these path parts returned an alias, look it up here.
        pathParts = this.getType().resolvePathAliases(originalPathParts);

        if (TP.isEmpty(pathParts)) {
            //  TODO: Raise an exception
            return this;
        }

        //  Compute the root resolver

        //  First, try the dynamic entries

        //  See if we've already got the root resolver as a current dynamic
        //  root.
        rootEntryResolver = dynamicContentEntries.detect(
                            function(anItem) {
                                return TP.id(anItem) === pathParts.first();
                            });

        if (TP.notValid(rootEntryResolver)) {
            rootEntryResolver = this.getEntryAt(pathParts.first());
        }

        //  If we got a valid root resolver entry
        if (TP.isValid(rootEntryResolver)) {

            //  Reset the target to the resolver - we've gotten the path to it
            //  now, so we need to start from the root resolved object
            target = rootEntryResolver;

            rootBayItem = pathParts.shift();
            targetPath = pathParts.join(TP.PATH_SEP);

            if (dynamicContentEntries.contains(target, TP.IDENTITY)) {
                this.selectItemInBay(TP.id(target), 0);
            } else {
                this.selectItemInBay(this.getEntryLabel(target), 0);
            }

            //  Select the item (in bay 0) and populate bay 1
            rootInfo = TP.hc('bayIndex', 1,
                                'targetAspect', rootBayItem,
                                'targetObject', target);
            this.populateBayUsing(rootInfo);

            //  If there were no more segments to the path, then just exit here.
            if (TP.isEmpty(targetPath)) {
                return this;
            }

            info.atPut('targetPath', targetPath);

            //  We computed a target path and navigated the first bay. We need
            //  to reset the target aspect to be the first item of the remaining
            //  path
            info.atPut('targetAspect', targetPath.first());

            info.atPut('bayIndex', 2);

            //  Now that we have more inspector items, obtain the list again.
            inspectorBays = TP.byCSSPath(' lama|inspectoritem', this);

        } else {
            //  No root resolver - can't go any further
            return this;
        }
    } else if (TP.notValid(target) && TP.notEmpty(targetPath)) {

        pathParts = targetPath.split(TP.PATH_SEP);

        //  If any of these path parts returned an alias, look it up here.
        pathParts = this.getType().resolvePathAliases(pathParts);

        //  Compute the target

        //  First, try the static entries
        target = this.getEntryAt(pathParts.first());

        //  If a target couldn't be found, try the dynamic entries
        if (TP.notValid(target)) {

            //  See if we've already got the target as a current dynamic root.
            target = dynamicContentEntries.detect(
                            function(anItem) {
                                return TP.id(anItem) === pathParts.first();
                            });
        }

        //  If not, see if we can find the target somewhere in the system.
        //  Because the 'path' that gets bookmarked when a dynamic root is
        //  bookmarked is the target's global ID, we can use TP.bySystemId() to
        //  see if the target can be found somewhere in the system.

        if (TP.notValid(target)) {
            target = TP.bySystemId(pathParts.first());

            //  If we found a valid target, add it as a dynamic root. It is now
            //  available for the rest of the session.
            if (TP.isValid(target)) {

                //  For now, we flip this flag to false since if there's another
                //  object that has been halo'ed on and the halo has added that
                //  reference to the root bays, the call to 'addDynamicRoot'
                //  will flip this flag false and just return - which is
                //  definitely not what we want.
                haloDidAddTarget = this.get('$haloAddedTarget');
                this.set('$haloAddedTarget', false);

                this.addDynamicRoot(target);

                this.set('$haloAddedTarget', haloDidAddTarget);
            }
        }

        //  If we got a valid target
        if (TP.isValid(target)) {

            rootBayItem = pathParts.shift();

            if (dynamicContentEntries.contains(target, TP.IDENTITY)) {
                this.selectItemInBay(TP.id(target), 0);
            } else {
                this.selectItemInBay(this.getEntryLabel(target), 0);
            }

            //  Select the item (in bay 0) and populate bay 1
            rootInfo = TP.hc('bayIndex', 1,
                                'targetAspect', rootBayItem,
                                'targetObject', target);
            this.populateBayUsing(rootInfo, false);

            info.atPut('bayIndex', 2);

            //  Now that we have more inspector items, obtain the list again.
            inspectorBays = TP.byCSSPath(' lama|inspectoritem', this);

        } else {

            //  Get the root resolver
            rootEntryResolver = this.getEntryAt(pathParts.first());

            //  If we got a valid root resolver entry
            if (TP.isValid(rootEntryResolver)) {

                //  Reset the target to the resolver - we've gotten the path to
                //  it now, so we need to start from the root resolved object
                target = rootEntryResolver;

                rootBayItem = pathParts.shift();
                targetPath = pathParts.join(TP.PATH_SEP);

                this.selectItemInBay(rootBayItem, 0);

                //  Select the item (in bay 0) and populate bay 1
                rootInfo = TP.hc('bayIndex', 1,
                                    'targetAspect', rootBayItem,
                                    'targetObject', target);
                this.populateBayUsing(rootInfo, false);

                info.atPut('bayIndex', 2);

                //  Now that we have more inspector items, obtain the list again.
                inspectorBays = TP.byCSSPath(' lama|inspectoritem', this);
            }
        }
    }

    if (TP.notEmpty(targetPath)) {

        if (TP.isEmpty(pathParts)) {
            pathParts = targetPath.split(TP.PATH_SEP);
        }

        //  If the first path part is '__TARGET__', then we compute a path to
        //  the target object and replace that entry with it.
        if (pathParts.first() === '__TARGET__') {

            originalPathParts = TP.getPathPartsForTool(
                                target,
                                'Inspector',
                                TP.hc('pathParts',
                                        this.get('selectedItems')));

            //  Replace the entry by slicing off the '__TARGET__' entry and
            //  appending that to the computed path parts.
            pathParts = originalPathParts.concat(pathParts.slice(1));

            //  If any of these path parts returned an alias, look it up here.
            pathParts = this.getType().resolvePathAliases(pathParts);

            rootBayItem = pathParts.shift();

            if (dynamicContentEntries.contains(target, TP.IDENTITY)) {
                this.selectItemInBay(TP.id(target), 0);
                rootEntryResolver = target;
            } else {
                this.selectItemInBay(rootBayItem, 0);
                rootEntryResolver = this.getEntryAt(rootBayItem);
            }

            //  Select the item (in bay 0) and populate bay 1
            rootInfo = TP.hc('bayIndex', 1,
                                'targetAspect', rootBayItem,
                                'targetObject', rootEntryResolver);
            this.populateBayUsing(rootInfo, false);

            //  Now that we have more inspector items, obtain the list again.
            inspectorBays = TP.byCSSPath(' lama|inspectoritem', this);
        } else {
            //  If any of these path parts returned an alias, look it up here.
            pathParts = this.getType().resolvePathAliases(pathParts);
        }

        for (i = 0; i < pathParts.getSize(); i++) {

            //  If we have a valid bay at a spot one more than the path
            //  segment that we're processing for, then grab its resolver and
            //  try to traverse that segment.
            nextBay = inspectorBays.at(i + 1);

            if (TP.isValid(nextBay)) {
                resolver = nextBay.get('config').at('resolver');

                targetAspect = pathParts.at(i);

                //  Resolve the targetAspect to a target object
                target = TP.resolveAspectForTool(
                                resolver,
                                'inspector',
                                targetAspect,
                                TP.hc('pathParts',
                                        this.get('selectedItems')));

                if (TP.notValid(target)) {
                    break;
                }

                //  Select the item named. Note that targetAspect could be a
                //  RegExp here and it's up to the control to do the right thing
                //  with that.
                this.selectItemInBay(targetAspect, i + 1);

                //  If targetAspect is a RegExp, then we can't use that as the
                //  final value for selection - go to the control that's
                //  embedded in the inspector item at i + 1 and get it's
                //  currentValue to use as the targetAspect.
                if (TP.isRegExp(targetAspect)) {
                    targetAspect = this.getInspectorBayContentItem(
                                                i + 1).get('value');
                }

                //  If we got original path parts above (which might be
                //  aliased), those are the ones that we want to pass along for
                //  history purposes here. If it's empty, then just use the path
                //  parts that we computed (prepended by the rootBayItem, if we
                //  have one).
                if (TP.notEmpty(originalPathParts)) {
                    historyPathParts = originalPathParts;
                } else {
                    historyPathParts = pathParts.slice(0, i + 1);
                    if (TP.notEmpty(rootBayItem)) {
                        historyPathParts.unshift(rootBayItem);
                    }
                }

                info = TP.hc('targetObject', target,
                                'targetAspect', targetAspect,
                                'bayIndex', i + 2,
                                'historyPathParts', historyPathParts);

                //  Only create a history entry if we're processing the last
                //  item in the path.
                if (i < pathParts.getSize() - 1) {
                    this.populateBayUsing(info, false);
                } else {
                    this.populateBayUsing(info);
                }

                //  Now that we have more inspector items, obtain the list
                //  again.
                inspectorBays = TP.byCSSPath(' lama|inspectoritem', this);
            }
        }
    } else {

        if (TP.isValid(info.at('targetObject'))) {
            if (TP.isNumber(currentBayIndex)) {
                info.atPut('bayIndex', currentBayIndex + 1);
            }

            this.populateBayUsing(info);
        }
    }

    //  If there was no computed target and no target path, then we have an
    //  uninspectable object on our hands. Redirect to ourself (by setting the
    //  targetObject to be ourself), but with a target aspect of TP.NOT_FOUND.
    //  This will trigger the config, content, etc. methods on ourself to return
    //  config and content suitable for an uninspectable object. Note how we
    //  supply an alternate 'selectedAspect' here (set to be the original
    //  aspect). This allows controls that rely on the selectedItems property to
    //  still gain access to the original aspect, while we signal to the rest of
    //  the inspector machinery that we have an uninspectable object.
    if (TP.notValid(target) && TP.isEmpty(targetPath)) {
        info = TP.hc('targetObject', this,
                        'targetAspect', TP.NOT_FOUND,
                        'bayIndex', currentBayIndex + 1,
                        'selectedAspect', targetAspect);

        //  Note here how we pass false to avoid creating a history entry for
        //  this action.
        this.populateBayUsing(info, false);
    }

    //  Note here how we use the last populated 'info' object
    this.finishUpdateAfterNavigation(info);

    this.signal('InspectorDidFocus');

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('getBayFromSlotPosition',
function(aSlotPosition) {

    /**
     * @method getBayFromSlotPosition
     * @summary Returns the bay from the supplied 'slot' position.
     * @description Because bays can take more than 1 'slot' in the inspector
     *     (i.e. they can be 'double wide' and take up 2 slots), there needs to
     *     be a way to translate between bays and slot numbers.
     * @param {Number} aSlotPosition The slot position to return the bay for.
     * @returns {TP.lama.inspectoritem} The bay occupying the supplied slot
     *     position.
     */

    var inspectorBays,
        currentSlotCount,

        len,
        i;

    if (!TP.isNumber(aSlotPosition)) {
        return null;
    }

    inspectorBays = TP.byCSSPath(' lama|inspectoritem', this);
    if (TP.isEmpty(inspectorBays)) {
        return null;
    }

    if (aSlotPosition === 0) {
        return inspectorBays.first();
    }

    //  Grab the first bay 'multiplier'.
    currentSlotCount = inspectorBays.first().getBayMultiplier();

    //  Iterate over the remaining bays, summing up the bay 'multiplier's across
    //  them.
    len = inspectorBays.getSize();
    for (i = 1; i < len; i++) {
        currentSlotCount += inspectorBays.at(i).getBayMultiplier();

        //  If we're at a bay where we're more than the slot position (the bay
        //  numbers are 0-based, but the count is 1-based), then return that
        //  bay.
        if (currentSlotCount > aSlotPosition) {
            return inspectorBays.at(i);
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('getBayNumForPathParts',
function(pathParts) {

    /**
     * @method getBayNumForPathParts
     * @summary Returns the number of the bay that the supplied path is
     *     currently loaded into.
     * @param {String[]} pathParts The Array of path parts to use to obtain the
     *     content item.
     * @returns {Number} The number of the bay that the path is loaded into.
     */

    var matcher,
        currentPathParts,
        currentPath,

        bayNum;

    //  Compute a RegExp from the path parts joined together with the path
    //  separator, looking for an exact match from start to end.
    matcher = TP.rc('^' +
                    TP.PATH_START + pathParts.join(TP.PATH_SEP) + TP.PATH_END +
                    '$');

    //  Grab the set of currently selected labels and copy them.
    currentPathParts = TP.copy(this.getSelectedLabels());

    while (!currentPathParts.isEmpty()) {
        //  Start with the most specific path.

        //  Join the path together with the PATH_SEP and then bookend it
        //  PATH_START and PATH_END. This will provide the most accurate match
        //  with the registered method matchers.
        currentPath = TP.PATH_START +
                        currentPathParts.join(TP.PATH_SEP) +
                        TP.PATH_END;

        //  Test that path against the RegExp computed from the supplied path
        //  parts. If it matches, then return the bay number as computed from
        //  the size of the current path parts. Note that this is a '1-index'
        //  Number by design.
        if (matcher.test(currentPath)) {
            bayNum = currentPathParts.getSize();
            return bayNum;
        }

        //  Didn't match the path. Pop an entry off of the end and try again
        //  with the next most specific path.
        currentPathParts.pop();
    }

    return TP.NOT_FOUND;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('getCurrentHistoryEntryAsPath',
function() {

    /**
     * @method getCurrentHistoryEntryAsPath
     * @summary Returns the current history entry as a path, doing whatever
     *     substitutions or escaping is necessary.
     * @returns {String} The current history entry as a path.
     */
    var currentHistoryEntry,

        pathParts,

        len,
        i,

        str;

    //  Grab the current history entry as computed by the Lama Inspector.
    currentHistoryEntry = this.get('currentHistoryEntry');

    if (TP.isEmpty(currentHistoryEntry)) {
        return '';
    }

    pathParts = TP.ac();

    //  Iterate over each piece of the current history entry.
    len = currentHistoryEntry.getSize();
    for (i = 0; i < len; i++) {

        //  If the current piece is 'TIBET', then a special 'resolved' value
        //  might be in the next part of the entry.
        if (currentHistoryEntry.at(i) === 'TIBET') {

            //  If the next piece is 'URIs', then push '_URIS_' (the original
            //  value alias for URIs) and increment by 1, thereby basically
            //  skipping the original 'TIBET' entry. Continue on to avoid
            //  pushing any more parts.
            if (currentHistoryEntry.at(i + 1) === 'URIs') {
                pathParts.push('_URIS_');
                i++;
                continue;
            }
        }

        //  Push the part, but replace slashes with an escaped slash first.
        pathParts.push(currentHistoryEntry.at(i).replace(/\//g, '\\/'));
    }

    //  Join them together with a slash
    str = pathParts.join('/');

    return str;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('getCurrentPropertyValueForTool',
function(propertyName, toolName) {

    /**
     * @method getCurrentPropertyValueForTool
     * @summary Returns the value of the named property for the named tool.
     * @param {String} propertyName The name of the property to return the value
     *     for.
     * @param {String} toolName The name of the tool to return the property
     *     value for.
     * @returns {Object} The current property value for the named property and
     *     tool.
     */

    var currentResolver,

        params,

        methodName,
        result;

    //  Grab the current resolver. If there is none, then just exit and return
    //  null.
    currentResolver = this.getCurrentResolver();
    if (TP.notValid(currentResolver)) {
        return null;
    }

    //  Construct a 'pathParts' by using our currently selected items.
    params = TP.hc('pathParts', this.get('selectedItems'));

    //  Compute a method name for the 'TP' object that will attempt to retrieve
    //  the named property value.
    methodName = 'get' + propertyName.asTitleCase() + 'ForTool';
    result = TP[methodName](currentResolver, toolName, params);

    return result;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('getCurrentResolver',
function() {

    /**
     * @method getCurrentResolver
     * @summary Returns the resolver object of the currently selected bay.
     * @returns {Object} The resolver object of the current bay.
     */

    var inspectorBays,

        lastResolver;

    inspectorBays = TP.byCSSPath(' lama|inspectoritem', this);
    if (TP.isEmpty(inspectorBays)) {
        return null;
    }

    //  Grab the 'resolver' for the last inspector bay. This is the object that
    //  will be messaged to get the data.
    lastResolver = inspectorBays.last().get('config').at('resolver');
    if (TP.notValid(lastResolver)) {
        return null;
    }

    return lastResolver;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('getInspectorBayContentItem',
function(aBayNum) {

    /**
     * @method getInspectorBayContentItem
     * @summary Retrieves the content item under the bay at the supplied bay
     *     number.
     * @param {Number} [aBayNum] The bay number to retrieve the content for. If
     *     this is not supplied, the "last" bay's content is retrieved.
     * @returns {TP.dom.ElementNode} The content element under the inspector
     *     item representing the bay at the supplied bay number.
     */

    var inspectorBayContentItems,
        bayNum;

    if (TP.notEmpty(inspectorBayContentItems =
                    TP.byCSSPath(' lama|inspectoritem > *', this))) {

        bayNum = aBayNum;
        if (!TP.isNumber(bayNum)) {
            bayNum = inspectorBayContentItems.getSize() - 1;
        }

        return inspectorBayContentItems.at(bayNum);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('getSelectedLabels',
function() {

    /**
     * @method getSelectedLabels
     * @summary Returns the labels for the set of currently selected items. Note
     *     that the aspects which represent the selected items are not
     *     necessarily the labels that are being shown to the user. This method
     *     traverses those items and converts them into labels.
     * @returns {String[]} The list of labels representing the currently
     *     selected items.
     */

    var selectedItems,
        resolver,

        result,

        len,
        i;

    selectedItems = this.get('selectedItems');

    /* eslint-disable consistent-this */
    resolver = this;
    /* eslint-enable consistent-this */

    result = TP.ac();

    len = selectedItems.getSize();
    for (i = 0; i < len; i++) {

        //  Query the resolver for the label for the item.
        result.push(resolver.getEntryLabel(selectedItems.at(i)));

        //  Traverse down, performing a getEntryAt() at each step, which
        //  will return the next resolver.
        resolver = resolver.getEntryAt(selectedItems.at(i));

        //  If we couldn't compute a 'next resolver' and we're not at the end,
        //  then exit from the loop. Can't query a missing resolver.

        /* eslint-disable no-extra-parens */
        if (TP.notValid(resolver) && (i < len - 1)) {
            //  TODO: Log a warning.
            break;
        }
        /* eslint-enable no-extra-parens */
    }

    //  Sometimes entry labels contain backslashed slashes because they're
    //  created from entries that are also used in the data to navigate the
    //  inspector. That's unnecessary for labels, though, so remove them.
    result = result.collect(
                function(aLabel) {
                    return TP.stringUnescapeSlashes(aLabel);
                });

    return result;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineHandler('BreadcrumbSelected',
function(aSignal) {

    /**
     * @method handleBreadcrumbSelected
     * @summary Handles notifications of when an item in the inspector
     *     breadcrumb has been selected.
     * @param {TP.sig.BreadcrumbSelected} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.inspector} The receiver.
     */

    var items;

    //  The breadcrumb puts it's path into an Array of items in the signal when
    //  it triggers the signal.
    items = aSignal.at('items');

    if (TP.notEmpty(items)) {
        this.traversePath(items);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineHandler('PclassClosedChange',
function(aSignal) {

    /**
     * @method handlePclassClosedChangeFromLamaHUD
     * @summary Handles notifications of HUD closed change signals.
     * @param {TP.sig.PclassClosedChange} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.inspector} The receiver.
     */

    var hudIsClosed;

    //  Grab the HUD and see if it's currently open or closed.
    hudIsClosed = TP.bc(aSignal.getOrigin().getAttribute('closed'));

    if (hudIsClosed) {
        this.toggleObservations(false);
    } else {
        this.toggleObservations(true);
    }

    return this;
}, {
    origin: 'LamaHUD'
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineHandler('DOMResize',
function(aSignal) {

    /**
     * @method handleDOMResize
     * @summary Handles notifications of when the document containing the
     *     receiver or one of its elements resizes.
     * @param {TP.sig.DOMResize} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.inspector} The receiver.
     */

    //  Make sure to update the scroll buttons :-).
    this.updateScrollButtons();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineHandler('FocusInspectorForEditing',
function(aSignal) {

    /**
     * @method handleFocusInspectorForEditing
     * @summary Handles notifications of when the inspector should be focused to
     *     edit an object.
     * @param {TP.sig.FocusInspectorForEditing} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.inspector} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineHandler('FocusInspectorForBrowsing',
function(aSignal) {

    /**
     * @method handleFocusInspectorForBrowsing
     * @summary Handles notifications of when the inspector should be focused to
     *     browser an object.
     * @param {TP.sig.FocusInspectorForBrowsing} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.inspector} The receiver.
     */

    var payload,

        showBusy;

    //  Grab the payload and see if it has a 'showBusy' flag set to true. If so,
    //  then show the inspector's 'busy' panel before beginning the focusing
    //  process.
    payload = aSignal.getPayload();

    showBusy = payload.at('showBusy');
    if (TP.isTrue(showBusy)) {

        this.displayBusy();

        //  NB: We put this in a call to refresh after the next repaint so that
        //  the busy panel has a chance to show before proceeding with the
        //  focusing process.
        (function() {
            this.focusUsingInfo(payload);

            this.hideBusy();
        }.bind(this)).queueAfterNextRepaint(this.getNativeWindow());

    } else {
        this.focusUsingInfo(payload);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineHandler('HaloDidBlur',
function(aSignal) {

    /**
     * @method handleHaloDidBlur
     * @summary Handles notifications of when the halo blurs on an object.
     * @param {TP.sig.HaloDidBlur} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.inspector} The receiver.
     */

    var halo,

        haloTarget,
        haloTargetID,

        firstSelectedValue,

        dynamicEntries,
        dynamicEntriesIds,

        targetIndex,

        content,
        selection;

    //  If the halo is just recasting the current element, then we do nothing
    //  here.
    halo = TP.wrap(aSignal.getOrigin());
    if (halo.get('$isRecasting')) {
        return this;
    }

    //  Grab the halo target and remove any local versions of methods that the
    //  inspector will use that we would have installed when we focused the
    //  halo.

    haloTarget = aSignal.at('haloTarget');

    if (TP.owns(haloTarget, 'getLamaInspectorLabel')) {
        delete haloTarget.getLamaInspectorLabel;
    }

    if (TP.owns(haloTarget, 'getEntryLabel')) {
        delete haloTarget.getEntryLabel;
    }

    haloTargetID = TP.id(haloTarget);

    //  If the first currently selected item is the ID of the halo then it was
    //  selected and we need to focus on 'home', thereby clearing all of the
    //  bays and selections.
    firstSelectedValue = this.get('selectedItems').first();
    if (haloTargetID === firstSelectedValue) {
        this.focusInspectorOnHome();
    }

    //  If the halo added the target, then remove it from the dynamic entries.
    if (this.get('$haloAddedTarget')) {

        dynamicEntries = this.get('dynamicContentEntries');
        dynamicEntriesIds = dynamicEntries.collect(
                            function(anEntry) {
                                return TP.id(anEntry);
                            });

        targetIndex = dynamicEntriesIds.indexOf(haloTargetID);

        //  Splice it out.
        if (targetIndex !== TP.NOT_FOUND) {
            dynamicEntries.splice(targetIndex, 1);
        }
    }

    //  Grab the current selection before we refresh
    content = this.getInspectorBayContentItem(0);
    if (TP.isValid(content)) {
        selection = content.get('value');

        //  Rebuild the root data entries and refresh bay 0
        this.buildRootBayData();
        this.refreshBay(0);

        //  Set the selection back after we refresh. Note here how we refetch
        //  the content in bay 0.
        content = this.getInspectorBayContentItem(0);
        content.set('value', selection);
    }

    //  Reset the halo target GID tracking attribute that we use to make sure to
    //  not focus on the same object twice in a row.
    this.set('$lastHaloTargetGID', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineHandler('HaloDidFocus',
function(aSignal) {

    /**
     * @method handleHaloDidFocus
     * @summary Handles notifications of when the halo focuses on an object.
     * @param {TP.sig.HaloDidFocus} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.inspector} The receiver.
     */

    var halo,

        haloTarget,

        dynamicEntries,

        content,
        selection;

    //  If the halo is just recasting the current element, then we do nothing
    //  here.
    halo = TP.wrap(aSignal.getOrigin());
    if (halo.get('$isRecasting')) {
        return this;
    }

    //  Grab the halo target and install local versions of some methods that the
    //  inspector will use.

    haloTarget = aSignal.at('haloTarget');

    //  If the halo is focusing on the same element (as compared by GIDs - the
    //  element may be being recast, so it might not be '==='), then just
    //  return. We *don't* want to navigate ourself in this case.
    if (haloTarget.getID() === this.get('$lastHaloTargetGID')) {
        return this;
    }

    //  Cache the global ID of the element that the halo is focusing.
    this.set('$lastHaloTargetGID', haloTarget.getID());

    haloTarget.defineMethod(
                'getLamaInspectorLabel',
                function() {
                    return 'HALO - ' +
                            TP.name(this) +
                            ' - #' +
                            TP.lid(this);
                });

    haloTarget.defineMethod(
                'getEntryLabel',
                function(anItem) {
                    return anItem;
                });

    //  Make sure that we don't already have the target in our list of dynamic
    //  entries.

    dynamicEntries = this.get('dynamicContentEntries');
    if (!dynamicEntries.contains(haloTarget, TP.IDENTITY)) {

        //  Wasn't found - add it.
        dynamicEntries.unshift(haloTarget);

        //  Track whether or not the halo itself added the target.
        this.set('$haloAddedTarget', true);
    } else {
        this.set('$haloAddedTarget', false);
    }

    //  Grab the current selection before we refresh
    content = this.getInspectorBayContentItem(0);
    if (TP.isValid(content)) {
        selection = content.get('value');

        //  Rebuild the root data entries and refresh bay 0
        this.buildRootBayData();
        this.refreshBay(0);

        //  Set the selection back after we refresh. Note here how we refetch
        //  the content in bay 0.
        content = this.getInspectorBayContentItem(0);
        content.set('value', selection);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineHandler('MethodAdded',
function(aSignal) {

    /**
     * @method handleMethodAdded
     * @summary Handles notifications of when the system adds a method.
     * @param {TP.sig.MethodAdded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.inspector} The receiver.
     */

    //  Not supplying a bay number to refresh will cause the current bay to
    //  refresh.
    this.refreshBay();

    //  Notify the user that we successfully added the method
    TP.bySystemId('LamaConsoleService').notify('Method Added');

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineHandler('NavigateInspector',
function(aSignal) {

    /**
     * @method handleNavigateInspector
     * @summary Handles notifications of when the system wants the inspector to
     *     'navigate' in a particular direction: TP.HOME, TP.PREVIOUS or
     *     TP.NEXT. It is used in conjunction with the 'path stack'.
     * @param {TP.sig.NavigateInspector} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.inspector} The receiver.
     */

    var pathStack,
        pathStackIndex,

        payload,

        newPathStackIndex,

        showBusy;

    pathStack = this.get('pathStack');
    pathStackIndex = this.get('pathStackIndex');

    payload = aSignal.getPayload();

    //  Depending on the 'direction' given in the signal, 'navigate' the
    //  receiver.
    switch (payload.at('direction')) {

        case TP.HOME:
            this.focusInspectorOnHome();
            return this;

        case TP.PREVIOUS:
            newPathStackIndex = (0).max(pathStackIndex - 1);
            break;

        case TP.NEXT:
            newPathStackIndex = (pathStackIndex + 1).min(
                                this.get('pathStack').getSize() - 1);
            break;

        default:
            return this;
    }

    //  If the newly computed path stack index did not equal the current path
    //  stack index, then a real navigation took place and we need to traverse
    //  the new path.
    if (newPathStackIndex !== pathStackIndex) {

        this.set('pathStackIndex', newPathStackIndex);

        //  See if the payload has a 'showBusy' flag set to true. If so, then
        //  show the inspector's 'busy' panel before beginning the traversal
        //  process.
        showBusy = payload.at('showBusy');
        if (TP.isTrue(showBusy)) {

            this.displayBusy();

            //  NB: We put this in a call to refresh after the next repaint so
            //  that the busy panel has a chance to show before proceeding with
            //  the traversal process.
            (function() {
                this.traversePath(pathStack.at(newPathStackIndex));

                this.hideBusy();
            }.bind(this)).queueAfterNextRepaint(this.getNativeWindow());

        } else {
            this.traversePath(pathStack.at(newPathStackIndex));
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineHandler('TypeAdded',
function(aSignal) {

    /**
     * @method handleTypeAdded
     * @summary Handles notifications of when the system adds a type.
     * @param {TP.sig.TypeAdded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.inspector} The receiver.
     */

    //  Not supplying a bay number to refresh will cause the current bay to
    //  refresh.
    this.refreshBay();

    //  Notify the user that we successfully added the method
    TP.bySystemId('LamaConsoleService').notify('Type Added');

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineHandler('UIDeselect',
function(aSignal) {

    /**
     * @method handleUIDeselect
     * @summary Handles notifications of when the user has cleared a selection.
     * @param {TP.sig.UIDeselect} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.inspector} The receiver.
     */

    var domTarget,
        targetBay;

    //  Grab the 'value' from the current DOM target.
    domTarget = aSignal.getTarget();

    targetBay = TP.nodeGetFirstAncestorByTagName(
                            domTarget, 'lama:inspectoritem');

    targetBay = TP.wrap(targetBay);

    //  Remove any bays after (i.e. to the right of) the target bay.
    this.removeBaysAfter(targetBay);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineHandler('UISelect',
function(aSignal) {

    /**
     * @method handleUISelect
     * @summary Handles notifications of when the user has made a selection.
     * @param {TP.sig.UISelect} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.inspector} The receiver.
     */

    var domTarget,
        domTargetParentTPElem,
        value;

    //  Grab the 'value' from the current DOM target.
    domTarget = aSignal.getTarget();

    //  If the parent of the DOM target is not an inspector item, then we bail
    //  out here - we don't want selection signals in panel content to trigger
    //  navigation.
    domTargetParentTPElem = TP.wrap(domTarget.parentNode);
    if (!TP.isKindOf(domTargetParentTPElem, TP.lama.inspectoritem)) {
        return this;
    }

    value = TP.wrap(domTarget).get('value');

    //  No value? Then just exit.
    if (TP.isEmpty(value)) {
        return this;
    }

    //  Otherwise, call the 'FocusInspectorForBrowsing' handler directly. Note
    //  how we do this after we allow the browser to reflow layout.
    this[TP.composeHandlerName('FocusInspectorForBrowsing')](
                TP.hc('targetAspect', value,
                        'domTarget', domTarget));

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('getCurrentHistoryEntry',
function() {

    /**
     * @method getCurrentHistoryEntry
     * @summary Returns the set of path parts that make up the history entry at
     *     the top of the history path stack.
     * @returns {String[]} The Array of path parts that make up the current
     *     history entry.
     */

    return this.get('pathStack').at(this.get('pathStackIndex'));
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('populateBayUsing',
function(info, createHistoryEntry) {

    /**
     * @method populateBayUsing
     * @summary This method causes the receiver to populate the bay given in the
     *     supplied info's 'bay index'
     * @param {TP.core.Hash} info The information used to traverse the
     *     hierarchy. This could have the following keys, amongst others:
     *          'targetObject':     The object to start the query process from.
     *          'targetAspect':     The property of the target object to use to
     *                              query the target object for the next object
     *                              to query, thereby traversing.
     * @param {Boolean} [createHistoryEntry=true] Whether or not to create a
     *     history entry after traversing.
     * @returns {TP.lama.inspector} The receiver.
     */

    var target,
        aspect,
        bayConfig,

        selectedItems,

        selectedAspect,

        newBayNum,

        bindLoc,

        params,

        existingBays,

        hasMinimumNumberOfBays,

        canReuseContent,

        targetBay,

        data,
        dataURI,

        bayContent;

    target = info.at('targetObject');
    aspect = info.at('targetAspect');

    //  NB: existingBays could be empty here, and that's ok.
    existingBays = TP.byCSSPath(' lama|inspectoritem', this);

    newBayNum = info.at('bayIndex');

    //  The bay we're actually going to put content into. Note that this might
    //  *not* necessarily be the *last* bay - but we'll clear those out as part
    //  of filling this one.
    targetBay = existingBays.at(newBayNum);

    selectedItems = this.get('selectedItems');

    //  We need to do this first since we need to add the aspect before we make
    //  the calls for the final target and data.
    if (newBayNum > 0) {

        //  Put the (new) aspect name at the spot we're on now in the selected
        //  items.
        selectedAspect = TP.ifInvalid(info.at('selectedAspect'), aspect);

        selectedItems.atPut(newBayNum - 1, selectedAspect);

        //  'Slice back' to the spot just after us.
        selectedItems = selectedItems.slice(0, newBayNum);

        //  Reset the selectedItems to what we just computed.
        this.set('selectedItems', selectedItems);
    }

    //  Compute whether we already have the minimum number of bays to display
    //  the content we're traversing to. Note that we might have *more* bays
    //  than what we need - we'll remove them below. But we need to have at
    //  least the number that we need to display this content - or we'll have to
    //  create them from scratch.
    hasMinimumNumberOfBays = existingBays.getSize() > newBayNum;

    bindLoc = 'urn:tibet:lama_bay_' + newBayNum;

    params = TP.hc('bindLoc', bindLoc,
                    'targetAspect', aspect,
                    'targetObject', target,
                    'pathParts', selectedItems);

    //  Finalize the target object that will be used. Note that the default here
    //  is just to return the target itself.
    target = TP.getFinalTargetForTool(
                target,
                'inspector',
                params);

    //  Make sure to reset the target in the info hash to the final one.
    info.atPut('targetObject', target);

    //  Grab the inspector data and set the resource of the bind location (i.e.
    //  a URN pointing to a specific bay's data) to that data.
    data = TP.getDataForTool(
            target,
            'inspector',
            params);

    //  If there wasn't a valid target , then clean up/out any unused bays, let
    //  any observers know that we 'focused' (on null) and return.
    if (TP.notValid(target)) {

        //  If there was already a bay to the right
        if (TP.isValid(targetBay)) {

            //  Remove any bays after (i.e. to the right of) the target bay.
            this.removeBaysAfter(targetBay);

            //  Then, empty the target bay itself.
            this.emptyBay(targetBay);
        }

        //  Make sure to update our toolbar, etc.
        this.finishUpdateAfterNavigation(info);

        this.signal('InspectorDidFocus');

        return this;
    }

    dataURI = TP.uc(bindLoc);
    dataURI.setResource(data, TP.request('signalChange', false));

    //  At first, we're not sure that we can reuse content, so we configure this
    //  flag to be false.
    canReuseContent = false;

    //  If we already have the minimum number of bays, then see if we can reuse
    //  the content that's already there.
    if (hasMinimumNumberOfBays) {

        //  Remove any bays after (i.e. to the right of) the target bay.
        this.removeBaysAfter(targetBay);

        //  Put the targeted bay into the params and ask the target whether we
        //  can reuse the content from it and just refresh the data.
        params.atPut('bayInspectorItem', targetBay);

        canReuseContent = TP.canReuseContentForTool(
                                target,
                                'inspector',
                                params);
    }

    //  Grab the configuration for the current target.
    bayConfig = TP.getConfigForTool(
                target,
                'inspector',
                TP.hc('targetAspect', aspect,
                        'targetObject', target,
                        'pathParts', selectedItems));

    if (TP.notValid(bayConfig)) {
        return this;
    }

    //  Configure it with the current target as the resolver.
    bayConfig.atPutIfAbsent('resolver', target);

    //  If we're not reusing existing content, then we have to get the new
    //  content for the inspector and place it into the inspector.
    if (!canReuseContent) {

        bayContent = TP.getContentForTool(
                        target,
                        'inspector',
                        params);

        if (!TP.isElement(bayContent)) {
            return this;
        }

        //  If we already have at least the minimum number of bays, then replace
        //  the item content in the target bay with the new content (clearing
        //  all of the bays to the right of it in the process).
        if (hasMinimumNumberOfBays) {
            this.replaceBayContent(targetBay, bayContent, bayConfig);
        } else {
            //  If we're creating the root bay, clear any content out of the
            //  core container.
            if (newBayNum === 0) {
                this.get('container').empty();
            }

            //  Otherwise, just add a bay with the new content.
            this.addBay(bayContent, bayConfig);
        }
    } else {
        //  We're reusing content, so we didn't get new content for the existing
        //  bay, but we still need to set it's configuration.
        this.configureBay(targetBay, bayConfig);
    }

    //  Signal changed on the URI that we're using as our data source. The bay
    //  content should've configured itself to observe this data when awoken.
    if (TP.notEmpty(bindLoc)) {
        TP.uc(bindLoc).$changed();
    }

    //  If the caller wants a history entry, we create one. Note here that
    //  the default is true, so the flag must be explicitly false.
    if (TP.notFalse(createHistoryEntry)) {
        this.createHistoryEntry(info.at('historyPathParts'));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('refreshBay',
function(aBayNum) {

    /**
     * @method refreshBay
     * @summary Refreshes the content in the bay at the supplied index, or the
     *     "last" bay if it is not supplied.
     * @param {Number} [aBayNum] The bay number to refresh. If this is not
     *     supplied, the "last" bay is refreshed.
     * @returns {TP.lama.inspector} The receiver.
     */

    var selectedItems,
        bayNum,

        inspectorBays,
        inspectorBay,
        resolver,
        data,

        bindLoc;

    selectedItems = this.get('selectedItems');
    bayNum = aBayNum;
    if (TP.notValid(bayNum)) {

        //  We're interested in refreshing the 'next bay over' where there is
        //  currently no selection.
        bayNum = selectedItems.getSize();
    }

    //  Grab the inspector bay corresponding to that bay number
    inspectorBays = TP.byCSSPath(' lama|inspectoritem', this);
    if (TP.isEmpty(inspectorBays)) {
        return this;
    }

    inspectorBay = inspectorBays.at(bayNum);

    if (TP.notValid(inspectorBay)) {
        //  TODO: Raise an exception - can't find a bay object
        return this;
    }

    resolver = inspectorBay.get('config').at('resolver');

    if (TP.notValid(resolver)) {
        //  TODO: Raise an exception - can't find a bay resolver
        return this;
    }

    //  Grab the data for the inspector using the resolver for that bay. Note
    //  that we do not supply any other params, just an empty Hash.
    data = TP.getDataForTool(
                    resolver,
                    'inspector',
                    TP.hc('pathParts', selectedItems));

    //  Set the resource of the URI holding the bound data for that bay to the
    //  refreshed data that we just obtained.
    bindLoc = 'urn:tibet:lama_bay_' + bayNum;
    TP.uc(bindLoc).setResource(data);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('reloadCurrentBay',
function(scrollToLastBay) {

    /**
     * @method reloadCurrentBay
     * @summary Reloads the current bay's content.
     * @param {Boolean} [scrollToLastBay=true] Whether or not to scroll to the
     *     end of the list of bays.
     * @returns {TP.lama.inspector} The receiver.
     */

    this.repopulateBay();

    if (TP.notFalse(scrollToLastBay)) {
        this.scrollBaysToEnd();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('repopulateBay',
function(aBayNum) {

    /**
     * @method repopulateBay
     * @summary Repopulates the content in the bay at the supplied index, or the
     *     "last" bay if it is not supplied.
     * @param {Number} [aBayNum] The bay number to repopulate. If this is not
     *     supplied, the "last" bay is repopulated.
     * @returns {TP.lama.inspector} The receiver.
     */

    var selectedItems,
        bayNum,

        inspectorBays,
        inspectorBay,

        config,

        info,

        toolbar,
        toolbarContent;

    selectedItems = this.get('selectedItems');
    bayNum = aBayNum;
    if (TP.notValid(bayNum)) {

        //  We're interested in refreshing the 'next bay over' where there is
        //  currently no selection.
        bayNum = selectedItems.getSize();
    }

    //  Grab the inspector bay corresponding to that bay number
    inspectorBays = TP.byCSSPath(' lama|inspectoritem', this);
    if (TP.isEmpty(inspectorBays)) {
        return this;
    }

    inspectorBay = inspectorBays.at(bayNum);

    if (TP.notValid(inspectorBay)) {
        //  TODO: Raise an exception - can't find a bay object
        return this;
    }

    config = inspectorBay.get('config');

    if (TP.notValid(config.at('targetObject'))) {
        //  TODO: Raise an exception - can't find a target object
        return this;
    }

    info = TP.hc('targetObject', config.at('targetObject'),
                    'targetAspect', config.at('targetAspect'),
                    'bayIndex', bayNum,
                    'pathParts', this.get('selectedItems'));

    this.populateBayUsing(info);

    //  Update the toolbar (or clear it)

    toolbar = TP.byId('LamaToolbar', this.getNativeDocument());
    toolbarContent = TP.getContentForTool(
                        info.at('targetObject'),
                        'toolbar',
                        info);

    if (TP.isElement(toolbarContent)) {
        toolbarContent = toolbar.setContent(toolbarContent);
        toolbarContent.awaken();
    } else {
        toolbar.empty();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('removeDynamicRoot',
function(target, forceRefresh) {

    /**
     * @method removeDynamicRoot
     * @summary Removes a 'dynamic' root entry. That is, a root entry that can
     *     be added, renamed or removed at will.
     * @param {Object} target The target object to remove as a dynamic root.
     * @param {Boolean} [forceRebuild=false] Whether or not to rebuild the
     *     receiver's root data.
     * @returns {TP.lama.inspector} The receiver.
     */

    var dynamicEntries,
        targetIndex;

    dynamicEntries = this.get('dynamicContentEntries');

    targetIndex = dynamicEntries.indexOf(target);

    //  If we found the target, then 'splice' it out and rebuild the root data.
    if (targetIndex !== TP.NOT_FOUND) {

        dynamicEntries.splice(targetIndex, 1);
        this.buildRootBayData();

    } else if (forceRefresh) {

        //  The caller wanted to force rebuild - do it.
        this.buildRootBayData();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('removeBay',
function(aBay) {

    /**
     * @method removeBay
     * @summary Removes a bay from the receiver.
     * @param {TP.lama.inspectoritem} aBay The bay element to remove.
     * @returns {TP.lama.inspector} The receiver.
     */

    var natBay;

    natBay = aBay.getNativeNode();
    TP.nodeDetach(natBay);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('removeBaysAfter',
function(startBay) {

    /**
     * @method removeBaysAfter
     * @summary Removes all of the bays that occur after the supplied bay.
     * @param {TP.lama.inspectoritem} startBay The bay element to begin
     *     removals from. This bay itself will *not* be removed.
     * @returns {TP.lama.inspector} The receiver.
     */

    var existingBays,

        startIndex,

        len,
        i;

    existingBays = TP.byCSSPath(' lama|inspectoritem', this);
    if (TP.isEmpty(existingBays)) {
        return this;
    }

    startIndex = existingBays.indexOf(startBay, TP.IDENTITY);

    len = existingBays.getSize();
    for (i = startIndex + 1; i < len; i++) {
        this.removeBay(existingBays.at(i));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('replaceBayContent',
function(aBay, bayContent, bayConfig) {

    /**
     * @method replaceBayContent
     * @summary Replaces the content of the supplied bay using the supplied
     *     content and configuration.
     * @param {TP.lama.inspectorItem} aBay The bay element to replace the
     *     content of.
     * @param {Element} bayContent The element containing the new content of the
     *     bay.
     * @param {TP.core.Hash} bayConfig The bay configuration. This could have
     *     the following keys, amongst others:
     *          TP.ATTR + '_childtype':   The tag name of the content being
     *                                      put into the bay
     *          TP.ATTR + '_class':         Any additional CSS classes to put
     *                                      onto the bay inspector item itself
     *                                      to adjust to the content being
     *                                      placed in it.
     * @returns {TP.lama.inspector} The receiver.
     */

    var content,
        id,
        childType,
        pathParts;

    this.removeBaysAfter(aBay);

    id = '';

    //  Start computing the unique ID by using the 'childType' (i.e. the type of
    //  control) if available.
    childType = bayConfig.at('attr_childtype');
    if (TP.notEmpty(childType)) {
        id += childType;
    }

    //  Then, if there are path parts, join them using '_' and append them to
    //  the id.
    pathParts = bayConfig.at('pathParts');
    if (TP.notEmpty(pathParts)) {
        id += '_' + pathParts.join('_');
    } else {
        //  Otherwise, this must be the ROOT list.
        id += '_' + 'ROOT';
    }

    //  Replace any invalid characters in the ID with '_'.
    TP.regex.INVALID_ID_CHARS.lastIndex = 0;
    id = id.replace(TP.regex.INVALID_ID_CHARS, '_');

    //  Set the current bay inspectoritem element with that ID.
    TP.elementSetAttribute(aBay.getNativeNode(), 'id', id, true);

    content = aBay.setContent(bayContent);
    content.awaken();

    this.configureBay(aBay, bayConfig);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('scrollBy',
function(direction) {

    /**
     * @method scrollBy
     * @summary 'Scrolls' the receiver in the supplied direction.
     * @param {String} direction A named direction to scroll the element. Any
     *     one of:
     *          TP.RIGHT
     *          TP.LEFT
     * @returns {TP.lama.inspector} The receiver.
     */

    var inspectorElem,

        inspectorBays,

        len,
        i;

    inspectorElem = this.getNativeNode();

    inspectorBays = TP.byCSSPath(' lama|inspectoritem', this);
    if (TP.isEmpty(inspectorBays)) {
        return this;
    }

    len = inspectorBays.getSize();

    //  Depending on the direction, grab the bay before or after the leftmost
    //  bay.
    if (direction === TP.LEFT) {

        //  Find first bay from the lefthand side that is wholly visible. Note
        //  that we start at 1, since if the leftmost bay is wholly visible,
        //  then we don't need to do any scrolling from the left at all.
        for (i = 1; i < len; i++) {
            if (inspectorBays.at(i).isVisible()) {
                inspectorElem.scrollLeft =
                    inspectorBays.at(i - 1).getNativeNode().offsetLeft;
                break;
            }
        }
    } else if (direction === TP.RIGHT) {

        //  Find first bay from the righthand side that is wholly visible. Note
        //  that we're iterating backwards, which would normally mean that we
        //  start at len -1, but because if the rightmost bay is wholly visible,
        //  then we don't need to do any scrolling from the right at all, we
        //  start at len - 2.
        for (i = len - 2; i >= 0; i--) {
            if (inspectorBays.at(i).isVisible()) {
                inspectorElem.scrollLeft =
                    inspectorBays.at(i + 1).getNativeNode().offsetLeft;
                break;
            }
        }
    }

    //  Make sure to update the scroll buttons :-).
    this.updateScrollButtons();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('scrollBaysToEnd',
function() {

    /**
     * @method scrollBaysToEnd
     * @summary 'Scrolls' the receiver to the last bay.
     * @returns {TP.lama.inspector} The receiver.
     */

    this.scrollTo(TP.RIGHT);

    //  Make sure to update the scroll buttons :-).
    this.updateScrollButtons();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('updateScrollButtons',
function() {

    /**
     * @method updateScrollButtons
     * @summary Updates the receiver's scroll buttons
     * @returns {TP.lama.inspector} The receiver.
     */

    var arrows;

    arrows = TP.byCSSPath(
                '> lama|scrollbutton',
                TP.unwrap(TP.byId('LamaWorkbench', this.getNativeWindow())),
                false,
                true);

    arrows.forEach(
            function(anArrow) {
                anArrow.updateForScrollingContent();
            });

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('selectItemInBay',
function(itemLabel, aBayNum) {

    /**
     * @method selectItemInBay
     * @summary Selects the item with the supplied name in the bay matching the
     *     supplied bay number. Note that what 'select' means is really up to
     *     the bay content.
     * @param {String} itemLabel The name of the item to select.
     * @param {Number} [aBayNum] The bay number to select the item in. If this is
     *     not supplied, the "last" bay is used.
     * @returns {TP.lama.inspector} The receiver.
     */

    var inspectorBayContentItems,

        bayNum,
        bayContent,

        label;

    if (TP.notEmpty(inspectorBayContentItems =
                    TP.byCSSPath(' lama|inspectoritem > *', this))) {

        bayNum = aBayNum;
        if (TP.notValid(bayNum)) {

            //  We're interested in refreshing the 'next bay over' where there is
            //  currently no selection.
            bayNum = this.get('selectedItems').getSize();
        }

        bayContent = inspectorBayContentItems.at(bayNum);

        //  Sometimes entries come in with escaped slashes. Unescape that.
        label = TP.stringUnescapeSlashes(itemLabel);

        //  The bay content here will have already been re-rendered because of
        //  data binding, but we need to select what the new item will be.
        if (TP.canInvoke(bayContent, 'selectLabel')) {
            bayContent.selectLabel(label, null, false);
        } else if (TP.canInvoke(bayContent, 'select')) {
            bayContent.select(label, null, false);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the TP.lama.inspector object.
     * @returns {TP.lama.inspector} The receiver.
     */

    var rootSources,

        northDrawer,
        drawerIsOpenFunc;

    //  ---
    //  Set up static roots
    //  ---

    rootSources = TP.sys.getcfg('lama.inspector_root_sources');
    if (TP.isArray(rootSources)) {

        rootSources.forEach(
            function(nameTypePair) {

                var name,
                    type;

                name = nameTypePair.first();
                type = nameTypePair.last();

                type = TP.sys.getTypeByName(type);
                if (!TP.isType(type)) {
                    //  TODO: Raise an exception - can't find type
                    return;
                }

                this.addEntry(name, type.construct());
            }.bind(this));
    }

    //  ---
    //  Other instance data/handlers
    //  ---

    //  Dynamic root entries
    this.set('dynamicContentEntries', TP.ac());

    //  Selected items
    this.set('selectedItems', TP.ac());

    //  Grab the north drawer and set up a handler on it that will load our root
    //  content when it is opened for the first time.
    northDrawer = TP.byId('north', this.getNativeWindow());

    drawerIsOpenFunc = function(transitionSignal) {

        //  Turn off any future notifications.
        drawerIsOpenFunc.ignore(northDrawer, 'TP.sig.DOMTransitionEnd');

        //  Go ahead and 'focus' the inspector, which will show the roots.
        this.focusUsingInfo(TP.hc('targetObject', this));

    }.bind(this);

    drawerIsOpenFunc.observe(northDrawer, 'TP.sig.DOMTransitionEnd');

    this.observe(TP.byId('LamaHUD', this.getNativeWindow()),
                    'PclassClosedChange');

    this.toggleObservations(true);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('traversePath',
function(pathParts) {

    /**
     * @method traversePath
     * @summary This method causes the receiver to traverse a path (via
     *     'select'ing the content in each bay as it traverses), thereby
     *     navigating the receiver to a particular place in a hierarchy.
     * @description Note that this method will *not* create a history entry
     *     after it traverses the path.
     * @param {String[]} The Array of path parts to follow in the traversal
     *     operation.
     * @returns {TP.lama.inspector} The receiver.
     */

    var inspectorBays,

        rootEntryResolver,

        resolvedPathParts,

        target,

        i,

        nextBay,
        resolver,

        targetAspect,
        info;

    inspectorBays = TP.byCSSPath(' lama|inspectoritem', this);
    if (TP.isEmpty(inspectorBays)) {
        return this;
    }

    rootEntryResolver = this.getEntryAt(pathParts.first());

    //  If any of these path parts returned an alias, look it up here.
    resolvedPathParts = this.getType().resolvePathAliases(pathParts);

    if (TP.isEmpty(resolvedPathParts)) {
        this.focusInspectorOnHome();

        return this;
    }

    //  We start the target at the root entry resolver.
    target = rootEntryResolver;

    for (i = 0; i < resolvedPathParts.getSize(); i++) {

        //  If we have a valid bay at a spot one more than the path segment that
        //  we're processing for, then grab its resolver and try to traverse
        //  that segment.
        nextBay = inspectorBays.at(i);

        if (TP.isValid(nextBay)) {
            resolver = nextBay.get('config').at('resolver');

            targetAspect = resolvedPathParts.at(i);

            //  Resolve the targetAspect to a target object
            target = TP.resolveAspectForTool(
                            resolver,
                            'inspector',
                            targetAspect,
                            TP.hc('pathParts',
                                    this.get('selectedItems')));

            if (TP.notValid(target)) {
                break;
            }

            this.selectItemInBay(targetAspect, i);

            //  NB: Don't worry about not supplying 'historyPathParts' here,
            //  since we don't want to create history entries anyway - hence the
            //  'false' below.
            info = TP.hc('targetObject', target,
                            'targetAspect', targetAspect,
                            'bayIndex', i + 1);

            this.populateBayUsing(info, false);

            //  Now that we have more inspector items, obtain the list
            //  again.
            inspectorBays = TP.byCSSPath(' lama|inspectoritem', this);
        }
    }

    //  Note here how we use the last populated 'info' object
    this.finishUpdateAfterNavigation(info);

    this.signal('InspectorDidFocus');

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('toggleObservations',
function(shouldObserve) {

    /**
     * @method toggleObservations
     * @summary Either observe or ignore the signals that the receiver needs to
     *     function.
     * @param {Boolean} shouldObserve Whether or not we should be observing (or
     *     ignoring) signals.
     * @returns {TP.lama.inspector} The receiver.
     */

    if (shouldObserve) {
        //  Listen for when our document resizes. Note that we actually filter
        //  out other resize events coming from elements under the document. See
        //  the 'DOMResize' handler for more information.
        this.observe(this.getDocument(), 'TP.sig.DOMResize');

        this.observe(TP.ANY,
                        TP.ac('TP.sig.NavigateInspector',
                                'TP.sig.TypeAdded',
                                'TP.sig.MethodAdded'));

        this.observe(TP.byId('LamaHalo', this.getNativeDocument()),
                        TP.ac('TP.sig.HaloDidFocus', 'TP.sig.HaloDidBlur'));

        this.observe(TP.byId('LamaBreadcrumb', this.getNativeDocument()),
                        'TP.sig.BreadcrumbSelected');
    } else {
        this.ignore(this.getDocument(), 'TP.sig.DOMResize');

        this.ignore(TP.ANY,
                        TP.ac('TP.sig.NavigateInspector',
                                'TP.sig.TypeAdded',
                                'TP.sig.MethodAdded'));

        this.ignore(TP.byId('LamaHalo', this.getNativeDocument()),
                        TP.ac('TP.sig.HaloDidFocus', 'TP.sig.HaloDidBlur'));

        this.ignore(TP.byId('LamaBreadcrumb', this.getNativeDocument()),
                        'TP.sig.BreadcrumbSelected');
    }

    return this;
});

//  ------------------------------------------------------------------------
//  TP.lama.ToolAPI Methods
//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('getContentForInspector',
function(options) {

    /**
     * @method getContentForInspector
     * @summary Returns the source's content that will be hosted in an inspector
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

    var dataURI;

    //  If the targetAspect is TP.NOT_FOUND, then we have an uninspectable
    //  object.
    if (options.at('targetAspect') === TP.NOT_FOUND) {
        return TP.xhtmlnode(
                '<div class="wrapped noselect usermessage">' +
                    '<div>Uninspectable Object</div>' +
                '</div>');
    }

    dataURI = TP.uc(options.at('bindLoc'));

    return TP.elem(
            '<xctrls:list bind:in="{data: ' +
            dataURI.asString() +
            '}" filter="true" alwayschange="true" itemtoggle="false"/>');
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('getDataForInspector',
function(options) {

    /**
     * @method getDataForInspector
     * @summary Returns the source's data that will be supplied to the content
     *     hosted in an inspector bay. In most cases, this data will be bound to
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

    var entries,

        dynamicData,
        staticData,

        data;

    //  If the targetAspect is TP.NOT_FOUND, then we have an uninspectable
    //  object.
    if (options.at('targetAspect') === TP.NOT_FOUND) {
        return TP.ac();
    }

    //  This logic must produce values in its first slot that can then be
    //  resolved by 'resolveAspectForInspector' below.

    entries = this.get('dynamicContentEntries');
    dynamicData = entries.collect(
                    function(entry) {
                        return TP.ac(TP.id(entry), this.getEntryLabel(entry));
                    }.bind(this));

    entries = this.get('entries');
    staticData = entries.collect(
                    function(kvPair) {
                        return TP.ac(
                                kvPair.first(),
                                this.getEntryLabel(kvPair.last()));
                    }.bind(this));

    data = dynamicData.concat(staticData);

    return data;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('getEntryAt',
function(aSourceName) {

    /**
     * @method getEntryAt
     * @summary Returns the 'entry' in the receiver for the supplied source
     *     name. This will be the singular name used to register the entry.
     * @param {String} aSourceName The name of the entry to retrieve.
     * @returns {Object} The entry object registered under the supplied source
     *     name in the receiver.
     */

    var srcName,

        target,
        dynamicContentEntries;

    //  If the targetAspect is TP.NOT_FOUND, then we have an uninspectable
    //  object.
    if (aSourceName === TP.NOT_FOUND) {
        return null;
    }

    //  Sometimes entries come in with escaped slashes. Unescape that.
    srcName = TP.stringUnescapeSlashes(aSourceName);

    dynamicContentEntries = this.get('dynamicContentEntries');
    target = dynamicContentEntries.detect(
                    function(anItem) {
                        return TP.id(anItem) === srcName;
                    });

    if (TP.notValid(target)) {
        target = this.get('entries').at(srcName);
    }

    if (TP.notValid(target)) {
        target = TP.bySystemId(srcName);
    }

    if (TP.notValid(target)) {
        target = TP.bySystemId('TSH').resolveObjectReference(
                                                srcName, TP.request());
    }

    return target;
});

//  ------------------------------------------------------------------------

TP.lama.inspector.Inst.defineMethod('resolveAspectForInspector',
function(anAspect, options) {

    /**
     * @method resolveAspectForInspector
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

//  ========================================================================
//  TP.lama.TIBETRootInspectorSource
//  ========================================================================

/**
 * @type {TP.lama.TIBETRootInspectorSource}
 */

TP.lama.InspectorSource.defineSubtype('lama.TIBETRootInspectorSource');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.TIBETRootInspectorSource.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.lama.InspectorSource} The receiver.
     */

    this.callNextMethod();

    this.addEntry(
        'Config',
        TP.lama.TIBETConfigListInspectorSource.construct());

    this.addEntry(
        'Local Storage',
        TP.lama.TIBETLocalStorageListInspectorSource.construct());

    this.addEntry(
        'Session Storage',
        TP.lama.TIBETSessionStorageListInspectorSource.construct());

    this.addEntry(
        'Signal Map',
        TP.lama.TIBETSignalMapListInspectorSource.construct());

    this.addEntry(
        'Routes',
        TP.lama.TIBETRouteListInspectorSource.construct());

    this.addEntry(
        'Types',
        TP.lama.TIBETTypeListInspectorSource.construct());

    this.addEntry(
        'URIs',
        TP.lama.TIBETURIListInspectorSource.construct());

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
