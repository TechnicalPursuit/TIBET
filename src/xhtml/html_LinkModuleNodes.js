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
 * @synopsis 'link' tag.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('link');

TP.html.link.Type.set('uriAttrs', TP.ac('href'));

TP.html.link.addTraits(TP.core.EmptyElementNode);

TP.html.link.Type.resolveTrait('uriAttrs', TP.html.link);

TP.html.link.Inst.resolveTraits(
        TP.ac('removeAttribute', '$setAttribute', 'select', 'isResponderFor',
                'getNextResponder', 'signal'),
        TP.core.UIElementNode);

TP.html.link.Inst.resolveTraits(
        TP.ac('getContent', 'setContent'),
        TP.core.EmptyElementNode);

//  Resolve the traits right away as type methods of this type are called during
//  content processing when we only have type methods involved.
TP.html.link.finalizeTraits();

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.link.Type.defineMethod('tagPrecompile',
function(aRequest) {

    /**
     * @name tagPrecompile
     * @synopsis Replaces the link element with a css:style element suitable for
     *     compiling or otherwise processing the CSS.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var node,
        href,
        url,
        content,
        str,
        newNode;

    TP.stop('break.css_processing');

    //  wall off conversion of TP.html.link elements so the css processing
    //  pipeline never gets off the ground.
    if (!TP.sys.cfg('css.process_styles')) {
        return TP.CONTINUE;
    }

    if (TP.notValid(node = aRequest.at('node'))) {
        return aRequest.fail('Unable to find command node');
    }

    href = node.href || TP.elementGetAttribute(node, 'href');
    if (TP.isEmpty(href)) {
        return aRequest.fail(
            'TP.html.link must have href attribute.',
            'TP.sig.InvalidElement');
    }

    //  Make sure that the href is resolved against the xml:base
    href = TP.uriJoinPaths(
            TP.elementComputeXMLBaseFrom(node),
            href);

    url = TP.uc(href);
    if (TP.notValid(url)) {
        return aRequest.fail(
            'TP.html.link href not a valid URI.',
            'TP.sig.InvalidURI');
    }

    //  bring in the content, inline it, and create an equivalent style node
    //  with annotations we can leverage for normalizing embedded imports
    //  and other url() references
    content = url.getResourceText(TP.hc('async', false));

    //str = TP.join('<css:sheet type="link" src="', href, '" ',
        //'xmlns:css="', TP.w3.Xmlns.CSSML, '"/>');
    str = TP.join('<html:style type="text/css" src="', href, '" ',
        'xmlns:html="', TP.w3.Xmlns.XHTML, '"><![CDATA[',
        content,
        ']]></html:style>');

    newNode = TP.nodeFromString(str);
    if (TP.notValid(newNode)) {
        return aRequest.fail(
            'TP.html.link href not a valid URI.',
            'Unable to create new css:sheet node from :' + str,
            'TP.sig.InvalidNode');
    }

    //  Replace the link element with our new style element, then
    //  reset to Include so the style element can process @import
    //  rules etc. NOTE that we _must_ update the cmdNode to be sure
    //  that the old link element doesn't continue to be processed.
    TP.nodeReplaceChild(node.parentNode, newNode, node);

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
