/**
 * @type {APP.{{appname}}.app}
 * @summary The root application tag for the application. This type's template
 *     is responsible for the content you see while its methods are responsible
 *     for handling events which reach the application tag (this type).
 */

TP.tag.TemplatedTag.defineSubtype('APP.{{appname}}:app');

//  The app tag is not a themed tag. By default, since the body element has a
//  'data-theme' attribute, we have to explicity say so.
//  Note how this property is TYPE_LOCAL, by design.
APP.{{appname}}.app.defineAttribute('themeURI', TP.NO_RESULT);

/*
 * For information on how to expand the functionality in this type visit:
 *
 * https://www.technicalpursuit.com/docs/index.html
 */
