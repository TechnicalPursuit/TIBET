//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  ------------------------------------------------------------------------
//  TP.* wrappers
//  ------------------------------------------------------------------------

TP.definePrimitive('canReuseContentForTool',
function(anObject, toolName, options) {

    if (TP.canInvoke(anObject, 'canReuseContentForTool')) {
        return anObject.canReuseContentForTool(toolName, options);
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getConfigForTool',
function(anObject, toolName, options) {

    if (TP.canInvoke(anObject, 'getConfigForTool')) {
        return anObject.getConfigForTool(toolName, options);
    }

    return TP.hc();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getContentForTool',
function(anObject, toolName, options) {

    if (TP.canInvoke(anObject, 'getContentForTool')) {
        return anObject.getContentForTool(toolName, options);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getContentTypeForTool',
function(anObject, toolName, options) {

    if (TP.canInvoke(anObject, 'getContentTypeForTool')) {
        return anObject.getContentTypeForTool(toolName, options);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getDataForTool',
function(anObject, toolName, options) {

    if (TP.canInvoke(anObject, 'getDataForTool')) {
        return anObject.getDataForTool(toolName, options);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getFinalTargetForTool',
function(anObject, toolName, options) {

    if (TP.canInvoke(anObject, 'getFinalTargetForTool')) {
        return anObject.getFinalTargetForTool(toolName, options);
    }

    return anObject;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getPathPartsForTool',
function(anObject, toolName, options) {

    if (TP.canInvoke(anObject, 'getPathPartsForTool')) {
        return anObject.getPathPartsForTool(toolName, options);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('resolveAspectForTool',
function(anObject, toolName, anID, options) {

    if (TP.canInvoke(anObject, 'resolveAspectForTool')) {
        return anObject.resolveAspectForTool(toolName, anID, options);
    }

    return null;
});

//  ------------------------------------------------------------------------
//  Assistant
//  ------------------------------------------------------------------------

TP.definePrimitive('getContentForAssistant',
function(anObject) {

    if (TP.canInvoke(anObject, 'getContentForAssistant')) {
        return anObject.getContentForAssistant();
    }

    return null;
});

//  ------------------------------------------------------------------------
//  Editor
//  ------------------------------------------------------------------------

TP.definePrimitive('getDefaultEditingAspect',
function(anObject) {

    if (TP.canInvoke(anObject, 'getDefaultEditingAspect')) {
        return anObject.getDefaultEditingAspect();
    }

    return null;
});

//  ------------------------------------------------------------------------
//  Tool API traits
//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('sherpa.ToolAPI');

//  ------------------------------------------------------------------------

TP.sherpa.ToolAPI.Inst.defineMethod('canReuseContentForTool',
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

TP.sherpa.ToolAPI.Inst.defineMethod('getConfigForTool',
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

TP.sherpa.ToolAPI.Inst.defineMethod('getContentForTool',
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

TP.sherpa.ToolAPI.Inst.defineMethod('getContentTypeForTool',
function(toolName, options) {

    /**
     * @method getContentTypeForTool
     * @summary
     * @returns
     */

    var methodName;

    methodName = 'getContentTypeFor' + toolName.asTitleCase();
    if (TP.canInvoke(this, methodName)) {
        return this[methodName](options);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.sherpa.ToolAPI.Inst.defineMethod('getDataForTool',
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

TP.sherpa.ToolAPI.Inst.defineMethod('getFinalTargetForTool',
function(toolName, options) {

    /**
     * @method getFinalTargetForTool
     * @summary
     * @returns
     */

    var methodName;

    methodName = 'getFinalTargetFor' + toolName.asTitleCase();
    if (TP.canInvoke(this, methodName)) {
        return this[methodName](options);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.ToolAPI.Inst.defineMethod('getPathPartsForTool',
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

    return null;
});

//  ------------------------------------------------------------------------

TP.sherpa.ToolAPI.Inst.defineMethod('resolveAspectForTool',
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

TP.sherpa.ToolAPI.Inst.defineMethod('canReuseContentForInspector',
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

    //  We return false here because, since we generate unique content with the
    //  data embedded (see the 'getContentForInspector' method for this type),
    //  we cannot reuse content.
    return false;
});

//  ------------------------------------------------------------------------

TP.sherpa.ToolAPI.Inst.defineMethod('getConfigForInspector',
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

    var targetAspect;

    targetAspect = options.at('targetAspect');

    if (targetAspect === this.getID()) {
        options.atPut(TP.ATTR + '_contenttype', 'xctrls:list');
    } else {
        options.atPut(TP.ATTR + '_contenttype', 'html:div');
    }

    return options;
});

//  ------------------------------------------------------------------------

TP.sherpa.ToolAPI.Inst.defineMethod('getContentForInspector',
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

    var targetAspect,

        data,
        dataURI,

        contentElem;

    targetAspect = options.at('targetAspect');

    if (targetAspect === this.getID()) {

        data = this.getDataForInspector(options);

        dataURI = TP.uc(options.at('bindLoc'));
        dataURI.setResource(data,
                            TP.request('signalChange', false));

        contentElem = TP.elem('<xctrls:list bind:in="{data: ' +
                                dataURI.asString() +
                                '}"/>');
    } else {

        contentElem = TP.xhtmlnode(
                    '<div>' +
                        '<textarea>' +
                            '<![CDATA[' + this.get(targetAspect) + ']]>' +
                        '</textarea>' +
                    '</div>');

        if (!TP.isElement(contentElem)) {

            contentElem = TP.xhtmlnode(
                    '<div>' +
                        '<textarea>' +
                            TP.xmlLiteralsToEntities(this.get(targetAspect)) +
                        '</textarea>' +
                    '</div>');
        }
    }

    return contentElem;
});

//  ------------------------------------------------------------------------

TP.sherpa.ToolAPI.Inst.defineMethod('getDataForInspector',
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

    var thisref,
        data;

    thisref = this;

    data = TP.ac();
    this.getKeys().sort().perform(
        function(aKey) {
            data.add(TP.ac(aKey, TP.id(thisref.get(aKey))));
        });

    return data;
});

//  ------------------------------------------------------------------------

TP.sherpa.ToolAPI.Inst.defineMethod('resolveAspectForInspector',
function(anAspect, options) {

    /**
     * @method resolveAspectForInspector
     * @summary Returns the object that is produced when resolving the aspect
     *     against the receiver. This common supertype returns null, since
     *     that's the 'default' to not allow the inspector to browse further.
     * @param {String} anAspect The aspect to resolve against the receiver to
     *     produce the return value.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the configuration data. This will have the following keys,
     *     amongst others:
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {null} This type returns null, stopping the inspector from
     *     browsing further.
     */

    return null;
});

//  ------------------------------------------------------------------------
//  Context Menu API
//  ------------------------------------------------------------------------

TP.sherpa.ToolAPI.Inst.defineMethod('getContentForContextMenu',
function(options) {

    /**
     * @method getContentForContextMenu
     * @summary Returns the source's content that will be hosted in a Sherpa
     *     context menu.
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
     *     context menu.
     */

    var halo,
        generator;

    halo = TP.byId('SherpaHalo', TP.win('UIROOT'));

    generator = this.getNearestHaloGenerator(halo);

    if (TP.isKindOf(generator, TP.tag.CompiledTag)) {
        return TP.elem('<sherpa:compiledTagContextMenuContent/>');
    }

    return TP.elem('<sherpa:elementContextMenuContent/>');
});

//  ------------------------------------------------------------------------
//  Toolbar API
//  ------------------------------------------------------------------------

TP.sherpa.ToolAPI.Inst.defineMethod('getContentForToolbar',
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

    return null;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
