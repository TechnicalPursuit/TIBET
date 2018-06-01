//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/*
While we'd like to use polymorphic interfaces for everything (ie. just
messaging whatever value we might have) the browser environment doesn't
allow that -- too many issues arise around the fact that null/undefined
aren't objects, ActiveX controls show up now and again, etc. As a result
it's necessary to have a way to leverage OO while avoiding the fact that
you can't be sure a return value can respond to your query.

The functions here help encapsulate TIBET's common operations in the form
of easy-to-type functions with a $ prefix signifying a global function.
*/

//  ------------------------------------------------------------------------
//  SHORTCUT UTILITIES
//  ------------------------------------------------------------------------

TP.definePrimitive('context',
function(varargs) {

    /**
     * @method context
     * @summary Returns a useful context for constraining a search for one or
     *     more elements. This operation is used during the various TP.by*
     *     calls to try to optimize lookup times. Typical arguments include
     *     windows, documents, or elements which might be used to root a search.
     *     The first true element found is returned, followed by the best
     *     documentElement possible.
     * @param {arguments} varargs Zero or more valid objects or IDs to choose
     *     between.
     * @returns {Document|Element} The best search root.
     */

    var len,
        i,
        obj,
        doc,
        win,
        context;

    len = arguments.length;
    for (i = 0; i < len; i++) {
        obj = TP.unwrap(arguments[i]);
        if (TP.isString(obj)) {
            win = TP.sys.getWindowById(obj);
            if (TP.notValid(win)) {
                win = TP.sys.getWindowById(obj, TP.sys.getUICanvas(true));
            }

            if (TP.isWindow(win)) {
                doc = TP.doc(win);
                if (TP.isDocument(doc)) {
                    return doc;
                }
            }
        } else if (TP.isElement(obj)) {
            return obj;
        } else if (TP.isTextNode(obj) ||
                    TP.isCDATASectionNode(obj) ||
                    TP.isCommentNode(obj)) {
            return obj.parentNode;
        } else if (TP.isNode(obj) || TP.isWindow(obj)) {
            doc = TP.doc(obj);
            if (TP.isDocument(doc)) {
                return doc;
            }
        }
    }

    if (TP.notValid(context)) {
        context = TP.isWindow(win) ? win :
            TP.sys.getWindowById(TP.sys.getUICanvasName());
    }

    //  don't want windows as search roots, only documents or elements
    if (TP.isWindow(context)) {
        context = context.document;
    }

    return context;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('idcall',
function(aMethodName, elemOrId, nodeContext, varargs) {

    /**
     * @method idcall
     * @summary Messages the element in question, if possible. The element is
     *     acquired and wrapped, and then the resulting wrapper's method is
     *     invoked if possible, otherwise the method is attempted on the
     *     unwrapped element directly.
     * @param {String} aMethodName The name of a method on the TP object (i.e.
     *     'nodeGetElementsByTagName');.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @param {arguments} varargs Optional additional arguments to pass to the
     *     method.
     * @returns {Object} The results of the method invocation, or an array of
     *     such results.
     */

    var obj,

        elem,
        arglist,
        arr,
        len,
        i,
        item,
        wrapper;

    if (TP.notValid(elemOrId)) {
        obj = TP.sys.getWindowById(TP.sys.getUICanvasName());
    } else {
        obj = elemOrId;
    }

    //  use a combination of element and context to find the focal
    //  element(s) for the call
    elem = TP.isString(obj) ?
                TP.byId(obj, TP.context(nodeContext), false) :
                TP.elem(obj);

    arglist = TP.args(arguments, 3);

    if (TP.isArray(elem)) {
        arr = TP.ac();
        len = elem.getSize();

        for (i = 0; i < len; i++) {
            item = elem.at(i);

            if (TP.isElement(item)) {
                wrapper = TP.wrap(item);

                if (TP.canInvoke(wrapper, aMethodName)) {
                    arr.push(wrapper[aMethodName].apply(wrapper, arglist));
                } else if (TP.canInvoke(item, aMethodName)) {
                    arr.push(item[aMethodName].apply(item, arglist));
                }
            }
        }

        return arr;
    } else if (TP.isElement(elem)) {
        wrapper = TP.wrap(elem);

        if (TP.canInvoke(wrapper, aMethodName)) {
            return wrapper[aMethodName].apply(wrapper, arglist);
        } else if (TP.canInvoke(item, aMethodName)) {
            return item[aMethodName].apply(item, arglist);
        }
    }

    return elem;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('tpcall',
function(aMethodName, elemOrId, nodeContext, varargs) {

    /**
     * @method tpcall
     * @summary A common wrapper for calling a TP primitive with an optional
     *     root element, an optional canvas context, and one or more optional
     *     arguments to forward to the method being invoked.
     * @param {String} aMethodName The name of a method on the TP object (i.e.
     *     'nodeGetElementsByTagName');.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @param {arguments} varargs Optional additional arguments to pass to the
     *     method.
     * @returns {Object} The results of the method invocation, or an array of
     *     such results.
     */

    var obj,

        elem,
        arglist,
        arr,
        len,
        i,
        item;

    if (TP.notValid(elemOrId)) {
        obj = TP.sys.getWindowById(TP.sys.getUICanvasName());
    } else {
        obj = elemOrId;
    }

    //  use a combination of element and context to find the focal
    //  element(s) for the call
    elem = TP.isString(obj) ?
                TP.byId(obj, TP.context(nodeContext), false) :
                TP.elem(obj);

    arglist = TP.args(arguments, 3);
    arglist.unshift(null);              //  make room on front for item

    if (TP.isArray(elem)) {
        arr = TP.ac();
        len = elem.getSize();

        for (i = 0; i < len; i++) {
            item = elem.at(i);

            if (TP.isElement(item)) {
                if (TP.canInvoke(TP, aMethodName)) {
                    arglist[0] = item;
                    arr.push(TP[aMethodName].apply(TP, arglist));
                } else {
                    //  not a TP primitive apparently
                    break;
                }
            }
        }

        return arr;
    } else if (TP.isValid(elem)) {
        arglist[0] = elem;

        return TP[aMethodName].apply(TP, arglist);
    }

    return elem;
});

//  ------------------------------------------------------------------------
//  QUERY SHORTCUTS
//  ------------------------------------------------------------------------

TP.definePrimitive('byContent',
function(textOrRegExp, nodeContext, autoCollapse) {

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('byCSSPath',
function(cssExpr, nodeContext, autoCollapse, shouldWrap) {

    /**
     * @method byCSSPath
     * @summary Returns the result of running a TP.nodeEvaluateCSS() call using
     *     the context provided, or the current window's document.
     * @param {String} cssExpr The CSS expression to use for the query.
     * @param {Object} nodeContext A context in which to resolve the CSS
     *     query.
     *     Default is the current canvas.
     * @param {Boolean} [autoCollapse=false] Whether to collapse Array results
     *     if there's only one item in them.
     * @param {Boolean} [shouldWrap=true] Whether or not the results should
     *     wrapped into a TIBET wrapper object.
     * @exception TP.sig.InvalidString
     * @returns {TP.dom.ElementNode|Element|Array<Element,TP.dom.ElementNode>}
     *     The Array of matched wrapped elements or unwrapped elements or a
     *     single wrapped or unwrapped element if single-item Arrays are being
     *     collapsed.
     */

    var node;

    if (TP.notValid(cssExpr)) {
        return TP.raise(TP.byCSSPath, 'TP.sig.InvalidString',
                        'Empty CSS expression not allowed.');
    }

    node = TP.context(nodeContext);

    if (TP.isFalse(shouldWrap)) {
        return TP.nodeEvaluateCSS(node, cssExpr, autoCollapse);
    }

    return TP.wrap(TP.nodeEvaluateCSS(node, cssExpr, autoCollapse));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('byId',
function(anID, nodeContext, shouldWrap) {

    /**
     * @method byId
     * @summary Returns the result of running a TP.nodeGetElementById() call
     *     using the context provided, or the current window's document.
     * @param {String} anID The ID to search for.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @param {Boolean} [shouldWrap=true] Whether or not the results should
     *     wrapped into a TIBET wrapper object.
     * @exception TP.sig.InvalidID
     * @returns {TP.dom.ElementNode|Element|Array<Element,TP.dom.ElementNode}
     *     The wrapped element, unwrapped element, if found, or an array when
     *     more than one ID was provided.
     */

    var id,
        node,

        list,
        len,

        arr,
        i;

    if (TP.notValid(anID)) {
        return TP.raise(TP.byId, 'TP.sig.InvalidID',
                                                'Empty ID not allowed.');
    }

    if (TP.isNode(anID)) {
        return anID;
    }

    if (TP.isWindow(anID)) {
        return anID.document;
    }

    if (TP.isNodeList(anID)) {
        if (TP.isArray(anID)) {
            return anID;
        }

        return TP.ac(anID);
    }

    if (TP.regex.HAS_PERIOD.test(anID)) {
        TP.raise(TP.byId, 'TP.sig.InvalidID', 'Path-style IDs not allowed.');
        return;
    }

    id = TP.str(anID);
    node = TP.context(nodeContext);
    if (TP.notValid(node)) {
        node = TP.sys.getUICanvas();
    }

    //  allow either string or array as ID definition, but turn into an
    //  array of 1 or more IDs to locate
    list = TP.isString(id) ? id.split(' ') : id;
    len = list.getSize();

    if (len > 1) {
        arr = TP.ac();
        for (i = 0; i < len; i++) {
            if (TP.isFalse(shouldWrap)) {
                arr.atPut(i, TP.nodeGetElementById(node, list.at(i), true));
            } else {
                arr.atPut(i, TP.wrap(
                                TP.nodeGetElementById(node, list.at(i), true)));
            }
        }

        //  remove nulls for any IDs not found and hook contents
        return arr.compact();
    } else {
        //  NOTE we force XPath usage when not found and XML
        if (TP.isFalse(shouldWrap)) {
            return TP.nodeGetElementById(node, id, true);
        } else {
            return TP.wrap(TP.nodeGetElementById(node, id, true));
        }
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('bySystemId',
function(anID, nodeContext) {

    /**
     * @method bySystemId
     * @summary A convenience wrapper for the TP.sys.getObjectById() call.
     *     NOTE: unlike the other TP.by* calls this function begins its search
     *     with the TIBET object registry and proceeds to check the UI
     *     canvas/context only after registrations and other sources have been
     *     tested. Use TP.byId() if you are focused on the UI only.
     * @param {String|String[]} anID The ID to search for. NOTE: one advantage
     *     of this call is that the ID can be either a String or an Array. In
     *     String form a space-separated list becomes an array.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {TP.lang.Object[]} An array of TP.lang.Objects sharing the name
     *     provided.
     */

    var id,
        context,

        list,
        len,

        arr,
        i;

    id = TP.str(anID);
    context = TP.context(nodeContext);
    if (TP.notValid(context)) {
        context = TP.sys.getUICanvas();
    }

    list = TP.isString(id) ? id.split(' ') : id;
    len = list.getSize();

    if (len > 1) {
        arr = TP.ac();
        for (i = 0; i < len; i++) {
            arr.atPut(i, TP.sys.getObjectById(list.at(i), false, context));
        }

        //  remove nulls from the result set
        return arr.compact();
    } else {
        return TP.sys.getObjectById(id, false, context);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('byPath',
function(pathExpr, nodeContext, autoCollapse, shouldWrap) {

    /**
     * @method byPath
     * @summary Returns the result of running a TP.nodeEvaluatePath() call
     *     using the context provided, or the current window's document.
     * @param {String} pathExpr The path expression to use for the query.
     * @param {Object} nodeContext A context in which to resolve the path
     *     query.
     *     Default is the current canvas.
     * @param {Boolean} [autoCollapse=false] Whether to collapse Array results
     *     if there's only one item in them.
     * @param {Boolean} [shouldWrap=true] Whether or not the results should
     *     wrapped into a TIBET wrapper object.
     * @exception TP.sig.InvalidString
     * @returns {TP.dom.ElementNode|Element|Array<Element,TP.dom.ElementNode>}
     *     The Array of matched wrapped elements or unwrapped elements or a
     *     single wrapped or unwrapped element if single-item Arrays are being
     *     collapsed.
     */

    var node;

    if (TP.notValid(pathExpr)) {
        return TP.raise(TP.byPath, 'TP.sig.InvalidString',
                        'Empty path expression not allowed.');
    }

    node = TP.context(nodeContext);

    if (TP.isFalse(shouldWrap)) {
        return TP.nodeEvaluatePath(node, pathExpr, null, autoCollapse);
    }

    return TP.wrap(TP.nodeEvaluatePath(node, pathExpr, null, autoCollapse));
});

//  ------------------------------------------------------------------------
//  ATTRIBUTE SHORTCUTS
//  ------------------------------------------------------------------------

TP.definePrimitive('addAttr',
function(elemOrId, attrName, attrValue, checkAttrNSURI, nodeContext) {

    /**
     * @method addAttr
     * @summary A convenience wrapper for TP.elementAddAttributeValue. The
     *     element definition is resolved via TP.byId(). The resulting
     *     element(s) are then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} attrName The attribute name value to find, with optional
     *     NS: prefix.
     * @param {String} attrValue The attribute value to add.
     * @param {Boolean} [checkAttrNSURI=false] True will cause this method to be
     *     more rigorous in its checks for prefixed attributes, looking via
     *     internal TIBET mechanisms in addition to the standard platform
     *     mechanism. The default is false (to keep things faster).
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     */

    return TP.tpcall(
                'elementAddAttributeValue',
                elemOrId, nodeContext, attrName, attrValue, checkAttrNSURI);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getAttr',
function(elemOrId, attrName, checkAttrNSURI, nodeContext) {

    /**
     * @method getAttr
     * @summary A convenience wrapper for TP.elementGetAttribute. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} attrName The attribute name value to find, with optional
     *     NS: prefix.
     * @param {Boolean} [checkAttrNSURI=false] True will cause this method to be
     *     more rigorous in its checks for prefixed attributes, looking via
     *     internal TIBET mechanisms in addition to the standard platform
     *     mechanism. The default is false (to keep things faster).
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {String} The attribute value, if found or null if the element
     *     couldn't be obtained.
     */

    return TP.tpcall('elementGetAttribute',
                        elemOrId, nodeContext, attrName, checkAttrNSURI);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('hasAttr',
function(elemOrId, attrName, checkAttrNSURI, nodeContext) {

    /**
     * @method hasAttr
     * @summary A convenience wrapper for TP.elementHasAttribute. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} attrName The attribute name value to find, with optional
     *     NS: prefix.
     * @param {Boolean} [checkAttrNSURI=false] True will cause this method to be
     *     more rigorous in its checks for prefixed attributes, looking via
     *     internal TIBET mechanisms in addition to the standard platform
     *     mechanism. The default is false (to keep things faster).
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Boolean} True if the attribute exists.
     */

    return TP.tpcall('elementHasAttribute',
                        elemOrId, nodeContext, attrName, checkAttrNSURI);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('removeAttr',
function(elemOrId, attrName, checkAttrNSURI, nodeContext) {

    /**
     * @method removeAttr
     * @summary A convenience wrapper for TP.elementRemoveAttribute. The
     *     element definition is resolved via TP.byId(). The resulting
     *     element(s) are then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} attrName The attribute name value to remove, with
     *     optional NS: prefix.
     * @param {Boolean} [checkAttrNSURI=false] True will cause this method to be
     *     more rigorous in its checks for prefixed attributes, looking via
     *     internal TIBET mechanisms in addition to the standard platform
     *     mechanism. The default is false (to keep things faster).
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     */

    return TP.tpcall('elementRemoveAttribute',
                        elemOrId, nodeContext, attrName, checkAttrNSURI);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('replaceAttr',
function(elemOrId, attrName, oldValue, newValue, checkAttrNSURI, nodeContext) {

    /**
     * @method replaceAttr
     * @summary A convenience wrapper for TP.elementReplaceAttributeValue. The
     *     element definition is resolved via TP.byId(). The resulting
     *     element(s) are then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} attrName The attribute name value to set, with optional
     *     NS: prefix.
     * @param {String} oldValue The attribute value to find.
     * @param {String} newValue The attribute value to set.
     * @param {Boolean} [checkAttrNSURI=false] True will cause this method to be
     *     more rigorous in its checks for prefixed attributes, looking via
     *     internal TIBET mechanisms in addition to the standard platform
     *     mechanism. The default is false (to keep things faster).
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     */

    return TP.tpcall(
        'elementReplaceAttributeValue',
        elemOrId, nodeContext, attrName, oldValue, newValue, checkAttrNSURI);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('setAttr',
function(elemOrId, attrName, attrValue, checkAttrNSURI, nodeContext) {

    /**
     * @method setAttr
     * @summary A convenience wrapper for TP.elementSetAttribute. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} attrName The attribute name value to set, with optional
     *     NS: prefix.
     * @param {String} attrValue The attribute value to set.
     * @param {Boolean} [checkAttrNSURI=false] True will cause this method to be
     *     more rigorous in its checks for prefixed attributes, looking via
     *     internal TIBET mechanisms in addition to the standard platform
     *     mechanism. The default is false (to keep things faster).
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     */

    return TP.tpcall(
                'elementSetAttribute',
                elemOrId, nodeContext, attrName, attrValue, checkAttrNSURI);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('toggleAttr',
function(elemOrId, attrName, nodeContext) {

    /**
     * @method toggleAttr
     * @summary A convenience wrapper which will toggle a Boolean attribute,
     *     meaning that if the attribute is currently set to 'true' it will be
     *     toggled to 'false' and vice versa. If the attribute is not present
     *     the value is considered to be 'false' and a new attribute is added
     *     with a value of 'true'. The element definition is resolved via
     *     TP.byId(). The resulting element(s) are then used as roots for the
     *     operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} attrName The attribute name value to set, with optional
     *     NS: prefix.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     */

    var value;

    value = TP.bc(TP.getAttr(elemOrId, nodeContext, attrName));

    if (value) {
        return TP.tpcall('elementSetAttribute',
                            elemOrId, nodeContext, attrName, 'false');
    } else {
        return TP.tpcall('elementSetAttribute',
                            elemOrId, nodeContext, attrName, 'true');
    }
});

//  ------------------------------------------------------------------------
//  CLASS SHORTCUTS
//  ------------------------------------------------------------------------

TP.definePrimitive('addClass',
function(elemOrId, className, nodeContext) {

    /**
     * @method addClass
     * @summary A convenience wrapper for TP.elementAddClass. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} className The class value to add.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     */

    return TP.tpcall('elementAddClass',
                        elemOrId, nodeContext, className);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getClass',
function(elemOrId, nodeContext) {

    /**
     * @method getClass
     * @summary A convenience wrapper for TP.elementGetClass. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {String} An potentially space-separated string of class names.
     */

    return TP.tpcall('elementGetClass',
                        elemOrId, nodeContext);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('hasClass',
function(elemOrId, className, nodeContext) {

    /**
     * @method hasClass
     * @summary A convenience wrapper for TP.elementHasClass. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} className The class value to check.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Boolean} True if the element has the named class.
     */

    return TP.tpcall('elementHasClass',
                        elemOrId, nodeContext, className);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('removeClass',
function(elemOrId, className, nodeContext) {

    /**
     * @method removeClass
     * @summary A convenience wrapper for TP.elementRemoveClass. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} className The class value to remove.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     */

    return TP.tpcall('elementRemoveClass',
                        elemOrId, nodeContext, className);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('replaceClass',
function(elemOrId, oldClass, newClass, nodeContext) {

    /**
     * @method replaceClass
     * @summary A convenience wrapper for TP.elementReplaceClass. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} oldClass The class value to find.
     * @param {String} newClass The class value to set.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     */

    return TP.tpcall('elementReplaceClass',
                        elemOrId, nodeContext, oldClass, newClass);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('setClass',
function(elemOrId, className, nodeContext) {

    /**
     * @method setClass
     * @summary A convenience wrapper for TP.elementSetClass. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} className The class value to set.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     */

    return TP.tpcall('elementSetClass',
                        elemOrId, nodeContext, className);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('toggleClass',
function(elemOrId, className, nodeContext) {

    /**
     * @method toggleClass
     * @summary A convenience wrapper which will toggle a class, meaning that
     *     if the class is present it is removed, and if it's not present it
     *     will be added. The element definition is resolved via TP.byId(). The
     *     resulting element(s) are then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} className The class value to toggle.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     */

    if (TP.hasClass(elemOrId, nodeContext, className)) {
        return TP.tpcall('elementRemoveClass',
                            elemOrId, nodeContext, className);
    } else {
        return TP.tpcall('elementAddClass',
                            elemOrId, nodeContext, className);
    }
});

//  ------------------------------------------------------------------------
//  CONTENT SHORTCUTS
//  ------------------------------------------------------------------------

TP.definePrimitive('addContent',
function(elemOrId, newContent, aRequest, nodeContext) {

    /**
     * @method addContent
     * @summary A convenience wrapper for TP.dom.Node's addContent call. The
     *     element definition is resolved via TP.byId(). The resulting
     *     element(s) are then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} newContent A new content string, node, or other suitable
     *     content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     */

    return TP.idcall('addContent',
                        elemOrId, nodeContext, newContent, aRequest);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getContent',
function(elemOrId, nodeContext) {

    /**
     * @method getContent
     * @summary A convenience wrapper for TP.dom.Node's getContent call. The
     *     element definition is resolved via TP.byId(). The resulting
     *     element(s) are then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     */

    return TP.idcall('getContent', elemOrId, nodeContext);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('insertContent',
function(elemOrId, newContent, aLocation, aRequest, nodeContext) {

    /**
     * @method insertContent
     * @summary A convenience wrapper for TP.dom.Node's insertContent call.
     *     The element definition is resolved via TP.byId(). The resulting
     *     element(s) are then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} newContent A new content string, node, or other suitable
     *     content.
     * @param {String} aLocation A TP location constant such as:
     *     TP.BEFORE_BEGIN, TP.AFTER_BEGIN, TP.AFTER_END, or TP.BEFORE_END (the
     *     default).
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     */

    return TP.idcall('insertContent',
                    elemOrId, nodeContext, newContent, aLocation, aRequest);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('removeContent',
function(elemOrId, nodeContext) {

    /**
     * @method removeContent
     * @summary A convenience wrapper for TP.dom.CollectionNode's empty call.
     *     The element definition is resolved via TP.byId(). The resulting
     *     element(s) are then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     */

    return TP.idcall('empty', elemOrId, nodeContext);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('setContent',
function(elemOrId, newContent, aRequest, nodeContext) {

    /**
     * @method setContent
     * @summary A convenience wrapper for TP.dom.Node's setContent call. The
     *     element definition is resolved via TP.byId(). The resulting
     *     element(s) are then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} newContent A new content string, node, or other suitable
     *     content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     */

    return TP.idcall('setContent',
                        elemOrId, nodeContext, newContent, aRequest);
});

//  ------------------------------------------------------------------------
//  ELEMENT SHORTCUTS
//  ------------------------------------------------------------------------

TP.definePrimitive('removeElem',
function(elemOrId, nodeContext) {

    /**
     * @method removeElem
     * @summary Removes an element from the DOM. This method operates by
     *     locating the element's parentNode and asking it to remove the child.
     *     The element definition is resolved via TP.byId(). The resulting
     *     element(s) are then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     */

    var elem,
        len,
        i,
        ancestor;

    elem = TP.byId(elemOrId, TP.context(nodeContext));

    if (TP.isArray(elem)) {
        len = elem.length;
        for (i = 0; i < len; i++) {
            ancestor = elem[i].parentNode;
            if (TP.isElement(ancestor)) {
                return TP.nodeRemoveChild(ancestor, elem[i]);
            }
        }
    } else {
        ancestor = elem.parentNode;
        if (TP.isElement(ancestor)) {
            return TP.nodeRemoveChild(ancestor, elem);
        }
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('replaceElem',
function(oldElemOrId, newElemOrId, nodeContext) {

    /**
     * @method replaceElem
     * @summary Removes an element from the DOM. This method operates by
     *     locating the element's parentNode and asking it to remove the child.
     *     The element definition is resolved via TP.byId(). The resulting
     *     element(s) are then used as roots for the operation.
     * @param {String|Element} oldElemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String|Element} newElemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     */

    var elem,
        newelem,

        len,
        i;

    elem = TP.byId(oldElemOrId, TP.context(nodeContext), false);
    newelem = TP.byId(newElemOrId, TP.context(nodeContext), false);

    if (TP.isArray(newelem)) {
        return TP.raise(this, 'TP.sig.InvalidParameter',
                            'New element must be single ID or element');
    }

    if (TP.isArray(elem)) {
        len = elem.length;
        for (i = 0; i < len; i++) {
            return TP.elementReplaceWith(
                                elem[i], TP.nodeCloneNode(newelem));
        }
    } else {
        return TP.elementReplaceWith(elem, newelem);
    }
});

//  ------------------------------------------------------------------------
//  STYLE STRING SHORTCUTS
//  ------------------------------------------------------------------------

/**
 * @NOTE NOTE NOTE:
 *
 *     Manipulating the style property directly using these methods is STRONGLY
 *     DISCOURAGED except during animation or effect processing. For "permanent"
 *     alterations to an element's style you should be leveraging a CSS id,
 *     classor attribute selector and manipulating the element's class/attribute
 *     values.
 *
 *     ALSO, if you are going to animate or alter an element's style you may
 *     wantto wrap your calls in a $preserveStyle/$restoreStyle pair so any
 *     valueswhich might have existed are reset on completion.
 */

//  ------------------------------------------------------------------------

TP.definePrimitive('addStyle',
function(elemOrId, aProperty, aValue, nodeContext) {

    /**
     * @method addStyle
     * @summary A convenience wrapper for TP.elementAddStyleValue. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} aProperty The style property to modify.
     * @param {String} aValue The property value to add.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     */

    return TP.tpcall('elementAddStyleValue',
                        elemOrId, nodeContext, aProperty, aValue);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getStyle',
function(elemOrId, aProperty, nodeContext) {

    /**
     * @method getStyle
     * @summary A convenience wrapper for TP.elementGetStyleString. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} aProperty The style property to get. Default is empty,
     *     which returns the entire style string.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {String} A CSS style string.
     */

    return TP.tpcall('elementGetStyleString', elemOrId, nodeContext, aProperty);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('hasStyle',
function(elemOrId, aProperty, nodeContext) {

    /**
     * @method hasStyle
     * @summary A convenience wrapper for TP.elementHasStyleString. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} aProperty The style property to get. Default is empty,
     *     which returns the entire style string.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Boolean} True if the element has inline style with the property
     *     name, or inline style.
     */

    return TP.tpcall('elementHasStyleString', elemOrId, nodeContext, aProperty);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('preserveStyle',
function(elemOrId, nodeContext) {

    /**
     * @method preserveStyle
     * @summary A convenience wrapper for TP.elementPreserveStyle. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     */

    return TP.tpcall('elementPreserveStyle', elemOrId, nodeContext);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('removeStyle',
function(elemOrId, aProperty, nodeContext) {

    /**
     * @method removeStyle
     * @summary A convenience wrapper for TP.elementRemoveStyleValue. The
     *     element definition is resolved via TP.byId(). The resulting
     *     element(s) are then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} aProperty The style property to remove.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     */

    return TP.tpcall('elementRemoveStyleValue',
                        elemOrId, nodeContext, aProperty);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('replaceStyle',
function(elemOrId, aProperty, oldStyle, newStyle, nodeContext) {

    /**
     * @method replaceStyle
     * @summary A convenience wrapper for TP.elementReplaceStyleValue. The
     *     element definition is resolved via TP.byId(). The resulting
     *     element(s) are then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} aProperty The style property to update.
     * @param {String} oldStyle The style value to find.
     * @param {String} newStyle The style value to set.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     */

    return TP.tpcall('elementReplaceStyleValue',
                        elemOrId, nodeContext, aProperty, oldStyle, newStyle);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('restoreStyle',
function(elemOrId, nodeContext) {

    /**
     * @method restoreStyle
     * @summary A convenience wrapper for TP.elementRestoreStyle. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     */

    return TP.tpcall('elementRestoreStyle', elemOrId, nodeContext);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('setStyle',
function(elemOrId, aProperty, aValue, nodeContext) {

    /**
     * @method setStyle
     * @summary A convenience wrapper for TP.elementSetStyleString. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} aProperty The style property to update.
     * @param {String} aValue The style value to set.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     */

    return TP.tpcall('elementSetStyleString',
                        elemOrId, nodeContext, aProperty, aValue);
});

//  ------------------------------------------------------------------------
//  EFFECTS
//  ------------------------------------------------------------------------

TP.definePrimitive('animate',
function(anElement, propertyName, animationParams, nodeContext) {

    /**
     * @method animate
     * @summary A convenience wrapper for invoking a
     *     TP.gui.CSSPropertyTransition. The element definition is resolved via
     *     TP.byId(). The resulting element(s) are then used as the targets of
     *     the transition.
     * @param {String|Element|Element[]} anElement An element specification, or
     *     element, suitable for TP.byId().
     * @param {String} propertyName The name of the property to transition.
     * @param {TP.core.Hash} animationParams A hash of parameters to use for the
     *     transition.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {TP.core.Job} The TP.core.Job object that is managing the
     *     transition.
     */

    var elems,

        animationJob;

    //  If its a String, then return an Element or an Array matching the one
    //  or more ids given in the String.
    if (TP.isString(anElement)) {
        //  If its a String, then it might be one or more element ids.
        elems = TP.byId(anElement, TP.context(nodeContext));
    } else {
        elems = anElement;
    }

    animationJob = TP.gui.CSSPropertyTransition.transition(
                                elems,
                                propertyName,
                                animationParams);

    return animationJob;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('effect',
function(anElement, effectName, effectParams, nodeContext) {

    /**
     * @method effect
     * @summary A convenience wrapper for invoking a subtype of TP.core.Effect.
     *     The element definition is resolved via TP.byId(). The resulting
     *     element(s) are then used as the targets of the effect.
     * @description The name of the effect type to use to run the supplied
     *     effect name is computed by taking the supplied effect name,
     *     capitalizing the first letter and then prefixing it with 'TP.core.'
     *     and suffixing it with 'Effect'. E.g. 'puff' becomes
     *     'TP.core.PuffEffect'.
     * @param {String|Element|Element[]} anElement An element specification, or
     *     element, suitable for TP.byId().
     * @param {String} effectName The name of the effect to use.
     * @param {TP.core.Hash} effectParams A hash of parameters to use for the
     *     effect.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {TP.core.Job} The TP.core.Job object that is managing the
     *     effect.
     */

    var effectTypeName,
        effectType,

        ctrlAndStepParams,
        ctrlParams,
        stepParams,

        computeFunction,

        newEffect,
        transitionJob,

        elems;

    //  The effect type name is computed by doing an initial caps to the
    //  supplied name and appending 'Effect'.
    effectTypeName = TP.makeStartUpper(effectName) + 'Effect';

    //  Make sure that we have a real type here.

    if (TP.notValid(effectType = effectTypeName.asType())) {
        //  Try again with the 'TP.core.' prefix.
        effectTypeName = 'TP.core.' + TP.makeStartUpper(effectName) + 'Effect';

        //  Still didn't find it? Bail out and raise an exception.
        if (TP.notValid(effectType = effectTypeName.asType())) {
            TP.raise(TP.effect, 'TP.sig.InvalidType',
                        effectTypeName);

            return;
        }
    }

    //  If a hash of effect parameters was supplied, we copy it (to leave
    //  the original pristine) for the control params and use selected
    //  values for the step parameters. Otherwise, we just create blank
    //  ones.
    if (TP.isValid(effectParams)) {
        ctrlAndStepParams = TP.core.Job.splitParams(effectParams);

        ctrlParams = ctrlAndStepParams.first();
        stepParams = ctrlAndStepParams.last();
    } else {
        ctrlParams = TP.hc();
        stepParams = TP.hc();
    }

    //  Make sure that, if a compute function was defined, we have a real
    //  Function object.

    if (TP.isCallable(computeFunction = ctrlParams.at('compute')) &&
        !TP.isCallable(computeFunction)) {
        //  Try to see if it can be looked up on the TP.core.Job object,
        //  since that's where compute functions are located.
        computeFunction = TP.core.Job[computeFunction];

        //  Still didn't find it? Bail out and raise an exception.
        if (!TP.isCallable(computeFunction)) {
            TP.raise(TP.effect, 'TP.sig.InvalidFunction',
                    ctrlParams.at('compute'));

            return;
        }

        ctrlParams.atPut('compute', computeFunction);
    }

    //  If its a String, then return an Element or an Array matching the one
    //  or more ids given in the String.
    if (TP.isString(anElement)) {
        elems = TP.byId(anElement, TP.context(nodeContext), false);
    } else {
        elems = anElement;
    }

    //  Make sure that we supply the element(s) to the stepParams.
    stepParams.atPut('target', elems);

    //  If its an Array, then we already have what we need. Otherwise, we
    //  assume its a single element and wrap it into an Array.
    if (!TP.isArray(elems)) {
        elems = TP.ac(elems);
    }

    //  Construct an instance of the effect. This will construct the job,
    //  but not run it.
    newEffect = effectType.construct(ctrlParams, stepParams);
    transitionJob = newEffect.get('transitionJob');

    //  Install a 'post' function that will clear any cached references to
    //  the job that we use in case it needs to be stopped early.
    transitionJob.set(
        'post',
        function(job, params) {

            /* eslint-disable no-unused-vars */

            var theElements,

                postFunc,

                dummyVal;

            //  Note here how we grab both the target elements and the
            //  property from the supplied job. This is to avoid closure
            //  problems with previous invocations of this method.
            if (TP.isEmpty(theElements = params.at('target'))) {
                return;
            }

            //  Run any existing 'post' function that was defined as
            //  part of our parameters.
            if (TP.isCallable(postFunc = ctrlParams.at('post'))) {
                postFunc(job, params);
            }

            //  NB: We assign to dummyVal below to ensure that the JS engine is
            //  forced to access (and assign) the value so that it can't
            //  optimize it away.

            if (TP.isArray(theElements)) {
                theElements.perform(
                    function(anElem) {

                        //  If the element already had a job running that
                        //  was associated with the same effect that we're
                        //  invoking, clear it.
                        if (TP.isValid(anElem['effect_' + effectName])) {
                            anElem['effect_' + effectName] = null;
                        }
                    });

                //  Make sure that any drawing that needed to 'flush' to the
                //  window does so.
                dummyVal = TP.documentGetBody(TP.nodeGetDocument(
                                    theElements.first())).offsetHeight;
            } else {
                //  If the element already had a job running that was
                //  associated with the same effect that we're invoking,
                //  clear it.
                if (TP.isValid(theElements['effect_' + effectName])) {
                    theElements['effect_' + effectName] = null;
                }

                //  Make sure that any drawing that needed to 'flush' to the
                //  window does so.
                dummyVal = TP.documentGetBody(TP.nodeGetDocument(
                                    theElements)).offsetHeight;
            }

            /* eslint-enable no-unused-vars */
        });

    //  Instrument the individual elements that we are touching with the
    //  job. These will allow the deactivation routine below to prematurely
    //  terminate the job if another TP.effect() call is called on the same
    //  element.

    elems.perform(
        function(anElem) {

            var prevJob,
                params,
                allElems,
                i;

            //  If the target element already had a job running that was
            //  animating that property, shut it down.

            //  If the element has a TP.core.Job registered under a slot
            //  named 'effect_' + the name of the effect and that
            //  TP.core.Job hasn't already finished (or been told to finish
            //  by 'shutting down' another element sharing the job), then we
            //  begin the process to shut down the job.
            if (TP.isValid(prevJob = anElem['effect_' + effectName]) &&
                !prevJob.didComplete()) {
                //  If the job has elements that it is animating and there
                //  is more than 1 element in that set, then we're not the
                //  only one, so we just remove ourself from the list of
                //  elements.
                if (TP.isValid(params = prevJob.$get('parameters')) &&
                    TP.isArray(allElems = params.at('target')) &&
                    allElems.length > 1) {
                    for (i = 0; i < allElems.length; i++) {
                        if (allElems[i] === anElem) {
                            //  Remove the element from the job's 'target'
                            //  Array so that this property is no longer
                            //  animated by that job.
                            allElems.splice(i, 1);
                            break;
                        }
                    }
                } else {
                    //  Otherwise, we're the only element left in the job so
                    //  we try to shut the job down as cleanly as possible.
                    prevJob.shutdown();
                }
            }

            //  Cache the new animation job on the element, so that it can
            //  be shutdown in the future if necessary.
            anElem['effect_' + effectName] = transitionJob;
        });

    //  Do the deed, supplying the step parameters.
    newEffect.start(stepParams);

    return transitionJob;
});

//  ------------------------------------------------------------------------
//  EVENTS
//  ------------------------------------------------------------------------

TP.definePrimitive('arm',
function(aNodeOrList, eventNames, aHandler, aPolicy, nodeContext) {

    /**
     * @method arm
     * @summary Arms a node or list of them with the event or events given.
     * @param {Node|String} aNodeOrList The node or list of nodes to arm with
     *     the event(s) specified. This can also be the TP.ANY constant,
     *     indicating that the event is to be observed coming from any node.
     * @param {String|String[]} eventNames The names or types of the events to
     *     arm the element with.
     * @param {Function} aHandler An (optional) parameter that defines a native
     *     handler to be used instead of sending the event into the TIBET
     *     signaling system.
     * @param {Function} aPolicy An (optional) parameter that defines the
     *     "firing" policy.
     * @param {Window} nodeContext An optional window to search for the
     *     element(s). If not provided then the TP.context() method is used to
     *     find one.
     */

    var target,
        context,
        signals,
        len,
        i,
        signal,
        type;

    if (TP.isEmpty(eventNames)) {
        TP.raise(this, 'TP.sig.InvalidParameter',
                'Must supply a Signal.');

        return;
    }

    target = TP.ifInvalid(aNodeOrList, TP.ANY);
    context = TP.context(nodeContext);

    /* eslint-disable no-nested-ternary */
    signals = / /.test(eventNames) ?
                eventNames.split(' ') :
                TP.isArray(eventNames) ?
                    eventNames :
                    TP.ac(eventNames);
    /* eslint-enable no-nested-ternary */

    len = signals.getSize();
    for (i = 0; i < len; i++) {
        signal = signals.at(i);
        if (TP.isString(signal)) {
            type = TP.sys.getTypeByName(signal);
        } else {
            type = signal;
        }

        if (TP.canInvoke(type, 'arm')) {
            type.arm(target, aHandler, aPolicy, context);
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('button',
function(anEvent) {

    /**
     * @method button
     * @summary Returns the button code for the supplied event, which is one of
     *     the following constants: TP.LEFT, TP.MIDDLE, or TP.RIGHT.
     * @param {Event} anEvent The event object to extract the button code from.
     * @returns {String} The button code extracted from the supplied Event
     *     object.
     */

    return TP.eventGetButton(anEvent);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('coord',
function(anObject, nodeContext) {

    /**
     * @method coord
     * @summary Returns the 'document-level' X and Y for the supplied event or
     *     element object.
     * @param {Event|String|} anObject An event object or an
     *     Element|TP.core.Hash| element specification, Array|TP.gui.Point or
     *     element, suitable for TP.byId() or a hash or point with 'x' and 'y'
     *     values or an array with an X 'value' in the first position and a Y
     *     value in the second.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Number[]} The X and Y as a point pair.
     */

    var elem;

    if (TP.isEvent(anObject)) {
        return TP.eventGetPageXY(anObject);
    }

    if (TP.isArray(anObject)) {
        return anObject;
    }

    if (TP.isHash(anObject) ||
        TP.isKindOf(anObject, TP.gui.Point)) {
        return TP.ac(anObject.at('x'), anObject.at('y'));
    }

    //  use a combination of element and context to find the focal
    //  element(s) for the call
    elem = TP.isString(anObject) ?
                TP.byId(anObject, TP.context(nodeContext), false) :
                TP.elem(anObject);

    if (TP.isElement(elem)) {
        return TP.elementGetPageXY(elem);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('disarm',
function(aNodeOrList, eventNames, aHandler, nodeContext) {

    /**
     * @method disarm
     * @summary Disarms a node or list of them for the event or events.
     * @param {Node|String} aNodeOrList The node or list of nodes to disarm with
     *     the event(s) specified. This can also be the TP.ANY constant.
     * @param {String|String[]} eventNames The names or types of the events to
     *     disarm.
     * @param {Function} aHandler An (optional) parameter that defines a native
     *     handler to be used instead of sending the event into the TIBET
     *     signaling system.
     * @param {Window} nodeContext An optional window to search for the
     *     element(s).
     *     If not provided then the TP.context() method is used to fine one.
     */

    var target,
        context,
        signals,
        len,
        i,
        signal,
        type;

    if (TP.isEmpty(eventNames)) {
        TP.raise(this, 'TP.sig.InvalidParameter',
                'Must supply a Signal.');

        return;
    }

    target = TP.ifInvalid(aNodeOrList, TP.ANY);
    context = TP.context(nodeContext);

    /* eslint-disable no-nested-ternary */
    signals = / /.test(eventNames) ?
                eventNames.split(' ') :
                TP.isArray(eventNames) ?
                    eventNames :
                    TP.ac(eventNames);
    /* eslint-enable no-nested-ternary */

    len = signals.getSize();
    for (i = 0; i < len; i++) {
        signal = signals.at(i);
        if (TP.isString(signal)) {
            type = TP.sys.getTypeByName(signal);
        } else {
            type = signal;
        }

        if (TP.canInvoke(type, 'disarm')) {
            type.disarm(target, aHandler, context);
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('event',
function(anEvent) {

    /**
     * @method event
     * @summary Returns a normalized event, meaning a native event that has
     *     been instrumented to conform to the W3C standard and to have properly
     *     adjusted values for key, shift, alt, meta, etc.
     * @param {Event} anEvent The native event to normalize. Default is
     *     window.event so this can be called with an empty value on IE.
     * @returns {Event} The normalized native event.
     */

    return TP.eventNormalize(anEvent || window.event);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventGetDOMSignalName',
function(anEvent) {

    /**
     * @method eventGetDOMSignalName
     * @summary Returns the properly adjusted DOM signal name for the DOM. This
     *     should be correct provided that the event was acquired from a
     *     TP.sig.DOMKeySignal rather than prior to TP.core.Keyboard handling.
     * @param {Event} anEvent The event object to extract the signal name from.
     * @returns {String} The full signal name such as DOM_Shift_Enter_Up.
     */

    return TP.core.Keyboard.getDOMSignalName(anEvent);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('keyname',
function(anEvent) {

    /**
     * @method keyname
     * @summary Returns the properly adjusted key name for the event. This
     *     should be correct provided that the event was acquired from a
     *     DOMKeySignal rather than prior to TP.core.Keyboard handling.
     * @param {Event} anEvent The event object to extract the key name from.
     * @returns {String} The base key name, such as A, Escape, etc.
     */

    return TP.core.Keyboard.getEventVirtualKey(anEvent);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('wheel',
function(anEvent) {

    /**
     * @method wheel
     * @summary Returns the wheel delta value from the event provided. The
     *     event should have been either a DOMMouseScroll or mousewheel event
     *     depending on the platform in question.
     * @param {Event} anEvent The native mouse event.
     * @returns {Number} The delta. Positive is down, negative is up.
     */

    return TP.eventGetWheelDelta(anEvent);
});

//  ------------------------------------------------------------------------
//  CONTENT SHORTCUTS
//  ------------------------------------------------------------------------

TP.definePrimitive('compact',
function(anObject, aFilter) {

    /**
     * @method compact
     * @summary Returns a compacted version of the object. For arrays this
     *     removes nulls, for Strings it removes consecutive sequences of
     *     whitespace (and trims the string). Other objects may have their own
     *     approach to this, for example, a TP.core.Hash will remove keys whose
     *     values are undefined or null.
     * @param {Object} anObject The object to compact.
     * @param {Function} aFilter An optional filtering function defining which
     *     values are retained.
     * @returns {Object} The compacted object, which may be a new object.
     */

    if (TP.canInvoke(anObject, 'compact')) {
        return anObject.compact(aFilter);
    }

    return anObject;
});

//  ------------------------------------------------------------------------
//  GETTER/SETTER SHORTCUTS
//  ------------------------------------------------------------------------

TP.definePrimitive('elemget',
function(elemOrId, anAspect, nodeContext) {

    /**
     * @method elemget
     * @summary Returns the element(s) response to a get(anAspect), or a direct
     *     property access when necessary. The aspect defaults to 'value', so
     *     TP.elemget(id) is essentially equivalent to TP.val(TP.byId(id)), but
     *     TP.elemget() supports lists of objects. The element definition is
     *     resolved via TP.byId(). The resulting element(s) are then used as
     *     roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} anAspect The property to access. Default is 'value' so
     *     TP.elemGet(id) will return the 'value' of the element or elements
     *     TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Object} The object value(s).
     */

    var aspect,
        list,
        arr,
        len,
        i;

    aspect = anAspect || 'value';

    list = TP.byId(elemOrId, nodeContext, false);

    if (TP.isArray(list)) {
        arr = TP.ac();
        len = list.getSize();
        for (i = 0; i < len; i++) {
            //  TODO:   should we wrap the list.at(i) here?
            arr.push(TP.val(list.at(i), aspect));
        }

        return arr;
    } else {
        //  TODO:   should we wrap the list here?
        return TP.val(list, aspect);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elemset',
function(elemOrId, anAspect, aValue, nodeContext) {

    /**
     * @method elemset
     * @summary Sets the value of the element(s) anAspect slot to aValue. The
     *     element definition is resolved via TP.byId(). The resulting
     *     element(s) are then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} anAspect The property name to be set, which defaults to
     *     'value'.
     * @param {Object} aValue A value suitable for the target. This is typically
     *     a string.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Object} The element, or elements that were changed.
     */

    var aspect,
        list,
        len,
        i,
        obj;

    aspect = anAspect || 'value';

    list = TP.byId(elemOrId, nodeContext, false);
    if (TP.isArray(list)) {
        len = list.getSize();
        for (i = 0; i < len; i++) {
            obj = TP.wrap(list.at(i));

            if (TP.canInvoke(obj, 'set')) {
                obj.set(aspect, aValue);
            } else if (TP.canInvoke(obj, 'atPut')) {
                obj.atPut(aspect, aValue);
            } else if (!TP.isXMLNode(obj)) {
                try {
                    obj[aspect] = aValue;
                } catch (e) {
                    TP.ifError() ?
                        TP.error(
                            TP.ec(e, 'Unable to set element: ' + obj)) : 0;
                }
            } else {
                //  TODO:   warn?
                void 0;
            }
        }
    } else {
        list = TP.wrap(list);

        if (TP.canInvoke(list, 'set')) {
            list.set(aspect, aValue);
        } else if (TP.canInvoke(list, 'atPut')) {
            list.atPut(aspect, aValue);
        } else if (!TP.isXMLNode(list)) {
            try {
                list[aspect] = aValue;
            } catch (e) {
                TP.ifError() ?
                    TP.error(
                        TP.ec(e, 'Unable to obtain element: ' + list)) : 0;
            }
        } else {
            //  TODO:   warn?
            void 0;
        }
    }

    return list;
});

//  ------------------------------------------------------------------------
//  ELEMENT "BUILT-IN" SHORTCUTS
//  ------------------------------------------------------------------------

/*
Native form elements often support one or more methods such as focus, reset,
and select. Convenience wrappers for dealing with these are provided here.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('focus',
function(elemOrId, nodeContext) {

    /**
     * @method focus
     * @summary Focuses the element in question, if possible. The element is
     *     acquired and wrapped, and then the resulting wrapper's focus() method
     *     is invoked if possible, otherwise a focus is attempted on the
     *     unwrapped element directly.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     */

    return TP.idcall('focus', elemOrId, nodeContext);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('reset',
function(elemOrId, nodeContext) {

    /**
     * @method reset
     * @summary Resets the element in question, if possible. The element is
     *     acquired and wrapped, and then the resulting wrapper's reset() method
     *     is invoked if possible, otherwise a reset is attempted on the
     *     unwrapped element directly.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     */

    return TP.idcall('reset', elemOrId, nodeContext);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('select',
function(elemOrId, nodeContext) {

    /**
     * @method select
     * @summary Selects the element in question, if possible. The element is
     *     acquired and wrapped, and then the resulting wrapper's select()
     *     method is invoked if possible, otherwise a select is attempted on the
     *     unwrapped element directly.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     */

    return TP.idcall('select', elemOrId, nodeContext);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('submit',
function(elemOrId, nodeContext) {

    /**
     * @method submit
     * @summary Submits the element in question, if possible. The element is
     *     acquired and wrapped, and then the resulting wrapper's submit()
     *     method is invoked if possible, otherwise a submit is attempted on the
     *     unwrapped element directly.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     */

    return TP.idcall('submit', elemOrId, nodeContext);
});

//  ------------------------------------------------------------------------
//  REFLECTION BASE
//  ------------------------------------------------------------------------

TP.definePrimitive('dump',
function(anObject, depth, level) {

    /**
     * @method dump
     * @summary Returns the key/value pairs of the object formatted in a
     *     non-markup string.
     * @param {The} anObject object whose properties and simple dump/logging
     *     string should be returned.
     * @param {Number} [depth=1] The depth to dump the object to.
     * @returns {String} A simple logging string for the object.
     */

    var str,

        arr,
        len,
        i,
        $depth,
        $level,
        rules;

    str = '[' + TP.tname(anObject) + ' :: ';

    if (anObject === null) {
        str += 'null' + ']';
        return str;
    } else if (anObject === undefined) {
        str += 'undefined' + ']';
        return str;
    }

    //  XMLHttpRequest can have permission issues, so check early
    if (TP.isXHR(anObject)) {
        str += '(' + anObject.status + ' : ' + anObject.responseText + ')' + ']';
        return str;
    }

    //  native nodes are the next-most likely object being passed to this
    //  routine, so we'll try to build up a proper string here
    if (TP.isNode(anObject)) {
        str += TP.nodeAsString(anObject) + ']';
        return str;
    }

    //  got to check Errors next... they freak out if handed to TP.isString().
    if (TP.isError(anObject)) {
        str += TP.errorAsString(anObject) + ']';
        return str;
    }

    if (TP.isString(anObject)) {
        str += anObject + ']';
        return str;
    }

    if (!TP.isMutable(anObject)) {
        //  TODO:   does this really deal with all the special constants
        //  like NaN, Number.POSITIVE_INFINITY, etc.?
        str += TP.objectToString(anObject) + ']';
        return str;
    }

    //  The top-level Window has TIBET loaded into it, so it will respond to
    //  'asString' properly, but other iframes, etc. won't so we have to handle
    //  Windows in a special manner here.
    if (TP.isWindow(anObject)) {
        str += TP.windowAsString(anObject) + ']';
        return str;
    }

    //  Event objects
    if (TP.isEvent(anObject)) {
        str += TP.eventAsString(anObject) + ']';
        return str;
    }

    //  NodeList objects
    if (TP.isNodeList(anObject)) {
        arr = TP.ac();

        len = anObject.length;
        for (i = 0; i < len; i++) {
            arr.push(TP.str(anObject[i]));
        }

        str += '(' + arr.join(', ') + ')' + ']';
        return str;
    }

    //  NamedNodeMap objects
    if (TP.isNamedNodeMap(anObject)) {
        arr = TP.ac();

        len = anObject.length;
        for (i = 0; i < len; i++) {
            arr.push(TP.name(anObject.item(i)) + ': ' +
                         TP.val(anObject.item(i)));
        }

        str += '(' + arr.join(', ') + ')' + ']';
        return str;
    }

    //  Stylesheet objects
    if (TP.isStyleSheet(anObject)) {
        rules = TP.styleSheetGetStyleRules(anObject, false);

        arr = TP.ac();

        len = rules.length;
        for (i = 0; i < len; i++) {
            arr.push(rules[i].cssText);
        }
        str += '(' + arr.join(' ') + ')' + ']';
        return str;
    }

    //  Style rule objects
    if (TP.isStyleRule(anObject)) {
        str += anObject.cssText + ']';
        return str;
    }

    //  Style declaration objects
    if (TP.isStyleDeclaration(anObject)) {
        str += anObject.cssText + ']';
        return str;
    }

    if (TP.canInvoke(anObject, 'asDumpString')) {

        $depth = TP.ifInvalid(depth, 1);
        $level = TP.ifInvalid(level, 0);

        str = anObject.asDumpString($depth, $level);
        if (TP.regex.NATIVE_CODE.test(str)) {
            str = '[' + TP.tname(anObject) + ' :: ' + 'native code' + ']';
        }

        return str;
    }

    //  worst case we just produce our best source-code representation
    str += TP.boot.$stringify(anObject) + ']';

    return str;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('interface',
function(anObject, aFilter, aDiscriminator) {

    /**
     * @method interface
     * @summary Returns the interface of anObject, optionally filtered by the
     *     discriminator provided.
     * @param {Object} anObject The object to reflect upon.
     * @param {Object|String} aFilter An object containing getInterface filter
     *     properties or a name of one of the keys registered under
     *     TP.SLOT_FILTERS. The default is 'unique_methods'.
     * @param {String|RegExp} aDiscriminator A 'filter' function or a pattern
     *     used to filter the list of returned keys.
     * @returns {String[]} An array of filtered property keys.
     */

    var filter,

        arr,
        obj,

        attributesOnly,
        methodsOnly,

        includeHidden,

        dontTraverse,
        inheritedOnly,
        overriddenOnly,

        keys,

        proto;

    if (TP.notValid(anObject)) {
        return TP.ac();
    }

    if (TP.isString(aFilter)) {
        filter = TP.SLOT_FILTERS[aFilter];
    } else if (TP.notValid(aFilter)) {
        filter = TP.SLOT_FILTERS.unique_methods;
    } else {
        filter = aFilter;
    }

    if (TP.canInvoke(anObject, 'getInterface')) {
        arr = anObject.getInterface(filter);
    } else {

        if (TP.isValid(filter)) {

            attributesOnly = filter.attributes;
            methodsOnly = filter.methods;

            includeHidden = filter.hidden;

            dontTraverse = filter.scope === TP.INTRODUCED ||
                            filter.scope === TP.LOCAL;

            inheritedOnly = filter.scope === TP.INHERITED;
            overriddenOnly = filter.scope === TP.OVERRIDDEN;
        }

        arr = TP.ac();

        if (inheritedOnly || overriddenOnly) {
            obj = Object.getPrototypeOf(anObject);
        } else {
            obj = anObject;
        }

        /* eslint-disable no-loop-func */
        do {
            keys = TP.objectGetKeys(obj);

            //  We always filter by the INTERNAL_SLOT regex
            keys = keys.filter(
                    function(aKey) {
                        return !TP.regex.INTERNAL_SLOT.test(aKey);
                    });

            //  If we're not including hidden slots, then we also filter by
            //  the PRIVATE_SLOT regex
            if (!includeHidden) {
                keys = keys.filter(
                        function(aKey) {
                            return !TP.regex.PRIVATE_SLOT.test(aKey);
                        });
            }

            if (attributesOnly) {

                //  This filter for methods avoids touching the slot or its
                //  contents, but uses its property descriptor to test whether
                //  it contains a Function. This is necessary on some browsers
                //  because those slots can throw Errors if we try to touch
                //  them.
                keys = keys.filter(
                        function(testSlot) {
                            var desc;

                            desc = Object.getOwnPropertyDescriptor(
                                                            obj, testSlot);
                            if (!desc.value || TP.isCallable(desc.value)) {
                                return true;
                            }

                            return false;
                        });
            } else if (methodsOnly) {

                //  This filter for methods avoids touching the slot or its
                //  contents, but uses its property descriptor to test whether
                //  it contains a Function. This is necessary on some browsers
                //  because those slots can throw Errors if we try to touch
                //  them.
                keys = keys.filter(
                        function(testSlot) {
                            var desc;

                            desc = Object.getOwnPropertyDescriptor(
                                                            obj, testSlot);
                            if (desc.value && TP.isCallable(desc.value)) {
                                return true;
                            }

                            return false;
                        });
            }

            proto = Object.getPrototypeOf(obj);

            if (overriddenOnly) {
                keys = keys.filter(
                        function(aKey) {

                            try {
                                return obj[aKey] === proto[aKey];
                            } catch (e) {
                                return false;
                            }
                        });
            }

            arr.push(keys);
            if (dontTraverse) {
                break;
            }

            obj = proto;
        } while (obj);
        /* eslint-enable no-loop-func */

        arr = Array.prototype.concat.apply([], arr);
    }

    if (TP.isFunction(aDiscriminator)) {
        return arr.select(aDiscriminator).sort();
    } else if (TP.isValid(aDiscriminator)) {
        return arr.grep(aDiscriminator).sort();
    } else {
        return arr.sort();
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('pretty',
function(anObject) {

    /**
     * @method pretty
     * @summary Returns the content of the object in a "best looking" form of
     *     markup. For example, a function body would be returned in syntax
     *     colored markup. The largest consumer of this method is the TIBET
     *     console which takes the return value from this method and uses it as
     *     the receiver's console representation.
     * @param {The} anObject object whose properties and simple print string
     *     should be returned.
     * @returns {String} A simple print string for the object.
     */

    var xhrStatus,

        str,

        arr,
        len,
        i,

        rules;

    if (anObject === null) {
        return '<dl class="pretty Null"><dt/><dd>null</dd></dl>';
    } else if (anObject === undefined) {
        return '<dl class="pretty Undefined"><dt/><dd>undefined</dd></dl>';
    }

    //  XMLHttpRequest can have permission issues, so check early
    if (TP.isXHR(anObject)) {
        //  If the XHR mechanism has aborted in Mozilla, it will cause the
        //  '.status' property to throw an exception if it is read.
        try {
            xhrStatus = anObject.status;
        } catch (e) {
            xhrStatus = 'none';
        }

        return '<dl class="pretty ' + TP.escapeTypeName(TP.tname(anObject)) +
                        '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' + TP.tname(anObject) +
                        '</dd>' +
                    '<dt class="pretty key">Status</dt>' +
                    '<dd class="pretty value">' + xhrStatus + '</dd>' +
                    '<dt class="pretty key">Response text</dt>' +
                    '<dd class="pretty value">' +
                        TP.str(anObject.responseText).asEscapedXML() +
                    '</dd>' +
                '</dl>';
    }

    //  native nodes are the next-most likely object being passed to this
    //  routine, so we'll try to build up a proper string here
    if (TP.isNode(anObject)) {
        return '<dl class="pretty ' + TP.escapeTypeName(TP.tname(anObject)) +
                        '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' + TP.tname(anObject) +
                        '</dd>' +
                    '<dt class="pretty key">Content</dt>' +
                    '<dd class="pretty value">' +
                        TP.nodeAsString(anObject).asEscapedXML() +
                    '</dd>' +
                '</dl>';
    }

    //  got to check Errors next... they freak out if handed to TP.isString().
    if (TP.isError(anObject)) {
        return '<dl class="pretty ' + TP.escapeTypeName(TP.tname(anObject)) +
                        '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' + TP.tname(anObject) +
                        '</dd>' +
                    '<dt class="pretty key">Message</dt>' +
                    '<dd class="pretty value">' +
                        TP.str(anObject.message) +
                    '</dd>' +
                '</dl>';
    }

    //  Since these are all non-mutable, we must do this before the next check
    if (TP.isString(anObject) ||
        TP.isNumber(anObject) ||
        TP.isBoolean(anObject)) {
        return anObject.asPrettyString();
    }

    if (!TP.isMutable(anObject)) {
        //  TODO:   does this really deal with all the special constants
        //  like NaN, Number.POSITIVE_INFINITY, etc.?
        return TP.objectToString(anObject);
    }

    //  The top-level Window has TIBET loaded into it, so it will respond to
    //  'asString' properly, but other iframes, etc. won't so we have to handle
    //  Windows in a special manner here.
    if (TP.isWindow(anObject)) {
        return TP.windowAsPrettyString(anObject);
    }

    //  Event objects
    if (TP.isEvent(anObject)) {
        return TP.eventAsPrettyString(anObject);
    }

    //  NodeList objects
    if (TP.isNodeList(anObject)) {
        arr = TP.ac();

        len = anObject.length;
        for (i = 0; i < len; i++) {
            arr.push('<dt class="pretty key">', i, '</dt>',
                        '<dd class="pretty value">', TP.nodeAsString(anObject[i]).asEscapedXML(), '</dd>');
        }

        return '<dl class="pretty ' + TP.escapeTypeName(TP.tname(anObject)) + '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' + TP.tname(anObject) + '</dd>' +
                    arr.join('') +
                '</dl>';
    }

    //  NamedNodeMap objects
    if (TP.isNamedNodeMap(anObject)) {
        arr = TP.ac();

        len = anObject.length;
        for (i = 0; i < len; i++) {
            arr.push('<dt class="pretty key">', TP.name(anObject.item(i)), '</dt>',
                        '<dd class="pretty value">', TP.val(anObject.item(i)), '</dd>');
        }

        return '<dl class="pretty ' + TP.escapeTypeName(TP.tname(anObject)) + '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' + TP.tname(anObject) + '</dd>' +
                    arr.join('') +
                '</dl>';
    }

    //  Stylesheet objects
    if (TP.isStyleSheet(anObject)) {
        rules = TP.styleSheetGetStyleRules(anObject, false);

        arr = TP.ac();

        len = rules.length;
        for (i = 0; i < len; i++) {
            arr.push('<dt class="pretty key">', i, '</dt>',
                        '<dd class="pretty value">', rules[i].cssText, '</dd>');
        }

        return '<dl class="pretty ' + TP.escapeTypeName(TP.tname(anObject)) + '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' + TP.tname(anObject) + '</dd>' +
                    arr.join('') +
                '</dl>';
    }

    //  Style rule objects
    if (TP.isStyleRule(anObject)) {
        return '<dl class="pretty ' + TP.escapeTypeName(TP.tname(anObject)) + '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' + TP.tname(anObject) + '</dd>' +
                    '<dt class="pretty key">Content</dt>' +
                    '<dd class="pretty value">' + anObject.cssText + '</dd>' +
                '</dl>';
    }

    //  Style declaration objects
    if (TP.isStyleDeclaration(anObject)) {
        return '<dl class="pretty ' + TP.escapeTypeName(TP.tname(anObject)) + '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' + TP.tname(anObject) + '</dd>' +
                    '<dt class="pretty key">Content</dt>' +
                    '<dd class="pretty value">' + anObject.cssText + '</dd>' +
                '</dl>';
    }

    if (TP.canInvoke(anObject, 'asPrettyString')) {
        str = anObject.asPrettyString();
        //  NB: No special detection of NATIVE_CODE functions here - just return
        //  what a Function would normally produce.
        return str;
    }

    //  worst case we just produce our best html representation
    return TP.htmlstr(anObject);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('recursion',
function(anObject, aKey) {

    /**
     * @method recursion
     * @summary Returns a string representation of the object which is used
     *     when the object is encountered in a circularly referenced manner
     *     during the production of some sort of formatted String
     *     representation.
     * @param {Object} anObject The object whose properties triggered a
     *     circular reference recursion.
     * @param {aKey} aKey The operation key which marked the circularity.
     * @returns {String} A recursion string rep for the object.
     */

    var obj,
        gid,
        key;

    try {
        //  Remove our recursion marker from the object.
        delete anObject[aKey];

        //  Update our key to the original key name.
        key = aKey.replace('$$recursive_', '');
        gid = TP.gid(anObject);

        TP.warn('Circular reference(s) in ' + gid + ' (' + key + ')');
    } catch (e) {
        void 0;
    }

    obj = TP.wrap(anObject);
    if (obj !== anObject) {
        if (TP.canInvoke(anObject, 'asRecursionString')) {
            return anObject.asRecursionString();
        }
    }

    if (TP.canInvoke(anObject, 'asRecursionString')) {
        return anObject.asRecursionString();
    }

    //  Do up a manual form of recursion string here.
    gid = TP.gid(obj);
    if (TP.sys.cfg('debug.register_recursion')) {

        gid = 'urn:tibet:' + gid;
        TP.uc(gid).setResource(obj);

        return gid;
    }

    return '@' + gid;
});

//  ------------------------------------------------------------------------
//  COLLECTIONS
//  ------------------------------------------------------------------------

TP.definePrimitive('contains',
function(anObject, aValue) {

    /**
     * @method contains
     * @summary Returns true if the object can be shown to clearly contain the
     *     value provided. Indeterminate cases (where the object can't be tested
     *     effectively) return false.
     * @param {Object} anObject The object to test.
     * @param {Object} aValue The value to check for containment.
     * @returns {Boolean} True if the value is clearly contained.
     */

    if (TP.notValid(anObject)) {
        return false;
    }

    if (TP.canInvoke(anObject, 'contains')) {
        return anObject.contains(aValue);
    }

    //  TODO:   what about a fuzzy return value here ala "undefined".
    return false;
});

//  ------------------------------------------------------------------------
//  TRAVERSAL SHORTCUTS
//  ------------------------------------------------------------------------

TP.definePrimitive('chain',
function(anObject, aProperty) {

    /**
     * @method chain
     * @summary Returns an Array of objects acquired by recursively invoking
     *     get(aProperty) on anObject. When the object is a node the property is
     *     typically something such as parentNode which provides a list of all
     *     the node's ancestors.
     * @param {Object} anObject The object to root the query at.
     * @param {String} aProperty A property name to query for.
     * @returns {Object[]} An array of zero to N result objects.
     */

    var arr,
        obj;

    if (TP.isNode(anObject)) {
        return TP.nodeSelectChain(anObject, aProperty);
    }

    arr = TP.ac();

    if (TP.isEmpty(aProperty)) {
        //  TODO: warn?
        return arr;
    }

    obj = anObject;

    while (TP.isValid(obj)) {
        obj = TP.val(obj, aProperty);

        if (TP.notValid(obj)) {
            break;
        }

        arr.push(obj);
    }

    return arr;
});

//  ------------------------------------------------------------------------
//  SPECIAL FEATURES
//  ------------------------------------------------------------------------

TP.definePrimitive('go2',
function(aURIOrRoute, linkContext) {

    /**
     * @method go2
     * @summary A general wrapper function used during processing of link
     *     elements to give TIBET control over the link traversal process. The
     *     go2 call ultimately results in either a route change or page change
     *     depending on the content of the original href value. To define a
     *     route you must provide a value with a leading '#' to force this call
     *     to recognize the path as a 'client path' rather than a server path.
     * @param {TP.uri.URI|String} aURIOrRoute The URI or route to go to.
     * @param {Window} linkContext The window with the original link element.
     * @exception TP.sig.InvalidURI
     * @returns {Boolean} Always returns 'false' to avoid anchor link traversal.
     */

    var context,
        loc,
        head,
        tail,
        path,
        router;

    if (TP.notValid(aURIOrRoute)) {
        TP.raise(this, 'TP.sig.InvalidURI');
        return false;
    }

    //  If we get a "route" rather than a full URI update the hash and let the
    //  system respond to that to route correctly.
    if (aURIOrRoute === '/' || /^#/.test(aURIOrRoute)) {

        //  A route has to be '#/' or '#?', so only trigger the router if we see
        //  that pattern.
        if (aURIOrRoute === '/' || /^#(\/|\?)/.test(aURIOrRoute)) {

            router = TP.sys.getRouter();

            if (TP.isValid(router)) {
                router.setRoute(TP.str(aURIOrRoute).slice(1));
            }

            return false;
        } else {
            //  This is a link anchor target - build up the proper adjusted
            //  path and set it.
            loc = top.location.toString();

            head = TP.uriHead(loc);
            tail = TP.uriFragmentParameters(loc);

            if (TP.notEmpty(tail)) {
                tail = '?' + tail;
            } else {
                tail = '';
            }

            path = head + aURIOrRoute + tail;
            TP.sys.getHistory().pushLocation(path);

            return true;
        }
    }

    if (!TP.isURIString(aURIOrRoute)) {
        TP.raise(this, 'TP.sig.InvalidURI');
        return false;
    }

    if (TP.notValid(context = linkContext)) {
        //  NB: We go after the native Window here to match this call's API.
        context = TP.sys.getUICanvas(true);
    }

    if (!TP.isWindow(context)) {
        TP.raise(this, 'TP.sig.InvalidWindow');
        return false;
    }

    //  Push the location. This will trigger TIBET's route() machinery to handle
    //  the actual page/canvas update.
    TP.sys.getHistory().pushLocation(aURIOrRoute);

    return false;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('handle',
function(anObject, aSignal, aHandlerName, ignoreMisses) {

    /**
     * @method handle
     * @summary Directly invokes a signal handler, ensuring that any signal
     *     stack manipulation necessary to keep the overall signaling system in
     *     sync is performed. This is the preferred method of invoking a handler
     *     directly from within your code.
     * @param {Object} anObject The object to handle the signal.
     * @param {TP.sig.Signal} aSignal The signal to handle.
     * @param {String} aHandlerName An optional specific handler name, used
     *     instead of 'handle' to speed dispatch to the handler function by
     *     bypassing normal callBestMethod() lookup semantics for the signal.
     * @param {Boolean} ignoreMisses True to turn off warnings when the handler
     *     can't be invoked.
     */

    var ignore,
        handlerName,

        oldHandler,

        retVal;

    handlerName = TP.ifEmpty(aHandlerName, 'handle');
    ignore = TP.ifInvalid(ignoreMisses, false);

    if (!TP.canInvoke(anObject, handlerName)) {
        TP.ifWarn() && !ignore && TP.sys.shouldLogSignals() ?
            TP.warn(TP.annotate(anObject,
                'Direct ' + handlerName + ' invocation failed.'),
                TP.SIGNAL_LOG) : 0;

        return;
    }

    if (TP.notValid(aSignal)) {
        TP.ifWarn() && !ignore && TP.sys.shouldLogSignals() ?
            TP.warn(TP.join('Direct ', handlerName, ' invocation failed. ',
                'No signal name or instance provided.'),
                TP.SIGNAL_LOG) : 0;

        return;
    }

    //  preserve 'ignore semantics' so even direct invocations through this
    //  mechanism can't override a decision by a handler to be ignored.
    if (aSignal.hasNotified(anObject, anObject) ||
        aSignal.hasNotified(anObject[handlerName], anObject)) {
        return;
    }

    //  the thing about forcing manual invocation of handlers is that it can
    //  get the signal stack out of sync, so we manage it directly here
    TP.$signal_stack.push(aSignal);

    try {
        oldHandler = aSignal.$get('currentHandler');
        aSignal.$set('currentHandler', anObject[handlerName], false);
        retVal = anObject[handlerName](aSignal);
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'Handler invocation error.')) : 0;
    } finally {
        TP.$signal_stack.pop();

        aSignal.trackHandler(anObject, anObject);
        aSignal.trackHandler(anObject[handlerName], anObject);

        aSignal.$set('currentHandler', oldHandler, false);
    }

    return retVal;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
