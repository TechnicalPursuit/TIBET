//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  ========================================================================
//  html:
//  ========================================================================

TP.html.XMLNS.Type.describe('dhtml: position element using compass points',
function() {

    var loadURI,
        unloadURI,

        alignmentTop,
        alignmentLeft,
        alignmentWidth,
        alignmentHeight,

        positioningWidth,
        positioningHeight,

        positioningTPElem,
        alignmentTPElem;

    loadURI = TP.uc('~lib_test/src/tibet/dhtml/DHTMLContent.xhtml');

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    alignmentTop = 10;
    alignmentLeft = 10;
    alignmentWidth = 10;
    alignmentHeight = 10;

    positioningWidth = 50;
    positioningHeight = 50;

    //  ---

    this.before(
        function(suite, options) {
            this.getDriver().setLocation(loadURI);
        });

    //  ---

    this.beforeEach(
        function(test, options) {
            positioningTPElem = TP.byId('positioningElement');
            alignmentTPElem = TP.byId('alignmentElement');

            positioningTPElem.getNativeNode().style.top = '';
            positioningTPElem.getNativeNode().style.left = '';
        });

    //  ---

    this.after(
        function(suite, options) {

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---
    //  POSITION USING NORTHWEST CORNER
    //  ---

    this.it('position element with TP.NORTHWEST/TP.NORTHEAST corner/side', function(test, options) {

        var testRect,
            correctRect;

        positioningTPElem.positionUsingCompassPoints(
            TP.NORTHWEST,
            TP.NORTHEAST,
            alignmentTPElem,
            null,
            null,
            null,
            null);

        testRect = positioningTPElem.getGlobalRect();

        correctRect = TP.rtc(
                        alignmentLeft + alignmentWidth,
                        alignmentTop,
                        positioningWidth,
                        positioningHeight);

        test.assert.isEqualTo(testRect, correctRect);
    });

    //  ---

    this.it('position element with TP.NORTHWEST/TP.SOUTHEAST corner/side', function(test, options) {

        var testRect,
            correctRect;

        positioningTPElem.positionUsingCompassPoints(
            TP.NORTHWEST,
            TP.SOUTHEAST,
            alignmentTPElem,
            null,
            null,
            null,
            null);

        testRect = positioningTPElem.getGlobalRect();

        correctRect = TP.rtc(
                        alignmentLeft + alignmentWidth,
                        alignmentTop + alignmentHeight,
                        positioningWidth,
                        positioningHeight);

        test.assert.isEqualTo(testRect, correctRect);
    });

    //  ---

    this.it('position element with TP.NORTHWEST/TP.SOUTHWEST corner/side', function(test, options) {

        var testRect,
            correctRect;

        positioningTPElem.positionUsingCompassPoints(
            TP.NORTHWEST,
            TP.SOUTHWEST,
            alignmentTPElem,
            null,
            null,
            null,
            null);

        testRect = positioningTPElem.getGlobalRect();

        correctRect = TP.rtc(
                        alignmentLeft,
                        alignmentTop + alignmentHeight,
                        positioningWidth,
                        positioningHeight);

        test.assert.isEqualTo(testRect, correctRect);
    });

    //  ---

    this.it('position element with TP.NORTHWEST/TP.NORTHWEST corner/side', function(test, options) {

        var testRect,
            correctRect;

        positioningTPElem.positionUsingCompassPoints(
            TP.NORTHWEST,
            TP.NORTHWEST,
            alignmentTPElem,
            null,
            null,
            null,
            null);

        testRect = positioningTPElem.getGlobalRect();

        correctRect = TP.rtc(
                        alignmentLeft,
                        alignmentTop,
                        positioningWidth,
                        positioningHeight);

        test.assert.isEqualTo(testRect, correctRect);
    });

    //  ---
    //  POSITION USING NORTHEAST CORNER
    //  ---

    this.it('position element with TP.NORTHEAST/TP.NORTHEAST corner/side', function(test, options) {

        var testRect,
            correctRect;

        positioningTPElem.positionUsingCompassPoints(
            TP.NORTHEAST,
            TP.NORTHEAST,
            alignmentTPElem,
            null,
            null,
            null,
            null);

        testRect = positioningTPElem.getGlobalRect();

        /* eslint-disable no-extra-parens */
        correctRect = TP.rtc(
                        (alignmentLeft + alignmentWidth) - positioningWidth,
                        alignmentTop,
                        positioningWidth,
                        positioningHeight);
        /* eslint-enable no-extra-parens */

        test.assert.isEqualTo(testRect, correctRect);
    });

    //  ---

    this.it('position element with TP.NORTHEAST/TP.SOUTHEAST corner/side', function(test, options) {

        var testRect,
            correctRect;

        positioningTPElem.positionUsingCompassPoints(
            TP.NORTHEAST,
            TP.SOUTHEAST,
            alignmentTPElem,
            null,
            null,
            null,
            null);

        testRect = positioningTPElem.getGlobalRect();

        /* eslint-disable no-extra-parens */
        correctRect = TP.rtc(
                        (alignmentLeft + alignmentWidth) - positioningWidth,
                        alignmentTop + alignmentHeight,
                        positioningWidth,
                        positioningHeight);
        /* eslint-enable no-extra-parens */

        test.assert.isEqualTo(testRect, correctRect);
    });

    //  ---

    this.it('position element with TP.NORTHEAST/TP.SOUTHWEST corner/side', function(test, options) {

        var testRect,
            correctRect;

        positioningTPElem.positionUsingCompassPoints(
            TP.NORTHEAST,
            TP.SOUTHWEST,
            alignmentTPElem,
            null,
            null,
            null,
            null);

        testRect = positioningTPElem.getGlobalRect();

        correctRect = TP.rtc(
                        alignmentLeft - positioningWidth,
                        alignmentTop + alignmentHeight,
                        positioningWidth,
                        positioningHeight);

        test.assert.isEqualTo(testRect, correctRect);
    });

    //  ---

    this.it('position element with TP.NORTHEAST/TP.NORTHWEST corner/side', function(test, options) {

        var testRect,
            correctRect;

        positioningTPElem.positionUsingCompassPoints(
            TP.NORTHEAST,
            TP.NORTHWEST,
            alignmentTPElem,
            null,
            null,
            null,
            null);

        testRect = positioningTPElem.getGlobalRect();

        correctRect = TP.rtc(
                        alignmentLeft - positioningWidth,
                        alignmentTop,
                        positioningWidth,
                        positioningHeight);

        test.assert.isEqualTo(testRect, correctRect);
    });

    //  ---
    //  POSITION USING SOUTHEAST CORNER
    //  ---

    this.it('position element with TP.SOUTHEAST/TP.NORTHEAST corner/side', function(test, options) {

        var testRect,
            correctRect;

        positioningTPElem.positionUsingCompassPoints(
            TP.SOUTHEAST,
            TP.NORTHEAST,
            alignmentTPElem,
            null,
            null,
            null,
            null);

        testRect = positioningTPElem.getGlobalRect();

        /* eslint-disable no-extra-parens */
        correctRect = TP.rtc(
                        (alignmentLeft + alignmentWidth) - positioningWidth,
                        alignmentTop - positioningHeight,
                        positioningWidth,
                        positioningHeight);
        /* eslint-enable no-extra-parens */

        test.assert.isEqualTo(testRect, correctRect);
    });

    //  ---

    this.it('position element with TP.SOUTHEAST/TP.SOUTHEAST corner/side', function(test, options) {

        var testRect,
            correctRect;

        positioningTPElem.positionUsingCompassPoints(
            TP.SOUTHEAST,
            TP.SOUTHEAST,
            alignmentTPElem,
            null,
            null,
            null,
            null);

        testRect = positioningTPElem.getGlobalRect();

        /* eslint-disable no-extra-parens */
        correctRect = TP.rtc(
                        (alignmentLeft + alignmentWidth) - positioningWidth,
                        (alignmentTop + alignmentHeight) - positioningHeight,
                        positioningWidth,
                        positioningHeight);
        /* eslint-enable no-extra-parens */

        test.assert.isEqualTo(testRect, correctRect);
    });

    //  ---

    this.it('position element with TP.SOUTHEAST/TP.SOUTHWEST corner/side', function(test, options) {

        var testRect,
            correctRect;

        positioningTPElem.positionUsingCompassPoints(
            TP.SOUTHEAST,
            TP.SOUTHWEST,
            alignmentTPElem,
            null,
            null,
            null,
            null);

        testRect = positioningTPElem.getGlobalRect();

        /* eslint-disable no-extra-parens */
        correctRect = TP.rtc(
                        alignmentLeft - positioningWidth,
                        (alignmentTop + alignmentHeight) - positioningHeight,
                        positioningWidth,
                        positioningHeight);
        /* eslint-enable no-extra-parens */

        test.assert.isEqualTo(testRect, correctRect);
    });

    //  ---

    this.it('position element with TP.SOUTHEAST/TP.NORTHWEST corner/side', function(test, options) {

        var testRect,
            correctRect;

        positioningTPElem.positionUsingCompassPoints(
            TP.SOUTHEAST,
            TP.NORTHWEST,
            alignmentTPElem,
            null,
            null,
            null,
            null);

        testRect = positioningTPElem.getGlobalRect();

        correctRect = TP.rtc(
                        alignmentLeft - positioningWidth,
                        alignmentTop - positioningHeight,
                        positioningWidth,
                        positioningHeight);

        test.assert.isEqualTo(testRect, correctRect);
    });

    //  ---
    //  POSITION USING SOUTHWEST CORNER
    //  ---

    this.it('position element with TP.SOUTHWEST/TP.NORTHEAST corner/side', function(test, options) {

        var testRect,
            correctRect;

        positioningTPElem.positionUsingCompassPoints(
            TP.SOUTHWEST,
            TP.NORTHEAST,
            alignmentTPElem,
            null,
            null,
            null,
            null);

        testRect = positioningTPElem.getGlobalRect();

        correctRect = TP.rtc(
                        alignmentLeft + alignmentWidth,
                        alignmentTop - positioningHeight,
                        positioningWidth,
                        positioningHeight);

        test.assert.isEqualTo(testRect, correctRect);
    });

    //  ---

    this.it('position element with TP.SOUTHWEST/TP.SOUTHEAST corner/side', function(test, options) {

        var testRect,
            correctRect;

        positioningTPElem.positionUsingCompassPoints(
            TP.SOUTHWEST,
            TP.SOUTHEAST,
            alignmentTPElem,
            null,
            null,
            null,
            null);

        testRect = positioningTPElem.getGlobalRect();

        /* eslint-disable no-extra-parens */
        correctRect = TP.rtc(
                        alignmentLeft + alignmentWidth,
                        (alignmentTop + alignmentHeight) - positioningHeight,
                        positioningWidth,
                        positioningHeight);
        /* eslint-enable no-extra-parens */

        test.assert.isEqualTo(testRect, correctRect);
    });

    //  ---

    this.it('position element with TP.SOUTHWEST/TP.SOUTHWEST corner/side', function(test, options) {

        var testRect,
            correctRect;

        positioningTPElem.positionUsingCompassPoints(
            TP.SOUTHWEST,
            TP.SOUTHWEST,
            alignmentTPElem,
            null,
            null,
            null,
            null);

        testRect = positioningTPElem.getGlobalRect();

        /* eslint-disable no-extra-parens */
        correctRect = TP.rtc(
                        alignmentLeft,
                        (alignmentTop + alignmentHeight) - positioningHeight,
                        positioningWidth,
                        positioningHeight);
        /* eslint-enable no-extra-parens */

        test.assert.isEqualTo(testRect, correctRect);
    });

    //  ---

    this.it('position element with TP.SOUTHWEST/TP.NORTHWEST corner/side', function(test, options) {

        var testRect,
            correctRect;

        positioningTPElem.positionUsingCompassPoints(
            TP.SOUTHWEST,
            TP.NORTHWEST,
            alignmentTPElem,
            null,
            null,
            null,
            null);

        testRect = positioningTPElem.getGlobalRect();

        correctRect = TP.rtc(
                        alignmentLeft,
                        alignmentTop - positioningHeight,
                        positioningWidth,
                        positioningHeight);

        test.assert.isEqualTo(testRect, correctRect);
    });

});

//  ------------------------------------------------------------------------

TP.html.XMLNS.Type.describe('dhtml: position element using compass points without clipping by body',
function() {

    var loadURI,
        unloadURI,

        positioningWidth,
        positioningHeight,

        bodyTop,
        bodyLeft,

        positioningTPElem,
        alignmentTPElem,
        bodyTPElem;

    loadURI = TP.uc('~lib_test/src/tibet/dhtml/DHTMLContent.xhtml');

    unloadURI = TP.uc(TP.sys.cfg('path.blank_page'));

    positioningWidth = 50;
    positioningHeight = 50;

    //  ---

    this.before(
        function(suite, options) {
            this.getDriver().setLocation(loadURI);
        });

    //  ---

    this.beforeEach(
        function(test, options) {
            var bodyRect;

            positioningTPElem = TP.byId('positioningElement');
            alignmentTPElem = TP.byId('alignmentElement');
            bodyTPElem = alignmentTPElem.getDocument().getBody();

            positioningTPElem.getNativeNode().style.top = '';
            positioningTPElem.getNativeNode().style.left = '';

            bodyRect = bodyTPElem.getGlobalRect();
            bodyTop = bodyRect.getY();
            bodyLeft = bodyRect.getX();
        });

    //  ---

    this.after(
        function(suite, options) {

            //  Unload the current page by setting it to the blank
            this.getDriver().setLocation(unloadURI);

            //  Unregister the URI to avoid a memory leak
            loadURI.unregister();
        });

    //  ---

    this.it('position element with TP.SOUTHEAST/TP.SOUTHWEST corner/side', function(test, options) {

        var testRect,
            correctRect;

        positioningTPElem.positionUsingCompassPoints(
            TP.SOUTHEAST,
            TP.SOUTHWEST,
            alignmentTPElem,
            TP.ac(bodyTPElem.getGlobalRect()),
            null,
            null,
            null);

        testRect = positioningTPElem.getGlobalRect();

        /* eslint-disable no-extra-parens */
        correctRect = TP.rtc(
                        bodyLeft,
                        bodyTop,
                        positioningWidth,
                        positioningHeight);
        /* eslint-enable no-extra-parens */

        test.assert.isEqualTo(testRect, correctRect);
    });

});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
