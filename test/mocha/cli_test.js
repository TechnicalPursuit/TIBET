//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 * @fileoverview Bootstrap unit tests for the 'tibet' command line.
 *     The tibet command has its own 'test' option so the purpose of the
 *     mocha-based * tests is to ensure that command is operating correctly.
 *     The rest of the tests run within the context of TIBET itself.
 */
//  ========================================================================

var expect = require('chai').expect;
var CLI = require('tibet/src/tibet/cli/_cli');

describe('_cli.js', function() {

  describe('blend tests', function() {

    it('blends simple objects', function() {
        var t = {};
        var s = {a: 1};
        var o = CLI.blend(t, s);

        expect(o.a).to.equal(1);
    });

    it('blends deeper objects', function() {
        var t = {};
        var s = {a: 1, b: { c: 3}};
        var o = CLI.blend(t, s);

        expect(o.b.c).to.equal(3);
    });

    it('blends but does not overwrite', function() {
        var t = {a: 0};
        var s = {a: 1, b: { c: 3}};
        var o = CLI.blend(t, s);

        expect(o.a).to.equal(0);
    });

    it('blends but does not overwrite deeply', function() {
        var t = {a: 0, b: { c: 2}};
        var s = {a: 1, b: { c: 3}};
        var o = CLI.blend(t, s);

        expect(o.b.c).to.equal(2);
    });

    it('blends into deeper objects', function() {
        var t = {a: 0, b: { c: 2}};
        var s = {a: 1, b: { c: 3, d: 4}};
        var o = CLI.blend(t, s);

        expect(o.b.c).to.equal(2);
        expect(o.b.d).to.equal(4);
    });

    it('blends into deeper objects conditionally', function() {
        var t = {a: 0, b: { c: 2}};
        var s = {a: 1, b: 'foo'};
        var o = CLI.blend(t, s);

        expect(o.b.c).to.equal(2);
        expect(o.b.d).to.be.undefined;
    });

    it('blends simple arrays', function() {
        var t = [];
        var s = [1, 2, 3];
        var o = CLI.blend(t, s);

        expect(o.toString()).to.equal(s.toString());
    });

    it('blends simple arrays without overwriting', function() {
        var t = [0];
        var s = [1, 2, 3];
        var o = CLI.blend(t, s);

        expect(o.toString()).to.equal([0,2,3].toString());
    });

    it('blends into deeper objects with arrays', function() {
        var t = {a: 0};
        var s = {a: 1, b: [1, 2, 3]};
        var o = CLI.blend(t, s);

        expect(o.a).to.equal(0);
        expect(o.b.toString()).to.equal([1, 2, 3].toString());
    });

    it('blends into deeper objects with arrays conditionally', function() {
        var t = {a: 0, b: [0]};
        var s = {a: 1, b: [1, 2, 3]};
        var o = CLI.blend(t, s);

        expect(o.a).to.equal(0);
        expect(o.b.toString()).to.equal([0, 2, 3].toString());
    });

    it('blends into nasty nested things', function() {
        var t = {a: 0, b: [0]};
        var s = {a: 1, b: [1, 2, {c: 3, d: 4, e: [9, 8, 7]}]};
        var o = CLI.blend(t, s);

        expect(o.b[2].e[1]).to.equal(8);
    });
  });

});

// -----------------------------------------------------------------------------
// end
// =============================================================================
