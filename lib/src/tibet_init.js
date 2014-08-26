//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */

/* copyright added via build process */

/* jshint debug:true,
          eqnull:true,
          evil:true,
          maxerr:999,
          nonstandard:true,
          node:true
*/

;(function(root) {

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

    //  Node.js requires seeing the actual assignment.
    APP = root.APP;

} else {
    TP = root.TP || {};
    TP.sys = TP.sys || {};
    TP.boot = TP.boot || {};
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
TP.global = Function('return this')() || (42, eval)('this');
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
    })();
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

TP.sys.$$isNamespace = true;
TP.sys.$$name = 'TP.sys';
TP.sys.getTypeNames = function() {return [];};

TP.boot.$$isNamespace = true;
TP.boot.$$name = 'TP.boot';
TP.boot.getTypeNames = function() {return [];};

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

//  Boot system versions (TODO: refine to one pair coupled with TP.TRACE)
TP.boot.$debug = true;
TP.boot.$verbose = true;
TP.boot.$$debug = true;
TP.boot.$$verbose = true;

//  ---
//  Configure bootstrap logging control variables.
//  ---

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

TP.FAILURE = -1;                            //  general failure status code
TP.NOT_FOUND = -1;                          //  missing data
TP.BAD_INDEX = -1;                          //  bad array index
TP.NO_SIZE = -1;                            //  bad object size
TP.NO_RESULT = Number.NEGATIVE_INFINITY;    //  invalid response

//  log level constants
TP.TRACE = 0;
TP.INFO = 1;
TP.WARN = 2;
TP.ERROR = 3;
TP.SEVERE = 4;
TP.FATAL = 5;
TP.SYSTEM = 6;

//  log names
TP.BOOT_LOG = 'Boot';

//  log entry slot indices
TP.LOG_ENTRY_DATE = 0;
TP.LOG_ENTRY_NAME = 1;
TP.LOG_ENTRY_LEVEL = 2;
TP.LOG_ENTRY_PAYLOAD = 3;
TP.LOG_ENTRY_CONTEXT = 4;
TP.LOG_ENTRY_DELTA = 5;
TP.LOG_ENTRY_STACK_NAMES = 4;   //  TODO: valid?
TP.LOG_ENTRY_STACK_ARGS = 5;

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

TP.boot.$$KV_REGEX = /=/;

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
    'bold'      : ['<b>',  '</b>'],
    'italic'    : ['<i>',  '</i>'],
    'underline' : ['<u>',  '</u>'],
    'inverse'   : ['<span style="background-color:black;color:white;">',
      '</span>'],
    'strikethrough' : ['<del>',  '</del>'],
    //text colors
    //grayscale
    'white'     : ['<span style="color:white;">',   '</span>'],
    'grey'      : ['<span style="color:#aaa;">',    '</span>'],
    'black'     : ['<span style="color:black;">',   '</span>'],
    //colors
    'blue'      : ['<span style="color:blue;">',    '</span>'],
    'cyan'      : ['<span style="color:cyan;">',    '</span>'],
    'green'     : ['<span style="color:green;">',   '</span>'],
    'magenta'   : ['<span style="color:magenta;">', '</span>'],
    'red'       : ['<span style="color:red;">',     '</span>'],
    'yellow'    : ['<span style="color:yellow;">',  '</span>'],
    //background colors
    //grayscale
    'whiteBG'     : ['<span style="background-color:white;">',   '</span>'],
    'greyBG'      : ['<span style="background-color:#aaa;">',    '</span>'],
    'blackBG'     : ['<span style="background-color:black;">',   '</span>'],
    //colors
    'blueBG'      : ['<span style="background-color:blue;">',    '</span>'],
    'cyanBG'      : ['<span style="background-color:cyan;">',    '</span>'],
    'greenBG'     : ['<span style="background-color:green;">',   '</span>'],
    'magentaBG'   : ['<span style="background-color:magenta;">', '</span>'],
    'redBG'       : ['<span style="background-color:red;">',     '</span>'],
    'yellowBG'    : ['<span style="background-color:yellow;">',  '</span>']
};

// Generate one for output to the browser console that avoids injection markup
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
    'bold'      : ['\x1B[1m',  '\x1B[22m'],
    'italic'    : ['\x1B[3m',  '\x1B[23m'],
    'underline' : ['\x1B[4m',  '\x1B[24m'],
    'inverse'   : ['\x1B[7m',  '\x1B[27m'],
    'strikethrough' : ['\x1B[9m',  '\x1B[29m'],
    //text colors
    //grayscale
    'white'     : ['\x1B[37m', '\x1B[39m'],
    'grey'      : ['\x1B[90m', '\x1B[39m'],
    'black'     : ['\x1B[30m', '\x1B[39m'],
    //colors
    'blue'      : ['\x1B[34m', '\x1B[39m'],
    'cyan'      : ['\x1B[36m', '\x1B[39m'],
    'green'     : ['\x1B[32m', '\x1B[39m'],
    'magenta'   : ['\x1B[35m', '\x1B[39m'],
    'red'       : ['\x1B[31m', '\x1B[39m'],
    'yellow'    : ['\x1B[33m', '\x1B[39m'],
    //background colors
    //grayscale
    'whiteBG'     : ['\x1B[47m', '\x1B[49m'],
    'greyBG'      : ['\x1B[49;5;8m', '\x1B[49m'],
    'blackBG'     : ['\x1B[40m', '\x1B[49m'],
    //colors
    'blueBG'      : ['\x1B[44m', '\x1B[49m'],
    'cyanBG'      : ['\x1B[46m', '\x1B[49m'],
    'greenBG'     : ['\x1B[42m', '\x1B[49m'],
    'magentaBG'   : ['\x1B[45m', '\x1B[49m'],
    'redBG'       : ['\x1B[41m', '\x1B[49m'],
    'yellowBG'    : ['\x1B[43m', '\x1B[49m']
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
importing: {
    order: 3,
    log: 'Importing',
    head: 'Importing',
    sub: 'Importing manifest assets...',
    image: '~lib_img/boot/tpi_logo.png'
},
import_phase_one: {
    order: 4,
    log: 'Import Phase One',
    head: 'Import Phase One',
    sub: 'Importing phase-one (static/library) components...',
    image: '~lib_img/boot/tibet_logo.png'
},
import_paused: {
    order: 5,
    log: 'Import Pause',
    head: 'Import Paused',
    sub: 'Waiting to start phase-two import...',
    image: '~lib_img/boot/playpause.png'
},
import_phase_two: {
    order: 6,
    log: 'Import Phase Two',
    head: 'Import Phase Two',
    sub: 'Importing phase-two (dynamic/application) components...',
    image: '~lib_img/boot/tpi_logo.png'
},
import_complete: {
    order: 7,
    log: 'Import Complete',
    head: 'Import Complete',
    sub: 'Components loaded.',
    image: '~lib_img/boot/tpi_logo.png'
},
paused: {
    order: 8,
    log: 'Paused',
    head: 'Paused',
    sub: 'Proceed when ready.',
    image: '~lib_img/boot/playpause.png'
},
activating: {
    order: 9,
    log: 'Activating',
    head: 'Activating',
    sub: 'Activating application...',
    image: '~lib_img/boot/tpi_logo.png',
    fatal: true
},
initializing: {
    order: 10,
    log: 'Initialization',
    head: 'Initializing',
    sub: 'Initializing loaded components...',
    image: '~lib_img/boot/tpi_logo.png',
    fatal: true
},
rendering: {
    order: 11,
    log: 'Rendering',
    head: 'Rendering',
    sub: 'Rendering application UI...',
    image: '~lib_img/boot/tpi_logo.png',
    fatal: true
},
liftoff: {
    order: 12,
    log: 'Started',
    head: 'Started',
    sub: 'Application running.',
    image: '~lib_img/boot/tpi_logo.png',
    hook: function() {
        TP.boot.$displayStatus('Application running: ' +
            (TP.boot.$getStageTime('started', 'prelaunch') -
            TP.boot.$getStageTime('paused')) + 'ms.');
        if (!TP.sys.cfg('boot.tdc')) {
            TP.boot.hideUIBoot();
        }
    }
},
stopped: {
    order: 13,
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
})();

//  ---
//  URI schemes
//  ---

//  base schemes potentially used during boot processing
TP.SCHEMES = ['http', 'file', 'tibet', 'https', 'chrome-extension'];

//  Considered 'built-in' by TIBET, but other schemes are added when
//  registered.
TP.boot.$uriSchemes = {
    'tibet':'tibet',    // common
    'urn':'urn',        // common
    'http':'http',      // common
    'https':'https',    // common
    'file':'file',      // common
    'xmpp':'xmpp',      // common
    'about':'about',    // common
    'mailto':'mailto',  // common
    'tel':'tel',        // common
    'news':'news',      // common
    'nntp':'nntp',      // common
    'ftp':'ftp',        // common
    'ws':'ws',          // common
    'wss':'wss',        // common

    'aaa':'aaa',
    'aaas':'aaas',
    'acap':'acap',
    'cap':'cap',
    'cid':'cid',
    'crid':'crid',
    'data':'data',
    'dav':'dav',
    'dict':'dict',
    'dns':'dns',
    'fax':'fax',
    'go':'go',
    'gopher':'gopher',
    'h323':'h323',
    'icap':'icap',
    'im':'im',
    'imap':'imap',
    'info':'info',
    'ipp':'ipp',
    'iris':'iris',
    'iris.beep':'iris.beep',
    'iris.xpc':'iris.xpc',
    'iris.xpcs':'iris.xpcs',
    'iris.lws':'iris.lws',
    'ldap':'ldap',
    'lsid':'lsid',
    'mid':'mid',
    'modem':'modem',
    'msrp':'msrp',
    'msrps':'msrps',
    'mtqp':'mtqp',
    'mupdate':'mupdate',
    'nfs':'nfs',
    'opaquelocktoken':'opaquelocktoken',
    'pop':'pop',
    'pres':'pres',
    'prospero':'prospero',
    'rtsp':'rtsp',
    'service':'service',
    'shttp':'shttp',
    'sip':'sip',
    'sips':'sips',
    'snmp':'snmp',
    'soap.beep':'soap.beep',
    'soap.beeps':'soap.beeps',
    'tag':'tag',
    'telnet':'telnet',
    'tftp':'tftp',
    'thismessage':'thismessage',
    'tip':'tip',
    'tv':'tv',
    'vemmi':'vemmi',
    'wais':'wais',
    'xmlrpc.beep':'xmlrpc.beep',
    'z39.50r':'z39.50r',
    'z39.50s':'z39.50s'
};

//  ----------------------------------------------------------------------------
//  Value Checking
//  ----------------------------------------------------------------------------

TP.boot.$isArgumentArray = function(value) {

    /**
     * @name $isArgumentArray
     * @summary Returns true if the value is an arguments array.
     * @return {Boolean} True if the value is an arguments array.
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
     * @return {Boolean} True if the object is an element.
     */

    return TP.boot.$isValid(value) && value.nodeType === 1;
};

//  ----------------------------------------------------------------------------

TP.boot.$isEmpty = function(value) {

    /**
     * @name $isEmpty
     * @summary Returns true if the value is either invalid or empty.
     * @return {Boolean} True if the value is invalid or empty.
     */

    // Inadequate for real work but good enough for boot code.
    return value === null || value === undefined || value.length === 0;
};

//  ----------------------------------------------------------------------------

TP.boot.$isNumber = function(value) {

    /**
     * @name $isNumber
     * @summary Returns true if the value is a true number (not NaN etc).
     * @return {Boolean} True if the value is a number.
     */

    // Sadly, some edge case things might not pass this, but they don't tend to
    // show up during boot processing.
    return typeof(value) === 'number' && !isNaN(value);
};

//  ----------------------------------------------------------------------------

TP.boot.$isValid = function(value) {

    /**
     * @name $isValid
     * @summary Returns true if the value is neither null nor undefined.
     * @return {Boolean} True if the value is 'valid'.
     */

    return value !== null && value !== undefined;
};

//  ----------------------------------------------------------------------------

TP.boot.$notEmpty = function(value) {

    /**
     * @name $notEmpty
     * @summary Returns true if the value is either invalid or empty.
     * @return {Boolean} True if the value is invalid or empty.
     */

    // Inadequate for real work but good enough for boot code.
    return value !== null && value !== undefined &&
        value.length !== undefined && value.length !== 0;
};

//  ----------------------------------------------------------------------------

TP.boot.$notValid = function(value) {

    /**
     * @name $notValid
     * @summary Returns true if the value is either null or undefined.
     * @return {Boolean} True if the value is 'invalid'.
     */

    return value === null || value === undefined;
};

//  ----------------------------------------------------------------------------

TP.sys.defineGlobal = function(aName, aValue, force) {

    /**
     * @name defineGlobal
     * @summary Defines a global variable and adds it to TIBET's list of
     *     globals. This list is used to support symbol exports. Note that while
     *     this does have the effect of setting a global value there is no
     *     change notification associated with this operation. Use set() to
     *     achieve that effect.
     * @param {String} aName The global name to define.
     * @param {Object} aValue The value to set for the global.
     * @param {Boolean} force True means an existing value will be forcefully
     *     replaced with the new value. The default is false.
     * @return {Object} The value after setting.
     * @todo
     */

    var wasUndefined;

    if (TP.boot.$notValid(aName) || aName === '') {
        return;
    }

    //  we're lazy here so that all globals are ensured to be registered
    //  even if that means we duplicate a few names. that'll be cleared up
    //  when this is converted to a hash during finalization
    TP.sys.$globals.push(aName);

    wasUndefined = (typeof(TP.global[aName]) === 'undefined');

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
     * @name hasInitialized
     * @summary Combined setter/getter defining whether TIBET's initialization
     *     sequence has completed and the system is in a usable state. Note that
     *     initialized is not the same as started. Initialized simply means we
     *     can try to start the application's top-level entry point now.
     * @param {Boolean} aFlag True to signify the system is initialized.
     * @return {Boolean} The current state.
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
     * @name hasKernel
     * @summary Combined setter/getter defining whether the TIBET kernel has
     *     been loaded. This can be helpful when you want to leverage
     *     functionality in the kernel during startup but need to be sure the
     *     kernel has successfully loaded.
     * @param {Boolean} aFlag True to signify kernel is available.
     * @return {Boolean} The current state.
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
     * @name hasLoaded
     * @summary Combined setter/getter defining whether TIBET's load process
     *     has completed. This isn't meant to imply that TIBET is in a useable
     *     state, you should use TP.sys.hasInitialized() and or
     *     TP.sys.hasStarted() to check for a specific 'live' state.
     * @param {Boolean} aFlag True to signify load completion.
     * @return {Boolean} The current state.
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
     * @name hasStarted
     * @summary Combined setter/getter defining whether TIBET's application
     *     startup sequence has completed and a TP.core.Application instance is
     *     now acting as the application controller.
     * @param {Boolean} aFlag True to signify the system has started.
     * @return {Boolean} The current state.
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

//  ----------------------------------------------------------------------------
//  Environment and Configuration Primitives
//  ----------------------------------------------------------------------------

/*
 * General purpose routines used by environment and configuration property
 * routines to manage the values in the TIBET environment and configuration
 * dictionaries.
 */

//  ----------------------------------------------------------------------------

TP.boot.$$getprop = function(aHash, aKey, aDefault, aPrefix) {

    /**
     * @name $$getprop
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
     * @return {Object} The value of the property.
     * @todo
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
            if (typeof(aHash.getKeys) === 'function') {
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
     * @name $$setprop
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
     * @return {Object} The value of the named property.
     * @todo
     */

    var key,
        oldval,
        newval;

    if (aHash == null || aKey == null) {
        return;
    }

    //  we'll use "tmp" as the default category when none is provided
    if (TP.boot.$$PROP_KEY_REGEX.test(aKey) === false) {
        key = (aPrefix) ? aPrefix + '.' + aKey : 'tmp.' + aKey;
    } else {
        key = aKey;
    }

    // Don't override any user overrides, unless forced.
    if (TP.sys.overrides.hasOwnProperty(key)) {
      if (override !== true) {
        return;
      } else if (TP.boot.$argsDone === true) {
        TP.boot.$stdout('Forcing reset of \'' + key +
                        '\' override to ' + aValue, TP.TRACE);
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
            typeof(window.$signal) === 'function') {
            window.$signal(TP.sys, aKey + 'Change', arguments, aKey);
        }
    }

    return aHash.at(key);
};

//  ----------------------------------------------------------------------------
//  Configuration Access
//  ----------------------------------------------------------------------------

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
     * @name getcfg
     * @summary Returns the value of the named configuration property, or the
     *     default value when the property is undefined. Values with no '.' are
     *     considered to be prefixes and will return the list of all
     *     configuration parameters with that prefix. An empty key will return
     *     the full configuration dictionary.
     * @param {String} aKey The property name to retrieve.
     * @param {String} aDefault The default value to use when the named property
     *     isn't defined.
     * @return {Object} The value of the named property.
     * @todo
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
     * @name setcfg
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
     * @return {Object} The value of the named property.
     * @todo
     */

    return TP.boot.$$setprop(TP.sys.configuration, aKey, aValue, 'cfg',
                                shouldSignal, override);
};

//  ----------------------------------------------------------------------------
//  Environment Access
//  ----------------------------------------------------------------------------

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
     * @name $getenv
     * @summary Returns the value of the named environment setting. These
     *     values are defined primarily by the browser detection logic in the
     *     boot script and shouldn't normally be altered. Values with no '.' are
     *     considered to be prefixes and will return the list of all environment
     *     settings with that prefix. An empty key will return the full
     *     environment dictionary.
     * @param {String} aKey The property name to retrieve.
     * @param {String} aDefault The default value to use when the named property
     *     isn't defined.
     * @return {Object} The value of the named property.
     * @todo
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
     * @name $$setenv
     * @summary An internal setter for defining the initial values of the
     *     various environment properties TIBET may use. NOTE the $$ prefix
     *     implying you shouldn't call this yourself unless you're confident of
     *     the outcome. Unprefixed values receive a prefix of 'env'.
     * @param {Object} aHash The object dictionary to update.
     * @param {String} aKey The property name to set.
     * @param {Object} aValue The value to assign.
     * @return {Object} The value of the named property.
     * @todo
     */

    return TP.boot.$$setprop(TP.sys.environment, aKey, aValue, 'env');
};

//  ----------------------------------------------------------------------------
//  Export
//  ----------------------------------------------------------------------------

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



//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/*global TP:false*/

//  ----------------------------------------------------------------------------
//  Default Boot Configuration Settings
//  ----------------------------------------------------------------------------

/**
 * With the setcfg function in place we can now set the baseline properties
 * required to ensure things can boot. Additional settings at the end of
 * this file cover the remaining set of configuration parameters.
 *
 * --------------- NOTE NOTE NOTE ---------------
 *
 * Don't change these here. If you must make an alteration use overrides on
 * the launch URL, tibet.json, or your project manifest file(s).
 */

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
//  logging
//  ---

//  controls process reporting during the launch. setting this to true
//  here (and in the tibet.xml file) will cause a few more lines of
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
//  project data
//  ---

//  the project's "identifier string", typically placed in the notifier when
//  using a TAP-based project upon startup.
TP.sys.setcfg('project.ident', null);

//  what's this application called? this affects the default value of the
//  home page that will load. NOTE that this is updated with the tibet.xml
//  file's project name, and can then be refined by the environment files
TP.sys.setcfg('project.name', null);

//  the project's version string. this can be any value, but altering it in
//  the root package file will trigger cache refresh logic
TP.sys.setcfg('project.version', null);

//  the project's default root page. The default value is UIROOT.xhtml.
TP.sys.setcfg('project.rootpage', null);


//  ---
//  phase control
//  ---

//  under the covers booting always occurs in two phases and we manipulate
//  the settings in these configuration properties to control manifest
//  generation and importing. when 'single-phase' booting is requested it
//  simply means phase two begins immediately upon completion of phase one.
TP.sys.setcfg('boot.phaseone', true);
TP.sys.setcfg('boot.phasetwo', false);

//  do we start with a login page?
TP.sys.setcfg('boot.uselogin', false);

//  when using a login page do we boot in parallel, meaning we start loading the
//  tibet code (phase one) in parallel or do we wait until login succeeds?
TP.sys.setcfg('boot.parallel', true);

//  should we skip loading a bootstrap file? default is false to load the
//  boot.boostrap JSON file (tibet.json by default). turning this off means all
//  parameters critical to booting must be given in the launch() call or on the
//  URL.
TP.sys.setcfg('boot.nobootstrap', false);

//  should we allow url-level overrides of setcfg parameters. by default this is
//  set to true, but it can be configured to off during launch() invocation.
TP.sys.setcfg('boot.nourlargs', false);


//  ---
//  process control
//  ---

//  overall deferred loading flag. when false the defer attribute is ignored
//  and all script nodes are loaded. when true the nodes are captured in the
//  manifest but their code isn't actually loaded during initial startup.
TP.sys.setcfg('boot.defer', true);

//  what threshold in milliseconds constitues something worth colorizing to draw
//  attention to the fact it's a long-running step that may need tuning. This
//  value is only applied when logging is TP.TRACE level.
TP.sys.setcfg('boot.delta_threshold', 50);

//  maximum number of errors before we automatically stop the boot process.
TP.sys.setcfg('boot.error_max', 20);

//  should we treat errors in 'fatalistic' stages as truly fatal? Some apps
//  don't care and want to continue unless it's a truly fatal error.
TP.sys.setcfg('boot.fatalistic', false);

//  should the boot pause once all code has loaded to allow for setting
//  breakpoints in the debugger or other pre-uiroot processing?
TP.sys.setcfg('boot.pause', false);

//  should the boot pause if errors of any kind were detected? often set to true
//  in development-stage rc files.
TP.sys.setcfg('boot.pause_on_error', false);

//  should we terminate the boot process when we hit an error? by default we
//  keep going in an attempt to get more information about the problem
TP.sys.setcfg('boot.stop_onerror', false);

//  should we boot to the TDC (TIBET developer console) UI or show the
//  application's home page? Default is to show the project.rootpage.
TP.sys.setcfg('boot.tdc', false);

//  should we boot in two phases, lib (the 'tibet' config) and then app
//  (the 'app' config). this should be true in virtually all cases.
TP.sys.setcfg('boot.twophase', true);

//  number of log message entries to buffer for INFO level output. This value is
//  used as a baseline computation point. The actual level will vary based on
//  the current logging level and this value. See $computeLogBufferSize();
TP.sys.setcfg('log.buffersize', 5);

//  what logging level should be set by default. this can be overridden from a
//  variety of locations but we need one set in case startup has issues.
TP.sys.setcfg('log.level', TP.WARN);

//  which boot reporter should we use? bootui, console, silent, phantom.
TP.sys.setcfg('boot.reporter', 'bootui');

//  which log reporter should we use?
TP.sys.setcfg('log.reporter', 'console');


//  ---
//  code roots
//  ---

//  what approach should we default to when no other data is available for lib
//  root? 'apphead' sets it to app_head. 'approot' sets it to app_root.
//  'location' sets it to the last collection/directory on window.location.
//  'indexed' uses a string to locate an indexed point on window.location.
//  'tibetdir' will look for root + tibetdir + tibetlib. 'frozen' will look for
//  root + tibetinf + tibetlib. 'script' will check the loader's script src.
//  When using 'indexed' you need to set boot.libtest to the test string or it
//  will default to boot.tibetlib.
TP.sys.setcfg('boot.libcomp', 'script');

//  these three values provide search data for the getAppHead routine, which is
//  leveraged by both app root and lib root computations.
TP.sys.setcfg('boot.tibetdir', 'node_modules');
TP.sys.setcfg('boot.tibetinf', 'TIBET-INF');
TP.sys.setcfg('boot.tibetlib', 'tibet');

//  text pattern matching the init file used to check script tags during lib
//  root computation if no other method is specified.
TP.sys.setcfg('boot.tibetinit', 'tibet_init');
//  how deep under lib_root is the tibet_init file?
TP.sys.setcfg('boot.initoffset', '../../..');


//  ---
//  package/config setup
//  ---

//  What is the name of the bootstrap project file? This file is loaded to
//  provide bootstrap parameter values if 'boot.nobootstrap' isn't set  You can
//  set bootstrap values in the call to TP.boot.launch as an alternative.
TP.sys.setcfg('boot.bootstrap', 'tibet.json');

//  What profile should we be loading? The setting here can directly impact
//  which package file we use as a starting point for booting.
TP.sys.setcfg('boot.profile', null);

//  What package file should we load? This defaults to {{profile}}.xml where
//  profile is taken from boot.profile. If no value exists for boot.profile this
//  will default to 'tibet.xml'.
TP.sys.setcfg('boot.package', null);

//  What package config do we start from? This will default to whatever is given
//  in the boot.package file. The package tag's "default" attribute defines the
//  config we should default to.
TP.sys.setcfg('boot.config', null);

//  Do we filter by asset type? Default is false so we let the boot logic itself
//  worry about filtering. (This option is largely here due to sharing code
//  between the boot logic and the command-line packaging tools).
TP.sys.setcfg('boot.assets', null);

//  Do we want to boot the unminified source alternative(s) where found? The
//  default tibet.xml file includes unminified options for kernel/library code
//  to assist with debugging into the framework code.
TP.sys.setcfg('boot.unminified', false);

//  ---
//  tibet ui roots
//  ---

//  default conf uses UIBOOT and UIROOT installed in the context where this
//  script is found. The UIBOOT iframe is typically set to console.html while
//  the UIROOT value can vary between a number of values depending on whether
//  the Sherpa is running (framing) and whether they want a multi-screen
//  configuration (screens).

//  the ID to search for and/or generate for the UI root display IFRAME.
TP.sys.setcfg('tibet.uiroot', 'UIROOT');

//  the ID initially assigned to be the UICANVAS virtual location.
TP.sys.setcfg('tibet.uicanvas', 'UIROOT');

//  the ID to search for and/or generate for multi-screen IFRAME display.
TP.sys.setcfg('tibet.uiscreens', 'UISCREENS');

//  the prefix to use for generated screens in a multi-screen display.
TP.sys.setcfg('tibet.uiscreenprefix', 'SCREEN_');


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
TP.sys.setcfg('log.tracecolor', 'grey');
TP.sys.setcfg('log.infocolor', 'white');
TP.sys.setcfg('log.warncolor', 'yellow');
TP.sys.setcfg('log.errorcolor', 'magenta');
TP.sys.setcfg('log.severecolor', 'red');
TP.sys.setcfg('log.fatalcolor', 'red');
TP.sys.setcfg('log.systemcolor', 'cyan');

TP.sys.setcfg('log.timecolor', 'grey');
TP.sys.setcfg('log.deltacolor', 'grey');
TP.sys.setcfg('log.slowcolor', 'yellow');
TP.sys.setcfg('log.debugcolor', 'green');
TP.sys.setcfg('log.verbosecolor', 'grey');

// Inadequate, but sufficient to help determine if we're in node, Phantom,
// or a browser. Note these tests are unlikely to work in other contexts.
if (typeof navigator === 'undefined') {
  TP.sys.setcfg('boot.context', 'nodejs');
  TP.sys.setcfg('log.colormode', 'terminal');
} else if (/PhantomJS/.test(navigator.userAgent)) {
  TP.sys.setcfg('boot.context', 'phantomjs');
  TP.sys.setcfg('log.colormode', 'terminal');
} else {
  TP.sys.setcfg('boot.context', 'browser');
  TP.sys.setcfg('log.colormode', 'console');
}

//  ---
//  ui page initialization files
//  ---

//  the default page used to initialize an xhtml canvas or display "nothing"
TP.sys.setcfg('tibet.blankpage', '~lib_xhtml/tp_blank.xhtml');

//  the file used to initialize a dynamically generated XML-based IFRAME.
TP.sys.setcfg('tibet.iframepage', '~lib_xhtml/tp_launch_stub.xhtml');


//  ---
//  buffer frames
//  ---

if (typeof window !== 'undefined') {
    if (!window.name) {
        window.name = 'window_0';
    }

    //  the window ID for a getWindowById call which will locate where to install
    //  buffer IFRAME(s) as needed.
    TP.sys.setcfg('tibet.uibuffer', window.name);

} else {
    TP.sys.setcfg('tibet.uibuffer', null);
}

//  the ID to search for and/or generate for JSONP access buffering.
TP.sys.setcfg('tibet.jsonp_frame', 'JSONP');


//  ---
//  local cache
//  ---

//  what type of caching refresh model are we using? versioned is default.
//  alternative values are: 'versioned', 'incremental', 'stale', or 'fresh'.
//  In versioned mode the cache configuration is driven by version-string
//  checks between the cache and the package tag's version attribute. In
//  incremental mode the version string isn't used, instead each file is
//  updated based on Last-Modified information if available. In stale mode
//  the entire cache is considered to be invalid and all files are updated.
//  In fresh mode all files are considered valid and used regardless of
//  their current state relative to their master copies.
TP.sys.setcfg('boot.cachemode', 'versioned');

//  is the local cache enabled for import?
TP.sys.setcfg('boot.localcache', true);

//  are we currently running 'offline' or 'online'? this setting along with
//  the environment setting helps determine how the rewrite call looks up
//  URI references to allow alternative servers and or storage locations.
//  the default is to presume 'online' operation unless the user has
//  responded to a "work offline" prompt (presumably provided by you when an
//  HTTP connection times out with an HTTPTimeout or a similar error occurs)
TP.sys.setcfg('tibet.offline', false);

//  should we disallow custom 'X-' headers such as X-Requested-With for XHRs.
TP.sys.setcfg('tibet.simple_cors_only', false);


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
TP.sys.setcfg('import.usingdom', true);

//  should we verify file existence prior to injecting script nodes. the browser
//  will often fail to report 404 issues so during development it can be nice to
//  set this flag, or conditionally prior to trying to inject a potentially
//  non-existent url reference. Note it does have a performance impact.
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
//  NOTE that this sets the _type_. A second parameter using the typename plus
//  a .xml extension (TP.core.USAscii101Keyboard.xml for example) is used to
//  point to that type's keyboard mapping file (which is in ~lib_dat by
//  default).
TP.sys.setcfg('tibet.keyboard', null);

//  what is the currently active locale (in xml:lang format)
TP.sys.setcfg('tibet.locale', null);


//  ---
//  version management
//  ---

//  path to the json file (which avoids x-domain security issues) with the
//  latest TIBET release data for version checking the root library.
TP.sys.setcfg('path.lib_version_file', 'http://0.0.0.0:1234/latest.js');

//  ---
//  obsolete ???
//  ---

// TODO: remove this and related code. Should just go with HTTP from file system
// in the latest browsers, or rely on simple Connect server.
//  should we load files on mozilla using xpcom? default starts out false.
TP.sys.setcfg('boot.moz_xpcom', false);


//  ----------------------------------------------------------------------------
//  COMMON VIRTUAL PATHS
//  ----------------------------------------------------------------------------

//  virtualized path definitions. these come in two primary forms: app paths
//  and lib paths. app_* paths are used to refer to components in the
//  application's source tree while lib_* paths refer to components in the
//  library source tree. you should use these extensively in lieu of
//  absolute or relative paths to further insulate your code from arbitrary
//  directory structures which may change over time.

TP.sys.setcfg('path.app', '~app_root');
TP.sys.setcfg('path.lib', '~lib_root');
TP.sys.setcfg('path.tibet', '~lib_root');

TP.sys.setcfg('path.app_inf', '~app/' + TP.sys.cfg('boot.tibetinf'));
TP.sys.setcfg('path.lib_inf', '~lib/' + TP.sys.cfg('boot.tibetinf'));

//  common virtual paths
TP.sys.setcfg('path.app_bin', '~app/bin');
TP.sys.setcfg('path.lib_bin', '~lib/bin');

TP.sys.setcfg('path.app_build', '~app/build');
TP.sys.setcfg('path.lib_build', '~lib_lib/src');

TP.sys.setcfg('path.app_cfg', '~app_inf/cfg');
TP.sys.setcfg('path.lib_cfg', '~lib_lib/cfg');

TP.sys.setcfg('path.app_cmd', '~app_inf/cmd');
TP.sys.setcfg('path.lib_cmd', '~lib_lib/cmd');

TP.sys.setcfg('path.app_css', '~app/css');
TP.sys.setcfg('path.lib_css', '~lib_lib/css');

TP.sys.setcfg('path.app_dat', '~app_inf/dat');
TP.sys.setcfg('path.lib_dat', '~lib_lib/dat');

TP.sys.setcfg('path.app_deps', '~app/deps');
TP.sys.setcfg('path.lib_deps', '~lib/deps');

TP.sys.setcfg('path.app_html', '~app/html');
TP.sys.setcfg('path.lib_html', '~lib_lib/html');

TP.sys.setcfg('path.app_xhtml', '~app/xhtml');
TP.sys.setcfg('path.lib_xhtml', '~lib_lib/xhtml');

TP.sys.setcfg('path.app_img', '~app/img');
TP.sys.setcfg('path.lib_img', '~lib_lib/img');

TP.sys.setcfg('path.app_lib', '~app/lib');
TP.sys.setcfg('path.lib_lib', '~lib/lib');

TP.sys.setcfg('path.app_npm', '~app/node_modules');
TP.sys.setcfg('path.lib_npm', '~lib/node_modules');

TP.sys.setcfg('path.app_src', '~app/src');
TP.sys.setcfg('path.lib_src', '~lib/src');

TP.sys.setcfg('path.app_tsh', '~app_inf/tsh');
TP.sys.setcfg('path.lib_tsh', '~lib_lib/tsh');

TP.sys.setcfg('path.app_tst', '~app/test');
TP.sys.setcfg('path.lib_tst', '~lib/test');

TP.sys.setcfg('path.app_xml', '~app_inf/xml');
TP.sys.setcfg('path.lib_xml', '~lib_lib/xml');

TP.sys.setcfg('path.app_xsl', '~app_inf/xsl');
TP.sys.setcfg('path.lib_xsl', '~lib_lib/xsl');

TP.sys.setcfg('path.app_xs', '~app_inf/xs');
TP.sys.setcfg('path.lib_xs', '~lib_lib/xs');

//  app-only virtual paths
TP.sys.setcfg('path.app_boot', '~lib/src/tibet/boot');
TP.sys.setcfg('path.app_cache', '~app_tmp/cache');
TP.sys.setcfg('path.app_change', '~app_src/changes');
TP.sys.setcfg('path.app_log', '~app_inf/log');
TP.sys.setcfg('path.app_tmp', '~app_inf/tmp');
TP.sys.setcfg('path.app_xmlbase', '~app_html');

//  TIBET namespace source is used often enough that a shortcut is nice
TP.sys.setcfg('path.tibet_src', '~lib_src/tibet');

//  Console (built in to base library).
TP.sys.setcfg('path.tdc_root', '~lib_src/tibet/tools/tdc');
TP.sys.setcfg('path.tdc_src', '~tdc_root/src');

//  Sherpa (external IDE components).
TP.sys.setcfg('path.ide_root', '~lib_src/tibet/tools/sherpa');
TP.sys.setcfg('path.ide_src', '~ide_root/src');

//  Node.js project information.
TP.sys.setcfg('path.npm_dir', 'node_modules');
TP.sys.setcfg('path.npm_file', 'package.json');


//  ---
//  api/ecma
//  ---

//  should add*() methods check their keys against JS/ECMA keywords etc?
//  this can be a useful check to turn on when you're seeing strange
//  behavior around hashes, just to make sure you're not conflicting
//  with a built-in Javascript object, slot, or keyword of some form.
TP.sys.setcfg('api.lint_keys', false);

//  ---
//  breakpointing
//  ---

/*
Condition breakpoint wrappers. these all start out false, but you can set
them from the various TIBET tools to cause a debugger statement to be
exposed in "interesting" locations to help debug common issues. The reason
for these is simple -- venkman et. al. really don't like dynaloaded code and
editing/reloading a file to add a debugger statement will just frustrate you
so we pre-load some interesting locations with conditional debugger calls.
*/

//  functions
TP.sys.setcfg('break.change', false);               //  $changed
TP.sys.setcfg('break.dnu', false);              //  TP.sys.dnu
TP.sys.setcfg('break.format', false);               //  $format
TP.sys.setcfg('break.formatter', false);            //  $format
TP.sys.setcfg('break.gobi', false);             //  TP.sys.getObjectById
TP.sys.setcfg('break.infer', false);                //  TP.sys.infer
TP.sys.setcfg('break.invoke', false);               //  Function.invoke
TP.sys.setcfg('break.main', false);             //  $$main
TP.sys.setcfg('break.metadata', false);         //  addMetadata
TP.sys.setcfg('break.query', false);                //  $query
TP.sys.setcfg('break.stdout', false);               //  console stdout trace
TP.sys.setcfg('break.rendering', false);          // rendering phase of boot
TP.sys.setcfg('break.require', false);          //  require (autoload)
TP.sys.setcfg('break.unbound', false);          //  unbound methods (dnu)
TP.sys.setcfg('break.validate', false);         //  data validation
TP.sys.setcfg('break.xpath', false);                //  evaluate xpath

//  awakening
TP.sys.setcfg('break.awaken_content', false);       //  top-level awaken hook
TP.sys.setcfg('break.awaken_dom', false);           //  DOM-specific stage
TP.sys.setcfg('break.awaken_binds', false);     //  bind:
TP.sys.setcfg('break.awaken_info', false);      //  *:info
TP.sys.setcfg('break.awaken_events', false);        //  ev:
TP.sys.setcfg('break.awaken_style', false);     //  css:

//  data binding
TP.sys.setcfg('break.bind_base', false);            //  get bound scope
TP.sys.setcfg('break.bind_change', false);      //  change notification
TP.sys.setcfg('break.bind_stdin', false);           //  get bound input
TP.sys.setcfg('break.bind_refresh', false);     //  data refresh
TP.sys.setcfg('break.bind_stderr', false);      //  set bound error
TP.sys.setcfg('break.bind_stdout', false);      //  set bound output

//  content processing
TP.sys.setcfg('break.content_cache', false);        //  content cache files
TP.sys.setcfg('break.content_finalize', false);
TP.sys.setcfg('break.content_process', false);      //  process calls
TP.sys.setcfg('break.content_substitute', false);   //  substitutions
TP.sys.setcfg('break.content_templating', false);   //  {{var}} templates
TP.sys.setcfg('break.content_transform', false);    //  transformNode calls

TP.sys.setcfg('break.html_content', false);

//  css processing
TP.sys.setcfg('break.css_processing', false);       //  overall css processor

//  device events (keyboard, mouse, etc)
TP.sys.setcfg('break.device_observe', false);       //  addObserver
TP.sys.setcfg('break.device_invoke', false);        //  removeObserver
TP.sys.setcfg('break.device_redirect', false);  //  notification redirector
TP.sys.setcfg('break.device_signal', false);        //  signalObservers

//  document load/unload
TP.sys.setcfg('break.document_loaded', false);  //  $$processDocumentLoaded
TP.sys.setcfg('break.document_unloaded', false);    //  $$processDocumentUnloaded

//  duplicate definitions
TP.sys.setcfg('break.duplicate_attribute', false);
TP.sys.setcfg('break.duplicate_constant', false);

//  http primitives
TP.sys.setcfg('break.http_timeout', false);     //  XMLHTTPRequest postproc
TP.sys.setcfg('break.http_wrapup', false);      //  XMLHTTPRequest postproc

//  websocket primitives
TP.sys.setcfg('break.websocket_timeout', false);    //  WebSocket postproc
TP.sys.setcfg('break.websocket_wrapup', false); //  WebSocket postproc

//  object localization
TP.sys.setcfg('break.locale_localize', false);  //  TP.core.Locale.localize
TP.sys.setcfg('break.locale_parse', false);     //  TP.core.Locale.parse*

//  node creation
TP.sys.setcfg('break.node_construct', false);       //  TP.core.Node.construct
TP.sys.setcfg('break.node_detachment', false);  //  breadth/depth traversal
TP.sys.setcfg('break.node_discarded', false);       //  append/insertBefore
TP.sys.setcfg('break.node_bypath', false);      //  get/set path traversal
TP.sys.setcfg('break.node_xslt', false);            //  documentTransformNode

//  query specifics
TP.sys.setcfg('break.query_css', false);            //

//  service/request/response
TP.sys.setcfg('break.request_wrapup', false);       //  request data handling
TP.sys.setcfg('break.response_content', false); //  response data handling

//  signaling
TP.sys.setcfg('break.signal', false);               //  TIBET signaling
TP.sys.setcfg('break.signal_arm', false);           //  event arming
TP.sys.setcfg('break.signal_dispatch', false);  //  event dispatching
TP.sys.setcfg('break.signal_exception', false); //  TIBET exceptions
TP.sys.setcfg('break.signal_handler', false);       //  handler invocation
TP.sys.setcfg('break.signal_register', false);  //  listener registration
TP.sys.setcfg('break.signal_notify', false);  //  listener registration
TP.sys.setcfg('break.signal_domfiring', false); //  DOM firing

//  tdc/console
TP.sys.setcfg('break.tdc_stdin', false);            //  console stdin
TP.sys.setcfg('break.tdc_stderr', false);           //  console stderr
TP.sys.setcfg('break.tdc_stdout', false);           //  console stdout

//  tsh/shell
TP.sys.setcfg('break.shell_execute', false);           //  TSH.execute
TP.sys.setcfg('break.tsh_action', false);           //  action tag run
TP.sys.setcfg('break.tsh_adder', false);            //  content add/append
TP.sys.setcfg('break.tsh_alias', false);            //  alias processing
TP.sys.setcfg('break.tsh_cmd', false);          //  command tag exec
TP.sys.setcfg('break.tsh_compile', false);      //  script compilation
TP.sys.setcfg('break.tsh_desugar', false);      //  desugaring xml
TP.sys.setcfg('break.tsh_execute', false);      //  tag/cmd execution
TP.sys.setcfg('break.tsh_filter', false);           //  content filtering
TP.sys.setcfg('break.tsh_format', false);           //  default formatting
TP.sys.setcfg('break.tsh_getter', false);           //  content getter
TP.sys.setcfg('break.tsh_history', false);      //  history rewriting
TP.sys.setcfg('break.tsh_interpolate', false);  //  alias interpolation
TP.sys.setcfg('break.tsh_pp', false);               //  pretty-print exec
TP.sys.setcfg('break.tsh_setter', false);           //  content setter
TP.sys.setcfg('break.tsh_substitutions', false);    //  variable substitution
TP.sys.setcfg('break.tsh_transform', false);        //  content transforms
TP.sys.setcfg('break.tsh_uri', false);          //  uri tag exec
TP.sys.setcfg('break.tsh_xmlify', false);           //  xmlify TSH input
TP.sys.setcfg('break.tsh_phase_exec', false);       //  phase processing
TP.sys.setcfg('break.tsh_tag_exec', false);     //  tag processing
TP.sys.setcfg('break.tsh_pipe_adjust', false);  //  tag processing
TP.sys.setcfg('break.tsh_pipe_connect', false);  //  tag processing

//  uris
TP.sys.setcfg('break.uri_cache', false);            //  URI content cache
TP.sys.setcfg('break.uri_catalog', false);      //  URI catalog/mappings
TP.sys.setcfg('break.uri_content', false);      //  URI content fetch
TP.sys.setcfg('break.uri_construct', false);        //  URI construction
TP.sys.setcfg('break.uri_entry', false);            //  URI entry lookup
TP.sys.setcfg('break.uri_execute', false);      //  URI execution
TP.sys.setcfg('break.uri_filter', false);           //  URI result filtering
TP.sys.setcfg('break.uri_fragment', false);     //  URI fragment access
TP.sys.setcfg('break.uri_headers', false);      //  URI header access
TP.sys.setcfg('break.uri_load', false);         //  URI loading
TP.sys.setcfg('break.uri_map', false);          //  URI map access
TP.sys.setcfg('break.uri_mime', false);         //  URI mime detection
TP.sys.setcfg('break.uri_nuke', false);         //  URI delete
TP.sys.setcfg('break.uri_pack', false);         //  URI packing/condensing
TP.sys.setcfg('break.uri_parse', false);            //  URI parsing
TP.sys.setcfg('break.uri_process', false);      //  URI processing
TP.sys.setcfg('break.uri_profile', false);      //  URI profile lookup
TP.sys.setcfg('break.uri_rewrite', false);      //  URI rewrite
TP.sys.setcfg('break.uri_resolve', false);      //  URI join/expand
TP.sys.setcfg('break.uri_resource', false);     //  URI resource acquisition
TP.sys.setcfg('break.uri_route', false);            //  URI routing to a handler
TP.sys.setcfg('break.uri_save', false);         //  URI save
TP.sys.setcfg('break.uri_transform', false);        //  URI transformations
TP.sys.setcfg('break.uri_virtual', false);      //  URI expansion

//  window
TP.sys.setcfg('break.window_location', false);  //  window.location work

//  xctrls/xforms
TP.sys.setcfg('break.xctrls_request', false);       //  xctrls/xforms submission
TP.sys.setcfg('break.xctrls_response', false);  //  submission response
TP.sys.setcfg('break.xctrls_replace', false);       //  submission data
                                                    //  replacement

//  ---
//  content mgmt
//  ---

//  limit DOM replacement routines to a maximum number of elements to
//  process unless overridden.
TP.sys.setcfg('content.replace_max', 30);

//  limit DOM traversal routines to a maximum number of elements to process
//  unless overridden.
TP.sys.setcfg('content.traversal_max', 2500);

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
//  css processor
//  ---

//  should we process CSS or let it pass through untouched? Normally TIBET
//  will process CSS style sheets to help ensure consistency and standards
//  compliance. NOTE that all browsers benefit from this, not just IE6 :).
//  NOTE NOTE NOTE, if you're using XForms with TIBET this should be true.
TP.sys.setcfg('css.process_styles', false);

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
//  configure the stack.recursion_max setting low enough to run without
//  triggering their built-in recursion checks.
TP.sys.setcfg('debug.trap_recursion', false);

//  pop debugger if inferencing fails or is off or if an exception is
//  raise? this is normally off but can be used to force activation of the
//  environment's debugger (on IE/Moz) if the debugger has already opened.
//  NOTE that firebug will open based on it's own configuration settings in
//  response to debugger statement
TP.sys.setcfg('debug.use_debugger', false);

//  ---
//  http/webdav/websocket
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
TP.sys.setcfg('job.interval_max', 1000 * 60 * 10);

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

//  how long does the jsonp call delay in constructing the script element
//  needed to help processing jsonp calls.
TP.sys.setcfg('jsonp.delay', 1000);

//  ---
//  logging/notification
//  ---

//  true will dump configuration data to boot log
TP.sys.setcfg('log.bootcfg', false);

//  true will dump environment data to boot log
TP.sys.setcfg('log.bootenv', false);

//  Which default formatter should be used when sending log output to the
//  stdout routine?
TP.sys.setcfg('log.default_format', 'tsh:pp');

//  what output/logging level will filter the error and activity logging?
TP.sys.setcfg('log.level', 1);  //  0 (TRACE) thru 6 (SYSTEM)

//  when logging is on the value here will control how large the activity
//  log can grow before it starts eliminating the oldest entries. NOTE that
//  the change log ignores this value as does the boot log to ensure all
//  data for those operations is captured and maintained.
TP.sys.setcfg('log.size_max', 1000);

//  should TIBET logging calls actually write to the activity log? When
//  false this effectively turns off all logging.
TP.sys.setcfg('log.activities', true);

//  should the core awaken call log the elements it's awakening? default is
//  false for production, but this is very useful for debugging
TP.sys.setcfg('log.awaken_content', false);

//  general bind logging, mirroring the break.bind_binding name.
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
//  during booting we want to ensure errors find their way to the UI even if the
//  current reporter (boot console perhaps) isn't visible.
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
TP.sys.setcfg('log.stack', false);

//  if $error is called should the call stack arguments be included? NOTE
//  that this flag is only used when log.stack is true
TP.sys.setcfg('log.stack_arguments', false);

//  when logging the call stack should we try to get file information such
//  as filenames and line numbers for the functions?
TP.sys.setcfg('log.stack_file_info', false);

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

//  how long the event system should wait before cancelling a keyboard shortcut
//  sequence
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

//  the file holding the TIBET activity log when $writeActivityToDisk=true.
//  Normally this won't be used except during certain debugging cycles.
TP.sys.setcfg('tibet.activity_file', '~app_log/activity.xml');

//  where is the keyring file? this file is used (by default) as the source
//  for application keyrings used by TP.core.Role and TP.core.Unit types to
//  associate permission "keys" with TP.core.User instances.
TP.sys.setcfg('tibet.keyring_file', '~lib_dat/keyrings.xml');

//  where is the default location for the listener (observe) map? this
//  path should be an absolute path using either a / or ~ prefix to
//  reference libroot or approot respectively. this can be set in the
//  boot script/tibet.xml files using the 'listeners' parameter.
TP.sys.setcfg('tibet.listener_file', '~lib_dat/listeners.xml');

//  where is the default location for the localization string file? this
//  path should be an absolute path using either a / or ~ prefix to
//  reference libroot or approot respectively. this can be set in the
//  boot script/tibet.xml files using the 'strings' parameter.
TP.sys.setcfg('tibet.string_file', '~lib_dat/strings.xml');

//  where is the default location for the uri mappings? this path should be
//  an absolute path using either a / or ~ prefix to reference libroot or
//  approot respectively. this can be set in the boot script/tibet.xml files
//  using the 'uris' parameter.
TP.sys.setcfg('tibet.uri_file', '~lib_dat/uris.xml');

//  where is the default vCard file containing application vcards? this file
//  is used (by default) as a simple way to create a small set of vcards
//  that can be used across users. The vcard information relates users to
//  roles, linking permissions assigned to those roles to a particular user.
TP.sys.setcfg('tibet.vcards', '~lib_dat/vcards.xml');

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

TP.sys.setcfg('tdc.toggle_on', 'TP.sig.DOM_Alt_Up_Up');
TP.sys.setcfg('tdc.toggle_off', 'TP.sig.DOM_Alt_Down_Up');

//  should the TDC output collection value types during status updates?
TP.sys.setcfg('tdc.type_collections', true);

//  how long should the TDC wait to fade out a bubble (in milliseconds)?
TP.sys.setcfg('tdc.bubble_fade_time', 2000);

//  ---
//  sherpa processing
//  ---

//  how many screens should the Sherpa display?
TP.sys.setcfg('sherpa.num_screens', 1);

//  which output formatter should be used for presentation output?
TP.sys.setcfg('sherpa.default_format', 'sherpa:pp');

//  should the console suspend normal output?
TP.sys.setcfg('sherpa.silent', false);

//  how long should the sherpa console wait before allowing 'eval mark'
//  editing (in ms) ?
TP.sys.setcfg('sherpa.edit_mark_time', 750);

//  the id of the element under the mark holding the prompt
TP.sys.setcfg('sherpa.console_prompt', 'sherpaPrompt');

//  ---
//  tds support
//  ---

TP.sys.setcfg('tds.cli_uri', '/tds/cli');

TP.sys.setcfg('tds.dav_root', '~app_src');
TP.sys.setcfg('tds.dav_uri', '/tds/webdav');

TP.sys.setcfg('tds.patch_root', '~app_src');
TP.sys.setcfg('tds.patch_uri', '/tds/patch');

TP.sys.setcfg('tds.port', 1407);
TP.sys.setcfg('tds.secret', 'change this in your tibet.json file');

TP.sys.setcfg('tds.404', 'NotFound');
TP.sys.setcfg('tds.500', 'ServerError');

TP.sys.setcfg('tds.watch_event', 'fileChanged');
TP.sys.setcfg('tds.watch_root', '~app_src');
TP.sys.setcfg('tds.watch_uri', '/tds/watcher');

//  ---
//  tsh processing
//  ---

//  what is the default output formatter for the shell/console interface?
TP.sys.setcfg('tsh.default_format', 'tsh:pp');

//  maximum number of milliseconds in an individual lint check.
TP.sys.setcfg('tsh.lint_step_max', 10000);
//  maximum number of milliseconds in a comprehensive lint run.
TP.sys.setcfg('tsh.lint_series_max', 600000);

//  limit times for the tsh sleep command
TP.sys.setcfg('tsh.sleep_default', 3000);
TP.sys.setcfg('tsh.sleep_max', 3000);


TP.sys.setcfg('tsh.split_commands', false);     //  split on semicolons?

//  maximum number of milliseconds in an individual unit test.
TP.sys.setcfg('tsh.test_step_max', 15000);
//  maximum number of milliseconds in a comprehensive test run.
TP.sys.setcfg('tsh.test_series_max', 600000);

//  when tracing is on each individual command's status and result is pushed
//  into a $RESULTS slot that can be inspected
TP.sys.setcfg('tsh.trace_commands', false);

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

//  should LogChange and its variants be signaled when a slice of the
//  activity log changes? by default no, only the TIBET tools will typically
//  adjust this, and even then they're more likely to leverage stdout/stderr
TP.sys.setcfg('signal.log_change', false);

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
TP.sys.setcfg('stack.backtrace_max', 30);

//  when calling functions like asSource(), asDisplayString(), and other
//  naturally recursive calls this controls the number of levels which are
//  output before we stop our descent. This helps to avoid issues with
//  circular object containment/references.
TP.sys.setcfg('stack.descent_max', 10);

//  limit on stack recursion. the setting here will define when TIBET's
//  trapRecursion() call will trigger. values here have to be pretty small
//  to ensure the trap can function before the browser blows the stack, for
//  example a function which does nothing but call TP.sys.trapRecursion()
//  and then call itself will blow up in IE with a value higher than 30. At
//  the same time TIBET has numerous stacks deeper than that so higher
//  numbers might be necessary.
TP.sys.setcfg('stack.recursion_max', 30);

//  ---
//  tibet
//  ---

//  should TIBET configure for plugins. By default this is off. Turning this on
//  causes configuration of any pre-configured plugin metadata. It doesn't load
//  any plugins, that's entirely up to the UI of the application.
TP.sys.setcfg('tibet.plugins', false);

// Ensure we use the tibetdir approach to computing root paths.
TP.sys.setcfg('boot.rootcomp', 'tibetdir');

//  should TIBET enforce type uniqueness during defineSubtype operation. the
//  default is true, but this can be flipped to allow reloading during
//  development (with a number of caveats).
TP.sys.setcfg('tibet.unique_types', true);

//  ---
//  tibet internal
//  ---

//  should we cache child (subtype) names?
TP.sys.setcfg('tibet.$$cache_children', true);

//  should we cache child (subtype) references?
TP.sys.setcfg('tibet.$$cache_cnames', true);

//  should we cache parent (supertype) references?
TP.sys.setcfg('tibet.$$cache_parents', true);

//  should we cache parent (supertype) names?
TP.sys.setcfg('tibet.$$cache_pnames', true);

//  should DNU methods be constructed? this controls whether the
//  finalization process should construct DNU backstops for methods.
TP.sys.setcfg('tibet.$$construct_dnus', true);

//  it's occasionally useful to see what *would* have happened --
//  particularly when using inferencing depth/strictness controls.
TP.sys.setcfg('tibet.$$invoke_inferences', true);

//  this is OFF at startup and gets enabled once the kernel has loaded to
//  avoid problems during startup.
TP.sys.setcfg('tibet.$$use_backstop', false);

//  should inferencing be enabled.
TP.sys.setcfg('tibet.$$use_inferencing', true);

//  ---
//  tibet:root rendering control
//  ---

//  should a generated uiroot page include IDE framing?
TP.sys.setcfg('tibet.uirootframed', false);

//  should the current uiroot page support multiple screens?
TP.sys.setcfg('tibet.uirootmulti', false);

//  what tag should be used in place of the default {{appname}}.app tag.
TP.sys.setcfg('tibet.apptag', null);

//  should the sherpa currently be active? default is false.
TP.sys.setcfg('tibet.sherpa', false);

//  the application login page. when booting in two-phase mode with logins
//  turned on this page is displayed in the uicanvas while the root page
//  loads the TIBET target (kernel + any other TIBET code you configure) in
//  the code frame. when booting in a single phase this page replaces the
//  index file and booting has to be restarted by the page returned from
//  your server on successful login.
TP.sys.setcfg('tibet.indexpage', '~/index.html');

TP.sys.setcfg('tibet.loginpage', '~app_html/login.html');

//  ---
//  tuning
//  ---

//  arrays can be sometimes be scanned for strings faster via regex so we
//  set a threshold to tune between iteration and regex-based search
TP.sys.setcfg('array.contains_loop_max', 50);

//  the perform() call can instrument iterators with atStart/atEnd data
//  and does this for all iteration sizes below this threshold. above this
//  figure the function's string is tested to see if it makes use of this
//  data. this figure can therefore be set to the size below which the
//  toString test is slower than the instrumentation overhead
TP.sys.setcfg('perform.instrument_max', 100);

//  limit on the maximum number of entries in the signal stats array, which
//  tracks overall times for signal handler invocations
TP.sys.setcfg('signal.stats_max', 1000);

//  ---
//  uri/url
//  ---

//  the default type used to handle URI load/save operations.
TP.sys.setcfg('uri.handler', 'TP.core.URIHandler');

//  the default type used to handle URI rewriting decisions.
TP.sys.setcfg('uri.rewriter', 'TP.core.URIRewriter');

//  the default type used to handle URI routing decisions.
TP.sys.setcfg('uri.router', 'TP.core.URIRouter');

//  ---
//  xpath/xslt
//  ---

//  when using non-native XPaths (containing extension functions typically)
//  we need to load the external XPath parser. Since that component is based
//  on a non-TIBET type we can't use TIBET's autoloader so we need a path
TP.sys.setcfg('xpath.parser_path', '~lib_deps/xpath-tpi.js');

//  when using XSLT templates we use a boilerplate XSLT file to keep from
//  requiring a lot of bulk in the templates themselves.
TP.sys.setcfg('xslt.boilerplate_path',
    '~lib_src/tsh/xsl/tsh_template_template.xsl');

//  ----------------------------------------------------------------------------


//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/* jshint debug:true,
          eqnull:true,
          evil:true,
          maxerr:999,
          nonstandard:true,
          node:true
*/
/* global ActiveXObject:false,
          netscape:false,
          Components:false,
          $STATUS:true
*/

//  ----------------------------------------------------------------------------

//  We don't rely on require() but using a closure helps avoid unintended
//  leakage into any enclosing scope.
;(function(root) {

TP = root.TP || {};
TP.sys = TP.sys || {};
TP.boot = TP.boot || {};
APP = root.APP || {};


//  ----------------------------------------------------------------------------
//  Post-Cfg Settings
//  ----------------------------------------------------------------------------


TP.boot.$$theme = {
    trace: TP.sys.cfg('log.tracecolor'),
    info: TP.sys.cfg('log.infocolor'),
    warn:  TP.sys.cfg('log.warncolor'),
    error:  TP.sys.cfg('log.errorcolor'),
    fatal:  TP.sys.cfg('log.fatalcolor'),
    severe:  TP.sys.cfg('log.severecolor'),
    system:  TP.sys.cfg('log.systemcolor'),

    time: TP.sys.cfg('log.timecolor'),
    delta: TP.sys.cfg('log.deltacolor'),
    slow: TP.sys.cfg('log.slowcolor'),

    debug:  TP.sys.cfg('log.debugcolor'),
    verbose:  TP.sys.cfg('log.verbosecolor')
};


//  ----------------------------------------------------------------------------
//  Feature Checking
//  ----------------------------------------------------------------------------

/*
 * A variation on feature detection, and not exclusive of our use of testing of
 * the user-agent string. We combine data from both user-agent and feature to
 * determine if a browser is supportable, requires shimming, etc.
 */

//  Feature names and tests for registered features.
if (TP.sys.$features == null) {
    TP.sys.$features = {};
    TP.sys.$featureTests = {};
}

//  ----------------------------------------------------------------------------

TP.sys.hasFeature = function(aFeatureName, retest) {

    /**
     * @name hasFeature
     * @summary Returns true if the named feature is a feature of the current
     *     system. The feature list is populated primarily during TIBET startup
     *     and kernel finalization.
     * @param {String} aFeatureName The feature name, typically provided as a
     *     constant from a published list of names.
     * @param {Boolean} retest Whether or not to ignore any cached value.
     * @return {Boolean} True if the feature is available.
     * @todo
     */

    var testVal,
        testFunc;

    //  If a valid value was cached for the test and retest isn't true, then
    //  just return the cached value.
    if (TP.boot.$isValid(testVal = TP.sys.$features[aFeatureName]) &&
        retest !== true) {
        return testVal;
    }

    //  If a test function was found, run it and get the value.
    if (typeof(testFunc = TP.sys.$featureTests[aFeatureName]) === 'function') {
        testVal = testFunc();
    } else if (aFeatureName.slice(0, 4) === 'dom-') {
        //  Otherwise, if the test name started with 'dom-', then its a 'DOM
        //  implementation' test, so ask the DOM implementation.
        testVal = document.implementation.hasFeature(
                                            aFeatureName.slice(4), '2.0');
    } else {
        //  Otherwise just use false.
        testVal = false;
    }

    TP.sys.$features[aFeatureName] = testVal;

    return testVal;
};

//  ----------------------------------------------------------------------------

TP.sys.addFeatureTest = function(aFeatureName, featureTest, testNow) {

    /**
     * @name addFeatureTest
     * @summary Adds a feature test under the name provided. If testNow is
     *     true, the test is performed immediately.
     * @param {String} aFeatureName The feature name, typically provided as a
     *     constant from a published list of names.
     * @param {Function} featureTest The feature test function to execute.
     * @param {Boolean} testNow Whether or not to execute the test immediately
     *     instead of waiting until the first time the test is used.
     * @return {Boolean} The result of the test if 'testNow' is specified.
     * @todo
     */

    TP.sys.$featureTests[aFeatureName] = featureTest;

    if (testNow) {
        return TP.boot.hasFeature(aFeatureName);
    }
};

//  ----------------------------------------------------------------------------

TP.sys.hasFeatureTest = function(aFeatureName) {

    /**
     * @name hasFeatureTest
     * @summary Returns whether or not a particular feature test exists.
     * @param {String} aFeatureName The feature name, typically provided as a
     *     constant from a published list of names.
     * @return {Boolean} True if the feature test is defined.
     */

    return (typeof TP.sys.$featureTests[aFeatureName] === 'function');
};

//  ----------------------------------------------------------------------------
//  STANDARD FEATURE TESTS
//  ----------------------------------------------------------------------------

TP.sys.addFeatureTest('gecko',
                        function() {
                            return TP.boot.isUA('gecko');
                        });

TP.sys.addFeatureTest('firefox',
                        function() {
                            return TP.boot.isUA('firefox');
                        });

TP.sys.addFeatureTest('trident',
                        function() {
                            return TP.boot.isUA('trident');
                        });

TP.sys.addFeatureTest('ie',
                        function() {
                            return TP.boot.isUA('ie');
                        });

TP.sys.addFeatureTest('webkit',
                        function() {
                            return TP.boot.isUA('webkit');
                        });

TP.sys.addFeatureTest('safari',
                        function() {
                            return TP.boot.isUA('safari');
                        });

TP.sys.addFeatureTest('chrome',
                        function() {
                            return TP.boot.isUA('chrome');
                        });

TP.sys.addFeatureTest('opera',
                        function() {
                            return TP.boot.isUA('opera');
                        });

//  ----------------------------------------------------------------------------
//  Package Checking
//  ----------------------------------------------------------------------------

TP.sys.hasPackage = function(aPackageFile, aConfig) {

    /**
     * @name hasPackage
     * @summary Returns true if the named package/config pair has been
     *     loaded. If the config isn't defined then the 'base' config is
     *     assumed. NOTE that the 'full' config is always checked and if that
     *     config has been loaded it is assumed that any specific config has
     *     also been loaded.
     * @param {String} aPackageFile A package filename, which should typically
     *     be a .xml file in the lib_cfg or app_cfg path.
     * @param {String} aConfig A specific config name. Default is 'full'.
     * @return {Boolean} True if the package/config has been loaded.
     * @todo
     */

    var config;

    config = aConfig || 'base';

    //  if the full config has loaded we presume all other configs were a
    //  part of that and that the config is available
    if (TP.boot.$$packages[aPackageFile + '#' + 'full'] === true) {
        return true;
    }

    return TP.boot.$$packages[aPackageFile + '#' + config] === true;
};

//  ----------------------------------------------------------------------------
//  Stdio Hooks
//  ----------------------------------------------------------------------------

/*
 *  Standard (reusable) input/output/error functions.
 *
 *  Note that these invoke the TP.boot.log function to ensure that
 *  TP.boot.$stdout and TP.boot.$stderr also get captured in the TIBET
 *  bootlog.
 */

//  ----------------------------------------------------------------------------

TP.boot.$alert = alert;
TP.boot.$prompt = prompt;
TP.boot.$confirm = confirm;
TP.boot.$notify = TP.boot.$alert;

//  ---
//  STDERR
//  ---

TP.STDERR_ALERT = function(msg, obj, level) {

    /**
     * @name STDERR_ALERT
     * @summary Logs an error and alerts it. Only the first parameter is passed
     *     to $alert().
     * @param {String} msg The error string to log and alert.
     * @param {Object|Number} obj Optional annotation, arguments, or a logging
     *     level. This parameter is overloaded. When three arguments are present
     *     should be an annotation or argument array and level should be third.
     * @param {Number} level A TIBET logging level. Default is TP.ERROR.
     */

    TP.STDERR_LOG(msg, obj, level);
    TP.boot.$alert(msg);
    return;
};

TP.STDERR_BREAK = function(msg, obj, level) {

    /**
     * @name STDERR_BREAK
     * @summary Logs an error and triggers the debugger.
     * @param {String} msg The error string.
     * @param {Object|Number} obj Optional annotation, arguments, or a logging
     *     level. This parameter is overloaded. When three arguments are present
     *     should be an annotation or argument array and level should be third.
     * @param {Number} level A TIBET logging level. Default is TP.ERROR.
     */

    TP.STDERR_LOG(msg, obj, level);
    debugger;
    return;
};

TP.STDERR_LOG = function(msg, obj, level) {

    /**
     * @name STDERR_LOG
     * @summary Logs an error, augmenting it with any optional annotation data.
     * @param {String|Object} msg The error string or object to be logged.
     * @param {Object|Number} obj Optional annotation, arguments, or a logging
     *     level. This parameter is overloaded. When three arguments are present
     *     should be an annotation or argument array and level should be third.
     * @param {Number} level A TIBET logging level. Default is TP.ERROR.
     */

    var ann,
        lvl,
        log,
        ctx;

    switch (arguments.length) {
        case 1:
            // object/string to log
            break;
        case 2:
            //  object/string + either an annotation/context or log level
            if (TP.boot.$isNumber(obj)) {
                lvl = obj;
            } else {
                ann = obj;
            }
            break;
        default:
            //  all three, or more but we ignore past 3.
            ann = obj;
            lvl = level;
            break;
    }

    //  If level wasn't explicitly set above we'll set it now based on the
    //  nature of the input. This is simplistic, but we'll assume if it's a
    //  simple string it's TP.ERROR and if it's an object it's TP.SEVERE.
    if (TP.boot.$notValid(lvl)) {
        if (typeof msg === 'string') {
            lvl = TP.ERROR;
        } else {
            lvl = TP.SEVERE;
        }
    }

    log = msg;

    // If there's annotation data we need to consider that, or relay it as
    // context data if it's an arguments array.
    if (TP.boot.$isValid(ann)) {
        if (TP.boot.$isArgumentArray(ann)) {
            ctx = ann;
        } else if (ann instanceof Error) {
            log = TP.boot.$ec(ann, msg);
        } else if (TP.boot.$notValid(ann.message)) {
            log = TP.boot.$annotate(ann, msg);
        }
    }

    TP.boot.log(log, lvl, ctx);

    return;
};

TP.STDERR_NOTIFY = function(msg, obj, level) {

    /**
     * @name STDERR_NOTIFY
     * @summary Logs an error and displays it via TP.boot.$notify. Only the
     *     first argument is passed to $notify().
     * @param {String} msg The error string.
     * @param {Object|Number} obj Optional annotation, arguments, or a logging
     *     level. This parameter is overloaded. When three arguments are present
     *     should be an annotation or argument array and level should be third.
     * @param {Number} level A TIBET logging level. Default is TP.ERROR.
     */

    TP.STDERR_LOG(msg, obj, level);
    TP.boot.$notify(msg);
    return;
};

TP.STDERR_NULL = function(msg, obj, level) {

    /**
     * @name STDERR_NULL
     * @summary Silently consumes errors. Set during post-boot operations to
     *     ensure they don't report through the boot log.
     * @param {String} msg The error string.
     * @param {Object|Number} obj Optional annotation, arguments, or a logging
     *     level. This parameter is overloaded. When three arguments are present
     *     should be an annotation or argument array and level should be third.
     * @param {Number} level A TIBET logging level. Default is TP.ERROR.
     */

    return;
};

//  ---
//  STDIN
//  ---

TP.STDIN_CONFIRM = function(msg) {

    /**
     * @name STDIN_CONFIRM
     * @summary Requests confirmation of an operation.
     * @param {String} msg The confirmation request message.
     * @return {Boolean} True if the operation was confirmed.
     */

    var input;

    input = confirm(msg == null ? '?' : msg);
    if (TP.boot.$notValid(input) || input === '') {
        return null;
    } else {
        return input;
    }
};

TP.STDIN_PROMPT = function(msg, def) {

    /**
     * @name STDIN_PROMPT
     * @summary Prompts the user for a value, returning either the user-entered
     * value or a default value.
     * @param {String} msg The input request message.
     * @param {Object} def The default object to display/use.
     * @return {Boolean} The value the user chooses.
     */

    var input;

    input = prompt(msg == null ? '?' : msg, (def == null ? '' : def));
    if (input == null || input === '') {
        return null;
    } else {
        return input;
    }
};

//  ---
//  STDOUT
//  ---

TP.STDOUT_ALERT = function(msg, obj, level) {

    /**
     * @name STDOUT_ALERT
     * @summary Logs a message and alerts it. Only the first parameter is passed
     *     to $alert().
     * @param {String} msg The message to log and alert.
     * @param {Object|Number} obj Optional annotation, argument list, or logging
     *     level. This parameter is overloaded. When three arguments are present
     *     should be an annotation or argument array and level should be third.
     * @param {Number} level A TIBET logging level. Default is TP.INFO.
     */

    TP.STDOUT_LOG(msg, obj, level);
    TP.boot.$alert(msg);
    return;
};

TP.STDOUT_LOG = function(msg, obj, level) {

    /**
     * @name STDOUT_LOG
     * @summary Logs a message.
     * @param {String} msg The message to log.
     * @param {Object|Number} obj Optional annotation, argument list, or logging
     *     level. This parameter is overloaded. When three arguments are present
     *     should be an annotation or argument array and level should be third.
     * @param {Number} level A TIBET logging level. Default is TP.INFO.
     */

    var ann,
        lvl,
        log,
        ctx;

    switch (arguments.length) {
        case 1:
            // object/string to log
            break;
        case 2:
            //  object/string + either an annotation/context or log level
            if (TP.boot.$isNumber(obj)) {
                lvl = obj;
            } else {
                ann = obj;
            }
            break;
        default:
            //  all three, or more but we ignore past 3.
            ann = obj;
            lvl = level;
            break;
    }

    //  If level wasn't explicitly set above we'll set it now.
    if (TP.boot.$notValid(lvl)) {
        lvl = TP.INFO;
    }

    log = msg;

    // If there's annotation data we need to consider that, or relay it as
    // context data if it's an arguments array.
    if (TP.boot.$isValid(ann)) {
        if (TP.boot.$isArgumentArray(ann)) {
            ctx = ann;
        } else {
            log = TP.boot.$annotate(ann, msg);
        }
    }

    TP.boot.log(log, lvl, ctx);

    return;
};

TP.STDOUT_NOTIFY = function(msg, obj, level) {

    /**
     * @name STDOUT_NOTIFY
     * @summary Logs a message and displays it via TP.boot.$notify. Only the
     *     first parameter is passed to $notify().
     * @param {String} msg The message to log.
     * @param {Object|Number} obj Optional annotation, argument list, or logging
     *     level. This parameter is overloaded. When three arguments are present
     *     should be an annotation or argument array and level should be third.
     * @param {Number} level A TIBET logging level. Default is TP.INFO.
     */

    TP.STDOUT_LOG(msg, obj, level);
    TP.boot.$notify(msg);
    return;
};

//  ----------------------------------------------------------------------------

//  declarations of 'stdio' function references. these get installed based
//  on parameters that can alter how the boot process manages IO/logging.
//  NOTE that there are actually two forms of these variables, the TP.boot
//  version and a TP version found later. The TP.boot versions are specific
//  to IO for the boot process while the TP variants (TP.stdin, TP.stdout,
//  TP.stderr) are used by all of TIBET as low-level IO hooks often used by
//  TIBET tools.

//  define the default mappings. the tibet.xml file can override as needed
TP.boot.$stderr = TP.STDERR_LOG;
TP.boot.$stdin = TP.STDIN_PROMPT;
TP.boot.$stdout = TP.STDOUT_LOG;

//  ----------------------------------------------------------------------------
//  ERROR-HANDLING
//  ----------------------------------------------------------------------------

//  capture current state so we can reset it. setting it to null doesn't
//  work in all environments so we can put it back in place only by using
//  window.onerror = TP.sys.offerror;
TP.sys.offerror = window.onerror;

//  define a new one we can count on to call TP.boot.$stderr for us, the
//  TIBET kernel will define a similar one itself for TIBET applications
window.onerror = function(msg, url, line, column, errorObj) {

    /**
     * @name onerror
     * @synopsis Captures global errors and outputs them appropriately. This
     *     hook allows TIBET to capture native JavaScript errors and avoid
     *     reporting them via the normal browser mechanism. This keeps users
     *     from being bombarded by messages about JS errors while allowing
     *     developers to see what's what.
     * @param {String} message The error message.
     * @param {String} url The url of the JavaScript script.
     * @param {Number} line The line number in that script.
     * @param {Number} column The column number in that script.
     * @param {Error} errorObj The error object of the error that caused this
     *     hook to trigger.
     * @returns {Boolean} TP.sys.shouldCaptureErrors() value.
     * @todo
     */

    var file,
        path,
        str;

    try {
        file = TP.boot.$$onerrorURL;
        path = (file == null) ? url : file;

        str = msg || 'Error';
        str += ' in file: ' + path + ' line: ' + line + ' column: ' + column;

        if (errorObj) {
            if (TP.getStackInfo) {
                str += '\nSTACK:\n' + TP.getStackInfo(errorObj).join('\n');
            } else {
                str += '\nSTACK:\n' + errorObj.stack;
            }
        }

        //  Invoke the currently configured stderr hook function. This will push
        //  the message into the logs and trigger any configured reporters. NOTE
        //  that logging a FATAL error will also terminate the boot process.
        TP.boot.$stderr(str, TP.FATAL);
    } catch (e) {
        // don't let log errors trigger recursion, but don't bury them either.
        top.console.error('Error logging onerror: ' + e.message);
        top.console.error(str || msg);
    }

    //  set a non-zero status to signify that an error occurred to callers
    //  which won't see a native Error in a catch block
    $STATUS = TP.FAILURE;

    return false;
};

//  ----------------------------------------------------------------------------
//  BROWSER DETECTION
//  ----------------------------------------------------------------------------

/*
 * Historically it's been shown that feature detection isn't sufficient if
 * you intend to actually support a framework in production. The browsers are
 * not stable version to version and bugs in things like sockets, workers, or
 * even function.bind crop up now and then. Partial support is another issue.
 *
 * Feature detection is a good starting point but it should be tempered with
 * some awareness of the code's current context. Newer versions of UA checking
 * do a sufficient job to let you combine the two reasonably well.
 *
 * Finally, certain specific user agent versions (and hence certain specific UA
 * strings) are literally too buggy to support. That doesn't happen as often as
 * it used to in the heyday of the browser wars, but it still happens. So a
 * final check against a list of known "bad browser strings" should be added.
 */

/*
 * NOTE that the code below is _really old_ and desperately in need of an update
 * to be current regarding things like mobile devices etc.
 */

//  ----------------------------------------------------------------------------

TP.$agent = null;
TP.$platform = 'other';
TP.$language = null;

TP.$browser = null;
TP.$browserUI = null;
TP.$browserSuffix = null;

TP.$browserIdent = null;
TP.$browserMajor = null;
TP.$browserMinor = null;
TP.$browserBuild = null;
TP.$browserPatch = null;

TP.$browserUIIdent = null;
TP.$browserUIMajor = null;
TP.$browserUIMinor = null;
TP.$browserUIBuild = null;
TP.$browserUIPatch = null;

TP.$msxml = null;

//  NOTE that these 3 are temporary and will be deleted once detect is done.
TP.$versions = null;
TP.$major = null;
TP.$minor = null;

TP.$$assignBrowser = function(aString) {

    var parts;

    parts = aString.split('.');

    TP.$browserIdent = aString;
    TP.$browserMajor = (parts[0] == null) ? 0 : parts[0];
    TP.$browserMinor = (parts[1] == null) ? 0 : parts[1];
    TP.$browserBuild = (parts[2] == null) ? 0 : parts[2];
    TP.$browserPatch = (parts[3] == null) ? 0 : parts[3];
};

TP.$$assignBrowserUI = function(aString) {

    var str,
        parts;

    //  Webkit suddenly decided to add '+' to the tail of their version
    //  numbers, just to make things more interesting I'm sure.
    str = aString.replace('+', '');
    parts = str.split('.');

    TP.$browserUIIdent = aString;
    TP.$browserUIMajor = (parts[0] == null) ? 0 : parts[0];
    TP.$browserUIMinor = (parts[1] == null) ? 0 : parts[1];
    TP.$browserUIBuild = (parts[2] == null) ? 0 : parts[2];
    TP.$browserUIPatch = (parts[3] == null) ? 0 : parts[3];
};

//  ----------------------------------------------------------------------------

//  capture default value for the browser, we'll adjust below.
TP.$browser = navigator.userAgent;

// convert all characters to lowercase to simplify certain tests
TP.$agent = navigator.userAgent.toLowerCase();

//  get major and minor version info as defined by the navigator object, we
//  can clear the slot used for the split values after parsing
TP.$versions = navigator.appVersion.split('.');
TP.$major = parseInt(TP.$versions[0], 10);

if (TP.$versions.length > 1) {
    TP.$minor = parseInt(TP.$versions[1], 10);
} else {
    TP.$minor = 0;
}

delete(TP.$versions);

//  ----------------------------------------------------------------------------
//  Platform (OS) - seems this is accurate enough for supported browsers.
//  We're really only interested in nailing down Windows, Mac, *NIX here
//  and with those variants we're likely to support. All others end up
//  categorized simple as 'other'.

if (TP.$agent.indexOf('windows nt') !== -1) {
    if (TP.$agent.indexOf('nt 5.0') !== -1) {
        TP.$platform = 'win2k';
    } else if (TP.$agent.indexOf('nt 5.1') !== -1) {
        TP.$platform = 'winxp';
    } else if (TP.$agent.indexOf('nt 5.2') !== -1) {
        TP.$platform = 'winxps';
    } else if (TP.$agent.indexOf('nt 6.0' !== -1)) {
        TP.$platform = 'vista';
    } else {
        TP.$platform = 'winnt';
    }
}
else if (TP.$agent.indexOf('win') !== -1)
{
    TP.$platform = 'win';
}
else if (TP.$agent.indexOf('mac') !== -1)
{
    TP.$platform = 'mac';

    if (TP.$agent.indexOf('68k') !== -1 || TP.$agent.indexOf('68000') !== -1) {
        TP.$platform = 'mac68k';
    } else if (TP.$agent.indexOf('ppc') !== -1 ||
                TP.$agent.indexOf('powerpc') !== -1) {
        TP.$platform = 'macppc';
    }

    if (TP.$agent.indexOf(' os x') !== -1) {
        TP.$platform = 'macosx';
    }
}
else if (TP.$agent.indexOf('sunos') !== -1 ||
        TP.$agent.indexOf('irix') !== -1 ||
        TP.$agent.indexOf('hp-ux') !== -1 ||
        TP.$agent.indexOf('aix') !== -1 ||
        TP.$agent.indexOf('inux') !== -1 ||
        TP.$agent.indexOf('ultrix') !== -1 ||
        TP.$agent.indexOf('unix_system_v') !== -1 ||
        TP.$agent.indexOf('reliantunix') !== -1 ||
        TP.$agent.indexOf('sinix') !== -1 ||
        TP.$agent.indexOf('freebsd') !== -1 ||
        TP.$agent.indexOf('bsd') !== -1)
{
    TP.$platform = '*nix';
}

//  ----------------------------------------------------------------------------

//  Configure the language reference, this plays into localization later
if (navigator.userLanguage != null) {
    TP.$language = navigator.userLanguage;
} else {
    TP.$language = navigator.language;
}

//  ----------------------------------------------------------------------------
//  Browser/Renderer - here's where they tend to lie. Our goal here isn't
//  to determine precisely which browser we're dealing with as much as it's
//  to narrow down whether it's supported (IE, Safari, Chrome, Firefox) or
//  close enough (Gecko-based, Webkit-based) that we're willing to let it
//  slide with just a warning.

TP.$$match = null;

if (TP.$agent.indexOf('chrome/') !== -1) {
    //  Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.2.149.27 Safari/525.13

    //  chrome is WebKit-based for GUI, but has a different JS engine.

    //  TODO:   check for spoofing via object-testing for V8 etc?

    TP.$browser = 'chrome';
    TP.$browserUI = 'webkit';
    TP.$browserSuffix = 'Webkit';

    //  capture chrome number for browser version numbering
    TP.$$match = TP.$agent.match(/chrome\/([^ ]*?) /);
    if (TP.$$match != null) {
        TP.$$assignBrowser(TP.$$match[1]);
    }

    //  capture the webkit id for rendering engine numbers
    TP.$$match = TP.$agent.match(/applewebkit\/([^ ]*?) /);
    if (TP.$$match != null) {
        TP.$$assignBrowserUI(TP.$$match[1]);
    }

    //  A bug in Chrome returns the locale code (with an underscore '_')
    //  instead of the language code (with a dash '-').

    //  See: http://code.google.com/p/chromium/issues/detail?id=20071
    TP.$language = TP.$language.replace('_', '-');
}
else if (TP.$agent.indexOf('safari/') !== -1 ||
            TP.$agent.indexOf('mobile/') !== -1)    //  only reports
                                                    //  'mobile' when
                                                    //  iPhone/iPad is
                                                    //  running TIBET in
                                                    //  'non-chrome' mode.
{
    //  safari can lie completely, but typically identifies itself. the
    //  bigger problem is that a few others are clones for the Mac that we
    //  don't want to try to support.
    if (TP.$agent.indexOf('arora') !== -1 ||
        TP.$agent.indexOf('epiphany') !== -1 ||
        TP.$agent.indexOf('midori') !== -1 ||
        TP.$agent.indexOf('omniweb') !== -1 ||
        TP.$agent.indexOf('shiira') !== -1) {
        TP.$browser = 'wk-clone';
    } else {
        TP.$browser = 'safari';
        TP.$browserUI = 'webkit';
        TP.$browserSuffix = 'Webkit';

        //  capture safari number for browser version numbering
        TP.$$match = TP.$agent.match(/version\/([^ ]*?)($| )/);
        if (TP.$$match != null) {
            TP.$$assignBrowser(TP.$$match[1]);
        }

        //  capture the webkit id for rendering engine numbers
        TP.$$match = TP.$agent.match(/applewebkit\/([^ ]*?)($| )/);
        if (TP.$$match != null) {
            TP.$$assignBrowserUI(TP.$$match[1]);
        }
    }
}
else if (TP.$agent.indexOf('firefox/') !== -1 ||
            TP.$agent.indexOf('minefield/') !== -1 ||
            TP.$agent.indexOf('mozilladeveloperpreview/' !== -1))
{
    //  firefox has a number of clones we want to watch out for
    if (TP.$agent.indexOf('camino') !== -1 ||
        TP.$agent.indexOf('epiphany') !== -1 ||
        TP.$agent.indexOf('flock') !== -1 ||
        TP.$agent.indexOf('navigator') !== -1 ||
        TP.$agent.indexOf('swiftfox') !== -1) {
        TP.$browser = 'ff-clone';
    } else {
        TP.$browser = 'firefox';
        TP.$browserUI = 'gecko';
        TP.$browserSuffix = 'Gecko';

        //  nightlies use minefield, not firefox, for version prefix
        if (TP.$agent.indexOf('minefield') !== -1) {
            TP.$$match = TP.$agent.match(/minefield\/([^ ]*?)($| )/);
        } else {
            TP.$$match = TP.$agent.match(/firefox\/([^ ]*?)($| )/);
        }

        if (TP.$$match != null) {
            TP.$$assignBrowser(TP.$$match[1]);
        }

        //  capture the gecko id for rendering engine numbers
        TP.$$match = TP.$agent.match(/rv:(.*?)\)/);
        if (TP.$$match != null) {
            TP.$$assignBrowserUI(TP.$$match[1]);
        }
    }
}
else if (TP.$agent.indexOf('msie') !== -1)
{
    //  some browsers may lie, but they won't have ActiveXObject support
    if (TP.global.ActiveXObject != null) {
        TP.$browser = 'ie';
        TP.$browserUI = 'trident';
        TP.$browserSuffix = 'IE';

        //  version is number (ala 6.0) behind key
        TP.$$match = TP.$agent.match(/msie (.*?);/);
        if (TP.$$match != null) {
            TP.$$assignBrowser(TP.$$match[1]);
        }

        //  Trident numbers aren't accessible from JS, but they map as
        //  follows:
        if (TP.$browserMajor === 7) {
            TP.$$assignBrowserUI('5.0.0.0');
        } else if (TP.$browserMajor === 8) {
            TP.$$assignBrowserUI('6.0.0.0');
        }
    } else {
        TP.$browser = 'spoof';
    }
}

//  ----------------------------------------------------------------------------
//  DETECTION QUERIES
//  ----------------------------------------------------------------------------

TP.boot.getBrowser = function() {

    /**
     * @name getBrowser
     * @summary Returns the standard 'browser' string, typically one of:
     *     'firefox', 'ie', 'safari', 'chrome'.
     * @return {String} The String representing the 'browser'.
     */

    return TP.$browser;
};

//  ----------------------------------------------------------------------------

TP.boot.getBrowserUI = function() {

    /**
     * @name getBrowserUI
     * @summary Returns the standard 'browser UI' string, typically one of:
     *     'gecko', 'trident', 'webkit'.
     * @return {String} The String representing the 'browser UI'.
     */

    return TP.$browserUI;
};

//  ----------------------------------------------------------------------------

TP.boot.isMac = function() {

    return TP.$platform.indexOf('mac') === 0;
};

//  ----------------------------------------------------------------------------

TP.boot.isNix = function() {

    return TP.$platform.indexOf('*nix') === 0;
};

//  ----------------------------------------------------------------------------

TP.boot.isWin = function() {

    return TP.$platform.indexOf('win') === 0 ||
            TP.$platform.indexOf('vista') === 0;
};

//  ----------------------------------------------------------------------------

TP.boot.isUA = function(browser, varargs) {

    /**
     * @name isUA
     * @summary Tests the current user agent (UA) for a specific version, or a
     *     version equal-to-or-above (TP.UP) or equal-to-or-below (TP.DOWN) a
     *     specified version number.
     * @param {String} browser The browser or browser UI string, typically one
     *     of: 'ie', 'safari', 'chrome', 'firefox', 'trident', 'webkit', or
     *     'gecko'.
     * @param {arguments} varargs The remaining arguments can range from 0 to 5
     *     in length where the arguments are major, minor, patchMajor,
     *     patchMinor, and comparison respectively. The first 4 are numbers used
     *     to specify a version to varying degrees of detail. The comparison
     *     value should be a string, either TP.UP or TP.DOWN, which defines how
     *     the version testing should be done.
     * @return {Boolean} True if the current browser matches the test criteria.
     * @todo
     */

    var ua,
        cachedUA,

        arg,

        bmajor,
        bminor,
        bbuild,
        bpatch,

        tmajor,
        tminor,
        tbuild,
        tpatch,

        comparison;

    //  browser key must match lowercase
    ua = browser.toLowerCase();

    if (arguments.length === 1) {
        if ((cachedUA = TP.$$uaInfo[ua]) != null) {
            return cachedUA;
        }

        if (TP.$browser !== ua && TP.$browserUI !== ua) {
            TP.$$uaInfo[ua] = false;

            return false;
        }
    }

    //  define which keys we'll be using, browser or browerUI, based on what
    //  the inbound value was
    if (TP.$browser === ua) {
        bmajor = '$browserMajor';
        bminor = '$browserMinor';
        bbuild = '$browserBuild';
        bpatch = '$browserPatch';
    } else if (TP.$browserUI === ua) {
        bmajor = '$browserUIMajor';
        bminor = '$browserUIMinor';
        bbuild = '$browserUIBuild';
        bpatch = '$browserUIPatch';
    } else {
        return false;
    }

    //  slice up argument list based on length and data type to support the
    //  specific variable argument list form we've chosen
    switch (arguments.length) {
        case 1:

            //  no version info/comparison, just browser
            TP.$$uaInfo[ua] = true;

            return true;

        case 2:

            //  got a major version number only, ala TP.boot.isUA('IE', 7),
            //  so the comparison is simple
            return TP[bmajor] === arguments[1];

        case 3:

            tmajor = arguments[1];
            arg = parseInt(arguments[2], 10);

            if (isNaN(arg)) {
                comparison = arguments[2];
            } else {
                tminor = arguments[2];
            }

            break;

        case 4:

            tmajor = arguments[1];
            tminor = arguments[2];
            arg = parseInt(arguments[3], 10);

            if (isNaN(arg)) {
                comparison = arguments[3];
            } else {
                tbuild = arguments[3];
            }

            break;

        case 5:

            tmajor = arguments[1];
            tminor = arguments[2];
            tbuild = arguments[3];
            arg = parseInt(arguments[4], 10);

            if (isNaN(arg)) {
                comparison = arguments[4];
            } else {
                tpatch = arguments[4];
            }

            break;

        case 6:

            tmajor = arguments[1];
            tminor = arguments[2];
            tbuild = arguments[3];
            tpatch = arguments[4];
            comparison = arguments[5];

            break;

        default:

            break;
    }

    comparison = (comparison != null) ? comparison.toUpperCase() : null;

    //  do the comparison. the basic idea here is that a match is valid as
    //  long as each step from major to minor patch release is consistent.
    if (comparison === TP.UP) {
        if (TP[bmajor] < tmajor) {
            return false;
        } else if (TP[bmajor] > tmajor) {
            return true;
        }

        if (tminor == null || TP[bminor] > tminor) {
            return true;
        } else if (TP[bminor] < tminor) {
            return false;
        }

        if (tbuild == null || TP[bbuild] > tbuild) {
            return true;
        } else if (TP[bbuild] < tbuild) {
            return false;
        }

        if (tpatch == null || TP[bpatch] > tpatch) {
            return true;
        } else if (TP[bpatch] < tpatch) {
            return false;
        }
    } else if (comparison === TP.DOWN) {
        if (TP[bmajor] > tmajor) {
            return false;
        } else if (TP[bmajor] < tmajor) {
            return true;
        }

        if (tminor == null || TP[bminor] < tminor) {
            return true;
        } else if (TP[bminor] > tminor) {
            return false;
        }

        if (tbuild == null || TP[bbuild] < tbuild) {
            return true;
        } else if (TP[bbuild] > tbuild) {
            return false;
        }

        if (tpatch == null || TP[bpatch] < tpatch) {
            return true;
        } else if (tpatch != null && TP[bpatch] > tpatch) {
            return false;
        }
    } else {
        if (tmajor !== TP[bmajor]) {
            return false;
        }

        if (tminor != null && tminor !== TP[bminor]) {
            return false;
        }

        if (tbuild != null && tbuild !== TP[bbuild]) {
            return false;
        }

        if (tpatch != null && tpatch !== TP[bpatch]) {
            return false;
        }
    }

    return true;
};

//  ----------------------------------------------------------------------------
//  IE MSXML VERSION TRACKING
//  ----------------------------------------------------------------------------

/*
Various tasks such as document creation etc. can be sensitive to the MSXML
and JScript versions available in IE. We test for that information here.
*/

//  ----------------------------------------------------------------------------

if (TP.boot.isUA('IE')) {

    //  NB: Put this in an enclosing function so that we can use local vars
    //  without them being hoisted into the global space
    (function() {
        var xmlDoc;

        //  We assign to 'xmlDoc' here to avoid JSHint errors, but we don't
        //  really use it.

        //  NB: MSXML versions 4 and 5 are not recommended by Microsoft, but
        //  we go ahead and set the TP.$msxml variable to the real version of
        //  MSXML that is installed. It's just that this shouldn't be used for
        //  creating documents, etc.
        try {
            xmlDoc = new ActiveXObject('Msxml2.DOMDocument.6.0');
            TP.$msxml = 6;
        } catch (e) {
            try {
                xmlDoc = new ActiveXObject('Msxml2.DOMDocument.5.0');
                TP.$msxml = 5;
            } catch (e2) {
                try {
                    xmlDoc = new ActiveXObject('Msxml2.DOMDocument.4.0');
                    TP.$msxml = 4;
                } catch (e3) {
                    try {
                        xmlDoc = new ActiveXObject('Msxml2.DOMDocument.3.0');
                        TP.$msxml = 3;
                    } catch (e4) {
                        try {
                            xmlDoc =
                                new ActiveXObject('Msxml2.DOMDocument.2.0');
                            TP.$msxml = 2;
                        } catch (e5) {
                        }
                    }
                }
            }
        }
    })();
}

//  ----------------------------------------------------------------------------

TP.boot.isMSXML = function(version, comparison) {

    /**
     * @name isMSXML
     * @summary Tests IE's MSXML version for an explicit version, or a version
     *     equal-to-or-above (TP.UP) or equal-to-or-below (TP.DOWN) a specified
     *     version number.
     * @param {Number} version The version number for comparison.
     * @param {String} comparison TP.UP or TP.DOWN.
     * @todo
     */

    if (comparison === TP.UP) {
        return TP.$msxml >= version;
    } else if (comparison === TP.DOWN) {
        return TP.$msxml <= version;
    } else {
        return TP.$msxml === version;
    }
};

//  ----------------------------------------------------------------------------
//  SUPPORTED PLATFORM TRACKING
//  ----------------------------------------------------------------------------

TP.boot.isObsolete = function() {

    /**
     * @name isObsolete
     * @summary Returns whether or not TIBET considers the current browser to be
     *     obsolete. Any browser not appearing to be ECMAScript-5 compliant is
     *     considered to be obsolete. Obsolete browsers refuse to boot TIBET.
     * @return {Boolean} Whether TIBET considers the browser obsolete.
     */

    //  simple check for rough ECMAScript 5 compliance.
    if ((typeof Object.keys !== 'function') ||
        (typeof Object.defineProperty !== 'function')) {
        return true;
    }

    return false;
};

//  ----------------------------------------------------------------------------

TP.boot.isSupported = function() {

    /**
     * @name isSupported
     * @summary Returns whether or not TIBET is supported in the browser that
     *     is currently trying to execute it. Supported browsers boot without
     *     any warnings. Obsolete browsers refuse to boot. "Unsupported" which
     *     is the gap between obsolete and supported (or those which aren't in
     *     the primary browser list) boot with warnings.
     * @return {Boolean} Whether or not TIBET is supported in the currently
     *     executing browser.
     */

    //  check for a few more advanced options re: HTML5
    if (window.WebSocket && window.Worker) {
        return true;
    }

    return false;
};

//  ----------------------------------------------------------------------------
//  LOAD INFORMATION
//  ----------------------------------------------------------------------------

/*
It's common to need information about the location from which TIBET was
loaded. This set of functions provides access to the host, port, protocol,
and pathname which were used to load TIBET, as well as the 'launch path'.
*/

//  first define whether we were loaded from file url or a web server
TP.sys.$httpBased = (window.location.protocol.indexOf('file') !== 0);

TP.sys.$scheme = window.location.protocol.slice(0, -1);
TP.sys.$pathname = decodeURI(window.location.pathname);

if (TP.sys.$httpBased) {
    TP.sys.$host = window.location.hostname;
    TP.sys.$port = ((window.location.port === '') ||
                    (window.location.port == null)) ?
                            80 :
                            window.location.port;
} else {
    TP.sys.$host = '';
    TP.sys.$port = '';
}

//  ----------------------------------------------------------------------------

TP.sys.isHTTPBased = function() {

    /**
     * @name isHTTPBased
     * @summary Returns true if the TIBET codebase was loaded via HTTP.
     * @return {Boolean} Whether or not the TIBET codebase was loaded over
     *     HTTP.
     */

    return TP.sys.$httpBased;
};

//  ----------------------------------------------------------------------------

TP.sys.getLaunchRoot = function() {

    /**
     * @name getLaunchRoot
     * @summary Returns the "launch root", either the web server's root or the
     *     root of the file system from which the current app was launched.
     * @return {String} The root path that the TIBET codebase was launched
     *     from.
     */

    var str,
        port,
        loc;

    if (TP.boot.$isValid(TP.sys.$launchRoot)) {
        return TP.sys.$launchRoot;
    }

    if (TP.sys.isHTTPBased()) {
        //  on http uris you need the host:port portion as a root
        str = TP.sys.getScheme() + '://' + TP.sys.getHost();
        if (TP.boot.$isValid(port = TP.sys.getPort()) &&
            port.toString() !== '80') {
            str += ':' + port;
        }
    } else if (TP.boot.isWin()) {
        //  on windows if you don't include the drive spec in the root the
        //  files won't be found. this is consistent with IE behavior.
        loc = decodeURI(window.location.toString());
        loc = loc.split(/[#?]/)[0];
        str = loc.slice(0, loc.lastIndexOf(':') + 1);
    } else {
        //  on unix-style platforms there's no drive spec to mess things up
        //  when resolving 'absolute' paths starting with '/'
        str = 'file://';
    }

    TP.sys.$launchRoot = str;

    return str;
};

//  ----------------------------------------------------------------------------

TP.sys.getHost = function() {

    /**
     * @name getHost
     * @summary Returns the hostname from which TIBET was loaded.
     * @return {String} The host from which TIBET was loaded.
     */

    return TP.sys.$host;
};

//  ----------------------------------------------------------------------------

TP.sys.getPathname = function() {

    /**
     * @name getPathname
     * @summary Returns the pathname from which TIBET was loaded.
     * @return {String} The pathname from which TIBET was loaded.
     */

    return TP.sys.$pathname;
};

//  ----------------------------------------------------------------------------

TP.sys.getPort = function() {

    /**
     * @name getPort
     * @summary Returns the port number string from which TIBET was loaded. If
     *     no port number was specified in the load URL this string is empty.
     * @return {Number} The port number from which TIBET was loaded.
     */

    return TP.sys.$port;
};

//  ----------------------------------------------------------------------------

TP.sys.getScheme = function() {

    /**
     * @name getScheme
     * @summary Returns the scheme used when TIBET was loaded. This is
     *     typically http or https which allows TIBET to determine if a secure
     *     connection is required as the default for future connections to the
     *     server.
     * @return {String} The protocol used when TIBET was loaded.
     * @todo
     */

    return TP.sys.$scheme;
};

//  ----------------------------------------------------------------------------
//  HTTP PRIMITIVES
//  ----------------------------------------------------------------------------

/**
 * @HTTP protocol support primitives. These provide the foundation for the
 *     HTTP-based content operations specific to booting. Full-featured versions
 *     ofthese are also found in the TIBET kernel, which adds support for a
 *     number ofmore advanced features.
 * @todo
 */

//  ----------------------------------------------------------------------------

TP.boot.$httpCall = function(targetUrl, callType, callHeaders, callUri) {

    /**
     * @name $httpCall
     * @summary Performs an XMLHTTPRequest based on the information provided.
     *     NOTE again that this version is specific to the boot system where
     *     synchronous loads are actually what's desired/required to ensure
     *     proper load sequencing.
     * @param {String} targetUrl The request's target URL.
     * @param {String} callType One of the valid HTTP call types such as
     *     TP.HTTP_HEAD, or TP.HTTP_GET.
     * @param {Array} callHeaders Key/value pairs to be used as request headers.
     *     Note that this call automatically uses no-cache headers. We use an
     *     array to avoid issues with loading TIBET and adding additional
     *     elements to Object.prototype. NOTE: that this differs from the
     *     kernel's $httpCall API which uses a hash.
     * @param {String} callUri Optional URI data for the call. Often used for
     *     GET/POST calls to provide CGI parameter strings, etc.
     * @raises Error Various HTTP-related errors.
     * @return {XMLHTTPRequest} The request object used for the call.
     * @todo
     */

    var i,
        httpObj,
        len;

    if (targetUrl == null) {
        return TP.boot.$httpError('InvalidURL: ' + targetUrl);
    }

    if (callType == null) {
        return TP.boot.$httpError('InvalidCallType: ' + callType);
    }

    //  same domain? if not we'll need permission to do this
    if (TP.boot.isUA('GECKO') &&
        (targetUrl.indexOf(TP.sys.getLaunchRoot()) !== 0)) {
        try {
            if (TP.sys.cfg('log.privilege_requests')) {
                TP.boot.$stdout('Privilege request at TP.boot.$httpCall',
                                TP.WARN);
            }

            netscape.security.PrivilegeManager.enablePrivilege(
                                                'UniversalBrowserRead');
        } catch (e) {
            return TP.boot.$httpError(
                        'PrivilegeException. url: ' + targetUrl,
                        TP.boot.$ec(e));
        }
    }

    try {
        httpObj = TP.boot.$httpCreate();

        //  If its Mozilla, and we're not trying to load XML, then set
        //  the MIME type to 'text/plain' to avoid parsing errors due to
        //  Moz trying to turn everything into XML and then complaining
        if (TP.boot.isUA('GECKO') &&
            (TP.boot.$uriResultType(targetUrl) !== TP.DOM)) {
            httpObj.overrideMimeType('text/plain');
        }
    } catch (e) {
        return TP.boot.$httpError(
            'RequestObjectError.  url: ' + targetUrl, TP.boot.$ec(e));
    }

    try {
        httpObj.open(callType, targetUrl, false);
    } catch (e) {
        return TP.boot.$httpError(
            'RequestOpenError. url: ' + targetUrl, TP.boot.$ec(e));
    }

    //  process any headers, note we always bypass caches if possible
    try {
        httpObj.setRequestHeader('Pragma', 'no-cache');
        httpObj.setRequestHeader('Cache-control', 'no-cache');
        httpObj.setRequestHeader('Cache-control', 'no-store');

        httpObj.setRequestHeader(
                'X-Requested-With', 'XMLHttpRequest');

        if (callHeaders != null) {
            //  NOTE    the use of an array here to avoid issues with TIBET
            //          adding to Object.prototype during the load process
            len = callHeaders.length;
            for (i = 0; i < len; i = i + 2) {
                httpObj.setRequestHeader(callHeaders[i],
                                            callHeaders[i + 1]);
            }
        }
    } catch (e) {
        return TP.boot.$httpError(
                    'HeaderConfigurationError. url: ' + targetUrl,
                    TP.boot.$ec(e));
    }

    //  isolate the actual send call for finer-grained error handling
    try {
        if (TP.sys.cfg('debug.http')) {
            TP.boot.$stdout('TP.boot.$httpCall() targetUrl: ' +
                targetUrl, TP.TRACE);
            TP.boot.$stdout('TP.boot.$httpCall() callType: ' +
                callType, TP.TRACE);
            TP.boot.$stdout('TP.boot.$httpCall() callUri: ' +
                ((callUri != null) ? callUri : 'n/a'), TP.TRACE);
        }

        httpObj.send(callUri);

        if (TP.sys.cfg('debug.http')) {
            TP.boot.$stdout('TP.boot.$httpCall() status: ' +
                httpObj.status, TP.TRACE);
            TP.boot.$stdout('TP.boot.$httpCall() headers: ' +
                httpObj.getAllResponseHeaders(), TP.TRACE);

            if (TP.boot.$$verbose) {
                TP.boot.$stdout('TP.boot.$httpCall() result: ' +
                    httpObj.responseText, TP.TRACE);
            }
        }
    } catch (e) {
        return TP.boot.$httpError(
                    'HTTPCallException: url: ' + targetUrl,
                    TP.boot.$ec(e));
    }

    return httpObj;
};

//  ----------------------------------------------------------------------------

TP.boot.$httpCreate = function() {

    /**
     * @name $httpCreate
     * @summary Returns a platform-specific XMLHttpRequest object for use.
     * @return {XMLHttpRequest} A new XMLHttpRequest object.
     */

    var request,
        versions,
        len,
        i;

    if (TP.boot.isUA('IE')) {
        //  first check here _should be_ for IE's built-in, however...
        //  TIBET doesn't use this object by default, because of the
        //  following limitations on calls made by using this object:
        //      - Limited to http:// or https:// protocols
        //      - Limited to same port, host and domain

        //  try to create the most recent version possible

        //  NB: MSXML versions 4 and 5 are not recommended by Microsoft,
        //  so we don't create them and have them commented out here.
        versions = ['Msxml2.XMLHTTP.6.0',
                        //'Msxml2.XMLHTTP.5.0',
                        //'Msxml1.XMLHTTP.4.0',
                        'Msxml2.XMLHTTP.3.0',
                        'Msxml2.XMLHTTP',
                        'Microsoft.XMLHTTP'];
        len = versions.length;

        for (i = 0; i < len; i++) {
            try {
                request = new ActiveXObject(versions[i]);
                break;
            } catch (e) {
            }
        }
    } else {
        request = new XMLHttpRequest();
    }

    if (request == null) {
        TP.boot.shouldStop('HTTP request creation failure.');
        TP.boot.$stderr(
            'RequestCreationError: could not create request object.', TP.FATAL);
    }

    return request;
};

//  ----------------------------------------------------------------------------

TP.boot.$httpError = function(aString, errObj) {

    /**
     * @name $httpError
     * @summary Throws an error containing aString, and optionally logs the
     *     string to TP.boot.$stderr. This allows debug mode to control
     *     whether all such calls are logged at the low level, while allowing
     *     catch blocks in higher-level calls to handle errors silently when not
     *     in debug mode.
     * @param {String} aString The error message, if any.
     * @param {Object} errObj An optional Error object, as creatd by the
     *     TP.boot.$ec() call.
     * @raises Error Throws an Error containing aString.
     * @return {null}
     * @todo
     */

    //  since we're throwing an exception here we'll rely on debug mode to
    //  tell us if we should log or not. the error may be handled higher up
    if (TP.sys.cfg('debug.http')) {
        TP.boot.$stderr(aString, errObj);
    }

    throw new Error(aString);
};

//  ----------------------------------------------------------------------------
//  URI PATHS
//  ----------------------------------------------------------------------------

/*
Path manipulation. These provide the necessary hooks to alter path
names to meet platform requirements and deal with "virtualized" paths.
*/

//  ----------------------------------------------------------------------------

TP.boot.$uriCollapsePath = function(aPath) {

    /**
     * @name $uriCollapsePath
     * @summary Collapses a URI path to remove any embedded . or .. segments
     *     which may exist.
     * @param {String} aPath The path to collapse.
     * @return {String} The path with any . or .. collapsed.
     */

    var path,
        newpath;

    //  first step is to expand any ~ path elements so we get an absolute
    //  path to work with
    path = TP.boot.$uriExpandPath(aPath);

    //  if the path has /. in it anywhere we've got an offset of some kind,
    //  but otherwise we can return with minimal overhead
    if (TP.HAS_PATH_OFFSET_REGEX.test(path) === false) {
        return decodeURI(path);
    }

    while (TP.HAS_PATH_OFFSET_REGEX.test(path)) {
        newpath = path.replace(TP.REMOVE_PATH_OFFSET_REGEX, '');

        if (newpath === path) {
            break;
        }

        path = newpath;
    }

    while (TP.HAS_PATH_NOOP_REGEX.test(path)) {
        newpath = path.replace(TP.REMOVE_PATH_NOOP_REGEX, '');

        if (newpath === path) {
            break;
        }

        path = newpath;
    }

    return decodeURI(path);
};

//  ----------------------------------------------------------------------------

TP.boot.$uriExpandPath = function(aPath) {

    /**
     * @name $uriExpandPath
     * @summary Returns the expanded form of the TIBET '~' (tilde) path
     *     provided. Variable values in the path (~[varname]/) are expanded
     *     using the corresponding TP.sys.cfg(path.varname) lookup. NOTE the
     *     'path.' prefixing here. All path variables are expected to be
     *     registered under a path.app_* or path.lib_* style key to help
     *     maintain lookup conventions.
     * @param {String} aPath The TIBET path to expand.
     * @return {String} A newly constructed path string.
     */

    var path,
        arr,
        variable,
        value;

    if ((path = TP.boot.$$fullPaths[aPath]) != null) {
        return path;
    }

    if (!aPath) {
        return aPath;
    }

    if (aPath === '/') {
        return TP.sys.getLaunchRoot();
    }

    if (aPath.indexOf('/') === 0) {
        // Launch root doesn't include a trailing slash, so avoid possible
        // recursion via uriJoinPaths and just concatenate.
        return TP.sys.getLaunchRoot() + aPath;
    }

    if (aPath.indexOf('~') !== 0) {
        return aPath;
    }

    //  we'll be altering the value so it's best not to mod the parameter
    path = aPath;

    if (path.indexOf('~/') === 0 || path === '~') {
        path = TP.boot.$uriJoinPaths(TP.boot.$getAppHead(), path.slice(2));
    } else if (path.indexOf('~app/') === 0 || path === '~app') {
        path = TP.boot.$uriJoinPaths(TP.boot.$getAppRoot(), path.slice(5));
    } else if (path.indexOf('~lib/') === 0 || path === '~lib') {
        path = TP.boot.$uriJoinPaths(TP.boot.$getLibRoot(), path.slice(5));
    } else if (path.indexOf('~tibet/') === 0 || path === '~tibet') {
        path = TP.boot.$uriJoinPaths(TP.boot.$getLibRoot(), path.slice(7));
    } else {
        arr = path.match(/~([^\/]*)\/(.*)/);
        if (!arr) {
            arr = path.match(/~([^\/]*)/);
        }

        if (arr) {
            variable = arr[1];

            //  NOTE we resolve these variables via the configuration data
            value = TP.sys.cfg('path.' + variable);

            if (typeof(value) === 'string') {
                //  one issue here is that we may have a variable value
                //  that starts with or ends with a '/' since they're
                //  parts of paths, but we don't want to alter that
                //  aspect of the current path so we want to trim them
                //  off if found
                if (value.indexOf('/') === 0) {
                    value = value.slice(1);
                }

                if (value.lastIndexOf('/') === (value.length - 1)) {
                    value = value.slice(0, -1);
                }

                //  patch the original path for testing
                path = aPath.replace('~' + variable, value);
            } else {
                if (variable === 'app_root') {
                    path = aPath.replace('~' + variable, TP.boot.$$approot);
                } else if (variable === 'lib_root') {
                    path = aPath.replace('~' + variable, TP.boot.$$libroot);
                }
            }
        }
    }

    //  variable expansions can sometimes create additional ~ paths
    if (path !== aPath && path.indexOf('~') === 0) {
        path = TP.boot.$uriExpandPath(path);
    }

    // remove any relative segments before caching
    path = TP.boot.$uriCollapsePath(path);

    //  Cache the expanded value so we don't do this work again.
    TP.boot.$$fullPaths[aPath] = path;

    return path;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriInLocalFormat = function(aPath) {

    /**
     * @name $uriInLocalFormat
     * @summary Returns the path with proper adjustments made to represent a
     *     valid file on the current platform.
     * @param {String} aPath The path to adjust.
     * @return {String} The supplied path adjusted to be a 'proper URL' for the
     *     current platform.
     */

    var path;

    //  work from a fully expanded string value
    path = TP.boot.$uriExpandPath(aPath);

    //  TODO: for now we only support conversion of file: scheme paths
    if (path.indexOf('file:') !== 0) {
        //  NOTE that we don't return the expanded path, we leave the
        //  incoming path in whatever form it came in
        return aPath;
    }

    //  remove the file scheme prefix, which may be all we need to do
    path = TP.boot.$uriMinusFileScheme(path);

    //  non-windows platforms we support don't need anything else, for
    //  example file:///usr/local/tibet becomes /usr/local/tibet :)
    if (!TP.boot.isWin()) {
        return path;
    }

    //  Windows needs some help (to say the least ;))
    if (path.charAt(1) !== ':') {
        path = path.charAt(0) + ':' + path.slice(1, path.length);
    }

    path = path.replace(/\//g, '\\\\');

    return path;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriInTIBETFormat = function(aPath) {

    /**
     * @name $uriInTIBETFormat
     * @summary Returns the path with typical TIBET prefixes for app_cfg,
     *     lib_cfg, app_root, and lib_root replaced with their TIBET aliases.
     *     This is typically used to shorten log output.
     * @param {String} aPath The URI path to process.
     * @return {String} The supplied path with typical TIBET prefixes.
     */

    var path;

    // Don't try to do this until we've computed the proper root paths.
    if (!TP.boot.$$approot || !TP.boot.$$libroot) {
      return aPath;
    }

    // TODO: best to replace with a better list derived from reflection on the
    // sys.cfg path.* properties.
    path = aPath.replace(TP.boot.$uriExpandPath('~app_cfg'), '~app_cfg');
    path = path.replace(TP.boot.$uriExpandPath('~lib_cfg'), '~lib_cfg');
    path = path.replace(TP.boot.$uriExpandPath('~app_src'), '~app_src');
    path = path.replace(TP.boot.$uriExpandPath('~lib_src'), '~lib_src');
    path = path.replace(TP.boot.$uriExpandPath('~app'), '~app');
    path = path.replace(TP.boot.$uriExpandPath('~lib'), '~lib');
    path = path.replace(TP.boot.$uriExpandPath('~tibet'), '~tibet');
    path = path.replace(TP.boot.$uriExpandPath('~'), '~');

    return path;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriIsAbsolute = function(aPath) {

    /**
     * Returns true if the path provided appears to be an aboslute path. Note
     * that this will return true for TIBET virtual paths since they are
     * absolute paths when expanded.
     * @param {string} aPath The path to be tested.
     * @return {Boolean} True if the path is absolute.
     */

    if (aPath.indexOf('~') === 0) {
        return true;
    }

    if (aPath.indexOf('/') === 0) {
        return true;
    }

    if (/^[a-zA-Z]+:/.test(aPath)) {
        return true;
    }

    return false;
};


//  ----------------------------------------------------------------------------

TP.boot.$uriIsVirtual = function(aPath) {

    /**
     * Returns true if the path provided appears to be a virtual path.
     * @param {string} aPath The path to be tested.
     * @return {Boolean} True if the path is virtual.
     */

    return aPath.indexOf('~') === 0;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriJoinPaths = function(firstPath, secondPath) {

    /**
     * @name uriJoinPaths
     * @summary Returns the two path components joined appropriately. Note that
     *     the second path has precedence, meaning that if the second path
     *     appears to be an absolute path the first path isn't used.
     * @param {String} firstPath The 'root' path.
     * @param {String} secondPath The 'tail' path.
     * @return {String} The two supplied paths joined together.
     * @todo
     */

    var i,
        len,
        val,
        first,
        second,
        path;

    if (firstPath == null || firstPath === '') {
        return secondPath;
    }

    if (secondPath == null || secondPath === '') {
        return firstPath;
    }

    //  tibet URIs are absolute, so we can return them immediately
    if (secondPath.indexOf('~') === 0) {
        return secondPath;
    }

    //  'typical' absolute paths can be expanded.
    if (secondPath.indexOf('/') === 0) {
        return TP.boot.$uriExpandPath(secondPath);
    }

    //  if the second path uses a scheme prefix we can return it right away
    if (secondPath.indexOf(':') !== TP.NOT_FOUND) {
        len = TP.SCHEMES.length;
        for (i = 0; i < len; i++) {
            if (secondPath.indexOf('' + TP.SCHEMES[i] + ':') === 0) {
                return secondPath;
            }
        }
    }

    //  work around mozilla bug
    if (firstPath.indexOf('about:blank') === 0) {
        first = firstPath.slice('about:blank'.length);
    } else {
        first = firstPath;
    }

    //  if the first path starts with '~' we adjust to the proper root
    if (first.indexOf('~') === 0) {
        path = TP.boot.$uriExpandPath(first);
        if (path !== first) {
            //  cause re-evaluation with the expanded variable value
            return TP.boot.$uriJoinPaths(path, secondPath);
        }
    }

    //  copy to a local so we can manipulate as needed
    second = secondPath;

    //  adjust for an OSX bug around "absolute paths"
    if (second.indexOf('/Volumes') === 0) {
        //  one case is where path is completely contained in first path
        if (first.indexOf(second) !== TP.NOT_FOUND) {
            return first;
        }

        if (second.indexOf(first) !== TP.NOT_FOUND) {
            return second;
        }

        if (first.indexOf(TP.boot.$uriPlusFileScheme(second))) {
            return first;
        }

        if (second.indexOf(TP.boot.$uriPlusFileScheme(first)) !==
                                                            TP.NOT_FOUND) {
            return second;
        }

        if (TP.boot.$uriPlusFileScheme(first).indexOf(second) !==
                                                            TP.NOT_FOUND) {
            return TP.boot.$uriPlusFileScheme(first);
        }

        if (TP.boot.$uriPlusFileScheme(second).indexOf(first) !==
                                                            TP.NOT_FOUND) {
            return TP.boot.$uriPlusFileScheme(second);
        }

        //  second is still an absolute path so go with that since the first
        //  is usually a "prefix" which is probably incorrect for the
        //  typically more concrete second path
        return TP.boot.$uriPlusFileScheme(second);
    }

    //  deal with second path starting with './', which is superfluous
    if (second.indexOf('./') === 0) {
        //  NOTE we leave on the slash, that will be dealt with later
        second = second.slice(1);
    }

    //  now for the '../' case...first we'll need to remove any trailing
    //  slash from the first path so we can back up accurately
    if (first.charAt(first.length - 1) === '/') {
        //  strange IE question here...reading a basedir ending in /
        //  gives us //. check for it and adjust as needed here
        if (first.lastIndexOf('//') === first.length - 2) {
            first = first.slice(0, first.length - 2);
        } else {
            first = first.slice(0, first.length - 1);
        }
    }

    //  while we're being told to 'back up' the path, do so
    while (second.indexOf('../') === 0) {
        second = second.slice(3, second.length);
        first = first.slice(0, first.lastIndexOf('/'));
    }

    //  join what's left, applying separator as needed
    if (second.charAt(0) !== '/') {
        val = first + '/' + second;
    } else {
        val = first + second;
    }

    return val;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriMinusFileScheme = function(aPath) {

    /**
     * @name $uriMinusFileScheme
     * @summary Returns the filename trimmed of any leading file://[/] chars.
     *     This is often necessary for proper use based on host platform.
     * @param {String} aPath The path to trim.
     * @return {String} The path trimmed of any leading file://[/] characters.
     */

    var path;

    if (!aPath) {
        TP.boot.$stderr('InvalidURI');

        return;
    }

    if (aPath.toLowerCase().indexOf('file:') !== 0) {
        return aPath;
    }

    //  slice off the file:// number of chars, removing the base prefix
    path = aPath.slice('file://'.length);

    //  on Windows we may need to slice 1 more character if the path
    //  matches /drive: rather than a UNC path
    if (TP.boot.isWin() && (/^\/\w:/).test(path)) {
        path = path.slice(1);
    }

    return path;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriPlusFileScheme = function(aPath) {

    /**
     * @name $uriPlusFileScheme
     * @summary Returns the filename padded with leading file://[/] chars. This
     *     is often necessary for proper use based on host platform.
     * @param {String} aPath The path to pad.
     * @return {String} The supplied path padded with the proper leading
     *     file://[/] characters.
     */

    var prefix,
        path;

    if (!aPath) {
        TP.boot.$stderr('InvalidURI');

        return;
    }

    if (aPath.toLowerCase().indexOf('file:') === 0) {
        return aPath;
    }

    prefix = 'file://';

    if (TP.boot.isWin() && (/^\w:/).test(aPath)) {
        prefix = prefix + '/';
    }

    path = prefix + aPath;

    //  one last check for UNC paths on windows is that we don't want to end
    //  up with four slashes...
    if (/file:\/\/\/\//.test(path)) {
        path = path.replace(/file:\/\//, 'file:');
    }

    return path;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriRelativeToPath = function(firstPath, secondPath, filePath) {

    /**
     * @name uriRelativeToPath
     * @summary Returns a "relativized" version of the firstPath at it relates
     *     to the second path. In essence, what path would you have to append to
     *     the secondPath to acquire the resource defined by the first path.
     * @description This method is a core method for helping stored files remain
     *     "relocatable". When storing TIBET metadata or compiled pages their
     *     internal references are automatically adjusted to relative paths
     *     using this routine. For example, given a path of ~lib_cfg/TIBET.xml
     *     as the firstPath and a path of ~lib_cfg as the secondPath we'd expect
     *     the return value to be ./cfg/TIBET.xml. Note that since the path
     *     returned is relative to a directory it is occasionally necessary to
     *     assist TIBET with whether it should treat the last element of the
     *     second path as a file or not. For example, if our secondPath in the
     *     previous example were ~lib_cfg/tibet_kernel.xml we'd want the path to
     *     be returned as ./TIBET.xml, not ../TIBET.xml as it would be if the
     *     last element were a directory.
     * @param {String} firstPath The path to convert.
     * @param {String} secondPath The path to be relative to.
     * @param {Boolean} filePath True if the absolute path includes a file
     *     reference. This is important since the offset is relative to
     *     directories, not files. Defaults to true since the vast majority of
     *     URI references are to files.
     * @return {String} The relativized version of firstPath.
     * @todo
     */

    var file,
        first,
        second,
        index,
        prefix,
        path,
        count,
        ndx,
        i,
        len,
        partial;

    //  the "path we append" to the second path to get the first path when
    //  the first path doesn't exist is null
    if (!firstPath) {
        return;
    }

    //  a "valid path" relative to some non-existent path is presumed to be
    //  the original path itself. we don't presume a "default root" here
    if (!secondPath) {
        return firstPath;
    }

    //  are they the same path? then the relative path is '.'
    if (firstPath === secondPath) {
        return '.';
    }

    //  expand the paths to avoid issues with ~ prefixing
    first = TP.boot.$uriExpandPath(firstPath);
    second = TP.boot.$uriExpandPath(secondPath);

    //  get the first path normalized
    if (first.length > 1 && (first.lastIndexOf('/') === first.length - 1)) {
        //  if the first path ended in a '/' we can safely remove it since
        //  it's the same directory path with or without the trailing /
        first = first.slice(0, -1);
    }

    //  normalize the second path next

    if (filePath === true) {
        //  forced to interpret second path as a file path, so if there's
        //  any / in the second path we use that as the point of trimming
        //  the last segment
        if ((index = second.lastIndexOf('/')) !== TP.NOT_FOUND) {
            if (second.lastIndexOf('/') === (second.length - 1)) {
                second = second.slice(0, -1);
                second = second.slice(0, second.lastIndexOf('/'));
            } else {
                second = second.slice(0, second.lastIndexOf('/'));
            }
        } else {
            //  entire second path is a file name, so our example is
            //  something like file:///thisdir relative to foo.xml. We can't
            //  know where foo.xml is, but we might presume that it's in the
            //  same location as the first path's file (if first has a file
            //  reference, or that it's in the same directory as the first
            //  when the first is a directory path
            if (TP.FILE_PATH_REGEX.test(firstPath)) {
                //  first path has a file location, and we're assuming we're
                //  in the same directory, so the path would be '.'
                return '.' + first.slice(first.lastIndexOf('/'));
            } else {
                //  assuming second path file is in first path directory
                //  we'll return '.'
                return '.';
            }
        }
    } else if (filePath === false) {
        //  not able to alter second path too much, we're being forced to
        //  interpret it as a directory no matter what, but
        if (second.lastIndexOf('/') === (second.length - 1)) {
            second = second.slice(0, -1);
        }
    } else {
        //  try to determine if the second path is a file path or a
        //  directory path...the easiest check is does it end with a '/',
        //  after which we can check for an extension on the last portion
        if (second.lastIndexOf('/') === (second.length - 1)) {
            file = false;
            second = second.slice(0, -1);
        } else {
            //  if we can split the last element (having already split on
            //  '/') and find an extension then it's likely a file path
            if (TP.FILE_PATH_REGEX.test(second)) {
                file = true;
                second = second.slice(0, second.lastIndexOf('/'));
            } else {
                file = false;
            }
        }
    }

    //  after normalization we run our quick checks again

    //  the "path we append" to the second path to get the first path when
    //  the first path doesn't exist is null
    if (!first) {
        return;
    }

    //  a "valid path" relative to some non-existent path is presumed to be
    //  the original path itself. we don't presume a "default root" here
    if (!second) {
        return first;
    }

    //  are they the same path? then the relative path is '.'
    if (first === second) {
        return '.';
    }

    //  now for the other common cases, which hopefully helps us keep this
    //  running a little faster

    //  page compilation often wants a path relative to the cache directory
    //  or similar structure, meaning the first path is a subset of the
    //  second path (~app vs. ~app_tmp) so check for that
    if (second.indexOf(first) !== TP.NOT_FOUND) {
        path = second.replace(first, '');
        if (path.indexOf('/') === 0) {
            path = path.slice(1);
        }

        path = path.split('/');
        len = path.length;

        for (i = 0; i < len; i++) {
            path[i] = '..';
        }

        return path.join('/');
    }

    //  a large (predominant) number of these calls are asking for a full
    //  path relative to a directory higher up the tree (as in an app file
    //  relative to either the lib root or app root). in these cases the
    //  second path is completely contained in the first path and we're
    //  simply trying to detemine how many segments to remove from the path
    //  before we tack on a leading './'. we can determine that condition by
    //  simply replacing the secondPath with a '.' and seeing if we end up
    //  with a './' path meaning the replacement was clean on a directory
    //  boundary
    if ((path = first.replace(second, '.')) !== first) {
        //  we know there was at least a match, but did it produce a valid
        //  relative path?
        if (path.indexOf('./') === 0) {
            return path;
        }
    }

    //  if the first path is relative we can shortcut the test
    if (first.indexOf('.') === 0) {
        //  we're often forced, when resolving two paths, to adapt a path
        //  relative to a file (think about href values being resolved
        //  against their window.location) so we need an extra .. prefix
        if (file === true) {
            //  if it's a "local" file we don't want to return .././foo so
            //  we remove the internal ./ portion and make it ../foo,
            //  otherwise it's ../something and we want ../../something to
            //  ensure we skip past the file element of the second path
            if (first.indexOf('./') === 0) {
                return '../' + first.slice(2);
            } else {
                return '../' + first;
            }
        }

        return first;
    }

    //  a second common case is when we're looking for a directory in
    //  the middle of a larger absolute path (as when trying to locate
    //  basedir or libroot references)
    if ((ndx = second.indexOf(first)) !== TP.NOT_FOUND) {
        //  looks like the first path is a point in the second path, so the
        //  question now is how many segments "up" in the second path is it

        //  get the 'tail' from the match down as our starting point and
        //  remove the matching portion. so if we had something like
        //  file://foo/bar/tibet/baz/tibet.html and 'tibet' or '/tibet' as
        //  a relative portion we're now holding /baz/tibet.html...
        partial = second.slice(ndx).replace(first, '');

        count = partial.split('/').length;
        prefix = '';
        for (i = 0; i < count; i++) {
            prefix = prefix + '../';
        }

        return prefix + first;
    }

    //  neither path is contained in the other, which means we're going to
    //  have to work a bit harder by looking for a common branch point in
    //  the middle of the two paths...

    count = 0;
    ndx = second.lastIndexOf('/');
    while (ndx !== TP.NOT_FOUND) {
        //  peel off the last segment
        second = second.slice(0, ndx);

        //  see if we can replace it as a subset of the first path now...
        if ((path = first.replace(second, '..')) !== first) {
            //  if we can then all we need to do is put the proper number of
            //  jumps (../) on the front so we've adjusted
            if (path.indexOf('../') === 0) {
                prefix = '';
                for (i = 0; i < count; i++) {
                    prefix = prefix + '../';
                }

                return prefix + path;
            }
        }

        //  count so we know to add when we find a match
        count++;

        ndx = second.lastIndexOf('/');
    }

    //  no common elements in the paths at all if we got here..., and the
    //  path wasn't relative so we have to assume absolute and just return
    return first;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriWithRoot = function(targetUrl, aRoot) {

    /**
     * @name $uriWithRoot
     * @summary Returns the path provided with any additional root information
     * which is necessary to create a full path name. The root used is the
     * result of calling TP.boot.$getRootPath(), which may be referencing either
     * the lib or app root at the time of the call depending on the current
     * settings.
     * @param {String} targetUrl A url to expand as needed.
     * @param {String} aRoot The root path to use. Default is launch root.
     * @return {String} The url - after ensuring a root exists.
     */

    var url,
        root;

    if (!targetUrl) {
        return;
    }

    url = targetUrl.toLowerCase();

    if (url.indexOf('http:') === 0 ||
        url.indexOf('file:') === 0 ||
        url.indexOf('https:') === 0) {
        return targetUrl;
    }

    //  note the use of the 'current root' path here since we can't assume
    //  that this should be rooted against libroot or approot without help
    if (TP.boot.$notValid(aRoot)) {
        root = TP.sys.getAppHead();
    } else {
        root = aRoot;
    }

    return TP.boot.$uriJoinPaths(root, targetUrl);
};

//  ----------------------------------------------------------------------------
//  URL (RE)LOCATION
//  ----------------------------------------------------------------------------

/**
 * @Provides methods for determining the true location of a URL. These are
 *     used when redirection of a URL may be occuring. HTTP versions of these
 *     functions rely on the Location header values in 3xx return code results.
 * @todo
 */

//  ----------------------------------------------------------------------------

TP.boot.$uriLocation = function(targetUrl) {

    /**
     * @name $uriLocation
     * @summary Returns the true location of the URL. If the URL has been
     *     moved this will return the Location header value from the redirect,
     *     otherwise the original URL location is returned.
     * @param {String} targetUrl URL of the target resource.
     * @return {String} The true location of the resource which may or may not be
     *     at targetUrl.
     */

    if (!targetUrl) {
        TP.boot.$stderr('InvalidURI');

        return null;
    }

    if (targetUrl.toLowerCase().indexOf('file') === 0) {
        return TP.boot.$uriLocationFile(targetUrl);
    } else {
        return TP.boot.$uriLocationHttp(targetUrl);
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$uriLocationFile = function(targetUrl) {

    /**
     * @name $uriLocationFile
     * @summary Returns the true location of the file. For file urls (no HTTP)
     *     this is the original url. HTTP urls will return a value based on
     *     whether the final url is a redirected value.
     * @param {String} targetUrl URL of the target file.
     * @return {String} The true location of the file which may or may not be
     *     at targetUrl.
     */

    return targetUrl;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriLocationHttp = function(targetUrl) {

    /**
     * @name $uriLocationHttp
     * @summary Returns the true location of the resource. If the resource has
     *     been moved this will return the Location header value from the redirect,
     *     otherwise the original URL location is returned.
     * @param {String} targetUrl URL of the target resource.
     * @return {String} The true location of the resource which may or may not be
     *     at targetUrl.
     */

    var httpObj;

    try {
        httpObj = TP.boot.$httpCall(targetUrl, TP.HTTP_HEAD);
        if (httpObj.status === 200) {
            return targetUrl;
        } else if (httpObj.status >= 300 && httpObj.status <= 307) {
            return httpObj.getResponseHeader('Location');
        } else {
            TP.boot.$stderr('NotFound: ' + targetUrl);
        }
    } catch (e) {
        TP.boot.$stderr('AccessException: ' + targetUrl,
                        TP.boot.$ec(e));
    }

    return null;
};

//  ----------------------------------------------------------------------------
//  RESOURCE AGING
//  ----------------------------------------------------------------------------

/**
 * @Informational methods providing data such as last-modified-date. This is
 *     useful when trying to determine whether a resource should be reloaded, or
 *     in determining whether a generated resource is older than its source.
 * @todo
 */

//  ----------------------------------------------------------------------------

TP.boot.$uriLastModified = function(targetUrl) {

    /**
     * @name $uriLastModified
     * @summary Returns the last-modified-date of the target resource.
     * @param {String} targetUrl URL of the target resource.
     * @raises InvalidURL, UnsupportedFeature
     * @return {Date} The Date the targetUrl was last modified.
     */

    var fname;

    if (!targetUrl) {
        TP.boot.$stderr('InvalidURL: ' + targetUrl);

        return null;
    }

    fname = TP.boot.$uriWithRoot(targetUrl);

    if (fname.toLowerCase().indexOf('file') === 0) {
        if (TP.boot.isUA('IE')) {
            return TP.boot.$uriLastModifiedIEFile(fname);
        } else if (TP.boot.isUA('GECKO')) {
            return TP.boot.$uriLastModifiedMozFile(fname);
        } else if (TP.boot.isUA('WEBKIT')) {
            //  can't access file system on safari so we assume the file was
            //  recently modified to ensure current data on loads
            return (new Date());
        }
    } else {
        return TP.boot.$uriLastModifiedHttp(fname);
    }

    return null;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriLastModifiedIEFile = function(targetUrl) {

    /**
     * @name $uriLastModifiedIEFile
     * @summary Returns the last-modified-date of a file in the file system.
     * @param {String} targetUrl URL of the target file.
     * @raises AccessException, NotFound
     * @return {Date} The Date the targetUrl was last modified.
     */

    var fname,
        fso,
        file;

    //  remove the file:/// or the file won't be found
    fname = TP.boot.$uriMinusFileScheme(
                        TP.boot.$uriInLocalFormat(targetUrl));

    //  make sure that any spaces or other escaped characters in the file
    //  name get unescaped properly.
    fname = unescape(fname);

    try {
        fso = new ActiveXObject('Scripting.FileSystemObject');

        if (fso.FileExists(fname)) {
            file = fso.GetFile(fname);

            return new Date(file.DateLastModified);
        } else {
            TP.boot.$stderr('NotFound: ' + fname);
        }
    } catch (e) {
        TP.boot.$stderr('AccessException: ' + fname,
                        TP.boot.$ec(e));
    }

    return null;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriLastModifiedMozFile = function(targetUrl) {

    /**
     * @name $uriLastModifiedMozFile
     * @summary Returns the last-modified-date of a file in the file system.
     * @param {String} targetUrl URL of the target file.
     * @raises AccessException, PrivilegeException,
     *     NotFound, FileComponentError
     * @return {Date} The Date the targetUrl was last modified.
     */

    //  it turns out that on Mozilla if you query for a directory you'll get
    //  a listing back in XHTML format that you can interrogate for the file
    //  data....of course this is likely to break all the time given that
    //  the moz team apparently can't leave well enough alone :(.

    var httpObj,
        text,
        file,
        re,
        parts,
        info,
        mod;

    httpObj = TP.boot.$httpCreate();

    //  If its Mozilla, and we're not trying to load XML, then set the MIME
    //  type to 'text/plain' to avoid parsing errors.
    if (TP.boot.isUA('GECKO') &&
        TP.boot.$uriResultType(targetUrl) !== TP.DOM) {
        httpObj.overrideMimeType('text/plain');
    }

    try {
        httpObj.open(TP.HTTP_GET,
                        targetUrl.slice(0, targetUrl.lastIndexOf('/')),
                        false);

        httpObj.send(null);
    } catch (e) {
        //  going to say we can't tell
        return null;
    }

    text = httpObj.responseText;

    if (text == null) {
        //  going to say we can't tell
        return null;
    }

    //  clean out whitespace so we (I ;)) can think clearly about the regex
    text = text.replace('\n', '', 'g').replace('> <', '><', 'g');

    //  we'll be matching against the file name only, not the full path
    file = targetUrl.slice(targetUrl.lastIndexOf('/') + 1);

    //  slice out the td's that hold size and date information
    re = new RegExp('>' +
                    file.replace('.', '\\.') +
                    '<\\/a><\\/td>(.*?)<\\/tr>');

    parts = text.match(re);
    if (!parts) {
        return null;
    }

    info = parts[1];

    //  now we'll have something that looks like this:
    //  <td>1 KB</td><td>10/20/2006</td><td>6:41:01 PM</td>
    parts = info.split('</td><td>');

    mod = new Date(parts[1] + ' ' + parts[2].slice(0, -5));

    return mod;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriLastModifiedHttp = function(targetUrl) {

    /**
     * @name $uriLastModifiedHttp
     * @summary Returns the last-modified-date of a resource on a web server.
     * @param {String} targetUrl URL of the target resource.
     * @raises AccessException, NotFound
     * @return {Date} The Date the targetUrl was last modified.
     */

    var httpObj,
        header;

    //  leverage HEAD requests and HTTP headers to test resource.
    try {
        httpObj = TP.boot.$httpCall(targetUrl, TP.HTTP_HEAD);

        if (httpObj.status === 200) {
            header = httpObj.getResponseHeader('Last-Modified');

            return new Date(header);
        } else if (httpObj.status >= 300 && httpObj.status <= 307) {
            return TP.boot.$uriLastModifiedMozHttp(
                            httpObj.getResponseHeader('Location'));
        } else {
            TP.boot.$stderr('NotFound: ' + targetUrl);
        }
    } catch (e) {
        TP.boot.$stderr('AccessException: ' + targetUrl,
                        TP.boot.$ec(e));
    }

    return null;
};

//  ----------------------------------------------------------------------------
//  RESOURCE COMPARISON
//  ----------------------------------------------------------------------------

/*
Compares two resources by last-modified-date. This is useful when trying to
determine whether a resources should be reloaded, or in determining whether a
generated resources is older than its source.
*/

//  ----------------------------------------------------------------------------

TP.boot.$uriCurrent = function(targetUrl, sourceUrl) {

    /**
     * @name $uriCurrent
     * @summary Returns true if targetUrl has a newer modified date than
     *     sourceUrl. This version dispatches to the proper low-level
     *     browser-specific version appropriate to the environment.
     * @param {String} targetUrl URL of the target resource.
     * @param {String} sourceUrl URL of the source resource.
     * @return {Boolean} Whether or not the targetUrl is 'current' against the
     *     sourceUrl.
     * @todo
     */

    var t1,
        t2;

    if (targetUrl == null) {
        return false;
    }

    if (sourceUrl == null) {
        return true;
    }

    try {
        t1 = TP.boot.$uriLastModified(targetUrl);
    } catch (e) {
        //  error here means target is bad, etc.
        return false;
    }

    try {
        t2 = TP.boot.$uriLastModified(sourceUrl);

        //  both resources have dates, do the comparison
        return t1 >= t2;
    } catch (e) {
        //  error here means source is bad, but target is probably
        //  'more recent' in that case
        return true;
    }

    TP.boot.$stderr('UnsupportedFeature: TP.boot.$uriCurrent()');

    return false;
};

//  ----------------------------------------------------------------------------
//  RESOURCE EXISTENCE
//  ----------------------------------------------------------------------------

/*
Any time we are provided with a URL we check for its existence using
an appropriate mechanism. Both Mozilla and IE provide utilities for this
purpose at the file system level. Likewise, both provide an HTTP interface
which can be used to test for resource existence. This avoids 404's etc.
*/

//  ----------------------------------------------------------------------------

TP.boot.$uriExists = function(targetUrl) {

    /**
     * @name $uriExists
     * @summary Returns true if targetUrl exists on the boot server.
     * @param {String} targetUrl URL of the target resource.
     * @return {Boolean} Whether or not the targetUrl exists.
     */

    if (!targetUrl) {
        return false;
    }

    if (targetUrl.toLowerCase().indexOf('file') === 0) {
        return TP.boot.$uriExistsFile(targetUrl);
    } else {
        return TP.boot.$uriExistsHttp(targetUrl);
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$uriExistsFile = function(targetUrl) {

    /**
     * @name $uriExistsFile
     * @summary Returns true if targetUrl exists on the boot server.
     * @param {String} targetUrl URL of the target file.
     * @return {Boolean} Whether or not the targetUrl exists.
     */

    var httpObj;

    //  using HTTP object avoids permission problems on all browsers
    httpObj = TP.boot.$httpCreate();

    //  If its Mozilla, and we're not trying to load XML, then set the MIME
    //  type to 'text/plain' to avoid parsing errors.
    if (TP.boot.isUA('GECKO') &&
        TP.boot.$uriResultType(targetUrl) !== TP.DOM) {
        httpObj.overrideMimeType('text/plain');
    }

    try {
        httpObj.open(TP.HTTP_GET, targetUrl, false);
        httpObj.send(null);
    } catch (e) {
        //  IE acts strangely, depending on version and whether the URL
        //  being tested is a file or a directory. If it was a file, and it
        //  existed, we would never have gotten here. If could be a
        //  directory and exist, though, in which case an exception is still
        //  thrown. Luckily it is fairly straightforward to distinguish
        //  between that case and the case where its either a file or a
        //  directory, but really doesn't exist.

        if (TP.boot.isUA('IE')) {
            //  IE versions less than 8:

            //  If an exception is thrown with 'The system cannot locate the
            //  resource specified', then it couldn't find the file or
            //  directory and we should return false.
            if (/cannot locate/.test(e.message)) {
                return false;
            }

            //  IE8 and newer behavior:

            //  If the http status code is 2 or 3 and the exception is
            //  thrown with 'System error: -2146697211', then it couldn't
            //  find the file or directory and we should return false.
            if (/System error: -2146697211/.test(e.message) &&
                    (httpObj.status === 2 || httpObj.status === 3)) {
                return false;
            }

            //  Otherwise, it was probably a
            //  directory that really does exist, so we fall through to
            //  returning true at the end of the method.

            //  NOTE: in IE8 and higher, this will have an http status
            //  code of 0 and the exception will have: 'System error:
            //  -2146697195'
        } else if (TP.boot.isUA('GECKO')) {
            if (/Access to restricted URI denied/.test(e.message)) {
                TP.boot.$stderr('AccessException: ' + targetUrl,
                                TP.boot.$ec(e));
            }

            return false;
        } else {
            //  It threw an exception, which means that it definitely
            //  didn't find it so we always return false if we get here.
            return false;
        }
    }

    if (TP.boot.isUA('WEBKIT')) {
        //  Safari 4.X - all platforms
        if (httpObj.status === 404) {
            return false;
        }

        //  Safari 4.X - Windows
        if (TP.boot.isWin() && httpObj.status === -1100) {
            return false;
        }

        //  Safari 3.1 - Mac
        if (TP.boot.isMac() &&
            (httpObj.status === -1100 || httpObj.status === 400)) {
            return false;
        }

        //  Safari 3.1 - Windows
        if (TP.boot.isWin() && httpObj.status === 1789378560) {
            return false;
        }

        //  Chrome workaround -- sigh.
        if (httpObj.status === 0 && httpObj.responseText === '') {
            return false;
        }
    }

    return true;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriExistsHttp = function(targetUrl) {

    /**
     * @name $uriExistsHttp
     * @summary Returns true if targetUrl exists on the boot server.
     * @param {String} targetUrl URL of the target resource.
     * @return {Boolean} Whether or not the targetUrl exists.
     */

    var httpObj;

    try {
        httpObj = TP.boot.$httpCall(targetUrl, TP.HTTP_HEAD);

        if (httpObj.status === 200) {
            return true;
        } else if (httpObj.status >= 300 && httpObj.status <= 307) {
            return true;
        } else if (httpObj.status === 0) {
            if (/^chrome-extension/.test(targetUrl) &&
                httpObj.response != null) {
                return true;
            }
        }
    } catch (e) {
        //  index lookups cause problems, so if the path doesn't have an
        //  extension (or even more specifically ends with tibetinf) then
        //  presume a redirect/exception is "exists, but can't open"
        if (targetUrl &&
            targetUrl.indexOf(TP.sys.cfg('boot.tibetinf')) !==
                                                        TP.NOT_FOUND) {
            return true;
        }

        TP.boot.$stderr('AccessException: ' + targetUrl,
                        TP.boot.$ec(e));

        return false;
    }

    return false;
};

//  ----------------------------------------------------------------------------
//  RESOURCE LOAD
//  ----------------------------------------------------------------------------

/*
Numerous resources including XML config/build data need to be loaded at various
times. The routines in this section read data from either the local file
system or the net and produce XML documents which can be manipulated.
*/

//  ----------------------------------------------------------------------------

TP.boot.$uriLoad = function(targetUrl, resultType, targetType, isCacheable,
                            isPackage)
{
    /**
     * @name $uriLoad
     * @summary Loads the content of a targetUrl, returning that content as
     *     either XML or text depending on the desired resultType. The work to
     *     load the content may include checking TIBET's client-side cache based
     *     on targetType and isCacheable values.
     * @param {String} targetUrl URL of the target resource.
     * @param {TP.DOM|TP.TEXT} resultType Result as a DOM node or TEXT.
     * @param {String} targetType The nature of the target, 'source' or
     *     'manifest' are common values here.
     * @param {Boolean} isCacheable True if the content may be in the cache, and
     *     should be cached when loaded.
     * @param {Boolean} isPackage True if the resource being imported is a
     *     package-level resource. This can impact cache storage logic.
     * @return {XMLDocument|String} The XML document or String that was loaded
     *     from the targetUrl.
     * @todo
     */

    var logpath,
        result,
        lastmod;

    if (targetUrl == null) {
        TP.boot.$stderr('InvalidURI');

        return null;
    }

    //  compute common result type from input and targetUrl extension.
    resultType = TP.boot.$uriResultType(targetUrl, resultType);

    //  clear our cache lookup flag
    TP.boot.$loadCached = false;

    //  if the cache is active and being requested then we need to check
    //  there before going over the wire/to the file system (with one or two
    //  caveats based on the source preference).
    if (TP.sys.cfg('boot.localcache') && (isCacheable === true)) {

        logpath = TP.boot.$uriInTIBETFormat(targetUrl);

        switch (TP.sys.cfg('import.source')) {
            case 'marked':

                //  NOTE we fall through on purpose here...if the import
                //  mode is marked but this node is listed as cacheable then
                //  it must not be marked. in that case we fall through,
                //  check the cache and proceed based on our findings.

            case 'local':

                //  check cache before anything else, and no..we don't
                //  care about Last-Modified date, if we find the data
                //  we use it.
                TP.$BOOT_STORAGE.get(
                    targetUrl,
                    function(content) {

                        if (TP.boot.$isValid(content)) {
                            //  map content to outer scoped var for
                            //  reference after exit
                            result = TP.boot.$uriResult(content,
                                                            resultType);

                            //  flag that we got the data from the cache
                            TP.boot.$loadCached = true;
                        }
                    });

                //  if we found data then because we're set for 'local' mode
                //  we can return the data directly without checking dates
                if (TP.boot.$loadCached) {
                    if (TP.sys.cfg('debug.cache')) {
                        TP.boot.$stdout('Loaded ' + logpath +
                                        ' from cache.', TP.TRACE);
                    }

                    return result;
                }

                break;

            case 'modified':

                //  modification dates are almost impossible to gather from
                //  non-HTTP urls so we don't support this approach except
                //  for urls with either an http or https scheme.
                if (/^http/.test(targetUrl)) {
                    //  depends on whether we can find a Last-Modified date
                    //  and some cached data for the targetUrl
                    TP.$BOOT_STORAGE.get(
                        targetUrl + '_lastmodified',
                        function(content) {

                            if (TP.boot.$isValid(content)) {
                                //  map content to outer scoped var for
                                //  reference after exit
                                lastmod = content;
                            }
                        });

                    //  if we found a modified date for the data we'll rely
                    //  on the uriLoad HTTP variant to use a 304-aware call
                    //  when it sees a last modified date and to return
                    //  cached data in response to a 304.
                    if (lastmod) {
                        if (TP.sys.cfg('debug.cache')) {
                            TP.boot.$stdout('Found ' + logpath +
                                        ' date ' + lastmod, TP.TRACE);
                        }

                        //  NOTE that we'll have to rely on this routine to
                        //  cache the data when it's checking 304 states.
                        return TP.boot.$uriLoadCommonHttp(
                                            targetUrl,
                                            resultType,
                                            lastmod,
                                            isCacheable,
                                            isPackage);
                    } else {
                        if (TP.sys.cfg('debug.cache')) {
                            TP.boot.$stdout('No modified date for ' +
                                            logpath, TP.TRACE);
                        }
                    }
                }

                break;

            default:

                //  don't care about cache, being forced to go remote

                break;
        }
    }

    if (targetUrl.toLowerCase().indexOf('file') === 0) {
        if (TP.boot.isUA('IE')) {
            result = TP.boot.$uriLoadIEFile(targetUrl, resultType);
        } else if (TP.sys.cfg('boot.moz_xpcom')) {
            //  if the uriLoadCommonFile has to switch into privilege mode
            //  for Moz/FF3+ then the flag will redirect so we don't waste
            //  time trying HTTP, we'll go straight to XPCOM
            result = TP.boot.$uriLoadMozFile(targetUrl, resultType);
        } else {
            result = TP.boot.$uriLoadCommonFile(targetUrl, resultType);
        }
    } else {
        //  NOTE that when we don't access cache data we don't provide a
        //  last modified date here so the HTTP calls don't check for 304.
        //  We do pass along a modified value for cacheable so the HTTP
        //  response can be saved in the cache if appropriate however.
        result = TP.boot.$uriLoadCommonHttp(
                targetUrl,
                resultType,
                null,
                TP.sys.cfg('boot.localcache') && (isCacheable === true),
                isPackage);
    }

    return result;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriLoadCommonFile = function(targetUrl, resultType) {

    /**
     * @name $uriLoadCommonFile
     * @summary Loads (reads and produces an XML document for) targetUrl.
     * @param {String} targetUrl URL of the target file.
     * @param {TP.DOM|TP.TEXT} resultType Result as a DOM node or TEXT.
     * @return {XMLDocument|String} The XML document or String that was loaded
     *     from the targetUrl.
     * @todo
     */

    var httpObj;

    resultType = TP.boot.$uriResultType(targetUrl, resultType);

    httpObj = TP.boot.$httpCreate();

    //  If its Mozilla, and we're not trying to load XML, then set the MIME
    //  type to 'text/plain' to avoid parsing errors.
    if (TP.boot.isUA('GECKO') && (resultType !== TP.DOM)) {
        httpObj.overrideMimeType('text/plain');
    }

    //  for non-IE we always use the same approach to get the
    //  data...xmlhttprequest...even when using a file url
    try {
        httpObj.open(TP.HTTP_GET, targetUrl, false);
        httpObj.send(null);
    } catch (e) {
        //  as of FF3 HTTP calls to the file system can fail for a number of
        //  security reasons. if we encounter an error we'll retry via XPCOM
        if (TP.boot.isUA('GECKO', 1, 9, 0, TP.UP)) {
            TP.boot.$stdout('Switching to XPCOM for file load operations',
                            TP.boot.$ec(e), TP.WARN);
            TP.sys.setcfg('boot.moz_xpcom', true);

            return TP.boot.$uriLoadMozFile(targetUrl, resultType);
        }

        return null;
    }

    return TP.boot.$uriResult(httpObj.responseText, resultType);
};

//  ----------------------------------------------------------------------------

TP.boot.$uriLoadIEFile = function(targetUrl, resultType) {

    /**
     * @name $uriLoadIEFile
     * @summary Loads (reads and produces an XML document for) targetUrl.
     * @param {String} targetUrl URL of the target file.
     * @param {TP.DOM|TP.TEXT} resultType Result as a DOM node or TEXT.
     * @return {XMLDocument|String} The XML document or String that was loaded
     *     from the targetUrl.
     * @todo
     */

    var doc,

        httpObj;

    resultType = TP.boot.$uriResultType(targetUrl, resultType);

    if (resultType === TP.DOM) {
        //  leverage DOMDocument's ability to load synchronously
        doc = TP.boot.$documentCreate();
        doc.load(targetUrl);

        if (doc.xml == null || doc.xml === '') {
            return;
        }

        return doc;
    } else {
        //  We use the HTTP functionality here, since it respects the 'same
        //  domain' process during boot, unlike the FileSystemObject (which
        //  causes disconcerting ActiveX alerts even when we're just reading
        //  a file from the same domain we booted from).

        httpObj = TP.boot.$httpCreate();

        try {
            httpObj.open(TP.HTTP_GET, targetUrl, false);
            httpObj.send(null);
        } catch (e) {
            //  An exception is thrown with 'The system cannot locate the
            //  resource specified' if file isn't there
            return null;
        }

        return TP.boot.$uriResult(httpObj.responseText, resultType);
    }

    return null;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriLoadMozFile = function(targetUrl, resultType) {

    /**
     * @name uriLoadMozFile
     * @summary Loads (reads and produces an XML document for) targetUrl. This
     *     version is specific to Mozilla 1.3+ browsers.
     * @param {String} targetUrl URL of the target file.
     * @param {TP.DOM|TP.TEXT} resultType Result as a DOM node or TEXT.
     * @raises URINotFound, AccessViolation, DOMParseException,
     *     PrivilegeViolation, URIComponentException
     * @return {XMLDocument|String} The XML document or String that was loaded
     *     from the targetUrl.
     * @since 2.0
     * @todo
     */

    var FP,
        IOS,
        IS,

        file,
        fname,

        channel,
        stream,

        text;

    resultType = TP.boot.$uriResultType(targetUrl, resultType);

    //  file system access in Mozilla requires UniversalXPConnect
    try {
        if (TP.sys.cfg('log.privilege_requests')) {
            TP.boot.$stdout('Privilege request at TP.boot.$uriLoadMozFile',
                TP.WARN);
        }

        netscape.security.PrivilegeManager.enablePrivilege(
                                            'UniversalXPConnect');
    } catch (e) {
        TP.boot.$stderr('PrivilegeException: ' + targetUrl,
                        TP.boot.$ec(e));

        return;
    }

    try {
        //  mozilla-specific components, see Moz's FileUtils.js etc.
        FP = new Components.Constructor(
                    '@mozilla.org/file/local;1',
                    'nsILocalFile', 'initWithPath');

        IOS = Components.classes[
                    '@mozilla.org/network/io-service;1'].getService(
                    Components.interfaces.nsIIOService);

        IS = new Components.Constructor(
                    '@mozilla.org/scriptableinputstream;1',
                    'nsIScriptableInputStream');
    } catch (e) {
        TP.boot.$stderr('FileComponentError: ' + targetUrl,
                        TP.boot.$ec(e));

        return;
    }

    //  adjust file name for platform and access path
    fname = TP.boot.$uriMinusFileScheme(
                                TP.boot.$uriInLocalFormat(targetUrl));

    //  make sure that any spaces or other escaped characters in the file
    //  name get unescaped properly.
    fname = unescape(fname);

    //  now for the fun part, files and channels and streams, oh my!
    try {
        file = new FP(fname);
        if (file.exists()) {
            channel = IOS.newChannelFromURI(IOS.newFileURI(file));
            stream = new IS();

            stream.init(channel.open());
            text = stream.read(file.fileSize);
            stream.close();

            return TP.boot.$uriResult(text, resultType);
        }
    } catch (e) {
        TP.boot.$stderr('AccessViolation: ' + targetUrl,
                        TP.boot.$ec(e));

        return;
    }

    return null;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriLoadCommonHttp = function(targetUrl, resultType, lastModified,
                                        isCacheable, isPackage)
{
    /**
     * @name $uriLoadCommonHttp
     * @summary Loads (reads and produces an XML document for) targetUrl.
     * @param {String} targetUrl URL of the target resource.
     * @param {TP.DOM|TP.TEXT} resultType Result as a DOM node or TEXT.
     * @param {String} lastModified An optional Last-Modified header value used
     *     along with 304 checking to minimize overhead for HTTP calls whose
     *     content is cached but needs to be refreshed.
     * @param {Boolean} isCacheable True if the content may be in the cache, and
     *     should be cached when loaded.
     * @param {Boolean} isPackage True if the resource being imported is a
     *     package-level resource. This can impact cache storage logic.
     * @return {XMLDocument|String} The XML document or String that was loaded
     *     from the targetUrl.
     * @todo
     */

    var logpath,
        doc,
        httpObj,
        result,
        headers,
        lastmod,
        response,
        chunks,
        len,
        i,
        chunk,
        chunkName,
        cnameRegex;

    resultType = TP.boot.$uriResultType(targetUrl, resultType);

    //  When accessing XML on IE we can leverage the DOMDocument load
    //  method for fast synchronous access provided we don't need to be
    //  leveraging header data for Last-Modified times.
    if (TP.boot.isUA('IE') && resultType === TP.DOM && !lastModified) {
        doc = TP.boot.$documentCreate();
        doc.load(targetUrl);

        if (doc.xml == null || doc.xml === '') {
            return;
        }

        return doc;
    }

    try {
        //  if we got a valid lastModified value then we're being asked to
        //  load for a "synchronized" update and need to use 304-aware code
        if (lastModified) {
            //  the httpCall routine accepts an array of key/value pairs as
            //  header content (to avoid issues with for/in etc) so build
            //  that here and pass along an If-Modified-Since header.
            headers = [];
            headers.push('If-Modified-Since', lastModified);

            httpObj = TP.boot.$httpCall(targetUrl, TP.HTTP_GET, headers);
        } else {
            httpObj = TP.boot.$httpCall(targetUrl, TP.HTTP_GET);
        }

        logpath = TP.boot.$uriInTIBETFormat(targetUrl);

        if (httpObj.status === 200) {

            //  if we did a= last-modified check and got a 200 we need to
            //  update our cache with both the date and the content since we
            //  got back new content, not a 304 saying the cache was fine
            if (lastModified) {
                if (TP.sys.cfg('debug.cache')) {
                    TP.boot.$stdout('Loaded ' + logpath + ' from origin.',
                                    TP.TRACE);
                }

                lastmod = httpObj.getResponseHeader('Last-Modified');
                if (TP.sys.cfg('debug.cache')) {
                    TP.boot.$stdout('Refreshed ' + logpath +
                                    ' to ' + lastmod, TP.TRACE);
                }

                TP.$BOOT_STORAGE.set(
                        targetUrl + '_lastmodified',
                        lastmod,
                        TP.NOOP);
            }

            //  if we're either working from a existing resource with a valid
            //  last-modified date or a new cachable resource then we want to
            //  save the result to the cache
            if (lastModified || isCacheable) {
                //  one additional check here, at least for the short-term,
                //  is that we only want to store javascript files that have
                //  been compressed...otherwise the cache will fill up.
                if (/\.js$/.test(logpath) !== true ||
                    logpath.indexOf(
                         TP.sys.cfg('pack.extension') + '.js') !==
                                                             TP.NOT_FOUND) {
                    if (TP.sys.cfg('debug.cache')) {
                        TP.boot.$stdout('Storing ' +
                                        logpath +
                                        ' to cache.', TP.TRACE);
                    }

                    response = httpObj.responseText;

                    TP.$BOOT_STORAGE.set(
                            targetUrl,
                            response,
                            TP.NOOP);

                    //  code might be loading in packaged form, but we also
                    //  want to update the individual chunks so we can
                    //  support smaller-grained incremental updates.
                    if (isPackage && TP.sys.cfg('import.chunks')) {
                        if (TP.sys.cfg('debug.cache')) {
                            TP.boot.$stdout('Checking ' +
                                            logpath +
                                            ' for chunks.', TP.TRACE);
                        }

                        chunks = response.split(
                                        TP.sys.cfg('boot.uichunked'));

                        len = chunks.length;
                        if (len > 1) {
                            cnameRegex = /\/\/\t(.*)/;

                            for (i = 0; i < len; i++) {
                                chunk = chunks[i];
                                if (!cnameRegex.test(chunk)) {
                                    continue;
                                }

                                chunkName = chunk.match(/\/\/\t(.*)/)[1];
                                if (chunkName &&
                                    (chunkName !== 'inline source')) {
                                    if (TP.sys.cfg('debug.cache')) {
                                        TP.boot.$stdout(
                                        'Storing ' +
                                        TP.boot.$uriInTIBETFormat(
                                                            chunkName) +
                                        ' to cache.', TP.TRACE);
                                    }

                                    TP.$BOOT_STORAGE.set(
                                            chunkName,
                                            chunk,
                                            TP.NOOP);
                                }
                            }
                        }
                    }
                }
            }

            return TP.boot.$uriResult(httpObj.responseText, resultType);
        } else if (httpObj.status === 304) {
            //  if we did a last-modified check and got a 304 then we want
            //  to return the data we find in the cache
            TP.$BOOT_STORAGE.get(
                targetUrl,
                function(content) {

                    if (TP.boot.$isValid(content)) {
                        //  map content to our enclosing var for
                        //  reference, packaging it property for type
                        result = TP.boot.$uriResult(content, resultType);

                        //  flag that we got the data from the cache
                        TP.boot.$loadCached = true;

                        if (TP.sys.cfg('debug.cache')) {
                            TP.boot.$stdout('Loaded ' +
                                            logpath +
                                            ' from cache.', TP.TRACE);
                        }
                    } else {
                        if (TP.sys.cfg('debug.cache')) {
                            //  a bit of a problem...had a last-modified
                            //  stamp but no data? ouch.
                            TP.boot.$stdout('Missing ' +
                                            logpath +
                                            ' in cache.', TP.TRACE);
                        }

                        //  at a minimum clear the old data so we don't do
                        //  this more than once...
                        TP.$BOOT_STORAGE.set(
                                targetUrl + '_lastmodified',
                                null,
                                TP.NOOP);

                        TP.$BOOT_STORAGE.set(
                                targetUrl,
                                null,
                                TP.NOOP);
                    }
                });

            //  if we found data then because we're set for 'local' mode
            //  we can return the data directly without checking dates
            if (TP.boot.$loadCached) {
                return result;
            }
        } else if (httpObj.status === 0) {
            if (/^chrome-extension/.test(targetUrl) &&
                httpObj.responseText != null) {
                return TP.boot.$uriResult(httpObj.responseText, resultType);
            }
        }
    } catch (e) {
        TP.boot.$stderr('AccessException: ' + targetUrl,
                        TP.boot.$ec(e));
    }

    return null;
};

//  ----------------------------------------------------------------------------
//  URI RESULTS
//  ----------------------------------------------------------------------------

TP.boot.$uriResult = function(text, type) {

    /**
     * @name $uriResult
     * @summary Returns the proper result object given the result text and
     *     result type, typically from an XMLHTTPRequest's responseText.
     * @param {String} text The response text to process.
     * @param {TP.DOM|TP.TEXT|null} type The result type desired.
     * @return {String|Document} An XML document or the response text.
     * @todo
     */

    var doc;

    if (text == null) {
        return null;
    }

    if (type === TP.TEXT) {
        return text;
    }

    doc = TP.boot.$documentFromString(text);

    //  watch out for "empty documents"
    if (TP.boot.$isValid(doc) && (doc.childNodes.length > 0)) {
        return doc;
    }

    if (type !== TP.DOM) {
        return text;
    }

    return null;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriResultType = function(targetUrl, resultType) {

    /**
     * @name $uriResultType
     * @summary Returns a reasonable result type, TP.TEXT or TP.DOM, based on
     *     examination of the targetUrl's extension. If that check isn't
     *     definitive then the original resultType is returned (which may mean a
     *     null result type is returned).
     * @param {String} targetUrl A url to define a result type for.
     * @param {TP.DOM|TP.TEXT|null} resultType A result type constant.
     * @return {Number} TP.DOM|TP.TEXT|null
     * @todo
     */

    //  Certain extensions are clearly not intended to be XML, like .js and
    //  .css files for example. We ignore any input result type in these
    //  cases since there's no way they should be TP.DOM even if specified.
    if (/\.js$|\.css$|\.html$|\.txt$|\.json$/.test(targetUrl)) {
        return TP.TEXT;
    }

    if (/\.xml$|\.xhtml$|\.tsh$|\.xsl$|\.xsd$/.test(targetUrl)) {
        return TP.DOM;
    }

    //  Yes, this might be null.
    return resultType;
};

//  ----------------------------------------------------------------------------
//  RESOURCE SAVE
//  ----------------------------------------------------------------------------

/*
Primitive functions supporting resource save operations. Note that the HTTP
versions require the assistance of the TIBET Development Server components
or an equivalent set of CGI scripts/Servlets on the server side while the
file-system versions require varying permissions.
*/

//  ----------------------------------------------------------------------------

TP.boot.$uriSave = function(targetUrl, fileContent, fileMode) {

    /**
     * @name $uriSave
     * @summary Saves the fileContent to the targetUrl provided. If fileMode is
     *     'w' then the existing contents of the file, if any, are replaced with
     *     the new content. If fileMode is 'a' then the new content is appended
     *     to any existing content. In both cases the file is created if it
     *     doesn't already exist.
     * @param {String} targetUrl URL of the target file.
     * @param {String} fileContent The content of the file to save.
     * @param {String} fileMode Write (w) or append (a).
     * @raises NotFound, AccessException,
     *     InvalidFileMode, PrivilegeException, UnsupportedFeature
     * @return {Boolean} True on success, false on failure.
     * @todo
     */

    var fname;

    if (targetUrl == null) {
        TP.boot.$stderr('InvalidURI');

        return false;
    }

    fname = TP.boot.$uriWithRoot(targetUrl);

    if (fname.toLowerCase().indexOf('file') === 0) {
        if (TP.boot.isUA('GECKO')) {
            return TP.boot.$uriSaveMozFile(fname, fileContent, fileMode);
        } else if (TP.boot.isUA('IE')) {
            return TP.boot.$uriSaveIEFile(fname, fileContent, fileMode);
        } else if (TP.boot.isUA('WEBKIT')) {
            return TP.boot.$uriSaveWebkitFile(fname, fileContent, fileMode);
        }
    } else {
        return TP.boot.$uriSaveHttp(fname, fileContent, fileMode);
    }

    return null;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriSaveIEFile = function(targetUrl, fileContent, fileMode) {

    /**
     * @name $uriSaveIEFile
     * @summary Saves the fileContent to the targetUrl provided. If fileMode is
     *     'w' then the existing contents of the file, if any, are replaced with
     *     the new content. If fileMode is 'a' then the new content is appended
     *     to any existing content. When using 'a' an error is thrown if the
     *     file doesn't exist. When using 'w' the file is created if it doesn't
     *     already exist.
     * @param {String} targetUrl URL of the target file.
     * @param {String} fileContent The content of the file to save.
     * @param {String} fileMode Write (w) or append (a).
     * @raises NotFound, InvalidFileMode,
     *     AccessException
     * @return {Boolean} True on success, false on failure.
     * @todo
     */

    var fname,
        file,
        fso,
        ts;

    fname = TP.boot.$uriMinusFileScheme(
                        TP.boot.$uriInLocalFormat(targetUrl));

    if (fileMode == null) {
        fileMode = 'w';
    }

    //  make sure that any spaces or other escaped characters in the file
    //  name get unescaped properly.
    fname = unescape(fname);

    try {
        fso = new ActiveXObject('Scripting.FileSystemObject');

        if (fileMode === 'w') {
            if (!fso.FileExists(fname)) {
                fso.CreateTextFile(fname);
            }

            file = fso.GetFile(fname);
            ts = file.OpenAsTextStream(2);  //  2 -> ForWriting
            ts.Write(fileContent);
            ts.Close();

            return true;
        } else if (fileMode === 'a') {
            if (fso.FileExists(fname)) {
                file = fso.GetFile(fname);
                ts = file.OpenAsTextStream(8);  //  8 -> ForAppending
                ts.Write(fileContent);
                ts.Close();

                return true;
            } else {
                TP.boot.$stderr('NotFound: ' + fname);
            }
        } else {
            TP.boot.$stderr('InvalidFileMode: ' + fileMode);
        }
    } catch (e) {
        TP.boot.$stderr('AccessException: ' + fname,
                        TP.boot.$ec(e));
    }

    return false;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriSaveMozFile = function(targetUrl, fileContent, fileMode) {

    /**
     * @name $uriSaveMozFile
     * @summary Saves the fileContent to the targetUrl provided. If fileMode is
     *     'w' then the existing contents of the file, if any, are replaced with
     *     the new content. If fileMode is 'a' then the new content is appended
     *     to any existing content. When using 'a' an error is thrown if the
     *     file doesn't exist. When using 'w' the file is created if it doesn't
     *     already exist.
     * @param {String} targetUrl URL of the target file.
     * @param {String} fileContent The content of the file to save.
     * @param {String} fileMode Write (w) or append (a).
     * @raises NotFound, InvalidFileMode,
     *     AccessException, PrivilegeException
     * @return {Boolean} True on success, false on failure.
     * @todo
     */

    var FP,

        file,
        fname,
        flags,
        permissions,

        stream;

    if (fileMode == null) {
        fileMode = 'w';
    }

    //  file system access in Mozilla requires UniversalXPConnect
    try {
        if (TP.sys.cfg('log.privilege_requests')) {
            TP.boot.$stdout('Privilege request at TP.boot.$uriSaveMozFile',
                           TP.WARN);
        }

        netscape.security.PrivilegeManager.enablePrivilege(
                                            'UniversalXPConnect');
    } catch (e) {
        TP.boot.$stderr('PrivilegeException: ' + targetUrl,
                        TP.boot.$ec(e));

        return false;
    }

    //  mozilla-specific components, see Moz's FileUtils.js etc.
    try {
        FP = new Components.Constructor(
                    '@mozilla.org/file/local;1',
                    'nsILocalFile', 'initWithPath');

        stream = Components.classes[
            '@mozilla.org/network/file-output-stream;1'].createInstance(
                    Components.interfaces.nsIFileOutputStream);
    } catch (e) {
        TP.boot.$stderr('FileComponentError: ' + targetUrl,
                        TP.boot.$ec(e));

        return false;
    }

    //  adjust file name for platform and access path
    fname = TP.boot.$uriMinusFileScheme(
                                TP.boot.$uriInLocalFormat(targetUrl));

    //  make sure that any spaces or other escaped characters in the file
    //  name get unescaped properly.
    fname = unescape(fname);

    /* jshint bitwise:false */

    //  now for the fun part, files and transports and streams, oh my!
    try {
        permissions = 0644;                 //  unix-style file mask
        file = new FP(fname);
        if (fileMode === 'w') {
            flags = TP.MOZ_FILE_CREATE |
                    TP.MOZ_FILE_TRUNCATE |
                    TP.MOZ_FILE_WRONLY;

            stream.init(file, flags, permissions, null);
            stream.write(fileContent, fileContent.length);
            stream.flush();
            stream.close();

            return true;
        } else if (fileMode === 'a') {
            flags = TP.MOZ_FILE_APPEND |
                    TP.MOZ_FILE_SYNC |
                    TP.MOZ_FILE_RDWR;

            if (file.exists()) {
                stream.init(file, flags, permissions, null);
                stream.write(fileContent, fileContent.length);
                stream.flush();
                stream.close();

                return true;
            } else {
                TP.boot.$stderr('NotFound: ' + fname);
            }
        } else {
            TP.boot.$stderr('InvalidFileMode: ' + fileMode);
        }
    } catch (e) {
        TP.boot.$stderr('AccessException: ' + fname,
                        TP.boot.$ec(e));
    }

    /* jshint bitwise:true */

    return false;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriSaveWebkitFile = function(targetUrl, fileContent, fileMode) {

    /**
     * @name $uriSaveWebkitFile
     * @summary Saves the fileContent to the targetUrl provided. If fileMode is
     *     'w' then the existing contents of the file, if any, are replaced with
     *     the new content. If fileMode is 'a' then the new content is appended
     *     to any existing content. When using 'a' an error is thrown if the
     *     file doesn't exist. When using 'w' the file is created if it doesn't
     *     already exist.
     * @param {String} targetUrl URL of the target file.
     * @param {String} fileContent The content of the file to save.
     * @param {String} fileMode Write (w) or append (a).
     * @raises NotFound, InvalidFileMode,
     *     AccessException
     * @return {Boolean} True on success, false on failure.
     * @todo
     */

    TP.boot.$stderr('UnsupportedFeature: TP.boot.$uriSaveWebkitFile()');

    return false;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriSaveHttp = function(targetUrl, fileContent, fileMode) {

    /**
     * @name $uriSaveHttp
     * @summary Saves the fileContent to the targetUrl provided. If fileMode is
     *     'w' then the existing contents of the file, if any, are replaced with
     *     the new content. If fileMode is 'a' then the new content is appended
     *     to any existing content. When using 'a' an error is thrown if the
     *     file doesn't exist. When using 'w' the file is created if it doesn't
     *     already exist.
     * @param {String} targetUrl URL of the target file.
     * @param {String} fileContent The content of the file to save.
     * @param {String} fileMode Write (w) or append (a).
     * @raises HTTPError, AccessException
     * @return {Boolean} True on success, false on failure.
     * @todo
     */

    var path,
        url,
        httpObj;

    try {
        path = TP.boot.$uriExpandPath(targetUrl);

        httpObj = TP.boot.$httpCall(
                    path,
                    TP.HTTP_PUT,
                    ['Content-Type', 'text/plain'],
                    fileContent);

        if (httpObj.status === 200) {
            return true;
        } else {
            TP.boot.$stderr('HTTPError: ' + httpObj.status +
                            ' url: ' + url);
        }
    } catch (e) {
        TP.boot.$stderr('AccessException: ' + targetUrl,
                        TP.boot.$ec(e));
    }

    return false;
};

//  ----------------------------------------------------------------------------
//  DOM FUNCTIONS
//  ----------------------------------------------------------------------------

/*
Minimal functions to support boot system requirements for new documents.
*/

//  ----------------------------------------------------------------------------

TP.boot.$documentCreate = function(versionNumber) {

    /**
     * @name $documentCreate
     * @summary Creates a DOM document element for use.
     * @param {Number} versionNumber A specific version number which must be
     *     returned as a minimum version.
     * @return {XMLDocument} A new XML document.
     */

    if (TP.boot.isUA('IE')) {
        return TP.boot.$documentCreateIE(versionNumber);
    } else {
        return document.implementation.createDocument('', '', null);
    }

    return null;
};

//  ----------------------------------------------------------------------------

TP.boot.$documentCreateIE = function(versionNumber) {

    /**
     * @name $documentCreateIE
     * @summary Creates a DOM document element for use.
     * @param {Number} versionNumber A specific version number which must be
     *     returned as a minimum version.
     * @return {XMLDocument} A new XML document.
     */

    var doc,

        versions,
        len,
        i;

    if (versionNumber != null && typeof(versionNumber) === 'number') {
        //  asked for a specific version...
        switch (versionNumber) {
            case 2:

                doc = new ActiveXObject('Msxml2.DOMDocument');

                break;

            case 3:

                doc = new ActiveXObject('Msxml2.DOMDocument.3.0');

                break;

            /*
            NB: MSXML versions 4 and 5 are not recommended by Microsoft
            case 4:
                doc = new ActiveXObject('Msxml2.DOMDocument.4.0');
                break;
            case 5:
                doc = new ActiveXObject('Msxml2.DOMDocument.5.0');
                break;
            */

            case 6:

                doc = new ActiveXObject('Msxml2.DOMDocument.6.0');

                break;

            default:

                doc = new ActiveXObject('Msxml2.DOMDocument.3.0');

                break;
        }
    } else {
        //  attempt to get the latest and greatest version possible
        //  NB: DOMDocument versions 4 and 5 are not recommended by
        //  Microsoft, so we don't create them.
        versions = ['Msxml2.DOMDocument.6.0',
                        //'Msxml2.DOMDocument.5.0',
                        //'Msxml2.DOMDocument.4.0',
                        'Msxml2.DOMDocument.3.0',
                        'Msxml2.DOMDocument'];
        len = versions.length;

        for (i = 0; i < len; i++) {
            try {
                doc = new ActiveXObject(versions[i]);
                break;
            } catch (e) {
            }
        }
    }

    doc.resolveExternals = false;
    doc.validateOnParse = false;
    doc.async = false;

    doc.setProperty('SelectionLanguage', 'XPath');
    doc.setProperty('ProhibitDTD', false);

    return doc;
};

//  ----------------------------------------------------------------------------

TP.boot.$documentGetElementById = function(xmldoc, id) {
    return xmldoc.evaluate('//*[@id="'+ id +'"]', xmldoc,
        function () {
            return 'http://www.w3.org/XML/1998/namespace';
        },
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null).singleNodeValue;
};

//  ----------------------------------------------------------------------------

TP.boot.$nodeAppendChild = function(aNode, newNode, shouldThrow) {

    /**
     * @name $nodeAppendChild
     * @summary Appends the newNode to the supplied node.
     * @param {Node} aNode The node to append the child node to.
     * @param {Node} newNode The node to append to aNode.
     * @param {Boolean} shouldThrow True to cause errors to throw a native Error
     *     so outer catch blocks will trigger.
     * @return {Node} The new node. This may be a different node than what was
     *     supplied to this routine, as the node might have been imported.
     * @todo
     */

    var nodeDoc,
        theNode;

    try {
        //  Appending content with syntax errors to the head, as when
        //  doing a source import, won't throw (so catch blocks won't
        //  work),  but the onerror hook will set a non-zero $STATUS.
        $STATUS = 0;

        if (TP.boot.isUA('IE')) {
            aNode.appendChild(newNode);
            theNode = newNode;
        } else {
            if (aNode.nodeType === Node.DOCUMENT_NODE) {
                nodeDoc = aNode;
            } else {
                nodeDoc = aNode.ownerDocument;
            }

            if (nodeDoc !== newNode.ownerDocument) {
                theNode = nodeDoc.importNode(newNode, true);
            } else {
                theNode = newNode;
            }

            aNode.appendChild(theNode);
        }
    } catch (e) {
        //  Required for IE
    } finally {
        if ($STATUS !== 0) {
            //  an error of some kind occurred
            if (shouldThrow) {
                throw new Error('DOMAppendException');
            }
        }
    }

    return theNode;
};

//  ----------------------------------------------------------------------------

TP.boot.$nodeInsertBefore = function(aNode, newNode, insertionPointNode) {

    /**
     * @name $nodeInsertBefore
     * @summary Inserts the newNode into the child content of the supplied node
     *     before the supplied insertion point node. If insertionPointNode is
     *     null, then the new node is just appended to the child content of the
     *     supplied node.
     * @param {Node} anElement The node to insert the child content into.
     * @param {Node} newNode The node to insert into aNode.
     * @param {Node} insertionPointNode The node to use as an insertion point.
     *     The new content will be inserted before this point.
     * @return {Node} The new node. This may be a different node than what was
     *     supplied to this routine, as the node might have been imported.
     * @todo
     */

    var nodeDoc,
        theNode;

    if (TP.boot.isUA('IE')) {
        aNode.insertBefore(newNode, insertionPointNode);
    } else {
        if (aNode.nodeType === Node.DOCUMENT_NODE) {
            nodeDoc = aNode;
        } else {
            nodeDoc = aNode.ownerDocument;
        }

        if (nodeDoc !== newNode.ownerDocument) {
            theNode = nodeDoc.importNode(newNode, true);
        } else {
            theNode = newNode;
        }

        aNode.insertBefore(theNode, insertionPointNode);
    }

    return theNode;
};

//  ----------------------------------------------------------------------------

TP.boot.$nodeReplaceChild = function(aNode, newNode, oldNode) {

    /**
     * @name $nodeReplaceChild
     * @summary Replaces the oldNode in the supplied node with the newNode.
     * @param {Node} aNode The node to replace the child in.
     * @param {Node} newNode The node to replace oldNode with.
     * @param {Node} oldNode The node to be replaced with newNode.
     * @return {Node} The new node. This may be a different node than what was
     *     supplied to this routine, as the node might have been imported.
     * @todo
     */

    var nodeDoc,
        theNode;

    if (TP.boot.isUA('IE')) {
        aNode.replaceChild(newNode, oldNode);
    } else {
        if (aNode.nodeType === Node.DOCUMENT_NODE) {
            nodeDoc = aNode;
        } else {
            nodeDoc = aNode.ownerDocument;
        }

        if (nodeDoc !== newNode.ownerDocument) {
            theNode = nodeDoc.importNode(newNode, true);
        } else {
            theNode = newNode;
        }

        aNode.replaceChild(theNode, oldNode);
    }

    return theNode;
};

//  ----------------------------------------------------------------------------
//  NODE/STRING CONVERSION
//  ----------------------------------------------------------------------------

/*
nodeAsString and documentFromString processing to help with XML processing
*/

//  ----------------------------------------------------------------------------

TP.boot.$documentFromString = function(aString) {

    /**
     * @name $documentFromString
     * @summary Parses aString and returns the XML node representing the root
     *     element of the string's DOM representation.
     * @param {String} aString The source string to be parsed.
     * @return {Node}
     */

    if (TP.boot.isUA('IE')) {
        return TP.boot.$documentFromStringIE(aString);
    } else {
        return TP.boot.$documentFromStringCommon(aString);
    }

    return;
};

//  ----------------------------------------------------------------------------

//  parse once by defining externally to the function we'll use this in
if (TP.boot.isUA('GECKO')) {
    TP.boot.$$xmlParseErrorMsgMatcher =
        /XML Parsing Error: ([^\n]+)\nLocation: [^\n]+\nLine Number (\d+), Column (\d+)/;
} else if (TP.boot.isUA('WEBKIT')) {
    TP.boot.$$xmlParseErrorMsgMatcher =
        /error on line (\d+) at column (\d+): ([^<]+)/;
}

//  ----------------------------------------------------------------------------

TP.boot.$documentFromStringCommon = function(aString) {

    /**
     * @name $documentFromStringCommon
     * @summary Parses aString and returns the XML node representing the root
     *     element of the string's DOM representation.
     * @param {String} aString The source string to be parsed.
     * @return {XMLDocument} The XML document created from the supplied String.
     */

    var parser,
        xmlDoc,

        errorElement,
        errorMatchResults;

    parser = new DOMParser();
    xmlDoc = parser.parseFromString(aString, 'application/xml');

    if (TP.boot.$isValid(errorElement =
                        xmlDoc.getElementsByTagName('parsererror')[0])) {
        errorMatchResults = TP.boot.$$xmlParseErrorMsgMatcher.exec(
                                        errorElement.firstChild.nodeValue);

        //  don't log, we use this call in logging
        return null;
    }

    return xmlDoc;
};

//  ----------------------------------------------------------------------------

TP.boot.$documentFromStringIE = function(aString, prohibitDTD) {

    /**
     * @name $documentFromStringIE
     * @summary Parses aString and returns the XML node representing the root
     *     element of the string's DOM representation.
     * @param {String} aString The source string to be parsed.
     * @param {Boolean} prohibitDTD Turn off ability to parse in documents with
     *     DTDs.
     * @return {XMLDocument} The XML document created from the supplied String.
     * @todo
     */

    var xmlDoc,

        successfulParse,
        parseErrorObj,
        prohibit;

    xmlDoc = TP.boot.$documentCreate();

    prohibit = (prohibitDTD == null) ? false : prohibitDTD;

    xmlDoc.setProperty('ProhibitDTD', prohibit);

    successfulParse = xmlDoc.loadXML(aString);

    if (successfulParse === false) {
        parseErrorObj = xmlDoc.parseError;

        //  don't log, we use this call in logging
        return null;
    }

    return xmlDoc;
};

//  ----------------------------------------------------------------------------

TP.boot.$nodeAsString = function(aNode) {

    /**
     * @name $nodeAsString
     * @summary Returns the string representation of aNode.
     * @param {Node} aNode The node to transform.
     * @return {String} The String representation of the supplied Node.
     */

    if (TP.boot.isUA('IE')) {
        return TP.boot.$nodeAsStringIE(aNode);
    } else {
        return TP.boot.$nodeAsStringCommon(aNode);
    }

    return '';
};

//  ----------------------------------------------------------------------------

TP.boot.$nodeAsStringCommon = function(aNode) {

    /**
     * @name $nodeAsStringMoz
     * @summary Returns the string representation of aNode.
     * @param {Node} aNode The node to transform.
     * @return {String} The String representation of the supplied Node.
     */

    var str;

    if (aNode == null) {
        return '';
    }

    try {
        str = (new XMLSerializer()).serializeToString(aNode);

        return str;
    } catch (e) {
        return '';
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$nodeAsStringIE = function(aNode) {

    /**
     * @name $nodeAsStringIE
     * @summary Returns the string representation of aNode.
     * @param {Node} aNode The node to transform.
     * @return {String} The String representation of the supplied Node.
     */

    if (aNode != null && aNode.xml != null) {
        return aNode.xml;
    }

    return '';
};

//  ----------------------------------------------------------------------------
//  WINDOWING / DISPLAY
//  ----------------------------------------------------------------------------

TP.boot.$currentDocumentLocation = function() {

    /**
     * @name $currentDocumentLocation
     * @summary Returns the enclosing document's location, minus the docname
     *     itself and any parameters on the URI.
     * @return {String} The document's location.
     */

    var str,
        ndx;

    str = decodeURI(window.location.toString());
    str = str.split(/[#?]/)[0];

    ndx = str.lastIndexOf('/');
    if (ndx !== TP.NOT_FOUND) {
        return str.slice(0, ndx);
    } else {
        return str;
    }
};

//  ----------------------------------------------------------------------------

TP.sys.getWindowById = function(anID, aContextWindow) {

    /**
     * @name getWindowById
     * @summary Returns a reference to the window with the ID provided. This
     *     method tries a number of variations to locate a window whose name may
     *     be '.' separated without actually using the open call because we
     *     don't want the side effect of opening a window if the named one
     *     doesn't exist.
     * @param {String} anID A window/frame name.
     * @param {Window} aContext A native window to root the search.
     * @return {Window} A native window reference.
     * @todo
     */

    var id,
        parts,
        elem,

        win,

        arr,
        len,
        i,

        current,
        next,

        opener,

        cWin;

    if (!anID) {
        return;
    }

    cWin = aContextWindow || window;

    //  most common cases in TIBET are 'top' and the aliases 'uicanvas' and
    //  'uiroot'
    switch (anID) {
        case 'top':

            return cWin.top;

        case 'uiroot':
        case 'UIROOT':

            elem = cWin.document.getElementById(anID);
            if (TP.boot.$isValid(elem) &&
                TP.boot.$isValid(elem.contentWindow)) {
                return elem.contentWindow;
            }

            return;

        case 'uicanvas':
        case 'UICANVAS':

            if (typeof(TP.sys.getUICanvas) === 'function') {
                //  This call will recurse back into this method, but with
                //  the real window name.
                return TP.sys.getUICanvas(true);
            }

            return;

        case 'parent':

            return parent;

        case 'opener':

            return cWin.opener;

        case 'self':
        case 'window':

            return cWin;

        default:

            break;
    }

    //  not a string? might be a window already
    if (typeof(anID) !== 'string') {
        if (TP.boot.$isWindow(anID)) {
            return anID;
        }

        return;
    }

    //  These slots are set when TP.core.Window objects are created.

    //  second common case is window_N based on new window creation
    if (TP.SCREEN_PREFIX_REGEX.test(anID) === true) {
        if (TP.boot.$isWindow(win = TP.global[top.name + '.UIROOT.' + anID])) {
            return win;
        }
    }

    //  another common case is window_N based on new window creation
    if (TP.WINDOW_PREFIX_REGEX.test(anID) === true) {
        if (TP.boot.$isWindow(win = TP.global[anID])) {
            return win;
        }
    }

    //  if we got a TIBET URI then we've got to split out the canvas ID.
    //  this also isn't recommended practice but the test is quick enough
    if (anID.indexOf('tibet:') === 0) {
        //  have to split into parts to get canvas ID. if we don't match its
        //  actually an invalid ID. if we match but it's empty then its
        //  shorthand for the current uicanvas
        if (TP.boot.$isValid(parts = anID.match(TP.TIBET_URI_SPLITTER))) {
            //  whole, jid, resource, canvas, path, pointer

            //  if there is a 'path', then this is not just a TIBET URI to a
            //  Window, so we exit here, returning nothing
            if (parts[4] != null && parts[4] !== '') {
                return;
            }

            id = parts[3] || 'uicanvas';

            if (id.toLowerCase() === 'uicanvas') {
                if (typeof(TP.sys.getUICanvas) === 'function') {
                    return TP.sys.getUICanvas();
                }
                return;
            }

            if (id.toLowerCase() === 'uiroot') {
                if (typeof(TP.sys.getUIRoot) === 'function') {
                    return TP.sys.getUIRoot();
                }

                return;
            }
        } else {
            return;
        }
    } else {
        id = anID;
    }

    //  normalize paths to dot-separated syntax
    id = id.replace(/\//g, '.');

    //  watch out for certain pathologies
    if (TP.BAD_WINDOW_ID_REGEX.test(id)) {
        return;
    }

    //  if it's not a window path (a.b.c format) check the obvious places
    if (/\./.test(id) !== true) {
        if (cWin.name === id) {
            return cWin;
        }

        if (cWin.parent.name === id) {
            return cWin.parent;
        }

        if (top.name === id) {
            return top;
        }

        if (TP.boot.$isWindow(win = cWin[id])) {
            return win;
        }

        if (TP.boot.$isWindow(win = cWin.parent[id])) {
            return win;
        }

        if (TP.boot.$isWindow(win = cWin.top[id])) {
            return win;
        }

        if (cWin.opener != null) {
            if (cWin.opener.name === id) {
                return cWin.opener;
            }

            if (TP.boot.$isWindow(win = cWin.opener[id])) {
                return win;
            }
        }

        //  no '.' and we've looked "everywhere" unless it's an IFRAME
        //  window...
        if ((win = cWin.document.getElementById(id)) != null) {
            try {
                return win.contentWindow;
            } catch (e) {
            }
        }

        return;
    }

    //  try iterating, stopping at each level to check for a window IFRAME
    arr = id.split('.');
    len = arr.length;
    current = cWin;

    for (i = 0; i < len; i++) {
        //  see if its a slot on the window object itself. If not, use a
        //  recursive lookup.
        next = current[arr[i]];
        if (!TP.boot.$isWindow(next)) {
            next = TP.sys.getWindowById(arr[i], current);

            if (next) {
                current = next;
                if (!TP.boot.$isWindow(current)) {
                    break;
                }
            } else {
                current = null;
                break;
            }
        } else {
            current = next;
        }
    }

    if (TP.boot.$isWindow(current)) {
        return current;
    }

    //  try openers. this is largely here to help new windows find TIBET
    opener = cWin.opener;
    if (opener != null &&
        opener !== cWin &&
        typeof(TP.windowIsInstrumented) === 'function') {
        if (!TP.windowIsInstrumented(opener)) {
            opener.TP.sys = TP.sys;
        }

        return opener.TP.sys.getWindowById(anID);
    }

    return;
};

//  ----------------------------------------------------------------------------

TP.windowIsInstrumented = function(nativeWindow) {

    /**
     * @name windowIsInstrumented
     * @summary Returns true if the window provided has been instrumented with
     *     TIBET base window functionality. If no window is provided this method
     *     returns true since the receiving window is clearly instrumented :).
     * @param {Window} nativeWindow A window to test. If none is provided the
     *     receiver is tested.
     * @return {Boolean} Whether or not the window is instrumented.
     */

    //  if no window is passed in treat it like a query for local window
    if (nativeWindow == null) {
        return window.$$instrumented === true;
    }

    //  check out the window...might not be a window ;)
    if (typeof(nativeWindow.location) === 'undefined') {
        return false;
    }

    if (nativeWindow.$$instrumented === true) {
        return true;
    }

    return false;
};

//  ----------------------------------------------------------------------------
//  DHTML PRIMITIVES
//  ----------------------------------------------------------------------------

/*
The simple DHTML primitives needed to manage startup processes like showing
a simple progress bar or displaying a console-style output log.

NOTE that these are trivial and not likely to work in all circumstances, but
then again they're only intended to get us through the initial boot
sequence.  After that the versions in the kernel take over.
*/

//  ----------------------------------------------------------------------------

TP.boot.$elementAddClass = function(anElement, aClassname) {

    /**
     * @name $elementAddClass
     * @summary Adds a CSS class name to the element if it is not already
     *     present.
     * @param {Element} anElement The element to add the CSS class to.
     * @param {String} aClassname The CSS class name to add.
     * @raises InvalidElement,InvalidString
     * @return {Element} The element the supplied class was added to.
     * @todo
     */

    var cls;

    if (TP.boot.$notValid(anElement)) {
        return;
    }

    if (TP.boot.$elementHasClass(anElement, aClassname)) {
        return anElement;
    }

    cls = anElement.className;
    if (!cls) {
        anElement.className = aClassname;
    } else {
        anElement.className = cls + ' ' + aClassname;
    }

    return anElement;
};

//  ----------------------------------------------------------------------------

TP.boot.$elementHasClass = function(anElement, aClassname) {

    var re,
        cls;

    if (TP.boot.$notValid(anElement)) {
        return;
    }

    //  NOTE: make sure that the class name is either first, last, or
    //  surrounded by whitespace
    re = new RegExp('(^|\\s)' + aClassname + '(\\s|$)');

    cls = anElement.className;

    return re.test(cls);
};

//  ----------------------------------------------------------------------------

TP.boot.$elementReplaceClass = function(anElement, aPattern, aClassname) {

    /**
     * @name $elementReplaceClass
     * @param {RegExp|String} aPattern A string (used as a literal pattern) or a
     *     regular expression to match against existing class names.
     */

    var re,
        cls,
        parts;

    if (TP.boot.$notValid(anElement)) {
        return;
    }

    if (typeof aPattern === 'string') {
        re = new RegExp('(^|\\s)' + aPattern + '(\\s|$)');
    } else {
        re = aPattern;
    }

    cls = anElement.className;

    // If pattern doesn't match this is a simple add operation.
    if (!re.test(cls)) {
        return TP.boot.$elementAddClass(anElement, aClassname);
    }

    // Find/remove the matching classname chunk(s)
    parts = cls.split(' ');
    parts = parts.filter(function(part) {
        return !re.test(part) && part !== aClassname;
    });
    parts.push(aClassname);
    anElement.className = parts.join(' ');

    return anElement;
};

//  ----------------------------------------------------------------------------

TP.boot.$elementSetInnerContent = function(anElement, theContent) {

    /**
     * @name $elementSetInnerContent
     * @summary Sets the 'inner content' of anElement.
     * @description This method sets the 'inner content' of anElement to
     *     theContent which means that just the contents of the element, not
     *     including its start and end tags, will be replaced with theContent.
     * @param {HTMLElement} anElement The element to set the 'inner content' of.
     * @param {String} theContent The content to replace the 'inner content' of
     *     anElement with.
     * @return {null}
     * @todo
     */

    if (anElement && anElement.ownerDocument) {
        anElement.innerHTML = theContent;
    }

    return;
};

//  ----------------------------------------------------------------------------
//  DISPLAY HELPERS
//  ----------------------------------------------------------------------------

TP.boot.$dump = function(anObject, aSeparator, htmlEscape, depth) {

    /**
     * @name anObject
     * @summary Dumps an object's key/value pairs in sorted order. This is used
     *     to produce output for configuration and environment data. By sorting
     *     the keys we make it a little easier to find specific properties
     *     quickly.
     * @param {Object} anObject The object to dump.
     * @param {String} aSeparator An optional separator string used to separate
     *     entries. Default is '\n'.
     * @return {String} A formatted object string.
     * @todo
     */

    var str,
        i,
        arr,
        len,
        keys,
        key,
        sep,
        val;

    // Don't dump primitives, only Object and Array-ish things.
    switch (typeof anObject) {
        case 'string':

            // Bit of a hack here, but we don't really want rafts of html
            // showing up in the log and certain types of request failures etc.
            // are full of 'target: ' where the target was a document.
            if (/<!DOCTYPE html><html/.test(anObject)) {
                str = anObject.replace(/\n/g, '__NEWLINE__');
                str = str.replace(/<!DOCTYPE html><html(.*)?<\/html>/g,
                                  '<html>...</html>');
                str = str.replace(/'__NEWLINE__'/g, '\n');
            } else {
                str = anObject;
            }

            if (htmlEscape === true) {
                return TP.boot.$htmlEscape(str);
            } else {
                return str;
            }
            break;
        case 'function':
        case 'number':
        case 'boolean':
            return anObject;
        default:
            if (anObject === null) {
                return 'null';
            }
            if (anObject === undefined) {
                return 'undefined';
            }
            if (anObject instanceof Date) {
                return anObject.toISOString();
            }
            if (anObject instanceof RegExp) {
                return anObject.toString();
            }
            if (TP.boot.$isValid(anObject.nodeType)) {
                return TP.boot.$htmlEscape(TP.boot.$nodeAsString(anObject));
            }
            break;
    }

    // For now we don't drill deeper than one level. Not all objects will
    // respond well to a simple string + obj form so call the root toString if
    // there's an exception ala 'Cannot convert object to primitive value'.
    if (depth && depth > 0) {
        try {
            return '' + anObject;
        } catch (e) {
            return Object.prototype.toString.call(anObject);
        }
    }

    sep = ' => ';
    if (htmlEscape === true) {
        sep = TP.boot.$htmlEscape(sep);
    }
    arr = [];

    if (anObject instanceof Array) {

        // Could use map() here but this works consistently.
        len = anObject.length;
        for (i = 0; i < len; i++) {
            arr.push(TP.boot.$dump(anObject[i], aSeparator, htmlEscape, 1));
        }

    } else {
        try {
            keys = Object.keys(anObject);
        } catch (e) {
            // Some objects don't even like Object.keys....sigh...
            return Object.prototype.toString.call(anObject);
        }
        keys.sort();

        len = keys.length;
        for (i = 0; i < len; i++) {
            key = keys[i];
            val = anObject[key];

            str = TP.boot.$dump(val, aSeparator, htmlEscape, 1);
            arr.push(key + sep + str);
        }
    }

    return arr.join(aSeparator || '\n');
};

//  ----------------------------------------------------------------------------

TP.boot.$htmlEscape = function(aString) {

    var result;

    result = aString.replace(/[<>'"]/g, function(aChar) {
        switch (aChar) {
            case    '<':
                return '&lt;';
            case    '>':
                return '&gt;';
            case    '\'':
                return '&apos;';
            case    '"':
                return '&quot;';
            default:
                break;
        }
    });

    //  Replace all '&' that are *not* part of an entity with '&amp;'
    result = result.replace(/&(?!([a-zA-Z]+|#[0-9]+);)/g, '&amp;');

    return result;
};

//  ----------------------------------------------------------------------------

TP.boot.$join = function(varargs) {

    /**
     * @name $join
     * @summary Returns a string built from joining the various arguments to
     *     the function.
     * @param {Object} varargs The first of a set of variable arguments.
     * @return {String}
     */

    //  NB: In modern browsers, going back to the old '+=' method of String
    //  concatenation seems to yield about a 40% performance gain.
    var str,
        len,
        i;

    str = '';

    len = arguments.length;
    for (i = 0; i < len; i++) {
        if (TP.boot.$isValid(arguments[i])) {
            str += arguments[i];
        }
    }

    return str;
};

//  ----------------------------------------------------------------------------

TP.boot.$lpad = function(obj, length, padChar) {

    /**
     * @name $lpad
     * @summary Returns a new String representing the obj with a leading number
     *     of padChar characters according to the supplied length.
     * @param {Object} obj The object to format with leading characters.
     * @param {Number} length The number of characters to pad the String
     *     representation with.
     * @param {String} padChar The pad character to use to pad the String
     *     representation.
     * @return {String}
     * @todo
     */

    var str,
        pad;

    str = '' + obj;
    pad = padChar || ' ';

    while (str.length < length) {
        str = pad + str;
    }

    return str;
};

//  ----------------------------------------------------------------------------

TP.boot.$quoted = function(aString) {
    return '\'' + aString.replace(/'/g, '\\\'') + '\'';
};

//  ----------------------------------------------------------------------------

TP.boot.$rpad = function(obj, length, padChar) {

    /**
     * @name $rpad
     * @summary Returns a new String representing the obj with a trailing number
     *     of padChar characters according to the supplied length.
     * @param {Object} obj The object to format with trailing characters.
     * @param {Number} length The number of characters to pad the String
     *     representation with.
     * @param {String} padChar The pad character to use to pad the String
     *     representation.
     * @return {String}
     * @todo
     */

    var str,
        pad;

    str = '' + obj;
    pad = padChar || ' ';

    while (str.length < length) {
        str = str + pad;
    }

    return str;
};

//  ----------------------------------------------------------------------------

TP.boot.$str = function(anObject, aSeparator) {

    /**
     * @name $str
     * @summary Returns a string representation of the object provided. This
     *     simple version is a basic wrapper for toString. The TIBET kernel
     *     provides a method which can produce more specialized responses to
     *     this request.
     * @param {Object} anObject The object whose string value is being
     *     requested.
     * @param {String} aSeparator The string to use as a record separator.
     * @return {String} A string of some form, even when empty.
     */

    if (anObject !== null) {
        if (anObject === undefined) {
            return 'undefined';
        }

        try {
            //  try to get decent string from Error objects
            if (typeof(anObject.message) === 'string') {
                return anObject.message;
            } else {
                return TP.boot.$dump(anObject, aSeparator || ', ');
            }
        } catch (e) {
            return '';
        }
    }

    return 'null';
};

//  ----------------------------------------------------------------------------

TP.boot.$trim = function(aString) {

    /**
     * @name $trim
     * @summary Returns a new String representing the parameter with any
     *     leading and trailing whitespace removed.
     * @param {String} aString The string to trim.
     * @return {String}
     */

    var str,
        ws,
        i;

    if (aString == null) {
        return;
    }

    str = aString.toString();
    str = str.replace(/^\s\s*/, '');

    ws = /\s/;
    i = str.length;

    while (ws.test(str.charAt(--i))) {
    }

    return str.slice(0, i + 1);
};

//  ----------------------------------------------------------------------------
//  SIMPLE LOG MESSAGE ANNOTATIONS
//  ----------------------------------------------------------------------------

TP.boot.Annotation = function(anObject, aMessage) {

    //  can't be null or undefined, or have empty annotation text.
    if (anObject == null || aMessage == null || aMessage === '') {
        throw new Error('InvalidParameter');
    }

    this.object = anObject;
    this.message = aMessage;
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.as = function(typeOrFormat, formatParams) {

    /**
     * @name as
     * @summary
     * @return {String}
     * @todo
     */

    var type,
        args;

    if (TP.boot.$notValid(type = TP.sys.require(typeOrFormat))) {
        return typeOrFormat.transform(this, formatParams);
    }

    //  if we got here we're either talking to a type that can't tell us
    //  what its name is (not good) or the receiver doesn't implement a
    //  decent as() variant for that type. In either case however all we can
    //  do is hope the type implements from() and we'll try that route.
    if (TP.canInvoke(type, 'from')) {
        switch (arguments.length) {
            case 1:
                return type.from(this);
            case 2:
                return type.from(this, formatParams);
            default:
                //  have to build up an argument array that includes the
                //  receiver as the first argument rather than the type
                args = TP.args(arguments);
                args.atPut(0, this);
                return type.from.apply(type, args);
        }
    }
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.getTypeName = function() {

    /**
     * @name getTypeName
     * @summary
     * @return {String}
     * @todo
     */

    return 'TP.boot.Annotation';
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.getSupertypes = function() {

    /**
     * @name getSupertypes
     * @summary
     * @return {String}
     * @todo
     */

    return [Object];
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.asDumpString = function() {

    /**
     * @name asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @return {String} A new String containing the dump string of the receiver.
     */

    return TP.boot.$join('TP.boot.Annotation :: ',
                            TP.boot.$str(this.object), ',',
                            TP.boot.$str(this.message));
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.asHTMLString = function() {

    /**
     * @name asHTMLString
     * @summary Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in HTML string format.
     */

    return TP.boot.$join(
            '<span class="TP_boot_Annotation">',
            '<span data-name="object">', TP.htmlstr(this.object), '<\/span>',
            '<span data-name="message">', TP.htmlstr(this.message), '<\/span>',
            '<\/span>');
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.asJSONSource = function() {

    /**
     * @name asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    return '{"type":"TP.boot.Annotation",' +
            '"data":{"object":' + TP.boot.$str(this.object).quoted('"') + ',' +
            '"message":' + TP.boot.$str(this.message).quoted('"') + '}}';
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.asPrettyString = function() {

    /**
     * @name asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    return '<dl class="pretty TP_boot_Annotation">' +
                '<dt>Type name<\/dt>' +
                '<dd class="pretty typename">' +
                    'TP.boot.Annotation' +
                '<\/dd>' +
                '<dt class="pretty key">object<\/dt>' +
                '<dd class="pretty value">' +
                    TP.boot.$str(this.object) +
                '<\/dd>' +
                '<dt class="pretty key">message<\/dt>' +
                '<dd class="pretty value">' +
                    TP.boot.$str(this.message) +
                '<\/dd>' +
                '<\/dl>';
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.asSource = function() {

    /**
     * @name asSource
     * @summary Returns the receiver as a TIBET source code string.
     * @return {String} An appropriate form for recreating the receiver.
     */

    return TP.boot.$join('TP.boot.$annotate(\'',
                            TP.boot.$str(this.object), '\',\'',
                            TP.boot.$str(this.message), '\')');
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.asXMLString = function() {

    /**
     * @name asXMLString
     * @summary Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     */

    return TP.boot.$join('<instance type="TP.boot.Annotation"',
                            ' object="', TP.boot.$str(this.object), '"',
                            ' message="', TP.boot.$str(this.message), '"\/>');
};

//  ----------------------------------------------------------------------------

TP.boot.Annotation.prototype.toString = function() {

    /**
     * @name toString
     * @summary Returns a string representation of the receiver.
     * @return {String}
     */

    return TP.boot.$join(TP.boot.$str(this.message),
                            ' [', TP.boot.$str(this.object), ']');
};

//  ----------------------------------------------------------------------------

TP.boot.$annotate = function(anObject, aMessage) {

    /**
     * @name $annotate
     * @summary Creates an annotated object, essentially a simple pairing
     *     between an object and an associated label or message. Often used for
     *     logging Node content without having to convert the Node into a string
     *     to bind it to an associated message.
     * @param {Object} anObject The object to annotate.
     * @param {String} aNote The note to annotate the object with.
     * @return {Object} An object whose keys include 'object' and 'message'
     *     such that a standard query can find those values.
     * @todo
     */

    if (anObject instanceof TP.boot.Annotation) {
        return anObject;
    }

    if (TP.boot.$notValid(anObject)) {
        TP.boot.$stderr('InvalidAnnotation: no object to annotate.');
        return;
    }

    return new TP.boot.Annotation(anObject, aMessage || anObject.message || '');
};

//  ----------------------------------------------------------------------------

TP.boot.$ec = function(anError, aMessage) {

    /**
     * @name $ec
     * @summary TP.core.Exception.create shortcut, later replaced by a
     *     full-featured version that ensures the resulting object can take
     *     advantage of TP.core.Exception's implementation of asString.
     * @param {Error} anError A native error object.
     * @param {String} aMessage A related string, usually a context-specific
     *     explanation of the native error.
     * @return {Object} An object whose keys include 'object' and 'message'
     *     such that a standard query can find those values.
     * @todo
     */

    return TP.boot.$annotate(anError, aMessage);
};

//  ----------------------------------------------------------------------------
//  Log Reporters
//  ----------------------------------------------------------------------------

/*
 * Simple reporter functions which handle the details of output to different
 * targets. The two we need for certain are one for the console object found in
 * both browsers and Node.js and one for the TIBET boot UI if present.
 */

//  ----------------------------------------------------------------------------

TP.boot.$flushLog = function(force) {

    TP.boot.$flushUIBuffer(force);

    if (force === true) {
        TP.boot.$scrollUIBuffer();
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$scrollLog = function() {
    TP.boot.$scrollUIBuffer();
};

//  ----------------------------------------------------------------------------

TP.boot.$clearLog = function() {
    TP.boot.$clearUIBuffer();
};

//  ----------------------------------------------------------------------------

TP.boot.$$logReporter = function(entry, context, separator, escape) {
    var level,
        sep,
        esc,
        time,
        obj,
        ctx,
        name,
        delta,
        str,
        iserr,
        err,
        msg,
        dlimit;

    if (!entry) {
        return;
    }

    level = entry[TP.LOG_ENTRY_LEVEL];

    // Track the highest non-system logging level we've seen.
    if (level > TP.boot.$$logpeak && level < TP.SYSTEM) {
        TP.boot.$$logpeak = level;
    }

    if (!TP.boot.Log.canLogLevel(level)) {
        return;
    }

    time = entry[TP.LOG_ENTRY_DATE];
    obj = entry[TP.LOG_ENTRY_PAYLOAD];
    ctx = entry[TP.LOG_ENTRY_CONTEXT];

    esc = TP.boot.$isValid(escape) ? escape : true;
    sep = TP.boot.$isValid(separator) ? separator : '\n';

    // If the object is an annotation we've got to process it. Note that we
    // double the separator around object dumps to help offset key/value dump
    // data from the surrounding log headings. This helps dumped data stand out.
    if (obj instanceof TP.boot.Annotation) {
        str = sep + TP.boot.$dump(obj.message, sep, esc) +
            sep + sep + TP.boot.$dump(obj.object, sep, esc) + sep;
    } else if (typeof obj !== 'string') {
        if (TP.sys.hasKernel()) {
            if (TP.isKindOf(obj, TP.sig.Exception)) {
                str = TP.dump(obj);
                err = obj.getError();
                if (err && err.stack) {
                    str += '\n' + err.stack;
                }
            } else {
                str = TP.dump(obj);
            }
        }
        str = str || sep + sep + TP.boot.$dump(obj, sep, esc) + sep;
    } else {
        str = esc ? TP.boot.$htmlEscape(obj) : obj;
    }

    iserr = TP.boot.Log.isErrorLevel(level);
    if (iserr && ctx && ctx.callee) {
        if (typeof ctx.callee.getName === 'function') {
            str += ' @ ' + ctx.callee.getName();
        } else if (TP.boot.$isValid(ctx.callee.displayName)) {
            str += ' @ ' + ctx.callee.displayName;
        }
    }

    // Output format is;
    //
    //      time   delta    log level  message
    //
    //      000000 [+000] - level_name str
    //

    time = ('' + time.getTime()).slice(-6);
    delta = '';

    name = TP.boot.Log.getStringForLevel(level) || '';
    name = name.toLowerCase();

    if (TP.boot.$$loglevel === TP.TRACE) {
        delta = entry[TP.LOG_ENTRY_DELTA];
        dlimit = TP.sys.cfg('boot.delta_threshold');
        if (delta > dlimit) {
            TP.boot.$$bottlenecks += 1;
            delta = TP.boot.$style('[+' + delta + '] ', 'slow');
        } else {
            delta = TP.boot.$style('[+' + delta + '] ', 'delta');
        }
    }

    msg = TP.boot.$style(time, 'time') + ' ' + delta + '- ' +
        TP.boot.$style(name + ' ' + str, name);

    return msg;
};

//  ----------------------------------------------------------------------------

TP.boot.$consoleReporter = function(entry, context) {

    var msg,
        level;

    // Ignore attempts to log the entry to the console more than once.
    if (entry && entry.usedConsole) {
        return;
    }

    TP.sys.setcfg('log.colormode', 'console');
    msg = TP.boot.$$logReporter(entry, context, '\n', false);
    if (TP.boot.$notValid(msg)) {
        return;
    }

    level = entry[TP.LOG_ENTRY_LEVEL];

    switch (level) {
    case TP.TRACE:
        top.console.log(msg);
        break;
    case TP.INFO:
        top.console.log(msg);
        break;
    case TP.WARN:
        top.console.warn(msg);
        break;
    case TP.ERROR:
        top.console.error(msg);
        break;
    case TP.SEVERE:
        top.console.error(msg);
        break;
    case TP.FATAL:
        top.console.error(msg);
        break;
    case TP.SYSTEM:
        top.console.log(msg);
        break;
    default:
        top.console.log(msg);
        break;
    }

    entry.usedConsole = true;
};

//  ----------------------------------------------------------------------------

TP.boot.$bootuiReporter = function(entry, context) {

    var elem,
        msg,
        css,
        level;

    // If we've never output we have to "catch up" as it were and process each
    // of any queued entries to this point.
    if (!TP.boot.$consoleConfigured) {

        elem = TP.boot.$getBootLogElement();
        if (!TP.boot.$isElement(elem)) {
            return;
        }

        //  clear existing content
        elem.innerHTML = '';
        TP.boot.$consoleConfigured = true;
    }

    TP.sys.setcfg('log.colormode', 'browser');
    msg = TP.boot.$$logReporter(entry, context, '<br/>', true);
    if (TP.boot.$notValid(msg)) {
        return;
    }

    css = 'log-' + TP.boot.Log.getStringForLevel(TP.boot.$$logpeak).toLowerCase();
    if (TP.boot.$$logcss !== css) {
        TP.boot.$$logcss = css;
        TP.boot.$elementReplaceClass(TP.boot.$getProgressBarElement(),
                                     /log-/, TP.boot.$$logcss);
    }

    level = entry[TP.LOG_ENTRY_LEVEL];

    switch (level) {
    case TP.TRACE:
        TP.boot.$displayMessage(msg);
        break;
    case TP.INFO:
        TP.boot.$displayMessage(msg);
        break;
    case TP.WARN:
        TP.boot.$displayMessage(msg);
        break;
    case TP.ERROR:
        TP.boot.$displayMessage(msg, true);
        break;
    case TP.SEVERE:
        TP.boot.$displayMessage(msg, true);
        break;
    case TP.FATAL:
        TP.boot.$displayMessage(msg, true);
        break;
    case TP.SYSTEM:
        TP.boot.$displayMessage(msg, true);
        break;
    default:
        TP.boot.$displayMessage(msg);
        break;
    }

    // Logging is usually the last step in a boot stoppage. If that's happening
    // we want to ensure we set any UI to 'done' which should help ensure that
    // it has scrollbars etc.
    try {
        if (TP.boot.shouldStop()) {
            elem = TP.boot.$getBootLogElement();
            if (TP.boot.$isElement(elem)) {
                TP.boot.$elementAddClass(elem.parentElement, 'done');
            }
        }
    } catch (e) {
        // this one we'll ignore.
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$phantomReporter = function(entry, context) {

    var msg,
        level;

    // Ignore attempts to log the entry to the console more than once.
    if (entry && entry.usedConsole) {
        return;
    }

    TP.sys.setcfg('log.colormode', 'console');
    msg = TP.boot.$$logReporter(entry, context, '\n', false);
    if (TP.boot.$notValid(msg)) {
        return;
    }

    level = entry[TP.LOG_ENTRY_LEVEL];

    switch (level) {
    case TP.TRACE:
        top.console.log(msg);
        break;
    case TP.INFO:
        top.console.log(msg);
        break;
    case TP.WARN:
        top.console.warn(msg);
        break;
    case TP.ERROR:
        top.console.error(msg);
        break;
    case TP.SEVERE:
        top.console.error(msg);
        break;
    case TP.FATAL:
        top.console.error(msg);
        break;
    case TP.SYSTEM:
        // NOTE: we turn off normal system messaging to quiet it down.
        //top.console.log(msg);
        break;
    default:
        top.console.log(msg);
        break;
    }

    entry.usedConsole = true;
};

//  ----------------------------------------------------------------------------

TP.boot.$silentReporter = function() {
    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$style = function(aString, aStyle) {

    var mode,
        styles,
        parts,
        color,
        codes,
        result;

    mode = TP.boot.$$colormode = (TP.boot.$$colormode ||
        TP.sys.cfg('log.colormode'));
    styles = TP.boot.$$styles[mode];

    try {
        if (TP.boot.$$PROP_KEY_REGEX.test(aStyle)) {
            result = '';

            parts = aStyle.split('.');
            parts.forEach(function(style) {
                color = TP.boot.$$theme[style];

                // Do we have a mapping for this color in our theme?
                if (TP.boot.$notValid(color)) {
                    return;
                }

                // If we had a color mapping in the theme, find the codes.
                codes = styles[color];
                if (TP.boot.$notValid(codes)) {
                    return;
                }

                result = codes[0] + (result || aString) + codes[1];
            });
        } else {

            // Do we have a mapping for this color in our theme?
            color = TP.boot.$$theme[aStyle];
            if (TP.boot.$notValid(color)) {
                return aString;
            }

            // If we had a color mapping in the theme, find the codes.
            codes = styles[color];
            if (TP.boot.$notValid(codes)) {
                return aString;
            }

            result = codes[0] + aString + codes[1];
        }
    } catch (e) {
        return aString;
    }

    return result;
};

//  ----------------------------------------------------------------------------
//  PRIMITIVE LOG DATA STRUCTURE
//  ----------------------------------------------------------------------------

/*
The various logging operations in TIBET make use of a common low-level type
that handles log entry management. We build that primitive type here so it
can be used to manage the boot log along with the rest of TIBET's logs.
*/

//  ----------------------------------------------------------------------------
//  Constructor
//  ----------------------------------------------------------------------------

TP.boot.Log = function() {

    /**
     * @name TP.boot.Log
     * @summary Contructor for a primitive log data structure. This construct
     *     is used by all TIBET logs although it is wrapped by higher-level
     *     objects once the kernel has loaded.
     * @return {Log} A new instance.
     */

    //  the array of all messages sent to the log
    this.messages = [];

    //  the current index representing which messages have been reported.
    this.index = 0;

    return this;
};

//  ----------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.boot.Log.canLogLevel = function(aLevel) {

    /**
     * @name canLogLevel
     * @synopsis Returns true if logging is set at or above aLevel.
     * @param {Constant} aLevel A TP error level constant such as TP.INFO or
     *     TP.TRACE. The default is TP.WARN.
     * @returns {Boolean} True if logging is active for the given level.
     */

    var level;

    level  = TP.boot.$isValid(aLevel) ? aLevel : TP.WARN;

    return TP.boot.$$loglevel <= level;
};

//  ----------------------------------------------------------------------------

TP.boot.Log.getStringForLevel = function(aLogLevel) {

    /**
     * @name getStringForLevel
     * @summary Returns the string value for the logging level provided.
     * @param {Number} aLogLevel The level to check, defaults to the current
     *     level if no level is passed.
     * @return {String} The String representation of the log level.
     * @todo
     */

    switch (aLogLevel) {
        case TP.TRACE:
            return 'TRACE';
        case TP.INFO:
            return 'INFO';
        case TP.WARN:
            return 'WARN';
        case TP.ERROR:
            return 'ERROR';
        case TP.SEVERE:
            return 'SEVERE';
        case TP.FATAL:
            return 'FATAL';
        case TP.SYSTEM:
            return 'SYSTEM';
        default:
            // Cap others at SYSTEM
            return 'SYSTEM';
    }
};

//  ------------------------------------------------------------------------

TP.boot.Log.isErrorLevel = function(aLevel) {

    /**
     * @name isErrorLevel
     * @synopsis Returns true if the level provided represents a form of error.
     * @param {Constant} aLevel A TP error level constant such as TP.SEVERE.
     * @returns {Boolean} True if the given level is considered an error.
     */

    if (TP.boot.$notValid(aLevel)) {
        return false;
    }

    return aLevel >= TP.ERROR && aLevel < TP.SYSTEM;
};

//  ------------------------------------------------------------------------

TP.boot.Log.isFatalCondition = function(aLevel, aStage) {

    /**
     * @name isFatalCondition
     * @synopsis Returns true if the level and stage combine to make the
     *     combination represent a fatal boot error.
     * @param {Constant} aLevel A TP error level constant such as TP.SEVERE.
     * @param {Constant} aStage A TP boot stage such as 'rendering'. Defaults to
     *     the current stage.
     * @returns {Boolean} True if the given pairing is considered fatal.
     */

    var info;

    // Non-errors are never fatal.
    if (!TP.boot.Log.isErrorLevel(aLevel)) {
        return false;
    }

    if (aLevel === TP.FATAL) {
        TP.boot.$$stop = 'fatal error detected.';
        return true;
    }

    if (TP.boot.$notValid(aLevel)) {
        return false;
    }

    // Too many small things can add up to be fatal.
    if (TP.boot.$$errors > TP.sys.cfg('boot.error_max')) {
        TP.boot.$$stop = 'boot.error_max exceeded.';
        return true;
    }

    // Some stages mark any error as being fatal (rendering for example).
    info = TP.boot.$getStageInfo(aStage);
    if (TP.boot.$isValid(info) && info.fatal) {
        if (TP.sys.cfg('boot.fatalistic')) {
            TP.boot.$$stop = 'error in fatalistic stage.';
            return true;
        }
    }

    return false;
};

//  ----------------------------------------------------------------------------
//  Instance Methods
//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.asDumpString = function() {

    /**
     * @name asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @return {String} A new String containing the dump string of the receiver.
     */

    return TP.boot.$join('TP.boot.Log :: ', this.asString());
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.asHTMLString = function() {

    /**
     * @name asHTMLString
     * @summary Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in HTML string format.
     */

    return TP.boot.$join(
        '<span class="TP_boot_Log">',
            '<span data-name="messages">', TP.htmlstr(this.messages),
            '<\/span>',
        '<\/span>');
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.asJSONSource = function() {

    /**
     * @name asJSONSource
     * @summary Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    return '{"type":"TP.boot.Log",' +
            '"data":{"messages":' +
                TP.boot.$str(this.messages).quoted('"') +
            '}}';
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.asPrettyString = function() {

    /**
     * @name asPrettyString
     * @summary Returns the receiver as a string suitable for use in 'pretty
     *     print' output.
     * @returns {String} A new String containing the 'pretty print' string of
     *     the receiver.
     */

    return '<dl class="pretty TP_boot_Log">' +
                '<dt>Type name<\/dt>' +
                '<dd class="pretty typename">' +
                    'TP.boot.Log' +
                '<\/dd>' +
                '<dt class="pretty key">messages<\/dt>' +
                '<dd class="pretty value">' +
                    TP.boot.$str(this.messages) +
                '<\/dd>' +
                '<\/dl>';
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.asXMLString = function() {

    /**
     * @name asXMLString
     * @summary Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     */

    return TP.boot.$join(
                '<instance type="TP.boot.Log">',
                '<messages>', TP.xmlstr(this.messages), '<\/messages>',
                '<\/instance>');
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.flush = function() {

    while (this.index < this.messages.length) {
        this.report(this.messages[this.index]);
    }
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.getEntries = function() {

    /**
     * @name getEntries
     * @summary Returns an array containing individual log entries. The array
     *     should be considered read-only.
     * @return {Array}
     * @todo
     */

    return this.messages;
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.getSize = function() {

    /**
     * @name getSize
     * @summary Returns the size (in number of entries) of the log.
     * @return {Number} The number of log entries.
     */

    return this.messages.length;
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.getTypeName = function() {

    /**
     * @name getTypeName
     * @summary
     * @return {String}
     * @todo
     */

    return 'TP.boot.Log';
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.getSupertypes = function() {

    /**
     * @name getSupertypes
     * @summary
     * @return {String}
     * @todo
     */

    return [Object];
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.last = function() {

    /**
     * @name last
     * @summary Returns the last entry made in the log.
     * @return {Array} A log entry.
     * @todo
     */

    return this.messages[this.messages.length - 1];
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.log = function(anObject, aLogName, aLogLevel,
                                        aContext)
{
    /**
     * @name log
     * @summary Creates a new log entry. The entry will include a timestamp as
     *     well as the log name, log level, and object given. The object isn't
     *     processed in any way, it is simply added to the log entry. It's up to
     *     consumers of the log to format the data in a log entry to meet their
     *     requirements.
     * @description The object being logged isn't required to meet any
     *     particular format requirements, however there are a couple of
     *     convenience functions in TIBET which make it easy to deal with common
     *     cases. For example, the TP.boot.$ec() function
     *     (TP.core.Exception.create() shortcut) is a useful way to combine an
     *     error message with an error object for later logging. A simpler
     *     TP.boot.$ec() which produces an ordered pair is used prior to the
     *     loading of TP.core.Exception to avoid bootstrapping problems.
     * @param {Object} anObject The object to log. Typically a string provided
     *     by the caller. NOTE that the object is _not_ processed by the log
     *     capturing calls, how it is displayed is a function of the logic you
     *     use to display the log.
     * @param {String} aLogName The log name (TP.IO_LOG, etc.) which qualifies
     *     the entry within the overall log. Default value is TP.ACTIVITY_LOG.
     * @param {Number} aLogLevel A TIBET log level, such as TP.INFO.
     * @param {arguments} aContext An arguments object providing call stack and
     *     context information.
     * @return {Log} The receiver.
     * @todo
     */

    var entry,
        date,
        delta,
        msg;

    date = new Date();
    delta = 0;

    if (TP.boot.$$loglevel === TP.TRACE) {
        if (this.messages.length > 1) {
            delta = date.getTime() -
                this.messages[this.messages.length - 1][0].getTime();
        }
    }

    //  NOTE order here should match TP.LOG_ENTRY_* constants
    entry = [date, aLogName, aLogLevel, anObject, aContext, delta];

    this.messages.push(entry);

    if (TP.boot.Log.isErrorLevel(aLogLevel)) {
        TP.boot.$$errors += 1;
    }

    if (aLogLevel === TP.WARN) {
        TP.boot.$$warnings += 1;
    }

    // Call this first, so any reporter will be aware that the boot is about to
    // terminate.
    if (TP.boot.Log.isFatalCondition(aLogLevel)) {

        // Flush anything queued during pre-config completion.
        this.flush();

        TP.boot.$flushLog(true);

        // Default to $$stop reason, otherwise output a generic message.
        if (TP.boot.$isEmpty(TP.boot.$$stop)) {
            TP.boot.$$stop = 'unspecified fatal condition';
        }
        msg = TP.boot.$$stop;

        // Queue to allow any other pending messages to clear.
        setTimeout(function() {
            try {
            TP.boot.$setStage('stopped',
                'Boot terminated: ' + msg);
            } catch (e) {
                // Ignore if we broke that, we're stopping.
            }
        }, 0);
    }

    // Until we've fully configured we don't output (unless we hit a fatal
    // warning above. That way we know the full boot log is going to the same
    // reporter, not a header to one and the rest to another if the user has
    // overridden the default setting.

    if (TP.boot.$hasReachedStage('expanding')) {
        this.flush();
    }

    return this;
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.report = function(entry) {

    /**
     * Writes a log entry using the currently configured reporter.
     * @param {Object} entry A boot log entry object.
     */

    var limit,
        level,
        reporterName,
        reporter;

    // incrementing our index ensures we don't try to report this entry again
    // during a flush() call.
    this.index = this.index + 1;

    // Always log errors entering the boot log to the console, while respecting
    // any limit set. The default limit is TP.ERROR.
    limit = TP.sys.cfg('log.console_threshold');
    level = entry[TP.LOG_ENTRY_LEVEL];

    if (TP.boot.Log.isErrorLevel(level) && level >= limit) {
        TP.boot.$consoleReporter(entry);
    }

    if (TP.sys.hasStarted()) {
        reporterName = TP.sys.cfg('log.reporter');
    } else {
        reporterName = TP.sys.cfg('boot.reporter');
    }

    reporterName = '$' + reporterName + 'Reporter';
    reporter = TP.boot[reporterName];

    // If the reporter provided isn't real we'll again default to the console.
    if (TP.boot.$notValid(reporter)) {
        // Fake a warning and log to the native console, then output the
        // original if we haven't already.
        TP.boot.$consoleReporter(
            [new Date(), TP.BOOT_LOG, TP.WARN,
                'Logging reporter \'' + reporter + '\' not found.',
                arguments]);
        TP.boot.$consoleReporter(entry);
    }

    try {
        TP.boot[reporterName](entry);
    } catch (e) {

        // One special case here is failed file launches due to security issues.
        // The goal in that case is to let the rest of the system do this
        // without spamming the error log with all the security warnings.
        if (window.location.protocol.indexOf('file') === 0) {
            if (/[sS]ecurity|[bB]locked/.test(e.message)) {
                TP.boot.$consoleReporter(entry);
                return;
            }
        }

        // If we don't count these the cycle can continue without respecting
        // boot.error_max.
        TP.boot.$$errors += 1;

        // Can you tell we really want you to see these messages yet? ;)
        TP.boot.$consoleReporter(
            [new Date(), TP.BOOT_LOG, TP.ERROR,
                'Error in reporter \'' + reporterName + '\': ' + e.message,
                arguments]);
        TP.boot.$consoleReporter(entry);
    }
};

//  ----------------------------------------------------------------------------

TP.boot.Log.prototype.shift = function() {

    /**
     * @name shift
     * @summary Shifts the first message off the log, allowing the log to
     *     shrink in size by one entry. This method is often called to keep log
     *     sizes from exceeding configured limits.
     * @return {Array} A log entry.
     * @todo
     */

    return this.messages.shift();
};

//  ----------------------------------------------------------------------------
//  TIBET BOOT LOG
//  ----------------------------------------------------------------------------

/*
When this system is used to boot TIBET the bootlog can be acquired from
the TIBET environment in a fashion consistent with all other TIBET logs.
*/

//  ----------------------------------------------------------------------------

if (TP.sys.$bootlog == null) {
    TP.sys.$bootlog = new TP.boot.Log();
}

//  ----------------------------------------------------------------------------

TP.sys.getBootLog = function() {

    /**
     * @name getBootLog
     * @summary Returns the system boot log. This will contain any messages
     *     generated during boot processing, assuming the application was booted
     *     using the TIBET boot system.
     * @return {TP.boot.Log} The boot log object, a primitive instance
     *     supporting limited string output routines.
     */

    return TP.sys.$bootlog;
};

//  ----------------------------------------------------------------------------

TP.boot.log = function(anObject, aLogLevel, aContext) {

    /**
     * @name log
     * @summary Adds an entry in the boot log for anObject, associating it with
     *     the style provided. Note that the object logged in this fashion is
     *     just captured, not formatted. How an object appears is a function of
     *     the particular log viewing logic used to display the log.
     * @param {Object} anObject The object to log.
     * @param {Number} aLogLevel The logging level to use.
     * @param {arguments} aContext Optional arguments object to provide
     *     additional context.
     * @return {null}
     * @todo
     */

    var level;

    level = (aLogLevel == null) ? TP.INFO : aLogLevel;

    TP.sys.$bootlog.log(anObject,
                            TP.BOOT_LOG,
                            level,
                            aContext || arguments);
    return;
};

//  ----------------------------------------------------------------------------
//  UI ELEMENT ACQUISITION
//  ----------------------------------------------------------------------------

TP.boot.$consoleConfigured = false;

//  ----------------------------------------------------------------------------

TP.boot.$getBootElement = function(id, name) {

    /**
     * @name $getBootElement
     * @summary Returns the boot element referenced by the configuration
     *     parameter 'boot.{{id}}' which should be cached in TP.boot[name].
     * @return {HTMLElement} The HTML element specified.
     */

    var uiboot,
        elemId,
        elem;

    elem = TP.boot[name];
    if (TP.boot.$isValid(elem)) {
        return TP.boot[name];
    }

    uiboot = TP.sys.cfg('boot.uiboot');
    elemId = TP.sys.cfg('boot.' + id);
    elem = TP.boot.$getUIElement(uiboot, elemId);

    if (TP.boot.$notValid(elem)) {
        TP.boot[name] = TP.NOT_FOUND;
        return;
    }

    TP.boot[name] = elem;
    return TP.boot[name];
};

//  ----------------------------------------------------------------------------

TP.boot.$getBootHeadElement = function() {

    /**
     * @name $getBootHeadElement
     * @summary Returns the boot heading display element used for showing the
     *     current top-level boot message.
     * @return {HTMLElement} The HTML element specified.
     */

    return TP.boot.$getBootElement('uihead', '$$uiHead');
};

//  ----------------------------------------------------------------------------

TP.boot.$getBootImageElement = function() {

    /**
     * @name $getBootImageElement
     * @summary Returns the boot image element used to highlight current status.
     * @return {HTMLElement} The HTML element specified.
     */

    return TP.boot.$getBootElement('uiimage', '$$uiImage');
};

//  ----------------------------------------------------------------------------

TP.boot.$getBootInputElement = function() {

    /**
     * @name $getBootInputElement
     * @summary Returns the boot log element used as a display console.
     * @return {HTMLElement} The HTML element displaying boot console output.
     */

    return TP.boot.$getBootElement('uiinput', '$$uiInput');
};

//  ----------------------------------------------------------------------------

TP.boot.$getBootLogElement = function() {

    /**
     * @name $getBootLogElement
     * @summary Returns the boot log element used as a display console.
     * @return {HTMLElement} The HTML element displaying boot console output.
     */

    return TP.boot.$getBootElement('uilog', '$$uiLog');
};

//  ----------------------------------------------------------------------------

TP.boot.$getProgressBarElement = function() {

    /**
     * @name $getProgressBarElement
     * @summary Returns the progress bar element, which contains the overall
     *     prgress bar content element.
     * @return {HTMLElement} The HTML element displaying the 'progress bar'.
     */

    return TP.boot.$getBootElement('uipercent', '$$uiProgress');
};

//  ----------------------------------------------------------------------------

TP.boot.$getBootSubheadElement = function() {

    /**
     * @name $getBootSubheadElement
     * @summary Returns the boot log element used to display subheading data.
     * @return {HTMLElement} The HTML element displaying boot console output.
     */

    return TP.boot.$getBootElement('uisubhead', '$$uiSubhead');
};

//  ----------------------------------------------------------------------------

TP.boot.$getUIElement = function(varargs) {

    /**
     * Locates and returns an element based on the ID or IDs provided as
     * arguments.
     * @param {String} varargs One or more arguments containing string IDs.
     */

    // TODO: work with access paths as well.

    var ids,
        i,
        len,
        id,
        root,
        elem;

    root = document;

    // Don't assume we don't have access path components in the list of
    // arguments. Split them so we build a full-descent path.
    ids = [];
    len = arguments.length;
    for (i = 0; i < len; i++) {
        ids = ids.concat(arguments[i].split('.'));
    }

    len = ids.length;
    for (i = 0; i < len; i++) {
        id = ids[i];
        elem = root.getElementById(id);
        if (!elem) {
            return;
        }

        // If we're out of ids we're at the end, even if that's an IFRAME.
        if (i === len - 1) {
            return elem;
        }

        if (elem.contentWindow) {
            // If we're holding an IFRAME we need to drill down into that via
            // its content document.
            root = elem.contentWindow.document;
        } else {
            // Standard element. That's a problem since they don't have a
            // getElementById call...
            return;
        }
    }
};

//  ----------------------------------------------------------------------------

TP.boot.getUIBoot = function() {
    var id;

    id = TP.sys.cfg('boot.uiboot');
    return TP.boot.$getUIElement(id);
};

//  ----------------------------------------------------------------------------

TP.boot.getUIRoot = function() {
    var id;

    id = TP.sys.cfg('tibet.uiroot');
    return TP.boot.$getUIElement(id);
};

//  ----------------------------------------------------------------------------

TP.boot.$releaseUIElements = function() {

    /**
     * @name $releaseUIElements
     * @summary Releases any cached UI references created during startup.
     * @return {null}
     */

    TP.boot.$$uiHead = null;
    TP.boot.$$uiImage = null;
    TP.boot.$$uiInput = null;
    TP.boot.$$uiLog = null;
    TP.boot.$$uiPath = null;
    TP.boot.$$uiProgress = null;

    return;
};

//  ----------------------------------------------------------------------------
//  BOOT UI DISPLAY
//  ----------------------------------------------------------------------------

TP.boot.$computeLogBufferSize = function(force) {
    var level,
        size;

        size = TP.boot.$$logbufsize;
        if (force !== true && TP.boot.$isValid(size)) {
            return size;
        }

        size = parseInt(TP.sys.cfg('log.buffersize'));
        size = isNaN(size) ? 1 : size;

        level = TP.boot.$$loglevel;

        switch (level) {
            case 0:         // trace
                size = size * 2;
                break;
            case 1:         //  info
            case 2:         //  warn
            case 3:         //  error
            case 4:         //  severe
                size = Math.max(Math.floor(size / 2), size);
                break;
            case 5:         //  fatal
            case 6:         //  system
                size = 1;
                break;
            default:
                size = 1;
                break;
        }

        TP.boot.$$logbufsize = size;

        return size;
};

//  ----------------------------------------------------------------------------

TP.boot.$flushUIBuffer = function(force) {
    var elem,
        buffer,
        bufSize;

    elem = TP.boot.$getBootLogElement();
    if (!TP.boot.$isElement(elem)) {
        return;
    }

    buffer = TP.boot.$$msgBuffer;
    if (TP.boot.$notValid(buffer)) {
        TP.boot.$$msgBuffer = buffer = elem.ownerDocument.createDocumentFragment();
    }

    bufSize = TP.boot.$$logbufsize || TP.boot.$computeLogBufferSize();

    if (buffer.childNodes.length > 0 &&
        (force === true || buffer.childNodes.length === bufSize)) {
        TP.boot.$nodeAppendChild(elem, buffer);
        TP.boot.$$msgBuffer = buffer = elem.ownerDocument.createDocumentFragment();
    }

    return buffer;
};

//  ----------------------------------------------------------------------------

TP.boot.$clearUIBuffer = function() {
    var elem;

    elem = TP.boot.$getBootLogElement();
    if (!TP.boot.$isElement(elem)) {
        return;
    }

    elem.innerHTML = '';

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$scrollUIBuffer = function() {
    var elem;

    elem = TP.boot.$getBootLogElement();
    if (!TP.boot.$isElement(elem)) {
        return;
    }

    elem.parentElement.scrollTop = elem.parentElement.scrollHeight;

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$displayImage = function(aUrl) {
    var elem;

    elem = TP.boot.$getBootImageElement();
    if (!TP.boot.$isElement(elem)) {
        return;
    }

    elem.src = aUrl;
};

//  ----------------------------------------------------------------------------

TP.boot.$displayMessage = function(aString, flush) {

    var elem,
        buffer,
        message,
        msgNode;

    elem = TP.boot.$getBootLogElement();
    if (!TP.boot.$isElement(elem)) {
        return;
    }

    if (!TP.boot.$isElement(TP.boot.$$msgTemplate)) {
        msgNode = TP.boot.$documentFromString(
            '<div xmlns="http://www.w3.org/1999/xhtml"><div></div></div>');
        if (!msgNode) {
            console.log('Unable to create log message template.');
        }
        TP.boot.$$msgTemplate = msgNode.firstChild.firstChild;
    }

    message = aString || '';

    msgNode = TP.boot.$$msgTemplate.cloneNode(true);
    try {
        msgNode.insertAdjacentHTML('beforeEnd', message);
    } catch (e) {
        msgNode = TP.boot.$documentFromString(
            '<div xmlns="http://www.w3.org/1999/xhtml"><div><pre>' +
            message + '</pre></div></div>');
        if (!msgNode) {
            msgNode = TP.boot.$documentFromString(
                '<div xmlns="http://www.w3.org/1999/xhtml"><div><pre>' +
                TP.boot.$htmlEscape(message) + '</pre></div></div>');
            if (!msgNode) {
                console.log('Unable to create log message element.');
            } else {
                msgNode = msgNode.firstChild.firstChild;
            }
        } else {
            msgNode = msgNode.firstChild.firstChild;
        }
    }

    if (msgNode) {
        buffer = TP.boot.$flushUIBuffer(TP.boot.shouldStop());
        TP.boot.$nodeAppendChild(buffer, msgNode);
    }

    // If asked, flush the brand new message, even if it's now the only one in
    // the buffer. (This is true for errors/system output by default).
    if (flush) {
        TP.boot.$flushUIBuffer(true);
        TP.boot.$scrollUIBuffer();
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$displayProgress = function() {

    var elem,
        workload,
        percent,
        stage,
        index;

    elem = TP.boot.$getProgressBarElement();
    if (!TP.boot.$isElement(elem)) {
        return;
    }

    if (TP.sys.cfg('log.reporter') !== 'bootui') {
        return;
    }

    stage = TP.boot.$getStage();

    if (!TP.boot.$$bootnodes) {
        return;
    } else {
        workload = TP.boot.$$workload;
        index = TP.boot.$$bootindex;
        percent = Math.round(index / workload * 100);
    }

    // Don't go further if we'd be setting same value.
    if (percent === TP.boot.$$percent) {
        return;
    }

    TP.boot.$$percent = percent;

    TP.boot.$elementReplaceClass(elem, /log-/, TP.boot.$$logcss);

    if (percent === 100) {
        // Avoid issues with margin etc, rely on right: 0;
        elem.style.width = 'auto';
        elem.style.right = 0;
    } else {
        elem.style.width = percent.toFixed() + '%';
    }

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$displayStage = function(aString) {
    var elem;

    elem = TP.boot.$getBootHeadElement();
    if (!TP.boot.$isElement(elem)) {
        return;
    }

    elem.innerHTML = aString;
};

//  ----------------------------------------------------------------------------

TP.boot.$displayStatus = function(aString) {
    var elem;

    elem = TP.boot.$getBootSubheadElement();
    if (!TP.boot.$isElement(elem)) {
        return;
    }

    elem.innerHTML = aString;
};

//  ----------------------------------------------------------------------------
//  SHOW/HIDE UI
//  ----------------------------------------------------------------------------

TP.boot.hideUIBoot = function() {
    var elem,
        id;

    id = TP.sys.cfg('boot.uiboot');

    // If the boot and root ui are the same ignore this request. It has to be
    // done by manipulating the uiroot instead.
    if (id === TP.sys.cfg('tibet.uiroot')) {
        return;
    }

    elem = TP.boot.$getUIElement(id);
    if (TP.boot.$isValid(elem)) {
        if (TP.boot.$isValid(elem.frameElement)) {
            elem.frameElement.style.visibility = 'hidden';
        } else {
            elem.style.visibility='hidden';
        }
    }
};

//  ----------------------------------------------------------------------------

TP.boot.hideUIRoot = function() {
    var elem,
        id;

    id = TP.sys.cfg('tibet.uiroot');
    elem = TP.boot.$getUIElement(id);

    if (TP.boot.$isValid(elem)) {
        if (TP.boot.$isValid(elem.frameElement)) {
            elem.frameElement.style.visibility = 'hidden';
        } else {
            elem.style.visibility='hidden';
        }
    }
};

//  ----------------------------------------------------------------------------

TP.sys.showBootLog = function(reporter, level) {

    /**
     * @name showBootLog
     * @summary Dump the bootlog to the current target location. By default this
     *     is routed to the consoleReporter.
     * @return {null}
     */

    var lvl,
        rep,
        name,
        entries;

    name = '$' + (reporter || 'console') + 'Reporter';
    rep = TP.boot[name];

    if (TP.boot.$notValid(rep)) {
        TP.boot.$consoleReporter(
            [new Date(), TP.BOOT_LOG, TP.WARN,
                'Boot log reporter \'' + reporter + '\' not found.',
                arguments]);
        return;
    }

    // By default dump the entire log.
    lvl = TP.boot.$isValid(level) ? level : TP.TRACE;

    entries = TP.sys.getBootLog().getEntries();
    entries.forEach(function(entry) {

        if (entry[TP.LOG_ENTRY_LEVEL] < lvl) {
            return;
        }

        TP.boot[name](entry);
    });

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.showUIBoot = function() {
    var elem,
        id;

    id = TP.sys.cfg('boot.uiboot');
    elem = TP.boot.$getUIElement(id);

    if (TP.boot.$isValid(elem)) {
        if (TP.boot.$isValid(elem.frameElement)) {
            elem.frameElement.style.visibility = 'visible';
        } else {
            elem.style.visibility='visible';
        }
    }
};

//  ------------------------------------------------------------------------

TP.boot.showUIRoot = function() {

    /**
     * @name showUIRoot
     * @synopsis Displays the current tibet.uiroot element in the
     *     application's main window.
     * @return {null}
     */

    var elem,
        id;

    id = TP.sys.cfg('tibet.uiroot');
    elem = TP.boot.$getUIElement(id);

    if (TP.boot.$isValid(elem)) {
        if (TP.boot.$isValid(elem.frameElement)) {
            elem.frameElement.style.visibility = 'visible';
        } else {
            elem.style.visibility='visible';
        }
    }

    TP.boot.hideUIBoot();

    return;
};

//  ----------------------------------------------------------------------------
//  BOOT STAGES
//  ----------------------------------------------------------------------------

TP.boot.$getBootStats = function() {

    return '' + TP.boot.$$totalwork + ' imports, ' +
        TP.boot.$$errors + ' errors, ' +
        TP.boot.$$warnings + ' warnings, ' +
        TP.boot.$$bottlenecks + ' bottlenecks.';
};

//  ----------------------------------------------------------------------------

TP.boot.$getStage = function() {
    return TP.boot.$$stage;
};

//  ----------------------------------------------------------------------------

TP.boot.$getStageInfo = function(aStage) {

    var stage;

    stage = aStage || TP.boot.$$stage;
    return TP.boot.$$stages[stage];
};

//  ----------------------------------------------------------------------------

TP.boot.$hasReachedStage = function(aStage) {

    var target,
        current;

    target = TP.boot.$$stageorder.indexOf(aStage);
    current = TP.boot.$$stageorder.indexOf(TP.boot.$$stage);

    return target <= current;
};

//  ----------------------------------------------------------------------------

TP.boot.$setStage = function(aStage, aReason) {

    /**
     * @name $setStage
     * @summary Sets the current boot stage and reports it to the log.
     * @param {String} aStage A valid boot stage. This list is somewhat flexible
     *     but common stages include: config, config_*, phase_one, phase_two,
     *     phase_*_complete, activation, starting, and running :).
     * @param {String} aReason Optional text currently used only when stage is
     *     'stopped' to provide the termination reason.
     * @return {String} The current stage after the set completes.
     */

    var info,
        prior,
        prefix,
        stagetime,
        head,
        sub,
        image;

    // Once we're stopped that's it, ignore further updates.
    if (TP.boot.$$stage === 'stopped') {
        return;
    }

    // Verify the stage is one we recognize.
    info = TP.boot.$getStageInfo(aStage);
    if (TP.boot.$notValid(info)) {
        TP.boot.$stderr('Invalid boot stage: ' + aStage);
        return;
    }

    // Ignore requests to 'go backwards' or to set the same stage.
    if (TP.boot.$$stageorder.indexOf(aStage) <
        TP.boot.$$stageorder.indexOf(TP.boot.$$stage)) {
        return;
    }

    // Update the current stage now that we know we're valid. We capture the
    // prior stage so we can output summary data for it below.
    prior = TP.boot.$$stage;
    TP.boot.$$stage = aStage;

    if (aStage !== 'prelaunch') {
        //  output time spent in the stage we're leaving. NOTE NOTE NOTE you
        //  must do this computation after updating the current stage.
        stagetime = TP.boot.$getStageTime(prior);

        if (prior === 'paused') {
            TP.boot.$stdout('', TP.SYSTEM);
            prefix = 'Paused for ';
        } else {
            prefix = 'Completed in ';
        }
        TP.boot.$stdout(prefix + stagetime + 'ms', TP.SYSTEM);
    }

    TP.boot.$stdout('', TP.SYSTEM);
    TP.boot.$stdout(TP.sys.cfg('boot.uisubsection'), TP.SYSTEM);
    TP.boot.$stdout(info.log, TP.SYSTEM);
    TP.boot.$stdout(TP.sys.cfg('boot.uisubsection'), TP.SYSTEM);
    TP.boot.$stdout('', TP.SYSTEM);

    // Capture the time we reached this stage. this is key for reporting the
    // time spent in the current (now prior) stage below.
    info.entered = new Date();

    head = info.head;
    if (TP.boot.$notEmpty(head)) {
        TP.boot.$displayStage(head);
    }

    sub = info.sub;
    if (TP.boot.$notEmpty(sub)) {
        TP.boot.$displayStatus(sub);
    }

    image = info.image;
    if (TP.boot.$notEmpty(image)) {
        // Image is provided as a TIBET URL, ~lib_img etc. so we need to replace
        // that with the proper prefix before setting as the img element's src.

        if (image.charAt(0) === '~') {
            image = TP.boot.$uriExpandPath(image);
        }
        TP.boot.$displayImage(image);
    }

    // If the stage has a 'hook' function run it.
    if (typeof info.hook === 'function') {
        info.hook(aStage, aReason);
    }

    // One last thing is dealing with the termination phases, started and
    // stopped. Each needs some special handling.

    if (TP.boot.$$stage === 'liftoff') {

        TP.boot.$stdout('Launched in ' +
            (TP.boot.$getStageTime('started', 'prelaunch') -
                TP.boot.$getStageTime('paused')) +
            'ms with ' + TP.boot.$getBootStats(), TP.SYSTEM);

        TP.boot.$stdout('', TP.SYSTEM);
        TP.boot.$stdout(TP.sys.cfg('boot.uisection'), TP.SYSTEM);

    } else if (TP.boot.$$stage === 'stopped') {

        TP.boot.$stdout(aReason, TP.SYSTEM);
        TP.boot.$stdout('', TP.SYSTEM);
        TP.boot.$stdout('Stopped after ' +
            (TP.boot.$getStageTime('stopped', 'prelaunch') -
                TP.boot.$getStageTime('paused')) +
            'ms with ' + TP.boot.$getBootStats(), TP.SYSTEM);
        TP.boot.$stdout('', TP.SYSTEM);
        TP.boot.$stdout(TP.sys.cfg('boot.uisection'), TP.SYSTEM);
    }

    TP.boot.$flushLog(true);

    return TP.boot.$$stage;
};

//  ----------------------------------------------------------------------------

TP.boot.$getNextStage = function(aStage) {
    var stage,
        index;

    stage = aStage || TP.boot.$$stage;
    index = TP.boot.$$stageorder.indexOf(stage);
    if (index === TP.NOT_FOUND ||
        (index + 1 === TP.boot.$$stageorder.length))  {
        return;
    }

    return TP.boot.$$stageorder[index + 1];
};

//  ----------------------------------------------------------------------------

TP.boot.$getPriorStage = function(aStage) {
    var stage,
        index;

    stage = aStage || TP.boot.$$stage;
    index = TP.boot.$$stageorder.indexOf(stage);
    if (index === TP.NOT_FOUND || index === 0)  {
        return;
    }

    return TP.boot.$$stageorder[index - 1];
};

//  ----------------------------------------------------------------------------

TP.boot.$getStageTime = function(aStage, startStage) {

    /**
     * Returns the amount of time a stage took relative to the startStage or the
     * prior stage. If the stage isn't complete this method returns a rough time
     * based on the time of the call.
     * @param {String} aStage The stage to report on. Defaults to current stage.
     * @param {String} startStage The stage to compute from. Defaults to the
     *     stage prior to aStage.
     * @return {Number} An elapsed time value in milliseconds.
     */

    var stage,
        next,
        start,
        stageinfo,
        stagetime,
        startinfo,
        starttime,
        elapsed;

    //  computation is actually based on the _next stages'_ entry time or the
    //  time of this call - the entry time of either this stage or some
    //  alternative start stage. this is due to the fact we store entered times
    //  in each stage, not elapsed times.

    // Default the stage setting, then capture the next stage or current time
    // data as the time we'll use for the largest of the two time values.
    stage = aStage || TP.boot.$$stage;
    next = TP.boot.$getNextStage(stage);
    stageinfo = TP.boot.$getStageInfo(next);
    if (TP.boot.$notValid(stageinfo)) {
        return 0;
    } else if (TP.boot.$notValid(stageinfo.entered)) {
        stagetime = new Date();
    } else {
        stagetime = stageinfo.entered;
    }

    // Default the start stage to the current stage. Again, this is done since
    // our start time is captured in stage info, not elapsed or end time.
    start = startStage || stage;
    startinfo = TP.boot.$getStageInfo(start);
    if (TP.boot.$notValid(startinfo)) {
        return 0;
    } else if (TP.boot.$notValid(startinfo.entered)) {
        return 0;
    } else {
        starttime = startinfo.entered;
    }

    // Simple value is current - start in milliseconds.
    elapsed = Math.abs(stagetime.getTime() - starttime.getTime());

    return elapsed;
};

//  ----------------------------------------------------------------------------
//  URL CONFIGURATION FUNCTIONS
//  ----------------------------------------------------------------------------

TP.boot.$getArgumentPrimitive = function(value) {
    if (TP.boot.$notValid(value)) {
        return value;
    }

    // Try to convert to number, boolean, regex,
    if (TP.boot.NUMBER_REGEX.test(value)) {
        return 1 * value;
    } else if (TP.boot.BOOLEAN_REGEX.test(value)) {
        return value === 'true';
    } else if (TP.boot.REGEX_REGEX.test(value)) {
        return new RegExp(value.slice(1, -1));
    } else if (TP.boot.OBJECT_REGEX.test(value)) {
        try {
            JSON.parse(value);
        } catch (e) {
            return value;
        }
    } else {
        return value;
    }
};

//  ----------------------------------------------------------------------------

TP.boot.getURLArguments = function(url) {

    /**
     * @name getURLArguments
     * @summary Parses the URL for any TIBET-specific argument block. When
     *     parsing the hash is checked for any & segment and that segment is
     *     split just as if it were a set of server parameters. For example,
     *     http://localhost/index.html#foo&boot.debug=true results in the
     *     argument object containing {'boot.debug':true};
     * @param {string} url The url string to decode for arguments.
     * @return {Object}
     */

    var hash,
        params,
        args;

    // Process any hash portion of the URL string.
    if (!/#/.test(url)) {
        return {};
    }
    hash = url.slice(url.indexOf('#') + 1);
    hash = decodeURIComponent(hash);

    args = {};
    params = hash.split('&');
    params.forEach(function(item) {
        var parts,
            key,
            value;

        parts = item.split('=');
        key = parts[0];
        value = parts[1];

        if (parts.length > 1) {
            if ((value.length > 1) &&
                    (/^".*"$/.test(value) || /^'.*'$/.test(value))) {
                value = value.slice(1, -1);
            }
        } else {
            key = item;
            value = true;
        }

        args[key] = TP.boot.$getArgumentPrimitive(value);
    });

    return args;
};

//  ----------------------------------------------------------------------------

TP.boot.getURLBookmark = function(url) {

    /**
     * @name getURLBookmark
     * @summary Parses the URL for a bootable bookmark hash reference.
     * @param {string} url The url string to decode for arguments.
     * @return {string} The bookmark, if any.
     */

    var hash;

    // Process the hash portion of the URL string.
    if (!/#/.test(url)) {
        return;
    }
    hash = url.slice(url.indexOf('#'));

    // Any part of the hash which is formatted to match server-side parameter
    // syntax will be treated as client-side parameters. The bookmark portion of
    // the hash must be non-empty.
    if (/&/.test(hash)) {
        hash = hash.slice(0, hash.indexOf('&'));
    }

    return hash;
};

//  ----------------------------------------------------------------------------
//  ROOT PATHS
//  ----------------------------------------------------------------------------

/*
TIBET is "dual path" oriented, meaning it thinks in terms of an "app root"
and a "lib root" so that your code and the TIBET code can vary independently
without too many maintenance issues. Using separate paths for APP and LIB
code lets you either share a codebase, or point your application to a new
release of TIBET for testing without altering directory structures, making
extra copies, or other typical approaches.
*/

//  ----------------------------------------------------------------------------

TP.boot.$getAppHead = function() {

    /**
     * @name $getAppHead
     * @summary Returns the portion of the launch location just above whichever
     *     file actually triggered the launch sequence. Always computed from the
     *     window.location (if available).
     * @return {String} The computed path.
     */

    var path,
        offset,
        parts,
        keys,
        key,
        lib;

    if (TP.boot.$$apphead != null) {
        return TP.boot.$$apphead;
    }

    // Compute from the window location. This presumes window is a real slot
    // (which means it won't work on Node.js etc by default).
    path = decodeURI(window.location.toString());
    path = path.split(/[#?]/)[0];

    // From a semantic viewpoint the app head can't be inside the library
    // area, it has to be above it, typically where we'd think of app root
    keys = [TP.sys.cfg('boot.tibetdir'), TP.sys.cfg('boot.tibetinf')];
    len = keys.length;
    for (i = 0; i < len; i++) {
        key = '/' + keys[i] + '/';
        if (path.indexOf(key) !== -1) {
            TP.boot.$$apphead = path.slice(0, path.indexOf(key));
            return TP.boot.$$apphead;
        }
    }

    // Didn't find a typical project library location on the path. Check to see
    // if we're _in_ the library.
    lib = TP.sys.cfg('boot.libtest') || TP.sys.cfg('boot.tibetlib');
    if (path.indexOf('/' + lib + '/') !== -1) {
        TP.boot.$$apphead = path.slice(0,
            path.indexOf('/' + lib + '/') + lib.length + 1);
        return TP.boot.$$apphead;
    }

    // Should have found boot.tibetlib but just in case we can just use an
    // offset from the current window location (minus noise for # etc.)
    offset = TP.sys.getcfg('path.head_offset');
    if (TP.boot.$notEmpty(offset)) {
        TP.boot.$$apphead = TP.boot.$uriCollapsePath(
            TP.boot.$uriJoinPaths(path, offset));
        return TP.boot.$$apphead;
    }

    // If we're not launching from somewhere below the typical library root we
    // try to work from the last portion of the path prior to any hash value.
    parts = path.split('/');
    if (parts[parts.length - 1].match(/\./)) {
        parts.length = parts.length - 1;
    }
    path = parts.join('/');

    TP.boot.$$apphead = path;
    return path;
};

//  ----------------------------------------------------------------------------

TP.boot.$getAppRoot = function() {

    /**
     * @name $getAppRoot
     * @summary Returns the root path for the application, the point from which
     *     most if not all "app path" resolution occurs. Unless this has been
     *     defined otherwise the return value is computed based on the value
     *     found via $getAppHead. If the application launch path includes a
     *     reference to node_modules the app root is presumed to be the location
     *     containing node_modules and it is adjusted accordingly.
     * @return {String} The computed path.
     */

    var root;

    //  first check for a cached value. this is what's used during booting
    if (TP.boot.$$approot != null) {
        return TP.boot.$$approot;
    }

    //  if specified it should be an absolute path we can expand and use
    root = TP.sys.cfg('path.app_root');
    if (TP.boot.$notEmpty(root)) {
        return TP.boot.$setAppRoot(root);
    }

    // If app root isn't going to match up with app head it's going to typically
    // be set via launch parameters, url parameters, or via tibet.json. We can
    // set it initially here and it'll be reset once those are processed.
    return TP.boot.$setAppRoot(TP.boot.$getAppHead());
};

//  ----------------------------------------------------------------------------

TP.boot.$getLibRoot = function() {

    /**
     * @name $getLibRoot
     * @summary Returns the root path for the TIBET codebase.
     * @description When the value for path.lib_root is not specified this
     *     method will try to compute one. The computation can be altered via
     *     the boot.libcomp setting.
     * @return {String} The root path for the TIBET codebase.
     * @todo
     */

    var comp,
        root,
        file,
        loc,
        test,
        ndx,
        path,
        parts,
        list,
        scripts,
        i,
        len;

    //  first check for a cached value. this is what's used during booting
    if (TP.boot.$$libroot != null) {
        return TP.boot.$$libroot;
    }

    //  if specified it should be an absolute path we can expand and use
    root = TP.sys.cfg('path.lib_root');
    if (TP.boot.$notEmpty(root)) {
        return TP.boot.$setLibRoot(root);
    }

    // Default starting point is the current window location minus any fragment
    // and file reference.
    loc = decodeURI(window.location.toString());
    root = loc.split(/[#?]/)[0];

    parts = root.split('/');
    if (parts[parts.length - 1].match(/\./)) {
        parts.length = parts.length - 1;
    }
    root = parts.join('/');

    comp = TP.sys.cfg('boot.libcomp');
    switch (comp) {
    case 'apphead':
        // force to match app_head.
        return TP.boot.$setLibRoot(TP.boot.$getAppHead());

    case 'approot':
        // force to match app_root.
        return TP.boot.$setLibRoot(TP.boot.$getAppRoot());

    case 'frozen':
        // frozen applications typically have TIBET-INF/tibet in them
        path = TP.boot.$uriJoinPaths(
                TP.boot.$uriJoinPaths(root, TP.sys.cfg('boot.tibetinf')),
                TP.sys.cfg('boot.tibetlib'));
        return TP.boot.$setLibRoot(path);

    case 'indexed':
        // find location match using a string index on window location.
        test = TP.sys.cfg('boot.libtest') || TP.sys.cfg('boot.tibetlib');
        if (TP.boot.$notEmpty(test)) {
            ndx = root.lastIndexOf(test);
            if (ndx !== -1) {
                ndx += test.length + 1;
                path = root.slice(0, ndx);
                return TP.boot.$setLibRoot(path);
            }
        }
        break;

    case 'location':
        // force to last 'collection' in the window location.
        return TP.boot.$setLibRoot(root);

    case 'tibetdir':
        // npmdir applications typically have node_modules/tibet in them
        path = TP.boot.$uriJoinPaths(
                TP.boot.$uriJoinPaths(root, TP.sys.cfg('boot.tibetdir')),
                TP.sys.cfg('boot.tibetlib'));
        return TP.boot.$setLibRoot(path);

        /* eslint-disable no-fallthrough */
    case 'script':
        void(0);
    default:
        /* eslint-enable no-fallthrough */

        // Find script tags and turn into an array instead of collection.
        scripts = Array.prototype.slice.call(
            document.getElementsByTagName('script'), 0);
        len = scripts.length;
        for (i = 0; i < len; i++) {
            if (/tibet_init/.test(scripts[i].src)) {
                path = scripts[i].src;
                break;
            }
        }

        // Combine current path with the src path in case of relative path
        // specification (common) and we should end up with a workable offset.
        if (TP.boot.$notEmpty(path)) {
            return TP.boot.$setLibRoot(
                TP.boot.$uriCollapsePath(
                    TP.boot.$uriJoinPaths(TP.boot.$uriJoinPaths(root, path),
                    TP.sys.cfg('boot.initoffset'))));
        }

        break;
    }

    if (TP.boot.$isValid(TP.boot.$$libroot)) {
        return TP.boot.$$libroot;
    }

    TP.boot.shouldStop('unable to compute lib_root');
    TP.boot.$stderr('TP.boot.$getLibRoot() unable to find/compute libroot.',
                   TP.FATAL);
};

//  ----------------------------------------------------------------------------

TP.boot.$getRootPath = function() {

    /**
     * @name $getRootPath
     * @summary Returns the currently active root path for the codebase.
     * @return {String}
     */

    var path,
        debug;

    if (TP.boot.$$rootpath != null) {
        return TP.boot.$$rootpath;
    }

    path = TP.boot.$getLibRoot();

    //  won't cache until we're sure we've gotten a libroot value
    if (path != null) {
        //  cache the value for repeated use
        TP.boot.$$rootpath = path;
    }

    debug = TP.sys.cfg('debug.path');
    if (debug && TP.boot.$$debug) {
        TP.boot.$stdout('TP.boot.$getRootPath() computed rootpath: ' +
                        TP.boot.$$rootpath, TP.TRACE);
    }

    return path;
};

//  ----------------------------------------------------------------------------

TP.boot.$setAppRoot = function(aPath) {

    /**
     * @name $setAppRoot
     * @summary Sets the application root path, the path used as a base path
     *     for any relative path computations for application content.
     * @param {String} aPath A new root path for application content.
     * @return {String} The expanded path value.
     */

    var path,
        debug;

    path = TP.boot.$uriExpandPath(aPath);
    path = decodeURI(path);
    TP.boot.$$approot = path;

    TP.sys.setcfg('path.app_root', path);

    debug = TP.sys.cfg('debug.path');
    if (debug && TP.boot.$$debug) {
        TP.boot.$stdout('TP.boot.$setAppRoot() defined approot: ' + path,
                        TP.TRACE);
    }

    return TP.boot.$$approot;
};

//  ----------------------------------------------------------------------------

TP.boot.$setLibRoot = function(aPath) {

    /**
     * @name $setLibRoot
     * @summary Sets the library root path, the path used as a base path for
     *     any relative path computations for library content.
     * @param {String} aPath A new root path for library content.
     * @return {String} The expanded path value.
     */

    var path,
        debug;

    path = TP.boot.$uriExpandPath(aPath);
    path = decodeURI(path);
    TP.boot.$$libroot = path;

    TP.sys.setcfg('path.lib_root', path);

    debug = TP.sys.cfg('debug.path');
    if (debug && TP.boot.$$debug) {
        TP.boot.$stdout('TP.boot.$setLibRoot() defined libroot: ' + path,
                        TP.TRACE);
    }

    return TP.boot.$$libroot;
};

//  ----------------------------------------------------------------------------
//  CONFIGURATION FUNCTIONS
//  ----------------------------------------------------------------------------

TP.boot.$configurePackage = function() {

    /**
     * @name $configurePackage
     * @summary Locates the package file if at all possible. The search checks
     *     both boot.profile and boot.package with profile taking precedence.
     *     Note that boot.profile can also override boot.config if it includes a
     *     barename. The profile 'development#team-tibet' for example will load
     *     the development profile file and use the team-tibet config. The value
     *     for boot.package on the other hand is a pure URL to the package file.
     * @todo
     */

    var profile,
        package,
        config,
        parts,
        file,
        xml,
        err;

    // First phase is about giving boot.profile precedence over boot.package.
    profile = TP.sys.cfg('boot.profile');
    if (TP.boot.$isEmpty(profile)) {
        TP.boot.$stdout('Empty boot.profile. Checking for boot.package.',
            TP.TRACE);

        package = TP.sys.cfg('boot.package');
        if (TP.boot.$isEmpty(package)) {

            TP.boot.$stdout('Empty boot.package. Defaulting to standard.xml.',
                TP.TRACE);

            package = 'standard.xml';
        } else {
            TP.boot.$stdout('Found boot.package. Using: ' + package, TP.TRACE);
        }
    } else {
        TP.boot.$stdout('Found boot.profile. Using: ' + profile, TP.TRACE);
    }

    // Second phase is processing any boot.profile if found to update any
    // boot.package and boot.config values contained in the profile.
    if (TP.boot.$notEmpty(profile)) {

        // If we see # it's a package#config description. Split and update the
        // proper elements as needed.
        if (/#/.test(profile)) {
            parts = profile.split('#');
            package = parts[0];

            config = TP.sys.cfg('boot.config');
            if (config !== parts[1]) {

                // If the existing config isn't empty we're about to change it.
                // Don't do that without writing a warning to the logs.
                if (TP.boot.$notEmpty(config)) {
                    TP.boot.$stdout(
                        'Overriding boot.config (' + config +
                        ') with profile#config: ' + parts[1], TP.WARN);
                }

                // Configuration mismatch. We'll go with the one on the
                // profile...because we're in an IF whose condition is that
                // there was no boot.package spec'd to go with boot.config.
                TP.sys.setcfg('boot.config', parts[1]);
            }
        } else {
            package = profile;
        }
    }

    // Packages should always be .xml files. If we're defaulting from user input
    // tho we don't assume they added that to either profile or package name.
    if (/\.xml$/.test(package) !== true) {
        package += '.xml';
    }

    // If the package spec isn't absolute we need to join it with a
    // directory or other prefix so we can find the actual resource.
    if (!TP.boot.$uriIsAbsolute(package)) {
        package = TP.boot.$uriJoinPaths('~app_cfg', package);
    }

    // Warn if we're overriding package info
    if (package !== TP.sys.cfg('boot.package') &&
        TP.boot.$notEmpty(TP.sys.cfg('boot.package'))) {
        TP.boot.$stdout(
            'Overriding boot.package (' + TP.sys.cfg('boot.package') +
            ') with profile#config: ' + package, TP.WARN);
    }

    file = TP.boot.$uriExpandPath(package);
    TP.boot.$stdout('Loading package: ' + file, TP.TRACE);

    xml = TP.boot.$uriLoad(file, TP.DOM, 'manifest', false);
    if (xml) {
        TP.boot.$$bootxml = xml;
        TP.boot.$$bootfile = file;
    } else {

        err = 'Boot package \'' + package + '\' not found in: ' + file,
        TP.boot.$stderr(err, TP.FATAL);

        throw new Error(err);
    }

    return xml;
};

//  ----------------------------------------------------------------------------

TP.boot.$configureBootstrap = function() {

    /**
     * @name $configureBootstrap
     * @summary Configures any boot properties based on the current project
     *     (tibet.json) file provided that loading that file works.
     * @todo
     */

    var file,
        str,
        obj,
        logpath;

    // Launch parameters can be provided directly to the launch command such
    // that the bootstrap file isn't needed. If that's the case we can skip
    // loading the file and cut out one more HTTP call.
    if (TP.sys.cfg('boot.nobootstrap')) {
        return;
    }

    file = TP.boot.$uriJoinPaths('~app', TP.sys.cfg('boot.bootstrap'));
    logpath = TP.boot.$uriInTIBETFormat(file);

    file = TP.boot.$uriExpandPath(file);

    try {
        TP.boot.$stdout('Loading bootstrap: ' + logpath, TP.TRACE);
        str = TP.boot.$uriLoad(file, TP.TEXT, 'source');
        if (!str) {
            TP.boot.$stderr('Failed to load: ' + file, TP.FATAL);
        }
        obj = JSON.parse(str);
    } catch (e) {
        TP.boot.$stderr('Failed to load: ' + logpath,
            TP.boot.$ec(e), TP.FATAL);
        return;
    }

    // Process the values in the bootstrap file to push them into the system
    // configuration.
    TP.boot.$configureOptions(obj);

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$configureEnvironment = function() {

    /**
     * @name $configureEnvironment
     * @summary Defines a number of 'environment' variables which support
     *     conditional processing of tasks/targets. These variables are set
     *     based browser and feature-detection techniques as needed to try to
     *     describe the environment accurately.
     * @return {null}
     */

    //  start with platform
    TP.boot.$$setenv('tibet.userAgent', navigator.userAgent);

    TP.boot.$$setenv('tibet.platform', TP.$platform);
    TP.boot.$$setenv('tibet.' + TP.$platform, TP.$platform);

    //  some platforms report with version, handle registering them without
    //  a version for more generic checks manually here.
    if (TP.$platform.indexOf('win') === 0) {
        TP.boot.$$setenv('tibet.win', 'win');
    }

    if (TP.$platform.indexOf('mac') === 0) {
        TP.boot.$$setenv('tibet.mac', 'mac');
    }

    if (TP.$platform.indexOf('*nix') === 0) {
        TP.boot.$$setenv('tibet.*nix', '*nix');
    }

    //  configure the default explicit browser slot(s)
    TP.boot.$$setenv('tibet.browser', TP.$browser);
    TP.boot.$$setenv('tibet.browserIdent', TP.$browserIdent);
    TP.boot.$$setenv('tibet.browserMajor', TP.$browserMajor);
    TP.boot.$$setenv('tibet.browserMinor', TP.$browserMinor);
    TP.boot.$$setenv('tibet.browserBuild', TP.$browserBuild);
    TP.boot.$$setenv('tibet.browserPatch', TP.$browserPatch);

    TP.boot.$$setenv('tibet.browserUI', TP.$browserUI);
    TP.boot.$$setenv('tibet.browserUIIdent', TP.$browserUIIdent);
    TP.boot.$$setenv('tibet.browserUIMajor', TP.$browserUIMajor);
    TP.boot.$$setenv('tibet.browserUIMinor', TP.$browserUIMinor);
    TP.boot.$$setenv('tibet.browserUIBuild', TP.$browserUIBuild);
    TP.boot.$$setenv('tibet.browserUIPatch', TP.$browserUIPatch);

    //  xml processing
    TP.boot.$$setenv('tibet.msxml', TP.$msxml);

    //  language
    TP.boot.$$setenv('tibet.xmllang',
                        TP.$language.toLowerCase());
    TP.boot.$$setenv('tibet.' + TP.$language.toLowerCase(),
                        TP.$language.toLowerCase());

    TP.sys.setcfg('tibet.offline', !TP.sys.isHTTPBased());

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$configureLocalCache = function(shouldWarn) {

    /**
     * @name $configureLocalCache
     * @summary Configures local cache storage if boot.localcache is true.
     * @description The local cache is used heavily during booting to optimize
     *     load times and HTTP access overhead, but is also leveraged by TIBET's
     *     content processing pipeline for storing processed markup and style
     *     data. NOTE that this method may alter the value of the
     *     boot.localcache flag if no cache-capable infrastructure can be
     *     found/accessed in the current browser.
     * @param {Boolean} shouldWarn Should warnings be output? Normally true, but
     *     since this routine is called more than once we turn them off in some
     *     circumstances.
     * @return {null}
     */

    var pname,
        version,
        msg;

    //  if the cache is off then there's no real work to do, we check that
    //  flag anywhere we might be doing cache-related work.
    if (!TP.sys.cfg('boot.localcache')) {
        return;
    }

    //  configure storage in whatever form we can so we can support
    //  the localcache requirement(s). NOTE that this won't access DOM
    //  storage unless booting from HTTP due to oversight on the part of the
    //  various browser implementers.
    TP.boot.$setupDOMStorage();

    if (TP.boot.$notValid(TP.$BOOT_STORAGE)) {
        if (shouldWarn !== false) {
            //  should have been able to configure cache, particularly when
            //  we're trying to launch over HTTP (since DOM Storage should
            //  be there), so record failure when HTTP-based as an error.
            msg = 'Unable to configure storage, disabling local cache.';

            if (TP.sys.isHTTPBased()) {
                TP.boot.$stderr(msg);
            } else {
                //  file-based launches are often restricted from accessing
                //  DOM storage, but we can get to the file system so it's
                //  unlikely to have a huge impact.
                TP.boot.$stdout(msg, TP.WARN);
            }
        }

        //  force the cache control flag to false so we don't try to use the
        //  cache anywhere else.
        TP.sys.setcfg('boot.localcache', false);

        return;
    }

    //  how the cache is actually leveraged and updated is a factor of the
    //  cache mode, which can be "versioned" (leveraging a version string
    //  check), "synchronized" (use Last-Modified data), "manual" (refresh
    //  nodes that are specifically marked), "stale" (where the cache is
    //  effectively forced to update completely), and "fresh" where the
    //  cache is presumed to be correct regardless of its true state).
    switch (TP.sys.cfg('boot.cachemode')) {
        case 'versioned':

            TP.boot.$stdout('Configuring \'versioned\' local cache.', TP.TRACE);

            //  versioned caches check the package's version as defined in
            //  the root manifest file against the cached version for the
            //  application. the result of that comparison drive how the
            //  various cache detail flags are set.
            pname = TP.sys.cfg('project.name');
            version = TP.sys.cfg('project.version');

            TP.$BOOT_STORAGE.get(
                pname + '_cache_version',
                function(content) {

                    TP.boot.$configureVersionedCache(content, version);
                });

            break;

        case 'synchronized':

            TP.boot.$stdout('Configuring \'synchronized\' local cache.',
                            TP.TRACE);

            //  a synchronized cache means we update every file based on
            //  Last-Modified data to keep the cache synchronized with any
            //  changes on the server.
            TP.sys.setcfg('import.source', 'modified');

            break;

        case 'manual':

            TP.boot.$stdout('Configuring \'manual\' local cache.', TP.TRACE);

            //  a manual cache means the manifest nodes to update will be
            //  marked manually as needing a refresh. This approach provides
            //  the most control but is harder to maintain for developers.
            TP.sys.setcfg('import.source', 'marked');

            break;

        case 'stale':

            TP.boot.$stdout('Configuring \'stale\' local cache.', TP.TRACE);

            //  a stale cache means we don't even want to consider metadata
            //  regarding Last-Modified dates for source. all flags are set
            //  to force full refresh of the cache to occur.
            TP.sys.setcfg('import.source', 'remote');

            //  If the user said that the cache is 'stale', then just empty
            //  it in preparation for reloading.
            TP.$BOOT_STORAGE.removeAll(TP.NOOP);

            break;

        case 'fresh':

            TP.boot.$stdout('Configuring \'fresh\' local cache.', TP.TRACE);

            //  cache is considered current without checks of any kind.
            TP.sys.setcfg('import.manifests', true);
            TP.sys.setcfg('import.metadata', true);
            TP.sys.setcfg('import.source', 'local');

            break;

        default:

            //  invalid cache mode, treat like an invalid cache
            TP.boot.$stderr('Invalid local cache mode: ' +
                TP.sys.cfg('boot.cachemode'), TP.ERROR);
            TP.boot.$stdout('Disabling local cache.', TP.WARN);

            TP.sys.setcfg('boot.localcache', false);

            break;
    }

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$configureVersionedCache = function(cacheVersion, rootVersion) {

    /**
     * @name $configureVersionedCache
     * @summary Configures cache import properties based on comparison of the
     *     version strings provided. The cache version is typically read from
     *     the local cache using the current application name while the
     *     rootVersion is read from the tibet.xml file.
     * @description The comparison of version strings is usually done using a
     *     common format of major.minor.build.patch. The level at which the
     *     version string first changes defines the nature of the overall cache
     *     update that will be performed.
     *
     *     Since there are four components to a version string there are four
     *     types of cache update which can be configured by manipulating the
     *     version string. A major update invalidates the entire cache,
     *     effectively mirroring a "stale" cache setting. A minor update tries
     *     to preserve as much of the cache as possible while updating with the
     *     latest content (mirroring a "synchronized" cache). A build update
     *     implies a primarily configuration-related change in which individual
     *     files to update are marked (mirroring a "manual" cache setting). A
     *     patch update preserves all existing content and simply invalidates
     *     the build information and presumes that one or more files won't be
     *     found in the current cache (the patch files).
     * @param {The} cacheVersion cached content's version string.
     * @param {The} rootVersion root packages's version string.
     * @return {null}
     * @todo
     */

    var rootParts,
        cacheParts;

    // Since cache config can be async sometimes we'll see cache messaging after
    // a 'stop', which makes things look a bit strange. Just stop.
    if (TP.boot.shouldStop()) {
        return;
    }

    if (!cacheVersion) {
        TP.boot.$stdout('No local cache version string found.', TP.TRACE);
        TP.boot.$stdout('Simulating \'empty\' local cache.', TP.TRACE);

        //  no cache or empty version string, consider cache invalid.
        TP.sys.setcfg('import.source', 'remote');

        return;
    }

    if (!rootVersion) {
        TP.boot.$stdout('No target version string found.', TP.TRACE);
        TP.boot.$stdout('Simulating \'manual\' local cache.', TP.TRACE);

        //  no target version for the root package, consider cache valid but
        //  check individual nodes for version/update information.
        TP.sys.setcfg('import.source', 'marked');

        return;
    }

    //  if the strings are the same, regardless of their form, then we
    //  consider the cache to be current in all respects.
    if (cacheVersion === rootVersion) {
        TP.boot.$stdout('Cache and target versions match.', TP.TRACE);
        TP.boot.$stdout('Simulating \'fresh\' local cache.', TP.TRACE);

        TP.sys.setcfg('import.manifests', true);
        TP.sys.setcfg('import.metadata', true);
        TP.sys.setcfg('import.source', 'local');

        return;
    }

    //  the version strings need to be 'well-formed' for remaining logic to
    //  work properly since it relies on testing relative magnitudes.

    //  if the target version isn't recognized, but it differs from the
    //  current cached version, we consider that a "major update" since we
    //  have no other data to go by.
    if (!TP.TIBET_VERSION_SPLITTER.test(rootVersion)) {
        TP.boot.$stderr('Unrecognized target version format: ' +
                        rootVersion);
        TP.boot.$stdout('Simulating \'stale\' local cache.', TP.TRACE);

        TP.sys.setcfg('import.source', 'remote');

        return;
    }

    //  if the root version is recognized but the cache version isn't then
    //  we can presume this is a major update and configure the cache
    //  accordingly.
    if (!TP.TIBET_VERSION_SPLITTER.test(cacheVersion)) {
        TP.boot.$stderr('Unrecognized cache version format: ' +
                        cacheVersion);
        TP.boot.$stdout('Simulating \'stale\' local cache.', TP.TRACE);

        TP.sys.setcfg('import.source', 'remote');

        return;
    }

    //  both versions appear to be in the right format if we got this far,
    //  so the next stage is to split them and start comparing chunks to
    //  determine the nature of the update
    cacheParts = TP.TIBET_VERSION_SPLITTER.match(cacheVersion);
    rootParts = TP.TIBET_VERSION_SPLITTER.match(rootVersion);

    if (rootParts[1] > cacheParts[1]) {
        //  major update
        TP.boot.$stderr(TP.boot.$join('Major version change from ',
                        cacheParts[1], ' to ', rootParts[1]));

        TP.boot.$stdout('Simulating \'stale\' local cache.', TP.TRACE);

        TP.sys.setcfg('import.source', 'remote');

        return;
    }

    if (rootParts[2] > cacheParts[2]) {
        //  minor update
        TP.boot.$stderr(TP.boot.$join('Minor version change from ',
                        cacheParts[2], ' to ', rootParts[2]));

        TP.boot.$stdout('Simulating \'synchronized\' local cache.', TP.TRACE);

        TP.sys.setcfg('import.source', 'modified');

        return;
    }

    if (rootParts[3] > cacheParts[3]) {
        //  build update
        TP.boot.$stderr(TP.boot.$join('Build version change from ',
                        cacheParts[3], ' to ', rootParts[3]));

        TP.boot.$stdout('Simulating \'manual\' local cache.', TP.TRACE);

        TP.sys.setcfg('import.source', 'marked');

        return;
    }

    if (rootParts[4] > cacheParts[4]) {
        //  build update
        TP.boot.$stderr(TP.boot.$join('Patch version change from ',
                        cacheParts[4], ' to ', rootParts[4]));

        TP.boot.$stdout('Simulating \'fresh\' local cache.', TP.TRACE);

        TP.sys.setcfg('import.source', 'local');

        return;
    }

/*
    //  regardless of how the prior step went, be sure we store the version
    //  we'll be caching as a result of this launch.
    TP.$BOOT_STORAGE.set(pname + '_cache_version', version, TP.NOOP);
*/

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$configureOptions = function(anObject) {

    Object.keys(anObject).forEach(function(key) {
        var value;

        value = anObject[key];
        // If the value isn't a primitive we assume the key is a prefix and that
        // we need to nest the data appropriately.
        if (Object.prototype.toString.call(value) === '[object Object]') {
            Object.keys(value).forEach(function(subkey) {
                var name;

                name = key + '.' + subkey;
                TP.sys.setcfg(name, value[subkey]);

                TP.boot.$stdout('$configureOption ' + name + ' = ' + value[subkey], TP.TRACE);

                // Update cached values as needed.
                if (name === 'path.app_root') {
                    TP.boot.$stdout('Overriding path.app_root cache with: ' +
                        value[subkey], TP.TRACE);
                    TP.boot.$$approot = TP.boot.$uriExpandPath(value[subkey]);
                } else if (name === 'path.lib_root') {
                    TP.boot.$stdout('Overriding path.lib_root cache with: ' +
                        value[subkey], TP.TRACE);
                    TP.boot.$$libroot = TP.boot.$uriExpandPath(value[subkey]);
                }
            });
        } else {
            TP.sys.setcfg(key, value);
        }
    });
};

//  ----------------------------------------------------------------------------

TP.boot.$$configureOverrides = function(options, activate) {

    /**
     * @name $$configureOverrides
     * @summary Processes any arg values that the user may have set,
     *     allowing them to override certain boot properties. Common overrides
     *     include debug, verbose, and display. The args for environment
     *     setting are processed individually by the $configureBootstrap
     *     function prior to loading the environment-specific configuration.
     * @param {Object} options An object containing option values.
     *
     * @return {null}
     */

    var keys,
        overrides;

    if (TP.boot.$notValid(options)) {
        return;
    }

    keys = Object.keys(options);

    // If we've been here already then merge in any new values being provided.
    overrides = TP.sys.overrides;
    if (TP.boot.$isValid(overrides)) {
        // Two key phases here are launch() params and URL values. URL values
        // come second (so we can honor boot.nourlargs from launch()) but do
        // outrank launch parameters when they exist so we just map over.
        keys.forEach(function(key) {
            var value = options[key];

            if (Object.prototype.toString.call(value) === '[object Object]') {
                Object.keys(value).forEach(function(subkey) {
                    var name = key + '.' + subkey;

                    overrides[name] = value[subkey];
                });
            } else {
                overrides[key] = value;
            }
        });
    }

    // Set the actual configuration values for anything we've been provided
    keys.forEach(function(key) {
        var value = options[key];

        if (Object.prototype.toString.call(value) === '[object Object]') {
            Object.keys(value).forEach(function(subkey) {
                var name = key + '.' + subkey;

                TP.boot.$stdout('Setting override for: ' + name + ' to: \'' +
                    value[subkey] + '\'', TP.TRACE);

                TP.sys.setcfg(name, value[subkey], false, true);
            });
        } else {
            TP.boot.$stdout('Setting override for: ' + key + ' to: \'' +
                value + '\'', TP.TRACE);
            TP.sys.setcfg(key, value, false, true);
        }
    });

    TP.boot.$$argsDone = activate;

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$configureProject = function() {

    var doc,
        package;

    doc = TP.boot.$$bootxml;
    package = doc.getElementsByTagName('package')[0];

    if (TP.boot.$isEmpty(package)) {
        //  Going to have problems. Without package data we have no home page
        //  name etc. so we'll have to default to something.
        TP.sys.setcfg('project.name', 'default');
        TP.sys.setcfg('project.version', '0.0.1');
    } else {
        //  project.* values track the name, controller type and version for the
        //  current project
        TP.sys.setcfg('project.name',
            package.getAttribute('name'));
        TP.sys.setcfg('project.controller',
            package.getAttribute('controller'));
        TP.sys.setcfg('project.version',
            package.getAttribute('version') || '0.0.1');
    }

    if (TP.boot.$notValid(TP.sys.cfg('project.rootpage'))) {
        TP.sys.setcfg('project.rootpage', '~app_html/UIROOT.xhtml');
    }

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$configureTarget = function() {

    /**
     * @name $configureTarget
     * @return {null}
     */

    var doc,
        config;

    //  if we don't have a config property we'll try to get default
    config = TP.sys.cfg('boot.config');

    if (TP.boot.$isEmpty(config)) {
        doc = TP.boot.$$bootxml;
        config = TP.boot.$getDefaultConfig(doc);
        TP.sys.setcfg('boot.config', config);
    }

    TP.boot.$$bootconfig = config;

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$updateDependentVars = function() {

    var level;

    // Logging level drives how the UI looks, so it needs to be updated.
    level = TP.sys.cfg('log.level');
    if (level < TP.TRACE || level > TP.SYSTEM) {
        // Reset and warn.
        TP.sys.setcfg('log.level', TP.WARN, false, true);
        TP.boot.$$loglevel = TP.WARN;
        TP.boot.$computeLogBufferSize();
            TP.boot.$stdout('Invalid log.level: ' + level +
                '. Forcing to TP.WARN', TP.WARN);
    } else {
        TP.boot.$$loglevel = level;
    }

    // Debugging and verbosity flags control visible output in the logs.
    TP.$DEBUG = TP.sys.cfg('tibet.$debug', false);
    TP.$VERBOSE = TP.sys.cfg('tibet.$verbose', false);
    TP.$$DEBUG = TP.sys.cfg('tibet.$$debug', false);
    TP.$$VERBOSE = TP.sys.cfg('tibet.$$verbose', false);

    TP.boot.$debug = TP.sys.cfg('boot.$debug', false);
    TP.boot.$verbose = TP.sys.cfg('boot.$verbose', false);
    TP.boot.$$debug = TP.sys.cfg('boot.$$debug', false);
    TP.boot.$$verbose = TP.sys.cfg('boot.$$verbose', false);

    //  one key thing regarding proper booting is that when we're not using
    //  twophase booting we'll set phasetwo to true at the configuration
    //  level so that no node filtering of phase two nodes is done. the
    //  result is that the system thinks we're in both phase one and phase
    //  two from a node filtering perspective
    TP.sys.setcfg('boot.phasetwo', TP.sys.cfg('boot.twophase') === false);

    // Reconfigure the color scheme based on any updates to the log colors.
    TP.boot.$$theme = {
        trace: TP.sys.cfg('log.tracecolor'),
        info: TP.sys.cfg('log.infocolor'),
        warn:  TP.sys.cfg('log.warncolor'),
        error:  TP.sys.cfg('log.errorcolor'),
        fatal:  TP.sys.cfg('log.fatalcolor'),
        severe:  TP.sys.cfg('log.severecolor'),
        system:  TP.sys.cfg('log.systemcolor'),

        time: TP.sys.cfg('log.timecolor'),
        delta: TP.sys.cfg('log.deltacolor'),
        slow: TP.sys.cfg('log.slowcolor'),
        debug:  TP.sys.cfg('log.debugcolor'),
        verbose:  TP.sys.cfg('log.verbosecolor')
    };
};

//  ----------------------------------------------------------------------------
//  MANIFEST EXPANSION FUNCTIONS
//  ----------------------------------------------------------------------------

TP.boot.$ifUnlessPassed = function(aNode) {

    /**
     * @name $ifUnlessPassed
     * @summary Tests if and unless conditions on the node, returning true if
     *     the node passes and should be retained based on those conditions.
     *     This test is typically used to filter for the current browser
     *     environment based on TP.boot.isUA()-style tests.
     * @param {Node} aNode
     * @return {Boolean}
     */

    var j,
        condition,
        conditions,
        key,
        value,
        node,
        invalid;

    node = aNode;

    if (node.nodeType === Node.ELEMENT_NODE) {
        invalid = false;

        //  process any unless="a b c" entries on the node
        if ((condition = node.getAttribute('unless')) != null) {
            conditions = condition.split(' ');
            for (j = 0; j < conditions.length; j++) {
                key = TP.boot.$trim(conditions[j]);

                if (TP.boot.$$KV_REGEX.test(key)) {
                    key = key.split('=');
                    value = TP.boot.$getArgumentPrimitive(
                        TP.boot.$trim(key[1]));
                    key = TP.boot.$trim(key[0]);
                } else {
                    value = true;
                }

                //  special case for common filter based on TP.boot.isUA()
                if (TP.boot.$$USER_AGENT_REGEX.test(key)) {
                    condition = TP.boot.isUA.apply(this, key.split('.'));
                } else {
                    condition = TP.sys.cfg(key, TP.sys.env(key));
                }

                if (condition === value) {
                    invalid = true;
                    break;
                }
            }
        }

        //  process any if="a b c" entries on the node
        if ((condition = node.getAttribute('if')) != null) {
            conditions = condition.split(' ');
            for (j = 0; j < conditions.length; j++) {
                key = TP.boot.$trim(conditions[j]);

                if (TP.boot.$$KV_REGEX.test(key)) {
                    key = key.split('=');
                    value = TP.boot.$getArgumentPrimitive(
                        TP.boot.$trim(key[1]));
                    key = TP.boot.$trim(key[0]);
                } else {
                    value = true;
                }

                //  special case for common filter based on TP.boot.isUA()
                if (TP.boot.$$USER_AGENT_REGEX.test(key)) {
                    condition = TP.boot.isUA.apply(this, key.split('.'));
                } else {
                    condition = TP.sys.cfg(key, TP.sys.env(key));
                }

                if (TP.boot.$notValid(condition) || condition !== value) {
                    invalid = true;
                    break;
                }
            }
        }
    }

    return !invalid;
};

//  ----------------------------------------------------------------------------

TP.boot.$getElementCount = function(aNodeList) {

    /**
     * @name $getElementCount
     * @summary Returns the count of elements in a node list.
     * @param {Nodelist} aNodeList A native nodelist or array of nodes.
     * @return {Number} The number of element nodes in the list.
     */

    var node,
        count;

    count = 0;
    node = aNodeList[0];

    if (node.nodeType === Node.ELEMENT_NODE) {
        count++;
    }

    while ((node = node.nextSibling) != null) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            count++;
        }
    }

    return count;
};

//  ----------------------------------------------------------------------------

TP.boot.$uniqueNodeList = function(aNodeArray) {

    /**
     * @name $uniqueNodeList
     * @summary Removes any duplicates from the array provided so that
     *     subsequent loads of the list don't try to load things twice.
     * @param {Array } aNodeArray
     * @return {Array} The supplied Array of nodes filtered for duplicates.
     * @todo
     */

    var i,
        arr,
        dict,
        node,
        debug,
        len,
        key,
        src;

    debug = TP.sys.cfg('debug.node');
    arr = [];

    if (aNodeArray == null) {
        if (debug && TP.boot.$$verbose) {
            TP.boot.$stderr(
                    'TP.boot.$uniqueNodeList(): invalid node array.');
        }

        return arr;
    }

    dict = TP.boot.$$scripts;
    len = aNodeArray.length;

    for (i = 0; i < len; i++) {
        node = aNodeArray[i];

        if (node.nodeType === Node.ELEMENT_NODE) {
            switch (node.tagName.toLowerCase()) {
                case 'script':

                    //  not null, not empty string
                    if ((src = node.getAttribute('src')) != null) {
                        key = TP.boot.$uriExpandPath(src);

                        if (dict[key] == null) {
                            dict[key] = src;
                            arr.push(node);
                        } else {
                            if (debug && TP.boot.$$verbose) {
                                TP.boot.$stdout(
                                    TP.boot.$join(
                                        'TP.boot.$uniqueNodeList() ',
                                        'removing duplicate: ',
                                        src), TP.TRACE);
                            }
                        }
                    }
                    else    //  null/empty means should have cdata
                    {
                        arr.push(node);
                    }

                    break;

                default:

                    //  echo and other tag names are pushed along
                    arr.push(node);

                    break;
            }
        }
    }

    return arr;
};

//  ----------------------------------------------------------------------------
//  LOCAL STORAGE
//  ----------------------------------------------------------------------------

/*
*/

//  ----------------------------------------------------------------------------

TP.$BOOT_STORAGE = null;
TP.$BOOT_STORAGE_TYPE = null;
TP.$BOOT_STORAGE_NAME = '$BOOT_STORAGE';

TP.$BOOT_STORAGE_LOCALSTORAGE = 1;

//  ----------------------------------------------------------------------------

TP.boot.$escapeStorageName = function(aName) {

    return aName.replace(/_/g, '__').replace(/ /g, '_s');
};

//  ----------------------------------------------------------------------------

TP.boot.$initializeLocalStorage = function() {

    /**
     * @name $initializeLocalStorage
     * @summary Initializes the 'local' storage mechanism (found on IE8, Safari
     *     4, and Firefox 3.5) and returns a storage wrapper object to be able
     *     to get/set/remove/removeAll objects from the storage.
     * @return {Object|null} The storage 'wrapper' object or null if the
     *     storage couldn't be initialized.
     */

    var internalStore,
            storageObj;

    internalStore = window.localStorage;

    if (TP.boot.$notValid(internalStore)) {
        return null;
    }

    storageObj =
    {
        internalStore: internalStore,

        //  10MB limit on IE, 5MB limit on Moz / Safari
        size: TP.boot.isUA('IE') ? 10 * 1024 * 1024 : 5 * 1024 * 1024,

        _formatKey: function(aKey) {

                    return TP.boot.$escapeStorageName(TP.$BOOT_STORAGE_NAME) +
                            '_' +
                            TP.boot.$escapeStorageName(aKey);
                },

        get: function(aKey, aCallbackFunction) {

                    var theKey;

                    theKey = this._formatKey(aKey);

                    aCallbackFunction(this.internalStore.getItem(theKey),
                                        aKey);

                    return this.internalStore.getItem(theKey);
                },

        set: function(aKey, aValue, aCallbackFunction) {

                    var theKey;

                    theKey = this._formatKey(aKey);

                    try {
                        this.internalStore.setItem(theKey, aValue);
                    } catch (e) {
                        if (/maximum size reached/.test(e.message)) {
                            //  turn off the cache
                            TP.sys.setcfg('boot.localcache', false);
                        }

                        TP.boot.$stderr('Storage Error: ' + e.message + '.',
                                        TP.boot.$ec(e));
                    }

                    aCallbackFunction(aValue, aKey);
                },

        remove: function(aKey, aCallbackFunction) {

                    var theKey,
                            currentValue;

                    theKey = this._formatKey(aKey);

                    currentValue = this.internalStore.getItem(theKey);
                    this.internalStore.removeItem(theKey);

                    aCallbackFunction(currentValue, aKey);
                },
        removeAll: function(aCallbackFunction) {

                    this.internalStore.clear();

                    aCallbackFunction();
                }
    };

    TP.$BOOT_STORAGE = storageObj;
    TP.$BOOT_STORAGE_TYPE = TP.$BOOT_STORAGE_LOCALSTORAGE;

    return storageObj;
};

//  ----------------------------------------------------------------------------

TP.boot.$setupDOMStorage = function() {

    /**
     * @name $setupDOMStorage
     * @summary Sets up the 'dom storage' - that is, the storage mechanism that
     *     allows TIBET to cache itself locally into a programmer-controlled
     *     cache.
     * @return {Boolean} Whether or not the dom storage could be set up.
     */

    if (TP.boot.$isValid(TP.$BOOT_STORAGE)) {
        return true;
    }

    return TP.boot.$isValid(TP.boot.$initializeLocalStorage());
};

//  ----------------------------------------------------------------------------
//  IMPORT FUNCTIONS
//  ----------------------------------------------------------------------------

/*
*/

//  ----------------------------------------------------------------------------

TP.boot.$sourceImport = function(jsSrc, targetDoc, srcUrl, aCallback,
                                    shouldThrow)
{
    /**
     * @name $sourceImport
     * @summary Imports a script text which loads and integrates JS. This
     *     returns the script node used for the import. Note that the import
     *     call is synchronous, ensuring that the code is loaded prior to
     *     returning.
     * @param {String} jsSrc The JavaScript source to import.
     * @param {Document} targetDoc The HTML document that the script source will
     *     be imported into.
     * @param {String} srcUrl The source URL that the script came from (useful
     *     for debugging purposes). This defaults to 'inline' if its not
     *     supplied.
     * @param {Function} aCallback A function to invoke when done.
     * @param {Boolean} shouldThrow True to cause errors to throw a native Error
     *     so outer catch blocks will trigger.
     * @return {HTMLElement} The new 'script' element that was created to
     *     import the code.
     * @todo
     */

    var elem,
        result,

        scriptDoc,
        scriptHead,

        scriptUrl,

        tn;

    if (jsSrc == null) {
        if (srcUrl) {
            TP.boot.$stderr('Invalid script source. No content for ' +
                            TP.boot.$uriInTIBETFormat(srcUrl));
        } else {
            TP.boot.$stderr('Invalid script source.');
        }

        return null;
    }

    //  load the source the 'DOM way' so we get commented source
    elem = TP.boot.$$scriptTemplate.cloneNode(true);
    TP.boot.$loadNode = elem;

    //  ensure we keep track of the proper package/config information
    TP.boot.$loadNode.setAttribute('load_package',
                                    TP.sys.cfg('load.package', ''));
    TP.boot.$loadNode.setAttribute('load_config',
                                    TP.sys.cfg('load.config', ''));

    scriptDoc = TP.boot.$isValid(targetDoc) ?
                        targetDoc :
                        document;

    scriptHead = TP.boot.$isValid(targetDoc) ?
                        scriptDoc.getElementsByTagName('head')[0] :
                        TP.boot.$$head;

    scriptUrl = TP.boot.$isValid(srcUrl) ? srcUrl : 'inline';

    //  set a reference so when/if this errors out we'll get the right
    //  url reference
    TP.boot.$$onerrorURL = scriptUrl;

    try {
        if (TP.boot.isUA('IE')) {
            //  set the 'text' property of the new script element. this
            //  loads the code synchronously and makes it available to the
            //  system.
            elem.text = jsSrc;
        } else {
            tn = scriptDoc.createTextNode(jsSrc);
            TP.boot.$nodeAppendChild(elem, tn);
        }

        //  since we're not using the src attribute put the url on the
        //  source attribute, which TIBET uses as an alternative
        elem.setAttribute('source', scriptUrl);

        result = TP.boot.$nodeAppendChild(scriptHead, elem);
    } catch (e) {
        //  Required for IE
    } finally {
        //  appends with source code that has syntax errors or other issues
        //  won't trigger Error conditions we can catch, but they will hit
        //  the onerror hook so we can check $STATUS and proceed from there.
        if (!result || $STATUS !== 0) {
            TP.boot.$loadNode = null;

            if (shouldThrow === true) {
                if (scriptUrl === 'inline') {
                    throw new Error('Import failed in: ' + jsSrc);
                } else {
                    throw new Error('Import failed for: ' + scriptUrl);
                }
            } else {
                if (scriptUrl === 'inline') {
                    TP.boot.$stderr('Import failed in: ' + jsSrc);
                } else {
                    TP.boot.$stderr('Import failed for: ' + scriptUrl);
                }
            }

            return null;
        }

        //  clear the onerror url reference
        TP.boot.$$onerrorURL = null;
    }

    //  if we were successful then invoke the callback function
    if (typeof(aCallback) === 'function') {
        aCallback(result, $STATUS !== 0);
    }

    return result;
};

//  ----------------------------------------------------------------------------

TP.boot.$uriImport = function(targetUrl, aCallback, shouldThrow, isPackage) {

    /**
     * @name $uriImport
     * @summary Imports a target script which loads and integrates JS with the
     *     currently running "image".
     * @param {String} targetUrl URL of the target resource.
     * @param {Function} aCallback A function to invoke when done.
     * @param {Boolean} shouldThrow True to cause errors to throw a native Error
     *     so outer catch blocks will trigger.
     * @param {Boolean} isPackage True if the resource being imported is a
     *     package-level resource. This can impact cache storage logic.
     * @return {HTMLElement} The new 'script' element that was created to
     *     import the code.
     * @todo
     */

    var src,
        msg;

    if (targetUrl == null) {
        TP.boot.$stderr('InvalidURI');

        return null;
    }

    msg = 'Requested source URL not found: ';

    //  we pass actual responsibility for locating the source text to the
    //  uriLoad call, but we need to tell it that we're looking for source
    //  code so that it can make the proper decisions about cache lookup
    src = TP.boot.$uriLoad(targetUrl, TP.TEXT, 'source', true, isPackage);
    if (src == null) {
        if (shouldThrow === true) {
            throw new Error(msg + targetUrl + '.');
        } else if (shouldThrow === false) {
            //  if throw flag is explicitly false then we don't consider
            //  this to be an error, we just report it.
            TP.boot.$stdout(msg + targetUrl + '.', TP.TRACE);
        } else {
            TP.boot.$stderr(msg + targetUrl + '.');
        }

        return null;
    }

    return TP.boot.$sourceImport(src, null, targetUrl,
                                    aCallback, shouldThrow);
};

//  ----------------------------------------------------------------------------

TP.boot.$importApplication = function() {

    /**
     * @name $importApplication
     * @summary Dynamically imports application content.
     * @description This method makes heavy use of the config/build file
     *     information to construct a list of script files and inline source
     *     code to import/execute to create a running application image in the
     *     browser. Note that this method 'chains' its parts via setTimeout so
     *     that interim output can be displayed. This helps to avoid long delays
     *     without user feedback.
     * @return {null}
     */

    TP.boot.$setStage('importing');

    TP.boot.$$importPhaseOne();

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$$importComplete = function() {

    /**
     * @name $$importComplete
     * @summary Finalizes an import sequence. Called internally by the
     *     $importComponents routine.
     * @return {null}
     */

    var stage,
        win;

    //  if we've been 'importing' and the list is now empty then we're
    //  done with whatever phase we've been processing
    stage = TP.boot.$getStage();
    if (stage === 'import_phase_one' || stage === 'import_phase_two') {

        //  if TIBET has already started then this import was being done
        //  after the initial boot process so we're finished. if we're
        //  still in the startup/boot phase we've got more to do
        if (TP.sys.hasLoaded() !== true) {
            //  when we boot in two phases we've got to be sure we keep
            //  things moving forward until the entire boot is complete
            if (TP.sys.cfg('boot.twophase') === true) {
                //  NOTE that this test relies on the hook file for a
                //  "phase two page" to _NOT_ update the cfg parameter.
                //  When they load these pages set a window global in
                //  the UI frame and queue a monitor to observe the boot
                if (TP.sys.cfg('boot.phasetwo') === true) {

                    //  if we had been processing phase two then we're
                    //  done and can trigger application startup
                    TP.boot.$stdout(
                            'Phase-two component loading complete.');

                    TP.sys.hasLoaded(true);
                    TP.boot.$setStage('import_complete');

                    return TP.boot.main();
                } else {
                    TP.boot.$stdout(
                            'Phase-one component loading complete.');

                    //  NOTE that this is a possible cul-de-sac since if
                    //  no phase two page ever loads we'll just sit.
                    //  TODO: trigger a boot timer here to force a timeout

                    //  basically the question is simply what happens last,
                    //  either we finish with phase one after the phase two
                    //  page has loaded, or we finish before it. if we
                    //  finish after it arrives we can just keep right on
                    //  moving, but we want to call the function in that
                    //  frame to ensure that the page initializes
                    win = TP.sys.getWindowById(TP.sys.cfg('tibet.uiroot'));

                    if (win) {
                        if (win.$$phasetwo === true ||
                            window.$$phasetwo === true) {
                            //  if the page didn't find TIBET the function
                            //  we want to call won't be configured, and we
                            //  do it manually
                            if (TP.boot.bootPhaseTwo) {
                                TP.boot.bootPhaseTwo();
                            } else {
                                TP.boot.initializeCanvas();
                                TP.boot.$$importPhaseTwo();
                            }

                            return;
                        }
                    } else {
                        //debugger;
                    }

                    //  if we didn't find a phase two page waiting for us
                    //  then we'll just pause and wait for it. when it
                    //  arrives it will see that we're paused and it will
                    //  trigger the final phase of booting
                    TP.boot.$setStage('import_paused');
                }
            } else {
                //  if we've been booting in a single stage then we're
                //  done since all nodes are computed at one time. the
                //  next thing is to trigger the main function and get
                //  the application logic started
                TP.boot.$setStage('import_complete');

                return TP.boot.main();
            }
        } else {
            //  this branch is invoked when components load after the TIBET
            //  boot process has occurred, meaning any newly booted content
            //  is effectively an "add-on"...
            TP.boot.$stdout('Loading add-on components complete.');

            TP.boot.$setStage('import_complete');
        }

        //  turn off reporting to bootlog via TP.boot.$stderr.
        TP.boot.$stderr = TP.STDERR_NULL;
    } else {
        //debugger;
    }

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$importComponents = function(loadSync) {

    /**
     * @name $importComponents
     * @summary Dynamically imports a set of application elements read from a
     *     list of 'bootnodes' configured by the invoking function. This boot
     *     node list is a shared property on TP.boot so only one import sequence
     *     can be running at a time. Normally you'd call importPackage instead of
     *     this routine to trigger imports.
     * @param {Boolean} loadSync Should the import be done synchronously or not?
     *     Default is false so that each file is loaded via a short setTimeout.
     * @return {null}
     * @todo
     */

    var j,
        tn,
        ch,
        msg,
        level,
        nd,
        callback,
        elem,
        srcpath,
        sync,
        len,
        image,
        logpackage,
        logpath,
        source,
        cache;

    TP.boot.$loadNode = null;
    TP.boot.$loadPath = null;
    TP.boot.$loadCached = null;

    if (TP.boot.shouldStop()) {
        return;
    }

    if (TP.boot.$$bootnodes == null) {
        if (TP.boot.$debug && TP.boot.$verbose) {
            TP.boot.shouldStop('invalid component list.');
            TP.boot.$stderr(
                'TP.boot.$importComponents() ' +
                'terminated: invalid component list.', TP.FATAL);
        }
        return;
    }

    //  NOTE the shared list and index access here. This solves some of the
    //  issues around async booting without using a closure to hold it all.
    nd = TP.boot.$$bootnodes[TP.boot.$$bootindex];

    //  if we're out of nodes we can wrap things up :)
    if (TP.boot.$$bootnodes.length === 0 || nd == null) {
        return TP.boot.$$importComplete();
    }

    //  default the first time through to whatever might be configured
    sync = (loadSync == null) ? TP.sys.cfg('tibet.sync') : loadSync;

    //  keep our value so we're consistent in phase two if we're twophase
    TP.boot.$$loadsync = sync;

    //  only handle four cases here: scripts, inline source, echo tags, and
    //  config scripts. the node array should have already been expanded to
    //  'flatten' packages into place.
    tn = nd.tagName.toLowerCase();

    logpackage = nd.getAttribute('load_package');
    if (logpackage) {
        logpackage = TP.boot.$uriInTIBETFormat(logpackage).replace(
                            '.xml', '');
    }

    if (tn === 'script') {
        //  first step is to configure for proper feedback, even when the
        //  node we're processing may be deferred.
        if ((srcpath = nd.getAttribute('src')) != null) {

            //  skip duplicate imports. this normally only happens if a script
            //  ends up in both phase one and phase two for some reason (usually
            //  oversight in not properly setting up phase filters in the
            //  package).
            if (TP.boot.$$scripts[srcpath]) {

                //  re-invoke manually so we move on to the next boot node
                TP.boot.$$bootindex += 1;
                TP.boot.$displayProgress();

                if (sync) {
                    TP.boot.$importComponents(sync);
                } else {
                    setTimeout(TP.boot.$$importAsync, 0);
                }
                return;

            } else {
                TP.boot.$$scripts[srcpath] = true;
            }

            //  update the script setting so we know who's current
            TP.boot.$$script = srcpath;

            //  adjust our log path to show shorthand package/config data
            logpath = TP.boot.$join(
                        logpackage,
                        '::' +
                        nd.getAttribute('load_config'),
                        ' ',
                        srcpath.slice(srcpath.lastIndexOf('/') + 1));

            //  ignore script nodes marked defer, they'll be dyna-loaded
            //  by TIBET on request
            if (TP.sys.cfg('boot.defer') === true &&
                (nd.getAttribute('defer') === 'true' ||
                nd.getAttribute('load_deferred') === 'true')) {
                if (TP.boot.$verbose) {
                    TP.boot.$stdout('Deferring ' + logpath, TP.TRACE);
                } else {
                    TP.boot.$stdout('Deferring ' + srcpath, TP.TRACE);
                }

                //  re-invoke manually so we move on to the next boot node
                TP.boot.$$bootindex += 1;
                TP.boot.$displayProgress();

                if (sync) {
                    TP.boot.$importComponents(sync);
                } else {
                    setTimeout(TP.boot.$$importAsync, 0);
                }

                return;
            }
        }
        else    //  tibet:script with inline code
        {
            //  update the script setting so we know who's current
            TP.boot.$$script = 'inline';

            //  adjust our log path to show shorthand package/config data
            logpath = TP.boot.$join(logpackage,
                            '::',
                            nd.getAttribute('load_config'),
                            ' inline <', tn, '> source');
        }

        //  if we've reached this point then we're not deferring the node so
        //  get the logging and prep work done in anticipation of having the
        //  source to actually load. Doing this here avoids having to have
        //  an overly complex callback function when we've got to go over
        //  the wire to get the actual source before we can import.
        TP.boot.$stdout('Loading ' + (srcpath ? srcpath : logpath), TP.TRACE);

        //  trigger the appropriate "will" hook
        if (srcpath) {
            TP.boot.$loadPath = srcpath;
            TP.boot.$$loadpaths.push(srcpath);
        } else {
            TP.boot.$loadPath = null;
        }

        //  set the configuration values so the sourceImport call will have
        //  the information from the current node being processed
        TP.sys.setcfg('load.package',
                        nd.getAttribute('load_package') || '');
        TP.sys.setcfg('load.config',
                        nd.getAttribute('load_config') || '');

        //  In some sense the rest of this is all about getting the source
        //  code to import, either inlined, from the local cache, or from
        //  the original location, in either condensed or commented format.
        //  Once the source is available we can then treat it consistently
        //  by invoking the sourceImport call to do the actual work.

        if ((srcpath = nd.getAttribute('src')) != null) {
            //  debuggers like Firebuggy have issues with script nodes that
            //  have inline source instead of file references (or they did
            //  at the time of this writing) so we allow for the option to
            //  do dom-based import here to support source-level debugging
            //  to occur. we'll keep our comments about buggy debuggers to
            //  ourselves...mostly.
            if (TP.sys.cfg('import.usingdom')) {
                elem = TP.boot.$$scriptTemplate.cloneNode(true);
                elem.setAttribute(
                            'load_package',
                            nd.getAttribute('load_package') || '');
                elem.setAttribute(
                            'load_config',
                            nd.getAttribute('load_config') || '');

                TP.boot.$loadNode = elem;

                callback = function(event) {


                    TP.boot.$loadNode = null;

                    TP.boot.$$bootindex += 1;
                    TP.boot.$displayProgress();

                    if (sync) {
                        TP.boot.$importComponents(sync);
                    } else {
                        setTimeout(TP.boot.$$importAsync, 0);
                    }
                };

                if (TP.boot.isUA('IE')) {
                    elem.onreadystatechange = function() {

                        if (elem.readyState === 'loaded' ||
                            elem.readyState === 'complete') {
                            callback();
                        }
                    };
                } else {
                    elem.onload = callback;
                }

                if (TP.sys.cfg('import.check_404')) {
                    if (!TP.boot.$uriExists(TP.boot.$loadPath)) {
                        TP.boot.$stderr('404 (Not Found): ' +
                            TP.boot.$loadPath);
                        return;
                    }
                }

                elem.setAttribute('src', TP.boot.$loadPath);

                //  append it into the 'head' element so that it starts the
                //  loading process. If there is an error, it will be
                //  reported via the 'onerror' hook.
                TP.boot.$$head.appendChild(elem);

                return;
            }

            //  if source is local, remote, or modified no node-specific
            //  data is necessary to determine cacheability, but when we're
            //  in marked mode we have to look at the node to see if it's
            //  listed for refresh or not.
            cache = true;
            if (TP.sys.cfg('import.source') === 'marked') {
                //  TODO:   do we want to use a different attribute name
                //  here? or perhaps require a version string match?
                if (nd.getAttribute('refresh') !== 'true') {
                    cache = false;
                }
            }
            source = TP.boot.$uriLoad(TP.boot.$loadPath, TP.TEXT,
                                        'source', cache);
        } else {
            source = '';

            //  inline source code...NOTE that we don't normalize because if
            //  we do that some browsers like to replace CDATA sections with
            //  text nodes in a blatant disregard for standards.
            len = nd.childNodes.length;
            for (j = 0; j < len; j++) {
                ch = nd.childNodes[j];

                if (ch.nodeType === Node.CDATA_SECTION_NODE) {
                    source += ch.nodeValue || '';
                    source = TP.boot.$trim(source);
                }
            }
        }

        //  if we were handling inline code or code we found in the cache
        //  then we can import it directly now.
        try {
            TP.boot.$sourceImport(source, null, TP.boot.$loadPath);
        } catch (e) {
            //  Required for IE
        } finally {
            TP.boot.$loadNode = null;
        }

    } else if (tn === 'tibet_image') {
        //  preload images if we're configured to do that
        if (TP.sys.cfg('boot.import_images')) {
            if ((srcpath = nd.getAttribute('src')) != null) {
                logpath = TP.boot.$join(
                        logpackage,
                        '::',
                        nd.getAttribute('load_config'),
                        ' ',
                        srcpath.slice(srcpath.lastIndexOf('/') + 1));

                TP.boot.$stdout('Preloading image ' + logpath, TP.TRACE);

                image = new Image();
                image.src = srcpath;
            }
        }
    } else if (tn === 'echo') {
        //  note we do these regardless of debug/verbose settings

        level = 1 * (nd.getAttribute('level') || TP.INFO);

        //  first check for content as an attribute
        if ((msg = nd.getAttribute('message')) != null) {
            TP.boot.$stdout(msg, level);
        } else {
            //  no attribute content, must be inside the tag
            nd.normalize();
            msg = '';

            if (nd.firstChild != null) {
                msg = nd.firstChild.nodeValue || '';
                msg = TP.boot.$trim(msg);
            }

            TP.boot.$stdout(msg, level);
        }

    } else {
        //  unsupported tag name, for now we'll just ignore it
    }

    //  reset the script setting
    TP.boot.$$script = null;

    //  re-invoke manually so we move on to the next boot node
    TP.boot.$$bootindex += 1;
    TP.boot.$displayProgress();

    if (sync) {
        TP.boot.$importComponents(sync);
    } else {
        setTimeout(TP.boot.$$importAsync, 0);
    }

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$$importPhase = function() {

    var package,
        config,
        nodelist;

    // Get the list of filtered nodes by listing the assets. This action causes
    // whatever config is in place to be used to filter the expanded package.

    package = TP.boot.$$bootfile;
    config = TP.sys.cfg('boot.config');

    nodelist = TP.boot.$listPackageAssets(package, config);

    // remaining list is our workload for actual importing
    TP.boot.$stdout('Importing ' + nodelist.length + ' components.',
                   TP.SYSTEM);

    TP.boot.$$bootnodes = nodelist;
    TP.boot.$$bootindex = 0;

    TP.boot.$$workload = nodelist.length;

    //  TODO: this should happen based on a return value being provided.
    window.$$phasetwo = true;

    TP.boot.$importComponents();
/*

    TP.boot.$$importComplete();
*/

};

//  ----------------------------------------------------------------------------

TP.boot.$$importPhaseOne = function() {

    /**
     * @name $$importPhaseOne
     * @summary Imports any elements of the original boot file/config that were
     *     specific to phase one.
     * @return {Number} The number of phase one nodes imported.
     */

    TP.boot.$setStage('import_phase_one');

    //  always phaseone here, phasetwo is set to filter out phase-two nodes
    //  when we're not doing two-phased booting so we get all nodes.
    TP.sys.setcfg('boot.phaseone', true);
    TP.sys.setcfg('boot.phasetwo', TP.sys.cfg('boot.twophase') === false);

    TP.boot.$$importPhase();

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$$importPhaseTwo = function(manifest) {

    /**
     * @name $$importPhaseTwo
     * @summary Imports any elements of the original boot file/config that were
     *     specific to phase two.
     * @return {Number} The number of phase two nodes imported.
     */

    if (TP.sys.cfg('boot.twophase') !== true) {
        return;
    }

    TP.boot.$setStage('import_phase_two');

    //  update our configuration to reflect our new state or the import
    //  will continue to filter out phase-two nodes
    TP.sys.setcfg('boot.phaseone', false);
    TP.sys.setcfg('boot.phasetwo', true);

    TP.boot.$$importPhase();

    return;
};

//  ----------------------------------------------------------------------------
//  Five-0 IMPORT FUNCTIONS
//  ----------------------------------------------------------------------------

TP.boot.$config = function() {

    /**
     * @name $config
     * @summary Configures various aspects of the boot system prior to final
     * expansion and importing of the application's components.
     * @todo
     */

    TP.boot.$setStage('configuring');

    //  loads the bootstrap file which typically contains profile and lib_root
    //  data. with those two values the system can find the primary package and
    //  configuration that will ultimately drive what we load.
    TP.boot.$configureBootstrap();

    // Update any cached variable content. We do this each time we've read in
    // new configuration values regardless of their source.
    TP.boot.$updateDependentVars();

    //  find and initially process the boot package/config we'll be booting.
    TP.boot.$configurePackage();

    // Update any cached variable content. We do this each time we've read in
    // new configuration values regardless of their source.
    TP.boot.$updateDependentVars();

    //  setup any local cache storage and adjust settings for import/export
    TP.boot.$configureLocalCache();

    //  ensure we know what the proper package config value is going to be
    TP.boot.$configureTarget();

    //  set project.* properties necessary for final startup of the UI.
    TP.boot.$configureProject();

    //  log the environment settings.
    if (TP.sys.cfg('log.bootenv')) {
        TP.boot.$stdout(TP.sys.cfg('boot.uichunked'), TP.TRACE);
        TP.boot.$stdout('TIBET Environment Variables', TP.TRACE);
        TP.boot.$stdout(TP.sys.cfg('boot.uichunked'), TP.TRACE);
        TP.boot.$stdout(TP.sys.environment, TP.TRACE);
    }

    //  log configuration settings and any overrides from the user.
    if (TP.sys.cfg('log.bootcfg')) {
        TP.boot.$stdout(TP.sys.cfg('boot.uichunked'), TP.TRACE);
        TP.boot.$stdout('TIBET Configuration Variables', TP.TRACE);
        TP.boot.$stdout(TP.sys.cfg('boot.uichunked'), TP.TRACE);
        TP.boot.$stdout(TP.sys.configuration, TP.TRACE);

        TP.boot.$stdout(TP.sys.cfg('boot.uichunked'), TP.TRACE);
        TP.boot.$stdout('TIBET Configuration Overrides', TP.TRACE);
        TP.boot.$stdout(TP.sys.cfg('boot.uichunked'), TP.TRACE);
        TP.boot.$stdout(TP.sys.overrides, TP.TRACE);
    }

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$expand = function( ) {

    var file,
        config;

    TP.boot.$setStage('expanding');

    file = TP.boot.$$bootfile;
    config = TP.sys.cfg('boot.config');

    TP.boot.$stdout('Expanding package#config: ' + file + '#' + config,
                   TP.TRACE);
    TP.boot.$expandPackage(file, config);

    return;
};

//  ----------------------------------------------------------------------------
//  ----------------------------------------------------------------------------
//  ----------------------------------------------------------------------------
//  ----------------------------------------------------------------------------

TP.boot.$$configs = [];
TP.boot.$$packageStack = [];

TP.boot.$$assets = {};
TP.boot.$$packages = {};
TP.boot.$$paths = {};

TP.boot.$$assets_list = null;


/**
 * Expands a single package configuration, resolving any embedded package
 * references and virtual paths which might be included.
 * @param {Element} anElement The config node to process and expand.
 */
TP.boot.$expandConfig = function(anElement) {

    var list;

    list = Array.prototype.slice.call(anElement.childNodes, 0);
    list.forEach(function(child) {

        var ref,
            src,
            config,
            key,
            name,
            elem,
            value,
            level,
            text,
            msg,
            str,
            doc;

        if (child.nodeType === 1) {

            switch (child.tagName) {
                case 'config':
                    ref = child.getAttribute('ref');
                    ref = TP.boot.$expandReference(ref);
                    config = TP.boot.$documentGetElementById(
                        anElement.ownerDocument, ref);
                    if (TP.boot.$notValid(config)) {
                        throw new Error('<config> not found: ' +
                            TP.boot.$getCurrentPackage() + '#' + ref);
                    }

                    key = TP.boot.$getCurrentPackage() + '#' + ref;
                    if (TP.boot.$$configs.indexOf(key) !== -1) {
                        // A duplicate/circular reference of some type.
                        TP.boot.$stderr(
                            'Ignoring duplicate reference to: ' + key);
                        break;
                    }

                    TP.boot.$$configs.push(key);
                    TP.boot.$expandConfig(config);

                    break;
                case 'echo':
                    value = child.getAttribute('message');
                    if (TP.boot.$isEmpty(value)) {
                        try {
                            child.normalize();
                            text = child.childNodes[0];
                            value = text.data;
                        } catch (e) {
                            throw new Error('Unable to find message: ' +
                                TP.boot.$nodeAsString(child));
                        }
                    }

                    level = child.getAttribute('level');
                    if (TP.boot.$notEmpty(level)) {
                        level = ', ' + level;
                    } else {
                        level = '';
                    }

                    try {
                        str = '<script><![CDATA[' +
                            'TP.boot.$stdout(\'' +
                                value.replace(/'/g, '\'') +
                            '\'' + level + ');' +
                            ']]></script>';
                        doc = TP.boot.$documentFromString(str);
                        elem = doc.childNodes[0];

                        value = child.getAttribute('if');
                        if (TP.boot.$notEmpty(value)) {
                            elem.setAttribute('if', value);
                        }

                        value = child.getAttribute('unless');
                        if (TP.boot.$notEmpty(value)) {
                            elem.setAttribute('unless', value);
                        }

                        child.parentNode.replaceChild(elem, child);

                    } catch (e) {
                        msg = e.message;
                        throw new Error('Error expanding: ' +
                            TP.boot.$nodeAsString(child) +
                            msg);
                    }

                    break;
              case 'img':
                    // similar to default case but we need to avoid messing with
                    // data urls.
                    src = child.getAttribute('src');
                    if (TP.boot.$notEmpty(src) && src.indexOf('data:') !== 0) {
                        src = TP.boot.$getFullPath(child, src);
                        child.setAttribute('src', src);
                    }
                    break;
                case 'package':
                    src = child.getAttribute('src');
                    src = TP.boot.$getFullPath(child, src);
                    child.setAttribute('src', src);

                    config = child.getAttribute('config');
                    if (TP.boot.$notEmpty(config)) {
                        config = TP.boot.$expandReference(config);
                        child.setAttribute('config', config);
                    }

                    key = src + '#' + config;
                    if (TP.boot.$$configs.indexOf(key) !== -1) {
                        // A duplicate/circular reference of some type.
                        TP.boot.$stderr(
                            'Ignoring duplicate reference to: ' + key);
                        break;
                    }

                    TP.boot.$$configs.push(key);
                    TP.boot.$expandPackage(src, config);

                    break;
                case 'property':
                    name = child.getAttribute('name');
                    value = child.getAttribute('value');

                    if (TP.boot.$notEmpty(name) && TP.boot.$notEmpty(value)) {
                        value = TP.boot.$getArgumentPrimitive(value);
                        if (typeof value === 'string') {
                            value = TP.boot.$quoted(value);
                        }
                        try {
                            str = '<script><![CDATA[' +
                                'TP.sys.setcfg(' +
                                '\'' + name + '\', ' + value +
                                ');' +
                                ']]></script>';
                            doc = TP.boot.$documentFromString(str);
                            elem = doc.childNodes[0];

                            value = child.getAttribute('if');
                            if (TP.boot.$notEmpty(value)) {
                                elem.setAttribute('if', value);
                            }

                            value = child.getAttribute('unless');
                            if (TP.boot.$notEmpty(value)) {
                                elem.setAttribute('unless', value);
                            }

                            child.parentNode.replaceChild(elem, child);

                        } catch (e) {
                            msg = e.message;
                            throw new Error('Error expanding: ' +
                                TP.boot.$nodeAsString(child) +
                                msg);
                        }
                    }

                    break;
                case 'script':
                    /* falls through */
                case 'style':
                    /* falls through */
                case 'template':
                    /* falls through */
                default:
                    src = child.getAttribute('href');
                    if (TP.boot.$notEmpty(src)) {
                        src = TP.boot.$getFullPath(child, src);
                        child.setAttribute('href', src);
                    }
                    src = child.getAttribute('src');
                    if (TP.boot.$notEmpty(src)) {
                        src = TP.boot.$getFullPath(child, src);
                        child.setAttribute('src', src);
                    }
                    break;
            }
        }
    });
};


/**
 * Expands a package, resolving any embedded package references and virtual
 * paths which might be included.
 * @param {String} aPath The path to the package manifest file to be processed.
 * @param {String} aConfig The config ID within the package to be expanded.
 * @return {Document} An xml document containing the expanded configuration.
 */
TP.boot.$expandPackage = function(aPath, aConfig) {

    var expanded,   // The expanded path equivalent.
        doc,        // The xml DOM document object after parse.
        config,     // The ultimate config ID being used.
        node,       // Result of searching for our config by ID.
        package,    // The package node from the XML doc.
        msg;        // Error message construction variable.

    expanded = TP.boot.$isEmpty(aPath) ? TP.sys.cfg('boot.package') : aPath;
    expanded = TP.boot.$expandPath(expanded);

    TP.boot.$pushPackage(expanded);

    try {
        // If we've been through this package once before we can skip reading
        // and parsing the XML and jump directly to processing the config.
        doc = TP.boot.$$packages[expanded];
        if (!doc) {

            doc = TP.boot.$uriLoad(expanded, TP.DOM, 'manifest', true);
            if (!doc) {
                throw new Error('Unable to read package: ' + expanded);
            }

            TP.boot.$$packages[expanded] = doc;
        }

        // If the package isn't valid stop right here.
        package = doc.getElementsByTagName('package')[0];
        if (TP.boot.$notValid(package)) {
            return;
        }

        // Verify package has a name and version, otherwise it's not valid.
        if (TP.boot.$isEmpty(package.getAttribute('name'))) {
            throw new Error('Missing name on package: ' +
                TP.boot.$nodeAsString(package));
        }

        if (TP.boot.$isEmpty(aConfig)) {
            config = TP.boot.$getDefaultConfig(doc);
        } else {
            config = aConfig;
        }

        node = TP.boot.$documentGetElementById(doc, config);
        if (!node) {
            throw new Error('<config> not found: ' +
                TP.boot.$getCurrentPackage() + '#' + config);
        }

        // Note that this may ultimately result in calls back into this routine
        // if the config in question has embedded package references.
        TP.boot.$expandConfig(node);
    } catch (e) {
        msg = e.message;
        throw new Error('Error expanding package: ' + expanded + '. ' + msg);
    } finally {
        TP.boot.$popPackage();
    }

    return doc;
};


/**
 * Expands a TIBET virtual path to its equivalent non-virtual path.
 * @param {String} aPath The path to be expanded.
 * @return {String} The fully-expanded path value.
 */
TP.boot.$expandPath = function(aPath) {

    var path,
        parts,
        virtual;

    // If we've done this one before just return it.
    path = TP.boot.$$paths[aPath];
    if (path) {
        return path;
    }

    // TIBET virtual paths all start with '~'
    if (aPath.indexOf('~') === 0) {

        if (aPath === '~') {
            return TP.boot.$getAppHead();
        } else if (aPath === '~app' ||
                   aPath === '~app_root') {
            return TP.boot.$getAppRoot();
        } else if (aPath === '~tibet' ||
                   aPath === '~lib' ||
                   aPath === '~lib_root') {
            return TP.boot.$getLibRoot();
        } else {
            parts = aPath.split('/');
            virtual = parts.shift();

            // If the path was ~/...something it's app_root prefixed.
            if (virtual === '~') {
                path = TP.boot.$getAppHead();
            } else if (virtual === '~app' ||
                virtual === '~app_root') {
                path = TP.boot.$getAppRoot();
            } else if (virtual === '~tibet' ||
                       virtual === '~lib' ||
                       virtual === '~lib_root') {
                path = TP.boot.$getLibRoot();
            } else {
                // Keys are of the form: path.app_root etc. so adjust.
                path = TP.sys.cfg('path.' + virtual.slice(1));
                if (!path) {
                    throw new Error('Virtual path not found: ' + virtual);
                }
            }

            parts.unshift(path);
            path = parts.join('/');
        }

        // Paths can expand into other virtual paths, so keep going until we
        // no longer get back a virtual path.
        if (path.indexOf('~') === 0) {
            if (path === aPath) {
                throw new Error('Virtual path is circular: ' + path);
            } else {
                path = TP.boot.$expandPath(path);
            }
        }

    } else {
        path = aPath;
    }

    // Cache the result so we avoid doing any path more than once.
    TP.boot.$$paths[aPath] = path;

    return path;
};


/**
 * Looks up a configuration reference and provides its value. This routine is
 * specifically concerned with expanding embedded property references from
 * TIBET's setcfg/getcfg operations. For command-line processing the values
 * should be provided to the instance when it is created.
 * @param {String} aRef A potential property value reference to expand.
 * @return {String} The expanded value, or the original string value.
 */
TP.boot.$expandReference = function(aRef) {

    var ref;

    if (aRef && aRef.indexOf('{') === 0) {
        ref = TP.sys.cfg(aRef.slice(1, -1));
        if (TP.boot.$isEmpty(ref)) {
            TP.boot.$stderr('Unresolved property reference: ' + aRef);
            return aRef;
        }
        return ref;
    } else {
        return aRef;
    }
};


/**
 * Returns the file name of the currently processing package.
 * @return {string} The package file name.
 */
TP.boot.$getCurrentPackage = function() {
    return TP.boot.$$packageStack[0];
};


/**
 * Returns the default configuration from the package document provided.
 * @param {Document} aPackageDoc The XML package document to use for defaulting.
 * @return {String} The configuration ID which is the default.
 */
TP.boot.$getDefaultConfig = function(aPackageDoc) {

    var package;

    package = aPackageDoc.getElementsByTagName('package')[0];
    if (TP.boot.$notValid(package)) {
        throw new Error('<package> tag missing.');
    }
    // TODO: make this default of 'base' a constant?
    return package.getAttribute('default') || 'base';
};


/**
 * Returns a full path by using any basedir information in anElement and
 * blending it with any virtual or relative path information from aPath.
 * @param {Element} anElement The element from which to begin basedir lookups.
 * @param {String} aPath The path to resolve into a full path.
 * @return {string} The fully-expanded path.
 */
TP.boot.$getFullPath = function(anElement, aPath) {

    var elem,
        base;

    if (TP.boot.$isEmpty(aPath)) {
        return;
    }

    if (TP.boot.$uriIsVirtual(aPath)) {
        return TP.boot.$uriExpandPath(aPath);
    }

    if (TP.boot.$uriIsAbsolute(aPath)) {
        return aPath;
    }

    elem = anElement;
    while (elem) {
        base = elem.getAttribute('basedir');
        if (TP.boot.$notEmpty(base)) {
            return TP.boot.$uriExpandPath(TP.boot.$uriJoinPaths(base, aPath));
        }
        elem = elem.parentNode;
    }
};


/**
 * Returns true if the element's tag name passes any asset-type filtering which
 * is in place. Asset filtering is done via tag name.
 * @param {Element} anElement The element to filter.
 */
TP.boot.$ifAssetPassed = function(anElement) {
    var tag,
        result;

    tag = anElement.tagName;

    // No assets option? Not filtering.
    if (TP.boot.$isEmpty(TP.sys.cfg('boot.assets'))) {
        return true;
    }

    // Can't traverse if we don't always clear these two.
    if (tag === 'package' || tag === 'config') {
        return true;
    }

    if (TP.boot.$notValid(TP.boot.$$assets_list)) {
        TP.boot.$$assets_list = TP.boot.$$assets.split(' ');
    }

    result = TP.boot.$$assets_list.indexOf(tag) !== -1;

    return result;
};


/**
 */
TP.boot.$ifUnlessPassedLite = function(anElement) {

    /**
     * Tests if and unless conditions on the node, returning true if the node
     * passes and should be retained based on those conditions.
     * @param {Node} anElement The element to test.
     * @return {Boolean} True if the element passes the filtering tests.
     */

    var i,
        condition,
        conditions,
        key,
        invalid;

    invalid = false;

    //  process any unless="a b c" entries on the element
    condition = anElement.getAttribute('unless');
    if (TP.boot.$notEmpty(condition)) {
        conditions = condition.split(' ');
        for (i = 0; i < conditions.length; i++) {
            key = conditions[i].trim();
            condition = TP.sys.cfg(key);
            if (condition === true) {
                invalid = true;
                break;
            }
        }
    }

    //  process any if="a b c" entries on the element
    condition = anElement.getAttribute('if');
    if (TP.boot.$notEmpty(condition)) {
        conditions = condition.split(' ');
        for (i = 0; i < conditions.length; i++) {
            key = conditions[i].trim();

            condition = TP.sys.cfg(key);
            if (TP.boot.$notValid(condition) || condition === false) {
                invalid = true;
                break;
            }
        }
    }

    return !invalid;
};


/**
 * Lists assets from a package configuration. The assets will be concatenated
 * into aList if the list is provided (aList is used during recursive calls from
 * within this routine to build up the list).
 * @param {Element} anElement The config element to begin listing from.
 * @param {Array.<>} aList The array of asset descriptions to expand upon.
 * @return {Array.<>} The asset array.
 */
TP.boot.$listConfigAssets = function(anElement, aList) {

    var list,
        result;

    // If aList is empty we're starting fresh which means we need a fresh
    // asset-uniquing dictionary.
    if (TP.boot.$notValid(aList)) {
        TP.boot.$$assets = {};
    }
    result = aList || [];

    // Don't assume the config itself shouldn't be filtered.
    if (!TP.boot.$ifUnlessPassed(anElement)) {
        return result;
    }

    list = Array.prototype.slice.call(anElement.childNodes, 0);
    list.forEach(function(child) {

        var ref,
            src,
            config;

        if (child.nodeType === 1) {

            if (!TP.boot.$ifUnlessPassed(child)) {
                return;
            }

            if (!TP.boot.$ifAssetPassed(child)) {
                return;
            }

            switch (child.tagName) {
                case 'config':
                    ref = child.getAttribute('ref');

                    config = TP.boot.$documentGetElementById(
                        anElement.ownerDocument, ref);
                    if (TP.boot.$notValid(config)) {
                        throw new Error('<config> not found: ' + ref);
                    }
                    TP.boot.$listConfigAssets(config, result);
                    break;
                case 'echo':
                    // Shouldn't exist, these should have been converted into
                    // <script> tags calling TP.boot.$stdout.
                    break;
                case 'package':
                    src = child.getAttribute('src');
                    config = child.getAttribute('config');

                    if (TP.boot.$isEmpty(src)) {
                        throw new Error('<package> missing src: ' +
                            TP.boot.$nodeAsString(child));
                    }

                    TP.boot.$listPackageAssets(src, config, result);
                    break;
                case 'property':
                    child.setAttribute('load_package',
                        TP.boot.$getCurrentPackage());
                    child.setAttribute('load_config',
                        anElement.getAttribute('id'));
                    result.push(child);
                    break;
                case 'img':
                    /* falls through */
                case 'script':
                    /* falls through */
                case 'style':
                    /* falls through */
                case 'template':
                    /* falls through */
                default:
                    src = child.getAttribute('src') ||
                        child.getAttribute('href');
                    if (TP.boot.$notEmpty(src)) {
                        // Unique the things we push by checking and caching
                        // entries as we go.
                        if (TP.boot.$notValid(TP.boot.$$assets[src])) {
                            TP.boot.$$assets[src] = src;
                            child.setAttribute('load_package',
                                TP.boot.$getCurrentPackage());
                            child.setAttribute('load_config',
                                anElement.getAttribute('id'));
                            result.push(child);
                        } else {
                            TP.boot.$stdout('Skipping duplicate asset: ' + src,
                                           TP.WARN);
                        }
                    } else {
                        child.setAttribute('load_package',
                            TP.boot.$getCurrentPackage());
                        child.setAttribute('load_config',
                            anElement.getAttribute('id'));
                        result.push(child);
                    }
                    break;
            }
        }
    });

    return result;
};


/**
 * Lists assets from a package configuration. The assets will be concatenated
 * into aList if the list is provided (aList is used during recursive calls from
 * within this routine to build up the list).
 * @param {string} aPath The path to the package manifest to list.
 * @param {string} aConfig The ID of the config in the package to list.
 * @param {Array.<>} aList The array of asset descriptions to expand upon.
 * @return {Array.<>} The asset array.
 */
TP.boot.$listPackageAssets = function(aPath, aConfig, aList) {

    var path,
        config,
        doc,
        node,
        result;

    path = TP.boot.$isEmpty(aPath) ? TP.sys.cfg('boot.package') : aPath;
    path = TP.boot.$expandPath(path);

    TP.boot.$pushPackage(path);

    try {
        doc = TP.boot.$$packages[path];
        if (TP.boot.$notValid(doc)) {
            throw new Error('Can not list unexpanded package: ' + aPath);
        }

        // Determine the configuration we'll be listing.
        if (TP.boot.$isEmpty(aConfig)) {
            config = TP.boot.$getDefaultConfig(doc);
        } else {
            config = aConfig;
        }

        node = TP.boot.$documentGetElementById(doc, config);
        if (TP.boot.$notValid(node)) {
            throw new Error('<config> not found: ' + path + '#' + config);
        }

        // If aList is empty we're starting fresh which means we need a fresh
        // asset-uniquing dictionary.
        if (!aList) {
            TP.boot.$$assets = {};
        }
        result = aList || [];
        TP.boot.$listConfigAssets(node, result);
    } finally {
        TP.boot.$popPackage(aPath);
    }

    return result;
};


/**
 * Pops an entry off the current stack of packages which are being processed as
 * part of an expansion.
 */
TP.boot.$popPackage = function() {
    return TP.boot.$$packageStack.shift();
};


/**
 * Pushes a package path onto the currently processing package name stack.
 * @param {string} aPath The package's full path.
 */
TP.boot.$pushPackage = function(aPath) {
    TP.boot.$$packageStack.unshift(aPath);
};


//  ----------------------------------------------------------------------------
//  ----------------------------------------------------------------------------
//  ----------------------------------------------------------------------------
//  ----------------------------------------------------------------------------

TP.boot.$import = function() {

    TP.boot.$setStage('importing');

    // Clear script dictionary. This will be used to unique across all imports.
    TP.boot.$$scripts = {};

    TP.boot.$$importPhaseOne();

    return;
};

//  ----------------------------------------------------------------------------
//  BOOT FUNCTIONS
//  ----------------------------------------------------------------------------

TP.boot.boot = function() {

    /**
     * @name boot
     * @summary Triggers the actual boot process. This function is typically
     *     invoked by the launch() function after all pre-configuration work has
     *     been completed and the boot UI elements have been found/initialized.
     * @todo
     */

    //  perform any additional configuration work necessary before we boot.
    TP.boot.$config();

    //  expand the manifest in preparation for importing components.
    TP.boot.$expand();

    //  import based on expanded package. startup is invoked once the async
    //  import process completes.
    TP.boot.$import();

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.launch = function(options) {

    /**
     * @name launch
     * @summary Launches a new TIBET application. By default TIBET launches with
     *     the boot console visible, without using a login page, and assuming
     *     defaults for all other boot-prefixed startup parameters. The options
     *     here allow you to change any setting you like, however these settings
     *     are overridden by any placed on the URL unless you specify nourlargs
     *     in this option list (which is useful in certain production setups).
     * @param {Object} options A set of options which control the boot process.
     *     Common keys used by this function include 'uselogin' and 'parallel'.
     *     Other keys are passed through to boot(), config() et al.
     * @return {Window} The window the application launched in.
     * @todo
     */

    var nologin;

    TP.boot.$$launchOptions = options;

    //  set up the environment variables appropriate for the browser. this
    //  information can then help drive the remaining parts of the process
    TP.boot.$configureEnvironment();

    //  Process each option provided as a configuration parameter setting.
    //  NOTE that this has to happen before we setStage since that triggers
    //  things like app_root and lib_root computations which must be allowed to
    //  vary via launch options.
    if (options) {
        TP.boot.$$configureOverrides(options);
        TP.boot.$updateDependentVars();
    }

    TP.boot.$stdout(TP.sys.cfg('boot.uisection'), TP.SYSTEM);
    TP.boot.$stdout('TIBET Boot System (TBS) v' + TP.boot.$bootversion,
                    TP.SYSTEM);
    TP.boot.$stdout(TP.sys.cfg('boot.uisection'), TP.SYSTEM);

    try {
        //  set the initial stage. this will also capture a start time.
        TP.boot.$setStage('prelaunch');
    } catch (e) {
        if (window.location.protocol.indexOf('file') === 0) {
            // File launch issue.
            if (TP.boot.isUA('chrome')) {
                TP.boot.$stderr(
                    'File launch aborted. ' +
                    'On Chrome you need to start the browser with ' +
                    'the --allow-file-access-from-files flag.',
                    TP.FATAL);
            } else if (TP.boot.isUA('firefox')) {
                TP.boot.$stderr(
                    'File launch aborted. ' +
                    'On Firefox you must set the config flag ' +
                    '\'security.fileuri.strict_origin_policy\' to false,' +
                    ' via about:config, quit the browser and restart.',
                    TP.FATAL);
            } else {
                TP.boot.$stderr(
                    'File launch aborted. Check browser security settings.',
                    TP.FATAL);
            }
            return;
        }
    }

    // If the browser is considered obsolete we can stop right now.
    if (TP.boot.isObsolete()) {
        TP.boot.$stderr('Obsolete browser/platform: ' + TP.$agent +
            '. Boot sequence terminated.', TP.FATAL);
        return;
    }

    // If the initial coded launch options didn't tell us to ignore the URL
    // we'll process it for any overrides and update based on any changes. The
    // argument 'true' here tells the system to activate override checking.
    if (TP.sys.cfg('boot.nourlargs') !== true) {
        TP.boot.$$configureOverrides(
            TP.boot.getURLArguments(top.location.toString()), true);
        TP.boot.$updateDependentVars();
    }

    //  Regardless of any ignore URL arg settings avoid cycling when the
    //  login page was the first page into the user interface (double-click,
    //  bookmark, shortcut, etc.)
// TODO: rename 'L' property to be more unique
    nologin = /\?L=false/.test(window.location.toString());
    TP.sys.setcfg('boot.uselogin', !nologin);

    //  now that both option lists have been set we can proceed with the
    //  startup sequence.

    //  don't boot TIBET twice into the same window hierarchy, check to make
    //  sure we don't already see the $$tibet window reference
    if (window.$$tibet !== null && window.$$tibet !== window) {
        //  make sure the user sees this
        TP.boot.$stderr('Found existing TIBET image in ' +
            (typeof(window.$$tibet.getFullName) === 'function') ?
                window.$$tibet.getFullName() :
                window.$$tibet.name +
                '. Boot sequence terminated.', TP.FATAL);
        return;
    }

    //  warn about unsupported platforms but don't halt the boot process
    if (!TP.boot.isSupported()) {
        TP.boot.$stderr('Unsupported browser/platform: ' + TP.$agent +
        '. You may experience problems.');
    }

    // configure the UI root. Once this is confirmed (which may require async
    // processing) the rest of the boot sequence will continue.
    TP.boot.$uiRootConfig();
};

//  ----------------------------------------------------------------------------

TP.boot.main = function() {

    /**
     * @name main
     * @summary Invoked when all booting has been completed. The primary
     *     purpose of this function is to hide any boot-time display content
     *     and then invoke the TP.sys.activate method to cause the system to
     *     initialize.
     * @return {null}
     */

    var elem;

    elem = TP.boot.$getBootLogElement();
    if (TP.boot.$isElement(elem)) {
        elem.parentElement.className = 'edge done';
    }

    if (TP.boot.shouldStop()) {
        TP.boot.$flushLog(true);
        return;
    }

    if (TP.sys.cfg('boot.pause')) {
        TP.boot.$setStage('paused');
        TP.boot.$displayStatus('Paused via boot.pause setting.');
        return;
    }

    if (TP.boot.$$logpeak > TP.WARN && TP.sys.cfg('boot.pause_on_error')) {
        TP.boot.$setStage('paused');
        TP.boot.$displayStatus('Paused via boot.pause_on_error w/boot errors.');
        return;
    }

    TP.boot.$activate();
};

//  ----------------------------------------------------------------------------

TP.boot.$activate = function() {

    TP.boot.$setStage('activating');

    try {
        //  ---
        //  protect the codebase from inadvertent exits
        //  ---

        //  Note that this logic is here for the Mozilla and IE browsers.
        //  Webkit-based browsers (Safari and Chrome) use a different
        //  mechanism that requires this hook to be placed on all visible
        //  windows and iframes. That logic has been written to look for the
        //  same property on the top-level window as Mozilla and IE
        //  handlers, so the logic has the same effect.
        TP.windowInstallOnBeforeUnloadHook(window);

        //  make sure that the application knows about online/offline
        //  events.
        TP.windowInstallOnlineOfflineHook(window);

        //  make sure that the application knows about document visibility
        //  events.
        TP.windowInstallDocumentVisibilityHook(window);

        try {
            //  now that app really did load, tell the TP.sys object to
            //  activate its loaded components. Methods downstream of this
            //  call will complete the boot sequence from within the kernel.
            TP.sys.activate();
        } catch (e2) {
            TP.boot.$stderr('Error activating application.',
                TP.boot.$ec(e2));
        }
    } catch (e) {
        TP.boot.$stderr('Error activating application.', TP.boot.$ec(e));
    }

    return;
};

//  ----------------------------------------------------------------------------

TP.boot.$stageAction = function() {

    /**
     * Responds to actions from within the various boot display pages. When a
     * particular stage pauses the UI this routine is typically attached as the
     * onclick handler for one or more components in the UI. The user can
     * restart and/or resume the boot sequence by triggering this handler.
     */

    switch (TP.boot.$getStage()) {
        case 'paused':
            TP.boot.$$restarttime = new Date();
            TP.boot.$stdout('Startup process reengaged by user.', TP.SYSTEM);
            TP.boot.$activate();
            break;
        case 'import_paused':
            // Happens in two-phase booting when waiting for login to return us
            // a hook file to trigger the second phase of the boot process.
            // TODO: is there a 'user accessible' trigger we want to add here?
            break;
        default:
            break;
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$uiRootConfig = function() {

    /**
     * @name $uiRootConfig
     * @summary Confirms a UIROOT can be found, and configures one it necessary.
     *     Configuration requires asynchronous loading so this routine is the
     *     first half of a pair of routines, the other being $uiRootReady.
     * @todo
     */

    var uiRootID,
        uiFrame,
        lastBodyChildren,
        lastBodyChild,
        isXHTML,
        path,
        iFrameWrapper,
        elemDoc;

    // Look for the designated (or default) UI root frame.
    uiRootID = TP.sys.cfg('tibet.uiroot') || 'UIROOT';
    uiFrame = TP.boot.$getUIElement(uiRootID);

    // If the frame is found this is simple and synchronous. Just invoke the
    // second stage routine directly.
    if (TP.boot.$isValid(uiFrame)) {
        TP.boot.$uiRootReady();
        return;
    }

    TP.boot.$stdout('Unable to locate ' + uiRootID + ', generating it.',
        TP.TRACE);

    // TODO: Verify we need this instead of just body.appendChild. We used
    // to have to work around a bug in IE.
    lastBodyChildren = document.body.children;
    lastBodyChild = lastBodyChildren[lastBodyChildren.length - 1];

    isXHTML = /\.xhtml/.test(TP.sys.$pathname);
    if (isXHTML) {
        //  Create an XHTML version of the iframe

        //  Create a wrapper span and then set the 'innerHTML' of it
        //  to an iframe. This causes the underlying iframe
        //  document, etc. to be created.

        //  We create a 'span' wrapper for the root iframe, mostly
        //  because it's necessary when creating the XHTML version
        //  of the iframe.
        iFrameWrapper = document.createElement('span');
        lastBodyChild.parentNode.insertBefore(iFrameWrapper,
                                                lastBodyChild);

        //  Set the innerHTML of the span wrapper. This will create
        //  the iframe. Then set the 'src' attribute to a 'data:'
        //  URL containing an encoded XHTML document.
        iFrameWrapper.innerHTML = '<iframe id="' + uiRootID + '">';
        path = TP.boot.$uriExpandPath(TP.sys.cfg('tibet.iframepage'));
        iFrameWrapper.firstChild.setAttribute('src', path);

        iFrameWrapper.firstChild.onload = function() {

            var elemDoc;

            //  grab the 'object' element by ID - that'll be the
            //  root 'iframe'.
            uiFrame = document.getElementById(uiRootID);
            elemDoc = uiFrame.contentDocument;

            //  For some reason, these properties don't get wired on
            //  any browser.
            uiFrame.contentWindow = elemDoc.defaultView;
            window.frames[uiRootID] = elemDoc.defaultView;

            TP.boot.$uiRootReady();
        };

    } else {
        //  Create an HTML version of the iframe

        //  dynamically generate the internal IFRAME element
        uiFrame = document.createElement('iframe');
        uiFrame.setAttribute('id', uiRootID);

        //  Make IE happy - no bezeled borders!
        uiFrame.setAttribute('frameborder', '0');

        lastBodyChild.parentNode.insertBefore(uiFrame, lastBodyChild);

        elemDoc = uiFrame.contentDocument;
        elemDoc.open('text/html', 'replace');
        elemDoc.write('<html><head></head><body></body></html>');
        elemDoc.close();

        TP.boot.$uiRootReady();
    }
};

//  ----------------------------------------------------------------------------

TP.boot.$uiRootReady = function() {

    /**
     * @name $uiRootReady
     * @summary Called to complete the process of launching a new TIBET
     *     application once the UI root frame is loaded.
     * @todo
     */

    var uiRootID,
        win,
        login,
        parallel,
        file;

    uiRootID = TP.sys.cfg('tibet.uiroot') || 'UIROOT';
    win = TP.sys.getWindowById(uiRootID);

    if (TP.boot.$notValid(win)) {
        TP.boot.$stdout(
            'Unable to locate uiroot, defaulting to current window.', TP.WARN);
        win = window;
    }

    login = TP.sys.cfg('boot.uselogin');
    if (login !== true) {
        //  without a login sequence there won't be a page coming back to
        //  say that we're authenticated for phase two, we have to do that
        //  manually here.
        win.$$phasetwo = true;

        TP.boot.boot();
    } else {
        //  login was explicitly true
        file = TP.sys.cfg('boot.loginpage');
        file = TP.boot.$uriExpandPath(file);

        parallel = TP.sys.cfg('boot.parallel');
        if (parallel === false) {
            //  sequential login means we don't start booting, we just
            //  have to put the login page into place and rely on the page
            //  that comes back to re-start the boot sequence without
            //  needing a login (since it just completed)...

            //  NOTE 'window' here, not win, is intentional
            window.location.replace(file);
        } else {
            //  parallel booting means we'll put the login page into the
            //  ui canvas while booting in the background. The login
            //  response must set $$phasetwo to allow booting to proceed
            //  beyond the first phase.
            TP.boot.showUICanvas(file);
            TP.boot.boot();
        }
    }

    return;
};


//  ----------------------------------------------------------------------------
//  Export
//  ----------------------------------------------------------------------------

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


/* copyright added via build process */

/**
 * When you use TIBET you're using a shared codebase and dataset stored in
 * a separate code frame while your user interface is typically drawn in
 * an independent UI frame. To connect the UI frame to the shared codebase
 * TIBET leverages this "hook file", which either finds TIBET or boots it as
 * needed.
 *
 * You should place a reference to this file in the head of any full page
 * that you will load into your UI frame directly. NOTE that this file isn't
 * needed in content that will be used as part of a larger DOM structure.
 * Only the outermost documents you load at the window level require this
 * reference if they will be calling on TIBET code from within the page.
 */

/* jshint debug:true,
          eqnull:true,
          maxerr:999
*/
/* global Window:true,
          $$checked:true,
          $$tibet:true,
          $$getNextWindow:true,
          $$findTIBET:true,
          $$init:true,
          init:true,
          CSS2Properties:false,
          CSSPrimitiveValue:false,
          Document:false,
          XMLDocument:false
*/

;(function(root) {

//  ------------------------------------------------------------------------
//  PRIVATE GLOBALS
//  ------------------------------------------------------------------------

//  window search routine will use this to avoid recursions
$$checked = null;

//  the tibet window reference, configured by the $$findTIBET() call when it
//  can locate a TIBET installation. if this variable is set it identifies
//  the shared codebase for the application.
$$tibet = null;

//  save old error handler.
window.offerror = window.onerror;

window.onerror = function(msg, url, line, column, errorObj) {
    var str;

    try {
        str = msg || 'Error';
        str += ' in file: ' + url + ' line: ' + line + ' column: ' + column;

        if (errorObj) {
            str += '\nSTACK:\n' + errorObj.stack;
        }

        // specifically watch for file launch issues.
        if (window.location.protocol.indexOf('file') === 0) {
            if (window.onerror.failedlaunch) {
                return;
            }
            window.onerror.failedlaunch = true;
            //alert('File launch error. Check browser security settings.');
        } else {
            top.console.error(str);
        }
    } catch (e) {
        // don't let log errors trigger recursion, but don't bury them either.
        top.console.error('Error logging onerror: ' + e.message);
        top.console.error(str || msg);
    }

    return false;
};

//  ------------------------------------------------------------------------
//  TIBET DETECTION
//  ------------------------------------------------------------------------

/*
Routines which can search through a set of windows, frames in a frameset, or
iframes in an attempt to locate the shared TIBET code frame.
*/

//  ------------------------------------------------------------------------

$$getNextWindow = function(aWindow, aTimestamp) {

    /**
     * @name $$getNextWindow
     * @synopsis Given a window reference this routine returns the next window
     *     to check when looking for a TIBET reference. This method relies
     *     heavily on the $$checked slot, which calling routines such as
     *     $$findTIBET() should set as they operate on each window.
     * @param {Window} aWindow The window to start looking for the TIBET frame
     *     in.
     * @param {String} aTimestamp The timestamp to use in the $$checked slot.
     * @return {Window} The next window to check in finding the TIBET frame.
     * @todo
     */

    var win,
        siblings,
        i;

    win = (aWindow == null) ? window : aWindow;

    //  before we start going up, can we go 'sideways'?
    if (win.parent != null && win.parent !== win) {
        siblings = win.parent.frames;
        if (siblings.length > 1) {
            //  there are siblings, see if any are unchecked...
            for (i = 0; i < siblings.length; i++) {
                //  catch block here in case we have siblings from
                //  other domains etc.
                try {
                    if (siblings[i].$$checked !== aTimestamp) {
                        return siblings[i];
                    }
                } catch (e) {
                }
            }
        }
    }

    //  check nested frames for parent reference option
    try {
        if (win.parent != null &&
            win.parent !== win &&
            win.parent.$$checked !== aTimestamp) {
            return win.parent;
        }
    } catch (e) {
    }

    //  somewhat redundant since parent should lead to this...
    try {
        if (win.top != null &&
            win.top !== win &&
            win.top.$$checked !== aTimestamp) {
            return win.top;
        }
    } catch (e) {
    }

    //  reached the top? how about an opener reference?
    try {
        if (win.opener != null &&
            win.opener !== win &&
            win.opener.$$checked !== aTimestamp) {
            return win.opener;
        }
    } catch (e) {
    }

    return;
};

//  ------------------------------------------------------------------------

$$findTIBET = function(aWindow) {

    /**
     * @name $$findTIBET
     * @synopsis Finds the TIBET code frame by traversing up the opener or
     *     parent chain until the window containing the slot named '$$TIBET' (a
     *     well known slot in the TIBET code frame that is used solely for this
     *     purpose) is found.
     * @description This function works hand-in-hand with $$getNextWindow() by
     *     setting the $$checked attribute on each frame/window as it is tested.
     *     The $$getNextWindow() call observes these and skips windows with a
     *     value matching the timestamp set at the start of this call. The use
     *     of a time allows this call to be run multiple times without causing
     *     windows to appear checked incorrectly. When a valid TIBET reference
     *     is found the window it was found in is mapped to the $$tibet
     *     variable.
     * @param {Window} aWindow The window to start looking for the TIBET frame
     *     in.
     * @return {Window} The TIBET frame.
     */

    var win,
        ts;

    if (top.$$tibet != null) {
        window.$$tibet = top.$$tibet;
        return top.$$tibet;
    } else if (top.$$TIBET === true) {
        window.$$tibet = top;
        return top;
    }

    if (window.$$tibet != null) {
        return window.$$tibet;
    } else if (window.$$TIBET === true) {
        return window;
    }

    //  start at the current window, or the window provided
    win = (aWindow == null) ? window : aWindow;

    ts = (new Date()).getTime();

    //  essentially loop up/across the window/frame hierarchy looking for
    //  either of the special keys that point to the codebase
    while (win != null) {
        try {
            win.$$checked = ts;
            if (win.$$tibet != null) {
                window.$$tibet = win.$$tibet;
                return win.$$tibet;
            } else if (win.$$TIBET === true) {
                window.$$tibet = win;
                return win;
            }
        } catch (e) {
        }

        win = $$getNextWindow(win, ts);
    }

    return;
};

//  ------------------------------------------------------------------------
//  PUBLIC GLOBALS
//  ------------------------------------------------------------------------

//  Define the only publicly available global in TIBET - 'TP'

if (self.TP == null) {

    try {
        $$findTIBET();
    } catch (e) {
        return;
    }

    //  If a window containing TIBET was found (and it wasn't ourself), wire
    //  over the TP reference.
    if (window.$$tibet && window.$$tibet !== window) {
        window.TP = window.$$tibet.TP;
    } else {
        //  If the ECMAScript5 'defineProperty' call is available, use it
        //  to try to 'protect' the 'TP', 'TP.sys' and 'TP.boot' objects
        if (Object.defineProperty) {
            //  The TP object, which holds global constants, functions,
            //  types, and supporting variable data.
            //  !!NOTE!! We make this writable for now, since this might be
            //  being used in a file that isn't part of the booting process but
            //  is loaded before TIBET is ready. We'll get the final value and
            //  lock it down towards the end of the file.
            Object.defineProperty(self, 'TP', {value: {}, writable: true});

            //  The TP.boot object, which holds functions and data needed
            //  for booting and for loading code dynamically.
            Object.defineProperty(TP, 'boot', {value: {}, writable: false});

            //  The TP.sys object, which is responsible for system data,
            //  metadata, control parameters, etc.
            Object.defineProperty(TP, 'sys', {value: {}, writable: false});
        } else {
            TP = self.TP || {};
            TP.sys = TP.sys || {};
            TP.boot = TP.boot || {};
        }
    }
}

//  ------------------------------------------------------------------------

//  mirror boot.tibetinf in tibet_boot.js to autoboot properly
TP.$$tibetinf = TP.$$tibetinf || '/html';

//  should point to the page to install when autoBoot is activated
TP.$$bootpage = TP.$$bootpage || 'index.html';

//  signaling key for "all objects or origins"
TP.ANY = TP.ANY || 'ANY';

//  ------------------------------------------------------------------------
//  OBJECT TESTING
//  ------------------------------------------------------------------------

/*
Simple testing functions for various objects and their state.
*/

//  ------------------------------------------------------------------------

TP.boot.$isElement = function(anObj) {

    /**
     * @name $isElement
     * @synopsis Returns true if the object provided is a DOM element.
     * @param {Object} anObj The object to test.
     * @return {Boolean}
     */

    return (anObj != null && anObj.nodeType === Node.ELEMENT_NODE);
};

//  ------------------------------------------------------------------------

TP.boot.$isEmpty = function(anObj) {

    /**
     * @name $isEmpty
     * @synopsis Returns true if the object is null, has 0 length, or is ''.
     * @param {Object} anObj The object to test.
     * @return {Boolean}
     */

    return (anObj == null || anObj === '' || anObj.length === 0);
};

//  ------------------------------------------------------------------------

TP.boot.$isEvent = function(anObj) {

    /**
     * @name $isEvent
     * @synopsis Returns true if the object provided is an Event object.
     * @param {Object} anObj The Object to test.
     * @return {Boolean} Whether or not the supplied object is an Event object.
     */

    return (anObj != null &&
            anObj.clientX !== undefined &&
            anObj.clientY !== undefined);
};

//  ------------------------------------------------------------------------

TP.boot.$isTrue = function(aValue) {

    /**
     * @name $isTrue
     * @synopsis Return true if the argument is the Boolean 'true'. This is a
     *     more explicit test than 'if (anObj)' since that test will often lead
     *     your code astray due to bizarre type conversions.
     * @param {Object} aValue The value to test.
     * @return {Boolean} True if aValue === true.
     */

    //  Seems pendantic, but its the best performer

    if (aValue === true) {
        return true;
    }

    if (aValue === false) {
        return false;
    }

    return (typeof(aValue) === 'boolean' && aValue.valueOf() === true);
};

//  ------------------------------------------------------------------------

TP.boot.$isValid = function(anObj) {

    /**
     * @name $isValid
     * @synopsis Returns whether or not the object is valid (that is, whether it
     *     is not undefined and not null).
     * @param {Object} anObj The object to test.
     * @return {Boolean} Whether or not anObj is valid.
     */

    return anObj != null;
};

//  ------------------------------------------------------------------------

TP.boot.$isWindow = function(anObj) {

    /**
     * @name isWindow
     * @synopsis Returns true if the object provided appears to be a valid
     *     window instance based on location and navigator slot checks.
     * @param {Object} anObj The object to test.
     * @return {Boolean} True if the object is a window.
     */

    if (anObj != null && anObj.moveBy !== undefined) {
        return true;
    }

    return false;
};

//  ------------------------------------------------------------------------

TP.boot.$notValid = function(aValue) {

    /**
     * @name $notValid
     * @synopsis Returns true if the object provided is null or undefined.
     * @param {Object} aValue The object to test.
     * @return {Boolean}
     */

    return aValue == null;
};

//  ------------------------------------------------------------------------
//  INTERNAL BROWSER CHECKS
//  ------------------------------------------------------------------------

/*
The rest of TIBET uses the TP.boot.isUA() function, these are intended to be
used only at the boot level for the hook file.
*/

//  ------------------------------------------------------------------------

//  For Safari only...
if (!self.Window) {
    Window = self.constructor;
}

//  ------------------------------------------------------------------------

TP.boot.$$isIE = function() {

    /**
     * @name $$isIE
     * @synopsis Returns true if the current browser looks like it's IE.
     * @return {Boolean}
     */

    //  trivial exclusion rule
    if (/Gecko|Konqueror|AppleWebKit|KHTML/.test(navigator.userAgent)) {
        return false;
    }

    return (/MSIE/).test(navigator.userAgent);
};

//  ------------------------------------------------------------------------

TP.boot.$$isMoz = function() {

    /**
     * @name $$isMoz
     * @synopsis Returns true if the current browser looks like it's a
     *     Mozilla-based browser.
     * @return {Boolean}
     */

    //  Firefox at least will always show an rv: and Gecko in the string.
    //  The Gecko portion is cloned a lot, but not the rv: portion.
    return (/rv:.+?Gecko/).test(navigator.userAgent);
};

//  ------------------------------------------------------------------------

TP.boot.$$isWebkit = function() {

    /**
     * @name $$isWebkit
     * @synopsis Returns true if the current browser looks like it's a
     *     Webkit-based browser.
     * @return {Boolean}
     */

    return (/Konqueror|AppleWebKit|KHTML/).test(navigator.userAgent);
};

//  ------------------------------------------------------------------------
//  TP.* patches
//  ------------------------------------------------------------------------

if (TP.boot.$notValid(TP.DOM_SIGNAL_TYPE_MAP)) {
    //  NOTE that this is duplicated in the kernel DOM primitives so if
    //  you change things here you'll want to keep the other version in
    //  sync
    TP.DOM_SIGNAL_TYPE_MAP = {
        'abort' : 'TP.sig.DOMAbort',
        'blur' : 'TP.sig.DOMBlur',
        'change' : 'TP.sig.DOMChange',
        'click' : 'TP.sig.DOMClick',
        'copy' : 'TP.sig.DOMCopy',
        'contextmenu' : 'TP.sig.DOMContextMenu',
        'cut' : 'TP.sig.DOMCut',
        'dblclick' : 'TP.sig.DOMDblClick',
        'error' : 'TP.sig.DOMError',
        'focus' : 'TP.sig.DOMFocus',
        'keydown' : 'TP.sig.DOMKeyDown',
        'keypress' : 'TP.sig.DOMKeyPress',
        'keyup' : 'TP.sig.DOMKeyUp',
        'load' : 'TP.sig.DOMLoad',
        'mousedown' : 'TP.sig.DOMMouseDown',
        'mouseenter' : 'TP.sig.DOMMouseEnter',
        //  a synthetic TIBET event
        'mousehover' : 'TP.sig.DOMMouseHover',
        'mouseleave' : 'TP.sig.DOMMouseLeave',
        'mousemove' : 'TP.sig.DOMMouseMove',
        'mouseout' : 'TP.sig.DOMMouseOut',
        'mouseover' : 'TP.sig.DOMMouseOver',
        'mouseup' : 'TP.sig.DOMMouseUp',
        //  a synthetic TIBET event
        'dragdown' : 'TP.sig.DOMDragDown',
        //  a synthetic TIBET event
        'draghover' : 'TP.sig.DOMDragHover',
        //  a synthetic TIBET event
        'dragmove' : 'TP.sig.DOMDragMove',
        //  a synthetic TIBET event
        'dragout' : 'TP.sig.DOMDragOut',
        //  a synthetic TIBET event
        'dragover' : 'TP.sig.DOMDragOver',
        //  a synthetic TIBET event
        'dragup' : 'TP.sig.DOMDragUp',
        'move' : 'TP.sig.DOMMove',
        'paste' : 'TP.sig.DOMPaste',
        'reset' : 'TP.sig.DOMReset',
        'resize' : 'TP.sig.DOMResize',
        'submit' : 'TP.sig.DOMSubmit',
        'unload' : 'TP.sig.DOMUnload'
    };

    if (TP.boot.$$isIE() || TP.boot.$$isWebkit()) {
        //  IE, safari, chrome, ...
        TP.DOM_SIGNAL_TYPE_MAP.mousewheel = 'TP.sig.DOMMouseWheel';
    }
    else    //  firefox
    {
        TP.DOM_SIGNAL_TYPE_MAP.DOMMouseScroll = 'TP.sig.DOMMouseWheel';
    }

    TP.DOM_SIGNAL_TYPE_MAP.at = function(anIndex) {

        return this[anIndex];
    };

    TP.DOM_SIGNAL_TYPE_MAP.atPut = function(anIndex, aValue) {

        this[anIndex] = aValue;

        return this;
    };
}

//  ------------------------------------------------------------------------
//  location= trap
//  ------------------------------------------------------------------------

/*
When a user clicks a link or a developer chooses to use window.location
rather than a TIBET setContent call the hook file will attempt to intercept
that operation and redirect it so that the content can be processed and
managed along with all other TIBET content.

NOTE that if you look closely you'll see that effectively the entire
remainder of the hook file is contained in the else clause of the following
if statement as a result.

NOTE ALSO: This only works for HTML documents, not XHTML documents.
*/

//  ------------------------------------------------------------------------

if (window.onerror.failedlaunch !== true &&
    window !== top &&
    top.TP != null &&
    top.TP.sys != null &&
    top.TP.sys.hasLoaded() === true &&
    top.TP.isHTMLDocument(document) === true &&
    top.TP.core.Window.$$isDocumentWriting !== true &&
    window.frameElement != null &&
    window.frameElement.hasAttribute('tibet_settinglocation') !== true) {
    //  if we're here because of a document.write then TIBET is
    //  processing the content already, otherwise we want to effectively
    //  snag the current location and ask TIBET to process that URI and
    //  return it to the current window as properly managed content
    top.TP.windowResetLocation(window);
} else {

    //  ------------------------------------------------------------------------
    //  COOKIE FUNCTIONS
    //  ------------------------------------------------------------------------

    /**
     * Basic cookie read/write operations. These aren't very sophisticated so
     * you shouldn't expect too much. It's adequate perhaps for storing
     * simple arrays or objects containing 'atomic values' only. Then again,
     * it's only expected to be used during booting, the TIBET kernel's
     * TP.core.Cookie type has more powerful routines.
     */

    //  ------------------------------------------------------------------------

    TP.boot.$formatCookieSource = function(anObj) {

        /**
         * @name $formatCookieSource
         * @synopsis Returns anObj, in JavaScript source-code format suitable
         *     for storage in a cookie.
         * @param {Object} anObj The object to format.
         * @return {String}
         */

        var str;

        if (anObj == null) {
            str = 'null';
        } else if (anObj.constructor === Date) {
            str = '"' + anObj.toString() + '"';
        } else if (anObj.constructor === String) {
            str = '"' + anObj + '"';
        } else {
            str = anObj.toString();
        }

        return str;
    };

    //  ------------------------------------------------------------------------

    TP.boot.getCookie = function(aName) {

        /**
         * @name getCookie
         * @synopsis Returns the value of the named cookie or undefined.
         * @param {String} aName The name of the desired cookie.
         * @return {String}
         */

        var cooky,
            end,
            start,
            str;

        try {
            cooky = document.cookie;
            if (cooky === '') {
                //  no cookies
                return;
            }
        } catch (e) {
            //  no cookies
            return;
        }

        start = cooky.indexOf(aName + '=');
        if (start === -1) {
            //  not found
            return;
        }

        end = cooky.indexOf(';', start + aName.length);
        if (end === -1) {
            end = cooky.length;
        }

        //  note that we decodeURI() the value and strip off the 'name=' part
        str = decodeURI(cooky.slice(start + aName.length + 1, end));

        return str;
    };

    //  ------------------------------------------------------------------------

    TP.boot.setCookie = function(aName, aValue, expiresAt, aPath, aDomain,
                                    wantsSecurity)
    {
        /**
         * @name setCookie
         * @synopsis Sets the value of the named cookie with associated params.
         *     The values and rules for the various params are documented in
         *     most JS texts. See JSTDG3 for a good discussion.
         * @param {String} aName The cookie name.
         * @param {String} aValue The cookie value.
         * @param {Date} expiresAt The cookie expiration date/time.
         * @param {String} aPath The cookie's path.
         * @param {String} aDomain An alternate cookie domain.
         * @param {Boolean} wantsSecurity Whether security is desired.
         * @return {Boolean} Whether the cookie was successfully set or not.
         */

        var cooky;

        if (aName == null || aValue == null) {
            return false;
        }

        cooky = aName + '=' + encodeURI(aValue);
        cooky += (expiresAt == null) ? '' : '; expires=' +
                                                    expiresAt.toGMTString();
        cooky += (wantsSecurity !== true) ? '' : '; secure';
        cooky += (aDomain == null) ? '' : '; domain=' + aDomain;
        cooky += (aPath == null) ? '' : '; path=' + aPath;

        try {
            document.cookie = cooky;
        } catch (e) {
            return false;
        }

        return true;
    };

    //  ------------------------------------------------------------------------
    //  BOOT PAGE FUNCTIONS
    //  ------------------------------------------------------------------------

    /*
    The standard TIBET application template, particularly the index.html page
    and prefs.html pages, contains a number of function references we share by
    keeping them here in the hook file.
    */

    //  ------------------------------------------------------------------------

    TP.boot.$byId = function(anID) {

        /**
         * @name $byId
         * @synopsis The de-facto standard $ function, a simple wrapper for
         *     document.getElementById.
         * @param {String|Element} anID The string ID to locate, or an element
         *     (which will be returned).
         * @return {Element}
         */

        if (typeof(anID) === 'string') {
            return document.getElementById(anID);
        }

        return anID;
    };

    //  ------------------------------------------------------------------------

    TP.boot.getWindowLocation = function() {

        /**
         * @name getWindowLocation
         * @synopsis Returns the window location (or the location that the
         *     system was trying to set the window to)
         * @return {String} The window's location (or attempted set location)
         */

        //  If the window is inside of an iframe, then we have to poke around a
        //  bit
        if (TP.boot.$isElement(window.frameElement)) {
            //  If TIBET is currently 'setting a location' on the iframe, it
            //  will have tagged the location string on the iframe as an
            //  attribute.
            if (window.frameElement.hasAttribute(
                                        'tibet_settinglocation') === true) {
                return window.frameElement.getAttribute(
                                        'tibet_settinglocation');
            }

            //  On Webkit-based browsers, there is a bug such that if 'content'
            //  is being document.write()n to an iframe that's nested inside of
            //  another iframe, its location will be reported with the value of
            //  the top-level window's location, not its parent's location, as
            //  is true in other browsers.
            if (window.location.toString() === top.location.toString() &&
                    window.parent !== window) {
                return window.parent.location.toString();
            }
        }

        return window.location.toString();
    };

    //  ------------------------------------------------------------------------

    TP.boot.hideContent = function(anID) {

        /**
         * @name hideContent
         * @synopsis Hides the identified element, or the current content
         *     element if no element is specified.
         * @param {String|Element} anID The element whose content should be
         *     hidden.
         * @return {null}
         */

        var elem,
            tWin;

        tWin = $$findTIBET();
        if (TP.boot.$isValid(elem =
                    TP.boot.$byId(anID || TP.boot.$$currentContentID, tWin))) {
            elem.style.display = 'none';
            if (TP.boot.$$currentContentID === anID) {
                TP.boot.$$currentContentID = null;
            }
        }
    };

    //  ------------------------------------------------------------------------

    TP.boot.hideUICanvas = function() {

        /**
         * @name hideUICanvas
         * @synopsis Hides the current tibet.uicanvas element in the
         *     application's main window.
         * @return {null}
         */

        var win;

        win = TP.sys.getWindowById(TP.sys.cfg('tibet.uicanvas'));
        if (TP.boot.$isValid(win)) {
            //  make sure iframes are hidden as well
            if (TP.boot.$isValid(win.frameElement)) {
                win.frameElement.style.visibility = 'hidden';
            }
        }
    };

    //  ------------------------------------------------------------------------

    TP.boot.hideUIRoot = function() {

        /**
         * @name hideUIRoot
         * @synopsis Hides the current tibet.uiroot element in the application's
         *     main window.
         * @return {null}
         */

        var win;

        win = TP.sys.getWindowById(TP.sys.cfg('tibet.uiroot'));
        if (TP.boot.$isValid(win)) {
            //  make sure iframes are hidden as well
            if (TP.boot.$isValid(win.frameElement)) {
                win.frameElement.style.visibility = 'hidden';
            }
        }
    };

    //  ------------------------------------------------------------------------

    TP.boot.launchApp = function() {

        /**
         * @name launchApp
         * @synopsis Forces the application's boot page into place, triggering
         *     an application startup sequence.
         * @return {null}
         */

        window.location = TP.$$bootpage;

        return;
    };

    //  ------------------------------------------------------------------------

    TP.boot.showBootLog = function() {

        /**
         * @name showBootLog
         * @synopsis Display the boot log in a separate window, available for
         *     scrolling, selection/copy, etc.
         * @return {null}
         */

        var tWin,
            tibet;

        tWin = $$findTIBET();
        if (tWin) {
            tibet = tWin.TP.sys;
            if (tibet && typeof(tibet.showBootLog) === 'function') {
                tibet.showBootLog();
            }
        }
    };

    //  ------------------------------------------------------------------------

    TP.boot.showContent = function(anID) {

        /**
         * @name showContent
         * @synopsis Shows the identified element, or the current content
         *     element if no element is specified.
         * @param {String|Element} anID The element whose content should be
         *     displayed.
         * @return {null}
         */

        var elem,
            tWin;

        tWin = $$findTIBET();

        TP.boot.hideUICanvas();
        TP.boot.hideContent(TP.boot.$$currentContentID);

        if (TP.boot.$isValid(elem = TP.boot.$byId(anID, tWin))) {
            elem.style.display = 'block';
            TP.boot.$$currentContentID = anID;
        }
    };

    //  ------------------------------------------------------------------------

    TP.boot.showUICanvas = function(aURI) {

        /**
         * @name showUICanvas
         * @synopsis Displays the current tibet.uicanvas element in the
         *     application's main window. If aURI is provided the content of
         *     that URI is placed in the canvas.
         * @param {String} aURI The URI whose content should be loaded and
         *     displayed.
         * @return {null}
         */

        var win,
            file;

        TP.boot.hideContent();

        win = TP.sys.getWindowById(TP.sys.cfg('tibet.uicanvas'));
        if (TP.boot.$isValid(win)) {
            if (TP.boot.$isValid(aURI)) {
                file = TP.boot.$uriExpandPath(aURI);

                //  pretend this page never hit the history
                window.location.replace(file);
            }

            //  make sure iframes are visible when used in this fashion
            if (TP.boot.$isValid(win.frameElement)) {
                win.frameElement.style.visibility = 'visible';
            }
        }

        return;
    };

    //  ------------------------------------------------------------------------

    TP.boot.startGUI = function() {

        /**
         * @name startGUI
         * @synopsis Triggers activation of the application's UI startup
         *     sequence. The actual boot process for loading all static
         *     elements of the application should have been completed prior to
         *     calling this function.
         * @return {null}
         */

        var tWin;

        tWin = $$findTIBET();
        if (tWin && tWin.TP.sys && tWin.main) {
            tWin.main();
        } else {
            alert('Unable to find main().');
        }

        return;
    };

    //  --------------------------------------------------------------------
    //  METADATA
    //  --------------------------------------------------------------------

    /*
    All objects which might be leveraged as 'types' including the builtins
    need to have basic metadata in TIBET. The values consist of slots for:

        TP.TYPE             Reference to the type of the receiver.

        TP.TYPEC            The type constructor, used for subtype creation.
        TP.INSTC            The inst constructor, used for instance creation.

        TP.TNAME            The type name in string form for easy access.
        TP.RNAME            The 'real' type name in JS-identifier form.

        TP.SUPER            The immediate supertype object.

        TP.ANCESTORS        Receiver's supertype list.
        TP.ANCESTOR_NAMES   Receiver's supertype names.
    */

    //  --------------------------------------------------------------------

    TP.boot.$$setupMetadata = function() {

        var registerMetadata;

        TP.NAME = '$$name';
        TP.TNAME = '$$typename';
        TP.RNAME = '$$realname';

        TP.TYPE = '$$type';

        TP.TYPEC = '$$Type';
        TP.INSTC = '$$Inst';

        TP.SUPER = '$$supertype';
        TP.ANCESTORS = '$$ancestors';
        TP.ANCESTOR_NAMES = '$$anames';

        TP.SUBTYPE_NAMES = '$$snames';
        TP.SUBTYPE_NAMES_DEEP = '$$snames_deep';
        TP.SUBTYPES = '$$subtypes';
        TP.SUBTYPES_DEEP = '$$subtypes_deep';

        registerMetadata = function (target, type,
                                        typeC, instC,
                                        tName, rName, name,
                                        superT, ancestors, ancestorNames) {

            target[TP.TYPE] = type;

            target[TP.TYPEC] = typeC;
            target[TP.INSTC] = instC;

            target[TP.TNAME] = tName;
            target[TP.RNAME] = rName;
            target[TP.NAME] = name;

            target[TP.SUPER] = superT;
            target[TP.ANCESTORS] = ancestors;
            target[TP.ANCESTOR_NAMES] = ancestorNames;
        };

        //  Here we instrument the "big 8" types native to JS so they are
        //  aware of the metadata we'll be asking for from anything we think
        //  of as a type. NOTE we use simple closure here to hide this work.

        //  ** NOTE NOTE NOTE **
        //  We use 'TP.ac()' here throughout this method because these
        //  Arrays need to be created *as TIBETan enhanced Arrays*. They
        //  will be used for reflection purposes, etc. *even if this Window
        //  is not the TIBET window*. This is why we check not only for
        //  'TP', but 'TP.ac' below.

        //  Array
        registerMetadata(
                Array, Array, Function, Function,
                'Array', 'Array', 'Array',
                Object, TP.ac(Object), TP.ac('Object'));

        //  Boolean
        registerMetadata(
                Boolean, Boolean, Function, Function,
                'Boolean', 'Boolean', 'Boolean',
                Object, TP.ac(Object), TP.ac('Object'));

        //  Date
        registerMetadata(
                Date, Date, Function, Function,
                'Date', 'Date', 'Date',
                Object, TP.ac(Object), TP.ac('Object'));

        //  Function
        registerMetadata(
                Function, Function, Function, Function,
                'Function', 'Function', 'Function',
                Object, TP.ac(Object), TP.ac('Object'));

        //  Number
        registerMetadata(
                Number, Number, Function, Function,
                'Number', 'Number', 'Number',
                Object, TP.ac(Object), TP.ac('Object'));

        //  Object
        registerMetadata(
                Object, Object, Function, Function,
                'Object', 'Object', 'Object',
                null, TP.ac(), TP.ac());

        //  RegExp
        registerMetadata(
                RegExp, RegExp, Function, Function,
                'RegExp', 'RegExp', 'RegExp',
                Object, TP.ac(Object), TP.ac('Object'));

        //  String
        registerMetadata(
                String, String, Function, Function,
                'String', 'String', 'String',
                Object, TP.ac(Object), TP.ac('Object'));

        //  The subtypes (and 'deep subtypes') of Object are the other "big 7"
        Object[TP.SUBTYPES] =
                TP.ac(Array, Boolean, Date, Function, Number, RegExp, String);
        Object[TP.SUBTYPES_DEEP] =
                TP.ac(Array, Boolean, Date, Function, Number, RegExp, String);
        Object[TP.SUBTYPE_NAMES] =
                TP.ac('Array', 'Boolean', 'Date', 'Function',
                        'Number', 'RegExp', 'String');
        Object[TP.SUBTYPE_NAMES_DEEP] =
                TP.ac('Array', 'Boolean', 'Date', 'Function',
                        'Number', 'RegExp', 'String');

        //  Now we instrument DOM-specific 'types'

        //  Window
        registerMetadata(
                Window, Window, Function, Function,
                'DOMWindow', 'DOMWindow', 'DOMWindow',
                Object, TP.ac(Object), TP.ac('Object'));
        Window.$$nonFunctionConstructorObjectName = 'DOMWindow';

        //  Browser-specific DOM 'types'

        //  Webkit

        if (TP.boot.$$isWebkit()) {

            registerMetadata(
                    XMLDocument, XMLDocument, Function, Function,
                    'XMLDocument', 'XMLDocument', 'XMLDocument',
                    Document,
                    TP.ac(Document, Node, Object),
                    TP.ac('Document', 'Node', 'Object'));

            registerMetadata(
                    XMLHttpRequest, XMLHttpRequest, Function, Function,
                    'XMLHttpRequest', 'XMLHttpRequest', 'XMLHttpRequest',
                    Object,
                    TP.ac(Object),
                    TP.ac('Object'));

            //  Need to tell our machinery that NaN's *constructor* name is
            //  'Number'
            /* jshint ignore:start */
            NaN.__proto__.$$nonFunctionConstructorConstructorName =
                                        'Number';
            /* jshint ignore:end */
        }

        //  Firefox

        if (TP.boot.$$isMoz()) {

            registerMetadata(
                    CSS2Properties, CSS2Properties, Function, Function,
                    'CSSStyleDeclaration',
                    'CSSStyleDeclaration',
                    'CSSStyleDeclaration',
                    Object,
                    TP.ac(Object),
                    TP.ac('Object'));

            //  Need to tell our machinery that NaN's *constructor* name is
            //  'Number'
            /* jshint ignore:start */
            NaN.__proto__.$$nonFunctionConstructorConstructorName =                                                     'Number';
            /* jshint ignore:end */
        }

        //  Internet Explorer

        /*
        if (TP.boot.$$isIE()) {
            Object.defineProperty(Window, '$$name',
                                {get: function () {return 'DOMWindow';}});

            Object.defineProperty(Document, '$$name',
                                {get: function () {
                                    if (this.xmlVersion) {
                                        return 'XMLDocument';
                                    } else {
                                        return 'HTMLDocument';
                                    }
                                }});
        }
        */
    };

    //  ------------------------------------------------------------------------

    TP.boot.installPatches = function (aWindow) {

        //  For IE... but required by the 'TP.boot.autoBoot' and
        //  'TP.boot.bootFromBookmark' functions.
        if (TP.boot.$notValid(aWindow.atob)) {
            aWindow.atob = function(aString) {
                /**
                 * @name atob
                 * @synopsis An implementation of the atob function found in
                 *     Mozilla which takes a Base64-encoded ascii string and
                 *     decodes it to binary form.
                 * @param {String} aString The string to convert.
                 * @return {Object} A decoded String.
                 */

                var atobData,
                    btoaData,

                    i,

                    c,
                    d,
                    e,
                    f,
                    n,

                    arr,
                    out,
                    ndx;

                if (typeof(aString) !== 'string') {
                    return TP.boot.$raise(this, 'InvalidParameter', arguments);
                }

                atobData = [];

                for (i = 0; i < 26; i++) {
                    atobData.push(String.fromCharCode(65 + i));
                }

                for (i = 0; i < 26; i++) {
                    atobData.push(String.fromCharCode(97 + i));
                }

                for (i = 0; i < 10; i++) {
                    atobData.push(String.fromCharCode(48 + i));
                }

                atobData.push('+');
                atobData.push('/');

                btoaData = [];

                for (i = 0; i < 128; i++) {
                    btoaData.push(-1);
                }

                for (i = 0; i < 64; i++) {
                    btoaData[atobData[i].charCodeAt(0)] = i;
                }

                arr = aString.split('');
                ndx = 0;
                out = '';

                n = 0;

                do {
                    f = arr[ndx++].charCodeAt(0);
                    i = btoaData[f];

                    /* jshint bitwise:false */
                    if (f >= 0 && f < 128 && i !== -1) {
                        if (n % 4 === 0) {
                            c = i << 2;
                        } else if (n % 4 === 1) {
                            c = c | (i >> 4);
                            d = (i & 0x0000000F) << 4;
                        } else if (n % 4 === 2) {
                            d = d | (i >> 2);
                            e = (i & 0x00000003) << 6;
                        } else {
                            e = e | i;
                        }
                    /* jshint bitwise:true */

                        n++;

                        if (n % 4 === 0) {
                            out += String.fromCharCode(c) +
                                    String.fromCharCode(d) +
                                    String.fromCharCode(e);
                        }
                    }
                }
                while (arr[ndx]);

                if (n % 4 === 3) {
                    out += String.fromCharCode(c) + String.fromCharCode(d);
                } else if (n % 4 === 2) {
                    out += String.fromCharCode(c);
                }

                return out;
            };
        }

        //  --------------------------------------------------------------------
        //  CSS OM Patches
        //  --------------------------------------------------------------------

        //  Mozilla has bugs around its Gecko rendering engine not properly
        //  supplying the offset* properties for custom elements. We rectify
        //  that here.
        if (TP.boot.$$isMoz()) {

            aWindow.Element.prototype.__defineGetter__(
                'offsetParent',
                function() {

                    return TP.elementGetOffsetParent(this);
                });

            aWindow.Element.prototype.__defineGetter__(
                'offsetTop',
                function() {

                    return Math.round(this.getBoundingClientRect().top);
                });

            aWindow.Element.prototype.__defineGetter__(
                'offsetLeft',
                function() {

                    return Math.round(this.getBoundingClientRect().left);
                });

            aWindow.Element.prototype.__defineGetter__(
                'offsetWidth',
                function() {

                    return Math.round(this.getBoundingClientRect().width);
                });

            aWindow.Element.prototype.__defineGetter__(
                'offsetHeight',
                function() {

                    return Math.round(this.getBoundingClientRect().height);
                });
        }

        //  --------------------------------------------------------------------
        //  Event Patches
        //  --------------------------------------------------------------------

        if (TP.boot.$$isMoz() || TP.boot.$$isWebkit()) {

            aWindow.Event.prototype.__defineGetter__(
                'offsetX',
                function() {

                    //  The spec says that offsetX should be computed from the
                    //  left of the *padding box* (i.e. including the padding,
                    //  but excluding the border).

                    var target,
                        compStyle,
                        offsetX,
                        absOffset;

                    target = this.target;

                    if (target && target.nodeType !== Node.DOCUMENT_NODE) {
                        target = (target.nodeType === Node.TEXT_NODE) ?
                                                    target.parentNode :
                                                    target;

                        compStyle = TP.elementGetComputedStyleObj(target);

                        if (compStyle.position === 'absolute' ||
                            compStyle.position === 'relative') {
                            offsetX = this.layerX;
                        } else {
                            absOffset =
                                TP.elementGetOffsetFromContainer(target);
                            offsetX = this.layerX - absOffset[0];

                            if (target.offsetParent) {
                                compStyle = TP.elementGetComputedStyleObj(
                                                        target.offsetParent);
                                offsetX -= compStyle.getPropertyCSSValue(
                                            'border-left-width').getFloatValue(
                                            CSSPrimitiveValue.CSS_PX);
                            }
                        }

                        return offsetX;
                    }

                    return 0;
                });

            aWindow.Event.prototype.__defineGetter__(
                'offsetY',
                function() {

                    //  The spec says that offsetY should be computed from the
                    //  top of the *padding box* (i.e. including the padding,
                    //  but excluding the border).

                    var target,
                        compStyle,
                        offsetY,
                        absOffset;

                    target = this.target;

                    if (target && target.nodeType !== Node.DOCUMENT_NODE) {
                        target = (target.nodeType === Node.TEXT_NODE) ?
                                                    target.parentNode :
                                                    target;

                        compStyle = TP.elementGetComputedStyleObj(target);

                        if (compStyle.position === 'absolute' ||
                            compStyle.position === 'relative') {
                            offsetY = this.layerY;
                        } else {
                            absOffset =
                                TP.elementGetOffsetFromContainer(target);
                            offsetY = this.layerY - absOffset[1];

                            if (target.offsetParent) {
                                compStyle = TP.elementGetComputedStyleObj(
                                                        target.offsetParent);
                                offsetY -= compStyle.getPropertyCSSValue(
                                            'border-top-width').getFloatValue(
                                            CSSPrimitiveValue.CSS_PX);
                            }
                        }

                        return offsetY;
                    }

                    return 0;
                });

            aWindow.Event.prototype.__defineGetter__(
                'resolvedTarget',
                function() {

                    var resolvedTarget;

                    if (TP.boot.$isValid(resolvedTarget =
                                            this._resolvedTarget)) {
                        return resolvedTarget;
                    }

                    if (!TP.boot.$isElement(resolvedTarget =
                                                TP.eventResolveTarget(this))) {
                        return null;
                    }

                    this._resolvedTarget = resolvedTarget;

                    return resolvedTarget;
                });
        }
        else if (TP.boot.$$isIE())
        {
            //  IE

            Object.defineProperty(
                aWindow.Event.prototype,
                'target',
                {
                    get: function() {

                        return this.srcElement;
                    }
                });

            Object.defineProperty(
                aWindow.Event.prototype,
                'currentTarget',
                {
                    get: function() {

                        //  We can never compute 'currentTarget' for IE in
                        //  TIBET, since we use document-level event handlers
                        return null;
                    }
                });

            Object.defineProperty(
                aWindow.Event.prototype,
                'relatedTarget',
                {
                    get: function() {

                        return this.fromElement || this.toElement || null;
                    }
                });

            Object.defineProperty(
                aWindow.Event.prototype,
                'metaKey',
                {
                    get: function() {

                        return false;
                    }
                });

            Object.defineProperty(
                aWindow.Event.prototype,
                'pageX',
                {
                    get: function() {

                        var evtDoc;

                        evtDoc = this.srcElement.document;

                        //  We assume standards mode here, since its been the
                        //  documentElement holding the scroll left value since
                        //  standards mode in *IE6*
                        return this.clientX + evtDoc.documentElement.scrollLeft;
                    }
                });

            Object.defineProperty(
                aWindow.Event.prototype,
                'pageY',
                {
                    get: function() {

                        var evtDoc;

                        evtDoc = this.srcElement.document;

                        //  We assume standards mode here, since its been the
                        //  documentElement holding the scroll top value since
                        //  standards mode in *IE6*
                        return this.clientY + evtDoc.documentElement.scrollTop;
                    }
                });

            Object.defineProperty(
                aWindow.Event.prototype,
                'resolvedTarget',
                {
                    get: function() {

                        var resolvedTarget;

                        if (TP.boot.$isValid(resolvedTarget =
                                                    this._resolvedTarget)) {
                            return resolvedTarget;
                        }

                        if (!TP.boot.$isElement(resolvedTarget =
                                                TP.eventResolveTarget(this))) {
                            return null;
                        }

                        this._resolvedTarget = resolvedTarget;

                        return resolvedTarget;
                    }
                });

            Object.defineProperty(
                aWindow.Event.prototype,
                'view',
                {
                    get: function() {

                        return this.srcElement.document.parentWindow;
                    }
                });

            Object.defineProperty(
                aWindow.Event.prototype,
                'wheelDelta',
                {
                    get: function() {

                        if (this.type === 'mousewheel') {
                            return this.detail / 120;
                        }
                    }
                });

            //  Add 'stopPropagation' and 'preventDefault' methods
            aWindow.Event.prototype.stopPropagation = function() {

                this.cancelBubble = true;
            };

            aWindow.Event.prototype.preventDefault = function() {

                if (this.type === 'mouseover') {
                    this.returnValue = true;
                } else {
                    this.returnValue = false;
                }
            };
        }

        //  All browsers get 'at()' and 'atPut()' on their Event objects.
        aWindow.Event.prototype.at = function(key) {

            return this[key];
        };

        aWindow.Event.prototype.atPut = function(key, value) {

            this[key] = value;

            return this;
        };

        //  Add a 'copy' method for native Event objects that just returns a
        //  literal object.
        aWindow.Event.prototype.copy = function() {

            var proxy,
                proto,
                i;

            proxy = {
                    target: this.target,
                    $$target: this.$$target,

                    //  Never use the $$ version of currentTarget...
                    currentTarget: this.currentTarget,

                    relatedTarget: this.relatedTarget,
                    $$relatedTarget: this.$$relatedTarget,

                    type: this.type,
                    $$type: this.$$type,

                    timeStamp: this.timeStamp,
                    $$timestamp: this.$$timestamp,

                    clientX: this.clientX,
                    $$clientX: this.$$clientX,
                    clientY: this.clientY,
                    $$clientY: this.$$clientY,
                    $$clientPt: this.$$clientPt,

                    offsetX: this.offsetX,
                    $$offsetX: this.$$offsetX,
                    offsetY: this.offsetY,
                    $$offsetY: this.$$offsetY,
                    $$offsetPt: this.$$offsetPt,

                    view: this.view,
                    $$view: this.$$view,

                    pageX: this.pageX,
                    $$pageX: this.$$pageX,
                    pageY: this.pageY,
                    $$pageY: this.$$pageY,
                    $$pagePt: this.$$pagePt,

                    resolvedTarget: this.resolvedTarget,
                    $$_resolvedTarget: this.$$_resolvedTarget,

                    screenX: this.screenX,
                    $$screenX: this.$$screenX,
                    screenY: this.screenY,
                    $$screenY: this.$$screenY,
                    $$screenPt: this.$$screenPt,

                    $$transPt: this.$$transPt,

                    //  Never use the non-$$ version of keyCode...
                    $$keyCode: this.$$keyCode,

                    altKey: this.altKey,
                    $$altKey: this.$$altKey,
                    ctrlKey: this.ctrlKey,
                    $$ctrlKey: this.$$ctrlKey,
                    shiftKey: this.shiftKey,
                    $$shiftKey: this.$$shiftKey,

                    //  Never use the $$ version of metaKey...
                    metaKey: this.metaKey,

                    button: this.button,
                    $$button: this.$$button,

                    wheelDelta: this.wheelDelta,
                    $$wheelDelta: this.$$wheelDelta,

                    //  Specific to Mozilla/Webkit
                    charCode: this.charCode,

                    //  Specific to Mozilla
                    which: this.which,

                    //  Specific to IE
                    cancelBubble: this.cancelBubble,
                    returnValue: this.returnValue,

                    //  Special TIBET-an flags placed on events
                    $captured: this.$captured,
                    $dragdistance: this.$dragdistance,
                    $normalized: this.$normalized,
                    $notSignaled: this.$notSignaled,
                    $unicodeCharCode: this.$unicodeCharCode,
                    $computedName: this.$computedName
                };

            //  Now, copy all keys that are on the prototype that we don't know
            //  about.
            proto = aWindow.Event.prototype;
            for (i in proto) {
                if (proto.hasOwnProperty(i)) {
                    try {
                        if (typeof this[i] === 'function') {
                            proxy[i] = this[i];
                        }
                    } catch (e) {
                        // Ignore errors. Events don't like being touched.
                    }
                }
            }

            return proxy;
        };

        //  --------------------------------------------------------------------
        //  NamedNodeMap Patch
        //  --------------------------------------------------------------------

        //  As of Firefox 22, 'NamedNodeMap' only deals with attributes (as per
        //  DOM Level 4). This alias patches that for us.
        if (TP.boot.$notValid(aWindow.NamedNodeMap)) {
            aWindow.NamedNodeMap = aWindow.MozNamedAttrMap;
            Object.defineProperty(
                    aWindow.MozNamedAttrMap,
                    '$$name',
                    {get: function () {return 'NamedNodeMap';}});
        }

        //  --------------------------------------------------------------------
        //  Set up Metadata
        //  --------------------------------------------------------------------

        //  See the ** NOTE NOTE NOTE* above in TP.boot.$$setupMetadata about
        //  why we check not only for 'TP' here, but for 'TP.ac' (we also check
        //  to see if the Object constructor has a '$$name' slot just to avoid
        //  doing this again if it's been done).
        if (aWindow.TP && aWindow.TP.ac && !Object.$$name) {
            TP.boot.$$setupMetadata();
        }

        //  --------------------------------------------------------------------
        //  getKeys Patch
        //  --------------------------------------------------------------------

        //  Set up 'getKeys' for as many native Objects as we know about

        //  Array's 'getKeys' is in the kernel

        //  We do this for HTML Elements, but the prototype is different between
        //  W3C browsers and IE...
        if (TP.boot.$$isIE()) {
            aWindow.Element.prototype.getKeys = function() {

                return TP.sys.$htmlelemkeys;
            };
        } else {
            //  Don't want the HTML Element keys to show up on every Element in
            //  Gecko/Webkit (i.e. XML elements), so we specifically put them on
            //  HTMLElement
            aWindow.HTMLElement.prototype.getKeys = function() {

                return TP.sys.$htmlelemkeys;
            };
        }

        //  We do this for HTML Documents, but the prototype is different
        //  between W3C browsers and IE...
        if (TP.boot.$$isIE()) {
            aWindow.Document.prototype.getKeys = function() {

                return TP.sys.$htmldockeys;
            };
        } else {
            //  Don't want the HTML Document keys to show up on every Document in
            //  Gecko/Webkit (i.e. XML documents), so we specifically put them on
            //  HTMLDocument
            aWindow.HTMLDocument.prototype.getKeys = function() {

                return TP.sys.$htmldockeys;
            };
        }

        //  We don't do these for XML nodes, documents or elements. Those get
        //  checked in the TP.objectKeys() method.

        aWindow.Error.prototype.getKeys = function() {

            return TP.sys.$errorkeys;
        };

        aWindow.Event.prototype.getKeys = function() {

            return TP.sys.$eventkeys;
        };

        aWindow.NamedNodeMap.prototype.getKeys = function() {

            return TP.sys.$namednodemapkeys;
        };

        aWindow.NodeList.prototype.getKeys = function() {

            return TP.sys.$nodelistkeys;
        };

        //  String's 'getKeys' is in the kernel

        aWindow.Window.prototype.getKeys = function() {

            return TP.sys.$windowkeys;
        };

        aWindow.XMLHttpRequest.prototype.getKeys = function() {

            return TP.sys.$xhrkeys;
        };
    };

    //  ------------------------------------------------------------------------

    TP.windowIsInstrumented = TP.windowIsInstrumented || function(aWindow) {

        /**
         * @name windowIsInstrumented
         * @synopsis Returns true if the receiving window still sees TIBET
         *     instrumentation.
         * @param {Window} aWindow The native window to test. For the hook file
         *     version this defaults to 'window'.
         * @return {Boolean}
         * @todo
         */

        var win;

        win = (aWindow != null) ? aWindow : window;

        //  the things we'll use are the things we care about the most here
        return (win.$$instrumented === true &&
                win.$$tibet != null &&
                win.TP != null);
    };

    //  ------------------------------------------------------------------------
    //  EVENT DISPATCH
    //  ------------------------------------------------------------------------

    /*
    Functions in this section provide lightweight event dispatch and handler
    lookup features. These functions are replaced by their more powerful kernel
    equivalents when a shared TIBET codebase is found, allowing you to skin
    simple UI transformations without loading TIBET, then convert instantly to
    more sophisticated controllers once TIBET loads.
    */

    TP.boot.$$computeDispatchOrigin = function(orig, elem, args) {

        /**
         * @name $$computeDispatchOrigin
         * @synopsis Computes the likely origin for TP.boot.$$dispatch() when
         *     provided with an element and/or event object but not a string
         *     origin.
         * @description TIBET uses string origins for actual signaling to allow
         *     more flexibility and control. This method will attempt to compute
         *     a string origin for an element or event when no string origin is
         *     provided.
         * @param {Element} orig The event origin.
         * @param {Element} elem The element the event originated from, if the
         *     event origin isn't an Element.
         * @param {Event} args The event object that generated the event. If
         *     orig or elem can't be used, use this object to try to get its
         *     'source element' or 'target'.
         * @return {Element|String} Typically a string, but sometimes the
         *     element when no string value can be computed with certainty.
         * @todo
         */

        var tibetOrigin,
            origin;

        //  string origins are used without alteration so check that first
        if (typeof(orig) === 'string' && orig !== '') {
            return orig;
        }

        //  trying to get an element we can work from when origin isn't string
        if (TP.boot.$isElement(orig)) {
            origin = orig;
        } else if (TP.boot.$isElement(elem)) {
            //  we were given the element, so use it
            origin = elem;
        } else if (TP.boot.$isEvent(args)) {
            //  args is normally an Event object, so we'll check that next
            if ((origin = args.srcElement) == null) {
                //  IE uses srcElement, so if that wasn't there we'll try
                //  for Moz's target attribute
                origin = args.target;
            }
        }

        //  still null (or empty)? then we use the special value TP.ANY which
        //  tells TIBET listeners for any origin should match
        if (origin == null || origin === '') {
            return TP.ANY;
        }

        //  try to get an origin from the element itself. using tibet:origin
        //  allows an element to provide an origin other than its ID easily

        try {
            tibetOrigin = origin.getAttribute('tibet:origin');
            if (tibetOrigin != null && tibetOrigin !== '') {
                return tibetOrigin;
            }
        } catch (e) {
        }

        //  the remaining options need TIBET instrumentation in place
        if (TP.windowIsInstrumented(window)) {
            //  try to get a global ID from the element. Note here how we pass
            //  'true' as the second parameter to try to generate an ID if the
            //  element doesn't already have one.
            tibetOrigin = TP.gid(origin, true);
            if (tibetOrigin != null && tibetOrigin !== '') {
                return tibetOrigin;
            }

            //  try to get an ID from the element
            tibetOrigin = TP.elementGetAttribute(origin, 'id');
            if (tibetOrigin != null && tibetOrigin !== '') {
                return tibetOrigin;
            }
        }

        //  otherwise use the element
        return origin;

    };

    //  ------------------------------------------------------------------------

    TP.boot.$$displaySignalData = function(origin, signal, elem, args, policy) {

        /**
         * @name $$displaySignalData
         * @synopsis Provides a simple feedback mechanism during UI prototyping
         *     to ensure that the proper events are being thrown in response to
         *     UI interactions.
         * @description During UI prototyping it can be useful to have visual
         *     display of event data to confirm that the proper origin and
         *     signal data are being dispatched. This function is part of the
         *     default processing for the lightweight TP.boot.$$dispatch() call
         *     to help ensure that the UI is providing the proper signaling data
         *     in preparation for adding TIBET controller logic.
         * @param {String|Element} origin The event origin, either an element or
         *     the element's ID.
         * @param {String} signal The signal name to report.
         * @param {Element} elem The element that is the target of the event.
         * @param {Event|Object} args The event object itself, an Array, or a
         *     hash of parameter data.
         * @param {String} policy A TIBET dispatch policy. Ignored at this
         *     level.
         * @return {null}
         * @todo
         */

        try {
            if (origin == null || typeof(origin) === 'string') {
                window.status = 'origin: ' + origin + '::' +
                                origin +
                                ' signal: ' + signal;
            } else if (origin != null) {
                window.status = 'origin: ' + origin + '::' +
                                origin.getAttribute('id') +
                                ' signal: ' + signal;
            }
        } catch (e) {
        }

        return;
    };

    //  ------------------------------------------------------------------------

    TP.boot.$$dispatch = function(orig, sig, elem, args, policy, display) {

        /**
         * @name $$dispatch
         * @synopsis Placeholder for TIBET's TP.dispatch action, which is
         *     installed on successful launch. This version supports the
         *     initial UI development process -- which can be done outside of
         *     TIBET.
         * @param {String|Element} orig The event origin, either an element or
         *     the element's ID.
         * @param {String} sig The signal name to provide to TIBET.
         * @param {Element} elem The element that is the target of the event.
         * @param {Event|Object} args The event object itself, an Array, or a
         *     hash of parameter data.
         * @param {String} policy A TIBET dispatch policy. Ignored at this
         *     level.
         * @param {Boolean} display Should the signal data be displayed,
         *     normally true.
         * @return {null}
         * @todo
         */

        var signal,
            origin,
            retval,
            fName,
            oStr;

        //  signal can be provided as a string or translated from the native
        //  event if necessary

        signal = sig;

        if (TP.boot.$isEmpty(signal) && TP.boot.$isEvent(args)) {
            signal = TP.DOM_SIGNAL_TYPE_MAP[args.type];
        } else {
            signal = TP.DOM_SIGNAL_TYPE_MAP[sig] || sig;
        }

        if (display !== false) {
            TP.boot.$$displaySignalData(orig, signal, elem, args, policy);
        }

        //  stop all events at the first layer/element that has a handler
        if (TP.boot.$isEvent(args)) {
            if (TP.boot.$$isIE()) {
                args.cancelBubble = true;
            } else {
                //  This seems to cause Mozilla to seize up, so we make it
                //  Webkit-only.
                if (TP.boot.$$isWebkit()) {
                    args.stopPropagation();
                }
            }
        }

        //  compute the TAP-style origin entry for this event to make sure we
        //  have all the right information to properly dispatch
        origin = TP.boot.$$computeDispatchOrigin(orig, elem, args);

        //  if the origin is a string then we'll check first for an
        //  origin-specific handler for the signal
        if (typeof(origin) === 'string') {
            oStr = origin.charAt(0).toUpperCase() + origin.slice(1);
            fName = '$handle' + oStr + signal;
            if (typeof(self[fName]) === 'function') {
                try {
                    retval = self[fName](oStr, signal, elem, args, policy);
                } catch (e) {
                }

                return retval;
            }
        }

        //  next we try to find a signal-specific handler to run
        fName = '$handle' + signal;
        if (typeof(self[fName]) === 'function') {
            try {
                retval = self[fName](origin, signal, elem, args, policy);
            } catch (e) {
            }

            return retval;
        }

        if (display !== false) {
            TP.boot.$$displaySignalData(origin, signal, elem, args, policy);
        }

        //  return void by default so the app doesn't disappear :)
        return;
    };

    //  ------------------------------------------------------------------------

    //  alias the primitive to the normal value for use in html-only mode. when
    //  loaded via TIBET TP.dispatch() will take precedence and it will be up to
    //  the handlers found via that call to dispatch back down into these
    //  primitive UI routines if they want to continue to leverage them.
    if (TP.boot.$isValid(window.TP) && TP.boot.$notValid(TP.dispatch)) {
        TP.dispatch = TP.boot.$$dispatch;
    }

    //  ------------------------------------------------------------------------

    TP.boot.$raise = function(anOrigin, anException, aContext, aPayload) {

        /**
         * @name $raise
         * @synopsis Dispatches the exception as a signal, using the origin and
         *     argument data provided. TIBET exceptions are lightweight and can
         *     be 'handled' or proceed to throw a native Error.
         * @param {Object} anOrigin The origin signaled for this event. Can be a
         *     string to allow spoofing of element IDs etc.
         * @param {Object} anException The signal being triggered.
         * @param {Object} aContext An object, or arguments, which defines the
         *     context of the error.
         * @param {Object} aPayload arguments for the signal.
         * @return {null}
         * @todo
         */

        //  NOTE the context gets dropped here since the primitive version
        //  takes an element as the context
        return TP.boot.$$dispatch(anOrigin, anException, null, aPayload);
    };

    //  ------------------------------------------------------------------------
    //  EVENT HANDLER INSTALLATION
    //  ------------------------------------------------------------------------

    TP.boot.$$addUIHandler = function(anObject, eventName, handlerFunc) {

        /**
         * @name $$addUIHandler
         * @synopsis Adds a special 'UI' event handler to the object under the
         *     supplied event name. This handler is used to send low-level
         *     events to TIBET for further processing.
         * @param {Object} anObject The object that the event handler is to be
         *     installed on.
         * @param {String} eventName The name of the event that the handler will
         *     be installed for.
         * @param {Function} handlerFunc The handler function to use.
         * @return {null}
         * @todo
         */

        var theEventName,
                handlerWrapperFunc;

        theEventName = eventName;

        //  If we're on IE, we use 'activate / deactivate' instead of 'focus /
        //  blur' because 'focus' and 'blur' events don't bubble up to the
        //  document from the target element which means that if we're
        //  installing these handlers on the document, we'll never get the
        //  event.

        if (TP.boot.$$isIE()) {
            if (eventName === 'focus') {
                theEventName = 'activate';
            } else if (eventName === 'blur') {
                theEventName = 'deactivate';
            }

            handlerWrapperFunc = function(evt) {

                    //  W3C Event spec says there is a 'timeStamp' property -
                    //  which we try to set as early as possible.
                    evt.timeStamp = (new Date()).getTime();

                    return handlerFunc(evt);
                };

            anObject.attachEvent('on' + theEventName, handlerWrapperFunc);
        } else {
            if (TP.boot.$$isMoz() && (eventName === 'mousewheel')) {
                theEventName = 'DOMMouseScroll';
            }

            anObject.addEventListener(theEventName, handlerFunc, true);
        }

        //  Cache the handler function on the TP.boot object using the event
        //  name so that we can use it later when we remove the handler.
        TP.boot['$$' + theEventName + 'Handler'] = handlerFunc;

        return;
    };

    //  ------------------------------------------------------------------------

    TP.boot.$$removeUIHandler = function(anObject, eventName) {

        /**
         * @name TP.boot.$$removeUIHandler
         * @synopsis Removes the special 'UI' event handler that was installed
         *     on the object.
         * @param {Object} anObject The object that the event handler was
         *     installed on.
         * @param {String} eventName The name of the event that the handler was
         *     installed for.
         * @return {null}
         * @todo
         */

        var handlerFunc,
                theEventName;

        theEventName = eventName;

        //  If we're on IE, we use 'activate / deactivate' instead of 'focus /
        //  blur' because 'focus' and 'blur' events don't bubble up to the
        //  document from the target element which means that if we're
        //  installing these handlers on the document, we'll never get the
        //  event.
        if (TP.boot.$$isIE()) {
            if (eventName === 'focus') {
                theEventName = 'activate';
            } else if (eventName === 'blur') {
                theEventName = 'deactivate';
            }
        }

        //  Make sure that we can find a valid 'special UI handler'. This was
        //  cached on a slot on the TP.boot object when we registered the
        //  handler via the TP.boot.$$addUIHandler() function above.
        handlerFunc = TP.boot['$$' + theEventName + 'Handler'];

        if (TP.boot.$notValid(handlerFunc)) {
            return;
        }

        if (TP.boot.$$isIE()) {
            anObject.detachEvent('on' + theEventName, handlerFunc);
        } else {
            if (TP.boot.$$isMoz() && (eventName === 'mousewheel')) {
                theEventName = 'DOMMouseScroll';
            }

            anObject.removeEventListener(theEventName, handlerFunc, true);
        }

        //  Clear the slot on the TP.boot object, so that we don't leave little
        //  bits, like unused Functions, around.
        TP.boot['$$' + theEventName + 'Handler'] = null;

        return;
    };

    //  ------------------------------------------------------------------------
    //  DOM MUTATION HOOK
    //  ------------------------------------------------------------------------

    TP.boot.$$addMutationSource = function(aDocument) {
        TP.core.MutationSignalSource.addObserverFor(aDocument);
    };

    //  ------------------------------------------------------------------------

    TP.boot.$$removeMutationSource = function(aDocument) {
        TP.core.MutationSignalSource.removeObserverFor(aDocument);
    };

    //  ------------------------------------------------------------------------
    //  CSS STYLE MODIFICATION HOOK
    //  ------------------------------------------------------------------------

    TP.boot.$$captureStyle = function() {

        /**
         * @name $$captureStyle
         * @synopsis Hides style elements from the browser to keep it from
         *     reporting "errors" for namespaces other than HTML.
         * @return {null}
         */

        var head,
            handlerFunc;

        if (TP.boot.$$isIE()) {
            //  Attach an onreadystatechange that will hide the document's body
            //  before it has a chance to be shown.
            document.attachEvent(
                'onreadystatechange',
                handlerFunc = function() {

                    //  Make sure the browser is done loading the document.
                    if (document.readyState === 'complete') {
                        //  rip out this handler
                        document.detachEvent('onreadystatechange',
                                                handlerFunc);

                        //  make sure there's a body to manipulate, sometimes
                        //  things get a little out of sync with load/unload and
                        //  we don't want to make assumptions here
                        if (document.body) {
                        //  document.body.style.visibility = 'hidden';
                        }
                    }
                });

            return;
        } else {
            //  Add our DOM insertion function as an Event handler for the
            //  DOMNodeInserted event on the head element. See the
            //  TP.$eventHandleStyleInsertion function for more information on
            //  why we do this.
            head = document.getElementsByTagName('head')[0];
            if (head) {
                head.addEventListener(
                    'DOMNodeInserted',
                    TP.$eventHandleStyleInsertion,
                    true);

                //  Add a listener for DOMContentLoaded so that when we know
                //  when all of the DOM elements have been constructed (even if
                //  all external resources like images, script, etc. might not
                //  have loaded yet).
                document.addEventListener(
                    'DOMContentLoaded',
                    handlerFunc = function() {

                        var hd;

                        //  clean up so we don't run into issues with recursions
                        //  or leaks
                        document.removeEventListener('DOMContentLoaded',
                                                        handlerFunc,
                                                        false);

                        if (document.body) {
                        //  Hide the body so that we can do style processing
                        //  without having it flicker around.
                        //  document.body.style.visibility = 'hidden';
                        }

                        //  We don't do this on Mozilla in lieu of the logic in
                        //  TP.$eventHandleStyleInsertion function due to
                        //  Mozilla 1.8's CSS validation logic (which causes a
                        //  lot of spurious errors for us).
                        //TP.$windowDisableStyleSheets(window);

                        //  Remove the DOM insertion function from the 'head'
                        //  element if we can still find it
                        hd = document.getElementsByTagName('head')[0];
                        if (hd) {
                            hd.removeEventListener(
                                'DOMNodeInserted',
                                TP.$eventHandleStyleInsertion,
                                true);
                        }
                    },
                    false);
            }
        }
    };

    //  ------------------------------------------------------------------------
    //  PAGE SETUP/TEARDOWN
    //  ------------------------------------------------------------------------

    /*
    TIBET sets up global handlers for native events so it can manage the event
    system more effectively. These overall event handlers are setup/torn down by
    the functions in this section.
    */

    //  ------------------------------------------------------------------------

    TP.boot.$$stopAndPreventEvent = function(anEvent) {

        /**
         * @name $$stopAndPreventEvent
         * @synopsis A method that is meant to be used as an event handler that
         *     stops propagation and prevents default on the supplied event.
         * @param {HTMLEvent} anEvent The HTML event to stop propagation and
         *     prevent default of.
         * @return {null}
         * @todo
         */

        anEvent.stopPropagation();
        anEvent.preventDefault();

        return;
    };

    //  ------------------------------------------------------------------------

    TP.boot.$$documentSetup = function(aDocument) {

        /**
         * @name $$documentSetup
         * @synopsis Sets up the supplied Document with event handlers that will
         *     cause elements in the page to have advanced event management.
         *     This includes the use of enhanced CSS constructs as managed by
         *     TIBET.
         * @param {HTMLDocument} aDocument The HTML document to enhance with
         *     advanced event management event handlers.
         * @return {null}
         */

        TP.boot.$$addUIHandler(aDocument,
                                'click',
                                TP.core.Mouse.$$handleMouseEvent);
        TP.boot.$$addUIHandler(aDocument,
                                'dblclick',
                                TP.core.Mouse.$$handleMouseEvent);

        TP.boot.$$addUIHandler(aDocument,
                                'mousemove',
                                TP.core.Mouse.$$handleMouseEvent);

        TP.boot.$$addUIHandler(aDocument,
                                'mouseover',
                                TP.core.Mouse.$$handleMouseEvent);
        TP.boot.$$addUIHandler(aDocument,
                                'mouseout',
                                TP.core.Mouse.$$handleMouseEvent);

        TP.boot.$$addUIHandler(aDocument,
                                'mouseenter',
                                TP.core.Mouse.$$handleMouseEvent);
        TP.boot.$$addUIHandler(aDocument,
                                'mouseleave',
                                TP.core.Mouse.$$handleMouseEvent);

        TP.boot.$$addUIHandler(aDocument,
                                'mousedown',
                                TP.core.Mouse.$$handleMouseEvent);
        TP.boot.$$addUIHandler(aDocument,
                                'mouseup',
                                TP.core.Mouse.$$handleMouseEvent);

        TP.boot.$$addUIHandler(aDocument,
                                'contextmenu',
                                TP.core.Mouse.$$handleMouseEvent);

        TP.boot.$$addUIHandler(aDocument,
                                'mousewheel',
                                TP.core.Mouse.$$handleMouseEvent);

        TP.boot.$$addUIHandler(aDocument,
                                'keyup',
                                TP.core.Keyboard.$$handleKeyEvent);

        //  On IE, the 'topmost listener' for oncut/oncopy/onpaste that gets
        //  notified is the 'body' element. This doesn't affect the 'origin
        //  set' that gets signaled for these signals (they're fired with
        //  DOM_FIRING).
        if (TP.boot.$$isIE()) {
            TP.boot.$$addUIHandler(aDocument.body,
                                    'cut',
                                    TP.$$handleCut);
            TP.boot.$$addUIHandler(aDocument.body,
                                    'copy',
                                    TP.$$handleCopy);
            TP.boot.$$addUIHandler(aDocument.body,
                                    'paste',
                                    TP.$$handlePaste);
        } else {
            TP.boot.$$addUIHandler(aDocument,
                                    'cut',
                                    TP.$$handleCut);
            TP.boot.$$addUIHandler(aDocument,
                                    'copy',
                                    TP.$$handleCopy);
            TP.boot.$$addUIHandler(aDocument,
                                    'paste',
                                    TP.$$handlePaste);
        }

        TP.boot.$$addUIHandler(aDocument,
                                'blur',
                                TP.$$handleBlur);
        TP.boot.$$addUIHandler(aDocument,
                                'focus',
                                TP.$$handleFocus);

        TP.boot.$$addUIHandler(aDocument,
                                'keydown',
                                TP.core.Keyboard.$$handleKeyEvent);

        TP.boot.$$addUIHandler(aDocument,
                                'keypress',
                                TP.core.Keyboard.$$handleKeyEvent);

        TP.boot.$$addUIHandler(aDocument,
                                'change',
                                TP.$$handleChange);

        //  Add a mutation signal source for mutations to this document
        TP.boot.$$addMutationSource(aDocument);

        return;
    };

    //  ------------------------------------------------------------------------

    TP.boot.$$documentTeardown = function(aDocument) {

        /**
         * @name $$documentTeardown
         * @synopsis Tears down the supplied Document from the event handlers
         *     that caused elements in the page to have advanced event
         *     management. This includes the use of enhanced CSS constructs as
         *     managed by TIBET.
         * @param {HTMLDocument} aDocument The HTML document to tear down the
         *     advanced event management event handlers.
         * @return {null}
         */

        TP.boot.$$removeUIHandler(aDocument, 'click');
        TP.boot.$$removeUIHandler(aDocument, 'dblclick');

        TP.boot.$$removeUIHandler(aDocument, 'mousemove');

        TP.boot.$$removeUIHandler(aDocument, 'mouseover');
        TP.boot.$$removeUIHandler(aDocument, 'mouseout');

        TP.boot.$$removeUIHandler(aDocument, 'mouseenter');
        TP.boot.$$removeUIHandler(aDocument, 'mouseleave');

        TP.boot.$$removeUIHandler(aDocument, 'mousedown');
        TP.boot.$$removeUIHandler(aDocument, 'mouseup');

        TP.boot.$$removeUIHandler(aDocument, 'contextmenu');

        TP.boot.$$removeUIHandler(aDocument, 'mousewheel');

        TP.boot.$$removeUIHandler(aDocument, 'keyup');

        TP.boot.$$removeUIHandler(aDocument, 'cut');
        TP.boot.$$removeUIHandler(aDocument, 'copy');
        TP.boot.$$removeUIHandler(aDocument, 'paste');

        TP.boot.$$removeUIHandler(aDocument, 'blur');
        TP.boot.$$removeUIHandler(aDocument, 'focus');

        TP.boot.$$removeUIHandler(aDocument, 'keydown');
        TP.boot.$$removeUIHandler(aDocument, 'keypress');

        TP.boot.$$removeUIHandler(aDocument, 'change');

        //  Remove a mutation signal source for mutations to this document
        TP.boot.$$removeMutationSource(aDocument);

        return;
    };

    //  ------------------------------------------------------------------------

    $$init = function() {

        /**
         * @name $$init
         * @synopsis Performs any startup initialization the user interface
         *     elements require. This might include both minor layout
         *     adjustments and connection of low-level event handlers as well
         *     as dynamic content generation.
         * @return {null}
         */

        var tWin;

        //  if the page itself defined an init() function then we'll call it
        try {
            if (typeof(self.init) === 'function') {
                init();
            }
        } catch (e) {
            if (typeof(self.init) === 'function') {
                tWin = $$findTIBET();
                tWin.console.log('ERROR in init(): ' + e.message);
            }
        }

        //  protect the codebase from inadvertent exits.

        //  Note that the way this code operates is browser dependent:
        //      On Mozilla and IE, this hook isn't actually installed on every
        //      window. It is only done once on the top-level window.
        //      The call placed here is for Webkit-based browsers (Safari and
        //      Chrome), which need to install an attribute on the 'body'
        //      element for every visible iframe window. That logic has been
        //      written to look for the same property on the top-level window as
        //      the Mozilla and IE handlers, thereby routing the logic to have
        //      the same effect as it does on those browsers.
        TP.windowInstallOnBeforeUnloadHook(window);

        return;
    };

    //  ------------------------------------------------------------------------
    //  TIBET Bridge
    //  ------------------------------------------------------------------------

    /*
    When TIBET isn't found the hook file will try to launch the application the
    containing file appears to be a part of, marking the current page's URI in
    the location so TIBET can route the home page to that location if possible.

    When TIBET is found, the canvas is initialized -- configured so that the
    page is a well-behaved participant in the application.
    */

    //  ------------------------------------------------------------------------

    TP.boot.autoBoot = function() {

        /**
         * @name autoBoot
         * @synopsis Attempts to boot the TIBET index.html file for the current
         *     file's application, setting the current location to a cookie as a
         *     parameter to override the typical home page.
         * @return {null}
         */

        var loc,
            ndx,
            dir,
            prefix,
            url;

        //  by default we want any page with a hook file to autoboot TIBET if it
        //  ends up in the top window due to a double-click, bookmark, link,
        //  etc. HOWEVER, if we see TP.boot.launch we're in a tibet_init file
        //  meaning we're not just a hook page but a launch page. In that case
        //  we'll wait for launch to be called instead of autobooting.
        if (window !== top || window.$$autoboot === false ||
            typeof TP.boot.launch === 'function') {
            return;
        }

        loc = decodeURI(TP.boot.getWindowLocation());

        //  if we can't locate the TIBET-INF (or equivalent) on the path then
        //  we're not going to be able to find the index.html page
        ndx = loc.indexOf('/TIBET-INF');
        if (ndx === -1) {
            ndx = loc.indexOf(TP.$$tibetinf);
            if (ndx === -1) {
                return;
            } else {
                dir = TP.$$tibetinf;
            }
        } else {
            dir = '/TIBET-INF';
        }

        //  build up a (H)ome url reference for index.html to reference as the
        //  desired target page
        prefix = loc.slice(0, ndx);
        loc = '~' + loc.replace(prefix, '');

        url = prefix + '/' + TP.$$bootpage;

        //  pretend this page never hit the history
        window.location.replace(url);

        return;
    };

    //  ------------------------------------------------------------------------

    TP.boot.bootFromBookmark = function() {

        /**
         * @name bootFromBookmark
         * @synopsis Attempts to boot the TIBET index.html file for the current
         *     file's application, setting the current location to a cookie as a
         *     parameter to override the typical home page.
         * @return {null}
         */

        var loc,
            parts,
            url;

        //  by default we want any page with a hook file to autoboot TIBET if it
        //  ends up in the top window due to a double-click, bookmark, link,
        //  etc.
        if (window !== top || window.$$autoboot === false) {
            return;
        }

        loc = decodeURI(TP.boot.getWindowLocation());

        parts = loc.split('#');

        url = parts[0];

        //  pretend this page never hit the history
        window.location.replace(url);

        return;
    };

    //  ------------------------------------------------------------------------

    TP.boot.initializeCanvas = function(aWindow) {

        /**
         * @name initializeCanvas
         * @synopsis Performs the operations necessary to get this canvas
         *     (window) integrated with TIBET and ready to use.
         * @description This function is invoked when TIBET is found and the
         *     boot process has been detected to have reached a stage where its
         *     possible to properly setup the page.
         * @param aWindow {Window} The window (canvas) to initialize.
         * @return {null}
         */

        var handlerFunc;

        //  if we are _in_ the TIBET window (boot and hook together) then we
        //  don't do this step...the codeframe doesn't get this processing
        if ($$findTIBET() === aWindow) {
            return;
        }

        //  on occasion this file will load before the codebase and when the
        //  phase two booting kicks in we need to ensure it gets connected to
        //  the codebase properly
        if (self.$$tibet == null) {
            if ($$findTIBET() == null) {
                return;
            }
        }

        //  make sure our references are around, otherwise we're out of sync
        if (!TP.core.Window ||
            !TP.core.Window.installLoadUnloadHooks) {
            //  wait for it...
            TP.boot.initCanvas = function() {

                //  requeue until we find what we need
                if (!TP.core.Window ||
                    !TP.core.Window.installLoadUnloadHooks) {
                    setTimeout(TP.boot.initCanvas, 250);

                    return;
                }

                //  once TP.core.Window is in place do the work
                TP.boot.initializeCanvas();
            };

            //  invoke our newly constructed initializer
            TP.boot.initCanvas();

            return;
        }

        //  We don't do the rest of this (installing load/unload hooks, style
        //  capture, instrumenting the window, etc.) until TIBET has loaded.
        if (TP.sys.hasLoaded() === false) {
            return;
        }

        //  If this canvas (window) has already been initialized, then we don't
        //  need (or want) to do the rest of this.
        if (TP.boot.$isElement(aWindow.document.body)) {
            if (aWindow.document.body.hasAttribute('tibet_canvasinitialized')) {
                return;
            }
        }

        TP.boot.installPatches(aWindow);

        //  Install any style-specific trap functions. Primarily this helps us
        //  avoid flickering when the style is processed by hiding the document
        //  body and then letting the kernel show it again. This also helps with
        //  mozilla errors that will show up when using non-standard style
        //  (style that would require the CSS processor). This does *not*
        //  actually do the style processing, it simply ensures that the style
        //  nodes are captured to avoid error messages from an overzealous and
        //  non-conforming Mozilla CSS parser.
        /*
        if ($$tibet &&
            ($$tibet['TP'] != null) &&
            $$tibet.TP.sys.shouldProcessCSS()) {
            TP.boot.$$captureStyle();
        };
        */

        //  install load/unload hook functions so TIBET will get the right
        //  event notifications
        TP.core.Window.installLoadUnloadHooks(aWindow);

        //  install basic TIBET feature set
        TP.core.Window.instrument(aWindow);

        //  Set up a load handler (have to use the add* mechanism here to avoid
        //  blowing away any 'onload' handler on the document's body)
        if (TP.boot.$$isIE()) {
            aWindow.attachEvent('onload',
                handlerFunc = function() {

                    //  First step is to clean up so we don't do this twice
                    //this.detachEvent('onload', handlerFunc);

                    //  make sure that any 'page-level' initialization is
                    //  performed. If the page has an 'init' function, this
                    //  function will call it.
                    $$init();
                });

            aWindow.attachEvent('onunload',
                handlerFunc = function() {

                    //  First step is to clean up so we don't do this twice
                    //this.detachEvent('onunload', handlerFunc);

                    //  Second, teardown the document and any special event
                    //  handlers that got installed on it.
                    TP.boot.$$documentTeardown(this.document);
                });
        }
        else    //  firefox, safari, chrome, ...
        {
            //  Mozilla 1.9+ will not fire onload for iframes that are being
            //  document.written (sigh...), but DOMContentLoaded is good enough
            //  since this script will be loaded last.
            if (TP.boot.$$isMoz()) {
                aWindow.document.addEventListener('DOMContentLoaded',
                    handlerFunc = function() {

                        //  first step is to clean up so we don't do this twice
                        //this.removeEventListener('DOMContentLoaded',
                        //                          handlerFunc,
                        //                          false);

                        //  make sure that any 'page-level' initialization is
                        //  performed. If the page has an 'init' function, this
                        //  function will call it.
                        $$init();
                    }, false);
            } else {
                //  We do the same for Webkit-based browsers
                aWindow.document.addEventListener('DOMContentLoaded',
                    handlerFunc = function() {

                        //  first step is to clean up so we don't do this twice
                        //this.removeEventListener('DOMContentLoaded',
                        //                          handlerFunc,
                        //                          false);

                        //  make sure that any 'page-level' initialization is
                        //  performed. If the page has an 'init' function, this
                        //  function will call it.
                        $$init();
                    }, false);
            }

            aWindow.addEventListener('unload',
                handlerFunc = function() {

                    //  First step is to clean up so we don't do this twice
                    //this.removeEventListener('unload',
                    //                          handlerFunc,
                    //                          false);

                    //  Second, teardown the document and any special event
                    //  handlers that got installed on it.
                    TP.boot.$$documentTeardown(this.document);
                }, false);
        }

        //  NOTE: special case here, when processing documents into the ui
        //  frame in particular we want to manage the title
        if (parent === top) {
            top.document.title = aWindow.document.title;
        }

        //  Set up the document's event handlers, etc.
        TP.boot.$$documentSetup(aWindow.document);

        //  Set a flag so that we don't do this again.
        if (TP.boot.$isElement(aWindow.document.body)) {
            aWindow.document.body.setAttribute(
                    'tibet_canvasinitialized', 'true');
        }

        return;
    };

    //  ========================================================================
    //  NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE
    //  NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE
    //  NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE

    //  THIS HAS TO BE THE LAST THING IN THIS FILE -- DO NOT ADD CODE BELOW IT
    //  ========================================================================

    if (window.onerror.failedlaunch === true) {
        //  we're done. the script already blew up with a file launch issue.
        void(0);
    } else if ($$findTIBET() == null) {
        //  we're in a page containing tibet_hook.js, but we can't find TIBET,
        //  which means it hasn't booted yet...so let's try to fix that :)
        TP.boot.autoBoot();
    }
    else if (window.$$tibet == null)
    {
        //  if the previous call didn't set up the proper tibet reference we
        //  still won't be able to function, so we try again via "reboot"
        TP.boot.autoBoot();
    } else {

        //  Now, we might have been loaded 'first' (before TIBET loaded), but in
        //  a different frame. That means that our 'TP' isn't the same as the
        //  real 'TP' from the TIBET code frame. Fix that before we go any
        //  further.
        if (window.$$tibet && window.$$tibet.TP !== window.TP) {
            //  Use this syntax rather than simple assignment to 'lock' the
            //  value so that user scripts can't change it.
            Object.defineProperty(
                    self, 'TP', {value: window.$$tibet.TP, writable: false});
        } else {
            //  Lock the value that we got when the file was loaded.
            Object.defineProperty(
                    self, 'TP', {value: window.TP, writable: false});
        }

        if (TP.boot.getURLBookmark()) {
            TP.boot.bootFromBookmark();
        }
        else if (TP.sys.hasLoaded() === false &&
                    TP.sys.cfg('boot.twophase') === true)
        {
            //  found and mapped over the tibet window reference and it doesn't
            //  look like the system has finished booting phase two...

            //  two-phased booting means that we may well be in a UI page while
            //  the kernel is loading "underneath us" in the code frame. Since
            //  this is all happening asynchronously we want to avoid issues
            //  caused by assuming any functionality is in place before we
            //  initialize the canvas.

            //  the second issue is that we want pages to be able to trigger the
            //  second phase of the boot process when they represent a page that
            //  is a "phase two" page. "phase one" pages like most login_* pages
            //  don't trigger the app targets to load but the login_ok page in
            //  particular will define phasetwo as true.

            //  the trick is getting the sequencing right. essentially we may
            //  have placed the phase two page in place before or after the phase
            //  one components complete their load process. when we get there
            //  early we have to wait until the boot completes. and if it were
            //  to fail for any reason we have to eventually terminate our
            //  observation so that the browser doesn't sit there iterating
            //  until the end of time. if we arrive late then the main boot
            //  logic won't be active any longer and we'll have to "reawaken it"
            //  to get it to pick up with phase two.

            //  we're in a page that says we can move on to phase two processing
            if (window.$$phasetwo === true) {
                if (TP.sys.cfg('boot.phasetwo') === true) {
                    //  if the load process is already working through phase two
                    //  then we don't need to do anything more to ensure booting
                    //  and we can be pretty sure that no matter where things
                    //  are in the boot process we can start the initialization
                    //  loop
                    TP.boot.initializeCanvas(window);
                } else {
                    //  to deal with the fact that the 'tibet' target may be in
                    //  any stage of loading we'll create a function that either
                    //  of the two sides can invoke to finish things
                    TP.boot.bootPhaseTwo = function() {

                        //  make sure the canvas is set up while the rest of the
                        //  process runs to load the application code
                        TP.boot.initializeCanvas(window);

                        //  notify the main boot code logic that phase two
                        //  should be imported. we'll leave it up to that code
                        //  to do the real work :)
                        TP.boot.$$importPhaseTwo();

                        return;
                    };

                    //  if the boot is paused it's because we got here late, so
                    //  it's up to us to trigger the final stage
                    if (TP.boot.$$stage === 'import_paused') {
                        TP.boot.bootPhaseTwo();
                    }
                }
            } else {
                //  we must be a phase one page in a two-phase world. which
                //  means we might sit here forever waiting for the user to get
                //  authenticated or otherwise trigger a phase-two page. might
                //  as well initialize.
                TP.boot.initializeCanvas(window);
            }
        }
        else    //  single phase or post-boot
        {
            //  when booting in single-phase mode every page can potentially be
            //  initialized (although they may be removed once the home page for
            //  the application loads)

            //  since we know that all code will load in a single phase without
            //  any kind of user-dependent pause we can start up the
            //  initializeCanvas loop here
            TP.boot.initializeCanvas(window);
        }
    }

}  //  DO NOT DELETE!!!    End 'location =' trap 'else' clause.

}(this));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================



