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
 */

//  ========================================================================
//  CSS2/CSS3 SUPPORT
//  ========================================================================

/*
*/

//  ------------------------------------------------------------------------
//  Global variables
//  ------------------------------------------------------------------------

(function() {
    var cssKeys;

    //  Strange that Gecko does this in a different way, but we obtain a similar
    //  result. Note that we have to filter out keys containing a '-' (which
    //  curiously are duplicates of the camel case DOM versions of the property
    //  names).
    if (TP.sys.isUA('GECKO')) {
        cssKeys = Object.getOwnPropertyNames(
                    Object.getPrototypeOf(document.documentElement.style));
        cssKeys = cssKeys.filter(
                    function(aKey) {
                        return aKey.indexOf('-') === TP.NOT_FOUND;
                    });
    } else {
        cssKeys = Object.getOwnPropertyNames(document.documentElement.style);
    }

    cssKeys.sort();

    TP.CSS_ALL_PROPERTIES = cssKeys;

    if (TP.notValid(window.CSS)) {
        window.CSS = {};
    }

    if (TP.notValid(window.CSS.prototype)) {
        window.CSS.prototype = {};
    }

    cssKeys.forEach(
            function(aKey) {
                CSS.prototype[aKey] = aKey.asCSSName();
            });
}());

TP.CSS_COLOR_PROPERTIES = TP.ac('backgroundColor',
                                'borderColor',
                                'borderBottomColor',
                                'borderLeftColor',
                                'borderRightColor',
                                'borderTopColor',
                                'color',
                                'outlineColor');

TP.CSS_LENGTH_PROPERTIES = TP.ac('borderWidth',
                                    'borderBottomWidth',
                                    'borderLeftWidth',
                                    'borderRightWidth',
                                    'borderTopWidth',
                                    'bottom',
                                    'fontSize',
                                    'height',
                                    'left',
                                    'letterSpacing',
                                    'lineHeight',
                                    'margin',
                                    'marginBottom',
                                    'marginLeft',
                                    'marginRight',
                                    'marginTop',
                                    'maxHeight',
                                    'maxWidth',
                                    'minHeight',
                                    'minWidth',
                                    'outlineWidth',
                                    'padding',
                                    'paddingBottom',
                                    'paddingLeft',
                                    'paddingRight',
                                    'paddingTop',
                                    'right',
                                    'textIndent',
                                    'top',
                                    'verticalAlign',
                                    'width',
                                    'wordSpacing');

TP.CSS_UNITLESS_PROPERTIES = TP.ac('opacity',
                                    'orphans',
                                    'widows',
                                    'zIndex');

TP.CSS_DISALLOW_NEGATIVE_VALUES = TP.ac('borderWidth',
                                        'borderBottomWidth',
                                        'borderLeftWidth',
                                        'borderRightWidth',
                                        'borderTopWidth',
                                        'fontSize',
                                        'height',
                                        'lineHeight',
                                        'maxHeight',
                                        'maxWidth',
                                        'minHeight',
                                        'minWidth',
                                        'opacity',
                                        'outlineWidth',
                                        'paddingBottom',
                                        'paddingLeft',
                                        'paddingRight',
                                        'paddingTop',
                                        'width');

TP.regex.CSS_COLOR_PROPERTY = /color/i;

//  A TP.core.Hash of CSS color names. Note that the CSS3 color module
//  specification states that these should be case-insensitive, but for
//  comparison purposes, we lowercase them all.
TP.CSS_COLOR_NAMES = TP.hc(
                        'aliceblue', '#F0F8FF',
                        'antiquewhite', '#FAEBD7',
                        'aqua', '#00FFFF',
                        'aquamarine', '#7FFFD4',
                        'azure', '#F0FFFF',
                        'beige', '#F5F5DC',
                        'bisque', '#FFE4C4',
                        'black', '#000000',
                        'blanchedalmond', '#FFEBCD',
                        'blue', '#0000FF',
                        'blueviolet', '#8A2BE2',
                        'brown', '#A52A2A',
                        'burlywood', '#DEB887',
                        'cadetblue', '#5F9EA0',
                        'chartreuse', '#7FFF00',
                        'chocolate', '#D2691E',
                        'coral', '#FF7F50',
                        'cornflowerblue', '#6495ED',
                        'cornsilk', '#FFF8DC',
                        'crimson', '#DC143C',
                        'cyan', '#00FFFF',
                        'darkblue', '#00008B',
                        'darkcyan', '#008B8B',
                        'darkgoldenrod', '#B8860B',
                        'darkgray', '#A9A9A9',
                        'darkgrey', '#A9A9A9',
                        'darkgreen', '#006400',
                        'darkkhaki', '#BDB76B',
                        'darkmagenta', '#8B008B',
                        'darkolivegreen', '#556B2F',
                        'darkorange', '#FF8C00',
                        'darkorchid', '#9932CC',
                        'darkred', '#8B0000',
                        'darksalmon', '#E9967A',
                        'darkseagreen', '#8FBC8F',
                        'darkslateblue', '#483D8B',
                        'darkslategray', '#2F4F4F',
                        'darkslategrey', '#2F4F4F',
                        'darkturquoise', '#00CED1',
                        'darkviolet', '#9400D3',
                        'deeppink', '#FF1493',
                        'deepskyblue', '#00BFFF',
                        'dimgray', '#696969',
                        'dimgrey', '#696969',
                        'dodgerblue', '#1E90FF',
                        'firebrick', '#B22222',
                        'floralwhite', '#FFFAF0',
                        'forestgreen', '#228B22',
                        'fuchsia', '#FF00FF',
                        'gainsboro', '#DCDCDC',
                        'ghostwhite', '#F8F8FF',
                        'gold', '#FFD700',
                        'goldenrod', '#DAA520',
                        'gray', '#808080',
                        'grey', '#808080',
                        'green', '#00FF00',
                        'greenyellow', '#ADFF2F',
                        'honeydew', '#F0FFF0',
                        'hotpink', '#FF69B4',
                        'indianred', '#CD5C5C',
                        'indigo', '#4B0082',
                        'ivory', '#FFFFF0',
                        'khaki', '#F0E68C',
                        'lavender', '#E6E6FA',
                        'lavenderblush', '#FFF0F5',
                        'lawngreen', '#7CFC00',
                        'lemonchiffon', '#FFFACD',
                        'lightblue', '#ADD8E6',
                        'lightcoral', '#F08080',
                        'lightcyan', '#E0FFFF',
                        'lightgoldenrodyellow', '#FAFAD2',
                        'lightgray', '#D3D3D3',
                        'lightgrey', '#D3D3D3',
                        'lightgreen', '#90EE90',
                        'lightpink', '#FFB6C1',
                        'lightsalmon', '#FFA07A',
                        'lightseagreen', '#20B2AA',
                        'lightskyblue', '#87CEFA',
                        'lightslategray', '#778899',
                        'lightslategrey', '#778899',
                        'lightsteelblue', '#B0C4DE',
                        'lightyellow', '#FFFFE0',
                        'lime', '#00FF00',
                        'limegreen', '#32CD32',
                        'linen', '#FAF0E6',
                        'magenta', '#FF00FF',
                        'maroon', '#800000',
                        'mediumaquamarine', '#66CDAA',
                        'mediumblue', '#0000CD',
                        'mediumorchid', '#BA55D3',
                        'mediumpurple', '#9370D8',
                        'mediumseagreen', '#3CB371',
                        'mediumslateblue', '#7B68EE',
                        'mediumspringgreen', '#00FA9A',
                        'mediumturquoise', '#48D1CC',
                        'mediumvioletred', '#C71585',
                        'midnightblue', '#191970',
                        'mintcream', '#F5FFFA',
                        'mistyrose', '#FFE4E1',
                        'moccasin', '#FFE4B5',
                        'navajowhite', '#FFDEAD',
                        'navy', '#000080',
                        'oldLace', '#FDF5E6',
                        'olive', '#808000',
                        'olivedrab', '#6B8E23',
                        'orange', '#FFA500',
                        'orangered', '#FF4500',
                        'orchid', '#DA70D6',
                        'palegoldenrod', '#EEE8AA',
                        'palegreen', '#98FB98',
                        'paleturquoise', '#AFEEEE',
                        'palevioletred', '#D87093',
                        'papayawhip', '#FFEFD5',
                        'peachpuff', '#FFDAB9',
                        'peru', '#CD853F',
                        'pink', '#FFC0CB',
                        'plum', '#DDA0DD',
                        'powderblue', '#B0E0E6',
                        'purple', '#800080',
                        'rebeccapurple', '#663399',
                        'red', '#FF0000',
                        'rosybrown', '#BC8F8F',
                        'royalblue', '#4169E1',
                        'saddlebrown', '#8B4513',
                        'salmon', '#FA8072',
                        'sandybrown', '#F4A460',
                        'seagreen', '#2E8B57',
                        'seashell', '#FFF5EE',
                        'sienna', '#A0522D',
                        'silver', '#C0C0C0',
                        'skyblue', '#87CEEB',
                        'slateblue', '#6A5ACD',
                        'slategray', '#708090',
                        'slategrey', '#708090',
                        'snow', '#FFFAFA',
                        'springgreen', '#00FF7F',
                        'steelblue', '#4682B4',
                        'tan', '#D2B48C',
                        'teal', '#008080',
                        'thistle', '#D8BFD8',
                        'tomato', '#FF6347',
                        'turquoise', '#40E0D0',
                        'violet', '#EE82EE',
                        'wheat', '#F5DEB3',
                        'white', '#FFFFFF',
                        'whitesmoke', '#F5F5F5',
                        'yellow', '#FFFF00',
                        'yellowgreen', '#9ACD32');

//  Note that we need to use older 'new RegExp' syntax here because of
//  bootstrapping issues.
TP.regex.JQUERY_EXTENDED_SELECTORS =
    new RegExp('(:first|:last|:even|:odd|' +
                ':eq|:gt|:lt|' +
                ':header|:animated|:contains|:has|:parent|' +
                ':hidden|:visible|' +
                ':input|:text|:password|:radio|:checkbox|:submit|:image|' +
                ':reset|:button|:file|:hidden|' +
                ':selected)');

//  ------------------------------------------------------------------------
//  COLOR PRIMITIVES
//  ------------------------------------------------------------------------

TP.definePrimitive('rgbValuesAsHue',
function(m1, m2, aHue) {

    /**
     * @method rgbValuesAsHue
     * @summary Converts the supplied hue (given by the values) to its RGB
     *     equivalent.
     * @description This uses the CSS3 Color Module algorithm for converting
     *     hsla values to rgba.
     * @param {Number} m1
     * @param {Number} m2
     * @param {Number} aHue The color hue information.
     * @exception TP.sig.InvalidParameter
     * @returns {Number} The converted number.
     */

    var hue,
        hue6;

    if (!TP.isNumber(m1) || !TP.isNumber(m2) || !TP.isNumber(aHue)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    hue = aHue;

    if (hue < 0) {
        hue++;
    }

    if (hue > 1) {
        hue--;
    }

    hue6 = hue * 6;

    if (hue6 < 1) {
        return m1 + (m2 - m1) * hue6;
    }

    /* eslint-disable no-extra-parens */
    if ((hue * 2) < 1) {
        return m2;
    }

    if ((hue * 3) < 2) {
        return m1 + (m2 - m1) * (2 / 3 - hue) * 6;
    }
    /* eslint-enable no-extra-parens */

    return m1;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('rgbaValuesAsHSLA',
function(aHue, aSaturation, aLightness, anAlpha) {

    /**
     * @method rgbaValuesAsHSLA
     * @summary Converts the supplied hue, saturation, lightness and alpha
     *     values to their RGB equivalents.
     * @description This uses the CSS3 Color Module algorithm for converting
     *     hsla values to rgba.
     * @param {Number} aHue The color hue information.
     * @param {Number} aSaturation The color saturation information, given as a
     *     fractional number between 0 and 1.
     * @param {Number} aLightness The color lightness information, given as a
     *     fractional number between 0 and 1.
     * @param {Number} anAlpha The color alpha information.
     * @exception TP.sig.InvalidParameter
     * @returns {Array} The color expressed as an RGBA value in an Array of [r,
     *     g, b, a].
     */

    var theHue,

        m1,
        m2,

        redVal,
        blueVal,
        greenVal,

        rgbVal;

    //  NB: We don't check alpha here since it is optional and is just
    //  copied over anyway.
    if (!TP.isNumber(aHue) ||
        !TP.isNumber(aSaturation) ||
        !TP.isNumber(aLightness)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    /* eslint-disable no-extra-parens */

    theHue = ((aHue % 360) + 360) % 360 / 360;

    if (aLightness <= 0.5) {
        m2 = aLightness * (aSaturation + 1);
    } else {
        m2 = aLightness + aSaturation - (aLightness * aSaturation);
    }

    m1 = (aLightness * 2) - m2;

    //  Red value
    redVal = TP.rgbValuesAsHue(m1, m2, theHue + (1 / 3)) * 256;

    //  Blue value
    blueVal = TP.rgbValuesAsHue(m1, m2, theHue) * 256;

    //  Green value
    greenVal = TP.rgbValuesAsHue(m1, m2, theHue - (1 / 3)) * 256;

    /* eslint-enable no-extra-parens */

    rgbVal = TP.ac(redVal, blueVal, greenVal);

    //  If an alpha value was supplied, go ahead and push it here.
    if (TP.isNumber(anAlpha)) {
        rgbVal.push(anAlpha);
    }

    return rgbVal;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('colorStringAsHex',
function(aString) {

    /**
     * @method colorStringAsHex
     * @summary Converts a String containing a color value to a String
     *     containing the hex-formatted value: #RRGGBB
     * @description The supplied String can be in one of nine formats: FFFFFF
     *     #FFFFFF FFF #FFF rgb(255, 255, 255) rgba(255, 255, 255, .5) hsl(120,
     *     50%, 50%) hsla(120, 50%, 50%, .5) <aColorName>
     * @param {String} aString The String containing color information to
     *     convert.
     * @exception TP.sig.InvalidParameter
     * @returns {String} A String having this color value expressed as a hex
     *     color: #RRGGBB.
     */

    var strSize,

        parts,
        colorString,

        rgbResults;

    if (!TP.isString(aString)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    if (/transparent/.test(aString)) {
        return aString;
    }

    //  If its already a hex color, canonicalize it (a '#' followed by 7
    //  uppercase characters).
    if (TP.regex.CSS_HEX.test(aString)) {
        strSize = aString.getSize();

        //  If its 7 characters, then its already canonicalized
        if (strSize === 7) {
            colorString = aString;
        } else if (strSize === 6) {
            //  Otherwise, its just missing its '#' character
            colorString = '#' + aString;
        } else if (strSize === 3 || strSize === 4) {
            //  Grab the result of the second grouping (since this isn't a
            //  'full' CSS value, there won't be anything in the first
            //  grouping) and split it into individual characters.
            parts = TP.regex.CSS_HEX.exec(aString).at(2).split('');

            //  Prepend a '#' and then double each character found.
            colorString = TP.join('#',
                            parts.at(0), parts.at(0),
                            parts.at(1), parts.at(1),
                            parts.at(2), parts.at(2));
        } else {
            //  The hex string wasn't either 4 or 7 and there was no valid
            //  colorString (by using the lookup for a color name above), so
            //  we can't do anything else and bail out here.
            return null;
        }

        //  Make sure its all uppercase for consistency.
        return colorString.toUpperCase();
    }

    colorString = null;

    rgbResults = null;

    if (TP.regex.CSS_RGB.test(aString) ||
        TP.regex.CSS_RGBA.test(aString) ||
        TP.regex.CSS_HSL.test(aString) ||
        TP.regex.CSS_HSLA.test(aString)) {
        rgbResults = TP.colorStringAsArray(aString);
    }

    if (TP.isArray(rgbResults)) {
        //  If the results had an alpha value, pop it off since we can't use
        //  it here anyway.
        if (rgbResults.getSize() === 4) {
            rgbResults.pop();
        }

        //  Start with a '#'.
        colorString = '#';

        //  Run a collect, converting each String bit into the
        //  corresponding hex value (and making sure it's 0 padded to 2
        //  places).
        rgbResults = rgbResults.collect(
            function(numStr) {

                var componentString;

                componentString =
                    parseInt(numStr, 10).toString(16).pad(2, '0', TP.RIGHT);

                return componentString;
            });

        //  Join it and uppercase it to form the #RRGGBB
        colorString += rgbResults.join('').toUpperCase();

        return colorString;
    }

    //  It wasn't a color starting with 'rgb(', and it didn't start with
    //  '#', so see if its one of the 'color names' as defined in the
    //  CSS_COLOR_NAMES on this object (this map hands back #RRGGBB values).
    //  If it's not, this will just return null.
    if (TP.notValid(colorString = TP.CSS_COLOR_NAMES.at(
                                                aString.toLowerCase()))) {
        return null;
    }

    return colorString;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('colorStringAsArray',
function(aString) {

    /**
     * @method colorStringAsArray
     * @summary Converts a String containing a color to an Array containing,
     *     [r, g, b]
     * @description The supplied String can be in one of nine formats: FFFFFF
     *     #FFFFFF FFF #FFF rgb(255, 255, 255) rgba(255, 255, 255, .5) hsl(120,
     *     50%, 50%) hsla(120, 50%, 50%, .5) <aColorName>
     * @param {String} aString The String containing color information to
     *     convert.
     * @exception TP.sig.InvalidParameter
     * @returns {Array} An Array having this color value expressed as 3 Numbers
     *     [r, g, b].
     */

    var results,

        colorString,

        r,
        g,
        b;

    if (!TP.isString(aString)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  If its an 'rgba' color, then process it separately and bail out
    //  here.
    if (TP.regex.CSS_RGBA.test(aString)) {
        //  Pull the 4 numbers out of the String.
        results = TP.regex.CSS_RGBA.match(aString);

        //  Get rid of the 'whole match'
        results.shift();

        //  Convert the results to Numbers

        //  Red, Green, Blue
        results.atPut(0, parseInt(results.at(0), 10));
        results.atPut(1, parseInt(results.at(1), 10));
        results.atPut(2, parseInt(results.at(2), 10));

        //  Alpha
        results.atPut(3, parseFloat(results.at(3)));

        return results;
    }

    //  If its an 'rgb' color, then process it separately and bail out
    //  here.
    if (TP.regex.CSS_RGB.test(aString)) {
        //  Pull the 3 numbers out of the String.
        results = TP.regex.CSS_RGB.match(aString);

        //  Get rid of the 'whole match'
        results.shift();

        //  Convert the results to Numbers

        //  Red, Green, Blue
        results.atPut(0, parseInt(results.at(0), 10));
        results.atPut(1, parseInt(results.at(1), 10));
        results.atPut(2, parseInt(results.at(2), 10));

        return results;
    }

    //  If its an 'hsla' color, then process it separately and bail out
    //  here.
    if (TP.regex.CSS_HSLA.test(aString)) {
        //  Pull the 4 numbers out of the String.
        results = TP.regex.CSS_HSLA.match(aString);

        //  Get rid of the 'whole match'
        results.shift();

        //  Convert the results to Numbers

        //  Hue, Saturation, Lightness, Alpha

        //  Convert to RGB
        results = TP.rgbaValuesAsHSLA(parseFloat(results.at(0)),
                                        parseFloat(results.at(1)) / 100,
                                        parseFloat(results.at(2)) / 100,
                                        parseFloat(results.at(3)));

        return results;
    }

    //  If its an 'hsl' color, then process it separately and bail out
    //  here.
    if (TP.regex.CSS_HSL.test(aString)) {
        //  Pull the 4 numbers out of the String.
        results = TP.regex.CSS_HSL.match(aString);

        //  Get rid of the 'whole match'
        results.shift();

        //  Convert the results to Numbers

        //  Hue, Saturation, Lightness, Alpha

        //  Convert to RGB
        results = TP.rgbaValuesAsHSLA(parseFloat(results.at(0)),
                                        parseFloat(results.at(1)) / 100,
                                        parseFloat(results.at(2)) / 100);

        return results;
    }

    //  Get the color string canonicalized into a form of '#RRGGBB'
    colorString = TP.colorStringAsHex(aString);

    if (TP.isEmpty(colorString)) {
        return null;
    }

    //  Loop over the color, slicing out the hex digits, and turn them into
    //  decimal Number values to populate the array.
    r = parseInt(colorString.slice(0 * 2 + 1, 0 * 2 + 3), 16);
    g = parseInt(colorString.slice(1 * 2 + 1, 1 * 2 + 3), 16);
    b = parseInt(colorString.slice(2 * 2 + 1, 2 * 2 + 3), 16);

    return TP.ac(r, g, b);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('colorStringAsLongNumber',
function(aString) {

    /**
     * @method colorStringAsLongNumber
     * @summary Converts a String containing a color value to a 'long' number
     *     representing the color numerically.
     * @description The supplied String can be in one of nine formats: FFFFFF
     *     #FFFFFF FFF #FFF rgb(255, 255, 255) rgba(255, 255, 255, .5) hsl(120,
     *     50%, 50%) hsla(120, 50%, 50%, .5) <aColorName>
     * @param {String} aString The String containing color information to
     *     convert.
     * @exception TP.sig.InvalidParameter
     * @returns {Number} A 'long' number (one between 0 and 16777215 -
     *     parseInt('FFFFFF',16) ).
     */

    var hexString;

    if (!TP.isString(aString)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    if (TP.isString(hexString = TP.colorStringAsHex(aString))) {
        //  Make sure and slice off the '#'
        return parseInt(hexString.slice(1), 16);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('longNumberAsColorString',
function(aLongNumber) {

    /**
     * @method longNumberAsColorString
     * @summary Converts a 'long' number representing a color numerically to
     *     the equivalent 'hex' color (#RRGGBB) used for CSS colors.
     * @description This algorithm from Oliver Steele (http://osteele.com).
     * @param {Number} aLongNumber A 'long' number (one between 0 and 16777215 -
     *     parseInt('FFFFFF',16) ).
     * @exception TP.sig.InvalidNumber
     * @returns {String} A color 'hex' String.
     */

    var hexChars,
        str,

        i;

    if (!TP.isNumber(aLongNumber)) {
        return TP.raise(this, 'TP.sig.InvalidNumber');
    }

    hexChars = '0123456789ABCDEF';
    str = '#';

    /* eslint-disable no-constant-condition,no-extra-parens,semi-spacing */
    for (i = 24; (i -= 4) >= 0;) {
        str += hexChars.charAt((aLongNumber >> i) & 0xF);
    }
    /* eslint-enable no-constant-condition,no-extra-parens,semi-spacing */

    return str;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('colorValuesInterpolate',
function(color1, color2, aPercentage) {

    /**
     * @method colorValuesInterpolate
     * @summary Interpolates a mixture of color2 into color1 according to the
     *     supplied percentage.
     * @description This algorithm from Oliver Steele (http://osteele.com).
     * @param {Number} color1 A 'long' number (one between 0 and 16777215 -
     *     parseInt('FFFFFF',16) ) that specifies the color to start from.
     * @param {Number} color2 A 'long' number (one between 0 and 16777215 -
     *     parseInt('FFFFFF',16) ) that specifies the color to end at.
     * @param {Number} aPercentage The percentage of color2 that should be mixed
     *     into color1.
     * @exception TP.sig.InvalidNumber
     * @returns {Number} The number that is a mix of color1 and color using the
     *     supplied percentage.
     */

    var n,

        i,

        ca,
        cb,
        cc;

    if (!TP.isNumber(color1) ||
        !TP.isNumber(color2) ||
        !TP.isNumber(aPercentage)) {
        return TP.raise(this, 'TP.sig.InvalidNumber');
    }

    n = 0;

    /* eslint-disable no-constant-condition,no-extra-parens,semi-spacing */
    for (i = 24; (i -= 8) >= 0;) {
        ca = (color1 >> i) & 0xFF;
        cb = (color2 >> i) & 0xFF;
        cc = Math.floor(ca * (1 - aPercentage) + cb * aPercentage);
        n |= cc << i;
    }
    /* eslint-enable no-constant-condition,no-extra-parens,semi-spacing */

    return n;
});

//  ------------------------------------------------------------------------
//  CSS QUERYING
//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetNumericValueFromPercentage',
function(anElement, aPropertyName, aPercentage, wantsTransformed) {

    /**
     * @method elementGetNumericValueFromPercentage
     * @summary This method computes the numeric value for the given element
     *     name, property name and percentage value and the property name. Note
     *     that, for properties that compute a percentage of the (possibly
     *     offset) parent, this method will recurse upwards if that parent is
     *     also found to have a percentage value.
     * @description Depending on the property being requested, a percentage
     *     value can mean different things. In most cases, it is computed as a
     *     percentage of the containing block, but there are a few exceptions:
     *
     *     font-size: relative to font-size of parent element
     *
     *     line-height: relative to font-size of element itself
     *
     *     vertical-align: relative to line-height of element itself
     *
     *     word-spacing: relative to the width of a space (U+0020)
     *
     *     text-indent: relative to width of containing block
     *
     *     height: height of containing block width: width of containing block
     *     min-height: height of containing block min-width: width of containing
     *     block max-height: height of containing block max-width: width of
     *     containing block
     *
     *     margin-top: width of containing block margin-right: width of
     *     containing block margin-bottom: width of containing block
     *     margin-left: width of containing block
     *
     *     padding-top: width of containing block padding-right: width of
     *     containing block padding-bottom: width of containing block
     *     padding-left: width of containing block
     *
     *     top: height of containing block right: width of containing block
     *     bottom: height of containing block left: width of containing block
     *
     *
     * @param {HTMLElement} anElement The element to obtain the numeric value
     *     for.
     * @param {String} aPropertyName The property name to obtain the numeric
     *     value for.
     * @param {String} aPercentage The percentage value to use to compute the
     *     numeric value.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidParameter
     * @returns {Number} A number of that can be computed from the supplied
     *     element, property and percentage.
     */

    var theValue,
        factor,

        targetElement,

        pixelValue;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(aPropertyName) || TP.isEmpty(aPercentage)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    /* eslint-disable no-fallthrough */

    //  Different properties compute their percentages differently. Switch
    //  based on the name of the desired property and grab both the element
    //  that we're targeting to get a real value from so that we multiply
    //  below against the supplied percentage.
    switch (aPropertyName) {
        case 'fontSize':

            //  When fontSize is a percentage, it is computed from the
            //  element's *parent node* fontSize.
            if (TP.notValid(targetElement = anElement.parentNode)) {
                return 0;
            }
            theValue = TP.elementGetComputedStyleValueInPixels(
                                                        targetElement,
                                                        'fontSize');

            break;

        case 'lineHeight':

            //  When lineHeight is a percentage, it is computed from the
            //  element's fontSize.
            targetElement = anElement;
            theValue = TP.elementGetComputedStyleValueInPixels(
                                                        targetElement,
                                                        'fontSize');

            break;

        case 'verticalAlign':

            //  When verticalAlign is a percentage, it is computed from the
            //  element's lineHeight.
            targetElement = anElement;
            theValue = TP.elementGetComputedStyleValueInPixels(
                                                        targetElement,
                                                        'lineHeight');
            break;

        case 'height':
        case 'minHeight':
        case 'maxHeight':

        case 'top':
        case 'bottom':

            //  These are all computed from the *height* of the
            //  offsetParent.

            //  Vertical measurements are computed from the *offset
            //  parent*, not the parent node.
            if (TP.notValid(targetElement =
                            TP.elementGetOffsetParent(anElement))) {
                //  If its the body element, then we can go ahead and use
                //  the parent node, since we know that's the document
                //  element.
                if (anElement ===
                        TP.documentGetBody(TP.nodeGetDocument(anElement))) {
                    targetElement = anElement.parentNode;
                } else {
                    return 0;
                }
            }

            theValue = targetElement.offsetHeight;
            break;

        case 'width':
        case 'minWidth':
        case 'maxWidth':

        case 'left':
        case 'right':

            //  Weird that margin/padding - top/bottom are computed from the
            //  containing block's *width*, but that's what the spec says...
        case 'marginTop':
        case 'marginRight':
        case 'marginLeft':
        case 'marginBottom':

        case 'paddingTop':
        case 'paddingRight':
        case 'paddingLeft':
        case 'paddingBottom':

        case 'textIndent':

            //  These are all computed from the *width* of the
            //  offsetParent.

            //  Horizontal (and other) measurements are computed from the
            //  *offset parent*, not the parent node, unless its the body
            //  element ;-).
            if (TP.notValid(targetElement =
                            TP.elementGetOffsetParent(anElement))) {
                //  If its the body element, then we can go ahead and use
                //  the parent node, since we know that's the document
                //  element.
                if (anElement ===
                        TP.documentGetBody(TP.nodeGetDocument(anElement))) {
                    targetElement = anElement.parentNode;
                } else {
                    return 0;
                }
            }

            theValue = targetElement.offsetWidth;
            break;

        case 'wordSpacing':

            //  percentage of the width of a space (U+0020) glyph

            //  TODO: Do this

            break;

        default:

            //  If the property wasn't in our list, bail out here with 0.

            //  This includes the following properties that look like they
            //  should accept percentages, but don't:

            //  borderWidth
            //  borderBottomWidth
            //  borderLeftWidth
            //  borderRightWidth
            //  borderTopWidth
            //  letterSpacing
            //  opacity
            //  outlineWidth
            //  zIndex

            return 0;
    }
    /* eslint-enable no-fallthrough */

    //  If the returned value is itself a percentage, then we need to
    //  recurse upward to whatever the 'target element' was, in an attempt
    //  to get to a non-percentage value.
    if (TP.regex.PERCENTAGE.test(theValue)) {
        theValue = TP.elementGetNumericValueFromPercentage(
                                targetElement, aPropertyName, theValue);
    }

    //  Grab the pixel value of the value as computed against our target
    //  element. This is in case we have a value like '3em'.
    pixelValue = TP.elementGetPixelValue(targetElement,
                                            theValue,
                                            aPropertyName);

    //  If we didn't get back a Number, bail out here with 0.
    if (TP.isNaN(pixelValue)) {
        return 0;
    }

    //  Compute the factor by parsing a Number from the percentage and
    //  dividing it by 100. If that's successful, multiply the pixel value
    //  by it.
    if (TP.isNumber(factor = parseFloat(aPercentage) / 100)) {
        pixelValue *= factor;
    } else {
        //  If we couldn't compute a Number, bail out here with 0.
        return 0;
    }

    if (TP.isTrue(wantsTransformed)) {
        pixelValue = TP.elementTransformCSSPixelValue(targetElement,
                                                        pixelValue,
                                                        aPropertyName);
    }

    return pixelValue;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetPropertyValueAsNumber',
function(anElement, aPropertyName, aPropertyValue, wantsTransformed) {

    /**
     * @method elementGetPropertyValueAsNumber
     * @summary Returns the value of the supplied property on the supplied
     *     element as a Number. This method also manages percentage value
     *     formats.
     * @param {HTMLElement} anElement The element to retrieve the numeric value
     *     for.
     * @param {String} aPropertyName The property name to return the numeric
     *     value for.
     * @param {String} aPropertyValue The property value to convert to a numeric
     *     value.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidParameter
     * @returns {Number} The property value converted to a numeric value.
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(aPropertyName) || TP.isEmpty(aPropertyValue)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  If the value is a percentage, then use the routine defined above to
    //  compute the proper number of pixels from that percentage.
    if (TP.regex.PERCENTAGE.test(aPropertyValue)) {
        return TP.elementGetNumericValueFromPercentage(anElement,
                                                        aPropertyName,
                                                        aPropertyValue,
                                                        wantsTransformed);
    }

    if (TP.isTrue(wantsTransformed)) {
        return TP.elementTransformCSSPixelValue(anElement,
                                                aPropertyName,
                                                parseFloat(aPropertyValue));
    }

    //  Otherwise, just try to parse a Number out of it.
    return parseFloat(aPropertyValue);
});

//  ------------------------------------------------------------------------
//  INLINE STYLE PRIMITIVES
//  ------------------------------------------------------------------------

/*
In TIBET we reserve inline style use for animations and tools. We don't use
it for anything else, since that would interfere with both of those goals.
Still, having decent wrappers for dealing with inline style is useful, so
here they are.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('elementAddStyleValue',
function(anElement, aProperty, aValue) {

    /**
     * @method elementAddStyleValue
     * @summary Adds a style value to the property provided. Note that many of
     *     the properties in CSS don't actually allow the value to have
     *     space-separated content so this is only viable for a small subset of
     *     property names.
     * @param {HTMLElement} anElement The element to retrieve the inline CSS
     *     style for.
     * @param {String} aProperty The property name to add.
     * @param {String} aValue The value for the property to be added.
     * @exception TP.sig.InvalidElement
     * @returns {String} The inline CSS style of the supplied element/property,
     *     or null if not found.
     */

    var style,
        dict,

        name,
        value;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    style = TP.elementGetStyleString(anElement);
    dict = TP.styleStringAsHash(style);

    name = aProperty.asDOMName();

    value = dict.at(name);
    if (TP.isEmpty(value)) {
        dict.atPut(name, aValue);
    } else {
        dict.atPut(name, TP.join(value, ' ', aValue));
    }

    style = TP.styleStringFromHash(dict);
    TP.elementSetStyleString(anElement, style);

    return anElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetAppliedNativeStyleRules',
function(anElement, flushCaches) {

    /**
     * @method elementGetAppliedNativeStyleRules
     * @summary Returns an Array of CSSRule objects that apply to the
     *     supplied element.
     * @param {Element} anElement The element to retrieve the CSS style
     *     rules for.
     * @param {Boolean} [flushCaches=false] Whether or not to flush the
     *     element's cached ruleset.
     * @exception TP.sig.InvalidElement
     * @returns {Array} An Array of CSSRule objects.
     */

    var ruleArray,

        i,
        parentSS;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isTrue(flushCaches)) {
        anElement[TP.APPLIED_RULES] = null;
    }

    ruleArray = TP.ac();

    //  We check to see if the element has a 'TP.APPLIED_RULES' Array. If not,
    //  we have to run the refresh call (which can be slow).
    if (TP.notValid(anElement[TP.APPLIED_RULES])) {
        TP.$documentRefreshAppliedRulesCaches(TP.nodeGetDocument(anElement));
    }

    //  Grab the 'applied rules' cache on the element.
    ruleArray = anElement[TP.APPLIED_RULES];

    //  Make sure that any rules that are associated with stale style sheets get
    //  pruned. NB: We fetch the ruleArray's size *each time* through the loop,
    //  since we could be shortening the Array as we go.
    for (i = 0; i < ruleArray.getSize(); i++) {

        //  Find the style sheet associated with the element that inserted the
        //  rule's stylsheet (because of @import, it might not be the sheet in
        //  the 'parentStyleSheet' slot of the rule itself).
        parentSS = ruleArray.at(i).parentStyleSheet;
        while (parentSS.parentStyleSheet) {
            parentSS = parentSS.parentStyleSheet;
        }

        //  Make sure that stylesheet still has an owner node. If not, prune it.
        if (TP.notValid(parentSS.ownerNode)) {

            //  If it has, remove the rule from the rule Array
            ruleArray.splice(i, 1);
        }
    }

    return ruleArray;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetAppliedStyleInfo',
function(anElement, flushCaches) {

    /**
     * @method elementGetAppliedStyleInfo
     * @summary Returns an Array of TP.core.Hashes that contain information
     *     about the style rules that apply to the supplied Element
     * @param {Element} anElement The element to retrieve the CSS style
     *     info for.
     * @param {Boolean} [flushCaches=false] Whether or not to flush the
     *     element's cached ruleset.
     * @exception TP.sig.InvalidElement
     * @returns {TP.core.Hash[]} An Array of TP.core.Hash objects with style
     *     rule information for each style rule that matches the supplied
     *     element.
     *          originalSelector:   The original 'whole' selector
     *          selector:           The simple selector split out from the whole
     *                              selector.
     *          specificityInfo:    Specificity information about the selector.
     *                              See the calculateSingleCSSSelectorSpecificity()
     *                              method for more information on the values
     *                              here.
     *          sheetLocation:      The URL location of the stylesheet.
     *          sheetPosition:      The position of the stylesheet in the list of
     *                              stylesheets in a document.
     *          rulePosition:       The position of the rule in the list of
     *                              rules in its stylesheet.
     *          rule:               The original CSSStyleRule object.
     */

    var doc,
        allStyleSheets,

        rules,

        ruleInfo,

        rulesLen,
        i,

        newEntries;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    doc = TP.nodeGetDocument(anElement);
    allStyleSheets = TP.ac(doc.styleSheets);

    rules = TP.elementGetAppliedNativeStyleRules(anElement, flushCaches);

    ruleInfo = TP.ac();

    //  Iterate over all of the rules and obtain rule information for them. Note
    //  that this may expand the number of rules that we process, since an
    //  individual entry will be made for each simple selector (i.e. if a
    //  selector has a set of simple selectors separated by commas, this method
    //  makes an individual entry for each one).
    rulesLen = rules.getSize();
    for (i = 0; i < rulesLen; i++) {

        //  Note that getting the rule info here may expand the number of
        //  entries that we're processing beyond the original rule set, since an
        //  individual entry will be made for each simple selector. In other
        //  word, if a selector has a set of simple selectors separated by
        //  commas, this method makes an individual entry for each one.
        newEntries = TP.styleRuleGetRuleInfo(rules.at(i), allStyleSheets);

        ruleInfo.push(newEntries);
    }

    //  We have an Array of nested Arrays - flatten them.
    ruleInfo = ruleInfo.flatten();

    //  Now, because when computing the rule info, we might have had multiple
    //  selectors joined by ',', there will be individual rules that the element
    //  might not actually match (because it was joined with a ',' to a selector
    //  that it *did* match). So we do a further filtering here.
    ruleInfo = ruleInfo.filter(
                function(aRuleEntry) {
                    return TP.elementMatchesCSS(
                            anElement, aRuleEntry.at('selector'));
                });

    //  Sort the remaining rules by CSS specificity and order.
    ruleInfo.sort(TP.sort.CSS_RULE_SORT);

    return ruleInfo;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetComputedStyleString',
function(anElement, aProperty) {

    /**
     * @method elementGetComputedStyleString
     * @summary Returns the element's computed style as a String, or the value
     *     of a specific property if one is provided. When acquiring the entire
     *     style string you can get a TP.core.Hash of those values using
     *     TP.core.Hash.fromCSSString(str);
     * @param {HTMLElement} anElement The element to retrieve the computed style
     *     for.
     * @param {String|Array} aProperty An optional property name or names to
     *     query for.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidStyle
     * @returns {String} The computed style of the supplied element/property, or
     *     the empty String if there was no style.
     */

    var compStyleObj,
        properties,

        styleStr;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.notValid(compStyleObj =
                    TP.elementGetComputedStyleObj(anElement))) {
        return TP.raise(this, 'TP.sig.InvalidStyle');
    }

    if (TP.isString(aProperty)) {
        return TP.join(aProperty.asCSSName(),
                        ':',
                        compStyleObj[aProperty.asDOMName()],
                        ';');
    }

    if (TP.isEmpty(properties = aProperty)) {
        properties = TP.CSS_ALL_PROPERTIES;
    }

    styleStr = TP.ac();

    properties.perform(
        function(propName) {
            var value;

            value = compStyleObj[propName.asDOMName()];
            if (TP.notEmpty(value)) {
                styleStr.push(propName.asCSSName(), ':', value, ';');
            }
        });

    return styleStr.join('');
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetComputedStyleProperty',
function(anElement, aProperty) {

    /**
     * @method elementGetComputedStyleProperty
     * @summary Gets the element's *computed* style property named by the
     *     supplied property name.
     * @param {HTMLElement} anElement The element to get the computed style
     *     property from.
     * @param {String} aProperty The name of the style property to get.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidStyle
     * @returns {Object} The current computed value of the style property named
     *     by aProperty on the supplied element.
     */

    var compStyleObj,
        value;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(aProperty)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    if (TP.notValid(compStyleObj = TP.elementGetComputedStyleObj(anElement))) {
        return TP.raise(this, 'TP.sig.InvalidStyle');
    }

    //  If the property is a CSS custom property, then use the
    //  getPropertyValue() API
    if (TP.regex.CSS_CUSTOM_PROPERTY_NAME.test(aProperty)) {
        value = compStyleObj.getPropertyValue(aProperty);
    } else {
        value = compStyleObj[aProperty.asDOMName()];
    }

    return value;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetStyleString',
function(anElement, aProperty) {

    /**
     * @method elementGetStyleString
     * @summary Returns the element's CSS style (its 'inline style') as a
     *     String, or the value of a specific property if one is provided. When
     *     acquiring the entire style string you can get a TP.core.Hash of those
     *     values using TP.core.Hash.fromCSSString(str);
     * @param {HTMLElement} anElement The element to retrieve the inline CSS
     *     style for.
     * @param {String|Array} aProperty An optional property name or names to
     *     query for.
     * @exception TP.sig.InvalidElement
     * @returns {String} The inline CSS style of the supplied element/property,
     *     or the empty String if there was no style.
     */

    var style,
        styleHash,

        properties,

        styleStr;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    style = TP.elementGetStyleObj(anElement).cssText.toLowerCase();

    //  If the user doesn't want a particular property, or the 'cssText' is
    //  empty, we just return the cssText.
    if (TP.isEmpty(aProperty) || TP.isEmpty(style)) {
        return style;
    }

    styleHash = TP.styleStringAsHash(style);
    if (TP.isString(aProperty)) {
        return TP.join(aProperty.asCSSName(),
                        ':',
                        styleHash.at(aProperty.asDOMName()),
                        ';');
    } else {
        properties = aProperty;
    }

    styleStr = TP.ac();

    properties.perform(
        function(propName) {
            var value;

            value = styleHash.at(propName.asDOMName());
            if (TP.notEmpty(value)) {
                styleStr.push(propName.asCSSName(), ':', value, ';');
            }
        });

    return styleStr.join('');
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetStyleObj',
function(anElement) {

    /**
     * @method elementGetStyleObj
     * @summary Returns the element's CSS style object (its 'inline style').
     * @param {HTMLElement} anElement The element to retrieve the inline CSS
     *     style object for.
     * @exception TP.sig.InvalidElement
     * @returns {Object} The inline CSS style object of the supplied element.
     */

    var styleObj;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isStyleDeclaration(styleObj = anElement.style)) {
        return styleObj;
    }

    return TP.elementGetPseudoInlineStyleObj(anElement);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetStyleProperty',
function(anElement, aProperty) {

    /**
     * @method elementGetStyleProperty
     * @summary Gets the style property named by the supplied property name on
     *     the style of the supplied element.
     * @param {HTMLElement} anElement The element to get the style property
     *     from.
     * @param {String} aProperty The name of the style property to get.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidParameter
     * @returns {String} The current value of the style property named by
     *     aProperty on the supplied element.
     */

    var style,
        styleHash;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(aProperty)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    style = TP.elementGetStyleObj(anElement).cssText.toLowerCase();

    styleHash = TP.styleStringAsHash(style);

    return styleHash.at(aProperty.asDOMName());
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementHasStyleString',
function(anElement, aProperty) {

    /**
     * @method elementHasStyleString
     * @summary Returns true if the element has 'inline style'. If a property
     *     is provided the return value is based on whether that property is
     *     inline for the element.
     * @param {HTMLElement} anElement The element to test.
     * @param {String} aProperty A CSS property name.
     * @exception TP.sig.InvalidElement
     * @returns {Boolean} True if the element's inline style is not empty.
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    return TP.notEmpty(TP.elementGetStyleString(anElement, aProperty));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementPopStyleProperty',
function(anElement, aProperty) {

    /**
     * @method elementPopStyleProperty
     * @summary 'Pop's the previously pushed style property named by aProperty
     *     from the receiver and returns that value. NB: This call does *not*
     *     set any style properties of the supplied element.
     * @param {HTMLElement} anElement The element to pop the style property
     *     from.
     * @param {String} aProperty The name of the style property to pop.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidParameter
     * @returns {Object} The value of the style property named by aProperty on
     *     anElement that had been pushed earlier.
     */

    var vals;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(aProperty)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    if (TP.isArray(vals = anElement[aProperty + '_vals'])) {
        return vals.pop();
    } else {
        return null;
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementPopAndSetStyleProperty',
function(anElement, aProperty) {

    /**
     * @method elementPopAndSetStyleProperty
     * @summary 'Pop's the previously pushed style property named by aProperty
     *     from the receiver, uses that value as the new value for the property
     *     on the supplied element and returns that value.
     * @param {HTMLElement} anElement The element to pop the style property
     *     from.
     * @param {String} aProperty The name of the style property to pop and set.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidParameter
     * @returns {Object} The value of the style property named by aProperty on
     *     anElement that had been pushed earlier.
     */

    var val;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(aProperty)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    val = TP.elementPopStyleProperty(anElement, aProperty);
    TP.elementSetStyleProperty(anElement, aProperty, val);

    return val;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementPreserveStyle',
function(anElement) {

    /**
     * @method elementPreserveStyle
     * @summary Saves anElement's current inline style, if it exists. This can
     *     later be restored using TP.elementRestoreStyle().
     * @param {HTMLElement} anElement The element to test.
     * @exception TP.sig.InvalidElement
     * @returns {Element} The element.
     */

    //  Go ahead and set this, even if the style is the empty String.
    TP.elementSetAttribute(anElement,
                            'tibet:style',
                            TP.elementGetStyleString(anElement),
                            true);

    return anElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementPushStyleProperty',
function(anElement, aProperty, aPropertyValue) {

    /**
     * @method elementPushStyleProperty
     * @summary Pushes a value for the style property named by aProperty on the
     *     supplied element using the supplied property value. NB: This call
     *     does *not* set any style properties of the supplied element.
     * @param {HTMLElement} anElement The element to push the style property on.
     * @param {String} aProperty The name of the style property to push.
     * @param {String|Number} aPropertyValue The value to push.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidParameter
     */

    var propVal,
        vals;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(aProperty)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  NB: We allow aPropertyValue to be empty, but not null or undefined,
    //  here, since we very well may be capturing the fact that the element
    //  has no 'inline' style property set.

    propVal = TP.ifInvalid(aPropertyValue, '');

    if (TP.isArray(vals = anElement[aProperty + '_vals'])) {
        vals.push(propVal);
    } else {
        vals = TP.ac(propVal);
        anElement[aProperty + '_vals'] = vals;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementPushAndSetStyleProperty',
function(anElement, aProperty, aPropertyValue) {

    /**
     * @method elementPushAndSetStyleProperty
     * @summary Pushes the *current* value for the style property named by
     *     aProperty on the supplied element and sets the style property to the
     *     supplied property value.
     * @param {HTMLElement} anElement The element to push the style property on.
     * @param {String} aProperty The name of the style property to push.
     * @param {String|Number} aPropertyValue The value to set as the new value.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidParameter
     */

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(aProperty)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    //  Get the current value of the style property and 'push' it onto the
    //  tracked property values for this element.
    TP.elementPushStyleProperty(
                        anElement,
                        aProperty,
                        TP.elementGetStyleProperty(anElement, aProperty));

    //  Set the style property of the element to the supplied value.
    TP.elementSetStyleProperty(anElement, aProperty, aPropertyValue);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementRemoveStyleValue',
function(anElement, aProperty) {

    /**
     * @method elementRemoveStyleValue
     * @summary Removes a property from the element's inline style, or all
     *     inline style if no property is provided.
     * @param {HTMLElement} anElement The element to test.
     * @param {String} aProperty The property name to remove.
     * @exception TP.sig.InvalidElement
     * @returns {Element} The element.
     */

    var str,
        re,
        css;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    css = TP.elementGetStyleString(anElement);
    if (TP.isEmpty(css)) {
        return anElement;
    }

    if (TP.isEmpty(aProperty)) {
        str = '';
    } else {
        re = TP.rc(aProperty.asCSSName() + '(.*)?;');
        str = css.strip(re);
    }

    return TP.elementSetStyleString(anElement, str);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementRemoveStyleProperty',
function(anElement, aProperty) {

    /**
     * @method elementRemoveStyleProperty
     * @summary Removes the style property named by the supplied property name
     *     from the style of the supplied element.
     * @param {HTMLElement} anElement The element to remove the style property
     *     from.
     * @param {String|Array} aProperty The name of the style property to remove.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidParameter
     */

    var style,
        styleHash,

        i;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(aProperty)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    style = TP.elementGetStyleObj(anElement).cssText.toLowerCase();

    //  just one property? then return just that item as a string
    styleHash = TP.styleStringAsHash(style);

    if (TP.isArray(aProperty)) {
        for (i = 0; i < aProperty.getSize(); i++) {
            styleHash.removeKey(aProperty.at(i).asDOMName());
        }
    } else {
        styleHash.removeKey(aProperty.asDOMName());
    }

    TP.elementSetStyleString(anElement, styleHash);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementReplaceStyleValue',
function(anElement, aProperty, oldValue, newValue) {

    /**
     * @method elementReplaceStyleValue
     * @summary Replaces a property value in the receiver's inline style.
     * @param {HTMLElement} anElement The element to test.
     * @param {String} aProperty The property name to replace.
     * @param {String} oldValue The current value to find.
     * @param {String} newValue The new value to set.
     * @exception TP.sig.InvalidElement
     * @returns {Element} The element.
     */

    var str,
        re,
        css;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    css = TP.elementGetStyleString(anElement);
    if (TP.isEmpty(css)) {
        return anElement;
    }

    if (TP.isEmpty(aProperty)) {
        str = '';
    } else {
        re = TP.rc(aProperty.asCSSName() + '(.*)?;');
        str = css.strip(re);
    }

    return TP.elementSetStyleString(anElement, str);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementResetAppliedNativeStyleRules',
function(anElement) {

    /**
     * @method elementResetAppliedNativeStyleRules
     * @summary Resets the element *and all of its descendants* Arrays of
     *     CSSRule objects that apply to them to null.
     * @param {Element} anElement The element to begin resetting the CSS style
     *     rules for.
     * @exception TP.sig.InvalidElement
     */

    var descendants,

        len,
        i;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    anElement[TP.APPLIED_RULES] = null;

    descendants = TP.nodeGetDescendantElements(anElement);

    len = descendants.getSize();
    for (i = 0; i < len; i++) {
        descendants.at(i)[TP.APPLIED_RULES] = null;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementRestoreStyle',
function(anElement) {

    /**
     * @method elementRestoreStyle
     * @summary Restores anElement's preserved style, if it exists.
     * @param {HTMLElement} anElement The element to test.
     * @exception TP.sig.InvalidElement
     * @returns {Element} The element.
     */

    if (TP.elementHasAttribute(anElement, 'tibet:style', true)) {
        TP.elementSetStyleString(
                anElement,
                TP.elementGetAttribute(anElement, 'tibet:style', true));
    }

    return anElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementSetStyleString',
function(anElement, theStyle) {

    /**
     * @method elementSetStyleString
     * @summary Sets the element's CSS style (its 'inline style') to the
     *     supplied CSS-formatted style String.
     * @param {HTMLElement} anElement The element to set the inline CSS style
     *     for.
     * @param {String|TP.core.Hash} theStyle A string or hash of style content.
     * @exception TP.sig.InvalidElement
     * @returns {Element} The element.
     */

    var styleObj;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    styleObj = TP.elementGetStyleObj(anElement);

    if (TP.notValid(theStyle)) {
        styleObj.cssText = null;
    } else if (TP.isString(theStyle)) {
        styleObj.cssText = theStyle;
    } else if (TP.isHash(theStyle)) {
        //  Pass 'false' to not quote values with whitespace.
        styleObj.cssText = TP.styleStringFromHash(theStyle, false);
    } else {
        return TP.raise(this, 'InvalidStyle',
                        'Style content must be string or TP.core.Hash');
    }

    return anElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementSetStyleProperty',
function(anElement, aProperty, aPropertyValue) {

    /**
     * @method elementSetStyleProperty
     * @summary Sets the style property named by the supplied property name on
     *     the style of the supplied element using the supplied property value.
     * @param {HTMLElement} anElement The element to set the style property on.
     * @param {String} aProperty The name of the style property to set.
     * @param {String|Number} aPropertyValue The value to set the style property
     *     to.
     * @exception TP.sig.InvalidElement
     * @exception TP.sig.InvalidParameter
     */

    var styleObj;

    if (!TP.isElement(anElement)) {
        return TP.raise(this, 'TP.sig.InvalidElement');
    }

    if (TP.isEmpty(aProperty)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    if (TP.notValid(styleObj = TP.elementGetStyleObj(anElement))) {
        return TP.raise(this, 'TP.sig.InvalidStyle');
    }

    //  If the property is a CSS custom property, then use the setProperty()
    //  API.
    if (TP.regex.CSS_CUSTOM_PROPERTY_NAME.test(aProperty)) {
        styleObj.setProperty(aProperty, aPropertyValue);
    } else {
        styleObj[aProperty.asDOMName()] = aPropertyValue;
    }

    return;
});

//  ------------------------------------------------------------------------
//  STYLE STRING CONVERSION
//  ------------------------------------------------------------------------

TP.definePrimitive('styleStringAsHash',
function(aStyleString) {

    /**
     * @method styleStringAsHash
     * @summary Converts a properly formatted CSS style string into the
     *     equivalent TP.core.Hash. The keys in the hash are in their "DOM"
     *     form, i.e. 'float' becomes 'cssFloat', etc.
     * @param {String} aStyleString A string of the form key:value;key:value;.
     * @returns {TP.core.Hash} A new hash of CSS property/value pairs.
     */

    if (TP.isEmpty(aStyleString)) {
        return TP.hc();
    }

    return TP.core.Hash.fromString(aStyleString);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('styleStringFromHash',
function(aHash, quoteWhitespaceValues) {

    /**
     * @method styleStringFromHash
     * @summary Returns the provided hash's key/value pairs as a valid CSS
     *     style string. Each key in the hash is processed via the asCSSName()
     *     String method to try to ensure a valid result.
     * @param {TP.core.Hash} aHash A valid TP.core.Hash containing keys suitable
     *     for a CSS string.
     * @param {Boolean} quoteWhitespaceValues Whether or not whitespace values
     *     should be quoted.
     * @returns {String} A String in the format of a CSS style string.
     */

    var str,

        keys,
        len,
        i,

        val,
        quote;

    if (TP.isEmpty(aHash)) {
        return '';
    }

    str = TP.ac();

    keys = TP.keys(aHash);
    len = keys.getSize();
    quote = TP.ifInvalid(quoteWhitespaceValues, false);

    for (i = 0; i < len; i++) {
        if (/ /.test(val = aHash.at(keys.at(i))) && quote) {
            val = val.quoted('"');
        }

        str.push(keys.at(i).asCSSName(), ':', val, '; ');
    }

    str = str.join('');

    //  Slice off the last space
    return str.slice(0, str.getSize() - 1);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('cssDimensionValuesFromString',
function(aValueString) {

    /**
     * @method cssDimensionValuesFromString
     * @summary Extracts dimension values from the supplied String, according
     *     to the standard CSS rules for doing so.
     * @description The CSS rules used for parsing values for dimensional
     *     properties, like padding, are:
     *
     *     1 value applies to all sides 2 values first value applies to top &
     *     bottom, second value to right & left 3 values first value applies to
     *     top, second value to right & left and third value to bottom 4 values
     *     first value applies to top, second value to right, third value to
     *     left and fourth value to bottom.
     * @param {String} aValueString The String containing the values to extract
     *     the values from.
     * @returns {TP.core.Hash} The hash of values containing the following keys:
     *     top, right, bottom, left.
     */

    var origValues;

    if (TP.isEmpty(aValueString)) {
        return TP.hc();
    }

    origValues = aValueString.split(' ');

    switch (origValues.getSize()) {
        case 1:

            return TP.hc('top', origValues.at(0),
                            'right', origValues.at(0),
                            'bottom', origValues.at(0),
                            'left', origValues.at(0));
        case 2:

            return TP.hc('top', origValues.at(0),
                            'right', origValues.at(1),
                            'bottom', origValues.at(0),
                            'left', origValues.at(1));
        case 3:

            return TP.hc('top', origValues.at(0),
                            'right', origValues.at(1),
                            'bottom', origValues.at(2),
                            'left', origValues.at(1));
        case 4:

            return TP.hc('top', origValues.at(0),
                            'right', origValues.at(1),
                            'bottom', origValues.at(2),
                            'left', origValues.at(3));
        default:
            break;
    }

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
