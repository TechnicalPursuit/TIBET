//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {bind:}
 * @summary This type represents the TIBET bind namespace
 *     (http://www.technicalpursuit.com/2005/binding) in the tag processing
 *     system.
 */

//  ------------------------------------------------------------------------

TP.core.XMLNamespace.defineSubtype('bind.XMLNS');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.defineMethod('$gatherReferencedLocations',
function(anElement) {

    /**
     * @method $gatherReferencedLocations
     * @param {Element} anElement The element under which to gather referenced
     *     locations.
     * @returns {String[]} An Array of referenced locations.
     */

    var query,
        boundElements,

        uriLocs,

        infoCacheDict,

        i,


        attrs,
        j,

        attrName,
        attrVal,

        bindEntries,
        entriesKeys,
        k,

        dataExprs,
        l,

        location;

    //  Query for any attributes named 'io', 'in', 'scope' or 'repeat', no
    //  matter what namespace they're in. Note that this is about as
    //  sophisticated as we can get with namespaces using the querySelectorAll()
    //  call in most browsers. It is extremely fast, which is why we use it and
    //  then filter more later, but it's query capabilities around namespaces is
    //  quite pathetic.
    query =
        ':scope *[*|io], :scope *[*|in], :scope *[*|scope], :scope *[*|repeat]';

    boundElements = TP.ac(anElement.querySelectorAll(query));

    //  Additionally, if the supplied Element itself matches that query then
    //  unshift it onto the result.
    query = '*[*|io], *[*|in], *[*|scope], *[*|repeat]';
    if (anElement.matches(query)) {
        boundElements.unshift(anElement);
    }

    uriLocs = TP.ac();

    //  Since computing binding information is compute intensive, we keep a
    //  local cache of binding information for a particular attribute value
    //  (since the binding information is itself completely described by the
    //  content of the attribute).
    infoCacheDict = TP.hc();

    //  Iterate over all of the bound Elements
    for (i = 0; i < boundElements.length; i++) {

        //  Iterate over each of the bound Attribute nodes on that bound
        //  Element.
        attrs = boundElements[i].attributes;
        for (j = 0; j < attrs.length; j++) {

            //  Make sure the attribute namespace is the binding namespace. The
            //  CSS query above can't do that... sigh.
            if (attrs[j].namespaceURI === TP.w3.Xmlns.BIND) {

                attrName = attrs[j].nodeName;
                attrVal = attrs[j].value;

                //  If we detect a 'binding attribute' value, then it's a
                //  'bind:io' or 'bind:in' attribute. Extract the binding
                //  information.
                if (TP.regex.BINDING_ATTR_VALUE_DETECT.test(attrVal)) {

                    //  If it's not in our local caching dictionary, then
                    //  compute it.
                    if (TP.notValid(bindEntries = infoCacheDict.at(attrVal))) {

                        bindEntries = TP.dom.ElementNode.computeBindingInfo(
                                        boundElements[i], attrName, attrVal);
                        infoCacheDict.atPut(attrVal, bindEntries);

                        //  There can be 1...n 'entries' in a particular
                        //  Attribute's binding expression.
                        entriesKeys = bindEntries.getKeys();

                        //  Iterate over all of entries that we would've found
                        //  in our binding expression and grab the 'data'
                        //  expression.
                        for (k = 0; k < entriesKeys.getSize(); k++) {
                            dataExprs = bindEntries.at(entriesKeys.at(k)).
                                                            at('dataExprs');

                            //  Iterate over each data expression and, if it is
                            //  either a URI or a barename expression (used for
                            //  direct GUI-to-GUI binding), grab it's value.
                            for (l = 0; l < dataExprs.getSize(); l++) {

                                location = dataExprs.at(l);

                                //  If this is a URI String or is a barename
                                //  (used for direct GUI-to-GUI binding), then
                                //  it's one we're interested in. Note here that
                                //  we pass true to make matching a scheme
                                //  optional.
                                if (TP.isURIString(location, true) ||
                                    TP.regex.BARENAME.test(location)) {
                                    uriLocs.push(location);
                                }
                            }
                        }
                    }
                } else if (TP.isURIString(attrVal) ||
                            TP.regex.BARENAME.test(attrVal)) {
                    //  Otherwise, it's a 'bind:scope' or 'bind:repeat', which
                    //  can we extract the URI information directly.
                    location = attrVal;
                    uriLocs.push(location);
                }
            }
        }
    }

    return uriLocs;
});

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.defineMethod('setup',
function(anElement) {

    /**
     * @method setup
     * @param {Element} anElement The element to set up.
     * @returns {null}
     */

    var doc,

        boundTextNodes,

        repeatElems,

        repeatTPElems,
        len,
        i,
        repeatTPElem;

    doc = TP.nodeGetDocument(anElement);

    //  Convert any text nodes containing '[[...]]' to tibet:acp elements with
    //  'bind:in' attributes

    //  Grab any Text nodes under the supplied Element that have standalone
    //  binding expressions.
    boundTextNodes = TP.wrap(anElement).getTextNodesMatching(
            function(aTextNode) {

                var textContent;

                textContent = aTextNode.textContent;

                //  Note here that we not only check to see if the text content
                //  has double-bracket binding statements, but also to make sure
                //  that it's not a JSON String - we don't want to turn whole
                //  chunks of JSON data into the value of the 'bind:in'
                if (TP.regex.BINDING_STATEMENT_DETECT.test(textContent) &&
                    !TP.isJSONString(textContent)) {
                    return true;
                }

                return false;
            });

    //  Iterate over them, converting them into <tibet:acp>s with 'bind:in'
    //  binding attributes.
    boundTextNodes.forEach(
        function(aTextNode) {

            var nextNode,

                tnStr,
                index,
                exprNode,
                newElem;

            //  Start off with the supplied text node.
            nextNode = aTextNode;

            //  While we have a valid 'next node', keep looping.
            while (TP.isTextNode(nextNode)) {

                //  Grab the text node's text content and compute the index to
                //  the starting '[['
                tnStr = TP.nodeGetTextContent(nextNode);
                index = tnStr.indexOf('[[');

                //  If we can't find any more '[[', then break out.
                if (index === TP.NOT_FOUND) {
                    break;
                }

                //  Use the DOM to split the text node at that boundary. This
                //  creates a text node with the expression content *after* the
                //  index and appends it as 'node's nextSibling into the DOM.
                exprNode = nextNode.splitText(index);

                //  Grab that text node's content and compute the index to the
                //  ']]' (plus 2 - we want to leave the expression end delimiter
                //  in exprNode)
                tnStr = TP.nodeGetTextContent(exprNode);
                index = tnStr.indexOf(']]') + 2;

                //  This creates another text node to the right with whatever
                //  text was there and appends it as 'exprNode's nextSibling
                //  into the DOM. We grab that and will use it as the 'next
                //  node' for the next iteration of this loop.
                nextNode = exprNode.splitText(index);

                //  Get the text of exprNode, which will now be the '[[...]]'
                //  expression.
                tnStr = TP.nodeGetTextContent(exprNode);

                //  Trim off the surrounding whitespace
                tnStr = TP.trim(tnStr);

                //  If the expression doesn't contain ACP variables or
                //  formatting expressions, then we can trim off the '[[' and
                //  ']]' and it doesn't need quoting.
                if (!TP.regex.ACP_PATH_CONTAINS_VARIABLES.test(tnStr) &&
                    !TP.regex.ACP_FORMAT.test(tnStr)) {
                    //  Trim off whitespace
                    tnStr = TP.trim(tnStr);

                    //  Slice off the leading and trailing '[[' and ']]'
                    tnStr = tnStr.slice(2, -2);
                } else {
                    tnStr = tnStr.quoted('\'');
                }

                //  Create a new 'tibet:acp' element and set a 'bind:in'
                //  attribute on it, binding it's 'content' property using the
                //  expression given (minus the leading and trailing brackets).
                newElem = TP.documentConstructElement(
                                        doc, 'tibet:acp', TP.w3.Xmlns.TIBET);

                //  Construct a 'bind:in' attribute for this, binding it to the
                //  'value' aspect.
                TP.elementSetAttribute(newElem,
                                        'bind:in',
                                        '{value: ' + tnStr + '}',
                                        true);

                //  Mark this Element as 'scalar valued' for it's 'value'
                //  aspect, meaning that it will try to convert any bound
                //  'value' value that it is being updated to to a singular,
                //  scalar value if possible.
                TP.elementSetAttribute(newElem,
                                        'tibet:scalar',
                                        'value',
                                        true);

                TP.elementSetAttribute(newElem,
                                        'tibet:textbinding',
                                        'true',
                                        true);

                //  Replace that text node with the span, leaving the text nodes
                //  to the left (the original) and to the right (created by the
                //  2nd 'splitText' above).
                newElem = TP.nodeReplaceChild(aTextNode.parentNode,
                                                newElem,
                                                exprNode,
                                                false);

                //  Loop, processing whatever we have in nextNode
            }
        });

    //  Cause any repeats that haven't registered their content to grab it
    //  before we start other processing.
    repeatElems = TP.ac(anElement.querySelectorAll(':scope *[*|repeat]'));

    //  Additionally, if the supplied Element itself matches that query then
    //  unshift it onto the result.
    if (anElement.matches('*[*|repeat]')) {
        repeatElems.unshift(anElement);
    }

    //  IMPORTANT: To avoid mutation events as register the repeat content will
    //  cause DOM modifications, we wrap all of the found 'bind:repeat' Elements
    //  at once here.
    repeatTPElems = TP.wrap(repeatElems);

    //  Iterate over all of the found repeat elements and tell them to register
    //  their repeat content. This is done here to avoid (lots of) problems with
    //  dynamic shuffling of Elements under a repeat during render time.
    len = repeatTPElems.getSize();
    for (i = 0; i < len; i++) {
        repeatTPElem = repeatTPElems.at(i);
        repeatTPElem.$registerRepeatContent();
    }

    this.refreshReferencedLocations(anElement);

    return;
});

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.defineMethod('refreshReferencedLocations',
function(anElement) {

    /**
     * @method refreshReferencedLocations
     * @param {Element} anElement The element to obtain the document whose
     *     referenced locations we're refreshing.
     * @returns {null}
     */

    var doc,
        tpDoc,

        originalLocationInfos,

        observedLocations,

        uriLocs;

    //  Make sure that the owner TP.dom.Document has an '$observedLocations'
    //  hash. This hash will consist of the location and a counter matching the
    //  number of times this primary URI is encountered in the content. This
    //  counter is used as Elements come and go (see the 'teardown' method
    //  below) and when the count is 0, the TP.dom.Document ignores that
    //  location.

    doc = TP.nodeGetDocument(anElement);

    tpDoc = TP.wrap(doc);

    observedLocations = tpDoc.get('$observedLocations');
    if (TP.notValid(observedLocations)) {
        observedLocations = TP.hc();
        tpDoc.set('$observedLocations', observedLocations);
    }

    //  Gather up the 'original locations' to compute a binding attribute
    //  matcher. This will be an Array of pairs, with the original location in
    //  the first position and the fully expanded location in the last position.
    originalLocationInfos = tpDoc.get('$originalLocationInfos');
    if (TP.notValid(originalLocationInfos)) {
        originalLocationInfos = TP.ac();
        tpDoc.set('$originalLocationInfos', originalLocationInfos);
    }

    //  Gather any locations that are referenced in binding expressions under
    //  the supplied Element. These are the locations that the owner
    //  TP.dom.Document of the supplied Element will observe for FacetChange.
    uriLocs = this.$gatherReferencedLocations(anElement);
    if (TP.isEmpty(uriLocs)) {
        return;
    }

    //  Iterate over the gathered locations and register them with the
    //  'observedLocations' hash. Note that the first time a particular location
    //  is encountered, the TP.dom.Document is told to observe it.
    uriLocs.forEach(
        function(aLocation) {
            var originalLocation,

                location,

                concreteURI,
                concreteLoc,

                resultObj,

                uriCount;

            //  Capture the original location before we modify it. We'll use
            //  this later to compute a matcher used by the binding system to
            //  find attributes with those URI values.
            originalLocation = aLocation;

            //  Grab the location. If it's a barename (i.e. starting with '#'
            //  and followed by 1-n word characters), then that's a sugar for a
            //  direct GUI-to-GUI binding. We desugar these by prepending them
            //  with 'tibet://uicanvas', making them into 'TIBET URLs'.
            location = aLocation;
            if (TP.regex.BARENAME.test(location)) {
                location = 'tibet://uicanvas' + location;
            }

            //  Get the concrete URI. For TIBET URLs, this produces a real URL,
            //  resolved to the name of the current ui canvas, that can be
            //  observed by the Document for changes. For other kinds of URIs,
            //  this usually returns the URI itself.
            concreteURI = TP.uc(location).getConcreteURI();

            if (TP.isValid(concreteURI)) {
                //  If we have a TIBET URL, then check to see if its canvas
                //  (i.e. Window) is the same as the current UI canvas Window.
                //  If it is, configure the GUI control to signal change when
                //  its GUI value changes.
                if (TP.isKindOf(concreteURI, TP.uri.TIBETURL)) {

                    if (concreteURI.getCanvas() === TP.sys.uiwin(true)) {

                        if (TP.isValid(resultObj =
                                concreteURI.getResource(
                                    TP.hc('resultType', TP.WRAP)).
                                                        get('result'))) {

                            //  If the binding expression was to an Attribute
                            //  node, then we want to grab the Attribute's owner
                            //  element.
                            if (TP.isKindOf(resultObj, TP.dom.AttributeNode)) {
                                resultObj = resultObj.getOwnerElement();
                            }

                            //  Because it's a TIBET *URL* (not *URN*), we
                            //  assume that it's pointing to another GUI control
                            //  in the same page, and that we're doing a
                            //  GUI-to-GUI binding, so we configure it to signal
                            //  changes.
                            resultObj.shouldSignalChange(true);
                        }
                    }
                } else {
                    //  If this isn't a TIBET URL, just grab it's primary URI.
                    concreteURI = concreteURI.getPrimaryURI();
                }

                concreteLoc = concreteURI.getLocation();
            } else {
                concreteLoc = location;
            }

            //  If we already saw this location, then we increment the counter.
            if (observedLocations.containsKey(concreteLoc)) {
                uriCount = observedLocations.at(concreteLoc);

                uriCount++;

                //  place the new value.
                observedLocations.atPut(concreteLoc, uriCount);
            } else {

                //  Initialize the counter for this primary URI and tell our
                //  TP.dom.Document to observe it for FacetChange.
                observedLocations.atPut(concreteLoc, 1);

                tpDoc.observe(TP.uc(concreteLoc), 'FacetChange');
                tpDoc.observe(
                        tpDoc,
                        TP.ac('DOMFocus', 'DOMSelect', 'DOMSelectionChange'));

                //  Push a pair that contains the original location and the
                //  computed, concrete location.
                originalLocationInfos.push(
                    TP.ac(originalLocation, concreteLoc));
            }
        });

    //  Unique this Array to avoid multiple entries of the same information.
    //  This will be used during binding refresh to generate matching RegExps
    //  and we don't want to make them needlessly complex.
    originalLocationInfos.unique();

    return;
});

//  ------------------------------------------------------------------------

TP.bind.XMLNS.Type.defineMethod('teardown',
function(anElement) {

    /**
     * @method teardown
     * @param {Element} anElement The element to tear down.
     * @returns {null}
     */

    var doc,
        tpDoc,

        uriLocs,
        observedLocations;

    doc = TP.nodeGetDocument(anElement);
    tpDoc = TP.wrap(doc);

    //  If the TP.dom.Document has no '$observedLocations', then just exit here.
    if (TP.notValid(observedLocations = tpDoc.get('$observedLocations'))) {
        return;
    }

    //  Gather any URIs that are referenced in binding expressions under the
    //  supplied Element. The primary URIs of these URIs will be the URIs that
    //  the owner TP.dom.Document of the supplied Element could ignore for
    //  FacetChange (if by detecting it, we decrement the count to 0).
    uriLocs = this.$gatherReferencedLocations(anElement);

    uriLocs.forEach(
        function(aLocation) {
            var location,

                concreteURI,
                concreteLoc,

                uriCount;

            //  Grab the location. If it's a barename (i.e. starting with '#'
            //  and followed by 1-n word characters), then that's a sugar for a
            //  direct GUI-to-GUI binding. We desugar these by prepending them
            //  with 'tibet://uicanvas', making them into 'TIBET URLs'.
            location = aLocation;
            if (TP.regex.BARENAME.test(location)) {
                location = 'tibet://uicanvas' + location;
            }

            //  Get the concrete URI. For TIBET URLs, this produces a real URL,
            //  resolved to the name of the current ui canvas, that can be
            //  observed by the Document for changes. For other kinds of URIs,
            //  this usually returns the URI itself.
            concreteURI = TP.uc(aLocation).getConcreteURI();

            if (TP.isValid(concreteURI)) {
                //  If this isn't a TIBET URL, just grab it's primary URI. This
                //  matches the behavior in the setup.
                if (!TP.isKindOf(concreteURI, TP.uri.TIBETURL)) {
                    concreteURI = concreteURI.getPrimaryURI();
                }

                concreteLoc = concreteURI.getLocation();
            } else {
                concreteLoc = location;
            }

            //  If we already saw this location, then we decrement the counter.
            if (observedLocations.containsKey(concreteLoc)) {
                uriCount = observedLocations.at(concreteLoc);

                uriCount--;

                //  If the counter is 0, then tell our TP.dom.Document to
                //  ignore that location for FacetChange and remove that key.
                if (uriCount === 0) {
                    observedLocations.removeKey(concreteLoc);

                    tpDoc.ignore(TP.uc(concreteLoc), 'FacetChange');
                    tpDoc.ignore(
                        tpDoc,
                        TP.ac('DOMFocus', 'DOMSelect', 'DOMSelectionChange'));
                } else {
                    //  Otherwise, just place the new value.
                    observedLocations.atPut(concreteLoc, uriCount);
                }
            }
        });

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
