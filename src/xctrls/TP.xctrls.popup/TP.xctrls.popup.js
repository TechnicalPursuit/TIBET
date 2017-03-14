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
//  Type Attributes
//  ------------------------------------------------------------------------

TP.xctrls.popup.Type.defineAttribute('lastContentID');

//  Note how this property is TYPE_LOCAL, by design.
TP.xctrls.popup.defineAttribute('themeURI', TP.NO_RESULT);

TP.xctrls.popup.Type.defineAttribute('opaqueCapturingSignalNames', null);

//  xctrls:popup controls are initially hidden, so we ensure that here.
TP.xctrls.popup.set('requiredAttrs', TP.hc('pclass:hidden', true));

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

        triggerID,
        triggerTPElem,

        hideOn;

    //  Grab the trigger signal from the OpenPopup signal. This will be the GUI
    //  signal that triggered the OpenPopup.
    triggerSignal = aSignal.at('trigger');
    tpDoc = triggerSignal.getDocument();

    //  Grab the popup with the popupID. This will default to 'systemPopup'.
    popupID = aSignal.at('popupID');
    if (TP.notEmpty(popupID)) {
        popupID = popupID.unquoted();
    }

    popupTPElem = this.getPopupWithID(tpDoc, popupID);

    //  If there's a 'triggerID' in the signal data, then we use that as the
    //  trigger.
    triggerID = aSignal.at('triggerID');
    if (TP.notEmpty(triggerID)) {
        triggerTPElem = TP.byId(triggerID, tpDoc);
    } else if (TP.isValid(triggerSignal.at('target'))) {
        //  if there's a target on the trigger signal, use that
        triggerTPElem = TP.wrap(triggerSignal.at('target'));
    } else {
        //  let it default to the trigger signal's origin
        triggerTPElem = TP.bySystemId(triggerSignal.getOrigin());
    }

    //  If there's a signal name for when to hide the popup, set up a handler
    //  for it.
    hideOn = aSignal.at('hideOn');
    if (TP.notEmpty(hideOn)) {
        hideOn = hideOn.unquoted();

        //  Note here how we define the handler as a local method on the
        //  specific instance.
        popupTPElem.defineHandler(
            hideOn,
            function(sig) {

                this.callNextMethod();

                this.setAttribute('hidden', true);
            }, {
                patchCallee: true
            });

        //  Save the signal name so that we can uninstall the local method after
        //  we've hidden.
        popupTPElem.set('$hideOnSignalName', hideOn);
    }

    //  Set the content of the popup and activate it.
    popupTPElem.setContentAndActivate(triggerTPElem, aSignal);

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.popup.Inst.defineAttribute('$$hideOnSignalName');

TP.xctrls.popup.Inst.defineAttribute('$$lastOpenSignal');
TP.xctrls.popup.Inst.defineAttribute('$$triggerTPElement');

TP.xctrls.popup.Inst.defineAttribute(
    'popupContent', {
        value: TP.cpc('> .content', TP.hc('shouldCollapse', true))
    });

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

    triggerTPElem = this.get('$$triggerTPElement');

    //  If the user clicked outside of the popup - deactivate it.
    if (!this.contains(targetElem) &&
        TP.unwrap(triggerTPElem) !== targetElem &&
        !triggerTPElem.contains(targetElem)) {

        this.setAttribute('hidden', true);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.popup.Inst.defineMethod('positionRelativeTo',
function(aTPElement, aCorner) {

    /**
     * @method positionRelativeTo
     * @summary Positions the popup relative to the supplied
     *     TP.core.UIElementNode.
     * @param {TP.core.UIElement} aTPElement The element to position the popup
     *     relative to.
     * @param {Number} aCorner A Number matching the compass corner constant to
     *     position the popup relative to:
     *
     *     TP.NORTH
     *     TP.NORTHEAST
     *     TP.EAST
     *     TP.SOUTHEAST
     *     TP.SOUTH
     *     TP.SOUTHWEST
     *     TP.WEST
     *     TP.NORTHWEST
     *
     * @returns {TP.xctrls.popup} The receiver.
     */

    var triggerRect,

        popupPoint,
        popupRect,

        bodyRect;

    //  Grab the global rect from the supplied element.
    triggerRect = aTPElement.getGlobalRect();

    //  The point that the popup should appear at is the 'edge point' for that
    //  compass edge of the trigger rectangle
    popupPoint = triggerRect.getEdgePoint(aCorner);

    //  Compute a popup rectangle, supplying it the popup point and the popup's
    //  width and height. This is important to do the calculation below where we
    //  try to 'fit' the rectangle within the body (so that it doesn't clip
    //  against a window boundary or something).
    popupRect = TP.rtc(
                    popupPoint.getX(),
                    popupPoint.getY(),
                    this.getWidth(),
                    this.getHeight());

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

    var hideOn,

        handlerName;

    if (beHidden) {
        //  Blur any focused element that is enclosed within us.
        this.blurFocusedDescendantElement();

        this.ignore(TP.core.Mouse, 'TP.sig.DOMClick');
        this.ignore(TP.ANY, 'TP.sig.ClosePopup');

        this.ignoreKeybindingsDirectly();

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

        this.observe(TP.core.Mouse, 'TP.sig.DOMClick');
        this.observe(TP.ANY, 'TP.sig.ClosePopup');

        this.observeKeybindingsDirectly();

        //  Focus any autofocused element or the first focusable element under
        //  us. Note that we have to fork() this for GUI refresh reasons - sigh.
        (function() {
            this.focusAutofocusedOrFirstFocusableDescendant();
        }.bind(this).fork(50));
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
function(triggerTPElem, openSignal, popupContent) {

    /**
     * @method setContentAndActivate
     * @summary Sets the content of the receiver's native DOM counterpart to
     *     the content supplied and activates the receiver. If the content is
     *     not supplied, then the supplied trigger signal will be queried for
     *     contentID (the ID of an inlined content element) or contentURI (a URI
     *     pointing to some content).
     * @param {TP.core.UIElementNode} triggerTPElem The element that the user
     *     interacted with to cause the triggering of this popup.
     * @param {TP.sig.OpenPopup} openSignal The signal that was thrown to cause
     *     this popup to show.
     * @param {String|Element|DocumentFragment} [popupContent] The optional
     *     content to place inside of the popup element.
     * @returns {TP.core.Node} The result of setting the content of the
     *     receiver.
     */

    var contentURI,
        contentID,

        contentElem,

        content,

        originalContentLocalID,
        lastContentLocalID,

        firstContentChildTPElem,

        didRefresh,

        newTPElem,
        newID,

        popupCorner;

    //  Capture the trigger element and the last open signal here.
    this.set('$$triggerTPElement', triggerTPElem);
    this.set('$$lastOpenSignal', openSignal);

    //  If we're not ready to render (i.e. our stylesheet hasn't loaded yet),
    //  then just return. When our stylesheet loads, it will use the trigger and
    //  last open signal cached above to call this method again.
    if (!this.isReadyToRender()) {
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

        //  If we could create a real URI from the supplied URI, then fetch the
        //  content and recursively call this method with that content.
        if (TP.notEmpty(contentURI) && TP.isURI(contentURI)) {
            contentURI.getResource().then(
                function(result) {

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

                    //  Note the recursive call to this method, but this time
                    //  with String content.
                    this.setContentAndActivate(
                            triggerTPElem, openSignal, elem);

                }.bind(this));

            //  Return here - we have the recursive call above.
            return this;
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

        if (TP.nodeGetChildElements(contentElem).getSize() > 1) {
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
        this.setContentAndActivate(triggerTPElem, openSignal, content);

        //  Return here - we have the recursive call above.
        return this;
    }

    if (TP.notValid(popupContent)) {
        //  TODO: Raise an exception
        return this;
    }

    if (TP.isString(popupContent)) {
        content = TP.elem(popupContent.unquoted());
    } else if (TP.isElement(popupContent)) {
        content = TP.nodeCloneNode(popupContent);
        TP.elementRemoveAttribute(content, 'tibet:noawaken', true);
    } else if (TP.isFragment(popupContent)) {
        content = TP.documentConstructElement(
                    this.getNativeDocument(), 'span', TP.w3.Xmlns.XHTML);
        TP.nodeAppendChild(content, popupContent, false);
    } else {
        //  TODO: Raise an exception
        return this;
    }

    //  Grab the local ID of the content. We use this to determine if the popup
    //  has gotten new content since the last time it was used.
    originalContentLocalID = TP.lid(content, true);

    lastContentLocalID = this.get('lastContentID');

    didRefresh = false;

    //  If there is a real last content local ID and it equals the local ID of
    //  the content we're trying to set, then we don't need to set the content
    //  at all - just refresh it.
    if (TP.notEmpty(lastContentLocalID) &&
        originalContentLocalID === lastContentLocalID) {

        //  We can only refresh it if it has real child content.
        firstContentChildTPElem =
            this.get('popupContent').getFirstChildElement();

        if (TP.isValid(firstContentChildTPElem)) {
            firstContentChildTPElem.refresh(true);
            didRefresh = true;
        }
    }

    //  If we didn't refresh, then
    if (!didRefresh) {

        //  Note here how we grab the return value. That will be the real
        //  element generated from the content that got placed into our
        //  'content' div.
        newTPElem = this.setContent(content);

        //  Replace the ID on the content with a generated one.
        newID = TP.genID('popup').replace(TP.regex.INVALID_ID_CHARS, '_');
        newTPElem.setAttribute('id', newID);

        //  Cache that ID so that we can compare it in case the user returns to
        //  this popup right away. If so, we'll use the machinery above to just
        //  refresh our content.
        this.set('lastContentID', originalContentLocalID);
    }

    //  Compute the corner if its not supplied in the trigger signal.
    popupCorner = openSignal.at('corner');
    if (TP.isEmpty(popupCorner)) {
        popupCorner = TP.SOUTHEAST;
    }

    //  Position the popup relative to the trigger element and the corner.
    this.positionRelativeTo(triggerTPElem, popupCorner);

    //  Show the popup and set up signal handlers
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
    this.setContentAndActivate(
        this.get('$$triggerTPElement'), this.get('$$lastOpenSignal'));

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
