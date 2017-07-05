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
//  TP.html.* Additions
//  ========================================================================

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

TP.html.body.Inst.defineMethod('haloCanDelete',
function(aHalo) {

    return false;
});

//  ------------------------------------------------------------------------

TP.html.head.Inst.defineMethod('haloCanDelete',
function(aHalo) {

    return false;
});

//  ------------------------------------------------------------------------

TP.html.html.Inst.defineMethod('haloCanDelete',
function(aHalo) {

    return false;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
