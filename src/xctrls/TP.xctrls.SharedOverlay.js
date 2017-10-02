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

//  The ID of the last trigger that triggered the overlay
TP.xctrls.SharedOverlay.Type.defineAttribute('$lastTriggerID');

//  ------------------------------------------------------------------------
//  Type Methods
//  ----------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Type.defineMethod('getOverlayWithID',
function(aTPDocument, anOverlayID) {

    /**
     * @method getOverlayWithID
     * @summary Returns (and, if necessary, creates) a 'shared system overlay'
     *     for use by the system on the supplied TP.core.Document.
     * @param {TP.core.Document} aTPDocument The document to create the overlay
     *     in, if it can't be found. Note that, in this case, the overlay will
     *     be created as the last child of the document's 'body' element.
     * @param {String} [anOverlayID] The ID to use to query for the system
     *     overlay. If this isn't supplied, the receiver is messaged for it's
     *     'sharedOverlayID'.
     * @returns {TP.xctrls.SharedOverlay} The system overlay on the supplied
     *     TP.core.Document.
     */

    var tpDocBody,
        overlayID,
        overlayElem,
        overlayTPElem;

    if (TP.notValid(aTPDocument)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    overlayID = TP.ifInvalid(anOverlayID, this.get('sharedOverlayID'));

    overlayTPElem = aTPDocument.get('//*[@id="' + overlayID + '"]');

    //  If the 'get' expression above didn't find one, it hands back an empty
    //  Array. Otherwise it will hand back the TP.core.ElementNode that
    //  represents the overlay.
    if (TP.isEmpty(overlayTPElem)) {

        tpDocBody = aTPDocument.getBody();

        if (TP.isValid(tpDocBody)) {

            overlayElem = TP.elem(
                '<' + this.getCanonicalName() + ' id="' + overlayID + '"/>');

            overlayTPElem = tpDocBody.insertContent(
                                    overlayElem,
                                    TP.BEFORE_END,
                                    TP.hc('doc', aTPDocument.getNativeNode()));
        }
    }

    return overlayTPElem;
});

//  ------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Type.defineMethod('getTriggerElement',
function(aSignal, triggerTPDocument) {

    /**
     * @method getTriggerElement
     * @summary Returns the TP.core.ElementNode that is acting as the
     *     'triggering' element for the overlay. This can be one of three
     *     values:
     *     - The element matching a 'triggerPath' supplied in aSignal
     *     - The target element of the trigger signal supplied in aSignal
     *     - The body element of the triggerTPDocument which should be the
     *         TP.core.Document that the triggering element is contained in.
     * @param {TP.sig.OpenOverlay} aSignal The TIBET signal which triggered
     *     this method.
     * @param {TP.core.Document} triggerTPDocument The TP.core.Document that the
     *     triggering element is contained in.
     * @returns {TP.core.ElementNode} The TP.core.ElementNode that caused the
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
        triggerTPElem = TP.byPath(triggerPath, triggerTPDocument).first();
    } else if (TP.isValid(triggerSignal) &&
                TP.isValid(triggerSignal.at('target'))) {
        //  If there's a target on the trigger signal, use that
        triggerTPElem = TP.wrap(triggerSignal.at('target'));
    } else if (TP.isValid(triggerSignal)) {
        //  Let it default to the trigger signal's origin
        origin = triggerSignal.getOrigin();
        if (TP.isString(origin)) {
            triggerTPElem = TP.bySystemId(origin);
        } else {
            triggerTPElem = TP.wrap(origin);
        }
    }

    if (TP.notValid(triggerTPElem)) {

        //  Otherwise, there was no valid trigger element, so we just use the
        //  triggering TP.core.Document's body.
        triggerTPElem = triggerTPDocument.getBody();
    }

    return triggerTPElem;
});

//  ------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Type.defineMethod('openOverlay',
function(aSignal) {

    /**
     * @method openOverlay
     * @param {TP.sig.OpenOverlay} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.xctrls.SharedOverlay} The receiver.
     */

    var triggerSignal,
        triggerDoc,

        overlayID,

        overlayTPElem,

        overlayCSSClass,

        triggerID,
        triggerTPElem,

        hideOn;

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

    overlayTPElem = this.getOverlayWithID(triggerDoc, overlayID);

    //  If the overlay is already visible, then exit - we don't need to open it.
    if (overlayTPElem.isVisible()) {
        return this;
    }

    //  See if the OpenOverlay signal contains a class that we should put on
    //  the overlay element itself.
    overlayCSSClass = aSignal.at('overlayCSSClass');
    if (TP.notEmpty(overlayCSSClass)) {
        overlayTPElem.addClass(overlayCSSClass);
    }

    triggerTPElem = this.getTriggerElement(aSignal, triggerDoc);
    triggerID = triggerTPElem.getLocalID(true);

    overlayTPElem.set('$currentTriggerID', triggerID);

    //  NB: At this point, there might not be a triggerTPElem. That's ok, but in
    //  that case, we need to make sure that a trigger point has been supplied.
    if (TP.notValid(triggerTPElem) && TP.isEmpty(aSignal.at('triggerPoint'))) {
        //  TODO: Raise an exception
        return this;
    } else {
        overlayTPElem.set('$triggerTPElement', triggerTPElem);
    }

    //  If there's a signal name for when to hide the overlay, set up a handler
    //  for it.
    hideOn = aSignal.at('hideOn');
    if (TP.notEmpty(hideOn)) {
        hideOn = hideOn.unquoted();

        //  Note here how we define the handler as a local method on the
        //  specific instance.
        overlayTPElem.defineHandler(
            hideOn,
            function(sig) {

                this.callNextMethod();

                this.setAttribute('hidden', true);
            }, {
                patchCallee: true
            });

        //  Save the signal name so that we can uninstall the local method after
        //  we've hidden.
        overlayTPElem.set('$hideOnSignalName', hideOn);
    }

    //  Set the content of the overlay and activate it.
    overlayTPElem.setContentAndActivate(aSignal);

    return this;
}, {
    patchCallee: false
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The ID of the current trigger that is trying to trigger the overlay
TP.xctrls.SharedOverlay.Inst.defineAttribute('$currentTriggerID');

//  The last TP.core.Element that triggered the overlay
TP.xctrls.SharedOverlay.Inst.defineAttribute('$triggerTPElement');

TP.xctrls.SharedOverlay.Inst.defineAttribute('$$hideOnSignalName');

TP.xctrls.SharedOverlay.Inst.defineAttribute('$$lastOpenSignal');

TP.xctrls.SharedOverlay.Inst.defineAttribute('overlayContent',
    TP.cpc('> xctrls|content', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Inst.defineMethod('getPositioningPoint',
function(anOverlayPoint) {

    /**
     * @method getPositioningPoint
     * @summary Computes and returns the point used to position the overlay
     *     using the supplied point (which should be the initial point).
     * @param {TP.core.Point} anOverlayPoint The initial point to use to
     *     position the overlay. NOTE: This point should be in *global*
     *     coordinates.
     * @returns {TP.core.Point} The point (in global coordinates) to position
     *     the overlay at.
     */

    var offset,

        overlayPoint,
        overlayRect,

        bodyTPElem,
        bodyRect,

        bodyScrollOffsets;

    offset = this.getOverlayOffset();

    //  Compute rectangle, supplying it the overlay origin point and the
    //  overlay's width and height. This is important to do the calculation
    //  below where we try to 'fit' the rectangle within the body (so that it
    //  doesn't clip against a window boundary or something).

    //  Note here that we have to double the margin to account for the original
    //  margin as defined in the initial CSS.
    overlayRect = TP.rtc(
                    anOverlayPoint.getX().max(offset),
                    anOverlayPoint.getY().max(offset),
                    this.getWidth() + offset,
                    this.getHeight() + offset);

    //  Grab the body's rectangle and constrain the overlay rectangle against
    //  it.

    bodyTPElem = this.getDocument().getBody();

    bodyRect = bodyTPElem.getGlobalRect();

    bodyRect.constrainRect(overlayRect);

    bodyScrollOffsets = bodyTPElem.getScrollOffsetPoint();
    overlayRect.addToX(bodyScrollOffsets.getX());
    overlayRect.addToY(bodyScrollOffsets.getY());

    //  Now, get the 'top left' corner point of the rectangle.
    overlayPoint = overlayRect.getXYPoint();

    return overlayPoint;
});

//  ------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Inst.defineMethod('getOverlayCorner',
function() {

    /**
     * @method getOverlayCorner
     * @summary Returns a constant responding to one of 8 compass points that
     *     the overlay will be positioned at relative to the overlay's
     *     container.
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

TP.xctrls.SharedOverlay.Inst.defineMethod('positionUsing',
function(anOverlayPoint) {

    /**
     * @method positionUsing
     * @summary Positions the overlay using the supplied point.
     * @param {TP.core.Point} anOverlayPoint The point to use to position the
     *     overlay. NOTE: This point should be in *global* coordinates.
     * @returns {TP.xctrls.SharedOverlay} The receiver.
     */

    var overlayPoint;

    overlayPoint = this.getPositioningPoint(anOverlayPoint);

    //  Set our global position to be that point
    this.setGlobalPosition(overlayPoint);

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

            this.set('$hideOnSignalName', null);
        }

    } else {

        (function() {
            this.setAttribute('active', true);
        }.bind(this)).queueForNextRepaint(this.getNativeWindow());
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
     * @returns {TP.core.Node} The result of setting the content of the
     *     receiver.
     */

    return this.get('overlayContent').setContent(aContentObject, aRequest);
});

//  ------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Inst.defineMethod('setContentAndActivate',
function(openSignal, overlayContent) {

    /**
     * @method setContentAndActivate
     * @summary Sets the content of the receiver's native DOM counterpart to
     *     the content supplied and activates the receiver. If the content is
     *     not supplied, then the supplied trigger signal will be queried for
     *     contentID (the ID of an inlined content element) or contentURI (a URI
     *     pointing to some content).
     * @param {TP.sig.OpenOverlay} openSignal The signal that was thrown to
     *     cause this overlay to show.
     * @param {String|Element|DocumentFragment} [overlayContent] The optional
     *     content to place inside of the overlay element.
     * @returns {TP.core.Node} The result of setting the content of the
     *     receiver.
     */

    var extractElementFromResult,

        contentURI,
        contentID,

        contentElem,

        content,
        finalContent,

        triggerID,

        overlayCorner,

        triggerRect,
        overlayPoint,
        triggerTPElem,

        tpContent,
        handler,

        lastMoveEvent,
        lastMoveSignal;

    triggerTPElem = this.get('$triggerTPElement');

    //  If we're not ready to render (i.e. our stylesheet hasn't loaded yet),
    //  then just return. When our stylesheet loads, it will use the trigger and
    //  last open signal cached above to call this method again.
    if (!this.isReadyToRender()) {

        this.set('$$lastOpenSignal', openSignal);
        return this;
    }

    contentURI = openSignal.at('contentURI');
    if (TP.notEmpty(contentURI)) {
        contentURI = contentURI.unquoted();
    }

    contentID = openSignal.at('contentID');
    if (TP.notEmpty(contentID)) {
        contentID = contentID.unquoted();
    }

    if (TP.isValid(overlayContent)) {
        //  see below for processing content
    } else if (TP.isURIString(contentURI)) {

        contentURI = TP.uc(contentURI);

        extractElementFromResult = function(result) {

            var elem;

            //  If the URI pointed to a type and that type is a subtype
            //  of TP.core.ElementNode, then create an Element using the
            //  canonical name
            if (TP.isType(result) &&
                TP.isSubtypeOf(result, TP.core.ElementNode)) {
                elem = TP.elem('<' + result.getCanonicalName() + '/>');
            } else {
                elem = TP.elem(result.get('data'));
            }

            return elem;
        };

        //  If we could create a real URI from the supplied URI, then fetch the
        //  content and recursively call this method with that content.
        if (TP.notEmpty(contentURI) && TP.isURI(contentURI)) {

            if (contentURI.get('mode') === TP.core.SyncAsync.ASYNCHRONOUS) {
                contentURI.getResource().then(
                    function(result) {

                        var elem;

                        elem = extractElementFromResult(result);

                        //  Note the recursive call to this method, but this
                        //  time with content.
                        this.setContentAndActivate(openSignal, elem);

                    }.bind(this));

                //  Return here - we have the recursive call above.
                return this;
            } else {
                finalContent = extractElementFromResult(
                                contentURI.getResource().get('result'));
            }
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

        if (TP.isTrue(openSignal.at('useTopLevelContentElem'))) {
            content = contentElem;
        } else if (TP.nodeGetChildElements(contentElem).getSize() > 1) {
            //  Grab all of the content element's child nodes as a
            //  DocumentFragment.
            content = TP.nodeListAsFragment(contentElem.childNodes);
        } else if (TP.isValid(contentElem.content)) {
            //  If the content element has a '.content' slot on it, then it
            //  might be an HTML5 <template> element. In this case, obtain its
            //  content (a DocumentFragment) by using the '.content' slot, but
            //  make sure to clone the content so that we don't remove it.
            content = TP.nodeCloneNode(contentElem.content);
        } else {
            content = TP.nodeGetFirstChildElement(contentElem);
        }

        //  If the content isn't some kind of Node (DocumentFragment or
        //  Element), then raise an exception and exit here.
        if (!TP.isNode(content)) {
            //  TODO: Raise an exception
            return this;
        }

        //  Note the recursive call to this method, but this time with
        //  DocumentFragment content.
        this.setContentAndActivate(openSignal, content);

        //  Return here - we have the recursive call above.
        return this;
    }

    if (TP.notValid(finalContent)) {
        if (TP.notValid(overlayContent)) {
            //  TODO: Raise an exception
            return this;
        }

        finalContent = overlayContent;
    }

    if (TP.isString(finalContent)) {
        content = TP.elem(finalContent.unquoted());
    } else if (TP.isElement(finalContent)) {
        content = TP.nodeCloneNode(finalContent);
        TP.elementRemoveAttribute(content, 'tibet:noawaken', true);
    } else if (TP.isFragment(finalContent)) {
        content = TP.documentConstructElement(
                    this.getNativeDocument(), 'span', TP.w3.Xmlns.XHTML);
        TP.nodeAppendChild(content, finalContent, false);
    } else {
        //  TODO: Raise an exception
        return this;
    }

    //  Capture the trigger ID in case that same trigger uses this overlay
    //  before another trigger uses it - we can use this for comparison purposes
    //  for content refresh, etc.

    triggerID = this.get('$currentTriggerID');
    this.getType().set('$lastTriggerID', triggerID);

    //  That will be the real element generated from the content that got placed
    //  into our 'content' div.
    tpContent = this.setContent(content);
    tpContent.removeAttribute('id');

    //  Observe the new content when it gets attached to the DOM. When it does,
    //  refresh its bound data.
    handler = function() {

        //  Make sure to ignore here - otherwise, we'll fill up the signal
        //  map.
        handler.ignore(tpContent, 'TP.sig.AttachComplete');

        //  Note here how we don't force the rendering behavior - if the data
        //  has changed, the content will re-render.
        tpContent.refresh();
    };

    handler.observe(tpContent, 'TP.sig.AttachComplete');

    //  First, see if the open signal provided a overlay point.
    overlayPoint = openSignal.at('triggerPoint');

    //  If no overlay point was given, compute one from the triggering element.
    if (TP.notValid(overlayPoint)) {

        if (TP.notValid(triggerTPElem)) {
            //  TODO: Raise an exception
            return this;
        }

        //  Grab the global rect from the supplied element.
        triggerRect = triggerTPElem.getGlobalRect();

        //  Compute the corner if its not supplied in the trigger signal.
        overlayCorner = openSignal.at('corner');
        if (TP.isEmpty(overlayCorner)) {
            overlayCorner = this.getOverlayCorner();
        }

        //  The point that the overlay should appear at is the 'edge point' for
        //  that compass edge of the trigger rectangle.
        overlayPoint = triggerRect.getEdgePoint(overlayCorner);
    } else if (overlayPoint === TP.MOUSE) {
        lastMoveEvent = TP.core.Mouse.$get('lastMove');
        lastMoveSignal = TP.sig.DOMMouseMove.construct(lastMoveEvent);
        overlayPoint = lastMoveSignal.getGlobalPoint();
    }

    //  Show the overlay content
    tpContent.setAttribute('hidden', false);

    //  Show the overlay and set up signal handlers.
    this.setAttribute('hidden', false);

    //  If the signal doesn't have a flag to not position the overlay, then
    //  position the overlay relative to the overlay point and the corner.
    if (TP.notTrue(openSignal.at('noPosition'))) {
        this.positionUsing(overlayPoint);
    }

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

    var lastOpenSignal;

    //  If we're not awakening this tag, then exit - we want none of the
    //  machinery here to execute.
    if (this.hasAttribute('tibet:noawaken')) {
        return this;
    }

    lastOpenSignal = this.get('$$lastOpenSignal');

    if (TP.isValid(lastOpenSignal)) {
        //  Set the content of the overlay and activate it.
        this.setContentAndActivate(lastOpenSignal);

        this.set('$$lastOpenSignal', null);
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
