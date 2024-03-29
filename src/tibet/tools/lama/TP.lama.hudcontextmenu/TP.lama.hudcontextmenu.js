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
 * @type {TP.lama.hudcontextmenu}
 */

//  ------------------------------------------------------------------------

TP.lama.TemplatedTag.defineSubtype('hudcontextmenu');

TP.lama.hudcontextmenu.Inst.defineAttribute('title',
    TP.cpc('> .header > .title', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.lama.hudcontextmenu.Inst.defineAttribute('menuContent',
    TP.cpc('> .content', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.hudcontextmenu.Inst.defineHandler('SelectMenuItem',
function(aSignal) {

    /**
     * @method handleSelectMenuItem
     * @summary Handles notifications of menu selections over the current
     *     selection that the halo is working with.
     * @description We should never get to this method. The individual HUD
     *     panels should be triggered with this signal because they will set the
     *     'tibet:ctrl' on this tag before showing the context menu to point
     *     back to themselves.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.hudcontextmenu} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.hudcontextmenu.Inst.defineMethod('setAttrHidden',
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

TP.lama.hudcontextmenu.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver.
     * @returns {TP.lama.hudcontextmenu} The receiver.
     */

    var theContent,

        contextMenuContentTag;

    contextMenuContentTag = this.getAttribute('contenttag');

    theContent = TP.elem('<' + contextMenuContentTag + '/>');
    this.get('menuContent').setContent(theContent);

    //  Signal to observers that this control has rendered.
    this.signal('TP.sig.DidRender');

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
