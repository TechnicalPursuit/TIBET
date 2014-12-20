/**
 * @type {APP.{{appname}}.compiled}
 * @synopsis A common supertype for compiled UI tags in the {{appname}} app.
 */

TP.core.ElementNode.defineSubtype('APP.{{appname}}:compiled');

APP.{{appname}}.compiled.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @name tagCompile
     * @synopsis Convert instances of the tag into their HTML representation.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        newElem;

    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    newElem = TP.xhtmlnode(
        '<h1 tibet:tag="{{appname}}:compiled">Compiled Tag!</h1>');

    TP.elementReplaceWith(elem, newElem);

    return;
});

/*
 * For information on how to expand the functionality in this type visit:
 *
 * https://github.com/TechnicalPursuit/TIBET/wiki/TIBET-Getting-Started
 */
