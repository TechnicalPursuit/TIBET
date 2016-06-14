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
