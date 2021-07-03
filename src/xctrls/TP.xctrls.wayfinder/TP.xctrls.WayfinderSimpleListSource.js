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
//  TP.xctrls.WayfinderSimpleListSource
//  ========================================================================

/**
 * @type {TP.xctrls.WayfinderSimpleListSource}
 */

TP.xctrls.WayfinderSimpleSource.defineSubtype('WayfinderSimpleListSource');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------

TP.xctrls.WayfinderSimpleListSource.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Returns a newly initialized instance.
     * @returns {TP.xctrls.WayfinderSimpleListSource} The initialized instance.
     */

    this.callNextMethod();

    //  Just some starter data for this stub type. Subtypes will, of course,
    //  supply their own.
    this.setPrimaryEntry(TP.ac('foo', 'bar', 'baz'));

    return this;
});

//  ------------------------------------------------------------------------
//  Inspector API
//  ------------------------------------------------------------------------

TP.xctrls.WayfinderSimpleListSource.Inst.defineMethod('getConfigForWayfinder',
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

TP.xctrls.WayfinderSimpleListSource.Inst.defineMethod('getContentForWayfinder',
function(options) {

    /**
     * @method getContentForWayfinder
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

TP.xctrls.WayfinderSimpleListSource.Inst.defineMethod('getDataForWayfinder',
function(options) {

    /**
     * @method getDataForWayfinder
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

    data = TP.ac();

    targetObj.forEach(
        function(anEntry) {
            data.push(TP.ac(anEntry, anEntry));
        });

    return data;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
