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
TP.CSS_ALL_PROPERTIES = TP.ac('azimuth',
                                'background',
                                'backgroundAttachment',
                                'backgroundColor',
                                'backgroundImage',
                                'backgroundPosition',
                                'backgroundRepeat',
                                'border',
                                'borderCollapse',
                                'borderColor',
                                'borderSpacing',
                                'borderStyle',
                                'borderTop',
                                'borderRight',
                                'borderBottom',
                                'borderLeft',
                                'borderTopColor',
                                'borderRightColor',
                                'borderBottomColor',
                                'borderLeftColor',
                                'borderTopStyle',
                                'borderRightStyle',
                                'borderBottomStyle',
                                'borderLeftStyle',
                                'borderTopWidth',
                                'borderRightWidth',
                                'borderBottomWidth',
                                'borderLeftWidth',
                                'borderWidth',
                                'bottom',
                                'captionSide',
                                'clear',
                                'clip',
                                'color',
                                'content',
                                'counterIncrement',
                                'counterReset',
                                'cssFloat',
                                'cue',
                                'cueAfter',
                                'cueBefore',
                                'cursor',
                                'direction',
                                'display',
                                'elevation',
                                'emptyCells',
                                'font',
                                'fontFamily',
                                'fontSize',
                                'fontSizeAdjust',
                                'fontStretch',
                                'fontStyle',
                                'fontVariant',
                                'fontWeight',
                                'height',
                                'imeMode',
                                'length',
                                'left',
                                'letterSpacing',
                                'lineHeight',
                                'listStyle',
                                'listStyleImage',
                                'listStylePosition',
                                'listStyleType',
                                'margin',
                                'marginTop',
                                'marginRight',
                                'marginBottom',
                                'marginLeft',
                                'markerOffset',
                                'marks',
                                'maxHeight',
                                'maxWidth',
                                'minHeight',
                                'minWidth',
                                'opacity',
                                'orphans',
                                'outline',
                                'outlineColor',
                                'outlineOffset',
                                'outlineStyle',
                                'outlineWidth',
                                'overflow',
                                'overflowX',
                                'overflowY',
                                'padding',
                                'paddingTop',
                                'paddingRight',
                                'paddingBottom',
                                'paddingLeft',
                                'page',
                                'pageBreakAfter',
                                'pageBreakBefore',
                                'pageBreakInside',
                                'parentRule',
                                'pause',
                                'pauseAfter',
                                'pauseBefore',
                                'pitch',
                                'pitchRange',
                                'pointerEvents',
                                'position',
                                'quotes',
                                'richness',
                                'right',
                                'size',
                                'speak',
                                'speakHeader',
                                'speakNumeral',
                                'speakPunctuation',
                                'speechRate',
                                'stress',
                                'tableLayout',
                                'textAlign',
                                'textDecoration',
                                'textIndent',
                                'textShadow',
                                'textTransform',
                                'top',
                                'unicodeBidi',
                                'verticalAlign',
                                'visibility',
                                'voiceFamily',
                                'volume',
                                'whiteSpace',
                                'width',
                                'widows',
                                'wordSpacing',
                                'wordWrap',
                                'zIndex');

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

//  A TP.lang.Hash of CSS color names. Note that the CSS3 color module
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

TP.definePrimitive('convertHueToRGB',
function(m1, m2, aHue) {

    /**
     * @method convertHueToRGB
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

TP.definePrimitive('convertHSLAToRGBA',
function(aHue, aSaturation, aLightness, anAlpha) {

    /**
     * @method convertHSLAToRGBA
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
    redVal = TP.convertHueToRGB(m1, m2, theHue + (1 / 3)) * 256;

    //  Blue value
    blueVal = TP.convertHueToRGB(m1, m2, theHue) * 256;

    //  Green value
    greenVal = TP.convertHueToRGB(m1, m2, theHue - (1 / 3)) * 256;

    /* eslint-enable no-extra-parens */

    rgbVal = TP.ac(redVal, blueVal, greenVal);

    //  If an alpha value was supplied, go ahead and push it here.
    if (TP.isNumber(anAlpha)) {
        rgbVal.push(anAlpha);
    }

    return rgbVal;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('convertColorStringToHex',
function(aString) {

    /**
     * @method convertColorStringToHex
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
        rgbResults = TP.convertColorStringToArray(aString);
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

TP.definePrimitive('convertColorStringToArray',
function(aString) {

    /**
     * @method convertColorStringToArray
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
        results = TP.convertHSLAToRGBA(parseFloat(results.at(0)),
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
        results = TP.convertHSLAToRGBA(parseFloat(results.at(0)),
                                        parseFloat(results.at(1)) / 100,
                                        parseFloat(results.at(2)) / 100);

        return results;
    }

    //  Get the color string canonicalized into a form of '#RRGGBB'
    colorString = TP.convertColorStringToHex(aString);

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

TP.definePrimitive('convertColorStringToLongNumber',
function(aString) {

    /**
     * @method convertColorStringToLongNumber
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

    if (TP.isString(hexString = TP.convertColorStringToHex(aString))) {
        //  Make sure and slice off the '#'
        return parseInt(hexString.slice(1), 16);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('convertLongNumberToColorString',
function(aLongNumber) {

    /**
     * @method convertLongNumberToColorString
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

    /* jshint bitwise:false */
    /* eslint-disable no-constant-condition,no-extra-parens,semi-spacing */
    for (i = 24; (i -= 4) >= 0;) {
        str += hexChars.charAt((aLongNumber >> i) & 0xF);
    }
    /* eslint-enable no-constant-condition,no-extra-parens,semi-spacing */
    /* jshint bitwise:true */

    return str;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('interpolateColors',
function(color1, color2, aPercentage) {

    /**
     * @method interpolateColors
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

    /* jshint bitwise:false */
    /* eslint-disable no-constant-condition,no-extra-parens,semi-spacing */
    for (i = 24; (i -= 8) >= 0;) {
        ca = (color1 >> i) & 0xFF;
        cb = (color2 >> i) & 0xFF;
        cc = Math.floor(ca * (1 - aPercentage) + cb * aPercentage);
        n |= cc << i;
    }
    /* eslint-enable no-constant-condition,no-extra-parens,semi-spacing */
    /* jshint bitwise:true */

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
     * @exception TP.sig.InvalidElement,TP.sig.InvalidParameter
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
            theValue = TP.elementGetStyleValueInPixels(targetElement,
                                                        'fontSize');

        break;

        case 'lineHeight':

            //  When lineHeight is a percentage, it is computed from the
            //  element's fontSize.
            targetElement = anElement;
            theValue = TP.elementGetStyleValueInPixels(targetElement,
                                                        'fontSize');

        break;

        case 'verticalAlign':

            //  When verticalAlign is a percentage, it is computed from the
            //  element's lineHeight.
            targetElement = anElement;
            theValue = TP.elementGetStyleValueInPixels(targetElement,
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
     * @exception TP.sig.InvalidElement,TP.sig.InvalidParameter
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

TP.definePrimitive('elementAddStyle',
function(anElement, aProperty, aValue) {

    /**
     * @method elementAddStyle
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

    style = TP.elementGetStyle(anElement);
    dict = TP.styleStringAsHash(style);

    name = aProperty.asDOMName();

    value = dict.at(name);
    if (TP.isEmpty(value)) {
        dict.atPut(name, aValue);
    } else {
        dict.atPut(name, TP.join(value, ' ', aValue));
    }

    style = TP.styleStringFromHash(dict);
    TP.elementSetStyle(anElement, style);

    return anElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetComputedStyle',
function(anElement, aProperty) {

    /**
     * @method elementGetComputedStyle
     * @summary Returns the element's computed style as a String, or the value
     *     of a specific property if one is provided. When acquiring the entire
     *     style string you can get a TP.lang.Hash of those values using
     *     TP.lang.Hash.fromCSSString(str);
     * @param {HTMLElement} anElement The element to retrieve the computed style
     *     for.
     * @param {String|Array} aProperty An optional property name or names to
     *     query for.
     * @exception TP.sig.InvalidElement,TP.sig.InvalidStyle
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
     * @exception TP.sig.InvalidElement,TP.sig.InvalidParameter,
     *         TP.sig.InvalidStyle
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

    value = compStyleObj[aProperty.asDOMName()];

    return value;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementGetStyle',
function(anElement, aProperty) {

    /**
     * @method elementGetStyle
     * @summary Returns the element's CSS style (its 'inline style') as a
     *     String, or the value of a specific property if one is provided. When
     *     acquiring the entire style string you can get a TP.lang.Hash of those
     *     values using TP.lang.Hash.fromCSSString(str);
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
     * @exception TP.sig.InvalidElement,TP.sig.InvalidParameter
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

    style = anElement.style.cssText.toLowerCase();

    styleHash = TP.styleStringAsHash(style);

    return styleHash.at(aProperty.asDOMName());
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementHasStyle',
function(anElement, aProperty) {

    /**
     * @method elementHasStyle
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

    return TP.notEmpty(TP.elementGetStyle(anElement, aProperty));
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
     * @exception TP.sig.InvalidElement,TP.sig.InvalidParameter
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

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementPopStyleProperty',
function(anElement, aProperty) {

    /**
     * @method elementPopStyleProperty
     * @summary 'Pop's the previously pushed style property named by aProperty
     *     from the receiver, uses that value as the new value for the property
     *     on the supplied element and returns that value.
     * @param {HTMLElement} anElement The element to pop the style property
     *     from.
     * @param {String} aProperty The name of the style property to pop and set.
     * @exception TP.sig.InvalidElement,TP.sig.InvalidParameter
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
                            TP.elementGetStyle(anElement),
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
     * @exception TP.sig.InvalidElement,TP.sig.InvalidParameter
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
     * @exception TP.sig.InvalidElement,TP.sig.InvalidParameter
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

TP.definePrimitive('elementRemoveStyle',
function(anElement, aProperty) {

    /**
     * @method elementRemoveStyle
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

    css = TP.elementGetStyle(anElement);
    if (TP.isEmpty(css)) {
        return anElement;
    }

    if (TP.isEmpty(aProperty)) {
        str = '';
    } else {
        re = TP.rc(aProperty.asCSSName() + '(.*)?;');
        str = css.strip(re);
    }

    return TP.elementSetStyle(anElement, str);
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
     * @exception TP.sig.InvalidElement,TP.sig.InvalidParameter
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

    TP.elementSetStyle(anElement, styleHash);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementReplaceStyle',
function(anElement, aProperty, oldValue, newValue) {

    /**
     * @method elementReplaceStyle
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

    css = TP.elementGetStyle(anElement);
    if (TP.isEmpty(css)) {
        return anElement;
    }

    if (TP.isEmpty(aProperty)) {
        str = '';
    } else {
        re = TP.rc(aProperty.asCSSName() + '(.*)?;');
        str = css.strip(re);
    }

    return TP.elementSetStyle(anElement, str);
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
        TP.elementSetStyle(
                anElement,
                TP.elementGetAttribute(anElement, 'tibet:style', true));
    }

    return anElement;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('elementSetStyle',
function(anElement, theStyle) {

    /**
     * @method elementSetStyle
     * @summary Sets the element's CSS style (its 'inline style') to the
     *     supplied CSS-formatted style String.
     * @param {HTMLElement} anElement The element to set the inline CSS style
     *     for.
     * @param {String|TP.lang.Hash} theStyle A string or hash of style content.
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
    } else if (TP.isKindOf(theStyle, 'TP.lang.Hash')) {
        //  Pass 'false' to not quote values with whitespace.
        styleObj.cssText = TP.styleStringFromHash(theStyle, false);
    } else {
        return TP.raise(this, 'InvalidStyle',
                        'Style content must be string or TP.lang.Hash');
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
     * @exception TP.sig.InvalidElement,TP.sig.InvalidParameter
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

    //  If the property value is empty (i.e. it's either not valid or is the
    //  empty string), then we remove it's key from the styleHash. When the
    //  CSS text string is formed, it will simply be missing.
    if (TP.isEmpty(aPropertyValue)) {
        styleHash.removeKey(aProperty.asDOMName());
    } else {
        styleHash.atPut(aProperty.asDOMName(), aPropertyValue);
    }

    TP.elementSetStyle(anElement, styleHash);

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$eventHandleStyleInsertion',
function(insertionEvent) {

    /**
     * @method $eventHandleStyleInsertion
     * @summary An event handler that is called upon document loading or
     *     writing to capture DOM Node insertions of 'style' or 'link' (to CSS
     *     style sheets) elements.
     * @description Because Webkit-based browsers are so "particular" about the
     *     CSS in loaded sheets (normally a good thing), we've got to grab our
     *     CSS sheets early and rip them out of the document to avoid all of the
     *     errors that it will spew to the JavaScript console.
     *
     *     What errors? Primarily warnings about pseudo-classes or
     *     pseudo-elements, which seems to us to be a possible bug in the CSS
     *     logic of Mozilla since our usage of these is limited to namespaces
     *     where they are a part of the spec (as in XForms' ::value) for that
     *     namespace, or where they're attached to a class or ID as in
     *     #mydiv::head, where the namespace of the element can't really be
     *     known to the CSS processor when it's running -- which is before the
     *     body of the document has been constructed.
     *
     *     In any case, we define a function here that is used as the handler to
     *     a DOMNodeInserted event installed on the 'head' element. It grabs any
     *     'style' elements or 'link' elements (with a 'rel' of 'stylesheet'),
     *     stores them away and rips them out of the document to avoid errors.
     * @param {Event} insertionEvent The Event object that was sent when the
     *     style node was inserted into the document.
     */

    var nodeJustInserted,
        nodeWindow,

        nodeDoc;

    //  The node that was just inserted is the target of the event.
    nodeJustInserted = insertionEvent.target;

    //  If its not an Element, it must have been a Text node or something else.
    //  Exit here.
    if (!TP.isElement(nodeJustInserted)) {
        return;
    }

    nodeDoc = TP.nodeGetDocument(nodeJustInserted);

    if (nodeDoc.readyState === 'complete') {
        return;
    }

    nodeWindow = TP.nodeGetWindow(nodeJustInserted);

    //  If the style or link element has been marked as 'tibet:opaque', then
    //  mark it as 'dontprocess' and return.
    if (TP.elementHasAttribute(nodeJustInserted, 'tibet:opaque', true)) {
        TP.elementSetAttribute(nodeJustInserted, 'dontprocess', 'true');

        return;
    }

    //  If it was a 'style' element, then push it onto our global style elements
    //  list and rip it out of the document.
    if (nodeJustInserted.tagName.toLowerCase() === 'style') {
        if (TP.notValid(nodeWindow.$globalStyleElements)) {
            nodeWindow.$globalStyleElements = TP.ac();
        }

        nodeWindow.$globalStyleElements.push(nodeJustInserted);
        TP.nodeDetach(nodeJustInserted);
    }

    //  If it was a 'link' element (and was a 'stylesheet'), then push it onto
    //  our global link elements list and rip it out of the document.
    if (nodeJustInserted.tagName.toLowerCase() === 'link') {
        if (TP.elementGetAttribute(nodeJustInserted, 'rel') !==
            'stylesheet') {
            return;
        }

        if (TP.notValid(nodeWindow.$globalLinkElements)) {
            nodeWindow.$globalLinkElements = TP.ac();
        }

        nodeWindow.$globalLinkElements.push(nodeJustInserted);
        TP.nodeDetach(nodeJustInserted);
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
     *     equivalent TP.lang.Hash. The keys in the hash are in their "DOM"
     *     form, i.e. 'float' becomes 'cssFloat', etc.
     * @param {String} aStyleString A string of the form key:value;key:value;.
     * @returns {TP.lang.Hash} A new hash of CSS property/value pairs.
     */

    if (TP.isEmpty(aStyleString)) {
        return TP.hc();
    }

    return TP.lang.Hash.fromString(aStyleString);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('styleStringFromHash',
function(aHash, quoteWhitespaceValues) {

    /**
     * @method styleStringFromHash
     * @summary Returns the provided hash's key/value pairs as a valid CSS
     *     style string. Each key in the hash is processed via the asCSSName()
     *     String method to try to ensure a valid result.
     * @param {TP.lang.Hash} aHash A valid TP.lang.Hash containing keys suitable
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
    }

    return;
});

//  ------------------------------------------------------------------------
//  SELECTOR PARSING
//  ------------------------------------------------------------------------

TP.SELECTOR_IDENTIFIER = 1;
TP.SELECTOR_ADJACENT_SIBLING_COMBINATOR = 2;
TP.SELECTOR_DOT = 3;
TP.SELECTOR_COLON = 4;
TP.SELECTOR_ATTR_EQUALS = 5;
TP.SELECTOR_ASTERISK = 6;
TP.SELECTOR_ESCAPED_COLON = 7;
TP.SELECTOR_LEFT_PAREN = 8;
TP.SELECTOR_RIGHT_PAREN = 9;
TP.SELECTOR_EOF = 10;
TP.SELECTOR_STRING = 11;
TP.SELECTOR_HASH = 12;
TP.SELECTOR_BANG = 13;
TP.SELECTOR_CHILD_COMBINATOR = 14;
TP.SELECTOR_GENERAL_SIBLING_COMBINATOR = 15;
TP.SELECTOR_ATTR_START = 16;
TP.SELECTOR_ATTR_END = 17;
TP.SELECTOR_ATTR_SPACE_EQUALS = 18;
TP.SELECTOR_ATTR_HYPHEN_EQUALS = 19;
TP.SELECTOR_ATTR_BEGIN_EQUALS = 20;
TP.SELECTOR_ATTR_END_EQUALS = 21;
TP.SELECTOR_ATTR_SUBSTR_EQUALS = 22;
TP.SELECTOR_ATTR_EXISTS = 23;
TP.SELECTOR_WHITESPACE = 24;
TP.SELECTOR_NAME = 25;
TP.SELECTOR_UNKNOWN = 26;

//  ------------------------------------------------------------------------

TP.regex.CSS_WHITESPACE = /^[ \t\r\n\f]+/;

TP.regex.CSS_IDENTIFIER = /^-?([_a-z]|[^\x00-\x7F]|(\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?)|\\[^\n\r\f0-9a-f:])([_a-z0-9-]|[^\x00-\x7F]|(\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?)|\\[^\n\r\f0-9a-f:])*/i;

TP.regex.CSS_NAME = /^([_a-z0-9-]|[^\x00-\x7F]|(\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?)|\\[^\n\r\f0-9a-f:])+/i;

TP.regex.CSS_DOUBLE_QUOTED_STR = /^\"([^\n\r\f\\\"]|\\(\n|\r\n|\r|\f)|[^\x00-\x7F]|(\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?)|\\[^\n\r\f0-9a-f])*\"/i;

TP.regex.CSS_SINGLE_QUOTED_STR = /^\'([^\n\r\f\\\']|\\(\n|\r\n|\r|\f)|[^\x00-\x7F]|(\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?)|\\[^\n\r\f0-9a-f])*\'/i;

//  ------------------------------------------------------------------------

TP.definePrimitive('$$setupSelectorParseRecord',
function(selectorStr) {

    /**
     * @method $$setupSelectorParseRecord
     * @summary An internal method that sets up an internal data structure for
     *     use by the 'TP.parseCSSSelector' method below.
     * @param {String} selectorStr The selector String to parse.
     * @returns {Object} A private 'parsing record' for use by the calling
     *     method.
     */

    var PERIOD_CHR = '.',
        COLON_CHR = ':',
        LEFT_PAREN_CHR = '(',
        RIGHT_PARENT_CHR = ')',
        LEFT_ANGLEBRACKET_CHR = '<',
        RIGHT_ANGLEBRACKET_CHR = '>',
        HASH_CHR = '#',
        ASTERISK_CHR = '*',
        EQUAL_CHR = '=',
        HYPHEN_CHR = '-',
        EXCLAMATION_CHR = '!',
        LEFT_SQUAREBRACKET_CHR = '[',
        RIGHT_SQUAREBRACKET_CHR = ']',
        ATTR_TILDE_CHAR = '~',
        VERTICAL_BAR_CHR = '|',
        PLUS_CHAR = '+',
        CFLEX_CHR = '^',
        DOLLAR_CHR = '$',
        ESC_CHR = '\\',

        parseRecord;

    parseRecord = {};

    parseRecord.selectorStr = selectorStr;

    parseRecord.offset = 0;
    parseRecord.currentToken = TP.SELECTOR_UNKNOWN;
    parseRecord.lastMatch = '';

    parseRecord.fetchNextToken = function() {

        var tokenRetVal,

            strRemainder,

            nextChar,
            nextNextChar,

            matchResult;

        tokenRetVal = TP.SELECTOR_UNKNOWN;
        strRemainder = this.selectorStr.substring(this.offset);

        if (this.offset >= this.selectorStr.length) {
            tokenRetVal = TP.SELECTOR_EOF;
        } else if (strRemainder.match(TP.regex.CSS_WHITESPACE)) {
            matchResult = RegExp.lastMatch;

            tokenRetVal = TP.SELECTOR_WHITESPACE;

            this.offset += matchResult.length;
        } else if (strRemainder.match(TP.regex.CSS_IDENTIFIER)) {
            matchResult = RegExp.lastMatch;

            tokenRetVal = TP.SELECTOR_IDENTIFIER;

            this.lastMatch = matchResult;
            this.offset += matchResult.length;
        } else if (strRemainder.match(TP.regex.CSS_NAME)) {
            matchResult = RegExp.lastMatch;

            tokenRetVal = TP.SELECTOR_NAME;

            this.lastMatch = matchResult;
            this.offset += matchResult.length;
        } else if (strRemainder.match(TP.regex.CSS_DOUBLE_QUOTED_STR) ||
                    strRemainder.match(TP.regex.CSS_SINGLE_QUOTED_STR)) {
            tokenRetVal = TP.SELECTOR_STRING;

            matchResult = RegExp.lastMatch;

            //  Remove the quotes
            this.lastMatch = matchResult.substr(1, matchResult.length - 2);
            this.offset += matchResult.length;
        } else {
            //  Nothing else matched. Just look for single characters or two
            //  character pairs.
            nextChar = strRemainder.substr(0, 1);

            //  If there's no 'nextNextChar', that's ok. The tests below
            //  will just fail.
            nextNextChar = strRemainder.substr(1, 1);

            switch (nextChar) {
                case PERIOD_CHR:

                    tokenRetVal = TP.SELECTOR_DOT;

                    break;

                case COLON_CHR:

                    tokenRetVal = TP.SELECTOR_COLON;

                    break;

                case ESC_CHR:

                    if (COLON_CHR === nextNextChar) {
                        tokenRetVal = TP.SELECTOR_ESCAPED_COLON;

                        //  Manually advance the offset since we matched 2
                        //  characters.
                        this.offset++;
                    } else {
                        tokenRetVal = TP.SELECTOR_UNKNOWN;

                        TP.ifWarn() ?
                            TP.warn('\'\\\' encountered - ' +
                                        'unknown resolution',
                                    TP.LOG) : 0;
                    }

                    break;

                case LEFT_PAREN_CHR:

                    tokenRetVal = TP.SELECTOR_LEFT_PAREN;

                    break;

                case RIGHT_PARENT_CHR:

                    tokenRetVal = TP.SELECTOR_RIGHT_PAREN;

                    break;

                case LEFT_ANGLEBRACKET_CHR:

                    tokenRetVal = TP.SELECTOR_UNKNOWN;

                    TP.ifWarn() ?
                        TP.warn('\'<\' encountered - unknown resolution',
                                TP.LOG) : 0;

                    break;

                case RIGHT_ANGLEBRACKET_CHR:

                    tokenRetVal = TP.SELECTOR_CHILD_COMBINATOR;

                    break;

                case HASH_CHR:

                    tokenRetVal = TP.SELECTOR_HASH;

                    break;

                case ASTERISK_CHR:

                    if (EQUAL_CHR === nextNextChar) {
                        tokenRetVal = TP.SELECTOR_ATTR_SUBSTR_EQUALS;

                        //  Manually advance the offset since we matched 2
                        //  characters.
                        this.offset++;
                    } else {
                        tokenRetVal = TP.SELECTOR_ASTERISK;
                    }

                    break;

                case EQUAL_CHR:

                    tokenRetVal = TP.SELECTOR_ATTR_EQUALS;

                    break;

                case HYPHEN_CHR:

                    tokenRetVal = TP.SELECTOR_UNKNOWN;

                    TP.ifWarn() ?
                        TP.warn('\'-\' encountered - unknown resolution',
                                TP.LOG) : 0;
                    break;

                case EXCLAMATION_CHR:

                    tokenRetVal = TP.SELECTOR_BANG;

                    break;

                case LEFT_SQUAREBRACKET_CHR:

                    tokenRetVal = TP.SELECTOR_ATTR_START;

                    break;

                case RIGHT_SQUAREBRACKET_CHR:

                    tokenRetVal = TP.SELECTOR_ATTR_END;

                    break;

                case ATTR_TILDE_CHAR:

                    if (EQUAL_CHR === nextNextChar) {
                        tokenRetVal = TP.SELECTOR_ATTR_SPACE_EQUALS;

                        //  Manually advance the offset since we matched 2
                        //  characters.
                        this.offset++;
                    } else {
                        tokenRetVal =
                            TP.SELECTOR_GENERAL_SIBLING_COMBINATOR;
                    }

                    break;

                case VERTICAL_BAR_CHR:

                    if (EQUAL_CHR === nextNextChar) {
                        tokenRetVal = TP.SELECTOR_ATTR_HYPHEN_EQUALS;

                        //  Manually advance the offset since we matched 2
                        //  characters.
                        this.offset++;
                    } else {
                        tokenRetVal = TP.SELECTOR_UNKNOWN;

                        TP.ifWarn() ?
                            TP.warn('Standalone \'|\' encountered -' +
                                        ' unknown resolution',
                                    TP.LOG) : 0;
                    }

                    break;

                case PLUS_CHAR:

                    tokenRetVal = TP.SELECTOR_ADJACENT_SIBLING_COMBINATOR;

                    break;

                case CFLEX_CHR:

                    if (EQUAL_CHR === nextNextChar) {
                        tokenRetVal = TP.SELECTOR_ATTR_BEGIN_EQUALS;

                        //  Manually advance the offset since we matched 2
                        //  characters.
                        this.offset++;
                    } else {
                        tokenRetVal = TP.SELECTOR_UNKNOWN;

                        TP.ifWarn() ?
                            TP.warn('Standalone \'^\' encountered' +
                                    ' - unknown resolution',
                                    TP.LOG) : 0;
                    }

                    break;

                case DOLLAR_CHR:

                    if (EQUAL_CHR === nextNextChar) {
                        tokenRetVal = TP.SELECTOR_ATTR_END_EQUALS;

                        //  Manually advance the offset since we matched 2
                        //  characters.
                        this.offset++;
                    } else {
                        tokenRetVal = TP.SELECTOR_UNKNOWN;

                        TP.ifWarn() ?
                            TP.warn('Standalone \'$\' encountered' +
                                    ' - unknown resolution',
                                    TP.LOG) : 0;
                    }

                    break;

                default:

                    TP.ifWarn() ?
                        TP.warn('Unknown token encountered: ' + nextChar,
                                    TP.LOG) : 0;

                    break;
            }

            this.offset++;
        }

        this.currentToken = tokenRetVal;

        return tokenRetVal;
    };

    //  ---

    parseRecord.peekNextToken = function() {

        //  Mark where we're at, call fetchNextToken(), and then 'undo' the
        //  fetch.
        var savedOffset,
            savedLastText,
            tokenRetVal;

        savedOffset = this.offset;
        savedLastText = this.lastMatch;
        tokenRetVal = this.fetchNextToken();

        this.offset = savedOffset;
        this.lastMatch = savedLastText;

        return tokenRetVal;
    };

    //  ---

    parseRecord.getLastMatch = function() {

        return this.lastMatch;
    };

    //  ---

    parseRecord.getCurrentOffset = function() {

        return this.offset;
    };

    //  ---

    parseRecord.getCurrentToken = function() {

        return this.currentToken;
    };

    //  ---

    parseRecord.fetchNextNonWSToken = function() {

        var currentToken;

        currentToken = this.fetchNextToken();

        while (currentToken === TP.SELECTOR_WHITESPACE) {
            currentToken = this.fetchNextToken();
        }

        return currentToken;
    };

    return parseRecord;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('parseCSSSelector',
function(strSelectorText, strictPseudos) {

    /**
     * @method parseCSSSelector
     * @summary Parses the supplied selector text into a data structure
     *     containing an Array of alternating TP.lang.Hashes (representing each
     *     'simple' selector) and constant values representing the combinators
     *     separating them.
     * @description The returned data structure has the following keys (note
     *     that due to the way selectors can be constructed, all of these are
     *     optional and may not exist):
     *
     *     'namespace' -> The selector's CSS3 namespace. 'tagName' -> The
     *     selector's tag name (could be '*' for the universal selector). 'id'
     *     -> The selector's tag name. 'classes' -> An Array of the selector's
     *     classes. 'attributes' -> A TP.lang.Hash of TP.lang.Hashes, keyed by
     *     the attribute name. Each TP.lang.Hash entry contains information of
     *     that portion of the attribute description: 'op' -> The attribute
     *     operator. 'value' -> The attribute value. 'pseudoClasses' -> An Array
     *     of the selector's pseudoclasses. Each item in this Array may be a
     *     single String containing the pseudo class name, indicating a 'simple
     *     pseudoclass' (i.e. one without a parenthesized expression), or an
     *     Array with the pseudo class name as the first item and the
     *     information returned from this method as applied to the parenthesized
     *     contents, in the second item. 'pseudoElement' -> The selector's
     *     pseudo element.
     *
     *
     * @param {String} strSelectorText The selector String to parse.
     * @param {Boolean} strictPseudos If true, only pseudoclasses and
     *     pseudoelements in the CSS specification will be matched. If false,
     *     any 'invented' pseudoclass or pseudoelement can be captured. By
     *     default this is false.
     * @returns {Array} An Array of TP.lang.Hashes containing the keys described
     *     above alternated with the constant value containing the combinator
     *     separating them.
     */

    var strictPseudoMatch,

        str,

        parseRecord,

        wholeSelectorEntry,
        simpleSelectorEntry,

        currentToken,
        peekedToken,

        classArr,
        attrHash,
        pClassArr,

        lastMatch,

        pClassName,
        attrEntry,
        startParenOffset,
        endParenOffset,
        parenContentStr,
        parenSelInfo,

        val;

    //  We only 'match strict' for pseudo classes and pseudo elements if the
    //  caller specifically wants to.
    strictPseudoMatch = TP.ifInvalid(strictPseudos, false);

    str = strSelectorText;

    //  'Escape' all of the vertical bar ('|') separators by replacing them
    //  with '__NSESC__' so that they pass through this parser, which
    //  doesn't under CSS3 Namespaces. We'll take care of them at the end of
    //  the method.
    str = str.replace(/\|/g, '__NSESC__');

    parseRecord = TP.$$setupSelectorParseRecord(str);

    wholeSelectorEntry = TP.ac();
    wholeSelectorEntry.defineAttribute('fullSelector', str);

    //  Grab the first token to parse
    currentToken = parseRecord.fetchNextToken();

    //  Begin the 'simple selector' loop
    while (currentToken !== TP.SELECTOR_EOF) {
        simpleSelectorEntry = TP.hc();
        wholeSelectorEntry.push(simpleSelectorEntry);

        classArr = TP.ac();
        attrHash = TP.hc();
        pClassArr = TP.ac();

        //  First parse the element type

        if (currentToken === TP.SELECTOR_IDENTIFIER ||
            currentToken === TP.SELECTOR_ASTERISK) {
            lastMatch = currentToken === TP.SELECTOR_ASTERISK ?
                                        '*' : parseRecord.getLastMatch();

            currentToken = parseRecord.fetchNextToken();

            //  If we've found an 'escaped colon' ('\\:') as part of the tag
            //  name, then in some environments that means that the tag had
            //  a namespace.
            if (currentToken === TP.SELECTOR_ESCAPED_COLON) {
                //  The identifer before this one was the namespace.
                simpleSelectorEntry.atPut('namespace', lastMatch);

                //  Now grab the actual element tag

                currentToken = parseRecord.fetchNextToken();

                if (currentToken === TP.SELECTOR_IDENTIFIER ||
                    currentToken === TP.SELECTOR_ASTERISK) {
                    lastMatch = currentToken === TP.SELECTOR_ASTERISK ?
                                        '*' : parseRecord.getLastMatch();

                    simpleSelectorEntry.atPut('tagName', lastMatch);

                    currentToken = parseRecord.fetchNextToken();
                }
            } else {
                //  This tag had no namespace. The identifer we found is the
                //  element tag.
                simpleSelectorEntry.atPut('tagName', lastMatch);
            }
        }

        //   Parse what's left of the selector:
        //      id's, classes, attributes, pseudoclasses, pseudoelements
        while (currentToken === TP.SELECTOR_HASH ||
                currentToken === TP.SELECTOR_DOT ||
                currentToken === TP.SELECTOR_ATTR_START ||
                currentToken === TP.SELECTOR_COLON) {
            //  Parse an 'ID' portion, if there was one.

            if (currentToken === TP.SELECTOR_HASH) {
                currentToken = parseRecord.fetchNextToken();

                if (currentToken === TP.SELECTOR_IDENTIFIER ||
                    currentToken === TP.SELECTOR_NAME) {
                    lastMatch = parseRecord.getLastMatch();

                    simpleSelectorEntry.atPut('id', lastMatch);
                }
            } else if (currentToken === TP.SELECTOR_DOT) {
                //  Parse a 'class' portion, if there was one.

                currentToken = parseRecord.fetchNextToken();

                if (currentToken === TP.SELECTOR_IDENTIFIER) {
                    lastMatch = parseRecord.getLastMatch();

                    //  Push it onto the pre-built 'classes array'
                    classArr.push(lastMatch);
                }
            } else if (currentToken === TP.SELECTOR_ATTR_START) { // attrib
                //  Parse an 'attribute' portion, if there was one.

                //  Consume any whitespace occurring immediately after the
                //  bracket
                currentToken = parseRecord.fetchNextNonWSToken();

                if (currentToken === TP.SELECTOR_IDENTIFIER) {
                    lastMatch = parseRecord.getLastMatch();

                    attrEntry = TP.hc();

                    //  Add our new 'attribute entry' with the attribute
                    //  name (making sure to replace any occurrence of
                    //  '__NSESC__' with a colon).
                    attrHash.atPut(lastMatch.replace('__NSESC__', ':'),
                                    attrEntry);

                    //  Consume any whitespace occurring immediately after
                    //  the attribute name. This will give us our attribute
                    //  'operator' (or not, if its an 'existence' attribute
                    //  test or is unknown).
                    currentToken = parseRecord.fetchNextNonWSToken();

                    //  If its one of the 'standard 6' defined in CSS3, then
                    //  register it into the 'attribute entry'.
                    switch (currentToken) {
                        case TP.SELECTOR_ATTR_BEGIN_EQUALS:
                        case TP.SELECTOR_ATTR_END_EQUALS:
                        case TP.SELECTOR_ATTR_SUBSTR_EQUALS:
                        case TP.SELECTOR_ATTR_EQUALS:
                        case TP.SELECTOR_ATTR_SPACE_EQUALS:
                        case TP.SELECTOR_ATTR_HYPHEN_EQUALS:

                            attrEntry.atPut('attrOp', currentToken);

                            break;

                        case TP.SELECTOR_ATTR_END:

                            //  This is just an 'existence' attribute, so we
                            //  just set it to our 'special token'.

                            attrEntry.atPut('attrOp',
                                            TP.SELECTOR_ATTR_EXISTS);

                            break;

                        default:

                            TP.ifWarn() ?
                                TP.warn('Unrecognized attribute' +
                                                ' operator: ' +
                                                currentToken,
                                            TP.LOG) : 0;

                            break;
                    }

                    if (currentToken !== TP.SELECTOR_ATTR_END) {
                        //  We've obtained a name and operator. Now see if
                        //  we have value. To do this, we advance to the
                        //  next non-whitespace token.
                        currentToken = parseRecord.fetchNextNonWSToken();

                        if (currentToken === TP.SELECTOR_IDENTIFIER ||
                            currentToken === TP.SELECTOR_STRING) {
                            lastMatch = parseRecord.getLastMatch();

                            attrEntry.atPut('attrValue', lastMatch);
                        }

                        //  Fetch the next non whitespace token. It should
                        //  be the closing bracket.
                        currentToken = parseRecord.fetchNextNonWSToken();
                    }
                }
            } else if (currentToken === TP.SELECTOR_COLON) {
                //  Parse a 'pseudo-class' or 'pseudo-element' portion, if
                //  there was one.

                currentToken = parseRecord.fetchNextToken();

                if (currentToken === TP.SELECTOR_IDENTIFIER) {
                    lastMatch = parseRecord.getLastMatch();

                    //  If we're 'strictly matching' pseudo-classes and
                    //  pseudo-elements, then we don't match 'arbitrary'
                    //  entries, but only those defined by the
                    //  specification.
                    if (strictPseudoMatch) {
                        switch (lastMatch.toLowerCase()) {
                            //  In CSS2, pseudoclasses and pseudoelements
                            //  are impossible to tell apart, except by
                            //  name, since they both use a single-colon
                            //  (':') to separate themselves from the main
                            //  selector. CSS3 fixed this with the
                            //  double-colon ('::'). See below.

                            //  ':first-line', ':first-letter', ':before'
                            //  and ':after' are pseudo-elements, not
                            //  pseudo-classes.
                            case 'first-line':
                            case 'first-letter':
                            case 'before':
                            case 'after':

                                simpleSelectorEntry.atPut(
                                                'pseudoElement',
                                                lastMatch.toLowerCase());

                                break;

                            //  The rest are pseudo-classes.
                            case 'active':
                            case 'visited':
                            case 'link':
                            case 'hover':
                            case 'focus':
                            case 'first-child':

                                pClassArr.push(lastMatch.toLowerCase());

                                break;

                            default:

                                break;
                        }
                    } else {
                        //  Otherwise, we're not 'matching strictly', so we
                        //  try to detect whether or not we're a 'complex'
                        //  pseudoclass (one with a '(' in it).

                        //  If so, we grab the content in the parens,
                        //  recursively process that through this routine
                        //  and make an entry with an Array. This Array has
                        //  the pseudo class name and the info chunk from
                        //  the nested selector.
                        peekedToken = parseRecord.peekNextToken();
                        if (peekedToken === TP.SELECTOR_LEFT_PAREN) {
                            pClassName = lastMatch.toLowerCase();

                            //  Fetch the left paren
                            currentToken = parseRecord.fetchNextToken();

                            //  And then the token after that
                            currentToken =
                                    parseRecord.fetchNextNonWSToken();

                            startParenOffset =
                                parseRecord.getCurrentOffset() - 1;

                            while (currentToken !==
                                                TP.SELECTOR_RIGHT_PAREN &&
                                    currentToken !== TP.SELECTOR_EOF) {
                                currentToken =
                                    parseRecord.fetchNextNonWSToken();
                            }

                            endParenOffset =
                                parseRecord.getCurrentOffset() - 1;

                            parenContentStr = str.slice(startParenOffset,
                                                        endParenOffset);
                            parenSelInfo = TP.parseCSSSelector(
                                                        parenContentStr);

                            pClassArr.push(TP.ac(pClassName, parenSelInfo));
                        } else {
                            //  Otherwise, its not a complex pseudo class,
                            //  so we just add its name.
                            pClassArr.push(lastMatch.toLowerCase());
                        }
                    }
                } else if (currentToken === TP.SELECTOR_COLON) {
                    //  Parse CSS3-style pseudo-elements, using the
                    //  double-colon ('::').
                    currentToken = parseRecord.fetchNextToken();

                    if (currentToken === TP.SELECTOR_IDENTIFIER) {
                        lastMatch = parseRecord.getLastMatch();

                        //  If we're 'strictly matching' pseudo-classes and
                        //  pseudo-elements, then we don't match 'arbitrary'
                        //  entries, but only those defined by the
                        //  specification. For CSS3, for double-colon
                        //  entries, there can only be ::first-line,
                        //  ::first-letter, ::before, ::after and
                        //  ::selection.
                        if (strictPseudoMatch) {
                            switch (lastMatch.toLowerCase()) {
                                case 'first-line':
                                case 'first-letter':
                                case 'before':
                                case 'after':
                                case 'selection':

                                simpleSelectorEntry.atPut(
                                                'pseudoElement',
                                                lastMatch.toLowerCase());

                                break;
                            }
                        } else {
                            //  Otherwise, we're not 'matching strictly', so
                            //  whatever is here gets set as the pseudo
                            //  element.
                            simpleSelectorEntry.atPut(
                                            'pseudoElement',
                                            lastMatch.toLowerCase());
                        }
                    }
                }
            }

            currentToken = parseRecord.fetchNextToken();

        }

        //  If there is whitespace at the end of the simple selector, then
        //  peek at the next token. If its the 'child', 'adjacent sibling',
        //  'general sibling' or the end of the selector, fetch the token
        //  and we'll build upon it.
        if (currentToken === TP.SELECTOR_WHITESPACE) {
            peekedToken = parseRecord.peekNextToken();

            if (peekedToken === TP.SELECTOR_CHILD_COMBINATOR ||
                peekedToken === TP.SELECTOR_ADJACENT_SIBLING_COMBINATOR ||
                peekedToken === TP.SELECTOR_GENERAL_SIBLING_COMBINATOR ||
                peekedToken === TP.SELECTOR_EOF) {
                currentToken = parseRecord.fetchNextToken();
            }
        }

        //  Switch on the 'combinator token' (or 'end') that was fetched and
        //  if its one of combinators (or 'end'), then add it to the end of
        //  our 'whole selector' entry.
        switch (currentToken) {
            case TP.SELECTOR_WHITESPACE:
            case TP.SELECTOR_CHILD_COMBINATOR:
            case TP.SELECTOR_ADJACENT_SIBLING_COMBINATOR:
            case TP.SELECTOR_GENERAL_SIBLING_COMBINATOR:
            case TP.SELECTOR_EOF:

                wholeSelectorEntry.push(currentToken);

                break;

            default:
                TP.ifWarn() ?
                    TP.warn('Unknown token encountered: ' + currentToken,
                                TP.LOG) : 0;

                break;
        }

        //  If there is a valid entry for tag name and it happens to have
        //  '__NSESC__' in it, then split that into two pieces, using the
        //  first piece for the namespace and the second piece for the tag
        //  name.
        if (TP.isString(val = simpleSelectorEntry.at('tagName')) &&
            /\__NSESC__/.test(val)) {
            val = val.split('__NSESC__');

            simpleSelectorEntry.atPut('namespace', val.first());
            simpleSelectorEntry.atPut('tagName', val.last());
        }

        if (TP.notEmpty(classArr)) {
            simpleSelectorEntry.atPut('classes', classArr);
        }

        if (TP.notEmpty(attrHash)) {
            simpleSelectorEntry.atPut('attributes', attrHash);
        }

        if (TP.notEmpty(pClassArr)) {
            simpleSelectorEntry.atPut('pseudoclasses', pClassArr);
        }

        //  Advance to the next non-whitespace token.
        currentToken = parseRecord.fetchNextNonWSToken();
    }

    return wholeSelectorEntry;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
