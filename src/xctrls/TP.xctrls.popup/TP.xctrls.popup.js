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
 * @type {TP.xctrls.popup}
 * @summary Manages popup XControls.
 */

//  ------------------------------------------------------------------------

TP.xctrls.TemplatedTag.defineSubtype('xctrls:popup');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.xctrls.popup.Type.defineConstant('POPUP_OFFSET', 8);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.xctrls.popup.Type.defineAttribute('opaqueCapturingSignalNames', null);

//  xctrls:popup controls are initially hidden, so we ensure that here.
TP.xctrls.popup.set('requiredAttrs', TP.hc('pclass:hidden', true));

//  Note how this property is TYPE_LOCAL, by design.
TP.xctrls.popup.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.popup.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     * @returns {TP.xctrls.popup} The receiver.
     */

    //  Set up an observation for TP.sig.OpenPopup
    this.observe(TP.ANY, TP.sig.OpenPopup);

    return this;
});

//  ----------------------------------------------------------------------------

TP.xctrls.popup.Type.defineMethod('getPopupWithID',
function(aTPDocument, aPopupID) {

    /**
     * @method getPopupWithID
     * @summary Returns (and, if necessary, creates) a 'shared system popup'
     *     for use by the system on the supplied TP.core.Document.
     * @param {TP.core.Document} aTPDocument The document to create the popup
     *     in, if it can't be found. Note that, in this case, the popup will
     *     be created as the last child of the document's 'body' element.
     * @param {String} [aPopupID=systemPopup] The ID to use to query for the
     *     system popup.
     * @returns {TP.xctrls.popup} The system popup on the supplied
     *     TP.core.Document.
     */

    var tpDocBody,
        popupID,
        popupElem,
        popupTPElem;

    if (TP.notValid(aTPDocument)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    popupID = TP.ifInvalid(aPopupID, 'systemPopup');

    popupTPElem = aTPDocument.get('//*[@id="' + popupID + '"]');

    //  If the 'get' expression above didn't find one, it hands back an empty
    //  Array. Otherwise it will hand back the TP.core.ElementNode that
    //  represents the popup.
    if (TP.isEmpty(popupTPElem)) {

        tpDocBody = aTPDocument.getBody();

        if (TP.isValid(tpDocBody)) {

            popupElem = TP.elem('<xctrls:popup id="' + popupID + '"/>');

            popupTPElem = tpDocBody.insertContent(
                                    popupElem,
                                    TP.BEFORE_END,
                                    TP.hc('doc', aTPDocument.getNativeNode()));
        }
    }

    return popupTPElem;
});

//  ------------------------------------------------------------------------

TP.xctrls.popup.Type.defineHandler('OpenPopup',
function(aSignal) {

    /**
     * @method handleOpenPopup
     * @param {TP.sig.OpenPopup} aSignal The TIBET signal which triggered
     *     this method.
     */

    var triggerSignal,
        tpDoc,

        popupID,

        popupTPElem,

        popupCSSClass,

        triggerID,
        triggerTPElem,
        origin,

        closeOn;

    //  Grab the trigger signal from the OpenPopup signal. This will be the GUI
    //  signal that triggered the OpenPopup.
    triggerSignal = aSignal.at('trigger');

    tpDoc = aSignal.at('triggerTPDocument');
    if (TP.notValid(tpDoc)) {
        tpDoc = triggerSignal.getDocument();
    }

    if (TP.notValid(tpDoc)) {
        //  TODO: Raise an exception
        return this;
    }

    //  Grab the popup with the popupID. This will default to 'systemPopup'.
    popupID = aSignal.at('popupID');
    if (TP.notEmpty(popupID)) {
        popupID = popupID.unquoted();
    }

    popupTPElem = this.getPopupWithID(tpDoc, popupID);

    //  See if the OpenPopup signal contains a class that we should put on the
    //  popup element itself.
    popupCSSClass = aSignal.at('popupCSSClass');
    if (TP.notEmpty(popupCSSClass)) {
        popupTPElem.addClass(popupCSSClass);
    }

    //  If there's a 'triggerID' in the signal data, then we use that as the
    //  trigger.
    triggerID = aSignal.at('triggerID');
    if (TP.notEmpty(triggerID)) {
        triggerTPElem = TP.byId(triggerID, tpDoc);
        popupTPElem.set('$currentTriggerID', triggerID);
    } else if (TP.isValid(triggerSignal.at('target'))) {
        //  if there's a target on the trigger signal, use that
        triggerTPElem = TP.wrap(triggerSignal.at('target'));
        popupTPElem.set('$currentTriggerID', triggerTPElem.getID());
    } else {
        //  let it default to the trigger signal's origin
        origin = triggerSignal.getOrigin();
        if (TP.isString(origin)) {
            triggerTPElem = TP.bySystemId(origin);
        } else {
            triggerTPElem = TP.wrap(origin);
        }
        popupTPElem.set('$currentTriggerID', triggerTPElem.getID());
    }

    //  NB: At this point, there might not be a triggerTPElem. That's ok, but in
    //  that case, we need to make sure that a trigger point has been supplied.
    if (TP.notValid(triggerTPElem) && TP.isEmpty(aSignal.at('triggerPoint'))) {
        //  TODO: Raise an exception
        return this;
    } else {
        popupTPElem.set('$triggerTPElement', triggerTPElem);
    }

    //  If there's a signal name for when to hide the popup, set up a handler
    //  for it.
    closeOn = aSignal.at('closeOn');
    if (TP.notEmpty(closeOn)) {
        closeOn = closeOn.unquoted();

        //  Note here how we define the handler as a local method on the
        //  specific instance.
        popupTPElem.defineHandler(
            closeOn,
            function(sig) {

                this.callNextMethod();

                this.setAttribute('hidden', true);
            }, {
                patchCallee: true
            });

        //  Save the signal name so that we can uninstall the local method after
        //  we've hidden.
        popupTPElem.set('$closeOnSignalName', closeOn);
    }

    //  Set the content of the popup and activate it.
    popupTPElem.setContentAndActivate(aSignal);

    return this;
}, {
    patchCallee: false
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The ID of the last trigger that triggered the popup
TP.xctrls.popup.Type.defineAttribute('$lastTriggerID');

//  The ID of the current trigger that is trying to trigger the popup
TP.xctrls.popup.Inst.defineAttribute('$currentTriggerID');

//  The last TP.core.Element that triggered the popup
TP.xctrls.popup.Inst.defineAttribute('$triggerTPElement');

TP.xctrls.popup.Inst.defineAttribute('$$closeOnSignalName');

TP.xctrls.popup.Inst.defineAttribute('$$lastOpenSignal');

TP.xctrls.popup.Inst.defineAttribute('popupContent',
    TP.cpc('> xctrls|content', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.popup.Inst.defineHandler('ClosePopup',
function(aSignal) {

    /**
     * @method handleClosePopup
     * @param {TP.sig.ClosePopup} aSignal The signal that caused this handler
     *     to trip.
     */

    this.setAttribute('hidden', true);

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.popup.Inst.defineHandler('DOMClick',
function(aSignal) {

    /**
     * @method handleDOMClick
     * @param {TP.sig.DOMClick} aSignal The TIBET signal which triggered
     *     this method.
     */

    var targetElem,
        triggerTPElem;

    targetElem = aSignal.getTarget();

    triggerTPElem = this.get('$triggerTPElement');

    if (TP.notValid(triggerTPElem)) {
        if (!this.contains(targetElem)) {
            this.setAttribute('hidden', true);
        }
    } else {
        //  If the user clicked outside of the popup - deactivate it.
        if (!this.contains(targetElem) &&
            TP.unwrap(triggerTPElem) !== targetElem &&
            !triggerTPElem.contains(targetElem)) {

            this.setAttribute('hidden', true);
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.popup.Inst.defineMethod('positionUsing',
function(aPopupPoint) {

    /**
     * @method positionUsing
     * @summary Positions the popup using the supplied point.
     * @param {TP.core.Point} aPopupPoint The point to use to position the
     *     popup. NOTE: This point should be in *global* coordinates.
     * @returns {TP.xctrls.popup} The receiver.
     */

    var offset,

        popupPoint,
        popupRect,

        bodyRect;

    offset = this.getType().POPUP_OFFSET;

    //  Compute a popup rectangle, supplying it the popup point and the popup's
    //  width and height. This is important to do the calculation below where we
    //  try to 'fit' the rectangle within the body (so that it doesn't clip
    //  against a window boundary or something).

    //  Note here that we have to double the margin to account for the original
    //  margin as defined in the initial CSS.
    popupRect = TP.rtc(
                    aPopupPoint.getX().max(offset),
                    aPopupPoint.getY().max(offset),
                    this.getWidth() + offset,
                    this.getHeight() + offset);

    //  Grab the body's rectangle and constrain the popup rectangle against it.
    bodyRect = this.getDocument().getBody().getGlobalRect();

    bodyRect.constrainRect(popupRect);

    //  Now, get the 'northwest' coordinate of the popup rectangle. This will
    //  give us our true 'popup point'.
    popupPoint = popupRect.getEdgePoint(TP.NORTHWEST);

    //  Set our global position to be that point
    this.setGlobalPosition(popupPoint);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.popup.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     * @summary The setter for the receiver's hidden state.
     * @param {Boolean} beHidden Whether or not the receiver is in a hidden
     *     state.
     * @returns {Boolean} Whether the receiver's state is hidden.
     */

    var closeOn,
        thisref,
        handlerName;

    if (beHidden) {

        //  Blur any focused element that is enclosed within us.
        this.blurFocusedDescendantElement();

        this.ignore(TP.core.Mouse, 'TP.sig.DOMClick');
        this.ignore(TP.ANY, 'TP.sig.ClosePopup');

        this.ignoreKeybindingsDirectly();

        //  If there was a 'hide on' signal name that was saved, then uninstall
        //  the handler and set the saved signal name to null.
        closeOn = this.get('$closeOnSignalName');
        if (TP.notEmpty(closeOn)) {
            handlerName = TP.composeHandlerName(closeOn);
            if (TP.owns(this, handlerName)) {
                delete this[handlerName];
            }

            this.set('$closeOnSignalName', null);
        }

    } else {

        this.observe(TP.core.Mouse, 'TP.sig.DOMClick');
        this.observe(TP.ANY, 'TP.sig.ClosePopup');

        this.observeKeybindingsDirectly();

        //  Focus any autofocused element or the first focusable element under
        //  us. Note that we have to fork this for GUI refresh reasons - sigh.
        thisref = this;
        setTimeout(function() {
            thisref.focusAutofocusedOrFirstFocusableDescendant();
        }, 50);
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.popup.Inst.defineMethod('setContent',
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

    return this.get('popupContent').setContent(aContentObject, aRequest);
});

//  ------------------------------------------------------------------------

TP.xctrls.popup.Inst.defineMethod('setContentAndActivate',
function(openSignal, popupContent) {

    /**
     * @method setContentAndActivate
     * @summary Sets the content of the receiver's native DOM counterpart to
     *     the content supplied and activates the receiver. If the content is
     *     not supplied, then the supplied trigger signal will be queried for
     *     contentID (the ID of an inlined content element) or contentURI (a URI
     *     pointing to some content).
     * @param {TP.sig.OpenPopup} openSignal The signal that was thrown to cause
     *     this popup to show.
     * @param {String|Element|DocumentFragment} [popupContent] The optional
     *     content to place inside of the popup element.
     * @returns {TP.core.Node} The result of setting the content of the
     *     receiver.
     */

    var lastTriggerID,
        currentTriggerID,

        extractElementFromResult,

        contentURI,
        contentID,

        contentElem,

        content,
        finalContent,

        triggerID,

        firstContentChildTPElem,

        popupCorner,

        triggerRect,
        popupPoint,
        triggerTPElem,

        tpContent,
        handler;

    lastTriggerID = this.getType().get('$lastTriggerID');
    currentTriggerID = this.get('$currentTriggerID');

    triggerTPElem = this.get('$triggerTPElement');

    //  If there is a real last content local ID and it equals the local ID of
    //  the content we're trying to set, then we don't need to set the content
    //  at all - just refresh it, position ourself (again, in case the trigger
    //  moved since the last time we showed it) and show ourself..
    if (currentTriggerID === lastTriggerID) {

        //  We can only refresh it if it has real child content.
        firstContentChildTPElem =
            this.get('popupContent').getFirstChildElement();

        if (TP.isValid(firstContentChildTPElem)) {

            //  Note here how we don't force the rendering behavior - if the
            //  data has changed, the content will re-render.
            firstContentChildTPElem.refresh();

            //  First, see if the open signal provided a popup point.
            popupPoint = openSignal.at('triggerPoint');

            //  If no popup point was given, compute one from the triggering
            //  element.
            if (TP.notValid(popupPoint)) {

                if (TP.notValid(triggerTPElem)) {
                    //  TODO: Raise an exception
                    return this;
                }

                //  Grab the global rect from the supplied element.
                triggerRect = triggerTPElem.getGlobalRect();

                //  Compute the corner if its not supplied in the trigger
                //  signal.
                popupCorner = openSignal.at('corner');
                if (TP.isEmpty(popupCorner)) {
                    popupCorner = TP.SOUTHEAST;
                }

                //  The point that the popup should appear at is the 'edge
                //  point' for that compass edge of the trigger rectangle.
                popupPoint = triggerRect.getEdgePoint(popupCorner);
            }

            //  Position the popup relative to the popup point and the corner.
            this.positionUsing(popupPoint);

            //  Show the popup and set up signal handlers.
            this.setAttribute('hidden', false);

            return this;
        }
    }

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

    if (TP.isValid(popupContent)) {
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

                        //  Note the recursive call to this method, but this time
                        //  with content.
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

        //  Try to grab the element where we'll find the content for the popup
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
        if (TP.notValid(popupContent)) {
            //  TODO: Raise an exception
            return this;
        }

        finalContent = popupContent;
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

    //  Grab the triggerID - it might have been supplied in the signal or it
    //  might need to be computed from the trigger element.
    triggerID = openSignal.at('triggerID');
    if (TP.isEmpty(triggerID)) {
        if (TP.isValid(triggerTPElem)) {
            triggerID = triggerTPElem.getID();
        } else {
            //  TODO: Raise an exception
            return this;
        }
    }

    //  Capture the trigger ID in case that same trigger uses this popup before
    //  another trigger uses it - then we just refresh. See the logic above.
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

    //  First, see if the open signal provided a popup point.
    popupPoint = openSignal.at('triggerPoint');

    //  If no popup point was given, compute one from the triggering element.
    if (TP.notValid(popupPoint)) {

        //  Compute the corner if its not supplied in the trigger signal.
        popupCorner = openSignal.at('corner');
        if (TP.isEmpty(popupCorner)) {
            popupCorner = TP.SOUTHEAST;
        }

        if (TP.notValid(triggerTPElem)) {
            //  TODO: Raise an exception
            return this;
        }

        //  Grab the global rect from the supplied element.
        triggerRect = triggerTPElem.getGlobalRect();

        //  The point that the popup should appear at is the 'edge point' for
        //  that compass edge of the trigger rectangle.
        popupPoint = triggerRect.getEdgePoint(popupCorner);
    }

    //  Position the popup relative to the popup point and the corner.
    this.positionUsing(popupPoint);

    //  Show the popup content
    tpContent.setAttribute('hidden', false);

    //  Show the popup and set up signal handlers.
    this.setAttribute('hidden', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.popup.Inst.defineMethod('stylesheetReady',
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
     * @returns {TP.xctrls.list} The receiver.
     */

    //  If we're not awakening this tag, then exit - we want none of the
    //  machinery here to execute.
    if (this.hasAttribute('tibet:noawaken')) {
        return this;
    }

    //  Set the content of the popup and activate it.
    this.setContentAndActivate(this.get('$$lastOpenSignal'));

    this.set('$$lastOpenSignal', null);

    return this;
});

//  ============================================================================
//  Popup-specific TP.sig.Signal subtypes
//  ============================================================================

//  Popup signals
TP.sig.Signal.defineSubtype('OpenPopup');
TP.sig.Signal.defineSubtype('ClosePopup');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
