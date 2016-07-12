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
 * @type {TP.sherpa.scrollbutton}
 */

//  ------------------------------------------------------------------------

TP.sherpa.Element.defineSubtype('scrollbutton');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.scrollbutton.Inst.defineAttribute('scrollingContentTPElem');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.scrollbutton.Inst.defineHandler('ScrollDown',
function(aSignal) {

    this.get('scrollingContentTPElem').scrollBy(TP.DOWN, TP.PAGE, 'height');

    //  Stop propagation on the triggering signal (i.e. the DOM signal) so that
    //  the native click event doesn't go into the underlying content.
    aSignal.at('trigger').stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.scrollbutton.Inst.defineHandler('ScrollUp',
function(aSignal) {

    this.get('scrollingContentTPElem').scrollBy(TP.UP, TP.PAGE, 'height');

    //  Stop propagation on the triggering signal (i.e. the DOM signal) so that
    //  the native click event doesn't go into the underlying content.
    aSignal.at('trigger').stopPropagation();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.scrollbutton.Inst.defineMethod('updateForScrollingContent',
function() {

    var elem,
        orientation,

        contentElem;

    elem = this.getNativeNode();
    orientation = TP.elementGetAttribute(elem, 'orientation', true);

    contentElem = this.get('scrollingContentTPElem').getNativeNode();

    if (orientation === 'down') {
        if (contentElem.scrollHeight >
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
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
