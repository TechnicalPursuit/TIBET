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

TP.xctrls.SharedOverlay.defineSubtype('xctrls:notifier');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.xctrls.notifier.Type.defineConstant('NOTIFIER_OFFSET', 8);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  The ID of the shared popup that is used in scenarios where notifiers are
//  being shared.
TP.xctrls.notifier.Type.defineAttribute('sharedOverlayID', 'systemNotifier');

//  Any 'after hide' handler that was used when showing the notifier.
TP.xctrls.notifier.Type.defineAttribute('$afterHide');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.notifier.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    //  Set up an observation for TP.sig.OpenNotifier
    this.observe(TP.ANY, TP.sig.OpenNotifier);

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.notifier.Type.defineMethod('getTriggerElement',
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
     * @param {TP.sig.OpenNotifier} aSignal The TIBET signal which triggered
     *     this method.
     * @param {TP.dom.Document} triggerTPDocument The TP.dom.Document that the
     *     triggering element is contained in.
     * @returns {TP.dom.ElementNode} The TP.dom.ElementNode that caused the
     *     overlay to trigger.
     */

    //  xctrls:notifier elements are always 'triggered' by the body
    return triggerTPDocument.getBody();
});

//  ------------------------------------------------------------------------

TP.xctrls.notifier.Type.defineHandler('OpenNotifier',
function(aSignal) {

    /**
     * @method handleOpenNotifier
     * @param {TP.sig.OpenNotifier} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.meta.xctrls.notifier} The receiver.
     */

    this.openOverlay(aSignal);

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.notifier.Inst.defineMethod('getDescendantsForSerialization',
function() {

    /**
     * @method getDescendantsForSerialization
     * @summary Returns an Array of descendants of the receiver to include in
     *     the receiver's serialization. Typically, these will be nodes that
     *     will be 'slotted' into the receiver by the author and not nodes that
     *     the template generated 'around' the slotted nodes.
     * @returns {TP.dom.Node[]} An Array of descendant nodes to serialize.
     */

    var selectedDescendants;

    selectedDescendants =
        this.get('./*[not(@tibet:assembly = \'xctrls:notifier\')]');

    selectedDescendants = TP.expand(selectedDescendants);

    return selectedDescendants;
});

//  ------------------------------------------------------------------------

TP.xctrls.notifier.Inst.defineMethod('getOverlayOffset',
function() {

    /**
     * @method getOverlayOffset
     * @summary Returns a numeric offset from the edge of the overlay's
     *     container that the overlay should use to offset it's position from
     *     the corner it will be positioned at.
     * @returns {Number} The offset.
     */

    return this.getType().NOTIFIER_OFFSET;
});

//  ------------------------------------------------------------------------

TP.xctrls.notifier.Inst.defineHandler('CloseNotifier',
function(aSignal) {

    /**
     * @method handleCloseNotifier
     * @param {TP.sig.CloseNotifier} aSignal The signal that caused this handler
     *     to trip.
     * @returns {TP.xctrls.notifier} The receiver.
     */

    this.setAttribute('active', false);
    this.setAttribute('hidden', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.notifier.Inst.defineHandler('DOMClick',
function(aSignal) {

    /**
     * @method handleDOMClick
     * @param {TP.sig.DOMClick} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.xctrls.notifier} The receiver.
     */

    this.setAttribute('active', false);
    this.setAttribute('hidden', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.notifier.Inst.defineHandler('DOMTransitionEnd',
function(aSignal) {

    /**
     * @method handleDOMTransitionEnd
     * @param {TP.sig.DOMTransitionEnd} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.xctrls.notifier} The receiver.
     */

    var afterHideFunc;

    this.setAttribute('active', false);
    this.setAttribute('hidden', true);

    afterHideFunc = this.getType().get('$afterHide');
    if (TP.isCallable(afterHideFunc)) {
        afterHideFunc(this);
    }

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

    var elem;

    elem = this.getNativeNode();

    if (beHidden) {

        this.ignore(TP.core.Mouse, 'TP.sig.DOMClick');
        this.ignore(TP.ANY, 'TP.sig.CloseNotifier');

        this.ignore(elem, 'TP.sig.DOMTransitionEnd');

    } else {

        this.observe(TP.core.Mouse, 'TP.sig.DOMClick');
        this.observe(TP.ANY, 'TP.sig.CloseNotifier');

        this.observe(elem, 'TP.sig.DOMTransitionEnd');

        //  NB: We do this at the next repaint so that the 'pclass:hidden' flag
        //  has a chance to take effect before flipping 'pclass:active' to true
        //  as well.
        (function() {
            this.setAttribute('active', true);
        }.bind(this)).queueBeforeNextRepaint(this.getNativeWindow());
    }

    return this.callNextMethod();
});

//  ============================================================================
//  notifier-specific TP.sig.Signal subtypes
//  ============================================================================

//  notifier signals
TP.sig.OpenOverlay.defineSubtype('OpenNotifier');
TP.sig.CloseOverlay.defineSubtype('CloseNotifier');

//  ------------------------------------------------------------------------

TP.definePrimitive('notify',
function(info) {

    /**
     * @method notify
     * @summary Displays a notifier to the user given the information in the
     *     supplied hash.
     * @param {TP.core.Hash} info The information used when displaying the
     *     notifier. Valid keys for this hash include:
     *          {String} [notifierID=systemNotifier] The id to use for the
     *          overall notifier in the system.
     *          {String} templateContent The actual markup content to put into
     *          the notifier.
     *          {TP.uri.URI} [templateURI] If the templateContent parameter is
     *          not supplied, this parameter will be checked for a URI that can
     *          be used to supply the markup content.
     *          {Object} [templateData] If either the templateContent or the
     *          templateURI point to content that has ACP expressions in it,
     *          this parameter will provide the dynamic data for that template.
     *          {Function} [beforeShow] A function to execute before showing the
     *          notifier.
     * @returns {Promise} A Promise to be used as necessary. Since this is an
     *     alert(), this Promise's resolver Function will be called with no
     *     return value.
     */

    var notifierID,
        template,

        templateData,

        contentResource,
        content,
        contentElem,

        notifierContentURI,

        tpDoc,

        beforeShowCallback;

    if (TP.notValid(info)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    if (TP.notValid(info.at('templateContent')) &&
        TP.notValid(info.at('templateURI'))) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  Default the notifier ID
    notifierID = info.atIfInvalid('notifierID', 'systemNotifier');
    notifierID = notifierID.unquoted();

    template = info.at('templateContent');
    if (TP.isString(template)) {
        template = template.unquoted();
        if (TP.isURIString(template)) {
            template = TP.uc(template);
        }
    } else if (TP.notValid(template)) {
        template = info.at('templateURI');

        if (!TP.isURI(template)) {
            return TP.raise(TP, 'InvalidTemplate');
        }
    }

    //  Grab any template data and transform the supplied template with
    //  it.
    templateData = info.at('templateData');
    contentResource = template.transform(templateData);

    //  Extract the result and build an XHTML span around it.

    if (!TP.isString(template) && TP.isURI(template)) {
        content = contentResource.get('result');
    } else {
        content = contentResource;
    }

    contentElem = TP.xhtmlnode('<span>' + content + '</span>');

    //  Since the signal below wants content in a URI, we create one to hold the
    //  content and set its resource to the content element that we created.
    notifierContentURI = TP.uc('urn:tibet:notifiercontent');
    notifierContentURI.setResource(contentElem);

    if (TP.sys.hasFeature('sherpa')) {
        tpDoc = TP.sys.getUIRoot().getDocument();
    } else {
        tpDoc = TP.sys.getUICanvas().getDocument();
    }

    //  If a callback Function that should be executed before we show
    //  the notifier was supplied, invoke it with the notifier
    //  TP.dom.ElementNode as the only parameter.
    beforeShowCallback = info.at('beforeShow');
    if (TP.isCallable(beforeShowCallback)) {
        beforeShowCallback(TP.byId(notifierID, tpDoc));
    }

    TP.xctrls.notifier.set('$afterHide',
        function(aNotifierTPElem) {
            notifierContentURI.setResource('');
        });

    this.signal(
        null,
        'OpenNotifier',
        TP.hc(
            'overlayID', notifierID,
            'contentURI', notifierContentURI.getLocation(),
            'noPosition', true,
            'triggerTPDocument', tpDoc));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
