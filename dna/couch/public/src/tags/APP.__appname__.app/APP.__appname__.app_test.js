/*
 * APP.{{appname}}:app top-level tests.
 */

//  ------------------------------------------------------------------------

APP.{{appname}}.app.Type.describe('APP.{{appname}}:app suite', function() {

    this.it('Is a templated tag', function(test, options) {
        test.assert.isKindOf(APP.{{appname}}.app, 'TP.core.TemplatedTag');
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
