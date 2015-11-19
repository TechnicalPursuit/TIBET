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

    this.callNextMethod();

    return;
});

//  ------------------------------------------------------------------------

/*
 * For information on how to expand the functionality in this type visit:
 *
 * https://github.com/TechnicalPursuit/TIBET/wiki/TIBET-Getting-Started
 */

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
