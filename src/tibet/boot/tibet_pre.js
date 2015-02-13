/* copyright added via build process */

//  ============================================================================

/* jshint debug:true,
          eqnull:true,
          evil:true,
          maxerr:999,
          nonstandard:true,
          node:true
*/

/*eslint indent:0*/

//  ----------------------------------------------------------------------------

(function(root) {

//  Check for global TIBET symbols.
if (root.TP != null || root.APP != null) {
    if (!root.TP.boot || !root.TP.sys) {
        top.console.error('TIBET TP variable already mapped. Exiting.');
        return;
    }
    if (!root.APP || !root.APP) {
        top.console.error('TIBET APP variable already mapped. Exiting.');
        return;
    }
}

//  ---
//  Define TIBET global and boot-level namespace symbols.
//  ---

//  TODO: get rid of this and migrate to checking for TP/APP duo in dependent
//  files and routines (findTIBET et. al.)
root.$$tibet = root;

//  If the ECMAScript5 'defineProperty' call is available, use it to try to
//  protect our key objects from being overwritten.
if (Object.defineProperty) {

    //  The TP object, which holds global constants, functions,
    //  types, and supporting variable data.
    Object.defineProperty(root, 'TP', {value: {}, writable: false});

    //  Node.js requires seeing the actual assignment.
    TP = root.TP;

    //  The TP.boot object, which holds functions and data needed
    //  for booting and for loading code dynamically.
    Object.defineProperty(TP, 'boot', {value: {}, writable: false});

    //  The TP.sys object, which is responsible for system data,
    //  metadata, control parameters, etc.
    Object.defineProperty(TP, 'sys', {value: {}, writable: false});

    //  The TP object, which holds global constants, functions,
    //  types, and supporting variable data.
    Object.defineProperty(root, 'APP', {value: {}, writable: false});

    //  No... just no. Get a copy of Mavis Beacon and practice.
    Object.defineProperty(TP, '$', {value: null, writable: false});
    Object.defineProperty(TP, '_', {value: null, writable: false});

    //  Node.js requires seeing the actual assignment.
    APP = root.APP;

} else {
    TP = root.TP || {};
    TP.boot = TP.boot || {};
    TP.sys = TP.sys || {};
    APP = root.APP || {};
}

//  ----------------------------------------------------------------------------
//  Global Management
//  ----------------------------------------------------------------------------

//  now we set up the 'global' object reference on 'TP.global'. This is an
//  interesting one-liner that works in any environment to obtain the
//  global.

//  Turn off the JSHint warning - we know we're invoking the 'Function'
//  constructor without 'new'... that's part of the trick.
/* jshint ignore:start */
/* eslint-disable new-cap */
TP.global = Function('return this')() || (42, eval)('this');
/* eslint-enable new-cap */
/* jshint ignore:end */

if (!TP.sys.$nativeglobals) {

    //  NB: Put this logic in an enclosing function so that we can use local
    //  vars without them being hoisted into the global space.

    //  Collect current globals as a rough baseline. NOTE that things parsed by
    //  the JS interpreter prior to starting the execution phase will still end
    //  up in this list so it's not particularly accurate, but it is more
    //  complete than just typing in the "big 8" types. Also note the use of
    //  'TP.global' here, which we use when we mean the global context and not
    //  the window from a semantic perspective.

    (function () {

        var getProps,
            uniqueProps;

        //  Traverse the prototype chain using the property names of the target.
        getProps = function(target) {
            return target ? Object.getOwnPropertyNames(target)
                .concat(getProps(Object.getPrototypeOf(target))) : [] ;
        };

        //  Unique the property names.
        uniqueProps = function(props) {
            return props.filter(function (value, index) {
                return props.lastIndexOf(value) === index;
            });
        };

        //  Get all of the unique property names from TP.global.
        TP.sys.$nativeglobals = uniqueProps(getProps(TP.global).sort());
    }());
}

//  define the tracking collection for TIBET's global symbols so any
//  early-stage boot configs can leverage the TP.sys.defineGlobal call
if (TP.sys.$globals == null) {
    TP.sys.$globals = [];
}

//  ---
//  Patch in baseline namespace API functions.
//  ---

TP.$$isNamespace = true;
TP.$$name = 'TP';
TP.getTypeNames = function() {return [];};

TP.boot.$$isNamespace = true;
TP.boot.$$name = 'TP.boot';
TP.boot.getTypeNames = function() {return [];};

TP.sys.$$isNamespace = true;
TP.sys.$$name = 'TP.sys';
TP.sys.getTypeNames = function() {return [];};

APP.$$isNamespace = true;
APP.$$name = 'APP';
APP.getTypeNames = function() {return [];};

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
TP.SEVERE = 'SEVERE';
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
TP.boot.SEVERE = 6;
TP.boot.FATAL = 7;
TP.boot.SYSTEM = 8;
TP.boot.OFF = 9;

TP.boot.LOG_NAMES = [
    'ALL',
    'TRACE',
    'DEBUG',
    'INFO',
    'WARN',
    'ERROR',
    'SEVERE',
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

//  the actual buffer size used. the log.level setting is used as a starting
//  point but adjusted based on log level to balance speed with user-feedback.
//  Initialized to null awaiting first computation based on log.buffersize.
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

TP.NOOP = function() {};

//  TIBET signaling key for "all objects or origins".
TP.ANY = 'ANY';

TP.FAILED = 4;                              //  See TIBETGlobals.js for value.
TP.NOT_FOUND = -1;                          //  missing data
TP.BAD_INDEX = -1;                          //  bad array index
TP.NO_SIZE = -1;                            //  bad object size
TP.NO_RESULT = Number.NEGATIVE_INFINITY;    //  invalid response

//  file load return types
TP.DOM = 1;
TP.TEXT = 2;
TP.XHR = 3;
TP.WRAP = 4;
TP.BEST = 5;

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

//  HTTP verb/call types
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

TP.boot.$$KV_REGEX = /\=/;

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
TP.HAS_MARKUP_REGEX = /<\//;    // Simple but effective for boot code use.

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

//  The version number defines which build files can be processed. When a
//  bootfile specifies a version it cannot be more recent than this or the
//  process will be terminated with a version mismatch error.
//  TODO: inject this value based on build-time parameters which assemble a
//  minified boot package.
TP.boot.$bootversion = '20140203';

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

//  where did we end up locating the boot.tibetinf directory? filled in
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

//  filled in by each config file...must be older than TP.boot.$bootversion
TP.boot.$$version = null;

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
//  package_file#config
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
TP.boot.$loadNode = null;

//  placeholder for the currently loading script file, used to support
//  object source code reflection.
TP.boot.$loadPath = null;
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

/*
 * The colors/control codes below are from colors.js
 * Copyright (c) 2010 Marak Squires, Alexis Sellier (cloudhead)
 * TODO: replace with ansi.js and/or alternative so we get 256-color support.
 */

TP.boot.$$styles = {};

TP.boot.$$styles.browser = {
    //styles
    bold: ['<b>', '</b>'],
    italic: ['<i>', '</i>'],
    underline: ['<u>', '</u>'],
    inverse: ['<span style="background-color:black;color:white;">',
      '</span>'],
    strikethrough: ['<del>', '</del>'],
    //text colors
    //grayscale
    white: ['<span style="color:white;">', '</span>'],
    grey: ['<span style="color:#aaa;">', '</span>'],
    black: ['<span style="color:black;">', '</span>'],
    //colors
    blue: ['<span style="color:blue;">', '</span>'],
    cyan: ['<span style="color:cyan;">', '</span>'],
    green: ['<span style="color:green;">', '</span>'],
    magenta: ['<span style="color:magenta;">', '</span>'],
    red: ['<span style="color:red;">', '</span>'],
    yellow: ['<span style="color:yellow;">', '</span>'],
    //background colors
    //grayscale
    whiteBG: ['<span style="background-color:white;">', '</span>'],
    greyBG: ['<span style="background-color:#aaa;">', '</span>'],
    blackBG: ['<span style="background-color:black;">', '</span>'],
    //colors
    blueBG: ['<span style="background-color:blue;">', '</span>'],
    cyanBG: ['<span style="background-color:cyan;">', '</span>'],
    greenBG: ['<span style="background-color:green;">', '</span>'],
    magentaBG: ['<span style="background-color:magenta;">', '</span>'],
    redBG: ['<span style="background-color:red;">', '</span>'],
    yellowBG: ['<span style="background-color:yellow;">', '</span>']
};

// Generate one for output to the browser console that avoids injecting markup
// or control codes...neither will work.
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

TP.boot.$$styles.terminal = {
    //styles
    bold: ['\x1B[1m', '\x1B[22m'],
    italic: ['\x1B[3m', '\x1B[23m'],
    underline: ['\x1B[4m', '\x1B[24m'],
    inverse: ['\x1B[7m', '\x1B[27m'],
    strikethrough: ['\x1B[9m', '\x1B[29m'],
    //text colors
    //grayscale
    white: ['\x1B[37m', '\x1B[39m'],
    grey: ['\x1B[90m', '\x1B[39m'],
    black: ['\x1B[30m', '\x1B[39m'],
    //colors
    blue: ['\x1B[34m', '\x1B[39m'],
    cyan: ['\x1B[36m', '\x1B[39m'],
    green: ['\x1B[32m', '\x1B[39m'],
    magenta: ['\x1B[35m', '\x1B[39m'],
    red: ['\x1B[31m', '\x1B[39m'],
    yellow: ['\x1B[33m', '\x1B[39m'],
    //background colors
    //grayscale
    whiteBG: ['\x1B[47m', '\x1B[49m'],
    greyBG: ['\x1B[49;5;8m', '\x1B[49m'],
    blackBG: ['\x1B[40m', '\x1B[49m'],
    //colors
    blueBG: ['\x1B[44m', '\x1B[49m'],
    cyanBG: ['\x1B[46m', '\x1B[49m'],
    greenBG: ['\x1B[42m', '\x1B[49m'],
    magentaBG: ['\x1B[45m', '\x1B[49m'],
    redBG: ['\x1B[41m', '\x1B[49m'],
    yellowBG: ['\x1B[43m', '\x1B[49m']
};

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
    log: 'Prelaunch',
    head: 'Pre-Launch',
    sub: 'Verifying environment...',
    image: '~lib_img/boot/tpi_logo.png'
},
configuring: {
    order: 1,
    log: 'Configure',
    head: 'Configure',
    sub: 'Reading configuration...',
    image: '~lib_img/boot/tpi_logo.png'
},
expanding: {
    order: 2,
    log: 'Expanding',
    head: 'Expanding',
    sub: 'Processing boot manifest...',
    image: '~lib_img/boot/tpi_logo.png'
},
import_phase_one: {
    order: 3,
    log: 'Import Phase One',
    head: 'Import Phase One',
    sub: 'Importing phase-one (static/library) components...',
    image: '~lib_img/boot/tibet_logo.png'
},
import_paused: {
    order: 4,
    log: 'Import Pause',
    head: 'Import Paused',
    sub: 'Waiting to start phase-two import...',
    image: '~lib_img/boot/playpause.png'
},
import_phase_two: {
    order: 5,
    log: 'Import Phase Two',
    head: 'Import Phase Two',
    sub: 'Importing phase-two (dynamic/application) components...',
    image: '~lib_img/boot/tpi_logo.png'
},
paused: {
    order: 6,
    log: 'Paused',
    head: 'Paused',
    sub: 'Proceed when ready.',
    image: '~lib_img/boot/playpause.png'
},
activating: {
    order: 7,
    log: 'Activating',
    head: 'Activating',
    sub: 'Activating application...',
    image: '~lib_img/boot/tpi_logo.png',
    fatal: true
},
initializing: {
    order: 8,
    log: 'Initialization',
    head: 'Initializing',
    sub: 'Initializing loaded components...',
    image: '~lib_img/boot/tpi_logo.png',
    fatal: true
},
rendering: {
    order: 9,
    log: 'Rendering',
    head: 'Rendering',
    sub: 'Rendering application UI...',
    image: '~lib_img/boot/tpi_logo.png',
    fatal: true
},
liftoff: {
    order: 10,
    log: 'Started',
    head: 'Started',
    sub: 'Application running.',
    image: '~lib_img/boot/tpi_logo.png',
    hook: function() {
        TP.boot.$displayStatus('Application running: ' +
            (TP.boot.$getStageTime('started', 'prelaunch') -
            TP.boot.$getStageTime('paused')) + 'ms.');
            TP.boot.hideUIBoot();
    }
},
stopped: {
    order: 11,
    log: 'Stopped',
    head: 'Stopped',
    sub: 'Boot halted.',
    image: '~lib_img/boot/alert.png',
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

    // Inadequate for real work but good enough for boot code.
    return value === null || value === undefined || value.length === 0;
};

//  ----------------------------------------------------------------------------

TP.boot.$isNumber = function(value) {

    /**
     * @method $isNumber
     * @summary Returns true if the value is a true number (not NaN etc).
     * @returns {Boolean} True if the value is a number.
     */

    // Sadly, some edge case things might not pass this, but they don't tend to
    // show up during boot processing.
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

//  ----------------------------------------------------------------------------

TP.boot.$notEmpty = function(value) {

    /**
     * @method $notEmpty
     * @summary Returns true if the value is either invalid or empty.
     * @returns {Boolean} True if the value is invalid or empty.
     */

    // Inadequate for real work but good enough for boot code.
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
//  Environment and Configuration Primitives
//  ============================================================================

/*
 * General purpose routines used by environment and configuration property
 * routines to manage the values in the TIBET environment and configuration
 * dictionaries.
 */

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

    var prefix,
        val,
        key,
        arr,
        keys,
        len,
        i,
        obj;

    if (aHash == null) {
        return aDefault;
    }

    //  no keys or prefixes? whole catalog then unless we've got a default
    if (!aKey) {
        if (!aPrefix) {
            if (aDefault !== undefined) {
                return aDefault;
            }

            return aHash;
        } else {
            //  no key but a prefix, return all for that prefix
            arr = [];
            if (typeof aHash.getKeys === 'function') {
                keys = aHash.getKeys();
                len = keys.length;
                for (i = 0; i < len; i++) {
                    if (keys[i].indexOf(aPrefix + '.') === 0) {
                        arr.push(keys[i]);
                    }
                }
            } else {
                for (i in aHash) {
                    if (aHash.hasOwnProperty(i)) {
                        if (i.indexOf(aPrefix + '.') === 0) {
                            arr.push(i);
                        }
                    }
                }
            }

            //  if we found at least one key then return the set, otherwise
            //  we're going to return the default value rather than an empty
            //  array since that seems the most semantically consistent
            if (arr.length > 0) {
                //  NOTE that we rely on having at least gotten past the
                //  initial boot sequence before entering this branch so
                //  we're certain of having at least primitive hash objects.
                obj = {};
                obj.at = function(aKey) {return this[aKey];};
                obj.atPut = function(aKey, aValue) {this[aKey] = aValue;};

                len = arr.length;
                for (i = 0; i < len; i++) {
                    obj.atPut(arr[i], aHash.at(arr[i]));
                }

                return obj;
            } else {
                return aDefault;
            }
        }
    } else if (TP.boot.$$PROP_KEY_REGEX.test(aKey) === false) {
        //  default for the prefix is 'tmp' to match up with $setprop
        prefix = aPrefix || 'tmp';
        key = prefix + '.' + key;
    } else {
        //  key has a separator, use it as-is
        key = aKey;
    }

    val = aHash.at(key);
    if (val === undefined) {
        return aDefault;
    }

    return val;
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

    if (aHash == null || aKey == null) {
        return;
    }

    //  we'll use "tmp" as the default category when none is provided
    if (TP.boot.$$PROP_KEY_REGEX.test(aKey) === false) {
        key = aPrefix ? aPrefix + '.' + aKey : 'tmp.' + aKey;
    } else {
        key = aKey;
    }

    // Don't override any user overrides, unless forced.
    if (TP.sys.overrides.hasOwnProperty(key)) {
      if (override !== true) {
        return;
      } else if (TP.boot.$argsDone === true) {
        TP.boot.$stdout('Forcing reset of \'' + key +
                        '\' override to ' + aValue, TP.boot.DEBUG);
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
            typeof window.$signal === 'function') {
            window.$signal(TP.sys, aKey + 'Change', aKey);
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

//  Don't enumerate on our method slots for at/atPut if possible.
if (Object.defineProperty) {
    Object.defineProperty(TP.sys.configuration, 'at', {
        value: function(aKey) {return this[aKey];},
        enumerable: false
    });
    Object.defineProperty(TP.sys.configuration, 'atPut', {
        value: function(aKey, aValue) {this[aKey] = aValue;},
        enumerable: false
    });
} else {
    TP.sys.configuration.at = function(aKey) {return this[aKey];};
    TP.sys.configuration.atPut = function(aKey, aValue) {this[aKey] = aValue;};
}

// Cache values set on the launch URL which represent user overrides.
TP.sys.overrides = {};

//  ----------------------------------------------------------------------------

TP.sys.getcfg = function(aKey, aDefault) {

    /**
     * @method getcfg
     * @summary Returns the value of the named configuration property, or the
     *     default value when the property is undefined. Values with no '.' are
     *     considered to be prefixes and will return the list of all
     *     configuration parameters with that prefix. An empty key will return
     *     the full configuration dictionary.
     * @param {String} aKey The property name to retrieve.
     * @param {String} aDefault The default value to use when the named property
     *     isn't defined.
     * @returns {Object} The value of the named property.
     */

    var val;

    if (!aKey) {
        return TP.sys.configuration;
    }

    if (aKey.indexOf('.') === -1) {
        val = TP.boot.$$getprop(TP.sys.configuration, null, aDefault, aKey);
    } else {
        val = TP.boot.$$getprop(TP.sys.configuration, aKey, aDefault);
    }

    if (val === undefined) {
        return aDefault;
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
     *     configuration path) or to the tibet.xml file for your application.
     *     Unprefixed values receive a prefix of 'cfg'.
     * @param {Object} aHash The object dictionary to update.
     * @param {String} aKey The property name to set.
     * @param {Object} aValue The value to assign.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling.
     * @param {Boolean} override True to force an override property change.
     * @returns {Object} The value of the named property.
     */

    return TP.boot.$$setprop(TP.sys.configuration, aKey, aValue, 'cfg',
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
        value: function(aKey) {return this[aKey];},
        enumerable: false
    });
    Object.defineProperty(TP.sys.environment, 'atPut', {
        value: function(aKey, aValue) {this[aKey] = aValue;},
        enumerable: false
    });
} else {
    TP.sys.environment.at = function(aKey) {return this[aKey];};
    TP.sys.environment.atPut = function(aKey, aValue) {this[aKey] = aValue;};
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

    return TP.boot.$$setprop(TP.sys.environment, aKey, aValue, 'env');
};

//  ============================================================================
//  Export
//  ============================================================================

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = TP;
    }
    exports.TP = TP;
    exports.APP = APP;
} else {
    root.TP = TP;
    root.APP = APP;
}

}(this));

//  ----------------------------------------------------------------------------
//  end
//  ============================================================================
