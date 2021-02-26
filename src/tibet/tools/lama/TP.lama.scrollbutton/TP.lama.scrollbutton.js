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
 * @type {TP.lama.scrollbutton}
 */

//  ------------------------------------------------------------------------

TP.lama.Element.defineSubtype('scrollbutton');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.lama.scrollbutton.Inst.defineAttribute('scrollingContentTPElem');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.scrollbutton.Inst.defineHandler('ScrollDown',
function(aSignal) {

    /**
     * @method handleScrollDown
     * @summary Handles when the user wants to scroll the content the receiver
     *     is connected to down.
     * @param {TP.sig.ScrollDown} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.scrollbutton} The receiver.
     */

    this.get('scrollingContentTPElem').scrollBy(TP.DOWN, TP.PAGE, 'height');

    //  Stop propagation on the triggering signal (i.e. the DOM signal) so that
    //  the native click event doesn't go into the underlying content.
    aSignal.at('trigger').stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.scrollbutton.Inst.defineHandler('ScrollUp',
function(aSignal) {

    /**
     * @method handleScrollUp
     * @summary Handles when the user wants to scroll the content the receiver
     *     is connected to up.
     * @param {TP.sig.ScrollUp} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.scrollbutton} The receiver.
     */

    this.get('scrollingContentTPElem').scrollBy(TP.UP, TP.PAGE, 'height');

    //  Stop propagation on the triggering signal (i.e. the DOM signal) so that
    //  the native click event doesn't go into the underlying content.
    aSignal.at('trigger').stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.scrollbutton.Inst.defineHandler('ScrollLeft',
function(aSignal) {

    /**
     * @method handleScrollLeft
     * @summary Handles when the user wants to scroll the content the receiver
     *     is connected to left.
     * @param {TP.sig.ScrollLeft} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.scrollbutton} The receiver.
     */

    this.get('scrollingContentTPElem').scrollBy(TP.LEFT, TP.PAGE, 'width');

    //  Stop propagation on the triggering signal (i.e. the DOM signal) so that
    //  the native click event doesn't go into the underlying content.
    aSignal.at('trigger').stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.scrollbutton.Inst.defineHandler('ScrollRight',
function(aSignal) {

    /**
     * @method handleScrollRight
     * @summary Handles when the user wants to scroll the content the receiver
     *     is connected to right.
     * @param {TP.sig.ScrollRight} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.scrollbutton} The receiver.
     */

    this.get('scrollingContentTPElem').scrollBy(TP.RIGHT, TP.PAGE, 'width');

    //  Stop propagation on the triggering signal (i.e. the DOM signal) so that
    //  the native click event doesn't go into the underlying content.
    aSignal.at('trigger').stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.scrollbutton.Inst.defineMethod('updateForScrollingContent',
function(aWidth, aHeight) {

    /**
     * @method updateForScrollingContent
     * @summary Updates the receiver to accurately reflect the scroll position
     *     of the content it is connected to.
     * @param {Number} [aWidth] An optional parameter that should be the
     *     scrolling width that this method will use to update itself. If this
     *     method is not supplied, the receiver's 'scrollingContentTPElem's
     *     scrollWidth will be used.
     * @param {Number} [aHeight] An optional parameter that should be the
     *     scrolling height that this method will use to update itself. If this
     *     method is not supplied, the receiver's 'scrollingContentTPElem's
     *     scrollHeight will be used.
     * @returns {TP.lama.scrollbutton} The receiver.
     */

    var elem,
        orientation,

        contentElem,

        scrollWidth,
        scrollHeight;

    elem = this.getNativeNode();
    orientation = TP.elementGetAttribute(elem, 'orientation', true);

    contentElem = this.get('scrollingContentTPElem');
    if (TP.notValid(contentElem)) {
        //  DO NOT LOG, ERR, ETC.
        return this;
    }

    contentElem = contentElem.getNativeNode();

    scrollWidth = TP.ifInvalid(aWidth, contentElem.scrollWidth);
    scrollHeight = TP.ifInvalid(aHeight, contentElem.scrollHeight);

    //  Tweak the receiver's 'class' attribute, adding or removing the 'more'
    //  class depending on whether the content it is connected to has more
    //  content in that direction.

    if (orientation === 'down') {

        if (contentElem.offsetHeight === 0) {
            TP.elementRemoveClass(elem, 'more');
            return this;
        }

        if (scrollHeight >
            contentElem.scrollTop + contentElem.offsetHeight) {
            TP.elementAddClass(elem, 'more');
        } else {
            TP.elementRemoveClass(elem, 'more');
        }
    } else if (orientation === 'up') {
        if (contentElem.scrollTop > 0) {
            TP.elementAddClass(elem, 'more');
        } else {
            TP.elementRemoveClass(elem, 'more');
        }
    } else if (orientation === 'right') {

        if (contentElem.offsetWidth === 0) {
            TP.elementRemoveClass(elem, 'more');
            return this;
        }

        if (scrollWidth >
            contentElem.scrollLeft + contentElem.offsetWidth) {
            TP.elementAddClass(elem, 'more');
        } else {
            TP.elementRemoveClass(elem, 'more');
        }
    } else if (orientation === 'left') {
        if (contentElem.scrollLeft > 0) {
            TP.elementAddClass(elem, 'more');
        } else {
            TP.elementRemoveClass(elem, 'more');
        }
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
