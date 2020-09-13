//  ============================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ============================================================================

/**
 * @overview Shared default configuration data. This file is loaded by both the
 *     TIBET CLI and the TIBET initialization (aka boot) script tibet_loader.js.
 *     In the CLI the values here can be overridden by the content of tibet.json
 *     while in the browser they can be altered by the URL, tibet.json, or by
 *     package configuration property tags.
 */

(function(root) {

//  ----------------------------------------------------------------------------

    var path;

    //  The CLI seems to require this.TP to pick up the global. The browser will
    //  provide a value via root.TP.
    TP = root.TP || this.TP;

    //  If we can't find the TP reference, or we're part of tibet_loader and
    //  we're loading due to a location change we exit.
    if (!TP || TP.$$nested_loader) {
        return;
    }

    //  Track whether we're inside of a Chromium extension or not. Note that
    //  this is very sensitive code given that it's happening early in the
    //  booting of TIBET. Therefore, it's very pendantic.

    //  There are two properties that we're trying to set here:
    //  1. Whether or not we're in an extension (which is different from the
    //  boot context, such as 'brower', 'electron' or 'headless');
    //  2. The top-level window, which for an extension is *never* 'top'.

    TP.inExtension = false;
    if (root.location) {
        //  If the root has a '.location' slot, that means it's a real window.
        if (root.location.protocol.slice(0, -1) === 'chrome-extension') {
            TP.topWindow = window;
            TP.inExtension = true;
        } else {
            TP.topWindow = top;
        }
    } else {
        TP.topWindow = root;
    }

    /**
     * With the setcfg function in place we can now set the baseline properties
     * required to ensure things can boot. Additional settings at the end of
     * this file cover the remaining set of configuration parameters.
     *
     * --------------- NOTE NOTE NOTE ---------------
     *
     * Don't change these here. If you must make an alteration use overrides on
     * the launch URL, in your tibet.json, or your project manifest file(s).
     */

    //  ---
    //  phase control
    //  ---

    //  under the covers booting always occurs in two phases and we manipulate
    //  the settings in these configuration properties to control manifest
    //  generation and importing. when 'single-phase' booting is requested it
    //  simply means phase two begins immediately upon completion of phase one.
    TP.sys.setcfg('boot.phase_one', null);
    TP.sys.setcfg('boot.phase_two', null);

    //  do we start with a login page?
    TP.sys.setcfg('boot.use_login', false);

    //  when using a login page do we boot in parallel, meaning we start loading
    //  the tibet code (phase one) in parallel or wait until login succeeds?
    TP.sys.setcfg('boot.parallel', false);

    //  should we skip loading path.tibet_file? default is false to load the
    //  boot.boostrap JSON file (tibet.json by default). turning this off means
    //  all parameters critical to booting must be given in the launch() call or
    //  on the URL.
    TP.sys.setcfg('boot.no_tibet_file', false);

    //  should we allow url-level overrides of setcfg parameters. by default
    //  this is true, but it can be to false during launch() invocation.
    TP.sys.setcfg('boot.no_url_args', false);


    //  ---
    //  process control
    //  ---

    //  should we log boot output to the console as well? normally false but if
    //  you're going to be pausing during startup it helps since you can avoid
    //  having to poke at the UI to see the log.
    TP.sys.setcfg('boot.console_log', false);

    //  overall deferred loading flag. when false the defer attribute is ignored
    //  and all script nodes are loaded. when true the nodes are captured in the
    //  manifest but their code isn't actually loaded during initial startup.
    TP.sys.setcfg('boot.defer', true);

    //  what threshold in milliseconds constitues something worth colorizing to
    //  draw attention to the fact it's a long-running step that may need
    //  tuning.
    TP.sys.setcfg('boot.delta_threshold', 10);

    //  maximum number of errors before we automatically stop the boot process.
    TP.sys.setcfg('boot.error_max', 20);

    //  should we treat errors in 'fatalistic' stages as truly fatal? Some apps
    //  don't care and want to continue unless it's a truly fatal error.
    TP.sys.setcfg('boot.fatalistic', false);

    //  the logging level for the boot log. best to use strings to define.
    //  values are: TRACE, DEBUG, INFO, WARN, ERROR, FATAL, SYSTEM
    TP.sys.setcfg('boot.level', 'INFO');

    //  should the boot pause once all code has loaded to allow for setting
    //  breakpoints in the debugger or other pre-uiroot processing?
    TP.sys.setcfg('boot.pause', false);

    //  should the boot pause if errors of any kind were detected? often set to
    //  true in development-stage rc files.
    TP.sys.setcfg('boot.pause_on_error', false);

    //  should we show the boot log during startup. normally we don't and we let
    //  the profile (such as developer) turn this on.
    TP.sys.setcfg('boot.show_log', false);

    //  should we terminate the boot process when we hit an error? by default we
    //  keep going in an attempt to get more information about the problem
    TP.sys.setcfg('boot.stop_onerror', false);

    //  should we show the Lama's (TIBET developer tool) UI or show the
    //  application's home page (when the Lama is loaded)? by default we show
    //  the home page.
    TP.sys.setcfg('boot.show_ide', false);

    //  allow unsupported browsers to boot but log, or force supported list.
    TP.sys.setcfg('boot.unsupported', false);

    //  list of supported boot contexts
    TP.sys.setcfg('boot.supported_contexts', [
        'browser', 'electron', 'headless'
    ]);

    //  dictionary of data used by the isSupported call in the loader to
    //  determine if a browser should be considered supported.
    TP.sys.setcfg('boot.supported_browsers', {
        chrome: [{
            major: 70
        }],
        firefox: [{
            major: 60
        }],
        fxios: [{
            major: 18
        }],
        safari: [{
            major: 10
        }]
    });

    //  the toggle key for the boot console
    TP.sys.setcfg('boot.toggle_key', 'TP.sig.DOM_Alt_Up_Up');

    //  should we boot in two phases, lib (the 'tibet' config) and then app
    //  (the 'app' config). this should be true in virtually all cases.
    TP.sys.setcfg('boot.two_phase', true);


    //  ---
    //  code roots
    //  ---

    //  what approach should we default to when no other data is available for
    //  lib root? 'apphead' sets it to app_head. 'approot' sets it to app_root.
    //  'location' sets it to the last collection/directory on window.location.
    //  'indexed' uses a string to locate an indexed point on window.location.
    //  'tibet_dir' will look for root + tibet_dir + tibet_lib. 'frozen' will
    //  look for root + tibet_inf + tibet_lib. 'script' will check the loader's
    //  script src. When using 'indexed' you need to set boot.libtest to the
    //  test string or it will default to boot.tibet_lib.
    TP.sys.setcfg('boot.libcomp', 'script');

    //  these values provide search data for the getAppHead routine, which is
    //  leveraged by both app root and lib root computations.
    TP.sys.setcfg('boot.tibet_dir', 'node_modules');
    TP.sys.setcfg('boot.tibet_lib', 'tibet');
    TP.sys.setcfg('boot.tibet_inf', 'TIBET-INF');
    TP.sys.setcfg('boot.tibet_pub', 'public');

    //  The file here is used as our source for project configuration data. If
    //  you don't want this loaded set boot.no_tibet_file to true.
    TP.sys.setcfg('boot.tibet_file', 'tibet.json');

    //  text pattern matching the load file used to check script tags during lib
    //  root computation if no other method is specified.
    TP.sys.setcfg('boot.tibet_loader', 'tibet_loader');

    //  how deep under lib_root is the tibet_loader file?
    TP.sys.setcfg('boot.loader_offset', '../../..');

    //  how far from lib_root is the headless loader?
    TP.sys.setcfg('boot.headless_offset', '../../..');

    //  Ensure we use the tibet_dir approach to computing root paths.
    TP.sys.setcfg('boot.rootcomp', 'tibet_dir');

    //  Set values we can use in boot logic to load TIBET in extensions.
    TP.sys.setcfg('boot.devtools_offset', '../../../..');
    TP.sys.setcfg('boot.devtools_root', '/');

    //  ---
    //  package/config setup
    //  ---

    //  What profile should we be loading? The setting here can directly impact
    //  which package file we use as a starting point for booting.
    TP.sys.setcfg('boot.profile', null);

    //  What package file should we load? This defaults to {{profile}}.xml where
    //  profile is taken from boot.profile.
    TP.sys.setcfg('boot.package', null);

    //  What package config do we start from? This will default to whatever is
    //  given in the boot.package file. The package tag's "default" attribute
    //  defines the config we should default to for each package.
    TP.sys.setcfg('boot.config', null);

    //  Do we filter by asset type? Default is false so we let the boot logic
    //  itself worry about filtering. (This option is largely here due to
    //  sharing code between boot logic and command-line packaging tools).
    TP.sys.setcfg('boot.assets', null);

    //  A convenient shorthand for loading fully-dynamic library source.
    TP.sys.setcfg('boot.teamtibet', false);

    //  Do we want to boot minified source alternative(s) where found? The
    //  default tibet.xml file includes unminified options for kernel/library
    //  code to assist with debugging into the framework code.
    TP.sys.setcfg('boot.minified', true);

    //  Do we want to load inlined resources? Inlined resources are generated
    //  from resource tags and placed in separate config blocks which are
    //  typically leveraged during rollup for production.
    TP.sys.setcfg('boot.inlined', true);

    //  Do we want to use the programmable browser cache? This cache is
    //  controlled by code in the boot system and driven by the same the package
    //  config files used for booting..
    TP.sys.setcfg('boot.use_cache', true);

    //  ---
    //  obsolete ???
    //  ---

    // TODO: remove this and related code. Should just go with HTTP from file
    // system in the latest browsers, or rely on simple Connect server.
    //  should we load files on mozilla using xpcom? default starts out false.
    TP.sys.setcfg('boot.moz_xpcom', false);


    //  ---
    //  boot ui components
    //  ---

    //  the ID to search for and/or generate for the UI boot console IFRAME.
    TP.sys.setcfg('boot.uiboot', 'UIBOOT');    // NOTE THE 'B' HERE!

    //  the ID to the boot icon for the current phase or error display.
    TP.sys.setcfg('boot.uiimage', 'BOOT-IMAGE');

    //  the ID to the top-level text for the current stage of the boot sequence.
    TP.sys.setcfg('boot.uihead', 'BOOT-HEAD');

    //  the ID to the second-level text for the current boot stage.
    TP.sys.setcfg('boot.uisubhead', 'BOOT-SUBHEAD');

    //  the ID to the outer console element. Usually not the actual log view.
    TP.sys.setcfg('boot.uiconsole', 'BOOT-CONSOLE');

    //  the ID to the console log view, the view we write console output to.
    TP.sys.setcfg('boot.uilog', 'BOOT-LOG');

    //  the ID to the outer progress bar element; the container, not the bar.
    TP.sys.setcfg('boot.uiprogress', 'BOOT-PROGRESS');

    //  the ID to the progress bar element; the one we set width on.
    TP.sys.setcfg('boot.uipercent', 'BOOT-PERCENT');

    //  The splash graphic layer in the boot UI.
    TP.sys.setcfg('boot.uisplash', 'BOOT-SPLASH');

    //  the ID to the post-boot command line container.
    TP.sys.setcfg('boot.uicommand', 'BOOT-COMMAND');

    //  the ID to the post-boot command line input text control.
    TP.sys.setcfg('boot.uiinput', 'BOOT-INPUT');


    //  ---
    //  ui templates
    //  ---

    TP.sys.setcfg('boot.uisection',
    '================================================================================');

    TP.sys.setcfg('boot.uisubsection',
    '--------------------------------------------------------------------------------');

    TP.sys.setcfg('boot.uichunked',
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

    //  ---
    //  color maps
    //  ---

    TP.sys.setcfg('color.mode', 'browser');     //  updated based on boot.context

    //  tty* values should be values mapping to RGB values in ansi-256-colors.
    //  Use 'fg.bg' to specify a pair, or simply 'fg' or fg (as a number) to
    //  define just the foreground color. NOTE that for tty the 'dim' entry
    //  is a modifier, not a distinct color as seen in the webchalk theme.

    //  TTY colors matching the 'chalk' softer color values
    TP.sys.setcfg('color.ttychalk.black', 236);
    TP.sys.setcfg('color.ttychalk.red', 9);
    TP.sys.setcfg('color.ttychalk.green', 10);
    TP.sys.setcfg('color.ttychalk.yellow', 11);
    TP.sys.setcfg('color.ttychalk.blue', 12);
    TP.sys.setcfg('color.ttychalk.magenta', 13);
    TP.sys.setcfg('color.ttychalk.cyan', 14);
    TP.sys.setcfg('color.ttychalk.white', 15);
    TP.sys.setcfg('color.ttychalk.gray', 8);

    TP.sys.setcfg('color.ttychalk.bgBlack', 236);
    TP.sys.setcfg('color.ttychalk.bgRed', 9);
    TP.sys.setcfg('color.ttychalk.bgGreen', 10);
    TP.sys.setcfg('color.ttychalk.bgYellow', 11);
    TP.sys.setcfg('color.ttychalk.bgBlue', 12);
    TP.sys.setcfg('color.ttychalk.bgMagenta', 13);
    TP.sys.setcfg('color.ttychalk.bgCyan', 14);
    TP.sys.setcfg('color.ttychalk.bgWhite', 15);

    TP.sys.setcfg('color.ttychalk.bgGray', 8);
    TP.sys.setcfg('color.ttychalk.fgText', 8);   //  default for bg*

    //  TTY colors matching the baseline default colors (standards)
    TP.sys.setcfg('color.default.black', 0);
    TP.sys.setcfg('color.default.red', 1);
    TP.sys.setcfg('color.default.green', 2);
    TP.sys.setcfg('color.default.yellow', 3);
    TP.sys.setcfg('color.default.blue', 4);
    TP.sys.setcfg('color.default.magenta', 5);
    TP.sys.setcfg('color.default.cyan', 6);
    TP.sys.setcfg('color.default.white', 7);
    TP.sys.setcfg('color.default.gray', 8);

    TP.sys.setcfg('color.default.bgBlack', 0);
    TP.sys.setcfg('color.default.bgRed', 1);
    TP.sys.setcfg('color.default.bgGreen', 2);
    TP.sys.setcfg('color.default.bgYellow', 3);
    TP.sys.setcfg('color.default.bgBlue', 4);
    TP.sys.setcfg('color.default.bgMagenta', 5);
    TP.sys.setcfg('color.default.bgCyan', 6);
    TP.sys.setcfg('color.default.bgWhite', 7);

    TP.sys.setcfg('color.default.bgGray', 8);      //  missing
    TP.sys.setcfg('color.default.fgText', 8);      //  default for bg*

    //  web* colors should map to web colors in either # or webcolor format.
    //  These colors are typically used by the client-side code and hence map to
    //  colors that are viable in a web browser, not a terminal.

    //  web color matching 'chalk' soft color settings
    TP.sys.setcfg('color.webchalk.dim', '#565656');
    TP.sys.setcfg('color.webchalk.black', '#2d2d2d');
    TP.sys.setcfg('color.webchalk.red', '#f58e8e');
    TP.sys.setcfg('color.webchalk.green', '#a9d3ab');
    TP.sys.setcfg('color.webchalk.yellow', '#fed37f');
    TP.sys.setcfg('color.webchalk.blue', '#7aabd4');
    TP.sys.setcfg('color.webchalk.magenta', '#d6add5');
    TP.sys.setcfg('color.webchalk.cyan', '#79d4d5');
    TP.sys.setcfg('color.webchalk.white', '#d6d6d6');
    TP.sys.setcfg('color.webchalk.gray', '#939393');

    TP.sys.setcfg('color.webchalk.bgBlack', '#2d2d2d');
    TP.sys.setcfg('color.webchalk.bgRed', '#f58e8e');
    TP.sys.setcfg('color.webchalk.bgGreen', '#a9d3ab');
    TP.sys.setcfg('color.webchalk.bgYellow', '#fed37f');
    TP.sys.setcfg('color.webchalk.bgBlue', '#7aabd4');
    TP.sys.setcfg('color.webchalk.bgMagenta', '#d6add5');
    TP.sys.setcfg('color.webchalk.bgCyan', '#79d4d5');
    TP.sys.setcfg('color.webchalk.bgWhite', '#d6d6d6');

    TP.sys.setcfg('color.webchalk.bgGray', '#939393');
    TP.sys.setcfg('color.webchalk.fgText', '#646464');   //  default for bg*

    //  Web color by name
    TP.sys.setcfg('color.webcolor.black', 'black');
    TP.sys.setcfg('color.webcolor.red', 'red');
    TP.sys.setcfg('color.webcolor.green', 'green');
    TP.sys.setcfg('color.webcolor.yellow', 'yellow');
    TP.sys.setcfg('color.webcolor.blue', 'blue');
    TP.sys.setcfg('color.webcolor.magenta', 'magenta');
    TP.sys.setcfg('color.webcolor.cyan', 'cyan');
    TP.sys.setcfg('color.webcolor.white', 'white');
    TP.sys.setcfg('color.webcolor.gray', 'gray');

    TP.sys.setcfg('color.webcolor.bgBlack', 'black');
    TP.sys.setcfg('color.webcolor.bgRed', 'red');
    TP.sys.setcfg('color.webcolor.bgGreen', 'green');
    TP.sys.setcfg('color.webcolor.bgYellow', 'yellow');
    TP.sys.setcfg('color.webcolor.bgBlue', 'blue');
    TP.sys.setcfg('color.webcolor.bgMagenta', 'magenta');
    TP.sys.setcfg('color.webcolor.bgCyan', 'cyan');
    TP.sys.setcfg('color.webcolor.bgWhite', 'white');

    TP.sys.setcfg('color.webcolor.bgGray', 'gray');
    TP.sys.setcfg('color.webcolor.fgText', 'gray');   //  used with bg*

    //  ---
    //  theme styles
    //  ---

    //  Common modifiers for theme entries
    //
    //  bold
    //  italic (not widely supported)
    //  underline
    //  inverse
    //  hidden
    //  strikethrough (not widely supported)

    //  Standard TIBET logging levels
    TP.sys.setcfg('theme.default.trace', 'gray');
    TP.sys.setcfg('theme.default.debug', 'gray');
    TP.sys.setcfg('theme.default.info', 'fgText');
    TP.sys.setcfg('theme.default.warn', 'yellow');
    TP.sys.setcfg('theme.default.error', 'red');
    TP.sys.setcfg('theme.default.fatal', 'red');
    TP.sys.setcfg('theme.default.system', 'cyan');

    //  Additional names from cli, npm, syslog from winston
    TP.sys.setcfg('theme.default.emerg', 'red');
    TP.sys.setcfg('theme.default.crit', 'red');
    TP.sys.setcfg('theme.default.warning', 'yellow');
    TP.sys.setcfg('theme.default.alert', 'yellow');
    TP.sys.setcfg('theme.default.notice', 'yellow');
    TP.sys.setcfg('theme.default.help', 'cyan');
    TP.sys.setcfg('theme.default.silly', 'magenta');
    TP.sys.setcfg('theme.default.data', 'gray');
    TP.sys.setcfg('theme.default.prompt', 'gray');
    TP.sys.setcfg('theme.default.input', 'gray');
    TP.sys.setcfg('theme.default.verbose', 'magenta');

    //  Chalk et. al. ANSI setting
    TP.sys.setcfg('theme.default.dim', 'gray');

    //  Common log entry items (datetime, timestamp, time delta, etc.)
    TP.sys.setcfg('theme.default.bracket', 'gray');
    TP.sys.setcfg('theme.default.time', 'gray');
    TP.sys.setcfg('theme.default.stamp', 'gray');
    TP.sys.setcfg('theme.default.delta', 'gray');
    TP.sys.setcfg('theme.default.slow', 'yellow');
    TP.sys.setcfg('theme.default.ms', 'magenta');
    TP.sys.setcfg('theme.default.size', 'magenta');

    //  Standard HTTP logging elements and result codes
    TP.sys.setcfg('theme.default.verb', 'green');
    TP.sys.setcfg('theme.default.url', 'underline.gray');
    TP.sys.setcfg('theme.default.1xx', 'gray');
    TP.sys.setcfg('theme.default.2xx', 'green');
    TP.sys.setcfg('theme.default.3xx', 'cyan');
    TP.sys.setcfg('theme.default.4xx', 'red');
    TP.sys.setcfg('theme.default.5xx', 'red');

    //  Common file/path output formats.
    TP.sys.setcfg('theme.default.file', 'underline.gray');
    TP.sys.setcfg('theme.default.line', 'bold.gray');

    //  Startup information for the TDS
    TP.sys.setcfg('theme.default.logo', 'gray');
    TP.sys.setcfg('theme.default.project', 'green');
    TP.sys.setcfg('theme.default.version', 'gray');
    TP.sys.setcfg('theme.default.env', 'green');
    TP.sys.setcfg('theme.default.host', 'underline.gray');

    //  Common TDS components and data items.
    TP.sys.setcfg('theme.default.tds', 'magenta');
    TP.sys.setcfg('theme.default.tws', 'magenta');
    TP.sys.setcfg('theme.default.plugin', 'magenta');
    TP.sys.setcfg('theme.default.route', 'green');
    TP.sys.setcfg('theme.default.mock', 'yellow');
    TP.sys.setcfg('theme.default.task', 'magenta');

    //  Common CLI components and data items.
    TP.sys.setcfg('theme.default.command', 'yellow');
    TP.sys.setcfg('theme.default.option', 'yellow');
    TP.sys.setcfg('theme.default.param', 'gray');

    //  Processing states
    TP.sys.setcfg('theme.default.success', 'green');
    TP.sys.setcfg('theme.default.failure', 'red');

    //  TAP output components
    TP.sys.setcfg('theme.default.comment', 'gray');
    TP.sys.setcfg('theme.default.pass', 'green');
    TP.sys.setcfg('theme.default.fail', 'red');
    TP.sys.setcfg('theme.default.skip', 'cyan');
    TP.sys.setcfg('theme.default.todo', 'yellow');

    //  Linting output elements.
    TP.sys.setcfg('theme.default.lintpass', 'underline.green');
    TP.sys.setcfg('theme.default.lintfail', 'underline.red');
    TP.sys.setcfg('theme.default.lintwarn', 'underline.yellow');

    //  Alert/confirm/prompt and stdio components.
    TP.sys.setcfg('theme.default.notify', 'yellow');
    TP.sys.setcfg('theme.default.stdin', 'green');
    TP.sys.setcfg('theme.default.stdout', 'gray');
    TP.sys.setcfg('theme.default.stderr', 'red');

    //  Markup, JSON, etc.
    TP.sys.setcfg('theme.default.angle', 'gray');
    TP.sys.setcfg('theme.default.brace', 'gray');
    TP.sys.setcfg('theme.default.tag', 'gray');
    TP.sys.setcfg('theme.default.attr', 'gray');
    TP.sys.setcfg('theme.default.equal', 'gray');
    TP.sys.setcfg('theme.default.quote', 'gray');
    TP.sys.setcfg('theme.default.key', 'gray');
    TP.sys.setcfg('theme.default.colon', 'gray');
    TP.sys.setcfg('theme.default.value', 'gray');

    //  ---
    //  light background theme
    //  ---

    //  Standard TIBET logging levels
    TP.sys.setcfg('theme.light.trace', 'gray');
    TP.sys.setcfg('theme.light.debug', 'gray');
    TP.sys.setcfg('theme.light.info', 'fgText');
    TP.sys.setcfg('theme.light.warn', 'yellow');
    TP.sys.setcfg('theme.light.error', 'red');
    TP.sys.setcfg('theme.light.fatal', 'red');
    TP.sys.setcfg('theme.light.system', 'cyan');

    //  Additional names from cli, npm, syslog from winston
    TP.sys.setcfg('theme.light.emerg', 'red');
    TP.sys.setcfg('theme.light.crit', 'red');
    TP.sys.setcfg('theme.light.warning', 'yellow');
    TP.sys.setcfg('theme.light.alert', 'yellow');
    TP.sys.setcfg('theme.light.notice', 'yellow');
    TP.sys.setcfg('theme.light.help', 'cyan');
    TP.sys.setcfg('theme.light.silly', 'magenta');
    TP.sys.setcfg('theme.light.data', 'gray');
    TP.sys.setcfg('theme.light.prompt', 'gray');
    TP.sys.setcfg('theme.light.input', 'gray');
    TP.sys.setcfg('theme.light.verbose', 'magenta');

    //  Chalk et. al. ANSI setting
    TP.sys.setcfg('theme.light.dim', 'gray');

    //  Common log entry items (datetime, timestamp, time delta, etc.)
    TP.sys.setcfg('theme.light.bracket', 'black');
    TP.sys.setcfg('theme.light.time', 'gray');
    TP.sys.setcfg('theme.light.stamp', 'gray');
    TP.sys.setcfg('theme.light.delta', 'gray');
    TP.sys.setcfg('theme.light.slow', 'yellow');
    TP.sys.setcfg('theme.light.ms', 'magenta');
    TP.sys.setcfg('theme.light.size', 'magenta');

    //  Standard HTTP logging elements and result codes
    TP.sys.setcfg('theme.light.verb', 'green');
    TP.sys.setcfg('theme.light.url', 'underline.gray');
    TP.sys.setcfg('theme.light.1xx', 'black');
    TP.sys.setcfg('theme.light.2xx', 'green');
    TP.sys.setcfg('theme.light.3xx', 'cyan');
    TP.sys.setcfg('theme.light.4xx', 'red');
    TP.sys.setcfg('theme.light.5xx', 'red');

    //  Common file/path output formats.
    TP.sys.setcfg('theme.light.file', 'underline.black');
    TP.sys.setcfg('theme.light.line', 'bold.black');

    //  Startup information for the TDS
    TP.sys.setcfg('theme.light.logo', 'gray');
    TP.sys.setcfg('theme.light.project', 'green');
    TP.sys.setcfg('theme.light.version', 'black');
    TP.sys.setcfg('theme.light.env', 'green');
    TP.sys.setcfg('theme.light.host', 'underline.black');

    //  Common TDS components and data items.
    TP.sys.setcfg('theme.light.tds', 'magenta');
    TP.sys.setcfg('theme.light.tws', 'magenta');
    TP.sys.setcfg('theme.light.plugin', 'magenta');
    TP.sys.setcfg('theme.light.route', 'green');
    TP.sys.setcfg('theme.light.mock', 'yellow');
    TP.sys.setcfg('theme.light.task', 'magenta');

    //  Common CLI components and data items.
    TP.sys.setcfg('theme.light.command', 'yellow');
    TP.sys.setcfg('theme.light.option', 'yellow');
    TP.sys.setcfg('theme.light.param', 'black');

    //  Processing states
    TP.sys.setcfg('theme.light.success', 'green');
    TP.sys.setcfg('theme.light.failure', 'red');

    //  TAP output components
    TP.sys.setcfg('theme.light.comment', 'gray');
    TP.sys.setcfg('theme.light.pass', 'green');
    TP.sys.setcfg('theme.light.fail', 'red');
    TP.sys.setcfg('theme.light.skip', 'cyan');
    TP.sys.setcfg('theme.light.todo', 'yellow');

    //  Linting output elements.
    TP.sys.setcfg('theme.light.lintpass', 'underline.green');
    TP.sys.setcfg('theme.light.lintfail', 'underline.red');
    TP.sys.setcfg('theme.light.lintwarn', 'underline.yellow');

    //  Alert/confirm/prompt and stdio components.
    TP.sys.setcfg('theme.light.notify', 'yellow');
    TP.sys.setcfg('theme.light.stdin', 'green');
    TP.sys.setcfg('theme.light.stdout', 'black');
    TP.sys.setcfg('theme.light.stderr', 'red');

    //  Markup, JSON, etc.
    TP.sys.setcfg('theme.light.angle', 'black');
    TP.sys.setcfg('theme.light.brace', 'black');
    TP.sys.setcfg('theme.light.tag', 'black');
    TP.sys.setcfg('theme.light.attr', 'black');
    TP.sys.setcfg('theme.light.equal', 'black');
    TP.sys.setcfg('theme.light.quote', 'black');
    TP.sys.setcfg('theme.light.key', 'black');
    TP.sys.setcfg('theme.light.colon', 'black');
    TP.sys.setcfg('theme.light.value', 'black');

    //  ---
    //  scheme/theme defaults
    //  ---

    TP.sys.setcfg('boot.color.scheme', 'webchalk');
    TP.sys.setcfg('boot.color.theme', 'default');

    TP.sys.setcfg('cli.color.scheme', 'default');
    TP.sys.setcfg('cli.color.theme', 'default');

    TP.sys.setcfg('tds.color.scheme', 'default');
    TP.sys.setcfg('tds.color.theme', 'default');

    //  ---
    //  browser context
    //  ---

    // Inadequate, but sufficient to help determine if we're in node, headless,
    // or a browser. Note these tests are unlikely to work in other contexts.
    if (typeof navigator === 'undefined') {

        TP.sys.setcfg('boot.context', 'nodejs');
        TP.sys.setcfg('boot.reporter', 'console');

        TP.sys.setcfg('color.mode', 'console');
        TP.sys.setcfg('log.appender', 'TP.log.BrowserAppender');

    } else if (/ Puppeteer/.test(navigator.userAgent)) {

        TP.sys.setcfg('boot.context', 'headless');
        TP.sys.setcfg('boot.reporter', 'headless');

        TP.sys.setcfg('boot.level', 'WARN');
        TP.sys.setcfg('log.level', 'WARN');

        TP.sys.setcfg('color.mode', 'console');
        TP.sys.setcfg('log.appender', 'TP.log.BrowserAppender');

    } else if (/ Electron\//.test(navigator.userAgent)) {

        TP.sys.setcfg('boot.context', 'electron');
        TP.sys.setcfg('boot.reporter', 'bootui');

        TP.sys.setcfg('color.mode', 'browser');
        TP.sys.setcfg('log.appender', 'TP.log.BrowserAppender');

    } else {

        TP.sys.setcfg('boot.context', 'browser');
        TP.sys.setcfg('boot.reporter', 'bootui');

        TP.sys.setcfg('color.mode', 'browser');
        TP.sys.setcfg('log.appender', 'TP.log.BrowserAppender');
    }

    //  ---
    //  debug properties
    //  ---

    //  turn this on to see if we're managing code via our local cache.
    TP.sys.setcfg('debug.cache', false);

    //  should the css processor trigger debugging output. FUTURE.
    TP.sys.setcfg('debug.css', false);

    //  turn this on to see debugging output containing all http status codes
    //  and header information for certain calls. this is usually sufficient
    //  to help you track down http redirection issues etc.
    TP.sys.setcfg('debug.http', false);

    //  turn this on if you're having real trouble and need to see the entire
    //  node list during boot processing, otherwise this is excessive output.
    TP.sys.setcfg('debug.node', false);

    //  turn this on if you're having trouble with locating the boot file or
    //  other files. this will output path search information that can be very
    //  helpful in tracking down a bad configuration file path definition
    TP.sys.setcfg('debug.path', true);


    //  ---
    //  project data
    //  ---

    //  the project's "identifier string", typically placed in the notifier when
    //  using a TAP-based project upon startup.
    TP.sys.setcfg('project.ident', null);

    //  what's this application called? this affects the default value of the
    //  home page that loads. NOTE that this is updated with the boot package
    //  file's project name, and can then be refined by the environment files
    TP.sys.setcfg('project.name', null);

    //  the project's version string. this can be any value, but altering it in
    //  the root package file will trigger cache refresh logic
    TP.sys.setcfg('project.version', null);

    //  the project's default start page. This is the page should be opened by
    //  the 'start' command in the CLI and in other commands/pages in the
    //  system.
    TP.sys.setcfg('project.start_page', '~app/index.html');

    //  the project's default root page. The default value is UIROOT.xhtml.
    TP.sys.setcfg('project.root_page', null);

    //  the project's default home page. The default value is home.xhtml.
    TP.sys.setcfg('project.home_page', null);

    //  the application type used for this project. default is to build the name
    //  from APP.{{appname}}.Application and fall back to TP.core.Application.
    TP.sys.setcfg('project.app_type', null);

    //  theme support. The list is all themes for the app (which end up
    //  packaged) while the default is what is set as data-theme when no
    //  other data-theme is found.
    TP.sys.setcfg('project.theme.default', null);
    TP.sys.setcfg('project.theme.list', []);

    //  the profile used for application packaging purposes. this profile will
    //  be used to compare with project metadata to identify potentially missing
    //  dependencies.
    TP.sys.setcfg('project.packaging.profile', 'main@base');

    //  ---
    //  TDS shared values. This subset is required by the client and server.
    //  ---

    TP.sys.setcfg('tds.auth.uri', '/login');
    TP.sys.setcfg('tds.cli.uri', '/_tds/cli');
    TP.sys.setcfg('tds.user.uri', '/whoami');
    TP.sys.setcfg('tds.vcard.uri', '/vcard');

    TP.sys.setcfg('tws.job.uri', '/_tws/jobs');

    //  what url does client use to connect to the TDS watch SSE endpoint (and
    //  where does the TDS watch plugin configure its route to listen).
    TP.sys.setcfg('tds.watch.uri', '/_tds/watch');

    //  what event will the TDS watch SSE endpoint send when a file changes?
    //  NOTE that this is also used in the client to map SSE event to a TIBET
    //  signal picked up by the TDSURLHandler.
    TP.sys.setcfg('tds.watch.event', 'fileChange');

    //  What URI does the client use for generic WebDAV calls? NOTE this is also
    //  where the TDS webdav plugin will register.
    TP.sys.setcfg('tds.webdav.uri', '/_tds/dav');

    //  ---
    //  users and roles (and vcards and keyrings)
    //  ---

    //  What cookie name should be used to remember username between logins.
    TP.sys.setcfg('user.cookie', 'username');

    //  Default values used to drive the DEFAULT templates for vcard and keyring
    //  data (which are used by the default User instance creation machinery).
    TP.sys.setcfg('user.default_name', 'guest');
    TP.sys.setcfg('user.default_role', 'Public');
    TP.sys.setcfg('user.default_org', 'Public');
    TP.sys.setcfg('user.default_unit', 'Public');
    TP.sys.setcfg('user.default_keyring', 'Public');

    //  What path should be used to load application keyrings? The file here is
    //  provided by default for TIBET projects.
    TP.sys.setcfg('path.app_keyrings', '~app_dat/keyrings.xml');

    //  What path should be used to load application vcards? NOTE that this is
    //  the path to a 'application file' the client will attempt to load, not to
    //  a specific user file or to the directory used for that purpose.
    TP.sys.setcfg('path.app_vcards', '~app_dat/vcards.xml');

    //  What path should be used to load library keyrings? The default is
    //  provided as a simple stub. no default keyrings are required.
    TP.sys.setcfg('path.lib_keyrings', '~lib_dat/keyrings.xml');

    //  The default location for TIBET's service vcard data.
    TP.sys.setcfg('path.lib_vcards', '~lib_dat/vcards.xml');

    //  If logins are configured and we're running in headless mode, what (JWT)
    //  token should be used in the 'tibet_token' session storage data if one
    //  cannot be found
    TP.sys.setcfg('headless.tibet_token', '');

    //  ---
    //  ui page initialization files
    //  ---

    //  the default page used to initialize an xhtml canvas or display "nothing"
    TP.sys.setcfg('path.blank_page', '~lib_xhtml/blank.xhtml');

    //  the file used to initialize a dynamically generated XML-based IFRAME.
    TP.sys.setcfg('path.iframe_page', '~app_boot/xhtml/blank.xhtml');

    //  the file used to initialize a dynamically generated XML-based IFRAME.
    TP.sys.setcfg('path.uiboot_page', '~app_boot/xhtml/UIBOOT.xhtml');

    //  the file used to initialize a dynamically generated XML-based IFRAME.
    TP.sys.setcfg('path.uiroot_page', '~app_boot/xhtml/UIROOT.xhtml');


    //  ---
    //  buffer frames
    //  ---

    if (typeof window !== 'undefined') {

        if (!window.name) {

            //  NB: This matches logic in the TP.core.Window 'instrument' method
            //  - if the window doesn't have a name and is inside of an iframe
            //  and that iframe has an id, we copy that down as the window name.
            if (window.frameElement && window.frameElement.id) {
                window.name = window.frameElement.id;
            } else {
                window.name = 'window_0';
            }
        }

        //  If this window isn't the same as the top-level window
        if (window !== TP.topWindow) {

            //  If the top-level window doesn't have a name, assign one.
            if (!TP.topWindow.name) {
                TP.topWindow.name = 'window_0';
            }

            //  TODO: This only handles one level of nesting from the top down
            //  to our window.
            path = TP.topWindow.name + '.' + window.name;
        } else {
            path = window.name;
        }

        //  As far as we're concerned, our 'top level window name' is always our
        //  window, whether it's 'top' or now.
        TP.sys.setcfg('tibet.top_win_name', window.name);

        //  The path, however, will take into account if 'top' and our window
        //  are different.
        TP.sys.setcfg('tibet.top_win_path', path);

    } else {
        TP.sys.setcfg('tibet.top_win_name', null);
        TP.sys.setcfg('tibet.top_win_path', null);
    }

    //  ---
    //  logging
    //  ---

    //  controls process reporting during the launch. setting this to true
    //  here (and/or in the package xml file) will cause a few more lines of
    //  output covering the initial parameter-setting phase of the boot process.
    //  If you're not trying to debug that you should be able to just set
    //  tibet.debug in your application build file and leave this set to false.
    TP.sys.setcfg('tibet.debug', true);

    //  lots 'o output? as with the debug flag configured here, unless you're
    //  trying to get verbose output from the property-setting phase you can
    //  leave this false here and just set tibet.verbose in your application
    //  build file.
    TP.sys.setcfg('tibet.verbose', true);


    //  ---
    //  tibet ui roots
    //  ---

    //  default conf uses UIBOOT and UIROOT installed in the context where this
    //  script is found. The UIBOOT iframe is typically set to console.html
    //  while the UIROOT value can vary between a number of values depending on
    //  whether the Lama is running (framing) and whether they want a
    //  multi-screen configuration (screens).

    //  the ID to search for and/or generate for the UI root display IFRAME.
    TP.sys.setcfg('tibet.uiroot', 'UIROOT');

    //  the ID initially assigned to be the UICANVAS virtual location.
    TP.sys.setcfg('tibet.uicanvas', 'UIROOT');

    //  the ID to search for and/or generate for multi-screen IFRAME display.
    TP.sys.setcfg('tibet.uiscreens', 'UISCREENS');

    //  the prefix to use for generated screens in a multi-screen display.
    TP.sys.setcfg('tibet.uiscreenprefix', 'SCREEN_');


    //  ---
    //  misc flags
    //  ---

    //  are we currently running 'offline' or 'online'? this setting along with
    //  the environment setting helps determine how the rewrite call looks up
    //  URI references to allow alternative servers and or storage locations.
    //  the default is to presume 'online' operation unless the user has
    //  responded to a "work offline" prompt (presumably provided by you when an
    //  HTTP connection times out with an HTTPTimeout or a similar error occurs)
    TP.sys.setcfg('tibet.offline', false);


    //  ---
    //  importer
    //  ---

    //  should we try to split and cache chunks when loading package-level
    //  chunks of code or just load/cache the package file? supporting chunks
    //  here allows later updates to happen in more small-grained fashion.
    TP.sys.setcfg('import.chunks', false);

    //  should we try to import package configuration manifest files?
    TP.sys.setcfg('import.manifests', false);

    //  should we try to load package-level blocks of code, or just files?
    TP.sys.setcfg('import.packages', false);

    //  should source be loaded from the cache without checks ('local')? other
    //  values include modified, remote, and marked.
    TP.sys.setcfg('import.source', 'local');

    //  should source import use the DOM or source text? DOM has to be used in
    //  certain cases to allow debuggers (like Firebuggy) to work properly.
    TP.sys.setcfg('import.use_dom', true);

    // TODO: remove this and all related kernel logic
    //  should autoloader metadata be imported (usually yes for production)
    TP.sys.setcfg('import.metadata', false);


    //  ---
    //  packager
    //  ---

    //  what extension should packed files have? by default just an _c.
    TP.sys.setcfg('pack.extension', '_c');


    //  ---
    //  localization
    //  ---

    //  the markup or 'hostlang' that's preferred -- XHTML
    TP.sys.setcfg('tibet.hostlang',
                    'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd');

    //  what is the current keyboard? only need to set if not U.S. English
    //  NOTE that this sets the _type_. A second parameter using the typename
    //  plus a .xml extension (TP.core.USAscii101Keyboard.xml for example) is
    //  used to point to that type's keyboard mapping file (which is in
    //  ~lib_dat by default).
    TP.sys.setcfg('tibet.keyboard', null);

    //  what is the currently active locale (in xml:lang format)
    TP.sys.setcfg('tibet.locale', null);


    //  ---
    //  version management
    //  ---

    //  path to the json file (which avoids x-domain security issues) with the
    //  latest TIBET release data for version checking the root library.
    // TP.sys.setcfg('path.lib_version_latest',
    //  'http://127.0.0.1:1234/tibet/latest.js');
    TP.sys.setcfg('path.lib_version_latest',
        'http://www.technicalpursuit.com/tibet/latest.js');

    //  path to file used as handlebars template for semver data by the tibet
    //  release CLI command.
    TP.sys.setcfg('path.release_version_template',
        '~lib/src/tibet/kernel/TIBETVersionTemplate.js');

    //  path to file used to store semver data from the tibet release command.
    TP.sys.setcfg('path.release_version_target',
        '~lib/src/tibet/kernel/TIBETVersion.js');

    //  ---
    //  virtual paths
    //  ---

    //  virtualized path definitions. these come in two primary forms: app paths
    //  and lib paths. app_* paths are used to refer to components in the
    //  application's source tree while lib_* paths refer to components in the
    //  library source tree. you should use these extensively in lieu of
    //  absolute or relative paths to further insulate your code from arbitrary
    //  directory structures which may change over time.

    //  Node.js project information.
    TP.sys.setcfg('path.npm_dir', 'node_modules');
    TP.sys.setcfg('path.npm_file', 'package.json');

    TP.sys.setcfg('path.app', '~app_root');
    TP.sys.setcfg('path.lib', '~lib_root');
    TP.sys.setcfg('path.tibet', '~lib_root');

    TP.sys.setcfg('path.tibet_lib', 'tibet');   // npm install name here.
    TP.sys.setcfg('path.tibet_file', '~app/tibet.json');
    TP.sys.setcfg('path.tibet_inf', 'TIBET-INF');

    TP.sys.setcfg('path.app_inf', '~app/' + TP.sys.cfg('path.tibet_inf'));
    TP.sys.setcfg('path.lib_inf', '~lib/' + TP.sys.cfg('path.tibet_inf'));

    //  common virtual paths
    TP.sys.setcfg('path.app_bin', '~app/bin');
    TP.sys.setcfg('path.lib_bin', '~lib/bin');

    TP.sys.setcfg('path.app_boot', '~app_inf/boot');
    TP.sys.setcfg('path.lib_boot', '~tibet_src/boot');

    TP.sys.setcfg('path.app_build', '~app/build');
    TP.sys.setcfg('path.lib_build', '~lib_lib/src');

    TP.sys.setcfg('path.app_cfg', '~app_inf/cfg');
    TP.sys.setcfg('path.lib_cfg', '~lib_lib/cfg');

    TP.sys.setcfg('path.app_cmd', '~/cmd');
    TP.sys.setcfg('path.lib_cmd', '~lib/cmd');

    TP.sys.setcfg('path.app_dat', '~app_inf/dat');
    TP.sys.setcfg('path.lib_dat', '~lib_lib/dat');

    TP.sys.setcfg('path.app_deps', '~app/deps');
    TP.sys.setcfg('path.lib_deps', '~lib/deps');

    TP.sys.setcfg('path.app_dna', '~app_inf/dna');
    TP.sys.setcfg('path.lib_dna', '~lib/dna');

    TP.sys.setcfg('path.app_etc', '~app/etc');
    TP.sys.setcfg('path.lib_etc', '~lib/etc');

    TP.sys.setcfg('path.app_lib', '~app/lib');
    TP.sys.setcfg('path.lib_lib', '~lib/lib');

    TP.sys.setcfg('path.app_fonts', '~app/fonts');
    TP.sys.setcfg('path.lib_fonts', '~lib_lib/fonts');
    TP.sys.setcfg('path.boot_fonts', '~app_boot/fonts');

    TP.sys.setcfg('path.app_media', '~app/media');
    TP.sys.setcfg('path.lib_media', '~lib_lib/media');
    TP.sys.setcfg('path.boot_media', '~app_boot/media');

    TP.sys.setcfg('path.app_npm', '~/' + TP.sys.cfg('path.npm_dir'));
    TP.sys.setcfg('path.lib_npm', '~lib/' + TP.sys.cfg('path.npm_dir'));

    TP.sys.setcfg('path.app_schema', '~app/schema');
    TP.sys.setcfg('path.lib_schema', '~lib_lib/schema');

    TP.sys.setcfg('path.app_src', '~app/src');
    TP.sys.setcfg('path.lib_src', '~lib/src');

    TP.sys.setcfg('path.app_styles', '~app/styles');
    TP.sys.setcfg('path.lib_styles', '~lib_lib/styles');
    TP.sys.setcfg('path.boot_styles', '~app_boot/styles');

    TP.sys.setcfg('path.app_tags', '~app_src/tags');

    TP.sys.setcfg('path.app_tsh', '~app_inf/tsh');
    TP.sys.setcfg('path.lib_tsh', '~lib_lib/tsh');

    TP.sys.setcfg('path.app_test', '~app/test');
    TP.sys.setcfg('path.lib_test', '~lib/test');

    TP.sys.setcfg('path.app_xhtml', '~app/xhtml');
    TP.sys.setcfg('path.lib_xhtml', '~lib_lib/xhtml');
    TP.sys.setcfg('path.boot_xhtml', '~app_boot/xhtml');

    TP.sys.setcfg('path.app_xml', '~app_inf/xml');
    TP.sys.setcfg('path.lib_xml', '~lib_lib/xml');

    TP.sys.setcfg('path.app_xsl', '~app_inf/xsl');
    TP.sys.setcfg('path.lib_xsl', '~lib_lib/xsl');

    TP.sys.setcfg('path.lib_demo', '~lib/demo');

    //  app-only virtual paths
    TP.sys.setcfg('path.app_cache', '~app_tmp/cache');
    TP.sys.setcfg('path.app_change', '~app_src/changes');
    TP.sys.setcfg('path.app_doc', '~app/docs');
    TP.sys.setcfg('path.app_log', '~/logs');
    TP.sys.setcfg('path.app_tmp', '~app_inf/tmp');
    TP.sys.setcfg('path.app_xmlbase', '~app_xhtml');

    //  These namespaces are used often enough that a shortcut is nice
    TP.sys.setcfg('path.tibet_src', '~lib_src/tibet');
    TP.sys.setcfg('path.xctrls_src', '~lib_src/xctrls');

    //  Lama (external IDE components).
    TP.sys.setcfg('path.ide_root', '~lib_src/tibet/tools/lama');
    TP.sys.setcfg('path.ide_src', '~ide_root/src');

    //  The set of lib paths that could be cached but are loaded before the
    //  cache computation has begun.
    TP.sys.setcfg('path.preboot_lib_paths',
        [
            '~lib_lib/src/tibet_loader.min.js'
        ]);

    //  The set of app paths that could be cached but are loaded before the
    //  cache computation has begun.
    TP.sys.setcfg('path.preboot_app_paths',
        [
            '~app_boot/xhtml/blank.xhtml',
            '~app_boot/xhtml/UIBOOT.xhtml',
            '~app_boot/styles/tibet_content.css',
            '~app_boot/styles/tibet_boot.css',
            '~app/styles/app.css',
            '~app_boot/media/app_logo.png',
            '~app_boot/media/nojs.png',
            '~app_boot/styles/tibet.css',
            '~app_boot/styles/tibet_intro.css',
            '~app_boot/media/tibet_world.gif',
            '~app_boot/media/tibet_logo.png',
            '~app/tibet.json'
        ]);


    //  ---
    //  api/ecma
    //  ---

    //  should add*() methods check their keys against JS/ECMA keywords etc?
    //  this can be a useful check to turn on when you're seeing strange
    //  behavior around hashes, just to make sure you're not conflicting
    //  with a built-in Javascript object, slot, or keyword of some form.
    TP.sys.setcfg('api.lint_keys', false);

    //  ---
    //  cli
    //  ---

    //  what method (browser or man page) should we try for help display?
    TP.sys.setcfg('cli.help.viewer', 'man');

    //  what is the default editor for the CLI 'open' command. Leave null
    //  to leverage OS environment variable settings.
    TP.sys.setcfg('cli.open.editor', null);

    //  define any additional (beyond the default values) extensions for js
    //  source, style (css, less, sass), and xml files. See the lint command
    //  docs for more details.
    TP.sys.setcfg('cli.lint.js_extensions', []);
    TP.sys.setcfg('cli.lint.style_extensions', []);
    TP.sys.setcfg('cli.lint.xml_extensions', []);

    //  CLI flag defaulting
    TP.sys.setcfg('cli.couch.confirm', true);       //  should couch command
                                                    //  confirm db target?
    TP.sys.setcfg('cli.tws.confirm', true);         //  should tws confirm db?

    //  ---
    //  content mgmt
    //  ---

    //  should the tag processing system autodefine prefixes that are not known?
    TP.sys.setcfg('content.autodefine_missing_prefixes', true);

    //  limit DOM replacement routines to a maximum number of elements to
    //  process unless overridden.
    TP.sys.setcfg('content.max_replace', 30);

    //  limit DOM traversal routines to a maximum number of elements to process
    //  unless overridden.
    TP.sys.setcfg('content.max_traversal', 2500);

    //  should the tag processing system retain the original nodes? By default
    //  this is true, but can be switched off for production.
    TP.sys.setcfg('content.retain_originals', true);

    //  should content objects cache their generated reps on the filesystem
    //  (and then use them)? you can use caches during development but during
    //  production we typically rely on URI rewriting to map over to cache
    //  directories/filenames at a broad level without causing extra lookup
    //  overhead checking for cache files so the default here is false.
    TP.sys.setcfg('content.use_caches', true);

    //  should transformations made by the process call checkpoint? this
    //  creates snapshots of the page at each phase of processing so it's a big
    //  drain on memory, but it can be very useful during development to help
    //  see where a transformation sequence may be going wrong
    TP.sys.setcfg('content.use_checkpoints', false);


    //  ---
    //  binding
    //  ---

    //  the data delimiter when splitting a String if one cannot be determined
    //  from the data source and is not overridden by the author
    TP.sys.setcfg('bind.value_separator', ';');


    //  ---
    //  shell
    //  ---

    //  should the TSH not report eval errors? Normally we do, but in rare
    //  cases like the TSH tests, we choose not to report them and just have the
    //  machinery return 'undefined' instead (which is then tested for).
    TP.sys.setcfg('tsh.ignore_eval_errors', false);

    //  should we warn about help entries for commands we can't find? this is
    //  currently false as we complete our command set. it can be changed to
    //  true once the initial command set is complete.
    TP.sys.setcfg('tsh.warn_extra_help', false);


    //  ---
    //  debug/error handling
    //  ---

    //  should we throw when recursion due to circular references is found.
    TP.sys.setcfg('break.circular_references', false);

    //  forward errors to standard JS handler or capture them? unfortunately
    //  this doesn't always work consistently with the IE ScriptDebugger.
    TP.sys.setcfg('debug.capture_errors', true);

    //  should objects which log errors be auto-registered for debug access?
    //  registration means TP.sys.getObjectById() will find an object by OID.
    //  This can be very useful for debugging, but is a potential memory leak.
    TP.sys.setcfg('debug.register_loggers', false);

    //  for debugging purposes we sometimes want to force DOM parse error
    //  reporting rather than relying on the calling functions to request it
    TP.sys.setcfg('debug.report_parse_errors', false);

    //  trap or throw evaluations. controls whether TIBET's shells should
    //  try/catch their eval processing. when true the eval calls are not done
    //  inside a try/catch to help error/stack data to bubble better but you
    //  have to look in the JS console (when available) for the data
    TP.sys.setcfg('debug.throw_evaluations', false);

    //  throw native JS Error on exception raises. This is OFF by default so
    //  that we don't spend all our time fighting with Firebug et. al.
    TP.sys.setcfg('debug.throw_exceptions', false);

    //  trap or throw exceptions in handlers. when throwHandlers is true the
    //  handler execution doesn't try/catch, but instead lets the exception
    //  escape to the standard JS environment, terminating subsequent handler
    //  notifications
    TP.sys.setcfg('debug.throw_handlers', false);

    //  should TIBET enforce the trapRecursion() call in logs etc.? This was
    //  required on Nav4 but isn't normally needed in IE/Moz unless you
    //  configure the stack.max_recursion setting low enough to run without
    //  triggering their built-in recursion checks.
    TP.sys.setcfg('debug.trap_recursion', false);

    //  should TIBET register objects with recursive references etc. during
    //  recursive string output operations? default is false.
    TP.sys.setcfg('debug.register_recursion', false);

    //  pop debugger if inferencing fails or is off or if an exception is
    //  raise? this is normally off but can be used to force activation of the
    //  environment's debugger (on IE/Moz) if the debugger has already opened.
    //  NOTE that firebug will open based on it's own configuration settings in
    //  response to debugger statement
    TP.sys.setcfg('debug.use_debugger', false);


    //  ---
    //  http/jsonp/webdav/websocket
    //  ---

    //  default timeout for http requests in milliseconds (15 seconds). only
    //  used for asynchronous calls.
    TP.sys.setcfg('http.timeout', 15000);

    //  when performing delete and put operations should we use the webdav
    //  methods or use POST/X-HTTP-Method-Override semantics. we default toward
    //  webdav since a) we feel that's a better enterprise approach, and b)
    //  overrides are consistent with what people are used to entering for other
    //  frameworks.
    TP.sys.setcfg('http.use_webdav', true);

    //  disallow custom 'X-' headers such as X-Requested-With for XHRs? This can
    //  affect whether CORS XHR calls do preflight requests.
    TP.sys.setcfg('http.simple_cors_only', false);

    //  how long does the jsonp call delay in constructing the script element
    //  needed to help processing jsonp calls.
    TP.sys.setcfg('jsonp.delay', 1000);

    //  the ID to search for and/or generate for JSONP access buffering.
    TP.sys.setcfg('jsonp.frame_id', 'JSONP');

    //  default timeout for websocket requests in milliseconds (15 seconds).
    TP.sys.setcfg('websocket.timeout', 15000);


    //  ---
    //  job/fork control
    //  ---

    //  the delays in milliseconds used for delayed Function calls.
    TP.sys.setcfg('queue.delay', 0);

    //  when computing intervals for certain TP.core.Job instances we need a
    //  default value for the interval. standard is "animation speed" which is
    //  10ms.
    TP.sys.setcfg('job.delay', 0);
    TP.sys.setcfg('job.interval', 10);
    TP.sys.setcfg('job.max_interval', 1000 * 60 * 10);

    //  jobs can schedule themselves using a setTimeout model or a setInterval
    //  model. the decision point between the two is defined by the heartbeat
    //  threshold, below which setInterval is used. When used, the heartbeat
    //  figure here defines what interval is used.
    TP.sys.setcfg('job.heartbeat_interval', 10);
    TP.sys.setcfg('job.heartbeat_threshold', 100);

    //  should TP.core.Job statistics be tracked by default? when true,
    //  TP.core.Job will keep statistics regarding start/stop times, delays,
    //  intervals, etc.
    TP.sys.setcfg('job.track_stats', false);


    //  ---
    //  logging/notification
    //  ---

    //  true will dump configuration data to boot log
    TP.sys.setcfg('log.bootcfg', false);

    //  true will dump environment data to boot log
    TP.sys.setcfg('log.bootenv', false);

    //  number of log message entries to buffer for INFO level. This value is
    //  used as a baseline computation point. The actual level will vary based
    //  on current logging level and this value. See $computeLogBufferSize();
    TP.sys.setcfg('log.buffer_size', 5);

    //  The type used to create logger instances. You can change if you really
    //  need to have a custom subtype of TP.log.Logger.
    TP.sys.setcfg('log.default_factory', 'TP.log.Logger');

    //  Which default formatter should be used when sending log output to the
    //  stdout routine?
    TP.sys.setcfg('log.default_format', 'tsh:pp');

    //  true will log activity in the hook file including the frames, paths, and
    //  activities undertaken to connect UI frames to the TIBET code frame.
    TP.sys.setcfg('log.hook', false);

    //  the logging level for the TP.log logging system. Set once that code has
    //  loaded during kernel startup since the levels are actual instances.
    //  values are: TRACE, DEBUG, INFO, WARN, ERROR, FATAL, SYSTEM
    TP.sys.setcfg('log.level', 'INFO');

    //  when logging is on the value here will control how large the activity
    //  log can grow before it starts eliminating the oldest entries. NOTE that
    //  the change log ignores this value as does the boot log to ensure all
    //  data for those operations is captured and maintained.
    TP.sys.setcfg('log.max_size', 1000);

    //  should TIBET logging calls actually write to the activity log? When
    //  false this effectively turns off all logging.
    TP.sys.setcfg('log.activities', true);

    //  should the core awaken call log the elements it's awakening? default is
    //  false for production, but this is very useful for debugging
    TP.sys.setcfg('log.awaken_content', false);

    //  general bind logging.
    TP.sys.setcfg('log.bind_binding', false);

    //  bind refresh operations
    TP.sys.setcfg('log.bind_refresh', false);

    //  TIBET's change controller. should changes to the code base be logged?
    //  This is typically controlled by TIBET's tools so you should leave it off
    //  here.
    TP.sys.setcfg('log.code_changes', false);

    //  should console-related signals be logged? normally not since there are
    //  quite a few of them. this is primarily a debugging flag for internal use
    TP.sys.setcfg('log.console_signals', false);


    //  what log level should trigger automatic use of the console reporter.
    //  during booting we want to ensure errors find their way to the UI even if
    //  the current reporter (boot console perhaps) isn't visible.
    TP.sys.setcfg('log.console_threshold', TP.ERROR);

    //  should we log steps in content processing? very useful during debugging
    //  when a page isn't transforming as you expect
    TP.sys.setcfg('log.content_transform', false);

    //  TIBET's CSS processor creates debugging output if desired. this output
    //  can help you see how the processor translated a particular selector
    TP.sys.setcfg('log.css_processing', false);

    //  should DOMFocusIn and DOMFocusOut be logged? normally not since these
    //  are very common and logging them can slow things down quite a bit
    TP.sys.setcfg('log.dom_focus_signals', false);

    //  should DOM ContentLoaded or DocumentLoaded be logged? normally
    //  not since these are very common and logging them can slow things down
    //  quite a bit, particularly in the console. See also
    //  signalDOMLoadedSignals which turns off signaling of these events
    TP.sys.setcfg('log.dom_loaded_signals', false);

    //  should log() calls and wrappers for TP.core.Exception signals write
    //  output?
    TP.sys.setcfg('log.errors', true);

    //  should we log history changes?
    TP.sys.setcfg('log.history', false);

    //  should the inferencer log its activity?
    TP.sys.setcfg('log.inferences', false);

    //  TIBET's IO (file and http) layers can log their activity. should they?
    TP.sys.setcfg('log.io', false);

    //  TIBET's job control subsystem can log activity. should it? normally not
    //  since most things in TIBET involving async activity are jobs so this
    //  would create a lot of additional logging
    TP.sys.setcfg('log.jobs', false);

    //  should the system log keyboard actions? this is a useful way to get
    //  keyboard codes for the particular keys being pressed which can then be
    //  mapped for observation purposes
    TP.sys.setcfg('log.keys', false);

    //  should the system log link activations? link activations can be logged
    //  when using TIBET's go2() function rather than direct href traversal
    TP.sys.setcfg('log.links', false);

    //  should signals sent prior to signaling system installation be logged?
    TP.sys.setcfg('log.load_signals', false);

    //  Turns on/off warnings regarding detached nodes in DOM traversal
    //  routines. The default is true since this implies a true bug.
    TP.sys.setcfg('log.node_detachment', true);

    //  Turns on/off warnings regarding discarded nodes in DOM append and
    //  insertBefore operations which involve fragments and documents
    TP.sys.setcfg('log.node_discarded', true);

    //  should the system log null namespace element names? this is checked
    //  during page processing to help debug transformation issues which may be
    //  leaving custom tags unprocessed. NOTE that if you're using XForms with
    //  TIBET this may be something you want to turn off since its common for
    //  instance data to be in the null namespace.
    TP.sys.setcfg('log.null_namespaces', false);

    //  should we log security privilege requests?
    TP.sys.setcfg('log.privilege_requests', false);

    //  should raise calls invoke log*()? typically yes - helps debugging.
    TP.sys.setcfg('log.raise', true);

    //  should request-related signals be logged? normally not since there are
    //  quite a few of them. this is primarily a debugging flag for internal use
    TP.sys.setcfg('log.request_signals', false);

    //  should we log route (url path) changes?
    TP.sys.setcfg('log.routes', false);

    //  should scans of object properties be logged/warned?
    TP.sys.setcfg('log.scans', false);

    //  should security requests be logged? typically yes
    TP.sys.setcfg('log.security', true);

    //  should signals be logged to support signal tracing? high overhead, but
    //  often useful during debugging to ensure the signals you expect are
    //  actually be triggered and sent to the signaling subsystem
    TP.sys.setcfg('log.signals', false);

    //  log the stack when logging signals? default is false to minimize clutter
    TP.sys.setcfg('log.signal_stack', false);

    //  if $error is called should the call stack names be included? off by
    //  default primarily due to permission requirements in Mozilla :(. Used to
    //  be useful before they went and made stack access a security issue again.
    TP.sys.setcfg('log.stack', true);

    //  when logging the call stack should we try to get file information such
    //  as filenames and line numbers for the functions?
    TP.sys.setcfg('log.stack_file_info', true);

    //  logs output from the TSH desugaring step
    TP.sys.setcfg('log.tsh_desugar', false);

    //  logs output from the TSH xmlify transformation step
    TP.sys.setcfg('log.tsh_xmlify', false);

    //  logs the input to the tshExecute step so final input can be seen
    TP.sys.setcfg('log.tsh_execute', false);

    //  logs output from the tshRunRequest
    TP.sys.setcfg('log.tsh_run', false);

    //  logs output from the TSH tokenizing step
    TP.sys.setcfg('log.tsh_tokenize', false);

    //  logs TSH processing phases when certain debugging/verbosity levels are
    //  in effect.
    TP.sys.setcfg('log.tsh_phases', false);

    //  logs any nodes which actually implement a processing phase and whose
    //  phase method is being invoked
    TP.sys.setcfg('log.tsh_phase_nodes', false);

    //  log any nodes which are skipped during processing because they didnt'
    //  implement a particular phase method
    TP.sys.setcfg('log.tsh_phase_skips', false);

    //  log signals originating from the TSH? typically not since they can be
    //  execessive during interactive command processing.
    TP.sys.setcfg('log.tsh_signals', false);

    //  log signals related to user IO. these include UserInput, UserOutput,
    //  etc. The default is false to avoid excessive overhead.
    TP.sys.setcfg('log.user_io_signals', false);

    //  should we log XPath queries? when combined with shouldLogStack this can
    //  be a useful debugging approach to track down where XPath overhead may be
    //  occurring
    TP.sys.setcfg('log.xpaths', false);


    //  ---
    //  mouse/gesture
    //  ---

    //  which button(s) can trigger drag events. Possible values are 'left',
    //  'middle' and 'right'. Note that configuring buttons other than 'left'
    //  can cause unwanted interactions depending on platform (like context
    //  menus, etc.)
    TP.sys.setcfg('mouse.drag_buttons', ['left']);

    //  how far (in pixels) the mouse has to move to start a drag operation
    TP.sys.setcfg('mouse.drag_distance', 2);

    //  how long (in ms) the event system has to wait before triggering drag
    //  events.
    TP.sys.setcfg('mouse.drag_delay', 100);

    //  how long (in ms) a hover has to wait before triggering a DOMMouseOver
    //  event.
    TP.sys.setcfg('mouse.over_delay', 0);

    //  how long (in ms) a hover has to wait before triggering a DOMMouseHover
    //  event.
    TP.sys.setcfg('mouse.hover_delay', 300);

    //  how long (in ms) a click has to wait before triggering a DOMClick event.
    TP.sys.setcfg('mouse.click_delay', 0);

    //  how long (in ms) a hover has to wait before retriggering a DOMMouseHover
    //  event.
    TP.sys.setcfg('mouse.hover_repeat', 100);


    //  ---
    //  keyboard
    //  ---

    //  how long to wait before cancelling a keyboard shortcut sequence
    TP.sys.setcfg('keyboard.shortcut_cancel_delay', 500);

    //  ---
    //  timeouts/delays
    //  ---

    TP.sys.setcfg('headless.timeout', 5000);

    TP.sys.setcfg('shell.init.delay', 10);
    TP.sys.setcfg('shell.update.delay', 1000);

    TP.sys.setcfg('content.signal.delay', 1000);

    //  ---
    //  os integration
    //  ---

    //  do commands run through the command shell run async by default?
    TP.sys.setcfg('os.exec_async', true);

    //  the time between completion checks for OS command execution, and the
    //  maximum number of times to check (so delay times repeat gives a maximum
    //  total time we'll look for output before terminating listener)
    TP.sys.setcfg('os.exec_delay', 1000);       //  one second between file
                                                //  checks
    TP.sys.setcfg('os.exec_interval', 300); //  5*60 or 5 minute job time
                                                //  max


    //  ---
    //  lama processing
    //  ---

    //  should the lama currently be active? default is true. if the code
    //  hasn't loaded it won't matter, and if it has then it'll activate.
    TP.sys.setcfg('lama.enabled', true);

    //  if the Lama is running, we use this flag to determine whether or not
    //  to autodefine tags that are not known by the system. NOTE: This flag is
    //  set to false and should *not* be set to true except by runtime
    //  machinery. Otherwise, all plain XML tags will be 'autodefined', which is
    //  definitely not what we want (especially on startup).
    TP.sys.setcfg('lama.autodefine_missing_tags', false);

    //  how many screens should the Lama display?
    TP.sys.setcfg('lama.num_screens', 1);

    //  which output formatter should be used for presentation output?
    TP.sys.setcfg('lama.default_format', 'lama:pp');

    //  what is the default depth for a lama pretty-print descent?
    TP.sys.setcfg('lama.pp.level', 2);

    //  what level do we stop doing full function bodies and do we include
    //  comments or just the method signature when we output?
    TP.sys.setcfg('lama.pp.function_level', 1);
    TP.sys.setcfg('lama.pp.function_comments', false);

    //  should the console suspend normal output?
    TP.sys.setcfg('lama.silent', false);

    //  should the console auto-login to the shell?
    TP.sys.setcfg('lama.auto_login', true);

    //  how long should the lama console wait before allowing 'eval mark'
    //  editing (in ms) ?
    TP.sys.setcfg('lama.eval_mark_time', 5000);

    //  the amount of time that the Lama should wait before clearing newly
    //  mutated nodes mutation flags
    TP.sys.setcfg('lama.mutation_flag_clear_timeout', 5000);

    //  the amount of time that the Lama should wait before clearing the
    //  'shouldProcessDOMMutations' flag. This flag is used to tell the Lama
    //  to catch DOM mutations on the current UI canvas DOM and update the
    //  corresponding source DOM
    TP.sys.setcfg('lama.mutation_track_clear_timeout', 1000);

    //  how long should the HUD wait after the last key up before resetting the
    //  keyboard/mouse readout back to info from the last mouse move event (in
    //  ms) ?
    TP.sys.setcfg('lama.readout_mouse_reset_time', 1000);

    //  the id of the element under the mark holding the prompt
    TP.sys.setcfg('lama.console_prompt', 'lamaPrompt');

    //  should the console display stack information? only for lowest-level
    //  debugging, otherwise tends to be annoying to users.
    TP.sys.setcfg('lama.console_stack', false);

    //  the amount of time that the Lama notifier will wait before fading out
    TP.sys.setcfg('lama.notifier_fadeout_delay', 1500);

    //  the amount of time that the Lama notifier will take to fade out.
    TP.sys.setcfg('lama.notifier_fadeout_duration', 1000);

    //  the toggle key for the Lama
    TP.sys.setcfg('lama.toggle_key', 'TP.sig.DOM_Alt_Up_Up');

    //  should the TIBET icon which identifies the lama:toggle be visible?
    TP.sys.setcfg('lama.show_toggle', true);

    //  the output mode that the Lama will start with - 'none', 'one' or
    //  'all'.
    TP.sys.setcfg('lama.tdc.output_mode', 'none');

    //  the amount of time that the Lama TDC will wait before fading out an
    //  output item.
    TP.sys.setcfg('lama.tdc.item_fadeout_delay', 2000);

    //  the amount of time that the Lama TDC will take to fade out an output
    //  item.
    TP.sys.setcfg('lama.tdc.item_fadeout_duration', 2000);

    //  the minimum width of an inspector item
    TP.sys.setcfg('lama.inspector.min_item_width', 200);

    //  the minimum number of inspector items when computing 'empty space'
    //  across the inspector
    TP.sys.setcfg('lama.inspector.min_item_count', 3);

    //  the ACE theme that the Lama will use for its tools (the console and
    //  editors).
    TP.sys.setcfg('lama.rich_input_theme', 'dawn');

    //  the root entries and their types in the inspector
    TP.sys.setcfg('lama.inspector_root_sources',
        [
            ['APP', 'TP.lama.AppRootInspectorSource'],
            ['Remote', 'TP.lama.RemoteRootInspectorSource'],
            ['TIBET', 'TP.lama.TIBETRootInspectorSource'],
            ['Tag Store', 'TP.lama.TWSRootInspectorSource'],
            ['Summit', 'TP.lama.TWSRootInspectorSource'],
            ['Support', 'TP.lama.SupportRootInspectorSource']
        ]);

    //  REST entries for the REST inspector
    TP.sys.setcfg('lama.inspector_rest_sources',
        [
            ['CouchDB', 'TP.lama.CouchDBRootInspectorSource'],
            ['AWS', 'TP.lama.AWSRootInspectorSource'],
            ['Salesforce', 'TP.lama.SalesforceRootInspectorSource'],
            ['TDS', 'TP.lama.TDSRootInspectorSource'],
            ['TWS', 'TP.lama.TWSRootInspectorSource']
        ]);


    //  the initial location to load into screen_0 in the Lama. Note this
    //  might be the same as 'project.homepage', but the Lama contains
    //  machinery to manually replace 'tibet:root' with the app's app tag.
    TP.sys.setcfg('path.lama_screen_0', '~boot_xhtml/home.xhtml');


    //  ---
    //  SSE support
    //  ---

    //  how often in milleseconds should we try to reconnect for dropped
    //  connections?
    TP.sys.setcfg('sse.retry', 3000);

    //  How many errors on SSE connection before UnstableConnection exception?
    TP.sys.setcfg('sse.max_errors', 20);

    //  ---
    //  tsh processing
    //  ---

    //  what is the default output formatter for the shell/console interface?
    TP.sys.setcfg('tsh.default_format', 'tsh:pp');

    //  maximum number of milliseconds in an individual lint check.
    TP.sys.setcfg('tsh.max_lint_step', 10000);
    //  maximum number of milliseconds in a comprehensive lint run.
    TP.sys.setcfg('tsh.max_lint_series', 600000);

    //  limit times for the tsh sleep command
    TP.sys.setcfg('tsh.default_sleep', 3000);
    TP.sys.setcfg('tsh.max_sleep', 3000);


    TP.sys.setcfg('tsh.split_commands', false);     //  split on semicolons?

    //  maximum number of milliseconds in an individual unit test.
    TP.sys.setcfg('tsh.max_test_step', 15000);

    //  maximum number of milliseconds in a comprehensive test run.
    TP.sys.setcfg('tsh.max_test_series', 600000);

    //  when tracing is on each individual command's status and result is pushed
    //  into a $RESULTS slot that can be inspected
    TP.sys.setcfg('tsh.trace_commands', false);


    //  ---
    //  test harness
    //  ---

    //  whether or not the test harness is currently executing
    TP.sys.setcfg('test.running', false);

    //  the test case timeout
    TP.sys.setcfg('test.case_mslimit', 10000);

    //  the test suite timeout
    TP.sys.setcfg('test.suite_mslimit', 45000);

    //  whether or not 'error' logging causes tests to fail
    TP.sys.setcfg('test.fail_on_error_log', true);

    //  the test harness 'isTesting' flag timeout. This is required because
    //  sometimes DOM mutations done by some tests but ignored by the
    //  'isTesting' flag, will come *after* the test harness has finished, This
    //  delays the reset of the 'isTesting' flag to false by a certain number
    //  of ms.
    TP.sys.setcfg('test.reset_flag_timeout', 5000);


    //  ---
    //  signaling
    //  ---

    //  should duplicate signal interest registrations be allowed? normally we
    //  prune them just as the W3C addEventListener method does.
    TP.sys.setcfg('signal.duplicate_interests', false);

    //  should signal map entries be truly removed, or merely flagged? if this
    //  is true then the flag is used and the interests remain visible but
    //  inactive which is useful for debugging
    TP.sys.setcfg('signal.ignore_via_flag', false);

    //  should TIBET hold/fire signals sent prior to signaling installation?
    TP.sys.setcfg('signal.queue_load_signals', false);

    //  should DOMFocusIn and DOMFocusOut be signaled? normally true since these
    //  are key elements of maintaining current repeat-index data and other
    //  related UI information. normally turned off only for DOM event debug.
    TP.sys.setcfg('signal.dom_focus_signals', true);

    //  should we signal ContentLoaded? this can be a performance issue in
    //  applications that change content often, or which have high levels of
    //  dependent content. In those cases it's better to code a single "final
    //  refresh" signal. NOTE that this does not turn off ContentLoaded signals
    //  coming from document objects, so you can always observe a document for
    //  ContentLoaded as part of a page startup sequence.
    TP.sys.setcfg('signal.dom_loaded', true);

    //  should we track handler invocation times across a set of signaling
    //  calls? if true, the $signal function will track stats on each call that
    //  help determine average signal handler overhead
    TP.sys.setcfg('signal.track_stats', false);


    //  ---
    //  security
    //  ---

    //  should we request privileges on Mozilla or not? when false there are
    //  certain operations that may fail, or work in a more limited fashion,
    //  particularly when running from the file system.
    TP.sys.setcfg('security.request_privileges', false);


    //  ---
    //  stack
    //  ---

    //  limit on how far back to trace when building call stacks. we leave this
    //  somewhat small to avoid overhead and show 'local context'. Larger stacks
    //  are also hard to acquire in certain circumstances.
    TP.sys.setcfg('stack.max_backtrace', 30);

    //  when calling functions like asSource(), asDisplayString(), and other
    //  naturally recursive calls this controls the number of levels which are
    //  output before we stop our descent. This helps to avoid issues with
    //  circular object containment/references.
    TP.sys.setcfg('stack.max_descent', 10);

    //  limit on stack recursion. the setting here will define when TIBET's
    //  trapRecursion() call will trigger. values here have to be pretty small
    //  to ensure the trap can function before the browser blows the stack, for
    //  example a function which does nothing but call TP.sys.trapRecursion()
    //  and then call itself will blow up in IE with a value higher than 30. At
    //  the same time TIBET has numerous stacks deeper than that so higher
    //  numbers might be necessary.
    TP.sys.setcfg('stack.max_recursion', 30);


    //  ---
    //  tibet
    //  ---

    //  should TIBET configure for plugins. Off by default. Turning this on
    //  causes configuration of any pre-configured plugin metadata. It doesn't
    //  load any plugins, that's entirely up to the UI of the application.
    TP.sys.setcfg('tibet.plugins', false);

    //  should TIBET render the 'source' representation of a Function/Method
    //  with a space between the word 'function' and the leading '(' (i.e.
    //  'function ('. The default is false (i.e. 'function(').
    TP.sys.setcfg('tibet.space_after_function_name', false);

    //  the line height to use when scrolling line-by-line. It's best that this
    //  always be given in pixels, otherwise the required conversion to pixels
    //  may cause unwanted scrolling behavior.
    TP.sys.setcfg('tibet.ui_scrolling_lineheight', '20px');

    //  the 'buffer' that scroll paging will use to 'pull back' the GUI slightly
    //  to give the user a visual cue of where they are at when scrolling whole
    //  pages. It's best that this always be given in pixels, otherwise
    //  the required conversion to pixels may cause unwanted scrolling behavior.
    TP.sys.setcfg('tibet.ui_paging_buffer', '20px');


    //  ---
    //  tibet internal
    //  ---

    //  should we cache child (subtype) names?
    TP.sys.setcfg('oo.$$cache_children', true);

    //  should we cache child (subtype) references?
    TP.sys.setcfg('oo.$$cache_cnames', true);

    //  should we cache parent (supertype) references?
    TP.sys.setcfg('oo.$$cache_parents', true);

    //  should we cache parent (supertype) names?
    TP.sys.setcfg('oo.$$cache_pnames', true);

    //  should DNU methods be constructed? this controls whether the
    //  finalization process should construct DNU backstops for methods.
    TP.sys.setcfg('oo.$$construct_dnus', true);

    //  it's occasionally useful to see what *would* have happened --
    //  particularly when using inferencing depth/strictness controls.
    TP.sys.setcfg('oo.$$invoke_inferences', true);

    //  this is OFF at startup and gets enabled once the kernel has loaded to
    //  avoid problems during startup.
    TP.sys.setcfg('oo.$$use_backstop', false);

    //  should type proxies be created? we don't do this by default.
    TP.sys.setcfg('oo.$$use_proxies', false);

    //  should inferencing be enabled.
    TP.sys.setcfg('oo.$$use_inferencing', true);

    //  should we 'auto resolve' traits?
    TP.sys.setcfg('oo.$$traits_autoresolve', true);

    //  should we warn when traits are 'auto resolved'?
    TP.sys.setcfg('oo.traits_warn', false);

    //  should TIBET enforce type uniqueness during defineSubtype operation. the
    //  default is true, but this can be flipped to allow reloading during
    //  development (with a number of caveats).
    TP.sys.setcfg('oo.unique_types', true);

    //  should invocation tracking be enabled. we don't do this by default.
    //  NOTE!!: Turning this on will cause the entire system to run slowly.
    TP.sys.setcfg('oo.$$track_invocations', false);


    //  ---
    //  tibet:root rendering control
    //  ---

    //  should a generated uiroot page include IDE framing?
    TP.sys.setcfg('tibet.uiroot_framed', false);

    //  should the current uiroot page support multiple screens?
    TP.sys.setcfg('tibet.uiroot_multi', false);

    //  what tag should be used in place of the default {{appname}}.app tag.
    TP.sys.setcfg('tibet.apptag', null);

    //  theme support specific to 'lib'. This defines the theme for the Lama
    //  as well as the theme used by xctrls when dragged in via tofu etc.
    TP.sys.setcfg('tibet.theme.default', 'tpi');
    TP.sys.setcfg('tibet.theme.list', ['tpi']);

    //  ---
    //  karma integration
    //  ---

    //  What path prefix do we expect during initial startup under Karma. If
    //  this isn't set some computations of lib/app paths may fail.
    TP.sys.setcfg('boot.karma_root', '/base');

    //  karma will launch via TIBET-INF/tibet/lib/src/tibet_loader so 5 levels
    TP.sys.setcfg('boot.karma_offset', '../../../../..');

    //  Boot parameters are nested under the karma key but pulled out and
    //  assigned to boot.* by the karma-tibet adapter.js file processing.
    TP.sys.setcfg('karma.boot.profile', 'main@developer');
    TP.sys.setcfg('karma.boot.teamtibet', false);
    TP.sys.setcfg('karma.boot.minified', true);
    TP.sys.setcfg('karma.boot.inlined', true);

    //  Path and file name of the load script to be used to launch TIBET.
    TP.sys.setcfg('karma.load_path', 'TIBET-INF/tibet/lib/src');
    TP.sys.setcfg('karma.load_script', 'tibet_loader.min.js');

    //  The test script to run including the :test prefix.
    TP.sys.setcfg('karma.script', ':test');

    TP.sys.setcfg('karma.host', '0.0.0.0');
    TP.sys.setcfg('karma.port', 9876);
    TP.sys.setcfg('karma.proxy', 9877);

    TP.sys.setcfg('karma.timeout', 60000);

    //  What slot on the launch window should we check for Karma?
    TP.sys.setcfg('karma.slot', '__karma__');

    //  ---
    //  tuning
    //  ---

    //  arrays can be sometimes be scanned for strings faster via regex so we
    //  set a threshold to tune between iteration and regex-based search
    TP.sys.setcfg('array.max_contains_loop', 50);

    //  limit on the maximum number of entries in the signal stats array, which
    //  tracks overall times for signal handler invocations
    TP.sys.setcfg('signal.max_stats', 1000);


    //  ---
    //  routing
    //  ---

    //  should we try to route any initial path content on startup?
    TP.sys.setcfg('route.onstart', true);

    //  should the base url be updated during route/pushState changes?
    TP.sys.setcfg('route.fragment_only', true);

    //  what is the name we want to use for the root path '/' ?
    TP.sys.setcfg('route.root', 'Home');

    //  ---
    //  uri/url
    //  ---

    //  should uri computations rely on fallbacks. the flags here are based on
    //  each resource type for finer control.
    TP.sys.setcfg('uri.style_fallback', true);
    TP.sys.setcfg('uri.template_fallback', true);
    TP.sys.setcfg('uri.keybindings_fallback', false);

    //  the default types used to handle URI load/save operations.
    TP.sys.setcfg('uri.handler.default', 'TP.uri.URIHandler');
    TP.sys.setcfg('uri.handler.file', 'TP.uri.FileURLHandler');
    TP.sys.setcfg('uri.handler.http', 'TP.uri.HTTPURLHandler');

    //  the default type used to handle URI rewriting decisions.
    TP.sys.setcfg('uri.rewriter', 'TP.uri.URIRewriter');

    //  the default type used to handle URI mapping decisions.
    TP.sys.setcfg('uri.mapper', 'TP.uri.URIMapper');

    //  the default type used to handle URI routing decisions.
    TP.sys.setcfg('uri.router', 'TP.uri.URIRouter');

    //  ---
    //  URI Watch
    //  ---

    //  should we take action when notified of a remote uri change?
    TP.sys.setcfg('uri.source.process_changes', false);

    //  should we watch remote resources configured to be 'watched'?
    TP.sys.setcfg('uri.source.watch_changes', false);

    //  remote resources that we should try to watch. NOTE that these should be
    //  provided as virtual paths or wildcard expressions to match effectively
    //  since they're shared between client and server.
    TP.sys.setcfg('uri.watch.include',
        ['~app_src', '~app_styles', '~app_cfg', '~app/tibet.json']);

    //  remote resources that we should try to watch. NOTE that these should
    //  be provided as virtual paths or wildcard expressions to match since
    //  they're shared between client and server.
    TP.sys.setcfg('uri.watch.exclude', ['~app/TIBET-INF/tibet', '*.bak$']);

    //  ---
    //  CouchDB
    //  ---

    //  couchdb servers known to the system.
    TP.sys.setcfg('couch.known_server_urls',
        [
            ['localhost', 'http://localhost:5984']
            // ['Another CouchDB Server', 'http://foo.com:5984']
        ]);


    //  The number of *seconds* that a connection will be authenticated in
    //  couchdb before it needs to be re-authenticated. This value should match
    //  the '[couch_httpd_auth]' value in the CouchDB configuration.
    TP.sys.setcfg('couch.auth_timeout', 600);

    //  should we watch changes from couchdb?
    TP.sys.setcfg('couch.watch.changes', false);

    //  which CouchDB change feed URLs do we want to observe?
    TP.sys.setcfg('couch.watch.feeds', [
        // '_db_updates?feed=eventsource'                         //  all server
        // '{dbname}/_changes?feed=eventsource',                  //  no docs
        // '{dbname}/_changes?feed=eventsource&include_docs=true' //  with docs
    ]);

    //  Includes/excludes for couchdb observations. Note that these are used for
    //  change notification when TIBET has been booted as a CouchApp (i.e.
    //  directly from CouchDB).
    TP.sys.setcfg('couch.watch.include',
        ['~app_src', '~app_styles', '~app_cfg', '~app/tibet.json']);
    TP.sys.setcfg('couch.watch.exclude', ['~app/TIBET-INF/tibet']);


    //  ---
    //  Amazon Web Services
    //  ---

    //  AWS services known to the system.
    TP.sys.setcfg('aws.known_services',
        [
            'S3',
            'Lambda'
        ]);

    //  AWS identity information for the TIBET 'passthrough' Serverless Lambda
    //  function
    TP.sys.setcfg('aws.passthrough.region', 'us-east-1');
    TP.sys.setcfg('aws.passthrough.apiVersion', '2015-03-31');
    TP.sys.setcfg('aws.passthrough.userPoolID', 'us-east-1_A206BoLEW');
    TP.sys.setcfg('aws.passthrough.appID', '7ibvg9a5d3f45lclk2ob9jaqc8');
    TP.sys.setcfg('aws.passthrough.identityPoolID',
                    'us-east-1:22f26cd1-9384-44d9-b6f3-7d948a4ea87b');

    //  ---
    //  Salesforce
    //  ---

    //  Salesforce services known to the system.
    TP.sys.setcfg('salesforce.known_services',
        [
            'Query'
        ]);

    TP.sys.setcfg('salesforce.query.appID',
                '3MVG9LBJLApeX_PBpOAVJZ.x1BHN1HaKOE2a4YZLv2Ipw6xMKILG3.ZzeYcVS_v8tdqTR0LjyS4drCBuANyto');
    TP.sys.setcfg('salesforce.query.redirectURI', '~lib_xhtml/blank.xhtml');

    //  ---
    //  xctrls
    //  ---

    TP.sys.setcfg('xctrls.tooltip_delay', 1000);

    //  ---
    //  xpath/xslt
    //  ---

    //  when using non-native XPaths (containing extension functions typically)
    //  we need to load the external XPath parser. Since that component is based
    //  on a non-TIBET type we can't use TIBET's autoloader so we need a path
    TP.sys.setcfg('path.xpath_parser', '~lib_deps/xpath-tpi.js');

    //  when using XSLT templates we use a boilerplate XSLT file to keep from
    //  requiring a lot of bulk in the templates themselves.
    TP.sys.setcfg('path.xslt_boilerplate',
        '~lib_src/tsh/xsl/tsh_template_template.xsl');

//  ----------------------------------------------------------------------------

}(this || global));

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
