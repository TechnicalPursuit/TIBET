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
 * @type {TP.tibet.style}
 * @summary A subtype of TP.core.ElementNode that implements the ability to put
 *         'static data' in the page.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('tibet:style');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.tibet.style.Type.defineMethod('tagAttachStyle',
function(aRequest) {

    /**
     * @method tagAttachStyle
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        cdatas,

        resourceStr,

        doc,

        generatedStyleID,
        ourID,

        type,

        currentDir,
        currentLoc,

        newStyleElem,
        existingStyleElem,

        href,
        ext,
        hrefURI,
        hrefLocation,
        fetchRequest,
        newHref;

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    tpElem = TP.wrap(elem);

    //  Get this element's document wrapper.
    doc = TP.doc(elem);

    //  Grab our ID, assigning one if necessary
    ourID = TP.lid(elem, true);

    //  Compute an ID for our generated (real) CSS style sheet.
    generatedStyleID = ourID + '_generated';

    //  If we're not empty, then we use our child content as our content
    if (TP.notEmpty(elem.childNodes)) {

        //  NOTE: Many of these calls use the native node, since we want to
        //  manipulate native node objects here.

        //  Normalize the node to try to get the best representation
        TP.nodeNormalize(elem);

        //  Get a result type for the data (either defined on the receiver
        //  element itself or from a supplied MIME type), construct an instance
        //  of that type and set it as the named URI's resource.

        //  If there is a CDATA section, then we grab it's text value.
        cdatas = TP.nodeGetDescendantsByType(elem, Node.CDATA_SECTION_NODE);
        if (TP.notEmpty(cdatas)) {

            //  The string we'll use is from the first CDATA.
            resourceStr = TP.nodeGetTextContent(cdatas.first());
        }

        //  If there's a 'type' attribute, that should have the type of style
        //  that we're being asked to process.
        type = TP.elementGetAttribute(elem, 'type');
        switch (type) {
            case 'less':

                //  Note that, due to a limitation of the LESS API, we can't
                //  just provide a 'root path' that url()s can be resolved
                //  against. So we get our document's collection path and attach
                //  a nonsensical filename to it before supplying that to the
                //  LESS compilation routine.
                currentDir = TP.uriCollectionPath(TP.documentGetLocation(doc));
                currentLoc = TP.uriJoinPaths(currentDir, 'fluffy.less');

                tpElem.compileAndInsertLESS(currentLoc, resourceStr);

                break;

            default:

                //  If there is no existing 'style' element, create one and set
                //  its content.
                if (!TP.isElement(
                        existingStyleElem =
                        TP.byCSSPath(
                            '[for="' + ourID + '"]', doc, false, false))) {

                    //  Just some CSS
                    newStyleElem = TP.documentAddStyleElement(
                                        doc, resourceStr, elem.nextSibling);

                    TP.elementSetAttribute(
                            newStyleElem, 'id', generatedStyleID, true);

                    //  Set an attribute on our newly created style element that
                    //  links it back to the source element.
                    TP.elementSetAttribute(newStyleElem, 'for', ourID, true);
                } else {

                    //  Otherwise, just set the content of the existing one.
                    TP.styleElementSetContent(existingStyleElem, resourceStr);
                }
        }

    } else if (TP.notEmpty(href = TP.elementGetAttribute(elem, 'href', true))) {

        //  Otherwise, if we have an href attribute, then use it to try to
        //  extract the style and process it.
        ext = TP.uriExtension(href);

        hrefURI = TP.uc(href);
        hrefLocation = hrefURI.getLocation();

        switch (ext) {

            case 'less' :

                //  The style is some LESS CSS. Go fetch it and, when it's
                //  returned, compile and insert it into the document.
                fetchRequest = TP.request('async', true);
                fetchRequest.defineMethod(
                        'handleRequestSucceeded',
                            function(aResponse) {
                                var fetchLoc,
                                    fetchResult;

                                //  Note here how we grab the 'whole location'
                                //  of the URI and supply that to the LESS
                                //  processor. No need to do the 'nonsensical
                                //  file name' trick like above - we have the
                                //  real LESS file here.
                                fetchLoc = hrefLocation;
                                fetchResult = aResponse.get('result');

                                //  Run the LESS compiler and insert the
                                //  results.
                                tpElem.compileAndInsertLESS(
                                            fetchLoc, fetchResult);
                            });
                hrefURI.getResource(fetchRequest);

                break;

            default:

                //  If there is no existing 'style' element, create one and set
                //  its content.
                if (!TP.isElement(
                        existingStyleElem =
                        TP.byCSSPath(
                            '[for="' + ourID + '"]', doc, false, false))) {

                    //  Just some CSS - link it in.
                    newStyleElem = TP.documentAddLinkElement(
                                            doc,
                                            hrefLocation,
                                            elem.nextSibling);

                    TP.elementSetAttribute(
                            newStyleElem, 'id', generatedStyleID, true);

                    //  Set an attribute on our newly created style element that
                    //  links it back to the source element.
                    TP.elementSetAttribute(newStyleElem, 'for', ourID, true);

                } else {

                    //  Otherwise, just compute a new href from the old href
                    //  value that is guaranteed to be unique and set the 'href'
                    //  property of the existing style element to it, thereby
                    //  guaranteeing a reload of the content.
                    newHref = hrefLocation +
                                (hrefLocation.contains('?') ? '&' : '?') +
                                '_tibet_nocache=' + Date.now();

                    existingStyleElem.href = newHref;
                }
        }

    } else {

        //  Raise an exception
        return this.raise('TP.sig.InvalidNode');
    }

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tibet.style.Inst.defineMethod('compileAndInsertLESS',
function(lessLoc, lessText) {

    /**
     * @method compileAndInsertLESS
     * @summary Compiles the supplied less text and inserts into the document of
     * the supplied style element.
     * @param {String} lessLoc The location that the LESS was found in. If the
     *     LESS source came from inline content on a 'tibet:style' element, this
     *     will be the location of the document plus a nonsensical name to
     *     satisfy the LESS compiler. If its from a 'tibet:style' element with
     *     an href, then it will be that href.
     * @param {String} lessText The source LESS text to compile.
     */

    var ourID,
        generatedStyleID,

        cfg,
        lessGlobalVars,

        ourDoc,

        lessParams,
        lessWorker;

    //  Get our local ID, assigning it if necessary.
    ourID = this.getLocalID(true);

    //  Compute an ID for our generated (real) CSS style sheet.
    generatedStyleID = ourID + '_generated';

    //  Get all of the cfg variables starting with 'path.'
    cfg = TP.sys.cfg('path');

    //  Allocate a POJO for supplying the LESS compiler with global var data.
    lessGlobalVars = {};

    //  Iterate over all of the 'path.' variables, getting each key and slicing
    //  the 'path.' part off of it. Any remaining periods ('.') in the key are
    //  replaced with '-'. Then, quote the value so that LESS doesn't have
    //  issues with spaces, etc.
    cfg.getKeys().forEach(
        function(aKey) {
            var val;

            //  If the cfg data has a real value for that key, get the key and
            //  slice off the 'path.' portion. Any remaining periods ('.') in
            //  the key are then replaced with '-'. Then, quote the value so
            //  that LESS doesn't have issues with spaces, etc.
            if (TP.notEmpty(val = cfg.at(aKey))) {
                lessGlobalVars[aKey.slice(5).replace(/\./g, '-')] =
                                '"' + TP.uriResolveVirtualPath(val) + '"';
            }
        });

    lessParams = TP.hc('filename', lessLoc, 'globalVars', lessGlobalVars);

    ourDoc = this.getNativeDocument();

    //  Obtain a 'LESS worker' and ask it to compile the LESS text.
    lessWorker = TP.core.LESSWorker.getWorker();
    lessWorker.compile(lessText, lessParams).then(
            function(result) {
                var existingStyleElem,
                    compiledStyleElem;

                //  If there is no existing 'style' element, create one and set
                //  its content.
                if (!TP.isElement(
                    existingStyleElem =
                    TP.byCSSPath(
                        '[for="' + ourID + '"]', ourDoc, false, false))) {

                    compiledStyleElem = TP.documentAddStyleElement(
                                            ourDoc,
                                            result,
                                            TP.unwrap(this).nextSibling);

                    TP.elementSetAttribute(
                            compiledStyleElem, 'id', generatedStyleID, true);

                    //  Set an attribute on our newly created style element that
                    //  links it back to the source element.
                    TP.elementSetAttribute(compiledStyleElem,
                                            'for',
                                            ourID,
                                            true);
                } else {

                    //  Otherwise, just set the content of the existing one.
                    TP.styleElementSetContent(existingStyleElem, result);
                }
            }.bind(this));

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
