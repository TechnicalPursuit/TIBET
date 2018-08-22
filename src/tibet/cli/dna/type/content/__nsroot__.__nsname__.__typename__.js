/**
 * @type { {{~nsroot~}}.{{nsname}}.{{~typename~}} }
 * @summary {{supertype}} subtype which...
 */

//  ------------------------------------------------------------------------

{{supertype}}.defineSubtype('{{nsroot}}.{{nsname}}.{{typename}}');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

{{nsroot}}.{{nsname}}.{{typename}}.Type.defineMethod('canConstruct',
function(data) {

    /**
     * @method canConstruct
     * @summary Returns true if the receiver can construct a valid instance
     *     given the parameters provided.
     * @param {Object} data The content data in question.
     * @returns {Boolean} Whether or not an instance of this can be constructed
     *     from the parameters provided.
     */

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
