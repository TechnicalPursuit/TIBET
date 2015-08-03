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

TP.tibet.style.Type.set('uriAttrs', TP.ac('href'));
TP.tibet.style.Type.set('reloadableUriAttrs', TP.ac('href'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.tibet.style.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        href;

    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return this.raise('TP.sig.InvalidNode');
    }

    tpElem = TP.wrap(elem);

    //  If we're not empty, then we reload from our child text content.
    if (!tpElem.isEmpty()) {

        tpElem.reloadFromContent();

    } else if (TP.notEmpty(href = TP.elementGetAttribute(elem, 'href', true))) {

        //  Otherwise, if our 'href' attribute isn't empty, then we reload from
        //  the content that can be found at the end of the URI contained there.
        tpElem.reloadFromAttrHref(href);

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
                        '[for="' + ourID + '"]', ourDoc, true, false))) {

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

                //  Work around Chrome (and possibly others) stupidity
                TP.windowForceRepaint(TP.nodeGetWindow(ourDoc));

            }.bind(this));

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.style.Inst.defineMethod('reloadFromAttrHref',
function(anHref) {

    /**
     * @method reloadFromAttrHref
     * @summary Reloads the receiver with the content found at the end of the
     *     href.
     * @param {String} anHref The URL that the receiver will use to reload its
     *     content.
     * @returns {TP.html.link} The receiver.
     */

    var doc,

        generatedStyleID,
        ourID,

        newStyleElem,
        existingStyleElem,

        ext,
        hrefURI,
        hrefLocation,
        fetchRequest,
        newHref;

    if (TP.notEmpty(anHref)) {

        ext = TP.uriExtension(anHref);

        hrefURI = TP.uc(anHref);
        hrefLocation = hrefURI.getLocation();

        switch (ext) {

            case 'less' :

                //  The style is some LESS CSS. Go fetch it and, when it's
                //  returned, compile and insert it into the document.
                fetchRequest = TP.request('async', true, 'refresh', true);
                fetchRequest.defineMethod(
                        'handleRequestSucceeded',
                            function(aResponse) {
                                var fetchLoc,
                                    fetchResult;

                                //  Note here how we grab the 'whole location'
                                //  of the URI and supply that to the LESS
                                //  processor. No need to do the 'nonsensical
                                //  file name' trick - we have the real LESS
                                //  file here.
                                fetchLoc = hrefLocation;
                                fetchResult = aResponse.get('result');

                                //  Run the LESS compiler and insert the
                                //  results.
                                this.compileAndInsertLESS(
                                            fetchLoc, fetchResult);
                            }.bind(this));
                hrefURI.getResource(fetchRequest);

                break;

            default:

                doc = this.getNativeDocument();

                //  Get our local ID, assigning it if necessary.
                ourID = this.getLocalID(true);

                //  Compute an ID for our generated (real) CSS style sheet.
                generatedStyleID = ourID + '_generated';

                //  If there is no existing 'style' element, create one and set
                //  its content.
                if (!TP.isElement(
                        existingStyleElem =
                        TP.byCSSPath(
                            '[for="' + ourID + '"]', doc, true, false))) {

                    //  Just some CSS - link it in.
                    newStyleElem = TP.documentAddLinkElement(
                                            doc,
                                            hrefLocation,
                                            this.getNativeNode().nextSibling);

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
                    newHref = TP.uriAddUniqueQuery(hrefLocation);

                    existingStyleElem.href = newHref;
                }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.tibet.style.Inst.defineMethod('reloadFromContent',
function() {

    /**
     * @method reloadFromContent
     * @summary Reloads the receiver with the child text content found inside of
     *     the receiver.
     * @returns {null}
     */

    var resourceStr,

        doc,

        generatedStyleID,
        ourID,

        type,

        currentDir,
        currentLoc,

        newStyleElem,
        existingStyleElem;

    doc = this.getNativeDocument();

    //  Get our local ID, assigning it if necessary.
    ourID = this.getLocalID(true);

    //  Compute an ID for our generated (real) CSS style sheet.
    generatedStyleID = ourID + '_generated';

    resourceStr = this.getTextContent();

    //  If there's a 'type' attribute, that should have the type of style
    //  that we're being asked to process.
    type = this.getAttribute('type');

    switch (type) {
        case 'less':

            //  Note that, due to a limitation of the LESS API, we can't
            //  just provide a 'root path' that url()s can be resolved
            //  against. So we get our document's collection path and attach
            //  a nonsensical filename to it before supplying that to the
            //  LESS compilation routine.
            currentDir = TP.uriCollectionPath(TP.documentGetLocation(doc));
            currentLoc = TP.uriJoinPaths(currentDir, 'fluffy.less');

            this.compileAndInsertLESS(currentLoc, resourceStr);

            break;

        default:

            //  If there is no existing 'style' element, create one and set
            //  its content.
            if (!TP.isElement(
                    existingStyleElem =
                    TP.byCSSPath(
                        '[for="' + ourID + '"]', doc, true, false))) {

                //  Just some CSS
                newStyleElem = TP.documentAddStyleElement(
                                    doc,
                                    resourceStr,
                                    this.getNativeNode().nextSibling);

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

    return null;
});

//  ------------------------------------------------------------------------

TP.tibet.style.Inst.defineMethod('setContent',
function(aContentObject, aRequest) {

    /**
     * @method setContent
     * @summary Sets the content of the receiver's native DOM counterpart to
     *     the value supplied.
     * @param {Object} aContentObject An object to use for content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @returns {null}
     */

    this.callNextMethod();

    //  reload from the child text content found inside ourself.
    this.reloadFromContent();

    return null;
});

//  ------------------------------------------------------------------------

TP.tibet.style.Inst.defineMethod('setAttrHref',
function(anHref) {

    /**
     * @method setAttrHref
     * @summary Sets the href that the receiver will use to retrieve its
     *     content.
     * @param {String} anHref The URL that the receiver will use to fetch its
     *     content.
     */

    this.$setAttribute('href', anHref);

    //  reload from the content found at the href.
    this.reloadFromAttrHref(anHref);

    //  setting an attribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
