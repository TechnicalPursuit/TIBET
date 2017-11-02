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
//  TP.sherpa.CouchDBRootInspectorSource
//  ========================================================================

/**
 * @type {TP.sherpa.CouchDBRootInspectorSource}
 */

TP.sherpa.InspectorSource.defineSubtype('sherpa.CouchDBRootInspectorSource');

//  ------------------------------------------------------------------------
//  Inspector API
//  ------------------------------------------------------------------------

TP.sherpa.CouchDBRootInspectorSource.Inst.defineMethod('getEntryLabel',
function(anItem) {

    /**
     * @method getEntryLabel
     * @summary Returns the 'entry label' used in the receiver for the supplied
     *     Object in the receiver.
     * @param {Object} anItem The object to return the label for.
     * @returns {String} The label to be used for the supplied item.
     */

    var serverConfig,

        serverNumber,
        serverName;

    serverConfig = TP.sys.getcfg('couch.known_server_urls');

    //  The item will be something like 'CouchDB_Server_1'. We want the number,
    //  so we slice everything else off.
    serverNumber = anItem.slice(anItem.lastIndexOf('_') + 1).asNumber();
    if (!TP.isNumber(serverNumber)) {
        return this.callNextMethod();
    }

    //  The server name is stored in the first position of the config pair of
    //  the computed server number.
    serverName = serverConfig.at(serverNumber).first();

    return serverName;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBRootInspectorSource.Inst.defineMethod('getDataForInspector',
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

    var serverConfig,
        data;

    serverConfig = TP.sys.getcfg('couch.known_server_urls');
    if (TP.isEmpty(serverConfig)) {
        return TP.ac();
    }

    data = serverConfig.collect(
        function(serverInfoPair, anIndex) {
            var val;

            val = 'CouchDB_Server_' + anIndex;
            return TP.ac(val, this.getEntryLabel(val));
        }.bind(this));

    return data;
});

//  ------------------------------------------------------------------------

TP.sherpa.CouchDBRootInspectorSource.Inst.defineMethod('resolveAspectForInspector',
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

    var serverConfig,

        serverNumber,
        serverAddress,

        newInspector;

    if (!anAspect.startsWith('CouchDB_Server_')) {
        return this.callNextMethod();
    }

    serverConfig = TP.sys.getcfg('couch.known_server_urls');

    //  The item will be something like 'CouchDB_Server_1'. We want the number,
    //  so we slice everything else off.
    serverNumber = anAspect.slice(anAspect.lastIndexOf('_') + 1).asNumber();
    if (!TP.isNumber(serverNumber)) {
        return this.callNextMethod();
    }

    //  The server address is stored in the last position of the config pair of
    //  the computed server number.
    serverAddress = serverConfig.at(serverNumber).last();

    newInspector = TP.sherpa.CouchTools.construct();
    newInspector.set('serverAddress', serverAddress);

    this.addEntry(anAspect, newInspector);

    return newInspector;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
