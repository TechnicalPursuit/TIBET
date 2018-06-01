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
//  TP.gui.Point
//  ========================================================================

/**
 * @type {TP.gui.Point}
 * @summary A type that can manage point (x, y) values.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('gui.Point');

//  ------------------------------------------------------------------------

//  Note that we use apply here - otherwise, when TP.gui.Point's 'init'
//  method is called, it will incorrectly report 4 arguments even if there
//  is just 1.
TP.definePrimitive('pc',
function(x, y) {

    return TP.gui.Point.construct.apply(TP.gui.Point, arguments);
});

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.gui.Point.Type.defineMethod('constructFromPolar',
function(radius, angle) {

    var x,
        y;

    x = radius * angle.cosD();
    y = radius * angle.sinD();

    return TP.gui.Point.construct(x, y);
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineAttribute('data');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('init',
function(x, y) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {Number|TP.gui.Point|Object|TP.core.Hash|Number[]} x The x value
     *     of the receiver or a TP.gui.Point to copy or an object that has 'x'
     *     and 'y' (or 'top' and 'left') slots or an Array that has x in the
     *     first position and y in the last position.
     * @param {Number} y The y value of the receiver.
     * @returns {TP.gui.Point} The receiver.
     */

    var theData,
        newData;

    this.callNextMethod();

    if (TP.notEmpty(arguments)) {
        if (arguments.length === 1) {
            //  Got handed one argument. It could be:
            //      a) another TP.gui.Point
            //      b) an Array with 2 values
            //      c) an Object that has 'x' and 'y' slots

            theData = arguments[0];
            if (TP.isKindOf(theData, TP.gui.Point)) {
                theData = theData.$get('data');
                newData = {
                    x: theData.x,
                    y: theData.y
                };
            } else if (TP.isHash(theData)) {
                newData = {
                    x: theData.at('x') || theData.at('left'),
                    y: theData.at('y') || theData.at('top')
                };
            } else if (TP.isArray(theData)) {
                newData = {
                    x: theData.first(),
                    y: theData.last()
                };
            } else {
                newData = {
                    x: theData.x,
                    y: theData.y
                };
            }
        } else {
            //  Got handed two Numbers.
            newData = {
                x: x,
                y: y
            };
        }
    } else {
        //  Got nothing - set everything to 0.
        newData = {
            x: 0,
            y: 0
        };
    }

    this.$set('data', newData, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('add',
function(aPoint) {

    /**
     * @method add
     * @summary Adds the dimensions of the supplied point to the receiver.
     * @param {TP.gui.Point} aPoint The point to add to the receiver.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Point} The receiver.
     */

    var data;

    if (TP.notValid(aPoint)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    data = this.$get('data');

    data.x += aPoint.get('x');
    data.y += aPoint.get('y');

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('addToX',
function(xDiff) {

    /**
     * @method addToX
     * @summary Adds the value supplied to the x value of the receiver.
     * @param {Number} xDiff The amount to add to the x value of the receiver.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Point} The receiver.
     */

    if (!TP.isNumber(xDiff)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    this.$get('data').x += xDiff;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('addToY',
function(yDiff) {

    /**
     * @method addToY
     * @summary Adds the value supplied to the y value of the receiver.
     * @param {Number} yDiff The amount to add to the y value of the receiver.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Point} The receiver.
     */

    if (!TP.isNumber(yDiff)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    this.$get('data').y += yDiff;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('asDumpString',
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var data,
        repStr,

        str;

    str = '[' + TP.tname(this) + ' :: ';

    data = this.$get('data');
    repStr = TP.join('(', data.x, ', ', data.y, ')');

    str += repStr + ']';

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    var data,
        str;

    data = this.$get('data');

    try {
        str = '<span class="TP_gui_Point">' +
                    '<span data-name="x">' + data.x + '</span>' +
                    '<span data-name="y">' + data.y + '</span>' +
                '</span>';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var data;

    data = this.$get('data');

    return '{"type":' + TP.tname(this).quoted('"') + ',' +
             '"data":{' +
                 '"x":"' + data.x + '",' +
                 '"y":"' + data.y + '"' +
                 '}}';
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} The receiver's 'pretty print' String representation.
     */

    var data,
        str;

    data = this.$get('data');

    try {
        str = '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) + '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' +
                        this.getTypeName() +
                    '</dd>' +
                    '<dt class="pretty key">x</dt>' +
                    '<dd class="pretty value">' +
                        data.x +
                    '</dd>' +
                    '<dt class="pretty key">y</dt>' +
                    '<dd class="pretty value">' +
                        data.y +
                    '</dd>' +
                    '</dl>';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    var data;

    data = this.$get('data');

    return TP.join('TP.pc(', data.x, ', ', data.y, ')');
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @method asString
     * @summary Returns the String representation of the receiver.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.gui.Point's String representation. This flag is ignored in
     *     this version of this method.
     * @returns {String} The String representation of the receiver.
     */

    var data,
        repStr;

    data = this.$get('data');
    repStr = TP.join('(', data.x, ', ', data.y, ')');

    return repStr;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    var data,
        str;

    data = this.$get('data');

    try {
        str = '<instance type="' + TP.tname(this) + '"' +
                ' x="' + data.x + '" y="' + data.y + '"' +
                '/>';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('clampToPoint',
function(aPoint) {

    /**
     * @method clampToPoint
     * @summary Clamps the receiver's X and Y values to values less than or
     *     equal to the supplied point.
     * @param {TP.gui.Point} aPoint The point to clamp to.
     * @returns {TP.gui.Point} The receiver.
     */

    var otherData,
        data;

    data = this.$get('data');
    otherData = aPoint.$get('data');

    data.x = data.x.min(otherData.x);
    data.y = data.y.min(otherData.y);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('clampToRect',
function(aRect) {

    /**
     * @method clampToRect
     * @summary Clamps the receiver's X and Y values to values within the
     *     supplied rectangle.
     * @param {TP.gui.Rect} aRect The rect to clamp to.
     * @returns {TP.gui.Point} The receiver.
     */

    var rectData,
        data;

    data = this.$get('data');
    rectData = aRect.$get('data');

    data.x = data.x.max(rectData.x).min(rectData.x + rectData.width);
    data.y = data.y.max(rectData.y).min(rectData.y + rectData.height);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('clampXToMinMax',
function(aMin, aMax) {

    /**
     * @method clampXToMinMax
     * @summary Clamps the receiver's X value to the minimum and maximum values
     *     provided.
     * @param {Number} aMin The minimum amount to clamp the X value of the
     *     receiver to.
     * @param {Number} aMax The maximum amount to clamp the X value of the
     *     receiver to.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Point} The receiver.
     */

    var data;

    if (!TP.isNumber(aMin) || !TP.isNumber(aMax)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    data = this.$get('data');

    data.x = data.x.max(aMin).min(aMax);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('clampYToMinMax',
function(aMin, aMax) {

    /**
     * @method clampYToMinMax
     * @summary Clamps the receiver's Y value to the minimum and maximum values
     *     provided.
     * @param {Number} aMin The minimum amount to clamp the Y value of the
     *     receiver to.
     * @param {Number} aMax The maximum amount to clamp the Y value of the
     *     receiver to.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Point} The receiver.
     */

    var data;

    if (!TP.isNumber(aMin) || !TP.isNumber(aMax)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    data = this.$get('data');

    data.y = data.y.max(aMin).min(aMax);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('computeMidpoint',
function(aPoint) {

    /**
     * @method computeMidpoint
     * @summary Computes the midpoint between the receiver and the supplied
     *     point
     * @param {TP.gui.Point} aPoint The other point to use to compute the
     *     midpoint.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Point} A new TP.gui.Point which is the midpoint
     *     between the receiver and the supplied point.
     */

    var data;

    if (TP.notValid(aPoint)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    data = this.$get('data');

    return TP.gui.Point.construct((data.x + aPoint.get('x')) / 2,
                                    (data.y + aPoint.get('y')) / 2);
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('copy',
function() {

    /**
     * @method copy
     * @summary Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver.
     * @returns {TP.gui.Point} A new TP.gui.Point which is a copy of the
     *     receiver.
     */

    return TP.gui.Point.construct(this);
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('distanceBetween',
function(aPoint) {

    /**
     * @method distanceBetween
     * @summary Returns the distance between the receiver and the supplied
     *     point.
     * @param {TP.gui.Point} aPoint The other point to compute the distance
     *     from.
     * @exception TP.sig.InvalidParameter
     * @returns {Number} The distance between the receiver and the supplied
     *     point.
     */

    var data,
        otherData,

        distance;

    if (TP.notValid(aPoint)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    data = this.$get('data');
    otherData = aPoint.$get('data');

    distance = ((otherData.x - data.x).pow(2) +
                (otherData.y - data.y).pow(2)).sqrt();

    return distance;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('getX',
function() {

    /**
     * @method getX
     * @summary Returns the X coordinate of the receiver as a Number.
     * @returns {Number} The X coordinate of the receiver.
     */

    return this.$get('data').x;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('getY',
function() {

    /**
     * @method getY
     * @summary Returns the Y coordinate of the receiver as a Number.
     * @returns {Number} The Y coordinate of the receiver.
     */

    return this.$get('data').y;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('interpolate',
function(aPoint, t) {

    /**
     * @method interpolate
     * @summary Computes an interpolated point between the receiver and the
     *     supplied point.
     * @description The interpolation factor determines how much a 'weight'
     *     towards the supplied point will be used. It should be a Number
     *     between 0 and 1. To weight the computed point towards the receiver,
     *     use a value approaching 0. To weight it towards the supplied point,
     *     use a value approaching 1.
     * @param {TP.gui.Point} aRect The point to compute an interpolation with
     *     the receiver.
     * @param {Number} t Interpolation factor. Should be a Number between 0 and
     *     1.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Point} A new point with the coordinates of the receiver
     *     interpolated with the supplied point using the supplied interpolation
     *     factor.
     */

    var data,
        otherData,

        interpFunc;

    if (!TP.isNumber(t)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    data = this.$get('data');
    otherData = aPoint.$get('data');

    interpFunc =
        function(a, b, factor) {

            return a + (b - a) * factor;
        };

    return TP.gui.Point.construct(
                    interpFunc(data.x, otherData.x, t),
                    interpFunc(data.y, otherData.y, t));
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('invert',
function() {

    /**
     * @method invert
     * @summary Inverts the values in the receiver by multiplying them by -1.
     * @returns {TP.gui.Point} The receiver.
     */

    var data;

    data = this.$get('data');

    data.x *= -1;
    data.y *= -1;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('setX',
function(xVal) {

    /**
     * @method setX
     * @summary Sets the X coordinate of the receiver to the supplied value.
     * @param {Number} xVal The amount to set the 'x' coordinate of the receiver
     *     to.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Point} The receiver.
     */

    if (!TP.isNumber(xVal)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    this.$get('data').x = xVal;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('setY',
function(yVal) {

    /**
     * @method setY
     * @summary Sets the Y coordinate of the receiver to the supplied value.
     * @param {Number} yVal The amount to set the 'y' coordinate of the receiver
     *     to.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Point} The receiver.
     */

    if (!TP.isNumber(yVal)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    this.$get('data').y = yVal;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('setXY',
function(xVal, yVal) {

    /**
     * @method setXY
     * @summary Sets the X and Y coordinates of the receiver to the supplied
     *     values.
     * @param {Number} xVal The amount to set the 'x' coordinate of the receiver
     *     to.
     * @param {Number} yVal The amount to set the 'y' coordinate of the receiver
     *     to.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Point} The receiver.
     */

    var data;

    if (!TP.isNumber(xVal) || !TP.isNumber(yVal)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    data = this.$get('data');

    data.x = xVal;
    data.y = yVal;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('snapToIncrement',
function(xIncrement, yIncrement) {

    /**
     * @method snapToIncrement
     * @summary
     * @param {Number} xIncrement The amount to snap the x value of the receiver
     *     to.
     * @param {Number} yDiff The amount to snap the y value of the receiver to.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Point} The receiver.
     */

    var data;

    if (!TP.isNumber(xIncrement) || !TP.isNumber(yIncrement)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    data = this.$get('data');

    data.x = ((data.x + xIncrement) / xIncrement).floor() * xIncrement;
    data.y = ((data.y + yIncrement) / yIncrement).floor() * yIncrement;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('sortByDistance',
function(points) {

    /**
     * @method sortByDistance
     * @summary Sorts the supplied Array by comparing the distance of each
     *     point in the Array to the receiver. This returns the same Array with
     *     the points sorted in ascending order (i.e closest one first).
     * @param {TP.gui.Point[]} points The Array of TP.gui.Points to sort.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Point[]} The supplied Array with the points sorted by
     *     computing the distance between the receiver and each point.
     */

    var thisX,
        thisY;

    if (TP.notValid(points)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    thisX = this.get('x');
    thisY = this.get('y');

    points.sort(
        function(point1, point2) {

            var dist1,
                dist2;

            dist1 = ((point1.get('x') - thisX).pow(2) +
                    (point1.get('y') - thisY).pow(2)).sqrt();
            dist1 = ((point2.get('x') - thisX).pow(2) +
                    (point2.get('y') - thisY).pow(2)).sqrt();

            return dist1 - dist2;
        });

    return points;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('subtract',
function(aPoint) {

    /**
     * @method subtract
     * @summary Subtracts the dimensions of the supplied point from the
     *     receiver.
     * @param {TP.gui.Point} aPoint The point to subtract from the receiver.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Point} The receiver.
     */

    var data;

    if (TP.notValid(aPoint)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    data = this.$get('data');

    data.x -= aPoint.get('x');
    data.y -= aPoint.get('y');

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('subtractFromX',
function(xDiff) {

    /**
     * @method subtractFromX
     * @summary Subtracts the value supplied from the x value of the receiver.
     * @param {Number} xDiff The amount to subtract from the x value of the
     *     receiver.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Point} The receiver.
     */

    if (!TP.isNumber(xDiff)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    this.$get('data').x -= xDiff;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('subtractFromY',
function(yDiff) {

    /**
     * @method subtractFromY
     * @summary Subtracts the value supplied from the y value of the receiver.
     * @param {Number} yDiff The amount to subtract from the y value of the
     *     receiver.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Point} The receiver.
     */

    if (!TP.isNumber(yDiff)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    this.$get('data').y -= yDiff;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('translate',
function(xDiff, yDiff) {

    /**
     * @method translate
     * @summary Translates the position of the receiver by the values supplied.
     * @param {Number} xDiff The amount to add to the x value of the receiver.
     * @param {Number} yDiff The amount to add to the y value of the receiver.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Point} The receiver.
     */

    var data;

    if (!TP.isNumber(xDiff) || !TP.isNumber(yDiff)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    data = this.$get('data');

    data.x += xDiff;
    data.y += yDiff;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Point.Inst.defineMethod('translateByPoint',
function(aPoint) {

    /**
     * @method translateByPoint
     * @summary Translates the position of the receiver by the values of the
     *     supplied point.
     * @param {TP.gui.Point} aPoint The point to use to translate the receiver.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Point} The receiver.
     */

    var data;

    if (TP.notValid(aPoint)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    data = this.$get('data');

    data.x += aPoint.get('x');
    data.y += aPoint.get('y');

    return this;
});

//  ========================================================================
//  TP.gui.Rect
//  ========================================================================

/**
 * @type {TP.gui.Rect}
 * @summary A type that can manage rectangle (x, y, width, height) values.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('gui.Rect');

//  ------------------------------------------------------------------------

//  Note that we use apply here - otherwise, when TP.gui.Rect's 'init'
//  method is called, it will incorrectly report 4 arguments even if there
//  is just 1.
TP.definePrimitive('rtc',
function(x, y, width, height) {

    return TP.gui.Rect.construct.apply(TP.gui.Rect, arguments);
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineAttribute('data');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('init',
function(x, y, width, height) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {Number|TP.gui.Rect|Object|TP.core.Hash|Number[]} x The x value of
     *     the receiver or a TP.gui.Rect to copy or an object that has 'x', 'y'
     *     (or 'top', 'left'), 'width' and 'height' slots or an Array that has x
     *     in the first position, y in the second position, width in the third
     *     position and height in the fourth position.
     * @param {Number} y The y value of the receiver.
     * @param {Number} width The width value of the receiver.
     * @param {Number} height The height value of the receiver.
     * @returns {TP.gui.Rect} The receiver.
     */

    var theData,
        newData;

    this.callNextMethod();

    if (TP.notEmpty(arguments)) {
        if (arguments.length === 1) {
            //  Got handed one argument. It could be:
            //      a) another TP.gui.Rect
            //      b) an Array with 4 values
            //      c) an Object that has 'x', 'y', 'width', and 'height'
            //      slots.

            theData = arguments[0];
            if (TP.isKindOf(theData, TP.gui.Rect)) {
                theData = theData.$get('data');
                newData = {
                    x: theData.x,
                    y: theData.y,
                    width: theData.width,
                    height: theData.height
                };
            } else if (TP.isHash(theData)) {
                newData = {
                    x: theData.at('x') || theData.at('left'),
                    y: theData.at('y') || theData.at('top'),
                    width: theData.at('width'),
                    height: theData.at('height')
                };
            } else if (TP.isArray(theData)) {
                newData = {
                    x: theData.at(0),
                    y: theData.at(1),
                    width: theData.at(2),
                    height: theData.at(3)
                };
            } else {
                newData = {
                    x: theData.x,
                    y: theData.y,
                    width: theData.width,
                    height: theData.height
                };
            }
        } else if (arguments.length === 2) {
            //  Got handed two TP.gui.Rects.
            newData = {
                x: arguments[0].$get('data').x,
                y: arguments[0].$get('data').y,
                width: arguments[1].$get('data').x,
                height: arguments[1].$get('data').y
            };
        } else {
            //  Got handed four Numbers.
            newData = {
                x: x,
                y: y,
                width: width,
                height: height
            };
        }
    } else {
        //  Got nothing - set everything to 0.
        newData = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
    }

    this.$set('data', newData, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('addByPoint',
function(aPoint) {

    /**
     * @method addByPoint
     * @summary Adds the dimensions of the supplied point to the receiver.
     * @param {TP.gui.Point} aPoint The point to add to the receiver.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Rect} The receiver.
     */

    var data;

    if (TP.notValid(aPoint)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    data = this.$get('data');

    data.x += aPoint.get('x');
    data.y += aPoint.get('y');

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('addToX',
function(xDiff) {

    /**
     * @method addToX
     * @summary Adds the value supplied to the x value of the receiver.
     * @param {Number} xDiff The amount to add to the x value of the receiver.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Rect} The receiver.
     */

    if (!TP.isNumber(xDiff)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    this.$get('data').x += xDiff;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('addToY',
function(yDiff) {

    /**
     * @method addToY
     * @summary Adds the value supplied to the y value of the receiver.
     * @param {Number} yDiff The amount to add to the y value of the receiver.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Rect} The receiver.
     */

    if (!TP.isNumber(yDiff)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    this.$get('data').y += yDiff;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('asDumpString',
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var data,
        repStr,

        str;

    str = '[' + TP.tname(this) + ' :: ';

    data = this.$get('data');
    repStr = TP.join('(', data.x, ', ', data.y, ', ',
                        data.width, ', ', data.height, ')');

    str += repStr + ']';

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    var data,
        str;

    data = this.$get('data');

    try {
        str = '<span class="TP_gui_Rect">' +
                    '<span data-name="x">' + data.x + '</span>' +
                    '<span data-name="y">' + data.y + '</span>' +
                    '<span data-name="width">' + data.width + '</span>' +
                    '<span data-name="height">' + data.height + '</span>' +
                '</span>';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var data;

    data = this.$get('data');

    return '{"type":' + TP.tname(this).quoted('"') + ',' +
             '"data":{' +
                 '"x":"' + data.x + '",' +
                 '"y":"' + data.y + '",' +
                 '"width":"' + data.width + '",' +
                 '"height":"' + data.height + '"' +
                 '}}';
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} The receiver's 'pretty print' String representation.
     */

    var data,
        str;

    data = this.$get('data');

    try {
        str = '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) + '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' +
                        this.getTypeName() +
                    '</dd>' +
                    '<dt class="pretty key">x</dt>' +
                    '<dd class="pretty value">' +
                        data.x +
                    '</dd>' +
                    '<dt class="pretty key">y</dt>' +
                    '<dd class="pretty value">' +
                        data.y +
                    '</dd>' +
                    '<dt class="pretty key">width</dt>' +
                    '<dd class="pretty value">' +
                        data.width +
                    '</dd>' +
                    '<dt class="pretty key">height</dt>' +
                    '<dd class="pretty value">' +
                        data.height +
                    '</dd>' +
                    '</dl>';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    var data;

    data = this.$get('data');

    return TP.join('TP.rtc(', data.x, ', ', data.y, ', ',
                            data.width, ', ', data.height, ')');
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @method asString
     * @summary Returns the String representation of the receiver.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.gui.Rect's String representation. This flag is ignored in
     *     this version of this method.
     * @returns {String} The String representation of the receiver.
     */

    var data,
        repStr;

    data = this.$get('data');

    repStr = TP.join('(', data.x, ', ', data.y, ', ',
                        data.width, ', ', data.height, ')');

    return repStr;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    var data,
        str;

    data = this.$get('data');

    try {
        str = '<instance type="' + TP.tname(this) + '"' +
                ' x="' + data.x + '" y="' + data.y + '"' +
                ' width="' + data.width + '" height="' + data.height + '"' +
                 '/>';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('clampToRect',
function(aRect) {

    /**
     * @method clampToRect
     * @summary Clamps the receiver's X and Y values to values within the
     *     supplied rectangle, taking into account the receiver's width and
     *     height.
     * @param {TP.gui.Rect} aRect The rect to clamp to.
     * @returns {TP.gui.Rect} The receiver.
     */

    var rectData,
        data;

    data = this.$get('data');
    rectData = aRect.$get('data');

    data.x = data.x.max(rectData.x).min(rectData.width - data.width);
    data.y = data.y.max(rectData.y).min(rectData.height - data.height);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('constrainPoint',
function(aPoint) {

    /**
     * @method constrainPoint
     * @summary Constrains the supplied point to be within the bounds of the
     *     receiver.
     * @param {TP.gui.Point} aPoint The point to constrain.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Rect} The receiver.
     */

    var data,
        pointData;

    if (TP.notValid(aPoint)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    data = this.$get('data');
    pointData = aPoint.$get('data');

    pointData.x = pointData.x.max(data.x).min(data.x + data.width);
    pointData.y = pointData.y.max(data.y).min(data.y + data.height);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('constrainRect',
function(aRect) {

    /**
     * @method constrainRect
     * @summary Constrains the supplied rect to be within the bounds of the
     *     receiver.
     * @param {TP.gui.Rect} aRect The rect to constrain.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Rect} The receiver.
     */

    var data,

        rectData,

        diffX,
        diffY;

    if (TP.notValid(aRect)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    data = this.$get('data');
    rectData = aRect.$get('data');

    //  Make sure that our own rectangle isn't smaller in either width or height
    //  than the supplied rectangle. Otherwise, just return without modifying
    //  the supplied rectangle.
    if (this.getWidth() < aRect.getWidth() ||
        this.getHeight() < aRect.getHeight()) {
        return this;
    }

    /* eslint-disable no-extra-parens */
    diffX = ((rectData.x + rectData.width) - (data.x + data.width)).max(0);
    diffY = ((rectData.y + rectData.height) - (data.y + data.height)).max(0);
    /* eslint-enable no-extra-parens */

    rectData.x -= diffX;
    rectData.y -= diffY;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('containsPoint',
function(aPoint) {

    /**
     * @method containsPoint
     * @summary Returns whether or not the receiver contains the supplied
     *     point.
     * @param {TP.gui.Point} aPoint The point to test.
     * @exception TP.sig.InvalidParameter
     * @returns {Boolean} Whether or not the receiver contains the point.
     */

    var data,
        pointData;

    if (TP.notValid(aPoint)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    data = this.$get('data');
    pointData = aPoint.$get('data');

    /* eslint-disable no-extra-parens */
    if (pointData.x >= data.x &&
        pointData.y >= data.y &&
        pointData.x <= (data.x + data.width) &&
        pointData.y <= (data.y + data.height)) {
        return true;
    }
    /* eslint-enable no-extra-parens */

    return false;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('containsPointX',
function(aPoint) {

    /**
     * @method containsPointX
     * @summary Returns whether or not the receiver contains the supplied
     *     point's X value.
     * @param {TP.gui.Point} aPoint The point to test.
     * @exception TP.sig.InvalidParameter
     * @returns {Boolean} Whether or not the receiver contains the point's X
     *     value.
     */

    var data,
        pointData;

    if (TP.notValid(aPoint)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    data = this.$get('data');
    pointData = aPoint.$get('data');

    /* eslint-disable no-extra-parens */
    if (pointData.x >= data.x &&
        pointData.x <= (data.x + data.width)) {
        return true;
    }
    /* eslint-enable no-extra-parens */

    return false;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('containsPointY',
function(aPoint) {

    /**
     * @method containsPointY
     * @summary Returns whether or not the receiver contains the supplied
     *     point's Y value.
     * @param {TP.gui.Point} aPoint The point to test.
     * @exception TP.sig.InvalidParameter
     * @returns {Boolean} Whether or not the receiver contains the point's Y
     *     value.
     */

    var data,
        pointData;

    if (TP.notValid(aPoint)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    data = this.$get('data');
    pointData = aPoint.$get('data');

    /* eslint-disable no-extra-parens */
    if (pointData.y >= data.y &&
        pointData.y <= (data.y + data.height)) {
        return true;
    }
    /* eslint-enable no-extra-parens */

    return false;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('containsRect',
function(aRect) {

    /**
     * @method containsRect
     * @summary Returns whether or not the receiver contains the supplied
     *     rectangle.
     * @param {TP.gui.Rect} aRect The rectangle to test.
     * @exception TP.sig.InvalidParameter
     * @returns {Boolean} Whether or not the receiver contains the rectangle.
     */

    var data,
        otherData;

    if (TP.notValid(aRect)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    data = this.$get('data');
    otherData = aRect.$get('data');

    /* eslint-disable no-extra-parens */
    if (otherData.x >= data.x &&
        (data.x + data.width >= otherData.x + otherData.width) &&
        otherData.y >= data.y &&
        (data.y + data.height >= otherData.y + otherData.height)) {
        return true;
    }
    /* eslint-enable no-extra-parens */

    return false;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('copy',
function() {

    /**
     * @method copy
     * @summary Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver.
     * @returns {TP.gui.Rect} A new TP.gui.Rect which is a copy of the
     *     receiver.
     */

    return TP.gui.Rect.construct(this);
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('difference',
function(aRect) {

    /**
     * @method difference
     * @summary Returns an Array of rectangles that contain the remaining
     *     regions of the receiver after the supplied rectangle has been
     *     subtracted.
     * @description This routine is adapted from Google's Closure library.
     * @param {TP.gui.Rect} aRect The rectangle to test.
     * @returns {TP.gui.Rect[]} An Array of TP.gui.Rects containing the
     *     remaining regions.
     */

    var intersectingRect,
        result,
        data,
        otherData,

        thisY,
        thisHeight,

        thisRight,
        thisBottom,

        otherRight,
        otherBottom;

    intersectingRect = this.intersection(aRect);

    if (TP.notValid(intersectingRect) ||
        intersectingRect.$get('data').width <= 0 ||
        intersectingRect.$get('data').height <= 0) {

        return TP.ac(this.copy());
    }

    data = this.$get('data');
    otherData = aRect.$get('data');

    result = TP.ac();

    thisY = data.y;
    thisHeight = data.height;

    thisRight = data.x + data.width;
    thisBottom = data.y + data.height;

    otherRight = otherData.x + otherData.width;
    otherBottom = otherData.y + otherData.height;

    //  Subtract off any area on top where the receiver extends past the
    //  supplied rectangle.
    if (otherData.y > data.y) {
        result.push(
            TP.gui.Rect.construct(data.x, data.y,
                                data.width, otherData.y - data.y));

        thisY = otherData.y;

        //  If we're moving the top down, we also need to subtract the
        //  height diff.
        thisHeight -= otherData.y - data.y;
    }

    //  Subtract off any area on bottom where the receiver extends past the
    //  supplied rectangle.
    if (otherBottom < thisBottom) {
        result.push(
            TP.gui.Rect.construct(data.x, otherBottom,
                                data.width, thisBottom - otherBottom));

        thisHeight = otherBottom - thisY;
    }

    //  Subtract any area on left where the receiver extends past the
    //  supplied rectangle.
    if (otherData.x > data.x) {
        result.push(
            TP.gui.Rect.construct(data.x, thisY,
                                otherData.x - data.x, thisHeight));
    }

    //  Subtract any area on right where the receiver extends past the
    //  supplied rectangle.
    if (otherRight < thisRight) {
        result.push(
            TP.gui.Rect.construct(otherRight, thisY,
                                thisRight - otherRight, thisHeight));
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('empty',
function() {

    /**
     * @method empty
     * @summary Sets the receiver to be the 'empty' rectangle (i.e. all
     *     coordinates are set to 0).
     * @returns {TP.gui.Rect} The receiver.
     */

    var data;

    data = this.$get('data');

    data.x = 0;
    data.y = 0;
    data.width = 0;
    data.height = 0;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('getCenterPoint',
function() {

    /**
     * @method getCenterPoint
     * @summary Returns the center point of the receiver.
     * @returns {TP.gui.Point} The center point of the receiver.
     */

    var data;

    data = this.$get('data');

    /* eslint-disable no-extra-parens */
    return TP.gui.Point.construct(data.x + (data.width / 2),
                                    data.y + (data.height / 2));
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('getClosestEdgePointFromPoint',
function(aPoint) {

    /**
     * @method getClosestEdgePointFromPoint
     * @summary Returns the 'closest edge point to the supplied point' of the
     *     receiver.
     * @param {TP.gui.Point} aPoint The point to use to calculate the closest
     *     edge point from.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Point} The closest edge point of the receiver.
     */

    var data,

        compassCorner,
        centerPoint;

    if (TP.notValid(aPoint)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    data = this.$get('data');

    compassCorner = this.getCompassCorner(aPoint, 8);
    centerPoint = this.getCenterPoint();

    switch (compassCorner) {
        case TP.NORTH:
            return TP.pc(centerPoint.get('x'), 0);

        case TP.NORTHEAST:
            return TP.pc(data.x + data.width, 0);

        case TP.EAST:
            return TP.pc(data.x + data.width, centerPoint.get('y'));

        case TP.SOUTHEAST:
            return TP.pc(data.x + data.width, data.y + data.height);

        case TP.SOUTH:
            return TP.pc(centerPoint.get('x'), data.y + data.height);

        case TP.SOUTHWEST:
            return TP.pc(0, data.y + data.height);

        case TP.WEST:
            return TP.pc(0, centerPoint.get('y'));

        case TP.NORTHWEST:
        default:
            return TP.pc(0, 0);
    }
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('getCompassCorner',
function(aPoint) {

    /**
     * @method getCompassCorner
     * @summary Returns the 'compass corner' of the receiver.
     * @description This method returns the 'compass corner' that the supplied
     *     point occupies within the receiver. Note that this routine clamps its
     *     value to the 'common 8' compass values matching these constants:
     *
     *     TP.NORTH
     *     TP.NORTHEAST
     *     TP.EAST
     *     TP.SOUTHEAST
     *     TP.SOUTH
     *     TP.SOUTHWEST
     *     TP.WEST
     *     TP.NORTHWEST
     *
     * @param {TP.gui.Point} aPoint The point to use to calculate the compass
     *     point from.
     * @exception TP.sig.InvalidParameter
     * @returns {Number} A Number matching the constant corresponding to the
     *     compass corner.
     */

    var angle,
        corner;

    if (TP.notValid(aPoint)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    angle = TP.computeAngleFromEnds(this.getCenterPoint(), aPoint);

    corner = TP.computeCompassCorner(angle, 8);

    return corner;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('getEdgePoint',
function(compassCorner) {

    /**
     * @method getEdgePoint
     * @summary Gets the 'edge point' of the receiver matching the supplied
     *     compass corner. For instance, TP.NORTHWEST will return the top-left
     *     corner point and TP.SOUTHEAST will return the bottom-right corner
     *     point.
     * @param {Number} compassCorner A Number matching the compass corner
     *     constant to return the edge point of. This should be one of these
     *     constants:
     *
     *     TP.NORTH
     *     TP.NORTHEAST
     *     TP.EAST
     *     TP.SOUTHEAST
     *     TP.SOUTH
     *     TP.SOUTHWEST
     *     TP.WEST
     *     TP.NORTHWEST
     *
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Point} The closest edge point of the receiver.
     */

    var data;

    if (TP.notValid(compassCorner)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    data = this.$get('data');

    /* eslint-disable no-extra-parens */
    switch (compassCorner) {
        case TP.NORTHWEST:
            return TP.pc(data.x, data.y);

        case TP.NORTH:
            return TP.pc(data.x + (data.width / 2), data.y);

        case TP.NORTHEAST:
            return TP.pc(data.x + data.width, data.y);

        case TP.EAST:
            return TP.pc(data.x + data.width, data.y + (data.height / 2));

        case TP.SOUTHEAST:
            return TP.pc(data.x + data.width, data.y + data.height);

        case TP.SOUTH:
            return TP.pc(data.x + (data.width / 2), data.y + data.height);

        case TP.SOUTHWEST:
            return TP.pc(data.x, data.y + data.height);

        case TP.WEST:
            return TP.pc(data.x, data.y + (data.height / 2));

        default:
            return TP.pc(0, 0);
    }
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('getHeight',
function() {

    /**
     * @method getHeight
     * @summary Returns the height of the receiver as a Number.
     * @returns {Number} The height of the receiver.
     */

    return this.$get('data').height;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('getWidth',
function() {

    /**
     * @method getWidth
     * @summary Returns the width of the receiver as a Number.
     * @returns {Number} The width of the receiver.
     */

    return this.$get('data').width;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('getX',
function() {

    /**
     * @method getX
     * @summary Returns the X coordinate of the receiver as a Number.
     * @returns {Number} The X coordinate of the receiver.
     */

    return this.$get('data').x;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('getXYPoint',
function() {

    /**
     * @method getXYPoint
     * @summary Returns the X,Y (i.e. left, top)  point of the receiver.
     * @returns {TP.gui.Point} The X,Y point of the receiver.
     */

    var data;

    data = this.$get('data');

    /* eslint-disable no-extra-parens */
    return TP.gui.Point.construct(data.x, data.y);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('getY',
function() {

    /**
     * @method getY
     * @summary Returns the Y coordinate of the receiver as a Number.
     * @returns {Number} The Y coordinate of the receiver.
     */

    return this.$get('data').y;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('grow',
function(widthDiff, heightDiff) {

    /**
     * @method grow
     * @summary Grows the width and height of the receiver by the values
     *     supplied.
     * @param {Number} widthDiff The amount to add to the width value of the
     *     receiver.
     * @param {Number} heightDiff The amount to add to the height value of the
     *     receiver.
     * @returns {TP.gui.Rect} The receiver.
     */

    var data;

    if (!TP.isNumber(widthDiff) || !TP.isNumber(heightDiff)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    data = this.$get('data');

    data.width += widthDiff;
    data.height += heightDiff;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('growByPoint',
function(aPoint) {

    /**
     * @method growByPoint
     * @summary Grows the width and height of the receiver by the values of the
     *     supplied point.
     * @param {TP.gui.Point} aPoint The point to use to grow the receiver.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Rect} The receiver.
     */

    var data;

    if (TP.notValid(aPoint)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    data = this.$get('data');

    data.width += aPoint.get('x');
    data.height += aPoint.get('y');

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('interpolate',
function(aRect, t) {

    /**
     * @method interpolate
     * @summary Computes an interpolated rectangle between the receiver and the
     *     supplied rectangle.
     * @description The interpolation factor determines how much a 'weight'
     *     towards the supplied rectangle will be used. It should be a Number
     *     between 0 and 1. To weight the computed rectangle towards the
     *     receiver, use a value approaching 0. To weight it towards the
     *     supplied rectangle, use a value approaching 1.
     * @param {TP.gui.Rect} aRect The rectangle to compute an interpolation
     *     with the receiver.
     * @param {Number} t Interpolation factor. Should be a Number between 0 and
     *     1.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Rect} A new rectangle with the coordinates of the
     *     receiver interpolated with the supplied rectangle using the supplied
     *     interpolation factor.
     */

    var data,
        otherData,

        interpFunc;

    if (!TP.isNumber(t)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    data = this.$get('data');
    otherData = aRect.$get('data');

    interpFunc =
        function(a, b, factor) {

            return a + (b - a) * factor;
        };

    return TP.gui.Rect.construct(
                    interpFunc(data.x, otherData.x, t),
                    interpFunc(data.y, otherData.y, t),
                    interpFunc(data.width, otherData.width, t),
                    interpFunc(data.height, otherData.height, t));
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('intersection',
function(aRect) {

    /**
     * @method intersection
     * @summary Returns a new rectangle that contains the area common to both
     *     the receiver and the supplied rectangle.
     * @param {TP.gui.Rect} aRect The rectangle to compute an intersection with
     *     the receiver.
     * @returns {TP.gui.Rect} A new rectangle that contains the area common to
     *     the receiver and the supplied rectangle.
     */

    var data,
        otherData,

        minX,
        minY,

        maxX,
        maxY;

    if (this.isEmpty()) {
        return TP.gui.Rect.construct(aRect);
    }

    if (aRect.isEmpty()) {
        return TP.gui.Rect.construct(this);
    }

    data = this.$get('data');
    otherData = aRect.$get('data');

    minX = data.x.max(otherData.x);
    maxX = (data.x + data.width).min(otherData.x + otherData.width);

    if (minX <= maxX) {
        minY = data.y.max(otherData.y);
        maxY = (data.y + data.height).min(otherData.y + otherData.height);

        if (minY <= maxY) {
            return TP.gui.Rect.construct(minX,
                                            minY,
                                            maxX - minX,
                                            maxY - minY);
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('intersects',
function(aRect) {

    /**
     * @method intersects
     * @summary Returns whether the supplied rectangle intersects the receiver.
     * @param {TP.gui.Rect} aRect The rectangle to test to see if it intersects
     *     with the receiver.
     * @returns {Boolean} Whether or not the supplied rectangle intersects the
     *     rectangle.
     */

    var data,
        otherData;

    data = this.$get('data');
    otherData = aRect.$get('data');

    if (data.x <= otherData.x + otherData.width &&
        otherData.x <= data.x + data.width &&
        data.y <= otherData.y + otherData.height &&
        otherData.y <= data.y + data.height) {
        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('isEmpty',
function() {

    /**
     * @method isEmpty
     * @summary Returns whether the receiver is an 'empty' rectangle - that is,
     *     whether its width or height is less than or equal to 0.
     * @returns {Boolean}
     */

    return this.$get('data').width <= 0 || this.$get('data').height <= 0;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('isOffsetFromCenterBy',
function(aPoint, offset) {

    /**
     * @method isOffsetFromCenterBy
     * @summary Returns whether or not the supplied point is offset from the
     *     receiver's center point by at least the amount supplied in the offset
     *     parameter.
     * @param {TP.gui.Point} aPoint The point to test.
     * @param {Number|String} offset The minimum amount that the supplied point
     *     should be offset from the receiver's center point.
     * @exception TP.sig.InvalidParameter
     * @returns {Boolean} Whether or not the receiver's center point is offset
     *     from the supplied point by the supplied minimum amount.
     */

    var centerPoint,
        distanceFromCenter,

        cornerPoint,
        distanceFromCorner,

        result,
        val;

    if (TP.notValid(aPoint)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    centerPoint = this.getCenterPoint();
    distanceFromCenter = aPoint.distanceBetween(centerPoint);

    cornerPoint = this.getClosestEdgePointFromPoint(aPoint);
    distanceFromCorner = cornerPoint.distanceBetween(centerPoint);

    result = false;
    if (TP.isValid(offset) && !TP.isNaN(val = offset.asNumber())) {
        if (TP.regex.PERCENTAGE.test(offset)) {
            val = val * distanceFromCorner;
        }

        /* eslint-disable no-extra-parens */
        result = (distanceFromCenter >= val);
        /* eslint-enable no-extra-parens */
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('maxFittedPoint',
function(aRect) {

    /**
     * @method maxFittedPoint
     * @summary Computes the maximum X/Y coordinates that the receiver can have
     *     while still remaining completely enclosed within the supplied
     *     rectangle.
     * @param {TP.gui.Rect} aRect The rectangle to use to compute the maximum
     *     fitted point for the receiver.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Point} The maximum 'fitted point'.
     */

    var data,
        otherData,

        maxFittedX,
        maxFittedY;

    if (TP.notValid(aRect)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    data = this.$get('data');
    otherData = aRect.$get('data');

    maxFittedX = otherData.width - data.width;
    maxFittedY = otherData.height - data.height;

    return TP.pc(maxFittedX, maxFittedY);
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('union',
function(aRect) {

    /**
     * @method union
     * @summary Returns a new rectangle that contains both the receiver and the
     *     supplied rectangle.
     * @param {TP.gui.Rect} aRect The rectangle to compute a union with the
     *     receiver.
     * @returns {TP.gui.Rect} A new rectangle that contains both the receiver
     *     and the supplied rectangle.
     */

    var data,
        otherData,

        newX,
        newY;

    if (this.isEmpty()) {
        return TP.gui.Rect.construct(aRect);
    }

    if (aRect.isEmpty()) {
        return TP.gui.Rect.construct(this);
    }

    data = this.$get('data');
    otherData = aRect.$get('data');

    newX = data.x.min(otherData.x);
    newY = data.y.min(otherData.y);

    return TP.gui.Rect.construct(
                newX,
                newY,
                (data.x + data.width - newX).max(
                            otherData.x + otherData.width - newX),
                (data.y + data.height - newY).max(
                            otherData.y + otherData.height - newY));
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('scale',
function(xScaleFactor, yScaleFactor) {

    /**
     * @method scale
     * @summary Scales the coordinates of the receiver around its center using
     *     the supplied scaling factor and returns a new TP.gui.Rect with those
     *     new coordinates.
     * @param {Number} xScaleFactor The amount to scale the coordinates of the
     *     receiver to. If this is the only argument supplied, the Y value will
     *     also be scaled using this argument.
     * @param {Number} yScaleFactor The amount to scale the coordinates of the
     *     receiver to.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Rect} A new rectangle with the coordinates of the
     *     receiver scaled using the scaling factor.
     */

    var data,

        newWidth,
        newHeight;

    //  yScaleFactor is optional
    if (!TP.isNumber(xScaleFactor)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    data = this.$get('data');

    if (TP.isNumber(yScaleFactor)) {
        newWidth = data.width * xScaleFactor;
        newHeight = data.height * yScaleFactor;
    } else {
        newWidth = data.width * xScaleFactor;
        newHeight = data.height * xScaleFactor;
    }

    return TP.gui.Rect.construct(
                    data.x - (newWidth - data.width) / 2,
                    data.y - (newHeight - data.height) / 2,
                    newWidth,
                    newHeight);
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('setHeight',
function(aHeight) {

    /**
     * @method setHeight
     * @summary Sets the height of the receiver to the supplied value.
     * @param {Number} aHeight The amount to set the height of the receiver to.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Rect} The receiver.
     */

    if (!TP.isNumber(aHeight)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    this.$get('data').height = aHeight;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('setWidth',
function(aWidth) {

    /**
     * @method setWidth
     * @summary Sets the width of the receiver to the supplied value.
     * @param {Number} aWidth The amount to set the width of the receiver to.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Rect} The receiver.
     */

    if (!TP.isNumber(aWidth)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    this.$get('data').width = aWidth;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('setX',
function(xVal) {

    /**
     * @method setX
     * @summary Sets the X coordinate of the receiver to the supplied value.
     * @param {Number} xVal The amount to set the 'x' coordinate of the receiver
     *     to.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Rect} The receiver.
     */

    if (!TP.isNumber(xVal)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    this.$get('data').x = xVal;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('setY',
function(yVal) {

    /**
     * @method setY
     * @summary Sets the Y coordinate of the receiver to the supplied value.
     * @param {Number} yVal The amount to set the 'y' coordinate of the receiver
     *     to.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Rect} The receiver.
     */

    if (!TP.isNumber(yVal)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    this.$get('data').y = yVal;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('setXY',
function(xVal, yVal) {

    /**
     * @method setXY
     * @summary Sets the X and Y coordinates of the receiver to the supplied
     *     values.
     * @param {Number} xVal The amount to set the 'x' coordinate of the receiver
     *     to.
     * @param {Number} yVal The amount to set the 'y' coordinate of the receiver
     *     to.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Rect} The receiver.
     */

    var data;

    if (!TP.isNumber(xVal) || !TP.isNumber(yVal)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    data = this.$get('data');

    data.x = xVal;
    data.y = yVal;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('shrink',
function(widthDiff, heightDiff) {

    /**
     * @method shrink
     * @summary Shrinks the width and height of the receiver by the values
     *     supplied.
     * @param {Number} widthDiff The amount to subtract from the width value of
     *     the receiver.
     * @param {Number} heightDiff The amount to subtract from the height value
     *     of the receiver.
     * @returns {TP.gui.Rect} The receiver.
     */

    var data;

    if (!TP.isNumber(widthDiff) || !TP.isNumber(heightDiff)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    data = this.$get('data');

    data.width -= widthDiff;
    data.height -= heightDiff;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('shrinkByPoint',
function(aPoint) {

    /**
     * @method shrinkByPoint
     * @summary Shrinks the width and height of the receiver by the values of
     *     the supplied point.
     * @param {TP.gui.Point} aPoint The point to use to grow the receiver.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Rect} The receiver.
     */

    var data;

    if (TP.notValid(aPoint)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    data = this.$get('data');

    data.width -= aPoint.get('x');
    data.height -= aPoint.get('y');

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('subtractByPoint',
function(aPoint) {

    /**
     * @method subtractByPoint
     * @summary Subtracts the dimensions of the supplied point from the
     *     receiver.
     * @param {TP.gui.Point} aPoint The point to subtract from the receiver.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Rect} The receiver.
     */

    var data;

    if (TP.notValid(aPoint)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    data = this.$get('data');

    data.x -= aPoint.get('x');
    data.y -= aPoint.get('y');

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('subtractFromX',
function(xDiff) {

    /**
     * @method subtractFromX
     * @summary Subtracts the value supplied from the x value of the receiver.
     * @param {Number} xDiff The amount to subtract from the x value of the
     *     receiver.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Rect} The receiver.
     */

    if (!TP.isNumber(xDiff)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    this.$get('data').x -= xDiff;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('subtractFromY',
function(yDiff) {

    /**
     * @method subtractFromY
     * @summary Subtracts the value supplied from the y value of the receiver.
     * @param {Number} yDiff The amount to subtract from the y value of the
     *     receiver.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Rect} The receiver.
     */

    if (!TP.isNumber(yDiff)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    this.$get('data').y -= yDiff;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('translate',
function(xDiff, yDiff) {

    /**
     * @method translate
     * @summary Translates the position of the receiver by the values supplied.
     * @param {Number} xDiff The amount to add to the x value of the receiver.
     * @param {Number} yDiff The amount to add to the y value of the receiver.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Rect} The receiver.
     */

    var data;

    if (!TP.isNumber(xDiff) || !TP.isNumber(yDiff)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    data = this.$get('data');

    data.x += xDiff;
    data.y += yDiff;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Rect.Inst.defineMethod('translateByPoint',
function(aPoint) {

    /**
     * @method translateByPoint
     * @summary Translates the position of the receiver by the values of the
     *     supplied point.
     * @param {TP.gui.Point} aPoint The point to use to translate the receiver.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Rect} The receiver.
     */

    var data;

    if (TP.notValid(aPoint)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    data = this.$get('data');

    data.x += aPoint.get('x');
    data.y += aPoint.get('y');

    return this;
});

//  ========================================================================
//  TP.gui.Matrix
//  ========================================================================

/**
 * @type {TP.gui.Matrix}
 * @summary A type that can manage matrix (xx, xy, yx, yy, dx, dy) values.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('gui.Matrix');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  A RegExp that can construct a TP.gui.Matrix from
//  'matrix(xx, yx, xy, yy, dx, dy)'
TP.gui.Matrix.Type.defineConstant('MATRIX_REGEX',
                    TP.rc('matrix\\s*\\(\\s*([-.\\d]+)\\s*' +
                            '(?:,\\s*)([-.\\d]+)\\s*' +
                            '(?:,\\s*)([-.\\d]+)\\s*' +
                            '(?:,\\s*)([-.\\d]+)\\s*' +
                            '(?:,\\s*)([-.\\d]+)\\s*' +
                            '(?:,\\s*)([-.\\d]+)\\s*\\)'));

//  A RegExp that can construct a TP.gui.Matrix from 'rotate(deg)'
TP.gui.Matrix.Type.defineConstant('ROTATE_REGEX',
                    TP.rc('rotate\\s*\\(\\s*([-.\\d]+)\\s*\\)'));

//  A RegExp that can construct a TP.gui.Matrix from
//  'scale(xScale, yScale)'
//  NB: The yScale value is optional and will default to the xScale value
//  if not supplied
TP.gui.Matrix.Type.defineConstant('SCALE_REGEX',
                    TP.rc('scale\\s*\\(\\s*([-.\\d]+)\\s*' +
                            '(?:,\\s*)?([-.\\d]+)?\\s*\\)'));

//  A RegExp that can construct a TP.gui.Matrix from 'skewX(xSkew)'
TP.gui.Matrix.Type.defineConstant('SKEWX_REGEX',
                    TP.rc('skewX\\s*\\(\\s*([-.\\d]+)\\s*\\)'));

//  A RegExp that can construct a TP.gui.Matrix from 'skewY(ySkew)'
TP.gui.Matrix.Type.defineConstant('SKEWY_REGEX',
                    TP.rc('skewY\\s*\\(\\s*([-.\\d]+)\\s*\\)'));

//  A RegExp that can construct a TP.gui.Matrix from
//  'translate(xVal, yVal)'
//  NB: The yVal value is optional and will default to the xVal value if not
//  supplied
TP.gui.Matrix.Type.defineConstant('TRANSLATE_REGEX',
                    TP.rc('translate\\s*\\(\\s*([-.\\d]+)\\s*' +
                            '(?:,\\s*)?([-.\\d]+)?\\s*\\)'));

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.gui.Matrix.Type.defineConstant('STYLE_DECLVALUE_PARSER',
function(aString) {

    /**
     * @method STYLE_DECLVALUE_PARSER
     * @summary Converts a String containing a matrix description to a
     *     TP.gui.Matrix object.
     * @description The supplied String can be in one of seven formats:
     *     translate(xCoord, yCoord) translate(xAndYCoord) scale(xFactor,
     *     yFactor) scale(xAndYFactor) rotate(rotationAngle) skewX(skewAngle)
     *     skewY(skewAngle) matrix(xx, yx, xy, yy, dx, dy)
     * @param {The} aString String definition to use to build a TP.gui.Matrix
     *     object from.
     * @returns {TP.gui.Matrix} A TP.gui.Matrix expressing the supplied
     *     transformation.
     */

    var newObj,

        vals,

        xVal,
        yVal;

    //  No need to do parameter check here. We wouldn't have gotten here if
    //  aString wasn't a String.

    newObj = null;

    if (/translate/.test(aString)) {
        vals = TP.gui.Matrix.TRANSLATE_REGEX.match(aString);

        xVal = vals.at(1);
        yVal = vals.at(2);

        if (TP.notValid(yVal)) {
            yVal = xVal;
        }

        newObj = TP.gui.Matrix.constructTranslationMatrix(
                                        parseFloat(xVal), parseFloat(yVal));
    } else if (/scale/.test(aString)) {
        vals = TP.gui.Matrix.SCALE_REGEX.match(aString);

        xVal = vals.at(1);
        yVal = vals.at(2);

        if (TP.notValid(yVal)) {
            yVal = xVal;
        }

        newObj = TP.gui.Matrix.constructScalingMatrix(
                                        parseFloat(xVal), parseFloat(yVal));
    } else if (/rotate/.test(aString)) {
        vals = TP.gui.Matrix.ROTATE_REGEX.match(aString);

        newObj = TP.gui.Matrix.constructRotationMatrix(
                                        parseFloat(vals.at(1)));
    } else if (/skewX/.test(aString)) {
        vals = TP.gui.Matrix.SKEWX_REGEX.match(aString);

        xVal = vals.at(1);

        newObj = TP.gui.Matrix.constructSkewXMatrix(parseFloat(xVal));
    } else if (/skewY/.test(aString)) {
        vals = TP.gui.Matrix.SKEWY_REGEX.match(aString);

        yVal = vals.at(1);

        newObj = TP.gui.Matrix.constructSkewYMatrix(parseFloat(yVal));
    } else if (/matrix/.test(aString)) {
        vals = TP.gui.Matrix.MATRIX_REGEX.match(aString);

        if (vals.getSize() < 7) {
            newObj = null;
        } else {
            newObj = TP.gui.Matrix.construct({
                xx: parseFloat(vals.at(1)),
                yx: parseFloat(vals.at(2)),
                xy: parseFloat(vals.at(3)),
                yy: parseFloat(vals.at(4)),
                dx: parseFloat(vals.at(5)),
                dy: parseFloat(vals.at(6))
            });
        }
    }

    return newObj;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.addParser(TP.gui.Matrix.STYLE_DECLVALUE_PARSER);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.gui.Matrix.Type.defineMethod('cloneIdentityData',
function() {

    /**
     * @method cloneIdentityData
     * @summary Returns a copy of the type's 'identity data' that can be used
     *     in an identity matrix or in other computations.
     * @returns {Object} An object that contains identity matrix information.
     */

    var identityData;

    identityData = {
        xx: 1, xy: 0,
        yx: 0, yy: 1,
        dx: 0, dy: 0
    };

    return identityData;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Type.defineMethod('constructIdentityMatrix',
function() {

    /**
     * @method constructIdentityMatrix
     * @summary Returns a matrix that has configured its data to be an identity
     *     matrix.
     * @returns {TP.gui.Matrix} An identity matrix.
     */

    //  An identity matrix is the default.
    return TP.gui.Matrix.construct();
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Type.defineMethod('constructFlipXMatrix',
function() {

    /**
     * @method constructFlipXMatrix
     * @summary Returns a matrix that will flip coordinates on the X axis.
     * @returns {TP.gui.Matrix} A matrix that flips X coordinates.
     */

    var newMatrix;

    newMatrix = TP.gui.Matrix.construct();

    newMatrix.$get('data').xx = -1;

    return newMatrix;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Type.defineMethod('constructFlipYMatrix',
function() {

    /**
     * @method constructFlipYMatrix
     * @summary Returns a matrix that will flip coordinates on the Y axis.
     * @returns {TP.gui.Matrix} A matrix that flips Y coordinates.
     */

    var newMatrix;

    newMatrix = TP.gui.Matrix.construct();

    newMatrix.$get('data').yy = -1;

    return newMatrix;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Type.defineMethod('constructFlipXYMatrix',
function() {

    /**
     * @method constructFlipXYMatrix
     * @summary Returns a matrix that will flip coordinates on both the X and Y
     *     axis.
     * @returns {TP.gui.Matrix} A matrix that flips both X and Y coordinates.
     */

    var newMatrix;

    newMatrix = TP.gui.Matrix.construct();

    newMatrix.$get('data').xx = -1;
    newMatrix.$get('data').yy = -1;

    return newMatrix;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Type.defineMethod('constructProjectionMatrix',
function(projectX, projectY) {

    /**
     * @method constructProjectionMatrix
     * @summary Returns a matrix that will project X and Y coordinates around a
     *     point defined by the supplied X and Y.
     * @param {Number|TP.gui.Point} projectX The X coordinate to project points
     *     around or a TP.gui.Point to use as both the X and Y coordinates.
     * @param {Number} projectY The Y coordinate to project points around.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Matrix} A matrix that projects X and Y coordinates
     *     around the supplied X and Y point.
     */

    var newMatrix,

        x,
        y,

        x2,
        y2,

        n2,
        xy,

        newMatrixData;

    //  NB: We don't test projectY here, since this method allows it to not
    //  be defined.

    if (TP.notValid(projectX)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    newMatrix = TP.gui.Matrix.construct();
    newMatrixData = newMatrix.$get('data');

    if (arguments.length === 1) {
        x = projectX.get('data').x;
        y = projectX.get('data').y;
    } else {
        x = projectX;
        y = projectY;
    }

    x2 = x * x;
    y2 = y * y;

    n2 = x2 + y2;

    xy = x * y / n2;

    newMatrixData.xx = x2 / n2;
    newMatrixData.xy = xy;

    newMatrixData.yx = xy;
    newMatrixData.yy = y2 / n2;

    return newMatrix;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Type.defineMethod('constructReflectionMatrix',
function(reflectX, reflectY) {

    /**
     * @method constructReflectionMatrix
     * @summary Returns a matrix that will reflect X and Y coordinates around a
     *     point defined by the supplied X and Y.
     * @param {Number|TP.gui.Point} reflectX The X coordinate to reflect points
     *     around or a TP.gui.Point to use as both the X and Y coordinates.
     * @param {Number} reflectY The Y coordinate to reflect points around.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Matrix} A matrix that reflects X and Y coordinates
     *     around the supplied X and Y point.
     */

    var newMatrix,

        x,
        y,

        x2,
        y2,

        n2,
        xy,

        newMatrixData;

    //  NB: We don't test reflectY here, since this method allows it to not
    //  be defined.

    if (TP.notValid(reflectX)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    newMatrix = TP.gui.Matrix.construct();
    newMatrixData = newMatrix.$get('data');

    if (arguments.length === 1) {
        x = reflectX.get('data').x;
        y = reflectX.get('data').y;
    } else {
        x = reflectX;
        y = reflectY;
    }

    x2 = x * x;
    y2 = y * y;

    n2 = x2 + y2;

    xy = 2 * x * y / n2;

    newMatrixData.xx = 2 * x2 / n2 - 1;
    newMatrixData.xy = xy;

    newMatrixData.yx = xy;
    newMatrixData.yy = 2 * y2 / n2 - 1;

    return newMatrix;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Type.defineMethod('constructRotationMatrix',
function(angle) {

    /**
     * @method constructRotationMatrix
     * @summary Returns a matrix that will rotate its X and Y coordinates by
     *     the supplied amount around the (0,0) point.
     * @param {Number} angle The angle in radians to rotate the X and Y
     *     coordinates by.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Matrix} A matrix that rotates X and Y coordinates
     *     around the (0,0) point by the supplied amounts.
     */

    var newMatrix,
        newMatrixData,

        angleSine,
        angleCosine;

    if (!TP.isNumber(angle)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    newMatrix = TP.gui.Matrix.construct();
    newMatrixData = newMatrix.$get('data');

    angleSine = angle.sin();
    angleCosine = angle.cos();

    newMatrixData.xx = angleCosine;
    newMatrixData.yy = angleCosine;

    newMatrixData.xy = -angleSine;
    newMatrixData.yx = angleSine;

    return newMatrix;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Type.defineMethod('constructScalingMatrix',
function(diffX, diffY) {

    /**
     * @method constructScalingMatrix
     * @summary Returns a matrix that will scale X and Y coordinates by the
     *     supplied amounts.
     * @param {Number|TP.gui.Point} diffX The amount to scale X coordinates or
     *     a TP.gui.Point to use for both X and Y amounts.
     * @param {Number} diffY The amount to scale Y coordinates.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Matrix} A matrix that scales X and Y coordinates by the
     *     supplied amounts.
     */

    var newMatrix;

    //  NB: We don't test diffY here, since this method allows it to not
    //  be defined.

    if (TP.notValid(diffX)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    newMatrix = TP.gui.Matrix.construct();

    if (arguments.length === 1) {
        newMatrix.$get('data').xx = diffX.get('data').x;
        newMatrix.$get('data').yy = diffX.get('data').y;
    } else {
        newMatrix.$get('data').xx = diffX;
        newMatrix.$get('data').yy = diffY;
    }

    return newMatrix;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Type.defineMethod('constructSkewXMatrix',
function(skewAngle) {

    /**
     * @method constructSkewXMatrix
     * @summary Returns a matrix that will skew coordinates on the X axis
     *     around the (0,0) point.
     * @param {Number} skewAngle The angle in radians to skew the X coordinates
     *     by.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Matrix} A matrix that skews X coordinates.
     */

    var newMatrix;

    if (!TP.isNumber(skewAngle)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    newMatrix = TP.gui.Matrix.construct();

    newMatrix.$get('data').xy = -skewAngle.tan();

    return newMatrix;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Type.defineMethod('constructSkewYMatrix',
function(skewAngle) {

    /**
     * @method constructSkewYMatrix
     * @summary Returns a matrix that will skew coordinates on the Y axis
     *     around the (0,0) point.
     * @param {Number} skewAngle The angle in radians to skew the Y coordinates
     *     by.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Matrix} A matrix that skews Y coordinates.
     */

    var newMatrix;

    if (!TP.isNumber(skewAngle)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    newMatrix = TP.gui.Matrix.construct();

    newMatrix.$get('data').yx = skewAngle.tan();

    return newMatrix;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Type.defineMethod('constructTranslationMatrix',
function(diffX, diffY) {

    /**
     * @method constructTranslationMatrix
     * @summary Returns a matrix that will move X and Y coordinates by the
     *     supplied amounts.
     * @param {Number|TP.gui.Point} diffX The amount to move X coordinates or a
     *     TP.gui.Point to use for both X and Y amounts.
     * @param {Number} diffY The amount to move Y coordinates.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Matrix} A matrix that moves X and Y coordinates by the
     *     supplied amounts.
     */

    var newMatrix;

    //  NB: We don't test diffY here, since this method allows it to not
    //  be defined.

    if (TP.notValid(diffX)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    newMatrix = TP.gui.Matrix.construct();

    if (arguments.length === 1) {
        newMatrix.$get('data').dx = diffX.get('data').x;
        newMatrix.$get('data').dy = diffX.get('data').y;
    } else {
        newMatrix.$get('data').dx = diffX;
        newMatrix.$get('data').dy = diffY;
    }

    return newMatrix;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Type.defineMethod('fromCSSString',
function(aString) {

    /**
     * @method fromString
     * @summary Converts a String containing a CSS matrix represenation to a
     *     TP.gui.Matrix object.
     * @description The supplied String can be in either the 3X2 'matrix()'
     *     format for CSS 2D transforms or the 4X4 'matrix3d()' format for CSS
     *     3D transforms. Since this type only supports 3X2 matrices, however,
     *     3D 4X4 matrices will be converted to 3X2 matrices.
     * @param {String} aString The String that an instance of this type will be
     *     extracted from.
     * @returns {TP.gui.Matrix} A TP.gui.Matrix having a set of values as
     *     expressed in the supplied String.
     */

    //  Make sure to pass 'true' as the second parameter to get a 3X2 matrix.
    return this.fromArray(TP.matrixFromCSSString(aString, true));
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Type.defineMethod('fromArray',
function(anObj) {

    /**
     * @method fromArray
     * @summary Returns an instance of this type as extracted from anObj, which
     *     should be an Array. This Array should be in the format of:
     *     [[xx, xy, dx], [yx, yy, dy]]
     * @description This type only supports 3X2 matrices, so this method will
     *     only take a 3X2 set of Arrays representing that. 4X4 3D matrices have
     *     to be converted to a 3X2 matrix first.
     * @param {Number[][]} anObj The Array that an instance of this type will be
     *     extracted from.
     * @returns {TP.gui.Matrix} An instance of this type as extracted from
     *     anObj.
     */

    var data,
        newObj;

    data = {
        xx: anObj[0][0],
        xy: anObj[0][1],
        yx: anObj[1][0],
        yy: anObj[1][1],
        dx: anObj[0][2],
        dy: anObj[1][2]
    };

    newObj = this.construct(data);

    return newObj;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Type.defineMethod('rotateAt',
function(angle, aPoint) {

    /**
     * @method rotateAt
     * @summary Returns a matrix that is rotated around the supplied point
     *     (used as a center point) according to the supplied rotation angle.
     * @param {Number} angle The angle in radians to rotate around the X and Y
     *     coordinates.
     * @param {TP.gui.Point} aPoint The point to use as the center point of the
     *     rotation.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Matrix} A matrix that is rotated around the point by
     *     the angle supplied.
     */

    var rotationMatrix;

    if (!TP.isNumber(angle) || TP.notValid(aPoint)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    rotationMatrix = TP.gui.Matrix.constructRotationMatrix(angle);

    return rotationMatrix.applyTransformsUsing(aPoint);
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Type.defineMethod('scaleAt',
function(aPoint, xFactor, yFactor) {

    /**
     * @method scaleAt
     * @summary Returns a matrix that scales its X and Y axis around the
     *     supplied point (used as a center point) according to the supplied
     *     scaling factors.
     * @param {TP.gui.Point} aPoint The point to use as the center point of the
     *     scaling.
     * @param {Number} xFactor The amount to scale the X axis by.
     * @param {Number} yFactor The amount to scale the Y axis by.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Matrix} A matrix that scales around the point by the
     *     angle supplied.
     */

    var scalingMatrix;

    if (TP.notValid(aPoint) ||
        !TP.isNumber(xFactor) ||
        !TP.isNumber(yFactor)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    scalingMatrix = TP.gui.Matrix.constructScalingMatrix(xFactor, yFactor);

    return scalingMatrix.applyTransformsUsing(aPoint);
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Type.defineMethod('skewXAt',
function(angle, aPoint) {

    /**
     * @method skewXAt
     * @summary Returns a matrix that skews the X axis using the supplied point
     *     (used as a center point) according to the supplied rotation angle.
     * @param {Number} angle The angle in radians to skew the X axis around the
     *     X and Y coordinates.
     * @param {TP.gui.Point} aPoint The point to use as the center point of the
     *     skew.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Matrix} A matrix that skews the X axis around the point
     *     by the angle supplied.
     */

    var skewMatrix;

    if (!TP.isNumber(angle) || TP.notValid(aPoint)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    skewMatrix = TP.gui.Matrix.constructSkewXMatrix(angle);

    return skewMatrix.applyTransformsUsing(aPoint);
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Type.defineMethod('skewYAt',
function(angle, aPoint) {

    /**
     * @method skewYAt
     * @summary Returns a matrix that skews the Y axis using the supplied point
     *     (used as a center point) according to the supplied rotation angle.
     * @param {Number} angle The angle in radians to skew the Y axis around the
     *     X and Y coordinates.
     * @param {TP.gui.Point} aPoint The point to use as the center point of the
     *     skew.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Matrix} A matrix that skews the Y axis around the point
     *     by the angle supplied.
     */

    var skewMatrix;

    if (!TP.isNumber(angle) || TP.notValid(aPoint)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    skewMatrix = TP.gui.Matrix.constructSkewYMatrix(angle);

    return skewMatrix.applyTransformsUsing(aPoint);
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Type.defineMethod('translateBy',
function(diffX, diffY, aPoint) {

    /**
     * @method translateBy
     * @summary Returns a matrix that translates the X and Y axis using the
     *     supplied point (used as a center point) according to the supplied
     *     rotation angle.
     * @param {Number} diffX The difference to translate the X axis.
     * @param {Number} diffY The difference to translate the Y axis.
     * @param {TP.gui.Point} aPoint The point to use as the center point of the
     *     skew.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Matrix} A matrix that translates the X and Y axis
     *     around the point by the differences supplied.
     */

    var translationMatrix;

    if (!TP.isNumber(diffX) || !TP.isNumber(diffY) || TP.notValid(aPoint)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    translationMatrix = TP.gui.Matrix.constructTranslationMatrix(
                                                            diffX, diffY);

    return translationMatrix.applyTransformsUsing(aPoint);
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.gui.Matrix.Inst.defineAttribute('data');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.gui.Matrix.Inst.defineMethod('init',
function(matrixData) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @description The argument to this method may be either a literal Object
     *     that contains matrix data to initialize the new instance with, a
     *     TP.gui.Matrix or an Array of either of these type of objects. If the
     *     objects are literal Objects, they should have the following keys /
     *     format: { xx: 1, xy: 0, yx: 0, yy: 1, dx: 0, dy: 0 };
     *
     *     Note that this example is the 'identity matrix' data that can be
     *     obtained by calling TP.gui.Matrix.cloneIdentityData().
     * @param {Object|TP.gui.Matrix|Number[][]} matrixData One or more objects
     *     of matrix data to initialize the matrix with. If this parameter is
     *     not valid, the matrix is initialized with the 'identity matrix'.
     * @returns {TP.gui.Matrix} The receiver.
     */

    var newData,

        i,

        lastData,
        currentData,

        newMatrixData;

    this.callNextMethod();

    if (TP.notEmpty(arguments)) {
        newData = arguments[0];

        if (TP.isKindOf(newData, TP.gui.Matrix)) {
            newData = newData.$get('data');

            newData = {
                xx: newData.xx, xy: newData.xy,
                yx: newData.yx, yy: newData.yy,
                dx: newData.dx, dy: newData.dy
            };
        }

        //  Loop over the rest of the arguments and 'accumulate' them into a
        //  single TP.gui.Matrix.
        for (i = 1; i < arguments.length; i++) {
            lastData = newData;
            currentData = arguments[i];

            if (TP.isKindOf(currentData, TP.gui.Matrix)) {
                currentData = currentData.$get('data');
            }

            newData = TP.gui.Matrix.cloneIdentityData();

            newData.xx = lastData.xx * currentData.xx +
                            lastData.xy * currentData.yx;
            newData.xy = lastData.xx * currentData.xy +
                            lastData.xy * currentData.yy;
            newData.yx = lastData.yx * currentData.xx +
                            lastData.yy * currentData.yx;
            newData.yy = lastData.yx * currentData.xy +
                            lastData.yy * currentData.yy;
            newData.dx = lastData.xx * currentData.dx +
                            lastData.xy * currentData.dy + lastData.dx;
            newData.dy = lastData.yx * currentData.dx +
                            lastData.yy * currentData.dy + lastData.dy;
        }

        newMatrixData = newData;
    } else {
        newMatrixData = TP.gui.Matrix.cloneIdentityData();
    }

    this.set('data', newMatrixData);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Inst.defineMethod('add',
function(aMatrix) {

    /**
     * @method add
     * @summary Changes the receiver by summing the receiver and the supplied
     *     matrix together.
     * @param {TP.gui.Matrix} aMatrix The matrix to add to the receiver.
     * @returns {TP.gui.Matrix} The receiver.
     */

    var data,
        otherData;

    data = this.$get('data');
    otherData = aMatrix.$get('data');

    data.xx += otherData.xx;
    data.xy += otherData.xy;
    data.yx += otherData.yx;
    data.yy += otherData.yy;
    data.dx += otherData.dx;
    data.dy += otherData.dy;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Inst.defineMethod('applyTransformsUsing',
function(aPoint) {

    /**
     * @method applyTransformsUsing
     * @summary Applies the a positive translation, the receiver (which
     *     performs the actual transformation) and a negative translation to the
     *     point given and returns a matrix.
     * @param {TP.gui.Point} aPoint The point to use to compute the two
     *     translation matrices.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Matrix} A new TP.gui.Matrix containing the result of
     *     executing the translations and the receiver against the supplied
     *     point.
     */

    var pointData,

        matrix1,
        matrix2,

        resultMatrix;

    if (TP.notValid(aPoint)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    pointData = aPoint.get('data');

    matrix1 = TP.gui.Matrix.constructTranslationMatrix(pointData.x,
                                                        pointData.y);
    matrix2 = TP.gui.Matrix.constructTranslationMatrix(-pointData.x,
                                                        -pointData.y);

    resultMatrix = matrix1.multiply(this, matrix2);

    return resultMatrix;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Inst.defineMethod('asCSSTransformString',
function() {

    /**
     * @method asCSSTransformString
     * @summary Returns the receiver as a String value that can be used for CSS
     *     Transforms.
     * @returns {String} The CSS Transform representation of the receiver.
     */

    var data;

    data = this.$get('data');

    return TP.join('matrix(', data.xx, ',', data.yx, ',',
                                data.xy, ',', data.yy, ',',
                                data.dx, ',', data.dy, ')');
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Inst.defineMethod('asDumpString',
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var data,
        repStr,

        str;

    str = '[' + TP.tname(this) + ' :: ';
    data = this.$get('data');

    repStr = TP.join('{',
                        'xx: ', data.xx,
                        ', xy: ', data.xy,
                        ', yx: ', data.yx,
                        ', yy: ', data.yy,
                        ', dx: ', data.dx,
                        ', dy: ', data.dy,
                        '}');

    str += repStr + ']';

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    var data,
        str;

    data = this.$get('data');

    try {
        str = '<span class="TP_gui_Matrix">' +
                    '<span data-name="xx">' + data.xx + '</span>' +
                    '<span data-name="xy">' + data.xy + '</span>' +
                    '<span data-name="yx">' + data.yx + '</span>' +
                    '<span data-name="yy">' + data.yy + '</span>' +
                    '<span data-name="dx">' + data.dx + '</span>' +
                    '<span data-name="dy">' + data.dy + '</span>' +
                '</span>';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var data;

    data = this.$get('data');

    return '{"type":' + TP.tname(this).quoted('"') + ',' +
             '"data":{' +
                 '"xx":"' + data.xx + '",' +
                 '"xy":"' + data.xy + '",' +
                 '"yx":"' + data.yx + '",' +
                 '"yy":"' + data.yy + '",' +
                 '"dx":"' + data.dx + '",' +
                 '"dy":"' + data.dy + '"' +
                 '}}';
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} The receiver's 'pretty print' String representation.
     */

    var data,
        str;

    data = this.$get('data');

    try {
        str = '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) + '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' +
                        this.getTypeName() +
                    '</dd>' +
                    '<dt class="pretty key">xx</dt>' +
                    '<dd class="pretty value">' +
                        data.xx +
                    '</dd>' +
                    '<dt class="pretty key">xy</dt>' +
                    '<dd class="pretty value">' +
                        data.xy +
                    '</dd>' +
                    '<dt class="pretty key">yx</dt>' +
                    '<dd class="pretty value">' +
                        data.yx +
                    '</dd>' +
                    '<dt class="pretty key">yy</dt>' +
                    '<dd class="pretty value">' +
                        data.yy +
                    '</dd>' +
                    '<dt class="pretty key">dx</dt>' +
                    '<dd class="pretty value">' +
                        data.dx +
                    '</dd>' +
                    '<dt class="pretty key">dy</dt>' +
                    '<dd class="pretty value">' +
                        data.dy +
                    '</dd>' +
                    '</dl>';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Inst.defineMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns the receiver as a TIBET source code string.
     * @returns {String} An appropriate form for recreating the receiver.
     */

    var data,
        dataStr;

    data = this.$get('data');

    dataStr = TP.join('{',
                        'xx: ', data.xx,
                        ', xy: ', data.xy,
                        ', yx: ', data.yx,
                        ', yy: ', data.yy,
                        ', dx: ', data.dx,
                        ', dy: ', data.dy,
                        '}');

    return 'TP.gui.Matrix.construct(' + dataStr + ')';
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @method asString
     * @summary Returns the matrix data formatted as a JavaScript literal
     *     object as its String representation.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.gui.Matrix's String representation. This flag is ignored
     *     in this version of this method.
     * @returns {String} The String representation of the receiver.
     */

    var data,
        repStr;

    data = this.$get('data');

    repStr = TP.join('{',
                        'xx: ', data.xx,
                        ', xy: ', data.xy,
                        ', yx: ', data.yx,
                        ', yy: ', data.yy,
                        ', dx: ', data.dx,
                        ', dy: ', data.dy,
                        '}');

    return repStr;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    var data,
        str;

    data = this.$get('data');

    try {
        str = '<instance type="' + TP.tname(this) + '"' +
                ' xx="' + data.xx + '" xy="' + data.xy + '"' +
                ' yx="' + data.yx + '" yy="' + data.yy + '"' +
                ' dx="' + data.dx + '" dy="' + data.dy + '"' +
                 '/>';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Inst.defineMethod('copy',
function() {

    /**
     * @method copy
     * @summary Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver.
     * @returns {TP.gui.Matrix} A new TP.gui.Matrix which is a copy of the
     *     receiver.
     */

    return TP.gui.Matrix.construct(this);
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Inst.defineMethod('invert',
function() {

    /**
     * @method invert
     * @summary Inverts the receiver.
     * @returns {TP.gui.Matrix} The receiver.
     */

    var data,

        diff;

    data = this.$get('data');

    diff = data.xx * data.yy - data.xy * data.yx;

    data.xx = data.yy / diff;
    data.xy = -data.xy / diff;
    data.yx = -data.yx / diff;
    data.yy = data.xx / diff;
    data.dx = (data.xy * data.dy - data.yy * data.dx) / diff;
    data.dy = (data.yx * data.dx - data.xx * data.dy) / diff;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Inst.defineMethod('multiply',
function() {

    /**
     * @method multiply
     * @summary Multiplies the supplied 1 or more TP.gui.Matrix objects
     *     against the receiver, beginning with the receiver.
     * @description This method accepts 1 or more TP.gui.Matrix objects as
     *     arguments and therefore has no named parameters.
     * @returns {TP.gui.Matrix} The receiver.
     */

    var newData,

        i,

        lastData,
        currentData;

    newData = this.$get('data');

    //  Loop over all of the arguments and 'accumulate' them into a single
    //  TP.gui.Matrix.
    for (i = 0; i < arguments.length; i++) {
        lastData = newData;
        currentData = arguments[i].$get('data');

        newData = TP.gui.Matrix.cloneIdentityData();

        newData.xx = lastData.xx * currentData.xx +
                        lastData.xy * currentData.yx;
        newData.xy = lastData.xx * currentData.xy +
                        lastData.xy * currentData.yy;
        newData.yx = lastData.yx * currentData.xx +
                        lastData.yy * currentData.yx;
        newData.yy = lastData.yx * currentData.xy +
                        lastData.yy * currentData.yy;
        newData.dx = lastData.xx * currentData.dx +
                        lastData.xy * currentData.dy + lastData.dx;
        newData.dy = lastData.yx * currentData.dx +
                        lastData.yy * currentData.dy + lastData.dy;
    }

    this.$set('data', newData);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Inst.defineMethod('rotate',
function(angle) {

    /**
     * @method rotate
     * @summary Applies a rotation transformation to the receiver.
     * @param {Number} angle The angle in radians to rotate the X and Y
     *     coordinates by.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Matrix} The receiver.
     */

    var data,

        angleSine,
        angleCosine;

    if (!TP.isNumber(angle)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    data = this.$get('data');

    angleSine = angle.sin();
    angleCosine = angle.cos();

    data.xx = angleCosine;
    data.yy = angleCosine;

    data.xy = -angleSine;
    data.yx = angleSine;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Inst.defineMethod('scale',
function(diffX, diffY) {

    /**
     * @method scale
     * @summary Applies a scaling transformation to the receiver.
     * @param {Number|TP.gui.Point} diffX The amount to scale X coordinates or
     *     a TP.gui.Point to use for both X and Y amounts.
     * @param {Number} diffY The amount to scale Y coordinates.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Matrix} The receiver.
     */

    var data;

    if (TP.notValid(diffX)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    data = this.$get('data');

    if (arguments.length === 1) {
        data.xx = diffX.get('x');
        data.yy = diffX.get('y');
    } else {
        data.xx = diffX;
        data.yy = diffY;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Inst.defineMethod('subtract',
function(aMatrix) {

    /**
     * @method subtract
     * @summary Changes the receiver by subtracting the supplied matrix and the
     *     receiver.
     * @param {TP.gui.Matrix} aMatrix The matrix to subtract from the receiver.
     * @returns {TP.gui.Matrix} The receiver.
     */

    var data,
        otherData;

    data = this.$get('data');
    otherData = aMatrix.$get('data');

    data.xx -= otherData.xx;
    data.xy -= otherData.xy;
    data.yx -= otherData.yx;
    data.yy -= otherData.yy;
    data.dx -= otherData.dx;
    data.dy -= otherData.dy;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Inst.defineMethod('transformPoint',
function(aPoint) {

    /**
     * @method transformPoint
     * @summary Uses the receiver to multiply the supplied TP.gui.Point,
     *     thereby transforming it.
     * @param {TP.gui.Point} aPoint The point to apply the receiver to.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Point} The transformed point.
     */

    var data,
        pointData,

        newPoint;

    if (TP.notValid(aPoint)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    data = this.$get('data');
    pointData = aPoint.$get('data');

    newPoint = TP.gui.Point.construct(
            data.xx * pointData.x + data.xy * pointData.y + data.dx,
            data.yx * pointData.x + data.yy * pointData.y + data.dy);

    return newPoint;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Inst.defineMethod('transformRect',
function(aRect) {

    /**
     * @method transformRect
     * @summary Uses the receiver to multiply the supplied TP.gui.Rect,
     *     thereby transforming it.
     * @param {TP.gui.Rect} aRect The rect to apply the receiver to.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Rect} The transformed rect.
     */

    var data,
        rectData,

        newRect;

    if (TP.notValid(aRect)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    data = this.$get('data');
    rectData = aRect.$get('data');

    //  Note here how we do *not* add the dx,dy to the width and height
    newRect = TP.gui.Rect.construct(
            data.xx * rectData.x + data.xy * rectData.y + data.dx,
            data.yx * rectData.x + data.yy * rectData.y + data.dy,
            data.xx * rectData.width + data.xy * rectData.height,
            data.yx * rectData.width + data.yy * rectData.height
            );

    return newRect;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Inst.defineMethod('translate',
function(diffX, diffY) {

    /**
     * @method translate
     * @summary Applies a translation transformation to the receiver.
     * @param {Number|TP.gui.Point} diffX The amount to move X coordinates or a
     *     TP.gui.Point to use for both X and Y amounts.
     * @param {Number} diffY The amount to move Y coordinates.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Matrix} The receiver.
     */

    var data;

    if (TP.notValid(diffX)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    data = this.$get('data');

    if (arguments.length === 1) {
        data.dx = diffX.get('x');
        data.dy = diffX.get('y');
    } else {
        data.dx = diffX;
        data.dy = diffY;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Matrix.Inst.defineMethod('transpose',
function() {

    /**
     * @method transpose
     * @summary Transposes the receiver.
     * @returns {TP.gui.Matrix} The receiver.
     */

    var data,
        newData;

    data = this.$get('data');

    newData = {
        xx: data.xx,
        xy: data.yx,
        yx: data.xy,
        yy: data.yy,
        dx: 0,
        dy: 0
    };

    this.$set('data', newData);

    return this;
});

//  ========================================================================
//  TP.gui.Color
//  ========================================================================

/**
 * @type {TP.gui.Color}
 * @summary A type that can manage color values. These values contain red,
 *     green, blue and alpha information.
 * @description This type can be produced by a String having one of the
 *     following nine formats: FFFFFF #FFFFFF FFF #FFF rgb(255, 255, 255)
 *     rgba(255, 255, 255, .5) hsl(120, 50%, 50%) hsla(120, 50%, 50%, .5)
 *     <aColorName>
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('gui.Color');

//  ------------------------------------------------------------------------

//  Note that we use apply here - otherwise, when TP.gui.Color's 'init'
//  method is called, it will incorrectly report 4 arguments even if there
//  is just 1.
TP.definePrimitive('cc',
function(r, g, b, a) {

    return TP.gui.Color.construct.apply(TP.gui.Color, arguments);
});

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.gui.Color.Type.defineMethod('fromString',
function(aString) {

    /**
     * @method fromString
     * @summary Converts a String containing a color to a TP.gui.Color object.
     * @description The supplied String can be in one of nine formats: FFFFFF
     *     #FFFFFF FFF #FFF rgb(255, 255, 255) rgba(255, 255, 255, .5) hsl(120,
     *     50%, 50%) hsla(120, 50%, 50%, .5) <aColorName>
     * @returns {TP.gui.Color} A TP.gui.Color having this color value
     *     expressed as RGB.
     */

    var newObj;

    //  All conditions passed, so construct a new instance of ourself.
    newObj = this.construct(aString);

    return newObj;
});

//  ------------------------------------------------------------------------

TP.gui.Color.Type.defineMethod('fromArray',
function(anObj) {

    /**
     * @method fromArray
     * @summary Returns an instance of this type as extracted from anObj, which
     *     should be an Array. This Array should be in the format of:
     *     [redNumber, greenNumber, blueNumber, alphaNumber]
     * @param {Number[]} anObj The Array that an instance of this type will be
     *     extracted from.
     * @returns {TP.gui.Color} An instance of this type as extracted from
     *     anObj.
     */

    var newObj;

    newObj = this.construct(anObj);

    return newObj;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.gui.Color.Inst.defineAttribute('data');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.gui.Color.Inst.defineMethod('init',
function(red, green, blue, alpha) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @param {Number|TP.gui.Color|Object|Array|String} red The red value of
     *     the receiver or a TP.gui.Color to copy or an object that has 'r',
     *     'g', 'b', and 'a' slots or an Array that has r in the first position,
     *     b in the second position, g in the third position and a in the last
     *     position.
     * @param {Number} green The green value of the receiver if 4 arguments are
     *     supplied or the alpha value if 2 arguments are supplied.
     * @param {Number} blue The blue value of the receiver, if 4 arguments are
     *     supplied.
     * @param {Number} alpha The alpha value of the receiver, if 4 arguments are
     *     supplied.
     * @returns {TP.gui.Color} The receiver.
     */

    var theData,
        newData;

    this.callNextMethod();

    if (TP.notEmpty(arguments)) {
        if (arguments.length <= 2) {
            //  Got handed one or two arguments. The first argument could
            //  be:
            //      a) another TP.gui.Color
            //      b) an Array with 3 or 4 values
            //      c) an Object that has 'r', 'g', 'b', and (maybe) 'a'
            //          slots

            theData = arguments[0];
            if (TP.isKindOf(theData, TP.gui.Color)) {
                theData = theData.$get('data');

                newData = {
                    r: theData.r,
                    g: theData.g,
                    b: theData.b,
                    a: theData.a
                };
            } else if (TP.isString(theData)) {
                if (TP.notValid(theData =
                                TP.colorStringAsArray(theData))) {
                    return;
                }

                newData = {
                    r: theData.at(0),
                    g: theData.at(1),
                    b: theData.at(2),
                    a: TP.ifInvalid(theData.at(3), 1.0).min(1).max(0)
                };
            } else if (TP.isArray(theData)) {
                newData = {
                    r: theData.at(0).min(255).max(0),
                    g: theData.at(1).min(255).max(0),
                    b: theData.at(2).min(255).max(0),
                    a: TP.ifInvalid(theData.at(3), 1.0).min(1).max(0)
                };
            } else {
                newData = {
                    r: theData.r,
                    g: theData.g,
                    b: theData.b,
                    a: theData.a
                };
            }

            //  If we were handed a second argument, it will be the opacity.
            if (arguments.length === 2) {
                newData.a = arguments[1].min(1).max(0);
            }
        } else {
            //  Got handed four Numbers.
            newData = {
                r: red.min(255).max(0),
                g: green.min(255).max(0),
                b: blue.min(255).max(0),
                a: TP.ifInvalid(alpha, 1.0).min(1).max(0)
            };
        }
    } else {
        //  Got nothing - set everything to 0.
        newData = {
            r: 0,
            g: 0,
            b: 0,
            a: 0
        };
    }

    this.$set('data', newData, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Color.Inst.defineMethod('add',
function(aColor) {

    /**
     * @method addColor
     * @summary Adds the supplied color to the receiver.
     * @param {TP.gui.Color} aColor The color to add to the receiver.
     * @returns {TP.gui.Color} The receiver.
     */

    var colorData,
        otherData;

    colorData = this.$get('data');
    otherData = aColor.$get('data');

    colorData.r = (colorData.r + otherData.r).min(255).max(0);
    colorData.g = (colorData.g + otherData.g).min(255).max(0);
    colorData.b = (colorData.b + otherData.b).min(255).max(0);
    colorData.a = colorData.a + otherData.a;

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Color.Inst.defineMethod('asArray',
function() {

    /**
     * @method asArray
     * @summary Returns the receiver as an Array of: [red, green, blue, alpha].
     * @returns {Number[]} An Array containing the color expressed in RGB values
     *     ([red, green, blue, alpha]).
     */

    var colorData;

    if (TP.notValid(colorData = this.$get('data'))) {
        return null;
    }

    return TP.ac(colorData.r, colorData.g, colorData.b, colorData.a);
});

//  ------------------------------------------------------------------------

TP.gui.Color.Inst.defineMethod('asDumpString',
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var repStr,
        str;

    str = '[' + TP.tname(this) + ' :: ';

    repStr = this.asRGBAString();

    str += repStr + ']';

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.Color.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    var data,
        str;

    data = this.$get('data');

    try {
        str = '<span class="TP_gui_Color">' +
                    '<span data-name="r">' + data.r + '</span>' +
                    '<span data-name="g">' + data.g + '</span>' +
                    '<span data-name="b">' + data.b + '</span>' +
                    '<span data-name="a">' + data.a + '</span>' +
                '</span>';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.Color.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var data;

    data = this.$get('data');

    return '{"type":' + TP.tname(this).quoted('"') + ',' +
             '"data":{' +
                 '"r":"' + data.r + '",' +
                 '"g":"' + data.g + '",' +
                 '"b":"' + data.b + '",' +
                 '"a":"' + data.a + '"' +
                 '}}';
});

//  ------------------------------------------------------------------------

TP.gui.Color.Inst.defineMethod('asRGBString',
function() {

    /**
     * @method asRGBString
     * @summary Returns the receiver as a CSS RGB String: rgb(red, green,
     *     blue).
     * @returns {String} A String containing the color expressed as a CSS RGB
     *     string.
     */

    var arrayVal;

    if (TP.notValid(arrayVal = this.asArray())) {
        return null;
    }

    //  Make sure to slice off any alpha value
    return 'rgb(' + arrayVal.slice(0, 3).asString() + ')';
});

//  ------------------------------------------------------------------------

TP.gui.Color.Inst.defineMethod('asRGBAString',
function() {

    /**
     * @method asRGBAString
     * @summary Returns the receiver as a CSS RGBA String: rgb(red, green,
     *     blue, alpha).
     * @returns {String} A String containing the color expressed as a CSS RGBA
     *     string.
     */

    var arrayVal;

    if (TP.notValid(arrayVal = this.asArray())) {
        return null;
    }

    return 'rgba(' + arrayVal.asString() + ')';
});

//  ------------------------------------------------------------------------

TP.gui.Color.Inst.defineMethod('asHexString',
function() {

    /**
     * @method asHexString
     * @summary Returns the receiver as a CSS hexadecimal String: #RRGGBB
     * @returns {String} A String containing the color expressed as a CSS hex
     *     string.
     */

    return TP.colorStringAsHex(this.asRGBString());
});

//  ------------------------------------------------------------------------

TP.gui.Color.Inst.defineMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns the receiver as a JavaScript source code string. This
     *     method is intended to provide a primitive form of serialization.
     * @returns {Object} An appropriate form for recreating the receiver.
     */

    return 'TP.gui.Color.from(\'' + this.asRGBAString() + '\')';
});

//  ------------------------------------------------------------------------

TP.gui.Color.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @method asString
     * @summary Returns the String representation of the receiver.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.gui.Color's String representation. This flag is ignored in
     *     this version of this method.
     * @returns {String} The String representation of the receiver.
     */

    return this.asRGBAString();
});

//  ------------------------------------------------------------------------

TP.gui.Color.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} The receiver's 'pretty print' String representation.
     */

    var data,
        str;

    data = this.$get('data');

    try {
        str = '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) + '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' +
                        this.getTypeName() +
                    '</dd>' +
                    '<dt class="pretty key">R</dt>' +
                    '<dd class="pretty value">' +
                        data.r +
                    '</dd>' +
                    '<dt class="pretty key">G</dt>' +
                    '<dd class="pretty value">' +
                        data.g +
                    '</dd>' +
                    '<dt class="pretty key">B</dt>' +
                    '<dd class="pretty value">' +
                        data.b +
                    '</dd>' +
                    '<dt class="pretty key">A</dt>' +
                    '<dd class="pretty value">' +
                        data.a +
                    '</dd>' +
                    '</dl>';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.Color.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    var data,
        str;

    data = this.$get('data');

    try {
        str = '<instance type="' + TP.tname(this) + '"' +
                ' r="' + data.r + '" g="' + data.g + '"' +
                ' b="' + data.b + '" a="' + data.a + '"' +
                 '/>';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.Color.Inst.defineMethod('blendToColor',
function(toColor, weight) {

    /**
     * @method blendColor
     * @summary Blends the supplied color with the receiver, according to the
     *     supplied weight and returns the result of that blend.
     * @param {TP.gui.Color} toColor The color to blend to starting at the
     *     receiver.
     * @param {Number} weight The weighting factor, a number between 0 and 1,
     *     that determines how much of the 'toColor' to blend into the receiver.
     * @returns {TP.gui.Color} The new color, after toColor has been blended
     *     with the receiver.
     */

    var balanceWeight,
        colorVal,
        colorAsNum,
        otherColorAsNum;

    if (TP.notValid(weight)) {
        balanceWeight = 0;
    } else {
        //  Make sure that balanceWeight is between 0 and 1.
        balanceWeight = weight.min(1).max(0);
    }

    colorAsNum = TP.colorStringAsLongNumber(this.asHexString());
    otherColorAsNum = TP.colorStringAsLongNumber(toColor.asHexString());

    colorVal = TP.longNumberAsColorString(
                        TP.colorValuesInterpolate(colorAsNum,
                                                    otherColorAsNum,
                                                    balanceWeight));

    return TP.gui.Color.construct(colorVal);
});

//  ------------------------------------------------------------------------

TP.gui.Color.Inst.defineMethod('copy',
function() {

    /**
     * @method copy
     * @summary Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver.
     * @returns {TP.gui.Color} A new TP.gui.Color which is a copy of the
     *     receiver.
     */

    return TP.gui.Color.construct(this);
});

//  ------------------------------------------------------------------------

TP.gui.Color.Inst.defineMethod('getAlpha',
function() {

    /**
     * @method getAlpha
     * @summary Returns the alpha component of the receiver.
     * @returns {Number} The alpha component of the receiver.
     */

    return this.$get('data').a;
});

//  ------------------------------------------------------------------------

TP.gui.Color.Inst.defineMethod('getBlue',
function() {

    /**
     * @method getBlue
     * @summary Returns the blue component of the receiver.
     * @returns {Number} The blue component of the receiver.
     */

    return this.$get('data').b;
});

//  ------------------------------------------------------------------------

TP.gui.Color.Inst.defineMethod('getGreen',
function() {

    /**
     * @method getGreen
     * @summary Returns the green component of the receiver.
     * @returns {Number} The green component of the receiver.
     */

    return this.$get('data').g;
});

//  ------------------------------------------------------------------------

TP.gui.Color.Inst.defineMethod('getRed',
function() {

    /**
     * @method getRed
     * @summary Returns the red component of the receiver.
     * @returns {Number} The red component of the receiver.
     */

    return this.$get('data').r;
});

//  ------------------------------------------------------------------------

TP.gui.Color.Inst.defineMethod('subtract',
function(aColor) {

    /**
     * @method subtract
     * @summary Subtracts the supplied color from the receiver.
     * @param {TP.gui.Color} aColor The color to subtract from the receiver.
     * @returns {TP.gui.Color} The receiver.
     */

    var colorData,
        otherData;

    colorData = this.$get('data');
    otherData = aColor.$get('data');

    colorData.r = (colorData.r - otherData.r).min(255).max(0);
    colorData.g = (colorData.g - otherData.g).min(255).max(0);
    colorData.b = (colorData.b - otherData.b).min(255).max(0);
    colorData.a = colorData.a - otherData.a;

    return this;
});

//  ========================================================================
//  TP.gui.Gradient
//  ========================================================================

/**
 * @type {TP.gui.Gradient}
 * @summary A type which models a progression of color values along a vector,
 *     either linear or radial.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('gui.Gradient');

//  TP.gui.Gradient is an abstract type.
TP.gui.Gradient.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  A RegExp that can separate a gradient angle value from gradient color
//  stop values in the following format:
//      'gradient-linear(deg, color stop, ...)'
TP.gui.Gradient.Type.defineConstant(
        'GRADIENT_LINEAR_REGEX',
        TP.rc('gradient-linear\\(\\s*(\\d+deg\\s*,)?\\s*(.+)\\s*\\)'));

TP.gui.Gradient.Type.defineConstant(
        'GRADIENT_RADIAL_REGEX',
        TP.rc('gradient-radial\\(\\s*(?:(\\S+? \\S+?)\\s*,){1}\\s*(.+)\\s*\\)'));

//  ------------------------------------------------------------------------

TP.gui.Gradient.Type.defineConstant('STYLE_DECLVALUE_PARSER',
function(aString) {

    /**
     * @method STYLE_DECLVALUE_PARSER
     * @summary Converts a String containing a gradient description to a
     *     TP.gui.Gradient object.
     * @description The supplied String can be in one of two formats:
     *     gradient-linear(angle, color stop, ...) gradient-radial(center-x
     *     center-y, color stop, ...)
     * @param {The} aString String definition to use to build a TP.gui.Gradient
     *     object from.
     * @returns {TP.gui.Gradient} A TP.gui.Gradient expressing the supplied
     *     gradient information.
     */

    var newObj,

        colorsAndStopsStr,
        colorsAndStops,

        angleAndColorStops,
        angle,

        centerPointAndColorStops,
        centerPoint;

    //  No need to do parameter check here. We wouldn't have gotten here if
    //  aString wasn't a String.

    newObj = null;

    if (/gradient-linear/.test(aString)) {
        //  Extract the color stops and the (optional) angle from the
        //  supplied String.
        angleAndColorStops = TP.gui.Gradient.GRADIENT_LINEAR_REGEX.exec(
                                    aString);

        if (TP.notValid(angleAndColorStops)) {
            return null;
        }

        //  The colors and stops part of the definition will be at the third
        //  place in the results.
        if (TP.isEmpty(colorsAndStopsStr = angleAndColorStops.at(2))) {
            return null;
        }

        //  Extract those into an Array
        colorsAndStops = TP.gui.Gradient.$extractColorsAndStops(
                                                colorsAndStopsStr);

        //  Invoke the constructor, supplying the colors and stops Array as
        //  the arguments to the constructor.
        newObj = TP.gui.LinearGradient.construct.apply(
                            TP.gui.LinearGradient, colorsAndStops);

        //  The gradient angle, if it was defined, will be at the second
        //  position in the results.
        if (TP.notEmpty(angle = angleAndColorStops.at(1)) &&
            !TP.isNaN(angle = parseFloat(angle))) {
            newObj.set('angle', angle);
        }
    } else if (/gradient-radial/.test(aString)) {
        //  Extract the color stops and the center point from the supplied
        //  String.
        centerPointAndColorStops =
                TP.gui.Gradient.GRADIENT_RADIAL_REGEX.exec(aString);

        if (TP.notValid(centerPointAndColorStops)) {
            return null;
        }

        //  The center point will be at the second position in the results.
        if (TP.isEmpty(centerPoint = centerPointAndColorStops.at(1))) {
            return null;
        }

        //  The colors and stops part of the definition will be at the third
        //  place in the results.
        if (TP.isEmpty(colorsAndStopsStr = centerPointAndColorStops.at(2))) {
            return null;
        }

        colorsAndStops = TP.gui.Gradient.$extractColorsAndStops(
                                                colorsAndStopsStr);

        //  Invoke the constructor, supplying the colors and stops Array as
        //  the arguments to the constructor.
        newObj = TP.gui.RadialGradient.construct.apply(
                                    TP.gui.RadialGradient, colorsAndStops);

        centerPoint = centerPoint.split(' ');

        //  Note here how when we initially set the 'fx' and 'fy' that
        //  they're the same as the 'cx' and 'cy', respectively. This is to
        //  comply with the SVG spec.
        newObj.set('cx', centerPoint.first());
        newObj.set('fx', centerPoint.first());

        newObj.set('cy', centerPoint.last());
        newObj.set('fy', centerPoint.last());
    }

    return newObj;
});

//  ------------------------------------------------------------------------

TP.gui.Gradient.addParser(TP.gui.Gradient.STYLE_DECLVALUE_PARSER);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.gui.Gradient.Type.defineMethod('$extractColorsAndStops',
function(aString) {

    /**
     * @method $extractColorsAndStops
     * @summary Extracts the color and stop values from the supplied String.
     * @param {String} aString The String to extract the color and stop values
     *     from.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Gradient} The receiver.
     */

    var colors,
        count,

        colorsAndStops;

    if (!TP.isString(aString)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    colors = TP.ac();

    count = 0;

    //  Find all of the color values, capture them into the 'colors' Array
    //  and replace them with '_<count>_'.
    colorsAndStops = aString.replace(
            TP.regex.CSS_COLOR_GLOBAL,
            function(wholeMatch) {

                colors.push(wholeMatch.trim());
                return wholeMatch.replace(/(\s*)(.+)(\s*)/,
                                            '$1_' + count++ + '_$3 ');
            });

    //  Make sure and trim off the last whitespace.
    colorsAndStops = colorsAndStops.trim();

    //  Split the remaining value along spaces (with an optional leading
    //  comma).
    colorsAndStops = colorsAndStops.split(/,* /);

    //  Convert the '_<count>_' values back into their respective color
    //  values by searching for them in the split-out Array.
    colorsAndStops = colorsAndStops.collect(
            function(item) {

                if (/_\d+_/.test(item)) {
                    return colors.at(parseInt(item.slice(1, -1), 10));
                }

                return item;
            });

    return colorsAndStops;
});

//  ------------------------------------------------------------------------

TP.gui.Gradient.Type.defineMethod('constructShadowGradient',
function(color, opacity) {

    /**
     * @method constructShadowGradient
     * @summary Constructs a gradient that uses the color to fade from the
     *     given opacity value to a 0 opacity.
     * @param {TP.gui.Color|Number|String} color A color value that can be
     *     represented as a TP.gui.Color.
     * @param {Number} opacity An opacity percentage value, given as a Number
     *     between 0.0 and 1.0.
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.Gradient} The receiver.
     */

    var opacityOffset,
        newGradient;

    if (TP.notValid(color)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    if (!TP.isNumber(opacity)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    opacityOffset = (opacity + 0.1).min(1.0);

    newGradient = this.construct(
                    0,
                    TP.gui.Color.construct(color, opacityOffset),
                    0.25,
                    TP.gui.Color.construct(color, opacity),
                    1,
                    TP.gui.Color.construct(color, 0));

    return newGradient;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.gui.Gradient.Inst.defineAttribute('colors');
TP.gui.Gradient.Inst.defineAttribute('stops');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.gui.Gradient.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.gui.Gradient} The receiver.
     */

    var colors,
        stops,

        i;

    this.callNextMethod();

    colors = TP.ac();
    stops = TP.ac();

    if (TP.notEmpty(arguments)) {
        for (i = 0; i < arguments.length; i += 2) {
            stops.push(arguments[i]);
            colors.push(TP.gui.Color.construct(arguments[i + 1]));
        }
    }

    this.set('colors', colors);
    this.set('stops', stops);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Gradient.Inst.defineMethod('addColorStop',
function(aStopValue, aColorValue) {

    /**
     * @method addColorStop
     * @summary Adds a 'color stop', a color value paired with a length,
     *     usually a number or percentage, denoting where that color should stop
     *     along the gradient vector.
     * @param {String} aStopValue A value denoting where the color should stop.
     * @param {TP.gui.Color|String} aColorValue A color value.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.gui.Gradient} The receiver.
     */

    var colorValue;

    if (!TP.isString(aStopValue)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    if (TP.notValid(aColorValue)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    this.get('stops').push(aStopValue);

    if (!TP.isKindOf(colorValue = aColorValue, TP.gui.Color)) {
        colorValue = TP.gui.Color.construct(aColorValue);
    }

    this.get('colors').push(colorValue);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Gradient.Inst.defineMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns the receiver as a JavaScript source code string. This
     *     method is intended to provide a primitive form of serialization.
     * @returns {Object} An appropriate form for recreating the receiver.
     */

    return 'TP.gui.Gradient.from(\'' + this.asString() + '\')';
});

//  ------------------------------------------------------------------------

TP.gui.Gradient.Inst.defineMethod('copy',
function() {

    /**
     * @method copy
     * @summary Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver.
     * @returns {TP.gui.Gradient} A new TP.gui.Gradient which is a copy of the
     *     receiver.
     */

    var newGradient;

    newGradient = this.construct();

    newGradient.set('colors', this.get('colors').copy());
    newGradient.set('stops', this.get('stops').copy());

    return newGradient;
});

//  ------------------------------------------------------------------------

TP.gui.Gradient.Inst.defineMethod('normalizeGradientValues',
function() {

    /**
     * @method normalizeGradientValues
     * @summary Normalizes the receiver's color stops so that there are a
     *     consistent number of stops that match the number of colors.
     * @returns {TP.gui.Gradient} The receiver.
     */

    var colors,
        stops,

        gradientColors,
        gradientStopValues,

        numStops;

    colors = this.get('colors');
    stops = this.get('stops');

    gradientColors = colors;

    //  If stop values for the gradient weren't explicitly provided,
    //  manufacture the stops.
    if (TP.isEmpty(gradientStopValues = stops)) {
        //  The number of stops that we'll manufacture here is equal to the
        //  number of colors minus 1.
        numStops = gradientColors.getSize() - 1;
        gradientStopValues = (1).to(numStops).collect(
            function(stopNum) {

                //  Compute the stop value by dividing the stop number by
                //  the total number of stops.

                /* eslint-disable no-extra-parens */
                return (stopNum / numStops);
                /* eslint-enable no-extra-parens */
            });

        //  Go ahead and prepend a '0' as the first stop value.
        gradientStopValues.unshift(0);
    } else {
        if (stops.getSize() !== colors.getSize()) {
            //  TODO: Raise an exception
            return;
        }

        //  Otherwise, make sure any '%'age numbers are converted to their
        //  decimal equivalent.
        gradientStopValues = stops.collect(
                                function(aStop) {

                                    if (/%/.test(aStop)) {
                                        return parseFloat(aStop) / 100;
                                    }

                                    return aStop;
                                });
    }

    this.set('colors', gradientColors);
    this.set('stops', gradientStopValues);

    return this;
});

//  ========================================================================
//  TP.gui.LinearGradient
//  ========================================================================

/**
 * @type {TP.gui.LinearGradient}
 * @summary A type that represents a 'linear gradient' - that is, a color
 *     transition that proceeds along an angle having one or more 'color stops'.
 */

//  ------------------------------------------------------------------------

TP.gui.Gradient.defineSubtype('LinearGradient');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.gui.LinearGradient.Inst.defineAttribute('angle');

TP.gui.LinearGradient.Inst.defineAttribute('x1');
TP.gui.LinearGradient.Inst.defineAttribute('y1');
TP.gui.LinearGradient.Inst.defineAttribute('x2');
TP.gui.LinearGradient.Inst.defineAttribute('y2');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.gui.LinearGradient.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.gui.LinearGradient} The receiver.
     */

    this.callNextMethod();

    //  This will default the x1,y1 x2,y2 values to something sensible.
    this.set('angle', TP.HORIZONTAL);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.LinearGradient.Inst.defineMethod('asDumpString',
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var arr,
        repStr,

        str;

    arr = TP.ac('gradient-linear(');

    //  If the angle isn't the default of 90, then include it in the String
    //  representation.
    if (this.get('angle') !== 90) {
        arr.push(this.get('angle'), ', ');
    }

    if (TP.notEmpty(this.get('stops'))) {

        //  Loop over the stops and push both a stop value and a color value
        //  onto the Array that we're building.
        this.get('stops').performWith(
            function(aStopValue, aColorValue) {

                arr.push(aStopValue, ' ', aColorValue.asString(), ' ');
            },
            this.get('colors'));

        //  Pop off the trailing whitespace
        arr.pop();
    }

    //  Close the rep
    arr.push(')');

    str = '[' + TP.tname(this) + ' :: ';

    repStr = arr.join('');

    str += repStr + ']';

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.LinearGradient.Inst.defineMethod('asGeckoCSSString',
function() {

    /**
     * @method asGeckoCSSString
     * @summary Returns the receiver as a String value that can be used in
     *     Gecko 1.9.2+ (FF 3.6+) browsers.
     * @returns {String} The Gecko CSS String representation of the receiver.
     */

    var arr;

    arr = TP.ac('-moz-linear-gradient(');

    //  Gecko allows us to set an 'angle' value directly.
    arr.push(this.get('angle'), 'deg, ');

    //  Loop over the stops and push both a stop value and a color value
    //  onto the Array that we're building.
    this.get('stops').performWith(
        function(aStopValue, aColorValue) {

            arr.push(aColorValue.asString(), ' ', aStopValue * 100, '%',
                        ', ');
        },
        this.get('colors'));

    //  Pop off the trailing comma & whitespace and push on a ')'.
    arr.pop();
    arr.push(')');

    return arr.join('');
});

//  ------------------------------------------------------------------------

TP.gui.LinearGradient.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    var str;

    try {
        str = '<span class="TP_gui_LinearGradient">' +
                '<span data-name="angle">' + this.get('angle') + '</span>';

        if (TP.notEmpty(this.get('stops'))) {

            //  Loop over the stops and push both a stop value and a color value
            //  onto the Array that we're building.
            this.get('stops').performWith(
                function(aStopValue, aColorValue) {

                    str +=
                         '<span data-name="stop">' +
                            '<span data-name="value">' +
                                aStopValue +
                            '</span>' +
                            '<span data-name="color">' +
                                TP.htmlstr(aColorValue) +
                            '</span>' +
                        '</span>';
                },
                this.get('colors'));
        }

        str += '</span>';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.LinearGradient.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var stops;

    stops = '';

    if (TP.notEmpty(this.get('stops'))) {

        //  Loop over the stops and push both a stop value and a color value
        //  onto the Array that we're building.
        this.get('stops').performWith(
            function(aStopValue, aColorValue) {

                stops +=
                     '{' +
                        '"value":"' + aStopValue + '",' +
                        '"color":' + TP.jsonsrc(aColorValue) +
                    '},';
            },
            this.get('colors'));

        stops = stops.slice(0, stops.getSize() - 1);
    }

    return '{"type":' + TP.tname(this).quoted('"') + ',' +
             '"data":{' +
                 '"angle":"' + this.get('angle') + '",' +
                 '"stops":[' + stops + ']' +
                 '}}';
});

//  ------------------------------------------------------------------------

TP.gui.LinearGradient.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} The receiver's 'pretty print' String representation.
     */

    var str;

    try {
        str = '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) + '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' +
                        this.getTypeName() +
                    '</dd>' +
                    '<dt class="pretty key">angle</dt>' +
                    '<dd class="pretty value">' +
                        this.get('angle') +
                    '</dd>';

        if (TP.notEmpty(this.get('stops'))) {

            //  Loop over the stops and push both a stop value and a color value
            //  onto the Array that we're building.
            this.get('stops').performWith(
                function(aStopValue, aColorValue) {

                    str +=
                        '<dt class="pretty key">stop</dt>' +
                        '<dd class="pretty value">' +
                        '<dl>' +
                            '<dt class="pretty key">value</dt>' +
                            '<dd class="pretty value">' + aStopValue + '</dd>' +
                            '<dt class="pretty key">color</dt>' +
                            '<dd class="pretty value">' +
                                TP.pretty(aColorValue) +
                            '</dd>' +
                        '</dl>' +
                        '</dd>';
                },
                this.get('colors'));
        }

        str += '</dl>';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.LinearGradient.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @method asString
     * @summary Returns the String representation of the receiver.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.gui.LinearGradient's String representation. This flag is
     *     ignored in this version of this method.
     * @returns {String} The String representation of the receiver.
     */

    var arr,
        repStr;

    arr = TP.ac('gradient-linear(');

    //  If the angle isn't the default of 90, then include it in the String
    //  representation.
    if (this.get('angle') !== 90) {
        arr.push(this.get('angle'), ', ');
    }

    if (TP.notEmpty(this.get('stops'))) {

        //  Loop over the stops and push both a stop value and a color value
        //  onto the Array that we're building.
        this.get('stops').performWith(
            function(aStopValue, aColorValue) {

                arr.push(aStopValue, ' ', aColorValue.asString(), ' ');
            },
            this.get('colors'));

        //  Pop off the trailing whitespace
        arr.pop();
    }

    //  Close the rep
    arr.push(')');

    repStr = arr.join('');

    return repStr;
});

//  ------------------------------------------------------------------------

TP.gui.LinearGradient.Inst.defineMethod('asWebkitCSSString',
function() {

    /**
     * @method asWebkitCSSString
     * @summary Returns the receiver as a String value that can be used in
     *     Webkit browsers.
     * @returns {String} The Webkit CSS String representation of the receiver.
     */

    var arr;

    arr = TP.ac('-webkit-gradient(linear ');

    //  For Webkit, the 'angle' value is limited to what can be computed by
    //  our setAngle() method.
    arr.push(this.get('x1'), ' ', this.get('y1'), ', ',
                this.get('x2'), ' ', this.get('y2'), ', ');

    //  Loop over the stops and push both a stop value and a color value
    //  onto the Array that we're building.
    this.get('stops').performWith(
        function(aStopValue, aColorValue) {

            arr.push('color-stop(', aStopValue, ', ',
                                    aColorValue.asString(), ')',
                        ', ');
        },
        this.get('colors'));

    //  Pop off the trailing comma & whitespace and push on a ')'.
    arr.pop();
    arr.push(')');

    return arr.join('');
});

//  ------------------------------------------------------------------------

TP.gui.LinearGradient.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    var str;

    try {
        str = '<instance type="' + TP.tname(this) + '"' +
                ' angle="' + this.get('angle') + '">';

        if (TP.notEmpty(this.get('stops'))) {

            //  Loop over the stops and push both a stop value and a color value
            //  onto the Array that we're building.
            this.get('stops').performWith(
                function(aStopValue, aColorValue) {

                    str +=
                         '<stop>' +
                            '<value>' + aStopValue + '</value>' +
                            '<color>' + TP.xmlstr(aColorValue) + '</color>' +
                        '</stop>';
                },
                this.get('colors'));
        }

        str += '</instance>';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.LinearGradient.Inst.defineMethod('setAngle',
function(anAngle) {

    /**
     * @method setAngle
     * @summary Sets the angle of the receiver.
     * @description For now, only the following discrete values are supported as
     *     the angle: 0, 45, 90, 135, 180, 225, 270, 315
     * @param {Number} anAngle The angle of the gradient.
     * @exception TP.sig.InvalidNumber
     * @returns {TP.gui.LinearGradient} The receiver.
     */

    var gradientAngle,

        x1,
        y1,
        x2,
        y2;

    //  If the anAngle is TP.HORIZONTAL, that means that the gradient angle
    //  will be 90 degrees.
    if (anAngle === TP.HORIZONTAL) {
        gradientAngle = 90;
    } else if (anAngle === TP.VERTICAL) {
        //  TP.VERTICAL is 0 degrees.
        gradientAngle = 0;
    } else {
        //  Otherwise, use the number supplied.
        gradientAngle = anAngle;
    }

    //  Note that we put the parameter check here so that the caller can use
    //  the TP.HORIZONTAL and TP.VERTICAL aliases.
    if (!TP.isNumber(gradientAngle)) {
        return this.raise('TP.sig.InvalidNumber');
    }

    //  Based on the gradient angle, we adjust x1, y1, x2, and y2
    //  appropriately.
    switch (gradientAngle) {
        case 0:

            x1 = '0%';
            y1 = '0%';
            x2 = '100%';
            y2 = '0%';

            break;

        case 45:

            x1 = '0%';
            y1 = '0%';
            x2 = '100%';
            y2 = '100%';

            break;

        case 90:

            x1 = '0%';
            y1 = '0%';
            x2 = '0%';
            y2 = '100%';

            break;

        case 135:

            x1 = '100%';
            y1 = '0%';
            x2 = '0%';
            y2 = '100%';

            break;

        case 180:

            x1 = '100%';
            y1 = '0%';
            x2 = '0%';
            y2 = '0%';

            break;

        case 225:

            x1 = '100%';
            y1 = '100%';
            x2 = '0%';
            y2 = '0%';

            break;

        case 270:

            x1 = '0%';
            y1 = '100%';
            x2 = '0%';
            y2 = '0%';

            break;

        case 315:

            x1 = '0%';
            y1 = '100%';
            x2 = '100%';
            y2 = '0%';

            break;

        default:
            break;
    }

    //  Note the use of the '$set' version here to avoid recursion right
    //  back into this method.
    this.$set('angle', gradientAngle);

    this.set('x1', x1);
    this.set('y1', y1);
    this.set('x2', x2);
    this.set('y2', y2);

    return this;
});

//  ========================================================================
//  TP.gui.RadialGradient
//  ========================================================================

/**
 * @type {TP.gui.RadialGradient}
 * @summary A type that represents a 'radial gradient' - that is, a color
 *     transition that radiates outward from a supplied center point along one
 *     or more 'color stops'.
 */

//  ------------------------------------------------------------------------

TP.gui.Gradient.defineSubtype('RadialGradient');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.gui.RadialGradient.Inst.defineAttribute('cx');
TP.gui.RadialGradient.Inst.defineAttribute('cy');
TP.gui.RadialGradient.Inst.defineAttribute('radius');
TP.gui.RadialGradient.Inst.defineAttribute('fx');
TP.gui.RadialGradient.Inst.defineAttribute('fy');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.gui.RadialGradient.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.gui.RadialGradient} The receiver.
     */

    this.callNextMethod();

    //  Default these to something sensible.

    //  Default these to 50%, as per the SVG spec.
    this.set('cx', '50%');
    this.set('cy', '50%');
    this.set('radius', '50%');

    //  These default to the same value as cx, cy unless specified, as per
    //  the SVG spec.
    this.set('fx', '50%');
    this.set('fy', '50%');

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.RadialGradient.Inst.defineMethod('asDumpString',
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var arr,
        repStr,

        str;

    arr = TP.ac('gradient-radial(');

    arr.push(this.get('cx'), ' ', this.get('cy'));

    if (TP.notEmpty(this.get('stops'))) {

        //  Push a comma (',') before pushing the stops
        arr.push(', ');

        //  Loop over the stops and push both a stop value and a color value
        //  onto the Array that we're building.
        this.get('stops').performWith(
            function(aStopValue, aColorValue) {

                arr.push(aStopValue, ' ', aColorValue.asString(), ' ');
            },
            this.get('colors'));

        //  Pop off the trailing whitespace
        arr.pop();
    }

    //  Close the rep
    arr.push(')');

    str = '[' + TP.tname(this) + ' :: ';

    repStr = arr.join('');

    str += repStr + ']';

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.RadialGradient.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    var stops;

    stops = '';

    if (TP.notEmpty(this.get('stops'))) {

        //  Loop over the stops and push both a stop value and a color value
        //  onto the Array that we're building.
        this.get('stops').performWith(
            function(aStopValue, aColorValue) {

                stops +=
                     '{' +
                        '"value":"' + aStopValue + '",' +
                        '"color":' + TP.jsonsrc(aColorValue) +
                    '},';
            },
            this.get('colors'));

        stops = stops.slice(0, stops.getSize() - 1);
    }

    return '{"type":' + TP.tname(this).quoted('"') + ',' +
             '"data":{' +
                 '"cx":"' + this.get('cx') + '",' +
                 '"cy":"' + this.get('cy') + '",' +
                 '"stops":[' + stops + ']' +
                 '}}';
});

//  ------------------------------------------------------------------------

TP.gui.RadialGradient.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    var str;

    try {
        str = '<span class="TP_gui_RadialGradient">' +
                '<span data-name="cx">' + this.get('cx') + '</span>' +
                '<span data-name="cy">' + this.get('cy') + '</span>';

        if (TP.notEmpty(this.get('stops'))) {

            //  Loop over the stops and push both a stop value and a color value
            //  onto the Array that we're building.
            this.get('stops').performWith(
                function(aStopValue, aColorValue) {

                    str +=
                         '<span data-name="stop">' +
                            '<span data-name="value">' +
                                aStopValue +
                            '</span>' +
                            '<span data-name="color">' +
                                TP.htmlstr(aColorValue) +
                            '</span>' +
                        '</span>';
                },
                this.get('colors'));
        }

        str += '</span>';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.RadialGradient.Inst.defineMethod('asGeckoCSSString',
function() {

    /**
     * @method asGeckoCSSString
     * @summary Returns the receiver as a String value that can be used in
     *     Gecko 1.9.2+ (FF 3.6+) browsers.
     * @returns {String} The Gecko CSS String representation of the receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.gui.RadialGradient.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} The receiver's 'pretty print' String representation.
     */

    var str;

    try {
        str = '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) + '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' +
                        this.getTypeName() +
                    '</dd>' +
                    '<dt class="pretty key">cx</dt>' +
                    '<dd class="pretty value">' +
                        this.get('cx') +
                    '</dd>' +
                    '<dt class="pretty key">cy</dt>' +
                    '<dd class="pretty value">' +
                        this.get('cy') +
                    '</dd>';

        if (TP.notEmpty(this.get('stops'))) {

            //  Loop over the stops and push both a stop value and a color value
            //  onto the Array that we're building.
            this.get('stops').performWith(
                function(aStopValue, aColorValue) {

                    str +=
                        '<dt class="pretty key">stop</dt>' +
                        '<dd class="pretty value">' +
                        '<dl>' +
                            '<dt class="pretty key">value</dt>' +
                            '<dd class="pretty value">' + aStopValue + '</dd>' +
                            '<dt class="pretty key">color</dt>' +
                            '<dd class="pretty value">' +
                                TP.pretty(aColorValue) +
                            '</dd>' +
                        '</dl>' +
                        '</dd>';
                },
                this.get('colors'));
        }

        str += '</dl>';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.RadialGradient.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @method asString
     * @summary Returns the String representation of the receiver.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.gui.RadialGradient's String representation. This flag is
     *     ignored in this version of this method.
     * @returns {String} The String representation of the receiver.
     */

    var arr,
        repStr;

    arr = TP.ac('gradient-radial(');

    arr.push(this.get('cx'), ' ', this.get('cy'));

    if (TP.notEmpty(this.get('stops'))) {

        //  Push a comma (',') before pushing the stops
        arr.push(', ');

        //  Loop over the stops and push both a stop value and a color value
        //  onto the Array that we're building.
        this.get('stops').performWith(
            function(aStopValue, aColorValue) {

                arr.push(aStopValue, ' ', aColorValue.asString(), ' ');
            },
            this.get('colors'));

        //  Pop off the trailing whitespace
        arr.pop();
    }

    //  Close the rep
    arr.push(')');

    repStr = arr.join('');

    return repStr;
});

//  ------------------------------------------------------------------------

TP.gui.RadialGradient.Inst.defineMethod('asWebkitCSSString',
function() {

    /**
     * @method asWebkitCSSString
     * @summary Returns the receiver as a String value that can be used in
     *     Webkit browsers.
     * @returns {String} The Webkit CSS String representation of the receiver.
     */

    return TP.todo();
});

//  ------------------------------------------------------------------------

TP.gui.RadialGradient.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    var str;

    try {
        str = '<instance type="' + TP.tname(this) + '"' +
                ' cx="' + this.get('cx') + '"' +
                ' cy="' + this.get('cy') + '">';

        if (TP.notEmpty(this.get('stops'))) {

            //  Loop over the stops and push both a stop value and a color value
            //  onto the Array that we're building.
            this.get('stops').performWith(
                function(aStopValue, aColorValue) {

                    str +=
                         '<stop>' +
                            '<value>' + aStopValue + '</value>' +
                            '<color>' + TP.xmlstr(aColorValue) + '</color>' +
                        '</stop>';
                },
                this.get('colors'));
        }

        str += '</instance>';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ========================================================================
//  TP.gui.Pattern
//  ========================================================================

/**
 * @type {TP.gui.Pattern}
 * @summary A type that can manage patterns (i.e. a repeatable image within a
 *     particular boundary).
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('gui.Pattern');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  A RegExp that can construct a TP.gui.Pattern from
//  'pattern(url(...), x, y, width, height)'
TP.gui.Pattern.Type.defineConstant(
        'PATTERN_REGEX',
        TP.rc('pattern\\(url\\((.+?)\\)\\s*,\\s*(.+?)\\s*,\\s*(.+?)\\s*,\\s*(.+?)\\s*,\\s*(.+?)\\s*\\)'));

//  ------------------------------------------------------------------------

TP.gui.Pattern.Type.defineConstant('STYLE_DECLVALUE_PARSER',
function(aString) {

    /**
     * @method STYLE_DECLVALUE_PARSER
     * @summary Converts a String containing a matrix description to a
     *     TP.gui.Pattern object.
     * @description The supplied String can be in the following format:
     *     pattern(url(...), rect(...))
     * @param {The} aString String definition to use to build a TP.gui.Pattern
     *     object from.
     * @returns {TP.gui.Pattern} A TP.gui.Pattern expressing the supplied
     *     gradient information.
     */

    var newObj,

        results,

        url,

        x,
        y,

        width,
        height;

    //  No need to do parameter check here. We wouldn't have gotten here if
    //  aString wasn't a String.

    newObj = null;

    //  Extract pattern info from the supplied String.
    if (TP.isArray(results = TP.gui.Pattern.PATTERN_REGEX.exec(aString))) {
        //  The url will be at the first position.
        if (TP.notEmpty(url = results.at(1))) {
            //  If the author enclosed it in quotes, strip them off.
            url = url.stripEnclosingQuotes();
        }

        //  Grab the rest of the parameters.
        x = results.at(2);
        y = results.at(3);
        width = results.at(4);
        height = results.at(5);

        //  Make sure that none of the parameters are empty.
        if (TP.isEmpty(url) ||
            TP.isEmpty(x) || TP.isEmpty(y) ||
            TP.isEmpty(width) || TP.isEmpty(height)) {
            return null;
        }

        //  Allocate and initialize the new instance.

        newObj = TP.gui.Pattern.construct();

        newObj.set('uri', TP.uc(url));

        newObj.set('x', x);
        newObj.set('y', y);
        newObj.set('width', width);
        newObj.set('height', height);
    }

    return newObj;
});

//  ------------------------------------------------------------------------

TP.gui.Pattern.addParser(TP.gui.Pattern.STYLE_DECLVALUE_PARSER);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.gui.Pattern.Inst.defineAttribute('uri');

TP.gui.Pattern.Inst.defineAttribute('x');
TP.gui.Pattern.Inst.defineAttribute('y');
TP.gui.Pattern.Inst.defineAttribute('width');
TP.gui.Pattern.Inst.defineAttribute('height');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.gui.Pattern.Inst.defineMethod('asDumpString',
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var arr,
        repStr,

        str;

    arr = TP.ac('pattern(');

    arr.push('url(', this.get('uri'), '), ',
                this.get('x'), ', ',
                this.get('y'), ', ',
                this.get('width'), ', ',
                this.get('height'));

    //  Push on a ')'.
    arr.push(')');

    str = '[' + TP.tname(this) + ' :: ';

    repStr = arr.join('');

    str += repStr + ']';

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.Pattern.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    var str;

    try {
        str = '<span class="TP_gui_Pattern">' +
                '<span data-name="x">' + this.get('x') + '</span>' +
                '<span data-name="y">' + this.get('y') + '</span>' +
                '<span data-name="width">' + this.get('width') + '</span>' +
                '<span data-name="height">' + this.get('height') + '</span>' +
                '<span data-name="url">' + this.get('url') + '</span>' +
            '</span>';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.Pattern.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    return '{"type":' + TP.tname(this).quoted('"') + ',' +
             '"data":{' +
                 '"x":"' + this.get('x') + '",' +
                 '"y":"' + this.get('y') + '",' +
                 '"width":"' + this.get('width') + '",' +
                 '"height":"' + this.get('height') + '",' +
                 '"url":"' + this.get('uri') + '"' +
                 '}}';
});

//  ------------------------------------------------------------------------

TP.gui.Pattern.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} The receiver's 'pretty print' String representation.
     */

    var str;

    try {
        str = '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) + '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' +
                        this.getTypeName() +
                    '</dd>' +
                    '<dt class="pretty key">x</dt>' +
                    '<dd class="pretty value">' +
                        this.get('x') +
                    '</dd>' +
                    '<dt class="pretty key">y</dt>' +
                    '<dd class="pretty value">' +
                        this.get('y') +
                    '</dd>' +
                    '<dt class="pretty key">width</dt>' +
                    '<dd class="pretty value">' +
                        this.get('width') +
                    '</dd>' +
                    '<dt class="pretty key">height</dt>' +
                    '<dd class="pretty value">' +
                        this.get('height') +
                    '</dd>' +
                    '<dt class="pretty key">url</dt>' +
                    '<dd class="pretty value">' +
                        this.get('uri') +
                    '</dd>' +
                    '</dl>';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.Pattern.Inst.defineMethod('asSource',
function() {

    /**
     * @method asSource
     * @summary Returns the receiver as a JavaScript source code string. This
     *     method is intended to provide a primitive form of serialization.
     * @returns {Object} An appropriate form for recreating the receiver.
     */

    return 'TP.gui.Pattern.from(\'' + this.asString() + '\')';
});

//  ------------------------------------------------------------------------

TP.gui.Pattern.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @method asString
     * @summary Returns the String representation of the receiver.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.gui.Pattern's String representation. This flag is ignored
     *     in this version of this method.
     * @returns {String} The String representation of the receiver.
     */

    var arr,
        repStr;

    arr = TP.ac('pattern(');

    arr.push('url(', this.get('uri'), '), ',
                this.get('x'), ', ',
                this.get('y'), ', ',
                this.get('width'), ', ',
                this.get('height'));

    //  Push on a ')'.
    arr.push(')');

    repStr = arr.join('');

    return repStr;
});

//  ------------------------------------------------------------------------

TP.gui.Pattern.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    var str;

    try {
        str = '<instance type="' + TP.tname(this) + '"' +
                ' x="' + this.get('x') + '" y="' + this.get('y') + '"' +
                ' width="' + this.get('width') +
                '" height="' + this.get('height') + '"' +
                '>';

        str += '<url>' + TP.xmlstr(this.get('uri')) + '</url>';

        str += '</instance>';
    } catch (e) {
        str = this.toString();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.Pattern.Inst.defineMethod('copy',
function() {

    /**
     * @method copy
     * @summary Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver.
     * @returns {TP.gui.Pattern} A new TP.gui.Pattern which is a copy of the
     *     receiver.
     */

    var newPattern;

    newPattern = TP.gui.Pattern.construct();

    newPattern.set('uri', TP.uc(this.get('uri')));

    newPattern.set('x', this.get('x'));
    newPattern.set('y', this.get('y'));
    newPattern.set('width', this.get('width'));
    newPattern.set('height', this.get('height'));

    return newPattern;
});

//  ------------------------------------------------------------------------

TP.gui.Pattern.Inst.defineMethod('getURI',
function() {

    /**
     * @method getURI
     * @summary Returns the location of the internally stored URI.
     * @returns {String} The location of the pattern's URI.
     */

    //  Return the 'fully expanded' version of the URI.
    return this.$get('uri').getLocation();
});

//  ========================================================================
//  TP.gui.Path
//  ========================================================================

/**
 * @type {TP.gui.Path}
 * @summary A type that can manage an arbitrarily complex set of points.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('gui.Path');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.gui.Path.Type.defineConstant('MOVE_TO_ABS', 0);
TP.gui.Path.Type.defineConstant('LINE_TO_ABS', 1);
TP.gui.Path.Type.defineConstant('HORIZ_LINE_TO_ABS', 2);
TP.gui.Path.Type.defineConstant('VERT_LINE_TO_ABS', 3);
TP.gui.Path.Type.defineConstant('CURVE_TO_ABS', 4);
TP.gui.Path.Type.defineConstant('SMOOTH_CURVE_TO_ABS', 5);
TP.gui.Path.Type.defineConstant('QUAD_CURVE_TO_ABS', 6);
TP.gui.Path.Type.defineConstant('QUAD_SMOOTH_CURVE_TO_ABS', 7);
TP.gui.Path.Type.defineConstant('ARC_TO_ABS', 8);
TP.gui.Path.Type.defineConstant('CLOSE_PATH_ABS', 9);

TP.gui.Path.Type.defineConstant('MOVE_TO_REL', 10);
TP.gui.Path.Type.defineConstant('LINE_TO_REL', 11);
TP.gui.Path.Type.defineConstant('HORIZ_LINE_TO_REL', 12);
TP.gui.Path.Type.defineConstant('VERT_LINE_TO_REL', 13);
TP.gui.Path.Type.defineConstant('CURVE_TO_REL', 14);
TP.gui.Path.Type.defineConstant('SMOOTH_CURVE_TO_REL', 15);
TP.gui.Path.Type.defineConstant('QUAD_CURVE_TO_REL', 16);
TP.gui.Path.Type.defineConstant('QUAD_SMOOTH_CURVE_TO_REL', 17);
TP.gui.Path.Type.defineConstant('ARC_TO_REL', 18);
TP.gui.Path.Type.defineConstant('CLOSE_PATH_REL', 19);

//  Subtypes should redefine this.
TP.gui.Path.Type.defineConstant('SEGMENT_INFO', TP.hc());

//  Subtypes should redefine this.
TP.gui.Path.Type.defineConstant('PATH_SPLITUP_REGEX', TP.rc('.+', 'g'));

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.gui.Path.Inst.defineAttribute('pathSegments');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.gui.Path.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initialize the instance.
     * @returns {TP.gui.Path} A new instance.
     */

    this.set('pathSegments', TP.ac());

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Path.Inst.defineMethod('addSegment',
function(segmentOpConstant, segmentArgs) {

    /**
     * @method addSegment
     * @summary Adds a segment to the path, using the supplied operator
     *     constant and segmentArgs Array.
     * @param {String} segmentOpConstant A constant that denotes the operator of
     *     the path segment. This should be one of the constant values defined
     *     in this type's SEGMENT_INFO hash.
     * @param {Array<Number|Boolean|Array|TP.gui.Point>} segmentArgs An Array of
     *     Numbers, Booleans, Arrays or TP.gui.Points that contain the segment
     *     arguments.
     * @returns {TP.gui.Path} The receiver.
     */

    var segmentInfo,
        segmentOperator,
        segmentNumArgs,

        suppliedArgs;

    if (TP.isValid(segmentInfo = this.getType().at(
                                    'SEGMENT_INFO').at(segmentOpConstant))) {
        segmentOperator = segmentInfo.first();
        segmentNumArgs = segmentInfo.last();

        //  Make sure that the operands are supplied as numbers.
        suppliedArgs = this.operandsAsNumbers(segmentArgs);

        if (suppliedArgs.getSize() !== segmentNumArgs) {
            //  TODO: Raise an exception here?
            return this;
        }

        this.get('pathSegments').push(segmentOperator, suppliedArgs);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Path.Inst.defineMethod('operandsAsNumbers',
function(operandsArray) {

    /**
     * @method operandsAsNumbers
     * @summary Converts the supplied Array of operands (each of which can be a
     *     Number, a Boolean, an Array or a TP.gui.Point), into a Number
     *     sequence suitable for use in a segment.
     * @param {Object[]} operandsArray An Array of objects to convert.
     * @returns {Number[]} An Array of Numbers.
     */

    var i,

        convertedOperands,
        operand;

    convertedOperands = TP.ac();

    for (i = 0; i < operandsArray.getSize(); i++) {
        operand = operandsArray.at(i);

        if (TP.isNumber(operand)) {
            convertedOperands.push(operand);
        } else if (TP.isBoolean(operand)) {
            if (operand) {
                convertedOperands.push(1);
            } else {
                convertedOperands.push(0);
            }
        } else if (TP.isArray(operand)) {
            convertedOperands.addAll(this.operandsAsNumbers(operand));
        } else if (operand.getType() === TP.gui.Point) {
            convertedOperands.push(operand.get('x'), operand.get('y'));
        }
    }

    return convertedOperands;
});

//  ------------------------------------------------------------------------

TP.gui.Path.Inst.defineMethod('deleteSegment',
function(segmentOpConstant, occurrenceCount) {

    /**
     * @method deleteSegment
     * @summary Deletes a segment from the path, using the supplied operator
     *     constant and occurrence of the segment's operator.
     * @param {String} segmentOpConstant A constant that denotes the operator of
     *     the path segment. This should be one of the constant values defined
     *     in this type's SEGMENT_INFO hash.
     * @param {Number} occurrenceCount The occurrence of the particular operator
     *     that should be removed from the path. E.g. 'The 3rd MOVETO'.
     * @returns {TP.gui.Path} The receiver.
     */

    var segmentInfo,
        segmentOperator,

        index;

    if (TP.isValid(segmentInfo = this.getType().at(
                                    'SEGMENT_INFO').at(segmentOpConstant))) {
        segmentOperator = segmentInfo.first();

        index = this.getSegmentIndex(segmentOperator, occurrenceCount);

        if (index > -1) {
            this.get('pathSegments').splice(index, 2);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Path.Inst.defineMethod('asDumpString',
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var repStr,
        str;

    //  NB: Because of the interesting way that Array's 'toString'
    //  implementation works, the following path, stored internally as:
    //      ['M', [10, 10]]
    //  will be output when joined by a space (' ') as:
    //      'M 10,10'
    //  which is exactly what we want.

    str = '[' + TP.tname(this) + ' :: ';

    repStr = this.get('pathSegments').join(' ');

    str += repStr + ']';

    return str;
});

//  ------------------------------------------------------------------------

TP.gui.Path.Inst.defineMethod('asHTMLString',
function() {

    /**
     * @method asHTMLString
     * @summary Produces an HTML string representation of the receiver.
     * @returns {String} The receiver in HTML string format.
     */

    return '<span class="TP_gui_Pattern">' +
                TP.htmlstr(this.get('pathSegments')) +
            '</span>';
});

//  ------------------------------------------------------------------------

TP.gui.Path.Inst.defineMethod('asJSONSource',
function() {

    /**
     * @method asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    return '{"type":' + TP.tname(this).quoted('"') + ',' +
             '"data":{' +
                 '"segments":' + TP.jsonsrc(this.get('pathSegments')) +
                 '}}';
});

//  ------------------------------------------------------------------------

TP.gui.Path.Inst.defineMethod('asPrettyString',
function() {

    /**
     * @method asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    return '<dl class="pretty ' + TP.escapeTypeName(TP.tname(this)) + '">' +
                    '<dt>Type name</dt>' +
                    '<dd class="pretty typename">' +
                        this.getTypeName() +
                    '</dd>' +
                    '<dt class="pretty key">Segments</dt>' +
                    '<dd class="pretty value">' +
                        TP.pretty(this.asString()) +
                    '</dd>' +
                    '</dl>';
});

//  ------------------------------------------------------------------------

TP.gui.Path.Inst.defineMethod('asString',
function(verbose) {

    /**
     * @method asString
     * @summary Returns a String representation of the receiver.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the TP.gui.Path's String representation. The default is true.
     * @returns {String} The receiver's String representation.
     */

    var repStr;

    //  NB: Because of the interesting way that Array's 'toString'
    //  implementation works, the following path, stored internally as:
    //      ['M', [10, 10]]
    //  will be output when joined by a space (' ') as:
    //      'M 10,10'
    //  which is exactly what we want.

    repStr = this.get('pathSegments').join(' ');

    return repStr;
});

//  ------------------------------------------------------------------------

TP.gui.Path.Inst.defineMethod('asXMLString',
function() {

    /**
     * @method asXMLString
     * @summary Produces an XML string representation of the receiver.
     * @returns {String} The receiver in XML string format.
     */

    return '<instance type="' + TP.tname(this) + '">' +
                    TP.xmlstr(this.asString()) +
                    '</instance>';
});

//  ------------------------------------------------------------------------

TP.gui.Path.Inst.defineMethod('getSegment',
function(segmentOpConstant, occurrenceCount) {

    /**
     * @method getSegment
     * @summary Retrieves a segment from the path, using the supplied operator
     *     constant and occurrence of the segment's operator.
     * @param {String} segmentOpConstant A constant that denotes the operator of
     *     the path segment. This should be one of the constant values defined
     *     in this type's SEGMENT_INFO hash.
     * @param {Number} occurrenceCount The occurrence of the particular operator
     *     that should be obtained from the path. E.g. 'The 3rd MOVETO'.
     * @returns {Array<String,Number[]>} An Array containing the desired segment
     *     in the following format: [operator, [operand, operand]].
     */

    var segmentInfo,
        segmentOperator,

        index,
        path;

    if (TP.isValid(segmentInfo = this.getType().at(
                                    'SEGMENT_INFO').at(segmentOpConstant))) {
        segmentOperator = segmentInfo.first();

        index = this.getSegmentIndex(segmentOperator, occurrenceCount);

        if (index > -1) {
            path = this.get('pathSegments');

            return TP.ac(path.at(index), path.at(index + 1));
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.gui.Path.Inst.defineMethod('getSegmentIndex',
function(segmentOpConstant, occurrenceCount) {

    /**
     * @method getSegmentIndex
     * @summary Retrieves a segment's index from the path, using the supplied
     *     operator constant and occurrence of the segment's operator.
     * @param {String} segmentOpConstant A constant that denotes the operator of
     *     the path segment. This should be one of the constant values defined
     *     in this type's SEGMENT_INFO hash.
     * @param {Number} occurrenceCount The occurrence of the particular operator
     *     that should be obtained from the path. E.g. 'The 3rd MOVETO'.
     * @returns {Number} The index of the segment in the path.
     */

    var path,

        theOccurrenceCount,
        count,

        i;

    path = this.get('pathSegments');

    theOccurrenceCount = TP.ifInvalid(occurrenceCount, 1);

    count = 0;

    //  Note here the increment of the path by 2 - we're skipping over the
    //  arguments arrays and just looking at the operator.
    for (i = 0; i < path.getSize(); i += 2) {
        if (path.at(i) === segmentOpConstant) {
            count++;

            if (count === theOccurrenceCount) {
                return i;
            }
        }
    }

    return -1;
});

//  ------------------------------------------------------------------------

TP.gui.Path.Inst.defineMethod('insertSegment',
function(segmentOpConstant, segmentArgs, insPointSegmentConstant,
         occurrenceCount) {

    /**
     * @method insertSegment
     * @summary Inserts a segment into the path, using the supplied operator
     *     constant and segmentArgs Array. This segment will be inserted before
     *     the 'occurrenceCount' occurrence of the insertion point segment
     *     constant.
     * @param {String} segmentOpConstant A constant that denotes the operator of
     *     the path segment. This should be one of the constant values defined
     *     in this type's SEGMENT_INFO hash.
     * @param {Array<Number|Boolean|Array|TP.gui.Point>} segmentArgs An Array of
     *     Numbers, Booleans, Arrays or TP.gui.Points that contain the segment
     *     arguments.
     * @param {String} insPointSegmentConstant A constant that denotes the
     *     operator of the insertion point path segment. This should be one of
     *     the constant values defined in this type's SEGMENT_INFO hash.
     * @param {Number} occurrenceCount The occurrence of the particular operator
     *     that should be the insertion point from the path. E.g. 'The 3rd
     *     MOVETO'.
     * @returns {TP.gui.Path} The receiver.
     */

    var segmentInfo,
        insPointSegmentInfo,

        segmentOperator,
        segmentNumArgs,

        suppliedArgs,

        insPointSegmentOperator,

        index;

    if (TP.isValid(segmentInfo = this.getType().at(
                            'SEGMENT_INFO').at(segmentOpConstant)) &&
        TP.isValid(insPointSegmentInfo = this.getType().at(
                            'SEGMENT_INFO').at(insPointSegmentConstant))) {
        segmentOperator = segmentInfo.first();
        segmentNumArgs = segmentInfo.last();

        //  Make sure that the operands are supplied as numbers.
        suppliedArgs = this.operandsAsNumbers(segmentArgs);

        if (suppliedArgs.getSize() !== segmentNumArgs) {
            //  TODO: Raise an exception here?
            return this;
        }

        insPointSegmentOperator = insPointSegmentInfo.first();

        index = this.getSegmentIndex(insPointSegmentOperator,
                                        occurrenceCount);

        if (index > -1) {

            //  Splice in at 'index', removing 0, and inserting the segment
            //  operator and arguments.
            this.get('pathSegments').splice(index,
                                            0,
                                            segmentOperator,
                                            suppliedArgs);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Path.Inst.defineMethod('updateSegment',
function(segmentOpConstant, segmentArgs, occurrenceCount) {

    /**
     * @method updateSegment
     * @summary Updates a segment in the path, using the supplied operator
     *     constant and segmentArgs Array.
     * @param {String} segmentOpConstant A constant that denotes the operator of
     *     the path segment. This should be one of the constant values defined
     *     in this type's SEGMENT_INFO hash.
     * @param {Array<Number|Boolean|Array|TP.gui.Point>} segmentArgs An Array of
     *     Numbers, Booleans, Arrays or TP.gui.Points that contain the segment
     *     arguments.
     * @param {Number} occurrenceCount The occurrence of the particular operator
     *     that should be obtained from the path. E.g. 'The 3rd MOVETO'.
     * @returns {TP.gui.Path} The receiver.
     */

    var segmentInfo,
        segmentOperator,
        segmentNumArgs,

        suppliedArgs,

        index,
        path;

    if (TP.isValid(segmentInfo = this.getType().at(
                                    'SEGMENT_INFO').at(segmentOpConstant))) {
        segmentOperator = segmentInfo.first();
        segmentNumArgs = segmentInfo.last();

        //  Make sure that the operands are supplied as numbers.
        suppliedArgs = this.operandsAsNumbers(segmentArgs);

        if (suppliedArgs.getSize() !== segmentNumArgs) {
            //  TODO: Raise an exception here?
            return this;
        }

        index = this.getSegmentIndex(segmentOperator, occurrenceCount);

        if (index > -1) {
            path = this.get('pathSegments');

            path.atPut(index, segmentOperator);
            path.atPut(index + 1, suppliedArgs);
        }
    }

    return this;
});

//  ========================================================================
//  TP.gui.SVGPath
//  ========================================================================

/**
 * @summary A subtype of TP.gui.Path that can manage SVG paths.
 */

//  ------------------------------------------------------------------------

TP.gui.Path.defineSubtype('SVGPath');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.gui.SVGPath.Type.defineConstant('SEGMENT_INFO',
    TP.hc(
        TP.gui.Path.MOVE_TO_ABS, TP.ac('M', 2),
        TP.gui.Path.LINE_TO_ABS, TP.ac('L', 2),
        TP.gui.Path.HORIZ_LINE_TO_ABS, TP.ac('H', 1),
        TP.gui.Path.VERT_LINE_TO_ABS, TP.ac('V', 1),
        TP.gui.Path.CURVE_TO_ABS, TP.ac('C', 6),
        TP.gui.Path.SMOOTH_CURVE_TO_ABS, TP.ac('S', 4),
        TP.gui.Path.QUAD_CURVE_TO_ABS, TP.ac('Q', 4),
        TP.gui.Path.QUAD_SMOOTH_CURVE_TO_ABS, TP.ac('T', 2),
        TP.gui.Path.ARC_TO_ABS, TP.ac('A', 7),
        TP.gui.Path.CLOSE_PATH_ABS, TP.ac('Z', 0),

        TP.gui.Path.MOVE_TO_REL, TP.ac('m', 2),
        TP.gui.Path.LINE_TO_REL, TP.ac('l', 2),
        TP.gui.Path.HORIZ_LINE_TO_REL, TP.ac('h', 1),
        TP.gui.Path.VERT_LINE_TO_REL, TP.ac('v', 1),
        TP.gui.Path.CURVE_TO_REL, TP.ac('c', 6),
        TP.gui.Path.SMOOTH_CURVE_TO_REL, TP.ac('s', 4),
        TP.gui.Path.QUAD_CURVE_TO_REL, TP.ac('q', 4),
        TP.gui.Path.QUAD_SMOOTH_CURVE_TO_REL, TP.ac('t', 2),
        TP.gui.Path.ARC_TO_REL, TP.ac('a', 7),
        TP.gui.Path.CLOSE_PATH_REL, TP.ac('z', 0)
        ));

//  ------------------------------------------------------------------------

TP.gui.SVGPath.Type.defineConstant('PATH_SPLITUP_REGEX',
        TP.rc('([A-Za-z])|(\\d+(\\.\\d+)?)|(\\.\\d+)|(-\\d+(\\.\\d+)?)|(-\\.\\d+)',
    'g'));

//  ------------------------------------------------------------------------

TP.gui.SVGPath.Type.defineConstant('PATH_PARSER',
function(aString) {

    /**
     * @method PATH_PARSER
     * @summary Converts a String containing a path description to a
     *     TP.gui.Path object.
     * @param {The} aString String definition to use to build a TP.gui.Path
     *     object from.
     * @returns {TP.gui.SVGPath} A TP.gui.Path expressing the supplied
     *     transformation.
     */

    var newPath,

        pathParts,
        operatorMatcher,

        i,

        operator,
        operatorArray,

        newObj;

    newPath = TP.ac();

    pathParts = TP.gui.SVGPath.at('PATH_SPLITUP_REGEX').match(aString);

    operatorMatcher = TP.rc('[MLHVCSQTAZ]', 'i');

    for (i = 0; i < pathParts.getSize(); i++) {
        if (operatorMatcher.test(pathParts.at(i))) {
            operator = pathParts.at(i);

            newPath.push(operator);
            i++;

            operatorArray = TP.ac();
            while (i < pathParts.getSize()) {
                if (operatorMatcher.test(pathParts.at(i))) {
                    i--;
                    break;
                }

                operatorArray.push(parseFloat(pathParts.at(i)));
                i++;
            }

            newPath.push(operatorArray);
        }
    }

    if (TP.notEmpty(newPath)) {
        newObj = TP.gui.SVGPath.construct();
        newObj.set('pathSegments', newPath);

        return newObj;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.gui.SVGPath.addParser(TP.gui.SVGPath.PATH_PARSER);

//  ------------------------------------------------------------------------
//  Type Methods.
//  ------------------------------------------------------------------------

TP.gui.SVGPath.Type.defineMethod('elementGetBoundingBox',
function(anElement) {

    /**
     * @method elementGetBoundingBox
     * @summary Returns the rectangle that completely encloses the shape.
     * @param {Element} anElement An SVG 'path' element to return the bounding
     *     box rectangle for.
     * @returns {TP.gui.Rect} The rectangle that encloses the shape.
     */

    var pathStr,

        pathObj;

    if (TP.isEmpty(pathStr = anElement.getAttribute('d'))) {
        return TP.gui.Rect.construct(-1, -1, -1, -1);
    }

    if (TP.notValid(pathObj = TP.gui.SVGPath.from(pathStr))) {
        return TP.gui.Rect.construct(-1, -1, -1, -1);
    }

    return pathObj.getBoundingBox();
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.gui.SVGPath.Inst.defineMethod('$updateBBoxData',
function(bboxData, x, y) {

    /**
     * @method $updateBBoxData
     * @summary Update
     * @returns {TP.gui.Path}
     */

    if (bboxData.left === TP.NOT_FOUND) {
        bboxData.top = y;
        bboxData.right = x;
        bboxData.left = x;
        bboxData.bottom = y;
    }

    if (bboxData.top > y) {
        bboxData.top = y;
    }

    if (bboxData.right < x) {
        bboxData.right = x;
    }

    if (bboxData.bottom < y) {
        bboxData.bottom = y;
    }

    if (bboxData.left > x) {
        bboxData.left = x;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.SVGPath.Inst.defineMethod('$updateBBoxFromSegment',
function(segmentOperator, segmentArgs, trackingPoint, trackingData) {

    /**
     * @method $updateBBox
     * @summary
     * @param {String} segmentOperator
     * @param {Array<Number|Boolean|Array|TP.gui.Point>} segmentArgs An Array of
     *     Numbers, Booleans, Arrays or TP.gui.Points that contain the segment
     *     arguments.
     * @param {TP.gui.Point} trackingPoint
     * @param {Array} trackingData
     * @returns {TP.gui.SVGPath}
     */

    var i,
        x,
        y,

        start;

    switch (segmentOperator) {
        case 'M':
        case 'L':
        case 'C':
        case 'S':
        case 'Q':
        case 'T':

            for (i = 0; i < segmentArgs.getSize(); i += 2) {
                this.$updateBBoxData(trackingData,
                                        segmentArgs.at(i),
                                        segmentArgs.at(i + 1));
            }

            trackingPoint.set('x', segmentArgs.at(i - 2));
            trackingPoint.set('y', segmentArgs.at(i - 1));
            trackingPoint.set('absolute', true);

            break;

        case 'H':

            for (i = 0; i < segmentArgs.getSize(); ++i) {
                this.$updateBBoxData(trackingData,
                                        segmentArgs.at(i),
                                        trackingPoint.get('y'));
            }

            trackingPoint.set('x', segmentArgs.at(i - 1));
            trackingPoint.set('absolute', true);

            break;

        case 'V':

            for (i = 0; i < segmentArgs.getSize(); ++i) {
                this.$updateBBoxData(trackingData,
                                        trackingPoint.get('x'),
                                        segmentArgs.at(i));
            }

            trackingPoint.set('y', segmentArgs.at(i - 1));
            trackingPoint.set('absolute', true);

            break;

        case 'A':

            for (i = 0; i < segmentArgs.getSize(); i += 7) {
                this.$updateBBoxData(trackingData,
                                        segmentArgs.at(i + 5),
                                        segmentArgs.at(i + 6));
            }

            trackingPoint.set('x', segmentArgs.at(i - 2));
            trackingPoint.set('y', segmentArgs.at(i - 1));
            trackingPoint.set('absolute', true);

            break;

        case 'm':

            if (trackingPoint.get('x') === TP.NOT_FOUND) {
                x = segmentArgs.at(0);
                y = segmentArgs.at(1);

                this.$updateBBoxData(trackingData, x, y);

                start = 2;
            } else {
                x = trackingPoint.get('x');
                y = trackingPoint.get('y');

                start = 0;
            }

            for (i = start; i < segmentArgs.getSize(); i += 2) {
                x = x + segmentArgs.at(i);
                y = y + segmentArgs.at(i + 1);

                this.$updateBBoxData(trackingData, x, y);
            }

            trackingPoint.set('x', x);
            trackingPoint.set('y', y);
            trackingPoint.set('absolute', false);

            break;

        case 'l':
        case 't':

            x = trackingPoint.get('x');
            y = trackingPoint.get('y');

            for (i = 0; i < segmentArgs.getSize(); i += 2) {
                x = x + segmentArgs.at(i);
                y = y + segmentArgs.at(i + 1);

                this.$updateBBoxData(trackingData, x, y);
            }

            trackingPoint.set('x', x);
            trackingPoint.set('y', y);
            trackingPoint.set('absolute', false);

            break;

        case 'h':

            x = trackingPoint.get('x');
            y = trackingPoint.get('y');

            for (i = 0; i < segmentArgs.getSize(); ++i) {
                x = x + segmentArgs.at(i);

                this.$updateBBoxData(trackingData, x, y);
            }

            trackingPoint.set('x', x);
            trackingPoint.set('absolute', false);

            break;

        case 'v':

            x = trackingPoint.get('x');
            y = trackingPoint.get('y');

            for (i = 0; i < segmentArgs.getSize(); ++i) {
                y = y + segmentArgs.at(i);

                this.$updateBBoxData(trackingData, x, y);
            }

            trackingPoint.set('y', y);
            trackingPoint.set('absolute', false);

            break;

        case 'c':

            x = trackingPoint.get('x');
            y = trackingPoint.get('y');

            for (i = 0; i < segmentArgs.getSize(); i += 6) {
                this.$updateBBoxData(trackingData,
                                        x + segmentArgs.at(i),
                                        y + segmentArgs.at(i + 1));

                this.$updateBBoxData(trackingData,
                                        x + segmentArgs.at(i + 2),
                                        y + segmentArgs.at(i + 3));

                //  We only accumulate the third point.
                x = x + segmentArgs.at(i + 4);
                y = y + segmentArgs.at(i + 5);

                this.$updateBBoxData(trackingData, x, y);
            }

            trackingPoint.set('x', x);
            trackingPoint.set('y', y);
            trackingPoint.set('absolute', false);

            break;

        case 's':
        case 'q':

            x = trackingPoint.get('x');
            y = trackingPoint.get('y');

            for (i = 0; i < segmentArgs.getSize(); i += 4) {
                this.$updateBBoxData(trackingData,
                                        x + segmentArgs.at(i),
                                        y + segmentArgs.at(i + 1));

                //  We only accumulate the second point.
                x = x + segmentArgs.at(i + 2);
                y = y + segmentArgs.at(i + 3);

                this.$updateBBoxData(trackingData, x, y);
            }

            trackingPoint.set('x', x);
            trackingPoint.set('y', y);
            trackingPoint.set('absolute', false);

            break;

        case 'a':

            x = trackingPoint.get('x');
            y = trackingPoint.get('y');

            for (i = 0; i < segmentArgs.getSize(); i += 7) {
                x = x + segmentArgs.at(i + 5);
                y = y + segmentArgs.at(i + 6);

                this.$updateBBoxData(trackingData, x, y);
            }

            trackingPoint.set('x', x);
            trackingPoint.set('y', y);
            trackingPoint.set('absolute', false);

            break;

        default:
            break;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.SVGPath.Inst.defineMethod('getBoundingBox',
function() {

    /**
     * @method getBoundingBox
     * @summary Returns the rectangle that completely encloses the shape.
     * @param {Element} anElement An SVG 'path' element to return the bounding
     *     box rectangle for.
     * @returns {TP.gui.Rect} The rectangle that encloses the shape.
     */

    var pathParts,

        trackingPoint,
        trackingData,

        i;

    pathParts = this.get('pathSegments');

    trackingPoint = TP.pc(-1, -1);
    trackingPoint.defineAttribute('absolute', false);

    trackingData = {
        top: -1,
        right: -1,
        bottom: -1,
        left: -1
    };

    //  Note here the increment of the path by 2, processing each
    //  operator/operand pair.
    for (i = 0; i < pathParts.getSize(); i += 2) {
        this.$updateBBoxFromSegment(pathParts.at(i),
                                    pathParts.at(i + 1),
                                    trackingPoint,
                                    trackingData);
    }

    return TP.gui.Rect.construct(
                            trackingData.left,
                            trackingData.top,
                            trackingData.right - trackingData.left,
                            trackingData.bottom - trackingData.top);
});

//  ========================================================================
//  TP.gui.Transition
//  ========================================================================

/**
 * @type {TP.gui.Transition}
 * @summary The common supertype for transition types in TIBET, providing
 *     (mostly abstract) methods for use in subtypes.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('gui.Transition');

//  This is an abstract type.
TP.gui.Transition.isAbstract(true);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.gui.Transition.Inst.defineAttribute('transitionJob');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.gui.Transition.Inst.defineMethod('init',
function(controlParams, stepParams) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @description Parameters supplied in the controlParams TP.core.Hash for
     *     this method override any setting for the receiving transition. If a
     *     parameter value isn't supplied for a particular parameter, the
     *     receiving transition type will be queried via a 'get*()' method (i.e.
     *     get('limit'), get('count'), etc.) for a 'built-in' value. Note that
     *     the step params TP.core.Hash is optional and may not be available,
     *     especially if this job is meant to be invoked repeatedly.
     * @param {TP.core.Hash} controlParams A TP.core.Hash of the following job
     *     control parameters: delay, interval, limit, count, compute, freeze.
     * @param {TP.core.Hash} stepParams A TP.core.Hash of the following job step
     *     parameters: target, property.
     * @returns {TP.gui.Transition} A new instance.
     */

    var transitionJob;

    //  If we're part of a multi-transition, we may not be handed a 'control
    //  parameters' hash - unless we're the multi-transition itself ;-).
    if (TP.notValid(controlParams)) {
        return this;
    }

    //  Make sure that we created a valid TP.core.Job
    if (TP.notValid(transitionJob =
                    this.constructJob(controlParams, stepParams))) {
        return null;
    }

    this.set('transitionJob', transitionJob);

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Transition.Inst.defineMethod('clearValues',
function(params) {

    /**
     * @method clearValues
     * @summary Clears the values for the targets given the property name.
     * @param {TP.core.Hash} params The 'step parameters' supplied to the job.
     */

    return;
});

//  ------------------------------------------------------------------------

TP.gui.Transition.Inst.defineMethod('configure',
function(job, params) {

    /**
     * @method configure
     * @summary Configures the transition, based on what this particular type
     *     of transition is trying to accomplish.
     * @description Note that the 'job' parameter supplied here points to the
     *     same instance as our 'job' instance variable, but this method is used
     *     by the job control system, so our method signature must match.
     * @param {TP.core.Job} job The job object that is currently processing this
     *     configure method.
     * @param {TP.core.Hash} params The 'step parameters' supplied to the job.
     * @returns {Boolean} Whether or not this method configured the transition
     *     successfully.
     */

    TP.override();

    return false;
});

//  ------------------------------------------------------------------------

TP.gui.Transition.Inst.defineMethod('constructJob',
function(controlParams, stepParams) {

    /**
     * @method constructJob
     * @summary Constructs a TP.core.Job to execute the receiving transition
     *     type.
     * @description Parameters supplied in the controlParams TP.core.Hash for
     *     this method override any setting for the receiving transition. If a
     *     parameter value isn't supplied for a particular parameter, the
     *     receiving transition type will be queried via a 'get*()' method (i.e.
     *     get('limit'), get('count'), etc.) for a 'built-in' value. Note that
     *     the step params TP.core.Hash is optional and may not be available,
     *     especially if this job is meant to be invoked repeatedly.
     * @param {TP.core.Hash} controlParams A TP.core.Hash of the following job
     *     control parameters: delay, interval, limit, count, compute, freeze.
     * @param {TP.core.Hash} stepParams A TP.core.Hash of the following job step
     *     parameters: target, property.
     * @returns {TP.core.JobStatus} The job or job group that was constructed to
     *     service the effect.
     */

    var ctrlParams,
        jobCtrlParams,
        thisref,
        transitionJob,
        param,
        oldPre,
        oldPost;

    ctrlParams = controlParams;
    if (TP.notValid(ctrlParams)) {
        ctrlParams = TP.hc();
    }

    //  Some of these parameters (delay, interval, limit, count & compute)
    //  might exist on the supplied hash, but if they do not, we ask ourself
    //  to see if we have default values for our particular kind of
    //  transition.

    //  NB: We purposely leave out: 'lastInterval', 'stats', 'freeze',
    //  'preserve' and 'restore' - they are handled below.
    jobCtrlParams = TP.hc(
        'config', this.configure.bind(this),
        'pre', ctrlParams.at('pre'),
        'step', this.step.bind(this),
        'post', ctrlParams.at('post')
    );

    param = ctrlParams.at('compute');
    if (TP.notValid(param)) {
        param = this.get('computeFunction');
    }
    jobCtrlParams.atPut('compute', param);

    thisref = this;
    ['delay', 'interval', 'limit', 'count', 'isAnimation'].forEach(
    function(key) {
        var val;

        val = ctrlParams.at(key);
        if (TP.notValid(val)) {
            val = thisref.get(key);
        }
        jobCtrlParams.atPut(key, val);
    });

    //  Construct a job using those control parameters.
    transitionJob = TP.core.Job.construct(jobCtrlParams);

    if (TP.notValid(transitionJob)) {
        return null;
    }

    //  If we are 'preserving' or 'restoring' values on the target elements,
    //  then we register pre and/or post functions with the job that will
    //  call upon the transition to preserve (or restore) property values
    //  before (or after) it ends.

    if (TP.isTrue(ctrlParams.at('preserve'))) {
        //  Capture any previously set 'pre' function on the job - we'll
        //  call it inside of our 'pre'.
        oldPre = transitionJob.get('pre');

        transitionJob.set(
            'pre',
            function(job, params) {

                this.preserveValues(params);

                //  Run any existing 'pre' function that was defined as part
                //  of our parameters.
                if (TP.isCallable(oldPre)) {
                    oldPre(job, params);
                }
            }.bind(this));
    }

    if (TP.isTrue(ctrlParams.at('restore'))) {
        //  Capture any previously set 'post' function on the job - we'll
        //  call it inside of our 'post'.
        oldPost = transitionJob.get('post');

        transitionJob.set(
            'post',
            function(job, params) {

                //  Run any existing 'post' function that was defined as
                //  part of our parameters.
                if (TP.isCallable(oldPost)) {
                    oldPost(job, params);
                }

                this.restoreValues(params);

            }.bind(this));
    } else if (TP.notTrue(ctrlParams.at('freeze'))) {
        //  If 'restore' wasn't true and 'freeze' wasn't true, then we call
        //  upon the transition to clear any property values that it set.

        //  Capture any previously set 'post' function on the job - we'll
        //  call it inside of our 'post'.
        oldPost = transitionJob.get('post');

        transitionJob.set(
            'post',
            function(job, params) {

                //  Run any existing 'post' function that was defined as
                //  part of our parameters.
                if (TP.isCallable(oldPost)) {
                    oldPost(job, params);
                }

                this.clearValues(params);

            }.bind(this));
    }

    return transitionJob;
});

//  ------------------------------------------------------------------------

TP.gui.Transition.Inst.defineMethod('constructJobGroup',
function() {

    /**
     * @method constructJobGroup
     * @summary Constructs a TP.core.JobGroup and adds any objects that were
     *     handed in (and that should conform to the TP.core.JobStatus
     *     specification which means that they could be TP.core.Jobs or other
     *     TP.core.JobGroups) as children to the new TP.core.JobGroup.
     * @param {arguments} varargs One or more objects to add as child objects to
     *     the constructed job group.
     * @returns {TP.core.JobGroup} The newly constructed job group.
     */

    var transitionJobGroup,
        args;

    if (TP.notValid(transitionJobGroup = TP.core.JobGroup.construct())) {
        //  No valid job group? Can't go on.
        //  TODO: Raise an exception.
        return null;
    }

    //  Construct a regular Array from the 'arguments' object.
    args = TP.args(arguments);

    args.perform(
        function(aJob) {
            transitionJobGroup.addChild(aJob);
        });

    return transitionJobGroup;
});

//  ------------------------------------------------------------------------

TP.gui.Transition.Inst.defineMethod('getComputeFunction',
function() {

    /**
     * @method getComputeFunction
     * @summary Returns the default compute Function for the receiving
     *     transition type.
     * @returns {Function} The default compute Function for this type.
     */

    //  At this level, this defaults to the simple
    //  TP.core.Job.LINEAR_COMPUTE.
    return TP.core.Job.LINEAR_COMPUTE;
});

//  ------------------------------------------------------------------------

TP.gui.Transition.Inst.defineMethod('getCount',
function() {

    /**
     * @method getCount
     * @summary Returns the default number of times that the transition should
     *     execute for this transition type.
     * @returns {Number} The default number of times the transition should
     *     execute.
     */

    //  By returning null here, we allow the job that will run this
    //  transition to default.

    return null;
});

//  ------------------------------------------------------------------------

TP.gui.Transition.Inst.defineMethod('getDelay',
function() {

    /**
     * @method getDelay
     * @summary Returns the default delay to begin executing the transition in
     *     either Number, String or Duration or a Function to compute the delay.
     *     Depending on type, the delay will be computed thusly: Number The
     *     number of milliseconds to delay String The number of milliseconds to
     *     delay or a Duration Function A function returning the number of
     *     milliseconds to delay.
     * @returns {Number|String|Duration|Function} The delay as expressed above.
     */

    //  By returning null here, we allow the job that will run this
    //  transition to default.

    return null;
});

//  ------------------------------------------------------------------------

TP.gui.Transition.Inst.defineMethod('getInterval',
function() {

    /**
     * @method getInterval
     * @summary Returns the default interval which determines the millisecond
     *     interval between iterations of the receiver's 'stepping' function.
     * @returns {Number} The number of milliseconds between iterations of the
     *     receiver's 'step' function.
     */

    //  By returning null here, we allow the job that will run this
    //  transition to default.

    return null;
});

//  ------------------------------------------------------------------------

TP.gui.Transition.Inst.defineMethod('getLimit',
function() {

    /**
     * @method getLimit
     * @summary Returns the default limit which determines how long the
     *     receiving transition should execute using either Number, String or
     *     Duration or a Function to compute the limit. Depending on type, the
     *     limit will be computed thusly: Number The number of steps to execute
     *     before stopping. String The number of milliseconds or a Duration to
     *     execute before stopping Function A function returning true if the
     *     transition should stop.
     * @returns {Number|String|Duration|Function} The limit as expressed above.
     */

    //  We return 1 second as a String representation of milliseconds.
    return '1000';
});

//  ------------------------------------------------------------------------

TP.gui.Transition.Inst.defineMethod('preserveValues',
function(params) {

    /**
     * @method preserveValues
     * @summary Preserves the values for the targets given the property name.
     * @param {TP.core.Hash} params The 'step parameters' supplied to the job.
     */

    return;
});

//  ------------------------------------------------------------------------

TP.gui.Transition.Inst.defineMethod('reset',
function() {

    /**
     * @method reset
     * @summary Resets the effect so that it can be executed again.
     * @returns {TP.gui.Transition} The receiver.
     */

    //  At this level, we just reset our job.
    this.get('transitionJob').reset();

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.Transition.Inst.defineMethod('restoreValues',
function(params) {

    /**
     * @method restoreValues
     * @summary Restores the values for the targets given the property name.
     * @param {TP.core.Hash} params The 'step parameters' supplied to the job.
     */

    return;
});

//  ------------------------------------------------------------------------

TP.gui.Transition.Inst.defineMethod('start',
function(params) {

    /**
     * @method start
     * @summary Executes the transition against the supplied element.
     * @param {TP.core.Hash} params A TP.core.Hash of the following stepping
     *     parameters: target.
     * @returns {TP.core.JobStatus} The job or job group that was forked to
     *     service the transition.
     */

    var transitionJob;

    if (TP.notValid(transitionJob = this.get('transitionJob'))) {
        //  No valid job? Can't go on. We may be part of a multi-transition.
        return;
    }

    if (TP.isValid(params)) {
        //  We can't proceed without a target element.
        if (TP.notValid(params.at('target'))) {
            return;
        }

        transitionJob.set('parameters', params);
    }

    transitionJob.start();

    return transitionJob;
});

//  ------------------------------------------------------------------------

TP.gui.Transition.Inst.defineMethod('step',
function(job, params) {

    /**
     * @method step
     * @summary Changes some aspect of the target given when this transition
     *     was executed via the 'start()' method.
     * @description Note that the 'job' parameter supplied here points to the
     *     same instance as our 'job' instance variable, but this method is used
     *     by the job control system, so our method signature must match.
     * @param {TP.core.Job} job The job object that is currently processing this
     *     step method.
     * @param {TP.core.Hash} params The 'step parameters' supplied to the job.
     * @returns {Boolean} Whether or not the 'step' processed successfully.
     */

    TP.override();

    return false;
});

//  ========================================================================
//  TP.gui.MultiTransition
//  ========================================================================

/**
 * @type {TP.gui.MultiTransition}
 */

//  ------------------------------------------------------------------------

TP.gui.Transition.defineSubtype('MultiTransition');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.gui.MultiTransition.Inst.defineAttribute('transitionEntries');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.gui.MultiTransition.Inst.defineMethod('init',
function(controlParams, stepParams) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @description Parameters supplied in the controlParams TP.core.Hash for
     *     this method override any setting for the receiving transition. If a
     *     parameter value isn't supplied for a particular parameter, the
     *     receiving transition type will be queried via a 'get*()' method (i.e.
     *     get('limit'), get('count'), etc.) for a 'built-in' value. Note that
     *     the step params TP.core.Hash is optional and may not be available,
     *     especially if this job is meant to be invoked repeatedly.
     * @param {TP.core.Hash} controlParams A TP.core.Hash of the following job
     *     control parameters: delay, interval, limit, count, compute, freeze.
     * @param {TP.core.Hash} stepParams A TP.core.Hash of the following job step
     *     parameters: target, property.
     * @returns {TP.gui.MultiTransition} A new instance.
     */

    this.callNextMethod();

    this.set('transitionEntries', TP.ac());

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.MultiTransition.Inst.defineMethod('addTransitionEntry',
function(transitionEntry) {

    /**
     * @method addTransitionEntry
     * @summary Adds the supplied transition entry to the receiver.
     * @param {TP.core.Hash} aTransitionEntry The transition entry to add to the
     *     list of the receiver's transitions.
     * @returns {TP.gui.MultiTransition} A new instance.
     */

    var transitionType;

    if (TP.isType(transitionType = transitionEntry.at('transition'))) {
        //  Construct an instance of the transition and register it under
        //  'transitionInst' in the transition entry.
        transitionEntry.atPut('transitionInst', transitionType.construct());

        //  Capture the parameters 'as supplied at entry addition time' so
        //  that in case we run the job over and over, we can copy these and
        //  supply them to the job as if its running for the first time.
        transitionEntry.atPut('origParams',
                                transitionEntry.at('params').copy());

        this.get('transitionEntries').add(transitionEntry);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.MultiTransition.Inst.defineMethod('clearValues',
function(params) {

    /**
     * @method clearValues
     * @summary Clears the values for the targets given the property name.
     * @param {TP.core.Hash} params The 'step parameters' supplied to the job.
     */

    var transitionEntries,
        i,

        transitionEntry,
        transitionParams;

    //  Loop over each entry, and execute its 'clearValues' method.

    transitionEntries = this.get('transitionEntries');
    for (i = 0; i < transitionEntries.getSize(); i++) {
        //  Each transition entry contains:
        //      'params'
        //      'compute'
        //      'transition'

        transitionEntry = transitionEntries.at(i);

        //  Each 'params' hash contains individual values for:
        //      'from'
        //      'to'
        //      'delta'
        //      'target'
        transitionParams = transitionEntry.at('params');

        transitionEntry.at('transitionInst').clearValues(transitionParams);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.gui.MultiTransition.Inst.defineMethod('configure',
function(job, params) {

    /**
     * @method configure
     * @summary Configures the transition, based on what this particular type
     *     of transition is trying to accomplish.
     * @description Note that the 'job' parameter supplied here points to the
     *     same instance as our 'job' instance variable, but this method is used
     *     by the job control system, so our method signature must match.
     * @param {TP.core.Job} job The job object that is currently processing this
     *     step method.
     * @param {TP.core.Hash} params The 'step parameters' supplied to the job.
     * @returns {Boolean} Whether or not this method configured the transition
     *     successfully.
     */

    var transitionEntries,
        i,
        transitionEntry,
        transitionParams,

        fromVal,
        toVal;

    transitionEntries = this.get('transitionEntries');
    for (i = 0; i < transitionEntries.getSize(); i++) {
        transitionEntry = transitionEntries.at(i);

        //  Make a copy of the original parameters as they were when this
        //  transition was added to the multi-transition and make it the
        //  transition parameters for this transition.
        transitionParams = transitionEntry.at('origParams').copy();
        transitionEntry.atPut('params', transitionParams);

        transitionEntry.at('transitionInst').configure(
                                                job, transitionParams);

        //  To simulate the population of missing parameters, we populate
        //  the 'delta' property on the transitionEntry parameters.
        if (TP.isNumber(fromVal = transitionParams.at('from')) &&
            TP.isNumber(toVal = transitionParams.at('to'))) {
            transitionParams.atPut('delta', toVal - fromVal);
        }

        //  And populate the compute function on the transition entry
        //  itself.
        if (TP.notValid(transitionEntry.at('compute'))) {
            transitionEntry.atPut(
                'compute',
                transitionEntry.at(
                            'transitionInst').get('computeFunction'));
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.gui.MultiTransition.Inst.defineMethod('preserveValues',
function(params) {

    /**
     * @method preserveValues
     * @summary Preserves the values for the targets given the property name.
     * @param {TP.core.Hash} params The 'step parameters' supplied to the job.
     */

    var transitionEntries,
        i,

        transitionEntry,
        transitionParams;

    //  Loop over each entry, and execute its 'preserveValues' method.

    transitionEntries = this.get('transitionEntries');
    for (i = 0; i < transitionEntries.getSize(); i++) {
        //  Each transition entry contains:
        //      'params'
        //      'compute'
        //      'transition'

        transitionEntry = transitionEntries.at(i);

        //  Each 'params' hash contains individual values for:
        //      'from'
        //      'to'
        //      'delta'
        //      'target'
        transitionParams = transitionEntry.at('params');

        transitionEntry.at('transitionInst').preserveValues(
                                                    transitionParams);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.gui.MultiTransition.Inst.defineMethod('restoreValues',
function(params) {

    /**
     * @method restoreValues
     * @summary Restores the values for the targets given the property name.
     * @param {TP.core.Hash} params The 'step parameters' supplied to the job.
     */

    var transitionEntries,
        i,

        transitionEntry,
        transitionParams;

    //  Loop over each entry, and execute its 'restoreValues' method.

    transitionEntries = this.get('transitionEntries');
    for (i = 0; i < transitionEntries.getSize(); i++) {
        //  Each transition entry contains:
        //      'params'
        //      'compute'
        //      'transition'

        transitionEntry = transitionEntries.at(i);

        //  Each 'params' hash contains individual values for:
        //      'from'
        //      'to'
        //      'delta'
        //      'target'
        transitionParams = transitionEntry.at('params');

        transitionEntry.at('transitionInst').restoreValues(
                                                    transitionParams);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.gui.MultiTransition.Inst.defineMethod('step',
function(job, params) {

    /**
     * @method step
     * @summary Changes the clipping rect of the target element given when this
     *     transition was executed via the 'start()' method.
     * @description Note that the 'job' parameter supplied here points to the
     *     same instance as our 'job' instance variable, but this method is used
     *     by the job control system, so our method signature must match.
     * @param {TP.core.Job} job The job object that is currently processing this
     *     step method.
     * @param {TP.core.Hash} params The 'step parameters' supplied to the job.
     * @returns {Boolean} Whether or not the 'step' processed successfully.
     */

    var transitionEntry,

        transitionEntries,
        i,
        transitionParams;

    transitionEntry = null;

    //  Set up a locally programmed version of 'getStepValue()' on the job
    //  instance we were supplied. This utilizes a closured variable,
    //  'transitionEntry', which is advanced to each entry in our list of
    //  transitions as we loop and execute each one. Note here how we are
    //  emulating the behavior of the instance-level method version of
    //  'getStepValue()' by accepting parameters and then defaulting them
    //  *to the entry's parameters* if they weren't supplied as a parameter
    //  to the method..
    job.defineMethod(
        'getStepValue',
        function(stepParams) {

            var newParams;

            newParams = TP.isValid(stepParams) ?
                                    stepParams :
                                    transitionEntry.at('params');

            return transitionEntry.at('compute')(this, newParams);
        });

    //  Loop over each entry, and execute its 'step' method.

    transitionEntries = this.get('transitionEntries');
    for (i = 0; i < transitionEntries.getSize(); i++) {
        //  Each transition entry contains:
        //      'params'
        //      'compute'
        //      'transition'

        transitionEntry = transitionEntries.at(i);

        //  Each 'params' hash contains individual values for:
        //      'from'
        //      'to'
        //      'delta'
        //      'target'
        transitionParams = transitionEntry.at('params');

        transitionEntry.at('transitionInst').step(job, transitionParams);
    }

    return true;
});

//  ========================================================================
//  TP.gui.ObjectPropertyTransition
//  ========================================================================

/**
 * @type {TP.gui.ObjectPropertyTransition}
 * @summary A subtype of TP.gui.Transition that supplies some common methods
 *     for transitioning object properties.
 */

//  ------------------------------------------------------------------------

TP.gui.Transition.defineSubtype('ObjectPropertyTransition');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.gui.ObjectPropertyTransition.Type.defineMethod('transition',
function(aTarget, propertyName, aTransitionParams) {

    /**
     * @method transition
     * @summary A convenience wrapper for invoking this type of
     *     TP.gui.Transition to do a 'simple transition'.
     * @param {Element|Element[]} aTarget The target or targets to transition.
     * @param {String} propertyName The name of the property to transition.
     * @param {TP.core.Hash} aTransitionParams A hash of parameters to use for
     *     the transition.
     * @exception TP.sig.InvalidObject
     * @exception TP.sig.InvalidParameter
     * @returns {TP.core.Job} The TP.core.Job object that is managing the
     *     transition.
     */

    var targets,

        transitionParams,

        origins,
        sig,

        limit,

        computeFunc,

        controlParams,
        stepParams,

        valuesArr,

        aTransition,
        transitionJob,

        oldPost;

    if (TP.notValid(propertyName)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  If its an Array, then we already have what we need. Otherwise, we
    //  assume its a single target element and wrap it into an Array.
    if (!TP.isArray(aTarget)) {
        if (!TP.isElement(aTarget)) {
            return this.raise('TP.sig.InvalidObject');
        }

        targets = TP.ac(aTarget);
    } else {
        targets = aTarget;
    }

    transitionParams = aTransitionParams;
    if (TP.notValid(transitionParams)) {
        transitionParams = TP.hc();
    }

    //  If the transition params haven't specified any target origins, then
    //  compute some.
    if (TP.notValid(origins = transitionParams.at('targetOrigins'))) {
        origins = targets.collect(
                            function(target) {

                                return TP.gid(target);
                            });
        origins.isOriginSet(true);
    }

    sig = origins.signal('TP.sig.PropertyWillTransition',
                            transitionParams,
                            transitionParams.atIfInvalid('signalPolicy',
                                                            TP.FIRE_ONE));

    if (sig.shouldPrevent()) {
        return this;
    }

    //  Grab the compute function and, if its valid, it should be a property
    //  on TP.core.Job.
    if (TP.isCallable(computeFunc = transitionParams.at('compute'))) {
        computeFunc = TP.core.Job[computeFunc];
    } else {
        computeFunc = null;
    }

    //  If no limit was supplied, then go forever. We set limit to
    //  TP.core.Job.FOREVER which will cause the underlying 'job'
    //  functionality to never quit until its terminated.
    if (TP.notValid(limit = transitionParams.at('limit'))) {
        limit = TP.core.Job.FOREVER;
    } else if (TP.isString(limit) && !limit.startsWith('PT')) {
        //  The user almost got it right - xs:duration types should begin
        //  with 'PT'
        limit = 'PT' + limit;
    }

    //  Set up the control parameters.

    //  NB: We purposely leave out:
    //      'config', 'step', 'lastInterval', 'stats'
    controlParams = TP.hc('pre', transitionParams.at('pre'),
                            'post', transitionParams.at('post'),
                            'compute', computeFunc,
                            'delay', transitionParams.at('delay'),
                            'interval', transitionParams.at('interval'),
                            'limit', limit,
                            'count', transitionParams.at('count'),
                            'freeze', transitionParams.at('freeze'),
                            'preserve', transitionParams.at('preserve'),
                            'restore', transitionParams.at('restore'));

    //  We just copy these slots over...

    //  Set up the step parameters: target, property
    stepParams = TP.hc('target', targets,
                        'property', propertyName);

    //  If the user supplied 'values', split them along a space (' ') into
    //  an Array.
    if (TP.isArray(valuesArr = transitionParams.at('values'))) {
        if (TP.isString(valuesArr)) {
            valuesArr = valuesArr.split(' ');
        }
    } else {
        valuesArr = null;
    }

    //  If there was a valid 'values' Array, it takes precedence over any
    //  'from', 'to' or 'by' values.
    if (TP.isArray(valuesArr)) {
        stepParams.atPut('values', valuesArr);
    } else {
        stepParams.atPut('from', transitionParams.at('from'));
        stepParams.atPut('to', transitionParams.at('to'));
        stepParams.atPut('by', transitionParams.at('by'));
    }

    //  We sneak the property onto the control params so that abstract
    //  subtypes that need to look up concrete types (like
    //  TP.gui.CSSPropertyTransition), can use it.
    controlParams.atPut('property', propertyName);

    //  All the configuration is over. Set up the transition.
    aTransition = this.construct(controlParams);

    transitionJob = aTransition.get('transitionJob');

    //  We need a 'post' function that will remove our 'job slot'

    //  Capture any previously set 'post' function on the job - we'll
    //  call them when our 'post' finishes.
    oldPost = transitionJob.get('post');

    transitionJob.set(
        'post',
        function(job, params) {

            var theTargets,
                theProperty;

            //  Note here how we grab both the target elements and the
            //  property from the supplied job. This is to avoid closure
            //  problems with previous invocations of this method.
            if (TP.isEmpty(theTargets = params.at('target'))) {
                return;
            }

            //  Note here how we grab the property from the job. This is
            //  to avoid closure problems with previous invocations of
            //  this method.
            if (TP.isEmpty(theProperty = params.at('property'))) {
                return;
            }

            theTargets.perform(
                function(target) {

                    //  Clear the slot that we put on the element that
                    //  contained a reference to our job for tracking
                    //  purposes in case other animations get fired up
                    //  in the middle of this one and want to take over.
                    if (TP.isValid(target['transition_' + theProperty])) {
                        target['transition_' + theProperty] = null;
                    }
                });

            //  Run any existing 'post' function that was defined as
            //  part of our parameters.
            if (TP.isCallable(oldPost)) {
                oldPost(job, params);
            }

            origins.signal('TP.sig.PropertyDidTransition',
                            transitionParams);
        });

    //  Instrument the individual elements that we are touching with the
    //  job. These will allow the deactivation routine below to prematurely
    //  terminate the job if another call to this method is called on the
    //  same element.

    targets.perform(
        function(target) {

            var prevJob,

                params,
                allElems,
                i;

            //  If the target element already had a job running that was
            //  animating that property, shut it down.

            //  If the element has a TP.core.Job registered under a slot
            //  named 'transition_' + the property being animated and that
            //  TP.core.Job hasn't already finished (or been told to finish
            //  by 'shutting down' another element sharing the job), then we
            //  begin the process to shut down the job.
            if (TP.isValid(
                        prevJob = target['transition_' + propertyName]) &&
                !prevJob.didComplete()) {
                //  If the job has elements that it is animating and there
                //  is more than 1 element in that set, then we're not the
                //  only one, so we just remove ourself from the list of
                //  elements.
                if (TP.isValid(params = prevJob.$get('parameters')) &&
                    TP.isArray(allElems = params.at('target')) &&
                    allElems.length > 1) {
                    for (i = 0; i < allElems.length; i++) {
                        if (allElems[i] === target) {
                            //  Remove the element from the job's 'target'
                            //  Array so that this property is no longer
                            //  animated by that job.
                            allElems.splice(i, 1);
                            break;
                        }
                    }
                } else {
                    //  Otherwise, we're the only element left in the job so
                    //  we try to shut the job down as cleanly as possible.
                    prevJob.shutdown();
                }
            }

            //  Cache the new animation job on the element, so that it can
            //  be shutdown in the future if necessary.
            target['transition_' + propertyName] = transitionJob;
        });

    //  Do the deed.
    aTransition.start(stepParams);

    return transitionJob;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.gui.ObjectPropertyTransition.Inst.defineMethod('configure',
function(job, params) {

    /**
     * @method configure
     * @summary Configures the transition, based on what this particular type
     *     of transition is trying to accomplish.
     * @description Note that the 'job' parameter supplied here points to the
     *     same instance as our 'job' instance variable, but this method is used
     *     by the job control system, so our method signature must match.
     * @param {TP.core.Job} job The job object that is currently processing this
     *     configure method.
     * @param {TP.core.Hash} params The 'step parameters' supplied to the job.
     * @returns {Boolean} Whether or not this method configured the transition
     *     successfully.
     */

    var property,
        target,

        from,
        to,
        by,

        fromAsNumber,
        toAsNumber,
        byAsNumber;

    property = params.at('property');

    //  We can't proceed without a style property.
    if (TP.isEmpty(property)) {
        return false;
    }

    target = params.at('target');

    //  We can't proceed without a target.
    if (TP.notValid(target)) {
        return false;
    }

    //  Note that the contents of 'target' could also be an Array of
    //  targets to be animated all at once. In this case, all computations
    //  below are done using the first target in this array.
    if (TP.isArray(target)) {
        target = target.first();
    }

    //  If we're animating across a set of values, then we're good to go. We
    //  assume that the caller has provided all the information necessary.
    if (TP.isArray(params.at('values'))) {
        return true;
    }

    //  Otherwise, we're using a 'from...to...by' model, so go ahead and
    //  grab those values.

    //  If the 'from' value is empty, we weren't given a 'from' value, so we
    //  need to compute one. This call ensures that the return value is in
    //  pixels.
    if (TP.isEmpty(from = params.at('from'))) {
        from = target.get(property);
    }

    //  Make sure 'from' is a Number.
    fromAsNumber = from.asNumber();

    //  If the 'to' value is not empty, then we were supplied with the value
    //  that the animation will stop at.
    if (TP.notEmpty(to = params.at('to'))) {
        //  Make sure 'to' is a Number.
        toAsNumber = to.asNumber();
    } else if (TP.notEmpty(by = params.at('by'))) {
        //  Otherwise, we didn't have a 'to' value, but we did have a 'by'
        //  value, so we can compute a 'to' value from it by adding it to
        //  the 'from' value.

        //  Make sure 'by' is a Number.
        byAsNumber = by.asNumber();

        //  It's easy to compute 'to' now - its just 'from' plus 'by'
        toAsNumber = fromAsNumber + byAsNumber;
    } else {
        //  No 'to' or 'by' - can't proceed from here.
        //  TODO: Raise an exception
        return false;
    }

    //  Reset the 'from' and 'to' based on our computed values.
    params.atPut('from', fromAsNumber);
    params.atPut('to', toAsNumber);

    params.atPut('respondsToSet', TP.canInvoke(target, 'set'));

    return true;
});

//  ------------------------------------------------------------------------

TP.gui.ObjectPropertyTransition.Inst.defineMethod('step',
function(job, params) {

    /**
     * @method step
     * @summary Changes the attribute of the target element given when this
     *     transition was executed via the 'start()' method.
     * @description Note that the 'job' parameter supplied here points to the
     *     same instance as our 'job' instance variable, but this method is used
     *     by the job control system, so our method signature must match.
     * @param {TP.core.Job} job The job object that is currently processing this
     *     step method.
     * @param {TP.core.Hash} params The 'step parameters' supplied to the job.
     * @returns {Boolean} Whether or not the 'step' processed successfully.
     */

    var property,

        target,

        stepval,

        len,
        i;

    property = params.at('property');

    //  We can't proceed without a style property.
    if (TP.isEmpty(property)) {
        return false;
    }

    target = params.at('target');

    //  We can't proceed without a target element.
    if (TP.notValid(target)) {
        return false;
    }

    stepval = job.getStepValue();

    //  Note that the contents of 'target' could also be an Array of
    //  targets to be transitioned all at once.
    if (TP.isArray(target)) {
        len = target.length;
        for (i = 0; i < len; i++) {
            if (TP.isTrue(params.at('respondsToSet'))) {
                target[i].set(property, stepval);
            } else {
                target[i][property] = stepval;
            }
        }
    } else {
        if (TP.isTrue(params.at('respondsToSet'))) {
            target.set(property, stepval);
        } else {
            target[property] = stepval;
        }
    }

    return true;
});

//  ========================================================================
//  TP.gui.AttributeTransition
//  ========================================================================

/**
 * @type {TP.gui.AttributeTransition}
 * @summary A subtype of TP.gui.ObjectPropertyTransition that supplies some
 *     common methods for transitioning element attributes.
 */

//  ------------------------------------------------------------------------

TP.gui.ObjectPropertyTransition.defineSubtype('AttributeTransition');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.gui.AttributeTransition.Inst.defineMethod('configure',
function(job, params) {

    /**
     * @method configure
     * @summary Configures the transition, based on what this particular type
     *     of transition is trying to accomplish.
     * @description Note that the 'job' parameter supplied here points to the
     *     same instance as our 'job' instance variable, but this method is used
     *     by the job control system, so our method signature must match.
     * @param {TP.core.Job} job The job object that is currently processing this
     *     configure method.
     * @param {TP.core.Hash} params The 'step parameters' supplied to the job.
     * @returns {Boolean} Whether or not this method configured the transition
     *     successfully.
     */

    var property,
        target,

        from,
        to,
        by,

        fromAsNumber,
        toAsNumber,
        byAsNumber;

    property = params.at('property');

    //  We can't proceed without a style property.
    if (TP.isEmpty(property)) {
        return false;
    }

    target = params.at('target');

    //  We can't proceed without a target.
    if (TP.notValid(target)) {
        return false;
    }

    //  Note that the contents of 'target' could also be an Array of
    //  targets to be animated all at once. In this case, all computations
    //  below are done using the first target in this array.
    if (TP.isArray(target)) {
        target = target.first();
    }

    //  If we're animating across a set of values, then we're good to go. We
    //  assume that the caller has provided all the information necessary.
    if (TP.isArray(params.at('values'))) {
        return true;
    }

    //  Otherwise, we're using a 'from...to...by' model, so go ahead and
    //  grab those values.

    //  If the 'from' value is empty, we weren't given a 'from' value, so we
    //  need to compute one. This call ensures that the return value is in
    //  pixels.
    if (TP.isEmpty(from = params.at('from'))) {
        from = TP.elementGetAttribute(target, property, true);
    }

    //  Make sure 'from' is a Number.
    fromAsNumber = from.asNumber();

    //  If the 'to' value is not empty, then we were supplied with the value
    //  that the animation will stop at.
    if (TP.notEmpty(to = params.at('to'))) {
        //  Make sure 'to' is a Number.
        toAsNumber = to.asNumber();
    } else if (TP.notEmpty(by = params.at('by'))) {
        //  Otherwise, we didn't have a 'to' value, but we did have a 'by'
        //  value, so we can compute a 'to' value from it by adding it to
        //  the 'from' value.

        //  Make sure 'by' is a Number.
        byAsNumber = by.asNumber();

        //  It's easy to compute 'to' now - its just 'from' plus 'by'
        toAsNumber = fromAsNumber + byAsNumber;
    } else {
        //  No 'to' or 'by' - can't proceed from here.
        //  TODO: Raise an exception
        return false;
    }

    //  Reset the 'from' and 'to' based on our computed values.
    params.atPut('from', fromAsNumber);
    params.atPut('to', toAsNumber);

    return true;
});

//  ------------------------------------------------------------------------

TP.gui.AttributeTransition.Inst.defineMethod('step',
function(job, params) {

    /**
     * @method step
     * @summary Changes the attribute of the target element given when this
     *     transition was executed via the 'start()' method.
     * @description Note that the 'job' parameter supplied here points to the
     *     same instance as our 'job' instance variable, but this method is used
     *     by the job control system, so our method signature must match.
     * @param {TP.core.Job} job The job object that is currently processing this
     *     step method.
     * @param {TP.core.Hash} params The 'step parameters' supplied to the job.
     * @returns {Boolean} Whether or not the 'step' processed successfully.
     */

    var property,

        target,

        stepval,

        len,
        i;

    property = params.at('property');

    //  We can't proceed without a style property.
    if (TP.isEmpty(property)) {
        return false;
    }

    target = params.at('target');

    //  We can't proceed without a target element.
    if (TP.notValid(target)) {
        return false;
    }

    stepval = job.getStepValue();

    //  Note that the contents of 'target' could also be an Array of
    //  targets to be transitioned all at once.
    if (TP.isArray(target)) {
        len = target.length;
        for (i = 0; i < len; i++) {
            TP.elementSetAttribute(target[i], property, stepval, true);
        }
    } else {
        TP.elementSetAttribute(target[i], property, stepval, true);
    }

    return true;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
