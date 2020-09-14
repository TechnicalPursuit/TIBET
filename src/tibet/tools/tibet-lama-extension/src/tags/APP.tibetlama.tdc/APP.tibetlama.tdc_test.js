/*
 * APP.tibetlama:tdc top-level tests.
 */

//  ------------------------------------------------------------------------

APP.tibetlama.tdc.Type.describe('APP.tibetlama:tdc',
function() {

    this.it('Is a TP.tag.TemplatedTag tag', function(test, options) {
        test.assert.isKindOf(APP.tibetlama.tdc,
            'TP.tag.TemplatedTag');
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
