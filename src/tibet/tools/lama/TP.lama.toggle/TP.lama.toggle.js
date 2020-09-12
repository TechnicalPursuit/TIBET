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
 * @type {TP.lama.toggle}
 */

//  ------------------------------------------------------------------------

TP.lama.Element.defineSubtype('toggle');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.lama.toggle.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    var elem;

    if (!TP.sys.cfg('lama.show_toggle')) {

        if (!TP.isElement(elem = aRequest.at('node'))) {
            return;
        }

        TP.wrap(elem).hide();
    }
});

//  ------------------------------------------------------------------------

TP.lama.toggle.Inst.defineHandler('UIDeactivate',
function(aSignal) {

    /**
     * @method handleUIDeactivate
     * @param {TP.sig.UIDeactivate} aSignal The signal that caused this handler
     *     to trip.
     */

    if (this.shouldPerformUIHandler(aSignal)) {

        this.signal('ToggleLama');

        //  Make sure that we stop propagation here so that we don't get any
        //  more responders further up in the chain processing this.
        aSignal.stopPropagation();
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
