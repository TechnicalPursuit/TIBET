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

//  ------------------------------------------------------------------------

TP.xml2bfjson.describe('Badgerfish - XML To JSON conversion',
function() {

    this.it('TP.xml2bfjson non-nested element test', function(test, options) {

        var val,

            testVal,
            correctVal;

        val = '<alice>bob</alice>';

        testVal = TP.xml2bfjson(TP.node(val));
        correctVal = '{"alice":{"$":"bob"}}';

        test.assert.isEqualTo(testVal, correctVal);
    });

    this.it('TP.xml2bfjson nested element test', function(test, options) {

        var val,

            testVal,
            correctVal;

        val = '<alice><bob>charlie</bob><david>edgar</david></alice>';

        testVal = TP.xml2bfjson(TP.node(val));
        correctVal = '{"alice":{"bob":{"$":"charlie"},"david":{"$":"edgar"}}}';

        test.assert.isEqualTo(testVal, correctVal);
    });

    this.it('TP.xml2bfjson multiple sibling element test', function(test, options) {

        var val,

            testVal,
            correctVal;

        val = '<alice><bob>charlie</bob><bob>david</bob></alice>';

        testVal = TP.xml2bfjson(TP.node(val));
        correctVal = '{"alice":{"bob":[{"$":"charlie"},{"$":"david"}]}}';

        test.assert.isEqualTo(testVal, correctVal);
    });

    this.it('TP.xml2bfjson default namespace test', function(test, options) {

        var val,

            testVal,
            correctVal;

        val = '<alice xmlns="http://some-namespace">bob</alice>';

        testVal = TP.xml2bfjson(TP.node(val));
        correctVal = '{"alice":{"@xmlns":{"$":"http://some-namespace"},"$":"bob"}}';

        test.assert.isEqualTo(testVal, correctVal);
    });

    this.it('TP.xml2bfjson default and prefixed namespaces test', function(test, options) {

        var val,

            testVal,
            correctVal;

        val = '<alice xmlns="http://some-namespace" xmlns:charlie="http://some-other-namespace">bob</alice>';

        testVal = TP.xml2bfjson(TP.node(val));
        correctVal = '{"alice":{"@xmlns":{"$":"http://some-namespace","charlie":"http://some-other-namespace"},"$":"bob"}}';

        test.assert.isEqualTo(testVal, correctVal);
    });

    this.it('TP.xml2bfjson prefixed elements test', function(test, options) {

        var val,

            testVal,
            correctVal;

        val = '<alice xmlns="http://some-namespace" xmlns:charlie="http://some-other-namespace"><bob>david</bob><charlie:edgar>frank</charlie:edgar></alice>';

        testVal = TP.xml2bfjson(TP.node(val));
        correctVal = '{"alice":{"@xmlns":{"$":"http://some-namespace","charlie":"http://some-other-namespace"},"bob":{"@xmlns":{"$":"http://some-namespace","charlie":"http://some-other-namespace"},"$":"david"},"charlie:edgar":{"@xmlns":{"$":"http://some-namespace","charlie":"http://some-other-namespace"},"$":"frank"}}}';

        test.assert.isEqualTo(testVal, correctVal);
    });
});

//  ------------------------------------------------------------------------

TP.bfjson2xml.describe('Badgerfish - JSON To XML conversion',
function() {

    this.it('TP.bfjson2xml non-nested element test', function(test, options) {

        var val,

            testVal,
            correctVal;

        val = '{"alice":{"$":"bob"}}';

        testVal = TP.str(TP.bfjson2xml(val));
        correctVal = '<alice>bob</alice>';

        test.assert.isEqualTo(testVal, correctVal);
    });

    this.it('TP.bfjson2xml nested element test', function(test, options) {

        var val,

            testVal,
            correctVal;

        val = '{"alice":{"bob":{"$":"charlie"},"david":{"$":"edgar"}}}';

        testVal = TP.str(TP.bfjson2xml(val));
        correctVal = '<alice><bob>charlie</bob><david>edgar</david></alice>';

        test.assert.isEqualTo(testVal, correctVal);
    });

    this.it('TP.bfjson2xml multiple sibling element test', function(test, options) {

        var val,

            testVal,
            correctVal;

        val = '{"alice":{"bob":[{"$":"charlie"},{"$":"david"}]}}';

        testVal = TP.str(TP.bfjson2xml(val));
        correctVal = '<alice><bob>charlie</bob><bob>david</bob></alice>';

        test.assert.isEqualTo(testVal, correctVal);
    });

    this.it('TP.bfjson2xml default namespace test', function(test, options) {

        var val,

            testVal,
            correctVal;

        val = '{"alice":{"@xmlns":{"$":"http://some-namespace"},"$":"bob"}}';

        testVal = TP.str(TP.bfjson2xml(val));
        correctVal = '<alice xmlns="http://some-namespace">bob</alice>';

        test.assert.isEqualTo(testVal, correctVal);
    });

    this.it('TP.bfjson2xml default and prefixed namespaces test', function(test, options) {

        var val,

            testVal,
            correctVal;

        val = '{"alice":{"@xmlns":{"$":"http://some-namespace","charlie":"http://some-other-namespace"},"$":"bob"}}';

        testVal = TP.str(TP.bfjson2xml(val));
        correctVal = '<alice xmlns="http://some-namespace" xmlns:charlie="http://some-other-namespace">bob</alice>';

        test.assert.isEqualTo(testVal, correctVal);
    });

    this.it('TP.bfjson2xml prefixed elements test', function(test, options) {

        var val,

            testVal,
            correctVal;

        val = '{"alice":{"@xmlns":{"$":"http://some-namespace","charlie":"http://some-other-namespace"},"bob":{"@xmlns":{"$":"http://some-namespace","charlie":"http://some-other-namespace"},"$":"david"},"charlie:edgar":{"@xmlns":{"$":"http://some-namespace","charlie":"http://some-other-namespace"},"$":"frank"}}}';

        testVal = TP.str(TP.bfjson2xml(val));
        correctVal = '<alice xmlns="http://some-namespace" xmlns:charlie="http://some-other-namespace"><bob>david</bob><charlie:edgar>frank</charlie:edgar></alice>';

        test.assert.isEqualTo(testVal, correctVal);
    });
});

//  ------------------------------------------------------------------------

TP.js2bfjson.describe('JavaScript to Badgerfish JSON conversion',
function() {

    this.it('TP.js2bfjson primitive property test', function(test, options) {

        var val,

            data,

            testVal,
            correctVal;

        val = '{"alice":"bob"}';

        //  Notice how we pass 'false' here for smart conversion - this routine
        //  relies on JS primitive constructs and we don't want smart conversion.
        data = TP.json2js(val, false);

        data = TP.js2bfjson(data);

        testVal = TP.str(data);
        correctVal = '{"alice":{"$":"bob"}}';

        test.assert.isEqualTo(testVal, correctVal);
    });

    this.it('TP.js2bfjson Array of primitives property test', function(test, options) {

        var val,

            data,

            testVal,
            correctVal;

        val = '{"alice":["bob","jim","joe"]}';

        //  Notice how we pass 'false' here for smart conversion - this routine
        //  relies on JS primitive constructs and we don't want smart conversion.
        data = TP.json2js(val, false);

        data = TP.js2bfjson(data);

        testVal = TP.str(data);
        correctVal = '{"alice":[{"$":"bob"},{"$":"jim"},{"$":"joe"}]}';

        test.assert.isEqualTo(testVal, correctVal);
    });

    this.it('TP.js2bfjson Object property test', function(test, options) {

        var val,

            data,

            testVal,
            correctVal;

        val = '{"alice":{"jim":"bob"}}';

        //  Notice how we pass 'false' here for smart conversion - this routine
        //  relies on JS primitive constructs and we don't want smart conversion.
        data = TP.json2js(val, false);

        data = TP.js2bfjson(data);

        testVal = TP.str(data);
        correctVal = '{"alice":{"jim":{"$":"bob"}}}';

        test.assert.isEqualTo(testVal, correctVal);
    });

    this.it('TP.js2bfjson Array of Objects property test', function(test, options) {

        var val,

            data,

            testVal,
            correctVal;

        val = '{"alice":[{"jim":"bob"},{"joe":"bob"}]}';

        //  Notice how we pass 'false' here for smart conversion - this routine
        //  relies on JS primitive constructs and we don't want smart conversion.
        data = TP.json2js(val, false);

        data = TP.js2bfjson(data);

        testVal = TP.str(data);
        correctVal = '{"alice":[{"jim":{"$":"bob"}},{"joe":{"$":"bob"}}]}';

        test.assert.isEqualTo(testVal, correctVal);
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
