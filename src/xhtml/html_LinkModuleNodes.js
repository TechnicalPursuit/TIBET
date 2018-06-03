//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

//  ========================================================================
//  TP.html.link
//  ========================================================================

/**
 * @type {TP.html.link}
 * @summary 'link' tag.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('link');

TP.html.link.Type.set('uriAttrs', TP.ac('href'));
TP.html.link.Type.set('reloadableUriAttrs', TP.ac('href'));

TP.html.link.addTraits(TP.dom.EmptyElementNode);

TP.html.link.Type.resolveTrait('uriAttrs', TP.html.link);

TP.html.link.Inst.resolveTraits(
        TP.ac('getContent', 'setContent'),
        TP.dom.EmptyElementNode);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.link.Type.defineMethod('mutationUpdatedStyle',
function(aTargetElem) {

    /**
     * @method mutationUpdatedStyle
     * @summary Handles a remote resource change against the supplied native
     *     element.
     * @description This method is usually activated as the result of a 'DOM
     *     Mutation' of this node because of changes to the remote resource that
     *     caused this element to be created in the first place
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @exception TP.sig.InvalidElement
     * @returns {TP.meta.html.link} The receiver.
     */

    var tpElem;

    if (!TP.isElement(aTargetElem)) {
        return this.raise('TP.sig.InvalidElement');
    }

    tpElem = TP.wrap(aTargetElem);

    //  Signal from our (wrapped) target element that we attached more nodes due
    //  to a mutation.
    TP.signal(TP.tpdoc(aTargetElem),
                'TP.sig.MutationStyleChange',
                TP.hc('mutationTarget', tpElem));

    return this;
});

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.html.link.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @method tagCompile
     * @summary Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Element} The element.
     */

    var elem,
        type;

    elem = aRequest.at('node');

    //  Grab the type and, if it's a 'TIBET CSS' type of styling, then change
    //  the original element into a 'tibet:style' tag.
    type = TP.elementGetAttribute(elem, 'type', true);
    if (type === TP.ietf.mime.TIBET_CSS) {
        elem = TP.elementBecome(
                    elem, 'tibet:style', TP.hc('tibet:tag', 'tibet:style'));
    }

    return elem;
});

//  ------------------------------------------------------------------------

TP.html.link.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        handlerFunc;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  Register a handler function that will process @import'ed URIs and
    //  dispatch a TP.sig.DOMReady when the stylesheet has finished loading.
    handlerFunc =
        function() {

            var tpElem,

                stylesheet,

                mainURI,
                mainDependents,

                importHrefs,

                watchingChanges;

            //  Remove this handler to avoid memory leaks.
            elem.removeEventListener('load', handlerFunc, false);

            tpElem = TP.wrap(elem);

            //  Grab the stylesheet from the element.
            stylesheet = TP.cssElementGetStyleSheet(elem);

            //  If we have a valid CSSStyleSheet object
            if (TP.isValid(stylesheet)) {

                //  Grab the stylesheet's href as a TP.uri.URI and any dependent
                //  URIs it may have.
                mainURI = TP.uc(stylesheet.href);
                mainDependents = mainURI.get('dependentURIs');

                //  Make sure the URI has a dependents list.
                if (TP.notValid(mainDependents)) {
                    mainDependents = TP.ac();
                    mainURI.set('dependentURIs', mainDependents);
                }

                //  Grab any hrefs from @import statements in the stylesheet
                //  and, if we're watching remote changes, register ourself as
                //  observer on them. This will mean that this element will not
                //  only observe changes to the URI computed from it's 'href'
                //  attribute, but from all of the @imports referenced
                //  (recursively) in the sheet for that href.

                watchingChanges = TP.sys.cfg('uri.watch_remote_changes');

                //  Note that this method, by default, will recursively retrieve
                //  @import hrefs.
                importHrefs = TP.styleSheetGetImportHrefs(stylesheet);
                importHrefs.forEach(
                    function(anHref) {
                        var uri;

                        //  NB: Note that we intern the URI one way or another,
                        //  whether we're going to watch it or not. This is
                        //  important.
                        uri = TP.uc(anHref);

                        if (TP.isURI(uri)) {
                            if (watchingChanges) {
                                tpElem.observe(uri, 'TP.sig.ValueChange');
                                uri.watch();
                            }

                            //  Track the dependents for the main URI by adding
                            //  this @import URI to its list.
                            mainDependents.push(uri);
                        }
                    });
            }

            //  Dispatch 'TP.sig.DOMReady' for consistency with other elements
            //  that dispatch this when their 'dynamic content' is resolved.
            //  Note that we use 'dispatch()' here because this is a DOM signal
            //  and we want all of the characteristics of a DOM signal.
            tpElem.dispatch('TP.sig.DOMReady');
        };

    elem.addEventListener('load', handlerFunc, false);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.link.Inst.defineMethod('reloadFromAttrHref',
function(anHref) {

    /**
     * @method reloadFromAttrHref
     * @summary Reloads the receiver with the content found at the end of the
     *     href.
     * @param {String} anHref The URL that the receiver will use to reload its
     *     content.
     * @returns {TP.html.link} The receiver.
     */

    var doc;

    if (TP.notEmpty(anHref)) {

        //  Use the core primitive routine to reload our href in our native
        //  document. Note that this will automatically take care of assigning a
        //  cache-busting URL to the href, etc.
        doc = this.getNativeDocument();
        TP.documentReloadCSSLinkElementHref(doc, anHref);

        //  Work around Chrome (and possibly others) stupidity.
        //  TODO: Commented out for now - doesn't seem to need it.
        // TP.windowForceRepaint(TP.nodeGetWindow(doc));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.html.link.Inst.defineMethod('setAttrHref',
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
    this.reloadFromAttrHref();

    //  setting an attribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
