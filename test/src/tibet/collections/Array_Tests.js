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
 * Tests for the Array type.
 */

//  ------------------------------------------------------------------------

Array.describe('remove',
function() {

    this.it('removed all instances of primitive value', function(test, options) {
        var arr;

        arr = [1, 2, 5, 3, 4, 5];
        arr.remove(5);

        test.assert.isEqualTo(arr.length, 4);
        test.assert.isEqualTo(arr.join(''), '1234');
    });

    this.it('removed all instances of object value', function(test, options) {
        var arr,
            obja,
            objb;

        obja = {a: 1};
        objb = {b: 2};

        arr = [obja, objb, obja, obja, objb, obja];
        arr.remove(objb, TP.IDENTITY);

        test.assert.isEqualTo(arr.length, 4);
        test.assert.isEqualTo(JSON.stringify(arr),
            '[{"a":1},{"a":1},{"a":1},{"a":1}]');
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
