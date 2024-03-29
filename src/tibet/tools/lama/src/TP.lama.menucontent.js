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
 * @type {TP.lama.menucontent}
 */

//  ------------------------------------------------------------------------

TP.lama.TemplatedTag.defineSubtype('menucontent');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.lama.menucontent.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        scrollingContentTPElem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    //  Grab the scrolling content and set up scrolling on it.
    scrollingContentTPElem = tpElem.getScrollingContentElement();
    tpElem.setupScrollingOn(scrollingContentTPElem);

    return;
});

//  ------------------------------------------------------------------------

TP.lama.menucontent.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
     * @summary Tears down runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        scrollingContentTPElem;

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    //  Grab the scrolling content and tear down scrolling on it.
    scrollingContentTPElem = tpElem.getScrollingContentElement();
    tpElem.teardownScrollingOn(scrollingContentTPElem);

    //  this makes sure we maintain parent processing - but we need to do it
    //  last because it nulls out our wrapper reference.
    this.callNextMethod();

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attribute
//  ------------------------------------------------------------------------

TP.lama.menucontent.Inst.defineAttribute('bodyContent',
    TP.cpc('> .body', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.menucontent.Inst.defineMethod('getScrollingContentElement',
function() {

    /**
     * @method getScrollingContentElement
     * @summary Returns the content element that will be scrolling when the menu
     *     content needs to scroll.
     * @returns {TP.dom.ElementNode} The element that contains the content that
     *     will scroll.
     */

    return this.get('bodyContent');
});

//  ------------------------------------------------------------------------

TP.lama.menucontent.Inst.defineHandler('DOMScroll',
function(aSignal) {

    /**
     * @method handleDOMScroll
     * @summary Handles notifications of document scrolling changes from the
     *     overall canvas that the halo is working with.
     * @param {TP.sig.DOMScroll} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.menucontent} The receiver.
     */

    if (this.hasClass('overflowing')) {
        this.updateScrollButtons();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.menucontent.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver.
     * @returns {TP.lama.menucontent} The receiver.
     */

    //  Update the scrolling buttons based whether our *menu* (not body) content
    //  is overflowing.
    //  Note how we do this on the next repaint so that our overflow
    //  calculations are based on our size after layout has taken place.
    (function() {
        var scrollingContentTPElem;

        scrollingContentTPElem = this.getScrollingContentElement();
        if (scrollingContentTPElem.isOverflowing(TP.VERTICAL)) {
            this.addClass('overflowing');
            this.updateScrollButtons();
        } else {
            this.removeClass('overflowing');
        }

        //  Signal to observers that this control has rendered.
        this.signal('TP.sig.DidRender');

    }.bind(this)).queueBeforeNextRepaint(this.getNativeWindow());

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.menucontent.Inst.defineMethod('setupScrollingOn',
function(aContentTPElem) {

    /**
     * @method setupScrollingOn
     * @summary Sets up scrolling on the supplied content element. This method
     *     sets up the receiver to listen to DOMScroll signals from the supplied
     *     content element and wires the scrolling arrows to highlight the
     *     arrows as the scroll position moves.
     * @param {TP.dom.ElementNode} aContentTPElem The content element to set up
     *     scrolling on.
     * @returns {TP.lama.menucontent} The receiver.
     */

    var arrows;

    this.observe(aContentTPElem, 'TP.sig.DOMScroll');

    arrows = TP.byCSSPath('> .footer > lama|scrollbutton',
                            this.getNativeNode(),
                            false,
                            true);

    arrows.forEach(
            function(anArrow) {
                anArrow.set('scrollingContentTPElem', aContentTPElem);
            });

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.menucontent.Inst.defineMethod('stylesheetReady',
function(aStyleTPElem) {

    /**
     * @method stylesheetReady
     * @summary A method that is invoked when the supplied stylesheet is
     *     'ready', which means that it's attached to the receiver's Document
     *     and all of it's style has been parsed and applied.
     * @description Typically, the supplied stylesheet Element is the one that
     *     the receiver is waiting for so that it can finalized style
     *     computations. This could be either the receiver's 'core' stylesheet
     *     or it's current 'theme' stylesheet, if the receiver is executing in a
     *     themed environment.
     * @param {TP.html.style} aStyleTPElem The XHTML 'style' element that is
     *     ready.
     * @returns {TP.lama.menucontent} The receiver.
     */

    //  If we're not awakening this tag, then exit - we want none of the
    //  machinery here to execute.
    if (this.hasAttribute('tibet:no-awaken')) {
        return this;
    }

    //  Note how we put this in a Function to wait until the screen refreshes.
    (function() {

        //  Call render one-time to get things going. Note that this *MUST* be
        //  called before the resize handler is installed below. Otherwise,
        //  we'll render twice (the resize handler will see this list resizing
        //  because of this render() call and will want to render again).

        //  If we are a bound element, then refresh ourselves from any bound
        //  data source we may have. This will re-render if the data actually
        //  changed.
        if (this.isBoundElement()) {

            //  Note here how we don't force the rendering behavior - if the
            //  data has changed, the content will re-render.
            this.refresh();
        } else {
            this.render();
        }
    }.bind(this)).queueBeforeNextRepaint(this.getNativeWindow());

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.lama.menucontent.Inst.defineMethod('teardownScrollingOn',
function(aContentTPElem) {

    /**
     * @method teardownScrollingOn
     * @summary Tears down scrolling on the supplied content element. This
     *     method is used in conjunction with the 'setupScrollingOn' method.
     *     Look for more detail there.
     * @param {TP.dom.ElementNode} aContentTPElem The content element to tear
     *     down scrolling on.
     * @returns {TP.lama.menucontent} The receiver.
     */

    var arrows;

    this.ignore(aContentTPElem, 'TP.sig.DOMScroll');

    arrows = TP.byCSSPath('> .footer > lama|scrollbutton',
                            this.getNativeNode(),
                            false,
                            true);

    arrows.forEach(
            function(anArrow) {
                anArrow.set('scrollingContentTPElem', null);
            });

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.menucontent.Inst.defineMethod('updateScrollButtons',
function() {

    /**
     * @method updateScrollButtons
     * @summary Updates the receiver's scroll buttons
     * @returns {TP.lama.menucontent} The receiver.
     */

    var arrows;

    //  Grab any scrollbuttons that are under us.
    arrows = TP.byCSSPath('> .footer > lama|scrollbutton',
                            this.getNativeNode(),
                            false,
                            true);

    //  Iterate and have each arrow update.
    arrows.forEach(
            function(anArrow) {
                anArrow.updateForScrollingContent();
            });

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
