/**
 * @type {APP.{{appname}}.app}
 * @synopsis The root application tag for the application. This type's template
 *     is responsible for the content you see while its methods are responsible
 *     for handling events which reach the application controller (this type).
 */

TP.core.TemplatedApplicationTag.defineSubtype('APP.{{appname}}:app');

TP.w3.Xmlns.registerNSInfo('urn:app:{{appname}}', TP.hc('prefix', '{{appname}}'));

/*
 * For information on how to expand the functionality in this type visit:
 *
 * https://github.com/TechnicalPursuit/TIBET/wiki/TIBET-Getting-Started
 */
