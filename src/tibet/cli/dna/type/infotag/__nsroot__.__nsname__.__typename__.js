{{{copyright}}}

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
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
