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
 * @type {TP.xctrls.notifier}
 * @summary Manages notifier XControls.
 */

//  ------------------------------------------------------------------------

TP.xctrls.TemplatedTag.defineSubtype('xctrls:notifier');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.xctrls.notifier.Type.defineConstant('NOTIFIER_OFFSET', 8);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This type captures no signals - it lets all signals pass through.
TP.xctrls.notifier.Type.defineAttribute('opaqueCapturingSignalNames', null);

//  xctrls:notifier controls are initially hidden, so we ensure that here.
TP.xctrls.notifier.set('requiredAttrs', TP.hc('pclass:hidden', true));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.notifier.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     * @returns {TP.xctrls.notifier} The receiver.
     */

    //  Set up an observation for TP.sig.OpenNotifier
    this.observe(TP.ANY, TP.sig.OpenNotifier);

    return this;
});

//  ----------------------------------------------------------------------------

TP.xctrls.notifier.Type.defineMethod('getNotifierWithID',
function(aTPDocument, aNotifierID) {

    /**
     * @method getNotifierWithID
     * @summary Returns (and, if necessary, creates) a 'shared system notifier'
     *     for use by the system on the supplied TP.core.Document.
     * @param {TP.core.Document} aTPDocument The document to create the notifier
     *     in, if it can't be found. Note that, in this case, the notifier will
     *     be created as the last child of the document's 'body' element.
     * @param {String} [aNotifierID=systemNotifier] The ID to use to query for
     *     the system notifier.
     * @returns {TP.xctrls.notifier} The system notifier on the supplied
     *     TP.core.Document.
     */

    var tpDocBody,
        notifierID,
        notifierElem,
        notifierTPElem;

    if (TP.notValid(aTPDocument)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    notifierID = TP.ifInvalid(aNotifierID, 'systemNotifier');

    notifierTPElem = aTPDocument.get('//*[@id="' + notifierID + '"]');

    //  If the 'get' expression above didn't find one, it hands back an empty
    //  Array. Otherwise it will hand back the TP.core.ElementNode that
    //  represents the notifier.
    if (TP.isEmpty(notifierTPElem)) {

        tpDocBody = aTPDocument.getBody();

        if (TP.isValid(tpDocBody)) {

            notifierElem = TP.elem(
                            '<xctrls:notifier id="' + notifierID + '"/>');

            notifierTPElem = tpDocBody.insertContent(
                                    notifierElem,
                                    TP.BEFORE_END,
                                    TP.hc('doc', aTPDocument.getNativeNode()));
        }
    }

    return notifierTPElem;
});

//  ------------------------------------------------------------------------

TP.xctrls.notifier.Type.defineHandler('OpenNotifier',
function(aSignal) {

    /**
     * @method handleOpenNotifier
     * @param {TP.sig.OpenNotifier} aSignal The TIBET signal which triggered
     *     this method.
     */

    var triggerSignal,
        tpDoc,

        notifierID,

        notifierTPElem,

        notifierCSSClass,

        triggerID,
        triggerTPElem,
        origin,

        closeOn;

    //  Grab the trigger signal from the OpenNotifier signal. This will be the
    //  GUI signal that triggered the OpenNotifier.
    triggerSignal = aSignal.at('trigger');

    tpDoc = aSignal.at('triggerTPDocument');
    if (TP.notValid(tpDoc) && TP.isValid(triggerSignal)) {
        tpDoc = triggerSignal.getDocument();
    } else {
        tpDoc = TP.sys.getUICanvas().getDocument();
    }

    if (TP.notValid(tpDoc)) {
        //  TODO: Raise an exception
        return this;
    }

    //  Grab the notifier with the notifierID. This will default to
    //  'systemNotifier'.
    notifierID = aSignal.at('notifierID');
    if (TP.notEmpty(notifierID)) {
        notifierID = notifierID.unquoted();
    }

    notifierTPElem = this.getNotifierWithID(tpDoc, notifierID);

    //  See if the OpenNotifier signal contains a class that we should put on
    //  the notifier element itself.
    notifierCSSClass = aSignal.at('notifierCSSClass');
    if (TP.notEmpty(notifierCSSClass)) {
        notifierTPElem.addClass(notifierCSSClass);
    }

    /*
    //  If there's a 'triggerID' in the signal data, then we use that as the
    //  trigger.
    triggerID = aSignal.at('triggerID');
    if (TP.notEmpty(triggerID)) {
        triggerTPElem = TP.byId(triggerID, tpDoc);
    } else if (TP.isValid(triggerSignal) &&
                TP.isValid(triggerSignal.at('target'))) {
        //  if there's a target on the trigger signal, use that
        triggerTPElem = TP.wrap(triggerSignal.at('target'));
        triggerID = triggerTPElem.getID();
    } else if (TP.isValid(triggerSignal)) {
        //  let it default to the trigger signal's origin
        origin = triggerSignal.getOrigin();
        if (TP.isString(origin)) {
            triggerTPElem = TP.bySystemId(origin);
        } else {
            triggerTPElem = TP.wrap(origin);
        }
        triggerID = triggerTPElem.getID();
    } else {
        triggerTPElem = tpDoc.getBody();
        triggerID = triggerTPElem.getID();
    }
    */

    triggerTPElem = tpDoc.getBody();
    triggerID = triggerTPElem.getID();

    notifierTPElem.set('$currentTriggerID', triggerID);

    //  NB: At this point, there might not be a triggerTPElem. That's ok, but in
    //  that case, we need to make sure that a trigger point has been supplied.
    if (TP.notValid(triggerTPElem) && TP.isEmpty(aSignal.at('triggerPoint'))) {
        //  TODO: Raise an exception
        return this;
    } else {
        notifierTPElem.set('$triggerTPElement', triggerTPElem);
    }

    //  If there's a signal name for when to hide the notifier, set up a handler
    //  for it.
    closeOn = aSignal.at('closeOn');
    if (TP.notEmpty(closeOn)) {
        closeOn = closeOn.unquoted();

        //  Note here how we define the handler as a local method on the
        //  specific instance.
        notifierTPElem.defineHandler(
            closeOn,
            function(sig) {

                this.callNextMethod();

                this.setAttribute('hidden', true);
            }, {
                patchCallee: true
            });

        //  Save the signal name so that we can uninstall the local method after
        //  we've hidden.
        notifierTPElem.set('$closeOnSignalName', closeOn);
    }

    //  Set the content of the notifier and activate it.
    notifierTPElem.setContentAndActivate(aSignal);

    return this;
}, {
    patchCallee: false
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The ID of the last trigger that triggered the notifier
TP.xctrls.notifier.Type.defineAttribute('$lastTriggerID');

//  The ID of the current trigger that is trying to trigger the notifier
TP.xctrls.notifier.Inst.defineAttribute('$currentTriggerID');

//  The last TP.core.Element that triggered the notifier
TP.xctrls.notifier.Inst.defineAttribute('$triggerTPElement');

TP.xctrls.notifier.Inst.defineAttribute('$$closeOnSignalName');

TP.xctrls.notifier.Inst.defineAttribute('$$lastOpenSignal');

TP.xctrls.notifier.Inst.defineAttribute('notifierContent',
    TP.cpc('> xctrls|content', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.notifier.Inst.defineHandler('CloseNotifier',
function(aSignal) {

    /**
     * @method handleCloseNotifier
     * @param {TP.sig.CloseNotifier} aSignal The signal that caused this handler
     *     to trip.
     */

    this.setAttribute('active', false);
    this.setAttribute('hidden', true);

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.notifier.Inst.defineHandler('DOMClick',
function(aSignal) {

    /**
     * @method handleDOMClick
     * @param {TP.sig.DOMClick} aSignal The TIBET signal which triggered
     *     this method.
     */

    this.setAttribute('active', false);
    this.setAttribute('hidden', true);

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.notifier.Inst.defineHandler('DOMTransitionEnd',
function(aSignal) {

    /**
     * @method handleDOMTransitionEnd
     * @param {TP.sig.DOMTransitionEnd} aSignal The TIBET signal which triggered
     *     this method.
     */

    this.setAttribute('active', false);
    this.setAttribute('hidden', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.notifier.Inst.defineMethod('positionUsing',
function(aNotifierPoint) {

    /**
     * @method positionUsing
     * @summary Positions the notifier using the supplied point.
     * @param {TP.core.Point} aNotifierPoint The point to use to position the
     *     notifier. NOTE: This point should be in *global* coordinates.
     * @returns {TP.xctrls.notifier} The receiver.
     */

    var offset,

        notifierPoint,
        notifierRect,

        bodyTPElem,
        bodyRect,

        bodyScrollOffsets;

    offset = this.getType().NOTIFIER_OFFSET;

    //  Compute a notifier rectangle, supplying it the notifier point and the
    //  notifier's width and height. This is important to do the calculation
    //  below where we try to 'fit' the rectangle within the body (so that it
    //  doesn't clip against a window boundary or something).

    //  Note here that we have to double the margin to account for the original
    //  margin as defined in the initial CSS.
    notifierRect = TP.rtc(
                    aNotifierPoint.getX().max(offset),
                    aNotifierPoint.getY().max(offset),
                    this.getWidth() + offset,
                    this.getHeight() + offset);

    //  Grab the body's rectangle and constrain the notifier rectangle against
    //  it.

    bodyTPElem = this.getDocument().getBody();

    bodyRect = bodyTPElem.getGlobalRect();

    bodyRect.constrainRect(notifierRect);

    bodyScrollOffsets = bodyTPElem.getScrollOffsetPoint();
    notifierRect.addToX(bodyScrollOffsets.getX());
    notifierRect.addToY(bodyScrollOffsets.getY());

    //  Now, get the 'northwest' coordinate of the notifier rectangle. This will
    //  give us our true 'notifier point'.
    notifierPoint = notifierRect.getEdgePoint(TP.NORTHWEST);

    //  Set our global position to be that point
    this.setGlobalPosition(notifierPoint);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.notifier.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     * @summary The setter for the receiver's hidden state.
     * @param {Boolean} beHidden Whether or not the receiver is in a hidden
     *     state.
     * @returns {Boolean} Whether the receiver's state is hidden.
     */

    var closeOn,
        handlerName,

        elem,

        retVal;

    elem = this.getNativeNode();

    if (beHidden) {

        this.ignore(TP.core.Mouse, 'TP.sig.DOMClick');
        this.ignore(TP.ANY, 'TP.sig.CloseNotifier');

        this.ignore(elem, 'TP.sig.DOMTransitionEnd');

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

        retVal = this.callNextMethod();

    } else {

        retVal = this.callNextMethod();

        this.observe(TP.core.Mouse, 'TP.sig.DOMClick');
        this.observe(TP.ANY, 'TP.sig.CloseNotifier');

        this.observe(elem, 'TP.sig.DOMTransitionEnd');

        (function() {
            this.setAttribute('active', true);
        }.bind(this)).queueForNextRepaint(this.getNativeWindow());
    }

    return retVal;
});

//  ------------------------------------------------------------------------

TP.xctrls.notifier.Inst.defineMethod('setContent',
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

    return this.get('notifierContent').setContent(aContentObject, aRequest);
});

//  ------------------------------------------------------------------------

TP.xctrls.notifier.Inst.defineMethod('setContentAndActivate',
function(openSignal, notifierContent) {

    /**
     * @method setContentAndActivate
     * @summary Sets the content of the receiver's native DOM counterpart to
     *     the content supplied and activates the receiver. If the content is
     *     not supplied, then the supplied trigger signal will be queried for
     *     contentID (the ID of an inlined content element) or contentURI (a URI
     *     pointing to some content).
     * @param {TP.sig.OpenNotifier} openSignal The signal that was thrown to
     *     cause this notifier to show.
     * @param {String|Element|DocumentFragment} [notifierContent] The optional
     *     content to place inside of the notifier element.
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

        notifierCorner,

        triggerRect,
        notifierPoint,
        triggerTPElem,

        tpContent,
        handler;

    lastTriggerID = this.getType().get('$lastTriggerID');
    currentTriggerID = this.get('$currentTriggerID');

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

    if (TP.isValid(notifierContent)) {
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
        //  notifier
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
        if (TP.notValid(notifierContent)) {
            //  TODO: Raise an exception
            return this;
        }

        finalContent = notifierContent;
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

    //  Capture the trigger ID in case that same trigger uses this notifier
    //  before another trigger uses it - then we just refresh. See the logic
    //  above.
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

    //  First, see if the open signal provided a notifier point.
    notifierPoint = openSignal.at('triggerPoint');

    //  If no notifier point was given, compute one from the triggering element.
    if (TP.notValid(notifierPoint)) {

        //  Compute the corner if its not supplied in the trigger signal.
        notifierCorner = openSignal.at('corner');
        if (TP.isEmpty(notifierCorner)) {
            notifierCorner = TP.NORTHEAST;
        }

        if (TP.notValid(triggerTPElem)) {
            //  TODO: Raise an exception
            return this;
        }

        //  Grab the global rect from the supplied element.
        triggerRect = triggerTPElem.getGlobalRect();

        //  The point that the notifier should appear at is the 'edge point' for
        //  that compass edge of the trigger rectangle.
        notifierPoint = triggerRect.getEdgePoint(notifierCorner);
    }

    //  Show the notifier content
    tpContent.setAttribute('hidden', false);

    //  Show the notifier and set up signal handlers.
    this.setAttribute('hidden', false);

    //  Position the notifier relative to the notifier point and the corner.
    this.positionUsing(notifierPoint);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.notifier.Inst.defineMethod('stylesheetReady',
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
     * @returns {TP.xctrls.notifier} The receiver.
     */

    //  If we're not awakening this tag, then exit - we want none of the
    //  machinery here to execute.
    if (this.hasAttribute('tibet:noawaken')) {
        return this;
    }

    //  Set the content of the notifier and activate it.
    this.setContentAndActivate(this.get('$$lastOpenSignal'));

    this.set('$$lastOpenSignal', null);

    return this;
});

//  ============================================================================
//  notifier-specific TP.sig.Signal subtypes
//  ============================================================================

//  notifier signals
TP.sig.Signal.defineSubtype('OpenNotifier');
TP.sig.Signal.defineSubtype('CloseNotifier');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
