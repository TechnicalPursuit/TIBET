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
The TP.uri.URI type and its subtypes are central to development with TIBET.

Everything in TIBET has a URI, from the data you work with on a remote server to
the data cached in the client to the elements in your UI. Access to these
objects for purposes of manipulation or data binding is done by leveraging the
features of the TP.uri.URI type and its subtypes.

TP.uri.URL is the root for most common URIs including those for the http: and
file: schemes most web developers are familiar with. Most of the time when
you're working with a data source you're working with an instance of some
concrete TP.uri.URL subtype such as TP.uri.HTTPURL or TP.uri.FileURL.

TP.uri.URN (urn:*) is the typical URI form for "named objects" such as the
types in the TIBET system or other objects for which a public name is useful or
necessary. Most URNs in TIBET use a namespace ID (NID) of 'tibet' so most URN
instances start off with urn:tibet: followed by the actual name string.
Instances of TP.uri.URN are typically instances of an NID-specific subtype so
that each subtype can process the namespace specific string (NSS) portion in a
namespace-specific fashion. TP.uri.TIBETURN is the most common TP.uri.URN
subtype.

TP.uri.TIBETURN (urn:tibet:*) is a TIBET-specific URL type which provides
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

//  ------------------------------------------------------------------------

//  ========================================================================
//  TP.uri.URI
//  ========================================================================

/**
 * @type {TP.uri.URI}
 * @summary An abstract type that models Uniform Resource Identifiers in the
 *     TIBET system. While abstract, this type's constructor should always be
 *     used directly or via the TP.uc() primitive.
 * @description The top-level URI type in the TIBET system is an abstract type.
 *     This follows the somewhat 'classical' view of the W3C spec, where URIs
 *     represent the overall Web addressing and naming scheme and various
 *     scheme-specific forms manage the concrete data. When you ask for an
 *     instance of URI in TIBET you get back an instance of a subtype specific
 *     to the URI scheme you provided. This is consistent with the reality that
 *     only a scheme-specific parser and processor can truly manage each
 *     scheme's URI format and requirements.
 *
 *     When asked for content, the TP.uri.URI types typically return content
 *     objects based on the MIME type of the content. If a type representing the
 *     content MIME type is registered as a content handler in TIBET's
 *     TP.ietf.mime map that type's constructContentObject() method is used to
 *     construct an instance for the new data. For example, JSON data, which has
 *     a TP.ietf.mime type definition, will return a JavaScript instance which
 *     may further resolve its type based on JSON rules. In a similar fashion,
 *     CSS files return specific CSS content wrappers. You can extend this
 *     approach to support your own custom data formats as you require by
 *     pairing the MIME type your server sends with a client-side handler.
 *
 *     For flexibility, TP.uri.URI uses a combination of URI "helpers" and URI
 *     "handlers". Certain operations on a URI such as load, save, or delete
 *     are first checked for rewrite and remap data which would either change
 *     the concrete URI or delegate it to a different concrete handler.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('uri.URI');

//  TP.uri.URI is an abstract type in TIBET terms, meaning you can't
//  construct a concrete instance of TP.uri.URI (but you can invoke the
//  constructor to get a specialized subtype returned to you.)
TP.uri.URI.isAbstract(true);

//  Add support methods for sync vs. async mode and request rewriting.
TP.uri.URI.addTraits(TP.core.SyncAsync);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.uri.URI.Type.defineAttribute('BEST_URIMAP_SORT',
function(a, b) {
    var aMatch,
        bMatch;

    aMatch = a[0];
    bMatch = b[0];

    //  First criteria is number of parts matches.
    if (aMatch.length > bMatch.length) {
        return -1;
    } else if (aMatch.length < bMatch.length) {
        return 1;
    } else {
        //  Second criteria is length of the full match string...but we exempt
        //  the '/.*/' pattern from this consideration since it's a universal
        //  match that should only trigger as a last resort.
        if (a[1].at(a[2]).toString() === '/.*/') {
            return 1;
        } else if (b[1].at(b[2]).toString() === '/.*/') {
            return -1;
        }

        if (aMatch[0].length > bMatch[0].length) {
            return -1;
        } else if (aMatch[0].length < bMatch[0].length) {
            return 1;
        } else {
            //  All else being equal last definition wins.
            return -1;
        }
    }
});

//  ------------------------------------------------------------------------

//  regex used to scan uri map configuration settings for pattern keys.
TP.uri.URI.Type.defineConstant('URI_PATTERN_REGEX',
    /^uri\.map\.(?:.*)\.pattern$/);

//  placeholder for the scheme specific to the receiving type
TP.uri.URI.Type.defineConstant('SCHEME');

//  special aspects for URIs that will broadcast 'Change', but should mostly be
//  ignored by observers (certainly data-binding observers).
TP.uri.URI.Type.defineConstant('SPECIAL_ASPECTS',
    TP.ac('dirty', 'expired', 'loaded'));

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  most URI access is synchronous (file:, urn:, etc) so we
//  start with that here and override for http:, jsonp:, etc.
TP.uri.URI.set('supportedModes', TP.core.SyncAsync.SYNCHRONOUS);
TP.uri.URI.set('mode', TP.core.SyncAsync.SYNCHRONOUS);

//  holder for path-to-instance registrations.
TP.uri.URI.Type.defineAttribute(
            'instances',
            TP.ifInvalid(TP.uri.URI.$get('instances'), TP.hc()));

//  holder for scheme-to-type registrations.
TP.uri.URI.Type.defineAttribute(
            'schemeHandlers',
            TP.ifInvalid(TP.uri.URI.$get('schemeHandlers'), TP.hc()));

//  holder for URIs that have had their remote resources changed but that
//  haven't been refreshed.
TP.uri.URI.Type.defineAttribute('remoteChangeList', TP.hc());

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.uri.URI.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    this.defineDependencies('TP.extern.Promise');

    return;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Type.defineMethod('construct',
function(aURI, aResource) {

    /**
     * @method construct
     * @summary Returns a new instance of URI. The actual type of URI is based
     *     on the scheme and other related data. This method serves as a
     *     common factory for URI instances.
     * @param {String} aURI Ultimately an absolute path but normally a path
     *     starting with '.','/','-', or '~' which is expanded as needed.
     * @param {Object} [aResource] Optional value for the targeted resource.
     * @exception {TP.sig.NoConcreteType} When no concrete type can be found to
     *     construct an instance from.
     * @returns {TP.uri.URI|undefined} The new instance.
     */

    var url,
        check,
        flag,
        inst,
        type,
        err,
        built;

    //  Most common case is a string hoping to become a URI when it grows up. We
    //  want to check all variations of the incoming string before falling
    //  through into construction cycle.
    if (TP.isString(aURI)) {

        //  empty string?
        if (!aURI.trim()) {
            return;
        }

        //  Look for most common cases first (urn and virtual path)
        inst = TP.uri.URI.getInstanceById(TP.uriExpandPath(aURI));
        if (TP.notValid(inst)) {
            inst = TP.uri.URI.getInstanceById(TP.uriInTIBETFormat(aURI));
        }

        if (TP.notValid(inst)) {

            //  Assign so we can use a consistent name for input checks below.
            url = aURI;

            if (TP.regex.HAS_LINEBREAK.test(url)) {
                return;
            }

            //  Deal with common shorthands and other formatting variations.
            if (TP.regex.HAS_BACKSLASH.test(url)) {
                url = TP.uriInWebFormat(url);
            }

            if (url.indexOf('~') === 0 || url.indexOf('tibet:') === 0) {
                type = TP.uri.TIBETURL;
                check = TP.uriResolveVirtualPath(url);

                inst = TP.uri.URI.getInstanceById(check);
            } else if (url.indexOf('urn:') === 0) {
                url = url.replace('urn::', 'urn:tibet:');
                type = url.indexOf('urn:tibet:') === 0 ?
                        TP.uri.TIBETURN :
                        TP.uri.URN;

                inst = TP.uri.URI.getInstanceById(url);
            } else if (url.indexOf('#') === 0) {
                type = TP.uri.TIBETURL;
                url = 'tibet://uicanvas/' + url;

                inst = TP.uri.URI.getInstanceById(url);
            } else if (!TP.regex.URI_LIKELY.test(url) ||
                    TP.regex.REGEX_LITERAL_STRING.test(url)) {
                //  several areas in TIBET will try to resolve strings to URIs.
                //  try to eliminate the non-starters early.
                return;
            } else {
                //  normalize if possible, removing embedded './', '..', etc.,
                //  but we have to use a check here for ~ or tibet:///~ path
                url = TP.uriCollapsePath(url);
                inst = TP.uri.URI.getInstanceById(url);
            }

            if (TP.notValid(inst) && !TP.isType(type)) {
                //  One last adjustment is when a developer uses a typical url
                //  of the form '/' or './' etc. In those cases we need to
                //  update the url to include the current root.
                url = TP.uriWithRoot(url);
                inst = TP.uri.URI.getInstanceById(url);
            }
        }

    } else if (TP.notValid(aURI)) {
        return;
    } else if (TP.isKindOf(aURI, TP.uri.URI)) {
        inst = aURI;
    } else {
        //  TODO:   invoke a "by parts" variant if we get a TP.core.Hash
        //          with URI components (via rewrite() or other means).
        return;
    }

    if (TP.notValid(inst)) {
        //  we don't want to see exceptions when certain URI resolutions fail
        flag = TP.sys.shouldLogRaise();
        TP.sys.shouldLogRaise(false);

        try {
            type = type || this.getConcreteType(url);
            if (TP.isType(type)) {
                //  NOTE we skip this method and go directly to alloc/init
                //  version.
                inst = type.$construct(url);
                built = true;
            } else {
                //  !!!NOTE NOTE NOTE this WILL NOT LOG!!!
                return this.raise(
                    'TP.sig.NoConcreteType',
                    'Unable to locate concrete type for URI: ' + url);
            }
        } catch (e) {
            err = TP.ec(
                    e,
                    TP.join(TP.sc('URI construct produced error for: '), url));
            return this.raise('TP.sig.URIException', err);
        } finally {
            TP.sys.shouldLogRaise(flag);
        }
    }

    if (TP.isValid(inst)) {
        if (built) {
            inst.register();
        }

        if (TP.isValid(aResource)) {
            //  NEVER signal change during construction...no request made.
            inst.setResource(aResource, TP.hc('signalChange', false));
        }
    }

    return inst;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uc',
function(aURI, aResource) {

    /**
     * @method uc
     * @summary A shorthand method for TP.uri.URI.construct().
     * @param {String} aURI Typically an absolute path but possibly a path
     *     starting with '.','/','-', or '~' which is adjusted as needed.
     * @param {Object} [aResource] Optional value for the targeted resource.
     * @returns {TP.uri.URI} The new instance.
     */

    return TP.uri.URI.construct(aURI, aResource);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asURI',
function() {

    /**
     * @method asURI
     * @summary A shorthand method for TP.uri.URI.construct().
     * @returns {TP.uri.URI} The new instance.
     */

    return TP.uri.URI.construct(this.asString());
});

//  ------------------------------------------------------------------------

TP.uri.URI.Type.defineMethod('fromDocument',
function(aDocument) {

    /**
     * @method fromDocument
     * @summary Constructs and returns a new instance by interrogating a
     *     document for its location information.
     * @param {Document} aDocument The document to interrogate for location
     *     data.
     * @exception {TP.sig.InvalidDocument} When aDocument isn't a valid
     *     Document.
     * @returns {TP.uri.URI|undefined} A new instance.
     */

    var path;

    if (!TP.isDocument(aDocument)) {
        this.raise('TP.sig.InvalidDocument');

        return;
    }

    //  document objects can be flagged by TIBET, in which case that wins...
    path = aDocument[TP.SRC_LOCATION];
    if (TP.notEmpty(path)) {
        return this.construct(path + '#document');
    }

    //  they also have their own location
    return this.construct(aDocument.location + '#document');
});

//  ------------------------------------------------------------------------

TP.uri.URI.Type.defineMethod('fromString',
function(aURIString) {

    /**
     * @method fromString
     * @summary Constructs and returns a new TP.uri.URI instance from a
     *     String.
     * @param {String} aURIString A String containing a proper URI.
     * @returns {TP.uri.URI} A new instance.
     */

    return this.construct(aURIString);
});

//  ------------------------------------------------------------------------

TP.uri.URI.Type.defineMethod('fromTP_uri_URI',
function(aURI) {

    /**
     * @method fromTP_uri_URI
     * @summary Returns the URI provided to help ensure unique entries exist.
     * @param {TP.uri.URI} aURI An existing URI.
     * @returns {TP.uri.URI} A new instance.
     */

    return aURI;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Type.defineMethod('fromWindow',
function(aWindow) {

    /**
     * @method fromWindow
     * @summary Constructs and returns a new instance by interrogating a window
     *     for its location information.
     * @param {Window} aWindow The window to interrogate to make the URI from.
     * @exception {TP.sig.InvalidWindow} When aWindow isn't a valid Window.
     * @returns {TP.uri.URI|undefined} A new instance.
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

TP.uri.URI.Type.defineMethod('getConcreteType',
function(aPath) {

    /**
     * @method getConcreteType
     * @summary Returns the type to use for a particular URI path.
     * @param {String} aPath A URI string providing at least a scheme which can
     *     be looked up for a concrete type.
     * @returns {TP.lang.RootObject} A type object.
     */

    var schemeRoot;

    schemeRoot = this.$get('schemeHandlers').at(
                                aPath.slice(0, aPath.indexOf(':')));

    //  Further allow each subtype to refine the concrete type being
    //  assigned. A specific example is TP.uri.URN which can specialize
    //  based on the specific NID.
    if (TP.owns(schemeRoot, 'getConcreteType')) {
        return schemeRoot.getConcreteType(aPath);
    }

    return schemeRoot;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Type.defineMethod('registerForScheme',
function(aScheme) {

    /**
     * @method registerForScheme
     * @summary Registers the receiving type for handling construction of URI
     *     instances for a particular scheme.
     * @param {String} aScheme A URI scheme such as http, file, etc.
     * @exception {TP.sig.InvalidParameter} When the scheme isn't a string.
     * @returns {TP.meta.uri.Type} The receiver.
     */

    var theScheme;

    if (!TP.isString(aScheme)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Scheme is empty or null.');
    }

    theScheme = aScheme.strip(':');
    TP.uri.URI.$get('schemeHandlers').atPut(theScheme, this);

    //  TP.boot objects are primitive, so don't assume at() will work here.
    if (TP.notValid(TP.boot.$uriSchemes[theScheme])) {
        //  Add the scheme to TP.boot's '$uriSchemes' object so that the
        //  shell, etc. will treat the URIs using the scheme properly.
        TP.boot.$uriSchemes[theScheme] = theScheme;

        //  Rewrite the TP.regex.URI_LIKELY so that it reflects the new
        //  scheme as well.
        TP.regex.URI_LIKELY =
            TP.rc(TP.join('^~|^/|^\\.\\/|^\\.\\.\\/',
                            '|^',
                            TP.keys(TP.boot.$uriSchemes).join(':|^'),
                            ':',
                            '|^(?:\\w+):(?:.*)\\/'));

        //  Rewrite the TP.regex.ALL_SCHEMES so that it reflects the new
        //  scheme as well.
        TP.regex.ALL_SCHEMES =
            TP.rc(TP.join(TP.keys(TP.boot.$uriSchemes).join(':|'),
                            ':'));
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Registration
//  ------------------------------------------------------------------------

TP.uri.URI.Type.defineMethod('getInstanceById',
function(anID) {

    /**
     * @method getInstanceById
     * @summary Returns the existing URI instance whose "ID" or path is the
     *     path provided. This uses the TP.uri.URI instance registry as the
     *     lookup location.
     * @param {String} anID A URI ID, which is typically the URI's
     *     fully-expanded and normalized location.
     * @returns {TP.uri.URI} A matching instance, if found.
     */

    return TP.uri.URI.$get('instances').at(anID);
});

//  ------------------------------------------------------------------------

TP.uri.URI.Type.defineMethod('hasInstance',
function(anID) {

    /**
     * @method hasInstance
     * @summary Returns whether a URI object with the supplied URI ID is in the
     *     TP.uri.URI instance registry.
     * @param {String} anID A URI ID, which is typically the URI's
     *     fully-expanded and normalized location.
     * @returns {Boolean} Whether or not an instance is registered with the
     *     type.
     */

    return TP.uri.URI.$get('instances').hasKey(anID);
});

//  ------------------------------------------------------------------------

TP.uri.URI.Type.defineMethod('registerInstance',
function(anInstance, aKey) {

    /**
     * @method registerInstance
     * @summary Registers an instance under that instance's URI string.
     *     Subsequent calls to construct an instance for that URI string will
     *     return the cached instance.
     * @param {TP.uri.URI} anInstance The instance to register.
     * @param {String} [aKey] The optional key to store the instance under.
     * @exception {TP.sig.InvalidURI}
     * @returns {TP.meta.uri.URI} The receiver.
     */

    var dict,
        key,
        current;

    //  update our instance registry with the instance, keying it under the
    //  URI ID.
    dict = this.$get('instances');

    key = aKey;
    if (TP.notValid(key)) {
        return this.raise('InvalidKey');
    }

    current = dict.at(key);
    if (TP.isValid(current) && current !== anInstance) {
        TP.warn('Replacing URI instance for registration key: ' + key);
    }

    //  Note here how we use the value of the 'uri' attribute - we want the
    //  original (but normalized) URI value - not the resolved 'location'.
    dict.atPut(key, anInstance);

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Type.defineMethod('removeInstance',
function(anInstance) {

    /**
     * @method removeInstance
     * @summary Removes an instance under all keys that instance is registered
     *     under.
     * @param {TP.uri.URI} anInstance The instance to remove.
     * @exception {TP.sig.InvalidURI}
     * @returns {TP.meta.uri.URI} The receiver.
     */

    var dict,
        seconds;

    if (!TP.isKindOf(anInstance, TP.uri.URI)) {
        return this.raise('InvalidURI');
    }

    //  update our instance registry by removing the instance, finding its key
    //  under the fully-expanded URI ID.
    dict = this.$get('instances');

    //  If the URI has sub URIs we need to remove them as well.
    if (TP.notEmpty(seconds = anInstance.getSecondaryURIs())) {
        seconds.forEach(
                    function(secondary) {
                        TP.uri.URI.removeInstance(secondary);
                        dict.removeValue(secondary, TP.IDENTITY);
                    });
    }

    //  remove all references to this URI, regardless of the particular key.
    dict.removeValue(anInstance, TP.IDENTITY);

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Type.defineMethod('validate',
function(anObject) {

    /**
     * @method validate
     * @summary Returns true if the object provided it meets the criteria for a
     *     valid URI.
     * @param {Object} anObject The object whose value should be verified.
     * @returns {Boolean} True if the object is 'valid'.
     */

    var str,
        uriInst;

    str = TP.str(anObject);

    if (!TP.isString(str)) {
        return false;
    }

    uriInst = this.construct(str);

    return TP.isValid(uriInst);
});

//  ------------------------------------------------------------------------
//  Rewriting/Routing Support
//  ------------------------------------------------------------------------

/**
 * URI rewriting is common on the server, where patterns like FrontController
 * are used to map requests in the form of URIs to the proper controller type.
 * In TIBET's case URI rewriting is used as a way of "virtualizing" URIs to
 * avoid hard-coded references to specific servers/resources. It also can be
 * used to good effect to switch URIs when moving between online and offline
 * operation, when moving between development, production, and test environments
 * or when using different "mocks" for various testing purposes.
 */

//  ------------------------------------------------------------------------

TP.uri.URI.Type.defineMethod('$getDefaultHandler',
function(aURI, aRequest) {

    /**
     * @method $getDefaultHandler
     * @summary Returns the default handler for a URI and request pair. This is
     *     typically the type defined by TP.sys.cfg('uri.handler.default') which
     *     defaults to TP.uri.URIHandler.
     * @param {TP.uri.URI|String} aURI The URI to obtain the default handler
     *     for.
     * @param {TP.sig.Request} aRequest The request whose values should inform
     *     the routing assignment.
     * @exception {TP.sig.TypeNotFound}
     * @returns {TP.meta.uri.URIHandler} A TP.uri.URIHandler subtype type object
     *     or a type object conforming to that interface.
     */

    var tname,
        type;

    //  default handler is mapped in the configuration settings
    tname = TP.sys.cfg('uri.handler.default');
    if (TP.isEmpty(tname)) {
        this.raise('TP.sig.InvalidConfiguration',
                    'uri.handler.default has no type name specified.');

        //  always return at least our default type
        return TP.uri.URIHandler;
    }

    type = TP.sys.getTypeByName(tname);
    if (TP.notValid(type)) {
        this.raise('TP.sig.TypeNotFound', tname);

        //  always return at least our default type
        return TP.uri.URIHandler;
    }

    return type;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Type.defineMethod('$getURIMap',
function(aURI) {

    /**
     * @method $getURIMap
     * @summary Scans configuration data for uri.map entries representing the
     *     best match for the URI provided. Only entries from a single mapping
     *     will be returned and only if a match is found.
     * @param {TP.uri.URI|String} aURI The URI to locate mapping data for.
     * @exception {TP.sig.InvalidURI}
     * @returns {TP.core.Hash|undefined} A dictionary of matching key values,
     *     if any.
     */

    var url,
        str,
        config,
        patterns,
        exact,
        matches,
        mapname,
        map;

    if (TP.notValid(aURI)) {
        return this.raise('InvalidURI');
    }

    url = TP.uc(aURI);
    if (TP.notValid(url)) {
        return this.raise('InvalidURI');
    }

    //  check the uri instance for a map. if it exists use that cached map.
    map = url.$get('$uriMap');
    if (TP.isValid(map)) {
        return map;
    }

    //  Pattern matching requires the string version of our URI.
    str = TP.str(aURI);

    config = TP.sys.cfg();

    //  Scan for any uri map patterns of any kind.
    if (TP.canInvoke(config, 'getKeys')) {
        patterns = config.getKeys().filter(
                        function(key) {
                            return TP.uri.URI.Type.URI_PATTERN_REGEX.test(key);
                        });
    } else {
        patterns = TP.keys(config).filter(
                        function(key) {
                            return TP.uri.URI.Type.URI_PATTERN_REGEX.test(key);
                        });
    }

    //  No patterns means no mappings.
    if (TP.isEmpty(patterns)) {
        return;
    }

    //  We have at least one pattern. Run each one, collecting match data so we
    //  can sort it in the next step to determine the best match. NOTE we use
    //  some() here to allow for quick return when we find an exact mapping.
    matches = TP.ac();
    patterns.some(
        function(key) {
            var pattern,
                regex,
                match;

            pattern = TP.sys.cfg(key);
            mapname = key.slice(0, key.lastIndexOf('.'));

            if (TP.isString(pattern)) {
                //  A special case here. If the string is a virtual path we
                //  expand it and match the value for the URI. If it's identical
                //  we call that an exact match and communicate that.
                if (TP.uriExpandPath(pattern) === str) {
                    exact = key;
                    return true;
                }

                regex = TP.rc(pattern, null, true);
            } else {
                regex = pattern;
            }

            if (TP.isRegExp(regex)) {
                match = regex.match(str);
                if (TP.notEmpty(match)) {
                    matches.push(TP.ac(match, TP.sys.cfg(mapname), key));
                }
            }

            return false;
        });

    //  If the search found a pattern value that expanded to an exact file match
    //  that one "wins" and we need to return that configuration block.
    if (TP.notEmpty(exact)) {
        map = TP.sys.cfg(mapname);

        //  Adjust keys since the caller won't know pattern prefix etc.
        map.getKeys().forEach(function(key) {
            map.atPut(key.slice(key.lastIndexOf('.') + 1), map.at(key));
        });

        //  Ensure we cache a map as needed.
        if (TP.sys.hasStarted()) {
            url.$set('$uriMap', map, false);
        }

        return map;
    }

    //  No matches means the URI is "unmapped".
    if (TP.isEmpty(matches)) {
        return;
    }

    //  Sort based on criteria for a best fit (more segments, longest match).
    matches = matches.sort(TP.uri.URI.BEST_URIMAP_SORT);

    //  Get the entire set of keys for that mapping entry.
    map = matches.first().at(1);

    //  Adjust keys since the caller won't know pattern prefix etc.
    map.getKeys().forEach(function(key) {
        map.atPut(key.slice(key.lastIndexOf('.') + 1), map.at(key));
    });

    //  Ensure we cache a map as needed.
    if (TP.sys.hasStarted()) {
        url.$set('$uriMap', map, false);
    }

    return map;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Type.defineMethod('remap',
function(aURI, aRequest) {

    /**
     * @method remap
     * @summary Directs the operation implied by any data in aRequest to a
     *     viable handler for the URI and request.
     * @description This typically results in the request being passed to a
     *     TP.uri.URIHandler type/subtype. Note that the URI is expected to
     *     have been rewritten as needed prior to this call so that the
     *     operation is appropriate for the concrete URI being accessed.
     * @param {TP.uri.URI|String} aURI The URI to map.
     * @param {TP.sig.Request} aRequest The request whose values should inform
     *     the routing assignment.
     * @returns {TP.meta.uri.URIHandler} A TP.uri.URIHandler subtype type object
     *     that can handle the request for the supplied URI.
     */

    var mapper,
        type;

    mapper = TP.sys.cfg('uri.mapper');
    type = TP.sys.getTypeByName(mapper);

    if (TP.canInvoke(type, 'remap')) {
        return type.remap(aURI, aRequest);
    } else {
        TP.ifWarn() ?
            TP.warn('URI mapper: ' + mapper +
                    ' does not support remap(); using default.',
                    TP.IO_LOG) : 0;

        return TP.uri.URIMapper.remap(aURI, aRequest);
    }
});

//  ------------------------------------------------------------------------

TP.uri.URI.Type.defineMethod('rewrite',
function(aURI, aRequest) {

    /**
     * @method rewrite
     * @summary Rewrites the incoming URI as appropriate by invoking the
     *     current TP.sys.cfg('uri.rewriter') responsible for URI rewriting.
     * @description This rewriting step is performed prior to any operations
     *     which require a URI handler such as load or save.
     * @param {TP.uri.URI|String} aURI The URI to rewrite.
     * @param {TP.sig.Request} [aRequest] An optional request whose values may
     *     inform the rewrite.
     * @returns {TP.uri.URI} The rewritten URI in TP.uri.URI form.
     */

    var rewriter,
        type;

    rewriter = TP.sys.cfg('uri.rewriter');
    type = TP.sys.getTypeByName(rewriter);

    if (TP.canInvoke(type, 'rewrite')) {
        return type.rewrite(aURI, aRequest);
    } else {
        TP.ifWarn() ?
            TP.warn('URI rewriter: ' + rewriter +
                        ' does not support rewrite(); using default.',
                    TP.IO_LOG) : 0;

        return TP.uri.URIRewriter.rewrite(aURI, aRequest);
    }
});

//  ------------------------------------------------------------------------
//  Remote Resource Change Handling
//  ------------------------------------------------------------------------

/**
 * Remote resources can sometimes notify TIBET when they are changed. This
 * provides support for TIBET to manage a queue of URIs whose remote resource
 * has changed and to process that queue.
 */

//  ------------------------------------------------------------------------

TP.uri.URI.Type.defineMethod('processRemoteResourceChange',
function(aURI) {

    /**
     * @method processRemoteResourceChange
     * @summary Processes a 'remote resource' change for the supplied URI.
     *     Invoked automatically by the TDS and Couch URL handlers to notify
     *     the system that a remote resource has changed value.
     * @description Depending on whether the supplied URI 'isWatched' and
     *     therefore will process changes from its remote resource or not, this
     *     method will either refresh the URI (via refreshFromRemoteResource) or
     *     it will put an entry for the supplied URI into a hash that tracks
     *     URIs that have had their remote resources changed without refreshing.
     * @param {TP.uri.URI|String} aURI The URI that had its remote resource
     *     changed.
     * @returns {Promise|undefined} A promise which resolves based on success.
     */

    var shouldProcess,
        watched,

        loc,

        resourceHash,
        locHash,

        count;

    //  Track system-wide process flag.
    shouldProcess = TP.sys.cfg('uri.source.process_changes');
    watched = aURI.isWatched();

    //  If we're supposed to process AND the uri is configured for processing
    //  then let it refresh from its remote data source.
    if (shouldProcess && watched) {
        return aURI.refreshFromRemoteResource();
    }

    //  Either processing is off or the resource is marked to not process. If
    //  it's marked not to process then we can just exit. It shouldn't be in the
    //  resource hash for changed resources if it's not watched.
    if (!watched) {
        return;
    }

    //  All marked but unprocessed locations get tracked for later processing.
    //  These entries will be removed in the refreshFromRemoteResource method
    //  when all processing is complete.
    loc = aURI.getLocation();
    resourceHash = TP.uri.URI.get('remoteChangeList');
    locHash = resourceHash.at(loc);

    if (TP.notValid(locHash)) {
        locHash = TP.hc('count', 0, 'targetURI', aURI);
        resourceHash.atPut(loc, locHash);
    }

    count = locHash.at('count');
    locHash.atPut('count', count + 1);

    aURI.signal('RemoteResourceChanged', TP.hc('isDirty', true));

    return TP.extern.Promise.resolve();
});

//  ------------------------------------------------------------------------

TP.uri.URI.Type.defineMethod('processRemoteChangeList',
function() {

    /**
     * @method processRemoteChangeList
     * @summary Forces a refresh of all of the queued URIs that had their remote
     * resource changed. The queue is then emptied.
     * @returns {TP.meta.uri.URI} The receiver.
     */

    var resourceHash,
        keys;

    resourceHash = TP.uri.URI.get('remoteChangeList');
    keys = resourceHash.getKeys();

    //  NOTE we iterate in this fashion so we don't remove a referenced URI
    //  unless we're sure processing it doesn't throw an error.
    keys.perform(
        function(key) {
            var hash;

            hash = resourceHash.at(key);
            try {
                hash.at('targetURI').refreshFromRemoteResource();
            } catch (e) {
                TP.error('Error processing URI refresh for ' +
                            hash.at('targetURI'), e);
            }
        });

    return this;
});

//  ------------------------------------------------------------------------
//  Local Resource Change Handling
//  ------------------------------------------------------------------------

TP.uri.URI.Type.defineMethod('getLocalChangeList',
function() {

    /**
     * @method getLocalChangeList
     * @summary Retrieves data for locally dirty URIs. This list is generated on
     *     the fly from the overall URI instance list.
     * @returns {TP.core.Hash} The locally dirty change list, keyed by the
     *     normalized virtual location and having the URI object as the value.
     */

    var hash;

    hash = TP.hc();

    TP.uri.URI.instances.perform(
            function(item) {
                var uri,
                    loc;

                uri = item.last();
                if (!uri.isDirty()) {
                    return;
                }

                //  We only display URLs (and not TIBETURLs)
                if (!TP.isKindOf(uri, TP.uri.URL) ||
                    TP.isKindOf(uri, TP.uri.TIBETURL)) {
                    return;
                }

                //  This creates a more consistent TIBET URI representation.
                loc = TP.uriInTIBETFormat(TP.uriExpandPath(item.first()));

                hash.atPut(loc, item.last());
            });

    return hash;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Type.defineMethod('pushLocalChangeList',
function() {

    /**
     * @method pushLocalChangeList
     * @summary Pushes any changes for locally dirty URIs which are watched.
     * @returns {TP.meta.uri.URI} The receiver.
     */

    var hash;

    //  Grab the hash that represents the locally changed URI list. This will be
    //  keyed by the normalized virtual location and its value will be the URI
    //  object itself.
    hash = this.getLocalChangeList();

    hash.perform(
            function(item) {
                try {
                    item.last().save();
                } catch (e) {
                    TP.error('Error saving ' + item.first(), e);
                }
            });

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the receiver's copy of the original uri used for construction if any,
//  and a decoded variant of that for normal use
TP.uri.URI.Inst.defineAttribute('uri');
TP.uri.URI.Inst.defineAttribute('decoded');

//  the primary location, the portion in front of any # fragment, and any
//  associated TP.uri.URI instance constructed to reference it.
TP.uri.URI.Inst.defineAttribute('primaryLocation');
TP.uri.URI.Inst.defineAttribute('primaryURI');

//  any potentially cached fragment portion. NOTE that caching the fragment
//  portion is a bit dicey since it can be manipulated by various means and
//  must be keep synchronized in such cases.
TP.uri.URI.Inst.defineAttribute('fragment');

//  whether the receiver is HTTP-based
TP.uri.URI.Inst.defineAttribute('httpBased');

//  the resource object for the primary href
TP.uri.URI.Inst.defineAttribute('resource');
TP.uri.URI.Inst.defineAttribute('resourceCache');

//  whether the receiver 'creates content' when setting it
TP.uri.URI.Inst.defineAttribute('shouldCreateContent');

//  holder for this instance's uri lookup properties
TP.uri.URI.Inst.defineAttribute('uriNodes');
TP.uri.URI.Inst.defineAttribute('uriRegex');

//  the scheme which was actually used for this instance, usually the same
//  as the scheme for the type.
TP.uri.URI.Inst.defineAttribute('scheme');

//  the portion of the URI without the scheme. this is the string parsed by
//  the scheme-specific parsing logic.
TP.uri.URI.Inst.defineAttribute('schemeSpecificPart');

//  a container for any headers associated with this instance.  Note that
//  while only HTTP uris are likely to have true headers TIBET can leverage
//  this structure for other URIs to achieve similar results.
TP.uri.URI.Inst.defineAttribute('headers');

//  cached date instance for last update time
TP.uri.URI.Inst.defineAttribute('lastUpdated', null);

//  flag controlling expiration overrides
TP.uri.URI.Inst.defineAttribute('expired', false);

//  cached data on whether this URI exists so we can avoid checking too
//  often. NOTE that we start out null so we don't imply a true/false
TP.uri.URI.Inst.defineAttribute('found', null);

//  content change tracking flag
TP.uri.URI.Inst.defineAttribute('$dirty', false);

//  load status flag
TP.uri.URI.Inst.defineAttribute('$loaded', false);

//  uri mapping/rewriting configuration
TP.uri.URI.Inst.defineAttribute('$uriMap', null);

//  uri handler type based on remap process caching
TP.uri.URI.Inst.defineAttribute('$uriHandler', null);

//  uri as rewritten based on rewrite process caching
TP.uri.URI.Inst.defineAttribute('$uriRewrite', null);

//  the default content type for this instance
TP.uri.URI.Inst.defineAttribute('defaultContentType');

//  the default MIME type for this instance
TP.uri.URI.Inst.defineAttribute('defaultMIMEType');

//  the computed MIME type for this instance
TP.uri.URI.Inst.defineAttribute('computedMIMEType');

//  the controller instance for this instance
TP.uri.URI.Inst.defineAttribute('controller');

//  other URIs that depend on this one (used for reloading, etc.)
TP.uri.URI.Inst.defineAttribute('dependentURIs');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('init',
function(aURIString, aResource) {

    /**
     * @method init
     * @summary Initialize the instance. A key piece of the processing here is
     *     breaking the string into scheme and scheme-specific-part and then
     *     letting each subtype parse the URI components based on
     *     scheme-specific rules.
     * @param {String} aURIString A String containing a proper URI.
     * @param {Object} [aResource] Optional value for the targeted resource.
     * @exception {TP.sig.InvalidURI} When the receiver cannot be initialized
     *     from the supplied URI String.
     * @returns {TP.uri.URI} The receiver.
     */

    var index,
        ssp,
        parts;

    this.callNextMethod();

    //  break the URI string into scheme and scheme-specific-part and then
    //  let the particular type parse the URI components based on
    //  scheme-specific parsing rules.

    index = aURIString.indexOf(':');

    //  NOTE: These '$set' calls use 'false' to avoid notification!! This is
    //  necessary when creating a URI, since otherwise the change notification
    //  mechanism will cause errors trying to get observations set up before
    //  everything is in place.

    this.$set('uri', aURIString, false);
    this.$set('scheme', aURIString.slice(0, index), false);

    ssp = aURIString.slice(index + 1);
    this.$set('schemeSpecificPart', ssp, false);

    //  defer to other methods to handle things each subtype likely needs to
    //  override to finalize instance initialization.
    parts = this.$parseSchemeSpecificPart(ssp);

    if (!this.$initURIComponents(parts)) {
        //  before we try to raise we need at least a uri slot.
        this.$set('uri', aURIString);

        return this.raise('TP.sig.InvalidURI', 'Invalid URL: ' + aURIString);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('addResource',
function(existingResource, newResource, aRequest) {

    /**
     * @method addResource
     * @summary Adds to the receiver's resource object, the object TIBET will
     *     treat as the resource for any subsequent processing.
     * @param {Object} existingResource The existing resource assigned to this
     *     object, if available.
     * @param {Object} newResource The resource object to add to the resource of
     *     the receiver.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request containing
     *     optional parameters.
     * @returns {TP.uri.URL|TP.sig.Response} The receiver or a TP.sig.Response
     *     when the resource must be acquired in an async fashion prior to
     *     setting any fragment value.
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

TP.uri.URI.Inst.defineMethod('$initURIComponents',
function(parts) {

    /**
     * @method $initURIComponents
     * @summary Performs any post-parsing initialization appropriate for the
     *     URI components which were parsed during scheme-specific parsing. The
     *     default routine simply returns.
     * @param {TP.core.Hash} parts The parsed URI components.
     * @returns {TP.uri.URI} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('$parseSchemeSpecificPart',
function(schemeSpecificString) {

    /**
     * @method $parseSchemeSpecificPart
     * @summary Parses inbound URI string content in a fashion specific to the
     *     scheme(s) being managed by the receiver. The baseline version ensures
     *     that the primary/fragment portions are properly parsed and stored,
     *     all other processing of the primary href and/or fragment should be
     *     done via override.
     * @param {String} schemeSpecificString A String containing the
     *     "scheme-specific-part" of a URI.
     * @returns {TP.core.Hash|undefined} The parsed URI 'components'.
     */

    var primaryLocation,
        fragment;

    if (TP.isEmpty(schemeSpecificString)) {
        return;
    }

    //  TODO: Review this entire block of code. It seems that it never gets
    //  called, since most subtypes override this method. They also return an
    //  actual TP.core.Hash, when this method does not.

    //  NOTE: These '$set' calls use 'false' to avoid notification!! This is
    //  necessary when creating a URI, since otherwise the change notification
    //  mechanism will cause errors trying to get observations set up before
    //  everything is in place.

    if (schemeSpecificString.indexOf('#') !== TP.NOT_FOUND) {
        primaryLocation = schemeSpecificString.slice(
                        0, schemeSpecificString.indexOf('#'));

        this.$set('primaryLocation',
                    TP.join(this.$get('scheme'), ':', primaryLocation),
                    false);

        if (TP.notEmpty(fragment = schemeSpecificString.slice(
                                    schemeSpecificString.indexOf('#') + 1))) {

            //  Make sure that the fragment conforms to one of the kinds of
            //  fragments we support (barenames, #document fragments or any kind
            //  of XPointer). Note here how we prepend a '#' to the fragment for
            //  testing for '#document' and for barenames, as those RegExps
            //  require a leading '#'.
            if (TP.regex.DOCUMENT_ID.test('#' + fragment) ||
                TP.regex.BARENAME.test('#' + fragment) ||
                TP.regex.ANY_POINTER.test(fragment)) {

                this.$set('fragment', fragment, false);
            } else {
                this.raise('TP.sig.InvalidFragment');
            }
        }
    } else {
        this.$set('primaryLocation',
                    TP.join(this.$get('scheme'), ':', schemeSpecificString),
                    false);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('constructRequest',
function(aRequest) {

    /**
     * @method constructRequest
     * @summary Constructs a viable request for URI processing using any
     *     optionally provided request as input. If the request provided is
     *     truly a TP.sig.Request then the original request is simply returned
     *     for use.
     * @param {TP.sig.Request|TP.core.Hash} [aRequest] An optional object
     *     defining control parameters.
     * @returns {TP.sig.Request} The original request or a suitable new request
     *     for use.
     */

    var req;

    req = TP.request(aRequest);

    //  If the two aren't the same we built an actual request. As a result we
    //  want to avoid signaling, there won't be any observers for complete etc.
    if (req !== aRequest) {
        req.atPutIfAbsent('shouldSignal', false);
    }

    return req;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('constructSubrequest',
function(aRequest) {

    /**
     * @method constructSubrequest
     * @summary Constructs a subrequest for URI processing using any optionally
     *     provided request as input.
     * @description Subrequest creation differs from 'root' request creation in
     *     that subrequests are always new request objects which simply use the
     *     original request payload (when available).
     * @param {TP.sig.Request|TP.core.Hash} [aRequest] An optional object
     *     defining control parameters.
     * @returns {TP.sig.Request} The original request or a suitable new request
     *     for use.
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

TP.uri.URI.Inst.defineMethod('asDumpString',
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

    var marker,
        str;

    //  Trap recursion around potentially nested object structures.
    marker = '$$recursive_asDumpString';
    if (TP.owns(this, marker)) {
        return TP.recursion(this, marker);
    }
    this[marker] = true;

    str = '[' + TP.tname(this) + ' :: ';

    try {
        str += '(' + TP.str(this.getLocation()) + ')' + ']';
    } catch (e) {
        str += '(' + TP.str(this) + ')' + ']';
    } finally {
        delete this[marker];
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    return '<span class="TP_uri_URI ' +
                TP.escapeTypeName(TP.tname(this)) + '">' +
            TP.htmlstr(this.asString()) +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    return '{"type":' + TP.tname(this).quoted('"') + ',' +
             '"data":' + this.asString().quoted('"') + '}';
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    return '<dl class="pretty ' +
                TP.escapeTypeName(TP.tname(this)) +
            '"><dt/><dd>' +
            TP.pretty(this.asString()) +
            '</dd></dl>';
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @method asString
     * @summary Returns a string representation of the receiver.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.uri.URI's String representation. This flag is ignored in
     *     this version of this method.
     * @returns {String} The receiver's String representation.
     */

    return TP.str(this.getLocation());
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    return 'TP.uc(\'' + this.getLocation() + '\')';
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    return '<instance type="' + TP.tname(this) + '">' +
                    TP.xmlstr(this.asString()) +
                    '</instance>';
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('asTP_uri_URI',
function() {

    /**
     * @method asTP_uri_URI
     * @summary Returns the receiver.
     * @returns {TP.uri.URI} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('$changed',
function(anAspect, anAction, aDescription) {

    /**
     * @method $changed
     * @summary Notifies observers that some aspect of the receiver has
     *     changed. The fundamental data-driven dependency method.
     * @description See the supertype method for more information.
     * @param {String} anAspect The aspect of the receiver that changed. This is
     *     usually an attribute name.
     * @param {String} anAction The action which caused the change. This usually
     *     'add', 'remove', etc.
     * @param {TP.core.Hash} aDescription A hash describing details of the
     *     change.
     * @fires {TP.sig.Change}
     * @returns {TP.uri.URI} The receiver.
     */

    var primaryResource,

        secondaryURIs,

        desc,

        subDesc,
        sigName,

        i;

    //  Note how we grab the *primary URI's* resource's result. This is the
    //  target that the path query will be executed against to obtain any value.
    //  NB: We assume 'async' of false here
    primaryResource =
        this.getPrimaryURI().getResource(TP.hc('refresh', false)).get('result');

    //  If this this doesn't have any sub URIs, then we'll just let all of
    //  the parameters default in the supertype call, except we do provide the
    //  'path' and 'target' here.
    if (TP.isEmpty(secondaryURIs = this.getSecondaryURIs())) {

        desc = TP.isValid(aDescription) ? aDescription : TP.hc();
        desc.atPutIfAbsent('path', this.getFragmentExpr());
        desc.atPutIfAbsent('target', primaryResource);
        desc.atPutIfAbsent(TP.NEWVAL, primaryResource);

        return this.callNextMethod(anAspect, anAction, desc);
    } else {

        //  Otherwise, this is a primary URI and we need to send change
        //  notifications from all of its secondaryURIs, if it has any.

        //  Note here how we signal one of the types of TP.sig.StructureChange.
        //  This is because the whole value of the primary URI has changed so,
        //  as far as the secondaryURIs are concerned, the whole structure has
        //  changed.

        subDesc = TP.hc('action', anAction,
                        'aspect', 'value',
                        'facet', 'value',
                        'target', primaryResource
                        );

        switch (anAction) {
            case TP.CREATE:
            case TP.INSERT:
            case TP.APPEND:

                //  CREATE, INSERT or APPEND means an 'insertion structural
                //  change' in the data.
                sigName = 'TP.sig.StructureInsert';
                break;

            case TP.DELETE:

                //  DELETE means a 'deletion structural change' in the data.
                sigName = 'TP.sig.StructureDelete';
                break;

            default:

                //  The default is the supertype TP.sig.StructureChange signal.
                sigName = 'TP.sig.StructureChange';
                break;
        }

        for (i = 0; i < secondaryURIs.getSize(); i++) {

            subDesc.atPut('path', secondaryURIs.at(i).getFragmentExpr());

            secondaryURIs.at(i).signal(sigName, subDesc);
        }

        //  Now that we're done signaling the sub URIs, it's time to signal a
        //  TP.sig.ValueChange from ourself (our 'whole value' is changing).

        //  If we got a valid description, use that.
        if (TP.isValid(aDescription)) {
            desc = aDescription;
        } else {
            //  Otherwise, build a Hash with the same parameters as we used for
            //  the sub URIs, but without the 'path' (which doesn't make sense
            //  at a 'whole URI' level).
            desc = TP.hc('action', anAction,
                            'aspect', 'value',
                            'facet', 'value',
                            'target', primaryResource
                            );
        }

        this.signal('TP.sig.ValueChange', desc);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('$constructPrimaryResourceStub',
function(aPathType) {

    /**
     * @method $constructPrimaryResource
     * @summary Constructs a primary resource 'stub' when the primary resource
     *     is missing for a secondary URI that is trying to access it.
     * @param {String} aPathType The 'path type' of the path created from the
     *     secondary URI's fragment.
     * @returns {Object|null} The object to use as the primary resource stub.
     */

    var result;

    switch (aPathType) {
        case TP.TIBET_PATH_TYPE:
        case TP.JSON_PATH_TYPE:
            result = TP.hc();
            break;
        case TP.CSS_PATH_TYPE:
        case TP.XPATH_PATH_TYPE:
        case TP.BARENAME_PATH_TYPE:
        case TP.XPOINTER_PATH_TYPE:
        case TP.ELEMENT_PATH_TYPE:
        case TP.XTENSION_POINTER_PATH_TYPE:
            result = TP.constructDocument();
            break;
        default:
            break;
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('clearCaches',
function() {

    /**
     * @method clearCaches
     * @summary Clears any content caches related to the receiver, returning
     *     things to their pre-loaded state. For URIs with a separate resource
     *     URI this will also clear the resource URI's caches.
     * @returns {TP.uri.URI} The receiver.
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

TP.uri.URI.Inst.defineMethod('$clearCaches',
function() {

    /**
     * @method $clearCaches
     * @summary Clears the internal caches of the receiver. This method is
     *     expected to be overridden by subtypes so they can clear any
     *     specialized cache data, but it should be invoked by any overriding
     *     method.
     * @returns {TP.uri.URI} The receiver.
     */

    var resource;

    TP.ifTrace() ?
        TP.sys.logTransform('Clearing content cache for: ' + this.getID(),
            TP.DEBUG) : 0;

    if (TP.isValid(resource = this.$get('resource'))) {
        this.ignore(resource, 'Change');
    }

    //  empty the resource cache(s) - note that we *must* use $set() here to
    //  avoid all of the ID comparison and change notification machinery in the
    //  regular setResource call. Force no notification, we cleared the cache,
    //  we didn't change the value.
    this.$set('resource', null, false);

    //  update expiration status as well as any potentially obsolete headers
    this.set('headers', null);
    this.$set('expired', false);

    //  clear any internal state flags that might cause issues reloading
    this.isLoaded(false);
    this.isDirty(false, true);

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('empty',
function() {

    /**
     * @method empty
     * @summary Clears any stored content of the receiver, or of its resource
     *     URI if it has one which stores its data. Note that only the data is
     *     cleared, not the remaining cache data such as headers etc. This
     *     operation dirties the receiver.
     * @returns {TP.uri.URI} The receiver.
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

TP.uri.URI.Inst.defineMethod('equalTo',
function(aURI) {

    /**
     * @method equalTo
     * @summary Two URLs are considered equal if their locations are equal.
     * @param {TP.uri.URI|String} aURI The URI to compare.
     * @returns {Boolean} Whether or not the receiver is equal to the passed in
     *     parameter.
     */

    var uri,
        loc;

    if (TP.isURIString(aURI)) {
        uri = aURI;
    } else if (!TP.isString(aURI) && TP.isURI(aURI)) {
        uri = aURI.getLocation();
    } else {
        return false;
    }

    loc = this.getLocation();

    return TP.uriExpandPath(uri) === loc;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('expire',
function(aFlag) {

    /**
     * @method expire
     * @summary Sets the expiration flag for the receiver to true, forcing a
     *     one-time override of any computation-based expiration.
     * @param {Boolean} [aFlag=true] The value to set the expiration flag to.
     *     Defaults to true.
     * @returns {Boolean} Whether or not the content of the receiver is expired.
     */

    var url;

    //  When there's a primary URI we defer entirely to that URI since all
    //  core data caches are managed by the primary.
    if ((url = this.getPrimaryURI()) !== this) {
        url.expire(aFlag);
        return url.isExpired();
    }

    this.$set('expired', TP.ifInvalid(aFlag, true), false);

    return this.isExpired();
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getConcreteURI',
function() {

    /**
     * @method getConcreteURI
     * @summary Return's the receiver's 'concrete' URI. At this level, this
     *     method just returns the receiver. Subtypes may override this method
     *     to return a different URI as the concrete URI. See TP.uri.TIBETURL
     *     for an example of this.
     * @returns {Object} The receiver's 'concrete' URI.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getContent',
function(aRequest) {

    /**
     * @method getContent
     * @summary Returns the URI's resource, forcing any fetch to be synchronous.
     *     If you need async access use getResource.
     * @returns {Object} The immediate value of the receiver's resource result.
     */

    var request;

    request = this.constructRequest(aRequest);
    request.atPut('async', false);

    //  Track initial state so we can properly process flags/results.
    request.atPut('operation', 'get');
    request.atPut('loaded', this.isLoaded());

    return this.getResource(request).get('result');
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('$getDefaultHandler',
function(aRequest) {

    /**
     * @method $getDefaultHandler
     * @summary Returns the default handler for a URI and request pair. This is
     *     typically the type defined by TP.sys.cfg('uri.handler.default'),
     *     which defaults to TP.uri.URIHandler.
     * @param {TP.sig.Request} aRequest The request whose values should inform
     *     the handler assignment.
     * @returns {TP.meta.uri.URIHandler} A TP.uri.URIHandler subtype type object
     *     or a type object conforming to that interface.
     */

    return this.getType().$getDefaultHandler(this, aRequest);
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('$getFilteredResult',
function(anObject, aRequest, collapse) {

    /**
     * @method $getFilteredResult
     * @summary Processes a value to ensure it matches a request's stated
     *     resultType preferences. When the data doesn't match that preference a
     *     conversion is attempted and the return value of that conversion is
     *     returned.
     * @description If the data can't be converted properly this method returns
     *     undefined. If no resultType is specified then a "best fit" result is
     *     returned. The best fit result processing attempts to construct a
     *     valid TP.dom.Node, then a viable JavaScript object by parsing for
     *     JSON strings, and finally just the object itself.
     * @param {Object} anObject The object to "type check".
     * @param {Object} aRequest The request object used to original fetch data.
     * @param {Boolean} [collapse=true] False to skip collapsing node lists to a
     *     single node.
     * @returns {Object} The desired return value type.
     */

    var obj,
        saved,
        resultType,
        contentType,
        type,
        request;

    request = this.constructRequest(aRequest);
    resultType = request.at('resultType');

    if (TP.isValid(anObject)) {
        switch (resultType) {
            case TP.DOM:

                //  Often dealing with TP.core.Content types so we have to work
                //  from the data, not the object in those cases.
                if (TP.canInvoke(anObject, 'getNativeNode')) {
                    obj = anObject.getNativeNode();
                } else {
                    obj = anObject;
                }

                if (TP.notFalse(collapse)) {
                    obj = TP.collapse(obj);
                    if (TP.isValid(obj)) {
                        obj = TP.node(obj, null, false);
                    }
                } else {
                    obj = TP.node(obj, null, false);
                }
                return obj;

            case TP.TEXT:

                obj = anObject;
                if (TP.notFalse(collapse)) {
                    obj = TP.collapse(obj);
                    if (TP.isValid(obj)) {
                        obj = TP.str(obj);
                    } else {
                        obj = '';
                    }
                } else {
                    obj = TP.str(obj, false);
                }
                return obj;

            case TP.WRAP:

                //  Often dealing with TP.core.Content types so we have to work
                //  from the data, not the object in those cases.
                if (TP.isKindOf(anObject, TP.core.XMLContent)) {
                    obj = anObject.getData();
                } else {
                    obj = anObject;
                }

                //  don't want to convert anything that's already in
                //  reasonable object form...so the primary test is whether
                //  the object is a string that might be parseable into a
                //  more object form
                if (TP.isString(obj) && TP.notEmpty(obj)) {
                    //  mirror "best" in some sense, attempting to find XML,
                    //  then JSON, then any parseable object we might be
                    //  able to detect.
                    saved = obj;

                    //  Note here that we turn XML parsing error reporting off
                    //  and, if it resolves to a single Text node, we will try
                    //  to convert it further.
                    if (TP.notValid(obj = TP.tpnode(obj, null, false)) ||
                        TP.isKindOf(obj, TP.dom.TextNode)) {
                        //  json?
                        if (TP.notValid(obj = TP.json2js(
                                                saved, null, false))) {
                            //  date or other parsable object?
                            if (TP.notValid(obj = TP.parse('Date', saved))) {
                                //  default back to original object. not
                                //  great, but apparently it's not parseable
                                obj = saved;
                            }
                        }
                    }

                    if (TP.notFalse(collapse)) {
                        obj = TP.collapse(obj);
                    }
                } else if (TP.isNode(obj)) {
                    if (TP.notFalse(collapse)) {
                        obj = TP.collapse(obj);
                    }

                    obj = TP.tpnode(obj);
                } else {
                    if (TP.notFalse(collapse)) {
                        obj = TP.collapse(obj);
                    }

                    obj = TP.wrap(obj);

                    if (TP.notValid(obj)) {
                        if (TP.notFalse(collapse)) {
                            obj = TP.collapse(obj);
                        }
                    }
                }
                return obj;

            case TP.CONTENT:
                //  fall through to default handling.
            default:

                contentType = TP.ifInvalid(
                                request.at('contentType'),
                                this.get('defaultContentType'));
                if (TP.notValid(contentType)) {
                    return anObject;
                }

                type = TP.sys.getTypeByName(contentType);

                if (TP.isType(type)) {
                    //  Don't recreate instances of the same type.
                    if (TP.canInvoke(anObject, 'getType') &&
                        type === anObject.getType()) {
                        obj = anObject;
                    } else {
                        obj = type.from(anObject, this);
                    }
                } else {
                    obj = anObject;
                }

                return obj;
        }
    }

    //  There was no valid object - return null
    return null;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getFragment',
function() {

    /**
     * @method getFragment
     * @summary Returns the fragment portion of the receiver as a String.
     * @returns {String} The fragment string.
     */

    //  NOTE that we rely on the initial parse operation to populate any
    //  fragment portion, otherwise we'd be recomputing.
    return this.$get('fragment');
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getFragmentAccessPath',
function() {

    /**
     * @method getFragmentAccessPath
     * @summary Returns an instance of an access path from the path encoded in
     *     the fragment expression of the receiver (if its fragment forms an
     *     expression that can be considered an access path).
     * @returns {TP.path.AccessPath|null} An access path created from the
     *     receiver's fragment.
     */

    var fragment,
        fragmentAccessor;

    fragment = this.getFragment();
    if (TP.isEmpty(fragment)) {
        return null;
    }

    if (TP.regex.ANY_POINTER.test(fragment)) {
        fragmentAccessor = TP.apc(fragment);
        return fragmentAccessor;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getFragmentAccessPathType',
function() {

    /**
     * @method getFragmentAccessPathType
     * @summary Returns the type of the access path encoded in the fragment
     *     expression of the receiver (if its fragment forms an expression that
     *     can be considered an access path).
     * @returns {String} One of the 'path type' constants:
     *     TP.TIBET_PATH_TYPE
     *     TP.JSON_PATH_TYPE
     *     TP.CSS_PATH_TYPE
     *     TP.XPATH_PATH_TYPE
     *     TP.BARENAME_PATH_TYPE
     *     TP.XPOINTER_PATH_TYPE
     *     TP.ELEMENT_PATH_TYPE
     *     TP.XTENSION_POINTER_PATH_TYPE
     */

    var fragment,
        fragmentAccessor,

        fragExpr;

    //  The most robust way to do this is to create a TP.path.AccessPath object
    //  from the fragment and ask that object.
    fragment = this.getFragment();
    if (TP.isEmpty(fragment)) {
        return TP.NOT_FOUND;
    }

    if (TP.regex.ANY_POINTER.test(fragment)) {
        fragmentAccessor = TP.apc(fragment);
        return fragmentAccessor.getPathType();
    }

    //  As a fallback, we can try to compute the access path type by looking at
    //  the raw fragment expression.
    fragExpr = this.getFragmentExpr();
    if (TP.isEmpty(fragExpr)) {
        return TP.NOT_FOUND;
    }

    return TP.getAccessPathType(fragExpr);
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getFragmentExpr',
function() {

    /**
     * @method getFragmentExpr
     * @summary Returns the fragment text of the receiver as a String without
     *     the fragment scheme portion.
     * @returns {String} The fragment string.
     */

    var frag,
        results;

    //  NOTE that we rely on the initial parse operation to populate any
    //  fragment portion, otherwise we'd be recomputing.
    frag = this.$get('fragment');

    if (TP.notEmpty(results = TP.regex.ANY_POINTER.match(frag))) {
        return results.at(2);
    }

    if (TP.regex.XML_IDREF.test(frag)) {
        return frag;
    }

    return '';
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getFragmentParameters',
function(textOnly) {

    /**
     * @method getFragmentParameters
     * @summary Returns any "parameters" from the receiver's fragment string.
     *     The parameter set is derived by treating a fragment as a potential
     *     URI and processing it using normal parsing based on & and =.
     * @param {Boolean} [textOnly=false] Return just the text fragment string
     *     if any.
     * @returns {TP.core.Hash} The fragment parameters if any.
     */

    var text,
        hash;

    text = this.getFragment();
    hash = TP.hc();

    //  don't bother if fragment is a pointer of some kind.
    if (TP.regex.ANY_POINTER.test(text)) {
        if (textOnly) {
            return '';
        }
        return hash;
    }

    if (textOnly) {
        return text;
    }

    return TP.hc(TP.boot.$parseURIParameters(text));
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getFragmentPath',
function() {

    /**
     * @method getFragmentPath
     * @summary Returns any "path portion" of a fragment string. The path
     *     portion is based on treating a fragment as a potential URI itself and
     *     processing it using normal parsing for path vs. parameter data. Note
     *     that the path value is always prefixed with a '/' for consistency
     *     with base URL path values.
     * @returns {String|undefined} The fragment path if any.
     */

    var text;

    text = this.getFragment();

    //  don't confuse xpointer prefix with path content.
    if (TP.isEmpty(text) || TP.regex.ANY_POINTER.test(text)) {
        return;
    }

    if (/\?/.test(text)) {
        text = text.slice(0, text.indexOf('?'));
    }

    if (text.charAt(0) !== '/') {
        text = '/' + text;
    }

    return text;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getFragmentWeight',
function() {

    /**
     * @method getFragmentWeight
     * @summary Returns the 'weight' of the fragment. Typically this is how many
     *     'parts' the fragment has in any path in it.
     * @returns {Number} The fragment weight.
     */

    var frag,

        results;

    //  NOTE that we rely on the initial parse operation to populate any
    //  fragment portion, otherwise we'd be recomputing.
    frag = this.$get('fragment');

    //  We do an isValid check since an empty Array is ok - it will just report
    //  a size of 0.
    //
    if (TP.isValid(results = TP.uriSplitFragment(frag))) {
        return results.getSize();
    }

    return 0;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getHeader',
function(aHeaderName) {

    /**
     * @method getHeader
     * @summary Returns the value of the named header, or null if the header
     *     value isn't found.
     * @param {String} aHeaderName The name of the header to retrieve.
     * @returns {String|undefined} The value of the header named with the
     *     supplied name.
     */

    var dict;

    dict = this.$get('headers');
    if (TP.isEmpty(dict)) {
        return;
    }

    return dict.at(aHeaderName);
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getID',
function() {

    /**
     * @method getID
     * @summary Returns the ID of the receiver, which for URIs is their URI in
     *     a fully-expanded format so minor variations in syntax are removed.
     * @returns {String} The ID of the receiver.
     */

    var id;

    //  Make sure that, if the receiver is a prototype, we just return the value
    //  of the TP.ID slot. Otherwise, we're trying to get an ID from an object
    //  that represents only a partially formed instance for this type.
    if (TP.isPrototype(this)) {
        return this[TP.ID];
    }

    //  the next question is do we have our *own* id (otherwise, we'll report
    //  the value inherited from the prototype)
    if (TP.owns(this, TP.ID)) {
        return this.$get(TP.ID);
    }

    id = this.getLocation();
    this.$set(TP.ID, id);

    return id;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getLastUpdateDate',
function() {

    /**
     * @method getLastUpdateDate
     * @summary Returns the last update time for the receiver as recorded in
     *     the URI's header content -- specifically the Date header.
     * @returns {Date|undefined} The date the receiver was last updated.
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
        TP.ifTrace() && TP.$DEBUG && TP.$VERBOSE ?
            TP.trace(this.getID() +
                            ' has no Last-Updated information') : 0;
        return;
    }

    TP.ifTrace() && TP.$DEBUG && TP.$VERBOSE ?
        TP.trace(this.getID() +
                        ' returning cached Last-Updated: ' +
                        theDate) : 0;

    this.$set('lastUpdated', theDate);

    return theDate;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getLocalPath',
function() {

    /**
     * @method getLocalPath
     * @summary Returns the locally-formatted absolute path to the URI's
     *     resource.
     * @description Note that no rewriting is performed in the production of
     *     this value. The returned URI is simply adjusted for the current
     *     platform's semantics.
     * @returns {String} The receiver's local path.
     */

    return TP.uriInLocalFormat(this.getLocation());
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getLocation',
function() {

    /**
     * @method getLocation
     * @summary Returns the true location of the URI. For most URIs this value
     *     is the same as the original URI, but for virtual URIs it represents
     *     the expanded URI value.
     * @returns {String} The receiver's location.
     */

    var url;

    if (TP.notValid(url = this.$get('decoded'))) {
        url = this.$get('uri');
        if (TP.notEmpty(url)) {
            url = decodeURI(encodeURI(url));
            this.$set('decoded', url);
        }
    }

    return url;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getMIMEType',
function(newResource) {

    /**
     * @method getMIMEType
     * @summary Returns the MIME type of the receiver, if available. See the
     *     TP.ietf.mime.getMIMEType() method for more information about how
     *     TIBET tries to guess the MIME type based on file name and data
     *     content.
     * @param {Object} [newResource] An optional resource object that will be
     *     used to compute the MIME type. If this is not supplied, then the
     *     receiver's existing resource object will be used.
     * @returns {String} The receiver's MIME type.
     */

    var url,
        mimeType,

        resource,
        fragment,
        content;

    //  if there's a valid computed MIME we can use it first
    if (TP.notEmpty(mimeType = this.get('computedMIMEType'))) {
        return mimeType;
    }

    //  TODO:   if we're a fragment then is it possible that our MIME type
    //  could differ from that of our container?
    //  Always defer to the primary URI if we have a distinct one.
    if ((url = this.getPrimaryURI()) !== this) {
        return url.getMIMEType();
    }

    //  Need to avoid recursion here so we check the resource slot, but
    //  don't actually invoke getResource
    if (TP.isValid(newResource)) {
        content = newResource;
    } else if (this.isLoaded()) {
        resource = this.$get('resource');
        if (this.hasFragment() && TP.canInvoke(resource, 'get')) {
            fragment = this.getFragment();
            if (TP.isKindOf(resource, TP.dom.Node)) {
                fragment = fragment.startsWith('#') ?
                            fragment :
                            '#' + fragment;
            }
            content = resource.get(fragment);
        } else {
            content = resource;
        }
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

    //  if we couldn't ask the content then we can try to guess via the
    //  MIME type itself
    mimeType = TP.ietf.mime.guessMIMEType(
                                content, this, this.get('defaultMIMEType'));

    if (TP.isString(mimeType)) {
        //  note that we don't cache the guess
        return mimeType;
    }

    return this.get('defaultMIMEType');
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getName',
function() {

    /**
     * @method getName
     * @summary An override of the getName() operation that returns the
     *     receiver's *OID* as the 'Name'. This is necessary because this type
     *     override's getID() (normally used by the getName() method) to return
     *     special IDs for URIs.
     * @returns {String} The receiver's name.
     */

    return this.$getOID();
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getNativeObject',
function() {

    /**
     * @method getNativeObject
     * @summary Returns the native object that the receiver is wrapping. In the
     *     case of TP.uri.URIs, this is the receiver's string instance.
     * @returns {String} The receiver's native object.
     */

    return this.getLocation();
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getOriginalSource',
function() {

    /**
     * @method getOriginalSource
     * @summary Returns the 'original source' representation that the receiver
     *     was constructed with.
     * @returns {String} The receiver's original source.
     */

    //  For most TP.uri.URIs, this is its location.
    return this.getLocation();
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getPrimaryLocation',
function() {

    /**
     * @method getPrimaryLocation
     * @summary Returns the primary resource's URIs location. This is the
     *     portion of the URI which isn't qualified by a fragment, the portion
     *     you can send to a server without causing an error.
     * @returns {String} The primary href as a String.
     */

    var str;

    //  If we have a locally cached value return that. We only compute this
    //  when the receiver didn't defer to a primary URI.
    if (TP.notEmpty(str = this.$get('primaryLocation'))) {
        return str;
    }

    //  Fully expand and then trim off any fragment portion.
    str = this.getLocation();
    if (this.hasFragment()) {
        str = str.split('#').at(0);
    }

    this.$set('primaryLocation', str);

    return str;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('$getPrimaryResource',
function(aRequest, filterResult) {

    /**
     * @method $getPrimaryResource
     * @summary Returns a receiver-specific object representing the "primary"
     *     resource being accessed (i.e. the resource referenced by the base
     *     resource path without any fragment. This is the routine most subtypes
     *     override to perform their low-level data access. Fragment processing
     *     is typically done by the getResource() call which can usually be
     *     defaulted.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @param {Boolean} [filterResult=false] True if the resource result will be
     *     used directly and should be filtered to match any resultType
     *     definition found in the request.
     * @returns {TP.sig.Response} A TP.sig.Response created with the resource's
     *     content set as its result.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getPrimaryURI',
function() {

    /**
     * @method getPrimaryURI
     * @summary Returns the actual resource URI used for content access. This
     *     may be the receiver or it may be the URI referencing the primary
     *     resource data for the receiver if the receiver has a fragment, or it
     *     may be an "embedded" URI in the case of schemes which support
     *     embedding URIs such as tibet:.
     * @returns {TP.uri.URI} The receiver's primary resource URI.
     */

    var url;

    //  If we have a locally cached value return that.
    if (TP.isURI(url = this.$get('primaryURI'))) {
        return url;
    }

    //  When there's no fragment the receiver is the primary, otherwise we
    //  need to get a reference to the primary.
    /* eslint-disable consistent-this */
    url = this;
    /* eslint-enable consistent-this */
    if (this.hasFragment()) {
        url = TP.uc(this.getPrimaryLocation());
    }

    return url;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getResource',
function(aRequest) {

    /**
     * @method getResource
     * @summary Returns a receiver-specific object representing the "secondary"
     *     resource being accessed (i.e. the resource referenced by the base
     *     resource path subset identified by any fragment portion. If there is
     *     no fragment this method returns the same value as
     *     $getPrimaryResource()).
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A TP.sig.Response created with the requested
     *     content set as its result.
     */

    var request;

    request = this.constructRequest(aRequest);

    //  Track initial state so we can properly process flags/results.
    request.atPutIfAbsent('operation', 'get');
    request.atPutIfAbsent('loaded', this.isLoaded());

    //  When we're primary or we don't have a fragment we can keep it
    //  simple and just defer to $getPrimaryResource.
    if (this.isPrimaryURI() ||
        !this.hasFragment() ||
        this.getFragment() === 'document') {
        return this.$getPrimaryResource(request, true);
    }

    return this.$requestContent(request,
                                '$getPrimaryResource',
                                '$getResultFragment');
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getRoot',
function() {

    /**
     * @method getRoot
     * @summary Returns the root of the receiver.
     * @returns {String} The receiver's root.
     */

    return TP.uriRoot(this.getLocation());
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getRootAndPath',
function() {

    /**
     * @method getRootAndPath
     * @summary Returns the root and path of the receiver. Note that this can be
     *     different than the receiver's location if (as in the case of HTTP
     *     URLs), as the location could contain query parameters, etc. and this
     *     will not.
     * @returns {String} The receiver's root and path.
     */

    return this.get('root') + this.get('path');
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('$getResultFragment',
function(aRequest, aResult, aResource) {

    /**
     * @method $getResultFragment
     * @summary Invoked as a "success body" function for the getResource call
     *     with the purpose of returning the secondary resource of the result
     *     object being provided.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An optional object
     *     defining control parameters.
     * @param {Object} aResult The result of a content access call.
     * @param {Object} [aResource] Optional data from set* invocations.
     * @returns {Object} The return value for the content operation using this
     *     as a success body function.
     */

    var fragment,
        result,
        shouldCollapse;

    fragment = this.getFragment();
    if (TP.notEmpty(fragment)) {

        fragment = fragment.indexOf('#') === 0 ? fragment : '#' + fragment;

        if (TP.regex.DOCUMENT_ID.test(fragment) ||
                TP.regex.BARENAME.test(fragment)) {
            //  empty
        } else if (TP.regex.ANY_POINTER.test(fragment)) {
            //  Note that we don't worry about setting the path to collapse
            //  results here, since we collapse whatever we got below.
            fragment = TP.apc(fragment);
        }

        //  NB: The result must be a Node to get wrapped into a TP.dom.Node,
        //  otherwise we just use the result itself.
        result = TP.isNode(aResult) ? TP.tpnode(aResult) : aResult;

        //  Make sure that we obtain the 'shouldCollapse' value from the request
        //  (if it has one - defaulted to true) and if the fragment is an access
        //  path, configure it with the same setting.

        //  Note here that if we do collapse, we do so to just to make sure to
        //  have consistent results across 'get' calls... what ultimately gets
        //  returned from this method is determined by the $getFilteredResult
        //  call below.

        shouldCollapse = TP.ifKeyInvalid(aRequest, 'shouldCollapse', true);

        if (fragment.isAccessPath()) {
            fragment.set('shouldCollapse', shouldCollapse);
        }

        result = TP.canInvoke(result, 'get') ? result.get(fragment) : undefined;

        //  If collapsing wasn't specifically set to false, then collapse the
        //  result.
        if (TP.notFalse(shouldCollapse)) {
            result = TP.isCollection(result) ? TP.collapse(result) : result;
        }
    } else {
        result = aResult;
    }

    //  filter to any result type which was specified.
    result = this.$getFilteredResult(result, aRequest);

    return result;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getScheme',
function() {

    /**
     * @method getScheme
     * @summary Returns the scheme of the receiver, the string which starts off
     *     URIs of this type or for this particular instance.
     * @returns {String} The receiver's scheme.
     */

    return this.$get('scheme') || this.getType().get('SCHEME');
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getSize',
function() {

    /**
     * @method getSize
     * @summary Returns the size of the URI in string form. This is used for
     *     testing whether the URI is empty when passed as a string.
     * @returns {Number} The size in bytes of the receiver as a String.
     */

    return this.asString().getSize();
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getSecondaryURIs',
function(onlyShallow) {

    /**
     * @method getSecondaryURIs
     * @summary Returns an Array of secondary URIs of the receiver. These are
     *     URIs which point to the same primary resource as the receiver, but
     *     also have a secondary resource pointed to by a fragment. If the
     *     receiver has a secondary resource itself, it returns null.
     * @description This method also will create an 'empty pointer' URI
     *     consisting of the receiver's primary URI location, the scheme and an
     *     empty parentheses. This allows consistent results for when this empty
     *     pointer URI might not have been created explicitly.
     * @param {Boolean} [onlyShallow=false] Whether or not to only include
     *     secondary URIs that are 'the shallowest possible set'. I.e. if the
     *     set of secondary URIs consisted of 'urn:tibet:stuff#tibet(foo)' and
     *     'urn:tibet:stuff#tibet(foo.bar)', then only the first one will be
     *     returned.
     * @returns {TP.uri.URI[]} An Array of TP.uri.URI objects corresponding to
     *     the 'secondary URI's of the receiver.
     */

    var secondaryURIs,
        uriGroupings,

        schemeOnlySecondaryURI,

        scheme;

    secondaryURIs = this.getSubURIs(true);

    if (TP.notEmpty(secondaryURIs)) {

        if (onlyShallow) {

            //  Group the secondary URIs by their 'fragment weight'. We want
            //  only the ones in the group with the lowest weight.
            uriGroupings = secondaryURIs.groupBy(
                                function(aURI) {
                                    return aURI.getFragmentWeight();
                                });

            //  Make sure the hash keys are sorted sorted
            uriGroupings.sort(TP.sort.NUMERIC);

            //  Get the first item's (a key-value pair) last item, which will
            //  be an Array.
            secondaryURIs = uriGroupings.first().last();
        }

        //  Grab the fragment scheme from the first secondary URI
        scheme = TP.getPointerScheme(secondaryURIs.first().getFragment());

        //  Compute the 'empty pointer' URI location.
        schemeOnlySecondaryURI =
            this.getPrimaryURI().getLocation() + '#' + scheme + '()';

        //  Create and push a URI instance representing the empty pointer.
        secondaryURIs.push(TP.uc(schemeOnlySecondaryURI));

        //  Unique the list in case the empty pointer already existed.
        secondaryURIs.unique();
    }

    return secondaryURIs;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getSubURIs',
function(onlySecondaries) {

    /**
     * @method getSubURIs
     * @summary Returns an Array of sub URIs of the receiver.
     * @description Sub URIs are URIs which match the front part of the URI,
     *     but could have any trailing portion. So 'urn:tibet:fooBar' is
     *     considered a 'sub URI' of 'urn:tibet:foo'.
     *     Note that subURIs could also consist of a URI pointing to a
     *     secondary resource of the main URI. In this case, 'urn:tibet:foo#baz'
     *     is considered a secondary URI of the 'urn:tibet:foo' but
     *     'urn:tibet:fooBar' is not.
     * @param {Boolean} [onlySecondaries=false] Whether or not to only include
     *     secondary resources (i.e. those with a hash)
     * @returns {TP.uri.URI[]} An Array of TP.uri.URI objects corresponding to
     *     the 'sub URI's of the receiver.
     */

    var loc,
        matchLoc,

        registeredURIs,
        matcher,

        subURIKeys;

    loc = this.getLocation();

    if (this.hasFragment()) {

        //  Construct a RegExp looking for our location followed our full
        //  location, including an XPointer (with the trailing ')' sliced off so
        //  that we match any 'more specific' XPointer paths - thereby giving us
        //  our 'subURIs').
        matchLoc = loc;
        if (matchLoc.charAt(matchLoc.getSize() - 1) === ')') {
            matchLoc = matchLoc.slice(0, -1);
        }
        matchLoc = TP.regExpEscape(matchLoc);

        matcher = TP.rc('^' + matchLoc);
    } else {
        if (onlySecondaries) {
            //  Construct a RegExp starting by looking for our location
            //  followed by a hash.
            matcher = TP.rc('^' + loc + '#');
        } else {
            //  Construct a RegExp starting by looking for our location
            //  followed by anything.
            matcher = TP.rc('^' + loc + '.*');
        }
    }

    //  Get all of the registered URIs
    registeredURIs = this.getType().get('instances');

    //  Select the keys of the URIs that match our location plus a hash out of
    //  all of the registered URIs keys. Note here how we compare to our own
    //  location so that we don't return ourself in the list of subURIs (the
    //  generated RegExp will match ourself because of its open-endedness)
    subURIKeys = registeredURIs.getKeys().select(
                        function(uriLocation) {
                            /* eslint-disable no-extra-parens */
                            return (matcher.test(uriLocation) &&
                                    uriLocation !== loc);
                            /* eslint-enable no-extra-parens */
                        });

    //  Iterate over the subURI keys and get the actual URI instance for them.
    return subURIKeys.collect(
                function(aKey) {
                    return registeredURIs.at(aKey);
                });
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getURI',
function() {

    /**
     * @method getURI
     * @summary Returns a URI which can be used to acquire the receiver.
     *     TP.uri.URI differs slightly in that it returns itself.
     * @returns {TP.uri.URI} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getSuperURIWithResourceType',
function(aType) {

    /**
     * @method getSuperURIWithResourceType
     * @summary Returns a URI whose resource type matches the supplied type. If
     *     one cannot be found, this method will return the receiver.
     * @param {TP.lang.RootObject|String} aType A Type object, or type name.
     * @returns {TP.uri.URI} The URI whose resource type matches the supplied
     * type. This could be the receiver.
     */

    var pathType,

        primaryLoc,

        resultURI,

        pathParts,
        len,
        i,

        pathPart,
        newPath,

        newURI,
        newResource;

    //  If there is no path type, then we can't proceed - this may be a URI
    //  without a fragment or a fragment that isn't a path.
    pathType = this.getFragmentAccessPathType();
    if (pathType === TP.NOT_FOUND) {
        return this;
    }

    //  Grab our primary location - we'll use this to join with the path as we
    //  walk it back, trying to find a resource whose type is the supplied type.
    primaryLoc = this.getPrimaryLocation();

    /* eslint-disable consistent-this */
    resultURI = this;
    /* eslint-enable consistent-this */

    switch (pathType) {
        case TP.JSON_PATH_TYPE:

            //  Grab the path parts from the fragment's access path
            pathParts = this.getFragmentAccessPath().getPathParts();
            len = pathParts.getSize();

            for (i = len - 1; i >= 0; i--) {
                pathPart = pathParts.at(i);

                //  Slice from the start of the path to the chunk just before
                //  the one we're currently processing.
                newPath = pathParts.slice(0, i);

                //  If it ends with a *numeric* path part (not another kind of
                //  predicate), then slice that off.
                if (TP.regex.ENDS_WITH_NUMERIC_PATH.test(pathPart)) {
                    newPath.push(
                        pathPart.slice(0, pathPart.lastIndexOf('[')));
                } else {
                    newPath.push(pathPart);
                }

                //  Compute a new URI based on the new path, which should be
                //  'one step above' the fragment piece that we tested
                //  previously.
                newURI =
                    TP.uc(primaryLoc + '#jpath(' + newPath.join('.') + ')');

                //  Grab the resource (synchronously and not collapsing) and see
                //  if its type matches our supplied type.
                newResource = newURI.getResource(
                        TP.hc('async', false, 'shouldCollapse', false)).
                                                            get('result');
                if (TP.isKindOf(newResource, aType)) {
                    resultURI = newURI;
                    break;
                }
            }

            break;
        default:
            break;
    }

    return resultURI;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getValue',
function() {

    /**
     * @method getValue
     * @summary Returns the value of the URI, essentially the 'resource'.
     * @returns {Object} The value of the receiver's resource.
     */

    return this.$get('resource');
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getVirtualLocation',
function() {

    /**
     * @method getVirtualLocation
     * @summary Returns the virtual location of the URI. This will return a
     *     String with a format matching a 'TIBET virtual URI'.
     * @returns {String} The receiver's virtual location.
     */

    var loc;

    if (TP.notEmpty(loc = this.getLocation())) {
        loc = this.getLocation();
        return TP.uriInTIBETFormat(loc);
    }

    return '';
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('getWebPath',
function() {

    /**
     * @method getWebPath
     * @summary Returns the web-formatted absolute path to the URI's source.
     * @description Note that no rewriting is performed in the production of
     *     this value. The URI is simply converted to its equivalent web format
     *     (forward slashes rather than backslash etc.)
     * @returns {String} The receiver's uri value as a 'web formatted URI'.
     */

    return TP.uriInWebFormat(this.getLocation());
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineHandler('Change',
function(aSignal) {

    /**
     * @method handleChange
     * @summary Handles changes to the value of the receiver's resource.
     * @description URIs listen for changes to their resource's value and this
     *     method is invoked when it changes. The supplied signal could have a
     *     TP.CHANGE_PATHS property in its payload, which is an Array of path
     *     Strings that referenced the resource at some point. If this property
     *     is present, those paths are compared against any fragments of
     *     'secondary URIs' of the receiver and, if a match is made, that
     *     secondary URI is added to a list of changed URIs kept under the
     *     TP.CHANGE_URIS property in the payload.
     *     Whether or not the signal has a TP.CHANGE_PATHS property, this URI
     *     will signal Change from itself.
     * @param {TP.sig.Change} aSignal The signal indicating a change has
     *     happened in the resource.
     * @returns {TP.uri.URI} The receiver.
     */

    var resource,

        secondaryURIs,

        path,

        changedURIs,

        i,

        fragText,

        primaryAspect;

    //  NB: We assume 'async' of false here
    resource = this.getResource().get('result');

    //  If TP.CHANGE_PATHS were supplied in the signal, filter them against any
    //  'secondary URI's of the receiver and add those sub URIs to the payload
    //  of the signal.

    //  Secondary URIs are URIs that have the same primary resource as us, but
    //  also have a fragment, indicating that they also have a secondary
    //  resource pointed to by the fragment.
    secondaryURIs = this.getSecondaryURIs();

    if (TP.notEmpty(aSignal.at(TP.CHANGE_PATHS))) {

        if (TP.notEmpty(secondaryURIs)) {

            path = aSignal.at('aspect');

            changedURIs = TP.ac();

            for (i = 0; i < secondaryURIs.getSize(); i++) {

                fragText = secondaryURIs.at(i).getFragmentExpr();

                //  If the fragment without the 'pointer indicator' matches the
                //  path, then push the secondary URI onto our list of changed
                //  URIs.
                if (fragText === path) {
                    changedURIs.push(secondaryURIs.at(i));
                }
            }

            //  Add the list of changed URIs to the signal.
            aSignal.atPut(TP.CHANGE_URIS, changedURIs);
        }

        //  If we have URIs that match the paths that changed, then iterate over
        //  them and send a change signal for each one.
        if (TP.notEmpty(changedURIs)) {
            changedURIs.forEach(
                    function(aURI) {
                        aURI.signal(aSignal.getSignalName(),
                                    aSignal.getPayload(),
                                    TP.INHERITANCE_FIRING,
                                    aSignal.getType());
                    });
        }

        //  Now we signal from ourself with the whole payload, which now
        //  includes the list of changed URIs.
        this.signal(aSignal.getSignalName(),
                    aSignal.getPayload(),
                    TP.INHERITANCE_FIRING,
                    aSignal.getType());

    } else {

        //  If we didn't have any paths, then just signal from our secondary
        //  URIs (if we have any) and ourself.

        if (TP.notEmpty(secondaryURIs)) {

            //  Note that we change the 'aspect' here to 'value' (after
            //  capturing the original aspect used by the primary URI) -
            //  because the 'entire value' of the subURI itself has changed.
            //  We also include a 'path' for convenience, so that observers
            //  can use that against the primary URI to obtain this URI's
            //  value, if they wish.
            primaryAspect = aSignal.at('aspect');
            aSignal.atPut('aspect', 'value');

            aSignal.atPut('target', resource);

            for (i = 0; i < secondaryURIs.getSize(); i++) {

                path = secondaryURIs.at(i).getFragmentExpr();

                //  If the path is just a JS identifier, then this is probably a
                //  'tibet(...)' pointer. If that does not match the primary
                //  aspect, then we don't send the signal. This avoids
                //  oversignaling.
                if (TP.regex.JS_IDENTIFIER.test(path) &&
                        path !== primaryAspect) {
                    continue;
                }

                aSignal.atPut('path', path);

                secondaryURIs.at(i).signal(
                        aSignal.getSignalName(),
                        aSignal.getPayload(),
                        TP.INHERITANCE_FIRING,
                        aSignal.getType());
            }

            //  Put the signal back to what it was before we mucked with it
            //  above.
            aSignal.atPut('aspect', primaryAspect);
            aSignal.removeKey('path');
            aSignal.removeKey('target');
        }

        this.signal(aSignal.getSignalName(),
                    aSignal.getPayload(),
                    TP.INHERITANCE_FIRING,
                    aSignal.getType());
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('hasFragment',
function() {

    /**
     * @method hasFragment
     * @summary Returns true if the path contains a fragment reference. This is
     *     typically associated with anchors, barenames, or XPointers.
     * @returns {Boolean} Whether or not the receiver contains a fragment
     *     reference.
     */

    return TP.notEmpty(this.getFragment());
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('$flag',
function(aProperty, aFlag) {

    /**
     * @method $flag
     * @summary Sets a specific property value to a boolean based on aFlag.
     * @param {String} aProperty The name of the boolean property being tested
     *     and/or manipulated.
     * @param {Boolean} [aFlag] The new value to optionally set.
     * @exception {TP.sig.InvalidParameter} When aProperty isn't a String.
     * @returns {Boolean|undefined} The current flag state.
     */

    if (!TP.isString(aProperty)) {
        this.raise('TP.sig.InvalidParameter');
        return;
    }

    if (TP.isBoolean(aFlag)) {
        //  NOTE we never signal change for a flag update.
        this.$set('$' + aProperty, aFlag, false);
    }

    return this.$get('$' + aProperty);
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('isDirty',
function(aFlag, shouldSignal) {

    /**
     * @method isDirty
     * @summary Returns true if the receiver's content has changed since it was
     *     last loaded from its source URI or content data without being saved.
     * @param {Boolean} [aFlag] The new value to optionally set.
     * @param {Boolean} [shouldSignal=false] Should changes to the value be
     *     signaled?
     * @returns {Boolean} Whether or not the content of the receiver is 'dirty'.
     */

    var wasDirty;

    if (TP.isValid(aFlag) && shouldSignal) {
        wasDirty = this.$flag('dirty');
        this.$flag('dirty', aFlag);

        if (wasDirty !== aFlag) {
            TP.$changed.call(
                        this,
                        'dirty',
                        TP.UPDATE,
                        TP.hc(TP.OLDVAL, wasDirty, TP.NEWVAL, aFlag));
        }

        return this.$flag('dirty');
    } else {
        return this.$flag('dirty', aFlag);
    }
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('isExpired',
function(aFlag) {

    /**
     * @method isExpired
     * @summary Returns true if the receiver's content has been expired.
     * @param {Boolean} [aFlag] The new value to optionally set.
     * @returns {Boolean} Whether or not the content of the receiver is expired.
     */

    return this.$flag('expired', aFlag);
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('isHTTPBased',
function() {

    /**
     * @method isHTTPBased
     * @summary Returns true if the receiver's absolute path is HTTP based.
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

TP.uri.URI.Inst.defineMethod('isLoaded',
function(aFlag) {

    /**
     * @method isLoaded
     * @summary Returns true if the receiver's content has been loaded either
     *     manually via a setResource or init, or by loading the receiver's
     *     URI location.
     * @param {Boolean} [aFlag] The new value to optionally set.
     * @returns {Boolean} Whether or not the content of the receiver is loaded.
     */

    return this.$flag('loaded', aFlag);
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('isPrimaryURI',
function() {

    /**
     * @method isPrimaryURI
     * @summary Returns true if the receiver is a primary URI, meaning it has
     *     no fragment portion and can store data.
     * @returns {Boolean} True if the receiver is a primary URI.
     */

    return !this.hasFragment();
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('$normalizeRequestedResource',
function(aResource) {

    /**
     * @method $normalizeRequestedResource
     * @summary 'Normalizes' the resource object. This means that certain
     *     common constructs that this particular type of TP.uri.URI needs will
     *     be computed and instrumented onto the resource via this method.
     * @param {Object} aResource The resource object to normalize.
     * @returns {Object} The normalized resource.
     */

    //  At this level, there are no constructs that the receiver needs to put
    //  onto the supplied resource, so we just return it.
    return aResource;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('refreshFromRemoteResource',
function() {

    /**
     * @method refreshFromRemoteResource
     * @summary Refreshes the receiver's content from the remote resource it
     *     represents. Upon refreshing the content this method will invoke
     *     processRefreshedContent to perform any post-processing of the
     *     content appropriate for the target URI. The default implementation
     *     must by overridden by subtypes.
     * @returns {Promise} A promise which resolves on completion.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('register',
function() {

    /**
     * @method register
     * @summary Registers the instance under a common key.
     */

    TP.uri.URI.registerInstance(this, TP.uriExpandPath(this.getLocation()));

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('$requestContent',
function(aRequest, contentFName, successFName, failureFName, aResource) {

    /**
     * @method $requestContent
     * @summary A generic sync/async content request processing routine used by
     *     the various get/set calls dealing with content, resource, or primary
     *     resource access.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @param {String} contentFName A content access function name such as
     *     $getPrimaryResource or getResource.
     * @param {String} successFName A function name for a URI method taking a
     *     'result' object as a single parameter.
     * @param {String} failureFName A function name for a URI method taking a
     *     failure code and failure string as parameters.
     * @param {Object} [aResource] Optional data used for set* methods.
     * @exception {TP.sig.InvalidParameter} When the receiver can't invoke the
     *     method named by contentFName.
     * @returns {TP.sig.Response|undefined} A TP.sig.Response created with the
     *     requested content set as its result.
     */

    var fragment,

        async,

        subrequest,
        thisref;

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

    //  we'll need this to help decide which branch to take below.
    async = this.rewriteRequestMode(aRequest);

    //  If we're going to have to request the data then the key thing we
    //  want to avoid is having an incoming request complete() before the
    //  entire process is finished. That means ensuring we have a clean
    //  subrequest instance we can locally modify.
    subrequest = this.constructSubrequest(aRequest);

    //  hold a this reference the functions below can close around.
    thisref = this;

    subrequest.defineMethod(
        'completeJob',
        function(aResult) {

            var result;

            result = aResult;
            if (TP.canInvoke(thisref, successFName)) {
                //  Note that two of these parameters come from the outer
                //  function and only aResult is provided by the inner one.
                result = thisref[successFName](aRequest,
                                                aResult,
                                                aResource);
            }

            //  rewrite the request result object so we hold on to the
            //  processed content rather than the inbound content.
            subrequest.set('result', result);

            subrequest.$wrapupJob('Succeeded', TP.SUCCEEDED, result);

            //  if there was an original request complete it, which will
            //  take care of putting the result in place for async calls.
            if (TP.canInvoke(aRequest, 'complete')) {
                aRequest.complete(result);
            }
        });

    subrequest.defineMethod(
        'failJob',
        function(aFaultString, aFaultCode, aFaultInfo) {

            var info,
                subrequests;

            info = TP.hc(aFaultInfo);
            if (TP.isValid(subrequests = info.at('subrequests'))) {
                subrequests.push(subrequest);
            } else {
                subrequests = TP.ac(subrequest);
                info.atPut('subrequests', subrequests);
            }

            if (TP.canInvoke(thisref, failureFName)) {
                thisref[failureFName](aFaultString, aFaultCode, info);
            }

            subrequest.$wrapupJob('Failed', TP.FAILED);

            //  if there was an original request fail it too.
            if (TP.canInvoke(aRequest, 'fail')) {
                aRequest.fail(aFaultString, aFaultCode, info);
            }
        });

    //  Remember this can run async, so any result here can be either data
    //  or a TP.sig.Response when async. We can safely ignore it.
    this[contentFName](subrequest, true);

    //  If async we can only return the result/response being used to
    //  actually process the async activity.
    //  NOTE that we need to re-read the async state in case our underlying
    //  resource is async-only and potentially rewrote the value.
    async = this.rewriteRequestMode(subrequest);
    if (async) {
        aRequest.andJoinChild(subrequest);

        //  hand back the response object for the "outer" request, which
        //  will be either the originating request or our internally
        //  constructed one (which was also used as the subrequest)
        if (TP.canInvoke(aRequest, 'getResponse')) {
            return aRequest.getResponse();
        } else {
            return subrequest.getResponse();
        }
    }

    //  If the routine was invoked synchronously then the data will have
    //  been placed in the subrequest.
    return subrequest.getResponse();
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('remap',
function(aRequest) {

    /**
     * @method remap
     * @summary Directs the operation implied by any data in aRequest to a
     *     viable handler for the URI. This typically results in the request
     *     being passed to a TP.uri.URIHandler type/subtype. Note that the URI
     *     is expected to have been rewritten as needed prior to this call so
     *     that the handler is appropriate for the concrete URI being accessed.
     * @param {TP.sig.Request} aRequest The request whose values should inform
     *     the routing assignment.
     * @returns {TP.meta.uri.URIHandler} A TP.uri.URIHandler subtype type object
     *     that can handle the request for the supplied URI.
     */

    return this.getType().remap(this, aRequest);
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('rewrite',
function(aRequest) {

    /**
     * @method rewrite
     * @summary Rewrites the receiver to its appropriate 'concrete' URI value
     *     based on current runtime values and rewriting rules.
     * @param {TP.sig.Request} [aRequest] An optional request whose values may
     *     inform the rewrite.
     * @returns {TP.uri.URI} The rewritten URI in TP.uri.URI form.
     */

    return this.getType().rewrite(this, aRequest);
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('$sendDependentURINotifications',
function(oldResource, newResource, pathInfos, primaryOnly) {

    /**
     * @method $sendDependentURINotifications
     * @summary Causes any 'dependent URIs' (either this URI's primary URI or
     *     any URIs containing in the optional 'path info records' that are
     *     supplied in 'pathInfos') to send a notification that they
     *     changed.
     *     defining control parameters.
     * @param {Object} oldResource The old value of the resource that this URI
     *     had.
     * @param {Object} newResource The new value of the resource that this URI
     *     was set to.
     * @param {String[]} [pathInfos] Optional data detailing which paths
     *     changed. If this data isn't supplied, then a single notification is
     *     sent from this URI's primary URI.
     * @param {Boolean} [primaryOnly=false] Should we only signal the primary?
     * @returns {TP.uri.URI} The receiver.
     */

    var primaryURI,

        fragExpr,

        description,

        primaryLoc,

        uriRegistry,
        registryKeys,

        leni,
        i,

        info,

        keyMatcher,

        lenj,
        j,

        matchedURI;

    primaryURI = this.getPrimaryURI();

    if (TP.notValid(pathInfos)) {

        fragExpr = this.getFragmentExpr();

        //  Now that we're done signaling the sub URIs, it's time to signal a
        //  TP.sig.ValueChange from ourself (our 'whole value' is changing).
        description = TP.hc(
            'action', TP.UPDATE,
            'aspect', TP.isEmpty(fragExpr) ? 'value' : fragExpr,
            'facet', 'value',

            'path', fragExpr,

            'target', newResource,
            'oldTarget', oldResource
            );

        primaryURI.signal('TP.sig.ValueChange', description);

        return this;
    }

    primaryLoc = primaryURI.getLocation();

    uriRegistry = TP.uri.URI.get('instances');
    registryKeys = uriRegistry.getKeys();

    leni = pathInfos.getSize();
    for (i = 0; i < leni; i++) {

        info = pathInfos.at(i);

        description = TP.copy(info.at('description'));

        //  Grab the fragment from the 'aspect' of the change record and use it
        //  to try to match a URI's fragment that would indicate that a change
        //  notification should be sent from it.
        fragExpr = description.at('aspect');

        //  Compute a RegExp that looks for that fragment as part of a URI.
        keyMatcher = TP.rc(primaryLoc + '#\\w+\\(' + fragExpr + '\\)');

        //  Iterate over all of the registered URIs, looking for ones that have
        //  a fragment that matches the computed RegExp.
        lenj = registryKeys.getSize();
        for (j = 0; j < lenj; j++) {

            if (keyMatcher.test(registryKeys.at(j))) {
                matchedURI = uriRegistry.at(registryKeys.at(j));
                break;
            }
        }

        //  If we found one, use it to signal.
        if (TP.notTrue(primaryOnly) && TP.isURI(matchedURI)) {
            description.atPut('aspect', 'value');
            description.atPut('path', fragExpr);

            description.atPut('oldTarget', oldResource);

            matchedURI.signal(info.at('sigName'), description);
        }

        //  In any case, signal from the primary URI, using that fragment as the
        //  'aspect' that changed.
        description.atPut('aspect', fragExpr);
        primaryURI.signal(info.at('sigName'), description);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('$sendSecondaryURINotifications',
function(oldResource, newResource) {

    /**
     * @method $sendSecondaryURINotifications
     * @summary Causes any 'secondary URIs' (URIs that point to the same primary
     *     resource as the receiver, but also have a secondary resource pointed
     *     to by a fragment) to send a notification that they changed.
     *     defining control parameters.
     * @param {Object} oldResource The old value of the resource that this URI
     *     had.
     * @param {Object} newResource The new value of the resource that this URI
     *     was set to.
     * @returns {TP.uri.URI} The receiver.
     */

    var secondaryURIs,

        description,

        i,
        fragText,

        facetedAspects,
        primaryLoc;

    secondaryURIs = this.getSecondaryURIs();

    if (TP.notEmpty(secondaryURIs)) {

        //  The 'action' here is TP.DELETE, since the entire resource got
        //  changed. This very well may mean structural changes occurred and
        //  the resource that the subURI pointed to doesn't even exist
        //  anymore.

        //  The 'aspect' here is 'value' - because the 'entire value' of the
        //  subURI itself has changed. We also include a 'path' for
        //  convenience, so that observers can use that against the primary
        //  URI to obtain this URI's value, if they wish.

        //  The 'target' here is computed by running the fragment against
        //  the resource.
        description = TP.hc(
                'action', TP.DELETE,
                'aspect', 'value',
                'facet', 'value',
                'target', newResource,

                //  NB: We supply the old resource and the fragment text
                //  here for ease of obtaining values.
                'oldTarget', oldResource
                );

        //  If we have sub URIs, then observers of them will be expecting to
        //  get a TP.sig.StructureDelete with 'value' as the aspect that
        //  changed (we swapped out the entire resource, so the values of
        //  those will have definitely changed).
        for (i = 0; i < secondaryURIs.getSize(); i++) {

            fragText = secondaryURIs.at(i).getFragmentExpr();

            description.atPut('path', fragText);

            secondaryURIs.at(i).signal('TP.sig.StructureDelete',
                                        description);
        }
    }

    //  Now that we're done signaling the sub URIs, it's time to signal a
    //  TP.sig.ValueChange from ourself (our 'whole value' is changing).
    description = TP.hc(
        'action', TP.UPDATE,
        'aspect', 'value',
        'facet', 'value',

        'path', this.getFragmentExpr(),

        //  NB: We supply these values here for consistency with the 'no
        //  secondaryURIs logic' below.
        'target', newResource,
        'oldTarget', oldResource,
        TP.OLDVAL, oldResource,
        TP.NEWVAL, newResource
    );

    this.signal('TP.sig.ValueChange', description);

    //  If we can invoke 'getFacetedAspectNames' on the new resource, then we
    //  want to query for and check those facets.
    if (TP.canInvoke(newResource, 'getFacetedAspectNames')) {

        //  Grab the faceted aspect names.
        facetedAspects = newResource.getFacetedAspectNames();

        //  If there were faceted aspects, then create '#tibet' URIs with
        //  aspects as the fragments for each one. This will force the system to
        //  signal from those URIs as well.
        if (TP.notEmpty(facetedAspects)) {

            primaryLoc = this.getPrimaryURI().getLocation();
            facetedAspects.forEach(
                function(anAspect) {
                    var aspectLoc;

                    //  The 'aspect location' is the primary location with a
                    //  '#tibet' fragment and the aspect name.
                    aspectLoc = primaryLoc + '#tibet(' + anAspect + ')';

                    //  Create the URI. Note that we don't worry about the
                    //  return value here as the URI machinery will cache the
                    //  instance.
                    TP.uc(aspectLoc);
                });

            //  Check the facets.
            newResource.checkFacets(facetedAspects);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('setContent',
function(contentData, aRequest) {

    /**
     * @method setContent
     * @summary Sets the receiver's content to the object provided.
     * @param {Object} contentData A new content object.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request containing
     *     optional parameters.
     * @returns {TP.sig.Response} A TP.sig.Response created with the requested
     *     content set as its result.
     */

    var request;

    request = this.constructRequest(aRequest);

    //  Track initial state so we can properly process flags/results.
    request.atPutIfAbsent('operation', 'set');
    request.atPutIfAbsent('loaded', this.isLoaded());

    //  Make sure we don't try to load a URI just because we're setting content.
    //  A URI that's not loaded (and may not even exist) shouldn't be invoking
    //  load just to access a possibly undefined resource.
    request.atPutIfAbsent('refresh', false);

    return this.$requestContent(request,
                                'getResource',
                                '$setResultContent',
                                null,
                                contentData);
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('$setFacet',
function(aspectName, facetName, facetValue, shouldSignal) {

    /**
     * @method $setFacet
     * @summary Sets the value of the named facet of the named aspect to the
     *     value provided. This method should be called from any 'custom facet
     *     setter' in order to a) set the property and b) signal a change, if
     *     configured.
     * @description For this type and its subtypes, this method only operates on
     *     facets named 'value'.
     * @param {String} aspectName The name of the aspect to set.
     * @param {String} facetName The name of the facet to set.
     * @param {Boolean} facetValue The value to set the facet to.
     * @param {Boolean} [shouldSignal=this.getShouldSignalChange()] If false no
     *     signaling occurs. Note that we *ignore* this value for TP.uri.URIs
     *     and always let the resource decide whether it will broadcast change
     *     or not.
     * @returns {Object} The receiver.
     */

    var resourceContent;

    //  We have no notion of any other facet for URIs.
    if (facetName !== 'value') {
        return this;
    }

    //  NOTE: We ignore the shouldSignal flag here on purpose - the resource
    //  will decide if it wants to signal change.

    //  If this isn't a primary URI, then we won't use any supplied aspect, but
    //  we'll use the fragment text instead.
    if (!this.isPrimaryURI()) {

        //  NB: We assume 'async' of false here
        this.getPrimaryURI().getResource().get('result').set(
                    this.getFragmentExpr(), facetValue);
    } else {

        //  Make sure we have a real content object - if not, stub it in.
        //  NB: We assume 'async' of false here
        if (TP.notValid(resourceContent = this.getResource().get('result'))) {
            //  Stub out new content.
            this.stubResourceContent();
            //  Get that new content.
            resourceContent = this.getResource().get('result');
        }
        resourceContent.set(aspectName, facetValue);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('setLastUpdateDate',
function(aDate) {

    /**
     * @method setLastUpdateDate
     * @summary Sets the update time for the receiver. This is the last time
     *     the receiver's data was loaded from its source.
     * @param {Date} [aDate] The date to set the 'last updated' property of the
     *     receiver to. Defaults to the receiver's header Date.
     * @returns {String} The string value set for the update time.
     */

    var theDate,
        dict;

    //  note the default here to the value of the Date header which is
    //  normally served via HTTP and which is configured by TIBET for files
    theDate = aDate;
    if (TP.notValid(theDate)) {
        theDate = this.getHeader('Date');
    }

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

TP.uri.URI.Inst.defineMethod('$setPrimaryResource',
function(aResource, aRequest, shouldSignal) {

    /**
     * @method $setPrimaryResource
     * @summary Sets the receiver's resource object, the object TIBET will
     *     treat as the primary resource for any subsequent processing.
     * @param {Object} aResource The resource object to assign.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request containing
     *     optional parameters.
     * @param {Boolean} [shouldSignal=true] Should changes to the value be
     *     signaled? By default true, but occasionally set to false when a
     *     series of changes is being performed etc.
     * @returns {TP.uri.URI|TP.sig.Response} The receiver or a TP.sig.Response
     *     when the resource must be acquired in an async fashion prior to
     *     setting any fragment value.
     */

    var url,
        request,

        dirty,
        loaded,

        oldResource,
        newResource,

        shouldSignalChange;

    //  If the receiver isn't a "primary URI" then it really shouldn't be
    //  holding data, it should be pushing it to the primary...
    if ((url = this.getPrimaryURI()) !== this) {
        return url.$setPrimaryResource(aResource, aRequest);
    }

    //  ---
    //  URI <-> data correlation
    //  ---

    request = this.constructRequest(aRequest);

    loaded = request.at('loaded');

    oldResource = this.$get('resource');

    //  Wrap and augment inbound resource if appropriate (adds XMLBase, etc).
    newResource = this.$normalizeRequestedResource(aResource);

    if (request.hasParameter('isDirty')) {
        dirty = request.at('isDirty');
    } else {
        //  If we're already loaded we need to know if we're changing the value.
        if (this.resourcesAreAlike(oldResource, newResource)) {
            dirty = false;
        } else {
            if (TP.sys.hasStarted()) {
                /*
                console.log(this.getLocation() +
                    ' dirty:\n\n' +
                    TP.getStackInfo().join('\n') +
                    TP.dump(oldResource) + '\n\n' + TP.dump(newResource));
                */
            }

            //  NOTE we don't consider setting a value to the processed version
            //  of the same value as an operation that dirties the URI.
            if (request.at('processedResult') === true) {
                dirty = false;
            } else {
                dirty = true;
            }
        }
    }

    //  If we already have a resource, make sure to 'ignore' it for changes.
    if (TP.isValid(oldResource) && TP.isMutable(oldResource)) {
        this.ignore(oldResource, 'Change');
    }

    //  If the new resource is valid and the request parameters don't contain a
    //  false value for the flag for observing our resource, then observe it for
    //  all *Change signals.
    if (TP.notFalse(request.at('observeResource')) &&
        TP.isMutable(newResource)) {
        //  Observe the new resource object for changes.
        this.observe(newResource, 'Change');
    }

    //  Use request info or current loaded state (CHECKED BEFORE WE UPDATE IT)
    //  to determine if we should signal change.
    if (TP.isValid(shouldSignal)) {
        shouldSignalChange = shouldSignal;
    } else if (request.hasParameter('signalChange')) {
        shouldSignalChange = request.at('signalChange');
    } else {
        shouldSignalChange = dirty;
    }

    //  What we do with value and flags depends on the originating operation.
    switch (request.at('operation')) {
        case 'load':
            //  fallthrough
        case 'get':
            this.$set('resource', newResource, false);
            this.isLoaded(true);
            this.isDirty(false, true);
            break;
        case 'set':
            this.$set('resource', newResource, false);
            this.isLoaded(true);    //  arguable semantics but important for
                                    //  preloaded URIs
            if (loaded) {
                this.isDirty(dirty, true);
            } else {
                this.isDirty(false, true);
            }
            break;
        case 'save':
            //  NOTE we don't save results for save..., it's usually an empty
            //  response.
            this.isLoaded(true);
            this.isDirty(false, true);

            //  We don't signal since we're only pushing data, not altering it.
            shouldSignalChange = false;
            break;
        case 'delete':
            //  NOTE we don't save results for delete..., it's usually an empty
            //  response.
            this.isLoaded(false);
            this.isDirty(false, true);

            //  We always signal since whatever value was there is now undefined.
            shouldSignalChange = true;
            break;
        default:
            return this.raise('InvalidOperation', request.at('operation'));
    }

    //  clear any expiration computations
    this.expire(false);

    if (shouldSignalChange) {
        if (TP.sys.hasStarted()) {
            // console.log('signaling secondaries via primary for ' + this.getLocation());
        }
        this.$sendSecondaryURINotifications(oldResource, newResource);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('setResource',
function(aResource, aRequest) {

    /**
     * @method setResource
     * @summary Sets the receiver's resource object, the object TIBET will
     *     treat as the resource for any subsequent processing.
     * @param {Object} aResource The resource object to assign.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request containing
     *     optional parameters.
     * @returns {TP.sig.Response} A TP.sig.Response created with the newly set
     *     content set as its result.
     */

    var request;

    request = this.constructRequest(aRequest);

    //  Track initial state so we can properly process flags/results.
    request.atPutIfAbsent('operation', 'set');
    request.atPutIfAbsent('loaded', this.isLoaded());

    //  Make sure we don't try to load a URI just because we're setting data.
    //  A URI that's not loaded (and may not even exist) shouldn't be invoking
    //  load just to access a possibly undefined resource.
    request.atPutIfAbsent('refresh', false);

    //  When we're primary or we don't have a fragment we can keep it
    //  simple and just defer to $setPrimaryResource.
    if (this.isPrimaryURI() ||
        !this.hasFragment() ||
        this.getFragment() === 'document') {
        return this.$setPrimaryResource(aResource, request);
    }

    //  If we have a fragment then we need to do the more complex approach
    //  of getting the primary resource and setting the fragment value with
    //  respect to that object.
    return this.$requestContent(request,
                                '$getPrimaryResource',
                                '$setResultFragment',
                                null,
                                aResource);
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('setResourcePortion',
function(aPath, aValue, aRequest) {

    /**
     * @method setResourcePortion
     * @summary Sets a portion of the resource using the supplied path to 'drill
     *     into' the resource pointed to by the receiver.
     * @param {TP.path.AccessPath|String} aPath The path to use to drill into
     *     the receiver's resource.
     * @param {Object} aValue The value to set the referenced portion of the
     *     resource to.
     * @param {TP.sig.Request} [aRequest] An optional request used to retrieve
     *     the receiver's resource.
     * @exception {TP.sig.InvalidParameter} When the supplied path is not valid.
     * @returns {TP.uri.URI} The receiver.
     */

    var req,
        result,
        path;

    //  Copy the request and make sure it's configured for an 'sync' fetch.
    req = TP.request(aRequest).copy();
    req.atPut('async', false);

    result = this.getResource(req).get('result');

    if (aPath.isAccessPath()) {
        path = TP.copy(aPath);
    } else if (TP.isString(aPath)) {
        path = TP.apc(aPath);
    }

    //  Note here how we set buildout to true by default. This allows us maximum
    //  convenience in setting the resource's portion.
    if (TP.isValid(result)) {
        path.set('buildout', true);
        path.executeSet(result, aValue);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('setResourceToResultOf',
function(aURI, aRequest, shouldCopy) {

    /**
     * @method setResourceToResultOf
     * @summary Sets the receiver's resource object to the result of the
     *     resource pointed to by aURI. If the shouldCopy flag is true, then a
     *     copy of the result is made before setting it as the resource of the
     *     receiver.
     * @param {TP.uri.URI} aURI The URI of the resource object to use as the
     *     resource source.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request containing
     *     optional parameters.
     * @param {Boolean} [shouldCopy=false] Whether or not to make a copy of the
     *     result before using it as the receiver's resource. Note that this
     *     will cause a *deep copy* of the receiver's resource to be made.
     * @returns {TP.sig.Response|null} A TP.sig.Response created with the newly
     *     set content set as its result or null if there was no content in the
     *     result.
     */

    var req,

        result,
        newResult;

    //  Copy the request and make sure it's configured for an 'sync' fetch.
    req = TP.request(aRequest).copy();
    req.atPut('async', false);

    result = aURI.getResource(req).get('result');
    if (TP.isValid(result)) {

        if (TP.isTrue(shouldCopy)) {
            newResult = TP.copy(result, true);
        } else {
            newResult = result;
        }

        this.set('shouldCreateContent', true);

        return this.setResource(newResult, aRequest);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('$setResultContent',
function(aRequest, aResult, aResource) {

    /**
     * @method $setResultContent
     * @summary Invoked as a "success body" function for the setContent call
     *     with the purpose of updating the content of the result object being
     *     provided.
     * @param {TP.sig.Request|TP.core.Hash} [aRequest] An optional object
     *     defining control parameters.
     * @param {Object} aResult The result of a content access call.
     * @param {Object} [aResource] Optional data used for set* methods.
     * @exception {TP.sig.InvalidResource} When the target resource is not
     *     modifiable.
     * @returns {Object} The return value for the content operation using this
     *     as a success body function.
     */

    var result,
        request,
        wasDirty,
        isDirty;

    request = this.constructRequest(aRequest);

    if (TP.isKindOf(aResult, 'TP.sig.Response')) {
        result = aResult.getResult();
    } else {
        result = aResult;
    }

    //  Try to collapse and process using the smartest objects possible.
    result = TP.isCollection(result) ? TP.collapse(result) : result;
    result = TP.isNode(result) ? TP.wrap(result) : result;

    if (TP.canInvoke(result, 'set')) {

        wasDirty = this.isDirty();

        //  Since we observe our resource for Change, we need to ignore handling
        //  Change from it, set the resource and then resume observing it.
        this.ignore(result, 'Change');
        result.set('content', aResource);
        this.observe(result, 'Change');

        isDirty = this.isDirty(true);

        if (this.$get('resource') !== result) {
            this.$set('resource', result);
        }

        //  Then, we broadcast change from ourself as if we were re-broadcasting
        //  a Change notification from our resource.
        this.signal('TP.sig.ValueChange',
                    TP.hc('action', TP.UPDATE,
                            'aspect', 'value',
                            'facet', 'value',
                            'target', result),
                    TP.INHERITANCE_FIRING,
                    TP.sig.ValueChange);

        //  If the result isn't a TP.core.Content, then since we won't have
        //  broadcast a 'dirty' change above when we set the content (due to the
        //  ignore/observe shuffle), we go ahead and send it here if the flag
        //  has changed. If the result is a TP.core.Content, then it will send a
        //  dirty from us when it changes.
        if (!TP.isKindOf(result, TP.core.Content) &&
            isDirty !== wasDirty) {
            TP.$changed.call(
                        this,
                        'dirty',
                        TP.UPDATE,
                        TP.hc(TP.OLDVAL, wasDirty, TP.NEWVAL, isDirty));
        }

        //  We set the content of the object that we're holding as our resource
        //  - no sense to reset the content itself.
        return result;
    } else if (!this.isLoaded()) {
        result = TP.core.Content.construct(aResource, this);
    } else {
        return this.raise('TP.sig.InvalidResource',
                            'Unable to modify target resource.');
    }

    this.$setPrimaryResource(result, request);

    return result;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('$setResultFragment',
function(aRequest, aResult, aResource, shouldSignal) {

    /**
     * @method $setResultFragment
     * @summary Invoked as a "success body" function for the setResource call
     *     with the purpose of setting the secondary resource.
     * @param {TP.sig.Request|TP.core.Hash} [aRequest] An optional object
     *     defining control parameters.
     * @param {Object} aResult The result of a content access call.
     * @param {Object} [aResource] Optional data used for set* methods.
     * @param {Boolean} [shouldSignal=true] Should changes to the value be
     *     signaled? By default true, but occasionally set to false when a
     *     series of changes is being performed etc.
     * @exception {TP.sig.InvalidResource} When the target resource is not
     *     modifiable.
     * @returns {Object} The return value for the content operation using this
     *     as a success body function.
     */

    var fragment,
        result,
        request,
        fragmentAccessor,
        oldResource,
        pathInfo,
        shouldSignalChange;

    request = this.constructRequest(aRequest);

    //  Signal change any time value changes...unless explicitly turned off.
    if (TP.isValid(shouldSignal)) {
        shouldSignalChange = shouldSignal;
    } else if (request.hasParameter('signalChange')) {
        shouldSignalChange = request.at('signalChange');
    } else if (!this.resourcesAreAlike(oldResource, aResource)) {
        shouldSignalChange = true;
    }

    //  aResult here will be the resource for the primary URI. Therefore, if we
    //  are the primary URI, it will be our whole data object. If we are a
    //  'secondary URI' pointing to a fragment, then we try to access the slice
    //  of the overall resource and set it using the optionally provided object
    //  in aResource.

    fragment = this.getFragment();
    if (TP.notEmpty(fragment)) {
        fragment = fragment.indexOf('#') === 0 ? fragment : '#' + fragment;

        //  Try to collapse and wrap to use the smartest objects possible for
        //  the query.
        result = TP.isCollection(aResult) ? TP.collapse(aResult) : aResult;
        result = TP.isNode(result) ? TP.wrap(result) : result;

        if (TP.regex.DOCUMENT_ID.test(fragment) ||
                TP.regex.BARENAME.test(fragment)) {
            fragmentAccessor = fragment;
        } else if (TP.regex.ANY_POINTER.test(fragment)) {
            fragmentAccessor = TP.apc(fragment, TP.hc('shouldCollapse', true));

            //  If we're configured to create content, then flip the fragment
            //  accessor's flag to make structures.
            if (TP.isTrue(this.get('shouldCreateContent'))) {

                fragmentAccessor.set('buildout', true);

                //  If result was not valid, then our primary URI doesn't have
                //  valid object for us to use as a starting point - try to
                //  create one based on our path type.
                if (TP.notValid(result)) {

                    result = this.$constructPrimaryResourceStub(
                                    fragmentAccessor.getPathType());

                    if (TP.isValid(result)) {
                        this.getPrimaryURI().setResource(result);
                    }
                }
            }
        }

        if (TP.canInvoke(result, 'set')) {
            oldResource = result.get(fragmentAccessor);
            result.set(fragmentAccessor, aResource, shouldSignalChange);
        } else {
            this.raise('TP.sig.InvalidResource',
                'Unable to modify target resource.');
        }
    } else {
        this.raise('TP.sig.InvalidFragment');
    }

    if (fragmentAccessor.isAccessPath()) {

        //  Grab the set of 'path info records' that contain data about the
        //  paths that changed when the 'set' was executed above. This will be
        //  used by the notification method to send changed notifications from
        //  other URIs that contain paths (as their fragments) that are
        //  'dependent' on that new data that was set.
        pathInfo = fragmentAccessor.getLastChangedPathsInfo(result);
        if (shouldSignalChange) {

            //  Send notification from the other URIs that are dependent on the
            //  new data.
            this.$sendDependentURINotifications(
                        oldResource, aResource, pathInfo);
        } else {
            //  NOTE the 'true' here signifies 'primary only' so we'll always at
            //  least tell our primary we changed something.
            this.$sendDependentURINotifications(
                oldResource, aResource, pathInfo, true);
        }
    }

    //  If there was already a value then we consider new values to dirty the
    //  resource from a state perspective. If we weren't loaded yet we consider
    //  ourselves to be 'clean' until a subsequent change.
    if (request.at('loaded')) {
        if (!this.resourcesAreAlike(oldResource, aResource)) {
            this.isDirty(true, true);
        }
    } else {
        this.isLoaded(true);
        this.isDirty(false, true);
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('setValue',
function(aValue) {

    /**
     * @method setValue
     * @summary Sets the 'value' of the receiver. This method provides
     *     polymorphic behavior by calling the receiver's 'setContent' method.
     * @param {Object} aValue The value to set the value of the receiver to.
     * @returns {Boolean} Whether or not the value was changed from the value it
     *     had before this method was called.
     */

    this.setContent(aValue);

    return true;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('stubResourceContent',
function() {

    /**
     * @method stubResourceContent
     * @summary 'Stubs' the resource content to have a single instance of
     *     TP.lang.Object with a 'value' slot. This object is also configured to
     *     be a 'good' resource for the URI by turning on its change mechanism.
     * @description This method is used to 'stub in' very basic object that can
     *     store a value in its 'value' slot and will signal a notification
     *     when that value changes. This is necessary in scenarios like data
     *     binding when bindings are triggered into this URI and no resource has
     *     been set.
     * @returns {TP.uri.URI} The receiver.
     */

    var resourceContent;

    //  This only gets done for primary URIs, so if we're not one, we call up to
    //  that (the check below will make sure that if the primary URI has a
    //  resource it won't be replaced).
    if (!this.isPrimaryURI()) {
        return this.getPrimaryURI().stubResourceContent();
    }

    //  If the receiver doesn't have a real resource result, replace it.
    if (TP.notValid(resourceContent = this.getResource().get('result'))) {

        //  Construct a simple TP.lang.Object, define a 'value' slot on it and
        //  give it an initial value of the empty String. Also, configure it be
        //  a good citizen as a resource for URIs by signaling change.
        resourceContent = TP.lang.Object.construct();

        resourceContent.defineAttribute('value');
        resourceContent.set('value', '', false);

        resourceContent.shouldSignalChange(true);

        this.setResource(resourceContent);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('shouldSignalChange',
function(aFlag) {

    /**
     * @method shouldSignalChange
     * @summary Defines whether the receiver should actively signal change
     *     notifications.
     * @description In general URI objects do not signal changes from their own
     *      properties, because they act as 'value holders' for their resources.
     *      They will signal Change when their resources do so, acting as a
     *      'forwarding' mechanism for their resources.
     * @param {Boolean} aFlag true/false signaling status.
     * @returns {Boolean} The current status.
     */

    //  Yes, TP.uri.URIs are hardcoded to return false here.
    return false;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('resourcesAreAlike',
function(resourceA, resourceB) {

    /**
     * @method resourcesAreAlike
     * @summary Returns whether or not the resources are alike in some
     *     receiver-defined way (e.g. either equality or identity) such that
     *     setting the receiver to the new resource would consider it to be
     *     not 'dirty'.
     * @param {Object} resourceA The first resource object to use for
     *     comparison.
     * @param {Object} resourceB The second resource object to use for
     *     comparison.
     * @returns {Boolean} Whether or not the resources are alike in some
     *     receiver-defined way.
     */

    return TP.equal(resourceA, resourceB);
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('transform',
function(aDataSource, aRequest) {

    /**
     * @method transform
     * @summary Uses the receiver's URI content as a template and performs a
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
     * @param {TP.core.Hash|TP.sig.Request} aRequest A parameter container
     *     responding to at(). For string transformations a key of 'repeat' with
     *     a value of true will cause iteration to occur (if aDataSource is an
     *     'ordered collection' this flag needs to be set to 'true' in order to
     *     have 'automatic' iteration occur). Additional keys of '$STARTINDEX'
     *     and '$REPEATCOUNT' determine the range of the iteration.
     * @returns {TP.sig.Response} A TP.sig.Response created with the transformed
     *     content set as its result.
     */

    var subrequest,
        async;

    //  If we're going to have to request the data then the key thing we
    //  want to avoid is having an incoming request complete() before the
    //  entire process is finished. That means ensuring we have a clean
    //  subrequest instance we can locally modify.
    subrequest = this.constructSubrequest(aRequest);
    subrequest.atPut('async', false);

    subrequest.defineMethod(
            'completeJob',
            function(aResult) {

                var resource,
                    result;

                if (TP.isDefined(aResult)) {
                    //  In case aResult returned an Array (very likely if it
                    //  ran some sort of 'getter path'), we collapse it here
                    //  - can't transform from an Array of TP.dom.Nodes.
                    result = TP.collapse(aResult);
                    resource = TP.wrap(result);
                }

                if (TP.canInvoke(resource, 'transform')) {
                    result = resource.transform(aDataSource, aRequest);

                    //  rewrite the request result object so we hold on to
                    //  the processed content rather than the inbound
                    //  content.
                    subrequest.set('result', result);
                }

                subrequest.$wrapupJob('Succeeded', TP.SUCCEEDED, result);

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

                subrequest.getResponse(result);
            });

    subrequest.defineMethod(
            'failJob',
            function(aFaultString, aFaultCode, aFaultInfo) {

                var info,
                    subrequests;

                info = TP.hc(aFaultInfo);
                if (TP.isValid(subrequests = info.at('subrequests'))) {
                    subrequests.push(subrequest);
                } else {
                    subrequests = TP.ac(subrequest);
                    info.atPut('subrequests', subrequests);
                }

                subrequest.$wrapupJob('Failed', TP.FAILED);

                if (TP.canInvoke(aRequest, 'fail')) {
                    aRequest.fail(aFaultString, aFaultCode, info);
                }
            });

    //  trigger the invocation and rely on the handlers for the rest.
    this.getResource(subrequest, TP.hc('resultType', TP.WRAP));

    //  If async we can only return the result/response being used to
    //  actually process the async activity.
    //  NOTE that we need to re-read the async state in case our underlying
    //  resource is async-only and potentially rewrote the value.
    async = this.rewriteRequestMode(subrequest);
    if (async) {
        aRequest.andJoinChild(subrequest);

        //  hand back the response object for the "outer" request, which
        //  will be either the originating request or our internally
        //  constructed one (which was also used as the subrequest)
        if (TP.canInvoke(aRequest, 'getResponse')) {
            return aRequest.getResponse();
        } else {
            return subrequest.getResponse();
        }
    }

    //  If the routine was invoked synchronously then the data will have
    //  been placed in the subrequest.
    return subrequest.getResponse();
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('unregister',
function() {

    /**
     * @method unregister
     * @summary Unregisters the receiver from the overall TP.uri.URI registry.
     * @returns {TP.uri.URI} The receiver.
     */

    var oldResource;

    //  If we are loaded, then we may be observing our resource for *Change
    //  signals. If so, we need to ignore it for those.
    if (this.isLoaded()) {
        oldResource = this.$get('resource');
        this.ignore(oldResource, 'Change');
    }

    TP.uri.URI.removeInstance(this);

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URI.Inst.defineMethod('updateHeaders',
function(headerData) {

    /**
     * @method updateHeaders
     * @summary Updates the receiver's headers, usually from a set of HTTP
     *     headers returned from the last HTTP request used to load this URIs
     *     content.
     * @param {Object} headerData A string, hash, or request object containing
     *     header data.
     * @returns {TP.uri.URI} The receiver.
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

    dict = this.$get('headers');

    if (TP.isHash(headerData)) {
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
            if (TP.isXHR(xhr = headerData.at('commObj'))) {
                str = TP.ifEmpty(xhr.getAllResponseHeaders(), '');
            }
        }

        //  if we were able to find a string then we can process it into its
        //  component parts
        if (TP.notEmpty(str)) {
            if (TP.notValid(dict)) {
                dict = TP.hc();
            }

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

    if (TP.notValid(dict)) {
        dict = TP.hc();
    }

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
//  TP.uri.URN
//  ========================================================================

/**
 * @type {TP.uri.URN}
 * @summary A subtype of TP.uri.URI that models Uniform Resource Names in the
 *     TIBET system. A URN identifies its resource by specifying a name. Each
 *     "namespace identifier" (NID) tends to have a custom subtype of
 *     TP.uri.URN to handle namespace-specific processing needs.
 * @description Note that the spec requires this name to be globally unique and
 *     persistent, even after the resource it points to no longer exists or is
 *     reachable. This condition is not enforced. Also, this type does not limit
 *     the namespace ID to less than 32 characters, per the URN RFC 2141, nor
 *     does it limit which non-alphanumeric characters can be in the namespace
 *     specific string per that same spec.
 */

//  ------------------------------------------------------------------------

TP.uri.URI.defineSubtype('URN');

//  You can't have a generic URN, you have to have a subtype specific to the
//  namespace identification string.
TP.uri.URN.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.uri.URN.Type.defineConstant('URN_REGEX',
                            TP.rc('urn:([a-zA-Z0-9]*):(\\S+)'));

TP.uri.URN.Type.defineConstant('URN_NSS_REGEX',
                            TP.rc('^([a-zA-Z0-9]+):(\\S+)'));

TP.uri.URN.Type.defineConstant('SCHEME', 'urn');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  registry for subtypes based on the NID they are responsible for.
//  'urn:' scheme is sync-only so configure for that
TP.uri.URN.Type.defineAttribute('supportedModes',
                                TP.core.SyncAsync.SYNCHRONOUS);
TP.uri.URN.Type.defineAttribute('mode',
                                TP.core.SyncAsync.SYNCHRONOUS);

TP.uri.URN.Type.defineAttribute('nidHandlers', TP.hc());

TP.uri.URN.registerForScheme('urn');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.uri.URN.Type.defineMethod('getConcreteType',
function(aPath) {

    /**
     * @method getConcreteType
     * @summary Returns the type to use for a particular URI path.
     * @param {String} aPath A URI string providing at least a scheme which can
     *     be looked up for a concrete type.
     * @returns {TP.lang.RootObject|undefined} A type object.
     */

    var parts,
        nid,
        type;

    parts = aPath.split(':');
    if (parts.at(0) !== 'urn') {
        return;
    }

    nid = TP.ifEmpty(parts.at(1), 'tibet');

    //  make sure urn:tibet:something
    if (nid === 'tibet') {
        if (TP.isEmpty(parts.at(2))) {
            return;
        }

        if (!parts.at(2).isJSIdentifier()) {
            return;
        }
    }

    type = TP.uri.URN.$get('nidHandlers').at(nid);
    if (TP.isType(type) && !type.isAbstract()) {
        return type;
    }

    //  TODO:   convention...build a type name and look for it.
    return;
});

//  ------------------------------------------------------------------------

TP.uri.URN.Type.defineMethod('registerForNID',
function(aNID) {

    /**
     * @method registerForNID
     * @summary Registers the receiving type for handling construction of URN
     *     instances for a particular namespace ID (NID).
     * @param {String} aNID A URN namespace ID such as 'oid', or 'tibet'.
     * @exception {TP.sig.InvalidParameter} When the scheme isn't a string.
     * @returns {TP.meta.uri.URN} The receiver.
     */

    var theNID;

    if (!TP.isString(aNID)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Scheme is empty or null.');
    }

    theNID = aNID.strip(':');
    TP.uri.URN.$get('nidHandlers').atPut(theNID, this);

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the Namespace ID (NID) from the URN specification
TP.uri.URN.Inst.defineAttribute('nid');

//  the Namespaces Specific String (NSS)
TP.uri.URN.Inst.defineAttribute('nss');

//  The "name" portion as TIBET perceives it. This is effectively the NSS
//  minus any concept of fragment.
TP.uri.URN.Inst.defineAttribute('name');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.uri.URN.Inst.defineMethod('$initURIComponents',
function(parts) {

    /**
     * @method $initURIComponents
     * @summary Performs any post-parsing initialization appropriate for the
     *     URI components which were parsed during scheme-specific parsing.
     * @param {TP.core.Hash} parts The parsed URI components.
     * @returns {TP.uri.URI} The receiver.
     */

    //  NOTE: These '$set' calls use 'false' to avoid notification!! This is
    //  necessary when creating a URI, since otherwise the change notification
    //  mechanism will cause errors trying to get observations set up before
    //  everything is in place.

    if (TP.canInvoke(parts, 'at')) {
        this.$set('nid', parts.at('nid'), false);
        this.$set('nss', parts.at('nss'), false);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URN.Inst.defineMethod('$parseSchemeSpecificPart',
function(schemeSpecificString) {

    /**
     * @method $parseSchemeSpecificPart
     * @summary Parses inbound URI string content in a fashion specific to the
     *     scheme(s) being managed by the receiver.
     * @param {String} schemeSpecificString A String containing the
     *     "scheme-specific-part" of a URI.
     * @returns {TP.core.Hash} The parsed URI 'components'.
     */

    var match,
        hash;

            /*
    //  NOTE that the concept of 'primary' and 'fragment' aren't relevant
    //  for this type, so we don't invoke the supertype method here, we set
    //  our primary href directly.
    this.$set('primaryLocation',
        this.$get('scheme') + ':' + schemeSpecificString);
            */
    this.callNextMethod();

    match = TP.uri.URN.URN_NSS_REGEX.exec(schemeSpecificString);
    if (TP.isArray(match)) {
        hash = TP.hc('nid', match.at(1), 'nss', match.at(2));
    }

    return hash;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.uri.URN.Inst.defineMethod('$getPrimaryResource',
function(aRequest, filterResult) {

    /**
     * @method $getPrimaryResource
     * @summary Returns the object registered under the receiver's "name".
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @param {Boolean} filterResult True if the resource result will be used
     *     directly and should be filtered to match any resultType definition
     *     found in the request. The default is false.
     * @returns {TP.sig.Response} A TP.sig.Response created with the resource's
     *     content set as its result.
     */

    var url,

        refresh,
        request,
        result,
        response;

    request = this.constructRequest(aRequest);

    //  If we're not the primary URI, that means we have a fragment. So we have
    //  to get the 'whole' resource from the primary URI and then proceed
    //  forward. Note that, in this case, the original request passed in will be
    //  configured to retrieve the value of the fragment, so we have to use a
    //  new, one-time, request here.
    if ((url = this.getPrimaryURI()) !== this) {

        //  The primary resource for a URN is always a URN, so we don't have to
        //  worry about asynchronicity.
        result = url.$getPrimaryResource(
            TP.request('async', false, 'shouldSignal', false),
                filterResult).get('result');
    } else {

        //  Things that we do only if we're the primary URI

        refresh = TP.ifKeyInvalid(request, 'refresh', null);
        result = this.$get('resource');

        if (TP.notValid(result) || refresh) {
            result = this.$resolveName(this.getName());

            //  Store the result as our resource, we just refreshed.
            this.$set('resource', result, false);
        }
    }

    //  filter any remaining data
    if (TP.isTrue(filterResult) && TP.isValid(result)) {
        result = this.$getFilteredResult(result, request, false);
    }

    response = request.getResponse(result);
    request.complete(result);

    return response;
});

//  ------------------------------------------------------------------------

TP.uri.URN.Inst.defineMethod('getName',
function() {

    /**
     * @method getName
     * @summary Returns the receiver's "name" as TIBET perceives it, which is
     *     effectively the NSS (Namespace Specific String) portion of the
     *     receiver's location string minus any fragment where the concept of
     *     fragment here is a TIBET extension.
     * @returns {String} The NSS or name.
     */

    var loc,
        name;

    if (TP.owns(this, 'name') && TP.notEmpty(name = this.$get('name'))) {
        return name;
    }

    loc = this.getLocation();
    if (TP.notValid(loc)) {
        //  Default to same as URI, the OID. Usually for prototype(s).
        name = this.$getOID();
    } else {
        name = loc.split(':').slice(2).join(':').split('#').first();
    }
    this.$set('name', name);

    return name;
});

//  ------------------------------------------------------------------------

TP.uri.URN.Inst.defineMethod('$resolveName',
function(aName) {

    /**
     * @method $resolveName
     * @summary Resolves the receiver's "name" or the name value provided,
     *     returning the referenced resource. This method is invoked by the
     *     $getPrimaryResource call to perform type-specific name resolution
     *     logic.
     * @param {String} aName The name to resolve.
     * @returns {Object} The resource referenced by the receiver's name or name
     *     value.
     */

    return this.$get('resource');
});

//  ------------------------------------------------------------------------

TP.uri.URN.Inst.defineMethod('resourcesAreAlike',
function(resourceA, resourceB) {

    /**
     * @method resourcesAreAlike
     * @summary Returns whether or not the resources are alike in some
     *     receiver-defined way (e.g. either equality or identity) such that
     *     setting the receiver to the new resource would consider it to be
     *     not 'dirty'.
     * @param {Object} resourceA The first resource object to use for
     *     comparison.
     * @param {Object} resourceB The second resource object to use for
     *     comparison.
     * @returns {Boolean} Whether or not the resources are alike in some
     *     receiver-defined way.
     */

    return TP.identical(resourceA, resourceB);
});

//  ------------------------------------------------------------------------
//  Storage Management
//  ------------------------------------------------------------------------

TP.uri.URN.Inst.defineMethod('load',
function(aRequest) {

    /**
     * @method load
     * @summary For the most part, no-op for URNs.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request,
        url,
        handler;

    request = this.constructRequest(aRequest);

    //  rewriting means we'll get to the concrete URI for the receiver so we
    //  put the data where it really belongs
    url = this.rewrite(request);

    request.atPut('operation', 'load');

    //  NB: We hard-code 'TP.uri.URIHandler' as our handler here, since it
    //  really just completes the request properly and doesn't do much else. See
    //  that type for more information.
    handler = TP.uri.URIHandler;

    return handler.load(url, request);
});

//  ------------------------------------------------------------------------

TP.uri.URN.Inst.defineMethod('delete',
function(aRequest) {

    /**
     * @method delete
     * @summary For the most part, a no-op for URNs.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request,
        url,
        handler;

    request = this.constructRequest(aRequest);

    //  rewriting means we'll get to the concrete URI for the receiver so we
    //  put the data where it really belongs
    url = this.rewrite(request);

    request.atPut('operation', 'delete');

    //  NB: We hard-code 'TP.uri.URIHandler' as our handler here, since it
    //  really just completes the request properly and doesn't do much else. See
    //  that type for more information
    handler = TP.uri.URIHandler;

    return handler.delete(url, request);
});

//  ------------------------------------------------------------------------

TP.uri.URN.Inst.defineMethod('save',
function(aRequest) {

    /**
     * @method save
     * @summary For the most part, a no-op for URNs.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request,
        url,
        handler;

    request = this.constructRequest(aRequest);

    //  rewriting means we'll get to the concrete URI for the receiver so we
    //  put the data where it really belongs
    url = this.rewrite(request);

    request.atPut('operation', 'save');

    //  NB: We hard-code 'TP.uri.URIHandler' as our handler here, since it
    //  really just completes the request properly and doesn't do much else. See
    //  that type for more information
    handler = TP.uri.URIHandler;

    return handler.save(url, request);
});

//  ========================================================================
//  TP.uri.TIBETURN
//  ========================================================================

/**
 * @type {TP.uri.TIBETURN}
 * @summary A subtype of TP.uri.URN specific to the urn:tibet 'namespace'.
 * @description When creating URNs the portion after the scheme is what is known
 *     as the "NIS" or Namespace Identification String". This is followed by the
 *     "NSS" or Namespace Specific String. To ensure proper parsing of the
 *     latter we use subtypes specific to each URN namespace, the most common of
 *     which is the 'tibet' NIS.
 */

//  ------------------------------------------------------------------------

TP.uri.URN.defineSubtype('TIBETURN');

TP.uri.TIBETURN.registerForNID('tibet');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.uri.TIBETURN.Inst.defineMethod('$resolveName',
function(aName) {

    /**
     * @method $resolveName
     * @summary Resolves the receiver's "name" or the name value provided,
     *     returning the referenced resource. This method is invoked by the
     *     $getPrimaryResource call to perform type-specific name resolution
     *     logic.
     * @param {String} aName The name to resolve.
     * @returns {Object} The resource referenced by the receiver's name or name
     *     value.
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
                //  Ignore errors attempting lookup.
                void 0;
            }
        }
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURN.Inst.defineMethod('$setPrimaryResource',
function(aResource, aRequest, shouldSignal) {

    /**
     * @method $setPrimaryResource
     * @summary Sets the receiver's resource object, the object TIBET will
     *     treat as the primary resource for any subsequent processing.
     * @param {Object} aResource The resource object to assign.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request containing
     *     optional parameters.
     * @param {Boolean} [shouldSignal=true] Should changes to the value be
     *     signaled? By default true, but occasionally set to false when a
     *     series of changes is being performed etc.
     * @returns {TP.uri.URL|TP.sig.Response} The receiver or a TP.sig.Response
     *     when the resource must be acquired in an async fashion prior to
     *     setting any fragment value.
     */

    var url,
        request,
        oldResource,
        newResource,
        hasID,
        dirty,
        loaded,
        shouldSignalChange;

    //  If the receiver isn't a "primary URI" then it really shouldn't be
    //  holding data, it should be pushing it to the primary...
    if ((url = this.getPrimaryURI()) !== this) {
        return url.$setPrimaryResource(aResource, aRequest);
    }

    request = this.constructRequest(aRequest);

    loaded = request.at('loaded');

    oldResource = this.$get('resource');

    //  NOTE for URN we don't normalize the resource, we leave it as is.
    newResource = aResource;

    //  If the resource doesn't already have a user-set ID (i.e. its ID is the
    //  same as its OID), we're going to set it to our 'name'.
    if (TP.isValid(newResource)) {
        /* eslint-disable no-extra-parens */
        hasID = (newResource[TP.ID] !== newResource.$$oid);
        /* eslint-enable no-extra-parens */

        if (!hasID) {
            if (TP.canInvoke(newResource, 'setID')) {
                newResource.setID(this.getName());
            }
        }
    }

    //  Core question of whether we're dirty or not, will value change.
    if (this.resourcesAreAlike(oldResource, newResource)) {
        dirty = false;
    } else {
        //  NOTE we don't consider setting a value to the processed version of
        //  the same value as an operation that dirties the URI.
        if (request.at('processedResult') === true) {
            dirty = false;
        } else {
            dirty = true;
        }
    }

    //  If we already have a resource, make sure to 'ignore' it for changes.
    //  Unfortunately, even if we're about to get the same resource set we have
    //  to cycle the observations since we can't be sure we observed initially.
    if (TP.isValid(oldResource) && TP.isMutable(oldResource)) {
        this.ignore(oldResource, 'Change');
    }

    //  If the request parameters contain the flag for observing our
    //  resource, then observe it for all *Change signals.

    //  NOTE!! We do this here because, if the resource is a TP.core.Content
    //  object, which will observe it's underlying data, it may already have
    //  a URI created for it (when that observation is made). In that case,
    //  if we enter this logic because, the caller here is be providing the
    //  same resource, it may want to observe this URI for change.
    if (TP.notFalse(request.at('observeResource')) &&
        TP.isMutable(newResource)) {
        //  Observe the new resource object for changes.
        this.observe(newResource, 'Change');
    }

    //  Use request info or current loaded state (CHECKED BEFORE WE UPDATE IT)
    //  to determine if we should signal change.
    if (TP.isDefined(shouldSignal)) {
        shouldSignalChange = shouldSignal;
    } else if (request.hasParameter('signalChange')) {
        shouldSignalChange = request.at('signalChange');
    } else {
        shouldSignalChange = dirty;
    }

    //  What we do with value and flags depends on the originating operation.
    switch (request.at('operation')) {
        case 'load':
            //  fallthrough
        case 'get':
            this.$set('resource', newResource, false);
            this.isLoaded(true);
            this.isDirty(false, true);
            break;
        case 'set':
            this.$set('resource', newResource, false);
            this.isLoaded(true);    //  arguable semantics but important for
                                    //  preloaded URIs
            if (loaded) {
                this.isDirty(dirty);
            } else {
                this.isDirty(false, true);
            }
            break;
        case 'save':
            //  NOTE we don't save results for save..., it's usually an empty
            //  response.
            this.isLoaded(true);
            this.isDirty(false, true);

            //  We don't signal since we're only pushing data, not altering it.
            shouldSignalChange = false;
            break;
        case 'delete':
            //  NOTE we don't save results for delete..., it's usually an empty
            //  response.
            this.isLoaded(false);
            this.isDirty(false, true);

            //  We always signal since whatever value was there is now undefined.
            shouldSignalChange = true;
            break;
        default:
            return this.raise('InvalidOperation', request.at('operation'));
    }

    //  clear any expiration computations
    this.expire(false);

    if (shouldSignalChange) {
        this.$sendSecondaryURINotifications(oldResource, newResource);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURN.Inst.defineMethod('getResource',
function(aRequest) {

    /**
     * @method getResource
     * @summary Returns a receiver-specific object representing the "secondary"
     *     resource being accessed. This method is overridden from its supertype
     *     to provide more direct access to the underlying resource, since
     *     TIBETURNs are really just memory locations and are always available
     *     synchronously.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A TP.sig.Response created with the resource's
     *     content set as its result.
     */

    var primaryResource,

        request,
        result,

        response;

    //  NB: The call to $get('resource') here - this does *NOT* return a
    //  response, but the real object. We can assume 'async' is false since this
    //  is a URN.
    if (TP.notValid(primaryResource = this.getPrimaryURI().$get('resource'))) {
        return this.callNextMethod();
    }

    request = this.constructRequest(aRequest);

    //  Track initial state so we can properly process flags/results.
    request.atPutIfAbsent('operation', 'get');
    request.atPutIfAbsent('loaded', this.isLoaded());

    //  When we're primary or we don't have a fragment we can keep it simple and
    //  return primaryResource.
    if (this.isPrimaryURI() ||
        !this.hasFragment() ||
        this.getFragment() === 'document') {
        result = this.$getFilteredResult(primaryResource, request);
    } else {
        result = this.$getResultFragment(aRequest, primaryResource);
    }

    //  synchronous? complete any request we might actually have.
    if (TP.canInvoke(request, 'complete')) {
        request.complete(result);
    }

    response = request.getResponse(result);

    return response;
});

//  ========================================================================
//  TP.uri.URL
//  ========================================================================

/**
 * @type {TP.uri.URL}
 * @summary A subtype of TP.uri.URI that models Uniform Resource Locators in
 *     the TIBET system. A URL identifies its resource by specifying the network
 *     location.
 * @description The API of this object matches that of the Location object in
 *     the browser, although one can have multiple instances of these objects to
 *     represent many URLs that would be encountered in a TIBET program.
 */

//  ------------------------------------------------------------------------

TP.uri.URI.defineSubtype('URL');

//  TP.uri.URL is an abstract type - the scheme will cause a concrete type
//  to be created.
TP.uri.URL.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.uri.URL.Type.defineConstant('SCHEME', null);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the 'path' varies by scheme but is typically found behind any host:port
//  or file: prefixes
TP.uri.URL.Inst.defineAttribute('path');
TP.uri.URL.Inst.defineAttribute('lastRequest');

//  whether or not the URI is being watched for change. NOTE: do NOT set this
//  to false without changing the isWatched method logic. Null implies true.
TP.uri.URL.Inst.defineAttribute('watched', null);

//  whether or not we should try to PATCH this instance
TP.uri.URL.Inst.defineAttribute('$shouldPatch');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.uri.URL.Inst.defineMethod('asURL',
function() {

    /**
     * @method asURL
     * @summary Returns the receiver as a URL (this).
     * @returns {TP.uri.URL} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URL.Inst.defineMethod('canDiffPatch',
function() {

    /**
     * @method canDiffPatch
     * @summary Returns whether or not the receiver can 'diff patch' its remote
     *     resource.
     * @description In order to be 'diff patchable', URLs (currently) need to be
     *     served from the TDS and be a particular resource type:
     *
     *          XML
     *          JSON
     *          XHTML
     *          XSLT
     *          PLAIN TEXT
     *          CSS
     *
     *      They also need to have an extension.
     * @returns {Boolean} Whether or not the URL contains a resource that is
     *     'diff patchable'.
     */

    var mimeType;

    if (TP.isFalse(this.get('$shouldPatch'))) {
        return false;
    }

    //  Mime type must match one we can actually diff.
    mimeType = this.getMIMEType();

    switch (mimeType) {
        case TP.XML_ENCODED:
        case TP.JSON_ENCODED:
        case TP.XHTML_ENCODED:
        case TP.XSLT_ENCODED:
        case TP.PLAIN_TEXT_ENCODED:
        case TP.CSS_TEXT_ENCODED:
        case TP.HTML_TEXT_ENCODED:
        case TP.XML_TEXT_ENCODED:
        case TP.JSON_TEXT_ENCODED:
        case TP.JS_TEXT_ENCODED:
            return TP.notEmpty(this.getExtension());

        default:
            return false;
    }
});

//  ------------------------------------------------------------------------

TP.uri.URL.Inst.defineMethod('computeDiffPatchAgainst',
function(aContent, alternateContent) {

    /**
     * @method computeDiffPatchAgainst
     * @summary Computes a patch between the two data sources and returns a
     *     String that contains the patch in 'unified diff' format.
     * @param {String} aContent The 'new content' to use to generate the diff.
     * @param {String} [alternateContent] The content to use as the 'alternate
     *     content' to generate the diff, if the receiver's current *remote*
     *     content is not to be used. If this is not supplied, the receiver's
     *     current *remote* content is fetched and used.
     * @returns {Promise} A Promise whose resolved value will be the patch as
     *     computed between the two sources in 'unified diff' format.
     */

    var newContent,
        promise;

    if (!this.canDiffPatch()) {
        return this.raise('TP.sig.InvalidOperation',
                            'This URI is not patchable: ' + this.getLocation());
    }

    //  Without the Diff library, we can't compute a patch in any case
    if (TP.notValid(TP.extern.Diff)) {
        return this.raise('TP.sig.InvalidObject',
                            'The Diff library is not loaded.');
    }

    if (TP.isEmpty(aContent)) {
        return this.raise('TP.sig.InvalidParameter',
                            'Empty comparison content.');
    }

    //  Grab the String representation of the new content
    newContent = TP.str(aContent);

    //  In order to produce a proper patch, we need the remote content *in text
    //  form* and *how it currently exactly exists on the server* but *without
    //  updating the receiver's resource*. To accomplish this, we fetch using a
    //  low-level routine.
    promise = TP.extern.Promise.construct(
                function(resolver, rejector) {

                    var req,
                        currentContent;

                    if (TP.isEmpty(alternateContent)) {

                        //  Note that we ask for the *text*
                        req = TP.request('resultType', TP.TEXT);
                        req.defineHandler(
                            'IOSucceeded',
                            function(ioSignal) {

                                var content;

                                content = ioSignal.get(
                                                    'request').at(
                                                    'commObj').responseText;

                                if (TP.isEmpty(content)) {
                                    return this.raise('TP.sig.InvalidString',
                                                        'Empty content for: ' +
                                                        this.getLocation());
                                }

                                resolver(content);
                            });

                        req.defineHandler(
                            'IOFailed',
                            function(ioSignal) {

                                rejector();
                            });

                        //  Fetch the content asynchronously
                        TP.httpGet(this.getLocation(), req);

                    } else {
                        currentContent = TP.str(alternateContent);

                        if (TP.isEmpty(currentContent)) {
                            return this.raise('TP.sig.InvalidString',
                                                'Empty content for: ' +
                                                this.getLocation());
                        }

                        resolver(currentContent);
                    }
                }.bind(this));

    //  Create the patch based on the two pieces of content.
    promise = promise.then(
                function(currentContent) {

                    var virtualLoc,
                        patchLoc,
                        patch;

                    //  The post diff patch call wants a virtual location and so
                    //  we need to include the same virtual location in the
                    //  patch.
                    virtualLoc = this.getVirtualLocation();

                    //  But we only want the most-specific portion.
                    patchLoc = virtualLoc.slice(
                                    virtualLoc.lastIndexOf('/') + 1);

                    //  Generate the patch using the TP.extern.Diff library.
                    patch = TP.extern.Diff.createPatch(
                                        patchLoc, currentContent, newContent);

                    return patch;
                }.bind(this));

    return promise;
}, {
    dependencies: [TP.extern.Diff]
});

//  ------------------------------------------------------------------------

TP.uri.URL.Inst.defineMethod('getExtension',
function(aSeparator) {

    /**
     * @method getExtension
     * @summary Returns any extension that the URI's path may have. NOTE that
     *     no rewriting is performed in the production of this result.
     * @param {String} aSeparator The separator to use to find the extension.
     *     This defaults to the period (.).
     * @returns {String} The receiver's path extension, if it has one.
     */

    if (this.hasFragment()) {
        return TP.uriExtension(this.getPrimaryLocation(), aSeparator);
    }

    return TP.uriExtension(this.getLocation(), aSeparator);
});

//  ------------------------------------------------------------------------

TP.uri.URL.Inst.defineMethod('getNativeNode',
function(aRequest) {

    /**
     * @method getNativeNode
     * @summary Returns the content node of the receiver without its normal
     *     TP.dom.Node wrapper. This value may vary from the text value of the
     *     receiver if ACP-enhanced markup was provided to initialize the
     *     content.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A TP.sig.Response created with the resource's
     *     node content set as its result.
     */

    var subrequest,
        async;

    subrequest = this.constructSubrequest(aRequest);

    subrequest.defineMethod(
            'completeJob',
            function(aResult) {

                var result;

                result = TP.isValid(aResult) ? TP.node(aResult) : aResult;

                subrequest.set('result', result);

                subrequest.$wrapupJob('Succeeded', TP.SUCCEEDED, result);

                if (TP.canInvoke(aRequest, 'complete')) {
                    aRequest.complete(result);
                }
            });

    subrequest.defineMethod(
            'failJob',
            function(aFaultString, aFaultCode, aFaultInfo) {

                var info,
                    subrequests;

                info = TP.hc(aFaultInfo);
                if (TP.isValid(subrequests = info.at('subrequests'))) {
                    subrequests.push(subrequest);
                } else {
                    subrequests = TP.ac(subrequest);
                    info.atPut('subrequests', subrequests);
                }

                subrequest.$wrapupJob('Failed', TP.FAILED);

                if (TP.canInvoke(aRequest, 'fail')) {
                    aRequest.fail(aFaultString, aFaultCode, info);
                }
            });

    subrequest.atPut('resultType', TP.DOM);
    this.getResource(subrequest);

    //  If async we can only return the result/response being used to
    //  actually process the async activity.
    //  NOTE that we need to re-read the async state in case our underlying
    //  resource is async-only and potentially rewrote the value.
    async = this.rewriteRequestMode(subrequest);
    if (async) {
        aRequest.andJoinChild(subrequest);

        //  hand back the response object for the "outer" request, which
        //  will be either the originating request or our internally
        //  constructed one (which was also used as the subrequest)
        if (TP.canInvoke(aRequest, 'getResponse')) {
            return aRequest.getResponse();
        } else {
            return subrequest.getResponse();
        }
    }

    //  If the routine was invoked synchronously then the data will have
    //  been placed in the subrequest.
    return subrequest.getResponse();
});

//  ------------------------------------------------------------------------

TP.uri.URL.Inst.defineMethod('getPath',
function() {

    /**
     * @method getPath
     * @summary Returns the path portion of the receiver.
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

TP.uri.URL.Inst.defineMethod('$getPath',
function(url) {

    /**
     * @method $getPath
     * @summary Parses the url for the path portion as that concept is defined
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

    //  now remove any parameter or fragment portions...
    if (/\?/.test(path)) {
        path = path.slice(0, path.indexOf('?'));
    }

    if (/#/.test(path)) {
        path = path.slice(0, path.indexOf('#'));
    }

    return path;
});

//  ------------------------------------------------------------------------

TP.uri.URL.Inst.defineMethod('getPathParts',
function() {

    /**
     * @method getPathParts
     * @summary Returns the path portions as an Array
     * @returns {String[]} An Array of Strings comprising the parts of the path.
     */

    var path;

    if (TP.isEmpty(path = this.getPath())) {
        return TP.ac();
    }

    //  There isn't always a leading slash... see getPath()
    if (path.charAt(0) === '/') {
        path = path.slice(1);
    }

    return path.split('/');
});

//  ------------------------------------------------------------------------

TP.uri.URL.Inst.defineMethod('getRelativePath',
function(secondPath, filePath) {

    /**
     * @method getRelativePath
     * @summary Returns the receiver's path converted to a relative path when
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
     */

    return TP.uriRelativeToPath(this.getLocation(), secondPath, filePath);
});

//  ------------------------------------------------------------------------

TP.uri.URL.Inst.defineMethod('$getPrimaryResource',
function(aRequest, filterResult) {

    /**
     * @method $getPrimaryResource
     * @summary Returns the resource referenced by the receiver's primary href,
     *     the portion prior to any #-delimited fragment for those schemes for
     *     which a fragment is valid.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @param {Boolean} filterResult True if the resource result will be used
     *     directly and should be filtered to match any resultType definition
     *     found in the request. The default is false.
     * @returns {TP.sig.Response} A TP.sig.Response created with the resource's
     *     primary content set as its result.
     */

    var url,
        request,
        subrequest,
        loaded,
        refresh,
        async,
        thisref,
        response,
        resource;

    //  TODO:   do we need a fragment check here for any reason?
    if ((url = this.getPrimaryURI()) !== this) {
        return url.$getPrimaryResource(aRequest, filterResult);
    }

    request = this.constructRequest(aRequest);

    //  If we're going to have to request the data then the key thing we
    //  want to avoid is having an incoming request complete() before the
    //  entire process is finished. That means ensuring we have a clean
    //  subrequest instance we can locally modify.
    subrequest = this.constructSubrequest(request);

    loaded = this.isLoaded();

    refresh = subrequest.at('refresh');
    if (TP.notValid(refresh)) {
        //  may need to force refresh to true if the content hasn't been loaded
        //  and there wasn't a specific value for refresh.
        refresh = !loaded;

        //  Make sure to put this value into the subrequest before we call
        //  rewriteRequestMode below. That call looks at this value to compute
        //  whether this request should fetch asynchronously or not.
        subrequest.atPut('refresh', refresh);
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

                var result;

                //  Default our result, and filter if requested. We do this
                //  here as well to ensure we don't complete() an incoming
                //  request with unfiltered result data.
                result = aResult;

                if (TP.isTrue(filterResult) && TP.isValid(aResult)) {
                    result = thisref.$getFilteredResult(aResult, request,
                        false);
                }

                //  If we fetched the initial resource and are just going to be
                //  filtering result format then don't call setter here. we
                //  don't want to adjust content just because of alternative
                //  request response types.
                if (!thisref.resourcesAreAlike(
                                aResult, thisref.$get('resource'))) {
                    thisref.$setPrimaryResource(result, request);
                } else if (TP.isTrue(subrequest.at('refresh'))) {
                    thisref.isDirty(false, true);
                }

                //  rewrite the request result object so we hold on to the
                //  processed content rather than the inbound content.
                subrequest.set('result', result);

                subrequest.$wrapupJob('Succeeded', TP.SUCCEEDED, result);

                if (TP.canInvoke(request, 'complete')) {
                    request.complete(result);
                }
            });

    subrequest.defineMethod(
            'failJob',
            function(aFaultString, aFaultCode, aFaultInfo) {

                var info,
                    subrequests;

                info = TP.hc(aFaultInfo);
                if (TP.isValid(subrequests = info.at('subrequests'))) {
                    subrequests.push(subrequest);
                } else {
                    subrequests = TP.ac(subrequest);
                    info.atPut('subrequests', subrequests);
                }

                subrequest.$wrapupJob('Failed', TP.FAILED);

                if (TP.canInvoke(request, 'fail')) {
                    request.fail(aFaultString, aFaultCode, info);
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

        if (!async) {
            resource = this.$get('resource');

            //  Fake completion of the subrequest and related request.
            subrequest.complete(resource);
        } else {
            setTimeout(function() {
                resource = this.$get('resource');

                //  Fake completion of the subrequest and related request.
                subrequest.complete(resource);
            }.bind(this), TP.sys.cfg('queue.delay'));
        }

        return subrequest.getResponse();
    }

    if (async) {
        request.andJoinChild(subrequest);

        //  if we have a response we must have done a refresh, otherwise
        //  we're working with whatever data we had cached. In that case we
        //  need to construct a response wrapping that value so we can fake
        //  the async operation in terms of return value.
        if (TP.notValid(response)) {
            //  didn't do a refresh so we got the data synchronously from
            //  our cache. now we just need to "fake" a response, which we
            //  want to associate with the original request object if there
            //  was one.
            if (TP.canInvoke(request, 'getResponse')) {
                response = request.getResponse();
            } else {
                response = subrequest.getResponse();
            }
        }

        return response;
    }

    //  If the routine was invoked synchronously then the data will have
    //  been placed in the subrequest.
    return subrequest.getResponse();
});

//  ------------------------------------------------------------------------

TP.uri.URL.Inst.defineMethod('getRequestedResource',
function(aRequest) {

    /**
     * @method getRequestedResource
     * @summary Returns the resource object appropriate for the request. This
     *     typically becomes the request's result object and can be used to
     *     set the URI resource directly.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {Object} The requested form of the cached resource. The cached
     *     resource is typically a Content object of some form however the
     *     return value will conform to the 'resultType' provided in the request
     *     (if any).
     */

    var contentType,

        resource,
        newResult,
        currentResult,

        dat,
        dom,
        tname,
        map,

        handler,
        type,

        mime,

        resourceIsContent,
        resultIsContent;

    if (TP.notValid(aRequest)) {
        return this.raise('TP.sig.InvalidParameter',
                            'No request object.');
    }

    //  Certain operations like save() will return empty or non-relevant
    //  results on completion. We don't refresh content from those results,
    //  which will be flagged with a false value for refreshContent.
    if (TP.isFalse(aRequest.at('refreshContent'))) {
        return this.$getFilteredResult(this.$get('resource'), aRequest);
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

    newResult = aRequest.getResult();

    //  In cases of refresh we'll often be called with the data we already have
    //  as the result.

    currentResult = this.$getFilteredResult(resource, aRequest);

    //  Core question of whether we're dirty or not, will value change.
    if (this.resourcesAreAlike(currentResult, newResult)) {
        return currentResult;
    }

    //  ---
    //  discriminate the "raw data" of the result
    //  ---

    //  capture the raw result data from the request. This is typically
    //  a string, node, or pair based on the original request parameters.
    if (TP.isArray(newResult) && newResult.getSize() === 2) {
        dat = newResult.first();
        dom = newResult.last();

        //  TODO: what if it's an array that doesn't contain a string and a
        //  node?
    } else if (TP.isNode(newResult)) {
        dom = newResult;
    } else if (TP.isXHR(newResult)) {
        dat = newResult.responseText;

        try {
            dom = newResult.responseXML;

            //  IE has the nasty habit of making an empty '#document' node
            //  here that passes TP.isNode(...) tests, but has no content
            //  because it couldn't be parsed into real XML. Therefore, we do
            //  this low-level testing.
            if (dom && dom.childNodes && dom.childNodes.length === 0) {
                dom = null;
            }
        } catch (e) {
            dom = TP.node(newResult.responseText);
        }
    } else {
        dat = newResult;
    }

    //  ---
    //  Wrap content in best-fit container.
    //  ---

    //  result content handler invocation...if possible (but not if the
    //  requestor wants raw TP.TEXT).
    handler = aRequest.at('contentType');
    if (TP.notValid(handler)) {
        handler = aRequest.at('contenttype');
        if (TP.isValid(handler)) {
            TP.ifWarn() ?
                TP.warn('Deprecated "contenttype" request parameter: ' +
                    aRequest) : 0;
        }
    }

    if (TP.notValid(handler) && aRequest.at('resultType') !== TP.TEXT) {
        //  check on uri mapping to see if the URI maps define a wrapper.
        map = TP.uri.URI.$getURIMap(this);
        if (TP.isValid(map)) {
            handler = map.at('contenttype');
        }

        if (TP.notValid(handler)) {
            //  other possibility is a wrapper based on Content-type header
            //  or MIME value from the response itself.

            //  Set the computed MIME type to null to force recomputation based
            //  on the possibly new MIME type of 'dat'.
            this.$set('computedMIMEType', null);

            mime = this.getMIMEType(dom || dat);
            handler = TP.ietf.mime.getConcreteType(mime);
        } else {
            //  Make sure that handler is a type.
            handler = TP.sys.getTypeByName(handler);
        }

        //  Should almost always provide a viable option for content.
        if (TP.notValid(handler) && !TP.isKindOf(resource, TP.core.Content)) {
            handler = TP.core.Content.getConcreteType(TP.ifInvalid(dom, dat));
        }
    }

    if (TP.isType(handler)) {
        type = TP.sys.getTypeByName(handler);
        if (TP.canInvoke(type, 'constructContentObject')) {
            //  NOTE that this returns us a "content object" whose purpose
            //  is to be able to "reconstitute" the data as needed
            newResult = type.constructContentObject(dom || dat, this);
            if (TP.notValid(newResult)) {
                return this.raise('',
                    'Content handler failed to produce output.');
            }
        } else {
            return this.raise('TP.sig.InvalidParameter',
                            'Content handler API not supported.');
        }
    } else if (TP.isNode(dom)) {
        //  wait for wrapping during post-processing below.
        newResult = dom;
    } else if (TP.isString(dat)) {
        //  when looking for a content object (a text-specific object)
        //  we work from MIME type as a starting point. Proper XML won't
        //  normally be run through this routine since getResource looks
        //  for a node wrapper first. we're normally dealing with
        //  non-XML content here -- like CSS, JSON, etc.

        //  Set the computed MIME type to null to force recomputation based on
        //  the possibly new MIME type of 'dat'.
        this.$set('computedMIMEType', null);

        mime = this.getMIMEType(dat);
        type = TP.ietf.mime.getConcreteType(mime);

        if (TP.canInvoke(type, 'constructContentObject')) {
            //  NOTE that this returns us a "content object" whose purpose
            //  is to be able to "reconsitute" the data as needed
            newResult = type.constructContentObject(dat, this);
        } else {
            //  No concrete handler type for the MIME type? Use the string.
            newResult = dat;
        }
    } else if (TP.isHash(dat)) {
        tname = dat.at('type');
        if (TP.isString(tname) &&
            TP.isType(type = TP.sys.getTypeByName(tname)) &&
            TP.canInvoke(type, 'constructContentObject')) {
            newResult = type.constructContentObject(dat, this);
        }
    } else {
        //  some other form of non-standard result object.
        newResult = TP.ifInvalid(dom, dat);
    }

    //  ---
    //  post-process to maintain internal containers.
    //  ---

    //  Now, set the resource or result based on data types of what we already
    //  have and what we are going to be setting.

    //  NOTE: THIS IS ORDER DEPENDENT - DO *NOT* CHANGE the testing order here
    //  without testing extensively.

    resourceIsContent = TP.isKindOf(resource, TP.core.Content);
    resultIsContent = TP.isKindOf(newResult, TP.core.Content);

    if (TP.canInvoke(newResult, 'getNativeNode') && !resourceIsContent) {
        //  result _is_ a wrapper object of some form.
        resource = this.$normalizeRequestedResource(newResult);
    } else if (resourceIsContent && !resultIsContent) {

        //  Make sure that the Content object that is the resource can handle
        //  the result content. We may be holding a Content object that is
        //  incompatible with the new content. We can check this by asking the
        //  content's type if we could construct a new one given the data.
        if (resource.getType().canConstruct(newResult, this)) {
            resource.set('data', newResult, false);
        } else {
            resource = this.$normalizeRequestedResource(newResult);
        }
    } else if (TP.canInvoke(resource, 'setNativeNode') &&
                TP.isNode(newResult)) {
        TP.ifTrace() && TP.$DEBUG && TP.$VERBOSE ?
            TP.sys.logIO('Refreshing current node container.',
                        TP.DEBUG) : 0;

        resource.setNativeNode(newResult, false);
    } else if (TP.isNode(newResult)) {
        TP.ifTrace() && TP.$DEBUG && TP.$VERBOSE ?
            TP.sys.logIO('Creating new node container.',
                        TP.DEBUG) : 0;

        //  note that we pass ourselves along to establish "ownership"
        newResult = TP.dom.Node.construct(newResult);
        newResult.set('uri', this);

        resource = this.$normalizeRequestedResource(newResult);
    } else {
        resource = this.$normalizeRequestedResource(newResult);
    }

    //  NOTE that callers are responsible for defining the context of
    //  whether the resulting data dirties/loads the URI in question.

    //  clear any expiration computations.
    this.expire(false);

    return this.$getFilteredResult(resource, aRequest);
});

//  ------------------------------------------------------------------------

TP.uri.URL.Inst.defineMethod('$normalizeRequestedResource',
function(aResource) {

    /**
     * @method $normalizeRequestedResource
     * @summary 'Normalizes' the resource object. This means that certain
     *     common constructs that this particular type of TP.uri.URI needs will
     *     be computed and instrumented onto the resource via this method.
     * @param {Object} aResource The resource object to normalize.
     * @returns {Object} The normalized resource.
     */

    var obj;

    obj = TP.wrap(aResource);

    if (TP.canInvokeInterface(
            obj, TP.ac('addTIBETSrc', 'addXMLBase', '$set'))) {
        //  place our URI value into the node wrapper and node content
        obj.$set('uri', this, false);

        //  make sure the node knows where it loaded from.
        obj.addTIBETSrc(this);

        //  then, an 'xml:base' attribute. this helps ensure that xml:base
        //  computations will work more consistently during tag processing
        obj.addXMLBase();
    }

    return obj;
});

//  ------------------------------------------------------------------------
//  Content Processing
//  ------------------------------------------------------------------------

TP.uri.URL.Inst.defineMethod('hasReachedPhase',
function(targetPhase, targetPhaseList) {

    /**
     * @method hasReachedPhase
     * @summary Returns true if the receiver's content has been processed to
     *     the phase defined, relative to an optional phase list.
     * @param {String} targetPhase A TIBET content "process phase" string such
     *     as 'Includes'.
     * @param {String[]} targetPhaseList An array of phase names. The default is
     *     TP.shell.TSH.NOCACHE.
     * @returns {Boolean} Whether or not the content of the receiver has reached
     *     the supplied phase in its processing.
     */

    var content,
        resp;

    //  if we're not loaded we can't have reached a particular phase.
    if (!this.isLoaded()) {
        return false;
    }

    //  force refresh to false, we only want cached data access here. NOTE
    //  that this avoids any async issues as well.
    resp = this.getResource(TP.hc('refresh', false, 'async', false));
    content = resp.get('result');

    if (TP.canInvoke(content, 'hasReachedPhase')) {
        return content.hasReachedPhase(targetPhase, targetPhaseList);
    }

    //  no content? can't have reached any phase then.
    return false;
});

//  ------------------------------------------------------------------------

TP.uri.URL.Inst.defineMethod('processTP_sig_Request',
function(aRequest) {

    /**
     * @method processTP_sig_Request
     * @summary Processes the receiver's content, typically by dispatching to
     *     the receiver's content object itself.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request or parameter
     *     hash with control parameters. The 'targetPhase' parameter is the most
     *     important here. Default is 'Finalized'.
     * @returns {TP.sig.Response} A TP.sig.Response created with the resource's
     *     processed content set as its result.
     */

    var request,
        subrequest,
        thisref,
        async;

    //  This request will be used for transformation processing.
    request = this.constructSubrequest(aRequest);
    request.atPutIfAbsent('targetPhase', 'Finalize');

    //  The subrequest here is used for content acquisition.
    subrequest = this.constructSubrequest(aRequest);

    thisref = this;

    subrequest.defineMethod(
            'completeJob',
            function(aResult) {

                var resource,
                    resp,
                    result,

                    returnProcessedResult,
                    returnResult;

                resource = TP.tpnode(aResult);

                if (TP.canInvoke(resource, 'transform')) {

                    /*
                    //  Update the resource, passing subrequest so we keep the
                    //  original request params (like operation) flowing through.
                    //  TODO: setting the resource here has a bad habit of
                    //  triggering a cyclic change series from processed to
                    //  unprocessed data. Not convinced we should set it at all
                    //  here since we're essentially responding _after_ a
                    //  getResource call to process the result data.
                    thisref.$setPrimaryResource(resource, subrequest);
                    */

                    //  Start out by configuring to use the processed result.
                    returnProcessedResult = true;

                    //  If, however, a Node can be obtained from the resource,
                    //  then clone that, wrap it and use that as the return
                    //  result. Flip the flag off so we don't pick up the
                    //  processed result as the return result

                    //  TODO: verify this is correct in all cases, and
                    //  decide if we need to assign a "save result" flag to
                    //  control this.
                    if (TP.canInvoke(resource, 'getNativeNode')) {
                        returnResult = TP.wrap(
                            TP.nodeCloneNode(resource.getNativeNode()));
                        returnProcessedResult = false;
                    }

                    resp = TP.process(resource, request);
                    result = resp.get('result');

                    //  If the flag is true, then use the processed result as
                    //  the return result.
                    if (returnProcessedResult) {
                        returnResult = result;
                    }

                    if (request.didFail()) {
                        aRequest.fail(request.getFaultText(),
                                      request.getFaultCode(),
                                      request.getFaultInfo());
                        subrequest.fail(request.getFaultText(),
                                          request.getFaultCode(),
                                          request.getFaultInfo());
                        return;
                    }

                    //  rewrite the request result object so we hold on to
                    //  the processed content rather than the inbound
                    //  content.
                    subrequest.set('result', result);

                    //  the return result should become the new resource
                    thisref.set('resource',
                                returnResult,
                                TP.request('signalChange', false,
                                            'processedResult', true));
                }

                subrequest.$wrapupJob('Succeeded', TP.SUCCEEDED, result);

                //  Inform any originally inbound request of our status.
                if (TP.canInvoke(aRequest, 'complete')) {
                    //  Note that this could be null if there's no result,
                    //  or if the transform call isn't supported, or if the
                    //  transform simply produces a null result.
                    aRequest.complete(result);
                }
            });

    subrequest.defineMethod('failJob',
        function(aFaultString, aFaultCode, aFaultInfo) {

            var info,
                subrequests;

            info = TP.hc(aFaultInfo);
            if (TP.isValid(subrequests = info.at('subrequests'))) {
                subrequests.push(subrequest);
            } else {
                subrequests = TP.ac(subrequest);
                info.atPut('subrequests', subrequests);
            }

            subrequest.$wrapupJob('Failed', TP.FAILED);

            //  Inform any originally inbound request of our status.
            if (TP.canInvoke(aRequest, 'fail')) {
                aRequest.fail(aFaultString, aFaultCode, info);
            }
        });

    //  trigger the invocation and rely on the handlers for the rest.
    this.getResource(subrequest);

    //  re-read the request in case load() processing rewrote the
    //  request mode on us.
    async = this.rewriteRequestMode(subrequest);
    if (async) {
        aRequest.andJoinChild(subrequest);

        //  if we're async then the data may not be ready, we need to return
        //  a viable response object instead.
        if (TP.canInvoke(aRequest, 'getResponse')) {
            return aRequest.getResponse();
        } else {
            return subrequest.getResponse();
        }
    }

    return subrequest.getResponse();
});

//  ------------------------------------------------------------------------
//  Storage Management
//  ------------------------------------------------------------------------

TP.uri.URL.Inst.defineMethod('load',
function(aRequest) {

    /**
     * @method load
     * @summary Loads the content of the receiver from whatever is the
     *     currently mapped storage location. This method relies on both
     *     rewriting and routing which ultimately hand off to a
     *     TP.uri.URIHandler of some type to perform the actual load.
     * @description This method is rarely called directly, it's typically
     *     invoked by the get*Content() calls when the receiver has not yet been
     *     loaded, or when a refresh is being requested. Note that this is a
     *     "mapped" action, meaning the URI undergoes rewriting and mapping as
     *     part of the load process.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request,
        url,
        handler;

    TP.ifTrace() && TP.$DEBUG && TP.$VERBOSE ?
        TP.sys.logIO('Loading content data for ID: ' +
                    TP.ifInvalid(this.getLocation(), 'FROM_SOURCE'),
                    TP.DEBUG) : 0;

    request = this.constructRequest(aRequest);

    //  rewriting always comes first. if we end up altering the actual URI
    //  during this process then we're not the "keeper of the data", the
    //  rewritten URI instance is
    url = this.rewrite(request);

    //  map the load operation so we get the right handler based on any
    //  rewriting and routing logic in place for the original URI
    request.atPut('operation', 'load');
    handler = url.remap(this, request);

    return handler.load(url, request);
});

//  ------------------------------------------------------------------------

TP.uri.URL.Inst.defineMethod('delete',
function(aRequest) {

    /**
     * @method delete
     * @summary Destroys the target URL at the storage location.
     * @description This method is a "mapped" action, meaning the URI undergoes
     *     rewriting and routing as part of the delete process. This may, as you
     *     might expect, alter the physical location being targeted for
     *     destruction. You should probably verify these targets before invoking
     *     delete.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request,
        url,
        handler;

    //  TODO:   when the receiver has a fragment what then? Are we supposed
    //  to remove only the fragment subset of the receiver?

    request = this.constructRequest(aRequest);

    url = this.rewrite(request);

    request.atPut('operation', 'delete');
    handler = url.remap(this, request);

    return handler.delete(url, request);
});

//  ------------------------------------------------------------------------

TP.uri.URL.Inst.defineMethod('isWatched',
function() {

    /**
     * @method isWatched
     * @summary Returns whether or not the URI should process remote changes
     *     when it gets notified that its remote content has changed.
     * @returns {Boolean} Whether or not the resource processes remote changes.
     */

    return TP.notFalse(this.$get('watched'));
});

//  ------------------------------------------------------------------------

TP.uri.URL.Inst.defineMethod('save',
function(aRequest) {

    /**
     * @method save
     * @summary Saves the receiver's content to its URI path. The request's
     *     fileMode key defaults to 'w' so that any existing content is replaced
     *     when operating on file URIs.
     * @description This method is a "mapped" action, meaning the URI undergoes
     *     rewriting and routing as part of the save process. This may, as you
     *     might expect, alter the physical location in which the data is
     *     stored.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request,
        url,
        handler;

    //  TODO:   when the receiver has a fragment what then? Should just
    //          update "document href" and save that?

    request = this.constructRequest(aRequest);

    //  rewriting means we'll get to the concrete URI for the receiver so we
    //  put the data where it really belongs
    url = this.rewrite(request);

    request.atPut('operation', 'save');
    handler = url.remap(this, request);

    return handler.save(url, request);
});

//  ------------------------------------------------------------------------

TP.uri.URL.Inst.defineMethod('setShouldPatch',
function(shouldBePatched) {

    /**
     * @method setShouldPatch
     * @summary Sets whether the URI is patched or not when storing to the
     *     server. For TIBETURLs, this passes through to the concrete URI's
     *     'patched' property.
     * @param {Boolean} shouldBePatched Whether the URI should be patched or
     *     not.
     * @returns {TP.uri.URL} The receiver.
     */

    return this.getConcreteURI().set('$shouldPatch', shouldBePatched);
});

//  ------------------------------------------------------------------------

TP.uri.URL.Inst.defineMethod('refreshFromRemoteResource',
async function() {

    /**
     * @method refreshFromRemoteResource
     * @summary Refreshes the receiver's content from the remote resource it
     *     represents. Upon refreshing the content this method will invoke
     *     processRefreshedContent to perform any post-processing of the
     *     content appropriate for the target URI.
     * @returns {Promise} A promise which resolves on completion.
     */

    var callback,
        secondaryURIs,
        changedLoc,
        normalizedLoc,

        isLoadableScript;

    if (this.isWatched()) {
        this.isLoaded(false);
    }

    //  Make sure to let secondaryURIs know too.
    if (TP.notEmpty(secondaryURIs = this.getSecondaryURIs())) {
        secondaryURIs.forEach(
                function(aURI) {
                    if (aURI.isWatched()) {
                        aURI.isLoaded(false);
                    }
                });
    }

    changedLoc = this.getLocation();
    normalizedLoc = TP.uriInTIBETFormat(changedLoc);

    //  Force a reload. Note that we approach this two ways depending on the
    //  nature of the URI. Source code needs to be loaded via the boot system so
    //  it properly loads and runs, whereas other resources can load via XHR.
    callback = async function(result) {

        var url,
            resourceHash,
            pkgcfg;

        if (TP.isError(result)) {
            TP.error(result);
            return;
        }

        url = TP.uc(changedLoc);

        //  Make sure to set isLoaded() to true here, since we set it to false
        //  above. This will ensure that the URL doesn't think it's still dirty
        //  after we've reloaded it per the semantics of this method.
        if (url.isWatched()) {
            url.isLoaded(true);
        }

        //  Set the URL to not be dirty.
        url.isDirty(false);

        //  Is the changed location one of our loaded package files? If so we
        //  need to process it as a package, not a random file or script.
        if (TP.boot.$getLoadedPackages().contains(normalizedLoc)) {

            //  Import any new scripts that would have booted with the system.
            //  NOTE we pass 'true' to the shouldSignal flag here to tell this
            //  particular import we want scripts to signal Change on load.
            pkgcfg = TP.isEmpty(TP.boot.$$bootconfig) ?
                TP.boot.$$bootfile :
                TP.boot.$$bootfile + '@' + TP.boot.$$bootconfig;
            await TP.sys.importPackage(pkgcfg, false, true);
        }

        //  Trigger post-processing for specific URIs.
        url.processRefreshedContent();

        //  Grab the resource hash of changed remotes and remote the url that we
        //  just processed from the list.
        resourceHash = TP.uri.URI.get('remoteChangeList');
        resourceHash.removeKey(url.getLocation());

        url.signal('RemoteResourceChanged', TP.hc('isDirty', false));
    };

    //  Is the changed location one of our loaded package files? If so we
    //  need to process it as a package, not a random file or script.
    if (TP.boot.$getLoadedPackages().contains(normalizedLoc)) {

        //  Force refresh of any package data, particularly related to the
        //  URI we're referencing.
        await TP.boot.$refreshPackages(changedLoc);

        callback();

    } else {
        isLoadableScript = await TP.boot.$isLoadableScript(changedLoc);

       if (isLoadableScript) {
            //  If the receiver refers to a file that was loaded (meaning it's
            //  mentioned in a TIBET package config) we source it back in rather
            //  than just loading via simple XHR.
            TP.debug('Sourcing in updates to ' + changedLoc);

            return TP.sys.importSourceText(changedLoc).then(callback, callback);
        } else {
            TP.debug('Reading in changes to ' + changedLoc);

            return this.getResource(TP.hc('signalChange', false)).then(
                                                        callback, callback);
        }
    }
});

//  ------------------------------------------------------------------------

TP.uri.URL.Inst.defineMethod('processRefreshedContent',
function() {

    /**
     * @method processRefreshedContent
     * @summary Invoked when remote resource changes have been loaded to provide
     *     the receiver with the chance to post-process those changes. If you
     *     override this method you should signal Change (this.$changed) once
     *     you have completed processing to notify potential observers.
     * @returns {TP.uri.URL} The receiver.
     */

    this.$changed();

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URL.Inst.defineMethod('watch',
function() {

    /**
     * @method watch
     * @summary Flags the URL as being active for remote change processing. When
     *     uri.source.watch_changes is true and uri.source.process_changes is
     *     true this flag will be checked to ensure the specific URI is not
     *     excluded from processing. It's not usually necessary to set this to
     *     true if the URL would pass remote URL isWatchableURI testing.
     * @returns {TP.uri.URL} The receiver.
     */

    var url,
        request,
        handler;

    //  Early exit if we're already set so we avoid request/rewrite/remap work.
    if (TP.isTrue(this.get('watched'))) {
        return this;
    }

    //  We need to get a request and go through rewrite/mapping to get the
    //  proper handler type for the receiver. That type can then tell us if the
    //  receiver is a watchable instance.
    request = this.constructRequest();
    request.atPut('operation', 'watch');

    url = this.rewrite(request);
    handler = url.remap(this, request);

    //  NOTE we don't assume true, we still check that the receiver is a
    //  watchable URI based on any remote URL filtering for the handler.
    this.set('watched', handler.isWatchableURI(this));

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URL.Inst.defineMethod('unwatch',
function() {

    /**
     * @method unwatch
     * @summary Flags the URL as not processing remote change notices. When
     *     uri.source.watch_changes is true and uri.source.process_changes is
     *     true this flag will be checked to ensure the specific URI is not
     *     excluded from processing.
     * @returns {TP.uri.URL} The receiver.
     */

    var request,
        url;

    //  Early exit if we're already set so we avoid request/rewrite/remap work.
    if (TP.isFalse(this.get('watched'))) {
        return this;
    }

    request = this.constructRequest();

    url = this.rewrite(request);
    if (url !== this) {
        url.unwatch();
    }

    this.set('watched', false);

    return this;
});

//  ========================================================================
//  TP.uri.ChromeExtURL
//  ========================================================================

/**
 * @type {TP.uri.ChromeExtURL}
 * @summary A subtype of TP.uri.URL specific to the Chrome Extension scheme.
 */

//  ------------------------------------------------------------------------

TP.uri.URL.defineSubtype('ChromeExtURL');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.uri.ChromeExtURL.Type.defineConstant('SCHEME', 'chrome-extension');

TP.uri.ChromeExtURL.registerForScheme('chrome-extension');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.uri.ChromeExtURL.Type.defineMethod('$getDefaultHandler',
function(aURI, aRequest) {

    /**
     * @method $getDefaultHandler
     * @summary Returns the default handler for a URI and request pair. For
     *     non-mapped HTTP urls this is the TP.uri.HTTPURLHandler type.
     * @param {TP.uri.URI|String} aURI The URI to obtain the default handler
     *     for.
     * @param {TP.sig.Request} aRequest The request whose values should inform
     *     the routing assignment.
     * @returns {TP.meta.uri.URIHandler} A TP.uri.URIHandler subtype type object
     *     or a type object conforming to that interface.
     */

    return TP.uri.FileURLHandler;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the most recent 'communication' object
//  (i.e. the native XHR or WebSocket object)
TP.uri.ChromeExtURL.Inst.defineAttribute('commObject');

TP.uri.ChromeExtURL.Inst.defineAttribute('componentID');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.uri.ChromeExtURL.Inst.defineMethod('$parseSchemeSpecificPart',
function(schemeSpecificString) {

    /**
     * @method $parseSchemeSpecificPart
     * @summary Parses inbound URI string content in a fashion specific to the
     *     scheme(s) being managed by the receiver.
     * @param {String} schemeSpecificString A String containing the
     *     "scheme-specific-part" of a URI.
     * @returns {TP.core.Hash} The parsed URI 'components'.
     */

    var dict;

    this.callNextMethod();

    //  TODO TODO TODO TODO TODO
    //  TODO: relying on TP.core.Hash for parsing is a poor design, we
    //  should change that so the parsing is local to this type. Here, we
    //  invoke the parser directly because of the ambiguities with the style
    //  string parser.
    /* eslint-disable new-cap */
    dict = TP.core.Hash.URI_STRING_PARSER('chrome-extension:' +
                                            schemeSpecificString);
    /* eslint-enable new-cap */

    this.set('path', dict.at('path'));
    this.set('componentID', dict.at('hostname'));

    return dict;
});

//  ========================================================================
//  TP.uri.CommURL
//  ========================================================================

/**
 * @type {TP.uri.CommURL}
 * @summary A trait class designed to add "comm" (mostly XHR) access methods.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('TP.uri.CommURL');

TP.uri.CommURL.isAbstract(true);       //  Always set for a trait.

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the most recent 'communication' object
//  (i.e. the native XHR or WebSocket object)
TP.uri.CommURL.Inst.defineAttribute('commObject');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.uri.CommURL.Inst.defineMethod('commDidSucceed',
function() {

    /**
     * @method commDidSucceed
     * @summary Returns true if the last comm request (xhr etc) to the server
     *     was successful based on status information in the comm object.
     * @returns {Boolean|undefined} True for successful communications.
     */

    var comm;

    comm = this.getCommObject();
    if (TP.isValid(comm)) {
        return TP.httpDidSucceed(comm);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.uri.CommURL.Inst.defineMethod('getCommObject',
function() {

    /**
     * @method getCommObject
     * @summary Returns the last communication channel object leveraged by the
     *     receiver.
     * @returns {XHR|WebSocket|undefined} The receiver's last communication
     *     object.
     */

    var comm,
        url;

    comm = this.$get('commObject');
    if (TP.isValid(comm)) {
        return comm;
    }

    url = this.getPrimaryURI();
    if (url !== this) {
        return url.getCommObject();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.uri.CommURL.Inst.defineMethod('getCommResponse',
function() {

    /**
     * @method getCommResponse
     * @summary Returns response data from the last communication object (xhr
     *     etc) used in the receiver's interactions with the server.
     * @returns {Object|undefined} The result data from the last comm request.
     */

    var comm;

    comm = this.getCommObject();
    if (TP.isValid(comm)) {
        return comm.response;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.uri.CommURL.Inst.defineMethod('getCommResponseText',
function() {

    /**
     * @method getCommResponseText
     * @summary Returns response text from the last communication object (xhr
     *     etc) used in the receiver's interactions with the server.
     * @returns {String|undefined} The result text from the last comm request.
     */

    var comm;

    comm = this.getCommObject();
    if (TP.isValid(comm)) {
        return comm.responseText;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.uri.CommURL.Inst.defineMethod('getCommResponseType',
function() {

    /**
     * @method getCommResponseType
     * @summary Returns the response type from the last communication object
     * (xhr etc) used in the receiver's interactions with the server.
     * @returns {String|undefined} A string from the XMLHttpRequest API with one
     *     of the following values: "", arraybuffer, blob, document, json, or
     *     text. The default ("") means a DOMString value just as with "text".
     */

    var comm;

    comm = this.getCommObject();
    if (TP.isValid(comm)) {
        return comm.responseType;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.uri.CommURL.Inst.defineMethod('getCommResponseXML',
function() {

    /**
     * @method getCommResponseXML
     * @summary Returns response XML from the last communication object (xhr
     *     etc) used in the receiver's interactions with the server.
     * @returns {String|undefined} The result XML from the last comm request.
     */

    var comm;

    comm = this.getCommObject();
    if (TP.isValid(comm)) {
        return comm.responseXML;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.uri.CommURL.Inst.defineMethod('getCommStatusCode',
function() {

    /**
     * @method getCommStatusCode
     * @summary Returns the last comm (usually xhr) status code from the
     *     receiver's interactions with the server.
     * @returns {Number|undefined} The status code from the last comm request.
     */

    var comm;

    comm = this.getCommObject();
    if (TP.isValid(comm)) {
        return comm.status;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.uri.CommURL.Inst.defineMethod('getCommStatusText',
function() {

    /**
     * @method getCommStatusText
     * @summary Returns the last comm (usually xhr) status text from the
     *     receiver's interactions with the server.
     * @returns {String|undefined} The status message from the last comm
     *     request.
     */

    var comm;

    comm = this.getCommObject();
    if (TP.isValid(comm)) {
        return comm.statusText;
    }

    return;
});

//  ========================================================================
//  TP.uri.HTTPURL
//  ========================================================================

/**
 * @type {TP.uri.HTTPURL}
 * @summary A subtype of TP.uri.URL specific to the HTTP scheme.
 */

//  ------------------------------------------------------------------------

TP.uri.URL.defineSubtype('HTTPURL');

TP.uri.HTTPURL.addTraits(TP.uri.CommURL);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  note that by setting this to http we allow https to match as well
TP.uri.HTTPURL.Type.defineConstant('SCHEME', 'http');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  HTTP URIs can support access via either sync or async requests
TP.uri.HTTPURL.Type.defineAttribute('supportedModes',
                                    TP.core.SyncAsync.DUAL_MODE);
TP.uri.HTTPURL.Type.defineAttribute('mode',
                                    TP.core.SyncAsync.ASYNCHRONOUS);

TP.uri.HTTPURL.registerForScheme('http');
TP.uri.HTTPURL.registerForScheme('https');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.uri.HTTPURL.Type.defineMethod('$getDefaultHandler',
function(aURI, aRequest) {

    /**
     * @method $getDefaultHandler
     * @summary Returns the default handler for a URI and request pair. For
     *     non-mapped HTTP urls this is the TP.uri.HTTPURLHandler type.
     * @param {TP.uri.URI|String} aURI The URI to obtain the default handler
     *     for.
     * @param {TP.sig.Request} aRequest The request whose values should inform
     *     the routing assignment.
     * @returns {TP.meta.uri.URIHandler} A TP.uri.URIHandler subtype type object
     *     or a type object conforming to that interface.
     */

    var tname,
        type;

    tname = TP.sys.cfg('uri.handler.http');
    if (TP.isEmpty(tname)) {
        return TP.uri.HTTPURLHandler;
    }

    type = TP.sys.getTypeByName(tname);
    if (TP.notValid(type)) {
        this.raise('TP.sig.TypeNotFound', tname);

        return TP.uri.HTTPURLHandler;
    }

    return type;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  cached redirection location
TP.uri.HTTPURL.Inst.defineAttribute('location');

//  note that there are 'scheme', 'path' and 'fragment' ivars on
//  TP.uri.URI / TP.uri.URL
TP.uri.HTTPURL.Inst.defineAttribute('user');
TP.uri.HTTPURL.Inst.defineAttribute('password');
TP.uri.HTTPURL.Inst.defineAttribute('hostname');
TP.uri.HTTPURL.Inst.defineAttribute('port');
TP.uri.HTTPURL.Inst.defineAttribute('query');
TP.uri.HTTPURL.Inst.defineAttribute('queryDict');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.uri.HTTPURL.Inst.defineMethod('$initURIComponents',
function(parts) {

    /**
     * @method $initURIComponents
     * @summary Performs any post-parsing initialization appropriate for the
     *     URI components which were parsed during scheme-specific parsing.
     * @param {TP.core.Hash} parts The parsed URI components.
     * @returns {TP.uri.HTTPURL} The receiver.
     */

    this.callNextMethod();

    //  NOTE: These 'set' calls use 'false' to avoid notification!! This is
    //  necessary when creating a URI, since otherwise the change notification
    //  mechanism will cause errors trying to get observations set up before
    //  everything is in place.

    this.set('user', parts.at('user'), false);
    this.set('password', parts.at('password'), false);

    this.set('hostname', parts.at('hostname'), false);
    this.set('port', parts.at('port'), false);

    this.set('path', parts.at('path'), false);
    this.set('fragment', parts.at('fragment'), false);
    this.set('query', parts.at('query'), false);
    this.set('queryDict', parts.at('queryDict'), false);

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.HTTPURL.Inst.defineMethod('$parseSchemeSpecificPart',
function(schemeSpecificString) {

    /**
     * @method $parseSchemeSpecificPart
     * @summary Parses inbound URI string content in a fashion specific to the
     *     scheme(s) being managed by the receiver.
     * @param {String} schemeSpecificString A String containing the
     *     "scheme-specific-part" of a URI.
     * @returns {TP.core.Hash} The parsed URI 'components'.
     */

    var str,

        natURL,
        dict,

        queryPart,
        queryDict;

    if (this.uri.startsWith('https')) {
        str = 'https:' + schemeSpecificString;
    } else if (this.uri.startsWith('http')) {
        str = 'http:' + schemeSpecificString;
    }

    natURL = new URL(str);

    dict = TP.hc(
            'source', str,
            'scheme', natURL.protocol.slice(-1),
            'authority', natURL.host,
            'userinfo', natURL.username + ':' + natURL.password,
            'user', natURL.username,
            'password', natURL.password,
            'hostname', natURL.hostname,
            'port', natURL.port,
            'relative', natURL.pathname,
            'path', natURL.pathname,
            'directory',
                natURL.pathname.slice(0, natURL.pathname.lastIndexOf('/') + 1),
            'file',
                natURL.pathname.slice(natURL.pathname.lastIndexOf('/') + 1),
            'query', natURL.search,
            'fragment', decodeURIComponent(natURL.hash.slice(1))
            );

    //  If we also got a query, construct a TP.core.Hash from it.
    if (TP.notEmpty(queryPart = dict.at('query'))) {
        queryDict = TP.core.Hash.fromString(queryPart);
        dict.atPut('queryDict', queryDict);
    }

    return dict;
});

//  ------------------------------------------------------------------------

TP.uri.HTTPURL.Inst.defineMethod('httpConnect',
function(aRequest) {

    /**
     * @method httpConnect
     * @summary Uses the receiver as a target URI and invokes an HTTP CONNECT
     *     with aRequest.
     * @param {TP.sig.Request} aRequest The original request being processed.
     * @returns {TP.sig.Response} The request's response object.
     */

    return TP.httpConnect(this.asString(), aRequest);
});

//  ------------------------------------------------------------------------

TP.uri.HTTPURL.Inst.defineMethod('httpDelete',
function(aRequest) {

    /**
     * @method httpDelete
     * @summary Uses the receiver as a target URI and invokes an HTTP DELETE
     *     with aRequest.
     * @param {TP.sig.Request} aRequest The original request being processed.
     * @returns {TP.sig.Response} The request's response object.
     */

    return TP.httpDelete(this.asString(), aRequest);
});

//  ------------------------------------------------------------------------

TP.uri.HTTPURL.Inst.defineMethod('httpGet',
function(aRequest) {

    /**
     * @method httpGet
     * @summary Uses the receiver as a target URI and invokes an HTTP GET
     *     with aRequest.
     * @param {TP.sig.Request} aRequest The original request being processed.
     * @returns {TP.sig.Response} The request's response object.
     */

    return TP.httpGet(this.asString(), aRequest);
});

//  ------------------------------------------------------------------------

TP.uri.HTTPURL.Inst.defineMethod('httpHead',
function(aRequest) {

    /**
     * @method httpHead
     * @summary Uses the receiver as a target URI and invokes an HTTP HEAD
     *     with aRequest.
     * @param {TP.sig.Request} aRequest The original request being processed.
     * @returns {TP.sig.Response} The request's response object.
     */

    return TP.httpHead(this.asString(), aRequest);
});

//  ------------------------------------------------------------------------

TP.uri.HTTPURL.Inst.defineMethod('httpOptions',
function(aRequest) {

    /**
     * @method httpOptions
     * @summary Uses the receiver as a target URI and invokes an HTTP OPTIONS
     *     with aRequest.
     * @param {TP.sig.Request} aRequest The original request being processed.
     * @returns {TP.sig.Response} The request's response object.
     */

    return TP.httpOptions(this.asString(), aRequest);
});

//  ------------------------------------------------------------------------

TP.uri.HTTPURL.Inst.defineMethod('httpPatch',
function(aRequest) {

    /**
     * @method httpPatch
     * @summary Uses the receiver as a target URI and invokes an HTTP PATCH
     *     with aRequest.
     * @param {TP.sig.Request} aRequest The original request being processed.
     * @returns {TP.sig.Response} The request's response object.
     */

    return TP.httpPatch(this.asString(), aRequest);
});

//  ------------------------------------------------------------------------

TP.uri.HTTPURL.Inst.defineMethod('httpPost',
function(aRequest) {

    /**
     * @method httpPost
     * @summary Uses the receiver as a target URI and invokes an HTTP POST
     *     with aRequest.
     * @param {TP.sig.Request} aRequest The original request being processed.
     * @returns {TP.sig.Response} The request's response object.
     */

    return TP.httpPost(this.asString(), aRequest);
});

//  ------------------------------------------------------------------------

TP.uri.HTTPURL.Inst.defineMethod('httpPut',
function(aRequest) {

    /**
     * @method httpPut
     * @summary Uses the receiver as a target URI and invokes an HTTP PUT
     *     with aRequest.
     * @param {TP.sig.Request} aRequest The original request being processed.
     * @returns {TP.sig.Response} The request's response object.
     */

    return TP.httpPut(this.asString(), aRequest);
});

//  ------------------------------------------------------------------------

TP.uri.HTTPURL.Inst.defineMethod('httpTrace',
function(aRequest) {

    /**
     * @method httpTrace
     * @summary Uses the receiver as a target URI and invokes an HTTP TRACE
     *     with aRequest.
     * @param {TP.sig.Request} aRequest The original request being processed.
     * @returns {TP.sig.Response} The request's response object.
     */

    return TP.httpTrace(this.asString(), aRequest);
});

//  ========================================================================
//  TP.uri.FileURL
//  ========================================================================

/**
 * @type {TP.uri.FileURL}
 * @summary A URL specific to file references.
 */

//  ------------------------------------------------------------------------

TP.uri.URL.defineSubtype('FileURL');

TP.uri.FileURL.addTraits(TP.uri.CommURL);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.uri.FileURL.Type.defineConstant('SCHEME', 'file');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  'file:' scheme is sync-only so configure for that
TP.uri.FileURL.Type.defineAttribute('supportedModes',
                                    TP.core.SyncAsync.SYNCHRONOUS);
TP.uri.FileURL.Type.defineAttribute('mode',
                                    TP.core.SyncAsync.SYNCHRONOUS);

TP.uri.FileURL.registerForScheme('file');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.uri.FileURL.Type.defineMethod('$getDefaultHandler',
function(aURI, aRequest) {

    /**
     * @method $getDefaultHandler
     * @summary Returns the default handler for a URI and request pair. For
     *     non-mapped HTTP urls this is the TP.uri.HTTPURLHandler type.
     * @param {TP.uri.URI|String} aURI The URI to obtain the default handler
     *     for.
     * @param {TP.sig.Request} aRequest The request whose values should inform
     *     the routing assignment.
     * @returns {TP.meta.uri.URIHandler} A TP.uri.URIHandler subtype type object
     *     or a type object conforming to that interface.
     */

    var tname,
        type;

    tname = TP.sys.cfg('uri.handler.file');
    if (TP.isEmpty(tname)) {
        return TP.uri.FileURLHandler;
    }

    type = TP.sys.getTypeByName(tname);
    if (TP.notValid(type)) {
        this.raise('TP.sig.TypeNotFound', tname);

        return TP.uri.FileURLHandler;
    }

    return type;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  note that there are 'scheme', 'path' and 'fragment' ivars on
//  TP.uri.URI / TP.uri.URL

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.uri.FileURL.Inst.defineMethod('$initURIComponents',
function(parts) {

    /**
     * @method $initURIComponents
     * @summary Performs any post-parsing initialization appropriate for the
     *     URI components which were parsed during scheme-specific parsing.
     * @param {TP.core.Hash} parts The parsed URI components.
     * @returns {TP.uri.FileURL} The receiver.
     */

    var thePath;

    this.callNextMethod();

    /*
    if (TP.notEmpty(thePath = parts.at('path')) &&
        thePath.startsWith('/')) {
        thePath = thePath.slice(1);
    }
    */

    //  NOTE: These 'set' calls use 'false' to avoid notification!! This is
    //  necessary when creating a URI, since otherwise the change notification
    //  mechanism will cause errors trying to get observations set up before
    //  everything is in place.

    this.set('path', thePath, false);

    //  generate the internal href
    this.asString();

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.FileURL.Inst.defineMethod('$parseSchemeSpecificPart',
function(schemeSpecificString) {

    /**
     * @method $parseSchemeSpecificPart
     * @summary Parses inbound URI string content in a fashion specific to the
     *     scheme(s) being managed by the receiver.
     * @param {String} schemeSpecificString A String containing the
     *     "scheme-specific-part" of a URI.
     * @returns {TP.core.Hash} The parsed URI 'components'.
     */

    this.callNextMethod();

    //  TODO TODO TODO TODO TODO
    //  TODO: relying on TP.core.Hash for parsing is a poor design, we
    //  should change that so the parsing is local to this type. Here, we
    //  invoke the parser directly because of the ambiguities with the style
    //  string parser.
    /* eslint-disable new-cap */
    return TP.core.Hash.URI_STRING_PARSER('file:' + schemeSpecificString);
    /* eslint-enable new-cap */
});

//  ------------------------------------------------------------------------

TP.uri.FileURL.Inst.defineMethod('$getPath',
function(url) {

    /**
     * @method $getPath
     * @summary Parses the url for the path portion as that concept is defined
     *     for the receiving type. Note that different URI types consider
     *     different parts of their HREF to be the 'path'.
     * @param {String} url The URI string to parse.
     * @returns {String} The path subset of the string provided.
     */

    var path;

    //  by default the 'path' is whatever comes after the scheme
    if (TP.sys.isWin()) {
        path = url.slice(url.indexOf(':///') + 4);
    } else {
        path = url.slice(url.indexOf('://') + 3);
    }

    return path;
});

//  ========================================================================
//  TP.uri.JSURI
//  ========================================================================

/**
 * @type {TP.uri.JSURI}
 * @summary A subtype of TP.uri.URI that stores a 'javascript:' URI. These
 *     URIs are used in web browsers when a JavaScript expression needs to be
 *     executed upon traversal of the URI. This type is also used as the content
 *     object for text/javascript MIME content.
 */

//  ------------------------------------------------------------------------

TP.uri.URI.defineSubtype('JSURI');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

/* eslint-disable no-script-url */
TP.uri.JSURI.Type.defineConstant('JSURI_REGEX', TP.rc('javascript:\\s*'));
/* eslint-enable no-script-url */

TP.uri.JSURI.Type.defineConstant('SCHEME', 'javascript');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  'javascript:' scheme is sync-only so configure for that
TP.uri.JSURI.Type.defineAttribute('supportedModes',
                                TP.core.SyncAsync.SYNCHRONOUS);
TP.uri.JSURI.Type.defineAttribute('mode',
                                TP.core.SyncAsync.SYNCHRONOUS);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.uri.JSURI.Inst.defineAttribute('jsSource');

TP.uri.JSURI.registerForScheme('javascript');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.uri.JSURI.Type.defineMethod('constructContentObject',
function(content, aURI) {

    /**
     * @method constructContentObject
     * @summary Returns a content object for the URI provided. This method is
     *     invoked as part of MIME-type specific handling for URIs vended as
     *     text/javascript or a similar MIME type specifying that their content
     *     is JavaScript source code.
     * @param {String} content The string content to process.
     * @param {TP.uri.URI} [aURI] The source URI.
     * @returns {String} The JavaScript source code in text form.
     */

    return content;
});

//  ------------------------------------------------------------------------

TP.uri.JSURI.Inst.defineMethod('$getPath',
function(url) {

    /**
     * @method $getPath
     * @summary Parses the url for the path portion as that concept is defined
     *     for the receiving type. Note that different URI types consider
     *     different parts of their HREF to be the 'path'.
     * @param {String} url The URI string to parse.
     * @returns {String} The path subset of the string provided.
     */

    //   There is no valid "path" concept in a javascript: URI.
    return '';
});

//  ------------------------------------------------------------------------

TP.uri.JSURI.Type.defineMethod('validate',
function(aString) {

    /**
     * @method validate
     * @summary Returns true if the string parameter is valid JavaScript. For
     *     security reasons this method currently defaults to true rather than
     *     actually executing the string.
     * @param {String} aString A string to test.
     * @returns {Boolean} Whether or not JavaScript code could be successfully
     *     evaluated from the supplied String.
     */

    //  TODO:   parse/tokenize looking for nasty security issues?
    return true;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.uri.JSURI.Inst.defineMethod('isPrimaryURI',
function() {

    /**
     * @method isPrimaryURI
     * @summary Returns true if the receiver is a primary URI, meaning it has
     *     no fragment portion and can store data. JavaScript URIs are always
     *     primary URIs, there is no concept of a fragment.
     * @returns {Boolean} True if the receiver is a primary URI.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.uri.JSURI.Inst.defineMethod('$parseSchemeSpecificPart',
function(schemeSpecificString) {

    /**
     * @method $parseSchemeSpecificPart
     * @summary Parses inbound URI string content in a fashion specific to the
     *     scheme(s) being managed by the receiver.
     * @param {String} schemeSpecificString A String containing the
     *     "scheme-specific-part" of a URI.
     * @returns {TP.core.Hash|undefined} The parsed URI 'components'.
     */

    //  TODO: Review this method - shouldn't we be returning a TP.core.Hash?

    //  NOTE that the concept of 'primary' and 'fragment' aren't relevant
    //  for this type, so we don't invoke the supertype method here, we set
    //  our primary href directly.
    this.$set('primaryLocation',
                this.$get('scheme') + ':' + schemeSpecificString);

    this.$set('jsSource',
                schemeSpecificString.strip(TP.uri.JSURI.JSURI_REGEX));

    return;
});

//  ------------------------------------------------------------------------

TP.uri.JSURI.Inst.defineMethod('$getPrimaryResource',
function(aRequest, filterResult) {

    /**
     * @method $getPrimaryResource
     * @summary Returns the result of evaluating the JS expression represented
     *     by the receiver. Note that while the async flag in aRequest is used
     *     to determine whether the return value is a TP.sig.Response object or
     *     the actual result there's no truly asynchronous processing occurring.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @param {Boolean} filterResult True if the resource result will be used
     *     directly and should be filtered to match any resultType definition
     *     found in the request. The default is false.
     * @returns {TP.sig.Response} A TP.sig.Response created with the resource's
     *     primary content set as its result.
     */

    var request,

        str,

        $$result,
        result,
        msg,
        response;

    request = this.constructRequest(aRequest);

    //  get rid of leading javascript: portion so we can eval the rest
    str = this.get('jsSource');
    try {
        //  TODO: security check
        /* eslint-disable no-eval */
        eval('$$result = ' + str);
        result = $$result;
    } catch (e) {
        msg = TP.sc('Error acquiring resource via: ') + str;
        request.fail(msg);
        result = TP.ec(e, msg);
    }

    if (TP.isTrue(filterResult) && TP.isValid(result)) {
        result = this.$getFilteredResult(result, request, false);
    }

    response = request.getResponse(result);
    request.complete(result);

    return response;
});

//  ------------------------------------------------------------------------

TP.uri.JSURI.Inst.defineMethod('isDirty',
function(aFlag, shouldSignal) {

    /**
     * @method isDirty
     * @summary Returns true if the receiver's content has changed since it was
     *     last loaded from its source URI or content data without being saved.
     * @param {Boolean} aFlag The new value to optionally set.
     * @param {Boolean} [shouldSignal=false] Should changes to the value be
     *     signaled?
     * @returns {Boolean} Whether or not the content of the receiver is 'dirty'.
     */

    //  We basically assume that a JS URI would always return new data. This
    //  isn't likely to be true obviously, but we effectively want JS URIs.
    return true;
});

//  ------------------------------------------------------------------------

TP.uri.JSURI.Inst.defineMethod('isLoaded',
function(aFlag) {

    /**
     * @method isLoaded
     * @summary Returns true if the receiver's content has been loaded either
     *     manually via a setContent or init, or by loading the receiver's URI
     *     location.
     * @param {Boolean} aFlag The new value to optionally set.
     * @returns {Boolean} Whether or not the content of the receiver is loaded.
     */

    //  A JavaScript URI is never considered loaded, it has to be able to
    //  refresh by default in all cases.
    return false;
});

//  ------------------------------------------------------------------------
//  Storage Management
//  ------------------------------------------------------------------------

TP.uri.JSURI.Inst.defineMethod('load',
function(aRequest) {

    /**
     * @method load
     * @summary For the most part, no-op for JSURIs.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request,
        url,
        handler;

    request = this.constructRequest(aRequest);

    //  rewriting means we'll get to the concrete URI for the receiver so we
    //  put the data where it really belongs
    url = this.rewrite(request);

    request.atPut('operation', 'load');

    //  NB: We hard-code 'TP.uri.URIHandler' as our handler here, since it
    //  really just completes the request properly and doesn't do much else. See
    //  that type for more information
    handler = TP.uri.URIHandler;

    return handler.load(url, request);
});

//  ------------------------------------------------------------------------

TP.uri.JSURI.Inst.defineMethod('delete',
function(aRequest) {

    /**
     * @method delete
     * @summary For the most part, a no-op for JSURIs.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request,
        url,
        handler;

    request = this.constructRequest(aRequest);

    //  rewriting means we'll get to the concrete URI for the receiver so we
    //  put the data where it really belongs
    url = this.rewrite(request);

    request.atPut('operation', 'delete');

    //  NB: We hard-code 'TP.uri.URIHandler' as our handler here, since it
    //  really just completes the request properly and doesn't do much else. See
    //  that type for more information
    handler = TP.uri.URIHandler;

    return handler.delete(url, request);
});

//  ------------------------------------------------------------------------

TP.uri.JSURI.Inst.defineMethod('save',
function(aRequest) {

    /**
     * @method save
     * @summary For the most part, a no-op for JSURIs.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request,
        url,
        handler;

    request = this.constructRequest(aRequest);

    //  rewriting means we'll get to the concrete URI for the receiver so we
    //  put the data where it really belongs
    url = this.rewrite(request);

    request.atPut('operation', 'save');

    //  NB: We hard-code 'TP.uri.URIHandler' as our handler here, since it
    //  really just completes the request properly and doesn't do much else. See
    //  that type for more information
    handler = TP.uri.URIHandler;

    return handler.save(url, request);
});

//  ========================================================================
//  TP.uri.WSURL
//  ========================================================================

/**
 * @type {TP.uri.WSURL}
 * @summary A subtype of TP.uri.URL specific to the WebSocket scheme.
 */

//  ------------------------------------------------------------------------

TP.uri.URL.defineSubtype('WSURL');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.uri.WSURL.Type.defineConstant('SCHEME', 'ws');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  WebSocket URIs can support only async requests
TP.uri.WSURL.Type.defineAttribute('supportedModes',
                                    TP.core.SyncAsync.ASYNCHRONOUS);
TP.uri.WSURL.Type.defineAttribute('mode',
                                    TP.core.SyncAsync.ASYNCHRONOUS);

TP.uri.WSURL.registerForScheme('ws');
TP.uri.WSURL.registerForScheme('wss');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  cached redirection location
TP.uri.WSURL.Inst.defineAttribute('webSocketObj');

//  note that there are 'scheme', 'path' and 'fragment' ivars on
//  TP.uri.URI / TP.uri.URL
TP.uri.WSURL.Inst.defineAttribute('hostname');
TP.uri.WSURL.Inst.defineAttribute('port');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.uri.WSURL.Inst.defineMethod('$initURIComponents',
function(parts) {

    /**
     * @method $initURIComponents
     * @summary Performs any post-parsing initialization appropriate for the
     *     URI components which were parsed during scheme-specific parsing.
     * @param {TP.core.Hash} parts The parsed URI components.
     * @returns {TP.uri.WSURL} The receiver.
     */

    this.callNextMethod();

    //  NOTE: These 'set' calls use 'false' to avoid notification!! This is
    //  necessary when creating a URI, since otherwise the change notification
    //  mechanism will cause errors trying to get observations set up before
    //  everything is in place.

    this.set('hostname', parts.at('hostname'), false);
    this.set('port', parts.at('port'), false);

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.WSURL.Inst.defineMethod('$parseSchemeSpecificPart',
function(schemeSpecificString) {

    /**
     * @method $parseSchemeSpecificPart
     * @summary Parses inbound URI string content in a fashion specific to the
     *     scheme(s) being managed by the receiver.
     * @param {String} schemeSpecificString A String containing the
     *     "scheme-specific-part" of a URI.
     * @returns {TP.core.Hash} The parsed URI 'components'.
     */

    this.callNextMethod();

    //  TODO TODO TODO TODO TODO
    //  TODO: relying on TP.core.Hash for parsing is a poor design, we
    //  should change that so the parsing is local to this type. Here, we
    //  invoke the parser directly because of the ambiguities with the style
    //  string parser.
    /* eslint-disable new-cap */
    return TP.core.Hash.URI_STRING_PARSER('ws:' + schemeSpecificString);
    /* eslint-enable new-cap */
});

//  ========================================================================
//  TP.uri.TIBETURL
//  ========================================================================

/**
 * @type {TP.uri.TIBETURL}
 * @summary A subtype of TP.uri.URI that stores a 'tibet:' URI. These URIs
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
 *     evaluating the remaining portion will access the context of the named
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
 */

//  ------------------------------------------------------------------------

TP.uri.URL.defineSubtype('TIBETURL');

TP.uri.TIBETURL.addTraits(TP.uri.CommURL);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  indexes into the match results from the url splitter regex
TP.uri.TIBETURL.Type.defineConstant('JID_INDEX', 1);
TP.uri.TIBETURL.Type.defineConstant('RESOURCE_INDEX', 2);
TP.uri.TIBETURL.Type.defineConstant('CANVAS_INDEX', 3);
TP.uri.TIBETURL.Type.defineConstant('URL_INDEX', 4);
TP.uri.TIBETURL.Type.defineConstant('PATH_INDEX', 5);
TP.uri.TIBETURL.Type.defineConstant('FRAGMENT_INDEX', 6);

TP.uri.TIBETURL.Type.defineConstant('SCHEME', 'tibet');

TP.uri.TIBETURL.registerForScheme('tibet');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the canvas (window) name referenced by this URI. this is only used when
//  the value is cacheable, meaning it was explicitly defined in the URI
TP.uri.TIBETURL.Inst.defineAttribute('canvasName');

//  a handle to any internally generated URI for file/http references which
//  are resolved from the original TIBET URL string
TP.uri.TIBETURL.Inst.defineAttribute('nestedURI');

//  a cached value for whether the instance's path and pointer components
//  are empty, which helps keep getResource running faster
TP.uri.TIBETURL.Inst.defineAttribute('uriKey');

//  cached copy of the portions of the TIBET URI, used to access canvas name and
//  other components of the virtual uri.
TP.uri.URI.Inst.defineAttribute('uriParts');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('init',
function(aURIString, aResource) {

    /**
     * @method init
     * @summary Initialize the instance. Note that once an instance is
     *     constructed the individual parts of the URI can't be altered,
     *     although variable references (such as uicanvas) may allow it to
     *     resolve to different concrete elements during its life.
     * @param {String} aURIString A String containing a proper URI.
     * @param {Object} [aResource] Optional value for the targeted resource.
     * @returns {TP.uri.TIBETURL} The receiver.
     */

    //  make sure we come in with tibet: scheme or that we add it
    if (TP.regex.TIBET_SCHEME.test(aURIString) &&
        TP.regex.TIBET_URL_SPLITTER.test(aURIString)) {
        return this.callNextMethod();
    } else if (TP.regex.VIRTUAL_URI_PREFIX.test(aURIString)) {
        //  URIs starting with ~ don't resolve to a canvas.
        return this.callNextMethod('tibet:///' + aURIString);
    } else {
        //  before we try to raise we need at least a uri slot.
        this.$set('uri', aURIString);

        return this.raise('TP.sig.InvalidURI',
                    'Invalid TIBET URL prefix or scheme: ' + aURIString);
    }
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('$initURIComponents',
function(parts) {

    /**
     * @method $initURIComponents
     * @summary Performs any post-parsing initialization appropriate for the
     *     URI components which were parsed during scheme-specific parsing. Note
     *     that TP.uri.URI's implementation ensures that the uri, scheme,
     *     primary, and fragment portions of a URI string will be set.
     * @param {TP.core.Hash} parts The parsed URI components.
     * @returns {TP.uri.TIBETURL|undefined} The receiver.
     */

    //  force ID expansion if it didn't already happen. this will also force
    //  our parts to be encached for us.
    if (TP.isEmpty(this.getID())) {
        //  If no ID could be produced then the URI isn't truly valid and we
        //  don't want to return a proper instance.
        return;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('asDumpString',
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output. TIBET URLs containing valid resource URIs typically respond
     *     with that string for compatibility with their file/http counterparts.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  concrete URI.
    if (TP.isEmpty(this.getCanvasName())) {
        return this.getConcreteURI().asDumpString(depth, level);
    }

    //  Otherwise, call up
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver. TIBET
     *     URLs containing valid resource URIs typically respond with that
     *     string for compatibility with their file/http counterparts.
     * @returns {String} The receiver in HTML string format
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  concrete URI.
    if (TP.isEmpty(this.getCanvasName())) {
        return this.getConcreteURI().asHTMLString();
    }

    //  Otherwise, call up
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  concrete URI.
    if (TP.isEmpty(this.getCanvasName())) {
        return this.getConcreteURI().asJSONSource();
    }

    //  Otherwise, call up
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Produces a pretty string representation of the receiver. TIBET
     *     URLs containing valid resource URIs typically respond with that
     *     string for compatibility with their file/http counterparts.
     * @returns {String} The receiver in pretty string format
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  concrete URI.
    if (TP.isEmpty(this.getCanvasName())) {
        return this.getConcreteURI().asPrettyString();
    }

    //  Otherwise, call up
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @method asString
     * @summary Returns a string representation of the receiver. TIBET URLs
     *     containing valid resource URIs typically respond with that string for
     *     compatibility with their file/http counterparts.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.uri.TIBETURL's String representation. The default is for
     *     TP.uri.TIBETURLs is false, which is different than for most types.
     * @returns {String} The receiver's String representation.
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  concrete URI.
    if (TP.isEmpty(this.getCanvasName())) {
        return this.getConcreteURI().asString(verbose);
    }

    //  Otherwise, call up
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver. TIBET
     *     URLs containing valid resource URIs typically respond with that
     *     string for compatibility with their file/http counterparts.
     * @returns {String} The receiver in XML string format
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  concrete URI.
    if (TP.isEmpty(this.getCanvasName())) {
        return this.getConcreteURI().asXMLString();
    }

    //  Otherwise, call up
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('getCanvas',
function() {

    /**
     * @method getCanvas
     * @summary Returns the canvas (window, frame, iframe) this URI references
     *     by traversing any optional 'paths' defined in our canvas name. If no
     *     canvas name is specified the canvas defaults to the current UI canvas
     *     for TIBET.
     * @returns {Window|undefined} The receiver's resource canvas.
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

TP.uri.TIBETURL.Inst.defineMethod('getCanvasName',
function() {

    /**
     * @method getCanvasName
     * @summary Returns the name of the canvas this URI refers to.
     * @returns {String} The receiver's resource canvas name.
     */

    var parts,
        name;

    //  our original split value is here
    parts = this.getURIParts();

    //  whole, jid, resource, canvas, path, pointer
    name = parts.at(TP.uri.TIBETURL.CANVAS_INDEX);

    if (TP.isEmpty(name)) {
        name = '';  //  leave empty, this URI doesn't specify a canvas.
    } else if (name === 'uicanvas' || name === 'UICANVAS') {
        return TP.sys.getUICanvasName();
    } else if (name === 'uiroot' || name === 'UIROOT') {
        return TP.sys.getUIRootName();
    }

    return name;
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('getID',
function() {

    /**
     * @method getID
     * @summary Returns the ID of the receiver, which for URIs is their unique
     *     URI value. In the case of TIBET URLs it is the fully-expanded version
     *     of the URI so all variants can be identified as the same instance.
     * @returns {String} The unique ID of the receiver.
     */

    var id,
        url,
        concrete,
        parts,
        canvas,
        loc;

    //  Make sure that, if the receiver is a prototype, we just return the value
    //  of the TP.ID slot. Otherwise, we're trying to get an ID from an object
    //  that represents only a partially formed instance for this type.
    if (TP.isPrototype(this)) {
        return this[TP.ID];
    }

    id = this.$get(TP.ID);

    //  the next question is do we have our *own* id (otherwise, we'll report
    //  the value inherited from the prototype)
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
    if (!TP.regex.TIBET_URL_SPLITTER.test(url)) {
        return TP.raise(url, 'TP.sig.InvalidURI', url);
    }

    parts = this.getURIParts();

    //  with parts in place we can ask for the canvas name
    canvas = this.getCanvasName();

    //  the second part is our resource URI, which may include a ~ that
    //  needs to be expanded before we have all the components of the ID
    if (TP.isEmpty(canvas)) {
        //  when we have a concrete uri we can ask it for the location
        concrete = this.getConcreteURI();
        if (TP.notValid(concrete)) {
            return TP.raise(url, 'TP.sig.InvalidURI', url);
        }
        loc = concrete.getLocation();
    } else {
        //  the path and pointer portions of our regex match are the
        //  location when there wasn't a valid resource URI value
        loc = TP.ifInvalid(parts.at(TP.uri.TIBETURL.PATH_INDEX), '') +
                TP.ifInvalid(parts.at(TP.uri.TIBETURL.FRAGMENT_INDEX), '');
    }

    //  build up the ID from the various parts
    id = TP.join('tibet:',
        TP.ifInvalid(parts.at(TP.uri.TIBETURL.JID_INDEX), ''), '/',
        TP.ifInvalid(parts.at(TP.uri.TIBETURL.RESOURCE_INDEX), ''), '/',
        canvas, '/',
        loc);

    //  cache our efforts so we don't have to do this again
    this.$set(TP.ID, id);

    return id;
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('getLocation',
function() {

    /**
     * @method getLocation
     * @summary Returns the URIs location, adjusting for any virtual URI
     *     components to return the actual resource URI value.
     * @returns {String} The receiver's location.
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  concrete URI.
    if (TP.isEmpty(this.getCanvasName())) {
        return this.getConcreteURI().getLocation();
    }

    //  supertype will compute a decent default value as an alternative.
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('getOriginalSource',
function() {

    /**
     * @method getOriginalSource
     * @summary Returns the 'original source' representation that the receiver
     *     was constructed with.
     * @returns {String} The receiver's original source.
     */

    //  For TP.uri.TIBETURLs, this is what the user originally initialized us
    //  with. It can be found at the 5th position in URI parts.
    return this.getURIParts().at(4);
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('getConcreteURI',
function(forceRefresh) {

    /**
     * @method getConcreteURI
     * @summary Return's the receiver's 'concrete' URI. For TP.uri.TIBETURL,
     *     this will return the concrete URI that the TIBETURL is a holder for.
     *     This is typically the file: or http: URI for the content the receiver
     *     references.
     * @param {Boolean} forceRefresh True will force any cached value for
     *     resource URI to be ignored.
     * @returns {TP.uri.TIBETURL|undefined} A concrete URI if the receiver
     *     resolves to one.
     */

    var resource,
        retVal,
        url,
        parts,
        path;

    //  When there's a canvas reference the receiver is a pointer to a DOM
    //  element and not an indirect reference to some other concrete URI. In
    //  that case we will grab the resource, get its global ID and then compute
    //  a new URL from that.
    if (TP.notEmpty(this.getCanvasName())) {

        //  NB: We assume 'async' of false here
        if (TP.isValid(resource = this.getResource().get('result'))) {
            //  If it's a Window, hand back a TIBET URI, but pointing to the
            //  'more concrete' URI that includes the Window's global ID.
            if (TP.isKindOf(resource, TP.core.Window)) {
                retVal = TP.uc('tibet://' + TP.gid(resource));
            } else {
                retVal = TP.uc(TP.gid(resource));
            }
        } else {
            return;
        }

        //  Make sure that we're not just ending up with ourself. Otherwise,
        //  we'll be back here again in an endless recursion.
        if (TP.isURI(retVal) && retVal.getLocation() !== this.getLocation()) {
            return retVal;
        }
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
    parts = this.getURIParts();
    if (TP.isEmpty(parts)) {
        path = TP.uriResolveVirtualPath(this.$get('uri'), true);
        parts = path.match(TP.regex.TIBET_URL_SPLITTER);
    }

    path = parts.at(TP.uri.TIBETURL.URL_INDEX);
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
                TP.warn('Invalid URI specification: ' + path) : 0;

            return;
        }
    }

    return url;
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('getPath',
function() {

    /**
     * @method getPath
     * @summary Returns the path portion of the receiver. For TIBET URLs this
     *     is the entire URI string.
     * @returns {String} A scheme-specific path string.
     */

    //  ensure a string
    return this.getLocation() || '';
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('getPrimaryLocation',
function() {

    /**
     * @method getPrimaryLocation
     * @summary Returns the primary resource's URIs location. This is the
     *     portion of the URI which isn't qualified by a fragment, the portion
     *     you can send to a server without causing an error.
     * @returns {String} The primary href as a String.
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  concrete URI.
    if (TP.isEmpty(this.getCanvasName())) {
        return this.getConcreteURI().getPrimaryLocation();
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('$getPrimaryResource',
function(aRequest, filterResult) {

    /**
     * @method $getPrimaryResource
     * @summary Returns the TIBET object referenced by the receiver. When the
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
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @param {Boolean} filterResult True if the resource result will be used
     *     directly and should be filtered to match any resultType definition
     *     found in the request. The default is false.
     * @returns {TP.sig.Response|undefined} A TP.sig.Response created with the
     *     resource's content set as its result.
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

        locRoot,
        pathRoot,

        tpwin,
        inst;

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
        parts = this.getURIParts();

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
        if ((url = this.getPrimaryURI()) !== this) {
            result = url.$get('resource');
        } else {
            result = this.$get('resource');
        }
        result = this.$getResourceResult(request, result, async, filter);

        if (TP.canInvoke(aRequest, 'complete')) {
            aRequest.complete(result);
        }

        if (TP.canInvoke(aRequest, 'getResponse')) {
            return aRequest.getResponse(result);
        } else {
            return this.constructRequest().getResponse(result);
        }
    }

    //  most common cases are a) loading external file content b)
    //  referencing a UI element via a barename, c) referring back into
    //  codeframe for an XML peer element via a barename. The second and
    //  third cases are the ones that require the most optimized access
    //  since the first involves IO latency that offsets anything else

    //  the original parts of the URI give us the best view of the real
    //  intent. these typically are split during initialization and cached
    parts = parts || this.getURIParts();

    //  with parts in place we can ask for the canvas name
    canvas = this.getCanvasName();

    path = parts.at(TP.uri.TIBETURL.PATH_INDEX);
    pointer = parts.at(TP.uri.TIBETURL.FRAGMENT_INDEX);

    //  this key helps drive switch logic down below to keep things a little
    //  clearer from a logic/branching perspective
    if (TP.notValid(key = this.$get('uriKey'))) {
        key = TP.join(TP.str(TP.isEmpty(path)),
                        '_',
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

            TP.ifWarn() ? TP.warn(err) : 0;

            request.fail(err);

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
                //      tibet://top.UIROOT.screen_0/javascript:globalVar
                //          becomes
                //      tibet:///javascript:top.UIROOT.screen_0.globalVar
                if (TP.notEmpty(this.getCanvasName())) {
                    //  Build a URL by using a TIBET URL scheme with a blank
                    //  canvas identifier, the canvas name and the current path
                    //  with the 'javascript:' bit sliced off.
                    url = TP.uc('tibet:///javascript:' +
                                this.getCanvasName() + '.' + path.slice(11));

                    //  This will always be synchronous - it's a 'javascript:'
                    //  URL.
                    result = url.getResource().get('result');

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
                request.fail(err);

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
                    (url = this.getPrimaryURI()) !== this) {

                    locRoot = TP.uriRoot(TP.documentGetLocation(win.document));
                    pathRoot = TP.uriRoot(path);

                    //  If our path root matches the current document location
                    //  root or our pointer is '#document', return the wrapped
                    //  Document.
                    if (locRoot === pathRoot || pointer === '#document') {
                        //  NB: We don't set the result's 'uri' here since
                        //  the result is the document and we probably don't
                        //  represent the document.
                        result = TP.dom.DocumentNode.construct(
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
                    result = TP.dom.DocumentNode.construct(win.document);

                    return this.$getResourceResult(request,
                                                    result,
                                                    async,
                                                    filter);
                }

            case 'true_false':

                //  pointer references window.document subset without
                //  constraining it to a particular file's content.

                //  NB: We don't set the result's 'uri' here since the
                //  result is the document and we probably don't represent
                //  the document.
                result = TP.dom.DocumentNode.construct(win.document);

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
                    inst = url.$getPrimaryResource(request, filter);
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

TP.uri.TIBETURL.Inst.defineMethod('getPrimaryURI',
function() {

    /**
     * @method getPrimaryURI
     * @summary Returns the actual resource URI used for content access. This
     *     may be the receiver or it may be the URI referencing the primary
     *     resource data for the receiver if the receiver has a fragment, or it
     *     may be an "embedded" URI in the case of schemes which support
     *     embedding URIs such as tibet:.
     * @returns {TP.uri.TIBETURL} The receiver's primary resource URI.
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  concrete URI.
    if (TP.isEmpty(this.getCanvasName())) {
        return this.getConcreteURI().getPrimaryURI();
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('getResource',
function(aRequest) {

    /**
     * @method getResource
     * @summary Returns a receiver-specific object representing the "secondary"
     *     resource being accessed (i.e. the resource referenced by the base
     *     resource path subset identified by any fragment portion. If there is
     *     no fragment this method returns the same value as
     *     $getPrimaryResource()).
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} A TP.sig.Response created with the requested
     *     content set as its result.
     */

    if (TP.isEmpty(this.getCanvasName())) {
        return this.getConcreteURI().getResource(aRequest);
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('$getResourceResult',
function(request, result, async, filter) {

    /**
     * @method $getResourceResult
     * @summary Handles common result processing for sync/async results.
     * @param {TP.sig.Request} request The original request being processed.
     * @param {Object} result The result data for the request.
     * @param {Boolean} async Whether the request is aynchronous.
     * @param {Boolean} filter True if the resource result will be used directly
     *     and should be filtered to match any resultType definition found in
     *     the request. The default is false.
     * @returns {TP.sig.Response} A TP.sig.Response created with the resource's
     *     content set as its result.
     */

    var resource,
        response;

    resource = result;

    if (TP.isValid(resource)) {
        if (TP.isTrue(filter)) {
            resource = this.$getFilteredResult(resource, request, false);
        }

        if (!this.isLoaded()) {
            this.$setPrimaryResource(resource, request);
        }
    }

    response = request.getResponse(resource);
    request.complete(resource);

    return response;
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('getURIParts',
function() {

    /**
     * @method getURIParts
     * @summary Returns the URI in split form.
     * @returns {String[]} The split parts.
     */

    var parts,
        uri;

    parts = this.$get('uriParts');
    if (TP.notEmpty(parts)) {
        return parts;
    }

    uri = this.$get('uri');

    //  Multiple choices here. May be tibet:, may by expanded.
    if (uri.indexOf('tibet:') === 0) {
        parts = uri.match(TP.regex.TIBET_URL_SPLITTER);
        this.$set('uriParts', parts);
    } else {
        parts = uri.match(TP.regex.URL_SPLITTER);
        this.$set('uriParts', parts);
    }

    return parts;
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('getWatched',
function() {

    /**
     * @method getWatched
     * @summary Returns whether the URI is watched or not. For TIBETURLs, this
     *     passes through to the concrete URI's 'watched' property.
     * @returns {Boolean} Whether or not the URI is watched.
     */

    return this.getConcreteURI().get('watched');
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('$parseSchemeSpecificPart',
function(schemeSpecificString) {

    /**
     * @method $parseSchemeSpecificPart
     * @summary Parses inbound URI string content in a fashion specific to the
     *     scheme(s) being managed by the receiver.
     * @param {String} schemeSpecificString A String containing the
     *     "scheme-specific-part" of a URI.
     * @returns {TP.core.Hash} The parsed URI 'components'.
     */

    //  TODO:   replace with logic from getID() and related parsing.
    this.callNextMethod();

    return;
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('httpConnect',
function(aRequest) {

    /**
     * @method httpConnect
     * @summary Uses the receiver as a target URI and invokes an HTTP CONNECT
     *     with aRequest.
     * @param {TP.sig.Request} aRequest The original request being processed.
     * @returns {TP.sig.Response} The request's response object.
     */

    if (this.isHTTPBased()) {
        return TP.httpConnect(this.asString(), aRequest);
    } else {
        this.raise('TP.sig.UnsupportedOperation', this.asString());
    }
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('httpDelete',
function(aRequest) {

    /**
     * @method httpDelete
     * @summary Uses the receiver as a target URI and invokes an HTTP DELETE
     *     with aRequest.
     * @param {TP.sig.Request} aRequest The original request being processed.
     * @returns {TP.sig.Response} The request's response object.
     */

    if (this.isHTTPBased()) {
        return TP.httpDelete(this.asString(), aRequest);
    } else {
        this.raise('TP.sig.UnsupportedOperation', this.asString());
    }
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('httpGet',
function(aRequest) {

    /**
     * @method httpGet
     * @summary Uses the receiver as a target URI and invokes an HTTP GET
     *     with aRequest.
     * @param {TP.sig.Request} aRequest The original request being processed.
     * @returns {TP.sig.Response} The request's response object.
     */

    if (this.isHTTPBased()) {
        return TP.httpGet(this.asString(), aRequest);
    } else {
        this.raise('TP.sig.UnsupportedOperation', this.asString());
    }
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('httpHead',
function(aRequest) {

    /**
     * @method httpHead
     * @summary Uses the receiver as a target URI and invokes an HTTP HEAD
     *     with aRequest.
     * @param {TP.sig.Request} aRequest The original request being processed.
     * @returns {TP.sig.Response} The request's response object.
     */

    if (this.isHTTPBased()) {
        return TP.httpHead(this.asString(), aRequest);
    } else {
        this.raise('TP.sig.UnsupportedOperation', this.asString());
    }
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('httpOptions',
function(aRequest) {

    /**
     * @method httpOptions
     * @summary Uses the receiver as a target URI and invokes an HTTP OPTIONS
     *     with aRequest.
     * @param {TP.sig.Request} aRequest The original request being processed.
     * @returns {TP.sig.Response} The request's response object.
     */

    if (this.isHTTPBased()) {
        return TP.httpOptions(this.asString(), aRequest);
    } else {
        this.raise('TP.sig.UnsupportedOperation', this.asString());
    }
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('httpPatch',
function(aRequest) {

    /**
     * @method httpPatch
     * @summary Uses the receiver as a target URI and invokes an HTTP PATCH
     *     with aRequest.
     * @param {TP.sig.Request} aRequest The original request being processed.
     * @returns {TP.sig.Response} The request's response object.
     */

    if (this.isHTTPBased()) {
        return TP.httpPatch(this.asString(), aRequest);
    } else {
        this.raise('TP.sig.UnsupportedOperation', this.asString());
    }
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('httpPost',
function(aRequest) {

    /**
     * @method httpPost
     * @summary Uses the receiver as a target URI and invokes an HTTP POST
     *     with aRequest.
     * @param {TP.sig.Request} aRequest The original request being processed.
     * @returns {TP.sig.Response} The request's response object.
     */

    if (this.isHTTPBased()) {
        return TP.httpPost(this.asString(), aRequest);
    } else {
        this.raise('TP.sig.UnsupportedOperation', this.asString());
    }
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('httpPut',
function(aRequest) {

    /**
     * @method httpPut
     * @summary Uses the receiver as a target URI and invokes an HTTP PUT
     *     with aRequest.
     * @param {TP.sig.Request} aRequest The original request being processed.
     * @returns {TP.sig.Response} The request's response object.
     */

    if (this.isHTTPBased()) {
        return TP.httpPut(this.asString(), aRequest);
    } else {
        this.raise('TP.sig.UnsupportedOperation', this.asString());
    }
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('httpTrace',
function(aRequest) {

    /**
     * @method httpTrace
     * @summary Uses the receiver as a target URI and invokes an HTTP TRACE
     *     with aRequest.
     * @param {TP.sig.Request} aRequest The original request being processed.
     * @returns {TP.sig.Response} The request's response object.
     */

    if (this.isHTTPBased()) {
        return TP.httpTrace(this.asString(), aRequest);
    } else {
        this.raise('TP.sig.UnsupportedOperation', this.asString());
    }
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('isDirty',
function(aFlag, shouldSignal) {

    /**
     * @method isDirty
     * @summary Returns true if the receiver's content has changed since it was
     *     last loaded from its source URI or content data without being saved.
     * @param {Boolean} aFlag The new value to optionally set.
     * @param {Boolean} [shouldSignal=false] Should changes to the value be
     *     signaled?
     * @returns {Boolean} Whether or not the content of the receiver is 'dirty'.
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  concrete URI.
    if (TP.isEmpty(this.getCanvasName())) {
        return this.getConcreteURI().isDirty(aFlag, shouldSignal);
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('isLoaded',
function(aFlag) {

    /**
     * @method isLoaded
     * @summary Returns true if the receiver's content has been loaded either
     *     manually via a setContent or init, or by loading the receiver's URI
     *     location.
     * @param {Boolean} aFlag The new value to optionally set.
     * @returns {Boolean} Whether or not the content of the receiver is loaded.
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  concrete URI.
    if (TP.isEmpty(this.getCanvasName())) {
        return this.getConcreteURI().isLoaded(aFlag);
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('isPrimaryURI',
function() {

    /**
     * @method isPrimaryURI
     * @summary Returns true if the receiver is a primary URI, meaning it has
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

TP.uri.TIBETURL.Inst.defineMethod('processRefreshedContent',
function() {

    /**
     * @method processRefreshedContent
     * @summary Invoked when remote resource changes have been loaded to provide
     *     the receiver with the chance to post-process those changes.
     * @returns {TP.uri.TIBETURL} The receiver.
     */

    var concreteURI;

    concreteURI = this.getConcreteURI();

    if (TP.isValid(concreteURI) && concreteURI !== this) {
        return concreteURI.processRefreshedContent();
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('register',
function() {

    /**
     * @method register
     * @summary Registers the instance under a common key.
     */

    TP.uri.URI.registerInstance(this, TP.uriInTIBETFormat(this.getLocation()));

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('load',
function(aRequest) {

    /**
     * @method load
     * @summary For this type, this method loads the receiver's concrete URI.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var concreteURI;

    concreteURI = this.getConcreteURI();

    if (TP.isValid(concreteURI) && concreteURI !== this) {
        return concreteURI.load(aRequest);
    }
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('delete',
function(aRequest) {

    /**
     * @method delete
     * @summary For this type, this method deletes the receiver's concrete URI.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var concreteURI;

    concreteURI = this.getConcreteURI();

    if (TP.isValid(concreteURI) && concreteURI !== this) {
        return concreteURI.delete(aRequest);
    }
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('save',
function(aRequest) {

    /**
     * @method save
     * @summary For this type, this method saves the receiver's concrete URI.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var concreteURI;

    concreteURI = this.getConcreteURI();

    if (TP.isValid(concreteURI) && concreteURI !== this) {
        return concreteURI.save(aRequest);
    }
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('setWatched',
function(shouldBeWatched) {

    /**
     * @method setWatched
     * @summary Sets whether the URI is watched or not. For TIBETURLs, this
     *     passes through to the concrete URI's 'watched' property.
     * @param {Boolean} shouldBeWatched Whether the URI should be watched or
     *     not.
     * @returns {TP.uri.TIBETURL} The receiver.
     */

    return this.getConcreteURI().set('watched', shouldBeWatched);
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('$setPrimaryResource',
function(aResource, aRequest) {

    /**
     * @method $setPrimaryResource
     * @summary Sets the receiver's resource object, the object TIBET will
     *     treat as the primary resource for any subsequent processing.
     * @param {Object} aResource The resource object to assign.
     * @param {TP.sig.Request|TP.core.Hash} aRequest A request containing
     *     optional parameters.
     * @returns {TP.uri.TIBETURL|TP.sig.Response} The receiver or a
     *     TP.sig.Response when the resource must be acquired in an async
     *     fashion prior to setting any fragment value.
     */

    var parts;

    parts = this.getURIParts();

    //  If the receiver has a non-empty canvas name, but an empty URL and empty
    //  fragment, then grab the Window matching the canvas name and use that as
    //  the resource. Otherwise, we end up setting a #document node for a
    //  TIBETURL that should be pointing at a Window.
    if (TP.notEmpty(parts.at(TP.uri.TIBETURL.CANVAS_INDEX)) &&
        TP.isEmpty(parts.at(TP.uri.TIBETURL.URL_INDEX)) &&
        TP.isEmpty(parts.at(TP.uri.TIBETURL.FRAGMENT_INDEX))) {

        return this.callNextMethod(
            TP.sys.getWindowById(parts.at(TP.uri.TIBETURL.CANVAS_INDEX)),
            aRequest);
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('updateHeaders',
function(headerData) {

    /**
     * @method updateHeaders
     * @summary TIBET URLs containing valid resource URIs respond to this
     *     method by updating the headers for that URI.
     * @param {Object} headerData A string, hash, or request object containing
     *     header data.
     * @returns {TP.uri.TIBETURL} The receiver.
     */

    //  TIBET URLs with no canvas are effectively simply aliases to the
    //  concrete URI.
    if (TP.isEmpty(this.getCanvasName())) {
        return this.getConcreteURI().updateHeaders(headerData);
    }

    //  No concept of headers for a UI target, just return.
    return this;
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('getRequestedResource',
function(aRequest) {

    /**
     * @method getRequestedResource
     * @summary TIBET URLs containing valid resource URIs respond to this
     *     method by updating the content cache for that URI.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {Object} The resource stored in the cache on completion.
     */

    var url;

    //  if we're just an alias for a concrete URL then we continue to look like
    //  a proxy for that reference in string form
    if ((url = this.getPrimaryURI()) !== this) {
        return url.getRequestedResource(aRequest);
    }

    if (TP.isValid(aRequest)) {
        return this.$getFilteredResult(this.$get('resource'), aRequest);
    } else {
        return this.$get('resource');
    }
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('watch',
function(aRequest) {

    /**
     * @method watch
     * @summary Watches for changes to the URLs remote resource, if the server
     *     that is supplying the remote resource notifies us when the URL has
     *     changed. For TIBETURLs, this passes through to the concrete URI's
     *     'watched' property.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    return this.getConcreteURI().watch(aRequest);
});

//  ------------------------------------------------------------------------

TP.uri.TIBETURL.Inst.defineMethod('unwatch',
function(aRequest) {

    /**
     * @method unwatch
     * @summary Removes any watches for changes to the URLs remote resource. See
     *     this type's 'watch' method for more information. For TIBETURLs, this
     *     passes through to the concrete URI's 'watched' property.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    return this.getConcreteURI().unwatch(aRequest);
});

//  ========================================================================
//  TP.uri.URIHandler
//  ========================================================================

/**
 * @type {TP.uri.URIHandler}
 * @summary TP.uri.URIHandler provides a top-level supertype for URI-specific
 *     handler classes.
 * @description When TIBET attempts to operate on a URI for load or save
 *     operations it first rewrites the URI and then directs the URI/operation
 *     pair to a handler type. The handler types are responsible for managing
 *     the URI's data in a scheme-specific way that can also respect request and
 *     URI parameter content as needed. One reason for URI handlers in TIBET is
 *     construction of stubs/mocks for web services testing and parallel
 *     development processes since they allow you to swap in a set of test
 *     handler types which simulate real operations.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('uri.URIHandler');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.uri.URIHandler.Type.defineMethod('load',
function(targetURI, aRequest) {

    /**
     * @method load
     * @summary Loads URI data content, returning the TP.sig.Response object
     *     used to manage the low-level service response.
     * @param {TP.uri.URI} targetURI The URI to load. Note that this call is
     *     typically made via the load call of a URI and so rewriting and
     *     routing have already occurred.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The response.
     */

    //  DB, File and HTTP urls have their own handlers. This default handler
    //  is typically leveraged only by javascript: and urn: resources whose
    //  data isn't really "loaded" from a particular resource location.

    return targetURI.$getPrimaryResource(aRequest);
});

//  ------------------------------------------------------------------------

TP.uri.URIHandler.Type.defineMethod('delete',
function(targetURI, aRequest) {

    /**
     * @method delete
     * @summary Deletes a URI entirely, returning the TP.sig.Response object
     *     used to manage the low-level service response.
     * @param {TP.uri.URI} targetURI The URI to delete. Note that this call is
     *     typically made via the delete call of a URI and so rewriting and
     *     routing have already occurred.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The response.
     */

    var request,
        response;

    TP.todo('Implement delete for non-file/http/db urls.');

    //  DB, File and HTTP urls have their own handlers. This default handler
    //  is typically leveraged only by javascript: and urn: resources whose
    //  data isn't really deleted from a particular resource location.

    //  fake success via request/response semantics for consistency
    request = targetURI.constructRequest(aRequest);
    response = request.getResponse();

    request.complete(true);

    return response;
});

//  ------------------------------------------------------------------------

TP.uri.URIHandler.Type.defineMethod('save',
function(targetURI, aRequest) {

    /**
     * @method save
     * @summary Saves URI data content. This is the default data persistence
     *     method for most URI content.
     * @description By creating alternative URI handlers and ensuring that URI
     *     routing can find them you can alter how data is managed for different
     *     URI instances. See TP.uri.URIRewriter and TP.uri.URIMapper for more
     *     information. Important keys include 'append', 'body', and 'backup',
     *     which define whether this save should append or write new content,
     *     what content is being saved, and whether a backup should be created
     *     if possible (for 'file' scheme uris).
     * @param {String|TP.uri.URI} targetURI A target URI.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The response.
     */

    var request,
        response;

    //  DB, File and HTTP urls have their own handlers. This default handler
    //  is typically leveraged only by javascript: and urn: resources whose
    //  data isn't really "saved" to a particular resource location.

    //  fake success via request/response semantics for consistency
    request = targetURI.constructRequest(aRequest);
    response = request.getResponse();

    request.complete(true);

    return response;
});

//  ========================================================================
//  TP.uri.URIRewriter
//  ========================================================================

/**
 * @type {TP.uri.URIRewriter}
 * @summary TP.uri.URIRewriter processes any uri.map.*.rewrite entries which
 *     match a particular URI based on that map entry's pattern value. This
 *     rewrite capability allows TIBET's URIs to work more like "keys" than
 *     "values". Rewrite ability is limited to simple URI "part substitution"
 *     by default. To perform more advanced operations you can create your own
 *     rewriter(s) or simply override the rewrite method of the desired URI.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('uri.URIRewriter');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.uri.URIRewriter.Type.defineMethod('rewrite',
function(aURI, aRequest) {

    /**
     * @method rewrite
     * @summary Rewrites the receiver based on any uri.map configuration data
     *     which matches the URI. The rewrite is limited to replacing specific
     *     portions of the uri with fixed strings.
     * @param {TP.uri.URI|String} aURI The URI to rewrite.
     * @param {TP.sig.Request} [aRequest] An optional request whose values may
     *     inform the rewrite.
     * @returns {TP.uri.URI} The true URI for the resource.
     */

    var uri,
        map,
        rewrites,
        str,
        scheme,
        ssp,
        parts,
        newuri;

    uri = TP.isString(aURI) ? TP.uri.URI.construct(aURI) : aURI;

    //  Return cached rewrite if found, avoiding additional overhead.
    newuri = uri.$get('$uriRewrite');
    if (TP.isValid(newuri)) {
        return newuri;
    }

    //  the request can decline rewriting via flag...check that first
    if (TP.isValid(aRequest) && TP.isTrue(aRequest.at('no_rewrite'))) {
        return uri;
    }

    //  capture the best uri map configuration data for the URI.
    map = TP.uri.URI.$getURIMap(uri);
    if (TP.isEmpty(map)) {
        //  No mappings means we can avoid overhead in the future.
        return uri;
    }

    rewrites = map.getKeys().filter(function(key) {
        return /\.rewrite\./.test(key);
    });

    if (TP.isEmpty(rewrites)) {
        return uri;
    }

    //  Pull the URI apart using scheme-specific parsing.
    str = TP.str(uri);
    scheme = str.slice(0, str.indexOf(':'));
    ssp = str.slice(str.indexOf(':') + 1);
    parts = uri.$parseSchemeSpecificPart(ssp);
    parts.atPut('scheme', scheme);

    //  At least one rewrite property so process them, updating any named
    //  portions in the parts list with the rewrite value.
    rewrites.forEach(
        function(key) {
            var slot,
                value;

            slot = key.slice(key.lastIndexOf('.') + 1);
            value = TP.sys.cfg(key);

            parts.atPut(slot, value);
        });

    //  Build a new URI using the updated parts.
    newuri = TP.uc(parts);

    uri.$set('$uriRewrite', newuri, false);

    return newuri;
});

//  ========================================================================
//  TP.uri.URIMapper
//  ========================================================================

/**
 * @type {TP.uri.URIMapper}
 * @summary TP.uri.URIMapper types manage mapping requests for URI operations
 *     to appropriate handlers. This is somewhat analogous to server-side
 *     front-controllers which examine a URI and determine which class should be
 *     invoked to perform the actual processing. The actual action processing in
 *     TIBET is done by TP.uri.URIHandler subtypes.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('uri.URIMapper');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.uri.URIMapper.Type.defineMethod('remap',
function(aURI, aRequest) {

    /**
     * @method remap
     * @summary Locates and returns the proper TP.uri.URIHandler type for the
     *     URI and request pair provided. The handler type defaults to the type
     *     returned by the uri's getDefaultHandler method.
     * @param {TP.uri.URI} aURI The URI to map the request for.
     * @param {TP.sig.Request} aRequest The request whose values should inform
     *     the routing assignment.
     * @returns {TP.meta.uri.URIHandler} A TP.uri.URIHandler subtype type object
     *     that can handle the request for the supplied URI.
     */

    var uri,
        map,
        handler,
        type;

    uri = TP.isString(aURI) ? TP.uri.URI.construct(aURI) : aURI;

    //  the request can decline rewriting via flag...check that first
    if (TP.isValid(aRequest) && TP.isTrue(aRequest.at('no_remap'))) {
        return uri;
    }

    //  Return cached type if found, avoiding additional overhead.
    type = uri.$get('$uriHandler');
    if (TP.isValid(type)) {
        return type;
    }

    //  capture the best uri map configuration data for the URI.
    map = TP.uri.URI.$getURIMap(uri);
    if (TP.notValid(map) || TP.isEmpty(map)) {
        type = uri.$getDefaultHandler(aRequest);
        uri.$set('$uriHandler', type, false);

        return type;
    }

    handler = map.at('urihandler');
    if (TP.isEmpty(handler)) {
        type = uri.$getDefaultHandler(aRequest);
        uri.$set('$uriHandler', type, false);

        return type;
    }

    type = TP.sys.getTypeByName(handler);
    if (TP.notValid(type)) {
        TP.ifWarn() ?
            TP.warn('Unable to load handler: ' + handler) : 0;

        TP.ifTrace() && TP.$DEBUG && TP.$VERBOSE ?
            TP.trace('Returning default handler for instance.') : 0;

        type = uri.$getDefaultHandler(aRequest);
        uri.$set('$uriHandler', type, false);

        return type;
    }

    TP.ifTrace() && TP.$DEBUG && TP.$VERBOSE ?
        TP.trace('Found mapping \'' + handler + '\' for uri: ' + uri) : 0;

    //  went to some trouble to come up with this, so cache it for next time
    uri.$set('$uriHandler', type, false);

    return type;
});

//  ========================================================================
//  TP.uri.URIRouter
//  ========================================================================

/**
 * @type {TP.uri.URIRouter}
 * @summary TP.uri.URIRouter types process changes to the client URL and
 *     respond by triggering an appropriate handler either directly or
 *     indirectly via signaling. A URIRouter is typically triggered from the
 *     current application history object in response to URI changes.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('uri.URIRouter');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.uri.URIRouter.Type.defineAttribute('BEST_ROUTE_SORT',
function(a, b) {
    var aMatch,
        bMatch;

    aMatch = a.first();
    bMatch = b.first();

    //  First criteria is number of parts matches.
    if (aMatch.length > bMatch.length) {
        return -1;
    } else if (aMatch.length < bMatch.length) {
        return 1;
    } else {
        //  Second criteria is length of the full match string...but we exempt
        //  the '/.*/' pattern from this consideration since it's a universal
        //  match that should only trigger as a last resort.
        if (a.last().at('pattern').toString() === '/.*/') {
            return 1;
        } else if (b.last().at('pattern').toString() === '/.*/') {
            return -1;
        }

        if (aMatch.first().length > bMatch.first().length) {
            return -1;
        } else if (aMatch.first().length < bMatch.first().length) {
            return 1;
        } else {
            //  All else being equal last definition wins.
            return -1;
        }
    }
});

/**
 * An array of path-matching patterns to be processed coupled to a function
 * to use for translating matched URLs and any token names for parameters.
 * @type {Array<RegExp, Function, String[]>}
 */
TP.uri.URIRouter.Type.defineAttribute('processors');

/**
 * The route name to use for the "Root" or "/" route. Default is 'Home'.
 * @type {String}
 */
TP.uri.URIRouter.Type.defineAttribute('root', TP.sys.cfg('route.root', 'Home'));

/**
 * The list of route names that we've visited.
 * @type {String[]}
 */
TP.uri.URIRouter.Type.defineAttribute('visited', TP.ac());

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.uri.URIRouter.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    this.$set('processors', TP.ac());

    //  Always need a route to match "anything" as our backstop. If no routes
    //  are ever defined this routine should still produce something reasonable.
    this.definePath(/.*/, this.processMatch.bind(this));

    //  Define the root pattern route for "empty paths".
    this.definePath(/^\/$/, this.get('root'));

    //  Configure routing data from cfg() parameters.
    this.$configureRoutes();

    return;
});

//  ------------------------------------------------------------------------

TP.uri.URIRouter.Type.defineMethod('compilePattern',
function(pattern) {

    /**
     * @method compilePattern
     * @summary Converts a pattern into a fully-functional regular expression
     *     for use in route matching and returns the pattern and a list of token
     *     names to assign to matched positions. The resulting data is used to
     *     detect matching routes and to process them to ensure proper names are
     *     assigned to any token segments.
     * @param {String|RegExp} pattern The pattern to process.
     * @exception {TP.sig.InvalidParameter} When pattern isn't a String.
     * @returns {Array<String,String[]>} An array containing the pattern and
     *     zero or more string names for embedded token values being matched.
     */

    var str,
        regex,
        parts,
        mappedParts,
        names;

    if (TP.isRegExp(pattern)) {
        return TP.ac(pattern, TP.ac());
    }

    if (!TP.isString(pattern)) {
        this.raise('InvalidParameter', pattern);
    }

    names = TP.hc();

    if (pattern.charAt(0) === '/') {
        if (pattern.last() === '/') {
            regex = RegExp.construct(pattern);
            if (TP.notValid(regex)) {
                this.raise('InvalidRegExp', pattern);
            }
            return TP.ac(regex, names);
        }
        str = pattern.slice(1);
    } else {
        str = pattern;
    }

    //  TODO:   need to parse rather than split to avoid embedded / impact. Done
    //  properly we could potentially mix regex, token, and "normal" segments.
    parts = str.split('/');

    mappedParts = parts.map(
            function(item, index) {
                var re,
                    reParts;

                //  Check for a token pattern of this name.
                if (item.charAt(0) === ':') {

                    names.atPut(index, item.slice(1));
                    re = TP.sys.cfg('route.tokens.' + item.slice(1));

                    if (TP.notEmpty(re)) {
                        reParts = TP.stringRegExpComponents(re);
                        return '(' + reParts.first() + ')';
                    } else {
                        return '([^/]*?)';
                    }
                }

                //  NOTE we capture each item, even when static, to keep
                //  indexing and name construction functional.
                return '(' + item + ')';
            });

    //  don't put leading / on if pattern didn't have it...
    str = pattern.charAt(0) === '/' ? '\\/' : '';
    str += mappedParts.join('\\/');

    regex = RegExp.construct(str);
    if (TP.notValid(regex)) {
        this.raise('InvalidRegExp', str);
    }

    return TP.ac(regex, names);
});

//  ------------------------------------------------------------------------

TP.uri.URIRouter.Type.defineMethod('$configureRoutes',
function() {

    /**
     * @method $configureRoutes
     * @summary Configures the routes from the tokens and paths that are in the
     *     cfg() data. If the route cfg() data is altered, this method should be
     *     called to update internal structures.
     * @returns {TP.meta.uri.URIRouter} The receiver.
     */

    var cfg,
        thisref,
        keys;

    thisref = this;

    //  process config-based token definitions
    cfg = TP.sys.cfg('route.tokens');
    if (TP.notEmpty(cfg)) {
        keys = TP.keys(cfg);
        keys.forEach(
                function(key) {
                    var val;

                    val = cfg.at(key);
                    thisref.defineToken(key.replace('route.tokens.', ''), val);
                });
    }

    //  process config-based path-to-routename definitions
    cfg = TP.sys.cfg('route.paths');
    if (TP.notEmpty(cfg)) {
        keys = TP.keys(cfg);
        keys.forEach(
                function(key) {
                    var val;

                    val = cfg.at(key);
                    thisref.definePath(key.replace('route.paths.', ''), val);
                });
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URIRouter.Type.defineMethod('definePath',
function(pattern, signalOrProcessor, processor) {

    /**
     * @method definePath
     * @summary Expresses interest in a specific URL pattern, optionally
     *     defining a function used to produce the signal and payload values to
     *     be fired when the pattern is matched by the routing engine.
     * @param {String|RegExp} pattern The string or regular expression to match.
     * @param {String|Function} signalOrProcessor Either a signal name to use
     *     for the path when matched, or a path processor function.
     * @param {Function} [processor=this.processMatch] A function taking a path,
     *     match result, and token names which should function as a replacement
     *     for the default processMatch function of the router for this path.
     * @exception {TP.sig.InvalidRoute} When pattern isn't either a RegExp or
     *     cannot be processed from the supplied pattern String.
     * @exception {TP.sig.InvalidParameter} When signalOrProcessor isn't a
     *     String or a Function.
     * @returns {Object} A route entry consisting of pattern, signal, processor,
     *     and parameter names/positions.
     */

    var result,
        regex,
        names,
        signal,
        func,
        entry,
        processors,
        index;

    //  We need patterns to be in regex form and to watch for tokens so we
    //  process any string values into regular expression form.
    result = this.compilePattern(pattern);
    regex = result.at(0);
    names = result.at(1);

    //  Exception will have raised during processing, just exit.
    if (TP.notValid(regex)) {
        return this.raise('InvalidRoute',
            'Unable to produce RegExp for path/pattern ' + pattern);
    }

    //  Check param 2 for either signal name or processor function.
    if (TP.isString(signalOrProcessor)) {
        signal = signalOrProcessor;
        func = processor;
    } else if (TP.isFunction(signalOrProcessor)) {
        func = signalOrProcessor;
    } else if (TP.isValid(signalOrProcessor)) {
        return this.raise('InvalidParameter',
            'Should provide signal name or path processor function: ' +
            signalOrProcessor);
    }

    //  Default the processor function to our standard one.
    if (TP.notValid(func)) {
        func = this.processMatch.bind(this);
    }

    //  NOTE we push the new route onto the front so we iterate from most recent
    //  to oldest route definition.
    entry = TP.hc('pattern', regex,
                    'signal', signal,
                    'processor', func,
                    'parameters', names);

    //  If a pattern is already identical in the list then replace it, otherwise
    //  push the new pattern into place.
    processors = this.get('processors');
    index = TP.NOT_FOUND;
    processors.some(
            function(item, i) {
                if (TP.equal(item.at('pattern'), regex)) {
                    index = i;
                    return true;
                }

                return false;
            });

    if (index !== TP.NOT_FOUND) {
        processors.atPut(index, entry);
    } else {
        processors.unshift(entry);
    }

    return entry;
});

//  ------------------------------------------------------------------------

TP.uri.URIRouter.Type.defineMethod('defineToken',
function(token, pattern) {

    /**
     * @method defineToken
     * @summary Associates a token name with a pattern used to match the value
     *     for that token. Any time that token is used in a route the pattern
     *     will be substituted for the token and any matched value will be
     *     provided to the route under the token name.
     * @param {String} token The name of the token being described.
     * @param {String|RegExp} pattern The string or regular expression to match.
     * @exception {TP.sig.InvalidToken} When the supplied token isn't a String.
     * @exception {TP.sig.InvalidPattern} When the supplied pattern isn't a
     *     RegExp.
     * @returns {TP.meta.uri.URIRouter} The receiver.
     */

    var regex;

    if (!TP.isString(token)) {
        this.raise('InvalidToken', token);
    }

    regex = pattern;
    if (!TP.isRegExp(regex)) {
        regex = TP.rc(pattern);
        if (!TP.isRegExp(regex)) {
            this.raise('InvalidPattern', pattern);
        }
    }

    TP.sys.setcfg('route.tokens.' + token, TP.str(regex));

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URIRouter.Type.defineMethod('getLastRoute',
function() {

    /**
     * @method getLastRoute
     * @summary Returns the last route the application was set to. If the
     *     application hasn't yet been set to a specific route this method
     *     returns the 'route.root' or 'root' value as the default value.
     * @returns {String} The route, or route.root if no last route exists.
     */

    var hist,
        loc;

    hist = TP.sys.getHistory();
    loc = hist.getLastLocation();

    if (TP.notValid(loc)) {
        return this.get('root');
    }

    return this.getRoute(loc);
});

//  ------------------------------------------------------------------------

TP.uri.URIRouter.Type.defineMethod('getRoute',
function(aURI) {

    /**
     * @method getRoute
     * @summary Returns the currently active route, if any. Note that when the
     *     application is currently on the home page the route is set by the
     *     root property even though that value will not be visible in the URI
     *     fragment path. On any other URI if the fragment path is empty the
     *     route is empty.
     * @param {TP.uri.URI|String} [aURI=top.location] The URI to test. Defaults
     *     to the value of TP.uriNormalize(top.location.toString()).
     * @returns {String|undefined} The route name or empty string.
     */

    var route,
        path,
        home,
        url;

    if (TP.isValid(aURI)) {
        url = TP.uriNormalize(TP.str(aURI));
    } else {
        url = TP.uriNormalize(TP.sys.getHistory().getLocation());
    }

    path = TP.uriFragmentPath(url);

    //  Ignore fragments that don't start with a /, they're anchors not routes.
    if (path && path.charAt(0) !== '/') {
        return;
    }

    if (path === '/' || TP.isEmpty(path)) {

        //  Compare against home page to see if this is a match.
        home = TP.uriExpandPath(TP.sys.getHomeURL());
        if (TP.uriHead(TP.uriExpandHome(url)) === TP.uriHead(home)) {
            route = this.get('root') || 'Home';
        }

    } else {

        //  Process the route against any registered route matchers.
        route = this.processRoute(path);
        if (TP.notEmpty(route)) {
            //  Route matches are returned as an array containing the route name
            //  and a hash of route parameters. We just want the name for now.
            return route.at(0);
        }

        //  If not matched just remove any leading '/'. Hopefully the route is
        //  simple enough to pass.
        route = path.charAt(0) === '/' ? path.slice(1) : path;
    }

    return route;
});

//  ------------------------------------------------------------------------

TP.uri.URIRouter.Type.defineMethod('getRouteSignalName',
function(hash, usemap) {

    /**
     * @method getRouteSignalName
     * @summary Produces the best signal name from a processor result hash (the
     *     return value from processMatch/processResult). This means looking for
     *     a specified name and optionally any remapping of that name in the
     *     configuration route.map.{route} entries if any.
     * @param {TP.core.Hash} hash The result hash from a route processor
     *     function. Normally has 'route', 'signal', and 'parameters' keys.
     * @param {Boolean} usemap Should mapping be used? Default is true.
     * @returns {String} The signal name.
     */

    var route,
        routeKey,
        config,
        signame,
        configInfo,
        info;

    if (TP.notValid(hash)) {
        return this.raise('InvalidParameter', hash);
    }

    //  Use explicit signal name or synthetic name plus 'Route' suffix.
    signame = hash.at('signal');
    signame = TP.ifInvalid(signame, hash.at('route') + 'Route');

    if (TP.isFalse(usemap)) {
        return signame;
    }

    //  If usemap wasn't turned off explicitly see if the name provided has been
    //  remapped in the route maps, if any.
    route = hash.at('route');
    routeKey = 'route.map.' + route;
    config = TP.sys.cfg(routeKey);

    if (TP.notEmpty(config)) {
        if (TP.isString(config)) {
            configInfo = TP.json2js(TP.reformatJSToJSON(config));
            if (TP.isEmpty(configInfo)) {
                TP.error('InvalidObject',
                    'Unable to build config data from entry: ' + config);
                return this.getRouteSignalName(hash, false);
            }
            TP.sys.setcfg(routeKey, configInfo);
        } else {
            configInfo = config;
        }
    }

    if (TP.isEmpty(configInfo)) {
        return signame;
    }

    info = configInfo.at(routeKey + '.signal');
    info = TP.ifInvalid(info, configInfo.at('signal'));
    if (TP.notEmpty(info)) {
        signame = info;
    }

    return signame;
});

//  ------------------------------------------------------------------------

TP.uri.URIRouter.Type.defineMethod('getRouteControllerType',
function() {

    /**
     * @method getRouteControllerType
     * @summary Returns the route controller type that will be used for whatever
     *     the receiver considers to be the current route.
     * @description The controller type is computed thusly:
     *     1. If the current route doesn't have a route map entry, the
     *     TP.core.RouteController type will be returned.
     *     2. If the route map entry has a '.controller' entry, then that will
     *     be used as the type name.
     *     3. If the route map entry has no '.controller', then a type name will
     *     be computed by using 'APP.' + the project name + '.' + the route in
     *     title case + 'Controller'.
     *     4. If no type object can be found by using the type name from the
     *     above steps, TP.core.RouteController will be returned.
     * @returns {TP.meta.*|TP.meta.core.Controller} A computed controller type.
     */

    var route,
        routeKey,
        config,
        configInfo,
        controllerName,
        controller,
        appDefault,
        defaulted;

    controllerName = 'APP.' + TP.sys.cfg('project.name') + '.' +
        'RouteController';
    appDefault = TP.sys.getTypeByName(controllerName);

    route = this.getRoute();
    if (TP.isEmpty(route)) {
        return TP.ifInvalid(appDefault, TP.core.RouteController);
    }

    //  See if the value is a route configuration key.
    routeKey = 'route.map.' + route;
    config = TP.sys.cfg(routeKey);

    if (TP.isEmpty(config)) {
        //  NOTE we effectively skip using 'map' here and roll up such that the
        //  later lookup ends up being for 'route.controller' as a very
        //  high-level generic controller lookup.
        routeKey = 'route';
        config = TP.sys.cfg(routeKey);
        if (TP.isEmpty(config)) {
            return TP.ifInvalid(appDefault, TP.core.RouteController);
        }
    }

    //  If we got real config data, then turn it into real JSON if it isn't
    //  already.
    if (TP.isString(config)) {
        configInfo = TP.json2js(TP.reformatJSToJSON(config));
        if (TP.isEmpty(configInfo)) {
            this.raise('InvalidObject',
                        'Unable to build config data from entry: ' + config);

            return TP.ifInvalid(appDefault, TP.core.RouteController);
        }
        TP.sys.setcfg(routeKey, configInfo);
    } else {
        configInfo = config;
    }

    //  Try to obtain a controller type name
    controllerName = configInfo.at(routeKey + '.controller');
    controllerName = TP.ifInvalid(controllerName, configInfo.at('controller'));

    //  If there was no controller type name entry, default one by concatenating
    //  'APP' with the project and route name and the word 'Controller'.
    if (TP.isEmpty(controllerName)) {
        controllerName = 'APP.' +
                            TP.sys.cfg('project.name') +
                            '.' +
                            route.asTitleCase() +
                            'Controller';
        defaulted = true;
    }

    //  See if the controller is a type name.
    controller = TP.sys.getTypeByName(controllerName);

    if (TP.notValid(controller)) {
        //  Note here how we only warn if the controller name was specified and
        //  not generated here.
        TP.ifWarn() && !defaulted ?
            TP.warn('InvalidRouteController', controllerName, 'for',
                routeKey + '.controller') : 0;
    }

    return TP.ifInvalid(controller,
        TP.ifInvalid(appDefault, TP.core.RouteController));
});

//  ------------------------------------------------------------------------

TP.uri.URIRouter.Type.defineMethod('processMatch',
function(signal, match, names) {

    /**
     * @method processMatch
     * @summary Invoked when a defined path is matched. This function provides a
     *     default processor for definePath which can produce a signal
     *     name and payload for the majority of use cases.
     * @param {String} [signal] An optional signal name to be used.
     * @param {String[]} match The "match" Array returned by RegExp match()
     *     calls. The first slot is the "full match" while any parenthesized
     *     capture portions will populate slots 1 through N.
     * @param {String[]} names An array of token names for any named path
     *     segments in the pattern which matched the path.
     * @returns {Array<String, TP.core.Hash>} An ordered pair containing the
     *     route name and hash containing parameters from the match.
     */

    var parts,
        route,
        name,
        params;

    params = TP.hc();

    //  Only a full match value, no parameterized/captured sections.
    if (match.getSize() === 1) {

        route = match.at(0).slice(1);
        params.atPut('route', route);
        parts = route.split('/');

        name = parts.reduce(
                function(prev, current, index, array) {

                    //  Treat identifiers as signal name segments.
                    if (TP.regex.JS_IDENTIFIER.test(current)) {
                        return prev + current.asTitleCase();
                    }

                    //  Treat everything else with a real value like an
                    //  argument.
                    params.atPut('arg' + params.getSize(), current);

                    return prev;

                },
                '');
    } else {

        //  Throw away the full-match portion. This will also shift the list so
        //  our naming indexes should resolve correctly.
        match.shift();

        name = match.reduce(
                function(prev, current, index, array) {
                    var token;

                    token = names.at(index);
                    if (TP.notEmpty(token)) {
                        //  Found a named parameter segment.
                        params.atPut(token, current);
                    } else if (TP.regex.JS_IDENTIFIER.test(current)) {
                        return prev + current.asTitleCase();
                    } else {
                        params.atPut('arg' + params.getSize(), current);
                    }
                    return prev;

                },
                '');
    }

    return TP.hc('route', TP.ifEmpty(signal, name),
        'signal', signal, 'parameters', params);
});

//  ------------------------------------------------------------------------

TP.uri.URIRouter.Type.defineMethod('processRoute',
function(path) {

    /**
     * @method processRoute
     * @summary Processes a route, searching for the best matching route.
     *     If the route matches a path pattern the associated processor function
     *     is invoked to convert the route into a signal name/payload pair.
     * @param {String} path The URL fragment path segment (route) to process.
     * @exception {TP.sig.RouteProcessingException} When the system throws an
     *     Error by attempting to navigate to the route.
     * @returns {Array<String, TP.core.Hash>|undefined} The signal name/payload
     *     pair.
     */

    var processors,
        matches,
        best,
        match,
        entry,
        signal,
        processor,
        parameters,
        result;

    processors = this.get('processors');
    matches = TP.ac();

    //  First step is finding all patterns that match the inbound
    //  fragment/route.
    processors.forEach(
            function(mapping) {
                var pattern,
                    arr;

                pattern = mapping.at('pattern');
                arr = pattern.match(path);

                if (TP.notEmpty(arr)) {
                    matches.push(TP.ac(arr, mapping));
                }
            });

    //  TODO:   make the sort here configurable. Maybe by weight but maybe by
    //          simple definition order, etc.
    matches.sort(TP.uri.URIRouter.BEST_ROUTE_SORT);

    best = matches.first();
    if (TP.isEmpty(best)) {
        return;
    }

    match = best.first();
    entry = best.last();

    signal = entry.at('signal');
    processor = entry.at('processor');
    parameters = entry.at('parameters');

    try {
        result = processor(signal, match, parameters);
    } catch (e) {
        this.raise('RouteProcessingException', e);
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.uri.URIRouter.Type.defineMethod('route',
function(aURIOrPushState, aDirection) {

    /**
     * @method route
     * @summary Checks a URI for potentially routable changes and triggers the
     *     appropriate response to any changes found. This method is invoked in
     *     response to popstate events and whenever TIBET is asked to push or
     *     replace state on the native history object.
     * @param {String|Object} aURIOrPushState The full URI which should be
     *     processed for routing or a push state object containing that URI.
     *     Keys of interest in the push state are 'url' and 'pushed'.
     * @param {String} [aDirection] An optional direction hint provided by some
     *     invocation pathways. It is always used when available.
     * @fires {RouteEnter} If the URI has changed the fragment path (route).
     * @fires {RouteExit} If the URI has changed the fragment path (route).
     * @fires {RouteFinalize} If the URI has changed the fragment path (route).
     * @exception {TP.sig.InvalidOperation} When an operation cannot be computed
     *     by comparing the old route parameters from the new route parameters.
     * @returns {TP.meta.uri.URIRouter} The receiver.
     */

    var history,
        direction,
        last,
        lastParts,
        state,
        url,
        urlParts,
        canvas,
        fragPath,
        result,
        signame,
        payload,
        type,
        signal,
        lastFragmentPath,
        lastRoute,
        guard,
        home,
        routeKey,
        config,
        configInfo,
        reroute,
        deeproot,
        urlParams,
        lastParams,
        paramDiff,
        bootParams,
        route,
        visited;

    //  Report what we're being asked to route.
    if (TP.sys.cfg('log.routes')) {
        TP.debug('route(\'' + TP.str(aURIOrPushState) + '\');');
    }

    history = TP.sys.getHistory();

    //  ---
    //  Determine direction so we know what to compare
    //  ---

    direction = TP.ifEmpty(aDirection, history.get('direction'));
    switch (direction) {
        case 'back':
            last = TP.ifEmpty(history.get('lastURI'),
                                history.getNextLocation());
            break;
        case 'forward':
            last = TP.ifEmpty(history.get('lastURI'),
                                history.getLastLocation());
            break;
        case 'replace':
            last = history.get('lastURI');
            break;
        default:
            //  Oops. Shouldn't be here...except if we're starting up.
            if (TP.sys.hasStarted()) {
                TP.warn('Invalid route direction.');
            }
            break;
    }

    //  Clear the direction and URI so we have to reset/recompute with each
    //  change and don't end up working from obsolete data.
    history.set('direction', null);
    history.set('lastURI', null);

    if (TP.isString(aURIOrPushState)) {
        url = aURIOrPushState;
        state = {};
    } else {
        state = aURIOrPushState;
        url = state.url;
    }

    //  For our expansion testing and history tracking we want a fully-expanded
    //  and normalized version of the URL here.
    url = TP.str(url);
    url = TP.uriExpandPath(url);
    url = decodeURIComponent(url);

    //  The pushState handlers in TIBET don't push homepage URLs directly, they
    //  always short to '/' or the launch URL. We need to actually setLocation
    //  with a real URI for the related home page tho so we convert here.
    if (TP.notEmpty(last) &&
        (TP.$$nested_loader || url === '/' ||
            TP.uriHead(url) === TP.uriHead(TP.sys.getLaunchURL()))) {

        //  Clear any flag regarding loading the index or other loader page.
        //  Those are all considered variations on 'load the home page'.
        TP.$$nested_loader = false;

        url = TP.uriExpandHome(url);

        //  Normalize last as well so we can compare apples to apples.
        last = TP.uriExpandHome(last);
    }

    //  No change? No work to do.
    if (last === url) {
        return this;
    }

    //  ---
    //  Compare paths to determine what aspect(s) changed
    //  ---

    urlParts = TP.uriDecompose(url);
    if (TP.notEmpty(last)) {
        lastParts = TP.uriDecompose(last);
    }

    //  ---
    //  If root domain change we reboot...normally.
    //  ---

    if (TP.isValid(lastParts) &&
        urlParts.at('root') !== lastParts.at('root')) {
        //  TODO: could verify subdomains etc. here.
        if (TP.uriNormalize(top.location.toString()) !== url) {
            top.location = url;
        }

        return this;
    }

    //  ---
    //  If base params changed only the server can determine what to do.
    //  ---

    if (TP.isValid(lastParts) &&
        urlParts.at('baseParams') !== lastParts.at('baseParams')) {
        if (TP.uriNormalize(top.location.toString()) !== url) {
            top.location = url;
        }

        return this;
    }

    //  ---
    //  If fragment (boot) params change we reboot...sometimes
    //  ---

    if (TP.isValid(lastParts) &&
            urlParts.at('fragmentParams') !== lastParts.at('fragmentParams')) {

        //  Goal is to see if any boot parameters actually changed so we diff
        //  the two and then scan for keys in the diff that include boot.
        urlParams = urlParts.at('fragmentParams');
        lastParams = lastParts.at('fragmentParams');
        paramDiff = TP.hc(lastParams).deltas(TP.hc(urlParams));

        if (TP.sys.cfg('log.routes')) {
            TP.debug('client param change(\'' +
                TP.str(paramDiff) + '\');');
        }

        //  Find any boot-related key. We only need to find one to restart.
        bootParams = paramDiff.detect(
                            function(pair) {
                                return pair.first().startsWith('boot.');
                            });

        //  If a boot-related parameter changed restart, otherwise update.
        if (TP.notEmpty(bootParams)) {
            top.location = url;
        } else {
            //  If we just altered other values then use setcfg to update.
            paramDiff.perform(
                        function(triple) {
                            var operation,
                                value;

                            operation = triple.last();
                            switch (operation) {
                                case TP.INSERT:
                                    TP.sys.setcfg(triple.first(), triple.at(1));
                                    break;
                                case TP.UPDATE:
                                    TP.sys.setcfg(triple.first(), triple.at(1));
                                    break;
                                case TP.DELETE:
                                    value = triple.at(1);
                                    if (TP.isTrue(value)) {
                                        TP.sys.setcfg(triple.first(), false);
                                    } else if (TP.isFalse(value)) {
                                        TP.sys.setcfg(triple.first(), true);
                                    } else {
                                        //  No way to do this. We don't track
                                        //  "defaults".
                                        void 0;
                                    }
                                    break;
                                default:
                                    return this.raise('InvalidOperation',
                                                        operation);
                            }
                        });
        }

        return this;
    }

    //  ---
    //  If base path changed but not root domain it's a canvas uri.
    //  ---

    canvas = TP.sys.getUICanvas();

    //  Tricky part here is that we have to watch for comparisons regarding '/'
    //  and or launch with the home page. Those aren't considered "different".
    if (TP.isValid(lastParts)) {

        home = TP.uriExpandPath(TP.sys.getHomeURL());

        //  if basePath was '/' that's essentially the index/home page. We
        //  update last so a comparison below will see homepage and '/' as the
        //  same URI.
        if (TP.isEmpty(lastParts.at('basePath'))) {
            lastParts.atPut('basePath', TP.uriBasePath(home));
        }
    }

    if (TP.isValid(lastParts) &&
        urlParts.at('basePath') !== lastParts.at('basePath')) {

        //  Update the canvas if not currently displaying the proposed page.
        if (canvas.getLocation() !== TP.uriHead(url)) {
            canvas.setLocation(TP.uriHead(url));

            //  If we reset the base and we're in fragment_only mode then we
            //  need to adjust the fragment to keep up with what was pushed
            //  rather than what is in the actual URL.
            if (TP.notFalse(TP.sys.cfg('route.fragment_only'))) {
                fragPath = urlParts.at('basePath');
                if (fragPath === TP.uriBasePath(home)) {
                    fragPath = urlParts.at('fragmentPath');
                } else {
                    if (TP.notEmpty(TP.uriExtension(fragPath))) {
                        fragPath = fragPath.replace(
                                    '.' + TP.uriExtension(fragPath),
                                    '');
                    }
                }
            }
        }
    }

    if (TP.notValid(fragPath)) {
        fragPath = urlParts.at('fragmentPath');
    }

    //  ---
    //  If fragment path changed it's a route
    //  ---

    //  Run the route through our route matching process to see if there's a
    //  matcher for it.
    result = this.processRoute(fragPath);
    if (TP.notEmpty(result)) {
        route = result.at('route');
    } else {
        //  No processed result. Remove the leading '/' for checks we need to
        //  run below for type names, urls, etc.
        route = fragPath.slice(1);
    }

    if (TP.isEmpty(route)) {
        return this;
    }

    if (TP.sys.cfg('log.routes')) {
        TP.debug('checking \'' + route + '\' route configuration...');
    }

    //  See if the value is a route configuration key.
    routeKey = 'route.map.' + route;
    config = TP.sys.cfg(routeKey);

    if (TP.notEmpty(config)) {

        if (TP.sys.cfg('log.routes')) {
            TP.debug('route \'' + route + '\' mapped to: ' + TP.str(config));
        }

        if (TP.isString(config)) {
            configInfo = TP.json2js(TP.reformatJSToJSON(config));
            if (TP.isEmpty(configInfo)) {
                this.raise('InvalidObject',
                    'Unable to build config data from entry: ' + config);
                return this;
            }
            TP.sys.setcfg(routeKey, configInfo);
        } else {
            configInfo = config;
        }

        //  Check for redirection. If found, update to that route immediately.
        reroute = configInfo.at(routeKey + '.reroute');
        reroute = TP.ifInvalid(reroute, configInfo.at('reroute'));
        if (TP.notEmpty(reroute)) {
            if (reroute.charAt(0) !== '#') {
                if (reroute.charAt(0) !== '/') {
                    TP.go2('#/' + reroute);
                } else {
                    TP.go2('#' + reroute);
                }
            } else {
                TP.go2(reroute);
            }

            return this;
        }

        reroute = configInfo.at(routeKey + '.redirect');
        reroute = TP.ifInvalid(reroute, configInfo.at('redirect'));
        if (TP.notEmpty(reroute)) {
            TP.go2(reroute);

            return this;
        }

    } else {
        configInfo = TP.hc();
    }

    //  Deal with deep link issues. Not all routes can be linked directly so if
    //  this is the first route (no last route in history) it has to be one that
    //  is flagged as a deeproot.
    if (TP.notValid(last)) {

        deeproot = configInfo.at(routeKey + '.deeproot');
        deeproot = TP.ifInvalid(deeproot, configInfo.at('deeproot'));
        if (deeproot !== true) {

            //  Not a deep link? Route to the application home.
            TP.go2('/');

            //  Make sure that, either way we navigate, that the history's last
            //  valid index also gets set to 0. This way, any movement forward
            //  will be trapped.
            TP.core.History.set('lastValidIndex', 0);
        } else {

            //  The current route is a deeproot. Make sure that the history's
            //  last valid index is the same as its index.
            TP.core.History.set('lastValidIndex', TP.core.History.get('index'));
        }
    }

    //  If the route changed be sure to refresh the controller list.
    TP.sys.getApplication().refreshControllers();

    //  ---
    //  Route Signaling
    //  ---

    payload = TP.isValid(result) ? result.at('parameters') : TP.hc();

    //  Support remapping route name to a different signal, but ensure that
    //  signal follows our standard rules for signal names specific to routes
    //  unless a specific one came back from the result set earlier.
    signame = this.getRouteSignalName(result);

    //  Determine the signal type, falling back as needed since expandSignalName
    //  will return TP.sig. as a default prefix.
    type = TP.sys.getTypeByName(signame);

    //  If that type couldn't be found, try the same local signal name, but with
    //  a root namespace of 'APP.' instead of 'TP.'
    if (!TP.isType(type)) {

        //  APP.sig.*
        signame = signame.replace(/^TP\./, 'APP.');
        type = TP.sys.getTypeByName(signame);

        //  If that type couldn't be found, then change the non-root namespace
        //  from 'sig' to the name of the project.
        if (!TP.isType(type)) {
            //  APP.{project.name}.*
            signame = signame.replace(
                        /\.sig\./,
                        '.' + TP.sys.cfg('project.name') + '.');
            type = TP.sys.getTypeByName(signame);
        }
    }

    //  Build the signal instance we'll fire and set its name as needed.
    if (TP.isType(type)) {
        signal = type.construct(payload);
    } else {

        //  Couldn't find a valid signal type above, so we just use
        //  TP.sig.RouteFinalize as the type and set a 'spoofed' signal name
        //  using the same algorithm as above.
        signal = TP.sig.RouteFinalize.construct(payload);
        signame = this.getRouteSignalName(result);
        signal.setSignalName(signame);
    }

    //  For origin we use ANY since all routes are from 'top' anyway. This
    //  also helps avoid multiple dispatch for origin differences.
    signal.setOrigin(TP.ANY);

    if (TP.sys.cfg('log.routes')) {
        TP.info('Signaling: ' + signal.getSignalName() + ' with: ' +
                    TP.ifEmpty(
                        TP.str(signal.getPayload()),
                        '{}'));
    }

    payload.atPut('route', route);

    //  If there are parts of a 'last route', then use them to populate
    //  information about the last route into the signal payload.
    if (TP.notEmpty(lastParts)) {
        lastFragmentPath = lastParts.at('fragmentPath');

        //  If there was a last route fragment, then 'process' it (to provide
        //  results consistent with when it was the current route) and put that
        //  into the signal payload.
        if (TP.notEmpty(lastFragmentPath)) {
            lastRoute = this.processRoute(lastFragmentPath);
            payload.atPut('lastroute', lastRoute);
        }
    }

    //  Now, we first a series of 3 signals matching the routing sequence:

    //  Fire a RouteExit signal, using the last route that was set (this method
    //  is being executed *after* the route has been set - the browsers provide
    //  no mechanism for trapping *before* a route has been navigated to). Note
    //  here how we append 'RouteExit' onto that for consistency with routing
    //  signal naming.
    guard = TP.sig.RouteExit.construct(payload);
    guard.setSignalName(this.getLastRoute() + 'RouteExit');
    guard.fire();

    //  Fire a RouteEnter signal, using the current route that is being set.
    //  Note here how we append 'RouteEnter' onto that for consistency with
    //  routing signal naming.
    guard = TP.sig.RouteEnter.construct(payload);
    guard.setSignalName(route + 'RouteEnter');
    guard.fire();

    //  Fire the signal that we computed above, which should be an instance of
    //  either RouteFinalize or a subtype of RouteFinalize.
    signal.fire();

    //  Now that we're done servicing the route we need to capture the route in
    //  the list of visited routes. Note how we unique the list since we might
    //  have already been through here.
    visited = this.get('visited');
    visited.push(route);
    visited.unique();

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.URIRouter.Type.defineMethod('setRoute',
function(aRoute) {

    /**
     * @method setRoute
     * @summary Updates the fragment path portion which defines the current
     *     route in TIBET terms. Any boot parameters on the existing URL are
     *     preserved by this call.
     * @description Routes in TIBET are signified by the "fragment path" portion
     *     of the URI which we define as the section of the URI fragment prior
     *     to any '?' which sets off the "fragment parameters" (aka boot
     *     parameters). Changes to this section of the URI result in a Route
     *     signal being fired so application logic can respond to route changes.
     * @param {String} aRoute The route information.
     * @returns {String} The route as set into TIBET's history object.
     */

    var route,
        home,
        loc,
        path,
        parts;

    //  Normalize route name ensuring it's got the leading '/' which
    //  differentiates it from an anchor when on the URL.
    route = TP.str(aRoute);
    if (route.charAt(0) !== '/') {
        route = '/' + route;
    }

    //  Normalize Home to just the root path.
    if (route === '/Home' || route === '/home') {
        route = '/';
    }

    //  Capture the page we're currently viewing in the canvas.
    loc = TP.core.History.getLocation();

    //  If we're routing home but not showing the home page we need to update.
    if (route === '/' || TP.isEmpty(route)) {

        //  Compare against home page to see if this is a match.
        home = TP.uriExpandPath(TP.sys.getHomeURL());

        if (TP.uriHead(TP.uriExpandHome(loc)) !== TP.uriHead(home)) {
            TP.sys.getHistory().pushLocation(home);

            return home;
        }
    }

    //  If we're about to set the same route don't bother.
    path = TP.uriFragmentPath(loc);
    if (route === path) {
        if (TP.sys.cfg('log.routes')) {
            TP.trace('setRoute ignoring duplicate route setting of: ' + route);
        }

        return route;
    }

    //  Rebuild a version of the current URI with the new route portion.
    parts = TP.uriDecompose(loc);
    parts.atPut('fragmentPath', route);
    route = TP.uriCompose(parts);

    TP.sys.getHistory().pushLocation(route);

    return route;
});

//  ========================================================================
//  TP.uri.FileURLHandler
//  ========================================================================

TP.uri.URIHandler.defineSubtype('FileURLHandler');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.uri.FileURLHandler.Type.defineMethod('load',
function(targetURI, aRequest) {

    /**
     * @method load
     * @summary Loads URI data content, returning the TP.sig.Response object
     *     used to manage the low-level service response.
     * @param {TP.uri.URI} targetURI The URI to load. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response|undefined} The request's response object.
     */

    var subrequest,
        targetLoc,
        response;

    //  reuse the incoming request's payload/parameters but don't use that
    //  instance so we can manage complete/fail logic more effectively.
    subrequest = targetURI.constructSubrequest(aRequest);

    //  most supported browsers can handle at least loading from the file
    //  system via an XMLHttpRequest if nothing else, but just in case....
    if (!TP.canInvoke(TP, '$fileLoad')) {
        this.raise('TP.sig.UnsupportedOperation');
        if (TP.canInvoke(aRequest, 'fail')) {
            aRequest.fail('Unsupported operation.');
        }
        return;
    }

    if (!TP.canInvoke(targetURI, 'getLocation')) {
        this.raise('TP.sig.InvalidURI');
        if (TP.canInvoke(aRequest, 'fail')) {
            aRequest.fail('Invalid URI: ' + targetURI);
        }

        return;
    }

    //  rewriting happens prior to handler lookup, so we just want the
    //  concrete resource URI location so we can load it.
    targetLoc = targetURI.getLocation();

    subrequest.atPutIfAbsent('async', false);
    subrequest.atPutIfAbsent('shouldReport', false);

    //  the low-level file call will potentially complete an incoming
    //  request and we need that to not happen without ensuring headers
    //  and content cache are updated...
    subrequest.defineMethod(
            'completeJob',
            function(aResult) {

                var result;

                result = aResult;

                //  update the target's header and content information, in
                //  that order so that any content change signaling happens
                //  after headers are current.
                targetURI.updateHeaders(subrequest);

                //  NOTE we call both the getRequestedResource and
                //  setPrimaryResource methods here. File URLs don't go through
                //  the low-level HTTP handlers so they need both halves of the
                //  former updateResourceCache method to be called here.
                result = targetURI.getRequestedResource(subrequest);
                targetURI.$setPrimaryResource(result, subrequest);

                subrequest.$wrapupJob('Succeeded', TP.SUCCEEDED, result);

                if (TP.canInvoke(aRequest, 'complete')) {
                    //  Use the return value from cache update since it's
                    //  the "best form" the cache/result check could
                    //  produce. The data will be filtered higher up for
                    //  requests that care.
                    aRequest.complete(result);
                }
            });

    subrequest.defineMethod(
            'failJob',
            function(aFaultString, aFaultCode, aFaultInfo) {

                var info,
                    subrequests;

                info = TP.hc(aFaultInfo);
                if (TP.isValid(subrequests = info.at('subrequests'))) {
                    subrequests.push(subrequest);
                } else {
                    subrequests = TP.ac(subrequest);
                    info.atPut('subrequests', subrequests);
                }

                //  update the target's header and content information, in
                //  that order so that any content change signaling happens
                //  after headers are current.
                targetURI.updateHeaders(subrequest);

                //  Ensure the URI value is cleared. We don't want it to be
                //  retained if the process failed.
                targetURI.$setPrimaryResource(undefined);

                subrequest.$wrapupJob('Failed', TP.FAILED);

                if (TP.canInvoke(aRequest, 'fail')) {
                    aRequest.fail(aFaultString, aFaultCode, info);
                }
            });

    //  do the work of loading content. for file operations this call is
    //  synchronous and returns the actual data
    TP.$fileLoad(targetLoc, subrequest);

    //  Note: We do *not* set the result for these responses here.
    //  complete() already did that in the call above. If we do that again
    //  here, we'll undo any wrapping or filtering.
    if (TP.canInvoke(aRequest, 'getResponse')) {
        response = aRequest.getResponse();
    } else {
        response = subrequest.getResponse();
    }

    //  return the response object so it can pass up the chain
    return response;
});

//  ------------------------------------------------------------------------

TP.uri.FileURLHandler.Type.defineMethod('delete',
function(targetURI, aRequest) {

    /**
     * @method delete
     * @summary Deletes a URI entirely, returning the TP.sig.Response object
     *     used to manage the low-level service response.
     * @param {TP.uri.URI} targetURI The URI to delete. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response|undefined} The request's response object.
     */

    var subrequest,
        targetLoc,
        response;

    //  reuse the incoming request's payload/parameters but don't use that
    //  instance so we can manage complete/fail logic more effectively.
    subrequest = targetURI.constructSubrequest(aRequest);

    //  only IE and Moz currently support file deletes so if we're down
    //  to this handler we're hopefully on one of those browsers :)
    if (!TP.canInvoke(TP, '$fileDelete')) {
        this.raise('TP.sig.UnsupportedOperation');
        if (TP.canInvoke(aRequest, 'fail')) {
            aRequest.fail('Unsupported operation.');
        }
        return;
    }

    if (!TP.canInvoke(targetURI, 'getLocation')) {
        this.raise('TP.sig.InvalidURI');
        if (TP.canInvoke(aRequest, 'fail')) {
            aRequest.fail('Invalid URI: ' + targetURI);
        }
        return;
    }

    subrequest.defineMethod(
            'completeJob',
            function(aResult) {

                if (TP.isTrue(aResult)) {
                    targetURI.isDirty(false, true);
                    targetURI.isLoaded(false);

                    subrequest.$wrapupJob('Succeeded', TP.SUCCEEDED, aResult);

                    if (TP.canInvoke(aRequest, 'complete')) {
                        aRequest.complete(aResult);
                    }
                } else if (TP.canInvoke(aRequest, 'fail')) {

                    subrequest.$wrapupJob('Failed', TP.FAILED);

                    aRequest.fail();
                }
            });

    subrequest.defineMethod(
            'failJob',
            function(aFaultString, aFaultCode, aFaultInfo) {

                var info,
                    subrequests;

                info = TP.hc(aFaultInfo);
                if (TP.isValid(subrequests = info.at('subrequests'))) {
                    subrequests.push(subrequest);
                } else {
                    subrequests = TP.ac(subrequest);
                    info.atPut('subrequests', subrequests);
                }

                subrequest.$wrapupJob('Failed', TP.FAILED);

                if (TP.canInvoke(aRequest, 'fail')) {
                    aRequest.fail(aFaultString, aFaultCode, info);
                }
            });

    //  rewriting happens prior to handler lookup, so we just want the
    //  concrete resource URI location so we can save it.
    targetLoc = targetURI.getLocation();

    TP.$fileDelete(targetLoc, subrequest);

    //  Note: We do *not* set the result for these responses here.
    //  complete() already did that in the call above. If we do that again
    //  here, we'll undo any wrapping or filtering.
    if (TP.canInvoke(aRequest, 'getResponse')) {
        response = aRequest.getResponse();
    } else {
        response = subrequest.getResponse();
    }

    return response;
});

//  ------------------------------------------------------------------------

TP.uri.FileURLHandler.Type.defineMethod('save',
function(targetURI, aRequest) {

    /**
     * @method save
     * @summary Saves URI data content. This is the default data persistence
     *     method for most URI content.
     * @description By creating alternative URI handlers and ensuring that URI
     *     routing can find them you can alter how data is managed for different
     *     URI instances. See TP.uri.URIRewriter and TP.uri.URIMapper for more
     *     information. Important keys include 'append', 'body', and 'backup',
     *     which define whether this save should append or write new content,
     *     what content is being saved, and whether a backup should be created
     *     if possible (for 'file' scheme uris).
     * @param {TP.uri.URI} targetURI The URI to save. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response|undefined} The request's response object.
     */

    var subrequest,
        targetLoc,
        content,
        resp,
        response;

    //  reuse the incoming request's payload/parameters but don't use that
    //  instance so we can manage complete/fail logic more effectively.
    subrequest = targetURI.constructSubrequest(aRequest);

    //  only IE and Moz currently support file save access so if we're down
    //  to this handler we're hopefully on one of those browsers :)
    if (!TP.canInvoke(TP, '$fileSave')) {
        this.raise('TP.sig.UnsupportedOperation');
        if (TP.canInvoke(aRequest, 'fail')) {
            aRequest.fail('Unsupported operation.');
        }

        return;
    }

    if (!TP.canInvoke(targetURI, 'getLocation')) {
        this.raise('TP.sig.InvalidURI');
        if (TP.canInvoke(aRequest, 'fail')) {
            aRequest.fail('Invalid URI: ' + targetURI);
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

    //  No body? Don't go any further.
    if (TP.notValid(subrequest.at('body'))) {
        //  NOTE: 'refresh' is false here! We do *not* want to fetch data from
        //  the server if the body is undefined.
        resp = targetURI.getResource(TP.hc('async', false, 'refresh', false));
        content = resp.get('result');

        if (TP.isEmpty(content)) {
            return this.raise(
                    'TP.sig.InvalidContent',
                    'No content to save for: ' + targetLoc);
        } else {
            subrequest.atPut('body', content);
        }
    }

    subrequest.defineMethod(
            'completeJob',
            function(aResult) {

                if (TP.isTrue(aResult)) {

                    targetURI.isDirty(false, true);
                    targetURI.isLoaded(true);

                    subrequest.$wrapupJob('Succeeded', TP.SUCCEEDED, aResult);

                    if (TP.canInvoke(aRequest, 'complete')) {
                        aRequest.complete(aResult);
                    }
                } else if (TP.canInvoke(aRequest, 'fail')) {

                    subrequest.$wrapupJob('Failed', TP.FAILED);

                    aRequest.fail();
                }
            });

    subrequest.defineMethod(
            'failJob',
            function(aFaultString, aFaultCode, aFaultInfo) {

                var info,
                    subrequests;

                info = TP.hc(aFaultInfo);
                if (TP.isValid(subrequests = info.at('subrequests'))) {
                    subrequests.push(subrequest);
                } else {
                    subrequests = TP.ac(subrequest);
                    info.atPut('subrequests', subrequests);
                }

                subrequest.$wrapupJob('Failed', TP.FAILED);

                if (TP.canInvoke(aRequest, 'fail')) {
                    aRequest.fail(aFaultString, aFaultCode, info);
                }
            });

    //  do the work of saving content. for file operations this call is
    //  synchronous and returns a boolean for success (true/false)
    TP.$fileSave(targetLoc, subrequest);

    //  Note: We do *not* set the result for these responses here.
    //  complete() already did that in the call above. If we do that again
    //  here, we'll undo any wrapping or filtering.
    if (TP.canInvoke(aRequest, 'getResponse')) {
        response = aRequest.getResponse();
    } else {
        response = subrequest.getResponse();
    }

    return response;
});

//  =======================================================================
//  TP.uri.HTTPURLHandler
//  ========================================================================

/**
 * @type {TP.uri.HTTPURLHandler}
 * @summary Supports operations specific to loading/saving URI data for HTTP
 *     URIs.
 */

//  ------------------------------------------------------------------------

TP.uri.URIHandler.defineSubtype('HTTPURLHandler');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.uri.HTTPURLHandler.Type.defineMethod('load',
function(targetURI, aRequest) {

    /**
     * @method load
     * @summary Loads URI data content, returning the TP.sig.Response object
     *     used to manage the low-level service response.
     * @param {TP.uri.URI} targetURI The URI to load. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request,
        response,
        targetLoc,
        loadRequest;

    request = targetURI.constructRequest(aRequest);
    response = request.getResponse();

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
        loadRequest.atPutIfAbsent('method', TP.HTTP_POST);
    } else {
        loadRequest.atPutIfAbsent('method', TP.HTTP_GET);
    }

    //  this could be either sync or async, but the TP.sig.HTTPLoadRequest's
    //  handle* methods should be processing correctly in either case.
    TP.uri.HTTPService.handle(loadRequest);

    //  Make sure that the 2 requests match on sync/async
    request.updateRequestMode(loadRequest);

    return response;
});

//  ------------------------------------------------------------------------

TP.uri.HTTPURLHandler.Type.defineMethod('delete',
function(targetURI, aRequest) {

    /**
     * @method delete
     * @summary Deletes a URI entirely, returning the TP.sig.Response object
     *     used to manage the low-level service response.
     * @param {TP.uri.URI} targetURI The URI to delete. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request,
        response,

        targetLoc,

        deleteRequest,
        resp,
        content,

        useWebDAV;

    request = targetURI.constructRequest(aRequest);
    response = request.getResponse();

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
    deleteRequest = TP.sig.HTTPDeleteRequest.construct(request);

    //  make the request that was provided dependent upon the one we just
    //  constructed so it won't process/complete until the child request
    //  does.
    request.andJoinChild(deleteRequest);

    //  Yes, delete requests can have a body. Note that this will get encoded
    //  via the httpEncode() call in lower layers, so we don't touch it here.
    if (TP.notValid(deleteRequest.at('body'))) {
        resp = targetURI.getResource(TP.hc('async', false, 'refresh', false));
        content = TP.ifInvalid(resp.get('result'), '');

        deleteRequest.atPut('body', content);
    }

    //  ensure the required settings are available for this operation
    deleteRequest.atPut('uri', targetLoc);
    if (TP.isEmpty(deleteRequest.at('method'))) {
        //  when webdav is enabled we can set the 'method' to a TP.HTTP_DELETE
        useWebDAV = TP.ifInvalid(deleteRequest.at('iswebdav'),
                                    TP.sys.cfg('http.use_webdav'));

        if (useWebDAV) {
            deleteRequest.atPut('method', TP.HTTP_DELETE);
        } else {
            //  all other situations require a 'method' of TP.HTTP_POST, and an
            //  'altmethod' of TP.HTTP_DELETE (which eventually translates into
            //  the increasingly standard 'X-HTTP-Method-Override' header).
            deleteRequest.atPut('method', TP.HTTP_POST);
            deleteRequest.atPut('altmethod', TP.HTTP_DELETE);
        }
    }

    //  this could be either sync or async, but the TP.sig.HTTPLoadRequest's
    //  handle* methods should be processing correctly in either case.
    TP.uri.HTTPService.handle(deleteRequest);

    //  subrequests can be rewritten so we need to be in sync on async
    request.atPut('async', deleteRequest.at('async'));

    return response;
});

//  ------------------------------------------------------------------------

TP.uri.HTTPURLHandler.Type.defineMethod('save',
function(targetURI, aRequest) {

    /**
     * @method save
     * @summary Saves URI data content. This is the default data persistence
     *     method for most URI content. Important request keys include 'method',
     *     'crud', and 'body'. Method will typically default to a POST unless
     *     TP.sys.cfg(http.use_webdav) is true and the crud parameter is set to
     *     'insert', in which case a PUT is used. The crud parameter effectively
     *     defaults to 'update' so you should set it to 'insert' when new
     *     content is being created. The 'body' should contain the new/updated
     *     content, but this is normally configured by the URI's save() method
     *     itself.
     * @param {TP.uri.URI} targetURI The URI to save. NOTE that this URI will
     *     not have been rewritten/ resolved.
     * @param {TP.sig.Request|TP.core.Hash} aRequest An object containing
     *     request information accessible via the at/atPut collection API of
     *     TP.sig.Requests.
     * @returns {TP.sig.Response} The request's response object.
     */

    var request,
        response,
        targetLoc,
        saveRequest,
        resp,
        content,
        useWebDAV;

    request = targetURI.constructRequest(aRequest);
    response = request.getResponse();

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

        //  NOTE: 'refresh' is false here! We do *not* want to fetch data from
        //  the server if the body is undefined.
        resp = targetURI.getResource(TP.hc('async', false, 'refresh', false));
        content = resp.get('result');

        //  NOTE: We use the 'not valid' check here. That is because the value
        //  could be 'empty' (i.e. the empty String) which is perfectly viable
        //  for certain kinds of 'save' operations. Therefore, we allow empty
        //  Strings to pass here without raising and to be set as the 'body'.
        if (TP.notValid(content)) {
            return this.raise(
                    'TP.sig.InvalidContent',
                    'No content to save for: ' + targetLoc);
        } else {
            saveRequest.atPut('body', content);
        }
    }

    //  ensure the required settings are available for this operation
    saveRequest.atPut('uri', targetLoc);
    if (TP.isEmpty(saveRequest.at('method'))) {
        //  when webdav is enabled we can set the 'method' to a TP.HTTP_PUT
        //  for insert or use TP.HTTP_POST as our default.
        useWebDAV = TP.ifInvalid(saveRequest.at('iswebdav'),
                                    TP.sys.cfg('http.use_webdav'));

        if (useWebDAV) {
            if (saveRequest.at('crud') === TP.CREATE) {
                saveRequest.atPut('method', TP.HTTP_PUT);
            } else {
                saveRequest.atPut('method', TP.HTTP_POST);
            }
        } else {
            //  all other situations require a 'method' of TP.HTTP_POST, and a
            //  'method' of TP.HTTP_PUT or TP.HTTP_POST (which eventually
            //  translates into the increasingly standard
            //  'X-HTTP-Method-Override' header).
            saveRequest.atPut('method', TP.HTTP_POST);

            if (saveRequest.at('crud') === TP.CREATE) {
                saveRequest.atPut('altmethod', TP.HTTP_PUT);
            } else {
                saveRequest.atPut('altmethod', TP.HTTP_POST);
            }
        }
    }

    //  this could be either sync or async, but the TP.sig.HTTPSaveRequest's
    //  handle* methods should be processing correctly in either case.
    TP.uri.HTTPService.handle(saveRequest);

    //  subrequests can be rewritten so we need to be in sync on async
    request.atPut('async', saveRequest.at('async'));

    return response;
});

//  =======================================================================
//  TP.uri.RemoteURLWatchHandler
//  ========================================================================

/**
 * @type {TP.uri.RemoteURLWatchHandler}
 * @summary Mixin supporting response processing for remote resources that
 *     can notify of server side changes. This type is normally used as a trait
 *     to the main handler type. TDS and Couch URL handlers are the primary
 *     consumers of this mixin.
 */

//  ------------------------------------------------------------------------

TP.uri.URIHandler.defineSubtype('RemoteURLWatchHandler');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation
TP.uri.RemoteURLWatchHandler.isAbstract(true);

//  ------------------------------------------------------------------------
//  TypeLocal Attributes
//  ------------------------------------------------------------------------

//  Helper function for escaping regex metacharacters. NOTE that we need to
//  take "ignore format" things like path/* and make it path/.* or the regex
//  will fail. Also note we special case ~ to allow virtual path matches.
TP.uri.RemoteURLWatchHandler.defineConstant('INCLUDE_EXCLUDE_ESCAPER',
function(str) {
    return str.replace(
        /\*/g, '.*').replace(
        /\./g, '\\.').replace(
        /\~/g, '\\~').replace(
        /\//g, '\\/');
});

//  The list of methods any object which registered with this type must
//  implement.
TP.uri.RemoteURLWatchHandler.defineConstant('REMOTE_WATCH_API',
    TP.ac('activateRemoteWatch', 'deactivateRemoteWatch'));

//  A list of registered watchers, objects that will be activated/deactivated at
//  application startup and shutdown to manage remote change handling.
TP.uri.RemoteURLWatchHandler.defineAttribute('watchers');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  Regular expressions built based on include/exclude configuration data for
//  the remote url watcher types which mix this in.
TP.uri.RemoteURLWatchHandler.Type.defineAttribute('includeRE');
TP.uri.RemoteURLWatchHandler.Type.defineAttribute('excludeRE');

//  Configuration names for the include/exclude configuration settings for the
//  remote url watcher types which mix this in.
TP.uri.RemoteURLWatchHandler.Type.defineAttribute('includeConfigName');
TP.uri.RemoteURLWatchHandler.Type.defineAttribute('excludeConfigName');
TP.uri.RemoteURLWatchHandler.Type.defineAttribute('uriConfigName');

//  ------------------------------------------------------------------------
//  TypeLocal Methods
//  ------------------------------------------------------------------------

TP.uri.RemoteURLWatchHandler.defineMethod('activateWatchers',
function() {

    /**
     * @method activateWatchers
     * @summary Activates any registered remote URL watchers.
     * @returns {TP.uri.RemoteURLWatchHandler} The receiver.
     */

    var watchers;

    //  Don't watch if running in headless or karma (both are test environments
    //  that will cause issues).
    if (TP.sys.cfg('boot.context') === 'headless' ||
        TP.sys.hasFeature('karma')) {
        return this;
    }

    TP.sys.setcfg('uri.source.watch_changes', true);

    //  These get registered by the types which want activate/deactivate calls.
    watchers = TP.uri.RemoteURLWatchHandler.get('watchers');
    if (TP.isEmpty(watchers)) {
        return this;
    }

    //  Iterate over all of the watchers and observe them.
    watchers.perform(
                function(watcher) {
                    watcher.activateRemoteWatch();
                });

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.RemoteURLWatchHandler.defineMethod('deactivateWatchers',
function(aFilterFunction) {

    /**
     * @method deactivateWatchers
     * @summary Deactivates any registered remote URL watchers.
     * @returns {TP.uri.RemoteURLWatchHandler} The receiver.
     */

    var watchers;

    TP.sys.setcfg('uri.source.watch_changes', false);

    watchers = TP.uri.RemoteURLWatchHandler.get('watchers');
    if (TP.isEmpty(watchers)) {
        return this;
    }

    //  Iterate over all of the watchers and ignore them.
    watchers.perform(
                function(watcher) {
                    watcher.deactivateRemoteWatch();
                });

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.RemoteURLWatchHandler.defineMethod('registerWatcher',
function(aWatcher) {

    /**
     * @method registerWatcher
     * @summary Registers a specific object as a remote URL watcher. Registered
     *     watchers are activated/deactivated in response to the
     *     activateWatchers/deactivateWatchers methods on this type.
     * @param {Object} aWatcher A potential remote URL watcher. This object must
     *     conform to the receiver's REMOTE_WATCH_API.
     * @returns {TP.uri.RemoteURLWatchHandler} The receiver.
     */

    var watchers;

    if (!TP.canInvokeInterface(
        aWatcher,
        TP.uri.RemoteURLWatchHandler.REMOTE_WATCH_API)) {
        return this.raise('InvalidURLWatcher', aWatcher);
    }

    watchers = this.$get('watchers');
    if (TP.notValid(watchers)) {
        watchers = TP.ac();
        this.$set('watchers', watchers);
    }

    if (watchers.contains(aWatcher, TP.IDENTITY)) {
        return this;
    }

    watchers.push(aWatcher);

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.RemoteURLWatchHandler.defineHandler('AppShutdown',
function(aSignal) {

    /**
     * @method handleAppShutdown
     * @summary Handles when the app is about to be shut down. This is used to
     *     deactivateWatchers to get them to close any open connections.
     * @param {TP.sig.AppShutdown} aSignal The signal indicating that the
     *     application is to be shut down.
     * @returns {TP.uri.RemoteURLWatchHandler} The receiver.
     */

    this.deactivateWatchers();

    //  Make sure to remove our observation of AppShutdown.
    this.ignore(TP.sys, 'TP.sig.AppShutdown');

    return this;
});

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.uri.RemoteURLWatchHandler.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize.
     * @summary Performs one-time setup for the type on startup/import.
     * @description For this type that includes signing up for AppShutdown and
     *     activating any registered watchers if uri.source.watch_changes is
     *     set.
     */

    //  Ensure we always attempt to shut down and active watch channels.
    this.observe(TP.sys, 'TP.sig.AppShutdown');

    //  Activate if we're already set to watch based on startup config data.
    if (TP.sys.cfg('uri.source.watch_changes')) {
        TP.uri.RemoteURLWatchHandler.activateWatchers();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.uri.RemoteURLWatchHandler.Type.defineMethod('activateRemoteWatch',
function() {

    /**
     * @method activateRemoteWatch
     * @summary Performs any processing necessary to activate observation of
     *     remote URL changes.
     * @returns {TP.meta.uri.RemoteURLWatchHandler} The receiver.
     */

    var sourceType,
        sourceURI,
        signalSource,
        signalType;

    if (!TP.sys.isHTTPBased()) {
        return this;
    }

    sourceType = this.getWatcherSourceType();
    sourceURI = this.getWatcherSourceURI();

    signalSource = sourceType.construct(sourceURI.getLocation());
    if (TP.notValid(signalSource)) {
        return this.raise('InvalidURLWatchSource');
    }

    signalType = this.getWatcherSignalType();
    this.observe(signalSource, signalType);

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.RemoteURLWatchHandler.Type.defineMethod('deactivateRemoteWatch',
function() {

    /**
     * @method deactivateRemoteWatch
     * @summary Performs any processing necessary to shut down observation of
     *     remote URL changes.
     * @returns {TP.meta.uri.RemoteURLWatchHandler} The receiver.
     */

    var sourceType,
        sourceURI,
        signalSource,
        signalType;

    sourceType = this.getWatcherSourceType();
    sourceURI = this.getWatcherSourceURI();

    signalSource = sourceType.construct(sourceURI.getLocation());
    if (TP.notValid(signalSource)) {
        return this.raise('InvalidURLWatchSource');
    }

    signalType = this.getWatcherSignalType();
    this.ignore(signalSource, signalType);

    return this;
});

//  ------------------------------------------------------------------------

TP.uri.RemoteURLWatchHandler.Type.defineMethod('getWatcherSignalType',
function() {

    /**
     * @method getWatcherSignalType
     * @summary Returns the TIBET type of the watcher signal. This will be the
     *     signal that the signal source sends when it wants to notify URIs of
     *     changes.
     * @returns {TP.sig.RemoteURLChange} The type that will be instantiated
     *     to construct new signals that notify observers that the *remote*
     *     version of the supplied URI's resource has changed.
     */

    return TP.sig.RemoteURLChange;
});

//  ------------------------------------------------------------------------

TP.uri.RemoteURLWatchHandler.Type.defineMethod('getWatcherSourceType',
function() {

    /**
     * @method getWatcherSourceType
     * @summary Returns the TIBET type of the watcher signal source. Typically,
     *     this is one of the prebuilt TIBET watcher types, like
     *     TP.core.SSEMessageSource for Server-Sent Event sources.
     * @returns {TP.core.SSEMessageSource} The type that will be instantiated to
     *     make a watcher for the supplied URI.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.uri.RemoteURLWatchHandler.Type.defineMethod('getWatcherSourceURI',
function() {

    /**
     * @method getWatcherSourceURI
     * @summary Returns the URI to the resource that acts as a watcher to watch
     *     for changes to the resource of the supplied URI.
     * @returns {TP.uri.URI} A URI pointing to the resource that will notify
     *     TIBET when the supplied URI's resource changes.
     */

    var watcherURI;

    watcherURI = TP.uc(TP.uriJoinPaths(
                        TP.sys.cfg('path.app_root'),
                        TP.sys.cfg(this.get('uriConfigName'))));

    //  Make sure to switch *off* remote refreshing for the watcher URI itself
    watcherURI.unwatch();

    return watcherURI;
});

//  ------------------------------------------------------------------------

TP.uri.RemoteURLWatchHandler.Type.defineMethod('isWatchableURI',
function(targetURI) {

    /**
     * @method isWatchableURI
     * @summary Tests a URI against include/exclude filters to determine if
     *     changes to the URI should be considered for processing.
     * @param {String|TP.uri.URI} targetURI The URI to test.
     * @returns {Boolean} true if the URI passes include/exclude filters.
     */

    var escaper,
        targetLoc,
        targetVirtual,
        includes,
        excludes,
        includeRE,
        excludeRE;

    //  NOTE each type which mixes this in gets it own copy of the values here.
    includeRE = this.get('includeRE');
    excludeRE = this.get('excludeRE');

    if (TP.notValid(includeRE)) {

        targetLoc = targetURI.getLocation();
        targetVirtual = TP.uriInTIBETFormat(targetLoc);

        escaper = TP.uri.RemoteURLWatchHandler.INCLUDE_EXCLUDE_ESCAPER;

        includes = TP.sys.cfg(this.get('includeConfigName'));
        if (TP.notEmpty(includes)) {

            //  First normalize any virtual path values.
            includes = includes.map(
                        function(item) {
                            return TP.uriInTIBETFormat(TP.uriExpandPath(item));
                        });

            //  Now produce a single source string for regex construct.
            includes = includes.reduce(
                        function(str, item) {
                            return str ?
                                str + '|' + escaper(item) :
                                escaper(item);
                        }, '');

            try {
                //  Use 'new' here to keep escaping simple.
                includeRE = new RegExp(includes);
            } catch (e) {
                this.raise('InvalidWatchIncludes', includes);
            }
        }

        includeRE = TP.ifInvalid(includeRE, /.*/);

        excludes = TP.sys.cfg(this.get('excludeConfigName'));
        if (TP.notEmpty(excludes)) {

            //  First normalize any virtual path values.
            excludes = excludes.map(
                        function(item) {
                            return TP.uriInTIBETFormat(TP.uriExpandPath(item));
                        });

            //  Now produce a single source string for regex construct.
            excludes = excludes.reduce(
                        function(str, item) {
                            return str ?
                                str + '|' + escaper(item) :
                                escaper(item);
                        }, '');

            try {
                //  Use 'new' here to keep escaping simple.
                excludeRE = new RegExp(excludes);
            } catch (e) {
                this.raise('InvalidWatchExcludes', excludes);
            }
        }

        this.set('includeRE', includeRE);
        this.set('excludeRE', excludeRE);
    }

    TP.info('checking ' + targetLoc +
            ' in ' + includes +
            ' and not ' + excludes);

    if (TP.isValid(excludeRE)) {
        if (excludeRE.test(targetVirtual)) {
            return false;
        }
    }

    if (TP.isValid(includeRE)) {
        return includeRE.test(targetVirtual);
    }

    return true;
});

//  ========================================================================
//  end
//  ========================================================================
