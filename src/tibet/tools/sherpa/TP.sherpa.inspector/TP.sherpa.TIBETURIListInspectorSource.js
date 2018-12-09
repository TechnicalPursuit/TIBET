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
//  TP.sherpa.TIBETURIListInspectorSource
//  ========================================================================

/**
 * @type {TP.sherpa.TIBETURIListInspectorSource}
 */

TP.sherpa.InspectorSource.defineSubtype(
                            'sherpa.TIBETURIListInspectorSource');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.TIBETURIListInspectorSource.Inst.defineHandler(
'SherpaInspectorAddURI',
function(aSignal) {

    TP.prompt('Enter URI address:',
                'urn:tibet:').then(
        function(userValue) {

            var inspector,
                uri;

            if (TP.notEmpty(userValue)) {
                //  Grab the inspector.
                inspector = TP.byId('SherpaInspector', TP.sys.getUIRoot());

                //  This will build and register the URI.
                uri = TP.uc(userValue);

                //  Refresh the current bay (the URI list) to include the newly
                //  created URI.
                inspector.refreshBay();

                //  Focus this using a forked function to give the modal panel
                //  time to dismiss.
                setTimeout(function() {
                    inspector.focusUsingInfo(
                                TP.hc('targetAspect', userValue,
                                        'targetObject', uri));
                }, TP.sys.cfg('fork.delay'));
            }
        });
});

//  ------------------------------------------------------------------------
//  Inspector API
//  ------------------------------------------------------------------------

TP.sherpa.TIBETURIListInspectorSource.Inst.defineMethod('getConfigForInspector',
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
     *          TP.ATTR + '_contenttype':   The tag name of the content being
     *                                      put into the bay
     *          TP.ATTR + '_class':         Any additional CSS classes to put
     *                                      onto the bay inspector item itself
     *                                      to adjust to the content being
     *                                      placed in it.
     */

    options.atPut(TP.ATTR + '_class', 'doublewide');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.TIBETURIListInspectorSource.Inst.defineMethod('getContentForInspector',
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
            '}" filter="true" alwaysSignalChange="true" toggleItems="false"/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.TIBETURIListInspectorSource.Inst.defineMethod('getDataForInspector',
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

    var uriKeys,
        uris,

        sourceLocs,
        data;

    //  Grab all of the URIs and their keys
    uris = TP.uri.URI.get('instances');
    uriKeys = TP.keys(uris);

    //  Iterate over all the URIs, expanding whatever path they hand back as
    //  their location.
    sourceLocs = TP.ac();
    uriKeys.forEach(
        function(aKey) {
            var loc;

            loc = TP.uriExpandPath(uris.at(aKey).getLocation());

            //  Make sure that URIs that have a fragment are *not* placed into
            //  the source locations.
            if (TP.isEmpty(TP.uriFragment(loc))) {
                sourceLocs.push(loc);
            }
        });

    //  Now that they're all in their 'fully expanded' form, we need to unique
    //  them. This will give us the most unique list.
    sourceLocs.unique();

    //  Iterate and put their unique key in the first (value) slot and their
    //  'virtualized' form in the second (label) slot.
    if (TP.isValid(sourceLocs)) {
        data = sourceLocs.collect(
                    function(entry) {
                        return TP.ac(
                                entry,
                                TP.uriInTIBETFormat(entry));
                    });
        data.sort(TP.sort.FIRST_ITEM);
    } else {
        data = TP.ac();
    }

    return data;
});

//  ------------------------------------------------------------------------

TP.sherpa.TIBETURIListInspectorSource.Inst.defineMethod('getEntryAt',
function(aSourceName) {

    /**
     * @method getEntryAt
     * @summary Returns the 'entry' in the receiver for the supplied source
     *     name. This will be the singular name used to register the entry.
     * @param {String} aSourceName The name of the entry to retrieve.
     * @returns {Object} The entry object registered under the supplied source
     *     name in the receiver.
     */

    var fullURIStr,
        source;

    fullURIStr = TP.uriResolveVirtualPath(aSourceName);

    source = TP.uri.URI.get('instances').at(fullURIStr);

    return source;
});

//  ------------------------------------------------------------------------
//  Toolbar API
//  ------------------------------------------------------------------------

TP.sherpa.TIBETURIListInspectorSource.Inst.defineMethod('getContentForToolbar',
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

    return TP.elem('<sherpa:urisToolbarContent tibet:ctrl="urn:tibet:sherpa_inspector_target"/>');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
