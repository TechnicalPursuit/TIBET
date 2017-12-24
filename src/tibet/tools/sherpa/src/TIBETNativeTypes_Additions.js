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
//  Function Additions
//  ========================================================================

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  API conformance - Due to a limitation in the TIBET traits system, it is not
//  possible to add traits (like TP.sherpa.ToolAPI) to builtin types.
//  ------------------------------------------------------------------------

Function.Inst.defineMethod('canReuseContentForTool',
function(toolName, options) {

    /**
     * @method canReuseContentForTool
     * @summary
     * @returns
     */

    var methodName;

    methodName = 'canReuseContentFor' + toolName.asTitleCase();
    if (TP.canInvoke(this, methodName)) {
        return this[methodName](options);
    }

    return false;
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getConfigForTool',
function(toolName, options) {

    /**
     * @method getConfigForTool
     * @summary
     * @returns
     */

    var methodName;

    methodName = 'getConfigFor' + toolName.asTitleCase();
    if (TP.canInvoke(this, methodName)) {
        return this[methodName](options);
    }

    return TP.hc();
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getContentForTool',
function(toolName, options) {

    /**
     * @method getContentForTool
     * @summary
     * @returns
     */

    var methodName;

    methodName = 'getContentFor' + toolName.asTitleCase();
    if (TP.canInvoke(this, methodName)) {
        return this[methodName](options);
    }

    //  TODO: As a fallback, we do a this.as(toolName + 'Content')
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getDataForTool',
function(toolName, options) {

    /**
     * @method getDataForTool
     * @summary
     * @returns
     */

    var methodName;

    methodName = 'getDataFor' + toolName.asTitleCase();
    if (TP.canInvoke(this, methodName)) {
        return this[methodName](options);
    }

    return null;
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getPathPartsForTool',
function(toolName, options) {

    /**
     * @method getPathPartsForTool
     * @summary
     * @returns
     */

    var methodName;

    methodName = 'getPathPartsFor' + toolName.asTitleCase();
    if (TP.canInvoke(this, methodName)) {
        return this[methodName](options);
    }
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('resolveAspectForTool',
function(toolName, anID, options) {

    /**
     * @method resolveAspectForTool
     * @summary
     * @returns
     */

    var methodName;

    methodName = 'resolveAspectFor' + toolName.asTitleCase();
    if (TP.canInvoke(this, methodName)) {
        return this[methodName](anID, options);
    }

    return null;
});

//  ------------------------------------------------------------------------
//  Inspector API
//  ------------------------------------------------------------------------

Function.Inst.defineMethod('canReuseContentForInspector',
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

    var displayName,
        tabHasValue,

        config,
        bayInspectorItem,

        firstChildElem,

        bayContentElementName;

    //  Grab our display name and see if there's already tab representing us in
    //  the inspector.
    displayName = this[TP.DISPLAY];
    tabHasValue = TP.byId('SherpaInspector', TP.win('UIROOT')).hasTabForValue(
                                                                displayName);

    //  If so, then we want to return false to force the inspector bay to use
    //  whatever content we hand it. This is based on more sophisticated logic
    //  than what is inherited.
    if (tabHasValue) {
        return false;
    }

    config = this.getConfigForInspector(options);

    bayInspectorItem = options.at('bayInspectorItem');

    if (TP.notValid(bayInspectorItem)) {
        return false;
    }

    firstChildElem = TP.nodeGetFirstChildElement(
                                bayInspectorItem.getNativeNode());

    if (!TP.isNode(firstChildElem)) {
        return false;
    }

    bayContentElementName = TP.elementGetFullName(firstChildElem);

    if (bayContentElementName === config.at('attr_contenttype')) {
        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getConfigForInspector',
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

    var displayName,
        tabHasValue;

    //  Grab our display name and see if there's already tab representing us in
    //  the inspector.
    displayName = this[TP.DISPLAY];
    tabHasValue = TP.byId('SherpaInspector', TP.win('UIROOT')).hasTabForValue(
                                                                displayName);

    if (tabHasValue) {
        //  Initially configure the content type to be an 'html:div'.
        options.atPut(TP.ATTR + '_contenttype', 'html:div');

        return options;
    }

    options.atPut(TP.ATTR + '_class', 'doublewide');
    options.atPut(TP.ATTR + '_contenttype', 'sherpa:methodeditor');

    return options;
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getContentForInspector',
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

    var displayName,
        tabHasValue,

        dataURI,
        methodEditorTPElem;

    //  Grab our display name and see if there's already tab representing us in
    //  the inspector.
    displayName = this[TP.DISPLAY];
    tabHasValue = TP.byId('SherpaInspector', TP.win('UIROOT')).hasTabForValue(
                                                                displayName);

    //  If so, then set the value of both the tabbar and the panel box to our
    //  location, causing them to switch. And return content that points the
    //  user down to the tabbar in the south drawer.
    if (tabHasValue) {
        TP.byId('SherpaConsoleTabbar', TP.win('UIROOT')).setValue(displayName);
        TP.byId('SherpaConsolePanelbox', TP.win('UIROOT')).
                                                        setValue(displayName);

        return TP.xhtmlnode(
                    '<div>' +
                        '...currently displayed in a TDC tab...' +
                    '</div>');
    }

    dataURI = TP.uc(options.at('bindLoc'));

    methodEditorTPElem = TP.sherpa.methodeditor.getResourceElement(
                            'template',
                            TP.ietf.Mime.XHTML);

    methodEditorTPElem = methodEditorTPElem.clone();

    methodEditorTPElem.setAttribute('id', 'inspectorEditor');
    methodEditorTPElem.setAttribute('bind:in', dataURI.asString());

    return TP.unwrap(methodEditorTPElem);
});

//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getDataForInspector',
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

Function.Inst.defineMethod('getPathPartsForInspector',
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

    var displayName;

    if (TP.owns(this, '$realFunc')) {
        displayName = this.$realFunc[TP.DISPLAY];
    } else if (TP.owns(this, '$resolutionMethod')) {
        displayName = this.$resolutionMethod[TP.DISPLAY];
    } else {
        displayName = this[TP.DISPLAY];
    }

    return TP.ac('_METHOD_', displayName);
});

//  ------------------------------------------------------------------------
//  Toolbar API
//  ------------------------------------------------------------------------

Function.Inst.defineMethod('getContentForToolbar',
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

    var displayName,
        tabHasValue;

    //  Grab our display name and see if there's already tab representing us in
    //  the inspector.
    displayName = this[TP.DISPLAY];
    tabHasValue = TP.byId('SherpaInspector', TP.win('UIROOT')).hasTabForValue(
                                                                displayName);

    //  If not, then return the uri toolbar content for placement into the
    //  proper place in the inspector.
    if (!tabHasValue) {
        return TP.elem('<sherpa:methodEditorToolbarContent' +
                        ' tibet:ctrl="inspectorEditor"/>');
    }
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
