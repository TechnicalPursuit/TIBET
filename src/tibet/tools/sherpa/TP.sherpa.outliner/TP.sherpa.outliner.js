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

TP.sherpa.outliner.Inst.defineAttribute('$outlinerStyleElement');
TP.sherpa.outliner.Inst.defineAttribute('$outlinedDescendantsRule');

TP.sherpa.outliner.Inst.defineAttribute('$containingBlockElem');

TP.sherpa.outliner.Inst.defineAttribute('isActive');

TP.sherpa.outliner.Inst.defineAttribute('xRotation');
TP.sherpa.outliner.Inst.defineAttribute('yRotation');
TP.sherpa.outliner.Inst.defineAttribute('spread');
TP.sherpa.outliner.Inst.defineAttribute('scale');

TP.sherpa.outliner.Inst.defineAttribute('insertionPosition');

TP.sherpa.outliner.Inst.defineAttribute('topLevelTPElem');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.core.Sherpa} The receiver.
     */

    var consoleService,
        consoleGUI,

        currentKeyboard,
        outlineresponder,

        keyboardSM;

    this.callNextMethod();

    this.set('isActive', false);

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

    this.observe(TP.ANY, TP.ac('TP.sig.DOMDNDInitiate',
                                'TP.sig.DOMDNDTerminate'));

    this.observe(TP.ANY, 'TP.sig.SherpaOutlinerToggle');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('activateMouseHandler',
function() {

    var topLevelElem,
        doc,
        handler,

        thisref,

        lastMouseMoveEvent,
        initialMousePosition,

        initialX,
        initialY,

        mouse,

        forward;

    topLevelElem = TP.unwrap(this.get('topLevelTPElem'));

    doc = TP.nodeGetDocument(topLevelElem);

    thisref = this;

    lastMouseMoveEvent = TP.core.Mouse.get('lastMove');
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

        thisref.updateTargetElementStyle();
        thisref.updateHaloStyle();

        mouse.last.x = currentX;
        mouse.last.y = currentY;
    };

    doc.addEventListener('mousemove', handler, true);

    this.set('$mouseHandler', handler);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('deactivateMouseHandler',
function() {

    var topLevelElem,
        doc,
        handler;

    if (TP.isCallable(handler = this.get('$mouseHandler'))) {

        topLevelElem = TP.unwrap(this.get('topLevelTPElem'));

        doc = TP.nodeGetDocument(topLevelElem);

        doc.removeEventListener('mousemove', handler, true);

        this.set('$mouseHandler', null);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('extrudeIn',
function() {

    this.set('spread', this.get('spread') - 5);
    this.updateOutlinedDescendantStyle();
    this.updateHaloStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('extrudeOut',
function() {

    this.set('spread', this.get('spread') + 5);
    this.updateOutlinedDescendantStyle();
    this.updateHaloStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('getXRotation',
function() {

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

TP.sherpa.outliner.Inst.defineHandler('DOMDNDInitiate',
function(aSignal) {

    var isActive;

    isActive = this.get('isActive');
    this.set('$wasActive', isActive);

    if (!isActive) {
        this.signal('TP.sig.BeginOutlineMode');
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineHandler('DOMDNDTargetOver',
function(aSignal) {

    var targetTPElem,
        targetElem,

        containingBlockElem;

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

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineHandler('DOMDNDTargetOut',
function(aSignal) {

    var targetTPElem,
        targetElem,

        containingBlockElem;

    targetTPElem = aSignal.getDOMTarget();
    targetElem = TP.unwrap(targetTPElem);

    this.set('$currentDNDTarget', null);

    TP.elementRemoveClass(targetElem, 'sherpa_droptarget');

    containingBlockElem = this.get('$containingBlockElem');
    TP.elementRemoveClass(containingBlockElem, 'sherpa_containingblock');
    this.set('$containingBlockElem', null);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineHandler('DOMDNDTerminate',
function(aSignal) {

    //  This method will be called if we were active *before* the drag and drop
    //  sequence began.

    //  If we weren't active before the drag and drop sequence began, the
    //  dispenser will have sent a TP.sig.EndOutlineMode signal, which causes us
    //  to ignore() this signal, but it will call processDNDTermination()
    //  manually.

    var wasActive;

    wasActive = this.get('$wasActive');

    if (!wasActive) {
        this.signal('TP.sig.EndOutlineMode');
    }

    this.processDNDTermination(aSignal);

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

    delta = aSignal.getWheelDelta();

    if (delta === 0) {
        return this;
    }

    scale = this.get('scale');

    scale += delta > 0 ? 0.1 : -0.1;
    scale = scale.abs();

    this.set('scale', scale);

    this.updateTargetElementStyle();
    this.updateHaloStyle();

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

    var haloTPElem;

    haloTPElem = TP.byId('SherpaHalo', TP.win('UIROOT'));
    haloTPElem.setTransform('');
    haloTPElem.setTransformOrigin('');

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

    this.updateHaloStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineHandler('MutationDetach',
function(aSignal) {

    /**
     * @method handleMutationDetach
     * @summary Handles notifications of node detachment from the overall canvas
     *     that the halo is working with.
     * @param {TP.sig.MutationDetach} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.halo} The receiver.
     */

    var topLevelElem,

        labelStr;

    labelStr = function(anElement) {

        var tagName;

        tagName = TP.elementGetAttribute(anElement, 'tibet:tag', true);
        if (TP.isEmpty(tagName)) {
            tagName = anElement.tagName;
        }

        return tagName;
    };

    topLevelElem = TP.unwrap(this.get('topLevelTPElem'));

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

TP.sherpa.outliner.Inst.defineHandler('MutationStyleChange',
function(aSignal) {

    /**
     * @method handleMutationStyleChange
     * @summary Handles notifications of node style changes from the overall
     *     canvas that the halo is working with.
     * @param {TP.sig.MutationStyleChange} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.halo} The receiver.
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

    var canvasTPDoc,
        haloTPElem;

    canvasTPDoc = this.get('topLevelTPElem').getDocument();
    this.ignore(canvasTPDoc,
                TP.ac('TP.sig.MutationDetach',
                        'TP.sig.MutationStyleChange'));

    this.teardownTargetElement();

    this.get('$outlinerStyleElement').disabled = true;

    this.ignore(TP.byId('SherpaHalo', TP.win('UIROOT')),
                'TP.sig.HaloDidFocus');

    this.ignore(TP.byId('SherpaHalo', TP.win('UIROOT')),
                'TP.sig.HaloDidBlur');

    haloTPElem = TP.byId('SherpaHalo', TP.win('UIROOT'));
    haloTPElem.setTransform('');
    haloTPElem.setTransformOrigin('');

    haloTPElem.moveAndSizeToTarget(haloTPElem.get('currentTargetTPElem'));

    this.set('topLevelTPElem', null);

    this.set('isActive', false);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('processDNDTermination',
function(aSignal) {

    var targetElem,

        containingBlockElem;

    targetElem = this.get('$currentDNDTarget');

    if (TP.isElement(targetElem)) {

        TP.elementRemoveClass(targetElem, 'sherpa_droptarget');
        this.set('$currentDNDTarget', null);

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
                    TP.sys.setcfg('sherpa.autodefine_missing_tags', true);
                    newTPElem = targetTPElem.insertContent(
                                        '<' + tagName + '/>',
                                        this.get('insertionPosition'));
                    TP.sys.setcfg('sherpa.autodefine_missing_tags', false);

                    TP.unwrap(newTPElem)[TP.INSERTION_POSITION] =
                                            this.get('insertionPosition');

                    (function() {
                        this.signal('OutlinerDOMInsert',
                                    TP.hc('insertedTPElem', newTPElem));
                    }.bind(this)).queueForNextRepaint(TP.win('UIROOT'));

                }.bind(this));
        }.bind(this)).queueForNextRepaint(TP.win('UIROOT'));
    }

    containingBlockElem = this.get('$containingBlockElem');

    if (TP.isElement(containingBlockElem)) {
        TP.elementRemoveClass(containingBlockElem, 'sherpa_containingblock');
        this.set('$containingBlockElem', null);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('resetVisualizationParameters',
function() {

    this.set('insertionPosition', TP.BEFORE_END);

    this.set('xRotation', 0);
    this.set('yRotation', 0);

    this.set('spread', 50);

    this.set('scale', 1);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('rotateDown',
function() {

    this.set('xRotation', this.get('xRotation') - 5);
    this.updateTargetElementStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('rotateLeft',
function() {

    this.set('yRotation', this.get('yRotation') - 5);
    this.updateTargetElementStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('rotateRight',
function() {

    this.set('yRotation', this.get('yRotation') + 5);
    this.updateTargetElementStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('rotateUp',
function() {

    this.set('xRotation', this.get('xRotation') + 5);
    this.updateTargetElementStyle();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('setupTargetElement',
function() {

    var topLevelElem,
        prevValue,

        labelStr;

    topLevelElem = TP.unwrap(this.get('topLevelTPElem'));

    prevValue = TP.elementPopStyleProperty(topLevelElem, 'transform');

    //  NB: We use isValid(), not isEmpty(), here since an empty String is a
    //  valid CSS value.
    if (TP.isValid(prevValue)) {
        TP.elementSetStyleProperty(topLevelElem, 'transform', prevValue);
    }

    TP.elementAddClass(topLevelElem, 'outlined');

    TP.elementSetAttribute(topLevelElem, 'dnd:accept', 'tofu', true);

    this.observe(this.get('topLevelTPElem'),
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

TP.sherpa.outliner.Inst.defineMethod('setInsertionPosition',
function(aPosition) {

    var topLevelElem;

    this.$set('insertionPosition', aPosition);

    topLevelElem = TP.unwrap(this.get('topLevelTPElem'));

    if (TP.isElement(topLevelElem)) {
        TP.elementSetAttribute(topLevelElem, 'position', aPosition, true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('showOutliner',
function() {

    var canvasTPDoc,

        outlinerStyleElement,

        descendantRule,

        haloTPElem;

    canvasTPDoc = TP.sys.getUICanvas().getDocument();

    this.observe(canvasTPDoc,
                    TP.ac('TP.sig.MutationDetach',
                            'TP.sig.MutationStyleChange'));

    this.resetVisualizationParameters();

    this.set('topLevelTPElem', canvasTPDoc.getBody());

    this.setupTargetElement();

    outlinerStyleElement = this.get('$outlinerStyleElement');

    if (!TP.isElement(outlinerStyleElement)) {

        outlinerStyleElement = TP.documentAddCSSElement(
            canvasTPDoc.getNativeNode(),
            TP.uc('~TP.sherpa.outliner/TP.sherpa.outliner.css').getLocation(),
            true);

        //  Mark the sheet as 'TIBET_PRIVATE' so that it's style rules are not
        //  considered when the element's style rules are computed.
        outlinerStyleElement[TP.TIBET_PRIVATE] = true;

        this.set('$outlinerStyleElement', outlinerStyleElement);

        descendantRule = TP.styleSheetGetStyleRulesMatching(
                                outlinerStyleElement.sheet,
                                '.outlined *');

        this.set('$outlinedDescendantsRule', descendantRule.first());
    } else {
        outlinerStyleElement.disabled = false;
    }

    this.updateTargetElementStyle();
    this.updateOutlinedDescendantStyle();

    haloTPElem = TP.byId('SherpaHalo', TP.win('UIROOT'));
    haloTPElem.moveAndSizeToTarget(haloTPElem.get('currentTargetTPElem'));
    this.updateHaloStyle();

    this.observe(TP.byId('SherpaHalo', TP.win('UIROOT')),
                    'TP.sig.HaloDidFocus');

    this.observe(TP.byId('SherpaHalo', TP.win('UIROOT')),
                    'TP.sig.HaloDidBlur');

    this.set('isActive', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('teardownTargetElement',
function() {

    var topLevelElem;

    topLevelElem = TP.unwrap(this.get('topLevelTPElem'));

    this.ignore(this.get('topLevelTPElem'),
                    TP.ac('TP.sig.DOMDNDTargetOver',
                            'TP.sig.DOMDNDTargetOut'));

    this.ignore(TP.ANY, 'TP.sig.DOMDNDTerminate');

    TP.elementSetStyleProperty(topLevelElem, 'transform', '');

    TP.elementRemoveClass(topLevelElem, 'outlined');

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

TP.sherpa.outliner.Inst.defineMethod('updateOutlinedDescendantStyle',
function() {

    this.get('$outlinedDescendantsRule').style.transform =
                'translate3d(0px, 0px, ' + this.get('spread') + 'px)';

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('updateHaloStyle',
function() {

    var haloTPElem,

        topLevelElem,

        xRotation,
        yRotation,

        scale,
        spread,

        haloTargetElem,

        parent,
        depthCount,

        zVal,

        offsetX,
        offsetY,

        margins,
        outlineOffset,

        targetBox,
        transformOriginX,
        transformOriginY;

    haloTPElem = TP.byId('SherpaHalo', TP.win('UIROOT'));

    topLevelElem = TP.unwrap(this.get('topLevelTPElem'));
    if (!TP.isElement(topLevelElem)) {
        haloTPElem.setTransform('');
        haloTPElem.setTransformOrigin('');

        return this;
    }

    haloTargetElem = TP.unwrap(haloTPElem.get('currentTargetTPElem'));
    if (!TP.isElement(haloTargetElem)) {
        haloTPElem.setTransform('');
        haloTPElem.setTransformOrigin('');

        return this;
    }

    var topLevelTPElem;

    topLevelTPElem = this.get('topLevelTPElem');

    xRotation = this.get('xRotation');
    yRotation = this.get('yRotation');

    scale = this.get('scale');

    /*
    topLevelTPElem.setTransform(
        ' rotateX(' + 0 + 'deg)' +
        ' rotateY(' + 0 + 'deg)' +
        ' scale(' + 0 + ')');
    */

    haloTPElem.moveAndSizeToTarget(haloTPElem.get('currentTargetTPElem'));

    spread = this.get('spread');

    parent = haloTargetElem.parentNode;

    depthCount = 0;
    while (TP.isElement(parent)) {
        depthCount++;
        parent = parent.parentNode;
    }

    depthCount -= 1;

    /*
     * TODO: Fix the problem with the wrong spread on inline elements.
    if (!TP.XHTML_10_NONINLINE_ELEMENTS.at(haloTargetElem.tagName)) {
        zVal = spread * depthCount;
    }
    */

    zVal = spread * depthCount;

    offsetX = 0;
    offsetY = 0;

    outlineOffset = 2;

    if (topLevelElem === haloTargetElem) {
        offsetX = -outlineOffset;
        offsetY = -outlineOffset;
    } else {
        margins = TP.elementGetMarginInPixels(topLevelElem);
        offsetX = margins.at(3) - outlineOffset;
        offsetY = margins.at(0) - outlineOffset;
    }

    haloTPElem.setTransform(
        ' rotateX(' + xRotation + 'deg)' +
        ' rotateY(' + yRotation + 'deg)' +
        ' scale(' + scale + ')');
        //' translate3d(' + offsetX + 'px, ' + offsetY + 'px, ' + zVal + 'px)');

    targetBox = TP.elementGetBorderBox(haloTargetElem);
    transformOriginX = targetBox.at('left');
    transformOriginY = targetBox.at('top');

    //haloTPElem.setTransformOrigin(transformOriginX, transformOriginY);

    /*
    topLevelTPElem.setTransform(
        ' rotateX(' + xRotation + 'deg)' +
        ' rotateY(' + yRotation + 'deg)' +
        ' scale(' + scale + ')');
    */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.outliner.Inst.defineMethod('updateTargetElementStyle',
function() {

    var xRotation,
        yRotation,

        scale,

        topLevelTPElem;

    xRotation = this.get('xRotation');
    yRotation = this.get('yRotation');

    scale = this.get('scale');

    topLevelTPElem = this.get('topLevelTPElem');

    topLevelTPElem.setTransform(
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
     * @returns {TP.core.NormalKeyResponder} The receiver.
     */

    var keyName;

    keyName = aSignal.getKeyName();

    if (keyName !== 'DOM_Alt_Down') {
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

TP.sherpa.OutlineKeyResponder.Inst.defineHandler('OutlineEnter',
function(aSignal) {

    /**
     * @method handleOutlineEnter
     * @summary Invoked when the receiver enters it's 'main state'.
     * @param {TP.sig.StateEnter} aSignal The signal that caused the state
     *     machine to enter a state that matches the receiver's 'main state'.
     * @returns {TP.core.OutlineKeyResponder} The receiver.
     */

    var outliner;

    this.observe(TP.core.Keyboard.getCurrentKeyboard(), 'TP.sig.DOM_Esc_Up');

    outliner = TP.bySystemId('SherpaOutliner');

    outliner.observe(TP.core.Mouse, 'TP.sig.DOMMouseWheel');
    outliner.showOutliner();

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

    var outliner;

    this.ignore(TP.core.Keyboard.getCurrentKeyboard(), 'TP.sig.DOM_Esc_Up');

    outliner = TP.bySystemId('SherpaOutliner');

    outliner.ignore(TP.core.Mouse, 'TP.sig.DOMMouseWheel');
    outliner.hideOutliner();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.OutlineKeyResponder.Inst.defineHandler('DOM_Right_Down',
function(aSignal) {

    TP.bySystemId('SherpaOutliner').set('insertionPosition', TP.AFTER_END);

    aSignal.preventDefault();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.OutlineKeyResponder.Inst.defineHandler('DOM_Right_Up',
function(aSignal) {

    TP.bySystemId('SherpaOutliner').set('insertionPosition', TP.BEFORE_END);

    aSignal.preventDefault();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.OutlineKeyResponder.Inst.defineHandler('DOM_Left_Down',
function(aSignal) {

    TP.bySystemId('SherpaOutliner').set('insertionPosition', TP.BEFORE_BEGIN);

    aSignal.preventDefault();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.OutlineKeyResponder.Inst.defineHandler('DOM_Left_Up',
function(aSignal) {

    TP.bySystemId('SherpaOutliner').set('insertionPosition', TP.BEFORE_END);

    aSignal.preventDefault();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.OutlineKeyResponder.Inst.defineHandler('DOM_Up_Down',
function(aSignal) {

    TP.bySystemId('SherpaOutliner').set('insertionPosition', TP.AFTER_BEGIN);

    aSignal.preventDefault();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.OutlineKeyResponder.Inst.defineHandler('DOM_Up_Up',
function(aSignal) {

    TP.bySystemId('SherpaOutliner').set('insertionPosition', TP.BEFORE_END);

    aSignal.preventDefault();

    return this;
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

TP.sherpa.OutlineKeyResponder.Inst.defineHandler('DOM_Alt_Down',
function(aSignal) {

    TP.bySystemId('SherpaOutliner').activateMouseHandler();

    aSignal.preventDefault();

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.OutlineKeyResponder.Inst.defineHandler('DOM_Alt_Up',
function(aSignal) {

    TP.bySystemId('SherpaOutliner').deactivateMouseHandler();

    aSignal.preventDefault();

    return this;
});

//  ========================================================================
//  TP.sherpa.outliner Signals
//  ========================================================================

TP.sig.Signal.defineSubtype('BeginOutlineMode');
TP.sig.Signal.defineSubtype('EndOutlineMode');
TP.sig.Signal.defineSubtype('SherpaOutlinerToggle');

TP.sig.Signal.defineSubtype('OutlinerDOMInsert');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
