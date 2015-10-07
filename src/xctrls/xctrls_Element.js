//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.xctrls.Element}
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls.Element');

TP.xctrls.Element.addTraits(TP.core.NonNativeUIElementNode);

TP.xctrls.Element.Inst.resolveTraits(
        TP.ac('$setAttribute', 'removeAttribute', 'select', 'signal'),
        TP.core.UIElementNode);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  A TP.core.Hash of 'required attributes' that should be populated on all
//  new instances of the tag.
TP.xctrls.Element.Type.defineAttribute('requiredAttrs');

//  This tag has the CSS common to all XCtrls elements as its associated CSS.
//  Note how this property is TYPE_LOCAL, by design.
TP.xctrls.Element.defineAttribute('styleURI',
                                    '~TP.xctrls.Element/xctrls_common.css');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.xctrls.Element.Type.defineAttribute('opaqueSignalNames',
        TP.ac('TP.sig.DOMMouseDown',
                'TP.sig.DOMMouseUp',
                'TP.sig.DOMMouseOver',
                'TP.sig.DOMMouseOut',
                'TP.sig.DOMFocus',
                'TP.sig.DOMBlur',
                'TP.sig.DOMClick'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.Element.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @method tagCompile
     * @summary Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,

        reqAttrs,
        compAttrs;

    elem = aRequest.at('node');

    //  Make sure that the element gets stamped with a 'tibet:tag' of its tag's
    //  fully qualified *canonical* name.
    TP.elementSetAttribute(elem, 'tibet:tag', TP.canonical(elem), true);

    //  If the type (but not inherited - just at the individual type level)
    //  has specified 'required attributes' that need to be populated on all
    //  new tag instances, then do that here.
    if (TP.notEmpty(reqAttrs = this.get('requiredAttrs'))) {
        TP.elementSetAttributes(elem, reqAttrs, true);
    }

    //  Make sure to add any 'compilation attributes' to the element (since
    //  we don't call up to our supertype here).
    if (TP.notEmpty(compAttrs = this.getCompilationAttrs(aRequest))) {
        TP.elementSetAttributes(elem, compAttrs, true);
    }

    return;
});

//  ------------------------------------------------------------------------
//  TSH Execution Support
//  ------------------------------------------------------------------------

TP.xctrls.Element.Type.defineMethod('cmdRunContent',
function(aRequest) {

    /**
     * @method cmdRunContent
     * @summary Invoked by the TIBET Shell when the tag is being "run" as part
     *     of a pipe or command sequence. For a UI element like an HTML element
     *     this effectively means to render itself onto the standard output
     *     stream.
     * @param {TP.sig.Request|TP.core.Hash} aRequest The request/param hash.
     */

    var elem;

    //  Make sure that we have an Element to work from.
    if (!TP.isElement(elem = aRequest.at('cmdNode'))) {
        return;
    }

    aRequest.atPut('cmdAsIs', true);
    aRequest.atPut('cmdBox', false);

    aRequest.complete(elem);

    return;
});

//  ========================================================================
//  TP.xctrls.CompiledTag
//  ========================================================================

/**
 * @type {TP.xctrls.CompiledTag}
 * @summary A tag type that is compiled and also has the common aspect of all
 *     XControls tags.
 */

//  ------------------------------------------------------------------------

TP.core.CompiledTag.defineSubtype('xctrls.CompiledTag');
TP.xctrls.CompiledTag.addTraits(TP.xctrls.Element);

//  Resolve the 'tagCompile' method in favor of TP.xctrls.Element, but go ahead
//  and execute the one inherited from TP.core.CompiledTag afterwards as well.
TP.xctrls.CompiledTag.Type.resolveTrait(
                                'tagCompile', TP.xctrls.Element, TP.BEFORE);

//  ========================================================================
//  TP.xctrls.TemplatedTag
//  ========================================================================

/**
 * @type {TP.xctrls.TemplatedTag}
 * @summary A tag type that is templated and also has the common aspect of all
 *     XControls tags.
 */

//  ------------------------------------------------------------------------

TP.core.TemplatedTag.defineSubtype('xctrls.TemplatedTag');
TP.xctrls.TemplatedTag.addTraits(TP.xctrls.Element);

//  Resolve the 'tagCompile' method in favor of TP.xctrls.Element, but go ahead
//  and execute the one inherited from TP.core.TemplatedTag afterwards as well.
TP.xctrls.TemplatedTag.Type.resolveTrait(
                                'tagCompile', TP.xctrls.Element, TP.BEFORE);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
