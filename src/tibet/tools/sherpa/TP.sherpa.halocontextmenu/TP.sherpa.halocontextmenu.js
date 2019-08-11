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

TP.sherpa.menucontent.defineSubtype('halocontextmenu');

TP.sherpa.halocontextmenu.Inst.defineAttribute('title',
    TP.cpc('> .header > .title', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.halocontextmenu.Inst.defineAttribute('bodyContent',
    TP.cpc('> .body', TP.hc('shouldCollapse', true)));

TP.sherpa.halocontextmenu.Inst.defineAttribute('menuContent',
    TP.cpc('> .body > *', TP.hc('shouldCollapse', true)));

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

        oldContent,
        newContent,

        menuContentTPElem;

    haloTarget = TP.byId('SherpaHalo', this.getNativeDocument()).get(
                                                    'currentTargetTPElem');

    //  If there is a valid target, then get the context menu for it.
    if (TP.isValid(haloTarget)) {

        //  First, we need to teardown any scrolling on the current *body*
        //  content.
        oldContent = this.get('bodyContent').getFirstChildElement();
        this.teardownScrollingOn(oldContent);

        //  Then, grab the contextMenu content from the current halo target.
        newContent = haloTarget.getContentForTool('contextMenu');

        //  If the new content is valid, then set the body content to it. Also,
        //  set up scrolling on the *menu* content.
        if (TP.isValid(newContent)) {
            this.get('bodyContent').setContent(newContent);

            menuContentTPElem = this.get('menuContent');
            if (TP.isValid(menuContentTPElem)) {
                this.setupScrollingOn(menuContentTPElem);
            }
        }
    }

    //  Signal to observers that this control has rendered.
    this.signal('TP.sig.DidRender');

    if (TP.isValid(haloTarget)) {

        //  If we have valid menu content, scroll it to the top.
        menuContentTPElem = this.get('menuContent');
        if (TP.isValid(menuContentTPElem)) {
            (function() {
                menuContentTPElem.scrollTo(TP.TOP);
            }).queueForNextRepaint(this.getNativeWindow());
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
