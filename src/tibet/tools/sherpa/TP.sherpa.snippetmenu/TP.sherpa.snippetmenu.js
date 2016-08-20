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

    snippets = this.get('data');

    //  No valid snippet data - empty the menu content list and exit.
    if (TP.isEmpty(snippets)) {
        this.get('menuContentList').empty();

        return this;
    }

    str = '';

    snippets.forEach(
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

TP.sherpa.snippetmenu.Inst.defineMethod('setValue',
function(aValue, shouldSignal) {

    /**
     * @method setValue
     * @summary Sets the value of the receiver's node. For this type, this
     *     method sets the underlying data and renders the receiver.
     * @param {Object} aValue The value to set the 'value' of the node to.
     * @param {Boolean} shouldSignal Should changes be notified. For this type,
     *     this flag is ignored.
     * @returns {TP.sherpa.snippetmenu} The receiver.
     */

    this.set('data', aValue);

    this.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.snippetmenu.Inst.defineMethod('updateScrollButtons',
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
