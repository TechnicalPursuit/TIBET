/* copyright added via build process. see copyright.js in TIBET kernel */

//  ============================================================================

/**
 * @overview The first portion of the tibet_loader.js script. This section
 *     handles pre-launch checks to ensure TIBET is being targeted at the TOP
 *     window, puts some common functions in play, and gets TP.sys.cfg
 *     (configuration) data and methods ready for loading tibet_cfg.js and the
 *     rest of the tibet_loader boot script.
 */

/* global TP:true, APP:true */

//  ----------------------------------------------------------------------------

/* eslint indent:0 */
(function(root) {

if (root.location.pathname === '/index.html') {
    root.location.replace(
        root.location.toString().replace('/index.html', '/'));
}

//  GLOBAL - Defines where TIBET booted and where the codeframe is. We set this
//  early so the cfg/post/hook file knows it's bundled with tibet_loader_pre.js.
root.$$TIBET = root;

//  ----------------------------------------------------------------------------

/*
 * Pre-start checks.
 */

if (root === top) {

    //  Even if we exit this function we need to help the rest of tibet_loader's
    //  modules find the TP reference. The hook file portion may still run.
    TP = root.TP;

    //  If the TP or APP globals aren't available and we're loading into TOP
    //  that's a problem since our target globals aren't available.
    if (root.TP) {
        top.console.error(
            'TIBET global TP already mapped. Duplicate load script?');
        return;
    }

    if (root.APP) {
        top.console.error(
            'TIBET global APP already mapped. Duplicate load script?');
        return;
    }

} else {

    //  If we're being loaded into a frame other than TOP that's not a good
    //  thing. TIBET should only boot in TOP to avoid security issues with
    //  things like clickjacking etc. Plus it's a "single page" framework.
    if (top.TP) {

        //  Even if we exit this function we need to help the rest of
        //  tibet_loader's modules find the TP reference.
        root.TP = top.TP;
        TP = root.TP;

        //  See if we can trigger the router to route us based on the URL we're
        //  being loaded from (typically index.html via a "/" or "#" link).
        if (top.TP.sys && top.TP.sys.getRouter) {

            //  Keep the boot UI from showing...
            root.document.body.innerHTML = '';

            //  Set a flag the remaining portions of tibet_loader and the
            //  containing file (such as index.html) which might try to invoke
            //  TP.boot.launch() can check.
            top.TP.$$nested_loader = true;

            //  Clear the TIBET global. We don't want any new content confused
            //  about where it's loading.
            delete root.$$TIBET;

            //  Ask the router to do something useful with the location.
            top.TP.sys.getRouter().route(root.location.toString());

            return;

        } else {
            //  We found TP but not TP.sys or the router? Probably not TIBET.
            top.console.error(
                'TIBET global TP already mapped. Duplicate load script?');
            return;
        }

    } else {
        //  Karma will get worked up if we try to reset the location. NOTE
        //  we can't use TP.sys.cfg yet so have to hard-code the karma slot.
        if (!root.__karma__) {

            //  If we're not being loaded in TOP and TOP isn't running TIBET
            //  then we reset so we try to load into the top frame.
            top.location = root.location;
        }
    }
}

//  ----------------------------------------------------------------------------

//  ---
//  Define TIBET global and boot-level namespace symbols.
//  ---

//  If the ECMAScript5 'defineProperty' call is available, use it to try to
//  protect our key objects from being overwritten.
if (Object.defineProperty) {

    //  The TP object, which holds global constants, functions,
    //  types, and supporting variable data.
    Object.defineProperty(
        root,
        'TP',
        {
            value: {},
            writable: true,
            configurable: true
        });

    //  The TP.boot object, which holds functions and data needed
    //  for booting and for loading code dynamically.
    Object.defineProperty(
        TP,
        'boot',
        {
            value: {},
            writable: true,
            configurable: true
        });

    //  The TP.extern object, which holds functions and data related to
    //  external code (environmental or loaded libraries)
    Object.defineProperty(
        TP,
        'extern',
        {
            value: {},
            writable: true,
            configurable: true
        });

    //  The TP.sys object, which is responsible for system data,
    //  metadata, control parameters, etc.
    Object.defineProperty(
        TP,
        'sys',
        {
            value: {},
            writable: true,
            configurable: true
        });

    //  The TP.core object, which is responsible for core system types.
    Object.defineProperty(
        TP,
        'core',
        {
            value: {}, writable: true, configurable: true
        });

    //  The TP object, which holds global constants, functions,
    //  types, and supporting variable data.
    Object.defineProperty(
        root,
        'APP',
        {
            value: {},
            writable: true,
            configurable: true
        });

    //  No... just no. Note writable and configurable default to false.
    Object.defineProperty(
        TP,
        '$',
        {
            value: null
        });
    Object.defineProperty(
        TP,
        '_',
        {
            value: null
        });

} else {
    TP = root.TP || {};
    TP.boot = TP.boot || {};
    TP.extern = TP.extern || {};
    TP.sys = TP.sys || {};
    TP.core = TP.core || {};
    APP = root.APP || {};
}

//  ----------------------------------------------------------------------------
//  Global Management
//  ----------------------------------------------------------------------------

//  now we set up the 'global' object reference on 'TP.global'. This is an
//  interesting one-liner that works in any environment to obtain the
//  global.

//  Turn off the lint warning - we know we're invoking the 'Function'
//  constructor without 'new'... that's part of the trick.
/* eslint-disable new-cap,no-eval */
TP.global = Function('return this')() || (42, eval)('this');
/* eslint-enable new-cap,no-eval */

if (!TP.sys.$nativeglobals) {

    //  NB: Put this logic in an enclosing function so that we can use local
    //  vars without them being hoisted into the global space.

    //  Collect current globals as a rough baseline. NOTE that things parsed by
    //  the JS interpreter prior to starting the execution phase will still end
    //  up in this list so it's not particularly accurate, but it is more
    //  complete than just typing in the "big 8" types. Also note the use of
    //  'TP.global' here, which we use when we mean the global context and not
    //  the window from a semantic perspective.

    (function() {

        var getProps,
            uniqueProps;

        //  Traverse the prototype chain using the property names of the target.
        getProps = function(target) {
            return target ? Object.getOwnPropertyNames(target).concat(
                            getProps(Object.getPrototypeOf(target))) : [];
        };

        //  Unique the property names.
        uniqueProps = function(props) {
            return props.filter(function(value, index) {
                return props.lastIndexOf(value) === index;
            });
        };

        //  Get all of the unique property names from TP.global.
        TP.sys.$nativeglobals = uniqueProps(getProps(TP.global).sort());

        //  Slice out any TIBET globals.
        TP.sys.$nativeglobals.splice(TP.sys.$nativeglobals.indexOf('TP'), 1);
        TP.sys.$nativeglobals.splice(TP.sys.$nativeglobals.indexOf('APP'), 1);
    }());
}

//  define the tracking collection for TIBET's global symbols so any
//  early-stage boot configs can leverage the TP.sys.defineGlobal call
/* eslint-disable eqeqeq */
if (TP.sys.$globals == null) {
    TP.sys.$globals = [];
}
/* eslint-enable eqeqeq */

//  ---
//  Simply polyfills/shims
//  ---

if (!Number.MAX_SAFE_INTEGER) {
    Number.MAX_SAFE_INTEGER = 9007199254740991;
}

//  ---
//  Patch in baseline namespace API functions.
//  ---

TP.$$isNamespace = true;
TP.$$name = 'TP';
TP.$$id = 'TP';

TP.boot.$$isNamespace = true;
TP.boot.$$name = 'TP.boot';
TP.boot.$$id = 'TP.boot';

TP.extern.$$isNamespace = true;
TP.extern.$$name = 'TP.extern';
TP.extern.$$id = 'TP.extern';

TP.sys.$$isNamespace = true;
TP.sys.$$name = 'TP.sys';
TP.sys.$$id = 'TP.sys';

TP.core.$$isNamespace = true;
TP.core.$$name = 'TP.core';
TP.core.$$id = 'TP.core';

APP.$$isNamespace = true;
APP.$$name = 'APP';
APP.$$id = 'APP';

//  ---
//  Configure baseline log/debug levels.
//  ---

//  common debugging test flag, set this to true to turn on "if ($DEBUG)"
//  output. the $DEBUG setting is intended for application debugging
//  statements.
TP.$DEBUG = false;

//  used with/without the $DEBUG flags to control how much output is
//  produced during a particular operation.
TP.$VERBOSE = false;

//  infrastructure debugging flag, typically used for logging internals.
//  $$DEBUG is reserved for TeamTIBET usage.
TP.$$DEBUG = false;

//  more output, when available, regardless of whether its paired with
//  $DEBUG or $$DEBUG.
TP.$$VERBOSE = false;

//  Boot system versions
TP.boot.$debug = true;
TP.boot.$verbose = true;
TP.boot.$$debug = true;
TP.boot.$$verbose = true;

//  ---
//  Configure bootstrap logging control variables.
//  ---

//  log level NAME constants. These are used as keys into either TP.boot or
//  TP.log to locate the specific level appropriate during/after startup.
TP.ALL = 'ALL';
TP.TRACE = 'TRACE';
TP.DEBUG = 'DEBUG';
TP.INFO = 'INFO';
TP.WARN = 'WARN';
TP.ERROR = 'ERROR';
TP.FATAL = 'FATAL';
TP.SYSTEM = 'SYSTEM';
TP.OFF = 'OFF';

//  log level constants (only used by primitive boot log)
TP.boot.ALL = 0;
TP.boot.TRACE = 1;
TP.boot.DEBUG = 2;
TP.boot.INFO = 3;
TP.boot.WARN = 4;
TP.boot.ERROR = 5;
TP.boot.FATAL = 6;
TP.boot.SYSTEM = 7;
TP.boot.OFF = 8;

TP.boot.LOG_NAMES = [
    'ALL',
    'TRACE',
    'DEBUG',
    'INFO',
    'WARN',
    'ERROR',
    'FATAL',
    'SYSTEM',
    'OFF'
];

//  log entry slot indices (only used by primitive boot log)
TP.boot.LOG_ENTRY_DATE = 0;
TP.boot.LOG_ENTRY_NAME = 1;
TP.boot.LOG_ENTRY_LEVEL = 2;
TP.boot.LOG_ENTRY_PAYLOAD = 3;
TP.boot.LOG_ENTRY_DELTA = 4;

TP.BOOT_LOG = 'boot';

//  the actual buffer size used. the log.level setting is used as a starting
//  point but adjusted based on log level to balance speed with user-feedback.
//  Initialized to null awaiting first computation based on log.buffer_size.
TP.boot.$$logbufsize = null;

//  the actual logging level used. A simple cache to avoid calling on cfg() for
//  the current level repeatedly.
TP.boot.$$loglevel = 1;

//  tracks the worst error-level logged to help drive styling in the UI.
TP.boot.$$logpeak = 0;

//  css used to help notify visual elements of warning/error state. once a
//  warning or error occurs the styles in the user interface update to help
//  reflect that state back to the user.
TP.boot.$$logcss = null;

//  ---
//  Boot-level constants
//  ---

TP.NOOP = function() {
    //  empty
};

//  TIBET signaling key for "all objects or origins".
TP.ANY = 'ANY';

TP.FAILED = 4;                              //  See TIBETGlobals.js for value.
TP.NOT_FOUND = -1;                          //  missing data
TP.BAD_INDEX = -1;                          //  bad array index
TP.NO_SIZE = -1;                            //  bad object size
TP.NO_RESULT = 'NO_RESULT';                 //  invalid response

//  file load return types
TP.DOM = 1;
TP.TEXT = 2;
TP.XHR = 3;
TP.WRAP = 4;
TP.NATIVE = 5;

//  direction/comparison
TP.UP = 'UP';
TP.DOWN = 'DOWN';

//  Mozilla file activity flags
TP.MOZ_READ = 0x01;
TP.MOZ_WRITE = 0x08;
TP.MOZ_APPEND = 0x10;

//  Mozilla file creation flags
TP.MOZ_FILE_RDONLY = 0x01;
TP.MOZ_FILE_WRONLY = 0x02;
TP.MOZ_FILE_RDWR = 0x04;
TP.MOZ_FILE_CREATE = 0x08;
TP.MOZ_FILE_APPEND = 0x10;
TP.MOZ_FILE_TRUNCATE = 0x20;
TP.MOZ_FILE_SYNC = 0x40;
TP.MOZ_FILE_EXCL = 0x80;

//  HTTP method/call types
TP.HTTP_DELETE = 'DELETE';
TP.HTTP_GET = 'GET';
TP.HTTP_HEAD = 'HEAD';
TP.HTTP_OPTIONS = 'OPTIONS';
TP.HTTP_POST = 'POST';
TP.HTTP_PUT = 'PUT';
TP.HTTP_TRACE = 'TRACE';

//  ---
//  Boot Regex Patterns
//  ---

TP.boot.BOOLEAN_REGEX = /^true$|^false$/;
//  TODO: Date support here?
TP.boot.NUMBER_REGEX = /^\d*$/;
TP.boot.OBJECT_REGEX = /^\{.*\}$/;
TP.boot.REGEX_REGEX = /^\/.*\/$/;

//  regex to validate property key form (qualified)
TP.boot.$$PROP_KEY_REGEX = /\./;

/* eslint-disable no-div-regex */
TP.boot.$$KV_REGEX = /=/;
/* eslint-enable no-div-regex */

//  TODO: update for Opera
//  regex used for special case processing of if/unless conditionals
TP.boot.$$USER_AGENT_REGEX =
    /^firefox|^safari|^chrome|^ie|^gecko|^webkit|^trident/;

//  ---
//  Common Regex Patterns
//  ---

//  TODO: these should now be TP.regex.* names
//
//  simple reusable regexes (many many more in TIBETGlobals.js)
TP.FILE_PATH_REGEX = /\.([^\/]*)$/;
TP.HAS_PATH_OFFSET_REGEX = /\/\.\./;
TP.REMOVE_PATH_OFFSET_REGEX = /(^|\/)[^\/]*\/\.\./;
TP.HAS_PATH_NOOP_REGEX = /\/\./;
TP.REMOVE_PATH_NOOP_REGEX = /\/\./;
TP.HAS_MARKUP_REGEX = /<\//;    //  Simple but effective for boot code use.

TP.BAD_WINDOW_ID_REGEX = /[:\/]/;
TP.WINDOW_PREFIX_REGEX = /^window_[0-9]/;
TP.SCREEN_PREFIX_REGEX = /^screen_[0-9]/;

//  simple splitter for TIBET-scheme uri strings
TP.TIBET_URI_SPLITTER =
                /tibet:([^\/]*?)\/([^\/]*?)\/([^\/]*)(\/([^#]*)(.*))*/;

//  Version strings for manifests (root manifests) are like IP addresses,
//  with a . separator and parts for major, minor, and patch level.
TP.TIBET_VERSION_SPLITTER = /(\d*)\.(\d*)\.(\d*)/;

//  ----------------------------------------------------------------------------
//  Internal Boot Properties
//  ----------------------------------------------------------------------------

/*
 * The variables in this section are internal to the boot script and, for the
 * most part, do not have related configuration parameter access. These should
 * not be set except from within the boot code itself or via automated build
 * processes.
 */

//  The version stamp defines which build files can be processed. When a
//  bootfile specifies a version it cannot be more recent than this or the
//  process will be terminated with a version mismatch error.
//  NOTE: we use parseInt here to keep this file valid JS for editing. If we use
//  a bare numeric and try to template the linters get angry over syntax errors.
TP.boot.$version = parseInt('{{version}}', 10);

//  ---
//  Scott's nemeses.
//  ---

//  computed app, lib, and uri roots respectively
TP.boot.$$approot = null;
TP.boot.$$libroot = null;
TP.boot.$$uriroot = null;

//  ---
//  cached UI elements
//  ---

TP.boot.$$uiHead;
TP.boot.$$uiImage;
TP.boot.$$uiInput;
TP.boot.$$uiLog;
TP.boot.$$uiPath;
TP.boot.$$uiProgress;
TP.boot.$$uiSubhead;

//  ---
//  cached vars
//  ---

//  Cached user-agent info.

TP.$$uaInfo = {};

//  one-time capture of the document head since we append quite often ;)
TP.boot.$$head = document.getElementsByTagName('head')[0];

//  placeholder for document fragment used for message buffering
TP.boot.$$msgBuffer = null;

//  cloneable template for UI log messages
TP.boot.$$msgTemplate = null;

//  cloneable script node for construction of new nodes to append to head
TP.boot.$$scriptTemplate = document.createElement('script');
TP.boot.$$scriptTemplate.setAttribute('type', 'text/javascript');

//  ---
//  package/cfg expansion control
//  ---

//  tracking of basedir specifications from package to package, used as a
//  stack.
TP.boot.$$basedir = [];

//  where did we end up locating the boot.tibet_inf directory? filled in
//  after initial computation and search locate the concrete directory name
TP.boot.$$bootdir = null;

//  what specific file did we end up using as our tibet.xml file? filled in
//  based on launch parameters and search for the concrete file
TP.boot.$$bootfile = null;

//  tracking variables for package-specific configs, which are nestable so we
//  use these arrays as stacks and push/pop configs during import manifest
//  expansion
TP.boot.$$packagecfg = [];
TP.boot.$$packagexml = [];

//  placeholder for current working file root from which files can be found
TP.boot.$$rootpath = null;

//  currently booting package name
TP.boot.$$package = null;

//  currently booting script name
TP.boot.$$script = null;

//  cache current percent complete to avoid overworking reflow during progress
//  updating in the ui.
TP.boot.$$percent = null;

//  a summary statistic of the total number of import nodes between all import
//  operations
TP.boot.$$totalwork = 0;

//  adjusted after manifest-building to define how many nodes will be loaded
//  during the current package import
TP.boot.$$workload = null;

//  container for expanded paths so we don't work to expand them more than
//  once per session.
TP.boot.$$fullPaths = {};

//  tracking for which packages and configs have loaded. key is
//  package_file@config
TP.boot.$$packages = {};

//  tracking for which scripts have loaded. key is script file path.
TP.boot.$$scripts = {};

//  ---
//  import loop machinery
//  ---

//  placeholder for the node list to import at the moment. we use this
//  to allow us to work via setTimeout and onload handlers during import
//  which is necessary to provide openings for visual display to occur
TP.boot.$$bootindex = null;
TP.boot.$$bootnodes = null;

//  placeholder for the initial boot configuration/build config and DOM
TP.boot.$$bootconfig = null;
TP.boot.$$bootxml = null;

//  prebuilt function for setTimeout processing when async loading
TP.boot.$$importAsync = function() {
        TP.boot.$importComponents(false);
    };

//  placeholder for the currently loading script node. this is used to track
//  load information such as package, config, and bundle/source path.
TP.boot.$$loadNode = null;

//  placeholder for the currently loading script file, used to support
//  object source code reflection.
TP.boot.$$loadPath = null;
TP.boot.$$loadpaths = [];

//  ---
//  performance tracking
//  ---

//  tracking for tuning number of boot time queries. this watches each
//  property and counts how many times we've asked for it
TP.boot.$$propertyQueries = {};

//  ---
//  stdout/stderr styling
//  ---

//  We use 'modes' (browser, and console) to group different definitions of how
//  a color is actually applied..or not. The JavaScript console and terminal (in
//  the case of PhantomJS or Electron) need just the string. Browser output has
//  HTML/CSS content to wrap the target strings instead of ANSI escape codes.
TP.boot.$$styles = {};

//  Color values here are inspired by chalk.js's wiki page 'chalk
//  colors'...which ironically chalk.js doesn't actually output.
//  Note that the browser mode values are rebuilt during startup using data
//  from TP.sys.cfg() for the current color.scheme.
//
//  black:      #2d2d2d
//  red:        #f58e8e
//  green:      #a9d3ab
//  yellow:     #fed37f
//  blue:       #7aabd4
//  magenta:    #d6add5
//  cyan:       #79d4d5
//  white:      #d6d6d6
//  gray:       #939393
//  dim:        #565656
//  fgText:     #646464

//  Browser version using inline styles. We avoid external CSS to avoid
//  reliance on additional files during startup for the loader/boot logic.
TP.boot.$$styles.browser = {
//  Modifiers
    reset: ['<span style="background-color:#d6d6d6;color:#2d2d2d;">', '</span>'],
    bold: ['<b>', '</b>'],
    dim: ['<span style="color:#565656;">', '</span>'],
    italic: ['<i>', '</i>'],
    underline: ['<u>', '</u>'],
    inverse: ['<span style="background-color:black;color:white;">', '</span>'],
    hidden: ['<span style="visibility:hidden">', '</span>'],
    strikethrough: ['<del>', '</del>'],

//  Colors
    black: ['<span style="color:#2d2d2d;">', '</span>'],
    red: ['<span style="color:#f58e8e;">', '</span>'],
    green: ['<span style="color:#a9d3ab;">', '</span>'],
    yellow: ['<span style="color:#fed37f;">', '</span>'],
    blue: ['<span style="color:#7aabd4;">', '</span>'],
    magenta: ['<span style="color:#d6add5;">', '</span>'],
    cyan: ['<span style="color:#79d4d5;">', '</span>'],
    white: ['<span style="color:#d6d6d6;">', '</span>'],
    gray: ['<span style="color:#939393;">', '</span>'],

//  bgColors
    bgBlack: ['<span style="background-color:#2d2d2d;color:#d6d6d6;">', '</span>'],
    bgRed: ['<span style="background-color:#f58e8e;color:#646464;">', '</span>'],
    bgGreen: ['<span style="background-color:#a9d3ab;color:#646464;">', '</span>'],
    bgYellow: ['<span style="background-color:#fed37f;color:#646464;">', '</span>'],
    bgBlue: ['<span style="background-color:#7aabd4;color:#646464;">', '</span>'],
    bgMagenta: ['<span style="background-color:#d6add5;color:#646464;">', '</span>'],
    bgCyan: ['<span style="background-color:#79d4d5;color:#646464;">', '</span>'],
    bgWhite: ['<span style="background-color:#d6d6d6;color:#646464;">', '</span>']
};

//  Generate the browser console settings. This is essentially a set of empty
//  strings since we don't actually want to put markup into the JS console.
TP.boot.$$styles.console = (function() {
    var i,
        obj;

    obj = {};
    for (i in TP.boot.$$styles.browser) {
        if (TP.boot.$$styles.browser.hasOwnProperty(i)) {
            obj[i] = ['', ''];
        }
    }

    return obj;
}());

//  ---
//  stage processing
//  ---

//  staging flag telling us argument processing is complete. After this point
//  changes to certain config flags are considered 'forced overrides' if the
//  value already exists (since it would have been user-entered on the url).
TP.boot.$$argsDone = false;

//  count of errors logged during the boot sequence. If this goes above
//  boot.error_max the boot will stop.
TP.boot.$$errors = 0;

//  count of places which exceed delta_threshold for performance.
TP.boot.$$bottlenecks = 0;

//  count of warnings produced during the boot. this is simply reported during
//  the final boot summary log entries.
TP.boot.$$warnings = 0;

//  boot termination string used to trigger and report on boot termination. If
//  this value takes on a string the boot will terminate and report that string
//  as the reason for termination.
TP.boot.$$stop = null;

//  what is the current boot processing stage? these are used largely for
//  reporting but some of the stages actually help with control logic and
//  with driving different messaging in the user interface during boot.
TP.boot.$$stage = null;

//  Valid stage values for booting.
TP.boot.$$stages = {
prelaunch: {
    order: 0,
    log: 'Verifying',
    head: 'Verifying environment...',
    sub: '',
    image: '~app_boot/media/app_logo.png'
},
configuring: {
    order: 1,
    log: 'Configuring',
    head: 'Reading configuration...',
    sub: '',
    image: '~app_boot/media/app_logo.png'
},
expanding: {
    order: 2,
    log: 'Expanding',
    head: 'Expanding manifest...',
    sub: '',
    image: '~app_boot/media/app_logo.png'
},
import_phase_one: {
    order: 3,
    log: 'Phase One',
    head: 'Loading shared library...',
    sub: '',
    image: '~app_boot/media/tibet_logo.png'
},
import_paused: {
    order: 4,
    log: 'Import Pause',
    head: 'Paused',
    sub: 'Waiting to load app components...',
    image: '~app_boot/media/playpause.png'
},
import_phase_two: {
    order: 5,
    log: 'Phase Two',
    head: 'Loading application components...',
    sub: '',
    image: '~app_boot/media/app_logo.png'
},
paused: {
    order: 6,
    log: 'Startup Paused',
    head: 'Click play/pause to proceed.',
    sub: '',
    image: '~app_boot/media/playpause.png'
},
initializing: {
    order: 7,
    log: 'Initializing',
    head: 'Initializing components...',
    sub: '',
    image: '~app_boot/media/app_logo.png',
    fatal: true
},
starting: {
    order: 8,
    log: 'Starting',
    head: 'Starting application...',
    sub: '',
    image: '~app_boot/media/app_logo.png',
    fatal: true
},
liftoff: {
    order: 9,
    log: 'Started',
    head: 'Application started.',
    sub: '',
    image: '~app_boot/media/app_logo.png',
    hook: function() {
        TP.boot.$displayStatus('Application started: ' +
            (TP.boot.$getStageTime('started', 'prelaunch') -
            TP.boot.$getStageTime('paused')) + 'ms.');
        TP.boot.hideUIBoot();
    }
},
stopped: {
    order: 10,
    log: 'Stopped',
    head: 'Application launch halted.',
    sub: '',
    image: '~app_boot/media/alert.png',
    hook: function() {
        TP.boot.$displayStatus('Boot halted after: ' +
            (TP.boot.$getStageTime('started', 'prelaunch') -
            TP.boot.$getStageTime('paused')) + 'ms.');
    }
}
};

//  assemble the names based on their order for easier searching. we'll do this
//  computationally just to keep maintenance a little easier.
TP.boot.$$stageorder = [];
(function() {
    var i;

    for (i in TP.boot.$$stages) {
        if (TP.boot.$$stages.hasOwnProperty(i)) {
            TP.boot.$$stageorder.push(i);
        }
    }

    TP.boot.$$stageorder = TP.boot.$$stageorder.sort(function(a, b) {
        if (TP.boot.$$stages[a].order < TP.boot.$$stages[b].order) {
            return -1;
        } else {
            return 1;
        }
    });
}());

//  ---
//  URI schemes
//  ---

//  base schemes potentially used during boot processing
TP.SCHEMES = ['http', 'file', 'tibet', 'https', 'chrome-extension'];

//  Considered 'built-in' by TIBET, but other schemes are added when
//  registered.
TP.boot.$uriSchemes = {
    tibet: 'tibet',    // common
    urn: 'urn',        // common
    http: 'http',      // common
    https: 'https',    // common
    file: 'file',      // common
    xmpp: 'xmpp',      // common
    about: 'about',    // common
    mailto: 'mailto',  // common
    tel: 'tel',        // common
    news: 'news',      // common
    nntp: 'nntp',      // common
    ftp: 'ftp',        // common
    ws: 'ws',          // common
    wss: 'wss',        // common

    aaa: 'aaa',
    aaas: 'aaas',
    acap: 'acap',
    cap: 'cap',
    cid: 'cid',
    crid: 'crid',
    data: 'data',
    dav: 'dav',
    dict: 'dict',
    dns: 'dns',
    fax: 'fax',
    go: 'go',
    gopher: 'gopher',
    h323: 'h323',
    icap: 'icap',
    im: 'im',
    imap: 'imap',
    info: 'info',
    ipp: 'ipp',
    iris: 'iris',
    'iris.beep': 'iris.beep',
    'iris.xpc': 'iris.xpc',
    'iris.xpcs': 'iris.xpcs',
    'iris.lws': 'iris.lws',
    ldap: 'ldap',
    lsid: 'lsid',
    mid: 'mid',
    modem: 'modem',
    msrp: 'msrp',
    msrps: 'msrps',
    mtqp: 'mtqp',
    mupdate: 'mupdate',
    nfs: 'nfs',
    opaquelocktoken: 'opaquelocktoken',
    pop: 'pop',
    pres: 'pres',
    prospero: 'prospero',
    rtsp: 'rtsp',
    service: 'service',
    shttp: 'shttp',
    sip: 'sip',
    sips: 'sips',
    snmp: 'snmp',
    'soap.beep': 'soap.beep',
    'soap.beeps': 'soap.beeps',
    tag: 'tag',
    telnet: 'telnet',
    tftp: 'tftp',
    thismessage: 'thismessage',
    tip: 'tip',
    tv: 'tv',
    vemmi: 'vemmi',
    wais: 'wais',
    'xmlrpc.beep': 'xmlrpc.beep',
    'z39.50r': 'z39.50r',
    'z39.50s': 'z39.50s'
};

//  Generated initially from mime-types npm module content.
TP.boot.$xmlMimes = {
    atom: 'application/atom+xml',
    atomcat: 'application/atomcat+xml',
    atomsvc: 'application/atomsvc+xml',
    ccxml: 'application/ccxml+xml',
    cdxml: 'application/vnd.chemdraw+xml',
    dae: 'model/vnd.collada+xml',
    davmount: 'application/davmount+xml',
    dbk: 'application/docbook+xml',
    dd2: 'application/vnd.oma.dd2+xml',
    dtb: 'application/x-dtbook+xml',
    dtd: 'application/xml-dtd',
    emma: 'application/emma+xml',
    es3: 'application/vnd.eszigno3+xml',
    et3: 'application/vnd.eszigno3+xml',
    gml: 'application/gml+xml',
    gpx: 'application/gpx+xml',
    grxml: 'application/srgs+xml',
    hal: 'application/vnd.hal+xml',
    ink: 'application/inkml+xml',
    inkml: 'application/inkml+xml',
    irp: 'application/vnd.irepository.package+xml',
    kml: 'application/vnd.google-earth.kml+xml',
    lasxml: 'application/vnd.las.las+xml',
    lbe: 'application/vnd.llamagraphics.life-balance.exchange+xml',
    link66: 'application/vnd.route66.link66+xml',
    lostxml: 'application/lost+xml',
    mads: 'application/mads+xml',
    mathml: 'application/mathml+xml',
    mdp: 'application/dash+xml',
    meta4: 'application/metalink4+xml',
    metalink: 'application/metalink+xml',
    mets: 'application/mets+xml',
    mods: 'application/mods+xml',
    mpkg: 'application/vnd.apple.installer+xml',
    mrcx: 'application/marcxml+xml',
    mscml: 'application/mediaservercontrol+xml',
    musicxml: 'application/vnd.recordare.musicxml+xml',
    mxml: 'application/xv+xml',
    ncx: 'application/x-dtbncx+xml',
    omdoc: 'application/omdoc+xml',
    opf: 'application/oebps-package+xml',
    osfpvg: 'application/vnd.yamaha.openscoreformat.osfpvg+xml',
    pls: 'application/pls+xml',
    pskcxml: 'application/pskc+xml',
    rdf: 'application/rdf+xml',
    res: 'application/x-dtbresource+xml',
    rif: 'application/reginfo+xml',
    rl: 'application/resource-lists+xml',
    rld: 'application/resource-lists-diff+xml',
    rs: 'application/rls-services+xml',
    rsd: 'application/rsd+xml',
    rss: 'application/rss+xml',
    sbml: 'application/sbml+xml',
    sdkd: 'application/vnd.solent.sdkm+xml',
    sdkm: 'application/vnd.solent.sdkm+xml',
    shf: 'application/shf+xml',
    smi: 'application/smil+xml',
    smil: 'application/smil+xml',
    sru: 'application/sru+xml',
    srx: 'application/sparql-results+xml',
    ssdl: 'application/ssdl+xml',
    ssml: 'application/ssml+xml',
    svg: 'image/svg+xml',
    svgz: 'image/svg+xml',
    tei: 'application/tei+xml',
    teicorpus: 'application/tei+xml',
    tfi: 'application/thraud+xml',
    tsh: 'application/vnd.tibet.tsh+xml',     //  LOCAL TO TIBET
    uoml: 'application/vnd.uoml+xml',
    uvt: 'application/vnd.dece.ttml+xml',
    uvvt: 'application/vnd.dece.ttml+xml',
    vxml: 'application/voicexml+xml',
    wbs: 'application/vnd.criticaltools.wbs+xml',
    wsdl: 'application/wsdl+xml',
    wspolicy: 'application/wspolicy+xml',
    x3d: 'model/x3d+xml',
    x3dz: 'model/x3d+xml',
    xaml: 'application/xaml+xml',
    xdf: 'application/xcap-diff+xml',
    xdm: 'application/vnd.syncml.dm+xml',
    xdp: 'application/vnd.adobe.xdp+xml',
    xdssc: 'application/dssc+xml',
    xenc: 'application/xenc+xml',
    xer: 'application/patch-ops-error+xml',
    xht: 'application/xhtml+xml',
    xhtml: 'application/xhtml+xml',
    xhvml: 'application/xv+xml',
    xlf: 'application/x-xliff+xml',
    xml: 'application/xml',
    xop: 'application/xop+xml',
    xpl: 'application/xproc+xml',
    xsd: 'application/xml',
    xsl: 'application/xml',
    xslt: 'application/xslt+xml',
    xsm: 'application/vnd.syncml+xml',
    xspf: 'application/xspf+xml',
    xul: 'application/vnd.mozilla.xul+xml',
    xvm: 'application/xv+xml',
    xvml: 'application/xv+xml',
    yin: 'application/yin+xml',
    zaz: 'application/vnd.zzazz.deck+xml',
    zmm: 'application/vnd.handheld-entertainment+xml'
};

//  ----------------------------------------------------------------------------
//  Value Checking
//  ----------------------------------------------------------------------------

TP.boot.$isArgumentArray = function(value) {

    /**
     * @method $isArgumentArray
     * @summary Returns true if the value is an arguments array.
     * @returns {Boolean} True if the value is an arguments array.
     */

    return value !== null && value !== undefined &&
        Object.prototype.toString.call(value) === '[object Arguments]';
};

//  ----------------------------------------------------------------------------

TP.boot.$isElement = function(value) {

    /**
     * Return true if the object provided appears to be a DOM Element. This test
     * is not exhaustive but is sufficient for purposes of filtering out invalid
     * or NOT_FOUND values returned by boot UI element searches.
     * @param {Object} value The object to test.
     * @returns {Boolean} True if the object is an element.
     */

    return TP.boot.$isValid(value) && value.nodeType === 1;
};

//  ----------------------------------------------------------------------------

TP.boot.$isEmpty = function(value) {

    /**
     * @method $isEmpty
     * @summary Returns true if the value is either invalid or empty.
     * @returns {Boolean} True if the value is invalid or empty.
     */

    //  Inadequate for real work but good enough for boot code.
    return value === null || value === undefined || value.length === 0;
};

//  ----------------------------------------------------------------------------

TP.boot.$isNumber = function(value) {

    /**
     * @method $isNumber
     * @summary Returns true if the value is a true number (not NaN etc).
     * @returns {Boolean} True if the value is a number.
     */

    //  Sadly, some edge case things might not pass this, but they don't tend to
    //  show up during boot processing.
    return typeof value === 'number' && !isNaN(value);
};

//  ----------------------------------------------------------------------------

TP.boot.$isString = function(value) {

    /**
     * @method $isString
     * @summary Returns true if the value is a valid string.
     * @returns {Boolean} True if the value is a string.
     */

    return typeof value === 'string' || value.constructor === String;
};

//  ----------------------------------------------------------------------------

TP.boot.$isValid = function(value) {

    /**
     * @method $isValid
     * @summary Returns true if the value is neither null nor undefined.
     * @returns {Boolean} True if the value is 'valid'.
     */

    return value !== null && value !== undefined;
};

//  ----------------------------------------------------------------------------

TP.boot.$isVisible = function(anElement) {

    /**
     * @method $isVisible
     * @summary Returns true if the element appears to be visible to the user.
     * @returns {Boolean} True if the element is visible.
     */

    var elem;

    if (!TP.boot.$isElement(anElement)) {
        return false;
    }

    elem = anElement;
    while (TP.boot.$isElement(elem)) {
        if (elem.style.display === 'none' ||
                elem.style.visibility === 'hidden') {
            return false;
        }
        elem = elem.parentElement;
    }

    return true;
};

//  ------------------------------------------------------------------------

TP.boot.$isWindow = function(anObj) {

    /**
     * @method isWindow
     * @summary Returns true if the object provided appears to be a valid
     *     window instance based on location and navigator slot checks.
     * @param {Object} anObj The object to test.
     * @returns {Boolean} True if the object is a window.
     */

    /* eslint-disable eqeqeq */
    if (anObj != null && anObj.moveBy !== undefined) {
        return true;
    }
    /* eslint-enable eqeqeq */

    return false;
};

//  ----------------------------------------------------------------------------

TP.boot.$notEmpty = function(value) {

    /**
     * @method $notEmpty
     * @summary Returns true if the value is either invalid or empty.
     * @returns {Boolean} True if the value is invalid or empty.
     */

    //  Inadequate for real work but good enough for boot code.
    return value !== null && value !== undefined &&
        value.length !== undefined && value.length !== 0;
};

//  ----------------------------------------------------------------------------

TP.boot.$notValid = function(value) {

    /**
     * @method $notValid
     * @summary Returns true if the value is either null or undefined.
     * @returns {Boolean} True if the value is 'invalid'.
     */

    return value === null || value === undefined;
};

//  ----------------------------------------------------------------------------

TP.sys.defineGlobal = function(aName, aValue, force) {

    /**
     * @method defineGlobal
     * @summary Defines a global variable and adds it to TIBET's list of
     *     globals. This list is used to support symbol exports. Note that while
     *     this does have the effect of setting a global value there is no
     *     change notification associated with this operation. Use set() to
     *     achieve that effect.
     * @param {String} aName The global name to define.
     * @param {Object} aValue The value to set for the global.
     * @param {Boolean} force True means an existing value will be forcefully
     *     replaced with the new value. The default is false.
     * @returns {Object} The value after setting.
     */

    var wasUndefined;

    if (TP.boot.$notValid(aName) || aName === '') {
        return;
    }

    //  we're lazy here so that all globals are ensured to be registered
    //  even if that means we duplicate a few names. that'll be cleared up
    //  when this is converted to a hash during finalization
    TP.sys.$globals.push(aName);

    wasUndefined = typeof TP.global[aName] === 'undefined';

    //  if the slot was truly undefined, then we go ahead and do a
    //  'defineProperty' here. Note that we don't otherwise, since it may be
    //  a global that is required to be 'visible'.
    if (wasUndefined === true) {
        //  If the ECMAScript5 'defineProperty' call is available, use it
        //  to try to make the global variable 'hidden' from enumeration.
        if (Object.defineProperty) {
            Object.defineProperty(
                        TP.global,
                        aName,
                        TP.PROPERTY_DEFAULTS);
        }
    }

    //  simple check for having already defined it, if not we add to the
    //  list. as a coding standard we use TP.global when we're referring to the
    //  "global" instead of implying "window" behavior
    if (wasUndefined === true || force === true) {
        TP.global[aName] = aValue;
    }

    return TP.global[aName];
};

//  ----------------------------------------------------------------------------
//  Boot/Startup Progress Checks
//  ----------------------------------------------------------------------------

//  Flag telling us whether TIBET has initialized the system and types.
TP.sys.initialized = false;

TP.sys.hasInitialized = function(aFlag) {

    /**
     * @method hasInitialized
     * @summary Combined setter/getter defining whether TIBET's initialization
     *     sequence has completed and the system is in a usable state. Note that
     *     initialized is not the same as started. Initialized simply means we
     *     can try to start the application's top-level entry point now.
     * @param {Boolean} aFlag True to signify the system is initialized.
     * @returns {Boolean} The current state.
     */

    if (aFlag !== undefined) {
        this.initialized = aFlag;
    }

    return this.initialized;
};

//  ----------------------------------------------------------------------------

//  Flag telling us whether the kernel code has finished loading.
TP.sys.kernel = false;

TP.sys.hasKernel = function(aFlag) {

    /**
     * @method hasKernel
     * @summary Combined setter/getter defining whether the TIBET kernel has
     *     been loaded. This can be helpful when you want to leverage
     *     functionality in the kernel during startup but need to be sure the
     *     kernel has successfully loaded.
     * @param {Boolean} aFlag True to signify kernel is available.
     * @returns {Boolean} The current state.
     */

    if (aFlag !== undefined) {
        this.kernel = aFlag;
    }

    return this.kernel;
};

//  ----------------------------------------------------------------------------

//  Flag telling us whether TIBET has finished loading all manifest content.
TP.sys.loaded = false;

TP.sys.hasLoaded = function(aFlag) {

    /**
     * @method hasLoaded
     * @summary Combined setter/getter defining whether TIBET's load process
     *     has completed. This isn't meant to imply that TIBET is in a useable
     *     state, you should use TP.sys.hasInitialized() and or
     *     TP.sys.hasStarted() to check for a specific 'live' state.
     * @param {Boolean} aFlag True to signify load completion.
     * @returns {Boolean} The current state.
     */

    if (aFlag !== undefined) {
        this.loaded = aFlag;
    }

    return this.loaded;
};

//  ----------------------------------------------------------------------------

//  Flag telling us whether TIBET has started the application via AppDidStart.
TP.sys.started = false;

TP.sys.hasStarted = function(aFlag) {

    /**
     * @method hasStarted
     * @summary Combined setter/getter defining whether TIBET's application
     *     startup sequence has completed and a TP.core.Application instance is
     *     now acting as the application controller.
     * @param {Boolean} aFlag True to signify the system has started.
     * @returns {Boolean} The current state.
     */

    if (aFlag !== undefined) {
        this.started = aFlag;
    }

    return this.started;
};

//  ----------------------------------------------------------------------------

TP.boot.shouldStop = function(aReason) {

    if (TP.boot.$notEmpty(aReason)) {
        TP.boot.$$stop = aReason;
    }

    return TP.boot.$isValid(TP.boot.$$stop);
};

//  ============================================================================
//  System Property Getters
//  ============================================================================

TP.sys.installSystemPropertyGetter = function(anObj, propName, getter) {

    /**
     * @method installSystemPropertyGetter
     * @summary Installs the getter function on anObj under propName such that
     *     it can be used to retrieve values without function invocation syntax.
     *     This is particularly handy when using this with ACP expressions,
     *     which don't allow function invocation.
     * @description Note that propName can be a dot-separated name and this
     *     method will 'do the right thing' and build a 'path' of plain JS
     *     objects to the getter. Common system property objects are:
     *
     *          TP.cfg  ->  Allows access to system cfg data
     *          TP.env  ->  Allows access to system env data
     *          TP.has  ->  Allows access to system feature data
     *
     * @param {Object} anObj The object to install the getter on.
     * @param {String} propName The property name to use to access the getter.
     * @param {Function} getter The Function that will be run when the property
     *     is accessed.
     */

    var obj,
        parts,
        len,
        i,
        name;

    if (/\./.test(propName)) {
        obj = anObj;

        parts = propName.split('.');
        len = parts.length;

        for (i = 0; i < len - 1; i++) {
            name = parts[i];

            if (TP.boot.$notValid(obj[name])) {
                //  Remove any partial path descriptor that might be in the way
                //  of altering the value.
                delete obj[name];
                obj[name] = {};
            }

            obj = obj[name];
        }

        name = parts[len - 1];
    } else {
        obj = anObj;
        name = propName;
    }

    if (obj.hasOwnProperty(name)) {
        return;
    }

    Object.defineProperty(
        obj,
        name,
        {
            //  Make sure this can be altered/removed/updated as needed.
            configurable: true,
            get: function() {
                return getter(propName);
            }
        });

    return;
};

//  Common system property objects

//  Used for cfg() properties
TP.cfg = {};

//  Used for env() properties
TP.env = {};

//  Used for hasFeature() properties
TP.has = {};

//  ============================================================================
//  Environment and Configuration Primitives
//  ============================================================================

/*
 * General purpose routines used by environment and configuration property
 * routines to manage the values in the TIBET environment and configuration
 * dictionaries.
 */

//  ----------------------------------------------------------------------------

//  During startup we call getcfg a lot and TP.core.Hash isn't around so we end
//  up using objects instrumented with at/atPut. Build those 'methods' here.
TP.boot.$$getprop_at = function(slotKey) {
    return this[slotKey];
};
TP.boot.$$getprop_atPut = function(slotKey, aValue) {
    this[slotKey] = aValue;
};

//  The one other method used on cfg results is getKeys so iteration can
//  occur...but we have to remove the three methods themselves from list.
TP.boot.$$getprop_getKeys = function() {
    var keys;

    keys = Object.keys(this);
    return keys.filter(function(key) {
        return key !== 'at' && key !== 'atPut' && key !== 'getKeys';
    });
};

//  ----------------------------------------------------------------------------

TP.boot.$$getprop = function(aHash, aKey, aDefault, aPrefix) {

    /**
     * @method $$getprop
     * @summary Returns the value of the named property from the hash provided.
     *     NOTE that keys are expected to have at least one '.' (period)
     *     separating their 'category' from their name as in tibet.uipath or
     *     tsh.default_ns. When no period and no prefix parameter are provided
     *     the prefix defaults to 'tmp' (which matches the defaulting rules for
     *     $setprop).
     * @param {Object} aHash The object dictionary to query.
     * @param {String} aKey The property name to retrieve.
     * @param {String} aDefault The default value to use when the named property
     *     isn't defined.
     * @param {String} aPrefix The default prefix to use for unprefixed key
     *     values.
     * @returns {Object} The value of the property.
     */

    var val,
        key,
        arr,
        keys,
        len,
        i,
        obj,
        keyPrefix;

    if (aHash === undefined || aHash === null) {
        return aDefault;
    }

    //  Build a key from any key and prefix provided. If no key or prefix is
    //  given the entire catalog of values is returned.
    if (!aKey) {
        if (!aPrefix) {
            if (aDefault !== undefined) {
                return aDefault;
            }

            return aHash;
        } else {
            key = aPrefix;
        }
    } else {
        if (!aPrefix) {
            if (TP.boot.$$PROP_KEY_REGEX.test(aKey) === false) {
                key = 'tmp.' + aKey;
            } else {
                key = aKey;
            }
        } else {
            key = aPrefix + '.' + aKey;
        }
    }

    if (!TP.sys.configlookups[key]) {
        TP.sys.configlookups[key] = 1;
    } else {
        TP.sys.configlookups[key] = TP.sys.configlookups[key] + 1;
    }

    //  If the key accesses a real value return it. Otherwise we've got a bit
    //  more work to do.
    val = aHash.at(key);
    if (val !== undefined) {
        return val;
    }

    keyPrefix = key + '.';

    //  If the key didn't access a direct value it may be a prefix in the sense
    //  that it's intended to access a subset of values. Try to collect them.
    arr = [];
    if (typeof aHash.getKeys === 'function') {
        keys = aHash.getKeys();
        len = keys.length;
        for (i = 0; i < len; i++) {
            if (keys[i].indexOf(keyPrefix) === 0) {
                arr.push(keys[i]);
            }
        }
    } else {
        keys = Object.keys(aHash);
        len = keys.length;
        for (i = 0; i < len; i++) {
            if (keys[i].indexOf(keyPrefix) === 0) {
                arr.push(keys[i]);
            }
        }
    }

    //  if we found at least one key then return the set, otherwise we're going
    //  to return the default value rather than an empty array since that seems
    //  the most semantically consistent
    if (arr.length > 0) {

        obj = {};
        obj.at = TP.boot.$$getprop_at;
        obj.atPut = TP.boot.$$getprop_atPut;
        obj.getKeys = TP.boot.$$getprop_getKeys;

        len = arr.length;
        for (i = 0; i < len; i++) {
            obj[arr[i]] = aHash.at(arr[i]);
        }

        return obj;
    } else {
        return aDefault;
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$$setprop = function(aHash, aKey, aValue, aPrefix, shouldSignal,
                             override) {

    /**
     * @method $$setprop
     * @summary Sets the value of the named property to the value provided.
     *     Note that properties set in this fashion are NOT persistent. To make
     *     a property persistent you must add it to the tibet.xml file or a
     *     TIBET 'rc' file. NOTE that keys are expected to have at least one '.'
     *     (period) separating their 'category' from their name as in
     *     tibet.uipath or tsh.default_ns. When no period and no prefix are
     *     defined the prefix defaults to 'tmp.'
     * @param {Object} aHash The object dictionary to update.
     * @param {String} aKey The property name to set.
     * @param {Object} aValue The value to assign.
     * @param {String} aPrefix The default prefix to use for unprefixed key
     *     values.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling.
     * @param {Boolean} override True to force an override property change.
     * @returns {Object} The value of the named property.
     */

    var key,
        oldval,
        newval;

    /* eslint-disable eqeqeq */
    if (aHash == null || aKey == null) {
        return;
    }
    /* eslint-enable eqeqeq */

    //  we'll use "tmp" as the default category when none is provided
    if (TP.boot.$$PROP_KEY_REGEX.test(aKey) === false) {
        key = aPrefix ? aPrefix + '.' + aKey : 'tmp.' + aKey;
    } else {
        key = aKey;
    }

    //  Don't override any user overrides, unless forced.
    if (TP.sys.overrides.hasOwnProperty(key)) {
        if (override !== true) {
            return;
        } else if (TP.boot.$argsDone === true) {
            TP.boot.$stdout('Forcing reset of \'' + key +
                '\' override to ' +
                JSON.stringify(aValue), TP.boot.DEBUG);
        }
    }

    oldval = aHash.at(key);

    if (aValue === 'false') {
        newval = false;
    } else if (aValue === 'true') {
        newval = true;
    } else {
        newval = aValue;
    }

    if (oldval !== newval) {
        aHash.atPut(key, newval);

        if (shouldSignal !== false &&
            TP.sys.hasStarted() &&
            typeof root.$signal === 'function') {
            root.$signal(TP.sys, aKey + 'Change', aKey);
        }

        return newval;
    }

    return oldval;
};

//  ============================================================================
//  Configuration Access
//  ============================================================================

/*
 *  Configuration properties are read/write properties which define how
 *  TIBET will operate during startup and normal operation. These properties
 *  are set to default values by the boot script. The default values are then
 *  updatedfrom the application's environment-specific configuration files
 *  and the property tags found in the application's packages as the
 *  application loads.
 */

//  ----------------------------------------------------------------------------

TP.sys.configuration = {};
TP.sys.configlookups = {};

//  Don't enumerate on our method slots for at/atPut if possible.
if (Object.defineProperty) {
    Object.defineProperty(TP.sys.configuration, 'at', {
        value: function(aKey) {
                return this[aKey];
            },
        enumerable: false
    });
    Object.defineProperty(TP.sys.configuration, 'atPut', {
        value: function(aKey, aValue) {
            this[aKey] = aValue;
        },
        enumerable: false
    });
} else {
    TP.sys.configuration.at = function(aKey) {
        return this[aKey];
    };
    TP.sys.configuration.atPut = function(aKey, aValue) {
        this[aKey] = aValue;
    };
}

//  Cache values set on the launch URL which represent user overrides.
TP.sys.overrides = {};

//  ----------------------------------------------------------------------------

TP.sys.getcfg = function(aKey, aDefault) {

    /**
     * @method getcfg
     * @summary Returns the value of the named configuration property, or the
     *     default value when the property is invalid (null or undefined).
     *     Values with no '.' are considered to be prefixes and will return the
     *     list of all configuration parameters with that prefix. If no values
     *     are found for the prefix a secondary check is done to see if the key
     *     is a value in the 'tmp.' prefix used as the default prefix. An empty
     *     key returns the full configuration dictionary.
     * @param {String} aKey The property name to retrieve.
     * @param {String} aDefault The default value to use when the named property
     *     isn't valid.
     * @returns {Object} The value of the named property.
     */

    var val;

    if (!aKey) {
        return TP.sys.configuration;
    }

    if (aKey.indexOf('.') === -1) {
        val = TP.boot.$$getprop(TP.sys.configuration, null, aDefault, aKey);
        //  Fallback to let system try to find 'tmp.{key}' as alternate.
        if (val === undefined) {
            val = TP.boot.$$getprop(TP.sys.configuration, aKey, aDefault);
        }
    } else {
        val = TP.boot.$$getprop(TP.sys.configuration, aKey, aDefault);
    }

    //  Invalid value but defined default? Return that value instead.
    if (val === null || val === undefined) {
        if (aDefault !== undefined) {
            return aDefault;
        }
    }

    return val;
};

//  ----------------------------------------------------------------------------

//  the commonly used alias
TP.sys.cfg = TP.sys.getcfg;

//  ----------------------------------------------------------------------------

TP.sys.setcfg = function(aKey, aValue, shouldSignal, override) {

    /**
     * @method setcfg
     * @summary Sets the value of the named configuration parameter. Note that
     *     properties set in this fashion are NOT persistent. To make a property
     *     persistent you must add it to the proper 'rc' file in your app's
     *     configuration path or to the tibet.xml file for your application.
     * @param {Object} aHash The object dictionary to update.
     * @param {String} aKey The property name to set.
     * @param {Object} aValue The value to assign.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling.
     * @param {Boolean} override True to force an override property change.
     * @returns {Object} The value of the named property.
     */

    //  Install a system property getter to return property values on 'TP.cfg'
    TP.sys.installSystemPropertyGetter(
        TP.cfg,
        aKey,
        function(aName) {
            return TP.sys.cfg(aName);
        });

    return TP.boot.$$setprop(TP.sys.configuration, aKey, aValue, null,
                                shouldSignal, override);
};

//  ============================================================================
//  Environment Access
//  ============================================================================

/*
 *  Environment properties are defined during application startup based
 *  on the browser environment, url settings, and similar information
 *  intended to help the application understand the context in which it is
 *  being run. These properties are considered read-only, although there is
 *  an internal $$setenv function that is used here to set the initial
 *  values. There is no $setenv.
 */

//  ----------------------------------------------------------------------------

TP.sys.environment = {};

//  Don't enumerate on our method slots for at/atPut if possible.
if (Object.defineProperty) {
    Object.defineProperty(TP.sys.environment, 'at', {
        value: function(aKey) {
            return this[aKey];
        },
        enumerable: false
    });
    Object.defineProperty(TP.sys.environment, 'atPut', {
        value: function(aKey, aValue) {
            this[aKey] = aValue;
        },
        enumerable: false
    });
} else {
    TP.sys.environment.at = function(aKey) {
        return this[aKey];
    };
    TP.sys.environment.atPut = function(aKey, aValue) {
        this[aKey] = aValue;
    };
}

//  ----------------------------------------------------------------------------

TP.boot.$getenv = function(aKey, aDefault) {

    /**
     * @method $getenv
     * @summary Returns the value of the named environment setting. These
     *     values are defined primarily by the browser detection logic in the
     *     boot script and shouldn't normally be altered. Values with no '.' are
     *     considered to be prefixes and will return the list of all environment
     *     settings with that prefix. An empty key will return the full
     *     environment dictionary.
     * @param {String} aKey The property name to retrieve.
     * @param {String} aDefault The default value to use when the named property
     *     isn't defined.
     * @returns {Object} The value of the named property.
     */

    if (!aKey) {
        return TP.sys.environment;
    }

    return TP.boot.$$getprop(TP.sys.environment, aKey, aDefault);
};

//  ----------------------------------------------------------------------------

//  the commonly used alias
TP.sys.env = TP.boot.$getenv;

//  ----------------------------------------------------------------------------

TP.boot.$$setenv = function(aKey, aValue) {

    /**
     * @method $$setenv
     * @summary An internal setter for defining the initial values of the
     *     various environment properties TIBET may use. NOTE the $$ prefix
     *     implying you shouldn't call this yourself unless you're confident of
     *     the outcome. Unprefixed values receive a prefix of 'env'.
     * @param {Object} aHash The object dictionary to update.
     * @param {String} aKey The property name to set.
     * @param {Object} aValue The value to assign.
     * @returns {Object} The value of the named property.
     */

    //  Install a system property getter to return environment values on
    //  'TP.env'
    TP.sys.installSystemPropertyGetter(
        TP.env,
        aKey,
        function(aName) {
            return TP.sys.env(aName);
        });

    return TP.boot.$$setprop(TP.sys.environment, aKey, aValue, 'env');
};

//  ----------------------------------------------------------------------------

root.TP = TP;
root.APP = APP;

}(this));

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
