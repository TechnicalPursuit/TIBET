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
//  TP.uri.URI Additions
//  ========================================================================

TP.uri.URI.addTraits(TP.sherpa.ToolAPI);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Inspector API
//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('canReuseContentForInspector',
function(options) {

    /**
     * @method canReuseContentForInspector
     * @summary Returns whether or not content hosted in an inspector bay can be
     *     'reused', even though the underlying data will change. If this
     *     returns true, then the underlying content needs to be able to respond
     *     to its data changing underneath it. It can leverage the TIBET data
     *     binding system to do this.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     check the content. This will have the following keys, amongst
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
     * @returns {Boolean} Whether or not the current content can be reused even
     *     though the underlying data is changing.
     */

    var loc,
        tabHasValue;

    //  Grab our location and see if there's already tab representing us in the
    //  inspector.
    loc = this.getLocation();
    tabHasValue = TP.byId('SherpaConsole', TP.sys.getUIRoot()).hasTabForValue(
                                                                loc);

    //  If so, then we want to return false to force the inspector bay to use
    //  whatever content we hand it. This is based on more sophisticated logic
    //  than what is inherited.
    if (tabHasValue) {
        return false;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getConfigForInspector',
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

    var loc,
        tabHasValue;

    this.callNextMethod();

    //  Initially configure the content type to be an 'html:div'.
    options.atPut(TP.ATTR + '_contenttype', 'html:div');

    //  Grab our location and see if there's already tab representing us in
    //  the inspector.
    loc = this.getLocation();
    tabHasValue = TP.byId('SherpaConsole', TP.sys.getUIRoot()).hasTabForValue(
                                                                loc);

    //  If not, then possibly reset the content type to be that for a Sherpa
    //  urieditor.
    if (!tabHasValue) {
        options.atPut(TP.ATTR + '_contenttype', 'sherpa:urieditor');
    }

    return options;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getContentForInspector',
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

    var loc,
        tabHasValue,

        dataURI,

        inspectorElem,
        uriEditorTPElem;

    //  Grab our location and see if there's already tab representing us in
    //  the inspector.
    loc = this.getLocation();
    tabHasValue = TP.byId('SherpaConsole', TP.sys.getUIRoot()).hasTabForValue(
                                                                loc);


    //  If so, then set the value of both the tabbar and the panel box to our
    //  location, causing them to switch. And return content that points the
    //  user down to the tabbar in the south drawer.
    if (tabHasValue) {
        TP.byId('SherpaConsoleTabbar', TP.sys.getUIRoot()).setValue(loc);
        TP.byId('SherpaConsolePanelbox', TP.sys.getUIRoot()).
                                                        setValue(loc);

        return TP.xhtmlnode(
                    '<div>' +
                        '...currently displayed in a TDC tab...' +
                    '</div>');
    }

    dataURI = TP.uc(options.at('bindLoc'));

    uriEditorTPElem = TP.sherpa.urieditor.getResourceElement(
                            'template',
                            TP.ietf.mime.XHTML);

    uriEditorTPElem = uriEditorTPElem.clone();

    uriEditorTPElem.setAttribute('id', 'inspectorEditor');
    uriEditorTPElem.setAttribute('bind:in', dataURI.asString());

    inspectorElem = TP.unwrap(uriEditorTPElem);

    return inspectorElem;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getContentTypeForCanvas',
function(options) {

    /**
     * @method getContentTypeForCanvas
     * @summary Returns the unique 'content type' used when inserting content
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

    return 'uri';
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getDataForInspector',
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

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getEntryAt',
function(aSourceName) {

    /**
     * @method getEntryAt
     * @summary Returns the 'entry' in the receiver for the supplied source
     *     name. This will be the singular name used to register the entry.
     * @param {String} aSourceName The name of the entry to retrieve.
     * @returns {Object} The entry object registered under the supplied source
     *     name in the receiver.
     */

    var result,

        srcName;

    result = this.getResource().get('result');

    if (TP.isType(result)) {
        return result;
    }

    if (TP.isKindOf(result, TP.core.Content)) {
        result = result.get('data');
    }

    //  Sometimes entries come in with escaped slashes. Unescape that.
    srcName = TP.stringUnescapeSlashes(aSourceName);

    if (TP.isString(result) ||
        TP.isNode(result) ||
        TP.isKindOf(result, TP.dom.Node)) {

        return this.getEntryAt(srcName);
    }

    return result.getEntryAt(srcName);
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getEntryLabel',
function(anItem) {

    /**
     * @method getEntryLabel
     * @summary Returns the 'entry label' used in the receiver for the supplied
     *     Object in the receiver.
     * @param {Object} anItem The object to return the label for.
     * @returns {String} The label to be used for the supplied item.
     */

    return anItem;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getPathPartsForInspector',
function(options) {

    /**
     * @method getPathPartsForInspector
     * @summary Returns the source's path parts that the inspector should be
     *     navigated to when it has neither a current resolver to resolve to or
     *     a path that's been supplied by the caller.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the path parts. This will have the following keys, amongst
     *     others:
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {String[]} The path parts that will navigate the inspector to
     *     the receiver.
     */

    return TP.ac('_URIS_', this.getVirtualLocation());
});

//  ------------------------------------------------------------------------
//  Toolbar API
//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getContentForToolbar',
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

    var loc,
        tabHasValue;

    //  Grab our location and see if there's already tab representing us in
    //  the inspector.
    loc = this.getLocation();
    tabHasValue = TP.byId('SherpaConsole', TP.sys.getUIRoot()).hasTabForValue(
                                                                loc);

    //  If not, then return the uri toolbar content for placement into the
    //  proper place in the inspector.
    if (!tabHasValue) {
        return TP.elem(
            '<sherpa:uriEditorToolbarContent tibet:ctrl="inspectorEditor"/>');
    }
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
