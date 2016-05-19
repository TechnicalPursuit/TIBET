//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  ========================================================================
//  TP.sherpa.halo.js
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
     * @method getHaloParent
     * @summary
     * @param
     * @returns {TP.core.ElementNode}
     */

    var parentElem;

    if (TP.isElement(parentElem = this.getNativeNode().parentNode)) {
        return TP.wrap(parentElem);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getHaloRect',
function(aHalo) {

    /**
     * @method getHaloRect
     * @summary Returns the rectangle that the halo can use to display itself
     *     when it has the receiver selected.
     * @param {TP.sherpa.Halo} aHalo The halo that is requesting the rectangle
     *     to use to display itself.
     * @returns {TP.core.Rect} The rectangle that the halo will use to display
     *     itself.
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
     * @method getNextHaloChild
     * @summary
     * @param {TP.sherpa.Halo} aHalo The halo that is requesting the next halo
     *     child.
     * @param {TP.sig.Signal} aSignal
     * @returns {TP.core.ElementNode}
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

TP.core.UIElementNode.Inst.defineMethod('haloCanBlur',
function(aHalo, aSignal) {

    /*
    var evtWin,
        targetWin,
        haloWin,

        sigTarget;

    evtWin = TP.unwrap(aSignal.getWindow());
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

    //  We can always blur
    return true;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('haloCanFocus',
function(aHalo, aSignal) {

    if (this.getNSURI() === TP.w3.Xmlns.SHERPA) {
        return false;
    }

    if (this.hasAttribute('tibet:tag')) {
        return true;
    }

    if (this.getNSURI() === TP.w3.Xmlns.XHTML) {
        return TP.ANCESTOR;
    }

    return true;
});

//  ========================================================================
//  TP.core.ElementNode Additions
//  ========================================================================

//  ------------------------------------------------------------------------
//  HTML Elements
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.body.Type.defineMethod('getUIEditorType',
function(anElement) {

    /**
     * @method getUIEditorType
     * @summary Returns the UIEditor subtype used to edit 'body' elements.
     * @param {HTMLElement} anElement
     * @returns {Type}
     */

    return TP.sys.getTypeByName('TPUIHTMLBodyElementNodeEditor');
});

//  ------------------------------------------------------------------------

TP.html.head.Type.defineMethod('getUIEditorType',
function(anElement) {

    /**
     * @method getUIEditorType
     * @summary Returns the UIEditor subtype used to edit 'head' elements.
     * @param {HTMLElement} anElement
     * @returns {Type}
     */

    return TP.sys.getTypeByName('TPUIHTMLHeadElementNodeEditor');
});

//  ------------------------------------------------------------------------

TP.html.html.Type.defineMethod('getUIEditorType',
function(anElement) {

    /**
     * @method getUIEditorType
     * @summary Returns the UIEditor subtype used to edit 'html' elements.
     * @param {HTMLElement} anElement
     * @returns {Type}
     */

    return TP.sys.getTypeByName('TPUIHTMLHtmlElementNodeEditor');
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getUIEditorType',
function() {

    /**
     * @method getUIEditorType
     * @summary Returns the UIEditor subtype used to edit any UI elements.
     * @returns {Type}
     */

    return TP.core.UIElementNodeEditor;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
