//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.xctrls.yahoomap}
 */

/* eslint-disable new-cap */

//  ------------------------------------------------------------------------

TP.xctrls.map.defineSubtype('yahoomap');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('$computeYahooMapScriptSrc',
function() {

    /**
     * @method $computeYahooMapScriptSrc
     * @returns {String}
     * @abstract
     */

    var scriptSrcURL;

    //  The API key for TIBET registered with Yahoo...

    //  NOTE we break this apart at the '=' to make lint happy
    scriptSrcURL = 'http://api.maps.yahoo.com/ajaxymap?v' +
                    '=3.0&appid' +
                    '=KlKbHSHIkY0QsgeX1Xqig2R.iHoSiYy_';

    return scriptSrcURL;
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('$convertLatLongToYahooLatLong',
function(aLatLong) {

    /**
     * @method $convertLatLongToYahooLatLong
     * @param {TP.core.LatLong} aLatLong
     * @returns {Object} A Yahoo LatLong object.
     * @abstract
     */

    return this.get('tpIFrame').constructObject('YGeoPoint',
                                                aLatLong.get('lat'),
                                                aLatLong.get('long'));
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('$convertMarkerToYahooMarker',
function(aMarker) {

    /**
     * @method $convertMarkerToYahooMarker
     * @param {TPMarker} aMarker
     * @returns {Object} A Yahoo marker object.
     * @abstract
     */

    var tpIFrame,
        optionValue,
        yahooMarker;

    tpIFrame = this.get('tpIFrame');

    if (TP.isValid(optionValue = aMarker.get('iconURL'))) {
        yahooMarker = tpIFrame.constructObject(
                    'YMarker',
                    this.$convertLatLongToYahooLatLong(
                                                aMarker.get('location')),
                    tpIFrame.constructObject('YImage', optionValue));
    } else {
        yahooMarker = tpIFrame.constructObject(
                    'YMarker',
                    this.$convertLatLongToYahooLatLong(
                                                aMarker.get('location')));
    }

    if (TP.isValid(optionValue = aMarker.get('labelText'))) {
        yahooMarker.addLabel(optionValue);
    }

    return yahooMarker;
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('addControls',
function(hasPan, zoomType, hasOverview, hasScale, hasMapType) {

    /**
     * @method addControls
     * @param {undefined} hasPan
     * @param {String|null} zoomType One of the following values: 'small',
     *     'large' or null (for no zoom capability).
     * @param {undefined} hasOverview
     * @param {undefined} hasScale
     * @param {undefined} hasMapType
     * @returns {TP.xctrls.yahoomap} The receiver.
     * @abstract
     */

    var ourMap;

    //  Remove all existing controls
    this.removeAllControls();

    ourMap = this.get('map');

    if (TP.isTrue(hasPan)) {
        ourMap.addPanControl();
    }

    if (zoomType === 'small') {
        ourMap.addZoomShort();
    } else if (zoomType === 'large') {
        ourMap.addZoomLong();
    }

    if (TP.isTrue(hasMapType)) {
        ourMap.Type.defineControl();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('addLargeControls',
function() {

    /**
     * @method addLargeControls
     * @returns {TP.xctrls.yahoomap} The receiver.
     * @abstract
     */

    this.get('map').addPanControl();
    this.get('map').addZoomLong();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('addMapTypeControls',
function() {

    /**
     * @method addMapTypeControls
     * @returns {TP.xctrls.yahoomap} The receiver.
     * @abstract
     */

    this.get('map').Type.defineControl();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('addMarker',
function(aMarker) {

    /**
     * @method addMarker
     * @param {undefined} aMarker
     * @returns {TP.xctrls.yahoomap} The receiver.
     * @abstract
     */

    var yahooMarker;

    yahooMarker = this.$convertMarkerToYahooMarker(aMarker);
    aMarker.set('nativeMarker', yahooMarker);

    //  Make sure and do this *before* we add the overlay to the native map
    //  object.
    this.get('tpIFrame').get('YEvent').Capture(
                yahooMarker,
                this.get('tpIFrame').get('EventsList').MouseClick,
                function() {

                    this.signal('TP_xctrls_MapMarkerClicked',
                                    aMarker);
                }.bind(this));

    this.get('map').addOverlay(yahooMarker);

    this.get('markers').push(aMarker);

    this.signal('TP_xctrls_MapMarkerAdded', aMarker);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('addSmallControls',
function() {

    /**
     * @method addSmallControls
     * @returns {TP.xctrls.yahoomap} The receiver.
     * @abstract
     */

    this.get('map').addPanControl();
    this.get('map').addZoomShort();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('configure',
function() {

    /**
     * @method configure
     * @returns {TP.xctrls.yahoomap} The receiver.
     * @abstract
     */

    var tpIFrame,

        natIFrameWin,
        natIFrameDoc,

        mapNode,
        mapObj,

        justPanned;

    tpIFrame = this.get('tpIFrame');

    natIFrameWin = tpIFrame.getNativeContentWindow();
    natIFrameDoc = tpIFrame.getNativeContentDocument();

    mapNode = TP.nodeGetElementById(natIFrameDoc, 'map_stub');
    mapObj = tpIFrame.constructObject('YMap', mapNode);
    this.set('map', mapObj);

    justPanned = false;

    tpIFrame.get('YEvent').Capture(
            this.get('map'),
            tpIFrame.get('EventsList').MouseClick,
            TP.windowBuildFunctionFor(
                natIFrameWin,
                function(event, location) {

                    if (justPanned) {
                        justPanned = false;
                        return;
                    }

                    this.signal('TP_xctrls_MapClicked',
                                    TP.llc(location.Lat, location.Lon));
                }.bind(this)));

    tpIFrame.get('YEvent').Capture(
            this.get('map'),
            tpIFrame.get('EventsList').endPan,
            TP.windowBuildFunctionFor(
                natIFrameWin,
                function() {

                    this.signal('TP_xctrls_MapPanned',
                                    this.getCenter());
                    justPanned = true;
                }.bind(this)));

    tpIFrame.get('YEvent').Capture(
            this.get('map'),
            tpIFrame.get('EventsList').changeZoom,
            TP.windowBuildFunctionFor(
                natIFrameWin,
                function() {

                    this.signal('TP_xctrls_MapPanned',
                                    this.getCenter());
                }.bind(this)));

    this.refresh();

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('getBounds',
function() {

    /**
     * @method getBounds
     * @returns {TP.core.MapBounds}
     * @abstract
     */

    var yahooBox,

        newBounds;

    yahooBox = this.get('map').getBoundsLatLon();

    newBounds = TP.core.MapBounds.construct(yahooBox.LatMin,
                                            yahooBox.LonMin,
                                            yahooBox.LatMax,
                                            yahooBox.LonMax);

    return newBounds;
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('getCenter',
function() {

    /**
     * @method getCenter
     * @returns {undefined}
     * @abstract
     */

    var yahooLatLong;

    yahooLatLong = this.get('map').getCenterLatLon();

    return TP.llc(yahooLatLong.Lat, yahooLatLong.Lon);
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('getLatLongForAddress',
function(anAddress) {

    /**
     * @method getLatLongForAddress
     * @param {String} anAddress The address to plot.
     * @returns {TP.xctrls.yahoomap} The receiver.
     * @abstract
     */

    var ourMap,
        tpIFrame;

    ourMap = this.get('map');
    tpIFrame = this.get('tpIFrame');

    tpIFrame.get('YEvent').Capture(
        ourMap,
        tpIFrame.get('EventsList').onEndGeoCode,
function(response) {

            var responseLatLong;

            if (response.success !== 1) {
                //  TODO: Log an error here
                return;
            }

            responseLatLong = TP.llc(
                                response.Lat,   // lat
                                response.Lon);  // long

            responseLatLong.set('description', response.Address);

            this.signal('TP_xctrls_MapGeocodeComplete',
                            responseLatLong);
        }.bind(this));

    this.get('map').geoCodeAddress(anAddress);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('getMapType',
function() {

    /**
     * @method getMapType
     * @returns {TP.xctrls.yahoomap} The receiver.
     * @abstract
     */

    var mapTypeConstants,

        ourMap,
        tpIFrame,

        currentMapType;

    mapTypeConstants = this.getType();

    ourMap = this.get('map');
    tpIFrame = this.get('tpIFrame');

    currentMapType = ourMap.getCurrentMapType();

    switch (currentMapType) {
        case tpIFrame.get('YAHOO_MAP_REG'):

            return mapTypeConstants.at('ROAD');

        case tpIFrame.get('YAHOO_MAP_SAT'):

            return mapTypeConstants.at('SATELLITE');

        case tpIFrame.get('YAHOO_MAP_HYB'):

            return mapTypeConstants.at('HYBRID');

        default:

        break;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('getZoom',
function() {

    /**
     * @method getZoom
     * @returns {undefined}
     * @abstract
     */

    //  TODO: Verify this.
    return 18 - this.get('map').getZoomLevel();
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('getZoomLevelForMapBounds',
function(aMapBounds) {

    /**
     * @method getZoomLevelForMapBounds
     * @param {TP.core.MapBounds} aMapBounds
     * @returns {undefined}
     * @abstract
     */

    var southWestYLatLong,
        northEastYLatLong,

        zoom;

    northEastYLatLong = this.$convertLatLongToYahooLatLong(
                                aMapBounds.get('northEastLatLong'));
    southWestYLatLong = this.$convertLatLongToYahooLatLong(
                                aMapBounds.get('southWestLatLong'));

    zoom = this.get('map').getZoomLevel(
                            TP.ac(northEastYLatLong, southWestYLatLong));

    return zoom;
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('hideAllMarkers',
function() {

    /**
     * @method hideAllMarkers
     * @summary Hides all of the markers without removing them from the marker
     *     list.
     * @returns {TP.xctrls.yahoomap} The receiver.
     */

    //  Note that Yahoo uses the term 'markers', but these are the internal
    //  markers for it - not for us (they're not TP.core.MapMarker objects).
    this.get('map').removeMarkersAll();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('removeAllControls',
function() {

    /**
     * @method removeAllControls
     * @returns {TP.xctrls.yahoomap} The receiver.
     * @abstract
     */

    var ourMap;

    ourMap = this.get('map');

    ourMap.removePanControl();
    ourMap.removeZoomControl();

    //  Is there a 'remove' for the map type control?

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('removeMarker',
function(aMarker) {

    /**
     * @method removeMarker
     * @param {undefined} aMarker
     * @returns {TP.xctrls.yahoomap} The receiver.
     * @abstract
     */

    this.get('map').removeOverlay(aMarker.get('nativeMarker'));

    this.get('markers').remove(aMarker, TP.IDENTITY);

    this.signal('TP_xctrls_MapMarkerRemoved', aMarker);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('setBounds',
function(aMapBounds) {

    /**
     * @method setBounds
     * @param {undefined} aMapBounds
     * @returns {TP.xctrls.yahoomap} The receiver.
     * @abstract
     */

    var southWestYLatLong,
        northEastYLatLong,

        tpIFrame,

        yahooCenterPoint,

        container,
        zoomFactor,

        southWestInPixels,
        northEastInPixels;

    northEastYLatLong = this.$convertLatLongToYahooLatLong(
                                aMapBounds.get('northEastLatLong'));
    southWestYLatLong = this.$convertLatLongToYahooLatLong(
                                aMapBounds.get('southWestLatLong'));

    if (southWestYLatLong.lon > northEastYLatLong.lon) {
        southWestYLatLong.lon -= 360;
    }

    tpIFrame = this.get('tpIFrame');

    yahooCenterPoint = this.get('tpIFrame').constructObject(
                    'YGeoPoint',
                    (southWestYLatLong.lat + northEastYLatLong.lat) / 2,
                    (northEastYLatLong.lon + southWestYLatLong.lon) / 2);

    container = this.get('map').getContainerSize();

    for (zoomFactor = 1; zoomFactor <= 17; zoomFactor++) {
        southWestInPixels = tpIFrame.get('convertLatLonXY_Yahoo')(
                                            southWestYLatLong, zoomFactor);
        northEastInPixels = tpIFrame.get('convertLatLonXY_Yahoo')(
                                            northEastYLatLong, zoomFactor);

        /* jshint bitwise:false */
        if (southWestInPixels.x > northEastInPixels.x) {
            southWestInPixels.x -= (1 << (26 - zoomFactor));
        }
        /* jshint bitwise:true */

        if ((Math.abs(northEastInPixels.x - southWestInPixels.x) <=
                                                    container.width) &&
            (Math.abs(northEastInPixels.y - southWestInPixels.y) <=
                                                    container.height)) {
            this.get('map').drawZoomAndCenter(yahooCenterPoint,
                                                zoomFactor);
            break;
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('setCenter',
function(aLatLong) {

    /**
     * @method setCenter
     * @param {undefined} aLatLong
     * @returns {TP.xctrls.yahoomap} The receiver.
     * @abstract
     */

    var currentCenter,

        latLongParts,
        theLatLong,

        centerLatLong;

    currentCenter = this.getCenter();

    if (TP.isString(aLatLong)) {
        latLongParts = aLatLong.split(',');
        theLatLong = TP.llc(latLongParts.at(0), latLongParts.at(1));
    } else {
        theLatLong = aLatLong;
    }

    //  If we're already at the center point, exit here and avoid possible
    //  signaling recursion (if we have maps that are observing each other).
    if ((currentCenter.get('lat') === theLatLong.get('lat')) &&
        (currentCenter.get('long') === theLatLong.get('long'))) {
        return this;
    }

    centerLatLong = this.$convertLatLongToYahooLatLong(theLatLong);

    this.get('map').panToLatLon(centerLatLong);

    //  NB: Do this to be consistent with the other maps.
    this.signal('TP_xctrls_MapPanned', theLatLong);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('setCenterAndZoom',
function(aLatLong, zoomLevel) {

    /**
     * @method setCenterAndZoom
     * @param {undefined} aLatLong
     * @param {undefined} zoomLevel
     * @returns {TP.xctrls.yahoomap} The receiver.
     * @abstract
     */

    var yahooZoomLevel;

    //  TODO: Verify this.
    yahooZoomLevel = 18 - zoomLevel;

    this.get('map').drawZoomAndCenter(
            this.$convertLatLongToYahooLatLong(aLatLong),
            yahooZoomLevel);

    //  NB: Do this to be consistent with the other maps.
    this.signal('TP_xctrls_MapPanned', aLatLong);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('setIsDraggable',
function(shouldBeDraggable) {

    /**
     * @method setIsDraggable
     * @param {undefined} shouldBeDraggable
     * @returns {TP.xctrls.yahoomap} The receiver.
     * @abstract
     */

    if (TP.isTrue(shouldBeDraggable)) {
        this.get('map').enableDragMap();
    } else {
        this.get('map').disableDragMap();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('setMapType',
function(aMapType) {

    /**
     * @method setMapType
     * @param {undefined} aMapType
     * @returns {TP.xctrls.yahoomap} The receiver.
     * @abstract
     */

    var mapTypeConstants,

        ourMap,
        tpIFrame;

    mapTypeConstants = this.getType();

    ourMap = this.get('map');
    tpIFrame = this.get('tpIFrame');

    switch (aMapType) {
        case    mapTypeConstants.at('ROAD'):

            ourMap.setMapType(tpIFrame.get('YAHOO_MAP_REG'));

        break;

        case    mapTypeConstants.at('SATELLITE'):

            ourMap.setMapType(tpIFrame.get('YAHOO_MAP_SAT'));

        break;

        case    mapTypeConstants.at('HYBRID'):

            ourMap.setMapType(tpIFrame.get('YAHOO_MAP_HYB'));

        break;

        default:

            ourMap.setMapType(tpIFrame.get('YAHOO_MAP_REG'));

        break;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('setZoom',
function(zoomLevel) {

    /**
     * @method setZoom
     * @param {undefined} zoomLevel
     * @returns {TP.xctrls.yahoomap} The receiver.
     * @abstract
     */

    this.get('map').setZoomLevel(18 - zoomLevel);

    this.signal('TP_xctrls_MapZoomed');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('showAllMarkers',
function() {

    /**
     * @method showAllMarkers
     * @summary Shows all of the markers from the marker list on the map.
     * @returns {TP.xctrls.yahoomap} The receiver.
     */

    var tpIFrame;

    tpIFrame = this.get('tpIFrame');

    this.get('markers').perform(
            function(aMarker) {

                var yahooMarker;

                yahooMarker = this.$convertMarkerToYahooMarker(aMarker);
                aMarker.set('nativeMarker', yahooMarker);

                //  Make sure and do this *before* we add the overlay to
                //  the native map object.
                tpIFrame.get('YEvent').Capture(
                            yahooMarker,
                            tpIFrame.get('EventsList').MouseClick,
                            function() {

                                this.signal('TP_xctrls_MapMarkerClicked',
                                                aMarker);
                            }.bind(this));

                this.get('map').addOverlay(yahooMarker);
            }.bind(this));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('sizeTo',
function(width, height) {

    /**
     * @method sizeTo
     * @param {undefined} width
     * @param {undefined} height
     * @returns {TP.xctrls.yahoomap} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('startIFrameLoad',
function() {

    /**
     * @method startIFrameLoad
     * @summary Begins the iframe loading of the receiver. This method loads
     *     the content from the 'frameFileURI' into the iframe constructed by
     *     this type and sets up a callback handler that will call this type's
     *     'configure' method when the content from the iframe is all loaded and
     *     initialized.
     * @returns {TP.xctrls.yahoomap} The receiver.
     */

    var tpIFrame;

    tpIFrame = this.get('tpIFrame');

    //  The following process of setting up a map for Yahoo is quite
    //  convoluted, due to poor design of the loading API which almost ;-)
    //  precludes 'dynamic' loading of a Yahoo Map. We worked around it
    //  though...

    //  Set the 'computeMapSrc' Function slot on our native iframe element
    //  that we constructed. This will be called by the code in the stub
    //  file, which will use the value returned by this Function (which is
    //  the API key mixed in with the URL) to set up its contents.
    //  What a mess...
    tpIFrame.getNativeNode().computeMapSrc =
                                this.$computeYahooMapScriptSrc;

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.yahoomap.Inst.defineMethod('swapMarker',
function(aMarker) {

    /**
     * @method swapMarker
     * @param {undefined} aMarker
     * @returns {TP.xctrls.yahoomap} The receiver.
     * @abstract
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
