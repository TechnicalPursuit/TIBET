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
 * @type {TP.sherpa.outliner}
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('sherpa.outliner');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineAttribute('$wasActive');

TP.sherpa.outliner.Inst.defineAttribute('$mouseHandler');

TP.sherpa.outliner.Inst.defineAttribute('$currentDNDTarget');

TP.sherpa.outliner.Inst.defineAttribute('$hudOutlinerDescendantsRule');

TP.sherpa.outliner.Inst.defineAttribute('$containingBlockElem');

TP.sherpa.outliner.Inst.defineAttribute('$alteredTargetStyle');
TP.sherpa.outliner.Inst.defineAttribute('$oldDisplayVal');

TP.sherpa.outliner.Inst.defineAttribute('isActive');

TP.sherpa.outliner.Inst.defineAttribute('xRotation');
TP.sherpa.outliner.Inst.defineAttribute('yRotation');
TP.sherpa.outliner.Inst.defineAttribute('spread');
TP.sherpa.outliner.Inst.defineAttribute('scale');

TP.sherpa.outliner.Inst.defineAttribute('insertionPosition');

TP.sherpa.outliner.Inst.defineAttribute('targetTPElement');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.sherpa.outliner} The receiver.
     */

    var consoleService,
        consoleGUI,

        currentKeyboard,
        outlineresponder,

        keyboardSM;

    this.callNextMethod();

    //  Important to set this before proceeding. Some of the initialization
    //  machinery wants to refer back to this object.
    this.setID('SherpaOutliner');
    TP.sys.registerObject(this);

    this.set('isActive', false);

    //  Reset our visualization parameters all back to their starting values.
    this.resetVisualizationParameters();

    consoleService = TP.bySystemId('SherpaConsoleService');
    consoleGUI = consoleService.get('$consoleGUI');

    currentKeyboard = TP.core.Keyboard.getCurrentKeyboard();

    (function(aSignal) {
        this.signal('TP.sig.BeginOutlineMode');
    }).observe(currentKeyboard, 'TP.sig.DOM_Ctrl_E_Up');

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

    outlineresponder = TP.sherpa.OutlineKeyResponder.construct();
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

    this.observe(TP.byId('SherpaHUD', TP.win('UIROOT')),
                    'ClosedChange');

    this.observe(TP.ANY, TP.ac('TP.sig.DOMDNDInitiate',
                                'TP.sig.DOMDNDCompleted'));

    this.observe(TP.ANY, 'TP.sig.SherpaOutlinerToggle');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('activateMouseHandler',
function() {

    /**
     * @method activateMouseHandler
     * @summary Installs the mouse handler on the  target element's document for
     *     rotation and zooming purposes.
     * @returns {TP.sherpa.outliner} The receiver.
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

TP.sherpa.outliner.Inst.defineMethod('deactivateMouseHandler',
function() {

    /**
     * @method deactivateMouseHandler
     * @summary Uninstalls any mouse handler installed on the target element's
     *     document for rotation and zooming purposes.
     * @returns {TP.sherpa.outliner} The receiver.
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

TP.sherpa.outliner.Inst.defineMethod('extrudeIn',
function() {

    /**
     * @method extrudeIn
     * @summary Decreases the amount of extrusion in our '3D' view.
     * @returns {TP.sherpa.outliner} The receiver.
     */

    this.set('spread', this.get('spread') - 5);

    //  Update both the target element and it's descendants style.
    this.updateOutlinedDescendantStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('extrudeOut',
function() {

    /**
     * @method extrudeOut
     * @summary Increases the amount of extrusion in our '3D' view.
     * @returns {TP.sherpa.outliner} The receiver.
     */

    this.set('spread', this.get('spread') + 5);

    //  Update both the target element and it's descendants style.
    this.updateOutlinedDescendantStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('getXRotation',
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

TP.sherpa.outliner.Inst.defineMethod('getYRotation',
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

TP.sherpa.outliner.Inst.defineHandler('ClosedChange',
function(aSignal) {

    /**
     * @method handleClosedChange
     * @summary Handles notifications of HUD closed change signals.
     * @param {TP.sig.ClosedChange} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.outliner} The receiver.
     */

    var hud,
        hudIsHidden,

        isActive;

    //  Grab the HUD and see if it's currently open or closed.
    hud = TP.byId('SherpaHUD', TP.win('UIROOT'));
    hudIsHidden = TP.bc(hud.getAttribute('closed'));

    isActive = this.get('isActive');

    //  If the HUD is hidden, then we deactivate ourself. But not before
    //  capturing whether we were 'currently active' or not (i.e. the HUD can
    //  hide or show independent of us). Otherwise, if the HUD is showing, then
    //  we set ourself to whatever value we had when the HUD last hid.
    if (hudIsHidden) {
        if (isActive) {
            this.signal('TP.sig.EndOutlineMode');
        }
    } else {
        if (this.get('$wasActive')) {
            this.signal('TP.sig.BeginOutlineMode');
        }
    }

    this.set('$wasActive', isActive);

    return this;
}, {
    origin: 'SherpaHUD'
});

//  ----------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineHandler('DOMDNDInitiate',
function(aSignal) {

    /**
     * @method handleDOMDNDInitiate
     * @summary Handles when the drag and drop system initiates a dragging
     *     session.
     * @param {TP.sig.DOMDNDInitiate} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.outliner} The receiver.
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

TP.sherpa.outliner.Inst.defineHandler('DOMDNDTargetOver',
function(aSignal) {

    /**
     * @method handleDOMDNDTargetOver
     * @summary Handles when the drag and drop system enters a possible drop
     *     target.
     * @param {TP.sig.DOMDNDTargetOver} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.outliner} The receiver.
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

    sourceTPElem = TP.core.UIElementNode.get('currentDNDSource');
    vendType = sourceTPElem.getAttribute('dnd:vend');

    switch (vendType) {
        case 'breadcrumb':
        case 'tofu':

            break;

        case 'dom_node':

            sourceTPElem = TP.byId('SherpaHalo', TP.win('UIROOT')).
                                                get('currentTargetTPElem');
            break;

        default:
            break;
    }

    hudTPElem = TP.byId('SherpaHUD', TP.win('UIROOT'));
    if (!dndTargetTPElem.hudCanDrop(hudTPElem, sourceTPElem)) {
        this.set('$currentDNDTarget', null);
        return this;
    }

    //  Set the native node of our current signal's "DOM target" as our current
    //  drop target.
    this.set('$currentDNDTarget', dndTargetElem);

    //  Put a CSS class on the current drop target element for visual
    //  highlighting purposes
    TP.elementAddClass(dndTargetElem, 'sherpa-outliner-droptarget');

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
    TP.elementAddClass(containingBlockElem, 'sherpa-outliner-containingblock');

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineHandler('DOMDNDTargetOut',
function(aSignal) {

    /**
     * @method handleDOMDNDTargetOut
     * @summary Handles when the drag and drop system exits a possible drop
     *     target.
     * @param {TP.sig.DOMDNDTargetOut} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.outliner} The receiver.
     */

    var dndTargetTPElem,
        dndTargetElem,

        containingBlockElem;

    dndTargetTPElem = aSignal.getDOMTarget();
    dndTargetElem = TP.unwrap(dndTargetTPElem);

    //  Remove the CSS class placed on the drop target and set the attribute we
    //  use to track the current DND target to null.
    TP.elementRemoveClass(dndTargetElem, 'sherpa-outliner-droptarget');
    this.set('$currentDNDTarget', null);

    //  Remove the containing block CSS class from the drop zone element that
    //  we're hovering over.
    containingBlockElem = this.get('$containingBlockElem');
    if (TP.isValid(containingBlockElem)) {
        TP.elementRemoveClass(
            containingBlockElem, 'sherpa-outliner-containingblock');
        this.set('$containingBlockElem', null);
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineHandler('DOMDNDCompleted',
function(aSignal) {

    /**
     * @method handleDOMDNDCompleted
     * @summary Handles when the drag and drop system completes a dragging
     *     session.
     * @param {TP.sig.DOMDNDCompleted} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.outliner} The receiver.
     */

    var targetTPElement,

        isActive,
        wasActive,

        dndTargetElem,

        dndSourceTPElem,
        vendType,

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
        TP.elementRemoveClass(dndTargetElem, 'sherpa-outliner-droptarget');
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
                    TP.wrap(dndTargetElem).sherpaDidInsertBreadcrumb(
                                            dndTargetElem,
                                            this.get('insertionPosition'));

                    break;

                case 'tofu':

                    //  Message the drop target that we dropped tofu into it
                    //  at the insertion position determined by the user.
                    TP.wrap(dndTargetElem).sherpaDidInsertTofu(
                                            dndTargetElem,
                                            this.get('insertionPosition'));

                    break;

                case 'dom_node':

                    //  Message the drop target that we dropped an existing DOM
                    //  node into it at the insertion position determined by the
                    //  user and that node should be reparented.
                    TP.wrap(dndTargetElem).sherpaDidReparentNode(
                                            dndTargetElem,
                                            this.get('insertionPosition'));

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
            containingBlockElem, 'sherpa-outliner-containingblock');
        this.set('$containingBlockElem', null);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineHandler('DOMMouseWheel',
function(aSignal) {

    /**
     * @method handleDOMMouseWheel
     * @param {TP.sig.DOMMouseWheel} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.outliner} The receiver.
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

TP.sherpa.outliner.Inst.defineHandler('HaloDidBlur',
function(aSignal) {

    /**
     * @method handleHaloDidBlur
     * @param {TP.sig.Toggleoutliner} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.outliner} The receiver.
     */

    var haloTargetTPElem,
        oldDisplayVal;

    haloTargetTPElem = aSignal.at('haloTarget');

    //  Remove the class on the current halo target that allowed us to apply
    //  'halo style' to it, even though the halo is hidden.
    haloTargetTPElem.removeClass('sherpa-outliner-haloed');

    if (this.get('$alteredTargetStyle')) {
        oldDisplayVal = this.get('$oldDisplayVal');
        haloTargetTPElem.setStyleProperty('display', oldDisplayVal);

        this.set('$oldDisplayVal', null);
        this.set('$alteredTargetStyle', false);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineHandler('HaloDidFocus',
function(aSignal) {

    /**
     * @method handleHaloDidFocus
     * @param {TP.sig.Toggleoutliner} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.outliner} The receiver.
     */

    var haloTargetTPElem,
        displayVal;

    haloTargetTPElem = aSignal.at('haloTarget');

    if (TP.isValid(haloTargetTPElem)) {
        //  Set a class on the current halo target that allows us to apply 'halo
        //  style' to it, even though the halo is hidden.
        haloTargetTPElem.addClass('sherpa-outliner-haloed');

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

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineHandler('MutationAttach',
function(aSignal) {

    /**
     * @method handleMutationAttach
     * @summary Handles notifications of node attachment from the current UI
     *     canvas.
     * @param {TP.sig.MutationAttach} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.outliner} The receiver.
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

    //  Add a 'sherpa-outliner-tagname' attribute on the target and all of its
    //  descendants. This is used by a CSS rule to display the tagname labels
    //  for each element in the outline.

    TP.elementSetAttribute(targetElement,
                            'sherpa-outliner-tagname',
                            labelStr(targetElement),
                            true);

    TP.nodeDescendantElementsPerform(
                    targetElement,
                    function(anElement) {

                        TP.elementSetAttribute(
                                        anElement,
                                        'sherpa-outliner-tagname',
                                        labelStr(anElement),
                                        true);
                    });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineHandler('MutationDetach',
function(aSignal) {

    /**
     * @method handleMutationDetach
     * @summary Handles notifications of node detachment from the overall canvas
     *     that the outliner is working with.
     * @param {TP.sig.MutationDetach} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.outliner} The receiver.
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

    //  Add a 'sherpa-outliner-tagname' attribute on the target and all of its
    //  descendants. This is used by a CSS rule to display the tagname labels
    //  for each element in the outline.

    TP.elementSetAttribute(targetElement,
                            'sherpa-outliner-tagname',
                            labelStr(targetElement),
                            true);

    TP.nodeDescendantElementsPerform(
                    targetElement,
                    function(anElement) {

                        TP.elementSetAttribute(
                                        anElement,
                                        'sherpa-outliner-tagname',
                                        labelStr(anElement),
                                        true);
                    });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineHandler('MutationStyleChange',
function(aSignal) {

    /**
     * @method handleMutationStyleChange
     * @summary Handles notifications of node style changes from the overall
     *     canvas that the outliner is working with.
     * @param {TP.sig.MutationStyleChange} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.outliner} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineHandler('SherpaOutlinerToggle',
function(aSignal) {

    /**
     * @method handleSherpaOutlinerToggle
     * @param {TP.sig.SherpaOutlinerToggle} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.outliner} The receiver.
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

TP.sherpa.outliner.Inst.defineMethod('hideOutliner',
function() {

    /**
     * @method hideOutliner
     * @summary Hides the outliner.
     * @returns {TP.sherpa.outliner} The receiver.
     */

    var canvasTPDoc,

        doc,
        outlinerStyleElement,

        haloTPElem,
        haloTargetTPElem,

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

    haloTPElem = TP.byId('SherpaHalo', TP.win('UIROOT'));
    haloTargetTPElem = haloTPElem.get('currentTargetTPElem');
    if (TP.isValid(haloTargetTPElem)) {
        //  Remove the class on the current halo target that allowed us to apply
        //  'halo style' to it, even though the halo is hidden.
        haloTargetTPElem.removeClass('sherpa-outliner-haloed');

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
    haloTPElem = TP.byId('SherpaHalo', TP.win('UIROOT'));
    haloTPElem.setTransform('');
    haloTPElem.setTransformOrigin('');

    haloTPElem.moveAndSizeToTarget(haloTPElem.get('currentTargetTPElem'));

    //  Ignore the halo for when it focuses and blurs. These observations were
    //  made when the outliner was shown.

    this.ignore(TP.byId('SherpaHalo', TP.win('UIROOT')),
                'TP.sig.HaloDidFocus');
    this.ignore(TP.byId('SherpaHalo', TP.win('UIROOT')),
                'TP.sig.HaloDidBlur');

    //  Null out the target element.
    this.set('targetTPElement', null);

    //  We are now officially inactive.
    this.set('isActive', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('resetVisualizationParameters',
function() {

    /**
     * @method resetVisualizationParameters
     * @summary Resets all of the visualization parameters to their default
     *     value.
     * @returns {TP.sherpa.outliner} The receiver.
     */

    this.set('insertionPosition', TP.BEFORE_END);

    this.set('xRotation', 0);
    this.set('yRotation', 0);

    this.set('spread', 50);

    this.set('scale', 1);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('rotateInsertionPosition',
function() {

    /**
     * @method rotateInsertionPosition
     * @summary Rotates the insertion position amongst the 4 values following
     *     the pattern of: TP.BEFORE_BEGIN -> TP.AFTER_BEGIN -> TP.BEFORE_END ->
     *     TP.AFTER_END. This method then sets the insertion position to the
     *     next value.
     * @returns {TP.sherpa.outliner} The receiver.
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

TP.sherpa.outliner.Inst.defineMethod('rotateDown',
function() {

    /**
     * @method rotateDown
     * @summary Rotates the '3D extrusion' view 'down' along the X axis.
     * @returns {TP.sherpa.outliner} The receiver.
     */

    this.set('xRotation', this.get('xRotation') - 5);
    this.updateTargetElementStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('rotateLeft',
function() {

    /**
     * @method rotateLeft
     * @summary Rotates the '3D extrusion' view 'left' along the Y axis.
     * @returns {TP.sherpa.outliner} The receiver.
     */

    this.set('yRotation', this.get('yRotation') - 5);
    this.updateTargetElementStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('rotateRight',
function() {

    /**
     * @method rotateRight
     * @summary Rotates the '3D extrusion' view 'right' along the Y axis.
     * @returns {TP.sherpa.outliner} The receiver.
     */

    this.set('yRotation', this.get('yRotation') + 5);
    this.updateTargetElementStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('rotateUp',
function() {

    /**
     * @method rotateUp
     * @summary Rotates the '3D extrusion' view 'up' along the X axis.
     * @returns {TP.sherpa.outliner} The receiver.
     */

    this.set('xRotation', this.get('xRotation') + 5);
    this.updateTargetElementStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('setInsertionPosition',
function(aPosition) {

    /**
     * @method setInsertionPosition
     * @summary Sets the 'insertion position' of the drop target. This is the
     *     position that the insertion will be made at if it is dropped under
     *     the current conditions.
     * @param {Constant} aPosition The insertion position. This could be
     *     TP.BEFORE_BEGIN, TP.AFTER_BEGIN, TP.BEFORE_END, TP.AFTER_END.
     * @returns {TP.sherpa.outliner} The receiver.
     */

    this.$set('insertionPosition', aPosition);

    TP.byId('SherpaWorkbench', TP.win('UIROOT')).updateStatusbar(
            TP.hc('insertionPosition', aPosition));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('setupInjectedStyleSheet',
function() {

    /**
     * @method setupInjectedStyleSheet
     * @summary Set up the stylesheet that will be 'injected' into the UI canvas
     *     so that the outliner can affect visual changes in the UI canvas.
     * @returns {TP.sherpa.outliner} The receiver.
     */

    var doc,
        outlinerStyleElement,

        descendantRule;

    doc = TP.sys.uidoc(true);

    outlinerStyleElement = TP.byId('outliner_injected_generated', doc, false);

    if (!TP.isElement(outlinerStyleElement)) {

        outlinerStyleElement = TP.documentAddCSSElement(
            doc,
            TP.uc('~TP.sherpa.outliner/TP.sherpa.outliner_injected.css').
                getLocation(),
            true);

        TP.elementSetAttribute(
            outlinerStyleElement, 'id', 'outliner_injected_generated');

        //  Mark the sheet as 'TIBET_PRIVATE' so that it's style rules are not
        //  considered when the element's style rules are computed.
        outlinerStyleElement[TP.TIBET_PRIVATE] = true;

        //  Mark this element as one that was generated by TIBET and shouldn't
        //  be considered in CSS queries, etc.
        outlinerStyleElement[TP.GENERATED] = true;

        descendantRule = TP.styleSheetGetStyleRulesMatching(
                                outlinerStyleElement.sheet,
                                '.sherpa-outliner *');

        this.set('$hudOutlinerDescendantsRule', descendantRule.first());
    } else {
        outlinerStyleElement.disabled = false;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('setupTargetElement',
function() {

    /**
     * @method setupTargetElement
     * @summary Sets up the outliner-specific constructs that need to be placed
     *     on the target element or its descendants to allow the outliner to
     *     work.
     * @returns {TP.sherpa.outliner} The receiver.
     */

    var targetElement,
        prevValue,

        labelStr;

    targetElement = TP.unwrap(this.get('targetTPElement'));

    prevValue = TP.elementPopStyleProperty(targetElement, 'transform');

    //  NB: We use isValid(), not isEmpty(), here since an empty String is a
    //  valid CSS value.
    if (TP.isValid(prevValue)) {
        TP.elementSetStyleProperty(targetElement, 'transform', prevValue);
    }

    //  Add the top-level 'sherpa-outliner' class. This let's the rules in the
    //  injected style sheet work as they are qualified by this class.
    TP.elementAddClass(targetElement, 'sherpa-outliner');

    //  Enable DND by setting this attribute.
    TP.elementSetAttribute(targetElement,
                            'dnd:accept',
                            'tofu dom_node breadcrumb',
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

    //  Add a 'sherpa-outliner-tagname' attribute on the target and all of its
    //  descendants. This is used by a CSS rule to display the tagname labels
    //  for each element in the outline.

    TP.elementSetAttribute(targetElement,
                            'sherpa-outliner-tagname',
                            labelStr(targetElement),
                            true);

    TP.nodeDescendantElementsPerform(
                    targetElement,
                    function(anElement) {
                        TP.elementSetAttribute(
                                        anElement,
                                        'sherpa-outliner-tagname',
                                        labelStr(anElement),
                                        true);
                    });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('showOutliner',
function() {

    /**
     * @method showOutliner
     * @summary Shows the outliner.
     * @returns {TP.sherpa.outliner} The receiver.
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

    //  Inject the stylesheet that we need the canvas document to have to
    //  display the outlines (if it's not already there).
    this.setupInjectedStyleSheet();

    //  Update both the target element and it's descendants style.
    this.updateTargetElementStyle();
    this.updateOutlinedDescendantStyle();

    //  Grab the halo, move and size it to its own target and update its style
    //  to match what we need to display it properly.
    haloTPElem = TP.byId('SherpaHalo', TP.win('UIROOT'));

    //  Ask the halo to suspend any other object's attempt to show it.
    haloTPElem.suspendSettingOf('hidden');

    haloTargetTPElem = haloTPElem.get('currentTargetTPElem');
    if (TP.isValid(haloTargetTPElem)) {
        //  Set a class on the current halo target that allows us to apply 'halo
        //  style' to it, even though the halo is hidden.
        haloTargetTPElem.addClass('sherpa-outliner-haloed');

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

    this.observe(TP.byId('SherpaHalo', TP.win('UIROOT')),
                    'TP.sig.HaloDidFocus');
    this.observe(TP.byId('SherpaHalo', TP.win('UIROOT')),
                    'TP.sig.HaloDidBlur');

    //  We are now officially active.
    this.set('isActive', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('teardownTargetElement',
function() {

    /**
     * @method teardownTargetElement
     * @summary Tears down the outliner-specific constructs that were placed on
     *     the target element or its descendants to allow the outliner to work.
     * @returns {TP.sherpa.outliner} The receiver.
     */

    var targetElement;

    //  Grab the target element
    targetElement = TP.unwrap(this.get('targetTPElement'));

    //  Set it's transform back to ''
    TP.elementSetStyleProperty(targetElement, 'transform', '');

    //  Remove the top-level 'sherpa-outliner' class
    TP.elementRemoveClass(targetElement, 'sherpa-outliner');

    //  No longer need this attribute - no more DND here.
    TP.elementRemoveAttribute(targetElement, 'dnd:accept');

    //  Remove the 'sherpa-outliner-tagname' attribute on the target and all of
    //  its descendants. This is used by a CSS rule to display the tagname
    //  labels for each element in the outline.
    TP.elementRemoveAttribute(targetElement, 'sherpa-outliner-tagname', true);
    TP.nodeDescendantElementsPerform(
                    targetElement,
                    function(anElement) {
                        TP.elementRemoveAttribute(
                            anElement, 'sherpa-outliner-tagname', true);
                    });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('updateOutlinedDescendantStyle',
function() {

    /**
     * @method updateOutlinedDescendantStyle
     * @summary Updates the style governing the 'outlined' descendants of the
     *     target element to adjust properties such as the '3D spread' of
     *     elements.
     * @returns {TP.sherpa.outliner} The receiver.
     */

    this.get('$hudOutlinerDescendantsRule').style.transform =
                'translate3d(0px, 0px, ' + this.get('spread') + 'px)';

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('updateTargetElementStyle',
function() {

    /**
     * @method updateTargetElementStyle
     * @summary Updates the outliner's target element's style (the scale and
     *     transform that is currently displaying the outliner's projection).
     * @returns {TP.sherpa.outliner} The receiver.
     */

    var xRotation,
        yRotation,

        scale,

        targetTPElement;

    xRotation = this.get('xRotation');
    yRotation = this.get('yRotation');

    scale = this.get('scale');

    targetTPElement = this.get('targetTPElement');

    targetTPElement.setTransform(
        ' rotateX(' + xRotation + 'deg)' +
        ' rotateY(' + yRotation + 'deg)' +
        ' scale(' + scale + ')');

    return this;
});

//  ========================================================================
//  TP.sherpa.OutlineKeyResponder
//  ========================================================================

TP.sherpa.NormalKeyResponder.defineSubtype('OutlineKeyResponder');

//  ----------------------------------------------------------------------------

TP.sherpa.OutlineKeyResponder.Inst.defineHandler('DOMKeySignal',
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
     * @returns {TP.sherpa.OutlineKeyResponder} The receiver.
     */

    var keyName;

    keyName = aSignal.getKeyName();

    if (keyName !== 'DOM_Ctrl_Down') {
        TP.bySystemId('SherpaOutliner').deactivateMouseHandler();
    }

    return this.callNextMethod();
});

//  ----------------------------------------------------------------------------

TP.sherpa.OutlineKeyResponder.Inst.defineHandler('DOM_Esc_Up',
function(aSignal) {
    TP.signal(TP.ANY, 'TP.sig.EndOutlineMode');
});

//  ----------------------------------------------------------------------------

TP.sherpa.OutlineKeyResponder.Inst.defineHandler('DOM_Meta_Up',
function(aSignal) {

    var outliner;

    outliner = TP.bySystemId('SherpaOutliner');

    outliner.resetVisualizationParameters();
    outliner.updateTargetElementStyle();
    outliner.updateOutlinedDescendantStyle();
});

//  ----------------------------------------------------------------------------

TP.sherpa.OutlineKeyResponder.Inst.defineHandler('DOM_Shift_Up',
function(aSignal) {
    TP.bySystemId('SherpaOutliner').rotateInsertionPosition();
});

//  ----------------------------------------------------------------------------

TP.sherpa.OutlineKeyResponder.Inst.defineHandler('DOM_Add_Down',
function(aSignal) {

    TP.bySystemId('SherpaOutliner').extrudeOut();

    aSignal.preventDefault();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.OutlineKeyResponder.Inst.defineHandler('DOM_Subtract_Down',
function(aSignal) {

    TP.bySystemId('SherpaOutliner').extrudeIn();

    aSignal.preventDefault();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.OutlineKeyResponder.Inst.defineHandler('DOM_Ctrl_Down',
function(aSignal) {

    TP.bySystemId('SherpaOutliner').activateMouseHandler();

    aSignal.preventDefault();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.OutlineKeyResponder.Inst.defineHandler('DOM_Ctrl_Up',
function(aSignal) {

    TP.bySystemId('SherpaOutliner').deactivateMouseHandler();

    aSignal.preventDefault();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.OutlineKeyResponder.Inst.defineHandler('OutlineEnter',
function(aSignal) {

    /**
     * @method handleOutlineEnter
     * @summary Invoked when the receiver enters it's 'main state'.
     * @param {TP.sig.StateEnter} aSignal The signal that caused the state
     *     machine to enter a state that matches the receiver's 'main state'.
     * @returns {TP.sherpa.OutlineKeyResponder} The receiver.
     */

    var outliner,
        canvasTPDoc;

    this.observe(TP.core.Keyboard.getCurrentKeyboard(), 'TP.sig.DOM_Esc_Up');

    outliner = TP.bySystemId('SherpaOutliner');

    //  NB: Do this first so that 'targetTPElement' is real.
    outliner.showOutliner();

    //  Observe mouse wheel signals from the target element's document.
    canvasTPDoc = outliner.get('targetTPElement').getDocument();
    outliner.observe(canvasTPDoc, 'TP.sig.DOMMouseWheel');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.OutlineKeyResponder.Inst.defineHandler('OutlineExit',
function(aSignal) {

    /**
     * @method handleOutlineExit
     * @summary Invoked when the receiver exits it's 'main state'.
     * @param {TP.sig.StateExit} aSignal The signal that caused the state
     *     machine to exit a state that matches the receiver's 'main state'.
     * @returns {TP.sherpa.OutlineKeyResponder} The receiver.
     */

    var outliner,
        canvasTPDoc;

    this.ignore(TP.core.Keyboard.getCurrentKeyboard(), 'TP.sig.DOM_Esc_Up');

    outliner = TP.bySystemId('SherpaOutliner');

    //  Ignore mouse wheel signals from the target element's document.
    canvasTPDoc = outliner.get('targetTPElement').getDocument();
    outliner.ignore(canvasTPDoc, 'TP.sig.DOMMouseWheel');

    outliner.hideOutliner();

    return this;
});

//  ========================================================================
//  TP.sherpa.outliner Signals
//  ========================================================================

TP.sig.Signal.defineSubtype('BeginOutlineMode');
TP.sig.Signal.defineSubtype('EndOutlineMode');
TP.sig.Signal.defineSubtype('SherpaOutlinerToggle');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
