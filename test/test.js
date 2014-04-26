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

// testing the test config :)
describe('Array', function() {

  describe('#indexOf()', function() {
    it('returns -1 when the value is not present', function() {
      expect([1, 2, 3].indexOf(5)).to.equal(-1);
      expect([1, 2, 3].indexOf(0)).to.equal(-1);
    });
  });

  describe('#shift()', function() {
    it('returns the element on the front', function() {
      expect([1, 2, 3].shift()).to.equal(1);
    });
  });

  describe('#pop()', function() {
    it('returns the element on the back', function() {
      expect([1, 2, 3].shift()).to.equal(3);
    });
  });

});


// -----------------------------------------------------------------------------
// end
// =============================================================================
