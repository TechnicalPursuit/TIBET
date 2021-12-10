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
 * Tests for C3 linearization
 *
 * SEE examples, data, etc. at https://en.wikipedia.org/wiki/C3_linearization
 */

TP.lang.Object.defineSubtype('TP.test.OOTester');

//  ------------------------------------------------------------------------

/* eslint-disable class-methods-use-this */

TP.test.OOTester.describe('c3 tests - primitives',
function() {

    const O = 'O',
        A = 'A',
        B = 'B',
        C = 'C',
        D = 'D',
        E = 'E',
        K1 = 'K1',
        K2 = 'K2',
        K3 = 'K3',
        // Z = 'Z',
        mergeable = [
            [K1, K2, K3],
            [K1, A, B, C, O],
            [K2, D, B, E, O],
            [K3, D, A, O]
        ];

    this.it('merges for strict mode', function(test, options) {
        var list;

        list = TP.lang.RootObject.performC3Merge(mergeable);

        test.assert.isEqualTo(list, [K1, K2, K3, D, A, B, C, E, O]);
    });

    this.it('merges for tibet mode', function(test, options) {
        var list;

        list = TP.lang.RootObject.performC3Merge(mergeable);

        test.assert.isEqualTo(list, [K1, K2, K3, D, A, B, C, E, O]);
    });
});


TP.test.OOTester.describe('c3 tests - oo',
function() {

    const roots = ['TP.test.O', 'TP.lang.Object', 'TP.lang.RootObject', 'Object'];

    this.before(function() {

        //  Configure structure from:
        //  https://en.wikipedia.org/wiki/C3_linearization

        TP.lang.Object.defineSubtype('test.O');

        TP.test.O.defineSubtype('TP.test.A');
        TP.test.O.defineSubtype('TP.test.B');
        TP.test.O.defineSubtype('TP.test.C');
        TP.test.O.defineSubtype('TP.test.D');
        TP.test.O.defineSubtype('TP.test.E');

        TP.test.A.defineSubtype('TP.test.K1');
        TP.test.K1.addTraits(TP.test.B);
        TP.test.K1.addTraits(TP.test.C);

        TP.test.D.defineSubtype('TP.test.K2');
        TP.test.K2.addTraits(TP.test.B);
        TP.test.K2.addTraits(TP.test.E);

        TP.test.D.defineSubtype('TP.test.K3');
        TP.test.K3.addTraits(TP.test.A);

        TP.test.K1.defineSubtype('TP.test.Z');
        TP.test.Z.addTraits(TP.test.K2);
        TP.test.Z.addTraits(TP.test.K3);

    });

    this.it('works for O', function(test, options) {
        var list;

        list = TP.test.O.getC3ResolutionOrder(true);

        test.assert.isEqualTo(list, roots);
    });

    this.it('works for A, B, C, D, and E', function(test, options) {
        var list;

        list = TP.test.A.getC3ResolutionOrder(true);
        test.assert.isEqualTo(list, ['TP.test.A'].concat(roots));

        list = TP.test.B.getC3ResolutionOrder(true);
        test.assert.isEqualTo(list, ['TP.test.B'].concat(roots));

        list = TP.test.C.getC3ResolutionOrder(true);
        test.assert.isEqualTo(list, ['TP.test.C'].concat(roots));

        list = TP.test.D.getC3ResolutionOrder(true);
        test.assert.isEqualTo(list, ['TP.test.D'].concat(roots));

        list = TP.test.E.getC3ResolutionOrder(true);
        test.assert.isEqualTo(list, ['TP.test.E'].concat(roots));
    });

    this.it('works for K1', function(test, options) {
        var checks,
            list;

        checks = ['TP.test.K1', 'TP.test.A', 'TP.test.B', 'TP.test.C'];

        list = TP.test.K1.getC3ResolutionOrder(true);
        test.assert.isEqualTo(list, checks.concat(roots));
    });

    this.it('works for K2', function(test, options) {
        var checks,
            list;

        checks = ['TP.test.K2', 'TP.test.D', 'TP.test.B', 'TP.test.E'];

        list = TP.test.K2.getC3ResolutionOrder(true);
        test.assert.isEqualTo(list, checks.concat(roots));
    });

    this.it('works for K3', function(test, options) {
        var checks,
            list;

        checks = ['TP.test.K3', 'TP.test.D', 'TP.test.A'];

        list = TP.test.K3.getC3ResolutionOrder(true);
        test.assert.isEqualTo(list, checks.concat(roots));
    });

    this.it('works for Z', function(test, options) {
        var checks,
            list;

        checks = ['TP.test.Z', 'TP.test.K1', 'TP.test.K2', 'TP.test.K3',
            'TP.test.D', 'TP.test.A', 'TP.test.B', 'TP.test.C', 'TP.test.E'];

        list = TP.test.Z.getC3ResolutionOrder(true);
        test.assert.isEqualTo(list, checks.concat(roots));
    });

    this.it('terminates cleanly on non-determinism', function(test, options) {
        //  TODO
    }).skip();

    this.it('terminates cleanly on recursive defs', function(test, options) {
        //  TODO
    }).skip();

});


/* eslint-enable class-methods-use-this */

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
