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

//  A RegExp that 'captures' the content of 'style' elements.
TP.regex.STYLE_CAPTURE =
        /<style.*?>(?:<!\[CDATA\[)*([\s\S]*?)(?:\]\]>)*<\/style>/g; // needs reset

//  A RegExp that matches CSS 'px' values (or just bare numbers)
TP.regex.CSS_PIXEL = /^-?[\d\.]+(px)?$/i;

//  A RegExp that matches CSS unit values.
TP.regex.CSS_UNIT =
        /(^|\s+)-?([\d\.]+)(%|in|cm|mm|em|ex|pt|pc|px)/;

//  A RegExp that matches 'non-relative' CSS unit values (i.e. '%', 'em'
//  and 'ex' are 'relative' to the element that they're associated with).
TP.regex.CSS_NON_RELATIVE_UNIT =
        /(^|\s+)-?([\d\.]+)(in|cm|mm|pt|pc|px)/;

//  A RegExp that matches CSS hex color values.
TP.regex.CSS_HEX =
        /#?([A-F0-9]{3})?([A-F0-9]{3}){1}$/i;

//  A RegExp that matches CSS RGB color values.
TP.regex.CSS_RGB =
        /rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/;

/* eslint-disable no-useless-escape */
//  A RegExp that matches CSS RGBA color values.
TP.regex.CSS_RGBA =
        /rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\,\s*([\d.]+)\s*\)/;

//  A RegExp that matches CSS HSL color values.
TP.regex.CSS_HSL =
        /hsl\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/;

//  A RegExp that matches CSS HSLA color values.
TP.regex.CSS_HSLA =
        /hsla\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\,\s*([\d.]+)\s*\)/;

//  A RegExp that matches 'non-name' (that is, no semantic 'color name')
//  values.
TP.regex.CSS_NON_NAME_COLOR =
        /(#?([A-F0-9]{3})?([A-F0-9]{3}){1})(\s+|$)|(rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\))|(rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\,\s*([\d.]+)\s*\))|(hsl\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\))|(hsla\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\,\s*([\d.]+)\s*\))/ig;    // needs reset

//  A RegExp that matches all color values (based on the ones from above).
TP.regex.CSS_COLOR =
        /(#?([A-F0-9]{3})?([A-F0-9]{3}){1})(\s+|$)|(rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\))|(rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\,\s*([\d.]+)\s*\))|(hsl\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\))|(hsla\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\,\s*([\d.]+)\s*\))|(?:^|\s+)[A-Z]+(?:\s+|$)/i;

//  A global version of TP.CSS_COLOR used for value extraction.
TP.regex.CSS_COLOR_GLOBAL =
        /(#?([A-F0-9]{3})?([A-F0-9]{3}){1})(\s+|$)|(rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\))|(rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\,\s*([\d.]+)\s*\))|(hsl\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\))|(hsla\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\,\s*([\d.]+)\s*\))|(?:^|\s+)[A-Z]+(?:\s+|$)/ig;   // needs reset
/* eslint-enable no-useless-escape */

TP.regex.CSS_TRANSFORM =
        /^(matrix|rotate|scale|skewX|skewY|translate)\s*\(.+?\)$/;

//  A RegExp that matches TIBET-defined CSS 'gradients'
TP.regex.CSS_GRADIENT = /^(gradient-linear|gradient-radial)\s*\(.+?\)$/;

//  A RegExp that matches TIBET-defined CSS 'patterns'
TP.regex.CSS_PATTERN = /^pattern\s*\(.+?\)$/;

//  A RegExp that matches CSS2 combinators
TP.regex.COMBINATOR = /\s*[>+~\s]+\s*/;

//  A RegExp that matches CSS attribute selector names and values.
TP.regex.ATTR_SELECTOR =
        /\[([\w|:]+)([~=|*^$]*)['"]*(\w*)['"]*/g;   // needs reset

//  A RegExp that will detect native custom selectors or native custom
//  declarations.
TP.regex.CSS_NATIVE_CUSTOM = /-(moz|ms|webkit)/;

//  A RegExp that will strip any non-native prefixed declarations, so that
//  we don't actually strip '-moz'/'-ms'/'-webkit' declarations as being
//  'custom'
TP.regex.CUSTOM_DECLARATIONS =
        /(^|\s+)-((?!moz|ms|webkit)[-\w]+)\s*:\s*([^;]+);?/g;   // needs reset

//  A RegExp that matches 'custom' CSS declaration names (that is, those
//  with a preceding dash ('-'), but not ones native to Mozilla/IE/Safari).
//  Note that we don't use any of the grouping here
TP.regex.CUSTOM_DECLARATIONS_NAME =
        /^-((?!moz|ms|webkit)[-\w]+)/;

//  A RegExp that matches 'custom' declaration values that can be processed
//  by TIBET's CSS processing machinery
TP.regex.CUSTOM_DECLARATIONS_VALUE =
        /^((?!attr|var|calc|hsl|hsla)\(|url\(~)/;

//  A RegExp that matches PNG image URLs.
TP.regex.CSS_PNG_IMAGE =
        /(^|\s+|;)(.+image:)\s*(url\()?['"]?(.*?\.png)['"]?(\))?;?/g;   // needs reset

//  NB: This stuff should be removed when the CSS processor is redone
//  Note that we need to use older 'new RegExp' syntax here because of
//  bootstrapping issues.
TP.regex.PCLASS_CONVERSION = new RegExp(':(hover|active|focus)', 'g');  // needs reset

TP.regex.UNSUPPORTED_SELECTOR = new RegExp(':()');

//  ------------------------------------------------------------------------

TP.definePrimitive('$escapeCSSConstructs',
function(aString) {

    /**
     * @method $escapeCSSConstructs
     * @summary This method escapes any HTML 'link' elements pointing to
     *     stylesheets and any @import style rules so that they don't cause
     *     problems with premature loading while being processed in various
     *     parts of the TIBET content processing system. Failure to do this will
     *     crash Mozilla-based browers. We do the work consistently across
     *     browsers to avoid having inconsistent markup to support when
     *     searching for link or style elements in processed markup.
     * @param {String} aString The string to escape values in.
     * @returns {String} A new string with CSS constructs escaped.
     */

    return aString;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$unescapeCSSConstructs',
function(srcText) {

    /**
     * @method $unescapeCSSConstructs
     * @summary Reverses the work done by the $escapeCSSConstructs() method.
     *     See that method's description for more details.
     * @param {String} srcText The source text to find the constructs to
     *     unescape.
     * @exception TP.sig.InvalidString
     * @returns {String} The source text with the HTML 'style', HTML 'link'
     *     elements and. @import style rules escaped.
     */

    //  Just return the srcText
    return srcText;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$nodeEscapeCSSConstructs',
function(aNode) {

    /**
     * @method $nodeEscapeCSSConstructs
     * @summary This method escapes any HTML 'link' elements pointing to
     *     stylesheets and any @import style rules so that they don't cause
     *     problems with premature loading while being processed in various
     *     parts of the TIBET content processing system. Failure to do this will
     *     crash Mozilla-based browers. We do the work consistently across
     *     browsers to avoid having inconsistent markup to support when
     *     searching for link or style elements in processed markup.
     * @param {Node} aNode A native node to potentially escape.
     * @returns {Node} The node, or a new node with CSS constructs escaped.
     */

    var node,
        list,
        str,
        rep;

    //  if we don't make any changes we want to return the original node
    node = aNode;

    //  only applicable to XHTML content
    if (TP.nodeGetNSURI(node) !== TP.w3.Xmlns.XHTML) {
        return node;
    }

    list = node.getElementsByTagNameNS(TP.w3.Xmlns.XHTML, 'head');
    if (TP.isEmpty(list)) {
        return node;
    }

    list = node.getElementsByTagNameNS(TP.w3.Xmlns.XHTML, 'link');
    if (TP.isEmpty(list)) {
        list = node.getElementsByTagNameNS(TP.w3.Xmlns.XHTML, 'style');
        if (TP.isEmpty(list)) {
            return node;
        }
    }

    //  going to have to do the work since we found at least one link or
    //  style element
    str = TP.str(node);
    rep = TP.$escapeCSSConstructs(str);

    //  turn the result back into the same node type we got as input
    if (TP.isDocument(aNode)) {
        node = TP.documentFromString(rep, null, true);
        if (!TP.isDocument(node)) {
            TP.raise(this,
                        'TP.sig.InvalidDocument',
                        'Unable to escape style. Missing CDATA block?');

            return;
        }
    } else {
        node = TP.nodeFromString(rep, null, true);
        if (!TP.isNode(node)) {
            TP.raise(this,
                        'TP.sig.InvalidNode',
                        'Unable to escape style. Missing CDATA block?');

            return;
        }
    }

    return node;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('calculateSingleCSSSelectorSpecificity',
function(singleSelectorText) {

    /**
     * @method calculateSingleSelectorSpecificity
     * @summary Calculates the specificity of CSS selectors per the algorithms
     *     at: http://www.w3.org/TR/css3-selectors/#specificity
     * @description This code is a TIBETized version of:
     *     https://github.com/keeganstreet/specificity
     *     The MIT License (MIT)
     *     Copyright (c) 2016 Keegan Street and others
     * @param {String} singleSelectorText The 'single selector' to compute the
     *     specificity for. Note that this means that the selector shouldn't be
     *     a comma-separated (',') selector.
     * @returns {Object} Returns an object with the following properties:
     *     selector: the input
     *     specificity: e.g. 0,1,0,0
     *     parts: array with details about each part of the selector that counts
     *     towards the specificity
     *     specificityArray: e.g. [0, 1, 0, 0]
     */

    var selector,
        findMatch,
        typeCount,
        parts,
        attributeRegex,
        idRegex,
        classRegex,
        pseudoElementRegex,
        pseudoClassWithBracketsRegex,
        pseudoClassRegex,
        elementRegex;

    selector = singleSelectorText;

    typeCount = {
        a: 0,
        b: 0,
        c: 0
    };

    parts = TP.ac();

    /* eslint-disable no-useless-escape */

    //  The following regular expressions assume that selectors matching the
    //  preceding regular expressions have been removed.
    attributeRegex = /(\[[^\]]+\])/g;
    idRegex = /(#[^\s\+>~\.\[:]+)/g;
    classRegex = /(\.[^\s\+>~\.\[:]+)/g;
    pseudoElementRegex =
        /(::[^\s\+>~\.\[:]+|:first-line|:first-letter|:before|:after)/gi;

    //  A regex for pseudo classes with brackets - :nth-child(),
    //  :nth-last-child(), :nth-of-type(), :nth-last-type(), :lang()
    pseudoClassWithBracketsRegex = /(:[\w-]+\([^\)]*\))/gi;

    //  A regex for other pseudo classes, which don't have brackets
    pseudoClassRegex = /(:[^\s\+>~\.\[:]+)/g;

    elementRegex = /([^\s\+>~\.\[:]+)/g;

    //  Find matches for a regular expression in a string and push their
    //  details to parts
    //  Type is "a" for IDs, "b" for classes, attributes and pseudo-classes
    //  and "c" for elements and pseudo-elements
    findMatch = function(regex, type) {

        var matches,
            i,
            len,
            match,
            index,
            length;

        if (regex.test(selector)) {

            matches = selector.match(regex);

            len = matches.getSize();

            for (i = 0; i < len; i++) {

                typeCount[type] += 1;
                match = matches[i];
                index = selector.indexOf(match);
                length = match.length;

                parts.push(
                    {
                        selector: singleSelectorText.substr(index, length),
                        type: type,
                        index: index,
                        length: length
                    });

                //  Replace this simple selector with whitespace so it won't
                //  be counted in further simple selectors
                selector = selector.replace(
                                match, Array(length + 1).join(' '));
            }
        }
    };

    //  Replace escaped characters with plain text, using the "A" character
    //  https://www.w3.org/TR/CSS21/syndata.html#characters
    (function() {
        var replaceWithPlainText,
            escapeHexadecimalRegex,
            escapeHexadecimalRegex2,
            escapeSpecialCharacter;

        replaceWithPlainText = function(regex) {
            var matches,
                i,
                len,
                match;

            if (regex.test(selector)) {
                matches = selector.match(regex);
                for (i = 0, len = matches.length; i < len; i += 1) {
                    match = matches[i];
                    selector = selector.replace(
                                match, Array(match.length + 1).join('A'));
                }
            }
        };

        //  Matches a backslash followed by six hexadecimal digits
        //  followed by an optional single whitespace character
        escapeHexadecimalRegex = /\\[0-9A-Fa-f]{6}\s?/g;

        //  Matches a backslash followed by fewer than six hexadecimal
        //  digits followed by a mandatory single whitespace character
        escapeHexadecimalRegex2 = /\\[0-9A-Fa-f]{1,5}\s/g;

        //  Matches a backslash followed by any character
        escapeSpecialCharacter = /\\./g;

        replaceWithPlainText(escapeHexadecimalRegex);
        replaceWithPlainText(escapeHexadecimalRegex2);
        replaceWithPlainText(escapeSpecialCharacter);
    }());

    //  Remove the negation psuedo-class (:not) but leave its argument
    //  because specificity is calculated on its argument
    (function() {
        var regex;

        regex = /:not\(([^\)]*)\)/g;

        if (regex.test(selector)) {
            selector = selector.replace(regex, '     $1 ');
        }
    }());

    //  Remove anything after a left brace in case a user has pasted in a
    //  rule, not just a selector
    (function() {
        var regex,
            matches,
            i,
            len,
            match;

        regex = /{[^]*/gm;

        if (regex.test(selector)) {

            matches = selector.match(regex);

            len = matches.getSize();

            for (i = 0; i < len; i++) {
                match = matches.at(i);
                selector = selector.replace(
                            match, Array(match.length + 1).join(' '));
            }
        }
    }());

    //  Add attribute selectors to parts collection (type b)
    findMatch(attributeRegex, 'b');

    //  Add ID selectors to parts collection (type a)
    findMatch(idRegex, 'a');

    //  Add class selectors to parts collection (type b)
    findMatch(classRegex, 'b');

    //  Add pseudo-element selectors to parts collection (type c)
    findMatch(pseudoElementRegex, 'c');

    //  Add pseudo-class selectors to parts collection (type b)
    findMatch(pseudoClassWithBracketsRegex, 'b');
    findMatch(pseudoClassRegex, 'b');

    //  Remove universal selector and separator characters
    selector = selector.replace(/[\*\s\+>~]/g, ' ');

    //  Remove any stray dots or hashes which aren't attached to words
    //  These may be present if the user is live-editing this selector
    selector = selector.replace(/[#\.]/g, ' ');

    //  The only things left should be element selectors (type c)
    findMatch(elementRegex, 'c');

    //  Order the parts in the order they appear in the original selector
    //  This is neater for external apps to deal with
    parts.sort(function(a, b) {
        return a.index - b.index;
    });

    /* eslint-disable no-extra-parens,no-implicit-coercion */
    return {
        selector: singleSelectorText,
        specificity: '0,' +
                    typeCount.a.toString() + ',' +
                    typeCount.b.toString() + ',' +
                    typeCount.c.toString(),
        specificityArray: TP.ac(0, typeCount.a, typeCount.b, typeCount.c),
        specificityScore:
                //  Increased these by an order of magnitude over the original
                //  version of this code since, yes, we've seen selectors with
                //  10+ class names.
                (typeCount.a * 1000) + (typeCount.b * 100) + (typeCount.c * 10),

        parts: parts
    };
    /* eslint-enable no-extra-parens,no-implicit-coercion */

    /* eslint-enable no-useless-escape */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$elementCSSFlush',
function(anElement) {

    /**
     * @method $elementCSSFlush
     * @summary Jiggers the element to flush out any CSS changes. IE should do
     *     this automatically, but won't sometimes, especially for 'custom'
     *     attributes.
     * @param {Element} anElement The element to flush the CSS style changes
     *     for.
     * @exception TP.sig.InvalidElement
     */

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('matrixAs2DMatrix',
function(aMatrix) {

    /**
     * @method matrixAs2DMatrix
     * @summary Returns a 3X2 matrix suitable for use with CSS 2D transforms.
     *     If a 3X2 matrix is already supplied, then it is returned. Otherwise,
     *     a 4X4 matrix will be converted into a 3X2 matrix.
     * @description This code derived from:
     *     https://gist.github.com/Yaffle/1145197
     * @param {Array} aMatrix An Array of Arrays representing the matrix.
     * @returns {Array} An Array of Arrays representing the converted matrix.
     */

    var matrix;

    if (aMatrix.length === 2) {
        return aMatrix;
    }

    matrix = [
        [aMatrix[0][0], aMatrix[1][0], aMatrix[0][3]],
        [aMatrix[0][1], aMatrix[1][1], aMatrix[1][3]]
    ];

    return matrix;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('matrixAs3DMatrix',
function(aMatrix) {

    /**
     * @method matrixAs3DMatrix
     * @summary Returns a 4X4 matrix suitable for use with CSS 3D transforms.
     *     If a 4X4 matrix is already supplied, then it is returned. Otherwise,
     *     a 3X2 matrix will be converted into a 4X4 matrix (with identity
     *     values for the missing spots).
     * @description This code derived from:
     *     https://gist.github.com/Yaffle/1145197
     * @param {Array} aMatrix An Array of Arrays representing the matrix.
     * @returns {Array} An Array of Arrays representing the converted matrix.
     */

    var matrix;

    if (aMatrix.length === 4) {
        return aMatrix;
    }

    matrix = [
        [aMatrix[0], aMatrix[1], 0, 0],
        [aMatrix[2], aMatrix[3], 0, 0],
        [0, 0, 1, 0],
        [aMatrix[4], aMatrix[5], 0, 1]
    ];

    return matrix;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('matrixFromCSSString',
function(cssStr, wants2DMatrix) {

    /**
     * @method matrixFromCSSString
     * @summary Extracts a matrix from the supplied CSS string.
     * @description Note that this method will return a 4X4 matrix suitable for
     *     use with CSS 3D transforms. This code derived from:
     *     https://gist.github.com/Yaffle/1145197
     * @param {String} cssStr A CSS string representing a matrix used in CSS
     *     transforms.
     * @param {Boolean} wants2DMatrix An optional parameter that tells the
     *     method whether or not to return a 3x2 matrix for use with CSS 2D
     *     transforms. The default is false.
     * @returns {Array} An Array of Arrays representing the extracted matrix.
     */

    var matrixValues,

        matrix,

        i,
        j;

    if (!/matrix3?d?\(([^\)]+)\)/i.test(cssStr)) {
        return null;
    }

    matrixValues = cssStr.match(/matrix3?d?\(([^\)]+)\)/i)[1].split(',');

    if (matrixValues.length === 6) {
        matrixValues = [
            matrixValues[0], matrixValues[1], 0, 0,
            matrixValues[2], matrixValues[3], 0, 0,
            0, 0, 1, 0,
            matrixValues[4], matrixValues[5], 0, 1
        ];
    }

    matrix = [];

    for (i = 0; i < 4; i++) {
        for (j = 0; j < 4; j++) {
            matrix[i] = matrix[i] || [];
            matrix[i][j] = parseFloat(matrixValues[j * 4 + i]);
        }
    }

    if (TP.isValid(matrix) && TP.isTrue(wants2DMatrix)) {
        return TP.matrixAs2DMatrix(matrix);
    }

    return matrix;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('matrixMultiply',
function(a, b) {

    /**
     * @method matrixMultiply
     * @summary Multiplies the supplied matrices.
     * @description This code derived from: https://gist.github.com/1145197
     *     Note that this method assumes it is operating on a 4X4 matrix suitable
     *     for use with CSS 3D transforms. This code derived from:
     *     https://gist.github.com/Yaffle/1145197
     * @param {Array} a An Array of Arrays representing the first matrix to be
     *     multiplied.
     * @param {Array} b An Array of Arrays representing the first matrix to be
     *     multiplied.
     * @returns {Array} An Array of Arrays representing the multiplied matrix.
     */

    var r,
        i,
        j,
        k,
        t;

    r = [];

    for (i = 0; i < a.length; i++) {
        for (j = 0; j < b[0].length; j++) {
            t = 0;
            for (k = 0; k < a[0].length; k++) {
                t += a[i][k] * b[k][j];
            }

            r[i] = r[i] || [];
            r[i][j] = t;
        }
    }

    return r;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('matrixTranslate',
function(m) {

    /**
     * @method matrixTranslate
     * @summary Translates the supplied matrix.
     * @description This code derived from: https://gist.github.com/1145197
     *     Note that this method assumes it is operating on a 4X4 matrix
     *     suitable for use with CSS 3D transforms. This code derived from:
     *     https://gist.github.com/Yaffle/1145197
     * @param {Array} m An Array of Arrays representing the matrix to be
     *     translated. Varargs values consist of also tx, ty, tz.
     * @returns {Array} An Array of Arrays representing the translated matrix.
     */

    var i,
        j,
        r;

    r = [];

    for (i = 0; i < 4; i++) {
        r[i] = [];

        for (j = 0; j < 4; j++) {
            r[i][j] = m[i][j] + (j === 3 ? arguments[1 + i] || 0 : 0);
        }
    }

    return r;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('matrixTransformPoint',
function(aMatrix, x, y) {

    /**
     * @method matrixTransformPoint
     * @summary Transforms the supplied point values with the supplied matrix.
     * @param {Array} aMatrix An Array of Arrays representing the matrix to be
     *     used in transforming the point.
     * @param {Number} x The X coordinate of the point to transform.
     * @param {Number} y The Y coordinate of the point to transform.
     * @returns {Array} An Array of 2 Numbers representing the transformed
     *     point.
     */

    var matrix;

    if (aMatrix.length === 4) {
        matrix = TP.matrixAs2DMatrix(aMatrix);
    } else {
        matrix = aMatrix;
    }

    return [
        matrix[0][0] * x + matrix[0][1] * y + matrix[0][2],
        matrix[1][0] * x + matrix[1][1] * y + matrix[1][2]
    ];
});

//  ------------------------------------------------------------------------

TP.definePrimitive('matrixTransformRect',
function(aMatrix, x, y, width, height) {

    /**
     * @method matrixTransformRect
     * @summary Transforms the supplied rectangle values with the supplied
           matrix.
     * @param {Array} aMatrix An Array of Arrays representing the matrix to be
     *     used in transforming the rectangle.
     * @param {Number} x The X coordinate of the rectangle to transform.
     * @param {Number} y The Y coordinate of the rectangle to transform.
     * @param {Number} width The width of the rectangle to transform.
     * @param {Number} height The height of the rectangle to transform.
     * @returns {Array} An Array of 4 Numbers representing the transformed
     *     rectangle.
     */

    var matrix;

    if (aMatrix.length === 4) {
        matrix = TP.matrixAs2DMatrix(aMatrix);
    } else {
        matrix = aMatrix;
    }

    return [
        matrix[0][0] * x + matrix[0][1] * y + matrix[0][2],
        matrix[1][0] * x + matrix[1][1] * y + matrix[1][2],
        matrix[0][0] * width + matrix[0][1] * height,
        matrix[1][0] * width + matrix[1][1] * height
    ];
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
