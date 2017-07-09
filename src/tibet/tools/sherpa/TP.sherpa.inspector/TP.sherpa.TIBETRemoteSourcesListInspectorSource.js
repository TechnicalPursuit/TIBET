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
//  TP.sherpa.TIBETRemoteSourcesListInspectorSource
//  ========================================================================

/**
 * @type {TP.sherpa.TIBETRemoteSourcesListInspectorSource}
 */

TP.sherpa.InspectorSource.defineSubtype(
                            'sherpa.TIBETRemoteSourcesListInspectorSource');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Inspector API
//  ------------------------------------------------------------------------

TP.sherpa.TIBETRemoteSourcesListInspectorSource.Inst.defineMethod(
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

    /*
    remoteSources = TP.sys.cfg('uri.remote_sources', TP.ac());

    remoteSources.forEach(
        function(aSource) {

            var sourceURI,
                sourceURIMap,
                inspectorHandlerTypeName,
                inspectorHandlerType,
                newHandler;

            sourceURI = TP.uc(aSource);

            sourceURIMap = TP.core.URI.$getURIMap(sourceURI);

            inspectorHandlerTypeName =
                    sourceURIMap.at('sherpa_inspector_handler');
            inspectorHandlerType =
                    TP.sys.getTypeByName(inspectorHandlerTypeName);

            if (TP.isType(inspectorHandlerType)) {

                newHandler = inspectorHandlerType.construct();
                newHandler.set('serverAddress', sourceURI.getRoot());

                this.addEntry(newHandler.getInspectorPath(), newHandler);
            }
        }.bind(this));
    */

    return TP.ac(
            TP.ac('Foo', 'Foo')
    );
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
