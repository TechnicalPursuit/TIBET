/**
 * @type { {{~nsroot~}}.{{nsname}}.{{~typename~}} }
 * @summary A TP.core.Content subtype which...
 */

//  ------------------------------------------------------------------------

{{super}}.defineSubtype('{{nsroot}}.{{nsname}}:{{typename}}');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

{{nsroot}}.{{nsname}}.{{typename}}.Type.defineMethod('canConstruct',
function(data) {

    /**
     * @method canConstruct
     * @summary Returns true if the receiver can construct a valid instance
     *     given the parameters provided.
     * @returns {Boolean}
     */

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
