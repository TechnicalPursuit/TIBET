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
 * Tests for the TP.core.Hash type.
 */

//  ------------------------------------------------------------------------

TP.core.Hash.Type.describe('hash deltas',
function() {

    this.it('equal hashes produce 0 diffs', function(test, options) {
        var h1,
            h2,
            deltas;

        h1 = TP.hc('a', 1, 'b', 2, 'c', 3);
        h2 = TP.hc('a', 1, 'b', 2, 'c', 3);

        deltas = h1.deltas(h2);
        this.assert.isEqualTo(deltas.length, 0);
    });

    this.it('additions produce insert deltas', function(test, options) {
        var h1,
            h2,
            deltas;

        h1 = TP.hc('a', 1, 'b', 2, 'c', 3);
        h2 = TP.hc('a', 1, 'b', 2, 'c', 3, 'd', 4);

        deltas = h1.deltas(h2);
        this.assert.isEqualTo(deltas.length, 1);
        this.assert.isEqualTo(deltas.first().first(), 'd');
        this.assert.isEqualTo(deltas.first().at(1), 4);
        this.assert.isEqualTo(deltas.first().last(), TP.INSERT);
    });

    this.it('removals produce delete deltas', function(test, options) {
        var h1,
            h2,
            deltas;

        h1 = TP.hc('a', 1, 'b', 2, 'c', 3);
        h2 = TP.hc('a', 1, 'b', 2);

        deltas = h1.deltas(h2);
        this.assert.isEqualTo(deltas.length, 1);
        this.assert.isEqualTo(deltas.first().first(), 'c');
        this.assert.isEqualTo(deltas.first().at(1), 3);
        this.assert.isEqualTo(deltas.first().last(), TP.DELETE);
    });

    this.it('changes produce update deltas', function(test, options) {
        var h1,
            h2,
            deltas;

        h1 = TP.hc('a', 1, 'b', 2, 'c', 3);
        h2 = TP.hc('a', 1, 'b', 2, 'c', 0);

        deltas = h1.deltas(h2);
        this.assert.isEqualTo(deltas.length, 1);
        this.assert.isEqualTo(deltas.first().first(), 'c');
        this.assert.isEqualTo(deltas.first().at(1), 0);
        this.assert.isEqualTo(deltas.first().last(), TP.UPDATE);
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
