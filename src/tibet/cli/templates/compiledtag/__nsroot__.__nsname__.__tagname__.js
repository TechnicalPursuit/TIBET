/**
 * @type { {{~nsroot~}}.{{nsname}}.{{~tagname~}} }
 * @summary A compiled tag which...
 */

//  ------------------------------------------------------------------------

TP.core.CompiledTag.defineSubtype('{{nsroot}}.{{nsname}}:{{tagname}}');

//  ------------------------------------------------------------------------

{{nsroot}}.{{nsname}}.{{tagname}}.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @method tagCompile
     * @synopsis Convert instances of the tag into their XHTML form.
     * @param {TP.sig.Request} aRequest A request containing the tag element
     *     to convert along with other optional processing parameters.
     * @returns {Element|Array<Element>} The element(s) to replace the inbound
     *     element with in the final DOM.
     */

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
