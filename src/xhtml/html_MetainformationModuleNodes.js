//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

//  ========================================================================
//  TP.html.meta
//  ========================================================================

/**
 * @type {TP.html.meta}
 * @summary 'meta' tag.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('meta');

TP.html.meta.addTraits(TP.dom.EmptyElementNode);

TP.html.meta.Inst.resolveTraits(
        TP.ac('getContent', 'setContent'),
        TP.dom.EmptyElementNode);

//  ========================================================================
//  TP.html.template
//  ========================================================================

/**
 * @type {TP.html.template}
 * @summary 'template' tag.
 */

//  ------------------------------------------------------------------------

TP.html.Attrs.defineSubtype('template');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.template.Inst.defineMethod('getContent',
function(aRequest) {

    /**
     * @method getContent
     * @summary Returns the receiver's content.
     * @description At this level, this method returns its 'inner content',
     *     which is a serialization of the receiver's '.content' property.
     * @param {TP.sig.Request|TP.core.Hash} aRequest Optional control
     *     parameters.
     * @returns {String} The text content of the native node.
     */

    var nativeNode,
        frag;

    nativeNode = this.getNativeNode();

    //  Note here that force making a copy of the '.content' fragment -
    //  otherwise, we'll throw an error.
    frag = TP.copy(nativeNode.content);
    if (!TP.isFragment(frag)) {
        return '';
    }

    return TP.wrap(frag).asString();
});

//  ------------------------------------------------------------------------

TP.html.template.Inst.defineMethod('getContentNode',
function(aRequest) {

    /**
     * @method getContentNode
     * @summary Returns the receiver's content node(s). This method is provided
     *     for API compatibility with other types.
     * @description At this level, this method returns its 'inner content' node,
     *     which is a TP.dom.DocumentFragment, which will contain a *clone* of
     *     the receiver's '.content'. property.
     * @param {TP.sig.Request|TP.core.Hash} aRequest Optional control
     *     parameters.
     * @returns {TP.dom.DocumentFragment} A TP.dom.DocumentFragment containing
     *     a *clone* of the receiver's '.content' DocumentFragment.
     */

    var nativeNode,
        frag;

    nativeNode = this.getNativeNode();

    //  Note here that force making a copy of the '.content' fragment -
    //  otherwise, we'll throw an error.
    frag = TP.copy(nativeNode.content);
    if (!TP.isFragment(frag)) {
        return null;
    }

    return TP.wrap(frag);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
