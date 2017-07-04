/*
 * {{nsroot}}.{{nsname}}:{{typename}} top-level tests.
 */

//  ------------------------------------------------------------------------

{{nsroot}}.{{nsname}}.{{typename}}.Type.describe('{{nsroot}}.{{nsname}}:{{typename}} suite',
function() {

    this.it('Is a {{super}} type', function(test, options) {
        test.assert.isKindOf({{nsroot}}.{{nsname}}.{{typename}},
            '{{super}}');
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
