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
        target,
        click,
        href;

    //  Make sure that we have a node to work from.
    if (!TP.isNode(elem = aRequest.at('node'))) {
        return;
    }

    //  Capture the original HREF value so we can undo expansion if necessary.
    href = TP.elementGetAttribute(elem, 'href', true);

    //  Call up the chain and force expansion and any other default processing.
    this.callNextMethod();

    //  When there's a different target we're going to stay out of the way.
    if (TP.notEmpty(target = TP.elementGetAttribute(elem, 'target', true))) {
        if (target !== '_self') {
            return;
        }
    }

    //  If there's already a click handler the developer "wins", even if that
    //  means they don't get the benefit of TIBET here.
    if (TP.notEmpty(click = TP.elementGetAttribute(elem, 'onclick', true))) {
        return;
    }

    //  Links with an empty HREF will try to reload the page. We really don't
    //  want that, we want to have them do nothing. We set '#' here and let the
    //  following check add a return false click handler.
    if (TP.isEmpty(href)) {
        TP.elementSetAttribute(elem, 'href', '#');
    }

    //  Links with an empty anchor will try to reset at the top of page. Don't
    //  let that happen either, just "dampen them" via onclick.
    if (href === '#') {
        TP.elementSetAttribute(elem, 'onclick', 'return false;');
        return;
    }

    //  If the link triggers a javascript url (or is javascript: void 0) exit.
    /* eslint-disable no-script-url */
    if (href.indexOf('javascript:') === 0) {
        return;
    }
    /* eslint-enable no-script-url */

    //  Rewrite the link so that it calls TP.go2() instead of just being a
    //  standard link. This gives TIBET control so that proper routing and
    //  history management can occur.

    //  If the original value wasn't a route then refetch to get the fully
    //  expanded form so we use that for our go2 call.
    if (href.indexOf('#') !== 0 && href !== '/') {
        href = TP.elementGetAttribute(elem, 'href', true);
    }

    //  First, just set the 'href' to '#' to avoid any traversal.
    TP.elementSetAttribute(elem, 'href', '#', true);

    //  Then add an 'onclick' that will trigger TIBET.
    TP.elementSetAttribute(elem, 'onclick',
        'TP.go2(\'' + href + '\', window); return false;',
        true);

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
