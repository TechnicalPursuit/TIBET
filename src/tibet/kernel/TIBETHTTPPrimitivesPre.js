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
 * @Support functions for HTTP operation. These include common error handling,
 *     status checking, and encoding routines.
 */

//  ------------------------------------------------------------------------

TP.definePrimitive('httpConstruct',
function(targetUrl) {

    /**
     * @method httpConstruct
     * @summary Returns a platform-specific XMLHttpRequest object for use.
     * @param {String} targetUrl The request's target URL.
     * @returns {XMLHttpRequest}
     */

    var xhr,
        url;

    xhr = new XMLHttpRequest();

    if (TP.notValid(xhr)) {
        TP.httpError(targetUrl, 'HTTPConstructException',
            TP.hc('message', 'Unable to instantiate XHR object.'));
        return;
    }

    //  URL instances which make use of "comm objects" support API to access the
    //  last used object and its data provided we keep that reference updated.
    if (TP.isValid(targetUrl) &&
            TP.isValid(TP.sys.getTypeByName('TP.core.URI'))) {
        url = TP.uc(targetUrl);
        url.$set('commObject', xhr);
    }

    return xhr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpDidSucceed',
function(httpObj) {

    /**
     * @method httpDidSucceed
     * @summary Returns true if the request is done and was successful.
     * @description In essence this simply tests the status code to see if it is
     *     in the range of 200 to 207. Normally success is 200, but for
     *     operations like WebDAV MkCol, Lock, etc. we may receive other 2xx
     *     codes which signify success. A status code of 304 (Not-Modified) is
     *     returned by certain servers, particularly when using ETag data for
     *     performance but it also indicates a success. A status code of 0 can
     *     also mean success when using an HTTP request to access the local file
     *     system.
     *
     *     The codes are:
     *
     *     0, OK if file system access was being performed 200, 'OK', 201,
     *     'Created', 202, 'Accepted', 203, 'Non-Authoritative Information',
     *     204, 'No Content', 205, 'Reset Content', 206, 'Partial Content', 207,
     *     'WebDAV Multi-Status', 304, 'Not Modified', (ETag and/or Opera)
     *
     *
     * @param {XMLHttpRequest} httpObj An XMLHttpRequest which was used for a
     *     server call.
     * @returns {Boolean} True if the request was successful.
     */

    var stat;

    //  If the XHR mechanism has aborted in Mozilla, it will cause the
    //  '.status' property to throw an exception if it is read.
    try {
        stat = httpObj.status;

        //  OK, Created, and Accepted are considered success codes
        if (stat >= 200 && stat <= 207 || stat === 304) {
            return true;
        }

        //  file access often returns status of 0 (improperly we realize)
        if (stat === 0 && (httpObj.responseXML || httpObj.responseText)) {
            return true;
        }
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'HTTP status error.'),
                        TP.IO_LOG) : 0;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpDidRedirect',
function(httpObj) {

    /**
     * @method httpDidRedirect
     * @summary Returns true if the request provided has a status code
     *     indicating a redirect.
     * @description TIBET considers all 300-series codes other than a 304 (Not
     *     Modified) to be valid redirection indicators. We avoid 304 in
     *     particular so we can support HTTP Validation via ETag headers. The
     *     300 series codes are:
     *
     *     300, 'Multiple Choices', 301, 'Moved Permanently', 302, 'Found',
     *     303, 'See Other', 304, 'Not Modified', 305, 'Use Proxy', 306,
     *     '(Unused)', 307, 'Temporary Redirect',
     *
     *
     * @param {XMLHttpRequest} httpObj An XMLHttpRequest which was used for a
     *     server call.
     * @returns {Boolean} True for redirection responses.
     */

    var stat;

    //  If the XHR mechanism has aborted in Mozilla, it will cause the
    //  '.status' property to throw an exception if it is read.
    try {
        stat = httpObj.status;

        //  from Multiple Choices to Temporary Redirect
        if (stat >= 300 && stat <= 307) {

            //  Not Modified will be false, all others are true.
            /* eslint-disable no-extra-parens */
            return (stat !== 304);
            /* eslint-enable no-extra-parens */
        }
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'HTTP redirect error.'),
                        TP.IO_LOG) : 0;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpEncode',
function(aPayload, aMIMEType, aSeparator, multipartMIMETypes, anEncoding) {

    /**
     * @method httpEncode
     * @summary Provides URI and data encoding support for commonly used MIME
     *     types. The data is returned, either ready to be appended to the
     *     targetUrl, or ready for use as content for a POST, PUT, or similar
     *     operation. NOTE that if the data is a string already, or is
     *     null/undefined no new content is created and the data is returned as
     *     is.
     * @description Encoding of data can be performed a number of ways but this
     *     method handles the most common formats related to content types
     *     typically used to communicate with web servers and web services.
     *     Supported MIME types include:
     *
     *     application/json
     *     application/x-www-form-urlencoded
     *     application/xml
     *     application/xml+rpc
     *     application/vnd.tpi.hidden-fields
     *     multipart/form-data
     *     multipart/related
     *
     * @param {Object} aPayload The call data to encode along with the URL. Note
     *     that when this is a string it won't be altered in any form.
     * @param {String} aMIMEType One of the standard HTTP MIME type formats such
     *     as application/x-www-form-urlencoded or multipart/form-data.
     * @param {String} aSeparator Used for url encoding, this is normally the &
     *     used to separate individual key/value pairs.
     * @param {String[]} multipartMIMETypes Used when encoding multipart
     *     messages, 1 per message part.
     * @param {String} anEncoding The character set/encoding to use. Default is
     *     'UTF-8'. NOTE that changing this can cause certain encodings to be
     *     inconsistent so use caution when changing this value.
     * @returns {String} The encoded data, in string form so it can be sent to
     *     the server or stored on disk.
     */

    var data,

        mimetype,
        charset,
        separator,
        firstPartMIMEType,

        arr,
        list,
        item,
        size,
        i,
        j,
        len,
        el,
        val,
        boundary,
        content;

    //  when the data is a string already we presume it's in the proper
    //  form, which may not be true but we're not gonna parse it now :) We
    //  also don't go any further for data that isn't actually there.
    if (TP.notValid(aPayload)) {
        return aPayload;
    }

    //  if we got handed a String, see if we can turn it into a Node. If we
    //  can't, or all we get from that process is a Text node, then just return
    //  what we got handed.
    if (TP.isString(aPayload)) {

        //  Note here how we don't supply a default namespace, nor do we want
        //  this call to report XML parsing errors - if we have them, the
        //  payload is unusable as XML so we'll just return it.
        if (!TP.isNode(data = TP.nodeFromString(aPayload, null, false))) {
            return aPayload;
        }
        //  If it's a Text node, then just return the original payload.
        if (TP.isTextNode(data)) {
            return aPayload;
        }
    } else if (TP.isPlainObject(aPayload)) {
        data = TP.hc(aPayload);
    } else {
        data = aPayload;
    }

    //  commonly get nodes for encoding, but we want to unwrap TP.core.Nodes
    if (TP.canInvoke(data, 'getNativeNode')) {
        data = data.getNativeNode();
    }

    //  default mime type is the one used for most GET/POST/PUT calls
    mimetype = TP.ifInvalid(aMIMEType, TP.URL_ENCODED);

    charset = TP.ifInvalid(anEncoding, TP.UTF8);

    separator = TP.ifInvalid(aSeparator, '&');

    if (TP.notEmpty(multipartMIMETypes)) {
        firstPartMIMEType = multipartMIMETypes.first();
    }

    switch (mimetype) {
        case TP.JSON_ENCODED:

            //  the format preferred for AJAX mashups and public services
            //  since it leverages a gaping security hole to get around
            //  cross-site security restrictions on XMLHttpRequest
            if (TP.isNode(data)) {
                return TP.xml2json(data);
            } else {
                return TP.js2json(data);
            }

        case TP.URL_ENCODED:

            //  this format is typically used with GET requests, but it can
            //  also be used with other call types such as POST or PUT. Note
            //  that XForms allows this with POST, but considers it to be a
            //  deprecated format

            arr = TP.ac();

            if (TP.isNode(data)) {
                //  we follow the XForms approach for encoding here, using
                //  non-empty elements containing text nodes and discarding
                //  everything else. Note that we have to ensure the node
                //  itself gets encoded by putting it in the list.
                list = TP.nodeGetElementsByTagName(data, '*');
                list.unshift(data);

                len = list.getSize();
                for (i = 0; i < len; i++) {
                    el = list.at(i);
                    if (TP.notEmpty(el)) {    //  empty node means no children
                        if (TP.notEmpty(val = TP.nodeGetTextContent(el))) {
                            arr.push(TP.join(TP.elementGetLocalName(el),
                                            '=',
                                            encodeURIComponent(val)));
                        }
                    }
                }
            } else {
                list = TP.keys(data);

                len = list.getSize();
                for (i = 0; i < len; i++) {
                    if (TP.notEmpty(val = data.at(list.at(i)))) {
                        arr.push(TP.join(list.at(i),
                                        '=',
                                        encodeURIComponent(val)));
                    } else {
                        //  if there's no value, we just push on the key
                        arr.push(list.at(i));
                    }
                }
            }

            //  join using the separator provided, but return a null if the
            //  data ends up empty to avoid sending '' as content
            return TP.ifEmpty(arr.join(separator), null);

        case TP.XML_ENCODED:

            //  we don't do much here other than serialize the content if
            //  it's a node so we get the best rep possible. any filtering
            //  of the XML had to happen at a higher level (i.e. XForms)
            if (TP.isNode(data)) {
                return TP.nodeAsString(data);
            }

            //  not a node container or a native node, so who knows?
            return TP.nodeAsString(TP.js2xml(data));

        case TP.XMLRPC_ENCODED:

            //  another common format for server communication, particularly
            //  with several open source applications like OpenGroupware
            return TP.nodeAsString(TP.js2xmlrpc(data));

        case TP.FIELD_ENCODED:

            //  not a standard, but something we found useful for certain
            //  situations -- encode data as if it had been in an html form.
            //  This can then be POSTed as form content.

            arr = TP.ac();

            if (TP.isNode(data)) {
                list = TP.nodeGetElementsByTagName(data, '*');
                list.unshift(data);

                len = list.getSize();
                for (i = 0; i < len; i++) {
                    el = list.at(i);
                    if (TP.notEmpty(el)) {    //  empty node means no children
                        if (TP.notEmpty(val = TP.nodeGetTextContent(el))) {
                            arr.push(
                                '<input type="hidden" name="',
                                el.tagName,
                                '" value="',
                                val.replace(/"/g, '&quot;'),
                                '" />\n');
                        }
                    }
                }
            } else {
                list = TP.keys(data);

                len = list.getSize();
                for (i = 0; i < len; i++) {
                    item = data.at(list.at(i));
                    if (TP.isArray(item)) {
                        size = item.getSize();
                        for (j = 0; j < size; j++) {
                            arr.push(
                                '<input type="hidden" name="',
                                list.at(i),
                                '" value="',
                                TP.str(
                                    data.at(
                                        list.at(i)).at(j)).replace(
                                                /"/g, '&quot;'),
                                '" />\n');
                        }
                    } else {
                        arr.push(
                            '<input type="hidden" name="',
                            list.at(i),
                            '" value="',
                            TP.str(item).replace(/"/g, '&quot;'),
                            '" />\n');
                    }
                }
            }

            return TP.ifEmpty(arr.join(''), null);

        case TP.MP_RELATED_ENCODED:

            arr = TP.ac();
            boundary = TP.genID('part');

            //  here we follow the XForms definition, encoding XML as a
            //  single part, and any binary as other parts (unsupported)

            //  start the show :)
            arr.push(TP.join('Content-Type: ', TP.MP_RELATED_ENCODED,
                            '; boundary=', boundary));

            //  According to the spec, the type of the first chunk of data
            //  should appear in a 'type=' parameter before the first boundary.
            if (TP.isArray(data)) {
                arr.push(
                    TP.join('; type=', TP.ifInvalid(firstPartMIMEType,
                                                      TP.PLAIN_TEXT_ENCODED)));
            } else if (TP.isNode(data)) {
                //  if the data is a Node, we use the supplied media type or
                //  TP.XML_ENCODED if that's not defined, and the same
                //  charset as the overall multipart content

                //  and charset from the content as a whole and encode the
                //  data as XML, forming a single block.
                arr.push(
                    TP.join('; type=',
                                TP.ifInvalid(firstPartMIMEType,
                                                TP.XML_ENCODED),
                            '; charset=',
                                charset));
            } else {
                arr.push(
                    TP.join('; type=',
                                TP.ifInvalid(firstPartMIMEType,
                                                TP.PLAIN_TEXT_ENCODED),
                            '; charset=',
                                charset));
            }

            //  We leave the preamble empty.

            //  place first boundary
            arr.push('--' + boundary);

            //  TODO: we don't currently support binary chunks processed via
            //  an upload element, but maybe in the future...

            //  if the data is an Array, then each item in the Array should
            //  be a TP.core.Hash containing keys that would be the same as
            //  a regular data request, such as 'body', 'multipartypes',
            //  'encoding', 'separator', etc.

            //  We then loop over those, encoding each one using the
            //  encoding data and information in each TP.core.Hash.
            if (TP.isArray(data)) {
                data.perform(
                    function(anItem, anIndex) {

                        var itemContent,

                            itemMIMEType,
                            itemEncoding,
                            itemSeparator;

                        //  Make sure that we have 'body' data to encode
                        if (TP.notValid(itemContent = anItem.at('body'))) {
                            //  TODO: Log an error here?
                            return;
                        }

                        //  Get the data into it's rawest form
                        itemContent = TP.unwrap(itemContent);

                        if (TP.notEmpty(multipartMIMETypes)) {
                            itemMIMEType = anItem.atIfInvalid(
                                                'mimetype',
                                                multipartMIMETypes.at(anIndex));
                        }
                        if (TP.isEmpty(itemMIMEType)) {
                            if (TP.isNode(itemContent)) {
                                itemMIMEType = TP.XML_ENCODED;
                            } else {
                                itemMIMEType = TP.PLAIN_TEXT_ENCODED;
                            }
                        }

                        itemEncoding = anItem.atIfInvalid('encoding', charset);

                        if (TP.notEmpty(itemMIMEType)) {
                            arr.push(
                                TP.join('Content-Type: ', itemMIMEType,
                                        '; charset=', itemEncoding));
                        }

                        itemSeparator =
                                anItem.atIfInvalid('separator', separator);

                        arr.push('Content-ID: ' + anIndex);

                        //  honor the 'noencode' flag here
                        if (TP.notTrue(anItem.at('noencode'))) {
                            //  Note here how we supply the item's 'media type'
                            //  as the MIME type to this recursive call to
                            //  TP.httpEncode() and a 'null' for the list of
                            //  multipart mime types. This is the correct
                            //  behavior but it effectively prevents *nested*
                            //  multipart/related encoding.
                            itemContent = TP.httpEncode(
                                            itemContent,
                                            itemMIMEType,
                                            itemSeparator,
                                            null,
                                            itemEncoding);
                        }

                        arr.push('', itemContent);

                        arr.push('--' + boundary);
                    });
            } else if (TP.isNode(data)) {
                //  if the data is a Node, we use the supplied media type or
                //  TP.XML_ENCODED if that's not defined, and the same
                //  charset as the overall multipart content

                //  and charset from the content as a whole and encode the
                //  data as XML, forming a single block.

                //  root
                arr.push(
                    TP.join('Content-Type: ',
                                TP.ifInvalid(firstPartMIMEType,
                                                TP.XML_ENCODED),
                            '; charset=',
                                charset),
                    'Content-ID: 0');

                //  Note here how we supply the item's 'media type'
                //  (defaulted here to XML encoding) as the MIME type to
                //  this recursive call to TP.httpEncode() and a 'null' for
                //  media type. This is the correct behavior but it
                //  effectively prevents *nested* multipart/related
                //  encoding.
                content = TP.httpEncode(
                                data,
                                TP.ifInvalid(firstPartMIMEType,
                                                TP.XML_ENCODED),
                                separator,
                                null,
                                charset);

                arr.push(content);

                arr.push('--' + boundary);
            } else {
                //  If a defined media type was supplied, we use that and
                //  the charset used for the overall multipart content.
                //  Otherwise, we omit those.

                //  Then, for each key, we obtain the data as a String, thus
                //  forming the block for each part.

                list = TP.keys(data);

                len = list.getSize();
                for (i = 0; i < len; i++) {
                    if (TP.notEmpty(multipartMIMETypes) &&
                        TP.notEmpty(multipartMIMETypes.at(i))) {
                        arr.push(
                            TP.join('Content-Type: ', multipartMIMETypes.at(i),
                                    '; charset=', charset,
                                    ' '));
                    }

                    arr.push('Content-ID: ' + list.at(i));

                    content = TP.str(data.at(list.at(i)));
                    arr.push(content);

                    arr.push('--' + boundary);
                }
            }

            //  terminate final boundary - we need to take the last item and
            //  append '--\r\n' to be spec compliant.
            arr.atPut(arr.getSize() - 1, arr.last() + '--\r\n');

            return arr.join('\r\n');

        case TP.MP_FORMDATA_ENCODED:

            //  provided for XForms compliance with older servers. The basic
            //  idea here is that each element or key/value pair gets its
            //  own chunk in the content string, with type/encoding data to
            //  describe that chunk.

            arr = TP.ac();
            boundary = TP.genID('part');

            //  per XForms spec the default here is application/octet-stream

            //  start the show :)
            arr.push(TP.join('Content-Type: ', TP.MP_FORMDATA_ENCODED,
                            '; boundary=', boundary));

            //  place first boundary
            arr.push('--' + boundary);

            if (TP.isNode(data)) {
                //  we follow the XForms approach for encoding here, using
                //  non-empty elements containing text nodes and discarding
                //  everything else
                list = TP.nodeGetElementsByTagName(data, '*');
                list.unshift(data); //  not just children, but the node too

                len = list.getSize();
                for (i = 0; i < len; i++) {
                    el = list.at(i);

                    //  According to the spec we want Elements that have no
                    //  children *Elements* (but do have children *text nodes*)

                    //  We don't want completely empty Elements.
                    if (TP.notEmpty(el)) {
                        //  But we do want ones that don't have child
                        //  *Elements*
                        if (TP.nodeGetChildElements(el).getSize() > 0) {
                            continue;
                        }
                        if (TP.notEmpty(val = TP.nodeGetTextContent(el))) {
                            arr.push(
                                TP.join(
                                    'Content-disposition: form-data',
                                    '; name="', TP.elementGetLocalName(el), '"',
                                    '\r\n',
                                    'Content-Type: ', TP.PLAIN_TEXT_ENCODED,
                                    '; charset=', charset),
                                val,
                                '--' + boundary);
                        }
                    }
                }
            } else {
                if (TP.isArray(data)) {
                    list = data.getIndices();
                } else {
                    list = TP.keys(data);
                }

                len = list.getSize();
                for (i = 0; i < len; i++) {
                    arr.push(
                        TP.join(
                            'Content-disposition: form-data',
                            '; name="', list.at(i), '"',
                            '\r\n',
                            'Content-Type: ', TP.PLAIN_TEXT_ENCODED,
                            '; charset=', charset),
                        TP.str(data.at(list.at(i))),
                        '--' + boundary);
                }
            }

            //  terminate final boundary - we need to take the last item and
            //  append '--\r\n' to be spec compliant.
            arr.atPut(arr.getSize() - 1, arr.last() + '--\r\n');

            return arr.join('\r\n');

        default:

            //  nothing we can do but return the string version
            return TP.str(data);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpEncodeRequestBody',
function(aRequest) {

    /**
     * @method httpEncodeRequestBody
     * @summary Encodes the request body for transmission. Processing in this
     *     method makes use of keys in the request to drive a call to the
     *     TP.httpEncode() primitive. If you don't want this processing to occur
     *     you can put a key of 'noencode' with a value of true in the request.
     * @param {TP.sig.HTTPRequest} aRequest The request whose parameters define
     *     the HTTP request.
     * @returns {String} The string value of the encoded body content.
     */

    var body,
        mimetype,
        separator,
        multiparttypes,
        encoding;

    body = aRequest.at('body');
    if (TP.notValid(body)) {
        return;
    }

    //  check for "please don't change my body content" flag
    if (TP.isTrue(aRequest.at('noencode'))) {
        return body;
    }

    //  REQUIRED value for the encoding process
    mimetype = aRequest.at('mimetype');

    //  only used for URL_ENCODING, but we need to pass it along
    separator = aRequest.at('separator');

    //  only used for the multi-part encodings, but just in case :)
    multiparttypes = aRequest.at('multiparttypes');

    //  should be left alone 99% of the time so it defaults to UTF-8
    encoding = aRequest.at('encoding');

    return TP.httpEncode(body, mimetype, separator, multiparttypes, encoding);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpError',
function(targetUrl, aSignal, aRequest, shouldSignal) {

    /**
     * @method httpError
     * @summary Low-level error handler for TP.httpCall processing. This
     *     function will cause both the IO log and Error log to be updated to
     *     reflect the error condition.
     * @description aRequest could contain 1 or more of the following keys:
     *
     *     'uri' - the targetUrl
     *     'uriparams' - URI query parameters
     *     'headers' - call headers
     *     'method' - the command method
     *     'body' - string content
     *     'commObj' - xml http request
     *     'response' - TP.sig.Response
     *     'object' - any error object
     *     'message' - error string
     *     'direction' - send/recv
     *     'async' - true/false
     *     'redirect' - boolean
     *
     * @param {String} targetUrl The URL being accessed when the error occurred.
     * @param {String|TP.sig.Signal} aSignal The signal which should be raised
     *     by this call.
     * @param {TP.core.Hash|TP.sig.Request} aRequest A request/hash with keys.
     * @param {Boolean} [shouldSignal=true] Whether to signal failure/completed
     *     which will close out the request properly.
     * @exception HTTPException
     * @throws Error Throws an Error containing aString.
     */

    var args,
        signal,
        error,
        type,
        sig,
        id;

    //  make sure we've got at least a basic TP.sig.Request to work with
    args = aRequest || TP.request();

    //  make sure we tuck away the url if there's no prior value
    args.atPutIfAbsent('uri', targetUrl);

    //  rarely null, but just in case
    signal = TP.ifInvalid(aSignal, 'HTTPException');

    //  if we didn't get an error we can relay a new one
    error = args.at('object');
    if (TP.notValid(error)) {
        error = new Error(TP.ifEmpty(args.at('message'), signal));
    }
    args.atPut('error', error);

    //  make sure the IO log contains this data to show a complete record for
    //  access to the targetUrl
    args.atPut('message', 'HTTP request exception.');

    //  get a response object for the request that we can use to convey the bad
    //  news in a consistent fashion with normal success processing.
    if (TP.notValid(type = TP.sys.getTypeByName('TP.sig.HTTPResponse',
                                                    false))) {
        if (TP.notValid(type = TP.sys.getTypeByName('TP.sig.Response',
                                                        false))) {
            //  real problems...typically crashing during boot since none of
            //  the core kernel response types appear to be valid.
            return;
        }
    }

    sig = type.construct(args);
    id = args.getRequestID();

    //  start with most specific
    sig.setSignalName(aSignal);
    sig.fire(id);

    //  move on to general failure
    sig.setSignalName('TP.sig.IOFailed');
    sig.fire(id);

    //  success or failure all operations "complete" so that's last
    sig.setSignalName('TP.sig.IOCompleted');
    sig.fire(id);

    //  if the signal handler said to prevent default then don't continue, just
    //  stop and avoid throw logic entirely.
    if (sig.shouldPrevent()) {
        return;
    }

    if (args && TP.notTrue(args.get('logged'))) {
        if (TP.ifError()) {
            args.set('logged', true);
            try {
                TP.error(TP.IO_LOG, args);
            } catch (e) {
                void 0;
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpGetDefaultHeaders',
function() {

    /**
     * @method httpGetDefaultHeaders
     * @summary Builds and returns a set of default headers for a web call.
     * @returns {TP.core.Hash} A hash of default headers which can be used for a
     *     standard web call.
     */

    //  NOTE that we build a new hash each time so it can be modified as
    //  needed by each request. Also note that this is done lazily so that
    //  we're sure we're getting a full hash object, not a TP.boot.PHash.
    return TP.hc('Pragma', 'no-cache',
                    'Cache-Control', TP.ac('private',
                        'no-cache', 'no-store', 'must-revalidate'),
                    'Expires', '-1',
                    'Accept', TP.ac(TP.JS_TEXT_ENCODED,
                                    TP.JSON_ENCODED,
                                    TP.JSON_TEXT_ENCODED,
                                    TP.XML_ENCODED,
                                    TP.XML_TEXT_ENCODED,
                                    TP.XHTML_ENCODED,
                                    TP.HTML_TEXT_ENCODED,
                                    '*/*'));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('httpSetHeaders',
function(targetUrl, aRequest, httpObj) {

    /**
     * @method httpSetHeaders
     * @summary Sets the HTTP headers on httpObj for the URL, call type (HTTP
     *     method), and header collection provided.
     * @description TIBET manages certain headers by default, in particular
     *     Cache-control and Pragma headers that help ensure that requests for
     *     data get current data whenever possible. You can override this by
     *     simply providing those keys in the header collection to tell TIBET
     *     you have your own plans for how to manage the headers.
     *
     *     Also note that certain header management is handled by the TPHTTPURI
     *     type to help ensure that ETag processing and other cache-related
     *     behavior is done properly.
     * @param {String} targetUrl The URL accessed by the request.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request containing
     *     additional parameters.
     * @param {XMLHttpRequest} httpObj The request object to configure.
     * @returns {String} The headers in string form, for logging. Note that the
     *     httpObj provided will contain the new headers on return from this
     *     method.
     */

    var request,
        headers,

        simpleCORSOnly,

        header,

        hash,

        keys,
        len,
        i,
        key,
        val,
        j,
        body,
        url,

        altMethod;

    request = aRequest || TP.request();

    headers = TP.ifKeyInvalid(request, 'headers',
                                TP.httpGetDefaultHeaders());
    request.atPut('headers', headers);

    //  NOTE we use the string of the body content here for Content-Length
    body = request.at('finalbody');
    url = request.at('uri');

    simpleCORSOnly = TP.sys.cfg('http.simple_cors_only') ||
                        request.at('simple_cors_only');

    //  Default the mimetype based on body type as best we can.
    if (TP.notDefined(request.at('mimetype'))) {
        request.atPut('mimetype',
            TP.ietf.Mime.guessMIMEType(body, TP.uc(url), TP.URL_ENCODED));
    }

    //  typically we turn off cache behavior for these requests so we're
    //  sure we're getting the most current data

    //  on moz we have to avoid duplication of this header, which seems
    //  to appear as if by magic...
    if (TP.sys.isUA('GECKO')) {
        if (TP.isDefined(header = headers.at('Pragma'))) {
            if (header === 'no-cache') {
                headers.removeKey('Pragma');
            } else if (TP.isArray(header)) {
                header.remove('no-cache');
            }
        }
    } else if (TP.notDefined(headers.at('Pragma'))) {
        headers.atPut('Pragma', 'no-cache');
    }

    //  when no Cache-control is specified we want to bypass caches
    if (TP.notDefined(headers.at('Cache-Control'))) {
        headers.atPut('Cache-Control', TP.ac('no-cache', 'no-store'));
    }

    //  add a header for Content-Type if not already found. default is
    //  standard form encoding
    if (TP.notDefined(headers.at('Content-Type'))) {
        headers.atPut('Content-Type', request.at('mimetype'));
    }

    //  identify the request as coming from an XMLHttpRequest (ala Rails), but
    //  only if we'
    if (TP.notDefined(headers.at('X-Requested-With'))) {
        if (TP.uriNeedsPrivileges(targetUrl) && simpleCORSOnly) {
            //  targetUrl needs privileges but we're configured for 'simple
            //  CORS' only, which disallows custom 'X-' headers.
            void 0;
        } else {
            headers.atPut('X-Requested-With', 'XMLHttpRequest');
        }
    }

    //  if the request would like us to try to authenticate as part of the
    //  request (avoiding the initial round trip for the browser), we can
    //  try that here. Note that we only support 'HTTP Basic' authentication
    //  for now ('HTTP Digest' authentication requires a round-trip to the
    //  server anyway for the 'server nonce').
    if (request.at('auth') === TP.HTTP_BASIC) {
        //  if 'Authorization' authentication header wasn't supplied but a
        //  username/password was, then compute an 'HTTP Basic'
        //  authentication header
        if (TP.notDefined(headers.at('Authorization')) &&
                TP.isDefined(request.at('username')) &&
                TP.isDefined(request.at('password'))) {
            hash = TP.btoa(
                    TP.join(request.at('username'),
                            ':',
                            request.at('password')));

            headers.atPut('Authorization', 'Basic ' + hash);
        }
    }

    //  If the user didn't already define an 'X-HTTP-Method-Override' header and
    //  the regular method was set to POST and there is an 'alternate method'
    //  provided, then set a 'X-HTTP-Method-Override' header with the alternate
    //  method. But only do this if we're not doing simple CORS.
    if (TP.notDefined(headers.at('X-HTTP-Method-Override'))) {
        if (request.at('method') === TP.HTTP_POST &&
            TP.notEmpty(altMethod = request.at('altmethod'))) {
            if (TP.uriNeedsPrivileges(targetUrl) && simpleCORSOnly) {
                //  targetUrl needs privileges but we're configured for 'simple
                //  CORS' only, which disallows custom 'X-' headers.
                void 0;
            } else {
                headers.atPut('X-HTTP-Method-Override', altMethod);
            }
        }
    }

    //  now that we've got our header collection in place for this call we
    //  need to actually add those headers to the current request object
    keys = TP.keys(headers);
    len = keys.getSize();
    for (i = 0; i < len; i++) {
        key = keys.at(i);
        val = headers.at(key);

        if (TP.isArray(val)) {
            if (TP.sys.isUA('WEBKIT')) {
                //  It's an Array of settings, so we join it with a ', '
                httpObj.setRequestHeader(key, val.join(', '));
            } else {
                for (j = 0; j < val.getSize(); j++) {
                    httpObj.setRequestHeader(key, val.at(i));
                }
            }
        } else {
            httpObj.setRequestHeader(key, val);
        }
    }

    return TP.str(headers);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$httpTimeout',
function(targetUrl, aRequest, httpObj) {

    /**
     * @method $httpTimeout
     * @summary Notifies the proper callback handlers and provides common
     *     signaling upon timeout of an HTTP request. This method is invoked
     *     automatically by the TP.httpCall method when an asynchronous
     *     request times out.
     * @param {String} targetUrl The full target URI in string form.
     * @param {TP.sig.Request} aRequest The request object holding parameter
     *     data.
     * @param {XMLHttpRequest} httpObj The native XMLHttpRequest object used to
     *     service the request.
     */

    var request,
        type,
        sig,
        id;

    //  kill the native request activity so no other callbacks will fire
    TP.httpAbort(httpObj);

    request = TP.request(aRequest);

    //  make sure the request has access to the native http request object
    request.atPut('commObj', httpObj);

    //  configure the request's final output parameters to record the error
    request.atPut('direction', TP.RECV);
    request.atPut('object', new Error('Timeout'));
    request.atPut('message', 'HTTP request failed: Timeout');

    //  log it consistently with any other error
    TP.httpError(targetUrl, 'HTTPSendException', request, false);

    //  get a response object for the request that we can use to convey the
    //  bad news in a consistent fashion with normal success processing.
    if (TP.notValid(type = TP.sys.getTypeByName('TP.sig.HTTPResponse',
                                                    false))) {
        if (TP.notValid(type = TP.sys.getTypeByName('TP.sig.Response',
                                                        false))) {
            //  real problems...typically crashing during boot since none of
            //  the core kernel response types appear to be valid.
            return;
        }
    }

    sig = type.construct(request);
    id = request.getRequestID();

    //  start with most specific, the fact we timed out
    sig.setSignalName('TP.sig.IOTimeout');
    sig.fire(id);

    //  move on to general failure, timeout is considered a failure
    sig.setSignalName('TP.sig.IOFailed');
    sig.fire(id);

    //  success or failure all operations "complete" so that's last
    sig.setSignalName('TP.sig.IOCompleted');
    sig.fire(id);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$httpWrapup',
function(targetUrl, aRequest, httpObj) {

    /**
     * @method $httpWrapup
     * @summary Notifies the proper callback handlers and provides common
     *     signaling upon completion of an HTTP request. Note that both
     *     synchronous and asynchronous requests will invoke this on completion
     *     of the request.
     * @param {String} targetUrl The full target URI in string form.
     * @param {TP.sig.Request} aRequest The request object holding parameter
     *     data.
     * @param {XMLHttpRequest} httpObj The native XMLHttpRequest object used to
     *     service the request.
     */

    var request,
        url,
        redirect,
        async,
        xhr,
        type,
        sig,
        id;

    request = aRequest || TP.request();

    url = targetUrl;
    if (TP.notValid(url)) {
        url = request.at('uri');
    }

    //  typically we'll allow redirects, but TP.httpDelete and others may
    //  set this to false to avoid potential problems
    redirect = request.atIfInvalid('redirect', true);

    //  if we got a redirection status we'll need to resubmit, provided that
    //  the particular request is not turning off redirection
    if (redirect && TP.httpDidRedirect(httpObj)) {
        //  update the url to the referred location...once
        url = httpObj.getResponseHeader('Location');

        //  if the original request was async that might cause another
        //  async call here...but we want to avoid that level of
        //  complexity here so we adjust when redirected
        async = request.at('async');
        if (TP.isTrue(async)) {
            //  TODO:   this could create a potential "hang" condition if
            //  the redirected site isn't available
            request.atPut('async', false);
        }

        try {
            //  NOTE that httpCall will store 'commObj' for us.
            TP.httpCall(url, request);
        } finally {
            request.atPut('async', async);
        }
    } else {
        xhr = httpObj;
        request.atPut('commObj', xhr);
    }

    //  create a signal that will carry the request to any callbacks in a
    //  fashion that allows it to treat it like a proper response object
    if (TP.notValid(type = TP.sys.getTypeByName('TP.sig.HTTPResponse',
                                                    false))) {
        if (TP.notValid(type = TP.sys.getTypeByName('TP.sig.Response',
                                                        false))) {
            //  real problems...typically crashing during boot since none of
            //  the core kernel response types appear to be valid.
            return;
        }
    }

    sig = type.construct(request);
    id = request.getRequestID();

    //  Make sure the signal we'll be sending is also mapped as the response for
    //  the original request.
    request.setResponse(sig);

    //  TODO:   do we want to signal something like an IORedirect as needed?

    //  with/without redirect, did we succeed?
    if (!TP.httpDidSucceed(xhr)) {
        //  NB: This method will signal 'TP.sig.IOFailed' and
        //  'TP.sig.IOCompleted'
        TP.httpError(url, 'HTTPException', request, false);
    } else {
        sig.setSignalName('TP.sig.IOSucceeded');
        sig.fire(id);

        sig.setSignalName('TP.sig.IOCompleted');
        sig.fire(id);
    }

    //  Make sure to complete this request if it hasn't already been completed.
    //  Normally, if request is an instance of the proper HTTP request type,
    //  this isn't necessary because HTTP type will have done this when it
    //  handles the IO* signal.
    if (!request.didComplete()) {
        request.complete();
    }

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
