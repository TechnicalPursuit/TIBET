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

//  The ID of the last trigger that triggered the overlay.
TP.xctrls.SharedOverlay.Type.defineAttribute('$lastTriggerID');

//  ------------------------------------------------------------------------
//  Type Methods
//  ----------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Type.defineMethod('getOverlayWithID',
function(aTPDocument, anOverlayID) {

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
     * @returns {TP.xctrls.SharedOverlay} The system overlay on the supplied
     *     TP.dom.Document.
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
    //  Array. Otherwise it will hand back the TP.dom.ElementNode that
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

        overlayCSSClass,

        triggerDoc,
        triggerSignal,

        triggerID,
        triggerTPElem,

        hideOn;

    overlayTPElem = this.getOverlayElement(aSignal);

    //  See if the OpenOverlay signal contains a class that we should put on
    //  the overlay element itself.
    overlayCSSClass = aSignal.at('overlayCSSClass');
    if (TP.notEmpty(overlayCSSClass)) {
        overlayTPElem.addClass(overlayCSSClass);
    }

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

    //  If the signal has a triggerID, then use that. Otherwise, use the local
    //  ID of the trigger element.
    triggerID = aSignal.at('triggerID');
    if (TP.notValid(triggerID)) {
        triggerID = triggerTPElem.getLocalID(true);
    }

    overlayTPElem.set('$currentTriggerID', triggerID, false);

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
        overlayTPElem.set('$hideOnSignalName', hideOn, false);
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

    overlayTPElem = this.getOverlayWithID(triggerDoc, overlayID);

    return overlayTPElem;
});

//  ----------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Type.defineMethod('preload',
function(contentInfo) {

    /**
     * @method preload
     * @summary Preloads an overlay of the receiving type given the combination
     *     of supplied overlayID and triggerID. Note that, if this is a shared
     *     overlay, any content preloaded with this step might very well be
     *     replaced with new content if the first invocation to 'activate' this
     *     overlay is not from the same trigger.
     * @param {TP.core.Hash} contentInfo Information about the content, where to
     *     obtain it, how to render it, where to position it, etc.
     * @returns {TP.meta.xctrls.SharedOverlay} The receiver.
     */

    var triggerDoc,
        overlayID,

        triggerID,
        triggerPath,
        triggerTPElem,

        overlayTPElem;

    triggerDoc = contentInfo.at('triggerTPDocument');
    overlayID = contentInfo.at('overlayID');

    //  Grab the triggerID from the supplied info. If it's not available, then
    //  try to compute one from a triggerPath if it's supplied. If it's not
    //  supplied, then use the body as the trigger element and obtain it's ID.
    triggerID = contentInfo.at('triggerID');
    if (TP.notValid(triggerID)) {
        triggerPath = contentInfo.at('triggerPath');
        if (TP.notEmpty(triggerPath)) {
            triggerTPElem = TP.byPath(triggerPath, triggerDoc).first();
        } else {
            triggerTPElem = triggerDoc.getBody();
        }
        triggerID = triggerTPElem.getLocalID(true);
    }

    //  Grab the (possibly shared) overlay element. This will cause whatever
    //  'type-level' setup of the content to take place.
    overlayTPElem = this.getOverlayWithID(triggerDoc, overlayID);
    overlayTPElem.set('$currentTriggerID', triggerID, false);

    //  Invoke loadContent with contentInfo. This should cause the
    //  'instance-level' setup of the content to take place (as far as it can,
    //  given that this might be a shared overlay).
    overlayTPElem.loadContent(contentInfo);

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The ID of the current trigger that is trying to trigger the overlay
TP.xctrls.SharedOverlay.Inst.defineAttribute('$currentTriggerID');

//  The last TP.dom.ElementNode that triggered the overlay
TP.xctrls.SharedOverlay.Inst.defineAttribute('$triggerTPElement');

TP.xctrls.SharedOverlay.Inst.defineAttribute('$$hideOnSignalName');

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

    this.setAttribute('hidden', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Inst.defineMethod('getPositioningPoint',
function(anOverlayPoint, anAvoidPoint) {

    /**
     * @method getPositioningPoint
     * @summary Computes and returns the point used to position the overlay
     *     using the supplied point (which should be the initial point).
     * @param {TP.gui.Point} anOverlayPoint The initial point to use to
     *     position the overlay. NOTE: This point should be in *global*
     *     coordinates.
     * @param {TP.gui.Point} [anAvoidPoint] A point to 'avoid' when computing
     *     the positioning point. The system will shift the overlay around,
     *     trying to avoid this point.
     * @returns {TP.gui.Point} The point (in global coordinates) to position
     *     the overlay at.
     */

    var offset,

        overlayPoint,
        overlayRect,

        bodyTPElem,
        bodyRect,

        bodyScrollOffsets,

        testPoint,
        overlayCorner,

        diffX,
        diffY;

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

    //  Constrain the overlay rectangle to inside of the body element rectangle.
    //  This will make sure that the overlay's content isn't clipped against the
    //  body of its document.
    bodyRect.constrainRect(overlayRect);

    //  Make sure to add in the scrolling offsets.
    bodyScrollOffsets = bodyTPElem.getScrollOffsetPoint();
    overlayRect.addToX(bodyScrollOffsets.getX());
    overlayRect.addToY(bodyScrollOffsets.getY());

    //  If the computed overlay rectangle includes the 'avoid point' (in many
    //  cases, this is the current mouse location), then try to adjust its X and
    //  Y to avoid that point
    if (TP.isValid(anAvoidPoint)) {

        testPoint = TP.copy(anAvoidPoint);

        overlayCorner = this.getOverlayCorner();

        //  Adjust the testing point based on our overlay corner. The intent is
        //  to adjust the testing point by a pixel in both the X and Y
        //  directions to not have it be part of the test itself.
        switch (overlayCorner) {

            case TP.NORTHEAST:
                testPoint.addToX(1);
                testPoint.subtractFromY(1);
                break;
            case TP.NORTHWEST:
                testPoint.subtractFromX(1);
                testPoint.subtractFromY(1);
                break;
            case TP.SOUTHEAST:
                testPoint.addToX(1);
                testPoint.addToY(1);
                break;
            case TP.SOUTHWEST:
                testPoint.subtractFromX(1);
                testPoint.addToY(1);
                break;
            default:
                break;
        }

        if (overlayRect.containsPoint(testPoint)) {
            if (overlayRect.containsPointX(testPoint)) {

                diffX = overlayRect.getX() + overlayRect.getWidth() -
                        testPoint.getX();

                //  If by subtracting the difference, we're still greater than 0,
                //  then do that (shifting the overlay towards the left).
                if (overlayRect.getX() - diffX > 0) {
                    overlayRect.subtractFromX(diffX);
                } else if (overlayRect.getX() + diffX < bodyRect.getWidth()) {
                    //  Otherwise, if by adding the difference, we're still less
                    //  than the body's rectangle, then do that (shifting the
                    //  overlay towards the right by 1px)
                    overlayRect.addToX(1);
                }
            }

            if (overlayRect.containsPointY(testPoint)) {

                diffY = overlayRect.getY() + overlayRect.getHeight() -
                        testPoint.getY();

                //  If by subtracting the difference, we're still greater than 0,
                //  then do that (shifting the overlay towards the top).
                if (overlayRect.getY() - diffY > 0) {
                    overlayRect.subtractFromY(diffY);
                } else if (overlayRect.getY() + diffY < bodyRect.getHeight()) {
                    //  Otherwise, if by adding the difference, we're still less
                    //  than the body's rectangle, then do that (shifting the
                    //  overlay towards the bottom by 1px)
                    overlayRect.addToY(1);
                }
            }
        }
    }

    //  Now, get the 'top left' corner point of the computed overlay rectangle.
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

        extractElementFromResult,
        contentElem,

        content,

        contentAttributes,

        triggerID,

        tpContent,
        handler;

    //  If we're not ready to render (i.e. our stylesheet hasn't loaded yet),
    //  then just return. When our stylesheet loads, it will use the trigger and
    //  last cached content info to call this method again.
    if (!this.isReadyToRender()) {
        contentInfo.atPut('afterLoadHandler', afterLoadHandler);
        this.set('$$lastContentInfo', contentInfo, false);
        return this;
    }

    contentURI = contentInfo.at('contentURI');
    if (TP.notEmpty(contentURI)) {
        contentURI = contentURI.unquoted();
    }

    contentID = contentInfo.at('contentID');
    if (TP.notEmpty(contentID)) {
        contentID = contentID.unquoted();
    }

    //  If the signal has real content in its payload, then use that in
    //  preference to the other mechanisms.
    finalContent = contentInfo.at('content');

    if (TP.isValid(overlayContent)) {
        //  see below for processing content
    } else if (TP.isURIString(contentURI)) {

        contentURI = TP.uc(contentURI);

        extractElementFromResult = function(result) {

            var elem;

            //  If the URI pointed to a type and that type is a subtype
            //  of TP.dom.ElementNode, then create an Element using the
            //  canonical name
            if (TP.isType(result) &&
                TP.isSubtypeOf(result, TP.dom.ElementNode)) {
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
                        this.loadContent(contentInfo, elem, afterLoadHandler);

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
        TP.elementRemoveAttribute(content, 'tibet:noawaken', true);
    } else if (TP.isFragment(finalContent)) {
        content = TP.documentConstructElement(
                    this.getNativeDocument(), 'span', TP.w3.Xmlns.XHTML);
        TP.nodeAppendChild(content, finalContent, false);
    } else {
        //  TODO: Raise an exception
        return this;
    }

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

    //  Capture the trigger ID in case that same trigger uses this overlay
    //  before another trigger uses it - we can use this for comparison purposes
    //  for content refresh, etc.

    triggerID = this.get('$currentTriggerID');
    this.getType().set('$lastTriggerID', triggerID, false);

    //  That will be the real element generated from the content that got placed
    //  into our 'content' div.
    tpContent = this.setContent(content);
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
        } else if (TP.isCallable(contentInfo.at('afterLoadHandler'))) {
            contentInfo.at('afterLoadHandler')(tpContent);
        }
    };

    handler.observe(tpContent, 'TP.sig.AttachComplete');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.SharedOverlay.Inst.defineMethod('positionUsing',
function(anOverlayPoint, anAvoidPoint) {

    /**
     * @method positionUsing
     * @summary Positions the overlay using the supplied point.
     * @param {TP.gui.Point} anOverlayPoint The point to use to position the
     *     overlay. NOTE: This point should be in *global* coordinates.
     * @param {TP.gui.Point} [anAvoidPoint] A point to 'avoid' when computing
     *     the positioning point. The system will shift the overlay around,
     *     trying to avoid this point.
     * @returns {TP.xctrls.SharedOverlay} The receiver.
     */

    var overlayPoint;

    overlayPoint = this.getPositioningPoint(anOverlayPoint, anAvoidPoint);

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

            this.set('$hideOnSignalName', null, false);
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

            var overlayCorner,

                triggerRect,
                triggerPoint,
                mousePoint,
                triggerTPElem,

                lastMoveEvent,
                lastMoveSignal;

            //  First, see if the open signal provided a overlay point.
            triggerPoint = contentInfo.at('triggerPoint');

            lastMoveEvent = TP.core.Mouse.$get('lastMove');
            lastMoveSignal = TP.sig.DOMMouseMove.construct(lastMoveEvent);
            mousePoint = lastMoveSignal.getGlobalPoint();

            //  If no overlay point was given, compute one from the triggering
            //  element.
            if (TP.notValid(triggerPoint)) {

                triggerTPElem = this.get('$triggerTPElement');

                if (TP.notValid(triggerTPElem)) {
                    //  TODO: Raise an exception
                    return this;
                }

                //  Grab the global rect from the supplied element.
                triggerRect = triggerTPElem.getGlobalRect();

                //  Compute the corner if its not supplied in the trigger
                //  signal.
                overlayCorner = contentInfo.at('corner');
                if (TP.isEmpty(overlayCorner)) {
                    overlayCorner = this.getOverlayCorner();
                }

                //  The point that the overlay should appear at is the 'edge
                //  point' for that compass edge of the trigger rectangle.
                triggerPoint = triggerRect.getEdgePoint(overlayCorner);
            } else if (triggerPoint === TP.MOUSE) {
                triggerPoint = mousePoint;
            }

            //  Show the overlay and set up signal handlers.
            this.setAttribute('hidden', false);

            //  If the signal doesn't have a flag to not position the overlay,
            //  then position the overlay relative to the overlay point and the
            //  corner.
            if (TP.notTrue(contentInfo.at('noPosition'))) {
                this.positionUsing(triggerPoint, mousePoint);
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
    if (this.hasAttribute('tibet:noawaken')) {
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
