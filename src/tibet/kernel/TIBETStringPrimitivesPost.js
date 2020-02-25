//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/*
*/

//  ------------------------------------------------------------------------

/*
TIBET defines versions of these for IE since they're not built-in. These
IE-specific extensions to ensure consistency between browsers.

The atob/btoa implementations here were adapted from the JS/DHTML Cookbook
by Danny Goodman (O'Reilly).
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('atob',
    TP.hc(
    TP.DEFAULT,
    function(aString) {

        /**
         * @method atob
         * @summary An implementation of the atob function found in Gecko which
         *     takes a Base64-encoded ascii string and decodes it to binary
         *     form.
         * @param {String} aString The string to convert.
         * @returns {Object} A decoded String.
         */

        //  For other browsers, this is built-in.
        try {
            return atob(aString);
        } catch (e) {
            return;
        }
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('btoa',
    TP.hc(
    TP.DEFAULT,
    function(anObject) {

        /**
         * @method btoa
         * @summary An implementation of the btoa function found in Mozilla
         *     which converts an object to a Base64-encoded string
         *     representation.
         * @param {Object} anObject The Object to convert. The string
         *     representation of this object will be encoded.
         * @returns {String} A Base64-encoded String.
         */

        //  For other browsers, this is built-in.
        return btoa(anObject);
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('utf82unicode',
function(utf8) {

    /**
     * @method utf82unicode
     * @summary Decode UTF-8 argument into Unicode string return value.
     * @param {String} utf8 A UTF-8 encoded string to translate.
     * @returns {String} The Unicode representation of utf8.
     */

    var str,
        i,

        b1,
        b2,
        b3;

    str = '';
    i = 0;

    /* eslint-disable no-extra-parens */

    while (i < utf8.length) {
        b1 = utf8.charCodeAt(i);
        if (b1 < 0x80) {
            //  One byte code: 0x00 0x7F
            str += String.fromCharCode(b1);
            i++;
        } else if ((b1 >= 0xC0) && (b1 < 0xE0)) {
            //  Two byte code: 0x80 - 0x7FF
            b2 = utf8.charCodeAt(i + 1);
            str += String.fromCharCode(((b1 & 0x1F) << 6) | (b2 & 0x3F));
            i += 2;
        } else {
            //  Three byte code: 0x800 - 0xFFFF
            b2 = utf8.charCodeAt(i + 1);
            b3 = utf8.charCodeAt(i + 2);
            str += String.fromCharCode(((b1 & 0xF) << 12) |
                             ((b2 & 0x3F) << 6) | (b3 & 0x3F));
            i += 3;
        }
    }

    /* eslint-enable no-extra-parens */

    return str;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('utf8decode',
function(str) {

    /**
     * @method utf8decode
     * @summary Decode a string encoded with TP.utf8encode above.
     * @description If the string begins with the sentinel character 0x9D
     *     (OPERATING SYSTEM COMMAND), then we decode the balance as a UTF-8
     *     stream. Otherwise, the string is output unchanged, as it's guaranteed
     *     to contain only 8 bit characters excluding 0x9D.
     * @param {String} str A UTF-8 encoded string to decode.
     * @returns {String} A decoded Javascript string.
     */

    if (str.length > 0 && str.charCodeAt(0) === 0x9D) {
        return TP.utf82unicode(str.substring(1));
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('utf8encode',
function(str) {

    /**
     * @method utf8encode
     * @summary Encode string as UTF8 only if it contains a character of 0x9D
     *     (Unicode OPERATING SYSTEM COMMAND) or a character greater than 0xFF.
     * @description This permits all strings consisting exclusively of 8 bit
     *     graphic characters to be encoded as themselves. We choose 0x9D as the
     *     sentinel character as opposed to one of the more logical PRIVATE USE
     *     characters because 0x9D is not overloaded by the regrettable
     *     "Windows-1252" character set. Now such characters don't belong in
     *     JavaScript strings, but you never know what somebody is going to
     *     paste into a text box, so this choice keeps Windows-encoded strings
     *     from bloating to UTF-8 encoding.
     * @param {String} str The string to encode in UTF-8 format.
     * @returns {String} A UTF-8 encoding string.
     */

    var necessary,
        i;

    necessary = false;

    for (i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) === 0x9D ||
            str.charCodeAt(i) > 0xFF) {
            necessary = true;

            break;
        }
    }

    if (!necessary) {
        return str;
    }

    return String.fromCharCode(0x9D) + TP.unicode2utf8(str);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('unicode2utf8',
function(str) {

    /**
     * @method unicode2utf8
     * @summary Encode Unicode argument string as UTF-8 return value
     * @param {String} str A Unicode string to encode.
     * @returns {String} The UTF-8 representation of str.
     */

    var utf8,

        n,
        c;

    utf8 = '';

    for (n = 0; n < str.length; n++) {
        c = str.charCodeAt(n);

        /* eslint-disable no-extra-parens */

        if (c <= 0x7F) {
            //  0x00 - 0x7F:  Emit as single byte, unchanged
            utf8 += String.fromCharCode(c);
        } else if ((c >= 0x80) && (c <= 0x7FF)) {
            //  0x80 - 0x7FF:  Output as two byte code, 0xC0 in first byte
            //                                          0x80 in second byte
            utf8 += String.fromCharCode((c >> 6) | 0xC0);
            utf8 += String.fromCharCode((c & 0x3F) | 0x80);
        } else {
            //  0x800 - 0xFFFF:  Output as three bytes, 0xE0 in first byte
            //                                          0x80 in second byte
            //                                          0x80 in third byte
            utf8 += String.fromCharCode((c >> 12) | 0xE0);
            utf8 += String.fromCharCode(((c >> 6) & 0x3F) | 0x80);
            utf8 += String.fromCharCode((c & 0x3F) | 0x80);
        }

        /* eslint-enable no-extra-parens */
    }

    return utf8;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('stringEscapeSlashes',
function(aStr) {

    /**
     * @method stringEscapeSlashes
     * @summary Escapes any embedded '/' characters in the supplied String.
     * @description This method respects '/'s escaped with '\'s such that they
     *     will not be 'further' escaped.
     * @param {String} aStr The String to escape the '/' character in.
     * @returns {String} The supplied string with the slashes escaped.
     */

    var parts,
        str;

    if (!TP.isString(aStr)) {
        return this.raise('InvalidParameter');
    }

    //  Split on '/', but avoiding quoted ones (i.e. backslashed '/'s).
    parts = aStr.match(/([^\\\][^/]|\\\/)+/g);

    if (TP.notValid(parts)) {
        return aStr;
    }

    str = parts.join('\\/');

    //  Now, join won't put back on leading/trailing '/' chars if they were in
    //  the original string...so verify that here.
    if (aStr.charAt(0) === '/') {
        str = '/' + str;
    }

    if (aStr.charAt(aStr.length - 1) === '/') {
        str = str + '/';
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('stringFindDelimiterIndex',
function(aStr, startDelim, endDelim, startPos) {

    /**
     * @method stringFindDelimiterIndex
     * @summary Finds the ending delimiter that matches (positionally) the
     *     start delimiter. If further start and end delimiters are nested, this
     *     routine will keep searching for the matching end delimiter.
     * @param {String} aStr The string to search.
     * @param {String} startDelim The start delimiter.
     * @param {String} endDelim The end delimiter.
     * @param {String|Number} startPos The position to start from, either a
     *     Number or a String to look for to give the initial starting position.
     * @returns {Number} The index of the end delimiter that positionally
     *     matches the start delimiter or -1 if one can't be found.
     */

    var startInd,

        startTester,
        ind,
        str,
        startCount,

        endSize,

        newStart;

    //  If a Number was supplied as the start position, use it to compute
    //  the position of the first start delimiter.
    if (TP.isNumber(startPos)) {
        startInd = aStr.indexOf(startDelim, startPos);
    } else if (TP.isString(startPos)) {
        //  Otherwise, if it was a String, get its index first, add its size
        //  to that and use that numeric position to compute the position of
        //  the first start delimiter.
        startInd = aStr.indexOf(
                        startDelim,
                        aStr.indexOf(startPos) + startPos.getSize());
    } else {
        //  Otherwise, no initial starting position was supplied, so just
        //  get the position of the first start delimiter starting at the
        //  0th index.
        startInd = aStr.indexOf(startDelim);
    }

    //  Add the size of the start delimiter to 'jump' over it and get the
    //  index to start looking for end delimiters.
    startInd += startDelim.getSize();

    //  Build a RegExp that will match the start delimiter. We use this
    //  below to test to see if chunks have nested start/end delimiters.
    startTester = TP.rc(TP.regExpEscape(startDelim), 'g');

    endSize = endDelim.getSize();

    //  While there are still end delimiters in the String, keep looping.
    while ((ind = aStr.indexOf(endDelim, startInd)) !== TP.NOT_FOUND) {
        //  Slice off a chunk from the current starting index to where we
        //  found an end delimiter.
        str = aStr.slice(startInd, ind);

        //  If there are no more start delimiters in the chunk, exit here
        //  and return the index where we found the ending delimiter.
        if (!startTester.test(str)) {
            return ind;
        } else {
            //  Otherwise, count how many start delimiters there are.
            startCount = str.match(startTester).getSize();

            newStart = ind + endSize;

            //  Start looking for end delimiters beginning just after the
            //  end delimiter that we found. Loop until a) we can no longer
            //  find end delimiters and b) there are still start delimiters
            //  left.
            while ((ind = aStr.indexOf(endDelim, newStart)) !== TP.NOT_FOUND &&
                    startCount > 0) {
                //  We found an end delimiter, so decrease the number of
                //  start delimiters.
                startCount--;

                //  Position ourselves just on the other size of the end
                //  delimiter we found.
                newStart = ind + endSize;
            }

            //  Position the overall starting index to where we found the
            //  end delimiter (subtracting back off the size of the end
            //  delimiter that we added at the end of the loop).
            startInd = newStart - endSize;
        }
    }

    return -1;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('stringMatchRecursive',
function(aString, left, right, flags) {

    /**
     * @method stringMatchRecursive
     * @summary Makes recursive matches within the supplied String, using the
     *     'left' and 'right' RegExps. If the 'flags' parameter is supplied, all
     *     matches are returned, otherwise only the first one is.
     * @description This method was adapted from Steven Levithan's
     *     'matchRecursiveRegExp' routine. Copyright 2007 Steven Levithan, MIT
     *     license.
     * @param {String} aString The string to match recursively on.
     * @param {RegExp} left The RegExp to use to match the 'left' side of each
     *     match.
     * @param {RegExp} right The RegExp to use to match the 'right' side of each
     *     match.
     * @param {String} flags A String that contains the flags used for matching.
     * @returns {String[]} An Array with the matches found.
     */

    var theFlags,
        isGlobal,
        iterator,
        theLeft,

        matches,
        remaining,
        theLastIndex,
        result;

    theFlags = flags || '';

    isGlobal = theFlags.indexOf('g') > -1;
    iterator = TP.rc(left + '|' + right, 'g' + theFlags);
    theLeft = TP.rc(left, theFlags.strip(/g/g));

    matches = TP.ac();

    do {
        remaining = 0;

        /* eslint-disable no-extra-parens */
        while ((result = iterator.exec(aString))) {
            if (theLeft.test(result.at(0))) {
                if (!(remaining++)) {
                    theLastIndex = iterator.lastIndex;
                }
            } else if (remaining > 0) {
                if (!--remaining) {
                    matches.push(aString.slice(theLastIndex, result.index));
                    if (!isGlobal) {
                        return matches;
                    }
                }
            }
        }
        /* eslint-enable no-extra-parens */
    }
    while (remaining > 0 && (iterator.lastIndex = theLastIndex));

    return matches;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('stringSplitSlashesAndRejoin',
function(aPath, joinStr) {

    /**
     * @method stringSplitSlashesAndRejoin
     * @summary Splits the supplied String on '/' and rejoins using the supplied
     *     joining String.
     * @description This method respects '/'s escaped with '\'s such that they
     *     will be treated as 'one component' and will not be split on.
     * @param {String} aPath The path String to split.
     * @param {String} joinStr The String to use to join the parts back
     *     together.
     * @returns {String} The supplied path string, split on '/' (but not escaped
     *     '/'s) and rejoined using the supplied join string.
     */

    var pathParts;

    if (!TP.isString(aPath) || !TP.isString(joinStr)) {
        return this.raise('InvalidParameter');
    }

    //  Split on '/', but avoiding quoted ones (i.e. backslashed '/'s).
    pathParts = aPath.match(/([^\\\][^/]|\\\/)+/g);

    if (TP.notValid(pathParts)) {
        return aPath;
    }

    return pathParts.join(joinStr);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('stringStripANSIControlCharacters',
function(aStr) {

    /**
     * @method stringStripANSIControlCharaters
     * @summary Strips any ANSI control characters from the supplied String.
     * @param {String} aStr The String to strip ANSI control characters from.
     * @returns {String} The supplied string with the ANSI control characters
     *     stripped.
     */

    var dat;

    if (!TP.isString(aStr)) {
        return this.raise('InvalidParameter');
    }

    dat = '' + aStr;

    //  Authoritative removal of all ANSI escape sequences per:
    //  https://superuser.com/questions/380772/removing-ansi-color-codes-from-text-stream

    /* eslint-disable no-control-regex */
    dat = dat.strip(/\x1b\[[\x30-\x3f]*[\x20-\x2f]*[\x40-\x7e]/g).
                strip(/\x1b[PX^_].*?\x1b\\/g).
                strip(/\x1b\][^\a]*(?:\x07|\x1b\\)/g).
                strip(/\x1b[\[\]A-Z\\^_@]/g);

    //  Also, need to remove '<Esc>='
    dat = dat.strip(/\x1b=/g);

    //  And backspaces
    dat = dat.strip(/\x08/g);

    /* eslint-enable no-control-regex */

    return dat;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('stringRegExpComponents',
function(pattern) {

    /**
     * @method stringRegExpComponents
     * @summary Pulls apart a regular expression source string and returns the
     *     components which would normally be passed to 'new RegExp' to create
     *     the related expression.
     * @param {String} pattern The regular expression source string.
     * @returns {String[]} An array containing two strings, the pattern and flags.
     */

    var restr,
        attrs,
        tail;

    if (!TP.isString(pattern)) {
        return this.raise('InvalidParameter', pattern);
    }

    restr = pattern;
    attrs = '';

    if (restr.charAt(0) === '/') {
        tail = restr.slice(restr.lastIndexOf('/') + 1);
        if (TP.notEmpty(tail)) {
            attrs += tail;
        }
        restr = restr.slice(1, restr.lastIndexOf('/'));
    }

    //  Don't duplicate flags or we get no regex back :(.
    attrs = attrs.split('').unique().join('');

    return TP.ac(restr, attrs);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('stringTokenizeUsingDelimiters',
function(aStr, startDelim, endDelim, exprArray, tokenPrefix, tokenSuffix) {

    /**
     * @method stringTokenizeUsingDelimiters
     * @summary Tokenizes chunks of Strings between the supplied start and end
     *     delimiters, places those chunks under numeric keys in the supplied
     *     expression Array and returns the tokenized String.
     * @param {String} aStr The string to tokenize.
     * @param {String} startDelim The start delimiter.
     * @param {String} endDelim The end delimiter.
     * @param {String[]} exprArray The Array to place the tokenized expressions.
     * @param {String} tokenPrefix A prefix to write in before the token's
     *     numeric prefix in the tokenized String.
     * @param {String} tokenSuffix A prefix to write in after the token's
     *     numeric prefix in the tokenized String.
     * @returns {String} The String with chunks tokenized and replaced with the
     *     token prefix, a numeric index and the token suffix.
     */

    var result,

        startSize,
        endSize,

        startIndex,
        anIndex,

        exprCount;

    //  The result will be an Array that we'll push String chunks into.
    result = TP.ac();

    //  Compute the starting and ending delimiter size for later
    //  computations.
    startSize = startDelim.getSize();
    endSize = endDelim.getSize();

    //  We start at the first start delimiter.
    startIndex = aStr.indexOf(startDelim);

    //  If we couldn't find one, we bail out here.
    if (startIndex === TP.NOT_FOUND) {
        return aStr;
    }

    //  Slice from the beginning of the String to the first occurrence of
    //  the start delimiter and add it to our results.
    result.push(aStr.slice(0, startIndex));

    //  The expression Array may already have contents, so we start the
    //  numbering scheme at the first available position (the end).
    exprCount = exprArray.getSize();

    //  Find the index for the matching ending delimiter.
    while ((anIndex = TP.stringFindDelimiterIndex(
                    aStr, startDelim, endDelim, startIndex)) !== TP.NOT_FOUND) {
        //  Slice from just over our start delimiter to that index (which
        //  won't include the ending delimiter itself).
        exprArray.push(aStr.slice(startIndex + startSize, anIndex));

        //  Push the prefix, the count and the suffix onto the result
        //  String.
        result.push(tokenPrefix, exprCount++, tokenSuffix);

        //  If we can't find another starting delimiter, break out.
        if ((startIndex = aStr.indexOf(
                            startDelim, anIndex + endSize)) === TP.NOT_FOUND) {
            break;
        }

        //  Push the result of slicing from just after the end delimiter to
        //  the next start index.
        result.push(aStr.slice(anIndex + endSize, startIndex));
    }

    //  Push the remainder of our String onto the results.
    result.push(aStr.slice(anIndex + endSize));

    //  Return the result, but join() it first to convert from an Array to a
    //  String.
    return result.join('');
});

//  ------------------------------------------------------------------------

TP.definePrimitive('stringUnescapeSlashes',
function(aStr) {

    /**
     * @method stringUnescapeSlashes
     * @summary Unescapes any embedded escaped '/' characters in the supplied
     *     String.
     * @param {String} aStr The String to unescape the '/' character in.
     * @returns {String} The supplied string with the escaped slashes unescaped.
     */

    var result;

    if (!TP.isString(aStr)) {
        return this.raise('InvalidParameter');
    }

    result = aStr.replace(/\\\//g, '\/');

    return result;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('stringUntokenizeUsingDelimiters',
function(aStr, startDelim, endDelim, exprArray, tokenPrefix, tokenSuffix) {

    /**
     * @method stringUntokenizeUsingDelimiters
     * @summary Untokenizes chunks of Strings that were tokenized by the
     *     TP.stringTokenizeUsingDelimiters() method above.
     * @param {String} aStr The string to untokenize.
     * @param {String} startDelim The start delimiter.
     * @param {String} endDelim The end delimiter.
     * @param {String[]} exprArray The Array to fetch the tokenized expressions
     *     from.
     * @param {String} tokenPrefix The prefix that got written in before the
     *     token's numeric prefix in the tokenized String.
     * @param {String} tokenSuffix The suffix that got written in after the
     *     token's numeric prefix in the tokenized String.
     * @returns {String} The String with the tokenized chunks put back in place.
     */

    //  Run a replace() function on a RegExp that is generated, looking for
    //  Numbers between the token prefix and suffix, replacing those chunks
    //  with the original text from the supplied expression Array.
    return aStr.replace(TP.rc(tokenPrefix + '(\\d+)' + tokenSuffix, 'g'),
                        function(wholeMatch, exprNum) {

                            return startDelim +
                                    exprArray.at(parseInt(exprNum, 10)) +
                                    endDelim;
                        });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
