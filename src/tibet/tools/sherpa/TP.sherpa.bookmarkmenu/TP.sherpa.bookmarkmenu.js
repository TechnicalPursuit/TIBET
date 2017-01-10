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
 * @type {TP.sherpa.bookmarkmenu}
 */

//  ------------------------------------------------------------------------

TP.sherpa.menu.defineSubtype('bookmarkmenu');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.bookmarkmenu.Inst.defineAttribute(
    'menuContentList', {
        value: TP.cpc('> .content > ul', TP.hc('shouldCollapse', true))
    });

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.bookmarkmenu.Type.defineMethod('tagAttachDOM',
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

        arrows;

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

    arrows.forEach(
            function(anArrow) {
                anArrow.set('scrollingContentTPElem', menuContentListTPElem);
            });

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.bookmarkmenu.Type.defineMethod('tagDetachDOM',
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

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    menuContentListTPElem = tpElem.get('menuContentList');
    tpElem.ignore(menuContentListTPElem, 'TP.sig.DOMScroll');

    //  this makes sure we maintain parent processing - but we need to do it
    //  last because it nulls out our wrapper reference.
    this.callNextMethod();

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.bookmarkmenu.Inst.defineHandler('DOMScroll',
function(aSignal) {

    if (this.hasClass('overflowing')) {
        this.updateScrollButtons();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.bookmarkmenu.Inst.defineHandler('SelectMenuItem',
function(aSignal) {

    var cmdVal;

    this.deactivate();

    cmdVal = aSignal.getDOMTarget().getAttribute('data-cmd');

    if (TP.isEmpty(cmdVal)) {
        return this;
    }

    cmdVal = ':inspect --path=\'' + cmdVal + '\'';

    TP.bySystemId('SherpaConsoleService').sendConsoleRequest(cmdVal);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.bookmarkmenu.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary
     * @returns
     */

    var bookmarks,
        str,

        menuContentListTPElem;

    bookmarks = this.get('data');

    //  No valid bookmark data - empty the menu content list and exit.
    if (TP.isEmpty(bookmarks)) {
        this.get('menuContentList').empty();

        return this;
    }

    str = '';

    bookmarks.forEach(
                function(pairArr, index) {
                    str += '<li data-cmd="' + pairArr.first() + '">' +
                            index + '.&#160;' +
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

TP.sherpa.bookmarkmenu.Inst.defineMethod('setValue',
function(aValue, shouldSignal) {

    /**
     * @method setValue
     * @summary Sets the value of the receiver's node. For this type, this
     *     method sets the underlying data and renders the receiver.
     * @param {Object} aValue The value to set the 'value' of the node to.
     * @param {Boolean} shouldSignal Should changes be notified. For this type,
     *     this flag is ignored.
     * @returns {TP.sherpa.bookmarkmenu} The receiver.
     */

    this.set('data', aValue);

    this.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.bookmarkmenu.Inst.defineMethod('updateScrollButtons',
function() {

    var arrows;

    arrows = TP.byCSSPath('sherpa|scrollbutton',
                            this.getNativeNode(),
                            false,
                            true);

    arrows.forEach(
            function(anArrow) {
                anArrow.updateForScrollingContent();
            });

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
