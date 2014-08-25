//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 * @type {TP.sherpa.sherpa}
 * @synopsis
 */

//  ----------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('tibet:sherpa');

//  ----------------------------------------------------------------------------
//  Type Methods
//  ----------------------------------------------------------------------------

TP.tibet.sherpa.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @name tagAttachDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,

        blankURI,
        sherpaURI,

        frameElem,

        func;

    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    blankURI = TP.uc(TP.sys.cfg('tibet.blankpage'));
    sherpaURI  = TP.uc('~ide_root/xhtml/sherpa_framing.xhtml');

    //  Build an iframe element to contain our custom element.
    frameElem = TP.elem(
        TP.join('<iframe xmlns="', TP.w3.Xmlns.XHTML, '"',
                ' id="SHERPA_FRAME"',
                ' style="position: absolute; border: none;',
                ' top: 0px; left: 0px; width: 100%; height: 100%"',
                ' src="' + blankURI.getLocation() + '"></iframe>'));

    frameElem = TP.nodeAppendChild(elem.parentNode, frameElem, false);

    frameElem.addEventListener(
            'load',
            func = function() {
                this.removeEventListener('load', func, false);
                TP.wrap(this).setContent(sherpaURI);
            },
            false);

    return this.callNextMethod();
});

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
