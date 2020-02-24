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
Core types specific to web technology including types to support the HTTP
protocol, WebDAV, MIME types, XMLNS namespaces, TP.w3.DocType elements,
URIs of various schemes, Cookies, and more.

The TP.uri.URI type and its subtypes are a particularly important type in
TIBET. The TP.uri.TIBETURL type, whose scheme is 'tibet:', provides
extensions to the normal URI addressing schemes for http: and file: URIs so
that any object in the web, or more importantly within the local browser,
can have a URI.

XML standards like XInclude and XPointer are supported by TP.uri.URI to
help meet the goal of "universal addressibility" where every object,
including those within a visual DOM or a client-side XML data model, has an
address.

Also included in this file are the core support types/methods for content
handling of different text dialects such as CSS or JSON.
*/

//  ------------------------------------------------------------------------

//  ========================================================================
//  TP.w3.DocType
//  ========================================================================

/**
 * @type {TP.w3.DocType}
 * @summary A type that represents a Document Type in the TIBET system, as
 *     defined by the DOCTYPE information that it is holding.
 * @description This is TIBET's data structure for a Document Type Declaration,
 *     which would usually be found at the top of a document before any of the
 *     markup begins. These declarations indicate to the browser which DTD that
 *     the markup in this page in going to conform to. Older browsers typically
 *     did not use Document Type Declarations as they didn't support any other
 *     markup besides HTML, and thought it unnecessary to worry about which
 *     version of that they were rendering. Newer browsers support these
 *     declarations as part of their integrated support for XML. The DOM Level 1
 *     allows access to the declaration but not, unfortunately, to the 'public
 *     id' that is necessary to distinguish exactly which version of 'HTML' or
 *     'XHTML', for instance, that the browser is currently rendering. DOM Level
 *     2 (used by Navigator 6/Mozilla) allows this access.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('w3.DocType');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.w3.DocType.Type.defineAttribute('docTypeRegistry', TP.ac());

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.w3.DocType.Inst.defineAttribute('docTypeName');
TP.w3.DocType.Inst.defineAttribute('publicID');
TP.w3.DocType.Inst.defineAttribute('systemID');

TP.w3.DocType.Inst.defineAttribute('dtdInfo');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.w3.DocType.Type.defineMethod('docTypeForInfo',
function(docTypeInfo) {

    /**
     * @method docTypeForInfo
     * @summary Search for a matching document type object based on the
     *     document type information passed in.
     * @param {TP.core.Hash} docTypeInfo The document type information. The keys
     *     needed to match are 'docTypeName' and 'publicID'.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.meta.w3.DocType} A TP.w3.DocType subtype type object
     *     matching the info in docTypeInfo or null if one can't be found.
     */

    var foundItem;

    if (TP.notValid(docTypeInfo)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    foundItem = this.get('docTypeRegistry').detect(
                    function(item) {

                        //  NB: We don't compare the systemID to see if two
                        //  document type infos are equal.
                        if (item.get('docTypeName').equalTo(
                                        docTypeInfo.at('docTypeName')) &&
                            item.get('publicID').equalTo(
                                        docTypeInfo.at('publicID'))) {
                            return true;
                        }
                    });

    return foundItem;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.w3.DocType.Inst.defineAttribute('str');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.w3.DocType.Inst.defineMethod('init',
function(docTypeName, publicID, systemID) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {String} docTypeName The name of the document type.
     * @param {String} publicID The document type's public identifier.
     * @param {String} systemID The document type's system identifier.
     * @returns {TP.w3.DocType} The receiver.
     */

    this.callNextMethod();

    this.set('docTypeName', docTypeName);
    this.set('publicID', publicID);
    this.set('systemID', systemID);

    //  Add the newly constructed doc type instance to this type's registry.
    this.getType().get('docTypeRegistry').add(this);

    return this;
});

//  ------------------------------------------------------------------------

TP.w3.DocType.Inst.defineMethod('asDumpString',
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var publicID,
        systemID,

        repStr,
        str;

    if (TP.notValid(repStr = this.$get('str'))) {

        publicID = this.get('publicID');
        systemID = this.get('systemID');

        repStr = TP.join(
                    '<!DOCTYPE ',
                    this.get('docTypeName'),
                    TP.notEmpty(publicID) ? ' PUBLIC "' + publicID + '"' : '',
                    TP.notEmpty(systemID) ? ' "' + systemID + '"' : '',
                    '>');

        this.$set('str', repStr);
    }

    str = '[' + TP.tname(this) + ' :: ';
    str += '(' + repStr + ')' + ']';

    return str;
});

//  ------------------------------------------------------------------------

TP.w3.DocType.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    return '<span class="TP_w3_DocType ' +
            TP.escapeTypeName(TP.tname(this)) + '">' +
                '<span data-name="doctypename">' +
                    TP.htmlstr(this.get('docTypeName')) +
                '</span>' +
                '<span data-name="publicID">' +
                    TP.htmlstr(this.get('publicID')) +
                '</span>' +
                '<span data-name="systemID">' +
                    TP.htmlstr(this.get('systemID')) +
                '</span>' +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.w3.DocType.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var str;

    try {
        str = '{"type":' + TP.tname(this).quoted('"') + ',' +
                '"data":{' +
                    '"DOCTYPE":"' + this.get('docTypeName') + '",' +
                    '"PUBLIC":"' + this.get('publicID') + '",' +
                    '"SYSTEM":"' + this.get('systemID') + '"' +
                '}}';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.w3.DocType.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    return '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) + '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' +
                        this.getTypeName() +
                    '</dd>' +
                    '<dt class="pretty key">DOCTYPE:</dt>' +
                    '<dd class="pretty value">' +
                        this.get('docTypeName') +
                    '</dd>' +
                    '<dt class="pretty key">PUBLIC:</dt>' +
                    '<dd class="pretty value">' +
                        this.get('publicID') +
                    '</dd>' +
                    '<dt class="pretty key">SYSTEM:</dt>' +
                    '<dd class="pretty value">' +
                        this.get('systemID') +
                    '</dd>' +
                    '</dl>';
});

//  ------------------------------------------------------------------------

TP.w3.DocType.Inst.defineMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    return TP.join('TP.w3.DocType.construct(\'',
                    this.get('docTypeName'), '\',\'',
                    this.get('publicID'), '\',\'',
                    this.get('systemID'), '\')');
});

//  ------------------------------------------------------------------------

TP.w3.DocType.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @method asString
     * @summary Returns the receiver formatted in the standard Document Type
     *     Declaration format.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.w3.DocType's String representation. This flag is ignored in
     *     this version of this method.
     * @returns {String} The receiver in standard Document Type Declaration
     *     format.
     */

    var publicID,
        systemID,

        repStr;

    if (TP.notValid(repStr = this.$get('str'))) {

        publicID = this.get('publicID');
        systemID = this.get('systemID');

        repStr = TP.join(
                    '<!DOCTYPE ',
                    this.get('docTypeName'),
                    TP.notEmpty(publicID) ? ' PUBLIC "' + publicID + '"' : '',
                    TP.notEmpty(systemID) ? ' "' + systemID + '"' : '',
                    '>');

        this.$set('str', repStr);
    }

    return repStr;
});

//  ------------------------------------------------------------------------

TP.w3.DocType.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    return '<instance type="' + TP.tname(this) + '">' +
                        '<doctypename>' +
                            TP.xmlstr(this.get('docTypeName')) +
                        '</doctypename>' +
                        '<publicID>' +
                            TP.xmlstr(this.get('publicID')) +
                        '</publicID>' +
                        '<systemID>' +
                            TP.xmlstr(this.get('systemID')) +
                        '</systemID>' +
                    '</instance>';
});

//  ------------------------------------------------------------------------

(function() {

    //  "Canonical Instances"

    TP.w3.DocType.Type.defineConstant('XHTML_10_TRANSITIONAL',
        TP.w3.DocType.construct(
            'html',
            '-//W3C//DTD XHTML 1.0 Transitional//EN',
            'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'));

    TP.w3.DocType.Type.defineConstant('XHTML_10_STRICT',
        TP.w3.DocType.construct(
            'html',
            '-//W3C//DTD XHTML 1.0 Strict//EN',
            'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd'));

    TP.w3.DocType.Type.defineConstant('XHTML_10_FRAMESET',
        TP.w3.DocType.construct(
            'html',
            '-//W3C//DTD XHTML 1.0 Frameset//EN',
            'http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd'));

    TP.w3.DocType.Type.defineConstant('HTML_401_TRANSITIONAL',
        TP.w3.DocType.construct(
            'HTML',
            '-//W3C//DTD HTML 4.01 Transitional//EN',
            'http://www.w3.org/TR/html4/loose.dtd'));

    TP.w3.DocType.Type.defineConstant('HTML_401_STRICT',
        TP.w3.DocType.construct(
            'HTML',
            '-//W3C//DTD HTML 4.01 Strict//EN',
            'http://www.w3.org/TR/html4/strict.dtd'));

    TP.w3.DocType.Type.defineConstant('HTML_401_FRAMESET',
        TP.w3.DocType.construct(
            'HTML',
            '-//W3C//DTD HTML 4.01 Frameset//EN',
            'http://www.w3.org/TR/html4/frameset.dtd'));

    TP.w3.DocType.Type.defineConstant('HTML_32_FINAL',
        TP.w3.DocType.construct(
            'HTML',
            '-//W3C//DTD HTML 3.2 Final//EN',
            ''));   //  No system ID defined for HTML 3.2

    TP.w3.DocType.Type.defineConstant('SVG_10',
        TP.w3.DocType.construct(
            'svg',
            '-//W3C//DTD SVG 1.0//EN',
            'http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd'));

    TP.w3.DocType.Type.defineConstant('MATHML_20',
        TP.w3.DocType.construct(
            'math',
            '-//W3C//DTD MathML 2.0//EN',
            'http://www.w3.org/TR/MathML2/dtd/mathml2.dtd'));

    TP.w3.DocType.Type.defineConstant('XHTML_50',
        TP.w3.DocType.construct(
            'html',
            '',
            ''));

    return;
}());

//  ========================================================================
//  TP.core.HTTP
//  ========================================================================

/**
 * @type {TP.core.HTTP}
 * @summary Provides registration and lookup services for HTTP data.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.HTTP');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  lookup table of HTTP status codes and their meanings
TP.core.HTTP.Type.defineConstant('CODES',
                TP.hc(100, 'Continue',
                        101, 'Switching Protocols',

                        200, 'OK',
                        201, 'Created',
                        202, 'Accepted',
                        203, 'Non-Authoritative Information',
                        204, 'No Content',
                        205, 'Reset Content',
                        206, 'Partial Content',

                        300, 'Multiple Choices',
                        301, 'Moved Permanently',
                        302, 'Found',
                        303, 'See Other',
                        304, 'Not Modified',
                        305, 'Use Proxy',
                        306, 'Unused',
                        307, 'Temporary Redirect',

                        400, 'Bad Request',
                        401, 'Unauthorized',
                        402, 'Payment Required',
                        403, 'Forbidden',
                        404, 'Not Found',
                        405, 'Method Not Allowed',
                        406, 'Not Acceptable',
                        407, 'Proxy Authentication Required',
                        408, 'Request Timeout',
                        409, 'Conflict',
                        410, 'Gone',
                        411, 'Length Required',
                        412, 'Precondition Failed',
                        413, 'Request Entity Too Large',
                        414, 'Request URI Too Long',
                        415, 'Unsupported Media Type',
                        416, 'Requested Range Not Satisfiable',
                        417, 'Expectation Failed',

                        500, 'Internal Server Error',
                        501, 'Not Implemented',
                        502, 'Bad Gateway',
                        503, 'Service Unavailable',
                        504, 'Gateway Timeout',
                        505, 'Version Not Supported'));

//  ------------------------------------------------------------------------

(function() {

    //  using the prior hash construct constants for each string so code
    //  can use constructs like TP.core.HTTP.NOT_FOUND
    TP.core.HTTP.CODES.perform(
        function(item) {
            TP.core.HTTP.Type.defineConstant(
                    item.last().toUpperCase().replace(/ /g, '_'),
                    item.first());
        });

    return;
}());

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.HTTP.Type.defineMethod('getStatusText',
function(aStatusCode) {

    /**
     * @method getStatusText
     * @summary Returns the string representation of an HTTP status code.
     * @param {Number} aStatusCode A numerical HTTP status code.
     * @returns {String|undefined} The status text corresponding to the supplied
     *     numerical status code.
     */

    if (TP.notValid(aStatusCode)) {
        return;
    }

    return TP.ifInvalid(TP.core.HTTP.CODES.at(aStatusCode.asNumber()), '');
});

//  ========================================================================
//  TP.ietf.mime
//  ========================================================================

/**
 * @type {TP.ietf.mime}
 * @summary Provides registration and lookup services for MIME data.
 * @description The TP.ietf.mime type is largely a container for constants to
 *     make working with MIME strings easier. One feature of this type that is
 *     more interesting is the ability to register "content handlers" for
 *     different MIME types. The canonical example for this is the CSS MIME type
 *     (text/css), which has a specific content handler that knows how to parse
 *     CSS style sheets. This type also provides support for simple "sniffing"
 *     to try to narrow down the specific format of content data.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('ietf.mime');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.ietf.mime.Type.defineConstant('PLAIN', TP.PLAIN_TEXT_ENCODED);
TP.ietf.mime.Type.defineConstant('CSV', 'text/csv');

TP.ietf.mime.Type.defineConstant('ICAL', 'text/calendar');

TP.ietf.mime.Type.defineConstant('CSS', TP.CSS_TEXT_ENCODED);
TP.ietf.mime.Type.defineConstant('HTML', TP.HTML_TEXT_ENCODED);
TP.ietf.mime.Type.defineConstant('ECMASCRIPT', 'text/ecmascript');
TP.ietf.mime.Type.defineConstant('JS', TP.JS_TEXT_ENCODED);
TP.ietf.mime.Type.defineConstant('JSON', TP.JSON_ENCODED);
TP.ietf.mime.Type.defineConstant('JSX', TP.JSX_TEXT_ENCODED);
TP.ietf.mime.Type.defineConstant('XHTML', TP.XHTML_ENCODED);

TP.ietf.mime.Type.defineConstant('TSH', 'text/vnd.TPI.TSH');

TP.ietf.mime.Type.defineConstant('GIF', 'image/gif');
TP.ietf.mime.Type.defineConstant('JPEG', 'image/jpeg');
TP.ietf.mime.Type.defineConstant('PNG', 'image/png');

TP.ietf.mime.Type.defineConstant('FLASH', 'application/x-shockwave-flash');
TP.ietf.mime.Type.defineConstant('SILVERLIGHT', 'application/x-silverlight');
TP.ietf.mime.Type.defineConstant('SMIL', 'application/smil+xml');
TP.ietf.mime.Type.defineConstant('SVG', 'application/svg+xml');

TP.ietf.mime.Type.defineConstant('XSLT', 'application/xslt+xml');

TP.ietf.mime.Type.defineConstant('ATOM', 'application/atom+xml');
TP.ietf.mime.Type.defineConstant('RDF', 'application/rdf+xml');
TP.ietf.mime.Type.defineConstant('RSS', 'application/rss+xml');

TP.ietf.mime.Type.defineConstant('SOAP', TP.SOAP_ENCODED);
TP.ietf.mime.Type.defineConstant('XMLRPC', TP.XMLRPC_ENCODED);
TP.ietf.mime.Type.defineConstant('XML', TP.XML_ENCODED);

TP.ietf.mime.Type.defineConstant('VCARD', 'text/vcard');

TP.ietf.mime.Type.defineConstant('XMPP', 'application/xmpp+xml');

TP.ietf.mime.Type.defineConstant('TIBET_CSS', 'text/x-tibet-css');

TP.ietf.mime.Type.defineConstant('$KEYS', TP.ac('mimetype',
                                            'alias',
                                            'handler',
                                            'tpDocNodeType',
                                            'extensions'));

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  Define an 'info' hash that will contain the following information
//  about a particular MIME type:
//      'mimetype'      ->  A copy of the MIME type string (i.e. text/css)
//      'alias'         ->  The registered alias for the mime type.
//      'handler'       ->  Any registered content handler type.
//      'tpDocNodeType' ->  The registered node type to use for the mime
//                          type.
//      'extensions'    ->  One or more extensions for this MIME type in
//                          space-separated form ("htm html"). NOTE that not
//                          all MIME types have a unique extension, in
//                          particular the various XML dialects often do not
//                          have unique extensions.

TP.ietf.mime.Type.defineAttribute('info', TP.hc());

//  a placeholder for a reverse-lookup hash from extension to TP.ietf.mime
TP.ietf.mime.Type.defineAttribute('extensionInfo', TP.hc());

//  ------------------------------------------------------------------------

(function() {

    var info;

    info = TP.ietf.mime.get('info');

    info.addAll(
        TP.hc(
            TP.ietf.mime.PLAIN,
                TP.hc('mimetype', TP.ietf.mime.PLAIN,
                        'alias', 'PLAIN',
                        'extensions', 'txt',
                        'tshtag', 'html:span'),
            TP.ietf.mime.CSV,
                TP.hc('mimetype', TP.ietf.mime.CSV,
                        'alias', 'CSV',
                        'extensions', 'csv',
                        'tshtag', 'html:span'),
            TP.ietf.mime.ICAL,
                TP.hc('mimetype', TP.ietf.mime.ICAL,
                        'alias', 'ICAL',
                        'extensions', 'ics',
                        'tshtag', 'html:span'),

            TP.ietf.mime.CSS,
                TP.hc('mimetype', TP.ietf.mime.CSS,
                        'alias', 'CSS',
                        'extensions', 'css',
                        'handler', 'TP.core.CSSStyleSheetContent',
                        'tshtag', 'html:style'),
            TP.ietf.mime.HTML,
                TP.hc('mimetype', TP.ietf.mime.HTML,
                        'alias', 'HTML',
                        'extensions', 'html htm',
                        'tshtag', 'html:html'),
            TP.ietf.mime.ECMASCRIPT,
                TP.hc('mimetype', TP.ietf.mime.ECMASCRIPT,
                        'alias', 'ECMASCRIPT',
                        'handler', 'TP.uri.JSURI',
                        'extensions', 'js jscript',
                        'tshtag', 'tsh:script'),
            TP.ietf.mime.JS,
                TP.hc('mimetype', TP.ietf.mime.JS,
                        'alias', 'JS',
                        'extensions', 'js jscript',
                        'handler', 'TP.uri.JSURI',
                        'tshtag', 'tsh:script'),
            TP.ietf.mime.JSX,
                TP.hc('mimetype', TP.ietf.mime.JSX,
                        'alias', 'JSX',
                        'extensions', 'jsx',
                        'tshtag', 'html:span'),
            TP.ietf.mime.JSON,
                TP.hc('mimetype', TP.ietf.mime.JSON,
                        'alias', 'JSON',
                        'extensions', 'json',
                        'handler', 'TP.core.JSONContent',
                        'tshtag', 'tsh:script'),
            TP.ietf.mime.XHTML,
                TP.hc('mimetype', TP.ietf.mime.XHTML,
                        'alias', 'XHTML',
                        'extensions', 'xhtml xht',
                        'tshtag', 'html:html',
                        'objectNodeType',
                                'TP.html.iframe',
                        'tpDocNodeType', 'TP.dom.XHTMLDocumentNode'),
            TP.ietf.mime.TSH,
                TP.hc('mimetype', TP.ietf.mime.TSH,
                        'alias', 'TSH',
                        'extensions', 'tsh',
                        'handler', 'tsh:script',
                        'tshtag', 'tsh:script'),

            TP.ietf.mime.GIF,
                TP.hc('mimetype', TP.ietf.mime.GIF,
                        'alias', 'GIF',
                        'extensions', 'gif',
                        'handler', 'html:img',
                        'tshtag', 'html:img'),
            TP.ietf.mime.JPEG,
                TP.hc('mimetype', TP.ietf.mime.JPEG,
                        'alias', 'JPEG',
                        'extensions', 'jpg jpeg',
                        'handler', 'html:img',
                        'tshtag', 'html:img'),
            TP.ietf.mime.PNG,
                TP.hc('mimetype', TP.ietf.mime.PNG,
                        'alias', 'PNG',
                        'extensions', 'png',
                        'handler', 'html:img',
                        'tshtag', 'html:img'),
            TP.ietf.mime.FLASH,
                TP.hc('mimetype', TP.ietf.mime.FLASH,
                        'alias', 'FLASH',
                        'extensions', 'swf fla',
                        'objectNodeType',
                                'TP.dom.FlashObjectElementNode',
                        'embedNodeType',
                                'TP.dom.FlashEmbedElementNode',
                        'tshtag', 'html:object'),
            TP.ietf.mime.SILVERLIGHT,
                TP.hc('mimetype', TP.ietf.mime.SILVERLIGHT,
                        'alias', 'SILVERLIGHT',
                        'extensions', 'xaml',
                        'objectNodeType',
                                'TP.dom.SilverlightObjectElementNode',
                        'embedNodeType',
                                'TP.dom.SilverlightEmbedElementNode',
                        'tshtag', 'html:object'),
            TP.ietf.mime.SMIL,
                TP.hc('mimetype', TP.ietf.mime.SMIL,
                        'alias', 'SMIL',
                        'extensions', 'smil'),
            TP.ietf.mime.SVG,
                TP.hc('mimetype', TP.ietf.mime.SVG,
                        'alias', 'SVG',
                        'extensions', 'svg'),

            TP.ietf.mime.XSLT,
                TP.hc('mimetype', TP.ietf.mime.XSLT,
                        'alias', 'XSLT',
                        'extensions', 'xsl xslt',
                        'tpDocNodeType', 'TP.dom.XSLDocumentNode'),

            TP.ietf.mime.ATOM,
                TP.hc('mimetype', TP.ietf.mime.ATOM,
                        'alias', 'ATOM',
                        'extensions', 'atom xml'),
            TP.ietf.mime.RDF,
                TP.hc('mimetype', TP.ietf.mime.RDF,
                        'alias', 'RDF',
                        'extensions', 'rdf'),
            TP.ietf.mime.RSS,
                TP.hc('mimetype', TP.ietf.mime.RSS,
                        'alias', 'RSS',
                        'extensions', 'rss xml',
                        'handler', 'TPRSSContent',
                        'tpDocNodeType', 'TP.rss.RSSFeed'),

            TP.ietf.mime.SOAP,
                TP.hc('mimetype', TP.ietf.mime.SOAP,
                        'alias', 'SOAP'),
            TP.ietf.mime.XMLRPC,
                TP.hc('mimetype', TP.ietf.mime.XMLRPC,
                        'alias', 'XMLRPC'),
            TP.ietf.mime.XML,
                TP.hc('mimetype', TP.ietf.mime.XML,
                        'alias', 'XML',
                        'extensions', 'xml',
                        'tpDocNodeType', 'TP.dom.XMLDocumentNode'),

            TP.ietf.mime.XMPP,
                TP.hc('mimetype', TP.ietf.mime.XMPP,
                        'alias', 'XMPP')
        ));

    //  populate the initial extensions values from the 'info' hash
    TP.ietf.mime.get('info').getValues().perform(
        function(item) {

            var mime,
                exts,
                i;

            mime = item.at('mimetype');
            exts = item.at('extensions');

            if (TP.notEmpty(exts)) {
                exts = exts.split(' ');
                for (i = 0; i < exts.getSize(); i++) {
                    TP.ietf.mime.get('extensionInfo').atPut(exts.at(i), mime);
                }
            }
        });

    return;
}());

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.ietf.mime.Type.defineMethod('getAlias',
function(aMIMEType) {

    /**
     * @method getAlias
     * @summary Returns an easier-to-use 'alias' for the given MIME type. For
     *     instance, if the MIME type is 'application/xhtml+xml' this method
     *     will return the string 'XHTML'.
     * @param {String} aMIMEType The MIME type to return an alias for.
     * @returns {String} An alias for the supplied MIME type or the MIME type
     *     itself if no alias could be found.
     */

    var info;

    //  grab the hash and if we find one return the type/typename
    if (TP.isValid(info = TP.ietf.mime.get('info').at(aMIMEType))) {
        return TP.ifInvalid(info.at('alias'), aMIMEType);
    }

    return aMIMEType;
});

//  ------------------------------------------------------------------------

TP.ietf.mime.Type.defineMethod('getConcreteType',
function(aMIMEType) {

    /**
     * @method getConcreteType
     * @summary Looks up a TIBET Type for the MIME type provided. This type is
     *     used to handle content in an intelligent fashion.
     * @description This method will return any MIME-specific content handler
     *     type which may be registered. The common example in TIBET is the
     *     handler for TP.ietf.mime.CSS which can parse a CSS style sheet,
     *     making CSS content "smarter" than pure text.
     *
     *     By registering MIME types and handlers for specific text formats you
     *     can create intelligent content handlers for your internal document
     *     formats. For this to work properly TIBET has to properly discern the
     *     MIME type for the content. See getMIMEType() for more information.
     * @param {String} aMIMEType The MIME type to return a wrapper type for.
     * @returns {TP.meta.ietf.mime|undefined} A TP.ietf.mime subtype type object.
     */

    var info,
        typeName,
        type;

    //  grab the hash and if we find one return the type/typename
    if (TP.isValid(info = TP.ietf.mime.get('info').at(aMIMEType))) {
        typeName = info.at('handler');

        //  dynaload handler types as needed
        if (TP.notEmpty(typeName)) {
            type = TP.sys.getTypeByName(typeName);
            if (TP.isType(type) && !type.isAbstract()) {
                return type;
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.ietf.mime.Type.defineMethod('getExtensions',
function(aMIMEType) {

    /**
     * @method getExtensions
     * @summary Returns an array of file extensions for the given MIME type.
     *     For instance, if the MIME type is 'application/xhtml+xml' this method
     *     will return ['xht', 'xhtml'].
     * @param {String} aMIMEType The MIME type to look up.
     * @returns {String[]|undefined} An array of strings denoting extensions.
     */

    var info,
        exts;

    //  grab the hash and if we find one return the type/typename
    if (TP.isValid(info = TP.ietf.mime.get('info').at(aMIMEType))) {
        if (TP.notEmpty(exts = info.at('extensions'))) {
            return exts.split(' ');
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.ietf.mime.Type.defineMethod('getExtensionType',
function(anExtension) {

    /**
     * @method getExtensionType
     * @summary Returns the MIME type of the extension provided -- almost
     *     guaranteed to be wrong at least some of the time. When in doubt this
     *     routine defaults to returning text/plain.
     * @param {String} anExtension The extension to try to match a MIME type to.
     * @returns {String} The TP.ietf.mime type constant for the extension, if
     *     found.
     */

    return TP.ifInvalid(
            TP.ietf.mime.get('extensionInfo').at(anExtension.toLowerCase()),
            TP.ietf.mime.PLAIN);
});

//  ------------------------------------------------------------------------

TP.ietf.mime.Type.defineMethod('guessMIMEType',
function(aContent, aURI, defaultMIME) {

    /**
     * @method guessMIMEType
     * @summary Guesses the MIME type of the incoming content data, using a
     *     multi-pronged approach that hopefully provides an accurate answer
     *     based on content testing followed by extension tests.
     * @description This method tries to guess the MIME type of the receiver.
     *     The testing starts with testing for XML and moves on to testing text
     *     content and URI extension information using the TP.ietf.mime 'info'
     *     hash to help with resolution. The specific steps used are: 1. If XML,
     *     try to obtain the namespace of the content node's document's
     *     documentElement, then try to match that to a mime value contained in
     *     the XMLNS 'info' hash. 2. If step #1 fails, try to obtain the
     *     document element name of the content node's document's
     *     documentElement, then try to match that to a 'rootElement' value
     *     contained in the XMLNS 'info' hash. 3. If step #2 fails, and a URI
     *     was provided with the call, try to obtain a MIME type using the
     *     extension from the URI. 4. If step #3 fails and it was XML we default
     *     to TP.ietf.mime.XML, otherwise we default to TP.ietf.mime.PLAIN
     * @param {Node|String} aContent The content, either as a Node or String. If
     *     a Node, then an attempt will be made to use this object to determine
     *     a MIME type. If a String, then this parameter is tested to see if a
     *     Node can be created from it. If so, then Node testing will proceed as
     *     described. If not, then TP.ietf.mime.PLAIN will be returned. This
     *     parameter is optional.
     * @param {TP.uri.URI} aURI The URI that will be used to try to determine
     *     the MIME type, based on its extension. This parameter is optional.
     * @param {String} defaultMIME The MIME type that will be used if one cannot
     *     be determined from either the content or the URI. This parameter is
     *     optional.
     * @returns {String} The MIME type as determined from one of the three
     *     parameters.
     */

    var content,

        node,

        elem,
        ns,
        info,
        mime,
        name,
        item,
        ext;

    TP.ifTrace() && TP.$DEBUG ?
        TP.sys.logTransform(
                TP.annotate(this,
                            'Guessing MIME type for content ID: ' + aURI),
            TP.DEBUG) : 0;

    if (TP.isValid(content = aContent)) {
        //  often get a TP.dom.Node here
        if (TP.canInvoke(content, 'getNativeNode')) {
            node = content.getNativeNode();
        } else if (TP.isNode(content)) {
            node = content;
        } else {
            //  Otherwise, try to turn it into a node (note here we pass 'false'
            //  to avoid reporting errors)
            node = TP.node(content, null, false);
        }
    } else {
        content = '';
    }

    //  If we have valid node content (that's not just a Text node created
    //  above), then we contain some sort of real XML
    if (TP.isNode(node) && !TP.isTextNode(node)) {

        //  Try to get the 'most representative' node from the content.
        elem = TP.nodeGetBestNode(node);

        //  Make sure that this is both an Element *and it doesn't have a
        //  prefix*. This ensures that no prefixed element will be used to
        //  derive MIME type, since it's sort of 'out of band' of the default
        //  content.
        if (TP.isElement(elem) && TP.isEmpty(elem.prefix)) {

            //  If the element has a valid namespace, then use that to try to
            //  look up a 'mimetype' entry in the XMLNS 'info'
            ns = TP.nodeGetNSURI(elem);
            if (TP.notEmpty(ns) &&
                TP.isValid(info = TP.w3.Xmlns.get('info').at(ns))) {
                mime = info.at('mimetype');
            }

            //  If it's not just 'bland' XML, then we go ahead return the
            //  computed MIME type here - otherwise, we go on trying.
            if (TP.notEmpty(mime) && mime !== TP.XML_ENCODED) {
                TP.ifTrace() && TP.$DEBUG ?
                    TP.sys.logTransform('Returning computed MIME type ' +
                                        mime + ' for content ID: ' + aURI,
                        TP.DEBUG) : 0;

                return mime;
            }

            //  for name we want to use local name, no prefix
            name = TP.elementGetLocalName(elem);

            //  Try to look up a 'rootElement' entry in the TP.w3.Xmlns
            //  'info'
            item = TP.w3.Xmlns.get('info').detect(
                function(kvPair) {

                    if (kvPair.last().at('rootElement') === name) {
                        return true;
                    }
                });

            if (TP.isValid(item)) {
                mime = item.last().at('mimetype');
            }

            //  If it's not just 'bland' XML, then we go ahead return the
            //  computed MIME type here - otherwise, we go on trying.
            if (TP.notEmpty(mime) && mime !== TP.XML_ENCODED) {
                TP.ifTrace() && TP.$DEBUG ?
                    TP.sys.logTransform('Returning computed MIME type ' +
                                        mime + ' for content ID: ' + aURI,
                        TP.DEBUG) : 0;

                return mime;
            }
        }

        //  we know it's XML, so we at least want to fall back to that
        //  but we apparently need help determining what kind of XML

        //  if a URI was supplied, see if we can extract the MIME type from
        //  the URI's extension.
        if (TP.isURI(aURI) &&
            TP.isString(ext = TP.uriExtension(aURI.asString()))) {
            mime = TP.ietf.mime.getExtensionType(ext);
        }

        if (TP.isEmpty(mime) || mime === TP.ietf.mime.PLAIN) {
            if (/xml/.test(defaultMIME)) {
                mime = defaultMIME;
            } else {
                mime = TP.ietf.mime.XML;
            }
        }
    } else {
        //  not a node, so some form of text content

        //  If we didn't find a valid MIME type via the URI's extension but
        //  we determine from the content that it's a JSON string, then set
        //  it to TP.ietf.mime.JSON
        if (TP.isJSONString(content)) {
            mime = TP.ietf.mime.JSON;
        }

        //  if a URI was supplied, see if we can extract the MIME type from
        //  the URI's extension.
        if (TP.isEmpty(mime) && TP.isURI(aURI) &&
            TP.isString(ext = TP.uriExtension(aURI.asString()))) {
            mime = TP.ietf.mime.getExtensionType(ext);
        }

        //  If we still haven't found a valid MIME type, then just set it to
        //  either the supplied 'defaultMIME' or TP.ietf.mime.PLAIN if that's
        //  not been supplied.
        if (TP.isEmpty(mime) || mime === TP.ietf.mime.PLAIN) {
            mime = defaultMIME || TP.ietf.mime.PLAIN;
        }
    }

    TP.ifTrace() && TP.$DEBUG ?
        TP.sys.logTransform('Returning computed MIME type ' +
                            mime + ' for content ID: ' + aURI,
            TP.DEBUG) : 0;

    return mime;
});

//  ------------------------------------------------------------------------

TP.ietf.mime.Type.defineMethod('registerMIMEInfo',
function(aMIMEType, aHash) {

    /**
     * @method registerMIMEInfo
     * @summary Registers information about the MIME type provided. If an info
     *     hash already exists the new hash's keys are merged with the existing
     *     registration, replacing any existing values for the new keys, but
     *     preserving other values not defined in the incoming hash.
     * @param {String} aMIMEType A TP.ietf.mime type constant such as
     *     TP.ietf.mime.CSS or the equivalent MIME type string (text/css).
     * @param {TP.core.Hash} aHash A hash whose keys match those defined for
     *     this type.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.meta.ietf.mime} The receiver.
     */

    var info,
        exts,
        i;

    if (TP.notValid(aHash)) {
        return this.raise('TP.sig.InvalidParameter',
                                    'Must provide registration data.');
    }

    info = TP.ietf.mime.get('info').at(aMIMEType);
    if (TP.notValid(info)) {
        info = aHash;
        TP.ietf.mime.get('info').atPut(aMIMEType, info);
    } else {
        //  merge in the keys we need
        TP.ietf.mime.$KEYS.perform(
                function(key) {

                    var val;

                    if (TP.isValid(val = aHash.at(key))) {
                        info.atPut(key, val);
                    }
                });
    }

    //  make sure the MIME type name is also in the hash
    info.atPut('mimetype', aMIMEType);

    //  update the extension list so we can do reverse lookups
    if (TP.notEmpty(exts = info.at('extensions'))) {
        exts = exts.split(' ');
        for (i = 0; i < exts.getSize(); i++) {
            TP.ietf.mime.get('extensionInfo').atPut(exts.at(i), aMIMEType);
        }
    }

    return this;
});

//  ========================================================================
//  TP.w3.Xmlns
//  ========================================================================

/**
 * @type {TP.w3.Xmlns}
 * @summary The TP.w3.Xmlns type provides registration and lookup services for
 *     information about common XML namespaces.
 * @description A large number of TIBET features rely on namespace support,
 *     which requires information regarding common prefixes, MIME types,
 *     document element names, etc. which are all managed by the TP.w3.Xmlns
 *     type.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('w3.Xmlns');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  NB: These constants are defined as an alias to the actual namespace URI
//  of the namespace being registered.

TP.w3.Xmlns.Type.defineConstant(
        'ACL',
        'http://www.technicalpursuit.com/2005/acl');

TP.w3.Xmlns.Type.defineConstant(
        'ACP',
        'http://www.technicalpursuit.com/1999/acp');

TP.w3.Xmlns.Type.defineConstant(
        'BIND',
        'http://www.technicalpursuit.com/2005/binding');

TP.w3.Xmlns.Type.defineConstant(
        'CSSML',
        'http://www.technicalpursuit.com/2008/cssml');

TP.w3.Xmlns.Type.defineConstant(
        'DRAG',
        'http://www.technicalpursuit.com/2005/drag');

TP.w3.Xmlns.Type.defineConstant(
        'DND',
        'http://www.technicalpursuit.com/2005/drag-and-drop');

TP.w3.Xmlns.Type.defineConstant(
        'HTTP',
        'http://www.technicalpursuit.com/2020/http');

TP.w3.Xmlns.Type.defineConstant(
        'ON',
        'http://www.technicalpursuit.com/2014/on');

TP.w3.Xmlns.Type.defineConstant(
        'PCLASS',
        'urn:tibet:pseudoclass');

TP.w3.Xmlns.Type.defineConstant(
        'SIGNALS',
        'http://www.technicalpursuit.com/1999/signals');

TP.w3.Xmlns.Type.defineConstant(
        'SHERPA',
        'http://www.technicalpursuit.com/2014/sherpa');

TP.w3.Xmlns.Type.defineConstant(
        'TIBET',
        'http://www.technicalpursuit.com/1999/tibet');

TP.w3.Xmlns.Type.defineConstant(
        'TSH',
        'http://www.technicalpursuit.com/1999/tshell');

TP.w3.Xmlns.Type.defineConstant(
        'UI',
        'http://www.technicalpursuit.com/2015/ui');

TP.w3.Xmlns.Type.defineConstant(
        'XCONTROLS',
        'http://www.technicalpursuit.com/2005/xcontrols');

//  ---

TP.w3.Xmlns.Type.defineConstant(
        'BPEL',
         'http://schemas.xmlsoap.org/ws/2004/03/business-process/');

TP.w3.Xmlns.Type.defineConstant(
        'KML',
        'http://www.opengis.net/kml/2.2');

TP.w3.Xmlns.Type.defineConstant(
        'MATHML',
        'http://www.w3.org/1998/Math/MathML');

TP.w3.Xmlns.Type.defineConstant(
        'RDF',
        'http://www.w3.org/1999/02/22-rdf-syntax-ns#');

TP.w3.Xmlns.Type.defineConstant(
        'RSS20',
        'http://backend.userland.com/rss2');

TP.w3.Xmlns.Type.defineConstant(
        'SMIL',
        'http://www.w3.org/2005/SMIL21/');

TP.w3.Xmlns.Type.defineConstant(
        'SVG',
        'http://www.w3.org/2000/svg');

TP.w3.Xmlns.Type.defineConstant(
        'TMX',
        'http://www.lisa.org/tmx14');

TP.w3.Xmlns.Type.defineConstant(
        'VML',
        'urn:schemas-microsoft-com:vml');

TP.w3.Xmlns.Type.defineConstant(
        'VCARD',
        'urn:ietf:params:xml:ns:vcard-4.0');

TP.w3.Xmlns.Type.defineConstant(
        'VCARD_EXT',
        'http://www.technicalpursuit.com/vcard-ext');

TP.w3.Xmlns.Type.defineConstant(
        'WSDL',
        'http://schemas.xmlsoap.org/wsdl');

TP.w3.Xmlns.Type.defineConstant(
        'XFORMS',
        'http://www.w3.org/2002/xforms');

TP.w3.Xmlns.Type.defineConstant(
        'XHTML',
        'http://www.w3.org/1999/xhtml');

TP.w3.Xmlns.Type.defineConstant(
        'XINCLUDE',
        'http://www.w3.org/2001/XInclude');

TP.w3.Xmlns.Type.defineConstant(
        'XLINK',
        'http://www.w3.org/1999/xlink');

TP.w3.Xmlns.Type.defineConstant(
        'XLINKBASE',
        'http://www.w3.org/1999/xlink/properties/linkbase');

TP.w3.Xmlns.Type.defineConstant(
        'XML',
        'http://www.w3.org/XML/1998/namespace');

TP.w3.Xmlns.Type.defineConstant(
        'XMLNS',
        'http://www.w3.org/2000/xmlns/');   //  NOTE the trailing slash is
                                            //  required on this URI

TP.w3.Xmlns.Type.defineConstant(
        'XML_CATALOG',
        'urn:oasis:names:tc:entity:xmlns:xml:catalog');

TP.w3.Xmlns.Type.defineConstant(
        'XML_EVENTS',
        'http://www.w3.org/2001/xml-events');

TP.w3.Xmlns.Type.defineConstant(
        'XML_SCHEMA',
        'http://www.w3.org/2001/XMLSchema');

TP.w3.Xmlns.Type.defineConstant(
        'XML_SCHEMA_INSTANCE',
        'http://www.w3.org/2001/XMLSchema-instance');

TP.w3.Xmlns.Type.defineConstant(
        'XSLT',
        'http://www.w3.org/1999/XSL/Transform');

TP.w3.Xmlns.Type.defineConstant(
        'XUL',
        'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul');

//  ---

TP.w3.Xmlns.Type.defineConstant('$KEYS', TP.ac('uri',
                                                'mimetype',
                                                'handler',
                                                'prefix',
                                                'rootElement',
                                                'defaultNodeType',
                                                'transforms',
                                                'native'));

//  ---

//  a sort function that will sort namespaces according to their 'processing
//  priority'. Namespaces that don't have a processing priority will
//  'bubble' to the front of the Array.
TP.w3.Xmlns.Type.defineConstant(
        'PROCESS_ORDER_SORT',
        function(a, b) {

            var aWeight,
                bWeight;

            if (TP.notValid(aWeight = TP.w3.Xmlns.get('info').at(a)) ||
                TP.notValid(aWeight = aWeight.at('procPriority'))) {
                return -1;
            }

            if (TP.notValid(bWeight = TP.w3.Xmlns.get('info').at(b)) ||
                TP.notValid(bWeight = bWeight.at('procPriority'))) {
                return 1;
            }

            return bWeight - aWeight;
        });

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  custom tag and ns detection XPaths used to avoid element-level DOM
//  iterations during content processing
TP.w3.Xmlns.Type.defineAttribute('customNSDetectionXPath');
TP.w3.Xmlns.Type.defineAttribute('customTagDetectionXPath');

TP.w3.Xmlns.Type.defineAttribute('nativePrefixes');
TP.w3.Xmlns.Type.defineAttribute('nativeURIs');
TP.w3.Xmlns.Type.defineAttribute('nonNativePrefixes');
TP.w3.Xmlns.Type.defineAttribute('nonNativeURIs');

//  A String containing all known TP.w3.Xmlns definitions for use in
//  markup. See 'getXMLNSDefs()' below for more information.
TP.w3.Xmlns.Type.defineAttribute('XMLNSDefs');

//  a placeholder for a reverse-lookup hash from prefix to URI
TP.w3.Xmlns.Type.defineAttribute('prefixes', TP.hc());

TP.w3.Xmlns.Type.defineAttribute('info', TP.hc());

//  A list of commonly-used namespaces that get installed on new documents, etc.
TP.w3.Xmlns.Type.defineAttribute('commonNamespaces');

//  A list of implicit XHTML namespace URIs
TP.w3.Xmlns.Type.defineAttribute('$xhtmlURIs');

//  ------------------------------------------------------------------------

(function() {

    //  Define an 'info' hash that will contain the following information
    //  about a particular namespace:
    //      'uri'               ->  A copy of the namespace URI for easier
    //                              lookups.
    //      'mimetype'          ->  Any particular MIME type that
    //                              corresponds to the namespace.
    //      'handler'           ->  The namespace type (or type name) for
    //                              this namespace, usually the type whose
    //                              name is prefix:' for this type's
    //                              canonical prefix.
    //      'prefix'            ->  The commonly used namespace prefix used
    //                              with the namespace.
    //      'rootElement'       ->  Any 'root' (document) element defined
    //                              for the namespace.
    //      'defaultNodeType'   ->  An optional type used to replace
    //                              TP.dom.ElementNode as the default type
    //                              for elements this namespace.
    //      'transforms'        ->  An optional array of XSLT uris for
    //                              transforms that should be run when
    //                              processing content with this namespace
    //                              in it.
    //      'native'            ->  An optional marker for whether the
    //                              namespace is natively supported on the
    //                              current browser. NOTE: this is filled in
    //                              by the TP.core.Browser types.
    //      'procPriority'      ->  An optional number for in what order the
    //                              TIBET markup processing system should
    //                              process this namespace. Higher numbers
    //                              cause the namespace to be processed
    //                              earlier. NB: No two namespaces should
    //                              have the same number.

    var info;

    info = TP.w3.Xmlns.get('info');

    info.addAll(
        TP.hc(
            TP.w3.Xmlns.ACL,
                    TP.hc('uri', TP.w3.Xmlns.ACL,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'acl',
                            'rootElement', ''),
            TP.w3.Xmlns.ACP,
                    TP.hc('uri', TP.w3.Xmlns.ACP,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'acp',
                            'rootElement', ''),
            TP.w3.Xmlns.BIND,
                    TP.hc('uri', TP.w3.Xmlns.BIND,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'bind',
                            'rootElement', '',
                            'defaultNodeType', 'bind:info',
                            'procPriority', 2),
/*
            TP.w3.Xmlns.BPEL,
                    TP.hc('uri', TP.w3.Xmlns.BPEL,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'bpel',
                            'rootElement', 'process'),
*/
            TP.w3.Xmlns.CSSML,
                    TP.hc('uri', TP.w3.Xmlns.CSSML,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'css',
                            'rootElement', 'sheet'),
            TP.w3.Xmlns.DRAG,
                    TP.hc('uri', TP.w3.Xmlns.DRAG,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'drag',
                            'rootElement', '',
                            'defaultNodeType', 'drag:info'),
            TP.w3.Xmlns.DND,
                    TP.hc('uri', TP.w3.Xmlns.DND,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'dnd',
                            'rootElement', '',
                            'defaultNodeType', 'dnd:info'),
            TP.w3.Xmlns.HTTP,
                    TP.hc('uri', TP.w3.Xmlns.HTTP,
                            'prefix', 'http'),
            TP.w3.Xmlns.KML,
                    TP.hc('uri', TP.w3.Xmlns.KML,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'kml',
                            'rootElement', 'kml'),
            TP.w3.Xmlns.MATHML,
                    TP.hc('uri', TP.w3.Xmlns.MATHML,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'mml',
                            'rootElement', 'math'),
            TP.w3.Xmlns.ON,
                    TP.hc('uri', TP.w3.Xmlns.ON,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'on'),
            TP.w3.Xmlns.PCLASS,
                    TP.hc('uri', TP.w3.Xmlns.PCLASS,
                            'prefix', 'pclass',
                            'rootElement', ''),
            TP.w3.Xmlns.RDF,
                    TP.hc('uri', TP.w3.Xmlns.RDF,
                            'mimetype', TP.ietf.mime.RDF,
                            'prefix', 'rdf',
                            'rootElement', 'rdf'),
            TP.w3.Xmlns.RSS20,
                    TP.hc('uri', TP.w3.Xmlns.RSS20,
                            'mimetype', TP.ietf.mime.RSS,
                            'prefix', 'rss',
                            'rootElement', 'rss',
                            'defaultNodeType', 'TP.rss.RSSElement'),
            TP.w3.Xmlns.SHERPA,
                    TP.hc('uri', TP.w3.Xmlns.SHERPA,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'sherpa',
                            'rootElement', ''),
            TP.w3.Xmlns.SIGNALS,
                    TP.hc('uri', TP.w3.Xmlns.SIGNALS,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'sig'),
/*
            TP.w3.Xmlns.SMIL,
                    TP.hc('uri', TP.w3.Xmlns.SMIL,
                            'mimetype', TP.ietf.mime.SMIL,
                            'prefix', 'smil',
                            'rootElement', 'smil'),
*/
            TP.w3.Xmlns.SVG,
                    TP.hc('uri', TP.w3.Xmlns.SVG,
                            'mimetype', TP.ietf.mime.SVG,
                            'prefix', 'svg',
                            'rootElement', 'svg'),
            TP.w3.Xmlns.TIBET,
                    TP.hc('uri', TP.w3.Xmlns.TIBET,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'tibet',
                            'rootElement', ''),
            TP.w3.Xmlns.TMX,
                    TP.hc('uri', TP.w3.Xmlns.TMX,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'tmx',
                            'rootElement', 'tmx'),
            TP.w3.Xmlns.TSH,
                    TP.hc('uri', TP.w3.Xmlns.TSH,
                            'mimetype', TP.ietf.mime.TSH,
                            'prefix', 'tsh',
                            'rootElement', 'script'),
            TP.w3.Xmlns.UI,
                    TP.hc('uri', TP.w3.Xmlns.UI,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'ui',
                            'rootElement', ''),
            TP.w3.Xmlns.VCARD,
                    TP.hc('uri', TP.w3.Xmlns.VCARD,
                            'mimetype', TP.ietf.mime.VCARD,
                            'prefix', 'vcard',
                            'rootElement', 'vcard'),
            TP.w3.Xmlns.VCARD_EXT,
                    TP.hc('uri', TP.w3.Xmlns.VCARD_EXT,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'vcard-ext'),
            TP.w3.Xmlns.XCONTROLS,
                    TP.hc('uri', TP.w3.Xmlns.XCONTROLS,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'xctrls',
                            'rootElement', '',
                            'procPriority', 3,
                            'defaultNodeType', 'TP.xctrls.GenericElement'),
            TP.w3.Xmlns.XFORMS,
                    TP.hc('uri', TP.w3.Xmlns.XFORMS,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'xforms',
                            'rootElement', '',
                            'procPriority', 4),
            TP.w3.Xmlns.XHTML,
                    TP.hc('uri', TP.w3.Xmlns.XHTML,
                            'mimetype', TP.ietf.mime.XHTML,
                            'prefix', 'html',
                            'rootElement', 'html',
                            'procPriority', 0),
            TP.w3.Xmlns.XINCLUDE,
                    TP.hc('uri', TP.w3.Xmlns.XINCLUDE,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'xi',
                            'rootElement', ''),
            TP.w3.Xmlns.XLINK,
                    TP.hc('uri', TP.w3.Xmlns.XLINK,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'xlink',
                            'rootElement', ''),
            TP.w3.Xmlns.XML,
                    TP.hc('uri', TP.w3.Xmlns.XML,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'xml',
                            'rootElement', ''),
            TP.w3.Xmlns.XML_CATALOG,
                    TP.hc('uri', TP.w3.Xmlns.XML_CATALOG,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'cat',
                            'rootElement', 'cat:catalog'),
            TP.w3.Xmlns.XML_EVENTS,
                    TP.hc('uri', TP.w3.Xmlns.XML_EVENTS,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'ev',
                            'rootElement', '',
                            'procPriority', 1),
            TP.w3.Xmlns.XMLNS,
                    TP.hc('uri', TP.w3.Xmlns.XMLNS,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'xmlns',
                            'rootElement', ''),
            TP.w3.Xmlns.XML_SCHEMA,
                    TP.hc('uri', TP.w3.Xmlns.XML_SCHEMA,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'xs',
                            'rootElement', 'schema'),
            TP.w3.Xmlns.XML_SCHEMA_INSTANCE,
                    TP.hc('uri', TP.w3.Xmlns.XML_SCHEMA_INSTANCE,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'xsi',
                            'rootElement', ''),
            TP.w3.Xmlns.XSLT,
                    TP.hc('uri', TP.w3.Xmlns.XSLT,
                            'mimetype', TP.ietf.mime.XSLT,
                            'prefix', 'xsl',
                            'rootElement', 'stylesheet'),
            TP.w3.Xmlns.XUL,
                    TP.hc('uri', TP.w3.Xmlns.XUL,
                            'mimetype', TP.ietf.mime.XUL,
                            'prefix', 'xul',
                            'rootElement', ''),
            TP.w3.Xmlns.VML,
                    TP.hc('uri', TP.w3.Xmlns.VML,
                            'mimetype', '',
                            'prefix', 'v',
                            'rootElement', ''),
            TP.w3.Xmlns.WSDL,
                    TP.hc('uri', TP.w3.Xmlns.WSDL,
                            'mimetype', TP.ietf.mime.XML,
                            'prefix', 'wsdl',
                            'rootElement', '')
        ));

    //  populate reference values from the 'info' hash
    TP.w3.Xmlns.get('info').getValues().perform(
        function(item) {
            TP.w3.Xmlns.get('prefixes').atPut(
                                item.at('prefix'),
                                item.at('uri'));
        });

    TP.w3.Xmlns.set('commonNamespaces',
                TP.ac(
                    TP.w3.Xmlns.ACL,
                    TP.w3.Xmlns.BIND,
                    TP.w3.Xmlns.ON,
                    TP.w3.Xmlns.PCLASS,
                    TP.w3.Xmlns.TIBET,
                    TP.w3.Xmlns.TSH,
                    TP.w3.Xmlns.XHTML
                    )
                );

    return;
}());

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('addCommonNSURIsTo',
function(anElement) {

    /**
     * @method addCommonNSURIsTo
     * @summary Adds commonly used namespaces (the list is defined on this
     *     type) to the element.
     * @param {Element} anElement The element to install the namespaces on.
     * @exception TP.sig.InvalidElement
     * @returns {TP.meta.w3.Xmlns} The receiver.
     */

    var namespaces,
        i;

    if (TP.notValid(anElement)) {
        return this.raise('TP.sig.InvalidElement');
    }

    namespaces = this.get('commonNamespaces');

    for (i = 0; i < namespaces.getSize(); i++) {
        this.addNSURITo(namespaces.at(i), anElement);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('addNSURITo',
function(anNSURI, anElement) {

    /**
     * @method addNSURITo
     * @summary Adds the namespace supplied in anNSURI to the element.
     * @description One of the constants available on the TP.w3.Xmlns type must
     *     be used as the URI as this method will try to determine the canonical
     *     prefix to install the namespace under. Otherwise, if a canonical
     *     prefix cannot be found this method will fail. See the lower-level
     *     TP.elementAddNSURI() function to install namespaces (including
     *     default namespaces) that are unknown to the TP.w3.Xmlns type.
     * @param {String} anNSURI A namespace URI, often acquired from a native
     *     node via TP.nodeGetNSURI().
     * @param {Element} anElement The element to install the namespace on.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidURI
     * @returns {TP.meta.w3.Xmlns} The receiver.
     */

    var prefix;

    if (TP.notValid(anElement)) {
        return this.raise('TP.sig.InvalidElement');
    }

    if (TP.notValid(anNSURI)) {
        return this.raise('TP.sig.InvalidURI');
    }

    if (TP.notValid(prefix = this.getCanonicalPrefix(anNSURI))) {
        return this;
    }

    TP.elementAddNSURI(anElement, prefix, anNSURI);

    return this;
});

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('addTransform',
function(anNSURI, aTransformURI) {

    /**
     * @method addTransform
     * @summary Adds an XSLT tranformation for the namespace which will be used
     *     during content processing.
     * @param {String} anNSURI A namespace URI, often acquired from a native
     *     node via TP.nodeGetNSURI().
     * @param {String} aTransformURI A URI pointing to an XSLT.
     * @exception TP.sig.InvalidURI
     * @returns {String} The canonical prefix, if found.
     */

    var arr,
        info;

    if (TP.notValid(anNSURI)) {
        return this.raise('TP.sig.InvalidURI');
    }

    info = TP.w3.Xmlns.get('info').at(anNSURI.asString());
    if (TP.isValid(info)) {
        arr = info.at('transforms');
        if (TP.notValid(arr)) {
            arr = TP.ac();
            info.atPut('transforms', arr);
        }

        arr.add(aTransformURI);
    }

    return info;
});

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('computeCustomNSDetectionXPath',
function() {

    /**
     * @method computeCustomNSDetectionXPath
     * @summary Computes and returns an XPath suitable for locating custom
     *     namespaces (i.e. non-native namespaces) in a document or element.
     *     This path is built based on knowledge in the registry of namespace
     *     URI data.
     * @returns {String} An XPath string.
     */

    var nsStr,
        path;

    //  try to be lazy and compute this only once
    if (TP.notEmpty(path = this.$get('customNSDetectionXPath'))) {
        return path;
    }

    //  have to compute it...

    nsStr = TP.ac();

    //  Grab all of the namespaces that are handled natively by this
    //  browser and generate a 'namespace-uri() !=' query around them.
    TP.w3.Xmlns.getNativeNSURIs().perform(
        function(nativeXMLNS) {

            nsStr.push('(namespace-uri() != "', nativeXMLNS, '") and ');
        });

    //  Also, make sure that the namespace-uri() is not empty. We want
    //  default namespaces to fall through.
    nsStr.push('(namespace-uri() != \'\')');

    nsStr = nsStr.join('');

    //  Use the namespace part of the query that we've built in queries for
    //  both elements and attributes. Note that we also ignore elements
    //  (and any of their descendants) that have been tagged with the
    //  'tibet:opaque' flag attribute.
    //  Note here how we write the 'tibet:opaque' attribute test so that no
    //  namespace node is required for namespace resolution.
    path = TP.join(
        'descendant-or-self::*[',
        nsStr,
        ' and not(ancestor-or-self::*/@*[name() = "tibet:opaque"])] | ',
        'descendant-or-self::*/@*[',
        nsStr,
        ' and not(../ancestor-or-self::*/@*[name() = "tibet:opaque"])]');

    //  save it for next time
    this.$set('customNSDetectionXPath', path);

    return path;
});

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('computeCustomTagDetectionXPath',
function() {

    /**
     * @method computeCustomTagDetectionXPath
     * @summary Computes and returns an XPath suitable for locating custom tags
     *     in a document or element. This path is built based on knowledge in
     *     the registry of namespace URI data.
     * @returns {String} An XPath string.
     */

    var path;

    //  try to be lazy and compute this only once
    if (TP.notEmpty(path = this.$get('customTagDetectionXPath'))) {
        return path;
    }

    //  have to compute it...

    //  Compute an XPath that would detect non-native namespaces and
    //  elements that don't have an 'tibet:opaque' attribute on itself or
    //  any ancestor

    path = TP.ac('descendant-or-self::*[');

    //  Grab all of the namespaces that are handled natively by this
    //  browser and generate a 'not namespace-uri()' query around them.
    TP.w3.Xmlns.getNativeNSURIs().perform(
            function(nativeXMLNS) {

                path.push('(namespace-uri() != "', nativeXMLNS, '") and ');
            });

    //  Also, make sure that the namespace-uri() is not empty. We want
    //  default namespaces to fall through. Note that we also ignore
    //  elements (and any of their descendants) that have been tagged with
    //  the 'tibet:opaque' flag attribute.
    //  Note here how we write the 'tibet:opaque' attribute test so that no
    //  namespace node is required for namespace resolution.
    path.push(
        '(namespace-uri() != \'\')',
        ' and not(ancestor-or-self::*/@*[name() = "tibet:opaque"])]');

    path = path.join('');

    //  save it for next time
    this.$set('customTagDetectionXPath', path);

    return path;
});

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('fromMIMEType',
function(aMimeType) {

    /**
     * @method fromMIMEType
     * @summary Returns a hash of namespace data corresponding to the supplied
     *     MIME type.
     * @param {String} aMimeType The MIME type to use to retrieve the namespace
     *     data.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.core.Hash|undefined} A hash of data corresponding to the
     *     'info' entries on this type.
     */

    var info,
        xmlnsEntry;

    if (TP.notValid(aMimeType)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    info = TP.w3.Xmlns.get('info');

    xmlnsEntry = info.detect(
                    function(kvPair) {
                        return kvPair.last().at('mimetype') === aMimeType;
                    });

    if (TP.isValid(xmlnsEntry)) {
        return xmlnsEntry.last();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('getCanonicalPrefix',
function(anNSURI) {

    /**
     * @method getCanonicalPrefix
     * @summary Returns the canonical prefix for the namespace URI provided.
     * @param {String} anNSURI A namespace URI, often acquired from a native
     *     node via TP.nodeGetNSURI().
     * @exception TP.sig.InvalidURI
     * @returns {String|undefined} The canonical prefix, if found.
     */

    var info;

    if (TP.notValid(anNSURI)) {
        return this.raise('TP.sig.InvalidURI');
    }

    info = TP.w3.Xmlns.get('info').at(anNSURI.asString());
    if (TP.isValid(info)) {
        return info.at('prefix');
    }

    return;
});

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('getRootElementName',
function(anNSURI) {

    /**
     * @method getRootElementName
     * @summary Returns the root element tag name for documents in the
     *     namespace provided.
     * @param {String} anNSURI A namespace URI, often acquired from a native
     *     node via TP.nodeGetNSURI().
     * @exception TP.sig.InvalidURI
     * @returns {String} The root element tag name, if appropriate.
     */

    var info;

    if (TP.notValid(anNSURI)) {
        return this.raise('TP.sig.InvalidURI');
    }

    info = TP.w3.Xmlns.get('info').at(anNSURI.asString());
    if (TP.isValid(info)) {
        return TP.ifInvalid(info.at('rootElement'), '');
    }

    return '';
});

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('getMIMEType',
function(anNSURI) {

    /**
     * @method getMIMEType
     * @summary Returns the default MIME type for the namespace URI provided.
     * @param {String} anNSURI A namespace URI, often acquired from a native
     *     node via TP.nodeGetNSURI().
     * @exception TP.sig.InvalidURI
     * @returns {String|undefined} The MIME type, if found.
     */

    var info;

    if (TP.notValid(anNSURI)) {
        return this.raise('TP.sig.InvalidURI');
    }

    info = TP.w3.Xmlns.get('info').at(anNSURI.asString());
    if (TP.isValid(info)) {
        return info.at('mimetype');
    }

    return;
});

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('getNativePrefixes',
function() {

    /**
     * @method getNativePrefixes
     * @summary Returns an array of canonical prefixes supported natively on
     *     the current browser.
     * @returns {String[]} The list of native prefixes.
     */

    var arr;

    if (TP.notEmpty(arr = this.$nativePrefixes)) {
        return arr;
    }

    arr = TP.w3.Xmlns.get('info').collect(
        function(item) {

            var val;

            val = item.last();
            if (TP.isTrue(val.at('native'))) {
                return val.at('prefix');
            }

            return;
        });

    arr = arr.select(
                function(item) {

                    return TP.isValid(item);
                });

    this.$nativePrefixes = arr;

    return arr;
});

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('getNativeNSURIs',
function() {

    /**
     * @method getNativeNSURIs
     * @summary Returns an array of natively supported namespace URIs on the
     *     current browser.
     * @returns {String[]} The list of native namespace URIs.
     */

    var arr;

    if (TP.notEmpty(arr = this.$nativeURIs)) {
        return arr;
    }

    arr = TP.w3.Xmlns.get('info').collect(
        function(item) {

            var val;

            val = item.last();
            if (TP.isTrue(val.at('native'))) {
                return val.at('uri');
            }

            return;
        });

    arr = arr.select(
                function(item) {

                    return TP.isValid(item);
                });

    this.$nativeURIs = arr;

    return arr;
});

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('getNonNativePrefixes',
function() {

    /**
     * @method getNonNativePrefixes
     * @summary Returns an array of canonical prefixes which are known but not
     *     supported on the current browser.
     * @returns {String[]} The list of non-native prefixes.
     */

    var arr;

    if (TP.notEmpty(arr = this.$nonNativePrefixes)) {
        return arr;
    }

    arr = TP.w3.Xmlns.get('info').collect(
        function(item) {

            var val;

            val = item.last();
            if (TP.notTrue(val.at('native'))) {
                return val.at('prefix');
            }

            return;
        });

    arr = arr.select(
                function(item) {

                    return TP.isValid(item);
                });

    this.$nonNativePrefixes = arr;

    return arr;
});

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('getNonNativeNSURIs',
function() {

    /**
     * @method getNonNativeNSURIs
     * @summary Returns an array of known URIs which are not native to the
     *     current browser.
     * @returns {String[]} The list of non-native namespace URIs.
     */

    var arr;

    if (TP.notEmpty(arr = this.$nonNativeURIs)) {
        return arr;
    }

    arr = TP.w3.Xmlns.get('info').collect(
        function(item) {

            var val;

            val = item.last();
            if (TP.notTrue(val.at('native'))) {
                return val.at('uri');
            }

            return;
        });

    arr = arr.select(
                function(item) {

                    return TP.isValid(item);
                });

    this.$nonNativeURIs = arr;

    return arr;
});

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('getNSHandlerForNSURI',
function(anNSURI) {

    /**
     * @method getNSHandlerForNSURI
     * @summary Returns the type responsible for handling the namespace whose
     *     URI is provided, if available.
     * @param {String} anNSURI A namespace URI, often acquired from a native
     *     node via TP.nodeGetNSURI().
     * @returns {TP.meta.core.XMLNamespace} A TP.core.XMLNamespace subtype type
     *     object.
     */

    var info,
        type,
        prefix;

    if (TP.notValid(anNSURI)) {
        return this.raise('TP.sig.InvalidURI');
    }

    info = TP.w3.Xmlns.get('info').at(anNSURI.asString());
    if (TP.isValid(info)) {
        type = info.at('handler');
        if (TP.notEmpty(type)) {
            if (TP.isType(type)) {
                return type;
            }

            if (TP.isString(type)) {
                return TP.sys.getTypeByName(type);
            }
        } else {
            prefix = info.at('prefix');
            if (TP.notEmpty(prefix)) {
                return TP.sys.getTypeByName(prefix + ':');
            }
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('getNSURIForPrefix',
function(aPrefix) {

    /**
     * @method getNSURIForPrefix
     * @summary Returns the namespace URI whose canonical prefix matches the
     *     one provided.
     * @param {String} aPrefix A canonical prefix such as "xforms".
     * @exception TP.sig.InvalidParameter
     * @returns {String|undefined} The namespace URI.
     */

    if (TP.isEmpty(aPrefix)) {
        this.raise('TP.sig.InvalidParameter',
                    'Must supply a prefix.');

        return;
    }

    return this.get('prefixes').at(aPrefix);
});

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('getTransforms',
function(anNSURI) {

    /**
     * @method getTransforms
     * @summary Returns any registered XSLT transforms for the namespace URI
     *     provided. These are registered when a namespace has custom XSLTs
     *     which can assist with content processing. See the process call in
     *     TP.core.XMLNamespace for more info.
     * @param {String} anNSURI A namespace URI, often acquired from a native
     *     node via TP.nodeGetNSURI().
     * @exception TP.sig.InvalidURI
     * @returns {String[]|undefined} An array or undefined if no transforms are
     *     registered.
     */

    var info;

    if (TP.notValid(anNSURI)) {
        return this.raise('TP.sig.InvalidURI');
    }

    info = TP.w3.Xmlns.get('info').at(anNSURI.asString());
    if (TP.isValid(info)) {
        return info.at('transforms');
    }

    return;
});

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('getPrefixForNSURI',
function(anNSURI, aNode) {

    /**
     * @method getPrefixForNSURI
     * @summary Returns the prefix used for the URI provided, either in
     *     canonical terms, or specifically within the node provided.
     * @param {String} anNSURI A namespace URI, often acquired from a native
     *     node via TP.nodeGetNSURI().
     * @param {Node} aNode The node (document or element) for which a prefix is
     *     required.
     * @returns {String} The first declared namespace prefix.
     */

    var prefixes,
        prefix;

    //  when there's no node we'll just use the canonical one
    if (!TP.isNode(aNode)) {
        return this.getCanonicalPrefix(anNSURI);
    }

    //  if we've got a node we'll see if it has a different prefix for that
    //  URI
    prefixes = TP.nodeGetNSPrefixes(aNode, anNSURI);
    if (TP.notEmpty(prefixes)) {
        prefix = prefixes.at(0);
    }

    return TP.ifEmpty(prefix, this.getCanonicalPrefix(anNSURI));
});

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('getXHTMLNSURIs',
function() {

    /**
     * @method getXHTMLNSURIs
     * @summary Returns an array of namespace URIs which are implicitly part of
     *     the XHTML5 specification.
     * @returns {String[]} The list of XHTML namespace URIs.
     */

    var nsURIs;

    nsURIs = this.get('$xhtmlURIs');

    if (TP.notEmpty(nsURIs)) {
        return nsURIs;
    }

    nsURIs = TP.ac(TP.w3.Xmlns.XHTML,
                    TP.w3.Xmlns.MATHML,
                    TP.w3.Xmlns.SVG);

    this.set('$xhtmlURIs', nsURIs);

    return nsURIs;
});

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('getXMLNSDefs',
function() {

    /**
     * @method getXMLNSDefs
     * @summary Returns a string containing all known XMLNS definitions that
     *     have been registered. This string is added to node creation text when
     *     command tags are entered so that input doesn't have to include xmlns
     *     declarations.
     * @returns {String} A string of xmlns declarations.
     */

    var defs,
        arr;

    //  Note here how we use '$get()' to avoid recursion.
    if (TP.notEmpty(defs = this.$get('XMLNSDefs'))) {
        return defs;
    }

    arr = TP.ac();
    TP.w3.Xmlns.get('prefixes').perform(
                    function(item) {

                        if (TP.notEmpty(item.first()) &&
                            TP.notEmpty(item.last())) {
                            //  skip xml and xmlns declarations, they just
                            //  cause bugs
                            if (item.first().startsWith('xml')) {
                                return;
                            }

                            arr.push(' xmlns:', item.first(),
                                        '="', item.last(), '"');
                        }
                    });

    defs = arr.join('');

    //  Slice off the leading space
    defs = defs.slice(1);

    this.set('XMLNSDefs', defs);

    return defs;
});

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('isNativeNS',
function(anNSURI) {

    /**
     * @method isNativeNS
     * @summary Returns true if the namespace URI is natively supported on the
     *     current browser. Note that the result of this call is
     *     browser-specific.
     * @param {String} anNSURI A namespace URI, often acquired from a native
     *     node via TP.nodeGetNSURI().
     * @exception TP.sig.InvalidURI
     * @returns {Boolean} True if the namespace is natively supported.
     */

    var info;

    if (TP.notValid(anNSURI)) {
        return this.raise('TP.sig.InvalidURI');
    }

    info = TP.w3.Xmlns.get('info').at(anNSURI.asString());
    if (TP.isValid(info)) {
        //  not registered? then default to false
        return TP.ifEmpty(info.at('native'), false);
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('isNativeMarkup',
function(aMarkupString) {

    /**
     * @method isNativeMarkup
     * @summary Returns true if *all* of the namespace URIs in the supplied
     *     markup are considered to belong to native namespaces. If just one is
     *     not, then this method will return false.
     * @param {String} aMarkupString The markup string to test.
     * @exception TP.sig.InvalidString
     * @returns {Boolean} True if the markup contains namespaces that are
     *     natively supported.
     */

    var testElement;

    if (TP.notValid(aMarkupString)) {
        return this.raise('TP.sig.InvalidString');
    }

    if (!TP.regex.STARTS_WITH_ELEM_MARKUP.test(aMarkupString)) {
        return false;
    }

    //  Create an Element from the supplied markup so that we can extract the
    //  namespace URIs from it. Note how we specify a null default namespace and
    //  ask *not* to report errors from the parsing process here. We're only
    //  interested in whether we get a valid Element or not.
    testElement = TP.elem(aMarkupString, null, false);
    if (TP.isElement(testElement)) {
        return this.isNativeNode(testElement);
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('isNativeNode',
function(aNode) {

    /**
     * @method isNativeNode
     * @summary Returns true if *all* of the namespace URIs on the supplied
     *     node are considered to belong to native namespaces. If just one is
     *     not, then this method will return false.
     * @param {Document|Element} aNode The node to test.
     * @exception TP.sig.InvalidNode
     * @returns {Boolean} True if the node contains namespaces that are
     *     natively supported.
     */

    var testNode,

        isNative,

        allNSURIs,
        len,
        i;

    if (!TP.isDocument(aNode) && !TP.isElement(aNode)) {
        return this.raise('TP.sig.InvalidNode');
    }

    if (TP.isDocument(aNode)) {
        testNode = aNode.documentElement;
    } else {
        testNode = aNode;
    }

    isNative = true;

    //  Grab all of the namespace URIs, supplying true as the second
    //  parameter here to get all of the namespace URIs 'deeply'.
    allNSURIs = TP.nodeGetNSURIs(testNode, true);

    //  Iterate and if any of the detected namespaces are not native, flip
    //  the flag to false and break.
    len = allNSURIs.getSize();
    for (i = 0; i < len; i++) {
        if (!TP.w3.Xmlns.isNativeNS(allNSURIs.at(i))) {
            isNative = false;
            break;
        }
    }

    return isNative;
});

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('registerNSInfo',
function(anNSURI, aHash) {

    /**
     * @method registerNSInfo
     * @summary Registers information about the namespaceURI provide, merging
     *     the data from aHash if an entry already exists for that URI.
     * @param {String} anNSURI A namespace URI, often acquired from a native
     *     node via TP.nodeGetNSURI().
     * @param {TP.core.Hash} aHash A hash whose keys match those defined for
     *     this type.
     * @exception TP.sig.InvalidURI
     * @exception TP.sig.InvalidParameter
     * @returns {TP.meta.w3.Xmlns} The receiver.
     */

    var uriStr,

        allInfos,

        newPrefix,

        allKeys,

        len,
        i,

        prefix,

        info,
        constName;

    if (TP.notValid(anNSURI)) {
        return this.raise('TP.sig.InvalidURI');
    }

    if (TP.notValid(aHash)) {
        return this.raise('TP.sig.InvalidParameter',
                                    'Must provide registration data.');
    }

    uriStr = anNSURI.asString();

    //  we do this just in case since there may be changes to our
    //  computation of XPaths when the registration data changes
    this.$set('customNSDetectionXPath', null);
    this.$set('customTagDetectionXPath', null);

    //  clear any caches for prefixes or uris
    this.$set('nativePrefixes', null);
    this.$set('nativeURIs', null);
    this.$set('nonNativePrefixes', null);
    this.$set('nonNativeURIs', null);

    //  clear the xmlns definitions used for qualifying markup
    this.$set('XMLNSDefs', null);

    allInfos = TP.w3.Xmlns.get('info');

    //  If the caller is trying to define a new prefix, make sure one hasn't
    //  already been defined.
    newPrefix = aHash.at('prefix');

    if (TP.notEmpty(newPrefix)) {

        allKeys = TP.keys(allInfos);
        len = allKeys.getSize();

        for (i = 0; i < len; i++) {
            prefix = allInfos.at(allKeys.at(i)).at('prefix');
            if (TP.notEmpty(prefix) && prefix === newPrefix) {
                return this.raise(
                        'TP.sig.InvalidParameter',
                        'Namespace prefix already defined: ' + prefix);
            }
        }
    }

    info = allInfos.at(uriStr);
    if (TP.notValid(info)) {
        info = aHash;
        allInfos.atPut(uriStr, info);
    } else {
        //  merge in the keys we need
        TP.w3.Xmlns.$KEYS.perform(
                function(key) {

                    var val;

                    if (TP.isValid(val = aHash.at(key))) {
                        info.atPut(key, val);
                    }
                });
    }

    //  make sure the URI key is also in the hash
    info.atPut('uri', uriStr);

    //  update the prefix list so we can do reverse lookups by prefix
    if (TP.notEmpty(newPrefix)) {
        TP.w3.Xmlns.get('prefixes').atPut(newPrefix, uriStr);

        //  as a final step, register an uppercase version of the prefix with
        //  the TP.w3.Xmlns type.

        constName = newPrefix.toUpperCase();
        if (TP.notValid(TP.w3.Xmlns[constName])) {
            TP.w3.Xmlns.Type.defineConstant(constName, uriStr);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.w3.Xmlns.Type.defineMethod('unregisterNSInfo',
function(anNSURI) {

    /**
     * @method unregisterNSInfo
     * @summary Removes any information about the namespaceURI provided. This
     *     method can be used prior to a registerNamespace call to clear any
     *     pre-existing registration data.
     * @param {String} anNSURI A namespace URI, often acquired from a native
     *     node via TP.nodeGetNSURI().
     * @exception TP.sig.InvalidURI
     * @returns {TP.meta.w3.Xmlns} The receiver.
     */

    var info;

    if (TP.notValid(anNSURI)) {
        return this.raise('TP.sig.InvalidURI');
    }

    info = TP.w3.Xmlns.get('info').at(anNSURI.asString());
    if (TP.isValid(info)) {
        info.removeKey(anNSURI.asString());

        //  we do this just in case since there may be changes to our
        //  computation of XPaths when the registration data changes
        this.$set('customNSDetectionXPath', null);
        this.$set('customTagDetectionXPath', null);
    }

    return this;
});

//  ========================================================================
//  TP.core.XMLNamespace
//  ========================================================================

/**
 * @type {TP.core.XMLNamespace}
 * @summary This type is the common supertype of all objects representing XML
 *     namespaces in the TIBET system.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.XMLNamespace');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.XMLNamespace.Type.defineMethod('activate',
function(declarationName, declarationValue, affectedElements) {

    /**
     * @method activate
     * @summary Activates the supplied CSS declaration.
     * @description At this level, this method does nothing. Subtypes must
     *     implement this to provide real functionality.
     * @param {String} declarationName The name of the declaration.
     * @param {String} declarationValue The value of the declaration.
     * @param {Element[]} affectedElements An Array of the elements that were
     *     affected that the custom CSS declaration might need to change.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.XMLNamespace.Type.defineMethod('deactivate',
function(declarationName, declarationValue, affectedElements) {

    /**
     * @method deactivate
     * @summary Deactivates the supplied CSS declaration.
     * @description At this level, this method does nothing. Subtypes must
     *     implement this to provide real functionality.
     * @param {String} declarationName The name of the declaration.
     * @param {String} declarationValue The value of the declaration.
     * @param {Element[]} affectedElements An Array of the elements that were
     *     affected that the custom CSS declaration might need to change.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.XMLNamespace.Type.defineMethod('getCanonicalName',
function() {

    /**
     * @method getCanonicalName
     * @summary Returns the receiver's canonical tag name. For namespace types,
     *     this is the tag prefix (usually corresponding to the tag type's
     *     namespace) followed by a colon (':').
     * @returns {String} The receiver's tag name.
     */

    return this.get('nsPrefix') + ':';
});

//  ========================================================================
//  TP.core.XHTMLNamespace
//  ========================================================================

/**
 * @type {TP.html.XMLNS}
 * @summary Represents the XHTML namespace (http://www.w3.org/1999/xhtml) in
 *     the tag processing system.
 */

//  ------------------------------------------------------------------------

TP.core.XMLNamespace.defineSubtype('html.XMLNS');

//  ========================================================================
//  TP.core.XIncludeNamespace
//  ========================================================================

/**
 * @type {TP.xi.XMLNS}
 * @summary The XInclude namespace (http://www.w3.org/2001/XInclude).
 */

//  ------------------------------------------------------------------------

TP.core.XMLNamespace.defineSubtype('xi.XMLNS');

//  ========================================================================
//  TP.core.XSLTNamespace
//  ========================================================================

/**
 * @type {TP.xsl.XMLNS}
 * @summary The XSLT namespace (http://www.w3.org/1999/XSL/Transform).
 */

//  ------------------------------------------------------------------------

TP.core.XMLNamespace.defineSubtype('xsl.XMLNS');

//  ========================================================================
//  TP.core.Cookie
//  ========================================================================

/**
 * @type {TP.core.Cookie}
 * @summary TP.core.Cookie provides simple utility routines for setting and
 *     getting browser cookie values.
 * @description The storage format is basically an escaped source code form so
 *     you can do the following:
 *
 *     TP.core.Cookie.setCookie('name', someObject); ... myObj =
 *     TP.core.Cookie.getCookie('name');
 *
 *     At the end of this little sequence, someObject.equalTo(myObj) will be
 *     true for the most common cases.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.Cookie');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Cookie.Type.defineMethod('cookiesEnabled',
function() {

    /**
     * @method cookiesEnabled
     * @summary Returns true if cookies appear to be enabled in the current
     *     environment.
     * @returns {Boolean} True if cookies are enabled, false if they are not.
     */

    var testCookie,
        testValue,
        result;

    testCookie = TP.genID();
    testValue = TP.genID();

    this.setCookie(testCookie, testValue);

    try {
        result = this.getCookie(testCookie);
    } catch (e) {
        return false;
    }

    return result === testValue;
});

//  ------------------------------------------------------------------------

TP.core.Cookie.Type.defineMethod('getCookie',
function(aName) {

    /**
     * @method getCookie
     * @summary Returns the value of the named cookie or undefined.
     * @description The value returned is a source-code form string derived from
     *     the original object so using eval on it will effectively construct a
     *     new instance of the original object -- provided that you are working
     *     primarily with hashes or arrays etc.
     * @param {String} aName The name of the desired cookie.
     * @returns {String|undefined} The value of the cookie matching the supplied
     *     name.
     */

    var cooky;

    cooky = document.cookie;
    if (cooky === '') {
        //  no cookies
        return;
    }

    return this.getCookieFromText(aName, cooky);
});

//  ------------------------------------------------------------------------

TP.core.Cookie.Type.defineMethod('getCookieFromText',
function(aName, aCookieText) {

    /**
     * @method getCookieFromText
     * @summary Returns the value of the named cookie or null.
     * @param {String} aName The name of the desired cookie.
     * @param {String} aCookieText The text to extract the cookie from.
     * @returns {Object|undefined} The value of the cookie matching the supplied
     *     name and the supplied chunk of cookie text.
     */

    var start,
        end,

        result;

    start = aCookieText.indexOf(aName + '=');
    if (start === TP.NOT_FOUND) {
        //  not found
        return;
    }

    end = aCookieText.indexOf(';', start + aName.getSize());
    if (end === TP.NOT_FOUND) {
        end = aCookieText.getSize();
    }

    //  slice off the 'name=' portion and return just the value. Note that
    //  we encodeURI()'ed out semicolons, commas, spaces, etc. since cookies
    //  cannot have those in them in the setCookie() method, so we have to
    //  decodeURI() them here.
    result = decodeURI(aCookieText.slice(
                        start + aName.getSize() + 1, end));

    return result;
});

//  ------------------------------------------------------------------------

TP.core.Cookie.Type.defineMethod('removeCookie',
function(aName, aPath, aDomain) {

    /**
     * @method removeCookie
     * @summary Removes the named cookie.
     * @param {String} aName The name of the cookie to remove.
     * @param {String} aPath The path of the cookie to remove.
     * @param {String} aDomain The domain of the cookie to remove.
     * @returns {Boolean} Whether the cookie was successfully removed or not.
     */

    return this.setCookie(aName,
                            '',
                            TP.dc().subtractDuration('P1Y'),
                            aPath,
                            aDomain);
});

//  ------------------------------------------------------------------------

TP.core.Cookie.Type.defineMethod('setCookie',
function(aName, aValue, expiresAt, aPath, aDomain, wantsSecurity) {

    /**
     * @method setCookie
     * @summary Sets the value of the named cookie with associated params. The
     *     values and rules for the various params are documented in most JS
     *     texts. See JSTDG3 for a good discussion.
     * @param {String} aName The cookie name.
     * @param {String} aValue The cookie value.
     * @param {Date} expiresAt The cookie expiration date/time.
     * @param {String} aPath The cookie's path.
     * @param {String} aDomain An alternate cookie domain.
     * @param {Boolean} wantsSecurity Whether security is desired.
     * @returns {Boolean} Whether the cookie was successfully set or not.
     */

    var cooky;

    if (TP.notValid(aName) || TP.notValid(aValue)) {
        return false;
    }

    //  Note that we encodeURI() out things like semicolons, commas, spaces,
    //  etc. since cookies cannot have those in them. We decodeURI() them in
    //  the getCookieFromText() method.
    cooky =
        TP.join(
            aName,
            '=',
            encodeURI(aValue),
            TP.notValid(expiresAt) ? '' : '; expires=' +
                                                expiresAt.toGMTString(),
            TP.notTrue(wantsSecurity) ? '' : '; secure',
            TP.isEmpty(aDomain) ? '' : '; domain=' + aDomain,
            TP.isEmpty(aPath) ? '' : '; path=' + aPath
        );

    //  Try to set the cookie. If it fails, return false.
    try {
        document.cookie = cooky;
    } catch (e) {
        return false;
    }

    return true;
});

//  ------------------------------------------------------------------------
//  CONTENT METHODS
//  ------------------------------------------------------------------------

TP.core.Cookie.Type.defineMethod('load',
function(aURI, aRequest, logError) {

    /**
     * @method load
     * @summary Loads URI data content and returns it on request. This is a
     *     template method which defines the overall process used for loading
     *     URI data and ensuring that the URI's cache and header content are
     *     kept up to date. You should normally override one of the more
     *     specific load* methods in subtypes if you're doing custom load
     *     handling.
     * @param {TP.uri.URI} aURI The URI to load. NOTE that this URI will not
     *     have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @param {Boolean} logError Whether or not this call logs errors if the
     *     data cannot be retrieved.
     * @exception TP.sig.InvalidURI
     * @exception TP.sig.InvalidRequest
     * @returns {TP.sig.Response} A valid response object for the request.
     */

    var request,
        response,

        cookie;

    if (TP.notValid(aURI)) {
        return this.raise('TP.sig.InvalidURI');
    }

    if (TP.notValid(aRequest)) {
        return this.raise('TP.sig.InvalidRequest');
    }

    request = TP.request(aRequest);
    response = request.getResponse();

    cookie = this.getCookie(aURI.get('cname'));

    request.set('result', cookie);

    return response;
});

//  ------------------------------------------------------------------------

TP.core.Cookie.Type.defineMethod('delete',
function(aURI, aRequest) {

    /**
     * @method delete
     * @summary Deletes the target URL.
     * @param {TP.uri.URI} aURI The URI to delete. NOTE that this URI will not
     *     have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @exception TP.sig.InvalidURI
     * @exception TP.sig.InvalidRequest
     * @returns {TP.sig.Response} A valid response object for the request.
     */

    var request,
        response;

    if (TP.notValid(aURI)) {
        return this.raise('TP.sig.InvalidURI');
    }

    if (TP.notValid(aRequest)) {
        return this.raise('TP.sig.InvalidRequest');
    }

    request = TP.request(aRequest);
    response = request.getResponse();

    if (!this.removeCookie(aURI.get('cname'),
                                        aURI.get('path'),
                                        aURI.get('domain'))) {
        request.fail();
    }

    return response;
});

//  ------------------------------------------------------------------------

TP.core.Cookie.Type.defineMethod('save',
function(aURI, aRequest) {

    /**
     * @method save
     * @summary Attempts to save data using standard TIBET save primitives to
     *     the URI (after rewriting) that is provided.
     * @param {TP.uri.URI} aURI The URI to save. NOTE that this URI will not
     *     have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @exception TP.sig.InvalidURI
     * @exception TP.sig.InvalidRequest
     * @returns {TP.sig.Response} A valid response object for the request.
     */

    var request,
        response,

        contentToSet,
        query;

    if (TP.notValid(aURI)) {
        return this.raise('TP.sig.InvalidURI');
    }

    if (TP.notValid(aRequest)) {
        return this.raise('TP.sig.InvalidRequest');
    }

    request = TP.request(aRequest);
    response = request.getResponse();

    //  Grab the content from the request.
    contentToSet = TP.str(request.at('body'));

    //  Make sure and set a result type (which normally wouldn't be there
    //  for 'save' requests), so that we get some sort of value back.
    request.atPut('resultType', TP.TEXT);

    query = aURI.get('queryDict');
    if (TP.notValid(query)) {
        query = TP.hc();
    }

    if (!this.setCookie(aURI.get('cname'),
                                    contentToSet,
                                    query.at('expires'),
                                    aURI.get('path'),
                                    aURI.get('domain'),
                                    query.at('secure'))) {
        request.fail();
    }

    return response;
});

//  ========================================================================
//  TP.uri.CookieURL
//  ========================================================================

/**
 * @type {TP.uri.CookieURL}
 * @summary A subtype of TP.uri.URL specific to the 'cookie://' scheme.
 * @description The overall format of a cookie URI is:
 *
 *     cookie://[domain]/[path]/[cookie_name]?[expires=<value>]&[secure=true]
 *
 *
 * @example

 *     Session #1. Store the data in the default domain and path. This will be
 *     cached in the URI until its cache is flushed or this session is shutdown
 *     and another one started:
 *
 *     myCookieURI = TP.uc('cookie:///last_visited');
 *
 *     Set the content to a Date of 'now':
 *
 *     myCookieURI.setContent(TP.dc().asString()); myCookieURI.save();
 *
 *     Session #2. Read the data back:
 *
 *     myCookieURI = TP.uc('cookie:///last_visited');
 *
 *     fetch the content and cache it in the URL the first time:
 *
 *     myCookieURI.getResource().get('result'); // -> Returns the date set
 *
 *     OR Fetch the content and ignore the URL cache, going to the database each
 *     time:
 *
 *     myCookieURI.getResource(TP.hc('refresh', true)).get('result'); -> The
 *     date set.
 *
 *     Session #3. Store the data using non-default values:
 *
 *     Set a cookie for the 'foo.com' domain, storing the data along the
 *     'user_info' path under the 'last_visited' cookie name. Also, set security
 *     to false and the expiration date to 'now + 2 days':
 *
 *     myCookieURI = TP.uc(
 *          TP.join('cookie://foo.com/user_info/last_visited?expires="',
 *          encodeURIComponent(TP.dc().addDuration('P2D')), '"&secure=false'));
 *
 *     Set the content to a Date of 'now':
 *
 *     myCookieURI.setContent(TP.dc().asString()); myCookieURI.save();
 *
 *     Fetch the content and cache it in the URL the first time:
 *
 *     myCookieURI.getResource().get('result'); // -> Returns the date set
 */

//  ------------------------------------------------------------------------

TP.uri.URL.defineSubtype('CookieURL');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  This RegExp splits up the URL into the following components:
//  cookie://[domain]/[path]/[cookie_name]?[expires=<value>]&[secure=true]
TP.uri.CookieURL.Type.defineConstant('COOKIE_REGEX',
        TP.rc('cookie://([^/]*)/?([^?]+)\\??(\\S*)'));

TP.uri.CookieURL.Type.defineConstant('SCHEME', 'cookie');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  'cookie:' scheme is sync-only so configure for that
TP.uri.CookieURL.Type.defineAttribute('supportedModes',
                                    TP.core.SyncAsync.SYNCHRONOUS);
TP.uri.CookieURL.Type.defineAttribute('mode',
                                    TP.core.SyncAsync.SYNCHRONOUS);

TP.uri.CookieURL.registerForScheme('cookie');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  note that there are 'scheme', 'path' and 'fragment' ivars on
//  TP.uri.URI / TP.uri.URL
TP.uri.CookieURL.Inst.defineAttribute('domain');
TP.uri.CookieURL.Inst.defineAttribute('path');

//  The cookie name
TP.uri.CookieURL.Inst.defineAttribute('cname');

TP.uri.CookieURL.Inst.defineAttribute('queryDict');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.uri.CookieURL.Type.defineMethod('$getDefaultHandler',
function(aURI, aRequest) {

    /**
     * @method $getDefaultHandler
     * @summary Return the default URI handler type for this URI type.
     * @param {TP.uri.URI|String} aURI The URI to obtain the default handler
     *     for.
     * @param {TP.sig.Request} aRequest The request whose values should inform
     *     the routing assignment.
     * @returns {TP.meta.uri.URIHandler} A TP.uri.URIHandler subtype type
     *     object.
     */

    return TP.core.Cookie;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.uri.CookieURL.Inst.defineMethod('init',
function(aURIString) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {String} aURIString A String containing a proper URI.
     * @returns {TP.uri.CookieURL|undefined} A new instance.
     */

    var results,
        pathAndName,

        uriQuery,
        queryDict;

    this.callNextMethod();

    //  Run the type's RegExp and grab the pieces of the URL.
    results = this.getType().COOKIE_REGEX.exec(aURIString);
    if (TP.notValid(results)) {
        return;
    }

    this.set('domain', results.at(1));

    pathAndName = results.at(2);
    if (pathAndName.contains('/')) {
        this.set('path',
                    '/' + pathAndName.slice(0, pathAndName.indexOf('/')));
        this.set('cname',
                    pathAndName.slice(pathAndName.indexOf('/') + 1));
    } else {
        this.set('path', '/');
        this.set('cname', pathAndName);
    }

    //  If there are parameters in the query, process them into a hash.
    if (TP.notEmpty(uriQuery = results.at(3))) {
        //  Construct a hash from the query string.
        queryDict = TP.core.Hash.fromString(uriQuery);

        this.set('queryDict', queryDict);

        if (TP.isEmpty(this.get('queryDict').at('expires'))) {
            this.get('queryDict').atPut(
                    'expires',
                    TP.dc(TP.dc().setFullYear(TP.dc().getFullYear() + 1)));
        }
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
