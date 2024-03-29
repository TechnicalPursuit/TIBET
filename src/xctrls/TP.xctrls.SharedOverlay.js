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
 * @type {TP.xctrls.SharedOverlay}
 */

//  ------------------------------------------------------------------------

TP.xctrls.TemplatedTag.defineSubtype('SharedOverlay');

//  This type is intended to be used as a supertype of concrete types, so we
//  don't allow instance creation
TP.xctrls.SharedOverlay.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  The ID of the shared popup that is used in scenarios where overlays are
//  being shared.
TP.xctrls.SharedOverlay.Type.defineAttribute('sharedOverlayID',
                                                'systemOverlay');

//  This type captures no signals - it lets all signals pass through.
TP.xctrls.SharedOverlay.Type.defineAttribute('opaqueCapturingSignalNames', null);

//  SharedOverlay controls are initially hidden, so we ensure that here.
TP.xctrls.SharedOverlay.set('requiredAttrs', TP.hc('pclass:hidden', true));

//  ------------------------------------------------------------------------
//  Type Methods
//  ----------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Type.defineMethod('constructOverlay',
function(anOverlayID, aTPDocument, overlayAttrs) {

    /**
     * @method constructOverlay
     * @summary Returns (and, if necessary, constructs) the overlay found by
     *     using the supplied overlayID to query the supplied document.
     * @param {String} anOverlayID The ID to use to query for the overlay.
     * @param {TP.dom.Document} aTPDocument The document to create the overlay
     *     in, if it can't be found. Note that, in this case, the overlay will
     *     be created as the last child of the document's 'body' element.
     * @param {TP.core.Hash} [overlayAttrs] A hash of attributes to add to a
     *     newly created overlay element.
     * @returns {TP.xctrls.SharedOverlay} The matching overlay on the supplied
     *     TP.dom.Document.
     */

    var overlayTPElem,

        tpDocBody,

        attrHash,
        overlayElem;

    if (TP.isEmpty(anOverlayID)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    if (TP.notValid(aTPDocument)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    tpDocBody = aTPDocument.getBody();

    if (TP.isValid(tpDocBody)) {

        //  If the caller provided an attribute hash, then copy that. Otherwise,
        //  create a new one. We'll populate it with the 'id' below.
        if (TP.isValid(overlayAttrs)) {
            attrHash = TP.copy(overlayAttrs);
        } else {
            attrHash = TP.hc();
        }

        attrHash.atPut('id', anOverlayID);

        overlayElem = TP.elem(
            '<' + this.getCanonicalName() + ' ' +
            attrHash.asAttributeString() + '/>');

        overlayTPElem = tpDocBody.insertContent(
                                overlayElem,
                                TP.BEFORE_END,
                                TP.hc('doc', aTPDocument.getNativeNode()));
    }

    return overlayTPElem;
});

//  ----------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Type.defineMethod('getOverlayWithID',
function(aTPDocument, anOverlayID, overlayAttrs) {

    /**
     * @method getOverlayWithID
     * @summary Returns (and, if necessary, creates) a 'shared system overlay'
     *     for use by the system on the supplied TP.dom.Document.
     * @param {TP.dom.Document} aTPDocument The document to create the overlay
     *     in, if it can't be found. Note that, in this case, the overlay will
     *     be created as the last child of the document's 'body' element.
     * @param {String} [anOverlayID] The ID to use to query for the system
     *     overlay. If this isn't supplied, the receiver is messaged for it's
     *     'sharedOverlayID'.
     * @param {TP.core.Hash} [overlayAttrs] A hash of attributes to add to a
     *     newly created overlay element.
     * @returns {TP.xctrls.SharedOverlay} The system overlay on the supplied
     *     TP.dom.Document.
     */

    var overlayID,
        overlayTPElem;

    if (TP.notValid(aTPDocument)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    overlayID = TP.ifInvalid(anOverlayID, this.get('sharedOverlayID'));

    overlayTPElem = aTPDocument.get('//*[@id="' + overlayID + '"]');

    //  If the 'get' expression above didn't find one, it hands back an empty
    //  Array. Otherwise it will hand back the TP.dom.ElementNode that
    //  represents the overlay.
    if (TP.isEmpty(overlayTPElem)) {
        overlayTPElem = this.constructOverlay(
                                    overlayID, aTPDocument, overlayAttrs);
    }

    return overlayTPElem;
});

//  ------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Type.defineMethod('getTriggerElement',
function(aSignal, triggerTPDocument) {

    /**
     * @method getTriggerElement
     * @summary Returns the TP.dom.ElementNode that is acting as the
     *     'triggering' element for the overlay. This can be one of three
     *     values:
     *     - The element matching a 'triggerPath' supplied in aSignal
     *     - The target element of the trigger signal supplied in aSignal
     *     - The body element of the triggerTPDocument which should be the
     *         TP.dom.Document that the triggering element is contained in.
     * @param {TP.sig.OpenOverlay} aSignal The TIBET signal which triggered
     *     this method.
     * @param {TP.dom.Document} triggerTPDocument The TP.dom.Document that the
     *     triggering element is contained in.
     * @returns {TP.dom.ElementNode} The TP.dom.ElementNode that caused the
     *     overlay to trigger.
     */

    var triggerSignal,
        triggerPath,
        triggerTPElem,
        origin;

    //  If there is a GUI signal associated with triggering this overlay, then
    //  it will be found inside of aSignal's payload under 'trigger'.
    triggerSignal = aSignal.at('trigger');

    //  If there's a 'triggerPath' in the signal data, then we use that as the
    //  trigger.
    triggerPath = aSignal.at('triggerPath');
    if (TP.notEmpty(triggerPath)) {
        triggerPath = triggerPath.unquoted();
        triggerTPElem = TP.byPath(triggerPath, triggerTPDocument).first();
    } else if (TP.isValid(triggerSignal)) {
        if (TP.isValid(triggerSignal.at('target'))) {
            //  If there's a target on the trigger signal, use that
            triggerTPElem = TP.wrap(triggerSignal.at('target'));
        } else {
            //  Let it default to the trigger signal's origin
            origin = triggerSignal.getOrigin();
            if (TP.isString(origin)) {
                triggerTPElem = TP.bySystemId(origin);
            } else {
                triggerTPElem = TP.wrap(origin);
            }
        }
    } else {
        triggerTPElem = triggerTPDocument.getBody();
    }

    if (TP.notValid(triggerTPElem)) {

        //  Otherwise, there was no valid trigger element, so we just use the
        //  triggering TP.dom.Document's body.
        triggerTPElem = triggerTPDocument.getBody();
    }

    return triggerTPElem;
});

//  ------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Type.defineMethod('openOverlay',
function(aSignal) {

    /**
     * @method openOverlay
     * @summary Opens an overlay element and displays the content inside.
     * @param {TP.sig.OpenOverlay} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.meta.xctrls.SharedOverlay} The receiver.
     */

    var overlayTPElem,

        triggerDoc,
        triggerSignal,

        triggerTPElem,

        hideOn,
        hideOnSignalName,
        hideOnSignalType,

        needsObserve,

        originTPElem;

    overlayTPElem = this.getOverlayElement(aSignal);

    triggerDoc = aSignal.at('triggerTPDocument');
    if (TP.notValid(triggerDoc)) {

        //  Grab the trigger signal from the OpenOverlay signal. This will be
        //  the GUI signal that triggered the OpenOverlay.
        triggerSignal = aSignal.at('trigger');

        if (TP.isValid(triggerSignal)) {
            triggerDoc = triggerSignal.getDocument();
        } else {
            triggerDoc = TP.sys.getUICanvas().getDocument();
        }
    }

    if (TP.notValid(triggerDoc)) {
        //  TODO: Raise an exception
        return this;
    }

    triggerTPElem = this.getTriggerElement(aSignal, triggerDoc);

    //  NB: At this point, there might not be a triggerTPElem. That's ok, but in
    //  that case, we need to make sure that a trigger point has been supplied.
    if (TP.notValid(triggerTPElem) && TP.isEmpty(aSignal.at('triggerPoint'))) {
        //  TODO: Raise an exception
        return this;
    } else {
        overlayTPElem.set('$triggerTPElement', triggerTPElem, false);
    }

    //  If there's a signal name for when to hide the overlay, set up a handler
    //  for it.
    hideOn = aSignal.at('hideOn');
    if (TP.notEmpty(hideOn)) {
        hideOn = hideOn.unquoted();

        //  Compute the full signal name and get the signal type for it.
        hideOnSignalName = TP.expandSignalName(hideOn);
        hideOnSignalType = TP.sys.getTypeByName(hideOnSignalName);

        if (TP.isType(hideOnSignalType)) {

            //  If the signal type's default firing policy says that we need to
            //  observe in order to receive signals, then we'll do that.
            needsObserve = hideOnSignalType.needsObserve();
        } else {
            //  Otherwise, it's probably a spoofed signal (i.e. one without a
            //  type), so we just set needsObserve to false (it's probably a
            //  RESPONDER_FIRING signal).
            needsObserve = false;
        }

        originTPElem = TP.ifInvalid(aSignal.at('hideOrigin'), overlayTPElem);

        //  Note here how we define the handler as a local method on the
        //  specific instance.
        originTPElem.defineHandler(
            hideOnSignalName,
            function(sig) {

                //  If we observed before, we need to ignore here to avoid
                //  leaking.
                if (needsObserve) {
                    originTPElem.ignore(originTPElem,
                                hideOnSignalName,
                                null,
                                TP.sig.SignalMap.REGISTER_CAPTURING);
                }

                originTPElem.callNextMethod();

                //  The overlay is closed.
                overlayTPElem.setAttribute('closed', true);

                //  Hide the overlay.
                overlayTPElem.setAttribute('hidden', true);
            }, {
                phase: TP.CAPTURING,
                patchCallee: true
            });

        //  If we need to observe, then we observe ourself for that signal. Note
        //  here how we observe using a 'capturing' strategy so that we get the
        //  signal before any other underlying control that might block that
        //  signal from bubbling back out to us during regular bubbling phase.
        if (needsObserve) {
            originTPElem.observe(originTPElem,
                                    hideOnSignalName,
                                    null,
                                    TP.sig.SignalMap.REGISTER_CAPTURING);
        }

        //  Save the signal name so that we can uninstall the local method
        //  after we've hidden.
        overlayTPElem.set('$hideOnSignalName', hideOnSignalName, false);
    }

    //  Set the content of the overlay and activate it.
    overlayTPElem.setContentAndActivate(aSignal.getPayload());

    return this;
}, {
    patchCallee: false
});

//  ------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Type.defineMethod('getOverlayElement',
function(aSignal) {

    /**
     * @method getOverlayElement
     * @summary Computes and returns the wrapped Element that will be used to
     *     display the overlay content.
     * @param {TP.sig.OpenOverlay} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.dom.ElementNode} The wrapped Element that will be used to
     *     display the overlay content.
     */

    var triggerSignal,
        triggerDoc,

        overlayID,
        overlayAttrs,

        overlayTPElem;

    //  Grab the trigger signal from the OpenOverlay signal. This will be the
    //  GUI signal that triggered the OpenOverlay.
    triggerSignal = aSignal.at('trigger');

    triggerDoc = aSignal.at('triggerTPDocument');
    if (TP.notValid(triggerDoc)) {
        if (TP.isValid(triggerSignal)) {
            triggerDoc = triggerSignal.getDocument();
        } else {
            triggerDoc = TP.sys.getUICanvas().getDocument();
        }
    }

    if (TP.notValid(triggerDoc)) {
        //  TODO: Raise an exception
        return this;
    }

    //  Grab the overlay with the overlayID. This will default to the value of
    //  the type-level 'sharedOverlayID' variable.
    overlayID = aSignal.at('overlayID');
    if (TP.notEmpty(overlayID)) {
        overlayID = overlayID.unquoted();
    }
    overlayAttrs = aSignal.at('overlayAttrs');

    overlayTPElem = this.getOverlayWithID(triggerDoc, overlayID, overlayAttrs);

    return overlayTPElem;
});

//  ----------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Type.defineMethod('preload',
function(contentInfo) {

    /**
     * @method preload
     * @summary Preloads an overlay of the receiving type given the supplied
     *     overlayID. Note that, if this is a shared overlay, any content
     *     preloaded with this step might very well be replaced with new content
     *     if the first invocation to 'activate' this overlay is not from the
     *     same trigger.
     * @param {TP.core.Hash} contentInfo Information about the content, where to
     *     obtain it, how to render it, where to position it, etc.
     * @returns {TP.meta.xctrls.SharedOverlay} The receiver.
     */

    var triggerDoc,
        overlayID,
        overlayAttrs,

        overlayTPElem;

    triggerDoc = contentInfo.at('triggerTPDocument');

    overlayID = contentInfo.at('overlayID');
    if (TP.notEmpty(overlayID)) {
        overlayID = overlayID.unquoted();
    }
    overlayAttrs = contentInfo.at('overlayAttrs');

    //  Grab the (possibly shared) overlay element. This will cause whatever
    //  'type-level' setup of the content to take place.
    overlayTPElem = this.getOverlayWithID(triggerDoc, overlayID, overlayAttrs);

    //  Invoke loadContent with contentInfo. This should cause the
    //  'instance-level' setup of the content to take place (as far as it can,
    //  given that this might be a shared overlay).
    overlayTPElem.loadContent(contentInfo);

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The last content we displayed. The control using us can use this to
//  determine whether or not it has to regenerate content, etc.
TP.xctrls.SharedOverlay.Inst.defineAttribute('$lastContent');

//  The last TP.dom.ElementNode that triggered the overlay
TP.xctrls.SharedOverlay.Inst.defineAttribute('$triggerTPElement');

TP.xctrls.SharedOverlay.Inst.defineAttribute('$hideOnSignalName');

//  The content info of the last time this overlay was triggered. This is used
//  to temporarily cache information while other asynchronous events (like a
//  stylesheet being loaded) take place
TP.xctrls.SharedOverlay.Inst.defineAttribute('$$lastContentInfo');

TP.xctrls.SharedOverlay.Inst.defineAttribute('overlayContent',
    TP.cpc('> xctrls|content', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Inst.defineHandler('CloseOverlay',
function(aSignal) {

    /**
     * @method handleCloseOverlay
     * @summary Handles when the overlay is to be closed.
     * @param {TP.sig.CloseOverlay} aSignal The signal that caused this handler
     *     to trip.
     * @returns {TP.xctrls.SharedOverlay} The receiver.
     */

    //  The overlay is closed.
    this.setAttribute('closed', true);

    //  Hide the overlay.
    this.setAttribute('hidden', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Inst.defineMethod('getAlignmentCompassCorner',
function() {

    /**
     * @method getAlignmentCompassCorner
     * @summary Returns a constant responding to one of 8 compass points that
     *     the overlay will be positioned at relative to the element that it is
     *     trying to align to. This is the point that the overlay wants to be
     *     positioned *to* relative to it's aligning element.
     * @returns {Number} A Number matching the constant corresponding to the
     *     compass corner.
     */

    return TP.NORTHEAST;
});

//  ------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Inst.defineMethod('getOverlayOffset',
function() {

    /**
     * @method getOverlayOffset
     * @summary Returns a numeric offset from the edge of the overlay's
     *     container that the overlay should use to offset it's position from
     *     the corner it will be positioned at.
     * @returns {Number} The offset.
     */

    return 0;
});

//  ------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Inst.defineMethod('getPositionCompassCorner',
function() {

    /**
     * @method getPositionCompassCorner
     * @summary Returns a constant responding to one of 8 compass points that
     *     the overlay will be positioned at relative to the itself. This is the
     *     point that the overlay wants to be positioned *from* on itself.
     * @returns {Number} A Number matching the constant corresponding to the
     *     compass corner.
     */

    return TP.NORTHWEST;
});

//  ----------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Inst.defineMethod('isContentDifferent',
function(signalToCheck) {

    /**
     * @method isContentDifferent
     * @summary Returns true if the content that was last used with the receiver
     *     is *not* the same content (URI, ID or element content) that is
     *     defined in the supplied signal.
     * @param {TP.sig.OpenOverlay} signalToCheck The signal to check for content
     *     to see if it matches what this overlay displayed last.
     * @returns {Boolean} Whether or not the content in the supplied signal is
     *     different than what the receiver displayed last.
     */

    var lastContent,
        currentContent;

    //  If the caller is forcing a refresh, then we set $lastContent to null and
    //  just return true.
    if (TP.isTrue(signalToCheck.at('forceRefresh'))) {
        this.set('$$lastContent', null, false);
        return true;
    }

    lastContent = this.$get('$lastContent');

    currentContent = signalToCheck.at('contentURI');
    if (TP.isDefined(currentContent)) {
        return !TP.equal(currentContent, lastContent);
    }

    currentContent = signalToCheck.at('contentID');
    if (TP.isDefined(currentContent)) {
        return currentContent !== lastContent;
    }

    currentContent = signalToCheck.at('content');
    if (TP.isDefined(currentContent)) {
        return currentContent !== lastContent;
    }

    return false;
});

//  ----------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Inst.defineMethod('loadContent',
function(contentInfo, overlayContent, afterLoadHandler) {

    /**
     * @method loadContent
     * @summary Loads the content of the receiver's native DOM counterpart to
     *     the content supplied. If the content is not supplied, then the
     *     supplied trigger signal will be queried for content.
     * @param {TP.core.Hash} contentInfo Information about the content, where to
     *     obtain it, how to render it, where to position it, etc.
     * @param {String|Element|DocumentFragment} [overlayContent] The optional
     *     content to place inside of the overlay element.
     * @param {Function} [afterLoadHandler] The optional function to invoke
     *     after the content has loaded (and refreshed from its data). This
     *     Function should take a single parameter, a TP.dom.ElementNode that
     *     will represent the final content.
     * @returns {TP.xctrls.SharedOverlay} The receiver.
     */

    var contentURI,
        contentID,

        finalContent,

        contentElem,

        content,

        contentAttributes,

        tpContent,
        handler;

    //  If we're not ready to render (i.e. our stylesheet hasn't loaded yet),
    //  then just return. When our stylesheet loads, it will use the trigger and
    //  last cached content info to call this method again.
    if (!this.isReadyToRender()) {
        contentInfo.atPut('$afterLoadHandler', afterLoadHandler);
        this.set('$$lastContentInfo', contentInfo, false);
        return this;
    }

    contentURI = contentInfo.at('contentURI');
    if (TP.notEmpty(contentURI)) {
        contentURI = contentURI.unquoted();
        this.set('$lastContent', contentURI, false);
    }

    contentID = contentInfo.at('contentID');
    if (TP.notEmpty(contentID)) {
        contentID = contentID.unquoted();
        this.set('$lastContent', contentID, false);
    }

    //  If the signal has real content in its payload, then use that in
    //  preference to the other mechanisms.
    finalContent = contentInfo.at('content');
    if (TP.notEmpty(finalContent)) {
        this.set('$lastContent', finalContent, false);
    }


    if (TP.isValid(overlayContent)) {
        //  see below for processing content
    } else if (TP.isURIString(contentURI)) {

        contentURI = TP.uc(contentURI);

        //  If we could create a real URI from the supplied URI, then fetch the
        //  content and recursively call this method with that content.
        if (TP.notEmpty(contentURI) && TP.isURI(contentURI)) {

            TP.elementFromURI(contentURI).then(
                function(resultElement) {

                    //  Note the recursive call to this method, but this time
                    //  with content.
                    this.loadContent(
                            contentInfo, resultElement, afterLoadHandler);
                }.bind(this)).catch(
                    function(e) {
                        TP.ifError() ?
                            TP.error('Invalid element ' + TP.str(e)) : 0;
                });

            return this;
        }
    } else if (TP.isString(contentID)) {

        //  Try to grab the element where we'll find the content for the
        //  overlay
        contentElem = TP.byId(contentID, this.getNativeDocument(), false);
        if (!TP.isElement(contentElem)) {
            //  TODO: Raise an exception
            return this;
        }

        //  Normalize whitespace
        TP.nodeNormalize(contentElem);

        //  If we're supposed to use the top-level content element, then do so.
        //  Otherwise, get the child content node/fragment from content element
        //  and use that.
        if (TP.isTrue(contentInfo.at('useTopLevelContentElem'))) {
            content = contentElem;
        } else {
            content = TP.wrap(contentElem).getContentNode();
            content = TP.unwrap(content);
        }

        //  If the content isn't some kind of Node (DocumentFragment or
        //  Element), then raise an exception and exit here.
        if (!TP.isNode(content)) {
            //  TODO: Raise an exception
            return this;
        }

        //  Note the recursive call to this method, but this time with
        //  DocumentFragment content.
        this.loadContent(contentInfo, content, afterLoadHandler);

        //  Return here - we have the recursive call above.
        return this;
    }

    if (TP.notValid(finalContent)) {
        if (TP.notValid(overlayContent)) {
            finalContent =
                TP.documentConstructElement(
                        this.getNativeDocument(), 'span', TP.w3.Xmlns.XHTML);
        } else {
            finalContent = overlayContent;
        }
    }

    if (TP.isString(finalContent)) {
        content = TP.elem(finalContent.unquoted());

        //  If we couldn't form an Element from the finalContent, then we wrap
        //  it into an XHTML span and try again.
        if (!TP.isElement(content)) {
            content = TP.xhtmlnode(
                            '<span>' + finalContent.unquoted() + '</span>');
        }
    } else if (TP.isElement(finalContent)) {
        content = TP.nodeCloneNode(finalContent);
        TP.elementRemoveAttribute(content, 'tibet:no-awaken', true);
    } else if (TP.isFragment(finalContent)) {
        content = TP.documentConstructElement(
                    this.getNativeDocument(), 'span', TP.w3.Xmlns.XHTML);
        TP.nodeAppendChild(content, finalContent, false);
    } else {
        //  TODO: Raise an exception
        return this;
    }

    //  Make sure to clean 'instance-specific' information off of the overlay
    //  content (i.e. attributes like 'id's). This is because we're going to be
    //  duplicating this content in the overlay and we don't want to have
    //  multiple elements with the same id, etc.
    TP.elementClean(content, true);

    //  If there were content attributes defined in the signal, then populate
    //  the content element with them.
    contentAttributes = contentInfo.at('contentAttributes');
    if (TP.notEmpty(contentAttributes)) {
        contentAttributes.perform(
            function(kvPair) {
                TP.elementSetAttribute(
                    content, kvPair.first(), kvPair.last(), true);
            });
    }

    //  That will be the real element generated from the content that got placed
    //  into our 'content' div.
    tpContent = this.setContent(content);

    //  **NOTE** We *must* remove the id here. If our content is coming from an
    //  element that is somewhere else in the visible DOM, but hidden, we don't
    //  want it getting our signals. A new ID will be generated for this
    //  content the next time it is needed.
    tpContent.removeAttribute('id');

    //  Show the overlay content
    tpContent.setAttribute('hidden', false);

    //  Observe the new content when it gets attached to the DOM. When it does,
    //  refresh its bound data.
    handler = function() {

        //  Make sure to ignore here - otherwise, we'll fill up the signal map.
        handler.ignore(tpContent, 'TP.sig.AttachComplete');

        //  If we were handed a callable Function to invoke after all of our
        //  content has been loaded and refreshed, then call it.
        if (TP.isCallable(afterLoadHandler)) {
            afterLoadHandler(tpContent);
        } else if (TP.isCallable(contentInfo.at('$afterLoadHandler'))) {
            contentInfo.at('$afterLoadHandler')(tpContent);
        }

        //  Refresh the content in case it's data bound. Note here that we pass
        //  true to force a re-render in case the data didn't actually change.
        //  We may still want the content to render itself.
        tpContent.refresh(true);
    };

    handler.observe(tpContent, 'TP.sig.AttachComplete');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     * @summary The setter for the receiver's hidden state.
     * @param {Boolean} beHidden Whether or not the receiver is in a hidden
     *     state.
     * @returns {Boolean} Whether the receiver's state is hidden.
     */

    var hideOn,
        handlerName;

    if (beHidden) {

        //  If there was a 'hide on' signal name that was saved, then uninstall
        //  the handler and set the saved signal name to null.
        hideOn = this.get('$hideOnSignalName');
        if (TP.notEmpty(hideOn)) {
            handlerName = TP.composeHandlerName(hideOn);
            if (TP.owns(this, handlerName)) {
                delete this[handlerName];
            }

            this.set('$hideOnSignalName', null, false);
        }

    } else {

        (function() {
            this.setAttribute('active', true);
        }.bind(this)).queueBeforeNextRepaint(this.getNativeWindow());
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Inst.defineMethod('setContent',
function(aContentObject, aRequest) {

    /**
     * @method setContent
     * @summary Sets the content of the receiver's native DOM counterpart to
     *     the value supplied.
     * @param {Object} aContentObject An object to use for content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @returns {TP.dom.Node} The result of setting the content of the
     *     receiver.
     */

    return this.get('overlayContent').setContent(aContentObject, aRequest);
});

//  ------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Inst.defineMethod('setContentAndActivate',
function(contentInfo, overlayContent) {

    /**
     * @method setContentAndActivate
     * @summary Sets the content of the receiver's native DOM counterpart to
     *     the content supplied and activates the receiver. If the content is
     *     not supplied, then the supplied trigger signal will be queried for
     *     content.
     * @param {TP.core.Hash} contentInfo Information about the content, where to
     *     obtain it, how to render it, where to position it, etc.
     * @param {String|Element|DocumentFragment} [overlayContent] The optional
     *     content to place inside of the overlay element.
     * @returns {TP.xctrls.SharedOverlay} The receiver.
     */

    //  Load the content using the supplied contentInfo and overlayContent and a
    //  callback function that will actually position and activate the content
    //  once all of the content loading is done.
    this.loadContent(
        contentInfo,
        overlayContent,
        function(tpContent) {
            var positionCC,

                triggerPoint,
                mousePoint,
                triggerTPElem,

                alignmentCC,

                tpDocBody,
                constrainingRects,
                constrainingTPElements,

                offsetX,
                offsetY;

            //  Compute the position compass corner if its not supplied in the
            //  trigger signal.
            positionCC = contentInfo.at('positionCompassCorner');
            if (TP.isEmpty(positionCC)) {
                positionCC = this.getPositionCompassCorner();
            }

            //  First, see if the open signal provided a overlay point.
            triggerPoint = contentInfo.at('triggerPoint');

            mousePoint = TP.core.Mouse.getLastMovePoint();

            //  If no overlay point was given, compute one from the triggering
            //  element.
            if (TP.notValid(triggerPoint)) {

                triggerTPElem = this.get('$triggerTPElement');

                if (TP.notValid(triggerTPElem)) {
                    //  TODO: Raise an exception
                    return this;
                }

                //  Compute the alignment compass corner if its not supplied in
                //  the trigger signal.
                alignmentCC = contentInfo.at('alignmentCompassCorner');
                if (TP.isEmpty(alignmentCC)) {
                    alignmentCC = this.getAlignmentCompassCorner();
                }

            } else if (triggerPoint === TP.MOUSE) {
                triggerPoint = mousePoint;
            }

            tpDocBody = this.getDocument().getBody();

            //  Grab the list 'constraining rectangles' from the overlay info.
            //  These *must* be in 'global coordinates'. Note that we'll make a
            //  copy of the array, since we're going to modify.
            if (TP.isEmpty(constrainingRects =
                            contentInfo.at('constrainingRects'))) {
                constrainingRects = TP.ac();
            } else {
                constrainingRects = TP.copy(constrainingRects);
            }

            constrainingRects.push(tpDocBody.getGlobalRect());

            if (TP.notEmpty(constrainingTPElements =
                            contentInfo.at('constrainingTPElements'))) {
                constrainingTPElements.forEach(
                    function(aTPElem) {
                        //  We already added the body above so we skip it here.
                        if (aTPElem !== tpDocBody) {
                            return;
                        }

                        constrainingRects.push(aTPElem.getGlobalRect());
                    });
            }

            //  Initially set the overlay to hide (by supplying true we flip the
            //  'visibility' property).
            this.hide(true);

            //  Show the overlay and set up signal handlers.
            this.setAttribute('hidden', false);

            //  The overlay is not closed.
            this.setAttribute('closed', false);

            //  If the signal doesn't have a flag to not position the overlay,
            //  then position the overlay relative to the overlay point and the
            //  corners.
            if (TP.notTrue(contentInfo.at('noPosition'))) {
                offsetX = contentInfo.atIfInvalid('offsetX',
                                                    this.getOverlayOffset());
                offsetY = contentInfo.atIfInvalid('offsetY',
                                                    this.getOverlayOffset());

                //  Queue the positioning of the overlay into a 'next repaint'
                //  so that layout of the overlay's content happens and proper
                //  sizing numbers can be computed.
                (function() {
                    if (triggerPoint) {
                        this.setPositionRelativeTo(
                                            triggerPoint,
                                            positionCC,
                                            alignmentCC,
                                            triggerTPElem,
                                            constrainingRects,
                                            TP.ac(mousePoint),
                                            offsetX,
                                            offsetY);
                    } else {
                        this.positionUsingCompassPoints(
                                            positionCC,
                                            alignmentCC,
                                            triggerTPElem,
                                            constrainingRects,
                                            TP.ac(mousePoint),
                                            offsetX,
                                            offsetY);
                    }

                    //  Now set the overlay to show (by flipping the
                    //  'visibility' property back).
                    this.show();
                }.bind(this)).queueBeforeNextRepaint(this.getNativeWindow());
            }
        }.bind(this));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Inst.defineMethod('stylesheetReady',
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
     * @returns {TP.xctrls.SharedOverlay} The receiver.
     */

    var lastContentInfo;

    //  If we're not awakening this tag, then exit - we want none of the
    //  machinery here to execute.
    if (this.hasAttribute('tibet:no-awaken')) {
        return this;
    }

    lastContentInfo = this.get('$$lastContentInfo');

    //  If there is a last content info, that means there was pending content
    //  that had tried to load, but we weren't ready yet. (Re)invoke loadContent
    //  to load it now.
    if (TP.isValid(lastContentInfo)) {
        //  Load the content of the overlay.
        this.loadContent(lastContentInfo);

        this.set('$$lastContentInfo', null, false);
    }

    return this;
});

//  ============================================================================
//  overlay-specific TP.sig.Signal subtypes
//  ============================================================================

//  overlay signals
TP.sig.Signal.defineSubtype('OpenOverlay');
TP.sig.Signal.defineSubtype('CloseOverlay');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
