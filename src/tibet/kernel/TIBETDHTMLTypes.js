//  ========================================================================
/*
NAME:   TIBETDHTMLTypes.js
AUTH:   William J. Edney (wje), Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

*/
//  ========================================================================

/**
 * @todo
 */

//  ========================================================================
//  TP.core.DragMachine
//  ========================================================================

/**
 * @type {TP.core.DragMachine}
 * @synopsis A StateMachine specific to managing "dragging" states.
 */

//  ------------------------------------------------------------------------

TP.core.StateMachine.defineSubtype('DragMachine');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.DragMachine.Inst.defineAttribute('eventStream',
    TP.ac('TP.sig.DOMDragDown',
            'TP.sig.DOMDragHover',
            'TP.sig.DOMDragMove',
            'TP.sig.DOMDragUp'));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.DragMachine.Inst.defineMethod('init',
function(source) {

    /**
     * @name init
     * @synopsis Initializes a new instance of the receiver. The optional source
     *     parameter can be used to define which object the receiver will use as
     *     the data source for its event stream.
     * @param {HTMLElement|String|TP.core.Mouse} source The source object the
     *     receiver will be observing. The source must resolve to either an
     *     Element or the Mouse object. The default is TP.core.Mouse.
     * @returns {TP.core.DragMachine} A new instance.
     * @todo
     */

    var obj;

    this.callNextMethod();

    if (TP.notValid(source)) {
        obj = TP.core.Mouse;
    } else {
        //  Try to resolve the source as a DOM query of some form.
        obj = TP.$(source);

        //  The source must resolve to a native element.
        obj = TP.elem(obj);
        if (!TP.isElement(obj)) {
            return this.raise('TP.sig.InvalidParameter', arguments,
                'Could not resolve source to an element: ' + source);
        }
    }

    //  Assign our resolved source object as the eventSource.
    this.set('eventSource', obj);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DragMachine.Inst.defineMethod('acceptActive',
function(signalOrParams) {

    /**
     * @name acceptActive
     * @synopsis Returns true if a state transition to "active" is valid.
     * @param {TP.sig.Signal|Object} signalOrParams Input data which can
     *     influence the result of the test.
     * @returns {Boolean} True if we can transition to the state.
     */

    return TP.isKindOf(signalOrParams, 'TP.sig.DOMDragUp');
});

//  ------------------------------------------------------------------------

TP.core.DragMachine.Inst.defineMethod('acceptDragging',
function(signalOrParams) {

    /**
     * @name acceptDragging
     * @synopsis Returns true if a state transition to "dragging" is valid.
     * @param {TP.sig.Signal|Object} signalOrParams Input data which can
     *     influence the result of the test.
     * @returns {Boolean} True if we can transition to the state.
     */

    return TP.isKindOf(signalOrParams, 'TP.sig.DOMDragDown');
});

//  ------------------------------------------------------------------------

TP.core.DragMachine.Inst.defineMethod('defineDefaultStates',
function() {

    /**
     * @name defineDefaultStates
     * @synopsis Provides for state configuration by subtypes so different
     *     specialized instances can be created with minimal code.
     * @todo
     */

    //  We can transition to dragging from active and vice versa.
    this.defineState('dragging', this, TP.ACTIVE);
    this.defineState(TP.ACTIVE, this, 'dragging');

    return;
});

//  ========================================================================
//  TP.core.DragResponder
//  ========================================================================

/**
 * @type {TP.core.DragResponder}
 * @synopsis A StateResponder responsible for simple drag operations.
 */

//  ------------------------------------------------------------------------

TP.core.StateResponder.defineSubtype('DragResponder');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.core.DragResponder.Type.defineConstant(
        'LOCK_X_TO_ELEMENT_X',
function(aDragResponder, aSignal, xyPoint) {

            var target,
                targetParent,

                val;

            target = aDragResponder.get('actionElement');
            targetParent = TP.elementGetOffsetParent(target);

            val = TP.elementGetPageX(targetParent) -
                    TP.elementGetPageX(target);

            xyPoint.setX(val);

            return;
});

//  ---

TP.core.DragResponder.Type.defineConstant(
        'LOCK_Y_TO_ELEMENT_Y',
function(aDragResponder, aSignal, xyPoint) {

            var target,
                targetParent,

                val;

            target = aDragResponder.get('actionElement');
            targetParent = TP.elementGetOffsetParent(target);

            val = TP.elementGetPageY(targetParent) -
                    TP.elementGetPageY(target);

            xyPoint.setY(val);

            return;
});

//  ---

TP.core.DragResponder.Type.defineConstant(
        'LOCK_X_TO_START_X',
function(aDragResponder, aSignal, xyPoint) {

            xyPoint.setX(aDragResponder.get('startSignal').getPageX() -
                            aDragResponder.get('$offsetPoint').getX());

            return;
});

//  ---

TP.core.DragResponder.Type.defineConstant(
        'LOCK_Y_TO_START_Y',
function(aDragResponder, aSignal, xyPoint) {

            xyPoint.setY(aDragResponder.get('startSignal').getPageY() -
                            aDragResponder.get('$offsetPoint').getY());

            return;
});

//  ---

TP.core.DragResponder.Type.defineConstant(
        'INCREMENT_X_BY',
function(aDragResponder, aSignal, xyPoint) {

            var incrVal,
                xVal,
                kallee;

            kallee = TP.core.DragResponder.INCREMENT_X_BY;

            if (TP.isNumber(incrVal = kallee.modifierData.at('increment'))) {
                xVal = xyPoint.getX();
                xVal = (((xVal + incrVal) / incrVal).floor()) * incrVal;

                xyPoint.setX(xVal);
            }

            return;
});

//  ---

TP.core.DragResponder.Type.defineConstant(
        'INCREMENT_Y_BY',
function(aDragResponder, aSignal, xyPoint) {

            var incrVal,
                yVal,
                kallee;

            kallee = TP.core.DragResponder.INCREMENT_Y_BY;

            if (TP.isNumber(incrVal = kallee.modifierData.at('increment'))) {
                yVal = xyPoint.getY();
                yVal = (((yVal + incrVal) / incrVal).floor()) * incrVal;

                xyPoint.setY(yVal);
            }

            return;
});

//  ---

TP.core.DragResponder.Type.defineConstant(
        'INCREMENT_X_AND_Y_BY',
function(aDragResponder, aSignal, xyPoint) {

            var incrXVal,
                xVal,

                incrYVal,
                yVal,
                kallee;

            kallee = TP.core.DragResponder.INCREMENT_X_AND_Y_BY;

            if (TP.isNumber(incrXVal = kallee.modifierData.at('incrementX'))) {
                xVal = xyPoint.getX();
                xVal = (((xVal + incrXVal) / incrXVal).floor()) * incrXVal;

                xyPoint.setX(xVal);
            }

            if (TP.isNumber(incrYVal = kallee.modifierData.at('incrementY'))) {
                yVal = xyPoint.getY();
                yVal = (((yVal + incrYVal) / incrYVal).floor()) * incrYVal;

                xyPoint.setY(yVal);
            }

            return;
});

//  ---

TP.core.DragResponder.Type.defineConstant(
        'CLAMP_X_TO_OFFSET_PARENT',
function(aDragResponder, aSignal, xyPoint) {

            var target,
                targetParent,

                xVal;

            target = aDragResponder.get('actionElement');

            targetParent = TP.elementGetOffsetParent(target);

            xVal = xyPoint.getX();

            xVal = xVal.max(0);
            xVal = xVal.min(TP.elementGetWidth(targetParent) -
                            TP.elementGetWidth(target));

            xyPoint.setX(xVal);
});

//  ---

TP.core.DragResponder.Type.defineConstant(
        'CLAMP_Y_TO_OFFSET_PARENT',
function(aDragResponder, aSignal, xyPoint) {

            var target,
                targetParent,

                yVal;

            target = aDragResponder.get('actionElement');

            targetParent = TP.elementGetOffsetParent(target);

            yVal = xyPoint.getY();

            yVal = yVal.max(0);
            yVal = yVal.min(TP.elementGetHeight(targetParent) -
                            TP.elementGetHeight(target));

            xyPoint.setY(yVal);
});

//  ---

TP.core.DragResponder.Type.defineConstant(
        'CLAMP_X_AND_Y_TO_CONTAINER',
function(aDragResponder, aSignal, xyPoint) {

            var maxFittedRect,

                target,
                targetContainer,

                targetRect,
                containerRect,

                maxPoint,
                kallee;

            kallee = TP.core.DragResponder.CLAMP_X_AND_Y_TO_CONTAINER;

            if (TP.notValid(maxFittedRect = kallee.tempData.at(
                    'maxFittedRect'))) {
                target = aDragResponder.get('actionElement');

                targetContainer = TP.ifInvalid(kallee.modifierData.at(
                                                            'container'),
                                        TP.elementGetOffsetParent(target));

                targetRect = TP.wrap(target).getPageRect();
                containerRect = TP.wrap(targetContainer).getPageRect();

                maxPoint = targetRect.maxFittedPoint(containerRect);
                maxFittedRect =
                        TP.rtc(0,
                                0,
                                maxPoint.getX(),
                                maxPoint.getY());

                kallee.tempData.atPut('maxFittedRect',
                                                maxFittedRect);
            }

            xyPoint.clampToRect(maxFittedRect);
});

//  ---

TP.core.DragResponder.Type.defineConstant(
        'CLAMP_X_TO_CSS_MINMAX',
function(aDragResponder, aSignal, xyPoint) {

            var actionElem,

                styleVals,

                minWidth,
                maxWidth;

            actionElem = aDragResponder.get('actionElement');
            styleVals = TP.elementGetStyleValuesInPixels(
                            TP.ac('minWidth', 'maxWidth'));

            if (!TP.isNumber(minWidth = styleVals.at('minWidth'))) {
                minWidth = 0;
            }

            if (!TP.isNumber(maxWidth = styleVals.at('maxWidth'))) {
                //  Note here how we get the "content box", since that's
                //  what we're using when we set 'width'.
                maxWidth = TP.elementGetContentWidth(actionElem);
            }

            xyPoint.clampXToMinMax(minWidth, maxWidth);

            return;
});

//  ---

TP.core.DragResponder.Type.defineConstant(
        'CLAMP_Y_TO_CSS_MINMAX',
function(aDragResponder, aSignal, xyPoint) {

            var actionElem,

                styleVals,

                minHeight,
                maxHeight;

            actionElem = aDragResponder.get('actionElement');
            styleVals = TP.elementGetStyleValuesInPixels(
                            actionElem,
                            TP.ac('minHeight', 'maxHeight'));

            if (!TP.isNumber(minHeight = styleVals.at('minHeight'))) {
                minHeight = 0;
            }

            if (!TP.isNumber(maxHeight = styleVals.at('maxHeight'))) {
                //  Note here how we get the "content box", since that's
                //  what we're using when we set 'width'.
                maxHeight = TP.elementGetContentHeight(actionElem);
            }

            xyPoint.clampYToMinMax(minHeight, maxHeight);

            return;
});

//  ---

TP.core.DragResponder.Type.defineConstant(
        'CLAMP_X_AND_Y_TO_RECT',
function(aDragResponder, aSignal, xyPoint) {

            var clampRect,
                kallee;

            kallee = TP.core.DragResponder.CLAMP_X_AND_Y_TO_RECT;

            if (TP.notValid(clampRect = kallee.tempData.at('clampData'))) {
                return;
            }

            if (!TP.isKindOf(clampRect, TP.core.Rect)) {
                if (TP.isElement(clampRect)) {
                    clampRect = TP.wrap(clampRect);
                }

                if (TP.isKindOf(clampRect, TP.core.UIElementNode)) {
                    clampRect = clampRect.getPageRect();
                } else {
                    clampRect = TP.core.Rect.construct(clampRect);
                }

                if (!TP.isKindOf(clampRect, TP.core.Rect)) {
                    clampRect = null;
                }

                kallee.tempData.atPut('clampData', clampRect);
            }

            xyPoint.clampToRect(clampRect);
});

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.DragResponder.Inst.defineAttribute('startSignal');
TP.core.DragResponder.Inst.defineAttribute('currentSignal');
TP.core.DragResponder.Inst.defineAttribute('lastSignal');

TP.core.DragResponder.Inst.defineAttribute('startPoint');
TP.core.DragResponder.Inst.defineAttribute('currentPoint');

//  The target element the drag machine will be watching for drag events.
TP.core.DragResponder.Inst.defineAttribute('targetElement');

//  The action element the drag machine will be modifying for drag events.
TP.core.DragResponder.Inst.defineAttribute('actionElement');

TP.core.DragResponder.Inst.defineAttribute('$offsetPoint');

TP.core.DragResponder.Inst.defineAttribute('actionWindow');
TP.core.DragResponder.Inst.defineAttribute('$frameOffsetPoint');

TP.core.DragResponder.Inst.defineAttribute('modifiers');

TP.core.DragResponder.Inst.defineAttribute('dragCorner');

TP.core.DragResponder.Inst.defineAttribute('insetTop', 0);
TP.core.DragResponder.Inst.defineAttribute('insetRight', 0);
TP.core.DragResponder.Inst.defineAttribute('insetBottom', 0);
TP.core.DragResponder.Inst.defineAttribute('insetLeft', 0);

//  User-settable X and Y offsets. These are merely added to the current
//  point.
TP.core.DragResponder.Inst.defineAttribute('xOffset', 0);
TP.core.DragResponder.Inst.defineAttribute('yOffset', 0);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.DragResponder.Inst.defineMethod('init',
function(stateMachine, actionElement) {

    /**
     * @name init
     * @synopsis Initializes a new instance of the receiver.
     * @param {TP.core.StateMachine} stateMachine The state machine this
     *     responder should observe.
     * @param {HTMLElement|String} actionElement The action element the
     *     receiver will actually be modifying the style of to perform the drag.
     *     This is an optional parameter and if omitted will be set to the state
     *     machine's 'source' object. If the state machine's 'source' object is
     *     *not* an Element, this method will just set the action element to
     *     null. The action element will then have to be set before the receiver
     *     is fully operational.
     * @returns {TP.core.DragResponder} A new instance.
     * @todo
     */

    var obj,
        actionElem;

    this.callNextMethod(stateMachine);

    this.set('currentPoint', TP.pc(0, 0));

    obj = stateMachine.get('eventSource');
    if (obj !== TP.core.Mouse) {
        //  Event sources for DragMachine resolve to Elements.
        this.set('targetElement', obj);
    }

    if (TP.isElement(actionElement)) {
        this.set('actionElement', actionElem);
    } else if (TP.isElement(obj)) {
        this.set('actionElement', obj);
    } else {
        //  Invoke the setter here with null to force other related
        //  attribute settings to be updated by the setter.
        this.set('actionElement', null);
    }

    this.set('modifiers', TP.ac());
    this.set('$frameOffsetPoint', TP.pc(0, 0));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DragResponder.Inst.defineMethod('addDataModifier',
function(aModifierFunc, modifierData) {

    /**
     * @name addDataModifier
     * @synopsis Adds a 'data modifier' function to the receiver's list of
     *     modifiers. Modifier functions are those that impose some constraint
     *     (i.e. 'only increment in the X direction') on the gesture.
     * @param {Function} aModifierFunc The modifier function to add to the
     *     receiver's list.
     * @param {Object} modifierData Modifier data that goes along with the
     *     modifier function.
     * @returns {TP.core.DragResponder} The receiver.
     * @todo
     */

    if (!TP.isFunction(aModifierFunc)) {
        return this.raise('TP.sig.InvalidFunction', arguments,
            'Invalid modifier function: ' + aModifierFunc);
    }

    aModifierFunc.modifierData = modifierData;

    this.get('modifiers').push(aModifierFunc);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DragResponder.Inst.defineMethod('computeOffsetPoint',
function() {

    /**
     * @name computeOffsetPoint
     * @synopsis Computes the gestures initial 'offset point'.
     * @description When computing the offset point, this method takes into
     *     account the following parameters: - The initial starting point - The
     *     offset from the action element's offset parent to the action element.
     *     - The border of the action element. - The 'drag corner' that was
     *     configured for the gesture.
     * @returns {TP.core.DragResponder} The receiver.
     */

    var actionElem,

        startPoint,
        startX,
        startY,

        containerOffsets,

        offsetX,
        offsetY,

        corner,

        borderXOffset,
        borderYOffset,

        elemBox;

    //  If there's no action element, we can't go very far here - bail out
    if (!TP.isElement(actionElem = this.get('actionElement'))) {
        this.set('$offsetPoint', TP.pc(0, 0));

        return this;
    }

    //  Grab the starting point - this is where the mouse point has begun in
    //  our drag session
    startPoint = this.get('startPoint');
    startX = startPoint.getX();
    startY = startPoint.getY();

    containerOffsets = TP.elementGetOffsetFromContainer(actionElem);

    offsetX = startX - containerOffsets.first();
    offsetY = startY - containerOffsets.last();

    //  If the user specified a 'drag corner', then we'll be snapping over
    //  to that corner before we begin manipulation of the active element.
    //  Adjust the offset point accordingly.
    if (TP.isValid(corner = this.get('dragCorner'))) {
        borderXOffset = TP.elementGetBorderInPixels(actionElem, TP.LEFT);
        borderYOffset = TP.elementGetBorderInPixels(actionElem, TP.TOP);

        //  Since moving/resizing happens by setting 'top', 'left', 'width'
        //  or 'height' of the 'style' property, we need to use the *content
        //  box* when measuring.
        elemBox = TP.elementGetPageBox(actionElem, TP.CONTENT_BOX);

        switch (corner) {
            case    TP.TOP:

                offsetX += elemBox.at('left') +
                            (elemBox.at('width') / 2) -
                            startX -
                            borderXOffset;
                offsetY += elemBox.at('top') -
                            startY -
                            borderYOffset;

            break;

            case    TP.TOP_RIGHT:

                offsetX += elemBox.at('left') +
                            elemBox.at('width') -
                            startX;
                offsetY += elemBox.at('top') -
                            startY -
                            borderYOffset;

            break;

            case    TP.RIGHT:

                offsetX += elemBox.at('left') +
                            elemBox.at('width') -
                            startX;
                offsetY += elemBox.at('top') +
                            (elemBox.at('height') / 2) -
                            startY -
                            borderYOffset;

            break;

            case    TP.BOTTOM_RIGHT:

                offsetX += elemBox.at('left') +
                            elemBox.at('width') -
                            startX;
                offsetY += elemBox.at('top') +
                            elemBox.at('height') -
                            startY;

            break;

            case    TP.BOTTOM:

                offsetX += elemBox.at('left') +
                            (elemBox.at('width') / 2) -
                            startX -
                            borderXOffset;
                offsetY += elemBox.at('top') +
                            elemBox.at('height') -
                            startY;

            break;

            case    TP.BOTTOM_LEFT:

                offsetX += elemBox.at('left') -
                            startX -
                            borderXOffset;
                offsetY += elemBox.at('top') +
                            elemBox.at('height') -
                            startY;

            break;

            case    TP.LEFT:

                offsetX += elemBox.at('left') -
                            startX -
                            borderXOffset;
                offsetY += elemBox.at('top') +
                            (elemBox.at('height') / 2) -
                            startY -
                            borderYOffset;

            break;

            case    TP.TOP_LEFT:

                offsetX += elemBox.at('left') -
                            startX -
                            borderXOffset;
                offsetY += elemBox.at('top') -
                            startY -
                            borderYOffset;

            break;
        }
    }

    //  Create a TP.core.Point and use it for the offset point.
    this.set('$offsetPoint', TP.pc(offsetX, offsetY));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DragResponder.Inst.defineMethod('defineDefaultHandlers',
function() {

    /**
     * @name defineDefaultHandlers
     * @synopsis Provides for state configuration by subtypes so different
     *     specialized instances can be created with minimal code.
     * @todo
     */

    //  We handle dragging related states of Enter, Exit, Input, and the
    //  ability to transition from dragging to Active.
    this.defineStateHandler('dragging', this, TP.ENTER);
    this.defineStateHandler('dragging', this, TP.TRANSITION, TP.ACTIVE);
    this.defineStateHandler('dragging', this, TP.EXIT);
    this.defineStateHandler('dragging', this, TP.INPUT);

    return;
});

//  ------------------------------------------------------------------------

TP.core.DragResponder.Inst.defineMethod('draggingTP_sig_DOMDragHover',
function(aSignal) {

    /**
     * @name draggingDOMDragHover
     * @synopsis Executed when the state machine associated with this receiver
     *     receives a TP.sig.DOMDragHover signal while in the 'dragging' state.
     * @param {TP.sig.StateInput} aSignal The state input signal generated by
     *     the state machine machinery.
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.DragResponder.Inst.defineMethod('draggingTP_sig_DOMDragMove',
function(aSignal) {

    /**
     * @name draggingDOMDragMove
     * @synopsis Executed when the state machine associated with this receiver
     *     receives a TP.sig.DOMDragMove signal while in the 'dragging' state.
     *     This signal does *not* cause a state transition, but is important to
     *     the dragging state machine (as you might imagine ;-)).
     * @param {TP.sig.StateInput} aSignal The state input signal generated by
     *     the state machine machinery.
     */

    var domDragMove,
        currentSignal;

    //  The DOMDragMove signal that we want to become the 'current signal'
    domDragMove = aSignal.getPayload().at('trigger');

    //  If we have already have a current signal, capture it as the 'last
    //  signal' for possible usage by the receiver's machinery.
    if (TP.isValid(currentSignal = this.get('currentSignal'))) {
        this.set('lastSignal', currentSignal);
    }

    //  Capture the current signal.
    this.set('currentSignal', domDragMove);

    return;
});

//  ------------------------------------------------------------------------

TP.core.DragResponder.Inst.defineMethod('draggingEnter',
function(aSignal) {

    /**
     * @name draggingEnter
     * @synopsis Executed when the state machine associated with this receiver
     *     enters the 'dragging' state. This method performs whatever processing
     *     is necessary to start the dragging process.
     * @param {TP.sig.StateInput} aSignal The state input signal generated by
     *     the state machine machinery.
     */

    var startSignal,
        startPoint;

    //  The DOMDragDown signal that started us dragging
    startSignal = aSignal.getPayload().at('trigger');

    if (TP.isValid(startSignal)) {
        this.set('startSignal', startSignal);
        this.set('currentSignal', startSignal);

        startPoint = startSignal.getPagePoint();
        this.set('startPoint', startPoint);

        //  Compute the offset point (after we set the corner)
        this.computeOffsetPoint();

        //  Set up any installed data modifiers
        this.setupDataModifiers();

        //  Note here how we do *not* run any modifiers. Therefore, the
        //  start point will remain unchanged.
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.DragResponder.Inst.defineMethod('draggingExit',
function(aSignal) {

    /**
     * @name draggingExit
     * @synopsis Executed when the state machine associated with this receiver
     *     exits the 'dragging' state. This method performs whatever processing
     *     is necessary to stop the dragging process.
     * @param {TP.sig.StateInput} aSignal The state input signal generated by
     *     the state machine machinery.
     */

    //  Deactivate ourself. Normally we wouldn't do this, otherwise the
    //  event stream is off and we don't get any further events. In this
    //  case we rely on elements with dragging enabled to re-activate the
    //  proper event stream/state machine/responder instances.
    this.deactivate();

    return;
});

//  ------------------------------------------------------------------------

TP.core.DragResponder.Inst.defineMethod('getCurrentPoint',
function(runModifiers) {

    /**
     * @name getCurrentPoint
     * @synopsis Returns the gesture's 'current point' (after running any 'data
     *     modifiers' on the point data).
     * @param {Boolean} runModifiers Whether or not to run the 'data modifiers'
     *     (i.e. Functions that alter the current point). Defaults to true.
     * @returns {TP.core.Point} The gesture's current point.
     * @todo
     */

    var xyPoint,
        currentSignal,

        eventWin,

        frameOffsetPoint;

    //  Grab the TP.core.Point representing the current point and the
    //  current signal (which will probably be some sort of DOMDrag signal)
    xyPoint = this.$get('currentPoint');
    currentSignal = this.get('currentSignal');

    //  Set the point to the signals X and Y
    xyPoint.setXY(currentSignal.getPageX() + this.get('xOffset'),
                    currentSignal.getPageY() + this.get('yOffset'));

    //  If the existing 'current drag window' doesn't match the signal's
    //  window, then we need to compute the offsets from the signal's
    //  window to the window of the action element and store those away in
    //  a TP.core.Point which is the 'frame offset point'.
    if (this.get('actionWindow') !==
        (eventWin = TP.eventGetWindow(currentSignal.getEvent()))) {
        frameOffsetPoint = TP.pc(
                    TP.windowComputeWindowOffsets(
                        TP.nodeGetWindow(this.get('actionElement')),
                        eventWin));

        this.set('$frameOffsetPoint', frameOffsetPoint);
        this.set('actionWindow', eventWin);
    } else {
        //  Grab the current 'frame offset' point. Initially, this will be a
        //  TP.core.Point of 0,0 but may have been modified if the mouse
        //  pointer is over an iframe.
        frameOffsetPoint = this.get('$frameOffsetPoint');
    }

    //  Translate the current point by that amount
    xyPoint.translateByPoint(frameOffsetPoint);

    //  If the caller didn't explicitly turn off 'data modifiers' execution
    //  then we run those here.
    if (TP.notFalse(runModifiers)) {
        this.modifyResponderData(currentSignal, xyPoint);
    }

    return xyPoint;
});

//  ------------------------------------------------------------------------

TP.core.DragResponder.Inst.defineMethod('modifyResponderData',
function(aSignal, aPoint) {

    /**
     * @name modifyResponderData
     * @synopsis Executes all of the registered 'data modifiers' (such as the
     *     constraint functions that are type constants on this type).
     * @param {TP.sig.DOMDragMove} aSignal The current DOMDragMove signal.
     * @param {TP.core.Point} aPoint Optional point data to modify.
     * @returns {TP.core.DragResponder} The receiver.
     * @todo
     */

    var modifiers,
        i,
        modifierFunc,
        args;

    //  If there's no action element, we can't go very far here - bail out
    if (!TP.isElement(this.get('actionElement'))) {
        return this;
    }

    if (TP.isEmpty(modifiers = this.get('modifiers'))) {
        return this;
    }

    for (i = 0; i < modifiers.getSize(); i++) {
        if (TP.isCallable(modifierFunc = modifiers.at(i))) {
            try {
                switch (arguments.length) {
                    case 1:
                        modifierFunc(this, aSignal);
                        break;
                    case 2:
                        modifierFunc(this, aSignal, aPoint);
                        break;
                    default:
                        args = TP.args(arguments);
                        args.unshift(this);
                        modifierFunc.call(args);
                        break;
                }
            } catch (e) {
                this.raise('TP.sig.ModifierFailed', arguments,
                    'Signal modifier function failed: ' +
                    TP.ec(e, modifierFunc));
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DragResponder.Inst.defineMethod('setActionElement',
function(anElement) {

    /**
     * @name setActionElement
     * @synopsis Sets the 'action element' for the receiver. This defined setter
     *     method also configured internal responder state based on the element
     *     provided.
     * @param {HTMLElement} anElement The Element to use as the the action
     *     element.
     * @returns {TP.core.DragResponder} The receiver.
     */

    var actionElem;

    if (TP.notValid(anElement)) {
        this.$set('actionElement', null);
        this.set('actionWindow', null);

        return this;
    }

    //  If we receive a valid value then it must resolve successfully to an
    //  element or we've got an error condition.
    actionElem = TP.unwrap(anElement);
    if (!TP.isElement(actionElem)) {
        //  Try to resolve the source as a DOM query of some form.
        actionElem = TP.$(anElement);

        //  The source must resolve to a native element.
        actionElem = TP.elem(actionElem);
        if (!TP.isElement(actionElem)) {
            return this.raise('TP.sig.InvalidParameter', arguments,
                'Could not resolve anElement to an element: ' +
                anElement);
        }
    }

    //  To avoid recursion, use '$set()'
    this.$set('actionElement', actionElem);

    this.set('actionWindow', TP.nodeGetWindow(actionElem));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DragResponder.Inst.defineMethod('setupDataModifiers',
function() {

    /**
     * @name setupDataModifiers
     * @synopsis Sets up any installed data modifiers in preparation for a 'drag
     *     session'.
     * @returns {TP.core.DragResponder} The receiver.
     */

    var modifiers;

    //  If there's no action element, we can't go very far here - bail out
    if (!TP.isElement(this.get('actionElement'))) {
        return this;
    }

    if (TP.isEmpty(modifiers = this.get('modifiers'))) {
        return this;
    }

    //  Make sure that any installed modifers get a fresh 'temp data'
    //  TP.lang.Hash
    modifiers.perform(
            function(aModifierFunc) {

                aModifierFunc.tempData = TP.hc();
            });

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DragResponder.Inst.defineMethod('setupFrom',
function(infoTPElement, srcTPElement, evtTPElement, attrHash) {

    /**
     * @name setupFrom
     * @synopsis Sets up the receiver by using well-known attributes present on
     *     the supplied info element.
     * @param {TP.core.ElementNode} infoTPElement The TPElement to obtain
     *     configuration information from.
     * @param {TP.core.ElementNode} srcTPElement The TPElement that acts as the
     *     'source' of the drag operation.
     * @param {TP.core.ElementNode} evtTPElement The TPElement that the
     *     originating event occurred in and which might be used as the action
     *     element.
     * @param {TP.core.Hash} attrHash An optional hash that this method will use
     *     instead of the attribute data from the info element.
     * @returns {TP.core.DragResponder} The receiver.
     * @todo
     */

    var attrs,

        attrVal,

        lastDown,

        targetElem,
        srcElem,
        actionElem,
        eventClientXY,
        actionElems,
        pointElem,

        i,

        attrVals;

    if (TP.notValid(attrs = attrHash)) {
        attrs = infoTPElement.getAttributes();
    }

    if (TP.notEmpty(attrVal = infoTPElement.getAttribute('drag:item'))) {

        lastDown = TP.core.Mouse.get('lastDown');

        if (attrVal === 'target') {
            if (TP.isElement(targetElem =
                                TP.eventGetResolvedTarget(lastDown))) {
                actionElem = targetElem;
            }
        } else {
            srcElem = srcTPElement.getNativeNode();

            //  Note here how we specify 'autocollapse' for the
            //  TP.nodeEvaluatePath() call since we only want one element
            actionElem = TP.nodeEvaluatePath(srcElem, attrVal, null, true);

            //  If there was actually more than one element that matched, then
            //  autoCollapse won't matter - we got an Array. Get the element
            //  under the mouse point of the current 'down' event (using
            //  clientX/clientY since we're computing relative to the
            //  srcElement within the overall window/document).
            if (TP.isArray(actionElems = actionElem)) {
                actionElem = null;
                eventClientXY = TP.eventGetClientXY(lastDown);

                pointElem = TP.elementGetElementAtPoint(
                                srcElem,
                                eventClientXY.first(),
                                eventClientXY.last());

                for (i = 0; i < actionElems.getSize(); i++) {
                    if (actionElems.at(i) === pointElem) {
                        actionElem = actionElems.at(i);
                        break;
                    }
                }
            }
        }

        if (!TP.isElement(actionElem)) {
            return this.raise('TP.sig.InvalidParamter', arguments,
                'No elements found for drag:item path: ' + attrVal);
        }

        attrs.removeKey('drag:item');
    } else {
        actionElem = evtTPElement.getNativeNode();
    }

    this.set('actionElement', actionElem);

    //  If the author has configured a drag increment, install our own
    //  modifier function for that and remove the key so that supertypes
    //  won't install anything else for that.
    if (TP.notEmpty(attrVal = attrs.at('drag:increment'))) {
        attrVals = TP.cssDimensionValuesFromString(attrVal);

        attrVal = TP.elementGetPixelValue(
                                actionElem, attrVals.at('left'), 'width');
        if (attrVal !== 0) {
            this.addDataModifier(
                TP.core.DragResponder.INCREMENT_X_BY,
                TP.hc('increment', attrVal));
        }

        attrVal = TP.elementGetPixelValue(
                                actionElem, attrVals.at('top'), 'height');
        if (attrVal !== 0) {
            this.addDataModifier(
                TP.core.DragResponder.INCREMENT_Y_BY,
                TP.hc('increment', attrVal));
        }
    }

    //  If the author has configured a drag corner, set our value for that
    //  and remove the key so that supertypes won't install anything else
    //  for that.

    if (TP.notEmpty(attrVal = attrs.at('drag:corner'))) {
        this.set('dragCorner', TP[attrVal]);

        attrs.removeKey('drag:corner');
    }

    //  If the author has configured a drag offset, set our values for that
    //  and remove the key so that supertypes won't install anything else
    //  for that.

    if (TP.notEmpty(attrVal = attrs.at('drag:offset'))) {
        attrVals = TP.cssDimensionValuesFromString(attrVal);

        this.set('xOffset', TP.elementGetPixelValue(
                                actionElem, attrVals.at('left'), 'width'));
        this.set('yOffset', TP.elementGetPixelValue(
                                actionElem, attrVals.at('top'), 'height'));

        attrs.removeKey('drag:offset');
    }

    //  If the author has configured a set of drag insets, set our values
    //  for that and remove the key so that supertypes won't install
    //  anything else for that.

    if (TP.notEmpty(attrVal = attrs.at('drag:insets'))) {
        attrVals = TP.cssDimensionValuesFromString(attrVal);

        this.set('insetTop',
                    TP.elementGetPixelValue(
                            actionElem, attrVals.at('top'), 'height'));
        this.set('insetRight',
                    TP.elementGetPixelValue(
                            actionElem, attrVals.at('right'), 'width'));
        this.set('insetBottom',
                    TP.elementGetPixelValue(
                            actionElem, attrVals.at('bottom'), 'height'));
        this.set('insetLeft',
                    TP.elementGetPixelValue(
                            actionElem, attrVals.at('left'), 'width'));

        attrs.removeKey('drag:insets');
    }

    //  If the author has configured a set of drag constraint function
    //  names, use them to configure the modifier functions

    if (TP.notEmpty(attrVal = attrs.at('drag:constraints'))) {
        //  The author can define multiple values.
        attrVal = attrVal.split(' ');

        attrVal.perform(
                function(aConstraintVal) {

                    var constraintFunc;

                    //  If the value names a constant on the
                    //  TP.core.DragResponder type that points to a callable
                    //  Function, then add it as a data modifier.
                    if (TP.isCallable(
                            constraintFunc =
                                    TP.core.DragResponder[aConstraintVal])) {
                        this.addDataModifier(constraintFunc);
                    }
                }.bind(this));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DragResponder.Inst.defineMethod('teardownDataModifiers',
function() {

    /**
     * @name teardownDataModifiers
     * @synopsis Tears down any installed data modifiers at the conclusion of a
     *     'drag session'.
     * @returns {TP.core.DragResponder} The receiver.
     */

    var modifiers;

    if (TP.isEmpty(modifiers = this.get('modifiers'))) {
        return this;
    }

    //  Make sure that any installed modifers get a fresh 'temp data'
    //  TP.lang.Hash
    modifiers.perform(
            function(aModifierFunc) {

                delete aModifierFunc.modifierData;
                delete aModifierFunc.tempData;
            });

    modifiers.empty();

    return this;
});

//  ========================================================================
//  TP.core.MoveResponder
//  ========================================================================

/**
 * @type {TP.core.MoveResponder}
 * @synopsis A DragResponder responsible for simple move operations.
 */

//  ------------------------------------------------------------------------

TP.core.DragResponder.defineSubtype('MoveResponder');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.MoveResponder.Type.defineMethod('initialize',
function() {

    /**
     * @name initialize
     * @synopsis Performs one-time setup for the type on startup/import.
     */

    var moveStateMachine,
        moveSingleton;

    //  Construct a new state machine and use it as the state machine for
    //  the move singleton.
    moveStateMachine = TP.core.DragMachine.construct();

    moveSingleton = this.construct(moveStateMachine);

    //  Install an 'draggingExit' that will clear certain properties that
    //  are set up using markup configuration
    moveSingleton.defineMethod(
            'draggingExit',
            function(aSignal) {

                this.callNextMethod();

                //  Since this is a shared responder, we need to teardown it's
                //  responder data.
                this.teardownDataModifiers();

                //  These parameters need to be reset since this responder
                //  is shared and may be used again
                this.set('actionElement', null);
                this.set('xOffset', 0);
                this.set('yOffset', 0);
                this.set('dragCorner', null);

                return this;
            });

    moveSingleton.setID('MoveService');
    TP.sys.registerObject(moveSingleton);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.MoveResponder.Inst.defineAttribute('$overlayElement');

TP.core.MoveResponder.Inst.defineAttribute('$computedPoint');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.MoveResponder.Inst.defineMethod('draggingTP_sig_DOMDragMove',
function(aSignal) {

    /**
     * @name draggingDOMDragMove
     * @synopsis Executed when the state machine associated with this receiver
     *     receives a TP.sig.DOMDragMove signal while in the 'dragging' state.
     *     This signal does *not* cause a state transition, but is important to
     *     the dragging state machine (as you might imagine ;-)).
     * @param {TP.sig.StateInput} aSignal The state input signal generated by
     *     the state machine machinery.
     */

    var currentSignal,

        currentPoint,
        currentX,
        currentY,

        actionElem,

        elemBox,

        offsetPoint,

        computedPoint,

        styleObj,

        computedX,
        computedY;

    this.callNextMethod();

    currentSignal = this.get('currentSignal');
    actionElem = this.get('actionElement');

    if (TP.notValid(currentSignal) || !TP.isElement(actionElem)) {
        return;
    }

    currentPoint = this.getCurrentPoint(false);

    currentX = currentPoint.getX();
    currentY = currentPoint.getY();

    elemBox = TP.elementGetBorderBox(actionElem);

    offsetPoint = this.get('$offsetPoint');

    computedPoint = this.get('$computedPoint');

    styleObj = TP.elementGetStyleObj(actionElem);

    computedX = currentX - offsetPoint.getX();
    computedY = currentY - offsetPoint.getY();

    computedPoint.setXY(computedX, computedY);
    this.modifyResponderData(currentSignal, computedPoint);
    computedX = computedPoint.getX();
    computedY = computedPoint.getY();

    styleObj.top = computedY + 'px';
    styleObj.left = computedX + 'px';

    return;
});

//  ------------------------------------------------------------------------

TP.core.MoveResponder.Inst.defineMethod('draggingEnter',
function(aSignal) {

    /**
     * @name draggingEnter
     * @synopsis Executed when the state machine associated with this receiver
     *     enters the 'dragging' state. This method performs whatever processing
     *     is necessary to start the dragging process.
     * @param {TP.sig.StateInput} aSignal The state input signal generated by
     *     the state machine machinery.
     */

    var startSignal,

        actionElem,
        targetElem,

        overlayElem,

        insetTop,
        insetRight,
        insetBottom,
        insetLeft,

        startPoint,
        startX,
        startY;

    this.callNextMethod();

    startSignal = this.get('startSignal');
    actionElem = this.get('actionElement');

    if (TP.notValid(startSignal) || !TP.isElement(actionElem)) {
        return;
    }

    //  Create an 'overlay element' that will overlay the entire action
    //  element during the time that the gesture is active.
    overlayElem = TP.documentCreateElement(
                            TP.nodeGetDocument(actionElem),
                            'div',
                            TP.w3.Xmlns.XHTML);

    insetTop = this.get('insetTop');
    insetRight = this.get('insetRight');
    insetBottom = this.get('insetBottom');
    insetLeft = this.get('insetLeft');

    TP.elementSetStyle(overlayElem,
                        TP.join('position: ', 'absolute;',
                                ' top: ', insetTop + 'px;',
                                ' right: ', insetRight + 'px;',
                                ' bottom: ', insetBottom + 'px;',
                                ' left: ', insetLeft + 'px;',
                                ' background-color: ', 'transparent;'));

    this.set('$overlayElement', overlayElem);

    //  Append the overlay element to the element we're performing the
    //  action on. This will prevent spurious events from the action
    //  element.
    TP.nodeAppendChild(actionElem, overlayElem, false);

    //  Grab the start point and make sure that the overlay element contains
    //  it. If it doesn't, we must've come down on one of the insets, so we
    //  just stop propagation of the state signal, detach the overlay
    //  element and exit.

    startPoint = this.get('startPoint');
    startX = startPoint.getX();
    startY = startPoint.getY();

    if (!TP.elementContainsPoint(overlayElem, startX, startY)) {
        aSignal.stopPropagation();

        TP.nodeDetach(overlayElem);

        this.set('actionElement', null);

        return;
    }

    //  Make sure and disable the user select on the action element so
    //  that we don't get weird selection behavior from the host
    //  platform.
    TP.elementDisableUserSelect(actionElem);

    //  If there is a target element, do the same for it
    if (TP.isElement(targetElem = this.get('targetElement'))) {
        TP.elementDisableUserSelect(targetElem);
    }

    //  A reusable point that we can use in our dragging computations.
    this.set('$computedPoint', TP.pc());

    //  Set the attribute on the action element that indicates we are
    //  'moving' it.
    TP.elementSetAttribute(actionElem, 'pclass:moving', 'true', true);

    return;
});

//  ------------------------------------------------------------------------

TP.core.MoveResponder.Inst.defineMethod('draggingExit',
function(aSignal) {

    /**
     * @name draggingExit
     * @synopsis Executed when the state machine associated with this receiver
     *     exits the 'dragging' state. This method performs whatever processing
     *     is necessary to stop the dragging process.
     * @param {TP.sig.StateInput} aSignal The state input signal generated by
     *     the state machine machinery.
     */

    var actionElem,

        overlayElem,

        targetElem;

    actionElem = this.get('actionElement');

    if (!TP.isElement(actionElem)) {
        return;
    }

    //  Remove the attribute on the action element that indicated we were
    //  'moving' it.
    TP.elementRemoveAttribute(actionElem, 'pclass:moving', true);

    //  Reenable the user select behavior for the action element
    TP.elementEnableUserSelect(actionElem);

    if (TP.isElement(targetElem = this.get('targetElement'))) {
        //  Reenable the user select behavior for the target element
        TP.elementEnableUserSelect(targetElem);
    }

    //  Remove the element that was overlaying the action element
    overlayElem = this.get('$overlayElement');
    TP.nodeDetach(overlayElem);

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.MoveResponder.Inst.defineMethod('setupFrom',
function(infoTPElement, srcTPElement, evtTPElement, attrHash) {

    /**
     * @name setupFrom
     * @synopsis Sets up the receiver by using well-known attributes present on
     *     the supplied info element.
     * @param {TP.core.ElementNode} infoTPElement The TPElement to obtain
     *     configuration information from.
     * @param {TP.core.ElementNode} srcTPElement The TPElement that acts as the
     *     'source' of the drag operation.
     * @param {TP.core.ElementNode} evtTPElement The TPElement that the
     *     originating event occurred in and which might be used as the action
     *     element.
     * @param {TP.core.Hash} attrHash An optional hash that this method will use
     *     instead of the attribute data from the element.
     * @returns {TP.core.MoveResponder} The receiver.
     * @todo
     */

    var attrs,

        attrVal,
        containerElem;

    if (TP.notValid(attrs = attrHash)) {
        attrs = infoTPElement.getAttributes();
    }

    //  If the author has configured a drag container, install our own
    //  modifier function for that and remove the key so that supertypes
    //  won't install anything else for that.

    //  Note here how we specify both 'autocollapse' and 'retry with
    //  document', for the TP.nodeEvaluatePath() call since we only want one
    //  element and we want the document to be retried as the context node -
    //  very useful for CSS paths.
    if (TP.notEmpty(attrVal = attrs.at('drag:container')) &&
        TP.isElement(containerElem = TP.nodeEvaluatePath(
                                        evtTPElement.getNativeNode(),
                                        attrVal,
                                        null,
                                        true,
                                        true))) {
        this.addDataModifier(
                TP.core.DragResponder.CLAMP_X_AND_Y_TO_CONTAINER,
                TP.hc('container', containerElem));

        attrs.removeKey('drag:container');
    }

    //  Need to do this since we might have generated 'attrs' here and want
    //  to pass it along.
    return this.callNextMethod(infoTPElement, srcTPElement,
                                evtTPElement, attrs);
});

//  ========================================================================
//  TP.core.ResizeResponder
//  ========================================================================

/**
 * @type {TP.core.ResizeResponder}
 * @synopsis A DragResponder responsible for simple resize operations.
 */

//  ------------------------------------------------------------------------

TP.core.DragResponder.defineSubtype('ResizeResponder');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.core.ResizeResponder.Type.defineConstant(
        'CLAMP_RECT_TO_CONTAINER',
function(aDragResponder, aSignal, xyPoint) {

            var containerRect,
                target,
                targetContainer,
                targetRect,
                containerOffsets,
                kallee;

            kallee = TP.core.ResizeResponder.CLAMP_RECT_TO_CONTAINER;

            if (TP.notValid(containerRect = kallee.tempData.at(
                                                        'containerRect'))) {
                target = aDragResponder.get('actionElement');

                targetContainer = TP.ifInvalid(kallee.modifierData.at(
                                                            'container'),
                                        TP.elementGetOffsetParent(target));

                targetRect = TP.wrap(target).getPageRect();
                containerRect = TP.wrap(targetContainer).getPageRect();

                containerRect.setXY(0, 0);
                containerOffsets = TP.elementGetOffsetFromContainer(target);
                containerRect.shrink(containerOffsets.first(),
                                        containerOffsets.last());

                kallee.tempData.atPut('containerRect',
                                                containerRect);
            }

            xyPoint.clampToRect(containerRect);
});

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.ResizeResponder.Type.defineMethod('initialize',
function() {

    /**
     * @name initialize
     * @synopsis Performs one-time setup for the type on startup/import.
     */

    var resizeStateMachine,
        resizeSingleton;

    //  Construct a new state machine and use it as the state machine for
    //  the resize singleton.
    resizeStateMachine = TP.core.DragMachine.construct();

    resizeSingleton = this.construct(resizeStateMachine);

    //  Install an 'draggingExit' that will clear certain properties that
    //  are set up using markup configuration
    resizeSingleton.defineMethod(
            'draggingExit',
            function(aSignal) {

                this.callNextMethod();

                //  Since this is a shared responder, we need to teardown it's
                //  responder data.
                this.teardownDataModifiers();

                //  These parameters need to be reset since this responder
                //  is shared and may be used again
                this.set('actionElement', null);
                this.set('xOffset', 0);
                this.set('yOffset', 0);
                this.set('dragCorner', null);
                this.set('dragSide', null);

                return this;
            });

    resizeSingleton.setID('ResizeService');
    TP.sys.registerObject(resizeSingleton);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.ResizeResponder.Inst.defineAttribute('$overlayElement');

TP.core.ResizeResponder.Inst.defineAttribute('$computedPoint');

TP.core.ResizeResponder.Inst.defineAttribute('dragSide');
TP.core.ResizeResponder.Inst.defineAttribute('sideComputed');

TP.core.ResizeResponder.Inst.defineAttribute('perimeterTop');
TP.core.ResizeResponder.Inst.defineAttribute('perimeterRight');
TP.core.ResizeResponder.Inst.defineAttribute('perimeterBottom');
TP.core.ResizeResponder.Inst.defineAttribute('perimeterLeft');

TP.core.ResizeResponder.Inst.defineAttribute('$parentOffsets');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.ResizeResponder.Inst.defineMethod('init',
function(stateMachine, actionElement) {

    /**
     * @name init
     * @synopsis Initializes a new instance of the receiver.
     * @param {TP.core.StateMachine} stateMachine The state machine this
     *     responder should observe.
     * @param {HTMLElement|String} actionElement The action element the
     *     receiver will actually be modifying the style of to perform the drag.
     *     This is an optional parameter and if omitted will be set to the state
     *     machine's 'source' object. If the state machine's 'source' object is
     *     *not* an Element, this method will just set the action element to
     *     null. The action element will then have to be set before the receiver
     *     is fully operational.
     * @returns {TP.core.ResizeResponder} A new instance.
     * @todo
     */

    this.callNextMethod();

    this.set('perimeterTop', 10);
    this.set('perimeterRight', 10);
    this.set('perimeterBottom', 10);
    this.set('perimeterLeft', 10);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ResizeResponder.Inst.defineMethod('computeOffsetPoint',
function() {

    /**
     * @name computeOffsetPoint
     * @synopsis Computes the gestures initial 'offset point'.
     * @description When computing the offset point, this method takes into
     *     account the following parameters: - The initial starting point - The
     *     offset from the action element's offset parent to the action element.
     *     - The border of the action element. - The 'drag corner' that was
     *     configured or computed for the gesture.
     * @returns {TP.core.DragResponder} The receiver.
     */

    var actionElem,

        startPoint,
        startX,
        startY,

        containerOffsets,

        offsetX,
        offsetY,

        side,
        sideComputed,

        elemBox,

        borderXOffset,
        borderYOffset,

        rightDiff,
        bottomDiff,
        leftDiff,
        topDiff,

        totalElemOffsets,

        borderWidthTotal,
        borderHeightTotal,

        parentOffsets;

    //  If there's no action element, we can't go very far here - bail out
    if (!TP.isElement(actionElem = this.get('actionElement'))) {
        this.set('$offsetPoint', TP.pc(0, 0));

        return this;
    }

    //  Grab the starting point - this is where the mouse point has begun in
    //  our drag session
    startPoint = this.get('startPoint');
    startX = startPoint.getX();
    startY = startPoint.getY();

    containerOffsets = TP.elementGetOffsetFromContainer(actionElem);

    offsetX = startX - containerOffsets.first();
    offsetY = startY - containerOffsets.last();

    if (TP.notValid(side = this.get('dragSide'))) {
        //  NB: Note here how we just divvy the element's box up into
        //  equally sized chunks to do the corner computation. The real
        //  offsets aren't really relevant here, since they would've already
        //  denied the resize earlier if the user moused down in one of
        //  them.
        side = TP.elementComputeCornerUsing(actionElem, startX, startY,
                                            this.get('perimeterTop'),
                                            this.get('perimeterRight'),
                                            this.get('perimeterBottom'),
                                            this.get('perimeterLeft'));

        this.set('dragSide', side);
        sideComputed = true;
    } else {
        sideComputed = false;
    }

    this.set('sideComputed', sideComputed);

    //  Since moving/resizing happens by setting 'top', 'left', 'width'
    //  or 'height' of the 'style' property, we need to use the *content
    //  box* when measuring.
    elemBox = TP.elementGetPageBox(actionElem, TP.CONTENT_BOX);

    if (!sideComputed) {
        borderXOffset = TP.elementGetBorderInPixels(actionElem, TP.LEFT);
        borderYOffset = TP.elementGetBorderInPixels(actionElem, TP.TOP);

        switch (side) {
            case    TP.TOP:

                offsetX += elemBox.at('left') +
                            (elemBox.at('width') / 2) -
                            startX -
                            borderXOffset;
                offsetY += elemBox.at('top') -
                            startY -
                            borderYOffset;

            break;

            case    TP.TOP_RIGHT:

                offsetX += elemBox.at('left') +
                            elemBox.at('width') -
                            startX;
                offsetY += elemBox.at('top') -
                            startY -
                            borderYOffset;

            break;

            case    TP.RIGHT:

                offsetX += elemBox.at('left') +
                            elemBox.at('width') -
                            startX;
                offsetY += elemBox.at('top') +
                            (elemBox.at('height') / 2) -
                            startY -
                            borderYOffset;

            break;

            case    TP.BOTTOM_RIGHT:

                offsetX += elemBox.at('left') +
                            elemBox.at('width') -
                            startX;
                offsetY += elemBox.at('top') +
                            elemBox.at('height') -
                            startY;

            break;

            case    TP.BOTTOM:

                offsetX += elemBox.at('left') +
                            (elemBox.at('width') / 2) -
                            startX -
                            borderXOffset;
                offsetY += elemBox.at('top') +
                            elemBox.at('height') -
                            startY;

            break;

            case    TP.BOTTOM_LEFT:

                offsetX += elemBox.at('left') -
                            startX -
                            borderXOffset;
                offsetY += elemBox.at('top') +
                            elemBox.at('height') -
                            startY;

            break;

            case    TP.LEFT:

                offsetX += elemBox.at('left') -
                            startX -
                            borderXOffset;
                offsetY += elemBox.at('top') +
                            (elemBox.at('height') / 2) -
                            startY -
                            borderYOffset;

            break;

            case    TP.TOP_LEFT:

                offsetX += elemBox.at('left') -
                            startX -
                            borderXOffset;
                offsetY += elemBox.at('top') -
                            startY -
                            borderYOffset;

            break;
        }
    }

    //  If the action element's offset parent is the document element, then
    //  we want to just set some default values for the 'diff' values that
    //  get used below to adjust the offset value.
    if (TP.elementGetOffsetParent(actionElem) ===
        TP.nodeGetDocument(actionElem).documentElement) {
        topDiff = 0;
        rightDiff = offsetX;
        bottomDiff = offsetY;
        leftDiff = 0;

        parentOffsets = TP.ac(0, 0);
    } else {
        //  Otherwise, if the action element is offset because its in
        //  another container (i.e. it's offset parent is *not* the document
        //  element), then we compute real values for our 'diff' values.
        if (!sideComputed) {
            topDiff = 0;
            rightDiff = elemBox.at('width') +
                        TP.elementGetBorderInPixels(actionElem, TP.RIGHT);
            bottomDiff = elemBox.at('height') +
                        TP.elementGetBorderInPixels(actionElem, TP.BOTTOM);
            leftDiff = 0;
        } else {
            totalElemOffsets =
                TP.elementGetPageXY(
                        actionElem,
                        TP.BORDER_BOX,
                        TP.documentGetBody(TP.nodeGetDocument(actionElem)));

            borderWidthTotal =
                TP.elementGetBorderInPixels(actionElem, TP.LEFT) +
                TP.elementGetBorderInPixels(actionElem, TP.RIGHT);

            borderHeightTotal =
                TP.elementGetBorderInPixels(actionElem, TP.TOP) +
                TP.elementGetBorderInPixels(actionElem, TP.BOTTOM);

            topDiff = startY -
                        (totalElemOffsets.last() + borderHeightTotal);
            rightDiff = startX - (totalElemOffsets.first());
            bottomDiff = startY - (totalElemOffsets.last());
            leftDiff = startX -
                        (totalElemOffsets.first() + borderWidthTotal);
        }

        parentOffsets =
            TP.elementGetPageXY(
                    TP.elementGetOffsetParent(actionElem),
                    TP.CONTENT_BOX,
                    TP.documentGetBody(TP.nodeGetDocument(actionElem)));
    }

    this.set('$parentOffsets', parentOffsets);

    switch (side) {
        case    TP.TOP:

            offsetY = offsetY - topDiff;

        break;

        case    TP.TOP_RIGHT:

            offsetX = elemBox.at('width') - rightDiff;
            offsetY = offsetY - topDiff;

        break;

        case    TP.RIGHT:

            offsetX = elemBox.at('width') - rightDiff;

        break;

        case    TP.BOTTOM_RIGHT:

            offsetX = elemBox.at('width') - rightDiff;
            offsetY = elemBox.at('height') - bottomDiff;

        break;

        case    TP.BOTTOM:

            offsetY = elemBox.at('height') - bottomDiff;

        break;

        case    TP.BOTTOM_LEFT:

            offsetX = offsetX - leftDiff;
            offsetY = elemBox.at('height') - bottomDiff;

        break;

        case    TP.LEFT:

            offsetX = offsetX - leftDiff;

        break;

        case    TP.TOP_LEFT:

            offsetX = offsetX - leftDiff;
            offsetY = offsetY - topDiff;

        break;
    }

    //  Create a TP.core.Point and use it for the offset point.
    this.set('$offsetPoint', TP.pc(offsetX, offsetY));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ResizeResponder.Inst.defineMethod('draggingTP_sig_DOMDragMove',
function(aSignal) {

    /**
     * @name draggingDOMDragMove
     * @synopsis Executed when the state machine associated with this receiver
     *     receives a TP.sig.DOMDragMove signal while in the 'dragging' state.
     *     This signal does *not* cause a state transition, but is important to
     *     the dragging state machine (as you might imagine ;-)).
     * @param {TP.sig.StateInput} aSignal The state input signal generated by
     *     the state machine machinery.
     */

    var currentSignal,

        actionElem,

        currentPoint,
        currentX,
        currentY,

        elemBox,

        offsetPoint,

        computedPoint,

        styleObj,

        side,

        parentOffsets,

        borderWidthTotal,
        borderHeightTotal,

        computedX,
        computedY,

        dimensionX,
        dimensionY;

    this.callNextMethod();

    currentSignal = this.get('currentSignal');
    actionElem = this.get('actionElement');

    if (TP.notValid(currentSignal) || !TP.isElement(actionElem)) {
        return;
    }

    currentPoint = this.getCurrentPoint(false);
    currentX = currentPoint.getX();
    currentY = currentPoint.getY();

    //  Since moving/resizing happens by setting 'top', 'left', 'width' or
    //  'height' of the 'style' property, we need to use the *content box*
    //  when measuring.
    elemBox = TP.elementGetPageBox(actionElem, TP.CONTENT_BOX);

    offsetPoint = this.get('$offsetPoint');

    computedPoint = this.get('$computedPoint');

    styleObj = TP.elementGetStyleObj(actionElem);

    side = this.get('dragSide');

    parentOffsets = this.get('$parentOffsets');

    borderWidthTotal =
        TP.elementGetBorderInPixels(actionElem, TP.LEFT) +
        TP.elementGetBorderInPixels(actionElem, TP.RIGHT);

    borderHeightTotal =
        TP.elementGetBorderInPixels(actionElem, TP.TOP) +
        TP.elementGetBorderInPixels(actionElem, TP.BOTTOM);

    switch (side) {
        case    TP.TOP:

            computedY = currentY - offsetPoint.getY();

            computedPoint.setY(computedY);
            this.modifyResponderData(currentSignal, computedPoint);
            computedY = computedPoint.getY();

            styleObj.top = computedY + 'px';

            dimensionY = elemBox.at('height') -
                            (computedY - elemBox.at('top')) -
                            parentOffsets.last() -
                            borderHeightTotal;

            styleObj.height = dimensionY + 'px';

        break;

        case    TP.TOP_RIGHT:

            computedY = currentY - offsetPoint.getY();
            computedX = currentX - elemBox.at('left') + offsetPoint.getX();

            computedPoint.setXY(computedX, computedY);
            this.modifyResponderData(currentSignal, computedPoint);
            computedX = computedPoint.getX();
            computedY = computedPoint.getY();

            styleObj.top = computedY + 'px';

            dimensionY = elemBox.at('height') -
                            (computedY - elemBox.at('top')) -
                            parentOffsets.last() -
                            borderHeightTotal;

            styleObj.height = dimensionY + 'px';

            styleObj.width = computedX + 'px';

        break;

        case    TP.RIGHT:

            computedX = currentX - elemBox.at('left') + offsetPoint.getX();

            computedPoint.setX(computedX);
            this.modifyResponderData(currentSignal, computedPoint);
            computedX = computedPoint.getX();

            styleObj.width = computedX + 'px';

        break;

        case    TP.BOTTOM_RIGHT:

            computedX = currentX - elemBox.at('left') + offsetPoint.getX();
            computedY = currentY - elemBox.at('top') + offsetPoint.getY();

            computedPoint.setXY(computedX, computedY);
            this.modifyResponderData(currentSignal, computedPoint);
            computedX = computedPoint.getX();
            computedY = computedPoint.getY();

            styleObj.width = computedX + 'px';

            styleObj.height = computedY + 'px';

        break;

        case    TP.BOTTOM:

            computedY = currentY - elemBox.at('top') + offsetPoint.getY();

            computedPoint.setY(computedY);
            this.modifyResponderData(currentSignal, computedPoint);
            computedY = computedPoint.getY();

            styleObj.height = computedY + 'px';

        break;

        case    TP.BOTTOM_LEFT:

            computedX = currentX - offsetPoint.getX();
            computedY = currentY - elemBox.at('top') + offsetPoint.getY();

            computedPoint.setXY(computedX, computedY);
            this.modifyResponderData(currentSignal, computedPoint);
            computedX = computedPoint.getX();
            computedY = computedPoint.getY();

            styleObj.left = computedX + 'px';

            dimensionX = elemBox.at('width') -
                            (computedX - elemBox.at('left')) -
                            parentOffsets.first() -
                            borderWidthTotal;

            styleObj.width = dimensionX + 'px';

            styleObj.height = computedY + 'px';

        break;

        case    TP.LEFT:

            computedX = currentX - offsetPoint.getX();

            computedPoint.setX(computedX);
            this.modifyResponderData(currentSignal, computedPoint);
            computedX = computedPoint.getX();

            styleObj.left = computedX + 'px';

            dimensionX = elemBox.at('width') -
                            (computedX - elemBox.at('left')) -
                            parentOffsets.first() -
                            borderWidthTotal;

            styleObj.width = dimensionX + 'px';

        break;

        case    TP.TOP_LEFT:

            computedX = currentX - offsetPoint.getX();
            computedY = currentY - offsetPoint.getY();

            computedPoint.setXY(computedX, computedY);
            this.modifyResponderData(currentSignal, computedPoint);
            computedX = computedPoint.getX();
            computedY = computedPoint.getY();

            styleObj.top = computedY + 'px';

            dimensionY = elemBox.at('height') -
                            (computedY - elemBox.at('top')) -
                            parentOffsets.last() -
                            borderHeightTotal;

            styleObj.height = dimensionY + 'px';

            styleObj.left = computedX + 'px';

            dimensionX = elemBox.at('width') -
                            (computedX - elemBox.at('left')) -
                            parentOffsets.first() -
                            borderWidthTotal;

            styleObj.width = dimensionX + 'px';

        break;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.ResizeResponder.Inst.defineMethod('draggingEnter',
function(aSignal) {

    /**
     * @name draggingEnter
     * @synopsis Executed when the state machine associated with this receiver
     *     enters the 'dragging' state. This method performs whatever processing
     *     is necessary to start the dragging process.
     * @param {TP.sig.StateInput} aSignal The state input signal generated by
     *     the state machine machinery.
     */

    var startSignal,

        actionElem,

        targetElem,

        overlayElem,

        insetTop,
        insetRight,
        insetBottom,
        insetLeft,

        startPoint,
        startX,
        startY;

    this.callNextMethod();

    startSignal = this.get('startSignal');
    actionElem = this.get('actionElement');

    if (TP.notValid(startSignal) || !TP.isElement(actionElem)) {
        return;
    }

    //  Create an 'overlay element' that will overlay the entire action
    //  element during the time that the gesture is active.
    overlayElem = TP.documentCreateElement(
                            TP.nodeGetDocument(actionElem),
                            'div',
                            TP.w3.Xmlns.XHTML);

    insetTop = this.get('insetTop');
    insetRight = this.get('insetRight');
    insetBottom = this.get('insetBottom');
    insetLeft = this.get('insetLeft');

    TP.elementSetStyle(overlayElem,
                        TP.join('position: ', 'absolute;',
                                ' top: ', insetTop + 'px;',
                                ' right: ', insetRight + 'px;',
                                ' bottom: ', insetBottom + 'px;',
                                ' left: ', insetLeft + 'px;',
                                ' background-color: ', 'transparent;'));

    this.set('$overlayElement', overlayElem);

    //  Append the overlay element to the element we're performing the
    //  action on. This will prevent spurious events from the action
    //  element.
    TP.nodeAppendChild(actionElem, overlayElem, false);

    //  Grab the start point and make sure that the overlay element contains
    //  it. If it doesn't, we must've come down on one of the insets, so we
    //  just stop propagation of the state signal, detach the overlay
    //  element and exit.

    startPoint = this.get('startPoint');
    startX = startPoint.getX();
    startY = startPoint.getY();

    if (!TP.elementContainsPoint(overlayElem, startX, startY)) {
        aSignal.stopPropagation();

        TP.nodeDetach(overlayElem);

        this.set('actionElement', null);

        return;
    }

    //  Make sure and disable the user select on the action element so
    //  that we don't get weird selection behavior from the host
    //  platform.
    TP.elementDisableUserSelect(actionElem);

    //  If there is a target element, do the same for it
    if (TP.isElement(targetElem = this.get('targetElement'))) {
        TP.elementDisableUserSelect(targetElem);
    }

    //  A reusable point that we can use in our dragging computations.
    this.set('$computedPoint', TP.pc());

    //  Set the attribute on the action element that indicates we are
    //  'resizing' it.
    TP.elementSetAttribute(actionElem, 'pclass:resizing', 'true', true);

    return;
});

//  ------------------------------------------------------------------------

TP.core.ResizeResponder.Inst.defineMethod('draggingExit',
function(aSignal) {

    /**
     * @name draggingExit
     * @synopsis Executed when the state machine associated with this receiver
     *     exits the 'dragging' state. This method performs whatever processing
     *     is necessary to stop the dragging process.
     * @param {TP.sig.StateInput} aSignal The state input signal generated by
     *     the state machine machinery.
     */

    var actionElem,

        overlayElem,

        targetElem;

    actionElem = this.get('actionElement');

    if (!TP.isElement(actionElem)) {
        return;
    }

    //  Remove the attribute on the action element that indicated we were
    //  'resizing' it.
    TP.elementRemoveAttribute(actionElem, 'pclass:resizing', true);

    //  Reenable the user select behavior for the action element
    TP.elementEnableUserSelect(actionElem);

    //  Remove the element that was overlaying the action element
    overlayElem = this.get('$overlayElement');
    TP.nodeDetach(overlayElem);

    if (TP.isElement(targetElem = this.get('targetElement'))) {
        //  Reenable the user select behavior for the target element
        TP.elementEnableUserSelect(targetElem);
    }

    if (TP.isTrue(this.get('sideComputed'))) {
        this.set('dragSide', null);
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.ResizeResponder.Inst.defineMethod('setupFrom',
function(infoTPElement, srcTPElement, evtTPElement, attrHash) {

    /**
     * @name setupFrom
     * @synopsis Sets up the receiver by using well-known attributes present on
     *     the supplied info element.
     * @param {TP.core.ElementNode} infoTPElement The TPElement to obtain
     *     configuration information from.
     * @param {TP.core.ElementNode} srcTPElement The TPElement that acts as the
     *     'source' of the drag operation.
     * @param {TP.core.ElementNode} evtTPElement The TPElement that the
     *     originating event occurred in and which might be used as the action
     *     element.
     * @param {TP.core.Hash} attrHash An optional hash that this method will use
     *     instead of the attribute data from the element.
     * @returns {TP.core.ResizeResponder} The receiver.
     * @todo
     */

    var attrs,

        attrVal,
        containerElem;

    if (TP.notValid(attrs = attrHash)) {
        attrs = infoTPElement.getAttributes();
    }

    //  If the author has configured a drag container, install our own
    //  modifier function for that and remove the key so that supertypes
    //  won't install anything else for that.

    //  Note here how we specify both 'autocollapse' and 'retry with
    //  document', for the TP.nodeEvaluatePath() call since we only want one
    //  element and we want the document to be retried as the context node -
    //  very useful for CSS paths.
    if (TP.notEmpty(attrVal = attrs.at('drag:container')) &&
        TP.isElement(containerElem = TP.nodeEvaluatePath(
                                        evtTPElement.getNativeNode(),
                                        attrVal,
                                        null,
                                        true,
                                        true))) {
        this.addDataModifier(
                TP.core.ResizeResponder.CLAMP_RECT_TO_CONTAINER,
                TP.hc('container', containerElem));

        attrs.removeKey('drag:container');
    }

    //  If the author has configured a resize side, set our value for that
    //  and remove the key so that supertypes won't install anything else
    //  for that.

    if (TP.notEmpty(attrVal = attrs.at('drag:side'))) {
        this.set('dragSide', TP[attrVal]);

        attrs.removeKey('drag:side');
    }

    //  If the author has configured a set of drag constraint function
    //  names, use them to configure the modifier functions

    if (TP.notEmpty(attrVal = attrs.at('drag:constraints'))) {
        //  The author can define multiple values.
        attrVal = attrVal.split(' ');

        attrVal.perform(
                function(aConstraintVal) {

                    var constraintFunc;

                    //  If the value names a constant on the
                    //  TP.core.ResizeResponder or the TP.core.DragResponder
                    //  type that points to a callable Function, then add it
                    //  as a data modifier.
                    if (TP.isCallable(
                            constraintFunc =
                                TP.core.ResizeResponder[aConstraintVal]) ||
                        TP.isCallable(
                            constraintFunc =
                                TP.core.DragResponder[aConstraintVal])) {
                        this.addDataModifier(constraintFunc);
                    }
                }.bind(this));
    }

    //  Need to do this since we might have generated 'attrs' here and want
    //  to pass it along.
    return this.callNextMethod(infoTPElement, srcTPElement,
                                evtTPElement, attrs);
});

//  ========================================================================
//  TP.core.DNDResponder
//  ========================================================================

/**
 * @type {TP.core.DNDResponder}
 * @synopsis A DragResponder responsible for drag and drop operations.
 */

//  ------------------------------------------------------------------------

TP.core.MoveResponder.defineSubtype('DNDResponder');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.core.DNDResponder.Type.defineConstant(
        'CLAMP_X_AND_Y_TO_CONTAINER',
function(aDragResponder, aSignal, xyPoint) {

            var maxFittedRect,
                target,
                targetContainer,
                targetRect,
                containerRect,
                maxPoint,
                kallee;

            kallee = TP.core.DNDResponder.CLAMP_X_AND_Y_TO_CONTAINER;

            if (TP.notValid(maxFittedRect =
                    kallee.tempData.at('maxFittedRect'))) {
                target = aDragResponder.get('itemElement');

                targetContainer = TP.ifInvalid(
                        kallee.modifierData.at('container'),
                        TP.elementGetOffsetParent(target));

                targetRect = TP.wrap(target).getPageRect();
                containerRect = TP.wrap(targetContainer).getPageRect();

                maxPoint = targetRect.maxFittedPoint(containerRect);
                maxFittedRect =
                    TP.rtc(containerRect.getX(),
                            containerRect.getY(),
                            maxPoint.getX(),
                            maxPoint.getY());

                kallee.tempData.atPut('maxFittedRect', maxFittedRect);
            }

            xyPoint.clampToRect(maxFittedRect);
});

//  ---

TP.core.DNDResponder.Type.defineConstant(
        'FILTER_BY_STRING_OR',
function(aDragResponder, sourceTPElem, targetTPElem, itemTPElem) {

            var acceptVal,
                vendVal,

                acceptVals,
                vendVals;

            if (TP.isEmpty(acceptVal =
                            targetTPElem.getAttribute('dnd:accept'))) {
                return false;
            }

            if (TP.notEmpty(vendVal =
                            sourceTPElem.getAttribute('dnd:vend'))) {
                acceptVals = acceptVal.split(' ');
                vendVals = vendVal.split(' ');

                return acceptVals.containsAny(vendVals);
            }

            return false;
});

//  ---

TP.core.DNDResponder.Type.defineConstant(
        'FILTER_BY_STRING_AND',
function(aDragResponder, sourceTPElem, targetTPElem, itemTPElem) {

            var acceptVal,
                vendVal,

                acceptVals,
                vendVals;

            if (TP.isEmpty(acceptVal =
                            targetTPElem.getAttribute('dnd:accept'))) {
                return false;
            }

            if (TP.notEmpty(vendVal =
                            sourceTPElem.getAttribute('dnd:vend'))) {
                acceptVals = acceptVal.split(' ');
                vendVals = vendVal.split(' ');

                return acceptVals.containsAll(vendVals);
            }

            return false;
});

//  ---

TP.core.DNDResponder.Type.defineConstant(
        'FILTER_BY_TYPE',
function(aDragResponder, sourceTPElem, targetTPElem, itemTPElem) {

            var acceptVal,
                vendVal,

                sig,

                acceptVals,
                vendVals;

            //  If there is no value for 'dnd:accept', then we can early
            //  exit here with false. 'Nothing to see here'...
            if (TP.isEmpty(acceptVal =
                            targetTPElem.getAttribute('dnd:accept'))) {
                return false;
            }

            if (TP.notEmpty(vendVal =
                            sourceTPElem.getAttribute('dnd:vend'))) {
                //  Grab 1...n type names from the vend values and try to
                //  compute TIBET type names from them.
                vendVals = vendVal.split(' ');

                //  Manufacture a DOMDNDWillVend signal
                sig = TP.sig.DOMDNDWillVend.construct(null);

                //  Manually call 'handle' against any type names that can
                //  be derived from each vend value
                vendVals.perform(
                    function(aVal) {

                        var typ;

                        if (TP.isType(typ = TP.sys.getTypeByName(aVal))) {
                            typ.handle(sig);
                        }
                    });

                //  If the signal has been 'prevent default'ed, then return
                //  false
                if (sig.shouldPrevent()) {
                    return false;
                }

                //  Now fire the signal, using the source as the 'signal
                //  source'
                sig = sourceTPElem.signal(sig);

                //  If the signal has been 'prevent default'ed, then return
                //  false
                if (sig.shouldPrevent()) {
                    return false;
                }

                //  Grab 1...n type names from the accept values and try to
                //  compute TIBET type names from them.
                acceptVals = acceptVal.split(' ');

                //  Manufacture a DOMDNDWillAccept signal
                sig = TP.sig.DOMDNDWillAccept.construct(null);

                //  Manually call 'handle' against any type names that can
                //  be derived from each accept value
                acceptVals.perform(
                    function(aVal) {

                        var typ;

                        if (TP.isType(typ = TP.sys.getTypeByName(aVal))) {
                            typ.handle(sig);
                        }
                    });

                //  If the signal has been 'prevent default'ed, then return
                //  false
                if (sig.shouldPrevent()) {
                    return false;
                }

                //  Now fire the signal, using the target as the 'signal
                //  source'
                sig = targetTPElem.signal(sig);

                //  If the signal has been 'prevent default'ed, then return
                //  false
                if (sig.shouldPrevent()) {
                    return false;
                }

                //  Otherwise, return true
                return true;
            }

            return false;
});

//  ---

TP.core.DNDResponder.Type.defineConstant(
        'FILTER_BY_PATH',
function(aDragResponder, sourceTPElem, targetTPElem, itemTPElem) {

            var vendVal,
                matchedElems;

            //  The target element only needs to have a 'dnd:accept' value.
            //  We don't pay attention to the actual value.
            if (!targetTPElem.hasAttribute('dnd:accept')) {
                return false;
            }

            if (TP.notEmpty(vendVal =
                            sourceTPElem.getAttribute('dnd:vend'))) {
                if (TP.notEmpty(matchedElems = sourceTPElem.get(vendVal))) {
                    return matchedElems.contains(
                                sourceTPElem.getNativeNode(), TP.IDENTITY);
                }
            }

            return false;
});

//  ---

TP.core.DNDResponder.Type.defineConstant(
        'FILTER_BY_DTD',
function(aDragResponder, sourceTPElem, targetTPElem, itemTPElem) {

            //  The target element only needs to have a 'dnd:accept' value.
            //  We don't pay attention to the actual value.
            if (!targetTPElem.hasAttribute('dnd:accept')) {
                return false;
            }

            return TP.w3.DocType.HTML_401_STRICT.get(
                        'dtdInfo').elementIsValidChildOf(
                                itemTPElem.getTagName().toLowerCase(),
                                targetTPElem.getTagName().toLowerCase());
});

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.DNDResponder.Type.defineMethod('initialize',
function() {

    /**
     * @name initialize
     * @synopsis Performs one-time setup for the type on startup/import.
     */

    var dndStateMachine,
        dndSingleton;

    //  Construct a new state machine and use it as the state machine for
    //  the DND singleton.
    dndStateMachine = TP.core.DragMachine.construct();

    dndSingleton = this.construct(dndStateMachine);

    //  Install an 'draggingExit' that will clear certain properties that
    //  are set up using markup configuration
    dndSingleton.defineMethod(
            'draggingExit',
            function(aSignal) {

                this.callNextMethod();

                //  Since this is a shared responder, we need to teardown it's
                //  responder data.
                this.teardownDataModifiers();

                //  These parameters need to be reset since this responder
                //  is shared and may be used again
                this.set('actionElement', null);
                this.set('xOffset', 0);
                this.set('yOffset', 0);
                this.set('dragCorner', null);

                return this;
            });

    dndSingleton.setID('DNDService');
    TP.sys.registerObject(dndSingleton);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The 'real' action element. This type uses a 'cover element' as the
//  action element.
TP.core.DNDResponder.Inst.defineAttribute('$realActionElem');

//  The item element - the element that the 'action element' (i.e. the DND
//  representation element) was generated from.
TP.core.DNDResponder.Inst.defineAttribute('itemElement');

//  The item element's offset X/Y point.
TP.core.DNDResponder.Inst.defineAttribute('itemPagePoint');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.DNDResponder.Inst.defineMethod('computeOffsetPoint',
function() {

    /**
     * @name computeOffsetPoint
     * @synopsis Computes the gestures initial 'offset point'.
     * @description When computing the offset point, this method takes into
     *     account the following parameters: - The initial starting point - The
     *     offset from the action element's offset parent to the action element.
     *     - The border and margin from the action element's offset parent. -
     *     The 'drag corner' that was configured for the gesture.
     * @returns {TP.core.DragResponder} The receiver.
     */

    var startPoint,
        startX,
        startY,

        actionElem,

        itemPagePoint,

        offsetParent,

        borderXOffset,
        borderYOffset,

        offsetX,
        offsetY,

        corner,
        elemBox,

        offsetPoint;

    //  In this type, the action element is the 'clone element' that we are
    //  dragging.

    if (!TP.isElement(actionElem = this.get('actionElement'))) {
        return;
    }

    startPoint = this.get('startPoint');
    startX = startPoint.getX();
    startY = startPoint.getY();

    //  In this type, we don't worry about container offsets, since the
    //  action element is always a child of the 'body'.
    //  We do, however, have to obtain offsets from the original source
    //  element and compute those in.
    itemPagePoint = this.get('itemPagePoint');

    //  We do want to make sure that if the 'body' has a border, we account
    //  for it though
    offsetParent = TP.elementGetOffsetParent(actionElem);

    borderXOffset = TP.elementGetBorderInPixels(offsetParent, TP.LEFT);
    borderYOffset = TP.elementGetBorderInPixels(offsetParent, TP.TOP);

    offsetX = startX - borderXOffset - itemPagePoint.getX();
    offsetY = startY - borderYOffset - itemPagePoint.getY();

    if (TP.isValid(corner = this.get('dragCorner'))) {
        //  Since moving/resizing happens by setting 'top', 'left', 'width'
        //  or 'height' of the 'style' property, we need to use the *content
        //  box* when measuring.
        elemBox = TP.elementGetPageBox(actionElem, TP.CONTENT_BOX);

        switch (corner) {
            case    TP.TOP:

            break;

            case    TP.TOP_RIGHT:

                offsetX = elemBox.at('left') + elemBox.at('width') - startX;

            break;

            case    TP.RIGHT:

                offsetX = elemBox.at('left') + elemBox.at('width') - startX;

            break;

            case    TP.BOTTOM_RIGHT:

                offsetX = elemBox.at('left') + elemBox.at('width') - startX;
                offsetY = elemBox.at('top') + elemBox.at('height') - startY;

            break;

            case    TP.BOTTOM:

                offsetY = elemBox.at('top') + elemBox.at('height') - startY;

            break;

            case    TP.BOTTOM_LEFT:

                offsetY = elemBox.at('top') + elemBox.at('height') - startY;

            break;

            case    TP.LEFT:

            break;

            case    TP.TOP_LEFT:

            break;
        }
    }

    offsetPoint = TP.pc(offsetX, offsetY);

    this.set('$offsetPoint', offsetPoint);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DNDResponder.Inst.defineMethod('draggingEnter',
function(aSignal) {

    /**
     * @name draggingEnter
     * @synopsis Executed when the state machine associated with this receiver
     *     enters the 'dragging' state. This method performs whatever processing
     *     is necessary to start the dragging process.
     * @param {TP.sig.StateInput} aSignal The state input signal generated by
     *     the state machine machinery.
     */

    var actionElem,
        dndElem,

        acceptElems;

    //  Do this *first* before setting up the rest of the state machine

    //  Grab the current 'action element' - we'll actually use that as the
    //  'drag rep' element. The real action element will be the dndElem.
    if (!TP.isElement(actionElem = this.get('actionElement'))) {
        //  TODO: Bad stuff here...
        return;
    }

    dndElem = this.makeDragElementFrom(actionElem);

    this.set('$realActionElem', actionElem);
    this.set('actionElement', dndElem);

    acceptElems = TP.nodeGetDescendantElementsByAttribute(
                        TP.nodeGetDocument(actionElem),
                        'dnd:accept');

    //  Now go ahead and 'call up' - this starts up the manipulator's state
    //  machine
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.DNDResponder.Inst.defineMethod('draggingExit',
function(aSignal) {

    /**
     * @name draggingExit
     * @synopsis Executed when the state machine associated with this receiver
     *     exits the 'dragging' state. This method performs whatever processing
     *     is necessary to stop the dragging process.
     * @param {TP.sig.StateInput} aSignal The state input signal generated by
     *     the state machine machinery.
     */

    var targetTPElem,
        sigPayload,

        dndElem;

    if (TP.isValid(targetTPElem =
                    TP.core.UIElementNode.get('currentDNDTarget'))) {
        sigPayload = TP.hc('dndSource',
                            TP.core.UIElementNode.get('currentDNDSource'),
                            'dndTarget',
                            targetTPElem);

    } else {
        sigPayload = TP.hc('dndSource',
                            TP.core.UIElementNode.get('currentDNDSource'));
    }

    if (TP.isValid(targetTPElem) && targetTPElem.willDrop()) {
        //  Send a 'TP.sig.DOMDNDSucceeded' signal
        this.signal('TP.sig.DOMDNDSucceeded', arguments, sigPayload);
    } else {
        //  Send a 'TP.sig.DOMDNDFailed' signal
        this.signal('TP.sig.DOMDNDFailed', arguments, sigPayload);
    }

    //  Send a 'TP.sig.DOMDNDCompleted' signal
    this.signal('TP.sig.DOMDNDCompleted', arguments, sigPayload);

    TP.core.UIElementNode.Type.set('currentDNDSource', null);
    TP.core.UIElementNode.Type.set('currentDNDTarget', null);
    TP.core.UIElementNode.Type.set('currentDNDItem', null);

    //  Send a 'TP.sig.DOMDNDTerminate' signal
    this.signal('TP.sig.DOMDNDTerminate');

    //  Reset the D&D infrastructure


    //  NB: These steps are in a very particular order, due to the logic in
    //  supertypes.

    //  This will be the 'drag element' used by the receiver to drag the
    //  content around. NB: We need to grab this reference before 'calling
    //  up', since the action element gets cleared.
    dndElem = this.get('actionElement');

    //  Next, 'call up'. Need to do this before we 'empty the content'.
    this.callNextMethod();

    //  Remove the drag element to avoid problems with mouse events which
    //  might hit the element by mistake.
    TP.nodeDetach(dndElem);

    this.set('actionElement', this.get('$realActionElem'));

    return;
});

//  ------------------------------------------------------------------------

TP.core.DNDResponder.Inst.defineMethod('handleTargetIn',
function(aSignal) {

    //TP.info('Signaled: ' + TP.str(aSignal), TP.LOG, arguments),

    var evtTargetTPElem,

        targetTPElem;

    evtTargetTPElem = TP.wrap(aSignal.at('targetRect').get('targetElement'));

    if (TP.isValid(targetTPElem = evtTargetTPElem.getDNDTarget()) &&
        targetTPElem.isValidTarget()) {
        TP.core.UIElementNode.Type.set('currentDNDTarget',
                                                targetTPElem);

        //  Send a 'TP.sig.DOMDNDTargetOver' signal
        targetTPElem.signal('TP.sig.DOMDNDTargetOver');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DNDResponder.Inst.defineMethod('handleTargetOut',
function(aSignal) {

    //TP.info('Signaled: ' + TP.str(aSignal), TP.LOG, arguments),

    var targetTPElem;

    if (TP.notValid(targetTPElem =
                    TP.core.UIElementNode.get('currentDNDTarget'))) {
        return this;
    }

    //  Send a 'TP.sig.DOMDNDTargetOut' signal
    targetTPElem.signal('TP.sig.DOMDNDTargetOut');

    TP.core.UIElementNode.Type.set('currentDNDTarget', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DNDResponder.Inst.defineMethod('makeDragElementFrom',
function(anElement) {

    /**
     * @name makeDragElementFrom
     * @synopsis Returns the element to drag, creating it if necessary. This
     *     presets the manufactured drag element's top, left, width and height
     *     to those of the supplied element.
     * @param {HTMLElement} anElement The element supplied to use to position
     *     the manufactured element.
     * @returns {HTMLElement} The element using as a 'dragging element' for use
     *     in drag and drop operations.
     */

    var dragDoc,
        dragElement,

        dragCoords,

        dragElementWidth,
        dragElementHeight,

        dragCoverElement;

    if (TP.notValid(dragDoc = TP.nodeGetDocument(anElement))) {
        //  TODO: Throw an exception here?

        return;
    }

    //  Create a drag element and identify it for later lookup.
    dragElement = TP.documentCreateElement(dragDoc,
                                            'div',
                                            TP.w3.Xmlns.XHTML);
    dragElement.setAttribute('id', '__dragElement__');

    //  Set the style here (note that we'll set the z-index later when
    //  we begin the drag session - which we have to do anyway for
    //  dragging elements that we haven't created here).
    dragElement.setAttribute(
        'style',
        'position: absolute; z-index: ' + TP.DRAG_DROP_TIER);
    dragElement._tibetGenerated = true;
    TP.nodeAppendChild(TP.documentGetBody(dragDoc), dragElement, false);

    //  Note that we don't worry about reassignment here
    TP.nodeAppendChild(dragElement, anElement, false);

    dragCoords = this.get('itemPagePoint');

    dragElement.style.left = dragCoords.getX() + 'px';
    dragElement.style.top = dragCoords.getY() + 'px';

    //  The width of the drag element is going to be the same as the
    //  original element.
    dragElementWidth = TP.elementGetContentWidth(anElement);
    dragElementHeight = TP.elementGetContentHeight(anElement);

    //  Set its width and height based on the width and height of the
    //  content of the original element.
    TP.elementSetWidth(dragElement, dragElementWidth);
    TP.elementSetHeight(dragElement, dragElementHeight);

    //  Generate a 'drag cover element' to cover the entire contents of the
    //  dragElement. We append this last so that if spurious mouse events
    //  occur where the user was moving the drag element so fast that they
    //  actually dragged the mouse *back* over the top of the dragElement
    //  those events will be trapped by this drag cover element.
    if (TP.notValid(dragCoverElement = dragElement.dragCoverElement)) {
        dragCoverElement = TP.documentCreateElement(dragDoc, 'div',
                                                    TP.w3.Xmlns.XHTML);

        dragCoverElement.setAttribute(
                    'style',
                    'position: absolute; background-color: transparent; ' +
                    'top: -5px; right: -5px; bottom: -5px; left: -5px; ');

        dragElement.dragCoverElement = dragCoverElement;
    }

    //  Note that we don't worry about reassignment here (but we do append
    //  the transparent 'cover element' *after* the content element).
    TP.nodeAppendChild(dragElement, dragCoverElement, false);

    return dragElement;
});

//  ------------------------------------------------------------------------

TP.core.DNDResponder.Inst.defineMethod('setupFrom',
function(infoTPElement, srcTPElement, evtTPElement, attrHash) {

    /**
     * @name setupFrom
     * @synopsis Sets up the receiver by using well-known attributes present on
     *     the supplied info element.
     * @param {TP.core.ElementNode} infoTPElement The TPElement to obtain
     *     configuration information from.
     * @param {TP.core.ElementNode} srcTPElement The TPElement that acts as the
     *     'source' of the drag operation.
     * @param {TP.core.ElementNode} evtTPElement The TPElement that the
     *     originating event occurred in and which might be used as the action
     *     element.
     * @param {TP.core.Hash} attrHash An optional hash that this method will use
     *     instead of the attribute data from the element.
     * @returns {TP.core.DNDResponder} The receiver.
     * @todo
     */

    var attrs,

        attrVal,
        containerElem;

    if (TP.notValid(attrs = attrHash)) {
        attrs = infoTPElement.getAttributes();
    }

    //  If the author has configured a drag container, install our own
    //  modifier function for that and remove the key so that supertypes
    //  won't install anything else for that.

    //  Note here how we specify both 'autocollapse' and 'retry with
    //  document', for the TP.nodeEvaluatePath() call since we only want one
    //  element and we want the document to be retried as the context node -
    //  very useful for CSS paths.
    if (TP.notEmpty(attrVal = attrs.at('drag:container')) &&
        TP.isElement(containerElem = TP.nodeEvaluatePath(
                                        evtTPElement.getNativeNode(),
                                        attrVal,
                                        null,
                                        true,
                                        true))) {
        this.addDataModifier(
                TP.core.DNDResponder.CLAMP_X_AND_Y_TO_CONTAINER,
                TP.hc('container', containerElem));

        attrs.removeKey('drag:container');
    }

    //  NB: We do *not* call up to the TP.core.MoveResponder's method here,
    //  since we have different logic for setup.

    return this;
});

//  ========================================================================
//  TP.core.UIElementNode additions
//  ========================================================================

/**
 * @synopsis Additions to the TP.core.UIElementNode type to support drag and
 *     drop operations.
 */

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.core.UIElementNode.Type.defineConstant(
        'DRAG_CSS_PROPERTY_NAMES',
        TP.ac('background', 'backgroundAttachment', 'backgroundColor',
                'backgroundImage', 'backgroundPosition', 'backgroundRepeat',
                'border', 'borderBottom', 'borderBottomColor',
                'borderBottomStyle', 'borderBottomWidth', 'borderCollapse',
                'borderColor', 'borderLeft', 'borderLeftColor',
                'borderLeftStyle', 'borderLeftWidth', 'borderRight',
                'borderRightColor', 'borderRightStyle', 'borderRightWidth',
                'borderSpacing', 'borderStyle', 'borderTop',
                'borderTopColor', 'borderTopStyle', 'borderTopWidth',
                'borderWidth', 'clear', 'clip', 'color',
                'content', 'counterIncrement', 'counterReset', 'cssFloat',
                'cursor', 'direction', 'display', 'emptyCells', 'font',
                'fontFamily', 'fontSize', 'fontSizeAdjust', 'fontStretch',
                'fontStyle', 'fontVariant', 'fontWeight', 'height',
                'letterSpacing', 'lineHeight', 'listStyle',
                'listStyleImage', 'listStylePosition', 'listStyleType',
                'margin', 'marginBottom', 'marginLeft', 'marginRight',
                'marginTop', 'maxHeight', 'maxWidth', 'minHeight',
                'minWidth', 'outline', 'outlineColor', 'outlineStyle',
                'outlineWidth', 'overflow', 'padding', 'paddingBottom',
                'paddingLeft', 'paddingRight', 'paddingTop', 'position',
                'quotes', 'size', 'tableLayout', 'textAlign',
                'textDecoration', 'textIndent', 'textShadow',
                'textTransform', 'unicodeBidi', 'verticalAlign',
                'visibility', 'whiteSpace', 'width', 'wordSpacing'));

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.UIElementNode.Type.defineAttribute('currentDNDSource');
TP.core.UIElementNode.Type.defineAttribute('currentDNDTarget');
TP.core.UIElementNode.Type.defineAttribute('currentDNDItem');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.UIElementNode.Type.defineMethod('handlePeerTP_sig_DOMDragDown',
function(aTargetElem, anEvent) {

    /**
     * @name handlePeerTP_sig_DOMDragDown
     * @param {HTMLElement} aTargetElem The target element computed for this
     *     signal.
     * @param {Event} anEvent The native event that was triggered.
     * @raises TP.sig.InvalidElement
     * @returns {TP.core.UIElementNode} The receiver.
     * @abstract
     * @todo
     */

    var evtTargetTPElem,
        sourceTPElem,
        infoTPElem,

        moveResponder,
        resizeResponder,

        dndResponder,
        sig,

        itemTPElem,

        actionElem,
        itemElem,

        itemOffsets;

    if (!TP.isElement(aTargetElem)) {
        return this.raise('TP.sig.InvalidElement', arguments);
    }

    //  Grab the event target element and wrap it
    evtTargetTPElem = TP.wrap(aTargetElem);

    //  Check to see if the event target TPElement will move. If so,
    //  activate the shared MoveService (an instance of
    //  TP.core.MoveResponder), set it up, activate it and exit.
    if (evtTargetTPElem.willMove()) {
        if (TP.isValid(moveResponder = TP.byOID('MoveService'))) {
            //  Ask the wrapped event target element for its 'drag source'
            //  TP.core.Element. If it can't find one, then it acts as it's own.
            sourceTPElem = evtTargetTPElem.getDragSource();

            //  Ask the drag source TPElement for its 'drag info'
            //  TP.core.Element
            infoTPElem = sourceTPElem.getDragInfo();

            //  Set up the responder using the info, source and event
            //  target native elements
            moveResponder.setupFrom(infoTPElem,
                                    sourceTPElem,
                                    evtTargetTPElem);
        }

        moveResponder.activate();

        return this;
    }

    //  Check to see if the event target TPElement will resize. If so,
    //  activate the shared ResizeService (an instance of
    //  TP.core.ResizeResponder), set it up, activate it and exit.
    if (evtTargetTPElem.willResize()) {
        if (TP.isValid(resizeResponder = TP.byOID('ResizeService'))) {
            //  Ask the wrapped event target element for its 'drag source'
            //  TPElement
            sourceTPElem = evtTargetTPElem.getDragSource();

            //  Ask the drag source TPElement for its 'drag info'
            //  TPElement
            infoTPElem = sourceTPElem.getDragInfo();

            //  Set up the responder using the info, source and event
            //  target native elements
            resizeResponder.setupFrom(infoTPElem,
                                        sourceTPElem,
                                        evtTargetTPElem);
        }

        resizeResponder.activate();

        return this;
    }

    //  Check to see if the event target TPElement will grab. If so, obtain
    //  the drag-and-drop 'source' TPElement and proceed from there.
    if (evtTargetTPElem.willGrab() &&
        TP.isValid(sourceTPElem = evtTargetTPElem.getDNDSource())) {
        if (TP.isValid(dndResponder = TP.byOID('DNDService'))) {
            //  Send a 'TP.sig.DOMDNDInitiate' signal and make sure no one
            //  cancels it
            sig = dndResponder.signal('TP.sig.DOMDNDInitiate');
            if (sig.shouldPrevent()) {
                return this;
            }

            //  Ask the source TPElement for its 'drag info' TPElement. This
            //  very well may be the sourceTPElem itself if there is no
            //  separate element pointed to by 'drag:info'.
            infoTPElem = sourceTPElem.getDNDInfo();

            //  Get the 'drag item' TPElement. Again, this very well may be
            //  the sourceTPElem itself, but it might an 'item' within the
            //  source or some other element. It's the one we actually want
            //  to drag.
            itemTPElem = infoTPElem.getDragItem();

            //  Ask the item TPElement if a 'DND representation element' can
            //  be computed. If one can be, then set up the shared DND
            //  responder.
            if (TP.isElement(actionElem = itemTPElem.getDNDRepElement())) {
                //  Set up the shared dnd responder using the info, source
                //  and event target native elements

                //  Note here how we make the 'action element' be the rep
                //  element that was computed from the item element.
                dndResponder.setupFrom(infoTPElem,
                                        sourceTPElem,
                                        evtTargetTPElem);
                dndResponder.set('actionElement', actionElem);

                //  Some filter functions need a handle to the item element
                //  itself.
                itemElem = itemTPElem.getNativeNode();
                dndResponder.set('itemElement', itemElem);

                //  Grab the item elements pageX/pageY. This will be used
                //  when computing where to place the rep element.
                itemOffsets = TP.elementGetPageXY(itemElem);
                dndResponder.set('itemPagePoint', TP.pc(itemOffsets));

                TP.core.UIElementNode.Type.set(
                                        'currentDNDSource', sourceTPElem);
                TP.core.UIElementNode.Type.set(
                                        'currentDNDItem', itemTPElem);

                //  Activate the D&D manipulator singleton. It will
                //  deactivate itself at the proper time.
                dndResponder.activate();
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getDragInfo',
function() {

    /**
     * @name getDragInfo
     * @returns {TP.core.ElementNode}
     * @abstract
     * @todo
     */

    var attrVal,
        infoElem;

    //  If there is no 'drag:info' attribute on the element, then we just
    //  return the receiver.
    if (!this.hasAttribute('drag:info')) {
        return this;
    }

    if (TP.notEmpty(attrVal = TP.elementGetAttribute(this.getNativeNode(),
                                                        'drag:info',
                                                        true))) {
        //  Note here how we specify both 'autocollapse' and 'retry with
        //  document', since we only want one element and we want the
        //  document to be retried as the context node - very useful for CSS
        //  paths.
        if (TP.isElement(
                infoElem =
                    TP.nodeEvaluatePath(
                        this.getNativeNode(), attrVal, null, true, true))) {
            return TP.wrap(infoElem);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getDragItem',
function() {

    /**
     * @name getDragItem
     * @returns {TP.core.ElementNode}
     * @abstract
     * @todo
     */

    var attrVal,

        lastDown,

        targetElem,
        itemElem,

        sourceNatElem;

    //  If there is no 'drag:item' attribute on the info element, then we
    //  just return the source, since they're one and the same.
    if (!this.hasAttribute('drag:item')) {
        return this;
    }

    //  If we found a 'drag:item' attribute, we see what it's value is. If
    //  its 'target', then we use the 'lastDown's target element. Otherwise,
    //  we assume that its a path and we execute the path *in the context of
    //  the source element*

    attrVal = this.getAttribute('drag:item');

    if (attrVal === 'target') {
        lastDown = TP.core.Mouse.get('lastDown');
        if (TP.isElement(targetElem = TP.eventGetResolvedTarget(lastDown))) {
            itemElem = targetElem;
        }
    } else {
        sourceNatElem = this.getNativeNode();

        //  Note here how we specify 'autocollapse' for the
        //  TP.nodeEvaluatePath() call since we only want one element
        if (!TP.isElement(itemElem = TP.nodeEvaluatePath(
                                            sourceNatElem,
                                            attrVal,
                                            null,
                                            true))) {
            itemElem = sourceNatElem;
        }
    }

    return TP.wrap(itemElem);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getDragSource',
function() {

    /**
     * @name getDragSource
     * @returns {TP.core.ElementNode}
     * @abstract
     * @todo
     */

    var sourceTPElem,
        infoTPElem,

        results;

    //  If the receiver itself has a 'dnd:mover' or 'dnd:resizer'
    //  attribute, then we can use it.
    if (this.hasAttribute('drag:mover') ||
        this.hasAttribute('drag:resizer')) {
        return this;
    }

    //  Otherwise, we scan upwards through our ancestors looking for a
    //  'drag:item' attribute
    sourceTPElem =
        this.detectAncestor(
            function(ansNatNode) {

                return TP.elementHasAttribute(ansNatNode,
                                                'drag:mover',
                                                true) ||
                        TP.elementHasAttribute(ansNatNode,
                                                'drag:resizer',
                                                true);
            });

    //  If we found a valid source TP.core.ElementNode, get its 'info'
    //  TP.core.ElementNode and make sure that the receiver's native node is
    //  part of the results returned by executing the path supplied in the
    //  'drag:item' attribute (relative to the source element).
    if (TP.isValid(sourceTPElem)) {
        infoTPElem = sourceTPElem.getDragInfo();
        if (infoTPElem.hasAttribute('drag:item')) {
            if (TP.notEmpty(results = TP.nodeEvaluatePath(
                                    sourceTPElem.getNativeNode(),
                                    infoTPElem.getAttribute('drag:item'),
                                    null))) {
                //  Confirmed that the receiver does exist within the path
                //  given as the 'drag:item' on the infoTPElementNode
                if (results.contains(this.getNativeNode(), TP.IDENTITY)) {
                    return sourceTPElem;
                }
            }
        }
    }

    //  If we can't find a drag info for ourself, then we act as our own.
    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getDNDInfo',
function() {

    /**
     * @name getDNDInfo
     * @returns {TP.core.ElementNode}
     * @abstract
     * @todo
     */

    var attrVal,
        infoElem;

    //  If there is no 'dnd:info' attribute on the element, then we just
    //  return the receiver (which should be the source), since they're one
    //  and the same.
    if (!this.hasAttribute('dnd:info')) {
        return this;
    }

    if (TP.notEmpty(attrVal = TP.elementGetAttribute(this.getNativeNode(),
                                                        'dnd:info',
                                                        true))) {
        //  Note here how we specify both 'autocollapse' and 'retry with
        //  document', since we only want one element and we want the
        //  document to be retried as the context node - very useful for CSS
        //  paths.
        if (TP.isElement(
                    infoElem =
                        TP.nodeEvaluatePath(
                        this.getNativeNode(), attrVal, null, true, true))) {
            return TP.wrap(infoElem);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getDNDRepElement',
function() {

    /**
     * @name getDNDRepElement
     * @synopsis Returns a native Element node that will represent the receiver
     *     during a drag and drop operation. At this type level, this method
     *     provides the default implementation of this method, which is to
     *     return the receiver's native node.
     * @raises TP.sig.InvalidElement
     * @returns {Element} The native Element to use as a representation during a
     *     drag and drop operation.
     * @todo
     */

    var elem,

        attrVal,

        repElem,

        dragClone;

    if (TP.notValid(elem = this.getNativeNode())) {
        return this.raise('TP.sig.InvalidElement', arguments);
    }

    if (TP.notEmpty(attrVal = TP.elementGetAttribute(elem,
                                                        'dnd:rep',
                                                        true))) {
        //  Note here how we specify both 'autocollapse' and 'retry with
        //  document', since we only want one element and we want the
        //  document to be retried as the context node - very useful for CSS
        //  paths.
        if (!TP.isElement(repElem = TP.nodeEvaluatePath(
                                        elem, attrVal, null, true, true))) {
            repElem = elem;
        }
    } else {
        repElem = elem;
    }

    dragClone = TP.nodeCloneNode(repElem);

    TP.elementSetStyle(
                dragClone,
                TP.elementGetComputedStyle(
                    repElem,
                    TP.core.UIElementNode.DRAG_CSS_PROPERTY_NAMES));

    //  Remove the 'id' to make sure the clone is unique in the document.
    TP.elementRemoveAttribute(dragClone, 'id');

    //  Make sure that the clone is 'shown' - if the D&D rep was gotten from
    //  a hidden block somewhere, it may not be showing
    TP.elementShow(dragClone);

    return dragClone;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getDNDSource',
function() {

    /**
     * @name getDNDSource
     * @returns {TP.core.ElementNode}
     * @abstract
     * @todo
     */

    //  If the receiver itself has a 'dnd:vend' attribute, then we can use
    //  it.
    if (this.hasAttribute('dnd:vend')) {
        return this;
    }

    //  Otherwise, we need to traverse the parent chain, looking for a
    //  'dnd:vend'.
    return this.detectAncestor(
                function(ansNatNode) {

                    return TP.elementHasAttribute(ansNatNode,
                                                    'dnd:vend',
                                                    true);
                });
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getDNDTarget',
function() {

    /**
     * @name getDNDTarget
     * @returns {TP.core.ElementNode}
     * @abstract
     * @todo
     */

    //  If the receiver itself has a 'dnd:accept' attribute, then we can
    //  grab it.
    if (this.hasAttribute('dnd:accept')) {
        return this;
    }

    //  Otherwise, we need to traverse the parent chain, looking for a
    //  'dnd:accept'.
    return this.detectAncestor(
                function(ansNatNode) {

                    return TP.elementHasAttribute(ansNatNode,
                                                    'dnd:accept',
                                                    true);
                });
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('isValidTarget',
function() {

    /**
     * @name isValidTarget
     * @returns {Boolean}
     * @abstract
     * @todo
     */

    var dndSource,
        dndItem,

        testFuncName,

        dragResponder;

    if (!this.hasAttribute('dnd:accept')) {
        return false;
    }

    if (TP.notValid(dndSource = this.getType().get('currentDNDSource')) ||
        TP.notValid(dndItem = this.getType().get('currentDNDItem'))) {
        return false;
    }

    testFuncName = TP.ifEmpty(dndSource.getAttribute('dnd:filter'),
                                'FILTER_BY_STRING_OR');

    //  Try some built-in values
    switch (testFuncName) {
        case 'or':
            testFuncName = 'FILTER_BY_STRING_OR';
            break;

        case 'and':
            testFuncName = 'FILTER_BY_STRING_AND';
            break;

        case 'type':
            testFuncName = 'FILTER_BY_TYPE';
            break;

        case 'path':
            testFuncName = 'FILTER_BY_PATH';
            break;

        case 'dtd':
            testFuncName = 'FILTER_BY_DTD';
            break;

        default:
            break;
    }

    if (!TP.isCallable(TP.core.DNDResponder[testFuncName])) {
        return false;
    }

    if (TP.notValid(dragResponder = TP.byOID('DNDService'))) {
        return false;
    }

    return TP.core.DNDResponder[testFuncName](dragResponder,
                                                dndSource,
                                                this,
                                                dndItem);
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('willDrop',
function() {

    /**
     * @name willDrop
     * @returns {Boolean}
     * @abstract
     * @todo
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('willGrab',
function() {

    /**
     * @name willGrab
     * @returns {Boolean}
     * @abstract
     * @todo
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('willMove',
function() {

    /**
     * @name willMove
     * @returns {Boolean}
     * @abstract
     * @todo
     */

    var sourceTPElem,
        infoTPElem,

        results;

    //  If the receiver' 'drag info' element (usually itself) has a
    //  'drag:mover' attribute, then we just return true
    if (this.getDragInfo().hasAttribute('drag:mover')) {
        return true;
    }

    //  Otherwise, we scan upwards through our ancestors looking for a
    //  'drag:item' attribute
    sourceTPElem =
        this.detectAncestor(
                function(ansNatNode) {

                    return TP.elementHasAttribute(ansNatNode,
                                                    'drag:item',
                                                    true);
                });

    //  If we found a valid source TP.core.ElementNode, get its 'info'
    //  TP.core.ElementNode and make sure that the info TP.core.ElementNode has
    //  a 'drag:mover' attribute and that the receiver's native node is part
    //  of the results returned by executing the path supplied in the
    //  'drag:item' attribute (relative to the source element).
    if (TP.isValid(sourceTPElem)) {
        infoTPElem = sourceTPElem.getDragInfo();

        if (!infoTPElem.hasAttribute('drag:mover')) {
            return false;
        }

        if (TP.notEmpty(results = TP.nodeEvaluatePath(
                                    sourceTPElem.getNativeNode(),
                                    infoTPElem.getAttribute('drag:item'),
                                    null))) {
            return results.contains(this.getNativeNode(), TP.IDENTITY);
        }
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('willResize',
function() {

    /**
     * @name willResize
     * @returns {Boolean}
     * @abstract
     * @todo
     */

    var sourceTPElem,
        infoTPElem,

        results;

    //  If the receiver' 'drag info' element (usually itself) has a
    //  'drag:resizer' attribute, then we just return true
    if (this.getDragInfo().hasAttribute('drag:resizer')) {
        return true;
    }

    //  Otherwise, we scan upwards through our ancestors looking for a
    //  'drag:item' attribute
    sourceTPElem =
        this.detectAncestor(
                function(ansNatNode) {

                    return TP.elementHasAttribute(ansNatNode,
                                                    'drag:item',
                                                    true);
                });

    //  If we found a valid source TP.core.ElementNode, get its 'info'
    //  TP.core.ElementNode and make sure that the info TP.core.ElementNode has
    //  a 'drag:resizer' attribute and that the receiver's native node is part
    //  of the results returned by executing the path supplied in the
    //  'drag:item' attribute (relative to the source element).
    if (TP.isValid(sourceTPElem)) {
        infoTPElem = sourceTPElem.getDragInfo();

        if (!infoTPElem.hasAttribute('drag:resizer')) {
            return false;
        }

        if (TP.notEmpty(results = TP.nodeEvaluatePath(
                                    sourceTPElem.getNativeNode(),
                                    infoTPElem.getAttribute('drag:item'),
                                    null))) {
            return results.contains(this.getNativeNode(), TP.IDENTITY);
        }
    }

    return false;
});

//  ========================================================================
//  TP.core.DragTracker
//  ========================================================================

/**
 * @type {TP.core.DragTracker}
 * @synopsis The TP.core.DragTracker is a StateResponder which responds to the
 *     current drag state and related events by tracking the mouse relative to a
 *     "domain" of objects.
 * @description Based on the configuration of the tracker instance the various
 *     geometric relationships between the mouse, any currently active drag
 *     element, and the domain objects, cause the tracker to signal
 *     "interesting" events. For example, a tracker configured for drag
 *     rectangle computations can be used to assist with over/out processing
 *     which avoids the problem of the mouse being over the drag element and not
 *     provided accurate over/out events itself. As another example a tracker
 *     might be configured to watch for edge-detection/alignment with the mouse
 *     and signaling when edges, centerpoints, or other alignments occur. These
 *     events could be observed by a "guideline displayer" to provide visual
 *     feedback.
 */

//  ------------------------------------------------------------------------

TP.core.StateResponder.defineSubtype('DragTracker');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  ---
//  "Filter functions"...functions which restrict the domain objects to a
//  subset that matches some criteria.
//  ---

TP.core.DragTracker.Type.defineConstant('VEND_ACCEPT',
    function(domainObj, computeObj, mouseEvent) {
        //  Returns true if the vend and accept attributes are a match.
    });


//  ---
//  "Range functions"...functions which collect computable values from a
//  domain object returned by a domainSpec.
//  ---

TP.core.DragTracker.Type.defineConstant('GLOBAL_CENTER',
    function(target) {
        var rect;
        if (TP.isValid(rect = this.GLOBAL_RECT(target))) {
            return rect.getCenterPoint();
        }
        return;
    });

TP.core.DragTracker.Type.defineConstant('GLOBAL_RECT',
    function(target) {
        if (TP.canInvoke(target, 'getGlobalRect')) {
            return target.getGlobalRect();
        } else if (TP.isElement(target)) {
            return TP.rtc(TP.elementGetGlobalBox(target));
        }
        return;
    });

TP.core.DragTracker.Type.defineConstant('GLOBAL_X_COORDS',
    function(target) {
        var rect;
        if (TP.isValid(rect = this.GLOBAL_RECT(target))) {
            return TP.ac(rect.getX(), rect.getX().addToX(rect.getWidth()));
        }
        return;
    });

TP.core.DragTracker.Type.defineConstant('GLOBAL_Y_COORDS',
    function(target) {
        var rect;
        if (TP.isValid(rect = this.GLOBAL_RECT(target))) {
            return TP.ac(rect.getY(), rect.getY().addToY(rect.getHeight()));
        }
        return;
    });

TP.core.DragTracker.Type.defineConstant('PAGE_CENTER',
    function(target) {
        var rect;
        if (TP.isValid(rect = this.PAGE_RECT(target))) {
            return rect.getCenterPoint();
        }
        return;
    });

TP.core.DragTracker.Type.defineConstant('PAGE_RECT',
    function(target) {
        if (TP.canInvoke(target, 'getPageRect')) {
            return target.getPageRect();
        } else if (TP.isElement(target)) {
            return TP.rtc(TP.elementGetPageBox(target));
        }
        return;
    });

TP.core.DragTracker.Type.defineConstant('PAGE_X_COORDS',
    function(target) {
        var rect;
        if (TP.isValid(rect = this.PAGE_RECT(target))) {
            return TP.ac(rect.getX(), rect.getX().addToX(rect.getWidth()));
        }
        return;
    });

TP.core.DragTracker.Type.defineConstant('PAGE_Y_COORDS',
    function(target) {
        var rect;
        if (TP.isValid(rect = this.PAGE_RECT(target))) {
            return TP.ac(rect.getY(), rect.getY().addToY(rect.getHeight()));
        }
        return;
    });


//  ---
//  "Test functions"...functions which return a boolean result relative to the
//  input data provided. The test function is effectively a "select" function
//  in TIBET terms. All domain/compute objects are iterated and those for
//  which the test function returns true become the payload of the
//  trackingSignal fired when the result set isn't empty.
//  ---

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The list of objects the tracker uses for computation.
TP.core.DragTracker.Inst.defineAttribute('computeList');

//  The list of objects the tracker resolved by executing the domainSpec.
TP.core.DragTracker.Inst.defineAttribute('domainList');

//  A function constructed from the domainSpec which is used to construct the
//  domainList.
TP.core.DragTracker.Inst.defineAttribute('domainFunction');

//  The query specification used to describe (and acquire) the domainList.
TP.core.DragTracker.Inst.defineAttribute('domainSpec');

//  The default value for the filter function...simple vend/accept matching.
TP.core.DragTracker.Inst.defineAttribute('filterFunction',
    TP.core.DragTracker.VEND_ACCEPT);

//  The default value for the range function...page rectangle.
TP.core.DragTracker.Inst.defineAttribute('rangeFunction',
    TP.core.DragTracker.PAGE_RECT);

//  The test function run against each computable as the tracker's event
//  stream is processed. The default is a simple vend/accept matcher.
TP.core.DragTracker.Inst.defineAttribute('testFunction',
    TP.core.DragTracker.VEND_ACCEPT);

//  The signal to fire when the testFunction returns at least one computable.
TP.core.DragTracker.Inst.defineAttribute('trackingSignal',
    'TP.sig.DragTrackerResults');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.DragTracker.Inst.defineMethod('init',
function(domainSpec, filterFunction, rangeFunction, testFunction, trackingSignal) {

    /**
     * @name init
     * @synopsis Initializes a new instance of the receiver.
     * @param {TP.core.StateMachine} stateMachine The state machine this
     *     responder should observe.
     * @param {String|Function} domainSpec A domain specification function or
     *     string.
     *
     *
     * @returns {TP.core.DragTracker} A new instance.
     * @todo
     */

    var machine;

    if (TP.notValid(domainSpec)) {
        return this.raise('TP.sig.InvalidParamter', arguments,
            'Invalid domain specification.');
    }

    //  Configure a DragMachine to keep the responder informed on drag state.
    machine = TP.core.DragMachine.construct();
    this.callNextMethod(machine);

    this.$set('domainSpec', domainSpec);

    //  Validate and store any filter function provided.
    if (TP.isValid(filterFunction)) {
        if (!TP.isFunction(filterFunction)) {
            return this.raise('TP.sig.InvalidFunction', arguments,
                'Invalid filter function: ' + filterFunction);
        }
        this.$set('filterFunction', filterFunction);
    }

    //  Validate and store any range function provided.
    if (TP.isValid(rangeFunction)) {
        if (!TP.isFunction(rangeFunction)) {
            return this.raise('TP.sig.InvalidFunction', arguments,
                'Invalid range function: ' + rangeFunction);
        }
        this.$set('rangeFunction', rangeFunction);
    }

    //  Validate and store any test function provided.
    if (TP.isValid(testFunction)) {
        if (!TP.isFunction(testFunction)) {
            return this.raise('TP.sig.InvalidFunction', arguments,
                'Invalid test function: ' + testFunction);
        }
        this.$set('testFunction', testFunction);
    }

    //  Validate and store any tracking signal.
    if (TP.isValid(trackingSignal)) {
        if (!TP.canInvoke(trackingSignal, 'getSignalName')) {
            return this.raise('TP.sig.InvalidParameter', arguments,
                'trackingSignal can not provide signal name: ' +
                trackingSignal);
        }
        this.$set('trackingSignal', trackingSignal.getSignalName());
    }

    this.$set('computeList', TP.ac());
    this.$set('domainList', TP.ac());

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DragTracker.Inst.defineMethod('clearComputables',
function() {

    /**
     * @name clearComputables
     * @synopsis Clears the receiver's cache of computable data.
     * @returns {TP.core.DragTracker} The receiver.
     */

    var list;

    list = this.$get('computeList');
    list.length = 0;

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DragTracker.Inst.defineMethod('clearDomain',
function() {

    /**
     * @name clearDomain
     * @synopsis Clears the receiver's cache of domain objects, the objects
     *     which provide the basis for selection sets and computations.
     * @returns {TP.core.DragTracker} The receiver.
     */

    var list;

    list = this.$get('domainList');
    list.length = 0;

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DragTracker.Inst.defineMethod('defineDefaultHandlers',
function() {

    /**
     * @name defineDefaultHandlers
     * @synopsis Provides for state configuration by subtypes so different
     *     specialized instances can be created with minimal code.
     * @todo
     */

    this.defineStateHandler('dragging', this, TP.ENTER);
    this.defineStateHandler('dragging', this, TP.TRANSITION, TP.ACTIVE);
    this.defineStateHandler('dragging', this, TP.EXIT);
    this.defineStateHandler('dragging', this, TP.INPUT);

    return;
});

//  ------------------------------------------------------------------------

TP.core.DragTracker.Inst.defineMethod('draggingEnter',
function(aSignal) {

    /**
     * @name draggingEnter
     * @synopsis Executed when the state machine associated with this receiver
     *     enters the 'dragging' state. This method performs whatever processing
     *     is necessary to start the dragging process.
     * @param {TP.sig.StateInput} aSignal The state input signal generated by
     *     the state machine machinery.
     */

    //  Invoking a refresh of the domain will cause all lists to be cleared
    //  and regenerated using our current domainSpec as the starting point.
    this.refreshDomain();

    return;
});

//  ------------------------------------------------------------------------

TP.core.DragTracker.Inst.defineMethod('draggingExit',
function(aSignal) {

    /**
     * @name draggingExit
     * @synopsis Executed when the state machine associated with this receiver
     *     exits the 'dragging' state. This method performs whatever processing
     *     is necessary to stop drag tracking.
     * @param {TP.sig.StateInput} aSignal The state input signal generated by
     *     the state machine machinery.
     */

    //  When we terminate dragging we clear our caches to avoid holding on to
    //  references to elements or other data objects.
    this.clearDomain();
    this.clearComputables();

    return;
});

//  ------------------------------------------------------------------------

TP.core.DragTracker.Inst.defineMethod('draggingTP_sig_DOMDragHover',
function(aSignal) {

    /**
     * @name draggingDOMDragHover
     * @synopsis Executed when the state machine associated with this receiver
     *     receives a TP.sig.DOMDragHover signal while in the 'dragging' state.
     * @param {TP.sig.StateInput} aSignal The state input signal generated by
     *     the state machine machinery.
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.DragTracker.Inst.defineMethod('draggingTP_sig_DOMDragMove',
function(aSignal) {

    /**
     * @name draggingDOMDragMove
     * @synopsis Executed when the state machine associated with this receiver
     *     receives a TP.sig.DOMDragMove signal while in the 'dragging' state.
     * @param {TP.sig.StateInput} aSignal The state input signal generated by
     *     the state machine machinery.
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.DragTracker.Inst.defineMethod('refreshComputables',
function() {

    /**
     * @name refreshComputables
     * @synopsis Refreshes the receiver's cache of computable data.
     * @returns {TP.core.DragTracker} The receiver.
     */

    this.clearComputables();

    //  Query each domain object using our current range function to compute a
    //  new set of computable values we'll run tracking tests against.


    return this;
});

//  ------------------------------------------------------------------------

TP.core.DragTracker.Inst.defineMethod('refreshDomain',
function() {

    /**
     * @name refreshDomain
     * @synopsis Refreshes the receiver's cache of domain objects, the objects
     *     which provide the basis for selection sets and computations.
     * @returns {TP.core.DragTracker} The receiver.
     */

    //  If the domain is being refreshed both our domain and computable lists
    //  have to be flushed. The computable list will be cleared when we
    //  refreshComputables after updating the domain list.
    this.clearDomain();

    //  Run the current domainSpec to get a set of domain objects rebuilt.

    //  Once we have new domain objects we need to refresh our computable
    //  list from that set of domain objects.
    this.refreshComputables();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DragTracker.Inst.defineMethod('setFilterFunction',
function(filterFunction) {

    /**
     * @name setFilterFunction
     * @synopsis Sets the filter function for the receiver. When the value
     *     changes the domain is re-filtered and the range function is rerun to
     *     update the computables list.
     * @param {Function} filterFunction The function to invoke on each domain
     *     object filter out non-matches.
     * @returns {TP.core.DragTracker} The receiver.
     */

    if (!TP.isFunction(filterFunction)) {
        return this.raise('TP.sig.InvalidFunction', arguments,
            'Invalid filter function: ' + filterFunction);
    }

    this.$set('filterFunction', filterFunction);

    //  Once we have a new filter function run it to update our range, and
    //  subsequently the computables list.
    this.refreshRange();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DragTracker.Inst.defineMethod('setRangeFunction',
function(rangeFunction) {

    /**
     * @name setRangeFunction
     * @synopsis Sets the range function for the receiver. When the value
     *     changes all computables are refreshed by querying the domain objects
     *     for their computable value.
     * @param {Function} rangeFunction The function to invoke on each domain
     *     object to acquire a computable value.
     * @returns {TP.core.DragTracker} The receiver.
     */

    if (!TP.isFunction(rangeFunction)) {
        return this.raise('TP.sig.InvalidFunction', arguments,
            'Invalid range function: ' + rangeFunction);
    }

    this.$set('rangeFunction', rangeFunction);

    //  Once we have a new range function run it to update our compute list.
    this.refreshComputables();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DragTracker.Inst.defineMethod('setTestFunction',
function(testFunction) {

    /**
     * @name setTestFunction
     * @synopsis Sets the test function for the receiver. This function is run
     *     when the event stream handler invokes it. All computables which pass
     *     the test function's checks are then placed in the payload of a
     *     tracking signal which notifies observers.
     * @param {Function} testFunction The function to invoke on each computable
     *     value to find tracking matches.
     * @returns {TP.core.DragTracker} The receiver.
     */

    if (!TP.isFunction(testFunction)) {
        return this.raise('TP.sig.InvalidFunction', arguments,
            'Invalid test function: ' + testFunction);
    }

    this.$set('testFunction', testFunction);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.DragTracker.Inst.defineMethod('setTrackingSignal',
function(trackingSignal) {

    /**
     * @name setTrackingSignal
     * @synopsis Sets the tracking signal to fire when tracking matches are
     *     found.
     * @param {TP.sig.Signal|String} trackingSignal A signal or string which can
     *     provide the signal name to fire when tracking matches are found.
     * @returns {TP.core.DragTracker} The receiver.
     */

    if (!TP.canInvoke(trackingSignal, 'getSignalName')) {
        return this.raise('TP.sig.InvalidParameter', arguments,
            'trackingSignal can not provide signal name: ' + trackingSignal);
    }

    this.$set('trackingSignal', trackingSignal.getSignalName());

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
