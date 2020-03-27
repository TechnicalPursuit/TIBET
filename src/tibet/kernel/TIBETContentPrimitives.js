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

    win = TP.sys.getWindowById(TP.sys.cfg('tibet.top_win_name'));
    if (TP.notValid(win)) {
        win = window;
    }

    //  Look up the frame name, or default to an easy-to-spot name.
    iframeName = TP.sys.cfg('jsonp.frame_id') || 'JSONP';

    if (!TP.isElement(iframeElem =
                        TP.nodeGetElementById(win.document, iframeName))) {
        iframeElem = TP.documentConstructIFrameElement(win.document,
                                                        null,
                                                        iframeName);
        TP.elementSetAttribute(iframeElem, 'style', 'display: none');
    }

    return iframeElem;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('reformatJSToJSON',
function(aString) {

    /**
     * @method reformatJSToJSON
     * @summary Formats a JS string into a JSON String that can then be parsed
     *     as JSON. This routine also 'TP.' values to be resolved into their
     *     real values.
     * @description An example of an unquoted JSON string with 'TP.' references
     *     is:
     *          {index:1,position:TP.BEFORE}
     *     from which this method will produce:
     *          {"index":1,"position":"before"}
     * @param {String} aString The string to reformat into proper JSON.
     * @returns {String} A properly quoted JSON string.
     */

    var lastNonSpaceToken,
        nextNonSpaceToken,
        lastTokenNeedsQuote,
        nextTokenNeedsQuote,

        tokens,

        str,

        token,
        val,

        context,

        useGlobalContext,

        len,
        i,

        lastNSToken,
        nextNSToken;

    //  TODO: This is a bit cheesy - make TP.$tokenize() smarter or, better yet,
    //  write a new routine to JSONize strings.

    //  Temporarily delete the 'data' property from TP.boot.$uriSchemes so that
    //  this call won't try to convert things like 'data:' (which may very well
    //  be a property name) into a URI.
    delete TP.boot.$uriSchemes.data;

    //  Tokenize the input string, supplying our own set of 'operators'.
    tokens = TP.$tokenize(
                    aString,
                    TP.ac('{', ':', '}', '.', ','),
                    true);  //  We specify 'tsh' (meaning that we want URI
                            //  parsing)

    //  Restore the 'data' property.
    TP.boot.$uriSchemes.data = 'data';

    str = '';

    //  Note that we track a 'context' in this method so that values to our
    //  "JSON" (so to speak) can be things like 'TP.sys.foo' that will resolve
    //  properly.
    context = null;

    //  When this flag is true, we can use identifier/string/uri values to look
    //  up properties on the global object to set the context.
    useGlobalContext = true;

    len = tokens.getSize();

    //  A function to find the last non-space token starting at an index
    lastNonSpaceToken = function(startIndex) {
        var j;

        for (j = startIndex - 1; j >= 0; j--) {
            if (tokens.at(j).name !== 'space') {
                return tokens.at(j);
            }
        }
    };

    //  A function to find the next non-space token starting at an index
    nextNonSpaceToken = function(startIndex) {
        var j;

        for (j = startIndex + 1; j < len; j++) {
            if (tokens.at(j).name !== 'space') {
                return tokens.at(j);
            }
        }
    };

    lastTokenNeedsQuote = function(startIndex) {
        var lastToken;

        lastToken = lastNonSpaceToken(startIndex);

        if (lastToken.value === '}') {
            return false;
        }

        return true;
    };

    nextTokenNeedsQuote = function(startIndex) {
        var nextToken;

        nextToken = nextNonSpaceToken(startIndex);

        if (nextToken.value === '{') {
            return false;
        }

        return true;
    };

    for (i = 0; i < len; i++) {

        token = tokens.at(i);
        val = token.value;

        switch (token.name) {

            case 'identifier':
            case 'string':
            case 'uri':

                if (TP.isValid(context)) {
                    context = context[val];
                } else {
                    //  If useGlobalContext is true and the value is a property
                    //  *in the approved list of globals* (i.e. in
                    //  TP.sys.$globals), then set the context to the value of
                    //  that property on TP.global (which is the window/global
                    //  object).
                    if (useGlobalContext && TP.sys.$globals.hasKey(val)) {
                        context = TP.global[val];
                    } else {
                        //  There was no context or value that resolved to a
                        //  context, so we trim the value and then unquote the
                        //  result (but only unquote double quotes - leave
                        //  single quotes alone).
                        str += TP.trim(val).unquoted('"');
                    }
                }

                //  Flip useGlobalContext to false - we won't allow it anymore
                useGlobalContext = false;

                break;

            case 'operator':
                if (val === '.' && TP.isValid(tokens.at(i - 1))) {

                    //  If there isn't a valid context, test to see if we can
                    //  obtain one or not.
                    if (TP.notValid(context)) {

                        //  If useGlobalContext is still true, try to use the
                        //  previous token's value as the context. Otherwise, if
                        //  we've already flipped useGlobalContext to false,
                        //  then we're not at the 'first segment' of a '.'
                        //  separated value and so we just append the '.' and
                        //  move on.
                        if (useGlobalContext) {
                            context = tokens.at(i - 1).value;

                            //  If we got an empty (or whitespace only) context,
                            //  then we don't really have a context at all, but
                            //  a standalone '.'. Just append it and move on.
                            context = TP.trim(context);
                            if (TP.isEmpty(context)) {
                                useGlobalContext = false;
                                str += '.';
                            }

                        } else {
                            str += '.';
                        }
                    }

                    break;
                } else if (val === '{') {
                    str += '{';

                    if (nextTokenNeedsQuote(i)) {
                        str += '"';
                    }

                    context = null;
                } else if (val === ':') {
                    if (lastTokenNeedsQuote(i)) {
                        str += '"';
                    }

                    str += ':';

                    if (nextTokenNeedsQuote(i)) {
                        str += '"';
                    }

                    context = null;

                    //  We're at the end of a key - need to reset for the next
                    //  value.
                    useGlobalContext = true;
                } else if (val === ',') {

                    //  We're at the end of a value - need to consume the
                    //  context
                    if (TP.isValid(context)) {
                        val = context;
                        str += val;
                    }

                    if (lastTokenNeedsQuote(i)) {
                        str += '"';
                    }

                    str += ',';

                    if (nextTokenNeedsQuote(i)) {
                        str += '"';
                    }

                    context = null;

                    //  We're at the end of a value - need to reset for the next
                    //  value.
                    useGlobalContext = true;
                } else if (val === '}') {

                    //  We're at the end of a value - need to consume the
                    if (TP.isValid(context)) {
                        val = context;
                        str += val;
                    }

                    if (lastTokenNeedsQuote(i)) {
                        str += '"';
                    }

                    str += '}';

                    context = null;

                    //  We're at the end of a value - need to reset for the next
                    //  value.
                    useGlobalContext = true;
                } else {
                    str += val;
                }
                break;

            case 'space':

                lastNSToken = lastNonSpaceToken(i);
                nextNSToken = nextNonSpaceToken(i);

                if (lastNSToken.value === '{' ||
                    lastNSToken.value === ':' ||
                    lastNSToken.value === ',' ||
                    lastNSToken.value === '"') {
                    break;
                }

                if (nextNSToken.value === '}' ||
                    nextNSToken.value === ':' ||
                    nextNSToken.value === ',' ||
                    nextNSToken.value === '"') {
                    break;
                }

                //  it's a space - leave it alone
                str += val;

                break;

            default:
                //  leave everything else alone - but trim it.
                str += TP.trim(val);

                break;
        }
    }

    //  Change any *standalone* numeric or boolean double-quoted expression into
    //  unquoted content (i.e. {"foo":"1"} becomes {"foo":1})
    TP.regex.DOUBLE_QUOTED_NUMBER_OR_BOOLEAN.lastIndex = 0;
    str = str.replace(TP.regex.DOUBLE_QUOTED_NUMBER_OR_BOOLEAN, '$1');

    //  Because JSON doesn't allow for escaped single quotes, we have to make
    //  sure to replace them all here.
    str = str.replace(/\\'/g, '\'');

    return str;
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

    if (!TP.isString(aString)) {
        return false;
    }

    if (TP.isEmpty(aString)) {
        return false;
    }

    if (TP.regex.ANY_NUMBER.test(aString)) {
        return false;
    }

    if (TP.regex.BOOLEAN_ID.test(aString)) {
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
     * @param {String} aString A JSON-formatted string.
     * @param {Boolean} smartConversion Whether or not to 'smart convert' the
     *     JSON into JS. This causes the construction of TP.core.Hashes instead
     *     of Objects. This defaults to true.
     * @param {Boolean} shouldReport False to suppress errors. Default is true.
     * @returns {Object|undefined} A JavaScript object containing the JSON data.
     * @exception InvalidJSON
     */

    var text,

        shouldConvert,

        obj,

        tpHashInstProto;

    //  avoid changing parameter value
    text = aString;

    //  we default to smart conversion
    shouldConvert = TP.ifInvalid(smartConversion, true);

    try {

        //  If we're not doing smart conversion, then we can just return the
        //  result of calling the 'parse' method on the 'JSON' object supplied.
        if (!shouldConvert) {
            return JSON.parse(text);
        }

        //  Otherwise, we play some serious trickery here to make any Objects
        //  that would be created by turning JSON into JavaScript into
        //  TP.core.Hashes so that they can fully participate in TIBET.

        //  Note that this technique relies on being able to manipulate (both
        //  read and write) the __proto__ slot of a JavaScript object instance.
        //  This is now supported in all environments we run in.

        //  To do this, we first grab the 'instance prototype' of TP.core.Hash
        tpHashInstProto = TP.core.Hash.Inst;

        //  NB: Some of the constructs in the following loop are 'bare JS' to
        //  get the required performance.

        //  Call JSON.parse() with our custom conversion function
        obj = JSON.parse(
                    text,
                    function(key, value) {

                        var newVal,
                            newHashPOJO;

                        //  If the value is real and it's an Object (note here
                        //  that we can do this direct test since the JSON parse
                        //  routine is guaranteed to create plain JS objects),
                        //  then create a new object with its __proto__ to be
                        //  the TP.core.Hash's instance prototype and set its
                        //  '$$type' to TP.core.Hash.
                        if (value &&
                            value.constructor.prototype === TP.ObjectProto) {

                            //  Create a new value to replace the object handed
                            //  to us by the parse routine and set its prototype
                            //  to the hash instance prototype obtained above.
                            newVal = Object.create(tpHashInstProto);

                            newVal.$$type = TP.core.Hash;

                            //  Note here that set an ID here because real
                            //  TP.core.Hashes are required to have an unique ID
                            //  from the start (but we tweak the ID prefix to
                            //  let inspectors/debuggers know that they're
                            //  dealing with a 'sort of' TP.core.Hash).
                            newVal.$$id = TP.genID('Pseudo_TP.core.Hash');

                            //  Now, create a new hash object with a null
                            //  __proto__.
                            newHashPOJO = Object.create(null);

                            //  Copy all of the enumerable, 'own' slots from the
                            //  parsed value object onto our null __proto__ hash
                            //  POJO.
                            Object.assign(newHashPOJO, value);

                            //  Assign the internal '$$hash' property to the new
                            //  hash POJO.
                            newVal.$$hash = newHashPOJO;

                            return newVal;
                        }

                        //  Not an Object - just return the value handed to us.
                        return value;
                    });

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

    //  NOTE: No checks for invalid values here - JSON.stringify knows what to
    //  do with 'null' and 'undefined'.

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

TP.definePrimitive('isXMLString',
function(aString) {

    /**
     * @method isXMLString
     * @summary Returns whether or not the supplied String can be parsed into an
     *     XML string. To some extent you can always produce XML but this test
     *     explicitly eliminates text nodes from consideration.
     * @param {String} aString An XML-formatted string.
     * @returns {Boolean} Whether or not the supplied String is an XML-formatted
     *     String.
     */

    var node;

    if (TP.isEmpty(aString)) {
        return false;
    }

    //  Note here how we supply a null default namespace and pass false so that
    //  parser errors are *not* reported - we're really only interested if the
    //  String is XML or not.
    node = TP.nodeFromString(aString, null, false);

    return TP.isNode(node) && !TP.isTextNode(node);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('js2xml',
function(anObject, aFilterName) {

    /**
     * @method js2xml
     * @summary Transforms a JavaScript object into roughly equivalent XML
     *     using the built-in JSON<->XML Badgerfish conversions.
     * @param {Object} anObject The object to transform.
     * @param {String} aFilterName A get*Interface() filter spec.
     * @returns {Node} An XML node representing the same data structures found
     *     in the Object.
     */

    var obj,

        str,

        xmlStr,
        doc,
        node;

    obj = anObject;

    //  If we can't invoke this, it's probably because it's already a plain JS
    //  object.
    if (TP.canInvoke(obj, 'asObject')) {
        //  Make sure that we have a native JS object here (Object, Array,
        //  Number, String, Boolean, etc.)
        obj = anObject.asObject();
    }

    //  If the object has more than 1 key, then put it in another object with a
    //  single slot, 'value'. This makes it easier on the JSON<->XML conversion.
    if (TP.objectGetKeys(obj).getSize() > 1) {
        obj = {
            value: obj
        };
    }

    //  Make sure that this is a Badgerfish convention-following String
    str = TP.js2bfjson(obj);

    //  This takes a JSON String and converts it to an XML String using the
    //  Badgerfish convention.
    xmlStr = TP.bfjson2xml(str);

    if (TP.isXMLDocument(doc = TP.doc(xmlStr, null, true))) {
        node = doc.documentElement;
    }

    if (!TP.isNode(node)) {
        TP.raise(this, 'TP.sig.InvalidXML',
            'Unable to convert object ' + TP.id(anObject) + 'to XML.');
    }

    return node;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('xml2js',
function(aNode, smartConversion) {

    /**
     * @method xml2js
     * @summary Transforms an XML node into a roughly equivalent JavaScript
     *     object.
     * @description If the XML is in XMLRPC format this call attempts to
     *      reconstitute an Object from that, otherwise the node is processed
     *      using a processor that uses the Badgerfish convensions.
     * @param {Node} aNode An XML node.
     * @param {Boolean} smartConversion Whether or not to 'smart convert' the
     *     resultant JSON into JS. This causes the construction of
     *     TP.core.Hashes instead of Objects. This defaults to true.
     * @returns {Object} The JavaScript object constructed from the supplied
     *     XML.
     */

    var node,
        str;

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

    if (TP.isElement(node)) {
        //  If we're looking at XMLRPC data then we can use the XMLRPC type's
        //  objectFromNode(). We use a fairly trivial test here for struct as
        //  the outer element since all JSON strings are ultimately enclosed in
        //  '{'s.
        if (TP.elementGetLocalName(node) === 'struct') {
            return TP.dom.XMLRPCNode.objectFromNode(node);
        }
    }

    //  This takes an XML node and converts it to a JSON String using the
    //  Badgerfish convention.
    str = TP.xml2bfjson(node);

    return TP.json2js(str, smartConversion);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('js2bfjson',
function(anObject) {

    /**
     * @method js2bfjson
     * @summary Transforms a JavaScript Object into a JSON representation
     *     following the Badgerfish conventions.
     * @param {Object} anObject A JavaScript object
     * @returns {String} A JSON-formatted string that follows the Badgerfish
     *     XML<->JSON convention.
     */

    var obj,

        str,

        debugKey,
        debugVal;

    //  If we can't invoke this, it's probably because it's already a plain JS
    //  object.
    if (TP.canInvoke(obj, 'asObject')) {
        //  Make sure that we have a native JS object here (Object, Array,
        //  Number, String, Boolean, etc.)
        obj = anObject.asObject();
    }

    obj = anObject;

    //  NOTE: No checks for invalid values here - JSON.stringify knows what to
    //  do with 'null' and 'undefined'.

    debugKey = null;
    debugVal = null;

    try {
        str = JSON.stringify(
                    obj,
                    function(key, value) {

                        debugKey = key;
                        debugVal = value;

                        //  Make sure there are no internal slots we don't want
                        //  to expose.
                        if (TP.regex.INTERNAL_SLOT.test(key)) {
                            return;
                        }

                        //  If the key isn't '$' and the value is 'non-mutable'
                        //  (i.e. a String, Number or Boolean), then we return a
                        //  POJO with '$' as the key and the value. This is what
                        //  allows us to conform to Badgerfish conventions.
                        if (key !== '$' && !TP.isMutable(value)) {
                            return {
                                $: value
                            };
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

TP.definePrimitive('xml2bfjson',
function(aNode) {

    /**
     * @method xml2bfjson
     * @summary Transforms an XML node into a JSON representation following the
     *     Badgerfish conventions.
     * @description Code adapted to use TIBET coding conventions from:
     *     http://ruchirawageesha.blogspot.com/2011/06/xml-to-json-and-json-to-xml-conversion.html
     * @param {Node} aNode An XML node.
     * @returns {String} A JSON-formatted string that follows the Badgerfish
     *     XML<->JSON convention.
     */

    var jsobj,
        cloneNS,
        process;

    jsobj = {};

    cloneNS = function(ns) {
        var nns,
            n;

        nns = {};
        for (n in ns) {
            if (ns.hasOwnProperty(n)) {
                nns[n] = ns[n];
            }
        }
        return nns;
    };

    process = function(node, obj, ns) {

        var p,
            nodeName,
            i,

            attr,
            name,
            value,

            prefix,

            j,
            k;

        if (node.nodeType === Node.TEXT_NODE) {

            if (!node.nodeValue.match(/[\S]+/)) {
                return;
            }

            if (obj.$ instanceof Array) {
                obj.$.push(node.nodeValue);
            } else if (obj.$ instanceof Object) {
                obj.$ = [obj.$, node.nodeValue];
            } else {
                obj.$ = node.nodeValue;
            }

        } else if (node.nodeType === Node.ELEMENT_NODE) {

            p = {};
            nodeName = node.nodeName;

            for (i = 0; node.attributes && i < node.attributes.length; i++) {

                attr = node.attributes[i];
                name = attr.nodeName;
                value = attr.nodeValue;

                if (name === 'xmlns') {
                    ns.$ = value;
                } else if (name.indexOf('xmlns:') === 0) {
                    ns[name.substr(name.indexOf(':') + 1)] = value;
                } else {
                    p['@' + name] = value;
                }
            }

            for (prefix in ns) {

                if (ns.hasOwnProperty(prefix)) {
                    p['@xmlns'] = p['@xmlns'] || {};
                    p['@xmlns'][prefix] = ns[prefix];
                }
            }

            if (obj[nodeName] instanceof Array) {
                obj[nodeName].push(p);
            } else if (obj[nodeName] instanceof Object) {
                obj[nodeName] = [obj[nodeName], p];
            } else {
                obj[nodeName] = p;
            }

            for (j = 0; j < node.childNodes.length; j++) {
                process(node.childNodes[j], p, cloneNS(ns));
            }
        } else if (node.nodeType === Node.DOCUMENT_NODE) {

            for (k = 0; k < node.childNodes.length; k++) {
                process(node.childNodes[k], obj, cloneNS(ns));
            }
        }
    };

    process(aNode, jsobj, {});

    return JSON.stringify(jsobj);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('bfjson2xml',
function(aString) {

    /**
     * @method bfjson2xml
     * @summary Transforms JSON representation of XML that follows the
     *     Badgerfish conventions into an XML String.
     * @description Code adapted to use TIBET coding conventions from:
     *     http://ruchirawageesha.blogspot.com/2011/06/xml-to-json-and-json-to-xml-conversion.html
     * @param {String} aString A JSON-formatted string that follows the
     *     Badgerfish XML<->JSON convention.
     * @returns {String} A String of XML.
     */

    var data,

        cloneNS,
        processLeaf,

        leafName;

    //  Notice how we pass 'false' here for smart conversion - this routine
    //  relies on JS primitive constructs and we don't want smart conversion.
    data = TP.json2js(aString, false);

    if (TP.notEmpty(data)) {

        cloneNS = function(ns) {
            var nns,
                n;

            nns = {};
            for (n in ns) {
                if (ns.hasOwnProperty(n)) {
                    nns[n] = ns[n];
                }
            }

            return nns;
        };

        processLeaf = function(lname, child, ns) {
            var body,
                i,
                el,
                attributes,
                text,

                xmlns,
                prefix,

                key,
                obj;

            body = '';
            if (child instanceof Array) {
                for (i = 0; i < child.length; i++) {
                    body += processLeaf(lname, child[i], cloneNS(ns));
                }
                return body;
            } else if (typeof child === 'object') {

                el = '<' + lname;
                attributes = '';
                text = '';

                if (child['@xmlns']) {
                    xmlns = child['@xmlns'];
                    for (prefix in xmlns) {
                        if (xmlns.hasOwnProperty(prefix)) {
                            if (prefix === '$') {
                                if (ns[prefix] !== xmlns[prefix]) {
                                    attributes += ' ' + 'xmlns="' +
                                                    xmlns[prefix] + '"';
                                    ns[prefix] = xmlns[prefix];
                                }
                            } else if (!ns[prefix] ||
                                        /* eslint-disable no-extra-parens */
                                        (ns[prefix] !== xmlns[prefix])) {
                                        /* eslint-enable no-extra-parens */
                                attributes += ' xmlns:' + prefix + '="' +
                                                    xmlns[prefix] + '"';
                                ns[prefix] = xmlns[prefix];
                            }
                        }
                    }
                }

                for (key in child) {
                    if (child.hasOwnProperty(key) && key !== '@xmlns') {
                        obj = child[key];
                        if (key === '$') {
                            text += obj;
                        } else if (key.indexOf('@') === 0) {
                            attributes += ' ' + key.substring(1) + '="' +
                                            obj + '"';
                        } else {
                            body += processLeaf(key, obj, cloneNS(ns));
                        }
                    }
                }

                body = text + body;

                /* eslint-disable no-extra-parens */
                return (body !== '') ?
                /* eslint-enable no-extra-parens */
                    el + attributes + '>' + body + '</' + lname + '>' :
                    el + attributes + '/>';
            }
        };

        for (leafName in data) {

            if (data.hasOwnProperty(leafName) && leafName.indexOf('@') ===
                                                            TP.NOT_FOUND) {
                return processLeaf(leafName, data[leafName], {});
            }
        }

        return null;
    }

    return null;
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

TP.definePrimitive('$jsonObj2xml',
function(anObject, rootName) {

    /**
     * @method $jsonObj2xml
     * @summary Converts a ("plain") JavaScript object that was produced
     *     directly from parsing JSON into an XML representation.
     * @description This method is used by TIBET internal machinery to produce a
     *     specific XML format for use with JSONPaths. Therefore, it is not
     *     intended to be a general purpose transformation for JavaScript -> XML
     *     data. Use the public TP.json2xml() method for that purpose.
     * @param {Object} anObject The object to transform.
     * @param {String} rootName The name of the root tag. This defaults to
     *     'root'.
     * @returns {Node} An XML node representing the same data structures found
     *     in the Object, using to a very specific, purpose-built algorithm for
     *     TIBET's JSONPath support.
     */

    var jsonObjAsXMLStr,

        dataRoot,
        rootKeys,

        name,

        str,
        doc,

        result;

    jsonObjAsXMLStr = function(obj, aSlotName) {

        //  NB: We use native JS language constructs in this Function for
        //  performance reasons.

        var slotName,

            theType,
            i,
            keys;

        if (!TP.regex.XML_NAMEREF.match(aSlotName)) {
            TP.ifWarn() ?
                TP.warn('Stripping invalid XML name in JSON conversion: ' +
                aSlotName) : 0;
            return;
        }

        slotName = aSlotName;

        //  If the slot name contains colons (':'), replace them with '__'.
        //  Otherwise, we'll have XML names that won't resolve because of
        //  'namespaces'.
        if (TP.regex.HAS_COLON.test(slotName)) {
            slotName = slotName.replace(/:/g, '__');
        }

        theType = typeof obj;

        switch (theType) {

            case 'undefined':
                str += '<' + slotName + ' type="' + theType + '">' +
                        'undefined' +
                        '</' + slotName + '>';
                break;

            case 'boolean':
            case 'number':
            case 'string':

                str += '<' + slotName + ' type="' + theType + '">' +
                        TP.xmlLiteralsToEntities(obj.toString()) +
                        '</' + slotName + '>';
                break;

            case 'object':

                if (obj === null) {
                    str += '<' + slotName + ' type="null">' +
                            'null' +
                            '</' + slotName + '>';
                } else {
                    switch (true) {
                        case obj instanceof Date:
                            str += '<' + slotName + ' type="date">' +
                                    obj.toISOString() +
                                    '</' + slotName + '>';
                            break;

                        case obj instanceof Array:

                            str += '<' + slotName + ' type="array">';
                            for (i = 0; i < obj.length; i++) {
                                jsonObjAsXMLStr(obj[i], slotName);
                            }
                            str += '</' + slotName + '>';
                            break;

                        default:

                            keys = TP.objectGetKeys(obj);
                            str += '<' + slotName + ' type="object">';
                            for (i = 0; i < keys.length; i++) {
                                if (TP.regex.PRIVATE_OR_INTERNAL_SLOT.test(
                                                                    keys[i])) {
                                    continue;
                                }

                                jsonObjAsXMLStr(obj[keys[i]], keys[i]);
                            }
                            str += '</' + slotName + '>';
                            break;
                    }
                }
                break;

            default:
                break;
        }
    };

    name = TP.ifInvalid(rootName, 'root');

    dataRoot = anObject;

    //  If the object has more than 1 key, then put it in another object with a
    //  single slot keyed under the root name. This is because the translation
    //  machinery cannot handle multi-keyed objects - it needs a 'rooted'
    //  object.
    rootKeys = TP.objectGetKeys(anObject);
    if (rootKeys.getSize() > 1) {
        dataRoot = {};
        dataRoot[name] = anObject;
    }

    //  Build a String, starting at the root object. This function, defined
    //  above, recursively calls itself to build out the entire structure.
    str = '';
    jsonObjAsXMLStr(dataRoot, name);

    //  Try to turn that a real XML DOM.
    doc = new DOMParser().parseFromString(str, 'application/xml');

    if (TP.isXMLDocument(doc) &&
        TP.notValid(doc.getElementsByTagName('parsererror')[0])) {

        //  If we a real result, then we either use the documentElement's
        //  firstChild or, if there are multiple children under the
        //  documentElement, then the documentElement itself.
        result = TP.doc();
        if (doc.documentElement.childNodes.length > 0) {
            result.appendChild(doc.documentElement.firstChild);
        } else {
            result.appendChild(doc.documentElement);
        }

        return result;
    } else {
        TP.ifWarn() ?
            TP.warn('Unable to convert JSON to XML for: ' + str) : 0;
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

TP.definePrimitive('$xml2jsonObj',
function(aNode) {

    /**
     * @method $xml2jsonObj
     * @summary Converts an XML representation into a ("plain") JavaScript
     *     object that can directly produce 'clean' JSON.
     * @description This method is used by TIBET internal machinery to produce a
     *     JavaScript object from a specific XML format used with TIBET's
     *     implementation of JSONPaths (it is the inverse of the
     *     'TP.$jsonObj2xml' method). Therefore, it is not intended to be a
     *     general purpose transformation for XML -> JavaScript data. Use the
     *     public TP.xml2json() method for that purpose.
     * @param {Node} aNode An XML node.
     * @returns {Object} A JavaScript Object representing the same data
     *     structures found in the XML, using to a very specific, purpose-built
     *     algorithm for TIBET's JSONPath support.
     */

    var xmlNodeAsJSONObj,

        node,

        root;

    xmlNodeAsJSONObj = function(anElement, parentObj) {

        var elemName,

            newObj,
            i,

            currentChild,

            itemObj,
            children,

            key;

        elemName = anElement.nodeName;

        //  If any of the element names have '__', it's because they contained
        //  colons (':') and we needed to convert them in the $jsonObj2xml
        //  method. Convert them back here.
        if (/__/.test(elemName)) {
            elemName = elemName.replace(/__/g, ':');
        }

        switch (anElement.getAttribute('type')) {

            case 'null':

                parentObj[elemName] = null;
                break;

            case 'undefined':

                parentObj[elemName] = undefined;
                break;

            case 'boolean':

                /* eslint-disable no-extra-parens */
                parentObj[elemName] = (anElement.textContent === 'true');
                /* eslint-enable no-extra-parens */
                break;

            case 'number':

                parentObj[elemName] = parseFloat(anElement.textContent);
                break;

            case 'string':

                parentObj[elemName] = anElement.textContent;
                break;

            case 'date':

                parentObj[elemName] = Date.parse(anElement.textContent);
                break;

            case 'array':

                newObj = [];

                itemObj = {};

                if (!(children = anElement.children)) {
                    children = TP.nodeGetChildElements(anElement);
                }

                for (i = 0; i < children.length; i++) {

                    currentChild = children[i];

                    xmlNodeAsJSONObj(currentChild, itemObj);
                    key = TP.objectGetKeys(itemObj)[0];

                    newObj.push(itemObj[key]);
                    itemObj[key] = null;
                }

                parentObj[elemName] = newObj;
                break;

            case 'object':

                newObj = {};

                if (!(children = anElement.children)) {
                    children = TP.nodeGetChildElements(anElement);
                }

                for (i = 0; i < children.length; i++) {

                    currentChild = children[i];

                    xmlNodeAsJSONObj(currentChild, newObj);
                }

                parentObj[elemName] = newObj;
                break;

            default:
                break;
        }
    };

    //  If we got back a Text node, just return it's node value - we must've
    //  been translating a scalar value.
    if (TP.isTextNode(aNode)) {
        return aNode.nodeValue;
    } else if (TP.isDocument(node = aNode)) {
        node = aNode.documentElement;
    }

    root = {};

    xmlNodeAsJSONObj(node, root);

    return root;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('xmlStringGetUndefinedPrefixes',
function(aString) {

    /**
     * @method xmlStringGetUndefinedPrefixes
     * @summary Returns an Array of XML namespace prefixes that occur in the
     *     supplied String, but are currently undefined in TIBET.
     * @param {String} aString The XML string content to find undefined
     *     namespace prefixes in.
     * @returns {String[]} An Array of undefined XML (either element or
     *     attribute level) prefixes in the supplied String.
     */

    var elemResults,
        attrResults,

        allResults;

    //  Extract all of the element prefixes from the supplied String. Note that
    //  they will all contain a leading less than ('<') and a trailing colon
    //  (':').
    TP.regex.ALL_ELEM_PREFIXES.lastIndex = 0;
    elemResults = TP.regex.ALL_ELEM_PREFIXES.match(aString);

    if (TP.isArray(elemResults)) {
        //  We're only interested in one occurrence per prefix.
        elemResults.unique();

        //  Strip off the leading less than and trailing colon from each one.
        elemResults = elemResults.collect(
                        function(aPrefix) {
                            //  Slice off the '<' and ':'
                            return aPrefix.slice(1, -1);
                        });
    } else {
        elemResults = TP.ac();
    }

    //  Extract all of the attribute prefixes from the supplied String. Note
    //  that they will all contain a colon (':') followed by the attribute name
    //  and an equals ('=') that we don't care about.
    TP.regex.ALL_ATTR_PREFIXES.lastIndex = 0;
    attrResults = TP.regex.ALL_ATTR_PREFIXES.match(aString);

    if (TP.isArray(attrResults)) {
        //  We're only interested in one occurrence per prefix.
        attrResults.unique();

        //  Strip off the leading less than and trailing colon from each one.
        attrResults = attrResults.collect(
                        function(aPrefix) {
                            //  Slice off from the index ':'
                            return aPrefix.slice(0, aPrefix.indexOf(':'));
                        });
    } else {
        attrResults = TP.ac();
    }

    allResults = elemResults.concat(attrResults);

    //  Filter the results to only those that do *not* have a definition in our
    //  common namespace URI dictionary.
    allResults = allResults.filter(
                    function(aPrefix) {
                        return TP.notValid(TP.w3.Xmlns.getNSURIForPrefix(aPrefix)) &&
                                TP.notValid(TP.boot.$uriSchemes[aPrefix]);
                    });

    return allResults.unique();
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
    if (TP.canInvoke(anObject, 'asTP_dom_XMLRPCNode')) {
        return anObject.asTP_dom_XMLRPCNode();
    }

    return TP.dom.XMLRPCNode.from(anObject);
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
//  Download support
//  ------------------------------------------------------------------------

TP.definePrimitive('documentDownloadContent',
function(aDocument, content, filename) {

    /**
     * @method documentDownloadContent
     * @summary Downloads the supplied content to the user's local file system.
     * @description This mechanism generates a link to an internally-generated
     *     URL which points to an encoded version of the supplied content and
     *     then activates that link via a synthetic 'click' event.
     * @param {Document} aDocument The document that the download link element
     *     will be generated into (and removed from when complete).
     * @param {String} content The content to download.
     * @param {String} filename The filename to make the downloaded data
     *     available under.
     */

    var win,

        blob,
        url,

        anchorElem,
        evt;

    if (!TP.isDocument(aDocument)) {
        return;
    }

    if (TP.isEmpty(content) || TP.isEmpty(filename)) {
        return;
    }

    //  Grab the Window of the supplied document.
    win = TP.nodeGetWindow(aDocument);

    //  Create a new Blob object with the supplied content, encoding it as
    //  'octet/stream'.
    blob = new Blob(TP.ac(content), {type: 'octet/stream'});

    //  Create a URL and put the blob in there as the URL's resource.
    url = win.URL.createObjectURL(blob);

    //  Create a new anchor and set various attributes on it to allow us to
    //  treat it as a 'download' link.
    anchorElem = TP.documentConstructElement(aDocument, 'a', TP.w3.Xmlns.XHTML);

    //  NB: These properties must be set directly for this approach to work. We
    //  cannot use TP.elementSetAttribute here.
    anchorElem.href = url;
    anchorElem.download = filename;

    //  Append the anchor to the document's body. This will allow us to activate
    //  it.
    TP.nodeAppendChild(TP.documentGetBody(aDocument), anchorElem, false);

    //  Create a 'click' Event and dispatch it against the anchor. This will
    //  activate the anchor and begin the download process.
    evt = TP.documentConstructEvent(aDocument, TP.hc('type', 'click'));
    anchorElem.dispatchEvent(evt);

    //  We're done with it - detach it from it's parent node.
    TP.nodeDetach(anchorElem);

    return;
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
    //  This slot will be removed either inside of this call, or by a fork
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

    //  get the string version of the URI, which will process TP.uri.URIs as
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
    elem = TP.documentConstructScriptElement(
            contextDoc,
            url,
            function() {

                TP.nodeDetach(elem);

                //  Make sure the slot on the context windows is cleared
                //  after 1 second after this function is called (which is
                //  called after the callback function whose reference is
                //  embedded in the JSON).
                setTimeout(function() {

                    if (TP.isCallable(contextWin[callbackID])) {
                        //  Note that we just set this to 'null' to avoid IE
                        //  problems
                        contextWin[callbackID] = null;
                    }
                }, TP.sys.cfg('jsonp.delay'));
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
