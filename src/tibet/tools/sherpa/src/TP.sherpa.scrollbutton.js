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
 * @type {TP.sherpa.scrollbutton}
 */

//  ------------------------------------------------------------------------

TP.sherpa.Element.defineSubtype('scrollbutton');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.scrollbutton.Inst.defineHandler('ScrollDown',
function(aSignal) {

    var scrollableTPAncestor;

    scrollableTPAncestor =
            this.detectAncestor(
                    function(anElem) {
                        return TP.elementHasClass(anElem, 'content');
                    });

    scrollableTPAncestor.scrollBy(TP.DOWN, '20%', 'height');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.scrollbutton.Inst.defineHandler('ScrollUp',
function(aSignal) {

    var scrollableTPAncestor;

    scrollableTPAncestor =
            this.detectAncestor(
                    function(anElem) {
                        return TP.elementHasClass(anElem, 'content');
                    });

    scrollableTPAncestor.scrollBy(TP.UP, '20%', 'height');

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
