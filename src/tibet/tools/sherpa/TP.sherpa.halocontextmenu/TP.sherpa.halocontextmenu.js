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
 * @type {TP.sherpa.halocontextmenu}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('halocontextmenu');

TP.sherpa.halocontextmenu.Inst.defineAttribute('title',
    TP.cpc('> .header > .title', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.halocontextmenu.Inst.defineAttribute('menuContent',
    TP.cpc('> .content', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.halocontextmenu.Inst.defineHandler('SelectMenuItem',
function(aSignal) {

    /**
     * @method handleSelectMenuItem
     * @summary Handles notifications of menu selections over the current
     *     selection that the halo is working with.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halocontextmenu} The receiver.
     */

    var cmdVal;

    cmdVal = aSignal.getDOMTarget().getAttribute('data-cmd');

    if (TP.isEmpty(cmdVal)) {
        return this;
    }

    TP.bySystemId('SherpaConsoleService').sendConsoleRequest(cmdVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.halocontextmenu.Inst.defineMethod('setAttrHidden',
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

TP.sherpa.halocontextmenu.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver.
     * @returns {TP.sherpa.halocontextmenu} The receiver.
     */

    var haloTarget,
        theContent;

    haloTarget = TP.byId('SherpaHalo', this.getNativeDocument()).get(
                                                    'currentTargetTPElem');

    if (TP.isValid(haloTarget)) {

        theContent = haloTarget.getContentForTool('contextMenu');
        this.get('menuContent').setContent(theContent);
    }

    //  Signal to observers that this control has rendered.
    this.signal('TP.sig.DidRender');

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
