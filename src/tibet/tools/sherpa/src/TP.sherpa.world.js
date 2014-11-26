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
 * @type {TP.sherpa.world}
 * @synopsis
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('sherpa.world');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineAttribute('screenWidth');
TP.sherpa.world.Inst.defineAttribute('screenHeight');

//  ------------------------------------------------------------------------

TP.sherpa.world.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @name tagAttachDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem;

    if (TP.isElement(elem = aRequest.at('node'))) {
        this.addStylesheetTo(TP.nodeGetDocument(elem));
    }

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineAttribute('viewRect');
TP.sherpa.world.Inst.defineAttribute('currentFocus');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineMethod('setup',
function() {

    /**
     * @name tshAwakenDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Number} The TP.DESCEND flag, telling the system to descend into
     *     the children of this element.
     */

    var initialScreenWidth,
        initialScreenHeight,

        allScreens,
        allIFrames,

        screenWidth,
        screenHeight,

        screen0URI,
        blankURL,
        appTagStubMarkup,
        loadedFunc;

    //  TODO: This should match the actual width & height of the entry in the
    //  'sherpa|screen' rule.
    initialScreenWidth =
        TP.ifInvalid(1024, TP.sys.cfg('sherpa.initial_screen_height'));
    initialScreenHeight =
        TP.ifInvalid(768, TP.sys.cfg('sherpa.initial_screen_width'));

    allScreens = TP.byCSS('sherpa|screen', this.getNativeWindow());

    this.set('screenWidth', initialScreenWidth);
    this.set('screenHeight', initialScreenHeight);

    screenWidth = this.get('screenWidth');
    screenHeight = this.get('screenHeight');

    allIFrames = TP.byCSS('sherpa|screen > iframe', this.getNativeWindow());

    //  If a specific URL isn't specified for 'sherpa.screen_0_uri', then load
    //  a blank into screen_0 and put some markup in there that will render the
    //  core app tag page.
    if (TP.notValid(screen0URI = TP.sys.cfg('sherpa.screen_0_uri'))) {

        blankURL = TP.uc(TP.sys.cfg('tibet.blankpage')).getLocation();

        appTagStubMarkup =
            TP.elem('<sherpatest:app xmlns:sherpatest="urn:sherpatest"/>');

        loadedFunc = function(evt) {
            var win;

            this.removeEventListener('load', loadedFunc, false);

            win = this.contentWindow;

            TP.wrap(TP.documentGetBody(win.document)).addContent(
                                                appTagStubMarkup);
        };

        allIFrames.first().addEventListener('load', loadedFunc, false);

        //  We *MUST* use this technique to load up the iframes - just setting
        //  the '.src' of the iframe won't do what we want (at least on Chrome).
        allIFrames.first().contentWindow.location = blankURL;
    }

    /*
    this.getNativeDocument().defaultView.onresize =
        function() {
            this.setView(this.get('viewRect'));
        };
    */

    this.observe(TP.byOID('SherpaHUD', this.getNativeWindow()), 'HiddenChange');

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineMethod('handleSherpaHUDHiddenChange',
function(aSignal) {

    /**
     * @name handleHiddenChange
     */

    var isHidden;

    isHidden = TP.bc(aSignal.getOrigin().getAttribute('hidden'));

    /*
    if (isHidden) {
        console.log('hud is now hidden');
    } else {
        console.log('hud is now showing');
    }
    */

    this.refocus();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineMethod('refocus',
function() {

    /**
     * @name refocus
     */

    var currentFocus;

    currentFocus = this.get('currentFocus');

    if (TP.isArray(currentFocus)) {
        this.fitToScreen(currentFocus.first(), currentFocus.last());
    } else if (TP.isElement(currentFocus)) {
        this.fitToElement(currentFocus);
    } else if (currentFocus === TP.SELF) {
        this.fitToSelf();
    }

    return this;
});

//  ------------------------------------------------------------------------
//  ZUI methods
//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineMethod('getWorldCenterPoint',
function() {

    /**
     * @name getWorldCenterPoint
     * @returns {TP.sherpa.world} The receiver.
     */

    var worldSize,
        worldWidth,
        worldHeight;

    worldSize = this.getComputedWidthAndHeight();
    worldWidth = worldSize.first();
    worldHeight = worldSize.last();

    return TP.rtc(0, 0, worldWidth, worldHeight).getCenterPoint();
});

//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineMethod('fitToElement',
function(anElement) {

    /**
     * @name fitToElement
     * @returns {TP.sherpa.world} The receiver.
     */

    var tpElem,
        elementRect;

    tpElem = TP.wrap(anElement);
    elementRect = tpElem.getPageRect(false);

    this.setView(elementRect);

    this.set('currentFocus', tpElem);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineMethod('fitToScreen',
function(screenRowNum, screenColNum) {

    /**
     * @name fitToScreen
     * @param {Number} screenNum
     * @returns {TP.sherpa.world} The receiver.
     */

    var screenWidth,
        screenHeight,

        gapWidth,
        gapHeight,

        translateX,
        translateY,

        width,
        height,

        hud,
        hudHorizOffset,
        hudVertOffset;


    screenWidth = this.get('screenWidth');
    screenHeight = this.get('screenHeight');

    //gapWidth = this.get('gapWidth');
    //gapHeight = this.get('gapHeight');
    gapWidth = 0;
    gapHeight = 0;

    translateX = (screenWidth * screenColNum) + (gapWidth * screenColNum);
    translateY = (screenHeight * screenRowNum) + (gapHeight * screenRowNum);

    width = screenWidth + (gapWidth * 2);
    height = screenHeight + (gapHeight * 2);

    hudHorizOffset = (30 + 5);
    hudVertOffset = (50 + 5);

    if (TP.isValid(hud = TP.byOID('SherpaHUD', this.getNativeWindow())) &&
        TP.notTrue(hud.get('hidden'))) {
        translateX -= hudHorizOffset;
        translateY -= hudVertOffset;
        width += hudHorizOffset * 2;
        height += hudVertOffset * 2;
    }

    this.setView(TP.rtc(translateX, translateY, width, height));

    this.set('currentFocus', TP.ac(screenRowNum, screenColNum));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineMethod('fitToSelf',
function() {

    /**
     * @name fitToSelf
     * @returns {TP.sherpa.world} The receiver.
     */

    return this;
/*
    var worldSize,
        worldWidth,
        worldHeight;

    worldSize = this.getComputedWidthAndHeight();
    worldWidth = worldSize.first();
    worldHeight = worldSize.last();

    var hud,
        hudHorizOffset,
        hudVertOffset,
        translateX,
        translateY;

    hudHorizOffset = (30 + 5);
    hudVertOffset = (50 + 5);

    translateX = 0;
    translateY = 0;

    if (TP.isValid(hud = TP.byOID('SherpaHUD', this.getNativeWindow())) &&
        TP.notTrue(hud.get('hidden'))) {
        translateX -= hudHorizOffset;
        translateY -= hudVertOffset;
        worldWidth += hudHorizOffset * 2;
        worldHeight += hudVertOffset * 2;
    }

    this.setView(TP.rtc(translateX, translateY, worldWidth, worldHeight));

    this.set('currentFocus', TP.SELF);

    return this;
*/
});

//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineMethod('fitToVisibleWindow',
function() {

    /**
     * @name fitToVisibleWindow
     * @returns {TP.sherpa.world} The receiver.
     */

    return this;
/*
    var nativeDoc,
        windowWidth,
        windowHeight;

    nativeDoc = this.getNativeDocument();

    windowWidth = TP.documentGetViewableWidth(nativeDoc);
    windowHeight = TP.documentGetViewableHeight(nativeDoc);

    this.setView(TP.rtc(0, 0, windowWidth, windowHeight));

    return this;
*/
});

//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineMethod('moveToCenterPointAndFitToDocument',
function(aPoint) {

    /**
     * @name moveToCenterPointAndFitToDocument
     * @returns {TP.sherpa.world} The receiver.
     */

    var nativeDoc,
        windowWidth,
        windowHeight,
        newRect;

    nativeDoc = this.getNativeDocument();

    windowWidth = TP.documentGetViewableWidth(nativeDoc);
    windowHeight = TP.documentGetViewableHeight(nativeDoc);

    newRect = TP.rtc(
        (aPoint.getX() - (windowWidth / 2)).max(0),
        (aPoint.getY() - (windowHeight / 2)).max(0),
        windowWidth,
        windowHeight);

    this.setView(newRect);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineMethod('setView',
function(aRect) {

    /**
     * @name setView
     * @returns {TP.sherpa.world} The receiver.
     */

    var nativeDoc,
        windowWidth,
        windowHeight,
        centerPoint,

        rectWidth,
        rectHeight,

        newRect,
        scale;

    nativeDoc = this.getNativeDocument();

    windowWidth = TP.documentGetViewableWidth(nativeDoc);
    windowHeight = TP.documentGetViewableHeight(nativeDoc);

    centerPoint = aRect.getCenterPoint();

    rectWidth = aRect.getWidth();
    rectHeight = aRect.getHeight();

    newRect = aRect.copy();

    if ((windowWidth / windowHeight) > (rectWidth / rectHeight)) {
        newRect.setWidth(rectHeight * (windowWidth / windowHeight));
    } else {
        newRect.setHeight(rectWidth * (windowHeight / windowWidth));
    }

    rectWidth = newRect.getWidth();
    rectHeight = newRect.getHeight();

    newRect.setX(centerPoint.getX() - (rectWidth / 2));
    newRect.setY(centerPoint.getY() - (rectHeight / 2));

    scale = windowWidth / rectWidth;

    this.setTransform(
        'scale(' + scale + ')' +
        ' translate(' + -newRect.getX() + 'px,' + -newRect.getY() + 'px)');

    this.set('viewRect', newRect);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineMethod('zoom',
function(aValue) {

    /**
     * @name zoom
     * @returns {TP.sherpa.world} The receiver.
     */

    var nativeDoc,
        windowWidth,
        windowHeight,
        currentViewRect,
        cx,
        cy,
        newViewRect;

    nativeDoc = this.getNativeDocument();

    windowWidth = TP.documentGetViewableWidth(nativeDoc);
    windowHeight = TP.documentGetViewableHeight(nativeDoc);

    currentViewRect = this.get('viewRect');

    cx = currentViewRect.getX() + (currentViewRect.getWidth() / 2);
    cy = currentViewRect.getY() + (currentViewRect.getHeight() / 2);

    newViewRect = TP.rtc(0, 0, windowWidth / aValue, windowHeight / aValue);
    newViewRect.setX(cx - (newViewRect.getWidth() / 2));
    newViewRect.setY(cy - (newViewRect.getHeight() / 2));

    this.setView(newViewRect);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
