//  ========================================================================
/*
NAME:   TIBETURIPrimitivesPre.js
AUTH:   Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

*/
//  ========================================================================

/**
 * @Common URI (file) access and support functions used as a starting point for
 *     many of the URI-related functionality in TIBET.
 * @todo
 */

//  ------------------------------------------------------------------------
//  FILE PATHS
//  ------------------------------------------------------------------------

/**
 * @File path manipulation. These provide a foundation for TIBET to operate on
 *     files accessible via either HTTP or FILE urls. Also, we try to adapt to
 *     platform variations like the need to quote filenames on Windows that may
 *     include spaces in them. Additional functions specific to each browser are
 *     contained in the *Moz.js and *IE.js versions of this file.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.definePrimitive('uriCollapsePath',
function(aPath) {

    /**
     * @name uriCollapsePath
     * @synopsis Normalizes a URI path to remove any embedded . or .. segments
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
     * @raises TP.sig.InvalidURI
     * @returns {String}
     */

    var path,
        reverse,
        newpath;

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidURI', arguments);
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
     * @name uriCollectionPath
     * @synopsis Returns the 'collection path' for the URI, i.e. the entire path
     *     minus any file-specific portion.
     * @param {String} aPath The URI to slice to access the collection href.
     * @raises TP.sig.InvalidURI
     * @returns {String} The uri's collection path.
     */

    var path,
        index,
        slash;

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidURI', arguments);
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

//  ------------------------------------------------------------------------

TP.definePrimitive('uriExpandPath',
function(aPath) {

    /**
     * @name uriExpandPath
     * @synopsis Returns the expanded form of the TIBET '~' (tilde) path
     *     provided. This method is used extensively to help low-level URI
     *     primitives operate effectively with TIBET paths.
     * @param {String} aPath The TIBET path to expand.
     * @raises TP.sig.InvalidURI
     * @returns {String} A newly constructed path string.
     */

    var path,
        arr,
        variable,
        value,
        start;

    TP.debug('break.uri_virtual');

    //  not a real path, but we can't assume what should come next
    if (TP.isEmpty(aPath)) {
        return '';
    }

    start = aPath.replace('tibet:///~', '~');

    //  if the path starts with '~' we adjust to the proper root
    if (start.indexOf('~') !== 0) {
        return start;
    }

    path = start;

    if (path === '~') {
        return TP.sys.getAppHead();
    } else if (path === '~app') {
        return TP.sys.getAppRoot();
    } else if (path === '~tibet') {
        return TP.sys.getLibRoot();
    } else if (path.indexOf('~/') === 0) {
        //  Note here how we also slice off the leading slash so that
        //  TP.uriJoinPaths() doesn't think 'path' is an absolute path.
        path = TP.uriJoinPaths(TP.sys.getAppHead(), path.slice(2));
    } else if (path.indexOf('~app/') === 0) {
        //  Note here how we also slice off the leading slash so that
        //  TP.uriJoinPaths() doesn't think 'path' is an absolute path.
        path = TP.uriJoinPaths(TP.sys.getAppRoot(), path.slice(2));
    } else if (path.indexOf('~tibet/') === 0) {
        //  Note here how we also slice off the leading slash so that
        //  TP.uriJoinPaths() doesn't think 'path' is an absolute path.
        path = TP.uriJoinPaths(TP.sys.getLibRoot(), path.slice(7));
    } else {
        arr = path.match(/~([^\/]*)\/(.*)/);
        if (TP.notValid(arr)) {
            arr = path.match(/~([^\/]*)/);
        }

        if (arr) {
            variable = arr.at(1);

            //  NOTE we resolve these variables from the config data
            if (TP.isString(value = TP.sys.cfg('path.' + variable))) {
                //  one issue here is that we may have a variable value
                //  that starts with or ends with a '/' since they're
                //  parts of paths, but we don't want to alter that
                //  aspect of the current path so we want to trim them
                //  off if found
                if (value.indexOf('/') === 0) {
                    value = value.slice(1);
                }

                if (value.last() === '/') {
                    value = value.slice(0, -1);
                }

                //  patch the original path for testing
                path = start.replace('~' + variable, value);
            }
        }
    }

    //  variable expansions can sometimes create additional ~ paths
    if ((path !== start) && (path.indexOf('~') === 0)) {
        return TP.boot.$uriExpandPath(path);
    }

    return path;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriGetXPointerData',
function(aURI, aNode, shouldClone) {

    /**
     * @name getXPointerData
     * @synopsis Returns the XML data defined by the XPointer relative to the
     *     node provided. The node is presumed to be the content node from the
     *     URI's document href.
     * @param {String} aURI A uri String defining an XPointer fragment.
     * @param {Node} aNode A node containing the overall document content for
     *     the URI provided.
     * @param {Boolean} shouldClone True will cause the nodes found to be cloned
     *     rather than returned as is. The default is true.
     * @raises TP.sig.InvalidURI,TP.sig.InvalidNode
     * @returns {Array} An array containing zero or more Nodes.
     * @todo
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
        return TP.raise(this, 'TP.sig.InvalidURI', arguments);
    }

    if (TP.notValid(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode', arguments);
    }

    if (TP.isNode(aNode)) {
        node = aNode;
    } else if (TP.canInvoke(aNode, 'getNativeNode')) {
        node = aNode.getNativeNode();
    } else {
        return TP.raise(this, 'TP.sig.InvalidNode', arguments);
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

//  ------------------------------------------------------------------------

TP.definePrimitive('uriInLocalFormat',
function(aPath) {

    /**
     * @name uriInLocalFormat
     * @synopsis Returns the path used by the local operating system to access a
     *     particular path's resource. On Windows this will return a path of the
     *     form [drive]:\segment\segment while on *NIX platforms it will be a
     *     path of the form /segment/segment
     *
     *     NOTE that this method will unescape any escape() processing on the
     *     return value. Also NOTE that this method will _not_ quote paths with
     *     spaces since the majority of lower-level browser calls will fail on
     *     quoted input.
     * @param {String} aPath The path to repair.
     * @raises TP.sig.InvalidURI
     * @returns {String}
     */

    var path;

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidURI', arguments);
    }

    //  On Windows we can be drive:\something or \\something. All others
    //  need a /something path for this test to work
    if ((TP.boot.isWin() &&
            (TP.regex.WINDOWS_PATH.test(aPath) ||
                TP.regex.UNC_PATH.test(aPath))) ||
        TP.regex.ROOT_PATH.test(aPath)) {
        return unescape(aPath);
    }

    //  make sure we've got the fully-expanded path for what follows
    path = TP.uriExpandPath(aPath);

    //  if, after expansion, we're looking at a non-file URI just return it
    //  since there's not enough information to do anything else with it
    if (path.indexOf('file:') !== 0) {
        //  NOTE that we don't return the expanded path, we leave the
        //  incoming path in whatever form it came in, minus any escaping
        return unescape(aPath);
    }

    //  remove the file scheme prefix. we clearly won't need that
    path = unescape(TP.uriMinusFileScheme(path));

    //  if we're not on Windows we're done. should have a path of the form
    //  /blah, or ../blah, etc.
    if (!TP.boot.isWin()) {
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
    return unescape(TP.uriMinusFileScheme(aPath));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriInWebFormat',
function(aPath, aRoot) {

    /**
     * @name uriInWebFormat
     * @synopsis Returns the path with proper adjustments made to represent a
     *     proper URI (forward slashes, scheme prefixing, etc). NOTE that the
     *     response is _not_ escape()'d so it will be in the form expected by
     *     the rest of TIBET's functions and in the form more readable/typical
     *     for an end user.
     * @param {String} aPath The path to repair.
     * @param {String} aRoot The root to use for relative path resolution.
     *     Default is TP.sys.getAppRoot();.
     * @returns {String}
     * @todo
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
    if (TP.regex.WINDOWS_PATH.test(aPath) ||
        TP.regex.UNC_PATH.test(aPath)) {
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
    return TP.uriPlusFileScheme(TP.uriWithRoot(aPath));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriIsAbsolute',
function(aPath) {

    /**
     * @name uriIsAbsolute
     * @synopsis Returns true if the path provided is an absolute path.
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

    if (TP.boot.isWin()) {
        //  on Windows we can also have either drive:\blah, or \\blah paths
        //  which are considered absolute
        return TP.regex.WINDOWS_PATH.test(path) ||
            TP.regex.UNC_PATH.test(path);
    } else {
        //  non-Windows paths need a leading slash
        return path.first() === '/';
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriJoinPaths',
function(firstPath, secondPath) {

    /**
     * @name uriJoinPaths
     * @synopsis Returns the two path components joined appropriately. Note that
     *     the second path has precedence, meaning that if the second path
     *     appears to be an absolute path the first path isn't used.
     * @param {String} firstPath The 'root' path.
     * @param {String} secondPath The 'tail' path.
     * @returns {String} The two paths joined together in an appropriate
     *     fashion.
     * @todo
     */

    var i,
        val,
        first,
        second,
        path;

    TP.debug('break.uri_resolve');

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
    while (second.indexOf('../') === 0) {
        second = second.slice(3, second.getSize());
        first = first.slice(0, first.lastIndexOf('/'));
    }

    //  join what's left
    if (second.charAt(0) !== '/') {
        val = first + '/' + second;
    } else {
        val = first + second;
    }

    return val;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriJoinQuery',
function(aPath, aQuery) {

    /**
     * @name uriJoinQuery
     * @synopsis Joins a URI and query fragment, ensuring the proper join
     *     character is used. The path is a String, while the query can be a
     *     string or hash of key/value pairs.
     * @param {String} aPath The URI string used as the prefix.
     * @param {String} aQuery The query fragment.
     * @raises TP.sig.InvalidURI
     * @returns {String} A properly joined URI/Query string.
     * @todo
     */

    var url,
        query,
        fragment,
        parts,
        delim;

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidURI', arguments);
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
     * @name uriMinusFileScheme
     * @synopsis Returns the filename trimmed of any leading file://[/] chars.
     *     This is often necessary for proper use based on host platform.
     * @param {String} aPath The path to trim.
     * @raises TP.sig.InvalidURI
     * @returns {String} The path with any leading file:// portion trimmed off.
     */

    var path;

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidURI', arguments);
    }

    if (aPath.toLowerCase().indexOf('file:') !== 0) {
        return aPath;
    }

    //  slice off the file:// number of chars, removing the base prefix
    path = aPath.slice('file://'.length);

    //  on Windows we may need to slice 1 more character if the path
    //  matches /drive: rather than a UNC path
    if (TP.boot.isWin() && /^\/\w:/.test(path)) {
        path = path.slice(1);
    }

    return path;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriNeedsPrivileges',
function(aPath) {

    /**
     * @name uriNeedsPrivileges
     * @synopsis Returns true if accessing the supplied path requires special
     *     browser security privileges to be accessed, based on where TIBET got
     *     launched from.
     * @param {String} aPath The path to test.
     * @raises TP.sig.InvalidURI
     * @returns {Boolean} True if the path requires special privileges to
     *     access.
     */

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidURI', arguments);
    }

    //  If the path doesn't start with the launch root, then we can assume
    //  that it needs special security privileges.
    return (aPath.indexOf(TP.sys.getLaunchRoot()) !== 0);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriPlusFileScheme',
function(aPath) {

    /**
     * @name uriPlusFileScheme
     * @synopsis Returns the filename padded with leading file://[/] characters
     *     appropriate for the current operating system platform.
     * @param {String} aPath The path to pad.
     * @raises TP.sig.InvalidURI
     * @returns {String}
     */

    var prefix,
        path;

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidURI', arguments);
    }

    if (aPath.toLowerCase().indexOf('file:') === 0) {
        return aPath;
    }

    prefix = 'file://';

    if (TP.boot.isWin() && /^\w:/.test(aPath)) {
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
     * @name uriRelativeToPath
     * @synopsis Returns a "relativized" version of the firstPath at it relates
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
     * @todo
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

    TP.debug('break.uri_resolve');

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
    if ((first.length > 1) && (first.lastIndexOf('/') === first.length - 1)) {
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
            if (second.lastIndexOf('/') === (second.length - 1)) {
                second = second.slice(0, -1);
                second = second.slice(0, second.lastIndexOf('/'));
            } else {
                second = second.slice(0, second.lastIndexOf('/'));
            }
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
        if (second.lastIndexOf('/') === (second.length - 1)) {
            second = second.slice(0, -1);
        }
    } else {
        //  try to determine if the second path is a file path or a
        //  directory path...the easiest check is does it end with a '/',
        //  after which we can check for an extension on the last portion
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
    while (ndx !== -1) {
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

TP.definePrimitive('uriResolvePaths',
function(aRootPath, aRelativePath, filePath) {

    /**
     * @name uriResolvePaths
     * @synopsis Returns an absolute path to the second referenced resource when
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
     * @raises TP.sig.InvalidURI
     * @returns {String}
     * @todo
     */

    var url,
        prefix,
        first,
        second,
        type;

    //  if there's no second path then we can do things quicker for the
    //  common cases where we've only been provided a root path
    if (TP.isEmpty(aRelativePath)) {
        if (TP.isEmpty(aRootPath)) {
            return decodeURI(window.location.toString());
        }
        else    //  root path only, most common case
        {
            first = TP.str(aRootPath);

            //  when the first path was a ~ or scheme-based path we can
            //  just return it, but we prepend tibet:/// to normalize tibet
            //  refs
            if (TP.uriIsAbsolute(first)) {
                return TP.regex.VIRTUAL_URI_PREFIX.test(first) ?
                        'tibet:///' + first :
                        first;
            }

            //  first path isn't considered absolute? all we can do is
            //  expand it as best we can and return the result if it's
            //  absolute
            if (first.indexOf('//') === 0) {
                //  special case which strips host and/or drive spec
                prefix = TP.sys.getScheme();

                return (prefix.last() === ':') ? prefix + first :
                                            prefix + ':' + first;
            } else if (first.indexOf('/') === 0) {
                //  a leading slash is actually relative to the launch root
                //  which with http is the server root and with files is
                //  supported here as relative to the root of the drive
                //  (Win) or file system (*NIX) from which we launched

                //  Note here how we slice off the leading slash from
                //  first so that TP.uriJoinPaths() doesn't think its an
                //  absolute path and just return it as the result.
                return TP.uriJoinPaths(TP.sys.getLaunchRoot(),
                                        first.slice(1));
            }

            //  first path is relative, no second path, so we'll default to
            //  presuming things are relative to the app root
            return TP.uriJoinPaths(TP.sys.getAppRoot(), first);
        }
    }
    else    //  second path not empty
    {
        //  next test is whether the second path is absolute and if it is
        //  we can simply return it (but we prepend tibet:/// to normalize
        //  tibet refs). Note that TIBET URIs prefixed with ~ are considered
        //  absolute for this test
        if (TP.uriIsAbsolute(aRelativePath)) {
            return TP.regex.VIRTUAL_URI_PREFIX.test(aRelativePath) ?
                        'tibet:///' + aRelativePath :
                        aRelativePath;
        }

        //  two other cases where we may still have an absolute path, but we
        //  need to expand them to their full form before we return
        second = TP.str(aRelativePath);

        if (second.indexOf('//') === 0) {
            //  special case which strips host and/or drive spec
            prefix = TP.sys.getScheme();

            return (prefix.last() === ':') ? prefix + second :
                                        prefix + ':' + second;
        } else if (second.indexOf('/') === 0) {
            //  a leading slash is actually relative to the launch root
            //  which with http is the server root and with files is
            //  supported here as relative to the root of the drive
            //  (Win) or file system (*NIX) from which we launched

            //  Note here how we slice off the leading slash from second
            //  so that TP.uriJoinPaths() doesn't think its an absolute path
            //  and just return it as the result.
            return TP.uriJoinPaths(TP.sys.getLaunchRoot(), second.slice(1));
        }

        if (TP.isEmpty(aRootPath)) {
            //  second appears to be truly relative, but no first...
            return TP.uriJoinPaths(TP.sys.getAppRoot(), second);
        } else {
            //  two path values...so we'll be doing some form of join...
            first = TP.str(aRootPath);

            //  to use the lower-level calls to generate a properly adjusted
            //  second. path we'll need to fully expand the first path
            if (first.indexOf('~') === 0) {
                //  TODO:   verify this matters, otherwise just expandTilde
                if (TP.isType(type =
                                TP.sys.getTypeByName('TP.core.TIBETURL'))) {
                    if (TP.isValid(url =
                                    type.construct('tibet:///' + first))) {
                        //  force URI resolution to occur
                        if (TP.isURI(url = url.getPrimaryURI())) {
                            first = url.getLocation();
                        }
                    }
                } else {
                    first = TP.uriExpandPath(first);
                }

                //  didn't resolve? then we can consider the first URI
                //  invalid
                if (TP.isEmpty(first) || (first.indexOf('~') === 0)) {
                    return TP.raise(this, 'TP.sig.InvalidURI', arguments,
                            'First URI must resolve to absolute path.');
                }
            } else if (first.indexOf('//') === 0) {
                //  special case which strips host and/or drive spec
                prefix = TP.sys.getScheme();

                first = (prefix.last() === ':') ? prefix + first :
                                            prefix + ':' + first;
            } else if (first.indexOf('/') === 0) {
                //  a leading slash is actually relative to the launch root
                //  which with http is the server root and with files is
                //  supported here as relative to the root of the drive
                //  (Win) or file system (*NIX) from which we launched

                //  Note here how we slice off the leading slash from
                //  first so that TP.uriJoinPaths() doesn't think its an
                //  absolute path and just return it as the result.
                first = TP.uriJoinPaths(TP.sys.getLaunchRoot(),
                                        first.slice(1));
            }

            //  with the path expanded we can now use the lower-level call
            //  to get the second path "adjusted" for use, paying attention
            //  to any file path information passed in regarding the root
            second = TP.uriRelativeToPath(second, first, filePath);

            return TP.uriJoinPaths(first, second);
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriResolveVirtualPath',
function(aPath, resourceOnly) {

    /**
     * @name uriResolveVirtualPath
     * @synopsis Returns a string with the URI path provided fully resolved to
     *     an absolute path of some form.
     * @param {String} aPath The TIBET URI string to resolve.
     * @param {Boolean} resourceOnly Strip off any prefixing canvas? Default is
     *     false.
     * @raises TP.sig.InvalidURI,TP.sig.InvalidCanvas
     * @returns {String} The fully resolved path.
     * @todo
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

    TP.debug('break.uri_virtual');

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidURI', arguments);
    }

    url = aPath;

    //  has to start with tibet: or ~ to be resolvable
    if (!TP.regex.TIBET_URI.test(aPath)) {
        return aPath;
    }

    pointer = '';

    //  for scheme-based paths we can split to get the parts
    if (url.indexOf('tibet:') === 0) {
        parts = url.match(TP.regex.TIBET_URI_SPLITTER);
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

    //  with the path portion extracted we can check for the most common
    //  cases now, which are those involving ~ references (otherwise why use
    //  a TIBET URI :))
    if (path === '~tibet') {
        return TP.sys.getLibRoot();
    } else if (path === '~app') {
        return TP.sys.getAppRoot();
    } else if (path === '~') {
        return TP.sys.getAppHead();
    } else if (path === '/') {
        return TP.sys.getLaunchRoot();
    } else if (path.indexOf('~tibet/') === 0) {
        arr = path.match(/~tibet\/(.*)/);
        path = TP.uriJoinPaths(TP.sys.getLibRoot(), arr.last());
    } else if (path.indexOf('~app/') === 0) {
        arr = path.match(/~app\/(.*)/);
        path = TP.uriJoinPaths(TP.sys.getAppRoot(), arr.last());
    } else if (path.indexOf('~/') === 0) {
        arr = path.match(/~\/(.*)/);
        path = TP.uriJoinPaths(TP.sys.getAppHead(), arr.last());
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
            //  one issue here is that we may have a variable value that
            //  starts with or ends with a '/' since they're parts of paths,
            //  but we don't want to alter that aspect of the current path
            //  so we want to trim them off if found
            if (value.indexOf('/') === 0) {
                value = value.slice(1);
            }

            if (value.last() === '/') {
                value = value.slice(0, -1);
            }

            path = aPath.replace('~' + variable, value);
            if (path !== aPath) {
                //  cause re-evaluation with the expanded variable value
                return TP.uriResolveVirtualPath(path);
            }
        } else if (TP.isType(type = TP.sys.getTypeByName(variable))) {
            value = TP.objectGetLoadCollectionPath(type);

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
            (canvas !== TP.gid(window).strip(/tibet:\/\//))) {
            path = path.replace('javascript:',
                                'javascript:' + canvas + '.');
        }
    }

    //  if we had tibet:/// with no canvas spec we allow that to be removed,
    //  but all other cases where a canvas is defined we must preserve

    if (TP.notTrue(resourceOnly) && (url.indexOf('tibet:') === 0)) {
        parts = url.match(TP.regex.TIBET_URI_SPLITTER);
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
     * @name uriResult
     * @synopsis Returns the proper result format given the result text and
     *     result type, typically from an XMLHttpRequest's responseText.
     * @param {String} text The response text to process.
     * @param {TP.DOM|TP.TEXT|TP.BEST|null} type The result type desired. The
     *     default is TP.BEST.
     * @param {Boolean} report True if errors during document creation should be
     *     reported.
     * @returns {String|Document|Array} An XML document, response text, or an
     *     array containing the text and DOM node in that order.
     * @todo
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
        docText = TP.htmlEntitiesToXmlEntities(text);
        doc = TP.documentFromString(docText, null, report);
    } catch (e) {
        if (TP.notFalse(report)) {
            TP.raise(this,
                    'TP.sig.DOMParseException',
                    arguments,
                    TP.ec(e, TP.join('Unable to parse: ', text)));
        }

        //  "best" or null result type should default to the text.
        if (type !== TP.DOM) {
            return text;
        }

        return null;
    }

    //  watch out for "empty documents"
    if (TP.isDocument(doc) && (doc.childNodes.length > 0)) {
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
     * @name $uriResultType
     * @synopsis Returns a reasonable result type, TP.TEXT or TP.DOM, based on
     *     examination of the targetUrl's extension. If that check isn't
     *     definitive then the original resultType is returned (which may mean a
     *     null result type is returned).
     * @param {String} targetUrl A url to define a result type for.
     * @param {TP.TEXT|TP.DOM|null} resultType A result type constant.
     * @raises TP.sig.InvalidURI
     * @returns {Object} TP.TEXT|TP.DOM|null.
     * @todo
     */

    if (!TP.isString(targetUrl)) {
        return TP.raise(this, 'TP.sig.InvalidURI', arguments);
    }

    if (!TP.isRegExp(TP.regex.XML_EXTENSIONS)) {
        TP.regex.XML_EXTENSIONS = TP.regExpConstruct(
            TP.XML_EXTENSIONS, '\\.', '$');
    }

    if (TP.isRegExp(TP.regex.XML_EXTENSIONS)) {
        if (TP.regex.XML_EXTENSIONS.test(targetUrl)) {
            return TP.DOM;
        }
    } else if (/\.xml$|\.xhtml$|\.tsh$|\.xsl$|\.xsd$/.test(targetUrl)) {
        return TP.DOM;
    }

    //  Certain extensions are clearly not intended to be XML, like .js and
    //  .css files for example. We ignore any input result type in these
    //  cases since there's no way they should be TP.DOM even if specified.
    if (/\.js$|\.css$|\.html$|\.txt$|\.json$/.test(targetUrl)) {
        return TP.TEXT;
    }

    return resultType;
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
     * @name uriExtension
     * @synopsis Returns the file extension for the file path provided.
     * @param {String} aPath The path to the file.
     * @param {String} aSeparator A single character. Default is '.'.
     * @raises TP.sig.InvalidURI
     * @returns {String}
     * @todo
     */

    var name,
        ndx,
        sep;

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidURI', arguments);
    }

    name = TP.uriName(aPath);

    //  we're looking for a separator here, but only if it's not
    //  the first character in the name. we don't want to return .vimrc as a
    //  file extension for our .vimrc file after all ;)
    sep = TP.ifInvalid(aSeparator, '.');
    ndx = name.lastIndexOf(sep);

    if ((ndx === TP.NOT_FOUND) || (ndx === 0)) {
        return '';
    } else {
        return name.slice(ndx + 1);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriName',
function(aPath) {

    /**
     * @name uriName
     * @synopsis Returns the file name, minus any path information.
     * @param {String} aPath The path to the file.
     * @raises TP.sig.InvalidURI
     * @returns {String}
     */

    var slash,
        index;

    if (!TP.isString(aPath)) {
        return TP.raise(this, 'TP.sig.InvalidURI', arguments);
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

TP.sys.defineMethod('getAppHead',
function() {

    /**
     * @name getAppHead
     * @synopsis Returns the path to the head portion of index.html or whichever
     * file trigged TIBET to launch.
     * @returns {String}
     */

    return TP.boot.$$apphead || TP.boot.$getAppHead();
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getAppRoot',
function() {

    /**
     * @name getAppRoot
     * @synopsis Returns the path to the application. This is the directory just
     *     above the boot directory tree in the bootfile parameter value. That
     *     value is set by the boot system on startup.
     * @returns {String}
     */

    return TP.boot.$$approot || TP.boot.$getAppRoot();
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getLibRoot',
function() {

    /**
     * @name getLibRoot
     * @synopsis Returns the root path from which TIBET can be found (i.e. where
     *     'tibet/..' was loaded from). This information can be used to allow
     *     developers to use relative paths in their application constructed
     *     from the root path. Note that the path returned always includes a
     *     trailing '/'.
     * @returns {String}
     */

    return TP.boot.$$libroot || TP.boot.$getLibRoot();
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriWithRoot',
function(targetUrl, aRoot) {

    /**
     * @name uriWithRoot
     * @synopsis Returns the filename provided with any additional root
     *     information which is necessary to create a full path name.
     * @param {String} targetUrl A url to expand as needed.
     * @param {String} aRoot Optional root (libroot or approot usually) to root
     *     from.
     * @raises TP.sig.InvalidURI
     * @returns {String} The url, after ensuring a root exists.
     * @todo
     */

    var root;

    if (!TP.isString(targetUrl)) {
        return TP.raise(this, 'TP.sig.InvalidURI', arguments);
    }

    if (TP.uriIsAbsolute(targetUrl)) {
        return TP.uriResolvePaths(targetUrl);
    } else {
        root = TP.ifInvalid(aRoot, TP.sys.getLibRoot());
        return TP.uriResolvePaths(root, targetUrl);
    }
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('fileWithRoot', TP.uriWithRoot.copy());

//  ------------------------------------------------------------------------
//  TEMP FILES
//  ------------------------------------------------------------------------

TP.definePrimitive('uriTempFileName',
function(targetUrl, filePrefix, fileSuffix) {

    /**
     * @name uriTempFileName
     * @synopsis Returns a generated file name which can be used in building a
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
     * @todo
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
    } finally {
        TP.OID_PREFIX = origPrefix;
    }

    return name;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
