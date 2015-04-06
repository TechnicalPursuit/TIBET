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
//  TP.html.a
//  ========================================================================

/**
 * @type {TP.html.a}
 * @summary A tag. An anchor or hypertext link.
 */

//  ------------------------------------------------------------------------

TP.html.Focused.defineSubtype('a');

TP.html.a.Type.set('uriAttrs', TP.ac('href'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.a.Type.defineMethod('tagUnmarshal',
function(aRequest) {

    /**
     * @method tagUnmarshal
     * @summary Unmarshals the receiver's content. This includes resolving XML
     *     Base URIs and virtual URIs that may occur on the receiver's
     *     attributes.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        href;

    //  Make sure that we have a node to work from.
    if (!TP.isNode(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    //  Call up to allow any 'href' values to be expanded, etc. if necessary
    this.callNextMethod();

    if (TP.notEmpty(href = TP.elementGetAttribute(elem, 'href', true))) {

        //  Rewrite the link so that it calls TP.go2() instead of just being a
        //  standard link. This gives TIBET control so that proper routing and
        //  history management can occur.

        //  First, just set the 'href' to '#'
        TP.elementSetAttribute(elem, 'href', '#', true);

        //  Then add an 'onclick' that will trigger TIBET.
        TP.elementSetAttribute(elem,
                                'onclick',
                                'TP.go2(\'' + href + '\', window);',
                                true);
    }

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
