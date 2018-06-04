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
 * @type {TP.sherpa.connector}
 * @synopsis A type that implements NeXT Interface Builder-style 'connectors'
 *     for use in GUI building and other situation where a visual representation
 *     of a relationship needs to be expressed between two on-screen objects.
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('connector');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.sherpa.connector.Type.defineConstant('NO_ORIENTATION', 0);
TP.sherpa.connector.Type.defineConstant('VERT_ORIENTATION', 1);
TP.sherpa.connector.Type.defineConstant('HORIZ_ORIENTATION', 2);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.connector.Inst.defineAttribute('$connectorLaunch',
    TP.cpc('> div[part="launchpad"]', TP.hc('shouldCollapse', true)));

TP.sherpa.connector.Inst.defineAttribute('$horizConnector',
    TP.cpc('> div[part="horizontal"]', TP.hc('shouldCollapse', true)));

TP.sherpa.connector.Inst.defineAttribute('$vertConnector',
    TP.cpc('> div[part="vertical"]', TP.hc('shouldCollapse', true)));

TP.sherpa.connector.Inst.defineAttribute('$connectorDest',
    TP.cpc('> div[part="destination"]', TP.hc('shouldCollapse', true)));

TP.sherpa.connector.Inst.defineAttribute('$startPoint');

TP.sherpa.connector.Inst.defineAttribute('$dragOrientation');

TP.sherpa.connector.Inst.defineAttribute('$srcElement');
TP.sherpa.connector.Inst.defineAttribute('$destElement');

TP.sherpa.connector.Inst.defineAttribute('$connectorThickness');
TP.sherpa.connector.Inst.defineAttribute('$launchSize');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.connector.Inst.defineMethod('computeValidDestination',
function(aSignal) {

    /**
     * @method computeValidDestination
     * @summary Computes a valid connector destination based on the supplied
     *     signal.
     * @param {TP.sig.DOMDragMove} aSignal The TIBET signal which will be used
     *     to compute a valid connector destination.
     * @returns {TP.dom.ElementNode} The element to use as a connector
     *     destination.
     */

    var element;

    element = aSignal.getTarget();

    if (!TP.isElement(element)) {
        element = element.parentNode;
    }

    //  Ask the target element to get the nearest connector destination (which
    //  may be itself).
    return TP.wrap(element).getConnectorDestination();
});

//  ------------------------------------------------------------------------

TP.sherpa.connector.Inst.defineMethod('computeValidSource',
function(aSignal) {

    /**
     * @method computeValidSource
     * @summary Computes a valid connector source based on the supplied signal.
     * @param {TP.sig.DOMDragMove} aSignal The TIBET signal which will be used
     *     to compute a valid connector source.
     * @returns {TP.dom.ElementNode} The element to use as a connector source.
     */

    var element;

    element = aSignal.getTarget();

    if (!TP.isElement(element)) {
        element = element.parentNode;
    }

    //  Ask the target element to get the nearest connector source (which may be
    //  itself).
    return TP.wrap(element).getConnectorSource();
});

//  ------------------------------------------------------------------------

TP.sherpa.connector.Inst.defineMethod('drawFromTo',
function(fromX, fromY, toX, toY) {

    /**
     * @method drawFromTo
     * @summary Draws the connector from the given X & Y coordinates to the
     *     given X & Y coordinates.
     * @param {Number} fromX The X coordinate to start drawing the connector
     *     from.
     * @param {Number} fromY The Y coordinate to start drawing the connector
     *     from.
     * @param {Number} toX The X coordinate to end drawing the connector at.
     * @param {Number} toY The Y coordinate to end drawing the connector at.
     * @returns {TP.sherpa.connector} The receiver.
     */

    var connectorThickness,

        dragOrientation,

        horizConnector,
        vertConnector,

        launchTopSideCoord,
        launchRightSideCoord,
        launchBottomSideCoord,
        launchLeftSideCoord;

    connectorThickness = this.$get('$connectorThickness');

    dragOrientation = this.$get('$dragOrientation');

    horizConnector = this.get('$horizConnector').getNativeNode();
    vertConnector = this.get('$vertConnector').getNativeNode();

    /* eslint-disable no-extra-parens */
    //  If the drag orientation hasn't been decided yet, compute it.
    if (dragOrientation === TP.sherpa.connector.NO_ORIENTATION) {
        launchTopSideCoord = fromY - connectorThickness + 1;
        launchRightSideCoord = fromX + (connectorThickness * 2);
        launchBottomSideCoord = fromY + (connectorThickness * 2);
        launchLeftSideCoord = fromX - connectorThickness + 1;

        if (((toX >= launchRightSideCoord) ||
                (toX <= launchLeftSideCoord)) &&
                (toY >= launchTopSideCoord) &&
                (toY <= launchBottomSideCoord)) {
            dragOrientation = TP.sherpa.connector.HORIZ_ORIENTATION;
        } else if (((toY >= launchBottomSideCoord) ||
                (toY <= launchTopSideCoord)) &&
                (toX >= launchLeftSideCoord) &&
                (toX <= launchRightSideCoord)) {
            dragOrientation = TP.sherpa.connector.VERT_ORIENTATION;
        } else {
            //  Is this random?? Who knows... ;-)
            if (Math.random() > 0.5) {
                dragOrientation = TP.sherpa.connector.HORIZ_ORIENTATION;
            } else {
                dragOrientation = TP.sherpa.connector.VERT_ORIENTATION;
            }
        }

        this.set('$dragOrientation', dragOrientation, false);
    }
    /* eslint-enable no-extra-parens */

    /* eslint-disable no-extra-parens */
    //  If we started horizontally, then we stretch the horizontal connector
    //  and move the vertical.
    if (dragOrientation === TP.sherpa.connector.HORIZ_ORIENTATION) {
        if (toX >= fromX) {
            horizConnector.style.left = fromX + 'px';
            horizConnector.style.width = ((toX - fromX) +
                connectorThickness) + 'px';
        } else {
            horizConnector.style.left = toX + 'px';
            horizConnector.style.width = (fromX - toX) + 'px';
        }

        if (toY >= fromY) {
            vertConnector.style.left = toX + 'px';
            vertConnector.style.top = fromY + 'px';
            vertConnector.style.height = (toY - fromY) + 'px';
        } else {
            vertConnector.style.left = toX + 'px';
            vertConnector.style.top = toY + 'px';
            vertConnector.style.height = (fromY - toY) + 'px';
        }
    } else {
        //  Otherwise we stretch the vertical connector and move the
        //  horizontal.
        if (toX >= fromX) {
            horizConnector.style.left = fromX + 'px';
            horizConnector.style.top = toY + 'px';
            horizConnector.style.width = (toX - fromX) + 'px';
        } else {
            horizConnector.style.left = toX + 'px';
            horizConnector.style.top = toY + 'px';
            horizConnector.style.width = ((fromX - toX) +
                connectorThickness) + 'px';
        }

        if (toY >= fromY) {
            vertConnector.style.top = fromY + 'px';
            vertConnector.style.height = (toY - fromY) + 'px';
        } else {
            vertConnector.style.top = toY + 'px';
            vertConnector.style.height = (fromY - toY) + 'px';
        }
    }
    /* eslint-enable no-extra-parens */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.connector.Inst.defineHandler('DOMDragMove',
function(aSignal) {

    /**
     * @method handleDOMDragMove
     * @summary Handles notification of when the receiver needs to move and/or
     *     resize in response to the user moving the mouse.
     * @param {TP.sig.DOMDragMove} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.connector} The receiver.
     */

    var startPoint,

        currentPoint,
        currentX,
        currentY,

        evtTarget,

        destElement,
        destTPElement,
        currentDestElement,

        srcElement;

    startPoint = this.$get('$startPoint');

    //  We always use global coordinates for the connector.
    currentPoint = aSignal.getGlobalPoint();

    currentX = currentPoint.getX();
    currentY = currentPoint.getY();

    if (currentX < 0 || currentY < 0) {
        return this;
    }

    //  Draw the connector parts.
    this.drawFromTo(startPoint.getX(), startPoint.getY(), currentX, currentY);

    evtTarget = aSignal.getTarget();

    //  If we have an event target but it's a descendant of the connector
    //  element, that means it's a connector part and we need to ignore that.
    if (this.contains(evtTarget)) {
        return this;
    }

    //  Compute a new connector destination.
    destTPElement = this.computeValidDestination(aSignal);

    if (TP.notValid(destTPElement)) {
        //  Hide the connector destination overlay from the current connector
        //  destination.
        this.hideConnectorDest();

        //  No successful destination - make sure to null out destElement.
        this.set('$destElement', null);

        //  Exit here
        return this;
    }

    destElement = destTPElement.getNativeNode();

    currentDestElement = this.$get('$destElement');

    //  If currentDestElement is an Element and its the same as the computed
    //  dest element, they're the same element so we just return here.
    if (TP.isElement(currentDestElement) &&
        currentDestElement === destElement) {
        return this;
    }

    //  Hide the connector destination overlay from the current connector
    //  destination.
    this.hideConnectorDest();

    srcElement = this.$get('$srcElement');

    //  If we have new connector destintation, then make sure that both the
    //  source and the destintation 'agree' that they can connect each over.
    if (TP.isElement(destElement)) {

        if (TP.wrap(srcElement).canConnectTo(destElement) &&
            TP.wrap(destElement).canConnectFrom(srcElement)) {

            //  Both elements 'agree' - show the connector destination overlay.
            this.showConnectorDestOver(destElement);

            //  Got a successful destination.
            this.set('$destElement', destElement);

            return this;
        }
    }

    //  No successful destination - make sure to null out destElement.
    this.set('$destElement', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.connector.Inst.defineHandler('DOMDragUp',
function(aSignal) {

    /**
     * @method handleDOMDragUp
     * @summary Handles notification of when the receiver needs to end its mouse
     *     tracking because the user has released the mouse button.
     * @param {TP.sig.DOMDragUp} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.connector} The receiver.
     */

    this.ignore(TP.core.Mouse,
                TP.ac('TP.sig.DOMDragMove', 'TP.sig.DOMDragUp'));

    this.hideConnectorDest();

    this.hideConnector();

    //  Reset the connector orientation back to NO_ORIENTATION, ready for the
    //  next drag session.
    this.set('$dragOrientation', TP.sherpa.connector.NO_ORIENTATION);

    this.set('$srcElement', null);
    this.set('$destElement', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.connector.Inst.defineMethod('hideConnectorDest',
function() {

    /**
     * @method hideConnectorDest
     * @summary Hides the 'connector destination' element.
     * @returns {TP.sherpa.connector} The receiver.
     */

    this.get('$connectorDest').hide();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.connector.Inst.defineMethod('hideConnector',
function() {

    /**
     * @method hideConnector
     * @summary Hides the connector.
     * @returns {TP.sherpa.connector} The receiver.
     */

    this.get('$connectorLaunch').hide();
    this.get('$horizConnector').hide();
    this.get('$vertConnector').hide();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.connector.Inst.defineMethod('setupConnector',
function() {

    /**
     * @method setupConnector
     * @summary Sets up the connector.
     * @returns {TP.sherpa.connector} The receiver.
     */

    var connectorStyleElement;

    this.set('$connectorThickness', 3);
    this.set('$launchSize', 7);

    //  Grab the style sheet that is associated with the connector.
    connectorStyleElement =
        TP.styleSheetGetOwnerNode(this.getStylesheetForStyleResource());

    TP.cssElementSetCustomCSSPropertyValue(
        connectorStyleElement,
        'sherpa|connector',
        '--sherpa-connector-thickness',
        '3px',
        null,
        false);

    TP.cssElementSetCustomCSSPropertyValue(
        connectorStyleElement,
        'sherpa|connector',
        '--sherpa-connector-launchsize',
        '7px',
        null,
        false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.connector.Inst.defineMethod('showConnectorDestOver',
function(destElement) {

    /**
     * @method showConnectorDestOver
     * @summary Shows the 'connector destination' element 'over' the supplied
     *     element.
     * @param {Element} destElement The element to show the 'connector
     *     destination' over.
     * @returns {TP.sherpa.connector} The receiver.
     */

    var coords,

        connectorDest,
        connectorThickness;

    //  Grab the global box for the destination element.
    coords = TP.elementGetGlobalBox(destElement);

    //  Grab the connector destination element.
    connectorDest = this.get('$connectorDest').getNativeNode();

    connectorThickness = this.$get('$connectorThickness');

    //  Position and size the connector destination element based on the box
    //  coordinates and the connector thickness.
    /* eslint-disable no-extra-parens */
    connectorDest.style.left =
        (coords.at('left') - connectorThickness) + 'px';
    connectorDest.style.top =
        (coords.at('top') - connectorThickness) + 'px';
    connectorDest.style.width =
        (coords.at('width') + connectorThickness) + 'px';
    connectorDest.style.height =
        (coords.at('height') + connectorThickness) + 'px';
    /* eslint-enable no-extra-parens */

    //  Show the connection destination element to the user.
    TP.elementShow(connectorDest);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.connector.Inst.defineMethod('showConnectorUsing',
function(aPoint) {

    /**
     * @method showConnectorUsing
     * @summary Starts a connecting session, using the supplied signal for
     *     starting coordinates, etc.
     * @param {TP.gui.Point} aPoint The point to show the connectors at.
     * @returns {TP.sherpa.connector} The receiver.
     */

    var connectorLaunch,

        horizConnector,
        vertConnector,

        connectorThickness,

        connectorStartX,
        connectorStartY;

    //  Grab the launch point, horizontal and vertical connector elements.
    connectorLaunch = this.get('$connectorLaunch').getNativeNode();
    horizConnector = this.get('$horizConnector').getNativeNode();
    vertConnector = this.get('$vertConnector').getNativeNode();

    //  Grab the X and Y from the point and the thickness in preparation for
    //  positioning the 3 elements.
    connectorStartX = aPoint.getX();
    connectorStartY = aPoint.getY();
    connectorThickness = this.$get('$connectorThickness');

    //  Position and size the launch point and the horizontal and vertical
    //  connector elements.
    /* eslint-disable no-extra-parens */
    connectorLaunch.style.left =
        (connectorStartX - connectorThickness + 1) + 'px';
    connectorLaunch.style.top =
        (connectorStartY - connectorThickness + 1) + 'px';
    /* eslint-enable no-extra-parens */

    horizConnector.style.left = connectorStartX + 'px';
    horizConnector.style.top = connectorStartY + 'px';
    horizConnector.style.width = '1px';
    horizConnector.style.height = connectorThickness + 'px';

    vertConnector.style.left = connectorStartX + 'px';
    vertConnector.style.top = connectorStartY + 'px';
    vertConnector.style.width = connectorThickness + 'px';
    vertConnector.style.height = '1px';

    //  Show the 3 elements to the user.
    TP.elementShow(connectorLaunch);
    TP.elementShow(horizConnector);
    TP.elementShow(vertConnector);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.connector.Inst.defineMethod('startConnecting',
function(aSignal) {

    /**
     * @method startConnecting
     * @summary Starts a connecting session, using the supplied signal for
     *     starting coordinates, etc.
     * @param {TP.sig.DOMDragDown} aSignal The TIBET signal which is intended to
     *     start the connector drawing based on mouse input.
     * @returns {TP.sherpa.connector} The receiver.
     */

    var srcTPElement,

        startPoint;

    //  Compute a valid source for the connector. If one cannot be computed,
    //  then we exit here.
    srcTPElement = this.computeValidSource(aSignal);
    if (TP.notValid(srcTPElement)) {
        return this;
    }

    this.set('$srcElement', srcTPElement.getNativeNode());

    //  Observe the mouse directly for DOMDragMove and DOMDragUp signals, We'll
    //  process those in our instance-level handlers above.
    this.observe(TP.core.Mouse,
                    TP.ac('TP.sig.DOMDragMove', 'TP.sig.DOMDragUp'));

    //  Initially the connector has no orientation - this will be computed upon
    //  first movement.
    this.set('$dragOrientation', TP.sherpa.connector.NO_ORIENTATION);

    //  Connectors always use the global point.
    startPoint = aSignal.getGlobalPoint();
    this.set('$startPoint', startPoint);

    //  Set up the connector and show them at the starting point.
    this.setupConnector();
    this.showConnectorUsing(startPoint);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
