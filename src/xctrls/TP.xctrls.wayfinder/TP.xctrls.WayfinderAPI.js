//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 * @type {TP.xctrls.WayfinderSource}
 */

//  ========================================================================
//  Primitives
//  ========================================================================

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

TP.definePrimitive('getChildTypeForTool',
function(anObject, toolName, options) {

    if (TP.canInvoke(anObject, 'getChildTypeForTool')) {
        return anObject.getChildTypeForTool(toolName, options);
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

TP.definePrimitive('getResolverForTool',
function(anObject, toolName, anID, options) {

    if (TP.canInvoke(anObject, 'getResolverForTool')) {
        return anObject.getResolverForTool(toolName, anID, options);
    }

    return null;
});

//  ========================================================================
//  API Object
//  ========================================================================

TP.lang.Object.defineSubtype('TP.xctrls.WayfinderAPI');

//  ------------------------------------------------------------------------

TP.xctrls.WayfinderAPI.Inst.defineMethod('canReuseContentForTool',
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

TP.xctrls.WayfinderAPI.Inst.defineMethod('getConfigForTool',
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

TP.xctrls.WayfinderAPI.Inst.defineMethod('getContentForTool',
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

TP.xctrls.WayfinderAPI.Inst.defineMethod('getChildTypeForTool',
function(toolName, options) {

    /**
     * @method getChildTypeForTool
     * @summary
     * @returns
     */

    var methodName;

    methodName = 'getChildTypeFor' + toolName.asTitleCase();
    if (TP.canInvoke(this, methodName)) {
        return this[methodName](options);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.xctrls.WayfinderAPI.Inst.defineMethod('getDataForTool',
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

TP.xctrls.WayfinderAPI.Inst.defineMethod('getFinalTargetForTool',
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

TP.xctrls.WayfinderAPI.Inst.defineMethod('getPathPartsForTool',
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

TP.xctrls.WayfinderAPI.Inst.defineMethod('getResolverForTool',
function(toolName, anID, options) {

    /**
     * @method getResolverForTool
     * @summary
     * @returns
     */

    var methodName;

    methodName = 'getResolverFor' + toolName.asTitleCase();
    if (TP.canInvoke(this, methodName)) {
        return this[methodName](anID, options);
    }

    return null;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
