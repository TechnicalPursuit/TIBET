/*
 * APP.tibetlama:onstars top-level tests.
 */

//  ------------------------------------------------------------------------

APP.tibetlama.onstars.Type.describe('APP.tibetlama:onstars',
function() {

    this.it('Is a TP.tag.TemplatedTag tag', function(test, options) {
        test.assert.isKindOf(APP.tibetlama.onstars,
            'TP.tag.TemplatedTag');
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
