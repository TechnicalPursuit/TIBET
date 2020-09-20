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
Keywords and reserved words from the ECMA 6.0 JavaScript specification.
*/

TP.boot.defineAttribute('$keywords',
    TP.ac(
        'break',
        'case',
        'class',
        'catch',
        'const',
        'continue',
        'debugger',
        'default',
        'delete',
        'do',
        'else',
        'export',
        'extends',
        'false',
        'finally',
        'for',
        'function',
        'if',
        'import',
        'in',
        'instanceof',
        'let',
        'new',
        'null',
        'return',
        'super',
        'switch',
        'this',
        'throw',
        'true',
        'try',
        'typeof',
        'var',
        'void',
        'while',
        'with',
        'yield'));

TP.boot.defineAttribute('$keywordString',
    '__' + TP.boot.$keywords.join('__') + '__');

TP.boot.defineAttribute('$futurereservedwords',
    TP.ac(
        'abstract',
        'await',
        'boolean',
        'byte',
        'char',
        'double',
        'enum',
        'final',
        'float',
        'goto',
        'implements',
        'int',
        'interface',
        'long',
        'native',
        'package',
        'private',
        'protected',
        'public',
        'short',
        'static',
        'synchronized',
        'transient',
        'volatile'
    ));

TP.boot.defineAttribute('$futureReservedString',
    '__' + TP.boot.$futurereservedwords.join('__') + '__');

//  The following list is per Narcissus's jsdefs.js definitions, adjusted to
//  also take ES6 bits into account.
TP.boot.defineAttribute('$operators',
    TP.ac(
        '#',
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
        '(', ')',
        //  ES6
        '...', '=>'
    ));

TP.boot.defineAttribute('$operatorString',
        '__' + TP.boot.$operators.join('__') + '__');

TP.boot.defineAttribute('$tshOpRegex',
        /^\.[|?%*&<>\(\{\[;][|&<>!\*\?\%\(\{\[]*/);

//  Considered 'built-in' by TIBET, but other schemes are added when
//  registered.
TP.boot.defineAttribute('$uriSchemes',
    {
        tibet: 'tibet',    // common
        urn: 'urn',        // common
        http: 'http',      // common
        https: 'https',    // common
        file: 'file',      // common
        xmpp: 'xmpp',      // common
        about: 'about',    // common
        mailto: 'mailto',  // common
        tel: 'tel',        // common
        news: 'news',      // common
        nntp: 'nntp',      // common
        ftp: 'ftp',        // common
        ws: 'ws',          // common
        wss: 'wss',        // common

        aaa: 'aaa',
        aaas: 'aaas',
        acap: 'acap',
        cap: 'cap',
        'chrome-extension': 'chrome-extension',
        cid: 'cid',
        crid: 'crid',
        data: 'data',
        dav: 'dav',
        dict: 'dict',
        dns: 'dns',
        fax: 'fax',
        go: 'go',
        gopher: 'gopher',
        h323: 'h323',
        icap: 'icap',
        im: 'im',
        imap: 'imap',
        info: 'info',
        ipp: 'ipp',
        iris: 'iris',
        'iris.beep': 'iris.beep',
        'iris.xpc': 'iris.xpc',
        'iris.xpcs': 'iris.xpcs',
        'iris.lws': 'iris.lws',
        ldap: 'ldap',
        lsid: 'lsid',
        mid: 'mid',
        modem: 'modem',
        msrp: 'msrp',
        msrps: 'msrps',
        mtqp: 'mtqp',
        mupdate: 'mupdate',
        nfs: 'nfs',
        opaquelocktoken: 'opaquelocktoken',
        pop: 'pop',
        pres: 'pres',
        prospero: 'prospero',
        rtsp: 'rtsp',
        service: 'service',
        shttp: 'shttp',
        sip: 'sip',
        sips: 'sips',
        snmp: 'snmp',
        'soap.beep': 'soap.beep',
        'soap.beeps': 'soap.beeps',
        tag: 'tag',
        telnet: 'telnet',
        tftp: 'tftp',
        thismessage: 'thismessage',
        tip: 'tip',
        tv: 'tv',
        vemmi: 'vemmi',
        wais: 'wais',
        'xmlrpc.beep': 'xmlrpc.beep',
        'z39.50r': 'z39.50r',
        'z39.50s': 'z39.50s'
    });

//  ------------------------------------------------------------------------
//  Helper Functions
//  ------------------------------------------------------------------------

TP.definePrimitive('$is_identifier',
function(tokenType) {

    /**
    @method     $is_identifier
    @summary    Returns true if the token type represents an
                identifier of some kind. Valid identifier types
                include 'identifier', 'keyword', and 'reserved'.
    @returns    {Boolean} True for identifier types/subtypes.
    */

    return tokenType === 'identifier' ||
            tokenType === 'keyword' ||
            tokenType === 'reserved';
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$is_ioend',
function(anOperator) {

    /**
    @method     $is_ioend
    @summary    Returns true if the operator represents a pipe symbol that
                ends a pipe segment. Common values are .;, .||, and .&&
                which all imply the next command does not read stdio etc.
    @param      {String} anOperator The operator to test.
    @returns    {Boolean}
    */

    /* eslint-disable no-extra-parens */
    return (anOperator === '.;' ||
            anOperator === '.||' ||
            anOperator === '.&&');
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$is_scheme',
function(anIdentifier) {

    /**
    @method     $is_scheme
    @summary    Returns true if token's value is a valid URI scheme. The
                list maintained in TP.boot.$uriSchemes.
    @param      {String} anIdentifier A string value to test.
    @returns    {Boolean}
    */

    var value;

    if (!anIdentifier) {
        return false;
    }

    value = anIdentifier;

    return TP.boot.$uriSchemes[value] === value;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$is_terminator',
function(anOperator) {

    /**
    @method     $is_terminator
    @summary    Returns true if the operator represents a common
                statement or substatement terminator. Semicolons and TSH
                operators (which all start with .) are terminators since
                they end a statement or sub-statement.
    @param      {String} anOperator The operator to test.
    @returns    {Boolean}
    */

    /* eslint-disable no-extra-parens */
    return (anOperator === ';' || TP.boot.$tshOpRegex.test(anOperator));
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$is_whitespace',
function(tokenType) {

    /**
    @method     $is_whitespace
    @summary    Returns true if the token type represents a form of
                whitespace such as a 'space', 'tab', or 'newline'.
    @returns    {Boolean} True for whitespace token subtypes.
    */

    /* eslint-disable no-extra-parens */
    return (tokenType === 'space' ||
            tokenType === 'tab' ||
            tokenType === 'newline');
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------
//  Tokenizing
//  ------------------------------------------------------------------------

TP.definePrimitive('$tokenize',
function(src, ops, tsh, exp, alias, args) {

    /**
    @method     $tokenize
    @summary    Processes a string (usually of raw JavaScript source code),
                returning an array of token objects which represent the
                source string in a "digestable" form. Token types include:
                comment, newline, space, keyword, reserved, identifier,
                regexp, string, number, operator, and substitution. This set
                allows us to have reasonable control over the source for
                condensing or other processing without resorting immediately
                to a full parser.
    @param      {String}    src             The JavaScript source to process.
    @param      {String[]}  [ops]           An optional array of the operator
                                            strings which should be considered
                                            valid for the source. If this isn't
                                            supplied, the set of JS operators is
                                            assumed.
    @param      {Boolean}   [tsh=false]     True to support extensions specific
                                            to the TIBET Shell (tsh) which
                                            includes ${var} and `cmd` syntax as
                                            well as limited markup processing.
    @param      {Boolean}   [exp=false]     True to signify that the content is
                                            being tokenized for expansion, which
                                            means certain clues for strings and
                                            regular expressions won't be found.
    @param      {Boolean}   [alias=false]   True to signify content is being
                                            tokenized for aliasing purposes.
                                            This causes substitutions to always
                                            terminate an ongoing string or URI.
    @param      {Boolean}   [args=false]    True to signify content is being
                                            tokenized for 'shell arguments'.
    @returns    {Object[]}  An array of token objects, simple objects which
                            represent one token within the source string.
    */

    var digit,
        hexDigit,
        formatSubSigils,

        identHead,
        identBody,
        keywords,
        operators,

        identifier_type,
        new_token,

        reserved,

        result,
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

        testval,

        preservedParen,
        startsURI,
        uriParenCount,

        startsTemplate,
        startsFormatSub,

        templateBracketCount;

    //  common regular expressions used for character testing
    digit = /[0-9]/;
    hexDigit = /[0-9a-fA-F]/;

    formatSubSigils = /[#%@]/;

    //  NB: we allow '@' as a leading character for an identifer, so that users
    //  can use 'dereferencing sugar', but the system will strip this before it
    //  tries to evaluate it.

    identHead = args === true ? /^[@$_a-zA-Z{]/ : /^[@$_a-zA-Z]/;
    identBody = args === true ? /[{$_a-zA-Z0-9-}]/ : /[$_a-zA-Z0-9]/;

    //  easily tested strings used for identifier/operator testing
    keywords = TP.boot.$keywordString;
    reserved = TP.boot.$futureReservedString;

    //  if operators were supplied, then join them all together into our
    //  detection string.
    if (ops) {
        operators = '__' + ops.join('__') + '__';
    } else {
        //  otherwise, use the precomputed detection string that consists of JS
        //  operators.
        operators = TP.boot.$operatorString;
    }

    //  ---
    //  helper functions
    //  ---

    identifier_type = function(ident) {
        /**
        @method     identifier_type
        @summary    Returns the proper type for an identifier string. This
                    allows the tokenizer to fine-tune identifier recognition
                    to point out keywords, reserved words, etc.
        @param      {String} ident The identifier string to categorize.
        @returns    {String} An identifier type: 'keyword', 'reserved', or
                             'identifier'.
        */

        if (keywords.indexOf('__' + ident + '__') > 0) {
            return 'keyword';
        } else if (reserved.indexOf('__' + ident + '__') > 0) {
            return 'reserved';
        }

        return 'identifier';
    };

    new_token = function(type, value, note) {
        /**
        @method     new_token
        @summary    Simple token constructor which returns a token object
                    identifying the token type, value, and its location in
                    the source text.
        @param      {String} type The token type. Must be one of the standard
                                  token types for the outer $tokenize method.
        @param      {String} value The string value for the token.
        @param      {String} note Optional annotation for the token.
        @returns    {Object} A simple object containing type, value, line, from,
                             and to keys for the token.
        */

        //  assign to outer scope'd variable for use in processing loop
        last = {
            name: type,
            value: value,
            note: note,
            line: lines,
            from: from,
            to: i
        };

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

    i = 0;
    lines = 1;

    uriParenCount = 0;
    templateBracketCount = 0;

    c = src.charAt(i);
    while (c) {
        from = i;

        //  a bit nasty, but seems to work even with &nbsp;
        if (c <= ' ' || c.charCodeAt(0) === 160) {
            //  control characters are largely stripped when found but we do
            //  handle certain forms of whitespace to preserve semantics.

            //  Increment i before new_token to capture 'to:'
            i += 1;

            if (c === ' ' || c.charCodeAt(0) === 160) {
                result.push(new_token('space', c));
                str = '';
            } else if (c === '\t') {
                result.push(new_token('tab', c));
                str = '';
            } else if (c === '\n') {
                token = new_token('newline', '\n');
                result.push(token);
                str = '';
                lines++;
            } else if (c === '\r') {
                //  replace \r so we normalize newlines, but don't create
                //  extra lines when the next character is a newline
                if (src.charAt(i + 1) !== '\n') {
                    token = new_token('newline', '\n');
                    result.push(token);
                    str = '';
                    lines++;
                }
            }

            c = src.charAt(i);
        } else if (identHead.test(c) ||

                /* eslint-disable no-extra-parens */
                (tsh && (c === '~' ||
                        (c === '#' && !/\d/.test(src.charAt(i + 1))) ||
                        (c === '.' && src.charAt(i + 1) === '/') ||
                        (c === '.' && src.charAt(i + 1) === '.' &&
                            src.charAt(i + 2) === '/')
                        ))) {
                /* eslint-enable no-extra-parens */

            //  identifiers start with $, _, or a-zA-Z, then allow 0-9

            //  first check to make sure we aren't holding a leading '(' - if
            //  so, don't blow away str.
            if (str === '(') {
                preservedParen = true;
                str += c;
            } else {
                preservedParen = false;
                str = c;
            }
            i += 1;

            /* eslint-disable no-extra-parens */
            startsTemplate = (src.charAt(i - 2) !== '\\' &&
                                str === '{' &&
                                src.charAt(i) === '{');
            startsFormatSub = (formatSubSigils.test(str) &&
                                src.charAt(i) === '{');
            /* eslint-enable no-extra-parens */

            if (tsh && startsTemplate) {

                err = false;

                //  'str' now contains both brackets
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
                        TP.boot.$stderr('Unbalanced brackets in template: ' +
                            TP.boot.$stringify(new_token('template', str),
                                ', '));

                        break;
                    }

                    if (templateBracketCount === 0) {

                        if (!err) {
                            //  scheme-specific part of the URI
                            result.push(new_token('template', str));
                        }

                        break;
                    }
                }
            } else if (tsh && startsFormatSub) {

                err = false;

                //  'str' now contains both sigil character and paren
                str += src.charAt(i);
                i += 1;

                templateBracketCount = 1;

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
                        TP.boot.$stderr('Unbalanced brackets in format' +
                                        ' substitution: ' +
                            TP.boot.$stringify(new_token('formatsub', str),
                                ', '));

                        break;
                    }

                    if (templateBracketCount === 0) {

                        if (!err) {
                            //  scheme-specific part of the URI
                            result.push(new_token('formatsub', str));
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

                /* eslint-disable no-extra-parens */
                testval = str + c;

                startsURI =
                    /#[^\d]/.test(testval) ||   //  '#' followed by non-digit
                    /\(?~/.test(testval) ||     //  maybe '(' followed by '~'
                    /\(?\.\//.test(testval) ||  //  maybe '(' followed by './'
                    /\(?\.\.\//.test(testval);  //  maybe '(' followed by '../'

                if (identBody.test(c) === true ||
                    (tsh && startsURI)) {

                    if (testval.charAt(0) === '(') {
                        if (startsURI) {
                            uriParenCount++;
                        }
                        if (result.at(result.getSize() - 1).value === '(') {
                            result.pop();
                        }
                    }

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
                    /* eslint-enable no-extra-parens */

                    //  in the TSH we have special cases for URI syntax so
                    //  you can type http://www.tibet.com and not lose the
                    //  tail as a comment. the one caveat is that we rely on a
                    //  strict list of schemes and only support those here.

                    //  TODO: The 'URI shouldn't end with a '}' is a hack here.
                    //  Need a more proper way to determine a URI's end.
                    if (tsh &&
                        c !== '}' &&
                        (c === ':' && TP.$is_scheme(str) || startsURI)) {

                        //  if we get into a paren, note it... that means
                        //  this is an XPointer of some sort, which means it
                        //  can have spaces etc.
                        if (c === '(') {
                            uriParenCount++;
                        }

                        //  we could also be processing a closing paren if our
                        //  overall expression started with an opening paren. We
                        //  need to decrement the count here to keep things
                        //  balanced.
                        if (c === ')') {
                            uriParenCount--;
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
                                        break; //   break out of this for loop
                                    }

                                    if (c === '\\' &&
                                        src.charAt(i + 1) === quote) {
                                        //  don't add the backslash as we don't
                                        //  want it encoded
                                        void 0;
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
                                    c === '}' || c === ',' ||
                                    c <= ' ' || c.charCodeAt(0) === 160) {
                                    break;
                                }

                                //  TSH pipe/redirection symbol is a
                                //  terminator
                                if (c === '.' &&
                                    '|&<>({['.indexOf(src.charAt(i + 1)) >= 0) {
                                    break;
                                }

                                //  If aliasing then substitutions are a
                                //  terminator.
                                if (alias && c === '$' &&
                                    '{'.indexOf(src.charAt(i + 1)) >= 0) {
                                    break;
                                }
                            }

                            //  Increment i before new_token to capture 'to:'
                            i += 1;

                            if (c === '' && uriParenCount !== 0) {
                                err = true;
                                TP.boot.$stderr('Unbalanced parens in URI: ' +
                                    TP.boot.$stringify(new_token('uri', str),
                                        ', '));
                                break;
                            }

                            str += c;
                        }

                        if (!err) {
                            //  scheme-specific part of the URI
                            if (preservedParen) {
                                from -= 1;
                                i -= 1;
                            }
                            result.push(new_token('uri', str));
                        }
                    } else {
                        //  One special case to check here is {}, which will
                        //  otherwise result in a single token value.
                        if (/^[{}]+$/.test(str)) {
                            /* eslint-disable no-loop-func */
                            str.split('').forEach(
                                    function(char) {
                                        i = from + 1;
                                        result.push(
                                                new_token('operator', char));
                                        from += 1;
                                    });
                            /* eslint-enable no-loop-func */
                        } else if (/^\{[$_a-zA-Z]+/.test(str)) {
                            i = from + 1;
                            result.push(new_token('operator', '{'));
                            from += 1;
                            i += str.length - 1;
                            result.push(new_token(
                                        identifier_type(str.slice(1)),
                                        str.slice(1), 825));
                        } else {

                            if (str.charAt(0) === '(') {

                                from = i - str.length;
                                i = from + 1;
                                result.push(new_token('operator', '(', 825));

                                //  Slice off '(' so we don't use again.
                                str = str.slice(1);
                                if (str) {
                                    from += 1;
                                    i += str.length;
                                    result.push(new_token(
                                        identifier_type(str), str, 840));
                                    str = '';
                                }

                            } else {
                                //  for identifiers we do a lookup to refine the
                                //  type here
                                result.push(new_token(identifier_type(str),
                                    str, 848));
                            }
                        }
                    }
                } else {

                    //  Due to some template-related testing earlier one nasty
                    //  possibility here is something like "(ident" so we need
                    //  to test for that first
                    if (str.charAt(0) === '(' &&
                            identHead.test(str.slice(1))) {

                        from = i - str.length;
                        i = from + 1;

                        if (!preservedParen) {
                            result.push(new_token('operator', '(', 858));
                        }

                        //  Slice off '(' so we don't use again.
                        str = str.slice(1);

                        from += 1;
                        i += str.length;
                        result.push(new_token(
                            identifier_type(str), str, 873));
                        str = '';

                    } else if (identHead.test(str)) {

                        result.push(new_token(identifier_type(str), str,
                            879));
                        i += str.length - 1;
                    } else {
                        //  first char after the ~ or # is a number or
                        //  similarly invalid identifier character so the ~
                        //  or # is treated as an operator.
                        result.push(new_token('operator', str));
                        i += str.length - 1;
                    }
                }
            }

            //  NOTE that the character which triggered failure of our inner
            //  for-loop will be in c, so we don't need to adjust index/char

        /* eslint-disable no-extra-parens */
        } else if (digit.test(c) ||
                (c === '-' && digit.test(src.charAt(i + 1))) ||
                (c === '+' && digit.test(src.charAt(i + 1)))) {
        /* eslint-enable no-extra-parens */
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
                for (;;) {
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
                    if (digit.test(c) !== true && c !== '-' && c !== '+') {
                        err = true;
                        TP.boot.$stderr('Bad exponent: ' +
                            TP.boot.$stringify(new_token('number', str + c),
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
                                TP.boot.$stringify(new_token('number', str),
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
                                TP.boot.$stringify(new_token('number', str),
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
                            TP.boot.$stringify(new_token('number', str),
                                ', '));
                    }
                }
            }

            if (!err) {
                //  convert string into a number and verify that it's real
                num = Number(str);

                if (isFinite(num)) {
                    //  push new numeric token
                    result.push(new_token('number', str));
                } else {
                    TP.boot.$stderr('Bad number: ' +
                        TP.boot.$stringify(new_token('number', str), ', '));
                }
            }

        /* eslint-disable no-extra-parens */
        } else if (c === '\'' || c === '"' || c === '`') {
        /* eslint-enable no-extra-parens */
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
                            TP.boot.$stringify(new_token('string', str), ', '));

                        //  consider this a warning, go ahead and push the
                        //  token data we do have out so it's at least in
                        //  the final stream
                        result.push(new_token('string', str));
                        break;
                    }

                    i = i - str.length;

                    //  in TSH processing not all content is JS, much more
                    //  is actually markup where a ' or " should simply be
                    //  treated as another character. Of course, that means
                    //  that we have to "back up" and reprocess the str
                    //  value for other characters of interest rather than
                    //  continuing to treat it like "offlimit" content.
                    result.push(new_token('quote', quote));

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
                            if (tsh) {
                                result.push(new_token('substitution', str));
                            } else {
                                result.push(new_token('es6template', str));
                            }
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
                                TP.boot.$stringify(new_token('comment', str),
                                    ', '));
                            break;
                        } else if (c === '*') {
                            if (src.charAt(i + 1) === '/') {
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
                        i += 2;
                        result.push(new_token('operator', '/>'));
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
                        last.value !== '=' &&
                        last.value !== '(' &&
                        last.value !== ',') {
                        i += 1;
                        result.push(new_token('operator', '/'));
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
                            str = src.charAt(i + 1) === '=' ? '/=' : '/';
                            i += str.length;
                            result.push(new_token('operator', str));
                            c = src.charAt(i);
                            break;
                        }

                        //  forward brackets inside character classes don't
                        //  have to be escaped...so we don't want to count
                        //  them twice
                        if (c === '[' && block < 1) {
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
                        if (c === ']' && block > 0) {
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
                        if (c === '/' && block === 0) {
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

                                i = j;
                                result.push(new_token('regexp', str));
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
        } else if (tsh && c === '<' && src.charAt(i + 1) === '/') {
            //  XML tag closing operator
            i += 2;
            result.push(new_token('operator', '</'));
            c = src.charAt(i);
        } else {
            //  try to construct the longest possible operator or string from
            //  the characters remaining in the string. note that we don't
            //  allow for operators longer than 4 characters in length

            str = src.slice(i, i + 4);
            for (j = 3; j > 0; j--) {
                if (operators.indexOf('__' + str + '__') > 0) {
                    break;
                }
                str = str.slice(0, j);
            }

            i += str.length;

            //  if the str is not an operator, it's a string
            if (operators.indexOf('__' + str + '__') === TP.NOT_FOUND) {
                result.push(new_token('string', str));
            } else {
                result.push(new_token('operator', str, '1383'));
            }

            c = src.charAt(i);
        }
    }

    if (TP.isEmpty(result[result.length - 1].value)) {
        result = result.slice(0, -1);
    }

    if (tsh && TP.sys.cfg('log.tsh_tokenize')) {
        TP.boot.$stdout(TP.json(result));
    }

    return result;
});

//  ------------------------------------------------------------------------
//  Token-based Utilities
//  ------------------------------------------------------------------------

TP.definePrimitive('$tokenizedConstruct',
function(src, ops, tsh, exp, alias, args) {

    var tokens,
        token,
        count,
        index,
        slice,
        close,
        shell,
        obj,
        result,
        i,
        len,
        parts;

    if (TP.isEmpty(src)) {
        return this.raise('InvalidParameter',
            'Must provide token array or string.');
    }

    if (TP.isString(src)) {
        tokens = TP.$tokenize(src,
            TP.ifInvalid(ops, TP.tsh.script.$tshAndJSOperators),
            TP.ifInvalid(tsh, true),
            TP.ifInvalid(exp, false),
            TP.ifInvalid(alias, false),
            TP.ifInvalid(args, true));
    } else if (TP.isArray(src)) {
        tokens = src;
    } else {
        return this.raise('InvalidParameter',
            'Must provide token array or string.');
    }

    shell = TP.bySystemId('TSH');
    parts = TP.ac();
    token = tokens.shift();
    switch (token.value) {
        case '[':
            token = tokens.shift();
            while (token && token.value !== ']') {
                //  Handle nested array or object references.
                if (token.value === '[' || token.value === '{') {
                    //  slice out tokens that comprise nested structure and
                    //  invoke recursively to produce the result for the slot.
                    close = token.value === '[' ? ']' : '}';
                    count = 1;
                    index = 0;
                    while (count !== 0 && tokens[index]) {
                        if (tokens[index].value === token.value) {
                            count++;
                        } else if (tokens[index].value === close) {
                            count--;
                        }
                        index++;
                    }

                    //  If no value at tokens[index] we ran off the end looking
                    //  for a closing token.
                    if (!tokens[index]) {
                        //  TODO:   warn/error?
                        void 0;
                    }

                    //  Capture nested struct slice and build.
                    slice = tokens.slice(0, index);
                    slice.unshift(token);
                    parts.push(TP.$tokenizedConstruct(slice));


                    //  Remove nested content from list and continue.
                    tokens = tokens.slice(index + 1);
                    token = tokens.shift();
                }

                //  Since we're slicing and getting a new token we need to
                //  recheck exit before trying to process remaining chunks.
                if (token && token.value === ']') {
                    break;
                }

                //  Process remaining chunks.
                if (token && !TP.$is_whitespace(token.name) &&
                        token.name !== 'operator') {
                    //  Try to get the best version of each token.
                    obj = shell.resolveObjectReference(token.value);
                    parts.push(TP.ifUndefined(obj, token.value));
                }
                token = tokens.shift();
            }

            if (TP.isEmpty(parts)) {
                result = [];
            } else {
                result = parts;
            }

            break;
        case '{':
            token = tokens.shift();
            while (token && token.value !== '}') {
                //  Handle nested array or object references.
                if (token.value === '[' || token.value === '{') {
                    //  slice out tokens that comprise nested structure and
                    //  invoke recursively to produce the result for the slot.
                    close = token.value === '[' ? ']' : '}';
                    count = 1;
                    index = 0;
                    while (count !== 0 && tokens[index]) {
                        if (tokens[index].value === token.value) {
                            count++;
                        } else if (tokens[index].value === close) {
                            count--;
                        }
                        index++;
                    }

                    //  If no value at tokens[index] we ran off the end looking
                    //  for a closing token.
                    if (!tokens[index]) {
                        //  TODO:   warn/error?
                        void 0;
                    }

                    //  Capture nested struct slice and build.
                    slice = tokens.slice(0, index);
                    slice.unshift(token);
                    parts.push(TP.$tokenizedConstruct(slice));

                    //  Remove nested content from list and continue.
                    tokens = tokens.slice(index + 1);
                    token = tokens.shift();
                }

                //  Since we're slicing and getting a new token we need to
                //  recheck exit before trying to process remaining chunks.
                if (token && token.value === '}') {
                    break;
                }

                if (token && !TP.$is_whitespace(token.name) &&
                        token.name !== 'operator') {
                    obj = shell.resolveObjectReference(token.value);
                    parts.push(TP.ifUndefined(obj, token.value));
                }
                token = tokens.shift();
            }

            //  Parts should now contain an array containing key, value, key,
            //  value, etc. So process that into an object form.
            result = {};
            len = parts.length;
            for (i = 0; i < len; i += 2) {
                result[parts[i].unquoted()] = parts[i + 1];
            }
            break;
        default:
            //  Only works on primitive array and object structures.
            return;
    }

    return result;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$tokenizedJoin',
function(tokens, separators) {

    /**
     * @method $tokenizedJoin
     * @summary Builds up one or more strings by combining sequences of tokens
     *     separated by one or more separator tokens. This routine is used by
     *     $tokenizedSplit for example, to rejoin substrings separated by
     *     whitespace tokens. The result is that identifiers etc. are rebuilt.
     * @param {String[]} tokens A list of tokens from the $tokenize routine.
     * @param {String[]} separators A list of token types which should be
     *     considered separators. Sequences of non-separators are joined.
     * @returns {String[]} An array of strings reconstructed from tokens.
     */

    var seps,
        arr,
        str;

    if (TP.isEmpty(tokens)) {
        return this.raise('InvalidParameter', 'Must have token list to join.');
    }

    if (TP.isValid(separators) && !TP.isArray(separators)) {
        return this.raise('InvalidParameter', 'Separators must be an array.');
    }
    seps = TP.notValid(separators) ? ['space', 'tab', 'newline'] : separators;

    arr = TP.ac();
    str = '';
    tokens.forEach(function(token) {
        if (seps.indexOf(token.name) !== TP.NOT_FOUND) {
            //  Separator, close off string, push, and start a new one.
            arr.push(str);
            str = '';
        } else {
            str += token.value;
        }
    });

    //  Push the last token string, if it's not a "leftover" that's empty.
    if (TP.notEmpty(str)) {
        arr.push(str);
    }

    return arr;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('$tokenizedSplit',
function(src, separators, ops, tsh, exp, alias, args) {

    /**
     * @method $tokenizedSplit
     * @summary Tokenizes and then rejoins a source string. The initial
     *     tokenization is done by passing all arguments other than the
     *     separators value to the $tokenize routine. The resulting token list
     *     and separators are then passed to $tokenizedJoin. This routine
     *     defaults the tsh and args values to true (meaning we're defaulting to
     *     processing for both JS and TSH tokens and arguments).
    @param      {String}    src             The JavaScript source to process.
    @param      {String[]}  [separators]    A list of token types such as
                                            'space', 'tab', 'newline', to be
                                            used to split.
    @param      {String[]}  [ops]           An optional array of the operator
                                            strings which should be considered
                                            valid for the source. If this isn't
                                            supplied, the set of JS operators is
                                            assumed.
    @param      {Boolean}   [tsh=false]     True to support extensions specific
                                            to the TIBET Shell (tsh) which
                                            includes ${var} and `cmd` syntax as
                                            well as limited markup processing.
    @param      {Boolean}   [exp=false]     True to signify that the content is
                                            being tokenized for expansion, which
                                            means certain clues for strings and
                                            regular expressions won't be found.
    @param      {Boolean}   [alias=false]   True to signify content is being
                                            tokenized for aliasing purposes.
                                            This causes substitutions to always
                                            terminate an ongoing string or URI.
    @param      {Boolean}   [args=false]    True to signify content is being
                                            tokenized for 'shell arguments'.
     */

    var seps,
        tshell,
        tsargs,
        tokens;

    if (TP.isValid(separators) && !TP.isArray(separators)) {
        return this.raise('InvalidParameter', 'Separators must be an array.');
    }
    seps = TP.notValid(separators) ? ['space', 'tab', 'newline'] : separators;

    tshell = TP.notValid(tsh) ? true : tsh;
    tsargs = TP.notValid(args) ? true : args;

    tokens = TP.$tokenize(src, ops, tshell, exp, alias, tsargs);

    return TP.$tokenizedJoin(tokens, seps);
});

//  ------------------------------------------------------------------------
//  Packing/Condensing
//  ------------------------------------------------------------------------

TP.definePrimitive('$condenseJS',
function(src, newlines, spaces, operators, tokens, nojoin, tsh) {

    /**
    @method     $condenseJS
    @summary    Condenses a string of JavaScript source code using a fairly
                simple tokenizing process to segment the original source and
                then remove comments, extraneous whitespace, and optionally
                remove newlines.
    @param      {String}    src                 The JavaScript source to process.
    @param      {Boolean}   [newlines=false]    True to remove newlines. Default
                                                is false to limit the potential
                                                for introducing bugs, but blank
                                                lines are still removed in all
                                                cases.
    @param      {Boolean}   [spaces=true]       True to remove spaces. Default
                                                is true to create minimal output
                                                size.
    @param      {String[]}  [operators]         An optional array of the
                                                operator strings which should be
                                                considered valid for the source.
                                                If this isn't supplied, the set
                                                of JS operators is assumed.
    @param      {Boolean}   [tokens=false]      True forces tokens back into the
                                                output array rather than values.
    @param      {Boolean}   [nojoin=false]      True turns off join processing
                                                so the result is the processed
                                                token array rather than a
                                                string.
    @param      {Boolean}   [tsh=false]         True if TIBET Shell (TSH)
                                                semantics should be observed.
    @returns    {String|String[]} The condensed source code or token array.
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
        switch (token.name) {
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
                /* eslint-disable eqeqeq */
                if (newlines == null || newlines === false) {
                /* eslint-enable eqeqeq */
                    if (!last || last.name === 'newline') {
                        continue;
                    }

                    result.push(tokens ? token : token.value);
                    last = token;
                } else {
                    //  although not common in TIBET code (due to our
                    //  coding standard) it's common for people to overlook
                    //  that assigning functions to variables requires a
                    //  trailing semi-colon to ensure proper operation.
                    //  without a full parse we simply avoid removing
                    //  newlines after } in most cases.
                    if (last &&
                        last.name === 'operator' && last.value === '}') {

                        /* eslint-disable no-extra-parens */
                        if ((next = arr[i + 1])) {
                        /* eslint-enable no-extra-parens */
                            //  common syntax where we can be sure that
                            //  removing the newline won't create a bug
                            if (next.value === 'else' ||
                                next.value === 'catch' ||
                                next.value === 'finally' ||
                                next.value === '}' ||
                                next.value === ')') {
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
                /* eslint-disable eqeqeq */
                if (spaces != null && spaces === false) {
                /* eslint-enable eqeqeq */
                    result.push(tokens ? token : token.value);
                    last = token;
                    break;
                }

                //  trim leading or repeating sequences of whitespace since
                //  that can't alter semantics while we're preserving at
                //  least one space or tab between other tokens

                /* eslint-disable no-extra-parens */
                if (!last || (last && TP.$is_whitespace(last.name))) {
                /* eslint-enable no-extra-parens */
                    break;
                }

                //  whitespace around operators can also be trimmed...except
                //  when doing so might cause the following token's prefix
                //  to confuse things...as in foo - -bar which transforms
                //  into foo--bar aka foo-- bar (oops).
                next = arr[i + 1];

                /* eslint-disable no-extra-parens */
                if ((last && last.name === 'operator') ||
                    (next && next.name === 'operator')) {
                    //  tsh terminators should preserve space
                    if ((last && TP.boot.$tshOpRegex.test(last.value)) ||
                        (next && TP.boot.$tshOpRegex.test(next.value))) {
                        result.push(tokens ? token : token.value);
                        last = token;
                    }
                /* eslint-enable no-extra-parens */

                    //  other bugs are ++ and -- combinations
                    if (last && next &&
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
    return result.join('') + (last && last.name !== 'newline' ? '\n' : '');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
