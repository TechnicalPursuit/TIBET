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
 * @type {TP.sherpa.screen}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('sherpa:screen');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.screen.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @name tagAttachDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem;

    if (TP.isElement(elem = aRequest.at('node'))) {
        this.addStylesheetTo(TP.nodeGetDocument(elem));
    }

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
