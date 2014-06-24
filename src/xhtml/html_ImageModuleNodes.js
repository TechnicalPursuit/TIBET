//  ========================================================================
/*
NAME:   html_ImageModuleNodes.js
AUTH:   Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

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

TP.html.img.set('uriAttrs', TP.ac('src', 'longdesc', 'usemap'));

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
