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

/*global TP:true*/

(function(root) {

//  ----------------------------------------------------------------------------

    //  The CLI seems to require this.TP to pick up the global. The browser will
    //  provide a value via root.TP.
    TP = root.TP || this.TP;

    //  If we can't find the TP reference, or we're part of tibet_loader and
    //  we're loading due to a location change that should route we exit.
    if (!TP || TP.$$nested_loader) {
        return;
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
    TP.sys.setcfg('boot.delta_threshold', 50);

    //  maximum number of errors before we automatically stop the boot process.
    TP.sys.setcfg('boot.error_max', 20);

    //  should we treat errors in 'fatalistic' stages as truly fatal? Some apps
    //  don't care and want to continue unless it's a truly fatal error.
    TP.sys.setcfg('boot.fatalistic', false);

    //  the logging level for the boot log. best to use strings to define.
    //  values are: TRACE, DEBUG, INFO, WARN, ERROR, SEVERE, FATAL, SYSTEM
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

    //  should we show the Sherpa's (TIBET developer tool) UI or show the
    //  application's home page (when the Sherpa is loaded)? by default we show
    //  the home page.
    TP.sys.setcfg('boot.show_ide', false);

    //  allow unsupported browsers to boot but log, or force supported list.
    TP.sys.setcfg('boot.supported', true);

    //  list of supported boot contexts
    TP.sys.setcfg('boot.supported_contexts', [
        'browser', 'electron', 'phantomjs'
    ]);

    //  dictionary of data used by the isSupported call in the loader to
    //  determine if a browser should be considered supported.
    TP.sys.setcfg('boot.supported_browsers', {
        ie: [{major: 11}],
        chrome: [{major: 39}],
        firefox: [{major: 34}],
        safari: [{major: 7}]
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

    //  how far from lib_root is the phantom loader?
    TP.sys.setcfg('boot.phantom_offset', '../../..');

    // Ensure we use the tibet_dir approach to computing root paths.
    TP.sys.setcfg('boot.rootcomp', 'tibet_dir');

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

    //  Do we want to boot the unminified source alternative(s) where found? The
    //  default tibet.xml file includes unminified options for kernel/library
    //  code to assist with debugging into the framework code.
    TP.sys.setcfg('boot.unminified', false);

    //  Do we want to boot the unpackaged source alternative(s) where found? The
    //  default tibet.xml file includes unpackaged options for kernel/library
    //  code to assist with debugging into the framework code.
    TP.sys.setcfg('boot.unpackaged', false);

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
    //  ui colors
    //  ---

    // Must use colors in the colors.js set (until we replace/expand).
    TP.sys.setcfg('log.color.trace', 'grey');
    TP.sys.setcfg('log.color.info', 'white');
    TP.sys.setcfg('log.color.warn', 'yellow');
    TP.sys.setcfg('log.color.error', 'red');
    TP.sys.setcfg('log.color.severe', 'red');
    TP.sys.setcfg('log.color.fatal', 'red');
    TP.sys.setcfg('log.color.system', 'cyan');

    TP.sys.setcfg('log.color.time', 'grey');
    TP.sys.setcfg('log.color.delta', 'grey');
    TP.sys.setcfg('log.color.slow', 'yellow');
    TP.sys.setcfg('log.color.debug', 'magenta');
    TP.sys.setcfg('log.color.verbose', 'grey');

    //  ---
    //  browser context
    //  ---

    // Inadequate, but sufficient to help determine if we're in node, Phantom,
    // or a browser. Note these tests are unlikely to work in other contexts.
    if (typeof navigator === 'undefined') {

        TP.sys.setcfg('boot.context', 'nodejs');
        TP.sys.setcfg('boot.reporter', 'console');

        TP.sys.setcfg('log.color.mode', 'terminal');
        TP.sys.setcfg('log.appender', 'TP.log.BrowserAppender');

    } else if (/PhantomJS/.test(navigator.userAgent)) {

        TP.sys.setcfg('boot.context', 'phantomjs');
        TP.sys.setcfg('boot.reporter', 'phantom');

        TP.sys.setcfg('boot.level', 'WARN');
        TP.sys.setcfg('log.level', 'WARN');

        TP.sys.setcfg('log.color.mode', 'terminal');
        TP.sys.setcfg('log.appender', 'TP.log.BrowserAppender');

    } else if (/Electron\//.test(navigator.userAgent)) {

        TP.sys.setcfg('boot.context', 'electron');
        TP.sys.setcfg('boot.reporter', 'bootui');

        TP.sys.setcfg('log.color.mode', 'browser');
        TP.sys.setcfg('log.appender', 'TP.log.BrowserAppender');

    } else {

        TP.sys.setcfg('boot.context', 'browser');
        TP.sys.setcfg('boot.reporter', 'bootui');

        TP.sys.setcfg('log.color.mode', 'browser');
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

    //  the project's default root page. The default value is UIROOT.xhtml.
    TP.sys.setcfg('project.root_page', null);

    //  the project's default home page. The default value is home.xhtml.
    TP.sys.setcfg('project.home_page', null);

    //  the application type used for this project. default is to build the name
    //  from APP.{{appname}}.Application and fall back to TP.core.Application.
    TP.sys.setcfg('project.app_type', null);

    //  the user name for the project. The default value is 'demo'. Note that
    //  there *MUST* be a corresponding vCard in the system that matches this
    //  user name in order for TIBET to work properly. Note that this must be
    //  kept in sync with 'project.user_role' and it's setting in the vCard.
    TP.sys.setcfg('project.user_name', 'demo');

    //  the role name for the user of the project. The default value is
    //  'Public', which is the role of the default user 'demo' above (as defined
    //  in the corresponding vCard for 'demo'). Note that this must be kept in
    //  sync with 'project.user_name' and it's setting in the vCard.
    TP.sys.setcfg('project.user_role', 'Public');


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
            window.name = 'window_0';
        }

        //  the window ID for a getWindowById call which will locate where to
        //  install buffer IFRAME(s) as needed.
        TP.sys.setcfg('tibet.uibuffer', window.name);

    } else {
        TP.sys.setcfg('tibet.uibuffer', null);
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
    //  whether the Sherpa is running (framing) and whether they want a
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

    //  should we verify file existence prior to injecting script nodes. the
    //  browser will often fail to report 404 issues so during development it
    //  can be nice to set this flag, or conditionally prior to trying to inject
    //  a potentially non-existent url reference. Note it does have a
    //  performance impact.
    TP.sys.setcfg('import.check_404', 'false');

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
    //  used to point to that type's keyboard mapping file (which is in ~lib_dat
    //  by default).
    TP.sys.setcfg('tibet.keyboard', null);

    //  what is the currently active locale (in xml:lang format)
    TP.sys.setcfg('tibet.locale', null);


    //  ---
    //  version management
    //  ---

    //  path to the json file (which avoids x-domain security issues) with the
    //  latest TIBET release data for version checking the root library.
    //TP.sys.setcfg('path.lib_version_file',
    //  'http://127.0.0.1:1234/tibet/latest.js');
    TP.sys.setcfg('path.lib_version_file',
        'http://www.technicalpursuit.com/tibet/latest.js');


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

    TP.sys.setcfg('path.tds_file', '~/tds.json');

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

    TP.sys.setcfg('path.app_cmd', '~app_inf/cmd');
    TP.sys.setcfg('path.lib_cmd', '~lib_lib/cmd');

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
    TP.sys.setcfg('path.app_log', '~/log');
    TP.sys.setcfg('path.app_tmp', '~app_inf/tmp');
    TP.sys.setcfg('path.app_xmlbase', '~app_xhtml');

    //  TIBET namespace source is used often enough that a shortcut is nice
    TP.sys.setcfg('path.tibet_src', '~lib_src/tibet');

    //  Console (built in to base library).
    TP.sys.setcfg('path.tdc_root', '~lib_src/tibet/tools/tdc');
    TP.sys.setcfg('path.tdc_src', '~tdc_root/src');

    //  Sherpa (external IDE components).
    TP.sys.setcfg('path.ide_root', '~lib_src/tibet/tools/sherpa');
    TP.sys.setcfg('path.ide_src', '~ide_root/src');


    //  ---
    //  api/ecma
    //  ---

    //  should add*() methods check their keys against JS/ECMA keywords etc?
    //  this can be a useful check to turn on when you're seeing strange
    //  behavior around hashes, just to make sure you're not conflicting
    //  with a built-in Javascript object, slot, or keyword of some form.
    TP.sys.setcfg('api.lint_keys', false);

    //  ---
    //  content mgmt
    //  ---

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

    //  when performing delete and put operations should we use the webdav verbs
    //  or use post/X-HTTP-Method-Override semantics. we default toward webdav
    //  since a) we feel that's a better enterprise approach, and b) overrides
    //  are consistent with what people are used to entering for other
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

    //  the delays in milliseconds used for Function.fork() calls, the
    //  typical repeat time for a repetitive fork, and typical requeue time
    TP.sys.setcfg('fork.delay', 10);
    TP.sys.setcfg('fork.interval', 5000);
    TP.sys.setcfg('fork.requeue_delay', 10);

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
    //  values are: TRACE, DEBUG, INFO, WARN, ERROR, SEVERE, FATAL, SYSTEM
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

    //  should the system log mouse actions? this is a useful way to get mouse
    //  information when debugging things like drag and drop
    TP.sys.setcfg('log.keys', false);

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

    //  how far (in pixels) the mouse has to move to start a drag operation
    TP.sys.setcfg('mouse.drag_distance', 3);

    //  how long the event system has to wait before triggering drag events.
    TP.sys.setcfg('mouse.drag_delay', 100);

    //  how long a hover has to wait before triggering a DOMMouseHover event.
    TP.sys.setcfg('mouse.hover_delay', 300);

    //  how long a click has to wait before triggering a DOMClick event.
    TP.sys.setcfg('mouse.click_delay', 0);

    //  how long a hover has to wait before retriggering a DOMMouseHover event.
    TP.sys.setcfg('mouse.hover_repeat', 100);


    //  ---
    //  keyboard
    //  ---

    //  how long to wait before cancelling a keyboard shortcut sequence
    TP.sys.setcfg('keyboard.shortcut_cancel_delay', 500);


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
    //  resources
    //  ---

    //  where is the keyring file? this file is used (by default) as the source
    //  for application keyrings used by TP.core.Role and TP.core.Unit types to
    //  associate permission "keys" with TP.core.User instances.
    TP.sys.setcfg('path.keyring_file', '~lib_dat/keyrings.xml');

    //  where is the default location for the localization string file? this
    //  path should be an absolute path using either a / or ~ prefix to
    //  reference libroot or approot respectively. this can be set in the
    //  boot script/tibet.xml files using the 'strings' parameter.
    TP.sys.setcfg('path.string_file', '~lib_dat/strings.tmx');

    //  where is the default location for the uri mappings? this path should be
    //  an absolute path using either a / or ~ prefix to reference libroot or
    //  approot respectively. this can be set in the boot script/tibet.xml files
    //  using the 'uris' parameter. A sample is in ~lib_dat/uris.xml.
    TP.sys.setcfg('path.uri_file', '~lib_dat/uris.xml');

    //  where is the default vCard file containing application vcards? this file
    //  is used (by default) as a simple way to create a small set of vcards
    //  that can be used across users. The vcard information relates users to
    //  roles, linking permissions assigned to those roles to a particular user.
    TP.sys.setcfg('path.vcard_file', '~lib_dat/vcards.xml');


    //  ---
    //  tdc processing
    //  ---

    //  which output formatter should be used for presentation output?
    TP.sys.setcfg('tdc.default_format', 'tsh:pp');

    //  what output cell template do we use by default?
    TP.sys.setcfg('tdc.default_template', 'stdio_bubble');

    TP.sys.setcfg('tdc.expanded_cells', 3);

    //  do we highlight the 'border' or the 'title' ? when processing levels
    TP.sys.setcfg('tdc.highlight', 'border');

    //  what is the maximum width for output in the TDC for titlebar content?
    TP.sys.setcfg('tdc.max_command', 70);
    TP.sys.setcfg('tdc.max_status', 40);
    TP.sys.setcfg('tdc.max_notice', 120);

    //  should the console suspend normal output?
    TP.sys.setcfg('tdc.silent', false);

    //  the toggle key for the TDC
    TP.sys.setcfg('tdc.toggle_key', 'TP.sig.DOM_Alt_Up_Up');

    //  should the TDC output collection value types during status updates?
    TP.sys.setcfg('tdc.type_collections', true);

    //  how long should the TDC wait to fade out a bubble (in milliseconds)?
    TP.sys.setcfg('tdc.bubble_fade_time', 2000);


    //  ---
    //  sherpa processing
    //  ---

    //  should the sherpa currently be active? default is true. if the code
    //  hasn't loaded it won't matter, and if it has then it'll activate.
    TP.sys.setcfg('sherpa.enabled', true);

    //  how many screens should the Sherpa display?
    TP.sys.setcfg('sherpa.num_screens', 1);

    //  which output formatter should be used for presentation output?
    TP.sys.setcfg('sherpa.default_format', 'sherpa:pp');

    //  should the console suspend normal output?
    TP.sys.setcfg('sherpa.silent', false);

    //  should the console auto-login to the shell?
    TP.sys.setcfg('sherpa.auto_login', true);

    //  how long should the sherpa console wait before allowing 'eval mark'
    //  editing (in ms) ?
    TP.sys.setcfg('sherpa.eval_mark_time', 1500);

    //  the id of the element under the mark holding the prompt
    TP.sys.setcfg('sherpa.console_prompt', 'sherpaPrompt');

    //  the toggle key for the Sherpa
    TP.sys.setcfg('sherpa.toggle_key', 'TP.sig.DOM_Alt_Up_Up');

    //  the initial location to load into screen_0 in the Sherpa. Note this
    //  might be the same as 'project.homepage', but the Sherpa contains
    //  machinery to manually replace 'tibet:root' with the app's app tag.
    TP.sys.setcfg('path.sherpa_screen_0', '~boot_xhtml/home.xhtml');

    //  ---
    //  SSE support
    //  ---

    //  How many errors on SSE connection before UnstableConnection exception?
    TP.sys.setcfg('sse.max_errors', 10);

    //  ---
    //  tds support
    //  ---

    TP.sys.setcfg('couch.app.root', 'public');
    TP.sys.setcfg('couch.app_name', 'app');
    TP.sys.setcfg('couch.db_name', null);
    TP.sys.setcfg('couch.host', '127.0.0.1');
    TP.sys.setcfg('couch.port', '5984');
    TP.sys.setcfg('couch.scheme', 'http');

    TP.sys.setcfg('couch.watch.feed', 'continuous');
    TP.sys.setcfg('couch.watch.heartbeat', 500);
    TP.sys.setcfg('couch.watch.ignore', ['node_modules', 'TIBET-INF/tibet']);
    TP.sys.setcfg('couch.watch.inactivity_ms', null);
    TP.sys.setcfg('couch.watch.initial_retry_delay', 1000);
    TP.sys.setcfg('couch.watch.max_retry_seconds', 360);
    TP.sys.setcfg('couch.watch.response_grace_time', 5000);
    TP.sys.setcfg('couch.watch.root', '~app');
    TP.sys.setcfg('couch.watch.since', 'now');

    TP.sys.setcfg('tds.auth.strategy', 'local');

    TP.sys.setcfg('tds.cli.uri', '/tds/cli');

    TP.sys.setcfg('tds.cookie.key', 'T1B3TS3SS10N');   // change this too :)

    TP.sys.setcfg('tds.log.count', 5);
    TP.sys.setcfg('tds.log.file', '~app_log/tds.log');
    TP.sys.setcfg('tds.log.format', 'dev');
    TP.sys.setcfg('tds.log.level', 'info');
    TP.sys.setcfg('tds.log.routes', false);
    TP.sys.setcfg('tds.log.size', 5242880); // 5MB

    TP.sys.setcfg('tds.max_bodysize', '5mb');

    TP.sys.setcfg('tds.patch.root', '~');
    TP.sys.setcfg('tds.patch.uri', '/tds/patch');

    //  NOTE we do _not_ default this here so env.PORT etc can be used when the
    //  parameter isn't being explicitly set. 1407 is hardcoded in server.js.
    TP.sys.setcfg('tds.port', null);

    TP.sys.setcfg('tds.pouch.prefix', './pouch/');
    TP.sys.setcfg('tds.pouch.route', '/db');

    TP.sys.setcfg('tds.secret.key', 'ThisIsNotSecureChangeIt');

    TP.sys.setcfg('tds.session.key', 'T1B3TS3SS10N');   // change this too :)
    TP.sys.setcfg('tds.session.store', 'memory');

    TP.sys.setcfg('tds.stop_onerror', true);

    TP.sys.setcfg('tds.use.cli', false);
    TP.sys.setcfg('tds.use.couch', false);
    TP.sys.setcfg('tds.use.patch', false);
    TP.sys.setcfg('tds.use.pouch', false);
    TP.sys.setcfg('tds.use.watch', false);
    TP.sys.setcfg('tds.use.webdav', false);

    TP.sys.setcfg('tds.watch.event', 'fileChange');
    TP.sys.setcfg('tds.watch.heartbeat', 10000);
    TP.sys.setcfg('tds.watch.ignore', ['node_modules', 'TIBET-INF/tibet']);
    TP.sys.setcfg('tds.watch.root', '~app');
    TP.sys.setcfg('tds.watch.uri', '/tds/watch');

    TP.sys.setcfg('tds.webdav.mount', '/');
    TP.sys.setcfg('tds.webdav.root', '~app');
    TP.sys.setcfg('tds.webdav.uri', '/tds/webdav');

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
    TP.sys.setcfg('test.case_mslimit', 5000);

    //  the test suite timeout
    TP.sys.setcfg('test.suite_mslimit', 30000);

    //  how long should we wait to give the GUI event thread a chance to be
    //  serviced? This is used in the testing and automation frameworks to
    //  prevent the Promise machinery from starving the event loop.
    TP.sys.setcfg('test.anti_starve_timeout', 10);


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


    //  ---
    //  tibet:root rendering control
    //  ---

    //  should a generated uiroot page include IDE framing?
    TP.sys.setcfg('tibet.uiroot_framed', false);

    //  should the current uiroot page support multiple screens?
    TP.sys.setcfg('tibet.uiroot_multi', false);

    //  what tag should be used in place of the default {{appname}}.app tag.
    TP.sys.setcfg('tibet.apptag', null);

    //  should the TDC currently be active? default is false.
    TP.sys.setcfg('tibet.tdc', false);

    //  what CSS theme should we use? default is none.
    TP.sys.setcfg('tibet.theme', null);

    //  what path should be opened by the 'start' command in the CLI?
    TP.sys.setcfg('path.start_page', '~app/index.html');

    //  ---
    //  karma integration
    //  ---

    //  What path prefix do we expect during initial startup under Karma. If
    //  this isn't set some computations of lib/app paths may fail.
    TP.sys.setcfg('boot.karma_root', 'base');

    //  Boot parameters are nested under the karma key but pulled out and
    //  assigned to boot.* by the karma-tibet adapter.js file processing.
    TP.sys.setcfg('karma.boot.profile', 'app#contributor');
    TP.sys.setcfg('karma.boot.unminified', false);
    TP.sys.setcfg('karma.boot.unpackaged', false);

    //  The test script to run including the :test prefix.
    TP.sys.setcfg('karma.script', ':test');

    TP.sys.setcfg('karma.port', 9876);
    TP.sys.setcfg('karma.proxy', 9877);

    TP.sys.setcfg('karma.timeout', 15000);

    TP.sys.setcfg('karma.loader', 'tibet_loader.min.js');

    //  What slot on the launch window should we check for Karma?
    TP.sys.setcfg('karma.slot', '__karma__');

    //  ---
    //  tuning
    //  ---

    //  arrays can be sometimes be scanned for strings faster via regex so we
    //  set a threshold to tune between iteration and regex-based search
    TP.sys.setcfg('array.max_contains_loop', 50);

    //  the perform() call can instrument iterators with atStart/atEnd data
    //  and does this for all iteration sizes below this threshold. above this
    //  figure the function's string is tested to see if it makes use of this
    //  data. this figure can therefore be set to the size below which the
    //  toString test is slower than the instrumentation overhead
    TP.sys.setcfg('perform.max_instrument', 100);

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

    //  ---
    //  uri/url
    //  ---

    //  should uri computations rely on fallbacks. the flags here are based on
    //  each resource type for finer control.
    TP.sys.setcfg('uri.style_fallback', true);
    TP.sys.setcfg('uri.template_fallback', true);
    TP.sys.setcfg('uri.keybindings_fallback', false);

    //  the default type used to handle URI load/save operations.
    TP.sys.setcfg('uri.handler', 'TP.core.URIHandler');

    //  the default type used to handle URI rewriting decisions.
    TP.sys.setcfg('uri.rewriter', 'TP.core.URIRewriter');

    //  the default type used to handle URI mapping decisions.
    TP.sys.setcfg('uri.mapper', 'TP.core.URIMapper');

    //  the default type used to handle URI routing decisions.
    TP.sys.setcfg('uri.router', 'TP.core.URIRouter');

    //  should we watch remote resources?
    TP.sys.setcfg('uri.remote_watch', true);

    //  remote resources that we should try to watch.
    TP.sys.setcfg('uri.remote_watch_sources', ['~app_src', '~app_styles', '~app_cfg']);

    //  should we process the queue of remote resource changes?
    TP.sys.setcfg('uri.process_remote_changes', false);

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

}(this));

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
