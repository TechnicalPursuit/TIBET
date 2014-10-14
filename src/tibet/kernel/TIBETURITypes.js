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
The TP.core.URI type and its subtypes are central to development with TIBET.

Everything in TIBET has a URI, from the data you work with on a remote server to
the data cached in the client to the elements in your UI. Access to these
objects for purposes of manipulation or data binding is done by leveraging the
features of the TP.core.URI type and its subtypes.

TP.core.URL is the root for most common URIs including those for the http: and
file: schemes most web developers are familiar with. Most of the time when
you're working with a data source you're working with an instance of some
concrete TP.core.URL subtype such as TP.core.HTTPURL or TP.core.FileURL.

TP.core.URN (urn:*) is the typical URI form for "named objects" such as the
types in the TIBET system or other objects for which a public name is useful or
necessary. Most URNs in TIBET use a namespace ID (NID) of 'tibet' so most URN
instances start off with urn:tibet: followed by the actual name string.
Instances of TP.core.URN are typically instances of an NID-specific subtype so
that each subtype can process the namespace specific string (NSS) portion in a
namespace-specific fashion. TP.core.TIBETURN is the most common TP.core.URN
subtype.

TP.core.TIBETURN (urn:tibet:*) is a TIBET-specific URL type which provides
extensions to the general URI addressing model. In particular, TIBET URLs allow
for dynamic resolution and targeting of objects in "browser space". TIBET URLs
will be created when a virtual URI path is specified (i.e. one that uses a
leading ~ prefix to create paths such as ~lib/ or ~app/ which refer to "the
TIBET library root" and "the current application root" respectively. See below
for more information on virtual URIs.

TIBET's URI types each have the ability to manage a cache for their data so that
bandwidth can be managed efficiently. The focal point for caching is the URI
instance itself, which also manages header and content data for all access to
that instance's target resource. URI caching for things like client-side
templates and common lookup code tables is a typical use case.

URI-related standards like XInclude and XPointer are also supported by the
appropriate URI subtypes. These standards provide additional ways to help you
modularize your application for better maintainability and performance. By
leveraging XPointer for example, you can slice content from template files or
access portions of a REST response with ease.

See the individual type documentation for more information and examples.

Note that the underlying 'URI primitives' capability of TIBET, in addition to
standard URI 'slicing and dicing' operations, also support what are known as
"virtual URIs". These are URIs that have a leading tilde ('~') prefix and that
resolve to a value at run time using the built in configuration system. For
instance, a path of '~lib_xsl' will use the value in the configuration system
named 'path.lib_xsl'. There are a number of shortcuts that can be used with
virtual URIs:

    ~app    The application root
    ~lib    The library root

*/

/* JSHint checking */

/* jshint evil:true
*/

//  ------------------------------------------------------------------------

//  ========================================================================
//  TP.core.URI
//  ========================================================================

/**
 * @type {TP.core.URI}
 * @synopsis An abstract type that models Uniform Resource Identifiers in the
 *     TIBET system. While abstract, this type's constructor should always be
 *     used directly or via the TP.uc() or TP.uri() functions.
 * @description The top-level URI type in the TIBET system is an abstract type.
 *     This follows the somewhat 'classical' view of the W3C spec, where URIs
 *     represent the overall Web addressing and naming scheme and various
 *     scheme-specific forms manage the concrete data. When you ask for an
 *     instance of URI in TIBET you get back an instance of a subtype specific
 *     to the URI scheme you provided. This is consistent with the reality that
 *     only a scheme-specific parser and processor can truly manage each
 *     scheme's URI format and requirements.
 *
 *     When asked for content, the TP.core.URI types typically return content
 *     objects based on the MIME type of the content. If a type representing the
 *     content MIME type is registered as a content handler in TIBET's
 *     TP.ietf.Mime map that type's constructContentObject() method is used to
 *     construct an instance for the new data. For example, JSON data, which has
 *     a TP.ietf.Mime type definition, will return a JavaScript instance which
 *     may further resolve its type based on JSON rules. In a similar fashion,
 *     CSS files return specific CSS content wrappers. You can extend this
 *     approach to support your own custom data formats as you require by
 *     pairing the MIME type your server sends with a client-side handler.
 *
 *     For flexibility, TP.core.URI uses a combination of URI "routers" and URI
 *     "handlers". Certain operations on a URI such as load, save, or 'nuke'
 *     (delete), are first "routed" meaning they look in TIBET's URI map for a
 *     mapping which defines a URI handler based on that URIs values and on
 *     current application state. The resulting handler type is then assigned to
 *     do the low-level work for the operation in question. This approach allows
 *     you to create custom logic for different data sources or data sinks much
 *     like server-side products map URI handlers. An example of this can be
 *     found in TIBET's Amazon S3 handler processing which performs special work
 *     to process S3 URIs.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core:URI');

//  TP.core.URI is an abstract type in TIBET terms, meaning you can't
//  construct a concrete instance of TP.core.URI (but you can invoke the
//  constructor to get a specialized subtype returned to you.)
TP.core.URI.isAbstract(true);

//  Add support methods for sync vs. async mode and request rewriting.
TP.core.URI.addTraitsFrom(TP.core.SyncAsync);

//  Resolve the traits right away as subtypes of this type are used during the
//  booting process.
TP.core.URI.executeTraitResolution();

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  placeholder for the scheme specific to the receiving type
TP.core.URI.Type.defineConstant('SCHEME');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  default catalog for URI rewrite/route operations
TP.core.URI.Type.defineAttribute('uriCatalog');

//  most URI access is synchronous (javascript:, file:, urn:, etc) so we
//  start with that here and override for http:, localdb:, jsonp:, etc.
TP.core.URI.set('supportedModes', TP.core.SyncAsync.SYNCHRONOUS);
TP.core.URI.set('mode', TP.core.SyncAsync.SYNCHRONOUS);

//  holder for path-to-instance registrations.
TP.core.URI.Type.defineAttribute(
            'instances',
            TP.ifInvalid(TP.core.URI.$get('instances'), TP.hc()));

//  holder for scheme-to-type registrations.
TP.core.URI.Type.defineAttribute(
            'schemeHandlers',
            TP.ifInvalid(TP.core.URI.$get('schemeHandlers'), TP.hc()));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('construct',
function(aURI, $$vetted) {

    /**
     * @name construct
     * @synopsis Returns a new instance of URI by using the root URI and
     *     relative URI to determine the specific path being defined. Note that
     *     special precedence is given to ~ (tilde) prefixed URI resolution
     *     since a majority of URIs referenced in the typical application are of
     *     this form.
     * @param {String} aURI Typically an absolute path but possibly a path
     *     starting with '.','/','-', or '~' which is adjusted as needed.
     * @returns {TP.core.URI} The new instance.
     */

    var url,
        flag,
        expanded,
        inst,
        type,
        err;

    TP.stop('break.uri_construct');

    //  this method invokes itself with a fully-expanded URI once the
    //  concrete subtype has been determined. By checking here we can avoid
    //  a lot of extra overhead redoing work that was done in the first
    //  pass.
    if ($$vetted) {
        //  This should invoke a relatively simple alloc/init sequence with
        //  the URI as the only parameter. NOTE that when we go down this
        //  branch 'this' is always a subtype of TP.core.URI.
        if (TP.isValid(inst = this.callNextMethod(aURI))) {
            TP.core.URI.registerInstance(inst);
        }

        return inst;
    }

    //  most common case is either a string or an existing URI, typically
    //  without a relativeURI or filePath portion. When we're passed an
    //  existing URI we want to optimize that case and return it.
    if (!TP.isString(aURI)) {
        if (TP.isKindOf(aURI, TP.core.URI)) {
            return aURI;
        } else {
            return;
        }
    }

    //  given a null or empty string? no address.
    if (TP.isBlank(aURI)) {
        return;
    }

    //  adjust our path for Windows local paths...just in case.
    url = TP.regex.HAS_BACKSLASH.test(aURI) ?
            TP.uriInWebFormat(aURI) :
            aURI;

    //  support barename shorthand by rewriting it as a reference to the
    //  current UI canvas.
    if (url.indexOf('#') === 0) {
        url = 'tibet://uicanvas/' + url;
    }

    //  several areas in TIBET will try to resolve strings to URIs. we want
    //  this to be effective, but accurate so there are some simple checks
    //  to help ensure we have something that might be a valid URI string
    if (!TP.regex.URI_LIKELY.test(url) ||
        TP.regex.REGEX_LITERAL_STRING.test(url)) {
        return;
    }

    //  normalize if possible, removing embedded './', '..', etc., but we
    //  have to use a check here for ~ or tibet:///~ path
    if (!TP.regex.TIBET_VIRTUAL_URI_PREFIX.test(url)) {
        url = TP.uriCollapsePath(url);
    }

    //  we don't want to see exceptions when certain URI resolutions fail
    flag = TP.sys.shouldLogRaise();
    TP.sys.shouldLogRaise(false);

    try {
        //  TIBET URLs are the most common so we try to optimize for them
        if (TP.regex.TIBET_URI.test(url)) {
            //  if it starts with ~ or tibet: then we need to check for the
            //  fully expanded form as a registered instance
            expanded = TP.uriResolveVirtualPath(url);
            if (TP.isURI(inst = TP.core.URI.getInstanceById(expanded))) {
                return inst;
            }

            //  NOTE the true value here to signify the URI is vetted
            //  and ready to use without additional processing.
            inst = TP.core.TIBETURL.construct(url, true);
        } else {
            if (TP.isURI(inst = TP.core.URI.getInstanceById(url))) {
                return inst;
            }

            //  One last adjustment is when a developer uses a typical url of
            //  the form '/' or './' etc. In those cases we need to update the
            //  url to include the current root. We can adjust for that.
            url = TP.uriWithRoot(url);

            //  here we construct the instance and init() it using the root
            type = this.getConcreteType(url);
            if (TP.isType(type)) {
                //  NOTE the true value here to signify the URI is vetted
                //  and ready to use without additional processing.
                inst = type.construct(url, true);
            } else {
                //  !!!NOTE NOTE NOTE this WILL NOT LOG!!!
                return this.raise(
                        'TP.sig.NoConcreteType',
                        'Unable to locate concrete type for URI: ' + url);
            }
        }
    } catch (e) {
        err = TP.ec(e,
            TP.join(TP.sc('URI construct produced error for: '),
                url));
        return this.raise('TP.sig.URIException', err);
    } finally {
        TP.sys.shouldLogRaise(flag);
    }

    return inst;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uc',
function(aURI) {

    /**
     * @name uc
     * @synopsis A shorthand method for TP.core.URI.construct().
     * @param {String} aURI Typically an absolute path but possibly a path
     *     starting with '.','/','-', or '~' which is adjusted as needed.
     * @returns {TP.core.URI} The new instance.
     */

    return TP.core.URI.construct(aURI);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uri',
function(anObject) {

    /**
     * @name uri
     * @synopsis Returns the URI which identifies the object provided. When a
     *     String matching URI form is provided the result is the same as having
     *     called TP.uc() (which is preferable). In all other cases the
     *     resulting URI represents the objects "TIBET URL" or ID. This is often
     *     in the form of a TP.core.URN.
     * @param {Object} anObject The object whose URI is being requested.
     * @returns {TP.core.URI} A URI suitable to locate the object provided, or
     *     defined by that object/string.
     */

    var uri,
        id,
        urn;

    //  legacy calls tend to provide strings... should be a TP.uc() call now.
    if (TP.isString(anObject) &&
        TP.regex.URI_LIKELY.test(anObject) &&
        !TP.regex.REGEX_LITERAL_STRING.test(anObject)) {
        uri = TP.core.URI.construct(anObject);
        if (TP.isURI(uri)) {
            return uri;
        }
    } else if (TP.isKindOf(anObject, TP.core.URI)) {
        return anObject;
    }

    //  non-mutable objects can't have an ID assigned, their ID is
    //  effectively their value.
    if (TP.isMutable(anObject)) {
        id = TP.gid(anObject, true);
    } else {
        id = TP.val(anObject);
    }

    //  global IDs should be valid TIBET URLs so do our best to construct
    //  one.
    //  NOTE that since our IDs don't follow the pure 0-9 and '.' form for
    //  OID we don't use the urn:oid: NID here.
    urn = TP.core.URI.construct(TP.TIBET_URN_PREFIX + id);
    urn.setResource(anObject);

    return urn;
});

//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('fromDocument',
function(aDocument) {

    /**
     * @name fromDocument
     * @synopsis Constructs and returns a new instance by interrogating a
     *     document for its location information.
     * @param {Document} aDocument The document to interrogate for location
     *     data.
     * @returns {TP.core.URI} A new instance.
     */

    var elem,
        path;

    if (!TP.isDocument(aDocument)) {
        this.raise('TP.sig.InvalidDocument');

        return;
    }

    //  document objects can be flagged by TIBET, in which case that wins...
    elem = aDocument.documentElement;
    if (TP.isElement(elem)) {
        path = TP.elementGetAttribute(elem, 'tibet:src', true);
        if (TP.notEmpty(path)) {
            return this.construct(path + '#document');
        }
    }

    //  they also have their own location
    return this.construct(aDocument.location + '#document');
});

//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('fromString',
function(aURIString) {

    /**
     * @name fromString
     * @synopsis Constructs and returns a new TP.core.URI instance from a
     *     String.
     * @param {String} aURIString A String containing a proper URI.
     * @returns {TP.core.URI} A new instance.
     */

    return this.construct(aURIString);
});

//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('fromTP_core_URI',
function(aURI) {

    /**
     * @name fromTP_core_URI
     * @synopsis Returns the URI provided to help ensure unique entries exist.
     * @param {TP.core.URI} aURI An existing URI.
     * @returns {TP.core.URI} A new instance.
     */

    return aURI;
});

//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('fromWindow',
function(aWindow) {

    /**
     * @name fromWindow
     * @synopsis Constructs and returns a new instance by interrogating a window
     *     for its location information.
     * @param {Window} aWindow The window to interrogate to make the URI from.
     * @returns {TP.core.URI} A new instance.
     */

    if (!TP.isWindow(aWindow)) {
        this.raise('TP.sig.InvalidWindow');
        return;
    }

    //  NOTE that we force a string here; we don't want a location object,
    //  and for whatever reason certain older browsers can actually fail if
    //  you try to toString the darn thing.
    return this.construct('' + aWindow.location);
});

//  ------------------------------------------------------------------------
//  Type Registration
//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('getConcreteType',
function(aPath) {

    /**
     * @name getConcreteType
     * @synopsis Returns the type to use for a particular URI path.
     * @param {String} aPath A URI string providing at least a scheme which can
     *     be looked up for a concrete type.
     * @returns {TP.lang.RootObject} A type object.
     */

    var schemeRoot;

    schemeRoot = this.$get('schemeHandlers').at(
                                aPath.slice(0, aPath.indexOf(':')));

    //  Further allow each subtype to refine the concrete type being
    //  assigned. A specific example is TP.core.URN which can specialize
    //  based on the specific NID.
    if (TP.owns(schemeRoot, 'getConcreteType')) {
        return schemeRoot.getConcreteType(aPath);
    }

    return schemeRoot;
});

//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('registerForScheme',
function(aScheme) {

    /**
     * @name registerForScheme
     * @synopsis Registers the receiving type for handling construction of URI
     *     instances for a particular scheme.
     * @param {String} aScheme A URI scheme such as http, file, etc.
     * @raise TP.sig.InvalidParameter When the scheme isn't a string.
     * @todo
     */

    var theScheme;

    if (!TP.isString(aScheme)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Scheme is empty or null.');
    }

    theScheme = aScheme.strip(':');
    TP.core.URI.$get('schemeHandlers').atPut(theScheme, this);

    //  TP.boot objects are primitive, so don't assume at() will work here.
    if (TP.notValid(TP.boot.$uriSchemes[theScheme])) {
        //  Add the scheme to TP.boot's '$uriSchemes' object so that the
        //  shell, etc. will treat the URIs using the scheme properly.
        TP.boot.$uriSchemes[theScheme] = theScheme;

        //  Rewrite the TP.regex.URI_LIKELY so that it reflects the new
        //  scheme as well.
        TP.regex.URI_LIKELY =
            TP.rc(TP.join('^~|^\/|^\\.\\/|^\\.\\.\\/',
                            '|^',
                            TP.keys(TP.boot.$uriSchemes).join(':|^'),
                            ':',
                            '|^(?:\\w+):(?:.*)\\/'));
    }

    return;
});

//  ------------------------------------------------------------------------
//  Instance Registration
//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('getInstanceById',
function(anID) {

    /**
     * @name getInstanceById
     * @synopsis Returns the existing URI instance whose "ID" or path is the
     *     path provided. This uses the TP.core.URI instance registry as the
     *     lookup location.
     * @param {String} anID A URI ID, which is typically the URI's
     *     fully-expanded and normalized location.
     * @returns {TP.core.URI} A matching instance, if found.
     */

    return TP.core.URI.$get('instances').at(anID);
});

//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('registerInstance',
function(anInstance) {

    /**
     * @name registerInstance
     * @synopsis Registers an instance under that instance's URI string.
     *     Subsequent calls to construct an instance for that URI string will
     *     return the cached instance.
     * @param {TP.core.URI} anInstance The instance to register.
     * @raises TP.sig.InvalidURI
     * @returns {TP.core.URI} The receiver.
     */

    var dict;

    if (!TP.canInvoke(anInstance, 'getID')) {
        return this.raise('TP.sig.InvalidURI');
    }

    //  update our instance registry with the instance, keying it under the
    //  fully-expanded URI ID.
    dict = this.$get('instances');
    dict.atPut(anInstance.getLocation(), anInstance);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('removeInstance',
function(anInstance) {

    /**
     * @name removeInstance
     * @synopsis Removes an instance under that instance's URI string.
     * @param {TP.core.URI} anInstance The instance to remove.
     * @raises TP.sig.InvalidURI
     * @returns {TP.core.URI} The receiver.
     */

    var dict;

    if (!TP.canInvoke(anInstance, 'getID')) {
        return this.raise('TP.sig.InvalidURI');
    }

    //  update our instance registry by removing the instance, finding it's key
    //  under the fully-expanded URI ID.
    dict = this.$get('instances');
    dict.removeKey(anInstance.getLocation());

    return this;
});

//  ------------------------------------------------------------------------
//  Rewriting/Routing Support
//  ------------------------------------------------------------------------

/**
 * URI rewriting is common on the server, where patterns like FrontController
 * are used to route requests in the form of URIs to the proper controller type.
 * In TIBET's case URI rewriting is used as a way of "virtualizing" URIs to
 * avoid hard-coded references to specific servers/resources. It also can be
 * used to good effect to switch URIs when moving between online and offline
 * operation, when moving between development, production, and test environments
 * or when using different "mocks" for various testing purposes.
 *
 * The foundation of rewriting/routing in TIBET is processing of XML Catalog
 * specification file(s) which provide the mapping information. We do those
 * operations on the TP.core.URI type so they can be leveraged by consumers
 * without creating too many inter-dependencies specific to the maps
 * themselves.
 */

//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('$getDefaultHandler',
function(aURI, aRequest) {

    /**
     * @name $getDefaultHandler
     * @synopsis Returns the default handler for a URI and request pair. This is
     *     typically the type defined by TP.sys.cfg('uri.handler') which
     *     defaults to TP.core.URIHandler.
     * @param {TP.core.URI|String} aURI The URI to obtain the default handler
     *     for.
     * @param {TP.sig.Request} aRequest The request whose values should inform
     *     the routing assignment.
     * @returns {TP.lang.RootObject.<TP.core.URIHandler>} A TP.core.URIHandler
     *     subtype type object or a type object conforming to that interface.
     * @todo
     */

    var tname,
        type;

    //  default handler is mapped in the configuration settings
    tname = TP.sys.cfg('uri.handler');
    if (TP.isEmpty(tname)) {
        this.raise('TP.sig.InvalidConfiguration',
                    'uri.handler has no type name specified.');

        //  always return at least our default type
        return TP.core.URIHandler;
    }

    type = TP.sys.require(tname);
    if (TP.notValid(type)) {
        this.raise('TP.sig.TypeNotFound', tname);

        //  always return at least our default type
        return TP.core.URIHandler;
    }

    return type;
});

//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('$getURICatalog',
function(aURI, aCatalog, aFilter) {

    /**
     * @name $getURICatalog
     * @synopsis Returns the XML Catalog data for this application, converted
     *     into rough hash form for processing by consumers.
     * @description The actual XML for the URI catalog can be obtained using
     *     TP.sys.getURIXML(). Passing aURI value will cause the specific
     *     catalog related to that URI to be returned (typically a nextCatalog
     *     or delegateURI entry).
     * @param {TP.core.URI|String} aURI A URI defining a specific catalog file
     *     to access and process as needed.
     * @param {TP.lang.Hash} aCatalog A TIBET URL Catalog to merge the data
     *     into. This is normally the root catalog during nextCatalog processing
     *     since order is maintained in this process.
     * @param {String} aFilter An optional regular expression string used only
     *     when integrating delegateURI node content to ensure matches observe
     *     the delegation test.
     * @returns {TP.lang.Hash} A hash of URI rewriting/routing information.
     * @todo
     */

    var cat,
        path,
        subcat,
        url,
        xml,

        list,
        len,
        i,
        elem,

        name,
        entry,
        mappings,

        dict,
        key,

        rewrites,

        catalog,
        delegates;

    TP.stop('break.uri_catalog');

    //  typically we'll be using a cached catalog, or a root catalog passed
    //  in so we can merge data with it properly
    cat = this.$get('uriCatalog') || aCatalog;

    if (TP.isURI(aURI)) {
        //  Expand and strip any fragment, we map to primary resources.
        path = TP.uriExpandPath(aURI.asString()).split('#').at(0);
        if (TP.isValid(cat)) {
            //  top level catalog exists, question is have we processed this
            //  particular subcatalog before?
            if (TP.isValid(subcat = cat.at(path))) {
                return subcat;
            } else {
                //  attempt to load the catalog file, must be valid XML
                if (TP.isURI(url = TP.uc(path))) {
                    xml = url.getNativeNode(
                                        TP.request(
                                            'no_rewrite', true,
                                            'shouldReport', false,
                                            'async', false));
                }

                if (TP.notValid(xml)) {
                    this.raise('TP.sig.InvalidXML',
                                'Catalog files must be valid XML.');

                    return;
                }
            }
        } else {
            //  no existing top-level catalog, we'll have to populate that
            //  one first and then redispatch.
            cat = TP.core.URI.$getURICatalog();
            if (TP.isValid(cat)) {
                //  redispatching this way should mean we take the other
                //  branch, check for having had the top-level catalog
                //  create the desired subcatalog already, or have the new
                //  URIs catalog data added to the overall catalog
                return TP.core.URI.$getURICatalog(aURI);
            } else {
                //  error creating top-level catalog...just complain and
                //  exit
                this.raise('TP.sig.InvalidCatalog',
                            'Unable to create top-level URI catalog.');

                return;
            }
        }
    } else {
        //  no uri means top-level catalog request. if that catalog already
        //  exists we can just return it
        if (TP.isValid(cat)) {
            return cat;
        }

        //  no catalog built yet, so build it from XML if we can find it
        cat = TP.hc();
        this.$set('uriCatalog', cat);

        //  no XML Catalog data so we have no entries to process
        xml = TP.sys.getURIXML();
        if (TP.notValid(xml)) {
            return cat;
        }
    }

    //  if we got XML then we have a couple of things we process, uri nodes
    //  which are unique mappings for a specific uri, rewriteURI nodes which
    //  are patterns for the rewriter, delegateURI nodes which point to
    //  another catalog for a specific pattern, and nextCatalog entries
    //  which point to generic add-on catalogs.

    list = TP.nodeGetElementsByTagName(xml, '*');
    len = list.getSize();

    for (i = 0; i < len; i++) {
        elem = list.at(i);

        switch (TP.elementGetLocalName(elem)) {
            case 'uri':

                //  URI entries map a URI to another when a particular set
                //  of conditions is true. There can be more than one entry
                //  for a particular URI however, since the conditions can
                //  vary. as a result we keep an array of possible mappings
                name = TP.uriExpandPath(elem.getAttribute('name'));

                //  may need to build if this is the first for this uri
                entry = cat.at(name) || TP.hc();
                mappings = entry.at('mappings') || TP.ac();

                //  get a hash from the element and use that to construct
                //  our key for testing...forcing the key to use regex
                //  wildcards where no values are found
                dict = TP.elementGetAttributes(elem);
                key = TP.core.URI.$getURIProfileKey(dict, true);
                mappings.push(TP.ac(key, dict, aFilter));

                //  ensure mapping array and entry are in catalog
                entry.atPut('mappings', mappings);
                cat.atPut(name, entry);

                break;

            case 'rewriteURI':

                //  rewrites are "catalog wide" since they're pattern-based.
                //  also, since they're order-dependent we can push them all
                //  into one list as long as we can remember if they're
                //  coming from a delegation or not
                rewrites = cat.at('rewrites') || TP.ac();

                //  get a hash from the element and use that to construct
                //  our key for testing...forcing the key to use regex
                //  wildcards where no values are found
                dict = TP.elementGetAttributes(elem);
                key = TP.core.URI.$getURIProfileKey(dict, true);
                rewrites.push(TP.ac(key, dict, aFilter));

                //  ensure mapping array and entry are in catalog
                cat.atPut('rewrites', rewrites);

                break;

            case 'delegateURI':

                //  delegations are regex matches which redirect mappings
                //  for a matching URI to a sub-catalog. TIBET also uses
                //  them as a way of defining a handler for a set of URIs
                //  matching the delegation test
                catalog = elem.getAttribute('catalog');
                if (TP.notEmpty(catalog)) {
                    //  force integration of the delegate map's entries,
                    //  flagging them with additional filtering via the
                    //  delegateURI 'tibet:uriMatchString' or
                    //  'uriStartString' value
                    TP.core.URI.$getURICatalog(
                        catalog,
                        cat,
                        elem.getAttribute('tibet:uriMatchString') ||
                        elem.getAttribute('uriStartString'));
                }

                //  Any attributes other than catalog will cause us to save
                //  the delegate entry for other lookup purposes.
                dict = TP.elementGetAttributes(elem);
                if (!dict.hasKey('catalog')) {
                    delegates = cat.at('delegations') || TP.ac();

                    key = TP.core.URI.$getURIProfileKey(dict, true);
                    delegates.push(TP.ac(key, dict, aFilter));

                    cat.atPut('delegations', delegates);
                }

                break;

            case 'nextCatalog':

                //  nextCatalog entries are a way to modularize a set of XML
                //  Catalog files. all we need to do is get the URI and ask
                //  for that catalog's content to be merged into the current
                //  catalog, usually the top-level catalog
                catalog = elem.getAttribute('catalog');
                TP.core.URI.$getURICatalog(catalog, cat);

                break;

            default:
                //  elements of other types aren't processed, just ignore
                break;
        }
    }

    return cat;
});

//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('$getURIEntry',
function(aURI) {

    /**
     * @name $getURIEntry
     * @synopsis Returns a catalog entry for the URI provided.
     * @description The return value from this method is a URI entry is
     *     populated with all <uri>, <delegateURI>, and <rewriteURI> nodes which
     *     match at the URI level. Any items with delegateURI filters in place
     *     will be trimmed if they don't match the concrete URI to ensure that
     *     by the time a rewrite or route call is invoked no additional
     *     filtering is required other than checking the current runtime
     *     profile.
     * @param {TP.core.URI|String} aURI A URI to obtain the catalog entry for.
     * @returns {TP.lang.Hash} A URI Catalog entry hash.
     */

    var cat,
        uri,
        url,
        entry,

        arr,

        count,
        len,
        i,

        str,
        re,
        hash,

        delegates,
        rewrites;

    TP.stop('break.uri_entry');

    //  NOTE that this will force catalog creation on first invocation
    cat = this.$getURICatalog();

    //  get a "normalized" representation of the URI so we avoid as many
    //  lookup problems around differing virtual prefixes as possible
    uri = TP.isString(aURI) ? TP.uc(aURI) : aURI;
    url = TP.uriExpandPath(uri.asString()).split('#').at(0);

    //  this entry will have the URI mappings in place since they can be
    //  sorted by uri to begin with, but delegateURI and rewriteURI entries
    //  can only be filtered once we've got this concrete URI to test
    entry = cat.at(url) || TP.hc();

    //  if we've already done this we'll have flagged the entry as having
    //  already been completed
    if (TP.isTrue(entry.get('$complete'))) {
        return entry;
    }

    //  filter any mapping entries whose filter (if there is one) doesn't
    //  actually match in practice
    if (TP.isArray(arr = entry.at('mappings'))) {
        count = 0;
        len = arr.getSize();

        for (i = 0; i < len; i++) {
            //  convert keys to regexes for faster testing later on. NOTE
            //  that we don't escape metachars here, we built this one so we
            //  know what it's asking for
            str = arr.at(i).at(0);
            re = TP.rc(str);
            arr.at(i).atPut(0, re);

            //  mappings are [key, hash, filter] where filter is delegateURI
            //  filter which may have applied to this mapping rule
            if (TP.notEmpty(str = arr.at(i).at(2))) {
                re = TP.rc(TP.regExpEscape(str));
                if (!re.test(url)) {
                    arr.atPut(i, null);
                    count++;
                }
            }
        }

        //  found something we nulled? compact the array to remove nulls
        if (count > 0) {
            arr.compact();
        }
    }

    //  get the list of all delegations from the catalog. we have to scan
    //  them to see if any match the uri in question
    if (TP.isArray(arr = cat.at('delegations'))) {
        len = arr.getSize();
        for (i = 0; i < len; i++) {
            //  if there's a filter entry it's because this entry came from
            //  a delegated catalog and needs filtering based on the
            //  original delegateURI tag
            if (TP.notEmpty(str = arr.at(i).at(2))) {
                re = TP.rc(TP.regExpEscape(str));
                if (!re.test(url)) {
                    continue;
                }
            }

            //  delegations are [key, hash, filter] so we want to check the
            //  hash for either a start or match string (indexOf vs. RegExp)
            hash = arr.at(i).at(1);
            if (TP.notEmpty(str = hash.at('uriStartString'))) {
                if (url.indexOf(str) !== 0) {
                    continue;
                }
            } else if (TP.notEmpty(str = hash.at('tibet:uriMatchString'))) {
                if (TP.notValid(re = TP.rc(str))) {
                    TP.ifWarn() ?
                        TP.warn('Invalid RegExp source: ' + str +
                                    ' in URI catalog.',
                                TP.LOG) : 0;

                    continue;
                }

                if (!re.test(url)) {
                    continue;
                }
            }

            //  seems to have gotten past our checks...add to
            //  entry...NOTE that this is the delegations list on the
            //  entry, not the catalog
            delegates = entry.at('delegations') || TP.ac();
            delegates.push(arr.at(i));
            entry.atPut('delegations', delegates);
        }
    }

    //  get the list of all rewrites from the catalog. we have to scan
    //  them to see if any match the uri in question
    if (TP.isArray(arr = cat.at('rewrites'))) {
        len = arr.getSize();
        for (i = 0; i < len; i++) {
            //  if there's a filter entry it's because this entry came from
            //  a delegated catalog and needs filtering based on the
            //  original delegateURI tag
            if (TP.notEmpty(str = arr.at(i).at(2))) {
                re = TP.rc(TP.regExpEscape(str));
                if (!re.test(url)) {
                    continue;
                }
            }

            //  rewrites are [key, hash, filter] so we want to check the
            //  hash for either a start or match string (indexOf vs. RegExp)
            hash = arr.at(i).at(1);
            if (TP.notEmpty(str = hash.at('uriStartString'))) {
                if (url.indexOf(str) !== 0) {
                    continue;
                }
            } else if (TP.notEmpty(str = hash.at('tibet:uriMatchString'))) {
                if (TP.notValid(re = TP.rc(str))) {
                    TP.ifWarn() ?
                        TP.warn('Invalid RegExp source: ' + str +
                                    ' in URI catalog.',
                                TP.LOG) : 0;

                    continue;
                }

                if (!re.test(url)) {
                    continue;
                }
            }

            //  seems to have gotten past our checks...add to
            //  entry...NOTE that this is the rewrites list on the
            //  entry, not the catalog
            rewrites = entry.at('rewrites') || TP.ac();
            rewrites.push(arr.at(i));
            entry.atPut('rewrites', rewrites);
        }
    }

    //  update entry to avoid reprocessing overhead on future calls
    entry.set('$complete', true);

    cat.atPut(url, entry);

    return entry;
});

//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('$getURIMapForKey',
function(url, entry, key) {

    /**
     * @name $getURIMapForKey
     * @param {String} url
     * @param {Object} entry
     * @param {String} key
     * @returns {TP.lang.Hash} A URI Catalog entry hash.
     * @abstract
     * @todo
     */

    var map,

        arr,

        len,
        i,

        hash,
        str,
        re;

    TP.stop('break.uri_map');

    //  construct empty map so we don't have to do this work twice
    map = TP.hc();
    entry.atPut(key, map);

    //  going to have to populate/filter the overall entry content so we
    //  get a specific entry for this particular profile

    //  when the URI's entry is built it sorts all elements matching this
    //  URI so we can loop to see if any fit this profile key...first one
    //  wins :)
    if (TP.isArray(arr = entry.at('mappings'))) {
        //  loop over individual entries to see if any of them match the
        //  current conditions/runtime settings
        len = arr.getSize();
        for (i = 0; i < len; i++) {
            //  for our purposes a <uri> entry becomes a regex built from
            //  the profile key for the entry and the uri to use if that
            //  profile is a match
            if (arr.at(i).at(0).test(key)) {
                //  found one...store the element hash so we can find it,
                //  using a key that'll tell us what kind it is
                map.atPut('mapping', arr.at(i).at(1));

                break;
            }
        }
    }

    //  check for overall regex rewrite rules that might alter the URI
    //  value. NOTE that these also have to respect current environment
    //  checks *and* match the URI itself
    if (TP.isArray(arr = entry.at('rewrites'))) {
        //  loop over rewrite rules and if any of the regexs match then
        //  perform the associated replacement
        len = arr.getSize();
        for (i = 0; i < len; i++) {
            //  for our purposes a <rewriteURI> entry becomes a regex built
            //  from the profile key for the entry and a test which should
            //  match the URI string. when both match we have a valid
            //  rewrite rule for this URI and profile
            if (arr.at(i).at(0).test(key)) {
                hash = arr.at(i).at(1);
                if (TP.notEmpty(str = hash.at('uriStartString'))) {
                    if (url.indexOf(str) === 0) {
                        map.atPut('rewrite', hash);
                        break;
                    }
                } else if (TP.notEmpty(str = hash.at('tibet:uriMatchString'))) {
                    if (TP.isRegExp(re = TP.rc(str))) {
                        if (re.test(url)) {
                            map.atPut('rewrite', hash);
                            break;
                        }
                    }
                }
            }
        }
    }

    //  check for overall regex delegation rules that might alter the
    //  handler. NOTE that these also have to respect current environment
    //  checks *and* match the URI itself
    if (TP.isArray(arr = entry.at('delegations'))) {
        //  loop over delegate rules and if any of the regexps match then
        //  perform the associated replacement
        len = arr.getSize();
        for (i = 0; i < len; i++) {
            //  for our purposes a <delegateURI> entry becomes a regex built
            //  from the profile key for the entry and a regex which should
            //  match the URI string. when both match we have a valid
            //  delegation rule for this URI and profile
            if (arr.at(i).at(0).test(key)) {
                hash = arr.at(i).at(1);

                //  if this delegation rule isn't about mapping some kind of
                //  handler or controller then skip to next one
                if (TP.isEmpty(hash.at('tibet:urihandler')) &&
                    TP.isEmpty(hash.at('tibet:contenthandler')) &&
                    TP.isEmpty(hash.at('tibet:uricontroller'))) {
                    continue;
                }

                if (TP.notEmpty(str = hash.at('uriStartString'))) {
                    if (url.indexOf(str) === 0) {
                        map.atPut('delegate', hash);
                        break;
                    }
                } else if (TP.notEmpty(
                            str = hash.at('tibet:uriMatchString'))) {
                    if (TP.isRegExp(re = TP.rc(str))) {
                        if (re.test(url)) {
                            map.atPut('delegate', hash);
                            break;
                        }
                    }
                }
            }
        }
    }

    return map;
});

//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('$getURIProfile',
function(forceRefresh) {

    /**
     * @name $getURIProfile
     * @synopsis Returns the current runtime environment profile, a hash of
     *     key/value pairs defining the current runtime state that should be
     *     used when rewriting URIs.
     * @description The 'key' entry in this hash provides a string
     *     representation of the current profile that is useful for testing URI
     *     mappings for matching rules. The return value is cached as
     *     TP.sys.cfg('tibet.uriprofile') to avoid having to rebuild this
     *     information too often.
     * @param {Boolean} forceRefresh True to ignore any current setting and
     *     rebuild it.
     * @returns {TP.lang.Hash} The shared hash.
     */

    var hash,

        tpuser,

        unit,
        role,
        user,

        key;

    TP.stop('break.uri_profile');

    //  NOTE that this profile is cached under tibet.uriprofile so it can be
    //  looked up only when it's changing
    hash = TP.sys.cfg('tibet.uriprofile');
    if (TP.isValid(hash) && TP.notTrue(forceRefresh)) {
        return hash;
    }

    //  didn't find one, so we'll build it. NOTE that the keys we use here
    //  are those found in the XML as well so that a profile hash can be
    //  built from the elements in the XML Catalog quickly.
    hash = TP.hc();

    hash.atPut('xml:lang', TP.sys.getTargetLanguage());
    hash.atPut('tibet:browser', TP.sys.env('tibet.browser'));
    hash.atPut('tibet:browserUI', TP.sys.env('tibet.browserUI'));

    hash.atPut('tibet:env', TP.sys.getProfile());
    hash.atPut('tibet:state', TP.sys.getState());
    hash.atPut('tibet:offline', TP.str(TP.sys.isOffline()));

    if (TP.isValid(tpuser = TP.sys.getEffectiveUser())) {
        unit = tpuser.getPrimaryUnit();
        hash.atPut('tibet:unit',
                    TP.notValid(unit) ? 'ANY' : unit.getID());

        role = tpuser.getPrimaryRole();
        hash.atPut('tibet:role',
                    TP.notValid(role) ? 'ANY' : role.getID());

        user = tpuser.getID();
        hash.atPut('tibet:user',
                    TP.notValid(tpuser) ? 'ANY' : user.getID());
    } else {
        hash.atPut('tibet:unit', 'ANY');
        hash.atPut('tibet:role', 'ANY');
        hash.atPut('tibet:user', 'ANY');
    }

    //  recompute a key from our hash values in standard form and force
    //  explicit values, not wildcarding to be used to build this key
    key = TP.core.URI.$getURIProfileKey(hash, false);

    //  store the key along with the data that constructed it in the hash
    hash.atPut('key', key);

    //  cache so we only build this once per application if things aren't
    //  changing in the environment profile
    TP.sys.setcfg('tibet.uriprofile', hash);

    return hash;
});

//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('$getURIProfileKey',
function(aProfile, useWildcards) {

    /**
     * @name $getURIProfileKey
     * @synopsis Returns the normalized (standard order) key string used when
     *     testing for URI map entries.
     * @description The key is built using the data found in the profile
     *     provided, which should include keys matching those available in
     *     TIBET's extended XML Catalog file format. The second parameter
     *     determines whether missing keys are defaulted to the values at the
     *     time of the call or wildcarded for use in testing against a range.
     * @param {TP.lang.Hash} aProfile A hash providing parameters. These values
     *     default to their current runtime states. Keys include:
     *     'tibet:browser'. 'tibet:browserUI'. 'tibet:offline', 'tibet:env',
     *     'tibet:state', 'tibet:unit', 'tibet:role', 'tibet:user', 'xml:lang'.
     * @param {Boolean} useWildcards True if the returned string has wildcards
     *     in places where no value was found.
     * @returns {String} A map key string in one of two forms, regex form used
     *     for testing, or static form.
     * @todo
     */

    var profile,
        wildcards,

        key,

        browser,
        browserUI,

        off,

        env,
        state,

        lang,

        unit,
        tpuser,
        role,
        user;

    TP.stop('break.uri_profile');

    //  profile defaults to current runtime profile
    profile = aProfile || TP.core.URI.$getURIProfile();
    wildcards = TP.isTrue(useWildcards);

    //  may have cached it with the hash during an earlier process, in which
    //  case we can avoid reconstruction
    if (TP.isValid(key = profile.at('key'))) {
        return key;
    }

    browser = profile.atIfInvalid('tibet:browser',
        wildcards ? '([^_]+)' : TP.sys.env('tibet.browser'));
    browserUI = profile.atIfInvalid('tibet:browserUI',
        wildcards ? '([^_]+)' : TP.sys.env('tibet.browserUI'));
    off = TP.str(profile.atIfInvalid('tibet:offline',
        wildcards ? '([^_]+)' : TP.sys.isOffline()));
    //env = profile.atIfInvalid('tibet:env',
    //    wildcards ? '([^_]+)' : TP.sys.getProfile());
    env = 'ANY';
    state = profile.atIfInvalid('tibet:state',
        wildcards ? '([^_]+)' : TP.sys.getState());
    state = TP.isEmpty(state) ? 'ANY' : state;
    lang = profile.atIfInvalid('xml:lang',
        wildcards ? '([^_]+)' : TP.sys.getTargetLanguage());
    lang = TP.isEmpty(lang) ? 'ANY' : lang;

    //  we cache the values for 'unit', 'role', and 'user' as 'cfg()' values
    //  because the performance implications, particularly during startup, are
    //  profound.

    if (TP.isEmpty(unit = profile.at('tibet:unit'))) {
        if (TP.isEmpty(unit = TP.sys.cfg('tibet.uriprofile.unit'))) {
            if (TP.isValid(tpuser = TP.sys.getEffectiveUser())) {
                unit = tpuser.getPrimaryUnit();
                unit = TP.notValid(unit) ? '' : unit.getID();
                TP.sys.setcfg('tibet.uriprofile.unit', unit);
            }
        }

        unit = TP.isEmpty(unit) && wildcards ? '([^_]+)' : unit;
    }

    if (TP.isEmpty(role = profile.at('tibet:role'))) {
        if (TP.isEmpty(role = TP.sys.cfg('tibet.uriprofile.role'))) {
            if (TP.isValid(tpuser = TP.sys.getEffectiveUser())) {
                role = tpuser.getPrimaryRole();
                role = TP.notValid(role) ? '' : role.getID();
                TP.sys.setcfg('tibet.uriprofile.role', role);
            }
        }

        role = TP.isEmpty(role) && wildcards ? '([^_]+)' : role;
    }

    if (TP.isEmpty(user = profile.at('tibet:user'))) {
        if (TP.isEmpty(user = TP.sys.cfg('tibet.uriprofile.user'))) {
            if (TP.isValid(tpuser = TP.sys.getEffectiveUser())) {
                user = tpuser.getID();
                TP.sys.setcfg('tibet.uriprofile.user', user);
            }
        }

        user = TP.isEmpty(user) && wildcards ? '([^_]+)' : user;
    }

    //  our key is always in the same order to 'normalize' it. the join
    //  characters are intended to support valid Js identifier form that can
    //  also be used as part of a regular expression test() invocation
    key = TP.ac(browser, browserUI,
                off, env, state, lang,
                unit, role, user).join('_');

    profile.atPut('key', key);

    return key;
});

//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('rewrite',
function(aURI, aRequest) {

    /**
     * @name rewrite
     * @synopsis Rewrites the incoming URI as appropriate by invoking the
     *     current TP.sys.cfg('uri.rewriter') responsible for URI rewriting.
     * @description The default is the TP.core.URIRewriter type, which leverages
     *     data in an XML Catalog file (typically uris.xml). This rewriting step
     *     is performed prior to any operations which require a URI handler such
     *     as load or save.
     * @param {TP.core.URI|String} aURI The URI to rewrite.
     * @param {TP.sig.Request} aRequest An optional request whose values may
     *     inform the rewrite.
     * @returns {TP.core.URI} The rewritten URI in TP.core.URI form.
     * @todo
     */

    var rewriter,
        type;

    TP.stop('break.uri_rewrite');

    rewriter = TP.sys.cfg('uri.rewriter');
    type = TP.sys.require(rewriter);

    if (TP.canInvoke(type, 'rewrite')) {
        return type.rewrite(aURI, aRequest);
    } else {
        TP.ifWarn() ?
            TP.warn('URI rewriter: ' + rewriter +
                        ' does not support rewrite(); using default.',
                    TP.IO_LOG) : 0;

        return TP.core.URIRewriter.rewrite(aURI, aRequest);
    }
});

//  ------------------------------------------------------------------------

TP.core.URI.Type.defineMethod('route',
function(aURI, aRequest) {

    /**
     * @name route
     * @synopsis Routes the operation implied by any data in aRequest to a
     *     viable handler for the URI and request.
     * @description This typically results in the request being passed to a
     *     TP.core.URIHandler type/subtype. Note that the URI is expected to
     *     have been rewritten as needed prior to this call so that the route is
     *     appropriate for the concrete URI being accessed.
     * @param {TP.core.URI|String} aURI The URI to route.
     * @param {TP.sig.Request} aRequest The request whose values should inform
     *     the routing assignment.
     * @returns {TP.lang.RootObject.<TP.core.URIHandler>} A TP.core.URIHandler
     *     subtype type object that can handle the request for the supplied URI.
     * @todo
     */

    var router,
        type;

    TP.stop('break.uri_route');

    router = TP.sys.cfg('uri.router');
    type = TP.sys.require(router);

    if (TP.canInvoke(type, 'route')) {
        return type.route(aURI, aRequest);
    } else {
        TP.ifWarn() ?
            TP.warn('URI router: ' + router +
                    ' does not support route(); using default.',
                    TP.IO_LOG) : 0;

        return TP.core.URIRouter.route(aURI, aRequest);
    }
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the receiver's copy of the original uri used for construction if any,
//  and a decoded variant of that for normal use
TP.core.URI.Inst.defineAttribute('uri');
TP.core.URI.Inst.defineAttribute('decoded');

//  the primary href, the portion in front of any # fragment, and any
//  associated TP.core.URI instance constructed to reference it.
TP.core.URI.Inst.defineAttribute('primaryHref');
TP.core.URI.Inst.defineAttribute('primaryURI');

//  any potentially cached fragment portion. NOTE that caching the fragment
//  portion is a bit dicey since it can be manipulated by various means and
//  must be keep synchronized in such cases.
TP.core.URI.Inst.defineAttribute('fragment');

//  whether the receiver is HTTP-based
TP.core.URI.Inst.defineAttribute('httpBased');

//  the resource object for the primary href
TP.core.URI.Inst.defineAttribute('resource');
TP.core.URI.Inst.defineAttribute('resourceCache');

//  holder for this instance's uri lookup properties
TP.core.URI.Inst.defineAttribute('uriNodes');
TP.core.URI.Inst.defineAttribute('uriRegex');

//  the scheme which was actually used for this instance, usually the same
//  as the scheme for the type.
TP.core.URI.Inst.defineAttribute('scheme');

//  the portion of the URI without the scheme. this is the string parsed by
//  the scheme-specific parsing logic.
TP.core.URI.Inst.defineAttribute('schemeSpecificPart');

//  a container for any headers associated with this instance.  Note that
//  while only HTTP uris are likely to have true headers TIBET can leverage
//  this structure for other URIs to achieve similar results.
TP.core.URI.Inst.defineAttribute('headers');

//  cached date instance for last update time
TP.core.URI.Inst.defineAttribute('lastUpdated', null);

//  flag controlling expiration overrides
TP.core.URI.Inst.defineAttribute('expired', false);

//  cached data on whether this URI exists so we can avoid checking too
//  often. NOTE that we start out null so we don't imply a true/false
TP.core.URI.Inst.defineAttribute('found', null);

//  content change tracking flag
TP.core.URI.Inst.defineAttribute('$dirty', false);

//  load status flag
TP.core.URI.Inst.defineAttribute('$loaded', false);

//  uri mapping/rewriting flag
TP.core.URI.Inst.defineAttribute('$mapped', null);

//  the default MIME type for this instance
TP.core.URI.Inst.defineAttribute('defaultMIMEType');

//  the computed MIME type for this instance
TP.core.URI.Inst.defineAttribute('computedMIMEType');

//  the controller instance for this instance
TP.core.URI.Inst.defineAttribute('controller');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('init',
function(aURIString) {

    /**
     * @name init
     * @synopsis Initialize the instance. A key piece of the processing here is
     *     breaking the string into scheme and scheme-specific-part and then
     *     letting each subtype parse the URI components based on
     *     scheme-specific rules.
     * @param {String} aURIString A String containing a proper URI.
     * @returns {TP.core.URI} The receiver.
     */

    var index,
        ssp,
        parts;

    this.callNextMethod();

    //  break the URI string into scheme and scheme-specific-part and then
    //  let the particular type parse the URI components based on
    //  scheme-specific parsing rules.

    index = aURIString.indexOf(':');

    this.$set('uri', aURIString);
    this.$set('scheme', aURIString.slice(0, index));

    ssp = aURIString.slice(index + 1);
    this.$set('schemeSpecificPart', ssp);

    //  defer to other methods to handle things each subtype likely needs to
    //  override to finalize instance initialization.
    parts = this.$parseSchemeSpecificPart(ssp);
    this.$initURIComponents(parts);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('addResource',
function(existingResource, newResource, aRequest) {

    /**
     * @name addResource
     * @synopsis Adds to the receiver's resource object, the object TIBET will
     *     treat as the resource for any subsequent processing.
     * @param {Object} existingResource The existing resource assigned to this
     *     object, if available.
     * @param {Object} newResource The resource object to add to the resource of
     *     the receiver.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     optional parameters.
     * @returns {TP.core.URL|TP.sig.Response} The receiver or a TP.sig.Response
     *     when the resource must be acquired in an async fashion prior to
     *     setting any fragment value.
     * @todo
     */

    var retVal;

    if (TP.canInvoke(existingResource, 'addContent')) {
        //  Note that we do not pass in aRequest as the second parameter here.
        //  This matches the 'set content' call in $setResultContent().
        retVal = existingResource.addContent(newResource);
    } else if (TP.canInvoke(existingResource, 'add')) {
        retVal = existingResource.add(newResource);
    } else {
        retVal = this.setResource(TP.str(existingResource) +
                                    TP.str(newResource));
    }

    aRequest.complete(retVal);

    return retVal;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('$initURIComponents',
function(parts) {

    /**
     * @name $initURIComponents
     * @synopsis Performs any post-parsing initialization appropriate for the
     *     URI components which were parsed during scheme-specific parsing. The
     *     default routine simply returns.
     * @param {TP.lang.Hash} parts The parsed URI components.
     * @returns {TP.core.URI} The receiver.
     * @todo
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('$parseSchemeSpecificPart',
function(schemeSpecificString) {

    /**
     * @name $parseSchemeSpecificPart
     * @synopsis Parses inbound URI string content in a fashion specific to the
     *     scheme(s) being managed by the receiver. The baseline version ensures
     *     that the primary/fragment portions are properly parsed and stored,
     *     all other processing of the primary href and/or fragment should be
     *     done via override.
     * @param {String} schemeSpecificString A String containing the
     *     "scheme-specific-part" of a URI.
     * @returns {TP.lang.Hash} The parsed URI 'components'.
     */

    var primaryHref,
        fragment;

    TP.stop('break.uri_parse');

    if (TP.isEmpty(schemeSpecificString)) {
        return;
    }

    if (schemeSpecificString.indexOf('#') !== TP.NOT_FOUND) {
        primaryHref = schemeSpecificString.slice(
                        0, schemeSpecificString.indexOf('#'));

        this.$set('primaryHref',
                    TP.join(this.$get('scheme'), ':', primaryHref));

        if (TP.notEmpty(fragment = schemeSpecificString.slice(
                                    schemeSpecificString.indexOf('#') + 1))) {
            this.$set('fragment', fragment);
        }
    } else {
        this.$set('primaryHref',
                    TP.join(this.$get('scheme'), ':', schemeSpecificString));
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('constructRequest',
function(aRequest) {

    /**
     * @name constructRequest
     * @synopsis Constructs a viable request for URI processing using any
     *     optionally provided request as input. If the request provided is
     *     truly a TP.sig.Request then the original request is simply returned
     *     for use.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional object defining
     *     control parameters.
     * @returns {TP.sig.Request} The original request or a suitable new request
     *     for use.
     * @todo
     */

    return TP.request(aRequest);
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('constructSubRequest',
function(aRequest) {

    /**
     * @name constructSubRequest
     * @synopsis Constructs a subrequest for URI processing using any optionally
     *     provided request as input.
     * @description Subrequest creation differs from 'root' request creation in
     *     that subrequests are always new request objects which simply use the
     *     original request payload (when available).
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional object defining
     *     control parameters.
     * @returns {TP.sig.Request} The original request or a suitable new request
     *     for use.
     * @todo
     */

    var subrequest,
        payload;

    //  If we're going to have to request the data then the key thing we
    //  want to avoid is having an incoming request complete() before the
    //  entire process is finished. That means ensuring we have a clean
    //  subrequest instance we can locally modify.
    if (TP.canInvoke(aRequest, 'getPayload')) {
        payload = aRequest.getPayload();
        if (TP.isValid(payload)) {
            subrequest = TP.sig.Request.construct(payload.copy());
        } else {
            subrequest = TP.sig.Request.construct();
        }
    } else {
        subrequest = TP.sig.Request.construct(aRequest);
    }

    return subrequest;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('asDumpString',
function() {

    /**
     * @name asDumpString
     * @synopsis Returns the receiver as a string suitable for use in log
     *     output.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var str;

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asDumpString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    this.$$format_asDumpString = true;

    try {
        str = TP.tname(this) +
                    ' :: ' +
                    '(' + TP.str(this.getLocation()) + ')';
    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    delete this.$$format_asDumpString;

    return str;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @name asHTMLString
     * @synopsis Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    return '<span class="TP_core_URI ' +
                TP.escapeTypeName(TP.tname(this)) + '">' +
            TP.htmlstr(this.asString()) +
            '<\/span>';
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @name asJSONSource
     * @synopsis Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    return '{"type":' + TP.tname(this).quoted('"') + ',' +
             '"data":' + this.asString().quoted('"') + '}';
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @name asPrettyString
     * @synopsis Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    return '<dl class="pretty ' +
                TP.escapeTypeName(TP.tname(this)) +
            '"><dt\/><dd>' +
            TP.pretty(this.asString()) +
            '<\/dd><\/dl>';
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @name asString
     * @synopsis Returns a string representation of the receiver.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.core.URI's String representation. This flag is ignored in
     *     this version of this method.
     * @returns {String} The receiver's String representation.
     */

    return TP.str(this.getLocation());
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('asSource',
function() {

    /**
     * @name asSource
     * @synopsis Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    return 'TP.uc(\'' + this.getLocation() + '\')';
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('asXMLString',
function() {

    /**
     * @name asXMLString
     * @synopsis Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    return '<instance type="' + TP.tname(this) + '">' +
                    TP.xmlstr(this.asString()) +
                    '<\/instance>';
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('asTP_core_URI',
function() {

    /**
     * @name asTP_core_URI
     * @synopsis Returns the receiver.
     * @returns {TP.core.URI}
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('clearCaches',
function() {

    /**
     * @name clearCaches
     * @synopsis Clears any content caches related to the receiver, returning
     *     things to their pre-loaded state. For URIs with a separate resource
     *     URI this will also clear the resource URI's caches.
     * @returns {TP.core.URI} The receiver.
     */

    var url;

    //  clear our simple content caches
    this.$clearCaches();

    //  TODO:   should we put this behind a "deep" parameter?
    if ((url = this.getPrimaryURI()) !== this) {
        url.clearCaches();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('$clearCaches',
function() {

    /**
     * @name $clearCaches
     * @synopsis Clears the internal caches of the receiver. This method is
     *     expected to be overridden by subtypes so they can clear any
     *     specialized cache data, but it should be invoked by any overriding
     *     method.
     * @returns {TP.core.URI} The receiver.
     */

    var resource;

    TP.ifTrace() ?
        TP.sys.logTransform('Clearing content cache for: ' + this.getID(),
            TP.TRACE) : 0;

    if (TP.isValid(resource = this.get('resource'))) {
        this.ignore(resource, 'Change');
    }

    //  empty the resource cache(s) - note that we *must* use $set() here to
    //  avoid all of the ID comparison and change notification machinery in the
    //  regular 'setResource' call.
    this.$set('resource', null);

    //  update expiration status as well as any potentially obsolete headers
    this.set('headers', null);
    this.$set('expired', false);

    //  clear any internal state flags that might cause issues reloading
    this.set('$dirty', false);
    this.set('$loaded', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('empty',
function() {

    /**
     * @name empty
     * @synopsis Clears any stored content of the receiver, or of it's resource
     *     URI if it has one which stores its data. Note that only the data is
     *     cleared, not the remaining cache data such as headers etc. This
     *     operation dirties the receiver.
     * @returns {TP.core.URI} The receiver.
     */

    var url;

    //  TODO: should this only happen when "deep" parameter would be true?
    if ((url = this.getPrimaryURI()) !== this) {
        url.empty();
    }

    //  Clear the actual data cache. This clears the data, but nothing else.
    this.set('resource', null);

    //  Dirty the receiver. The presumption is that a URI with content that
    //  we empty is now ready to be saved with new content of ''/null.
    this.set('$dirty', true);
    this.set('$loaded', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('equalTo',
function(aURI) {

    /**
     * @name equalTo
     * @synopsis Two URLs are considered equal if their locations are equal.
     * @param {TP.core.URI|String} aURI The URI to compare.
     * @returns {Boolean} Whether or not the receiver is equal to the passed in
     *     parameter.
     */

    var uri;

    if (TP.isString(aURI)) {
        uri = TP.uc(aURI);
        if (TP.notValid(uri)) {
            return false;
        }
    } else if (TP.canInvoke(aURI, 'getLocation')) {
        uri = aURI;
    } else {
        return false;
    }

    return this.getLocation().equalTo(uri.getLocation());
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('expire',
function(aFlag) {

    /**
     * @name expire
     * @synopsis Sets the expiration flag for the receiver to true, forcing a
     *     one-time override of any computation-based expiration.
     * @param {Boolean} aFlag The value to set the expiration flag to. Defaults
     *     to true.
     * @todo
     */

    var url;

    //  When there's a primary URI we defer entirely to that URI since all
    //  core data caches are managed by the primary.
    if ((url = this.getPrimaryURI()) !== this) {
        url.expire(aFlag);
        return url.isExpired();
    }

    this.$set('expired', TP.ifInvalid(aFlag, true));
    return this.isExpired();
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('getContent',
function(aRequest) {

    /**
     * @name getContent
     * @synopsis Returns the actual content of the resource referenced by the
     *     receiver. The basic approach is to invoke a getResource() operation
     *     to get the resource, then invoke getContent() on that resource to
     *     acquire its content.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {Object} The receiver's resource object.
     */

    return this.$requestContent(aRequest,
                                'getResource',
                                '$getResultContent');
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('getContentNode',
function(aRequest) {

    /**
     * @name getContentNode
     * @synopsis Returns the content of the receiver's resource in native Node
     *     form. Note that like all variants of getContent* this method can be
     *     asynchronous.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional object
     *     defining control parameters.
     * @returns {Node} The receiver's content in node form.
     * @todo
     */

    var request;

    request = this.constructRequest(aRequest);
    request.atPut('resultType', TP.DOM);

    return this.getContent(request);
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('getContentText',
function(aRequest) {

    /**
     * @name getContentText
     * @synopsis Returns the content of the receiver's resource in text (String)
     *     form. Note that like all variants of getContent* this method can be
     *     asynchronous.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional object
     *     defining control parameters.
     * @returns {String} The receiver's content in text form.
     * @todo
     */

    var request;

    request = this.constructRequest(aRequest);
    request.atPut('resultType', TP.TEXT);

    return this.getContent(request);
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('getController',
function(aTypeName) {

    /**
     * @name getController
     * @synopsis Returns the URI controller associated with the receiver.
     * @param {String} aTypeName The type name of the controller to use. This is
     *     an optional parameter and, if not supplied and the receiver is a
     *     'mapped' URI then this method will attempt to use the URI map to
     *     determine the controller type.
     * @returns {Object} The receiver's URI controller object.
     * @todo
     */

    var controller,
        controllerType,

        entry,
        key,
        path,
        map,

        item,

        mappedType;

    if (TP.notValid(controller = this.$get('controller'))) {
        //  First, check to see if the supplied type name is a real TIBET
        //  type. If it is not, then we default the type and check the URI
        //  map.
        if (!TP.isType(controllerType = TP.sys.getTypeByName(aTypeName))) {
            //  Set the controller type to the base type. If we fail to find
            //  a map entry below, we'll just use this type.
            controllerType = TP.core.URIController;

            //  check on uri mapping to see if the URI maps define a wrapper
            if (TP.notFalse(this.isMappedURI())) {
                entry = TP.core.URI.$getURIEntry(this);

                //  the entry for the URI caches lookup results by 'profile'
                //  key so we need to get that to see if a content handler
                //  was defined. by passing no profile we get the one for
                //  the current runtime environment, and we turn off
                //  wildcard generation to get explicit values
                key = TP.core.URI.$getURIProfileKey(null, false);

                if (TP.notValid(map = entry.at(key))) {
                    path = TP.uriExpandPath(
                                    this.asString()).split('#').at(0);
                    map = TP.core.URI.$getURIMapForKey(path, entry, key);
                }

                if (TP.isValid(map)) {
                    if (TP.isValid(item = map.at('mapping'))) {
                        mappedType = TP.sys.getTypeByName(
                                        item.at('tibet:uricontroller'));
                    } else if (TP.isValid(item = map.at('delegate'))) {
                        mappedType = TP.sys.getTypeByName(
                                        item.at('tibet:uricontroller'));
                    }
                }

                if (TP.isType(mappedType)) {
                    controllerType = mappedType;
                }
            }
        }

        controller = controllerType.construct();
        this.set('controller', controller);

        controller.set('uri', this);
    }

    return controller;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('$getDefaultHandler',
function(aRequest) {

    /**
     * @name $getDefaultHandler
     * @synopsis Returns the default handler for a URI and request pair. This is
     *     typically the type defined by TP.sys.cfg('uri.handler'), which
     *     defaults to TP.core.URIHandler. The returned type must respond to the
     *     route method to be a valid handler.
     * @param {TP.sig.Request} aRequest The request whose values should inform
     *     the routing assignment.
     * @returns {TP.lang.RootObject.<TP.core.URIHandler>} A TP.core.URIHandler
     *     subtype type object or a type object conforming to that interface.
     * @todo
     */

    return this.getType().$getDefaultHandler(this, aRequest);
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('$getFilteredResult',
function(anObject, resultType, collapse) {

    /**
     * @name $getFilteredResult
     * @synopsis Processes a value to ensure it matches a request's stated
     *     resultType preferences. When the data doesn't match that preference a
     *     conversion is attempted and the return value of that conversion is
     *     returned.
     * @description If the data can't be converted properly this method returns
     *     undefined. If no resultType is specified then a "best fit" result is
     *     returned. The best fit result processing attempts to construct a
     *     valid TP.core.Node, then a viable JavaScript object by parsing for
     *     JSON strings, and finally just the object itself.
     * @param {Object} anObject The object to "type check".
     * @param {Number} resultType TP.DOM|TP.TEXT|TP.WRAP|TP.BEST. The default is
     *     to avoid repackaging the result object other than to optionally
     *     collapse it.
     * @param {Boolean} collapse False to skip collapsing node lists to a single
     *     node.
     * @returns {Object} The desired return value type.
     * @todo
     */

    var obj;

    TP.stop('break.uri_filter');

    if (TP.isValid(anObject)) {
        switch (resultType) {
            case TP.DOM:

                if (TP.notFalse(collapse)) {
                    obj = TP.collapse(anObject);
                    if (TP.isValid(obj)) {
                        obj = TP.node(obj, null, false);
                    }
                } else {
                    obj = TP.node(anObject, null, false);
                }
                return obj;

            case TP.TEXT:

                if (TP.notFalse(collapse)) {
                    obj = TP.collapse(anObject);
                    if (TP.isValid(obj)) {
                        obj = TP.str(obj);
                    } else {
                        obj = '';
                    }
                } else {
                    obj = TP.str(anObject);
                }
                return obj;

            case TP.BEST:

                //  The semantics of TP.BEST in all other contexts is that
                //  you get a DOM node if possible, otherwise you get a
                //  string if possible, otherwise you get a null.
                if (TP.notFalse(collapse)) {
                    obj = TP.collapse(anObject);
                    if (TP.isValid(obj)) {
                        obj = TP.node(obj, null, false);
                    }

                    if (TP.notValid(
                        obj = TP.node(TP.collapse(anObject), null, false))) {
                        obj = TP.str(TP.collapse(anObject));
                    }
                } else {
                    if (TP.notValid(obj = TP.node(anObject, null, false))) {
                        obj = TP.str(anObject);
                    }
                }
                return obj;

            case TP.WRAP:

                //  don't want to convert anything that's already in
                //  reasonable object form...so the primary test is whether
                //  the object is a string that might be parseable into a
                //  more object form
                if (TP.isString(anObject)) {
                    //  mirror "best" in some sense, attempting to find XML,
                    //  then JSON, then any parseable object we might be
                    //  able to detect.
                    if (TP.notValid(obj = TP.tpnode(anObject, null, false)) ||
                        TP.isTextNode(obj)) {
                        //  json?
                        if (TP.notValid(obj = TP.json2js(
                                                anObject, null, false))) {
                            //  date or other parsable object?
                            if (TP.notValid(obj =
                                            TP.parse('Date', anObject))) {
                                //  default back to original object. not
                                //  great, but apparently it's not parseable
                                obj = anObject;
                            }
                        }
                    }

                    if (TP.notFalse(collapse)) {
                        obj = TP.collapse(obj);
                    }
                } else if (TP.isNode(anObject)) {
                    obj = anObject;
                    if (TP.notFalse(collapse)) {
                        obj = TP.collapse(obj);
                    }

                    obj = TP.tpnode(obj);
                } else {
                    obj = anObject;
                    if (TP.notFalse(collapse)) {
                        obj = TP.collapse(obj);
                    }

                    obj = TP.wrap(obj);

                    if (TP.notValid(obj)) {
                        obj = anObject;
                        if (TP.notFalse(collapse)) {
                            obj = TP.collapse(obj);
                        }
                    }
                }
                return obj;

            default:
                //  default is no filtering
                return anObject;
        }
    }

    //  There was no valid object - return null
    return null;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('getFragment',
function() {

    /**
     * @name getFragment
     * @synopsis Returns the fragment portion of the receiver as a String.
     * @returns {String} The fragment string.
     */

    //  NOTE that we rely on the initial parse operation to populate any
    //  fragment portion, otherwise we'd be recomputing.
    return this.$get('fragment');
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('getHeader',
function(aHeaderName) {

    /**
     * @name getHeader
     * @synopsis Returns the value of the named header, or null if the header
     *     value isn't found.
     * @param {String} aHeaderName The name of the header to retrieve.
     * @returns {String} The value of the header named with the supplied name.
     */

    var dict;

    dict = this.$get('headers');
    if (TP.isEmpty(dict)) {
        return;
    }

    return dict.at(aHeaderName);
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('getID',
function() {

    /**
     * @name getID
     * @synopsis Returns the ID of the receiver, which for URIs is their URI in
     *     a fully-expanded format so minor variations in syntax are removed.
     * @returns {String}
     */

    var id;

    //  first question is do we have our *own* id (otherwise, we'll report the
    //  value inherited from the prototype)
    if (TP.owns(this, TP.ID)) {
        return this.$get(TP.ID);
    }

    id = this.getLocation();
    this.$set(TP.ID, id);

    return id;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('getLastUpdateDate',
function() {

    /**
     * @name getLastUpdateDate
     * @synopsis Returns the last update time for the receiver as recorded in
     *     the URI's header content -- specifically the Date header.
     * @returns {Date} The date the receiver was last updated.
     */

    var dateStr,
        theDate;

    if (TP.notEmpty(theDate = this.$get('lastUpdated'))) {
        return theDate;
    }

    dateStr = this.getHeader('Date');
    if (TP.notEmpty(dateStr)) {
        theDate = Date.from(dateStr);
    } else {
        TP.ifTrace(TP.$DEBUG && TP.$VERBOSE) ?
            TP.trace(this.getID() +
                            ' has no Last-Updated information',
                        TP.LOG) : 0;
        return;
    }

    TP.ifTrace(TP.$DEBUG && TP.$VERBOSE) ?
        TP.trace(this.getID() +
                        ' returning cached Last-Updated: ' +
                        theDate,
                    TP.LOG) : 0;

    this.$set('lastUpdated', theDate);

    return theDate;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('getLocalPath',
function() {

    /**
     * @name getLocalPath
     * @synopsis Returns the locally-formatted absolute path to the URI's
     *     resource.
     * @description Note that no rewriting is performed in the production of
     *     this value. The returned URI is simply adjusted for the current
     *     platform's semantics.
     * @returns {String} The receiver's local path.
     */

    return TP.uriInLocalFormat(this.getLocation());
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('getLocation',
function() {

    /**
     * @name getLocation
     * @synopsis Returns the true location of the URI. For most URIs this value
     *     is the same as the original URI, but for virtual URIs it represents
     *     the expanded URI value.
     * @returns {String} The receiver's location.
     */

    var url;

    if (TP.notValid(url = this.$get('decoded'))) {
        url = decodeURI(this.$get('uri'));
        this.$set('decoded', url);
    }

    return url;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('getName',
function() {

    /**
     * @name getName
     * @synopsis An override of the getName() operation that returns the
     *     receiver's *OID* as the 'Name'. This is necessary because this type
     *     override's getID() (normally used by the getName() method) to return
     *     special IDs for URIs.
     * @returns {String} The receiver's name.
     */

    return this.$getOID();
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('getNativeObject',
function() {

    /**
     * @name getNativeObject
     * @synopsis Returns the native object that the receiver is wrapping. In the
     *     case of TP.core.URIs, this is the receiver's string instance.
     * @returns {String} The receiver's native object.
     */

    return this.getLocation();
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('getPrimaryHref',
function() {

    /**
     * @name getPrimaryHref
     * @synopsis Returns the primary resource's href as a String. This is the
     *     portion of the URI which isn't qualified by a fragment, the portion
     *     you can send to a server without causing an error.
     * @returns {String} The primary href as a String.
     */

    var str;

    //  If we have a locally cached value return that. We only compute this
    //  when the receiver didn't defer to a primary URI.
    if (TP.notEmpty(str = this.$get('primaryHref'))) {
        return str;
    }

    //  Fully expand and then trim off any fragment portion.
    str = this.getLocation();
    if (this.hasFragment()) {
        str = str.split('#').at(0);
    }

    this.$set('primaryHref', str);

    return str;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('$getPrimaryResource',
function(aRequest, filterResult) {

    /**
     * @name $getPrimaryResource
     * @synopsis Returns a receiver-specific object representing the "primary"
     *     resource being accessed (i.e. the resource referenced by the base
     *     resource path without any fragment. This is the routine most subtypes
     *     override to perform their low-level data access. Fragment processing
     *     is typically done by the getResource() call which can usually be
     *     defaulted.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @param {Boolean} filterResult True if the resource result will be used
     *     directly and should be filtered to match any resultType definition
     *     found in the request. The default is false.
     * @returns {Object} The resource or TP.sig.Response when async.
     * @todo
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('getPrimaryURI',
function() {

    /**
     * @name getPrimaryURI
     * @synopsis Returns the actual resource URI used for content access. This
     *     may be the receiver or it may be the URI referencing the primary
     *     resource data for the receiver if the receiver has a fragment, or it
     *     may be an "embedded" URI in the case of schemes which support
     *     embedding URIs such as tibet:.
     * @returns {TP.core.URI} The receiver's primary resource URI.
     */

    var url;

    //  If we have a locally cached value return that.
    if (TP.isURI(url = this.$get('primaryURI'))) {
        return url;
    }

    //  When there's no fragment the receiver is the primary, otherwise we
    //  need to get a reference to the primary.
    url = this;
    if (this.hasFragment()) {
        url = TP.uc(this.getPrimaryHref());
    }

    this.$set('primaryURI', url);

    return url;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('getResource',
function(aRequest) {

    /**
     * @name getResource
     * @synopsis Returns a receiver-specific object representing the "secondary"
     *     resource being accessed (i.e. the resource referenced by the base
     *     resource path subset identified by any fragment portion. If there is
     *     no fragment this method returns the same value as
     *     $getPrimaryResource().
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {Object} The resource or TP.sig.Response when async.
     */

    //  When we're primary or we don't have a fragment we can keep it
    //  simple and just defer to $getPrimaryResource.
    if (this.isPrimaryURI() || !this.hasFragment()) {
        return this.$getPrimaryResource(aRequest, true);
    }

    return this.$requestContent(aRequest,
                                '$getPrimaryResource',
                                '$getResultFragment');
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('getResourceNode',
function(aRequest) {

    /**
     * @name getResourceNode
     * @synopsis Returns the resource of the receiver in native Node form. Note
     *     that like all variants of getResource* this method can be
     *     asynchronous depending on the nature of the resource.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional object
     *     defining control parameters.
     * @returns {Node} The receiver's resource in node form.
     * @todo
     */

    var request;

    request = this.constructRequest(aRequest);
    request.atPut('resultType', TP.DOM);

    return this.getResource(request);
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('getResourceText',
function(aRequest) {

    /**
     * @name getResourceText
     * @synopsis Returns the resource of the receiver in text (String) form,
     *     provided that the resource is a String.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional object
     *     defining control parameters.
     * @returns {String} The receiver's content in text form.
     * @todo
     */

    var request;

    request = this.constructRequest(aRequest);
    request.atPut('resultType', TP.TEXT);

    return this.getResource(request);
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('$getResultContent',
function(aRequest, aResult, aResource) {

    /**
     * @name $getResultContent
     * @synopsis Invoked as a "success body" function for the getContent call
     *     with the purpose of returning the content of the result object being
     *     provided.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional object
     *     defining control parameters.
     * @param {Object} aResult The result of a content access call.
     * @param {Object} aResource Optional data from set* invocations.
     * @returns {Object} The return value for the content operation using this
     *     as a success body function.
     * @todo
     */

    var result,
        resultType;

    TP.stop('break.uri_content');

    //  Try to collapse and process using the smartest objects possible.
    result = TP.isCollection(aResult) ? TP.collapse(aResult) : aResult;
    result = TP.isNode(result) ? TP.wrap(result) : result;

    //  filter to any result type which was specified.
    resultType = TP.ifKeyInvalid(aRequest, 'resultType', null);
    result = this.$getFilteredResult(result, resultType);

    return result;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('$getResultFragment',
function(aRequest, aResult, aResource) {

    /**
     * @name $getResultFragment
     * @synopsis Invoked as a "success body" function for the getResource call
     *     with the purpose of returning the secondary resource of the result
     *     object being provided.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional object
     *     defining control parameters.
     * @param {Object} aResult The result of a content access call.
     * @param {Object} aResource Optional data from set* invocations.
     * @returns {Object} The return value for the content operation using this
     *     as a success body function.
     * @todo
     */

    var resultType,
        fragment,
        result;

    TP.stop('break.uri_fragment');

    resultType = TP.ifKeyInvalid(aRequest, 'resultType', null);

    fragment = this.getFragment();
    if (TP.notEmpty(fragment)) {
        fragment = fragment.indexOf('#') === 0 ? fragment : '#' + fragment;

        //  Try to collapse and wrap to use the smartest objects possible for
        //  the query.
        result = TP.isCollection(aResult) ? TP.collapse(aResult) : aResult;
        result = TP.isNode(result) ? TP.wrap(result) : result;

        if (TP.regex.DOCUMENT_ID.test(fragment) ||
                TP.regex.BARENAME.test(fragment)) {
            fragment = fragment;
        } else if (TP.regex.ANY_POINTER.test(fragment)) {
            //  Note that we don't worry about setting the path to collapse
            //  results here, since we collapse whatever we got below.
            fragment = TP.apc(fragment);
        }

        //  Note here how we wrap and collapse just to make sure to have
        //  consistent results across 'get' calls... what ultimately gets
        //  returned from this method is determined by the $getFilteredResult()
        //  call below.

        result = TP.canInvoke(result, 'get') ? result.get(fragment) : undefined;

        result = TP.wrap(TP.collapse(result));

    } else {
        result = aResult;
    }

    //  filter to any result type which was specified.
    result = this.$getFilteredResult(result, resultType);

    return result;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('getScheme',
function() {

    /**
     * @name getScheme
     * @synopsis Returns the scheme of the receiver, the string which starts off
     *     URIs of this type or for this particular instance.
     * @returns {String} The receiver's scheme.
     */

    return this.$get('scheme') || this.getType().get('SCHEME');
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('getSize',
function() {

    /**
     * @name getSize
     * @synopsis Returns the size of the URI in string form. This is used for
     *     testing whether the URI is empty when passed as a string.
     * @returns {Number} The size in bytes of the receiver as a String.
     */

    return this.asString().getSize();
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('getSubURIs',
function() {

    /**
     * @name getSubURIs
     * @synopsis Returns an Array of the 'sub URIs' of the receiver. These are
     *     URIs which point to the same primary resource as the receiver, but
     *     also have a secondary resource pointed to by a fragment. If the
     *     receiver has a secondary resource itself, it returns null.
     * @returns {Array} An Array of TP.core.URI objects corresponding to the
     *     'sub URI's of the receiver.
     */

    var registeredURIs,
        matcher,

        subURIKeys;

    //  Do we have a fragment? Then we don't have sub URIs.
    if (this.hasFragment()) {
        return null;
    }

    //  Get all of the registered URIs
    registeredURIs = this.getType().get('instances');

    //  Construct a RegExp looking for our location followed by a hash.
    matcher = TP.rc('^' + this.getLocation() + '#');

    //  Select the keys of the URIs that match our location plus a hash out of
    //  all of the registered URIs keys.
    subURIKeys = registeredURIs.getKeys().select(
                        function (uriLocation) {
                            return matcher.test(uriLocation);
                        });

    //  Iterate over the subURI keys and get the actual URI instance for them.
    return subURIKeys.collect(
                function (aKey) {
                    return registeredURIs.at(aKey);
                });
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('getURI',
function() {

    /**
     * @name getURI
     * @synopsis Returns a URI which can be used to acquire the receiver.
     *     TP.core.URI differs slightly in that it returns itself.
     * @returns {TP.core.URI} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('getWebPath',
function() {

    /**
     * @name getWebPath
     * @synopsis Returns the web-formatted absolute path to the URI's source.
     * @description Note that no rewriting is performed in the production of
     *     this value. The URI is simply converted to its equivalent web format
     *     (forward slashes rather than backslash etc.)
     * @returns {String} The receiver's uri value as a 'web formatted URI'.
     */

    return TP.uriInWebFormat(this.getLocation());
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('handleChange',
function(aSignal) {

    /**
     * @name handleChange
     * @synopsis Handles changes to the receiver's resource.
     * @description URIs listen for changes to their resource and invoke this
     *     method when it changes. The supplied signal could have a
     *     TP.CHANGE_PATHS property in its payload, which is an Array of path
     *     Strings that referenced the resource at some point. If this property
     *     is present, those paths are compared against any fragments of 'sub
     *     URIs' of the receiver and, if a match is made, a Change is signaled
     *     with that sub URI. In either case, this URI will signal an overall
     *     Change from itself for the 'whole resource'.
     * @param {TP.sig.Change} aSignal The signal indicating a change has
     *     happened in the resource.
     * @returns {TP.core.URI} The receiver.
     */

    var resource,

        paths,

        subURIs,

        path,

        i,

        fragNoPointer,

        aspect;

    resource = this.getResource();

    //  If TP.CHANGE_PATHS were supplied in the signal, filter them against any
    //  'sub URI's of the receiver and signal a change from those URIs.

    if (TP.notEmpty(paths = aSignal.at(TP.CHANGE_PATHS))) {

        //  SubURIs are URIs that have the same primary resource as us, but also
        //  have a fragment, indicating that they also have a secondary resource
        //  pointed to by the fragment
        subURIs = this.getSubURIs();

        if (TP.notEmpty(subURIs)) {

            //  Iterate over the paths and compare them against any 'fragments
            //  without the pointer indicator' (i.e. just the path) of sub URIs
            //  to see if any of the subURIs have that path as their fragment.
            path = aSignal.at('aspect');

            for (i = 0; i < subURIs.getSize(); i++) {

                //  Strip off any 'pointer indicator' (i.e. '#element',
                //  '#xpointer' or '#xpath1')
                fragNoPointer = TP.regex.ANY_POINTER.match(
                                    subURIs.at(i).getFragment()).at(1);

                //  If the fragment without the 'pointer indicator' matches the
                //  path, then signal from both the subURI and ourself. Note
                //  here that we just reuse the signal name and payload.
                if (fragNoPointer === path) {

                    subURIs.at(i).signal(
                            aSignal.getSignalName(),
                            aSignal.getPayload());

                    this.signal(
                            aSignal.getSignalName(),
                            aSignal.getPayload());
                }
            }
        } else {
            //  If we don't have any subURIs, invoke the standard 'changed'
            //  mechanism (which signals 'TP.sig.ValueChange') from ourself.
            this.changed('value', TP.UPDATE, TP.hc('target', resource));
        }
    } else {

        aspect = aSignal.atIfInvalid('aspect', 'value');

        //  If we didn't have any paths, invoke the standard 'changed' mechanism
        //  (which signals 'TP.sig.ValueChange') from ourself.
        this.changed(aspect, TP.UPDATE, TP.hc('target', resource));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('hasFragment',
function() {

    /**
     * @name hasFragment
     * @synopsis Returns true if the path contains a fragment reference. This is
     *     typically associated with anchors, barenames, or XPointers.
     * @returns {Boolean} Whether or not the receiver contains a fragment
     *     reference.
     */

    return TP.notEmpty(this.getFragment());
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('$flag',
function(aProperty, aFlag) {

    /**
     * @name $flag
     * @param {String} aProperty The name of the boolean property being tested
     *     and/or manipulated.
     * @param {Boolean} aFlag The new value to optionally set.
     * @returns {Boolean} The current flag state.
     * @abstract
     * @todo
     */

    var url,
        fname;

    if (!TP.isString(aProperty)) {
        this.raise('TP.sig.InvalidParameter');
        return;
    }

    //  Although we won't specifically know if the receiver is clean or
    //  dirty with respect to a particular fragment we defer to the primary.
    if ((url = this.getPrimaryURI()) !== this) {
        fname = 'is' + aProperty.asTitleCase();
        if (TP.canInvoke(url, fname)) {
            return url[fname](aFlag);
        } else {
            this.raise('TP.sig.InvalidFunction');
            return;
        }
    }

    if (TP.isBoolean(aFlag)) {
        this.$set('$' + aProperty, aFlag);
    }

    return this.$get('$' + aProperty);
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('isDirty',
function(aFlag) {

    /**
     * @name isDirty
     * @synopsis Returns true if the receiver's content has changed since it was
     *     last loaded from it's source URI or content data without being saved.
     * @param {Boolean} aFlag The new value to optionally set.
     * @returns {Boolean} Whether or not the content of the receiver is 'dirty'.
     * @todo
     */

    return this.$flag('dirty', aFlag);
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('isExpired',
function(aFlag) {

    /**
     * @name isExpired
     * @synopsis Returns true if the receiver's content has been expired.
     * @param {Boolean} aFlag The new value to optionally set.
     * @returns {Boolean} Whether or not the content of the receiver is expired.
     * @todo
     */

    return this.$flag('expired', aFlag);
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('isHTTPBased',
function() {

    /**
     * @name isHTTPBased
     * @synopsis Returns true if the receiver's absolute path is HTTP based.
     * @returns {Boolean} Whether or not the receiver is 'http'-based.
     */

    var http;

    http = this.$get('httpBased');
    if (TP.notValid(http)) {
        http = TP.regex.HTTP_SCHEME.test(this.getLocation());
        this.$set('httpBased', http);
    }

    return http;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('isLoaded',
function(aFlag) {

    /**
     * @name isLoaded
     * @synopsis Returns true if the receiver's content has been loaded either
     *     manually via a setResource() or init(), or by loading the receiver's
     *     URI location.
     * @param {Boolean} aFlag The new value to optionally set.
     * @returns {Boolean} Whether or not the content of the receiver is loaded.
     * @todo
     */

    return this.$flag('loaded', aFlag);
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('isMappedURI',
function(aFlag) {

    /**
     * @name isMappedURI
     * @synopsis Returns true if the receiver has a URI map entry. Note that
     *     this value is set based on the first map lookup and won't be reset
     *     unless you clear the flag (make it non-boolean).
     * @returns {Boolean} Whether or not the receiver is a 'mapped' URI.
     */

    //  NOTE the isDefined test rather than an TP.isBoolean() here to allow
    //  clearing of the flag
    if (TP.isDefined(aFlag)) {
        this.$set('$mapped', aFlag);
    }

    return this.$get('$mapped');
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('isPrimaryURI',
function() {

    /**
     * @name isPrimaryURI
     * @synopsis Returns true if the receiver is a primary URI, meaning it has
     *     no fragment portion and can store data.
     * @returns {Boolean} True if the receiver is a primary URI.
     */

    return !this.hasFragment();
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('$requestContent',
function(aRequest, contentFName, successFName, failureFName, aResource) {

    /**
     * @name $requestContent
     * @synopsis A generic sync/async content request processing routine used by
     *     the various get/set calls dealing with content, resource, or primary
     *     resource access.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @param {String} contentFName A content access function name such as
     *     $getPrimaryResource or getResource.
     * @param {String} successFName A function name for a URI method taking a
     *     'result' object as a single parameter.
     * @param {String} failureFName A function name for a URI method taking a
     *     failure code and failure string as parameters.
     * @param {Object} aResource Optional data used for set* methods.
     * @returns {Object} The result returned from the successBody or failureBody
     *     function as defined.
     * @todo
     */

    var fragment,

        resultType,
        refresh,
        async,

        subrequest,
        thisref;

    TP.stop('break.uri_content');

    if (!TP.canInvoke(this, contentFName)) {
        this.raise('TP.sig.InvalidParameter',
            'Must supply content accessor function name.');

        return;
    }

    //  capture and process fragment (if any) so it can be used as a path to
    //  a set or get call.
    fragment = this.getFragment();
    if (TP.notEmpty(fragment)) {
        fragment = fragment.indexOf('#') === 0 ? fragment : '#' + fragment;
    }

    //  capture result type early, it can be defaulted by load() and other
    //  low-level calls and we want the original value for later use. NOTE
    //  that we don't set a value here, null avoids forcing a result type.
    resultType = TP.ifKeyInvalid(aRequest, 'resultType', null);

    //  we'll need these to help decide which branch to take below.
    refresh = TP.ifKeyInvalid(aRequest, 'refresh', null);
    async = this.rewriteRequestMode(aRequest);

    //  If we're going to have to request the data then the key thing we
    //  want to avoid is having an incoming request complete() before the
    //  entire process is finished. That means ensuring we have a clean
    //  subrequest instance we can locally modify.
    subrequest = this.constructSubRequest(aRequest);

    //  hold a this reference the functions below can close around.
    thisref = this;

    subrequest.defineMethod('completeJob',
    function(aResult) {

            var result;

            result = aResult;
            if (TP.canInvoke(thisref, successFName)) {
                // Note that two of these parameters come from the outer
                // function and only aResult is provided by the inner one.
                result = thisref[successFName](aRequest,
                                                aResult,
                                                aResource);
            }

            //  rewrite the request result object so we hold on to the
            //  processed content rather than the inbound content.
            subrequest.set('result', result);

            //  if there was an original request complete it, which will
            //  take care of putting the result in place for async calls.
            if (TP.canInvoke(aRequest, 'complete')) {
                aRequest.complete(result);
            }
    });

    subrequest.defineMethod('failJob',
    function(aFaultCode, aFaultString) {

            if (TP.canInvoke(thisref, failureFName)) {
                thisref[failureFName](aFaultCode, aFaultString);
            }

            //  if there was an original request fail it too.
            if (TP.canInvoke(aRequest, 'fail')) {
                aRequest.fail(aFaultCode, aFaultString);
            }
    });

    //  Remember this can run async, so any result here can be either data
    //  or a TP.sig.Response when async. We can safely ignore it.
    this[contentFName](subrequest);

    //  If async we can only return the result/response being used to
    //  actually process the async activity.
    //  NOTE that we need to re-read the async state in case our underlying
    //  resource is async-only and potentially rewrote the value.
    async = this.rewriteRequestMode(subrequest);
    if (async) {
        //  hand back the response object for the "outer" request, which
        //  will be either the originating request or our internally
        //  constructed one (which was also used as the subrequest)
        if (TP.canInvoke(aRequest, 'constructResponse')) {
            return aRequest.constructResponse();
        } else {
            return subrequest.constructResponse();
        }
    }

    //  If the routine was invoked synchronously then the data will have
    //  been placed in the subrequest.
    return subrequest.get('result');
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('rewrite',
function(aRequest) {

    /**
     * @name rewrite
     * @synopsis Rewrites the receiver to its appropriate 'concrete' URI value
     *     based on current runtime values and rewriting rules.
     * @param {TP.sig.Request} aRequest An optional request whose values may
     *     inform the rewrite.
     * @returns {TP.core.URI} The rewritten URI in TP.core.URI form.
     * @todo
     */

    //  vast majority of URIs are not mapped so once we know that we can
    //  skip the overhead of rewriting and just return the URI itself
    if (TP.isFalse(this.isMappedURI())) {
        return this;
    }

    return this.getType().rewrite(this, aRequest);
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('route',
function(aRequest) {

    /**
     * @name route
     * @synopsis Routes the operation implied by any data in aRequest to a
     *     viable handler for the URI. This typically results in the request
     *     being passed to a TP.core.URIHandler type/subtype. Note that the URI
     *     is expected to have been rewritten as needed prior to this call so
     *     that the route is appropriate for the concrete URI being accessed.
     * @param {TP.sig.Request} aRequest The request whose values should inform
     *     the routing assignment.
     * @returns {TP.lang.RootObject.<TP.core.URIHandler>} A TP.core.URIHandler
     *     subtype type object that can handle the request for the supplied URI.
     */

    if (TP.isFalse(this.isMappedURI())) {
        return this.$getDefaultHandler(aRequest);
    }

    return this.getType().route(this, aRequest);
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('setContent',
function(contentData, aRequest) {

    /**
     * @name setContent
     * @synopsis Sets the receiver's content to the object provided.
     * @param {Object} contentData A new content object.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     optional parameters.
     * @returns {TP.core.URL|TP.sig.Response} The receiver or a TP.sig.Response
     *     when the resource must be acquired in an async fashion prior to
     *     setting any fragment value.
     * @todo
     */

    return this.$requestContent(aRequest,
                                'getResource',
                                '$setResultContent',
                                null,
                                contentData);
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('setLastUpdateDate',
function(aDate) {

    /**
     * @name setLastUpdateDate
     * @synopsis Sets the update time for the receiver. This is the last time
     *     the receiver's data was loaded from its source.
     * @param {Date} aDate The date to set the 'last updated' property of the
     *     receiver to.
     * @returns {String} The string value set for the update time.
     */

    var theDate,
        dict;

    //  note the default here to the value of the Date header which is
    //  normally served via HTTP and which is configured by TIBET for files
    theDate = TP.ifInvalid(aDate, this.getHeader('Date'));

    //  note that if theDate is null we'll get a new date with current time
    theDate = TP.dc(theDate);

    //  cache so we avoid date creation overhead
    this.$set('lastUpdated', theDate, false);

    dict = this.$get('headers');
    if (TP.notValid(dict)) {
        dict = TP.hc();
        this.$set('headers', dict, false);
    }
    this.get('headers').atPut('Date', theDate.toUTCString());

    return theDate;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('$setPrimaryResource',
function(aResource, aRequest) {

    /**
     * @name $setPrimaryResource
     * @synopsis Sets the receiver's resource object, the object TIBET will
     *     treat as the primary resource for any subsequent processing.
     * @param {Object} aResource The resource object to assign.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     optional parameters.
     * @returns {TP.core.URL|TP.sig.Response} The receiver or a TP.sig.Response
     *     when the resource must be acquired in an async fashion prior to
     *     setting any fragment value.
     * @todo
     */

    var url,

        oldResource,
        newResource;

    TP.stop('break.uri_resource');

    //  If the receiver isn't a "primary URI" then it really shouldn't be
    //  holding data, it should be pushing it to the primary...
    if ((url = this.getPrimaryURI()) !== this) {
        return url.$setPrimaryResource(aResource, aRequest);
    }

    //  ---
    //  URI <-> data corellation
    //  ---

    //  Make sure to wrap the resource since we're going to be performing
    //  TIBETan operations.
    newResource = TP.wrap(aResource);

    //  on the off chance we got a native node with a default type we want
    //  to try to get it in wrapped form.
    if (TP.canInvoke(newResource, ['addTIBETSrc', 'addXMLBase', '$set'])) {
        //  place our URI value into the node wrapper and node content
        newResource.$set('uri', this, false);

        //  make sure the node knows where it loaded from.
        newResource.addTIBETSrc(this);

        //  then, an 'xml:base' attribute. this helps ensure that xml:base
        //  computations will work more consistently during tag processing
        newResource.addXMLBase();
    }

    //  If we already have a resource, make sure to 'ignore' it for changes.
    if (this.isLoaded()) {
        oldResource = TP.wrap(this.$get('resource'));
        this.ignore(oldResource, 'Change');
    }

    //  If the receiver is the primary resource we can update our cached
    //  value for future use.
    this.$set('resource', newResource);

    //  Observe the new resource object for changes.
    this.observe(newResource, 'Change');

    //  Once we have a value, in any form, we're both dirty and loaded from
    //  a state perspective.
    this.isDirty(true);
    this.isLoaded(true);

    //  clear any expiration computations
    this.expire(false);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('setResource',
function(aResource, aRequest) {

    /**
     * @name setResource
     * @synopsis Sets the receiver's resource object, the object TIBET will
     *     treat as the resource for any subsequent processing.
     * @param {Object} aResource The resource object to assign.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     optional parameters.
     * @returns {TP.core.URL|TP.sig.Response} The receiver or a TP.sig.Response
     *     when the resource must be acquired in an async fashion prior to
     *     setting any fragment value.
     * @todo
     */

    //  When we're primary or we don't have a fragment we can keep it
    //  simple and just defer to $setPrimaryResource.
    if (this.isPrimaryURI() || !this.hasFragment()) {
        return this.$setPrimaryResource(aResource, aRequest);
    }

    //  If we have a fragment then we need to do the more complex approach
    //  of getting the primary resource and setting the fragment value with
    //  respect to that object.
    return this.$requestContent(aRequest,
                                '$getPrimaryResource',
                                '$setResultFragment',
                                null,
                                aResource);
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('$setResultContent',
function(aRequest, aResult, aResource) {

    /**
     * @name $setResultContent
     * @synopsis Invoked as a "success body" function for the setContent call
     *     with the purpose of updating the content of the result object being
     *     provided.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional object
     *     defining control parameters.
     * @param {Object} aResult The result of a content access call.
     * @param {Object} aResource Optional data used for set* methods.
     * @returns {Object} The return value for the content operation using this
     *     as a success body function.
     * @todo
     */

    var result;

    TP.stop('break.uri_content');

    if (TP.isKindOf(aResult, 'TP.sig.Response')) {
        result = aResult.getResult();
    } else {
        result = aResult;
    }

    //  Try to collapse and process using the smartest objects possible.
    result = TP.isCollection(result) ? TP.collapse(result) : result;
    result = TP.isNode(result) ? TP.wrap(result) : result;

    if (TP.canInvoke(result, 'set')) {
        result.set('content', aResource);
    } else {
        this.raise('TP.sig.InvalidResource',
            'Unable to modify target resource.');
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('$setResultFragment',
function(aRequest, aResult, aResource) {

    /**
     * @name $setResultFragment
     * @synopsis Invoked as a "success body" function for the setResource call
     *     with the purpose of setting the secondary resource.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An optional object
     *     defining control parameters.
     * @param {Object} aResult The result of a content access call.
     * @param {Object} aResource Optional data used for set* methods.
     * @returns {Object} The return value for the content operation using this
     *     as a success body function.
     * @todo
     */

    var fragment,
        result;

    TP.stop('break.uri_fragment');

    fragment = this.getFragment();
    if (TP.notEmpty(fragment)) {
        fragment = fragment.indexOf('#') === 0 ? fragment : '#' + fragment;

        //  Try to collapse and wrap to use the smartest objects possible for
        //  the query.
        result = TP.isCollection(aResult) ? TP.collapse(aResult) : aResult;
        result = TP.isNode(result) ? TP.wrap(result) : result;

        if (TP.regex.DOCUMENT_ID.test(fragment) ||
                TP.regex.BARENAME.test(fragment)) {
            fragment = fragment;
        } else if (TP.regex.ANY_POINTER.test(fragment)) {
            fragment = TP.apc(fragment, true);
        }

        if (TP.canInvoke(result, 'set')) {
            result.set(fragment, aResource);
        } else {
            this.raise('TP.sig.InvalidResource',
                'Unable to modify target resource.');
        }
    } else {
        this.raise('TP.sig.InvalidFragment');
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('transform',
function(aDataSource, aRequest) {

    /**
     * @name transform
     * @synopsis Uses the receiver's URI content as a template and performs a
     *     transform operation. The data to transform is provided in aDataSource
     *     while parameters to the transformation operation should be placed in
     *     aRequest.
     * @description Note that since this method calls getResource() the
     *     parameter list is provided to both getResource() and transform(),
     *     creating the potential for confusion if parameter names overlap. If
     *     this is possible you should invoke getResource() and transform
     *     separately.
     * @param {Object} aDataSource The object supplying the data to use in the
     *     transformation.
     * @param {TP.lang.Hash|TP.sig.Request} aRequest A parameter container
     *     responding to at(). For string transformations a key of 'repeat' with
     *     a value of true will cause iteration to occur (if aDataSource is an
     *     'ordered collection' this flag needs to be set to 'true' in order to
     *     have 'automatic' iteration occur). Additional keys of '$STARTINDEX'
     *     and '$REPEATCOUNT' determine the range of the iteration.
     * @returns {String} The string resulting from the transformation process.
     * @todo
     */

    var subrequest,
        async;

    TP.stop('break.uri_transform');

    //  If we're going to have to request the data then the key thing we
    //  want to avoid is having an incoming request complete() before the
    //  entire process is finished. That means ensuring we have a clean
    //  subrequest instance we can locally modify.
    subrequest = this.constructSubRequest(aRequest);

    subrequest.defineMethod(
            'completeJob',
            function(aResult) {

                    var resource,
                        result;

                    if (TP.isDefined(aResult)) {
                        //  In case aResult returned an Array (very likely if it
                        //  ran some sort of 'getter path'), we collapse it here
                        //  - can't transform from an Array of TP.core.Nodes.
                        result = aResult.collapse();
                        resource = TP.wrap(result);
                    }

                    if (TP.canInvoke(resource, 'transform')) {
                        result = resource.transform(aDataSource, aRequest);

                        //  rewrite the request result object so we hold on to
                        //  the processed content rather than the inbound
                        //  content.
                        subrequest.set('result', result);
                    }

                    if (TP.canInvoke(aRequest, 'complete')) {
                        //  Note that this could be null if there's no result,
                        //  or if the transform call isn't supported, or if the
                        //  transform simply produces a null result.
                        if (TP.isValid(result)) {
                            aRequest.complete(result);
                        } else {
                            aRequest.complete();
                        }
                    }
            });

    subrequest.defineMethod(
            'failJob',
            function(aFaultCode, aFaultString) {

                    if (TP.canInvoke(aRequest, 'fail')) {
                        aRequest.fail(aFaultCode, aFaultString);
                    }
    });

    //  trigger the invocation and rely on the handlers for the rest.
    this.getResource(subrequest);

    //  If async we can only return the result/response being used to
    //  actually process the async activity.
    //  NOTE that we need to re-read the async state in case our underlying
    //  resource is async-only and potentially rewrote the value.
    async = this.rewriteRequestMode(subrequest);
    if (async) {
        //  hand back the response object for the "outer" request, which
        //  will be either the originating request or our internally
        //  constructed one (which was also used as the subrequest)
        if (TP.canInvoke(aRequest, 'constructResponse')) {
            return aRequest.constructResponse();
        } else {
            return subrequest.constructResponse();
        }
    }

    //  If the routine was invoked synchronously then the data will have
    //  been placed in the subrequest.
    return subrequest.get('result');
});

//  ------------------------------------------------------------------------

TP.core.URI.Inst.defineMethod('updateHeaders',
function(headerData) {

    /**
     * @name updateHeaders
     * @synopsis Updates the receiver's headers, usually from a set of HTTP
     *     headers returned from the last HTTP request used to load this URIs
     *     content.
     * @param {Object} headerData A string, hash, or request object containing
     *     header data.
     * @returns {TP.core.URI} The receiver.
     */

    var dict,
        str,
        xhr,

        arr,
        i,
        len,

        parts,
        key,
        value,

        theDate;

    TP.stop('break.uri_headers');

    dict = this.$get('headers');

    if (TP.isKindOf(headerData, TP.lang.Hash)) {
        if (TP.isValid(dict)) {
            dict.addAll(headerData);
        } else {
            dict = headerData.copy();
        }
    } else if (TP.isValid(headerData)) {
        if (TP.isString(headerData)) {
            str = headerData;
        } else if (TP.isXHR(headerData)) {
            str = TP.ifEmpty(headerData.getAllResponseHeaders(), '');
        } else if (TP.canInvoke(headerData, 'at')) {
            if (TP.isXHR(xhr = headerData.at('xhr'))) {
                str = TP.ifEmpty(xhr.getAllResponseHeaders(), '');
            }
        }

        //  if we were able to find a string then we can process it into its
        //  component parts
        if (TP.notEmpty(str)) {
            dict = TP.ifInvalid(dict, TP.hc());

            arr = str.split('\n');

            len = arr.getSize();
            for (i = 0; i < len; i++) {
                parts = arr.at(i).split(':');
                key = parts.shift();
                value = parts.join(':');

                if (TP.notEmpty(key)) {
                    dict.atPut(key, value);
                }
            }
        }
    }

    dict = TP.ifInvalid(dict, TP.hc());

    //  finally make sure we have the minimum required headers
    if (TP.notValid(dict.at('Date'))) {
        //  cache so we avoid date creation overhead
        theDate = TP.dc();
        this.$set('lastUpdated', theDate, false);

        dict.atPut('Date', theDate.toUTCString());
    }

    //  be sure to save back as needed
    this.$set('headers', dict, false);

    return this;
});

//  ========================================================================
//  TP.core.URN
//  ========================================================================

/**
 * @type {TP.core.URN}
 * @synopsis A subtype of TP.core.URI that models Uniform Resource Names in the
 *     TIBET system. A URN identifies its resource by specifying a name. Each
 *     "namespace identifier" (NID) tends to have a custom subtype of
 *     TP.core.URN to handle namespace-specific processing needs.
 * @description Note that the spec requires this name to be globally unique and
 *     persistent, even after the resource it points to no longer exists or is
 *     reachable. This condition is not enforced. Also, this type does not limit
 *     the namespace ID to less than 32 characters, per the URN RFC 2141, nor
 *     does it limit which non-alphanumeric characters can be in the namespace
 *     specific string per that same spec.
 */

//  ------------------------------------------------------------------------

TP.core.URI.defineSubtype('URN');

//  You can't have a generic URN, you have to have a subtype specific to the
//  namespace identification string.
TP.core.URN.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.core.URN.Type.defineConstant('URN_REGEX',
                            TP.rc('urn:([a-zA-Z0-9]+):(\\S+)'));

TP.core.URN.Type.defineConstant('URN_NSS_REGEX',
                            TP.rc('^([a-zA-Z0-9]+):(\\S+)'));

TP.core.URN.Type.defineConstant('SCHEME', 'urn');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  registry for subtypes based on the NID they are responsible for.
//  'urn:' scheme is sync-only so configure for that
TP.core.URN.Type.defineAttribute('supportedModes',
                                TP.core.SyncAsync.SYNCHRONOUS);
TP.core.URN.Type.defineAttribute('mode',
                                TP.core.SyncAsync.SYNCHRONOUS);

TP.core.URN.Type.defineAttribute('nidHandlers', TP.hc());

TP.core.URN.registerForScheme('urn');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.URN.Type.defineMethod('getConcreteType',
function(aPath) {

    /**
     * @name getConcreteType
     * @synopsis Returns the type to use for a particular URI path.
     * @param {String} aPath A URI string providing at least a scheme which can
     *     be looked up for a concrete type.
     * @returns {TP.lang.RootObject} A type object.
     */

    var parts,
        nid,
        type;

    parts = aPath.split(':');
    if (parts.at(0) !== 'urn') {
        return;
    }

    nid = parts.at(1);

    type = TP.core.URN.$get('nidHandlers').at(nid);
    if (TP.isType(type)) {
        return type;
    }

    //  TODO:   convention...build a type name and look for it.
    return;
});

//  ------------------------------------------------------------------------

TP.core.URN.Type.defineMethod('registerForNID',
function(aNID) {

    /**
     * @name registerForNID
     * @synopsis Registers the receiving type for handling construction of URN
     *     instances for a particular namespace ID (NID).
     * @param {String} aNID A URN namespace ID such as 'oid', or 'tibet'.
     * @param {TP.lang.RootObject} aHandler A type capable of handling requests
     *     for URNs for the namespace.
     * @raise TP.sig.InvalidParameter When the scheme isn't a string.
     * @todo
     */

    var theNID;

    if (!TP.isString(aNID)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Scheme is empty or null.');
    }

    theNID = aNID.strip(':');
    TP.core.URN.$get('nidHandlers').atPut(theNID, this);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the Namespace ID (NID) from the URN specification
TP.core.URN.Inst.defineAttribute('nid');

//  the Namespaces Specific String (NSS)
TP.core.URN.Inst.defineAttribute('nss');

//  The "name" portion as TIBET perceives it. This is effectively the NSS
//  minus any concept of fragment.
TP.core.URN.Inst.defineAttribute('name');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.URN.Inst.defineMethod('$initURIComponents',
function(parts) {

    /**
     * @name $initURIComponents
     * @synopsis Performs any post-parsing initialization appropriate for the
     *     URI components which were parsed during scheme-specific parsing.
     * @param {TP.lang.Hash} parts The parsed URI components.
     * @returns {TP.core.URI} The receiver.
     */

    if (TP.canInvoke(parts, 'at')) {
        this.$set('nid', parts.at('nid'));
        this.$set('nss', parts.at('nss'));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.URN.Inst.defineMethod('$parseSchemeSpecificPart',
function(schemeSpecificString) {

    /**
     * @name $parseSchemeSpecificPart
     * @synopsis Parses inbound URI string content in a fashion specific to the
     *     scheme(s) being managed by the receiver.
     * @param {String} schemeSpecificString A String containing the
     *     "scheme-specific-part" of a URI.
     * @returns {TP.lang.Hash} The parsed URI 'components'.
     */

    var match,
        hash;

    TP.stop('break.uri_parse');
            /*
    //  NOTE that the concept of 'primary' and 'fragment' aren't relevant
    //  for this type, so we don't invoke the supertype method here, we set
    //  our primary href directly.
    this.$set('primaryHref',
        this.$get('scheme') + ':' + schemeSpecificString);
            */
    this.callNextMethod();

    match = TP.core.URN.URN_NSS_REGEX.exec(schemeSpecificString);
    if (TP.isArray(match)) {
        hash = TP.hc('nid', match.at(1), 'nss', match.at(2));
    }

    return hash;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.URN.Inst.defineMethod('$getPrimaryResource',
function(aRequest, filterResult) {

    /**
     * @name $getPrimaryResource
     * @synopsis Returns the object registered under the receiver's "name".
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @param {Boolean} filterResult True if the resource result will be used
     *     directly and should be filtered to match any resultType definition
     *     found in the request. The default is false.
     * @returns {Object} The resource or TP.sig.Response when async.
     * @todo
     */

    var url,

        async,
        refresh,
        request,
        result,
        resultType,
        response;

    TP.stop('break.uri_resource');

    //  If we're not the primary URI, that means we have a fragment. So we have
    //  to get the 'whole' resource from the primary URI and then proceed
    //  forward. Note that, in this case, the original request passed in will be
    //  configured to retrieve the value of the fragment, so we have to use a
    //  new, one-time, request here.
    if ((url = this.getPrimaryURI()) !== this) {
        result = url.$getPrimaryResource(
                                TP.request('async', false), filterResult);
    } else {

        //  Things that we do only if we're the primary URI

        //  for consistency we have to process as request/response if async
        async = this.rewriteRequestMode(aRequest);
        if (async) {
            request = this.constructRequest(aRequest);
        }

        refresh = TP.ifKeyInvalid(aRequest, 'refresh', null);
        result = this.$get('resource');

        if (TP.notValid(result) || refresh) {
            result = this.$resolveName(this.getName());
        }

        if (TP.isValid(result)) {
            this.isLoaded(true);
        }
    }

    //  filter any remaining data
    if (TP.isTrue(filterResult) && TP.isValid(result)) {
        resultType = TP.ifKeyInvalid(aRequest, 'resultType', null);
        result = this.$getFilteredResult(result, resultType, false);
    }

    //  Simulate async, even when we're not really an async URI type.
    if (async) {
        response = request.constructResponse(result);
        request.complete(result);

        return response;
    }

    //  synchronous? complete any request we might actually have.
    if (TP.canInvoke(aRequest, 'complete')) {
        aRequest.complete(result);
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.core.URN.Inst.defineMethod('getName',
function() {

    /**
     * @name getName
     * @synopsis Returns the receiver's "name" as TIBET perceives it, which is
     *     effectively the NSS (Namespace Specific String) portion of the
     *     receiver's location string minus any fragment where the concept of
     *     fragment here is a TIBET extension.
     * @returns {String} The NSS or name.
     */

    var loc,
        name;

    if (TP.notEmpty(name = this.$get('name'))) {
        return name;
    }

    loc = this.getLocation();

    name = loc.split(':').slice(2).join(':').split('#').first();
    this.$set('name', name);

    return name;
});

//  ------------------------------------------------------------------------

TP.core.URN.Inst.defineMethod('$resolveName',
function(aName) {

    /**
     * @name $resolveName
     * @synopsis Resolves the receiver's "name" or the name value provided,
     *     returning the referenced resource. This method is invoked by the
     *     $getPrimaryResource call to perform type-specific name resolution
     *     logic.
     * @param {String} aName The name to resolve.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------
//  Storage Management
//  ------------------------------------------------------------------------

TP.core.URN.Inst.defineMethod('load',
function(aRequest) {

    /**
     * @name load
     * @synopsis For the most part, no-op for URNs.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request,
        url,
        handler;

    TP.stop('break.uri_load');

    request = this.constructRequest(aRequest);

    //  rewriting means we'll get to the concrete URI for the receiver so we
    //  put the data where it really belongs
    url = this.rewrite(request);

    request.atPut('route', 'load');

    //  NB: We hard-code 'TP.core.URIHandler' as our handler here, since it
    //  really just completes the request properly and doesn't do much else. See
    //  that type for more information
    handler = TP.core.URIHandler;

    return handler.load(url, request);
});

//  ------------------------------------------------------------------------

TP.core.URN.Inst.defineMethod('nuke',
function(aRequest) {

    /**
     * @name nuke
     * @synopsis For the most part, a no-op for URNs.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request,
        url,
        handler;

    TP.stop('break.uri_nuke');

    request = this.constructRequest(aRequest);

    //  rewriting means we'll get to the concrete URI for the receiver so we
    //  put the data where it really belongs
    url = this.rewrite(request);

    request.atPut('route', 'nuke');

    //  NB: We hard-code 'TP.core.URIHandler' as our handler here, since it
    //  really just completes the request properly and doesn't do much else. See
    //  that type for more information
    handler = TP.core.URIHandler;

    return handler.nuke(url, request);
});

//  ------------------------------------------------------------------------

TP.core.URN.Inst.defineMethod('save',
function(aRequest) {

    /**
     * @name save
     * @synopsis For the most part, a no-op for URNs.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     * @todo
     */

    var request,
        url,
        handler;

    TP.stop('break.uri_save');

    request = this.constructRequest(aRequest);

    //  rewriting means we'll get to the concrete URI for the receiver so we
    //  put the data where it really belongs
    url = this.rewrite(request);

    request.atPut('route', 'save');

    //  NB: We hard-code 'TP.core.URIHandler' as our handler here, since it
    //  really just completes the request properly and doesn't do much else. See
    //  that type for more information
    handler = TP.core.URIHandler;

    return handler.save(url, request);
});

//  ========================================================================
//  TP.core.TIBETURN
//  ========================================================================

/**
 * @type {TP.core.TIBETURN}
 * @synopsis A subtype of TP.core.URN specific to the urn:tibet 'namespace'.
 * @description When creating URNs the portion after the scheme is what is known
 *     as the "NIS" or Namespace Identification String". This is followed by the
 *     "NSS" or Namespace Specific String. To ensure proper parsing of the
 *     latter we use subtypes specific to each URN namespace, the most common of
 *     which is the 'tibet' NIS.
 */

//  ------------------------------------------------------------------------

TP.core.URN.defineSubtype('TIBETURN');

TP.core.TIBETURN.registerForNID('tibet');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.TIBETURN.Inst.defineMethod('$resolveName',
function(aName) {

    /**
     * @name $resolveName
     * @synopsis Resolves the receiver's "name" or the name value provided,
     *     returning the referenced resource. This method is invoked by the
     *     $getPrimaryResource call to perform type-specific name resolution
     *     logic.
     * @param {String} aName The name to resolve.
     */

    var str,
        result;

    str = aName || this.getName();

    if (TP.regex.TIBET_URN.test(str)) {
        str = str.slice(TP.TIBET_URN_PREFIX.length);
    }

    //  We want registered objects to take precedence over types.
    result = this.$get('resource');
    if (TP.notValid(result)) {

        //  And we want types to take precedence over global objects.
        result = TP.sys.getTypeByName(str);

        //  Note that we only return a global here *if the name is in the
        //  globals dictionary*
        if (!TP.isType(result) && TP.sys.$globals.hasKey(str)) {
            try {
                result = TP.global[str];
            } catch (e) {
                //  ignore errors attempting lookup.
            }
        }
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.core.TIBETURN.Inst.defineMethod('$setPrimaryResource',
function(aResource, aRequest) {

    /**
     * @name $setPrimaryResource
     * @synopsis Sets the receiver's resource object, the object TIBET will
     *     treat as the primary resource for any subsequent processing.
     * @param {Object} aResource The resource object to assign.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request containing
     *     optional parameters.
     * @returns {TP.core.URL|TP.sig.Response} The receiver or a TP.sig.Response
     *     when the resource must be acquired in an async fashion prior to
     *     setting any fragment value.
     * @todo
     */

    var url,

        resource,

        hasID;

    TP.stop('break.uri_resource');

    //  If the receiver isn't a "primary URI" then it really shouldn't be
    //  holding data, it should be pushing it to the primary...
    if ((url = this.getPrimaryURI()) !== this) {
        return url.$setPrimaryResource(aResource, aRequest);
    }

    //  If the resource doesn't already have a user-set ID (i.e. it's ID is the
    //  same as it's OID), we're going to set it to our 'name'.
    hasID = (aResource[TP.ID] !== aResource.$$oid);

    if (!hasID) {
        if (TP.canInvoke(aResource, 'setID')) {
            aResource.setID(this.getName());
        }
    }

    //  If we already have a resource, make sure to 'ignore' it for changes.
    if (this.isLoaded()) {
        resource = this.$get('resource');
        this.ignore(aResource, 'Change');
    }

    //  If the receiver is the primary resource we can update our cached value
    //  for future use.
    this.$set('resource', aResource);

    //  Observe the new resource object for changes.
    this.observe(aResource, 'Change');

    //  Once we have a value, in any form, we're both dirty and loaded from a
    //  state perspective.
    this.isDirty(true);
    this.isLoaded(true);

    //  clear any expiration computations
    this.expire(false);

    return this;
});

//  ========================================================================
//  TP.core.URL
//  ========================================================================

/**
 * @type {TP.core.URL}
 * @synopsis A subtype of TP.core.URI that models Uniform Resource Locators in
 *     the TIBET system. A URL identifies its resource by specifying the network
 *     location.
 * @description The API of this object matches that of the Location object in
 *     the browser, although one can have multiple instances of these objects to
 *     represent many URLs that would be encountered in a TIBET program.
 */

//  ------------------------------------------------------------------------

TP.core.URI.defineSubtype('URL');

//  TP.core.URL is an abstract type - the scheme will cause a concrete type
//  to be created.
TP.core.URL.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.core.URL.Type.defineConstant('SCHEME', null);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the 'path' varies by scheme but is typically found behind any host:port
//  or file: prefixes
TP.core.URL.Inst.defineAttribute('path');
TP.core.URL.Inst.defineAttribute('lastRequest');

//  placeholder for URI handlers to find most recent 'communication' object
//  (i.e. the native XHR or WebSocket object)
TP.core.URL.Inst.defineAttribute('lastCommObj');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.URL.Inst.defineMethod('asURL',
function() {

    /**
     * @name asURL
     * @synopsis Returns the receiver as a URL (this).
     * @returns {TP.core.URL} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.URL.Inst.defineMethod('getExtension',
function(aSeparator) {

    /**
     * @name getExtension
     * @synopsis Returns any extension that the URI's path may have. NOTE that
     *     no rewriting is performed in the production of this result.
     * @param {String} aSeparator The separator to use to find the extension.
     *     This defaults to the period (.).
     * @returns {String} The receiver's path extension, if it has one.
     * @todo
     */

    if (this.hasFragment()) {
        return TP.uriExtension(this.getPrimaryHref(), aSeparator);
    }

    return TP.uriExtension(this.getLocation(), aSeparator);
});

//  ------------------------------------------------------------------------

TP.core.URL.Inst.defineMethod('getMIMEType',
function() {

    /**
     * @name getMIMEType
     * @synopsis Returns the MIME type of the receiver, if available. See the
     *     TP.ietf.Mime.getMIMEType() method for more information about how
     *     TIBET tries to guess the MIME type based on file name and data
     *     content.
     * @returns {String} The receiver's MIME type.
     */

    var url,
        mimeType,

        resource,
        fragment,
        content;

    TP.stop('break.uri_mime');

    //  TODO:   if we're a fragment then is it possible that our MIME type
    //  could differ from that of our container?
    //  Always defer to the primary URI if we have a distinct one.
    if ((url = this.getPrimaryURI()) !== this) {
        return url.getMIMEType();
    }

    //  if there's a valid computed MIME we can use it first
    if (TP.notEmpty(mimeType = this.get('computedMIMEType'))) {
        return mimeType;
    }

    //  Need to avoid recursion here so we check the resource slot, but
    //  don't actually invoke getResource
    if (this.isLoaded()) {
        resource = this.$get('resource');
        if (this.hasFragment() && TP.canInvoke(resource, 'get')) {
            fragment = this.getFragment();
            if (TP.isKindOf(resource, TP.core.Node)) {
                fragment = fragment.startsWith('#') ?
                            fragment :
                            '#' + fragment;
            }
            content = resource.get(fragment);
        } else {
            content = resource;
        }

        //  assuming we got content we can ask it, which is what we'd
        //  prefer to do to get the best value
        if (TP.canInvoke(content, 'getContentMIMEType')) {
            mimeType = content.getContentMIMEType(content);

            //  if we found one cache it for next time :)
            if (TP.isString(mimeType)) {
                this.$set('computedMIMEType', mimeType);

                return mimeType;
            }
        }
    }

    //  if we couldn't ask the content then we can try to guess via the
    //  MIME type itself
    mimeType = TP.ietf.Mime.guessMIMEType(content, this.getLocation(),
                                    this.get('defaultMIMEType'));

    if (TP.isString(mimeType)) {
        //  note that we don't cache the guess
        return mimeType;
    }

    return this.get('defaultMIMEType');
});

//  ------------------------------------------------------------------------

TP.core.URL.Inst.defineMethod('getNativeNode',
function(aRequest) {

    /**
     * @name getNativeNode
     * @synopsis Returns the content node of the receiver without its normal
     *     TP.core.Node wrapper. This value may vary from the text value of the
     *     receiver if ACP-enhanced markup was provided to initialize the
     *     content.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {Node} The node value of the receiver's content.
     */

    var subrequest,
        async,
        thisref;

    subrequest = this.constructSubRequest(aRequest);
    thisref = this;

    subrequest.defineMethod(
            'completeJob',
            function(aResult) {

                    var result;

                    result = TP.isValid(aResult) ? TP.node(aResult) : aResult;

                    subrequest.set('result', result);
                    thisref.set('resource', result);

                    if (TP.canInvoke(aRequest, 'complete')) {
                        aRequest.complete(result);
                    }
            });

    subrequest.defineMethod(
            'failJob',
            function(aFaultCode, aFaultString) {

                    if (TP.canInvoke(aRequest, 'fail')) {
                        aRequest.fail(aFaultCode, aFaultString);
                    }
            });

    this.getResourceNode(subrequest);

    //  If async we can only return the result/response being used to
    //  actually process the async activity.
    //  NOTE that we need to re-read the async state in case our underlying
    //  resource is async-only and potentially rewrote the value.
    async = this.rewriteRequestMode(subrequest);
    if (async) {
        //  hand back the response object for the "outer" request, which
        //  will be either the originating request or our internally
        //  constructed one (which was also used as the subrequest)
        if (TP.canInvoke(aRequest, 'constructResponse')) {
            return aRequest.constructResponse();
        } else {
            return subrequest.constructResponse();
        }
    }

    //  If the routine was invoked synchronously then the data will have
    //  been placed in the subrequest.
    return subrequest.get('result');
});

//  ------------------------------------------------------------------------

TP.core.URL.Inst.defineMethod('getPath',
function() {

    /**
     * @name getPath
     * @synopsis Returns the path portion of the receiver.
     * @description The value returned from this method will vary between
     *     subtypes. For 'file' urls it will be the file path which starts after
     *     the file:// portion while for 'http' urls it is the portion between
     *     the host:port and ?query specs. Note that on windows this will not
     *     start with a leading "/" when using file urls (so file:///c:/foo
     *     returns a path of c:/foo, not /c:/foo).
     * @returns {String} A scheme-specific path string.
     */

    var path,
        url;

    //  for HTTP URLs, this very well may be the empty String, in which case
    //  its still valid and just returns
    if (TP.notValid(path = this.$get('path'))) {
        //  try to figure out the path from the uri
        if (TP.notValid(url = this.getLocation())) {
            return '';
        }

        path = this.$getPath(url);

        this.$set('path', path, false);
    }

    return path;
});

//  ------------------------------------------------------------------------

TP.core.URL.Inst.defineMethod('$getPath',
function(url) {

    /**
     * @name $getPath
     * @synopsis Parses the url for the path portion as that concept is defined
     *     for the receiving type. Note that different URI types consider
     *     different parts of their HREF to be the 'path'.
     * @param {String} url The URI string to parse.
     * @returns {String} The path subset of the string provided.
     */

    var path;

    //  by default the 'path' is whatever comes after the scheme
    path = url.slice(url.indexOf(':') + 1);

    //  then we chop off any leading '//', if its there
    path = path.chop('//');

    return path;
});

//  ------------------------------------------------------------------------

TP.core.URL.Inst.defineMethod('getRelativePath',
function(secondPath, filePath) {

    /**
     * @name getRelativePath
     * @synopsis Returns the receiver's path converted to a relative path when
     *     compared to second path. If the secondPath contains a file reference
     *     then the filePath argument should be true so that the resulting
     *     relative path is always produced with respect to a directory target.
     * @description Note that there is one special case to this process which
     *     revolves around how to resolve against paths which end with a file
     *     reference. When dealing with ~lib/foo.xml relative to ~lib we can
     *     see it should be ./foo.xml, but what about when we have
     *     ~lib/foo.xml relative to ~lib/bar.xml? Is that ./foo.xml or
     *     ../foo.xml. The answer depends on whether bar.xml is a file or
     *     directory reference, hence the flag.
     * @param {String} secondPath The path to be relative to.
     * @param {Boolean} filePath True if the absolute (second) path includes a
     *     file reference. This is important since the offset is relative to
     *     directories, not files.
     * @returns {String}
     * @todo
     */

    return TP.uriRelativeToPath(this.getLocation(), secondPath, filePath);
});

//  ------------------------------------------------------------------------

TP.core.URL.Inst.defineMethod('$getPrimaryResource',
function(aRequest, filterResult) {

    /**
     * @name $getPrimaryResource
     * @synopsis Returns the resource referenced by the receiver's primary href,
     *     the portion prior to any #-delimited fragment for those schemes for
     *     which a fragment is valid.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @param {Boolean} filterResult True if the resource result will be used
     *     directly and should be filtered to match any resultType definition
     *     found in the request. The default is false.
     * @returns {Object} The resource or TP.sig.Response when async.
     * @todo
     */

    var url,
        subrequest,
        refresh,
        async,
        thisref,
        response,
        result;

    TP.stop('break.uri_resource');

    //  TODO:   do we need a fragment check here for any reason?
    if ((url = this.getPrimaryURI()) !== this) {
        return url.$getPrimaryResource(aRequest, filterResult);
    }

    //  If we're going to have to request the data then the key thing we
    //  want to avoid is having an incoming request complete() before the
    //  entire process is finished. That means ensuring we have a clean
    //  subrequest instance we can locally modify.
    subrequest = this.constructSubRequest(aRequest);

    //  may need to force refresh to true if the content hasn't been loaded
    if (!this.isLoaded() || TP.notValid(refresh = subrequest.at('refresh'))) {
        refresh = !this.isLoaded();
    }

    //  verify sync/async and warn when inbound value doesn't match up.
    async = this.rewriteRequestMode(subrequest);

    //  put in our "request" for sync/async, but be aware the handler
    //  gets the final say during load processing.
    subrequest.atPut('async', async);

    //  capture a this reference for our complete routine below.
    thisref = this;

    subrequest.defineMethod(
            'completeJob',
            function(aResult) {

                    var resultType,
                        result;

                    //  Default our result, and filter if requested. We do this
                    //  here as well to ensure we don't complete() an incoming
                    //  request with unfiltered result data.
                    result = aResult;

                    if (TP.isTrue(filterResult) && TP.isValid(aResult)) {
                        resultType =
                            TP.ifKeyInvalid(aRequest, 'resultType', null);
                        result = thisref.$getFilteredResult(aResult,
                                                            resultType,
                                                            false);

                        //  rewrite the request result object so we hold on to
                        //  the processed content rather than the inbound
                        //  content.
                        subrequest.set('result', result);
                    }

                    //  Make sure the cache value is updated if the
                    //  getFilteredResult() call above changed what it was
                    //  filtering.
                    thisref.set('resource', result);

                    if (TP.canInvoke(aRequest, 'complete')) {
                        aRequest.complete(result);
                    }
            });

    subrequest.defineMethod(
            'failJob',
            function(aFaultCode, aFaultString) {

                    if (TP.canInvoke(aRequest, 'fail')) {
                        aRequest.fail(aFaultCode, aFaultString);
                    }
            });

    //  refresh will have been forced to true when we're not loaded, so
    //  we'll load() any time explicitly asked to, or when unloaded.
    if (refresh) {
        //  ensure refresh is true in the request and not just defaulted
        subrequest.atPut('refresh', true);

        //  Don't forget that this could be asynchronous....
        response = this.load(subrequest);

        //  re-read the request in case load() processing rewrote the
        //  request mode on us.
        async = this.rewriteRequestMode(subrequest);
    } else {
        result = this.$get('resource');

        // Fake completion of the subrequest and related request.
        subrequest.complete(result);
    }

    if (async) {
        //  if we have a response we must have done a refresh, otherwise
        //  we're working with whatever data we had cached. In that case we
        //  need to construct a response wrapping that value so we can fake
        //  the async operation in terms of return value.
        if (TP.notValid(response)) {
            //  didn't do a refresh so we got the data synchronously from
            //  our cache. now we just need to "fake" a response, which we
            //  want to associate with the original request object if there
            //  was one.
            if (TP.canInvoke(aRequest, 'constructResponse')) {
                response = aRequest.constructResponse();
            } else {
                response = subrequest.constructResponse();
            }
        }

        return response;
    }

    //  if we're not running async then the subrequest will be complete and
    //  we can return whatever result was produced.
    return subrequest.get('result');
});

//  ------------------------------------------------------------------------

TP.core.URL.Inst.defineMethod('updateResourceCache',
function(aRequest) {

    /**
     * @name updateResourceCache
     * @synopsis Refreshes the receiver's content caches using the result data
     *     found in aRequest. This method is called from both the asynchronous
     *     and synchronous forks of the getResource call.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {Object} The resource stored in the cache on completion.
     */

    var contentType,

        result,
        dat,
        dom,
        tname,

        path,
        entry,
        key,
        map,
        item,

        resource,
        handler,
        type,

        mime;

    TP.stop('break.uri_cache');

    //  TODO:   verify the receiver should cache anything...it should be
    //  either a "caching" URI (whatever that means) or a primary URI.

    if (TP.notValid(aRequest)) {
        return this.raise('TP.sig.InvalidParameter',
                            'No request object.');
    }

    //  Certain operations like save() will return empty or non-relevant
    //  results on completion. We don't refresh content from those results,
    //  which will be flagged with a false value for refreshContent.
    if (TP.isFalse(aRequest.at('refreshContent'))) {
        return this.$get('resource');
    }

    //  the default mime type can often be determined by the Content-Type
    //  header but we have to split off any charset encoding portion
    contentType = this.getHeader('Content-Type');
    if (TP.isString(contentType)) {
        contentType = contentType.split(';').first().trim();
    }

    //  Note that we set the 'default' MIME type here, which denotes
    //  the MIME type that was handed to us via the web server. We'll
    //  try to compute a more specific MIME type when getMIMEType() is
    //  called for the first time.
    this.set('defaultMIMEType', contentType, false);

    //  capture our current resource so we can replace wrapped content
    //  without replacing the container when possible.
    resource = this.$get('resource');

    //  ---
    //  discriminate the "raw data" of the result
    //  ---

    //  capture the raw result data from the request. This is typically
    //  a string, node, or pair based on the original request parameters.
    result = aRequest.getResult();
    if (TP.isArray(result) && (result.getSize() === 2)) {
        dat = result.first();
        dom = result.last();

        //  TODO: what if it's an array that doesn't contain a string and a
        //  node?
    } else if (TP.isNode(result)) {
        dom = result;
    } else if (TP.isXHR(result)) {
        dat = result.responseText;

        try {
            dom = result.responseXML;

            //  IE has the nasty habit of making an empty '#document' node
            //  here that passes TP.isNode(...) tests, but has no content
            //  because it couldn't be parsed into real XML.
            if (dom.childNodes.length === 0) {
                dom = null;
            }
        } catch (e) {
            dom = TP.node(result.responseText);
        }
    } else {
        dat = result;
    }

    //  ---
    //  Wrap content in best-fit container.
    //  ---

    //  result content handler invocation...if possible.
    handler = aRequest.at('contentHandler');
    if (TP.notValid(handler)) {
        //  check on uri mapping to see if the URI maps define a wrapper.
        if (TP.notFalse(this.isMappedURI())) {
            entry = TP.core.URI.$getURIEntry(this);

            //  the entry for the URI caches lookup results by 'profile' key
            //  so we need to get that to see if a content handler was
            //  defined. by passing no profile we get the one for the
            //  current runtime environment, and we turn off wildcard
            //  generation to get explicit values
            key = TP.core.URI.$getURIProfileKey(null, false);

            if (TP.notValid(map = entry.at(key))) {
                path = TP.uriExpandPath(this.asString()).split('#').at(0);
                map = TP.core.URI.$getURIMapForKey(path, entry, key);
            }

            if (TP.isValid(map)) {
                if (TP.isValid(item = map.at('mapping'))) {
                    handler = item.at('tibet:contenthandler');
                } else if (TP.isValid(item = map.at('delegate'))) {
                    handler = item.at('tibet:contenthandler');
                }
            }
        }

        if (TP.notValid(handler)) {
            //  other possibility is a wrapper based on Content-type header
            //  or MIME value from the response itself.
            mime = this.getMIMEType();
            handler = TP.ietf.Mime.getConcreteType(mime);
        } else {
            //  Make sure that handler is a type.
            handler = TP.sys.require(handler);
        }
    }

    if (TP.isType(handler)) {
        type = TP.sys.require(handler);
        if (TP.canInvoke(type, 'constructContentObject')) {
            //  NOTE that this returns us a "content object" whose purpose
            //  is to be able to "reconstitute" the data as needed
            result = type.constructContentObject(this, dom || dat);
            if (TP.notValid(result)) {
                return this.raise('',
                    'Content handler failed to produce output.');
            } else {
                this.$set('resource', result, false);
            }
        } else {
            return this.raise('TP.sig.InvalidParameter',
                            'Content handler API not supported.');
        }
    } else if (TP.isNode(dom)) {
        //  wait for wrapping during post-processing below.
        result = dom;
    } else if (TP.isString(dat)) {
        //  when looking for a content object (a text-specific object)
        //  we work from MIME type as a starting point. Proper XML won't
        //  normally be run through this routine since getContent looks
        //  for a node wrapper first. we're normally dealing with
        //  non-XML content here -- like CSS, JSON, etc.

        mime = this.getMIMEType();
        type = TP.ietf.Mime.getConcreteType(mime);

        if (TP.canInvoke(type, 'constructContentObject')) {
            //  NOTE that this returns us a "content object" whose purpose
            //  is to be able to "reconsitute" the data as needed
            result = type.constructContentObject(this, dat);
            if (TP.isValid(result)) {
                this.$set('resource', result, false);
            }
        } else {
            //  No concrete handler type for the MIME type? Use the string.
            result = dat;
        }
    } else if (TP.isKindOf(dat, 'TP.lang.Hash')) {
        tname = dat.at('type');
        if (TP.isString(tname) &&
            TP.isType(type = TP.sys.getTypeByName(tname)) &&
            TP.canInvoke(type, 'constructContentObject')) {
            result = type.constructContentObject(this, dat);
            if (TP.isValid(result)) {
                this.$set('resource', result, false);
            }
        }
    } else {
        //  some other form of non-standard result object.
        result = TP.ifInvalid(dom, dat);
    }

    //  ---
    //  post-process to maintain internal containers.
    //  ---

    if (TP.canInvoke(result, 'getNativeNode')) {
        //  result _is_ a wrapper object of some form.
        this.$set('resource', result, false);
    } else if (TP.canInvoke(resource, 'setNativeNode') && TP.isNode(result)) {
        TP.ifTrace(TP.$DEBUG && TP.$VERBOSE) ?
            TP.sys.logIO('Refreshing current node container.',
                        TP.TRACE) : 0;

        resource.setNativeNode(result);
    } else if (TP.isNode(result)) {
        TP.ifTrace(TP.$DEBUG && TP.$VERBOSE) ?
            TP.sys.logIO('Creating new node container.',
                        TP.TRACE) : 0;

        //  note that we pass ourselves along to establish "ownership"
        result = TP.core.Node.construct(result);
        result.set('uri', this);

        this.$set('resource', result, false);
    } else {
        this.$set('resource', result, false);
    }

    //  NOTE that callers are responsible for defining the context of
    //  whether the resulting data dirties/loads the URI in question.

    //  clear any expiration computations.
    this.expire(false);

    return this.$get('resource');
});

//  ------------------------------------------------------------------------
//  Content Processing
//  ------------------------------------------------------------------------

TP.core.URL.Inst.defineMethod('hasReachedPhase',
function(targetPhase, targetPhaseList) {

    /**
     * @name hasReachedPhase
     * @synopsis Returns true if the receiver's content has been processed to
     *     the phase defined, relative to an optional phase list.
     * @param {Constant} targetPhase A TIBET content "process phase" string such
     *     as 'Compile'.
     * @param {Array} targetPhaseList An array of phase names. The default is
     *     TP.core.TSH.NOCACHE.
     * @returns {Boolean} Whether or not the content of the receiver has reached
     *     the supplied phase in its processing.
     * @todo
     */

    var content;

    //  if we're not loaded we can't have reached a particular phase.
    if (!this.isLoaded()) {
        return false;
    }

    //  force refresh to false, we only want cached data access here. NOTE
    //  that this avoids any async issues as well.
    content = this.getResource(TP.hc('refresh', false, 'async', false));
    if (TP.canInvoke(content, 'hasReachedPhase')) {
        return content.hasReachedPhase(targetPhase, targetPhaseList);
    }

    //  no content? can't have reached any phase then.
    return false;
});

//  ------------------------------------------------------------------------

TP.core.URL.Inst.defineMethod('processTP_sig_Request',
function(aRequest) {

    /**
     * @name processTP_sig_Request
     * @synopsis Processes the receiver's content, typically by dispatching to
     *     the receiver's content object itself.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request or parameter
     *     hash with control parameters. The 'targetPhase' parameter is the most
     *     important here. Default is 'Finalized'.
     * @returns {Object} The processing results.
     * @todo
     */

    var request,
        subrequest,
        fragment,
        thisref,
        async;

    TP.stop('break.uri_process');

    //  This request will be used for transformation processing.
    request = this.constructSubRequest(aRequest);
    request.atPutIfAbsent('targetPhase', 'Finalize');

    //  The subrequest here is used for content acquisition.
    subrequest = this.constructSubRequest(aRequest);

    fragment = this.getFragment();
    thisref = this;

    subrequest.defineMethod(
            'completeJob',
            function(aResult) {

                    var resource,
                        result;

                    resource = TP.tpnode(aResult);
                    if (TP.canInvoke(resource, 'transform')) {
                        //  Force XMLBase and TIBET src attributes.
                        thisref.$setPrimaryResource(resource);

                        result = TP.process(resource, request);

                        if (request.didFail()) {
                            aRequest.fail(request.getFaultCode(),
                                          request.getFaultText());
                            subrequest.fail(request.getFaultCode(),
                                          request.getFaultText());
                            return;
                        }

                        //  rewrite the request result object so we hold on to
                        //  the processed content rather than the inbound
                        //  content.
                        subrequest.set('result', result);

                        //  TODO: verify this is correct in all cases, and
                        //  decide if we need to assign a "save result" flag to
                        //  control this.
                        //  What if we wanted to reprocess each time? refresh
                        //  seems like overhead to fetch source rather than
                        //  reprocessing.

                        //  the processed content should become the new resource
                        thisref.set('resource', result);
                    }

                    //  Inform any originally inbound request of our status.
                    if (TP.canInvoke(aRequest, 'complete')) {
                        //  Note that this could be null if there's no result,
                        //  or if the transform call isn't supported, or if the
                        //  transform simply produces a null result.
                        aRequest.complete(result);
                    }
            });

    subrequest.defineMethod('failJob',
    function(aFaultCode, aFaultString) {

            //  Inform any originally inbound request of our status.
            if (TP.canInvoke(aRequest, 'fail')) {
                aRequest.fail(aFaultCode, aFaultString);
            }
    });

    //  trigger the invocation and rely on the handlers for the rest.
    this.getResource(subrequest);

    //  re-read the request in case load() processing rewrote the
    //  request mode on us.
    async = this.rewriteRequestMode(subrequest);
    if (async) {
        //  if we're async then the data may not be ready, we need to return
        //  a viable response object instead.
        if (TP.canInvoke(aRequest, 'constructResponse')) {
            return aRequest.constructResponse();
        } else {
            return subrequest.constructResponse();
        }
    }

    return subrequest.get('result');
});

//  ------------------------------------------------------------------------
//  Storage Management
//  ------------------------------------------------------------------------

TP.core.URL.Inst.defineMethod('load',
function(aRequest) {

    /**
     * @name load
     * @synopsis Loads the content of the receiver from whatever is the
     *     currently routed storage location. This method relies on both
     *     rewriting and routing which ultimately hand off to a
     *     TP.core.URIHandler of some type to perform the actual load.
     * @description This method is rarely called directly, it's typically
     *     invoked by the get*Content() calls when the receiver has not yet been
     *     loaded, or when a refresh is being requested. Note that this is a
     *     "routed" action, meaning the URI undergoes rewriting and routing as
     *     part of the load process.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request,
        url,
        handler;

    TP.stop('break.uri_load');

    TP.ifTrace(TP.$DEBUG && TP.$VERBOSE) ?
        TP.sys.logIO('Loading content data for ID: ' +
                    TP.ifInvalid(this.getLocation(), 'FROM_SOURCE'),
                    TP.TRACE) : 0;

    request = this.constructRequest(aRequest);

    //  rewriting always comes first. if we end up altering the actual URI
    //  during this process then we're not the "keeper of the data", the
    //  rewritten URI instance is
    url = this.rewrite(request);

    //  clear our current resource data...we don't keep it in case this call
    //  fails we don't want the old data to be mistaken for the new stuff.
    this.$set('resource', null, false);

    //  route the load operation so we get the right handler based on any
    //  rewriting and routing logic in place for the original URI
    request.atPut('route', 'load');
    handler = url.route(this, request);

    return handler.load(url, request);
});

//  ------------------------------------------------------------------------

TP.core.URL.Inst.defineMethod('nuke',
function(aRequest) {

    /**
     * @name nuke
     * @synopsis Destroys the target URL at the storage location. We'd have
     *     called this delete but that's a JS keyword.
     * @description This method is a "routed" action, meaning the URI undergoes
     *     rewriting and routing as part of the nuke process. This may, as you
     *     might expect, alter the physical location being targeted for
     *     destruction. You should probably verify these targets before invoking
     *     nuke.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request,
        url,
        handler;

    TP.stop('break.uri_nuke');

    //  TODO:   when the receiver has a fragment what then? Are we supposed
    //  to remove only the fragment subset of the receiver?

    request = this.constructRequest(aRequest);

    url = this.rewrite(request);

    request.atPut('route', 'nuke');
    handler = url.route(this, request);

    return handler.nuke(url, request);
});

//  ------------------------------------------------------------------------

TP.core.URL.Inst.defineMethod('save',
function(aRequest) {

    /**
     * @name save
     * @synopsis Saves the receiver's content to its URI path. The request's
     *     fileMode key defaults to 'w' so that any existing content is replaced
     *     when operating on file URIs.
     * @description This method is a "routed" action, meaning the URI undergoes
     *     rewriting and routing as part of the save process. This may, as you
     *     might expect, alter the physical location in which the data is
     *     stored.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     * @todo
     */

    var request,
        url,
        handler;

    TP.stop('break.uri_save');

    //  TODO:   when the receiver has a fragment what then? Should just
    //          update "document href" and save that?

    request = this.constructRequest(aRequest);

    //  rewriting means we'll get to the concrete URI for the receiver so we
    //  put the data where it really belongs
    url = this.rewrite(request);

    request.atPut('route', 'save');
    handler = url.route(this, request);

    return handler.save(url, request);
});

//  ========================================================================
//  TP.core.ChromeExtURL
//  ========================================================================

/**
 * @type {TP.core.ChromeExtURL}
 * @synopsis A subtype of TP.core.URL specific to the Chrome Extension scheme.
 */

//  ------------------------------------------------------------------------

TP.core.URL.defineSubtype('ChromeExtURL');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.core.ChromeExtURL.Type.defineConstant('SCHEME', 'chrome-extension');

TP.core.ChromeExtURL.registerForScheme('chrome-extension');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.ChromeExtURL.Type.defineMethod('$getDefaultHandler',
function(aURI, aRequest) {

    /**
     * @name $getDefaultHandler
     * @synopsis Returns the default handler for a URI and request pair. For
     *     non-mapped HTTP urls this is the TP.core.HTTPURLHandler type.
     * @param {TP.core.URI|String} aURI The URI to obtain the default handler
     *     for.
     * @param {TP.sig.Request} aRequest The request whose values should inform
     *     the routing assignment.
     * @returns {TP.lang.RootObject.<TP.core.URIHandler>} A TP.core.URIHandler
     *     subtype type object or a type object conforming to that interface.
     * @todo
     */

    return TP.core.FileURLHandler;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.ChromeExtURL.Inst.defineMethod('$parseSchemeSpecificPart',
function(schemeSpecificString) {

    /**
     * @name $parseSchemeSpecificPart
     * @synopsis Parses inbound URI string content in a fashion specific to the
     *     scheme(s) being managed by the receiver.
     * @param {String} schemeSpecificString A String containing the
     *     "scheme-specific-part" of a URI.
     * @returns {TP.lang.Hash} The parsed URI 'components'.
     */

    this.callNextMethod();

    //  TODO TODO TODO TODO TODO
    //  TODO: relying on TP.lang.Hash for parsing is a poor design, we
    //  should change that so the parsing is local to this type. Here, we
    //  invoke the parser directly because of the ambiguities with the style
    //  string parser.
    return TP.lang.Hash.URI_STRING_PARSER('chrome-extension:' +
        schemeSpecificString);
});

//  ========================================================================
//  TP.core.HTTPURL
//  ========================================================================

/**
 * @type {TP.core.HTTPURL}
 * @synopsis A subtype of TP.core.URL specific to the HTTP scheme.
 */

//  ------------------------------------------------------------------------

TP.core.URL.defineSubtype('HTTPURL');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  note that by setting this to http we allow https to match as well
TP.core.HTTPURL.Type.defineConstant('SCHEME', 'http');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  HTTP URIs can support access via either sync or async requests
TP.core.HTTPURL.Type.defineAttribute('supportedModes',
                                    TP.core.SyncAsync.DUAL_MODE);
TP.core.HTTPURL.Type.defineAttribute('mode',
                                    TP.core.SyncAsync.ASYNCHRONOUS);

TP.core.HTTPURL.registerForScheme('http');
TP.core.HTTPURL.registerForScheme('https');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.HTTPURL.Type.defineMethod('$getDefaultHandler',
function(aURI, aRequest) {

    /**
     * @name $getDefaultHandler
     * @synopsis Returns the default handler for a URI and request pair. For
     *     non-mapped HTTP urls this is the TP.core.HTTPURLHandler type.
     * @param {TP.core.URI|String} aURI The URI to obtain the default handler
     *     for.
     * @param {TP.sig.Request} aRequest The request whose values should inform
     *     the routing assignment.
     * @returns {TP.lang.RootObject.<TP.core.URIHandler>} A TP.core.URIHandler
     *     subtype type object or a type object conforming to that interface.
     * @todo
     */

    return TP.core.HTTPURLHandler;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  cached redirection location
TP.core.HTTPURL.Inst.defineAttribute('location');

//  note that there are 'scheme', 'path' and 'fragment' ivars on
//  TP.core.URI / TP.core.URL
TP.core.HTTPURL.Inst.defineAttribute('user');
TP.core.HTTPURL.Inst.defineAttribute('password');
TP.core.HTTPURL.Inst.defineAttribute('host');
TP.core.HTTPURL.Inst.defineAttribute('port');
TP.core.HTTPURL.Inst.defineAttribute('query');
TP.core.HTTPURL.Inst.defineAttribute('queryDict');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.HTTPURL.Inst.defineMethod('$initURIComponents',
function(parts) {

    /**
     * @name $initURIComponents
     * @synopsis Performs any post-parsing initialization appropriate for the
     *     URI components which were parsed during scheme-specific parsing.
     * @param {TP.lang.Hash} parts The parsed URI components.
     * @returns {TP.core.URI} The receiver.
     */

    this.callNextMethod();

    this.set('user', parts.at('user'));
    this.set('password', parts.at('password'));

    this.set('host', parts.at('host'));
    this.set('port', parts.at('port'));

    this.set('path', parts.at('path'));
    this.set('query', parts.at('query'));
    this.set('queryDict', parts.at('queryDict'));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.HTTPURL.Inst.defineMethod('$parseSchemeSpecificPart',
function(schemeSpecificString) {

    /**
     * @name $parseSchemeSpecificPart
     * @synopsis Parses inbound URI string content in a fashion specific to the
     *     scheme(s) being managed by the receiver.
     * @param {String} schemeSpecificString A String containing the
     *     "scheme-specific-part" of a URI.
     * @returns {TP.lang.Hash} The parsed URI 'components'.
     */

    this.callNextMethod();

    //  TODO TODO TODO TODO TODO
    //  TODO: relying on TP.lang.Hash for parsing is a poor design, we
    //  should change that so the parsing is local to this type. Here, we
    //  invoke the parser directly because of the ambiguities with the style
    //  string parser.

    //  TODO: Also, what about 'https:' URLs here - we're ASSuming 'http:'
    return TP.lang.Hash.URI_STRING_PARSER('http:' + schemeSpecificString);
});

//  ------------------------------------------------------------------------

TP.core.HTTPURL.Inst.defineMethod('httpDelete',
function(aRequest) {

    /**
     * @name httpDelete
     * @synopsis Uses the receiver as a target URI and invokes an HTTP DELETE
     *     with aRequest.
     * @param {TP.sig.Request} request The original request being processed.
     * @returns {Object|TP.sig.Response} A response when async, object
     *     otherwise.
     */

    return TP.httpDelete(this.asString(), aRequest);
});

//  ------------------------------------------------------------------------

TP.core.HTTPURL.Inst.defineMethod('httpGet',
function(aRequest) {

    /**
     * @name httpGet
     * @synopsis Uses the receiver as a target URI and invokes an HTTP GET
     *     with aRequest.
     * @param {TP.sig.Request} request The original request being processed.
     * @returns {Object|TP.sig.Response} A response when async, object
     *     otherwise.
     */

    return TP.httpGet(this.asString(), aRequest);
});

//  ------------------------------------------------------------------------

TP.core.HTTPURL.Inst.defineMethod('httpHead',
function(aRequest) {

    /**
     * @name httpHead
     * @synopsis Uses the receiver as a target URI and invokes an HTTP HEAD
     *     with aRequest.
     * @param {TP.sig.Request} request The original request being processed.
     * @returns {Object|TP.sig.Response} A response when async, object
     *     otherwise.
     */

    return TP.httpHead(this.asString(), aRequest);
});

//  ------------------------------------------------------------------------

TP.core.HTTPURL.Inst.defineMethod('httpOptions',
function(aRequest) {

    /**
     * @name httpOptions
     * @synopsis Uses the receiver as a target URI and invokes an HTTP OPTIONS
     *     with aRequest.
     * @param {TP.sig.Request} request The original request being processed.
     * @returns {Object|TP.sig.Response} A response when async, object
     *     otherwise.
     */

    return TP.httpOptions(this.asString(), aRequest);
});

//  ------------------------------------------------------------------------

TP.core.HTTPURL.Inst.defineMethod('httpPost',
function(aRequest) {

    /**
     * @name httpPost
     * @synopsis Uses the receiver as a target URI and invokes an HTTP POST
     *     with aRequest.
     * @param {TP.sig.Request} request The original request being processed.
     * @returns {Object|TP.sig.Response} A response when async, object
     *     otherwise.
     */

    return TP.httpPost(this.asString(), aRequest);
});

//  ------------------------------------------------------------------------

TP.core.HTTPURL.Inst.defineMethod('httpPut',
function(aRequest) {

    /**
     * @name httpPut
     * @synopsis Uses the receiver as a target URI and invokes an HTTP PUT
     *     with aRequest.
     * @param {TP.sig.Request} request The original request being processed.
     * @returns {Object|TP.sig.Response} A response when async, object
     *     otherwise.
     */

    return TP.httpPut(this.asString(), aRequest);
});

//  ------------------------------------------------------------------------

TP.core.HTTPURL.Inst.defineMethod('httpTrace',
function(aRequest) {

    /**
     * @name httpTrace
     * @synopsis Uses the receiver as a target URI and invokes an HTTP TRACE
     *     with aRequest.
     * @param {TP.sig.Request} request The original request being processed.
     * @returns {Object|TP.sig.Response} A response when async, object
     *     otherwise.
     */

    return TP.httpTrace(this.asString(), aRequest);
});

//  ========================================================================
//  TP.core.FileURL
//  ========================================================================

/**
 * @type {TP.core.FileURL}
 * @synopsis A URL specific to file references.
 */

//  ------------------------------------------------------------------------

TP.core.URL.defineSubtype('FileURL');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.core.FileURL.Type.defineConstant('SCHEME', 'file');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  'file:' scheme is sync-only so configure for that
TP.core.FileURL.Type.defineAttribute('supportedModes',
                                    TP.core.SyncAsync.SYNCHRONOUS);
TP.core.FileURL.Type.defineAttribute('mode',
                                    TP.core.SyncAsync.SYNCHRONOUS);

TP.core.FileURL.registerForScheme('file');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.FileURL.Type.defineMethod('$getDefaultHandler',
function(aURI, aRequest) {

    /**
     * @name $getDefaultHandler
     * @synopsis Returns the default handler for a URI and request pair. For
     *     non-mapped HTTP urls this is the TP.core.HTTPURLHandler type.
     * @param {TP.core.URI|String} aURI The URI to obtain the default handler
     *     for.
     * @param {TP.sig.Request} aRequest The request whose values should inform
     *     the routing assignment.
     * @returns {TP.lang.RootObject.<TP.core.URIHandler>} A TP.core.URIHandler
     *     subtype type object or a type object conforming to that interface.
     * @todo
     */

    return TP.core.FileURLHandler;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  note that there are 'scheme', 'path' and 'fragment' ivars on
//  TP.core.URI / TP.core.URL

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.FileURL.Inst.defineMethod('$initURIComponents',
function(parts) {

    /**
     * @name $initURIComponents
     * @synopsis Performs any post-parsing initialization appropriate for the
     *     URI components which were parsed during scheme-specific parsing.
     * @param {TP.lang.Hash} parts The parsed URI components.
     * @returns {TP.core.URI} The receiver.
     */

    var thePath;

    this.callNextMethod();

    if (TP.notEmpty(thePath = parts.at('path')) &&
        thePath.startsWith('/')) {
        thePath = thePath.slice(1);
    }

    this.set('path', thePath);

    //  generate the internal href
    this.asString();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.FileURL.Inst.defineMethod('$parseSchemeSpecificPart',
function(schemeSpecificString) {

    /**
     * @name $parseSchemeSpecificPart
     * @synopsis Parses inbound URI string content in a fashion specific to the
     *     scheme(s) being managed by the receiver.
     * @param {String} schemeSpecificString A String containing the
     *     "scheme-specific-part" of a URI.
     * @returns {TP.lang.Hash} The parsed URI 'components'.
     */

    this.callNextMethod();

    //  TODO TODO TODO TODO TODO
    //  TODO: relying on TP.lang.Hash for parsing is a poor design, we
    //  should change that so the parsing is local to this type. Here, we
    //  invoke the parser directly because of the ambiguities with the style
    //  string parser.
    return TP.lang.Hash.URI_STRING_PARSER('file:' + schemeSpecificString);
});

//  ------------------------------------------------------------------------

TP.core.FileURL.Inst.defineMethod('$getPath',
function(url) {

    /**
     * @name $getPath
     * @synopsis Parses the url for the path portion as that concept is defined
     *     for the receiving type. Note that different URI types consider
     *     different parts of their HREF to be the 'path'.
     * @param {String} url The URI string to parse.
     * @returns {String} The path subset of the string provided.
     */

    var path;

    //  by default the 'path' is whatever comes after the scheme
    if (TP.boot.isWin()) {
        path = url.slice(url.indexOf(':///') + 4);
    } else {
        path = url.slice(url.indexOf('://') + 3);
    }

    return path;
});

//  ========================================================================
//  TP.core.JSURI
//  ========================================================================

/**
 * @type {TP.core.JSURI}
 * @synopsis A subtype of TP.core.URI that stores a 'javascript:' URI. These
 *     URIs are used in web browsers when a JavaScript expression needs to be
 *     executed upon traversal of the URI. This type is also used as the content
 *     object for text/javascript MIME content.
 */

//  ------------------------------------------------------------------------

TP.core.URI.defineSubtype('JSURI');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.core.JSURI.Type.defineConstant('JSURI_REGEX', TP.rc('javascript:\\s*'));

TP.core.JSURI.Type.defineConstant('SCHEME', 'javascript');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  'javascript:' scheme is sync-only so configure for that
TP.core.JSURI.Type.defineAttribute('supportedModes',
                                TP.core.SyncAsync.SYNCHRONOUS);
TP.core.JSURI.Type.defineAttribute('mode',
                                TP.core.SyncAsync.SYNCHRONOUS);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.JSURI.Inst.defineAttribute('jsSource');

TP.core.JSURI.registerForScheme('javascript');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.JSURI.Type.defineMethod('constructContentObject',
function(aURI, content) {

    /**
     * @name constructContentObject
     * @synopsis Returns a content object for the URI provided. This method is
     *     invoked as part of MIME-type specific handling for URIs vended as
     *     text/javascript or a similar MIME type specifying that their content
     *     is JavaScript source code.
     * @param {TP.core.URI} aURI The URI containing JavaScript source.
     * @param {String} content The string content to process.
     * @returns {String} The JavaScript source code in text form.
     * @todo
     */

    return content;
});

//  ------------------------------------------------------------------------

TP.core.JSURI.Inst.defineMethod('$getPath',
function(url) {

    /**
     * @name $getPath
     * @synopsis Parses the url for the path portion as that concept is defined
     *     for the receiving type. Note that different URI types consider
     *     different parts of their HREF to be the 'path'.
     * @param {String} url The URI string to parse.
     * @returns {String} The path subset of the string provided.
     */

    //   There is no valid "path" concept in a javascript: URI.
    return '';
});

//  ------------------------------------------------------------------------

TP.core.JSURI.Type.defineMethod('validate',
function(aString) {

    /**
     * @name validate
     * @synopsis Returns true if the string parameter is valid JavaScript. NOTE
     *     that this method functions by using eval() which means it has the
     *     side-effect of running the code string.
     * @param {String} aString A string to test.
     * @returns {Boolean} Whether or not JavaScript code could be successfully
     *     evaluated from the supplied String.
     */

    try {
        //  TODO:   parse/tokenize first looking for nasty security issues?

        //  TODO:   ?eval in separate context...of course that might create
        //          issues if there were dependencies on TIBET etc.
        eval(aString);

        return true;
    } catch (e) {
        return false;
    }
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.JSURI.Inst.defineMethod('isPrimaryURI',
function() {

    /**
     * @name isPrimaryURI
     * @synopsis Returns true if the receiver is a primary URI, meaning it has
     *     no fragment portion and can store data. JavaScript URIs are always
     *     primary URIs, there is no concept of a fragment.
     * @returns {Boolean} True if the receiver is a primary URI.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.core.JSURI.Inst.defineMethod('$parseSchemeSpecificPart',
function(schemeSpecificString) {

    /**
     * @name $parseSchemeSpecificPart
     * @synopsis Parses inbound URI string content in a fashion specific to the
     *     scheme(s) being managed by the receiver.
     * @param {String} schemeSpecificString A String containing the
     *     "scheme-specific-part" of a URI.
     * @returns {TP.lang.Hash} The parsed URI 'components'.
     */

    TP.stop('break.uri_parse');

    //  NOTE that the concept of 'primary' and 'fragment' aren't relevant
    //  for this type, so we don't invoke the supertype method here, we set
    //  our primary href directly.
    this.$set('primaryHref',
                this.$get('scheme') + ':' + schemeSpecificString);

    this.$set('jsSource',
                schemeSpecificString.strip(TP.core.JSURI.JSURI_REGEX));

    return;
});

//  ------------------------------------------------------------------------

TP.core.JSURI.Inst.defineMethod('$getPrimaryResource',
function(aRequest, filterResult) {

    /**
     * @name $getPrimaryResource
     * @synopsis Returns the result of evaluating the JS expression represented
     *     by the receiver. Note that while the async flag in aRequest is used
     *     to determine whether the return value is a TP.sig.Response object or
     *     the actual result there's no truly asynchronous processing occurring.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @param {Boolean} filterResult True if the resource result will be used
     *     directly and should be filtered to match any resultType definition
     *     found in the request. The default is false.
     * @returns {Object} The resource or TP.sig.Response when async.
     * @todo
     */

    var request,
        async,

        str,

        $$result,
        result,
        msg,

        resultType,
        response;

    TP.stop('break.uri_resource');

    request = this.constructRequest(aRequest);
    async = this.rewriteRequestMode(request);

    //  get rid of leading javascript: portion so we can eval the rest
    str = this.get('jsSource');
    try {
        //  TODO:   security check
        eval('$$result = ' + str);
        result = $$result;
    } catch (e) {
        msg = TP.sc('Error acquiring resource via: ') + str;
        request.fail(TP.FAILURE, msg);
        result = TP.ec(e, msg);
    }

    if (TP.isTrue(filterResult) && TP.isValid(result)) {
        resultType = TP.ifKeyInvalid(aRequest, 'resultType', null);
        result = this.$getFilteredResult(result, resultType, false);
    }

    //  Simulate async, even when we're not really an async URI type.
    if (async) {
        response = request.constructResponse(result);
        request.complete(result);

        return response;
    }

    //  synchronous? complete any request we might actually have.
    if (TP.canInvoke(aRequest, 'complete')) {
        aRequest.complete(result);
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.core.JSURI.Inst.defineMethod('isDirty',
function(aFlag) {

    /**
     * @name isDirty
     * @synopsis Returns true if the receiver's content has changed since it was
     *     last loaded from it's source URI or content data without being saved.
     * @param {Boolean} aFlag The new value to optionally set.
     * @returns {Boolean} Whether or not the content of the receiver is 'dirty'.
     * @todo
     */

    //  We basically assume that a JS URI would always return new data. This
    //  isn't likely to be true obviously, but we effectively want JS URIs.
    return true;
});

//  ------------------------------------------------------------------------

TP.core.JSURI.Inst.defineMethod('isLoaded',
function(aFlag) {

    /**
     * @name isLoaded
     * @synopsis Returns true if the receiver's content has been loaded either
     *     manually via a setContent or init, or by loading the receiver's URI
     *     location.
     * @param {Boolean} aFlag The new value to optionally set.
     * @returns {Boolean} Whether or not the content of the receiver is loaded.
     * @todo
     */

    //  A JavaScript URI is never considered loaded, it has to be able to
    //  refresh by default in all cases.
    return false;
});

//  ------------------------------------------------------------------------
//  Storage Management
//  ------------------------------------------------------------------------

TP.core.JSURI.Inst.defineMethod('load',
function(aRequest) {

    /**
     * @name load
     * @synopsis For the most part, no-op for JSURIs.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request,
        url,
        handler;

    TP.stop('break.uri_load');

    request = this.constructRequest(aRequest);

    //  rewriting means we'll get to the concrete URI for the receiver so we
    //  put the data where it really belongs
    url = this.rewrite(request);

    request.atPut('route', 'load');

    //  NB: We hard-code 'TP.core.URIHandler' as our handler here, since it
    //  really just completes the request properly and doesn't do much else. See
    //  that type for more information
    handler = TP.core.URIHandler;

    return handler.load(url, request);
});

//  ------------------------------------------------------------------------

TP.core.JSURI.Inst.defineMethod('nuke',
function(aRequest) {

    /**
     * @name nuke
     * @synopsis For the most part, a no-op for JSURIs.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request,
        url,
        handler;

    TP.stop('break.uri_nuke');

    request = this.constructRequest(aRequest);

    //  rewriting means we'll get to the concrete URI for the receiver so we
    //  put the data where it really belongs
    url = this.rewrite(request);

    request.atPut('route', 'nuke');

    //  NB: We hard-code 'TP.core.URIHandler' as our handler here, since it
    //  really just completes the request properly and doesn't do much else. See
    //  that type for more information
    handler = TP.core.URIHandler;

    return handler.nuke(url, request);
});

//  ------------------------------------------------------------------------

TP.core.JSURI.Inst.defineMethod('save',
function(aRequest) {

    /**
     * @name save
     * @synopsis For the most part, a no-op for JSURIs.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     * @todo
     */

    var request,
        url,
        handler;

    TP.stop('break.uri_save');

    request = this.constructRequest(aRequest);

    //  rewriting means we'll get to the concrete URI for the receiver so we
    //  put the data where it really belongs
    url = this.rewrite(request);

    request.atPut('route', 'save');

    //  NB: We hard-code 'TP.core.URIHandler' as our handler here, since it
    //  really just completes the request properly and doesn't do much else. See
    //  that type for more information
    handler = TP.core.URIHandler;

    return handler.save(url, request);
});

//  ========================================================================
//  TP.core.WSURL
//  ========================================================================

/**
 * @type {TP.core.WSURL}
 * @synopsis A subtype of TP.core.URL specific to the WebSocket scheme.
 */

//  ------------------------------------------------------------------------

TP.core.URL.defineSubtype('WSURL');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.core.WSURL.Type.defineConstant('SCHEME', 'ws');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  WebSocket URIs can support only async requests
TP.core.WSURL.Type.defineAttribute('supportedModes',
                                    TP.core.SyncAsync.ASYNCHRONOUS);
TP.core.WSURL.Type.defineAttribute('mode',
                                    TP.core.SyncAsync.ASYNCHRONOUS);

TP.core.WSURL.registerForScheme('ws');
TP.core.WSURL.registerForScheme('wss');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  cached redirection location
TP.core.WSURL.Inst.defineAttribute('webSocketObj');

//  note that there are 'scheme', 'path' and 'fragment' ivars on
//  TP.core.URI / TP.core.URL
TP.core.WSURL.Inst.defineAttribute('host');
TP.core.WSURL.Inst.defineAttribute('port');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.WSURL.Inst.defineMethod('$initURIComponents',
function(parts) {

    /**
     * @name $initURIComponents
     * @synopsis Performs any post-parsing initialization appropriate for the
     *     URI components which were parsed during scheme-specific parsing.
     * @param {TP.lang.Hash} parts The parsed URI components.
     * @returns {TP.core.URI} The receiver.
     */

    this.callNextMethod();

    this.set('host', parts.at('host'));
    this.set('port', parts.at('port'));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.WSURL.Inst.defineMethod('$parseSchemeSpecificPart',
function(schemeSpecificString) {

    /**
     * @name $parseSchemeSpecificPart
     * @synopsis Parses inbound URI string content in a fashion specific to the
     *     scheme(s) being managed by the receiver.
     * @param {String} schemeSpecificString A String containing the
     *     "scheme-specific-part" of a URI.
     * @returns {TP.lang.Hash} The parsed URI 'components'.
     */

    this.callNextMethod();

    //  TODO TODO TODO TODO TODO
    //  TODO: relying on TP.lang.Hash for parsing is a poor design, we
    //  should change that so the parsing is local to this type. Here, we
    //  invoke the parser directly because of the ambiguities with the style
    //  string parser.
    return TP.lang.Hash.URI_STRING_PARSER('ws:' + schemeSpecificString);
});

//  ========================================================================
//  TP.core.TIBETURL
//  ========================================================================

/**
 * @type {TP.core.TIBETURL}
 * @synopsis A subtype of TP.core.URI that stores a 'tibet:' URI. These URIs
 *     provide access to TIBET components, files, and other resources and are
 *     the preferred URI format for TIBET.
 * @description TIBET uses tibet: URIs as a way of referring to things which a
 *     standard URI such as a file: or http: URI can't reference. A common
 *     example is document references which require dynamic relative paths since
 *     file: and http: URIs don't have a way to handle dynamic values.
 *     Canvas-specific addresses are also handled by TIBET URLs as are remote
 *     XMPP-accessible addresses.
 *
 *     TIBET URL FORMAT:
 *
 *     The overall format of a TIBET URL is:
 *
 *     tibet:[node @domain:port]/[resource]/[canvas]/[uri | path]
 *
 *     In this format the [node @domain:port/[resource] segment mirrors the JID
 *     format of the XMPP protocol, allowing TIBET URLs to point to remote
 *     resources addressable via JID. In normal use these values are empty with
 *     the result that all local TIBET URL references begin with tibet:// and
 *     hence appear like "normal" file or http URIs.
 *
 *     The canvas portion allows TIBET URLs to reference objects by their
 *     location within the visual environment of the browser, so an object whose
 *     ID is "OKButton" in one frame is not the same as an object with that ID
 *     in a second frame.
 *
 *     tibet://myWin/#OKButton
 *
 *     You can also use 'uicanvas' as a generic identifier for the current UI
 *     canvas used by the application. This latter option lets you avoid hard
 *     window/frame references in your code:
 *
 *     tibet://uicanvas/#OKButton
 *
 *     Note that for convenience you can also construct a URI from a simple
 *     barename as in:
 *
 *     url = TP.uc('#OKButton'); // OK button in the current UI canvas
 *
 *     becomes
 *
 *     tibet://uicanvas/#OKButton
 *
 *     The remaining element of the tibet: URI scheme is either another URI (a
 *     file:, http:, javascript:, or similar URI format) or an "access path"
 *     understood by TIBET URLs.
 *
 *     TIBET URLS WITH EMBEDDED URIS
 *
 *     For URI-style forms there are a few special cases:
 *      - "virtual" URIs
 *      - URNs
 *      - javascript: URIs.
 *
 *     Any embedded URI starting with ~ is resolved to either a file or http
 *     URI using a simple set of rules modeled on the UNIX concept of "home".
 *     Using this model a single ~ resolves to "app home" or what TIBET refers
 *     to as "app root". All other references can be thought of as "$foo home"
 *     where $foo is "tibet", "lib_xsl", etc.
 *
 *     Note that these virtual URIs ensure that whether you boot from the file
 *     system or over HTTP the URIs will resolve to the proper origin without
 *     code changes on your part.
 *
 *     Specific examples are:
 *
 *     tibet:///~app        app root
 *     tibet:///~lib        lib root
 *     tibet:///~lib_xsl    the library's xslt path
 *
 *     When using a TIBET URL of this form you can leave off the leading
 *     tibet:/// as in:
 *
 *     ~app         app root
 *     ~lib         lib root
 *     ~lib_xsl     the library's xslt path
 *
 *     Note that in these cases the canvas is empty so it defaults to the 'code
 *     frame', effectively a non-visual memory reference where the returned
 *     values are typically going to refer to XML objects, system types, or
 *     instances of TIBET types. It is important to avoid placing a canvas
 *     reference in URIs of this form unless you are specifically asking for an
 *     element within a visual canvas whose ID is the expanded ~ URI string, or
 *     that you provide an explicit prefix of tibet://[canvas]/~... when you are
 *     specifically attempting access to a visual canvas.
 *
 *     In addition to virtual URIs TIBET provides ways to map any data within
 *     your application to a URI, in particular to a URN.
 *
 *     Examples of URNs are urn:tibet:TP.sys (the TP.sys object), or
 *     urn:tibet:TP.sig.Signal (the TP.sig.Signal type), etc.
 *
 *     TIBET URLs can include embedded URN values if necessary, however it's
 *     rarely useful since you can use the URN directly in many cases. However,
 *     if you find that using the urn: syntax is running afoul of the browser
 *     you can embed them via tibet:///.
 *
 *     The final special case is javascript: URIs. You can use a javascript:
 *     URI within a TIBET URL as an alternative way of referring to a
 *     canvas-specific object as in:
 *
 *     tibet://uicanvas/javascript:TP // in the ui canvas
 *
 *     This isn't used often, but occasionally TIBET will build URIs of this
 *     form as a way of "contextualizing" a JavaScript URI. Note that TIBET will
 *     typically insert the canvas specification for you if it isn't found (and
 *     isn't the code frame) so that:
 *
 *     tibet://uicanvas/javascript:TP
 *
 *     becomes
 *
 *     tibet:///javascript:[uicanvasref].TP
 *
 *     Note that by pushing the canvas specification onto the front of any text,
 *     eval()ing the remaining portion will access the context of the named
 *     canvas as its root.
 *
 *     VISUAL vs. NON-VISUAL DOM REFERENCES
 *
 *     Let's revisit the subject of multiple canvases for a moment. As
 *     discussed earlier, the TIBET URL for a button whose ID is "OKButton" in
 *     the page ~app_xml/search.xml when displayed in the uicanvas frame would
 *     be:
 *
 *     tibet://uicanvas/~app_xml/search.xml#OKButton
 *
 *     This might expand, when run via an application hosted and rooted at
 *     http://foo.com/app to an equivalent global ID form of:
 *
 *     tibet://uicanvas/http://foo.com/app/TIBET-INF/xml/search.xml#OKButton
 *
 *     When TIBET sees this it acquires the canvas, verifies that it holds
 *     content from http://foo.com/app/TIBET-INF/xml/search.xml, and then looks
 *     for an element whose id attribute holds OKButton. This is consistent with
 *     web standards if you consider that the OKButton's XPointer reference is
 *     that URI when trying to access it from any other browsing environment.
 *
 *     TIBET treats references in the code frame (those having no canvas
 *     specification) a little differently in that it essentially ignores the
 *     canvas reference and instead uses the URI itself to acquire the resource.
 *     So the same reference to OKButton without a canvas would be:
 *
 *     tibet:///~app_xml/search.xml#OKButton
 *
 *     In response TIBET will reference the "concrete URI":
 *
 *     http://foo.com/app/TIBET-INF/xml/search.xml#OKButton
 *
 *     This URI will be used to acquire the object by loading the file
 *     search.xml from the location provided and then evaluating the XPointer
 *     barename OKButton to get a handle to the button instance in the
 *     non-visual DOM. Note that there will actually be three URIs constructed
 *     and encached in this case:
 *
 *     tibet:///~app_xml/search.xml#OKButton
 *     http://foo.com/app/TIBET-INF/xml/search.xml
 *     http://foo.com/app/TIBET-INF/xml/search.xml#OKButton
 *
 *     The URI in the middle, without the OKButton reference is the one
 *     containing the data for the document search.xml. All XPointer URIs
 *     referencing that root document share the content found at that location
 *     to avoid problems with inconsistent data.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.core.URL.defineSubtype('TIBETURL');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  indexes into the match results from the url splitter regex
TP.core.TIBETURL.Type.defineConstant('JID_INDEX', 1);
TP.core.TIBETURL.Type.defineConstant('RESOURCE_INDEX', 2);
TP.core.TIBETURL.Type.defineConstant('CANVAS_INDEX', 3);
TP.core.TIBETURL.Type.defineConstant('URL_INDEX', 4);
TP.core.TIBETURL.Type.defineConstant('PATH_INDEX', 5);
TP.core.TIBETURL.Type.defineConstant('FRAGMENT_INDEX', 6);

TP.core.TIBETURL.Type.defineConstant('SCHEME', 'tibet');

TP.core.TIBETURL.registerForScheme('tibet');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the canvas (window) name referenced by this URI. this is only used when
//  the value is cacheable, meaning it was explicitly defined in the URI
TP.core.TIBETURL.Inst.defineAttribute('canvasName');

//  a handle to any internally generated URI for file/http references which
//  are resolved from the original TIBET URL string
TP.core.TIBETURL.Inst.defineAttribute('nestedURI');

//  a cached value for whether the instance's path and pointer components
//  are empty, which helps keep getResource running faster
TP.core.TIBETURL.Inst.defineAttribute('uriKey');

//  the URI's original content (prior to any expansion) in split form
//  whole, jid, resource, canvas, path, pointer
TP.core.TIBETURL.Inst.defineAttribute('uriParts');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('init',
function(aURIString) {

    /**
     * @name init
     * @synopsis Initialize the instance. Note that once an instance is
     *     constructed the individual parts of the URI can't be altered,
     *     although variable references (such as uicanvas) may allow it to
     *     resolve to different concrete elements during its life.
     * @param {String} aURIString A String containing a proper URI.
     * @returns {TP.core.URI} The receiver.
     */

    //  make sure we come in with tibet: scheme or that we add it
    if (TP.regex.TIBET_SCHEME.test(aURIString) &&
        TP.regex.TIBET_URI_SPLITTER.test(aURIString)) {
        this.callNextMethod();
    } else if (TP.regex.VIRTUAL_URI_PREFIX.test(aURIString)) {
        //  URIs starting with ~ don't resolve to a canvas.
        this.callNextMethod('tibet:///' + aURIString);
    } else {
        //  before we try to raise we need at least a uri slot.
        this.$set('uri', aURIString);

        return this.raise('TP.sig.InvalidURI',
                    'Invalid TIBET URL prefix or scheme: ' + aURIString);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('$initURIComponents',
function(parts) {

    /**
     * @name $initURIComponents
     * @synopsis Performs any post-parsing initialization appropriate for the
     *     URI components which were parsed during scheme-specific parsing. Note
     *     that TP.core.URI's implementation ensures that the uri, scheme,
     *     primary, and fragment portions of a URI string will be set.
     * @param {TP.lang.Hash} parts The parsed URI components.
     * @returns {TP.core.URI} The receiver.
     */

    var id;

    //  force ID expansion if it didn't already happen. this will also force
    //  our parts to be encached for us
    id = this.getID();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('$parseSchemeSpecificPart',
function(schemeSpecificString) {

    /**
     * @name $parseSchemeSpecificPart
     * @synopsis Parses inbound URI string content in a fashion specific to the
     *     scheme(s) being managed by the receiver.
     * @param {String} schemeSpecificString A String containing the
     *     "scheme-specific-part" of a URI.
     * @returns {TP.lang.Hash} The parsed URI 'components'.
     */

    //  TODO:   replace with logic from getID() and related parsing.
    this.callNextMethod();

    return;
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('asDumpString',
function() {

    /**
     * @name asDumpString
     * @synopsis Returns the receiver as a string suitable for use in log
     *     output. TIBET URLs containing valid resource URIs typically respond
     *     with that string for compatibility with their file/http counterparts.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  content URI.
    if (TP.isEmpty(this.getCanvasName())) {
        return this.getNestedURI().asDumpString();
    }

    //  Otherwise, call up
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @name asHTMLString
     * @synopsis Produces an HTML string representation of the receiver. TIBET
     *     URLs containing valid resource URIs typically respond with that
     *     string for compatibility with their file/http counterparts.
     * @returns {String} The receiver in HTML string format
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  content URI.
    if (TP.isEmpty(this.getCanvasName())) {
        return this.getNestedURI().asHTMLString();
    }

    //  Otherwise, call up
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @name asJSONSource
     * @synopsis Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  content URI.
    if (TP.isEmpty(this.getCanvasName())) {
        return this.getNestedURI().asJSONSource();
    }

    //  Otherwise, call up
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @name asPrettyString
     * @synopsis Produces a pretty string representation of the receiver. TIBET
     *     URLs containing valid resource URIs typically respond with that
     *     string for compatibility with their file/http counterparts.
     * @returns {String} The receiver in pretty string format
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  content URI.
    if (TP.isEmpty(this.getCanvasName())) {
        return this.getNestedURI().asPrettyString();
    }

    //  Otherwise, call up
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @name asString
     * @synopsis Returns a string representation of the receiver. TIBET URLs
     *     containing valid resource URIs typically respond with that string for
     *     compatibility with their file/http counterparts.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.core.TIBETURL's String representation. The default is for
     *     TP.core.TIBETURLs is false, which is different than for most types.
     * @returns {String} The receiver's String representation.
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  content URI.
    if (TP.isEmpty(this.getCanvasName())) {
        return this.getNestedURI().asString(verbose);
    }

    //  Otherwise, call up
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('asXMLString',
function() {

    /**
     * @name asXMLString
     * @synopsis Produces an XML string representation of the receiver. TIBET
     *     URLs containing valid resource URIs typically respond with that
     *     string for compatibility with their file/http counterparts.
     * @returns {String} The receiver in XML string format
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  content URI.
    if (TP.isEmpty(this.getCanvasName())) {
        return this.getNestedURI().asXMLString();
    }

    //  Otherwise, call up
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('getCanvas',
function() {

    /**
     * @name getCanvas
     * @synopsis Returns the canvas (window, frame, iframe) this URI references
     *     by traversing any optional 'paths' defined in our canvas name. If no
     *     canvas name is specified the canvas defaults to the current UI canvas
     *     for TIBET.
     * @returns {Window} The receiver's resource canvas.
     * @todo
     */

    var name;

    //  our canvas name is the starting point, which should be an
    //  optionally dot-separated list of window/frame/iframe names
    name = this.getCanvasName();
    if (TP.notEmpty(name)) {
        return TP.sys.getWindowById(name);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('getCanvasName',
function() {

    /**
     * @name getCanvasName
     * @synopsis Returns the name of the canvas this URI refers to.
     * @returns {String} The receiver's resource canvas name.
     */

    var parts,
        name;

    //  our original split value is here
    parts = this.$get('uriParts');

    //  whole, jid, resource, canvas, path, pointer
    name = parts.at(TP.core.TIBETURL.CANVAS_INDEX);

    if (TP.isEmpty(name)) {
        name = '';  //  leave empty, this URI doesn't specify a canvas.
    } else if ((name === 'uicanvas') || (name === 'UICANVAS')) {
        return TP.sys.getUICanvasName();
    } else if ((name === 'uiroot') || (name === 'UIROOT')) {
        return TP.sys.getUIRootName();
    }

    return name;
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('getNestedURI',
function(forceRefresh) {

    /**
     * @name getNestedURI
     * @synopsis Returns a concrete URI for the resource this URI references.
     *     This is typically the file: or http: URI for the content the receiver
     *     references.
     * @param {Boolean} forceRefresh True will force any cached value for
     *     resource URI to be ignored.
     * @returns {TP.core.URI} A concrete URI if the receiver resolves to one.
     */

    var url,
        parts,
        path;

    //  When there's a canvas reference the receiver is a pointer to a DOM
    //  element and not an indirect reference to some other concrete URI. In
    //  that case we don't consider ourselves to have a nested URI.
    if (TP.notEmpty(this.getCanvasName())) {
        return;
    }

    //  we don't allow runtime alteration to virtual paths largely due to
    //  the fact that we cache this value. clearing it should allow a URI to
    //  "float" again
    if (TP.notTrue(forceRefresh)) {
        if (TP.isURI(url = this.$get('nestedURI'))) {
            return url;
        }
    }

    //  work from the path...NOTE NOTE NOTE do not work from ID, that will
    //  recurse since our ID is built in part from the expanded resource URI
    parts = this.$get('uriParts');
    if (TP.isEmpty(parts)) {
        path = TP.uriResolveVirtualPath(this.$get('uri'), true);
        parts = path.match(TP.regex.TIBET_URI_SPLITTER);
    }

    path = parts.at(TP.core.TIBETURL.URL_INDEX);
    if (TP.isEmpty(path)) {
        return;
    }

    //  this resolves the path as cleanly as possible, returning a path that
    //  typically starts with one of the schemes we consider "resource"
    //  schemes. NOTE we pass true for resourceOnly here to strip tibet:
    //  prefixes for canvased URIs
    path = TP.uriResolveVirtualPath(path, true);
    if (TP.regex.SCHEME.test(path)) {
        url = TP.uc(path);
        if (TP.isURI(url)) {
            this.set('nestedURI', url);
        } else {
            TP.ifWarn() ?
                TP.warn('Invalid URI specification: ' + path,
                        TP.LOG) : 0;

            return;
        }
    }

    return url;
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('getID',
function() {

    /**
     * @name getID
     * @synopsis Returns the ID of the receiver, which for URIs is their unique
     *     URI value. In the case of TIBET URLs it is the fully-expanded version
     *     of the URI so all variants can be identified as the same instance.
     * @returns {String} The unique ID of the receiver.
     */

    var id,
        url,

        parts,
        canvas,
        loc;

    id = this.$get(TP.ID);

    //  first question is do we have our *own* id (otherwise, we'll report the
    //  value inherited from the prototype)
    if (TP.owns(this, TP.ID)) {
        return id;
    }

    //  then the question is what do we have now, an OID or TIBET URL string?

    //  if our ID already starts with tibet then we've been here before,
    //  otherwise we'll be looking at a standard TIBET OID here...
    if (TP.regex.TIBET_SCHEME.test(id)) {
        return id;
    }

    //  our internal (and initial) URI should be here, tibet: prefixed
    url = this.$get('uri');

    //  first check is a regex that should work on all valid TIBET URLs
    if (!TP.regex.TIBET_URI_SPLITTER.test(url)) {
        return TP.raise(url, 'TP.sig.InvalidURI', url);
    }

    //  keep the parts around in split form for faster processing elsewhere
    this.$set('uriParts', url.match(TP.regex.TIBET_URI_SPLITTER));
    parts = this.$get('uriParts');

    //  with parts in place we can ask for the canvas name
    canvas = this.getCanvasName();

    //  the second part is our resource URI, which may include a ~ that
    //  needs to be expanded before we have all the components of the ID
    if (TP.isEmpty(canvas)) {
        //  when we have a resource uri we can ask it for the location
        url = this.getNestedURI();
        loc = url.getLocation();
    } else {
        //  the path and pointer portions of our regex match are the
        //  location when there wasn't a valid resource URI value
        loc = TP.ifInvalid(parts.at(TP.core.TIBETURL.PATH_INDEX), '') +
                TP.ifInvalid(parts.at(TP.core.TIBETURL.FRAGMENT_INDEX), '');
    }

    //  build up the ID from the various parts
    id = TP.join('tibet:',
        TP.ifInvalid(parts.at(TP.core.TIBETURL.JID_INDEX), ''), '/',
        TP.ifInvalid(parts.at(TP.core.TIBETURL.RESOURCE_INDEX), ''), '/',
        canvas, '/',
        loc);

    //  cache our efforts so we don't have to do this again
    this.$set(TP.ID, id);

    return id;
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('getLocation',
function() {

    /**
     * @name getLocation
     * @synopsis Returns the URIs location, adjusting for any virtual URI
     *     components to return the actual resource URI value.
     * @returns {String} The receiver's location.
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  content URI.
    if (TP.isEmpty(this.getCanvasName())) {
        return this.getNestedURI().getLocation();
    }

    //  supertype will compute a decent default value as an alternative.
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('getPath',
function() {

    /**
     * @name getPath
     * @synopsis Returns the path portion of the receiver. For TIBET URLs this
     *     is the entire URI string.
     * @returns {String} A scheme-specific path string.
     */

    //  ensure a string
    return this.getLocation() || '';
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('$getPrimaryResource',
function(aRequest, filterResult) {

    /**
     * @name $getPrimaryResource
     * @synopsis Returns the TIBET object referenced by the receiver. When the
     *     TIBET path resolves to another URI form (i.e. when a ~ is used for a
     *     "virtual" file or http URI) the resource (content) of that URI is
     *     returned.
     * @description TIBET URLs are used to support a wide variety of access
     *     paths to objects in the system. This is unfortunately necessary since
     *     the standard URI schemes don't allow for client-side object
     *     referencing in any real sense, nor do they support the kind of
     *     "runtime evaluation" we often require of URIs for application
     *     development. The result is that this method has to handle a wide
     *     variety of cases and still try to remain reasonably fast. Preference
     *     is given here to the kinds of object references most likely to be
     *     used relative to the UI since that's typically the most
     *     time-sensitive object access path.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @param {Boolean} filterResult True if the resource result will be used
     *     directly and should be filtered to match any resultType definition
     *     found in the request. The default is false.
     * @returns {Object} The resource or TP.sig.Response when async.
     * @todo
     */

    var request,
        refresh,
        filter,

        parts,
        canvas,

        async,
        url,

        path,
        pointer,
        key,

        win,
        err,

        result,

        tpwin,
        inst;

    TP.stop('break.uri_resource');

    request = this.constructRequest(aRequest);
    refresh = request.at('refresh');
    filter = filterResult || false;

    //  may need to force refresh under certain circumstances so we need to
    //  take care of that before proceeding
    if (!this.isLoaded() || TP.notValid(refresh)) {
        refresh = false;

        //  never loaded means we have to load/refresh the first time
        if (!this.isLoaded()) {
            refresh = true;
        }

        //  if we're pointing into a live window we also want to refresh,
        //  content in windows is changing constantly and we don't try to
        //  manage that change back to the uris that reference into it
        parts = this.$get('uriParts');

        //  with parts in place we can ask for the canvas name
        canvas = this.getCanvasName();
        if (TP.notEmpty(canvas)) {
            refresh = true;
        }
    }

    async = this.rewriteRequestMode(request);

    //  not forced to refresh? then our best-fit object is our resource if
    //  we have one, or its the data from our primary URI in unrefreshed
    //  form.
    if (TP.notTrue(refresh)) {
        result = this.$get('resource');
        result = this.$getResourceResult(request, result, async, filter);

        if (TP.canInvoke(aRequest, 'complete')) {
            aRequest.complete(result);
        }

        if (async) {
            if (TP.canInvoke(aRequest, 'constructResponse')) {
                return aRequest.constructResponse(result);
            } else {
                return TP.request().constructResponse(result);
            }
        }

        return result;
    }

    //  most common cases are a) loading external file content b)
    //  referencing a UI element via a barename, c) referring back into
    //  codeframe for an XML peer element via a barename. The second and
    //  third cases are the ones that require the most optimized access
    //  since the first involves IO latency that offsets anything else

    //  the original parts of the URI give us the best view of the real
    //  intent. these typically are split during initialization and cached
    parts = parts || this.$get('uriParts');

    //  with parts in place we can ask for the canvas name
    canvas = this.getCanvasName();

    path = parts.at(TP.core.TIBETURL.PATH_INDEX);
    pointer = parts.at(TP.core.TIBETURL.FRAGMENT_INDEX);

    //  this key helps drive switch logic down below to keep things a little
    //  clearer from a logic/branching perspective
    if (TP.notValid(key = this.$get('uriKey'))) {
        key = TP.join(TP.str(TP.isEmpty(path)),
                        '_' ,
                        TP.str(TP.isEmpty(pointer)));
        this.$set('uriKey', key, false);
    }

    //  top-level branch is based on XML or HTML tree (ui or code frame).
    //  when the canvas has been specified and it's not the code frame we'll
    //  need a handle to the window to do the work below. most file access
    //  is based on empty canvas specifications (implying codeframe)
    if (TP.notEmpty(canvas)) {
        if (!TP.isWindow(win = TP.sys.getWindowById(canvas))) {
            err = TP.join(TP.sc('Unable to locate window '), canvas,
                        TP.sc(' for URI: '), this.getPath());

            TP.ifWarn() ? TP.warn(err, TP.LOG) : 0;

            request.fail(TP.FAILURE, err);

            return this.$getResourceResult(request,
                                            undefined,
                                            async,
                                            filter);
        }
    }

    //  "normalize" path for comparisons so tibet:///~something, ~something,
    //  and the expanded version of ~something all produce the same string
    if (TP.notEmpty(path)) {
        path = TP.uriExpandPath(path);
    }

    if (TP.isWindow(win)) {
        //  real window? then we're hunting for UI content of some kind
        //  unless the path is a javascript: path requesting evaluation
        //  in the window's context

        //  deal with the javascript: option first so we keep things cleaner
        //  down below
        if (TP.regex.JS_SCHEME.test(path)) {
            try {
                //  If the canvas name is *not* empty, then this URI has a
                //  canvas specifier, which means it needs to be rewritten as a
                //  'JS traversal path':
                //      tibet://top.UIROOT.screen_0/javascript:$$globalID
                //          becomes
                //      tibet:///javascript:top.UIROOT.screen_0.$$globalID
                if (TP.notEmpty(this.getCanvasName())) {
                    //  Build a URL by using a TIBET URL scheme with a blank
                    //  canvas identifier, the canvas name and the current path
                    //  with the 'javascript:' bit sliced off.
                    url = TP.uc('tibet:///javascript:' +
                                this.getCanvasName() + '.' + path.slice(11));

                    //  This will always be synchronous - it's a 'javascript:'
                    //  URL.
                    result = url.getResource();
                    return this.$getResourceResult(request,
                                                    result,
                                                    async,
                                                    filter);
                } else {
                    //  NOTE the special case here, no cache
                    if ((url = this.getPrimaryURI()) !== this) {
                        return url.$getPrimaryResource(request, filterResult);
                    }
                }
            } catch (e) {
                err = TP.ec(e,
                        TP.join(TP.sc('URI access produced error for: '),
                                this.asString()));
                this.raise('TP.sig.URIException', err);
                request.fail(TP.FAILURE, err);

                return this.$getResourceResult(request,
                                                undefined,
                                                async,
                                                filter);
            }
        }

        //  key is whether pathIsEmpty_pointerIsEmpty
        switch (key) {
            case 'true_true':

                //  both empty? window ID only, we're done
                result = TP.tpwin(win);
                return this.$getResourceResult(request,
                                                result,
                                                async,
                                                filter);

            case 'false_false':
            case 'false_true':

                //  path with/without pointer?
                if (TP.notEmpty(path) &&
                    ((url = this.getPrimaryURI()) !== this)) {
                    //  If our path matches the current document location or our
                    //  pointer is '#document', return the wrapped Document.
                    if (TP.documentGetLocation(win.document) === path ||
                            pointer === '#document') {
                        //  NB: We don't set the result's 'uri' here since
                        //  the result is the document and we probably don't
                        //  represent the document.
                        result = TP.core.DocumentNode.construct(
                                                        win.document);

                        return this.$getResourceResult(request,
                                                        result,
                                                        async,
                                                        filter);
                    }

                    return this.$getResourceResult(request,
                                                    undefined,
                                                    async,
                                                    filter);
                } else {
                    //  Path is empty, or we don't have a content URI to
                    //  match, so either way we should return the document.

                    //  NB: We don't set the result's 'uri' here since the
                    //  result is the document and we probably don't
                    //  represent the document.
                    result = TP.core.DocumentNode.construct(win.document);

                    return this.$getResourceResult(request,
                                                    result,
                                                    async,
                                                    filter);
                }

                break;

            case 'true_false':

                //  pointer references window.document subset without
                //  constraining it to a particular file's content.

                //  NB: We don't set the result's 'uri' here since the
                //  result is the document and we probably don't represent
                //  the document.
                result = TP.core.DocumentNode.construct(win.document);

                return this.$getResourceResult(request,
                                                result,
                                                async,
                                                filter);

            default:
                break;
        }
    } else {
        if ((url = this.getPrimaryURI()) !== this) {
            return url.$getPrimaryResource(request, filterResult);
        }

        //  no window, so this is a codeframe reference to either a resource
        //  URI's content or to an object we can get via
        //  TP.sys.getObjectById() (provided we don't trigger a recursion :)
        //  or by access path traversal (or both). A common and time-sensitive
        //  call here is one that's trying to locate an xctrls:instance or a
        //  part of the data within that instance for data binding purposes.

        //  key is whether pathIsEmpty_pointerIsEmpty
        switch (key) {
            case 'true_true':

                //  no window, no path, no pointer? not much to work with...
                //  what does tibet:/// refer to?
                return this.$getResourceResult(request,
                                                undefined,
                                                async,
                                                filter);

            case 'false_false':
            case 'false_true':

                //  path with/without pointer? entire resource document
                //  request, provided we have a content URI. If we don't
                //  have a content URI then the TIBET URL is being used as
                //  if it were a urn: which is no longer supported.
                if ((url = this.getPrimaryURI()) !== this) {
                    inst = url.$getPrimaryResource(request);
                    async = this.rewriteRequestMode(request);

                    if (async) {
                        //  inst will be a TP.sig.Response when async.
                        return inst;
                    }

                    return this.$getResourceResult(request,
                                                    inst,
                                                    async,
                                                    filter);
                }
                return;

            case 'true_false':

                //  pointer only? with no window the window is the UICANVAS
                //  to make it easier for consumers to just type tibet:///
                //  and we want that document as our target.
                tpwin = TP.sys.getUICanvas();
                if (TP.isValid(tpwin)) {
                    result = tpwin.getDocument();
                }

                if (TP.isValid(result)) {
                    return this.$getResourceResult(request,
                                                    result,
                                                    async,
                                                    filter);
                }
                return;

            default:
                break;
        }
    }

    //  fallthrough, our goal here is to see if the reference is something
    //  simple like a memory reference via tibet:///objID etc. so we want to
    //  make sure we use the target, or win, or the current window as our
    //  object and the pointer or path if pointer is empty (which it will be
    //  if we're looking at a simple object reference
    result = TP.objectValue(result || win || window, pointer || path);

    return this.$getResourceResult(request, result, async, filter);
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('getPrimaryHref',
function() {

    /**
     * @name getPrimaryHref
     * @synopsis Returns the primary resource's href as a String. This is the
     *     portion of the URI which isn't qualified by a fragment, the portion
     *     you can send to a server without causing an error.
     * @returns {String} The primary href as a String.
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  content URI.
    if (TP.isEmpty(this.getCanvasName())) {
        return this.getNestedURI().getPrimaryHref();
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('getPrimaryURI',
function() {

    /**
     * @name getPrimaryURI
     * @synopsis Returns the actual resource URI used for content access. This
     *     may be the receiver or it may be the URI referencing the primary
     *     resource data for the receiver if the receiver has a fragment, or it
     *     may be an "embedded" URI in the case of schemes which support
     *     embedding URIs such as tibet:.
     * @returns {TP.core.URI} The receiver's primary resource URI.
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  content URI.
    if (TP.isEmpty(this.getCanvasName())) {
        return this.getNestedURI().getPrimaryURI();
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('$getResourceResult',
function(request, result, async, filter) {

    /**
     * @name $getResourceResult
     * @synopsis Handles common result processing for sync/async results.
     * @param {TP.sig.Request} request The original request being processed.
     * @param {Object} result The result data for the request.
     * @param {Boolean} async Whether the request is aynchronous.
     * @param {Boolean} filter True if the resource result will be used directly
     *     and should be filtered to match any resultType definition found in
     *     the request. The default is false.
     * @returns {Object|TP.sig.Response} A response when async, object
     *     otherwise.
     * @todo
     */

    var resource,

        resultType,
        response;

    TP.stop('break.uri_resource');

    resource = result;

    if (TP.isValid(resource)) {
        if (TP.isTrue(filter)) {
            resultType = TP.ifKeyInvalid(request, 'resultType', null);
            resource = this.$getFilteredResult(resource, resultType, false);
        }

        this.$set('resource', resource, false);
        this.isLoaded(true);
    }

    if (TP.isTrue(async)) {
        response = request.constructResponse(resource);
        request.complete(resource);

        return response;
    } else {
        request.complete(resource);

        return resource;
    }
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('httpDelete',
function(aRequest) {

    /**
     * @name httpDelete
     * @synopsis Uses the receiver as a target URI and invokes an HTTP DELETE
     *     with aRequest.
     * @param {TP.sig.Request} request The original request being processed.
     * @returns {Object|TP.sig.Response} A response when async, object
     *     otherwise.
     */

    if (this.isHTTPBased()) {
        return TP.httpDelete(this.asString(), aRequest);
    } else {
        this.raise('TP.sig.UnsupportedOperation', this.asString());
    }
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('httpGet',
function(aRequest) {

    /**
     * @name httpGet
     * @synopsis Uses the receiver as a target URI and invokes an HTTP GET
     *     with aRequest.
     * @param {TP.sig.Request} request The original request being processed.
     * @returns {Object|TP.sig.Response} A response when async, object
     *     otherwise.
     */

    if (this.isHTTPBased()) {
        return TP.httpGet(this.asString(), aRequest);
    } else {
        this.raise('TP.sig.UnsupportedOperation', this.asString());
    }
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('httpHead',
function(aRequest) {

    /**
     * @name httpHead
     * @synopsis Uses the receiver as a target URI and invokes an HTTP HEAD
     *     with aRequest.
     * @param {TP.sig.Request} request The original request being processed.
     * @returns {Object|TP.sig.Response} A response when async, object
     *     otherwise.
     */

    if (this.isHTTPBased()) {
        return TP.httpHead(this.asString(), aRequest);
    } else {
        this.raise('TP.sig.UnsupportedOperation', this.asString());
    }
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('httpOptions',
function(aRequest) {

    /**
     * @name httpOptions
     * @synopsis Uses the receiver as a target URI and invokes an HTTP OPTIONS
     *     with aRequest.
     * @param {TP.sig.Request} request The original request being processed.
     * @returns {Object|TP.sig.Response} A response when async, object
     *     otherwise.
     */

    if (this.isHTTPBased()) {
        return TP.httpOptions(this.asString(), aRequest);
    } else {
        this.raise('TP.sig.UnsupportedOperation', this.asString());
    }
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('httpPost',
function(aRequest) {

    /**
     * @name httpPost
     * @synopsis Uses the receiver as a target URI and invokes an HTTP POST
     *     with aRequest.
     * @param {TP.sig.Request} request The original request being processed.
     * @returns {Object|TP.sig.Response} A response when async, object
     *     otherwise.
     */

    if (this.isHTTPBased()) {
        return TP.httpPost(this.asString(), aRequest);
    } else {
        this.raise('TP.sig.UnsupportedOperation', this.asString());
    }
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('httpPut',
function(aRequest) {

    /**
     * @name httpPut
     * @synopsis Uses the receiver as a target URI and invokes an HTTP PUT
     *     with aRequest.
     * @param {TP.sig.Request} request The original request being processed.
     * @returns {Object|TP.sig.Response} A response when async, object
     *     otherwise.
     */

    if (this.isHTTPBased()) {
        return TP.httpPut(this.asString(), aRequest);
    } else {
        this.raise('TP.sig.UnsupportedOperation', this.asString());
    }
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('httpTrace',
function(aRequest) {

    /**
     * @name httpTrace
     * @synopsis Uses the receiver as a target URI and invokes an HTTP TRACE
     *     with aRequest.
     * @param {TP.sig.Request} request The original request being processed.
     * @returns {Object|TP.sig.Response} A response when async, object
     *     otherwise.
     */

    if (this.isHTTPBased()) {
        return TP.httpTrace(this.asString(), aRequest);
    } else {
        this.raise('TP.sig.UnsupportedOperation', this.asString());
    }
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('isDirty',
function(aFlag) {

    /**
     * @name isDirty
     * @synopsis Returns true if the receiver's content has been dirtied since
     *     it was last loaded/reset.
     * @param {Boolean} aFlag The new value to optionally set.
     * @returns {Boolean} Whether or not the content of the receiver is 'dirty'.
     * @todo
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  content URI.
    if (TP.isEmpty(this.getCanvasName())) {
        return this.getNestedURI().isDirty(aFlag);
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('isLoaded',
function(aFlag) {

    /**
     * @name isLoaded
     * @synopsis Returns true if the receiver's content has been loaded either
     *     manually via a setContent or init, or by loading the receiver's URI
     *     location.
     * @param {Boolean} aFlag The new value to optionally set.
     * @returns {Boolean} Whether or not the content of the receiver is loaded.
     * @todo
     */

    //  We never really consider a TIBET URL to be "loaded". If we defer to
    //  the nested URI when there's source data then certain refresh
    //  semantics break since the TIBET URL won't load after the core URI
    //  has loaded and starts reporting true.
    return false;
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('isPrimaryURI',
function() {

    /**
     * @name isPrimaryURI
     * @synopsis Returns true if the receiver is a primary URI, meaning it has
     *     no fragment portion and is responsible for data.
     * @returns {Boolean} True if the receiver is a primary URI.
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  content URI.
    if (TP.isEmpty(this.getCanvasName())) {
        //  When we're just an alias we obviously aren't a primary URI.
        return false;
    }

    //  If we have a canvas spec then we're a primary if we don't have a
    //  fragment, otherwise the version of this URI sans fragment is the
    //  primary.
    return !this.hasFragment();
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('updateHeaders',
function(headerData) {

    /**
     * @name updateHeaders
     * @synopsis TIBET URLs containing valid resource URIs respond to this
     *     method by updating the headers for that URI.
     * @param {Object} headerData A string, hash, or request object containing
     *     header data.
     * @returns {TP.core.TIBETURL} The receiver.
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  content URI.
    if (TP.isEmpty(this.getCanvasName())) {
        return this.getNestedURI().updateHeaders(headerData);
    }

    //  No concept of headers for a UI target, just return.
    return this;
});

//  ------------------------------------------------------------------------

TP.core.TIBETURL.Inst.defineMethod('updateResourceCache',
function(aRequest) {

    /**
     * @name updateResourceCache
     * @synopsis TIBET URLs containing valid resource URIs respond to this
     *     method by updating the content cache for that URI.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {Object} The resource stored in the cache on completion.
     */

    var url;

    TP.stop('break.uri_cache');

    //  if we're just an alias for a concrete file or http url then we
    //  continue to look like a proxy for that reference in string form
    if ((url = this.getPrimaryURI()) !== this) {
        return url.updateResourceCache(aRequest);
    }

    //  TODO:   not sure about this. What about fragments etc.?
    return this.$get('resource');
});

//  ========================================================================
//  TP.core.URIHandler
//  ========================================================================

/**
 * @type {TP.core.URIHandler}
 * @synopsis TP.core.URIHandler provides a top-level supertype for URI-specific
 *     handler classes.
 * @description When TIBET attempts to operate on a URI for load or save
 *     operations it first rewrites the URI and then routes the URI/operation
 *     pair to a handler type. The handler types are responsible for managing
 *     the URI's data in a scheme-specific way that can also respect request and
 *     URI parameter content as needed. One reason for URI handlers in TIBET is
 *     construction of stubs/mocks for web services testing and parallel
 *     development processes since they allow you to swap in a set of test
 *     handler types which simulate real operations.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core:URIHandler');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.URIHandler.Type.defineMethod('load',
function(targetURI, aRequest) {

    /**
     * @name load
     * @synopsis Loads URI data content, returning the TP.sig.Response object
     *     used to manage the low-level service response.
     * @param {TP.core.URI} targetURI The URI to load. Note that this call is
     *     typically made via the load call of a URI and so rewriting and
     *     routing have already occurred.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The response.
     * @todo
     */

    TP.stop('break.uri_load');

    //  DB, File and HTTP urls have their own handlers. This default handler
    //  is typically leveraged only by javascript: and urn: resources whose
    //  data isn't really "loaded" from a particular resource location.

    return targetURI.$getPrimaryResource(aRequest);
});

//  ------------------------------------------------------------------------

TP.core.URIHandler.Type.defineMethod('nuke',
function(targetURI, aRequest) {

    /**
     * @name nuke
     * @synopsis Deletes a URI entirely, returning the TP.sig.Response object
     *     used to manage the low-level service response.
     * @param {TP.core.URI} targetURI The URI to delete. Note that this call is
     *     typically made via the nuke call of a URI and so rewriting and
     *     routing have already occurred.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The response.
     * @todo
     */

    var request,
        response;

    TP.stop('break.uri_nuke');

    TP.todo('Implement nuke for non-file/http/db urls.');

    //  DB, File and HTTP urls have their own handlers. This default handler
    //  is typically leveraged only by javascript: and urn: resources whose
    //  data isn't really deleted from a particular resource location.

    //  fake success via request/response semantics for consistency
    request = targetURI.constructRequest(aRequest);
    response = request.constructResponse();

    request.complete(true);

    return response;
});

//  ------------------------------------------------------------------------

TP.core.URIHandler.Type.defineMethod('save',
function(targetURI, aRequest) {

    /**
     * @name save
     * @synopsis Saves URI data content. This is the default data persistence
     *     method for most URI content.
     * @description By creating alternative URI handlers and ensuring that URI
     *     routing can find them you can alter how data is managed for different
     *     URI instances. See TP.core.URIRewriter and TP.core.URIRouter for more
     *     information. Important keys include 'append', 'body', and 'backup',
     *     which define whether this save should append or write new content,
     *     what content is being saved, and whether a backup should be created
     *     if possible (for 'file' scheme uris).
     * @param {String|TP.core.URI} targetURI A target URI.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The response.
     * @todo
     */

    var request,
        response;

    TP.stop('break.uri_save');

    //  DB, File and HTTP urls have their own handlers. This default handler
    //  is typically leveraged only by javascript: and urn: resources whose
    //  data isn't really "saved" to a particular resource location.

    //  fake success via request/response semantics for consistency
    request = targetURI.constructRequest(aRequest);
    response = request.constructResponse();

    request.complete(true);

    return response;
});

//  ------------------------------------------------------------------------

TP.core.URIHandler.Type.defineMethod('service',
function(targetURI, aRequest) {

    /**
     * @name service
     * @synopsis Processes service requests, which are typically translations of
     *     tsh:service tags.
     * @param {String|TP.core.URI} targetURI A target URI.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @todo
     */

    var method;

    method = aRequest.at('route');

    //  method is typically an HTTP verb, but we also allow simple sql-like
    //  verbs which help with localdb: semantics.
    switch (method) {
        case 'delete':
            return this.nuke(targetURI, aRequest);

        case 'get':
        case 'select':
            return this.load(targetURI, aRequest);

        case 'post':
        case 'put':
        case 'insert':
        case 'update':
            return this.save(targetURI, aRequest);

        default:
            aRequest.fail(TP.FAILURE, 'Unknown service method: ' + method);
            break;
    }

            /*

    //  when relevancy matters we have to trim out non-relevant nodes or
    //  other data which can be determined to be non-relevant.
    if (TP.elementGetAttribute(node, 'tsh:relevant') != 'false') {
        signal = this.dispatch('tsh-service-relevant', node, data);
        if (TP.isValid(signal) && (signal.shouldPrevent() != true)) {
            TP.handle(handler, signal, 'handletsh-service-relevant');
        };

        //  if we're preventing default it's because something failed.
        if (TP.isValid(signal) && signal.shouldPrevent()) {
            this.dispatch('tsh-service-error', node);
            return TP.BREAK;
        };
    };

    //  per XForms spec we have to revalidate our data at this point...but
    //  NOTE that we have to rely on validation checks in event handlers.
    if (TP.elementGetAttribute(node, 'tsh:validate') != 'false') {
        signal = this.dispatch('tsh-service-validate', node, data);
        if (TP.isValid(signal) && (signal.shouldPrevent() != true)) {
            TP.handle(handler, signal, 'handletsh-service-validate');
        };

        //  if we're preventing default it's because something failed.
        if (TP.isValid(signal) && signal.shouldPrevent()) {
            this.dispatch('tsh-service-error', node);
            return TP.BREAK;
        };
    };



    //  NOTE we dispatch the event used by XForms 1.1 to get things started
    //  so observers (listener registrations essentially) can be notified
    signal = this.dispatch('tsh-service-serialize', node, args);
    if (TP.isValid(signal) && (signal.shouldPrevent() != true)) {
        TP.handle(this, signal, 'handletsh-service-serialize');
    };
            */
    return;
});

//  ------------------------------------------------------------------------
//  Operational Methods (serialize/transmit/deserialize)
//  ------------------------------------------------------------------------

TP.core.URIHandler.Inst.defineMethod('deserialize',
function(aSignal) {

    /**
     * @name deserialize
     * @synopsis Processes inbound data, handling any processing needed to put
     *     the data into the proper form and location. The default processing
     *     here is simply to handle the replace attribute's instructions as
     *     extended by any XControls attributes.
     * @param {TPXControlsSignal} aSignal The signal instance whose content is
     *     being processed.
     * @returns {String} The serialized data.
     * @todo
     */

    var dat,
        replace,

        instID,
        elem,
        inst,

        doc,
        target,
        theObj,
        url,
        content;

    if (TP.isNode(dat = aSignal.getPayload().at('body'))) {
        //  remove content wrapper by grabbing first child
        //dat = TP.nodeCloneNode(dat.firstChild, true);
    }

    TP.ifTrace() ?
        TP.sys.logIO(TP.hc('body', dat,
                        'message', 'De-serializing data.'),
                    TP.TRACE) : 0;

    //  if we got results then we want to see where to put them...
    replace = TP.ifEmpty(this.getAttribute('tsh:replace', true),
                        'tsh:target');

    //  the replace attribute tells us where to put the data
    switch (replace) {
        case 'all':

            //  new document is supposed to replace the "existing" document
            //  which would normally mean a window.location, but TIBET has
            //  to manage the content

            //  TODO:   the current URI (requesting URI) for the service
            //  element we're processing needs its content replaced

            TP.todo('Deserialize "all".');

            break;

        case 'instance':

            //  when replacing an instance we have to find the element with
            //  that ID within the containing model (according to XForms) or
            //  at least within the containing document since we've got an
            //  ID in XControls and get an tsh:instance wrapper for it
            if (TP.notEmpty(instID = this.getAttribute('tsh:instance'))) {
                elem = TP.nodeGetElementById(this.getPeerXMLDocument(),
                                                instID,
                                                true);
                if (TP.isElement(elem)) {
                    inst = 'tsh:instance'.construct(elem);
                }
            } else {
                //  a specific instance should be replaced. the instance
                //  document itself is replaced with the new content.
                inst = this.getBoundInstance(aSignal);
            }

            if (TP.isValid(inst)) {
                if (TP.isNode(dat)) {
                    doc = TP.documentFromString(TP.nodeAsString(dat));
                    inst.setInstanceDocument(doc);
                } else {
                    //  TODO:   adjust for JSON et. al.
                    //  problem since this is XML specific
                    TP.ifError() ?
                        TP.error(TP.boot.$annotate(
                                    dat,
                                    'Instance replacement data not XML.'),
                                    TP.IO_LOG) : 0;
                }
            } else {
                TP.ifError() ?
                    TP.error('Instance: ' + instID + ' not found.',
                                TP.IO_LOG) : 0;
            }

            break;

        case 'none':

            //  finished
            break;

        case 'tsh:target':

            target = this.getAttribute('tsh:target', true);
            if (TP.isEmpty(target)) {
                return this.raise('TP.sig.InvalidParameter',
                                    this.asString());
            }

            //  share data across various pages
            if (TP.isValid(theObj = TP.sys.getObjectById(target, true))) {
                TP.sys.registerObject(dat, target, true);
            } else {
                //  second common option is a TIBET URL where we use the
                //  URI's uniquing behavior as a way to share data
                url = TP.uc(target);
                if (TP.isURI(url)) {
                    //  target is often combined with instance to allow us
                    //  to target an instance in another document...
                    if (TP.notEmpty(instID =
                                    this.getAttribute('tsh:instance'))) {
                        //  if we're looking at a document we can try to
                        //  get the instance element by ID
                        if (TP.isValid(content = url.getResource(
                                                TP.hc('async', false)))) {
                            if (TP.canInvoke(content, 'getElementById')) {
                                elem = content.getElementById(instID);
                                if (TP.isElement(elem)) {
                                    inst = 'tsh:instance'.construct(elem);
                                }
                            }
                        }

                        if (TP.isValid(inst)) {
                            if (TP.isNode(dat)) {
                                doc = TP.documentFromString(
                                                    TP.nodeAsString(dat));
                                inst.setInstanceDocument(doc);
                            } else {
                                //  problem since this is XML specific
                                TP.ifError() ?
                                    TP.error(TP.boot.$annotate(
                                                dat,
                                                'Instance replacement' +
                                                ' data not XML.'),
                                        TP.IO_LOG) : 0;
                            }
                        } else {
                            //  problem since this is XML specific
                            TP.ifError() ?
                                TP.error('Specified instance ' + instID +
                                            ' not found.',
                                            TP.IO_LOG) : 0;
                        }
                    } else {
                        //  no instance ID? just the target URI then so we
                        //  can set the content for later use
                        url.setContent(dat);
                    }
                } else {
                    //  perhaps a local ID?
                    elem = TP.nodeGetElementById(this.getPeerXMLDocument(),
                                                    instID,
                                                    true);
                    if (TP.isElement(elem)) {
                        inst = TP.tpnode(elem);
                        inst.setContent(dat);
                    }
                }
            }

            break;

        default:

            //  should be a qname which will help us determine where to put
            //  the target data. at the moment we treat it more like a
            //  qualified attribute name
            if (TP.isEmpty(target = this.getAttribute(replace, true))) {
                return this.raise('TP.sig.InvalidParameter',
                        'Missing required replace/target specification.');
            }

            //  TODO:   how to dispatch to an extension model here?
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.URIHandler.Inst.defineMethod('serialize',
function(aSignal) {

    /**
     * @name serialize
     * @synopsis Processes the content of the signal provided, preparing it for
     *     transmission. Two properties are used for this process, the method
     *     and mimetype.
     * @param {TPXControlsSignal} aSignal The signal instance whose content is
     *     being processed.
     * @returns {String} The serialized data.
     */

    var node,
        method;

    //  Here we use a variant on the XForms event() function since 'event'
    //  is a reserved property in IE (one more for theory over practice)
    if (TP.notValid(node = aSignal.getPayload().at('body'))) {
        this.raise('TP.sig.InvalidParameter',
                    'Signal has no content.');

        this.dispatch('tsh-service-error',
                        this.getNativeNode(),
                        aSignal.getPayload());

        return;
    }

    if (TP.isNode(node)) {
        node = node.firstChild;
    }

    TP.ifTrace() ?
        TP.sys.logIO(TP.hc('body', node,
                        'message', 'Serializing data.'),
                    TP.TRACE) : 0;

    //  we take the method attribute value and remove any NS or '-'
    //  qualifiers that may be there, then look for a method with that name
    //  so we have an easy way to specialize the service encoding
    method = TP.ifEmpty(this.getAttribute('tsh:method', true), 'GET');
    method = method.strip('-');
    method = method.strip(':');
    method = method.toUpperCase();

    //  TODO:   replace with getBestMethod pattern
    if (TP.isMethod(this['serializeFor' + method])) {
        return this['serializeFor' + method](node);
    }

    this.raise('TP.sig.UnsupportedOperation',
                'Serialization method not found: ' + method);

    this.dispatch('tsh-service-error',
                    this.getNativeNode(),
                    aSignal.getPayload());

    return;
});

//  ------------------------------------------------------------------------

TP.core.URIHandler.Inst.defineMethod('transmit',
function(aSignal) {

    /**
     * @name transmit
     * @synopsis Transmits the data provided using the method and action data of
     *     the receiver to guide the process.
     * @param {TPXControlsSignal} aSignal The signal instance whose content is
     *     being processed.
     */

    var args,
        node,
        str,
        action,

        req,
        serv,

        url,
        sig;

    if (TP.notValid(args = aSignal.getPayload())) {
        this.raise('TP.sig.InvalidParameter',
                    'Signal has no arguments.');

        this.dispatch('tsh-service-error',
                        this.getNativeNode(),
                        aSignal.getPayload());

        return;
    }

    if (TP.notValid(node = aSignal.getPayload().at('body'))) {
        this.raise('TP.sig.InvalidParameter',
                    'Signal has no content.');

        this.dispatch('tsh-service-error',
                        this.getNativeNode(),
                        aSignal.getPayload());

        return;
    }

    if (TP.isNode(node)) {
        str = TP.nodeGetTextContent(node);
    } else {
        str = TP.str(node);
    }

    action = this.getAttribute('tsh:action');

    TP.ifTrace() ?
        TP.sys.logIO(TP.hc('uri', action,
                        'verb', TP.HTTP_GET,
                        'direction', TP.SEND,
                        'body', str,
                        'message', 'XControls service request initiated.'),
            TP.TRACE) : 0;

    if (TP.regex.HTTP_SCHEME.test(action.toLowerCase())) {
        //  for a true GET we put the extra data on the uri by putting it in
        //  the uriparams slot
        args.atPut('verb', 'GET');

        //  TODO:   uriparams should be a TP.lang.Hash, not a string!!!
        args.atPut('uriparams', str);

        //  the signal arguments provide the core attributes we need. we use
        //  a new instance here to ensure we can support multiple
        //  asynchronous requests.
        req = TP.sig.RESTRequest.construct(args);

        //  make ourselves the requestor so we get the response
        //  notification
        req.set('requestor', this);

        //  get the service processor from the type, it's a shared instance
        serv = this.getType().get('processor');

        //  the real work is done via the handleRequestCompleted method
        //  from here on out so just get the request in motion
        return TP.handle(serv, req);
    } else {
        //  leverage the action as a URI and just load it that way
        url = TP.uc(action);

        sig = this.signal('tsh-service-transmit-done',
                        TP.hc('body', url.getNativeNode()));

        this['handletsh-service-transmit-done'](sig);

        return;
    }
});

//  ========================================================================
//  TP.core.URIRewriter
//  ========================================================================

/**
 * @type {TP.core.URIRewriter}
 * @synopsis TP.core.URIRewriters process any rewrite rules that may be defined,
 *     allowing TIBET's URIs to work more like "keys" than "values". As a
 *     result, rewriting can be leveraged as part of a strategy to redirect URI
 *     references based on various runtime parameters including whether the
 *     application is offline, in test mode, etc.
 *
 *     The default process of rewriting URIs is done by examining data in an
 *     XML Catalog file, typically uris.xml, and remapping the URI based on
 *     either explicit match or regular expression match rules. See the sample
 *     uris.xml file for examples.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core:URIRewriter');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.URIRewriter.Type.defineMethod('rewrite',
function(aURI, aRequest) {

    /**
     * @name rewrite
     * @synopsis Rewrites the receiver based on any XML Catalog data which
     *     matches the current filtering parameter values and the URI.
     * @description The rewrite routine allows TP.core.URI to alter the real URI
     *     used for various operations based on XML Catalog data enhanced for
     *     use with TIBET. This data is typically found in the file uris.xml in
     *     the application's data directory.
     *
     *     NOTE that one potentially unexpected element here is that <uri>
     *     mappings are done as if no URI fragments exist, meaning that only the
     *     "document href" portion of the URI is rewritten and any trailing
     *     fragment is reattached after rewriting has been completed. NOTE that
     *     this does not affect <rewriteURI> element definitions which replace
     *     any content which matches their regular expression, including
     *     fragments.
     * @param {TP.core.URI|String} aURI The URI to rewrite.
     * @param {TP.sig.Request} aRequest An optional request whose values may
     *     inform the rewrite.
     * @returns {TP.core.URI} The true URI for the resource.
     * @todo
     */

    var entry,

        uri,
        key,
        url,
        map,

        rewrite,

        item,

        localurl,
        duration,
        updated,
        upDate,
        newurl,

        str,

        newuri;

    TP.stop('break.uri_rewrite');

    //  the request can decline rewriting via flag...check that first
    if (TP.isValid(aRequest) && TP.isTrue(aRequest.at('no_rewrite'))) {
        return aURI;
    }

    //  get/init the catalog entry for the URI. the resulting entry contains
    //  all element data that could have anything to do with this URI based
    //  on matching the URI value either explicitly or via regex match
    entry = TP.core.URI.$getURIEntry(aURI);
    if (TP.isEmpty(entry)) {
        //  the entry will only be empty if there were no rules of any kind
        //  that match up with this URI, which is actually the typical case.
        //  when this is true we can avoid overhead by flagging the instance
        //  as non-mapped so we don't try to look it up again
        uri = TP.isString(aURI) ? TP.core.URI.construct(aURI) : aURI;
        uri.isMappedURI(false);

        return uri;
    }

    //  the entry for the URI caches lookup results by 'profile' key so we
    //  need to get that for the next phase. by passing no profile we get
    //  the one for the current runtime environment, and we turn off
    //  wildcard generation to get explicit values
    key = TP.core.URI.$getURIProfileKey(null, false);

    //  we'll need a string-based version of our original URI for some
    //  of what follows
    url = TP.uriExpandPath(aURI.asString()).split('#').at(0);

    //  given that the runtime profile will rarely change we can see if
    //  a prior lookup has used the same key and stored the result for us.
    if (TP.isValid(map = entry.at(key))) {
        //  most common case is that we've been here before and determined
        //  that the URI has no entries which apply to it specific to this
        //  runtime config...or it had one and we've cached it in the map
        if (TP.isEmpty(map)) {
            //  when map is empty it's because the URI is its own rewrite
            return TP.isString(aURI) ? TP.core.URI.construct(aURI) : aURI;
        } else if (TP.isValid(rewrite = map.at('rewrite'))) {
            //  if we cached our results we can use that instead
            return rewrite;
        } else {
            //  map isn't empty, and doesn't have a cached value? have to
            //  compute from what's there to construct cacheable value

            //  fall through past outer IF/ELSE so we can process the map
            //  in one place regardless of how it was acquired/built
        }
    }
    else    //  map not found -- first time for this URI/profile pair
    {
        map = TP.ifInvalid(TP.core.URI.$getURIMapForKey(url, entry, key),
                            TP.hc());
    }

    //  each runtime situation can result in us finding either a mapping
    //  or a rewrite rule (or nothing). if an item is found the item
    //  returned is a hash of the element that was mapped, so the keys are
    //  the attribute names from the original element.
    if (TP.isValid(item = map.at('mapping'))) {
        //  OK, this one's a bit more complicated due to extensions we make
        //  for TIBET to support local disk/db caches of resources

        //  In particular, we allow URIs to have "localuri" entries which
        //  define a local storage location for a remote URI. This is useful
        //  for things like large lookup tables which don't change often and
        //  for which the user is willing to agree to local disk/db storage
        //  since they can be loaded directly from cache if it still appears
        //  to be valid based on duration and last update times.

        localurl = TP.uriExpandPath(item.at('tibet:localuri'));
        if (TP.notEmpty(localurl)) {
            TP.ifTrace(TP.$$DEBUG && TP.$$VERBOSE) ?
                TP.trace('Found local cache \'' + localurl +
                                '\' for uri: ' + url,
                            TP.LOG) : 0;

            duration = item.at('tibet:duration');
            if (TP.notEmpty(duration)) {
                TP.ifTrace(TP.$$DEBUG && TP.$$VERBOSE) ?
                    TP.trace('Found cache duration \'' + duration +
                                    '\' for uri: ' + url,
                                TP.LOG) : 0;

                updated = item.at('tibet:updated');
                if (TP.notEmpty(updated)) {
                    //  if the cache shows an update time we can consider
                    //  using it if a few more things check out...
                    upDate = Date.from(updated);
                    upDate = upDate.addDuration(duration);

                    //  if we haven't reached the time predicted by the
                    //  duration for expiration we can use the cache URI
                    if (TP.dc().getTime() < upDate.getTime()) {
                        newurl = localurl;
                    } else {
                        //  out of date, can't use that data yet
                        newurl = TP.uriExpandPath(item.at('uri'));
                    }
                } else {
                    //  duration, but no update timestamp. presumably out of
                    //  date since it appears to have never been updated
                    newurl = TP.uriExpandPath(item.at('uri'));
                }
            } else {
                //  empty duration, so effectively no expiration time...but
                //  if the update date is empty there's no local copy yet

                updated = item.at('tibet:updated');
                if (TP.notEmpty(updated)) {
                    newurl = localurl;
                } else {
                    //  no data locally yet, rewrite to standard URI
                    newurl = TP.uriExpandPath(item.at('uri'));
                }
            }
        } else {
            //  empty localuri so use the standard entry attribute data
            newurl = TP.uriExpandPath(item.at('uri'));
        }

        //  if original URI has a fragment we need to adjust newurl to match
        if (TP.regex.HAS_HASH.test(url)) {
            newurl = TP.join(newurl, '#', url.split('#').last());
        }

        //  support pipelines of rewrites, but watch for recursion by making
        //  sure alterations are actually changing the value
        if (url !== newurl) {
            newurl = TP.core.URI.rewrite(newurl, aRequest);
        }

        newuri = TP.core.URI.construct(newurl);
    } else if (TP.isValid(item = map.at('rewrite'))) {
        //  rewrites are relatively easy, just a regex replace and try to
        //  construct a viable URI instance from the result

        //  NOTE that while we retain the XML Catalog names here we expand
        //  the semantics so they are not limited to prefix manipulations
        newurl = TP.isString(aURI) ? aURI : aURI.getLocation();
        str = newurl.replace(item.at('uriStartString') ||
                                item.at('tibet:uriMatchString'),
                            item.at('rewritePrefix'));

        newuri = TP.core.URI.construct(str);
    } else {
        //  no mappings of any kind apparently so we can leave the map empty
        //  (which will say there's no mapping for this profile) and return
        //  a viable URI representation of the input
        return TP.isString(aURI) ? TP.core.URI.construct(aURI) : aURI;
    }

    //  if we got here without a viable rewrite uri then we've got to
    //  default back to the original and log a warning
    if (TP.notValid(newuri)) {
        TP.ifWarn(TP.$$DEBUG && TP.$$VERBOSE) ?
            TP.warn('Invalid rewrite uri: ' +
                        newurl + '. Using ' + url,
                    TP.LOG) : 0;

        uri = TP.isString(aURI) ? TP.core.URI.construct(aURI) : aURI;
    } else {
        TP.ifTrace(TP.$DEBUG && TP.$VERBOSE) ?
            TP.trace('Found rewrite uri \'' + newurl + '\' for uri: ' + url,
                        TP.LOG) : 0;

        uri = newuri;
    }

    //  went to some trouble to come up with this, so cache it for next time
    map.atPut('rewrite', uri);

    return uri;
});

//  ========================================================================
//  TP.core.URIRouter
//  ========================================================================

/**
 * @type {TP.core.URIRouter}
 * @synopsis TP.core.URIRouter types manage routing requests for URI operations
 *     to appropriate handlers. This is somewhat analogous to server-side
 *     front-controllers which examine a URI and determine which class should be
 *     invoked to perform the actual processing. The actual action processing in
 *     TIBET is done by TP.core.URIHandler subtypes.
 *
 *     Note that routing rules in TIBET are processed much like those in other
 *     environments, too many can slow things down -- and the first match wins.
 *     The data used for routing is the same URI catalog data used by rewriting,
 *     however routing makes use of a specific tibet:urihandler attribute to
 *     define a mapping's route.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core:URIRouter');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.URIRouter.Type.defineMethod('route',
function(aURI, aRequest) {

    /**
     * @name route
     * @synopsis Locates and returns the proper TP.core.URIHandler type for the
     *     URI and request pair provided. The handler type defaults to the type
     *     returned by the uri's getDefaultHandler method.
     * @param {TP.core.URI} aURI The URI to route the request for.
     * @param {TP.sig.Request} aRequest The request whose values should inform
     *     the routing assignment.
     * @returns {TP.lang.RootObject.<TP.core.URIHandler>} A TP.core.URIHandler
     *     subtype type object that can handle the request for the supplied URI.
     * @todo
     */

    var uri,
        entry,

        key,
        url,
        map,

        route,
        item,

        handler;

    TP.stop('break.uri_route');

    //  the request can decline rewriting via flag...check that first
    if (TP.isValid(aRequest) && TP.isTrue(aRequest.at('no_rewrite'))) {
        return aURI;
    }

    //  typically we're passed a URI instance but just in case...
    uri = TP.isString(aURI) ? TP.core.URI.construct(aURI) : aURI;

    //  get/init the catalog entry for the URI. the resulting entry contains
    //  all entries that could have anything to do with this URI based on
    //  matching the URI value either explicitly or via regex match
    entry = TP.core.URI.$getURIEntry(aURI);
    if (TP.isEmpty(entry)) {
        //  the entry will only be empty if there were no rules of any kind
        //  that match up with this URI, which is actually the typical case.
        //  when this is true we can avoid overhead by flagging the instance
        //  as non-mapped so we don't try to look it up again
        uri.isMappedURI(false);

        return uri.$getDefaultHandler(aRequest);
    }

    //  the entry for the URI caches lookup results by 'profile' key so we
    //  need to get that for the next phase. by passing no profile we get
    //  the one for the current runtime environment, and we turn off
    //  wildcard generation to get explicit values
    key = TP.core.URI.$getURIProfileKey(null, false);

    //  we'll need a string-based version of our original URI
    //  for some of what follows
    url = TP.uriExpandPath(aURI.asString()).split('#').at(0);

    //  given that the runtime profile will rarely change we can see if
    //  a prior lookup has used the same key and stored the result for us.
    if (TP.isValid(map = entry.at(key))) {
        //  most common case is that we've been here and the URI has no
        //  entries which apply to it specific to this runtime config...or
        //  it had one and we've cached it in the map for this profile
        if (TP.isEmpty(map)) {
            return uri.$getDefaultHandler(aRequest);
        } else if (TP.isValid(route = map.at('route'))) {
            return route;
        }

        //  fall through to after the IF/ELSE so we can process the map
        //  in one place regardless of how it was acquired/built
    } else {
        map = TP.ifInvalid(TP.core.URI.$getURIMapForKey(url, entry, key),
                            TP.hc());
    }

    //  each runtime situation can result in us finding either a mapping
    //  or a delegation rule (or nothing). when found, the item returned is
    //  a hash of the element that was mapped, so the keys are the attribute
    //  names from the original element
    if (TP.isValid(item = map.at('mapping'))) {
        route = item.at('tibet:urihandler');
    } else if (TP.isValid(item = map.at('delegate'))) {
        route = item.at('tibet:urihandler');
    }

    //  should have found a route in the item if routing is applicable,
    //  otherwise we'll continue to default
    if (TP.isEmpty(route)) {
        TP.ifTrace(TP.$DEBUG && TP.$VERBOSE) ?
            TP.trace('Returning default handler type: TP.core.URIHandler',
                        TP.LOG) : 0;

        return uri.$getDefaultHandler(aRequest);
    }

    handler = TP.sys.require(route);
    if (TP.notValid(handler)) {
        TP.ifWarn() ?
            TP.warn('Unable to load route handler: ' + route,
                    TP.LOG) : 0;

        TP.ifTrace(TP.$DEBUG && TP.$VERBOSE) ?
            TP.trace('Returning default handler type: TP.core.URIHandler',
                        TP.LOG) : 0;

        return uri.$getDefaultHandler(aRequest);
    }

    TP.ifTrace(TP.$DEBUG && TP.$VERBOSE) ?
        TP.trace('Found route \'' + route + '\' for uri: ' + url,
                    TP.LOG) : 0;

    //  went to some trouble to come up with this, so cache it for next time
    map.atPut('route', handler);

    return handler;
});

//  ========================================================================
//  TP.core.FileURLHandler
//  ========================================================================

TP.core.URIHandler.defineSubtype('FileURLHandler');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.FileURLHandler.Type.defineMethod('load',
function(targetURI, aRequest) {

    /**
     * @name load
     * @synopsis Loads URI data content, returning the TP.sig.Response object
     *     used to manage the low-level service response.
     * @param {TP.core.URI} targetURI The URI to load. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     * @todo
     */

    var subrequest,
        targetLoc,
        loaded,
        result,
        response;

    TP.stop('break.uri_load');

    //  reuse the incoming request's payload/parameters but don't use that
    //  instance so we can manage complete/fail logic more effectively.
    subrequest = targetURI.constructSubRequest(aRequest);

    //  most supported browsers can handle at least loading from the file
    //  system via an XMLHttpRequest if nothing else, but just in case....
    if (!TP.canInvoke(TP, '$fileLoad')) {
        this.raise('TP.sig.UnsupportedOperation');
        if (TP.canInvoke(aRequest, 'fail')) {
            aRequest.fail(TP.FAILURE, 'Unsupported operation.');
        }
        return;
    }

    if (!TP.canInvoke(targetURI, 'getLocation')) {
        this.raise('TP.sig.InvalidURI');
        if (TP.canInvoke(aRequest, 'fail')) {
            aRequest.fail(TP.FAILURE, 'Invalid URI: ' + targetURI);
        }

        return;
    }

    //  rewriting happens prior to handler lookup, so we just want the
    //  concrete resource URI location so we can load it.
    targetLoc = targetURI.getLocation();

    loaded = targetURI.isLoaded();

    subrequest.atPutIfAbsent('async', false);
    subrequest.atPutIfAbsent('shouldReport', false);

    //  the low-level file call will potentially complete an incoming
    //  request and we need that to not happen without ensuring headers
    //  and content cache are updated...
    subrequest.defineMethod(
            'completeJob',
            function(aResult) {

                    var dat;

                    //  update the target's header and content information, in
                    //  that order so that any content change signaling happens
                    //  after headers are current.
                    targetURI.updateHeaders(subrequest);
                    dat = targetURI.updateResourceCache(subrequest);

                    targetURI.isLoaded(true);
                    targetURI.isDirty(false);

                    if (TP.canInvoke(aRequest, 'complete')) {
                        //  Use the return value from cache update since it's
                        //  the "best form" the cache/result check could
                        //  produce. The data will be filtered higher up for
                        //  requests that care.
                        aRequest.complete(dat);
                    }
            });

    subrequest.defineMethod(
            'failJob',
            function(aFaultCode, aFaultString) {

                    //  update the target's header and content information, in
                    //  that order so that any content change signaling happens
                    //  after headers are current.
                    targetURI.updateHeaders(subrequest);
                    targetURI.updateResourceCache(subrequest);

                    //  updateResourceCache resets these, but when we fail we
                    //  don't want them cleared
                    targetURI.isLoaded(false);
                    targetURI.isDirty(true);

                    if (TP.canInvoke(aRequest, 'fail')) {
                        aRequest.fail(aFaultCode, aFaultString);
                    }
            });

    //  do the work of loading content. for file operations this call is
    //  synchronous and returns the actual data
    result = TP.$fileLoad(targetLoc, subrequest);

    //  Note: We do *not* set the result for these responses here.
    //  complete() already did that in the call above. If we do that again
    //  here, we'll undo any wrapping or filtering.
    if (TP.canInvoke(aRequest, 'constructResponse')) {
        response = aRequest.constructResponse();
    } else {
        response = subrequest.constructResponse();
    }

    //  return the response object so it can pass up the chain
    return response;
});

//  ------------------------------------------------------------------------

TP.core.FileURLHandler.Type.defineMethod('nuke',
function(targetURI, aRequest) {

    /**
     * @name nuke
     * @synopsis Deletes a URI entirely, returning the TP.sig.Response object
     *     used to manage the low-level service response.
     * @param {TP.core.URI} targetURI The URI to nuke. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     * @todo
     */

    var subrequest,
        targetLoc,
        result,
        response;

    TP.stop('break.uri_nuke');

    //  reuse the incoming request's payload/parameters but don't use that
    //  instance so we can manage complete/fail logic more effectively.
    subrequest = targetURI.constructSubRequest(aRequest);

    //  only IE and Moz currently support file deletes so if we're down
    //  to this handler we're hopefully on one of those browsers :)
    if (!TP.canInvoke(TP, '$fileDelete')) {
        this.raise('TP.sig.UnsupportedOperation');
        if (TP.canInvoke(aRequest, 'fail')) {
            aRequest.fail(TP.FAILURE, 'Unsupported operation.');
        }
        return;
    }

    if (!TP.canInvoke(targetURI, 'getLocation')) {
        this.raise('TP.sig.InvalidURI');
        if (TP.canInvoke(aRequest, 'fail')) {
            aRequest.fail(TP.FAILURE, 'Invalid URI: ' + targetURI);
        }
        return;
    }

    subrequest.defineMethod(
            'completeJob',
            function(aResult) {

                    if (TP.isTrue(aResult)) {
                        targetURI.isDirty(false);
                        targetURI.isLoaded(false);

                        if (TP.canInvoke(aRequest, 'complete')) {
                            aRequest.complete(aResult);
                        }
                    } else if (TP.canInvoke(aRequest, 'fail')) {
                        aRequest.fail();
                    }
            });

    subrequest.defineMethod(
            'failJob',
            function(aFaultCode, aFaultString) {

                    if (TP.canInvoke(aRequest, 'fail')) {
                        aRequest.fail(aFaultCode, aFaultString);
                    }
            });

    //  rewriting happens prior to handler lookup, so we just want the
    //  concrete resource URI location so we can save it.
    targetLoc = targetURI.getLocation();

    result = TP.$fileDelete(targetLoc, subrequest);

    //  Note: We do *not* set the result for these responses here.
    //  complete() already did that in the call above. If we do that again
    //  here, we'll undo any wrapping or filtering.
    if (TP.canInvoke(aRequest, 'constructResponse')) {
        response = aRequest.constructResponse();
    } else {
        response = subrequest.constructResponse();
    }

    return response;
});

//  ------------------------------------------------------------------------

TP.core.FileURLHandler.Type.defineMethod('save',
function(targetURI, aRequest) {

    /**
     * @name save
     * @synopsis Saves URI data content. This is the default data persistence
     *     method for most URI content.
     * @description By creating alternative URI handlers and ensuring that URI
     *     routing can find them you can alter how data is managed for different
     *     URI instances. See TP.core.URIRewriter and TP.core.URIRouter for more
     *     information. Important keys include 'append', 'body', and 'backup',
     *     which define whether this save should append or write new content,
     *     what content is being saved, and whether a backup should be created
     *     if possible (for 'file' scheme uris).
     * @param {TP.core.URI} targetURI The URI to save. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     * @todo
     */

    var subrequest,
        targetLoc,
        content,
        result,
        response;

    TP.stop('break.uri_save');

    //  reuse the incoming request's payload/parameters but don't use that
    //  instance so we can manage complete/fail logic more effectively.
    subrequest = targetURI.constructSubRequest(aRequest);

    //  only IE and Moz currently support file save access so if we're down
    //  to this handler we're hopefully on one of those browsers :)
    if (!TP.canInvoke(TP, '$fileSave')) {
        this.raise('TP.sig.UnsupportedOperation');
        if (TP.canInvoke(aRequest, 'fail')) {
            aRequest.fail(TP.FAILURE, 'Unsupported operation.');
        }

        return;
    }

    if (!TP.canInvoke(targetURI, 'getLocation')) {
        this.raise('TP.sig.InvalidURI');
        if (TP.canInvoke(aRequest, 'fail')) {
            aRequest.fail(TP.FAILURE, 'Invalid URI: ' + targetURI);
        }

        return;
    }

    //  rewriting happens prior to handler lookup, so we just want the
    //  concrete resource URI location so we can save it.
    targetLoc = targetURI.getLocation();

    subrequest.atPutIfAbsent('async', false);
    subrequest.atPutIfAbsent('append', false);
    subrequest.atPutIfAbsent('backup', true);

    subrequest.atPutIfAbsent('refreshContent', false);

    //  default text content to the empty string to avoid errors
    content = TP.ifInvalid(targetURI.getResource(subrequest), '');
    subrequest.atPutIfAbsent('body', TP.str(content));

    subrequest.defineMethod(
            'completeJob',
            function(aResult) {

                    if (TP.isTrue(aResult)) {
                        targetURI.isDirty(false);
                        targetURI.isLoaded(true);

                        if (TP.canInvoke(aRequest, 'complete')) {
                            aRequest.complete(aResult);
                        }
                    } else if (TP.canInvoke(aRequest, 'fail')) {
                        aRequest.fail();
                    }
            });

    subrequest.defineMethod(
            'failJob',
            function(aFaultCode, aFaultString) {

                    if (TP.canInvoke(aRequest, 'fail')) {
                        aRequest.fail(aFaultCode, aFaultString);
                    }
            });

    //  do the work of saving content. for file operations this call is
    //  synchronous and returns a boolean for success (true/false)
    result = TP.$fileSave(targetLoc, subrequest);

    //  Note: We do *not* set the result for these responses here.
    //  complete() already did that in the call above. If we do that again
    //  here, we'll undo any wrapping or filtering.
    if (TP.canInvoke(aRequest, 'constructResponse')) {
        response = aRequest.constructResponse();
    } else {
        response = subrequest.constructResponse();
    }

    return response;
});

//  =======================================================================
//  TP.core.HTTPURLHandler
//  ========================================================================

/**
 * @type {TP.core.HTTPURLHandler}
 * @synopsis Supports operations specific to loading/saving URI data for HTTP
 *     URIs.
 */

//  ------------------------------------------------------------------------

TP.core.URIHandler.defineSubtype('HTTPURLHandler');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.HTTPURLHandler.Type.defineMethod('load',
function(targetURI, aRequest) {

    /**
     * @name load
     * @synopsis Loads URI data content, returning the TP.sig.Response object
     *     used to manage the low-level service response.
     * @param {TP.core.URI} targetURI The URI to load. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     * @todo
     */

    var request,
        response,
        targetLoc,
        loadRequest;

    TP.stop('break.uri_load');

    request = targetURI.constructRequest(aRequest);
    response = request.constructResponse();

    if (!TP.canInvoke(targetURI, 'getLocation')) {
        request.fail();
        return response;
    }

    //  rewriting happens prior to handler lookup, so we just want the
    //  concrete resource URI location so we can load it.
    targetLoc = targetURI.getLocation();

    //  NOTE that when doing this only methods on the payload are mapped
    //  so this is more applicable to generic TP.sig.Requests constructed
    //  via hashes passed to the getResource call (typical usage
    //  admittedly).
    loadRequest = TP.sig.HTTPLoadRequest.construct(request);

    //  make the request that was provided dependent upon the one we just
    //  constructed so it won't process/complete until the child request
    //  does.
    request.andJoinChild(loadRequest);

    //  ensure the required settings are available for this operation
    loadRequest.atPut('uri', targetLoc);
    if (TP.notEmpty(loadRequest.at('body'))) {
        loadRequest.atPutIfAbsent('verb', TP.HTTP_POST);
    } else {
        loadRequest.atPutIfAbsent('verb', TP.HTTP_GET);
    }

    //  this could be either sync or async, but the TP.sig.HTTPLoadRequest's
    //  handle* methods should be processing correctly in either case.
    TP.core.HTTPService.handle(loadRequest);

    //  Make sure that the 2 requests match on sync/async
    request.updateRequestMode(loadRequest);

    return response;
});

//  ------------------------------------------------------------------------

TP.core.HTTPURLHandler.Type.defineMethod('nuke',
function(targetURI, aRequest) {

    /**
     * @name nuke
     * @synopsis Deletes a URI entirely, returning the TP.sig.Response object
     *     used to manage the low-level service response.
     * @param {TP.core.URI} targetURI The URI to nuke. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     * @todo
     */

    var request,
        response,

        targetLoc,

        nukeRequest,

        useWebDAV;

    TP.stop('break.uri_nuke');

    request = targetURI.constructRequest(aRequest);
    response = request.constructResponse();

    if (!TP.canInvoke(targetURI, 'getLocation')) {
        request.fail();
        return response;
    }

    //  rewriting happens prior to handler lookup, so we just want the
    //  concrete resource URI location so we can load it.
    targetLoc = targetURI.getLocation();

    //  NOTE that when doing this only methods on the payload are mapped
    //  so this is more applicable to generic TP.sig.Requests constructed
    //  via hashes passed to the getResource call (typical usage
    //  admittedly).
    nukeRequest = TP.sig.HTTPNukeRequest.construct(request);

    //  make the request that was provided dependent upon the one we just
    //  constructed so it won't process/complete until the child request
    //  does.
    request.andJoinChild(nukeRequest);

    //  ensure the required settings are available for this operation
    nukeRequest.atPut('uri', targetLoc);
    if (TP.isEmpty(nukeRequest.at('verb'))) {
        //  when webdav is enabled we can set the 'verb' to a TP.HTTP_DELETE
        useWebDAV = TP.ifInvalid(nukeRequest.at('iswebdav'),
                                    TP.sys.cfg('http.use_webdav'));

        if (useWebDAV) {
            nukeRequest.atPut('verb', TP.HTTP_DELETE);
        } else {
            //  all other situations require a 'verb' of TP.HTTP_POST, and a
            //  'method' of TP.HTTP_DELETE (which eventually translates into
            //  the increasingly standard 'X-HTTP-Method-Override' header).
            nukeRequest.atPut('verb', TP.HTTP_POST);

            nukeRequest.atPut('method', TP.HTTP_DELETE);
        }
    }

    //  this could be either sync or async, but the TP.sig.HTTPLoadRequest's
    //  handle* methods should be processing correctly in either case.
    TP.core.HTTPService.handle(nukeRequest);

    //  subrequests can be rewritten so we need to be in sync on async
    request.atPut('async', nukeRequest.at('async'));

    return response;
});

//  ------------------------------------------------------------------------

TP.core.HTTPURLHandler.Type.defineMethod('save',
function(targetURI, aRequest) {

    /**
     * @name save
     * @synopsis Saves URI data content. This is the default data persistence
     *     method for most URI content. Important request keys include 'verb',
     *     'crud', and 'body'. Verb will typically default to a POST unless
     *     TP.sys.cfg(http.use_webdav) is true and the crud parameter is set to
     *     'insert', in which case a PUT is used. The crud parameter effectively
     *     defaults to 'update' so you should set it to 'insert' when new
     *     content is being created. The 'body' should contain the new/updated
     *     content, but this is normally configured by the URI's save() method
     *     itself.
     * @param {TP.core.URI} targetURI The URI to save. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A valid response object for the request.
     * @todo
     */

    var request,
        response,
        targetLoc,
        saveRequest,
        content,
        useWebDAV;

    TP.stop('break.uri_save');

    request = targetURI.constructRequest(aRequest);
    response = request.constructResponse();

    if (!TP.canInvoke(targetURI, 'getLocation')) {
        request.fail();
        return response;
    }

    //  rewriting happens prior to handler lookup, so we just want the
    //  concrete resource URI location so we can load it.
    targetLoc = targetURI.getLocation();

    //  NOTE that when doing this only methods on the payload are mapped
    //  so this is more applicable to generic TP.sig.Requests constructed
    //  via hashes passed to the getResource call (typical usage
    //  admittedly).
    saveRequest = TP.sig.HTTPSaveRequest.construct(request);

    //  make the request that was provided dependent upon the one we just
    //  constructed so it won't process/complete until the child request
    //  does.
    request.andJoinChild(saveRequest);

    //  Save operations shouldn't use their result as new URI content, the
    //  content is already in place, we just want to commit it.
    saveRequest.atPut('refreshContent', false);

    //  Make sure we have content. Note that this will get encoded via the
    //  httpEncode() call in lower layers, so we don't touch it here.
    if (TP.notValid(saveRequest.at('body'))) {
        content = TP.ifInvalid(
                    targetURI.getResource(TP.hc('async', false)), '');
        saveRequest.atPut('body', content);
    }

    //  ensure the required settings are available for this operation
    saveRequest.atPut('uri', targetLoc);
    if (TP.isEmpty(saveRequest.at('verb'))) {
        //  when webdav is enabled we can set the 'verb' to a TP.HTTP_PUT
        //  for insert or use TP.HTTP_POST as our default.
        useWebDAV = TP.ifInvalid(saveRequest.at('iswebdav'),
                                    TP.sys.cfg('http.use_webdav'));

        if (useWebDAV) {
            if (saveRequest.at('crud') === TP.CREATE) {
                saveRequest.atPut('verb', TP.HTTP_PUT);
            } else {
                saveRequest.atPut('verb', TP.HTTP_POST);
            }
        } else {
            //  all other situations require a 'verb' of TP.HTTP_POST, and a
            //  'method' of TP.HTTP_PUT or TP.HTTP_POST (which eventually
            //  translates into the increasingly standard
            //  'X-HTTP-Method-Override' header).
            saveRequest.atPut('verb', TP.HTTP_POST);

            if (saveRequest.at('crud') === TP.CREATE) {
                saveRequest.atPut('method', TP.HTTP_PUT);
            } else {
                saveRequest.atPut('method', TP.HTTP_POST);
            }
        }
    }

    //  this could be either sync or async, but the TP.sig.HTTPSaveRequest's
    //  handle* methods should be processing correctly in either case.
    TP.core.HTTPService.handle(saveRequest);

    //  subrequests can be rewritten so we need to be in sync on async
    request.atPut('async', saveRequest.at('async'));

    return response;
});

//  ========================================================================
//  end
//  ========================================================================
