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
//  TP.html.style
//  ========================================================================

/**
 * @type {TP.html.style}
 * @summary 'style' tag.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('style');

TP.html.style.Type.set('booleanAttrs', TP.ac('scoped'));
TP.html.style.Type.set('reloadableUriAttrs', TP.ac('tibet:originalHref'));

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.html.style.Type.defineMethod('tagCompile',
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
    if (type === TP.ietf.Mime.TIBET_CSS) {
        elem = TP.elementBecome(elem, 'tibet:style', TP.hc('tibet:tag', ''));
    }

    return elem;
});

//  ------------------------------------------------------------------------

TP.html.style.Type.defineMethod('tagAttachDOM',
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

    //  Register a handler function that will dispatch a TP.sig.DOMReady when
    //  the stylesheet has finished loading.
    handlerFunc =
        function() {

            //  Remove this handler to avoid memory leaks.
            elem.removeEventListener('load', handlerFunc, false);

            //  Dispatch 'TP.sig.DOMReady' for consistency with other elements
            //  that dispatch this when their 'dynamic content' is resolved.
            //  Note that we use 'dispatch()' here because this is a DOM signal
            //  and we want all of the characteristics of a DOM signal.
            TP.wrap(elem).dispatch('TP.sig.DOMReady');
        };

    elem.addEventListener('load', handlerFunc, false);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.style.Inst.defineMethod('reloadFromAttrTibetOriginalHref',
function(anHref) {

    /**
     * @method reloadFromAttrTibetOriginalHref
     * @summary Sets the href that the receiver will use to retrieve its
     *     content.
     * @description Note that the only reason that the receiver would have this
     *     attribute is if is an 'inlined' version of an XHTML 'link' element.
     *     Therefore, when we refresh its content because its URL changed, we
     *     always inline the content, thereby matching the original action.
     * @param {String} anHref The URL that the receiver will use to fetch its
     *     content.
     */

    var styleURI,

        fetchOptions,

        styleContent;

    styleURI = TP.uc(anHref);

    if (TP.isURI(styleURI)) {

        //  Fetch the CSS content *synchronously*
        fetchOptions = TP.hc('async', false,
                                'resultType', TP.TEXT,
                                'refresh', false);
        styleContent = styleURI.getResource(fetchOptions).get('result');

        //  Set the content of the style element that contains the inlined
        //  style (which will be ourself), resolving @import statements and
        //  possible rewriting CSS url(...) values.
        TP.documentInlineCSSURIContent(
                        this.getNativeDocument(),
                        styleURI,
                        styleContent,
                        this.getNativeNode().nextSibling);
    }

    //  setting an attribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
