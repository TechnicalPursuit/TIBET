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
     * @param {TP.lama.Halo} aHalo The halo that is requesting whether or not
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
     * @param {TP.lama.Halo} aHalo The halo that is requesting whether or not
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
     * @param {TP.lama.Halo} aHalo The halo that is requesting whether or not
     *     it can delete the receiver.
     * @returns {Boolean} Whether or not the halo can delete the receiver.
     */

    //  The <head> Element cannot be deleted.
    return false;
});

//  ------------------------------------------------------------------------

TP.html.html.Inst.defineMethod('hudCanConnect',
function(aHUD) {

    /**
     * @method hudCanConnect
     * @summary Returns whether or not the hud should allow the supplied element
     *     to be connected to the supplied element
     * @param {TP.lama.hud} aHUD The hud that is requesting whether or not
     *     it can connect the supplied element to the receiver.
     * @returns {Boolean} Whether or not the hud can connect the supplied target
     *     to the receiver.
     */

    //  We never allow connection to the <html> Element.
    return false;
});

//  ------------------------------------------------------------------------

TP.html.html.Inst.defineMethod('hudCanDrop',
function(aHUD, droppingTPElem) {

    /**
     * @method hudCanDrop
     * @summary Returns whether or not the hud should allow the supplied element
     *     to be dropped into the receiver.
     * @param {TP.lama.hud} aHUD The hud that is requesting whether or not
     *     it can drop the supplied element into the receiver.
     * @param {TP.dom.ElementNode} droppingTPElem The element that is being
     *     dropped.
     * @returns {Boolean} Whether or not the hud can drop the supplied target
     *     into the receiver.
     */

    //  No element can be dropped into the <html> Element by default.
    return false;
});

//  ------------------------------------------------------------------------

TP.html.head.Inst.defineMethod('hudCanConnect',
function(aHUD) {

    /**
     * @method hudCanConnect
     * @summary Returns whether or not the hud should allow the supplied element
     *     to be connected to the supplied element
     * @param {TP.lama.hud} aHUD The hud that is requesting whether or not
     *     it can connect the supplied element to the receiver.
     * @returns {Boolean} Whether or not the hud can connect the supplied target
     *     to the receiver.
     */

    //  We never allow connection to the <head> Element.
    return false;
});

//  ------------------------------------------------------------------------

TP.html.head.Inst.defineMethod('hudCanDrop',
function(aHUD, droppingTPElem) {

    /**
     * @method hudCanDrop
     * @summary Returns whether or not the hud should allow the supplied element
     *     to be dropped into the receiver.
     * @param {TP.lama.hud} aHUD The hud that is requesting whether or not
     *     it can drop the supplied element into the receiver.
     * @param {TP.dom.ElementNode} droppingTPElem The element that is being
     *     dropped.
     * @returns {Boolean} Whether or not the hud can drop the supplied target
     *     into the receiver.
     */

    //  No element can be dropped into the <head> Element by default.
    return false;
});

//  ------------------------------------------------------------------------

TP.html.body.Inst.defineMethod('hudCanDrop',
function(aHUD, droppingTPElem) {

    /**
     * @method hudCanDrop
     * @summary Returns whether or not the hud should allow the supplied element
     *     to be dropped into the receiver.
     * @param {TP.lama.hud} aHUD The hud that is requesting whether or not
     *     it can drop the supplied element into the receiver.
     * @param {TP.dom.ElementNode} droppingTPElem The element that is being
     *     dropped.
     * @returns {Boolean} Whether or not the hud can drop the supplied target
     *     into the receiver.
     */

    //  No element can be dropped into the <body> Element by default.
    return false;
});

//  ------------------------------------------------------------------------

TP.html.html.Inst.defineMethod('haloCanEmpty',
function(aHalo) {

    /**
     * @method haloCanEmpty
     * @summary Returns whether or not the halo can empty the receiver from its
     *     DOM tree.
     * @param {TP.lama.Halo} aHalo The halo that is requesting whether or not
     *     it can empty the receiver.
     * @returns {Boolean} Whether or not the halo can empty the receiver.
     */

    //  The <html> Element cannot be emptied.
    return false;
});

//  ------------------------------------------------------------------------

TP.html.body.Inst.defineMethod('haloCanEmpty',
function(aHalo) {

    /**
     * @method haloCanEmpty
     * @summary Returns whether or not the halo can empty the receiver from its
     *     DOM tree.
     * @param {TP.lama.Halo} aHalo The halo that is requesting whether or not
     *     it can empty the receiver.
     * @returns {Boolean} Whether or not the halo can empty the receiver.
     */

    //  The <body> Element cannot be emptied.
    return false;
});

//  ------------------------------------------------------------------------

TP.html.head.Inst.defineMethod('haloCanEmpty',
function(aHalo) {

    /**
     * @method haloCanEmpty
     * @summary Returns whether or not the halo can empty the receiver from its
     *     DOM tree.
     * @param {TP.lama.Halo} aHalo The halo that is requesting whether or not
     *     it can empty the receiver.
     * @returns {Boolean} Whether or not the halo can empty the receiver.
     */

    //  The <head> Element cannot be deleted.
    return false;
});

//  ------------------------------------------------------------------------

TP.html.span.Inst.defineMethod('getContentForDomHUDLabel',
function() {

    /**
     * @method getContentForDomHUDLabel
     * @summary Returns the label that the Lama's 'domhud' panel will use when
     *     displaying it's representation for this node.
     * @returns {String} The label to use in the 'domhud' panel.
     */

    if (this.hasAttribute('tibet:textbinding')) {
        return 'ACP Expression';
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.html.span.Inst.defineMethod('lamaGetTextContent',
function() {

    /**
     * @method lamaGetTextContent
     * @summary Returns the text content that the Lama will use when
     *     manipulating the receiver's 'text content'. Note that the Lama
     *     currently only manipulates a single Text node that exists as a leaf
     *     of an Element. If there is mixed Element and Text node content, then
     *     that is ignored and this method returns the empty String.
     * @returns {String} The text content that the Lama will use to manage the
     *     receiver's 'text content'.
     */

    var bindInfo,
        str;

    if (this.hasAttribute('tibet:textbinding')) {

        //  NB: We know for a fact, because we generated this binding from a
        //  sugared text binding expression, that we have a 'bind:in' attribute
        //  with an aspect name of 'value' and a single binding expression
        //  aspect value.
        bindInfo = this.getBindingInfoFrom('bind:in',
                                            this.getAttribute('bind:in'));

        str = bindInfo.at('value').at('dataExprs').at(0);
        str = '[[' + str + ']]';

        return str;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.html.span.Inst.defineMethod('lamaSetTextContent',
function(aContent) {

    /**
     * @method lamaSetTextContent
     * @summary Sets the text content of the receiver as the Lama would do it.
     *     Note that since the Lama currently does not handle more than a
     *     single Text node as a leaf under an Element node, if the receiver has
     *     descendant elements, this method will do nothing.
     * @param {String} aContent The content to set the receiver's text content
     *     to.
     * @returns {TP.html.span} The receiver.
     */

    var val,
        attrVal,

        elem;

    if (this.hasAttribute('tibet:textbinding')) {

        //  Extract out the binding statement.
        TP.regex.BINDING_STATEMENT_EXTRACT.lastIndex = 0;
        val = TP.regex.BINDING_STATEMENT_EXTRACT.exec(aContent).at(1);

        //  The attribute value will be a binding expression with a single
        //  aspect, 'value'. Make sure to quote the expression if there is
        //  whitespace in the value.
        if (TP.regex.WHITESPACE.test(val)) {
            attrVal = '{value: \'[[' + val + ']]\'}';
        } else {
            attrVal = '{value: [[' + val + ']]}';
        }

        //  Make sure to flush any binding cache information for the computed
        //  attribute value. Since this uses the value of the supplied
        //  attribute as a key into the binding information registry, we make
        //  sure to do this *before* we reset the value.
        this.flushBindingInfoCacheFor('bind:in');

        //  Set the value of the bind:in attribute. Note that we do this to the
        //  native node directly, to avoid any existing binding change machinery
        //  from getting in the way.
        elem = this.getNativeNode();
        TP.elementSetAttribute(elem, 'bind:in', attrVal, true);

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
