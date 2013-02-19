/**
 * @fileoverview Bootstrap unit tests for a client-side require(), which is part
 * of the baseline infrastructure for testing code on client and server.
 * @author idearat@technicalpursuit.com (Scott Shattuck)
 * Copyright 1999-2013 Technical Pursuit Inc., All Rights Reserved.
 */

/*global chai, describe, it*/

// Can't say require('chai'), that would create an inappropriate dependency on
// the object we're trying to test. But without require() our 'var assert' will
// error out in Node.js ('ReferenceError: chai is not defined.') hence our check
// per: http://timetler.com/2012/10/13/environment-detection-in-javascript/
if (typeof exports !== 'undefined' && this.exports !== exports) {
  return;
}
var assert = chai.assert;

describe('require', function() {

  describe('#require()', function() {

    it('is a function', function() {
      assert(typeof require === 'function');
    });

    it('has a cache', function() {
      assert(require.cache);
    });
  });

});

