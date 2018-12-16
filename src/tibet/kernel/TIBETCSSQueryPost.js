//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

TP.definePrimitive('elementMatchesCSS',
function(anElement, aSelector) {

    /**
     * @method elementMatchesCSS
     * @summary Returns true if the selector provided would locate the element
     *     in a result set. This is roughly equivalent to running the query and
     *     checking the result set as to whether it contains the supplied
     *     Element. Note that all queries in this method use the supplied
     *     element's document as their context.
     * @param {HTMLElement} anElement The element to test.
     * @param {String} aSelector A valid CSS selector.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidString
     * @returns {Boolean} True if the element would be found by the selector.
     */

    var matchesSelector;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(aSelector)) {
        return TP.raise(this, 'TP.sig.InvalidString',
                        'Invalid or empty selector');
    }

    //  If the result element was a 'TIBET generated' element (i.e.
    //  generated content), then we ignore it - even if it matches.
    if (TP.isValid(anElement[TP.GENERATED])) {
        return false;
    }

    //  It doesn't really matter what platform we're running on - we filter
    //  all 'browser-specific' selectors.
    if (TP.isTrue(TP.regex.CSS_NATIVE_CUSTOM.test(aSelector))) {
        return false;
    }

    //  If the native version is available, use that. It may be a
    //  vendor-prefixed version or the finally-settled-upon name of 'matches'.
    matchesSelector = anElement.mozMatchesSelector ||
        anElement.webkitMatchesSelector ||
        anElement.msMatchesSelector ||
        anElement.matches;

    //  If Function in matchesSelector is available and the selector doesn't have
    //  a pipe ('|') symbol (i.e. it's not a namespaced query), and it's not a
    //  'scoped selector' (i.e. starts with a combinator - which is not
    //  supported by W3C APIs) then use the native call.
    if (TP.isCallable(matchesSelector) &&
        !TP.regex.HAS_PIPE.test(aSelector) &&
        !TP.regex.CSS_CUSTOM_SCOPED_SELECTOR.test(aSelector)) {
        return matchesSelector.call(anElement, aSelector);
    }

    //  Cache the number of namespaces we've installed so that we don't do this
    //  every time this method gets called.
    if (TP.notDefined(TP.$$installedCSSNSCount) ||
        TP.$$installedCSSNSCount !== TP.w3.Xmlns.get('prefixes').getSize()) {

        //  Make sure all of the known namespaces are defined (note this is
        //  added to the 'xmlns' property of the 'extended jQuery' - see below -
        //  but since Sizzle functions are just aliased over to jQuery
        //  functions, we can use the original Sizzle function here).
        TP.w3.Xmlns.get('prefixes').perform(
            function(item) {
                TP.extern.jQuery.xmlns[item.first()] = item.last();
            });

        TP.$$installedCSSNSCount = TP.w3.Xmlns.get('prefixes').getSize();
    }

    //  Use the native Sizzle 'matches' call. It takes in a selector and an
    //  Array of pre-selected Elements and returns an Array with any of them
    //  that matched. So we supply an Array with the one element we're
    //  testing and if we get back a non-empty Array, we know that it
    //  matched the supplied selector.

    return TP.notEmpty(TP.extern.Sizzle.matches(aSelector, [anElement]));
}, {
    dependencies: [TP.extern.jQuery, TP.extern.Sizzle]
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeAncestorMatchingCSS',
function(aNode, aSelector, stopAncestor) {

    /**
     * @method nodeAncestorMatchingCSS
     * @summary Returns the first ancestor of aNode for which aSelector matches.
     * @param {Node} aNode The DOM node to operate on.
     * @param {String} aSelector The selector to match.
     * @param {Element} [stopAncestor] The ancestor to stop at. If not supplied,
     *     this would be identical to the document node of the document that
     *     aNode is contained in.
     * @exception TP.sig.InvalidNode Raised when an invalid node is provided to
     *     the method.
     * @returns {Element|undefined} The ancestor element that matches the CSS.
     */

    var elem,

        matchesSelector,

        closest;

    if (!TP.isNode(aNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    if (!TP.isElement(aNode)) {
        if (TP.isAttributeNode(aNode)) {
            elem = aNode.ownerElement;
        } else {
            elem = aNode.parentNode;
        }
    } else {
        elem = aNode.parentNode;

        //  If the parent node was either null or a Document, then return
        //  undefined - there is no ancestor matching.
        if (!TP.isElement(elem)) {
            return;
        }
    }

    if (TP.isEmpty(aSelector)) {
        return TP.raise(this, 'TP.sig.InvalidString',
                        'Invalid or empty selector');
    }

    //  If the result element was a 'TIBET generated' element (i.e.
    //  generated content), then we ignore it - even if it matches.
    if (TP.isValid(elem[TP.GENERATED])) {
        return;
    }

    //  It doesn't really matter what platform we're running on - we filter
    //  all 'browser-specific' selectors.
    if (TP.isTrue(TP.regex.CSS_NATIVE_CUSTOM.test(aSelector))) {
        return;
    }

    //  If the 'closest' method is available and the selector doesn't have a
    //  pipe ('|') symbol (i.e. it's not a namespaced query), and it's not a
    //  'scoped selector' (i.e. starts with a combinator - which is not
    //  supported by W3C APIs) and a 'stop ancestor' wasn't supplied, then use
    //  the native call.
    if (TP.isCallable(elem.closest) &&
        !TP.regex.HAS_PIPE.test(aSelector) &&
        !TP.regex.CSS_CUSTOM_SCOPED_SELECTOR.test(aSelector) &&
        !TP.isElement(stopAncestor)) {
        return elem.closest(aSelector);
    }

    //  If the native version is available, use that. It may be a
    //  vendor-prefixed version or the finally-settled-upon name of 'matches'.
    matchesSelector = elem.mozMatchesSelector ||
        elem.webkitMatchesSelector ||
        elem.msMatchesSelector ||
        elem.matches;

    if (TP.isCallable(matchesSelector) && !TP.regex.HAS_PIPE.test(aSelector)) {

        closest = function(startElem, selector) {

            var element;

            element = startElem;

            while (element && element.nodeType === Node.ELEMENT_NODE) {
                if (matchesSelector.call(element, selector)) {
                    return element;
                }

                element = element.parentNode;

                if (TP.isElement(stopAncestor) &&
                    element === stopAncestor) {
                    break;
                }
            }

            return;
        };

        return closest(elem, aSelector);
    }

    //  Cache the number of namespaces we've installed so that we don't do this
    //  every time this method gets called.
    if (TP.notDefined(TP.$$installedCSSNSCount) ||
        TP.$$installedCSSNSCount !== TP.w3.Xmlns.get('prefixes').getSize()) {

        //  Make sure all of the known namespaces are defined (note this is
        //  added to the 'xmlns' property of the 'extended jQuery' - see below -
        //  but since Sizzle functions are just aliased over to jQuery
        //  functions, we can use the original Sizzle function here).
        TP.w3.Xmlns.get('prefixes').perform(
            function(item) {
                TP.extern.jQuery.xmlns[item.first()] = item.last();
            });

        TP.$$installedCSSNSCount = TP.w3.Xmlns.get('prefixes').getSize();
    }

    //  Use the native Sizzle 'matches' call. It takes in a selector and an
    //  Array of pre-selected Elements and returns an Array with any of them
    //  that matched. So we supply an Array with the one element we're
    //  testing and if we get back a non-empty Array, we know that it
    //  matched the supplied selector.

    closest = function(startElem, selector) {

        var element;

        element = startElem;

        while (element && element.nodeType === Node.ELEMENT_NODE) {
            if (TP.notEmpty(TP.extern.Sizzle.matches(selector, [element]))) {
                return element;
            }

            element = element.parentNode;

            if (TP.isElement(stopAncestor) &&
                element === stopAncestor) {
                break;
            }
        }

        return;
    };

    return closest(elem, aSelector);
}, {
    dependencies: [TP.extern.jQuery, TP.extern.Sizzle]
});

//  ------------------------------------------------------------------------

TP.definePrimitive('nodeEvaluateCSS',
function(aNode, aSelector, autoCollapse) {

    /**
     * @method nodeEvaluateCSS
     * @summary Returns any elements matching the selector given in the
     *     supplied selector String.
     * @description Note that if an 'ID' selector query (where the first
     *     character is '#') is handed to this method, it will automatically
     *     collapse the results whether the autoCollapse flag is set or not.
     * @param {Node|Window} aNode The 'context node' for the evaluation (or a
     *     Window, which will supply its document as the context node).
     * @param {String} aSelector A valid CSS selector.
     * @param {Boolean} autoCollapse Whether to collapse Array results if
     *     there's only one item in them. The default is false.
     * @exception TP.sig.InvalidNode
     * @exception TP.sig.InvalidString
     * @returns {Node[]|Node} A collection of zero or more result nodes or a
     *     single node if we're autoCollapsing.
     */

    var theNode,

        matchResults,

        resultArr,
        i,
        result;

    theNode = TP.isWindow(aNode) ? aNode.document : aNode;

    if (!TP.isNode(theNode)) {
        return TP.raise(this, 'TP.sig.InvalidNode');
    }

    if (TP.isEmpty(aSelector)) {
        return TP.raise(this, 'TP.sig.InvalidString',
                        'Invalid or empty selector');
    }

    //  It doesn't really matter what platform we're running on - we filter
    //  all 'browser-specific' selectors.
    if (TP.isTrue(TP.regex.CSS_NATIVE_CUSTOM.test(aSelector))) {
        return TP.isTrue(autoCollapse) ? null : TP.ac();
    }

    //  If the selector doesn't have a pipe ('|') symbol (i.e. it's not a
    //  namespaced query), and it's not a 'scoped selector' (i.e. starts with a
    //  combinator - which is not supported by W3C APIs) then use the native
    //  call.
    if (!TP.regex.HAS_PIPE.test(aSelector) &&
        !TP.regex.CSS_CUSTOM_SCOPED_SELECTOR.test(aSelector)) {
        matchResults = theNode.querySelectorAll(aSelector);
    } else {
        //  Cache the number of namespaces we've installed so that we don't do
        //  this every time this method gets called.
        if (TP.notDefined(TP.$$installedCSSNSCount) ||
            TP.$$installedCSSNSCount !==
                            TP.w3.Xmlns.get('prefixes').getSize()) {

            //  Make sure all of the known namespaces are defined (note this is
            //  added to the 'xmlns' property of the 'extended jQuery' - see
            //  below - but since Sizzle functions are just aliased over to
            //  jQuery functions, we can use the original Sizzle function here).
            TP.w3.Xmlns.get('prefixes').perform(
                function(item) {
                    TP.extern.jQuery.xmlns[item.first()] = item.last();
                });
        }

        try {
            /* eslint-disable new-cap */
            matchResults = TP.extern.Sizzle(aSelector, theNode);
            /* eslint-enable new-cap */
        } catch (e) {
            return TP.isTrue(autoCollapse) ? null : TP.ac();
        }
    }

    //  First, let's check the length of the results against the
    //  auto-reduction flag.
    if (matchResults.length === 0 && TP.isTrue(autoCollapse)) {
        return null;
    }

    //  We only auto-collapse if the number of elements matched by the query
    //  is exactly 1.
    if (matchResults.length === 1 && TP.isTrue(autoCollapse)) {
        result = matchResults.item(0);
        if (TP.notValid(result[TP.GENERATED])) {
            return result;
        } else {
            return null;
        }
    }

    //  One thing we don't like is that the result isn't an Array, so we
    //  have to repackage the results into an Array :-(. Oh well, we have to
    //  check for generated content anyway.

    resultArr = TP.ac();
    for (i = 0; i < matchResults.length; i++) {
        result = matchResults.item(i);

        //  If the result was 'TIBET generated', that is its 'generated
        //  content', then we don't add it to the results - since its
        //  supposed to be 'hidden'.
        if (TP.notValid(result[TP.GENERATED])) {
            resultArr.push(result);
        }
    }

    return resultArr;
}, {
    dependencies: [TP.extern.jQuery, TP.extern.Sizzle]
});

//  ------------------------------------------------------------------------

TP.definePrimitive('selectorIsNative',
function(aSelector) {

    /**
     * @method selectorIsNative
     * @summary Returns true if the selector provided is 'native' (i.e.
     *     supported in a built-in fashion) in the currently executing browser
     *     environment.
     * @description Note that this method will return true as long as the
     *     selector is a natively supported selector in the current browser
     *     environment. This means that selectors that are only supported for
     *     the current browser (i.e. those prefixed with -moz/-ms/-webkit) will
     *     return true.
     * @param {String} aSelector A valid CSS selector.
     * @exception TP.sig.InvalidString
     * @returns {Boolean} True if the selector is native.
     */

    if (TP.isEmpty(aSelector)) {
        return TP.raise(this, 'TP.sig.InvalidString',
                        'Invalid or empty selector');
    }

    if (TP.notValid(document.querySelectorAll)) {
        return false;
    }

    //  According to the CSS Selector specification, the 'querySelectorAll'
    //  method *MUST* throw an exception if it does not understand the
    //  selector handed to it. We leverage that fact by trying to have it
    //  query using the selector provided (note that we don't care at all
    //  about the return value). If it doesn't throw an exception, then we
    //  know that the selector is supported, otherwise it isn't.
    try {
        document.querySelectorAll(aSelector);

        return true;
    } catch (e) {
        return false;
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowMatchesCSSMedia',
function(aWindow, queryStr) {

    /**
     * @method windowMatchesCSSMedia
     * @summary Returns true if the supplied 'CSS media query' matches the
     *     supplied Window's CSS environment.
     * @description Note that this method will return null if the CSSOM
     *     'matchMedia' call is not supported or it doesn't return a valid
     *     result for the supplied query.
     * @param {Window} aWindow The window to execute the media query against.
     * @param {String} queryStr A valid 'CSS media query'.
     * @exception TP.sig.InvalidWindow
     * @exception TP.sig.UnsupportedFeature
     * @exception TP.sig.InvalidString
     * @returns {Boolean} True if the media query matches.
     */

    var queryResult;

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow');
    }

    if (TP.notValid(aWindow.matchMedia)) {
        return TP.raise(this, 'TP.sig.UnsupportedFeature');
    }

    if (TP.isEmpty(queryStr)) {
        return TP.raise(this, 'TP.sig.InvalidString',
                        'Invalid or empty query');
    }

    queryResult = aWindow.matchMedia(queryStr);

    if (!TP.isMediaQueryList(queryResult)) {
        return null;
    }

    return queryResult.matches;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('windowQueryCSSMedia',
function(aWindow, queryStr, watchFunction) {

    /**
     * @method windowQueryCSSMedia
     * @summary Returns a valid media query list if the supplied 'CSS media
     *     query' matches the supplied Window's CSS environment.
     * @description Note that this method will return null if the CSSOM
     *     'matchMedia' call is not supported or it doesn't return a valid
     *     result for the supplied query.
     * @param {Window} aWindow The window to execute the media query against.
     * @param {String} queryStr A valid 'CSS media query'.
     * @param {Function} watchFunction A Function that will be installed to
     *     watch for changes to the CSS environment such that the supplied query
     *     will come into or out of force.
     * @exception TP.sig.InvalidWindow
     * @exception TP.sig.UnsupportedFeature
     * @exception TP.sig.InvalidString
     * @returns {MediaQueryList} The object returned by a 'matchMedia' call.
     *     This can be used to 'unwatch' the supplied query by using it's
     *     'removeListener' method with the supplied handler Function.
     */

    var queryResult;

    if (!TP.isWindow(aWindow)) {
        return TP.raise(this, 'TP.sig.InvalidWindow');
    }

    if (TP.notValid(aWindow.matchMedia)) {
        return TP.raise(this, 'TP.sig.UnsupportedFeature');
    }

    if (TP.isEmpty(queryStr)) {
        return TP.raise(this, 'TP.sig.InvalidString',
                        'Invalid or empty query');
    }

    queryResult = aWindow.matchMedia(queryStr);

    if (!TP.isMediaQueryList(queryResult)) {
        return null;
    }

    if (TP.isCallable(watchFunction)) {
        queryResult.addListener(watchFunction);
    }

    return queryResult;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
