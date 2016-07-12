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
 * @type {TP.sherpa.snippetmenu}
 */

//  ------------------------------------------------------------------------

TP.sherpa.menu.defineSubtype('snippetmenu');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.snippetmenu.Inst.defineAttribute(
        'menuContentList',
        {value: TP.cpc('> .content > ul', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.snippetmenu.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        menuContentListTPElem,

        arrows,
        upArrow,
        downArrow;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    menuContentListTPElem = tpElem.get('menuContentList');
    tpElem.observe(menuContentListTPElem, 'TP.sig.DOMScroll');

    arrows = TP.byCSSPath('sherpa|scrollbutton',
                            elem,
                            false,
                            true);

    upArrow = arrows.first();
    downArrow = arrows.last();

    upArrow.set('scrollingContentTPElem', menuContentListTPElem);
    downArrow.set('scrollingContentTPElem', menuContentListTPElem);

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.snippetmenu.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
     * @summary Tears down runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        menuContentListTPElem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    menuContentListTPElem = tpElem.get('menuContentList');
    tpElem.ignore(menuContentListTPElem, 'TP.sig.DOMScroll');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.snippetmenu.Inst.defineHandler('DOMScroll',
function(aSignal) {

    if (this.hasClass('overflowing')) {
        this.updateScrollButtons();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.snippetmenu.Inst.defineHandler('SelectMenuItem',
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

TP.sherpa.snippetmenu.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary
     * @returns
     */

    var snippets,
        str,

        menuContentListTPElem;

    snippets = TP.ac(
                TP.ac(':history', 'History'),
                TP.ac(':help', 'Help'),
                TP.ac(':clear', 'Clear'),
                TP.ac(':flag', 'Config flags'),
                TP.ac(':doclint', 'Doclint'),
                TP.ac(':test', 'Run App Tests'),
                TP.ac(':toggleRemoteWatch', 'Toggle Remote Watch'),
                TP.ac(':listChangedRemotes', 'List Changed Remotes'),
                TP.ac('TP.sys.getBootLog()', 'Write Boot Log')
                );

    str = '';

    snippets.perform(
                function(pairArr) {
                    str += '<li data-cmd="' + pairArr.first() + '">' +
                            pairArr.last() +
                            '</li>';
                });

    menuContentListTPElem = this.get('menuContentList');

    menuContentListTPElem.setContent(TP.xhtmlnode(str));

    (function() {
        if (menuContentListTPElem.isOverflowing(TP.VERTICAL)) {
            this.addClass('overflowing');
            this.updateScrollButtons();
        } else {
            this.removeClass('overflowing');
        }
    }.bind(this)).fork(10);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.snippetmenu.Inst.defineMethod('updateScrollButtons',
function() {

    var arrows,

        upArrow,
        downArrow;

    arrows = TP.byCSSPath('sherpa|scrollbutton',
                            this.getNativeNode(),
                            false,
                            true);

    upArrow = arrows.first();
    downArrow = arrows.last();

    upArrow.updateForScrollingContent();
    downArrow.updateForScrollingContent();

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
