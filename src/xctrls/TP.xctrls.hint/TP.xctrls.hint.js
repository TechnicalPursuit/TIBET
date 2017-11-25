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
 * @type {TP.xctrls.hint}
 * @summary Manages hint XControls.
 */

//  ------------------------------------------------------------------------

TP.xctrls.TemplatedTag.defineSubtype('xctrls:hint');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This tag has no associated CSS. Note how this property is TYPE_LOCAL, by
//  design.
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

        targetElem,
        targetID,

        targetTPElem,

        hintTPElem,
        textContentNode,

        textContent;

    //  Wrap the Event into a Signal and the event's *resolved* target into a
    //  TP.core.ElementNode wrapper. Note that we use the resolved target here
    //  because the mouse over might have happened on something like an
    //  'xctrls:label' and we want the core control element, which will be the
    //  parent in that case.
    sig = TP.wrap(anEvent);

    targetElem = sig.getResolvedTarget();

    //  If we can't get a resolved target, that might mean that the target is
    //  itself disabled. We don't care here - we're just interested in any
    //  target.
    if (!TP.isElement(targetElem)) {
        targetElem = sig.getTarget();
    }

    //  Still can't find a target? Exit here.
    if (!TP.isElement(targetElem)) {
        //  TODO: Raise an exception
        return this;
    }

    targetID = TP.elementGetAttribute(targetElem, 'id', true);

    targetTPElem = TP.wrap(targetElem);

    //  Grab the xctrls:hint element under the signal target. Note we supply
    //  true to try to 'autocollapse' an Array of 1 result into just the result.
    hintTPElem = TP.byCSSPath('xctrls|hint', targetTPElem, true);

    //  If there was more than one, then the query was invalid. Return true.
    if (TP.isArray(hintTPElem)) {
        //  TODO: Raise an exception
        return this;
    }

    //  Couldn't find a hint element. Go up the ancestor chain looking for an
    //  'on:mouseover' containing the 'OpenTooltip' signal name.
    if (TP.notValid(hintTPElem)) {
        targetElem = TP.nodeAncestorMatchingCSS(
                            targetElem, '*[on|mouseover*="OpenTooltip"]');

        if (TP.isElement(targetElem)) {
            targetTPElem = TP.wrap(targetElem);

            //  Grab the xctrls:hint element under the signal target
            hintTPElem = TP.byCSSPath('xctrls|hint', targetTPElem, true);
        } else {

            //  Couldn't find one by traversing the ancestor chain. See if an
            //  xctrls:hint exists with a 'for=' attribute containing the target
            //  ID.
            hintTPElem = TP.byCSSPath('xctrls|hint[for="' + targetID + '"]',
                                        sig.getDocument(),
                                        true);
        }

        if (TP.notValid(hintTPElem)) {
            return this;
        }
    }

    //  Grab it's text content and use that as the hint's message.
    textContentNode = hintTPElem.getFirstChildContentNode();
    if (TP.isValid(textContentNode)) {
        textContent = TP.str(textContentNode);
    }

    targetTPElem.signal('TP.sig.UIHint', TP.hc('msg', textContent));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.hint.Type.defineMethod('setupHintOn',
function(anElement, hintElement, tooltipParams) {

    /**
     * @method setupHintOn
     * @summary Sets up the hint on the supplied element.
     * @param {Element} anElement The element to install the hint behavior on.
     *     The typical behavior here is to install a mouseover event listener
     *     that will dispatch the UIHint signal.
     * @param {Element} hintElement The corresponding xctrls:hint element.
     * @param {TP.core.Hash} [tooltipParams] A hash of parameters to pass to the
     *     signal that will open the hint in a tooltip.
     * @returns {TP.xctrls.hint} The receiver.
     */

    var hintID,

        params,

        handler;

    if (!TP.isElement(anElement)) {
        //  TODO: Raise an exception
        return this;
    }

    //  If it's real, then install a listener on it that will call our
    //  UIHint dispatch method.
    anElement.addEventListener('mouseover',
                                TP.xctrls.hint.$dispatchHintSignal,
                                false);

    if (TP.notValid(tooltipParams)) {
        params = TP.hc();
    } else {
        params = tooltipParams.copy();
    }

    hintID = TP.lid(hintElement, true);
    params.atPut('contentID', hintID);

    //  Install low-level event listeners that will handle signaling
    //  OpenTooltip/CloseTooltip on mouseover/mouseout.
    anElement.addEventListener(
                'mouseover',
                handler = function(evt) {

                    var overParams;

                    //  Note here how we copy the params that we captured when
                    //  the overall method was defined and add the signal
                    //  wrapping the low-level event. TP.sig.OpenTooltip expects
                    //  a trigger signal so that it can compute position, etc.
                    overParams = TP.copy(this.$tooltipOverHandler.params);
                    overParams.atPut('trigger', TP.wrap(evt));

                    TP.wrap(this).signal('TP.sig.OpenTooltip', overParams);
                },
                false);
    anElement.$tooltipOverHandler = handler;
    handler.params = params;

    anElement.addEventListener(
                'mouseout',
                handler = function(evt) {
                    //  Cancel it if isn't showing yet.
                    TP.wrap(this).signal('TP.sig.CancelTooltip');

                    //  Hide it if it is showing.
                    TP.wrap(this).signal('TP.sig.CloseTooltip');
                },
                false);
    anElement.$tooltipOutHandler = handler;

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.hint.Type.defineMethod('teardownHintOn',
function(anElement, hintElement) {

    /**
     * @method teardownHintOn
     * @summary Tears down the hint on the supplied element.
     * @param {Element} anElement The element to uninstall the hint behavior
     *     from.
     * @returns {TP.xctrls.hint} The receiver.
     */

    if (!TP.isElement(anElement)) {
        //  TODO: Raise an exception
        return this;
    }

    //  If it's real, then remove the listener that we installed in the
    //  attach method that call our UIHints dispatch method.
    anElement.removeEventListener('mouseover',
                                    TP.xctrls.hint.$dispatchHintSignal,
                                    false);

    //  Also, remove the listeners that we installed to show/hide tooltips.
    anElement.removeEventListener(
                'mouseover',
                anElement.$tooltipOverHandler,
                false);

    anElement.addEventListener(
                'mouseout',
                anElement.$tooltipOutHandler,
                false);

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
        forElem,

        params,

        delay;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return this.raise('TP.sig.InvalidNode');
    }

    //  If we have a 'for' attribute, see if there is an Element that matches
    //  that ID.
    if (TP.elementHasAttribute(elem, 'for', true)) {
        forElem = TP.byId(TP.elementGetAttribute(elem, 'for', true),
                            TP.nodeGetDocument(elem),
                            false);
    }

    //  If there wasn't an element matching the 'for' element, grab the parent
    //  element of the element we're processing.
    if (!TP.isElement(forElem)) {
        forElem = elem.parentNode;
    }

    params = TP.hc();

    //  If the hint element has a 'delay' attribute, then pass that along to the
    //  setup method.
    delay = TP.elementGetAttribute(elem, 'delay', true);
    if (TP.notEmpty(delay)) {
        params.atPut('delay', delay.asNumber());
    }

    //  Setup the hint machinery
    this.setupHintOn(forElem, elem, params);

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
        forElem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception
        return;
    }

    //  If we have a 'for' attribute, see if there is an Element that matches
    //  that ID.
    if (TP.elementHasAttribute(elem, 'for', true)) {
        forElem = TP.byId(TP.elementGetAttribute(elem, 'for', true),
                            TP.nodeGetDocument(elem),
                            false);
    }

    //  If there wasn't another 'for' element, grab the parent element of the
    //  element we're processing.
    if (!TP.isElement(forElem)) {
        forElem = elem.parentNode;
    }

    //  Teardown the hint machinery
    this.teardownHintOn(forElem);

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
