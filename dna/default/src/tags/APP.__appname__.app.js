//  ========================================================================
//  APP.{{appname}}:app
//  ========================================================================

/**
 * @type {APP.{{appname}}.app}
 * @synopsis APP.{{appname}}.app is the application tag for this application.
 */

//  ------------------------------------------------------------------------

TP.core.ApplicationElement.addSubtype('APP.{{appname}}:app');

//  ------------------------------------------------------------------------

APP.{{appname}}.app.addTypeMethod('tshAwakenDOM',
function(aRequest) {

    /**
     * @name tshAwakenDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Number} The TP.DESCEND flag, telling the system to descend into
     *     the children of this element.
     */

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

APP.{{appname}}.app.addTypeMethod('tshCompile',
function(aRequest) {

    /**
     * @name tshCompile
     * @synopsis Convert the receiver into a format suitable for inclusion in a
     *     markup DOM.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input for the shell.
     * @returns {Element} The new element.
     */

    var elem,
        newElem;

    //  Make sure that we have an element to work from.
    if (!TP.isElement(elem = aRequest.at('cmdNode'))) {
        return;
    }

    newElem = TP.nodeFromString(
        '<h1 xmlns:tibet="' + TP.w3.Xmlns.TIBET + '" ' +
            'tibet:sourcetag="{{appname}}:app">' +
            'Hello World!' +
        '</h1>');

    TP.elementReplaceWith(elem, newElem);

    return newElem;
});

