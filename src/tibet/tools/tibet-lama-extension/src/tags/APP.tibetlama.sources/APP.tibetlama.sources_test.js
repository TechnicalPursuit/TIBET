/*
 * APP.tibetlama:sources top-level tests.
 */

//  ------------------------------------------------------------------------

APP.tibetlama.sources.Type.describe('APP.tibetlama:sources',
function() {

    this.it('Is a TP.tag.TemplatedTag tag', function(test, options) {
        test.assert.isKindOf(APP.tibetlama.sources,
            'TP.tag.TemplatedTag');
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
