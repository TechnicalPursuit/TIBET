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
 * @type {TP.sherpa.menucontent}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('menucontent');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.menucontent.Type.defineMethod('tagAttachComplete',
function(aRequest) {

    /**
     * @method tagAttachComplete
     * @summary Executes once the tag has been fully processed and its
     *     attachment phases are fully complete.
     * @description Because tibet:data tag content drives binds and we need to
     *     notify even without a full page load, we notify from here once the
     *     attachment is complete (instead of during tagAttachData).
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    tpElem = TP.wrap(elem);

    if (tpElem.isReadyToRender()) {

        //  If we are a bound element, then refresh ourselves from any bound
        //  data source we may have. This will re-render if the data actually
        //  changed.
        if (tpElem.isBoundElement()) {
            //  Note here how we don't force the rendering behavior - if the
            //  data has changed, the content will re-render.
            tpElem.refresh();
        } else {
            tpElem.render();
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.menucontent.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        menuContentTPElem,

        arrows;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    menuContentTPElem = tpElem.get('menuContent');
    tpElem.observe(menuContentTPElem, 'TP.sig.DOMScroll');

    arrows = TP.byCSSPath('> .footer > sherpa|scrollbutton',
                            elem,
                            false,
                            true);

    arrows.forEach(
            function(anArrow) {
                anArrow.set('scrollingContentTPElem', menuContentTPElem);
            });

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.menucontent.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
     * @summary Tears down runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        menuContentTPElem;

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    menuContentTPElem = tpElem.get('menuContent');
    tpElem.ignore(menuContentTPElem, 'TP.sig.DOMScroll');

    //  this makes sure we maintain parent processing - but we need to do it
    //  last because it nulls out our wrapper reference.
    this.callNextMethod();

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.menucontent.Inst.defineHandler('DOMScroll',
function(aSignal) {

    /**
     * @method handleDOMScroll
     * @summary Handles notifications of document scrolling changes from the
     *     overall canvas that the halo is working with.
     * @param {TP.sig.DOMScroll} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.menucontent} The receiver.
     */

    if (this.hasClass('overflowing')) {
        this.updateScrollButtons();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.menucontent.Inst.defineMethod('refresh',
function(shouldRender) {

    /**
     * @method refresh
     * @summary Updates the receiver's content by refreshing all bound aspects
     *     in the receiver and all of the descendants of the receiver that are
     *     bound.
     * @description This method is overridden from its supertype, since it has
     *     no internal 'aspects' that can be compared to the bound aspects for
     *     change, which means it won't re-render by default.
     * @param {Boolean} [shouldRender] Whether or not to force (or not force)
     *     re-rendering if the data source changes. If not supplied, this
     *     parameter will default to true if the bound data changed and false if
     *     it didn't.
     * @returns {Boolean} Whether or not the bound value was different than the
     *     receiver already had and, therefore, truly changed.
     */

    this.callNextMethod();

    //  Unless the caller has specifically stated that they don't want a
    //  re-render, we render here.
    if (TP.notFalse(shouldRender)) {
        this.render();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.menucontent.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver.
     * @returns {TP.sherpa.menucontent} The receiver.
     */

    var menuContentTPElem;

    menuContentTPElem = this.get('menuContent');

    //  Update the scrolling buttons based whether our content is overflowing.
    //  Note how we do this on the next repaint so that our overflow
    //  calculations are based on our size after layout has taken place.
    (function() {
        if (menuContentTPElem.isOverflowing(TP.VERTICAL)) {
            this.addClass('overflowing');
            this.updateScrollButtons();
        } else {
            this.removeClass('overflowing');
        }

        //  Signal to observers that this control has rendered.
        this.signal('TP.sig.DidRender');

    }.bind(this)).queueForNextRepaint(this.getNativeWindow());

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.menucontent.Inst.defineMethod('stylesheetReady',
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
     * @returns {TP.sherpa.menucontent} The receiver.
     */

    //  If we're not awakening this tag, then exit - we want none of the
    //  machinery here to execute.
    if (this.hasAttribute('tibet:noawaken')) {
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
    }.bind(this)).queueForNextRepaint(this.getNativeWindow());

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.menucontent.Inst.defineMethod('updateScrollButtons',
function() {

    /**
     * @method updateScrollButtons
     * @summary Updates the receiver's scroll buttons
     * @returns {TP.sherpa.menucontent} The receiver.
     */

    var arrows;

    //  Grab any scrollbuttons that are under us.
    arrows = TP.byCSSPath('> .footer > sherpa|scrollbutton',
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
