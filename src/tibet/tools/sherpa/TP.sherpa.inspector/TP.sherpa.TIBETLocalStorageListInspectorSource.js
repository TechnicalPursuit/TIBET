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
//  TP.sherpa.TIBETLocalStorageListInspectorSource
//  ========================================================================

/**
 * @type {TP.sherpa.TIBETLocalStorageListInspectorSource}
 */

TP.sherpa.InspectorSource.defineSubtype(
                            'sherpa.TIBETLocalStorageListInspectorSource');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Inspector API
//  ------------------------------------------------------------------------

TP.sherpa.TIBETLocalStorageListInspectorSource.Inst.defineMethod(
'getDataForInspector',
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

    sourceEntries = TP.hc(TP.global.localStorage);

    if (TP.isValid(sourceEntries)) {
        data = sourceEntries.collect(
                    function(kvPair) {
                        return TP.ac(
                                kvPair.first(),
                                this.getEntryLabel(kvPair.first()));
                    }.bind(this));
        data.sort(TP.sort.FIRST_ITEM);
    } else {
        data = TP.ac();
    }

    return data;
});

//  ------------------------------------------------------------------------

TP.sherpa.TIBETLocalStorageListInspectorSource.Inst.defineMethod(
'resolveAspectForInspector',
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

    var source;

    source = TP.sherpa.SingleEntryInspectorSource.construct();
    source.get('additionalConfig').atPut(
                    TP.ATTR + '_class', 'doublewide');

    source.setPrimaryEntry(TP.global.localStorage[anAspect]);

    return source;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
