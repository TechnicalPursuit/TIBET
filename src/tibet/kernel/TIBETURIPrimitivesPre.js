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
 */

//  ------------------------------------------------------------------------
//  FILE PATHS
//  ------------------------------------------------------------------------

/**
 * File path manipulation. These provide a foundation for TIBET to operate on
 * files accessible via either HTTP or FILE urls. Also, we try to adapt to
 * platform variations like the need to quote filenames on Windows that may
 * include spaces in them.
 */

//  ------------------------------------------------------------------------

TP.definePrimitive('isURIString',
function(anObject, schemeOptional) {

    /**
     * @method isURIString
     * @summary Returns true if the supplied String matches the URI format.
     * @param {Object} anObject The object to test.
     * @param {Boolean} [schemeOptional=false] Whether or not the URI scheme is
     *     optional in the String being tested.
     * @returns {Boolean} True if the object appears to match a URI-formatted
     *     String.
     */

    if (!TP.isString(anObject)) {
        return false;
    }

    if (schemeOptional) {
        return TP.regex.URI_STRICT.test(anObject) &&
            !TP.regex.HAS_LINEBREAK.test(anObject);
    }

    return TP.regex.SCHEME.test(anObject) &&
        !TP.regex.HAS_LINEBREAK.test(anObject) &&
        TP.regex.URI_STRICT.test(anObject);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriAddUniqueQuery',
function(aPath) {

    /**
     * @method uriAddUniqueQuery
     * @summary Adds a unique query parameter to the path. This is normally used
     *     to 'bust' caches for things like CSS URLs.
     * @param {String} aPath The path to add a unique query string to.
     * @exception TP.sig.InvalidURI
     * @returns {String} The path with the unique query added to it.
     */

    var path;

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidURI');
    }

    path = aPath +
            (aPath.contains('?') ? '&' : '?') +
            '_tibet_nocache=' + Date.now();

    return path;
});

//  ----------------------------------------------------------------------------

TP.definePrimitive('uriBaseParameters',
function(aURI, textOnly) {

    /**
     * @method uriBaseParameters
     * @summary Returns the parameters found on the base URL, if any. Base
     *     parameters are effectively server-side parameters since they are not
     *     part of the fragment and hence not processed by the TIBET client.
     * @param {String|TP.uri.URI} aURI The URI to process.
     * @param {Boolean} [textOnly=true] Return just the text parameter string
     *     if any.
     * @returns {String} The URI base parameter values.
     */

    var url,
        base,
        params;

    url = TP.str(aURI);
    if (TP.isEmpty(url)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    base = TP.uriHead(url);

    if (/\?/.test(base)) {
        params = base.slice(base.indexOf('?') + 1);
        if (TP.notFalse(textOnly)) {
            return params;
        }
    }

    if (params) {
        return TP.hc(TP.boot.$parseURIParameters(params));
    }

    return TP.notFalse(textOnly) ? '' : {};
});

//  ----------------------------------------------------------------------------

TP.definePrimitive('uriBasePath',
function(aURI) {

    /**
     * @method uriBasePath
     * @summary Returns the path portion of the URL base, the portion of the URL
     *     after the uriRoot and before any uriBaseParams. This essentially is
     *     the "server route" component.
     * @param {String|TP.uri.URI} aURI The URI to process.
     * @returns {String} The URI base path value.
     */

    var url,
        path;

    url = TP.str(aURI);
    if (TP.isEmpty(url)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    path = TP.uriHead(url);

    if (/\?/.test(path)) {
        path = path.slice(0, path.indexOf('?'));
    }

    //  Remove the root portion since we only want "path" segment.
    path = path.replace(TP.uriRoot(url), '');

    //  Remove any trailing /
    if (path.last() === '/') {
        path = path.slice(0, -1);
    }

    return path;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriCleansePath',
function(aPath) {

    /**
     * @method uriCleansePath
     * @summary Returns a version of the url provided with any user/pass
     *     information masked out. This is used for prompts and logging where
     *     basic auth data could potentially be exposed to view.
     * @param {String} aPath The URL to mask.
     * @returns {String} The masked URL.
     */

    var regex,
        match,
        newurl;

    //  scheme://(user):(pass)@hostetc...
    regex = /(.*)\/\/(.*):(.*)@(.*)/;

    if (!regex.test(aPath)) {
        return aPath;
    }

    match = regex.exec(aPath);
    newurl = match[1] + '//' + 'xxx:xxx@' + match[4];

    return newurl;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriCollapsePath',
function(aPath) {

    /**
     * @method uriCollapsePath
     * @summary Normalizes a URI path to remove any embedded . or .. segments
     *     which may exist by adjusting the path segments properly to resolve
     *     the relative portions.
     *
     *     NOTE that as part of processing, all \'s in the path are temporarily
     *     replaced with /'s, then reversed on completion. As a result, paths
     *     with a combination of /'s and \'s will be corrupted by this routine.
     *     Properly formatted paths such as C:\a\b\c, or file:///usr/local/bin
     *     are unaffected by this, but an invalid path such as file:///c:\a\b\c
     *     will be further corrupted as a result of this routine
     *     (file:\\\c:\a\b\c).
     * @param {String} aPath The path to normalize.
     * @exception TP.sig.InvalidURI
     * @returns {String}
     */

    var path,
        reverse,
        newpath;

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidURI');
    }

    //  start by "normalizing" so we match our test/conversion regexes
    path = aPath.replace(/\\/g, '/');
    if (path !== aPath) {
        reverse = true;
    }

    //  if the path has /. in it anywhere we've got an offset of some kind,
    //  but otherwise we can return with minimal overhead
    if (!TP.regex.HAS_PATH_OFFSET.test(path)) {
        //  return original path if we aren't going to process it
        return aPath;
    }

    while (TP.regex.HAS_PATH_OFFSET.test(path)) {
        newpath = path.strip(TP.regex.REMOVE_PATH_OFFSET);
        if (newpath === path) {
            break;
        }
        path = newpath;
    }

    while (TP.regex.HAS_PATH_NOOP.test(path)) {
        newpath = path.strip(TP.regex.REMOVE_PATH_NOOP);
        if (newpath === path) {
            break;
        }
        path = newpath;
    }

    //  if the path came in as a local path return it in that format
    if (reverse) {
        path = path.replace(/\//g, '\\');
    }

    return path;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriCollectionPath',
function(aPath) {

    /**
     * @method uriCollectionPath
     * @summary Returns the 'collection path' for the URI, i.e. the entire path
     *     minus any file-specific portion.
     * @param {String} aPath The URI to slice to access the collection href.
     * @exception TP.sig.InvalidURI
     * @returns {String} The uri's collection path.
     */

    var path,
        index,
        slash;

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidURI');
    }

    path = aPath;

    //  paths containing backslashes, such as paths on Windows, will use
    //  backslash as their test slash
    if (/\\/.test(aPath)) {
        slash = '\\';
    } else {
        slash = '/';
    }

    index = path.lastIndexOf(slash);

    //  If a slash was found, slice from the beginning of the entire path to
    //  that slash to obtain the 'collection' path.
    if (index !== TP.NOT_FOUND) {
        path = path.slice(0, index);
    }

    return path;
});

//  ----------------------------------------------------------------------------

TP.definePrimitive('uriCompose',
function(parts) {

    /**
     * @method uriCompose
     * @summary Builds up a proper URL from the parts provided. This routine
     *     is often used to compose new URLs from parts of other URLs such
     *     as the base components of a link combined with the fragment
     *     parameters of the launch url (boot parameters).
     * @param {TP.core.Hash|Object} parts An object containing strings for root,
     *     basePath, baseParams, fragmentPath, and fragmentParams. Missing
     *     parameters are ignored.
     * @returns {String} A new url assembled from the parts provided.
     */

    var root,
        basePath,
        baseParams,
        fragPath,
        fragParams,

        url;

    if (TP.isEmpty(parts)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    root = parts.at('root');
    basePath = parts.at('basePath');
    baseParams = parts.at('baseParams');
    fragPath = parts.at('fragmentPath');
    fragParams = parts.at('fragmentParams');

    if (TP.isEmpty(root)) {
        return;
    }

    //  This should be scheme etc. as in http(s):// or file://
    url = root;

    //  If this has any value at all it should be placed right behind root.
    if (TP.notEmpty(basePath)) {
        url += basePath;
    }

    //  Base parameters are parameters on the base uri, prior to the fragment.
    if (TP.notEmpty(baseParams)) {
        url += '?' +
            (TP.isString(baseParams) ? baseParams : baseParams.asQueryString());
    }

    //  Fragment path is any portion of the fragment prior to fragment params.
    //  By default an empty path is '/' to be consistent with location.pathname.
    if (fragPath !== '/' && TP.notEmpty(fragPath)) {

        //  If we're about to put on fragment don't leave base path empty.
        if (TP.isEmpty(basePath)) {
            url += '/';
        }

        //  Make sure that the fragment also has a leading '#', thereby
        url += '#' + fragPath;
    }

    //  Fragment parameters, aka boot parameters, are parameters which are part
    //  of the TIBET configuration system which are found in the fragment.
    if (TP.notEmpty(fragParams)) {

        //  Make sure that we're always within a fragment by forcing leading #.
        if (!/#/.test(url)) {

            //  If we're about to put on fragment don't leave base path empty.
            if (TP.isEmpty(basePath)) {
                url += '/';
            }
            url += '#';
        }

        url += '?' +
            (TP.isString(fragParams) ? fragParams : fragParams.asQueryString());
    }

    return url;
});

//  ----------------------------------------------------------------------------

TP.definePrimitive('uriDecompose',
function(aURI, textOnly) {

    /**
     * @method uriDecompose
     * @summary Splits a URL into constituent parts suitable for passing them to
     *     the uriCompose routine.
     * @param {String|TP.uri.URI} aURI The URI to process.
     * @param {Boolean} [textOnly=true] Return just text parameter strings
     *     rather than objects in the result object.
     * @returns {TP.core.Hash} The URI parts in key/value form.
     */

    var url,
        root,
        basePath,
        baseParams,
        fragPath,
        fragParams;

    url = TP.str(aURI);
    if (TP.isEmpty(url)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    root = TP.uriRoot(url);
    basePath = TP.uriBasePath(url);
    baseParams = TP.uriBaseParameters(url, textOnly);
    fragPath = TP.uriFragmentPath(url);
    fragParams = TP.uriFragmentParameters(url, textOnly);

    return TP.hc('root', root,
                    'basePath', basePath,
                    'baseParams', baseParams,
                    'fragmentPath', fragPath,
                    'fragmentParams', fragParams);
});

//  ----------------------------------------------------------------------------

TP.definePrimitive('uriExpandHome',
function(aURI) {

    /**
     * @method uriExpandHome
     * @summary Returns a URI representing the home page for any URI which is an
     *     implicit path to that page. Examples are "/" and the launch URL. NOTE
     *     that the resulting URL will include any path/parameter portions from
     *     the launch URL as needed.
     * @param {String|URI} aURI The uri to expand.
     * @returns {String} The expanded uri.
     */

    var url,
        urlParams,
        home,
        homeParts,
        params;

    //  For our expansion testing and history tracking we want a fully-expanded
    //  and normalized version of the URL here.
    url = TP.str(aURI);
    url = TP.uriExpandPath(url);
    url = decodeURIComponent(url);

    urlParams = TP.uriFragmentParameters(url, true);

    //  The pushState handlers in TIBET don't push homepage URLs directly, they
    //  always short to '/' or the launch URL. We need to actually setLocation
    //  with a real URI for the related home page tho so we convert here.
    if (url === '/' || TP.uriHead(url) === TP.uriHead(TP.sys.getLaunchURL())) {

        //  From a route perspective '/' means UICANVAS should get the home
        //  page. We don't want launch URLs here since this isn't about top.
        home = TP.uriExpandPath(TP.sys.getHomeURL());
        homeParts = TP.uriDecompose(home);

        //  Preserve any base parameters from launch if not overridden.
        if (TP.isEmpty(homeParts.at('baseParams'))) {
            homeParts.atPut('baseParams',
                            TP.uriBaseParameters(TP.sys.getLaunchURL(), true));
        }

        //  Preserve any fragment path (route) from the original URL provided.
        if (homeParts.at('fragmentPath') === '/') {
            homeParts.atPut('fragmentPath', TP.uriFragmentPath(url));
        }

        //  Have to add any launch parameters here as well or the rewrite will
        //  cause our reboot trigger on boot parameters to fire.
        if (TP.isEmpty(homeParts.at('fragmentParams'))) {

            params = TP.ifEmpty(urlParams,
                TP.uriFragmentParameters(TP.sys.getLaunchURL(), true));

            homeParts.atPut('fragmentParams', params);
        }

        url = TP.uriCompose(homeParts);
    }

    return url;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriExpandPath',
function(aPath) {

    /**
     * @method uriExpandPath
     * @summary Returns the expanded form of the TIBET '~' (tilde) path
     *     provided. This method is used extensively to help low-level URI
     *     primitives operate effectively with TIBET paths.
     * @param {String} aPath The TIBET path to expand.
     * @exception TP.sig.InvalidURI
     * @returns {String} A newly constructed path string.
     */

    var path,
        arr,
        variable,
        value,
        start;

    //  not a real path, but we can't assume what should come next
    if (TP.isEmpty(aPath)) {
        return '';
    }

    if (aPath === '/') {
        return TP.sys.getLaunchRoot();
    }

    path = TP.str(aPath);

    if (path.indexOf('/') === 0) {
        //  Launch root doesn't include a trailing slash, so avoid possible
        //  recursion via uriJoinPaths and just concatenate.
        return TP.sys.getLaunchRoot() + path;
    }

    start = path.replace('tibet:///~', '~');

    //  if the path starts with '~' we adjust to the proper root
    if (start.indexOf('~') !== 0) {
        return start;
    }

    path = start;

    if (path === '~') {
        return TP.getAppHead();
    } else if (path === '~app') {
        return TP.getAppRoot();
    } else if (path === '~lib') {
        return TP.getLibRoot();
    } else if (path.indexOf('~/') === 0) {
        //  Note here how we also slice off the leading slash so that
        //  TP.uriJoinPaths() doesn't think 'path' is an absolute path.
        path = TP.uriJoinPaths(TP.getAppHead(), path.slice(2));
    } else if (path.indexOf('~app/') === 0) {
        //  Note here how we also slice off the leading slash so that
        //  TP.uriJoinPaths() doesn't think 'path' is an absolute path.
        path = TP.uriJoinPaths(TP.getAppRoot(), path.slice(5));
    } else if (path.indexOf('~lib/') === 0) {
        //  Note here how we also slice off the leading slash so that
        //  TP.uriJoinPaths() doesn't think 'path' is an absolute path.
        path = TP.uriJoinPaths(TP.getLibRoot(), path.slice(5));
    } else {
        arr = path.match(/~([^\/]*)\/(.*)/);
        if (TP.notValid(arr)) {
            arr = path.match(/~([^\/]*)/);
        }

        if (arr) {
            variable = arr.at(1);

            //  NOTE we resolve these variables from the config data
            if (TP.isString(value = TP.sys.cfg('path.' + variable))) {
                //  If we're replacing something of the form ~variable/stuff we
                //  don't want to get something of the form value//stuff back so
                //  we trim off any trailing '/' on the value.
                if (path !== '~' + variable) {
                    if (value.charAt(value.length - 1) === '/') {
                        value = value.slice(0, -1);
                    }
                }

                //  patch the original path for testing
                path = start.replace('~' + variable, value);
            } else {
                //  Might be a class name...
                value = TP.bySystemId(variable);
                if (TP.isValid(value)) {
                    value = TP.objectGetSourceCollectionPath(value);
                    if (TP.notEmpty(value)) {
                        //  patch the original path for testing
                        path = start.replace('~' + variable, value);
                    }
                }
            }
        }
    }

    //  variable expansions can sometimes create additional ~ paths
    if (path !== start && path.indexOf('~') === 0) {
        return TP.boot.$uriExpandPath(path);
    }

    return path;
});

//  ----------------------------------------------------------------------------

TP.definePrimitive('uriFragment',
function(aURI) {

    /**
     * @method uriFragment
     * @summary Returns the fragment portion, if any, from the URL.
     * @param {String|TP.uri.URI} aURI The URI to process.
     * @returns {String} The fragment portion or the empty string.
     */

    var url;

    url = TP.str(aURI);
    if (TP.isEmpty(url)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    if (/#/.test(url)) {
        return url.slice(url.indexOf('#') + 1);
    }

    return '';
});

//  ----------------------------------------------------------------------------

TP.definePrimitive('uriFragmentParameters',
function(aURI, textOnly) {

    /**
     * @method uriFragmentParameters
     * @summary Parses the given URL for any TIBET-specific argument block.
     *     The URL hash is checked for any & segment and that segment is
     *     split just as if it were a set of server parameters. For example,
     *     http://localhost/index.html#foo&boot.debug=true results in the
     *     argument object containing {'boot.debug':true};
     * @param {String|TP.uri.URI} aURI The URI to process.
     * @param {Boolean} [textOnly=true] Return just the text parameter string
     *     if any.
     * @returns {Object||TP.core.Hash} The fragment parameters.
     */

    var url,
        hash,
        params;

    url = TP.str(aURI);
    if (TP.isEmpty(url)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  Process any hash portion of the URL string.
    if (!/#/.test(url)) {
        return TP.notFalse(textOnly) ? '' : {};
    }
    hash = url.slice(url.indexOf('#') + 1);
    hash = decodeURIComponent(hash);

    if (hash.indexOf('?') === TP.NOT_FOUND) {

        return TP.notFalse(textOnly) ? '' : {};
    } else {

        params = hash.slice(hash.indexOf('?') + 1);

        if (TP.notFalse(textOnly)) {
            return params;
        }
    }

    if (params) {
        return TP.hc(TP.boot.$parseURIParameters(params));
    }

    return TP.notFalse(textOnly) ? '' : {};
});

//  ----------------------------------------------------------------------------

TP.definePrimitive('uriFragmentPath',
function(aURI) {

    /**
     * @method uriFragmentPath
     * @summary Returns the path portion of the URL fragment if any. Note that
     *     anchor values in the URI will not produce a path with a leading '/'
     *     to avoid confusing anchors with routes. An empty fragment however
     *     will produce a value of '/' implying a "home route".
     * @param {String|TP.uri.URI} aURI The URI to process.
     * @returns {String} The fragment path value.
     */

    var fragment,
        url;

    url = TP.str(aURI);
    if (TP.isEmpty(url)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    fragment = TP.uriFragment(url);
    if (TP.isEmpty(fragment)) {
        return '/';
    }

    //  Remove any trailing parameter content.
    if (/\?/.test(fragment)) {
        fragment = fragment.slice(0, fragment.indexOf('?'));
    }

    //  Always return home route signifier for any empty/explicit value.
    if (TP.isEmpty(fragment) || fragment === '/') {
        return '/';
    }

    //  Remove any trailing / from paths longer that a single segment.
    if (fragment.last() === '/') {
        fragment = fragment.slice(0, -1);
    }

    return fragment;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriGetXPointerData',
function(aURI, aNode, shouldClone) {

    /**
     * @method uriGetXPointerData
     * @summary Returns the XML data defined by the XPointer relative to the
     *     node provided. The node is presumed to be the content node from the
     *     URI's document href.
     * @param {String} aURI A uri String defining an XPointer fragment.
     * @param {Node} aNode A node containing the overall document content for
     *     the URI provided.
     * @param {Boolean} shouldClone True will cause the nodes found to be cloned
     *     rather than returned as is. The default is true.
     * @exception TP.sig.InvalidURI
     * @exception TP.sig.InvalidNode
     * @returns {Node[]} An array containing zero or more Nodes.
     */

    var resultElements,
        uriParts,
        xpathExpr,
        clone,
        node,
        arr,
        pointer,
        pathStr,
        parts;

    if (!TP.isString(aURI)) {
        return TP.raise(this, 'TP.sig.InvalidURI');
    }

    if (TP.notValid(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    if (TP.isNode(aNode)) {
        node = aNode;
    } else if (TP.canInvoke(aNode, 'getNativeNode')) {
        node = aNode.getNativeNode();
    } else {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    clone = TP.ifInvalid(shouldClone, true);

    //  get the pointer portion by splitting on the required #
    uriParts = aURI.asString().split('#');
    switch (uriParts.getSize()) {
        case 1:
            //  no #? then we're not really looking for a part of a
            //  document, we're looking for the whole thing...
            if (clone) {
                resultElements = TP.ac(TP.nodeCloneNode(node, true));
            } else {
                resultElements = TP.ac(node);
            }

            arr = resultElements.collect(
                        function(item) {

                            if (TP.isDocument(item)) {
                                return item.documentElement;
                            }

                            return item;
                        });
            return arr;

        case 2:
            //  found, the pointer is in position 1
            pointer = uriParts.at(1);
            break;
        default:
            //  either 0 (?how?) or more than 2
            uriParts.shift();
            pointer = uriParts.join('#');

            break;
    }

    //  If it doesn't actually have the 'xpointer' or 'xpath1' String as part of
    //  the URI, then its considered to be a 'bare name'. This means that
    //  whatever follows the '#' should be considered the 'id' of an element
    //  within the content.
    if (TP.notValid(xpathExpr = pointer.match(TP.regex.XPOINTER))) {
        //  TODO:   add element() scheme support here

        //  special case is scheme://blah#document, which is how you can ask
        //  for the document element of the Document node
        if (pointer === 'document') {
            if (TP.isDocument(node)) {
                resultElements = node.documentElement;
            }
        } else {
            //  Grab the results of running an 'id' search within the
            //  contentElement. need the true here to force a complete
            //  search since the odds of a DTD for ID refs are low
            resultElements = TP.nodeGetElementById(node, pointer, true);
        }

        resultElements = TP.ac(resultElements);
    } else {
        //  Otherwise, its a real xpointer()/xpath1() with an XPath expression.
        //  Run it (once we get it out of the enclosing quotes since it will
        //  look like #xpointer("foo") or #xpath1("foo"))
        pathStr = xpathExpr.at(2);
        if (TP.notEmpty(pathStr)) {
            //  we can optimize ID lookups if we have a match with
            //  xpointer(id()) or xpath1(id()) as the pointer text
            if (TP.notEmpty(parts = pointer.match(TP.regex.ID_POINTER))) {
                pathStr = parts.at(1).unquoted();
                resultElements = TP.nodeGetElementById(node, pathStr, true);
                resultElements = TP.ac(resultElements);
            } else {
                pathStr = pathStr.unquoted();

                //  Otherwise, we replace 'id(...)' calls in the XPath with
                //  an 'match attributes named id' expression and try
                //  again...
                if (TP.regex.XPATH_HAS_ID.test(pathStr)) {
                    arr = pathStr.match(TP.regex.XPATH_HAS_ID);

                    pathStr = pathStr.replace(
                                arr.first(),
                                '*[@id="' + arr.last().unquoted() + '"]');
                }

                resultElements = TP.nodeEvaluateXPath(node,
                                                        pathStr,
                                                        TP.NODESET);
            }
        } else {
            return TP.ac();
        }
    }

    //  if we didn't find anything we can stop here
    if (TP.isEmpty(resultElements)) {
        return resultElements;
    }

    if (clone) {
        //  Make sure and return a clone of what got pulled out of the
        //  content. This avoids DOM pointer weirdness.
        arr = resultElements.collect(
            function(item) {

                return TP.nodeCloneNode(item, true);
            });

        return arr;
    } else {
        return resultElements;
    }
});

//  ----------------------------------------------------------------------------

TP.definePrimitive('uriHead',
function(aURI) {

    /**
     * @method uriHead
     * @summary Returns the "head" portion of the URL fragment, the portion
     *     prior to any fragment. The return value includes both the base path
     *     and base parameters, if any.
     * @param {String|TP.uri.URI} aURI The URI to process.
     * @returns {String} The URI base value.
     */

    var url;

    url = TP.str(aURI);

    if (TP.isEmpty(url)) {
        return;
    }

    if (/#/.test(url)) {
        url = url.slice(0, url.indexOf('#'));

        return url.last() === '/' ?
                url.slice(0, -1) :
                url;
    }

    return url;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriInLocalFormat',
function(aPath) {

    /**
     * @method uriInLocalFormat
     * @summary Returns the path used by the local operating system to access a
     *     particular path's resource. On Windows this will return a path of the
     *     form [drive]:\segment\segment while on *NIX platforms it will be a
     *     path of the form /segment/segment
     *
     *     NOTE that this method will unescape any escape() processing on the
     *     return value. Also NOTE that this method will _not_ quote paths with
     *     spaces since the majority of lower-level browser calls will fail on
     *     quoted input.
     * @param {String} aPath The path to repair.
     * @exception TP.sig.InvalidURI
     * @returns {String}
     */

    var path;

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidURI');
    }

    //  On Windows we can be drive:\something or \\something. All others
    //  need a /something path for this test to work
    if (TP.sys.isWin() &&
            (TP.regex.WINDOWS_PATH.test(aPath) ||
                TP.regex.UNC_PATH.test(aPath)) ||
        TP.regex.ROOT_PATH.test(aPath)) {
        return window.unescape(aPath);
    }

    //  make sure we've got the fully-expanded path for what follows
    path = TP.uriExpandPath(aPath);

    //  if, after expansion, we're looking at a non-file URI just return it
    //  since there's not enough information to do anything else with it
    if (path.indexOf('file:') !== 0) {
        //  NOTE that we don't return the expanded path, we leave the
        //  incoming path in whatever form it came in, minus any escaping
        return window.unescape(aPath);
    }

    //  remove the file scheme prefix. we clearly won't need that
    path = window.unescape(TP.uriMinusFileScheme(path));

    //  if we're not on Windows we're done. should have a path of the form
    //  /blah, or ../blah, etc.
    if (!TP.sys.isWin()) {
        return path;
    }

    //  for Windows convert to reversed slashes
    path = path.replace(/\//g, '\\');

    //  should match our Windows test patterns now
    if (TP.regex.WINDOWS_PATH.test(path) ||
        TP.regex.UNC_PATH.test(path)) {
        return path;
    }

    //  didn't look right after conversion? return original path minus any
    //  file scheme and hope for the best
    return window.unescape(TP.uriMinusFileScheme(aPath));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriInTIBETFormat',
function(aPath) {

    /**
     * @method uriInTIBETFormat
     * @summary Returns the path with typical TIBET prefixes for app_cfg,
     *     lib_cfg, app_root, and lib_root replaced with their TIBET aliases.
     *     This is typically used to shorten log output.
     * @param {String} aPath The URI path to process.
     * @returns {String} The supplied path with typical TIBET prefixes.
     */

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidURI');
    }

    //  Just map over the TP.boot version
    return TP.boot.$uriInTIBETFormat(aPath);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriInWebFormat',
function(aPath, aRoot) {

    /**
     * @method uriInWebFormat
     * @summary Returns the path with proper adjustments made to represent a
     *     proper URI (forward slashes, scheme prefixing, etc). NOTE that the
     *     response is _not_ escape()'d so it will be in the form expected by
     *     the rest of TIBET's functions and in the form more readable/typical
     *     for an end user.
     * @param {String} aPath The path to repair.
     * @param {String} aRoot The root to use for relative path resolution.
     *     Default is TP.getAppRoot();.
     * @returns {String}
     */

    var path;

    if (TP.isEmpty(aPath)) {
        return aPath;
    }

    //  already has a scheme and it's not tibet:? consider it done
    if (TP.regex.HAS_SCHEME.test(aPath) &&
        !TP.regex.TIBET_SCHEME.test(aPath)) {
        return aPath;
    }

    //  local? definately need to convert
    if (TP.regex.WINDOWS_PATH.test(aPath) || TP.regex.UNC_PATH.test(aPath)) {
        path = aPath.replace(/\\\\/g, '/').replace(/\\/g, '/');
        return TP.uriPlusFileScheme(path.unquoted());
    }

    //  may be virtual, in which case we'll just expand and return
    path = TP.uriExpandPath(aPath);
    if (path !== aPath) {
        return path;
    }

    //  last option is a path that probably needs a root. we expand out here
    //  and then make sure we add on the necessary file scheme if a scheme
    //  doesn't come back from our root expansion
    return TP.uriPlusFileScheme(TP.uriWithRoot(aPath, aRoot));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriIsAbsolute',
function(aPath) {

    /**
     * @method uriIsAbsolute
     * @summary Returns true if the path provided is an absolute path.
     * @param {String} aPath The path to test.
     * @returns {Boolean} True if the path is absolute rather than relative to
     *     some root.
     */

    var path;

    if (TP.isEmpty(aPath)) {
        return false;
    }

    //  expand any virtual paths so our test will function properly. if this
    //  doesn't expand a path into a leading scheme it's likely relative
    path = TP.uriExpandPath(aPath);

    //  tilde prefixes are absolute, as are scheme'd paths
    if (TP.regex.VIRTUAL_URI_PREFIX.test(path) ||
        TP.regex.HAS_SCHEME.test(path)) {
        return true;
    }

    if (TP.sys.isWin()) {
        //  on Windows we can also have either drive:\blah, or \\blah paths
        //  which are considered absolute
        return TP.regex.WINDOWS_PATH.test(path) || TP.regex.UNC_PATH.test(path);
    } else {
        //  non-Windows paths need a leading slash
        return path.first() === '/';
    }
});

//  ----------------------------------------------------------------------------

TP.definePrimitive('uriIsAppResource',
function(aPath) {

    /**
     * @method uriIsAppResource
     * @summary Returns true if the path provided appears to be an application
     *     resource (it's rooted below ~app).
     * @param {String} aPath The path to be tested.
     * @returns {Boolean} True if the path is an application resource path.
     */

    var path;

    if (TP.isEmpty(aPath)) {
        return false;
    }

    path = TP.uriExpandPath(aPath);

    return path.indexOf(TP.uriExpandPath('~app')) === 0;
});

//  ----------------------------------------------------------------------------

TP.definePrimitive('uriIsInlined',
function(aPath) {

    /**
     * @method uriIsInlined
     * @summary Returns true if the path provided is an 'inlined' resource. This
     *     will be different depending on whether the supplied path points to a
     *     'lib' resource or an 'app' resource.
     * @param {String} aPath The path to be tested.
     * @returns {Boolean} True if the path points to an inlined resource.
     */

    var inlined;

    if (TP.isEmpty(aPath)) {
        return false;
    }

    //  If the system is running with inlined resources we create 'style'
    //  elements rather than 'link' elements for CSS files.
    if (TP.uriIsLibResource(aPath)) {
        inlined = !TP.sys.cfg('boot.teamtibet');
    } else if (TP.uriIsAppResource(aPath)) {
        inlined = TP.sys.cfg('boot.inlined');
    } else {
        inlined = false;
    }

    return inlined;
});

//  ----------------------------------------------------------------------------

TP.definePrimitive('uriIsLibResource',
function(aPath) {

    /**
     * @method uriIsLibResource
     * @summary Returns true if the path provided appears to be a TIBET library
     *     resource (it's rooted below ~lib).
     * @param {String} aPath The path to be tested.
     * @returns {Boolean} True if the path is a library resource path.
     */

    var path;

    if (TP.isEmpty(aPath)) {
        return false;
    }

    path = TP.uriExpandPath(aPath);

    return path.indexOf(TP.uriExpandPath('~lib')) === 0;
});

//  ----------------------------------------------------------------------------

TP.definePrimitive('uriIsVirtual',
function(aPath) {

    /**
     * @method uriIsVirtual
     * @summary Returns true if the path provided appears to be a virtual path.
     * @param {String} aPath The path to be tested.
     * @returns {Boolean} True if the path is virtual.
     */

    if (TP.isEmpty(aPath)) {
        return false;
    }

    return aPath.indexOf('~') === 0 ||
        aPath.indexOf('tibet:') === 0 ||
        aPath.indexOf('urn:') === 0;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriJoinFragments',
function(aPath, aFragment) {

    /**
     * @method uriJoinFragments
     * @summary Joins a URI and a pointer fragment.
     * @description Note that the fragment has precedence, meaning that if it
     *     appears to be a whole URI path the path isn't used and the fragment
     *     is returned unchanged. Also, if the fragment expression (extracted
     *     from the xpointer type) is an 'absolute one' (per the expression
     *     path type) it will be returned whole as the fragment expression.
     * @param {String} aPath The URI string used as the prefix.
     * @param {String} aFragment The pointer fragment. Note that this may
     *     contain an XPointer and, if the path contains one as well and they
     *     don't match, the path will be returned unchanged.
     * @exception TP.sig.InvalidURI
     * @returns {String} A properly joined URI/Query string.
     */

    var result,
        i,

        url,
        expr,

        pathFragment,
        pathScheme,
        pathExpr,

        parts,
        results,

        fragmentScheme,

        joinChar;

    //  deal with looping when more than two args
    if (arguments.length > 2) {
        result = arguments[0];
        for (i = 1; i < arguments.length; i++) {
            result = TP.uriJoinFragments(result, arguments[i]);
        }

        return result;
    }

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidString');
    }

    if (TP.isEmpty(aFragment)) {
        return aPath;
    }

    //  If the fragment is '.', that a self-reference. Just return the main
    //  path.
    if (aFragment === '.') {
        return aPath;
    }

    //  If the fragment is a whole URI string, we just return that (per the
    //  method description).
    if (TP.isURIString(aFragment)) {
        return aFragment;
    }

    url = '';
    expr = '';

    //  Capture any fragment data that the path itself is providing.
    pathFragment = '';
    if (TP.regex.URI_FRAGMENT.test(aPath)) {

        parts = aPath.split('#');
        url = parts.first();

        pathFragment = parts.last();

        //  See if the path fragment contains an XPointer. If so, grab it's
        //  scheme and expression.
        if (TP.notEmpty(results = TP.regex.ANY_POINTER.match(pathFragment))) {
            pathScheme = results.at(1);
            pathExpr = results.at(2);
        }
    } else {
        url = aPath;
    }

    //  We do not process barename XPointers any further.
    if (TP.notEmpty(pathFragment) &&
        TP.regex.BARENAME.test('#' + pathFragment)) {
        return aPath;
    }

    //  If the pointer has actual XPointer content (whether or not preceded by a
    //  '#'), extract it
    if (TP.notEmpty(results = TP.regex.ANY_POINTER.match(aFragment))) {
        fragmentScheme = results.at(1);
        expr = results.at(2);
    } else {
        expr = aFragment;
    }

    //  If no scheme could be computed from the fragment, but the path did have
    //  a scheme, then set the fragment's scheme to the path's scheme.
    if (TP.isEmpty(fragmentScheme) && TP.notEmpty(pathScheme)) {
        fragmentScheme = pathScheme;
    }

    //  If the fragment still doesn't have a scheme, try to guess it.
    if (TP.isEmpty(fragmentScheme)) {
        fragmentScheme = TP.getPointerScheme(aFragment);
    }

    //  If we now have both a path scheme and a fragment scheme but they're not
    //  the same, then just return the original path.
    if (TP.notEmpty(pathScheme) &&
        TP.notEmpty(fragmentScheme) &&
        pathScheme !== fragmentScheme) {
        return aPath;
    }

    //  If there was an existing path expression, join it together with the
    //  fragment's expression using the standard 'join character'.
    if (TP.notEmpty(pathExpr)) {
        switch (fragmentScheme) {
            case 'css':
                joinChar = ' ';
                break;

            case 'tibet':
            case 'jpath':

                //  If a JSONPath starts with a '$', then it's an absolute path.
                //  Don't use any of the supplied path.
                if (expr.charAt(0) === '$') {
                    return url + '#' + fragmentScheme + '(' + expr + ')';
                }

                if (expr.charAt(0) === '[') {
                    joinChar = '';
                } else {
                    joinChar = '.';
                }

                break;

            case 'xpath1':
            case 'xpointer':

                //  If an XPath starts with a '/', then it's an absolute path.
                //  Don't use any of the supplied path.
                if (expr.charAt(0) === '/') {
                    return url + '#' + fragmentScheme + '(' + expr + ')';
                }

                if (expr.charAt(0) === '[') {
                    joinChar = '';
                } else {
                    joinChar = '/';
                }

                break;

            default:
                joinChar = '';
        }

        //  If the leading character of the expression is already a valid join
        //  character for this expression type, then set the joinChar to the
        //  empty String.
        if (expr.charAt(0) === joinChar) {
            joinChar = '';
        }

        expr = pathExpr + joinChar + expr;
    }

    //  Return a fully-formed URL, including the computed fragment scheme and
    //  expression.
    result = url + '#' + fragmentScheme + '(' + expr + ')';

    return result;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriJoinPaths',
function(firstPath, secondPath) {

    /**
     * @method uriJoinPaths
     * @summary Returns the two path components joined appropriately. Note that
     *     the second path has precedence, meaning that if the second path
     *     appears to be an absolute path the first path isn't used.
     * @param {String} firstPath The 'root' path.
     * @param {String} secondPath The 'tail' path.
     * @returns {String} The two paths joined together in an appropriate
     *     fashion.
     */

    var i,
        val,
        first,
        second,
        path;

    //  deal with looping when more than two args
    if (arguments.length > 2) {
        path = arguments[0];
        for (i = 1; i < arguments.length; i++) {
            path = TP.uriJoinPaths(path, arguments[i]);
        }

        return path;
    }

    if (TP.isEmpty(firstPath)) {
        return secondPath;
    }

    if (TP.isEmpty(secondPath)) {
        return firstPath;
    }

    //  any other absolute path in the second position is valid
    if (TP.uriIsAbsolute(secondPath)) {
        return secondPath;
    }

    //  work around mozilla bug
    if (firstPath.indexOf('about:blank') === 0) {
        first = firstPath.slice('about:blank'.getSize());
    } else {
        first = firstPath;
    }

    //  if the first path starts with '~' we adjust to the proper root
    if (first.indexOf('~') === 0) {
        path = TP.uriExpandPath(first);

        if (path !== firstPath) {
            //  cause re-evaluation with the expanded variable
            //  value
            return TP.uriJoinPaths(path, secondPath);
        }
    }

    //  copy to a local so we can manipulate as needed
    second = secondPath;

    //  adjust for an OSX bug around "absolute paths"
    if (second.indexOf('/Volumes') === 0) {
        //  one case is where path is completely contained in first path
        if (first.indexOf(second) !== TP.NOT_FOUND) {
            return first;
        }

        if (second.indexOf(first) !== TP.NOT_FOUND) {
            return second;
        }

        if (first.indexOf(TP.uriPlusFileScheme(second))) {
            return first;
        }

        if (second.indexOf(TP.uriPlusFileScheme(first)) !== TP.NOT_FOUND) {
            return second;
        }

        if (TP.uriPlusFileScheme(first).indexOf(second) !== TP.NOT_FOUND) {
            return TP.uriPlusFileScheme(first);
        }

        if (TP.uriPlusFileScheme(second).indexOf(first) !== TP.NOT_FOUND) {
            return TP.uriPlusFileScheme(second);
        }

        //  second is still an absolute path so go with that since the first
        //  is usually a "prefix" which is probably incorrect for the
        //  typically more concrete second path
        return TP.uriPlusFileScheme(second);
    }

    //  deal with second path starting with './'
    if (second.indexOf('./') === 0) {
        //  note we leave on the slash, that will be dealt with later
        second = second.slice(1);
    }

    //  now for the '../' case...first we'll need to remove any trailing
    //  slash from the first path so we can back up accurately
    if (first.charAt(first.getSize() - 1) === '/') {
        //  strange IE question here...reading a basedir ending in /
        //  gives us //. check for it and adjust as needed here
        if (first.lastIndexOf('//') === first.getSize() - 2) {
            first = first.slice(0, first.getSize() - 2);
        } else {
            first = first.slice(0, first.getSize() - 1);
        }
    }

    //  while we're being told to 'back up' the path, do so
    while (second.indexOf('..') === 0) {
        if (second.charAt(2) === '/') {
            second = second.slice(3, second.getSize());
        } else {
            second = second.slice(2, second.getSize());
        }
        first = first.slice(0, first.lastIndexOf('/'));
    }

    //  join the resulting chunks while paying attention to separator(s).
    if (first.charAt(first.length - 1) === '/') {
        if (second.charAt(0) === '/') {
            val = first + second.slice(1);
        } else if (second.charAt(0) === '#') {
            val = first.slice(-1) + second;
        } else {
            val = first + second;
        }
    } else {
        //  First does not end in '/'...
        if (second.charAt(0) === '/') {
            val = first + second;
        } else if (second.charAt(0) === '#') {
            val = first + second;
        } else {
            val = first + '/' + second;
        }
    }

    return val;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriJoinQuery',
function(aPath, aQuery) {

    /**
     * @method uriJoinQuery
     * @summary Joins a URI and query fragment, ensuring the proper join
     *     character is used. The path is a String, while the query can be a
     *     string or hash of key/value pairs.
     * @param {String} aPath The URI string used as the prefix.
     * @param {String} aQuery The query fragment.
     * @exception TP.sig.InvalidURI
     * @returns {String} A properly joined URI/Query string.
     */

    var url,
        query,
        fragment,
        parts,
        delim;

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidURI');
    }

    if (TP.isEmpty(aQuery)) {
        return aPath;
    }

    url = aPath;

    //  convert hashes to viable query string components
    query = TP.isString(aQuery) ? aQuery : aQuery.asQueryString();

    //  may need to remove any XPointer from tail before joining
    fragment = '';
    if (TP.regex.URI_FRAGMENT.test(url)) {
        parts = url.split('#');
        url = parts.first();
        fragment = parts.last();
    }

    //  if the URI already has a portion of a query we don't want another ?
    //  as the prefix to our new set of query parameters
    delim = /\?/.test(url) ? '&' : '?';

    if (TP.notEmpty(fragment)) {
        return url + delim + query + '#' + fragment;
    } else {
        return url + delim + query;
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriMinusFileScheme',
function(aPath) {

    /**
     * @method uriMinusFileScheme
     * @summary Returns the filename trimmed of any leading file://[/] chars.
     *     This is often necessary for proper use based on host platform.
     * @param {String} aPath The path to trim.
     * @exception TP.sig.InvalidURI
     * @returns {String} The path with any leading file:// portion trimmed off.
     */

    var path;

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidURI');
    }

    if (aPath.toLowerCase().indexOf('file:') !== 0) {
        return aPath;
    }

    //  slice off the file:// number of chars, removing the base prefix
    path = aPath.slice('file://'.length);

    //  on Windows we may need to slice 1 more character if the path
    //  matches /drive: rather than a UNC path
    if (TP.sys.isWin() && /^\/\w:/.test(path)) {
        path = path.slice(1);
    }

    return path;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriNeedsPrivileges',
function(aPath) {

    /**
     * @method uriNeedsPrivileges
     * @summary Returns true if accessing the supplied path requires special
     *     browser security privileges to be accessed, based on where TIBET got
     *     launched from.
     * @param {String} aPath The path to test.
     * @exception TP.sig.InvalidURI
     * @returns {Boolean} True if the path requires special privileges to
     *     access.
     */

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidURI');
    }

    //  If the path doesn't start with the launch root, then we can assume
    //  that it needs special security privileges.
    /* eslint-disable no-extra-parens */
    return (aPath.indexOf(TP.sys.getLaunchRoot()) !== 0);
    /* eslint-enable no-extra-parens */
});

//  ----------------------------------------------------------------------------

TP.definePrimitive('uriNormalize',
function(aURI) {

    /**
     * @method uriNormalize
     * @summary Processes a URL to produce a value we can rely on to have a
     *     consistent form. This is typically used on window.location values to
     *     remove trailing '/' from certain path forms et.
     * @param {String|TP.uri.URI} aURI The URI to process.
     * @returns {String} The normalized URI value.
     */

    var url;

    url = TP.str(aURI);
    if (TP.isEmpty(url)) {
        return;
    }

    if (TP.uriIsVirtual(url)) {
        url = TP.uriInTIBETFormat(TP.uriExpandPath(url));
    }

    return url.last() === '/' ? url.slice(0, -1) : url;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriPlusFileScheme',
function(aPath) {

    /**
     * @method uriPlusFileScheme
     * @summary Returns the filename padded with leading file://[/] characters
     *     appropriate for the current operating system platform.
     * @param {String} aPath The path to pad.
     * @exception TP.sig.InvalidURI
     * @returns {String}
     */

    var prefix,
        path;

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidURI');
    }

    if (aPath.toLowerCase().indexOf('file:') === 0) {
        return aPath;
    }

    prefix = 'file://';

    if (TP.sys.isWin() && /^\w:/.test(aPath)) {
        prefix = prefix + '/';
    }

    path = prefix + aPath;

    //  one last check for UNC paths on windows is that we don't want to end
    //  up with four slashes...
    if (/file:\/\/\/\//.test(path)) {
        path = path.replace(/file:\/\//, 'file:');
    }

    return path;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriRelativeToPath',
function(firstPath, secondPath, filePath) {

    /**
     * @method uriRelativeToPath
     * @summary Returns a "relativized" version of the firstPath at it relates
     *     to the second path. In essence, what path would you have to append to
     *     the secondPath to acquire the resource defined by the first path.
     * @description This method is a core method for helping stored files remain
     *     "relocatable". When storing TIBET metadata or compiled pages their
     *     internal references are automatically adjusted to relative paths
     *     using this routine. For example, given a path of ~lib_cfg/tibet.xml
     *     as the firstPath and a path of ~lib_dat as the secondPath we'd
     *     expect the return value to be ./cfg/tibet.xml. Note that since the
     *     path returned is relative to a directory it is occasionally necessary
     *     to assist TIBET with whether it should treat the last element of the
     *     second path as a file or not. For example, if our secondPath in the
     *     previous example were ~lib_cfg/tibet_kernel.xml we'd want the path to
     *     be returned as ./tibet.xml, not ../tibet.xml as it would be if the
     *     last element were a directory.
     * @param {String} firstPath The path to convert.
     * @param {String} secondPath The path to be relative to.
     * @param {Boolean} filePath True if the absolute path includes a file
     *     reference. This is important since the offset is relative to
     *     directories, not files. Defaults to true since the vast majority of
     *     URI references are to files.
     * @returns {String}
     */

    var file,
        first,
        second,
        prefix,
        path,
        count,
        ndx,
        i,
        partial;

    //  the "path we append" to the second path to get the first path when
    //  the first path doesn't exist is null
    if (TP.isEmpty(firstPath)) {
        return;
    }

    //  a "valid path" relative to some non-existent path is presumed to be
    //  the original path itself. we don't presume a "default root" here
    if (TP.isEmpty(secondPath)) {
        return firstPath;
    }

    //  are they the same path? then the relative path is '.'
    if (firstPath === secondPath) {
        return '.';
    }

    //  expand the paths to avoid issues with ~ prefixing and collapse out
    //  any relative '.' or '..' paths, so that the logic below works.
    first = TP.uriCollapsePath(TP.uriExpandPath(firstPath));
    second = TP.uriCollapsePath(TP.uriExpandPath(secondPath));

    //  get the first path normalized
    if (first.length > 1 && first.lastIndexOf('/') === first.length - 1) {
        //  if the first path ended in a '/' we can safely remove it since
        //  it's the same directory path with or without the trailing /
        first = first.slice(0, -1);
    }

    //  normalize the second path next

    if (TP.isTrue(filePath)) {
        //  forced to interpret second path as a file path, so if there's
        //  any / in the second path we use that as the point of trimming
        //  the last segment
        if ((ndx = second.lastIndexOf('/')) !== TP.NOT_FOUND) {

            /* eslint-disable no-extra-parens */
            if (second.lastIndexOf('/') === (second.length - 1)) {
                second = second.slice(0, -1);
                second = second.slice(0, second.lastIndexOf('/'));
            } else {
                second = second.slice(0, second.lastIndexOf('/'));
            }
            /* eslint-enable no-extra-parens */
        } else {
            //  entire second path is a file name, so our example is
            //  something like file:///thisdir relative to foo.xml. We can't
            //  know where foo.xml is, but we might presume that it's in the
            //  same location as the first path's file (if first has a file
            //  reference, or that it's in the same directory as the first
            //  when the first is a directory path
            if (TP.regex.FILE_PATH.test(firstPath)) {
                //  first path has a file location, and we're assuming we're
                //  in the same directory, so the path would be '.'
                return '.' + first.slice(first.lastIndexOf('/'));
            } else {
                //  assuming second path file is in first path directory
                //  we'll return '.'
                return '.';
            }
        }
    } else if (TP.isFalse(filePath)) {
        //  not able to alter second path too much, we're being forced to
        //  interpret it as a directory no matter what, but

        /* eslint-disable no-extra-parens */
        if (second.lastIndexOf('/') === (second.length - 1)) {
            second = second.slice(0, -1);
        }
        /* eslint-enable no-extra-parens */
    } else {
        //  try to determine if the second path is a file path or a
        //  directory path...the easiest check is does it end with a '/',
        //  after which we can check for an extension on the last portion

        /* eslint-disable no-extra-parens */
        if (second.lastIndexOf('/') === (second.length - 1)) {
            file = false;
            second = second.slice(0, -1);
        } else {
            //  if we can split the last element (having already split on
            //  '/') and find an extension then it's likely a file path
            if (TP.regex.FILE_PATH.test(second)) {
                file = true;
                second = second.slice(0, second.lastIndexOf('/'));
            } else {
                file = false;
            }
        }
        /* eslint-enable no-extra-parens */
    }

    //  after normalization we run our quick checks again

    //  the "path we append" to the second path to get the first path when
    //  the first path doesn't exist is null
    if (TP.isEmpty(first)) {
        return;
    }

    //  a "valid path" relative to some non-existent path is presumed to be
    //  the original path itself. we don't presume a "default root" here
    if (TP.isEmpty(second)) {
        return first;
    }

    //  are they the same path? then the relative path is '.'
    if (first === second) {
        return '.';
    }

    //  now for the other common cases, which hopefully helps us keep this
    //  running a little faster

    //  page compilation often wants a path relative to the cache directory
    //  or similar structure, meaning the first path is a subset of the
    //  second path (~ vs. ~app_tmp) so check for that
    if (second.indexOf(first) !== TP.NOT_FOUND) {
        path = second.strip(first);
        if (path.indexOf('/') === 0) {
            path = path.slice(1);
        }

        path = path.split('/');
        for (i = 0; i < path.length; i++) {
            path[i] = '..';
        }

        return path.join('/');
    }

    //  a large (predominant) number of these calls are asking for a full
    //  path relative to a directory higher up the tree (as in an app file
    //  relative to either the lib root or app root). in these cases the
    //  second path is completely contained in the first path and we're
    //  simply trying to detemine how many segments to remove from the path
    //  before we tack on a leading './'. we can determine that condition by
    //  simply replacing the secondPath with a '.' and seeing if we end up
    //  with a './' path meaning the replacement was clean on a directory
    //  boundary
    if ((path = first.replace(second, '.')) !== first) {
        //  we know there was at least a match, but did it produce a valid
        //  relative path?
        if (path.indexOf('./') === 0) {
            return path;
        }
    }

    //  if the first path is relative we can shortcut the test
    if (first.indexOf('.') === 0) {
        //  we're often forced, when resolving two paths, to adapt a path
        //  relative to a file (think about href values being resolved
        //  against their window.location) so we need an extra .. prefix
        if (file) {
            //  if it's a "local" file we don't want to return .././foo so
            //  we remove the internal ./ portion and make it ../foo,
            //  otherwise it's ../something and we want ../../something to
            //  ensure we skip past the file element of the second path
            if (first.indexOf('./') === 0) {
                return '../' + first.slice(2);
            } else {
                return '../' + first;
            }
        }

        return first;
    }

    //  a second common case is when we're looking for a directory in
    //  the middle of a larger absolute path (as when trying to locate
    //  basedir or libroot references)
    if ((ndx = second.indexOf(first)) !== TP.NOT_FOUND) {
        //  looks like the first path is a point in the second path, so the
        //  question now is how many segments "up" in the second path is it

        //  get the 'tail' from the match down as our starting point and
        //  remove the matching portion. so if we had something like
        //  file://foo/bar/tibet/baz/tp_cfg.html and 'tibet' or '/tibet' as
        //  a relative portion we're now holding /baz/tp_cfg.html...
        partial = second.slice(ndx).strip(first);

        count = partial.split('/').length;
        prefix = '';
        for (i = 0; i < count; i++) {
            prefix = prefix + '../';
        }

        return prefix + first;
    }

    //  neither path is contained in the other, which means we're going to
    //  have to work a bit harder by looking for a common branch point in
    //  the middle of the two paths...

    count = 0;
    ndx = second.lastIndexOf('/');
    while (ndx !== TP.NOT_FOUND) {
        //  peel off the last segment
        second = second.slice(0, ndx);

        //  see if we can replace it as a subset of the first path now...
        if ((path = first.replace(second, '..')) !== first) {
            //  if we can then all we need to do is put the proper number of
            //  jumps (../) on the front so we've adjusted
            if (path.indexOf('../') === 0) {
                prefix = '';
                for (i = 0; i < count; i++) {
                    prefix = prefix + '../';
                }

                return prefix + path;
            }
        }

        //  count so we know to add when we find a match
        count++;

        ndx = second.lastIndexOf('/');
    }

    //  no common elements in the paths at all if we got here..., and the
    //  path wasn't relative so we have to assume absolute and just return
    return first;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriRemoveUniqueQuery',
function(aPath) {

    /**
     * @method uriRemoveUniqueQuery
     * @summary Removes any unique query that was added to the path by the
     *     'uriAddUniqueQuery' method. See that method for more information
     *     about why unique queries are used.
     * @param {String} aPath The path to remove a unique query string from.
     * @exception TP.sig.InvalidURI
     * @returns {String} The path with the unique query removed from it.
     */

    var path;

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidURI');
    }

    if (aPath.contains('_tibet_nocache')) {

        //  If there is a '&', that means there were other parameters on the URL
        //  that we don't want to replace.
        if (aPath.contains('&')) {
            path = aPath.strip(/&?_tibet_nocache=(\d+)(\?|&)?/);
        } else {
            path = aPath.strip(/\?_tibet_nocache=(\d+)/);
        }
    } else {
        path = aPath;
    }

    return path;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriResolvePaths',
function(aRootPath, aRelativePath, filePath) {

    /**
     * @method uriResolvePaths
     * @summary Returns an absolute path to the second referenced resource when
     *     resolved relative to the leading path. This method is often called to
     *     resolve HREF or SRC paths within a document. NOTE that this method is
     *     similar in form to the methods which create relative paths, but that
     *     the first two arguments are reversed with the root path being first.
     * @param {String} aRootPath The absolute path to resolve relative to.
     * @param {String} aRelativePath The "relative" path to adjust into absolute
     *     form.
     * @param {Boolean} filePath True if the absolute path includes a file
     *     reference. This is important since the offset is relative to
     *     directories, not files.
     * @exception TP.sig.InvalidURI
     * @returns {String}
     */

    var first,
        second;

    first = aRootPath;

    if (filePath) {
        second = TP.uriRelativeToPath(second, first, filePath);
    } else {
        second = aRelativePath;
    }

    return TP.uriJoinPaths(first, second);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriResolveVirtualPath',
function(aPath, resourceOnly) {

    /**
     * @method uriResolveVirtualPath
     * @summary Returns a string with the URI path provided fully resolved to
     *     an absolute path of some form.
     * @param {String} aPath The TIBET URI string to resolve.
     * @param {Boolean} resourceOnly Strip off any prefixing canvas? Default is
     *     false.
     * @exception TP.sig.InvalidURI
     * @exception TP.sig.InvalidCanvas
     * @returns {String} The fully resolved path.
     */

    var url,
        parts,
        path,
        pointer,
        arr,
        variable,
        value,
        type,
        canvas;

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidURI');
    }

    url = aPath;

    //  has to start with tibet: or ~ to be resolvable
    if (!TP.regex.TIBET_URL.test(aPath)) {
        return aPath;
    }

    pointer = '';

    //  for scheme-based paths we can split to get the parts
    if (url.indexOf('tibet:') === 0) {
        parts = url.match(TP.regex.TIBET_URL_SPLITTER);
        if (TP.isArray(parts)) {
            //  whole, jid, resource, canvas, uri, path, pointer
            path = parts.at(5);

            if (TP.isEmpty(path)) {
                //  curious, means we apparently only have a canvas ref
                return aPath;
            }

            pointer = TP.ifInvalid(parts.at(6), '');
        } else {
            //  TODO:   is this an error? started with tibet: but didn't
            //          match our URI pattern
            return aPath;
        }
    } else {
        //  path should start with ~ since we're in a TIBET URI
        path = url;
    }

    /* eslint-disable no-script-url */

    //  with the path portion extracted we can check for the most common
    //  cases now, which are those involving ~ references (otherwise why use
    //  a TIBET URI :))
    if (path === '~app') {
        return TP.getAppRoot();
    } else if (path === '~lib') {
        return TP.getLibRoot();
    } else if (path === '~') {
        return TP.getAppHead();
    } else if (path === '/') {
        return TP.sys.getLaunchRoot();
    } else if (path.indexOf('~app/') === 0) {
        arr = path.match(/~app\/(.*)/);
        path = TP.uriJoinPaths(TP.getAppRoot(), arr.last());
    } else if (path.indexOf('~lib/') === 0) {
        arr = path.match(/~lib\/(.*)/);
        path = TP.uriJoinPaths(TP.getLibRoot(), arr.last());
    } else if (path.indexOf('~/') === 0) {
        arr = path.match(/~\/(.*)/);
        path = TP.uriJoinPaths(TP.getAppHead(), arr.last());
    } else if (path.indexOf('~') === 0) {
        arr = path.match(/~([^\/]*)\/(.*)/);
        if (TP.notValid(arr)) {
            arr = path.match(/~([^\/]*)/);
            if (TP.notValid(arr)) {
                return path + pointer;
            }
        }

        variable = arr.at(1);

        if (TP.isString(value = TP.sys.cfg('path.' + variable))) {
            //  If we're replacing something of the form ~variable/stuff we
            //  don't want to get something of the form value//stuff back so
            //  we trim off any trailing '/' on the value.
            if (path !== '~' + variable) {
                if (value.charAt(value.length - 1) === '/') {
                    value = value.slice(0, -1);
                }
            }

            path = aPath.replace('~' + variable, value);
            if (path !== aPath) {
                //  cause re-evaluation with the expanded variable value
                return TP.uriResolveVirtualPath(path);
            }
        } else if (TP.isType(type = TP.sys.getTypeByName(variable))) {
            value = TP.objectGetSourceCollectionPath(type);

            //  If we're replacing something of the form ~variable/stuff we
            //  don't want to get something of the form value//stuff back so
            //  we trim off any trailing '/' on the value.
            if (path !== '~' + variable) {
                if (value.charAt(value.length - 1) === '/') {
                    value = value.slice(0, -1);
                }
            }

            path = aPath.replace('~' + variable, value);
            if (path !== aPath) {
                //  cause re-evaluation with the expanded variable value
                return TP.uriResolveVirtualPath(path);
            }
        }
    } else if (path.indexOf('javascript:') === 0) {
        //  if we split a tibet: uri we'll have a canvas ID
        if (TP.isArray(parts)) {
            canvas = TP.ifInvalid(parts.at(3), '');
        } else {
            canvas = '';
        }

        //  note we push the canvas spec into place before the remaining
        //  elements here if it isn't already in place to ensure the proper
        //  context is used - but only if it's not the codeframe spec
        if (path.indexOf('javascript:' + canvas) !== 0 &&
            canvas !== TP.gid(window).strip(/tibet:\/\//)) {
            path = path.replace('javascript:',
                                'javascript:' + canvas + '.');
        }
    }

    /* eslint-enable no-script-url */

    //  if we had tibet:/// with no canvas spec we allow that to be removed,
    //  but all other cases where a canvas is defined we must preserve

    if (TP.notTrue(resourceOnly) && url.indexOf('tibet:') === 0) {
        parts = url.match(TP.regex.TIBET_URL_SPLITTER);
        if (TP.isArray(parts) && TP.notEmpty(parts.at(3))) {
            return 'tibet:' + parts.at(1) + '/' + parts.at(2) + '/' +
                        parts.at(3) + '/' + path + pointer;
        }
    }

    //  http, https, file, etc can just return the path
    return path + pointer;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriResult',
function(text, type, report) {

    /**
     * @method uriResult
     * @summary Returns the proper result format given the result text and
     *     result type, typically from an XMLHttpRequest's responseText.
     * @param {String} text The response text to process.
     * @param {TP.DOM|TP.TEXT|null} type The result type desired. If no value is
     *     provided this method tries to return DOM if possible, otherwise TEXT.
     * @param {Boolean} report True if errors during document creation should be
     *     reported.
     * @returns {String|Document|Array<String,Node>} An XML document, response
     *     text, or an Array containing the text and DOM node in that order.
     */

    var doc,
        docText;

    if (TP.isEmpty(text)) {
        return null;
    }

    if (type === TP.TEXT) {
        return text;
    }

    try {
        //  Make sure to convert HTML entities to XML entities,
        //  especially for IE's XML parser
        docText = TP.htmlEntitiesToXMLEntities(text);
        doc = TP.documentFromString(docText, null, report);
    } catch (e) {
        if (TP.notFalse(report)) {
            TP.raise(this,
                    'TP.sig.DOMParseException',
                    TP.ec(e, TP.join('Unable to parse: ', text)));
        }

        //  "best" or null result type should default to the text.
        if (type !== TP.DOM) {
            return text;
        }

        return null;
    }

    //  watch out for "empty documents"
    if (TP.isDocument(doc) && doc.childNodes.length > 0) {
        return doc;
    }

    //  "best" or null result type should default to the text.
    if (type !== TP.DOM) {
        return text;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriResultType',
function(targetUrl, resultType) {

    /**
     * @method uriResultType
     * @summary Returns a reasonable result type, TP.TEXT or TP.DOM, based on
     *     examination of the targetUrl's extension. The extensions for XML are
     *     kept in TP.boot.$xmlMimes so if a match isn't happening check there.
     *     If a resultType is provided it is always returned as the result.
     * @param {String} targetUrl A url to define a result type for.
     * @param {TP.TEXT|TP.DOM|null} resultType A result type constant.
     * @exception TP.sig.InvalidURI
     * @returns {Object} TP.TEXT|TP.DOM|null.
     */

    if (!TP.isString(targetUrl)) {
        return TP.raise(this, 'TP.sig.InvalidURI');
    }

    return TP.boot.$uriResultType(targetUrl, resultType);
});

//  ----------------------------------------------------------------------------

TP.definePrimitive('uriRoot',
function(aURI) {

    /**
     * @method uriRoot
     * @summary Returns the root of the URL, essentially the scheme and
     *     scheme-specific lead-in content. This routine essentially gives you
     *     back the http://, https://, or file:// portion which does not include
     *     any of the path.
     * @param {String|TP.uri.URI} aURI The URI to process.
     * @returns {String} The root of the URI.
     */

    var url,
        path,
        str,
        parts;

    url = TP.str(aURI);
    if (TP.isEmpty(url)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    path = TP.uriHead(url);
    if (TP.isEmpty(path)) {
        return;
    }

    //  If there's no :// portion this won't provide interesting results.
    if (!/:\/\//.test(path)) {
        return;
    }

    if (TP.sys.isHTTPBased() || TP.sys.isWin()) {
        //  On HTTP uris you need the host:port portion as a root. To find that
        //  we essentially scan for the 3rd '/' since that sets off the root
        //  from the remaining portions of the URL. On windows if you don't
        //  include the drive spec in the root the files won't be found. This is
        //  consistent with IE behavior.
        parts = path.split('://');

        if (/\//.test(parts.at(1))) {
            //  If there's a path portion split that off.
            str = parts.at(0) +
                    '://' +
                    parts.at(1).slice(0, parts.at(1).indexOf('/'));
        } else {
            str = path;
        }
    } else {
        //  on unix-style platforms there's no drive spec to mess things up
        //  when resolving 'absolute' paths starting with '/'
        str = 'file://';
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriSplitFragment',
function(aFragment, aScheme) {

    /**
     * @method uriSplitFragment
     * @summary Splits the supplied fragment into parts, according to the
     *     XPointer scheme of the fragment, if present, or a supplied XPointer
     *     scheme. See the TP.getAccessPathParts() method for more information
     *     on what may be returned from this method.
     * @param {String} aFragment The pointer fragment. Note that this may
     *     contain an XPointer and, if the path contains one as well and they
     *     don't match, the path will be returned unchanged.
     * @param {String} [aScheme] An optional XPointer scheme to use when it
     *     cannot be determined from the supplied fragment.
     * @returns {String[]} The fragment split into its constituent parts.
     */

    var pathFragment,

        fragmentScheme,
        fragmentExpr,

        results;

    if (TP.isEmpty(aFragment)) {
        return TP.ac(aFragment);
    }

    //  If the fragment is '.', that a self-reference. Just return it.
    if (aFragment === '.') {
        return TP.ac(aFragment);
    }

    pathFragment = aFragment;

    //  See if the path fragment contains an XPointer. If so, grab it's
    //  scheme and expression.
    if (TP.notEmpty(results = TP.regex.ANY_POINTER.match(pathFragment))) {
        fragmentScheme = results.at(1);
        fragmentExpr = results.at(2);
    } else {
        //  If we were supplied a scheme, try to use it with the path
        if (TP.notEmpty(aScheme)) {
            if (TP.notEmpty(results = TP.regex.ANY_POINTER.match(
                                        aScheme + '(' + pathFragment + ')'))) {
                fragmentScheme = results.at(1);
                fragmentExpr = results.at(2);
            }
        }
    }

    //  Couldn't compute result
    if (TP.isEmpty(results)) {
        //  We do not process barename XPointers any further - just return the
        //  barename.
        if (TP.regex.BARENAME.test('#' + pathFragment)) {
            return TP.ac(pathFragment);
        }
    }

    //  No fragment expression? There is no fragment.
    if (TP.isEmpty(fragmentExpr)) {
        return null;
    }

    //  Couldn't slice out a scheme? Try the supplied one.
    if (TP.isEmpty(fragmentScheme)) {
        fragmentScheme = aScheme;
    }

    //  Probably a barename
    if (TP.isEmpty(fragmentScheme)) {
        if (TP.regex.BARENAME.test('#' + fragmentExpr)) {
            return TP.ac(fragmentExpr);
        }
    }

    //  Go ahead and grab the path parts.
    if (TP.notEmpty(fragmentExpr)) {
        return TP.getAccessPathParts(fragmentExpr, fragmentScheme);
    }

    return null;
});

//  ------------------------------------------------------------------------
//  FILE NAME
//  ------------------------------------------------------------------------

/*
Utilities to extract file name information from file paths.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('uriExtension',
function(aPath, aSeparator) {

    /**
     * @method uriExtension
     * @summary Returns the file extension for the file path provided.
     * @param {String} aPath The path to the file.
     * @param {String} aSeparator A single character. Default is '.'.
     * @exception TP.sig.InvalidURI
     * @returns {String}
     */

    var name,
        ndx,
        sep;

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidURI');
    }

    name = TP.uriName(aPath);

    //  we're looking for a separator here, but only if it's not
    //  the first character in the name. we don't want to return .vimrc as a
    //  file extension for our .vimrc file after all ;)
    sep = TP.ifInvalid(aSeparator, '.');
    ndx = name.lastIndexOf(sep);

    if (ndx === TP.NOT_FOUND || ndx === 0) {
        return '';
    } else {
        return name.slice(ndx + 1);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriName',
function(aPath) {

    /**
     * @method uriName
     * @summary Returns the file name, minus any path information.
     * @param {String} aPath The path to the file.
     * @exception TP.sig.InvalidURI
     * @returns {String}
     */

    var slash,
        index;

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidURI');
    }

    //  paths containing backslashes, such as paths on Windows, will use
    //  backslash as their test slash
    if (/\\/.test(aPath)) {
        slash = '\\';
    } else {
        slash = '/';
    }

    index = aPath.lastIndexOf(slash);
    if (index !== TP.NOT_FOUND) {
        return aPath.slice(index + 1);
    }

    return aPath;
});

//  ------------------------------------------------------------------------
//  FILE ROOTS
//  ------------------------------------------------------------------------

/*
To support dynamic loading of TIBET components it's often necessary to rely
on a 'root path' from which to construct full path names to components. The
functions here support operations focused on either the overall library or
the current application root paths.
*/

//  ------------------------------------------------------------------------

TP.defineMethod('getAppHead',
function() {

    /**
     * @method getAppHead
     * @summary Returns the path to the head portion of index.html or whichever
     * file trigged TIBET to launch.
     * @returns {String}
     */

    return TP.boot.$getAppHead();
});

//  ------------------------------------------------------------------------

TP.defineMethod('getAppRoot',
function() {

    /**
     * @method getAppRoot
     * @summary Returns the path to the application. This is the directory just
     *     above the boot directory tree in the bootfile parameter value. That
     *     value is set by the boot system on startup.
     * @returns {String}
     */

    return TP.boot.$getAppRoot();
});

//  ------------------------------------------------------------------------

TP.defineMethod('getLibRoot',
function() {

    /**
     * @method getLibRoot
     * @summary Returns the root path from which TIBET can be found (i.e. where
     *     'tibet/..' was loaded from). This information can be used to allow
     *     developers to use relative paths in their application constructed
     *     from the root path. Note that the path returned always includes a
     *     trailing '/'.
     * @returns {String}
     */

    return TP.boot.$getLibRoot();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriWithRoot',
function(targetUrl, aRoot) {

    /**
     * @method uriWithRoot
     * @summary Returns the filename provided with any additional root
     *     information which is necessary to create a full path name.
     * @param {String} targetUrl A url to expand as needed.
     * @param {String} aRoot Optional root (libroot or approot usually) to root
     *     from.
     * @exception TP.sig.InvalidURI
     * @returns {String} The url, after ensuring a root exists.
     */

    var root,
        url;

    if (!TP.isString(targetUrl)) {
        return TP.raise(this, 'TP.sig.InvalidURI');
    }

    if (TP.uriIsAbsolute(targetUrl)) {
        url = TP.uriResolvePaths(targetUrl);
    } else {
        root = aRoot;
        if (TP.notValid(root)) {
            root = TP.sys.getLaunchRoot();
        }
        url = TP.uriResolvePaths(root, targetUrl);
    }

    return TP.uriExpandPath(url);
});

//  ------------------------------------------------------------------------

TP.defineMethod('fileWithRoot', TP.uriWithRoot.copy());

//  ------------------------------------------------------------------------
//  TEMP FILES
//  ------------------------------------------------------------------------

TP.definePrimitive('uriTempFileName',
function(targetUrl, filePrefix, fileSuffix) {

    /**
     * @method uriTempFileName
     * @summary Returns a generated file name which can be used in building a
     *     temporary file. The targetUrl is used as the root directory for the
     *     temp file while the prefix and suffix will be used to create more
     *     "regular" names that are groupable.
     * @param {String} targetUrl A directory name in which to locate the file.
     *     Default is path.app_tmp.
     * @param {String} filePrefix An optional prefix for the file which allows
     *     you to group like-named temp files in listings etc.
     * @param {String} fileSuffix An optional suffix for the file. Default is
     *     'tmp'.
     * @returns {String} A new file name with the directory and a new temp file
     *     name.
     */

    var root,
        prefix,
        suffix,
        origPrefix,
        name;

    //  we'll use web format here to help the join work consistently. NOTE
    //  that this call will also expand virtual URI syntax for us
    root = TP.uriInWebFormat(TP.ifEmpty(targetUrl, TP.sys.cfg('path.app_tmp')));

    prefix = TP.ifInvalid(filePrefix, '');
    suffix = TP.ifInvalid(fileSuffix, 'tmp');

    //  trick here is that we don't want $'s in file names, so we ensure
    //  we're controlling the prefix from the OID generation here
    try {
        origPrefix = TP.OID_PREFIX;
        TP.OID_PREFIX = '_';

        name = TP.uriJoinPaths(root, TP.join(TP.genID(prefix), '.', suffix));
    } catch (e) {
        void 0;
    } finally {
        TP.OID_PREFIX = origPrefix;
    }

    return name;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

