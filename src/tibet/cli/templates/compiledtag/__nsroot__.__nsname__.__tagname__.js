/**
 * @type { {{~nsroot~}}.{{nsname}}.{{~tagname~}} }
 * @summary A new tag
 */

//  ------------------------------------------------------------------------

TP.core.TemplatedTag.defineSubtype('{{nsroot}}.{{nsname}}:{{tagname}}');

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

    var elem,
        newElem;

    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    newElem = TP.xhtmlnode(
        '<h1 tibet:tag="{{nsname}}:{{tagname}}">Compiled Tag!</h1>');

    TP.elementReplaceContent(elem, newElem);

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
