/*
 * APP.tibetlama:bindings top-level tests.
 */

//  ------------------------------------------------------------------------

APP.tibetlama.bindings.Type.describe('APP.tibetlama:bindings',
function() {

    this.it('Is a TP.tag.TemplatedTag tag', function(test, options) {
        test.assert.isKindOf(APP.tibetlama.bindings,
            'TP.tag.TemplatedTag');
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
