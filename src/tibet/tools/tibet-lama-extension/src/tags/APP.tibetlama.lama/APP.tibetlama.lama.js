/**
 * @type {APP.tibetlama.lama}
 * @summary TP.tag.TemplatedTag subtype which...
 */

//  ------------------------------------------------------------------------

TP.tag.TemplatedTag.defineSubtype('APP.tibetlama:lama');

//  This tag is not a themed tag. By default, since the body element has a
//  'data-theme' attribute, we have to explicity say so.
//  Note how this property is TYPE_LOCAL, by design.
APP.tibetlama.lama.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
