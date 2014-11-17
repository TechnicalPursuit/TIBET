/**
 * @type {APP.{{appname}}.templated}
 * @synopsis A common supertype for templated UI tags in the {{appname}} app.
 */

TP.core.ElementNode.defineSubtype('APP.{{appname}}:templated');

// Mix in templating behavior, resolving compile in favor of templating.
APP.{{appname}}.templated.addTraits(TP.core.TemplatedNode);
APP.{{appname}}.templated.resolveTrait('tagCompile', TP.core.TemplatedNode);
APP.{{appname}}.templated.finalizeTraits();

/*
 * For information on how to expand the functionality in this type visit:
 *
 * https://github.com/TechnicalPursuit/TIBET/wiki/TIBET-Getting-Started
 */
