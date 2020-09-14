/*
 * APP.tibetlama:elements top-level tests.
 */

//  ------------------------------------------------------------------------

APP.tibetlama.elements.Type.describe('APP.tibetlama:elements',
function() {

    this.it('Is a TP.tag.TemplatedTag tag', function(test, options) {
        test.assert.isKindOf(APP.tibetlama.elements,
            'TP.tag.TemplatedTag');
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
