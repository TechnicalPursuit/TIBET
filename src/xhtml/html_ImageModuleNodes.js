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
 * @synopsis 'img' tag. An inline image.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('img');

TP.html.img.Type.set('uriAttrs', TP.ac('src', 'longdesc', 'usemap'));

TP.html.img.Type.set('booleanAttrs', TP.ac('isMap', 'complete'));

TP.html.img.addTraitsFrom(TP.core.EmptyElementNode);
TP.html.img.Inst.resolveTraits(
        TP.ac('getContent', 'setContent'),
        TP.core.EmptyElementNode);

//  Resolve the traits right away as type methods of this type are called during
//  content processing when we only have type methods involved.
TP.html.img.executeTraitResolution();

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.img.Type.defineMethod('constructContentObject',
function(aURI) {

    /**
     * @name constructContentObject
     * @synopsis Returns a content object for the URI provided. This method is
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
//  end
//  ========================================================================
