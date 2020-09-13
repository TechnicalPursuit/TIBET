/*
 * APP.tibetlama:app top-level tests.
 */

//  ------------------------------------------------------------------------

APP.tibetlama.app.Type.describe('APP.tibetlama:app', function() {

    this.it('Is a templated tag', function(test, options) {
        test.assert.isKindOf(APP.tibetlama.app, 'TP.tag.TemplatedTag');
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
