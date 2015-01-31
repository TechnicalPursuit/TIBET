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
 * @type {TP.xctrls.map}
 * @summary A common supertype for various DHTML map controls, such as those
 *     provided by Google and Yahoo! and Microsoft.
 * @description This API largely based on mapstraction -
 *     http://www.mapstraction.com. Copyright (C) 2006, Tom Carden and Steve
 *     Coast
 */

//  ------------------------------------------------------------------------

TP.xctrls.FramedElement.defineSubtype('map');

TP.sys.require('TP.core.LatLong');
TP.sys.require('TP.core.MapBounds');
TP.sys.require('TP.core.MapMarker');

//  ------------------------------------------------------------------------
//  Type Constant
//  ------------------------------------------------------------------------

TP.xctrls.map.Type.defineConstant('ROAD', 1);
TP.xctrls.map.Type.defineConstant('SATELLITE', 2);
TP.xctrls.map.Type.defineConstant('HYBRID', 3);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  Middle of USA
//TP.xctrls.map.Type.defineAttribute('defaultLatLong',
//                      TP.llc(39.10662, -94.5728209));

//  Lhasa, Tibet    :-)
TP.xctrls.map.Type.defineAttribute('defaultLatLong', TP.llc(29.65, 91.13));

//  A URI to the 'frame file' - the file that will be loaded into the
//  iframe that this type builds to hold the custom control.
TP.xctrls.map.Type.defineAttribute('frameFileURI',
            TP.uc('~lib_src/xctrls/xctrls_map/xctrls_map_stub.html'));

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.xctrls.map.Type.defineMethod('getCompilationAttrs',
function(aRequest) {

    /**
     * @method getCompilationAttrs
     * @summary Returns a TP.lang.Hash of any attributes to be added to what is
     *     produced by this type when it is compiled.
     * @description This type produces custom values for the 'tibet:ctrl'
     *     attribute (matching the type of the map based on the 'type'
     *     attribute), thereby allowing instances of subtypes of this type to be
     *     created.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {TP.lang.Hash} A TP.lang.Hash of attributes to be added to the
     *     compiled output from this type.
     */

    var elem,
        mapType;

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return TP.hc();
    }

    mapType = TP.ifEmpty(TP.elementGetAttribute(elem, 'type'), 'google');

    return TP.hc('tibet:ctrl', 'xctrls:' + mapType + 'map');
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Type.defineMethod('getResourceTypeName',
function() {

    /**
     * @method getResourceTypeName
     * @summary Returns the resource type name for this type. The resource type
     *     name is used when computing resource paths for this type. We override
     *     this here to provide our own type name for subtypes since the
     *     resources should be found under our name.
     * @returns {String} The resource type name for the receiver.
     */

    return 'TP.xctrls.map';
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineAttribute('$map');
TP.xctrls.map.Inst.defineAttribute('$markers');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('init',
function(aNode, aURI) {

    /**
     * @method init
     * @summary Returns a newly initialized instance.
     * @param {Node} aNode A native node.
     * @param {TP.core.URI|String} aURI An optional URI from which the Node
     *     received its content.
     * @returns {TP.xctrls.map} A new instance.
     */

    this.callNextMethod();

    this.set('$markers', TP.ac());

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('addControls',
function(hasPan, zoomType, hasOverview, hasScale, hasMapType) {

    /**
     * @method addControls
     * @param {undefined} hasPan
     * @param {undefined} zoomType
     * @param {undefined} hasOverview
     * @param {undefined} hasScale
     * @param {undefined} hasMapType
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('addLargeControls',
function() {

    /**
     * @method addLargeControls
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('addMapTypeControls',
function() {

    /**
     * @method addMapTypeControls
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('addMarker',
function(aMarker) {

    /**
     * @method addMarker
     * @param {undefined} aMarker
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('addSmallControls',
function() {

    /**
     * @method addSmallControls
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('autoCenterAndZoom',
function() {

    /**
     * @method autoCenterAndZoom
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    var latMax,
        latMin,

        longMax,
        longMin;

    latMax = -90;
    latMin = 90;
    longMax = -180;
    longMin = 180;

    this.get('$markers').perform(
            function(aMarker) {

                var markerLat,
                    markerLong;

                markerLat = aMarker.get('location').get('lat');
                markerLong = aMarker.get('location').get('long');

                latMax = latMax.max(markerLat);
                latMin = latMin.min(markerLat);

                longMax = longMax.max(markerLong);
                longMin = longMin.min(markerLong);
            });

    this.setBounds(
            TP.core.MapBounds.construct(latMin, longMin, latMax, longMax));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('getBounds',
function() {

    /**
     * @method getBounds
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('getCenter',
function() {

    /**
     * @method getCenter
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('getLatLongForAddress',
function(anAddress) {

    /**
     * @method getLatLongForAddress
     * @param {String} anAddress The address to plot.
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('getMapType',
function() {

    /**
     * @method getMapType
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('getZoom',
function() {

    /**
     * @method getZoom
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('getZoomLevelForMapBounds',
function(aMapBounds) {

    /**
     * @method getZoomLevelForMapBounds
     * @param {TP.core.MapBounds} aMapBounds
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('hideAllMarkers',
function() {

    /**
     * @method hideAllMarkers
     * @summary Hides all of the markers without removing them from the marker
     *     list.
     * @returns {TP.xctrls.map} The receiver.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('refresh',
function(aSignal) {

    /**
     * @method refresh
     * @summary Updates the receiver to reflect the current value of any data
     *     binding it may have. If the signal argument's payload specified a
     *     'deep' refresh then descendant elements are also updated.
     * @param {DOMRefresh} aSignal An optional signal which triggered this
     *     action. This signal should include a key of 'deep' and a value of
     *     true to cause a deep refresh that updates all nodes.
     * @returns {TP.xctrls.map} The receiver.
     */

    if (TP.isEmpty(this.get('$markers'))) {
        this.setCenterAndZoom(this.getType().get('defaultLatLong'), 4);

        return this;
    }

    this.hideAllMarkers();

    //  Auto center and zoom the map, which tries to compute a bounding box
    //  that takes all markers into account.
    this.autoCenterAndZoom();

    this.showAllMarkers();

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('removeAllMarkers',
function() {

    /**
     * @method removeAllMarkers
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    this.hideAllMarkers();

    this.get('$markers').empty();

    this.signal('TP_xctrls_MapMarkersRemoved');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('removeAllControls',
function() {

    /**
     * @method removeAllControls
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('removeMarker',
function(aMarker) {

    /**
     * @method removeMarker
     * @param {undefined} aMarker
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('setBounds',
function(aMapBounds) {

    /**
     * @method setBounds
     * @param {undefined} aMapBounds
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('setCenter',
function(aLatLong) {

    /**
     * @method setCenter
     * @param {undefined} aLatLong
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('setLat',
function(aLat) {

    /**
     * @method setLat
     * @param {undefined} aLat
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    var currentCenter,
        theLatLong;

    currentCenter = this.getCenter();

    theLatLong = TP.llc(aLat, currentCenter.get('long'));

    //  NB: We don't signal 'TP.xctrls.MapPanned' manually from here since
    //  the map infrastructure kicks our event handler that will do that
    //  when we center the map.

    this.get('$map').setCenter(
            this.$convertLatLongToGoogleLatLong(theLatLong));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('setLong',
function(aLong) {

    /**
     * @method setLong
     * @param {undefined} aLong
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    var currentCenter,
        theLatLong;

    currentCenter = this.getCenter();

    theLatLong = TP.llc(currentCenter.get('lat'), aLong);

    //  NB: We don't signal 'TP.xctrls.MapPanned' manually from here since
    //  the map infrastructure kicks our event handler that will do that
    //  when we center the map.

    this.get('$map').setCenter(
            this.$convertLatLongToGoogleLatLong(theLatLong));

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('setCenterAndZoom',
function(aLatLong, zoomLevel) {

    /**
     * @method setCenterAndZoom
     * @param {undefined} aLatLong
     * @param {undefined} zoomLevel
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('setIsDraggable',
function(shouldBeDraggable) {

    /**
     * @method setIsDraggable
     * @param {undefined} shouldBeDraggable
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('setMapType',
function(aMapType) {

    /**
     * @method setMapType
     * @param {undefined} aMapType
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('setZoom',
function(zoomLevel) {

    /**
     * @method setZoom
     * @param {undefined} zoomLevel
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('showAllMarkers',
function() {

    /**
     * @method showAllMarkers
     * @summary Shows all of the markers from the marker list on the map.
     * @returns {TP.xctrls.map} The receiver.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('sizeTo',
function(width, height) {

    /**
     * @method sizeTo
     * @param {undefined} width
     * @param {undefined} height
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.map.Inst.defineMethod('swapMarker',
function(aMarker) {

    /**
     * @method swapMarker
     * @param {undefined} aMarker
     * @returns {TP.xctrls.map} The receiver.
     * @abstract
     */

    return TP.override();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
