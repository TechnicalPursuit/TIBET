//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.xctrls.image}
 * @summary Manages image XControls.
 */

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.defineSubtype('xctrls:image');

TP.xctrls.image.addTraits(TP.xctrls.Element);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This tag has no associated CSS. Note how these properties are TYPE_LOCAL, by
//  design.
TP.xctrls.image.defineAttribute('styleURI', TP.NO_RESULT);
TP.xctrls.image.defineAttribute('themeURI', TP.NO_RESULT);

//  This type captures no signals - it lets all signals pass through.
TP.xctrls.image.Type.defineAttribute('opaqueCapturingSignalNames', null);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.image.Type.defineMethod('tagCompile',
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

        imagePath,
        imageName,

        url,

        resp,
        svgMarkup;

    //  Make sure to 'call up', since 'xctrls:Element' types do processing
    //  for this step.
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    //  First, see if the image has a 'real path'
    imagePath = TP.elementGetAttribute(elem, 'src', true);

    //  If the image doesn't have a real path, then we assume that it's pointing
    //  to a named image in our 'app media' directory.
    if (TP.isEmpty(imagePath)) {
        imageName = TP.elementGetAttribute(elem, 'name', true);
        imagePath = '~app_media/' + imageName + '.svg';
    }

    url = TP.uc(imagePath);
    if (!TP.isURI(url)) {
        TP.ifWarn() ?
            TP.warn('Expected valid URI in src or name attribute: ' + imagePath) : 0;
    }

    //  If the image path points to an SVG, then we inline it.
    if (imagePath.endsWith('.svg')) {
        resp = url.getNativeNode(TP.hc('async', false));

        if (TP.notValid(svgMarkup = resp.get('result'))) {
            TP.ifWarn() ?
                TP.warn('Unable to load SVG image from URI: ' + imagePath) : 0;
        } else {
            TP.nodeSetContent(elem, svgMarkup);
        }
    } else if (TP.isURI(url)) {
        //  Otherwise, we set the backgroundImage of our 'most specific' CSS to
        //  the location of the URL.
        TP.elementGetStyleObj(elem).backgroundImage = url.getLocation();
    }

    TP.elementSetGenerator(elem);

    return elem;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
