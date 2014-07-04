//  ========================================================================
/*
NAME:   tibet_pack.js
AUTH:   Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
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
//  ========================================================================

/**
A simple tokenizing/trimming approach to minifying JavaScript source code.
A good part of the inspiration here comes from Douglas Crockford's Top Down
Operator Precendence paper and the tokens.js file which accompanies it, at
least the overall conceptual structure of the tokenizing loop. We've made a
number of adjustments to that simplified example so it can handle the
complexity found in the TIBET code base and avoid certain assumptions about
how the resulting token array will be utilized.
*/

//  ------------------------------------------------------------------------
//  Scanning/Tokenizing
//  ------------------------------------------------------------------------

/*
Keywords and reserved words from the ECMA 3.0 JavaScript specification.
*/

TP.boot.$keywords = [
    'break', 'case', 'catch', 'continue', 'default', 'delete', 'do', 'else',
    'false', 'finally', 'for', 'function', 'if', 'in', 'instanceof', 'new',
    'null', 'return', 'switch', 'this', 'throw', 'true', 'try', 'typeof',
    'var', 'void', 'while', 'with'
];
TP.boot.$keywordString = '__' + TP.boot.$keywords.join('__') + '__';

TP.boot.$reservedwords = [
    'abstract', 'boolean', 'byte', 'char', 'class', 'const', 'debugger',
    'double', 'enum', 'export', 'extends', 'final', 'float', 'goto',
    'implements', 'import', 'int', 'interface', 'long', 'native', 'package',
    'private', 'protected', 'public', 'short', 'static', 'super',
    'synchronized', 'throws', 'transient', 'volatile'
];
TP.boot.$reservedString = '__' + TP.boot.$reservedwords.join('__') + '__';

//  The following list is per Narcissus's jsdefs.js definitions.
TP.boot.$operators = [
    ';',
    ',',
    '=',
    '?', ':',
    '||',
    '&&',
    '|',
    '^',
    '&',
    '==', '!=', '===', '!==',
    '<', '<=', '>=', '>',
    '<<', '>>', '>>>',
    '+', '-',
    '*', '/', '%',
    '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '>>>=', '&=', '|=', '^=',
    '!', '~',
    '++', '--',
    '.',
    '[', ']',
    '{', '}',
    '(', ')'
];
TP.boot.$operatorString = '__' + TP.boot.$operators.join('__') + '__';

TP.boot.$tshOpRegex = /^\.[|&<>\(\{\[;][|&<>!\*\?\(\{\[]*/;

//  Considered 'built-in' by TIBET, but other schemes are added when
//  registered.
TP.boot.$uriSchemes = {
    'tibet':'tibet',    // common
    'urn':'urn',        // common
    'http':'http',      // common
    'https':'https',    // common
    'file':'file',      // common
    'xmpp':'xmpp',      // common
    'about':'about',    // common
    'mailto':'mailto',  // common
    'tel':'tel',        // common
    'news':'news',      // common
    'nntp':'nntp',      // common
    'ftp':'ftp',        // common
    'ws':'ws',          // common
    'wss':'wss',        // common

    'aaa':'aaa',
    'aaas':'aaas',
    'acap':'acap',
    'cap':'cap',
    'cid':'cid',
    'crid':'crid',
    'data':'data',
    'dav':'dav',
    'dict':'dict',
    'dns':'dns',
    'fax':'fax',
    'go':'go',
    'gopher':'gopher',
    'h323':'h323',
    'icap':'icap',
    'im':'im',
    'imap':'imap',
    'info':'info',
    'ipp':'ipp',
    'iris':'iris',
    'iris.beep':'iris.beep',
    'iris.xpc':'iris.xpc',
    'iris.xpcs':'iris.xpcs',
    'iris.lws':'iris.lws',
    'ldap':'ldap',
    'lsid':'lsid',
    'mid':'mid',
    'modem':'modem',
    'msrp':'msrp',
    'msrps':'msrps',
    'mtqp':'mtqp',
    'mupdate':'mupdate',
    'nfs':'nfs',
    'opaquelocktoken':'opaquelocktoken',
    'pop':'pop',
    'pres':'pres',
    'prospero':'prospero',
    'rtsp':'rtsp',
    'service':'service',
    'shttp':'shttp',
    'sip':'sip',
    'sips':'sips',
    'snmp':'snmp',
    'soap.beep':'soap.beep',
    'soap.beeps':'soap.beeps',
    'tag':'tag',
    'telnet':'telnet',
    'tftp':'tftp',
    'thismessage':'thismessage',
    'tip':'tip',
    'tv':'tv',
    'vemmi':'vemmi',
    'wais':'wais',
    'xmlrpc.beep':'xmlrpc.beep',
    'z39.50r':'z39.50r',
    'z39.50s':'z39.50s'
};

//  ------------------------------------------------------------------------
//  Helper Functions
//  ------------------------------------------------------------------------

TP.$is_identifier = function(tokenType) {

    /**
    @method     $is_identifier
    @abstract   Returns true if the token type represents an
                identifier of some kind. Valid identifier types
                include 'identifier', 'keyword', and 'reserved'.
    @return     Boolean     True for identifier types/subtypes.
    */

    return tokenType === 'identifier' ||
            tokenType === 'keyword' ||
            tokenType === 'reserved';
};

//  ------------------------------------------------------------------------

TP.$is_ioend = function(anOperator) {

    /**
    @method     $is_ioend
    @abstract   Returns true if the operator represents a pipe symbol that
                ends a pipe segment. Common values are .;, .||, and .&&
                which all imply the next command does not read stdio etc.
    @param      anOperator      String      The operator to test.
    @return     Boolean
    */

    return (anOperator === '.;') ||
            (anOperator === '.||') ||
            (anOperator === '.&&');
};

//  ------------------------------------------------------------------------

TP.$is_scheme = function(anIdentifier) {

    /**
    @method     $is_scheme
    @abstract   Returns true if token's value is a valid URI scheme. The
                list maintained in TP.boot.$uriSchemes.
    @param      anIdentifier        String      A string value to test.
    @return     Boolean
    */

    var value;

    if (!anIdentifier) {
        return false;
    }

    value = anIdentifier;

    return TP.boot.$uriSchemes[value] === value;
};

//  ------------------------------------------------------------------------

TP.$is_terminator = function(anOperator) {

    /**
    @method     $is_terminator
    @abstract   Returns true if the operator represents a common
                statement or substatement terminator. Semicolons and TSH
                operators (which all start with .) are terminators since
                they end a statement or sub-statement.
    @param      anOperator      String      The operator to test.
    @return     Boolean
    */

    return (anOperator === ';') || (TP.boot.$tshOpRegex.test(anOperator));
};

//  ------------------------------------------------------------------------

TP.$is_whitespace = function(tokenType) {

    /**
    @method     $is_whitespace
    @abstract   Returns true if the token type represents a form of
                whitespace such as a 'space', 'tab', or 'newline'.
    @return     Boolean     True for whitespace token subtypes.
    */

    return tokenType === 'space' ||
            tokenType === 'tab' ||
            tokenType === 'newline';
};

//  ------------------------------------------------------------------------
//  Tokenizing
//  ------------------------------------------------------------------------

TP.$tokenize = function(src, ops, tsh, exp, alias, args) {

    /**
    @method     $tokenize
    @abstract   Processes a string (usually of raw JavaScript source code),
                returning an array of token objects which represent the
                source string in a "digestable" form. Token types include:
                comment, newline, space, keyword, reserved, identifier,
                regexp, string, number, operator, and substitution. This set
                allows us to have reasonable control over the source for
                condensing or other processing without resorting immediately
                to a full parser.
    @param      src         String      The JavaScript source to process.
    @param      ops         Array       An optional array of additional
                                        operator strings which should be
                                        considered valid for the source.
    @param      tsh         Boolean     True to support extensions specific
                                        to the TIBET Shell (tsh) which
                                        includes ${var} and `cmd` syntax as
                                        well as limited markup processing.
    @param      exp         Boolean     True to signify that the content is
                                        being tokenized for expansion, which
                                        means certain clues for strings and
                                        regular expressions won't be found.
    @param      alias       Boolean     True to signify content is being
                                        tokenized for aliasing purposes. This
                                        causes substitutions to always
                                        terminate an ongoing string or URI.
    @param      args        Boolean     True to signify content is being
                                        tokenized for 'shell arguments'.
    @return     Array       An array of token objects, simple objects which
                            represent one token within the source string.
    */

    var digit,
        hexDigit,
        octalDigit,
        identHead,
        identBody,
        keywords,
        operators,

        identifier_type,
        new_token,

        reserved,

        result,
        len,
        i,
        c,
        cc,
        lines,
        from,
        str,
        num,
        quote,
        attr,
        j,
        k,
        count,
        last,
        token,
        block,
        err,

        startsURI,
        uriParenCount,

        startsTemplate,
        templateBracketCount;

    //  common regular expressions used for character testing
    digit = /[0-9]/;
    hexDigit = /[0-9a-fA-F]/;
    octalDigit = /[0-7]/;

    //  NB: we allow '@' as a leading character for an identifer, so that users
    //  can use 'dereferencing sugar', but the system will strip this before it
    //  tries to evaluate it.

    identHead = (args === true) ? /[@$_a-zA-Z{]/ : /[@$_a-zA-Z]/;
    identBody = (args === true) ? /[{$_a-zA-Z0-9}]/ : /[$_a-zA-Z0-9]/;

    //  easily tested strings used for identifier/operator testing
    keywords = TP.boot.$keywordString;
    reserved = TP.boot.$reservedString;
    operators = TP.boot.$operatorString;
    if (ops) {
        //  merge in any operators that may have been passed in to augment
        //  the list we should tokenize
        operators += ops.join('__') + '__';
    }

    //  ---
    //  helper functions
    //  ---

    identifier_type = function(str) {
        /**
        @method     identifier_type
        @abstract   Returns the proper type for an identifier string. This
                    allows the tokenizer to fine-tune identifier recognition
                    to point out keywords, reserved words, etc.
        @param      str         String      The identifier string to
                                            categorize.
        @return     String      An identifier type: 'keyword', 'reserved',
                                or 'identifier'.
        */

        if (keywords.indexOf('__' + str + '__') > 0) {
            return 'keyword';
        }
        else if (reserved.indexOf('__' + str + '__') > 0) {
            return 'reserved';
        }

        return 'identifier';
    };

    new_token = function(type, value) {
        /**
        @method     new_token
        @abstract   Simple token constructor which returns a token object
                    identifying the token type, value, and its location in
                    the source text.
        @param      type        String      The token type. Must be one of
                                            the standard token types for the
                                            outer $tokenize method.
        @param      value       String      The string value for the token.
        @return     Object      A simple object containing type, value,
                                line, from, and to keys for the token.
        */

        //  assign to outer scope'd variable for use in processing loop
        last = {'name': type,
                'value': value,
                'line': lines,
                'from': from,
                'to': i};

        return last;
    };

    //  ---
    //  main processing loop
    //  ---

    //  configure the token stream and return it empty if no real source
    result = [];
    if (!src) {
        return result;
    }

    len = src.length;
    i = 0;
    lines = 1;

    uriParenCount = 0;
    templateBracketCount = 0;

    c = src.charAt(i);
    while (c) {
        from = i;

        //  a bit nasty, but seems to work even with &nbsp;
        if ((c <= ' ') || (c.charCodeAt(0) === 160)) {
            //  control characters are largely stripped when found but we do
            //  handle certain forms of whitespace to preserve semantics.

            if ((c === ' ') || (c.charCodeAt(0) === 160)) {
                result.push(new_token('space', c));
            } else if (c === '\t') {
                result.push(new_token('tab', c));
            } else if (c === '\n') {
                token = new_token('newline', '\n');
                result.push(token);
                lines++;
            } else if (c === '\r') {
                //  replace \r so we normalize newlines, but don't create
                //  extra lines when the next character is a newline
                if (src.charAt(i + 1) !== '\n') {
                    token = new_token('newline', '\n');
                    result.push(token);
                    lines++;
                }
            }

            i += 1;
            c = src.charAt(i);
        }
        else if (identHead.test(c) ||
                (tsh && (c === '~' ||
                         c === '#' ||
                        (c === '.' && src.charAt(i + 1) === '/' ) ||
                        (c === '.' && src.charAt(i + 1) === '.' && src.charAt(i + 2) ==='/' )

                        ))) {

            //  identifiers start with $, _, or a-zA-Z, then allow 0-9
            str = c;
            i += 1;

            startsTemplate = (str === '{' && src.charAt(i) === '{');

            if (tsh && startsTemplate) {

                err = false;

                //  'str' now contains both parens
                str += c;
                i += 1;

                templateBracketCount = 2;

                for (;;) {
                    c = src.charAt(i);

                    if (c === '{' && src.charAt(i - 1) !== '\\') {
                        templateBracketCount++;
                    }
                    if (c === '}' && src.charAt(i - 1) !== '\\') {
                        templateBracketCount--;
                    }

                    str += c;
                    i += 1;

                    if (c === '' && templateBracketCount !== 0) {
                        err = true;
                        TP.boot.$stderr('Unbalanced parens in template: ' +
                            TP.boot.$dump(new_token('substitution', str),
                                ', '));

                        break;
                    }

                    if (templateBracketCount === 0) {

                        if (!err) {
                            //  scheme-specific part of the URI
                            result.push(new_token('substitution', str));
                        }

                        break;
                    }
                }
            } else {
                // identHead || ~ || #
                // ...but not a 'special variable sub' (${...})

                err = false;

                c = src.charAt(i);

                //  '#', '~', '/', './' or '../' starts a URI
                startsURI =
                    (str === '#' && !digit.test(c)) ||
                    (str === '~') ||
                    (str === '.' && c === '/') ||
                    (str === '.' && c === '.' && src.charAt(i + 1) === '/');

                if ((identBody.test(c) === true) ||
                    (tsh && startsURI)) {
                    str += c;
                    i += 1;
                    for (;;) {
                        c = src.charAt(i);
                        if (identBody.test(c) !== true) {
                            break;
                        }

                        str += c;
                        i += 1;
                    }

                    //  in the TSH we have special cases for URI syntax so
                    //  you can type http://www.tibet.com and not lose the
                    //  tail as a comment. the one caveat is that we rely on a
                    //  strict list of schemes and only support those here.
                    if (tsh && ((c === ':' && TP.$is_scheme(str)) ||
                                startsURI)) {

                        //  if we get into a paren, note it... that means
                        //  this is an XPointer of some sort, which means it
                        //  can have spaces etc.
                        if (c === '(') {
                            uriParenCount++;
                        }

                        str += c;
                        i += 1;

                        for (;;) {
                            c = src.charAt(i);

                            //  Can have nested parens
                            if (c === '(') {
                                uriParenCount++;
                            }

                            //  consume quoted attribute values. This includes
                            //  support for nested quotes
                            if (!alias && (c === '"' || c === '\'') &&
                                src.charAt(i - 1) === '=') {
                                attr = '';
                                i += 1;

                                quote = c;
                                for (;;) {
                                    c = src.charAt(i);
                                    if (c === quote &&
                                        src.charAt(i - 1) !== '\\') {

                                        str += encodeURIComponent(attr);
                                        i += 1;
                                        c = src.charAt(i);
                                        break; // break out of this for loop
                                    }

                                    if (c === '\\' &&
                                        src.charAt(i + 1) === quote) {
                                        //  don't add the backslash as we don't
                                        //  want it encoded
                                    } else {
                                        attr += c;
                                    }

                                    i += 1;
                                }
                            }

                            if (c === ')') {
                                uriParenCount--;
                            }

                            if (uriParenCount === 0) {
                                //  various "end of URI" signifiers
                                if (c === '\n' || c === '\r' || c === '' ||
                                    c <= ' ' || c.charCodeAt(0) === 160) {
                                    break;
                                }

                                //  TSH pipe/redirection symbol is a
                                //  terminator
                                if ((c === '.') &&
                                    '|&<>({['.indexOf(src.charAt(i + 1)) >= 0) {
                                    break;
                                }

                                //  If aliasing then substitutions are a
                                //  terminator.
                                if (alias && (c === '$') &&
                                    '{'.indexOf(src.charAt(i + 1)) >= 0) {
                                    break;
                                }
                            }

                            if (c === '' && uriParenCount !== 0) {
                                err = true;
                                TP.boot.$stderr('Unbalanced parens in URI: ' +
                                    TP.boot.$dump(new_token('uri', str),
                                        ', '));
                                break;
                            }

                            str += c;
                            i += 1;
                        }

                        if (!err) {
                            //  scheme-specific part of the URI
                            result.push(new_token('uri', str));
                        }
                    } else {
                        //  for identifiers we do a lookup to refine the type
                        //  here
                        result.push(new_token(identifier_type(str), str));
                    }
                } else {
                    if (identHead.test(str)) {
                        result.push(new_token(identifier_type(str), str));
                    } else {
                        //  first char after the ~ or # is a number or
                        //  similarly invalid identifier character so the ~
                        //  or # is treated as an operator.
                        result.push(new_token('operator', str));
                    }
                }
            }

            //  NOTE that the character which triggered failure of our inner
            //  for-loop will be in c, so we don't need to adjust index/char
        } else if (digit.test(c)) {
            err = false;

            //  number: 0xblah for Hex, optional e/E exponent, etc.
            str = c;
            i += 1;

            //  what we do next depends a lot on the next character...
            c = src.charAt(i);

            //  check for hex. it's got more restricted data rules since you
            //  can't have exponents or fractional parts
            if (c === 'x' || c === 'X') {
                str += c;
                i += 1;
                for (;;)
                {
                    c = src.charAt(i);
                    if (!hexDigit.test(c)) {
                        break;
                    }
                    str += c;
                    i += 1;
                }
            } else {
                //  char must be a digit, a decimal point, or an exponent
                //  signifier to be valid. we test first for a second digit
                //  which allows us to consume initial digit sequences that
                //  serve as a prefix for a decimal point or exponent part.

                if (digit.test(c)) {
                    str += c;
                    i += 1;

                    //  read all remaining contiguous digits. NOTE that when
                    //  the string starts with 0 it should be restricted to
                    //  octal values, but we'll consume all digits here and
                    //  let the string-to-number conversion at the end fail
                    //  as a way of catching bad values.
                    for (;;) {
                        c = src.charAt(i);
                        if (!digit.test(c)) {
                            //  ran into something that's not a digit, but
                            //  we'll worry about what that might be in the
                            //  next couple of if statement checks. Note
                            //  that we'll have left c on the 'non-digit'
                            //  value for those tests.
                            break;
                        }
                        str += c;
                        i += 1;
                    }
                }

                //  check for fractional portion
                if (c === '.') {
                    //  TSH can often have .)) or similar operators which,
                    //  if placed after a number can create syntax errors.
                    //  also, we want ./ and ../ to be picked up as path
                    //  prefixes, not separate operators, so make sure the
                    //  dot is only added when at least one trailing digit
                    //  is found
                    if (digit.test(src.charAt(i + 1))) {
                        //  push the '.' and keep processing digits until
                        //  we run out or hit an 'e' for exponent portion or
                        //  some other character that forces us to evaluate
                        //  whether we're really looking at a number here.
                        str += c;
                        i += 1;

                        for (;;) {
                            c = src.charAt(i);
                            if (!digit.test(c)) {
                                //  as with earlier digit-consumption loop
                                //  we'll process digits while we can and
                                //  leave validation of the "tail" to the
                                //  next if test.
                                break;
                            }
                            str += c;
                            i += 1;
                        }
                    }
                }

                //  check for exponent (e+/1dddd)
                if (c === 'e' || c === 'E') {
                    //  push e/E onto string
                    str += c;
                    i += 1;

                    //  exponent should be followed by +/- and/or digits so
                    //  read another character and test
                    c = src.charAt(i);

                    //  check for optional +/- sign for exponent
                    //  should only be digits after optional +/-
                    if ((digit.test(c) !== true) && c !== '-' && c !== '+') {
                        err = true;
                        TP.boot.$stderr('Bad exponent: ' +
                            TP.boot.$dump(new_token('number', str + c),
                                ', '));

                        //  see if we can salvage a number from the rest of
                        //  the string content, stripping the 'e' portion.
                        num = 0 + str.slice(0, str.length - 1);
                        if (isFinite(num)) {
                            //  push new numeric token
                            result.push(new_token('number', str));
                        } else {
                            err = true;
                            TP.boot.$stderr('Bad number: ' +
                                TP.boot.$dump(new_token('number', str),
                                    ', '));
                        }

                        //  NOTE that we've already incremented the index
                        //  and retrieved a character which didn't test
                        //  out...now we want to have it break out to the
                        //  next character portion of the outer while loop
                        continue;
                    } else {
                        //  push digit or +/- onto string and read
                        //  remaining digits until we run out
                        do {
                            str += c;
                            i += 1;
                            c = src.charAt(i);
                        } while (digit.test(c));

                        //  NOTE that the 'c' will be the next char here so
                        //  again we don't want/need to increment index/c.

                        //  We do want to test c at this point to ensure
                        //  that we terminated the number with something
                        //  that's at least potentially valid, and that
                        //  leaves out any identifier characters.
                        if (identHead.test(c)) {
                            str += c;
                            i += 1;

                            err = true;
                            TP.boot.$stderr('Bad number: ' +
                                TP.boot.$dump(new_token('number', str),
                                    ', '));
                        }
                    }
                } else {
                    //  most likely we're looking at a bad number value if
                    //  continued characters don't represent an operator or
                    //  a grouping construct.
                    if (identHead.test(c)) {
                        str += c;
                        i += 1;

                        err = true;
                        TP.boot.$stderr('Bad number: ' +
                            TP.boot.$dump(new_token('number', str),
                                ', '));
                    }
                }
            }

            if (!err) {
                //  convert string into a number and verify that it's real
                num = +str;

                if (isFinite(num)) {
                    //  push new numeric token
                    result.push(new_token('number', str));
                } else {
                    TP.boot.$stderr('Bad number: ' +
                        TP.boot.$dump(new_token('number', str), ', '));
                }
            }
        } else if (c === '\'' || c === '"' || (tsh && (c === '`'))) {
            //  quoted string...and TSH command-substitutions. these are
            //  all treated as "quoting characters", but we tokenize the
            //  command substitution as such rather than as a string when
            //  the tsh syntax flag is set.

            str = c;
            quote = c;

            i += 1;

            for (;;) {
                c = src.charAt(i);
                if (c === '\n' || c === '\r' || c === '') {
                    if (c !== '') {
                        str += c;
                    }

                    if (!tsh) {
                        TP.boot.$stderr('Unterminated string: ' +
                            TP.boot.$dump(new_token('string', str), ', '));

                        //  consider this a warning, go ahead and push the
                        //  token data we do have out so it's at least in
                        //  the final stream
                        result.push(new_token('string', str));
                        break;
                    }

                    //  in TSH processing not all content is JS, much more
                    //  is actually markup where a ' or " should simply be
                    //  treated as another character. Of course, that means
                    //  that we have to "back up" and reprocess the str
                    //  value for other characters of interest rather than
                    //  continuing to treat it like "offlimit" content.
                    result.push(new_token('quote', quote));

                    i = i - str.length;
                    if (c !== '') {
                        i += 1;
                    }
                    break;
                }

                //  do the append with unicode-sensitive operations
                cc = src.charCodeAt(i);
                str += String.fromCharCode(cc);

                //  closing quote? as long as it's not escaped we're good
                if (c === quote) {
                    //  bit tricky since you can have multiple \'s and we
                    //  need to know if the number is odd or even to
                    //  determine whether we're really escaped or not
                    j = i - 1;
                    count = 0;
                    while (src.charAt(j) === '\\') {
                        count++;
                        j--;
                    }

                    //  even? quote not escaped, the '\' is
                    if (count % 2 === 0) {
                        if (quote === '`') {
                            result.push(new_token('substitution', str));
                        } else {
                            result.push(new_token('string', str));
                        }
                        break;
                    }
                }

                i += 1;
            }

            i += 1;
            c = src.charAt(i);
        } else if (c === '/') {
            //  opening / can be 'divide', a regex, a single-line comment,
            //  or a multi-line comment depending on the next character and
            //  other contextual information.

            switch (src.charAt(i + 1)) {
                case '/':
                    //  single line comment. read/consume chars up through a
                    //  newline which terminates the comment. NOTE that
                    //  earlier code for identifier/: locates URIs prior to
                    //  the // so we don't strip URI content as comment.

                    str = '//';
                    i += 2;

                    for (;;) {
                        c = src.charAt(i);
                        if (c === '\n' || c === '\r' || c === '') {
                            break;
                        }

                        //  do the append with unicode-sensitive operations
                        cc = src.charCodeAt(i);
                        str += String.fromCharCode(cc);
                        i += 1;
                    }

                    result.push(new_token('comment', str));
                    break;

                case '*':
                    //  multi-line comment. read/consume up through a
                    //  closing */. regular expressions would require there
                    //  to be at least one character prior to the *, a
                    //  backslash to escape it if a literal * was intended.

                    str = '/*';
                    i += 2;

                    for (;;) {
                        c = src.charAt(i);
                        if (c === '') {
                            TP.boot.$stderr('Unterminated comment: ' +
                                TP.boot.$dump(new_token('comment', str),
                                    ', '));
                            break;
                        } else if (c === '*') {
                            if (src.charAt(i + 1) === '/')
                            {
                                str += '*/';
                                i += 2;
                                c = src.charAt(i);
                                break;
                            }
                        }

                        if (c === '\n') {
                            lines++;
                        }

                        //  do the append with unicode-sensitive operations
                        cc = src.charCodeAt(i);
                        str += String.fromCharCode(cc);
                        i += 1;
                    }

                    result.push(new_token('comment', str));
                    break;

                default:

                    //  trick here is to try to recognize regex literals so
                    //  we can treat them as opaque chunks. if we don't then
                    //  regexes containing quotes or numbers might end up
                    //  confusing the tokenizer around those types.

                    //  from a pure syntax perspective a regular expression
                    //  literal is all content between a pair of forward
                    //  slashes, and you can't strictly know whether the
                    //  initial / is regex opener or not until you read up
                    //  to the next newline.

                    //  when in TSH mode we defer to XML over regexp
                    if (tsh && src.charAt(i + 1) === '>') {
                        result.push(new_token('operator', '/>'));
                        i += 2;
                        c = src.charAt(i);
                        break;
                    }

                    //  when trying to tokenize stripped code there won't
                    //  be any newlines to give us clues or tell us for sure
                    //  that we're in a regular expression. the only thing
                    //  we can try to do in those cases is look at context.
                    //  regular expressions typically have to follow an
                    //  assignment, comma, or opening parenthesis since they
                    //  haveto either be assigned to a variable or passed to
                    //  a function like split or replace.
                    if (exp && last &&
                        (last.value !== '=') &&
                        (last.value !== '(') &&
                        (last.value !== ',')) {
                        result.push(new_token('operator', '/'));
                        i += 1;
                        c = src.charAt(i);
                        break;
                    }

                    j = i + 1;
                    str = c;

                    block = 0;

                    for (;;) {
                        c = src.charAt(j);
                        if (c === '\n' || c === '\r' || c === '') {
                            //  ran out of chars before we found a closing
                            //  character (newline or end of stream) so it's
                            //  _not_ a regular expression...could be either
                            //  a / or /= operator
                            str = (src.charAt(i + 1) === '=') ? '/=' : '/';
                            result.push(new_token('operator', str));
                            i += str.length;
                            c = src.charAt(i);
                            break;
                        }

                        //  forward brackets inside character classes don't
                        //  have to be escaped...so we don't want to count
                        //  them twice
                        if ((c === '[') && (block < 1)) {
                            //  if not escaped...count it
                            k = j - 1;
                            count = 0;
                            while (src.charAt(k) === '\\') {
                                count++;
                                k--;
                            }

                            if (count % 2 === 0) {
                                block++;
                            }
                        }

                        //  reverse brackets inside character classes don't
                        //  have to be escaped...so we don't want to count
                        //  them twice
                        if ((c === ']') && (block > 0)) {
                            //  if not escaped...count it
                            k = j - 1;
                            count = 0;
                            while (src.charAt(k) === '\\') {
                                count++;
                                k--;
                            }

                            if (count % 2 === 0) {
                                block--;
                            }
                        }

                        //  if we find an unescaped / outside of a character
                        //  class we're at the end of the regex. we'll need
                        //  to increment the c to keep the outer loop
                        //  running properly
                        if (c === '/' && (block === 0)) {
                            //  bit tricky since you can have multiple
                            //  \'s and we need to know if the number is
                            //  odd or even to determine whether we're
                            //  really escaped or not
                            k = j - 1;
                            count = 0;
                            while (src.charAt(k) === '\\') {
                                count++;
                                k--;
                            }

                            //  even? '/' not escaped, the '\' is, so
                            //  this is a valid termination of the regex
                            if (count % 2 === 0) {
                                str += c;
                                j += 1;

                                //  the other tricky part here is that a
                                //  regex literal can have trailing
                                //  characters including 'g','i','m',
                                //  'y', or combinations of those chars
                                //  so we have to consume them as well.
                                for (;;) {
                                    c = src.charAt(j);
                                    if (/[gimy]/.test(c) !== true) {
                                        break;
                                    }
                                    str += c;
                                    j += 1;
                                }

                                result.push(new_token('regexp', str));
                                i = j;
                                break;
                            } else {
                                //  escaped? keep scanning for the end
                                str += c;
                                j += 1;
                            }
                        } else {
                            //  not there yet...use unicode operations
                            cc = src.charCodeAt(j);
                            str += String.fromCharCode(cc);
                            j += 1;
                        }
                    }
                    break;
            }
        } else if (tsh && (c === '<') && (src.charAt(i + 1) === '/')) {
            //  XML tag closing operator
            result.push(new_token('operator', '</'));
            i += 2;
            c = src.charAt(i);
        } else {
            //  try to construct the longest possible operator from the
            //  characters remaining in the string. note that we don't allow
            //  for operators longer than 4 characters in length

            str = src.slice(i, i + 4);
            for (j = 3; j > 0; j--) {
                if (operators.indexOf('__' + str + '__') > 0) {
                    break;
                }
                str = str.slice(0, j);
            }

            result.push(new_token('operator', str));

            i += str.length;
            c = src.charAt(i);
        }
    }

    if (tsh && TP.sys.cfg('log.tsh_tokenize')) {
        TP.boot.$stdout(TP.json(result));
    }

    return result;
};

//  ------------------------------------------------------------------------
//  Packing/Condensing
//  ------------------------------------------------------------------------

TP.$condenseJS = function(src, newlines, spaces, operators, tokens, nojoin,
                            tsh) {

    /**
    @method     $condenseJS
    @abstract   Condenses a string of JavaScript source code using a fairly
                simple tokenizing process to segment the original source and
                then remove comments, extraneous whitespace, and optionally
                remove newlines.
    @param      src             String      The JavaScript source to
                                            process.
    @param      newlines        Boolean     True to remove newlines. Default
                                            is false to limit the potential
                                            for introducing bugs, but blank
                                            lines are still removed in all
                                            cases.
    @param      spaces          Boolean     True to remove spaces. Default
                                            is true to create minimal output
                                            size.
    @param      operators       Array       An optional array of additional
                                            operator token strings.
    @param      tokens          Boolean     True forces tokens back into the
                                            output array rather than values.
    @param      nojoin          Boolean     True turns off join processing
                                            so the result is the processed
                                            token array rather than a string.
    @param      tsh             Boolean     True if TIBET Shell (TSH)
                                            semantics should be observed.
    @return     String|Array    The condensed source code or token array.
    */

    var arr,
        len,
        i,
        token,
        result,
        last,
        next;

    arr = TP.$tokenize(src, operators, tsh, false, false, true);
    len = arr.length;

    result = [];

    for (i = 0; i < len; i++) {
        token = arr[i];
        switch (token.name)
        {
            case 'comment':

                //  we remove comments unless they start with /*** so we can
                //  preserve things like copyright notices etc.
                if (token.value.indexOf('/***') === 0) {
                    result.push(tokens ? token : token.value);
                    last = token;
                }
                break;

            case 'newline':

                //  if newlines are defaulted, or set explicitly to false
                //  then we don't remove them...except blank lines
                /* jshint -W041, eqeqeq:false */
                if (newlines == null || newlines === false) {
                /* jshint +W041, eqeqeq:true */
                    if (!last || (last.name === 'newline')) {
                        continue;
                    }

                    result.push(tokens ? token : token.value);
                    last = token;
                }
                else
                {
                    //  although not common in TIBET code (due to our
                    //  coding standard) it's common for people to overlook
                    //  that assigning functions to variables requires a
                    //  trailing semi-colon to ensure proper operation.
                    //  without a full parse we simply avoid removing
                    //  newlines after } in most cases.
                    if (last &&
                        last.name === 'operator' && last.value === '}') {
                        if ((next = arr[i + 1])) {
                            //  common syntax where we can be sure that
                            //  removing the newline won't create a bug
                            if ((next.value === 'else') ||
                                (next.value === 'catch') ||
                                (next.value === 'finally') ||
                                (next.value === '}') ||
                                (next.value === ')')) {
                                continue;
                            }
                        }

                        result.push(tokens ? token : token.value);
                        last = token;
                    }
                }

                break;

            case 'tab':     //  fall-through and treat like a space
            case 'space':

                //  if spaces is explicity false then we skip removal
                /* jshint -W041, eqeqeq:false */
                if ((spaces != null) && (spaces === false)) {
                /* jshint +W041, eqeqeq:true */
                    result.push(tokens ? token : token.value);
                    last = token;
                    break;
                }

                //  trim leading or repeating sequences of whitespace since
                //  that can't alter semantics while we're preserving at
                //  least one space or tab between other tokens
                if (!last || (last && TP.$is_whitespace(last.name))) {
                    break;
                }

                //  whitespace around operators can also be trimmed...except
                //  when doing so might cause the following token's prefix
                //  to confuse things...as in foo - -bar which transforms
                //  into foo--bar aka foo-- bar (oops).
                next = arr[i + 1];
                if ((last && (last.name === 'operator')) ||
                    (next && (next.name === 'operator'))) {
                    //  tsh terminators should preserve space
                    if ((last && TP.boot.$tshOpRegex.test(last.value)) ||
                        (next && TP.boot.$tshOpRegex.test(next.value))) {
                        result.push(tokens ? token : token.value);
                        last = token;
                    }

                    //  other bugs are ++ and -- combinations
                    if ((last && next) &&
                        (/[-+]$/.test(last.value) &&
                        /^[-+]/.test(next.value))) {
                        result.push(tokens ? token : token.value);
                        last = token;
                    }

                    break;
                }

                result.push(tokens ? token : token.value);
                last = token;
                break;

            default:
                result.push(tokens ? token : token.value);
                last = token;
                break;
        }
    }

    //  not all callers want joined text, some just want the trimmed array
    //  as a precursor to further processing.
    if (nojoin) {
        return result;
    }

    //  join and add a proper final newline as needed (vim-friendly :))
    return result.join('') + ((last && last.name !== 'newline') ? '\n' : '');
};

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
