/*
 * APP {{appname}} top-level tests.
 */

//  ------------------------------------------------------------------------

APP.describe('APP suite', function() {

    this.it('Has a namespace', function(test, options) {
        test.assert.isNamespace(APP['{{appname}}']);
    });

    this.it('Has an application type', function(test, options) {
        test.assert.isType(APP['{{appname}}']['Application']);
    });

    this.it('Has an app tag', function(test, options) {
        test.assert.isType(APP['{{appname}}']['app']);
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
