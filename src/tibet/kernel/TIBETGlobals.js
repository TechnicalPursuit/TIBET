//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/*
@file           TIBETGlobals.js
@abstract       This file defines values used to avoid "magic numbers" and
                other special values in TIBET code. We also patch missing
                DOM/W3C constants in non-compliant browsers and provide
                pre-compiled regular expression definitions so we can keep
                commonly used expressions together and optimize performance.

                NOTE that while the file name includes "global" the values
                defined are found on the TIBET and TP root objects rather than
                the window/global context.

                !!!YOU SHOULD NOT EDIT THIS FILE!!!
                !!!YOU SHOULD NOT EDIT THIS FILE!!!
                !!!YOU SHOULD NOT EDIT THIS FILE!!!

                If you need to alter TIBET's runtime behavior you should be
                using TIBET's configuration and environment settings to adjust
                public parameter values. If you must alter a value defined in
                this file you should add the proper calls to your tibet.xml file
                in a post-boot target such as one of the app_* targets or the
                boot_suffix target.
*/

//  ------------------------------------------------------------------------
//  NATIVE PROTOTYPE REFERENCES
//  ------------------------------------------------------------------------

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

//  ------------------------------------------------------------------------
//  LOW-LEVEL OBJECT CREATION
//  ------------------------------------------------------------------------

//  method metadata slots - need these for method definitions below.

TP.DISPLAY = 'displayName';     //  What debuggers want to see.
TP.NAME = '$$name';
TP.ID = '$$id';
TP.OWNER = '$$owner';
TP.TRACK = '$$track';

// track constants

TP.GLOBAL_TRACK = 'Global';
TP.PRIMITIVE_TRACK = 'Primitive';
TP.META_INST_TRACK = 'MetaInst';
TP.META_TYPE_TRACK = 'MetaType';
TP.INST_TRACK = 'Inst';
TP.LOCAL_TRACK = 'Local';
TP.TYPE_TRACK = 'Type';
TP.TYPE_LOCAL_TRACK = 'TypeLocal';

//  ------------------------------------------------------------------------

TP.constructOrphanObject = function() {

    /**
     * @name constructOrphanObject
     * @synopsis Constructs an 'orphan' object - that is, one that isn't hooked
     *     up to any prototype chain. This is very useful in situations such as
     *     JSON reconstruction where an 'initially keyless' Object is desired.
     *     NOTE: If an 'orphan' Object cannot be constructed on the currently
     *     executing platform, this method will return null.
     * @returns {Object|null} A pure Object or null if one can't be constructed.
     */

    var newObj;

    newObj = null;

    //  ECMA edition 5 defines the new 'Object.create()' method, which is
    //  very cool because you can pass it null to create an Object that is
    //  not hooked up to the prototype chain. NOTE we could have unhooked the
    //  __proto__ on certain older browsers but since we only support
    //  EC5-compliant browsers we don't bother.
    if (Object.create) {
        newObj = Object.create(null);
    }

    return newObj;
};

//  Manual setup
TP.constructOrphanObject[TP.NAME] = 'constructOrphanObject';
TP.constructOrphanObject[TP.OWNER] = TP;
TP.constructOrphanObject[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.constructOrphanObject[TP.DISPLAY] = 'TP.constructOrphanObject';
TP.constructOrphanObject[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];

//  Create an alias
TP.oc = TP.constructOrphanObject;

//  ------------------------------------------------------------------------
//  DEFINE PROPERTY KEYS
//  ------------------------------------------------------------------------

TP.PROPERTY_DEFAULTS = TP.constructOrphanObject();
TP.PROPERTY_DEFAULTS.writable = true;
TP.PROPERTY_DEFAULTS.enumerable = false;

TP.PROPERTY_READONLY = TP.constructOrphanObject();
TP.PROPERTY_READONLY.writable = false;
TP.PROPERTY_READONLY.enumerable = false;

//  ------------------------------------------------------------------------
//  MODULE DEFINITION
//  ------------------------------------------------------------------------

TP.defineNamespace = function(namespaceName, root) {

    /**
     * @name defineNamespace
     * @synopsis Defines a namespace named by the supplied name, defined as a
     *     'namespace' on the root provided.
     * @description The name supplied to this method defines a namespace list
     *     from the root object to the last name at the end of the supplied
     *     namespace name.
     * @param {String} namespaceName A String of 1 or more period-separated
     *     names that will define the name of a namespace.
     * @param {String} root The top-level namespace owner.
     * @returns {Object} The newly defined namespace.
     */

    var names,
        currentObj,
        prefix,
        name,
        i;

    names = namespaceName.split('.');

    currentObj = self[root];
    if (!currentObj) {
        TP.boot.$stderr('Invalid namespace root.', TP.FATAL);
        return;
    }

    prefix = root + '.';

    //  Descend through the names, making sure that there's a real Object at
    //  each level.
    for (i = 0; i < names.length; i++) {

        if (!currentObj[names[i]]) {
            currentObj[names[i]] = {};
            currentObj[names[i]].$$isNamespace = true;

            name = prefix + names.slice(0, i + 1).join('.');
            currentObj[names[i]][TP.NAME] = name;
            currentObj[names[i]][TP.ID] = name;

            //  TODO: replace with a common method (no closure) applied via
            //  addLocalMethod

            /* eslint-disable no-loop-func */
            currentObj[names[i]].getTypeNames =
                            function() {

                                var keys,
                                    namelist,
                                    len,
                                    j,
                                    typename;

                                keys = TP.keys(this);
                                namelist = TP.ac();

                                len = keys.getSize();
                                for (j = 0; j < len; j++) {
                                    typename = this[TP.NAME] +
                                                '.' +
                                                keys.at(j);
                                    if (TP.isType(typename.asType())) {
                                        namelist.push(typename);
                                    }
                                }

                                return namelist;
                            };
            /* eslint-enable no-loop-func */
        }

        currentObj = currentObj[names[i]];
    }

    //  Return the 'last' Object that we created - that'll be the module
    //  that the caller wants.
    return currentObj;
};

//  Manual setup
TP.defineNamespace[TP.NAME] = 'defineNamespace';
TP.defineNamespace[TP.OWNER] = TP;
TP.defineNamespace[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.defineNamespace[TP.DISPLAY] = 'TP.defineNamespace';
TP.defineNamespace[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];

//  ------------------------------------------------------------------------

TP.isNamespace = function(namespaceObj) {

    /**
     * @name isNamespace
     * @synopsis Tests the supplied object to see if it is a TIBET 'namespace'
     *     object.
     * @param {The} namespaceObj object to test to see if it is a TIBET
     *     'namespace' object.
     * @returns {Boolean} Whether or not the supplied object is a TIBET
     *     'namespace' object.
     */

    if (!namespaceObj) {
        return false;
    }

    return (typeof namespaceObj.$$isNamespace !== 'undefined');
};

//  Manual setup
TP.isNamespace[TP.NAME] = 'isNamespace';
TP.isNamespace[TP.OWNER] = TP;
TP.isNamespace[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.isNamespace[TP.DISPLAY] = 'TP.isNamespace';
TP.isNamespace[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];

//  ------------------------------------------------------------------------
//  GLOBAL SYMBOL DEFINITION
//  ------------------------------------------------------------------------

/*
We track true globals to support reflection and to support symbol export
to multiple windows/frames. Our interactive tools also leverage this subset
of metadata about TIBET. Globals are registered using TP.sys.defineGlobal().
*/

//  ------------------------------------------------------------------------

TP.sys.$globals = TP.sys.$globals || [];

//  ------------------------------------------------------------------------

TP.sys.getGlobals = function(params, windowContext) {

    /**
     * @name getGlobals
     * @synopsis Returns an array containing the names of registered globals in
     *     the system. A global is registered using the defineGlobal call of the
     *     TP.sys object. NOTE that this list isn't guaranteed to be uniqued. If
     *     that is required you'll want to invoke the unique method on the list
     *     before using it. Also note that the parameters are only used once the
     *     full kernel has loaded and TP.sys.$getContextGlobals is available.
     * @param {TP.lang.Hash} params A hash of various parameters that affect how
     *     the list is filtered. For details see TP.sys.$getContextGlobals.
     * @param {Window} windowContext The window/frame whose globals should be
     *     returned. Default is the current window.
     * @returns {Array} An array of all registered globals.
     * @todo
     */

    if (typeof TP.sys.$getContextGlobals === 'function') {
        return TP.sys.$getContextGlobals(windowContext);
    } else {
        //  NOTE the forward-dependency here
        return TP.isArray(TP.sys.$globals) ? TP.sys.$globals :
                                        TP.keys(TP.sys.$globals);
    }
};

//  Manual setup
TP.sys.getGlobals[TP.NAME] = 'getGlobals';
TP.sys.getGlobals[TP.OWNER] = TP.sys;
TP.sys.getGlobals[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.sys.getGlobals[TP.DISPLAY] = 'TP.getGlobals';
TP.sys.getGlobals[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];

//  ------------------------------------------------------------------------

/**
 * Processes inbound release data. This is provided by the TIBETVersion.js file.
 * A similarly named function is used as a callback name for the checkVersion
 * call. This particular function is mapped to that name in TIBETVersion.js.
 * @param {Object} data The release data structure.
 */
TP.sys.release = function(data) {
    // Only set this once.
    if (!TP.sys.$version) {
        TP.sys.$version = data;
    }
};

TP.sys.release[TP.NAME] = 'release';
TP.sys.release[TP.OWNER] = TP.sys;
TP.sys.release[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.sys.release[TP.DISPLAY] = 'TP.release';
TP.sys.release[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];

//  ------------------------------------------------------------------------
//  JAVASCRIPT LANGUAGE GLOBALS / KEYWORDS ETC.
//  ------------------------------------------------------------------------

TP.sys.$keywords =
            [
                'break', 'case', 'catch', 'continue', 'default',
                'delete', 'do', 'else', 'false', 'finally', 'for',
                'function', 'if', 'in', 'instanceof', 'new', 'null',
                'return', 'switch', 'this', 'throw', 'true', 'try',
                'typeof', 'var', 'void', 'while', 'with'
            ];

TP.sys.$reservedwords =
            [
                'abstract', 'boolean', 'byte', 'char', 'class',
                'const', 'debugger', 'double', 'enum', 'export',
                'extends', 'final', 'float', 'goto', 'implements',
                'import', 'int', 'interface', 'long', 'native',
                'package', 'private', 'protected', 'public',
                'short', 'static', 'super', 'synchronized',
                'throws', 'transient', 'volatile'
            ];

//  The complete list of global slots found at a low-level, with no filtering,
//  by the system. This is configured by the boot system and finalized once the
//  kernel has fully booted.

//  TP.sys.$nativeglobals

//  properties that throw security exceptions (at least on FF)
TP.sys.$globalexcludes = [];

//  function/method names that shouldn't have DNUs built for them
TP.sys.$noDNUs = ['toJSON'];

//  the defined ECMA Edition 5 globals. Note that this does not include:
//  Object, Function, Array, String, Boolean, Number, Date, RegExp
//  Error, EvalError, RangeError, ReferenceError, SyntaxError, TypeError,
//  URIError
//  Math, JSON
TP.sys.$ecmaglobals =
            [
                'decodeURI',
                'decodeURIComponent',
                'encodeURI',
                'encodeURIComponent',
                'escape',               //  Non-normative
                'eval',
                'NaN',
                'Infinity',
                'parseInt',
                'parseFloat',
                'isNaN',
                'isFinite',
                'unescape'              //  Non-normative
            ];

//  additional 'non Window' globals
TP.sys.$systemglobals =
            [
                'applicationCache',
                'clearInterval',
                'clearTimeout',
                'console',
                'localStorage',
                'performance',
                'postMessage',
                'setTimeout',
                'setInterval'
            ];

//  these are slots based on DOM Level 0 - which is implemented by most user
//  agents
TP.sys.$windowglobals =
            [
                'alert',
                'addEventListener',
                'back',
                'blur',
                'close',
                'closed',
                'confirm',
                'content',
                'document',
                'find',
                'focus',
                'forward',
                'frameElement',
                'frames',
                'fullScreen',
                'getComputedStyle',
                'getDefaultComputedStyle',
                'getSelection',
                'history',
                'home',
                'innerHeight',
                'innerWidth',
                'length',
                'location',
                'matchMedia',
                'moveBy',
                'moveTo',
                'name',
                'navigator',
                'onabort',
                'onbeforeunload',
                'onblur',
                'onchange',
                'onclick',
                'oncontextmenu',
                'ondevicelight',
                'ondevicemotion',
                'ondeviceorientation',
                'ondeviceproximity',
                'onerror',
                'onfocus',
                'onhashchange',
                'onkeydown',
                'onkeypress',
                'onkeyup',
                'onload',
                'onmousedown',
                'onmouseenter',
                'onmouseleave',
                'onmousemove',
                'onmouseout',
                'onmouseover',
                'onmouseup',
                'onpopstate',
                'onreset',
                'onresize',
                'onscroll',
                'onselect',
                'onsubmit',
                'onunload',
                'onuserproximity',
                'open',
                'openDialog',
                'opener',
                'outerHeight',
                'outerWidth',
                'pageXOffset',
                'pageYOffset',
                'parent',
                'print',
                'prompt',
                'removeEventListener',
                'resizeBy',
                'resizeTo',
                'screen',
                'scroll',
                'scrollBy',
                'scrollTo',
                'scrollX',
                'scrollY',
                'self',
                'sessionStorage',
                'showModalDialog',
                'sizeToContent',
                'status',
                'stop',
                'top',
                'window'
            ];

//  Any remaining globally-accessible slots will be placed by the finalization
//  code into a structure under TP.sys.$extraglobals. Slots that you might see
//  in that structure include the following (taken from Firefox 27):

/*
'InstallTrigger', 'atob', 'btoa', 'cancelAnimationFrame', 'captureEvents',
'controllers', 'crypto', 'dialogArguments', 'dispatchEvent', 'dump', 'external',
'getInterface', 'indexedDB', 'menubar', 'mozAnimationStartTime',
'mozCancelAnimationFrame', 'mozCancelRequestAnimationFrame', 'mozIndexedDB',
'mozInnerScreenX', 'mozInnerScreenY', 'mozPaintCount',
'mozRequestAnimationFrame', 'onafterprint', 'onafterscriptexecute',
'onbeforeprint', 'onbeforescriptexecute', 'oncanplay', 'oncanplaythrough',
'onclose', 'oncopy', 'oncut', 'ondblclick', 'ondrag', 'ondragdrop', 'ondragend',
'ondragenter', 'ondragleave', 'ondragleave', 'ondragover', 'ondragstart',
'ondrop', 'ondurationchange', 'onemptied', 'onended', 'oninput', 'oninvalid',
'onloadeddata', 'onloadedmetadata', 'onloadstart', 'onmessage', 'onmove',
'onmozbeforepaint', 'onoffline', 'ononline', 'onpagehide', 'onpageshow',
'onpaste', 'onpause', 'onplay', 'onplaying', 'onprogress', 'onratechange',
'onrests', 'onseeked', 'onseeking', 'onshow', 'onstalled', 'onsuspend',
'ontimeupdate', 'onvolumechange', 'onwaiting', 'onwheel', 'personalbar',
'pkcs11', 'releaseEvents', 'requestAnimationFrame', 'returnValue', 'screenX',
'screenY', 'scrollByLines', 'scrollByPages', 'scrollMaxX', 'scrollMaxY',
'scrollbars', 'setResizable', 'sidebar', 'speechSynthesis', 'statusbar',
'toolbar', 'updateCommands'
*/

//  ------------------------------------------------------------------------
//  GLOBAL VARIABLES
//  ------------------------------------------------------------------------

//  context support variables
TP.sys.defineGlobal('$error', null);            //  current/last
                                                //  TP.sig.Exception
TP.sys.defineGlobal('$error_stack', null);      //  stack of TP.ec() instances

TP.sys.defineGlobal('$focus', null);            //  current focus element
TP.sys.defineGlobal('$focus_stack', null);      //  stack of focused elements

TP.sys.defineGlobal('$halo', null);             //  current halo focused element
TP.sys.defineGlobal('$halo_stack', null);       //  stack of halo'd elements

TP.sys.defineGlobal('$selection', null);        //  current selection
TP.sys.defineGlobal('$selection_stack', null);  //  selection set stack

TP.sys.defineGlobal('$signal', null);           //  current Signal instance
TP.sys.defineGlobal('$signal_stack', null);     //  stack of signal instances

//  process support variables
TP.sys.defineGlobal('$handled', true);         //  was last exception handled?
TP.sys.defineGlobal('$STATUS', 0);             //  last status code (0 is
                                               //  success in some form)

//  Add the common namespaces as tracked globals
TP.sys.defineGlobal('TP', TP);
TP.sys.defineGlobal('APP', APP);

//  ------------------------------------------------------------------------
//  COUNTERS/TIMERS
//  ------------------------------------------------------------------------

//  any content file cache older than this time will not be considered
//  "current" regardless of how it appears relative to its source file. This
//  allows us to deal (in a rough way) with dependencies due to XSLT
//  chaining and other relationships that might affect the final output
//  without actually altering the original source
TP.sys.$$contentExpiration = 0;

//  construct counter for window instances, used for unique naming
TP.sys.$$windowCount = 0;

//  ------------------------------------------------------------------------
//  DOM CONSTANTS
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  requestAnimationFrame CONSTANTS
//  ------------------------------------------------------------------------

/* eslint-disable no-multi-spaces */

//  Define our own versions of these functions on Window, since they could be
//  platform dependent and putting them on other objects seems to not work.
window.requestAnimFrame =
        window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.msRequestAnimationFrame;

window.cancelAnimFrame =
        window.cancelAnimationFrame       ||
        window.webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame    ||
        window.msCancelAnimationFrame;

/* eslint-enable no-multi-spaces */

//  ------------------------------------------------------------------------
//  "TP" CONSTANTS
//  ------------------------------------------------------------------------

/*
Constants on the TP object, which helps keep them out of the global
namespace of the window.
*/

//  ----
//  metadata/object system
//  ----

//  null object's oid, prefixed with $ so it's a legal JS identifier.
TP.NULL_OID = '$0000000000000000';
TP.OID_PREFIX = '$';

//  name of anonymous function
TP.ANONYMOUS_FUNCTION_NAME = 'anonymous_function';

//  iteration return values
TP.BREAK = Number.NEGATIVE_INFINITY;
TP.CONTINUE = Number.POSITIVE_INFINITY;
TP.DESCEND = 1;
TP.REPEAT = 2;

//  metadata system constants
TP.META = '$$meta';
TP.TYPE = '$$type';
TP.SUPER = '$$supertype';
TP.SNAME = '$$supername';
TP.TNAME = '$$typename';
TP.RNAME = '$$realname';

//  type/inst constructor suffixes
TP.TYPEC = '$$Type';
TP.INSTC = '$$Inst';

TP.LOAD_NODE = '$loadNode';
TP.LOAD_PATH = '$loadPath';
TP.SOURCE_PATH = '$srcPath';

TP.BUILTIN_LOAD_NODE = TP.boot.$documentFromString(
    '<script></script>').childNodes[0];

TP.LOAD_PACKAGE = 'load_package';
TP.LOAD_CONFIG = 'load_config';

//  js object relationships
TP.ANCESTOR_NAMES = '$$anames';
TP.ANCESTORS = '$$ancestors';
TP.TRAITS = '$$traits';
TP.INSTANCES = '$$instances';
TP.SUBTYPE_NAMES = '$$snames';
TP.SUBTYPE_NAMES_DEEP = '$$snames_deep';
TP.SUBTYPES = '$$subtypes';
TP.SUBTYPES_DEEP = '$$subtypes_deep';

//  js object
TP.SUBTYPE = 'Subtype';
TP.METHOD = 'Method';
TP.PRIMITIVE = 'Primitive';
TP.ATTRIBUTE = 'Attribute';
TP.CONSTANT = 'Constant';
TP.INSTANCE = 'Instance';
TP.PROTOTYPE = 'Prototype';

//  A list of methods that needs 'callee' access.
TP.NEEDS_CALLEE = /\.(callNextMethod)(\(|\.apply|\.call)/;

//  DOM relationships
TP.ANCESTOR = 'ans';
TP.ANCESTOR_OR_SELF = 'ansorself';

//  NB: Avoid conflict with 'TP.ATTRIBUTE' above.
TP.ATTR = 'attr';

TP.CHILD = 'chld';
TP.DESCENDANT = 'desc';
TP.DESCENDANT_OR_SELF = 'descorself';
TP.FOLLOWING = 'foll';
TP.FOLLOWING_SIBLING = 'follsib';
TP.NAMESPACE = 'ns';
TP.PARENT = 'par';
TP.PRECEDING = 'prec';
TP.PRECEDING_SIBLING = 'precsib';
TP.SELF = 'self';

//  property scopes
TP.INTRODUCED = 'introduced';
TP.INHERITED = 'inherited';
TP.OVERRIDDEN = 'overridden';
TP.LOCAL = 'local';
TP.GLOBAL = 'global';
TP.DNU = 'dnu';
TP.NONE = 'none';
TP.UNIQUE = 'unique';

TP.INTERNAL = 'internal';
TP.HIDDEN = 'hidden';

//  for traits
TP.BEFORE = 'before';
TP.AFTER = 'after';
TP.REQUIRED = function() {return;};

//  for native nodes
TP.EVENT_IDS = 'eventIds';
TP.GLOBAL_ID = 'globalID';
TP.SHOULD_SIGNAL_CHANGE = 'shouldSignalChange';
TP.SHOULD_SUSPEND_SIGNALING = 'shouldSuspendSignaling';
TP.WRAPPER = 'wrapper';

//  meta owners and their target objects

TP.META_TYPE_OWNER = {};
TP.META_TYPE_OWNER[TP.ID] = 'MetaType';
TP.META_TYPE_OWNER[TP.NAME] = 'MetaType';
TP.META_TYPE_OWNER.getID = function () {return 'MetaType';};
TP.META_TYPE_OWNER.getName = function () {return 'MetaType';};

TP.META_TYPE_OWNER.meta_methods = {};

TP.META_TYPE_TARGETS =
            [
                Array,
                Boolean,
                Date,
                Function,
                Number,
                Object,
                RegExp,
                String
            ];

TP.META_INST_OWNER = {};
TP.META_INST_OWNER[TP.ID] = 'MetaInst';
TP.META_INST_OWNER[TP.NAME] = 'MetaInst';
TP.META_INST_OWNER.getID = function () {return 'MetaInst';};
TP.META_INST_OWNER.getName = function () {return 'MetaInst';};

TP.META_INST_OWNER.meta_methods = {};
TP.META_INST_OWNER.common_methods = {};

//  NB: We leave TP.ObjectProto out of this list on purpose.
TP.META_INST_TARGETS =
            [
                TP.ArrayProto,
                TP.BooleanProto,
                TP.DateProto,
                TP.FunctionProto,
                TP.NumberProto,
                TP.RegExpProto,
                TP.StringProto
            ];

//  attribute name prefixes
TP.PUBLIC = '';
TP.PRIVATE = '$';
TP.PROTECTED = '_';
TP.INTERNAL = '$$';

//  input/output/error values, NOTE that we use TP.STDIN as an attribute
//  name so it should be viable for that purpose.
TP.STDIN = 'tsh_stdin';
TP.STDOUT = 'tsh_stdout';
TP.STDERR = 'tsh_stderr';
TP.STDIO = 'tsh_stdio';

//  ----
//  coding constants
//  ----

//  object testing
TP.EQUALITY = '==';                         //  test control variable
TP.IDENTITY = '===';                        //  test control variable

//  Iteration and state transition phases/controls.
TP.ENTER = Number.POSITIVE_INFINITY;
TP.EXIT = Number.NEGATIVE_INFINITY;
TP.TRANSITION = 0;
TP.INPUT = 1;


//  result and/or indexing errors
TP.BAD_INDEX = -1;                          //  bad array/hash index
TP.NOT_FOUND = -1;                          //  missing data
TP.NO_SIZE = -1;                            //  bad object size
TP.NO_RESULT = Number.NEGATIVE_INFINITY;    //  invalid response

//  deleted items flag
TP.DELETED = '$$DELETED$$';

//  string keys for null/undefined
TP.NULL = '$$NULL$$';
TP.UNDEF = '$$UNDEFINED$$';

//  string used to join segments of things together
TP.JOIN = '__JOIN__';

//  positional identifiers
TP.CURRENT = 'CURRENT';

TP.FIRST = 'FIRST';
TP.LAST = 'LAST';

TP.NEXT = 'NEXT';
TP.PREVIOUS = 'PREVIOUS';

TP.SEEK = 'SEEK';

TP.PRECEDING = 'PRECEDING';
TP.FOLLOWING = 'FOLLOWING';

TP.FIRST_IN_GROUP = 'FIRST_IN_GROUP';
TP.LAST_IN_GROUP = 'LAST_IN_GROUP';

TP.FIRST_IN_NEXT_GROUP = 'FIRST_IN_NEXT_GROUP';
TP.FIRST_IN_PREVIOUS_GROUP = 'FIRST_IN_PREVIOUS_GROUP';

TP.AFTER_END = 'AfterEnd';
TP.BEFORE_BEGIN = 'BeforeBegin';
TP.AFTER_BEGIN = 'AfterBegin';
TP.BEFORE_END = 'BeforeEnd';

//  directions
TP.FORWARD = 'FWD';                     //  FORWARD direction
TP.BACKWARD = 'BWD';                    //  BACKWARD direction
TP.UP = 'UP';                           //  UP direction
TP.DOWN = 'DOWN';                       //  DOWN direction

//  keys
TP.KEYDOWN = 253;
TP.KEYPRESS = 254;
TP.KEYUP = 255;

//  orientations
TP.VERTICAL = 'VERT';                   //  VERTICAL orientation
TP.HORIZONTAL = 'HORIZ';                //  HORIZONTAL orientation

//  the four edges
TP.TOP = 'TOP';                         //  TOP side
TP.RIGHT = 'RIGHT';                     //  RIGHT side (of decimal or UI :))
TP.BOTTOM = 'BOTTOM';                   //  BOTTOM side
TP.LEFT = 'LEFT';                       //  LEFT side (of decimal or UI :))

//  the eight handles
TP.TOP_LEFT = 'TOP_LEFT';               //  TOP-LEFT side
TP.TOP_CENTER = 'TOP_CENTER';           //  TOP-CENTER side
TP.TOP_RIGHT = 'TOP_RIGHT';             //  TOP-RIGHT side

TP.MIDDLE_LEFT = 'MIDDLE_LEFT';         //  LEFT-MIDDLE side
TP.MIDDLE_RIGHT = 'MIDDLE_RIGHT';       //  RIGHT-MIDDLE side

TP.BOTTOM_LEFT = 'BOTTOM_LEFT';         //  BOTTOM-LEFT side
TP.BOTTOM_CENTER = 'BOTTOM_CENTER';     //  BOTTOM-CENTER side
TP.BOTTOM_RIGHT = 'BOTTOM_RIGHT';       //  BOTTOM-RIGHT side

//  the middle/center depending on your preference :)
TP.MIDDLE = 'MIDDLE';                   //  MIDDLE
TP.CENTER = 'CENTER';                   //  CENTER

//  compass coordinate values
//  See: http://en.wikipedia.org/wiki/Boxing_the_compass#Compass_points
TP.NORTH = 1;
TP.NORTH_BY_EAST = 2;
TP.NORTH_NORTHEAST = 3;
TP.NORTHEAST_BY_NORTH = 4;
TP.NORTHEAST = 5;
TP.NORTHEAST_BY_EAST = 6;
TP.EAST_NORTHEAST = 7;
TP.EAST_BY_NORTH = 8;
TP.EAST = 9;
TP.EAST_BY_SOUTH = 10;
TP.EAST_SOUTHEAST = 11;
TP.SOUTHEAST_BY_EAST = 12;
TP.SOUTHEAST = 13;
TP.SOUTHEAST_BY_SOUTH = 14;
TP.SOUTH_SOUTHEAST = 15;
TP.SOUTH_BY_EAST = 16;
TP.SOUTH = 17;
TP.SOUTH_BY_WEST = 18;
TP.SOUTH_SOUTHWEST = 19;
TP.SOUTHWEST_BY_SOUTH = 20;
TP.SOUTHWEST = 21;
TP.SOUTHWEST_BY_WEST = 22;
TP.WEST_SOUTHWEST = 23;
TP.WEST_BY_SOUTH = 24;
TP.WEST = 25;
TP.WEST_BY_NORTH = 26;
TP.WEST_NORTHWEST = 27;
TP.NORTHWEST_BY_WEST = 28;
TP.NORTHWEST = 29;
TP.NORTHWEST_BY_NORTH = 30;
TP.NORTH_NORTHWEST = 31;
TP.NORTH_BY_WEST = 32;

//  selection types
TP.SELECTION_NONE = 0;
TP.SELECTION_TEXT = 1;
TP.SELECTION_ELEMENT = 2;

//  selection endpoints (the values here are used in their lowercase form -
//  don't change)
TP.ANCHOR = 'anchor';
TP.HEAD = 'head';

//  formatting
TP.DEFAULT_STRPAD = ' ';                //  char to left pad strings
TP.DEFAULT_NUMPAD = '0';                //  char to left pad numbers
TP.DEFAULT_STRLEN = 50;                 //  default size for truncate()
TP.DEFAULT_INSTANCE = 'DEFAULT_INSTANCE';   //  default instance ID flag
TP.DEFAULT = '__DEFAULT__';             //  default key used when defining
                                        //  primitives

//  document visibility types
TP.VISIBLE = 'visible';
TP.HIDDEN = 'hidden';
TP.PRERENDER = 'prerender';

TP.NO_SOURCE_REP = '<<No Source Rep>>'; //  No source representation

//  CSS transformation types
TP.ROTATE = 'ROTATE';         //  Rotation transformation
TP.SKEW = 'SKEW';             //  Skew transformation
TP.SCALE = 'SCALE';           //  Scale transformation
TP.TRANSLATE = 'TRANSLATE';   //  Translate transformation

//  ---
//  workflow support
//  ---

//  processing models
TP.ASYNC = 'ASYNC';                     //  ASYNCHRONOUS processing
TP.SYNC = 'SYNC';                       //  SYNCHRONOUS processing

TP.PARALLEL = 'PAR';                    //  PARALLEL processing
TP.SEQUENTIAL = 'SEQ';                  //  SEQUENTIAL processing

//  workflow process status codes, roughly based on BPML states. positive
//  codes greater than 1 are variations of 'done', while negative numbers
//  imply activity is ongoing. 0 represents 'ready' (not done or active).

//  NOTE that absolute values for the "pending" states match their
//  corresponding "done" states...in other words FAILING/FAILED are -3 and 3
//  respectively and so on. THIS IS RELIED UPON IN STATE CHECKS!

TP.READY = 0;
TP.ACTIVE = -1;

TP.PAUSING = -2;
TP.ERRORING = -3;
TP.FAILING = -4;
TP.CANCELLING = -5;                     //  not in BPML spec, reserved here
TP.SUCCEEDING = -6;
TP.COMPLETING = -7;

TP.PAUSED = 2;                          //  not in BPML spec, reserved here
TP.ERRORED = 3;                         //  not in BPML spec, reserved here
TP.FAILED = 4;
TP.CANCELLED = 5;
TP.SUCCEEDED = 6;                       //  not in BPML spec, reserved here
TP.COMPLETED = 7;                       //  DO NOT USE...USE TP.SUCCEEDED.

TP.SKIPPED = 8;                         //  not in BPML spec, reserved here
TP.TIMED_OUT = 9;                       //  not in BPML spec, reserved here
TP.IGNORED = 10;                        //  not in BPML spec, reserved here

//  join conditions. NOTE these should be kept as string values to avoid
//  changes to the shell pipe connection logic.
TP.AND = 'and';
TP.OR = 'or';

// Commonly used log names.
TP.LOG = 'TP';
TP.APP_LOG = 'APP';
TP.CHANGE_LOG = 'change';
TP.CSS_LOG = 'css';
TP.INFERENCE_LOG = 'inference';
TP.IO_LOG = 'io';
TP.JOB_LOG = 'job';
TP.KEY_LOG = 'key';
TP.LINK_LOG = 'link';
TP.PATCH_LOG = 'patch';
TP.QUERY_LOG = 'query';
TP.SECURITY_LOG = 'security';
TP.SIGNAL_LOG = 'signal';
TP.TEST_LOG = 'test';
TP.TRANSFORM_LOG = 'transform';

//  ---
//  signaling
//  ---

//  signal firing models
TP.ANY = 'ANY';
TP.DEFAULT_FIRING = 'DEFAULT_FIRING';
TP.DOM_FIRING = 'DOM_FIRING';
TP.RESPONDER_FIRING = 'RESPONDER_FIRING';
TP.EXCEPTION_FIRING = 'EXCEPTION_FIRING';
TP.FIRE_ONE = 'FIRE_ONE';
TP.INHERITANCE_FIRING = 'INHERITANCE_FIRING';

//  DOM signaling phases
TP.AT_TARGET = 'AT_TARGET';
TP.CAPTURING_PHASE = 'CAPTURING_PHASE';
TP.BUBBLING_PHASE = 'BUBBLING_PHASE';

//  ---
//  requests
//  ---

TP.ONLOAD = 'onload';
TP.ONFAIL = 'onfail';

//  ---
//  shell
//  ---

//  pipe symbol actions
TP.ADD = 'add';
TP.GET = 'get';
TP.SET = 'set';
TP.FILTER = 'filter';
TP.TRANSFORM = 'transform';

//  Pipe types (always from the perspective of the downstream segment).
TP.TSH_ADD_PIPES = ['.>>', '.>>!', '.&>>', '.&>>!', '.>>&', '.>>&!'];
TP.TSH_GET_PIPES = ['.<', '.<!', '.<<'];
TP.TSH_SET_PIPES = ['.>', '.>!', '.&>', '.&>!', '.>&', '.>&!'];
TP.TSH_FILTER_PIPES = ['.|?', '.|?*', '.&?', '.&?*', '.|&?', '.|&?*'];
TP.TSH_TRANSFORM_PIPES = ['.|', '.|*', '.&', '.&*', '.|&', '.|&*'];

//  change notification keys

//  operations
TP.CREATE = 'create';
TP.DELETE = 'delete';
TP.INSERT = 'insert';
TP.UPDATE = 'update';
TP.SORTED = 'sorted';

//  information
TP.OLDVAL = 'oldval';
TP.NEWVAL = 'newval';

//  facet names
TP.READONLY = 'readonly';
TP.RELEVANT = 'relevant';
TP.REQUIRED = 'required';
TP.VALID = 'valid';

TP.FACET_NAMES = [TP.READONLY, TP.RELEVANT, TP.REQUIRED, TP.VALID];

//  ---
//  IO/URI support
//  ---

//  url load return types: xml, text, native, "wrapper", or "best possible"
TP.DOM = 1;
TP.TEXT = 2;
TP.NATIVE = 3;
TP.WRAP = 4;
TP.BEST = 5;

//  IO Directions
TP.SEND = 'SEND';
TP.RECV = 'RECV';

//  ---
//  file io
//  ---

//  directory listing globals
TP.FILES = 'files';
TP.SUBDIRS = 'subdirs';

//  file activity globals
TP.APPEND = 'a';
TP.WRITE = 'w';
TP.READ = 'r';

//  IE file activity flags
TP.IE_READ = 1;
TP.IE_WRITE = 2;
TP.IE_APPEND = 8;

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

//  ---
//  http/webdav IO
//  ---

//  HTTP call types
TP.HTTP_DELETE = 'DELETE';
TP.HTTP_GET = 'GET';
TP.HTTP_HEAD = 'HEAD';
TP.HTTP_OPTIONS = 'OPTIONS';
TP.HTTP_POST = 'POST';
TP.HTTP_PUT = 'PUT';
TP.HTTP_TRACE = 'TRACE';

//  HTTP authentication types
TP.HTTP_BASIC = 'BASIC';
TP.HTTP_DIGEST = 'DIGEST';

//  WebDAV call types
TP.WEBDAV_CHECKIN = 'CHECKIN';
TP.WEBDAV_CHECKOUT = 'CHECKOUT';
TP.WEBDAV_COPY = 'COPY';
TP.WEBDAV_LOCK = 'LOCK';
TP.WEBDAV_MKCOL = 'MKCOL';
TP.WEBDAV_MOVE = 'MOVE';
TP.WEBDAV_PROPFIND = 'PROPFIND';
TP.WEBDAV_PROPPATCH = 'PROPPATCH';
TP.WEBDAV_REPORT = 'REPORT';
TP.WEBDAV_UNLOCK = 'UNLOCK';
TP.WEBDAV_VERSIONCONTROL = 'VERSIONCONTROL';

//  WebDAV locktype
TP.WEBDAV_LOCKTYPE_WRITE = 'write';

//  WebDAV lockscope
TP.WEBDAV_LOCKSCOPE_EXCLUSIVE = 'exclusive';
TP.WEBDAV_LOCKSCOPE_SHARED = 'shared';

//  WebDAV default locktimeout
TP.WEBDAV_LOCKTIMEOUT_DEFAULT = 'Second-86400';
TP.WEBDAV_LOCKTIMEOUT_INFINITE = 'Infinite';

TP.UTF8 = 'UTF-8';
TP.ISO8859 = 'ISO-8859-1';

//  MIME Type encodings
TP.URL_ENCODED = 'application/x-www-form-urlencoded';
TP.XML_ENCODED = 'application/xml';
TP.JSON_ENCODED = 'application/json';
TP.XHTML_ENCODED = 'application/xhtml+xml';
TP.XSLT_ENCODED = 'application/xslt+xml';
TP.ATOM_ENCODED = 'application/atom+xml';
TP.XMLRPC_ENCODED = 'application/xml+rpc';
TP.SOAP_ENCODED = 'application/soap+xml';

TP.OCTET_ENCODED = 'application/octet-stream';

TP.FIELD_ENCODED = 'application/vnd.tpi.hidden-fields';

TP.MP_FORMDATA_ENCODED = 'multipart/form-data';
TP.MP_RELATED_ENCODED = 'multipart/related';

TP.PLAIN_TEXT_ENCODED = 'text/plain';
TP.CSS_TEXT_ENCODED = 'text/css';

TP.HTML_TEXT_ENCODED = 'text/html';
TP.XML_TEXT_ENCODED = 'text/xml';
TP.JSON_TEXT_ENCODED = 'text/json';

TP.JS_TEXT_ENCODED = 'text/javascript';

//  ---
//  html support
//  ---

TP.HTML_401_TAGS = {
    'a': true, 'abbr': true, 'acronym': true, 'address': true,
    'applet': true, 'area': true, 'b': true, 'base': true,
    'basefont': true, 'bdo': true, 'big': true, 'blockquote': true,
    'body': true, 'br': true, 'button': true, 'caption': true,
    'center': true, 'cite': true, 'code': true, 'col': true,
    'colgroup': true, 'dd': true, 'del': true, 'dfn': true,
    'dir': true, 'div': true, 'dl': true, 'dt': true,
    'em': true, 'embed': true, 'fieldset': true, 'font': true,
    'form': true, 'frame': true, 'frameset': true, 'h1': true,
    'h2': true, 'h3': true, 'h4': true, 'h5': true,
    'h6': true, 'head': true, 'hr': true, 'html': true,
    'i': true, 'iframe': true, 'img': true, 'input': true,
    'isindex': true, 'kbd': true, 'label': true, 'legend': true,
    'li': true, 'link': true, 'map': true, 'menu': true,
    'meta': true, 'noframes': true, 'noscript': true, 'object': true,
    'ol': true, 'optgroup': true, 'option': true, 'p': true,
    'param': true, 'pre': true, 'q': true, 's': true,
    'samp': true, 'script': true, 'select': true, 'small': true,
    'span': true, 'strike': true, 'strong': true, 'style': true,
    'sub': true, 'sup': true, 'table': true, 'tbody': true,
    'td': true, 'textarea': true, 'tfoot': true, 'th': true,
    'thead': true, 'title': true, 'tr': true, 'tt': true,
    'u': true, 'ul': true, 'val': true
};

//  ---
//  css support
//  ---

//  'box model' types for elements in the DOM
TP.CONTENT_BOX = 1;
TP.PADDING_BOX = 2;
TP.BORDER_BOX = 3;
TP.MARGIN_BOX = 4;

//  busy icon height
TP.BUSY_HEIGHT = 28;

//  a tmp for font heights of standardized font sizes in pixels for:
//      1em, 1ex, 100%, 12pt, 16px, xx-small, x-small, small, medium, large,
//      x-large, xx-large
TP.FONT_HEIGHTS = null;

//  tmp for the scroller width of the browser we're currently executing in
TP.SCROLLER_WIDTH = null;

//  z-index 'tiers' for various system services
TP.CURTAIN_TIER = 50;
TP.ALERT_TIER = 100;
TP.SLIDER_TIER = 500;
TP.MENU_TIER = 1000;
TP.POPUP_TIER = 5000;
TP.HALO_TIER = 10000;
TP.HUD_TIER = 15000;
TP.CONSOLE_TIER = 20000;
TP.CONNECTOR_TIER = 25000;
TP.DRAG_DROP_TIER = 30000;

//  ---
//  dom support
//  ---

//  XPath selection options
TP.NODESET = 0x01;
TP.FIRST_NODE = 0x02;

//  DOM positioning masks
TP.SAME_NODE = 0;
TP.PRECEDING_NODE = 2;
TP.FOLLOWING_NODE = 4;
TP.CONTAINS_NODE = 8;
TP.CONTAINED_BY_NODE = 16;

//  DOM attributes that never get prefixed
TP.NEVER_PREFIXED_ATTRS = ['id'];

//  ---
//  encryption/security
//  ---

//  ACL support constants
TP.ACL_REAL = 'acl:real';
TP.ACL_EFFECTIVE = 'acl:effective';

//  HASH encoding and format models
TP.HASH_MD5 = 0;
TP.HASH_SHA1 = 1;

TP.HASH_HEX = 2;
TP.HASH_B64 = 3;
TP.HASH_LATIN1 = 4;

//  Use a key size of 16 bytes
TP.PBKDF2_KEYSIZE = 128 / 8;

//  iOS 3.0 uses 2000, so that's good enough for us
TP.PBKDF2_ITERATION_COUNT = 2000;

//  Credentials DB name
TP.CREDENTIALS_DB_NAME = 'TIBET_USER_CREDENTIALS';

//  ---
//  Simple storage support
//  ---

//  Local storage DB name
TP.LOCALSTORAGE_DB_NAME = 'TIBET_LOCAL_DB';

//  ---
//  XML support
//  ---

//  XML Base aware prefix marker and search regex
TP.BASE_AWARE_PREFIX = 'BASE_AWARE_PREFIX';

//  XML extensions. content that's not well-formed with one of these
//  extensions will trigger a well-formed warning during load/processing
TP.XML_EXTENSIONS = ['xml', 'xhtml', 'tsh', 'xsl', 'xsd'];

//  XML attributes
TP.GLOBAL_DOCID_ATTR = 'tibet:globalDocID';

//  XML Headers
TP.XML_10_HEADER = '<?xml version="1.0"?>';
TP.XML_10_UTF8_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
TP.XML_10_STANDALONE_HEADER = '<?xml version="1.0" standalone="yes"?>';

//  ------------------------------------------------------------------------
//  MSXML LISTS
//  ------------------------------------------------------------------------

//  MSXML versions 4 and 5 are not recommended by Microsoft so they're not
//  included below.

TP.IE_XMLHTTP_VERSIONS = ['Msxml2.XMLHTTP.6.0',
                            'Msxml2.XMLHTTP.3.0',
                            'Msxml2.XMLHTTP',
                            'Microsoft.XMLHTTP'];

TP.IE_DOM_DOCUMENT_VERSIONS = ['Msxml2.DOMDocument.6.0',
                                'Msxml2.DOMDocument.3.0',
                                'Msxml2.DOMDocument'];

TP.IE_THREADED_DOM_VERSIONS = ['Msxml2.FreeThreadedDOMDocument.6.0',
                                'Msxml2.FreeThreadedDOMDocument.3.0',
                                'Msxml2.FreeThreadedDOMDocument'];

TP.IE_XSL_TEMPLATE_VERSIONS = ['Msxml2.XSLTemplate.6.0',
                                'Msxml2.XSLTemplate.3.0',
                                'Msxml2.XSLTemplate'];

//  ------------------------------------------------------------------------
//  PRIVILEGED CAPABILITY CONSTANTS
//  ------------------------------------------------------------------------

//  These follow the Mozilla capabilities system because it has a more
//  fine-grained security mechanism

//  Show an 'about:' URL that is not 'about:blank'.
TP.SHOW_ABOUT = 'SHOW_ABOUT';

//  Use the 'history' object to find out more about where the user has gone
//  or how many times they've been there.
TP.READ_HISTORY = 'READ_HISTORY';

//  Read and write preferences on the 'navigator' object.
TP.READ_PREFERENCE = 'READ_PREFERENCE';
TP.WRITE_PREFERENCE = 'WRITE_PREFERENCE';

//  Manipulate a window in the following ways:
//      - Adding or removing directory bar, location bar, menu bar, personal
//      bar, scroll bar or toolbar
//      - enableExternalCapture() to allow event capture in pages from other
//      servers.
//      - Closing a browser window unconditionally
//      - Using moveTo / moveBy to move the window off screen
//      - open (when creating a window smaller than 100X100, placing it
//      offscreen via screenX/screenY parameters, creating a window without
//      a title bar or using alwaysRaised, alwaysLowered, or z-lock
//      - Using resizeTo / resizeBy to resize the window to smaller than
//      100X100.
//      - Using innerWidth / innerHeight to resize the window to smaller
//      than 100X100.
TP.MANIPULATE_WINDOW = 'MANIPULATE_WINDOW';

//  Used to read the *execution stack* - the Function stack can be read
//  without this permission
TP.READ_EXECUTION_STACK = 'READ_EXECUTION_STACK';

//  Use XMLHttpRequest() to read data across domains.
TP.ACCESS_XDOMAIN_XMLHTTP = 'ACCESS_XDOMAIN_XMLHTTP';

//  Access web pages in subframes.
TP.ACCESS_XDOMAIN_FRAME = 'ACCESS_XDOMAIN_FRAME';

//  Access DOM Inspector internals
TP.ACCESS_DOM_INSPECT = 'ACCESS_DOM_INSPECT';

//  Delete a file on the host
TP.HOST_FILE_DELETE = 'HOST_FILE_DELETE';

//  General file system access on the host
TP.HOST_FILE_ACCESS = 'HOST_FILE_ACCESS';

//  Save a file on the host
TP.HOST_FILE_SAVE = 'HOST_FILE_SAVE';

//  Execute a shell command on the host
TP.HOST_CMD_EXEC = 'HOST_CMD_EXEC';

//  (IE-only) Execute an XSLT stylesheet
TP.XSLT_EXEC = 'XSLT_EXEC';

TP.PRIVILEGE_FLAGS = {};

TP.PRIVILEGE_DESCRIPTIONS = {
    'SHOW_ABOUT': 'Show a special "about:" panel',
    'READ_HISTORY': 'Read the browing history',
    'READ_PREFERENCE': 'Read a preference',
    'WRITE_PREFERENCE': 'Store a preference',
    'MANIPULATE_WINDOW': 'Manipulate a window',
    'READ_EXECUTION_STACK': 'Read the JavaScript execution stack',
    'ACCESS_XDOMAIN_FRAME': 'Access a window from another domain',
    'ACCESS_DOM_INSPECT': 'Inspect a DOM element',

    'ACCESS_XDOMAIN_XMLHTTP': 'Access data from another domain',
    'HOST_XSLT_EXEC': 'Execute an XSLT stylesheet',

    'HOST_FILE_ACCESS': 'General file system access',
    'HOST_FILE_DELETE': 'Delete a file',
    'HOST_FILE_SAVE': 'Save a file',
    'HOST_CMD_EXEC': 'Execute a shell command'
};

//  ------------------------------------------------------------------------
//  REFLECTION KEYS
//  ------------------------------------------------------------------------

/*
To support reflection on methods, properties, etc in an environment in which
you can have both "local" and inherited functionality, TIBET implements a
set of get*Interface calls which take a key defining what specific
properties you're looking for. These keys map to the following dictionaries
which define the parameters used to filter the object's keys.
*/

//  ------------------------------------------------------------------------

/*
Here are the parameter sets which are used by the final $getInterface()
call. These are accessed via the earlier global key definitions.

NOTE: the collection is sparse and relies on default values of:

    attributes: true
    methods: false
    hidden: false
    scope: unique
    public: if hidden is false, then the default is true. If hidden is true,
            then the default is false. Specify 'hidden: true' and 'public: true'
            to get both.
*/

TP.SLOT_FILTERS =
    {
        //  Visibility
        'public':
            {'methods': true, 'scope': TP.ALL},
        hidden:
            {'methods': true, 'hidden': true, 'scope': TP.ALL},
        known:
            {'methods': true, 'hidden': true, 'scope': TP.ALL, 'public': true},

        //  Different scopes
        unique:
            {'methods': true},
        local:
            {'methods': true, 'scope': TP.LOCAL},
        introduced:
            {'methods': true, 'scope': TP.INTRODUCED},
        inherited:
            {'methods': true, 'scope': TP.INHERITED},
        overridden:
            {'methods': true, 'scope': TP.OVERRIDDEN},

        //  Attributes only
        attributes:
            {'scope': TP.ALL},
        hidden_attributes:
            {'hidden': true, 'scope': TP.ALL},
        known_attributes:
            {'hidden': true, 'scope': TP.ALL, 'public': true},

        unique_attributes:
            {},  // default values
        local_attributes:
            {'scope': TP.LOCAL},
        introduced_attributes:
            {'scope': TP.INTRODUCED},
        inherited_attributes:
            {'scope': TP.INHERITED},
        overridden_attributes:
            {'scope': TP.OVERRIDDEN},

        hidden_unique_attributes:
            {'hidden': true},
        hidden_local_attributes:
            {'hidden': true, 'scope': TP.LOCAL},
        hidden_introduced_attributes:
            {'hidden': true, 'scope': TP.INTRODUCED},
        hidden_inherited_attributes:
            {'hidden': true, 'scope': TP.INHERITED},
        hidden_overridden_attributes:
            {'hidden': true, 'scope': TP.OVERRIDDEN},

        known_unique_attributes:
            {'hidden': true, 'public': true},
        known_local_attributes:
            {'hidden': true, 'scope': TP.LOCAL, 'public': true},
        known_introduced_attributes:
            {'hidden': true, 'scope': TP.INTRODUCED, 'public': true},
        known_inherited_attributes:
            {'hidden': true, 'scope': TP.INHERITED, 'public': true},
        known_overridden_attributes:
            {'hidden': true, 'scope': TP.OVERRIDDEN, 'public': true},

        //  Methods only
        methods:
            {'attributes': false, 'methods': true, 'scope': TP.ALL},
        hidden_methods:
            {'attributes': false, 'methods': true, 'hidden': true,
                'scope': TP.ALL},
        known_methods:
            {'attributes': false, 'methods': true, 'hidden': true,
                'scope': TP.ALL, 'public': true},

        unique_methods:
            {'attributes': false, 'methods': true},
        local_methods:
            {'attributes': false, 'methods': true, 'scope': TP.LOCAL},
        introduced_methods:
            {'attributes': false, 'methods': true, 'scope': TP.INTRODUCED},
        inherited_methods:
            {'attributes': false, 'methods': true, 'scope': TP.INHERITED},
        overridden_methods:
            {'attributes': false, 'methods': true, 'scope': TP.OVERRIDDEN},

        hidden_unique_methods:
            {'attributes': false, 'methods': true, 'hidden': true},
        hidden_local_methods:
            {'attributes': false, 'methods': true, 'hidden': true,
                'scope': TP.LOCAL},
        hidden_introduced_methods:
            {'attributes': false, 'methods': true, 'hidden': true,
                'scope': TP.INTRODUCED},
        hidden_inherited_methods:
            {'attributes': false, 'methods': true, 'hidden': true,
                'scope': TP.INHERITED},
        hidden_overridden_methods:
            {'attributes': false, 'methods': true, 'hidden': true,
                'scope': TP.OVERRIDDEN},

        known_unique_methods:
            {'attributes': false, 'methods': true, 'hidden': true,
                'public': true},
        known_local_methods:
            {'attributes': false, 'methods': true, 'hidden': true,
                'scope': TP.LOCAL, 'public': true},
        known_introduced_methods:
            {'attributes': false, 'methods': true, 'hidden': true,
                'scope': TP.INTRODUCED, 'public': true},
        known_inherited_methods:
            {'attributes': false, 'methods': true, 'hidden': true,
                'scope': TP.INHERITED, 'public': true},
        known_overridden_methods:
            {'attributes': false, 'methods': true, 'hidden': true,
                'scope': TP.OVERRIDDEN, 'public': true},

        //  Attributes and methods
        hidden_unique:
            {'methods': true, 'hidden': true},
        hidden_local:
            {'methods': true, 'hidden': true, 'scope': TP.LOCAL},
        hidden_introduced:
            {'methods': true, 'hidden': true, 'scope': TP.INTRODUCED},
        hidden_inherited:
            {'methods': true, 'hidden': true, 'scope': TP.INHERITED},
        hidden_overridden:
            {'methods': true, 'hidden': true, 'scope': TP.OVERRIDDEN},

        known_unique:
            {'methods': true, 'hidden': true, 'public': true},
        known_local:
            {'methods': true, 'hidden': true, 'scope': TP.LOCAL,
                'public': true},
        known_introduced:
            {'methods': true, 'hidden': true, 'scope': TP.INTRODUCED,
                'public': true},
        known_inherited:
            {'methods': true, 'hidden': true, 'scope': TP.INHERITED,
                'public': true},
        known_overridden:
            {'methods': true, 'hidden': true, 'scope': TP.OVERRIDDEN,
                'public': true}
    };

//  ------------------------------------------------------------------------
//  PRE-BUILT FUNCTION PARAMETERS
//  ------------------------------------------------------------------------

/*
Functions intended to serve as pre-built parameter values to things which
take parameters for filtering, sorting, or other operations. The argument
list return functions can be very useful in list processing where they help
work with arrays and ordered pairs without requiring custom iterators.
*/

//  ------------------------------------------------------------------------

//  simple functions to log arguments. useful for testing iterators,
//  particularly regular expression iteration via RegExp.performWith

TP.LOG_ARGS = function() {

        var args;
        args = TP.args(arguments);
        TP.ifTrace() ? TP.trace(args, TP.LOG) : 0;
    };

TP.NOTIFY_ARGS = function() {

        var args;
        args = TP.args(arguments);
        TP.boot.$notify(args, 'ARGS');
    };

//  ------------------------------------------------------------------------

/*
A pre-built handler function useful for testing signal notification is
occurring as you intend. Registering this handler will force a log entry
when the handler is actually invoked.
*/
TP.TEST_HANDLER = function(aSignal) {

                        //  by having this here we can observe and break
                        //  into the handler to check signal stack traces
                        TP.stop('break.signal_handler');

                        TP.info('TP.TEST_HANDLER fired for: ' +
                                    aSignal.getSignalName() + ' @ ' +
                                    aSignal.getSignalOrigin(),
                                TP.SIGNAL_LOG);
                    };

TP.TEST_SETUP_NAME = 'Test_SetUp';      //  the method name of object-level test
                                        //  set up methods
TP.TEST_TEARDOWN_NAME = 'Test_TearDown';//  the method name of object-level test
                                        //  tear down methods
TP.TEST_NAME_PREFIX = 'test ';          //  prefixed on all test function names

TP.PERFORM = 'Perform';
TP.SKIP = 'Skip';
TP.TODO = 'Todo';

TP.PRODUCED = 'Produced';
TP.EXPECTED = 'Expected';

//  ------------------------------------------------------------------------

/*
Common return value functions which help support certain iteration and test
scenarios without requiring custom functions or type checking. Also, certain
options here, such as RETURN_ARG0, represent common features (K function)
etc. that you may find useful.
*/

TP.RETURN_NULL = function() { return; };
TP.RETURN_THIS = function() { return this; };
TP.RETURN_TRUE = function() { return true; };
TP.RETURN_FALSE = function() { return false; };

TP.RETURN_ARG0 = function() { return arguments[0]; };
TP.RETURN_ARGS = function() { return arguments; };

//  item selectors, useful for key/item manipulations
TP.RETURN_FIRST = function() { return arguments[0].first(); };
TP.RETURN_LAST = function() { return arguments[0].last(); };

//  when you just gotta have a string
TP.RETURN_EMPTY = function() { return ''; };
TP.RETURN_SPACE = function() { return ' '; };

//  union and addAll "duplicate discriminators"
TP.RETURN_ORIG = function(key, orig) { return orig; };
TP.RETURN_NEW = function(key, orig, knew) { return knew; };

TP.RETURN_TOSTRING = function() { return this.toString(); };

//  ------------------------------------------------------------------------
//  SORT FUNCTIONS
//  ------------------------------------------------------------------------

/*
Somewhat brute-force, but useful sort functions that come up often.
*/

//  ------------------------------------------------------------------------

//  a sort that works just like the built-in alphabetic sort, but ignores
//  case-sensitivity
TP.CASE_INSENSITIVE_SORT = function(a, b) {

        var aLower,
            bLower;

        aLower = a.toLowerCase();
        bLower = b.toLowerCase();

        if (aLower < bLower) {
            return -1;
        } else if (aLower > bLower) {
            return 1;
        }

        return 0;
    };

//  a 'natural byte order' sort modified to meet TIBET coding standards from
//  the following:

/*
natcompare.js -- Perform 'natural order' comparisons of strings in
JavaScript.
Copyright (C) 2005 by SCK-CEN (Belgian Nucleair Research Centre)
Written by Kristof Coomans <kristof[dot]coomans[at]sckcen[dot]be>

Based on the Java version by Pierre-Luc Paour, of which this is more or less
a straight conversion.
Copyright (C) 2003 by Pierre-Luc Paour <natorder@paour.com>

The Java version was based on the C version by Martin Pool.
Copyright (C) 2000 by Martin Pool <mbp@humbug.org.au>

This software is provided 'as-is', without any express or implied
warranty.  In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not
claim that you wrote the original software. If you use this software
in a product, an acknowledgment in the product documentation would be
appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be
misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

TP.NATURAL_ORDER_SORT = function(a, b) {

        var isWhitespaceChar,
            isDigitChar,
            compareRight,

            ia,
            ib,
            nza,
            nzb,
            ca,
            cb,
            result;

        isWhitespaceChar = function(a) {

            var charCode;

            charCode = a.charCodeAt(0);

            if (charCode <= 32) {
                return true;
            } else {
                return false;
            }
        };

        isDigitChar = function(a) {

            var charCode;
            charCode = a.charCodeAt(0);

            if (charCode >= 48 && charCode <= 57) {
                return true;
            } else {
                return false;
            }
        };

        compareRight = function(a, b) {

            var bias,
                ia2,
                ib2,

                ca2,
                cb2;

            bias = 0;
            ia2 = 0;
            ib2 = 0;

            //  The longest run of digits wins.  That aside, the greatest
            //  value wins, but we can't know that it will until we've
            //  scanned both numbers to know that they have the same
            //  magnitude, so we remember it in BIAS.
            for (;; ia2++, ib2++) {
                ca2 = a.charAt(ia2);
                cb2 = b.charAt(ib2);

                if (!isDigitChar(ca2) && !isDigitChar(cb2)) {
                    return bias;
                } else if (!isDigitChar(ca2)) {
                    return -1;
                } else if (!isDigitChar(cb2)) {
                    return +1;
                } else if (ca2 < cb2) {
                    if (bias === 0) {
                        bias = -1;
                    }
                } else if (ca2 > cb2) {
                    if (bias === 0) {
                        bias = +1;
                    }
                } else if (ca2 === 0 && cb2 === 0) {
                    return bias;
                }
            }
        };

        ia = 0;
        ib = 0;
        nza = 0;
        nzb = 0;

        /* eslint-disable no-constant-condition */
        while (true) {
            //  only count the number of zeroes leading the last number
            //  compared
            nza = nzb = 0;

            ca = a.charAt(ia);
            cb = b.charAt(ib);

            //  skip over leading spaces or zeros
            while (isWhitespaceChar(ca) || ca === '0') {
                if (ca === '0') {
                    nza++;
                } else {
                    //  only count consecutive zeroes
                    nza = 0;
                }

                ca = a.charAt(++ia);
            }

            while (isWhitespaceChar(cb) || cb === '0') {
                if (cb === '0') {
                    nzb++;
                } else {
                    //  only count consecutive zeroes
                    nzb = 0;
                }

                cb = b.charAt(++ib);
            }

            //  process run of digits
            if (isDigitChar(ca) && isDigitChar(cb)) {
                if ((result = compareRight(a.substring(ia),
                                            b.substring(ib))) !== 0) {
                    return result;
                }
            }

            if (ca === 0 && cb === 0) {
                //  The strings compare the same.  Perhaps the caller
                //  will want to call strcmp to break the tie.
                return nza - nzb;
            }

            if (ca < cb) {
                return -1;
            } else if (ca > cb) {
                return +1;
            }

            ++ia; ++ib;
        }
        /* eslint-enable no-constant-condition */
    };

//  compareTo sort block which sorts based on "magnitude"
TP.COMPARE_SORT = function(a, b) {

        return a.compareTo(b);
    };

//  sort block that pushes "deleted" elements to the end for truncation
TP.DELETION_SORT = function(a, b) {

        if ((a !== TP.DELETED) && (b === TP.DELETED)) {
            return -1;
        } else if ((a === TP.DELETED) && (b !== TP.DELETED)) {
            return 1;
        }

        return 0;
    };

//  nodes can be sorted in document order using this sort
TP.DOCUMENT_ORDER_SORT = function(a, b) {

        /* jshint bitwise:false */
        if (a.sourceIndex) {
            return a.sourceIndex - b.sourceIndex;
        } else if (a.compareDocumentPosition) {
            return 3 - (a.compareDocumentPosition(b) & 6);
        } else {
            return 0;
        }
        /* jshint bitwise:true */
    };

//  elements can be sorted in tabindex order using this sort
TP.TABINDEX_ORDER_SORT = function(a, b) {

        var aVal,
            bVal;

        aVal = parseInt(a.getAttribute('tabindex'), 10);
        bVal = parseInt(b.getAttribute('tabindex'), 10);

        //  Neither 'a' or 'b' has a tabindex value. Leave the elements in
        //  document order.
        if (isNaN(aVal) && isNaN(bVal)) {
            return 0;
        } else if (isNaN(aVal) && !isNaN(bVal)) {
            //  'a' has no tabindex value and 'b's is either -1 or 0. Leave
            //  elements in document order.
            if (bVal <= 0) {
                return 0;
            }

            //  'b' has a real, positive integer tabindex - it should come
            //  before 'a'
            return 1;
        } else if (!isNaN(aVal) && isNaN(bVal)) {
            //  'b' has no tabindex value and 'a's is either -1 or 0. Leave
            //  elements in document order.
            if (aVal <= 0) {
                return 0;
            }

            //  'a' has a real, positive integer tabindex - it should come
            //  before 'b'
            return -1;
        } else if (aVal <= 0 && bVal <= 0) {
            //  Both 'a' and 'b' have a tabindex value that is either -1 or
            //  0. Leave elements in document order.
            return 0;
        } else if (aVal <= 0 && bVal > 0) {
            //  'a' has a tabindex value of either -1 or 0 and 'b' has a
            //  real, positive integer tabindex - it should come before 'a'
            return 1;
        } else if (aVal > 0 && bVal <= 0) {
            //  'b' has a tabindex value of either -1 or 0 and 'a' has a
            //  real, positive integer tabindex - it should come before 'b'
            return -1;
        }

        //  'a' and 'b' both have real, positive integer tabindex values.
        //  Sort ascending by that value.
        return aVal - bVal;
    };

//  sort objects by their "equality values" often their string values
TP.EQUALITY_SORT = function(a, b) {

        var arep,
            brep;

        if (TP.notValid(a)) {
            arep = TP.str(a);
        } else if (TP.canInvoke(a, '$getEqualityValue')) {
            arep = TP.str(a.$getEqualityValue());
        } else {
            arep = TP.str(a);
        }

        if (TP.notValid(b)) {
            brep = TP.str(b);
        } else if (TP.canInvoke(b, '$getEqualityValue')) {
            brep = TP.str(b.$getEqualityValue());
        } else {
            brep = TP.str(b);
        }

        if (arep < brep) {
            return -1;
        } else if (arep > brep) {
            return 1;
        }

        return 0;
    };

//  a simple sort for arrays containing ordered pairs by their "key" slot
TP.FIRST_ITEM_SORT = function(a, b) {

        if (!a && b) {
            return 1;
        } else if (a && !b) {
            return -1;
        } else if (a.at(0) < b.at(0)) {
            return -1;
        } else if (a.at(0) > b.at(0)) {
            return 1;
        }

        return 0;
    };

//  sort objects by their "identity values" (aka their IDs or pointers)
TP.IDENTITY_SORT = function(a, b) {

        var arep,
            brep;

        if (TP.notValid(a)) {
            arep = TP.str(a);
        } else if (TP.canInvoke(a, '$getIdentityValue')) {
            arep = TP.str(a.$getIdentityValue());
        } else {
            arep = TP.str(a);
        }

        if (TP.notValid(b)) {
            brep = b;
        } else if (TP.canInvoke(b, '$getIdentityValue')) {
            brep = b.$getIdentityValue();
        } else {
            brep = b;
        }

        if (arep < brep) {
            return -1;
        } else if (arep > brep) {
            return 1;
        }

        return 0;
    };

//  numerical sort block
TP.NUMERIC_SORT = function(a, b) {

        if (a < b) {
            return -1;
        } else if (a > b) {
            return 1;
        }

        return 0;
    };

//  a simple sort for arrays containing ordered pairs by their "value" slot
TP.SECOND_ITEM_SORT = function(a, b) {

        if (!a && b) {
            return 1;
        } else if (a && !b) {
            return -1;
        } else if (a.at(1) < b.at(1)) {
            return -1;
        } else if (a.at(1) > b.at(1)) {
            return 1;
        }

        return 0;
    };

//  sort to order a list by number of supertypes which effectively sorts
//  from parent to child (across one or more branches)
TP.SUBTYPE_SORT = function(a, b) {

        var asize,
            bsize;

        asize = a.getSupertypeNames().getSize();
        bsize = b.getSupertypeNames().getSize();

        if (asize < bsize) {
            return -1;
        } else if (asize > bsize) {
            return 1;
        }

        return 0;
    };

//  simple unicode-value sort
TP.UNICODE_SORT = function(a, b) {

        var au,
            bu;

        au = TP.str(a).unicodeEscaped();
        bu = TP.str(b).unicodeEscaped();

        if (au < bu) {
            return -1;
        } else if (au > bu) {
            return 1;
        }

        return 0;
    };

//  simple element sort
TP.ELEMENT_SORT = function(a, b) {

        var atag,
            btag;

        atag = a.tagName.toLowerCase();
        btag = b.tagName.toLowerCase();

        if (atag < btag) {
            return -1;
        } else if (atag > btag) {
            return 1;
        }

        return 0;
    };

//  Sorts keymap XML elements by whether they have no qualifier, just
//  'platform', just 'browser' or 'platform' AND 'browser'. This is considered
//  'least to most specific' for keymaps.
TP.KEYMAP_ELEMENT_SORT = function(a, b) {

        var aHasPlatform,
            aHasBrowser,

            bHasPlatform,
            bHasBrowser,

            aWeight,
            bWeight;

        aHasBrowser = a.hasAttribute('browser');
        aHasPlatform = a.hasAttribute('platform');

        bHasBrowser = b.hasAttribute('browser');
        bHasPlatform = b.hasAttribute('platform');

        //  If the element has both browser and platform, it is weighted most,
        //  followed by only browser, followed by only platform, followed by
        //  neither.

        if ((aHasBrowser && aHasPlatform)) {
            aWeight = 10;
        } else if (aHasBrowser && !aHasPlatform) {
            aWeight = 5;
        } else {
            aWeight = 1;
        }

        if ((bHasBrowser && bHasPlatform)) {
            bWeight = 10;
        } else if (bHasBrowser && !bHasPlatform) {
            bWeight = 5;
        } else {
            bWeight = 1;
        }

        //  Sort ascending by the weight
        return aWeight - bWeight;
    };

//  ------------------------------------------------------------------------
//  COMMON REGEXES
//  ------------------------------------------------------------------------

/*
Regular expressions we reuse throughout TIBET but compile only once. NOTE
that the global ones have to be "reset" by setting their lastIndex to 0
prior to running them to ensure they'll operate properly. This is done
automatically by the RegExp.performWith call when using the regex as an
enumerator over a string.
*/

//  ------------------------------------------------------------------------

TP.defineNamespace('regex', 'TP');

//  ------------------------------------------------------------------------

TP.regex.JOIN = new RegExp(TP.JOIN, 'g');
TP.regex.BASE_AWARE = new RegExp(TP.BASE_AWARE_PREFIX);

//  ---
//  type-checking/metadata
//  ---

TP.regex.ARRAY_CONSTRUCTOR = /function Array\(\)/;
TP.regex.BOOLEAN_CONSTRUCTOR = /function Boolean\(\)/;
TP.regex.DATE_CONSTRUCTOR = /function Date\(\)/;
TP.regex.FUNCTION_CONSTRUCTOR = /function Function\(\)/;
TP.regex.OBJECT_CONSTRUCTOR = /function Object\(\)/;
TP.regex.NUMBER_CONSTRUCTOR = /function Number\(\)/;
TP.regex.REGEXP_CONSTRUCTOR = /function RegExp\(\)/;
TP.regex.STRING_CONSTRUCTOR = /function String\(\)/;

TP.regex.FUNCTION_LITERAL = /^function(?:.*)\((?:.*)\)(?:[ ]*)\{(?:.*)\}$/;

TP.regex.ATTRIBUTE_NAME = /^[_$][a-zA-Z0-9_$]*$|^[A-Z]/;

TP.regex.PUBLIC_SLOT = /^_/;
TP.regex.PRIVATE_SLOT = /^\$[^$]/;
TP.regex.INTERNAL_SLOT = /^\$\$|\$\$[Inst|Type]|^__(.*)__$/;

TP.regex.PRIVATE_OR_INTERNAL_SLOT = /^\$|\$\$[Inst|Type]|^__(.*)__$/;

TP.regex.ANY_TYPE_SLOT = /^_|^\$|\$\$[Inst|Type]|^__(.*)__$/;

TP.regex.NATIVE_CODE = /\[native code\]/;
TP.regex.UNDERSCORES = /_/g;            //  needs reset

//  Native typenames: first character should be uppercase, followed by zero or
//  more of any uppercase, lowercase or numeric characters.
TP.regex.NATIVE_TYPENAME = /^[A-Z]+[A-Za-z0-9]+/;
TP.regex.NATIVE_TYPENAME_MATCH = /^\[object/;
TP.regex.NATIVE_TYPENAME_EXTRACT = / (.*)\]/;

TP.regex.VALID_ROOTNAME = /^(TP|APP)\.[a-zA-Z]([a-zA-Z0-9_])+/;
TP.regex.VALID_TYPENAME = /^[a-zA-Z]([-a-zA-Z0-9_.:]){2,}$/;
TP.regex.VALID_WINDOWNAME = /^[a-zA-Z]([-a-zA-Z0-9_](\.)*){1,}$/;

TP.regex.APP_TYPENAME = /^APP\./;
TP.regex.TP_TYPENAME = /^TP\./;
TP.regex.META_TYPENAME = /\.meta\./;

TP.regex.INTERNAL_TYPENAME = /^(Inst|Type|Local)$/i;

TP.regex.INSTANCE_OID = /^([a-zA-Z_$]{1}[a-zA-Z0-9_$]*?)\$([a-zA-Z0-9]+)$/;

TP.regex.LOCAL_TRACK = /Local/;
TP.regex.ROOT_OBJECTS = /Object|TP.lang.RootObject|TP.lang.Object/;

//  js identifiers
TP.regex.JS_FIRST_CHAR = /^[a-zA-Z_$]/;
TP.regex.JS_IDENT_REPLACE = /[^a-zA-Z0-9_$]/g;          //  needs reset
TP.regex.JS_IDENTIFIER = /^[a-zA-Z_$]{1}[a-zA-Z0-9_$]*$/;

TP.regex.JS_ASSIGNMENT =
    /(^|;|\s+)([a-zA-Z_$]{1}[a-zA-Z0-9_$]*)(\s*=[^=])/g; // needs reset

//  matching facet slot names
TP.regex.FACET_SLOT_NAME_MATCH = new RegExp('\\$(\\w+)_(' +
                                            TP.FACET_NAMES.join('|') +
                                            ')');
//  ---
//  character testing
//  ---

TP.regex.HAS_AT = /@/;
TP.regex.HAS_BACKSLASH = /\\/;
TP.regex.HAS_COLON = /:/;
TP.regex.HAS_HASH = /#/;
TP.regex.HAS_HYPHEN = /\-/;
TP.regex.HAS_PAREN = /\(|\)/;       //  moz won't parse without closing )
TP.regex.HAS_PERIOD = /\./;
TP.regex.HAS_PIPE = /[^\\]?\|/;         //  not valid if escaped via backslash
TP.regex.HAS_PIPE_SPLAT = /[^\\]?\|\*/; //  not valid if escaped via backslash
TP.regex.HAS_SCHEME = /^([A-Za-z][-.+A-Za-z0-9]*):/;
TP.regex.HAS_SLASH = /\//;
TP.regex.HAS_TIMEZONE = /[Z\+\-]/;

//  ---
//  css support
//  ---

TP.regex.CSS_CLIP_RECT = /rect\s*\((\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s*\)/;

//  The URL of the rule can be found in group 2. (needs reset)
TP.regex.CSS_IMPORT_RULE = /@import\s*(url\()?['"]?(.*?)['"]?(\))?;/g;

TP.regex.PIXELS = /px/;
TP.regex.QUANTIFIERS = /[\$\.\?\+\(\)]/g;                   //  needs reset

TP.regex.ATTRIBUTE_STRING = /([-\w]+)\s*=\s*(['"])(.+?)\2\s*/g; //  needs reset
TP.regex.STYLE_STRING = /([-\w]+)\s*:\s*([^/]+?)\s*($|;)/g; //  needs reset

//  Used by the CSS processor
TP.EMPTY_ARRAY = [];

//  ---
//  data binding
//  ---

TP.regex.BOUND_ELEMENT = /bind:/;
TP.regex.BOUND_INSTANCE = /instance\((.*)\)(.*)/;
TP.regex.DYNAMIC_BINDPATH = /\[/;   //  predicate
TP.regex.REPEATING_ATTRIBUTE = /repeat-/;

//  ---
//  boot/dynaloading
//  ---

TP.regex.DYNALOADED = null;
TP.DYNALOADED = 'inlined/evaluated source code';
TP.MISSING_CODE = 'missing/unavailable source code';

//  ---
//  event handling
//  ---

TP.BACK_SPACE_KEY = 8;
TP.TAB_KEY = 9;
TP.ENTER_KEY = 10;
TP.RETURN_KEY = 13;
TP.SHIFT_KEY = 16;
TP.CONTROL_KEY = 17;
TP.ALT_KEY = 18;
TP.ESCAPE_KEY = 27;
TP.DELETE_KEY = 46;

TP.regex.CTRL = /Ctrl_.+/;
TP.regex.ALT = /Alt_.+/;
TP.regex.META = /Meta_.+/;
TP.regex.SHIFT = /Shift_.+/;

TP.regex.PRESS_END = /[Pp]ress$/;
TP.regex.DOWN_END = /[Dd]own$/;
TP.regex.UP_END = /[Uu]p$/;

TP.regex.KEY_EVENT = /^key|DOMKey|_(?:Up|Down|Press)$/;
TP.regex.MOUSE_EVENT = /^mouse|DOMMouse|DOMClick|DOMDblClick/;

TP.regex.SIGNAL_PREFIX = /^(TP|APP)\.sig\./;
TP.regex.HANDLER_NAME = /^handle([-_a-zA-Z0-9]+)$/;

/* eslint-disable max-len */
TP.regex.SPLIT_HANDLER_NAME =
    /^handle([A-Z0-9][a-zA-Z0-9_]*?)(From([A-Z][a-zA-Z0-9_]*?))*?(When([A-Z][a-zA-Z0-9_]*?))*?$/;
/* eslint-enable max-len */

//  ---
//  file paths
//  ---

TP.regex.HAS_PATH_OFFSET = /\/\.\./;
TP.regex.HAS_PATH_NOOP = /\/\./;
TP.regex.REMOVE_PATH_OFFSET = /(^|\/)[^\/]*\/\.\./;
TP.regex.REMOVE_PATH_NOOP = /\/\./;

TP.regex.FILE_PATH = /\.([^\/]*)$/;
TP.regex.ROOT_PATH = /^\/(\w)*/;
TP.regex.UNC_PATH = /^\\\\\w/;
TP.regex.WINDOWS_PATH = /^(")*\w:\\(.*)/;

//  ---
//  formatting/substitution
//  ---

//  Character substitutions in Strings
TP.regex.SUBSTITUTION_STRING = /[#%@]\{|`.+`/;

//  Templating delimiters
TP.regex.STARTS_ACP = /^\{\{/;
TP.regex.HAS_ACP = /\{\{.*\}\}/;
TP.regex.EXTRACT_ACP = /\{\{(.+?)\}\}/;

TP.regex.ACP_NUMERIC = /\{\{(\d+)\}\}/g;   //  needs reset

//  0-n non-'\' characters followed by 0-n whitespace, followed by '.%',
//  followed by 0-n whitespace, followed by 1-n any characters
TP.regex.ACP_FORMAT = /([^\\]*?)\s*\.%\s*(.+)/;

TP.regex.INLINE_BINDING_EXTRACT = /\[\[(.+?)\]\]/g; // needs reset

TP.regex.TSH_VARSUB = /\$\{?([A-Z_$]{1}[A-Z0-9_$]*)\}?/;
//  A global version of TP.regex.TSH_VARSUB
TP.regex.TSH_VARSUB_EXTRACT = /\$\{?([A-Z_$]{1}[A-Z0-9_$]*)\}?/g;

//  Only matches the 'extended variable' format
TP.regex.TSH_VARSUB_EXTENDED = /\$\{([A-Z_$]{1}[A-Z0-9_$]*)\}/g;

// pseudo-acp plus format string means potentially transformable string
TP.regex.TRANSFORMABLE = /[$#%@]\{|`.+`/;

TP.regex.CAMEL_CASE = /([-\s_]([a-z]))/g;       //  needs reset
TP.regex.TITLE_CASE = /([-\s_]([a-z]))/g;       //  needs reset
TP.regex.WORD_BOUNDARIES = /[-\s_]/g;           //  needs reset

TP.regex.WHITESPACE = /\s+/;
TP.regex.ONLY_WORD = /^\w+$/;
TP.regex.ONLY_NUM = /^\d+$/;

TP.regex.PUNCTUATION = /[\]\[\/ .,;:@!#%&*_'"?<>{}+=|)(^~`$-]+/;

TP.regex.ANY_NUMBER = /^-?\d+$/i;
TP.regex.PERCENTAGE = /^-?\d+%$/i;

// needs reset
TP.regex.NON_UTF8_CHARS =
/[\xC2-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF4][\x80-\xBF]{3}/g;

//  call stack formatting
TP.regex.CALL_STACK_FORMAT = /(.*) \((.*)\)/;
TP.regex.CALL_STACK_ID = /Function\$[0-9a-z]*($|([\s]))/g;  //  needs reset

TP.regex.CALL_STACK_ENTRY_SPLITTER = /(.+)@(.+):(\d+):(\d+)/;

//  ---
//  testing
//  ---

TP.regex.TEST_FUNCTION = /test[a-zA-Z0-9$_'"]+/;

//  ---
//  markup
//  ---

TP.XML_NCNAME = '[A-Za-z_]|[^\\x00-\\x7F]';
TP.XML_NCNAMECHAR = '[A-Za-z0-9_.-]|[^\\x00-\\x7F]';

TP.regex.XML_IDREF = new RegExp(
                        TP.XML_NCNAME + '(' + TP.XML_NCNAMECHAR + ')*');

TP.XML_NAMESTART = '[A-Za-z_:]|[^\\x00-\\x7F]';
TP.XML_NAMECHAR = '[A-Za-z0-9_:.-]|[^\\x00-\\x7F]';
TP.XML_ATTRVAL = '"[^<"]' + '*' + '"' + '|\'[^<\']*\'';

TP.XML_NAME = '(' + TP.XML_NAMESTART + ')' + '(' + TP.XML_NAMECHAR + ')*';

TP.regex.IS_ELEM_MARKUP = new RegExp(
        '^(\\s)*<' + TP.XML_NAME + '>(\\s)*' + '([\\s\\S]*)' + '>(\\s)*$');

TP.CONTAINS_ELEM_MARKUP_DEF =
        '<(' + TP.XML_NAMESTART + ')([^<>"\']+|' + TP.XML_ATTRVAL + ')*>';
TP.regex.CONTAINS_ELEM_MARKUP = new RegExp(TP.CONTAINS_ELEM_MARKUP_DEF);

TP.regex.HAS_ELEMENT = /<\/|\/>/;
TP.regex.HAS_PI = /<\?|\?>/;
TP.regex.HAS_ENTITY = /&#/;

TP.regex.INVALID_ID_CHARS = /[ !"#$%&'()*+,/:;<=>?@[\]^`{|}~]+/g; // needs reset

TP.regex.EMPTY_TAG_END = /\/>/;

//  We don't start off with '^' for this RegEx, since there could be PIs,
//  DOCTYPEs, etc. in front of the 'first element markup'.
TP.regex.OPENING_TAG = new RegExp(
    '<(' + TP.XML_NAME + ')([^<>"\']+|' + TP.XML_ATTRVAL + ')*>');
TP.regex.CLOSED_TAG = /(<([^>]*?)\/>)$/;
TP.regex.CLOSING_TAG = /(<\/([^>]*?)>)$/;

TP.regex.OPENING_TAG_NAME = new RegExp('<((' + TP.XML_NAMECHAR + ')+)');

//  Note the tail of this RegExp uses the 'including newlines' expression.
TP.regex.ALL_ELEM_MARKUP = new RegExp(
    '<(' + TP.XML_NAME + ')([^<>"\']+|' + TP.XML_ATTRVAL + ')*>' +
    '([\\s\\S]*)$');

//  A RegExp that matches tags that are empty in XHTML 1.0 (with IE-specific
//  additions - bgsound, embed, wbr).
/* eslint-disable max-len */
TP.regex.XHTML_10_EMPTY_ELEMENTS = /^(area|base|basefont|bgsound|br|col|embed|hr|img|input|isindex|link|meta|param|wbr)$/;
/* eslint-enable max-len */

//  Same as above, except it contains markup brackets for stripping purposes.
/* eslint-disable max-len */
TP.regex.XHTML_10_EMPTY_ELEMENTS_STRIP = /<\/(area|base|basefont|bgsound|br|col|embed|hr|img|input|isindex|link|meta|param|wbr)>/g; // needs reset
/* eslint-enable max-len */

//  A RegExp that matches XML comments.

//  The content of the comment can be found in group 2.
TP.XML_COMMENT_DEF =
    '<!--(([^-]*)-([^-][^-]*-)*->?)?';
TP.regex.XML_COMMENT = new RegExp(TP.XML_COMMENT_DEF, 'g'); // needs reset

//  A RegExp that matches an XML comment that must be the whole content
TP.regex.XML_COMMENT_WHOLE = new RegExp('^<!--(.+?)-->$');

//  A RegExp that matches XML CDATA sections.

TP.XML_CDATA_DEF =
    '<!\\[CDATA\\[([^]]*]([^]]+])*]+([^]>][^]]*]([^]]+])*]+)*>)?';
TP.regex.XML_CDATA = new RegExp(TP.XML_CDATA_DEF, 'g'); // needs reset

//  A RegExp that matches an XML CDATA section that must be the whole content
TP.regex.XML_CDATA_WHOLE = new RegExp('^<!\\[CDATA\\[(.+?)\\]\\]>$');

//  A RegExp that matches XML processing instructions

//  The content of the PI can be found in group 1 - including the trailing '?>'
//  which may need to be sliced off
/* eslint-disable max-len */
TP.XML_PI_DEF =
    '<\\?(([A-Za-z_:]|[^\\x00-\\x7F])([A-Za-z0-9_:.-]|[^\\x00-\\x7F])*(\\?>|[\\n\\r\\t ][^?]*\\?+([^>?][^?]*\\?+)*>)?)?';
/* eslint-enable max-len */

TP.regex.XML_PI = new RegExp(TP.XML_PI_DEF, 'g'); // needs reset

//  A RegExp that matches an XML processing instrction that must be the whole
//  content
TP.regex.XML_PI_WHOLE = new RegExp('^<\\?(.+?)\\?>$');

//  A RegExp that matches any kind of markup
TP.regex.XML_ALL_MARKUP =
    new RegExp('(' +
                TP.CONTAINS_ELEM_MARKUP_DEF + '|' +
                TP.XML_COMMENT_DEF + '|' +
                TP.XML_CDATA_DEF + '|' +
                TP.XML_PI_DEF + ')');

//  A RegExp that matches the XML declaration.
TP.regex.XML_DECL = /<\?xml\s+.+\?>/;

//  A RegExp that matches XML empty tags.
TP.regex.XML_EMPTY_TAG = /<([^\s<]*)([^<]*?)\/>/g;  //  needs reset

//  A RegExp for matching markup entities.
TP.regex.ML_ENTITY = /&([a-zA-Z#0-9]+);/;

//  A RegExp that matches "standalone" (outside of element) XML attribute
//  expressions
TP.regex.XML_ATTR = /^\s*([\w:]+)=['"](\w*)['"]/;

//  A RegExp that matches XML attribute expressions that contain *only* the
//  word 'null' as a value
TP.regex.XML_ATTR_NULL = /\s*([\w:]+)=['"]null['"]/g;   //  needs reset

//  A RegExp that matches XML attribute expressions that contain the word
//  'null' as a value (NB: this is grouped in a particular way for easy
//  replacement - '$1"$2$3"')
TP.regex.XML_ATTR_CONTAINING_NULL =
    /(\s*[\w:]+=)['"]([^'"]*?)null([^'"]*?)['"]/g;  //  needs reset

//  A RegExp that matches various HTML tags.
TP.regex.HTML_HTML_ELEM =
        /<html((.*)?([^\/>]*)?)(\/|>([^<]*)?<\/html)>/gi;   // needs reset
TP.regex.HTML_HEAD_ELEM =
        /<head((.*)?([^\/>]*)?)(\/|>([^<]*)?<\/head)>/gi;   // needs reset
TP.regex.HTML_BODY_ELEM =
        /<body((.*)?([^\/>]*)?)(\/|>([^<]*)?<\/body)>/gi;   // needs reset

TP.regex.HTML_SCRIPT_ELEM =
        /<script((.*)?([^\/>]*)?)(\/|>([^<]*)?<\/script)>/gi;   // needs reset

/* eslint-disable max-len */
// needs reset
TP.regex.HTML_CSS_LINK_ELEM =
/<link((.*)?( rel="stylesheet"| type="text\/css")+([^\/>]*)?)(\/|>([^<]*)?<\/link)>/gi;
/* eslint-enable max-len */

//  needs reset
TP.regex.HTML_CSS_STYLE_ELEM =
/<style((.*)?( type="text\/css")+([^\/>]*)?)(\/|>([^<]*)?<\/style)>/gi;

TP.regex.HTML_IMG_ELEM =
        /<img((.*)?([^\/>]*)?)(\/|>([^<]*)?<\/img)>/gi; //  needs reset

//  A RegExp that matches non-prefixed namespace attribute entries.
TP.regex.NON_PREFIXED_NS_ATTR =
        /\s+xmlns=(['"])([\x00-\x7F]*?)\1/g;    //  needs reset

//  A RegExp that matches prefixed namespace attribute entries.
TP.regex.PREFIXED_NS_ATTR =
        /\s+xmlns:\w+=(['"])([\x00-\x7F]*?)\1/g;    //  needs reset

//  A RegExp that matches content in between quotes that must be at the
//  beginning or end.
TP.regex.QUOTED_CONTENT = /^(['"])(.*)\1$/;
TP.regex.ESCAPED_QUOTED_CONTENT = /^\\(['"])(.*)\\\1$/;

//  ---
//  mime
//  ---

TP.regex.MIME_TYPE = /(\w+)\/(\w+)/gi;                  //  needs reset

//  ---
//  names
//  ---

TP.regex.ANONYMOUS_NAME = /^\$\d/;
TP.regex.IS_NAMEXP = /\*| /;

//  ---
//  number support
//  ---

TP.MAX_DOUBLE = 9007199254740991;

//  The maximum timeout as supported by Mozilla. Roughly equivalent to 596.5
//  hours or 24 days.
TP.MAX_TIMEOUT = 2147483647;

//  ---
//  object support
//  ---

TP.regex.GETTER = /^get([A-Z])/;
TP.regex.SETTER = /^set([A-Z])/;

//  ---
//  optimization support
//  ---

TP.regex.PERFORM_INSTRUMENT = /at[End|Start]/;
TP.regex.CACHE_FILE = /_CACHE_/;
TP.regex.MULTI_VALUED = / /;

//  ---
//  regex support
//  ---

//  A RegExp that will escape Strings for use as RegExps :)
TP.regex.REGEX_ESCAPE = /([-[\]{}()*+?.\\^$|,#\s]{1})/g;    //  needs reset
TP.regex.REGEX_LITERAL_STRING = /^\/(.+)\/[gimy]*$/;

//  ---
//  tibet uris
//  ---

TP.regex.TIBET_URL = /^[tibet:|~]/;
//  node@domain:port, resource, canvas, path, and pointer
TP.regex.TIBET_URL_SPLITTER =
                /tibet:([^\/]*?)\/([^\/]*?)\/([^\/#]*)\/?(([^#]*)(.*))/;

TP.regex.TIBET_URN = /urn:tibet:/;
TP.TIBET_URN_PREFIX = 'urn:tibet:';

TP.regex.TPOINTER = /([^\(]*)\(([^\)]*)\)/;
TP.regex.TIBET_VIRTUAL_URI_PREFIX = /^~|^tibet:\/\/\/~/;
TP.regex.VIRTUAL_URI_PREFIX = /^~/;

//  ---
//  TSH support
//  ---

TP.TSH_OPERATOR_CHARS = '`#~!@%^&*=\\;:,./?';

TP.regex.TSH_TEMPLATE = /\$\{/;
TP.regex.TSH_SUBSHELL = /\.\(\((.*)?\.\)\)/;
TP.regex.TSH_SUBGROUP = /\.\{\{(.*)?\.\}\}/;
TP.regex.TSH_HEREDOC = /\.<</;

//  TSH_DEREF_SUGAR is a JS_IDENTIFIER preceded by @ (but could have optional
//  leading '${' and trailing '}')
TP.regex.TSH_DEREF_SUGAR = /^@\$?\{?[a-zA-Z_$]{1}[a-zA-Z0-9_$]*\}?$/;

//  ---
//  uri schemes
//  ---

TP.regex.SCHEME = /^([A-Za-z][-.+A-Za-z0-9]*):(.*)/;

TP.regex.CHROMEEXT_SCHEME = /^chrome-extension:\/\//;
TP.regex.FILE_SCHEME = /^file:\/\//;
TP.regex.HTTP_SCHEME = /^http[s]?:\/\//;
TP.regex.JS_SCHEME = /^javascript:/;
TP.regex.MAIL_SCHEME = /^mailto:\/\//;
TP.regex.TIBET_SCHEME = /^tibet:/;

//  ---
//  uri support
//  ---

//  !!!NOTE: This regexp gets rewritten as schemes are added to the system. If
//  this is changed here, it *must* be updated in the scheme addition code.
TP.regex.URI_LIKELY =
    /^~|^\/|^\.\/|^\.\.\/|^urn:|^tibet:|^javascript:|^(?:\w+):(?:.*)\//;

TP.regex.URI_FRAGMENT = /#/;

/* eslint-disable max-len */
TP.regex.URI_STRICT = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/;
/* eslint-enable max-len */

/* eslint-disable max-len */
TP.regex.URI_LOOSE = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
/* eslint-enable max-len */

//  A RegExp that matches the URI queries, where the separator is either a
//  '&' or ';' (for XML compliance)
TP.regex.URI_QUERY = /[&;]?([^&;=]*)=?([^&;]*)/g;   //  needs reset

//  ---
//  window
//  ---

TP.regex.BAD_WINDOW_ID = /[:\/]/;
TP.regex.WINDOW_PREFIX = /^window_[0-9]/;
TP.regex.SCREEN_PREFIX = /^screen_[0-9]/;

//  ---
//  xml catalog
//  ---

TP.regex.URI_REWRITE = /rewriteURI/;
TP.regex.URI_DELEGATE = /delegateURI/;
TP.regex.URI_NEXTCAT = /nextCatalog/;

//  ---
//  xml documents
//  ---

TP.regex.XML_PREFIX = /<\?xml (.*)\?>/;

//  ---
//  xml namespaces
//  ---

//  Moz has namespace resolution issues :)
TP.regex.MOZ_XPATH_ERROR = /regard to namespaces/;

TP.regex.NS_EXTRACTION = /.*?xmlns([:\w]*?)=\"(.*?)\"/g;    //  needs reset
TP.regex.NS_PREFIXES = /<(\w+)*:/g;                         //  needs reset
TP.regex.NS_QUALIFIED = /(.*):(.*)/;

//  A RegExp that will strip the 'XML namespace' (as MSXML already defines
//  it and doesn't like it at all when you try to redefine it).
// needs reset
TP.regex.XML_XMLNS_STRIP =
    /xmlns:xml=(['"])http:\/\/www.w3.org\/XML\/1998\/namespace(\1)/g;

TP.regex.XMLNS_STRIP = /\s+xmlns([:\w]*?)=['"](.*?)['"]/g;  // needs reset
TP.regex.XMLNS_ATTR = /xmlns[:=]/;

//  ---
//  path types
//  ---

TP.TIBET_PATH_TYPE = 0;
TP.CSS_PATH_TYPE = 1;
TP.XPATH_PATH_TYPE = 2;
TP.XPOINTER_PATH_TYPE = 3;
TP.XTENSION_POINTER_PATH_TYPE = 4;
TP.BARENAME_PATH_TYPE = 5;

TP.CHANGE_PATHS = 'paths';

//  ---
//  path detection and values
//  ---

//  One or more access paths separated by '.(' and ').'
TP.regex.COMPOSITE_PATH = /(^|\.)\((.+?)\)(\.|$)/;

TP.regex.ANY_POINTER = /(\w+)\((.*)\)/;

//  one or more of any characters with optional preceding or following
//  whitespace
TP.regex.PATH_EXPR = /(^|\s+)(.+?)($|\s+)/g; // needs reset

//  any of these symbols -
//  '|', '@', '#', ':', '/', '&', '=', '<', '>', '.', '[', '('
TP.regex.NON_SIMPLE_PATH = /[|@#:\/&=><\.\[\(]/;

//  force the colon to have numbers on either side to avoid collisions with
//  prefixed XPath expressions
TP.regex.TIBET_POINTER = /tibet\((.+)\)/;

//  Forms of TIBETan access paths can include words separated by periods ('.'),
//  brackets ('[]') with either string or numeric indexes and brackets with
//  numeric ranges (or just a colon ':' signifying the whole range).
TP.regex.TIBET_PATH =
    /^(\$|_)?\w+[\.]{1}\w+|\[\w+(,\w+)+\]|\[-?\d*:-?\d*(:-?\d*)?\]/;

TP.regex.TIBET_PATH_CHAR = /[\.:,]+/;
TP.regex.TIBET_PATH_TEMPLATE = /(^|\s+)(\w[\w\.:,]*)(\s+|$)/g; //  needs reset

//  Node Path matching

//  TIBET extensions that can be used in *node* paths
TP.regex.XTENSION_POINTER = /css\((.+)\)/;

TP.regex.CSS_POINTER = /css\((.+)\)/;

//  Detect @[anything] as whole
TP.regex.ATTRIBUTE = /^@\w+$/;

//  Detect @[anything] at end
TP.regex.ATTRIBUTE_ENDS = /@\w+$/;

//  Detect starts with @*
TP.regex.ATTRIBUTE_ALL = /^@\*/;

//  Detect starts with #, followed by word characters
TP.regex.BARENAME = new RegExp(
                        '^#(' +
                        '(' + TP.XML_NCNAME + ')(' + TP.XML_NCNAMECHAR + ')*' +
                        ')$');

TP.regex.DOCUMENT_ID = /#document$/;
TP.regex.ELEMENT_ID = /(.*)#(.*)/;
TP.regex.BOOLEAN_ID = /^true$|^false$/;

TP.regex.ID_FUNCTION = /id\((.+)\)/;
TP.regex.ID_HAS_NS = /:/g;                              //  needs reset
TP.regex.IDREFS = /(.*) (.*)/;
TP.regex.ID_POINTER = /(xpointer|xpath1)\(id\(["'](.+)["']\)\)/;

TP.regex.XPOINTER = /(xpointer|xpath1|element)\((.+)\)/;

TP.regex.ELEMENT_PATH = /[#@\/\\.\\[\\(]/;
TP.regex.ELEMENT_POINTER = /element\((.+)\)/;

TP.regex.XPATH_HAS_ID = /id\((.+)\)/;

//  /, @, . followed by . or /, x( where x isn't . (all from start of line) OR
//  a 'full axis name' followed by a double colon ('::')
/* eslint-disable max-len */
TP.regex.XPATH_PATH = /^(\/|@|\.[\/\.]|[^\\.]\((.*)\))|(ancestor|ancestor-or-self|attribute|child|descendant|descendant-or-self|following|following-sibling|namespace|parent|preceding|preceding-sibling|self)::/;
/* eslint-enable max-len */

TP.regex.XPATH_POINTER = /(xpointer|xpath1)\((.+)\)/;

TP.regex.XPATH_DEFAULTNS = new RegExp(
        '\\$def:((' + TP.XML_NAMECHAR + ')+)', 'g');    //  needs reset

//  ------------------------------------------------------------------------
//  MISC VARIABLES
//  ------------------------------------------------------------------------

TP[TP.TNAME] = 'Object';
TP.sys[TP.TNAME] = 'Object';

//  a tmp for holding the 'real' i.e. non-spoofed browser for patching
TP.sys.$$realBrowser = null;

TP.sys.$LICENSE = TP.NULL_OID;

//  ------------------------------------------------------------------------

window.$$TIBET = true;              //  hook for locating true TIBET frame
                                    //  used by the findTIBET routine.
                                    //  NOTE: WE DO NOT REGISTER THIS GLOBAL
                                    //  to avoid having it imported/exported
                                    //  to other frames.

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
