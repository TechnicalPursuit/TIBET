/*
 * APP.tibetlama:lama top-level tests.
 */

//  ------------------------------------------------------------------------

APP.tibetlama.lama.Type.describe('APP.tibetlama:lama',
function() {

    this.it('Is a TP.tag.TemplatedTag tag', function(test, options) {
        test.assert.isKindOf(APP.tibetlama.lama,
            'TP.tag.TemplatedTag');
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
