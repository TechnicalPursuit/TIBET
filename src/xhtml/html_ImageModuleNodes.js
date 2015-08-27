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

TP.html.img.addTraits(TP.core.EmptyElementNode);

TP.html.img.Type.resolveTraits(
        TP.ac('booleanAttrs', 'uriAttrs'),
        TP.html.img);

TP.html.img.Inst.resolveTraits(
        TP.ac('getContent', 'setContent'),
        TP.core.EmptyElementNode);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.img.Type.defineMethod('constructContentObject',
function(aURI) {

    /**
     * @method constructContentObject
     * @summary Returns a content object for the URI provided. This method is
     *     invoked as part of MIME-type specific handling for URIs vended as on
     *     of the 'img' MIME types. This method returns an image tag which is
     *     suitable for displaying the image described by the URI.
     * @param {TP.core.URI} aURI The URI referencing an image.
     * @returns {Node} A valid TP.html.img node.
     */

    return TP.tpnode(
            TP.elementFromString(
                    TP.join('<html:img xmlns:html="', TP.w3.Xmlns.XHTML,
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

    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  Register a handler function that will signal a TP.sig.DOMReady when the
    //  image has finished loading.
    handlerFunc =
        function() {

            //  Remove this handler to avoid memory leaks.
            elem.removeEventListener('load', handlerFunc, false);

            this.signal('TP.sig.DOMReady');
        }.bind(this);

    elem.addEventListener('load', handlerFunc, false);

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
