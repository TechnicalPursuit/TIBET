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
//  TP.sherpa.RouteEntryInspectorSource
//  ========================================================================

/**
 * @type {TP.sherpa.RouteEntryInspectorSource}
 */

TP.sherpa.InspectorSource.defineSubtype(
                            'sherpa.RouteEntryInspectorSource');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.RouteEntryInspectorSource.Inst.defineMethod(
    'getConfigForInspector',
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

    options.atPut(TP.ATTR + '_contenttype', 'html:div');

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.RouteEntryInspectorSource.Inst.defineMethod(
    'getContentForInspector',
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

    var jsonURI,

        schemaResource,
        schema,

        propertySheet;

    jsonURI = TP.uc('~ide_root/schema/tibet_tooling_types.json');
    schemaResource = TP.uc(jsonURI).getResource(
                        TP.hc('async', false,
                                'refresh', true,
                                'contenttype', TP.json.JSONSchemaContent));
    schema = schemaResource.get('result');

    propertySheet = TP.xctrls.propertysheet.from(
                    schema,
                    TP.hc(
                        'sheetAttrs',
                        TP.hc('bind:scope', options.at('bindLoc').asString()),
                        'renderInfo',
                        TP.hc('mainMarkupNS', TP.w3.Xmlns.XHTML)));

    return TP.unwrap(propertySheet);
});

//  ------------------------------------------------------------------------

TP.sherpa.RouteEntryInspectorSource.Inst.defineMethod(
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

    var targetAspect,

        initialPath,

        data,

        dataURI,

        dataURISecondaries,
        i;

    targetAspect = options.at('targetAspect');

    initialPath = 'route.map.' + targetAspect;

    data = TP.sherpa.ConfigPropertyAdaptor.construct(initialPath);

    dataURI = TP.uc(options.at('bindLoc'));
    dataURISecondaries = dataURI.getSecondaryURIs();
    for (i = 0; i < dataURISecondaries.getSize(); i++) {
        TP.uri.URI.removeInstance(dataURISecondaries.at(i));
    }

    dataURI.setResource(data, TP.request('signalChange', false));

    return data;
});

//  ------------------------------------------------------------------------
//  ------------------------------------------------------------------------
//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('sherpa.ConfigPropertyAdaptor');

TP.sherpa.ConfigPropertyAdaptor.Inst.defineAttribute('pathPrefix');

//  ------------------------------------------------------------------------

TP.sherpa.ConfigPropertyAdaptor.Inst.defineMethod('init',
function(pathPrefix) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.sherpa.ConfigPropertyAdaptor} The receiver.
     */

    this.callNextMethod();

    this.$set('pathPrefix', pathPrefix, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConfigPropertyAdaptor.Inst.defineMethod('get',
function(attributeName) {

    var path,
        val,

        attrName;

    if (attributeName === 'pathPrefix') {
        return this.pathPrefix;
    }

    if (attributeName.isAccessPath()) {
        attrName = attributeName.asString();
    } else {
        attrName = attributeName;
    }

    path = this.get('pathPrefix') + '.' + attrName;

    val = TP.sys.getcfg(path);

    return val;
});

//  ------------------------------------------------------------------------

TP.sherpa.ConfigPropertyAdaptor.Inst.defineMethod('set',
function(attributeName, attributeValue, shouldSignal) {

    var path,

        attrName;

    if (attributeName.isAccessPath()) {
        attrName = attributeName.asString();
    } else {
        attrName = attributeName;
    }

    path = this.get('pathPrefix') + '.' + attrName;

    //  NB: We could use isFalsey here, but we want '' and 0 to actually be set.
    if (TP.notValid(attributeValue) || TP.isFalse(attributeValue)) {
        TP.sys.setcfg(path, undefined);
    } else {
        TP.sys.setcfg(path, attributeValue);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
