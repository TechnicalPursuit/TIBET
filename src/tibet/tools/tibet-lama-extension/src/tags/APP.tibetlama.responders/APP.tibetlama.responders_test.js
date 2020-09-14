/*
 * APP.tibetlama:responders top-level tests.
 */

//  ------------------------------------------------------------------------

APP.tibetlama.responders.Type.describe('APP.tibetlama:responders',
function() {

    this.it('Is a TP.tag.TemplatedTag tag', function(test, options) {
        test.assert.isKindOf(APP.tibetlama.responders,
            'TP.tag.TemplatedTag');
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
