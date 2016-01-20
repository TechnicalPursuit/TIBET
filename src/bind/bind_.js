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

TP.bind.XMLNS.Type.defineMethod('$gatherReferencedURIs',
function(anElement) {

    /**
     * @method $gatherReferencedURIs
     * @param {Element} anElement The element under which to gather referenced
     *     URIs.
     * @returns {Array} An Array of referenced primary URIs.
     */

    var query,
        boundElements,

        primaryURILocs,

        infoCacheDict,

        i,
        attrs,
        j,

        attrVal,

        bindEntries,
        entriesKeys,
        k,

        dataExprs,
        l,

        primaryLoc;


    //  Query for any attributes named 'io', 'in', 'scope' or 'repeat', no
    //  matter what namespace they're in. Note that this is about as
    //  sophisticated as we can get with namespaces using the querySelectorAll()
    //  call in most browsers. It is extremely fast, which is why we use it and
    //  then filter more later, but it's query capabilities around namespaces is
    //  quite pathetic.
    query = '*[*|io],' +
            '*[*|in],' +
            '*[*|scope],' +
            '*[*|repeat]';

    boundElements = TP.ac(anElement.querySelectorAll(query));

    //  Additionally, if the supplied Element itself matches that query (tested
    //  by either '.matches' or '.matchesSelector', depending on platform...),
    //  then unshift it onto the result.
    if (anElement.matches && anElement.matches(query)) {
        boundElements.unshift(anElement);
    } else if (anElement.matchesSelector && anElement.matchesSelector(query)) {
        boundElements.unshift(anElement);
    }

    primaryURILocs = TP.ac();

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

                attrVal = attrs[j].value;

                //  If we detect a 'binding attribute' value, then it's a
                //  'bind:io' or 'bind:in' attribute. Extract the binding
                //  information.
                if (TP.regex.BINDING_ATTR_VALUE_DETECT.test(attrVal)) {

                    //  If it's not in our local caching dictionary, then
                    //  compute it.
                    if (TP.notValid(bindEntries = infoCacheDict.at(attrVal))) {

                        bindEntries = TP.core.ElementNode.computeBindingInfo(
                                                    boundElements[i], attrVal);
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

                            //  Iterate over each data expression and, if it can
                            //  be resolved as a URI, grab it's *primary URI*.
                            for (l = 0; l < dataExprs.getSize(); l++) {

                                if (TP.isURI(dataExprs.at(l))) {
                                    primaryLoc = TP.uc(dataExprs.at(l)).
                                                        getPrimaryLocation();

                                    primaryURILocs.push(primaryLoc);
                                }
                            }
                        }
                    }
                } else if (TP.isURI(attrVal)) {
                    //  Otherwise, it's a 'bind:scope' or 'bind:repeat', which
                    //  can extract the URI information from directly.
                    primaryLoc = TP.uc(attrVal).getPrimaryLocation();
                    primaryURILocs.push(primaryLoc);
                }
            }
        }
    }

    return primaryURILocs;
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
        repeatTPElem,

        observedURIs,

        tpDoc,
        primaryURILocs;

    doc = TP.nodeGetDocument(anElement);

    //  Convert any text nodes containing '[[...]]' to span elements with
    //  'bind:in' attributes

    //  Grab any Text nodes under the supplied Element that have standalone
    //  binding expressions.
    boundTextNodes = TP.wrap(anElement).getTextNodesMatching(
            function(aTextNode) {
                return TP.regex.BINDING_STATEMENT_DETECT.test(
                                                aTextNode.textContent);
            });

    //  Iterate over them, converting them into XHTML <span>s with 'bind:in'
    //  binding attributes.
    boundTextNodes.forEach(
        function(aTextNode) {

            var tnStr,
                index,
                exprNode,
                newSpan;

            //  Grab the original text node's text content and compute the index
            //  to the starting '[['
            tnStr = TP.nodeGetTextContent(aTextNode);
            index = tnStr.indexOf('[[');

            //  Use the DOM to split the text node at that boundary. This
            //  creates a text node with the content *after* the index and
            //  appends it as 'node's nextSibling into the DOM.
            exprNode = aTextNode.splitText(index);

            //  Grab that text node's content and compute the index to the ']]'
            //  (plus 2 - we want to leave the expression end delimiter in
            //  exprNode)
            tnStr = TP.nodeGetTextContent(exprNode);
            index = tnStr.indexOf(']]') + 2;

            //  We don't care about what's on the right hand side, so we don't
            //  grab the return value here. This creates another text node to
            //  the right with whatever text was there and appends it as
            //  'exprNode's nextSibling into the DOM.
            exprNode.splitText(index);

            //  Get the text of exprNode, which will now be the '[[...]]'
            //  expression.
            tnStr = TP.nodeGetTextContent(exprNode);

            //  Trim off the surrounding whitespace
            tnStr = TP.trim(tnStr);

            //  If the expression doesn't contain ACP variables or formatting
            //  expressions, then we can trim off the '[[' and ']]' and it
            //  doesn't need quoting.
            if (!TP.regex.ACP_PATH_CONTAINS_VARIABLES.test(tnStr) &&
                !TP.regex.ACP_FORMAT.test(tnStr)) {
                //  Trim off whitespace
                tnStr = TP.trim(tnStr);

                //  Slice off the leading and trailing '[[' and ']]'
                tnStr = tnStr.slice(2, -2);
            } else {
                tnStr = tnStr.quoted('\'');
            }

            //  Create a new span and set a 'bind:in' attribute on it, binding
            //  it's 'content' property using the expression given (minus the
            //  leading and trailing brackets).
            newSpan = TP.documentConstructElement(
                                    doc, 'span', TP.w3.Xmlns.XHTML);

            TP.elementSetAttribute(newSpan,
                                    'bind:in',
                                    '{value: ' + tnStr + '}',
                                    true);

            //  Mark this Element as 'scalar valued' for it's 'value' aspect,
            //  meaning that it will try to convert any bound 'value' value that
            //  it is being updated to to a singular, scalar value if possible.
            TP.elementSetAttribute(newSpan,
                                    'tibet:isScalarValued',
                                    true,
                                    'value');

            //  Replace that text node with the span, leaving the text nodes to
            //  the left (the original) to the right (created by the 2nd
            //  'splitText' above).
            newSpan = TP.nodeReplaceChild(aTextNode.parentNode,
                                            newSpan,
                                            exprNode,
                                            false);
        });

    //  Cause any repeats that haven't registered their content to grab it
    //  before we start other processing.
    repeatElems = TP.ac(doc.documentElement.querySelectorAll('*[*|repeat]'));
    repeatElems = repeatElems.filter(
                    function(anElem) {
                        return anElement.contains(anElem);
                    })

    //  To avoid mutation events as register the repeat content will cause DOM
    //  modifications, we wrap all of the found 'bind:repeat' Elements at once
    //  here.
    repeatTPElems = TP.wrap(repeatElems);

    //  Iterate over all of the found repeat elements and tell them to register
    //  their repeat content. This is done here to avoid (lots of) problems with
    //  dynamic shuffling of Elements under a repeat during render time.
    len = repeatTPElems.getSize();
    for (i = 0; i < len; i++) {
        repeatTPElem = repeatTPElems.at(i);
        repeatTPElem.$registerRepeatContent();
    }

    //  Make sure that the owner TP.core.Document has an '$observedURIs' hash.
    //  This hash will consist of the URI's 'primary URI' location and a counter
    //  matching the number of times this primary URI is encountered in the
    //  content. This counter is used as Elements come and go (see the
    //  'teardown' method below) and when the count is 0, the TP.core.Document
    //  ignores that primary URI.

    tpDoc = TP.wrap(doc);

    if (TP.notValid(observedURIs = tpDoc.get('$observedURIs'))) {
        observedURIs = TP.hc();
        tpDoc.set('$observedURIs', observedURIs);
    }

    //  Gather any URIs that are referenced in binding expressions under the
    //  supplied Element. The primary URIs of these URIs will be the URIs that
    //  the owner TP.core.Document of the supplied Element will observe for
    //  FacetChange.
    primaryURILocs = this.$gatherReferencedURIs(anElement);

    //  Iterate over the gathered URIs and register their primary URI with the
    //  $observedURIs hash. Note that the first time a particular primary URI is
    //  encountered, the TP.core.Document is told to observe it.
    primaryURILocs.forEach(
            function(aPrimaryLoc) {
                var uriCount;

                //  If we already saw this primary location, then we increment
                //  the counter.
                if (observedURIs.containsKey(aPrimaryLoc)) {
                    uriCount = observedURIs.at(aPrimaryLoc);

                    uriCount++;

                    //  place the new value.
                    observedURIs.atPut(aPrimaryLoc, uriCount);
                } else {

                    //  Initialize the counter for this primary URI and tell our
                    //  TP.core.Document to observe it for FacetChange.
                    observedURIs.atPut(aPrimaryLoc, 1);
                    tpDoc.observe(TP.uc(aPrimaryLoc), 'FacetChange');
                }
            });

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

        primaryURILocs,
        observedURIs;

    doc = TP.nodeGetDocument(anElement);
    tpDoc = TP.wrap(doc);

    //  If the TP.core.Document has no '$observedURIs', then just exit here.
    if (TP.notValid(observedURIs = tpDoc.get('$observedURIs'))) {
        return;
    }

    //  Gather any URIs that are referenced in binding expressions under the
    //  supplied Element. The primary URIs of these URIs will be the URIs that
    //  the owner TP.core.Document of the supplied Element could ignore for
    //  FacetChange (if by detecting it, we decrement the count to 0).
    primaryURILocs = this.$gatherReferencedURIs(anElement);

    primaryURILocs.forEach(
            function(aPrimaryLoc) {
                var uriCount;

                //  If we already saw this primary location, then we decrement
                //  the counter.
                if (observedURIs.containsKey(aPrimaryLoc)) {
                    uriCount = observedURIs.at(aPrimaryLoc);

                    uriCount--;

                    //  If the counter is 0, then tell our TP.core.Document to
                    //  ignore that primary URI for FacetChange and remove that
                    //  key.
                    if (uriCount === 0) {
                        tpDoc.ignore(TP.uc(aPrimaryLoc), 'FacetChange');
                        observedURIs.removeKey(aPrimaryLoc);
                    } else {
                        //  Otherwise, just place the new value.
                        observedURIs.atPut(aPrimaryLoc, uriCount);
                    }
                }
            });

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
