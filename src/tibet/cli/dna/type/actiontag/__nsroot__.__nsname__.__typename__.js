/**
 * @type { {{~nsroot~}}.{{nsname}}.{{~typename~}} }
 * @summary {{supertype}} subtype which...
 */

//  ------------------------------------------------------------------------

{{supertype}}.defineSubtype('{{nsroot}}.{{nsname}}:{{typename}}');

//  This tag is not a themed tag. By default, since the body element has a
//  'data-theme' attribute, we have to explicity say so.
//  Note how this property is TYPE_LOCAL, by design.
{{nsroot}}.{{nsname}}.{{typename}}.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------

{{nsroot}}.{{nsname}}.{{typename}}.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Runs the receiver, effectively invoking its action.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {TP.sig.Request} The request.
     */

    aRequest.complete();

    return aRequest;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
