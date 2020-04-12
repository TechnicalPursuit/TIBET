//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

TP.elementGetAttribute.describe('retrieve value',
function() {

    var doc;

    this.beforeEach(
        function(test, options) {
            doc = TP.documentFromString(
                    '<foo xmlns="http://www.foo.com"' +
                    ' xmlns:xf="http://www.w3.org/2002/xforms"' +
                    ' xf:bind="theBinder" goo="moo">' +
                    'Hi there' +
                    '</foo>');
        });

    //  ---

    this.it('Simple attribute access', function(test, options) {

        var testVal,
            correctVal;

        testVal = TP.elementGetAttribute(doc.documentElement, 'goo');
        correctVal = 'moo';

        test.assert.isEqualTo(testVal, correctVal);
    });

    //  ---

    this.it('Prefixed attribute access - defined namespace, no advanced checking', function(test, options) {

        var testVal,
            correctVal;

        testVal = TP.elementGetAttribute(doc.documentElement, 'xf:bind');
        correctVal = 'theBinder';

        test.assert.isEqualTo(testVal, correctVal);
    });

    //  ---

    this.it('Prefixed attribute access - undefined namespace, no advanced checking', function(test, options) {

        var testVal;

        testVal = TP.elementGetAttribute(doc.documentElement, 'xforms:bind');

        test.assert.isEmpty(testVal);
    });

    //  ---

    this.it('Prefixed attribute access - undefined namespace, advanced checking', function(test, options) {

        var testVal,
            correctVal;

        testVal = TP.elementGetAttribute(doc.documentElement, 'xforms:bind', true);
        correctVal = 'theBinder';

        test.assert.isEqualTo(testVal, correctVal);
    });
});

//  ------------------------------------------------------------------------

TP.elementHasAttribute.describe('has attribute',
function() {

    var doc;

    this.beforeEach(
        function(test, options) {
            doc = TP.documentFromString(
                    '<foo xmlns="http://www.foo.com"' +
                    ' xmlns:xf="http://www.w3.org/2002/xforms"' +
                    ' xf:bind="theBinder" goo="moo">' +
                    'Hi there' +
                    '</foo>');
        });

    //  ---

    this.it('Simple attribute access', function(test, options) {

        var testVal;

        testVal = TP.elementHasAttribute(doc.documentElement, 'goo');

        test.assert.isTrue(testVal);
    });

    //  ---

    this.it('Prefixed attribute access - defined namespace, no advanced checking', function(test, options) {

        var testVal;

        testVal = TP.elementHasAttribute(doc.documentElement, 'xf:bind');

        test.assert.isTrue(testVal);
    });

    //  ---

    this.it('Prefixed attribute access - undefined namespace, no advanced checking', function(test, options) {

        var testVal;

        testVal = TP.elementHasAttribute(doc.documentElement, 'xforms:bind');

        test.assert.isFalse(testVal);
    });

    //  ---

    this.it('Prefixed attribute access - undefined namespace, advanced checking', function(test, options) {

        var testVal;

        testVal = TP.elementHasAttribute(doc.documentElement, 'xforms:bind', true);

        test.assert.isTrue(testVal);
    });
});

//  ------------------------------------------------------------------------

TP.elementRemoveAttribute.describe('remove attribute',
function() {

    var doc;

    this.beforeEach(
        function(test, options) {
            doc = TP.documentFromString(
                    '<foo xmlns="http://www.foo.com"' +
                    ' xmlns:xf="http://www.w3.org/2002/xforms"' +
                    ' xf:bind="theBinder" xf:bind2="anotherBinder" goo="moo">' +
                    'Hi there' +
                    '</foo>');
        });

    //  ---

    this.it('Simple attribute access', function(test, options) {

        var testVal;

        TP.elementRemoveAttribute(doc.documentElement, 'goo');

        //  Note the use of native methods/structures to verify result
        testVal = doc.documentElement.attributes.getNamedItem('goo');

        test.assert.isNull(testVal);
    });

    //  ---

    this.it('Prefixed attribute access - defined namespace, no advanced checking', function(test, options) {

        var testVal;

        TP.elementRemoveAttribute(doc.documentElement, 'xf:bind');

        //  Note the use of native methods/structures to verify result
        testVal = doc.documentElement.attributes.getNamedItemNS(
                                'http://www.w3.org/2002/xforms', 'bind');

        test.assert.isNull(testVal);
    });

    //  ---

    this.it('Prefixed attribute access - undefined namespace, no advanced checking', function(test, options) {

        var testVal;

        TP.elementRemoveAttribute(doc.documentElement, 'xforms:bind2');

        //  Note the use of native methods/structures to verify result
        testVal = doc.documentElement.attributes.getNamedItemNS(
                                'http://www.w3.org/2002/xforms', 'bind2');

        //  Note that we *refute* here, because without the advanced checking
        //  flag this should have failed.
        test.refute.isNull(testVal);
    });

    //  ---

    this.it('Prefixed attribute access - undefined namespace, advanced checking', function(test, options) {

        var testVal;

        TP.elementRemoveAttribute(doc.documentElement, 'xforms:bind2', true);

        //  Note the use of native methods/structures to verify result
        testVal = doc.documentElement.attributes.getNamedItemNS(
                                'http://www.w3.org/2002/xforms', 'bind2');

        test.assert.isNull(testVal);
    });
});

//  ------------------------------------------------------------------------

TP.elementSetAttribute.describe('set value',
function() {

    var doc;

    this.beforeEach(
        function(test, options) {
            doc = TP.documentFromString(
                    '<foo xmlns="http://www.foo.com"' +
                    ' xmlns:xf="http://www.w3.org/2002/xforms"' +
                    ' xf:bind="theBinder" goo="moo">' +
                    'Hi there' +
                    '</foo>');
        });

    //  ---

    this.it('Simple attribute access', function(test, options) {

        var testVal,
            correctVal;

        TP.elementSetAttribute(doc.documentElement, 'goo', 'boo');

        //  Note the use of native methods/structures to verify result
        testVal = doc.documentElement.attributes.getNamedItem('goo').value;

        correctVal = 'boo';

        test.assert.isEqualTo(testVal, correctVal);
    });

    //  ---

    this.it('Prefixed attribute access - defined namespace, no advanced checking', function(test, options) {

        var testVal,
            correctVal;

        TP.elementSetAttribute(doc.documentElement, 'xf:bind', 'anotherBinder');

        //  Note the use of native methods/structures to verify result
        testVal = doc.documentElement.attributes.getNamedItemNS(
                                'http://www.w3.org/2002/xforms', 'bind').value;

        correctVal = 'anotherBinder';

        test.assert.isEqualTo(testVal, correctVal);
    });

    //  ---

    this.it('Prefixed attribute access - undefined namespace, no advanced checking', function(test, options) {

        var testVal,
            correctVal;

        TP.elementSetAttribute(
                doc.documentElement, 'xforms:bind', 'yetAnotherBinder');

        //  Note the use of native methods/structures to verify result
        testVal = doc.documentElement.attributes.getNamedItemNS(
                                'http://www.w3.org/2002/xforms', 'bind').value;

        correctVal = 'yetAnotherBinder';

        //  Note that we *refute* here, because without the advanced checking
        //  flag this should have failed.
        test.refute.isEqualTo(testVal, correctVal);
    });

    //  ---

    this.it('Prefixed attribute access - undefined namespace, advanced checking', function(test, options) {

        var testVal,
            correctVal;

        TP.elementSetAttribute(
                doc.documentElement, 'xforms:bind', 'yetAnotherBinder', true);

        //  Note the use of native methods/structures to verify result
        testVal = doc.documentElement.attributes.getNamedItemNS(
                                'http://www.w3.org/2002/xforms', 'bind').value;

        correctVal = 'yetAnotherBinder';

        test.assert.isEqualTo(testVal, correctVal);
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
