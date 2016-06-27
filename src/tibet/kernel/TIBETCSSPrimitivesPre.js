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

//  ========================================================================
//  CSS Parser - originally from https://github.com/reworkcss/css except small
//  tweaks where noted (with 'wje').
//  ========================================================================

/* eslint-disable */
/* jshint ignore:start */

TP.extern.cssParser = {};
TP.extern.cssParser.parse = function(css, options){

  // wje (2016-02-16) Moved inside of the closure
  var commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g

  // http://www.w3.org/TR/CSS21/grammar.html
  // https://github.com/visionmedia/css-parse/pull/49#issuecomment-30088027

  options = options || {};

  /**
   * Positional.
   */

  var lineno = 1;
  var column = 1;

  /**
   * Update lineno and column based on `str`.
   */

  function updatePosition(str) {
    var lines = str.match(/\n/g);
    if (lines) lineno += lines.length;
    var i = str.lastIndexOf('\n');
    column = ~i ? str.length - i : column + str.length;
  }

  /**
   * Mark position and patch `node.position`.
   */

  function position() {
    var start = { line: lineno, column: column };
    return function(node){
      node.position = new Position(start);
      whitespace();
      return node;
    };
  }

  /**
   * Store position information for a node
   */

  function Position(start) {
    this.start = start;
    this.end = { line: lineno, column: column };
    this.source = options.source;
  }

  /**
   * Non-enumerable source string
   */

  Position.prototype.content = css;

  /**
   * Error `msg`.
   */

  var errorsList = [];

  function error(msg) {
    var err = new Error(options.source + ':' + lineno + ':' + column + ': ' + msg);
    err.reason = msg;
    err.filename = options.source;
    err.line = lineno;
    err.column = column;
    err.source = css;

    if (options.silent) {
      errorsList.push(err);
    } else {
      throw err;
    }
  }

  /**
   * Parse stylesheet.
   */

  function stylesheet() {
    var rulesList = rules();

    return {
      type: 'stylesheet',
      stylesheet: {
        source: options.source,
        rules: rulesList,
        parsingErrors: errorsList
      }
    };
  }

  /**
   * Opening brace.
   */

  function open() {
    return match(/^{\s*/);
  }

  /**
   * Closing brace.
   */

  function close() {
    return match(/^}/);
  }

  /**
   * Parse ruleset.
   */

  function rules() {
    var node;
    var rules = [];
    whitespace();
    comments(rules);
    while (css.length && css.charAt(0) != '}' && (node = atrule() || rule())) {
      if (node !== false) {
        rules.push(node);
        comments(rules);
      }
    }
    return rules;
  }

  /**
   * Match `re` and return captures.
   */

  function match(re) {
    var m = re.exec(css);
    if (!m) return;
    var str = m[0];
    updatePosition(str);
    css = css.slice(str.length);
    return m;
  }

  /**
   * Parse whitespace.
   */

  function whitespace() {
    match(/^\s*/);
  }

  /**
   * Parse comments;
   */

  function comments(rules) {
    var c;
    rules = rules || [];
    while (c = comment()) {
      if (c !== false) {
        rules.push(c);
      }
    }
    return rules;
  }

  /**
   * Parse comment.
   */

  function comment() {
    var pos = position();
    if ('/' != css.charAt(0) || '*' != css.charAt(1)) return;

    var i = 2;
    while ("" != css.charAt(i) && ('*' != css.charAt(i) || '/' != css.charAt(i + 1))) ++i;
    i += 2;

    if ("" === css.charAt(i-1)) {
      return error('End of comment missing');
    }

    var str = css.slice(2, i - 2);
    column += 2;
    updatePosition(str);
    css = css.slice(i);
    column += 2;

    return pos({
      type: 'comment',
      comment: str
    });
  }

  /**
   * Parse selector.
   */

  function selector() {
    var m = match(/^([^{]+)/);
    if (!m) return;
    /* @fix Remove all comments from selectors
     * http://ostermiller.org/findcomment.html */
    return trim(m[0])
      .replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, '')
      .replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, function(m) {
        return m.replace(/,/g, '\u200C');
      })
      .split(/\s*(?![^(]*\)),\s*/)
      .map(function(s) {
        return s.replace(/\u200C/g, ',');
      });
  }

  /**
   * Parse declaration.
   */

  function declaration() {
    var pos = position();

    // prop
    var prop = match(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
    if (!prop) return;
    prop = trim(prop[0]);

    // :
    if (!match(/^:\s*/)) return error("property missing ':'");

    // val
    var val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/);

    var ret = pos({
      type: 'declaration',
      property: prop.replace(commentre, ''),
      value: val ? trim(val[0]).replace(commentre, '') : ''
    });

    // ;
    match(/^[;\s]*/);

    return ret;
  }

  /**
   * Parse declarations.
   */

  function declarations() {
    var decls = [];

    if (!open()) return error("missing '{'");
    comments(decls);

    // declarations
    var decl;
    while (decl = declaration()) {
      if (decl !== false) {
        decls.push(decl);
        comments(decls);
      }
    }

    if (!close()) return error("missing '}'");
    return decls;
  }

  /**
   * Parse keyframe.
   */

  function keyframe() {
    var m;
    var vals = [];
    var pos = position();

    while (m = match(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/)) {
      vals.push(m[1]);
      match(/^,\s*/);
    }

    if (!vals.length) return;

    return pos({
      type: 'keyframe',
      values: vals,
      declarations: declarations()
    });
  }

  /**
   * Parse keyframes.
   */

  function atkeyframes() {
    var pos = position();
    var m = match(/^@([-\w]+)?keyframes\s*/);

    if (!m) return;
    var vendor = m[1];

    // identifier
    var m = match(/^([-\w]+)\s*/);
    if (!m) return error("@keyframes missing name");
    var name = m[1];

    if (!open()) return error("@keyframes missing '{'");

    var frame;
    var frames = comments();
    while (frame = keyframe()) {
      frames.push(frame);
      frames = frames.concat(comments());
    }

    if (!close()) return error("@keyframes missing '}'");

    return pos({
      type: 'keyframes',
      name: name,
      vendor: vendor,
      keyframes: frames
    });
  }

  /**
   * Parse supports.
   */

  function atsupports() {
    var pos = position();
    var m = match(/^@supports *([^{]+)/);

    if (!m) return;
    var supports = trim(m[1]);

    if (!open()) return error("@supports missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@supports missing '}'");

    return pos({
      type: 'supports',
      supports: supports,
      rules: style
    });
  }

  /**
   * Parse host.
   */

  function athost() {
    var pos = position();
    var m = match(/^@host\s*/);

    if (!m) return;

    if (!open()) return error("@host missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@host missing '}'");

    return pos({
      type: 'host',
      rules: style
    });
  }

  /**
   * Parse media.
   */

  function atmedia() {
    var pos = position();
    var m = match(/^@media *([^{]+)/);

    if (!m) return;
    var media = trim(m[1]);

    if (!open()) return error("@media missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@media missing '}'");

    return pos({
      type: 'media',
      media: media,
      rules: style
    });
  }


  /**
   * Parse custom-media.
   */

  function atcustommedia() {
    var pos = position();
    var m = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
    if (!m) return;

    return pos({
      type: 'custom-media',
      name: trim(m[1]),
      media: trim(m[2])
    });
  }

  /**
   * Parse paged media.
   */

  function atpage() {
    var pos = position();
    var m = match(/^@page */);
    if (!m) return;

    var sel = selector() || [];

    if (!open()) return error("@page missing '{'");
    var decls = comments();

    // declarations
    var decl;
    while (decl = declaration()) {
      decls.push(decl);
      decls = decls.concat(comments());
    }

    if (!close()) return error("@page missing '}'");

    return pos({
      type: 'page',
      selectors: sel,
      declarations: decls
    });
  }

  /**
   * Parse document.
   */

  function atdocument() {
    var pos = position();
    var m = match(/^@([-\w]+)?document *([^{]+)/);
    if (!m) return;

    var vendor = trim(m[1]);
    var doc = trim(m[2]);

    if (!open()) return error("@document missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@document missing '}'");

    return pos({
      type: 'document',
      document: doc,
      vendor: vendor,
      rules: style
    });
  }

  /**
   * Parse font-face.
   */

  function atfontface() {
    var pos = position();
    var m = match(/^@font-face\s*/);
    if (!m) return;

    if (!open()) return error("@font-face missing '{'");
    var decls = comments();

    // declarations
    var decl;
    while (decl = declaration()) {
      decls.push(decl);
      decls = decls.concat(comments());
    }

    if (!close()) return error("@font-face missing '}'");

    return pos({
      type: 'font-face',
      declarations: decls
    });
  }

  /**
   * Parse import
   */

  var atimport = _compileAtrule('import');

  /**
   * Parse charset
   */

  var atcharset = _compileAtrule('charset');

  /**
   * Parse namespace
   */

  var atnamespace = _compileAtrule('namespace');

  /**
   * Parse non-block at-rules
   */


  function _compileAtrule(name) {
    var re = new RegExp('^@' + name + '\\s*([^;]+);');
    return function() {
      var pos = position();
      var m = match(re);
      if (!m) return;
      var ret = { type: name };
      ret[name] = m[1].trim();
      return pos(ret);
    }
  }

  /**
   * Parse at rule.
   */

  function atrule() {
    if (css[0] != '@') return;

    return atkeyframes()
      || atmedia()
      || atcustommedia()
      || atsupports()
      || atimport()
      || atcharset()
      || atnamespace()
      || atdocument()
      || atpage()
      || athost()
      || atfontface();
  }

  /**
   * Parse rule.
   */

  function rule() {
    var pos = position();
    var sel = selector();

    if (!sel) return error('selector missing');
    comments();

    return pos({
      type: 'rule',
      selectors: sel,
      declarations: declarations()
    });
  }

  return addParent(stylesheet());
};

/**
 * Trim `str`.
 */

function trim(str) {
  return str ? str.replace(/^\s+|\s+$/g, '') : '';
}

/**
 * Adds non-enumerable parent node reference to each node.
 */

function addParent(obj, parent) {
  var isNode = obj && typeof obj.type === 'string';
  var childParent = isNode ? obj : parent;

  for (var k in obj) {
    // wje (2016-02-16) Added hasOwnProperty() check.
    if (!obj.hasOwnProperty(k)) { continue; }
    var value = obj[k];
    if (Array.isArray(value)) {
      value.forEach(function(v) { addParent(v, childParent); });
    } else if (value && typeof value === 'object') {
      addParent(value, childParent);
    }
  }

  if (isNode) {
    Object.defineProperty(obj, 'parent', {
      configurable: true,
      writable: true,
      enumerable: false,
      value: parent || null
    });
  }

  return obj;
}

/* eslint-enable */
/* jshint ignore:end */

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
