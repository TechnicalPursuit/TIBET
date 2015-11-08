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
 */

//  ------------------------------------------------------------------------

TP.sherpa.Element.defineSubtype('sherpa:world');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineAttribute('screenWidth');
TP.sherpa.world.Inst.defineAttribute('screenHeight');

TP.sherpa.world.Inst.defineAttribute('viewRect');
TP.sherpa.world.Inst.defineAttribute('currentFocus');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     */

    var initialScreenWidth,
        initialScreenHeight,

        allIFrames,
        homeURL,

        defaultURL,
        loadRequest;

    //  TODO: This should match the actual width & height of the entry in the
    //  'sherpa|screen' rule.
    initialScreenWidth =
        TP.ifInvalid(1024, TP.sys.cfg('sherpa.initial_screen_height'));
    initialScreenHeight =
        TP.ifInvalid(768, TP.sys.cfg('sherpa.initial_screen_width'));

    this.set('screenWidth', initialScreenWidth);
    this.set('screenHeight', initialScreenHeight);

    allIFrames = TP.byCSSPath('sherpa|screen > iframe',
                            this.getNativeWindow(),
                            false,
                            false);

    //  Check for startup home page override if possible. Note that because this
    //  is a startup sequence we need to consider session-level settings for
    //  home.
    homeURL = TP.sys.getHomeURL(true);

    //  If a specific URL isn't specified for 'path.sherpa_screen_0', then load
    //  the project root page into screen_0 and put some markup in there that
    //  will render the core app tag content.
    if (TP.notEmpty(homeURL)) {

        defaultURL = TP.uc(homeURL);

        loadRequest = TP.request();

        loadRequest.atPut(
            TP.ONLOAD,
            function(evt) {
                //  Once the home page loads we need to signal the UI is
                //  "ready" so the remaining startup logic can proceed.
                TP.signal('TP.sys', 'AppWillStart');
            });

        //  We *MUST* use this technique to load up the iframes - just setting
        //  the '.src' of the iframe won't do what we want (at least on Chrome).
        TP.wrap(allIFrames.first().contentWindow).setLocation(
                defaultURL, loadRequest);

        //  Hide all of the other iframes (1...N)
        allIFrames.slice(1).perform(
                            function(anIFrameElem) {
                                //TP.elementHide(anIFrameElem);
                                TP.elementHide(anIFrameElem.parentNode);
                            });

        //  Set the ui canvas to be the first screen
        //  TODO: Should this be made into a variable, cfg or otherwise?
        TP.sys.setUICanvas('UIROOT.SCREEN_0');
    }

    /*
     * TODO: BILL
    TP.nodeGetWindow(this.getNativeDocument()).onresize =
        function() {
            this.setView(this.get('viewRect'));
        };
    */

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineMethod('createScreenElement',
function(anID, position) {

    /**
     * @method createScreenElement
     */

    var newScreenElem;

    newScreenElem = TP.documentConstructElement(this.getNativeDocument(),
                                            'screen',
                                            TP.w3.Xmlns.SHERPA);
    TP.elementSetAttribute(newScreenElem, 'id', anID);

    newScreenElem = TP.nodeInsertBefore(this.getNativeNode(),
                        newScreenElem,
                        TP.unwrap(this.getChildElementAt(position)));

    return TP.wrap(newScreenElem);
});

//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineHandler(
{signal: 'HiddenChange', origin: 'SherpaHUD'},
function(aSignal) {

    /**
     * @method handleHiddenChange
     */

    /*
    var isHidden;

    isHidden = TP.bc(aSignal.getOrigin().getAttribute('hidden'));

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
     * @method refocus
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
     * @method getWorldCenterPoint
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
     * @method fitToElement
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
     * @method fitToScreen
     * @param {Number} screenRowNum
     * @param {Number} screenColNum
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

    /* eslint-disable no-extra-parens */
    translateX = (screenWidth * screenColNum) + (gapWidth * screenColNum);
    translateY = (screenHeight * screenRowNum) + (gapHeight * screenRowNum);

    width = screenWidth + (gapWidth * 2);
    height = screenHeight + (gapHeight * 2);

    hudHorizOffset = (30 + 5);
    hudVertOffset = (50 + 5);
    /* eslint-enable no-extra-parens */

    if (TP.isValid(hud = TP.byId('SherpaHUD', this.getNativeWindow())) &&
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
     * @method fitToSelf
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

    if (TP.isValid(hud = TP.byId('SherpaHUD', this.getNativeWindow())) &&
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
     * @method fitToVisibleWindow
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
     * @method moveToCenterPointAndFitToDocument
     * @returns {TP.sherpa.world} The receiver.
     */

    var nativeDoc,
        windowWidth,
        windowHeight,
        newRect;

    nativeDoc = this.getNativeDocument();

    windowWidth = TP.documentGetViewableWidth(nativeDoc);
    windowHeight = TP.documentGetViewableHeight(nativeDoc);

    /* eslint-disable no-extra-parens */
    newRect = TP.rtc(
        (aPoint.getX() - (windowWidth / 2)).max(0),
        (aPoint.getY() - (windowHeight / 2)).max(0),
        windowWidth,
        windowHeight);
    /* eslint-enable no-extra-parens */

    this.setView(newRect);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineMethod('setView',
function(aRect) {

    /**
     * @method setView
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

    /* eslint-disable no-extra-parens */
    if ((windowWidth / windowHeight) > (rectWidth / rectHeight)) {
        newRect.setWidth(rectHeight * (windowWidth / windowHeight));
    } else {
        newRect.setHeight(rectWidth * (windowHeight / windowWidth));
    }

    rectWidth = newRect.getWidth();
    rectHeight = newRect.getHeight();

    newRect.setX(centerPoint.getX() - (rectWidth / 2));
    newRect.setY(centerPoint.getY() - (rectHeight / 2));
    /* eslint-enable no-extra-parens */

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
     * @method zoom
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

    /* eslint-disable no-extra-parens */
    cx = currentViewRect.getX() + (currentViewRect.getWidth() / 2);
    cy = currentViewRect.getY() + (currentViewRect.getHeight() / 2);

    newViewRect = TP.rtc(0, 0, windowWidth / aValue, windowHeight / aValue);
    newViewRect.setX(cx - (newViewRect.getWidth() / 2));
    newViewRect.setY(cy - (newViewRect.getHeight() / 2));
    /* eslint-enable no-extra-parens */

    this.setView(newViewRect);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
