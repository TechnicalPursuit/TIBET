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
 * @type {TP.lama.world}
 */

//  ------------------------------------------------------------------------

TP.lama.Element.defineSubtype('world');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.lama.world.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem,

        screenIFrames,
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

    screenIFrames = TP.byCSSPath('lama|screen > iframe',
                                        tpElem.getNativeWindow(),
                                        false,
                                        true);

    firstScreenIFrame = screenIFrames.first();

    //  Check for startup home page override if possible. Note that because this
    //  is a startup sequence we need to consider session-level settings for
    //  home.
    homeURL = TP.sys.getHomeURL(true);

    //  If a specific URL is specified as the home URL, then load it. The
    //  content pointed to by this URL should contain the root app tag.
    if (TP.notEmpty(homeURL)) {

        defaultURL = TP.uc(homeURL);

        loadRequest = TP.request();

        loadRequest.atPut(
            TP.ONLOAD,
            function(evt) {

                var stylesheet,
                    stylesheetElem,
                    val;

                //  Try to grab the CSSStyleSheet object associated with our
                //  style resource.
                stylesheet = tpElem.getStylesheetForStyleResource();
                if (TP.isValid(stylesheet)) {
                    //  And its Element
                    stylesheetElem = TP.styleSheetGetOwnerNode(stylesheet);

                    if (TP.isElement(stylesheetElem)) {
                        val = TP.cssElementGetCustomCSSPropertyValue(
                                    stylesheetElem,
                                    'lama|world',
                                    '--lama-screen-width');
                        val = val.asNumber();
                        tpElem.set('screenWidth', val);

                        val = TP.cssElementGetCustomCSSPropertyValue(
                                    stylesheetElem,
                                    'lama|world',
                                    '--lama-screen-height');
                        val = val.asNumber();
                        tpElem.set('screenHeight', val);
                    }
                }

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

    //  NB: We don't worry about observing the HUD for 'PclassClosedChange'
    //  here, since the Lama IDE object does that for us when it does it's set
    //  up.

    tpElem.toggleObservations(true);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.lama.world.Inst.defineAttribute('screenWidth');
TP.lama.world.Inst.defineAttribute('screenHeight');

TP.lama.world.Inst.defineAttribute('screens',
    TP.cpc('> div.screens > lama|screen', TP.hc('shouldCollapse', false)));

TP.lama.world.Inst.defineAttribute('infos',
    TP.cpc('> div.infos > div.info', TP.hc('shouldCollapse', false)));

TP.lama.world.Inst.defineAttribute('selectedScreen',
    TP.cpc('> div.screens > lama|screen[pclass|selected]',
        TP.hc('shouldCollapse', true)));

TP.lama.world.Inst.defineAttribute('selectedInfo',
    TP.cpc('> div.infos > div.info[pclass|selected]',
        TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.lama.world.Type.defineMethod('$buildScreenFromIFrame',
function(iFrameElement, screenIndex, beforeIndex, screenHolderElement,
         infoHolderElement) {

    /**
     * @method $buildScreenFromIFrame
     * @summary Builds a new screen element from an existing iframe element
     *     and inserts it before the supplied
     *     beforeIndex (or appends it if beforeIndex isn't supplied).
     * @param {Element} iFrameElement The iframe element that will be moved
     *     under the new lama:screen element.
     * @param {Number} screenIndex The index of the new screen.
     * @param {Number} [beforeIndex] The index of the existing screen that the
     *     new lama:screen will be inserted before. If null, the new screen
     *     will be appended to the end of the list of screens.
     * @param {Element} screenHolderElement The element that will hold the newly
     *     created screen element and act as its parent.
     * @param {Element} infoHolderElement The element that will hold the newly
     *      created info element and act as its parent.
     * @returns {TP.lama.screen} The newly created lama:screen.
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

    //  Wrap each iframe inside of a 'lama:screen' element
    screen = TP.documentConstructElement(
                                doc, 'lama:screen', TP.w3.Xmlns.LAMA);
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

    screen = TP.wrap(screen);
    screen.set('infoElement', infoDiv);

    return screen;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.world.Inst.defineMethod('createScreen',
function(iFrameID, beforeIndex, loadURL, aRequest, creationCompleteFunc) {

    /**
     * @method createScreen
     * @summary Creates a new screen element and inserts it before the supplied
     *     beforeIndex (or appends it if beforeIndex isn't supplied).
     * @param {String} [iframeID] The ID of the *iframe* that will be created
     *     under the new lama:screen element. If this is not supplied, an
     *     iframe with an ID of 'SCREEN_' and the index number of the newly
     *     created screen (i.e. 'SCREEN_3').
     * @param {Number} [beforeIndex] The index of the existing screen that the
     *     new lama:screen will be inserted before. If null, the new screen
     *     will be appended to the end of the list of screens.
     * @param {TP.uri.URI} [loadURL] The URL to load into the screen iframe.
     * @param {TP.sig.Request} [aRequest] A request object which defines further
     *     parameters.
     * @param {Function} [creationCompleteFunc] The Function to call when the
     *     content of the iframe (if supplied by the loadURL) is finished
     *     loading.
     * @returns {TP.lama.screen} The newly created lama:screen.
     */

    var screenCount,

        screenIFrameID,

        screenHolderTPElem,
        screenHolderElem,
        infoHolderElem,

        newIFrameElem,

        loadRequest,

        newScreenTPElem;

    //  Grab the screen count before we start messing with the DOM
    screenCount = this.get('screens').getSize();

    screenIFrameID = TP.ifInvalid(iFrameID, 'SCREEN_' + screenCount);

    screenHolderTPElem = this.getChildElementAt(0);
    screenHolderElem = TP.unwrap(screenHolderTPElem);

    infoHolderElem = TP.byCSSPath('> div.infos', this, true, false);

    //  Create a new 'iframe' element, set it's ID to the supplied ID, and its
    //  frameborder to 0.
    newIFrameElem = TP.documentConstructElement(this.getNativeDocument(),
                                                'iframe',
                                                TP.w3.Xmlns.XHTML);
    TP.elementSetAttribute(newIFrameElem, 'id', screenIFrameID);
    TP.elementSetAttribute(newIFrameElem, 'frameborder', '0');

    //  Build a screen using the newly created iframe and the count, index, etc
    this.getType().$buildScreenFromIFrame(
                            newIFrameElem,
                            screenCount,
                            beforeIndex,
                            screenHolderElem,
                            infoHolderElem);

    //  If we were supplied a URL, then load it into the iframe window.
    if (TP.isURI(loadURL)) {
        loadRequest = TP.request(aRequest);

        loadRequest.atPut(
            TP.ONLOAD,
            function(evt) {

                //  Make sure to initialize the new iframe's contentWindow. This
                //  will install event hooks, etc.
                TP.boot.initializeCanvas(newIFrameElem.contentWindow);
                if (TP.isCallable(creationCompleteFunc)) {
                    creationCompleteFunc();
                }
            });

        TP.wrap(newIFrameElem.contentWindow).setLocation(loadURL, loadRequest);
    }

    return newScreenTPElem;
});

//  ------------------------------------------------------------------------

TP.lama.world.Inst.defineMethod('destroyScreen',
function(iFrameID) {

    /**
     * @method destroyScreen
     * @summary Destroys the screen element with the given iframeID and removes
     *     it from the set of the world's screens.
     * @param {String} iframeID The ID of the *iframe* that will be destroyed
     *     under the new lama:screen element.
     * @returns {TP.lama.world} The receiver.
     */

    var iframeTPElem,
        screenTPElem,

        infoElem;

    if (TP.isEmpty(iFrameID)) {
        return this;
    }

    //  Grab the *iframe* element that will be destroyed.
    iframeTPElem = TP.byId(iFrameID, TP.sys.getUIRoot());
    if (TP.notValid(iframeTPElem)) {
        return this;
    }

    //  **MAKE SURE TO SWITCH SCREENS HERE**
    //  If we don't switch screens here, then the rest of the Lama will be
    //  pointing at an old screen, which is now destroyed, which causes all
    //  kinds of problems.
    this.switchToScreen(0, false);

    //  The TIBET screen element will be the iframe's parent node.
    screenTPElem = iframeTPElem.getParentNode();

    //  Grab the info element from the screen.
    infoElem = screenTPElem.get('infoElement');

    //  Detach them both.
    screenTPElem.detach();
    TP.nodeDetach(infoElem);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.world.Inst.defineMethod('getScreenDocuments',
function() {

    /**
     * @method getScreenDocuments
     * @summary Returns all of the documents associated with the current set of
     *     world screens.
     * @returns {TP.dom.Document[]} A list of documents in the current set of
     *     screens.
     */

    var screens,
        tpDocs;

    screens = this.get('screens');

    tpDocs = screens.collect(
                function(aScreen) {
                    return aScreen.getContentDocument();
                });

    return tpDocs;
});

//  ------------------------------------------------------------------------

TP.lama.world.Inst.defineMethod('getScreenLocations',
function() {

    /**
     * @method getScreenLocations
     * @summary Returns a list of URLs currently being held by the various
     *     screens that have content loaded into them from a URL.
     * @returns {String[]} A list of screen URLs.
     */

    var screens,
        locs;

    screens = this.get('screens');

    locs = TP.ac();

    screens.forEach(
            function(aScreen) {
                var uri;

                uri = TP.uc(aScreen.getLocation());
                if (TP.isURI(uri)) {
                    locs.push(uri.getVirtualLocation());
                } else {
                    locs.push('');
                }
            });

    return locs;
});

//  ------------------------------------------------------------------------

TP.lama.world.Inst.defineMethod('getScreensWithLocation',
function(aLocation) {

    /**
     * @method getScreensWithLocation
     * @summary Returns the screens that have content loaded into them from the
     *     supplied location.
     * @param {String} aLocation The location that matches the screen to be
     *     switched to.
     * @returns {TP.lama.screen[]} A list of screen objects.
     */

    var screens,
        loc,
        matchingScreens;

    screens = this.get('screens');

    loc = TP.uc(aLocation).getLocation();

    matchingScreens = TP.ac();

    screens.forEach(
            function(aScreen) {
                var screenLoc;

                screenLoc = TP.uc(aScreen.getLocation(true)).getLocation();
                if (screenLoc === loc) {
                    matchingScreens.push(aScreen);
                }
            });

    return matchingScreens;
});

//  ------------------------------------------------------------------------

TP.lama.world.Inst.defineHandler('PclassClosedChange',
function(aSignal) {

    /**
     * @method handlePclassClosedChangeFromLamaHUD
     * @summary Handles when the HUD's 'closed' state changes. We track that by
     *     refocusing ourself.
     * @param {TP.sig.PclassClosedChange} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.lama.world} The receiver.
     */

    var hudIsClosed;

    //  Grab the HUD and see if it's currently open or closed.
    hudIsClosed = TP.bc(aSignal.getOrigin().getAttribute('closed'));

    if (hudIsClosed) {
        this.toggleObservations(false);
    } else {
        this.toggleObservations(true);
    }

    return this;
}, {
    origin: 'LamaHUD'
});

//  ------------------------------------------------------------------------

TP.lama.world.Inst.defineHandler('FocusScreen',
function(aSignal) {

    /**
     * @method handleFocusScreen
     * @summary Handles notifications of screen focus signals.
     * @param {TP.sig.FocusScreen} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.world} The receiver.
     */

    this.setAttribute('mode', 'normal');

    this.signal('ToggleScreen', aSignal.getPayload());

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.world.Inst.defineHandler('ToggleScreen',
function(aSignal) {

    /**
     * @method handleToggleScreen
     * @summary Handles notifications of screen toggle signals.
     * @param {TP.sig.ToggleScreen} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.lama.world} The receiver.
     */

    this.switchToScreen(aSignal.at('screenIndex'), false);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.world.Inst.defineMethod('setScreenLocations',
function(locations) {

    /**
     * @method setScreenLocations
     * @summary Sets the locations of the currently open screens to the supplied
     *     URLs.
     * @param {String[]} locations The list of URLs to set the contents of the
     *     currently open screens to.
     * @returns {TP.lama.world} The receiver.
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
            this.createScreen('SCREEN_' + (i + screenCount));
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
        }
    };

    loadFunc();

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.world.Inst.defineMethod('switchToScreen',
function(aScreenIndex, shouldCreate, newScreenLocation, aRequest,
switchCompleteFunc) {

    /**
     * @method switchToScreen
     * @summary Switch to the screen indicated by the supplied index.
     * @param {Number} aScreenIndex The index of the screen that should be made
     *     active.
     * @param {Boolean} [shouldCreate=false] Whether or not a screen should be
     *     created using the supplied location.
     * @param {String} [newScreenLocation] The location that a created screen
     *     should be set to if it doesn't exist.
     * @param {TP.sig.Request} [aRequest] A request object which defines further
     *     parameters.
     * @param {Function} [switchCompleteFunc] The Function to call when the
     *     switching to the screen is finished.
     * @returns {TP.lama.world} The receiver.
     */

    var oldScreen,
        newScreen,

        oldInfo,

        consoleService,
        halo,

        postSwitchFunc,

        newInfo,

        newIndex;

    //  Get the old selected screen
    oldScreen = this.get('selectedScreen');

    if (aScreenIndex !== TP.NOT_FOUND) {
        //  Get the new selected screen
        newScreen = this.get('screens').at(aScreenIndex);
        if (newScreen.identicalTo(oldScreen)) {
            return this;
        }
    }

    //  Get the old selected information overlay
    oldInfo = this.get('selectedInfo');

    consoleService = TP.bySystemId('LamaConsoleService');

    this.signal('ScreenWillToggle');

    //  If there was an old selected screen, deselect it and the associated
    //  information overlay. Also, set the console's UICANVAS to null.
    if (TP.isValid(oldScreen)) {
        oldScreen.setSelected(false);
        oldInfo.setSelected(false);

        consoleService.get('model').setVariable('UICANVAS', null);
    }

    halo = TP.byId('LamaHalo', this.getNativeDocument());

    if (TP.isValid(halo)) {
        //  Note that we do not worry here whether the current target can be
        //  blurred or not. The screen content is changing and we can't stop it.
        halo.blur();
        halo.setAttribute('hidden', true);
    }

    //  Create a Function that will be invoked after the screens are switched.
    //  If a new screen is created, then this method will be invoked
    //  asynchronously after the iframe associated with the screen is loaded.
    postSwitchFunc = function() {
        var newTPWindow;

        newScreen.setSelected(true);
        newInfo.setSelected(true);

        newTPWindow = newScreen.getContentWindow();

        consoleService.get('model').setVariable('UICANVAS', newTPWindow);

        TP.sys.setUICanvas('UIROOT.' + newTPWindow.getLocalID());

        if (TP.isCallable(switchCompleteFunc)) {
            switchCompleteFunc();
        }

        //  Make sure to scroll it into view.
        this.scrollSelectedScreenIntoView();

        this.signal('ScreenDidToggle', TP.request('screenIndex', newIndex));
    }.bind(this);

    //  If there is a new selected screen, select it and the associated
    //  information overlay.
    if (TP.isValid(newScreen)) {
        newIndex = aScreenIndex;

        //  Get the new selected information overlay
        newInfo = this.get('infos').at(aScreenIndex);

        //  Invoke the post switching Function immediately.
        postSwitchFunc();
    } else if (TP.isTrue(shouldCreate)) {

        //  Otherwise, if the caller supplied true for shouldCreate, then set
        //  the newIndex to the size of the list of locations and create a
        //  screen with the supplied location.
        newIndex = this.getScreenLocations().getSize();
        this.createScreen(
                'SCREEN_' + newIndex,
                null,
                TP.uc(newScreenLocation),
                aRequest,
                function() {
                    //  This function will be called after the iframe associated
                    //  with the new screen is loaded.

                    //  Now that the new screen and info are there, grab
                    //  references to them
                    newScreen = this.get('screens').at(newIndex);
                    newInfo = this.get('infos').at(newIndex);

                    //  Invoke the post switching Function.
                    postSwitchFunc();
                }.bind(this));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.world.Inst.defineMethod('switchToScreenWithLocation',
function(aLocation, shouldCreate, aRequest, switchCompleteFunc) {

    /**
     * @method switchToScreenWithLocation
     * @summary Switch to the screen containing the supplied location.
     * @param {String} aLocation The location that matches the screen to be
     *     switched to.
     * @param {Boolean} [shouldCreate=false] Whether or not a screen should be
     *     created using the supplied location if it doesn't exist.
     * @param {TP.sig.Request} [aRequest] A request object which defines further
     *     parameters.
     * @param {Function} [switchCompleteFunc] The Function to call when the
     *     switching to the screen is finished.
     * @returns {TP.lama.world} The receiver.
     */

    var loc,
        locs,

        index;

    this.setAttribute('mode', 'normal');

    //  Grab the fully expanded location of the supplied location.
    loc = TP.uc(aLocation).getLocation();

    //  Grab the set of managed screen locations and convert them to their fully
    //  expanded form. This will allow us to compare to the supplied location in
    //  a canonicalized way.
    locs = this.getScreenLocations().collect(
                function(aLoc) {
                    return TP.uc(aLoc).getLocation();
                });

    //  Grab the index of the location. This will match the index of the screen.
    index = locs.indexOf(loc);

    //  Switch to that screen (or create it with the supplied location).
    this.switchToScreen(index, shouldCreate, loc, aRequest, switchCompleteFunc);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.world.Inst.defineMethod('removeScreen',
function(anIndex) {

    /**
     * @method removeScreen
     * @summary Removes the screen element at the supplied index.
     * @param {Number} anIndex The index of the existing screen to be removed.
     * @returns {TP.lama.world} The receiver.
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

TP.lama.world.Inst.defineMethod('scrollSelectedScreenIntoView',
function() {

    /**
     * @method scrollSelectedScreenIntoView
     * @summary Scrolls the currently selected screen into view in the world.
     * @returns {TP.lama.world} The receiver.
     */

    var selectedScreen,
        selectedRect,

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

TP.lama.world.Inst.defineMethod('toggleObservations',
function(shouldObserve) {

    /**
     * @method toggleObservations
     * @summary Either observe or ignore the signals that the receiver needs to
     *     function.
     * @param {Boolean} shouldObserve Whether or not we should be observing (or
     *     ignoring) signals.
     * @returns {TP.lama.world} The receiver.
     */

    if (shouldObserve) {
        this.observe(TP.ANY,
                        TP.ac('TP.sig.ToggleScreen', 'TP.sig.FocusScreen'));
    } else {
        this.ignore(TP.ANY,
                        TP.ac('TP.sig.ToggleScreen', 'TP.sig.FocusScreen'));
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
