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

/* JSHint checking */

/* global $signal_stack:true,
          $signal:true
*/

//  ------------------------------------------------------------------------
//  SHORTCUT UTILITIES
//  ------------------------------------------------------------------------

TP.definePrimitive('context',
function(varargs) {

    /**
     * @name context
     * @synopsis Returns a useful context for constraining a search for one or
     *     more elements. This operation is used during the various TP.by* and
     *     TP.$() calls to try to optimize lookup times. Typical arguments
     *     include windows, documents, or elements which might be used to root a
     *     search. The first true element found is returned, followed by the
     *     best documentElement possible.
     * @param {Object|String} varargs Zero or more valid objects or IDs to
     *     choose between.
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
     * @name idcall
     * @synopsis Messages the element in question, if possible. The element is
     *     acquired and wrapped, and then the resulting wrapper's method is
     *     invoked if possible, otherwise the method is attempted on the
     *     unwrapped element directly.
     * @param {String} aMethodName The name of a method on the TP object (i.e.
     *     'nodeGetElementsByTagName');.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @param {Object} varargs Optional additional arguments to pass to the
     *     method.
     * @returns {Object} The results of the method invocation, or an array of
     *     such results.
     * @todo
     */

    var elem,
        arglist,
        arr,
        len,
        i,
        item,
        wrapper;

    if (TP.notValid(elemOrId)) {
        elemOrId = TP.sys.getWindowById(TP.sys.getUICanvasName());
    }

    //  use a combination of element and context to find the focal
    //  element(s) for the call
    elem = TP.isString(elemOrId) ?
                TP.byId(elemOrId, TP.context(nodeContext)) :
                TP.elem(elemOrId);

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
     * @name tpcall
     * @synopsis A common wrapper for calling a TP primitive with an optional
     *     root element, an optional canvas context, and one or more optional
     *     arguments to forward to the method being invoked.
     * @param {String} aMethodName The name of a method on the TP object (i.e.
     *     'nodeGetElementsByTagName');.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @param {Object} varargs Optional additional arguments to pass to the
     *     method.
     * @returns {Object} The results of the method invocation, or an array of
     *     such results.
     * @todo
     */

    var elem,
        arglist,
        arr,
        len,
        i,
        item;

    if (TP.notValid(elemOrId)) {
        elemOrId = TP.sys.getWindowById(TP.sys.getUICanvasName());
    }

    //  use a combination of element and context to find the focal
    //  element(s) for the call
    elem = TP.isString(elemOrId) ?
                TP.byId(elemOrId, TP.context(nodeContext)) :
                TP.elem(elemOrId);

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

TP.definePrimitive('$',
function(anObject, nodeContext, collapse) {

    /**
     * @name $
     * @synopsis Performs a variety of operations depending on the parameters
     *     supplied. These include TP.wrap()ping non-String objects, generating
     *     elements from markup, selecting objects based on aspect, CSS and
     *     XPath queries and obtaining the content of URI objects.
     * @description The parameters to this method vary greatly depending on what
     *     the caller is trying to do with it: - If anObject is any Object other
     *     than a String, then it is TP.wrap()'d and returned. - If
     *     anObject is a URI, then a TP.core.URI is constructed from it and that
     *     URI's resource is returned. - If anObject can be determined to be
     *     markup, then an instance of TP.core.ElementNode (or a subtype) is
     *     generated from it and returned. - If anObject is a 'query path' (i.e.
     *     an aspect, CSS or XPath query), then the query is executed against
     *     the supplied context and the resulting object is returned. - If the
     *     context is not supplied and the query path is an aspect path, then
     *     this function will return null. - If the context is not supplied and
     *     the query path is a CSS path or XPath path, this function will obtain
     *     a context via the TP.context() function and execute the query against
     *     that. See that function for more information. Note that this method
     *     will *always* TP.wrap() the results it gets.
     * @param {Object} anObject The object to process via the supplied context
     *     See the discussion for more information.
     * @param {Object} nodeContext The context in which to resolve the query.
     *     See the discussion for more information.
     * @param {Object} collapse Should result lists be autocollapsed
     *     (essentially sugaring for results.first()) or not. Default is true.
     * @raises TP.sig.InvalidParameter
     * @returns {Object} The result as detailed in this function's discussion.
     * @todo
     */

    var context,
        result,
        autocollapse;

    if (TP.notValid(anObject)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  If anObject is not a String, then just return the TP.wrap()ped content.
    if (!TP.isString(anObject)) {
        return TP.wrap(anObject);
    }

    //  If anObject is the empty String, we can't query on that, so return
    //  null.
    if (TP.isEmpty(anObject)) {
        return null;
    }

    //  If anObject is a URI, then construct a TP.core.URI with it and return
    //  the content that that URI points to.
    if (TP.isURI(anObject)) {
        return TP.uc(anObject).getResource(TP.hc('async', false));
    }

    //  If anObject is markup, then create an Element from it and TP.wrap() it.
    if (TP.regex.IS_ELEM_MARKUP.test(anObject)) {
        return TP.wrap(TP.elem(anObject));
    }

    //  Compute a context from either the supplied context (which could be
    //  any Object) or the return value from a TP.context() (which will
    //  always compute Nodes as the context).
    context = TP.context(nodeContext);

    autocollapse = TP.ifInvalid(collapse, true);

    //  Note here how we pass 'true' to auto-collapse single-item Arrays
    //  into just the item.
    result = TP.nodeEvaluatePath(context, anObject, null, autocollapse);
    if (TP.isValid(result)) {
        return TP.wrap(result);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('byContent',
function(textOrRegExp, nodeContext, autoCollapse) {

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('byCSS',
function(cssExpr, nodeContext, autoCollapse) {

    /**
     * @name byCSS
     * @synopsis Returns the result of running a TP.nodeEvaluateCSS() call using
     *     the context provided, or the current window's document.
     * @param {String} cssExpr The CSS expression to use for the query.
     * @param {Object} nodeContext A context in which to resolve the CSS
     *     query.
     *     Default is the current canvas.
     * @param {Boolean} autoCollapse Whether to collapse Array results if
     *     there's only one item in them. The default is false.
     * @raises TP.sig.InvalidString
     * @returns {Element|Array} The Array of matched Elements or a single
     *     Element if single-item Arrays are being collapsed.
     * @todo
     */

    var node;

    if (TP.notValid(cssExpr)) {
        return TP.raise(TP.byCSS, 'TP.sig.InvalidString',
                        'Empty CSS expression not allowed.');
    }

    node = TP.context(nodeContext);

    return TP.nodeEvaluateCSS(node, cssExpr, autoCollapse);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('byId',
function(anID, nodeContext) {

    /**
     * @name byId
     * @synopsis Returns the result of running a TP.nodeGetElementById() call
     *     using the context provided, or the current window's document.
     * @param {String} anID The ID to search for.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @raises TP.sig.InvalidID
     * @returns {Element|Array} The element, if found, or an array when more
     *     than one ID was provided.
     * @todo
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
        TP.raise(TP.byId, 'TP.sig.InvalidID',
                                        'Path-style IDs not allowed.');
        return;
    }

    id = TP.str(anID);
    node = TP.context(nodeContext, TP.byId.$$context);

    //  allow either string or array as ID definition, but turn into an
    //  array of 1 or more IDs to locate
    list = TP.isString(id) ? id.split(' ') : id;
    len = list.getSize();

    if (len > 1) {
        arr = TP.ac();
        for (i = 0; i < len; i++) {
            arr.atPut(i, TP.nodeGetElementById(node, list.at(i)));
        }

        //  remove nulls for any IDs not found and hook contents
        return arr.compact();
    } else {
        //  NOTE we force XPath usage when not found and XML
        return TP.nodeGetElementById(node, id, true);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('byJS',
function(selectionFunc, nodeContext, autoCollapse) {

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('byOID',
function(anID, nodeContext) {

    /**
     * @name byOID
     * @synopsis A convenience wrapper for the TP.sys.getObjectById() call.
     *     NOTE: unlike the other TP.by* calls this function begins its search
     *     with the TIBET object registry and proceeds to check the UI
     *     canvas/context only after registrations and other sources have been
     *     tested. Use TP.$() or TP.byId() if you are focused on the UI only.
     * @param {String|Array} anID The ID to search for. NOTE: one advantage of
     *     this call is that the ID can be either a String or an Array. In
     *     String form a space-separated list becomes an array.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Array} An array of TP.lang.Objects sharing the name provided.
     * @todo
     */

    var id,
        context,

        list,
        len,

        arr,
        i;

    id = TP.str(anID);
    context = TP.context(nodeContext, TP.byOID.$$context);

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
function(pathExpr, nodeContext, autoCollapse) {

    /**
     * @name byPath
     * @synopsis Returns the result of running a TP.nodeEvaluatePath() call
     *     using the context provided, or the current window's document.
     * @param {String} pathExpr The path expression to use for the query.
     * @param {Object} nodeContext A context in which to resolve the path
     *     query.
     *     Default is the current canvas.
     * @param {Boolean} autoCollapse Whether to collapse Array results if
     *     there's only one item in them. The default is false.
     * @raises TP.sig.InvalidString
     * @returns {Element|Array} The Array of matched Elements or a single
     *     Element if single-item Arrays are being collapsed.
     * @todo
     */

    var node;

    if (TP.notValid(pathExpr)) {
        return TP.raise(TP.byPath, 'TP.sig.InvalidString',
                        'Empty path expression not allowed.');
    }

    node = TP.context(nodeContext);

    return TP.nodeEvaluatePath(node, pathExpr, null, autoCollapse);
});

//  ------------------------------------------------------------------------
//  ATTRIBUTE SHORTCUTS
//  ------------------------------------------------------------------------

TP.definePrimitive('addAttr',
function(elemOrId, attrName, attrValue, checkAttrNSURI, nodeContext) {

    /**
     * @name addAttr
     * @synopsis A convenience wrapper for TP.elementAddAttributeValue. The
     *     element definition is resolved via TP.byId(). The resulting
     *     element(s) are then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} attrName The attribute name value to find, with optional
     *     NS: prefix.
     * @param {String} attrValue The attribute value to add.
     * @param {Boolean} checkAttrNSURI True will cause this method to be more
     *     rigorous in its checks for prefixed attributes, and will use calls to
     *     actually set the attribute into that namespace. Default is false (to
     *     keep things faster).
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @todo
     */

    return TP.tpcall(
                'elementAddAttributeValue',
                elemOrId, nodeContext, attrName, attrValue, checkAttrNSURI);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getAttr',
function(elemOrId, attrName, checkAttrNSURI, nodeContext) {

    /**
     * @name getAttr
     * @synopsis A convenience wrapper for TP.elementGetAttribute. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} attrName The attribute name value to find, with optional
     *     NS: prefix.
     * @param {Boolean} checkAttrNSURI True will cause this method to be more
     *     rigorous in its checks for prefixed attributes, looking via URI
     *     rather than just prefix. Default is false (to keep things faster).
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {String} The attribute value, if found or null if the element
     *     couldn't be obtained.
     * @todo
     */

    return TP.tpcall('elementGetAttribute',
                        elemOrId, nodeContext, attrName, checkAttrNSURI);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('hasAttr',
function(elemOrId, attrName, checkAttrNSURI, nodeContext) {

    /**
     * @name hasAttr
     * @synopsis A convenience wrapper for TP.elementHasAttribute. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} attrName The attribute name value to find, with optional
     *     NS: prefix.
     * @param {Boolean} checkAttrNSURI True will cause this method to be more
     *     rigorous in its checks for prefixed attributes, and will use calls to
     *     actually check for the attribute in that namespace. Default is false
     *     (to keep things faster).
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Boolean} True if the attribute exists.
     * @todo
     */

    return TP.tpcall('elementHasAttribute',
                        elemOrId, nodeContext, attrName, checkAttrNSURI);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('removeAttr',
function(elemOrId, attrName, checkAttrNSURI, nodeContext) {

    /**
     * @name removeAttr
     * @synopsis A convenience wrapper for TP.elementRemoveAttribute. The
     *     element definition is resolved via TP.byId(). The resulting
     *     element(s) are then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} attrName The attribute name value to remove, with
     *     optional NS: prefix.
     * @param {Boolean} checkAttrNSURI True will cause this method to be more
     *     rigorous in its checks for prefixed attributes, and will use calls to
     *     actually set the attribute into that namespace. Default is false (to
     *     keep things faster).
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @todo
     */

    return TP.tpcall('elementRemoveAttribute',
                        elemOrId, nodeContext, attrName, checkAttrNSURI);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('replaceAttr',
function(elemOrId, attrName, oldValue, newValue, checkAttrNSURI, nodeContext) {

    /**
     * @name replaceAttr
     * @synopsis A convenience wrapper for TP.elementReplaceAttributeValue. The
     *     element definition is resolved via TP.byId(). The resulting
     *     element(s) are then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} attrName The attribute name value to set, with optional
     *     NS: prefix.
     * @param {String} oldValue The attribute value to find.
     * @param {String} newValue The attribute value to set.
     * @param {Boolean} checkAttrNSURI True will cause this method to be more
     *     rigorous in its checks for prefixed attributes, and will use calls to
     *     actually set the attribute into that namespace. Default is false (to
     *     keep things faster).
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @todo
     */

    return TP.tpcall(
        'elementReplaceAttributeValue',
        elemOrId, nodeContext, attrName, oldValue, newValue, checkAttrNSURI);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('setAttr',
function(elemOrId, attrName, attrValue, checkAttrNSURI, nodeContext) {

    /**
     * @name setAttr
     * @synopsis A convenience wrapper for TP.elementSetAttribute. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} attrName The attribute name value to set, with optional
     *     NS: prefix.
     * @param {String} attrValue The attribute value to set.
     * @param {Boolean} checkAttrNSURI True will cause this method to be more
     *     rigorous in its checks for prefixed attributes, and will use calls to
     *     actually set the attribute into that namespace. Default is false (to
     *     keep things faster).
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @todo
     */

    return TP.tpcall(
                'elementSetAttribute',
                elemOrId, nodeContext, attrName, attrValue, checkAttrNSURI);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('toggleAttr',
function(elemOrId, attrName, nodeContext) {

    /**
     * @name toggleAttr
     * @synopsis A convenience wrapper which will toggle a Boolean attribute,
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
     * @todo
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
     * @name addClass
     * @synopsis A convenience wrapper for TP.elementAddClass. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} className The class value to add.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     * @todo
     */

    return TP.tpcall('elementAddClass',
                        elemOrId, nodeContext, className);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getClass',
function(elemOrId, nodeContext) {

    /**
     * @name getClass
     * @synopsis A convenience wrapper for TP.elementGetClass. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {String} An potentially space-separated string of class names.
     * @todo
     */

    return TP.tpcall('elementGetClass',
                        elemOrId, nodeContext);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('hasClass',
function(elemOrId, className, nodeContext) {

    /**
     * @name hasClass
     * @synopsis A convenience wrapper for TP.elementHasClass. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} className The class value to check.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Boolean} True if the element has the named class.
     * @todo
     */

    return TP.tpcall('elementHasClass',
                        elemOrId, nodeContext, className);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('removeClass',
function(elemOrId, className, nodeContext) {

    /**
     * @name removeClass
     * @synopsis A convenience wrapper for TP.elementRemoveClass. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} className The class value to remove.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     * @todo
     */

    return TP.tpcall('elementRemoveClass',
                        elemOrId, nodeContext, className);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('replaceClass',
function(elemOrId, oldClass, newClass, nodeContext) {

    /**
     * @name replaceClass
     * @synopsis A convenience wrapper for TP.elementReplaceClass. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} oldClass The class value to find.
     * @param {String} newClass The class value to set.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     * @todo
     */

    return TP.tpcall('elementReplaceClass',
                        elemOrId, nodeContext, oldClass, newClass);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('setClass',
function(elemOrId, className, nodeContext) {

    /**
     * @name setClass
     * @synopsis A convenience wrapper for TP.elementSetClass. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} className The class value to set.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     * @todo
     */

    return TP.tpcall('elementSetClass',
                        elemOrId, nodeContext, className);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('toggleClass',
function(elemOrId, className, nodeContext) {

    /**
     * @name toggleClass
     * @synopsis A convenience wrapper which will toggle a class, meaning that
     *     if the class is present it is removed, and if it's not present it
     *     will be added. The element definition is resolved via TP.byId(). The
     *     resulting element(s) are then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} className The class value to toggle.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     * @todo
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
     * @name addContent
     * @synopsis A convenience wrapper for TP.core.Node's addContent call. The
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
     * @todo
     */

    return TP.idcall('addContent',
                        elemOrId, nodeContext, newContent, aRequest);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getContent',
function(elemOrId, nodeContext) {

    /**
     * @name getContent
     * @synopsis A convenience wrapper for TP.core.Node's getContent call. The
     *     element definition is resolved via TP.byId(). The resulting
     *     element(s) are then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     * @todo
     */

    return TP.idcall('getContent', elemOrId, nodeContext);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('insertContent',
function(elemOrId, newContent, aLocation, aRequest, nodeContext) {

    /**
     * @name insertContent
     * @synopsis A convenience wrapper for TP.core.Node's insertContent call.
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
     * @todo
     */

    return TP.idcall('insertContent',
                    elemOrId, nodeContext, newContent, aLocation, aRequest);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('removeContent',
function(elemOrId, nodeContext) {

    /**
     * @name removeContent
     * @synopsis A convenience wrapper for TP.core.CollectionNode's empty call.
     *     The element definition is resolved via TP.byId(). The resulting
     *     element(s) are then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     * @todo
     */

    return TP.idcall('empty', elemOrId, nodeContext);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('setContent',
function(elemOrId, newContent, aRequest, nodeContext) {

    /**
     * @name setContent
     * @synopsis A convenience wrapper for TP.core.Node's setContent call. The
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
     * @todo
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
     * @name removeElem
     * @synopsis Removes an element from the DOM. This method operates by
     *     locating the element's parentNode and asking it to remove the child.
     *     The element definition is resolved via TP.byId(). The resulting
     *     element(s) are then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     * @todo
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
     * @name replaceElem
     * @synopsis Removes an element from the DOM. This method operates by
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
     * @todo
     */

    var elem,
        newelem,

        len,
        i;

    elem = TP.byId(oldElemOrId, TP.context(nodeContext));
    newelem = TP.byId(newElemOrId, TP.context(nodeContext));

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
 * @todo
 */

//  ------------------------------------------------------------------------

TP.definePrimitive('addStyle',
function(elemOrId, aProperty, aValue, nodeContext) {

    /**
     * @name addStyle
     * @synopsis A convenience wrapper for TP.elementAddStyle. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} aProperty The style property to modify.
     * @param {String} aValue The property value to add.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     * @todo
     */

    return TP.tpcall('elementAddStyle',
                        elemOrId, nodeContext, aProperty, aValue);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('getStyle',
function(elemOrId, aProperty, nodeContext) {

    /**
     * @name getStyle
     * @synopsis A convenience wrapper for TP.elementGetStyle. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} aProperty The style property to get. Default is empty,
     *     which returns the entire style string.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {String} A CSS style string.
     * @todo
     */

    return TP.tpcall('elementGetStyle', elemOrId, nodeContext, aProperty);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('hasStyle',
function(elemOrId, aProperty, nodeContext) {

    /**
     * @name hasStyle
     * @synopsis A convenience wrapper for TP.elementHasStyle. The element
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
     * @todo
     */

    return TP.tpcall('elementHasStyle', elemOrId, nodeContext, aProperty);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('preserveStyle',
function(elemOrId, nodeContext) {

    /**
     * @name preserveStyle
     * @synopsis A convenience wrapper for TP.elementPreserveStyle. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     * @todo
     */

    return TP.tpcall('elementPreserveStyle', elemOrId, nodeContext);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('removeStyle',
function(elemOrId, aProperty, nodeContext) {

    /**
     * @name removeStyle
     * @synopsis A convenience wrapper for TP.elementRemoveStyle. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} aProperty The style property to remove.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     * @todo
     */

    return TP.tpcall('elementRemoveStyle', elemOrId, nodeContext, aProperty);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('replaceStyle',
function(elemOrId, aProperty, oldStyle, newStyle, nodeContext) {

    /**
     * @name replaceStyle
     * @synopsis A convenience wrapper for TP.elementReplaceStyle. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} aProperty The style property to update.
     * @param {String} oldStyle The style value to find.
     * @param {String} newStyle The style value to set.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     * @todo
     */

    return TP.tpcall('elementReplaceStyle',
                        elemOrId, nodeContext, aProperty, oldStyle, newStyle);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('restoreStyle',
function(elemOrId, nodeContext) {

    /**
     * @name restoreStyle
     * @synopsis A convenience wrapper for TP.elementRestoreStyle. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     * @todo
     */

    return TP.tpcall('elementRestoreStyle', elemOrId, nodeContext);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('setStyle',
function(elemOrId, aProperty, aValue, nodeContext) {

    /**
     * @name setStyle
     * @synopsis A convenience wrapper for TP.elementSetStyle. The element
     *     definition is resolved via TP.byId(). The resulting element(s) are
     *     then used as roots for the operation.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {String} aProperty The style property to update.
     * @param {String} aValue The style value to set.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     * @todo
     */

    return TP.tpcall('elementSetStyle',
                        elemOrId, nodeContext, aProperty, aValue);
});

//  ------------------------------------------------------------------------
//  EFFECTS
//  ------------------------------------------------------------------------

TP.definePrimitive('animate',
function(anElement, propertyName, animationParams, nodeContext) {

    /**
     * @name animate
     * @synopsis A convenience wrapper for invoking a
     *     TP.core.CSSPropertyTransition. The element definition is resolved via
     *     TP.byId(). The resulting element(s) are then used as the targets of
     *     the transition.
     * @param {Array|String|Element} anElement An element specification, or
     *     element, suitable for TP.byId().
     * @param {String} propertyName The name of the property to transition.
     * @param {TP.lang.Hash} animationParams A hash of parameters to use for the
     *     transition.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {TP.core.Job} The TP.core.Job object that is managing the
     *     transition.
     * @todo
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

    animationJob = TP.core.CSSPropertyTransition.transition(
                                elems,
                                propertyName,
                                animationParams);

    return animationJob;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('effect',
function(anElement, effectName, effectParams, nodeContext) {

    /**
     * @name effect
     * @synopsis A convenience wrapper for invoking a subtype of TP.core.Effect.
     *     The element definition is resolved via TP.byId(). The resulting
     *     element(s) are then used as the targets of the effect.
     * @description The name of the effect type to use to run the supplied
     *     effect name is computed by taking the supplied effect name,
     *     capitalizing the first letter and then prefixing it with 'TP.core.'
     *     and suffixing it with 'Effect'. E.g. 'puff' becomes
     *     'TP.core.PuffEffect'.
     * @param {Array|String|Element} anElement An element specification, or
     *     element, suitable for TP.byId().
     * @param {String} effectName The name of the effect to use.
     * @param {TP.lang.Hash} effectParams A hash of parameters to use for the
     *     effect.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {TP.core.Job} The TP.core.Job object that is managing the
     *     effect.
     * @todo
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
    effectTypeName = effectName.asStartUpper() + 'Effect';

    //  Make sure that we have a real type here.

    if (TP.notValid(effectType = effectTypeName.asType())) {
        //  Try again with the 'TP.core.' prefix.
        effectTypeName = 'TP.core.' + effectName.asStartUpper() + 'Effect';

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
        elems = TP.byId(anElement, TP.context(nodeContext));
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

            if (TP.isArray(theElements)) {
                theElements.perform(
                    function(anElement) {

                        //  If the element already had a job running that
                        //  was associated with the same effect that we're
                        //  invoking, clear it.
                        if (TP.isValid(anElement['effect_' + effectName])) {
                            anElement['effect_' + effectName] = null;
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
        });

    //  Instrument the individual elements that we are touching with the
    //  job. These will allow the deactivation routine below to prematurely
    //  terminate the job if another TP.effect() call is called on the same
    //  element.

    elems.perform(
        function(anElement) {

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
            if (TP.isValid(prevJob = anElement['effect_' + effectName]) &&
                !prevJob.didComplete()) {
                //  If the job has elements that it is animating and there
                //  is more than 1 element in that set, then we're not the
                //  only one, so we just remove ourself from the list of
                //  elements.
                if (TP.isValid(params = prevJob.$get('parameters')) &&
                    TP.isArray(allElems = params.at('target')) &&
                    (allElems.length > 1)) {
                    for (i = 0; i < allElems.length; i++) {
                        if (allElems[i] === anElement) {
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
            anElement['effect_' + effectName] = transitionJob;
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
     * @name Arms a node or list of them with the event or events given.
     * @param {Node|String} aNodeOrList The node or list of nodes to arm with
     *     the event(s) specified. This can also be the TP.ANY constant,
     *     indicating that the event is to be observed coming from any node.
     * @param {String|Array} eventNames The names or types of the events to arm
     *     the element with.
     * @param {Function} aHandler An (optional) parameter that defines a native
     *     handler to be used instead of sending the event into the TIBET
     *     signaling system.
     * @param {Function} aPolicy An (optional) parameter that defines the
     *     "firing" policy.
     * @param {Window} nodeContext An optional window to search for the
     *     element(s). If not provided then the TP.context() method is used to
     *     find one.
     * @todo
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
            type = TP.sys.require(signal);
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
     * @name button
     * @synopsis Returns the button code for the supplied event, which is one of
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
     * @name coord
     * @synopsis Returns the 'document-level' X and Y for the supplied event or
     *     element object.
     * @param {Event|String|} anObject An event object or an
     *     Element|TP.lang.Hash| element specification, Array|TP.core.Point or
     *     element, suitable for TP.byId() or a hash or point with 'x' and 'y'
     *     values or an array with an X 'value' in the first position and a Y
     *     value in the second.
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Array} The X and Y as a point pair.
     * @todo
     */

    var elem;

    if (TP.isEvent(anObject)) {
        return TP.eventGetPageXY(anObject);
    }

    if (TP.isArray(anObject)) {
        return anObject;
    }

    if (TP.isKindOf(anObject, TP.lang.Hash) ||
        TP.isKindOf(anObject, TP.core.Point)) {
        return TP.ac(anObject.at('x'), anObject.at('y'));
    }

    //  use a combination of element and context to find the focal
    //  element(s) for the call
    elem = TP.isString(anObject) ?
                TP.byId(anObject, TP.context(nodeContext)) :
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
     * @name Disarms a node or list of them for the event or events.
     * @param {Node|String} aNodeOrList The node or list of nodes to disarm with
     *     the event(s) specified. This can also be the TP.ANY constant.
     * @param {String|Array} eventNames The names or types of the events to
     *     disarm.
     * @param {Function} aHandler An (optional) parameter that defines a native
     *     handler to be used instead of sending the event into the TIBET
     *     signaling system.
     * @param {Window} nodeContext An optional window to search for the
     *     element(s).
     *     If not provided then the TP.context() method is used to fine one.
     * @todo
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
            type = TP.sys.require(signal);
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
     * @name event
     * @synopsis Returns a normalized event, meaning a native event that has
     *     been instrumented to conform to the W3C standard and to have properly
     *     adjusted values for key, shift, alt, meta, etc.
     * @param {Event} anEvent The native event to normalize. Default is
     *     window.event so this can be called with an empty value on IE.
     * @returns {Event} The normalized native event.
     * @todo
     */

    return TP.eventNormalize(anEvent || window.event);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('keyname',
function(anEvent) {

    /**
     * @name keyname
     * @synopsis Returns the properly adjusted key name for the event. This
     *     should be correct provided that the event was acquired from a
     *     DOMKeySignal rather than prior to TP.core.Keyboard handling.
     * @param {Event} anEvent The event object to extract the key name from.
     * @returns {String} The base key name, such as A, Escape, etc.
     */

    return TP.core.Keyboard.getEventVirtualKey(anEvent);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('domkeysigname',
function(anEvent) {

    /**
     * @name domkeysigname
     * @synopsis Returns the properly adjusted DOM signal name for the DOM. This
     *     should be correct provided that the event was acquired from a
     *     TP.sig.DOMKeySignal rather than prior to TP.core.Keyboard handling.
     * @param {Event} anEvent The event object to extract the signal name from.
     * @returns {String} The full signal name such as DOM_Shift_Enter_Up.
     */

    return TP.core.Keyboard.getDOMSignalName(anEvent);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('wheel',
function(anEvent) {

    /**
     * @name wheel
     * @synopsis Returns the wheel delta value from the event provided. The
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
     * @name compact
     * @synopsis Returns a compacted version of the object. For arrays this
     *     removes nulls, for Strings it removes consecutive sequences of
     *     whitespace (and trims the string). Other objects may have their own
     *     approach to this, for example, a TP.lang.Hash will remove keys whose
     *     values are undefined or null.
     * @param {Object} anObject The object to compact.
     * @param {Function} aFilter An optional filtering function defining which
     *     values are retained.
     * @returns {Object} The compacted object, which may be a new object.
     * @todo
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
     * @name elemget
     * @synopsis Returns the element(s) response to a get(anAspect), or a direct
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
     * @todo
     */

    var aspect,
        list,
        arr,
        len,
        i;

    aspect = anAspect || 'value';

    list = TP.byId(elemOrId, nodeContext);

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
     * @name elemset
     * @synopsis Sets the value of the element(s) anAspect slot to aValue. The
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
     * @todo
     */

    var aspect,
        list,
        len,
        i,
        obj;

    aspect = anAspect || 'value';

    list = TP.byId(elemOrId, nodeContext);
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
                }
            } else {
                //  TODO:   warn?
                void(0);
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
            }
        } else {
            //  TODO:   warn?
            void(0);
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
     * @name focus
     * @synopsis Focuses the element in question, if possible. The element is
     *     acquired and wrapped, and then the resulting wrapper's focus() method
     *     is invoked if possible, otherwise a focus is attempted on the
     *     unwrapped element directly.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     * @todo
     */

    return TP.idcall('focus', elemOrId, nodeContext);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('reset',
function(elemOrId, nodeContext) {

    /**
     * @name reset
     * @synopsis Resets the element in question, if possible. The element is
     *     acquired and wrapped, and then the resulting wrapper's reset() method
     *     is invoked if possible, otherwise a reset is attempted on the
     *     unwrapped element directly.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     * @todo
     */

    return TP.idcall('reset', elemOrId, nodeContext);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('select',
function(elemOrId, nodeContext) {

    /**
     * @name select
     * @synopsis Selects the element in question, if possible. The element is
     *     acquired and wrapped, and then the resulting wrapper's select()
     *     method is invoked if possible, otherwise a select is attempted on the
     *     unwrapped element directly.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     * @todo
     */

    return TP.idcall('select', elemOrId, nodeContext);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('submit',
function(elemOrId, nodeContext) {

    /**
     * @name submit
     * @synopsis Submits the element in question, if possible. The element is
     *     acquired and wrapped, and then the resulting wrapper's submit()
     *     method is invoked if possible, otherwise a submit is attempted on the
     *     unwrapped element directly.
     * @param {String|Element} elemOrId An element specification, or element,
     *     suitable for TP.byId().
     * @param {Object} nodeContext A context in which to resolve element IDs.
     *     Default is the current canvas.
     * @returns {Element} The element.
     * @todo
     */

    return TP.idcall('submit', elemOrId, nodeContext);
});

//  ------------------------------------------------------------------------
//  REFLECTION BASE
//  ------------------------------------------------------------------------

TP.definePrimitive('dump',
function(anObject) {

    /**
     * @name dump
     * @synopsis Returns the key/value pairs of the object formatted in a
     *     non-markup string.
     * @param {The} anObject object whose properties and simple dump/logging
     *     string should be returned.
     * @returns {String} A simple logging string for the object.
     */

    var str,

        arr,
        len,
        i,

        rules;

    if (anObject === null) {
        return 'null';
    } else if (anObject === undefined) {
        return 'undefined';
    }

    //  XMLHttpRequest can have permission issues, so check early
    if (TP.isXHR(anObject)) {
        return TP.tname(anObject) + ' :: ' +
                anObject.status + ' : ' + anObject.responseText;
    }

    //  native nodes are the next-most likely object being passed to this
    //  routine, so we'll try to build up a proper string here
    if (TP.isNode(anObject)) {
        return TP.tname(anObject) + ' :: ' + TP.nodeAsString(anObject);
    }

    //  got to check Errors next... they freak out if handed to TP.isString().
    if (TP.isError(anObject)) {
        return TP.tname(anObject) + ' :: ' + TP.errorAsString(anObject);
    }

    if (TP.isString(anObject)) {
        return anObject;
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
        return TP.tname(anObject) + ' :: ' + TP.windowAsString(anObject);
    }

    //  Event objects
    if (TP.isEvent(anObject)) {
        return TP.tname(anObject) + ' :: ' + TP.eventAsString(anObject);
    }

    //  NodeList objects
    if (TP.isNodeList(anObject)) {
        arr = TP.ac();

        len = anObject.length;
        for (i = 0; i < len; i++) {
            arr.push(TP.str(anObject[i]));
        }

        return TP.tname(anObject) + ' :: ' + '[' + arr.join(', ') + ']';
    }

    //  NamedNodeMap objects
    if (TP.isNamedNodeMap(anObject)) {
        arr = TP.ac();

        len = anObject.length;
        for (i = 0; i < len; i++) {
            arr.push(TP.name(anObject.item(i)) + ': ' +
                         TP.val(anObject.item(i)));
        }

        return TP.tname(anObject) + ' :: ' + '{' + arr.join(', ') + '}';
    }

    //  Stylesheet objects
    if (TP.isStyleSheet(anObject)) {
        rules = TP.styleSheetGetStyleRules(anObject, false);

        arr = TP.ac();

        len = rules.length;
        for (i = 0; i < len; i++) {
            arr.push(rules[i].cssText);
        }
        return TP.tname(anObject) + ' :: ' + arr.join(' ');
    }

    //  Style rule objects
    if (TP.isStyleRule(anObject)) {
        return TP.tname(anObject) + ' :: ' + anObject.cssText;
    }

    //  Style declaration objects
    if (TP.isStyleDeclaration(anObject)) {
        return TP.tname(anObject) + ' :: ' + anObject.cssText;
    }

    if (TP.canInvoke(anObject, 'asDumpString')) {
        str = anObject.asDumpString();
        if (TP.regex.NATIVE_CODE.test(str)) {
            str = TP.tname(anObject);
        }

        return str;
    }

    //  worst case we just produce our best source-code representation
    return TP.src(anObject);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('inspect',
function(anObject) {

    /**
     * @name inspect
     * @synopsis Returns the key/value pairs of the object formatted in a
     *     renderable markup string. Optional editing capability can be
     *     supported by the resulting markup.
     * @param {The} anObject object whose properties and simple inspection
     *     string should be returned.
     * @returns {String} A simple inspection string for the object.
     * @todo
     */

    var obj;

    obj = TP.wrap(anObject);
    if (obj !== anObject) {
        if (TP.canInvoke(anObject, 'asInspectString')) {
            return anObject.asInspectString();
        }
    }

    if (TP.canInvoke(anObject, 'asInspectString')) {
        return anObject.asInspectString();
    }

    //  worst case we just produce our best source-code representation
    return TP.src(anObject);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('link',
function(anObject, aMessage, aTitle, aCommand) {

    /**
     * @name link
     * @synopsis Constructs and returns an HTML link in text form for the
     *     object. The message portion of the link is either the message
     *     provided or the object's ID. The command is the shell command, if
     *     any, desired. The default command is :edit since most links generated
     *     for objects ultimately target editing as their action.
     * @param {Object} anObject The object to link to.
     * @param {String} aMessage An optional message to use instead of the
     *     object's ID for the link text.
     * @param {String} aTitle The title parameter which will provide a tooltip
     *     for the link.
     * @param {String} aCommand An optional TSH command to use rather than the
     *     default ':edit' command.
     * @returns {String} A string containing an HTML link element.
     * @todo
     */

    var uri,
        msg,
        str,
        title;

    //  Get an acceptible URI to use for referencing the object.
    uri = TP.uri(anObject);

    //  The message portion of the link should be provided, or based on the
    //  "name" portion of the object's URN, or it can be the true location.
    if (TP.isString(aMessage)) {
        msg = TP.trim(aMessage);
    } else if (TP.isKindOf(uri, TP.core.URN)) {
        msg = uri.getName();
    } else {
        msg = uri.getLocation();
    }

    title = TP.stringAsHTMLAttribute(aTitle).quoted('"');

    //  Generate the link which drives the shell command invocation.
    str = TP.join(
        '<a href="#" ', 'title=', title, ' ',
            'onclick="TP.shell(TP.hc(\'cmdSrc\',',
            '\'', aCommand || ':edit ', uri.getLocation(), '\'',
            ', \'cmdEcho\', false, \'cmdHistory\', false, \'cmdSilent\', false,',
            ')); return false;">',
            msg,
        '</a>');

    return str;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('pretty',
function(anObject) {

    /**
     * @name pretty
     * @synopsis Returns the content of the object in a "best looking" form of
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
        return '<dl class="pretty Null"><dt\/><dd>null<\/dd><\/dl>';
    } else if (anObject === undefined) {
        return '<dl class="pretty Undefined"><dt\/><dd>undefined<\/dd><\/dl>';
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
                    '<dt>Type name<\/dt>' +
                    '<dd class="pretty typename">' + TP.tname(anObject) +
                        '<\/dd>' +
                    '<dt class="pretty key">Status<\/dt>' +
                    '<dd class="pretty value">' + xhrStatus + '<\/dd>' +
                    '<dt class="pretty key">Response text<\/dt>' +
                    '<dd class="pretty value">' +
                        TP.str(anObject.responseText).asEscapedXML() +
                    '<\/dd>' +
                '</dl>';
    }

    //  native nodes are the next-most likely object being passed to this
    //  routine, so we'll try to build up a proper string here
    if (TP.isNode(anObject)) {
        return '<dl class="pretty ' + TP.escapeTypeName(TP.tname(anObject)) +
                        '">' +
                    '<dt>Type name<\/dt>' +
                    '<dd class="pretty typename">' + TP.tname(anObject) +
                        '<\/dd>' +
                    '<dt class="pretty key">Content<\/dt>' +
                    '<dd class="pretty value">' +
                        TP.nodeAsString(anObject).asEscapedXML() +
                    '<\/dd>' +
                '<\/dl>';
    }

    //  got to check Errors next... they freak out if handed to TP.isString().
    if (TP.isError(anObject)) {
        return '<dl class="pretty ' + TP.escapeTypeName(TP.tname(anObject)) +
                        '">' +
                    '<dt>Type name<\/dt>' +
                    '<dd class="pretty typename">' + TP.tname(anObject) +
                        '<\/dd>' +
                    '<dt class="pretty key">Message<\/dt>' +
                    '<dd class="pretty value">' +
                        TP.str(anObject.message) +
                    '<\/dd>' +
                '<\/dl>';
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
            arr.push('<dt class="pretty key">', i, '<\/dt>',
                        '<dd class="pretty value">', TP.nodeAsString(anObject[i]).asEscapedXML(), '<\/dd>');
        }

        return '<dl class="pretty ' + TP.escapeTypeName(TP.tname(anObject)) + '">' +
                    '<dt>Type name<\/dt>' +
                    '<dd class="pretty typename">' + TP.tname(anObject) + '<\/dd>' +
                    arr.join('') +
                '<\/dl>';
    }

    //  NamedNodeMap objects
    if (TP.isNamedNodeMap(anObject)) {
        arr = TP.ac();

        len = anObject.length;
        for (i = 0; i < len; i++) {
            arr.push('<dt class="pretty key">', TP.name(anObject.item(i)), '<\/dt>',
                        '<dd class="pretty value">', TP.val(anObject.item(i)), '<\/dd>');
        }

        return '<dl class="pretty ' + TP.escapeTypeName(TP.tname(anObject)) + '">' +
                    '<dt>Type name<\/dt>' +
                    '<dd class="pretty typename">' + TP.tname(anObject) + '<\/dd>' +
                    arr.join('') +
                '<\/dl>';
    }

    //  Stylesheet objects
    if (TP.isStyleSheet(anObject)) {
        rules = TP.styleSheetGetStyleRules(anObject, false);

        arr = TP.ac();

        len = rules.length;
        for (i = 0; i < len; i++) {
            arr.push('<dt class="pretty key">', i, '<\/dt>',
                        '<dd class="pretty value">', rules[i].cssText, '<\/dd>');
        }

        return '<dl class="pretty ' + TP.escapeTypeName(TP.tname(anObject)) + '">' +
                    '<dt>Type name<\/dt>' +
                    '<dd class="pretty typename">' + TP.tname(anObject) + '<\/dd>' +
                    arr.join('') +
                '<\/dl>';
    }

    //  Style rule objects
    if (TP.isStyleRule(anObject)) {
        return '<dl class="pretty ' + TP.escapeTypeName(TP.tname(anObject)) + '">' +
                    '<dt>Type name<\/dt>' +
                    '<dd class="pretty typename">' + TP.tname(anObject) + '<\/dd>' +
                    '<dt class="pretty key">Content<\/dt>' +
                    '<dd class="pretty value">' + anObject.cssText + '<\/dd>' +
                '<\/dl>';
    }

    //  Style declaration objects
    if (TP.isStyleDeclaration(anObject)) {
        return '<dl class="pretty ' + TP.escapeTypeName(TP.tname(anObject)) + '">' +
                    '<dt>Type name<\/dt>' +
                    '<dd class="pretty typename">' + TP.tname(anObject) + '<\/dd>' +
                    '<dt class="pretty key">Content<\/dt>' +
                    '<dd class="pretty value">' + anObject.cssText + '<\/dd>' +
                '<\/dl>';
    }

    if (TP.canInvoke(anObject, 'asPrettyString')) {
        str = anObject.asPrettyString();
        if (TP.regex.NATIVE_CODE.test(str)) {
            str = TP.tname(anObject);
        }

        return str;
    }

    //  worst case we just produce our best html representation
    return TP.htmlstr(anObject);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('print',
function(anObject) {

    /**
     * @name print
     * @synopsis Returns the content of the object in a standard markup display
     *     form. This is a "simple markup" representation of the content.
     * @param {The} anObject object whose properties and simple print string
     *     should be returned.
     * @returns {String} A simple print string for the object.
     */

    var obj;

    obj = TP.wrap(anObject);
    if (obj !== anObject) {
        if (TP.canInvoke(anObject, 'asPrintString')) {
            return anObject.asPrintString();
        }
    }

    if (TP.canInvoke(anObject, 'asPrintString')) {
        return anObject.asPrintString();
    }

    return TP.htmlstr(anObject);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('recursion',
function(anObject) {

    /**
     * @name recursion
     * @synopsis Returns a string representation of the object which is used
     *     when the object is encountered in a circularly referenced manner
     *     during the production of some sort of formatted String
     *     representation.
     * @param {The} anObject object whose properties and recursion string should
     *     be returned.
     * @returns {String} A 'recursion' string for the object.
     */

    var obj;

    obj = TP.wrap(anObject);
    if (obj !== anObject) {
        if (TP.canInvoke(anObject, 'asRecursionString')) {
            return anObject.asRecursionString();
        }
    }

    if (TP.canInvoke(anObject, 'asRecursionString')) {
        return anObject.asRecursionString();
    }

    //  worst case we just produce our dump representation
    return TP.dump(anObject);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('reflect',
function(anObject, aSlice, aScope, includeHidden, discriminator) {

    /**
     * @name reflect
     * @synopsis Returns the interface of anObject, optionally filtered by the
     *     scope provided. The default scope is 'every'.
     * @param {Object} anObject The object to reflect upon.
     * @param {String} aSlice A slicing key, such as 'methods', 'attributes', or
     *     'properties'.
     * @param {String} aScope A scoping key, such as TP.LOCAL.
     * @param {Boolean} includeHidden True to include hidden (private) keys in
     *     the output.
     * @param {String|RegExp} discriminator A filtering expression to remove
     *     keys not matching the pattern or string.
     * @returns {Array} An array of filtered property keys.
     * @todo
     */

    var key,
        arr,
        i;

    if (TP.notValid(anObject)) {
        return TP.ac();
    }

    if (TP.canInvoke(anObject, 'getInterface')) {
        key = TP.isTrue(includeHidden) ? 'known_' : '';
        key += TP.isString(aScope) ? aScope + '_' : '';
        key += aSlice || 'methods';

        arr = anObject.getInterface(key);
    } else {
        arr = TP.ac();

        //  painful, but necessary
        /* jshint forin:true */
        for (i in anObject) {
            if (TP.regex.INTERNAL_SLOT.test(i)) {
                continue;
            }

            if (TP.notTrue(includeHidden) && TP.regex.PRIVATE_SLOT.test(i)) {
                continue;
            }

            if (!TP.isGlobal(i, true)) {
                arr.push(i);
            }
        }
        /* jshint forin:false */
    }

    arr.sort();

    if (TP.isFunction(discriminator)) {
        return arr.select(discriminator);
    } else if (TP.isValid(discriminator)) {
        return arr.grep(discriminator);
    }

    return arr;
});

//  ------------------------------------------------------------------------
//  COLLECTIONS
//  ------------------------------------------------------------------------

TP.definePrimitive('contains',
function(anObject, aValue) {

    /**
     * @name contains
     * @synopsis Returns true if the object can be shown to clearly contain the
     *     value provided. Indeterminate cases (where the object can't be tested
     *     effectively) return false.
     * @param {Object} anObject The object to test.
     * @param {Object} aValue The value to check for containment.
     * @returns {Boolean} True if the value is clearly contained.
     * @todo
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
     * @name chain
     * @synopsis Returns an Array of objects acquired by recursively invoking
     *     get(aProperty) on anObject. When the object is a node the property is
     *     typically something such as parentNode which provides a list of all
     *     the node's ancestors.
     * @param {Object} anObject The object to root the query at.
     * @param {String} aProperty A property name to query for.
     * @returns {Array} An array of zero to N result objects.
     * @todo
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
function(aURI, aRequest, nodeContext) {

    /**
     * @name go2
     * @synopsis Sets the window's location to the URI provided. The value of
     *     this method is that it tracks history and link access which isn't
     *     done by a typical href or location= invocation.
     * @param {TP.core.URI|String} aURI The URI to focus on.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @param {Object} nodeContext The window to adjust. Defaults to the
     *     $$context placed on this function.
     * @raises TP.sig.InvalidURI
     * @returns {Boolean} Always returns 'false' to avoid anchor link traversal.
     * @todo
     */

    var context,
        type,
        win;

    if (TP.notValid(aURI)) {
        TP.raise(TP.go2, 'TP.sig.InvalidURI');

        return false;
    }

    if (TP.notValid(context = nodeContext)) {
        context = TP.ifInvalid(
                        TP.sys.getWindowById(TP.sys.getUICanvasName()),
                        window);
    }

    type = TP.sys.getTypeByName('TP.core.Window');
    if (TP.notValid(win = type.construct(TP.gid(context)))) {
        TP.raise(TP.go2, 'TP.sig.InvalidWindow');

        return false;
    }

    TP.sys.logLink(aURI, TP.INFO);

    win.setContent(TP.uc(aURI), aRequest);

    return false;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('handle',
function(anObject, aSignal, aHandlerName, ignoreMisses) {

    /**
     * @name handle
     * @synopsis Directly invokes a signal handler, ensuring that any signal
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
     * @todo
     */

    var ignore,
        handlerName;

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
    if (aSignal.isIgnoring(anObject) ||
        aSignal.isIgnoring(anObject[handlerName])) {
        return;
    }

    //  the thing about forcing manual invocation of handlers is that it can
    //  get the signal stack out of sync, so we manage it directly here
    $signal_stack.push(aSignal);
    $signal = aSignal;

    try {
        return anObject[handlerName](aSignal);
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'Handler invocation error.'),
                TP.LOG) : 0;
    } finally {
        $signal = $signal_stack.pop();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('xhr',
function(varargs) {

    /**
     * @name xhr
     * @synopsis Constructs a viable TP.sig.RESTRequest for making
     *     XMLHttpRequest calls to a server. The returned instance can be
     *     locally programmed via defineMethod to add callbacks as needed.
     * @param {Array} varargs A variable argument list much like
     *     TP.request() and TP.hc() would accept: TP.xhr(key, value, ...);.
     * @returns {TP.sig.RESTRequest} The constructed request.
     */

    var hash,
        request;

    //  make sure the request will find at least one possible service
    TP.sys.require('TP.core.RESTService');

    hash = TP.lang.Hash.construct.apply(TP.lang.Hash, arguments);
    request = TP.sys.require('TP.sig.RESTRequest').construct(hash);

    return request;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
