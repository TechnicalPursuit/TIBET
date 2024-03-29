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
 * @type {TP.lama.halocontextmenu}
 */

//  ------------------------------------------------------------------------

TP.lama.menucontent.defineSubtype('halocontextmenu');

TP.lama.halocontextmenu.Inst.defineAttribute('title',
    TP.cpc('> .header > .title', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.lama.halocontextmenu.Inst.defineAttribute('menuContent',
    TP.cpc('> .body > *', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.halocontextmenu.Inst.defineMethod('getScrollingContentElement',
function() {

    /**
     * @method getScrollingContentElement
     * @summary Returns the content element that will be scrolling when the menu
     *     content needs to scroll.
     * @returns {TP.dom.ElementNode} The element that contains the content that
     *     will scroll.
     */

    return this.get('menuContent');
});

//  ------------------------------------------------------------------------

TP.lama.halocontextmenu.Inst.defineHandler('SelectMenuItem',
function(aSignal) {

    /**
     * @method handleSelectMenuItem
     * @summary Handles notifications of menu selections over the current
     *     selection that the halo is working with.
     * @param {TP.sig.SelectMenuItem} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.halocontextmenu} The receiver.
     */

    var cmdVal;

    cmdVal = aSignal.getDOMTarget().getAttribute('data-cmd');

    if (TP.isEmpty(cmdVal)) {
        return this;
    }

    TP.bySystemId('LamaConsoleService').sendConsoleRequest(cmdVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.halocontextmenu.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver.
     * @returns {TP.lama.halocontextmenu} The receiver.
     */

    var haloTarget,

        oldContent,
        newContent,

        menuContentTPElem;

    haloTarget = TP.byId('LamaHalo', this.getNativeDocument()).get(
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

    if (TP.isValid(haloTarget)) {

        //  If we have valid menu content, scroll it to the top.
        menuContentTPElem = this.get('menuContent');
        if (TP.isValid(menuContentTPElem)) {
            (function() {
                menuContentTPElem.scrollTo(TP.TOP);
            }).queueBeforeNextRepaint(this.getNativeWindow());
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
