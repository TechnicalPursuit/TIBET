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
//  TP.sherpa.TIBETTypeListInspectorSource
//  ========================================================================

/**
 * @type {TP.sherpa.TIBETTypeListInspectorSource}
 */

TP.sherpa.InspectorSource.defineSubtype(
                            'sherpa.TIBETTypeListInspectorSource');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.TIBETTypeListInspectorSource.Inst.defineHandler(
'SherpaInspectorAddType',
function(aSignal) {

    TP.signal(null,
                'ConsoleCommand',
                TP.hc(
                    'cmdText',
                        ':type --assist' +
                                ' --name=\'newType\'' +
                                ' --dna=\'default\''
                ));
});

//  ------------------------------------------------------------------------
//  Inspector API
//  ------------------------------------------------------------------------

TP.sherpa.TIBETTypeListInspectorSource.Inst.defineMethod(
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

    var customTypeNames,

        sourceEntries,
        data;

    customTypeNames = TP.sys.getCustomTypeNames().sort();
    customTypeNames.isOriginSet(false);

    sourceEntries = customTypeNames;

    if (TP.isValid(sourceEntries)) {
        data = sourceEntries.collect(
                    function(entry) {
                        return TP.ac(
                                entry,
                                this.getEntryLabel(entry));
                    }.bind(this));
        data.sort(TP.sort.FIRST_ITEM);
    } else {
        data = TP.ac();
    }

    return data;
});

//  ------------------------------------------------------------------------

TP.sherpa.TIBETTypeListInspectorSource.Inst.defineMethod('getEntryAt',
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

    return TP.sys.getCustomTypes().at(srcName);
});

//  ------------------------------------------------------------------------
//  Toolbar API
//  ------------------------------------------------------------------------

TP.sherpa.TIBETTypeListInspectorSource.Inst.defineMethod('getContentForToolbar',
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

    return TP.elem('<sherpa:typesToolbarContent tibet:ctrl="urn:tibet:sherpa_inspector_target"/>');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
