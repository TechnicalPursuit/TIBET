/*
 * APP tibetlama top-level tests.
 */

/* eslint dot-notation:0 */

//  ------------------------------------------------------------------------

APP.describe('APP', function() {

    this.it('Has a namespace', function(test, options) {
        test.assert.isNamespace(APP['tibetlama']);
    });

    this.it('Has an application type', function(test, options) {
        test.assert.isType(APP['tibetlama']['Application']);
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
