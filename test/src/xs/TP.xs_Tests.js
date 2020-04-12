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
//  TP.xs.anyType
//  ========================================================================

TP.xs.anyType.Inst.describe('xs.anyType: validation',
function() {

    this.it('test01', function(test, options) {

        test.assert.isA(TP.bc('true'), TP.xs.anyType);
    });

    this.it('test02', function(test, options) {

        test.assert.isA(TP.bc('false'), TP.xs.anyType);
    });

    this.it('test03', function(test, options) {

        test.assert.isA(TP.dc(), TP.xs.anyType);
    });

    this.it('test04', function(test, options) {

        /* eslint-disable no-extra-parens,no-empty-function */
        test.assert.isA((function() {}), TP.xs.anyType);
        /* eslint-enable no-extra-parens,no-empty-function */
    });

    this.it('test05', function(test, options) {

        /* eslint-disable no-extra-parens */
        test.assert.isA((123), TP.xs.anyType);
        /* eslint-enable no-extra-parens */
    });

    this.it('test06', function(test, options) {

        /* eslint-disable no-extra-parens */
        test.assert.isA(({}), TP.xs.anyType);
        /* eslint-enable no-extra-parens */
    });

    this.it('test07', function(test, options) {

        /* eslint-disable no-extra-parens */
        test.assert.isA((/foo/), TP.xs.anyType);
        /* eslint-enable no-extra-parens */
    });

    this.it('test08', function(test, options) {

        test.assert.isA('foo', TP.xs.anyType);
    });

    this.it('test09', function(test, options) {

        test.assert.isA('', TP.xs.anyType);
    });

    this.it('test10', function(test, options) {

        test.assert.isFalse(TP.xs.anyType.validate());
    });

    this.it('test11', function(test, options) {

        test.assert.isA('null', TP.xs.anyType);
    });

    this.it('test12', function(test, options) {

        test.assert.isA('undefined', TP.xs.anyType);
    });

    this.it('test13', function(test, options) {

        var foo;

        //  this will pass the undefined ref
        test.assert.isFalse(TP.xs.anyType.validate(foo));
    });

    this.it('test14', function(test, options) {

        test.assert.isTrue(
                TP.xs.anyType.validate(document.createTextNode('foo')),
                'Expected text node validation to be true');
    });

    this.it('test15', function(test, options) {

        test.assert.isA(NaN, TP.xs.anyType);
    });
});

//  ========================================================================
//  TP.xs.anySimpleType
//  ========================================================================

TP.xs.anySimpleType.Inst.describe('xs.anySimpleType: validation',
function() {

    this.it('test01', function(test, options) {

        test.assert.isA(TP.bc('true'), TP.xs.anySimpleType);
    });

    this.it('test02', function(test, options) {

        test.assert.isA(TP.bc('false'), TP.xs.anySimpleType);
    });

    this.it('test03', function(test, options) {

        test.assert.isA(TP.dc(), TP.xs.anySimpleType);
    });

    this.it('test04', function(test, options) {

        /* eslint-disable no-extra-parens,no-empty-function */
        test.assert.isA((function() {}), TP.xs.anySimpleType);
        /* eslint-enable no-extra-parens,no-empty-function */
    });

    this.it('test05', function(test, options) {

        /* eslint-disable no-extra-parens */
        test.assert.isA((123), TP.xs.anySimpleType);
        /* eslint-enable no-extra-parens */
    });

    this.it('test06', function(test, options) {

        /* eslint-disable no-extra-parens */
        test.assert.isA(({}), TP.xs.anySimpleType);
        /* eslint-enable no-extra-parens */
    });

    this.it('test07', function(test, options) {

        /* eslint-disable no-extra-parens */
        test.assert.isA((/foo/), TP.xs.anySimpleType);
        /* eslint-enable no-extra-parens */
    });

    this.it('test08', function(test, options) {

        test.assert.isA('foo', TP.xs.anySimpleType);
    });

    this.it('test09', function(test, options) {

        test.assert.isA('', TP.xs.anySimpleType);
    });

    this.it('test10', function(test, options) {

        test.assert.isFalse(TP.xs.anySimpleType.validate());
    });

    this.it('test11', function(test, options) {

        test.assert.isA('null', TP.xs.anySimpleType);
    });

    this.it('test12', function(test, options) {

        test.assert.isA('undefined', TP.xs.anySimpleType);
    });

    this.it('test13', function(test, options) {

        var foo;

        //  this will pass the undefined ref
        test.assert.isFalse(TP.xs.anySimpleType.validate(foo));
    });

    this.it('test14', function(test, options) {

        test.assert.isTrue(
                TP.xs.anySimpleType.validate(document.createTextNode('foo')),
                'Expected text node validation to be true');
    });

    this.it('test15', function(test, options) {

        test.assert.isA(NaN, TP.xs.anySimpleType);
    });
});

//  ========================================================================
//  TP.xs.string
//  ========================================================================

TP.xs.string.Inst.describe('xs.string: validation',
function() {

    this.it('test01', function(test, options) {

        test.refute.isA(TP.bc('true'), TP.xs.string);
    });

    this.it('test02', function(test, options) {

        test.refute.isA(TP.bc('false'), TP.xs.string);
    });

    this.it('test03', function(test, options) {

        test.refute.isA(TP.dc(), TP.xs.string);
    });

    this.it('test04', function(test, options) {

        /* eslint-disable no-extra-parens,no-empty-function */
        test.refute.isA((function() {}), TP.xs.string);
        /* eslint-enable no-extra-parens,no-empty-function */
    });

    this.it('test05', function(test, options) {

        /* eslint-disable no-extra-parens */
        test.refute.isA((123), TP.xs.string);
        /* eslint-enable no-extra-parens */
    });

    this.it('test06', function(test, options) {

        /* eslint-disable no-extra-parens */
        test.refute.isA(({}), TP.xs.string);
        /* eslint-enable no-extra-parens */
    });

    this.it('test07', function(test, options) {

        /* eslint-disable no-extra-parens */
        test.refute.isA((/foo/), TP.xs.string);
        /* eslint-enable no-extra-parens */
    });

    this.it('test08', function(test, options) {

        test.assert.isA('foo', TP.xs.string);
    });

    this.it('test09', function(test, options) {

        test.assert.isA('', TP.xs.string);
    });

    this.it('test10', function(test, options) {

        test.assert.isFalse(TP.xs.string.validate());
    });

    this.it('test11', function(test, options) {

        test.assert.isA('null', TP.xs.string);
    });

    this.it('test12', function(test, options) {

        test.assert.isA('undefined', TP.xs.string);
    });

    this.it('test13', function(test, options) {

        var foo;

        //  this will pass the undefined ref
        test.assert.isFalse(TP.xs.string.validate(foo));
    });

    this.it('test14', function(test, options) {

        //  text nodes aren't TP.xs.string's
        test.assert.isFalse(
                TP.xs.string.validate(document.createTextNode('foo')),
                'Expected text node validation to be false');
    });

    this.it('test15', function(test, options) {

        test.refute.isA(NaN, TP.xs.string);
    });
});

//  ========================================================================
//  TP.xs.normalizedString
//  ========================================================================

TP.xs.normalizedString.Inst.describe('xs.normalizedString: validation',
function() {

    this.it('test01', function(test, options) {

        //  normalized means no tabs, crs, or lfs
        test.assert.isA('abc.def;ghi "and then some"', TP.xs.normalizedString);
    });

    this.it('test02', function(test, options) {

        //  no tabs
        test.refute.isA('abc\u0009', TP.xs.normalizedString);
    });

    this.it('test03', function(test, options) {

        //  no lfs
        test.refute.isA('abc\u000A', TP.xs.normalizedString);
    });

    this.it('test04', function(test, options) {

        //  no crs
        test.refute.isA('abc\u000D', TP.xs.normalizedString);
    });

    this.it('test05', function(test, options) {

        //  multiple spaces are allowed
        test.assert.isA('abc\u0020\u0020', TP.xs.normalizedString);
    });

    this.it('test06', function(test, options) {

        //  leading and trailing spaces are allowed
        test.assert.isA('\u0020abc\u0020', TP.xs.normalizedString);
    });

    this.it('test07', function(test, options) {

        test.assert.isA('a b c', TP.xs.normalizedString);
    });
});

//  ========================================================================
//  TP.xs.token
//  ========================================================================

TP.xs.token.Inst.describe('xs.token: validation',
function() {

    this.it('test01', function(test, options) {

        //  tokenized, like normalized means no tabs, crs, or lfs but with no
        //  multiple-space sequences...most everything else is legal
        test.assert.isA('abc.def;ghi "and_then' + '=-some"', TP.xs.token);
    });

    this.it('test02', function(test, options) {

        //  must be normalized
        test.refute.isA('abc\u0009', TP.xs.token);
    });

    this.it('test03', function(test, options) {

        //  must be normalized
        test.refute.isA('abc\u000A', TP.xs.token);
    });

    this.it('test04', function(test, options) {

        //  must be normalized
        test.refute.isA('abc\u000D', TP.xs.token);
    });

    this.it('test05', function(test, options) {

        //  multiple spaces are NOT allowed in this type
        test.refute.isA('abc\u0020\u0020', TP.xs.token);
    });

    this.it('test06', function(test, options) {

        //  leading and trailing spaces are NOT allowed in this type
        test.refute.isA('\u0020abc\u0020', TP.xs.token);
    });

    this.it('test07', function(test, options) {

        //  single spaces are allowed
        test.assert.isA('a b c', TP.xs.token);
    });
});

//  ========================================================================
//  TP.xs.language
//  ========================================================================

TP.xs.language.Inst.describe('xs.language: validation',
function() {

    this.it('test01', function(test, options) {

        test.assert.isA('a', TP.xs.language);
    });

    this.it('test02', function(test, options) {

        //  spaces and other whitespace not allowed
        test.refute.isA('abc\u0009', TP.xs.language);
    });

    this.it('test03', function(test, options) {

        //  spaces and other whitespace not allowed
        test.refute.isA('abc\u000A', TP.xs.language);
    });

    this.it('test04', function(test, options) {

        //  spaces and other whitespace not allowed
        test.refute.isA('abc\u000D', TP.xs.language);
    });

    this.it('test05', function(test, options) {

        //  multiple spaces not allowed
        test.refute.isA('abc\u0020\u0020', TP.xs.language);
    });

    this.it('test06', function(test, options) {

        //  single spaces are also not allowed
        test.refute.isA('a b c', TP.xs.language);
    });

    this.it('test07', function(test, options) {

        //  hyphen is allowed after at least one leading char
        test.assert.isA('a-b', TP.xs.language);
    });

    this.it('test08', function(test, options) {

        //  digits can occur in the second half
        test.assert.isA('ac-0', TP.xs.language);
    });

    this.it('test09', function(test, options) {

        //  a typical language code value
        test.assert.isA('en', TP.xs.language);
    });

    this.it('test10', function(test, options) {

        //  a typical language code value
        test.assert.isA('en-US', TP.xs.language);
    });

    this.it('test11', function(test, options) {

        test.assert.isA('french', TP.xs.language);
    });

    this.it('test12', function(test, options) {

        test.assert.isA('aa-b9', TP.xs.language);
    });

    this.it('test13', function(test, options) {

        //  can't have a leading Digit
        test.refute.isA('0abc-lang', TP.xs.language);
    });

    this.it('test14', function(test, options) {

        test.assert.isA('my-language', TP.xs.language);
    });
});

//  ========================================================================
//  TP.xs.NMTOKEN
//  ========================================================================

TP.xs.NMTOKEN.Inst.describe('xs.NMTOKEN: validation',
function() {

    this.it('test01', function(test, options) {

        //  a token list can be a single value
        test.assert.isA('abc', TP.xs.NMTOKEN);
    });

    this.it('test02', function(test, options) {

        test.assert.isA('.', TP.xs.NMTOKEN);
    });

    this.it('test03', function(test, options) {

        test.assert.isA(':', TP.xs.NMTOKEN);
    });

    this.it('test04', function(test, options) {

        test.assert.isA('-', TP.xs.NMTOKEN);
    });

    this.it('test05', function(test, options) {

        test.assert.isA('_', TP.xs.NMTOKEN);
    });

    this.it('test06', function(test, options) {

        test.refute.isA('"ab"', TP.xs.NMTOKEN);
    });

    this.it('test07', function(test, options) {

        test.refute.isA('\'ab\'', TP.xs.NMTOKEN);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('a,b', TP.xs.NMTOKEN);
    });

    this.it('test09', function(test, options) {

        test.refute.isA('', TP.xs.NMTOKEN);
    });

    this.it('test10', function(test, options) {

        test.assert.isA('a,b"c'.as(TP.xs.NMTOKEN), TP.xs.NMTOKEN);
    });
});

//  ========================================================================
//  TP.xs.NMTOKENS
//  ========================================================================

TP.xs.NMTOKENS.Inst.describe('xs.NMTOKENS: validation',
function() {

    this.it('test01', function(test, options) {

        //  a token list can be a single value
        test.assert.isA('abc', TP.xs.NMTOKENS);
    });

    this.it('test02', function(test, options) {

        test.assert.isA('.', TP.xs.NMTOKENS);
    });

    this.it('test03', function(test, options) {

        test.assert.isA(':', TP.xs.NMTOKENS);
    });

    this.it('test04', function(test, options) {

        test.assert.isA('-', TP.xs.NMTOKENS);
    });

    this.it('test05', function(test, options) {

        test.assert.isA('_', TP.xs.NMTOKENS);
    });

    this.it('test06', function(test, options) {

        test.refute.isA('"ab"', TP.xs.NMTOKENS);
    });

    this.it('test07', function(test, options) {

        test.refute.isA('\'ab\'', TP.xs.NMTOKENS);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('a,b', TP.xs.NMTOKENS);
    });

    this.it('test09', function(test, options) {

        test.refute.isA('', TP.xs.NMTOKENS);
    });

    this.it('test10', function(test, options) {

        test.assert.isA('a,b"c'.as(TP.xs.NMTOKENS), TP.xs.NMTOKENS);
    });

    this.it('test11', function(test, options) {

        //  a token list can be a single value
        test.assert.isA('abc def', TP.xs.NMTOKENS);
    });

    this.it('test12', function(test, options) {

        test.assert.isA('. .', TP.xs.NMTOKENS);
    });

    this.it('test13', function(test, options) {

        test.assert.isA(': :', TP.xs.NMTOKENS);
    });

    this.it('test14', function(test, options) {

        test.assert.isA('- -', TP.xs.NMTOKENS);
    });

    this.it('test15', function(test, options) {

        test.assert.isA('_ _', TP.xs.NMTOKENS);
    });

    this.it('test16', function(test, options) {

        test.refute.isA('"ab cd"', TP.xs.NMTOKENS);
    });

    this.it('test17', function(test, options) {

        test.refute.isA('\'ab cd\'', TP.xs.NMTOKENS);
    });

    this.it('test18', function(test, options) {

        test.refute.isA('a,b c,d', TP.xs.NMTOKENS);
    });

    this.it('test19', function(test, options) {

        test.refute.isA('', TP.xs.NMTOKENS);
    });

    this.it('test20', function(test, options) {

        test.assert.isA('a_b:c d.e-f', TP.xs.NMTOKENS);
    });
});

//  ========================================================================
//  xs:Name
//  ========================================================================

TP.xs.Name.Inst.describe('xs.Name: validation',
function() {

    this.it('test01', function(test, options) {

        test.assert.isA('a', TP.xs.Name);
    });

    this.it('test02', function(test, options) {

        test.assert.isA('_', TP.xs.Name);
    });

    this.it('test03', function(test, options) {

        test.assert.isA(':', TP.xs.Name);
    });

    this.it('test04', function(test, options) {

        test.refute.isA('.', TP.xs.Name);
    });

    this.it('test05', function(test, options) {

        test.refute.isA('-', TP.xs.Name);
    });

    this.it('test06', function(test, options) {

        test.refute.isA('', TP.xs.Name);
    });

    this.it('test07', function(test, options) {

        test.assert.isA('_a', TP.xs.Name);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('.a', TP.xs.Name);
    });

    this.it('test09', function(test, options) {

        test.refute.isA('-a', TP.xs.Name);
    });

    this.it('test10', function(test, options) {

        test.assert.isA(':a', TP.xs.Name);
    });

    this.it('test11', function(test, options) {

        test.refute.isA('a"b', TP.xs.Name);
    });

    this.it('test12', function(test, options) {

        test.refute.isA('a\'b', TP.xs.Name);
    });

    this.it('test13', function(test, options) {

        test.refute.isA('0ab', TP.xs.Name);
    });

    this.it('test14', function(test, options) {

        test.assert.isA('a-', TP.xs.Name);
    });

    this.it('test15', function(test, options) {

        test.assert.isA('a:', TP.xs.Name);
    });

    this.it('test16', function(test, options) {

        test.assert.isA('a_', TP.xs.Name);
    });

    this.it('test17', function(test, options) {

        test.assert.isA('a.', TP.xs.Name);
    });

    this.it('test18', function(test, options) {

        test.assert.isA('a0', TP.xs.Name);
    });
});

//  ========================================================================
//  xs:NCName
//  ========================================================================

TP.xs.NCName.Inst.describe('xs.NCName: validation',
function() {

    this.it('test01', function(test, options) {

        test.assert.isA('a', TP.xs.NCName);
    });

    this.it('test02', function(test, options) {

        test.assert.isA('_', TP.xs.NCName);
    });

    this.it('test03', function(test, options) {

        test.refute.isA(':', TP.xs.NCName);
    });

    this.it('test04', function(test, options) {

        test.refute.isA('.', TP.xs.NCName);
    });

    this.it('test05', function(test, options) {

        test.refute.isA('-', TP.xs.NCName);
    });

    this.it('test06', function(test, options) {

        test.refute.isA('', TP.xs.NCName);
    });

    this.it('test07', function(test, options) {

        test.assert.isA('_a', TP.xs.NCName);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('.a', TP.xs.NCName);
    });

    this.it('test09', function(test, options) {

        test.refute.isA('-a', TP.xs.NCName);
    });

    this.it('test10', function(test, options) {

        test.refute.isA(':a', TP.xs.NCName);
    });

    this.it('test11', function(test, options) {

        test.refute.isA('a"b', TP.xs.NCName);
    });

    this.it('test12', function(test, options) {

        test.refute.isA('a\'b', TP.xs.NCName);
    });

    this.it('test13', function(test, options) {

        test.refute.isA('0ab', TP.xs.NCName);
    });

    this.it('test14', function(test, options) {

        test.assert.isA('a-', TP.xs.NCName);
    });

    this.it('test15', function(test, options) {

        test.refute.isA('a:', TP.xs.NCName);
    });

    this.it('test16', function(test, options) {

        test.assert.isA('a_', TP.xs.NCName);
    });

    this.it('test17', function(test, options) {

        test.assert.isA('a.', TP.xs.NCName);
    });

    this.it('test18', function(test, options) {

        test.assert.isA('a0', TP.xs.NCName);
    });
});

//  ========================================================================
//  xs:ID
//  ========================================================================

TP.xs.ID.Inst.describe('xs.ID: validation',
function() {

    this.it('test01', function(test, options) {

        test.assert.isA('a', TP.xs.ID);
    });

    this.it('test02', function(test, options) {

        test.assert.isA('_', TP.xs.ID);
    });

    this.it('test03', function(test, options) {

        test.refute.isA(':', TP.xs.ID);
    });

    this.it('test04', function(test, options) {

        test.refute.isA('.', TP.xs.ID);
    });

    this.it('test05', function(test, options) {

        test.refute.isA('-', TP.xs.ID);
    });

    this.it('test06', function(test, options) {

        test.refute.isA('', TP.xs.ID);
    });

    this.it('test07', function(test, options) {

        test.assert.isA('_a', TP.xs.ID);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('.a', TP.xs.ID);
    });

    this.it('test09', function(test, options) {

        test.refute.isA('-a', TP.xs.ID);
    });

    this.it('test10', function(test, options) {

        test.refute.isA(':a', TP.xs.ID);
    });

    this.it('test11', function(test, options) {

        test.refute.isA('a"b', TP.xs.ID);
    });

    this.it('test12', function(test, options) {

        test.refute.isA('a\'b', TP.xs.ID);
    });

    this.it('test13', function(test, options) {

        test.refute.isA('0ab', TP.xs.ID);
    });

    this.it('test14', function(test, options) {

        test.assert.isA('a-', TP.xs.ID);
    });

    this.it('test15', function(test, options) {

        test.refute.isA('a:', TP.xs.ID);
    });

    this.it('test16', function(test, options) {

        test.assert.isA('a_', TP.xs.ID);
    });

    this.it('test17', function(test, options) {

        test.assert.isA('a.', TP.xs.ID);
    });

    this.it('test18', function(test, options) {

        test.assert.isA('a0', TP.xs.ID);
    });
});

//  ========================================================================
//  xs:IDREF
//  ========================================================================

TP.xs.IDREF.Inst.describe('xs.IDREF: validation',
function() {

    this.it('test01', function(test, options) {
        test.assert.isA('a', TP.xs.IDREF);
    });

    this.it('test02', function(test, options) {
        test.assert.isA('_', TP.xs.IDREF);
    });

    this.it('test03', function(test, options) {
        test.refute.isA(':', TP.xs.IDREF);
    });

    this.it('test04', function(test, options) {
        test.refute.isA('.', TP.xs.IDREF);
    });

    this.it('test05', function(test, options) {
        test.refute.isA('-', TP.xs.IDREF);
    });

    this.it('test06', function(test, options) {
        test.refute.isA('', TP.xs.IDREF);
    });

    this.it('test07', function(test, options) {
        test.assert.isA('_a', TP.xs.IDREF);
    });

    this.it('test08', function(test, options) {
        test.refute.isA('.a', TP.xs.IDREF);
    });

    this.it('test09', function(test, options) {
        test.refute.isA('-a', TP.xs.IDREF);
    });

    this.it('test10', function(test, options) {
        test.refute.isA(':a', TP.xs.IDREF);
    });

    this.it('test11', function(test, options) {
        test.refute.isA('a"b', TP.xs.IDREF);
    });

    this.it('test12', function(test, options) {
        test.refute.isA('a\'b', TP.xs.IDREF);
    });

    this.it('test13', function(test, options) {
        test.refute.isA('0ab', TP.xs.IDREF);
    });

    this.it('test14', function(test, options) {
        test.assert.isA('a-', TP.xs.IDREF);
    });

    this.it('test15', function(test, options) {
        test.refute.isA('a:', TP.xs.IDREF);
    });

    this.it('test16', function(test, options) {
        test.assert.isA('a_', TP.xs.IDREF);
    });

    this.it('test17', function(test, options) {
        test.assert.isA('a.', TP.xs.IDREF);
    });

    this.it('test18', function(test, options) {
        test.assert.isA('a0', TP.xs.IDREF);
    });
});

//  ========================================================================
//  xs:IDREFS
//  ========================================================================

TP.xs.IDREFS.Inst.describe('xs.IDREFS: validation',
function() {

    this.it('test01', function(test, options) {

        test.assert.isA('a', TP.xs.IDREFS);
    });

    this.it('test02', function(test, options) {

        test.assert.isA('_', TP.xs.IDREFS);
    });

    this.it('test03', function(test, options) {

        test.refute.isA(':', TP.xs.IDREFS);
    });

    this.it('test04', function(test, options) {

        test.refute.isA('.', TP.xs.IDREFS);
    });

    this.it('test05', function(test, options) {

        test.refute.isA('-', TP.xs.IDREFS);
    });

    this.it('test06', function(test, options) {

        test.refute.isA('', TP.xs.IDREFS);
    });

    this.it('test07', function(test, options) {

        test.assert.isA('_a', TP.xs.IDREFS);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('.a', TP.xs.IDREFS);
    });

    this.it('test09', function(test, options) {

        test.refute.isA('-a', TP.xs.IDREFS);
    });

    this.it('test10', function(test, options) {

        test.refute.isA(':a', TP.xs.IDREFS);
    });

    this.it('test11', function(test, options) {

        test.refute.isA('a"b', TP.xs.IDREFS);
    });

    this.it('test12', function(test, options) {

        test.refute.isA('a\'b', TP.xs.IDREFS);
    });

    this.it('test13', function(test, options) {

        test.refute.isA('0ab', TP.xs.IDREFS);
    });

    this.it('test14', function(test, options) {

        test.assert.isA('a-', TP.xs.IDREFS);
    });

    this.it('test15', function(test, options) {

        test.refute.isA('a:', TP.xs.IDREFS);
    });

    this.it('test16', function(test, options) {

        test.assert.isA('a_', TP.xs.IDREFS);
    });

    this.it('test17', function(test, options) {

        test.assert.isA('a.', TP.xs.IDREFS);
    });

    this.it('test18', function(test, options) {

        test.assert.isA('a0', TP.xs.IDREFS);
    });

    this.it('test19', function(test, options) {

        test.assert.isA('a a', TP.xs.IDREFS);
    });

    this.it('test20', function(test, options) {

        test.assert.isA('a _', TP.xs.IDREFS);
    });

    this.it('test21', function(test, options) {

        test.refute.isA('a :', TP.xs.IDREFS);
    });

    this.it('test22', function(test, options) {

        test.refute.isA('a .', TP.xs.IDREFS);
    });

    this.it('test23', function(test, options) {

        test.refute.isA('a -', TP.xs.IDREFS);
    });

    this.it('test24', function(test, options) {

        test.refute.isA('', TP.xs.IDREFS);
    });

    this.it('test25', function(test, options) {

        test.assert.isA('a _a', TP.xs.IDREFS);
    });

    this.it('test26', function(test, options) {

        test.refute.isA('a .a', TP.xs.IDREFS);
    });

    this.it('test27', function(test, options) {

        test.refute.isA('a -a', TP.xs.IDREFS);
    });

    this.it('test28', function(test, options) {

        test.refute.isA('a :a', TP.xs.IDREFS);
    });

    this.it('test29', function(test, options) {

        test.refute.isA('a"b ab', TP.xs.IDREFS);
    });

    this.it('test30', function(test, options) {

        test.refute.isA('a\'b ab', TP.xs.IDREFS);
    });

    this.it('test31', function(test, options) {

        test.refute.isA('0ab ab', TP.xs.IDREFS);
    });

    this.it('test32', function(test, options) {

        test.assert.isA('a- a', TP.xs.IDREFS);
    });

    this.it('test33', function(test, options) {

        test.refute.isA('a: a', TP.xs.IDREFS);
    });

    this.it('test34', function(test, options) {

        test.assert.isA('a_ a', TP.xs.IDREFS);
    });

    this.it('test35', function(test, options) {

        test.assert.isA('a. a', TP.xs.IDREFS);
    });

    this.it('test36', function(test, options) {

        test.assert.isA('a0 a', TP.xs.IDREFS);
    });
});

//  ========================================================================
//  xs:ENTITY
//  ========================================================================

TP.xs.ENTITY.Inst.describe('xs.ENTITY: validation',
function() {

    this.it('test01', function(test, options) {

        test.assert.isA('a', TP.xs.ENTITY);
    });

    this.it('test02', function(test, options) {

        test.assert.isA('_', TP.xs.ENTITY);
    });

    this.it('test03', function(test, options) {

        test.refute.isA(':', TP.xs.ENTITY);
    });

    this.it('test04', function(test, options) {

        test.refute.isA('.', TP.xs.ENTITY);
    });

    this.it('test05', function(test, options) {

        test.refute.isA('-', TP.xs.ENTITY);
    });

    this.it('test06', function(test, options) {

        test.refute.isA('', TP.xs.ENTITY);
    });

    this.it('test07', function(test, options) {

        test.assert.isA('_a', TP.xs.ENTITY);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('.a', TP.xs.ENTITY);
    });

    this.it('test09', function(test, options) {

        test.refute.isA('-a', TP.xs.ENTITY);
    });

    this.it('test10', function(test, options) {

        test.refute.isA(':a', TP.xs.ENTITY);
    });

    this.it('test11', function(test, options) {

        test.refute.isA('a"b', TP.xs.ENTITY);
    });

    this.it('test12', function(test, options) {

        test.refute.isA('a\'b', TP.xs.ENTITY);
    });

    this.it('test13', function(test, options) {

        test.refute.isA('0ab', TP.xs.ENTITY);
    });

    this.it('test14', function(test, options) {

        test.assert.isA('a-', TP.xs.ENTITY);
    });

    this.it('test15', function(test, options) {

        test.refute.isA('a:', TP.xs.ENTITY);
    });

    this.it('test16', function(test, options) {

        test.assert.isA('a_', TP.xs.ENTITY);
    });

    this.it('test17', function(test, options) {

        test.assert.isA('a.', TP.xs.ENTITY);
    });

    this.it('test18', function(test, options) {

        test.assert.isA('a0', TP.xs.ENTITY);
    });
});

//  ========================================================================
//  xs:ENTITIES
//  ========================================================================

TP.xs.ENTITIES.Inst.describe('xs.ENTITIES: validation',
function() {

    this.it('test01', function(test, options) {

        test.assert.isA('a', TP.xs.ENTITIES);
    });

    this.it('test02', function(test, options) {

        test.assert.isA('_', TP.xs.ENTITIES);
    });

    this.it('test03', function(test, options) {

        test.refute.isA(':', TP.xs.ENTITIES);
    });

    this.it('test04', function(test, options) {

        test.refute.isA('.', TP.xs.ENTITIES);
    });

    this.it('test05', function(test, options) {

        test.refute.isA('-', TP.xs.ENTITIES);
    });

    this.it('test06', function(test, options) {

        test.refute.isA('', TP.xs.ENTITIES);
    });

    this.it('test07', function(test, options) {

        test.assert.isA('_a', TP.xs.ENTITIES);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('.a', TP.xs.ENTITIES);
    });

    this.it('test09', function(test, options) {

        test.refute.isA('-a', TP.xs.ENTITIES);
    });

    this.it('test10', function(test, options) {

        test.refute.isA(':a', TP.xs.ENTITIES);
    });

    this.it('test11', function(test, options) {

        test.refute.isA('a"b', TP.xs.ENTITIES);
    });

    this.it('test12', function(test, options) {

        test.refute.isA('a\'b', TP.xs.ENTITIES);
    });

    this.it('test13', function(test, options) {

        test.refute.isA('0ab', TP.xs.ENTITIES);
    });

    this.it('test14', function(test, options) {

        test.assert.isA('a-', TP.xs.ENTITIES);
    });

    this.it('test15', function(test, options) {

        test.refute.isA('a:', TP.xs.ENTITIES);
    });

    this.it('test16', function(test, options) {

        test.assert.isA('a_', TP.xs.ENTITIES);
    });

    this.it('test17', function(test, options) {

        test.assert.isA('a.', TP.xs.ENTITIES);
    });

    this.it('test18', function(test, options) {

        test.assert.isA('a0', TP.xs.ENTITIES);
    });

    this.it('test19', function(test, options) {

        test.assert.isA('a a', TP.xs.ENTITIES);
    });

    this.it('test20', function(test, options) {

        test.assert.isA('a _', TP.xs.ENTITIES);
    });

    this.it('test21', function(test, options) {

        test.refute.isA('a :', TP.xs.ENTITIES);
    });

    this.it('test22', function(test, options) {

        test.refute.isA('a .', TP.xs.ENTITIES);
    });

    this.it('test23', function(test, options) {

        test.refute.isA('a -', TP.xs.ENTITIES);
    });

    this.it('test24', function(test, options) {

        test.refute.isA('', TP.xs.ENTITIES);
    });

    this.it('test25', function(test, options) {

        test.assert.isA('a _a', TP.xs.ENTITIES);
    });

    this.it('test26', function(test, options) {

        test.refute.isA('a .a', TP.xs.ENTITIES);
    });

    this.it('test27', function(test, options) {

        test.refute.isA('a -a', TP.xs.ENTITIES);
    });

    this.it('test28', function(test, options) {

        test.refute.isA('a :a', TP.xs.ENTITIES);
    });

    this.it('test29', function(test, options) {

        test.refute.isA('a"b ab', TP.xs.ENTITIES);
    });

    this.it('test30', function(test, options) {

        test.refute.isA('a\'b ab', TP.xs.ENTITIES);
    });

    this.it('test31', function(test, options) {

        test.refute.isA('0ab ab', TP.xs.ENTITIES);
    });

    this.it('test32', function(test, options) {

        test.assert.isA('a- a', TP.xs.ENTITIES);
    });

    this.it('test33', function(test, options) {

        test.refute.isA('a: a', TP.xs.ENTITIES);
    });

    this.it('test34', function(test, options) {

        test.assert.isA('a_ a', TP.xs.ENTITIES);
    });

    this.it('test35', function(test, options) {

        test.assert.isA('a. a', TP.xs.ENTITIES);
    });

    this.it('test36', function(test, options) {

        test.assert.isA('a0 a', TP.xs.ENTITIES);
    });
});

//  ========================================================================
//  xs:duration
//  ========================================================================

TP.xs.duration.Inst.describe('xs.duration: validation',
function() {

    this.it('test01', function(test, options) {

        //  must have a P even if beginning with -
        test.refute.isA('-', TP.xs.duration);
    });

    this.it('test02', function(test, options) {

        //  must have at least one duration segment
        test.refute.isA('P', TP.xs.duration);
    });

    this.it('test03', function(test, options) {

        //  must have a Y or other segment ID
        test.refute.isA('P1', TP.xs.duration);
    });

    this.it('test04', function(test, options) {

        //  must have a P
        test.refute.isA('1Y', TP.xs.duration);
    });

    this.it('test05', function(test, options) {

        //  negative must be first char in string
        test.refute.isA('P-1Y', TP.xs.duration);
    });

    this.it('test06', function(test, options) {

        //  decimals only in seconds
        test.refute.isA('P0.5Y', TP.xs.duration);
    });

    this.it('test07', function(test, options) {

        //  can't have T without H,M, or S
        test.refute.isA('P1YT', TP.xs.duration);
    });

    this.it('test08', function(test, options) {

        //  can't have H,M, or S without a T
        test.refute.isA('P1H', TP.xs.duration);
    });

    this.it('test09', function(test, options) {

        //  from spec
        test.refute.isA('P-1347M', TP.xs.duration);
    });

    this.it('test10', function(test, options) {

        //  from spec
        test.refute.isA('P1Y2MT', TP.xs.duration);
    });

    this.it('test11', function(test, options) {

        //  from spec
        test.assert.isA('P1347Y', TP.xs.duration);
    });

    this.it('test12', function(test, options) {

        //  from spec
        test.assert.isA('P1347M', TP.xs.duration);
    });

    this.it('test13', function(test, options) {

        //  from spec
        test.assert.isA('P1Y2MT2H', TP.xs.duration);
    });

    this.it('test14', function(test, options) {

        //  from spec
        test.assert.isA('P0Y1347M', TP.xs.duration);
    });

    this.it('test15', function(test, options) {

        //  from spec
        test.assert.isA('-P1347M', TP.xs.duration);
    });

    this.it('test16', function(test, options) {

        test.assert.isA('PT1H', TP.xs.duration);
    });

    this.it('test17', function(test, options) {

        test.assert.isA('PT1M', TP.xs.duration);
    });

    this.it('test18', function(test, options) {

        test.assert.isA('PT1S', TP.xs.duration);
    });

    this.it('test19', function(test, options) {

        test.assert.isA('PT0H', TP.xs.duration);
    });

    this.it('test20', function(test, options) {

        test.assert.isA('PT0M', TP.xs.duration);
    });

    this.it('test21', function(test, options) {

        test.assert.isA('PT0S', TP.xs.duration);
    });

    this.it('test22', function(test, options) {

        test.assert.isA('PT0.001S', TP.xs.duration);
    });

    this.it('test23', function(test, options) {

        test.assert.isEqualTo(TP.xs.duration.getMonthsInDuration('P2Y10D'), 24);
    });

    this.it('test24', function(test, options) {

        test.assert.isEqualTo(TP.xs.duration.getMonthsInDuration('P10M'), 10);
    });

    this.it('test25', function(test, options) {

        test.assert.isEqualTo(TP.xs.duration.getMonthsInDuration('P1Y0M'), 12);
    });

    this.it('test26', function(test, options) {

        test.assert.isEqualTo(TP.xs.duration.getMonthsInDuration('PT1S'), 0);
    });

    this.it('test27', function(test, options) {

        test.assert.isEqualTo(TP.xs.duration.getMonthsInDuration('P3Y6M'), 42);
    });

    this.it('test28', function(test, options) {

        test.assert.isEqualTo(
                        TP.xs.duration.getSecondsInDuration('P1DT0H0M0.0S'),
                        86400.0);
    });

    this.it('test29', function(test, options) {

        test.assert.isEqualTo(
                        TP.xs.duration.getSecondsInDuration('PT1H0M0.0S'),
                        60 * 60);
    });

    this.it('test30', function(test, options) {

        test.assert.isEqualTo(
                        TP.xs.duration.getSecondsInDuration('PT1H1M23S'),
                        3683);
    });
});

//  ========================================================================
//  xs:dateTime
//  ========================================================================

TP.xs.dateTime.Inst.describe('xs.dateTime: validation',
function() {

    this.it('test01', function(test, options) {

        //  time zone data can be missing
        test.assert.isA('2001-10-26T21:32:52', TP.xs.dateTime);
    });

    this.it('test02', function(test, options) {

        //  time zone data here is valid
        test.assert.isA('2001-10-26T21:32:52+02:00', TP.xs.dateTime);
    });

    this.it('test03', function(test, options) {

        //  canonical value for TZ +00:00
        test.assert.isA('2001-10-26T19:32:52Z', TP.xs.dateTime);
    });

    this.it('test04', function(test, options) {

        //  same as last test
        test.assert.isA('2001-10-26T19:32:52+00:00', TP.xs.dateTime);
    });

    this.it('test05', function(test, options) {

        //  zone can be minus too
        test.assert.isA('-2001-10-26T19:32:52-00:00', TP.xs.dateTime);
    });

    this.it('test06', function(test, options) {

        //  decimal seconds
        test.assert.isA('2001-10-26T19:32:52.12679', TP.xs.dateTime);
    });

    this.it('test07', function(test, options) {

        //  missing parts
        test.refute.isA('2001-10-26', TP.xs.dateTime);
    });

    this.it('test08', function(test, options) {

        //  missing parts
        test.refute.isA('2001-10-26T21:32', TP.xs.dateTime);
    });

    this.it('test09', function(test, options) {

        //  bad hour
        test.refute.isA('2001-10-26T25:32:52+02:00', TP.xs.dateTime);
    });

    this.it('test10', function(test, options) {

        //  bad year
        test.refute.isA('01-10-26T25:32:52+02:00', TP.xs.dateTime);
    });

    this.it('test11', function(test, options) {

        //  fractional seconds can't end in 0
        test.refute.isA('2001-10-26T19:32:52.12670', TP.xs.dateTime);
    });

    this.it('test12', function(test, options) {

        //  not a leap year
        test.refute.isA('2001-02-29T19:32:52', TP.xs.dateTime);
    });

    this.it('test13', function(test, options) {

        //  leap year
        test.assert.isA('2000-02-29T19:32:52', TP.xs.dateTime);
    });

    this.it('test14', function(test, options) {

        //  year 0 invalid but planned, so TIBET allows it
        test.assert.isA('0000-03-29T19:32:52', TP.xs.dateTime);
    });

    this.it('test15', function(test, options) {

        //  month 0 invalid
        test.refute.isA('2000-00-01T19:32:52', TP.xs.dateTime);
    });

    this.it('test16', function(test, options) {

        //  day 0 invalid
        test.refute.isA('2000-01-00T19:32:52', TP.xs.dateTime);
    });

    this.it('test17', function(test, options) {

        //  minute 60 invalid
        test.refute.isA('2000-01-01T19:60:52', TP.xs.dateTime);
    });

    this.it('test18', function(test, options) {

        //  seconds 62 invalid
        test.refute.isA('2000-01-01T19:12:62', TP.xs.dateTime);
    });

    this.it('test19', function(test, options) {

        //  if TZ must be complete
        test.refute.isA('2000-01-01T19:12:23-10', TP.xs.dateTime);
    });

    this.it('test20', function(test, options) {

        //  if TZ must be complete
        test.refute.isA('2000-01-01T19:12:23-10:', TP.xs.dateTime);
    });

    this.it('test21', function(test, options) {

        //  if TZ can't be more than +14, or less than -14
        test.refute.isA('2000-01-01T19:12:23+15:00', TP.xs.dateTime);
    });

    this.it('test22', function(test, options) {

        //  if TZ can't be more than +14, or less than -14
        test.refute.isA('2000-01-01T19:12:23+14:01', TP.xs.dateTime);
    });

    this.it('test23', function(test, options) {

        //  if TZ can't be more than +14, or less than -14
        test.refute.isA('2000-01-01T19:12:23-15:00', TP.xs.dateTime);
    });

    this.it('test24', function(test, options) {

        //  if TZ can't be more than +14, or less than -14
        test.refute.isA('2000-01-01T19:12:23-14:01', TP.xs.dateTime);
    });

    this.it('test25', function(test, options) {

        //  if TZ can't be more than +14, or less than -14
        test.assert.isA('2000-01-01T19:12:23-14:00', TP.xs.dateTime);
    });

    this.it('test26', function(test, options) {

        //  if TZ can't be more than +14, or less than -14
        test.assert.isA('2000-01-01T19:12:23+14:00', TP.xs.dateTime);
    });

    this.it('test27', function(test, options) {

        //  midnight new years eve
        test.assert.isA('1999-12-31T00:00:00', TP.xs.dateTime);
    });
});

//  ========================================================================
//  xs:time
//  ========================================================================

TP.xs.time.Inst.describe('xs.time: validation',
function() {

    this.it('test01', function(test, options) {

        //  time zone data can be missing
        test.assert.isA('21:32:52', TP.xs.time);
    });

    this.it('test02', function(test, options) {

        //  time zone data here is valid
        test.assert.isA('21:32:52+02:00', TP.xs.time);
    });

    this.it('test03', function(test, options) {

        //  canonical value for TZ +00:00
        test.assert.isA('19:32:52Z', TP.xs.time);
    });

    this.it('test04', function(test, options) {

        //  same as last test
        test.assert.isA('19:32:52+00:00', TP.xs.time);
    });

    this.it('test05', function(test, options) {

        //  zone can be minus too
        test.assert.isA('19:32:52-00:00', TP.xs.time);
    });

    this.it('test06', function(test, options) {

        //  decimal seconds
        test.assert.isA('19:32:52.12679', TP.xs.time);
    });

    this.it('test07', function(test, options) {

        //  missing parts
        test.refute.isA('21:32', TP.xs.time);
    });

    this.it('test08', function(test, options) {

        //  bad hour
        test.refute.isA('25:32:52+02:00', TP.xs.time);
    });

    this.it('test09', function(test, options) {

        //  fractional seconds can't end in 0
        test.refute.isA('19:32:52.12670', TP.xs.time);
    });

    this.it('test10', function(test, options) {

        //  minute 60 invalid
        test.refute.isA('19:60:52', TP.xs.time);
    });

    this.it('test10', function(test, options) {

        //  seconds 62 invalid
        test.refute.isA('19:12:62', TP.xs.time);
    });

    this.it('test11', function(test, options) {

        //  if TZ must be complete
        test.refute.isA('19:12:23-10', TP.xs.time);
    });

    this.it('test12', function(test, options) {

        //  if TZ must be complete
        test.refute.isA('19:12:23-10:', TP.xs.time);
    });

    this.it('test13', function(test, options) {

        //  if TZ can't be more than +14, or less than -14
        test.refute.isA('19:12:23+15:00', TP.xs.time);
    });

    this.it('test14', function(test, options) {

        //  if TZ can't be more than +14, or less than -14
        test.refute.isA('19:12:23+14:01', TP.xs.time);
    });

    this.it('test15', function(test, options) {

        //  if TZ can't be more than +14, or less than -14
        test.refute.isA('19:12:23-15:00', TP.xs.time);
    });

    this.it('test16', function(test, options) {

        //  if TZ can't be more than +14, or less than -14
        test.refute.isA('19:12:23-14:01', TP.xs.time);
    });

    this.it('test17', function(test, options) {

        //  if TZ can't be more than +14, or less than -14
        test.assert.isA('19:12:23-14:00', TP.xs.time);
    });

    this.it('test18', function(test, options) {

        //  if TZ can't be more than +14, or less than -14
        test.assert.isA('19:12:23+14:00', TP.xs.time);
    });

    this.it('test19', function(test, options) {

        //  midnight
        test.assert.isA('00:00:00', TP.xs.time);
    });
});

//  ========================================================================
//  xs:date
//  ========================================================================

TP.xs.date.Inst.describe('xs.date: validation',
function() {

    this.it('test01', function(test, options) {

        test.assert.isA('2001-10-26', TP.xs.date);
    });

    this.it('test02', function(test, options) {

        //  bad year
        test.refute.isA('01-10-26', TP.xs.date);
    });

    this.it('test03', function(test, options) {

        //  not a leap year
        test.refute.isA('2001-02-29', TP.xs.date);
    });

    this.it('test04', function(test, options) {

        //  leap year
        test.assert.isA('2000-02-29', TP.xs.date);
    });

    this.it('test05', function(test, options) {

        //  year 0 invalid but planned, so TIBET allows it
        test.assert.isA('0000-03-29', TP.xs.date);
    });

    this.it('test06', function(test, options) {

        //  month 0 invalid
        test.refute.isA('2000-00-01', TP.xs.date);
    });

    this.it('test07', function(test, options) {

        //  day 0 invalid
        test.refute.isA('2000-01-00', TP.xs.date);
    });

    this.it('test08', function(test, options) {

        test.assert.isA('2001-10-26+02:00', TP.xs.date);
    });

    this.it('test09', function(test, options) {

        test.assert.isA('2001-10-26Z', TP.xs.date);
    });

    this.it('test10', function(test, options) {

        test.assert.isA('2001-10-26+00:00', TP.xs.date);
    });

    this.it('test11', function(test, options) {

        test.assert.isA('2001-10-26-00:00', TP.xs.date);
    });

    this.it('test12', function(test, options) {

        test.assert.isA('2001-10-26-05:00', TP.xs.date);
    });

    this.it('test13', function(test, options) {

        test.assert.isA('-2001-10-26', TP.xs.date);
    });

    this.it('test14', function(test, options) {

        test.assert.isA('-20001-10-26-05:00', TP.xs.date);
    });

    this.it('test15', function(test, options) {

        test.refute.isA('2001-10', TP.xs.date);
    });

    this.it('test16', function(test, options) {

        test.refute.isA('2001-10-32', TP.xs.date);
    });

    this.it('test17', function(test, options) {

        test.refute.isA('2001-13-26+02:00', TP.xs.date);
    });
});

//  ========================================================================
//  xs:gYearMonth
//  ========================================================================

TP.xs.gYearMonth.Inst.describe('xs.gYearMonth: validation',
function() {

    this.it('test01', function(test, options) {

        test.assert.isA('2001-10', TP.xs.gYearMonth);
    });

    this.it('test02', function(test, options) {

        //  bad year
        test.refute.isA('01-10', TP.xs.gYearMonth);
    });

    this.it('test03', function(test, options) {

        test.assert.isA('2001-10+02:00', TP.xs.gYearMonth);
    });

    this.it('test04', function(test, options) {

        test.assert.isA('2001-10Z', TP.xs.gYearMonth);
    });

    this.it('test05', function(test, options) {

        test.assert.isA('2001-10+00:00', TP.xs.gYearMonth);
    });

    this.it('test06', function(test, options) {

        test.assert.isA('2001-10-00:00', TP.xs.gYearMonth);
    });

    this.it('test07', function(test, options) {

        test.assert.isA('2001-10-05:00', TP.xs.gYearMonth);
    });

    this.it('test08', function(test, options) {

        test.assert.isA('-2001-10', TP.xs.gYearMonth);
    });

    this.it('test09', function(test, options) {

        test.assert.isA('-20001-10', TP.xs.gYearMonth);
    });

    this.it('test10', function(test, options) {

        test.refute.isA('2001', TP.xs.gYearMonth);
    });

    this.it('test11', function(test, options) {

        test.refute.isA('2001-13', TP.xs.gYearMonth);
    });

    this.it('test12', function(test, options) {

        test.refute.isA('2001-13+02:00', TP.xs.gYearMonth);
    });
});

//  ========================================================================
//  xs:gYear
//  ========================================================================

TP.xs.gYear.Inst.describe('xs.gYear: validation',
function() {

    this.it('test01', function(test, options) {

        test.assert.isA('2001', TP.xs.gYear);
    });

    this.it('test02', function(test, options) {

        //  bad year
        test.refute.isA('01', TP.xs.gYear);
    });

    this.it('test03', function(test, options) {

        test.assert.isA('2001+02:00', TP.xs.gYear);
    });

    this.it('test04', function(test, options) {

        test.assert.isA('2001Z', TP.xs.gYear);
    });

    this.it('test05', function(test, options) {

        test.assert.isA('2001+00:00', TP.xs.gYear);
    });

    this.it('test06', function(test, options) {

        test.assert.isA('2001-00:00', TP.xs.gYear);
    });

    this.it('test07', function(test, options) {

        test.assert.isA('2001-05:00', TP.xs.gYear);
    });

    this.it('test08', function(test, options) {

        test.assert.isA('-2001', TP.xs.gYear);
    });

    this.it('test09', function(test, options) {

        test.assert.isA('-20001', TP.xs.gYear);
    });

    this.it('test10', function(test, options) {

        test.refute.isA('2001-13', TP.xs.gYear);
    });
});

//  ========================================================================
//  xs:gMonth
//  ========================================================================

TP.xs.gMonth.Inst.describe('xs.gMonth: validation',
function() {

    this.it('test01', function(test, options) {

        test.assert.isA('--01', TP.xs.gMonth);
    });

    this.it('test02', function(test, options) {

        test.assert.isA('--01+02:00', TP.xs.gMonth);
    });

    this.it('test03', function(test, options) {

        test.assert.isA('--01Z', TP.xs.gMonth);
    });

    this.it('test04', function(test, options) {

        test.assert.isA('--01+00:00', TP.xs.gMonth);
    });

    this.it('test05', function(test, options) {

        test.assert.isA('--01-00:00', TP.xs.gMonth);
    });

    this.it('test06', function(test, options) {

        test.assert.isA('--01-05:00', TP.xs.gMonth);
    });

    this.it('test07', function(test, options) {

        test.refute.isA('-01-', TP.xs.gMonth);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('-01', TP.xs.gMonth);
    });

    this.it('test09', function(test, options) {

        test.refute.isA('01', TP.xs.gMonth);
    });

    this.it('test10', function(test, options) {

        test.refute.isA('--1', TP.xs.gMonth);
    });

    this.it('test11', function(test, options) {

        test.refute.isA('--13', TP.xs.gMonth);
    });
});

//  ========================================================================
//  xs:gDay
//  ========================================================================

TP.xs.gDay.Inst.describe('xs.gDay: validation',
function() {

    this.it('test01', function(test, options) {

        test.assert.isA('---01', TP.xs.gDay);
    });

    this.it('test02', function(test, options) {

        test.assert.isA('---01+02:00', TP.xs.gDay);
    });

    this.it('test03', function(test, options) {

        test.assert.isA('---01Z', TP.xs.gDay);
    });

    this.it('test04', function(test, options) {

        test.assert.isA('---01+00:00', TP.xs.gDay);
    });

    this.it('test05', function(test, options) {

        test.assert.isA('---01-00:00', TP.xs.gDay);
    });

    this.it('test06', function(test, options) {

        test.assert.isA('---01-05:00', TP.xs.gDay);
    });

    this.it('test07', function(test, options) {

        test.refute.isA('--01-', TP.xs.gDay);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('---35', TP.xs.gDay);
    });

    this.it('test09', function(test, options) {

        test.refute.isA('01', TP.xs.gDay);
    });

    this.it('test10', function(test, options) {

        test.refute.isA('---1', TP.xs.gDay);
    });

    this.it('test11', function(test, options) {

        test.assert.isA('---31', TP.xs.gDay);
    });
});

//  ========================================================================
//  xs:gMonthDay
//  ========================================================================

TP.xs.gMonthDay.Inst.describe('xs.gMonthDay: validation',
function() {

    this.it('test01', function(test, options) {

        test.assert.isA('--05-01', TP.xs.gMonthDay);
    });

    this.it('test02', function(test, options) {

        test.refute.isA('-01-30', TP.xs.gMonthDay);
    });

    this.it('test03', function(test, options) {

        //  not a leap year
        test.refute.isA('--02-30', TP.xs.gMonthDay);
    });

    this.it('test04', function(test, options) {

        //  leap year
        test.assert.isA('--02-29', TP.xs.gMonthDay);
    });

    this.it('test05', function(test, options) {

        test.assert.isA('--11-01Z', TP.xs.gMonthDay);
    });

    this.it('test06', function(test, options) {

        //  month 0 invalid
        test.refute.isA('--00-01', TP.xs.gMonthDay);
    });

    this.it('test07', function(test, options) {

        //  day 0 invalid
        test.refute.isA('--01-00', TP.xs.gMonthDay);
    });

    this.it('test08', function(test, options) {

        test.assert.isA('--10-26+02:00', TP.xs.gMonthDay);
    });

    this.it('test09', function(test, options) {

        test.assert.isA('--10-26Z', TP.xs.gMonthDay);
    });

    this.it('test10', function(test, options) {

        test.assert.isA('--10-26+00:00', TP.xs.gMonthDay);
    });

    this.it('test11', function(test, options) {

        test.assert.isA('--10-26-00:00', TP.xs.gMonthDay);
    });

    this.it('test12', function(test, options) {

        test.assert.isA('--10-26-05:00', TP.xs.gMonthDay);
    });

    this.it('test13', function(test, options) {

        test.assert.isA('--10-31', TP.xs.gMonthDay);
    });

    this.it('test14', function(test, options) {

        test.refute.isA('--11Z', TP.xs.gMonthDay);
    });

    this.it('test15', function(test, options) {

        test.refute.isA('--11+02:00', TP.xs.gMonthDay);
    });

    this.it('test16', function(test, options) {

        test.refute.isA('--01-35', TP.xs.gMonthDay);
    });

    this.it('test17', function(test, options) {

        test.refute.isA('01-15', TP.xs.gMonthDay);
    });

    this.it('test18', function(test, options) {

        test.refute.isA('--1-15', TP.xs.gMonthDay);
    });

    this.it('test19', function(test, options) {

        test.refute.isA('--01-1', TP.xs.gMonthDay);
    });
});

//  ========================================================================
//  xs:boolean
//  ========================================================================

TP.xs.boolean.Inst.describe('xs.boolean: validation',
function() {

    this.it('test01', function(test, options) {

        test.assert.isA('0', TP.xs.boolean);
    });

    this.it('test02', function(test, options) {

        test.assert.isA('1', TP.xs.boolean);
    });

    this.it('test03', function(test, options) {

        test.assert.isA('true', TP.xs.boolean);
    });

    this.it('test04', function(test, options) {

        test.assert.isA('false', TP.xs.boolean);
    });

    this.it('test05', function(test, options) {

        /* eslint-disable no-extra-parens */
        test.assert.isA((0), TP.xs.boolean);
        /* eslint-enable no-extra-parens */
    });

    this.it('test06', function(test, options) {

        /* eslint-disable no-extra-parens */
        test.assert.isA((1), TP.xs.boolean);
        /* eslint-enable no-extra-parens */
    });

    this.it('test07', function(test, options) {

        /* eslint-disable no-extra-parens */
        test.assert.isA((true), TP.xs.boolean);
        /* eslint-enable no-extra-parens */
    });

    this.it('test08', function(test, options) {

        /* eslint-disable no-extra-parens */
        test.assert.isA((false), TP.xs.boolean);
        /* eslint-enable no-extra-parens */
    });

    this.it('test09', function(test, options) {

        test.assert.isA(TP.bc(0), TP.xs.boolean);
    });

    this.it('test10', function(test, options) {

        test.assert.isA(TP.bc(1), TP.xs.boolean);
    });

    this.it('test11', function(test, options) {

        test.refute.isA('boolean', TP.xs.boolean);
    });

    this.it('test12', function(test, options) {

        /* eslint-disable no-extra-parens */
        test.refute.isA((23), TP.xs.boolean);
        /* eslint-enable no-extra-parens */
    });

    this.it('test13', function(test, options) {

        test.refute.isA('foo', TP.xs.boolean);
    });
});

//  ========================================================================
//  xs:base64Binary
//  ========================================================================

TP.xs.base64Binary.Inst.describe('xs.base64Binary: validation',
function() {

    this.it('test01', function(test, options) {

        test.refute.isA('abc', TP.xs.base64Binary);
    });

    this.it('test02', function(test, options) {

        test.assert.isA('abcd', TP.xs.base64Binary);
    });

    this.it('test03', function(test, options) {

        test.refute.isA('ab cd e', TP.xs.base64Binary);
    });
});

//  ========================================================================
//  xs:hexBinary
//  ========================================================================

TP.xs.hexBinary.Inst.describe('xs.hexBinary: validation',
function() {

    this.it('test01', function(test, options) {

        //  not even
        test.refute.isA('abc', TP.xs.hexBinary);
    });

    this.it('test02', function(test, options) {

        //  bad chars
        test.refute.isA('gh', TP.xs.hexBinary);
    });

    this.it('test03', function(test, options) {

        //  bad char
        test.refute.isA('1.00', TP.xs.hexBinary);
    });

    this.it('test04', function(test, options) {

        test.assert.isA('abcd', TP.xs.hexBinary);
    });

    this.it('test05', function(test, options) {

        test.assert.isA('00', TP.xs.hexBinary);
    });

    this.it('test06', function(test, options) {

        test.assert.isA('3a2f91', TP.xs.hexBinary);
    });
});

//  ========================================================================
//  xs:float
//  ========================================================================

TP.xs.float.Inst.describe('xs.float: validation',
function() {

    this.it('test01', function(test, options) {

        /* eslint-disable no-extra-parens */
        test.assert.isA((123.456), TP.xs.float);
        /* eslint-enable no-extra-parens */
    });

    this.it('test02', function(test, options) {

        /* eslint-disable no-extra-parens */
        test.assert.isA((+1234.456), TP.xs.float);
        /* eslint-enable no-extra-parens */
    });

    this.it('test03', function(test, options) {

        //  too big for a float (this is a double)
        /* eslint-disable no-extra-parens */
        test.refute.isA((-1.2344e56), TP.xs.float);
        /* eslint-enable no-extra-parens */
    });

    this.it('test04', function(test, options) {

        /* eslint-disable no-extra-parens */
        test.assert.isA((-0.45E-6), TP.xs.float);
        /* eslint-enable no-extra-parens */
    });

    this.it('test05', function(test, options) {

        test.assert.isA('INF', TP.xs.float);
    });

    this.it('test06', function(test, options) {

        test.assert.isA('-INF', TP.xs.float);
    });

    this.it('test07', function(test, options) {

        test.assert.isA('NaN', TP.xs.float);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('1234.4E 56', TP.xs.float);
    });

    this.it('test09', function(test, options) {

        test.refute.isA('1E+2.5', TP.xs.float);
    });

    this.it('test10', function(test, options) {

        test.refute.isA('+INF', TP.xs.float);
    });

    this.it('test11', function(test, options) {

        test.refute.isA('NAN', TP.xs.float);
    });
});

//  ========================================================================
//  xs:double
//  ========================================================================

TP.xs.double.Inst.describe('xs.double: validation',
function() {

    this.it('test01', function(test, options) {

        /* eslint-disable no-extra-parens */
        test.assert.isA((123.456), TP.xs.double);
        /* eslint-enable no-extra-parens */
    });

    this.it('test02', function(test, options) {

        /* eslint-disable no-extra-parens */
        test.assert.isA((+1234.456), TP.xs.double);
        /* eslint-enable no-extra-parens */
    });

    this.it('test03', function(test, options) {

        /* eslint-disable no-extra-parens */
        test.assert.isA((-1.2344e56), TP.xs.double);
        /* eslint-enable no-extra-parens */
    });

    this.it('test04', function(test, options) {

        /* eslint-disable no-extra-parens */
        test.assert.isA((-0.45E-6), TP.xs.double);
        /* eslint-enable no-extra-parens */
    });

    this.it('test05', function(test, options) {

        test.assert.isA('INF', TP.xs.double);
    });

    this.it('test06', function(test, options) {

        test.assert.isA('-INF', TP.xs.double);
    });

    this.it('test07', function(test, options) {

        test.assert.isA('NaN', TP.xs.double);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('1234.4E 56', TP.xs.double);
    });

    this.it('test09', function(test, options) {

        test.refute.isA('1E+2.5', TP.xs.double);
    });

    this.it('test10', function(test, options) {

        test.refute.isA('+INF', TP.xs.double);
    });

    this.it('test11', function(test, options) {

        test.refute.isA('NAN', TP.xs.double);
    });
});

//  ========================================================================
//  xs:anyURITests
//  ========================================================================

TP.xs.anyURI.Inst.describe('xs.anyURI: validation',
function() {

    this.it('test01', function(test, options) {

        test.refute.isA('file', TP.xs.anyURI);
    });

    this.it('test02', function(test, options) {

        test.refute.isA('http', TP.xs.anyURI);
    });

    this.it('test03', function(test, options) {

        test.assert.isA('http://myserver.com', TP.xs.anyURI);
    });

    this.it('test04', function(test, options) {

        test.assert.isA('file:///usr/local/src/tibet', TP.xs.anyURI);
    });

    this.it('test05', function(test, options) {

        test.assert.isA('tibet://~app/trunk/cfg/TIBET.xml', TP.xs.anyURI);
    });
});

//  ========================================================================
//  xs:QNameTests
//  ========================================================================

TP.xs.QName.Inst.describe('xs.QName: validation',
function() {

    this.it('test01', function(test, options) {

        test.refute.isA('foo', TP.xs.QName);
    });

    this.it('test02', function(test, options) {

        test.refute.isA('foo, bar', TP.xs.QName);
    });

    this.it('test03', function(test, options) {

        test.refute.isA('{foo,bar}', TP.xs.QName);
    });

    this.it('test04', function(test, options) {

        test.refute.isA('["http://foo.com","bar"]', TP.xs.QName);
    });

    this.it('test05', function(test, options) {

        test.refute.isA('{"foo","bar"}', TP.xs.QName);
    });

    this.it('test06', function(test, options) {

        test.assert.isA('{"http://foo","bar"}', TP.xs.QName);
    });

    this.it('test07', function(test, options) {

        test.assert.isA(' { "http://foo" , "bar" }', TP.xs.QName);
    });
});

//  ========================================================================
//  xs:NOTATION
//  ========================================================================

//  ========================================================================
//  xs:decimal
//  ========================================================================

TP.xs.decimal.Inst.describe('xs.decimal: validation',
function() {

    this.it('test01', function(test, options) {

        test.assert.isA('0', TP.xs.decimal);
    });

    this.it('test02', function(test, options) {

        test.assert.isA('-0', TP.xs.decimal);
    });

    this.it('test03', function(test, options) {

        test.assert.isA('+0', TP.xs.decimal);
    });

    this.it('test04', function(test, options) {

        test.refute.isA('+.', TP.xs.decimal);
    });

    this.it('test05', function(test, options) {

        test.assert.isA('0.', TP.xs.decimal);
    });

    this.it('test06', function(test, options) {

        test.assert.isA('.0', TP.xs.decimal);
    });

    this.it('test07', function(test, options) {

        test.assert.isA('+.0', TP.xs.decimal);
    });

    this.it('test08', function(test, options) {

        test.assert.isA('+0.', TP.xs.decimal);
    });

    this.it('test09', function(test, options) {

        test.refute.isA('', TP.xs.decimal);
    });

    this.it('test10', function(test, options) {

        test.refute.isA('.', TP.xs.decimal);
    });

    this.it('test11', function(test, options) {

        test.refute.isA('INF', TP.xs.decimal);
    });

    this.it('test12', function(test, options) {

        test.refute.isA('-INF', TP.xs.decimal);
    });

    this.it('test13', function(test, options) {

        test.refute.isA('NaN', TP.xs.decimal);
    });

    this.it('test14', function(test, options) {

        test.refute.isA(parseFloat('a'), TP.xs.decimal);
    });
});

//  ========================================================================
//  xs:integer
//  ========================================================================

TP.xs.integer.Inst.describe('xs.integer: validation',
function() {

    this.it('test01', function(test, options) {

        test.refute.isA('-', TP.xs.integer);
    });

    this.it('test02', function(test, options) {

        test.refute.isA('0.0', TP.xs.integer);
    });

    this.it('test03', function(test, options) {

        test.refute.isA('+', TP.xs.integer);
    });

    this.it('test04', function(test, options) {

        test.assert.isA('0', TP.xs.integer);
    });

    this.it('test05', function(test, options) {

        test.assert.isA('+1', TP.xs.integer);
    });

    this.it('test06', function(test, options) {

        test.assert.isA('-1', TP.xs.integer);
    });

    this.it('test07', function(test, options) {

        test.assert.isA('1231312231109821098109283103701931098301',
                        TP.xs.integer);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('INF', TP.xs.integer);
    });

    this.it('test09', function(test, options) {

        test.refute.isA('-INF', TP.xs.integer);
    });

    this.it('test10', function(test, options) {

        test.refute.isA('NaN', TP.xs.integer);
    });

    this.it('test11', function(test, options) {

        test.refute.isA(parseFloat('a'), TP.xs.integer);
    });
});

//  ========================================================================
//  xs:nonPositiveInteger
//  ========================================================================

TP.xs.nonPositiveInteger.Inst.describe('xs.nonPositiveInteger: validation',
function() {

    this.it('test01', function(test, options) {

        test.assert.isA('-1', TP.xs.nonPositiveInteger);
    });

    this.it('test02', function(test, options) {

        test.assert.isA('0', TP.xs.nonPositiveInteger);
    });

    this.it('test03', function(test, options) {

        test.refute.isA('1', TP.xs.nonPositiveInteger);
    });

    this.it('test04', function(test, options) {

        test.refute.isA('+1', TP.xs.nonPositiveInteger);
    });

    this.it('test05', function(test, options) {

        test.assert.isA('-123921308912039810398120893120',
                        TP.xs.nonPositiveInteger);
    });

    this.it('test06', function(test, options) {

        test.refute.isA('INF', TP.xs.nonPositiveInteger);
    });

    this.it('test07', function(test, options) {

        test.refute.isA('-INF', TP.xs.nonPositiveInteger);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('NaN', TP.xs.nonPositiveInteger);
    });

    this.it('test09', function(test, options) {

        test.refute.isA(parseFloat('a'), TP.xs.nonPositiveInteger);
    });
});

//  ========================================================================
//  xs:negativeInteger
//  ========================================================================

TP.xs.negativeInteger.Inst.describe('xs.negativeInteger: validation',
function() {

    this.it('test01', function(test, options) {

        test.assert.isA('-1', TP.xs.negativeInteger);
    });

    this.it('test02', function(test, options) {

        test.refute.isA('0', TP.xs.negativeInteger);
    });

    this.it('test03', function(test, options) {

        test.refute.isA('1', TP.xs.negativeInteger);
    });

    this.it('test04', function(test, options) {

        test.refute.isA('+1', TP.xs.negativeInteger);
    });

    this.it('test05', function(test, options) {

        test.assert.isA('-123921308912039810398120893120',
                        TP.xs.negativeInteger);
    });

    this.it('test06', function(test, options) {

        test.refute.isA('INF', TP.xs.negativeInteger);
    });

    this.it('test07', function(test, options) {

        test.refute.isA('-INF', TP.xs.negativeInteger);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('NaN', TP.xs.negativeInteger);
    });

    this.it('test09', function(test, options) {

        test.refute.isA(parseFloat('a'), TP.xs.negativeInteger);
    });
});

//  ========================================================================
//  xs:nonNegativeInteger
//  ========================================================================

TP.xs.nonNegativeInteger.Inst.describe('xs.nonNegativeInteger: validation',
function() {

    this.it('test01', function(test, options) {

        test.refute.isA('-1', TP.xs.nonNegativeInteger);
    });

    this.it('test02', function(test, options) {

        test.assert.isA('0', TP.xs.nonNegativeInteger);
    });

    this.it('test03', function(test, options) {

        test.assert.isA('1', TP.xs.nonNegativeInteger);
    });

    this.it('test04', function(test, options) {

        test.refute.isA('-1', TP.xs.nonNegativeInteger);
    });

    this.it('test05', function(test, options) {

        test.assert.isA('+123921308912039810398120893120',
                        TP.xs.nonNegativeInteger);
    });

    this.it('test06', function(test, options) {

        test.refute.isA('INF', TP.xs.nonNegativeInteger);
    });

    this.it('test07', function(test, options) {

        test.refute.isA('-INF', TP.xs.nonNegativeInteger);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('NaN', TP.xs.nonNegativeInteger);
    });

    this.it('test09', function(test, options) {

        test.refute.isA(parseFloat('a'), TP.xs.nonNegativeInteger);
    });
});

//  ========================================================================
//  xs:positiveInteger
//  ========================================================================

TP.xs.positiveInteger.Inst.describe('xs.positiveInteger: validation',
function() {

    this.it('test01', function(test, options) {

        test.refute.isA('-1', TP.xs.positiveInteger);
    });

    this.it('test02', function(test, options) {

        test.refute.isA('0', TP.xs.positiveInteger);
    });

    this.it('test03', function(test, options) {

        test.assert.isA('1', TP.xs.positiveInteger);
    });

    this.it('test04', function(test, options) {

        test.refute.isA('-1', TP.xs.positiveInteger);
    });

    this.it('test05', function(test, options) {

        test.assert.isA('+123921308912039810398120893120', TP.xs.positiveInteger);
    });

    this.it('test06', function(test, options) {

        test.refute.isA('INF', TP.xs.positiveInteger);
    });

    this.it('test07', function(test, options) {

        test.refute.isA('-INF', TP.xs.positiveInteger);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('NaN', TP.xs.positiveInteger);
    });

    this.it('test09', function(test, options) {

        test.refute.isA(parseFloat('a'), TP.xs.positiveInteger);
    });
});

//  ========================================================================
//  xs:unsignedLong
//  ========================================================================

TP.xs.unsignedLong.Inst.describe('xs.unsignedLong: validation',
function() {

    this.it('test01', function(test, options) {

        test.refute.isA('-1', TP.xs.unsignedLong);
    });

    this.it('test02', function(test, options) {

        test.assert.isA('0', TP.xs.unsignedLong);
    });

    this.it('test03', function(test, options) {

        test.assert.isA('4294967295', TP.xs.unsignedLong);
    });

    this.it('test04', function(test, options) {

        test.refute.isA('118446744073709551615', TP.xs.unsignedLong);
    });

    this.it('test05', function(test, options) {

        test.assert.isA('18446744073709551615', TP.xs.unsignedLong);
    });

    this.it('test06', function(test, options) {

        test.refute.isA('INF', TP.xs.unsignedLong);
    });

    this.it('test07', function(test, options) {

        test.refute.isA('-INF', TP.xs.unsignedLong);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('NaN', TP.xs.unsignedLong);
    });

    this.it('test09', function(test, options) {

        test.refute.isA(parseFloat('a'), TP.xs.unsignedLong);
    });
});

//  ========================================================================
//  xs:unsignedInt
//  ========================================================================

TP.xs.unsignedInt.Inst.describe('xs.unsignedInt: validation',
function() {

    this.it('test01', function(test, options) {

        test.refute.isA('-1', TP.xs.unsignedInt);
    });

    this.it('test02', function(test, options) {

        test.assert.isA('0', TP.xs.unsignedInt);
    });

    this.it('test03', function(test, options) {

        test.assert.isA('65535', TP.xs.unsignedInt);
    });

    this.it('test04', function(test, options) {

        test.refute.isA('44294967295', TP.xs.unsignedInt);
    });

    this.it('test05', function(test, options) {

        test.assert.isA('4294967295', TP.xs.unsignedInt);
    });

    this.it('test06', function(test, options) {

        test.refute.isA('INF', TP.xs.unsignedInt);
    });

    this.it('test07', function(test, options) {

        test.refute.isA('-INF', TP.xs.unsignedInt);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('NaN', TP.xs.unsignedInt);
    });

    this.it('test09', function(test, options) {

        test.refute.isA(parseFloat('a'), TP.xs.unsignedInt);
    });
});

//  ========================================================================
//  xs:unsignedShort
//  ========================================================================

TP.xs.unsignedShort.Inst.describe('xs.unsignedShort: validation',
function() {

    this.it('test01', function(test, options) {

        test.refute.isA('-1', TP.xs.unsignedShort);
    });

    this.it('test02', function(test, options) {

        test.assert.isA('0', TP.xs.unsignedShort);
    });

    this.it('test03', function(test, options) {

        test.assert.isA('255', TP.xs.unsignedShort);
    });

    this.it('test04', function(test, options) {

        test.refute.isA('665355', TP.xs.unsignedShort);
    });

    this.it('test05', function(test, options) {

        test.assert.isA('65535', TP.xs.unsignedShort);
    });

    this.it('test06', function(test, options) {

        test.refute.isA('INF', TP.xs.unsignedShort);
    });

    this.it('test07', function(test, options) {

        test.refute.isA('-INF', TP.xs.unsignedShort);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('NaN', TP.xs.unsignedShort);
    });

    this.it('test09', function(test, options) {

        test.refute.isA(parseFloat('a'), TP.xs.unsignedShort);
    });
});

//  ========================================================================
//  xs:unsignedByte
//  ========================================================================

TP.xs.unsignedByte.Inst.describe('xs.unsignedByte: validation',
function() {

    this.it('test01', function(test, options) {

        test.refute.isA('-1', TP.xs.unsignedByte);
    });

    this.it('test02', function(test, options) {

        test.assert.isA('0', TP.xs.unsignedByte);
    });

    this.it('test03', function(test, options) {

        test.assert.isA('253', TP.xs.unsignedByte);
    });

    this.it('test04', function(test, options) {

        test.refute.isA('2255', TP.xs.unsignedByte);
    });

    this.it('test05', function(test, options) {

        test.assert.isA('255', TP.xs.unsignedByte);
    });

    this.it('test06', function(test, options) {

        test.refute.isA('INF', TP.xs.unsignedByte);
    });

    this.it('test07', function(test, options) {

        test.refute.isA('-INF', TP.xs.unsignedByte);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('NaN', TP.xs.unsignedByte);
    });

    this.it('test09', function(test, options) {

        test.refute.isA(parseFloat('a'), TP.xs.unsignedByte);
    });
});

//  ========================================================================
//  xs:long
//  ========================================================================

TP.xs.long.Inst.describe('xs.long: validation',
function() {

    this.it('test01', function(test, options) {

        test.refute.isA('-9223372036854775809', TP.xs.long);
    });

    this.it('test02', function(test, options) {

        test.assert.isA('0', TP.xs.long);
    });

    this.it('test03', function(test, options) {

        test.assert.isA('-9223372036854775808', TP.xs.long);
    });

    this.it('test04', function(test, options) {

        test.refute.isA('9223372036854775808', TP.xs.long);
    });

    this.it('test05', function(test, options) {

        test.assert.isA('9223372036854775807', TP.xs.long);
    });

    this.it('test06', function(test, options) {

        test.refute.isA('INF', TP.xs.long);
    });

    this.it('test07', function(test, options) {

        test.refute.isA('-INF', TP.xs.long);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('NaN', TP.xs.long);
    });

    this.it('test09', function(test, options) {

        test.refute.isA(parseFloat('a'), TP.xs.long);
    });
});

//  ========================================================================
//  xs:int
//  ========================================================================

TP.xs.int.Inst.describe('xs.int: validation',
function() {

    this.it('test01', function(test, options) {

        test.refute.isA('-2147483649', TP.xs.int);
    });

    this.it('test02', function(test, options) {

        test.assert.isA('0', TP.xs.int);
    });

    this.it('test03', function(test, options) {

        test.assert.isA('-2147483648', TP.xs.int);
    });

    this.it('test04', function(test, options) {

        test.refute.isA('2147483648', TP.xs.int);
    });

    this.it('test05', function(test, options) {

        test.assert.isA('2147483647', TP.xs.int);
    });

    this.it('test06', function(test, options) {

        test.refute.isA('INF', TP.xs.int);
    });

    this.it('test07', function(test, options) {

        test.refute.isA('-INF', TP.xs.int);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('NaN', TP.xs.int);
    });

    this.it('test09', function(test, options) {

        test.refute.isA(parseFloat('a'), TP.xs.int);
    });
});

//  ========================================================================
//  xs:short
//  ========================================================================

TP.xs.short.Inst.describe('xs.short: validation',
function() {

    this.it('test01', function(test, options) {

        test.refute.isA('-32769', TP.xs.short);
    });

    this.it('test02', function(test, options) {

        test.assert.isA('0', TP.xs.short);
    });

    this.it('test03', function(test, options) {

        test.assert.isA('-32768', TP.xs.short);
    });

    this.it('test04', function(test, options) {

        test.refute.isA('32768', TP.xs.short);
    });

    this.it('test05', function(test, options) {

        test.assert.isA('32767', TP.xs.short);
    });

    this.it('test06', function(test, options) {

        test.refute.isA('INF', TP.xs.short);
    });

    this.it('test07', function(test, options) {

        test.refute.isA('-INF', TP.xs.short);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('NaN', TP.xs.short);
    });

    this.it('test09', function(test, options) {

        test.refute.isA(parseFloat('a'), TP.xs.short);
    });
});

//  ========================================================================
//  xs:byte
//  ========================================================================

TP.xs.byte.Inst.describe('xs.byte: validation',
function() {

    this.it('test01', function(test, options) {

        test.refute.isA('-129', TP.xs.byte);
    });

    this.it('test02', function(test, options) {

        test.assert.isA('0', TP.xs.byte);
    });

    this.it('test03', function(test, options) {

        test.assert.isA('-128', TP.xs.byte);
    });

    this.it('test04', function(test, options) {

        test.refute.isA('128', TP.xs.byte);
    });

    this.it('test05', function(test, options) {

        test.assert.isA('127', TP.xs.byte);
    });

    this.it('test06', function(test, options) {

        test.refute.isA('INF', TP.xs.byte);
    });

    this.it('test07', function(test, options) {

        test.refute.isA('-INF', TP.xs.byte);
    });

    this.it('test08', function(test, options) {

        test.refute.isA('NaN', TP.xs.byte);
    });

    this.it('test09', function(test, options) {

        test.refute.isA(parseFloat('a'), TP.xs.byte);
    });
});

//  ========================================================================
//  TP.xs.simpleType
//  ========================================================================

TP.xs.simpleType.Inst.describe('TP.xs.simpleType: validation',
function() {

    var schema;

    this.before(
        function(suite, options) {
            var params,
                uri,
                result,
                schemaDoc;

            params = TP.request('refresh', true, 'async', false);

            uri = TP.uc('~lib_test/src/xs/simple_types_test.xsd');
            result = uri.getResource(params).get('result');

            schemaDoc = result.getNativeNode();

            schema = TP.xs.schema.construct(TP.elem(schemaDoc));

            schema.defineTypes();
        });

    this.it('simple type - maxlength restriction', function(test, options) {

        var val;

        //  TP.xs.aLastName type

        test.assert.isType(
            TP.xs.aLastName,
            TP.sc('TP.xs.aLastName should be a Type.'));

        //  Has to be less than 10
        val = 'hi there';
        test.assert.isA(val, TP.xs.aLastName);

        //  Has to be less than 10 - this isn't
        val = 'hi there Bill';
        test.refute.isA(val, TP.xs.aLastName);
    });

    this.it('simple type - pattern restriction', function(test, options) {

        var val;

        //  TP.xs.aHTTPURI type

        test.assert.isType(
            TP.xs.aHTTPURI,
            TP.sc('TP.xs.aHTTPURI should be a Type.'));

        //  Has to follow a pattern of 'http://.*'
        val = 'http://www.goo.com';
        test.assert.isA(val, TP.xs.aHTTPURI);

        //  Has to follow a pattern of 'http://.*' - this doesn't
        val = 'http:fluffy!';
        test.refute.isA(val, TP.xs.aHTTPURI);
    });

    this.it('simple type - minInclusive/maxInclusive restrictions', function(test, options) {

        var val;

        //  TP.xs.aZippyInt type

        test.assert.isType(
            TP.xs.aZippyInt,
            TP.sc('TP.xs.aZippyInt should be a Type.'));

        //  Has to be an integer between -1 and 1, inclusive
        val = -1;
        test.assert.isA(val, TP.xs.aZippyInt);

        val = 0;
        test.assert.isA(val, TP.xs.aZippyInt);

        val = 1;
        test.assert.isA(val, TP.xs.aZippyInt);

        //  Has to be an integer between -1 and 1, inclusive - these aren't.
        val = 42;
        test.refute.isA(val, TP.xs.aZippyInt);

        val = 'fluffy';
        test.refute.isA(val, TP.xs.aZippyInt);
    });

    this.it('simple type - list of built-in data types', function(test, options) {

        var val;

        //  TP.xs.simpleIntList type

        test.assert.isType(
            TP.xs.simpleIntList,
            TP.sc('TP.xs.simpleIntList should be a Type.'));

        //  Has to be a whitespace delimited list of 'xs:integer's
        val = '4 5 3 2';
        test.assert.isA(val, TP.xs.simpleIntList);

        //  Has to be a whitespace delimited list of 'xs:integer's - these aren't
        val = '45.2 3 4';
        test.refute.isA(val, TP.xs.simpleIntList);

        val = TP.ac(4, 5, 3, 2);
        test.refute.isA(val, TP.xs.simpleIntList);
    });

    this.it('simple type - list of custom data types', function(test, options) {

        var val;

        //  TP.xs.aZippyIntList type

        test.assert.isType(
            TP.xs.aZippyIntList,
            TP.sc('TP.xs.aZippyIntList should be a Type.'));

        //  Has to be a whitespace delimited list of 'aZippyInts'
        val = '-1 0 1 0 -1';
        test.assert.isA(val, TP.xs.aZippyIntList);

        //  Has to be a whitespace delimited list of 'aZippyInts' - these aren't
        val = '-1 0 42';
        test.refute.isA(val, TP.xs.aZippyIntList);

        val = TP.ac(-1, 0, 1, 0, -1);
        test.refute.isA(val, TP.xs.aZippyIntList);
    });

    this.it('simple type - list of built-in types with minInclusive/maxInclusive restrictions', function(test, options) {

        var val;

        //  TP.xs.betweenFiftiesIntList type

        test.assert.isType(
            TP.xs.betweenFiftiesIntList,
            TP.sc('TP.xs.betweenFiftiesIntList should be a Type.'));

        //  Has to be a whitespace delimited list of 'xs:integers' between -50 and
        //  50
        val = '34 23 42 18';
        test.assert.isA(val, TP.xs.betweenFiftiesIntList);

        val = '-30 23 42 -18';
        test.assert.isA(val, TP.xs.betweenFiftiesIntList);

        //  Has to be a whitespace delimited list of 'xs:integers' between -50 and
        //  50 - these aren't
        val = '0 42 55 -100';
        test.refute.isA(val, TP.xs.betweenFiftiesIntList);

        val = TP.ac(34, 23, 42, 18);
        test.refute.isA(val, TP.xs.betweenFiftiesIntList);
    });

    this.it('simple type - union of built-in types', function(test, options) {

        var val;

        //  TP.xs.intOrDate type

        test.assert.isType(
            TP.xs.intOrDate,
            TP.sc('TP.xs.intOrDate should be a Type.'));

        //  Has to be an 'xs:integer' or 'xs:date'
        val = -1;
        test.assert.isA(val, TP.xs.intOrDate);

        val = 10;
        test.assert.isA(val, TP.xs.intOrDate);

        val = '2001-10-26';
        test.assert.isA(val, TP.xs.intOrDate);

        //  Leap year
        val = '2000-02-29';
        test.assert.isA(val, TP.xs.intOrDate);

        //  Has to be an 'xs:integer' or 'xs:date' - these aren't.
        val = 1.5;
        test.refute.isA(val, TP.xs.intOrDate);

        //  month 0 invalid
        val = '2000-00-01';
        test.refute.isA(val, TP.xs.intOrDate);
    });

    this.it('simple type - union of built-in types with various restrictions', function(test, options) {

        var val;

        //  TP.xs.betweenFiftiesIntOrDate type

        test.assert.isType(
            TP.xs.betweenFiftiesIntOrDate,
            TP.sc('TP.xs.betweenFiftiesIntOrDate should be a Type.'));

        //  Has to either be an 'xs:integer' between -50 and 50 or an 'xs:date'
        val = 24;
        test.assert.isA(val, TP.xs.betweenFiftiesIntOrDate);

        val = -30;
        test.assert.isA(val, TP.xs.betweenFiftiesIntOrDate);

        val = '2001-10-26';
        test.assert.isA(val, TP.xs.betweenFiftiesIntOrDate);

        //  Has to either be an 'xs:integer' between -50 and 50 or an 'xs:date' -
        //  these aren't
        val = -55;
        test.refute.isA(val, TP.xs.betweenFiftiesIntOrDate);

        val = 100;
        test.refute.isA(val, TP.xs.betweenFiftiesIntOrDate);

        val = '2000-00-01';
        test.refute.isA(val, TP.xs.betweenFiftiesIntOrDate);

        val = TP.ac('2001-10-26', 34, 23, 42, 18);
        test.refute.isA(val, TP.xs.betweenFiftiesIntOrDate);
    });
});

//  ========================================================================
//  TP.xs.complexType
//  ========================================================================

TP.xs.complexType.Inst.describe('TP.xs.complexType: validation',
function() {

    var schema;

    this.before(
        function(suite, options) {

            var params,
                uri,
                result,
                schemaDoc;

            params = TP.request('refresh', true, 'async', false);

            uri = TP.uc('~lib_test/src/xs/complex_types_test.xsd');
            result = uri.getResource(params).get('result');

            schemaDoc = result.getNativeNode();

            schema = TP.xs.schema.construct(TP.elem(schemaDoc));

            schema.defineTypes();
        });

    this.it('complex type - embedded sequence of built-in types', function(test, options) {

        var val;

        //  ---

        //  TP.xs.Person type

        test.assert.isType(
            TP.xs.Person,
            TP.sc('TP.xs.Person should be a Type.'));

        TP.lang.Object.defineSubtype('test.Person');
        TP.test.Person.Inst.defineAttribute('lastName');
        TP.test.Person.Inst.defineAttribute('DOB');

        //  ---

        val = TP.test.Person.construct();
        val.set('lastName', 'Edney');

        //  Has to have a value for 'DOB' - this doesn't.
        test.refute.isA(val, TP.xs.Person);

        //  Now we set a value for DOB
        val.set('DOB', '1966-04-15');

        //  Now this should pass
        test.assert.isA(val, TP.xs.Person);
    });

    this.it('complex type - embedded choice of built-in types', function(test, options) {

        var val;

        //  TP.xs.USOrForeignID type

        test.assert.isType(
            TP.xs.USOrForeignID,
            TP.sc('TP.xs.USOrForeignID should be a Type.'));

        TP.lang.Object.defineSubtype('test.USOrForeignID');

        //  We define both instance attributes, but their values are mutually
        //  exclusive - they can have either one or the other.
        TP.test.USOrForeignID.Inst.defineAttribute('USID');
        TP.test.USOrForeignID.Inst.defineAttribute('ForeignID');

        //  ---

        val = TP.test.USOrForeignID.construct();
        val.set('USID', '111-11-1111');

        //  This should pass - it only has one value
        test.assert.isA(val, TP.xs.USOrForeignID);

        //  ---

        val = TP.test.USOrForeignID.construct();
        val.set('ForeignID', '333-22222-11111');

        //  This should pass - it only has one value
        test.assert.isA(val, TP.xs.USOrForeignID);

        //  ---

        val = TP.test.USOrForeignID.construct();
        val.set('USID', '111-11-1111');
        val.set('ForeignID', '333-22222-11111');

        //  This has both values - it shouldn't pass
        test.refute.isA(val, TP.xs.USOrForeignID);
    });

    this.it('complex type - embedded sequence of choices and of built-in types', function(test, options) {

        var val;

        //  TP.xs.Employee type

        test.assert.isType(
            TP.xs.Employee,
            TP.sc('TP.xs.Employee should be a Type.'));

        TP.lang.Object.defineSubtype('test.Employee');

        TP.test.Employee.Inst.defineAttribute('lastName');
        TP.test.Employee.Inst.defineAttribute('firstName');

        //  We define both instance attributes, but their values are mutually
        //  exclusive - they can have either one or the other.
        TP.test.Employee.Inst.defineAttribute('USID');
        TP.test.Employee.Inst.defineAttribute('ForeignID');

        //  ---

        val = TP.test.Employee.construct();
        val.set('lastName', 'Edney');
        val.set('firstName', 'Edney');
        val.set('USID', '111-11-1111');

        //  This should pass - it only has both lastName and firstName and only one
        //  ID.
        test.assert.isA(val, TP.xs.Employee);

        //  ---

        val = TP.test.Employee.construct();
        val.set('lastName', 'Edney');
        val.set('firstName', 'Edney');
        val.set('ForeignID', '333-22222-11111');

        //  This should pass - it only has both lastName and firstName and only one
        //  ID.
        test.assert.isA(val, TP.xs.Employee);

        //  ---

        val = TP.test.Employee.construct();
        val.set('lastName', 'Edney');
        val.set('USID', '111-11-1111');

        //  This has no firstName - it shouldn't pass
        test.refute.isA(val, TP.xs.Employee);

        //  ---

        val = TP.test.Employee.construct();
        val.set('lastName', 'Edney');
        val.set('USID', '111-11-1111');
        val.set('ForeignID', '333-22222-11111');

        //  This has both ID values - it shouldn't pass
        test.refute.isA(val, TP.xs.Employee);
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
