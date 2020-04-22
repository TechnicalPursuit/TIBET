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
//  TP.html.a
//  ========================================================================

/**
 * @type {TP.html.a}
 * @summary A tag. An anchor or hypertext link.
 */

//  ------------------------------------------------------------------------

TP.html.Focused.defineSubtype('a');

TP.html.a.Type.set('uriAttrs', TP.ac('href'));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.html.a.Type.defineMethod('isResponderForUIFocusChange',
function(aNode, aSignal) {

    /**
     * @method isResponderForUIFocusChange
     * @summary Returns true if the node has an 'href' attribute (but not if it
     *     has a 'disabled' attribute) to match (X)HTML semantics.
     * @param {Node} aNode The node to check which may have further data as to
     *     whether this type should be considered to be a responder.
     * @param {TP.sig.Signal} aSignal The signal that responders are being
     *     computed for.
     * @returns {Boolean} True when the receiver should respond to aSignal.
     */

    return TP.elementHasAttribute(aNode, 'href', true) &&
            !TP.elementHasAttribute(aNode, 'disabled', true);
});

//  ------------------------------------------------------------------------

TP.html.a.Type.defineMethod('isResponderForUIFocusComputation',
function(aNode, aSignal) {

    /**
     * @method isResponderForUIFocusComputation
     * @summary Returns true if the node has an 'href' attribute (but not if it
     *     has a 'disabled' attribute) to match (X)HTML semantics.
     * @param {Node} aNode The node to check which may have further data as to
     *     whether this type should be considered to be a responder.
     * @param {TP.sig.Signal} aSignal The signal that responders are being
     *     computed for.
     * @returns {Boolean} True when the receiver should respond to aSignal.
     */

    return TP.elementHasAttribute(aNode, 'href', true) &&
            !TP.elementHasAttribute(aNode, 'disabled', true);
});

//  ------------------------------------------------------------------------

TP.html.a.Type.defineMethod('tagResolve',
function(aRequest) {

    /**
     * @method tagResolve
     * @summary Resolves the receiver's content. This includes resolving XML
     *     Base URIs and virtual URIs that may occur on the receiver's
     *     attributes.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,

        href,

        target,

        onClickVal;

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    //  Capture the original HREF value so we can undo expansion if necessary.
    href = TP.elementGetAttribute(elem, 'href', true);

    //  Call up the chain and force expansion and any other default processing.
    this.callNextMethod();

    //  If the target is a local reference (a path or _self) it means we're
    //  targeting a TIBET-controlled surface. If not then we don't want to
    //  interfere with normal processing so we don't rewrite.
    if (TP.notEmpty(target = TP.elementGetAttribute(elem, 'target', true))) {
        if (!TP.regex.NON_SIMPLE_PATH.test(target) && target !== '_self') {
            return;
        }
    }

    //  If the element has the 'tibet:no-rewrite' flag, then don't rewrite it.
    if (TP.elementHasAttribute(elem, 'tibet:no-rewrite', true)) {
        return;
    }

    //  If there's already a click handler the author "wins", even if that
    //  means they don't get the benefit of TIBET here.
    onClickVal = TP.elementGetAttribute(elem, 'onclick', true);
    if (TP.notEmpty(onClickVal)) {

        //  If there was an 'href' of '#' or an empty 'href', then we return.
        //  This means either a) the author originally had an 'onclick' value or
        //  b) we already rewrote a link into a TP.go2() expression.
        if (href === '#' || TP.isEmpty(href)) {
            return;
        }
    }

    //  Same check for 'on:click'.
    onClickVal = TP.elementGetAttribute(elem, 'on:click', true);
    if (TP.notEmpty(onClickVal)) {

        //  If there was an 'href' of '#' or an empty 'href', then we return.
        //  This means either a) the author originally had an 'on:click' value
        //  or b) we already rewrote a link into a TP.go2() expression.
        if (href === '#' || TP.isEmpty(href)) {
            return;
        }
    }

    //  Links with an empty HREF will try to reload the page. We really don't
    //  want that, we want to have them do nothing. We set '#' here and let the
    //  check further down add a return false click handler.
    if (TP.isEmpty(href)) {
        TP.elementSetAttribute(elem, 'href', '#', true);
    }

    //  Links with an empty anchor will try to reset at the top of page. Don't
    //  let that happen either, just "dampen them" via onclick.
    if (href === '#') {
        TP.elementSetAttribute(
            elem,
            'onclick',
            'TP.core.Mouse.invokeObservers(\'click\', event);' +
            ' return false;',
            true);

        return;
    }

    //  If the link triggers a javascript url (or is javascript: void 0) exit.
    /* eslint-disable no-script-url */
    if (href.startsWith('javascript:')) {
        return;
    }
    /* eslint-enable no-script-url */

    //  If the original value wasn't a route then refetch to get the fully
    //  expanded form so we use that for our TP.go2() call.
    if (href.indexOf('#') !== 0 && href !== '/') {
        href = TP.elementGetAttribute(elem, 'href', true);
    }

    //  First, just set the 'href' to '#' to limit traversal and link display.
    TP.elementSetAttribute(elem, 'href', '#', true);

    //  Then add an 'onclick' that will service any TIBET click handling
    //  machinery and then trigger TIBET's go2 call to process the link at
    //  runtime. Note that we pass the event object so that the proper observers
    //  can be invoked and also 'return false' to help ensure no traversal from
    //  the link.
    TP.elementSetAttribute(
        elem,
        'onclick',
        ' TP.go2(\'' + href + '\', window, event);' +
        ' return false;',
        true);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.html.a.Inst.defineMethod('setAttrHref',
function(value) {

    /**
     * @method setAttrHref
     * @summary Sets the href that the receiver will use to retrieve its
     *     content.
     * @param {String} anHref The URL that the receiver will use to fetch its
     *     content.
     */

    var elem,

        target;

    elem = this.getNativeNode();

    if (!TP.isElement(elem)) {
        //  setting an attribute returns void according to the spec
        return;
    }

    //  If the target is a local reference (a path or _self) it means we're
    //  targeting a TIBET-controlled surface. If not then we don't want to
    //  interfere with normal processing so we don't rewrite.
    if (TP.notEmpty(target = TP.elementGetAttribute(elem, 'target', true))) {
        if (!TP.regex.NON_SIMPLE_PATH.test(target) && target !== '_self') {
            //  setting an attribute returns void according to the spec
            return;
        }
    }

    //  If the element has the 'tibet:no-rewrite' flag, then don't rewrite it.
    if (TP.elementHasAttribute(elem, 'tibet:no-rewrite', true)) {
        return;
    }

    //  NB: Unlike the 'tagResolve' method above, there is no check here to
    //  exit early based on the onclick value. This is due to the fact that the
    //  href is being set, not being rewritten from authored markup, and the
    //  caller should know what they're doing.

    //  Links with an empty HREF will try to reload the page. We really don't
    //  want that, we want to have them do nothing. We set '#' here and let the
    //  check further down add a return false click handler.
    if (TP.isEmpty(value)) {
        TP.elementSetAttribute(elem, 'href', '#', true);
    }

    //  Links with an empty anchor will try to reset at the top of page. Don't
    //  let that happen either, just "dampen them" via onclick.
    if (value === '#') {
        TP.elementSetAttribute(
            elem,
            'onclick',
            'TP.core.Mouse.invokeObservers(\'click\', event);' +
            ' return false;',
            true);

        //  setting an attribute returns void according to the spec
        return;
    }

    //  If the link triggers a javascript url (or is javascript: void 0) exit.
    /* eslint-disable no-script-url */
    if (TP.notEmpty(value) && value.startsWith('javascript:')) {
        //  setting an attribute returns void according to the spec
        return;
    }
    /* eslint-enable no-script-url */

    //  First, just set the 'href' to '#' to limit traversal and link display.
    TP.elementSetAttribute(elem, 'href', '#', true);

    //  Then add an 'onclick' that will service any TIBET click handling
    //  machinery and then trigger TIBET's go2 call to process the link at
    //  runtime. Note that we pass the event object so that the proper observers
    //  can be invoked and also 'return false' to help ensure no traversal from
    //  the link.
    TP.elementSetAttribute(
        elem,
        'onclick',
        ' TP.go2(\'' + value + '\', window, event);' +
        ' return false;',
        true);

    //  setting an attribute returns void according to the spec
    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
