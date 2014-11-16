/**
 * @type {APP.{{appname}}.compiled}
 * @synopsis A common supertype for compiled UI tags in the {{appname}} app.
 */

TP.core.UIElementNode.defineSubtype('APP.{{appname}}:compiled');

APP.demo.tag.Type.defineMethod('tagCompile',
function(aRequest) {

    /**
     * @name tagCompile
     * @synopsis Convert instances of demo:tag into their HTML representation.
     * @param {TP.sig.ShellRequest} aRequest The request containing parameters.
     */

    var elem,
        newElem;

    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    newElem = TP.xhtmlnode(
        '<h1 class="hello" tibet:tag="demo:compiled">Hello World!</h1>');

    TP.elementReplaceWith(elem, newElem);

    return;
});

/*
 * For information on how to expand the functionality in this type visit:
 *
 * https://github.com/TechnicalPursuit/TIBET/wiki/TIBET-Getting-Started
 */
