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
Low-level content processing support.
*/

//  ========================================================================
//  JSON
//  ========================================================================

/**
 * @subject JSONJavaScript Object Notation (JSON) is a restricted subset of
 *     JavaScriptsource code which is suitable for use as a simple data
 *     transport format.
 *
 *     Due to what some consider to be a security loophole in all current
 *     browsers-- one that will likely remain unpatched for the forseeable
 *     future -- JSONrequests made via dynamic script node addition can be used
 *     to circumventcross-domain scripting restrictions enforced by
 *     XMLHttpRequest. This hasmade it popular with developers who don't have
 *     strong XML requirements.
 *
 *     The implementation below invokes the open source JSON serializer from
 *     Crockford, et. al., which can be found at the end of this file.More
 *     information about JSON can be found at:
 *
 *     http://www.json.org
 *
 *     There is also built-in JSONML support. More information about this can be
 *     found at:
 *
 *     http://www.jsonml.org
 *
 *     Changes to these pieces of code are focused primarily on avoiding the use
 *     offor/in which is inappropriate in environments which modify prototypes
 *     in thefashion used by TIBET.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.regex.JSON_ISODATE =
    /^(\d{4})-?(\d{2})?-?(\d{2})?(T(\d{2})(:(\d{2})(:(\d{2})(\.(\d{1,3}))?)?)?)?(Z)?([\+\-]\d{2}:\d{2})?$/;

TP.regex.JSON_ERRMSG = /^JSONP call error: /;

//  ------------------------------------------------------------------------

TP.definePrimitive('getJSONPIFrame',
function() {

    /**
     * @name getJSONPIFrame
     * @synopsis Retrieves the iframe used to fetch and/or parse JSON results.
     * @description The iframe returned by this routine is created (once) if it
     *     doesn't exist. It is used by the jsonpCall() to load the actual results
     *     and then scrub it through a serialize/parse cycle to try to avoid
     *     malformed/malicious JSON data.
     * @returns {Element} The iframe element used to manage JSON data.
     */

    var win,
        iframeName,
        iframeElem;

    win = TP.sys.getWindowById(TP.sys.cfg('tibet.uibuffer'));
    if (TP.notValid(win)) {
        win = window;
    }

    // Look up the frame name, or default to an easy-to-spot name.
    iframeName = TP.sys.cfg('tibet.jsonp_frame') || 'JSONP';

    if (!TP.isElement(iframeElem =
                        TP.nodeGetElementById(win.document, iframeName))) {
        iframeElem = TP.documentCreateIFrameElement(win.document,
                                                    null,
                                                    iframeName);
        TP.elementSetAttribute(iframeElem, 'style', 'display: none');
    }

    return iframeElem;
});

//  ------------------------------------------------------------------------
//  JSON source conversions
//  ------------------------------------------------------------------------

TP.definePrimitive('isJSONString',
function(aString) {

    /**
     * @name isJSONString
     * @synopsis Returns whether or not the supplied String can be parsed into a
     *     JSON string.
     * @param {String} aString A JSON-formatted string.
     * @returns {Boolean} Whether or not the supplied String is a JSON-formatted
     *     String.
     */

    var text;

    if (TP.isEmpty(aString)) {
        return false;
    }

    //  avoid changing parameter value
    text = aString;

    try {
        //  Call the 'parse' method on the 'JSON' object.
        JSON.parse(text);

        return true;
    } catch (e) {
        //  We never report here - just return false
        return false;
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('json2js',
function(aString, smartConversion, shouldReport) {

    /**
     * @name json2js
     * @synopsis Transforms a JSON-formatted string into the equivalent
     *     JavaScript objects.
     * @description The TIBET version of this process extends the standard JSON
     *     processing to allow strings in ISO8601 format
     *     (YYYY-MM-DDTHH:MM:SS[Z|+/-HH:MM]) to be reconstituted as Date
     *     instances. For more information on the JSON format see:
     *     http://www.json.org. Note that 'smart conversion' does impose quite a
     *     performance hit, so large blocks of JSON data should probably set it
     *     to false.
     * @param {String} aString A JSON-formatted string.
     * @param {Boolean} smartConversion Whether or not to 'smart convert' the
     *     JSON into JS. This includes detecting for Date data to construct Date
     *     objects, detecting for RegExp data to construct RegExp objects and
     *     construct TP.lang.Hashes instead of Objects. This defaults to true.
     * @param {Boolean} shouldReport False to suppress errors. Default is true.
     * @returns {Object} A JavaScript object containing the JSON data.
     * @raise InvalidJSON
     * @todo
     */

    var text,

        shouldConvert,

        obj,

        newArr,
        i;

    //  avoid changing parameter value
    text = aString;

    //  we default to smart conversion
    shouldConvert = TP.ifInvalid(smartConversion, true);

    try {
        //  Call the 'parse' method on the 'JSON' object supplied.

        if (!shouldConvert) {
            return JSON.parse(text);
        }

        //  We also supply a conversion function to convert Dates and Objects.
        obj = JSON.parse(
                    text,
                    function(key, value) {

                        var newArr,
                            i;

                        //  If the value matches an ISO Date, then turn it
                        //  into a Date object.
                        if (TP.isString(value) &&
                            TP.regex.JSON_ISODATE.test(value)) {
                            return TP.dc(value);
                        }

                        //  TODO: Detect RegExp data

                        //  If its a 'plain JS Object', convert it into a
                        //  TP.lang.Hash.
                        if (TP.isMemberOf(value, Object)) {
                            return TP.hc(value);
                        }

                        //  If its a 'JS Array', convert it into a TIBETized
                        //  Array.
                        if (TP.isMemberOf(value, Array)) {
                            newArr = TP.ac();
                            for (i = 0; i < value.length; i++) {
                                newArr.push(value[i]);
                            }

                            return newArr;
                        }

                        return value;
                    });

        //  If the 'outermost' object is a 'plain JS Object', convert it
        //  into a TP.lang.Hash.
        if (TP.isMemberOf(obj, Object)) {
            return TP.hc(obj);
        }

        //  If the 'outermost' object is a 'JS Array', convert it into a
        //  TIBETized Array
        if (TP.isMemberOf(obj, Array)) {
            newArr = TP.ac();
            for (i = 0; i < obj.length; i++) {
                newArr.push(obj[i]);
            }

            return newArr;
        }

        return obj;
    } catch (e) {
        if (TP.notFalse(shouldReport)) {
            return TP.raise(this, 'TP.sig.InvalidJSON', arguments,
                            TP.ec(e, aString));
        }

        return;
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('js2json',
function(anObject) {

    /**
     * @name js2json
     * @synopsis Transforms an object into a representation in a JSON string.
     * @description Since JSON is a limited subset of JavaScript this
     *     representation may not be a complete copy of the object (in
     *     particular, since these primitives use the open source JSON
     *     serializer found at: http://www.json.org, Function objects will not
     *     be serialized).
     * @param {Object} anObject The object to transform.
     * @returns {String} A JavaScript String containing the JSON data.
     * @raise TP.sig.JSONSerializationException
     * @todo
     */

    var str,
        objToJSON;

    //  Call the 'stringify' method on the 'JSON' object supplied from:
    //  http://www.JSON.org/json2.js

    //  Make sure that TP.lang.Hashes get converted into regular Objects.
    if (TP.isMemberOf(anObject, TP.lang.Hash)) {
        objToJSON = anObject.asObject();
    } else {
        objToJSON = anObject;
    }

    try {
        str = JSON.stringify(
                    objToJSON,
                    function(key, value) {

                        //  Make sure there are no internal slots we don't want
                        //  to expose.
                        if (TP.regex.INTERNAL_SLOT.test(key)) {
                            return;
                        }

                        //  Make sure that TP.lang.Hashes get converted into
                        //  regular Objects.
                        if (TP.isMemberOf(value, TP.lang.Hash)) {
                            return value.asObject();
                        }

                        //  The natively supported JSON types just hand
                        //  themselves back.
                        if (TP.isString(value) ||
                            TP.isNumber(value) ||
                            TP.isMemberOf(value, Object) ||
                            TP.isArray(value) ||
                            TP.isBoolean(value) ||
                            TP.isNull(value)) {
                                return value;
                        }

                        //  Otherwise, handed back a JSONified String (which
                        //  very well may recurse into this routine).
                        return TP.json(value);
                    });
    } catch (e) {
        return TP.raise(this, 'TP.sig.JSONSerializationException',
                         arguments, TP.ec(e));
    }

    return str;
});

//  ------------------------------------------------------------------------
//  XML source conversions
//  ------------------------------------------------------------------------

TP.definePrimitive('js2xml',
function(anObject, aFilterName) {

    /**
     * @name js2xml
     * @synopsis Transforms a JavaScript object into roughly equivalent XML
     *     using the rules from JSONML.
     * @param {Object} anObject The object to transform.
     * @param {String} aFilterName A get*Interface() filter spec.
     * @returns {Node} An XML node representing the same data structures found
     *     in the Object.
     * @todo
     */

    var node;

    node = TP.jsonml2xml(anObject);

    if (TP.notValid(node)) {
        TP.raise(this, 'TP.sig.InvalidXML', arguments,
            'Unable to convert object ' + TP.id(anObject) + 'to XML.');
    }

    return node;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('xml2js',
function(aNode) {

    /**
     * @name xml2js
     * @synopsis Transforms an XML node into a roughly equivalent JavaScript
     *     object.
     * @description If the XML is in XMLRPC format this call attempts to
     *      reconstitute an Object from that, otherwise the node is processed
     *      into JsonML.
     * @param {Node} aNode An XML node.
     * @returns {Object} The JavaScript object constructed from the supplied
     *     XML.
     */

    var node;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode', arguments);
    }

    //  collections (nodes with a content model) are ok, but we need to work
    //  with element nodes when possible
    if (TP.isDocument(aNode)) {
        node = aNode.documentElement;
    } else if (TP.isElement(aNode) || TP.isFragment(aNode)) {
        node = aNode;
    } else if (TP.isAttributeNode(aNode)) {
        return TP.hc(aNode.name, aNode.value);
    } else if (TP.isPINode(aNode)) {
        return TP.hc('target', aNode.target, 'data', aNode.data);
    } else {
        //  not a "collection" node, so we can only assume text value
        return TP.nodeGetTextContent(aNode);
    }

    if (TP.isElement(node) || TP.isFragment(node)) {
        //  if we're looking at XMLRPC data then we can use the XMLRPC
        //  type's objectFromNode.
        //  we use a fairly trivial test here for struct as the outer
        //  element since all JSON strings are ultimately enclosed in '{'s.
        if (TP.elementGetLocalName(node) === 'struct') {
            return TP.core.XMLRPCNode.objectFromNode(node);
        }

        return TP.xml2jsonml(node);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('json2xml',
function(aString) {

    /**
     * @name json2xml
     * @synopsis Transforms a JSON-formatted string into roughly equivalent XML.
     * @description The transformation is in two steps, first to JS and then
     *     into simple XML where keys are element names and values are content
     *     text nodes.
     * @param {String} aString A JSON-formatted string.
     * @returns {Node} An XML node representing the same data structures found
     *     in the JSON string.
     */

    var data;

    //  the conversion to JS should be lossless, as is the conversion to
    //  XMLRPC for standard JS key/value data or array content

    data = TP.json2js(aString);

    if (TP.notEmpty(data)) {
        return TP.js2xml(data);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('xml2json',
function(aNode) {

    /**
     * @name xml2json
     * @synopsis Transforms an XML node into a roughly equivalent JSON string.
     * @description If the XML is in XMLRPC format this transformation is very
     *     close to lossless, otherwise the node is processed according to the
     *     rules found in XForms which focus on non-empty element nodes and
     *     their text content.
     * @param {Node} aNode An XML node.
     * @returns {String} A JavaScript String containing the JSON data.
     */

    var data;

    data = TP.xml2js(aNode);

    if (TP.notEmpty(data)) {
        return TP.js2json(data);
    }

    return null;
});

//  ------------------------------------------------------------------------
//  JSONML support
//  ------------------------------------------------------------------------

TP.definePrimitive('jsonml2xml',
function(anObject, shouldReport) {

    /**
     * @name jsonml2xml
     * @synopsis Transforms an object structured according to the 'JSONML spec'
     *     into an equivalent XML node.
     * @param {Object} anObject The object to transform.
     * @param {Boolean} shouldReport False to suppress errors. Default is true.
     * @returns {Node} An XML node representing the same data structures found
     *     in the JSONML Object.
     * @todo
     */

    var node;

    //  Call the 'toXML' method defined on the TP.extern.JsonML object
    try {
        node = TP.extern.JsonML.toXML(anObject);
    } catch (e) {
        if (TP.notFalse(shouldReport)) {
            return TP.raise(this, 'TP.sig.InvalidJSON', arguments,
                             TP.ec(e, anObject));
        }

        return;
    }

    return node;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('xml2jsonml',
function(aNode) {

    /**
     * @name xml2jsonml
     * @synopsis Transforms an XML node into an equivalent JSONML object.
     * @param {Node} aNode An XML node.
     * @returns {Object} A JavaScript Object according to the 'JSONML spec'.
     */

    var jsonml,
        elem;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode', arguments);
    }

    if (TP.isXMLDocument(elem = aNode)) {
        elem = elem.documentElement;
    }

    //  Call the 'fromXML' method defined on the TP.extern.JsonML object
    jsonml = TP.extern.JsonML.fromXML(elem);

    return jsonml;
});

//  ------------------------------------------------------------------------
//  XML-RPC support
//  ------------------------------------------------------------------------

TP.definePrimitive('js2xmlrpc',
function(anObject) {

    /**
     * @name js2xmlrpc
     * @synopsis Transforms a JavaScript object into roughly equivalent XMLRPC
     *     node.
     * @param {Object} anObject The object to transform.
     * @returns {Node} An XMLRPC node representing the same data structures
     *     found in the Object.
     */

    if (TP.notValid(anObject)) {
        return;
    }

    //  window and self
    if (TP.isWindow(anObject)) {
        return;
    }

    //  the special TP.core.Browser instance
    if (anObject === TP.core.Browser) {
        return;
    }

    //  at the moment we don't process html docs into xmlrpc
    if (TP.isHTMLDocument(anObject)) {
        return;
    }

    //  for now we skip turning types into xmlrpc
    if (TP.isType(anObject)) {
        return;
    }

    //  defer to object itself whenever possible
    if (TP.canInvoke(anObject, 'asTP_core_XMLRPCNode')) {
        return anObject.asTP_core_XMLRPCNode();
    }

    return TP.core.XMLRPCNode.from(anObject);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('json2xmlrpc',
function(aString, tab) {

    /**
     * @name json2xmlrpc
     * @synopsis Transforms a JSON-formatted string into roughly equivalent XML.
     * @description The transformation is in two steps, first to JS and then
     *     into simple XML where keys are element names and values are content
     *     text nodes.
     * @param {String} aString A JSON-formatted string.
     * @returns {Node} An XML node representing the same data structures found
     *     in the JSON string. XMLRPC format is used since its a common exchange
     *     format in TIBET and the source format for a number of built in XSLT
     *     transformations.
     */

    //  the conversion to JS should be lossless, as is the conversion to
    //  XMLRPC for standard JS key/value data or array content
    return TP.js2xmlrpc(TP.json2js(aString));
});

//  ------------------------------------------------------------------------
//  JSONP call support
//  ------------------------------------------------------------------------

TP.definePrimitive('jsonpCall',
function(aURI, aCallback, aCallbackFuncName, aCallbackParamName, aDocument,
shouldRaise) {

    /**
     * @name jsonpCall
     * @synopsis Uses the JSON-associated mechanism of creating a dynamic script
     *     node to access the data at the target URI, then cleans up the script
     *     node to avoid clutter. The resulting data can be found on the
     *     document provided. If no document is provided then the document of
     *     the TIBET frame is used.
     *
     *
     * @description !!!USE THIS CALL ONLY WITH SITES YOU CAN EXPLICITLY TRUST!!!
     *
     *     The code in script files referenced in this fashion is run
     *     automatically by the browser without any checking for cross-domain
     *     security. Yes, people use this _hack_ as a way to load data without
     *     running into cross-domain security notifications supported by
     *     XMLHttpRequest -- at their PERIL.
     *
     *     Yes, it has been reported as a security bug, but since a) it's
     *     supported by all major browsers and b) it's leveraged by Google et.
     *     al. for shoving ads at you (which means $$$), no, it won't be fixed
     *     in our lifetime.
     *
     *     How does it work? The script is run as if it were found in the
     *     "local domain" of the browser, i.e. the domain that the browser
     *     thinks loaded the script with this (TP.jsonpCall) function in it. No
     *     checks are performed, the script is simply run the moment it arrives
     *     in the browser (provided that it was served with a MIME type of
     *     text/javascript).
     *
     *     BE PARTICULARLY CAREFUL when launching code supporting this feature
     *     from the file system since this means the browser's local domain is
     *     your local machine. So, if the script you load decides to read your
     *     hard disk, or write to it, or do anything else JS will let it do,
     *     there's nothing to stop it.
     *
     *     TIBET does try to take one precaution around this call - the call is
     *     made inside of another iframe and then the results are 'washed
     *     through' a serialize / parse cycle to at least protect against
     *     malformed JSON data.
     * @param {String} aURI The URI string referencing the desired JavaScript
     *     file.
     * @param {Function} aCallback An optional callback function to be invoked
     *     when the JSON results have loaded. The JSON result object is passed
     *     as the only parameter to this function. This follows the 'JSONP'
     *     model.
     * @param {String} aCallbackFuncName The optional name of the callback
     *     function that will be called from the result data.
     * @param {String} aCallbackParamName The optional name of the 'callback'
     *     parameter generated into the GET url for the JSON call. Both Google
     *     and Yahoo use the name 'callback', which is what this parameter
     *     defaults to.
     * @param {Document} aDocument The document to use for loading the script,
     *     which allows you to control which context the code runs in. By
     *     default, an iframe will be created to load the 'script' (i.e. data).
     * @param {Boolean} shouldRaise Whether or not an invalid JSONP call or
     *     invalid results should raise a TIBET exception. The default is true.
     * @returns {Node} The script node used, after being removed from the
     *     document.
     * @todo
     */

    var contextDoc,
        contextElem,
        contextWin,

        paramName,

        callback,
        callbackID,
        url,

        elem,
        head;

    //  if a context document is not supplied, create an iframe and hand
    //  that back. This keeps JSON data safely away from TIBET until we can
    //  let the JSON parser take care of it.
    if (!TP.isDocument(contextDoc = aDocument)) {
        contextElem = TP.getJSONPIFrame();
        contextDoc = TP.elementGetIFrameDocument(contextElem);
    }

    //  can only do this properly with an HTML document since we'll be
    //  loading a script element that needs HTML-specific processing
    if (!TP.isHTMLDocument(contextDoc)) {
        return TP.raise(this, 'TP.sig.InvalidDocument', arguments);
    }

    //  Grab the context window
    contextWin = TP.nodeGetWindow(contextDoc);

    //  get a callback hook ready
    callback = TP.isCallable(aCallback) ? aCallback : TP.RETURN_THIS;

    contextWin.onerror = function(msg, uri, line) {

        var errMsg;

        errMsg = TP.join('JSONP call error: ', msg, ' from: ', uri);

        if (TP.notFalse(shouldRaise)) {
            TP.raise(this, 'TP.sig.JSONException', arguments, errMsg);
            callback(errMsg);
        }

        //  Remove the callback Function to avoid littering things up. Note
        //  that we just set this to 'null' to avoid IE problems
        contextWin[callbackID] = null;
    };

    if (TP.notValid(callbackID = aCallbackFuncName)) {
        //  generate a unique ID for the actual callback. We'll invoke the
        //  supplied callback from there.
        callbackID = 'jsoncallback_' + TP.lid(callback).replace(/\$/g, '_');
    }

    //  Set a slot on the contextWin window object with the callbackID.
    //  This slot will be removed either inside of this call, or by a fork()
    //  later if the supplied callback Function has an error.
    contextWin[callbackID] =
        function(resultObj) {

            var cleanResult;

            //  'Scrub' the JSON data by 'stringifying' it and turning
            //  that string back into JavaScript in the 'other document'
            cleanResult = TP.json2js(TP.js2json(resultObj));

            callback(cleanResult);

            //  Remove the callback Function to avoid littering things up.
            //  Note that we just set this to 'null' to avoid IE problems
            contextWin[callbackID] = null;
        };

    //  Build the 'script element' URL

    //  default the JSONP 'callback' parameter name to 'callback'
    paramName = TP.ifInvalid(aCallbackParamName, 'callback');

    //  get the string version of the URI, which will process TP.core.URIs as
    //  needed so we're consistently working with a string URI
    url = aURI.asString();

    //  If the url already has parameters, then tack on an '&' and proceed.
    if (/\?/.test(url)) {
        url += '&';
    } else {
        //  Otherwise, tack on a '?' and proceed.
        url += '?';
    }

    url += paramName + '=' + callbackID;

    //  Create a script element using this document and adding a parameter
    //  on the end that contains the JSONP callback name and our callback
    //  function ID (which the caller will return).
    elem = TP.documentCreateScriptElement(
            contextDoc,
            url,
            function() {

                TP.nodeDetach(elem);

                //  Make sure the slot on the context windows is cleared
                //  after 1 second after this function is called (which is
                //  called after the callback function whose reference is
                //  embedded in the JSON).
                (function() {

                    if (TP.isCallable(contextWin[callbackID])) {
                        //  Note that we just set this to 'null' to avoid IE
                        //  problems
                        contextWin[callbackID] = null;
                    }
                }).fork(TP.sys.cfg('jsonp.delay'));
            });

    //  adding the elem to the 'head' will start the loading process
    try {
        //  Make sure that the target document has a valid 'head' element or
        //  we're going nowhere.
        head = TP.documentEnsureHeadElement(contextDoc);
        if (TP.isElement(head)) {
            //  Note reassignment since the elem we're adding might have
            //  come from another document.
            elem = TP.nodeAppendChild(head, elem, false);
        }
    } catch (e) {
        TP.raise(this, 'TP.sig.JSONException', arguments, TP.ec(e));
        callback(TP.join('JSONP call error: ', TP.str(e)));
    }

    return elem;
});

/* jshint ignore:start */

//  ------------------------------------------------------------------------
//  JSONML parsers/serializers
//  ------------------------------------------------------------------------

//  ---
//  (wje) - 2013-01-14 patched to expose on 'TP.extern' object, not the
//  global
//  ---

/*
    jsonml-xml.js
    JsonML XML utilities

    Created: 2007-02-15-2235
    Modified: 2012-11-03-2051

    Copyright (c)2006-2012 Stephen M. McKamey
    Distributed under The MIT License: http://jsonml.org/license

    This file creates a global JsonML object containing these methods:

        JsonML.toXML(string|array, filter)
            Converts JsonML to XML nodes

        JsonML.toXMLText(JsonML, filter)
            Converts JsonML to XML text

        JsonML.fromXML(node, filter)
            Converts XML nodes to JsonML

        JsonML.fromXMLText(xmlText, filter)
            Converts XML text to JsonML
*/

var JsonML = TP.extern.JsonML || {};
TP.extern.JsonML = JsonML;

(function(JsonML, document) {
    'use strict';

    /**
     * Determines if the value is an Array
     *
     * @private
     * @param {*} val the object being tested
     * @return {boolean}
     */
    var isArray = Array.isArray || function(val) {
        return (val instanceof Array);
    };

    /**
     * Creates a DOM element
     *
     * @private
     * @param {string} tag The element's tag name
     * @return {Node}
     */
    var createElement = function(tag) {
        if (!tag) {
            // create a document fragment to hold multiple-root elements
            if (document.createDocumentFragment) {
                return document.createDocumentFragment();
            }

            tag = '';

        } else if (tag.charAt(0) === '!') {
            return document.createComment(tag === '!' ? '' : tag.substr(1)+' ');
        }

        return document.createElement(tag);
    };

    /**
     * Appends an attribute to an element
     *
     * @private
     * @param {Node} elem The element
     * @param {Object} attr Attributes object
     * @return {Node}
     */
    var addAttributes = function(elem, attr) {
        // for each attributeName
        for (var name in attr) {
            if (attr.hasOwnProperty(name)) {
                // attributes
                elem.setAttribute(name, attr[name]);
            }
        }
        return elem;
    };

    /**
     * Appends a child to an element
     *
     * @private
     * @param {Node} elem The parent element
     * @param {Node} child The child
     */
    var appendDOM = function(elem, child) {
        if (child) {
            if (elem.nodeType === 8) { // comment
                if (child.nodeType === 3) { // text node
                    elem.nodeValue += child.nodeValue;
                }

            } else if (elem.canHaveChildren !== false) {
                elem.appendChild(child);
            }
        }
    };

    /**
     * Default error handler
     * @param {Error} ex
     * @return {Node}
     */
    var onError = function (ex) {
        return document.createTextNode('['+ex+']');
    };

    /* override this to perform custom error handling during binding */
    JsonML.onerror = null;

    /**
     * @param {Node} elem
     * @param {*} jml
     * @param {function} filter
     * @return {Node}
     */
    var patch = function(elem, jml, filter) {

        for (var i=1; i<jml.length; i++) {
            if (isArray(jml[i]) || 'string' === typeof jml[i]) {
                // append children
                appendDOM(elem, toXML(jml[i], filter));

            } else if ('object' === typeof jml[i] && jml[i] !== null && elem.nodeType === 1) {
                // add attributes
                elem = addAttributes(elem, jml[i]);
            }
        }

        return elem;
    };

    /**
     * Main builder entry point
     * @param {string|array} jml
     * @param {function} filter
     * @return {Node}
     */
    var toXML = JsonML.toXML = function(jml, filter) {
        try {
            if (!jml) {
                return null;
            }
            if ('string' === typeof jml) {
                return document.createTextNode(jml);
            }
            if (!isArray(jml) || ('string' !== typeof jml[0])) {
                throw new SyntaxError('invalid JsonML');
            }

            var tagName = jml[0]; // tagName
            if (!tagName) {
                // correctly handle a list of JsonML trees
                // create a document fragment to hold elements
                var frag = createElement('');
                for (var i=1; i<jml.length; i++) {
                    appendDOM(frag, toXML(jml[i], filter));
                }

                // eliminate wrapper for single nodes
                if (frag.childNodes.length === 1) {
                    return frag.firstChild;
                }
                return frag;
            }

            var elem = patch(createElement(tagName), jml, filter);

            return (elem && 'function' === typeof filter) ? filter(elem) : elem;
        } catch (ex) {
            try {
                // handle error with complete context
                var err = ('function' === typeof JsonML.onerror) ? JsonML.onerror : onError;
                return err(ex, jml, filter);
            } catch (ex2) {
                return document.createTextNode('['+ex2+']');
            }
        }
    };

    /**
     * Converts JsonML to XML text
     * @param {string|array} jml
     * @param {function} filter
     * @return {array} JsonML
     */
    JsonML.toXMLText = function(jml, filter) {
        return renderXML( toXML(jml, filter) );
    };

    /* Reverse conversion -------------------------*/

    var addChildren = function(/*DOM*/ elem, /*function*/ filter, /*JsonML*/ jml) {
        if (elem.hasChildNodes()) {
            for (var i=0, len=elem.childNodes.length; i<len; i++) {
                var child = elem.childNodes[i];
                child = fromXML(child, filter);
                if (child) {
                    jml.push(child);
                }
            }
            return true;
        }
        return false;
    };

    /**
     * @param {Node} elem
     * @param {function} filter
     * @return {string|array} JsonML
     */
    var fromXML = JsonML.fromXML = function(elem, filter) {
        if (!elem || !elem.nodeType) {
            // free references
            return (elem = null);
        }

        var i, jml;
        switch (elem.nodeType) {
            case 1:  // element
            case 9:  // document
            case 11: // documentFragment
                jml = [elem.tagName||''];

                var attr = elem.attributes,
                    props = {},
                    hasAttrib = false;

                for (i=0; attr && i<attr.length; i++) {
                    if (attr[i].specified) {
                        if ('string' === typeof attr[i].value) {
                            props[attr[i].name] = attr[i].value;
                        }
                        hasAttrib = true;
                    }
                }
                if (hasAttrib) {
                    jml.push(props);
                }

                addChildren(elem, filter, jml);

                // filter result
                if ('function' === typeof filter) {
                    jml = filter(jml, elem);
                }

                // free references
                elem = null;
                return jml;
            case 3: // text node
            case 4: // CDATA node
                var str = String(elem.nodeValue);
                // free references
                elem = null;
                return str;
            case 10: // doctype
                jml = ['!'];

                var type = ['DOCTYPE', (elem.name || 'html').toLowerCase()];

                if (elem.publicId) {
                    type.push('PUBLIC', '"' + elem.publicId + '"');
                }

                if (elem.systemId) {
                    type.push('"' + elem.systemId + '"');
                }

                jml.push(type.join(' '));

                // filter result
                if ('function' === typeof filter) {
                    jml = filter(jml, elem);
                }

                // free references
                elem = null;
                return jml;
            case 8: // comment node
                if ((elem.nodeValue||'').indexOf('DOCTYPE') !== 0) {
                    // free references
                    elem = null;
                    return null;
                }

                jml = ['!',
                        elem.nodeValue];

                // filter result
                if ('function' === typeof filter) {
                    jml = filter(jml, elem);
                }

                // free references
                elem = null;
                return jml;
            default: // etc.
                if (window.console) {
                    window.console.log('nodeType '+elem.nodeType+' skipped.');
                }
                // free references
                return (elem = null);
        }
    };

    /**
     * Converts XML text to XML DOM nodes
     * https://developer.mozilla.org/en-US/docs/Parsing_and_serializing_XML
     * https://gist.github.com/553364
     * @param {string} xmlText
     * @return {Node} xml node
     */
    var parseXML = JsonML.parseXML = function(xmlText) {
        if (!xmlText || typeof xmlText !== 'string') {
            return null;
        }

        if (window.DOMParser) {
            // standard XML DOM
            return new DOMParser().parseFromString(xmlText, 'application/xml');
        }

        if (window.ActiveXObject) {
            // legacy IE XML DOM
            var xml = new ActiveXObject('Microsoft.XMLDOM');
            xml.async = 'false';
            xml.loadXML(xmlText);
            return xml;
        }
/*
        // this doesn't seem to work in any browser yet
        if (window.XMLHttpRequest){
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'data:application/xml;charset=utf-8,'+encodeURIComponent(xmlText), false);
            if (xhr.overrideMimeType) {
                xhr.overrideMimeType('application/xml');
            }
            xhr.send('');
            return xhr.responseXML;
        }
*/
        return null;
    };

    /**
     * Converts XML text nodes to JsonML
     * @param {string} xmlText
     * @param {function} filter
     * @return {string|array} JsonML
     */
    JsonML.fromXMLText = function(xmlText, filter) {
        var elem = parseXML(xmlText);
        elem = elem && (elem.ownerDocument || elem).documentElement;

        return fromXML(elem, filter);
    };

    /**
     * Converts XML DOM nodes to XML text
     * https://developer.mozilla.org/en-US/docs/Parsing_and_serializing_XML
     * @param {string} xmlText
     * @return {string|array} JsonML
     */
    var renderXML = JsonML.renderXML = function(elem) {
        if (!elem) {
            return null;
        }

        if (window.XMLSerializer) {
            // standard XML DOM
            return new window.XMLSerializer().serializeToString(elem);
        }

        // legacy IE XML
        if (elem.xml) {
            return elem.xml;
        }

        // HTML DOM
        if (elem.outerHTML) {
            return elem.outerHTML;
        }

        var parent = createElement('div');
        parent.appendChild(elem);

        var html = parent.innerHTML;
        parent.removeChild(elem);

        return html;
    };

    JsonML.isXML = function(elem) {
        var root = elem && (elem.ownerDocument || elem).documentElement;
        return !!root && (root.nodeName !== "HTML");
    };

    // enable usage of XML DOM, fallback to HTML DOM
    document = parseXML('<xml/>') || document;

})(JsonML, document);

/* jshint ignore:end */

//  ========================================================================
//  end
//  ========================================================================
