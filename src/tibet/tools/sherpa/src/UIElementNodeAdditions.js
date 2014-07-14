//  ========================================================================
/*
NAME:   UIElementNodeAdditions.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        The contents of this file are subject to the terms and conditions of
        the Technical Pursuit License ("TPL") Version 1.5, or subsequent
        versions as allowed by the TPL, and You may not copy or use this
        file in either source code or executable form, except in compliance
        with the terms and conditions of the TPL.  You may obtain a copy of
        the TPL (the "License") from Technical Pursuit Inc. at
        http://www.technicalpursuit.com.

        All software distributed under the License is provided strictly on
        an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR
        IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS ALL SUCH
        WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT,
        OR NON-INFRINGEMENT. See the License for specific language governing
        rights and limitations under the License.
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
     * @todo
     */

    var haloWin,
        ourWin,

        ourRect,
    
        ourIFrame,
    
        untransformedRect,
        transformedRect;

    haloWin = aHalo.getNativeWindow();
    ourWin = this.getNativeWindow();

    ourRect = this.getGlobalRect();

    //  If the halo is operating in the same window as us, just return our
    //  'global rect'
    if (haloWin === ourWin) {
        return ourRect;
    }

    if (!TP.isIFrameWindow(ourWin)) {
        return ourRect;
    }

    ourIFrame = TP.wrap(ourWin.frameElement);

    untransformedRect = ourIFrame.getGlobalRect();
    transformedRect = ourIFrame.getGlobalRect(true);

    ourRect.setX(ourRect.getX() +
                (transformedRect.getX() - untransformedRect.getX()));
    ourRect.setY(ourRect.getY() +
                (transformedRect.getY() - untransformedRect.getY()));
    ourRect.setWidth(ourRect.getWidth() +
                (transformedRect.getWidth() - untransformedRect.getWidth()));
    ourRect.setHeight(ourRect.getHeight() +
                (transformedRect.getHeight() - untransformedRect.getHeight()));
    
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
     * @todo
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

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
