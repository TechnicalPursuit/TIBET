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

TP.core.UIElementNode.defineSubtype('sherpa:sherpa');

//  ----------------------------------------------------------------------------
//  Type Methods
//  ----------------------------------------------------------------------------

TP.sherpa.sherpa.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @name tagAttachDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,

        triggerKey,

        tsh;


    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    //  Set up the trigger key

    if (TP.isEmpty(triggerKey =
                    TP.elementGetAttribute(elem, 'sherpa:toggle'))) {
        triggerKey = 'DOM_Alt_Shift_Up_Up';
    }

    tsh = TP.core.TSH.getDefaultInstance();

    TP.core.sherpa.construct(
        TP.hc('window', TP.nodeGetWindow(elem),
                'model', tsh,
                'triggerKey', triggerKey
        ));

    return this.callNextMethod();
});

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
