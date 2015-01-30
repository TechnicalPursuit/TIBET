//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('haloCanBlur',
function(aHalo, aSignal) {

    return false;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('haloCanFocus',
function(aHalo, aSignal) {

    return false;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getHaloParent',
function(aHalo) {

    /**
     * @name getHaloParent
     * @abstract
     * @param
     * @returns {TP.core.ElementNode}
     */

    return TP.wrap(this.getNativeNode().parentNode);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getHaloRect',
function(aHalo) {

    /**
     * @name getHaloParent
     * @returns {TP.core.ElementNode}
     * @abstract
     */

    var haloWin,
        ourWin,

        ourRect;

    haloWin = aHalo.getNativeWindow();
    ourWin = this.getNativeWindow();

    ourRect = this.getGlobalRect();

    //  If the halo is operating in the same window as us, so just return our
    //  untransformed 'global rect'
    if (haloWin === ourWin) {
        return ourRect;
    }

    //  If we're not in an iframe window, we must be in a top-level window, so
    //  just return our untransformed global rect.
    if (!TP.isIFrameWindow(ourWin)) {
        return ourRect;
    }

    //  We're not in the same window as the halo and we're in an iframe, so we
    //  need our transformed global rect.
    ourRect = this.getGlobalRect(true);

    return ourRect;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getNextHaloChild',
function(aHalo, aSignal) {

    /**
     * @name getNextHaloChild
     * @param {TP.sig.Signal} aSignal
     * @returns {TP.core.ElementNode}
     * @abstract
     */

    var evtTarget,
        existingTarget,
        theElem,
        lastElem;

    evtTarget = aSignal.getTarget();

    existingTarget = aHalo.get('currentTargetTPElem').getNativeNode();

    lastElem = evtTarget;
    theElem = evtTarget.parentNode;

    while (theElem !== existingTarget) {
        if (TP.isDocument(theElem)) {
            lastElem = null;
            break;
        }

        lastElem = theElem;
        theElem = theElem.parentNode;
    }

    if (TP.notValid(lastElem)) {
        return null;
    }

    return TP.wrap(lastElem);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getUIEditorType',
function() {

    /**
     * @name getUIEditorType
     * @synopsis Returns the UIEditor subtype used to edit any UI elements.
     * @returns {Type}
     */

    return TP.core.UIElementNodeEditor;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('haloCanBlur',
function(aHalo, aSignal) {

    /*
    var evtWin,
        targetWin,
        haloWin,

        sigTarget;

    evtWin = aSignal.getWindow();
    targetWin = this.getNativeWindow();
    haloWin = aHalo.getNativeWindow();

    sigTarget = aSignal.getTarget();

    //  If the evtWin is the same as the targetWin OR the evtWin is the same as
    //  the haloWin AND we contain the signal target.
    if (evtWin === targetWin ||
        (evtWin === haloWin && aHalo.contains(sigTarget))) {
        return true;
    }

    return false;
    */

    return true;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('haloCanFocus',
function(aHalo, aSignal) {

    if (this.getNSURI() === TP.w3.Xmlns.SHERPA) {
        return false;
    }

    return true;
});

//  ------------------------------------------------------------------------
//  HTML Elements
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.body.Type.defineMethod('getUIEditorType',
function(anElement) {

    /**
     * @name getUIEditorType
     * @synopsis Returns the UIEditor subtype used to edit 'body' elements.
     * @param {HTMLElement} anElement
     * @returns {Type}
     */

    return TP.sys.require('TPUIHTMLBodyElementNodeEditor');
});

//  ------------------------------------------------------------------------

TP.html.head.Type.defineMethod('getUIEditorType',
function(anElement) {

    /**
     * @name getUIEditorType
     * @synopsis Returns the UIEditor subtype used to edit 'head' elements.
     * @param {HTMLElement} anElement
     * @returns {Type}
     */

    return TP.sys.require('TPUIHTMLHeadElementNodeEditor');
});

//  ------------------------------------------------------------------------

TP.html.html.Type.defineMethod('getUIEditorType',
function(anElement) {

    /**
     * @name getUIEditorType
     * @synopsis Returns the UIEditor subtype used to edit 'html' elements.
     * @param {HTMLElement} anElement
     * @returns {Type}
     */

    return TP.sys.require('TPUIHTMLHtmlElementNodeEditor');
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.body.Inst.defineMethod('getHaloParent',
function(aHalo) {

    /**
     * @name getHaloParent
     * @abstract
     * @param
     * @returns {TP.core.ElementNode}
     */

    return this;
});

//  ========================================================================
//  UIElementNodeEditor
//  ========================================================================

TP.lang.Object.defineSubtype('core.UIElementNodeEditor');

//  ------------------------------------------------------------------------

TP.core.UIElementNodeEditor.Type.defineMethod('haloNorthwestClick',
function(targetTPElement, cornerTPElement) {

    /**
     * @name getUIEditorType
     * @synopsis Returns the UIEditor subtype used to edit 'html' elements.
     * @param {} targetTPElement
     * @returns {Type}
     */

    var theTile,
        position,
        input;

    if (TP.notValid(theTile = TP.byOID('HaloEditorTile', TP.win('UIROOT.SHERPA_FRAME')))) {
        theTile = TP.byOID('Sherpa', TP.win('UIROOT.SHERPA_FRAME')).makeEditorTile('HaloEditorTile');

        position = cornerTPElement.getPagePoint();

        theTile.setPagePositionAndSize(
                    TP.rtc(position.getX() + 50, position.getY() + 50, 750, 500));

        input = theTile.get('textInput');

        /* eslint-disable no-wrap-func */
        (function () {
            theTile.setHeader(targetTPElement.getID());
            theTile.focusOn(targetTPElement);
            theTile.setAttribute('hidden', false);
        }).observe(input, 'TP.sig.DOMReady');
        /* eslint-enable no-wrap-func */

    } else {
        if (TP.isTrue(TP.bc(theTile.getAttribute('hidden')))) {
            theTile.setHeader(targetTPElement.getID());
            theTile.focusOn(targetTPElement);
            theTile.setAttribute('hidden', false);
        } else {
            theTile.setAttribute('hidden', true);
        }
    }
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
