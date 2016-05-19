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
 * @type {TP.sherpa.contextmenu}
 */

//  ------------------------------------------------------------------------

TP.sherpa.popup.defineSubtype('contextmenu');

TP.sherpa.contextmenu.Inst.defineAttribute('$currentHaloTarget');

TP.sherpa.contextmenu.Inst.defineAttribute(
        'title',
        {value: TP.cpc('> .header > .title', TP.hc('shouldCollapse', true))});

TP.sherpa.contextmenu.Inst.defineAttribute(
        'menuContent',
        {value: TP.cpc('> .content', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.contextmenu.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    tpElem.observe(TP.byId('SherpaHalo', TP.win('UIROOT')),
                    'TP.sig.HaloDidFocus');

    tpElem.observe(TP.byId('SherpaHalo', TP.win('UIROOT')),
                    'TP.sig.HaloDidBlur');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.contextmenu.Inst.defineMethod('activate',
function() {

    /**
     * @method activate
     */

    this.setAttribute('hidden', false);

    this.observe(TP.core.Mouse, 'TP.sig.DOMClick');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.contextmenu.Inst.defineMethod('deactivate',
function() {

    /**
     * @method deactivate
     */

    this.setAttribute('hidden', true);

    this.ignore(TP.core.Mouse, 'TP.sig.DOMClick');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.contextmenu.Inst.defineHandler('DOMClick',
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

TP.sherpa.contextmenu.Inst.defineHandler('HaloDidFocus',
function(aSignal) {

    /**
     * @method handleHaloDidFocus
     * @summary Handles notifications of when the halo focuses on an object.
     * @param {TP.sig.HaloDidFocus} aSignal The TIBET signal which triggered
     *     this method.
     */

    this.set('$currentHaloTarget', aSignal.at('haloTarget'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.contextmenu.Inst.defineHandler('HaloDidBlur',
function(aSignal) {

    /**
     * @method handleHaloDidBlur
     * @summary Handles notifications of when the halo blurs on an object.
     * @param {TP.sig.HaloDidBlur} aSignal The TIBET signal which triggered
     *     this method.
     */

    this.set('$currentHaloTarget', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.contextmenu.Inst.defineHandler('SelectMenuItem',
function(aSignal) {

    var cmdVal;

    this.deactivate();

    cmdVal = aSignal.getDOMTarget().getAttribute('data-cmd');

    if (TP.isEmpty(cmdVal)) {
        return this;
    }

    TP.bySystemId('SherpaConsoleService').sendConsoleRequest(cmdVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.contextmenu.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary
     * @returns
     */

    var haloTarget,
        theContent,

        menuContentTPElem;

    haloTarget = this.get('$currentHaloTarget');

    if (TP.isValid(haloTarget)) {

        theContent = haloTarget.getContentForTool('contextMenu');
        menuContentTPElem = this.get('menuContent').setContent(theContent);
        menuContentTPElem.awaken();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.contextmenu.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     * @summary The setter for the receiver's hidden state.
     * @param {Boolean} beHidden Whether or not the receiver is in a hidden
     *     state.
     * @returns {Boolean} Whether the receiver's state is hidden.
     */

    if (!beHidden) {
        this.render();
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
