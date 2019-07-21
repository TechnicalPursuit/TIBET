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
//  TP.sherpa.RESTRootInspectorSource
//  ========================================================================

/**
 * @type {TP.sherpa.RESTRootInspectorSource}
 */

TP.sherpa.InspectorSource.defineSubtype('sherpa.RESTRootInspectorSource');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Inspector API
//  ------------------------------------------------------------------------

TP.sherpa.RESTRootInspectorSource.Inst.defineMethod('getConfigForInspector',
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

TP.sherpa.RESTRootInspectorSource.Inst.defineMethod('getDataForInspector',
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

    var sources,
        thisref;

    thisref = this;
    sources = TP.sys.cfg('sherpa.inspector_rest_sources');

    return sources.collect(function(item) {
        return TP.ac(item.first(), thisref.getEntryLabel(item.first()));
    });
});

//  ------------------------------------------------------------------------

TP.sherpa.RESTRootInspectorSource.Inst.defineMethod('resolveAspectForInspector',
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

    var tname,
        type,
        inst;

    tname = 'TP.sherpa.' + anAspect + 'RootInspectorSource';
    type = TP.sys.getTypeByName(tname);
    if (TP.isValid(type)) {
        inst = type.construct();

        //  Cache for next time.
        this.addEntry(anAspect, inst);
    }

    return inst;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
