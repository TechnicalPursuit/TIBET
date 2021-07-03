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
 * @type {TP.xctrls.WayfinderPathSource}
 */

TP.xctrls.WayfinderSource.defineSubtype('WayfinderPathSource');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.WayfinderPathSource.Inst.defineAttribute('methodRegister');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.WayfinderPathSource.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.xctrls.WayfinderPathSource} The receiver.
     */

    this.callNextMethod();

    this.set('methodRegister', TP.hc());

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.WayfinderPathSource.Inst.defineMethod('dispatchMethodForPath',
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

TP.xctrls.WayfinderPathSource.Inst.defineMethod('getConfigForWayfinder',
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

    return this.dispatchMethodForPath(options.at('pathParts'),
                                        'getConfigForWayfinderFor',
                                        arguments);
});

//  ------------------------------------------------------------------------

TP.xctrls.WayfinderPathSource.Inst.defineMethod('getContentForWayfinder',
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

    return this.dispatchMethodForPath(options.at('pathParts'),
                                        'getContentForWayfinderFor',
                                        arguments);
});

//  ------------------------------------------------------------------------

TP.xctrls.WayfinderPathSource.Inst.defineMethod('getChildTypeForCanvas',
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

TP.xctrls.WayfinderPathSource.Inst.defineMethod('getContentForToolbar',
function(options) {

    /**
     * @method getContentForToolbar
     * @summary Returns the source's content that will be hosted in an wayfinder
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

TP.xctrls.WayfinderPathSource.Inst.defineMethod('getDataForWayfinder',
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

    return this.dispatchMethodForPath(options.at('pathParts'),
                                        'getDataForWayfinderFor',
                                        arguments);
});

//  ------------------------------------------------------------------------

TP.xctrls.WayfinderPathSource.Inst.defineMethod('registerMethodSuffixForPath',
function(methodSuffix, regExpParts) {

    /**
     * @method registerMethodSuffixForPath
     * @summary Registers a method suffix with the attendant parts that will be
     *     used to form a RegExp. The RegExp will be computed from the supplied
     *     parts and, when matched, will indicate that the supplied method
     *     suffix should be used to compute a method name.
     * @param {String} methodSuffix The suffix to register for matching.
     * @param {String[]} regExpParts The parts used to form the RegExp.
     * @returns {TP.xctrls.WayfinderPathSource} The receiver.
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

TP.xctrls.WayfinderPathSource.Inst.defineMethod('resolveAspectForWayfinder',
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

    this.addEntry(anAspect, this);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
