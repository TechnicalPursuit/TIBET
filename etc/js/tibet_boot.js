//  ========================================================================
/*
NAME:   tibet_boot.js
AUTH:   Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2013 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc. Licensed under
        the OSI-approved Reciprocal Public License ("RPL") Version 1.5.

        See the RPL for your rights and responsibilities. Contact TPI to
        purchase optional open source waivers for your derivative works.

        Portions Copyright (C), 1999 Netscape Communications Corp.
*/
//  ========================================================================

/*
 * !!!YOU SHOULD NOT EDIT THIS FILE!!!
 *
 * See the documentation on how to properly set preferences and configuration
 * variables to control the boot process either in your HTML or bootfile.
 *
 * If you do find it necessary to edit this file to repair a boot problem
 * (you couldn't use boot properties etc.) please report it as a bug so we
 * can help everyone avoid the same issues in future releases.
 */

/* jshint debug:true,
          eqnull:true,
          evil:true,
          maxerr:999,
          nonstandard:true
*/
/* global $$checked:true,
          $$tibet:true,
          $$TIBET:true,
          $$getNextWindow:true,
          $$findTIBET:true,
          $STATUS:true,
          ActiveXObject:false,
          netscape:false,
          Components:false
*/

//  ------------------------------------------------------------------------
//  PRIVATE GLOBALS
//  ------------------------------------------------------------------------

//  We're not religious about "no globals" for a variety of reasons, but we
//  do use $$ prefixes (TIBETan for "internal") to keep things manageable.

//  window search routine will use this marker slot to avoid recursions
$$checked = null;

//  the tibet window reference, configured by the $$findTIBET() call when it
//  can locate a TIBET installation. if this variable is set it identifies
//  the shared codebase for the application.
$$tibet = null;

//  the global flag that says yes, indeed, this is the real TIBET codebase
//  window
$$TIBET = true;

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
    if (win.parent != null &&
        win.parent !== win) {
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
     * @name findTIBET
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

    if (top.$$TIBET === true) {
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
    //  Try to find the window containing TIBET
    $$findTIBET();

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
            Object.defineProperty(self, 'TP', {value: {}, writable: false});

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

    TP.$$isNamespace = true;
    TP.$$name = 'TP';
    TP.getTypeNames = function() {return [];};

    TP.sys.$$isNamespace = true;
    TP.sys.$$name = 'TP.sys';
    TP.sys.getTypeNames = function() {return [];};

    TP.boot.$$isNamespace = true;
    TP.boot.$$name = 'TP.boot';
    TP.boot.getTypeNames = function() {return [];};

    //  debugging and verbosity level flags. the uppercase variants are used
    //  by TIBET for "customer" and "team tibet" partitioning. lowercase
    //  variants are specific to the boot system itself.

    //  common debugging test flag, set this to true to turn on "if ($DEBUG)"
    //  output. the $DEBUG setting is intended for your debugging
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

    //  now we set up the 'global' object reference on 'TP.global'. This is an
    //  interesting one-liner that works in any environment to obtain the
    //  global.

    //  Turn off the JSHint warning - we know we're invoking the 'Function'
    //  constructor without 'new'... that's part of the point...
    /* jshint ignore:start */
    TP.global = Function('return this')() || (42, eval)('this');
    /* jshint ignore:end */

    //  Function's prototype can be thought of as the native type for any
    //  built-in constructor functions such as Array, String, etc. TIBET makes
    //  use of this feature to provide common behavior for instances of those
    //  native types.
    TP.FunctionProto = Function.prototype;

    //  Object's prototype can be thought of as the prototypical instance for
    //  all objects in the system. TIBET makes use of this feature to provide a
    //  common polymorphic API that can be used across both TIBET objects and
    //  the native types.
    TP.ObjectProto = Object.prototype;

    //  'Wire up' the other prototypes for API completeness
    TP.ArrayProto = Array.prototype;
    TP.BooleanProto = Boolean.prototype;
    TP.DateProto = Date.prototype;
    TP.NumberProto = Number.prototype;
    TP.RegExpProto = RegExp.prototype;
    TP.StringProto = String.prototype;
}

/*
 * Create a namespace for the APP side of things. All application-specific code
 * should really go here.
 */
if (self.APP == null) {
  self.APP = {};
}

//  ------------------------------------------------------------------------

if (!TP.sys.$nativeglobals) {
    TP.sys.$nativeglobals = [];

    //  NB: Put this in an enclosing function so that we can use local vars
    //  without them being hoisted into the global space
    (function() {

        var i;

        //  collect current globals as a rough baseline. NOTE that things
        //  parsed by the JS interpreter prior to starting the execution
        //  phase will still end up in this list so it's not particularly
        //  accurate, but it is more complete than just typing in the "big
        //  8" types. Also note the use of 'TP.global' here, which we use when
        //  we mean the global context and not the window from a semantic
        //  perspective.
        for (i in TP.global) {
            TP.sys.$nativeglobals.push(i);
        }
    })();
}

//  simple objects for looking up reusable notification windows which take
//  the place of the relatively useless alert panel for debugging
TP.$$notifiers = TP.$$notifiers || {};
TP.$$NOTIFY_ARRAY = TP.$$NOTIFY_ARRAY || [];

//  Cached user-agent info
TP.$$uaInfo = {};

//  ------------------------------------------------------------------------
//  COMMON CONSTANTS
//  ------------------------------------------------------------------------

TP.NOOP = function() {};

//  signaling key for "all objects or origins"
TP.ANY = 'ANY';

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
TP.LOG_ENTRY_STACK_NAMES = 4;
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

//  base schemes potentially used during boot processing
TP.SCHEMES = ['http', 'file', 'tibet', 'https', 'chrome-extension'];

//  simple reusable regexes (many many more in TIBETGlobals.js)
TP.FILE_PATH_REGEX = /\.([^\/]*)$/;
TP.HAS_PATH_OFFSET_REGEX = /\/\.\./;
TP.REMOVE_PATH_OFFSET_REGEX = /(^|\/)[^\/]*\/\.\./;
TP.HAS_PATH_NOOP_REGEX = /\/\./;
TP.REMOVE_PATH_NOOP_REGEX = /\/\./;

TP.BAD_WINDOW_ID_REGEX = /[:\/]/;
TP.WINDOW_PREFIX_REGEX = /^window_[0-9]/;
TP.SCREEN_PREFIX_REGEX = /^screen_[0-9]/;

//  simple splitter for TIBET-scheme uri strings
TP.TIBET_URI_SPLITTER =
                /tibet:([^\/]*?)\/([^\/]*?)\/([^\/]*)(\/([^#]*)(.*))*/;

//  Version strings for manifests (root manifests) are like IP addresses,
//  with a . separator and 4 parts for major, minor, build, and patch level.
TP.TIBET_VERSION_SPLITTER = /(\d*)\.(\d*)\.(\d*)\.(\d*)/;

//  ------------------------------------------------------------------------
//  INTERNAL BOOT PROPERTIES
//  ------------------------------------------------------------------------

/*
The variables in this section are internal to the boot script and shouldn't
be altered under any circumstances.
*/

//  ------------------------------------------------------------------------

//  one-time capture of the document head since we append quite often ;)
TP.boot.$$head = document.getElementsByTagName('head')[0];

//  boot termination flag used by error hooks to terminate the boot sequence
TP.boot.$$stop = false;

//  holders for computed app, lib, and uri roots respectively
TP.boot.$$approot = null;
TP.boot.$$libroot = null;
TP.boot.$$uriroot = null;

//  tracking of basedir specifications from module to module, used as a
//  stack.
TP.boot.$$basedir = [];

//  placeholder for the file used to actually boot the system. this will
//  normally end up set to a full path to the tibet.xml file
TP.boot.$$bootfile = null;

//  placeholder for the node list to import at the moment. we use this
//  to allow us to work via setTimeout and onload handlers during import
//  which is necessary to provide openings for visual display to occur
TP.boot.$$bootindex = null;
TP.boot.$$bootnodes = null;

//  placeholder for the initial boot configuration/build target and DOM
TP.boot.$$boottarget = null;
TP.boot.$$bootxml = null;

//  css used to help notify visual elements of warning/error state. once a
//  warning or error occurs the styles in the user interface update to help
//  reflect that state back to the user.
TP.boot.$$cssLevel = 'logmsg';

//  container for expanded paths so we don't work to expand them more than
//  once per session.
TP.boot.$$fullPaths = {};

//  placeholder for reusable httpRequest object
TP.boot.$$httpRequest = null;

//  prebuilt function for setTimeout processing when async loading
TP.boot.$$importAsync = function() {

        TP.boot.$importComponents(false);
    };

//  tracking variables for module-specific configs, which are nestable so we
//  use these arrays as stacks and push/pop configs during import manifest
//  expansion
TP.boot.$$modulecfg = [];
TP.boot.$$modulexml = [];

//  tracking for which modules and targets have loaded. key is
//  module_file#target
TP.boot.$$modules = {};

//  tracking for tuning number of boot time queries. this watches each
//  property and counts how many times we've asked for it
TP.boot.$$propertyQueries = {};

//  regex to validate property key form (qualified)
TP.boot.$$PROP_KEY_REGEX = /\./;

//  placeholder for current working file root from which files can be found
TP.boot.$$rootpath = null;

//  what is the current boot processing stage? these are used largely for
//  reporting but some of the stages actually help with control logic and
//  with driving different messaging in the user interface during boot.
TP.boot.$$stage = null;

//  tracking for which scripts have loaded. key is script file path.
TP.boot.$$scripts = {};

//  cloneable script node for construction of new nodes to append to head
TP.boot.$$scriptTemplate = document.createElement('script');
TP.boot.$$scriptTemplate.setAttribute('type', 'text/javascript');

//  regex used for special case processing of if/unless conditionals
TP.boot.$$USER_AGENT_REGEX =
    /^firefox|^safari|^chrome|^ie|^gecko|^webkit|^trident/;

//  ------------------------------------------------------------------------
//  PRIVATE BOOT PARAMETERS
//  ------------------------------------------------------------------------

/*
The values in this section often interact with TP.sys.cfg() or
TP.sys.env() variables of the same name. You shouldn't ever manipulate
them via their names here, use either TP.sys.cfg() or a suitable TP.boot
or TIBET wrapper function instead.
*/

//  ------------------------------------------------------------------------

//  placeholder for application name. this is defined by the project tag's
//  name attribute or an explicit tibet.appname setting in the configuration
TP.boot.$appname = null;

//  placeholder for the boot log display routine. this is leveraged by the
//  various boot progress display options to alter display behavior
TP.boot.$bootdisplay = null;

//  The version number defines which build files can be processed. When a
//  bootfile specifies a version it cannot be more recent than this or the
//  process will be terminated with a version mismatch error.
TP.boot.$bootversion = '20080907';

//  placeholder for the window used to provide UI to the boot process
TP.boot.$bootwin = null;

//  placeholder for the currently loading script node. this is used to track
//  information related to types and method load origins
TP.boot.$loadNode = null;

//  placeholder for the currently loading script file, used to support
//  object source code reflection
TP.boot.$loadPath = null;
TP.boot.$$loadpaths = [];

//  ------------------------------------------------------------------------
//  BOOT/LOAD PROGRESS
//  ------------------------------------------------------------------------

//  flag telling us whether TIBET has finished booting
TP.sys.booted = false;

TP.sys.hasLoaded = function(aFlag) {

    /**
     * @name hasLoaded
     * @synopsis Combined setter/getter defining whether TIBET's boot process
     *     has completed. This isn't meant to imply that TIBET is in a useable
     *     state, you should use TP.sys.hasKernel() and TP.sys.hasInitialized()
     *     to check for a specific code-loaded state.
     * @param {Boolean} aFlag True to signify load completion.
     * @return {Boolean} The current state.
     */

    if (aFlag != null) {
        this.booted = aFlag;
    }

    return this.booted;
};

//  ------------------------------------------------------------------------

//  flag telling us whether the kernel has finished loading
TP.sys.kernel = false;

TP.sys.hasKernel = function(aFlag) {

    /**
     * @name hasKernel
     * @synopsis Combined setter/getter defining whether the TIBET kernel has
     *     been loaded. This can be helpful when you want to leverage
     *     functionality in the kernel during startup but need to be sure the
     *     kernel has successfully loaded.
     * @param {Boolean} aFlag True to signify kernel is available.
     * @return {Boolean} The current state.
     */

    if (aFlag != null) {
        this.kernel = aFlag;
    }

    return this.kernel;
};

//  ------------------------------------------------------------------------

//  flag telling us whether TIBET has started the application
TP.sys.initialized = false;

TP.sys.hasInitialized = function(aFlag) {

    /**
     * @name hasInitialized
     * @synopsis Combined setter/getter defining whether TIBET's initialization
     *     sequence has completed and the system is in a usable state.
     * @param {Boolean} aFlag True to signify the system is initialized.
     * @return {Boolean} The current state.
     */

    if (aFlag != null) {
        this.initialized = aFlag;
    }

    return this.initialized;
};

//  ------------------------------------------------------------------------

//  flag telling us whether TIBET has started the application
TP.sys.started = false;

TP.sys.hasStarted = function(aFlag) {

    /**
     * @name hasStarted
     * @synopsis Combined setter/getter defining whether TIBET's application
     *     startup sequence has completed and a TP.core.Application instance is
     *     now acting as the application controller.
     * @param {Boolean} aFlag True to signify the system has started.
     * @return {Boolean} The current state.
     */

    if (aFlag != null) {
        this.started = aFlag;
    }

    return this.started;
};

//  ------------------------------------------------------------------------
//  GENERIC ENV/CFG PROPERTY ACCESS
//  ------------------------------------------------------------------------

/*
General purpose routines used by environment and configuration property
routines to manage the values in the TIBET environment and configuration
dictionaries.
*/

//  ------------------------------------------------------------------------

TP.boot.$$getprop = function(aHash, aKey, aDefault, aPrefix) {

    /**
     * @name $$getprop
     * @synopsis Returns the value of the named property from the hash provided.
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
                    if (!aHash.hasOwnProperty(i)) {
                        continue;
                    }

                    if (i.indexOf(aPrefix + '.') === 0) {
                        arr.push(i);
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

//  ------------------------------------------------------------------------

TP.boot.$$setprop = function(aHash, aKey, aValue, aPrefix, shouldSignal,
                             override) {

    /**
     * @name $$setprop
     * @synopsis Sets the value of the named property to the value provided.
     *     Note that properties set in this fashion are NOT persistent. To make
     *     a property persistent you must add it to the tibet.xml file. NOTE
     *     that keys are expected to have at least one '.' (period) separating
     *     their 'category' from their name as in tibet.uipath or
     *     tsh.default_ns. When no period and no prefix are defined the prefix
     *     defaults to 'tmp.'
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
      if (!override) {
        return;
      } else {
        TP.boot.$stdout('Forcing reset of \'' + key +
                        '\' override to \'' + aValue);
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
            TP.sys.hasInitialized() &&
            typeof(window.$signal) === 'function') {
            window.$signal(TP.sys, aKey + 'Change', arguments, aKey);
        }
    }

    return aHash.at(key);
};

//  ------------------------------------------------------------------------
//  CONFIGURATION PROPERTY ACCESS
//  ------------------------------------------------------------------------

/**
 * @Configuration properties are read/write properties which define how TIBET
 *     will operate during startup and normal operation. These properties are
 *     setto default values by the boot script. The default values are then
 *     updatedfrom the application's environment-specific configuration files
 *     and theproperty tags found in the application's modules as the
 *     application loads.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.sys.configuration = {};
TP.sys.configuration.at = function(aKey) {return this[aKey];};
TP.sys.configuration.atPut = function(aKey, aValue) {this[aKey] = aValue;};

TP.sys.overrides = {};

//  ------------------------------------------------------------------------

TP.sys.getcfg = function(aKey, aDefault) {

    /**
     * @name getcfg
     * @synopsis Returns the value of the named configuration property, or the
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

//  ------------------------------------------------------------------------

//  the commonly used alias
TP.sys.cfg = TP.sys.getcfg;

//  ------------------------------------------------------------------------

TP.sys.setcfg = function(aKey, aValue, shouldSignal, override) {

    /**
     * @name setcfg
     * @synopsis Sets the value of the named configuration parameter. Note that
     *     properties set in this fashion are NOT persistent. To make a property
     *     persistent you must add it to the proper environment file (in your
     *     application's configuration path) or to the tibet.xml file for your
     *     application. Unprefixed values receive a prefix of 'cfg'.
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

//  ------------------------------------------------------------------------
//  ENVIRONMENT PROPERTY ACCESS
//  ------------------------------------------------------------------------

/**
 * @Environment properties are defined during application startup based on the
 *     browser environment, url settings, and similar information intended to
 *     help the application understand the context in which it is being run.
 *     Theseproperties are considered read-only, although there is an internal
 *     $$setenvfunction that is used here to set the initial values. There is no
 *     $setenv.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.sys.environment = {};
TP.sys.environment.at = function(aKey) {return this[aKey];};
TP.sys.environment.atPut = function(aKey, aValue) {this[aKey] = aValue;};

//  ------------------------------------------------------------------------

TP.boot.$getenv = function(aKey, aDefault) {

    /**
     * @name $getenv
     * @synopsis Returns the value of the named environment setting. These
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

//  ------------------------------------------------------------------------

//  the commonly used alias
TP.sys.env = TP.boot.$getenv;

//  ------------------------------------------------------------------------

TP.boot.$$setenv = function(aKey, aValue) {

    /**
     * @name $$setenv
     * @synopsis An internal setter for defining the initial values of the
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

//  ------------------------------------------------------------------------
//  BOOT CONFIGURATION PARAMETERS
//  ------------------------------------------------------------------------

/**
 * @With the $setcfg function in place we can now set the baseline properties
 *     required to ensure things can boot. Additional settings at the end of
 *     thisfile cover the remaining set of configuration parameters.
 *
 *     ---------------NOTE NOTE NOTE:---------------
 *
 *     Don't change these here. If you must make an alteration use prefs.html,
 *     the environment files (in TIBET-INF/cfg) or your tibet.xml file.
 * @todo
 */

//  ---
//  boot properties
//  ---

//  what is the base directory for computing application module paths?
//  default is empty to support computation from the window.location
TP.sys.setcfg('boot.approot', null);

//  where did we end up locating the boot.tibetinf directory? filled in
//  after initial computation and search locate the concrete directory name
TP.sys.setcfg('boot.bootdir', null);

//  what specific file did we end up using as our tibet.xml file? filled in
//  based on launch parameters and search for the concrete file
TP.sys.setcfg('boot.bootfile', null);

//  what target window/frame should we use for boot display? this is a
//  critical part of the configuration. in early versions of TIBET this was
//  set to 'top.ui' since TIBET used a 3-frame frameset to manage code,
//  data, and ui. in current versions of TIBET frames have been replaced
//  with iframes and the code loads into 'top'. See index.html in the TIBET
//  application template for more information.
TP.sys.setcfg('boot.canvas', 'UIROOT');

//  should we test for status bar writability in mozilla-based browsers?
//  Normally false to avoid Privilege requests that are required to do this
TP.sys.setcfg('boot.check_status', false);

//  turn this on to see debugging output containing all http status codes
//  and header information for certain calls. this is usually sufficient
//  to help you track down http redirection issues etc.
TP.sys.setcfg('boot.debughttp', false);

//  turn this on to observe/debug metadata/proxydata information tracking
//  and storage. different levels of verbosity are available here as well.
TP.sys.setcfg('boot.debugmeta', false);

//  turn this on if you're having real trouble and need to see the entire
//  node list during boot processing, otherwise this is excessive output.
TP.sys.setcfg('boot.debugnode', false);

//  turn this on if you're having trouble with locating the boot file or
//  other files. this will output path search information that can be very
//  helpful in tracking down a bad configuration file path definition
TP.sys.setcfg('boot.debugpath', true);

//  turn this on to preserve boot ui (basically console ui elements).
TP.sys.setcfg('boot.debugui', false);

//  overall deferred loading flag. when false the defer attribute is ignored
//  and all script nodes are loaded. when true the nodes are captured in the
//  manifest but their code isn't actually loaded during initial startup.
TP.sys.setcfg('boot.defer', true);

//  delay for 'splash' content prior to boot initiation, default is set to
//  ensure a pause long enough to provide useful feedback to the user
TP.sys.setcfg('boot.delay', 500);

//  default how we should display boot progress: busy gif, console mode,
//  progress mode, or counter mode. progress gives best overall feedback so
//  that's our default...but console mode is my personal favorite :)
TP.sys.setcfg('boot.display', 'console');

//  what's the default environment to load? production...developers can
//  reconfig via the preference panel easily
TP.sys.setcfg('boot.env', 'development');

//  which computation approach should we use first? there are three and we try
//  to avoid 404s for inappropriate attempts. choices here are 'tibetdir',
//  'tibetinf', and 'tibetapp' (for internal apps).
TP.sys.setcfg('boot.libcomp', 'tibetdir');

//  what is the base directory for library module path expansion? this
//  often will be configured in the ${boot.bootfile} unless the application
//  is a) inside the TIBET release directory structure or b) has a valid
//  copy of the library snapshotted under ~app_base/base.
TP.sys.setcfg('boot.libroot', null);

//  the application login page. when booting in two-phase mode with logins
//  turned on this page is displayed in the uicanvas while the root page
//  loads the TIBET target (kernel + any other TIBET code you configure) in
//  the code frame. when booting in a single phase this page replaces the
//  index file and booting has to be restarted by the page returned from
//  your server on successful login.
TP.sys.setcfg('boot.loginpage', '~app_html/login.html');

//  true will dump configuration data to boot log
TP.sys.setcfg('boot.log_cfg', true);

//  true will dump environment data to boot log
TP.sys.setcfg('boot.log_env', true);

//  what string shall we separate log output with? we use a prefixed br here
//  since the boot log and console display generators use xhtml with that
//  prefix and these separators help ensure proper layout.
TP.sys.setcfg('boot.log_lineend', '<html:br/>\n');

//  under the covers booting always occurs in two phases and we manipulate
//  the settings in these configuration properties to control manifest
//  generation and importing. when 'single-phase' booting is requested it
//  simply means phase two begins immediately upon completion of phase one.
TP.sys.setcfg('boot.phaseone', true);
TP.sys.setcfg('boot.phasetwo', false);

//  currently booting module name
TP.sys.setcfg('boot.module', null);

//  should we load files on mozilla using xpcom? default starts out false.
TP.sys.setcfg('boot.moz_xpcom', false);

//  what image should we normally load? we default to the kernel/base and
//  try to optimize load times by leveraging the autoloader.
TP.sys.setcfg('boot.image', 'developer');

//  currently booting script name
TP.sys.setcfg('boot.script', null);

TP.sys.setcfg('boot.sectionbar',
'========================================================================');

TP.sys.setcfg('boot.subsectionbar',
'------------------------------------------------------------------------');

TP.sys.setcfg('boot.chunkedbar',
'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

//  should we terminate the boot process when we hit an error? by default we
//  keep going in an attempt to get more information about the problem
TP.sys.setcfg('boot.stop_onerror', false);

//  what build target do we default to in the config file (tibet + app)
TP.sys.setcfg('boot.target', 'code');

//  lib root is computed from ~app + tibetdir + tibetlib. Hence the default here
//  is that we expect lib_root to be ~app/node_modules/tibet (for Node-based
//  need to configure that in your application's pre-config sequence.
//  apps). If you're putting it elsewhere (~app/TIBET-INF/tibet for example) you
TP.sys.setcfg('boot.tibetdir', 'node_modules');
TP.sys.setcfg('boot.tibetlib', 'tibet');

//  Many web servers return 404 if you ask about directories. We have to ask for
//  a real file so we check for a file unlikely to be typical outside of TIBET.
TP.sys.setcfg('boot.tibetyyz', 'yyz');

//  Default information used to find the tibet.xml file.
TP.sys.setcfg('boot.tibetinf', 'TIBET-INF');
TP.sys.setcfg('boot.tibetxml', 'tibet.xml');

//  should we boot in two phases, lib (the 'tibet' target) and then app
//  (the 'app' target). this should be true in virtually all cases.
TP.sys.setcfg('boot.twophase', true);

//  filled in by each config file...must be older than TP.boot.$bootversion
TP.sys.setcfg('boot.version', null);

//  adjusted after manifest-building to define how many nodes will be loaded
//  during the current module import
TP.sys.setcfg('boot.workload', null);

//  ---
//  importer
//  ---

//  should we try to split and cache chunks when loading module-level
//  packages of code or just load/cache the module file? supporting chunks
//  here allows later updates to happen in more small-grained fashion.
TP.sys.setcfg('import.chunks', false);

//  should we try to load packed (condensed) source code?
TP.sys.setcfg('import.condensed', false);

//  should we try to import module configuration manifest files?
TP.sys.setcfg('import.manifests', false);

//  should autoloader metadata be imported (usually yes for production)
TP.sys.setcfg('import.metadata', false);

//  should we try to load module-level packages of code, or just files?
TP.sys.setcfg('import.modules', false);

//  should source be loaded from the cache without checks ('local')? other
//  values include modified, remote, and marked.
TP.sys.setcfg('import.source', 'local');

//  should source import use the DOM or source text? DOM has to be used in
//  certain cases to allow debuggers (like Firebuggy) to work properly.
TP.sys.setcfg('import.usingdom', true);

//  ---
//  packager
//  ---

//  what extension should packed files have? by default just an _c.
TP.sys.setcfg('pack.extension', '_c');

//  ---
//  local cache
//  ---

//  what type of caching refresh model are we using? versioned is default.
//  alternative values are: 'versioned', 'incremental', 'stale', or 'fresh'.
//  In versioned mode the cache configuration is driven by version-string
//  checks between the cache and the project tag's version attribute. In
//  incremental mode the version string isn't used, instead each file is
//  updated based on Last-Modified information if available. In stale mode
//  the entire cache is considered to be invalid and all files are updated.
//  In fresh mode all files are considered valid and used regardless of
//  their current state relative to their master copies.
TP.sys.setcfg('tibet.cachemode', 'versioned');

//  is the local cache enabled for import?
TP.sys.setcfg('tibet.localcache', true);

//  ---
//  project data
//  ---

//  the project's "identifier string", typically placed in the notifier when
//  using a TAP-based project upon startup.
TP.sys.setcfg('project.ident', null);

//  what's this application called? this affects the default value of the
//  home page that will load. NOTE that this is updated with the tibet.xml
//  file's project name, and can then be refined by the environment files
TP.sys.setcfg('project.name', TP.boot.$appname);

//  the project's version string. this can be any value, but altering it in
//  the root module file will trigger cache refresh logic
TP.sys.setcfg('project.version', null);

//  ---
//  boot-level tibet props
//  ---

//  the default page used to initialize a canvas or display "nothing"
TP.sys.setcfg('tibet.blankpage',
                '~app_base/base/lib/tibet/html/_body.html');

//  when relying on components which need buffer (frame) support what is the
//  default location to use? default is a top-level frameset containing a
//  frame named 'buffers' where we can create iframes and other elements
TP.sys.setcfg('tibet.buffer_frame', 'top');

//  launches, allowing you to be advised of updates when they're available
TP.sys.setcfg('tibet.check_version', false);

//  controls process reporting during the launch. setting this to true
//  here (and in the tibet.xml file) will cause a few more lines of
//  output covering the initial parameter-setting phase of the boot process.
//  If you're not trying to debug that you should be able to just set
//  tibet.debug in your application build file and leave this set to false.
TP.sys.setcfg('tibet.debug', true);

//  NOTE:   turning this on will cause a notify panel with CSS selector
//          translation data to appear
TP.sys.setcfg('tibet.debugcss', false);

//  defaults to home.html in the application's html directory. this page is
//  loaded into the tibet.canvas as part of the AppStart event processing.
TP.sys.setcfg('tibet.homepage', '~app_html/home.html');

//  the markup or 'hostlang' that's preferred -- XHTML
TP.sys.setcfg('tibet.hostlang',
                'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd');

//  what is the currently active locale (in xml:lang format)
TP.sys.setcfg('tibet.locale', null);

//  what is the current keyboard? only need to set if not U.S. English
//  NOTE that this sets the _type_. A second parameter using the typename plus
//  a .xml extension (TP.core.USAscii101Keyboard.xml for example) is used to
//  point to that type's keyboard mapping file (which is in ~lib_dat by
//  default).
TP.sys.setcfg('tibet.keyboard', null);

//  online/offline at a file:// vs. http:// level. configured later after
//  isHTTPBased is installed
TP.sys.setcfg('tibet.offline', null);

//  allow for configuration of what tibet:root tag will convert to.
TP.sys.setcfg('tibet.roottag', null);

TP.sys.setcfg('tibet.uibackground', 'top_background');

//  what target/window does the current UI go into?
TP.sys.setcfg('tibet.uicanvas', 'UIROOT');

//  what target/window did (should) the initial UI go into?
TP.sys.setcfg('tibet.uiroot', 'UIROOT');

//  lots 'o output? as with the debug flag configured here, unless you're
//  trying to get verbose output from the property-setting phase you can
//  leave this false here and just set tibet.verbose in your application
//  build file.
TP.sys.setcfg('tibet.verbose', true);

//  ---
//  common paths
//  ---

//  virtualized path definitions. these come in two primary forms: app paths
//  and lib paths. app_* paths are used to refer to components in the
//  application's source tree while lib_* paths refer to components in the
//  library source tree. you should use these extensively in lieu of
//  absolute or relative paths to further insulate your code from arbitrary
//  directory structures which may change over time.

TP.sys.setcfg('path.lib', '~tibet');

TP.sys.setcfg('path.app_base', '~/' + TP.sys.cfg('boot.tibetinf'));
TP.sys.setcfg('path.lib_base', '~tibet/base');

//  common virtual paths
TP.sys.setcfg('path.app_bin', '~app_base/bin');
TP.sys.setcfg('path.lib_bin', '~lib_base/bin');

TP.sys.setcfg('path.app_cfg', '~app_base/cfg');
TP.sys.setcfg('path.lib_cfg', '~lib_base/cfg');

TP.sys.setcfg('path.app_contrib', '~app_lib/contrib');
TP.sys.setcfg('path.lib_contrib', '~lib_lib/contrib');

TP.sys.setcfg('path.app_css', '~/css');
TP.sys.setcfg('path.lib_css', '~lib_tibet/css');

TP.sys.setcfg('path.app_dat', '~app_base/dat');
TP.sys.setcfg('path.lib_dat', '~lib_base/dat');

TP.sys.setcfg('path.app_demo', '~app_doc/demo');
TP.sys.setcfg('path.lib_demo', '~lib_doc/demo');

TP.sys.setcfg('path.app_doc', '~/doc');
TP.sys.setcfg('path.lib_doc', '~lib_base/doc');

TP.sys.setcfg('path.app_help', '~app_doc/help');
TP.sys.setcfg('path.lib_help', '~lib_doc/help');

TP.sys.setcfg('path.app_html', '~/html');
TP.sys.setcfg('path.lib_html', '~lib_tibet/html');

TP.sys.setcfg('path.app_xhtml', '~/xhtml');
TP.sys.setcfg('path.lib_xhtml', '~lib_tibet/xhtml');

TP.sys.setcfg('path.app_img', '~/img');
TP.sys.setcfg('path.lib_img', '~lib_tibet/img');

TP.sys.setcfg('path.app_lib', '~app_base/lib');
TP.sys.setcfg('path.lib_lib', '~lib_base/lib');

TP.sys.setcfg('path.app_src', '~/src');
TP.sys.setcfg('path.lib_src', '~lib_base/src');

TP.sys.setcfg('path.app_third', '~app_lib/thirdparty');
TP.sys.setcfg('path.lib_third', '~lib_lib/thirdparty');

TP.sys.setcfg('path.app_tibet', '~app_lib/tibet');
TP.sys.setcfg('path.lib_tibet', '~lib_lib/tibet');

TP.sys.setcfg('path.app_tsh', '~/tsh');
TP.sys.setcfg('path.lib_tsh', '~lib_base/tsh');

TP.sys.setcfg('path.app_tst', '~app_base/tst');
TP.sys.setcfg('path.lib_tst', '~lib_base/tst');

TP.sys.setcfg('path.app_xml', '~/xml');
TP.sys.setcfg('path.lib_xml', '~lib_tibet/xml');

TP.sys.setcfg('path.app_xsl', '~/xsl');
TP.sys.setcfg('path.lib_xsl', '~lib_tibet/xsl');

TP.sys.setcfg('path.app_xs', '~/xs');
TP.sys.setcfg('path.lib_xs', '~lib_tibet/xs');

//  app-only virtual paths
TP.sys.setcfg('path.app_boot', '~tibet/base/lib/tibet/src');
TP.sys.setcfg('path.app_cache', '~app_tmp/cache');
TP.sys.setcfg('path.app_change', '~app_src/changes');
TP.sys.setcfg('path.app_log', '~app_base/log');
TP.sys.setcfg('path.app_tmp', '~app_base/tmp');
TP.sys.setcfg('path.app_xmlbase', '~app_html');

//  path to the json file (which avoids x-domain security issues) with the
//  latest TIBET version number for version checking the root library.
TP.sys.setcfg('path.lib_version_file', 'https://gist.github.com/raw/4651885');
//TP.sys.setcfg('path.lib_version_file',
//                'http://technicalpursuit.com/tibet/latest_build.js');

//  TIBET namespace source is used often enough that a shortcut is nice
TP.sys.setcfg('path.tibet_src', '~lib_src/tibet');

// Tool paths
TP.sys.setcfg('path.tdp_root', '~tibet/tdp');
TP.sys.setcfg('path.tdp_src', '~tdp_root/src');

TP.sys.setcfg('path.ide_root', '~tibet/sherpa');
TP.sys.setcfg('path.ide_src', '~ide_root/src');

//  ------------------------------------------------------------------------
//  FEATURE CHECKING
//  ------------------------------------------------------------------------

//  simple "dictionary" of feature names and tests for registered features
if (TP.sys.$features == null) {
    TP.sys.$features = {};
    TP.sys.$featureTests = {};
}

//  ------------------------------------------------------------------------

TP.sys.hasFeature = function(aFeatureName, retest) {

    /**
     * @name hasFeature
     * @synopsis Returns true if the named feature is a feature of the current
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

//  ------------------------------------------------------------------------

TP.sys.addFeatureTest = function(aFeatureName, featureTest, testNow) {

    /**
     * @name addFeatureTest
     * @synopsis Adds a feature test under the name provided. If testNow is
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

//  ------------------------------------------------------------------------

TP.sys.hasFeatureTest = function(aFeatureName) {

    /**
     * @name hasFeatureTest
     * @synopsis Returns whether or not a particular feature test exists.
     * @param {String} aFeatureName The feature name, typically provided as a
     *     constant from a published list of names.
     * @return {Boolean} True if the feature test is defined.
     */

    return (typeof TP.sys.$featureTests[aFeatureName] === 'function');
};

//  ------------------------------------------------------------------------
//  STANDARD FEATURE TESTS
//  ------------------------------------------------------------------------

TP.sys.addFeatureTest('gecko',
                        function() {

                            return TP.boot.isUA('gecko');
                        });

//  ---

TP.sys.addFeatureTest('firefox',
                        function() {

                            return TP.boot.isUA('firefox');
                        });
//  ---

TP.sys.addFeatureTest('trident',
                        function() {

                            return TP.boot.isUA('trident');
                        });

//  ---

TP.sys.addFeatureTest('ie',
                        function() {

                            return TP.boot.isUA('ie');
                        });

//  ---

TP.sys.addFeatureTest('webkit',
                        function() {

                            return TP.boot.isUA('webkit');
                        });

//  ---

TP.sys.addFeatureTest('safari',
                        function() {

                            return TP.boot.isUA('safari');
                        });

//  ---

TP.sys.addFeatureTest('chrome',
                        function() {

                            return TP.boot.isUA('chrome');
                        });

//  ------------------------------------------------------------------------
//  MODULE CHECKING
//  ------------------------------------------------------------------------

TP.sys.hasModule = function(aModuleFile, aTarget) {

    /**
     * @name hasModule
     * @synopsis Returns true if the named module/target configuration has been
     *     loaded. If the target isn't defined then the 'base' target is
     *     assumed. NOTE that the 'full' target is always checked and if that
     *     target has been loaded it is assumed that any specific target has
     *     also been loaded.
     * @param {String} aModuleFile A module filename, which should typically be
     *     a .xml file in the lib_cfg or app_cfg path.
     * @param {String} aTarget A specific target name. Default is 'full'.
     * @return {Boolean} True if the module/target has been loaded.
     * @todo
     */

    var target;

    target = aTarget || 'base';

    //  if the full target has loaded we presume all other targets were a
    //  part of that and that the target is available
    if (TP.boot.$$modules[aModuleFile + '#' + 'full'] === true) {
        return true;
    }

    return TP.boot.$$modules[aModuleFile + '#' + target] === true;
};

//  ------------------------------------------------------------------------
//  GLOBAL MGMT
//  ------------------------------------------------------------------------

//  define the tracking collection for TIBET's global symbols so any
//  early-stage boot targets can leverage the TP.sys.addGlobal call
if (TP.sys.$globals == null) {
    TP.sys.$globals = [];
}

//  ------------------------------------------------------------------------

TP.sys.addGlobal = function(aName, aValue, force) {

    /**
     * @name addGlobal
     * @synopsis Defines a global variable and adds it to TIBET's list of
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

    //  we prefer explicit tests
    if (aName == null || aName === '') {
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

//  ------------------------------------------------------------------------
//  STDIO FUNCTIONS
//  ------------------------------------------------------------------------

/**
 * @Standard (reusable) input/output/error functions.
 *
 *     These provide a way to configure where input and output should be
 *     directedfor generic IO hooks. You can alter how the boot process acquires
 *     input and provides output by updating these hooks in your configuration
 *     file's'boot_init' target. See tibet.xml for more information.
 *
 *     Note that these invoke the TP.boot.log() function to ensure that
 *     TP.boot.$stdout() and TP.boot.$stderr() also get captured in the TIBET
 *     bootlog.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.boot.$alert = alert;
TP.boot.$prompt = prompt;
TP.boot.$confirm = confirm;

//  alias only happens if TP.boot.$dialog hasn't been defined. Avoids load
//  ordering and speculative parsing problems.
if (TP.boot.$dialog == null) {
    TP.boot.$dialog = TP.boot.$alert;
}

TP.boot.$notify = TP.boot.$alert;
TP.boot.$status = function(str) { try { top.status = str; } catch (e) {} };

//  ------------------------------------------------------------------------

TP.STDERR_ALERT = function(str, obj) {

    TP.STDERR_CONSOLE(str, obj);

    TP.boot.$alert(str, obj);

    return;
};

TP.STDERR_BREAK = function(str, obj) {

    TP.STDERR_CONSOLE(str, obj);

    debugger;
    return;
};

TP.STDERR_CONSOLE = function(str, obj) {

    TP.STDERR_LOG(str, obj);

    if (top.console && top.console.log) {
        top.console.log(str);
    } else {
        //  Won't always show depending on security restrictions.
        TP.boot.$status(str);
    }

    return;
};

TP.STDERR_DIALOG = function(str, obj) {

    TP.STDERR_CONSOLE(str, obj);

    TP.boot.$dialog(str, 'STDERR', true);

    return;
};

TP.STDERR_LOG = function(str, obj) {

    if (!TP.sys.hasInitialized()) {
        if (obj != null) {
            //  'obj' is what has been created by TP.boot.$ec(). The
            //  TP.error() call wants that as its first object, but it wants
            //  the message too (in this file, we use TP.boot.$ec() without
            //  a message).
            try {
                obj.message = str;
                TP.boot.log('ERROR ' + TP.boot.$str(obj), TP.ERROR);
            } catch (e) {
                TP.boot.log('ERROR ' + str, TP.ERROR);
            }
        } else {
            TP.boot.log('ERROR ' + str, TP.ERROR);
        }
    } else {
        if (TP.boot.$isValid(obj)) {
            //  'obj' is what has been creatd by TP.boot.$ec(). The
            //  TP.error() call wants that as its first object, but it wants
            //  the message too (in this file, we use TP.boot.$ec() without
            //  a message).
            try {
                obj.message = str;
                TP.error(obj, TP.LOG, arguments);
            } catch (e) {
                TP.error(str, TP.LOG, arguments);
            }
        } else {
            TP.error(str, TP.LOG, arguments);
        }
    }

    return;
};

TP.STDERR_NOTIFY = function(str, obj) {

    TP.STDERR_CONSOLE(str, obj);

    TP.boot.$notify(str, obj);

    return;
};

TP.STDERR_NULL = function(str, obj) {

    return;
};

TP.STDERR_STATUS = function(str, obj) {

    TP.STDERR_CONSOLE(str, obj);

    //  NOTE that we don't pass second arg to TP.boot.$status() here since
    //  we don't want to change the target, we want to target top.status.
    TP.boot.$status(str);

    return;
};

//  ------------------------------------------------------------------------

TP.STDIN_CONFIRM = function(msg) {

    var input;

    input = confirm(msg == null ? '?' : msg);
    if (input == null || input === '') {
        return null;
    } else {
        return input;
    }
};

TP.STDIN_NULL = function(str) {

    return;
};

TP.STDIN_PROMPT = function(msg, def) {

    var input;

    input = prompt(msg == null ? '?' : msg, (def == null ? '' : def));
    if (input == null || input === '') {
        return null;
    } else {
        return input;
    }
};

//  ------------------------------------------------------------------------

TP.STDOUT_ALERT = function(str, obj) {

    TP.STDOUT_LOG(str, obj);

    TP.boot.$alert(str);

    return;
};

TP.STDOUT_CONSOLE = function(str, obj) {

    TP.STDOUT_LOG(str, obj);

    if (top.console && top.console.log) {
        top.console.log(str);
    }
};

TP.STDOUT_DIALOG = function(str, obj) {

    TP.STDOUT_LOG(str, obj);

    TP.boot.$dialog(str, 'STDOUT', true);

    return;
};

TP.STDOUT_LOG = function(str, obj) {

    if (!TP.sys.hasInitialized()) {
        if (obj != null) {
            //  'obj' is what has been creatd by TP.boot.$ec(). The
            //  TP.error() call wants that as its first object, but it wants
            //  the message too (in this file, we use TP.boot.$ec() without
            //  a message).
            try {
                obj.message = str;
                TP.boot.log('INFO ' + TP.boot.$str(obj), TP.INFO);
            } catch (e) {
                TP.boot.log('INFO ' + str, TP.INFO);
            }
        } else {
            TP.boot.log('INFO ' + str, TP.INFO);
        }

        //  This is typically silent except for 'console' and 'status' mode.
        TP.boot.$bootdisplay(str, 'logmsg');
    } else {
        if (TP.boot.$isValid(obj)) {
            //  'obj' is what has been creatd by TP.boot.$ec(). The
            //  TP.info() call wants that as its first object, but it wants
            //  the message too (in this file, we use TP.boot.$ec() without
            //  a message).
            try {
                obj.message = str;
                TP.info(obj, TP.LOG, arguments);
            } catch (e) {
                TP.info(str, TP.LOG, arguments);
            }
        } else {
            TP.info(str, TP.LOG, arguments);
        }
    }

    return;
};

TP.STDOUT_NOTIFY = function(str, obj) {

    TP.STDOUT_LOG(str, obj);

    TP.boot.$notify(str, obj);

    return;
};

TP.STDOUT_NULL = function(str, obj) {

    return;
};

TP.STDOUT_STATUS = function(str, obj) {

    TP.STDOUT_LOG(str, obj);

    //  NOTE that we don't pass second arg to TP.boot.$status() here since
    //  we don't want to change the target, we want to target top.status.
    TP.boot.$status(str);

    return;
};

//  ------------------------------------------------------------------------

//  declarations of 'stdio' function references. these get installed based
//  on parameters that can alter how the boot process manages IO/logging.
//  NOTE that there are actually two forms of these variables, the TP.boot
//  version and a TP version found later. The TP.boot versions are specific
//  to IO for the boot process while the TP variants (TP.stdin, TP.stdout,
//  TP.stderr) are used by all of TIBET as low-level IO hooks often used by
//  TIBET tools.

//  define the default mappings. the boot.bootfile can override as needed
TP.boot.$stderr = TP.STDERR_CONSOLE;
TP.boot.$stdin = TP.STDIN_PROMPT;
TP.boot.$stdout = TP.STDOUT_LOG;

//  ------------------------------------------------------------------------
//  ERROR-HANDLING FUNCTIONS
//  ------------------------------------------------------------------------

//  capture current state so we can reset it. setting it to null doesn't
//  work in all environments so we can put it back in place only by using
//  window.onerror = TP.sys.offerror;
TP.sys.offerror = window.onerror;

//  define a new one we can count on to call TP.boot.$stderr() for us, the
//  TIBET kernel will define a similar one itself for TIBET applications
window.onerror = function(msg, url, line) {

    var file,
        path,
        str;

    file = TP.boot.$$onerrorFile;
    path = (file == null) ? url.slice(url.lastIndexOf('/')) : file;

    str = TP.boot.$join(msg, ' in: ', path, ' line: ', line);

    TP.boot.$stderr(str);

    //  NOTE the hardcoded CSS reference here.
    //  TODO: should this use a configuration parameter or property value?
    TP.boot.$bootdisplay(str, 'logerr');

    //  set flag to terminate boot process based on configuration flags
    TP.boot.$$stop = true;

    //  set a non-zero status to signify that an error occurred to callers
    //  which won't see a native Error in a catch block
    $STATUS = -1;

    return false;
};

//  ------------------------------------------------------------------------
//  ERROR NOTIFICATION
//  ------------------------------------------------------------------------

/*
Placeholders for TIBET's standard error notification functions.
*/

//  ------------------------------------------------------------------------

TP.boot.$dialog = function(aMessage, aWindowName, isHTML) {

    /**
     * @name $dialog
     * @synopsis Performs window-based notification of aMessage. This offers an
     *     alternative to alert panels which often don't meet size requirements
     *     for large output blocks, which are clipped by standard alert panels.
     *     Reusing aWindowName causes it to work like a log window, appending
     *     content to the same window.
     * @param {String} aMessage The content to display.
     * @param {String} aWindowName A window name to use. If the window already
     *     exists then this will cause the new message to be appended. If no
     *     window name is provided a new window will be created with the
     *     content.
     * @param {Boolean} isHTML If true, the content is presumed to be HTML that
     *     should be escaped for display.The default is false.
     * @return {Window} The window used.
     * @todo
     */

    var msg,
        msgNode,
        base,

        t,
        l,

        w,
        h,
        x,
        y,
        features,

        winName,
        tmpwin,
        content;

    msg = (aMessage == null) ? '' : aMessage;

    //  support messaging of html as source
    if (isHTML === true) {
        msg = msg.replace(/</g, '&lt;');
        msg = msg.replace(/>/g, '&gt;');
    }

    //  build up the feature string we need to create new windows so we can
    //  pass it to the open call
    t = TP.boot.isUA('IE') ? ',top=' : ',screenY=';
    l = TP.boot.isUA('IE') ? ',left=' : ',screenX=';

    w = parseInt(screen.width / 2, 10);
    h = parseInt(screen.height / 2, 10);

    x = parseInt((screen.width / 2) - (w / 2), 10);
    y = parseInt((screen.height / 2) - (h / 2), 10);

    features = TP.boot.$join(
                'location=no,menubar=no,toolbar=no,status=no,',
                'scrollbars=yes,resizable=yes',
                ',width=', w, ',height=', h,
                t, y, l, x);

    //  we'll default to '' if no name was provided, causing a new window to
    //  open
    winName = (aWindowName != null) ? aWindowName : 'NOTIFY';

    //  IE can't handle window names with non-alpha characters so we
    //  strip them here.
    winName = winName.replace(/\W+/g, '');

    //  is it just me or is this another boneheaded API, having to call
    //  open to see if a window exists, and getting a new one if it doesn't
    try {
        tmpwin = window.open('', winName, features);
    } catch (e) {
        //  throw away any execption here
    }

    //  popup blockers may cause problems if notify is external. also,
    //  timing can be an issue here. in the tools we can leverage click
    //  events to work around the popup problem
    if (!tmpwin) {
        TP.boot.$alert(msg);

        return;
    }

    //  since we can't tell if the window already existed any other way, see
    //  if it has content we recognize...
    if ((content = tmpwin.document.getElementById('NOTIFICATIONS')) == null) {
        //  new window? we'll need to put our template content in place
        //  along with the initial message text. NOTE that during boot we've
        //  got a large block of CSS here, which would normally be in an
        //  external linked file, but we don't want pathing issues to mean
        //  that our notification of errors isn't styled properly.
        TP.$$NOTIFY_ARRAY.length = 0;
        TP.$$NOTIFY_ARRAY.push(
            '<html>',
            '<head>',
            '<title>TIBET&#153; Message Notification ' + winName + '</title>',
            '<style type="text/css">',

            'html, body { width: 100%; height: 100%; margin: 0px; padding: 0px; border: 0px; font-family: Tahoma, Verdana, Arial, Helvetica, sans-serif; font-weight: normal; font-style: normal; font-size: small; color: black; background-color: white; overflow: hidden} ',

            ' #NOTIFY_MENU { width: 100%; height: 5%; background-color: #DDD; border-top: 1px solid black; border-bottom: 1px solid black; text-align: center; padding: .25em; }',

            ' #NOTIFY_MENU input { color: #369; border: 1px solid #369; background-color: white; }',

            ' #NOTIFICATIONS { position: absolute; top: 6%; width: 100%; height: 94%; overflow: scroll; background-color: white; margin: 0px; padding: 0px;}',

            ' #NOTIFICATIONS li { margin: .5em; padding-bottom: .5em; border-bottom: 3px dotted #369; }',

            ' #NOTIFICATIONS li span { padding: .5em; }',

            '</style>',
            '</head>',
            '<body><div id="NOTIFY_MENU">',
            '<input type="button" value="Clear" onclick="javascript:document.getElementById(\'NOTIFICATIONS\').innerHTML=\'\'"/>',
            '</div>',
            '<ol id="NOTIFICATIONS">',
            '<li><span style="font-weight:bold">TP.boot.$dialog() output:</span></li>',
            '</ol>',
            '</body>',
            '</html>');

        base = TP.$$NOTIFY_ARRAY.join('');

        tmpwin.document.open();
        tmpwin.document.write(base);
        tmpwin.document.close();

        content = tmpwin.document.getElementById('NOTIFICATIONS');
    }

    //  build up a message node we can append
    TP.$$NOTIFY_ARRAY.length = 0;
    TP.$$NOTIFY_ARRAY.push(
            '<li xmlns="http://www.w3.org/1999/xhtml">',
            '<span class="logdate">',
            (new Date().getTime()).toString(),
            '</span>',
            '<span class="logmsg">',
            msg.replace(/<(?:\/*?)html:/g, '<'),
            '</span>',
            '</li>');

    if (!TP.boot.isUA('IE')) {
        try {
            msgNode = TP.boot.$documentFromString(
                                    TP.$$NOTIFY_ARRAY.join(''), false);
            msgNode = msgNode.documentElement;
        } catch (e) {
        }

        if (msgNode == null) {
            msg = msg.toString();

            TP.$$NOTIFY_ARRAY.length = 0;
            TP.$$NOTIFY_ARRAY.push(
                    '<li xmlns="http://www.w3.org/1999/xhtml">',
                    '<span class="logdate">',
                    (new Date().getTime()).toString(),
                    '</span>',
                    '<span class="logmsg">',
                    'MESSAGE',
                    '<span>',
                    '</li>');

            //  we'll have to massage the node a bit to replace the original
            //  text with our new text node, otherwise we'll either get
            //  "MESSAGE" or [object text] as our message
            try {
                msgNode = TP.boot.$documentFromString(
                                    TP.$$NOTIFY_ARRAY.join(''), false);
                msgNode = msgNode.documentElement;

                TP.boot.$nodeReplaceChild(
                            msgNode.firstChild,
                            msgNode.createTextNode(msg),
                            msgNode.lastChild.firstChild);
            } catch (e) {
            }
        }

        //  add the message to the log, the LOG's firstChild is an OL
        try {
            TP.boot.$nodeAppendChild(content, msgNode);
        } catch (e) {
            //  not much we can do here
            return;
        }
    } else if (TP.boot.isUA('IE')) {
        //  add the message to the log, the LOG's firstChild is an OL
        try {
            content.insertAdjacentHTML('BeforeEnd',
                                        TP.$$NOTIFY_ARRAY.join(''));
        } catch (e) {
            //  TODO:   anything we can do here?
            return;
        }
    }

    return tmpwin;
};

//  ------------------------------------------------------------------------
//  BROWSER DETECTION
//  ------------------------------------------------------------------------

/*
TIBET boots different content based on the browser, loading IE code on IE,
Safari code on Safari, and so on. Given the scope of features we're trying
to normalize that seems like a logical choice, the alternative is an even
larger codebase, some portion of which will never run for each client.

Combining our desire to load only the code that works for the current
browser with the reality of version-specific bugs which object-detection
can't possibly help detect we opt for browser detection -- aka user
agent string decomposition and testing -- augmented with a little object
detection to determine what browser we appear to be loading TIBET into.

Yes, we know browers can (and do) lie but by adding in a bit of feature
detection we can do pretty well at nailing down during the boot sequence
whether the browser is one we support.

Of course, it's still possible to sneak past this routine. The end result is
simply that the application is likely to fail, in some cases spectacularly,
and that the support call is gonna be really short..."You spoofed IE8 from
Safari? Ok, well, have a nice day. :)".
*/

//  ------------------------------------------------------------------------

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

//  ------------------------------------------------------------------------

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

//  ------------------------------------------------------------------------
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

//  ------------------------------------------------------------------------

//  Configure the language reference, this plays into localization later
if (navigator.userLanguage != null) {
    TP.$language = navigator.userLanguage;
} else {
    TP.$language = navigator.language;
}

//  ------------------------------------------------------------------------
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

//  ------------------------------------------------------------------------
//  DETECTION FUNCTIONS
//  ------------------------------------------------------------------------

TP.boot.getBrowser = function() {

    /**
     * @name getBrowser
     * @synopsis Returns the standard 'browser' string, typically one of:
     *     'firefox', 'ie', 'safari', 'chrome'.
     * @return {String} The String representing the 'browser'.
     */

    return TP.$browser;
};

//  ------------------------------------------------------------------------

TP.boot.getBrowserUI = function() {

    /**
     * @name getBrowserUI
     * @synopsis Returns the standard 'browser UI' string, typically one of:
     *     'gecko', 'trident', 'webkit'.
     * @return {String} The String representing the 'browser UI'.
     */

    return TP.$browserUI;
};

//  ------------------------------------------------------------------------

TP.boot.isMac = function() {

    return TP.$platform.indexOf('mac') === 0;
};

//  ------------------------------------------------------------------------

TP.boot.isNix = function() {

    return TP.$platform.indexOf('*nix') === 0;
};

//  ------------------------------------------------------------------------

TP.boot.isWin = function() {

    return TP.$platform.indexOf('win') === 0 ||
            TP.$platform.indexOf('vista') === 0;
};

//  ------------------------------------------------------------------------

TP.boot.isUA = function(browser, varargs) {

    /**
     * @name isUA
     * @synopsis Tests the current user agent (UA) for a specific version, or a
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

//  ------------------------------------------------------------------------
//  IE MSXML VERSION TRACKING
//  ------------------------------------------------------------------------

/*
Various tasks such as document creation etc. can be sensitive to the MSXML
and JScript versions available in IE. We test for that information here.
*/

//  ------------------------------------------------------------------------

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

//  ------------------------------------------------------------------------

TP.boot.isMSXML = function(version, comparison) {

    /**
     * @name isMSXML
     * @synopsis Tests IE's MSXML version for an explicit version, or a version
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

//  ------------------------------------------------------------------------
//  SUPPORTED PLATFORM TRACKING
//  ------------------------------------------------------------------------

TP.boot.isSupported = function() {

    /**
     * @name isSupported
     * @synopsis Returns whether or not TIBET is supported in the browser that
     *     is currently trying to execute it.
     * @return {Boolean} Whether or not TIBET is supported in the currently
     *     executing browser.
     */

    //  Firefox 3.0 and later, with the seemingly requisite exceptions
    if (TP.boot.isUA('GECKO', 1, 9, 0, TP.UP)) {
        return true;
    }

    //  Safari 3.X for Mac/Windows/iPhone2x (and Chrome as well)
    if (TP.boot.isUA('WEBKIT', 522, 11, TP.UP)) {
        return true;
    }

    //  IE8+ on Windows (no IE/Mac)
    if (TP.boot.isWin()) {
        return TP.boot.isUA('IE', 8, TP.UP);
    }

    return false;
};

//  ------------------------------------------------------------------------
//  STATUS BAR WRITABILITY
//  ------------------------------------------------------------------------

/**
 * @Firefox and later versions of Mozilla default to turning off status bar
 *     writability. This code will check for that case and display a message to
 *     theuser informing them about the potential for missing out on error
 *     messages.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.boot.$checkStatus = function() {

    /**
     * @name $checkStatus
     * @synopsis Checks for status-bar writability in Mozilla-based browers
     *     where users might otherwise not be aware of the messages that the
     *     application wants to output to window.status.
     * @description Note that this function requires Privileges and that this
     *     can be disconcerting to certain users, so the default is to let the
     *     application run without concern for whether the user ever sees a
     *     status bar message in the window's native status bar. Unfortunately
     *     because of how Mozilla implements this it's typically necessary to
     *     implement your own application status bar if you need the user to be
     *     kept informed in a lightweight fashion.
     * @return {null}
     * @todo
     */

    var disabled,
        prefs;

    disabled = true;

    try {
        if (TP.sys.cfg('log.privilege_requests')) {
            TP.boot.$stdout('Privilege request at TP.boot.$checkStatus');
        }

        netscape.security.PrivilegeManager.enablePrivilege(
                                            'UniversalXPConnect');
        prefs = Components.classes[
                    '@mozilla.org/preferences-service;1'].getService(
                        Components.interfaces.nsIPrefBranch);

        if (prefs.getPrefType(
                'dom.disable_window_status_change') === prefs.PREF_BOOL) {
            disabled =
                prefs.getBoolPref('dom.disable_window_status_change');
        }

        if (disabled === true) {
            TP.boot.$alert(
                TP.boot.$join(
                'You appear to be running in a Mozilla-based browser\n',
                'with "Change status bar text" turned off. You won\'t\n',
                'see TIBET errors or other status messages until\n',
                'you enable this setting. See the install guide.'));
        }
    } catch (e) {
        TP.boot.$stderr(
            TP.boot.$join(
            'You appear to be running in a Mozilla-based browser\n',
            'with signed.applets.codebase_principal_support\n',
            'set to false. You won\'t be able to perform certain\n',
            'TIBET operations until you set this to true. For more\n',
            'information see the TIBET install guide.'), TP.boot.$ec(e));
    }

    return;
};

//  ------------------------------------------------------------------------
//  LOAD INFORMATION
//  ------------------------------------------------------------------------

/*
It's common to need information about the location from which TIBET was
loaded. This set of functions provides access to the host, port, protocol,
and pathname which were used to load TIBET, as well as the 'launch path'.
*/

//  first define whether we were loaded from file url or a web server
TP.sys.$httpBased = (window.location.protocol.indexOf('file') !== 0);

TP.sys.$scheme = window.location.protocol;
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

//  ------------------------------------------------------------------------

TP.sys.isHTTPBased = function() {

    /**
     * @name isHTTPBased
     * @synopsis Returns true if the TIBET codebase was loaded via HTTP.
     * @return {Boolean} Whether or not the TIBET codebase was loaded over
     *     HTTP.
     */

    return TP.sys.$httpBased;
};

//  ------------------------------------------------------------------------

TP.sys.setcfg('tibet.offline', !TP.sys.isHTTPBased());

//  ------------------------------------------------------------------------

TP.sys.setcfg('tibet.simple_cors_only', false);

//  ------------------------------------------------------------------------

TP.sys.getLaunchRoot = function() {

    /**
     * @name getLaunchRoot
     * @synopsis Returns the "launch root", either the web server's root or the
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
        str = TP.sys.getScheme() + '//' + TP.sys.getHost();
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

//  ------------------------------------------------------------------------

TP.sys.getHost = function() {

    /**
     * @name getHost
     * @synopsis Returns the hostname from which TIBET was loaded.
     * @return {String} The host from which TIBET was loaded.
     */

    return TP.sys.$host;
};

//  ------------------------------------------------------------------------

TP.sys.getPathname = function() {

    /**
     * @name getPathname
     * @synopsis Returns the pathname from which TIBET was loaded.
     * @return {String} The pathname from which TIBET was loaded.
     */

    return TP.sys.$pathname;
};

//  ------------------------------------------------------------------------

TP.sys.getPort = function() {

    /**
     * @name getPort
     * @synopsis Returns the port number string from which TIBET was loaded. If
     *     no port number was specified in the load URL this string is empty.
     * @return {Number} The port number from which TIBET was loaded.
     */

    return TP.sys.$port;
};

//  ------------------------------------------------------------------------

TP.sys.getScheme = function() {

    /**
     * @name getScheme
     * @synopsis Returns the scheme used when TIBET was loaded. This is
     *     typically http or https which allows TIBET to determine if a secure
     *     connection is required as the default for future connections to the
     *     server.
     * @return {String} The protocol used when TIBET was loaded.
     * @todo
     */

    return TP.sys.$scheme;
};

//  ------------------------------------------------------------------------
//  HTTP PRIMITIVES
//  ------------------------------------------------------------------------

/**
 * @HTTP protocol support primitives. These provide the foundation for the
 *     HTTP-based content operations specific to booting. Full-featured versions
 *     ofthese are also found in the TIBET kernel, which adds support for a
 *     number ofmore advanced features.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.boot.$httpCreate = function() {

    /**
     * @name $httpCreate
     * @synopsis Returns a platform-specific XMLHttpRequest object for use.
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
                        //'Msxml2.XMLHTTP.4.0',
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
        TP.boot.$stderr(
                'RequestCreationError: could not create request object.');
    }

    return request;
};

//  ------------------------------------------------------------------------

TP.boot.$httpError = function(aString, errObj) {

    /**
     * @name $httpError
     * @synopsis Throws an error containing aString, and optionally logs the
     *     string to TP.boot.$stderr(). This allows debug mode to control
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
    if (TP.sys.cfg('boot.debughttp')) {
        TP.boot.$stderr(aString, errObj);
    }

    throw new Error(aString);
};

//  ------------------------------------------------------------------------

TP.boot.$httpCall = function(targetUrl, callType, callHeaders, callUri) {

    /**
     * @name $httpCall
     * @synopsis Performs an XMLHTTPRequest based on the information provided.
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
        return TP.boot.$httpError('InvalidFileName: ' + targetUrl);
    }

    if (callType == null) {
        return TP.boot.$httpError('InvalidCallType: ' + callType);
    }

    //  same domain? if not we'll need permission to do this
    if (TP.boot.isUA('GECKO') &&
        (targetUrl.indexOf(TP.sys.getLaunchRoot()) !== 0)) {
        try {
            if (TP.sys.cfg('log.privilege_requests')) {
                TP.boot.$stdout('Privilege request at TP.boot.$httpCall');
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
        //  we're loading synchronously in the boot code so we can reuse
        if (TP.boot.$$httpRequest != null) {
            httpObj = TP.boot.$$httpRequest;
        } else {
            httpObj = TP.boot.$httpCreate();

            //  If its Mozilla, and we're not trying to load XML, then set
            //  the MIME type to 'text/plain' to avoid parsing errors due to
            //  Moz trying to turn everything into XML and then complaining
            if (TP.boot.isUA('GECKO') &&
                (TP.boot.$uriResultType(targetUrl) !== TP.DOM)) {
                httpObj.overrideMimeType('text/plain');
            }
        }
    } catch (e) {
        return TP.boot.$httpError(
                        'RequestObjectError.  url: ' + targetUrl,
                        TP.boot.$ec(e));
    }

    try {
        httpObj.open(callType, targetUrl, false);
    } catch (e) {
        return TP.boot.$httpError(
                        'RequestOpenError. url: ' + targetUrl,
                        TP.boot.$ec(e));
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
        if (TP.sys.cfg('boot.debughttp')) {
            TP.boot.$stdout('TP.boot.$httpCall() targetUrl: ' +
                                    targetUrl);
            TP.boot.$stdout('TP.boot.$httpCall() callType: ' +
                                    callType);
            TP.boot.$stdout('TP.boot.$httpCall() callUri: ' +
                                    ((callUri != null) ? callUri : 'n/a'));
        }

        httpObj.send(callUri);

        if (TP.sys.cfg('boot.debughttp')) {
            TP.boot.$stdout('TP.boot.$httpCall() status: ' +
                                        httpObj.status);
            TP.boot.$stdout('TP.boot.$httpCall() headers: ' +
                                        httpObj.getAllResponseHeaders());

            if (TP.boot.$$verbose) {
                TP.boot.$stdout('TP.boot.$httpCall() result: ' +
                                    httpObj.responseText);
            }
        }
    } catch (e) {
        return TP.boot.$httpError(
                    'HTTPCallException: url: ' + targetUrl,
                    TP.boot.$ec(e));
    }

    return httpObj;
};

//  ------------------------------------------------------------------------
//  FILE PATHS
//  ------------------------------------------------------------------------

/*
File path manipulation. These provide the necessary hooks to alter file
names to meet platform requirements and deal with "virtualized" paths.
*/

//  ------------------------------------------------------------------------

TP.boot.$uriCollapsePath = function(aPath) {

    /**
     * @name $uriCollapsePath
     * @synopsis Collapses a URI path to remove any embedded . or .. segments
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

//  ------------------------------------------------------------------------

TP.boot.$uriExpandPath = function(aPath) {

    /**
     * @name $uriExpandPath
     * @synopsis Returns the expanded form of the TIBET '~' (tilde) path
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

    if (!aPath || aPath.indexOf('~') !== 0) {
        return aPath;
    }

    //  we'll be altering the value so it's best not to mod the parameter
    path = aPath;

    if (path.indexOf('~/') === 0 || path === '~') {
        path = TP.boot.$uriJoinPaths(TP.boot.$getAppRoot(), path.slice(2));
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
            }
        }
    }

    //  variable expansions can sometimes create additional ~ paths
    if (path !== aPath && path.indexOf('~') === 0) {
        path = TP.boot.$uriExpandPath(path);
    }

    //  Cache the expanded value so we don't do this work again.
    TP.boot.$$fullPaths[aPath] = path;

    return path;
};

//  ------------------------------------------------------------------------

TP.boot.$uriInLocalFormat = function(aPath) {

    /**
     * @name $uriInLocalFormat
     * @synopsis Returns the path with proper adjustments made to represent a
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

//  ------------------------------------------------------------------------

TP.boot.$uriInTIBETFormat = function(aPath) {

    /**
     * @name $uriInTIBETFormat
     * @synopsis Returns the path with typical TIBET prefixes for app_cfg,
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

    path = aPath.replace(TP.boot.$uriExpandPath('~app_cfg'), '~app_cfg');
    path = path.replace(TP.boot.$uriExpandPath('~lib_cfg'), '~lib_cfg');
    path = path.replace(TP.boot.$uriExpandPath('~app_src'), '~app_src');
    path = path.replace(TP.boot.$uriExpandPath('~lib_src'), '~lib_src');
    path = path.replace(TP.boot.$uriExpandPath('~'), '~');
    path = path.replace(TP.boot.$uriExpandPath('~tibet'), '~tibet');

    return path;
};

//  ------------------------------------------------------------------------

TP.boot.$uriJoinPaths = function(firstPath, secondPath) {

    /**
     * @name uriJoinPaths
     * @synopsis Returns the two path components joined appropriately. Note that
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

//  ------------------------------------------------------------------------

TP.boot.$uriMinusFileScheme = function(aPath) {

    /**
     * @name $uriMinusFileScheme
     * @synopsis Returns the filename trimmed of any leading file://[/] chars.
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

//  ------------------------------------------------------------------------

TP.boot.$uriPlusFileScheme = function(aPath) {

    /**
     * @name $uriPlusFileScheme
     * @synopsis Returns the filename padded with leading file://[/] chars. This
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

//  ------------------------------------------------------------------------

TP.boot.$uriRelativeToPath = function(firstPath, secondPath, filePath) {

    /**
     * @name uriRelativeToPath
     * @synopsis Returns a "relativized" version of the firstPath at it relates
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
    //  second path (~ vs. ~app_tmp) so check for that
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

//  ------------------------------------------------------------------------

TP.boot.$uriResult = function(text, type) {

    /**
     * @name $uriResult
     * @synopsis Returns the proper result format given the result text and
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

//  ------------------------------------------------------------------------

TP.boot.$uriResultType = function(targetUrl, resultType) {

    /**
     * @name $uriResultType
     * @synopsis Returns a reasonable result type, TP.TEXT or TP.DOM, based on
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

//  ------------------------------------------------------------------------
//  FILE ROOT
//  ------------------------------------------------------------------------

/*
Utilities for working with relative and/or full paths to resources.
*/

//  ------------------------------------------------------------------------

TP.boot.$uriWithRoot = function(targetUrl) {

    /**
     * @name $uriWithRoot
     * @synopsis Returns the filename provided with any additional root
     *     information which is necessary to create a full path name. The root
     *     used is the result of calling TP.boot.$getRootPath(), which may be
     *     referencing either the lib or app root at the time of the call
     *     depending on the current settings.
     * @param {String} targetUrl A url to expand as needed.
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
    root = TP.boot.$getRootPath();

    return TP.boot.$uriJoinPaths(root, targetUrl);
};

//  ------------------------------------------------------------------------
//  FILE (RE)LOCATION
//  ------------------------------------------------------------------------

/**
 * @Provides methods for determining the true location of a file name. These are
 *     used when redirection of a file may be occuring. HTTP versions of these
 *     functions rely on the Location header values in 3xx return code results.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.boot.$uriLocation = function(targetUrl) {

    /**
     * @name $uriLocation
     * @synopsis Returns the true location of the file. If the file has been
     *     moved this will return the Location header value from the redirect,
     *     otherwise the original URL location is returned.
     * @param {String} targetUrl URL of the target file.
     * @raises InvalidFileName, FileAccessException, FileNotFound
     * @return {String} The true location of the file which may or may not be
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

//  ------------------------------------------------------------------------

TP.boot.$uriLocationFile = function(targetUrl) {

    /**
     * @name $uriLocationFile
     * @synopsis Returns the true location of the file. For file urls (no HTTP)
     *     this is the original url. HTTP urls will return a value based on
     *     whether the final url is a redirected value.
     * @param {String} targetUrl URL of the target file.
     * @raises InvalidFileName
     * @return {String} The true location of the file which may or may not be
     *     at targetUrl.
     */

    return targetUrl;
};

//  ------------------------------------------------------------------------

TP.boot.$uriLocationHttp = function(targetUrl) {

    /**
     * @name $uriLocationHttp
     * @synopsis Returns the true location of the file. If the file has been
     *     moved this will return the Location header value from the redirect,
     *     otherwise the original URL location is returned.
     * @param {String} targetUrl URL of the target file.
     * @raises InvalidFileName, FileAccessException, FileNotFound
     * @return {String} The true location of the file which may or may not be
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
            TP.boot.$stderr('FileNotFound: ' + targetUrl);
        }
    } catch (e) {
        TP.boot.$stderr('FileAccessException. url: ' + targetUrl,
                        TP.boot.$ec(e));
    }

    return null;
};

//  ------------------------------------------------------------------------
//  FILE AGING
//  ------------------------------------------------------------------------

/**
 * @Informational methods providing data such as last-modified-date. This is
 *     useful when trying to determine whether a file should be reloaded, or in
 *     determining whether a generated file is older than its source file.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.boot.$uriLastModified = function(targetUrl) {

    /**
     * @name $uriLastModified
     * @synopsis Returns the last-modified-date of the target file.
     * @param {String} targetUrl URL of the target file.
     * @raises InvalidFileName, UnsupportedFeature
     * @return {Date} The Date the targetUrl was last modified.
     */

    var fname;

    if (!targetUrl) {
        TP.boot.$stderr('InvalidFileName: ' + targetUrl);

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

//  ------------------------------------------------------------------------

TP.boot.$uriLastModifiedIEFile = function(targetUrl) {

    /**
     * @name $uriLastModifiedIEFile
     * @synopsis Returns the last-modified-date of a file in the file system.
     * @param {String} targetUrl URL of the target file.
     * @raises InvalidFileName, FileAccessException, FileNotFound
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
            TP.boot.$stderr('FileNotFound: ' + fname);
        }
    } catch (e) {
        TP.boot.$stderr('FileAccessException. url: ' + fname,
                        TP.boot.$ec(e));
    }

    return null;
};

//  ------------------------------------------------------------------------

TP.boot.$uriLastModifiedMozFile = function(targetUrl) {

    /**
     * @name $uriLastModifiedMozFile
     * @synopsis Returns the last-modified-date of a file in the file system.
     * @param {String} targetUrl URL of the target file.
     * @raises InvalidFileName, FileAccessException, PrivilegeException,
     *     FileNotFound, FileComponentError
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

//  ------------------------------------------------------------------------

TP.boot.$uriLastModifiedHttp = function(targetUrl) {

    /**
     * @name $uriLastModifiedHttp
     * @synopsis Returns the last-modified-date of a file on a web server.
     * @param {String} targetUrl URL of the target file.
     * @raises InvalidFileName, FileAccessException, FileNotFound
     * @return {Date} The Date the targetUrl was last modified.
     */

    var httpObj,
        header;

    //  leverage HEAD requests and HTTP headers to test file.
    try {
        httpObj = TP.boot.$httpCall(targetUrl, TP.HTTP_HEAD);

        if (httpObj.status === 200) {
            header = httpObj.getResponseHeader('Last-Modified');

            return new Date(header);
        } else if (httpObj.status >= 300 && httpObj.status <= 307) {
            return TP.boot.$uriLastModifiedMozHttp(
                            httpObj.getResponseHeader('Location'));
        } else {
            TP.boot.$stderr('FileNotFound: ' + targetUrl);
        }
    } catch (e) {
        TP.boot.$stderr('FileAccessException. url: ' + targetUrl,
                        TP.boot.$ec(e));
    }

    return null;
};

//  ------------------------------------------------------------------------
//  FILE COMPARISON
//  ------------------------------------------------------------------------

/*
Compares two files by last-modified-date. This is useful when trying to
determine whether a file should be reloaded, or in determining whether a
generated file is older than its source file.
*/

//  ------------------------------------------------------------------------

TP.boot.$uriCurrent = function(targetUrl, sourceUrl) {

    /**
     * @name $uriCurrent
     * @synopsis Returns true if targetUrl has a newer modified date than
     *     sourceUrl. This version dispatches to the proper low-level
     *     browser-specific version appropriate to the environment.
     * @param {String} targetUrl URL of the target file.
     * @param {String} sourceUrl URL of the source file.
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

        //  both files have dates, do the comparison
        return t1 >= t2;
    } catch (e) {
        //  error here means source is bad, but target is probably
        //  'more recent' in that case
        return true;
    }

    TP.boot.$stderr('UnsupportedFeature. TP.boot.$uriCurrent()');

    return false;
};

//  ------------------------------------------------------------------------
//  FILE EXISTENCE
//  ------------------------------------------------------------------------

/*
Any time we are provided with a file name we check for its existence using
an appropriate mechanism. Both Mozilla and IE provide utilities for this
purpose at the file system level. Likewise, both provide an HTTP interface
which can be used to test for file existence. This avoids 404's etc.
*/

//  ------------------------------------------------------------------------

TP.boot.$uriExists = function(targetUrl) {

    /**
     * @name $uriExists
     * @synopsis Returns true if targetUrl exists on the boot server.
     * @param {String} targetUrl URL of the target file.
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

//  ------------------------------------------------------------------------

TP.boot.$uriExistsFile = function(targetUrl) {

    /**
     * @name $uriExistsFile
     * @synopsis Returns true if targetUrl exists on the boot server.
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
                TP.boot.$stderr('FileAccessException. url: ' + targetUrl,
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

//  ------------------------------------------------------------------------

TP.boot.$uriExistsHttp = function(targetUrl) {

    /**
     * @name $uriExistsHttp
     * @synopsis Returns true if targetUrl exists on the boot server.
     * @param {String} targetUrl URL of the target file.
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

        TP.boot.$stderr('FileAccessException. url: ' + targetUrl,
                        TP.boot.$ec(e));

        return false;
    }

    return false;
};

//  ------------------------------------------------------------------------
//  FILE LOAD
//  ------------------------------------------------------------------------

/*
Numerous files including XML config/build files need to be loaded at various
times. The routines in this section read files from either the local file
system or the net and produce XML documents which can be manipulated.
*/

//  ------------------------------------------------------------------------

TP.boot.$uriLoad = function(targetUrl, resultType, targetType, isCacheable,
                            isModule)
{
    /**
     * @name $uriLoad
     * @synopsis Loads the content of a targetUrl, returning that content as
     *     either XML or text depending on the desired resultType. The work to
     *     load the content may include checking TIBET's client-side cache based
     *     on targetType and isCacheable values.
     * @param {String} targetUrl URL of the target file.
     * @param {TP.DOM|TP.TEXT} resultType Result as a DOM node or TEXT.
     * @param {String} targetType The nature of the target, 'source' or
     *     'manifest' are common values here.
     * @param {Boolean} isCacheable True if the content may be in the cache, and
     *     should be cached when loaded.
     * @param {Boolean} isModule True if the file being imported is a
     *     module-level file. This can impact cache storage logic.
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
    if (TP.sys.cfg('tibet.localcache') && (isCacheable === true)) {

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
                    if (TP.sys.cfg('boot.debugcache')) {
                        TP.boot.$stdout('Loaded ' +
                                        logpath +
                                        ' from cache.');
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
                        if (TP.sys.cfg('boot.debugcache')) {
                            TP.boot.$stdout('Found ' + logpath +
                                        ' date ' + lastmod);
                        }

                        //  NOTE that we'll have to rely on this routine to
                        //  cache the data when it's checking 304 states.
                        return TP.boot.$uriLoadCommonHttp(
                                            targetUrl,
                                            resultType,
                                            lastmod,
                                            isCacheable,
                                            isModule);
                    } else {
                        if (TP.sys.cfg('boot.debugcache')) {
                            TP.boot.$stdout('No modified date for ' +
                                            logpath);
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
                TP.sys.cfg('tibet.localcache') && (isCacheable === true),
                isModule);
    }

    return result;
};

//  ------------------------------------------------------------------------

TP.boot.$uriLoadCommonFile = function(targetUrl, resultType) {

    /**
     * @name $uriLoadCommonFile
     * @synopsis Loads (reads and produces an XML document for) targetUrl.
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
                            TP.boot.$ec(e));
            TP.sys.setcfg('boot.moz_xpcom', true);

            return TP.boot.$uriLoadMozFile(targetUrl, resultType);
        }

        return null;
    }

    return TP.boot.$uriResult(httpObj.responseText, resultType);
};

//  ------------------------------------------------------------------------

TP.boot.$uriLoadIEFile = function(targetUrl, resultType) {

    /**
     * @name $uriLoadIEFile
     * @synopsis Loads (reads and produces an XML document for) targetUrl.
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

//  ------------------------------------------------------------------------

TP.boot.$uriLoadMozFile = function(targetUrl, resultType) {

    /**
     * @name uriLoadMozFile
     * @synopsis Loads (reads and produces an XML document for) targetUrl. This
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
            TP.boot.$stdout('Privilege request at TP.boot.$uriLoadMozFile');
        }

        netscape.security.PrivilegeManager.enablePrivilege(
                                            'UniversalXPConnect');
    } catch (e) {
        TP.boot.$stderr('PrivilegeException. url: ' + targetUrl,
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
        TP.boot.$stderr('FileComponentError. url: ' + targetUrl,
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
        TP.boot.$stderr('AccessViolation. url: ' + targetUrl,
                        TP.boot.$ec(e));

        return;
    }

    return null;
};

//  ------------------------------------------------------------------------

TP.boot.$uriLoadCommonHttp = function(targetUrl, resultType, lastModified,
                                        isCacheable, isModule)
{
    /**
     * @name $uriLoadCommonHttp
     * @synopsis Loads (reads and produces an XML document for) targetUrl.
     * @param {String} targetUrl URL of the target file.
     * @param {TP.DOM|TP.TEXT} resultType Result as a DOM node or TEXT.
     * @param {String} lastModified An optional Last-Modified header value used
     *     along with 304 checking to minimize overhead for HTTP calls whose
     *     content is cached but needs to be refreshed.
     * @param {Boolean} isCacheable True if the content may be in the cache, and
     *     should be cached when loaded.
     * @param {Boolean} isModule True if the file being imported is a
     *     module-level file. This can impact cache storage logic.
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
                if (TP.sys.cfg('boot.debugcache')) {
                    TP.boot.$stdout('Loaded ' + logpath + ' from origin.');
                }

                lastmod = httpObj.getResponseHeader('Last-Modified');
                if (TP.sys.cfg('boot.debugcache')) {
                    TP.boot.$stdout('Refreshed ' + logpath +
                                    ' to ' + lastmod);
                }

                TP.$BOOT_STORAGE.set(
                        targetUrl + '_lastmodified',
                        lastmod,
                        TP.NOOP);
            }

            //  if we're either working from a existing file with a valid
            //  last-modified date or a new cachable file then we want to
            //  save the result to the cache
            if (lastModified || isCacheable) {
                //  one additional check here, at least for the short-term,
                //  is that we only want to store javascript files that have
                //  been compressed...otherwise the cache will fill up.
                if (/\.js$/.test(logpath) !== true ||
                    logpath.indexOf(
                         TP.sys.cfg('pack.extension') + '.js') !==
                                                             TP.NOT_FOUND) {
                    if (TP.sys.cfg('boot.debugcache')) {
                        TP.boot.$stdout('Storing ' +
                                        logpath +
                                        ' to cache.');
                    }

                    response = httpObj.responseText;

                    TP.$BOOT_STORAGE.set(
                            targetUrl,
                            response,
                            TP.NOOP);

                    //  code might be loading in packaged form, but we also
                    //  want to update the individual chunks so we can
                    //  support smaller-grained incremental updates.
                    if (isModule && TP.sys.cfg('import.chunks')) {
                        if (TP.sys.cfg('boot.debugcache')) {
                            TP.boot.$stdout('Checking ' +
                                            logpath +
                                            ' for chunks.');
                        }

                        chunks = response.split(
                                        TP.sys.cfg('boot.chunkedbar'));

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
                                    if (TP.sys.cfg('boot.debugcache')) {
                                        TP.boot.$stdout(
                                        'Storing ' +
                                        TP.boot.$uriInTIBETFormat(
                                                            chunkName) +
                                        ' to cache.');
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

                        if (TP.sys.cfg('boot.debugcache')) {
                            TP.boot.$stdout('Loaded ' +
                                            logpath +
                                            ' from cache.');
                        }
                    } else {
                        if (TP.sys.cfg('boot.debugcache')) {
                            //  a bit of a problem...had a last-modified
                            //  stamp but no data? ouch.
                            TP.boot.$stdout('Missing ' +
                                            logpath +
                                            ' in cache.');
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
        TP.boot.$stderr('FileAccessException. url: ' + targetUrl,
                        TP.boot.$ec(e));
    }

    return null;
};

//  ------------------------------------------------------------------------
//  FILE IMPORT
//  ------------------------------------------------------------------------

/*
*/

//  ------------------------------------------------------------------------

TP.boot.$sourceImport = function(jsSrc, targetDoc, srcUrl, aCallback,
                                    shouldThrow)
{
    /**
     * @name $sourceImport
     * @synopsis Imports a script text which loads and integrates JS. This
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

    var el,
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
    el = TP.boot.$$scriptTemplate.cloneNode(true);
    TP.boot.$loadNode = el;

    //  ensure we keep track of the proper module/target information
    TP.boot.$loadNode.setAttribute('load_module',
                                    TP.sys.cfg('load.module', ''));
    TP.boot.$loadNode.setAttribute('load_target',
                                    TP.sys.cfg('load.target', ''));

    scriptDoc = TP.boot.$isValid(targetDoc) ?
                        targetDoc :
                        document;

    scriptHead = TP.boot.$isValid(targetDoc) ?
                        scriptDoc.getElementsByTagName('head')[0] :
                        TP.boot.$$head;

    scriptUrl = TP.boot.$isValid(srcUrl) ? srcUrl : 'inline';

    //  set a file reference so when/if this errors out we'll get the right
    //  file name reference
    TP.boot.$$onerrorFile = scriptUrl;

    try {
        if (TP.boot.isUA('IE')) {
            //  set the 'text' property of the new script element. this
            //  loads the code synchronously and makes it available to the
            //  system.
            el.text = jsSrc;
        } else {
            tn = scriptDoc.createTextNode(jsSrc);
            TP.boot.$nodeAppendChild(el, tn);
        }

        //  since we're not using the src attribute put the file name on the
        //  source attribute, which TIBET uses as an alternative
        el.setAttribute('source', scriptUrl);

        result = TP.boot.$nodeAppendChild(scriptHead, el);
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

        //  clear the onerror file reference
        TP.boot.$$onerrorFile = null;
    }

    //  if we were successful then invoke the callback function
    if (typeof(aCallback) === 'function') {
        aCallback(result, $STATUS !== 0);
    }

    return result;
};

//  ------------------------------------------------------------------------

TP.boot.$uriImport = function(targetUrl, aCallback, shouldThrow, isModule) {

    /**
     * @name $uriImport
     * @synopsis Imports a target file which loads and integrates JS with the
     *     currently running "image".
     * @param {String} targetUrl URL of the target file.
     * @param {Function} aCallback A function to invoke when done.
     * @param {Boolean} shouldThrow True to cause errors to throw a native Error
     *     so outer catch blocks will trigger.
     * @param {Boolean} isModule True if the file being imported is a
     *     module-level file. This can impact cache storage logic.
     * @return {HTMLElement} The new 'script' element that was created to
     *     import the code.
     * @todo
     */

    var src;

    if (targetUrl == null) {
        TP.boot.$stderr('InvalidURI');

        return null;
    }

    //  we pass actual responsibility for locating the source text to the
    //  uriLoad call, but we need to tell it that we're looking for source
    //  code so that it can make the proper decisions about cache lookup
    src = TP.boot.$uriLoad(targetUrl, TP.TEXT, 'source', true, isModule);
    if (src == null) {
        if (shouldThrow === true) {
            throw new Error('Requested file ' + targetUrl +
                            ' source not found.');
        } else if (shouldThrow === false) {
            //  if throw flag is explicitly false then we don't consider
            //  this to be an error, we just report it.
            TP.boot.$stdout('Requested file ' +
                            targetUrl +
                            ' source not found.');
        } else {
            TP.boot.$stderr('Requested file ' +
                            targetUrl +
                            ' source not found.');
        }

        return null;
    }

    return TP.boot.$sourceImport(src, null, targetUrl,
                                    aCallback, shouldThrow);
};

//  ------------------------------------------------------------------------
//  FILE SAVE
//  ------------------------------------------------------------------------

/*
Primitive functions supporting file save operations. Note that the HTTP
versions require the assistance of the TIBET Development Server components
or an equivalent set of CGI scripts/Servlets on the server side while the
FILE versions require varying permissions.
*/

//  ------------------------------------------------------------------------

TP.boot.$uriSave = function(targetUrl, fileContent, fileMode) {

    /**
     * @name $uriSave
     * @synopsis Saves the fileContent to the targetUrl provided. If fileMode is
     *     'w' then the existing contents of the file, if any, are replaced with
     *     the new content. If fileMode is 'a' then the new content is appended
     *     to any existing content. In both cases the file is created if it
     *     doesn't already exist.
     * @param {String} targetUrl URL of the target file.
     * @param {String} fileContent The content of the file to save.
     * @param {String} fileMode Write (w) or append (a).
     * @raises InvalidFileName, FileNotFound, FileAccessException,
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

//  ------------------------------------------------------------------------

TP.boot.$uriSaveIEFile = function(targetUrl, fileContent, fileMode) {

    /**
     * @name $uriSaveIEFile
     * @synopsis Saves the fileContent to the targetUrl provided. If fileMode is
     *     'w' then the existing contents of the file, if any, are replaced with
     *     the new content. If fileMode is 'a' then the new content is appended
     *     to any existing content. When using 'a' an error is thrown if the
     *     file doesn't exist. When using 'w' the file is created if it doesn't
     *     already exist.
     * @param {String} targetUrl URL of the target file.
     * @param {String} fileContent The content of the file to save.
     * @param {String} fileMode Write (w) or append (a).
     * @raises InvalidFileName, FileNotFound, InvalidFileMode,
     *     FileAccessException
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
                TP.boot.$stderr('FileNotFound: ' + fname);
            }
        } else {
            TP.boot.$stderr('InvalidFileMode: ' + fileMode);
        }
    } catch (e) {
        TP.boot.$stderr('FileAccessException. url: ' + fname,
                        TP.boot.$ec(e));
    }

    return false;
};

//  ------------------------------------------------------------------------

TP.boot.$uriSaveMozFile = function(targetUrl, fileContent, fileMode) {

    /**
     * @name $uriSaveMozFile
     * @synopsis Saves the fileContent to the targetUrl provided. If fileMode is
     *     'w' then the existing contents of the file, if any, are replaced with
     *     the new content. If fileMode is 'a' then the new content is appended
     *     to any existing content. When using 'a' an error is thrown if the
     *     file doesn't exist. When using 'w' the file is created if it doesn't
     *     already exist.
     * @param {String} targetUrl URL of the target file.
     * @param {String} fileContent The content of the file to save.
     * @param {String} fileMode Write (w) or append (a).
     * @raises InvalidFileName, FileNotFound, InvalidFileMode,
     *     FileAccessException, PrivilegeException
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
            TP.boot.$stdout('Privilege request at TP.boot.$uriSaveMozFile');
        }

        netscape.security.PrivilegeManager.enablePrivilege(
                                            'UniversalXPConnect');
    } catch (e) {
        TP.boot.$stderr('PrivilegeException. url: ' + targetUrl,
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
        TP.boot.$stderr('FileComponentError. url: ' + targetUrl,
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
                TP.boot.$stderr('FileNotFound: ' + fname);
            }
        } else {
            TP.boot.$stderr('InvalidFileMode: ' + fileMode);
        }
    } catch (e) {
        TP.boot.$stderr('FileAccessException. url: ' + fname,
                        TP.boot.$ec(e));
    }

    /* jshint bitwise:true */

    return false;
};

//  ------------------------------------------------------------------------

TP.boot.$uriSaveWebkitFile = function(targetUrl, fileContent, fileMode) {

    /**
     * @name $uriSaveWebkitFile
     * @synopsis Saves the fileContent to the targetUrl provided. If fileMode is
     *     'w' then the existing contents of the file, if any, are replaced with
     *     the new content. If fileMode is 'a' then the new content is appended
     *     to any existing content. When using 'a' an error is thrown if the
     *     file doesn't exist. When using 'w' the file is created if it doesn't
     *     already exist.
     * @param {String} targetUrl URL of the target file.
     * @param {String} fileContent The content of the file to save.
     * @param {String} fileMode Write (w) or append (a).
     * @raises InvalidFileName, FileNotFound, InvalidFileMode,
     *     FileAccessException
     * @return {Boolean} True on success, false on failure.
     * @todo
     */

    TP.boot.$stderr('UnsupportedFeature. TP.boot.$uriSaveWebkitFile()');

    return false;
};

//  ------------------------------------------------------------------------

TP.boot.$uriSaveHttp = function(targetUrl, fileContent, fileMode) {

    /**
     * @name $uriSaveHttp
     * @synopsis Saves the fileContent to the targetUrl provided. If fileMode is
     *     'w' then the existing contents of the file, if any, are replaced with
     *     the new content. If fileMode is 'a' then the new content is appended
     *     to any existing content. When using 'a' an error is thrown if the
     *     file doesn't exist. When using 'w' the file is created if it doesn't
     *     already exist.
     * @param {String} targetUrl URL of the target file.
     * @param {String} fileContent The content of the file to save.
     * @param {String} fileMode Write (w) or append (a).
     * @raises InvalidFileName, HTTPError, FileAccessException
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
        TP.boot.$stderr('FileAccessException. url: ' + targetUrl,
                        TP.boot.$ec(e));
    }

    return false;
};

//  ------------------------------------------------------------------------
//  LOCAL STORAGE
//  ------------------------------------------------------------------------

/*
*/

//  ------------------------------------------------------------------------

TP.$BOOT_STORAGE = null;
TP.$BOOT_STORAGE_TYPE = null;
TP.$BOOT_STORAGE_NAME = '$BOOT_STORAGE';

TP.$BOOT_STORAGE_LOCALSTORAGE = 1;
TP.$BOOT_STORAGE_WHATWGDB = 2;
TP.$BOOT_STORAGE_GLOBALSTORAGE = 3;

//  Note that 'IF NOT EXISTS' is a sqlite-only SQL, but since all of the DBs
//  so far are sqlite (Safari implementation of HTML5DB), we're ok.
TP.$BOOT_STORAGE_CREATION_SQL = 'CREATE TABLE IF NOT EXISTS boot_storage (storage_key TEXT UNIQUE NOT NULL PRIMARY KEY, storage_value TEXT NOT NULL)';
TP.$BOOT_STORAGE_RETRIEVE_SQL = 'SELECT storage_value FROM boot_storage WHERE storage_key = ?';
TP.$BOOT_STORAGE_UPDATE_SQL = 'INSERT INTO boot_storage(storage_key, storage_value) VALUES (?, ?)';
TP.$BOOT_STORAGE_DELETE_SQL = 'DELETE FROM boot_storage WHERE storage_key = ?';
TP.$BOOT_STORAGE_DELETE_ALL_SQL = 'DROP TABLE boot_storage';

//  ------------------------------------------------------------------------

TP.boot.$escapeStorageName = function(aName) {

    return aName.replace(/_/g, '__').replace(/ /g, '_s');
};

//  ------------------------------------------------------------------------

TP.boot.$initializeWHATWGDBStorage = function() {

    /**
     * @name $initializeWHATWGDBStorage
     * @synopsis Initializes the WHAT WG storage mechanism and returns a storage
     *     wrapper object to be able to get/set/remove/removeAll objects from
     *     the storage.
     * @return {Object|null} The storage 'wrapper' object or null if the
     *     storage couldn't be initialized.
     */

    var html5DB,
            storageObj;

    html5DB = window.openDatabase(
                    TP.boot.$escapeStorageName(TP.$BOOT_STORAGE_NAME),
                    1,
                    'TIBET_$BOOT_STORAGE',
                    5 * 1024 * 1024);

    if (TP.boot.$notValid(html5DB)) {
        return null;
    }

    storageObj =
    {
        dbObj: html5DB,

        //  5MB limit
        size: 5 * 1024 * 1024,

        _createStorageTable: function(successCallback, failureCallback) {

                this.dbObj.transaction(
                        function(trans, results) {

                            //  Create the table.
                            trans.executeSql(
                                TP.$BOOT_STORAGE_CREATION_SQL,
                                [],
                                function() {

                                    successCallback(trans);
                                });
                        },
                        function(error) {

                            TP.boot.$stderr(
                                'Couldn\'t create table: ' +
                                    error.message);

                            failureCallback();
                        });
            },
        _execTrans: function(transFunction) {

                this.dbObj.transaction(
                    transFunction,
                    function(error) {

                        if (/no such table/.test(error.message)) {
                            storageObj._createStorageTable(
                                        transFunction,
                                        function() {

                                            //  Halt the transaction.
                                            return true;
                                        });
                        } else {
                            TP.boot.$stderr(
                                'There was an overall transaction error: ' +
                                error.message);

                            //  Halt the transaction.
                            return true;
                        }
                    });
            },

        get: function(aKey, aCallbackFunction) {

                    this._execTrans(
                        function(trans) {

                            trans.executeSql(
                                TP.$BOOT_STORAGE_RETRIEVE_SQL,
                                [aKey],
                                function(trans, result) {

                                    if (result.rows.length > 0) {
                                        aCallbackFunction(
                                            result.rows.item(0).
                                                        storage_value,
                                            aKey);
                                    } else {
                                        aCallbackFunction(null, aKey);
                                    }
                                });
                        });
                },

        set: function(aKey, aValue, aCallbackFunction) {

                    this._execTrans(
                        function(trans) {

                            //  First, we remove the value from the DB.
                            trans.executeSql(
                                TP.$BOOT_STORAGE_DELETE_SQL,
                                [aKey],
                                function(trans, result) {

                                    //  Then, we set the new the value in
                                    //  the DB.
                                    trans.executeSql(
                                        TP.$BOOT_STORAGE_UPDATE_SQL,
                                        [aKey, aValue],
                                        function(trans, result) {

                                            aCallbackFunction(aValue, aKey);
                                        },
                                        function(trans, error) {

                                            TP.boot.$stderr(
                                            'There was an update error: ' +
                                            error.message);
                                        });
                                });
                        });
                },

        remove: function(aKey, aCallbackFunction) {

                    this._execTrans(
                        function(trans) {

                            var resultValue;

                            //  If a callback was supplied, get the value
                            //  out of the database before deleting it. Then
                            //  delete the value.
                            if (TP.boot.$isValid(aCallbackFunction)) {
                                trans.executeSql(
                                    TP.$BOOT_STORAGE_RETRIEVE_SQL,
                                    [aKey],
                                    function(trans, result) {

                                        if (result.rows.length > 0) {
                                            resultValue =
                                                result.rows.item(0).
                                                        storageValue;
                                        } else {
                                            resultValue = null;
                                        }

                                        trans.executeSql(
                                            TP.$BOOT_STORAGE_DELETE_SQL,
                                            [aKey],
                                            function(trans, result) {

                                                aCallbackFunction(
                                                            resultValue,
                                                            aKey);
                                            });
                                    });
                            } else {
                                trans.executeSql(
                                    TP.$BOOT_STORAGE_DELETE_SQL,
                                    [aKey]);
                            }
                        });
                },
        removeAll: function(aCallbackFunction) {

                    //  Don't bother going through '_execTrans' - if the
                    //  table doesn't exist, we certainly don't want to
                    //  create it ;-)
                    this.dbObj.transaction(
                        function(trans) {

                            trans.executeSql(
                                TP.$BOOT_STORAGE_DELETE_ALL_SQL,
                                null,
                                function(trans, result) {

                                    aCallbackFunction();
                                });
                        },
                        function(error) {

                            if (/no such table/.test(error.message)) {
                                //  If the table didn't exist, then we just
                                //  bail out - no sense in reporting an
                                //  error.
                            } else {
                                TP.boot.$stderr(
                                    'There was an overall transaction ' +
                                    'error: ' + error.message);
                            }

                            //  Either way, halt the transaction.
                            return true;
                        });
                }
    };

    TP.$BOOT_STORAGE = storageObj;
    TP.$BOOT_STORAGE_TYPE = TP.$BOOT_STORAGE_WHATWGDB;

    return storageObj;
};

//  ------------------------------------------------------------------------

TP.boot.$initializeGlobalStorage = function() {

    /**
     * @name $initializeGlobalStorage
     * @synopsis Initializes the 'global' storage mechanism (found only on
     *     Mozilla-based browsers) and returns a storage wrapper object to be
     *     able to get/set/remove/removeAll objects from the storage.
     * @return {Object|null} The storage 'wrapper' object or null if the
     *     storage couldn't be initialized.
     */

    var internalStore,
            storageObj;

    if (TP.boot.isUA('GECKO', 1, 9, 0, TP.UP)) {
        internalStore = window.globalStorage[TP.sys.getHost()];
    } else if (TP.boot.isUA('GECKO', 1, 8, 1, TP.UP)) {
        //  FF 2.X has a bug with 'localhost' domains.
        if (TP.sys.getHost() === 'localhost') {
            internalStore = window.globalStorage['localhost.localdomain'];
        } else {
            internalStore = window.globalStorage[TP.sys.getHost()];
        }
    }

    if (TP.boot.$notValid(internalStore)) {
        return null;
    }

    storageObj =
    {
        internalStore: internalStore,

        //  5MB limit
        size: 5 * 1024 * 1024,

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
                            TP.sys.setcfg('tibet.localcache', false);
                        }

                        TP.boot.$stderr('Problem storing to local cache.',
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

                    var theKey;

                    for (theKey in this.internalStore) {
                        if (this.internalStore.hasOwnProperty(theKey)) {
                            this.internalStore.removeItem(theKey);
                        }
                    }
                }
    };

    TP.$BOOT_STORAGE = storageObj;
    TP.$BOOT_STORAGE_TYPE = TP.$BOOT_STORAGE_GLOBALSTORAGE;

    return storageObj;
};

//  ------------------------------------------------------------------------

TP.boot.$initializeLocalStorage = function() {

    /**
     * @name $initializeLocalStorage
     * @synopsis Initializes the 'local' storage mechanism (found on IE8, Safari
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
                            TP.sys.setcfg('tibet.localcache', false);
                        }

                        TP.boot.$stderr('Problem storing to local cache.',
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

//  ------------------------------------------------------------------------

TP.boot.$setupDOMStorage = function() {

    /**
     * @name $setupDOMStorage
     * @synopsis Sets up the 'dom storage' - that is, the storage mechanism that
     *     allows TIBET to cache itself locally into a programmer-controlled
     *     cache for zero-network, much higher performance, loading.
     * @return {Boolean} Whether or not the dom storage could be set up.
     */

    if (TP.boot.$isValid(TP.$BOOT_STORAGE)) {
        return true;
    }

    //  Otherwise, we have to do a bit of browser testing...
    if (TP.boot.isUA('GECKO')) {
        if (TP.sys.isHTTPBased() === true) {
            //  If its HTTP based, we can use either 'localStorage' (the
            //  standard) or 'globalStorage' (Mozilla-specific, former
            //  standard - replaced by localStorage). 'localStorage' was
            //  implemented in Moz 1.9.1 / FF 3.5.
            //  If, for some reason, 'localStorage' cannot be initialized
            //  properly, we fall back to 'globalStorage'.
            if (TP.boot.isUA('GECKO', 1, 9, 1, TP.UP)) {
                if (TP.boot.$isValid(TP.boot.$initializeLocalStorage())) {
                    return true;
                } else if (TP.boot.$isValid(
                                    TP.boot.$initializeGlobalStorage())) {
                    return true;
                }
            } else {
                if (TP.boot.$isValid(TP.boot.$initializeGlobalStorage())) {
                    return true;
                }
            }
        } else {
            //  No dice. Mozilla has no storage mechanism when booting from
            //  FILE urls (unless this bug is fixed properly)
            //  https://bugzilla.mozilla.org/show_bug.cgi?id=357323
        }
    } else if (TP.boot.isUA('IE')) {
        if (TP.sys.isHTTPBased() === true) {
            //  If its HTTP based, we can use 'localStorage'. localStorage
            //  was implemented in IE8.
            if (TP.boot.isUA('IE', 8, TP.UP)) {
                if (TP.boot.$isValid(TP.boot.$initializeLocalStorage())) {
                    return true;
                }
            } else {
                //  No dice. No storage mechanism capable enough on prior
                //  versions of IE (sorry 64K ain't enough ;-) ).
            }
        } else {
            //  No dice. IE has no storage mechanism when booting from FILE
            //  urls (unless the issue we've reported is fixed).
        }
    } else if (TP.boot.isUA('WEBKIT')) {
        //  Now that Webkit has fixed:
        //  https://bugs.webkit.org/show_bug.cgi?id=20701
        //  we can use 'localStorage', in either http:// or file:// mode.
        if (TP.boot.isUA('WEBKIT', 526, 11, 2, TP.UP)) {
            if (TP.boot.$isValid(TP.boot.$initializeWHATWGDBStorage())) {
                return true;
            }
        }

        //  No dice. No storage mechanism on prior versions of Webkit
    }

    return false;
};

//  ------------------------------------------------------------------------
//  DOM FUNCTIONS
//  ------------------------------------------------------------------------

/*
Minimal functions to support boot system requirements for new documents.
*/

//  ------------------------------------------------------------------------

TP.boot.$documentCreate = function(versionNumber) {

    /**
     * @name $documentCreate
     * @synopsis Creates a DOM document element for use.
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

//  ------------------------------------------------------------------------

TP.boot.$documentCreateIE = function(versionNumber) {

    /**
     * @name $documentCreateIE
     * @synopsis Creates a DOM document element for use.
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

//  ------------------------------------------------------------------------

TP.boot.$nodeAppendChild = function(aNode, newNode, shouldThrow) {

    /**
     * @name $nodeAppendChild
     * @synopsis Appends the newNode to the supplied node.
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

//  ------------------------------------------------------------------------

TP.boot.$nodeInsertBefore = function(aNode, newNode, insertionPointNode) {

    /**
     * @name $nodeInsertBefore
     * @synopsis Inserts the newNode into the child content of the supplied node
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

//  ------------------------------------------------------------------------

TP.boot.$nodeReplaceChild = function(aNode, newNode, oldNode) {

    /**
     * @name $nodeReplaceChild
     * @synopsis Replaces the oldNode in the supplied node with the newNode.
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

//  ------------------------------------------------------------------------
//  NODE/STRING CONVERSION
//  ------------------------------------------------------------------------

/*
nodeAsString and documentFromString processing to help with XML processing
*/

//  ------------------------------------------------------------------------

TP.boot.$documentFromString = function(aString) {

    /**
     * @name $documentFromString
     * @synopsis Parses aString and returns the XML node representing the root
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

//  ------------------------------------------------------------------------

//  parse once by defining externally to the function we'll use this in
if (TP.boot.isUA('GECKO')) {
    TP.boot.$$xmlParseErrorMsgMatcher =
        /XML Parsing Error: ([^\n]+)\nLocation: [^\n]+\nLine Number (\d+), Column (\d+)/;
} else if (TP.boot.isUA('WEBKIT')) {
    TP.boot.$$xmlParseErrorMsgMatcher =
        /error on line (\d+) at column (\d+): ([^<]+)/;
}

//  ------------------------------------------------------------------------

TP.boot.$documentFromStringCommon = function(aString) {

    /**
     * @name $documentFromStringCommon
     * @synopsis Parses aString and returns the XML node representing the root
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

//  ------------------------------------------------------------------------

TP.boot.$documentFromStringIE = function(aString, prohibitDTD) {

    /**
     * @name $documentFromStringIE
     * @synopsis Parses aString and returns the XML node representing the root
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

//  ------------------------------------------------------------------------

TP.boot.$nodeAsString = function(aNode) {

    /**
     * @name $nodeAsString
     * @synopsis Returns the string representation of aNode.
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

//  ------------------------------------------------------------------------

TP.boot.$nodeAsStringCommon = function(aNode) {

    /**
     * @name $nodeAsStringMoz
     * @synopsis Returns the string representation of aNode.
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

//  ------------------------------------------------------------------------

TP.boot.$nodeAsStringIE = function(aNode) {

    /**
     * @name $nodeAsStringIE
     * @synopsis Returns the string representation of aNode.
     * @param {Node} aNode The node to transform.
     * @return {String} The String representation of the supplied Node.
     */

    if (aNode != null && aNode.xml != null) {
        return aNode.xml;
    }

    return '';
};

//  ------------------------------------------------------------------------
//  WINDOW PRIMITIVES
//  ------------------------------------------------------------------------

/*
Simple functions related specifically to window operation/instrumentation.
*/

//  ------------------------------------------------------------------------

TP.sys.getWindowById = function(anID, aContextWindow) {

    /**
     * @name getWindowById
     * @synopsis Returns a reference to the window with the ID provided. This
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
        if (TP.boot.$isWindow(win = TP.global['window_0.UIROOT.' + anID])) {
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

//  ------------------------------------------------------------------------

TP.windowIsInstrumented = function(nativeWindow) {

    /**
     * @name windowIsInstrumented
     * @synopsis Returns true if the window provided has been instrumented with
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

//  ------------------------------------------------------------------------
//  DHTML PRIMITIVES
//  ------------------------------------------------------------------------

/*
The simple DHTML primitives needed to manage startup processes like showing
a simple progress bar or displaying a console-style output log.

NOTE that these are trivial and not likely to work in all circumstances, but
then again they're only intended to get us through the initial boot
sequence.  After that the versions in the kernel take over.
*/

//  ------------------------------------------------------------------------

TP.boot.$elementAddClass = function(anElement, className) {

    /**
     * @name elementAddClass
     * @synopsis Adds a CSS class name to the element if it is not already
     *     present.
     * @param {Element} anElement The element to add the CSS class to.
     * @param {String} className The CSS class name to add.
     * @raises InvalidElement,InvalidString
     * @return {Element} The element the supplied class was added to.
     * @todo
     */

    var re,
        cls;

    //  NOTE: make sure that the className is either first, last, or
    //  surrounded by whitespace
    re = new RegExp('(^|\\s)' + className + '(\\s|$)');

    cls = anElement.className;
    if (!cls) {
        anElement.className = className;
    } else if (re.test(cls)) {
        return anElement;
    } else {
        anElement.className = cls + ' ' + className;
    }

    return anElement;
};

//  ------------------------------------------------------------------------

TP.boot.$elementSetInnerContent = function(anElement, theContent) {

    /**
     * @name $elementSetInnerContent
     * @synopsis Sets the 'inner content' of anElement.
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

//  ------------------------------------------------------------------------
//  HASH PRIMITIVES
//  ------------------------------------------------------------------------

/*
*/

//  ------------------------------------------------------------------------

TP.boot.$dump = function(anObject, aSeparator) {

    /**
     * @name anObject
     * @synopsis Dumps an object's key/value pairs in sorted order. This is used
     *     to produce output for configuration and environment data. By sorting
     *     the keys we make it a little easier to find specific properties
     *     quickly.
     * @param {Object} anObject The object to dump.
     * @param {String} aSeparator An optional separator string used to separate
     *     entries. Default is boot.log_lineend.
     * @return {String} A formatted object string.
     * @todo
     */

    var i,
        arr,
        len,
        keys;

    keys = [];
    for (i in anObject) {
        if (anObject.hasOwnProperty(i)) {
            keys.push(i);
        }
    }
    keys.sort();

    arr = [];
    len = keys.length;

    for (i = 0; i < len; i++) {
        arr.push(keys[i] + ' => ' + anObject[keys[i]]);
    }

    return arr.join(aSeparator || TP.sys.cfg('boot.log_lineend'));
};

//  ------------------------------------------------------------------------
//  STRING PRIMITIVES
//  ------------------------------------------------------------------------

/*
String formatting for boot-time output.
*/

//  ------------------------------------------------------------------------

TP.boot.$lpad = function(obj, length, padChar) {

    /**
     * @name $lpad
     * @synopsis Returns a new String representing the obj with a leading number
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

//  ------------------------------------------------------------------------

TP.boot.$trim = function(aString) {

    /**
     * @name $trim
     * @synopsis Returns a new String representing the parameter with any
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

//  ------------------------------------------------------------------------
//  DOCUMENT PRIMITIVES
//  ------------------------------------------------------------------------

/*
The boot system often pulls segments out of the current document to help it
determine what to do. The functions here just make that a little cleaner.
*/

//  ------------------------------------------------------------------------

TP.boot.$currentDocumentLocation = function() {

    /**
     * @name $currentDocumentLocation
     * @synopsis Returns the enclosing document's location, minus the docname
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

//  ------------------------------------------------------------------------
//  SIMPLE LOG MESSAGE ANNOTATIONS
//  ------------------------------------------------------------------------

TP.boot.Annotation = function(anObject, aMessage) {

    //  can't be null or undefined, or have empty annotation text.
    if (anObject == null || aMessage == null || aMessage === '') {
        throw new Error('InvalidParameter');
    }

    this.object = anObject;
    this.message = aMessage;
};

//  ------------------------------------------------------------------------

TP.boot.Annotation.prototype.getTypeName = function() {

    /**
     * @name getTypeName
     * @synopsis
     * @return {String}
     * @todo
     */

    return 'TP.boot.Annotation';
};

//  ------------------------------------------------------------------------

TP.boot.Annotation.prototype.asDumpString = function() {

    /**
     * @name asDumpString
     * @synopsis Returns the receiver as a string suitable for use in log
     *     output.
     * @return {String} A new String containing the dump string of the receiver.
     */

    return TP.boot.$join('TP.boot.Annotation :: ',
                            TP.boot.$str(this.object), ',',
                            TP.boot.$str(this.message));
};

//  ------------------------------------------------------------------------

TP.boot.Annotation.prototype.asHTMLString = function() {

    /**
     * @name asHTMLString
     * @synopsis Produces an HTML string representation of the receiver. By
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

//  ------------------------------------------------------------------------

TP.boot.Annotation.prototype.asJSONSource = function() {

    /**
     * @name asJSONSource
     * @synopsis Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    return '{"type":"TP.boot.Annotation",' +
            '"data":{"object":' + TP.boot.$str(this.object).quoted('"') + ',' +
            '"message":' + TP.boot.$str(this.message).quoted('"') + '}}';
};

//  ------------------------------------------------------------------------

TP.boot.Annotation.prototype.asPrettyString = function() {

    /**
     * @name asPrettyString
     * @synopsis Returns the receiver as a string suitable for use in 'pretty
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

//  ------------------------------------------------------------------------

TP.boot.Annotation.prototype.asSource = function() {

    /**
     * @name asSource
     * @synopsis Returns the receiver as a TIBET source code string.
     * @return {String} An appropriate form for recreating the receiver.
     */

    return TP.boot.$join('TP.boot.$annotate(\'',
                            TP.boot.$str(this.object), '\',\'',
                            TP.boot.$str(this.message), '\')');
};

//  ------------------------------------------------------------------------

TP.boot.Annotation.prototype.asXMLString = function() {

    /**
     * @name asXMLString
     * @synopsis Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     */

    return TP.boot.$join('<instance type="TP.boot.Annotation"',
                            ' object="', TP.boot.$str(this.object), '"',
                            ' message="', TP.boot.$str(this.message), '"\/>');
};

//  ------------------------------------------------------------------------

TP.boot.Annotation.prototype.toString = function() {

    /**
     * @name toString
     * @synopsis Returns a string representation of the receiver.
     * @return {String}
     */

    return TP.boot.$join(TP.boot.$str(this.message),
                            ' [', TP.boot.$str(this.object), ']');
};

//  ------------------------------------------------------------------------

TP.boot.$annotate = function(anObject, aMessage) {

    /**
     * @name $annotate
     * @synopsis Creates an annotated object, essentially a simple pairing
     *     between an object and an associated label or message. Often used for
     *     logging Node content without having to convert the Node into a string
     *     to bind it to an associated message.
     * @param {Object} anObject The object to annotate.
     * @param {String} aNote The note to annotate the object with.
     * @return {Object} An object whose keys include 'object' and 'message'
     *     such that a standard query can find those values.
     * @todo
     */

    if (anObject == null) {
        return aMessage;
    }

    if (aMessage == null || aMessage === '') {
        return anObject;
    }

    return new TP.boot.Annotation(anObject, aMessage);
};

//  ------------------------------------------------------------------------
//  PRIMITIVE ERROR SUPPORT
//  ------------------------------------------------------------------------

TP.boot.$ec = function(anError, aMessage) {

    /**
     * @name $ec
     * @synopsis TP.core.Exception.create shortcut, later replaced by a
     *     full-featured version that ensures the resulting object can take
     *     advantage of TP.core.Exception's implementation of asString.
     * @param {Error} anError A native error object.
     * @param {String} aMessage A related string, usually a context-specific
     *     explanation of the native error.
     * @return {Object} An object whose keys include 'object' and 'message'
     *     such that a standard query can find those values.
     * @todo
     */

    var obj;

    obj = {'object': anError, 'message': aMessage};
    obj.toString = TP.boot.$ec.$$toString;

    return obj;
};

//  ------------------------------------------------------------------------

//  this will be mapped to each array created by TP.boot.$ec() so it can
//  respond in a reasonable way to the request to produce a string value
TP.boot.$ec.$$toString =
        function() {

            return TP.boot.$join(
                    TP.boot.$str(this.message),
                    ' [', TP.boot.$str(this.object), ']');
        };

//  ------------------------------------------------------------------------

TP.boot.$join = function(varargs) {

    /**
     * @name $join
     * @synopsis Returns a string built from joining the various arguments to
     *     the function.
     * @param {Object} varargs The first of a set of variable arguments.
     * @return {String}
     */

/*
    var arr,
        len,
        i;

    arr = [];

    len = arguments.length;
    for (i = 0; i < len; i++) {
        arr.push(arguments[i]);
    };

    return arr.join('');
*/

    //  NB: In modern browsers, going back to the old '+=' method of String
    //  concatenation seems to yield about a 40% performance gain.
    var str,
        len,
        i;

    str = '';

    len = arguments.length;
    for (i = 0; i < len; i++) {
        str += arguments[i];
    }

    return str;
};

//  ------------------------------------------------------------------------

TP.boot.$str = function(anObject) {

    /**
     * @name $str
     * @synopsis Returns a string representation of the object provided. This
     *     simple version is a basic wrapper for toString. The TIBET kernel
     *     provides a method which can produce more specialized responses to
     *     this request.
     * @param {Object} anObject The object whose string value is being
     *     requested.
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
                return anObject.toString();
            }
        } catch (e) {
            return '';
        }
    }

    return 'null';
};

//  ------------------------------------------------------------------------
//  PRIMITIVE LOG DATA STRUCTURE
//  ------------------------------------------------------------------------

/*
The various logging operations in TIBET make use of a common low-level type
that handles log entry management. We build that primitive type here so it
can be used to manage the boot log along with the rest of TIBET's logs.
*/

//  ------------------------------------------------------------------------
//  Constructor
//  ------------------------------------------------------------------------

TP.boot.Log = function() {

    /**
     * @name TP.boot.Log
     * @synopsis Contructor for a primitive log data structure. This construct
     *     is used by all TIBET logs although it is wrapped by higher-level
     *     objects once the kernel has loaded.
     * @return {Log} A new instance.
     */

    this.messages = [];

    return this;
};

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.boot.Log.getClassForLevel = function(aLogLevel) {

    /**
     * @name getClassForLevel
     * @synopsis Returns the CSS class that should be used for the logging level
     *     provided. The defaults are logmsg, logwarn, and logerr.
     * @param {Number} aLogLevel A TIBET logging level such as TP.INFO,
     *     TP.ERROR, etc.
     * @return {String} A css class name found in tibet.css.
     * @todo
     */

    switch (aLogLevel) {
        case TP.SYSTEM:
        case TP.TRACE:
        case TP.INFO:

            return 'logmsg';

        case TP.WARN:

            return 'logwarn';

        case TP.ERROR:
        case TP.SEVERE:
        case TP.FATAL:

            return 'logerr';

        default:

            return 'logmsg';
    }
};

//  ------------------------------------------------------------------------

TP.boot.Log.getStringForLevel = function(aLogLevel) {

    /**
     * @name getStringForLevel
     * @synopsis Returns the string value for the logging level provided.
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

            return '';
    }
};

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.boot.Log.prototype.asDumpString = function() {

    /**
     * @name asDumpString
     * @synopsis Returns the receiver as a string suitable for use in log
     *     output.
     * @return {String} A new String containing the dump string of the receiver.
     */

    return TP.boot.$join('TP.boot.Log :: ', this.asString());
};

//  ------------------------------------------------------------------------

TP.boot.Log.prototype.asHTMLString = function() {

    /**
     * @name asHTMLString
     * @synopsis Produces an HTML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in HTML string format.
     */

    return TP.boot.$join(
        '<span class="TP_boot_Log">',
        '<span data-name="messages">', TP.htmlstr(this.messages), '<\/span>',
        '<\/span>');
};

//  ------------------------------------------------------------------------

TP.boot.Log.prototype.asJSONSource = function() {

    /**
     * @name asJSONSource
     * @synopsis Returns a JSON string representation of the receiver.
     * @returns {String} A JSON-formatted string.
     */

    return '{"type":"TP.boot.Log",' +
            '"data":{"messages":' +
                TP.boot.$str(this.messages).quoted('"') +
            '}}';
};

//  ------------------------------------------------------------------------

TP.boot.Log.prototype.asPrettyString = function() {

    /**
     * @name asPrettyString
     * @synopsis Returns the receiver as a string suitable for use in 'pretty
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

//  ------------------------------------------------------------------------

TP.boot.Log.prototype.asXMLString = function() {

    /**
     * @name asXMLString
     * @synopsis Produces an XML string representation of the receiver. By
     *     default this method returns the receiver's string value without
     *     changes.
     * @returns {String} The receiver in XML string format.
     */

    return TP.boot.$join(
                '<instance type="TP.boot.Log">',
                '<messages>', TP.xmlstr(this.messages), '<\/messages>',
                '<\/instance>');
};

//  ------------------------------------------------------------------------

TP.boot.Log.prototype.getEntries = function() {

    /**
     * @name getEntries
     * @synopsis Returns an array containing [date, msg, css] entries. The array
     *     should be considered read-only.
     * @return {Array}
     * @todo
     */

    return this.messages;
};

//  ------------------------------------------------------------------------

TP.boot.Log.prototype.getSize = function() {

    /**
     * @name getSize
     * @synopsis Returns the size (in number of entries) of the log.
     * @return {Number} The number of log entries.
     */

    return this.messages.length;
};

//  ------------------------------------------------------------------------

TP.boot.Log.prototype.getTypeName = function() {

    /**
     * @name getTypeName
     * @synopsis
     * @return {String}
     * @todo
     */

    return 'TP.boot.Log';
};

//  ------------------------------------------------------------------------

TP.boot.Log.prototype.last = function() {

    /**
     * @name last
     * @synopsis Returns the last entry made in the log.
     * @return {Array} A log entry.
     * @todo
     */

    return this.messages[this.messages.length - 1];
};

//  ------------------------------------------------------------------------

TP.boot.Log.prototype.log = function(anObject, aLogName, aLogLevel,
                                        aContext)
{
    /**
     * @name log
     * @synopsis Creates a new log entry. The entry will include a timestamp as
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

    var entry;

    //  NOTE order here should match TP.LOG_ENTRY_* constants
    entry = [new Date(), aLogName, aLogLevel, anObject];

    this.messages.push(entry);

    return this;
};

//  ------------------------------------------------------------------------

TP.boot.Log.prototype.shift = function() {

    /**
     * @name shift
     * @synopsis Shifts the first message off the log, allowing the log to
     *     shrink in size by one entry. This method is often called to keep log
     *     sizes from exceeding configured limits.
     * @return {Array} A log entry.
     * @todo
     */

    return this.messages.shift();
};

//  ------------------------------------------------------------------------
//  TIBET BOOT LOG
//  ------------------------------------------------------------------------

/*
When this system is used to boot TIBET the bootlog can be acquired from
the TIBET environment in a fashion consistent with all other TIBET logs.
*/

//  ------------------------------------------------------------------------

if (TP.sys.$bootlog == null) {
    TP.sys.$bootlog = new TP.boot.Log();
}

//  ------------------------------------------------------------------------

TP.sys.getBootLog = function() {

    /**
     * @name getBootLog
     * @synopsis Returns the system boot log. This will contain any messages
     *     generated during boot processing, assuming the application was booted
     *     using the TIBET boot system.
     * @return {TP.boot.Log} The boot log object, a primitive instance
     *     supporting limited string output routines.
     */

    return TP.sys.$bootlog;
};

//  ------------------------------------------------------------------------

TP.boot.log = function(anObject, aLogLevel, aContext) {

    /**
     * @name log
     * @synopsis Adds an entry in the boot log for anObject, associating it with
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

    var level,
        css;

    level = (aLogLevel == null) ? TP.INFO : aLogLevel;

    TP.sys.$bootlog.log(anObject,
                            TP.BOOT_LOG,
                            level,
                            aContext || arguments);

    css = TP.boot.Log.getClassForLevel(level);

    //  adjust CSS class "worst case" for managing style of progress ui.
    //  basically if an error or warning occurs the progress style is
    //  altered to show that visibly
    if (css) {
        if (css === 'logwarn' &&
            TP.boot.$$cssLevel !== 'logerr') {
            TP.boot.$$cssLevel = 'logwarn';
        } else if (css === 'logerr') {
            TP.boot.$$cssLevel = 'logerr';
        }
    }

    //  NOTE: bit of a hack here, but this seems to be the most consistent
    //  place to put this so we're sure we can stop
    if ((typeof(anObject) === 'string') &&
        ((anObject.indexOf('ERROR') > -1) ||
        ((anObject.indexOf(' in:') > -1) &&
        (anObject.indexOf(' file:') > -1)))) {
        if (TP.sys.cfg('boot.stop_onerror')) {
            //  set flag to terminate boot process
            TP.boot.$$stop = true;

            //  allow debugger to pop at the actual location
            debugger;
        }
    }

    return;
};

//  ------------------------------------------------------------------------
//  PROGRESS DISPLAY FUNCTIONS
//  ------------------------------------------------------------------------

/*
The functions in this section are provided as simple implementations of boot
log display operations. The $$bootlog and $$script[Will/Did]Load functions
don't provide any visual feedback/output by default. By selecting a display
operation from the ones provided here you can get the boot system to provide
more interactive feedback on boot progress.

Note that these scripts rely on being able to access the boot.canvas/divs
named ProgressBorder, ProgressBar, and ProgressText to perform their output.
This is the default content provided by the boot system template files. If
boot.canvas isn't found the current document/frame is checked for those
IDs.
*/

//  ------------------------------------------------------------------------

TP.boot.$releaseUIElements = function() {

    /**
     * @name $releaseUIElements
     * @synopsis Releases any cached UI references created during startup.
     * @return {null}
     */

    TP.boot.$$pageContent = null;
    TP.boot.$$progressBarOne = null;
    TP.boot.$$progressBarTwo = null;
    TP.boot.$$progressBorder = null;
    TP.boot.$$progressComplete = null;
    TP.boot.$$progressDefer = null;
    TP.boot.$$progressPath = null;

    return;
};

//  ------------------------------------------------------------------------
//  'silent' display hooks
//  ------------------------------------------------------------------------

TP.boot.$bootDisplaySilent = function(aString, aCSSClass) {

    /**
     * @name $bootDisplaySilent
     * @synopsis Provides visual feedback on the bootlog and its content. This
     *     version does nothing so output is suppressed.
     * @param {String} aString The message/string to log.
     * @param {String} aCSSClass The CSS class to use. Ignored for this method.
     * @return {null}
     * @todo
     */

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$didLoadSilent = function(aPath, deferred) {

    /**
     * @name $didLoadSilent
     * @synopsis Provides visual feedback on the boot process. This function
     *     doesn't operate off the boot log, instead it can replace the
     *     script/sourceWillLoad functions to provide visual feedback.
     * @param {String} aPath The path just loaded.
     * @param {Boolean} deferred True if the path is being deferred.
     * @return {null}
     * @todo
     */

    var d_el,
        n_el;

    n_el = TP.boot.$getProgressPathElement();
    d_el = TP.boot.$getProgressDeferElement();

    if (d_el) {
        TP.boot.$elementAddClass(d_el, TP.boot.$$cssLevel);
    }

    if (n_el) {
        TP.boot.$elementAddClass(n_el, TP.boot.$$cssLevel);
    }

    if (TP.boot.$$cssLevel === 'logerr') {
        TP.boot.$elementAddClass(document.body, 'error');
    }

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$willLoadSilent = function(aPath, deferred, aPrefix) {

    /**
     * @name $willLoadSilent
     * @synopsis Provides visual feedback on the boot process. This function
     *     doesn't operate off the boot log, instead it can replace the
     *     script/sourceWillLoad functions to provide visual feedback.
     * @param {String} aPath The path about to be loaded.
     * @param {Boolean} deferred True if the path is being deferred.
     * @param {String} aPrefix Optional prefix to use rather than 'Loading' or
     *     'Deferring'.
     * @return {null}
     * @todo
     */

    var c_el,
        n_el,
        d_el;

    if (!TP.boot.$progressConfigured) {
        d_el = TP.boot.$getProgressDeferElement();
        n_el = TP.boot.$getProgressPathElement();
        c_el = TP.boot.$getProgressCompleteElement();


        if (c_el) {
            c_el.innerHTML = '';
            c_el.className = 'busy';
            c_el.style.visibility = 'visible';

            TP.boot.$progressConfigured = true;
        }

        if (d_el) {
            TP.boot.$elementSetInnerContent(d_el, 'Generating');
        }

        if (n_el) {
            TP.boot.$elementSetInnerContent(n_el, 'manifest...');
        }
    } else {
        d_el = TP.boot.$getProgressDeferElement();
        n_el = TP.boot.$getProgressPathElement();

        if (d_el) {
            TP.boot.$elementSetInnerContent(d_el, aPrefix || 'Loading, ');
        }

        if (n_el) {
            TP.boot.$elementSetInnerContent(n_el, 'please wait...');
        }
    }

    return;
};

//  ------------------------------------------------------------------------

//  define the silent variations
TP.boot.$scriptDidLoadSilent = TP.boot.$didLoadSilent;
TP.boot.$sourceDidLoadSilent = TP.boot.$didLoadSilent;
TP.boot.$scriptWillLoadSilent = TP.boot.$willLoadSilent;
TP.boot.$sourceWillLoadSilent = TP.boot.$willLoadSilent;

TP.boot.$consoleConfigured = false;

//  reusable messaging array
TP.boot.$messages = [];

//  ------------------------------------------------------------------------
//  setup/element acquisition
//  ------------------------------------------------------------------------

TP.boot.$getBootWin = function() {

    /**
     * @name $getBootWin
     * @synopsis Returns the window where TIBET is being booted.
     * @return {Window} The boot window.
     */

    if (TP.boot.$bootwin != null) {
        return TP.boot.$bootwin;
    }

    TP.boot.$bootwin = window;

    return TP.boot.$bootwin;
};

//  ------------------------------------------------------------------------

TP.boot.$getPageContentElement = function() {

    /**
     * @name $getPageContentElement
     * @synopsis Returns the page content element, normally cleared by console
     *     mode.
     * @return {HTMLElement} The HTML element displaying the 'page content'.
     */

    var win;

    if (TP.boot.$$pageContent != null) {
        return TP.boot.$$pageContent;
    }

    win = TP.boot.$getBootWin();

    TP.boot.$$pageContent = win.document.getElementById('PageContent');

    if (TP.boot.isUA('IE')) {
        TP.boot.$$pageContent.style.overflow = '';
        TP.boot.$$pageContent.style.top = 'auto';
    } else {
        TP.boot.$$pageContent.style.overflow = 'hidden';
    }

    return TP.boot.$$pageContent;
};

//  ------------------------------------------------------------------------

TP.boot.$getProgressBarElement = function() {

    /**
     * @name $getProgressBarElement
     * @synopsis Returns the progress bar element, which contains the overall
     *     prgress bar content element.
     * @return {HTMLElement} The HTML element displaying the 'progress bar'.
     */

    var win;

    if (TP.boot.$$progressBar != null) {
        return TP.boot.$$progressBar;
    }

    win = TP.boot.$getBootWin();

    TP.boot.$$progressBarOne =
                win.document.getElementById('ProgressBarOne');
    TP.boot.$$progressBarTwo =
                win.document.getElementById('ProgressBarTwo');

    if (TP.sys.cfg('boot.phaseone')) {
        TP.boot.$$progressBar = TP.boot.$$progressBarOne;
    } else {
        TP.boot.$$progressBar = TP.boot.$$progressBarTwo;
    }

    return TP.boot.$$progressBar;
};

//  ------------------------------------------------------------------------

TP.boot.$getProgressBorderElement = function() {

    /**
     * @name $getProgressBorderElement
     * @synopsis Returns the progress border element.
     * @return {HTMLElement} The HTML element displaying the 'progress border'.
     */

    var win;

    if (TP.boot.$$progressBorder != null) {
        return TP.boot.$$progressBorder;
    }

    win = TP.boot.$getBootWin();

    TP.boot.$$progressBorder =
                win.document.getElementById('ProgressBorder');

    return TP.boot.$$progressBorder;
};

//  ------------------------------------------------------------------------

TP.boot.$getProgressCompleteElement = function() {

    /**
     * @name $getProgressCompleteElement
     * @synopsis Returns the progress completion element, which displays the
     *     total completed node count.
     * @return {HTMLElement} The HTML element displaying the 'progress
     *     complete'.
     */

    var win;

    if (TP.boot.$$progressComplete != null) {
        return TP.boot.$$progressComplete;
    }

    win = TP.boot.$getBootWin();

    TP.boot.$$progressComplete =
                        win.document.getElementById('ProgressComplete');

    return TP.boot.$$progressComplete;
};

//  ------------------------------------------------------------------------

TP.boot.$getProgressDeferElement = function() {

    /**
     * @name $getProgressDeferElement
     * @synopsis Returns the progress defer element, which normally shows the
     *     number of deferred nodes.
     * @return {HTMLElement} The HTML element displaying the 'progress defer'.
     */

    var win;

    if (TP.boot.$$progressDefer != null) {
        return TP.boot.$$progressDefer;
    }

    win = TP.boot.$getBootWin();

    TP.boot.$$progressDefer = win.document.getElementById('ProgressDefer');

    return TP.boot.$$progressDefer;
};

//  ------------------------------------------------------------------------

TP.boot.$getProgressPathElement = function() {

    /**
     * @name $getProgressPathElement
     * @synopsis Returns the progress path element, which normally shows a
     *     "percentage completion" status.
     * @return {HTMLElement} The HTML element displaying the 'progress path'.
     */

    var win;

    if (TP.boot.$$progressPath != null) {
        return TP.boot.$$progressPath;
    }

    win = TP.boot.$getBootWin();

    TP.boot.$$progressPath = win.document.getElementById('ProgressPath');

    return TP.boot.$$progressPath;
};

//  ------------------------------------------------------------------------
//  'console' display
//  ------------------------------------------------------------------------

TP.boot.$bootDisplayConsole = function(aString, aCSSClass) {

    /**
     * @name $bootDisplayConsole
     * @synopsis Provides visual feedback on the bootlog and its content. This
     *     version outputs the log to a well-known target in the ui frame
     *     specified by boot.canvas.
     * @param {String} aString The message/string to log.
     * @param {String} aCSSClass The CSS class to use. This helps the console
     *     present messages (particularly errors or warnings) in an emphasized
     *     format.
     * @return {null}
     * @todo
     */

    var el,
        log,
        entries,
        len,
        i,
        msg;

    if (!aString) {
        return;
    }

    if (!TP.boot.$consoleConfigured) {
        //  we'll need the content element so we can output
        if ((el = TP.boot.$getPageContentElement()) == null) {
            return;
        }

        //  clear existing content
        el.innerHTML = '';

        //  configure div for console output
        el.className = 'consoleMode';

        TP.boot.$consoleConfigured = true;

        //  if we're just getting started then we want to put any
        //  early-stage boot messages into the console so we've got a
        //  complete copy of the bootlog in place in the console
        log = TP.sys.$bootlog;

        if (TP.boot.$isValid(log) &&
            TP.boot.$isValid(entries = log.getEntries())) {
            len = entries.length;
            for (i = 0; i < len; i++) {
                msg = entries[i];

                TP.boot.$$bootDisplayMessages(
                    msg[TP.LOG_ENTRY_PAYLOAD],
                    TP.boot.Log.getClassForLevel(msg[TP.LOG_ENTRY_LEVEL]),
                    msg[TP.LOG_ENTRY_DATE].getTime().toString());
            }
        }
    } else {
        TP.boot.$$bootDisplayMessages(aString, aCSSClass);
    }

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$$bootDisplayMessages = function(aString, aCSSClass, timeStamp) {

    /**
     * @name $$bootDisplayMessages
     * @synopsis Provides visual feedback on the bootlog and its content. This
     *     version outputs the log to a well-known target in the ui frame
     *     specified by boot.canvas.
     * @param {String} aString The message/string to log.
     * @param {String} aCSSClass The CSS class to use. This helps the console
     *     present messages (particularly errors or warnings) in an emphasized
     *     format.
     * @return {null}
     * @todo
     */

    var el,

        css,
        time,
        lasttime,

        msgStr,
        msgNode;

    if (top.console && top.console.log) {
        switch (aCSSClass) {
        case 'logerr':
            top.console.error(aString);
            break;
        default:
            top.console.log(aString);
            break;
        }
    }

    //  we'll need the content element so we can output
    if ((el = TP.boot.$getPageContentElement()) == null) {
        return;
    }

    css = (aCSSClass == null) ? 'logmsg' : aCSSClass;

    time = timeStamp || (new Date()).getTime().toString();
    lasttime = TP.boot.$$bootDisplayMessages.$lasttime ?
                TP.boot.$$bootDisplayMessages.$lasttime :
                time;
    TP.boot.$$bootDisplayMessages.$lasttime = time;

    TP.boot.$messages.length = 0;

    if (TP.boot.isUA('IE')) {
        TP.boot.$messages.push(
                '<div>',
                '<span class="logdate">', time, '</span>',
                '<span class="logdate">+',
                TP.boot.$lpad(time - lasttime, 3, '0'),
                '</span>',
                '<span class="', css, '">', aString, '</span>',
                '</div>');

        msgStr = TP.boot.$messages.join('');

        el.insertAdjacentHTML('beforeEnd', msgStr);
    } else {
        TP.boot.$messages.push(
                '<html:div ',
                'xmlns:html="http://www.w3.org/1999/xhtml">',
                '<html:span class="logdate">', time, '</html:span>',
                '<html:span class="logdate">+',
                TP.boot.$lpad(time - lasttime, 3, '0'),
                '</html:span>',
                '<html:span class="', css, '">', aString, '</html:span>',
                '</html:div>');

        msgStr = TP.boot.$messages.join('');
        msgNode = TP.boot.$documentFromString(msgStr);

        if (!msgNode) {
            //  phase two, try a text node version where we replace the text
            //  of a known node
            TP.boot.$messages.length = 0;
            TP.boot.$messages.push(
                '<html:span ',
                'xmlns:html="http://www.w3.org/1999/xhtml">',
                '<html:span class="logdate">', time, '</html:span>',
                '<html:span class="logdate">+',
                TP.boot.$lpad(time - lasttime, 3, '0'),
                '</html:span>',
                '<html:span class="', css, '">', 'MESSAGE', '</html:span>',
                '<html:br/></html:span>');

            msgStr = TP.boot.$messages.join('');
            msgNode = TP.boot.$documentFromString(msgStr);

            TP.boot.$nodeReplaceChild(msgNode.firstChild,
                                        msgNode.createTextNode(aString),
                                        msgNode.firstChild.firstChild);
        }

        TP.boot.$nodeAppendChild(el, msgNode.firstChild);

        el.scrollTop = el.scrollHeight;
    }
};

//  ------------------------------------------------------------------------

TP.boot.$scriptDidLoadConsole = function(aPath, deferred) {

    /**
     * @name $scriptDidLoadConsole
     * @synopsis Provides visual feedback on the boot process. This function
     *     doesn't operate off the boot log, instead it can replace the
     *     script/sourceDidLoad functions to provide visual feedback.
     * @param {String} aPath The path just loaded.
     * @param {Boolean} deferred True if the path is being deferred.
     * @return {null}
     * @todo
     */

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$scriptWillLoadConsole = function(aPath, deferred, aPrefix) {

    /**
     * @name $scriptWillLoadConsole
     * @synopsis Provides visual feedback on the boot process. This function
     *     doesn't operate off the boot log, instead it can replace the
     *     script/sourceWillLoad functions to provide visual feedback.
     * @param {String} aPath The path about to be loaded.
     * @param {Boolean} deferred True if the path is being deferred.
     * @param {String} aPrefix Optional prefix to use rather than 'Loading' or
     *     'Deferring'.
     * @return {null}
     * @todo
     */

    //  TP.boot.$stdout() handles this now

    //TP.boot.$bootDisplayConsole(aPrefix || 'Loading ' + aPath);

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$sourceDidLoadConsole = function(aPath) {

    /**
     * @name $sourceDidLoadConsole
     * @synopsis Provides visual feedback on the boot process. This function
     *     doesn't operate off the boot log, instead it can replace the
     *     script/sourceWillLoad functions to provide visual feedback.
     * @param {String} aPath The path just loaded.
     * @return {null}
     */

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$sourceWillLoadConsole = function(aPath) {

    /**
     * @name $sourceWillLoadConsole
     * @synopsis Provides visual feedback on the boot process. This function
     *     doesn't operate off the boot log, instead it can replace the
     *     script/sourceWillLoad functions to provide visual feedback.
     * @param {String} aPath The path just loaded.
     * @return {null}
     */

    return;
};

//  ------------------------------------------------------------------------
//  'counter' display
//  ------------------------------------------------------------------------

TP.boot.$counterConfigured = false;

//  ------------------------------------------------------------------------

TP.boot.$scriptDidLoadCounter = function(aPath, deferred) {

    /**
     * @name $scriptDidLoadCounter
     * @synopsis Provides visual feedback on the boot process. This function
     *     doesn't operate off the boot log, instead it can replace the
     *     script/sourceDidLoad functions to provide visual feedback.
     * @param {String} aPath The path just loaded.
     * @param {Boolean} deferred True if the path is being deferred.
     * @return {null}
     * @todo
     */

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$scriptWillLoadCounter = function(aPath, deferred, aPrefix) {

    /**
     * @name $scriptWillLoadCounter
     * @synopsis Provides visual feedback on the boot process. This function
     *     doesn't operate off the boot log, instead it can replace the
     *     script/sourceWillLoad functions to provide visual feedback.
     * @param {String} aPath The path about to be loaded.
     * @param {Boolean} deferred True if the path is being deferred.
     * @param {String} aPrefix Optional prefix to use rather than 'Loading' or
     *     'Deferring'.
     * @return {null}
     * @todo
     */

    var phase,

        b_el,
        p_el,
        n_el,
        d_el,
        c_el,

        str,
        num;

    b_el = TP.boot.$getProgressBorderElement();
    p_el = TP.boot.$getProgressBarElement();
    n_el = TP.boot.$getProgressPathElement();
    d_el = TP.boot.$getProgressDeferElement();
    c_el = TP.boot.$getProgressCompleteElement();

    //  want to make sure the progress elements are visible, but we don't
    //  want to mess with this too often
    if (!TP.boot.$counterConfigured) {
        if (b_el && p_el && n_el && d_el && c_el) {
            b_el.style.visibility = 'hidden';
            p_el.style.visibility = 'hidden';

            n_el.style.visibility = 'visible';
            d_el.style.visibility = 'visible';
            c_el.style.visibility = 'visible';

            TP.boot.$counterConfigured = true;
        } else {
            return;
        }
    }

    if (TP.boot.$$stage !== 'import_components' &&
        TP.boot.$$stage !== 'import_complete') {
        TP.boot.$elementSetInnerContent(c_el, '');
        TP.boot.$elementSetInnerContent(d_el, 'Generating');
        TP.boot.$elementSetInnerContent(n_el, 'manifest...');
    } else {
        num = TP.boot.$$bootnodes.length - TP.boot.$$bootindex;

        phase = TP.sys.cfg('boot.phaseone') === true ?
                                                ' phase one ' :
                                                ' phase two ';

        //  update the figures in the spans
        str = ((deferred === true) ?
                (aPrefix || 'Deferring ') + phase + ' component ' :
                (aPrefix || 'Loading ') + phase + ' component ');

        TP.boot.$elementSetInnerContent(d_el, str);

        str = TP.boot.$$bootindex + ' of ' +
                TP.boot.$$bootnodes.length;

        TP.boot.$elementSetInnerContent(n_el, str);

        str = ''; //num;

        TP.boot.$elementSetInnerContent(c_el, str);

        if (b_el) {
            TP.boot.$elementAddClass(b_el, TP.boot.$$cssLevel);
        }

        if (d_el) {
            TP.boot.$elementAddClass(d_el, TP.boot.$$cssLevel);
        }

        if (n_el) {
            TP.boot.$elementAddClass(n_el, TP.boot.$$cssLevel);
        }

        if (c_el) {
            TP.boot.$elementAddClass(c_el, TP.boot.$$cssLevel);
        }

        if (TP.boot.$$cssLevel === 'logerr') {
            TP.boot.$elementAddClass(document.body, 'error');
        }
    }

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$sourceDidLoadCounter = TP.boot.$scriptDidLoadCounter;
TP.boot.$sourceWillLoadCounter = TP.boot.$scriptWillLoadCounter;

//  declare a flag we can use to avoid extra overhead drawing progress
TP.boot.$progressConfigured = false;

//  ------------------------------------------------------------------------
//  progress bar display
//  ------------------------------------------------------------------------

TP.boot.$scriptDidLoadProgress = function(aPath, deferred) {

    /**
     * @name $scriptDidLoadProgress
     * @synopsis Provides visual feedback on the boot process. This function
     *     doesn't operate off the boot log, instead it can replace the
     *     script/sourceWillLoad functions to provide visual feedback.
     * @param {String} aPath The path just loaded.
     * @param {Boolean} deferred True if the path is being deferred.
     * @return {null}
     * @todo
     */

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$scriptWillLoadProgress = function(aPath, deferred, aPrefix) {

    /**
     * @name $scriptWillLoadProgress
     * @synopsis Provides visual feedback on the boot process. This function
     *     doesn't operate off the boot log, instead it can replace the
     *     script/sourceWillLoad functions to provide visual feedback.
     * @param {String} aPath The path just loaded.
     * @param {Boolean} deferred True if the path is being deferred.
     * @param {String} aPrefix Optional prefix to use rather than 'Loading' or
     *     'Deferring'.
     * @return {null}
     * @todo
     */

    var b_el,
        p_el,
        n_el,
        d_el,
        c_el,

        b_size,
        p_factor,
        p_size,

        str,
        num,
        phase,
        arr,
        path;

    //  until we know a module count we can't really muck with the divs
    if (TP.boot.$$stage !== 'import_components' &&
        TP.boot.$$stage !== 'import_complete') {
        n_el = TP.boot.$getProgressPathElement();

        if (n_el != null) {
            //  turn off display of content in the ends
            TP.boot.$elementSetInnerContent(d_el, '');
            TP.boot.$elementSetInnerContent(c_el, '');

            str = 'manifest. This may take a moment...';
            TP.boot.$elementSetInnerContent(n_el, str);
        }

        return;
    }

    b_el = TP.boot.$getProgressBorderElement();
    p_el = TP.boot.$getProgressBarElement();
    n_el = TP.boot.$getProgressPathElement();
    d_el = TP.boot.$getProgressDeferElement();
    c_el = TP.boot.$getProgressCompleteElement();

    //  want to make sure the progress elements are visible, but we don't
    //  want to mess with this too often
    if (!TP.boot.$progressConfigured) {
        if (b_el && p_el && n_el && d_el && c_el) {
            b_el.style.visibility = 'visible';
            p_el.style.visibility = 'visible';
            n_el.style.visibility = 'visible';
            d_el.style.visibility = 'visible';
            c_el.style.visibility = 'visible';

            TP.boot.$progressConfigured = true;
        } else {
            return;
        }
    }

    if (p_el != null) {
        b_size = TP.boot.$elementGetWidth(b_el);

        p_factor = b_size / TP.boot.$$bootnodes.length;
        p_size = ((TP.boot.$$bootindex - 1) * p_factor);

        //  make sure not to overflow the size of the overall 'border'
        //  element
        TP.boot.$elementSetWidth(p_el,
                                Math.max(0, Math.min(p_size, b_size)));

        if (p_el) {
            TP.boot.$elementAddClass(p_el, TP.boot.$$cssLevel);
        }

        if (TP.boot.$$cssLevel === 'logerr') {
            TP.boot.$elementAddClass(document.body, 'error');
        }
    }

    //  next we adjust the content layer as needed
    if (n_el != null) {
        //  often applications just want to display the app name...
        if (!(path = TP.sys.cfg('boot.bootmsg'))) {
            arr = aPath.split('/');
            path = arr[arr.length - 1];
        }

        //  compute a percentage complete here...
        num = Math.round(
            (TP.boot.$$bootindex / (TP.boot.$$bootnodes.length - 1)) * 100);

        //  update the figures in the spans
        phase = TP.sys.cfg('boot.phaseone') === true ? ' phase one:' :
                                                ' phase two:';
        str = ((deferred === true) ?
                (aPrefix || 'Deferring ') :
                (aPrefix || 'Loading '));

        TP.boot.$elementSetInnerContent(d_el, str + phase);

        str = path;
        TP.boot.$elementSetInnerContent(n_el, str);

        str = num + '%';
        TP.boot.$elementSetInnerContent(c_el, str);

        if (b_el) {
            TP.boot.$elementAddClass(b_el, TP.boot.$$cssLevel);
        }

        if (d_el) {
            TP.boot.$elementAddClass(d_el, TP.boot.$$cssLevel);
        }

        if (n_el) {
            TP.boot.$elementAddClass(n_el, TP.boot.$$cssLevel);
        }

        if (c_el) {
            TP.boot.$elementAddClass(c_el, TP.boot.$$cssLevel);
        }

        if (TP.boot.$$cssLevel === 'logerr') {
            TP.boot.$elementAddClass(document.body, 'error');
        }
    }

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$sourceDidLoadProgress = function(aPath) {

    /**
     * @name $sourceDidLoadProgress
     * @synopsis Provides visual feedback on the boot process. This function
     *     doesn't operate off the boot log, instead it can replace the
     *     script/sourceWillLoad functions to provide visual feedback.
     * @param {String} aPath The path just loaded.
     * @return {null}
     */

    TP.boot.$scriptDidLoadProgress('inline &lt;tibet_script&gt; source');

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$sourceWillLoadProgress = function(aPath) {

    /**
     * @name $sourceWillLoadProgress
     * @synopsis Provides visual feedback on the boot process. This function
     *     doesn't operate off the boot log, instead it can replace the
     *     script/sourceWillLoad functions to provide visual feedback.
     * @param {String} aPath The path just loaded.
     * @return {null}
     */

    TP.boot.$scriptWillLoadProgress('inline &lt;tibet_script&gt; source');

    return;
};

//  ------------------------------------------------------------------------
//  'status' display hooks
//  ------------------------------------------------------------------------

TP.boot.$bootDisplayStatus = function(aString, aCSSClass) {

    /**
     * @name $bootDisplayStatus
     * @synopsis Provides visual feedback on the bootlog and its content. This
     *     version attempts to update the window's status bar.
     * @param {String} aString The message/string to log.
     * @param {String} aCSSClass The CSS class to use. Ignored for this method.
     * @return {null}
     * @todo
     */

    top.status = aString;

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$didLoadStatus = function(aPath, deferred) {

    /**
     * @name $didLoadStatus
     * @synopsis Update's the window's status bar with the path of the file just
     *     loaded appended with the word 'loaded'.
     * @param {String} aPath The path just loaded.
     * @param {Boolean} deferred True if the path is being deferred.
     * @return {null}
     * @todo
     */

    if (deferred === true) {
        top.status = aPath + ' deferred';
    } else {
        top.status = aPath + ' loaded';
    }

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$willLoadStatus = function(aPath, deferred, aPrefix) {

    /**
     * @name $willLoadStatus
     * @synopsis Provides visual feedback on the boot process. This function
     *     doesn't operate off the boot log, instead it can replace the
     *     script/sourceWillLoad functions to provide visual feedback.
     * @param {String} aPath The path about to be loaded.
     * @param {Boolean} deferred True if the path is being deferred.
     * @param {String} aPrefix Optional prefix to use rather than 'Loading' or
     *     'Deferring'.
     * @return {null}
     * @todo
     */

    if (deferred === true) {
        top.status = (aPrefix || 'Deferring ') + aPath;
    } else {
        top.status = (aPrefix || 'Loading ') + aPath;
    }
};

//  ------------------------------------------------------------------------

TP.boot.$sourceDidLoadStatus = TP.boot.$didLoadStatus;
TP.boot.$sourceWillLoadStatus = TP.boot.$willLoadStatus;
TP.boot.$scriptDidLoadStatus = TP.boot.$didLoadStatus;
TP.boot.$scriptWillLoadStatus = TP.boot.$willLoadStatus;

//  ------------------------------------------------------------------------

//  default initial setting is status
TP.boot.$bootdisplay = TP.boot.$bootDisplayStatus;

//  ------------------------------------------------------------------------
//  BOOT STAGES
//  ------------------------------------------------------------------------

TP.boot.$setStage = function(aStage) {

    /**
     * @name $setStage
     * @synopsis Sets the current boot stage and reports it to the log.
     * @param {String} aStage A valid boot stage. This list is somewhat flexible
     *     but common stages include: config, config_*, phase_one, phase_two,
     *     phase_*_complete, main_engine_start, and running :).
     * @return {String} The current stage after the set completes.
     */

    TP.boot.$$stage = aStage;

    if (TP.boot.$debug && TP.boot.$verbose) {
        TP.boot.$stdout(TP.sys.cfg('boot.subsectionbar'));
        TP.boot.$stdout('TP.boot.$setStage() ' + TP.boot.$$stage);
        TP.boot.$stdout(TP.sys.cfg('boot.subsectionbar'));
    }

    return TP.boot.$$stage;
};

//  ------------------------------------------------------------------------
//  CONFIG FILE UTILITIES
//  ------------------------------------------------------------------------

/*
Routines specific to processing TIBET config files, which are basically Ant
files that TIBET reads to detemine what to boot/dynaload.
*/

//  ------------------------------------------------------------------------

TP.boot.$getConfigName = function(compact) {

    /**
     * @name $getConfigName
     * @synopsis Returns the name of the current module config being used.
     * @param {Boolean} compact True to return the compact (~) form.
     * @return {String}
     */

    var cfg,
        debug;

    debug = TP.sys.cfg('boot.debugpath');
    cfg = TP.boot.$$modulecfg[0];

    if (compact) {
        cfg = TP.boot.$uriInTIBETFormat(cfg);
    }

    if (debug && TP.boot.$$debug && TP.boot.$$verbose) {
        TP.boot.$stdout('TP.boot.$getConfigName(): ' + cfg);
    }

    return cfg;
};

//  ------------------------------------------------------------------------

TP.boot.$getConfigXML = function() {

    /**
     * @name $getConfigXML
     * @synopsis Returns the current module config XML document being used.
     * @return {XMLDocument}
     */

    var xml;

    xml = TP.boot.$$modulexml[0];

    return xml;
};

//  ------------------------------------------------------------------------

TP.boot.$popConfig = function() {

    /**
     * @name $popConfig
     * @synopsis Removes the last configuration entry from the module stack.
     * @return {null}
     */

    var debug;

    debug = TP.sys.cfg('boot.debugpath');

    if (debug && TP.boot.$$verbose) {
        TP.boot.$stdout('TP.boot.$popConfig() popping: ' +
                    TP.boot.$getConfigName(true));
    }

    //  shift off the module xml and name
    TP.boot.$$modulexml.shift();
    TP.boot.$$modulecfg.shift();

    //  shift off the module's basedir as well
    TP.boot.$$basedir.shift();

    if (debug && TP.boot.$$verbose) {
        TP.boot.$stdout('TP.boot.$popConfig() exit basedir: ' +
                    TP.boot.$getBaseDir());
    }

    TP.sys.setcfg('boot.module', TP.boot.$getConfigName());
    if (debug && TP.boot.$$verbose) {
        TP.boot.$stdout('TP.boot.$popConfig() exit boot.module: ' +
                    TP.sys.cfg('boot.module'));
    }

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$pushConfig = function(aConfigPath) {

    /**
     * @name $pushConfig
     * @synopsis Places aConfigPath and its XML document on the module stack.
     * @return {XMLDocument} The XML document pushed, if successful.
     */

    var cfgpath,
        modulexml,
        debug;

    debug = TP.sys.cfg('boot.debugpath');

    if (aConfigPath == null) {
        if (debug) {
            TP.boot.$stderr(
                    'TP.boot.$pushConfig(): invalid configuration path');
        }

        return;
    }

    cfgpath = aConfigPath;
    if (debug && TP.boot.$$verbose) {
        TP.boot.$stdout(
                'TP.boot.$pushConfig() checking expanded cfg: ' +
                    TP.boot.$uriJoinPaths(TP.boot.$getRootPath(), cfgpath));
    }

    //  push only if we can actually load the XML file
    modulexml = TP.boot.$uriLoad(
                    TP.boot.$uriJoinPaths(TP.boot.$getRootPath(), cfgpath),
                    TP.DOM,
                    'manifest',
                    TP.sys.cfg('import.manifests'));

    if (modulexml == null) {
        if (debug) {
            TP.boot.$stderr(
                    'TP.boot.$pushConfig() failed to load cfg: ' + cfgpath);
        }

        return;
    } else {
        if (debug && TP.boot.$$verbose) {
            TP.boot.$stdout(
                    'TP.boot.$pushConfig() pushing cfg: ' + cfgpath);
        }

        TP.sys.setcfg('boot.module', cfgpath);
        TP.boot.$$modulexml.unshift(modulexml);
        TP.boot.$$modulecfg.unshift(cfgpath);

        //  update the base dir from the module's project tag
        TP.boot.$setBaseDir(modulexml);

        if (debug && TP.boot.$$verbose) {
            TP.boot.$stdout('TP.boot.$pushConfig() exit basedir: ' +
                        TP.boot.$getBaseDir());
        }

        if (debug && TP.boot.$$verbose) {
            TP.boot.$stdout(
                    'TP.boot.$pushConfig() exit boot.module: ' +
                        TP.sys.cfg('boot.module'));
        }

        return modulexml;
    }
};

//  ------------------------------------------------------------------------

TP.boot.$getBaseDir = function() {

    /**
     * @name $getBaseDir
     * @synopsis Returns the current value of 'basedir', the directory prefix to
     *     use for any relative paths encountered. When this value hasn't been
     *     previously configured it will default to the current application root
     *     path.
     * @return {String}
     * @todo
     */

    var base;

    base = TP.boot.$$basedir[0];

    if (base == null || base === '') {
        return TP.boot.$getAppRoot();
    } else if (base[base.length - 1] !== '/') {
        return base + '/';
    }

    return base;
};

//  ------------------------------------------------------------------------

TP.boot.$setBaseDir = function(anXMLDocument) {

    /**
     * @name $setBaseDir
     * @synopsis Uses the XML document provided and updates the base directory
     *     setting appropriately.
     * @param {XMLDocument} anXMLDocument
     * @return {null}
     */

    var base,
        target,
        targets,
        debug;

    debug = TP.sys.cfg('boot.debugpath');

    if (anXMLDocument == null) {
        if (TP.boot.$$debug) {
            TP.boot.$stderr(
                    'TP.boot.$setBaseDir(): invalid config document');
        }

        return;
    }

    targets = anXMLDocument.getElementsByTagName('project');
    if ((target = targets.item(0)) != null) {
        base = target.getAttribute('basedir');
        if (debug && TP.boot.$$verbose) {
            TP.boot.$stdout(
                    'TP.boot.$setBaseDir() read basedir: ' + base);
        }

        if (base != null) {
            if (base === '/' || base === '~tibet') {
                //  libroot
                TP.boot.$$basedir.unshift(TP.boot.$getLibRoot());
            } else if (base === '~') {
                //  approot
                TP.boot.$$basedir.unshift(TP.boot.$getAppRoot());
            } else if (base.charAt(0) === '/' ||
                    base.indexOf('~tibet/') === 0) {
                //  clear any leading ~tibet portion to normalize
                base = base.replace('~tibet', '');

                //  make it look relative so we can process it
                base = '.' + base;

                //  absolute relative to libroot
                TP.boot.$$basedir.unshift(
                    TP.boot.$uriJoinPaths(TP.boot.$getLibRoot(), base));
            } else if (base.indexOf('~/') === 0 || base === '') {
                base = base.replace('~/', '');
                base = './' + base;

                //  absolute relative to approot
                TP.boot.$$basedir.unshift(
                    TP.boot.$uriJoinPaths(TP.boot.$getAppRoot(), base));
            } else if (base === '.') {
                if (TP.boot.$$basedir.length > 0) {
                    TP.boot.$$basedir.unshift(TP.boot.$getBaseDir());
                } else {
                    TP.boot.$setDefaultBaseDir();
                }
            } else {
                //  relative to current base
                TP.boot.$$basedir.unshift(
                            TP.boot.$uriJoinPaths(
                                TP.boot.$getBaseDir(),
                                TP.boot.$uriRelativeToPath(
                                        base,
                                        TP.boot.$getBaseDir())));
            }
        } else {
            if (TP.boot.$$basedir.length > 0) {
                TP.boot.$$basedir.unshift(TP.boot.$getBaseDir());
            } else {
                TP.boot.$setDefaultBaseDir();
            }
        }
    } else {
        if (TP.boot.$$basedir.length > 0) {
            TP.boot.$$basedir.unshift(TP.boot.$getBaseDir());
        } else {
            TP.boot.$setDefaultBaseDir();
        }

    }

    if (debug && TP.boot.$$verbose) {
        TP.boot.$stdout('TP.boot.$setBaseDir() defined basedir: ' +
                        TP.boot.$getBaseDir());
        TP.boot.$stdout('TP.boot.$setBaseDir() exit basedirs: ' +
                        TP.boot.$$basedir.join(' :: '));
    }

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$setDefaultBaseDir = function() {

    /**
     * @name $setDefaultBaseDir
     * @synopsis Sets the default base directory using the basedir boot
     *     parameter value or the application root value as the default.
     * @return {null}
     * @todo
     */

    var str,
        debug;

    debug = TP.sys.cfg('boot.debugpath');

    if ((str = TP.sys.cfg('boot.basedir')) != null) {
        TP.boot.$$basedir[0] = str;
    } else {
        TP.boot.$$basedir[0] = TP.boot.$getAppRoot();
    }

    if (debug && TP.boot.$$verbose) {
        TP.boot.$stdout(
                'TP.boot.$setDefaultBaseDir() defined base dir ' +
                    TP.boot.$$basedir[0]);
    }

    return;
};

//  ------------------------------------------------------------------------
//  ROOT PATHS
//  ------------------------------------------------------------------------

/*
TIBET is "dual path" oriented, meaning it thinks in terms of an "app root"
and a "lib root" so that your code and the TIBET code can vary independently
without too many maintenance issues. Using separate paths for APP and LIB
code lets you either share a codebase, or point your application to a new
release of TIBET for testing without altering directory structures, making
extra copies, or other typical approaches.
*/

//  ------------------------------------------------------------------------

TP.boot.$getAppBootDir = function() {

    /**
     * @name $getAppBootDir
     * @synopsis Attempts to locate the boot directory using the current
     *     location as a starting point. The value of boot.tibetinf defines the
     *     pattern that is checked. The boot directory is effectively the
     *     directory containing the boot.bootfile (tibet.xml). The default
     *     location is TIBET-INF in the directory containing the application's
     *     index.html file.
     * @return {String} The path, or an empty string.
     * @todo
     */

    var str,
        ndx,
        path,
        parts,
        dir,
        file,
        found,
        test;

    //  cached in configuration once we've computed it once
    if ((path = TP.sys.cfg('boot.bootdir')) != null) {
        return path;
    }

    //  easiest check is to see if it's on our current path
    path = decodeURI(window.location.toString());
    if (TP.sys.cfg('boot.debugpath')) {
        TP.boot.$stdout('TP.boot.$getAppBootDir() checking path: ' + path);
    }

    file = TP.sys.cfg('boot.tibetxml', 'tibet.xml');
    dir = TP.sys.cfg('boot.tibetinf', 'TIBET-INF');

    path = path.split(/[#?]/)[0];
    parts = path.split('/');

    //  if the url ends in index.html (standard home page) then it's going to
    //  be root path + tibetinf with that file stripped...per TIBET rules.
    if (/^index\./.test(parts[parts.length - 1]) === true) {
        parts.pop();
        test = TP.boot.$uriJoinPaths(parts.join('/'), dir);

        if (TP.boot.$uriExists(TP.boot.$uriJoinPaths(test, file))) {
            found = true;
            path = test;
        }
    }

    if (!found) {
        if (parts[parts.length - 1] === '') {
            //  path ended in '/' so it's a directory containing home page...
            test = TP.boot.$uriJoinPaths(parts.join('/'), dir);
            if (TP.boot.$uriExists(TP.boot.$uriJoinPaths(test, file))) {
                found = true;
                path = test;
            }
        } else if (/\./.test(parts[parts.length - 1]) !== true) {
            //  might be a simple directory reference...
            test = TP.boot.$uriJoinPaths(parts.join('/'), dir);
            if (TP.boot.$uriExists(TP.boot.$uriJoinPaths(test, file))) {
                found = true;
                path = test;
            }
        }
    }

    if (!found) {
        //  fastest check is if the directory is on our file location path.
        //  NOTE we enclose the name in slashes to ensure it's a true match
        str = '/' + dir + '/';
        ndx = path.lastIndexOf(str);

        if (ndx !== TP.NOT_FOUND) {
            path = path.slice(0, ndx + (str.length - 1));
            if (TP.sys.cfg('boot.debugpath')) {
                TP.boot.$stdout(
                        'TP.boot.$getAppBootDir() located path: ' + path);
            }

            TP.sys.setcfg('boot.bootdir', path);

            return path;
        }

        while (!found) {
            //  make sure we exit at some point
            if (path.lastIndexOf('/') === TP.NOT_FOUND) {
                path = null;
                break;
            }

            path = path.slice(0, path.lastIndexOf('/'));
            if (TP.sys.cfg('boot.debugpath')) {
                TP.boot.$stdout(
                        'TP.boot.$getAppBootDir() checking path: ' + path);
            }

            test = TP.boot.$uriJoinPaths(path, dir);
            if (TP.boot.$uriExists(TP.boot.$uriJoinPaths(test, file))) {
                found = true;
                path = test;

                break;
            }
        }
    }

    if (found) {
        TP.sys.setcfg('boot.bootdir', path);
        if (TP.sys.cfg('boot.debugpath')) {
            TP.boot.$stdout(
                    'TP.boot.$getAppBootDir() located path: ' + path);
        }
    } else {
        path = '';
    }

    return path;
};

//  ------------------------------------------------------------------------

TP.boot.$getAppRoot = function() {

    /**
     * @name $getAppRoot
     * @synopsis Returns the root path for the application, the point from which
     *     most if not all "app path" resolution occurs. Unless this has been
     *     defined otherwise the return value is always the parent of the
     *     directory found via $getAppBootDir();
     * @return {String} The computed path.
     */

    var root,
        path,
        ndx,
        debug;

    debug = TP.sys.cfg('boot.debugpath');

    //  first check for a cached value. this is what's used during booting
    if (TP.boot.$$approot != null) {
        return TP.boot.$$approot;
    }

    //  if specified it should be an absolute path we can expand and use
    root = TP.sys.cfg('boot.approot');
    if (root) {
        return TP.boot.$setAppRoot(root);
    }

    //  if we're going to search then we're basically looking for the boot
    //  directory and trying to get the parent directory
    path = TP.boot.$getAppBootDir();
    if (path) {
        ndx = path.lastIndexOf('/');
        if (ndx !== TP.NOT_FOUND) {
            root = path.slice(0, ndx);
            return TP.boot.$setAppRoot(root);
        }
    }

    TP.boot.$stderr('TP.boot.$getAppRoot() unable to find/compute approot');
    TP.boot.showContent('bugs');

    //  set flag to terminate boot process
    TP.boot.$$stop = true;

    throw new Error('Unable to find/compute approot.');
};

//  ------------------------------------------------------------------------

TP.boot.$getLibRoot = function() {

    /**
     * @name $getLibRoot
     * @synopsis Returns the root path for the TIBET codebase.
     * @description When the value for tibet.libroot is not specified this
     *     method will try to compute one. The standard location for the library
     *     is inside node_modules/tibet but this can vary based on
     *     configuration settings.
     * @return {String} The root path for the TIBET codebase.
     * @todo
     */

    var debug,
        comp,
        root,
        dir,
        base,
        lib,
        file,
        loc,
        re,
        match,
        str,
        ndx,
        path;

    debug = TP.sys.cfg('boot.debugpath');

    //  first check for a cached value. this is what's used during booting
    if (TP.boot.$$libroot != null) {
        return TP.boot.$$libroot;
    }

    //  if specified it should be an absolute path we can expand and use
    root = TP.sys.cfg('boot.libroot');
    if (root) {
        return TP.boot.$setLibRoot(root);
    }

    comp = TP.sys.cfg('boot.libcomp');
    switch (comp) {
    case 'tibetdir':

      base = TP.boot.$getAppRoot();
      dir = TP.sys.cfg('boot.tibetdir');
      lib = TP.sys.cfg('boot.tibetlib');

      root = TP.boot.$uriJoinPaths(base, dir);
      path = TP.boot.$uriJoinPaths(root, lib);
      file = TP.boot.$uriJoinPaths(path, 'package.json');

      if (TP.boot.$uriExists(file)) {
        return TP.boot.$setLibRoot(path);
      }
      break;

    case 'tibetinf':

      base = TP.boot.$getAppRoot();
      dir = TP.sys.cfg('boot.tibetinf');
      lib = TP.sys.cfg('boot.tibetlib');

      root = TP.boot.$uriJoinPaths(base, dir);
      path = TP.boot.$uriJoinPaths(root, lib);
      file = TP.boot.$uriJoinPaths(path, 'package.json');

      if (TP.boot.$uriExists(file)) {
        return TP.boot.$setLibRoot(path);
      }
      break;

    case 'tibetapp':

      // Strategy is to work up the URL a path segment at a time, looking for the 'base'
      // directory which should be hard-coded into the older lib versions.

      //  capture the string version of our current launch file location,
      //  minus the actual file itself
      loc = decodeURI(window.location.toString());
      loc = loc.split(/[#?]/)[0];
      loc = loc.slice(0, loc.lastIndexOf('/'));

      //  could be qualified with a Number but has to start with 'tibet' (case
      //  insensitive - also cannot be trailed with a dash)
      re = /\/TIBET[^-]/i;
      if (re.test(loc)) {
        match = loc.match(re);
        str = match[0];
        ndx = loc.lastIndexOf(str);

        path = loc.slice(0, ndx + str.length);
        if (path) {
          return TP.boot.$setLibRoot(path);
        }
      }

      //  other choice, a bit of a last resort, is to see if 'base' is a peer
      //  of the app root directory (and has our yyz file)

      //  make sure that what we have is longer than the launch root -
      //  otherwise we'll end up slicing back into the slashes following the
      //  scheme.
      if (loc.length > TP.sys.getLaunchRoot().length) {
          base = loc.slice(0, loc.lastIndexOf('/'));
      } else {
          base = loc;
      }

      //  Note that 'base' is the hardcoded library base directory.
      root = TP.boot.$uriJoinPaths(base, 'base');
      file = TP.sys.cfg('boot.tibetyyz');
      if (TP.boot.$uriExists(TP.boot.$uriJoinPaths(root, file))) {
          return TP.boot.$setLibRoot(base);
      }

      break;

    default:
      break;
    }

    TP.boot.$stderr('TP.boot.$getLibRoot() unable to find/compute libroot');
    TP.boot.showContent('bugs');
    TP.boot.$$stop = true;
    throw new Error('Unable to find/compute approot.');
};

//  ------------------------------------------------------------------------

TP.boot.$getRootPath = function() {

    /**
     * @name $getRootPath
     * @synopsis Returns the currently active root path for the codebase. This
     *     value is controlled entirely by the $setRootPath() call which is
     *     normally provided either the result of $getLibRoot() or $getAppRoot()
     *     depending on the phase of the boot process.
     * @return {String}
     */

    var path,
        debug;

    debug = TP.sys.cfg('boot.debugpath');

    if (TP.boot.$$rootpath != null) {
        return TP.boot.$$rootpath;
    }

    path = TP.boot.$getLibRoot();

    //  won't cache until we're sure we've gotten a libroot value
    if (path != null) {
        //  cache the value for repeated use
        TP.boot.$$rootpath = path;
    }

    if (debug && TP.boot.$$debug) {
        TP.boot.$stdout('TP.boot.$getRootPath() computed rootpath: ' +
                        TP.boot.$$rootpath);
    }

    return path;
};

//  ------------------------------------------------------------------------

TP.boot.$setAppRoot = function(aPath) {

    /**
     * @name $setAppRoot
     * @synopsis Sets the application root path, the path used as a base path
     *     for any relative path computations for application content.
     * @param {String} aPath A new root path for application content.
     * @return {String} The expanded path value.
     */

    var path,
        debug;

    debug = TP.sys.cfg('boot.debugpath');

    path = TP.boot.$uriExpandPath(aPath);
    path = decodeURI(path);
    TP.boot.$$approot = path;

    TP.sys.setcfg('tibet.approot', path);

    if (debug && TP.boot.$$debug) {
        TP.boot.$stdout('TP.boot.$setAppRoot() defined approot: ' + path);
    }

    return TP.boot.$$approot;
};

//  ------------------------------------------------------------------------

TP.boot.$setLibRoot = function(aPath) {

    /**
     * @name $setLibRoot
     * @synopsis Sets the library root path, the path used as a base path for
     *     any relative path computations for library content.
     * @param {String} aPath A new root path for library content.
     * @return {String} The expanded path value.
     */

    var path,
        debug;

    debug = TP.sys.cfg('boot.debugpath');

    path = TP.boot.$uriExpandPath(aPath);
    path = decodeURI(path);
    TP.boot.$$libroot = path;

    TP.sys.setcfg('tibet.libroot', path);

    if (debug && TP.boot.$$debug) {
        TP.boot.$stdout('TP.boot.$setLibRoot() defined libroot: ' + path);
    }

    return TP.boot.$$libroot;
};

//  ------------------------------------------------------------------------

TP.boot.$setRootPath = function(aPath) {

    /**
     * @name $setRootPath
     * @synopsis Sets the currently active root path for the codebase. This
     *     value is normally provided either the result of TP.boot.$getLibRoot()
     *     or TP.boot.$getAppRoot() depending on the phase of the boot process.
     * @param {String} aPath The new root path used for all path-sensitive
     *     operations.
     * @return {String} The new root path.
     */

    var path,
        debug;

    debug = TP.sys.cfg('boot.debugpath');

    path = TP.boot.$$uriExpandPath(aPath);
    path = decodeURI(path);
    TP.boot.$$rootpath = path;

    if (debug && TP.boot.$$debug && TP.boot.$$verbose) {
        TP.boot.$stdout('TP.boot.$setRootPath() assigned rootpath: ' +
                        TP.boot.$$rootpath);
    }

    return TP.boot.$$rootpath;
};

//  ------------------------------------------------------------------------
//  CONFIGURATION FUNCTIONS
//  ------------------------------------------------------------------------

/*
Functions related to configuration of the boot system and/or TIBET
"environment" which includes variables to keep track of boot properties,
operating system information, etc.
*/

//  ------------------------------------------------------------------------

TP.boot.getBootXML = function() {

    /**
     * @name getBootXML
     * @synopsis Returns the XML acquired from the application's boot file.
     * @return {XMLDocument} The 'boot XML' XML document.
     */

    return TP.boot.$$bootxml;
};

//  ------------------------------------------------------------------------

TP.boot.getURLArguments = function(url) {

    /**
     * @name getURLArguments
     * @synopsis Parses the URL for any TIBET-specific argument block. When
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

    args = {};
    params = hash.split('&');
    params.map(function(item) {
      var key,
          value;

      if (item.indexOf('=') !== TP.NOT_FOUND) {
        key = item.slice(0, item.indexOf('='));
        value = item.slice(item.indexOf('=') + 1);
        // Remove quoting if found.
        if ((value.length > 1) &&
            (/^".*"$/.test(value) || /^'.*'$/.test(value))) {
          value = value.slice(1, value.length - 1);
        }
      } else {
        key = item;
        value = true;
      }

      args[key] = value;
    });

    return args;
};

//  ------------------------------------------------------------------------

TP.boot.getURLBookmark = function(url) {

    /**
     * @name getURLBookmark
     * @synopsis Parses the URL for a bootable bookmark hash reference.
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

//  ------------------------------------------------------------------------

TP.boot.$configureBootfile = function(aBootFile) {

    /**
     * @name $configureBootfile
     * @synopsis Locates the boot file if at all possible. The default is
     *     defined by the boot.tibetxml property, but you can pass a filename to
     *     the boot() function which will ultimately control the value used
     *     here.
     * @param {String} aBootFile File name of the TIBET boot file to use. This
     *     parameter's value is only required when using a non-standard location
     *     for the tibet.xml file.
     * @return {null}
     * @todo
     */

    var path,
        xml;

    path = aBootFile;
    if (!path) {
        //  default is based on bootdir/tibet.xml where the bootdir if often
        //  built from the boot.tibetinf value, but we'll defer for that
        path = TP.boot.$uriJoinPaths(
                            TP.boot.$getAppBootDir(),
                            TP.sys.cfg('boot.tibetxml', 'tibet.xml'));
    } else {
        //  by joining with app root we deal with any relative paths here
        path = TP.boot.$uriJoinPaths(TP.boot.$getAppRoot(path), path);
    }

    //  be sure to expand any remaining virtual path elements
    path = TP.boot.$uriExpandPath(path);

    if (TP.sys.cfg('boot.debugpath')) {
        TP.boot.$stdout(
                'TP.boot.$configureBootfile() loading bootfile: ' + path);
    }

    xml = TP.boot.$uriLoad(path, TP.DOM, 'manifest', false);
    if (xml) {
        if (TP.sys.cfg('boot.debugpath')) {
            TP.boot.$stdout(
                'TP.boot.$configureBootfile() located bootfile: ' + path);
        }

        TP.boot.$$bootxml = xml;
        TP.boot.$$bootfile = path;

        TP.sys.setcfg('boot.bootfile', TP.boot.$$bootfile);

        TP.boot.$$modulexml.unshift(TP.boot.$$bootxml);
        TP.boot.$$modulecfg.unshift(TP.boot.$$bootfile);

    } else {
        if (TP.sys.cfg('boot.debugpath')) {
            TP.boot.$stderr(
                'TP.boot.$configureBootfile() could not find: ' + path);
        }
    }

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$configureBootscript = function() {

    /**
     * @name $configureBootscript
     * @synopsis Hook for invoking any tibet_script items found in the
     *     'boot_init' target of the config file. This function isn't expected
     *     to be invoked outside of the TP.boot.boot() call.
     * @return {null}
     */

    var nodes;

    //  use any items in the boot target as our replacement features
    if (TP.boot.$$bootxml != null) {
        if (!(nodes = TP.boot.$getTargetNodes('boot_init', true))) {
            return;
        }

        TP.boot.$$bootnodes = TP.boot.$uniqueNodeList(nodes);

        //  once we know the real size of the list, set it
        TP.sys.setcfg('boot.workload', TP.boot.$$bootnodes.length);
        TP.boot.$$bootindex = 0;

        //  import the content of the boot_init target
        TP.boot.$importComponents();
    }

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$configureDebug = function() {

    /**
     * @name $configureDebug
     * @synopsis Configures the debug/verbose settings based on any arg value
     *     the user may have set. Also ensures that the globals used by TIBET
     *     for TP.$DEBUG, TP.$VERBOSE, TP.$$DEBUG, and TP.$$VERBOSE are
     *     configured properly.
     * @return {null}
     */

    var args = TP.boot.getURLArguments(top.location.toString());

    //  tibet variants drive the uppercase versions which the TIBET codebase
    //  uses...but those are not set in the preference panel, they have to
    //  have been set in an environment file like development.js
    TP.$DEBUG = TP.sys.cfg('tibet.$debug', args['tibet.$debug'] || false);
    TP.$VERBOSE = TP.sys.cfg('tibet.$verbose', args['tibet.$verbose'] || false);

    TP.$$DEBUG = TP.sys.cfg('tibet.$$debug', args['tibet.$verbose'] || false);
    TP.$$VERBOSE = TP.sys.cfg('tibet.$$verbose',
        args['tibet.$verbose'] || false);

    //  boot variants drive the lowercase versions used by the boot system.
    //  these can be controlled via the preference panel for launch/startup.
    TP.boot.$debug = TP.sys.cfg('boot.$debug',
        args['boot.$debug'] || false);
    TP.boot.$verbose = TP.sys.cfg('boot.$verbose',
        args['boot.$verbose'] || false);

    TP.boot.$$debug = TP.sys.cfg('boot.$$debug',
        args['boot.$$debug'] || false);
    TP.boot.$$verbose = TP.sys.cfg('boot.$$verbose',
        args['boot.$$verbose'] || false);

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$configureDisplay = function() {

    /**
     * @name $configureDisplay
     * @synopsis Configures the current boot display based on environment
     *     settings. This is normally called twice during startup; once to
     *     configure initial display output prior to loading configuration data,
     *     and once after config data is in place.
     * @return {null}
     */

    var val;

    val = TP.sys.cfg('boot.display');

    switch (val) {
        case 'console':

            //  turn ON boot log display
            TP.boot.$bootdisplay = TP.boot.$bootDisplayConsole;

            //  configure will/did visuals
            TP.boot.$scriptWillLoad = TP.boot.$scriptWillLoadConsole;
            TP.boot.$sourceWillLoad = TP.boot.$sourceWillLoadConsole;
            TP.boot.$scriptDidLoad = TP.boot.$scriptDidLoadConsole;
            TP.boot.$sourceDidLoad = TP.boot.$sourceDidLoadConsole;

            break;

        case 'counter':

            //  turn off boot log display
            TP.boot.$bootdisplay = TP.boot.$bootDisplaySilent;

            //  enable 'counter' variations for will/did
            TP.boot.$scriptDidLoad = TP.boot.$scriptDidLoadCounter;
            TP.boot.$sourceDidLoad = TP.boot.$sourceDidLoadCounter;
            TP.boot.$scriptWillLoad = TP.boot.$scriptWillLoadCounter;
            TP.boot.$sourceWillLoad = TP.boot.$sourceWillLoadCounter;

            break;

        case 'progress':

            //  turn off boot log display
            TP.boot.$bootdisplay = TP.boot.$bootDisplaySilent;

            //  enable 'progress' variations for will/did
            TP.boot.$scriptWillLoad = TP.boot.$scriptWillLoadProgress;
            TP.boot.$sourceWillLoad = TP.boot.$sourceWillLoadProgress;
            TP.boot.$scriptDidLoad = TP.boot.$scriptDidLoadProgress;
            TP.boot.$sourceDidLoad = TP.boot.$sourceDidLoadProgress;

            break;

        case 'status':

            //  turn ON boot log display
            TP.boot.$bootdisplay = TP.boot.$bootDisplayStatus;

            //  disable will/did visuals
            TP.boot.$scriptWillLoad = TP.boot.$scriptWillLoadStatus;
            TP.boot.$sourceWillLoad = TP.boot.$sourceWillLoadStatus;
            TP.boot.$scriptDidLoad = TP.boot.$scriptDidLoadStatus;
            TP.boot.$sourceDidLoad = TP.boot.$sourceDidLoadStatus;

            break;

        default:

            //  turn ON boot log display
            TP.boot.$bootdisplay = TP.boot.$bootDisplaySilent;

            //  disable will/did visuals
            TP.boot.$scriptWillLoad = TP.boot.$scriptWillLoadSilent;
            TP.boot.$sourceWillLoad = TP.boot.$sourceWillLoadSilent;
            TP.boot.$scriptDidLoad = TP.boot.$scriptDidLoadSilent;
            TP.boot.$sourceDidLoad = TP.boot.$sourceDidLoadSilent;

            break;
    }

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$configureEnvironment = function() {

    /**
     * @name $configureEnvironment
     * @synopsis Defines a number of 'environment' variables which support
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

//  ------------------------------------------------------------------------

TP.boot.$configureLocalCache = function(shouldWarn) {

    /**
     * @name $configureLocalCache
     * @synopsis Configures local cache storage if tibet.localcache is true.
     * @description The local cache is used heavily during booting to optimize
     *     load times and HTTP access overhead, but is also leveraged by TIBET's
     *     content processing pipeline for storing processed markup and style
     *     data. NOTE that this method may alter the value of the
     *     tibet.localcache flag if no cache-capable infrastructure can be
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
    if (!TP.sys.cfg('tibet.localcache')) {
        return;
    }

    //  configure storage module in whatever form we can so we can support
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
                TP.boot.$stdout(msg);
            }
        }

        //  force the cache control flag to false so we don't try to use the
        //  cache anywhere else.
        TP.sys.setcfg('tibet.localcache', false);

        return;
    }

    //  how the cache is actually leveraged and updated is a factor of the
    //  cache mode, which can be "versioned" (leveraging a version string
    //  check), "synchronized" (use Last-Modified data), "manual" (refresh
    //  nodes that are specifically marked), "stale" (where the cache is
    //  effectively forced to update completely), and "fresh" where the
    //  cache is presumed to be correct regardless of its true state).
    switch (TP.sys.cfg('tibet.cachemode')) {
        case 'versioned':

            TP.boot.$stdout('Configuring \'versioned\' local cache.');

            //  versioned caches check the project's version as defined in
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

            TP.boot.$stdout('Configuring \'synchronized\' local cache.');

            //  a synchronized cache means we update every file based on
            //  Last-Modified data to keep the cache synchronized with any
            //  changes on the server.
            TP.sys.setcfg('import.source', 'modified');

            break;

        case 'manual':

            TP.boot.$stdout('Configuring \'manual\' local cache.');

            //  a manual cache means the manifest nodes to update will be
            //  marked manually as needing a refresh. This approach provides
            //  the most control but is harder to maintain for developers.
            TP.sys.setcfg('import.source', 'marked');

            break;

        case 'stale':

            TP.boot.$stdout('Configuring \'stale\' local cache.');

            //  a stale cache means we don't even want to consider metadata
            //  regarding Last-Modified dates for source. all flags are set
            //  to force full refresh of the cache to occur.
            TP.sys.setcfg('import.source', 'remote');

            //  If the user said that the cache is 'stale', then just empty
            //  it in preparation for reloading.
            TP.$BOOT_STORAGE.removeAll(TP.NOOP);

            break;

        case 'fresh':

            TP.boot.$stdout('Configuring \'fresh\' local cache.');

            //  cache is considered current without checks of any kind.
            TP.sys.setcfg('import.manifests', true);
            TP.sys.setcfg('import.metadata', true);
            TP.sys.setcfg('import.source', 'local');

            break;

        default:

            //  invalid cache mode, treat like an invalid cache
            TP.boot.$stderr('Invalid local cache mode: ' +
                        TP.sys.cfg('tibet.cachemode'));
            TP.boot.$stdout('Disabling local cache.');

            TP.sys.setcfg('tibet.localcache', false);

            break;
    }

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$configureVersionedCache = function(cacheVersion, rootVersion) {

    /**
     * @name $configureVersionedCache
     * @synopsis Configures cache import properties based on comparison of the
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
     * @param {The} rootVersion root module's version string.
     * @return {null}
     * @todo
     */

    var rootParts,
        cacheParts;

    if (!cacheVersion) {
        TP.boot.$stdout('No local cache version string found.');
        TP.boot.$stdout('Simulating \'empty\' local cache.');

        //  no cache or empty version string, consider cache invalid.
        TP.sys.setcfg('import.source', 'remote');

        return;
    }

    if (!rootVersion) {
        TP.boot.$stdout('No target version string found.');
        TP.boot.$stdout('Simulating \'manual\' local cache.');

        //  no target version for the root module, consider cache valid but
        //  check individual nodes for version/update information.
        TP.sys.setcfg('import.source', 'marked');

        return;
    }

    //  if the strings are the same, regardless of their form, then we
    //  consider the cache to be current in all respects.
    if (cacheVersion === rootVersion) {
        TP.boot.$stdout('Cache and target versions match.');
        TP.boot.$stdout('Simulating \'fresh\' local cache.');

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
        TP.boot.$stdout('Simulating \'stale\' local cache.');

        TP.sys.setcfg('import.source', 'remote');

        return;
    }

    //  if the root version is recognized but the cache version isn't then
    //  we can presume this is a major update and configure the cache
    //  accordingly.
    if (!TP.TIBET_VERSION_SPLITTER.test(cacheVersion)) {
        TP.boot.$stderr('Unrecognized cache version format: ' +
                        cacheVersion);
        TP.boot.$stdout('Simulating \'stale\' local cache.');

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

        TP.boot.$stdout('Simulating \'stale\' local cache.');

        TP.sys.setcfg('import.source', 'remote');

        return;
    }

    if (rootParts[2] > cacheParts[2]) {
        //  minor update
        TP.boot.$stderr(TP.boot.$join('Minor version change from ',
                        cacheParts[2], ' to ', rootParts[2]));

        TP.boot.$stdout('Simulating \'synchronized\' local cache.');

        TP.sys.setcfg('import.source', 'modified');

        return;
    }

    if (rootParts[3] > cacheParts[3]) {
        //  build update
        TP.boot.$stderr(TP.boot.$join('Build version change from ',
                        cacheParts[3], ' to ', rootParts[3]));

        TP.boot.$stdout('Simulating \'manual\' local cache.');

        TP.sys.setcfg('import.source', 'marked');

        return;
    }

    if (rootParts[4] > cacheParts[4]) {
        //  build update
        TP.boot.$stderr(TP.boot.$join('Patch version change from ',
                        cacheParts[4], ' to ', rootParts[4]));

        TP.boot.$stdout('Simulating \'fresh\' local cache.');

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

//  ------------------------------------------------------------------------

TP.boot.$configureProperties = function(propertyFile) {

    /**
     * @name $configureProperties
     * @synopsis Configures boot properties based on the current bootfile, or
     *     the property file provided.
     * @description This method configures application properties based on the
     *     content of both the property (boot) file provided and the environment
     *     configuration files loaded as a result of the boot.env setting it
     *     optionally defines.
     *
     *     NOTE that boot.twophase will always defer to any value placed in the
     *     initial TP.boot.launch() call.
     * @param {String} propertyFile Path to the Ant/XML property file.
     * @return {null}
     * @todo
     */

    var propertyXML,
        file,
        logpath;

    //  no property file provided? default to the current bootfile
    if (propertyFile == null) {
        if (TP.boot.$$bootxml != null) {
            TP.sys.setcfg('boot.propfile', null);

            TP.boot.$setBootProperties(TP.boot.$$bootxml);
            TP.boot.$setBaseDir(TP.boot.$$bootxml);
        }
    } else {
        propertyXML = TP.boot.$uriLoad(propertyFile, TP.DOM,
            'manifest', TP.sys.cfg('import.manifests'));

        if (propertyXML != null) {
            TP.boot.$setBootProperties(propertyXML);
            TP.boot.$setBaseDir(propertyXML);

            TP.sys.setcfg('boot.propfile', propertyFile);
        }
    }

    //  check boot version with config version
    if (TP.sys.cfg('boot.version') != null &&
        parseInt(TP.sys.cfg('boot.version'), 10) >
            parseInt(TP.boot.$bootversion, 10)) {
        TP.boot.$stderr(TP.boot.$join('Version mismatch: tibet_boot.js ',
                        TP.boot.$bootversion,
                        ' older than ',
                        TP.sys.cfg('boot.version')));

        return;
    }

    TP.sys.setcfg('boot.version', TP.boot.$bootversion);

    // TODO: convert to XML
    //  now try to load/import the environment configuration files.
    file = TP.boot.$uriJoinPaths('~app_cfg', 'environment.js');

    logpath = TP.boot.$uriInTIBETFormat(file).replace('.xml', '');

    try {
        TP.boot.$stdout('Loading config::baseline ' + logpath);
        TP.boot.$uriImport(file, null, true);
    } catch (e) {
        TP.boot.$stderr('Failed on config::baseline: ' + logpath,
                        TP.boot.$ec(e));
    }

    //  customizations specific to this environment...
    file = TP.boot.$uriJoinPaths('~app_cfg', TP.sys.cfg('boot.env') + '.js');

    logpath = TP.boot.$uriInTIBETFormat(file).replace('.xml', '');

    try {
        TP.boot.$stdout(
                TP.boot.$join('Loading config::', TP.sys.cfg('boot.env'),
                                ' ',
                                logpath));

        TP.boot.$uriImport(file, null, true);
    } catch (e) {
        TP.boot.$stderr(
                TP.boot.$join('Failed on config::', TP.sys.cfg('boot.env') +
                                ' ',
                                logpath),
                TP.boot.$ec(e));
    }

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$$configureOverrides = function() {

    /**
     * @name $$configureOverrides
     * @synopsis Processes any arg values that the user may have set,
     *     allowing them to override certain boot properties. Common overrides
     *     include debug, verbose, and display. The args for environment
     *     setting are processed individually by the $configureProperties
     *     function prior to loading the environment-specific configuration
     *     file.
     * @return {null}
     */

    var args,
        i;

    TP.sys.overrides = TP.boot.getURLArguments(top.location.toString());
    args = TP.sys.overrides;

    for (i in args) {
        if (args.hasOwnProperty(i)) {
            TP.boot.$stdout('Setting override for ' + i + ' to \'' +
                            args[i] + '\'');
            TP.sys.setcfg(i, args[i], false, true);
        }
    }

    //  one last thing regarding proper booting is that when we're not using
    //  twophase booting we'll set phasetwo to true at the configuration
    //  level so that no node filtering of phase two nodes is done. the
    //  result is that the system thinks we're in both phase one and phase
    //  two from a node filtering perspective
    TP.sys.setcfg('boot.phasetwo', TP.sys.cfg('boot.twophase') === false);

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$setBootProperties = function(anXMLDocument) {

    /**
     * @name $setBootProperties
     * @synopsis Uses the XML document provided and processes any 'property'
     *     tags, setting the name/value pairs at the global context.
     * @param {XMLDocument} anXMLDocument
     * @return {null}
     */

    var i,
        prop,
        list,
        len;

    if (anXMLDocument == null) {
        if (TP.boot.$$debug) {
            TP.boot.$stderr('Invalid boot parameter document.');
        }

        return;
    }

    //  set the project name from the root element...which is required
    if ((list = anXMLDocument.getElementsByTagName('project')) == null) {
        TP.boot.$stderr('Invalid boot &lt;project&gt; tag.');

        return;
    }

    //  project.* values track the name, controller type and version for the
    //  current project
    TP.sys.setcfg('project.name',
                    list[0].getAttribute('name'));
    TP.sys.setcfg('project.controller',
                    list[0].getAttribute('controller'));
    TP.sys.setcfg('project.version',
                    list[0].getAttribute('version') || '0.0.0.0');

    if ((list = anXMLDocument.getElementsByTagName('property')) == null) {
        if (TP.boot.$$debug && TP.boot.$$verbose) {
            TP.boot.$stderr('Empty boot property list.');
        }

        return;
    }

    //  process the list we found to set our baseline
    len = list.length;
    for (i = 0; i < len; i++) {
        prop = list[i];
        TP.sys.setcfg(prop.getAttribute('name'),
                        prop.getAttribute('value'));
    }

    return;
};

//  ------------------------------------------------------------------------
//  BOOT HOOK FUNCTIONS
//  ------------------------------------------------------------------------

TP.boot.$scriptDidLoad = function(aPath, deferred) {

    /**
     * @name $scriptDidLoad
     * @synopsis Invoked as a boot process hook just after loading a script
     *     file.
     * @param {String} aPath The pathname to the script.
     * @param {Boolean} deferred True if the path is being deferred.
     * @return {null}
     * @todo
     */

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$scriptWillLoad = function(aPath, deferred, aPrefix) {

    /**
     * @name $scriptWillLoad
     * @synopsis Invoked as a boot process hook just prior to loading a script
     *     file.
     * @param {String} aPath The pathname to the script.
     * @param {Boolean} deferred True if the path is being deferred.
     * @param {String} aPrefix Optional prefix to use rather than 'Loading' or
     *     'Deferring'.
     * @return {null}
     * @todo
     */

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$sourceDidLoad = function(srcString) {

    /**
     * @name $sourceDidLoad
     * @synopsis Invoked as a boot process hook just after loading a block of
     *     inline source.
     * @param {String} srcString The source that was executed.
     * @return {null}
     */

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$sourceWillLoad = function(srcString) {

    /**
     * @name $sourceWillLoad
     * @synopsis Invoked as a boot process hook just prior to loading a block of
     *     inline source.
     * @param {String} srcString The source to be executed.
     * @return {null}
     */

    return;
};

//  ------------------------------------------------------------------------
//  TARGET EXPANSION FUNCTIONS
//  ------------------------------------------------------------------------

/*
Support for expanding nested target/module/script descriptions to help build
load manifests for applications or modules being dynaloaded.
*/

//  ------------------------------------------------------------------------

TP.boot.$expandNodeList = function(aNodeList, aResultList, shouldDefer,
                                    $noLog)
{
    /**
     * @name $expandNodeList
     * @synopsis Takes a node list containing tibet_module and tibet_script
     *     elements as well as any echo tags to be expanded and returns a list
     *     containing only tibet_script elements and echo tags from all modules
     *     referenced (nested or otherwise).
     * @param {Nodelist} aNodeList A node list with source nodes.
     * @param {Array} aResultList An array into which each node should be
     *     placed.
     * @param {Boolean} shouldDefer True if the nodes expanded in the result
     *     list should have defer set to true. This is passed when a module is
     *     flagged defer and recurses to expand out the individual children.
     *     Default is false.
     * @param {Boolean} $noLog Passed to nested calls to limit nested logging of
     *     node expansions.
     * @return {null}
     * @todo
     */

    var i,
        j,
        ch,
        cfg,
        src,
        node,
        list,
        script,
        defer,
        debug,
        pathd,
        len,
        resultLen,
        target,
        str;

    debug = TP.sys.cfg('boot.debugnode');
    pathd = TP.sys.cfg('boot.debugpath');

    if (shouldDefer != null) {
        defer = shouldDefer;
    } else {
        defer = false;
    }

    if (aNodeList == null || aResultList == null) {
        if (debug) {
            TP.boot.$stderr('Invalid node or result list for expansion.');
        }

        return;
    }

    resultLen = aResultList.length;

    len = aNodeList.length;

    for (i = 0; i < len; i++) {
        node = aNodeList[i];

        if (node.nodeType === Node.ELEMENT_NODE) {
            switch (node.tagName.toLowerCase()) {
                case 'tibet_module':

                    //  filter modules before potential expansion
                    list = TP.boot.$filterNodeList([node]);

                    if (list.length === 0) {
                        continue;
                    } else {
                        node = list[0];
                    }

                    //  update the boot target as we go so we keep track of
                    //  the current module.target.script information,
                    //  resolving any embedded configuration value found
                    target = node.getAttribute('target');
                    if (target && target.indexOf('{') === 0) {
                        target = TP.sys.cfg(
                                    target.slice(1, target.length - 1));
                    }
                    TP.sys.setcfg('boot.target', target);

                    cfg = node.getAttribute('cfg');
                    if (pathd && TP.boot.$$verbose) {
                        TP.boot.$stdout(
                            'TP.boot.$expandNodeList() read module cfg: ' +
                            cfg);
                    }

                    if (cfg == null || cfg === '' || cfg === '.') {
                        //  modules with no cfg are 'local references' along
                        //  with '.'
                        cfg = TP.boot.$getConfigName();
                        if (pathd && TP.boot.$$verbose) {
                            TP.boot.$stdout(
                                'TP.boot.$expandNodeList() reusing cfg: ' +
                                TP.boot.$getConfigName(true));
                        }
                    } else if (cfg.charAt(0) === '/' ||
                                cfg.indexOf('~tibet/') === 0) {
                        //  clear any leading ~tibet portion to normalize
                        cfg = cfg.replace('~tibet', '');
                        cfg = '.' + cfg;

                        //  libroot
                        if (TP.boot.$getLibRoot() != null) {
                            cfg = TP.boot.$uriJoinPaths(
                                        TP.boot.$getLibRoot(),
                                        cfg);
                        }

                        if (pathd && TP.boot.$$verbose) {
                            TP.boot.$stdout(
                                'TP.boot.$expandNodeList() expanded cfg: ' +
                                cfg);
                        }
                    } else if (cfg.indexOf('~/') === 0) {
                        cfg = cfg.replace('~/', '');
                        cfg = './' + cfg;

                        //  approot
                        if (TP.boot.$getAppRoot() != null) {
                            cfg = TP.boot.$uriJoinPaths(
                                        TP.boot.$getAppRoot(),
                                        cfg);
                        }

                        if (pathd && TP.boot.$$verbose) {
                            TP.boot.$stdout(
                                'TP.boot.$expandNodeList() expanded cfg: ' +
                                cfg);
                        }
                    } else {
                        //  relative to current base
                        cfg = TP.boot.$uriJoinPaths(
                                TP.boot.$getBaseDir(),
                                TP.boot.$uriRelativeToPath(
                                        cfg,
                                        TP.boot.$getBaseDir()));

                        if (pathd && TP.boot.$$verbose) {
                            TP.boot.$stdout(
                                'TP.boot.$expandNodeList() expanded cfg: ' +
                                cfg);
                        }
                    }

                    //  update the node's value so it's fully expanded
                    node.setAttribute('cfg', TP.boot.$uriCollapsePath(cfg));

                    //  capture the defer status
                    if (node.getAttribute('defer') === 'true' ||
                        node.getAttribute('load_deferred') === 'true') {
                        defer = true;
                    } else {
                        defer = false;
                    }

                    //  modules that name the current config file are local
                    if (cfg === TP.boot.$getConfigName()) {
                        if (debug && TP.boot.$$verbose) {
                            TP.boot.$stdout(
                                TP.boot.$join('TP.boot.$expandNodeList(): ',
                                        ' processing ',
                                        TP.boot.$getConfigName(true),
                                        '::',
                                        target));
                        }

                        TP.boot.$expandNodeList(
                                TP.boot.$getTargetNodes(target),
                                aResultList,
                                defer,
                                true);
                    } else {
                        //  if the cfg isn't found we want to just ignore
                        if (TP.boot.$pushConfig(cfg) != null) {
                            if (debug && TP.boot.$$verbose) {
                                TP.boot.$stdout(
                                    TP.boot.$join(
                                            'TP.boot.$expandNodeList(): ',
                                            ' processing ',
                                            TP.boot.$getConfigName(true),
                                            '::',
                                            target));
                            }

                            TP.boot.$expandNodeList(
                                    TP.boot.$getModuleNodes(target),
                                    aResultList,
                                    defer,
                                    true);

                            TP.boot.$popConfig();
                        } else {
                            TP.boot.$stderr(
                            'TP.boot.$expandNodeList() failed on cfg: ' +
                            cfg);
                        }
                    }

                    break;

                //  NOTE that we expand image src references as well here
                case 'tibet_image':
                case 'tibet_script':

                    //  patch in the current module/target information
                    node.setAttribute('load_module',
                                        TP.sys.cfg('boot.module'));
                    node.setAttribute('load_target',
                                        TP.sys.cfg('boot.target'));

                    node.setAttribute('load_deferred', defer);

                    //  see if we need to expand the path with basedir info
                    src = node.getAttribute('src');

                    if (pathd && TP.boot.$$verbose) {
                        TP.boot.$stdout(
                            'TP.boot.$expandNodeList() read src: ' +
                            src);
                    }

                    if (src) {
                        if (src.charAt(0) === '/' ||
                            src.indexOf('~tibet/') === 0) {
                            //  clear any leading ~tibet portion to
                            //  normalize
                            src = src.replace('~tibet', '');
                            src = '.' + src;

                            //  libroot
                            src = TP.boot.$uriJoinPaths(
                                    TP.boot.$getLibRoot(), src);

                            if (pathd && TP.boot.$$verbose) {
                                TP.boot.$stdout(
                                'TP.boot.$expandNodeList() expanded src: ' +
                                src);
                            }
                        } else if (src.indexOf('~/') === 0) {
                            src = src.replace('~/', '');
                            src = './' + src;

                            //  approot
                            src = TP.boot.$uriJoinPaths(
                                        TP.boot.$getAppRoot(),
                                        src);

                            if (pathd && TP.boot.$$verbose) {
                                TP.boot.$stdout(
                                'TP.boot.$expandNodeList() expanded src: ' +
                                src);
                            }
                        } else {
                            //  relative path
                            src = TP.boot.$uriJoinPaths(
                                    TP.boot.$getRootPath(),
                                        TP.boot.$uriJoinPaths(
                                                    TP.boot.$getBaseDir(),
                                                    src));

                            if (pathd && TP.boot.$$verbose) {
                                TP.boot.$stdout(
                                'TP.boot.$expandNodeList() expanded src: ' +
                                src);
                            }
                        }

                        //  update the node's value so it's fully expanded
                        node.setAttribute('src',
                                            TP.boot.$uriCollapsePath(src));
                    }

                    aResultList.push(node);

                    break;

                case 'tibet_config':

                    //  tibet_config tags provide instructions we want to
                    //  actually execute as we read them
                    script = '';
                    for (j = 0; j < node.childNodes.length; j++) {
                        ch = node.childNodes[j];
                        if (ch.nodeType === Node.CDATA_SECTION_NODE &&
                            ch.nodeValue != null) {
                            //  build up the inline src
                            script += ch.nodeValue;
                        }
                    }

                    if (TP.boot.$$debug && TP.boot.$$verbose) {
                        TP.boot.$stdout(
                        'TP.boot.$expandNodeList() found config script: ' +
                        script);
                    }

                    try {
                        eval(script);
                        if (TP.boot.$$debug && TP.boot.$$verbose) {
                            TP.boot.$stdout(
                            'TP.boot.$expandNodeList() ran config script.');
                        }
                    } catch (e) {
                        TP.boot.$stderr(
                                'TP.boot.$expandNodeList() failed to run ' +
                                    'config script',
                                TP.boot.$ec(e));
                    }

                    aResultList.push(node);

                    break;

                case 'echo':

                    aResultList.push(node);

                    break;

                default:

                    break;
            }
        }
    }

    if (debug && TP.boot.$$debug && TP.boot.$$verbose && !$noLog) {
        str = 'TP.boot.$expandNodeList() expanded nodes:' +
                    TP.sys.cfg('boot.log_lineend') +
                    TP.sys.cfg('boot.log_lineend');

        len = aResultList.length;
        for (i = resultLen; i < len; i++) {
            if (aResultList[i].tagName === 'tibet_script') {
                if (aResultList[i].getAttribute('src')) {
                    str += aResultList[i].getAttribute('src') +
                                TP.sys.cfg('boot.log_lineend');
                } else {
                    str += '--- inline source code ---' +
                            TP.sys.cfg('boot.log_lineend');
                }
            }
        }

        TP.boot.$stdout(str);
    }

    return aResultList;
};

//  ------------------------------------------------------------------------

TP.boot.$filterNodeList = function(aNodeList) {

    /**
     * @name $filterNodeList
     * @synopsis Takes a node list containing tibet_module and tibet_script
     *     elements as well as any echo tags to be expanded and returns an Array
     *     containing only those whose if/unless tests pass.
     * @param {Array} aNodeList node list.
     * @return {Array} The Array of nodes whose if/unless tests pass.
     * @todo
     */

    var debug,
        arr,
        log,
        len,
        i,
        node,
        start;

    debug = TP.sys.cfg('boot.debugnode');
    if (aNodeList == null) {
        if (debug) {
            TP.boot.$stderr('TP.boot.$filterNodeList(): invalid node list');
        }

        return;
    }

    //  create an empty array for holding valid nodes
    arr = [];

    //  use a more 'deferred' logging approach so we don't log unless we did
    //  real work here
    if (debug && TP.boot.$$verbose) {
        log = [];
        log.push('TP.boot.$filterNodeList() filtering ' +
                    (aNodeList.length) +
                    ' nodes');
    }

    len = aNodeList.length;
    for (i = 0; i < len; i++) {
        node = aNodeList[i];

        //  if node hasn't been flagged then we're ok to keep it
        if (TP.boot.$ifUnlessPassed(node)) {
            arr.push(node);
        } else {
            if (debug && TP.boot.$$verbose) {
                log.push(TP.boot.$join(
                    'TP.boot.$filterNodeList() removed ',
                        TP.boot.$uriInTIBETFormat(
                            node.getAttribute('cfg') ||
                            node.getAttribute('src') ||
                            node.getAttribute('target') ||
                            node.tagName.toLowerCase()),
                        ': "'));
            }
        }
    }

    if (debug && TP.boot.$$verbose && (log.length > 1)) {
        if (len > 1) {
            log.push('TP.boot.$filterNodeList() retained ' +
                        (arr.length) +
                        ' nodes');
            start = 0;
        } else {
            start = 1;
        }

        for (i = start; i < log.length; i++) {
            TP.boot.$stdout(log[i]);
        }
    }

    return arr;
};

//  ------------------------------------------------------------------------

TP.boot.$ifUnlessPassed = function(aNode) {

    /**
     * @name $ifUnlessPassed
     * @synopsis Tests if and unless conditions on the node, returning true if
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

                //  special case for common filter based on TP.boot.isUA()
                if (TP.boot.$$USER_AGENT_REGEX.test(key)) {
                    condition = TP.boot.isUA.apply(this, key.split('.'));
                } else {
                    condition = TP.sys.cfg(key, TP.sys.env(key));
                }

                if (condition === true) {
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

                //  special case for common filter based on TP.boot.isUA()
                if (TP.boot.$$USER_AGENT_REGEX.test(key)) {
                    condition = TP.boot.isUA.apply(this, key.split('.'));
                } else {
                    condition = TP.sys.cfg(key, TP.sys.env(key));
                }

                if (condition == null || condition === false) {
                    invalid = true;
                    break;
                }
            }
        }
    }

    return !invalid;
};

//  ------------------------------------------------------------------------

TP.boot.$getModuleNodes = function(aTarget, anXMLDocument) {

    /**
     * @name $getModuleNodes
     * @synopsis Returns the NodeList containing a module's elements.
     * @param {String} aTarget The module target to acquire.
     * @param {XMLDocument} anXMLDocument The module XML file to use. Defaults
     *     to the current cfg file returned by TP.boot.$getConfigXML().
     * @return {Array} An Array of nodes with the module's elements.
     * @todo
     */

    var i,
        cfgpath,
        target,
        targets,
        len,
        modulexml,
        moduletarget,
        debug;

    debug = TP.sys.cfg('boot.debugnode');

    cfgpath = TP.boot.$getConfigName(true);

    //  If we're called with an XML document use that, otherwise get the
    //  current XML which should be getting pushed/popped on stack by the
    //  expandNodeList method
    modulexml = (anXMLDocument == null) ?
                    TP.boot.$getConfigXML() :
                    anXMLDocument;

    if (modulexml == null) {
        TP.boot.$stderr(TP.boot.$join('TP.boot.$getModuleNodes(',
                        '\'', cfgpath, '\'',
                        '):',
                        ' module xml not found.'));

        return;
    }

    //  capture the module's target specification or project default
    moduletarget = aTarget;
    if (moduletarget == null) {
        targets = modulexml.getElementsByTagName('project');
        if ((target = targets[0]) != null) {
            moduletarget = target.getAttribute('default');
        }
    }

    //  capture the target we need from the config file's set
    targets = modulexml.getElementsByTagName('target');

    len = targets.length;
    for (i = 0; i < len; i++) {
        target = targets[i];
        if (target != null && target.getAttribute('name') === moduletarget) {
            break;
        }
    }

    //  didn't find it? quit here
    if (target == null ||
        target.getAttribute('name') !== moduletarget) {
        TP.boot.$stderr(TP.boot.$join('TP.boot.$getModuleNodes(',
                        '\'', cfgpath, '\'',
                        '):',
                        ' target \'', moduletarget, '\' not found.'));

        return;
    }

    if (debug && TP.boot.$$verbose) {
        TP.boot.$stdout(
            TP.boot.$join('TP.boot.$getModuleNodes(',
                    '\'', cfgpath, '\'',
                    '):',
                    ' found ', TP.boot.$getElementCount(target.childNodes),
                    ' raw node(s).'));
    }

    return target.childNodes;
};

//  ------------------------------------------------------------------------

TP.boot.$getElementCount = function(aNodeList) {

    /**
     * @name $getElementCount
     * @synopsis Returns the count of elements in a node list.
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

//  ------------------------------------------------------------------------

TP.boot.$getTargetNodes = function(aTarget, failSilently) {

    /**
     * @name $getTargetNodes
     * @synopsis Returns an array of nodes at the local config target aTarget.
     *     Note that this differs from getModuleNodes which allows you to pass
     *     an alterate module XML document.
     * @param {String} aTarget The local config target name.
     * @param {Boolean} failSilently True will suppress error reporting. The
     *     default is false.
     * @return {Array} The Array of target nodes at the local config target.
     * @todo
     */

    var i,
        modulexml,
        target,
        targets,
        len,
        silent,
        debug;

    silent = (failSilently == null) ? false : failSilently;
    debug = TP.sys.cfg('boot.debugnode');

    //  can't do a thing without a config file
    modulexml = TP.boot.$getConfigXML();
    if (modulexml == null) {
        TP.boot.$stderr('TP.boot.$getTargetNodes(): module xml not found');

        return;
    }

    //  capture the target we need from the config file's set and filter
    //  them for conditionals
    targets = modulexml.getElementsByTagName('target');

    len = targets.length;
    for (i = 0; i < len; i++) {
        target = targets[i];
        if (target != null &&
            target.getAttribute('name') === aTarget) {
            break;
        }
    }

    //  didn't find it? quit here
    if (target == null ||
        target.getAttribute('name') !== aTarget) {
        if (silent !== true) {
            TP.boot.$stderr(
                TP.boot.$join('TP.boot.$getTargetNodes(): target \'',
                                aTarget,
                                '\' not found in module ',
                                TP.boot.$getConfigName(true)));
        }

        return;
    }

    if (debug && TP.boot.$$verbose) {
        TP.boot.$stdout(
            TP.boot.$join('TP.boot.$getTargetNodes("', aTarget, '"):',
                            ' found ',
                            TP.boot.$getElementCount(target.childNodes),
                            ' raw node(s).'));
    }

    return target.childNodes;
};

//  ------------------------------------------------------------------------

TP.boot.$uniqueNodeList = function(aNodeArray) {

    /**
     * @name $uniqueNodeList
     * @synopsis Removes any duplicates from the array provided so that
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

    debug = TP.sys.cfg('boot.debugnode');
    arr = [];

    if (aNodeArray == null) {
        if (debug && TP.boot.$$verbose) {
            TP.boot.$stderr(
                    'TP.boot.$uniqueNodeList(): invalid node array');
        }

        return arr;
    }

    dict = TP.boot.$$scripts;
    len = aNodeArray.length;

    for (i = 0; i < len; i++) {
        node = aNodeArray[i];

        if (node.nodeType === Node.ELEMENT_NODE) {
            switch (node.tagName.toLowerCase()) {
                case 'tibet_script':

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
                                        src));
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

//  ------------------------------------------------------------------------
//  IMPORT FUNCTIONS
//  ------------------------------------------------------------------------

/*
*/

//  ------------------------------------------------------------------------

TP.boot.$importApplication = function() {

    /**
     * @name $importApplication
     * @synopsis Dynamically imports application content.
     * @description This method makes heavy use of the config/build file
     *     information to construct a list of script files and inline source
     *     code to import/execute to create a running application image in the
     *     browser. Note that this method 'chains' its parts via setTimeout so
     *     that interim output can be displayed. This helps to avoid long delays
     *     without user feedback.
     * @return {null}
     */

    var errMsg,
        i,
        proj,
        build,
        target,
        targets,
        len,
        appXML;

    appXML = TP.boot.$$bootxml;

    //  can't do a thing without a boot config file
    if (appXML == null) {
        errMsg = 'TP.boot.$importApplication() terminated: ' +
                    'xml config not found';

        TP.boot.$stderr(errMsg);
        if (TP.sys.cfg('boot.display') !== 'console') {
            TP.sys.showBootLog();
        }

        throw new Error(errMsg);
    }

    //  check boot version with config version, can't import when off
    if (TP.sys.cfg('boot.version') != null &&
        parseInt(TP.sys.cfg('boot.version'), 10) !==
                                     parseInt(TP.boot.$bootversion, 10)) {
        TP.boot.$stderr('TP.boot.$importApplication() terminated: ' +
                    'boot version mismatch');

        if (TP.sys.cfg('boot.display') !== 'console') {
            TP.sys.showBootLog();
        }

        return;
    }

    //  if we don't have a target property we'll try to get default
    build = TP.sys.cfg('boot.target');
    if (build == null || build === '') {
        proj = appXML.getElementsByTagName('project')[0];
        build = proj.getAttribute('default');

        if (build == null || build === '') {
            build = 'all';
        }
    }

    //  capture the target we need from the config file's set
    targets = appXML.getElementsByTagName('target');
    len = targets.length;

    for (i = 0; i < len; i++) {
        target = targets[i];

        if (target != null && target.getAttribute('name') === build) {
            break;
        }
    }

    //  didn't find it? quit here
    if (target == null ||
        target.getAttribute('name') !== build) {
        TP.boot.$stderr(
            TP.boot.$join(
                'TP.boot.$importApplication() terminated: target \'',
                build,
                '\' not found'));

        if (TP.sys.cfg('boot.display') !== 'console') {
            TP.sys.showBootLog();
        }

        return;
    }

    //  save the original target name in case we need it in phase two
    TP.boot.$$boottarget = build;
    TP.sys.setcfg('boot.boottarget', build);

    TP.boot.$$importPhaseOne();

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$$importComplete = function() {

    /**
     * @name $$importComplete
     * @synopsis Finalizes an import sequence. Called internally by the
     *     $importComponents routine.
     * @return {null}
     */

    var d_el,
        n_el,

        win,
        path;

    n_el = TP.boot.$getProgressPathElement();
    d_el = TP.boot.$getProgressDeferElement();

    //  if we've been 'importing' and the list is now empty then we're
    //  done with whatever phase we've been processing
    if (TP.boot.$$stage === 'import_components') {
        //  finalize the UI display by invoking display hook function
        TP.boot.$sourceWillLoad();

        //  touch the app root path since it doesn't always get
        //  properly configured otherwise
        TP.boot.$getAppRoot();

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
                    if (d_el) {
                        TP.boot.$elementSetInnerContent(d_el, 'Loaded ');
                    }

                    if (n_el) {
                        if (!(path = TP.sys.cfg('boot.bootmsg'))) {
                            //  raw path content, clear that out
                            TP.boot.$elementSetInnerContent(
                                            n_el,
                                            ' application.');
                        }
                    }

                    //  if we had been processing phase two then we're
                    //  done and can trigger application startup
                    TP.boot.$stdout(
                            'Booting phase two components complete.');

                    TP.boot.$stdout(
                            'Booting application components complete.');

                    TP.boot.$setStage('import_complete');

                    return TP.boot.main();
                } else {
                    TP.boot.$stdout(
                            'Booting phase one components complete.');

                    //  NOTE that this is a possible cul-de-sac since if
                    //  no phase two page ever loads we'll just sit.

                    //  basically the question is simply what happens last,
                    //  either we finish with phase one after the phase two
                    //  page has loaded, or we finish before it. if we
                    //  finish after it arrives we can just keep right on
                    //  moving, but we want to call the function in that
                    //  frame to ensure that the page initializes
                    win = TP.sys.getWindowById(TP.sys.cfg('boot.canvas'));

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
                if (d_el) {
                    TP.boot.$elementSetInnerContent(d_el, 'Loaded ');
                }

                if (n_el) {
                    if (!(path = TP.sys.cfg('boot.bootmsg'))) {
                        //  raw path content, clear that out
                        TP.boot.$elementSetInnerContent(
                                        n_el,
                                        ' application.');
                    }
                }

                TP.boot.$stdout('Booting application components complete.');

                TP.boot.$setStage('import_complete');

                return TP.boot.main();
            }
        } else {
            //  this branch is invoked when components load after the TIBET
            //  boot process has occurred, meaning any newly booted content
            //  is effectively an "add-on"...
            TP.boot.$stdout('Booting add-on components complete.');

            TP.boot.$setStage('import_complete');
        }

        //  turn off reporting to bootlog via TP.boot.$stderr()
        TP.boot.$stderr = TP.STDERR_NULL;
    } else {
        //debugger;
    }

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$importComponents = function(loadSync) {

    /**
     * @name $importComponents
     * @synopsis Dynamically imports a set of application elements read from a
     *     list of 'bootnodes' configured by the invoking function. This boot
     *     node list is a shared property on TP.boot so only one import sequence
     *     can be running at a time. Normally you'd call importModule instead of
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
        nd,
        callback,
        elem,
        srcpath,
        sync,
        len,
        image,
        logmodule,
        logpath,
        source,
        cache;

    TP.boot.$loadNode = null;
    TP.boot.$loadPath = null;
    TP.boot.$loadCached = null;

    if (TP.boot.$$stop === true) {
        TP.boot.$stderr(
                'TP.boot.$importComponents(): stopped due to ERROR');

        return;
    }

    if (TP.boot.$$bootnodes == null) {
        if (TP.boot.$debug && TP.boot.$verbose) {
            TP.boot.$stderr(
                    'TP.boot.$importComponents(): invalid component list');
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
    //  'flatten' modules into place.
    tn = nd.tagName.toLowerCase();

    logmodule = nd.getAttribute('load_module');
    if (logmodule) {
        logmodule = TP.boot.$uriInTIBETFormat(logmodule).replace(
                            '.xml', '');
    }

    if (tn === 'tibet_script' || tn === 'tibet_config') {
        //  first step is to configure for proper feedback, even when the
        //  node we're processing may be deferred.
        if ((srcpath = nd.getAttribute('src')) != null) {
            //  if we're set to import condensed (and we're not overridden
            //  by the need to load original source due to packaging) then
            //  update the source file reference appropriately
            if (TP.sys.cfg('import.condensed')) {
                srcpath = srcpath.replace(
                                /\.(.*?)$/,
                                TP.sys.cfg('pack.extension') + '.$1');
                srcpath = TP.boot.$uriExpandPath(
                                TP.sys.cfg('path.app_cache')) +
                                srcpath.slice(srcpath.lastIndexOf('/'));
            }

            //  update the script setting so we know who's current
            TP.sys.setcfg('boot.script', srcpath);

            //  adjust our log path to show shorthand module/target data
            logpath = TP.boot.$join(
                        logmodule,
                        '::' +
                        nd.getAttribute('load_target'),
                        ' ',
                        srcpath.slice(srcpath.lastIndexOf('/') + 1));

            //  ignore script nodes marked defer, they'll be dyna-loaded
            //  by TIBET on request
            if (TP.sys.cfg('boot.defer') === true &&
                (nd.getAttribute('defer') === 'true' ||
                nd.getAttribute('load_deferred') === 'true')) {
                if (TP.boot.$verbose) {
                    TP.boot.$stdout('Deferring ' + logpath);
                } else {
                    TP.boot.log('Deferring ' + srcpath);
                }

                //  do the will/did pair so any progress counters etc
                //  stay synchronized properly with overall workload
                TP.boot.$scriptWillLoad(srcpath, true);
                TP.boot.$scriptDidLoad(srcpath, true);

                //  re-invoke manually so we move on to the next boot node
                TP.boot.$$bootindex += 1;
                if (sync) {
                    TP.boot.$importComponents(sync);
                } else {
                    setTimeout(TP.boot.$$importAsync, 0);
                }

                return;
            }
        }
        else    //  tibet_config or tibet_script with inline code
        {
            //  update the script setting so we know who's current
            if (tn === 'tibet_config') {
                TP.sys.setcfg('boot.script', 'config');
            } else {
                TP.sys.setcfg('boot.script', 'inline');
            }

            //  adjust our log path to show shorthand module/target data
            logpath = TP.boot.$join(logmodule,
                            '::',
                            nd.getAttribute('load_target'),
                            ' inline &lt;', tn, '&gt; source');
        }

        //  if we've reached this point then we're not deferring the node so
        //  get the logging and prep work done in anticipation of having the
        //  source to actually load. Doing this here avoids having to have
        //  an overly complex callback function when we've got to go over
        //  the wire to get the actual source before we can import.
        if (TP.boot.$verbose) {
            TP.boot.$stdout('Loading ' + (srcpath ? srcpath : logpath));
        } else {
            TP.boot.log('Loading ' + (srcpath ? srcpath : logpath));
        }

        //  trigger the appropriate "will" hook
        if (srcpath) {
            TP.boot.$scriptWillLoad(srcpath);
            TP.boot.$loadPath = srcpath;
            TP.boot.$$loadpaths.push(srcpath);
        } else {
            TP.boot.$sourceWillLoad();
            TP.boot.$loadPath = null;   //  should this be cfg file name?
        }

        //  set the configuration values so the sourceImport call will have
        //  the information from the current node being processed
        TP.sys.setcfg('load.module',
                        nd.getAttribute('load_module') || '');
        TP.sys.setcfg('load.target',
                        nd.getAttribute('load_target') || '');

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
                elem.setAttribute('src', TP.boot.$loadPath);

                elem.setAttribute(
                            'load_module',
                            nd.getAttribute('load_module') || '');
                elem.setAttribute(
                            'load_target',
                            nd.getAttribute('load_target') || '');

                TP.boot.$loadNode = elem;

                callback = function() {

                    TP.boot.$scriptDidLoad(TP.boot.$loadPath);
                    TP.boot.$loadNode = null;

                    TP.boot.$$bootindex += 1;

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

        //  inline source hook
        TP.boot.$sourceDidLoad(source);
    } else if (tn === 'tibet_image') {
        //  preload images if we're configured to do that
        if (TP.sys.cfg('boot.import_images')) {
            if ((srcpath = nd.getAttribute('src')) != null) {
                logpath = TP.boot.$join(
                        logmodule,
                        '::',
                        nd.getAttribute('load_target'),
                        ' ',
                        srcpath.slice(srcpath.lastIndexOf('/') + 1));

                if (TP.boot.$verbose) {
                    TP.boot.$stdout('Preloading image ' + logpath);
                } else {
                    TP.boot.log('Preloading image ' + logpath);
                }

                image = new Image();
                image.src = srcpath;
            }
        }
    } else if (tn === 'echo') {
        //  note we do these regardless of debug/verbose settings

        TP.boot.$sourceWillLoad();

        //  first check for content as an attribute
        if ((msg = nd.getAttribute('message')) != null) {
            TP.boot.$stdout(msg);
        } else {
            //  no attribute content, must be inside the tag
            nd.normalize();
            msg = '';

            if (nd.firstChild != null) {
                msg = nd.firstChild.nodeValue || '';
                msg = TP.boot.$trim(msg);
            }

            TP.boot.$stdout(msg);
        }

        //  note we have to invoke this here to ensure that the final
        //  element of any display is properly updated
        TP.boot.$sourceDidLoad();
    } else {
        //  unsupported tag name, for now we'll just ignore it
    }

    //  reset the script setting
    TP.sys.setcfg('boot.script', null);

    //  re-invoke manually so we move on to the next boot node
    TP.boot.$$bootindex += 1;
    if (sync) {
        TP.boot.$importComponents(sync);
    } else {
        setTimeout(TP.boot.$$importAsync, 0);
    }

    return;
};

//  ------------------------------------------------------------------------

//  alias for consistency
TP.boot.$importFile = TP.boot.$uriImport;

//  ------------------------------------------------------------------------

TP.boot.$importModule = function(aModuleFile, aTarget, aBaseDir, loadSync,
                                    packageName)
{
    /**
     * @name $importModule
     * @synopsis Dynamically imports a specific target from a module. NOTE that
     *     this routine sets TP.boot.$$bootnodes and TP.boot.$$bootindex as part
     *     of its operation since the TP.boot.$importComponents call it relies
     *     on needs these globals.
     * @param {String} aModuleFile Path to the module file.
     * @param {String} aTarget Name of the module target to import. Defaults to
     *     whatever value the module has for 'default' in the project tag.
     * @param {String} aBaseDir Optional basedir path to use. This can be used
     *     to update a relative path in the module's basedir attribute.
     * @param {Boolean} loadSync Should the import be done synchronously or not?
     *     Default is false so that each file is loaded via a short setTimeout.
     * @param {String} packageName An optional package name for loading or
     *     packaging a set of files into a load package for the module.
     * @return {Number} The number of module elements loaded
     * @todo
     */

    var suffix,
        packageUrl,
        result,

        modXML,

        i,
        tmparr,
        nodelist,
        len,

        proj,
        target,
        node,

        work,

        items,
        item,

        logmodule;

    //  if we're configured to import at the module level then check to see
    //  if we've got a concatenated file we can load for this module. if so
    //  then we can skip a lot of IO, which accounts for a majority of the
    //  performance overhead during startup.
    if (packageName && TP.sys.cfg('import.modules')) {
        suffix = TP.boot.$join(
            '_',
            TP.$browserSuffix.toLowerCase(),
            (TP.sys.cfg('import.condensed') ?
                 TP.sys.cfg('pack.extension') :
                 ''));

        packageUrl = TP.boot.$uriExpandPath(
            TP.boot.$uriJoinPaths(
                TP.sys.cfg('path.app_cache'),
                TP.sys.cfg('project.name') +
                    '_' +
                    packageName +
                    suffix +
                    '.js'));

        TP.boot.$stdout('Checking for ' +
                        TP.boot.$uriInTIBETFormat(packageUrl));

        result = TP.boot.$uriImport(packageUrl, null, false, true);
        if (result != null) {
            TP.boot.$setStage('import_components');
            TP.boot.$$importComplete();

            return;
        }
    }

    if (aModuleFile !== TP.boot.$$bootfile) {
        //  load the DOM if possible, otherwise doesn't look like a valid file
        modXML = TP.boot.$uriLoad(aModuleFile, TP.DOM, 'manifest',
                                TP.sys.cfg('import.manifests'));
    } else {
        modXML = TP.boot.$$bootxml;
    }

    if (modXML == null) {
        TP.boot.$stderr(
                'TP.boot.$importModule() terminated: xml config not found');

        return;
    }

    tmparr = [];
    nodelist = [];

    proj = modXML.getElementsByTagName('project')[0];

    //  capture the default target to use from the config if needed
    if (aTarget == null) {
        target = proj.getAttribute('default');

        if (target == null || target === '') {
            target = TP.sys.cfg('boot.target');

            if (target == null || target === '') {
                target = 'full';
            }
        }
    } else {
        target = aTarget;
    }

    //  update the basedir as needed. a full-path basedir makes this step
    //  unnecessary
    if (aBaseDir != null) {
        proj.setAttribute('basedir', aBaseDir);
    }

    //  locate the specific boot target node we're being asked to locate
    items = modXML.getElementsByTagName('target');

    len = items.length;
    for (i = 0; i < len; i++) {
        item = items[i];
        if (item != null && target === item.getAttribute('name')) {
            node = item;

            break;
        }
    }

    if (node == null) {
        TP.boot.$stdout(
                'TP.boot.$importModule() no target ' + target + ' found');

        return;
    }

    //  push the module to set up for nested tibet_module refs etc.
    TP.boot.$pushConfig(aModuleFile);

    //  process the target's nodes by expanding descendant module tags
    tmparr.length = 0;
    TP.boot.$expandNodeList(node.childNodes, tmparr);

    //  flatten the resulting list as needed
    len = tmparr.length;
    for (i = 0; i < len; i++) {
        nodelist.push(tmparr[i]);
    }

    //  filter for environment etc.
    nodelist = TP.boot.$filterNodeList(nodelist);

    //  clean out any duplicates that remain
    nodelist = TP.boot.$uniqueNodeList(nodelist);

    if (TP.boot.$debug && TP.boot.$verbose) {
        logmodule = TP.boot.$uriInTIBETFormat(aModuleFile).replace(
                                        '.xml', '');

        TP.boot.$stdout(
            TP.boot.$join('TP.boot.$importModule() ',
                            logmodule, '::', aTarget,
                            ' sync: ', ((loadSync == null) ? '' : loadSync),
                            ' count: ', nodelist.length));
    }

    //  pop when we're done building the manifest for this module
    TP.boot.$popConfig();

    //  update the workload data
    if ((work = TP.sys.cfg('boot.workload')) != null) {
        TP.sys.setcfg('boot.workload', work + nodelist.length);
    } else {
        TP.sys.setcfg('boot.workload', nodelist.length);
    }

    //  set up for import
    TP.boot.$$bootindex = 0;
    TP.boot.$$bootnodes = nodelist;

    //  reset to importing phase or importComponents won't know how to
    //  terminate properly and make sure we reset to the start of the boot
    //  node list for iteration
    TP.boot.$setStage('import_components');

    try {
        //  do the work. NOTE that since this can be asynchronous we rely
        //  entirely on the importComponents and importComplete routines.
        TP.boot.$importComponents(loadSync);

        //  track for hasModule support
        TP.boot.$$modules[aModuleFile + '#' + target] = true;
    } catch (e) {
    }

    //  NOTE that we can't do much here...importComponents may run async
    return nodelist.length;
};

//  ------------------------------------------------------------------------

TP.boot.$$importPhaseOne = function() {

    /**
     * @name $$importPhaseOne
     * @synopsis Imports any elements of the original boot file/target that were
     *     specific to phase one.
     * @return {Number} The number of phase one nodes imported.
     */

    var file,
        target,
        sync;

    TP.boot.$setStage('import_phase_one');

    //  always phaseone here, phasetwo is set to filter out phase two nodes
    //  when we're not doing two-phased booting so we get all the nodes in
    //  the first phase.
    TP.sys.setcfg('boot.phaseone',
                    true);
    TP.sys.setcfg('boot.phasetwo',
                    TP.sys.cfg('boot.twophase') === false);

    //  for easier debugging let's expose these as variables
    file = TP.sys.cfg('boot.bootfile');
    target = TP.sys.cfg('boot.boottarget');
    sync = TP.boot.$$loadsync;

    //  import the phase one code. NOTE that if that package of code exists and
    //  is loadable it will be loaded in lieu of loading the individual files
    //  which make up the phase.
    TP.boot.$importModule(file, target, null, sync, 'phaseone');

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$$importPhaseTwo = function() {

    /**
     * @name $$importPhaseTwo
     * @synopsis Imports any elements of the original boot file/target that were
     *     specific to phase two.
     * @return {Number} The number of phase two nodes imported.
     */

    var file,
        target,
        sync;

    if (TP.sys.cfg('boot.twophase') !== true) {
        return;
    }

    TP.boot.$setStage('import_phase_two');

    //  update our configuration to reflect our new state or the import
    //  will continue to filter out phase two nodes
    TP.sys.setcfg('boot.phaseone', false);
    TP.sys.setcfg('boot.phasetwo', true);

    //  for easier debugging let's expose these as variables
    file = TP.sys.cfg('boot.bootfile');
    target = TP.sys.cfg('boot.boottarget');
    sync = TP.boot.$$loadsync;

    //  update to phase two progress bar, if necessary
    TP.boot.$$progressBar = TP.boot.$$progressBarTwo;

    //  import the phase two code. NOTE that if that package of code exists and
    //  is loadable it will be loaded in lieu of loading the individual files
    //  which make up the phase.
    TP.boot.$importModule(file, target, null, sync, 'phasetwo');

    return;
};

//  ------------------------------------------------------------------------
//  WINDOWING / DISPLAY
//  ------------------------------------------------------------------------

TP.sys.showBootLog = function() {

    /**
     * @name showBootLog
     * @synopsis Provide support to the user who wants to view the boot log in
     *     case the boot process seems to have hung.
     * @return {null}
     */

    var log,
        tibetWin,
        arr,
        str,
        win,
        css,
        i,

        time,
        lasttime,

        len,
        msg,
        entries,
        features,
        t, l, w, h, x, y;

    css = 'tibet.css';

    //  the log will be in the TIBET frame if there is one, otherwise it
    //  should be in the local frame
    tibetWin = $$findTIBET();
    tibetWin = (tibetWin == null) ? window : tibetWin;

    if (tibetWin.TP != null && TP.sys != null) {
        log = tibetWin.TP.sys.$bootlog;
        css = tibetWin.TP.boot.$uriJoinPaths(
                        tibetWin.TP.boot.$currentDocumentLocation(),
                        './TIBET-INF/base/lib/tibet/css/tibet.css');
    } else {
        // no boot log - there's nothing to show
        return;
    }

    arr = [];
    if (log != null) {
        arr.push('<ol>');

        //  entries are date, logname, loglevel, object. we'll skip the log
        //  name (always boot) and use level to drive class on the object
        entries = log.getEntries();

        len = entries.length;
        for (i = 0; i < len; i++) {
            msg = entries[i];
            time = msg[TP.LOG_ENTRY_DATE].getTime();
            lasttime = (i === 0) ?
                        time :
                        entries[i - 1][TP.LOG_ENTRY_DATE].getTime();

            arr.push('<li>',
                        '<span class="logdate">',
                        time.toString(),
                        '</span>',
                        '<span class="logdate">',
                        '+',
                        TP.boot.$lpad(time - lasttime, 3, '0'),
                        '</span>',
                        '<span class="',
                            TP.boot.Log.getClassForLevel(
                                            msg[TP.LOG_ENTRY_LEVEL]),
                        '">',
                        msg[TP.LOG_ENTRY_PAYLOAD].replace(/</g, '&lt;').
                                                    replace(/>/g, '&gt;'),
                        '</span>',
                        '</li>');
        }

        arr.push('</ol>');
    }

    str = arr.join('\n');

    //  build up the feature string we need to create new windows so we can
    //  pass it to the open call
    t = TP.boot.isUA('IE') ? ',top=' : ',screenY=';
    l = TP.boot.isUA('IE') ? ',left=' : ',screenX=';

    w = parseInt(screen.width / 2, 10);
    h = parseInt(screen.height / 2, 10);

    x = parseInt((screen.width / 2) - (w / 2), 10);
    y = parseInt((screen.height / 2) - (h / 2), 10);

    features = TP.boot.$join(
                    'location=no,menubar=no,toolbar=no,status=no,',
                    'scrollbars=yes,resizable=yes',
                    ',width=', w, ',height=', h,
                    t, y, l, x);

    //  if we found a log then we'll open a window with the boot log data
    if (log != null) {
        win = window.open('', 'bootlog', features);

        win.document.open();
        win.document.write('formatting...');
        win.document.close();

        win.document.open();
        win.document.write(
            TP.boot.$join(
                    '<html style="overflow:visible">',
                    '<head><title>TIBET&#153; Boot Log</title>',
                    '<link href="', css, '"',
                            ' rel="stylesheet" type="text/css"',
                            ' media="screen"/>',
                    '</head>',
                    '<body style="overflow:scroll">',
                        str.replace(/<(?:\/*?)html:/g, '<'),
                    '</body></html>'));
        win.document.close();
    } else {
        win = window.open('', 'bootlog', features);

        win.document.open();
        win.document.write('TIBET boot log not found.');
        win.document.close();
    }

    return;
};

//  ------------------------------------------------------------------------
//  BOOT FUNCTIONS
//  ------------------------------------------------------------------------

TP.boot.boot = function(aBootFile) {

    /**
     * @name boot
     * @synopsis Triggers the actual boot process. This function is typically
     *     invoked by the tibet.html file found in a project's root directory
     *     since it relies on the existence of a 'ui' iframe which is contained
     *     in that file by default.
     * @param {String} aBootFile File name of the bootfile to use. This value is
     *     only required when using a non-standard name/location.
     * @return {null}
     * @todo
     */

    //  turn on the boot ui
    TP.boot.showContent('booting');

    //  get everything prepared: environment, configuration params, etc.
    TP.boot.$config(aBootFile);

    //  now that we've been provided a chance to configure delay, use it
    setTimeout(TP.boot.$importApplication,
                parseInt(TP.sys.cfg('boot.delay'), 10));

    return;
};

//  ------------------------------------------------------------------------

TP.boot.$config = function(aBootFile) {

    /**
     * @name $config
     * @synopsis Configures the boot process based on aBootFile, or the default
     *     ${boot.tibetxml} file found for this application.
     * @param {String} aBootFile File name of the boot file to use. Default is
     *     tibet.xml.
     * @return {null}
     * @todo
     */

    var str,
        handlerFunc;

    TP.boot.$setStage('configuring');

    // Start off with overrides to try to set things up as user wants to begin.
    TP.boot.$$configureOverrides();

    //  hook up a "failsafe" to display the boot log if at all possible
    if (TP.boot.isUA('IE')) {
        document.attachEvent('keydown',
            handlerFunc = function() {

                if (event.keyCode === 27)    //  escape
                {
                    TP.boot.showBootLog();
                    if (TP.sys.hasInitialized()) {
                        this.detachEvent('keydown', handlerFunc);
                    }
                }
            });
    } else {
        document.addEventListener('keydown',
            handlerFunc = function(ev) {

                if (ev.keyCode === 27)       //  escape
                {
                    TP.boot.showBootLog();
                    if (TP.sys.hasInitialized()) {
                        this.removeEventListener('keydown', handlerFunc, true);
                    }
                }
            }, true);
    }

    //  first step is to make sure we're observing user's arg settings
    //  for any debug/verbose output flagging
    TP.boot.$configureDebug();

    //  warn about unsupported platforms but don't halt the boot process
    if (!TP.boot.isSupported()) {
        TP.boot.$stderr('Unsupported browser/platform: ');
        TP.boot.$stderr(TP.$agent);
        TP.boot.$stderr('You may experience problems.');
    }

    //  don't boot TIBET twice into the same window hierarchy, check to make
    //  sure we don't already see the $$tibet window reference
    if (window.$$tibet !== null && window.$$tibet !== window) {
        //  make sure the user sees this
        TP.boot.$alert('Found existing TIBET image in ' +
                (typeof(window.$$tibet.getFullName) === 'function') ?
                                window.$$tibet.getFullName() :
                                window.$$tibet.name);
        return;
    }

    //  set up initial display so the entire process can be user-visible. at
    //  the time of this call note that the only two possible sources for
    //  display configuration data are url args and this file. args win.
    TP.boot.$configureDisplay();

    //  set up the environment variables appropriate for the browser. this
    //  information can then help drive the remaining parts of the process
    TP.boot.$configureEnvironment();

    //  locates configuration file if at all possible. the configuration
    //  file, aka the 'root module' file, aka tibet.xml, defines the overall
    //  'build' that we'll be booting. NOTE that this file isn't cached.
    TP.boot.$configureBootfile(aBootFile);

    //  setup any local cache storage and adjust settings for import/export
    TP.boot.$configureLocalCache();

    //  loads configuration file and sets properties to initialize booting.
    //  this process will also reinvoke debugging and display configuration
    //  to ensure that any user-specified url values remain in force
    TP.boot.$configureProperties();

    //  for moz we can optionally check whether the status bar is writable,
    //  but we want to do that after reading boot properties into place so
    //  it can be controlled via the bootfile
    if (TP.sys.cfg('boot.check_status') === true) {
        TP.boot.$checkStatus();
    }

    //  next step is to set the default basedir value to prep for loading
    TP.boot.$setDefaultBaseDir();

    //  checks for any modules/scripts to process prior to actual import
    TP.boot.$configureBootscript();

    //  NOTE that since we don't know if we're configured to dump the
    //  environment until we've read the property file we wait until now to
    //  perform that check
    if (TP.sys.cfg('boot.log_env')) {
        str = TP.boot.$dump(TP.sys.environment,
                            TP.sys.cfg('boot.log_lineend'));

        TP.boot.$stdout(TP.boot.$join('TIBET environment variables:',
                        TP.sys.cfg('boot.log_lineend'),
                        TP.sys.cfg('boot.log_lineend'),
                        str));
    }

    if (TP.sys.cfg('boot.log_cfg')) {
        str = TP.boot.$dump(TP.sys.configuration,
                            TP.sys.cfg('boot.log_lineend'));

        TP.boot.$stdout(TP.boot.$join('TIBET configuration variables:',
                        TP.sys.cfg('boot.log_lineend'),
                        TP.sys.cfg('boot.log_lineend'),
                        str));
    }

    if (!window.name) {
        window.name = 'window_0';
    }

    return;
};

//  ------------------------------------------------------------------------

TP.boot.uiRootLoaded = function(login, parallel) {

    /**
     * @name uiRootLoaded
     * @synopsis Called to complete the process of launching a new TIBET
     *     application once the UI root frame is loaded. The parameters here
     *     define the specific nature of the window used and the type of boot
     *     process: single or two-phased. The result is that you rarely have to
     *     modify any of the logic related to booting that is encoded within
     *     the template html files for a project. The default is to launch for
     *     inline, two-phased, with login.
     * @param {Boolean} login true to use a login frameset, otherwise a splash
     *     frameset page will be used. Note that both scenarios make use of a
     *     standard TIBET-structured frameset. Default is true.
     * @param {Boolean} parallel true to cause phase one code to load in
     *     parallel with the login sequence. faster user-perceived performance
     *     for launch times. Ignored when login is not true.
     * @return {Window} The window the application launched in.
     * @todo
     */

    var win,
        file,
        uiRootID;

    uiRootID = TP.sys.cfg('tibet.uiroot');

    win = TP.sys.getWindowById(uiRootID);
    if (TP.boot.$notValid(win)) {
        TP.boot.$stdout(
            'Unable to locate boot canvas, defaulting to current window.');

        win = window;
    }

    if (login !== true) {
        //  without a login sequence there won't be a page coming back to
        //  say that we're authenticated for phase two, we have to do that
        //  manually here.
        win.$$phasetwo = true;

        TP.boot.boot();
    } else {
        //  login was explicitly true
        file = TP.sys.cfg('boot.loginpage', '~app_html/login.html');
        file = TP.boot.$uriExpandPath(file);

        if (parallel === false) {
            //  sequential login means we don't start booting, we just
            //  have to put the login page into place and rely on the page
            //  that comes back to re-start the boot sequence without
            //  needing a login (since it just completed)...

            //  NOTE 'window' here, not win, is intentional
            window.location.replace(file);
        } else {
            //  parallel booting means we'll put the login page into the
            //  boot.canvas while booting in the background. The login
            //  response must set $$phasetwo to allow booting to proceed
            //  beyond the first phase.

            TP.boot.showUICanvas(file);
            TP.boot.boot();
        }
    }

    return;
};

//  ------------------------------------------------------------------------

TP.boot.launch = function(login, parallel) {

    /**
     * @name launch
     * @synopsis Launches a new TIBET application. The parameters here define
     *     the specific nature of the window used and the type of boot process:
     *     single or two-phased. The result is that you rarely have to modify
     *     any of the logic related to booting that is encoded within the
     *     template html files for a project. The default is to launch for
     *     inline, two-phased, with login.
     * @param {Boolean} login true to use a login frameset, otherwise a splash
     *     frameset page will be used. Note that both scenarios make use of a
     *     standard TIBET-structured frameset. Default is true.
     * @param {Boolean} parallel true to cause phase one code to load in
     *     parallel with the login sequence. faster user-perceived performance
     *     for launch times. Ignored when login is not true.
     * @return {Window} The window the application launched in.
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

    if (!TP.boot.isSupported()) {
        TP.boot.showUnsupported();

        return;
    }

    //  capture start time for computation of total boot time
    TP.boot.$starttime = new Date();

    //  we'll output this once we've gotten past status bar checks
    TP.boot.$stdout(TP.sys.cfg('boot.sectionbar'));
    TP.boot.$stdout('Booting via TIBET Boot System (TBS) v' +
                    TP.boot.$bootversion);
    TP.boot.$stdout(TP.sys.cfg('boot.sectionbar'));

    TP.boot.$setStage('initializing');

    uiRootID = TP.sys.cfg('tibet.uiroot');

    //  see if the 'uiroot' iframe has already been generated.
    uiFrame = document.getElementById(uiRootID);

    if (TP.boot.$notValid(uiFrame)) {
        TP.boot.$stdout(
            'Unable to locate ui root iframe, generating one.');

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

            path = TP.boot.$uriJoinPaths(
                    TP.boot.$uriExpandPath('~lib_xhtml'),
                    'tp_launch_stub.xhtml');
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

                TP.boot.uiRootLoaded(login, parallel);
            };

            return;
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

            TP.boot.uiRootLoaded(login, parallel);
        }
    } else {
        TP.boot.uiRootLoaded(login, parallel);
    }
};

//  ------------------------------------------------------------------------

TP.boot.main = function() {

    /**
     * @name main
     * @synopsis Invoked when all booting has been completed. The primary
     *     purpose of this function is to hide any boot-time display content
     *     and then invoke the TP.sys.activate method to cause the system to
     *     initialize.
     * @return {null}
     */

    TP.boot.$loadtime = new Date();
    TP.boot.$stdout(
            'Total load time: ' +
            (TP.boot.$loadtime.getTime() - TP.boot.$starttime.getTime()) +
            'ms');

    if (TP.boot.$$stop) {
        return;
    }

    TP.boot.$setStage('main_engine_start');

    try {
        //  (i.e. progress bar, etc.) so that the system doesn't try to
        //  reference them again.
        TP.boot.$releaseUIElements();

        //  protect the codebase from inadvertent exits

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

        //  update to show we've loaded now
        if (TP.sys.hasKernel()) {
            TP.sys.hasLoaded(true);
        }

        try {
            //  now that app really did load, tell the TP.sys object to
            //  activate. This will complete the boot sequence and launch
            //  the app.
            TP.sys.activate();
        } catch (e2) {
            TP.boot.$stderr('Error starting application.', TP.boot.$ec(e2));
        }
    } catch (e) {
        TP.boot.$stderr('Error starting application.', TP.boot.$ec(e));
    }

    return;
};

//  ------------------------------------------------------------------------
//  PUBLIC CONFIGURATION PARAMETERS
//  ------------------------------------------------------------------------

/**
 * @This section contains the default values for public parameters. As with the
 *     internal settings, you shouldn't edit these here. Use the environment
 *     files or your tibet.xml file to adjust these as needed for each
 *     application.
 * @todo
 */

//  ---
//  api/ecma
//  ---

//  should add*() methods check their keys against JS/ECMA keywords etc?
//  this can be a useful check to turn on when you're seeing strange
//  behavior around hashes, just to make sure you're not conflicting
//  with a built-in Javascript object, slot, or keyword of some form.
TP.sys.setcfg('api.lint_keys', false);

//  some browsers don't really implement the full ECMA specification when it
//  comes to certain method APIs. We can patch for some of this, but it's a
//  big performance hit in some cases so it's normally off. Just stay away
//  from methods with negative start indexes if you leave this off :).
TP.sys.setcfg('api.strict_ecma', false);

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
TP.sys.setcfg('break.content_process', false);  //  process calls
TP.sys.setcfg('break.content_substitute', false);   //  substitutions
TP.sys.setcfg('break.content_templating', false);   //  ${var} templates
TP.sys.setcfg('break.content_transform', false);    //  transformNode calls

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
TP.sys.setcfg('break.signal_domfiring', false); //  DOM firing

//  tdc/console
TP.sys.setcfg('break.tdc_stdin', false);            //  console stdin
TP.sys.setcfg('break.tdc_stderr', false);           //  console stderr
TP.sys.setcfg('break.tdc_stdout', false);           //  console stdout

//  tsh/shell
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
TP.sys.setcfg('css.process_styles', true);

//  ---
//  debug/error handling
//  ---

//  forward errors to standard JS handler or capture them? unfortunately
//  this doesn't always work consistently with the IE ScriptDebugger.
TP.sys.setcfg('debug.capture_errors', true);

//  should native JS errors cause a notify() panel display? usually not.
TP.sys.setcfg('debug.notify_onerror', false);

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

//  Which default formatter should be used when sending log output to the
//  stdout routine?
TP.sys.setcfg('log.default_format', 'tsh:pp');

//  what output/logging level will filter the error and activity logging?
TP.sys.setcfg('log.level', 2);      //  0 (TRACE) thru 6 (SYSTEM)
                                //  WARN is the default

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
//  metadata
//  ---

//  what is the path to the shared metadata cache file? this optional file
//  is used when loading partial applications and autoloading the remaining
//  elements on demand since it maintains paths to all code in the app.
TP.sys.setcfg('meta.metadata', '~app_cfg/__metadata__.js');
TP.sys.setcfg('meta.proxydata', '~app_cfg/__proxydata__.js');

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

/*
For windows-based TP.$fileExecute calls on Moz we need a way to default the
root processing shell. This is the shell used to initialize the nsIProcess
that will be used to invoke the command line built from the parameters
passed to TP.$fileExecute calls. See that function for more information.
*/
if (TP.boot.isWin()) {
    //  standard windows shell is cmd.exe, but it will show popups of a
    //  console window while the command executes (see below for options)
    //TP.sys.setcfg('os.comspec_path',
    //                  'file:///C:/WINDOWS/system32/cmd.exe');
    //TP.sys.setcfg('os.comspec_flags',
    //                  ['/c']);        //  in a window, then close

    //  if you want to skip the window popping up while you run commands on
    //  Mozilla when using cmd.exe you can use hstart.exe available from
    //  http://www.ntwind.com/software/utilities/hstart.html. We recommend
    //  placing it in the root of your file system as shown below.
    TP.sys.setcfg('os.comspec_path',
                    'file:///C:/hstart.exe ');
    //TP.sys.setcfg('os.comspec_flags',
    //              ['/NOWINDOW']); //  don't block, no window
    TP.sys.setcfg('os.comspec_flags',
                    ['/WAIT', '/NOWINDOW']); //  block, no window

    //  windows redirection symbols, used for output and error text capture
    TP.sys.setcfg('os.comspec_redirect_out', '>');
    TP.sys.setcfg('os.comspec_redirect_err', '2>');

    //  the files used when running TP.$fileExecute commands to capture
    //  stdout and stderr from the commands you run. these files are created
    //  on demand and _should not include any spaces_ due to limitations in
    //  the current process invocation code. we recommend the following:
    TP.sys.setcfg('os.comspec_err',
                    'file:///C:/.tibet.err');   //  note leading .
    TP.sys.setcfg('os.comspec_out',
                    'file:///C:/.tibet.out'); //    note leading .
} else {
    TP.sys.setcfg('os.comspec_path', '/bin/bash');
    //TP.sys.setcfg('os.comspec_path', '/bin/sh');
    //TP.sys.setcfg('os.comspec_path', '/bin/ksh');
    //TP.sys.setcfg('os.comspec_path', '/bin/tcsh');

    TP.sys.setcfg('os.comspec_flags', ['-c']);

    //  bash redirection characters
    TP.sys.setcfg('os.comspec_redirect_out', '>|');
    TP.sys.setcfg('os.comspec_redirect_err', '2>|');

    //  tcsh redirection characters
    //TP.sys.setcfg('os.comspec_redirect_out', '>!');
    //TP.sys.setcfg('os.comspec_redirect_err', '>&!');

    TP.sys.setcfg('os.comspec_err', 'file:///tmp/.tibet.err');
    TP.sys.setcfg('os.comspec_out', 'file:///tmp/.tibet.out');
}

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

//  should the TDC output collection value types during status updates?
TP.sys.setcfg('tdc.type_collections', true);

//  how long should the TDC wait to fade out a bubble (in milliseconds)?
TP.sys.setcfg('tdc.bubble_fade_time', 2000);

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
TP.sys.setcfg('signal.dom_loaded', false);

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

//  are we currently running 'offline' or 'online'? this setting along with
//  the environment setting helps determine how the rewrite call looks up
//  URI references to allow alternative servers and or storage locations.
//  the default is to presume 'online' operation unless the user has
//  responded to a "work offline" prompt (presumably provided by you when an
//  HTTP connection times out with an HTTPTimeout or a similar error occurs)
TP.sys.setcfg('tibet.offline', false);

//  should TIBET enforce type uniqueness during addSubtype operation. the
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

//  "multiple inheritance" via delegation on/off. backstop must be on.
TP.sys.setcfg('tibet.$$use_guardians', true);

//  should inferencing be enabled.
TP.sys.setcfg('tibet.$$use_inferencing', true);

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
TP.sys.setcfg('xpath.parser_path', '~tibet_src/parsers/TPXPathParser.js');

//  when using XSLT templates we use a boilerplate XSLT file to keep from
//  requiring a lot of bulk in the templates themselves.
TP.sys.setcfg('xslt.boilerplate_path',
    '~lib_src/tsh/xsl/tsh_template_template.xsl');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

