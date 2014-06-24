//  ========================================================================
/*
NAME:   TPMapUtils.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.2, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.1
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
//  ------------------------------------------------------------------------

/**
 * @type {TP.core.LatLong}
 * @synopsis A type used to capture and compute latitude / longitude
 *     coordinates.
 */

//  ------------------------------------------------------------------------

TP.core.Point.defineSubtype('LatLong');

//  Note that we use apply here - otherwise, when TP.core.LatLong's
//  'init' method is called, it will incorrectly report 4 arguments even if
//  there is just 1.
TP.definePrimitive('llc',
function(aLat, aLong) {

    return TP.core.LatLong.construct.apply(TP.core.LatLong, arguments);
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.LatLong.Inst.defineAttribute('description');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.LatLong.Inst.defineMethod('init',
function(lat, lng) {

    /**
     * @name init
     * @synopsis Returns a newly initialized TP.core.LatLong object.
     * @param {Number} lat 
     * @param {Number} lng 
     * @returns {TP.core.LatLong} A new instance.
     * @todo
     */

    //  Note here how it's the 'long' first (since its the 'x') and the
    //  'lat' ('y') second
    this.callNextMethod();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.LatLong.Inst.defineMethod('getLat',
function() {

    /**
     * @name getLat
     * @synopsis Returns the latitude as a Number.
     * @returns {Number} The latitude as a Number.
     */

    return this.get('y');
});

//  ------------------------------------------------------------------------

TP.core.LatLong.Inst.defineMethod('getLong',
function() {

    /**
     * @name getLong
     * @synopsis Returns the longitude as a Number.
     * @returns {Number} The longitude as a Number.
     */

    return this.get('x');
});

//  ------------------------------------------------------------------------

TP.core.LatLong.Inst.defineMethod('distance',
function(aLatLong) {

    /**
     * @name distance
     * @returns {Number} 
     * @abstract
     * @todo
     */

    var d,
        dr;

    //  Radians per degree
    dr = Math.PI * 2 / 360.0;

    d = (aLatLong.get('long') * dr - (this.get('long') * dr)).cos() *
            (aLatLong.get('lat') * dr - (this.get('lat') * dr)).cos();

    return d.acos() * 6378.137;
});

//  ------------------------------------------------------------------------

/**
 * @type {TP.core.MapBounds}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core:MapBounds');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.MapBounds.Inst.defineAttribute('southWestLatLong');
TP.core.MapBounds.Inst.defineAttribute('northEastLatLong');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.MapBounds.Inst.defineMethod('init',
function(swlat, swlong, nelat, nelong) {

    /**
     * @name init
     * @synopsis Returns a newly initialized TP.core.MapBounds object.
     * @param {Number} swlat 
     * @param {Number} swlong 
     * @param {Number} nelat 
     * @param {Number} nelong 
     * @returns {TP.core.MapBounds} A new instance.
     * @todo
     */

    this.callNextMethod();

    this.set('southWestLatLong', TP.llc(swlat, swlong));
    this.set('northEastLatLong', TP.llc(nelat, nelong));

    return this;
});

//  ------------------------------------------------------------------------

/**
 * @type {TP.core.MapMarker}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core:MapMarker');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.MapMarker.Inst.defineAttribute('$nativeMarker');

TP.core.MapMarker.Inst.defineAttribute('location');
TP.core.MapMarker.Inst.defineAttribute('labelText');
TP.core.MapMarker.Inst.defineAttribute('iconURL');
TP.core.MapMarker.Inst.defineAttribute('infoBubble');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.MapMarker.Inst.defineMethod('init',
function(aLatLong) {

    /**
     * @name init
     * @synopsis Returns a newly initialized TP.core.LatLong object.
     * @param {TP.core.LatLong} aLatLong 
     * @returns {TPMarker} A new instance.
     */

    this.callNextMethod();

    this.set('location', aLatLong);

    return this;
});

//  ========================================================================
//  MAP SIGNALS
//  ========================================================================

TP.sig.DOMSignal.defineSubtype('xctrls:MapSignal');

//  ------------------------------------------------------------------------

TP.xctrls.MapSignal.defineSubtype('MapClicked');
TP.xctrls.MapSignal.defineSubtype('MapPanned');
TP.xctrls.MapSignal.defineSubtype('MapZoomed');

TP.xctrls.MapSignal.defineSubtype('MapGeocodeComplete');

TP.xctrls.MapSignal.defineSubtype('MapMarkerAdded');
TP.xctrls.MapSignal.defineSubtype('MapMarkerClicked');
TP.xctrls.MapSignal.defineSubtype('MapMarkerRemoved');
TP.xctrls.MapSignal.defineSubtype('MapMarkersRemoved');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
