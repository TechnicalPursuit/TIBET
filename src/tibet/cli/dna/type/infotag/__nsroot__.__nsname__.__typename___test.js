/*
 * {{nsroot}}.{{nsname}}:{{typename}} top-level tests.
 */

//  ------------------------------------------------------------------------

{{nsroot}}.{{nsname}}.{{typename}}.Type.describe('{{nsroot}}.{{nsname}}:{{typename}}',
function() {

    this.it('Is a {{supertype}} tag', function(test, options) {
        test.assert.isKindOf({{nsroot}}.{{nsname}}.{{typename}},
            '{{supertype}}');
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
