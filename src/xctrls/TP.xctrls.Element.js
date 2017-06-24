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

//  This type is intended to be used as either a trait type or supertype of
//  concrete types, so we don't allow instance creation
TP.xctrls.Element.isAbstract(true);

//  This type is used as a general type for 'xctrls' elements that might not
//  have a concrete type since they are really just placeholders (like
//  xctrls:value). Since xctrls doesn't have a fixed schema like some of the
//  other markup language we support (XHTML, SVG, XMPP), this is ok. Therefore,
//  we don't mark it as abstract.

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

//  This tag has no associated CSS. Note how these properties are TYPE_LOCAL, by
//  design.
TP.xctrls.content.defineAttribute('styleURI', TP.NO_RESULT);
TP.xctrls.content.defineAttribute('themeURI', TP.NO_RESULT);

//  This type captures no signals - it lets all signals pass through.
TP.xctrls.content.Type.defineAttribute('opaqueCapturingSignalNames', null);

//  ========================================================================
//  TP.xctrls.hint
//  ========================================================================

/**
 * @type {TP.xctrls.hint}
 * @summary
 */

//  ------------------------------------------------------------------------

TP.xctrls.Element.defineSubtype('xctrls:hint');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This tag has no associated CSS. Note how these properties are TYPE_LOCAL, by
//  design.
TP.xctrls.hint.defineAttribute('styleURI', TP.NO_RESULT);
TP.xctrls.hint.defineAttribute('themeURI', TP.NO_RESULT);

//  This type captures no signals - it lets all signals pass through.
TP.xctrls.hint.Type.defineAttribute('opaqueCapturingSignalNames', null);

//  ------------------------------------------------------------------------

TP.xctrls.hint.Type.defineMethod('$dispatchHintSignal',
function(anEvent) {

    /**
     * @method $dispatchHintSignal
     * @summary Dispatches a TP.sig.UIHint signal based on information in the
     *     supplied event.
     * @param {Event} anEvent The native Event that is causing a TP.sig.UIHint
     *     signal to be dispatched.
     * @returns {TP.xctrls.hint} The receiver.
     */

    var sig,
        tpElem,

        hintElem,
        textContentNode,

        textContent;

    //  Wrap the Event into a Signal and the event's target into a
    //  TP.core.ElementNode wrapper.
    sig = TP.wrap(anEvent);
    tpElem = TP.wrap(sig.getTarget());

    //  Grab the xctrls:hint element under the signal target
    hintElem = TP.byCSSPath('xctrls|hint', tpElem, true);

    //  Grab it's text content and use that as the hint's message.
    textContentNode = hintElem.getFirstChildContentNode();
    if (TP.isValid(textContentNode)) {
        textContent = TP.str(textContentNode);
    }

    tpElem.signal('TP.sig.UIHint', TP.hc('msg', textContent));

    return this;
});

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.xctrls.hint.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        parentElem,

        hintID;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  Grab the parent element of the element we're processing.

    parentElem = elem.parentNode;
    if (TP.isElement(parentElem)) {
        //  If it's real, then install a listener on it that will call our
        //  UIHint dispatch method.
        parentElem.addEventListener('mouseover',
                                    TP.xctrls.hint.$dispatchHintSignal,
                                    false);

        hintID = TP.lid(elem, true);

        //  Also, set 'on:mouseover' and 'on:mouseout' attributes that will send
        //  OpenTooltip/CloseTooltip signals respectively.
        TP.elementSetAttribute(
            parentElem,
            'on:mouseover',
            '{signal: OpenTooltip, payload: {contentID: ' + hintID + '}}',
            true);

        TP.elementSetAttribute(
            parentElem,
            'on:mouseout',
            '{signal: CloseTooltip}',
            true);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.hint.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        parentElem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    //  Grab the parent element of the element we're processing.

    parentElem = elem.parentNode;
    if (TP.isElement(parentElem)) {
        //  If it's real, then remove the listener that we installed in the
        //  attach method that call our UIHints dispatch method.
        parentElem.removeEventListener('mouseover',
                                        TP.xctrls.hint.$dispatchHintSignal,
                                        false);

        //  Also, remove the 'on:mouseover' and 'on:mouseout' attributes that we
        //  set in the attach method.
        TP.elementRemoveAttribute(parentElem, 'on:mouseover', true);

        TP.elementRemoveAttribute(parentElem, 'on:mouseout', true);
    }

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
