/*
 * {{nsroot}}.{{nsname}}:{{typename}} top-level tests.
 */

//  ------------------------------------------------------------------------

{{nsroot}}.{{nsname}}.{{typename}}.describe('{{nsroot}}.{{nsname}}:{{typename}} suite',
function() {

    this.it('Is a generic type', function(test, options) {
        test.assert.isKindOf({{nsroot}}.{{nsname}}.{{typename}},
            '{{super}}');
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
