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

TP.dom.UIElementNode.defineSubtype('xctrls.Element');

//  This type is intended to be used as either a trait type or supertype of
//  concrete types, so we don't allow instance creation
TP.xctrls.Element.isAbstract(true);

//  This type is used as a general type for 'xctrls' elements that might not
//  have a concrete type since they are really just placeholders (like
//  xctrls:value). Since xctrls doesn't have a fixed schema like some of the
//  other markup language we support (XHTML, SVG, XMPP), this is ok. Therefore,
//  we don't mark it as abstract.

TP.xctrls.Element.addTraits(TP.dom.NonNativeUIElementNode);

TP.xctrls.Element.Inst.resolveTraits(
        TP.ac('$setAttribute', 'removeAttribute', 'select', 'signal'),
        TP.dom.UIElementNode);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  A TP.core.Hash of 'required attributes' that should be populated on all
//  new instances of the tag.
TP.xctrls.Element.Type.defineAttribute('requiredAttrs');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.xctrls.Element.Type.defineAttribute('opaqueCapturingSignalNames',
        TP.ac(
            'TP.sig.DOMClick',
            'TP.sig.DOMDblClick',

            'TP.sig.DOMKeyDown',
            'TP.sig.DOMKeyPress',
            'TP.sig.DOMKeyUp',

            'TP.sig.DOMMouseDown',
            'TP.sig.DOMMouseEnter',
            'TP.sig.DOMMouseLeave',
            'TP.sig.DOMMouseOut',
            'TP.sig.DOMMouseOver',
            'TP.sig.DOMMouseUp',

            'TP.sig.DOMFocus',
            'TP.sig.DOMBlur'
        ));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.Element.Type.defineMethod('tagAttachStyle',
function(aRequest) {

    /**
     * @method tagAttachStyle
     * @summary Sets up runtime style for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var doc;

    //  We see if the request has a target document. If so, we use that as the
    //  document.
    if (!TP.isDocument(doc = aRequest.at('doc'))) {
        //  TODO: Raise an exception
        return;
    }

    //  Add the core stylesheet for all 'xctrls:' elements here. Note how we
    //  invoke this - by specifically invoking it against 'TP.xctrls.Element',
    //  we bind 'this' to this specific type, even if it's invoked by a subtype.
    //  Then, by calling the next-most-specific method, the subtype's stylesheet
    //  will be added.
    TP.xctrls.Element.addStylesheetTo(doc);

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.Element.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @method tagCompile
     * @summary Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Element} The element.
     */

    var elem,

        reqAttrs;

    elem = aRequest.at('node');

    //  If the type (but not inherited - just at the individual type level)
    //  has specified 'required attributes' that need to be populated on all
    //  new tag instances, then do that here.
    if (TP.notEmpty(reqAttrs = this.get('requiredAttrs'))) {
        TP.elementSetAttributes(elem, reqAttrs, true);
    }

    //  Populate any 'compilation attributes' from the request onto the element
    //  that we're producing (since we don't call up to our supertype here).
    this.populateCompilationAttrs(aRequest);

    return elem;
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

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.xctrls.Element.Type.defineMethod('shouldWrapACPOutput',
function() {

    /**
     * @method shouldWrapACPOutput
     * @summary Whether or not we should wrap ACP expression output in an XHTML
     *     span element. The default is true, but some subtypes that allow ACP
     *     in their embedded templates might choose to not generate these
     *     wrapper spans.
     * @returns {Boolean} Whether or not to wrap it.
     */

    return false;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.Element.Inst.defineMethod('stylesheetReady',
function(aStyleTPElem) {

    /**
     * @method stylesheetReady
     * @summary A method that is invoked when the supplied stylesheet is
     *     'ready', which means that it's attached to the receiver's Document
     *     and all of it's style has been parsed and applied.
     * @description Typically, the supplied stylesheet Element is the one that
     *     the receiver is waiting for so that it can finalized style
     *     computations. This could be either the receiver's 'core' stylesheet
     *     or it's current 'theme' stylesheet, if the receiver is executing in a
     *     themed environment.
     * @param {TP.html.style} aStyleTPElem The XHTML 'style' element that is
     *     ready.
     * @returns {TP.xctrls.Element} The receiver.
     */

    //  Signal that we are ready.
    this.dispatch('TP.sig.DOMReady');

    return this;
});

//  ========================================================================
//  TP.xctrls.ComputedTag
//  ========================================================================

/**
 * @type {TP.xctrls.ComputedTag}
 * @summary A tag type that is computed and also has the common aspect of all
 *     XControls tags.
 */

//  ------------------------------------------------------------------------

TP.tag.ComputedTag.defineSubtype('xctrls.ComputedTag');
TP.xctrls.ComputedTag.addTraits(TP.xctrls.Element);

//  Resolve the 'tagCompile' method in favor of TP.xctrls.Element, but go ahead
//  and execute the one inherited from TP.tag.ComputedTag afterwards as well.
TP.xctrls.ComputedTag.Type.resolveTrait(
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

TP.tag.TemplatedTag.defineSubtype('xctrls.TemplatedTag');
TP.xctrls.TemplatedTag.addTraits(TP.xctrls.Element);

//  Resolve the 'tagCompile' method in favor of TP.xctrls.Element, but go ahead
//  and execute the one inherited from TP.tag.TemplatedTag afterwards as well.
TP.xctrls.TemplatedTag.Type.resolveTrait(
                                'tagCompile', TP.xctrls.Element, TP.BEFORE);

//  ------------------------------------------------------------------------
//  Instance Method
//  ------------------------------------------------------------------------

TP.xctrls.TemplatedTag.Inst.defineMethod('getSerializationTraversal',
function() {

    /**
     * @method getSerializationTraversal
     * @summary Returns a constant, either TP.DESCEND or TP.CONTINUE, that
     *     determines whether serialization will descend into descendant nodes
     *     of this node or not. If TP.CONTINUE is return that means that only
     *     select descendants, as determined by this type's
     *     getDescendantsForSerialization method will be serialized.
     * @returns {Number} Either TP.DESCEND or TP.CONTINUE.
     */

    return TP.CONTINUE;
});

//  ========================================================================
//  TP.xctrls.value
//  ========================================================================

/**
 * @type {TP.xctrls.value}
 * @summary A tag that can hold an arbitrary value. The xctrls common CSS
 *     has rules that cause this tag and its content to be hidden. It is defined
 *     so that development when the Sherpa is loaded does not cause an
 *     'autodefinition' of a missing tag.
 */

//  ------------------------------------------------------------------------

TP.xctrls.Element.defineSubtype('xctrls:value');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This tag has no associated CSS. Note how these properties are TYPE_LOCAL, by
//  design.
TP.xctrls.value.defineAttribute('styleURI', TP.NO_RESULT);
TP.xctrls.value.defineAttribute('themeURI', TP.NO_RESULT);

//  ========================================================================
//  TP.xctrls.content
//  ========================================================================

/**
 * @type {TP.xctrls.content}
 * @summary A tag that can hold arbitrary content. The xctrls common CSS
 *     has rules that cause this tag to have block-level display. It is defined
 *     so that development when the Sherpa is loaded does not cause an
 *     'autodefinition' of a missing tag.
 */

//  ------------------------------------------------------------------------

TP.xctrls.Element.defineSubtype('xctrls:content');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This tag has no associated CSS. Note how these properties are TYPE_LOCAL, by
//  design.
TP.xctrls.content.defineAttribute('styleURI', TP.NO_RESULT);
TP.xctrls.content.defineAttribute('themeURI', TP.NO_RESULT);

//  This type captures no signals - it lets all signals pass through.
TP.xctrls.content.Type.defineAttribute('opaqueCapturingSignalNames', null);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
