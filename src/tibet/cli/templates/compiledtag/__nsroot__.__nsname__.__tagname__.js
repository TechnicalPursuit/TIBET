/**
 * @type { {{~nsroot~}}.{{nsname}}.{{~tagname~}} }
 * @summary A new tag
 */

//  ------------------------------------------------------------------------

TP.core.CompiledTag.defineSubtype('{{nsroot}}.{{nsname}}:{{tagname}}');

//  ------------------------------------------------------------------------

{{nsroot}}.{{nsname}}.{{tagname}}.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @name tagCompile
     * @synopsis Convert instances of the tag into their HTML representation.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Element} The element that this tag has become.
     */

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
