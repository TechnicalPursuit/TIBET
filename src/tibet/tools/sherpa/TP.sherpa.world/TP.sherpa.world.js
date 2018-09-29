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

TP.sherpa.Element.defineSubtype('world');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.world.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        initialScreenWidth,
        initialScreenHeight,

        firstScreenIFrame,
        homeURL,

        defaultURL,
        loadRequest;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    //  TODO: This should match the actual width & height of the entry in the
    //  'sherpa|screen' rule.
    initialScreenWidth = TP.sys.cfg('sherpa.initial_screen_height', 1024);
    initialScreenHeight = TP.sys.cfg('sherpa.initial_screen_width', 768);

    tpElem.set('screenWidth', initialScreenWidth);
    tpElem.set('screenHeight', initialScreenHeight);

    firstScreenIFrame = TP.byCSSPath('sherpa|screen > iframe',
                                        tpElem.getNativeWindow(),
                                        true,
                                        true);

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
                //  Signal we are starting. This provides a hook for extensions
                //  etc. to tap into the startup sequence before routing or
                //  other behaviors but after we're sure the UI is finalized.
                TP.signal('TP.sys', 'AppWillStart');

                //  Signal actual start. The default handler on Application will
                //  invoke the start() method in response to this signal.
                TP.signal('TP.sys', 'AppStart');
            });

        //  We *MUST* use this technique to load up the iframes - just setting
        //  the '.src' of the iframe won't do what we want (at least on Chrome).
        firstScreenIFrame.getContentWindow().setLocation(
                                                defaultURL, loadRequest);

        //  Set the ui canvas to be the first screen
        //  TODO: Should this be made into a variable, cfg or otherwise?
        TP.sys.setUICanvas('UIROOT.SCREEN_0');
    }

    tpElem.observe(TP.ANY, TP.ac('TP.sig.ToggleScreen', 'TP.sig.FocusScreen'));

    /*
     * TODO: BILL
    TP.nodeGetWindow(tpElem.getNativeDocument()).onresize =
        function() {
            tpElem.setView(tpElem.get('viewRect'));
        };
    */

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineAttribute('screenWidth');
TP.sherpa.world.Inst.defineAttribute('screenHeight');

TP.sherpa.world.Inst.defineAttribute('viewRect');
TP.sherpa.world.Inst.defineAttribute('currentFocus');

TP.sherpa.world.Inst.defineAttribute('screens',
    TP.cpc('> div.screens > sherpa|screen', TP.hc('shouldCollapse', false)));

TP.sherpa.world.Inst.defineAttribute('infos',
    TP.cpc('> div.infos > div.info', TP.hc('shouldCollapse', false)));

TP.sherpa.world.Inst.defineAttribute('selectedScreen',
    TP.cpc('> div.screens > sherpa|screen[pclass|selected]',
        TP.hc('shouldCollapse', true)));

TP.sherpa.world.Inst.defineAttribute('selectedInfo',
    TP.cpc('> div.infos > div.info[pclass|selected]',
        TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.world.Type.defineMethod('$buildScreenFromIFrame',
function(iFrameElement, screenIndex, beforeIndex, screenHolderElement,
         infoHolderElement) {

    /**
     * @method $buildScreenFromIFrame
     * @summary Builds a new screen element from an existing iframe element
     *     and inserts it before the supplied
     *     beforeIndex (or appends it if beforeIndex isn't supplied).
     * @param {Element} iFrameElement The iframe element that will be moved
     *     under the new sherpa:screen element.
     * @param {Number} screenIndex The index of the new screen.
     * @param {Number} [beforeIndex] The index of the existing screen that the
     *     new sherpa:screen will be inserted before. If null, the new screen
     *     will be appended to the end of the list of screens.
     * @param {Element} screenHolderElement The element that will hold the newly
     *     created screen element and act as its parent.
     * @param {Element} infoHolderElement The element that will hold the newly
     *      created info element and act as its parent.
     * @returns {TP.sherpa.screen} The newly created sherpa:screen.
     */

    var doc,
        infoDiv,
        insertionElem,
        infoTabDiv,
        screen;

    doc = TP.nodeGetDocument(iFrameElement);

    //  Add an 'info div' that will hold some identifying information.
    infoDiv = TP.documentConstructElement(
                                doc, 'div', TP.w3.Xmlns.XHTML);
    if (TP.isNumber(beforeIndex)) {
        insertionElem = TP.nodeGetChildElementAt(infoHolderElement,
                                                    beforeIndex);
    }

    infoDiv = TP.nodeAppendChild(infoHolderElement, infoDiv, false);
    TP.elementAddClass(infoDiv, 'info');

    //  Create a 'tab' for the info block to show the identifying information.
    infoTabDiv = TP.documentConstructElement(
                                doc, 'div', TP.w3.Xmlns.XHTML);
    infoTabDiv = TP.nodeAppendChild(infoDiv, infoTabDiv, false);
    TP.elementAddClass(infoTabDiv, 'infotab');

    //  Set an 'on:click' handler that will cause this screen to be the
    //  'focused' screen.
    TP.elementSetAttribute(
        infoTabDiv,
        'on:click',
        '{signal: FocusScreen, payload: {screenIndex: ' + screenIndex + '}}',
        true);

    //  And some identifying information on the info div.
    TP.nodeSetTextContent(infoTabDiv, 'Screen ' + (screenIndex + 1));

    //  Wrap each iframe inside of a 'sherpa:screen' element
    screen = TP.documentConstructElement(
                                doc, 'sherpa:screen', TP.w3.Xmlns.SHERPA);
    TP.nodeAppendChild(screen, iFrameElement, false);

    //  Now, calculate an insertion point for the screen (if applicable) and
    //  insert it.
    if (TP.isNumber(beforeIndex)) {
        insertionElem = TP.nodeGetChildElementAt(screenHolderElement,
                                                    beforeIndex);
    }

    //  Go ahead and insert the screen element into the screen holding element.
    screen = TP.nodeInsertBefore(screenHolderElement,
                                    screen,
                                    insertionElem,
                                    false);

    return screen;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineMethod('createScreenElement',
function(iFrameID, beforeIndex, loadURL, creationCompleteFunc) {

    /**
     * @method createScreenElement
     * @summary Creates a new screen element and inserts it before the supplied
     *     beforeIndex (or appends it if beforeIndex isn't supplied).
     * @param {String} iframeID The ID of the *iframe* that will be created
     *     under the new sherpa:screen element.
     * @param {Number} [beforeIndex] The index of the existing screen that the
     *     new sherpa:screen will be inserted before. If null, the new screen
     *     will be appended to the end of the list of screens.
     * @param {TP.uri.URI} [loadURL] The URL to load into the screen iframe.
     * @param {Function} [creationCompleteFunc] The Function to call when the
     *     content of the iframe (if supplied by the loadURL) is finished
     *     loading.
     * @returns {TP.sherpa.screen} The newly created sherpa:screen.
     */

    var screenCount,

        screenHolderTPElem,
        screenHolderElem,
        infoHolderElem,

        newScreenElem,
        newIFrameElem,

        loadRequest,

        newScreenTPElem;

    //  Grab the screen count before we start messing with the DOM
    screenCount = this.get('screens').getSize();

    screenHolderTPElem = this.getChildElementAt(0);
    screenHolderElem = TP.unwrap(screenHolderTPElem);

    infoHolderElem = TP.byCSSPath('> div.infos', this, true, false);

    //  Create a new 'iframe' element, set it's ID to the supplied ID, and its
    //  frameborder to 0.
    newIFrameElem = TP.documentConstructElement(this.getNativeDocument(),
                                                'iframe',
                                                TP.w3.Xmlns.XHTML);
    TP.elementSetAttribute(newIFrameElem, 'id', iFrameID);
    TP.elementSetAttribute(newIFrameElem, 'frameborder', '0');

    //  Build a screen using the newly created iframe and the count, index, etc
    newScreenElem = this.getType().$buildScreenFromIFrame(
                            newIFrameElem,
                            screenCount,
                            beforeIndex,
                            screenHolderElem,
                            infoHolderElem);

    //  If we were supplied a URL, then load it into the iframe window.
    if (TP.isURI(loadURL)) {
        loadRequest = TP.request();

        loadRequest.atPut(
            TP.ONLOAD,
            function(evt) {
                if (TP.isCallable(creationCompleteFunc)) {
                    creationCompleteFunc();
                }
            });

        TP.wrap(newIFrameElem.contentWindow).setLocation(loadURL, loadRequest);
    }

    newScreenTPElem = TP.wrap(newScreenElem);

    return newScreenTPElem;
});

//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineHandler('ClosedChange',
function(aSignal) {

    /**
     * @method handleClosedChange
     * @summary Handles when the HUD's 'closed' state changes. We track that by
     *     refocusing ourself.
     * @param {TP.sig.ClosedChange} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.world} The receiver.
     */

    /*
    var isClosed;

    isClosed = TP.bc(aSignal.getOrigin().getAttribute('closed'));

    if (isClosed) {
        console.log('hud is now closed');
    } else {
        console.log('hud is now showing');
    }
    */

    this.refocus();

    return this;
}, {
    origin: 'SherpaHUD'
});

//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineHandler('FocusScreen',
function(aSignal) {

    /**
     * @method handleFocusScreen
     * @summary Handles notifications of screen focus signals.
     * @param {TP.sig.FocusScreen} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.world} The receiver.
     */

    this.setAttribute('mode', 'normal');

    this.signal('ToggleScreen', aSignal.getPayload());

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineHandler('ToggleScreen',
function(aSignal) {

    /**
     * @method handleToggleScreen
     * @summary Handles notifications of screen toggle signals.
     * @param {TP.sig.ToggleScreen} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.world} The receiver.
     */

    var consoleService,

        oldScreen,
        oldInfo,

        newScreen,
        newInfo,

        newTPWindow;

    //  Get the old selected screen
    oldScreen = this.get('selectedScreen');

    //  Get the new selected screen
    newScreen = this.get('screens').at(aSignal.at('screenIndex'));

    if (newScreen.identicalTo(oldScreen)) {
        return this;
    }

    //  Get the old selected information overlay
    oldInfo = this.get('selectedInfo');

    //  Get the new selected information overlay
    newInfo = this.get('infos').at(aSignal.at('screenIndex'));

    consoleService = TP.bySystemId('SherpaConsoleService');

    //  If there was an old selected screen, deselect it and the associated
    //  information overlay. Also, set the console's UICANVAS to null.
    if (TP.isValid(oldScreen)) {
        oldScreen.setSelected(false);
        oldInfo.setSelected(false);

        consoleService.get('model').setVariable('UICANVAS', null);
    }

    //  If there is a new selected screen, select it and the associated
    //  information overlay. Also, set the console's UICANVAS to that screen's
    //  content window.
    if (TP.isValid(newScreen)) {
        newScreen.setSelected(true);
        newInfo.setSelected(true);

        newTPWindow = newScreen.getContentWindow();

        consoleService.get('model').setVariable('UICANVAS', newTPWindow);

        TP.sys.setUICanvas('UIROOT.' + newTPWindow.getLocalID());

        //  Make sure to scroll it into view.
        this.scrollSelectedScreenIntoView();
    } else {
        //  TODO: Raise an exception - there will be no UI canvas.
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineMethod('getScreenLocations',
function() {

    /**
     * @method getScreenLocations
     */

    var screens,
        locs;

    screens = this.get('screens');

    locs = TP.ac();

    screens.forEach(
            function(aScreen) {
                var uri;

                uri = TP.uc(aScreen.getLocation());
                locs.push(uri.getVirtualLocation());
            });

    return locs;
});

//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineMethod('setScreenLocations',
function(locations) {

    /**
     * @method setScreenLocations
     */

    var locationCount,

        screens,
        screenCount,

        i,

        counter,
        loadFunc;

    locationCount = locations.getSize();

    screens = this.get('screens');
    screenCount = screens.getSize();

    if (locationCount > screenCount) {
        for (i = 0; i < locationCount - screenCount; i++) {
            this.createScreenElement('SCREEN_' + (i + screenCount));
        }

        //  Refetch the list of screens since we created more.
        screens = this.get('screens');
    }

    counter = 0;
    loadFunc = function() {

        var loadURL,
            loadRequest;

        if (TP.notEmpty(locations)) {

            loadURL = locations.shift();
            loadRequest = TP.request();

            loadRequest.atPut(
                    TP.ONLOAD,
                    function() {
                        counter++;
                        loadFunc();
                    });
            screens.at(counter).setLocation(TP.uc(loadURL), loadRequest);
        } else {
            /*
            worldThumbnails = TP.byId('SherpaWorldThumbnails',
                                        this.getNativeWindow());

            setTimeout(function() {
                worldThumbnails.render();
            }, 1000);
            */
        }
    };

    loadFunc();

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

TP.sherpa.world.Inst.defineMethod('removeScreenElement',
function(anIndex) {

    /**
     * @method removeScreenElement
     * @summary Removes the screen element at the supplied index.
     * @param {Number} anIndex The index of the existing screen to be removed.
     * @returns {TP.sherpa.world} The receiver.
     */

    var screenHolderTPElem,
        infoHolderTPElem;

    screenHolderTPElem = TP.byCSSPath('> div.screens', this, true);
    infoHolderTPElem = TP.byCSSPath('> div.infos', this, true);

    screenHolderTPElem.removeChildElementAt(anIndex);
    infoHolderTPElem.removeChildElementAt(anIndex);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineMethod('scrollSelectedScreenIntoView',
function() {

    var selectedScreen,
        selectedRect,

        // elem,

        selectedScreenElem;

    selectedScreen = this.get('selectedScreen');

    if (TP.isValid(selectedScreen)) {
        selectedRect = selectedScreen.getOffsetRect();
        selectedScreenElem = selectedScreen.getNativeNode();

        this.scrollTo(
                TP.HORIZONTAL,
                selectedRect.getX() -
                TP.elementGetMarginInPixels(selectedScreenElem).last());

        this.scrollTo(
                TP.VERTICAL,
                selectedRect.getY() -
                TP.elementGetMarginInPixels(selectedScreenElem).first());
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

    // gapWidth = this.get('gapWidth');
    // gapHeight = this.get('gapHeight');
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
        TP.notTrue(hud.get('closed'))) {
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

    this.removeTransform();

    return this;

    /*
    var worldSize,
        worldWidth,
        worldHeight,

        hud,
        hudHorizOffset,
        hudVertOffset,
        translateX,
        translateY;

    worldSize = this.getComputedWidthAndHeight();
    worldWidth = worldSize.first();
    worldHeight = worldSize.last();

    hudHorizOffset = 30 + 5;
    hudVertOffset = 50 + 5;

    translateX = 0;
    translateY = 0;

    if (TP.isValid(hud = TP.byId('SherpaHUD', this.getNativeWindow())) &&
        TP.notTrue(hud.get('closed'))) {
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
