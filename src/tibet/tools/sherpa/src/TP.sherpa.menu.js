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
 * @type {TP.sherpa.menu}
 */

//  ------------------------------------------------------------------------

TP.sherpa.popup.defineSubtype('menu');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.menu.Inst.defineAttribute(
        'menuContent',
        {value: TP.cpc('> .content', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.menu.Inst.defineMethod('activate',
function() {

    /**
     * @method activate
     */

    this.setAttribute('hidden', false);

    this.observe(TP.core.Mouse, 'TP.sig.DOMClick');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.menu.Inst.defineMethod('deactivate',
function() {

    /**
     * @method deactivate
     */

    this.setAttribute('hidden', true);

    this.ignore(TP.core.Mouse, 'TP.sig.DOMClick');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.menu.Inst.defineHandler('DOMClick',
function(aSignal) {

    /**
     * @method handleDOMClick
     * @summary
     * @param {TP.sig.DOMClick} aSignal The TIBET signal which triggered
     *     this method.
     */

    //  The user didn't select anything on the menu - deactivate it.
    this.deactivate();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.menu.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary
     * @returns
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.menu.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     * @summary The setter for the receiver's hidden state.
     * @param {Boolean} beHidden Whether or not the receiver is in a hidden
     *     state.
     * @returns {Boolean} Whether the receiver's state is hidden.
     */

    var wasHidden;

    wasHidden = TP.bc(this.getAttribute('hidden'));

    if (wasHidden === beHidden) {
        return this;
    }

    if (!beHidden) {
        this.render();
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
