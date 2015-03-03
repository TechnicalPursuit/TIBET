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
 * @subject JSON JavaScript Object Notation (JSON) is a restricted subset of
 *     JavaScript source code which is suitable for use as a simple data
 *     transport format.
 *
 *     Due to what some consider to be a security loophole in all current
 *     browsers-- one that will likely remain unpatched for the forseeable
 *     future -- JSONrequests made via dynamic script node addition can be used
 *     to circumvent cross-domain scripting restrictions enforced by
 *     XMLHttpRequest. This has made it popular with developers who don't have
 *     strong XML requirements.
 */

//  ------------------------------------------------------------------------

TP.regex.JSON_ISODATE =
    /^(\d{4})-?(\d{2})?-?(\d{2})?(T(\d{2})(:(\d{2})(:(\d{2})(\.(\d{1,3}))?)?)?)?(Z)?([\+\-]\d{2}:\d{2})?$/;

TP.regex.JSON_ERRMSG = /^JSONP call error: /;

//  ------------------------------------------------------------------------

TP.definePrimitive('getJSONPIFrame',
function() {

    /**
     * @method getJSONPIFrame
     * @summary Retrieves the iframe used to fetch and/or parse JSON results.
     * @description The iframe returned by this routine is created (once) if it
     *     doesn't exist. It is used by the jsonpCall() to load the actual
     *     results and then scrub it through a serialize/parse cycle to try to
     *     avoid malformed/malicious JSON data.
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
     * @method isJSONString
     * @summary Returns whether or not the supplied String can be parsed into a
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
     * @method json2js
     * @summary Transforms a JSON-formatted string into the equivalent
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
     * @exception InvalidJSON
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

                        var arr,
                            j;

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
                            arr = TP.ac();
                            for (j = 0; j < value.length; j++) {
                                arr.push(value[j]);
                            }

                            return arr;
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
            return TP.raise(this, 'TP.sig.InvalidJSON', TP.ec(e, aString));
        }

        return;
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('js2json',
function(anObject) {

    /**
     * @method js2json
     * @alias json
     * @summary Transforms an object into a representation in a JSON string.
     * @description Since JSON is a limited subset of JavaScript this
     *     representation may not be a complete copy of the object (in
     *     particular, since these primitives use the open source JSON
     *     serializer found at: http://www.json.org, Function objects will not
     *     be serialized).
     * @param {Object} anObject The object to transform.
     * @returns {String} A JavaScript String containing the JSON data.
     * @exception TP.sig.JSONSerializationException
     */

    var str,

        debugKey,
        debugVal;

    if (!TP.isValid(anObject)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    debugKey = null;
    debugVal = null;

    try {
        str = JSON.stringify(
                    anObject,
                    function(key, value) {

                        debugKey = key;
                        debugVal = value;

                        //  Make sure there are no internal slots we don't want
                        //  to expose.
                        if (TP.regex.INTERNAL_SLOT.test(key)) {
                            return;
                        }

                        return value;
                    });
    } catch (e) {
        return TP.raise(this,
                        'TP.sig.JSONSerializationException',
                        TP.ec(
                            e,
                            'key: ' + debugKey +
                            ' value: ' + TP.id(debugVal)));
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('json', TP.js2json);

//  ------------------------------------------------------------------------
//  XML source conversions
//  ------------------------------------------------------------------------

TP.definePrimitive('js2xml',
function(anObject, aFilterName) {

    /**
     * @method js2xml
     * @summary Transforms a JavaScript object into roughly equivalent XML
     *     using the built-in JXON processor.
     * @param {Object} anObject The object to transform.
     * @param {String} aFilterName A get*Interface() filter spec.
     * @returns {Node} An XML node representing the same data structures found
     *     in the Object.
     */

    var str,

        doc,
        node;

    str = TP.extern.jxon.jsToString(anObject);
    if (TP.isXMLDocument(doc = TP.doc(str, null, true))) {
        node = doc.documentElement;
    }

    if (TP.notValid(node)) {
        TP.raise(this, 'TP.sig.InvalidXML',
            'Unable to convert object ' + TP.id(anObject) + 'to XML.');
    }

    return node;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('xml2js',
function(aNode) {

    /**
     * @method xml2js
     * @summary Transforms an XML node into a roughly equivalent JavaScript
     *     object.
     * @description If the XML is in XMLRPC format this call attempts to
     *      reconstitute an Object from that, otherwise the node is processed
     *      using the built-in JXON processor.
     * @param {Node} aNode An XML node.
     * @returns {Object} The JavaScript object constructed from the supplied
     *     XML.
     */

    var node;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    //  collections (nodes with a content model) are ok, but we need to work
    //  with element nodes when possible
    if (TP.isDocument(aNode)) {
        if (TP.elementGetLocalName(aNode.documentElement) === 'struct') {
            node = aNode.documentElement;
        } else {
            node = aNode;
        }
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
    }

    return TP.extern.jxon.xmlToJs(node);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('json2xml',
function(aString) {

    /**
     * @method json2xml
     * @summary Transforms a JSON-formatted string into roughly equivalent XML.
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
     * @method xml2json
     * @summary Transforms an XML node into a roughly equivalent JSON string.
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
//  XML-RPC support
//  ------------------------------------------------------------------------

TP.definePrimitive('js2xmlrpc',
function(anObject) {

    /**
     * @method js2xmlrpc
     * @summary Transforms a JavaScript object into roughly equivalent XMLRPC
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
function(aString) {

    /**
     * @method json2xmlrpc
     * @summary Transforms a JSON-formatted string into roughly equivalent XML.
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
     * @method jsonpCall
     * @summary Uses the JSON-associated mechanism of creating a dynamic script
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
        return TP.raise(this, 'TP.sig.InvalidDocument');
    }

    //  Grab the context window
    contextWin = TP.nodeGetWindow(contextDoc);

    //  get a callback hook ready
    callback = TP.isCallable(aCallback) ? aCallback : TP.RETURN_THIS;

    contextWin.onerror = function(msg, uri, line) {

        var errMsg;

        errMsg = TP.join('JSONP call error: ', msg, ' from: ', uri);

        if (TP.notFalse(shouldRaise)) {
            TP.raise(this, 'TP.sig.JSONException', errMsg);
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
                /* eslint-disable no-wrap-func,no-extra-parens */
                (function() {

                    if (TP.isCallable(contextWin[callbackID])) {
                        //  Note that we just set this to 'null' to avoid IE
                        //  problems
                        contextWin[callbackID] = null;
                    }
                }).fork(TP.sys.cfg('jsonp.delay'));
                /* eslint-enable no-wrap-func,no-extra-parens */
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
        TP.raise(this, 'TP.sig.JSONException', TP.ec(e));
        callback(TP.join('JSONP call error: ', TP.str(e)));
    }

    return elem;
});

//  ========================================================================
//  end
//  ========================================================================
