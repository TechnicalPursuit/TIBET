{{topic}}({{section}}) -- concatenates a package@config's resources
=============================================

## SYNOPSIS

tibet rollup [package-opts] [--headers] [--minify]

## DESCRIPTION

Creates a concatenated and optionally minified version of a `package@config`.

This command is normally invoked via `tibet build` rather than manually, however
you can use it directly if you desire.

Output from this command is written to stdout for use in redirection.
By default the output is not minified but it does it contain filename
data (aka 'headers') to assist TIBET by providing file load metadata.

You can minify output via the `--minify` flag, and turn off headers via
`--no-headers` should you choose. Normally these flags are managed by one
or more `makefile.js` targets used to build library or app-level bundles.

Note that in its current form TIBET does not play well with minifiers which
rename functions. TIBET makes extensive use of dynamic method invocations which
preclude using generic obfuscators, at least in their more agressive forms.
Future extensions to this command will support TIBET-specific obfuscations.

## OPTIONS

  * `--headers` :
    Tells the rollup process to include 'header' information which points to the
source file(s) used in the rollup. This information is necessary for certain
TIBET reflection operations at runtime.

  * `--minify` :
    Signifies that the rollup output should pass through the minification
process. Note that overly agressive obfuscation will cause TIBET code to fail.
Future additions to TIBET will support more agressive minification.

  * `[package-opts]` :
    Refers to valid options for a TIBET Package object. These include --package,
--config, --phase, --assets, etc. The package@config defaults to
`~app_cfg/main.xml` and its default config (usually @base) so your typical
configuration is built. See help on the `tibet package` command for more
information.

## EXAMPLES

### Roll up the default package@config

    $ tibet rollup

    TP.boot.$$srcPath = '~app_src/APP.hello.js';
    /**
     * @type {Namespace}
     * @summary Defines namespace-level objects and functionality for the project.
     */

    /**
     * Define the JavaScript namespace object which will hold application code.
     */
    TP.defineNamespace('APP.hello');
    ...
    ...
    TP.boot.$$srcPath = '~app_build/tags.APP.hello.app.xhtml.js';
    TP.uc('~app_tags/APP.hello.app/APP.hello.app.xhtml').setContent(
    '    <h1 tibet:tag="hello:app" class="hello">\n        Welcome to your new TIBET application!\n    </h1>\n'
    );


### Roll up application resources in minified form

    $ tibet rollup --minify

    TP.boot.$$srcPath = '~app_src/APP.hello.js';
    TP.defineNamespace('APP.hello');TP.w3.Xmlns.registerNSInfo('urn:app:hello',TP.hc('prefix','hello'));
    TP.boot.$$srcPath = '~app_src/APP.hello.Application.js';
    TP.core.Application.defineSubtype('APP.hello.Application');APP.hello.Application.Inst.defineHandler('AppDidInitialize',function(b){var a;a=TP.core.StateMachine.construct();a.defineState(null,'home');a.defineState('home','fuzzy');a.defineState('home','fluffy');a.defineState('fuzzy','fluffy');a.defineState('fluffy','fuzzy');a.defineState('fluffy');a.defineState('fuzzy');a.activate();this.setStateMachine(a);TP.sys.getLocale().registerStrings({HELLO:'Hello World!'});return this;});
    TP.boot.$$srcPath = '~app_tags/APP.hello.app/APP.hello.app.js';
    TP.tag.TemplatedTag.defineSubtype('APP.hello:app');
    TP.boot.$$srcPath = '~app_build/tags.APP.hello.app.xhtml.js';
    TP.uc('~app_tags/APP.hello.app/APP.hello.app.xhtml').setContent('    <h1 tibet:tag="hello:app" class="hello">\n        Welcome to your new TIBET application!\n    </h1>\n');
    TP.boot.$$srcPath = '~app_build/tags.APP.hello.app.css.js';
    TP.uc('~app_tags/APP.hello.app/APP.hello.app.css').setContent('/**\n * @overview \'APP.hello.app\' styles.\n */\n\n@namespace tibet url(http://www.technicalpursuit.com/1999/tibet);\n@namespace hello url(urn:tibet:hello);\n\n/**\n * If your template/compute process transforms <hello:app/> tags\n * from namespaced XML into XHTML with a tibet:tag attribute so they render\n * in the page similar to <div tibet:tag="hello:app"/> place your\n * style in rules with the following root form:\n */\n*[tibet|tag="hello:app"] {\n    /* style here for xhtml converted tags */\n}\n\n/**\n * If you don\'t transform from XML form (tags in the page remain in their\n * <hello:app/> form) use rules of this form:\n */\nhello|app {\n}\n');

## SEE ALSO

  * tibet-package(1)
  * tibet-resources(1)
