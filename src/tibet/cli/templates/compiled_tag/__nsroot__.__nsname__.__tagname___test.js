/*
 * {{nsroot}}.{{nsname}}:{{tagname}} top-level tests.
 */

//  ------------------------------------------------------------------------

{{nsroot}}.{{nsname}}.{{tagname}}.describe('{{nsroot}}.{{nsname}}:{{tagname}} suite', function() {

    this.it('Is a compiled tag', function(test, options) {
        test.assert.isKindOf({{nsroot}}.{{nsname}}.{{tagname}}, 'TP.core.CompiledTag');
    });
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
