{{{copyright}}}

/**
 * @type {Namespace}
 * @summary Defines namespace-level objects and functionality for the project.
 */

//  ------------------------------------------------------------------------

/**
 * Define the JavaScript namespace object which will hold application code.
 */
TP.defineNamespace('APP.{{appname}}');

/**
 * Define the XML namespace and prefix for any tags in the application.
 */
TP.w3.Xmlns.registerNSInfo('{{xmlns}}',
    TP.hc('prefix', '{{appname}}'));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
