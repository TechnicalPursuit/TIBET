//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 * @type {TP.lama.outliner}
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('lama.outliner');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineAttribute('$wasActive');

TP.lama.outliner.Inst.defineAttribute('$mouseHandler');

TP.lama.outliner.Inst.defineAttribute('$currentDNDTarget');

TP.lama.outliner.Inst.defineAttribute('$hudOutlinerDescendantsRule');

TP.lama.outliner.Inst.defineAttribute('$containingBlockElem');

TP.lama.outliner.Inst.defineAttribute('$alteredTargetStyle');
TP.lama.outliner.Inst.defineAttribute('$oldDisplayVal');
TP.lama.outliner.Inst.defineAttribute('$haloTargetDepth');

TP.lama.outliner.Inst.defineAttribute('isActive');

TP.lama.outliner.Inst.defineAttribute('xRotation');
TP.lama.outliner.Inst.defineAttribute('yRotation');
TP.lama.outliner.Inst.defineAttribute('spread');
TP.lama.outliner.Inst.defineAttribute('scale');

TP.lama.outliner.Inst.defineAttribute('insertionPosition');

TP.lama.outliner.Inst.defineAttribute('targetTPElement');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.lama.outliner} The receiver.
     */

    var consoleService,
        consoleGUI,

        keyboardSM,

        outlineresponder;

    this.callNextMethod();

    //  Important to set this before proceeding. Some of the initialization
    //  machinery wants to refer back to this object.
    this.setID('LamaOutliner');
    TP.sys.registerObject(this);

    this.set('isActive', false);

    //  Reset our visualization parameters all back to their starting values.
    this.resetVisualizationParameters();

    consoleService = TP.bySystemId('LamaConsoleService');
    consoleGUI = consoleService.get('$consoleGUI');

    this.observe(TP.byId('LamaHUD', consoleGUI.getNativeDocument()),
                    'PclassClosedChange');

    this.toggleObservations(true);

    keyboardSM = consoleService.get('keyboardStateMachine');

    keyboardSM.defineState(
        'normal',
        'outline',
        {
            trigger: TP.ac(TP.ANY, 'TP.sig.BeginOutlineMode')
        });

    keyboardSM.defineState(
        'outline',
        'normal',
        {
            trigger: TP.ac(TP.ANY, 'TP.sig.EndOutlineMode')
        });

    outlineresponder = TP.lama.OutlineKeyResponder.construct();
    outlineresponder.set('$consoleService', consoleService);
    outlineresponder.set('$consoleGUI', consoleGUI);

/*
    keyboardSM.defineHandler('OutlineInput', function(aSignal) {
        var triggerSignal;

        triggerSignal = aSignal.getPayload().at('trigger');


    if (aSignal.getSignalName() ===
            'TP.sig.DOM_Shift_Up__TP.sig.DOM_Shift_Up') {
        this[TP.composeHandlerName('DOMShiftUp__DOMShiftUp')](aSignal);
    } else {


        if (normalResponder.isSpecialSignal(triggerSignal)) {
            normalResponder.handle(triggerSignal);
        }

        aSignal.stopPropagation();

        return;
    });
*/

    outlineresponder.addStateMachine(keyboardSM);
    outlineresponder.addInputState('outline');

    //  Inject the stylesheet that we need the canvas document to have to
    //  display the outlines (if it's not already there).
    this.setupInjectedStyleSheet();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineMethod('activateMouseHandler',
function() {

    /**
     * @method activateMouseHandler
     * @summary Installs the mouse handler on the  target element's document for
     *     rotation and zooming purposes.
     * @returns {TP.lama.outliner} The receiver.
     */

    var targetElement,
        doc,
        handler,

        thisref,

        lastMouseMoveEvent,
        initialMousePosition,

        initialX,
        initialY,

        mouse,

        forward;

    targetElement = TP.unwrap(this.get('targetTPElement'));

    doc = TP.nodeGetDocument(targetElement);

    thisref = this;

    lastMouseMoveEvent = TP.core.Mouse.get('lastMove');

    //  Grab the initial X and Y for use within the handler.
    initialMousePosition = TP.eventGetPageXY(lastMouseMoveEvent);

    initialX = initialMousePosition.at(0);
    initialY = initialMousePosition.at(1);

    mouse = {
    };

    mouse.start = {
        x: initialX,
        y: initialY
    };

    forward = function(v1, v2) {
        return v1 >= v2 ? true : false;
    };

    //  Define the handler.
    handler = function(e) {

        var currentMousePosition,

            currentX,
            currentY,

            scaleFactor,

            computedX,
            computedY;

        currentMousePosition = TP.eventGetPageXY(e);
        currentX = currentMousePosition.at(0);
        currentY = currentMousePosition.at(1);

        if (!mouse.last) {
            mouse.last = mouse.start;
        } else {
            if (forward(mouse.start.x, mouse.last.x) !==
                forward(mouse.last.x, currentX)) {
                mouse.start.x = mouse.last.x;
            }
            if (forward(mouse.start.y, mouse.last.y) !==
                forward(mouse.last.y, currentY)) {
                mouse.start.y = mouse.last.y;
            }
        }

        scaleFactor = 2;

        computedX = thisref.get('xRotation') +
                    parseInt((mouse.start.y - currentY) / scaleFactor, 10);

        computedY = thisref.get('yRotation') -
                    parseInt((mouse.start.x - currentX) / scaleFactor, 10);

        thisref.set('xRotation', computedX);
        thisref.set('yRotation', computedY);

        //  Update both the target element and halo style.
        thisref.updateTargetElementStyle();

        mouse.last.x = currentX;
        mouse.last.y = currentY;
    };

    //  Using low-level DOM APIs, install the above defined mouse handler on the
    //  target element's document.
    doc.addEventListener('mousemove', handler, true);

    //  Capture the handler Function so that we uninstall it later.
    this.set('$mouseHandler', handler);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineMethod('deactivateMouseHandler',
function() {

    /**
     * @method deactivateMouseHandler
     * @summary Uninstalls any mouse handler installed on the target element's
     *     document for rotation and zooming purposes.
     * @returns {TP.lama.outliner} The receiver.
     */

    var targetElement,
        doc,
        handler;

    handler = this.get('$mouseHandler');

    //  If there is an installed mouse handler, then we grab the target element
    //  and, using low-level DOM APIs, remove it from that element's document.
    if (TP.isCallable(handler)) {

        targetElement = TP.unwrap(this.get('targetTPElement'));

        doc = TP.nodeGetDocument(targetElement);
        doc.removeEventListener('mousemove', handler, true);

        //  Set this to null to avoid GC issues.
        this.set('$mouseHandler', null);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineMethod('extrudeIn',
function() {

    /**
     * @method extrudeIn
     * @summary Decreases the amount of extrusion in our '3D' view.
     * @returns {TP.lama.outliner} The receiver.
     */

    this.set('spread', this.get('spread') - 5);

    //  Update both the target element and it's descendants style.
    this.updateOutlinedDescendantStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineMethod('extrudeOut',
function() {

    /**
     * @method extrudeOut
     * @summary Increases the amount of extrusion in our '3D' view.
     * @returns {TP.lama.outliner} The receiver.
     */

    this.set('spread', this.get('spread') + 5);

    //  Update both the target element and it's descendants style.
    this.updateOutlinedDescendantStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineMethod('getXRotation',
function() {

    /**
     * @method getXRotation
     * @summary Returns the X rotation, clamped by a built-in value (so that the
     *     user cannot rotate the target element out of view).
     * @returns {Number} The X rotation, clamped by a value.
     */

    var val;

    val = this.$get('xRotation');

    if (val < -70) {
        val = -70;
    } else if (val > 70) {
        val = 70;
    }

    return val;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineMethod('getYRotation',
function() {

    /**
     * @method getYRotation
     * @summary Returns the Y rotation, clamped by a built-in value (so that the
     *     user cannot rotate the target element out of view).
     * @returns {Number} The Y rotation, clamped by a value.
     */

    var val;

    val = this.$get('yRotation');

    if (val < -80) {
        val = -80;
    } else if (val > 80) {
        val = 80;
    }

    return val;
});

//  ----------------------------------------------------------------------------

TP.lama.outliner.Inst.defineHandler('PclassClosedChange',
function(aSignal) {

    /**
     * @method handlePclassClosedChangeFromLamaHUD
     * @summary Handles notifications of HUD closed change signals.
     * @param {TP.sig.PclassClosedChange} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.outliner} The receiver.
     */

    var hudIsClosed,

        isActive;

    //  Grab the HUD and see if it's currently open or closed.
    hudIsClosed = TP.bc(aSignal.getOrigin().getAttribute('closed'));

    isActive = this.get('isActive');

    //  If the HUD is hidden, then we deactivate ourself. But not before
    //  capturing whether we were 'currently active' or not (i.e. the HUD can
    //  hide or show independent of us). Otherwise, if the HUD is showing, then
    //  we set ourself to whatever value we had when the HUD last hid.
    if (hudIsClosed) {
        if (isActive) {
            this.signal('TP.sig.EndOutlineMode');
        }

        this.toggleObservations(false);
    } else {
        if (this.get('$wasActive')) {
            this.signal('TP.sig.BeginOutlineMode');
        }

        this.toggleObservations(true);
    }

    this.set('$wasActive', isActive);

    return this;
}, {
    origin: 'LamaHUD'
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineHandler('DocumentLoaded',
function(aSignal) {

    /**
     * @method handleDocumentLoaded
     * @summary Handles when the document in the current UI canvas loads.
     * @param {TP.sig.DocumentLoaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.outliner} The receiver.
     */

    this.setupInjectedStyleSheet();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineHandler('DocumentUnloaded',
function(aSignal) {

    /**
     * @method handleDocumentUnloaded
     * @summary Handles when the document in the current UI canvas unloads.
     * @param {TP.sig.DocumentUnloaded} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.outliner} The receiver.
     */

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.outliner.Inst.defineHandler('DOMDNDInitiate',
function(aSignal) {

    /**
     * @method handleDOMDNDInitiate
     * @summary Handles when the drag and drop system initiates a dragging
     *     session.
     * @param {TP.sig.DOMDNDInitiate} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.outliner} The receiver.
     */

    var isActive;

    //  We need to capture whether we were active *before* the DND session, so
    //  we do that here.
    isActive = this.get('isActive');
    this.set('$wasActive', isActive);

    //  If we're not current active, then activate us.
    if (!isActive) {
        this.set('isActive', true);

        this.signal('TP.sig.BeginOutlineMode');
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.outliner.Inst.defineHandler('DOMDNDTargetOver',
function(aSignal) {

    /**
     * @method handleDOMDNDTargetOver
     * @summary Handles when the drag and drop system enters a possible drop
     *     target.
     * @param {TP.sig.DOMDNDTargetOver} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.outliner} The receiver.
     */

    var dndTargetElem,
        dndTargetTPElem,

        sourceTPElem,
        vendType,

        hudTPElem,

        containingBlockElem;

    //  Grab the current signal's "DOM target"
    dndTargetElem = aSignal.getDOMTarget();
    dndTargetTPElem = TP.wrap(dndTargetElem);

    sourceTPElem = TP.dom.UIElementNode.get('currentDNDSource');
    vendType = sourceTPElem.getAttribute('dnd:vend');

    switch (vendType) {
        case 'breadcrumb':
        case 'json_schema':
        case 'tofu':
        case 'tdc_output_node':

            break;

        case 'dom_node':
        case 'dom_node_copy':

            sourceTPElem = TP.byId('LamaHalo', TP.sys.getUIRoot()).
                                                get('currentTargetTPElem');
            break;

        default:
            break;
    }

    hudTPElem = TP.byId('LamaHUD', TP.sys.getUIRoot());
    if (!dndTargetTPElem.hudCanDrop(hudTPElem, sourceTPElem)) {
        this.set('$currentDNDTarget', null);
        return this;
    }

    //  Set the native node of our current signal's "DOM target" as our current
    //  drop target.
    this.set('$currentDNDTarget', dndTargetElem);

    //  Put a CSS class on the current drop target element for visual
    //  highlighting purposes
    TP.elementAddClass(dndTargetElem, 'lama-outliner-droptarget');

    //  If the element is positioned, then the drop containing block is that
    //  element. Otherwise, grab its containing block element and use that.
    if (TP.elementIsPositioned(dndTargetElem)) {
        containingBlockElem = dndTargetElem;
    } else {
        containingBlockElem = TP.elementGetContainingBlockElement(dndTargetElem);
    }
    this.set('$containingBlockElem', containingBlockElem);

    //  Add a CSS class to the containing block for visual highlighting
    //  purposes.
    TP.elementAddClass(containingBlockElem, 'lama-outliner-containingblock');

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.outliner.Inst.defineHandler('DOMDNDTargetOut',
function(aSignal) {

    /**
     * @method handleDOMDNDTargetOut
     * @summary Handles when the drag and drop system exits a possible drop
     *     target.
     * @param {TP.sig.DOMDNDTargetOut} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.outliner} The receiver.
     */

    var dndTargetTPElem,
        dndTargetElem,

        containingBlockElem;

    dndTargetTPElem = aSignal.getDOMTarget();
    dndTargetElem = TP.unwrap(dndTargetTPElem);

    //  Remove the CSS class placed on the drop target and set the attribute we
    //  use to track the current DND target to null.
    TP.elementRemoveClass(dndTargetElem, 'lama-outliner-droptarget');
    this.set('$currentDNDTarget', null);

    //  Remove the containing block CSS class from the drop zone element that
    //  we're hovering over.
    containingBlockElem = this.get('$containingBlockElem');
    if (TP.isValid(containingBlockElem)) {
        TP.elementRemoveClass(
            containingBlockElem, 'lama-outliner-containingblock');
        this.set('$containingBlockElem', null);
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.outliner.Inst.defineHandler('DOMDNDCompleted',
function(aSignal) {

    /**
     * @method handleDOMDNDCompleted
     * @summary Handles when the drag and drop system completes a dragging
     *     session.
     * @param {TP.sig.DOMDNDCompleted} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.outliner} The receiver.
     */

    var targetTPElement,

        isActive,
        wasActive,

        dndTargetElem,

        dndSourceTPElem,
        vendType,

        dndSource,
        tdcOutputItem,
        tdcRequest,

        containingBlockElem;

    //  Capture this *before* we hide ourself - it will be nulled out by that
    //  method.
    targetTPElement = this.get('targetTPElement');

    //  If we're not active right now, then the outliner was already
    //  deactivated. This probably happened because the D&D session got canceled
    //  via the Esc key or some other mechanism.
    isActive = this.get('isActive');

    //  Were we active *before* the DND session.
    wasActive = this.get('$wasActive');

    //  If we're currently active, but weren't before the DND session, then set
    //  us back to inactive.
    if (isActive && !wasActive) {
        this.set('isActive', false);

        this.signal('TP.sig.EndOutlineMode');
    }

    //  Grab the DND target element. If there was no DND target, then a valid
    //  drop target couldn't be computed.
    dndTargetElem = this.get('$currentDNDTarget');

    if (TP.isElement(dndTargetElem)) {

        //  Remove the class placed on the drop target and set the attribute we
        //  use to track the current DND target to null.
        TP.elementRemoveClass(dndTargetElem, 'lama-outliner-droptarget');
        this.set('$currentDNDTarget', null);
    }

    //  If we're currently active and the canvas document contains the target
    //  element, then we want to be the controller that does the possible
    //  insertion.
    if (isActive &&
        TP.isElement(dndTargetElem) &&
        targetTPElement.contains(dndTargetElem, TP.IDENTITY)) {

        //  Grab the 'drag and drop' source element.

        //  If we have a drag and drop source, then try to process it.
        dndSourceTPElem = aSignal.at('dndSource');
        if (TP.isValid(dndSourceTPElem)) {

            //  The value of the 'dnd:vend' attribute on the source will detail
            //  what the kind of source just got dropped into the outliner.
            vendType = dndSourceTPElem.getAttribute('dnd:vend');

            switch (vendType) {

                case 'breadcrumb':

                    //  Message the drop target that we dropped a breadcrumb
                    //  into it at the insertion position determined by the
                    //  user.
                    TP.wrap(dndTargetElem).lamaDidInsertBreadcrumb(
                                            dndTargetElem,
                                            this.get('insertionPosition'));

                    break;

                case 'json_schema':

                    //  Message the drop target that we dropped JSON schema
                    //  into it at the insertion position determined by the
                    //  user.
                    TP.wrap(dndTargetElem).lamaDidInsertJSONSchema(
                                            dndTargetElem,
                                            this.get('insertionPosition'),
                                            dndSourceTPElem.getNativeNode());
                    break;

                case 'tofu':

                    //  Message the drop target that we dropped tofu into it
                    //  at the insertion position determined by the user.
                    TP.wrap(dndTargetElem).lamaDidInsertTofu(
                                            dndTargetElem,
                                            this.get('insertionPosition'));

                    break;

                case 'dom_node':

                    //  Message the drop target that we dropped an existing DOM
                    //  node into it at the insertion position determined by the
                    //  user and that node should be reparented.
                    TP.wrap(dndTargetElem).lamaDidReparentNode(
                                            dndTargetElem,
                                            this.get('insertionPosition'));

                    break;

                case 'dom_node_copy':

                    //  Message the drop target that we dropped a copy of an
                    //  existing DOM node into it at the insertion position
                    //  determined by the user and that node should be copied
                    //  into that spot.
                    TP.wrap(dndTargetElem).lamaDidCopyNodeInto(
                                            dndTargetElem,
                                            this.get('insertionPosition'));

                    break;

                case 'tdc_output_node':

                    //  Grab the DND source element. From there, we work our way
                    //  up to the consoleoutputitem element, which will have had
                    //  the request that created it programmed onto it.
                    dndSource = aSignal.at('dndSource');
                    tdcOutputItem = dndSource.getFirstAncestorBySelector(
                                                'lama|consoleoutputitem');
                    tdcRequest = tdcOutputItem.get('$creatingRequest');

                    //  Message the drop target that we dropped a piece of
                    //  console output into it at the insertion position
                    //  determined by the user and that node should be copied
                    //  into that spot.
                    TP.wrap(dndTargetElem).lamaDidCopyTDCOutputNodeInto(
                                            dndTargetElem,
                                            this.get('insertionPosition'),
                                            tdcRequest);

                    break;

                default:
                    break;
            }
        }
    }

    //  Remove the containing block CSS class from the drop zone element that
    //  we were hovering over, whether or not a valid drop target was computed.
    containingBlockElem = this.get('$containingBlockElem');

    if (TP.isElement(containingBlockElem)) {
        TP.elementRemoveClass(
            containingBlockElem, 'lama-outliner-containingblock');
        this.set('$containingBlockElem', null);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineHandler('DOMMouseWheel',
function(aSignal) {

    /**
     * @method handleDOMMouseWheel
     * @param {TP.sig.DOMMouseWheel} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.outliner} The receiver.
     */

    var delta,
        scale;

    aSignal.preventDefault();

    //  Grab the wheel delta and use it to compute a new scale.

    delta = aSignal.getWheelDelta();

    if (delta === 0) {
        return this;
    }

    scale = this.get('scale');

    scale += delta > 0 ? 0.1 : -0.1;
    scale = scale.abs();

    this.set('scale', scale);

    //  Update both the target element and halo style.
    this.updateTargetElementStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineHandler('HaloDidBlur',
function(aSignal) {

    /**
     * @method handleHaloDidBlur
     * @param {TP.sig.Toggleoutliner} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.outliner} The receiver.
     */

    var haloTargetTPElem,
        oldDisplayVal;

    haloTargetTPElem = aSignal.at('haloTarget');

    //  Remove the class on the current halo target that allowed us to apply
    //  'halo style' to it, even though the halo is hidden.
    haloTargetTPElem.removeClass('lama-outliner-haloed');

    this.set('$haloTargetDepth', 0);

    if (this.get('$alteredTargetStyle')) {
        oldDisplayVal = this.get('$oldDisplayVal');
        haloTargetTPElem.setStyleProperty('display', oldDisplayVal);

        this.set('$oldDisplayVal', null);
        this.set('$alteredTargetStyle', false);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineHandler('HaloDidFocus',
function(aSignal) {

    /**
     * @method handleHaloDidFocus
     * @param {TP.sig.Toggleoutliner} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.outliner} The receiver.
     */

    var haloTargetTPElem,
        displayVal;

    haloTargetTPElem = aSignal.at('haloTarget');

    if (TP.isValid(haloTargetTPElem)) {
        //  Set a class on the current halo target that allows us to apply 'halo
        //  style' to it, even though the halo is hidden.
        haloTargetTPElem.addClass('lama-outliner-haloed');

        this.set('$haloTargetDepth',
            haloTargetTPElem.getAttribute('lama:outliner-depth').asNumber());

        displayVal = haloTargetTPElem.getComputedStyleProperty('display');
        if (displayVal === 'inline') {

            //  NB: We actually capture any *local* style value that the target
            //  has.
            this.set('$oldDisplayVal',
                        haloTargetTPElem.getStyleProperty('display'));

            haloTargetTPElem.setStyleProperty('display', 'inline-block');
            this.set('$alteredTargetStyle', true);
        } else {
            this.set('$oldDisplayVal', null);
            this.set('$alteredTargetStyle', false);
        }

        this.updateTargetElementStyle();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineHandler('MutationAttach',
function(aSignal) {

    /**
     * @method handleMutationAttach
     * @summary Handles notifications of node attachment from the current UI
     *     canvas.
     * @param {TP.sig.MutationAttach} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.outliner} The receiver.
     */

    var targetElement,

        labelStr;

    targetElement = TP.unwrap(this.get('targetTPElement'));

    //  Define a Function that will compute the tag label either by using the
    //  name in the 'tibet:tag' attribute (preferred since it was set by the
    //  system during some sort of compilation phase) or, lacking that, using
    //  the element's 'tagName'.
    labelStr = function(anElement) {

        var tagName;

        tagName = TP.elementGetAttribute(anElement, 'tibet:tag', true);
        if (TP.isEmpty(tagName)) {
            tagName = anElement.tagName;
        }

        return tagName;
    };

    //  Add a 'lama_outliner-tagname' attribute on the target and all of its
    //  descendants. This is used by a CSS rule to display the tagname labels
    //  for each element in the outline.

    TP.elementSetAttribute(targetElement,
                            'lama_outliner-tagname',
                            labelStr(targetElement),
                            true);

    //  Iterate over all of the descendant *elements* of the target and make
    //  them ready to participate in the outliner visualization.

    TP.nodeDescendantElementsPerform(
        targetElement,
        function(anElement) {

            var depth,
                compStyle,

                width,
                height;

            TP.elementSetAttribute(
                            anElement,
                            'lama_outliner-tagname',
                            labelStr(anElement),
                            true);

            //  Compute the depth of the descendant by getting it's document
            //  position, splitting along the periods ('.') and getting the size
            //  of that Array.
            depth = TP.nodeGetDocumentPosition(anElement).split('.').getSize();
            TP.elementSetAttribute(
                            anElement,
                            'lama:outliner-depth',
                            depth,
                            true);

            //  Grab the computed style of the descendant. If its overflow isn't
            //  visible, then add a class that forces it to be so. This is due
            //  to how CSS3 transforms work with the Z-axis.
            compStyle = TP.elementGetComputedStyleObj(anElement);

            //  If overflow on the element is not 'visible' then, due to
            //  limitations codified in the CSS 3D transform specification, the
            //  z-transformation will not take place. Here we add a class that
            //  will force visibility: visible and explicitly set the width and
            //  height to their current values. This will force the element to
            //  stay in place. By using the 'push and set' style property
            //  manipulation methods, if the element already has an explicitly
            //  computed width or height, those will be preserved and restored
            //  when the value is 'popped'.
            if (compStyle.overflow !== 'visible') {

                width = TP.elementGetWidth(anElement);
                TP.elementPushAndSetStyleProperty(
                                    anElement, 'width', width + 'px');

                height = TP.elementGetHeight(anElement);
                TP.elementPushAndSetStyleProperty(
                                    anElement, 'height', height + 'px');

                TP.elementAddClass(anElement, 'lama-outliner-overflowed');
            }
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineHandler('MutationDetach',
function(aSignal) {

    /**
     * @method handleMutationDetach
     * @summary Handles notifications of node detachment from the overall canvas
     *     that the outliner is working with.
     * @param {TP.sig.MutationDetach} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.outliner} The receiver.
     */

    var targetElement,

        labelStr;

    targetElement = TP.unwrap(this.get('targetTPElement'));

    //  Define a Function that will compute the tag label either by using the
    //  name in the 'tibet:tag' attribute (preferred since it was set by the
    //  system during some sort of compilation phase) or, lacking that, using
    //  the element's 'tagName'.
    labelStr = function(anElement) {

        var tagName;

        tagName = TP.elementGetAttribute(anElement, 'tibet:tag', true);
        if (TP.isEmpty(tagName)) {
            tagName = anElement.tagName;
        }

        return tagName;
    };

    //  Add a 'lama_outliner-tagname' attribute on the target and all of its
    //  descendants. This is used by a CSS rule to display the tagname labels
    //  for each element in the outline.

    TP.elementSetAttribute(targetElement,
                            'lama_outliner-tagname',
                            labelStr(targetElement),
                            true);

    //  Iterate over all of the descendant *elements* of the target and make
    //  them ready to participate in the outliner visualization.

    TP.nodeDescendantElementsPerform(
        targetElement,
        function(anElement) {

            var depth,
                compStyle,

                width,
                height;

            TP.elementSetAttribute(
                            anElement,
                            'lama_outliner-tagname',
                            labelStr(anElement),
                            true);

            //  Compute the depth of the descendant by getting it's document
            //  position, splitting along the periods ('.') and getting the size
            //  of that Array.
            depth = TP.nodeGetDocumentPosition(anElement).split('.').getSize();
            TP.elementSetAttribute(
                            anElement,
                            'lama:outliner-depth',
                            depth,
                            true);

            //  Grab the computed style of the descendant. If its overflow isn't
            //  visible, then add a class that forces it to be so. This is due
            //  to how CSS3 transforms work with the Z-axis.
            compStyle = TP.elementGetComputedStyleObj(anElement);

            //  If overflow on the element is not 'visible' then, due to
            //  limitations codified in the CSS 3D transform specification, the
            //  z-transformation will not take place. Here we add a class that
            //  will force visibility: visible and explicitly set the width and
            //  height to their current values. This will force the element to
            //  stay in place. By using the 'push and set' style property
            //  manipulation methods, if the element already has an explicitly
            //  computed width or height, those will be preserved and restored
            //  when the value is 'popped'.
            if (compStyle.overflow !== 'visible') {

                width = TP.elementGetWidth(anElement);
                TP.elementPushAndSetStyleProperty(
                                    anElement, 'width', width + 'px');

                height = TP.elementGetHeight(anElement);
                TP.elementPushAndSetStyleProperty(
                                    anElement, 'height', height + 'px');

                TP.elementAddClass(anElement, 'lama-outliner-overflowed');
            }
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineHandler('MutationStyleChange',
function(aSignal) {

    /**
     * @method handleMutationStyleChange
     * @summary Handles notifications of node style changes from the overall
     *     canvas that the outliner is working with.
     * @param {TP.sig.MutationStyleChange} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.outliner} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineHandler('LamaOutlinerToggle',
function(aSignal) {

    /**
     * @method handleLamaOutlinerToggle
     * @param {TP.sig.LamaOutlinerToggle} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.outliner} The receiver.
     */

    if (this.get('isActive')) {
        this.set('isActive', false);
        this.signal('TP.sig.EndOutlineMode');
    } else {
        this.set('isActive', true);
        this.signal('TP.sig.BeginOutlineMode');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineHandler('ScreenWillToggle',
function(aSignal) {

    /**
     * @method handleScreenWillToggle
     * @summary Handles notifications of screen will toggle signals.
     * @param {TP.sig.ScreenWillToggle} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.outliner} The receiver.
     */

    var world,

        oldScreenTPWin;

    world = TP.byId('LamaWorld', TP.sys.getUIRoot());

    //  Grab the old screen TP.core.Window and ignore
    //  DocumentLoaded/DocumentUnloaded signals coming from it.
    oldScreenTPWin = world.get('selectedScreen').getContentWindow();
    this.ignore(oldScreenTPWin, TP.ac('DocumentLoaded', 'DocumentUnloaded'));

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineHandler('ScreenDidToggle',
function(aSignal) {

    /**
     * @method handleScreenDidToggle
     * @summary Handles notifications of screen did toggle signals.
     * @param {TP.sig.ScreenDidToggle} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.outliner} The receiver.
     */

    var world,

        newScreen,
        newScreenTPWin;

    world = TP.byId('LamaWorld', TP.sys.getUIRoot());

    //  Grab the new screen TP.core.Window and observe
    //  DocumentLoaded/DocumentUnloaded signals coming from it.
    newScreen = world.get('screens').at(aSignal.at('screenIndex'));

    if (TP.isValid(newScreen)) {
        newScreenTPWin = newScreen.getContentWindow();
        this.observe(newScreenTPWin,
                        TP.ac('DocumentLoaded', 'DocumentUnloaded'));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineMethod('hideOutliner',
function() {

    /**
     * @method hideOutliner
     * @summary Hides the outliner.
     * @returns {TP.lama.outliner} The receiver.
     */

    var canvasTPDoc,

        doc,
        outlinerStyleElement,

        haloTPElem,
        haloTargetTPElem,
        toolsLayerTPElem,

        oldDisplayVal;

    //  Grab the canvas document and ignore the mutation detach and mutation
    //  style change signals that were observed when the outliner was shown.
    canvasTPDoc = this.get('targetTPElement').getDocument();
    this.ignore(canvasTPDoc,
                TP.ac('TP.sig.MutationAttach',
                        'TP.sig.MutationDetach',
                        'TP.sig.MutationStyleChange'));

    //  Ignore the DND targeting signals that we observed over the target
    //  element.
    this.ignore(this.get('targetTPElement'),
                    TP.ac('TP.sig.DOMDNDTargetOver',
                            'TP.sig.DOMDNDTargetOut'));

    this.teardownTargetElement();

    haloTPElem = TP.byId('LamaHalo', TP.sys.getUIRoot());
    haloTargetTPElem = haloTPElem.get('currentTargetTPElem');
    if (TP.isValid(haloTargetTPElem)) {
        //  Remove the class on the current halo target that allowed us to apply
        //  'halo style' to it, even though the halo is hidden.
        haloTargetTPElem.removeClass('lama-outliner-haloed');

        if (this.get('$alteredTargetStyle')) {
            oldDisplayVal = this.get('$oldDisplayVal');
            haloTargetTPElem.setStyleProperty('display', oldDisplayVal);

            this.set('$oldDisplayVal', null);
            this.set('$alteredTargetStyle', false);
        }
    }

    //  Ask the halo to go ahead and resume any other object's attempt to show
    //  it.
    haloTPElem.resumeSettingOf('hidden');

    doc = TP.sys.uidoc(true);

    //  Grab the injected stylesheet and disable it. We don't bother actually
    //  removing it as it won't be serialized when the canvas document is saved
    //  and its much faster to just toggle it's 'disabled' property during
    //  development.
    outlinerStyleElement = TP.byId('outliner_injected_generated', doc, false);
    if (TP.isElement(outlinerStyleElement)) {
        outlinerStyleElement.disabled = true;
    }

    //  Grab the halo, reset its transform and transform origin to '' and move
    //  and size it to its own target to display it properly.
    toolsLayerTPElem = TP.bySystemId('Lama').getToolsLayer();
    toolsLayerTPElem.setTransform('');

    haloTPElem.moveAndSizeToTarget(haloTPElem.get('currentTargetTPElem'));

    //  Ignore the halo for when it focuses and blurs. These observations were
    //  made when the outliner was shown.

    this.ignore(TP.byId('LamaHalo', TP.sys.getUIRoot()),
                'TP.sig.HaloDidFocus');
    this.ignore(TP.byId('LamaHalo', TP.sys.getUIRoot()),
                'TP.sig.HaloDidBlur');

    //  Null out the target element.
    this.set('targetTPElement', null);

    //  We are now officially inactive.
    this.set('isActive', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineMethod('resetVisualizationParameters',
function() {

    /**
     * @method resetVisualizationParameters
     * @summary Resets all of the visualization parameters to their default
     *     value.
     * @returns {TP.lama.outliner} The receiver.
     */

    this.set('insertionPosition', TP.BEFORE_END);

    this.set('xRotation', 0);
    this.set('yRotation', 0);

    this.set('spread', 50);

    this.set('scale', 1);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineMethod('rotateInsertionPosition',
function() {

    /**
     * @method rotateInsertionPosition
     * @summary Rotates the insertion position amongst the 4 values following
     *     the pattern of: TP.BEFORE_BEGIN -> TP.AFTER_BEGIN -> TP.BEFORE_END ->
     *     TP.AFTER_END. This method then sets the insertion position to the
     *     next value.
     * @returns {TP.lama.outliner} The receiver.
     */

    var currentPosition,
        newPosition;

    currentPosition = this.get('insertionPosition');

    switch (currentPosition) {

        case TP.BEFORE_BEGIN:
            newPosition = TP.AFTER_BEGIN;
            break;

        case TP.AFTER_BEGIN:
            newPosition = TP.BEFORE_END;
            break;

        case TP.BEFORE_END:
            newPosition = TP.AFTER_END;
            break;

        case TP.AFTER_END:
            newPosition = TP.BEFORE_BEGIN;
            break;

        default:
            break;
    }

    this.set('insertionPosition', newPosition);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineMethod('rotateDown',
function() {

    /**
     * @method rotateDown
     * @summary Rotates the '3D extrusion' view 'down' along the X axis.
     * @returns {TP.lama.outliner} The receiver.
     */

    this.set('xRotation', this.get('xRotation') - 5);
    this.updateTargetElementStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineMethod('rotateLeft',
function() {

    /**
     * @method rotateLeft
     * @summary Rotates the '3D extrusion' view 'left' along the Y axis.
     * @returns {TP.lama.outliner} The receiver.
     */

    this.set('yRotation', this.get('yRotation') - 5);
    this.updateTargetElementStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineMethod('rotateRight',
function() {

    /**
     * @method rotateRight
     * @summary Rotates the '3D extrusion' view 'right' along the Y axis.
     * @returns {TP.lama.outliner} The receiver.
     */

    this.set('yRotation', this.get('yRotation') + 5);
    this.updateTargetElementStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineMethod('rotateUp',
function() {

    /**
     * @method rotateUp
     * @summary Rotates the '3D extrusion' view 'up' along the X axis.
     * @returns {TP.lama.outliner} The receiver.
     */

    this.set('xRotation', this.get('xRotation') + 5);
    this.updateTargetElementStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineMethod('setInsertionPosition',
function(aPosition) {

    /**
     * @method setInsertionPosition
     * @summary Sets the 'insertion position' of the drop target. This is the
     *     position that the insertion will be made at if it is dropped under
     *     the current conditions.
     * @param {String} aPosition The insertion position. This could be
     *     TP.BEFORE_BEGIN, TP.AFTER_BEGIN, TP.BEFORE_END, TP.AFTER_END.
     * @returns {TP.lama.outliner} The receiver.
     */

    this.$set('insertionPosition', aPosition);

    TP.byId('LamaWorkbench', TP.sys.getUIRoot()).updateStatusbar(
            TP.hc('insertionPosition', aPosition));

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineMethod('setupInjectedStyleSheet',
async function() {

    /**
     * @method setupInjectedStyleSheet
     * @summary Set up the stylesheet that will be 'injected' into the UI canvas
     *     so that the outliner can affect visual changes in the UI canvas.
     * @returns {TP.lama.outliner} The receiver.
     */

    var doc,
        styleElement,

        descendantRule;

    doc = TP.sys.uidoc(true);

    styleElement = TP.byId('outliner_injected_generated', doc, false);

    if (!TP.isElement(styleElement)) {

        styleElement = await TP.documentAddCSSElement(
            doc,
            TP.uc('~TP.lama.outliner/TP.lama.outliner_injected.css').
                getLocation(),
            true,
            false);

        TP.elementSetAttribute(
            styleElement, 'id', 'outliner_injected_generated');

        //  Mark the sheet as 'TIBET_PRIVATE' so that it's style rules are not
        //  considered when the element's style rules are computed.
        styleElement[TP.TIBET_PRIVATE] = true;

        descendantRule = TP.styleSheetGetStyleRulesMatching(
                            TP.cssElementGetStyleSheet(styleElement),
                            '.lama-outliner *|*');

        this.set('$hudOutlinerDescendantsRule', descendantRule.first());
    } else {
        styleElement.disabled = false;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineMethod('setupTargetElement',
function() {

    /**
     * @method setupTargetElement
     * @summary Sets up the outliner-specific constructs that need to be placed
     *     on the target element or its descendants to allow the outliner to
     *     work.
     * @returns {TP.lama.outliner} The receiver.
     */

    var targetElement,

        acceptedDNDTypes,

        labelStr;

    //  Make sure to suspend all mutation observer machinery for performance
    //  here. There will be no observers of us turning on outlining.
    TP.suspendAllMutationObservers();

    targetElement = TP.unwrap(this.get('targetTPElement'));

    //  Stash off current 'local' values for 'transform' and 'transform-origin'
    //  and set them to the empty string to allow the outliner's style rules to
    //  take effect.
    TP.elementPushAndSetStyleProperty(targetElement, 'transform', '');
    TP.elementPushAndSetStyleProperty(targetElement, 'transform-origin', '');

    //  Add the top-level 'lama-outliner' class. This let's the rules in the
    //  injected style sheet work as they are qualified by this class.
    TP.elementAddClass(targetElement, 'lama-outliner');

    acceptedDNDTypes = TP.ac('tofu',
                                'dom_node',
                                'dom_node_copy',
                                'breadcrumb',
                                'json_schema',
                                'tdc_output_node');

    //  Enable DND by setting this attribute.
    TP.elementSetAttribute(targetElement,
                            'dnd:accept',
                            acceptedDNDTypes.join(' '),
                            true);

    //  Define a Function that will compute the tag label either by using the
    //  name in the 'tibet:tag' attribute (preferred since it was set by the
    //  system during some sort of compilation phase) or, lacking that, using
    //  the element's 'tagName'.
    labelStr = function(anElement) {

        var tagName;

        tagName = TP.elementGetAttribute(anElement, 'tibet:tag', true);
        if (TP.isEmpty(tagName)) {
            tagName = anElement.tagName;
        }

        return tagName;
    };

    //  Add a 'lama_outliner-tagname' attribute on the target and all of its
    //  descendants. This is used by a CSS rule to display the tagname labels
    //  for each element in the outline.

    TP.elementSetAttribute(targetElement,
                            'lama_outliner-tagname',
                            labelStr(targetElement),
                            true);

    //  Iterate over all of the descendant *elements* of the target and make
    //  them ready to participate in the outliner visualization.

    TP.nodeDescendantElementsPerform(
        targetElement,
        function(anElement) {

            var depth,
                compStyle,

                width,
                height;

            TP.elementSetAttribute(
                            anElement,
                            'lama_outliner-tagname',
                            labelStr(anElement),
                            true);

            //  Compute the depth of the descendant by getting it's document
            //  position, splitting along the periods ('.') and getting the size
            //  of that Array.
            depth = TP.nodeGetDocumentPosition(anElement).split('.').getSize();
            TP.elementSetAttribute(
                            anElement,
                            'lama:outliner-depth',
                            depth,
                            true);

            //  Grab the computed style of the descendant. If its overflow isn't
            //  visible, then add a class that forces it to be so. This is due
            //  to how CSS3 transforms work with the Z-axis.
            compStyle = TP.elementGetComputedStyleObj(anElement);

            //  If overflow on the element is not 'visible' then, due to
            //  limitations codified in the CSS 3D transform specification, the
            //  z-transformation will not take place. Here we add a class that
            //  will force visibility: visible and explicitly set the width and
            //  height to their current values. This will force the element to
            //  stay in place. By using the 'push and set' style property
            //  manipulation methods, if the element already has an explicitly
            //  computed width or height, those will be preserved and restored
            //  when the value is 'popped'.
            if (compStyle.overflow !== 'visible') {

                width = TP.elementGetWidth(anElement);
                TP.elementPushAndSetStyleProperty(
                                    anElement, 'width', width + 'px');

                height = TP.elementGetHeight(anElement);
                TP.elementPushAndSetStyleProperty(
                                    anElement, 'height', height + 'px');

                TP.elementAddClass(anElement, 'lama-outliner-overflowed');
            }
        });

    //  Resume all mutation observer machinery now that the outliner is showing.
    TP.resumeAllMutationObservers();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineMethod('showOutliner',
function() {

    /**
     * @method showOutliner
     * @summary Shows the outliner.
     * @returns {TP.lama.outliner} The receiver.
     */

    var canvasTPDoc,

        haloTPElem,
        haloTargetTPElem,

        displayVal;

    //  Grab the canvas document and observe mutation detach and mutation style
    //  change signals from it. This allows the outliner to update as the DOM
    //  changes underneath it.
    canvasTPDoc = TP.sys.getUICanvas().getDocument();
    this.observe(canvasTPDoc,
                    TP.ac('TP.sig.MutationAttach',
                            'TP.sig.MutationDetach',
                            'TP.sig.MutationStyleChange'));

    //  Observe DND targeting signals over the target element.
    this.observe(this.get('targetTPElement'),
                    TP.ac('TP.sig.DOMDNDTargetOver',
                            'TP.sig.DOMDNDTargetOut'));

    //  Reset our visualization parameters all back to their starting values.
    this.resetVisualizationParameters();

    //  For now, we use the canvas document's body element as the target
    this.set('targetTPElement', canvasTPDoc.getBody());

    //  Set it up.
    this.setupTargetElement();

    //  The stylesheet has probably already been injected, but this will cause
    //  it to become enabled if we have already been toggle off and on again.
    //  This is also necessary if we're now in a different screen's document
    //  than the stylesheet was originally injected into.
    this.setupInjectedStyleSheet();

    setTimeout(function() {
        //  Update both the target element and it's descendants style.
        this.updateTargetElementStyle();
        this.updateOutlinedDescendantStyle();
    }.bind(this), 1000);

    //  Grab the halo, move and size it to its own target and update its style
    //  to match what we need to display it properly.
    haloTPElem = TP.byId('LamaHalo', TP.sys.getUIRoot());

    //  Ask the halo to suspend any other object's attempt to show it.
    haloTPElem.suspendSettingOf('hidden');

    haloTargetTPElem = haloTPElem.get('currentTargetTPElem');
    if (TP.isValid(haloTargetTPElem)) {
        //  Set a class on the current halo target that allows us to apply 'halo
        //  style' to it, even though the halo is hidden.
        haloTargetTPElem.addClass('lama-outliner-haloed');

        this.set('$haloTargetDepth',
            haloTargetTPElem.getAttribute('lama:outliner-depth').asNumber());

        displayVal = haloTargetTPElem.getComputedStyleProperty('display');
        if (displayVal === 'inline') {

            //  NB: We actually capture any *local* style value that the target
            //  has.
            this.set('$oldDisplayVal',
                        haloTargetTPElem.getStyleProperty('display'));

            haloTargetTPElem.setStyleProperty('display', 'inline-block');
            this.set('$alteredTargetStyle', true);
        } else {
            this.set('$oldDisplayVal', null);
            this.set('$alteredTargetStyle', false);
        }
    }

    //  Observe the halo for when it focuses and blurs. We'll need to do this to
    //  keep it's style in sync with what we're doing here.

    this.observe(TP.byId('LamaHalo', TP.sys.getUIRoot()),
                    'TP.sig.HaloDidFocus');
    this.observe(TP.byId('LamaHalo', TP.sys.getUIRoot()),
                    'TP.sig.HaloDidBlur');

    //  We are now officially active.
    this.set('isActive', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineMethod('teardownTargetElement',
function() {

    /**
     * @method teardownTargetElement
     * @summary Tears down the outliner-specific constructs that were placed on
     *     the target element or its descendants to allow the outliner to work.
     * @returns {TP.lama.outliner} The receiver.
     */

    var targetElement,
        prevValue;

    //  Make sure to suspend all mutation observer machinery for performance
    //  here. There will be no observers of us turning on outlining.
    TP.suspendAllMutationObservers();

    //  Grab the target element
    targetElement = TP.unwrap(this.get('targetTPElement'));

    //  Grab any 'local' value of 'transform' that was stashed to allow the
    //  outliner's rules to take effect and restore it.
    prevValue = TP.elementPopStyleProperty(targetElement, 'transform');

    //  NB: We use isValid(), not isEmpty(), here since an empty String is a
    //  valid CSS value.
    if (TP.isValid(prevValue)) {
        TP.elementSetStyleProperty(targetElement, 'transform', prevValue);
    }

    //  Grab any 'local' value of 'transform-origin' that was stashed to allow
    //  the outliner's rules to take effect and restore it.
    prevValue = TP.elementPopStyleProperty(targetElement, 'transform-origin');

    //  NB: We use isValid(), not isEmpty(), here since an empty String is a
    //  valid CSS value.
    if (TP.isValid(prevValue)) {
        TP.elementSetStyleProperty(
                    targetElement, 'transform-origin', prevValue);
    }

    //  Remove the top-level 'lama-outliner' class
    TP.elementRemoveClass(targetElement, 'lama-outliner');

    //  No longer need this attribute - no more DND here.
    TP.elementRemoveAttribute(targetElement, 'dnd:accept');

    //  Remove the 'lama_outliner-tagname' attribute on the target and all of
    //  its descendants. This is used by a CSS rule to display the tagname
    //  labels for each element in the outline.
    TP.elementRemoveAttribute(targetElement, 'lama_outliner-tagname', true);
    TP.nodeDescendantElementsPerform(
                    targetElement,
                    function(anElement) {
                        TP.elementRemoveAttribute(
                            anElement, 'lama_outliner-tagname', true);
                        TP.elementRemoveAttribute(
                            anElement, 'lama:outliner-depth', true);

                        //  If the element has a class where it has been set to
                        //  overflow: visible, remove that class and pop
                        //  whatever explicit width and height has been set and
                        //  use the previous value as the width and height. Note
                        //  that this could very well be the value '', which
                        //  means the element didn't have an 'inline' width or
                        //  height.
                        if (TP.elementHasClass(
                                anElement, 'lama-outliner-overflowed')) {

                            TP.elementRemoveClass(
                                anElement, 'lama-outliner-overflowed');
                            TP.elementPopAndSetStyleProperty(
                                anElement, 'width');
                            TP.elementPopAndSetStyleProperty(
                                anElement, 'height');
                        }
                    });

    //  Resume all mutation observer machinery now that the outliner is showing.
    TP.resumeAllMutationObservers();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineMethod('toggleObservations',
function(shouldObserve) {

    /**
     * @method toggleObservations
     * @summary Either observe or ignore the signals that the receiver needs to
     *     function.
     * @param {Boolean} shouldObserve Whether or not we should be observing (or
     *     ignoring) signals.
     * @returns {TP.lama.outliner} The receiver.
     */

    var currentKeyboard,

        world,
        currentScreenTPWin;

    currentKeyboard = TP.core.Keyboard.getCurrentKeyboard();

    world = TP.byId('LamaWorld', TP.sys.getUIRoot());
    currentScreenTPWin = world.get('selectedScreen').getContentWindow();

    if (shouldObserve) {
        (function(aSignal) {
            this.signal('TP.sig.BeginOutlineMode');
        }).observe(currentKeyboard, 'TP.sig.DOM_Ctrl_E_Up');

        this.observe(TP.ANY, TP.ac('TP.sig.DOMDNDInitiate',
                                    'TP.sig.DOMDNDCompleted'));

        this.observe(TP.ANY, 'TP.sig.LamaOutlinerToggle');

        this.observe(world, TP.ac('ScreenWillToggle', 'ScreenDidToggle'));

        this.observe(currentScreenTPWin,
                        TP.ac('DocumentLoaded', 'DocumentUnloaded'));
    } else {
        (function(aSignal) {
            this.signal('TP.sig.BeginOutlineMode');
        }).ignore(currentKeyboard, 'TP.sig.DOM_Ctrl_E_Up');

        this.ignore(TP.ANY, TP.ac('TP.sig.DOMDNDInitiate',
                                    'TP.sig.DOMDNDCompleted'));

        this.ignore(TP.ANY, 'TP.sig.LamaOutlinerToggle');

        this.ignore(world, TP.ac('ScreenWillToggle', 'ScreenDidToggle'));

        this.ignore(currentScreenTPWin,
                        TP.ac('DocumentLoaded', 'DocumentUnloaded'));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineMethod('updateOutlinedDescendantStyle',
function() {

    /**
     * @method updateOutlinedDescendantStyle
     * @summary Updates the style governing the 'outlined' descendants of the
     *     target element to adjust properties such as the '3D spread' of
     *     elements.
     * @returns {TP.lama.outliner} The receiver.
     */

    this.get('$hudOutlinerDescendantsRule').style.transform =
                'translate3d(0px, 0px, ' + this.get('spread') + 'px)';

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.outliner.Inst.defineMethod('updateTargetElementStyle',
function() {

    /**
     * @method updateTargetElementStyle
     * @summary Updates the outliner's target element's style (the scale and
     *     transform that is currently displaying the outliner's projection).
     * @returns {TP.lama.outliner} The receiver.
     */

    var xRotation,
        yRotation,

        scale,

        doc,
        outlinerStyleElement,

        toolsLayerTPElem,

        currentDepth,

        zDistance,
        zVal;

    xRotation = this.get('xRotation');
    yRotation = this.get('yRotation');

    scale = this.get('scale');

    doc = TP.sys.uidoc(true);

    outlinerStyleElement = TP.byId('outliner_injected_generated', doc, false);

    TP.cssElementSetCustomCSSPropertyValue(
        outlinerStyleElement,
        '.lama-outliner',
        '--lama-outliner-rotate-X',
        xRotation + 'deg',
        null,
        false);

    TP.cssElementSetCustomCSSPropertyValue(
        outlinerStyleElement,
        '.lama-outliner',
        '--lama-outliner-rotate-Y',
        yRotation + 'deg',
        null,
        false);

    TP.cssElementSetCustomCSSPropertyValue(
        outlinerStyleElement,
        '.lama-outliner',
        '--lama-outliner-scale',
        scale,
        null,
        false);

    currentDepth = this.get('$haloTargetDepth');

    zDistance = TP.cssElementGetCustomCSSPropertyValue(
                    outlinerStyleElement,
                    '.lama-outliner',
                    '--lama-outliner-distance-Z');

    //  Note how we subtract 2 from the depth to account for 'html' & 'body'
    //  layers.
    zVal = (currentDepth - 2) * zDistance;

    toolsLayerTPElem = TP.bySystemId('Lama').getToolsLayer();
    toolsLayerTPElem.setTransform(
        ' rotateX(' + xRotation + 'deg)' +
        ' rotateY(' + yRotation + 'deg)' +
        ' scale(' + scale + ')' +
        ' translate3d(0px, 0px, ' + zVal + 'px)');

    return this;
});

//  ========================================================================
//  TP.lama.OutlineKeyResponder
//  ========================================================================

TP.lama.NormalKeyResponder.defineSubtype('OutlineKeyResponder');

//  ----------------------------------------------------------------------------

TP.lama.OutlineKeyResponder.Inst.defineHandler('DOMKeySignal',
function(aSignal) {

    /**
     * @method handleDOMKeySignal
     * @summary Executes the handler on the receiver (if there is one) for the
     *     trigger signal (the underlying signal that caused a StateInput signal
     *     to be fired from the state machine to this object).
     * @param {TP.sig.StateInput} aSignal The signal that caused the state
     *     machine to get further input. The original triggering signal (most
     *     likely a keyboard-related signal) will be in this signal's payload
     *     under the key 'trigger'.
     * @returns {TP.lama.OutlineKeyResponder} The receiver.
     */

    var keyName;

    keyName = aSignal.getKeyName();

    if (keyName !== 'DOM_Ctrl_Down') {
        TP.bySystemId('LamaOutliner').deactivateMouseHandler();
    }

    return this.callNextMethod();
});

//  ----------------------------------------------------------------------------

TP.lama.OutlineKeyResponder.Inst.defineHandler('DOM_Esc_Up',
function(aSignal) {
    TP.signal(TP.ANY, 'TP.sig.EndOutlineMode');
});

//  ----------------------------------------------------------------------------

TP.lama.OutlineKeyResponder.Inst.defineHandler('DOM_Meta_Up',
function(aSignal) {

    var outliner;

    outliner = TP.bySystemId('LamaOutliner');

    outliner.resetVisualizationParameters();
    outliner.updateTargetElementStyle();
    outliner.updateOutlinedDescendantStyle();
});

//  ----------------------------------------------------------------------------

TP.lama.OutlineKeyResponder.Inst.defineHandler('DOM_Shift_Up',
function(aSignal) {
    TP.bySystemId('LamaOutliner').rotateInsertionPosition();
});

//  ----------------------------------------------------------------------------

TP.lama.OutlineKeyResponder.Inst.defineHandler('DOM_Add_Down',
function(aSignal) {

    TP.bySystemId('LamaOutliner').extrudeOut();

    aSignal.preventDefault();

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.OutlineKeyResponder.Inst.defineHandler('DOM_Subtract_Down',
function(aSignal) {

    TP.bySystemId('LamaOutliner').extrudeIn();

    aSignal.preventDefault();

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.OutlineKeyResponder.Inst.defineHandler('DOM_Ctrl_Down',
function(aSignal) {

    TP.bySystemId('LamaOutliner').activateMouseHandler();

    aSignal.preventDefault();

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.OutlineKeyResponder.Inst.defineHandler('DOM_Ctrl_Up',
function(aSignal) {

    TP.bySystemId('LamaOutliner').deactivateMouseHandler();

    aSignal.preventDefault();

    return this;
});

//  ----------------------------------------------------------------------------

TP.lama.OutlineKeyResponder.Inst.defineHandler('OutlineEnter',
function(aSignal) {

    /**
     * @method handleOutlineEnter
     * @summary Invoked when the receiver enters it's 'main state'.
     * @param {TP.sig.StateEnter} aSignal The signal that caused the state
     *     machine to enter a state that matches the receiver's 'main state'.
     * @returns {TP.lama.OutlineKeyResponder} The receiver.
     */

    var outliner,
        canvasTPDoc;

    this.observe(TP.core.Keyboard.getCurrentKeyboard(), 'TP.sig.DOM_Esc_Up');

    outliner = TP.bySystemId('LamaOutliner');

    //  NB: Do this first so that 'targetTPElement' is real.
    outliner.showOutliner();

    //  Observe mouse wheel signals from the target element's document.
    canvasTPDoc = outliner.get('targetTPElement').getDocument();
    outliner.observe(canvasTPDoc, 'TP.sig.DOMMouseWheel');

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.OutlineKeyResponder.Inst.defineHandler('OutlineExit',
function(aSignal) {

    /**
     * @method handleOutlineExit
     * @summary Invoked when the receiver exits it's 'main state'.
     * @param {TP.sig.StateExit} aSignal The signal that caused the state
     *     machine to exit a state that matches the receiver's 'main state'.
     * @returns {TP.lama.OutlineKeyResponder} The receiver.
     */

    var outliner,
        canvasTPDoc;

    this.ignore(TP.core.Keyboard.getCurrentKeyboard(), 'TP.sig.DOM_Esc_Up');

    outliner = TP.bySystemId('LamaOutliner');

    //  Ignore mouse wheel signals from the target element's document.
    canvasTPDoc = outliner.get('targetTPElement').getDocument();
    outliner.ignore(canvasTPDoc, 'TP.sig.DOMMouseWheel');

    outliner.hideOutliner();

    return this;
});

//  ========================================================================
//  TP.lama.outliner Signals
//  ========================================================================

TP.sig.Signal.defineSubtype('BeginOutlineMode');
TP.sig.Signal.defineSubtype('EndOutlineMode');
TP.sig.Signal.defineSubtype('LamaOutlinerToggle');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
