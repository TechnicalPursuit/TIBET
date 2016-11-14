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
 * @type {TP.sherpa.extruder}
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('sherpa.extruder');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineAttribute('$wasActive');

TP.sherpa.extruder.Inst.defineAttribute('$mouseHandler');

TP.sherpa.extruder.Inst.defineAttribute('$currentDNDTarget');

TP.sherpa.extruder.Inst.defineAttribute('$extruderStyleElement');
TP.sherpa.extruder.Inst.defineAttribute('$extrudedDescendantsRule');

TP.sherpa.extruder.Inst.defineAttribute('$containingBlockElem');

TP.sherpa.extruder.Inst.defineAttribute('isActive');

TP.sherpa.extruder.Inst.defineAttribute('xRotation');
TP.sherpa.extruder.Inst.defineAttribute('yRotation');
TP.sherpa.extruder.Inst.defineAttribute('spread');
TP.sherpa.extruder.Inst.defineAttribute('scale');

TP.sherpa.extruder.Inst.defineAttribute('insertionPosition');

TP.sherpa.extruder.Inst.defineAttribute('targetTPElem');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.core.Sherpa} The receiver.
     */

    var consoleService,
        consoleGUI,

        currentKeyboard,
        extrudeResponder,

        keyboardSM;

    this.callNextMethod();

    this.set('isActive', false);

    this.resetVisualizationParameters();

    consoleService = TP.bySystemId('SherpaConsoleService');
    consoleGUI = consoleService.get('$consoleGUI');

    currentKeyboard = TP.core.Keyboard.getCurrentKeyboard();

    (function(aSignal) {
        TP.signal(TP.ANY, 'TP.sig.BeginExtrudeMode');
    }).observe(currentKeyboard, 'TP.sig.DOM_Ctrl_E_Up');

    keyboardSM = consoleService.get('keyboardStateMachine');

    keyboardSM.defineState(
                'normal',
                'extrude',
                {trigger: TP.ac(TP.ANY, 'TP.sig.BeginExtrudeMode')});

    keyboardSM.defineState(
                'extrude',
                'normal',
                {trigger: TP.ac(TP.ANY, 'TP.sig.EndExtrudeMode')});

    extrudeResponder = TP.sherpa.ExtrudeKeyResponder.construct();
    extrudeResponder.set('$consoleService', consoleService);
    extrudeResponder.set('$consoleGUI', consoleGUI);

/*
    keyboardSM.defineHandler('ExtrudeInput', function(aSignal) {
        var triggerSignal;

        triggerSignal = aSignal.getPayload().at('trigger');


    if (aSignal.getSignalName() ===
            'TP.sig.DOM_Shift_Up__TP.sig.DOM_Shift_Up') {
        this[TP.composeHandlerName('DOMShiftUp__DOMShiftUp')](aSignal);
    } else {


        if (normalResponder.isSpecialSignal(triggerSignal)) {
            normalResponder.handle(triggerSignal);
        }

        aSignal.shouldStop(true);

        return;
    });
*/

    extrudeResponder.addStateMachine(keyboardSM);
    extrudeResponder.addInputState('extrude');

    this.observe(TP.ANY, TP.ac('TP.sig.DOMDNDInitiate',
                                'TP.sig.DOMDNDTerminate'));

    this.observe(TP.ANY, 'TP.sig.ToggleExtrudeMode');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineMethod('activateMouseHandler',
function() {

    var topLevelElem,
        doc,
        handler,

        thisArg,

        lastMouseMoveEvent,
        initialMousePosition,

        initialX,
        initialY,

        mouse;

    topLevelElem = TP.unwrap(this.get('targetTPElem'));

    doc = TP.nodeGetDocument(topLevelElem);

    thisArg = this;

    lastMouseMoveEvent = TP.core.Mouse.get('lastMove');
    initialMousePosition = TP.eventGetPageXY(lastMouseMoveEvent);

    initialX = initialMousePosition.at(0);
    initialY = initialMousePosition.at(1);

    mouse = {};
    mouse.start = {x: initialX, y: initialY};

    function forward(v1, v2) {
        return v1 >= v2 ? true : false;
    }

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

        computedX = thisArg.get('xRotation') +
                    parseInt((mouse.start.y - currentY) / scaleFactor, 10);

        computedY = thisArg.get('yRotation') -
                    parseInt((mouse.start.x - currentX) / scaleFactor, 10);

        thisArg.set('xRotation', computedX);
        thisArg.set('yRotation', computedY);

        thisArg.updateTargetElementStyle();

        mouse.last.x = currentX;
        mouse.last.y = currentY;
    };

    doc.addEventListener('mousemove', handler, true);

    this.set('$mouseHandler', handler);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineMethod('deactivateMouseHandler',
function() {

    var topLevelElem,
        doc,
        handler;

    if (TP.isCallable(handler = this.get('$mouseHandler'))) {

        topLevelElem = TP.unwrap(this.get('targetTPElem'));

        doc = TP.nodeGetDocument(topLevelElem);

        doc.removeEventListener('mousemove', handler, true);

        this.set('$mouseHandler', null);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineMethod('extrude',
function() {

    var win,
        doc,
        body,

        extruderStyleElement,

        descendantRule;

    win = TP.sys.getUICanvas().getNativeWindow();
    doc = win.document;

    body = doc.body;

    this.resetVisualizationParameters();

    this.set('targetTPElem', TP.wrap(body));

    this.setupTargetElement();

    extruderStyleElement = this.get('$extruderStyleElement');

    if (!TP.isElement(extruderStyleElement)) {

        extruderStyleElement = TP.documentAddCSSElement(
            doc,
            TP.uc('~TP.sherpa.extruder/TP.sherpa.extruder.css').getLocation(),
            true);

        extruderStyleElement[TP.GENERATED] = true;

        this.set('$extruderStyleElement', extruderStyleElement);

        descendantRule = TP.styleSheetGetStyleRulesMatching(
                                extruderStyleElement.sheet,
                                '.extruded *');

        this.set('$extrudedDescendantsRule', descendantRule.first());
    } else {
        extruderStyleElement.disabled = false;
    }

    this.updateTargetElementStyle();
    this.updateExtrudedDescendantStyle();

    this.set('isActive', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineMethod('extrudeIn',
function() {

    this.set('spread', this.get('spread') - 5);
    this.updateExtrudedDescendantStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineMethod('extrudeOut',
function() {

    this.set('spread', this.get('spread') + 5);
    this.updateExtrudedDescendantStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineMethod('rotateDown',
function() {

    this.set('xRotation', this.get('xRotation') - 5);
    this.updateTargetElementStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineMethod('rotateLeft',
function() {

    this.set('yRotation', this.get('yRotation') - 5);
    this.updateTargetElementStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineMethod('rotateRight',
function() {

    this.set('yRotation', this.get('yRotation') + 5);
    this.updateTargetElementStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineMethod('rotateUp',
function() {

    this.set('xRotation', this.get('xRotation') + 5);
    this.updateTargetElementStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineMethod('setupTargetElement',
function() {

    var topLevelElem,
        prevValue,

        labelStr;

    topLevelElem = TP.unwrap(this.get('targetTPElem'));

    prevValue = TP.elementPopStyleProperty(topLevelElem, 'transform');

    //  NB: We use isValid(), not isEmpty(), here since an empty String is a
    //  valid CSS value.
    if (TP.isValid(prevValue)) {
        TP.elementSetStyleProperty(topLevelElem, 'transform', prevValue);
    }

    TP.elementAddClass(topLevelElem, 'extruded');

    TP.elementSetAttribute(topLevelElem, 'dnd:accept', 'tofu', true);

    this.observe(this.get('targetTPElem'),
                    TP.ac('TP.sig.DOMDNDTargetOver',
                            'TP.sig.DOMDNDTargetOut'));

    labelStr = function(anElement) {

        var tagName;

        tagName = TP.elementGetAttribute(anElement, 'tibet:tag', true);
        if (TP.isEmpty(tagName)) {
            tagName = anElement.tagName;
        }

        return tagName;
    };

    TP.elementSetAttribute(topLevelElem,
                            'tagname',
                            labelStr(topLevelElem),
                            true);

    TP.elementSetAttribute(topLevelElem,
                            'position',
                            this.get('insertionPosition'),
                            true);

    TP.nodeDescendantElementsPerform(
                    topLevelElem,
                    function(anElement) {

                        TP.elementSetAttribute(
                                        anElement,
                                        'tagname',
                                        labelStr(anElement),
                                        true);
                    });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineMethod('setInsertionPosition',
function(aPosition) {

    var topLevelElem;

    this.$set('insertionPosition', aPosition);

    topLevelElem = TP.unwrap(this.get('targetTPElem'));

    if (TP.isElement(topLevelElem)) {
        TP.elementSetAttribute(topLevelElem, 'position', aPosition, true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineMethod('updateExtrudedDescendantStyle',
function() {

    this.get('$extrudedDescendantsRule').style.transform =
                'translate3d(0px, 0px, ' + this.get('spread') + 'px)';

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineMethod('updateTargetElementStyle',
function() {

    var xRotation,
        yRotation,

        scale,

        topLevelElem;

    xRotation = this.get('xRotation');
    yRotation = this.get('yRotation');

    scale = this.get('scale');

    topLevelElem = TP.unwrap(this.get('targetTPElem'));

    TP.elementGetStyleObj(topLevelElem).transform =
        ' rotateX(' + xRotation + 'deg)' +
        ' rotateY(' + yRotation + 'deg)' +
        ' scale(' + scale  + ')';

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineHandler('DOMDNDInitiate',
function(aSignal) {

    var breadcrumbTPElem,
        isActive;

    breadcrumbTPElem = TP.byId('SherpaBreadcrumb', TP.win('UIROOT'));
    breadcrumbTPElem.setAttribute('hidden', false);

    isActive = this.get('isActive');
    this.set('$wasActive', isActive);

    if (!isActive) {
        TP.signal(TP.ANY, 'TP.sig.BeginExtrudeMode');
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineHandler('DOMDNDTargetOver',
function(aSignal) {

    var targetTPElem,
        targetElem,

        containingBlockElem,

        breadcrumbTPElem;

    targetTPElem = aSignal.getDOMTarget();
    targetElem = TP.unwrap(targetTPElem);

    this.set('$currentDNDTarget', targetElem);

    TP.elementAddClass(targetElem, 'sherpa_droptarget');

    if (TP.elementIsPositioned(targetElem)) {
        containingBlockElem = targetElem;
    } else {
        containingBlockElem = TP.elementGetContainingBlockElement(targetElem);
    }
    this.set('$containingBlockElem', containingBlockElem);

    TP.elementAddClass(containingBlockElem, 'sherpa_containingblock');

    breadcrumbTPElem = TP.byId('SherpaBreadcrumb', TP.win('UIROOT'));
    breadcrumbTPElem.set('value', TP.wrap(targetElem));

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineHandler('DOMDNDTargetOut',
function(aSignal) {

    var targetTPElem,
        targetElem,

        containingBlockElem,

        breadcrumbTPElem;

    targetTPElem = aSignal.getDOMTarget();
    targetElem = TP.unwrap(targetTPElem);

    this.set('$currentDNDTarget', null);

    TP.elementRemoveClass(targetElem, 'sherpa_droptarget');

    containingBlockElem = this.get('$containingBlockElem');
    TP.elementRemoveClass(containingBlockElem, 'sherpa_containingblock');
    this.set('$containingBlockElem', null);

    breadcrumbTPElem = TP.byId('SherpaBreadcrumb', TP.win('UIROOT'));
    breadcrumbTPElem.set('value', null);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineHandler('DOMDNDTerminate',
function(aSignal) {

    //  This method will be called if we were active *before* the drag and drop
    //  sequence began.

    //  If we weren't active before the drag and drop sequence began, the
    //  dispenser will have sent a TP.sig.EndExtrudeMode signal, which causes us
    //  to ignore() this signal, but it will call processDNDTermination()
    //  manually.

    var breadcrumbTPElem,
        wasActive;

    breadcrumbTPElem = TP.byId('SherpaBreadcrumb', TP.win('UIROOT'));
    breadcrumbTPElem.setAttribute('hidden', true);

    wasActive = this.get('$wasActive');

    if (!wasActive) {
        TP.signal(TP.ANY, 'TP.sig.EndExtrudeMode');
    }

    this.processDNDTermination(aSignal);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineHandler('DOMMouseWheel',
function(aSignal) {

    /**
     * @method handleDOMMouseWheel
     * @param {TP.sig.DOMMouseWheel} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.extruder} The receiver.
     */

    var delta,
        scale;

    aSignal.preventDefault();

    delta = aSignal.getWheelDelta();

    if (delta === 0) {
        return this;
    }

    scale = this.get('scale');

    scale += delta > 0 ? 0.1 : -0.1;
    scale = scale.abs();

    this.set('scale', scale);

    this.updateTargetElementStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineHandler('ToggleExtrudeMode',
function(aSignal) {

    /**
     * @method handleToggleExtrudeMode
     * @param {TP.sig.ToggleExtruder} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.extruder} The receiver.
     */

    if (this.get('isActive')) {
        TP.signal(null, 'TP.sig.EndExtrudeMode');
    } else {
        TP.signal(null, 'TP.sig.BeginExtrudeMode');
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineMethod('processDNDTermination',
function(aSignal) {

    var targetElem,

        containingBlockElem,

        breadcrumbTPElem;

    targetElem = this.get('$currentDNDTarget');

    if (TP.isElement(targetElem)) {

        TP.elementRemoveClass(targetElem, 'sherpa_droptarget');
        this.set('$currentDNDTarget', null);

        //  We delay this by 100ms to allow the GUI to update after the drop.
        (function() {
            TP.prompt('Please type in a tag name: ').then(
                function(retVal) {

                    var tagName,

                        targetTPElem,
                        newTPElem;

                    if (TP.isEmpty(retVal)) {
                        return;
                    }

                    tagName = retVal;
                    if (!TP.regex.HAS_COLON.test(tagName)) {
                        tagName = 'html:' + tagName;
                    }

                    targetTPElem = TP.wrap(targetElem);
                    newTPElem = targetTPElem.insertContent(
                                        '<' + tagName + '/>',
                                        this.get('insertionPosition'));

                    this.signal('ExtruderDOMInsert',
                                TP.hc('insertedTPElem', newTPElem));

                }.bind(this));
        }.bind(this)).fork(100);
    }

    containingBlockElem = this.get('$containingBlockElem');

    if (TP.isElement(containingBlockElem)) {
        TP.elementRemoveClass(containingBlockElem, 'sherpa_containingblock');
        this.set('$containingBlockElem', null);
    }

    breadcrumbTPElem = TP.byId('SherpaBreadcrumb', TP.win('UIROOT'));
    breadcrumbTPElem.set('value', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineMethod('resetVisualizationParameters',
function() {

    this.set('insertionPosition', TP.BEFORE_END);

    this.set('xRotation', 0);
    this.set('yRotation', 0);

    this.set('spread', 50);

    this.set('scale', 1);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineMethod('teardownTargetElement',
function() {

    var topLevelElem;

    topLevelElem = TP.unwrap(this.get('targetTPElem'));

    this.ignore(this.get('targetTPElem'),
                    TP.ac('TP.sig.DOMDNDTargetOver',
                            'TP.sig.DOMDNDTargetOut'));

    this.ignore(TP.ANY, 'TP.sig.DOMDNDTerminate');

    TP.elementSetStyleProperty(topLevelElem, 'transform', '');

    TP.elementRemoveClass(topLevelElem, 'extruded');

    TP.elementRemoveAttribute(topLevelElem, 'tibet:ctrl');
    TP.elementRemoveAttribute(topLevelElem, 'dnd:accept');

    TP.elementRemoveAttribute(topLevelElem, 'tagname', true);

    TP.elementRemoveAttribute(topLevelElem, 'position', true);

    TP.nodeDescendantElementsPerform(
                    topLevelElem,
                    function(anElement) {

                        TP.elementRemoveAttribute(anElement, 'tagname', true);
                    });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.extruder.Inst.defineMethod('unextrude',
function() {

    this.teardownTargetElement();

    this.get('$extruderStyleElement').disabled = true;

    this.set('targetTPElem', null);

    this.set('isActive', false);

    return this;
});

//  ========================================================================
//  TP.sherpa.ExtrudeKeyResponder
//  ========================================================================

TP.sherpa.NormalKeyResponder.defineSubtype('ExtrudeKeyResponder');

//  ----------------------------------------------------------------------------

TP.sherpa.ExtrudeKeyResponder.Inst.defineHandler('DOMKeySignal',
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
     * @returns {TP.core.NormalKeyResponder} The receiver.
     */

    var keyName;

    keyName = aSignal.getKeyName();

    if (keyName !== 'DOM_Shift_Down') {
        TP.bySystemId('SherpaExtruder').deactivateMouseHandler();
    }

    return this.callNextMethod();
});

//  ----------------------------------------------------------------------------

TP.sherpa.ExtrudeKeyResponder.Inst.defineHandler('DOM_Esc_Up',
function(aSignal) {
    TP.signal(TP.ANY, 'TP.sig.EndExtrudeMode');
});

//  ----------------------------------------------------------------------------

TP.sherpa.ExtrudeKeyResponder.Inst.defineHandler('ExtrudeEnter',
function(aSignal) {

    /**
     * @method handleExtrudeEnter
     * @summary Invoked when the receiver enters it's 'main state'.
     * @param {TP.sig.StateEnter} aSignal The signal that caused the state
     *     machine to enter a state that matches the receiver's 'main state'.
     * @returns {TP.core.ExtrudeKeyResponder} The receiver.
     */

    var extruder;

    this.observe(TP.core.Keyboard.getCurrentKeyboard(), 'TP.sig.DOM_Esc_Up');

    extruder = TP.bySystemId('SherpaExtruder');

    extruder.observe(TP.core.Mouse, 'TP.sig.DOMMouseWheel');
    extruder.extrude();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.ExtrudeKeyResponder.Inst.defineHandler('ExtrudeExit',
function(aSignal) {

    /**
     * @method handleExtrudeExit
     * @summary Invoked when the receiver exits it's 'main state'.
     * @param {TP.sig.StateExit} aSignal The signal that caused the state
     *     machine to exit a state that matches the receiver's 'main state'.
     * @returns {TP.sherpa.ExtrudeKeyResponder} The receiver.
     */

    var extruder;

    this.ignore(TP.core.Keyboard.getCurrentKeyboard(), 'TP.sig.DOM_Esc_Up');

    extruder = TP.bySystemId('SherpaExtruder');

    extruder.ignore(TP.core.Mouse, 'TP.sig.DOMMouseWheel');
    extruder.unextrude();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.ExtrudeKeyResponder.Inst.defineHandler('DOM_Right_Down',
function(aSignal) {

    TP.bySystemId('SherpaExtruder').set('insertionPosition', TP.AFTER_END);

    aSignal.preventDefault();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.ExtrudeKeyResponder.Inst.defineHandler('DOM_Right_Up',
function(aSignal) {

    TP.bySystemId('SherpaExtruder').set('insertionPosition', TP.BEFORE_END);

    aSignal.preventDefault();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.ExtrudeKeyResponder.Inst.defineHandler('DOM_Left_Down',
function(aSignal) {

    TP.bySystemId('SherpaExtruder').set('insertionPosition', TP.BEFORE_BEGIN);

    aSignal.preventDefault();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.ExtrudeKeyResponder.Inst.defineHandler('DOM_Left_Up',
function(aSignal) {

    TP.bySystemId('SherpaExtruder').set('insertionPosition', TP.BEFORE_END);

    aSignal.preventDefault();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.ExtrudeKeyResponder.Inst.defineHandler('DOM_Up_Down',
function(aSignal) {

    TP.bySystemId('SherpaExtruder').set('insertionPosition', TP.AFTER_BEGIN);

    aSignal.preventDefault();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.ExtrudeKeyResponder.Inst.defineHandler('DOM_Up_Up',
function(aSignal) {

    TP.bySystemId('SherpaExtruder').set('insertionPosition', TP.BEFORE_END);

    aSignal.preventDefault();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.ExtrudeKeyResponder.Inst.defineHandler('DOM_Add_Down',
function(aSignal) {

    TP.bySystemId('SherpaExtruder').extrudeOut();

    aSignal.preventDefault();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.ExtrudeKeyResponder.Inst.defineHandler('DOM_Subtract_Down',
function(aSignal) {

    TP.bySystemId('SherpaExtruder').extrudeIn();

    aSignal.preventDefault();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.ExtrudeKeyResponder.Inst.defineHandler('DOM_Shift_Down',
function(aSignal) {

    TP.bySystemId('SherpaExtruder').activateMouseHandler();

    aSignal.preventDefault();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.ExtrudeKeyResponder.Inst.defineHandler('DOM_Shift_Up',
function(aSignal) {

    TP.bySystemId('SherpaExtruder').deactivateMouseHandler();

    aSignal.preventDefault();

    return this;
});

//  ========================================================================
//  TP.sherpa.extruder Signals
//  ========================================================================

TP.sig.Signal.defineSubtype('BeginExtrudeMode');
TP.sig.Signal.defineSubtype('EndExtrudeMode');
TP.sig.Signal.defineSubtype('ToggleExtrudeMode');

TP.sig.Signal.defineSubtype('ExtruderDOMInsert');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
