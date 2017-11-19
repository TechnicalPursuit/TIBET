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

TP.html.html.Inst.defineMethod('haloCanDelete',
function(aHalo) {

    /**
     * @method haloCanDelete
     * @summary Returns whether or not the halo can delete the receiver from its
     *     DOM tree.
     * @param {TP.sherpa.Halo} aHalo The halo that is requesting whether or not
     *     it can delete the receiver.
     * @returns {Boolean} Whether or not the halo can delete the receiver.
     */

    //  The <html> Element cannot be deleted.
    return false;
});

//  ------------------------------------------------------------------------

TP.html.body.Inst.defineMethod('haloCanDelete',
function(aHalo) {

    /**
     * @method haloCanDelete
     * @summary Returns whether or not the halo can delete the receiver from its
     *     DOM tree.
     * @param {TP.sherpa.Halo} aHalo The halo that is requesting whether or not
     *     it can delete the receiver.
     * @returns {Boolean} Whether or not the halo can delete the receiver.
     */

    //  The <body> Element cannot be deleted.
    return false;
});

//  ------------------------------------------------------------------------

TP.html.head.Inst.defineMethod('haloCanDelete',
function(aHalo) {

    /**
     * @method haloCanDelete
     * @summary Returns whether or not the halo can delete the receiver from its
     *     DOM tree.
     * @param {TP.sherpa.Halo} aHalo The halo that is requesting whether or not
     *     it can delete the receiver.
     * @returns {Boolean} Whether or not the halo can delete the receiver.
     */

    //  The <head> Element cannot be deleted.
    return false;
});

//  ------------------------------------------------------------------------

TP.html.html.Inst.defineMethod('hudCanDrop',
function(aHUD, targetTPElem) {

    /**
     * @method hudCanDrop
     * @summary Returns whether or not the hud should allow the supplied element
     *     to be dropped into the receiver.
     * @param {TP.sherpa.hud} aHUD The hud that is requesting whether or not
     *     it can drop the supplied element into the receiver.
     * @param {TP.sherpa.hud} droppingTPElem The element that is being dropped.
     * @returns {Boolean} Whether or not the hud can drop the supplied target
     *     into the receiver.
     */

    //  No element can be dropped into the <html> Element by default.
    return false;
});

//  ------------------------------------------------------------------------

TP.html.body.Inst.defineMethod('hudCanDrop',
function(aHUD, targetTPElem) {

    /**
     * @method hudCanDrop
     * @summary Returns whether or not the hud should allow the supplied element
     *     to be dropped into the receiver.
     * @param {TP.sherpa.hud} aHUD The hud that is requesting whether or not
     *     it can drop the supplied element into the receiver.
     * @param {TP.sherpa.hud} droppingTPElem The element that is being dropped.
     * @returns {Boolean} Whether or not the hud can drop the supplied target
     *     into the receiver.
     */

    //  No element can be dropped into the <body> Element by default.
    return false;
});

//  ------------------------------------------------------------------------

TP.html.span.Inst.defineMethod('sherpaDomHudGetLabel',
function() {

    /**
     * @method sherpaDomHudGetLabel
     * @summary Returns the label that the Sherpa's 'domhud' panel will use when
     *     displaying it's representation for this node.
     * @returns {String} The label to use in the 'domhud' panel.
     */

    if (this.hasAttribute('tibet:desugaredTextBinding')) {
        return 'ACP Expression';
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.html.span.Inst.defineMethod('sherpaGetTextContent',
function() {

    /**
     * @method sherpaGetTextContent
     * @summary Returns the text content that the Sherpa will use when
     *     manipulating the receiver's 'text content'. Note that the Sherpa
     *     currently only manipulates a single Text node that exists as a leaf
     *     of an Element. If there is mixed Element and Text node content, then
     *     that is ignored and this method returns the empty String.
     * @returns {String} The text content that the Sherpa will use to manage the
     *     receiver's 'text content'.
     */

    var bindInfo,
        str;

    if (this.hasAttribute('tibet:desugaredTextBinding')) {

        //  NB: We know for a fact, because we generated this binding from a
        //  sugared text binding expression, that we have a 'bind:in' attribute
        //  with an aspect name of 'value' and a single binding expression
        //  aspect value.
        bindInfo = this.getBindingInfoFrom(this.getAttribute('bind:in'));

        str = bindInfo.at('value').at('dataExprs').at(0);
        str = '[[' + str + ']]';

        return str;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.html.span.Inst.defineMethod('sherpaSetTextContent',
function(aContent) {

    /**
     * @method sherpaSetTextContent
     * @summary Sets the text content of the receiver as the Sherpa would do it.
     *     Note that since the Sherpa currently does not handle more than a
     *     single Text node as a leaf under an Element node, if the receiver has
     *     descendant elements, this method will do nothing.
     * @param {String} aContent The content to set the receiver's text content
     *     to.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var val,
        attrVal,

        elem;

    if (this.hasAttribute('tibet:desugaredTextBinding')) {

        //  Extract out the binding statement.
        TP.regex.BINDING_STATEMENT_EXTRACT.lastIndex = 0;
        val = TP.regex.BINDING_STATEMENT_EXTRACT.exec(aContent).at(1);

        //  The attribute value will be a binding expression with a single
        //  aspect, 'value'.
        attrVal = '{value: ' + val + '}';

        //  Set the value of the bind:in attribute. Note that we do this to the
        //  native node directly, to avoid any existing binding change machinery
        //  from getting in the way.
        elem = this.getNativeNode();
        TP.elementSetAttribute(elem, 'bind:in', attrVal, true);

        //  Make sure to flush any binding cache information for the computed
        //  attribute value.
        this.flushBindingInfoCacheFor(attrVal);

        //  Refresh ourself. This will cause the binding cache to be rebuilt and
        //  for the new data to populate into the GUI.
        this.refresh();

        return this;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
