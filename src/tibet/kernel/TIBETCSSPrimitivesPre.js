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
TP.regex.PCLASS_CHANGE = new RegExp('^(hover|active|focus)$');

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
        head,
        found,
        str,
        rep;

    //  if we don't make any changes we want to return the original node
    node = aNode;

    //  only applicable to XHTML content
    if (TP.nodeGetNSURI(node) !== TP.w3.Xmlns.XHTML) {
        return node;
    }

    //  link/style can only be in head and we already know we're XHTML
    if (TP.isDocument(node)) {
        head = TP.nodeGetFirstElementByTagName(node, 'head');
    } else if (TP.elementGetLocalName(node).toLowerCase() === 'head') {
        head = node;
    }

    //  "below" the head? can't have style or link elements then
    if (TP.notValid(head)) {
        return node;
    }

    //  links and styles are early in the document, and only in the head, so
    //  we root our next search there
    found = TP.nodeDetectDescendantElement(
                head,
                function(elem) {

                    var name;

                    name = TP.elementGetLocalName(elem).toLowerCase();

                    return ((name === 'link') || (name === 'style'));
                });

    if (TP.notValid(found)) {
        return node;
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

TP.definePrimitive('$elementProcessCSSAttributeChange',
function(anElement, attrName, newValue, changeFunction) {

    /**
     * @method $elementProcessCSSAttributeChange
     * @summary Processes an attribute change on the supplied element that may
     *     affect the CSS layout for the element or other elements in the
     *     element's document.
     * @param {HTMLElement} anElement The element currently having the attribute
     *     changed.
     * @param {String} attrName The name of the attribute being changed.
     * @param {String} newValue The new value that the attribute was set to.
     * @param {Function} changeFunction A Function that will cause the attribute
     *     change to happen.
     * @exception TP.sig.InvalidElement,TP.sig.InvalidString
     */

    //  Just exec the change function and return
    if (TP.isCallable(changeFunction)) {
        changeFunction();
    }

    return;
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

TP.definePrimitive('multiplyMatrix',
function(a, b) {

    /**
     * @method multiplyMatrix
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

    var r = [], i, j, k, t;

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

TP.definePrimitive('translateMatrix',
function(m/*, tx, ty, tz*/) {

    /**
     * @method translateMatrix
     * @summary Translates the supplied matrix.
     * @description This code derived from: https://gist.github.com/1145197
     *     Note that this method assumes it is operating on a 4X4 matrix
     *     suitable for use with CSS 3D transforms. This code derived from:
     *     https://gist.github.com/Yaffle/1145197
     * @param {Array} m An Array of Arrays representing the matrix to be
     *     translated.
     * @returns {Array} An Array of Arrays representing the translated matrix.
     */

    var i, j, r = [];

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
