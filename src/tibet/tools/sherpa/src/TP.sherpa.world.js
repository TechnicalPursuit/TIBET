//  ========================================================================
/*
NAME:   TP.sherpa.world.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        The contents of this file are subject to the terms and conditions of
        the Technical Pursuit License ("TPL") Version 1.5, or subsequent
        versions as allowed by the TPL, and You may not copy or use this
        file in either source code or executable form, except in compliance
        with the terms and conditions of the TPL.  You may obtain a copy of
        the TPL (the "License") from Technical Pursuit Inc. at
        http://www.technicalpursuit.com.

        All software distributed under the License is provided strictly on
        an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR
        IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS ALL SUCH
        WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT,
        OR NON-INFRINGEMENT. See the License for specific language governing
        rights and limitations under the License.
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

TP.sherpa.world.Inst.defineAttribute('numRows');
TP.sherpa.world.Inst.defineAttribute('numCols');

TP.sherpa.world.Inst.defineAttribute('screenWidth');
TP.sherpa.world.Inst.defineAttribute('screenHeight');

TP.sherpa.world.Inst.defineAttribute('gapWidth');
TP.sherpa.world.Inst.defineAttribute('gapHeight');

//  ------------------------------------------------------------------------

TP.sherpa.world.Type.defineMethod('tshAwakenDOM',
function(aRequest) {

    /**
     * @name tshAwakenDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Number} The TP.DESCEND flag, telling the system to descend into
     *     the children of this element.
     */

    var elem;

    if (TP.isElement(elem = aRequest.at('cmdNode'))) {
        this.addStylesheetTo(TP.nodeGetDocument(elem));
    }

    return TP.DESCEND;
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

    var initialRows,
        initialCols,

        initialScreenWidth,
        initialScreenHeight,

        allScreens,
        numScreens,

        screenWidth,
        screenHeight,

        gapWidth,
        gapHeight,

        worldSize,

        worldWidth,
        worldHeight;

    initialRows = TP.ifInvalid(2, TP.sys.cfg('sherpa.initial_rows'));
    initialCols = TP.ifInvalid(2, TP.sys.cfg('sherpa.initial_cols'));

    initialScreenWidth =
        TP.ifInvalid(1024, TP.sys.cfg('sherpa.initial_screen_height'));
    initialScreenHeight =
        TP.ifInvalid(768, TP.sys.cfg('sherpa.initial_screen_width'));

    allScreens = TP.byCSS('sherpa|screen', this.getNativeWindow());
    numScreens = allScreens.getSize();

    this.set('numRows', initialRows);
    this.set('numCols', initialCols);

    this.set('screenWidth', initialScreenWidth);
    this.set('screenHeight', initialScreenHeight);

    this.set('gapWidth', 10);
    this.set('gapHeight', 10);

    gapWidth = this.get('gapWidth');
    gapHeight = this.get('gapHeight');

    screenWidth = this.get('screenWidth');
    screenHeight = this.get('screenHeight');

    TP.extern.d3.selectAll(allScreens).
        style('left',
        function(d, i) {
            var colNum;
            colNum = i % initialCols;
            return (screenWidth * colNum) + ((colNum + 1) * gapWidth) + 'px';
        }).
        style('width',
        function(d, i) {
            return screenWidth + 'px';
        }).
        style('height',
        function(d, i) {
            return screenHeight + 'px';
        }).
        style('top',
        function(d, i) {
            var rowNum;
            rowNum = (i / initialRows).floor();
            return (screenHeight * rowNum) + ((rowNum + 1) * gapHeight) + 'px';
        });

    //TP.extern.d3.select(allScreens.first()).attr('selected', 'true');

    worldSize = this.getComputedWidthAndHeight();
    worldWidth = worldSize.first();
    worldHeight = worldSize.last();

    var natElem = this.getNativeNode();

    TP.elementGetStyleObj(natElem).width = worldWidth + 'px';
    TP.elementGetStyleObj(natElem).height = worldHeight + 'px';

    /*
    this.getNativeDocument().defaultView.onresize =
        function() {
            this.setView(this.get('viewRect'));
        };
    */

    this.observe(TP.byOID('SherpaHUD'), 'HiddenChange');

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineMethod('handleSherpaHUDHiddenChange',
function(aSignal) {

    /**
     * @name handleHiddenChange
     */

    var isHidden;

    isHidden = aSignal.getOrigin().get('hidden');

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

TP.sherpa.world.Inst.defineMethod('getComputedWidthAndHeight',
function() {

    /**
     * @name getComputedWidthAndHeight
     * @returns {Array} 
     */

    var worldColumns,
        worldRows,

        screenWidth,
        screenHeight,

        gapWidth,
        gapHeight,

        worldWidth,
        worldHeight;

    worldColumns = this.get('numCols');
    worldRows = this.get('numRows');

    screenWidth = this.get('screenWidth');
    screenHeight = this.get('screenHeight');

    gapWidth = this.get('gapWidth');
    gapHeight = this.get('gapHeight');

    worldWidth = (worldColumns * screenWidth) + ((worldColumns + 1) * gapWidth);
    worldHeight = (worldRows * screenHeight) + ((worldRows + 1) * gapHeight);

    return TP.ac(worldWidth, worldHeight);
});

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
        height;

    screenWidth = this.get('screenWidth');
    screenHeight = this.get('screenHeight');

    gapWidth = this.get('gapWidth');
    gapHeight = this.get('gapHeight');

    translateX = (screenWidth * screenColNum) + (gapWidth * screenColNum);
    translateY = (screenHeight * screenRowNum) + (gapHeight * screenRowNum);

    width = screenWidth + (gapWidth * 2);
    height = screenHeight + (gapHeight * 2);

    var hud,
        hudHorizOffset,
        hudVertOffset;

    hudHorizOffset = (30 + 5);
    hudVertOffset = (50 + 5);

    if (TP.isValid(hud = TP.byOID('SherpaHUD')) &&
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

    if (TP.isValid(hud = TP.byOID('SherpaHUD')) &&
        TP.notTrue(hud.get('hidden'))) {
        translateX -= hudHorizOffset;
        translateY -= hudVertOffset;
        worldWidth += hudHorizOffset * 2;
        worldHeight += hudVertOffset * 2;
    }

    this.setView(TP.rtc(translateX, translateY, worldWidth, worldHeight));

    this.set('currentFocus', TP.SELF);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.world.Inst.defineMethod('fitToVisibleWindow',
function() {

    /**
     * @name fitToVisibleWindow
     * @returns {TP.sherpa.world} The receiver.
     */

    return this;

    var nativeDoc,
        windowWidth,
        windowHeight;

    nativeDoc = this.getNativeDocument();

    windowWidth = TP.documentGetViewableWidth(nativeDoc);
    windowHeight = TP.documentGetViewableHeight(nativeDoc);

    this.setView(TP.rtc(0, 0, windowWidth, windowHeight));

    return this;
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
