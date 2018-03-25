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
//  TP.html.img
//  ========================================================================

/**
 * @type {TP.html.img}
 * @summary 'img' tag. An inline image.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('img');

TP.html.img.Type.set('uriAttrs', TP.ac('src', 'longdesc', 'usemap'));

TP.html.img.Type.set('booleanAttrs', TP.ac('isMap', 'complete'));

TP.html.img.addTraits(TP.dom.EmptyElementNode);

TP.html.img.Type.resolveTraits(
        TP.ac('booleanAttrs', 'uriAttrs'),
        TP.html.img);

TP.html.img.Inst.resolveTraits(
        TP.ac('getContent', 'setContent'),
        TP.dom.EmptyElementNode);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.img.Type.defineMethod('constructContentObject',
function(content, aURI) {

    /**
     * @method constructContentObject
     * @summary Returns a content object for the URI provided. This method is
     *     invoked as part of MIME-type specific handling for URIs vended as on
     *     of the 'img' MIME types. This method returns an image tag which is
     *     suitable for displaying the image described by the URI.
     * @param {String} content The string content to process. Typically empty
     *     and ignored for this type unless it starts with 'data:' in which case
     *     the URL is ignored and the src attribute is set to the data URI.
     * @param {TP.uri.URI} aURI The URI referencing an image.
     * @returns {Node} A valid TP.html.img node.
     */

    if (TP.isString(content) && content.startsWith('data:')) {
        return TP.tpnode(
            TP.elementFromString(
                    TP.join('<img xmlns="', TP.w3.Xmlns.XHTML,
                            '" src="',
                            content,
                            '"/>')));
    }

    return TP.tpnode(
            TP.elementFromString(
                    TP.join('<img xmlns="', TP.w3.Xmlns.XHTML,
                            '" src="',
                            aURI.getLocation(),
                            '"/>')));
});

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.html.img.Type.defineMethod('tagAttachDOM',
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
    //  the image has finished loading.
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

TP.html.img.Inst.defineMethod('setAttrSrc',
function(aSrc) {

    /**
     * @method setAttrSrc
     * @summary Sets the src that the receiver will use to retrieve its
     *     content.
     * @param {String} aSrc The URL that the receiver will use to fetch its
     *     content.
     */

    this.$setAttribute('src', aSrc);

    //  setting an attribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
