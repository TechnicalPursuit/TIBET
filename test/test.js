// =============================================================================
/**
 * @fileoverview Bootstrap unit tests for the 'tibet' command line.
 * The tibet command has its own 'test' option so the purpose of the mocha-based
 * tests is to ensure that command is operating correctly. The rest of the tests
 * run within the context of TIBET itself.
 * @author idearat@technicalpursuit.com (Scott Shattuck)
 * Copyright 1999-2013 Technical Pursuit Inc., All Rights Reserved.
 */
// -----------------------------------------------------------------------------

var expect = require('chai').expect;
var CLI = require('tibet/src/cli/_cli');

describe('_cli.js', function() {

  describe('extend tests', function() {

    it('extends simple objects', function() {
        var t = {};
        var s = {a: 1};
        var o = CLI.extend(t, s);

        expect(o.a).to.equal(1);
    });

    it('extends deeper objects', function() {
        var t = {};
        var s = {a: 1, b: { c: 3}};
        var o = CLI.extend(t, s);

        expect(o.b.c).to.equal(3);
    });

    it('extends but does not overwrite', function() {
        var t = {a: 0};
        var s = {a: 1, b: { c: 3}};
        var o = CLI.extend(t, s);

        expect(o.a).to.equal(0);
    });

    it('extends but does not overwrite deeply', function() {
        var t = {a: 0, b: { c: 2}};
        var s = {a: 1, b: { c: 3}};
        var o = CLI.extend(t, s);

        expect(o.b.c).to.equal(2);
    });

    it('extends into deeper objects', function() {
        var t = {a: 0, b: { c: 2}};
        var s = {a: 1, b: { c: 3, d: 4}};
        var o = CLI.extend(t, s);

        expect(o.b.c).to.equal(2);
        expect(o.b.d).to.equal(4);
    });

    it('extends into deeper objects conditionally', function() {
        var t = {a: 0, b: { c: 2}};
        var s = {a: 1, b: 'foo'};
        var o = CLI.extend(t, s);

        expect(o.b.c).to.equal(2);
        expect(o.b.d).to.be.undefined;
    });
  });

});

// -----------------------------------------------------------------------------
// end
// =============================================================================
