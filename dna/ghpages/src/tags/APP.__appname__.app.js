//  ============================================================================
//  APP.{{appname}}:app
//  ============================================================================

/**
 * @type {APP.{{appname}}.app}
 * @synopsis APP.{{appname}}.app is the application tag for this application.
 */

//  ----------------------------------------------------------------------------

TP.core.ApplicationElement.defineSubtype('APP.{{appname}}:app');

//  An example of TIBET's traits-based multiple inheritance.
APP.{{appname}}.app.addTraitsFrom(TP.core.TemplatedNode);

//  Resolve the traits right away as type methods of this type are called during
//  the application startup process (normally trait resolution happens when the
//  first instance of a type is created, but we use type-side methods before
//  instances of this type are created).
APP.{{appname}}.app.executeTraitResolution();

//  ----------------------------------------------------------------------------

APP.{{appname}}.app.Type.defineMethod('tshAwakenDOM',
function(aRequest) {

    /**
     * @name tshAwakenDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @returns {Number} The TP.DESCEND flag, telling the system to descend into
     *     the children of this element.
     */

    var elem;

    if (TP.isElement(elem = aRequest.at('cmdNode'))) {
        //  NOTE: Put logic that the tag should execute when the element is
        //  awakened in its visible DOM here...
    }

    return this.callNextMethod(aRequest);
});

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
