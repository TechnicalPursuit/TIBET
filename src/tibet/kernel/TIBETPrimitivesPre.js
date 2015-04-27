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
@file           TIBETPrimitivesPre.js
@abstract       This file starts the process of installing the TIBET "VM",
                a set of primitive functions leveraged throughout TIBET.
                The VM is responsible for encapsulating the technologies
                native to a browser -- namely JS, HTML, XML, and CSS.

                As with many of the *Primitives*.js files, additional
                browser-specific files loaded by the boot system will
                augment this file.
*/

/* JSHint checking */

/* global $STATUS:true */

//  ------------------------------------------------------------------------
//  OBJECT IDENTITY - PART I
//  ------------------------------------------------------------------------

/*
To support a variety of functionality, TIBET requires that objects have a
unique identity which can be used to distinguish them from other objects.
*/

//  ------------------------------------------------------------------------

/**
 * Well-known ID values. This will allow the types to display using their names
 * rather than an arbitrary OID value. TIBET's defineSubtype call defines each
 * type's public id to be the type name itself.
 */

//  see later in this file for setting the TP.NAME, TP.TYPE, etc. of these
//  objects.

Array[TP.ID] = 'Array';
Boolean[TP.ID] = 'Boolean';
Date[TP.ID] = 'Date';
Function[TP.ID] = 'Function';
Number[TP.ID] = 'Number';
Object[TP.ID] = 'Object';
RegExp[TP.ID] = 'RegExp';
String[TP.ID] = 'String';

Window[TP.ID] = 'Window';

//  Built-in prototypes
//  NB: We do *not* place a TP.ID slot on TP.ObjectProto in an effort to keep
//  slots off of there.
TP.ArrayProto[TP.ID] = 'ArrayProto';
TP.BooleanProto[TP.ID] = 'BooleanProto';
TP.DateProto[TP.ID] = 'DateProto';
TP.FunctionProto[TP.ID] = 'FunctionProto';
TP.NumberProto[TP.ID] = 'NumberProto';
TP.RegExpProto[TP.ID] = 'RegExpProto';
TP.StringProto[TP.ID] = 'StringProto';

Window.prototype[TP.ID] = 'WindowProto';

//  Built-in TIBET objects
TP[TP.ID] = 'TP';
TP.sys[TP.ID] = 'TP.sys';
TP.boot[TP.ID] = 'TP.boot';
TP.global[TP.ID] = 'Self';
APP[TP.ID] = 'APP';

//  ------------------------------------------------------------------------

/**
 * Well-known name values.
 */

//  Built-in prototypes
//  NB: We do *not* place a TP.NAME slot on TP.ObjectProto in an effort to keep
//  slots off of there.
TP.ArrayProto[TP.NAME] = 'ArrayProto';
TP.BooleanProto[TP.NAME] = 'BooleanProto';
TP.DateProto[TP.NAME] = 'DateProto';
TP.FunctionProto[TP.NAME] = 'FunctionProto';
TP.NumberProto[TP.NAME] = 'NumberProto';
TP.RegExpProto[TP.NAME] = 'RegExpProto';
TP.StringProto[TP.NAME] = 'StringProto';

Window.prototype[TP.NAME] = 'WindowProto';

//  Built-in TIBET objects
TP[TP.NAME] = 'TP';
TP.sys[TP.NAME] = 'TP.sys';
TP.boot[TP.NAME] = 'TP.boot';
TP.global[TP.NAME] = 'Self';
APP[TP.NAME] = 'APP';

//  ------------------------------------------------------------------------

/**
 * Well-known typename values.
 */

//  Built-in prototypes
//  NB: We do *not* place a TP.TNAME slot on TP.ObjectProto in an effort to keep
//  slots off of there.
TP.ArrayProto[TP.TNAME] = 'Object';
TP.BooleanProto[TP.TNAME] = 'Object';
TP.DateProto[TP.TNAME] = 'Object';
TP.FunctionProto[TP.TNAME] = 'Object';
TP.NumberProto[TP.TNAME] = 'Object';
TP.RegExpProto[TP.TNAME] = 'Object';
TP.StringProto[TP.TNAME] = 'Object';

Window.prototype[TP.TNAME] = 'Object';

//  Built-in TIBET objects
TP[TP.TNAME] = 'Object';
TP.sys[TP.TNAME] = 'Object';
TP.boot[TP.TNAME] = 'Object';
TP.global[TP.TNAME] = 'Object';
APP[TP.TNAME] = 'Object';

//  -----------------------------------------------------------------------
//  Preliminary bootstrap methods required by TP.defineSlot() and
//  TP.defineMethodSlot()
//  -----------------------------------------------------------------------

//  Needed during boot
TP.getID = function() {return TP[TP.ID]; };
TP.sys.getID = function() {return TP.sys[TP.ID]; };
TP.boot.getID = function() {return TP.boot[TP.ID]; };
APP.getID = function() {return APP[TP.ID]; };

//  Needed during boot
TP.getName = function() {return TP[TP.NAME]; };
TP.sys.getName = function() {return TP.sys[TP.NAME]; };
TP.boot.getName = function() {return TP.boot[TP.NAME]; };
APP.getName = function() {return APP[TP.NAME]; };

//  ------------------------------------------------------------------------

TP.isCallable = function(anObj) {

    /**
     * @method isCallable
     * @summary Returns true if the object provided is a function which is not
     *     marked as a DNU. No owner or track testing is performed which is what
     *     disinguishes this call from TP.isMethod(). Methods, unlike more
     *     generic "callables", have an owner and track.
     * @param {Object} anObj The object to test.
     * @example Test to see if a function is callable:
     *     <code>
     *          anObj = function() {return 42};
     *          TP.isCallable(anObj);
     *          <samp>true</samp>
     *     </code>
     * @example Test to see if any other object is callable:
     *     <code>
     *          TP.isCallable(TP.ac());
     *          <samp>false</samp>
     *          TP.isCallable(TP.dc());
     *          <samp>false</samp>
     *          TP.isCallable('');
     *          <samp>false</samp>
     *          TP.isCallable(TP.lang.Object.construct());
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean}
     */

    //  NB: Do not replace this logic - it has been optimized to primitives
    //  because this method gets called so much.
    /* eslint-disable no-extra-parens */
    return (anObj && anObj.apply && anObj.$$dnu !== true);
    /* eslint-enable no-extra-parens */
};

//  Manual setup
TP.isCallable[TP.NAME] = 'isCallable';
TP.isCallable[TP.OWNER] = TP;
TP.isCallable[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.isCallable[TP.DISPLAY] = 'TP.isCallable';
TP.isCallable[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];
TP.isCallable[TP.SOURCE_PATH] = TP.boot[TP.SOURCE_PATH];

//  ------------------------------------------------------------------------

TP.canInvoke = function(anObj, anInterface) {

    /**
     * @method canInvoke
     * @summary Returns true if the object provided implements the method or
     *     methods in the interface provided. The interface can be defined as
     *     either a single method name or an array of names which constitute the
     *     list of methods to check.
     * @description The Smalltalk method 'respondsTo' is replaced in TIBET with
     *     this method, which allows you to check a method name against a
     *     potentially null/undefined parameter or return value.
     * @param {Object} anObj The object to check.
     * @param {String|Array} anInterface A method name, or list of method names,
     *     to check.
     * @example Testing to see if anObj implements 'getID':
     *     <code>
     *          TP.canInvoke(anObj, 'getID');
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} True if the object implements the method(s) of the
     *     interface.
     */

    var obj,
        i,
        len;

    if (anObj === undefined || anObj === null ||
            anInterface === undefined || anInterface === null) {
        return false;
    }

    //  NB: Do not replace this logic - it has been optimized to primitives
    //  because this method (with a String parameter) gets called so much.
    if (anInterface.charAt !== undefined) {
        obj = anObj[anInterface];
        /* eslint-disable no-extra-parens */
        return (obj !== undefined && obj.apply && obj.$$dnu !== true);
        /* eslint-enable no-extra-parens */
    } else if (TP.isArray(anInterface)) {
        len = anInterface.length;
        for (i = 0; i < len; i++) {
            obj = anObj[anInterface[i]];
            if (!obj || !obj.apply || obj.$$dnu === true) {
                return false;
            }
        }
        return true;
    }

    return false;
};

//  Manual setup
TP.canInvoke[TP.NAME] = 'canInvoke';
TP.canInvoke[TP.OWNER] = TP;
TP.canInvoke[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.canInvoke[TP.DISPLAY] = 'TP.canInvoke';
TP.canInvoke[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];
TP.canInvoke[TP.SOURCE_PATH] = TP.boot[TP.SOURCE_PATH];

//  ------------------------------------------------------------------------

TP.isValid = function(aValue) {

    /**
     * @method isValid
     * @summary Return true if the receiver is not undefined and not null,
     *     meaning it has some value (empty/false or otherwise).
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is valid:
     *     <code>
     *          if (TP.isValid(anObj)) { TP.alert('its valid'); };
     *     </code>
     * @returns {Boolean} Whether or not the value is not null *and* is not
     *     undefined.
     */

    return aValue !== undefined && aValue !== null;
};

//  Manual setup
TP.isValid[TP.NAME] = 'isValid';
TP.isValid[TP.OWNER] = TP;
TP.isValid[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.isValid[TP.DISPLAY] = 'TP.isValid';
TP.isValid[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];
TP.isValid[TP.SOURCE_PATH] = TP.boot[TP.SOURCE_PATH];

//  ------------------------------------------------------------------------

TP.notValid = function(aValue) {

    /**
     * @method notValid
     * @summary Returns true if the value provided is either null or undefined.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is not valid:
     *     <code>
     *          if (TP.notValid(anObj)) { TP.alert('its not valid'); };
     *     </code>
     * @returns {Boolean} Whether or not the value is not valid (that is, either
     *     null or undefined).
     */

    return aValue === undefined || aValue === null;
};

//  Manual setup
TP.notValid[TP.NAME] = 'notValid';
TP.notValid[TP.OWNER] = TP;
TP.notValid[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.notValid[TP.DISPLAY] = 'TP.notValid';
TP.notValid[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];
TP.notValid[TP.SOURCE_PATH] = TP.boot[TP.SOURCE_PATH];

//  ------------------------------------------------------------------------

TP.ifInvalid = function(aSuspectValue, aDefaultValue) {

    /**
     * @method ifInvalid
     * @summary Returns either aSuspectValue or aDefaultValue based on the
     *     state of aSuspectValue. If aSuspectValue is TP.notValid()
     *     aDefaultValue is returned.
     * @param {Object} aSuspectValue The value to test.
     * @param {Object} aDefaultValue The value to return if aSuspectValue is ===
     *     null or === undefined.
     * @example Set the value of theObj to true, if anObj is invalid:
     *     <code>
     *          theObj = TP.ifInvalid(anObj, true);
     *     </code>
     * @returns {Object} One of the two values provided.
     */

    return TP.notValid(aSuspectValue) ? aDefaultValue : aSuspectValue;
};

//  Manual setup
TP.ifInvalid[TP.NAME] = 'ifInvalid';
TP.ifInvalid[TP.OWNER] = TP;
TP.ifInvalid[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.ifInvalid[TP.DISPLAY] = 'TP.ifInvalid';
TP.ifInvalid[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];
TP.ifInvalid[TP.SOURCE_PATH] = TP.boot[TP.SOURCE_PATH];

//  ------------------------------------------------------------------------

TP.isDNU = function(anObj) {

    /**
     * @method isDNU
     * @summary Returns true if the object provided is a TIBET DNU
     *     (DoesNotUnderstand) function. These functions are installed by TIBET
     *     to provide support for delegation, inferencing, and other method
     *     resolution strategies.
     * @description TIBET's support for "missing" methods is driven largely by
     *     the DNU concept, which provides the hooks found in Ruby's missing
     *     methods, Smalltalk/Self's "doesNotUnderstand", etc.
     * @param {Object} anObj The object to test.
     * @returns {Boolean} Whether or not the supplied object is a DNU.
     */

    //  if the dnu slot is defined we can return its value, otherwise the
    //  proper response is false
    //return TP.isFunction(anObj) && anObj.$$dnu === true;
    return anObj && anObj.$$dnu === true;
};

//  Manual setup
TP.isDNU[TP.NAME] = 'isDNU';
TP.isDNU[TP.OWNER] = TP;
TP.isDNU[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.isDNU[TP.DISPLAY] = 'TP.isDNU';
TP.isDNU[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];
TP.isDNU[TP.SOURCE_PATH] = TP.boot[TP.SOURCE_PATH];

// TODO: Remove after cleansing old name.
TP.$$isDNU = TP.isDNU;

//  ------------------------------------------------------------------------

TP.isFunction = function(anObj) {

    /**
     * @method isFunction
     * @summary Returns true if the object provided is a function instance. No
     *     attempt is made to determine whether that function is a DNU, or
     *     method (an owned function). Use TP.isCallable(), or TP.isMethod() to
     *     test for those cases.
     * @description Perhaps the most glaring example of why we've encapsulated
     *     so heavily in TIBET. Most libraries use typeof == 'function' and call
     *     it a day. Unfortunately many of IE's DOM-associated functions don't
     *     return 'function' in response to a typeof call and Mozilla is
     *     confused about RegExp objects and typeof (it returns "function"). So
     *     there are at least two cases where typeo) will lie to you with
     *     Function checks. Dates have similar issues, as do Numbers. Our
     *     advice? Don't use typeof unless you're certain of what you're
     *     really testing against and you're only interested in knowing what the
     *     primitive type (in ECMA-standard terms) of the object is.
     * @param {Object} anObj The object to test.
     * @example Test to see if a function is a Function:
     *     <code>
     *          anObj = function() {return 42};
     *          TP.isFunction(anObj);
     *          <samp>true</samp>
     *     </code>
     * @example Test to see if a DOM function is a Function:
     *     <code>
     *          TP.isFunction(document.write);
     *          <samp>true</samp>
     *     </code>
     * @example Test to see if a RegExp is a Function:
     *     <code>
     *          TP.isFunction(/matchme/g);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is a JavaScript
     *     Function.
     */

    return TP.ObjectProto.toString.call(anObj) === '[object Function]';
};

//  Manual setup
TP.isFunction[TP.NAME] = 'isFunction';
TP.isFunction[TP.OWNER] = TP;
TP.isFunction[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.isFunction[TP.DISPLAY] = 'TP.isFunction';
TP.isFunction[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];
TP.isFunction[TP.SOURCE_PATH] = TP.boot[TP.SOURCE_PATH];

//  ------------------------------------------------------------------------

TP.isString = function(anObj) {

    /**
     * @method isString
     * @summary Returns true if the object provided is a string primitive or a
     *     String object. This method also allows us to play a few tricks with
     *     "mutable strings" or what a Java developer would think of as a
     *     "string buffer" by returning true if the object can behave like a
     *     string in terms of API. Of course, the caveat here is don't use '+'
     *     to concatenate strings, use TP.join() or one of the collection
     *     methods instead since they're faster and can deal with strings of
     *     different types...but you knew all that :).
     * @param {Object} anObj The object to test.
     * @example Test to see if an object is a string:
     *     <code>
     *          anObj = 'foo';
     *          TP.isString(anObj);
     *          <samp>true</samp>
     *          TP.isString('bar');
     *          <samp>true</samp>
     *          TP.isString(42);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean}
     */

    return TP.ObjectProto.toString.call(anObj) === '[object String]';
};

//  Manual setup
TP.isString[TP.NAME] = 'isString';
TP.isString[TP.OWNER] = TP;
TP.isString[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.isString[TP.DISPLAY] = 'TP.isString';
TP.isString[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];
TP.isString[TP.SOURCE_PATH] = TP.boot[TP.SOURCE_PATH];

//  ------------------------------------------------------------------------

TP.owns = function(anObject, aName) {

    /**
     * @method owns
     * @summary Returns true if the object hasOwnProperty() aName. This wrapper
     *     exists because numerous objects which should respond to that method
     *     don't, and will throw errors if you try to use it.
     * @param {Object} anObject The object to test.
     * @param {String} aName The slot name to check.
     * @returns {Boolean} True if the object owns the slot.
     */

    //  This is the most efficient way to provide this functionality. This is
    //  VERY HEAVILY used method, so it's best to leave it this way unless bugs
    //  are found.
    return TP.ObjectProto.hasOwnProperty.call(anObject, aName);
};

//  Manual setup
TP.owns[TP.NAME] = 'owns';
TP.owns[TP.OWNER] = TP;
TP.owns[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.owns[TP.DISPLAY] = 'TP.owns';
TP.owns[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];
TP.owns[TP.SOURCE_PATH] = TP.boot[TP.SOURCE_PATH];

//  ------------------------------------------------------------------------

TP.objectGetLoadNode = function(anObject) {

    /**
     * @method objectGetLoadNode
     * @summary Returns the script node responsible for loading the object.
     * @param {Object} anObject The object to query.
     * @returns {Node} The script node that loaded the object.
     */

    var node;

    if (TP.notValid(anObject)) {
        return;
    }

    try {
        node = anObject[TP.LOAD_NODE];
    } catch (e) {
        //  All objects likely to freak out are native, hence no load
        //  module.
        return;
    }

    return node;
};

TP.objectGetLoadNode[TP.NAME] = 'objectGetLoadNode';
TP.objectGetLoadNode[TP.OWNER] = TP;
TP.objectGetLoadNode[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.objectGetLoadNode[TP.DISPLAY] = 'TP.objectGetLoadNode';
TP.objectGetLoadNode[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];
TP.objectGetLoadNode[TP.SOURCE_PATH] = TP.boot[TP.SOURCE_PATH];

//  ------------------------------------------------------------------------

TP.objectSetLoadNode = function(anObject, aNode) {

    /**
     * @method objectSetLoadNode
     * @summary Sets the script node responsible for loading the object.
     * @param {Object} anObject The object to update.
     * @param {Node} aNode A script node, presumably the one responsible for
     *     loading the object.
     * @returns {Object} The updated object.
     */

    anObject[TP.LOAD_NODE] = aNode;

    return anObject;
};

TP.objectSetLoadNode[TP.NAME] = 'objectSetLoadNode';
TP.objectSetLoadNode[TP.OWNER] = TP;
TP.objectSetLoadNode[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.objectSetLoadNode[TP.DISPLAY] = 'TP.objectSetLoadNode';
TP.objectSetLoadNode[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];
TP.objectSetLoadNode[TP.SOURCE_PATH] = TP.boot[TP.SOURCE_PATH];

//  ------------------------------------------------------------------------

TP.FunctionProto.asMethod = function(owner, name, track, display) {

    /**
     * @method asMethod
     * @summary Returns the receiver as a method. In most cases this simply
     *     returns the function.
     * @description In certain special cases this function can be overridden to
     *     provide advanced behavior which significantly enhances the
     *     functionality of the system. The various as*Method functions are all
     *     controlled from this root method. The asMethod call is triggered in
     *     the various add*Method calls to allow the system to automatically
     *     instrument functions. Typically all the control flags are set to
     *     false during TIBET load and are then set to true when the IDE loads
     *     or when a developer sets up the appropriate configuration file for
     *     application loading. This allows the applicaton-specific methods to
     *     be wrapped without causing extra overhead within the TIBET
     *     infrastructure itself. Note that its always possible to do the
     *     following:
     *
     *     MyType.add*Method('blah', MyType.get*Method('blah').as*Method());
     *
     *     ...do some debugging
     *
     *     MyType.add*Method('blah',
     *     MyType.get*Method('blah').asStandardMethod());
     *
     *     This allows you to alter behavior for a single method and then put
     *     it back where you found it all clean and nice.
     * @param {Object} owner The object that owns the method.
     * @param {String} name The slot name.
     * @param {String} track The slot track (type, inst, local, etc).
     * @param {String} display The slot display name. Defaults to the
     *     owner.track.name triplet.
     * @returns {Function} A properly configured 'method'.
     * @para Object The object receiving the slot.
     */

    var displayName;

    //  Build a display name that should work for most cases.
    if (!display) {
        //  If the track is local we don't show it, so Obj.method instead of
        //  Obj.Local.method, but Obj.Inst.method, or Obj.Type.method as needed.
        if (track.indexOf(TP.LOCAL_TRACK) === TP.NOT_FOUND) {
            try {
                displayName = owner.getID() + '.' + track + '.' + name;
            } catch (e) {
                top.console.log(
                    'Can\'t compute owner ID for: ' + TP.str(owner) +
                    ' for method named: ' + name +
                    ' on track: ' + track +
                    ' stack: ' + e.stack);
            }
        } else {
            displayName = owner.getID() + '.' + name;
        }
    } else {
        displayName = display;
    }

    //  Attach reflection metadata.
    this[TP.NAME] = name;
    this[TP.OWNER] = owner;
    this[TP.TRACK] = track;
    this[TP.DISPLAY] = displayName;

    //  Attach where we were loaded from (the script file node).
    TP.objectSetLoadNode(this, TP.boot[TP.LOAD_NODE]);

    return this;
};

//  Manual setup
TP.FunctionProto.asMethod[TP.NAME] = 'asMethod';
TP.FunctionProto.asMethod[TP.OWNER] = Function;
TP.FunctionProto.asMethod[TP.TRACK] = TP.INST_TRACK;
TP.FunctionProto.asMethod[TP.DISPLAY] = 'Function.Inst.asMethod';
TP.FunctionProto.asMethod[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];
TP.FunctionProto.asMethod[TP.SOURCE_PATH] = TP.boot[TP.SOURCE_PATH];

//  ------------------------------------------------------------------------

TP.StringProto.strip = function(aRegExp) {

    /**
     * @method strip
     * @summary Returns a new string with the contents of the receiver after
     *     having removed any characters matching the RegExp passed in.
     * @param {RegExp} aRegExp The pattern to strip from receiver.
     * @returns {String} A new string with the contents of the receiver except
     *     for characters specified in aRegexp.
     */

    return this.replace(aRegExp, '');
};

//  Manual setup
TP.StringProto.strip[TP.NAME] = 'strip';
TP.StringProto.strip[TP.OWNER] = String;
TP.StringProto.strip[TP.TRACK] = TP.INST_TRACK;
TP.StringProto.strip[TP.DISPLAY] = 'String.Inst.strip';
TP.StringProto.strip[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];
TP.StringProto.strip[TP.SOURCE_PATH] = TP.boot[TP.SOURCE_PATH];

//  ------------------------------------------------------------------------
//  OBJECT IDENTITY - PART I
//  ------------------------------------------------------------------------

//  allow for custom OID generation routines to be installed prior to
//  this. we install this via a test so it's easy to define your own
//  routine in the tibet.xml file if you like.
if (!TP.sys.constructOID) {
    TP.sys.constructOID = function(aPrefix) {

        /**
         * @method constructOID
         * @summary Generates an OID value, optionally prefixing it with
         *     aPrefix if that prefix is non-empty. Note that OIDs always begin
         *     with an _, $, or alpha character regardless of the prefix to
         *     ensure unprefixed OIDs are valid IDREF values and legal JS
         *     identifiers.
         * @description A TIBET OID value is a random identifier which has no
         *     long-term uniqueness properties but is sufficient for managing
         *     unique references during a particular application invocation
         *     cycle.
         *
         *     Something far more complex would be needed to allow these to
         *     persist and be useful across machine and/or process boundaries.
         *     The version here appears adequate for single-browser operation
         *     although clearly other algorithms are possible (and perhaps
         *     faster).
         *
         *     NOTE, since OID values are used as IDREF values you must use an
         *     algorithm which produces valid IDREFs, at a minimum this means
         *     they have to start with $, _, or an alpha character.
         * @param {String} aPrefix An optional prefix which will be prepended to
         *     the return value.
         * @returns {String} Currently all OID's are String values.
         */

        //  NOTE that starting with anything other than a number allows
        //  these to work as ID[REF] values when no prefix is provided
        return (aPrefix ? aPrefix + TP.OID_PREFIX : TP.OID_PREFIX) +
                Math.random().toString(32).replace('0.',
                        Date.now().toString(32));
    };
}

//  Manual setup
TP.sys.constructOID[TP.NAME] = 'constructOID';
TP.sys.constructOID[TP.OWNER] = TP.sys;
TP.sys.constructOID[TP.TRACK] = TP.LOCAL_TRACK;
TP.sys.constructOID[TP.DISPLAY] = 'TP.sys.constructOID';
TP.sys.constructOID[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];
TP.sys.constructOID[TP.SOURCE_PATH] = TP.boot[TP.SOURCE_PATH];

//  ---

TP.genID = TP.sys.constructOID;

//  ------------------------------------------------------------------------
//  OBJECT NAMING - PART I
//  ------------------------------------------------------------------------

/**
 * TIBET often needs to report on the names of functions, the 'owner' or type to
 * which they belong, and similar relationship information to support the
 * various levels of reflection in the system.
 */

//  regex for function data extraction. TIBET uses function names in
//  support of callNextMethod as well as for logging support. Too bad this
//  isn't a built-in feature of the language. Owner too.

//  strip name from the function -- if it exists

//  Note the non-greediness of the RegExp here - don't want to match past
//  the actual end of the parameter list.
Function.$$getNameRegex = /function\s*(.*?)\(/;

//  ------------------------------------------------------------------------

TP.getFunctionName = function(aFunction) {

    /**
     * @method getFunctionName
     * @summary Returns the name of the supplied function or the value
     * TP.ANONYMOUS_FUNCTION_NAME if function doesn't have a name.
     * @param {Function} aFunction The Function to retrieve the name of.
     * @returns {String} The name of the Function or TP.ANONYMOUS_FUNCTION_NAME
     */

    var results;

    //  Do a toString on the function, grab the word after the word 'function'
    //  and use that as the function name. If no name can be computed, we use
    //  the value of TP.ANONYMOUS_FUNCTION_NAME.

    results = Function.$$getNameRegex.exec(aFunction.toString());

    if (TP.notValid(results) || results[1] === '') {
        return TP.ANONYMOUS_FUNCTION_NAME;
    } else {
        return results[1].strip(/\s/g);
    }
};

//  Manual method registration.
TP.getFunctionName[TP.NAME] = 'getFunctionName';
TP.getFunctionName[TP.OWNER] = TP;
TP.getFunctionName[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.getFunctionName[TP.DISPLAY] = 'TP.getFunctionName';
TP.getFunctionName[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];
TP.getFunctionName[TP.SOURCE_PATH] = TP.boot[TP.SOURCE_PATH];

//  ------------------------------------------------------------------------

TP.FunctionProto.$getName = function() {

    /**
     * @method $getName
     * @summary Returns the name of the receiving function or its ID if the
     *     function doesn't have a name. As a general rule our methods for
     *     adding methods set the function name but functions declared outside
     *     of an add*Method() should have a name set to properly register them
     * @returns {String}
     */

    var results;

    //  careful here, TP.FunctionProto will pass names along and everything will
    //  turn up as "Function" if we don't make sure
    if (TP.owns(this, TP.NAME)) {
        return this[TP.NAME];
    }

    results = TP.getFunctionName(this.toString());
    if (results === TP.ANONYMOUS_FUNCTION_NAME) {
        //  In Functions that live in TIBET, we don't like Functions to be named
        //  as TP.ANONYMOUS_FUNCTION_NAME, so we compute a unique ID for them
        //  and stamp them with it.

        //  Note that we supply a prefix of 'Function' here to uniquely identify
        //  anonymous Function objects and to avoid a recursion whereby a null
        //  prefix here turns around and calls TP.isType() when this particular
        //  method is called by methods that TP.isType() calls.
        results = this.getID('Function');
    }

    this[TP.NAME] = results;

    return results;
};

//  Manual method registration.
TP.FunctionProto.$getName[TP.NAME] = '$getName';
TP.FunctionProto.$getName[TP.OWNER] = Function;
TP.FunctionProto.$getName[TP.TRACK] = TP.INST_TRACK;
TP.FunctionProto.$getName[TP.DISPLAY] = 'Function.Inst.$getName';
TP.FunctionProto.$getName[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];
TP.FunctionProto.$getName[TP.SOURCE_PATH] = TP.boot[TP.SOURCE_PATH];

//  ------------------------------------------------------------------------

/*
Assign aliases to create public methods for name access. Owner and track
data is considered private.
*/

TP.FunctionProto.getName = TP.FunctionProto.$getName;
TP.StringProto.getName = TP.FunctionProto.$getName;

//  ------------------------------------------------------------------------

//  stub for early calls, replaced later in kernel

//  Add it directly to TP.ArrayProto - we don't worry about capturing metadata
//  about this method as we'll be replacing it very soon with the "real"
//  implementation anyway.
TP.ArrayProto.at = function(anIndex) {

    /**
     * @method at
     * @summary Returns the value found at an index. Provides polymorphic
     *     access to indexed collection data, which isn't possible with literal
     *     bracket syntax (you can't use []'s on strings etc). NOTE that this
     *     initial version doesn't support varargs or negative indices.
     * @description To support multi-dimensional access this method will allow
     *     more than one index parameter as in arr.at(1, 1) so that, in reality,
     *     the value is acquired from a nested child of the receiver. For
     *     example, arr.at(1, 1) returns the value 3 when used on the array
     *     [[0,1],[2,3]]. This is equivalent to the syntax arr[1][1];
     * @param {Number} anIndex The index to access. Note that this value is the
     *     first index in a potential list of indicies.
     * @returns {Object} The value at the index.
     * @addon Array
     */

    return this[anIndex];
};

//  ------------------------------------------------------------------------

//  stub for early calls, replaced later in kernel

//  Add it directly to TP.ArrayProto - we don't worry about capturing metadata
//  about this method as we'll be replacing it very soon with the "real"
//  implementation anyway.
TP.ArrayProto.atPut = function(anIndex, aValue) {

    /**
     * @method atPut
     * @summary Sets the value found at anIndex. Provides polymorphic access to
     *     updating indexed collection data, which isn't possible with literal
     *     bracket syntax. This version does not provide change notification.
     *     NOTE that this initial version does not support vararg values or
     *     negative indices.
     * @description To support multi-dimensional access expanded versions allow
     *     more than one index parameter as in arr.atPut(1, 2, 'foo') so that,
     *     in reality, aValue is defined by the last argument and is placed in
     *     the location found by traversing to the last index (arguments.length
     *     - 2) provided.
     * @param {Number} anIndex The index to set/update.
     * @param {Object} aValue The object to place at anIndex. NOTE that the
     *     position of this attribute may actually vary if multiple indexes are
     *     supplied.
     * @returns {Array} The receiver.
     * @addon Array
     */

    this[anIndex] = aValue;

    return this;
};

//  -----------------------------------------------------------------------
//  Primitive TP.lang.Hash support
//  -----------------------------------------------------------------------

/*
The following type provides a standin during the booting process for full
TP.lang.Hash support which loads later. First, it constructs a primitive
hash that handles basic at(), atPut(), get(), and set() operations TIBET
relies upon until the more fully featured TP.lang.Hash can be loaded. Second
it provides a way to convert itself into one of those more fully functional
TP.lang.Hashes so early-stage dictionaries can be upgraded to their more
functional cousins.
*/

TP.PHash = function() {

    var i,
        obj,
        len;

    //  internal hash and list of true keys for the receiver
    /* jshint -W010 */
    /* eslint-disable no-new-object */
    this.$$hash = new Object();
    /* eslint-enable no-new-object */
    /* jshint +W010 */
    this[TP.ID] = TP.sys.constructOID();

    //  no signaling until we're observed
    this.$suspended = true;

    //  populate the instance based on our argument list. we try to mirror
    //  the basic semantics of the full TP.lang.Hash here, but that object
    //  has a number of additional input formats
    if (arguments.length === 1) {
        obj = arguments[0];
        for (i in obj) {    //  one of the few places we do this
            if (TP.regex.INTERNAL_SLOT.test(i) &&
                TP.owns(obj, i)) {
                this.$$hash[i] = obj[i];
            }
        }
    } else {
        //  add any arguments passed in to the constructor to the receiver
        len = arguments.length;
        for (i = 0; i < len; i = i + 2) {
            this.$$hash[arguments[i]] = arguments[i + 1];
        }
    }

    //  ---
    //  isAccessPath
    //  ---

    this.isAccessPath = function() {

        /**
         * @method isAccessPath
         * @summary Returns whether or not the receiver is an access path
         *     object.
         * @returns {Boolean} False - most receivers are not a path.
         */

        return false;
    };

    //  register with TIBET by hand
    this.isAccessPath[TP.NAME] = 'isAccessPath';
    this.isAccessPath[TP.OWNER] = TP.PHash;
    this.isAccessPath[TP.TRACK] = TP.INST_TRACK;
    this.isAccessPath[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.isAccessPath';

    //  ---
    //  isCollection
    //  ---

    this.$$isCollection = function() {

        /**
         * @method $$isCollection
         * @summary Returns true if the receiver is a collection instance. True
         *     for TP.lang.Hash instances. NOTE that this method is invoked via
         *     the TP.isCollection() method on objects which implement it, you
         *     shouldn't invoke it directly.
         * @returns {Boolean} True if the receiver is an instance of collection.
         */

        return true;
    };

    //  register with TIBET by hand
    this.$$isCollection[TP.NAME] = '$$isCollection';
    this.$$isCollection[TP.OWNER] = TP.PHash;
    this.$$isCollection[TP.TRACK] = TP.INST_TRACK;
    this.$$isCollection[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.$$isCollection';

    //  ---
    //  isMemberOf
    //  ---

    this.$$isMemberOf = function(aType) {

        /**
         * @method $$isMemberOf
         * @summary Returns true if the receiver is a direct instance of the
         *     type provided.
         * @param {TP.lang.RootObject|String} aType A Type object, or type name.
         * @returns {Boolean} True if the receiver is an instance of the type or
         *     a subtype.
         */

        /* eslint-disable no-extra-parens */
        return (aType === 'TP.lang.Hash' || aType === TP.lang.Hash);
        /* eslint-enable no-extra-parens */
    };

    //  register with TIBET by hand
    this.$$isMemberOf[TP.NAME] = '$$isMemberOf';
    this.$$isMemberOf[TP.OWNER] = TP.PHash;
    this.$$isMemberOf[TP.TRACK] = TP.INST_TRACK;
    this.$$isMemberOf[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.$$isMemberOf';

    //  ---
    //  as
    //  ---

    this.as = function(aType) {

        /**
         * @method as
         * @summary Returns the receiver as an instance of aType. This
         *     implementation is capable only of converting into a TP.lang.Hash
         *     and potentially converting that hash into something else. The
         *     more powerful TP.lang.Hash type may have more efficient or
         *     comprehensive conversion routines.
         * @param {TP.lang.RootObject|String} typeOrFormat The type or format
         *     object or String desired.
         * @returns {Object} An instance of aType.
         */

        if (aType === 'TP.lang.Hash' || aType === TP.lang.Hash) {
            return this.asTP_lang_Hash();
        }

        return this.asTP_lang_Hash().as(aType);
    };

    //  register with TIBET by hand
    this.as[TP.NAME] = 'as';
    this.as[TP.OWNER] = TP.PHash;
    this.as[TP.TRACK] = TP.INST_TRACK;
    this.as[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.as';

    //  ---
    //  asString
    //  ---

    this.asString = function() {

        /**
         * @method asString
         * @summary Returns a usable string representation of the hash. The
         *     standard form here uses TIBET syntax, meaning that a hash with a
         *     key of 'a' and a value of 1 appears in string form as
         *     TP.hc('a',1).
         * @returns {String} The receiver in string form.
         */

        var keys,
            length,
            j,
            arr;

        arr = TP.ac();
        arr.push('TP.hc(');

        keys = Object.keys(this.$$hash);
        length = keys.length;

        for (j = 0; j < length; j++) {
            arr.push(TP.src(keys[j]), ', ', TP.src(this.$$hash[keys[j]]));
            if (j + 1 < length) {
                arr.push(', ');
            }
        }
        arr.push(')');

        return arr.join('');
    };

    //  register with TIBET by hand
    this.asString[TP.NAME] = 'asString';
    this.asString[TP.OWNER] = TP.PHash;
    this.asString[TP.TRACK] = TP.INST_TRACK;
    this.asString[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.asString';

    //  ---
    //  asJSONSource
    //  ---

    this.asJSONSource = function() {

        /**
         * @method asJSONSource
         * @summary Returns a usable JSON representation of the hash, meaning
         *     that a hash with a key of 'a' and a value of 1 appears in string
         *     form as '{"a": 1}'.
         * @returns {String} The receiver in string form.
         */

        return this.asTP_lang_Hash().asJSONSource();
    };

    //  register with TIBET by hand
    this.asJSONSource[TP.NAME] = 'asJSONSource';
    this.asJSONSource[TP.OWNER] = TP.PHash;
    this.asJSONSource[TP.TRACK] = TP.INST_TRACK;
    this.asJSONSource[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.asJSONSource';

    //  ---
    //  asSource
    //  ---

    this.asSource = function() {

        /**
         * @method asSource
         * @summary Returns a usable source representation of the hash. The
         *     standard form here uses TIBET syntax, meaning that a hash with a
         *     key of 'a' and a value of 1 appears in string form as
         *     TP.hc('a',1).
         * @returns {String} The receiver in string form.
         */

        return this.asTP_lang_Hash().asSource();
    };

    //  register with TIBET by hand
    this.asSource[TP.NAME] = 'asSource';
    this.asSource[TP.OWNER] = TP.PHash;
    this.asSource[TP.TRACK] = TP.INST_TRACK;
    this.asSource[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.asSource';

    //  ---
    //  asTP_lang_Hash
    //  ---

    this.asTP_lang_Hash = function() {

        /**
         * @method asTP_lang_Hash
         * @summary Converts the receiver to a full TP.lang.Hash type. The
         *     internal hash data structures are migrated to the new instance so
         *     on completion of this method you should release any references
         *     you may have to the older primitive hash instance.
         * @returns {TP.lang.Hash} The full TP.lang.Hash constructed from the
         *     receiver.
         */

        // Pray this doesn't get invoked before we rebuild with the real hash
        // type (or better yet Map when it arrives).
        return TP.hc(this.$$hash);
    };

    //  register with TIBET by hand
    this.asTP_lang_Hash[TP.NAME] = 'asTP_lang_Hash';
    this.asTP_lang_Hash[TP.OWNER] = TP.PHash;
    this.asTP_lang_Hash[TP.TRACK] = TP.INST_TRACK;
    this.asTP_lang_Hash[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.asTP_lang_Hash';

    //  ---
    //  at
    //  ---

    this.at = function(aKey) {

        /**
         * @method at
         * @summary Returns the value at the key/index provided.
         * @param {Object} aKey The index to use for locating the value. Note
         *     that this is usually a string, but could be any object supporting
         *     a valid toString method. This method is designed to protect
         *     against returning any of the receiver's properties/methods.
         * @returns {Object} The item at the index provided or undefined.
         */
/*
        if (TP.owns(this.$$hash, aKey)) {
            return this.$$hash[aKey];
        }
*/
        // Nothing on Object.prototype, this should work.
        return this.$$hash[aKey];
    };

    //  register with TIBET by hand
    this.at[TP.NAME] = 'at';
    this.at[TP.OWNER] = TP.PHash;
    this.at[TP.TRACK] = TP.INST_TRACK;
    this.at[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.at';

    //  ---
    //  atPut
    //  ---

    this.atPut = function(aKey, aValue) {

        /**
         * @method atPut
         * @summary Sets the value at aKey to aValue.
         * @param {Object} aKey The key/index to put aValue into.
         * @param {Object} aValue The value to register under aKey.
         * @returns {TP.PHash} The receiver.
         */

        this.$$hash[aKey] = aValue;

        return this;
    };

    //  register with TIBET by hand
    this.atPut[TP.NAME] = 'atPut';
    this.atPut[TP.OWNER] = TP.PHash;
    this.atPut[TP.TRACK] = TP.INST_TRACK;
    this.atPut[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.atPut';

    //  ---
    //  $get
    //  ---

    this.$get = function(attributeName) {

        /**
         * @method $get
         * @summary Returns the property with the given name, adjusted for
         *     standard TIBET attribute prefixing rules as needed.
         * @param {String} attributeName The name of the property to get.
         * @returns {Object} The value of the named property.
         */

        return this[attributeName];
    };

    //  register with TIBET by hand
    this.$get[TP.NAME] = '$get';
    this.$get[TP.OWNER] = TP.PHash;
    this.$get[TP.TRACK] = TP.INST_TRACK;
    this.$get[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.$get';

    //  ---
    //  get
    //  ---

    this.get = function(attributeName) {

        /**
         * @method get
         * @summary Returns the value of attributeName from the receiver. NOTE
         *     that get() operates on the object's methods first and then
         *     searches its content and properties. In other words, if the
         *     receiver has both a method named 'getFoo' and a key/value pair
         *     under the key 'foo' you won't get the value back, you'll get the
         *     result of getFoo() instead. After methods are checked the content
         *     of the hash is checked, followed by the hash's slots. Use at() if
         *     you want to focus exclusively on the content of the hash and
         *     never acquire method results or property values. Use $get if you
         *     want to focus exclusively on the hash's slot values.
         * @param {String} attributeName The name of the property to get.
         * @returns {Object} The value of the named property.
         */

        var propName,
            funcName,
            val;

        funcName = 'get' + attributeName.asStartUpper();
        if (TP.canInvoke(this, funcName)) {
            return this[funcName]();
        }

        //  support dot-separated access paths, as long as each member
        //  of the path can respond to get() or provide the value in
        //  question
        propName = attributeName;

        if (TP.regex.HAS_PERIOD.test(propName)) {
            propName = propName.slice(0, propName.indexOf('.'));

            //  call back in with first part of access path
            if (TP.notValid(val = this.get(propName))) {
                return val;
            }

            //  only continue if the result object can stay with the
            //  program :)
            if (TP.canInvoke(val, 'get')) {
                propName = propName.slice(propName.indexOf('.') + 1);
                return val.get(propName);
            }

            return;
        }

        if (TP.isDefined(val = this.at(attributeName))) {
            return val;
        }

        return this.$get(attributeName);
    };

    //  register with TIBET by hand
    this.get[TP.NAME] = 'get';
    this.get[TP.OWNER] = TP.PHash;
    this.get[TP.TRACK] = TP.INST_TRACK;
    this.get[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.get';

    //  ---
    //  getName
    //  ---

    this.getName = function() {

        /**
         * @method getName
         * @summary Returns the TP.NAME property of the receiver.
         * @returns {String} The value of the TP.NAME property.
         */

        return this[TP.NAME];
    };

    //  register with TIBET by hand
    this.getName[TP.NAME] = 'getName';
    this.getName[TP.OWNER] = TP.PHash;
    this.getName[TP.TRACK] = TP.INST_TRACK;
    this.getName[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.getName';

    //  ---
    //  getItems
    //  ---

    this.getItems = function() {

        /**
         * @method getItems
         * @summary Returns the items [key,value] of the receiver.
         * @returns {Array} An array containing the receiver's items.
         */

        var arr,
            keys,
            length,
            j;

        arr = TP.ac();

        keys = Object.keys(this.$$hash);
        length = keys.length;

        for (j = 0; j < length; j++) {
            arr.push(keys[j], this.$$hash[keys[j]]);
        }

        return arr;
    };

    //  register with TIBET by hand
    this.getItems[TP.NAME] = 'getItems';
    this.getItems[TP.OWNER] = TP.PHash;
    this.getItems[TP.TRACK] = TP.INST_TRACK;
    this.getItems[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.getItems';

    //  ---
    //  getKeys
    //  ---

    this.getKeys = function() {

        /**
         * @method getKeys
         * @summary Returns the unique keys of the receiver. NOTE for
         *     consistency with other getKeys() calls you should treat the
         *     returned array as a read-only object.
         * @returns {Array} An array containing the receiver's keys.
         */

        return Object.keys(this.$$hash);
    };

    //  register with TIBET by hand
    this.getKeys[TP.NAME] = 'getKeys';
    this.getKeys[TP.OWNER] = TP.PHash;
    this.getKeys[TP.TRACK] = TP.INST_TRACK;
    this.getKeys[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.getKeys';

    //  ---
    //  getParameters
    //  ---

    this.getParameters = function() {

        /**
         * @method getParameters
         * @summary Returns the receiver's parameters. For a TP.lang.Hash this
         *     returns the hash itself since a TP.lang.Hash is a valid parameter
         *     block in TIBET.
         * @returns {Object} A TP.lang.Hash, TP.sig.Request, or Object
         *     containing parameter data (typically).
         */

        return this;
    };

    //  register with TIBET by hand
    this.getParameters[TP.NAME] = 'getParameters';
    this.getParameters[TP.OWNER] = TP.PHash;
    this.getParameters[TP.TRACK] = TP.INST_TRACK;
    this.getParameters[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.getParameters';

    //  ---
    //  getSize
    //  ---

    this.getSize = function() {

        /**
         * @method getSize
         * @summary Returns the size of the receiver, which is the count of the
         *     keys stored in the hash.
         * @returns {Number} The size.
         */

        return Object.keys(this.$$hash).length;
    };

    //  register with TIBET by hand
    this.getSize[TP.NAME] = 'getSize';
    this.getSize[TP.OWNER] = TP.PHash;
    this.getSize[TP.TRACK] = TP.INST_TRACK;
    this.getSize[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.getSize';

    //  ---
    //  getTypeName
    //  ---

    this.getTypeName = function() {

        /**
         * @method getTypeName
         * @summary Returns the type name of the receiver.
         * @returns {String}
         */

        //  one of the few places we'll admit this :)
        return 'TP.PHash';
    };

    //  register with TIBET by hand
    this.getTypeName[TP.NAME] = 'getTypeName';
    this.getTypeName[TP.OWNER] = TP.PHash;
    this.getTypeName[TP.TRACK] = TP.INST_TRACK;
    this.getTypeName[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.getTypeName';

    //  ---
    //  getValues
    //  ---

    this.getValues = function() {

        /**
         * @method getValues
         * @summary Returns an array containing the values of the receiver.
         * @returns {Array} An array containing the receiver's values.
         */

        var arr,
            keys,
            length,
            j;

        arr = TP.ac();

        keys = Object.keys(this.$$hash);
        length = keys.length;

        for (j = 0; j < length; j++) {
            arr.push(this.$$hash[keys[j]]);
        }

        return arr;
    };

    //  register with TIBET by hand
    this.getValues[TP.NAME] = 'getValues';
    this.getValues[TP.OWNER] = TP.PHash;
    this.getValues[TP.TRACK] = TP.INST_TRACK;
    this.getValues[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.getValues';

    //  ---
    //  hasKey
    //  ---

    this.hasKey = function(aKey) {

        /**
         * @method hasKey
         * @summary Returns true if the receiver has a defined value for the
         *     key provided.
         * @param {String} aKey The key to test for.
         * @returns {Boolean} True if the key is defined.
         */

        // Nothing on Object.prototype, this should work.
        return Object.keys(this.$$hash).indexOf(aKey) !== -1;
    };

    //  register with TIBET by hand
    this.hasKey[TP.NAME] = 'hasKey';
    this.hasKey[TP.OWNER] = TP.PHash;
    this.hasKey[TP.TRACK] = TP.INST_TRACK;
    this.hasKey[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.hasKey';

    //  ---
    //  perform
    //  ---

    this.perform = function(aFunction) {

        /**
         * @method perform
         * @summary Performs the function with each item of the receiver.
         * @description Perform can be used as an alternative to constructing
         *     for loops to iterate over a collection.
         * @param {Function} aFunction A function which performs some action
         *     with each item.
         * @returns {Object} The receiver.
         */

        var j,
            keys,
            length,
            item;

        item = TP.ac();

        keys = Object.keys(this.$$hash);
        length = keys.length;

        for (j = 0; j < length; j++) {
            //  update iteration edge flags so our function can tell when
            //  its at the start/end of the overall collection
            aFunction.$first = j === 0 ? true : false;
            aFunction.$last = j === length - 1 ? true : false;

            item[0] = keys[j];
            item[1] = this.$$hash[keys[j]];

            if (aFunction(item, j) === TP.BREAK) {
                break;
            }
        }

        return this;
    };

    //  register with TIBET by hand
    this.perform[TP.NAME] = 'perform';
    this.perform[TP.OWNER] = TP.PHash;
    this.perform[TP.TRACK] = TP.INST_TRACK;
    this.perform[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.perform';

    //  ---
    //  removeKey
    //  ---

    this.removeKey = function(aKey) {

        /**
         * @method removeKey
         * @summary Removes the key specified (and its related value).
         * @param {Object} aKey The key to use for locating the value. Note this
         *     is usually a String, but could be any object with a valid
         *     toString method.
         * @returns {TP.PHash} The receiver.
         */

        //  we don't want to call delete on a non-existent property
        if (this.$$hash[aKey] === undefined) {
            return;
        }

        //  Make sure that the supplied key matches a property on our own
        //  self, not our prototype (which is TP.ObjectProto, so it has a
        //  few ;-) ).
        if (!TP.owns(this.$$hash, aKey)) {
            return;
        }

        delete this.$$hash[aKey];

        return this;
    };

    //  register with TIBET by hand
    this.removeKey[TP.NAME] = 'removeKey';
    this.removeKey[TP.OWNER] = TP.PHash;
    this.removeKey[TP.TRACK] = TP.INST_TRACK;
    this.removeKey[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.removeKey';

    //  ---
    //  $set
    //  ---

    this.$set = function(attributeName, attributeValue) {

        /**
         * @method $set
         * @summary Sets the property with the given name, adjusted for
         *     standard TIBET attribute prefixing rules as needed.
         * @param {String} attributeName The attribute name to set.
         * @param {Object} attributeValue The value to set.
         * @returns {Object} The value of the named property.
         */

        var name;

        if (TP.isDefined(this[attributeName])) {
            name = attributeName;
        } else {
            TP.ifWarn() ?
                TP.warn(TP.join(
                            TP.sc('Setting undeclared attribute: '),
                            TP.name(this), '.', attributeName,
                                ' (', TP.tname(this), ')',
                            TP.tname(this) === 'Window' ?
                                TP.sc(' -- Possible unbound function') :
                                ''),
                        TP.LOG) : 0;
        }

        try {
            this[name] = attributeValue;
        } catch (e) {
            return this.raise(
                    'TP.sig.InvalidOperation',
                    TP.ec(e, TP.join('Unable to set ', attributeValue,
                                    ' for key: ', attributeName)));
        }

        return this;
    };

    //  register with TIBET by hand
    this.$set[TP.NAME] = '$set';
    this.$set[TP.OWNER] = TP.PHash;
    this.$set[TP.TRACK] = TP.INST_TRACK;
    this.$set[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.$set';

    //  ---
    //  set
    //  ---

    this.set = function(attributeName, attributeValue) {

        /**
         * @method set
         * @summary Sets the value of the named attribute to the value
         *     provided. NOTE that this operates on the hash instance's
         *     properties, not its content. Use atPut for content.
         * @param {String} attributeName The attribute name to set.
         * @param {Object} attributeValue The value to set.
         * @returns {TP.lang.Hash} The receiver.
         */

        return this.$set(attributeName, attributeValue);
    };

    //  register with TIBET by hand
    this.set[TP.NAME] = 'set';
    this.set[TP.OWNER] = TP.PHash;
    this.set[TP.TRACK] = TP.INST_TRACK;
    this.set[TP.DISPLAY] = 'TP.PHash.' +
            TP.INST_TRACK + '.set';

    return this;
};

//  ------------------------------------------------------------------------

//  define the prototype's reference to properly show it's a prototype
TP.PHash.prototype.$$prototype = TP.PHash.prototype;

//  ------------------------------------------------------------------------

TP.hc = function() {

    /**
     * @method hc
     * @summary Constructs a simple hash (i.e. "dictionary"), which can be used
     *     to contain key/value pairs. This primitive version is limited to
     *     simple key, value, key, value vararg lists.
     * @param {Array} varargs A variable list of 0 to N elements to place in
     *     the hash.
     * @example Construct a TP.lang.Hash:
     *     <code>
     *          newHash = TP.hc('lname', 'Smith');
     *          <samp>{"lname":"Smith"}</samp>
     *     </code>
     * @returns {TP.lang.Hash} A new instance.
     */

    var dict,
        len,
        i;

    // If we get invoked on a PHash just return it like a noop.
    if (arguments[0] instanceof TP.PHash) {
        return arguments[0];
    }

    dict = new TP.PHash();
    len = arguments.length;

    for (i = 0; i < len; i = i + 2) {
        if (TP.notValid(arguments[i])) {
            return this.raise('TP.sig.InvalidKey');
        }
        dict.atPut(arguments[i], arguments[i + 1]);
    }

    return dict;
};

//  Note that we do *NOT* set up track & owner information for 'TP.hc' here.
//  This is the *primitive* hash type. 'TP.hc()' will get overlaid later in the
//  boot process to be a shortcut for creating a 'TP.lang.Hash' and we want all
//  of that to be 'clean'.

//  Make sure that we alias this over to a convenient 'primitive hash create'
//  call
TP.phc = TP.hc;

//  ------------------------------------------------------------------------
//  PROPERTY DESCRIPTOR
//  ------------------------------------------------------------------------

//  reusable ECMA property descriptor entries
TP.CONSTANT_DESCRIPTOR = {
    writable: false,
    configurable: false
};

TP.DEFAULT_DESCRIPTOR = {};

TP.HIDDEN_DESCRIPTOR = {
    enumerable: false,
    configurable: false
};

TP.HIDDEN_CONSTANT_DESCRIPTOR = {
    enumerable: false,
    writable: false,
    configurable: false
};

//  ------------------------------------------------------------------------

//  build the initial metadata and information containers
(function() {

    TP.sys.$$meta_types = TP.hc();
    TP.sys.$$meta_attributes = TP.hc();
    TP.sys.$$meta_methods = TP.hc();
    TP.sys.$$meta_owners = TP.hc();
    TP.sys.$$meta_pathinfo = TP.hc();

    TP.sys.$$metadata = TP.hc('types', TP.sys.$$meta_types,
                                'attributes', TP.sys.$$meta_attributes,
                                'methods', TP.sys.$$meta_methods,
                                'owners', TP.sys.$$meta_owners,
                                'pathinfo', TP.sys.$$meta_pathinfo);
}());

//  ------------------------------------------------------------------------

TP.objectGetMetadataName = function(anObject) {

    if (TP.notValid(anObject)) {
        return;
    }

    if (TP.isType(anObject)) {
        return anObject.getName();
    }

    if (TP.isMethod(anObject)) {
        return anObject[TP.OWNER].getName() + '_' +
            anObject[TP.TRACK] + '_' +
            anObject.getName();
    }

    return;
};

//  Manual method registration.
TP.objectGetMetadataName[TP.NAME] = 'objectGetMetadataName';
TP.objectGetMetadataName[TP.OWNER] = TP.sys;
TP.objectGetMetadataName[TP.TRACK] = TP.LOCAL_TRACK;
TP.objectGetMetadataName[TP.DISPLAY] = 'TP.objectGetMetadataName';
TP.objectGetMetadataName[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];
TP.objectGetMetadataName[TP.SOURCE_PATH] = TP.boot[TP.SOURCE_PATH];

//  ------------------------------------------------------------------------

TP.sys.addMetadata = function(targetType, anItem, itemClass, itemTrack) {

    /**
     * @method addMetadata
     * @summary Stores metadata about an object, typically a type or method,
     *     which is necessary to drive certain operations. The metadata is
     *     dynamic, keeping track of all operations affecting types and methods
     *     within the system so that runtime reflection data is accurate and
     *     available for storage/reuse.
     * @description TIBET provides a number of functions that are "unusual",
     *     shall we say, when it comes to JavaScript. Examples are dynamic
     *     autoloading (without require statements or other programmer
     *     intervention) and on-the-fly method inferencing.
     *
     *     To support these operations TIBET keeps information on the structure
     *     of the type hierarchy, which types implement various methods, what
     *     source file loaded an object, etc.
     * @param {TP.FunctionProto|TP.lang.RootObject} targetType The type object
     *     which owns this metadata.
     * @param {Object} anItem The actual object providing the source information
     *     for the metadata.
     * @param {String} itemClass The nature of the item being added. Valid
     *     values include TP.SUBTYPE, TP.METHOD, TP.ATTRIBUTE. Note that you can
     *     add instance metadata for some of these by combining them with
     *     TP.INST_*TRACK as the itemTrack parameter.
     * @param {String} itemTrack An optional track which provides data regarding
     *     properties (methods and attributes). Valid values include:
     *          TP.GLOBAL_TRACK
     *          TP.PRIMITIVE_TRACK
     *          TP.INST_TRACK
     *          TP.TYPE_TRACK
     *          TP.TYPE_LOCAL_TRACK
     */

    var iname,

        node,
        lpath,
        spath,

        tname,
        gname,

        owners,

        pathinfo,
        itemkey;

    // Need a name for metadata key.
    if (TP.notValid(iname = anItem[TP.NAME])) {
        return;
    }

    //  some things (most notably 'traited' methods) won't have a load node.
    /* eslint-disable no-extra-parens */
    if ((node = TP.boot[TP.LOAD_NODE])) {
    /* eslint-enable no-extra-parens */
        lpath = node.src || node.source || '';
        lpath = TP.boot.$uriInTIBETFormat(lpath);
    } else {
        lpath = '';
    }

    // source path is any path specified by the rollup logic, or the load path
    // if that value isn't found. that can happen if the bundle being loaded
    // didn't specify headers during the rollup processing.
    spath = TP.boot[TP.SOURCE_PATH] || lpath;

    switch (itemClass) {
        case TP.METHOD:

            anItem[TP.LOAD_NODE] = node;
            anItem[TP.LOAD_PATH] = lpath;
            anItem[TP.SOURCE_PATH] = spath;

            tname = targetType.getName();
            gname = tname + '_' + itemTrack + '_' + iname;

            if (TP.notValid(TP.sys.$$meta_methods.at(gname))) {
                TP.sys.$$meta_methods.atPut(gname, anItem);
                        /*
                        {'methodObj': anItem,
                            'lpath': lpath, 'spath': spath});
                        */

                //  owners are keyed by name and point to a vertical-bar
                //  separated list of one or more type names. these are
                //  tracked for all types so the inferencer can do type
                //  conversion checks regardless of whether the type is part
                //  of the kernel or not
                owners = TP.sys.$$meta_owners.at(iname);
                if (!owners) {
                    TP.sys.$$meta_owners.atPut(iname, tname);
                } else {
                    TP.sys.$$meta_owners.atPut(iname,
                        owners += TP.JOIN + tname);
                }
                /*
                if (!Array.isArray(owners)) {
                    owners = [];
                    TP.sys.$$meta_owners.atPut(iname, owners);
                }
                owners.push(tname);
                */
            }

            break;

        case TP.ATTRIBUTE:

            anItem[TP.LOAD_PATH] = lpath;
            anItem[TP.SOURCE_PATH] = spath;

            tname = targetType.getName();
            gname = tname + '_' + itemTrack + '_' + iname;

            if (TP.notValid(TP.sys.$$meta_attributes.at(gname))) {
                TP.sys.$$meta_attributes.atPut(gname, anItem);
                        /*
                        gname,
                        {'descriptorObj': anItem,
                            'lpath': lpath,
                            'spath': spath});
                        */

                //  If the item has a 'value' slot and the value there responds
                //  to 'isAccessPath' and is, in fact, an access path, then we
                //  register it in TP.sys.$$meta_pathinfo. This acts as a
                //  'reverse index' of access paths to aspect names.
                if (anItem.value &&
                    anItem.value.isAccessPath &&
                    anItem.value.isAccessPath()) {

                    //  Note here how we pass 'false' for the 'non verbose'
                    //  String representation of the path (that is, the version
                    //  that was actually authored by the user).
                    itemkey = anItem.value.asString(false);

                    pathinfo = TP.sys.$$meta_pathinfo.at(
                                            tname + '_' + itemTrack);
                    if (!pathinfo) {
                        pathinfo = {};

                        TP.sys.$$meta_pathinfo.atPut(
                                            tname + '_' + itemTrack,
                                            pathinfo);
                    }

                    if (!pathinfo[itemkey]) {
                        pathinfo[itemkey] = [];
                    }

                    pathinfo[itemkey].push(iname);
                }
            }

            break;

        case TP.SUBTYPE:

            anItem[TP.LOAD_NODE] = node;
            anItem[TP.LOAD_PATH] = lpath;
            anItem[TP.SOURCE_PATH] = spath;

            //  don't overlay information we've already collected
            if (TP.notValid(TP.sys.$$meta_types.at(iname))) {
                TP.sys.$$meta_types.atPut(iname, anItem);
                /*
                        iname,
                        {'typeObj': anItem, 'sname': sname,
                            'lpath': lpath, 'spath': spath});
                */
            }

            break;

        default:
            break;
    }

    return;
};

//  Manual method registration.
TP.sys.addMetadata[TP.NAME] = 'addMetadata';
TP.sys.addMetadata[TP.OWNER] = TP.sys;
TP.sys.addMetadata[TP.TRACK] = TP.LOCAL_TRACK;
TP.sys.addMetadata[TP.DISPLAY] = 'TP.sys.addMetadata';
TP.sys.addMetadata[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];
TP.sys.addMetadata[TP.SOURCE_PATH] = TP.boot[TP.SOURCE_PATH];

//  -----------------------------------------------------------------------
//  SLOT AND METHOD DEFINITION
//  -----------------------------------------------------------------------

TP.defineSlot = function(target, name, value, type, track, desc) {

    /**
     * @method defineSlot
     * @summary Defines a slot, which may be an attribute, method, etc.
     * @param {Object} target The object receiving the slot.
     * @param {String} name The slot name.
     * @param {Object} value The slot value.
     * @param {String} type The slot type (attribute, method, etc).
     * @param {String} track The slot track (type, inst, local, etc).
     * @param {Object} desc An ECMA5-ish property descriptor, notable for not
     *     having 'value', 'get' and 'set' slots like a real ECMA5 property
     *     descriptor would. NOTE that this object is _NOT_ passed to the ECMA5
     *     Object.defineProperty() call.
     * @returns {Object} The assigned slot value.
     */

    //  If we were handed a descriptor, then try to use ECMA5's defineProperty()
    //  call
    if (TP.isValid(desc)) {

        if (desc.writable === false && value !== undefined) {
            //  We send in a different object to make sure that if 'get' or
            //  'set' was defined on the supplied descriptor that it won't be
            //  forwarded. Note here that, since this slot is being configured
            //  as a 'constant', a value should've been supplied and we supply
            //  that to the defineProperty() call.
            Object.defineProperty(
                    target,
                    name,
                    {
                        writable: desc.writable !== false,
                        enumerable: desc.enumerable !== false,
                        configurable: desc.configurable !== false,
                        value: value
                    });
        } else {
            //  We send in a different object to make sure that if 'get' or
            //  'set' was defined on the supplied descriptor that it won't be
            //  forwarded.
            Object.defineProperty(
                    target,
                    name,
                    {
                        writable: desc.writable !== false,
                        enumerable: desc.enumerable !== false,
                        configurable: desc.configurable !== false
                    });

            //  Try to set the value if its real.
            if (value !== undefined) {
                target[name] = value;
            } else if (target[name] === undefined) {
                target[name] = null;
            }
        }
    } else {
        //  Otherwise, just try to set the value if its real.
        if (value !== undefined) {
            target[name] = value;
        } else if (target[name] === undefined) {
            target[name] = null;
        }
    }

    return target[name];
};

//  Manual method registration.
TP.defineSlot[TP.NAME] = 'defineSlot';
TP.defineSlot[TP.OWNER] = TP;
TP.defineSlot[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.defineSlot[TP.DISPLAY] = 'TP.defineSlot';
TP.defineSlot[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];
TP.defineSlot[TP.SOURCE_PATH] = TP.boot[TP.SOURCE_PATH];

//  ------------------------------------------------------------------------

TP.defineMethodSlot =
function(target, name, value, track, desc, display, owner) {

    /**
     * @method defineMethodSlot
     * @summary Defines a method, tracking all necessary metadata.
     * @param {Object} target The target object.
     * @param {String} name The method name.
     * @param {Object} value The method value (aka method 'body').
     * @param {String} track The method track (Inst, Type, Local). Default is
     *     TP.LOCAL_TRACK.
     * @param {Object} desc An optional 'property descriptor'. If a 'value' slot
     *     is supplied here, it is ignored in favor of the value parameter to
     *     this method.
     * @param {String} display The method display name. Defaults to the owner
     *     ID plus the track and name.
     * @param {Object} owner The owner object. Defaults to target.
     * @returns {Function} The newly defined method.
     */

    var own,
        trk,
        method,
        disp;

    own = TP.ifInvalid(owner, target);
    trk = TP.ifInvalid(track, TP.LOCAL_TRACK);

    if (!TP.isCallable(value) || !TP.isCallable(value.asMethod)) {

        //  If the value is TP.REQUIRED, then it isn't a method as such, but a
        //  placeholder to note that this method is required. This is normally
        //  used during traits multiple-inheritance composition.
        if (value === TP.REQUIRED) {

            TP.defineSlot(target, name, value, TP.METHOD, trk,
                    desc && desc.$$isPDC ? desc : TP.DEFAULT_DESCRIPTOR);

        } else {
            TP.ifError() ?
                TP.error('Invalid method body for ' +
                            'TP.defineMethodSlot: ' + name,
                            TP.LOG) : 0;
        }

        return;
    }

    //  Ensure metadata is attached along with owner/track etc.
    value.asMethod(own, name, trk, display);

    //  If the body of the function has a reference to methods that need
    //  'callee', then we have to wrap it into a wrapping function so that we
    //  can capture callee (arguments.callee is not valid in ECMA E5 strict
    //  mode). What a pain!
    //  Note that we do allow the method definer to set either 'noCalleePatch'
    //  to true which means that the system will definitely not install a patch,
    //  even if the RegExp passes or 'wantsCalleePatch' to true which forces the
    //  system to install a patch, even if the RegExp fails.
    /* eslint-disable no-extra-parens */
    if ((TP.NEEDS_CALLEE.test(value.toString()) && !value.noCalleePatch) ||
        value.wantsCalleePatch === true) {
    /* eslint-enable no-extra-parens */
        method = function() {
            var oldCallee,
                oldArgs,

                retVal;

            //  Capture the current values of callee and args - we might already
            //  be in a place where we're using them.
            oldCallee = TP.$$currentCallee$$;
            oldArgs = TP.$$currentArgs$$;

            //  Set the value of callee and args.
            TP.$$currentCallee$$ = value;
            TP.$$currentArgs$$ = arguments;

            //  Now, call the method
            retVal = value.apply(this, arguments);

            //  Restore the old values for callee and args
            TP.$$currentCallee$$ = oldCallee;
            TP.$$currentArgs$$ = oldArgs;

            return retVal;
        };

        //  Let's make sure we can get back to the original function here.
        method.$realFunc = value;

        //  So this is a little tricky. We've defined a patch function to 'stand
        //  in' for (and wrap a call to) our method. We do want to distinguish
        //  the real method from the erstaz for reflection purposes, so we tell
        //  the patch function to instrument itself with the name of the method
        //  it's standing in for but with a '$$calleePatch' suffix.
        method.asMethod(own, name + '$$calleePatch', trk, display);

        //  If the original 'display' argument was provided, that means that
        //  'asMethod()' won't have set the display name using the supplied
        //  'name' - which means we need to append '$$calleePatch' to the
        //  display name.
        if (TP.notEmpty(display)) {
            disp = method[TP.DISPLAY];
            method[TP.DISPLAY] = disp + '$$calleePatch';
        }

        //  We then go ahead and register that on the receiving object under
        //  that name as well. And then, NOTE BELOW: We will register this patch
        //  function as the method *UNDER THE REGULAR NAME* on the receiving
        //  object. Yes, that means that the patch function is registered under
        //  both names, but reflection will be able to distinguish between the
        //  two because it's instrumented itself with it's "real name" (the
        //  method name with the '$$calleePatch' suffix).
        TP.defineSlot(target, name + '$$calleePatch', method, TP.METHOD, trk,
                        TP.HIDDEN_DESCRIPTOR);
    } else {
        //  The normal (non-needs-callee) case. Everything is straightforward.
        method = value;
    }

    /* eslint-disable no-extra-parens */
    TP.defineSlot(target, name, method, TP.METHOD, trk,
            (desc && desc.$$isPDC ? desc : TP.DEFAULT_DESCRIPTOR));
    /* eslint-enable no-extra-parens */

    //  we don't wrap 'self' level methods so we need to patch on the load node
    //  manually. All others get it done via addMetadata.
    if (method[TP.OWNER] === self) {
        if (TP.notValid(TP.objectGetLoadNode(method))) {
            //  track the node we're loading from for reference
            TP.objectSetLoadNode(method, TP.boot[TP.LOAD_NODE]);
        }

        return method;
    }

    //  Don't track metadata for local properties.
    if (trk !== TP.LOCAL_TRACK) {
        TP.sys.addMetadata(own, value, TP.METHOD, trk);
    }

    return method;
};

//  Manual method registration.
TP.defineMethodSlot[TP.NAME] = 'defineMethodSlot';
TP.defineMethodSlot[TP.OWNER] = TP;
TP.defineMethodSlot[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.defineMethodSlot[TP.DISPLAY] = 'TP.defineMethodSlot';
TP.defineMethodSlot[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];
TP.defineMethodSlot[TP.SOURCE_PATH] = TP.boot[TP.SOURCE_PATH];

//  ------------------------------------------------------------------------

TP.defineMethodSlot(TP, 'definePrimitive',
function(name, bodyOrConditionals, desc, display, owner) {

    /**
     * @method definePrimitive
     * @summary Adds the method supplied as a 'primitive' to the 'TP' object
     *     under the name given.
     * @description Note that this method can take a variety of arguments in
     *     the 'methodBodyOrTests' parameter. If no sophisticated 'feature
     *     testing' is required, it can just take a Function in that parameter.
     *     Otherwise, it can take a hash of tests and the matching Functions
     *     that should be installed if the tests pass. See usages throughout
     *     the various primitives files in the system.
     * @param {String} name The name of the new primitive.
     * @param {Function|Object} bodyOrConditionals The actual function
     *     implementation or an object containing tests and associated
     *     implementations.
     * @param {Object} desc An optional 'property descriptor'. If a 'value' slot
     *     is supplied here, it is ignored in favor of the bodyOrConditionals
     *     parameter to this method.
     * @param {String} display The method display name. Defaults to the owner
     *     ID plus the track and name.
     * @param {Object} owner The owner object. Defaults to target.
     * @returns {Function} The installed primitive.
     */

    var test,
        key,
        method;

    if (!bodyOrConditionals) {
        TP.ifError() ?
            TP.error('Invalid method body or conditionals for ' +
                        'TP.definePrimitive: ' + name,
                        TP.LOG) : 0;
        return;
    }

    //  if we weren't handed a Function body, then we need to check what we
    //  were handed.
    if (!TP.isCallable(bodyOrConditionals)) {
        test = bodyOrConditionals.at('test');

        //  The test was a Function... execute it. It should return true or
        //  false. We convert that value to a String.
        if (TP.isCallable(test)) {
            key = '' + test();
        } else {
            //  When provided a string if it's a test name we run that test
            //  and get back either true or false, which presumably is the
            //  proper key for one of our method options below.
            if (typeof test === 'string' && TP.sys.hasFeatureTest(test)) {
                key = TP.sys.hasFeature(test);
            } else {
                //  If the test isn't a string, or isn't a known test name
                //  we'll just convert to string directly the cheap way.
                key = ('' + test).toLowerCase();
            }
        }

        //  Look up the method in the dictionary provided.
        method = bodyOrConditionals.at(key);
        if (typeof method === 'undefined') {
            //  If there's a TP.DEFAULT use that when the key isn't
            //  found in the dictionary.
            method = bodyOrConditionals.at(TP.DEFAULT);
        }
    } else {
        //  If the parameter _is_ a function we got the method already.
        method = bodyOrConditionals;
    }

    return TP.defineMethodSlot(
            TP, name, method, TP.PRIMITIVE_TRACK, desc, display, owner);

}, TP.PRIMITIVE_TRACK, null, 'TP.definePrimitive');

//  ------------------------------------------------------------------------
//  Object Testing
//  ------------------------------------------------------------------------

TP.definePrimitive('isDefined',
function(aValue) {

    /**
     * @method isDefined
     * @summary Returns false if the value passed in is undefined as opposed to
     *     null or valid. In other words, aValue is 'defined' if its got a
     *     value...even if that value is 'null'.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is defined:
     *     <code>
     *          if (TP.isDefined(anObj)) { TP.alert('its defined'); };
     *     </code>
     * @returns {Boolean} Whether or not the value is defined.
     */

    return aValue !== undefined;
}, false, 'TP.isDefined');

//  ------------------------------------------------------------------------

TP.definePrimitive('isNaN',
function(aValue) {

    /**
     * @method isNaN
     * @summary Returns true if the value provided is NaN.
     * @description The ECMAScript-supplied isNaN lies:
            isNaN({}) => true.
            Welcome to JavaScript. Oh...but it gets better. If you run isNaN
            on the wrong thing it'll throw an exception about being unable to
            convert to a primitive.
            Hence, this method.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is NaN:
     *     <code>
     *          if (TP.isNaN(anObj)) { TP.alert('its NaN'); };
     *     </code>
     * @returns {Boolean} Whether or not the value is NaN.
     */

    if (TP.isValid(aValue) &&
        isNaN(aValue) &&
        aValue.constructor === Number) {
        return true;
    }

    return false;
}, false, 'TP.isNaN');

//  ------------------------------------------------------------------------

TP.definePrimitive('isNull',
function(aValue) {

    /**
     * @method isNull
     * @summary Returns true if aValue is truly 'null' (ie. === null) rather
     *     than undefined or a non-null value.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is null:
     *     <code>
     *          if (TP.isNull(anObj)) { TP.alert('its null'); };
     *     </code>
     * @returns {Boolean} Whether or not the value is null.
     */

    return aValue === null;
}, false, 'TP.isNull');

//  ------------------------------------------------------------------------

TP.definePrimitive('notDefined',
function(aValue) {

    /**
     * @method notDefined
     * @summary Returns true if the value provided is undefined.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is not defined:
     *     <code>
     *          if (TP.notDefined(anObj)) { TP.alert('its not defined'); };
     *     </code>
     * @returns {Boolean} Whether or not the value is undefined.
     */

    return aValue === undefined;
}, false, 'TP.notDefined');

//  ------------------------------------------------------------------------

TP.definePrimitive('notNaN',
function(aValue) {

    /**
     * @method notNaN
     * @summary Returns true if the value provided is not NaN.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is not NaN:
     *     <code>
     *          if (TP.notNaN(anObj)) { TP.alert('its not NaN'); };
     *     </code>
     * @returns {Boolean} Whether or not the value is not NaN.
     */

    return !TP.isNaN(aValue);
}, false, 'TP.notNaN');

//  ------------------------------------------------------------------------

TP.definePrimitive('notNull',
function(aValue) {

    /**
     * @method notNull
     * @summary Returns true if the value provided is not null. Be aware, the
     *     value could be undefined and this method will return true. In cases
     *     where you want to test both you should use the *Valid variations.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is not null:
     *     <code>
     *          if (TP.notNull(anObj)) { TP.alert('its not null'); };
     *     </code>
     * @returns {Boolean} Whether or not the value is not null.
     */

    return aValue !== null;
}, false, 'TP.notNull');

//  ------------------------------------------------------------------------
//  Value-Based Branching
//  ------------------------------------------------------------------------

TP.definePrimitive('ifNull',
function(aSuspectValue, aDefaultValue) {

    /**
     * @method ifNull
     * @summary Returns either aSuspectValue or aDefaultValue based on the
     *     state of aSuspectValue. If aSuspectValue is TP.isNull() aDefaultValue
     *     is returned.
     * @param {Object} aSuspectValue The value to test.
     * @param {Object} aDefaultValue The value to return if aSuspectValue is ===
     *     null.
     * @example Set the value of theObj to true, if anObj is null:
     *     <code>
     *          theObj = TP.ifNull(anObj, true);
     *     </code>
     * @returns {Object} One of the two values provided.
     */

    /* eslint-disable no-extra-parens */
    return (aSuspectValue === null) ? aDefaultValue : aSuspectValue;
    /* eslint-enable no-extra-parens */
}, false, 'TP.ifNull');

//  ------------------------------------------------------------------------

TP.definePrimitive('ifUndefined',
function(aSuspectValue, aDefaultValue) {

    /**
     * @method ifUndefined
     * @summary Returns either aSuspectValue or aDefaultValue based on the
     *     state of aSuspectValue. If aSuspectValue is TP.notDefined()
     *     aDefaultValue is returned.
     * @param {Object} aSuspectValue The value to test.
     * @param {Object} aDefaultValue The value to return if aSuspectValue is ===
     *     undefined.
     * @example Set the value of theObj to true, if anObj is undefined:
     *     <code>
     *          theObj = TP.ifUndefined(anObj, true);
     *     </code>
     * @returns {Object} One of the two values provided.
     */

    /* eslint-disable no-extra-parens */
    return (aSuspectValue === undefined) ? aDefaultValue : aSuspectValue;
    /* eslint-enable no-extra-parens */
}, false, 'TP.ifUndefined');

//  ------------------------------------------------------------------------
//  TYPE CHECKS
//  ------------------------------------------------------------------------

TP.definePrimitive('isNode',
function(anObj) {

    /**
     * @method isNode
     * @summary Returns true if the object provided is a DOM node, regardless
     *     of whether it's in an HTML or XML DOM. This is a simple test for a
     *     valid nodeType property.
     * @param {Object} anObj The object to test.
     * @example Test what's a node and what's not:
     *     <code>
     *          TP.isNode(TP.documentGetBody(document)); // Elements are Nodes
     *          <samp>true</samp>
     *          TP.isNode(document); // So are documents
     *          <samp>true</samp>
     *          // So are attribute nodes
     *          TP.isNode(TP.documentGetBody(document).attributes[0]);
     *          <samp>true</samp>
     *          TP.isNode(window); // Windows are not
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is a Node.
     */

    return TP.isValid(anObj) && typeof anObj.nodeType === 'number';
}, false, 'TP.ifNode');

//  ------------------------------------------------------------------------

TP.definePrimitive('isNonFunctionConstructor',
function(anObj) {

    /**
     * @method isNonFunctionConstructor
     * @summary Returns whether or not the supplied object is a 'non Function'
     *     constructor. Host environments have constructors that are not
     *     Functions, but are faked by the platform.
     * @param {Object} anObj The object to test.
     * @returns {Boolean} Whether or not the supplied object is a non Function
     *     constructor object.
     */

    return TP.isValid(TP.getNonFunctionConstructorName(anObj));
}, false, 'TP.isNonFunctionConstructor');

//  ------------------------------------------------------------------------

TP.definePrimitive('getNonFunctionConstructorName',
function(anObj) {

    /**
     * @method getNonFunctionConstructorName
     * @summary Returns a name for a 'non Function' constructor. Host
     *     environments have constructors that are not Functions, but are faked
     *     by the platform. This function will return an appropriate name for
     *     them.
     * @param {Object} anObj The Object to return the name for.
     * @returns {String} The name for the supplied non-Function constructor
     *     object.
     */

    var exclusionList,
        list;

    if (anObj === null || anObj === undefined) {
        return;
    }

    if (TP.sys.$$nonFunctionConstructors) {
        return anObj.$$nonFunctionConstructorObjectName;
    }

    //  The object is created by non Function constructors and has an object
    //  name for us to use.

    //  We keep a pre-built list for reflection & other purposes.
    list = TP.sys.$$nonFunctionConstructors;
    if (TP.notValid(list)) {

        //  This must be the first time through - the list isn't built yet.

        list = [];

        //  These 4 objects will show up because of the algorithm we use to
        //  determine non-Function constructors. We filter for them.
        exclusionList = ['TP', 'APP', 'Infinity', 'NaN'];

        //  Define a silly slot on Function.prototype. This is how we'll test to
        //  see if a constructor 'Function' is *really* a Function.
        Function.prototype.fluffycat = 'fluffycat';

        //  Loop over all of the globals that were found in our startup
        //  sequence. Note that TP.sys.$nativeglobals gets redone as a
        //  TP.lang.Hash during system finalization, but at the point the first
        //  call to this method is made, it is still an Array.
        TP.sys.$nativeglobals.forEach(
                function(aProp) {
                    var obj;

                    //  If the property name matches what we think should be a
                    //  'native type name', then test it for being a
                    //  non-Function constructor.
                    if (TP.regex.NATIVE_TYPENAME.test(aProp)) {
                        obj = TP.global[aProp];

                        //  If the slot we defined on Function.prototype isn't
                        //  there and the property is:
                        //
                        //  - not in our exclusion list above
                        //  - it's not a slot corresponding to a Window (like
                        //  iframe Windows are)
                        //  - it's not a Number (believe it or not, on some
                        //  platforms, it will be... Chrome...)
                        //
                        //  then add both the object and the property name to
                        //  our list. This is how we get both the object
                        //  reference and the name that goes along with it.

                        //  Note that we put this in a try...catch to avoid
                        //  problems with some environments wanting to throw an
                        //  exception when accessing the slot that we placed on
                        //  Function.prototype. In that case, it's very likely
                        //  to be a non-Function constructor object, which means
                        //  we should add it to our list.
                        try {
                            if (!obj.fluffycat &&
                                exclusionList.indexOf(aProp) === TP.NOT_FOUND &&
                                !TP.isWindow(obj) &&
                                !TP.isNumber(obj)) {

                                //  Add it to the list and also instrument the
                                //  name onto the object so that we can use it
                                //  above.
                                list.push([obj, aProp]);
                                obj.$$nonFunctionConstructorObjectName = aProp;
                            }
                        } catch (e) {
                            //  Must've had a problem instrumenting the name
                            //  onto the object so just add it to the list.
                            list.push([obj, aProp]);
                        }
                    }
                });

        //  Make sure to remove our silly slot ;-).
        delete Function.prototype.fluffycat;

        //  Cache the list.
        TP.sys.$$nonFunctionConstructors = list;
    }

    return;
}, false, 'TP.getNonFunctionConstructorName');

//  ------------------------------------------------------------------------

TP.definePrimitive('isPlainObject',
function(anObj) {

    /**
     * @method isPlainObject
     * @summary Returns true if the object provided is a 'plain JavaScript
     *     Object' - that is, created via 'new Object()' or '{}'.
     * @param {Object} anObj The object to test.
     * @example Test what's a type and what's not:
     *     <code>
     *          anObj = new Object();
     *          TP.isPlainObject(anObj);
     *          <samp>true</samp>
     *          anObj = {};
     *          TP.isPlainObject(anObj);
     *          <samp>true</samp>
     *          anObj = true;
     *          TP.isPlainObject(anObj);
     *          <samp>false</samp>
     *          anObj = 42;
     *          TP.isPlainObject(anObj);
     *          <samp>false</samp>
     *          anObj = '';
     *          TP.isPlainObject(anObj);
     *          <samp>false</samp>
     *          anObj = [];
     *          TP.isPlainObject(anObj);
     *          <samp>false</samp>
     *          anObj = TP.lang.Object.construct();
     *          TP.isPlainObject(anObj);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is a Type.
     */

    //  Based on jQuery 2.X isPlainObject with additional checks for TIBET
    //  objects.

    if (anObj[TP.TYPE] ||
        typeof anObj !== 'object' ||
        anObj.nodeType ||
        TP.isWindow(anObj)) {
        return false;
    }

    if (anObj.constructor && !TP.ObjectProto.hasOwnProperty.call(
                                anObj.constructor.prototype,
                                'isPrototypeOf')) {
        return false;
    }

    return true;
}, false, 'TP.isPlainObject');

//  ------------------------------------------------------------------------

TP.definePrimitive('isType',
function(anObj) {

    /**
     * @method isType
     * @summary Returns true if the object provided acts as a Type/Class. To
     *     properly respond the object must have a META hash reference which
     *     TIBET adds for any object used as a type.
     * @param {Object} anObj The object to test.
     * @example Test what's a type and what's not:
     *     <code>
     *          anObj = TP.lang.Object.construct();
     *          TP.isType(anObj);
     *          <samp>false</samp>
     *          TP.isType(TP.lang.Object);
     *          <samp>true</samp>
     *
     *          TP.isType(Array);
     *          <samp>true</samp>
     *          TP.isType(self);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is a Type.
     */

    var name,
        tname;

    //  no type name? probably isn't a type... all TIBET types have this
    //  slot and all native JS types should at least see the one on Function.
    //  There is the problem of 'non Function' constructors... a few 'Host'
    //  constructors won't inherit from Function, so we check for those and
    //  return that value.
    if (TP.notValid(anObj) ||
        TP.notValid(tname = anObj[TP.TNAME]) ||
        tname === '') {
        return TP.isNonFunctionConstructor(anObj);
    }

    /* eslint-disable no-extra-parens */
    if ((anObj === Function) ||
                (TP.isValid(anObj[TP.TYPE]) &&
                (anObj[TP.TYPE] !== TP.FunctionProto[TP.TYPE]))) {
        return true;
    }
    /* eslint-enable no-extra-parens */

    //  native types are tricksy since they'll just say Function...we need
    //  their actual name to see if it starts with an uppercase character
    //  and we need to avoid instance names which all say Function*
    if (tname === 'Function') {
        //  owner and track can't be NONE, which implies a bound function
        if (anObj[TP.OWNER] === TP.NONE ||
            anObj[TP.TRACK] === TP.NONE) {
            return false;
        }

        //  methods have owners and tracks in TIBET
        if (anObj[TP.OWNER] && anObj[TP.TRACK]) {
            return false;
        }

        name = anObj.$getName();

        //  unfortunately our last option is a bit error prone, but we'll
        //  say types have to match a certain naming standard

        /* eslint-disable no-extra-parens */
        return (name.indexOf('Function' + TP.OID_PREFIX) !== 0) &&
                TP.regex.NATIVE_TYPENAME.test(name);
        /* eslint-enable no-extra-parens */
    }

    return false;
}, false, 'TP.isType');

//  ------------------------------------------------------------------------

TP.definePrimitive('isNativeFunction',
function(anObj) {

    /**
     * @method isNativeFunction
     * @summary Returns true if the object provided acts as a native (i.e.
     *     builtin) Function.
     * @param {Object} anObj The object to test.
     * @returns {Boolean} Whether or not the supplied object is a native
     *     Function (that is, one that is built into the browser).
     */

    return TP.regex.NATIVE_CODE.test(anObj.toString());

}, false, 'TP.isNativeFunction');

//  ------------------------------------------------------------------------

TP.definePrimitive('isNativeType',
function(anObj) {

    /**
     * @method isNativeType
     * @summary Returns true if the object provided is a native type for the
     *     current browser.
     * @description Because the browsers don't have a common set of types the
     *     results of this method may vary based on the browser in question.
     *     The results are consistent for the "big 8" and the major types which
     *     extend those 8 such as Event, but most HTML/DOM types will vary
     *     between implementations. By also checking for 'non Function'
     *     constructors here, we try to mitigate this problem.
     * @param {Object} anObj The object to test.
     * @returns {Boolean} Whether or not the supplied object is a native type
     *     (that is, one that is built into the browser).
     */

    //  Many 'native types' on Chrome will report as NaN using the standard
    //  isNaN() test - weird
    if (typeof anObj === 'number') {
        return false;
    }

    /* eslint-disable no-extra-parens */
    return ((TP.isFunction(anObj) || TP.isNonFunctionConstructor(anObj)) &&
                 TP.isType(anObj)) ||
            (anObj === Function);
    /* eslint-enable no-extra-parens */
}, false, 'TP.isNativeType');

//  ------------------------------------------------------------------------

TP.definePrimitive('isWindow',
function(anObj) {

    /**
     * @method isWindow
     * @summary Returns true if the object to be tested is a window.
     * @param {Object} anObj The object to test.
     * @example Test what's a window and what's not:
     *     <code>
     *          TP.isWindow(window)
     *          <samp>true</samp>
     *          anElem = document.createElement('iframe');
     *          TP.nodeAppendChild(TP.documentGetBody(document), anElem);
     *          TP.isWindow(TP.elementGetIFrameWindow(anElem));
     *          <samp>true</samp>
     *          TP.isWindow(document)
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is a frame.
     */

    /* eslint-disable no-extra-parens */
    return (TP.isValid(anObj) && anObj.moveBy !== undefined);
    /* eslint-enable no-extra-parens */
}, false, 'TP.isWindow');

//  ------------------------------------------------------------------------
//  PROTOTYPE TESTING
//  ------------------------------------------------------------------------

//  configure the native prototype objects so they will respond properly to
//  the TP.isPrototype() call

//  NB: We do *not* put this slot on TP.ObjectProto (as we try to keep slots off
//  of that object) and put a specific check for it in TP.isPrototype().
TP.ArrayProto.$$prototype = TP.ArrayProto;
TP.BooleanProto.$$prototype = TP.BooleanProto;
TP.DateProto.$$prototype = TP.DateProto;
TP.FunctionProto.$$prototype = TP.FunctionProto;
TP.NumberProto.$$prototype = TP.NumberProto;
TP.RegExpProto.$$prototype = TP.RegExpProto;
TP.StringProto.$$prototype = TP.StringProto;

//  ------------------------------------------------------------------------

TP.definePrimitive('isPrototype',
function(anObject) {

    /**
     * @method isPrototype
     * @summary Returns true if the object is being used as a prototypical
     *     instance within the constructor.prototype chain or within TIBET's
     *     inheritance mechanism.
     * @param {Object} anObject The object to test.
     * @returns {Boolean}
     */

    if (TP.isValid(anObject) &&
        TP.owns(anObject, '$$prototype') &&
        anObject.$$prototype === anObject) {

        return true;
    }

    return anObject === TP.ObjectProto;
}, false, 'TP.isPrototype');

//  ------------------------------------------------------------------------
//  MUTABILITY/REFERENCE
//  ------------------------------------------------------------------------

/*
JavaScript objects come in essentially four flavors: mutable/reference,
mutable/non-reference, non-mutable/reference, and non-mutable/non-reference.

Certain operations care very much whether an object is mutable, or of a
reference type, since it affects how properties related to those objects can
be managed. Unfortunately the JavaScript language isn't clear about allowing
an object to have a non-mutable _value_ but mutable _metadata_ so we have to
work around that in different browsers.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('isMutable',
function(anObj) {

    /**
     * @method isMutable
     * @summary Returns true if the object provided is mutable. NOTE that when
     *     testing the inverse (not mutable) you will get true values back for
     *     null/undefined so don't assume that a return value of true means it's
     *     a primitive string/number/boolean, it might also be a null/undefined
     *     value.
     * @description JavaScript has a number of non-mutable types, particularly
     *     Boolean, Number, and String (at least value-wise). This is important
     *     when trying to make decisions about whether a slot modification will
     *     succeed or fail.
     *     NOTE: Even though Function objects don't have 'official' properties
     *     that can be set, we consider them to be mutable, since custom
     *     properties can be set on them.
     * @param {Object} anObj The object to test.
     * @example Test what's mutable and what's not:
     *     <code>
     *          TP.isMutable(42);
     *          <samp>false</samp>
     *          TP.isMutable(true);
     *          <samp>false</samp>
     *          TP.isMutable('Hi there');
     *          <samp>false</samp>
     *          TP.isMutable(TP.fc('x = 2'));
     *          <samp>true</samp>
     *          TP.isMutable(TP.lang.Object.construct());
     *          <samp>true</samp>
     *          TP.isMutable(TP.ac());
     *          <samp>true</samp>
     *          TP.isMutable(TP.dc());
     *          <samp>true</samp>
     *          TP.isMutable(TP.rc());
     *          <samp>true</samp>
     *          TP.isMutable(TP.hc());
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is mutable.
     */

    if (TP.notValid(anObj)) {
        return false;
    }

    //  Strings, Numbers, Booleans are *not* mutable (but their prototypes are)

    if (typeof anObj.charAt === 'function' && anObj !== TP.StringProto ||
        typeof anObj.toPrecision === 'function' && anObj !== TP.NumberProto ||
        anObj === true ||
        anObj === false) {
        return false;
    }

    if (TP.isCallable(anObj.$$isMutable)) {
        return anObj.$$isMutable();
    }

    //  everything else is mutable
    return true;
}, false, 'TP.isMutable');

//  ------------------------------------------------------------------------

TP.definePrimitive('isReferenceType',
function(anObj) {

    /**
     * @method isReferenceType
     * @summary Returns true if the type provided is a reference type.
     * @description Reference types don't support copy-on-write semantics within
     *     the JS prototype system. This means certain operations need to "do
     *     the right thing" and make a copy when necessary. This is particularly
     *     apparent when working with TIBET attributes -- reference type
     *     attributes are normally initialized in the init() method while the
     *     others can be defined in the add*Attribute definition calls -- unless
     *     you truly want to share one attribute across all instances (or all
     *     subtypes).
     * @param {Object} anObj The object to test.
     * @example Test what's a reference type and what's not:
     *     <code>
     *          TP.isReferenceType(42);
     *          <samp>false</samp>
     *          TP.isReferenceType(true);
     *          <samp>false</samp>
     *          TP.isReferenceType('hi');
     *          <samp>false</samp>
     *          TP.isReferenceType(Date.now());
     *          <samp>false</samp>
     *          TP.isReferenceType(function() {alert('hi'));
     *          <samp>false</samp>
     *          TP.isReferenceType(/foo/);
     *          <samp>false</samp>
     *          TP.isReferenceType({});
     *          <samp>true</samp>
     *          TP.isReferenceType([]);
     *          <samp>true</samp>
     *          TP.isReferenceType(TP.lang.Object.construct());
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is a 'reference
     *     type'.
     */

    var type;

    if (TP.notValid(anObj)) {
        return false;
    }

    if (TP.isArray(anObj)) {
        return true;
    }

    if (TP.isType(anObj) && TP.isCallable(anObj.$$isReferenceType)) {
        return anObj.$$isReferenceType();
    }

    if (TP.isType(type = TP.type(anObj)) &&
        TP.isCallable(type.$$isReferenceType)) {
        return type.$$isReferenceType();
    }

    //  If it's not an Array and neither it or it's type can answer to
    //  '$$isReferenceType', then only return true if its a plain Object.
    return anObj.constructor === Object;
}, false, 'TP.isReferenceType');

//  ------------------------------------------------------------------------

TP.definePrimitive('genUUID',
function() {

    /**
     * @method genUUID
     * @summary Generates an RFC4122 version 4 UUID.
     * @description This solution courtesy of 'broofa' at:
     *      http://stackoverflow.com/questions/105034/
     *          how-to-create-a-guid-uuid-in-javascript
     * @returns {String} An RFC4122 version 4 compliant UUID
     */

    /* jshint bitwise:false */
    /* eslint-disable no-extra-parens */
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
            /[xy]/g,
            function(c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ?
                    r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
    /* eslint-enable no-extra-parens */
    /* jshint bitwise:true */
}, false, 'TP.genUUID');

//  ------------------------------------------------------------------------
//  PERFORMANCE TRACKING
//  ------------------------------------------------------------------------

/*
We want plenty of options for tuning TIBET performance over time and the
first requirement in tuning TIBET is having real data on performance. The
TP.sys.$statistics collection holds the data collected.
*/

if (TP.notValid(TP.sys.$statistics)) {
    /* jshint -W010 */
    /* eslint-disable no-new-object */
    TP.sys.$statistics = new Object();
    /* eslint-enable no-new-object */
    /* jshint +W010 */
}

//  ------------------------------------------------------------------------
//  Function/Method Enhancements
//  ------------------------------------------------------------------------

TP.definePrimitive('isMethod',
function(anObject) {

    /**
     * @method isMethod
     * @summary Returns true if the object provided is a method on some object.
     * @param {Object} anObject The object to test.
     * @returns {Boolean} Whether or not the supplied object is a method.
     */

    //  methods have owners and tracks in TIBET so those need to be present
    if (TP.notValid(anObject) ||
        TP.notValid(anObject[TP.OWNER]) ||
        TP.notValid(anObject[TP.TRACK])) {
        return false;
    }

    //  owner and track can't be NONE, which implies a bound function
    if (anObject[TP.OWNER] === TP.NONE || anObject[TP.TRACK] === TP.NONE) {
        return false;
    }

    //  if owner/track are valid is it callable? then it's a method as long
    //  as we don't trip over a native type
    return TP.isCallable(anObject) && !TP.isType(anObject);
}, false, 'TP.isMethod');

//  ------------------------------------------------------------------------

TP.defineMethodSlot(TP.sys, 'shouldLogCodeChanges',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogCodeChanges
     * @summary Controls and returns the state of the 'log changes' flag.
     * @description This flag determines whether changes which are logged for
     *     altering TIBET code are stored. This flag is central to the IDE and
     *     inferencer processing which can generate code to upgrade your
     *     application and save it for later use.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to log changes:
     *     <code>
     *          TP.sys.shouldLogCodeChanges(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs changes in the system.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.code_changes', aFlag, shouldSignal);
    }

    return TP.sys.cfg('log.code_changes');
}, TP.LOCAL_TRACK, null, 'TP.sys.shouldLogCodeChanges');

//  ------------------------------------------------------------------------

TP.defineMethodSlot(TP.sys, '$$shouldConstructDNUs',
function(aFlag, shouldSignal) {

    /**
     * @method $$shouldConstructDNUs
     * @summary Controls and returns the state of the 'construct DNU' flag.
     * @description This flag determines whether TIBET generates top-level
     *     DoesNotUnderstand catch methods. This flag is not intended for public
     *     use. It's off during early kernel loading and turned on near the end
     *     of kernel load. It should be left on during your application
     *     execution.
     * @param {Boolean} aFlag Turn behavior on or off? Default is true.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to not construct DNUs:
     *     <code>
     *          TP.sys.$$shouldConstructDNUs(false);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET should construct DNUs.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('tibet.$$construct_dnus', aFlag, shouldSignal);
    }

    return TP.sys.cfg('tibet.$$construct_dnus');
}, TP.LOCAL_TRACK, null, 'TP.sys.$$shouldConstructDNUs');

//  -----------------------------------------------------------------------
//  Native Types - PROPERTY CREATION SUPPORT
//  ------------------------------------------------------------------------

//  Create 'stub' objects that will act as the '.Type' and '.Inst' objects for
//  native types. These are created automatically for TIBET types (i.e.
//  instances of TP.lang.RootObject and its subtypes), but we have to patch them
//  onto the natives. They contain definitions of 'defineMethod()',
//  'defineAttribute()', 'defineConstant()', 'get()' and 'set()' that install
//  those kinds of properties onto the correct target with the correct owner and
//  track.

/* jshint -W054 */
/* eslint-disable no-new-func,one-var,vars-on-top */
var NativeTypeStub = new Function();
NativeTypeStub.prototype = {};
/* eslint-enable no-new-func,one-var,vars-on-top */
/* jshint +W054 */

//  ---

NativeTypeStub.prototype.get =
function(attributeName) {

    /**
     * @method get
     * @summary Returns the value, if any, for the attribute provided.
     * @param {String|TP.core.AccessPath} attributeName The name of the
     *     attribute to get.
     * @returns {Object} The value of the attribute on the receiver.
     */

    return this.$$target.get(attributeName);
};

//  ---

NativeTypeStub.prototype.defineAttribute =
function(attributeName, attributeValue) {

    /**
     * @method defineAttribute
     * @summary Adds the attribute with name and value provided as a type
     *     attribute.
     * @param {String} attributeName The attribute name.
     * @param {Object} attributeValue The attribute value or a property
     *     descriptor object.
     * @returns {Object} The newly defined attribute value.
     */

    return TP.defineAttributeSlot(
            this.$$target, attributeName, attributeValue,
            TP.TYPE_TRACK, this[TP.OWNER]);
};

//  ---

NativeTypeStub.prototype.defineConstant =
function(constantName, constantValue) {

    /**
     * @method defineConstant
     * @summary Adds/defines a new type constant for the receiver.
     * @param {String} constantName The constant name.
     * @param {Object} constantValue The constant value or a property descriptor
     *     object.
     * @returns {Object} The newly defined constant value.
     */

    return TP.defineConstantSlot(
            this.$$target, constantName, constantValue,
            TP.TYPE_TRACK, this[TP.OWNER]);
};

//  ---

NativeTypeStub.prototype.defineMethod =
function(methodName, methodBody, desc) {

    /**
     * @method defineMethod
     * @summary Adds the function with name and body provided as a type method.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Object} desc An optional 'property descriptor'. If a 'value' slot
     *     is supplied here, it is ignored in favor of the methodBody parameter
     *     to this method.
     * @returns {Object} The receiver.
     */

    return TP.defineMethodSlot(
            this.$$target, methodName, methodBody, TP.TYPE_TRACK,
            desc, null, this[TP.OWNER]);
};

//  ---

NativeTypeStub.prototype.set =
function(attributeName, attributeValue, shouldSignal) {

    /**
     * @method set
     * @summary Sets the value of the named attribute to the value provided. If
     *     no value is provided the value null is used.
     * @param {String|TP.core.AccessPath} attributeName The name of the
     *     attribute to set.
     * @param {Object} attributeValue The value to set.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {Object} The receiver.
     */

    return this.$$target.set(attributeName, attributeValue, shouldSignal);
};

//  ---
//  Reflection methods
//  ---

NativeTypeStub.prototype.getMethod =
function(aName, aTrack) {

    /**
     * @method getMethod
     * @summary Returns the named method, if it exists.
     * @param {String} aName The method name to locate.
     * @param {String} aTrack The track to locate the method on. This is an
     *     optional parameter.
     * @returns {Function} The Function object representing the method.
     */

    return TP.method(this.$$target, aName, TP.ifEmpty(aTrack, TP.TYPE_TRACK));
};

//  ---

NativeTypeStub.prototype.getMethods =
function(aTrack) {

    /**
     * @method getMethods
     * @summary Returns an Array of methods for the receiver.
     * @param {String} aTrack The track to locate the methods on. This is an
     *     optional parameter.
     * @returns {Array} An Array of Function objects representing the methods.
     */

    return TP.methods(this.$$target, TP.ifEmpty(aTrack, TP.TYPE_TRACK));
};

//  ---

NativeTypeStub.prototype.getMethodInfoFor =
function(methodName) {

    /**
     * @method getMethodInfoFor
     * @summary Returns information for the method with the supplied name on
     *     the receiver.
     * @description This method returns a TP.lang.Hash containing the method
     *     owner, name, track and display, under the keys 'owner', 'name',
     *     'track' and 'display', respectively
     * @param {String} aName The method name to return method information for.
     * @returns {TP.lang.Hash} The hash containing the method information as
     *     described in the method comment.
     */

    var existingMethod;

    if (!TP.isMethod(existingMethod = this.getMethod(methodName))) {
        return null;
    }

    return TP.hc('owner', existingMethod[TP.OWNER],
                    'name', methodName,
                    'track', existingMethod[TP.TRACK],
                    'display', existingMethod[TP.DISPLAY]);
};

//  ---
//  Testing methods
//  ---

NativeTypeStub.prototype.describe =
function(suiteName, suiteFunc) {

    /**
     * @method describe
     * @summary Adds a new test suite definition to an object. When the suite
     *     name matches a method name that suite is automatically associated
     *     with the specific method.
     * @param {String} suiteName The name of the new test suite. Should be
     *     unique to the particular receiver. If this matches a method name the
     *     suite is associated with that method.
     * @param {Function} suiteFunc The function representing the test suite.
     *     Should contain at least one call to 'this.it', the test case
     *     definition method on TP.test.Suite.
     */

    return TP.test.Suite.addSuite(this.$$target, suiteName, suiteFunc);
};

//  ---

NativeTypeStub.prototype.getTestFixture =
function() {

    /**
     * Creates and returns test fixture data suitable for the receiver. This
     * method is used to produce "the object under test" for test cases that
     * target the receiver. The default is the receiver itself.
     * @returns {Object} A test fixture for the receiver.
     */

    return this.$$target;
};

//  ---

NativeTypeStub.prototype.getTestSuites =
function(options) {

    /**
     * Returns the dictionary containing test suites for the receiver.
     * @param {TP.lang.Hash} options A dictionary of test options.
     * @returns {TP.lang.Hash} A hash keyed by the receiver's ID.
     */

    return TP.test.Suite.getTargetSuites(this.$$target, options);
};

//  ---

NativeTypeStub.prototype.runTestSuites =
function(options) {

    /**
     * Runs the test suites associated with the receiver. Options which help
     * configure and control the testing process can be provided.
     * @param {TP.lang.Hash} options A dictionary of test options.
     * @returns {Promise} A Promise to be used as necessary.
     */

    return TP.test.Suite.runTargetSuites(this.$$target, options);
};

//  ---

Array.Type = new NativeTypeStub();
Array.Type.$$target = Array;
Array.Type[TP.OWNER] = Array;

Boolean.Type = new NativeTypeStub();
Boolean.Type.$$target = Boolean;
Boolean.Type[TP.OWNER] = Boolean;

Date.Type = new NativeTypeStub();
Date.Type.$$target = Date;
Date.Type[TP.OWNER] = Date;

Function.Type = new NativeTypeStub();
Function.Type.$$target = Function;
Function.Type[TP.OWNER] = Function;

Number.Type = new NativeTypeStub();
Number.Type.$$target = Number;
Number.Type[TP.OWNER] = Number;

Object.Type = new NativeTypeStub();
Object.Type.$$target = Object;
Object.Type[TP.OWNER] = Object;

RegExp.Type = new NativeTypeStub();
RegExp.Type.$$target = RegExp;
RegExp.Type[TP.OWNER] = RegExp;

String.Type = new NativeTypeStub();
String.Type.$$target = String;
String.Type[TP.OWNER] = String;

Window.Type = new NativeTypeStub();
Window.Type.$$target = Window;
Window.Type[TP.OWNER] = Window;

//  ---

/* jshint -W054 */
/* eslint-disable no-new-func,one-var,vars-on-top */
var NativeInstStub = new Function();
NativeInstStub.prototype = {};
/* eslint-enable no-new-func,one-var,vars-on-top */
/* jshint +W054 */

//  ---

NativeInstStub.prototype.get =
function(attributeName) {

    /**
     * @method get
     * @summary Returns the value, if any, for the attribute provided.
     * @param {String|TP.core.AccessPath} attributeName The name of the
     *     attribute to get.
     * @returns {Object} The value of the attribute on the receiver.
     */

    return this.$$target.get(attributeName);
};

//  ---

NativeInstStub.prototype.defineAttribute =
function(attributeName, attributeValue) {

    /**
     * @method defineAttribute
     * @summary Adds the attribute with name and value provided as an instance
     *     attribute.
     * @param {String} attributeName The attribute name.
     * @param {Object} attributeValue The attribute value or a property
     *     descriptor object.
     * @returns {Object} The newly defined attribute value.
     */

    return TP.defineAttributeSlot(
            this.$$target, attributeName, attributeValue,
            TP.INST_TRACK, this[TP.OWNER]);
};

//  ---

NativeInstStub.prototype.defineConstant =
function(constantName, constantValue) {

    /**
     * @method defineConstant
     * @summary Adds/defines a new type constant for the receiver.
     * @param {String} constantName The constant name.
     * @param {Object} constantValue The constant value or a property descriptor
     *     object.
     * @returns {Object} The newly defined constant value.
     */

    return TP.defineConstantSlot(
            this.$$target, constantName, constantValue,
            TP.INST_TRACK, this[TP.OWNER]);
};

//  ---

NativeInstStub.prototype.defineMethod =
function(methodName, methodBody, desc) {

    /**
     * @method defineMethod
     * @summary Adds the function with name and body provided as an instance
     *     method.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Object} desc An optional 'property descriptor'. If a 'value' slot
     *     is supplied here, it is ignored in favor of the methodBody parameter
     *     to this method.
     * @returns {Object} The receiver.
     */

    return TP.defineMethodSlot(
            this.$$target, methodName, methodBody, TP.INST_TRACK,
            desc, null, this[TP.OWNER]);
};

//  ---

NativeInstStub.prototype.set =
function(attributeName, attributeValue, shouldSignal) {

    /**
     * @method set
     * @summary Sets the value of the named attribute to the value provided. If
     *     no value is provided the value null is used.
     * @param {String|TP.core.AccessPath} attributeName The name of the
     *     attribute to set.
     * @param {Object} attributeValue The value to set.
     * @param {Boolean} shouldSignal If false no signaling occurs. Defaults to
     *     this.shouldSignalChange().
     * @returns {Object} The receiver.
     */

    return this.$$target.set(attributeName, attributeValue, shouldSignal);
};

//  ---
//  Reflection methods
//  ---

NativeInstStub.prototype.getMethod =
function(aName, aTrack) {

    /**
     * @method getMethod
     * @summary Returns the named method, if it exists.
     * @param {String} aName The method name to locate.
     * @param {String} aTrack The track to locate the method on. This is an
     *     optional parameter.
     * @returns {Function} The Function object representing the method.
     */

    return TP.method(this.$$target, aName, TP.ifEmpty(aTrack, TP.INST_TRACK));
};

//  ---

NativeInstStub.prototype.getMethods =
function(aTrack) {

    /**
     * @method getMethods
     * @summary Returns an Array of methods for the receiver.
     * @param {String} aTrack The track to locate the methods on. This is an
     *     optional parameter.
     * @returns {Array} An Array of Function objects representing the methods.
     */

    return TP.methods(this.$$target, TP.ifEmpty(aTrack, TP.INST_TRACK));
};

//  ---

NativeInstStub.prototype.getMethodInfoFor =
function(methodName) {

    /**
     * @method getMethodInfoFor
     * @summary Returns information for the method with the supplied name on
     *     the receiver.
     * @description This method returns a TP.lang.Hash containing the method
     *     owner, name, track and display, under the keys 'owner', 'name',
     *     'track' and 'display', respectively
     * @param {String} aName The method name to return method information for.
     * @returns {TP.lang.Hash} The hash containing the method information as
     *     described in the method comment.
     */

    var existingMethod;

    if (!TP.isMethod(existingMethod = this.getMethod(methodName))) {
        return null;
    }

    return TP.hc('owner', existingMethod[TP.OWNER],
                    'name', methodName,
                    'track', existingMethod[TP.TRACK],
                    'display', existingMethod[TP.DISPLAY]);
};

//  ---
//  Testing methods
//  ---

NativeInstStub.prototype.describe =
function(suiteName, suiteFunc) {

    /**
     * @method describe
     * @summary Adds a new test suite definition to an object. When the suite
     *     name matches a method name that suite is automatically associated
     *     with the specific method.
     * @param {String} suiteName The name of the new test suite. Should be
     *     unique to the particular receiver. If this matches a method name the
     *     suite is associated with that method.
     * @param {Function} suiteFunc The function representing the test suite.
     *     Should contain at least one call to 'this.it', the test case
     *     definition method on TP.test.Suite.
     */

    return TP.test.Suite.addSuite(this.$$target, suiteName, suiteFunc);
};

//  ---

NativeInstStub.prototype.getTestFixture =
function() {

    /**
     * Creates and returns test fixture data suitable for the receiver. This
     * method is used to produce "the object under test" for test cases that
     * target the receiver. The default is the receiver itself.
     * @returns {Object} A test fixture for the receiver.
     */

    return this.$$target;
};

//  ---

NativeInstStub.prototype.getTestSuites =
function(options) {

    /**
     * Returns the dictionary containing test suites for the receiver.
     * @param {TP.lang.Hash} options A dictionary of test options.
     * @returns {TP.lang.Hash} A hash keyed by the receiver's ID.
     */

    return TP.test.Suite.getTargetSuites(this.$$target, options);
};

//  ---

NativeInstStub.prototype.runTestSuites =
function(options) {

    /**
     * Runs the test suites associated with the receiver. Options which help
     * configure and control the testing process can be provided.
     * @param {TP.lang.Hash} options A dictionary of test options.
     * @returns {Promise} A Promise to be used as necessary.
     */

    return TP.test.Suite.runTargetSuites(this.$$target, options);
};

//  ---

Array.Inst = new NativeInstStub();
Array.Inst.$$target = TP.ArrayProto;
Array.Inst[TP.OWNER] = Array;

Boolean.Inst = new NativeInstStub();
Boolean.Inst.$$target = TP.BooleanProto;
Boolean.Inst[TP.OWNER] = Boolean;

Date.Inst = new NativeInstStub();
Date.Inst.$$target = TP.DateProto;
Date.Inst[TP.OWNER] = Date;

Function.Inst = new NativeInstStub();
Function.Inst.$$target = TP.FunctionProto;
Function.Inst[TP.OWNER] = Function;

Number.Inst = new NativeInstStub();
Number.Inst.$$target = TP.NumberProto;
Number.Inst[TP.OWNER] = Number;

//  NB: We do *not* make a '.Inst' for Object and expose the Object prototype
//  here as we do not want to encourage putting things on Object.prototype

RegExp.Inst = new NativeInstStub();
RegExp.Inst.$$target = TP.RegExpProto;
RegExp.Inst[TP.OWNER] = RegExp;

String.Inst = new NativeInstStub();
String.Inst.$$target = TP.StringProto;
String.Inst[TP.OWNER] = String;

Window.Inst = new NativeInstStub();
Window.Inst.$$target = Window.prototype;
Window.Inst[TP.OWNER] = Window;

//  -----------------------------------------------------------------------
//  TP.lang.RootObject - SUBTYPE CREATION SUPPORT - PART I
//  ------------------------------------------------------------------------

//  Some very early definitions of TP.lang.RootObject so that
//  TP.defineMetaInstMethod() below will work. The rest of the definition of
//  TP.lang.RootObject is in TIBETInheritance.js

//  ------------------------------------------------------------------------
//  Native Type Extensions
//  ------------------------------------------------------------------------

TP.defineMethodSlot(TP.FunctionProto, '$constructPrototype',
function() {

    /**
     * @method $constructPrototype
     * @summary Returns a new prototype constructed by invoking the receiver as
     *     a constructor.
     * @description This method is used exclusively to construct prototype
     *     instances which are used to fill in the inheritance tree. You don't
     *     normally need to override this method since the add*Method() and
     *     add*Attribute() methods configure the prototypes properly for the
     *     majority of cases.
     * @returns {Object}
     */

    var name,
        newinst;

    //  get the name
    name = this.$getName();

    newinst = new this();

    //  set the ID so it marks this object as a prototype (inst or type)
    newinst[TP.ID] = name.strip(/\$\$/) + TP.PROTOTYPE;

    //  TODO:   validate this. Seems a bit suspect since it'll create a circular
    //  reference for things like copy and asString output.
    newinst.$$prototype = newinst;

    return newinst;
}, TP.INST_TRACK, null, 'Function.Inst.$constructPrototype', Function);

//  ------------------------------------------------------------------------
//  TP.lang - BOOTSTRAP DEFINITION
//  ------------------------------------------------------------------------

//  The core TIBET namespace.
TP.defineNamespace('lang', 'TP');

//  We define the 'meta' namespace as a unique namespace where TIBET types are
//  placed and can be referenced. Types will return the 'meta' namespace as part
//  of their 'getTypeName()' call (i.e. 'TP.meta.lang.Object'). As each type is
//  defined, a reference to it is placed on the 'meta' namespace.
TP.defineNamespace('meta', 'TP');

//  ------------------------------------------------------------------------
//  TP.lang.RootObject - BOOTSTRAP DEFINITION
//  ------------------------------------------------------------------------

/*
Set up top of the inheritance tree. TIBET uses a metatype system of sorts
that allows types to inherit behavior in the same fashion instances normally
would. In fact, TIBET types ARE instances -- of type instance constructors
that work in their own inheritance hierarchy. The top of that tree is
TP.lang.RootObject and its components. TP.lang.Object is the root of the
main tree but notice that you can have other trees.
*/

//  NB: We don't want closures here...
/* jshint -W054 */
/* eslint-disable no-new-func */
TP.lang.RootObject$$Type = new Function();
TP.lang.RootObject$$Inst = new Function();
/* eslint-enable no-new-func */
/* jshint +W054 */

TP.lang.RootObject$$Type.prototype = Object.$constructPrototype();
TP.lang.RootObject$$Inst.prototype = Object.$constructPrototype();

TP.lang.RootObject$$Type[TP.NAME] = 'TP.lang.RootObject$$Type';
TP.lang.RootObject$$Inst[TP.NAME] = 'TP.lang.RootObject$$Inst';

TP.lang.RootObject = new TP.lang.RootObject$$Type();

TP.lang.RootObject$$Type[TP.OWNER] = TP.lang.RootObject;
TP.lang.RootObject$$Inst[TP.OWNER] = TP.lang.RootObject;

//  identification of the prototype instances
TP.lang.RootObject$$Type.prototype[TP.ID] = 'TypePrototype';
TP.lang.RootObject$$Inst.prototype[TP.ID] = 'InstPrototype';

//  hook to the type object at the root of the TIBET type chain
TP.lang.RootObject$$Inst.prototype[TP.TYPE] = TP.lang.RootObject;

//  note that we root this at Object manually
TP.lang.RootObject[TP.TYPE] = TP.lang.RootObject;
TP.lang.RootObject[TP.TYPEC] = TP.lang.RootObject$$Type;
TP.lang.RootObject[TP.INSTC] = TP.lang.RootObject$$Inst;
TP.lang.RootObject[TP.TNAME] = 'TP.lang.RootObject';
TP.lang.RootObject[TP.RNAME] = 'TP.lang.RootObject';
TP.lang.RootObject[TP.SUPER] = Object;
TP.lang.RootObject[TP.SNAME] = 'Object';
TP.lang.RootObject[TP.NAME] = 'TP.lang.RootObject';
TP.lang.RootObject[TP.ID] = 'TP.lang.RootObject';
TP.lang.RootObject[TP.ANCESTOR_NAMES] = ['Object'];
TP.lang.RootObject[TP.ANCESTORS] = [Object];

TP.lang.RootObject.nsRoot = 'TP';
TP.lang.RootObject.nsPrefix = 'lang';
TP.lang.RootObject.localName = 'RootObject';

TP.lang.RootObject.Type = TP.lang.RootObject[TP.TYPEC].prototype;
TP.lang.RootObject.Type[TP.OWNER] = TP.lang.RootObject;
TP.lang.RootObject.Inst = TP.lang.RootObject[TP.INSTC].prototype;
TP.lang.RootObject.Inst[TP.OWNER] = TP.lang.RootObject;

//  -----------------------------------------------------------------------
//  EXTERNAL LIBRARY SUPPORT
//  -----------------------------------------------------------------------

TP.defineNamespace('extern', 'TP');

//  -----------------------------------------------------------------------
//  TP Primitives
//  ------------------------------------------------------------------------

TP.definePrimitive('defineGlobalMethod',
function(methodName, methodBody) {

    /**
     * @method defineGlobalMethod
     * @summary Adds the method with name and body provided as a global
     *     method.
     * @description Global methods are methods on the "Global" object, which
     *     means they overlap with Window methods. For that reason there are
     *     some sanity checks that can be performed to help avoid issues when
     *     overriding a Window method.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @returns {Function} The installed method.
     */

    var method;

    method = TP.defineMethodSlot(
            TP.global, methodName, methodBody,
            TP.GLOBAL_TRACK, null, 'TP.global.' + methodName);

    // TODO: verify this is correct.
    TP.sys.defineGlobal(methodName, method, true);

    return method;
}, false, 'TP.defineGlobalMethod');

//  ------------------------------------------------------------------------

TP.definePrimitive('defineMetaTypeMethod',
function(methodName, methodBody) {

    /**
     * @method defineMetaTypeMethod
     * @summary Adds the method with name and body provided as a 'meta type'
     *     method.
     * @description Meta type methods are methods on the native constructor
     *     Functions objects which provide polymorphic behavior system-wide.
     *     Rather than place these methods on Function.prototype, we place them
     *     on the other 'core' system constructor objects (as listed in the
     *     TP.META_TYPE_TARGETS array).
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @returns {null}
     */

    var i,
        target,

        existingMethod;

    //  First, we register it with TP.META_TYPE_OWNER's 'meta_methods'
    //  dictionary for easier reflection.
    TP.META_TYPE_OWNER.meta_methods[methodName] = methodBody;

    //  Then, loop over the TP.META_TYPE_TARGETS and install the method
    for (i = 0; i < TP.META_TYPE_TARGETS.length; i++) {
        target = TP.META_TYPE_TARGETS[i];

        //  If the method already exists and it's owner is *not*
        //  TP.META_TYPE_OWNER, then it was installed by a 'more specific'
        //  method install method and we leave that version alone.
        if (TP.isMethod(existingMethod = target[methodName]) &&
            existingMethod[TP.OWNER] !== TP.META_TYPE_OWNER) {
            continue;
        }

        TP.defineMethodSlot(
                target,
                methodName,
                methodBody,
                TP.META_TYPE_TRACK,
                null,
                target[TP.ID] + '.' + TP.META_TYPE_TRACK + '.' + methodName,
                TP.META_TYPE_OWNER);
    }

    return null;
}, false, 'TP.defineMetaTypeMethod');

//  ------------------------------------------------------------------------

TP.definePrimitive('defineMetaInstMethod',
function(methodName, methodBody) {

    /**
     * @method defineMetaInstMethod
     * @summary Adds the method with name and body provided as a 'meta
     *     instance' method.
     * @description Meta instance methods are methods on a set of objects that
     *     provide polymorphic behavior system-wide. Rather than place these
     *     methods on Object.prototype (which is considered bad form), we place
     *     them on the other 'core' system '.prototype' objects (as listed in
     *     the TP.META_INST_TARGETS array) and on the top-most TIBET object,
     *     TP.lang.RootObject.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @returns {null}
     */

    var i,
        target,

        existingMethod;

    //  First, we register it with TP.META_INST_OWNER's 'meta_methods'
    //  dictionary for easier reflection.
    TP.META_INST_OWNER.meta_methods[methodName] = methodBody;

    //  Then, loop over the TP.META_INST_TARGETS and install the method
    for (i = 0; i < TP.META_INST_TARGETS.length; i++) {
        target = TP.META_INST_TARGETS[i];

        //  If the method already exists and it's owner is *not*
        //  TP.META_INST_OWNER, then it was installed by a 'more specific'
        //  method install method and we leave that version alone.
        if (TP.isMethod(existingMethod = target[methodName]) &&
            existingMethod[TP.OWNER] !== TP.META_INST_OWNER) {
            continue;
        }

        TP.defineMethodSlot(
                target,
                methodName,
                methodBody,
                TP.META_INST_TRACK,
                null,
                target[TP.ID] + '.' + TP.META_INST_TRACK + '.' + methodName,
                TP.META_INST_OWNER);
    }

    //  If 'TP.lang' is defined as a namespace and 'TP.lang.RootObject' is
    //  defined as a type, then go ahead and install this method as *both* a
    //  type method and an instance method. Since we track it on the same track
    //  (TP.META_INST_TRACK) and the same owner (TP.META_INST_OWNER), track and
    //  owner information don't matter here.
    if (TP.isNamespace(TP.lang) && TP.isType(TP.lang.RootObject)) {

        target = TP.lang.RootObject$$Type.prototype;

        //  If the method already exists and it's owner is *not*
        //  TP.META_INST_OWNER, then it was installed by a 'more specific'
        //  method install method and we leave that version alone.
        if (TP.isMethod(existingMethod = target[methodName]) &&
                existingMethod[TP.OWNER] !== TP.META_INST_OWNER) {
            //  Empty block
            void 0;
        } else {
            TP.defineMethodSlot(
                    target,
                    methodName,
                    methodBody,
                    TP.META_INST_TRACK,
                    null,
                    target[TP.ID] + '.' + TP.META_INST_TRACK + '.' + methodName,
                    TP.META_INST_OWNER);
        }

        target = TP.lang.RootObject$$Inst.prototype;

        //  If the method already exists and it's owner is *not*
        //  TP.META_INST_OWNER, then it was installed by a 'more specific'
        //  method install method and we leave that version alone.
        if (TP.isMethod(existingMethod = target[methodName]) &&
                existingMethod[TP.OWNER] !== TP.META_INST_OWNER) {
            //  Empty block
            void 0;
        } else {
            TP.defineMethodSlot(
                    target,
                    methodName,
                    methodBody,
                    TP.META_INST_TRACK,
                    null,
                    target[TP.ID] + '.' + TP.META_INST_TRACK + '.' + methodName,
                    TP.META_INST_OWNER);
        }
    }

    return null;
}, false, 'TP.defineMetaInstMethod');

//  ------------------------------------------------------------------------

TP.definePrimitive('defineCommonMethod',
function(methodName, methodBody) {

    /**
     * @method defineCommonMethod
     * @summary Adds the method with name and body provided as a 'common'
     *     method.
     * @description Common methods are methods on a set of objects that provide
     *     polymorphic behavior system-wide. Like 'meta instance methods' above,
     *     rather than place these methods on Object.prototype (which is
     *     considered bad form), we place them on the other 'core' system
     *     '.prototype' objects (as listed in the TP.META_INST_TARGETS array)
     *     and on the top-most TIBET object, TP.lang.RootObject.
     *     Note that the main difference between a 'common' method and a 'meta'
     *     method is that common methods are tracked on the INST_TRACK track and
     *     they are not placed as type methods on TP.lang.RootObject.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @returns {null}
     */

    var i,
        target,

        existingMethod;

    //  First, we register it with TP.META_INST_OWNER's 'common_methods'
    //  dictionary for easier reflection.
    TP.META_INST_OWNER.common_methods[methodName] = methodBody;

    for (i = 0; i < TP.META_INST_TARGETS.length; i++) {
        target = TP.META_INST_TARGETS[i];

        //  If the method already exists and it's owner is *not*
        //  TP.META_INST_OWNER, then it was installed by a 'more specific'
        //  method install method and we leave that version alone.
        if (TP.isMethod(existingMethod = target[methodName]) &&
            existingMethod[TP.OWNER] !== TP.META_INST_OWNER) {
            continue;
        }

        TP.defineMethodSlot(
                    target,
                    methodName,
                    methodBody,
                    TP.INST_TRACK,
                    null,
                    target[TP.ID] + '.' + TP.INST_TRACK + '.' + methodName,
                    TP.META_INST_OWNER);
    }

    target = TP.lang.RootObject$$Inst.prototype;

    if (TP.isMethod(existingMethod = target[methodName]) &&
            existingMethod[TP.OWNER] !== TP.META_INST_OWNER) {
        //  Empty block
        void 0;
    } else {

        TP.defineMethodSlot(
                    target,
                    methodName,
                    methodBody,
                    TP.INST_TRACK,
                    null,
                    target[TP.ID] + '.' + TP.INST_TRACK + '.' + methodName,
                    TP.META_INST_OWNER);
    }

    return null;
}, false, 'TP.defineCommonMethod');

//  -----------------------------------------------------------------------

TP.definePrimitive('defineAttributeSlot',
function(target, name, value, track, owner) {

    /**
     * @method defineAttributeSlot
     * @summary Defines an attribute, tracking all necessary metadata.
     * @description Note that the 'value' property can either take an initial
     *     object value or a property descriptor. That property descriptor can
     *     any fields, but here are the ones that TIBET standardizes:
     *
     *          configurable (Boolean)
     *          enumerable (Boolean)
     *          writable (Boolean)
     *          value (Object)
     *          readonly (Boolean or path - isn't passed along to E5 call)
     *          relevant (Boolean or path - isn't passed along to E5 call)
     *          required (Boolean or path - isn't passed along to E5 call)
     *
     * @param {Object} target The target object.
     * @param {String} name The attribute name.
     * @param {Object} value The attribute value or a property descriptor
     *     object.
     * @param {String} track The attribute track (Inst, Type, Local).
     * @param {Object} owner The owner object. Defaults to target.
     * @returns {Object} The newly defined attribute value.
     */

    var own,
        trk,
        attribute,

        desc,
        val;

    //  Typically try to define only once. We test code change flag to avoid
    //  warning during source operations during development.
    if (target && TP.owns(target, name)) {
        TP.sys.shouldLogCodeChanges() && TP.ifWarn() ?
            TP.warn('Ignoring duplicate attribute definition: ' + name,
                    TP.LOG) : 0;

        TP.stop('break.duplicate_attribute');

        return target[name];
    }

    own = TP.ifInvalid(owner, target);
    trk = TP.ifInvalid(track, TP.LOCAL_TRACK);

    if (TP.notValid(value)) {
        desc = TP.DEFAULT_DESCRIPTOR;
        val = undefined;
    } else if (!TP.isPlainObject(value)) {
        //  Not a descriptor, so create one.
        desc = {value: value};
        val = value;
    } else {
        //  Need to extract the value since we were handed a descriptor
        desc = value;
        val = desc.value;
    }

    attribute = TP.defineSlot(target, name, val, TP.ATTRIBUTE, trk, desc);

    desc[TP.NAME] = name;

    // Don't track metadata for local properties.
    if (trk !== TP.LOCAL_TRACK) {
        TP.sys.addMetadata(own, desc, TP.ATTRIBUTE, trk);
    }

    return attribute;
}, false, 'TP.defineAttributeSlot');

//  -----------------------------------------------------------------------

TP.definePrimitive('defineConstantSlot',
function(target, name, value, track, owner) {

    /**
     * @method defineConstantSlot
     * @summary Defines a constant , tracking all necessary metadata.
     * @param {Object} target The target object.
     * @param {String} name The constant name.
     * @param {Object} value The constant value or a property descriptor object.
     * @param {String} track The constant track (Inst, Type, Local). Default is
     *     TP.TYPE_TRACK.
     * @param {Object} owner The owner object. Defaults to target.
     * @returns {Object} The newly defined constant value.
     */

    var own,
        trk,
        constant,

        desc,
        val;

    // Typically try to define only once. We test code change flag to avoid
    // warning during source operations during development.
    if (target && TP.owns(target, name)) {
        TP.sys.shouldLogCodeChanges() && TP.ifWarn() ?
            TP.warn('Ignoring duplicate constant definition: ' + name,
                    TP.LOG) : 0;

        TP.stop('break.duplicate_constant');

        return target[name];
    }

    own = TP.ifInvalid(owner, target);
    trk = TP.ifInvalid(track, TP.LOCAL_TRACK);

    if (TP.notValid(value)) {
        desc = TP.DEFAULT_DESCRIPTOR;
        val = undefined;
    } else if (!TP.isPlainObject(value)) {
        //  Not a descriptor, so create one.
        desc = {value: value};
        val = value;
    } else {
        //  Need to extract the value since we were handed a descriptor
        desc = value;
        val = desc.value;
    }

    constant = TP.defineSlot(target, name, val, TP.CONSTANT, trk, desc);

    desc[TP.NAME] = name;

    // Don't track metadata for local properties.
    if (trk !== TP.LOCAL_TRACK) {
        //  NB: We register constants as 'TP.ATTRIBUTE's
        TP.sys.addMetadata(own, desc, TP.ATTRIBUTE, trk);
    }

    return constant;

}, false, 'TP.defineConstantSlot');

//  ------------------------------------------------------------------------

TP.definePrimitive('runConditionalFunction',
function(functionBodyOrTests) {

    /**
     * @method runConditionalFunction
     * @summary Runs the function supplied, usually supplied as part of a set
     *     of tests.
     * @description Note that this method can take a variety of arguments in
     *     the 'functionBodyOrTests' parameter. If no sophisticated 'feature
     *     testing' is required, it just executes the Function in that
     *     parameter. Otherwise, it can take a hash of tests and the matching
     *     Functions that should be executed if the tests pass. See usages
     *     throughout the various primitives files in the system.
     * @param {Function|Object} functionBodyOrTests The actual method
     *     implementation or an object containing tests.
     * @returns {Function} The result of running the Function.
     */

    var test,
        key,

        theFunc;

    if (TP.$$DEBUG && !functionBodyOrTests) {
        TP.ifError() ?
            TP.error('Invalid function body or object for ' +
                        'TP.runConditionalFunction: ' + functionBodyOrTests,
                        TP.LOG) : 0;

        return;
    }

    //  if we weren't handed a Function body, then we need to check what we
    //  were handed.
    if (!TP.isCallable(functionBodyOrTests)) {
        test = functionBodyOrTests.at('test');

        //  The test was a Function... execute it. It should return true or
        //  false. We convert that value to a String.
        if (TP.isCallable(test)) {
            key = '' + test();
        } else {
            //  When provided a string if it's a test name we run that test
            //  and get back either true or false, which presumably is the
            //  proper key for one of our function options below.
            if (typeof test === 'string' && TP.sys.hasFeatureTest(test)) {
                key = TP.sys.hasFeature(test);
            } else {
                //  If the test isn't a string, or isn't a known test name
                //  we'll just convert to string directly the cheap way.
                key = ('' + test).toLowerCase();
            }
        }

        //  Look up the function in the dictionary provided.
        theFunc = functionBodyOrTests.at(key);
        if (typeof theFunc === 'undefined') {

            //  If there's a TP.DEFAULT use that when the key isn't
            //  found in the dictionary.
            theFunc = functionBodyOrTests.at(TP.DEFAULT);

            //  No default might must mean we're doing a test that doesn't
            //  pass for the current platform which has no correlary.
            if (!theFunc) {
                return;
            }
        }
    } else {
        //  If the parameter _is_ a function we got the function already.
        theFunc = functionBodyOrTests;
    }

    //  theFunc is still not callable? we have a problem...
    if (!TP.isCallable(theFunc)) {
        TP.ifError() ?
            TP.error('Invalid function body or object for ' +
                        'TP.runConditionalFunction: ' + functionBodyOrTests,
                        TP.LOG) : 0;

        return;
    }

    return theFunc();
}, false, 'TP.runConditionalFunction');

//  ------------------------------------------------------------------------

TP.definePrimitive('defineMethodAlias',
function(target, methodName, methodBody) {

    /**
     * @method defineMethodAlias
     * @summary Defines an alias to a previously defined method.
     * @description This method will alias an existing method over to the slot
     *     on the target object *without resetting it's track and owner
     *     information*.
     * @param {Object} target The target object.
     * @param {String} methodName The name of the method.
     * @param {Function} methodBody The actual method implementation.
     * @returns {Function} The installed method.
     */

    //  Simple slot aliasing.
    target[methodName] = methodBody;

    return target[methodName];
}, false, 'TP.defineMethodAlias');

//  ------------------------------------------------------------------------
//  REFLECTION - PART I
//  ------------------------------------------------------------------------

/*
Minimal reflection API necessary to support the type checking methods which
are defined in this module. Later sections of the kernel add significant
reflection capability to the system.
*/

TP.defineMetaInstMethod('getConstructor',
function() {

    /**
     * @method getConstructor
     * @summary Returns the receiver's constructor function. For simple objects
     *     this is a simple wrapper around returning the constructor property.
     * @returns {Object} The receiver's constructor function.
     */

    return this.constructor;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getPrototype',
function() {

    /**
     * @method getPrototype
     * @summary Returns the receiver's prototype instance. The prototype
     *     instance is the object from which behavior is inherited.
     * @returns {Object} The receiver's prototype instance.
     */

    return Object.getPrototypeOf(this);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getInstPrototype',
function() {

    /**
     * @method getInstPrototype
     * @summary Returns the receiver's instance prototype -- the object
     *     responsible for inherited behavior for instances of the receivers'
     *     type. Type objects respond differently, returning the prototype for
     *     their instances rather than the prototype they inherit from.
     * @returns {Object} The receiver's instance prototype instance.
     */

    if (TP.isFunction(this)) {
        return this.prototype;
    }

    return this.getPrototype();
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getType',
function() {

    /**
     * @method getType
     * @summary Returns the type of the receiver. For top-level objects which
     *     descend from native constructors like Object, Array, etc. this is
     *     equal to asking for the constructor. For constructors themselves this
     *     is Function. For Objects you'll get the instance of TP.FunctionProto
     *     acting as the type.
     * @returns {Object} The receiver's type.
     */

    if (TP.isFunction(this)) {
        return Function;
    }

    return this.constructor;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getTypeName',
function() {

    /**
     * @method getTypeName
     * @summary Returns the type name of the receiver. This method is a synonym
     *     for getName() for type instances. For instances it returns the name
     *     of their type object.
     * @returns {String} The type name of the receiver.
     */

    var str,
        name,
        type;

    if (TP.isWindow(this)) {
        return 'Window';
    }

    if (TP.owns(this, TP.TNAME)) {
        return this[TP.TNAME];
    }

    if (TP.isType(type = this.getType())) {
        if (TP.canInvoke(type, 'getName')) {
            return type.getName();
        }

        //  watch out for IE bugs
        if (TP.canInvoke(type, 'toString')) {
            str = type.toString();

            return str.strip(/[\[\]]/g);
        }
    }

    if (TP.isFunction(this)) {
        return 'Function';
    }

    if ((str = TP.ObjectProto.toString.call(this)) &&
            TP.regex.NATIVE_TYPENAME_MATCH.test(str)) {

        /* eslint-disable no-extra-parens */
        if ((name = str.match(TP.regex.NATIVE_TYPENAME_EXTRACT))) {
            return name[1];
        }
        /* eslint-enable no-extra-parens */
    }

    return TP.isWindow(this) ? 'Window' : 'Object';
});

//  ------------------------------------------------------------------------
//  OBJECT NAMING - PART II
//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('$getName',
function() {

    /**
     * @method $getName
     * @summary Default implementation of the $getName operation. Returns the
     *     receiver's ID as the 'Name'.
     * @returns {String}
     */

    if (TP.owns(this, TP.NAME)) {
        return this[TP.NAME];
    }

    return this.getID();
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getName',
function() {

    /**
     * @method getName
     * @summary Default implementation of the $getName operation. Returns the
     *     receiver's ID as the 'Name'.
     * @returns {String}
     */

    if (TP.owns(this, TP.NAME)) {
        return this[TP.NAME];
    }

    return this.getID();
});

//  ------------------------------------------------------------------------
//  OBJECT IDENTITY - PART II
//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('$getOIDPrefix',
function() {

    /**
     * @method $getOIDPrefix
     * @summary Returns an 'OID prefix' for the receiver - used as the prefix
     *     when the system is generating an OID for the receiver.
     * @returns {String} The OID prefix for the receiver.
     */

    var type,
        prefix;

    //  prefix OIDs with type names so we get a sense of what an object is along
    //  with its random ID
    type = TP.isType(this) ?
                this :
                TP.type(this);

    if (TP.isNativeType(type)) {
        if (TP.isNonFunctionConstructor(type)) {
            prefix = TP.getNonFunctionConstructorName(type);
        } else if (TP.isFunction(type)) {
            //  For Functions that live in a TIBET JS context, they can respond
            //  to 'getName' (which, if they're anonymous, will give them a
            //  unique ID).
            if (TP.canInvoke(type, 'getName')) {
                prefix = type.getName();
            } else if (TP.isFunction(type)) {
                //  Otherwise, we can just try to get the name of the Function
                //  or the value of TP.ANONYMOUS_FUNCTION_NAME
                prefix = TP.getFunctionName(type);
            }
        }
    } else {
        prefix = type[TP.TNAME];
    }

    return prefix;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('$getOID',
function(aPrefix) {

    /**
     * @method $getOID
     * @summary Returns the unique object ID for the receiver. This can be
     *     thought of as the objects' primary key (sans versioning data) from a
     *     TIBET perspective. Normally you would not call this method directly,
     *     you'd call getID() instead.
     * @param {String} aPrefix An optional prefix which will be prepended to any
     *     generated value.
     * @returns {String} Currently all OID's are String values.
     */

    var prefix;

    if (TP.isValid(this.$$oid)) {
        return this.$$oid;
    }

    //  watch out for special objects (basically TP.ObjectProto and
    //  TP.FunctionProto) here...
    if (this === TP.ObjectProto) {
        return 'ObjectProto';
    } else if (this === TP.FunctionProto) {
        return 'FunctionProto';
    }

    //  for non-mutable instances (String, Number, Boolean) we just return
    //  the value since we can't really store an OID on them and their
    //  value doesn't change.
    if (!TP.isMutable(this)) {
        //  watch out for Mozilla, after 2.x strings don't behave properly
        //  when returning 'this' from a method, the behave like Arrays
        if (TP.isString(this)) {
            return '' + this;
        }

        return this;
    }

    if (!aPrefix) {
        prefix = this.$getOIDPrefix();
    } else {
        prefix = aPrefix;
    }

    //  if it doesn't exist we can create it and bail out
    if (this.$$oid === undefined && !TP.isNode(this)) {
        //  some native objects will complain bitterly about this
        try {
            this.$$oid = TP.sys.constructOID(prefix);
        } catch (e) {
            TP.ifError() ? TP.error(TP.ec(e, 'Could not obtain OID'),
                                    TP.LOG) : 0;
        }
    } else if (this.$$oid === this.getPrototype().$$oid && !TP.isNode(this)) {
        //  watch out for TP.FunctionProto :). Endless recursion is possible if
        //  this test isn't performed.
        if (this !== this.getPrototype()) {
            this.$$oid = TP.sys.constructOID(prefix);
        }
    }

    return this.$$oid;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getID',
function(aPrefix) {

    /**
     * @method getID
     * @summary Returns the public ID of the receiver. If the receiving object
     *     doesn't have an ID set, the objects' OID is returned instead. See
     *     $getOID for more info. Note that non-mutable JavaScript objects (i.e.
     *     String, Number and Boolean) will return themselves as their ID.
     * @description Using a two-layer ID scheme allows the system to maintain an
     *     internal identifier in the form of OID values and at the same time
     *     allow developers to register certain objects under explicitly defined
     *     identifiers. This is an important feature for developing cross-frame
     *     where incoming pages need a public, well-known identifier, to acquire
     *     a reference to objects in other frames. It's also a key element of
     *     how to get different frames to coordinate on signal origins.
     * @param {String} aPrefix An optional prefix which will be prepended to any
     *     generated value.
     * @example Get a unique ID for a JavaScript object:
     *     <code>
     *          'hi'.getID();
     *          <samp>hi</samp>
     *          (42).getID();
     *          <samp>42</samp>
     *          true.getID();
     *          <samp>true</samp>
     *          TP.ac().getID();
     *          <samp>Array_11194fef891948efcb003e0d8</samp>
     *          TP.hc().getID();
     *          <samp>TP.lang.Hash_11194ff08b02373b76de8c7c</samp>
     *          TP.dc().getID();
     *          <samp>Date_111997a9773f185a33f9280f</samp>
     *          (function() {TP.alert('foo');}).getID();
     *          <samp>Function_111997cb98f69d60b2cc7daa</samp>
     *          TP.lang.Object.construct().getID();
     *          <samp>TP.lang.Object_111997a3ada0b5cb1f4dc5398</samp>
     *     </code>
     * @returns {String} Currently all OID's are String values.
     */

    if (this === TP.ObjectProto) {
        return 'ObjectProto';
    }

    //  default to OID if not set
    if (this[TP.ID] === undefined) {
        return this.$getOID(aPrefix);
    } else if (this[TP.ID] === this.getPrototype()[TP.ID]) {
        //  watch out for TP.FunctionProto itself. When we're at the top of the
        //  tree we have to watch out for recursion bugs.
        if (this !== this.getPrototype()) {
            return this.$getOID(aPrefix);
        }
    }

    return this[TP.ID];
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('hasGeneratedID',
function() {

    /**
     * @method hasGeneratedID
     * @summary Whether or not the receiver has a 'generated ID' - that is, one
     *     that was generated by the system, not by user code.
     * @returns {Boolean} Whether or not the receiver has a generated ID.
     */

    var privateIDMatcher;

    //  If we can invoke '$getOIDPrefix' on this object, then we do so.
    if (TP.canInvoke(this, '$getOIDPrefix')) {

        //  Build a RegExp that will match the OID prefix for this object,
        //  followed by a literal '$' and then 1-n word characters. Matching
        //  this will indicate that the object has a privately generated ID.
        privateIDMatcher = new RegExp(this.$getOIDPrefix() + '\\$\\w+');

        return privateIDMatcher.test(this.getID());
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('setID',
function(anID) {

    /**
     * @method setID
     * @summary Sets the public ID of the receiver.
     * @description Public IDs are useful as handles for acquiring objects from
     *     the TIBET instance hashes. See the comment for getID(). Note that the
     *     object is un-registered under its old ID by this operation.
     * @param {String} anID The value to use as a public ID.
     * @returns {String} The ID that was set.
     */

    var id,
        wasRegistered;

    //  If the receiver was registered under an 'id', unregister it and
    //  re-register with the new ID below.
    if (TP.isValid(id = this[TP.ID]) && id !== anID) {
        if (TP.isValid(TP.sys.hasRegistered)) {
            wasRegistered = TP.sys.hasRegistered(this, id);
            TP.sys.unregisterObject(this, id);
        }
    }

    //  default invalid entries to the OID
    id = TP.notValid(anID) ? this.$getOID() : anID;

    this[TP.ID] = id;

    if (wasRegistered) {
        TP.sys.registerObject(this, id);
    }

    return this[TP.ID];
});

//  ------------------------------------------------------------------------
//  MOP (Meta-Object Protocol) aka "Universally Common Methods"
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  TP Methods
//  ------------------------------------------------------------------------

TP.defineMethodSlot(TP, 'defineAttribute',
function(attributeName, attributeValue) {

    /**
     * @method defineAttribute
     * @summary Adds/defines a new local attribute for the receiver. The
     *     attribute gets a default value if provided. In the current release
     *     the other three parameters are ignored.
     * @param {String} attributeName The attribute name.
     * @param {Object} attributeValue The attribute value or a property
     *     descriptor object.
     * @returns {Object} The newly defined attribute value.
     */

    return TP.defineAttributeSlot(
            TP, attributeName, attributeValue, TP.LOCAL_TRACK);
});

//  ------------------------------------------------------------------------

TP.defineMethodSlot(TP, 'defineConstant',
function(constantName, constantValue) {

    /**
     * @method defineConstant
     * @summary Adds the constant with name and value provided as a 'local'
     *     constant.
     * @param {String} constantName The constant name.
     * @param {Object} constantValue The constant value or a property descriptor
     *     object.
     * @returns {Object} The newly defined constant value.
     */

    return TP.defineConstantSlot(
            TP, constantName, constantValue, TP.LOCAL_TRACK);
});

//  ------------------------------------------------------------------------

TP.defineMethodSlot(TP, 'defineMethod',
function(methodName, methodBody, desc, display) {

    /**
     * @method defineMethod
     * @summary Adds the method with name and body provided as a local method.
     *     Local methods are directly methods on the receiving instance. These
     *     methods differ from 'instance' methods in that the behavior is NOT
     *     inherited unless the owner object happens to serve as a prototype.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Object} desc An optional 'property descriptor'. If a 'value' slot
     *     is supplied here, it is ignored in favor of the methodBody parameter
     *     to this method.
     * @param {String} display Optional string defining the public display name
     *     for the function.
     * @returns {Function} The newly defined method.
     */

    return TP.defineMethodSlot(
            TP, methodName, methodBody, TP.LOCAL_TRACK, desc, display);
});

//  ------------------------------------------------------------------------

TP.defineMethod('describe',
function(suiteName, suiteFunc) {

    /**
     * @method describe
     * @summary Adds a new test suite definition to an object. When the suite
     *     name matches a method name that suite is automatically associated
     *     with the specific method.
     * @param {String} suiteName The name of the new test suite. Should be
     *     unique to the particular receiver. If this matches a method name the
     *     suite is associated with that method.
     * @param {Function} suiteFunc The function representing the test suite.
     *     Should contain at least one call to 'this.it', the test case
     *     definition method on TP.test.Suite.
     */

    return TP.test.Suite.addSuite(this, suiteName, suiteFunc);
});

//  ------------------------------------------------------------------------

TP.defineMethod('getTestFixture',
function() {

    /**
     * Creates and returns test fixture data suitable for the receiver. This
     * method is used to produce "the object under test" for test cases that
     * target the receiver. The default is the receiver itself.
     * @param {TP.lang.Hash} options A dictionary of test options.
     * @returns {Object} A test fixture for the receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMethod('getTestSuites',
function(options) {

    /**
     * Returns the dictionary containing test suites for the receiver.
     * @param {TP.lang.Hash} options A dictionary of test options.
     * @returns {TP.lang.Hash} A hash keyed by the receiver's ID.
     */

    return TP.test.Suite.getTargetSuites(this, options);
});

//  ------------------------------------------------------------------------

TP.defineMethod('runTestSuites',
function(options) {

    /**
     * Runs the test suites associated with the receiver. Options which help
     * configure and control the testing process can be provided.
     * @param {TP.lang.Hash} options A dictionary of test options.
     * @returns {Promise} A Promise to be used as necessary.
     */

    return TP.test.Suite.runTargetSuites(this, options);
});

//  ------------------------------------------------------------------------
//  TP.sys Methods
//  ------------------------------------------------------------------------

TP.defineMethodSlot(TP.sys, 'defineAttribute',
function(attributeName, attributeValue) {

    /**
     * @method defineAttribute
     * @summary Adds/defines a new local attribute for the receiver. The
     *     attribute gets a default value if provided. In the current release
     *     the other three parameters are ignored.
     * @param {String} attributeName The attribute name.
     * @param {Object} attributeValue The attribute value or a property
     *     descriptor object.
     * @returns {Object} The newly defined attribute value.
     */

    return TP.defineAttributeSlot(
            TP.sys, attributeName, attributeValue, TP.LOCAL_TRACK);
});

//  ------------------------------------------------------------------------

TP.defineMethodSlot(TP.sys, 'defineConstant',
function(constantName, constantValue) {

    /**
     * @method defineConstant
     * @summary Adds the constant with name and value provided as a 'local'
     *     constant.
     * @param {String} constantName The constant name.
     * @param {Object} constantValue The constant value or a property descriptor
     *     object.
     * @returns {Object} The newly defined constant value.
     */

    return TP.defineConstantSlot(
            TP.sys, constantName, constantValue, TP.LOCAL_TRACK);
});

//  ------------------------------------------------------------------------

TP.defineMethodSlot(TP.sys, 'defineMethod',
function(methodName, methodBody, desc, display) {

    /**
     * @method defineMethod
     * @summary Adds the method with name and body provided as a local method.
     *     Local methods are directly methods on the receiving instance. These
     *     methods differ from 'instance' methods in that the behavior is NOT
     *     inherited unless the owner object happens to serve as a prototype.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Object} desc An optional 'property descriptor'. If a 'value' slot
     *     is supplied here, it is ignored in favor of the methodBody parameter
     *     to this method.
     * @param {String} display Optional string defining the public display name
     *     for the function.
     * @returns {Function} The newly defined method.
     */

    return TP.defineMethodSlot(
            TP.sys, methodName, methodBody, TP.LOCAL_TRACK, desc, display);
});

//  ------------------------------------------------------------------------
//  TP.boot Methods
//  ------------------------------------------------------------------------

TP.defineMethodSlot(TP.boot, 'defineAttribute',
function(attributeName, attributeValue) {

    /**
     * @method defineAttribute
     * @summary Adds/defines a new local attribute for the receiver. The
     *     attribute gets a default value if provided. In the current release
     *     the other three parameters are ignored.
     * @param {String} attributeName The attribute name.
     * @param {Object} attributeValue The attribute value or a property
     *     descriptor object.
     * @returns {Object} The newly defined attribute value.
     */

    return TP.defineAttributeSlot(
            TP.boot, attributeName, attributeValue, TP.LOCAL_TRACK);
});

//  ------------------------------------------------------------------------

TP.defineMethodSlot(TP.boot, 'defineConstant',
function(constantName, constantValue) {

    /**
     * @method defineConstant
     * @summary Adds the constant with name and value provided as a 'local'
     *     constant.
     * @param {String} constantName The constant name.
     * @param {Object} constantValue The constant value or a property descriptor
     *     object.
     * @returns {Object} The newly defined constant value.
     */

    return TP.defineConstantSlot(
            TP.boot, constantName, constantValue, TP.LOCAL_TRACK);
});

//  ------------------------------------------------------------------------

TP.defineMethodSlot(TP.boot, 'defineMethod',
function(methodName, methodBody, desc, display) {

    /**
     * @method defineMethod
     * @summary Adds the method with name and body provided as a local method.
     *     Local methods are directly methods on the receiving instance. These
     *     methods differ from 'instance' methods in that the behavior is NOT
     *     inherited unless the owner object happens to serve as a prototype.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Object} desc An optional 'property descriptor'. If a 'value' slot
     *     is supplied here, it is ignored in favor of the methodBody parameter
     *     to this method.
     * @param {String} display Optional string defining the public display name
     *     for the function.
     * @returns {Function} The newly defined method.
     */

    return TP.defineMethodSlot(
            TP.boot, methodName, methodBody, TP.LOCAL_TRACK, desc, display);
});

//  ------------------------------------------------------------------------
//  APP Methods
//  ------------------------------------------------------------------------

TP.defineMethodSlot(APP, 'defineAttribute',
function(attributeName, attributeValue) {

    /**
     * @method defineAttribute
     * @summary Adds/defines a new local attribute for the receiver. The
     *     attribute gets a default value if provided. In the current release
     *     the other three parameters are ignored.
     * @param {String} attributeName The attribute name.
     * @param {Object} attributeValue The attribute value or a property
     *     descriptor object.
     * @returns {Object} The newly defined attribute value.
     */

    return TP.defineAttributeSlot(
            APP, attributeName, attributeValue, TP.LOCAL_TRACK);
});

//  ------------------------------------------------------------------------

TP.defineMethodSlot(APP, 'defineConstant',
function(constantName, constantValue) {

    /**
     * @method defineConstant
     * @summary Adds the constant with name and value provided as a 'local'
     *     constant.
     * @param {String} constantName The constant name.
     * @param {Object} constantValue The constant value or a property descriptor
     *     object.
     * @returns {Object} The newly defined constant value.
     */

    return TP.defineConstantSlot(
            APP, constantName, constantValue, TP.LOCAL_TRACK);
});

//  ------------------------------------------------------------------------

TP.defineMethodSlot(APP, 'defineMethod',
function(methodName, methodBody, desc, display) {

    /**
     * @method defineMethod
     * @summary Adds the method with name and body provided as a local method.
     *     Local methods are directly methods on the receiving instance. These
     *     methods differ from 'instance' methods in that the behavior is NOT
     *     inherited unless the owner object happens to serve as a prototype.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Object} desc An optional 'property descriptor'. If a 'value' slot
     *     is supplied here, it is ignored in favor of the methodBody parameter
     *     to this method.
     * @param {String} display Optional string defining the public display name
     *     for the function.
     * @returns {Function} The newly defined method.
     */

    return TP.defineMethodSlot(
            APP, methodName, methodBody, TP.LOCAL_TRACK, desc, display);
});

//  ------------------------------------------------------------------------
//  TP.FunctionProto - TYPE DEFINITION
//  ------------------------------------------------------------------------

/*
The methods in this section provide support for the built-in types so that they
can respond in most cases to the same API as the TP.lang.RootObject subtypes.
It's not a good thing to try and subtype directly off the built-in types since
that's not really ECMAScript compliant.
*/

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('ownsMethod',
function(aName) {

    /**
     * @method ownsMethod
     * @summary Returns true if the name represents a unique method on the
     *     receiver, one that is either introduced or overridden so that the
     *     method is "owned" by the receiver.
     * @param {String} aName The method name to check.
     * @returns {Boolean}
     */

    if (TP.sys.hasInitialized() && TP.isMethod(this[aName])) {
        return this[aName][TP.OWNER] === this;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('defineAttribute',
function(attributeName, attributeValue) {

    /**
     * @method defineAttribute
     * @summary Adds the attribute with name and value provided as a 'local'
     *     attribute. This is the root method that all objects that are
     *     instrumented with meta instance methods will get.
     * @param {String} attributeName The attribute name.
     * @param {Object} attributeValue The attribute value or a property
     *     descriptor object.
     * @returns {Object} The newly defined attribute value.
     */

    return TP.defineAttributeSlot(
            this, attributeName, attributeValue, TP.LOCAL_TRACK, this);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('defineConstant',
function(constantName, constantValue) {

    /**
     * @method defineConstant
     * @summary Adds the constant with name and value provided as a 'local'
     *     constant. This is the root method that all objects that are
     *     instrumented with meta instance methods will get.
     * @param {String} constantName The constant name.
     * @param {Object} constantValue The constant value or a property descriptor
     *     object.
     * @returns {Object} The newly defined constant value.
     */

    return TP.defineConstantSlot(
            this, constantName, constantValue, TP.LOCAL_TRACK, this);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('defineMethod',
function(methodName, methodBody, desc) {

    /**
     * @method defineMethod
     * @summary Adds the function with name and body provided as a 'local'
     *     method. This is the root method that all objects that are
     *     instrumented with meta instance methods will get.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Object} desc An optional 'property descriptor'. If a 'value' slot
     *     is supplied here, it is ignored in favor of the methodBody parameter
     *     to this method.
     * @returns {Function} The newly defined method.
     */

    return TP.defineMethodSlot(
            this, methodName, methodBody, TP.LOCAL_TRACK, desc, null, this);
});

//  ------------------------------------------------------------------------

TP.defineMethodSlot(TP.FunctionProto, 'defineAttribute',
function(attributeName, attributeValue) {

    /**
     * @method defineAttribute
     * @summary Adds the attribute with name and value provided as an instance,
     *     'type local' or 'local' attribute. This is 'overridden' from the
     *     meta-method version because TP.FunctionProto plays so many different
     *     roles.
     * @param {String} attributeName The attribute name.
     * @param {Object} attributeValue The attribute value or a property
     *     descriptor object.
     * @returns {Object} The newly defined attribute value.
     */

    var target,
        owner,
        track;

    //  If we're being asked to add an attribute to TP.FunctionProto *directly*
    //  then we consider it an instance attribute of all Function objects.
    if (this === TP.FunctionProto) {
        target = TP.FunctionProto;
        owner = Function;
        track = TP.INST_TRACK;
    } else if (TP.isType(this)) {
        //  Otherwise, if it is one of the 'Big 8' constructor Functions, then
        //  it's a 'type local' attribute.
        target = this;
        owner = this;
        track = TP.TYPE_LOCAL_TRACK;
    } else {
        //  Otherwise, it can be considered to be a 'local' attribute of the
        //  receiving Function object (which is usually a plain, anonymous
        //  Function).
        target = this;
        owner = this;
        track = TP.LOCAL_TRACK;
    }

    return TP.defineAttributeSlot(
            target, attributeName, attributeValue, track, owner);
}, TP.TYPE_TRACK, null, 'TP.FunctionProto.Type.defineAttribute');

//  ------------------------------------------------------------------------

TP.defineMethodSlot(TP.FunctionProto, 'defineConstant',
function(constantName, constantValue) {

    /**
     * @method defineConstant
     * @summary Adds the constant with name and value provided as an instance,
     *     'type local' or 'local' constant. This is 'overridden' from the
     *     meta-method version because TP.FunctionProto plays so many different
     *     roles.
     * @param {String} constantName The constant name.
     * @param {Object} constantValue The constant value or a property descriptor
     *     object.
     * @returns {Object} The newly defined constant value.
     */

    var target,
        owner,
        track;

    //  If we're being asked to add a constant to TP.FunctionProto *directly*
    //  then we consider it an instance constant of all Function objects.
    if (this === TP.FunctionProto) {
        target = TP.FunctionProto;
        owner = Function;
        track = TP.INST_TRACK;
    } else if (TP.isType(this)) {
        //  Otherwise, if it is one of the 'Big 8' constructor Functions, then
        //  it's a 'type local' constant.
        target = this;
        owner = this;
        track = TP.TYPE_LOCAL_TRACK;
    } else {
        //  Otherwise, it can be considered to be a 'local' constant of the
        //  receiving Function object (which is usually a plain, anonymous
        //  Function).
        target = this;
        owner = this;
        track = TP.LOCAL_TRACK;
    }

    return TP.defineConstantSlot(
            target, constantName, constantValue, track, owner);
}, TP.TYPE_TRACK, null, 'TP.FunctionProto.Type.defineConstant');

//  ------------------------------------------------------------------------

TP.defineMethodSlot(TP.FunctionProto, 'defineMethod',
function(methodName, methodBody, desc) {

    /**
     * @method defineMethod
     * @summary Adds the function with name and body provided as an instance,
     *     'type local' or 'local' method. This is 'overridden' from the
     *     meta-method version because TP.FunctionProto plays so many different
     *     roles.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Object} desc An optional 'property descriptor'. If a 'value' slot
     *     is supplied here, it is ignored in favor of the methodBody parameter
     *     to this method.
     * @returns {Function} The newly defined method.
     */

    var target,
        owner,
        track;

    //  If we're being asked to add a method to TP.FunctionProto *directly* then
    //  we consider it an instance method of all Function objects.
    if (this === TP.FunctionProto) {
        target = TP.FunctionProto;
        owner = Function;
        track = TP.INST_TRACK;
    } else if (TP.isType(this)) {
        //  Otherwise, if it is one of the 'Big 8' constructor Functions, then
        //  it's a 'type local' method.
        target = this;
        owner = this;
        track = TP.TYPE_LOCAL_TRACK;
    } else {
        //  Otherwise, it can be considered to be a 'local' method of the
        //  receiving Function object (which is usually a plain, anonymous
        //  Function).
        target = this;
        owner = this;
        track = TP.LOCAL_TRACK;
    }

    return TP.defineMethodSlot(
            target, methodName, methodBody, track, desc, null, owner);
}, TP.TYPE_TRACK, null, 'TP.FunctionProto.Type.defineMethod');

//  ------------------------------------------------------------------------
//  TP.lang.RootObject - TYPE DEFINITION
//  ------------------------------------------------------------------------

TP.defineMethodSlot(TP.lang.RootObject.Type, 'defineAttribute',
function(attributeName, attributeValue) {

    /**
     * @method defineAttribute
     * @summary Adds the attribute with name and value provided as a type or
     *     'type local' attribute.
     * @param {String} attributeName The attribute name.
     * @param {Object} attributeValue The attribute value or a property
     *     descriptor object.
     * @returns {Object} The newly defined attribute value.
     */

    var track,
        owner;

    if (TP.isPrototype(this)) {
        track = TP.TYPE_TRACK;
        owner = this[TP.OWNER];
    } else {
        track = TP.TYPE_LOCAL_TRACK;
        owner = this;
    }

    return TP.defineAttributeSlot(
                this, attributeName, attributeValue, track, owner);
}, TP.TYPE_TRACK, null, 'TP.lang.RootObject.Type.defineAttribute');

//  ------------------------------------------------------------------------

TP.defineMethodSlot(TP.lang.RootObject.Type, 'defineConstant',
function(constantName, constantValue) {

    /**
     * @method defineConstant
     * @summary Adds the constant with name and value provided as a type or
     *     'type local' constant.
     * @param {String} constantName The constant name.
     * @param {Object} constantValue The constant value or a property descriptor
     *     object.
     * @returns {Object} The newly defined constant value.
     */

    var track,
        owner;

    if (TP.isPrototype(this)) {
        track = TP.TYPE_TRACK;
        owner = this[TP.OWNER];
    } else {
        track = TP.TYPE_LOCAL_TRACK;
        owner = this;
    }

    return TP.defineConstantSlot(
                this, constantName, constantValue, track, owner);
}, TP.TYPE_TRACK, null, 'TP.lang.RootObject.Type.defineConstant');

//  ------------------------------------------------------------------------

TP.defineMethodSlot(TP.lang.RootObject.Type, 'defineMethod',
function(methodName, methodBody, desc) {

    /**
     * @method defineMethod
     * @summary Adds the function with name and body provided as a type or
     *     'type local' method.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Object} desc An optional 'property descriptor'. If a 'value' slot
     *     is supplied here, it is ignored in favor of the methodBody parameter
     *     to this method.
     * @returns {Function} The newly defined method.
     */

    var track,
        owner;

    if (TP.isPrototype(this)) {
        track = TP.TYPE_TRACK;
        owner = this[TP.OWNER];

        if (TP.isMethod(owner.hasTraits) && owner.hasTraits()) {
            this.resolveTrait(methodName, owner);
        }
    } else {
        track = TP.TYPE_LOCAL_TRACK;
        owner = this;
    }

    return TP.defineMethodSlot(
                this, methodName, methodBody, track, desc, null, owner);
}, TP.TYPE_TRACK, null, 'TP.lang.RootObject.Type.defineMethod');

//  ------------------------------------------------------------------------

TP.defineMethodSlot(TP.lang.RootObject.Inst, 'defineAttribute',
function(attributeName, attributeValue) {

    /**
     * @method defineAttribute
     * @summary Adds the attribute with name and value provided as an instance
     *     or 'local' attribute.
     * @param {String} attributeName The attribute name.
     * @param {Object} attributeValue The attribute value or a property
     *     descriptor object.
     * @returns {Object} The newly defined attribute value.
     */

    var track,
        owner;

    if (TP.isPrototype(this)) {
        track = TP.INST_TRACK;
        owner = this[TP.OWNER];
    } else {
        track = TP.LOCAL_TRACK;
        owner = this;
    }

    return TP.defineAttributeSlot(
                this, attributeName, attributeValue, track, owner);
}, TP.TYPE_TRACK, null, 'TP.lang.RootObject.Inst.defineAttribute');

//  ------------------------------------------------------------------------

TP.defineMethodSlot(TP.lang.RootObject.Inst, 'defineConstant',
function(constantName, constantValue) {

    /**
     * @method defineConstant
     * @summary Adds the constant with name and value provided as an instance
     *     or 'local' constant.
     * @param {String} constantName The constant name.
     * @param {Object} constantValue The constant value or a property descriptor
     *     object.
     * @returns {Object} The newly defined constant value.
     */

    var track,
        owner;

    if (TP.isPrototype(this)) {
        track = TP.INST_TRACK;
        owner = this[TP.OWNER];
    } else {
        track = TP.LOCAL_TRACK;
        owner = this;
    }

    return TP.defineConstantSlot(
                this, constantName, constantValue, track, owner);
}, TP.TYPE_TRACK, null, 'TP.lang.RootObject.Inst.defineConstant');

//  ------------------------------------------------------------------------

TP.defineMethodSlot(TP.lang.RootObject.Inst, 'defineMethod',
function(methodName, methodBody, desc) {

    /**
     * @method defineMethod
     * @summary Adds the function with name and body provided as an instance or
     *     'local' method.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Object} desc An optional 'property descriptor'. If a 'value' slot
     *     is supplied here, it is ignored in favor of the methodBody parameter
     *     to this method.
     * @returns {Function} The newly defined method.
     */

    var track,
        owner;

    if (TP.isPrototype(this)) {
        track = TP.INST_TRACK;
        owner = this[TP.OWNER];

        if (TP.isMethod(owner.hasTraits) && owner.hasTraits()) {
            this.resolveTrait(methodName, owner);
        }
    } else {
        track = TP.LOCAL_TRACK;
        owner = this;
    }

    return TP.defineMethodSlot(
                this, methodName, methodBody, track, desc, null, owner);

}, TP.TYPE_TRACK, null, 'TP.lang.RootObject.Inst.defineMethod');

//  ------------------------------------------------------------------------
//  Window TYPE DEFINITION
//  ------------------------------------------------------------------------

//  We need to define this here, since it's needed by 'Type.defineMethod' below.
//  But then we register it right away as soon as we can.
Window.getName = function() {

    /**
     * @method getName
     * @summary Returns the name of the Window constructor which is,
     *     appropriately, 'Window'.
     * @returns {String}
     */

    return 'Window';
};

//  ------------------------------------------------------------------------

Window.Type.defineMethod = function(methodName, methodBody, desc) {

    /**
     * @method defineMethod
     * @summary Adds the function with name and body provided as a type method.
     *     This is the root method since all other methods can be declared using
     *     this one.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Object} desc An optional 'property descriptor'. If a 'value' slot
     *     is supplied here, it is ignored in favor of the methodBody parameter
     *     to this method.
     * @returns {Function} The installed method.
     */

    var display = 'Window.Type.' + methodName;

    return TP.defineMethodSlot(
            Window, methodName, methodBody, TP.TYPE_TRACK, desc, display);
};

//  ------------------------------------------------------------------------

Window.Type.defineMethod('getName', Window.getName);

//  ------------------------------------------------------------------------
//  WINDOW NAME / ID
//  ------------------------------------------------------------------------

//  Some platforms (old versions of Webkit) don't treat 'Window' as a real
//  object... sigh.
if (!TP.isFunction(Window.getID)) {
    Window.getID = TP.FunctionProto.getID;
    Window.$getOID = TP.FunctionProto.$getOID;
    Window.getPrototype = TP.FunctionProto.getPrototype;
}

Window.Inst.defineMethod('$getName',
function() {

    /**
     * @method $getName
     * @summary Allows the top level to act as a function 'owner'. Function
     *     owners are often asked for their name as part of building change log
     *     entries. In standard JS there is no way to ask a function which
     *     object it belongs to for purposes of reflection or logging. TIBET
     *     uses TP.OWNER to acquire a handle to that object and then asks it for
     *     a name via this call.
     * @returns {String}
     */

    return 'Self';
});

//  ------------------------------------------------------------------------

Window.Inst.defineMethod('getName',
function() {

    /**
     * @method getName
     * @summary Allows the top level to act as a function 'owner'. Function
     *     owners are often asked for their name as part of building change log
     *     entries. In standard JS there is no way to ask a function which
     *     object it belongs to for purposes of reflection or logging. TIBET
     *     uses TP.OWNER to acquire a handle to that object and then asks it for
     *     a name via this call.
     * @returns {String}
     */

    return 'Self';
});

//  ------------------------------------------------------------------------

Window.Inst.defineMethod('$getOID',
function(aPrefix) {

    /**
     * @method $getOID
     * @summary Returns the unique object ID for the receiver. This can be
     *     thought of as the objects' primary key (sans versioning data) from a
     *     TIBET perspective.
     * @param {String} aPrefix An optional prefix which will be prepended to any
     *     generated value.
     * @returns {String} Currently all OID's are String values.
     */

    var oid;

    //  NOTE the logic here is intended to return a newly generated OID if
    //  the receiver turns out to be non-mutable
    if (TP.notValid(oid = this.$$oid) && !TP.isNode(this)) {
        oid = TP.sys.constructOID(TP.ifInvalid(aPrefix, 'window'));
        this.$$oid = oid;
    }

    return oid;
});

//  ------------------------------------------------------------------------

Window.Inst.defineMethod('getID',
function(aPrefix) {

    /**
     * @method getID
     * @summary Returns the public ID of the receiver. If the receiving object
     *     doesn't have an ID set the objects' OID is returned instead. See
     *     $getOID for more info. For UI elements in the DOM this method will
     *     return the attribute id='val' value.
     * @description Using a two-layer ID scheme allows the system to maintain an
     *     internal identifier in the form of OID values and at the same time
     *     allow developers to register certain objects under explicitly defined
     *     identifiers. This is an important feature for developing cross-frame
     *     where incoming pages need a public, well-known identifier, to acquire
     *     a reference to objects in other frames. It's also a key element of
     *     how to get different frames to coordinate on signal origins.
     * @param {String} aPrefix An optional prefix which will be prepended to any
     *     generated value.
     * @returns {String} Currently all OID's are String values.
     */

    if (TP.notValid(this[TP.ID])) {
        return this.$getOID(aPrefix);
    }

    return this[TP.ID];
});

//  ------------------------------------------------------------------------

Window.Inst.defineMethod('setID',
function(anID) {

    /**
     * @method setID
     * @summary Sets the public ID of the receiver. Public IDs are useful as
     *     handles for acquiring objects from the TIBET instance hashes. See the
     *     comment for getID(). Note that the object is un-registered under its
     *     old ID by this operation.
     * @param {String} anID The value to use as a public ID.
     * @returns {String} The ID that was set.
     */

    var id,
        wasRegistered;

    //  If the receiver was registered under an 'id', unregister it and
    //  re-register with the new ID below.
    if (TP.isValid(id = this[TP.ID])) {
        if (TP.isValid(TP.sys.hasRegistered)) {
            wasRegistered = TP.sys.hasRegistered(this, id);
            TP.sys.unregisterObject(this, id);
        }
    }

    //  default invalid entries to the OID
    id = TP.notValid(anID) ? this.$getOID() : anID;

    this[TP.ID] = id;

    if (wasRegistered) {
        TP.sys.registerObject(this, id);
    }

    return this[TP.ID];
});

//  ------------------------------------------------------------------------
//  REFLECTION - PART II (PrePatch)
//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getLocalName',
function() {

    /**
     * @method getLocalName
     * @summary Returns the local (aka short) name of the receiver without any
     *     namespace prefix. At this level, this returns the receiver's type
     *     name.
     * @returns {String} The receiver's local name.
     */

    return this.getTypeName();
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getNamespacePrefix',
function() {

    /**
     * @method getNamespacePrefix
     * @summary Returns the namespace (in TIBET terms) of the receiver. For
     *     example, the namespace of the TP.sig.Signal type is 'sig'. At this
     *     level, this returns the empty String.
     * @returns {String} The receiver's namespace.
     */

    return '';
});

//  ------------------------------------------------------------------------
//  CONVERSION
//  ------------------------------------------------------------------------

TP.definePrimitive('getParsedPrimitiveValue',
function(aVal) {

    /**
     * @method getParsedPrimitiveValue
     * @summary Returns a value by attempting to parse the supplied value (which
     *     should be a String) into one of the 'primitive JavaScript' types
     *     (Number, Boolean, RegExp, etc.)
     * @param {String} aVal The value to parse into a JS primitive.
     * @returns {Object} The value parsed into the primitive or null, if it
     *     can't be parsed.
     */

    if (!TP.isString(aVal)) {
        return aVal;
    }

    if (TP.regex.ANY_NUMBER.test(aVal)) {
        return 1 * aVal;
    }

    if (TP.regex.BOOLEAN_ID.test(aVal)) {
        return aVal === 'true';
    }

    if (TP.regex.REGEX_LITERAL_STRING.test(aVal)) {
        return TP.rc(aVal.slice(1, -1));
    }

    return;
});

//  ------------------------------------------------------------------------
//  STRING PROCESSING
//  ------------------------------------------------------------------------

TP.definePrimitive('sc',
function(varargs) {

    /**
     * @method sc
     * @summary String.construct shortcut, later replaced by a full-featured
     *     version that ensures the incoming string gets a chance at being
     *     localized. All arguments used in constructing Strings using TP.sc()
     *     are subject to localization based on the current source and target
     *     locale information. See TP.core.Locale for more information.
     * @param {Object} varargs A variable list of 0 to N values to build
     *     the String from.
     * @returns {String} A new instance.
     */

    var newStr;

    newStr = TP.ac(arguments);

    //  This should cause 'toString' to be called on each item in the Array.
    return newStr.join('');
});

//  ------------------------------------------------------------------------
//  STDIO
//  ------------------------------------------------------------------------

TP.definePrimitive('alert',
function(aMessage) {

    /**
     * @method alert
     * @summary Displays a message to the user. Advanced versions of this
     *     function make use of DHTML controls and a "curtain" to display the
     *     message in a modal fashion, or act in a non-modal fashion, offering
     *     usability improvements.
     * @param {String} aMessage The message for the user.
     * @example Notify the user of some event:
     *     <code>
     *          TP.alert('TIBET Rocks!');
     *     </code>
     * @example Notify the user of a condition at the TP.INFO level.
     *     <code>
     *          TP.alert('TIBET Rocks!', TP.INFO);
     *     </code>
     */

    /* eslint-disable no-alert */
    return window.alert(TP.sc(aMessage));
    /* eslint-enable no-alert */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('confirm',
function(anAction) {

    /**
     * @method confirm
     * @summary Displays a prompt to the user asking for confirmation of an
     *     action. Advanced versions of this function make use of DHTML controls
     *     and a "curtain" to display the prompt in a modal fashion, or act in a
     *     non-modal fashion, offering usability improvements over the native
     *     confirm function.
     * @param {String} anAction The action for the user to confirm.
     * @example Obtain an answer from the user:
     *     <code>
     *          TP.confirm('Perform Action?');
     *     </code>
     * @example Obtain an answer from the user on something important with the
     *     message wrapped in a <div class="critical"> element.
     *     <code>
     *          TP.confirm('Perform Action?', 'critical');
     *     </code>
     * @returns {Boolean} True if the user has approved the action.
     */

    /* eslint-disable no-alert */
    return window.confirm(TP.sc(anAction));
    /* eslint-enable no-alert */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('prompt',
function(aQuestion, aDefaultAnswer) {

    /**
     * @method prompt
     * @summary Displays a prompt to the user asking for data. Advanced
     *     versions of this function make use of DHTML controls and a "curtain"
     *     to display the prompt. NOTE that the prompt can be non-modal in more
     *     advanced versions. The initial version is a simple wrapper around the
     *     native JS prompt() function.
     * @param {String} aQuestion The question for the user.
     * @param {String} aDefaultAnswer The default answer, provided in the input
     *     field.
     * @example Obtain an answer from the user:
     *     <code>
     *          TP.prompt('Favorite color', 'Black');
     *     </code>
     * @example Obtain an answer from the user on something serious, where the
     *     message is wrapped in a <div class="emphasis"> element.
     *     <code>
     *          TP.prompt('Favorite color', 'Black', 'emphasis');
     *     </code>
     * @returns {String} The user's answer.
     */

    /* eslint-disable no-alert */
    return window.prompt(TP.sc(aQuestion), TP.sc(aDefaultAnswer) || '');
    /* eslint-enable no-alert */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('status',
function(aMessage, aTarget) {

    /**
     * @method status
     * @summary Displays a message to the user in a window's status bar, or in
     *     a targeted status "zone" such as those found in the standard TIBET
     *     Application Platform (TAP) interface.
     * @param {String} aMessage The message for the user.
     * @param {Window|String|Number} aTarget A window, a window ID, or a status
     *     "zone" number.
     * @example Notify the user of some event:
     *     <code>
     *          TP.status('TIBET Rocks!');
     *     </code>
     */

    var msg,
        win,
        elem;

    msg = aMessage;

    if (TP.notValid(aTarget)) {
        top.status = msg;

        return;
    }

    if (TP.isString(aTarget)) {
        //  acquire a window by that ID
        win = TP.sys.getWindowById(aTarget);
        if (TP.isWindow(win)) {
            win.top.status = msg;
        }
    } else if (TP.isNumber(aTarget)) {
        //  try to acquire the status zone with that identifier...
        elem = TP.byId('status' + aTarget, TP.uidoc(true));
        if (TP.isElement(elem)) {
            //  Note how we pass 'null' here for the 'loaded function' and
            //  'false' to not awaken the content.
            TP.htmlElementSetContent(elem, msg, null, false);
        }
    } else if (TP.isWindow(aTarget)) {
        aTarget.top.status = msg;
    }

    return;
});

//  ------------------------------------------------------------------------
//  DEBUGGING/LOGGING
//  ------------------------------------------------------------------------

TP.definePrimitive('stop',
function(aFlagOrParam) {

    /**
     * @method stop
     * @summary A stand-in for the debugger keyword that won't cause Safari to
     *     complain about syntax errors. Also a convenient way to provide if
     *     (some condition) debugger; logic. By providing either a Boolean or a
     *     configuration parameter name to this function you can simplify coding
     *     as in:
     *
     *     TP.stop('break.uri_construct');
     *
     *     The previous example will trigger the debugger if a call to
     *     TP.sys.cfg('break.uri_construct') returns true. You'll see this kind
     *     of idiomatic use throughout TIBET to set conditional break locations
     *     that help avoid having to reload to debug. NOTE that
     *     TP.sys.cfg('break.use_debugger') must be true for this function to
     *     test/break, otherwise it simply returns.
     * @param {Boolean|String} aFlagOrParam False to not trigger the debugger.
     *     When a string is provided it should be the name of a configuration
     *     parameter. Default is true.
     * @example Set a permanent "breakpoint" via a debugger statement.
     *     <code>
     *          TP.stop();
     *     </code>
     * @example Set a conditional "breakpoint" that will trigger when the
     *     configuration parameter break.document_loaded is true.
     *     <code>
     *          TP.stop('break.document_loaded');
     *     </code>
     */

    if (!TP.sys.cfg('debug.use_debugger')) {
        return;
    }

    if (aFlagOrParam !== undefined) {
        if (TP.isString(aFlagOrParam)) {
            if (TP.sys.cfg(aFlagOrParam) !== true) {
                return;
            }
        } else if (aFlagOrParam !== true) {
            //  null values (not undefined) are passed when consumer used
            //  $cfg themselves...so catch that here. if the call didn't
            //  include a nested cfg call the param would have been undef
            return;
        }
    }

    try {
        /* jshint -W087 */
        /* eslint-disable no-debugger */
        debugger;
        /* eslint-enable no-debugger */
        /* jshint +W087 */
    } catch (e) {
        //  empty
    }

    return;
});

//  ------------------------------------------------------------------------
//  ARRAY PRIMITIVES
//  ------------------------------------------------------------------------

/*
Baseline array functions that get replaced later in the kernel. They're
provided here to support the DOM primitives during early kernel operation.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('ac',
function() {

    /**
     * @method ac
     * @summary The standard array construction method in TIBET. Constructs and
     *     returns a new array instance from the argument list. NOTE that unlike
     *     'new Array' this call does not use the first argument as a count when
     *     only one argument is provided. All arguments are treated as array
     *     elements.
     * @description One of TIBET's standard "shorthand constructors" which
     *     follow the pattern $[firstInitialOfType]c(), for example TP.ac() for
     *     Array.construct, TP.dc() for Date.construct, TP.rc() for
     *     RegExp.construct. While some of these don't appear to offer much
     *     value over their native counterparts the ability to control object
     *     creation turns out to be a very powerful feature that is leveraged by
     *     both development tools and other library elements. For example,
     *     versions of TP.ac() defined later in the loading process support
     *     passing arguments and nodelist objects to convert them into native
     *     arrays for easier processing.
     * @example Construct a simple array:
     *     <code>
     *          arr = TP.ac();
     *     </code>
     * @example Construct an array from an arguments object:
     *     <code>
     *          arr = TP.args(arguments);
     *     </code>
     * @example Construct an array with a single string element:
     *     <code>
     *          arr = TP.ac('prefix string');
     *     </code>
     * @returns {Array} A new array.
     */

    var arr;

    //  NOTE that we don't use literal creation syntax since that can have
    //  differing behavior on IE based on current window export state.
    /* jshint -W009 */
    /* eslint-disable no-array-constructor */
    arr = new Array();
    /* eslint-enable no-array-constructor */
    /* jshint +W009 */
    if (arguments.length === 0) {
        return arr;
    } else {
        return arr.slice.call(arguments, 0);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('args',
function(anArgArray, aStart, anEnd) {

    /**
     * @method args
     * @summary Constructs and returns an Array containing the values from
     *     anArgArray from aStart to anEnd. By default the entire arguments
     *     object is copied into the array.
     * @param {Arguments} anArgArray A native arguments object.
     * @param {Number} aStart A starting offset for the copy. Default is 0.
     * @param {Number} anEnd An ending index for the copy. Default is
     *     anArgArray.length.
     * @example Construct a new array containing all elements of an argument
     *     array:
     *     <code>
     *          arr = TP.args(arguments);
     *     </code>
     * @example Construct a new array from arguments 2 through N:
     *     <code>
     *          arr = TP.args(arguments, 1);
     *     </code>
     * @returns {Array} A new array.
     */

    var len,
        start,
        end;

    len = arguments.length;
    if (len === 0) {
        return this.raise('TP.sig.InvalidParameter',
            'No arguments object provided.');
    } else if (len === 1) {
        return TP.ArrayProto.slice.call(anArgArray, 0);
    } else if (len === 2) {
        start = TP.notValid(aStart) ? 0 : aStart;
        return TP.ArrayProto.slice.call(anArgArray, start);
    } else {
        start = TP.notValid(aStart) ? 0 : aStart;
        end = TP.notValid(anEnd) ? anArgArray.length :
            Math.max(anArgArray.length, anEnd);
        return TP.ArrayProto.slice.call(anArgArray, start, end);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('join',
function() {

    /**
     * @method join
     * @summary Constructs and returns a new string instance by joining the
     *     arguments via an Array.
     * @example Construct a new joined string of markup without using +=:
     *     <code>
     *          str = TP.join('Hello ', username, ' from TIBET!');
     *     </code>
     * @returns {String} A new string.
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
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('add',
function() {

    /**
     * @method add
     * @summary Appends one or more objects to the receiver. This primitive
     *     version does not provide change notification so it's equivalent to
     *     the native Array push call, but instead of returning a count like
     *     push(), it returns the receiver for easier method chaining.
     * @example Add one or more elements to an array:
     *     <code>
     *          arr = TP.ac();
     *          arr.add(varA, varB, varC);
     *     </code>
     * @returns {Array} The receiver.
     * @addon Array
     */

    var i,
        len,
        size;

    size = this.length;
    len = arguments.length;
    for (i = 0; i < len; i++) {
        this[size + i] = arguments[i];
    }

    return this;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('getSize',
function() {

    /**
     * @method getSize
     * @summary Returns the size of the receiver. For simple arrays this is the
     *     length.
     * @returns {Number} The size.
     */

    return this.length;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('item',
function(anIndex) {

    /**
     * @method item
     * @summary Returns the value found at anIndex. NOTE that using item() is
     *     actually a deprecated practice in TIBET, you should use at() instead
     *     and convert nodelists to arrays using TP.ac().
     * @param {Number} anIndex The index to use for lookup.
     * @returns {Object} The value at anIndex.
     * @addon Array
     */

    return this.at(anIndex);
});

//  ------------------------------------------------------------------------
//  CONFORMANCE
//  ------------------------------------------------------------------------

/*
Although you'd like to believe that all things you'll be passed in JS will
inherit from TP.ObjectProto it just ain't so... Also, null, undefined, etc.
don't respond to method calls so you can't test them without working from the
outside. For that reason we don't rely on a method such as "respondsTo" or
"conformsTo" - we add a global "TP.canInvoke()" call that takes an object and
an "interface" in the form of a string or array of strings, each of which
represents a method to test. This approach allows you to check for
conformance/responsiveness regardless of what the inbound object might be.
*/

//  ------------------------------------------------------------------------
//  STDIO
//  ------------------------------------------------------------------------

/*
Define the initial default mappings for input, output, and error messaging.
*/

TP.definePrimitive('stdin', TP.boot.STDIN_PROMPT);
TP.definePrimitive('stdout', TP.boot.STDOUT_LOG);
TP.definePrimitive('stderr', TP.boot.STDERR_LOG);

//  ------------------------------------------------------------------------
//  METADATA
//  ------------------------------------------------------------------------

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

TP.boot.$$setupMetadata = function(aWindow) {

    var populateMetadata,
        win;

    win = aWindow || window;

    populateMetadata = function(target, type,
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
    populateMetadata(
            win.Array, win.Array, win.Function, win.Function,
            'Array', 'Array', 'Array',
            win.Object, TP.ac(win.Object), TP.ac('Object'));

    //  Boolean
    populateMetadata(
            win.Boolean, win.Boolean, win.Function, win.Function,
            'Boolean', 'Boolean', 'Boolean',
            win.Object, TP.ac(win.Object), TP.ac('Object'));

    //  Date
    populateMetadata(
            win.Date, win.Date, win.Function, win.Function,
            'Date', 'Date', 'Date',
            win.Object, TP.ac(win.Object), TP.ac('Object'));

    //  Function
    populateMetadata(
            win.Function, win.Function, win.Function, win.Function,
            'Function', 'Function', 'Function',
            win.Object, TP.ac(win.Object), TP.ac('Object'));

    //  Number
    populateMetadata(
            win.Number, win.Number, win.Function, win.Function,
            'Number', 'Number', 'Number',
            win.Object, TP.ac(win.Object), TP.ac('Object'));

    //  Object
    populateMetadata(
            win.Object, win.Object, win.Function, win.Function,
            'Object', 'Object', 'Object',
            null, TP.ac(), TP.ac());

    //  RegExp
    populateMetadata(
            win.RegExp, win.RegExp, win.Function, win.Function,
            'RegExp', 'RegExp', 'RegExp',
            win.Object, TP.ac(win.Object), TP.ac('Object'));

    //  String
    populateMetadata(
            win.String, win.String, win.Function, win.Function,
            'String', 'String', 'String',
            win.Object, TP.ac(win.Object), TP.ac('Object'));

    //  The subtypes (and 'deep subtypes') of Object are the other "big 7"
    win.Object[TP.SUBTYPES] =
            TP.ac(win.Array, win.Boolean, win.Date, win.Function, win.Number,
                    win.RegExp, win.String);
    win.Object[TP.SUBTYPES_DEEP] =
            TP.ac(win.Array, win.Boolean, win.Date, win.Function, win.Number,
                    win.RegExp, win.String);
    win.Object[TP.SUBTYPE_NAMES] =
            TP.ac('Array', 'Boolean', 'Date', 'Function',
                    'Number', 'RegExp', 'String');
    win.Object[TP.SUBTYPE_NAMES_DEEP] =
            TP.ac('Array', 'Boolean', 'Date', 'Function',
                    'Number', 'RegExp', 'String');

    //  Now we instrument DOM-specific 'types'

    //  Window
    populateMetadata(
            win.Window, win.Window, win.Function, win.Function,
            'DOMWindow', 'DOMWindow', 'DOMWindow',
            win.Object, TP.ac(win.Object), TP.ac('Object'));
    win.Window.$$nonFunctionConstructorObjectName = 'DOMWindow';

    //  Need to tell our machinery that NaN's *constructor* name is
    //  'Number'
    /* jshint ignore:start */
    /* eslint-disable no-proto */
    win.NaN.__proto__.$$nonFunctionConstructorConstructorName = 'Number';
    /* eslint-enable no-proto */
    /* jshint ignore:end */

    //  Browser-specific DOM 'types'

    //  Webkit

    if (TP.boot.$$isWebkit()) {

        populateMetadata(
                win.XMLDocument, win.XMLDocument, win.Function, win.Function,
                'XMLDocument', 'XMLDocument', 'XMLDocument',
                win.Document,
                TP.ac(win.Document, win.Node, win.Object),
                TP.ac('Document', 'Node', 'Object'));

        populateMetadata(
                win.XMLHttpRequest, win.XMLHttpRequest,
                    win.Function, win.Function,
                'XMLHttpRequest', 'XMLHttpRequest', 'XMLHttpRequest',
                win.Object,
                TP.ac(win.Object),
                TP.ac('Object'));

    }

    //  Firefox

    if (TP.boot.$$isMoz()) {

        populateMetadata(
                win.CSS2Properties, win.CSS2Properties, win.Function,
                    win.Function,
                'CSSStyleDeclaration',
                'CSSStyleDeclaration',
                'CSSStyleDeclaration',
                win.Object,
                TP.ac(win.Object),
                TP.ac('Object'));
    }

    win.$$hasMetadata = true;
};

//  We need to set up metadata for ourself - the other UI frames have all done
//  it (or will).
TP.boot.$$setupMetadata();

//  Note that we have to put this slot on TP.FunctionProto so that Host
//  types that are Functions in the system will find it and pass the check
//  that, since they at least have this slot, they should check against
//  their type name. See TP.isType() for more info.
TP.FunctionProto[TP.TNAME] = 'Function';

//  ------------------------------------------------------------------------
//  LOAD TRACKING
//  ------------------------------------------------------------------------

/*
As part of TIBET's boot/autoloading operations we keep track of the original
module, file, and node which were responsible for a particular object. This
helps with certain aspects of reflection, and provides the various tools
with ways to acquire or reload original source for an object very quickly.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('objectGetLoadPackage',
function(anObject) {

    /**
     * @method objectGetLoadPackage
     * @summary Returns the package name from which the script defining the
     *     object's node was loaded.
     * @param {Object} anObject The object to query.
     * @returns {String} The module name for the object's node.
     */

    var node;

    if (TP.notValid(node = this.objectGetLoadNode(anObject))) {
        return;
    }

    return node.getAttribute(TP.LOAD_PACKAGE);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('objectGetLoadCollectionPath',
function(anObject) {

    /**
     * @method objectGetLoadCollectionPath
     * @summary Returns the 'collection' path to the file responsible for the
     *     object (that is, the path minus the most specific part).
     * @param {Object} anObject The object to query.
     * @returns {String} The load collection path where the receiver can be
     *     found.
     */

    var path;

    if (TP.notValid(path = TP.objectGetLoadPath(anObject))) {
        return;
    }

    return path.slice(0, path.lastIndexOf('/'));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('objectGetLoadPath',
function(anObject) {

    /**
     * @method objectGetLoadPath
     * @summary Returns the path to the file responsible for the object.
     * @param {Object} anObject The object to query.
     * @returns {String} The load path where the receiver can be found.
     */

    if (TP.notValid(anObject)) {
        return;
    }

    return anObject[TP.LOAD_PATH];
});

//  ------------------------------------------------------------------------

TP.definePrimitive('objectGetLoadConfig',
function(anObject) {

    /**
     * @method objectGetLoadConfig
     * @summary Returns the module target from which the object's node was
     *     loaded.
     * @param {Object} anObject The object to query.
     * @returns {String} The module target for the object's node.
     */

    var node;

    if (TP.notValid(node = this.objectGetLoadNode(anObject))) {
        return;
    }

    return node.getAttribute(TP.LOAD_CONFIG);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('objectGetMetadata',
function(anObject) {

    /**
     * @method objectGetMetadata
     * @summary Returns any metadata the system may have for the object. At the
     *     present time this only works for types and methods.
     * @param {Object} anObject The object to query.
     * @returns {Object} The metadata structure, if any.
     */

    var name;

    name = TP.objectGetMetadataName(anObject);
    if (TP.isEmpty(name)) {
        return;
    }

    if (TP.isType(anObject)) {
        return TP.sys.getMetadata('types').at(name);
    } else if (TP.isMethod(anObject)) {
        return TP.sys.getMetadata('methods').at(name);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('objectGetSourceCollectionPath',
function(anObject) {

    /**
     * @method objectGetSourceCollectionPath
     * @summary Returns the 'collection' path to the original source file,
     *     before any bundling or rollup processing, where the object resides
     *     (that is, the path minus the most specific part).
     * @param {Object} anObject The object to query.
     * @returns {String} The source collection path where the receiver can be
     *     found.
     */

    var path;

    if (TP.notValid(path = TP.objectGetSourcePath(anObject))) {
        return;
    }

    return path.slice(0, path.lastIndexOf('/'));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('objectGetSourcePath',
function(anObject) {

    /**
     * @method objectGetSourcePath
     * @summary Returns the path to the original source file, before any
     *     bundling or rollup processing, where the object resides.
     * @param {Object} anObject The object to query.
     * @returns {String} The load path where the receiver can be found.
     */

    if (TP.notValid(anObject)) {
        return;
    }

    return anObject[TP.SOURCE_PATH];
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriGetLoadPackage',
function(aPath) {

    /**
     * @method uriGetLoadPackage
     * @summary Returns the package path responsible for loading the file.
     * @param {String} aPath A filename, typically without any root information.
     * @returns {String} The package file path responsible for including the
     *     path in the load.
     */

    var node;

    if (TP.notValid(node = this.uriGetLoadNode(aPath))) {
        return;
    }

    return node.getAttribute(TP.LOAD_PACKAGE);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriGetLoadNode',
function(aPath) {

    /**
     * @method uriGetLoadNode
     * @summary Returns the script node responsible for loading the file. The
     *     resulting script node can then be assigned as the "load node" for
     *     various system objects, allowing them to be related back to their
     *     original source file.
     * @param {String} aPath A filename, typically without any root information.
     * @returns {Node} The script node responsible for the supplied file.
     */

    var nodes,
        len,
        i,
        node,
        src;

    //  grab all of the script nodes, regardless of where they were
    //  positioned in the document (head or body)
    nodes = document.getElementsByTagName('script');

    //  NOTE    that we test for both src="" and source="" (a
    //  TIBET-specific slot the boot system uses to help us track this
    //  without altering the src attribute).
    len = nodes.length;
    for (i = 0; i < len; i++) {
        node = nodes[i];
        src = node.getAttribute('src') || node.getAttribute('source');
        if (TP.isString(src)) {
            if (src.indexOf(aPath) !== TP.NOT_FOUND) {
                return node;
            }
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('uriGetLoadConfig',
function(aPath) {

    /**
     * @method uriGetLoadConfig
     * @summary Returns the package config responsible for loading the file.
     * @param {String} aPath A filename, typically without any root information.
     * @returns {String} The package config name responsible for including the
     *     path in the load.
     */

    var node;

    if (TP.notValid(node = this.uriGetLoadNode(aPath))) {
        return;
    }

    return node.getAttribute(TP.LOAD_CONFIG);
});

//  ------------------------------------------------------------------------
//  UI CANVAS
//  ------------------------------------------------------------------------

/*
TIBET is designed to work with multiple windows and/or frames. That means
that at any particular time there's a "UI Canvas" that's the current focus
for display operations, but that this can shift as the application runs. The
initial window/frame for the application is known in TIBET as the "UI Root"
which serves as a common anchor point for resetting the UI Canvas.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getUICanvas',
function(unwrapped) {

    /**
     * @method getUICanvas
     * @summary Returns the currently active UI canvas object as a TIBET
     *     window/frame wrapper.
     * @param {Boolean} unwrapped True to return the native window or iframe.
     * @example Grab the current UI canvas (which is a TP.core.Window):
     *     <code>
     *          canvasWin = TP.sys.getUICanvas();
     *     </code>
     *
     *     Grab the native window from that:
     *     <code>
     *          nativeWin = canvasWin.getNativeWindow();
     *     </code>
     * @returns {TP.core.Window} The TP.core.Window wrapping the active UI
     *     canvas.
     */

    var name,
        obj;

    name = TP.sys.getUICanvasName();
    obj = TP.sys.getWindowById(name);

    if (TP.isWindow(obj)) {
        if (TP.isTrue(unwrapped)) {
            return obj;
        } else {
            return TP.core.Window.construct(obj);
        }
    }

    //  Proposed window name was not found. The thing is, TIBET always needs a
    //  canvas so we have to work our way up the proposed path until we find a
    //  window that is valid.
    while (name.indexOf('.') !== -1) {
        name = name.slice(0, name.lastIndexOf('.'));
        obj = TP.sys.getWindowById(name);

        if (TP.isWindow(obj)) {
            if (TP.isTrue(unwrapped)) {
                return obj;
            } else {
                return TP.core.Window.construct(obj);
            }
        }
    }

    //  Absolute last chance...and if this doesn't work it's not really a proper
    //  TIBET application since the UIROOT frame has gone missing.
    obj = TP.sys.getWindowById('top.UIROOT');
    if (TP.isWindow(obj)) {
        if (TP.isTrue(unwrapped)) {
            return obj;
        } else {
            return TP.core.Window.construct(obj);
        }
    }

    this.raise('InvalidFraming', 'No UIROOT found.');
});

//  ------------------------------------------------------------------------

//  alias uiwin to getUICanvas
TP.sys.uiwin = TP.sys.getUICanvas;

//  ------------------------------------------------------------------------

TP.sys.defineMethod('uidoc',
function(unwrapped) {

    /**
     * @method uidoc
     * @summary Returns the current UI document in either wrapped or unwrapped
     *     form. The default is wrapped.
     * @param {Boolean} unwrapped True to unwrap the document.
     * @returns {TP.core.Document|Document}
     */

    var obj;

    if (TP.isTrue(unwrapped)) {
        obj = TP.sys.getUICanvas(true);
        if (TP.isWindow(obj)) {
            return obj.document;
        }

        return;
    }

    return TP.sys.getUICanvas().getDocument();
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getUICanvasName',
function() {

    /**
     * @method getUICanvasName
     * @summary Returns the currently active UI canvas object's name.
     * @returns {String} The name of the active UI canvas.
     */

    var name;

    name = TP.ifInvalid(TP.sys.$uiCanvas, TP.sys.cfg('tibet.uicanvas'));
    name = TP.ifInvalid(name, TP.sys.cfg('boot.canvas'));

    //  update the value to whatever we just defined as the value
    TP.sys.$uiCanvas = name;

    return name;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getUICanvasPath',
function() {

    /**
     * @method getUICanvasPath
     * @summary Returns the currently active UI canvas object's "path", which
     *     for TIBET means returning the TIBET URI string which can be used to
     *     identify/acquire the UI canvas. This will be a string of the form
     *     'tibet://.../' where the remaining elements of the URI represent a
     *     path to the window object such at 'tibet://top/'.
     * @returns {String} The path containing the path to the active UI canvas.
     */

    return 'tibet://' + TP.gid(TP.sys.getUICanvas(true)) + '/';
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getUIRoot',
function(unwrapped) {

    /**
     * @method getUIRoot
     * @summary Returns the current root UI canvas as a TIBET window/frame
     *     wrapper.
     * @param {Boolean} unwrapped True to return the native window or iframe.
     * @returns {TP.core.Window} The TP.core.Window wrapping the root UI canvas.
     */

    if (TP.isTrue(unwrapped)) {
        return TP.sys.getWindowById(TP.sys.getUIRootName());
    }

    return TP.byOID(TP.sys.getUIRootName());
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getUIRootName',
function() {

    /**
     * @method getUIRootName
     * @summary Returns the root UI canvas object's name. Defaults on initial
     *     invocation to the UI canvas name.
     * @returns {String} The name of the top UI canvas.
     */

    var name;

    name = TP.ifInvalid(TP.sys.$uiRoot, TP.sys.cfg('tibet.uiroot'));

    //  If there is no 'ui root' defined, we go after the current
    //  'ui canvas'.
    name = TP.ifInvalid(name, TP.sys.getUICanvasName());

    TP.sys.$uiRoot = name;

    return name;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('setUICanvas',
function(aCanvas) {

    /**
     * @method setUICanvas
     * @summary Defines the currently active UI canvas for later reference.
     *     Setting the UI canvas will cause certain display routines to start
     *     using the new canvas for their output.
     * @param {String|TP.core.Window} aCanvas The global ID of the
     *     TP.core.Window canvas or the TP.core.Window canvas itself to use as
     *     the currently active UI canvas.
     * @returns {TP.core.Window} The currently active UI canvas.
     */

    var name;

    if (TP.isString(aCanvas)) {
        name = aCanvas;
        TP.sys.$uiCanvas = name;
        TP.sys.setcfg('tibet.uicanvas', name);

        return TP.byOID(name);
    } else if (TP.canInvoke(aCanvas, 'getNativeWindow')) {
        name = TP.gid(aCanvas.getNativeWindow());
        TP.sys.$uiCanvas = name;
        TP.sys.setcfg('tibet.uicanvas', name);

        return aCanvas;
    } else {
        name = TP.gid(aCanvas);
        TP.sys.$uiCanvas = name;
        TP.sys.setcfg('tibet.uicanvas', name);

        return aCanvas;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('setUIRoot',
function(aCanvas) {

    /**
     * @method setUIRoot
     * @summary Defines the root UI canvas for later reference. This is
     *     normally set only once, during application startup, to define a
     *     consistent UI anchor point for the application.
     * @param {String|TP.core.Window} aCanvas The global ID of the
     *     TP.core.Window canvas or the TP.core.Window canvas itself to use as
     *     the root UI canvas.
     * @returns {TP.core.Window} The root UI canvas.
     */

    var name;

    if (TP.isString(aCanvas)) {
        name = aCanvas;
        TP.sys.$uiRoot = name;
        TP.sys.setcfg('tibet.uiroot', name);

        return TP.byOID(name);
    } else {
        name = TP.gid(aCanvas);
        TP.sys.$uiRoot = name;
        TP.sys.setcfg('tibet.uiroot', name);

        return aCanvas;
    }

    return null;
});

//  ------------------------------------------------------------------------
//  DEBUGGING - PART I (PrePatch)
//  ------------------------------------------------------------------------

/**
 * @TIBET supports lightweight debugging through a variety of functions that
 *     leverage signaling and logging. This section includes stubs for
 *     operations which may be called prior to the full signaling system being
 *     installed.
 */

//  ------------------------------------------------------------------------

TP.definePrimitive('signal',
function(anOrigin, aSignal, aPayload) {

    /**
     * @method signal
     * @summary Pre-signaling TP.signal() stub. This version gets overlaid with
     *     a more powerful version later in the load process. This avoids load
     *     dependency problems and uses TP.stdout() or TP.boot.$stdout() rather
     *     than actually triggering a signal.
     * @param {Object} anOrigin The object serving as the signal's origin.
     * @param {TP.sig.Signal} aSignal The signal type to be fired.
     * @param {Object} aPayload An object containing optional arguments. Passed
     *     without alteration to handlers -- the "payload".
     */

    //  during early kernel load calls to this will simply get written to
    //  stdout

    var str;

    if (TP.sys.cfg('log.signals')) {
        str = TP.join('origin: ', anOrigin,
                        ' signaled: ', aSignal,
                        ' with: ', aPayload);

        if (TP.isCallable(TP.stdout)) {
            //  kernel version
            TP.stdout(str);
        } else if (TP.isCallable(TP.boot.$stdout)) {
            //  boot system version
            TP.boot.$stdout(str, TP.DEBUG);
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('raise',
function(anOrigin, anExceptionType, aPayload) {

    /**
     * @method raise
     * @summary Pre-signaling TP.raise() stub. This version gets overlaid with
     *     a more powerful version later in the load process.
     * @param {Object} anOrigin The object serving as the exception's origin.
     * @param {TP.sig.Exception} anExceptionType The type of exception to fire.
     * @param {Object} aPayload An object containing optional arguments. Passed
     *     without alteration to handlers.
     */

    //  note that we don't mention the firing policy in this version
    return TP.signal(anOrigin, anExceptionType, aPayload);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('raise',
function(anExceptionType, aPayload) {

    /**
     * @method raise
     * @summary Default error handling call, i.e. this.raise('Something'); The
     *     receiver is used as the origin in a subsequent call to TP.raise()
     *     which provides the functional implementation.
     * @param {TP.sig.Exception} anExceptionType The type of exception to fire.
     * @param {Object} aPayload An object containing optional arguments. Passed
     *     without alteration to handlers.
     */

    return TP.raise(this, anExceptionType, aPayload);
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('raise',
function(anExceptionType, aPayload) {

    /**
     * @method raise
     * @summary Default error handling call, i.e. this.raise('Something'); The
     *     receiver is used as the origin in a subsequent call to TP.raise()
     *     which provides the functional implementation.
     * @param {TP.sig.Exception} anExceptionType The type of exception to fire.
     * @param {Object} aPayload An object containing optional arguments. Passed
     *     without alteration to handlers.
     */

    return TP.raise(this, anExceptionType, aPayload);
});

//  ------------------------------------------------------------------------
//  "VALID" vs. NULL vs. UNDEFINED
//  ------------------------------------------------------------------------

/*
It's not always sufficient just to ask if x == null since that doesn't
tell us whether it's null or undefined. In TIBET terms these are very
different since null means "that is a valid attribute, whose value has not
been set, or whose value has been set to null since it is n/a", while
undefined means "huh? never heard of it". While === knows the difference it
still misses the point for many tests, which can still be fooled by the
automatic conversion to boolean that JS will do in a boolean context.

This section provides wrapper functions for testing the true nature of a
variable or argument and taking action in certain cases. Many of these can
be implemented via the ternary operator or via JS's native "short circuit"
boolean operators (|| and &&) but the semantics of those approaches depend
on the loose definition of true/false based on automatic type conversions
and don't always operate as expected, particularly in the face of bad data.
In other words, they work fine if all you code for is the "happy path", but
they can fail miserably when testing with bad data so we usually avoid them.

In TIBET, the term 'valid' means "defined and not null" and is the standard
test usually implied by 'if (x) or if (!x)' as in, if (TP.isValid(x)) or if
(TP.notValid(x)).

In our opinion it is never good practice to use 'if (x)' in JS, just like
it's never good practice to do that in Perl or other languages where an
empty string or a numeric 0 might lead you astray. For that reason you'll
rarely see that syntax, or certain forms of boolean operator usage that
might be common in other JS libraries, in TIBET source code.
*/

//  ------------------------------------------------------------------------
//  Key-based Defaulting
//  ------------------------------------------------------------------------

TP.definePrimitive('ifKeyInvalid',
function(anObject, aKey, aDefault) {

    /**
     * @method ifKeyInvalid
     * @summary Returns aDefault value when anObject is either invalid, or the
     *     property value is. When the object implements atIfInvalid as a method
     *     this wrapper will invoke that call with the default to allow the
     *     object to manage the semantics of this call itself. This call is used
     *     often with parameter sets as a way of ensuring that even when a
     *     parameter object isn't provided local variables can be defaulted
     *     efficiently. NOTE that as a result only atIfInvalid() and at() are
     *     tested before attempting direct property access.
     * @param {Object} anObject The object whose property to access or default.
     * @param {String} aKey The property name to access.
     * @param {Object} aDefault A value, or function used to derive that value.
     *     NOTE that since function defaults are invoked they cannot be used as
     *     values in their own right. When invoked as a function the property
     *     value is provided.
     * @returns {Object} A value from the object, or the default value.
     */

    var val;

    //  easiest case is when the object (parameter/request) isn't there
    if (TP.notValid(anObject)) {
        return TP.isCallable(aDefault) ? aDefault(aKey) : aDefault;
    }

    if (TP.canInvoke(anObject, 'atIfInvalid')) {
        return anObject.atIfInvalid(aKey, aDefault);
    }

    if (TP.canInvoke(anObject, 'at')) {
        val = anObject.at(aKey);
        if (TP.notValid(val)) {
            val = TP.isCallable(aDefault) ? aDefault(aKey) : aDefault;
        }

        return val;
    }

    try {
        val = anObject[aKey];
        if (TP.notValid(val)) {
            val = TP.isCallable(aDefault) ? aDefault(aKey) : aDefault;
        }

        return val;
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'Could not default invalid key: ' + aKey),
                        TP.LOG) : 0;
    }

    return TP.isCallable(aDefault) ? aDefault(aKey) : aDefault;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('ifKeyNull',
function(anObject, aKey, aDefault) {

    /**
     * @method ifKeyNull
     * @summary Returns aDefault value when anObject is either specifically
     *     null, or the property value is. When the object implements atIfNull
     *     as a method this wrapper will invoke that call with the default to
     *     allow the object to manage the semantics of this call itself.
     * @param {Object} anObject The object whose property to access or default.
     * @param {String} aKey The property name to access.
     * @param {Object} aDefault A value, or function used to derive that value.
     *     NOTE that since function defaults are invoked they cannot be used as
     *     values in their own right. When invoked as a function the property
     *     value is provided.
     * @returns {Object} A value from the object, or the default value.
     */

    var val;

    //  easiest case is when the object (parameter/request) isn't there
    if (TP.notValid(anObject)) {
        return TP.isCallable(aDefault) ? aDefault(aKey) : aDefault;
    }

    if (TP.canInvoke(anObject, 'atIfNull')) {
        return anObject.atIfNull(aKey, aDefault);
    }

    if (TP.canInvoke(anObject, 'at')) {
        val = anObject.at(aKey);
        if (TP.isNull(val)) {
            val = TP.isCallable(aDefault) ? aDefault(aKey) : aDefault;
        }

        return val;
    }

    try {
        val = anObject[aKey];
        if (TP.isNull(val)) {
            val = TP.isCallable(aDefault) ? aDefault(aKey) : aDefault;
        }

        return val;
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'Could not default null key: ' + aKey),
                        TP.LOG) : 0;
    }

    return TP.isCallable(aDefault) ? aDefault(aKey) : aDefault;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('ifKeyUndefined',
function(anObject, aKey, aDefault) {

    /**
     * @method ifKeyUndefined
     * @summary Returns aDefault value when anObject is specifically undefined,
     *     or the property value is. When the object implements atIfUndefined as
     *     a method this wrapper will invoke that call with the default to allow
     *     the object to manage the semantics of this call itself.
     * @param {Object} anObject The object whose property to access or default.
     * @param {String} aKey The property name to access.
     * @param {Object} aDefault A value, or function used to derive that value.
     *     NOTE that since function defaults are invoked they cannot be used as
     *     values in their own right. When invoked as a function the property
     *     value is provided.
     * @returns {Object} A value from the object, or the default value.
     */

    var val;

    //  easiest case is when the object (parameter/request) isn't there
    if (TP.notValid(anObject)) {
        return TP.isCallable(aDefault) ? aDefault(aKey) : aDefault;
    }

    if (TP.canInvoke(anObject, 'atIfUndefined')) {
        return anObject.atIfUndefined(aKey, aDefault);
    }

    if (TP.canInvoke(anObject, 'at')) {
        val = anObject.at(aKey);
        if (TP.notDefined(val)) {
            val = TP.isCallable(aDefault) ? aDefault(aKey) : aDefault;
        }

        return val;
    }

    try {
        val = anObject[aKey];
        if (TP.notDefined(val)) {
            val = TP.isCallable(aDefault) ? aDefault(aKey) : aDefault;
        }

        return val;
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'Could not default undefined key: ' + aKey),
                        TP.LOG) : 0;
    }

    return TP.isCallable(aDefault) ? aDefault(aKey) : aDefault;
});

//  ------------------------------------------------------------------------
//  BOOLEAN TESTS
//  ------------------------------------------------------------------------

TP.definePrimitive('isFalse',
function(aValue) {

    /**
     * @method isFalse
     * @summary Return true if the argument is the Boolean 'false'. This is a
     *     more explicit test than 'if (!anObj)' since that test will often lead
     *     your code astray due to bizarre type conversions.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is false:
     *     <code>
     *          if (TP.isFalse(anObj)) { TP.alert('its false'); };
     *     </code>
     * @returns {Boolean} True if aValue === false.
     */

    //  Seems pendantic, but its the best performer

    if (aValue === false) {
        return true;
    }

    if (aValue === true) {
        return false;
    }

    /* eslint-disable no-extra-parens */
    return (TP.isBoolean(aValue) && aValue.valueOf() === false);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isFalsey',
function(aValue) {

    /**
     * @method isFalsey
     * @summary Return true if the argument is considered to be 'falsey',
     *     according to JavaScript rules.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is falsey:
     *     <code>
     *          if (TP.isFalsey('')) { TP.alert('its false'); };
     *     </code>
     * @returns {Boolean} True if aValue is a 'falsey' value.
     */

    if (aValue === false ||
        aValue === '' ||
        aValue === 0 ||
        aValue === undefined ||
        aValue === null ||
        TP.isNaN(aValue)) {

        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isTrue',
function(aValue) {

    /**
     * @method isTrue
     * @summary Return true if the argument is the Boolean 'true'. This is a
     *     more explicit test than 'if (anObj)' since that test will often lead
     *     your code astray due to bizarre type conversions.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is true:
     *     <code>
     *          if (TP.isTrue(anObj)) { TP.alert('its true'); };
     *     </code>
     * @returns {Boolean} True if aValue === true.
     */

    //  Seems pendantic, but its the best performer

    if (aValue === true) {
        return true;
    }

    if (aValue === false) {
        return false;
    }

    /* eslint-disable no-extra-parens */
    return (TP.isBoolean(aValue) && aValue.valueOf() === true);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isTruthy',
function(aValue) {

    /**
     * @method isTruthy
     * @summary Return true if the argument is considered to be 'truthy',
     *     according to JavaScript rules.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is truthy:
     *     <code>
     *          if (TP.isTruthy('hi')) { TP.alert('its true'); };
     *     </code>
     * @returns {Boolean} True if aValue is a 'truthy' value.
     */

    return !TP.isFalsey(aValue);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('notFalse',
function(aValue) {

    /**
     * @method notFalse
     * @summary Return true if the argument is not the Boolean 'false'. This is
     *     a more explicit test than 'if (anObj)' since that test will often
     *     lead your code astray due to bizarre type conversions.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is false:
     *     <code>
     *          if (TP.notFalse(anObj)) { TP.alert('its not false'); };
     *     </code>
     * @returns {Boolean} True if aValue !== false.
     */

    if (aValue === true) {
        return true;
    }

    if (aValue === false) {
        return false;
    }

    return !TP.isFalse(aValue);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('notTrue',
function(aValue) {

    /**
     * @method notTrue
     * @summary Return true if the argument is not the Boolean 'true'. This is
     *     a more explicit test than 'if (!anObj)' since that test will often
     *     lead your code astray due to bizarre type conversions.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is false:
     *     <code>
     *          if (TP.notTrue(anObj)) { TP.alert('its not true'); };
     *     </code>
     * @returns {Boolean} True if aValue !== true.
     */

    if (aValue === false) {
        return true;
    }

    if (aValue === true) {
        return false;
    }

    return !TP.isTrue(aValue);
});

//  ------------------------------------------------------------------------
//  TYPE CHECKING - PART I
//  ------------------------------------------------------------------------

/*
Fundamental type checks via a common is*() API. TIBET also includes an 'isa'
method which takes a Type or String typename as a parameter and performs
type checking using that type. The methods defined here are parallels which
operate at the global level and accept an instance as their parameter.

These methods are necessary since a) depending on browser not all objects
actually inherit from Object so methods can't be added to them reliably, b)
because 'null' isn't an object you can message (and therefore 'backstop')
like it is in Smalltalk, and c) typeof likely doesn't do what you think, and
when it does it's often wrong (see isFunction for an example).

NOTE that in these and several other areas you'll start to see more of an
"object testing" approach. We use browser detection to ensure that we're
running overall on a browser that we're willing to offer commercial support
for, and that means watching out for things like FF2.0.0.2 which you can't
determine via object testing. We then load a kernel built for that browser.
Once we've loaded code however, that code tends to emphasize object testing.
*/

//  ------------------------------------------------------------------------
//  Native type checking
//  ------------------------------------------------------------------------

TP.definePrimitive('isArgArray',
function(anObj) {

    /**
     * @method isArgArray
     * @summary Returns true if the object provided is an 'arguments' array, a
     *     very special object in JavaScript which isn't an Array.
     * @param {Object} anObj The object to test.
     * @example Test to see if 'arguments' is an arg Array:
     *     <code>
     *          TP.isArgArray(arguments);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is an 'arguments'
     *     array.
     */

    /* eslint-disable no-extra-parens */
    return (TP.isValid(anObj) &&
            TP.ObjectProto.toString.call(anObj) === '[object Arguments]');
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isArray',
function(anObj) {

    /**
     * @method isArray
     * @summary Returns true if the object provided is a JavaScript Array.
     * @param {Object} anObj The object to test.
     * @example Test to see if 'anObj' is an Array:
     *     <code>
     *          anObj = TP.ac();
     *          TP.isArray(anObj);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is a JavaScript
     *     Array.
     */

    //  Defined by ECMAScript edition 5
    return Array.isArray(anObj);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isBoolean',
function(anObj) {

    /**
     * @method isBoolean
     * @summary Returns true if the object provided is a boolean primitive or
     *     wrapper object.
     * @param {Object} anObj The object to test.
     * @returns {Boolean} Whether or not the supplied object is a boolean.
     */

    if (anObj === true || anObj === false) {
        return true;
    }

    //  if it says so, then it is (a primitive one)
    if (typeof anObj === 'boolean') {
        return true;
    }

    //  Boolean objects won't say so unless we check, and if the object
    //  is in another window the constructor test will fail so we have to go
    //  even further.
    /* eslint-disable no-extra-parens */
    return (TP.isValid(anObj) && (anObj.constructor === Boolean ||
                                TP.regex.BOOLEAN_CONSTRUCTOR.test(
                                    '' + anObj.constructor)));
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isDate',
function(anObj) {

    /**
     * @method isDate
     * @summary Returns true if the object provided is a date value.
     * @param {Object} anObj The object to test.
     * @returns {Boolean}
     */

    //  all dates report object as their primitive type (but so does null)
    if (TP.notValid(anObj) || typeof anObj !== 'object') {
        return false;
    }

    //  also watch out for foolishness around 'new Date(blah)' returning objects
    //  which aren't really dates (instead of null). The ECMA-402 i18n spec for
    //  ECMAScript defines that these objects should return 'Invalid Date' (and
    //  ECMAScript edition 5 specifies 'NaN' if they were created with an
    //  invalid number).
    if (anObj.toString() === 'Invalid Date' || anObj.toString() === 'NaN') {
        return false;
    }

    //  localizable check
    if (typeof TP.isKindOf === 'function') {
        return TP.isKindOf(anObj, 'Date');
    }

    //  last chance is constructor

    /* eslint-disable no-extra-parens */
    return (anObj.constructor === Date ||
            TP.regex.DATE_CONSTRUCTOR.test('' + anObj.constructor));
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isNumber',
function(anObj) {

    /**
     * @method isNumber
     * @summary Returns true if the object provided is a numeric value. We do
     *     not consider NaN (NotANumber) to be a number for purposes of this
     *     test since our semantic usage of isNumber is based on testing
     *     parseInt results to see if a user has entered a valid numeric value
     *     or if data from a service is numeric.
     * @description The obvious question is why not use typeof anObj ==
     *     "number"? Well, because typeof NaN == "number" will return true and,
     *     in our minds anyway, NaN is explicitly by name Not A Number. At the
     *     very least you won't want to do math with it or try to save it to a
     *     numeric column in a database. Sure, the spec says the behavior here
     *     is correct. We didn't say it was a bug, it's just lousy semantics so
     *     we made it work the way we, and other developers, assumed it would
     *     work so that a call like if (TP.isNumber(parseInt(userData)))
     *     doMath(); works the way you'd expect and won't try to compute the sum
     *     of 'foo', 'bar', and 'baz' when the user enters alphas.
     * @param {Object} anObj The object to test.
     * @example Test to see if anObj is a Number:
     *     <code>
     *          anObj = 42;
     *          TP.isNumber(anObj);
     *          <samp>true</samp>
     *     </code>
     * @example Test to see if any other object, including NaN, is a Number:
     *     <code>
     *          TP.isNumber('');
     *          <samp>false</samp>
     *          TP.isNumber(NaN);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is a JavaScript
     *     Number.
     */

    //  We have to check NaN first, since typeof NaN is considered to be
    //  'number' and we kinda think NotANumber is Not a Number ;)
    if (TP.isNaN(anObj)) {
        return false;
    }

    if (typeof anObj === 'number') {
        return true;
    }

    return TP.ObjectProto.toString.call(anObj) === '[object Number]';
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isRegExp',
function(anObj) {

    /**
     * @method isRegExp
     * @summary Returns true if the object provided is a regular expression
     *     instance.
     * @param {Object} anObj The object to test.
     * @returns {Boolean} Whether or not the supplied object is a RegExp.
     */

    //  most regexp tests are done when we're trying to tell the difference
    //  between what might be a regex or a string, so check that first
    if (typeof anObj === 'string') {
        return false;
    }

    //  constructor checks are next best option

    /* eslint-disable no-extra-parens */
    return (TP.isValid(anObj) && (anObj.constructor === RegExp ||
                                TP.regex.REGEXP_CONSTRUCTOR.test(
                                    '' + anObj.constructor)));
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isInvalidDate',
function(anObj) {

    /**
     * @method isInvalidDate
     * @summary Returns true if the object is a Date object, but has an invalid
     *     Date value.
     * @param {Object} anObj The object to test.
     * @returns {Boolean}
     */

    //  all dates report object as their primitive type (but so does null)
    if (TP.notValid(anObj) || typeof anObj !== 'object') {
        return false;
    }

    //  The ECMA-402 i18n spec for ECMAScript defines that these objects should
    //  return 'Invalid Date' (and ECMAScript edition 5 specifies 'NaN' if they
    //  were created with an invalid number).
    if (anObj.toString() === 'Invalid Date' || anObj.toString() === 'NaN') {
        return true;
    }

    return false;
});

//  ------------------------------------------------------------------------
//  Common Type Checking
//  ------------------------------------------------------------------------

TP.definePrimitive('isCollection',
function(anObj) {

    /**
     * @method isCollection
     * @summary Returns true if the value passed in is an instance of a
     *     Collection type such as Array or TP.lang.Hash.
     * @description While String instances can be thought of as collections of
     *     characters this routine will not return true for Strings. Likewise,
     *     although documents and elements can be thought of as collections of
     *     subelements this routine will return false for Node types.
     * @param {Object} anObj The value to test.
     * @returns {Boolean} Whether or not the supplied object is a collection
     *     instance.
     */

    if (TP.isNodeList(anObj) || TP.isNamedNodeMap(anObj)) {
        return true;
    }

    //  have to rely on an internal method on the object to say so (which
    //  we add to Array, TP.lang.Hash, etc.
    if (TP.canInvoke(anObj, '$$isCollection')) {
        return anObj.$$isCollection();
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isEnhanced',
function(anObj) {

    /**
     * @method isEnhanced
     * @summary Returns true if the object appears to be an enhanced object,
     *     one that TIBET has been able to augment.
     * @param {Object} anObj The object to interrogate.
     * @returns {Boolean} True if the object can respond to common TIBET
     *     methods.
     */

    return TP.canInvoke(anObj, 'getTypeName');
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isGlobal',
function(anObj, includeScannedGlobals) {

    /**
     * @method isGlobal
     * @summary Returns true if the name/object provided is a global reference,
     *     variable, or value. By default this method will return things that
     *     are considered global and will return false for objects/keys that are
     *     "natural properties" of a window. Since browser-based JS blends the
     *     concept of the Global object with Window objects we have to
     *     discriminate between the two. Passing true for the window slot
     *     parameter will cause this method to return true for things like
     *     'opener' and other window properties.
     * @description In the absense of other flags, anObj is considered to be a
     *     'global' if it meets one of the following criteria:
     *
     *     1) It is an instance of Boolean or Number. 2) It is a String that is
     *     the name of an object installed on the 'global' (i.e. Window) object
     *     that is not deemed to be a "natural property" of a Window. 3) It is a
     *     Function that's been registered using TIBET's 'defineGlobal' method.
     *     4) It is a type object - either one of the 8 built-ins, or a subtype
     *     that has been added through the '.defineSubtype' mechanism.
     * @param {Object|String} anObj An object, or name to test.
     * @param {Boolean} includeScannedGlobals True to force checking against the
     *     'TP.sys.$nativeglobals' list that was generated on startup to include
     *      every global slot by executing 'for...in' against the global object.
     * @example Test to see if an object is global:
     *     <code>
     *          TP.isGlobal(42);
     *          <samp>true</samp>
     *          TP.isGlobal(TP.lang.Object);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean}
     */

    //  typeof lies about certain edge cases and is indiscriminate in most
    //  others, but for our purposes here it's sufficient
    switch (typeof anObj) {
        case 'boolean':
        case 'number':
            //  somewhat nonsensical, but yeah
            return true;

        case 'object':
            return TP.isType(anObj);

        case 'string':
            if (TP.notDefined(TP.global[anObj])) {
                return false;
            }

            if (TP.isTrue(includeScannedGlobals)) {
                return TP.sys.$nativeglobals.contains(anObj) ||
                        TP.sys.$ecmaglobals.contains(anObj) ||
                        TP.sys.$systemglobals.contains(anObj) ||
                        TP.sys.$globals.contains(anObj) ||
                        TP.sys.$globalexcludes.contains(anObj);
            } else {
                return TP.sys.$ecmaglobals.contains(anObj) ||
                        TP.sys.$systemglobals.contains(anObj) ||
                        TP.sys.$globals.contains(anObj) ||
                        TP.sys.$globalexcludes.contains(anObj);
            }

            break;

        case 'function':
            if (TP.isTrue(includeScannedGlobals)) {
                /* eslint-disable no-extra-parens */
                return (anObj[TP.TRACK] === 'Global' ||
                        TP.sys.$windowglobals.contains(TP.name(anObj)));
                /* eslint-enable no-extra-parens */
            } else {
                return anObj[TP.TRACK] === 'Global';
            }

            break;

        default:
            return false;
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isPair',
function(anObj) {

    /**
     * @method isPair
     * @summary Returns true if the object provided is an ordered pair,
     *     normally expressed as a two-slot array.
     * @param {Object} anObj The value to test.
     * @returns {Boolean} Whether or not the supplied object is a pair.
     */

    //  have to rely on an internal method on the object to say so
    if (TP.canInvoke(anObj, '$$isPair')) {
        return anObj.$$isPair();
    }

    return false;
});

//  ------------------------------------------------------------------------
//  TP.isXHR() defined in TIBETPrimitivesPlatform.js
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  INTERNAL type checking
//  ------------------------------------------------------------------------

TP.definePrimitive('$$isTypeProxy',
function(anObj) {

    /**
     * @method $$isTypeProxy
     * @summary Returns true if the object provided is a type proxy.
     * @description TIBET supports using proxy objects for types such that when
     *     the proxy is first messaged the named type will automatically be
     *     loaded and the message will be sent to the type. This allows TIBET to
     *     support autoloading of code with no programmer intervention or
     *     additional maintenance coding.
     * @param {Object} anObj The object to test.
     * @returns {Boolean} Whether or not the supplied object is a proxy.
     */

    /* eslint-disable no-extra-parens */
    return (TP.isValid(anObj) && TP.isCallable(anObj.$$fault));
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------
//  TIBET-specific type checking
//  ------------------------------------------------------------------------

TP.definePrimitive('isProperty',
function(anObj, propName) {

    /**
     * @method isProperty
     * @summary Returns true if the object provided is a valid property. A
     *     valid property is a property which is defined but not a DNU
     *     (DoesNotUnderstand) method. Note the syntax is typically
     *     TP.isProperty(someObj, 'someProperty') so what we typically get here
     *     is undefined or a real value
     * @param {Object} anObj The object to test.
     * @param {String} propName The property name to check.
     * @returns {Boolean} Whether or not the supplied object is a property (that
     *     is a defined 'slot', but not a DNU).
     */

    //  note that we don't consider a null to be a false condition here, in
    //  fact, a null implies that a value was set at some point
    if (anObj[propName] === undefined) {
        return false;
    }

    //  The slot might have been set to 'null'.
    if (anObj[propName] === null) {
        return true;
    }

    //  make sure we don't try to get $$dnu from a null
    return !TP.$$isDNU(anObj[propName]);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isOwnProperty',
function(anObj, propName) {

    /**
     * @method isOwnProperty
     * @summary Returns true if the object provided is a valid property *and
     *     which the supplied object owns* (i.e. has a local value). See
     *     TP.isProperty() for more on what constitutes a valid property.
     * @param {Object} anObj The object to test.
     * @param {String} propName The property name to check.
     * @returns {Boolean} Whether or not the supplied object is a property (that
     *     is a defined 'slot', but not a DNU) and which the supplied object has
     *     it's own local value.
     */

    return TP.isProperty(anObj, propName) && TP.owns(anObj, propName);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isTypeName',
function(anObj) {

    /**
     * @method isTypeName
     * @summary Returns true if the object is a string that represents what
     *     could be a valid type name. This is a syntactic check, no test is
     *     performed to see if the identifier resolves to an actual type.
     * @param {Object} anObj The object to test.
     * @returns {Boolean} True if the object passes typename syntax checks.
     */

    if (!TP.isString(anObj)) {
        return false;
    }

    if (anObj.isJSIdentifier()) {
        //  could be an instance name, or a global symbol like "ANY" that we
        //  want to avoid
        if (TP.regex.INSTANCE_OID.test(anObj)) {
            return false;
        }

        return anObj !== TP.ANY;
    }

    return TP.regex.VALID_TYPENAME.test(anObj);
});

//  ------------------------------------------------------------------------
//  DOM type checking
//  ------------------------------------------------------------------------

TP.definePrimitive('isAttributeNode',
function(anObj) {

    /**
     * @method isAttributeNode
     * @summary Returns true if the object provided is an XML or HTML attribute
     *     node (Node.ATTRIBUTE_NODE). NOTE that this is quite different from
     *     the TP.isProperty() call, which tests validity of a slot value.
     * @param {Object} anObj The object to test.
     * @example Test to see if anObj is a DOM attribute node (assume that the
     *     document's body element has a 'style' attribute on it):
     *     <code>
     *          anObj = TP.documentGetBody(document).getAttributeNode('style');
     *          TP.isAttributeNode(anObj);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is an attribute
     *     node.
     */

    /* eslint-disable no-extra-parens */
    return (TP.isValid(anObj) && anObj.nodeType === Node.ATTRIBUTE_NODE);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isCDATASectionNode',
function(anObj) {

    /**
     * @method isCDATASectionNode
     * @summary Returns true if the object provided is an XML or HTML CDATA
     *     section node (Node.CDATA_SECTION_NODE).
     * @param {Object} anObj The object to test.
     * @example Test what's a CDATA section node and what's not:
     *     <code>
     *          TP.isCDATASectionNode(document.documentElement);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is an CDATA section
     *     node.
     */

    /* eslint-disable no-extra-parens */
    return (TP.isValid(anObj) && anObj.nodeType === Node.CDATA_SECTION_NODE);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isCollectionNode',
function(anObj) {

    /**
     * @method isCollectionNode
     * @summary Returns true if the object provided is an XML or HTML element
     *     (Node.ELEMENT_NODE), document (Node.DOCUMENT_NODE), or document
     *     fragment (Node.DOCUMENT_FRAGMENT_NODE).
     * @param {Object} anObj The object to test.
     * @example Test what's an element and what's not:
     *     <code>
     *          TP.isCollectionNode(document.documentElement);
     *          <samp>true</samp>
     *          TP.isCollectionNode(document);
     *          <samp>true</samp>
     *          TP.isCollectionNode(TP.node('a text node'));
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is an Element or
     *     Document.
     */

    /* eslint-disable no-extra-parens */
    return (TP.isValid(anObj) &&
            (anObj.nodeType === Node.ELEMENT_NODE ||
            anObj.nodeType === Node.DOCUMENT_NODE ||
            anObj.nodeType === Node.DOCUMENT_FRAGMENT_NODE));
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isCommentNode',
function(anObj) {

    /**
     * @method isCommentNode
     * @summary Returns true if the object provided is an XML or HTML Comment
     *     node (Node.COMMENT_NODE).
     * @param {Object} anObj The object to test.
     * @example Test what's a comment node and what's not:
     *     <code>
     *          TP.isCommentNode(document.documentElement);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is an Comment node.
     */

    /* eslint-disable no-extra-parens */
    return (TP.isValid(anObj) && anObj.nodeType === Node.COMMENT_NODE);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isDocument',
function(anObj) {

    /**
     * @method isDocument
     * @summary Returns true if the object provided TP.isHTMLDocument() or
     *     TP.isXMLDocument().
     * @param {Object} anObj The object to test.
     * @example Test what's a document and what's not:
     *     <code>
     *          isDocument(window.document);
     *          <samp>true</samp>
     *          isDocument(window);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is an (HTML)
     *     document.
     */

    //  both html and xml documents still report node type as document, but
    //  an xml document won't have an applets property
    /* eslint-disable no-extra-parens */
    return (TP.isValid(anObj) && anObj.nodeType === Node.DOCUMENT_NODE);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isElement',
function(anObj) {

    /**
     * @method isElement
     * @summary Returns true if the object provided is an XML or HTML element
     *     node (Node.ELEMENT_NODE).
     * @param {Object} anObj The object to test.
     * @example Test what's an element and what's not:
     *     <code>
     *          TP.isElement(document.documentElement);
     *          <samp>true</samp>
     *          TP.isElement(document);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is an Element.
     */

    /* eslint-disable no-extra-parens */
    return (TP.isValid(anObj) && anObj.nodeType === Node.ELEMENT_NODE);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------
//  TP.isError() defined in TIBETPrimitivesPlatform.js
//  ------------------------------------------------------------------------

TP.definePrimitive('isEvent',
function(anObj) {

    /**
     * @method isEvent
     * @summary Returns true if the object provided is an Event object.
     * @param {Object} anObj The object to test.
     * @returns {Boolean} Whether or not the supplied object is an Event object.
     */

    /* eslint-disable no-extra-parens */
    return (TP.isValid(anObj) &&
            typeof anObj.stopPropagation === 'function' &&
            TP.isValid(anObj.timeStamp));
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isFragment',
function(anObj) {

    /**
     * @method isFragment
     * @summary Returns true if the object provided is an XML or HTML document
     *     fragment node (Node.DOCUMENT_FRAGMENT_NODE).
     * @param {Object} anObj The object to test.
     * @example TODO
     * @returns {Boolean} Whether or not the supplied object is a document
     *     fragment.
     */

    /* eslint-disable no-extra-parens */
    return (TP.isValid(anObj) &&
            anObj.nodeType === Node.DOCUMENT_FRAGMENT_NODE);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isHTMLDocument',
function(anObj) {

    /**
     * @method isHTMLDocument
     * @summary Returns true if the object contains 'open' and 'applets'
     *     references which seems sufficient to determine whether it is a true
     *     HTML document, a general object, or 'self'.
     * @param {Object} anObj The object to test.
     * @example Test what's an html document and what's not:
     *     <code>
     *          TP.isHTMLDocument(top.document);
     *          <samp>true</samp>
     *          newXMLDoc = TP.doc('<foo/>');
     *          TP.isHTMLDocument(newXMLDoc);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is an (HTML)
     *     document.
     */

    //  Check to make sure its some sort of DOCUMENT_NODE first.
    if (TP.notValid(anObj) || anObj.nodeType !== Node.DOCUMENT_NODE) {
        return false;
    }

    //  We may have already been through the test below and captured that
    //  value, so return it if we have.
    if (TP.isDefined(anObj[TP.IS_XHTML])) {
        return !anObj[TP.IS_XHTML];
    }

    //  If the document has a contentType then we test for either HTML or XHTML.
    //  Note here how we make the tests explicit - otherwise, we drop down into
    //  more complex logic.
    if (anObj.contentType === TP.HTML_TEXT_ENCODED) {
        anObj[TP.IS_XHTML] = false;
        return true;
    } else if (anObj.contentType === TP.XHTML_ENCODED) {
        anObj[TP.IS_XHTML] = true;
        return false;
    }

    //  If the document doesn't have a Window, then its not HTML
    if (TP.notValid(anObj.defaultView)) {
        return false;
    }

    //  Sometimes we get a Document that doesn't have a document element
    if (!TP.isElement(anObj.documentElement)) {
        anObj[TP.IS_XHTML] = false;
        return false;
    }

    if (anObj.documentElement.tagName.toLowerCase() !== 'html') {
        anObj[TP.IS_XHTML] = false;
        return false;
    }

    //  Last check is to see if the '.tagName' property preserves case
    //  sensitivity. If it doesn't, then it's HTML not XHTML.
    anObj[TP.IS_XHTML] = anObj.createElement('foo').tagName === 'FOO' ?
                    false :
                    true;

    return !anObj[TP.IS_XHTML];
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isHTMLNode',
function(anObj) {

    /**
     * @method isHTMLNode
     * @summary Returns true if the object provided is an HTML node.
     * @param {Object} anObj The object to test.
     * @example Test what's an html node and what's not:
     *     <code>
     *          TP.isHTMLNode(top.document.documentElement);
     *          <samp>true</samp>
     *          TP.isHTMLNode(newXMLDoc);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is an HTML node.
     */

    var doc;

    //  Make sure its a node first.
    if (TP.notValid(anObj) || typeof anObj.nodeType !== 'number') {
        return false;
    }

    if (anObj.nodeType === Node.DOCUMENT_NODE) {
        return TP.isHTMLDocument(anObj);
    }

    //  If the node isn't in a document anywhere, then about the only thing
    //  we can do is check to see if it has a tagName (i.e. it is a
    //  Node.ELEMENT_NODE), and if that tag name is one of the HTML ones. If
    //  so, we return true (since its really an HTML node - it may be an
    //  XHTML node, but we can't tell that here).
    if (TP.notValid(doc = anObj.ownerDocument)) {
        if (TP.isValid(anObj.tagName)) {
            return TP.isValid(
                        TP.HTML_401_TAGS[anObj.tagName.toLowerCase()]);
        }

        return false;
    }

    return TP.isHTMLDocument(doc);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isIFrameWindow',
function(anObj) {

    /**
     * @method isIFrameWindow
     * @summary Returns whether or not the object is the content window of an
     *     'iframe' element. NOTE: This will *not* return true for 'frame'
     *     windows, just 'iframe' windows.
     * @param {Object} anObj The object to check.
     * @example Test what's an iframe window and what's not:
     *     <code>
     *          anElem = document.createElement('iframe');
     *          TP.nodeAppendChild(TP.documentGetBody(document), anElem);
     *          TP.isIFrameWindow(TP.elementGetIFrameWindow(anElem));
     *          <samp>true</samp>
     *          TP.isIFrameWindow(top); // top-level window
     *          <samp>false</samp>
     *          TP.isIFrameWindow(TP.sys.getUICanvas().getNativeWindow());
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not anObj is a Window object that belongs
     *     to an 'iframe'.
     */

    var frame;

    if (TP.notValid(anObj)) {
        return false;
    }

    try {
        //  On IE, trying to get the 'frameElement' doesn't return
        //  undefined, it throws a "No such interface supported"
        //  exception...
        frame = anObj.frameElement;

        //  NOTE: the dependency here on TP.elementGetLocalName(), which
        //  helps ensure we handle namespaced markup properly
        if (TP.isElement(frame) &&
            (TP.elementGetLocalName(frame).toLowerCase() === 'iframe' ||
                TP.elementGetLocalName(frame).toLowerCase() === 'object')) {
            return true;
        }
    } catch (e) {
        return false;
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isMediaQueryList',
function(anObj) {

    /**
     * @method isMediaQueryList
     * @summary Returns true if the object provided is a valid media query list
     *     object.
     * @param {Object} anObj The object to test.
     * @example Test what's a media query list and what's not:
     *     <code>
     *          TP.isMediaQueryList(window.matchMedia('@media screen'));
     *          <samp>true</samp>
     *          TP.isMediaQueryList(window.navigator);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is a media query
     *     list.
     */

    if (TP.notValid(anObj)) {
        return false;
    }

    //  have to watch out for other things with matches, like RegExps
    return anObj.matches !== undefined && anObj.media !== undefined;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isNamedNodeMap',
function(anObj) {

    /**
     * @method isNamedNodeMap
     * @summary Returns true if the object provided is a DOM named node map.
     * @param {Object} anObj The object to test.
     * @example Test what's a named node map and what's not:
     *     <code>
     *          TP.isNamedNodeMap(TP.documentGetBody(document).attributes);
     *          <samp>true</samp>
     *          TP.isNamedNodeMap(TP.documentGetBody(document).childNodes);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is a named node
     *     map.
     */

    return TP.isValid(anObj) &&
            TP.isValid(anObj.getNamedItem) &&
            TP.isValid(anObj.setNamedItem);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isNodeList',
function(anObj) {

    /**
     * @method isNodeList
     * @summary Returns true if the object provided is a DOM node list (or an
     *     Array acting like one).
     * @description We need to supply a special version of this for IE because
     *     node lists returned from the XML DOM are different from those
     *     returned from the HTML DOM.
     * @param {Object} anObj The object to test.
     * @example Test what's a node list and what's not:
     *     <code>
     *          TP.isNodeList(TP.documentGetBody(document).childNodes);
     *          <samp>true</samp>
     *          TP.isNodeList(TP.documentGetBody(document).attributes);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is a node list.
     */

    if (TP.notValid(anObj) || TP.isWindow(anObj)) {
        return false;
    }

    //  Sometimes (i.e. the 'attributes' collection on elements), named
    //  node maps also think that they're node lists, so if this is a
    //  named node map, then return false
    if (TP.isNamedNodeMap(anObj)) {
        return false;
    }

    //  some arrays double as NodeList objects and since we augment them
    //  them with an 'item' slot that test won't be sufficient
    if (TP.isArray(anObj)) {
        //  Missing the '.join' method? Assume we're a NodeList
        if (anObj.join === undefined) {
            return true;
        }

        return false;
    }

    //  have to watch out for other things with length, like strings and
    //  CSSStyleDeclarations
    return typeof anObj !== 'string' &&
            anObj.length !== undefined &&
            anObj.item !== undefined &&
            anObj.nodeType === undefined &&
            anObj.cssText === undefined;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isPINode',
function(anObj) {

    /**
     * @method isPINode
     * @summary Returns true if the object provided is an XML or HTML
     *     processing instruction node (Node.PROCESSING_INSTRUCTION_NODE).
     * @param {Object} anObj The object to test.
     * @returns {Boolean} Whether or not the supplied object is a processing
     *     instruction node.
     */

    /* eslint-disable no-extra-parens */
    return (TP.isValid(anObj) && anObj.nodeType ===
            Node.PROCESSING_INSTRUCTION_NODE);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isStyleDeclaration',
function(anObj) {

    /**
     * @method isStyleDeclaration
     * @summary Returns true if the object provided is a 'style' object you'd
     *     find on a rendered DOM node or as a declaration in a CSS style rule.
     * @param {Object} anObj The object to test.
     * @example Test what's a style object and what's not:
     *     <code>
     *          TP.isStyleDeclaration(TP.documentGetBody(document).style);
     *          <samp>true</samp>
     *          TP.isStyleDeclaration(TP.documentGetBody(document).style.color);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is a 'style'
     *     object.
     */

    if (TP.notValid(anObj)) {
        return false;
    }

    /* eslint-disable no-extra-parens */
    return (anObj.length !== undefined && anObj.cssText !== undefined);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isStyleRule',
function(anObj) {

    /**
     * @method isStyleRule
     * @summary Returns true if the object provided is a 'style rule' object
     *     you'd find attached to a stylesheet.
     * @param {Object} anObj The object to test.
     * @example Test what's a style rule object and what's not:
     *     <code>
     *          TP.isStyleRule(TP.styleSheetGetStyleRules(
     *              document.styleSheets[0])[0]);
     *          <samp>true</samp>
     *          TP.isStyleRule(TP.documentGetBody(document).style);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is a 'stylesheet'
     *     object.
     */

    if (TP.notValid(anObj)) {
        return false;
    }

    /* eslint-disable no-extra-parens */
    return (anObj.parentStyleSheet !== undefined &&
            anObj.cssText !== undefined);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isStyleSheet',
function(anObj) {

    /**
     * @method isStyleSheet
     * @summary Returns true if the object provided is a 'stylesheet' object
     *     you'd find attached to a document.
     * @param {Object} anObj The object to test.
     * @example Test what's a style sheet object and what's not:
     *     <code>
     *          TP.isStyleSheet(TP.documentGetBody(document).styleSheets[0]);
     *          <samp>true</samp>
     *          TP.isStyleSheet(TP.documentGetBody(document).style.color);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is a 'stylesheet'
     *     object.
     */

    if (TP.notValid(anObj)) {
        return false;
    }

    /* eslint-disable no-extra-parens */
    return (anObj.parentStyleSheet !== undefined &&
            anObj.ownerNode !== undefined);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isSVGNode',
function(anObj) {

    /**
     * @method isSVGNode
     * @summary Returns true if the object provided is an SVG node.
     * @param {Object} anObj The object to test.
     * @returns {Boolean} Whether or not the supplied object is an SVG node.
     */

    var doc;

    if (!TP.isXMLNode(anObj)) {
        return false;
    }

    if (anObj.namespaceURI === 'http://www.w3.org/2000/svg') {
        return true;
    }

    if (TP.isDocument(doc = TP.nodeGetDocument(anObj))) {
        return TP.isElement(doc.documentElement) &&
                doc.documentElement.namespaceURI ===
                                    'http://www.w3.org/2000/svg';
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isTextNode',
function(anObj) {

    /**
     * @method isTextNode
     * @summary Returns true if the object provided is an XML or HTML Text node
     *     (Node.TEXT_NODE).
     * @param {Object} anObj The object to test.
     * @example Test what's a text node and what's not:
     *     <code>
     *          TP.isTextNode(document.documentElement);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is an Text node.
     */

    return TP.isValid(anObj) && anObj.nodeType === Node.TEXT_NODE;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isXHTMLDocument',
function(anObj) {

    /**
     * @method isXHTMLDocument
     * @summary Returns true if the object provided is an XHTML document.
     * @param {Object} anObj The object to test.
     * @returns {Boolean} Whether or not the supplied object is an XHTML
     *     document.
     */

    //  Check to make sure its some sort of DOCUMENT_NODE first.
    if (TP.notValid(anObj) || anObj.nodeType !== Node.DOCUMENT_NODE) {
        return false;
    }

    //  We may have already been through the test below and captured that
    //  value, so return it if we have.
    if (TP.isDefined(anObj[TP.IS_XHTML])) {
        return anObj[TP.IS_XHTML];
    }

    //  If the document has a contentType and that contentType is
    //  TP.XHTML_ENCODED, then we know it's HTML
    if (anObj.contentType === TP.XHTML_ENCODED) {
        anObj[TP.IS_XHTML] = true;
        return true;
    } else if (anObj.contentType === TP.HTML_TEXT_ENCODED) {
        anObj[TP.IS_XHTML] = false;
        return false;
    }

    //  Sometimes we get a Document that doesn't have a document element
    if (!TP.isElement(anObj.documentElement)) {
        anObj[TP.IS_XHTML] = false;
        return false;
    }

    //  If the document doesn't have a Window, then we check to see if the
    //  document element is 'html' - in which case, we can still think of it
    //  as XHTML.
    if (TP.notValid(anObj.defaultView)) {
        return anObj.documentElement.tagName === 'html';
    }

    if (anObj.documentElement.tagName !== 'html') {
        anObj[TP.IS_XHTML] = false;
        return false;
    }

    //  Last check is to see if the '.tagName' property preserves case
    //  sensitivity. If it doesn't, then it's HTML not XHTML.
    anObj[TP.IS_XHTML] = anObj.createElement('foo').tagName === 'FOO' ?
                    false :
                    true;

    return anObj[TP.IS_XHTML];
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isXHTMLNode',
function(anObj) {

    /**
     * @method isXHTMLNode
     * @summary Returns true if the object provided is an XHTML node.
     * @param {Object} anObj The object to test.
     * @returns {Boolean} Whether or not the supplied object is an XHTML node.
     */

    var doc;

    //  Make sure its a node first.
    if (TP.notValid(anObj) || typeof anObj.nodeType !== 'number') {
        return false;
    }

    if (anObj.nodeType === Node.DOCUMENT_NODE) {
        return TP.isXHTMLDocument(anObj);
    }

    //  If the node isn't in a document anywhere, then about the only thing
    //  we can do is check to see if it has a tagName (i.e. it is a
    //  Node.ELEMENT_NODE), and if that tag name is one of the HTML ones. If
    //  so, we return true (since its really an HTML node - it may be an
    //  XHTML node, but we can't tell that here).
    if (TP.notValid(doc = anObj.ownerDocument)) {
        if (TP.isValid(anObj.tagName)) {
            return TP.isValid(
                        TP.HTML_401_TAGS[anObj.tagName.toLowerCase()]);
        }

        return false;
    }

    return TP.isXHTMLDocument(doc);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isXMLDocument',
function(anObj) {

    /**
     * @method isXMLDocument
     * @summary Returns true if the object provided is an XML document.
     * @param {Object} anObj The object to test.
     * @example Test what's an xml document and what's not:
     *     <code>
     *          newXMLDoc = TP.doc('<foo/>');
     *          TP.isXMLDocument(newXMLDoc);
     *          <samp>true</samp>
     *          TP.isXMLDocument(top.document);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is an XML document.
     */

    //  Check to make sure its some sort of DOCUMENT_NODE first.
    if (TP.notValid(anObj) || anObj.nodeType !== Node.DOCUMENT_NODE) {
        return false;
    }

    return !TP.isHTMLDocument(anObj);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isXMLNode',
function(anObj) {

    /**
     * @method isXMLNode
     * @summary Returns true if the object provided is an XML node.
     * @param {Object} anObj The object to test.
     * @example Test what's an xml element and what's not:
     *     <code>
     *          newXMLDoc = TP.doc('<foo/>');
     *          TP.isXMLNode(newXMLDoc.documentElement);
     *          <samp>true</samp>
     *          TP.isXMLNode(newXMLDoc);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is an XML node.
     */

    var doc;

    //  Make sure its a node first.
    if (TP.notValid(anObj) || typeof anObj.nodeType !== 'number') {
        return false;
    }

    if (anObj.nodeType === Node.DOCUMENT_NODE) {
        return TP.isXMLDocument(anObj);
    }

    //  If the node isn't in a document anywhere, then about the only thing we
    //  can do is check to see if it has a tagName (i.e. it is a
    //  Node.ELEMENT_NODE), and if that tag name is one of the HTML ones. If so,
    //  we return false (since its really an HTML node - it may be an XHTML
    //  node, but we can't tell that here).
    if (TP.notValid(doc = anObj.ownerDocument)) {
        if (TP.isValid(anObj.tagName)) {
            return !TP.isValid(
                        TP.HTML_401_TAGS[anObj.tagName.toLowerCase()]);
        }

        return false;
    }

    //  If its document is an XML document, then its definitely an XML node.
    return TP.isXMLDocument(doc);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isXHR',
function(anObj) {

    /**
     * @method isXHR
     * @summary Returns true if the object appears to be an XMLHttpRequest
     *     instance. These are tricky little suckers that will throw exceptions
     *     if you don't treat them nicely so this is a good check to use when
     *     you suspect you might have an XHR.
     * @param {Object} anObj The object to interrogate.
     * @returns {Boolean} True if the object looks like an XHR.
     */

    try {
        return TP.isValid(anObj) &&
                TP.isProperty(anObj, 'responseText') &&
                typeof anObj.send === 'function';
    } catch (e) {
        //  empty
    }

    return false;
});

//  ------------------------------------------------------------------------
//  EMPTY/NON-EMPTY
//  ------------------------------------------------------------------------

/*
Empty testing is particularly common around element attribute values where,
based on the browser, the DTD in question, etc, you may get a null, an empty
string, or an exception, when trying to access an attribute. As a result we
offer isEmpty as a way of testing attribute values and other objects.

The term 'empty' (isEmpty/notEmpty) lets you know whether a string, node, or
collection is empty. When applied to a Node the response is based on whether
the Node has content. NOTE that isEmpty is commonly used to check attribute
values to deal with cross-browser differences surrounding return values.

NOTE that isEmpty CAN CAUSE BUGS if the input can be a Node since the result
will depend on the whether there is valid content, not whether there is a
node in existence.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('isEmpty',
function(anObj) {

    /**
     * @method isEmpty
     * @summary Returns true if the object provided is 'empty' meaning it may
     *     be 'invalid' or have a size, length, or empty attribute which defines
     *     it as having zero-length content.
     * @description A common error is using TP.isEmpty() to test a return value
     *     which is a Node. This will return varying results depending on how
     *     many childNodes the Node has. Use TP.isValid() to test whether a node
     *     exists, then use TP.isEmpty() to test for children.
     * @param {Object} anObj The object to test.
     * @example Test which primitive objects are considered empty and which ones
     *     aren't:
     *     <code>
     *          TP.isEmpty(42);
     *          <samp>false</samp>
     *          TP.isEmpty(true);
     *          <samp>false</samp>
     *          TP.isEmpty('Hi there');
     *          <samp>false</samp>
     *          TP.isEmpty('');
     *          <samp>true</samp>
     *     </code>
     * @example Test which DOM objects are considered empty and which ones
     *     aren't:
     *     <code>
     *          TP.isEmpty(document);
     *          <samp>false</samp>
     *          TP.isEmpty(TP.documentGetBody(document));
     *          <samp>false</samp>
     *          newSpan = document.createElement('span');
     *          TP.nodeAppendChild(TP.documentGetBody(document), newSpan);
     *          TP.isEmpty(newSpan);
     *          <samp>true</samp>
     *          TP.nodeAppendChild(
     *          newSpan,
     *          document.createTextNode(''));
     *          TP.isEmpty(newSpan);
     *          <samp>false</samp>
     *          TP.isEmpty(newSpan.firstChild);
     *          <samp>true</samp>
     *          TP.nodeSetTextContent(newSpan.firstChild, 'hi');
     *          TP.isEmpty(newSpan.firstChild);
     *          <samp>false</samp>
     *          TP.elementSetAttribute(newSpan, 'newAttr', 'newVal');
     *          TP.isEmpty(newSpan.attributes[0]);
     *          <samp>false</samp>
     *          newSpan.attributes[0].value = '';
     *          TP.isEmpty(newSpan.attributes[0]);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} True if the object has content size = 0.
     */

    var val,
        type;

    if (TP.notValid(anObj)) {
        return true;
    }

    type = typeof anObj;

    //  have to be careful here because of IE and its failure to support
    //  toString() on certain node objects
    if (type === 'string') {
        //  Make sure to use a '===' test here since if anObj is false, 0,
        //  null, undefined, etc. a '==' test could actually succeed.
        return anObj === '';
    }

    //  if its either a boolean or a number, it can't be empty.
    if (type === 'boolean' || type === 'number') {
        return false;
    }

    //  'arguments' arrays are handled specially, since they don't act like
    //  other arrays (i.e. they don't participate in the prototype chain).
    if (TP.isArgArray(anObj)) {
        return anObj.length === 0;
    }

    //  If it has a 'length' slot and that contains a Number, use that. This
    //  would include native Strings.
    if (TP.isNumber(val = anObj.length)) {
        return val === 0;
    }

    if (TP.isRegExp(anObj)) {
        return false;
    }

    //  If the object is a DOM Attribute, then its empty if it's value is
    //  the empty string. Note that we check this before we check all other
    //  Nodes as this returns a better measure of emptiness for Attribute
    //  Nodes.
    if (TP.isAttributeNode(anObj)) {
        /* eslint-disable no-extra-parens */
        return (TP.notValid(anObj.value) || anObj.value === '');
        /* eslint-enable no-extra-parens */
    }

    //  If the object is a DOM Node, then its empty if it has no child
    //  nodes.
    if (TP.isNode(anObj)) {
        return anObj.childNodes.length === 0;
    }

    //  If the object responds to 'isEmpty', return that value.
    //  NB: It's much better to do this before checking size with 'getSize'
    //  since many non-collection objects will fetch all of their keys as part
    //  of that operation and return the size of that Array, which is slow.
    if (TP.canInvoke(anObj, 'isEmpty')) {
        if (TP.isBoolean(val = anObj.isEmpty())) {
            return val;
        }
    }

    //  If something can respond to 'getSize', use it. This includes Arrays,
    //  TP.lang.Hashes and String.
    if (TP.canInvoke(anObj, 'getSize')) {
        try {
            return anObj.getSize() === 0;
        } catch (e) {
            TP.ifError() ? TP.error(TP.ec(e, 'Could not obtain size'),
                                    TP.LOG) : 0;
        }
    }

    //  If the object responds to 'getAttribute', see if we can get the
    //  value of an attribute named 'empty'.
    if (TP.canInvoke(anObj, 'getAttribute')) {
        if (TP.isBoolean(val = anObj.getAttribute('empty'))) {
            return val;
        }
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('ifEmpty',
function(aSuspectValue, aDefaultValue) {

    /**
     * @method ifEmpty
     * @summary Returns either aSuspectValue or aDefaultValue based on the
     *     state of aSuspectValue. If aSuspectValue TP.isEmpty() aDefaultValue
     *     is returned.
     * @param {Object} aSuspectValue The value to test.
     * @param {Object} aDefaultValue The value to return if test passes.
     * @example Set the value of theObj to 'Hi there', if anObj is empty:
     *     <code>
     *          theObj = TP.ifEmpty(anObj, 'Hi there');
     *     </code>
     * @returns {Object} One of the two values provided.
     */

    return TP.isEmpty(aSuspectValue) ? aDefaultValue : aSuspectValue;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('notEmpty',
function(anObj) {

    /**
     * @method notEmpty
     * @summary Returns true if the object provided is not 'empty' meaning it
     *     must be a valid object with a size, length, or empty attribute which
     *     defines it as having content.
     * @description A common error is using TP.notEmpty() to test a return value
     *     which is a Node. This will return varying results depending on how
     *     many childNodes the Node has. Use TP.isValid() to test whether a node
     *     exists, then use TP.notEmpty() to test for children.
     * @param {Object} anObj The object to test.
     * @example See the TP.isEmpty() method for examples on 'emptiness'.
     * @returns {Boolean} True if the object has content size > 0.
     */

    return !TP.isEmpty(anObj);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('ifNaN',
function(aSuspectValue, aDefaultValue) {

    /**
     * @method ifNaN
     * @summary Returns either aSuspectValue or aDefaultValue based on the
     *     state of aSuspectValue. If aSuspectValue is NaN, aDefaultValue is
     *     returned.
     * @param {Object} aSuspectValue The value to test.
     * @param {Object} aDefaultValue The value to return if aSuspectValue is
     *     NaN.
     * @example Set the value of theObj to 42, if anObj is NaN:
     *     <code>
     *          theObj = TP.ifNaN(anObj, 42);
     *     </code>
     * @returns {Object} One of the two values provided.
     */

    return TP.isNaN(aSuspectValue) === true ? aDefaultValue : aSuspectValue;
});

//  ------------------------------------------------------------------------
//  BLANK (WHITESPACE) ONLY
//  ------------------------------------------------------------------------

TP.definePrimitive('ifBlank',
function(aSuspectValue, aDefaultValue) {

    /**
     * @method ifBlank
     * @summary Returns either aSuspectValue or aDefaultValue based on the
     *     state of aSuspectValue. If aSuspectValue TP.isBlank() aDefaultValue
     *     is returned.
     * @param {Object} aSuspectValue The value to test.
     * @param {Object} aDefaultValue The value to return if test passes.
     * @example Set the value of theObj to 'Hi there', if anObj is blank:
     *     <code>
     *          theObj = TP.ifBlank(anObj, 'Hi there');
     *     </code>
     * @returns {Object} One of the two values provided.
     */

    return TP.isBlank(aSuspectValue) ? aDefaultValue : aSuspectValue;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isBlank',
function(anObj) {

    /**
     * @method isBlank
     * @summary Returns true if the object is blank. Typically this method is
     *     applied to strings to test whether they are empty or have only
     *     whitespace as content. All other objects return the same result as
     *     testing them with isEmpty. NOTE that for nodes this also will return
     *     true if the node is a text node whose content is empty or whitespace.
     * @param {Object} anObj Typically a string being tested to see if it is
     *     empty or contains only whitespace.
     * @returns {Boolean} True if the object is blank.
     */

    if (anObj === null || anObj === undefined) {
        return true;
    }

    if (TP.isTextNode(anObj)) {
        return TP.isEmpty(TP.trim(anObj.value));
    }

    return TP.isEmpty(TP.trim(anObj));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('notBlank',
function(anObj) {

    /**
     * @method notBlank
     * @summary Returns true if the object provided is not blank meaning it
     *     must be a String containing at least one non-whitespace character or
     *     an object which is notEmpty.
     * @param {Object} anObj The object to test.
     * @returns {Boolean} True if the object is not blank/empty.
     */

    return !TP.isBlank(anObj);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isClosed',
function(anObj) {

    /**
     * @method isClosed
     * @summary Returns true if the object provided is a window (or control)
     *     that is closed, or resides in one. This is only relevant for window
     *     and DOM objects.
     * @param {Object} anObj The object to test.
     * @returns {Boolean} True when the object provided lives in a closed
     *     windows.
     */

    var win;

    if (TP.isWindow(anObj)) {
        return anObj.closed;
    } else if (TP.isNode(anObj)) {
        //  if we haven't loaded this primitive it's ok
        if (TP.canInvoke(TP, 'nodeGetWindow')) {
            win = TP.nodeGetWindow(anObj);
        }
    } else if (TP.canInvoke(anObj, 'getNativeWindow')) {
        win = anObj.getNativeWindow();
    }

    if (TP.isWindow(win)) {
        return win.closed;
    }

    //  note the default here, just in case we're running in a close handler
    //  or shutdown scenario
    return window.closed;
});

//  ------------------------------------------------------------------------
//  KEY ACQUISITION
//  ------------------------------------------------------------------------

//  These are key Arrays for many browser native objects and are wired into
//  those objects prototypes over in the tibet_hook file, so that they're
//  included in every page (and programmed onto every native object) TIBET
//  might encounter.
//  ------------------------------------------------------------------------

TP.sys.$arraykeys = TP.ac(
                    'length'
                    );

//  ------------------------------------------------------------------------

TP.sys.$documentkeys = TP.ac(
                    'localName', 'namespaceURI', 'nodeName', 'nodeType',
                    'nodeValue', 'prefix'
                    );

//  ------------------------------------------------------------------------

TP.sys.$htmldockeys = TP.ac(
                    'cookie', 'domain', 'lastModified', 'referrer',
                    'title', 'URL'
                    );

//  ------------------------------------------------------------------------

TP.sys.$elementkeys = TP.ac(
                    'localName', 'namespaceURI', 'nodeName', 'nodeType',
                    'nodeValue', 'prefix', 'tagName'
                    );

//  ------------------------------------------------------------------------

TP.sys.$htmlelemkeys = TP.ac(
                    'localName', 'namespaceURI', 'nodeName', 'nodeType',
                    'nodeValue', 'prefix', 'tagName', 'baseName',
                    'className', 'dir', 'id', 'lang', 'offsetHeight',
                    'offsetWidth', 'offsetLeft', 'offsetTop',
                    'scrollHeight', 'scrollWidth', 'scrollLeft', 'scrollTop',
                    'title'
                    );

//  ------------------------------------------------------------------------

TP.sys.$errorkeys = TP.ac(
                    'message'
                    );

//  ------------------------------------------------------------------------

TP.sys.$eventkeys = TP.ac(
                    'bubbles', 'cancelable', 'eventPhase', 'timeStamp',
                    'type', 'altKey', 'button', 'cancelBubble', 'clientX',
                    'clientY', 'ctrlKey', 'keyCode', 'offsetX', 'offsetY',
                    'returnValue', 'screenX', 'screenY', 'shiftKey',
                    'x', 'y'
                    );

//  ------------------------------------------------------------------------

TP.sys.$namednodemapkeys = TP.ac(
                    'length'
                    );

//  ------------------------------------------------------------------------

TP.sys.$nodekeys = TP.ac(
                    'localName', 'namespaceURI', 'nodeName', 'nodeType',
                    'nodeValue', 'prefix'
                    );

//  ------------------------------------------------------------------------

TP.sys.$nodelistkeys = TP.ac(
                    'length'
                    );

//  ------------------------------------------------------------------------

TP.sys.$stringkeys = TP.ac(
                    'length'
                    );

//  ------------------------------------------------------------------------

TP.sys.$windowkeys = TP.ac(
                    'closed', 'document',
                    'innerHeight', 'innerWidth', 'length',
                    'name',
                    'outerHeight', 'outerWidth',
                    'pageXOffset', 'pageYOffset',
                    'screenX', 'screenY',
                    'scrollMaxX', 'scrollMaxY',
                    'scrollX', 'scrollY'
                    );

//  ------------------------------------------------------------------------

TP.sys.$xhrkeys = TP.ac(
                    'status', 'responseXML', 'responseText'
                    );

//  ------------------------------------------------------------------------

TP.definePrimitive('$getOwnKeys',
function(anObject) {

    /**
     * @method $getOwnKeys
     * @summary Returns an Array of the 'own keys' for the supplied object.
     *     These are keys for which the object has a unique value.
     * @param {Object} anObject The object to obtain the keys for.
     * @returns {Array} An Array of the supplied Object's own keys.
     */

    var keys,
        ownKeys,
        len,
        i,
        key;

    if (TP.notValid(anObject)) {
        return this.raise('InvalidParameter');
    }

    ownKeys = TP.ac();

    //  ECMA edition 5 defines the nice, new 'Object.keys()' method. If its
    //  available, we use it.
    if (TP.isCallable(Object.keys)) {
        keys = Object.keys(anObject);

        len = keys.getSize();

        //  If the object is the TP.ObjectProto, then we have to check for DNUs
        //  as well...
        if (anObject === TP.ObjectProto) {
            //  Make sure there are no 'internal slots' that we don't want
            //  to expose and that there are no DNUs.
            for (i = 0; i < len; i++) {
                if (TP.$$isDNU(anObject[keys.at(i)]) ||
                    TP.regex.INTERNAL_SLOT.test(keys.at(i))) {
                    continue;
                } else {
                    ownKeys.push(keys.at(i));
                }
            }
        } else {
            //  Make sure there are no 'internal slots' that we don't want
            //  to expose
            for (i = 0; i < len; i++) {
                if (TP.regex.INTERNAL_SLOT.test(keys.at(i))) {
                    continue;
                } else {
                    ownKeys.push(keys.at(i));
                }
            }
        }

        return ownKeys;
    }

    //  Otherwise, we've got to do this the 'old' way - loop over the object
    //  and check its keys.

    //  If the object is the TP.ObjectProto, then we have to check for DNUs as
    //  well...
    if (anObject === TP.ObjectProto) {
        //  If its TP.ObjectProto (i.e. 'TP.ObjectProto'), iterate and test
        //  against our internal slot regex (to filter things like '$$'
        //  keys, etc.), make sure the slot name is for a slot that actually
        //  belongs to the object and make sure its not a DNU.
        /* jshint forin:true */
        for (key in anObject) {
            if (!TP.owns(anObject, key) || TP.regex.INTERNAL_SLOT.test(key)) {
                continue;
            }

            ownKeys.push(key);
        }
        /* jshint forin:false */
    } else {
        //  Otherwise, just iterate and test against our internal slot regex
        //  (to filter things like '$$' keys, etc.) and make sure the
        //  slot name is for a slot that actually belongs to the object.
        for (key in anObject) {
            if (!TP.owns(anObject, key) ||
                TP.regex.INTERNAL_SLOT.test(key)) {
                continue;
            }

            ownKeys.push(key);
        }
    }

    return ownKeys;
});

//  ------------------------------------------------------------------------

//  For now, we alias 'keys()' over to '$getOwnKeys()' - it will be replaced
//  later
TP.keys = TP.$getOwnKeys;

//  ------------------------------------------------------------------------
//  STRING REPRESENTATION
//  ------------------------------------------------------------------------

//  This will be replaced later in the loading process, but is used below.
TP.str = TP.RETURN_TOSTRING;

TP.defineMetaInstMethod('asString',
function(verbose) {

    /**
     * @method asString
     * @summary Returns the receiver as a human-readable string. This is the
     *     preferred low-level method to use on TIBET to acquire a presentable
     *     string representation of an object. The default output from toString
     *     in TIBET is the object's OID so that objects can properly be used in
     *     Object keys etc.
     * @description The typical implementation of asString is to return the same
     *     value as toString() for objects which can respond, however a number
     *     of types override asString to provide a more human-readable string.
     * @param {Boolean} verbose Whether or not to return the 'verbose' version
     *     of the object's String representation. The default is true.
     * @example Get the string representation of an object:
     *     <code>
     *          'hi'.asString();
     *          <samp>hi</samp>
     *          (42).asString();
     *          <samp>42</samp>
     *          true.asString();
     *          <samp>true</samp>
     *          TP.ac(1, 2, 3).asString();
     *          <samp>[1, 2, 3]</samp>
     *          TP.hc('lname', 'Smith', 'fname', 'Harry').asString();
     *          <samp>"fname" => "Harry", "lname" => "Smith"</samp>
     *     </code>
     * @returns {String} The receiver's default String representation.
     */

    var wantsVerbose,

        arr,

        keys,
        len,
        i,

        str;

    wantsVerbose = TP.ifInvalid(verbose, true);

    if (TP.isWindow(this)) {
        if (wantsVerbose) {
            return TP.windowAsString(this);
        } else {
            return TP.gid(this);
        }
    }

    if (!wantsVerbose) {
        return TP.objectToString(this);
    }

    //  If this flag is set to true, that means that we're already trying to
    //  format this object as part of larger object set and we may have an
    //  endless recursion problem if there are circular references and we
    //  let this formatting operation proceed. Therefore, we just return the
    //  'recursion' format of the object.
    if (this.$$format_asString) {
        return TP.recursion(this);
    }

    //  Set the recursion flag so that we don't endless recurse when
    //  producing circular representations of this object and its members.
    //  NB: For 'Object', we put this in a try...catch since some native Objects
    //  (i.e. XHR objects) don't like to have slots placed on them.
    try {
        this.$$format_asString = true;
    } catch (e) {
        void 0;
    }

    /* jshint -W009 */
    /* eslint-disable no-array-constructor */
    arr = new Array();
    /* eslint-enable no-array-constructor */
    /* jshint +W009 */

    try {
        keys = TP.keys(this);
        len = keys.length;

        for (i = 0; i < len; i++) {
            arr.push(keys[i] + ': ' + TP.str(this[keys[i]], false));
        }

        str = arr.join(', ');
    } catch (e) {
        str = this.toString();
    }

    //  We're done - we can remove the recursion flag.
    try {
        delete this.$$format_asString;
    } catch (e) {
        void 0;
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.ArrayProto.asString = TP.RETURN_TOSTRING;
TP.BooleanProto.asString = TP.RETURN_TOSTRING;
TP.DateProto.asString = TP.RETURN_TOSTRING;
TP.FunctionProto.asString = TP.RETURN_TOSTRING;
TP.NumberProto.asString = TP.RETURN_TOSTRING;
TP.RegExpProto.asString = TP.RETURN_TOSTRING;
TP.StringProto.asString = TP.RETURN_TOSTRING;

//  ------------------------------------------------------------------------
//  STRING BASICS
//  ------------------------------------------------------------------------

String.Inst.defineMethod('pad',
function(aSize, aChar, aSide) {

    /**
     * @method pad
     * @summary Right or left pads the string with the character provided to
     *     the size specified. Typically used to pad numbers with 0's for
     *     logging etc.
     * @param {Number} aSize The desired result size.
     * @param {String} aChar The character to use. Default is TP.DEFAULT_STRPAD.
     * @param {String} aSide TP.LEFT or TP.RIGHT.The side of the decimal point
     *     to pad. Default is TP.LEFT.
     * @example Pad a string out to 5 characters, on the left, with space
     *     characters:
     *     <code>
     *          '12'.pad(5);
     *          <samp> 12</samp>
     *     </code>
     * @example Pad a string out to 5 characters, on the right, with space
     *     characters:
     *     <code>
     *          '12'.pad(5, null, TP.RIGHT);
     *          <samp>12 </samp>
     *     </code>
     * @example Pad a string out to 4 characters, on the left, with '0'
     *     characters:
     *     <code>
     *          '12'.pad(4, '0');
     *          <samp>0012</samp>
     *     </code>
     * @example Pad a string out to 4 characters, on the right, with '0'
     *     characters:
     *     <code>
     *          '12'.pad(4, '0', TP.RIGHT);
     *          <samp>1200</samp>
     *     </code>
     * @returns {String} The receiver padded out according to the values
     *     supplied.
     * @addon String
     */

    var theSize,

        theChar,
        theSide,

        i,
        count,
        arr;

    theSize = TP.ifInvalid(aSize, 0);
    theSize = Math.max(0, theSize);

    if (this.length >= theSize) {
        //  Make sure to force the conversion to a primitive string.
        return this.toString();
    }

    theChar = TP.ifInvalid(aChar, TP.DEFAULT_STRPAD);
    theSide = TP.ifInvalid(aSide, TP.LEFT);

    arr = TP.ac();
    count = theSize - this.length;

    for (i = 0; i < count; i++) {
        arr[i] = theChar;
    }

    //  Make sure to force the conversion to a primitive string.
    /* eslint-disable no-extra-parens */
    return (theSide === TP.LEFT ?
                arr.join('') + this.toString() :
                this.toString() + arr.join(''));
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('startsWith',
function(aPrefix) {

    /**
     * @method startsWith
     * @summary Returns true if the receiver begins with the prefix provided.
     * @param {String} aPrefix A String containing the characters to test.
     * @returns {Boolean}
     */

    return this.indexOf(aPrefix) === 0;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asCamelCase',
function() {

    /**
     * @method asCamelCase
     * @summary Returns a new string with the initial character of each word,
     *     as separated by spaces, hyphens, or underscores in upper case, and
     *     with those characters removed. The first letter of the resulting
     *     string is lower case, so a string starting out as 'background-color'
     *     will become backgroundColor.
     * @returns {String}
     */

    var str;

    str = this.toString();
    TP.regex.CAMEL_CASE.lastIndex = 0;
    TP.regex.WORD_BOUNDARIES.lastIndex = 0;

    if (!TP.regex.CAMEL_CASE.test(str)) {
        return str;
    }

    return str.replace(
            TP.regex.CAMEL_CASE,
            function(whole, part) {

                return part.toUpperCase();
            }).strip(TP.regex.WORD_BOUNDARIES);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asHyphenated',
function() {

    /**
     * @method asHyphenated
     * @summary Returns a new string with each uppercase character in lower
     *     case and a hyphen separating the "words" formerly set off by title
     *     case. This is effectively the inverse of asCamelCase for things like
     *     CSS strings or XForms event names. NOTE that you shouldn't rely on
     *     this method to properly convert CSS, you should use asCSSName or
     *     asDOMName for CSS conversions.
     * @returns {String} The converted string.
     */

    return this.replace(/([A-Z])/g, '-$1').toLowerCase();
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asStartLower',
function() {

    /**
     * @method asStartLower
     * @summary Returns a new string with the initial character in lower case.
     *     No other transformation is performed.
     * @returns {String}
     */

    return this[0].toLowerCase() + this.substring(1);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asStartUpper',
function() {

    /**
     * @method asStartUpper
     * @summary Returns a new string with the initial character in upper case.
     *     No other transformation is performed.
     * @returns {String}
     */

    return this[0].toUpperCase() + this.substring(1);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asTitleCase',
function() {

    /**
     * @method asTitleCase
     * @summary Returns a new string with the initial character of each word,
     *     as separated by spaces (' '), underscores ('_') or hyphens ('-')
     *     in upper case. No other transformation is performed. Note that this
     *     method *will always* upper case the first character.
     * @returns {String}
     */

    var str;

    str = this.toString();
    TP.regex.TITLE_CASE.lastIndex = 0;

    if (!TP.regex.TITLE_CASE.test(str)) {
        return str.asStartUpper();
    }

    return str.replace(
            TP.regex.TITLE_CASE,
            function(whole, part) {

                return part.toUpperCase();
            }).asStartUpper();
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asUnderscored',
function() {

    /**
     * @method asUnderscored
     * @summary Returns a new string with each uppercase character in lower
     *     case and an underscore separating the "words" formerly set off by
     *     title case. This is effectively the inverse of asCamelCase, but using
     *     underscore rather than hyphen, which effectively "Rubyizes" strings,
     *     i.e. toString => to_string.
     * @returns {String} The converted string.
     */

    return this.replace(/([A-Z])/g,
                    function(whole, part) {

                        return '_' + part.toLowerCase();
                    });
});

//  ------------------------------------------------------------------------

TP.definePrimitive('trim',
function(aString) {

    /**
     * @method trim
     * @summary Returns a new string with the contents of the receiver after
     *     having stripped leading and trailing whitespace.
     * @param {String} aString The string to be trimmed.
     * @returns {String} A string having the contents of the receiver with
     *     leading and trailing whitespace removed.
     */

    if (TP.isString(aString) && TP.regex.WHITESPACE.test(aString)) {
        return aString.trim();
    }

    return aString;
});

//  ------------------------------------------------------------------------
//  TIMESTAMPING
//  ------------------------------------------------------------------------

/*
A number of TIBET methods rely on timestamping such as logging etc. We
install a common TS generation method here to support those operations.
*/

Date.Inst.defineMethod('asTimestamp',
function(includeDate, includeMillis, includeNonNum) {

    /**
     * @method asTimestamp
     * @summary Returns the date as a timestamp. A string of the form
     *     [CCYYMMDDT]hh:mm:ss[.mmm] which is suitable for sorting timestamped
     *     output etc. The default form is essentially an ISO8601 format with
     *     milliseconds.
     * @param {Boolean} includeDate Include CCYYMMDD? The default is true.
     * @param {Boolean} includeMillis Include milliseconds? The default is true.
     * @param {Boolean} includeNonNum Include non-numeric values ('T' and
     *     punctuation)? The default is true.
     * @example Print a Date object as a timestamp, with all printing options
     *     turned on:
     *     <code>
     *          TP.dc().asTimestamp();
     *          <samp>20070327T14:28:30.945</samp>
     *     </code>
     * @example Print a Date object as a timestamp, but don't print the 'date'
     *     portion, only the time portion:
     *     <code>
     *          TP.dc().asTimestamp(false);
     *          <samp>14:28:30.945</samp>
     *     </code>
     * @example Print a Date object as a timestamp, but don't print the 'date'
     *     portion, only the time portion (but without the millisecond count):
     *     <code>
     *          TP.dc().asTimestamp(false, false);
     *          <samp>14:28:30</samp>
     *     </code>
     * @example Print a Date object as a timestamp, but don't print the 'date'
     *     portion, only the time portion (but without the millisecond count or
     *     the punctuation):
     *     <code>
     *          TP.dc().asTimestamp(false, false, false);
     *          <samp>142830</samp>
     *     </code>
     * @returns {String} The receiver represented in a timestamp format.
     * @addon Date
     */

    var s,
        p,
        inD,
        inM;

    p = TP.DEFAULT_NUMPAD;

    inD = TP.isBoolean(includeDate) ? includeDate : true;
    inM = TP.isBoolean(includeMillis) ? includeMillis : true;

    s = inD ? this.getFullYear().toString().pad(4, p) +
                        (this.getMonth() + 1).toString().pad(2, p) +
                        this.getDate().toString().pad(2, p) +
                        'T' : '';

    s = s + this.getHours().toString().pad(2, p) + ':' +
            this.getMinutes().toString().pad(2, p) + ':' +
            this.getSeconds().toString().pad(2, p);

    if (inM) {
        s = s + '.' + this.getMilliseconds().toString().pad(3, p);
    }

    if (TP.isFalse(includeNonNum)) {
        return s.strip(/[^0-9]/g);
    } else {
        return s;
    }
});

//  ------------------------------------------------------------------------
//  NOTIFICATION - PART I
//  ------------------------------------------------------------------------

/**
 * TIBET provides comprehensive support for state change notification across all
 * object types through the use of a common signaling subsystem. Here we put
 * some limiters and a common change notification method in place.
 */

//  ------------------------------------------------------------------------

//  stub for early calls, replaced later in kernel

TP.defineMetaInstMethod('changed',
function(anAspect, anAction, aDescription) {

    /**
     * @method changed
     * @summary Notifies observers that some aspect of the receiver has
     *     changed. The fundamental data-driven dependency method.
     * @description If 'anAspect' is provided then the signal fired will be
     *     'aspectChange' where 'aspect' is replaced with the title-case aspect
     *     value. For example, if the aspect is 'lastname' the signal will be:
     *
     *     LastnameChange
     *
     *     This allows observers to be very discriminating in their
     *     observations...down to a specific slot on an object rather than the
     *     entire object. When the aspect is a number the signal name is
     *     prefixed with 'Index' so an aspect of 1 would result in an
     *     Index1Change signal.
     *
     *     NOTE: if the receiver's shouldSignalChange() method returns false
     *     this method won't fire a signal. This helps to avoid signaling when
     *     no listeners are present. See the shouldSignalChange() method for
     *     more information. Observation of an object for any signal name
     *     containing 'Change' will activate this flag.
     * @param {String} anAspect The aspect of the receiver that changed. This is
     *     usually an attribute name.
     * @param {String} anAction The action which caused the change. This usually
     *     'add', 'remove', etc.
     * @param {TP.lang.Hash} aDescription A hash describing details of the
     *     change.
     * @returns {Object} The receiver.
     * @fires Change
     */

    //  This early version does nothing.
    return this;
});

//  ------------------------------------------------------------------------

(function() {
    var func = function(aFlag) {

        /**
         * @method shouldSignalChange
         * @summary Defines whether the receiver should actively signal change
         *     notifications.
         * @description In general objects do not signal changes when no
         *     observers exist. This flag is triggered by observe where the
         *     signal being observed is a form of Change signal to "arm" the
         *     object for change notification. You can also manipulate it during
         *     multi-step manipulations to signal only when a series of changes
         *     has been completed.
         * @param {Boolean} aFlag true/false signaling status.
         * @example Signal changes from an object, even though there are no
         *     listeners:
         *     <code>
         *          myArr = TP.ac();
         *          myArr.shouldSignalChange(true);
         *          myArr.add(1, 2, 3);
         *          <samp>1, 2, 3</samp>
         *          // If change signal logging is on, you'll also see
         *          // something like:
         *          <var>TP.sig.ValueChange@Array_1119524bba7cc3127febfb45</var>
         *     </code>
         * @returns {Boolean} The current status.
         */

        //  Note we can't do 'if (flag)' here because of its Boolean nature.
        if (arguments.length) {
            this.$$shouldSignal = aFlag;
        }

        //  when suspended is true we always return false which allows an
        //  override to succeed
        if (this.$suspended === true) {
            return false;
        }

        return this.$$shouldSignal;
    };

    //  ---

    //  Add this as a 'meta instance method' to all of the objects managed by
    //  meta-methods.
    TP.defineMetaInstMethod('shouldSignalChange', func);

    //  Now add this as a 'local method' to 'TP' and 'TP.sys'. We do this 'the
    //  old-fashioned way' so as to not reset owner and track information.
    TP.shouldSignalChange = func;
    TP.sys.shouldSignalChange = func;
}());

//  ------------------------------------------------------------------------
//  CONTENT CACHE CONTROL
//  ------------------------------------------------------------------------

/*
TIBET caches content representations for performance. These caches can be
cleared so that they rebuild on the next use for each URI using the
TP.sys.expireContentCaches() call.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('expireContentCaches',
function(aFlag) {

    /**
     * @method expireContentCaches
     * @summary When true, TIBET will invalidate all caches used during content
     *     processing. This will cause new calls to get content data to rebuild
     *     their file caches lazily.
     * @description This method has a similar interface to the should* calls
     *     however since it acts only at the time it's called we use a little
     *     different naming convention to help clarify that it's different from
     *     the control flag methods.
     * @param {Boolean} aFlag Expire now or just return last expiration time?
     * @returns {Date} Last expiration time.
     */

    if (TP.isTrue(aFlag)) {
        this.$$contentExpiration = 0;
    }

    return this.$$contentExpiration;
});

//  ------------------------------------------------------------------------
//  CONTROL FLAG METHODS
//  ------------------------------------------------------------------------

/**
 * TIBET operational flags.
 *
 * All of TIBET's control flag methods follow a combo-setter/getter pattern.
 * Each function is named with the convention should*something*(). If passed
 * a value the function works as a setter. In all cases the return value is
 * whatever the current value is so they always work like getters as well.
 * This convention makes for a nice readable syntax as in:
 *
 * if (TP.sys.shouldLogIO()) { // do what we should };
 *
 * or
 *
 * TP.sys.shouldLogIO(true);
 *
 * Internal to these methods we use TIBET's $set() function, one of our
 * encapsulation primitives, which will signal change notification when the
 * underlying value is altered. This allows the control flags to be altered
 * so that UI such as the TIBET IDE can track their changes visibly.
 */

//  ------------------------------------------------------------------------

//  stub for early calls, replaced later in kernel

//  Add this as a 'meta instance method' to all of the objects managed by
//  meta-methods.
(function() {
    var func = function(attributeName) {

        /**
         * @method $get
         * @summary The most primitive wrapper for attribute retrieval. This
         *     method is supplied to allow overriding of the primitive operation
         *     aspects of 'get' and to provide true getters with a way to access
         *     the low-level slot without any recursion. As with other accessors
         *     this method ignores DNUs.
         * @param {String} attributeName The name of the particular attribute.
         * @returns {Object} The value contained in the named attribute on the
         *     receiver.
         */

        return this[attributeName];
    };

    //  ---

    //  Add this as a 'meta instance method' to all of the objects managed by
    //  meta-methods.
    TP.defineMetaInstMethod('$get', func);

    //  Now add this as a 'local method' to 'TP' and 'TP.sys'. We do this 'the
    //  old-fashioned way' so as to not reset owner and track information.
    TP.$get = func;
    TP.sys.$get = func;
}());

//  ------------------------------------------------------------------------

//  stub for early calls, replaced later in kernel

//  Add it as a 'meta inst method' to all of the objects managed by
//  meta-methods.
(function() {
    var func = function(attributeName, attributeValue) {

        /**
         * @method $set
         * @summary Assigns the value attributeValue to the storage location
         *     for attributeName. Later in the kernel a version of $set is
         *     installed that manages change notification etc. We stub in to
         *     cover the case where a config method may be called prior to that
         *     during bootup.
         * @param {String} attributeName The slot name to receive data.
         * @param {Object} attributeValue The value to assign.
         * @returns {Object} The receiver.
         * @addon Object
         */

        //  NOTE this version doesn't notify, later versions replace this one
        //  to provide that functionality once the kernel has loaded
        this[attributeName] = attributeValue;

        return this;
    };

    //  ---

    //  Add this as a 'meta instance method' to all of the objects managed by
    //  meta-methods.
    TP.defineMetaInstMethod('$set', func);

    //  Now add this as a 'local method' to 'TP' and 'TP.sys'. We do this 'the
    //  old-fashioned way' so as to not reset owner and track information.
    TP.$set = func;
    TP.sys.$set = func;
}());

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldAllowDuplicateInterests',
function(aFlag, shouldSignal) {

    /**
     * @method shouldAllowDuplicateInterests
     * @summary Controls and returns the state of TIBET's interest duplicate
     *     check flag. When set to true TIBET will allow multiple registrations
     *     of the same handler ID for the same origin and signal type pair. When
     *     false TIBET will log this condition with a warning. The default is
     *     false.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to allow duplicate interests:
     *     <code>
     *          TP.sys.shouldAllowDuplicateInterests(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET allows duplicate entries in the
     *     system signal map.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('signal.duplicate_interests', aFlag, shouldSignal);
    }

    return TP.sys.cfg('signal.duplicate_interests');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('$$shouldCacheDeepSubtypes',
function(aFlag) {

    /**
     * @method $$shouldCacheDeepSubtypes
     * @summary Controls and returns the state of the 'deep subtype cache'
     *     flag. When true TIBET will cache the values build from getting deep
     *     lists of subtypes. Normally true.
     * @param {Boolean} aFlag Turn behavior on or off? Default is true.
     * @example Configure TIBET to not cache deep subtype data:
     *     <code>
     *          TP.sys.$$shouldCacheDeepSubtypes(false);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET caches deep subtype data.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('tibet.$$cache_deep_subtypes', aFlag, false);
    }

    return TP.sys.cfg('tibet.$$cache_deep_subtypes');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldCaptureErrors',
function(aFlag, shouldSignal) {

    /**
     * @method shouldCaptureErrors
     * @summary Controls and returns the value of the error forwarding flag.
     * @description This flag determines whether errors caught by TIBET should
     *     be forwarded to the native JS error handling system. If so, the
     *     browser's native handling will execute. Note that certain
     *     browser/debugger tools ignore this so this flag may have no effect.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to capture errors:
     *     <code>
     *          TP.sys.shouldCaptureErrors(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET captures native JS errors via the
     *     onerror hook.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('debug.capture_errors', aFlag, shouldSignal);
    }

    return TP.sys.cfg('debug.capture_errors');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldEmbedProgress',
function(aFlag, shouldSignal) {

    /**
     * @method shouldEmbedProgress
     * @summary Controls and returns the value of the progress format flag.
     * @description This flag determines whether progress messages will be
     *     embedded in the page or via TIBET's notify call. Default is true.
     * @param {Boolean} aFlag Turn behavior on or off? Default is true.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to not embed progress messages:
     *     <code>
     *          TP.sys.shouldEmbedProgress(false);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET embeds progress messages.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('progress.embed', aFlag, shouldSignal);
    }

    return TP.sys.cfg('progress.embed');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldIgnoreViaFlag',
function(aFlag, shouldSignal) {

    /**
     * @method shouldIgnoreViaFlag
     * @summary Controls and returns TIBET's signal interest removal flag.
     * @description When this flag is true, signal interests are removed from
     *     the signal map by simply flagging them. When this flag is false the
     *     interest is removed completely. Useful for debugging and tuning
     *     performance.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to remove signal interests from the map by
     *     flagging them:
     *     <code>
     *          TP.sys.shouldIgnoreViaFlag(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET removes interests by flagging
     *     them.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('signal.ignore_via_flag', aFlag, shouldSignal);
    }

    return TP.sys.cfg('signal.ignore_via_flag');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('$$shouldInvokeInferences',
function(aFlag, shouldSignal) {

    /**
     * @method $$shouldInvokeInferences
     * @summary Controls and returns the state of TIBET's 'invoke inferences'
     *     flag.
     * @description This flag tells TIBET whether inferences made should be
     *     actually executed. This can potentially be turned off so you see what
     *     TIBET would have done, without actually doing it, but in practice
     *     it's normally left on.
     * @param {Boolean} aFlag Turn behavior on or off? Default is true.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to not invoke the inferencing engine:
     *     <code>
     *          TP.sys.$$shouldInvokeInferences(false);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET should use the inferencer if it
     *     can't resolve a method through 'normal' means.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('tibet.$$invoke_inferences', aFlag, shouldSignal);
    }

    return TP.sys.cfg('tibet.$$invoke_inferences');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogActivities',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogActivities
     * @summary Controls and returns the state of the 'log activity' flag.
     * @description This flag determines whether calls to log actually log. Note
     *     that turning on other log status flags won't automatically turn on
     *     the log activity flag. The activity log is the 'meta log' capturing
     *     log data from all the other TIBET logs and providing support for
     *     DEBUG, INFO, and SYSTEM messaging. Note that the logging level may
     *     also affect output.
     * @param {Boolean} aFlag Turn behavior on or off? Default is true.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to not log activities:
     *     <code>
     *          TP.sys.shouldLogActivities(false);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs all 'activities' in the
     *     system.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.activities', aFlag, shouldSignal || false);
    }

    return TP.sys.cfg('log.activities');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogConsoleSignals',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogConsoleSignals
     * @summary Controls and returns the state of TIBET's 'log console signals'
     *     flag.
     * @description When true, and when TP.sys.shouldLogSignals() is true, this
     *     flag will cause TIBET to log console signals such as
     *     TP.sig.UserInput/OutputRequests, TP.sig.ConsoleRequest/Response, etc.
     *     which can be obtrusive when running the TIBET console. The default
     *     value is false.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to log console signals:
     *     <code>
     *          TP.sys.shouldLogConsoleSignals(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs console signals.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.console_signals', aFlag, shouldSignal);
    }

    return TP.sys.cfg('log.console_signals');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogCSS',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogCSS
     * @summary Controls and returns the state of the CSS logging flag.
     * @description When true TIBET will output CSS debugging data.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to log CSS debugging data:
     *     <code>
     *          TP.sys.shouldLogCSS(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs IO activities in the system.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.css_processing', aFlag, shouldSignal);
    }

    return TP.sys.cfg('log.css_processing');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogDOMFocusSignals',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogDOMFocusSignals
     * @summary Controls and returns the state of the DOM focus logging flag.
     * @description When true, and when TP.sys.shouldLogSignals() is true, this
     *     flag will cause TIBET to log DOMFocus, DOMBlur, DOMFocusIn and
     *     DOMFocusOut events. Since these happen with most operations this
     *     value is false by default.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to log DOM focus signals:
     *     <code>
     *          TP.sys.shouldLogDOMFocusSignals(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs DOM focus in the system.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.dom_focus_signals', aFlag, shouldSignal);
    }

    return TP.sys.cfg('log.dom_focus_signals');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogDOMLoadedSignals',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogDOMLoadedSignals
     * @summary Controls and returns the state of the DOMLoaded logging flag.
     * @description When true, and when TP.sys.shouldLogSignals() is true, this
     *     flag will cause TIBET to log element-level DOMLoaded events. Since
     *     these happen with most operations this value is false by default.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to log DOMLoaded signals:
     *     <code>
     *          TP.sys.shouldLogDOMLoadedSignals(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs DOMLoaded signals.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.dom_loaded_signals', aFlag, shouldSignal);
    }

    return TP.sys.cfg('log.dom_loaded_signals');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogErrors',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogErrors
     * @summary Controls and returns the value of the error log flag.
     * @description This flag determines whether calls to log warnings and
     *     errors of any level of severity actually write entries to the error
     *     log. Note that the logging level may also affect output.
     * @param {Boolean} aFlag Turn behavior on or off? Default is true.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to not log errors:
     *     <code>
     *          TP.sys.shouldLogErrors(false);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs errors in the system.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.errors', aFlag, shouldSignal || false);
    }

    return TP.sys.cfg('log.errors');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogInferences',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogInferences
     * @summary Controls and returns the state of TIBET's 'log inferences'
     *     flag.
     * @description This tells TIBET whether inferences made should be logged.
     *     Turning this flag on can help you tune TIBET for better runtime
     *     performance by showing you which methods might benefit from a
     *     concrete implementation rather than being inferred. It should be off
     *     for production systems.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to log inferencer activity:
     *     <code>
     *          TP.sys.shouldLogInferences(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs inferences in the system.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.inferences', aFlag, shouldSignal || false);
    }

    return TP.sys.cfg('log.inferences');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogIO',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogIO
     * @summary Controls and returns the state of the IO logging flag.
     * @description This flag tells TIBET whether to log calls to the IO
     *     subsystem. When the uri and http primitives operate they can log
     *     their activity to TIBET's IO log.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to log IO (file and http) activity:
     *     <code>
     *          TP.sys.shouldLogIO(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs IO activities in the system.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.io', aFlag, shouldSignal || false);
    }

    return TP.sys.cfg('log.io');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogJobs',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogJobs
     * @summary Controls and returns the state of the job logging flag.
     * @description When this flag is true and the job system runs a job it will
     *     log start, step, and stop times for review.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to log job activity:
     *     <code>
     *          TP.sys.shouldLogJobs(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs IO activities in the system.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.jobs', aFlag, shouldSignal || false);
    }

    return TP.sys.cfg('log.jobs');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogKeys',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogKeys
     * @summary Controls and returns the state of TIBET's key logging flag.
     * @description When this flag is true any keyboard event handlers armed
     *     with the standard TIBET event handler will log key events. This is
     *     useful for gathering keycode information from a keyboard.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to log keyboard event activity:
     *     <code>
     *          TP.sys.shouldLogKeys(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs key events in the system.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.keys', aFlag, shouldSignal);
    }

    return TP.sys.cfg('log.keys');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogLinks',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogLinks
     * @summary Controls and returns the state of TIBET's link logging flag.
     * @description This flag controls whether instrumented links will log their
     *     activation to the TIBET log.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to log link activation activity:
     *     <code>
     *          TP.sys.shouldLogLinks(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs link activation in the
     *     system.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.links', aFlag, shouldSignal);
    }

    return TP.sys.cfg('log.links');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogLoadSignals',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogLoadSignals
     * @summary Controls and returns the state of TIBET's 'log load signals'
     *     flag.
     * @description This flags tells TIBET whether, when the signaling machinery
     *     is invoked prior to installation of the full signaling system, TIBET
     *     should log such signals.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to log load signals:
     *     <code>
     *          TP.sys.shouldLogLoadSignals(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs load signals in the system.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.load_signals', aFlag, shouldSignal);
    }

    return TP.sys.cfg('log.load_signals');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogNullNamespaces',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogNullNamespaces
     * @summary Controls and returns the state of TIBET's null namespace
     *     logging. Normally used during development to help detect when a
     *     namespace declaration may be missing.
     * @description Mozilla will, at least in older versions, move elements
     *     whose prefixes don't match declared namespaces, to the null
     *     namespace. This flag controls whether TIBET checks for that and logs
     *     any element names found that match.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to log null namespace notifications:
     *     <code>
     *          TP.sys.shouldLogNullNamespaces(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs null namespace in the
     *     system.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.null_namespaces', aFlag, shouldSignal);
    }

    return TP.sys.cfg('log.null_namespaces');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogRaise',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogRaise
     * @summary Controls and returns the value of the raise log flag.
     * @description This flag determines whether calls to raise should invoke
     *     log*() based on the incoming exception type. Usually you want this
     *     set to true.
     * @param {Boolean} aFlag Turn behavior on or off? Default is true.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to not log exception raises:
     *     <code>
     *          TP.sys.shouldLogRaise(false);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs exception raises in the
     *     system.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.raise', aFlag, shouldSignal || false);
    }

    return TP.sys.cfg('log.raise');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogRequestSignals',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogRequestSignals
     * @summary Controls and returns the state of TIBET's 'log request signals'
     *     flag.
     * @description When true, and when TP.sys.shouldLogSignals() is true, this
     *     flag will cause TIBET to log request signals such as RequestCompleted
     *     which can be obtrusive when running the TIBET console. The default
     *     value is false.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to log request signals:
     *     <code>
     *          TP.sys.shouldLogRequestSignals(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs request signals.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.request_signals', aFlag, shouldSignal);
    }

    return TP.sys.cfg('log.request_signals');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogSecurity',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogSecurity
     * @summary Controls and returns the state of TIBET's 'log security' flag.
     * @description This flag tells TIBET whether permission requests and other
     *     aspects of security-related information should be logged. The default
     *     is true.
     * @param {Boolean} aFlag Turn behavior on or off? Default is true.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to log security-related events:
     *     <code>
     *          TP.sys.shouldLogSecurity(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs security events.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.security', aFlag, shouldSignal);
    }

    return TP.sys.cfg('log.security');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogSignals',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogSignals
     * @summary Controls and returns the state of TIBET's 'log signals' flag.
     * @description Given TIBET's heavy use of signaling this can generate a LOT
     *     of output. At the same time, it can be a critical debugging aid,
     *     particularly with respect to workflow and UI event tracing.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to log signals:
     *     <code>
     *          TP.sys.shouldLogSignals(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs all signals in the system.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.signals', aFlag, shouldSignal || false);
    }

    return TP.sys.cfg('log.signals');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogSignalStack',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogSignalStack
     * @summary Controls and returns the state of TIBET's 'log signal stack'
     *     flag.
     * @description This flag tells TIBET whether, when the signaling machinery
     *     is invoked, it should log signal stack traces, which helps identify
     *     where a signal has originated from.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to log the signal stack traces:
     *     <code>
     *          TP.sys.shouldLogSignalStack(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs signal stack traces in the
     *     system.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.signal_stack', aFlag, shouldSignal || false);
    }

    return TP.sys.cfg('log.signal_stack');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogStack',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogStack
     * @summary Controls and returns the value of the error log stack flag.
     * @description This flag determines whether the call stack should be
     *     written when logging errors. This generates a LOT of output,
     *     particularly if signal logging is also on. Be prepared :).
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to log the error stack:
     *     <code>
     *          TP.sys.shouldLogStack(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs the call stack when logging
     *     errors in the system.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.stack', aFlag, shouldSignal || false);
    }

    return TP.sys.cfg('log.stack');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogStackFileInfo',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogStackFileInfo
     * @summary Controls and returns the value of the file information stack
     *     flag. When this flag is true TIBET will try to log file information
     *     including name and line number for the functions being logged from
     *     the call stack.
     * @description This flag determines whether the call stack should be
     *     written when logging errors. This generates a LOT of output,
     *     particularly if signal logging is also on. Be prepared :).
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to log the error stack:
     *     <code>
     *          TP.sys.shouldLogStackFileInfo(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs the call stack when logging
     *     errors in the system.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.stack_file_info', aFlag, shouldSignal);
    }

    return TP.sys.cfg('log.stack_file_info');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogTransforms',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogTransforms
     * @summary Controls and returns the value of the content transform logging
     *     flag.
     * @description This flag determines whether the content processing system
     *     should log tranformation steps. The logging of this data occurs at
     *     DEBUG level so TP.setLogLevel() must be used to set the proper logger
     *     to DEBUG to capture the output in the logs.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to log content system transformations:
     *     <code>
     *          TP.sys.shouldLogTransforms(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs tag transforms in the
     *     system.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.content_transform', aFlag, shouldSignal);
    }

    return TP.sys.cfg('log.content_transform');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogTSHSignals',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogTSHSignals
     * @summary Controls and returns the state of the TSH signal logging flag.
     * @description This flag tells TIBET whether to log signals related to TSH
     *     processing.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to log TSH signal activity:
     *     <code>
     *          TP.sys.shouldLogTSHSignals(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs TSH signal activity in the
     *     system.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.tsh_signals', aFlag, shouldSignal || false);
    }

    return TP.sys.cfg('log.tsh_signals');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogUserIOSignals',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogUserIOSignals
     * @summary Controls and returns the state of the User IO logging flag.
     * @description This flag tells TIBET whether to log calls to the User IO
     *     subsystem.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to log User IO activity:
     *     <code>
     *          TP.sys.shouldLogUserIOSignals(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs User IO activities in the
     *     system.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.user_io_signals',
                        aFlag,
                        shouldSignal || false);
    }

    return TP.sys.cfg('log.user_io_signals');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogXPaths',
function(aFlag, shouldSignal) {

    /**
     * @method shouldLogXPaths
     * @summary Controls and returns the value of the XPath query logging flag.
     * @description This flag determines whether XPaths should be output to the
     *     activity log, which can help with performance tuning. The logging of
     *     this data occurs at DEBUG level so TP.setLogLevel() must be used to
     *     set the proper logger to DEBUG to capture the output in the logs.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to log XPath queries:
     *     <code>
     *          TP.sys.shouldLogXPaths(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs XPath evaluations in the
     *     system.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.xpaths', aFlag, shouldSignal);
    }

    return TP.sys.cfg('log.xpaths');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldQueueLoadSignals',
function(aFlag, shouldSignal) {

    /**
     * @method shouldQueueLoadSignals
     * @summary Controls and returns the value of the queue load signal flag.
     * @description This flag defines whether TIBET should queue signals fired
     *     prior to full signaling installation for later processing. This
     *     allows you to see any signals which may have fired during kernel
     *     load.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to queue signals for later full signalling
     *     system processing:
     *     <code>
     *          TP.sys.shouldQueueLoadSignals(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET should queue signals fired during
     *     load for later firing.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('signal.queue_load_signals', aFlag, shouldSignal);
    }

    return TP.sys.cfg('signal.queue_load_signals');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldProcessCSS',
function(aFlag, shouldSignal) {

    /**
     * @method shouldProcessCSS
     * @summary Controls and returns TIBET's CSS Processor.
     * @description When this flag is on, TIBET will translate selectors and
     *     create runtime data structures to repair most common CSS selector
     *     limitations.
     * @param {Boolean} aFlag Turn behavior on or off? Default is true.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to not process CSS through its CSS processor:
     *     <code>
     *          TP.sys.shouldProcessCSS(false);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET should process CSS structures.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('css.process_styles', aFlag, shouldSignal);
    }

    return TP.sys.cfg('css.process_styles');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldRegisterLoggers',
function(aFlag, shouldSignal) {

    /**
     * @method shouldRegisterLoggers
     * @summary Controls and returns TIBET's registration policy flag.
     * @description If this flag is true, TIBET will register objects which log
     *     errors. This allows developers to access the objects which have
     *     written to the error log via their OIDs.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to register objects which log errors:
     *     <code>
     *          TP.sys.shouldRegisterLoggers(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET registers objects that log
     *     errors.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('debug.register_loggers', aFlag, shouldSignal);
    }

    return TP.sys.cfg('debug.register_loggers');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldReportParseErrors',
function(aFlag, shouldSignal) {

    /**
     * @method shouldReportParseErrors
     * @summary Controls and returns TIBET's DOM parsing report flag.
     * @description When this flag is true, TIBET forces DOM parse errors to be
     *     reported. This is useful primarily for debugging so the default is
     *     false.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to report DOM parsing errors:
     *     <code>
     *          TP.sys.shouldReportParseErrors(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET forces DOM parser errors to be
     *     reported.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('debug.report_parse_errors', aFlag, shouldSignal);
    }

    return TP.sys.cfg('debug.report_parse_errors');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldRequestPrivileges',
function(aFlag, shouldSignal) {

    /**
     * @method shouldRequestPrivileges
     * @summary Controls and returns TIBET's privilege request flag, which is
     *     used for Mozilla PrivilegeManager access.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to request enhanced security privileges:
     *     <code>
     *          TP.sys.shouldRequestPrivileges(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET requests privileges before
     *     performing certain browser operations.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('security.request_privileges', aFlag, shouldSignal);
    }

    return TP.sys.cfg('security.request_privileges');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldSignalDOMLoaded',
function(aFlag, shouldSignal) {

    /**
     * @method shouldSignalDOMLoaded
     * @summary Controls and returns TIBET's DOMLoaded signal flag.
     * @description If true, TIBET will signal DOMLoaded from page elements
     *     which are having their content updated. NOTE that this flag will have
     *     no effect on DOMLoaded signals thrown from the document level so that
     *     in-page content load listeners will always function.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to signal DOMLoaded from updating page elements:
     *     <code>
     *          TP.sys.shouldSignalDOMLoaded(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET signals DOMLoaded when page
     *     elements are having their content updated.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('signal.dom_loaded', aFlag, shouldSignal);
    }

    return TP.sys.cfg('signal.dom_loaded');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldSignalDOMFocusSignals',
function(aFlag, shouldSignal) {

    /**
     * @method shouldSignalDOMFocusSignals
     * @summary Controls and returns the state of the DOM focus signaling flag.
     *     By turning off DOM focus/blur signaling you have a way to debug other
     *     debug DOM events more effectively.
     * @param {Boolean} aFlag Turn behavior on or off? Default is true.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to stop signaling DOM focus signals:
     *     <code>
     *          TP.sys.shouldSignalDOMFocusSignals(false);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET signals DOM focus/blur.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('signal.dom_focus_signals', aFlag, shouldSignal);
    }

    return TP.sys.cfg('signal.dom_focus_signals');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldThrowEvaluations',
function(aFlag, shouldSignal) {

    /**
     * @method shouldThrowEvaluations
     * @summary Controls and returns the state of TIBET's flag for shell
     *     evaluations.
     * @description When true TIBET will throw native JavaScript errors that
     *     occur in evaluations done in the shell.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to throw native JS Errors when evaluations fail
     *     in the shell:
     *     <code>
     *          TP.sys.shouldThrowEvaluations(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET throws native JS errors when
     *     doing shell evaluations.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('debug.throw_evaluations', aFlag, shouldSignal);
    }

    return TP.sys.cfg('debug.throw_evaluations');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldThrowExceptions',
function(aFlag, shouldSignal) {

    /**
     * @method shouldThrowExceptions
     * @summary Controls and returns the state of TIBET's flag for exception
     *     handling behavior.
     * @description When this flag is true, TIBET will throw native JS Error
     *     objects in response to exception raise calls whose exception
     *     instances aren't handled by an observer. By controlling this flag
     *     effectively TIBET allows you to have an integrated error handling
     *     system that supports lightweight exceptions via TP.sig.Exception
     *     which might be handled, followed by heavyweight try/catch controls.
     * @param {Boolean} aFlag Turn behavior on or off? Default is true.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to not throw native JS Errors when TIBET
     *     exceptions occur:
     *     <code>
     *          TP.sys.shouldThrowExceptions(false);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET throws exceptions using native JS
     *     Error objects.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('debug.throw_exceptions', aFlag, shouldSignal);
    }

    return TP.sys.cfg('debug.throw_exceptions');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldThrowHandlers',
function(aFlag, shouldSignal) {

    /**
     * @method shouldThrowHandlers
     * @summary Controls and returns the state of TIBET's flag for handler
     *     invocation try/catch behavior.
     * @description When this flag is true the system will run event handlers
     *     without a try/catch block.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to throw native JS Errors when errors occur in
     *     event handlers:
     *     <code>
     *          TP.sys.shouldThrowHandlers(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET try/catch protects handler
     *     invocations.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('debug.throw_handlers', aFlag, shouldSignal);
    }

    return TP.sys.cfg('debug.throw_handlers');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldTrackJobStats',
function(aFlag, shouldSignal) {

    /**
     * @method shouldTrackJobStats
     * @summary Controls and returns the state of TIBET's job statistics
     *     gathering.
     * @description When this flag is true (and not overridden by a specific job
     *     instance) jobs will track step and timing information for review.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to track job statistics:
     *     <code>
     *          TP.sys.shouldTrackJobStats(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET keeps track of job performance.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('job.track_stats', aFlag, shouldSignal);
    }

    return TP.sys.cfg('job.track_stats');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldTrackSignalStats',
function(aFlag, shouldSignal) {

    /**
     * @method shouldTrackSignalStats
     * @summary Controls and returns the state of TIBET's signaling statistics
     *     flag. When true TIBET will keep timing data on each signal handler
     *     invocation to help with tuning.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to track signaling statistics:
     *     <code>
     *          TP.sys.shouldTrackSignalStats(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET keeps track of how many objects
     *     got constructed in the system.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('signal.track_stats', aFlag, shouldSignal);
    }

    return TP.sys.cfg('signal.track_stats');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldTrapRecursion',
function(aFlag, shouldSignal) {

    /**
     * @method shouldTrapRecursion
     * @summary Controls and returns the flag defining whether TIBET should
     *     enforce its recursion trapping method.
     * @description The TIBET recursion-trapping method, trapRecursion() is
     *     installed in a few locations to help with recursion debugging. While
     *     Mozilla will report endless recursion, it won't show the stack :(.
     *     Using this method helps provide a little more control although
     *     figuring out where to put it can be tricky.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to track trap recursion:
     *     <code>
     *          TP.sys.shouldTrapRecursion(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET will attempt to trap recursive
     *     calls.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('debug.trap_recursion', aFlag, shouldSignal);
    }

    return TP.sys.cfg('debug.trap_recursion');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldUniqueTypes',
function(aFlag, shouldSignal) {

    /**
     * @method shouldUniqueTypes
     * @summary Controls and returns the state of TIBET's type uniquing flag.
     * @description When true TIBET will not recreate types in the defineSubtype
     *     call. The default is true, meaning that when a type is ':source'd in
     *     using the TAP/TDC the original type is not replaced. This can help
     *     with maintaining type attribute state across iterative reloads if the
     *     type is properly defined and it's initialize method preserves
     *     existing data.
     * @param {Boolean} aFlag Turn behavior on or off? Default is true.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to not unique type objects:
     *     <code>
     *          TP.sys.shouldUniqueTypes(false);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET should unique type objects in the
     *     system.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('tibet.unique_types', aFlag, shouldSignal);
    }

    return TP.sys.cfg('tibet.unique_types');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('$$shouldUseBackstop',
function(aFlag, shouldSignal) {

    /**
     * @method $$shouldUseBackstop
     * @summary Controls and returns the state of TIBET's backstop.
     * @description If this flag is true, TIBET will cause the
     *     'doesNotUnderstand' backstop to be invoked by get() calls which fail
     *     to find a value. The TIBET backstop provides support for 'Proxies',
     *     and the TIBET inferencer so this should normally be true.
     *     NOTE: When first implemented the backstop was an experimental feature
     *     but it's now effectively required. Don't turn this flag off if you
     *     want TIBET to run :).
     * @param {Boolean} aFlag Turn behavior on or off? Default is true.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @returns {Boolean} Whether or not TIBET should use its backstop for
     *     methods that cannot be found.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('tibet.$$use_backstop', aFlag, shouldSignal);
    }

    return TP.sys.cfg('tibet.$$use_backstop');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldUseContentCheckpoints',
function(aFlag, shouldSignal) {

    /**
     * @method shouldUseContentCheckpoints
     * @summary Controls and returns the state of TIBET's content checkpointing
     *     flag.
     * @description If this flag is true then TIBET's content processing methods
     *     will checkpoint when possible to assist with debugging content
     *     transformations which occur. This allows you to review the content at
     *     each processing phase to see how the transformations are effecting
     *     the content.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to use content processing checkpoints:
     *     <code>
     *          TP.sys.shouldUseContentCheckpoints(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET should checkpoint content.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('content.use_checkpoints', aFlag, shouldSignal);
    }

    return TP.sys.cfg('content.use_checkpoints');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldUseContentCaches',
function(aFlag, shouldSignal) {

    /**
     * @method shouldUseContentCaches
     * @summary Controls and returns the state of the content file cache flag.
     * @description Turning this off will cause content processing to skip using
     *     file-based caches without affecting how they may choose to leverage
     *     memory caching. During development it's often useful to run with
     *     caches off so you work primarily with memory-based caches to avoid
     *     confusion.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to use content processing system file caches:
     *     <code>
     *          TP.sys.shouldUseContentCaches(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET should use file caches.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('content.use_caches', aFlag, shouldSignal);
    }

    return TP.sys.cfg('content.use_caches');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldUseDebugger',
function(aFlag, shouldSignal) {

    /**
     * @method shouldUseDebugger
     * @summary Controls and returns the state of TIBET's 'debugger' flag.
     * @description This flag tells TIBET whether, when an exception is raised,
     *     the debugger hook should be invoked. The default hook will cause
     *     TIBET to stop in any currently running debugger by invoking the
     *     ECMA-defined 'debugger;' keyword. Future versions of TIBET on
     *     Mozilla, for example, may invoke that browser's 'jsdebug' interface
     *     for source-level debugging support.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to invoke the debugger whenever any TIBET
     *     exception occurs:
     *     <code>
     *          TP.sys.shouldUseDebugger(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET should use the debugger when an
     *     exception is raised.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('debug.use_debugger', aFlag, shouldSignal);
    }

    return TP.sys.cfg('debug.use_debugger');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('$$shouldUseInferencing',
function(aFlag, shouldSignal) {

    /**
     * @method $$shouldUseInferencing
     * @summary Controls and returns the state of TIBET's 'inferencing' flag.
     * @param {Boolean} aFlag Turn behavior on or off? Default is true.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to not use type inferencing to resolve unknown
     *     methods:
     *     <code>
     *          TP.sys.$$shouldUseInferencing(false);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET should use its inferencer when
     *     methods cannot be found.
     * @discusson This flag tells TIBET whether inferences should be made. Note
     *     that the overall TIBET backstop processing must be active for this
     *     flag to change actual runtime behavior.
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('tibet.$$use_inferencing', aFlag, shouldSignal);
    }

    return TP.sys.cfg('tibet.$$use_inferencing');
});

//  ------------------------------------------------------------------------
//  VERSION CHECKS
//  ------------------------------------------------------------------------

/*
Methods in this section relate to the TIBET Kernel version information and
whether the current version is up-to-date.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('checkLibVersion',
function() {

    /**
     * @method checkLibVersion
     * @summary Checks whether the current kernel version is the latest
     *     available version by comparing current version data against a
     *     published TIBET release reference.
     * @description This method expects to find a file at the location pointed
     *     to by '~lib_version_file' with the following content:
     *
     *      release({
     *          "describe": "{{describe}}",
     *          "major": "{{major}}",
     *          "minor": "{{minor}}",
     *          "patch": "{{patch}}",
     *          "suffix": "{{suffix}}",
     *          "increment": "{{increment}}",
     *          "ptag": "{{ptag}}",
     *          "commits": "{{commits}}",
     *          "phash": "{{phash}}",
     *          "time": "{{time}}",
     *          "semver": "{{semver}}"
     *      });
     *
     * @param {Boolean} logDetails If true, details about new versions will be
     *     written to the TIBET activity log and an 'TP.sig.UpdateAvailable'
     *     signal using TP.sys as the origin is fired.
     */

    var path,
        current,
        callback;

    path = TP.uriExpandPath('~lib_version_file');
    current = TP.sys.getLibVersion();

    TP.ifTrace() ?
        TP.trace('Checking for updates to ' + TP.sys.getLibVersion(),
            TP.LOG) : 0;

    //  build up a callback function that'll handle the work once the
    //  actual call is complete
    callback = function(data) {

        var latest;

        if (TP.notEmpty(data)) {

            latest = TP.sys.getLibVersion(data);
            if (latest === current) {
                //  this build is up to date...
                TP.ifTrace() ?
                    TP.trace(current + ' is the latest.',
                        TP.LOG) : 0;
                return;
            }

            TP.ifTrace() ? TP.trace(
                        'Latest version is version ' +
                        latest + '.',
                        TP.LOG) : 0;

            TP.signal(TP.sys, 'TP.sig.UpdateAvailable', data);
        } else {
            TP.ifWarn() ?
                TP.warn('Unable to access ' + path + ' for version data.',
                        TP.LOG) : 0;

            TP.ifTrace() ?
                TP.trace('Assuming version ' + current + ' is current.',
                        TP.LOG) : 0;
        }
    };

    //  fire off the call
    try {
        //  typically this is the TIBET web site, but it could be one for
        //  the current application/product instead. NOTE the use of a
        //  jsonpCall here to avoid single-domain restrictions...yeah, it's
        //  a security issue, but no, the browsers are never going to close
        //  it because then how would all those ad servers work? ;)

        //  Note the hardcoded 'release' callback function name. This
        //  is to avoid having to have anything more than a file with the
        //  content as described in the method discussion above - no CGI
        //  necessary to read the 'callback=' parameter, etc. etc.
        TP.jsonpCall(path, callback, 'release', null, null, false);
    } catch (e) {
        TP.ifError() ? TP.error(TP.ec(e, 'Unable to access ' + path),
                                TP.LOG) : 0;

        TP.ifTrace() ? TP.trace('Assuming version ' +
                    TP.sys.getLibVersion() + ' is current.',
                    TP.LOG) : 0;
    }
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getLibVersion',
function(release, meta) {

    /**
     * @method getLibVersion
     * @summary Returns the value of the version identification data as a
     *     string. If release data is provided the string for that data is
     *     returned, otherwise the string for the current kernel is returned.
     *     NOTE that the string returned is intended to conform to the semver
     *     specification with optional pre-release and metadata content.
     * @param {Object} release A release data structure. See
     *     TIBETVersionTemplate.js for content.
     * @returns {String} The version string identifier.
     */

    var str,
        data,
        semver;

    // Return cached value if possible.
    if (TP.isEmpty(release)) {
        if (TP.notEmpty(TP.sys.$versionString)) {
            return TP.sys.$versionString;
        }
    }

    // Default data to the current kernel's stored version info.
    data = TP.hc(TP.ifInvalid(release, TP.sys.$version));

    // Build a semver-compliant string optionally including pre-release and meta
    // information when that data is available. Not all releases have it.
    str = 'v';
    str += TP.ifEmpty(data.at('major'), '0');
    str += '.';
    str += TP.ifEmpty(data.at('minor'), '0');
    str += '.';
    str += TP.ifEmpty(data.at('patch'), '0');

    if (TP.notEmpty(data.at('suffix'))) {
        str += '-';
        str += data.at('suffix');

        str += '.';
        str += data.at('increment');
    }

    if (TP.isTrue(meta)) {
        semver = data.at('semver');

        if (TP.notEmpty(data.at('phash'))) {
            str += '+g';
            str += data.at('phash');
        }

        if (TP.notEmpty(data.at('commits'))) {
            if (TP.notEmpty(data.at('phash'))) {
                str += '.';
            } else {
                str += '+';
            }
            str += data.at('time');
        }

        if (TP.notEmpty(data.at('time'))) {
            if (TP.notEmpty(data.at('phash')) ||
                    TP.notEmpty(data.at('commits'))) {
                str += '.';
            } else {
                str += '+';
            }
            str += data.at('time');
        }
    } else {
        semver = data.at('semver').split('+')[0];
    }

    // A sanity check...
    if (str !== semver) {
        // Hmmm. Computation should be the same.
        TP.error('Version string mismatch. source -> ' + data.at('semver') +
            ' !== ' + str + ' <- computed.');
    }

    if (TP.isEmpty(release)) {
        TP.sys.$versionString = str;
    }

    return str;
});

//  ------------------------------------------------------------------------
//  GLOBAL STATE ACCESSORS
//  ------------------------------------------------------------------------

/*
TIBET contains a number of global properties that affect operation, some of
which are expected to vary throughout an application's lifecycle. Here we
define a few methods that allow these globals to work within the context of
change notification so TIBET's tools can be notified of their current state.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getRuntimeInfo',
function() {

    /**
     * @method getRuntimeInfo
     * @summary Returns an object containing current environmental data
     *     regarding the browser and TIBET.
     * @example Retrieve information about the environment that TIBET is
     *     currently executing in:
     *     <code>
     *          TP.sys.getRuntimeInfo();
     *          <samp>{"BROWSER_AGENT":"mozilla/5.0 (macintosh; u; intel
     *          mac os x; en-us; rv:1.8.1.3) gecko/20070309
     *          firefox/2.0.0.3",
     *          "CURRENT_LTIME":"Tue Mar 27 2007 17:08:46 GMT-0600 (MDT)",
     *          "TIBET_LICENSE":"_0000000000000000"}</samp>
     *     </code>
     * @returns {TP.lang.Hash} A collection containing data about the current
     *     execution environment.
     */

    var info;

    info = TP.hc();

    info.atPut('CURRENT_LTIME', (new Date()).toString());
    info.atPut('TIBET_VERSION', TP.sys.$VERSION);
    info.atPut('TIBET_LICENSE', TP.sys.$LICENSE);
    info.atPut('BROWSER_AGENT', TP.$agent);

    return info;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getSTATUS',
function() {

    /**
     * @method getSTATUS
     * @summary Returns the global $STATUS flag setting. This method provides a
     *     get() accessible interface to that global.
     * @returns {Number} A status code, typically from job control status codes.
     */

    return $STATUS;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('setSTATUS',
function(aStatusCode) {

    /**
     * @method setSTATUS
     * @summary Controls the global $STATUS flag setting. This method provides
     *     a set() accessible interface to that global.
     * @param {Number} aStatusCode The value to set the $STATUS code.
     * @returns {Boolean} The value of the global $STATUS flag.
     */

    var oldVal;

    oldVal = $STATUS;

    if (oldVal !== aStatusCode) {
        $STATUS = aStatusCode;
        TP.sys.changed('STATUS',
                        TP.UPDATE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, aStatusCode));
    }

    return $STATUS;
});

//  ------------------------------------------------------------------------
//  LOAD INFORMATION
//  ------------------------------------------------------------------------

/*
It's common to need information about the location from which TIBET was
loaded. This set of functions provides access to the host, port, scheme,
and pathname which were used to load TIBET, as well as the 'root path' from
which other TIBET components can be found. The root path is the most useful
given that it supports both http and file-based launches. The other
functions are really only useful when TP.sys.$httpBased is true.
*/

//  first define whether we were loaded from file url or a web server
/* eslint-disable no-extra-parens */
TP.sys.$httpBased = (window.location.protocol.indexOf('file') !== 0);
/* eslint-enable no-extra-parens */

TP.sys.$scheme = window.location.protocol.slice(0, -1);
TP.sys.$pathname = decodeURI(window.location.pathname);

if (TP.sys.$httpBased) {
    TP.sys.$host = window.location.hostname;

    /* eslint-disable no-extra-parens */
    TP.sys.$port = (TP.isEmpty(window.location.port) ||
                    TP.notValid(window.location.port)) ?
                    80 : window.location.port;
    /* eslint-enable no-extra-parens */
} else {
    TP.sys.$host = '';
    TP.sys.$port = '';
}

//  ------------------------------------------------------------------------

TP.sys.defineMethod('isHTTPBased',
function() {

    /**
     * @method isHTTPBased
     * @summary Returns true if the TIBET codebase was loaded via HTTP.
     * @returns {Boolean} Whether or not the TIBET codebase was loaded over
     *     HTTP.
     */

    return TP.sys.$httpBased;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getLaunchRoot',
function() {

    /**
     * @method getLaunchRoot
     * @summary Returns the "launch root", either the web server's root or the
     *     root of the file system from which the current app was launched.
     * @example Retrieve TIBET's launch root (in this case, TIBET was launched
     *     from disk on a Unix-based OS):
     *     <code>
     *          TP.sys.getLaunchRoot();
     *          <samp>file://</samp>
     *     </code>
     * @example Retrieve TIBET's launch root (in this case, TIBET was launched
     *     from disk on a Windows-based OS):
     *     <code>
     *          TP.sys.getLaunchRoot();
     *          <samp>file:///C:</samp>
     *     </code>
     * @example Retrieve TIBET's launch root (in this case, TIBET was launched
     *     from an HTTP server on the local system):
     *     <code>
     *          TP.sys.getLaunchRoot();
     *          <samp>http://localhost</samp>
     *     </code>
     * @returns {String} The root path that the TIBET codebase was launched
     *     from.
     */

    var str,
        port;

    if (TP.sys.isHTTPBased()) {
        //  on http uris you need the host:port portion as a root
        str = TP.sys.getScheme() + '://' + TP.sys.getHost();
        if (TP.isValid(port = TP.sys.getPort()) &&
            port.toString() !== '80') {
            str += ':' + port;
        }
    } else if (TP.sys.isWin()) {
        //  on windows if you don't include the drive spec in the root the
        //  files won't be found. this is consistent with IE behavior.
        return decodeURI(window.location.toString()).slice(0,
                decodeURI(window.location.toString()).lastIndexOf(':') + 1);
    } else {
        //  on unix-style platforms there's no drive spec to mess things up
        //  when resolving 'absolute' paths starting with '/'
        return 'file://';
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getHost',
function() {

    /**
     * @method getHost
     * @summary Returns the hostname from which TIBET was loaded.
     * @returns {String} The host from which TIBET was loaded.
     */

    return TP.sys.$host;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getPathname',
function() {

    /**
     * @method getPathname
     * @summary Returns the pathname from which TIBET was loaded.
     * @returns {String} The pathname from which TIBET was loaded.
     */

    return TP.sys.$pathname;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getPort',
function() {

    /**
     * @method getPort
     * @summary Returns the port number string from which TIBET was loaded. If
     *     no port number was specified in the load URL this string is empty.
     * @returns {Number} The port number from which TIBET was loaded.
     */

    return TP.sys.$port;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getScheme',
function() {

    /**
     * @method getScheme
     * @summary Returns the scheme used when TIBET was loaded. This is
     *     typically http or https which allows TIBET to determine if a secure
     *     connection is required as the default for future connections to the
     *     server.
     * @returns {String} The scheme used when TIBET was loaded.
     */

    return TP.sys.$scheme;
});

//  ------------------------------------------------------------------------
//  SOURCE LANGUAGE
//  ------------------------------------------------------------------------

/*
When doing localization you need to know two languages, the one you've got,
and the one you want to translate to. The one you've got is what TIBET
refers to as the "source language". This is normally U.S. English since
that's the language typically used when authoring source code. But if you
want to author your applications in German or French for example, you can
alter the source language so that TIBET will start there when doing its
translations.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getSourceLanguage',
function() {

    /**
     * @method getSourceLanguage
     * @summary Returns the current source 'lang', the language most source
     *     strings will be in.
     * @description This value is typically en-us, but can be changed to adapt
     *     to local coding preferences. The source language is used as the key
     *     during localization lookups.
     * @example Get TIBET's current 'source language':
     *     <code>
     *          TP.sys.getSourceLanguage();
     *          <samp>en-us</samp>
     *     </code>
     * @returns {String} The current value for source language. The default is
     *     'en-us'.
     */

    return TP.sys.cfg('tibet.sourcelang',
                        TP.sys.env('tibet.xmllang', 'en-us'));
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getTargetLanguage',
function() {

    /**
     * @method getTargetLanguage
     * @summary Returns the target 'lang', the user's targeted language
     *     setting.
     * @description This method leverages TP.core.Locale data whenever possible,
     *     otherwise the boot property for userlang is used. When translations
     *     are performed this is the language being targeted using the current
     *     source language as the key.
     * @example Get TIBET's current 'target language':
     *     <code>
     *          TP.sys.getTargetLanguage();
     *          <samp>en-us</samp>
     *     </code>
     * @returns {String} The current target language key. The default is
     *     'en-us'.
     */

    //  leverage the TP.core.Locale type if we've loaded it at this point
    if (TP.isType(TP.sys.require('TP.core.Locale'))) {
        return TP.ifInvalid(TP.sys.getLocale().getISOKey(), 'en-us');
    }

    return TP.sys.cfg('tibet.sourcelang',
                        TP.sys.env('tibet.xmllang', 'en-us'));
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('setSourceLanguage',
function(aLangCode) {

    /**
     * @method getSourceLanguage
     * @summary Returns the current source 'lang', the language most source
     *     strings will be in.
     * @description This is typically en-us, but can be changed to adapt to
     *     local coding preferences. The source language is used as the key
     *     during localization lookups.
     * @example Set TIBET's current 'source language':
     *     <code>
     *          TP.sys.setSourceLanguage('en-gb');
     *          <samp>en-gb</samp>
     *     </code>
     * @returns {String} The current value for source language. The default is
     *     'en-us'.
     */

    return TP.sys.setcfg(
        'tibet.sourcelang',
        TP.ifInvalid(aLangCode, TP.sys.env('tibet.xmllang', 'en-us')));
});

//  ------------------------------------------------------------------------
//  RUNTIME LOOKUP/PINPOINTING
//  ------------------------------------------------------------------------

/*
At runtime there are a couple of settings that can be used to influence
which entries in the XML Catalog will be used, in particular whether TIBET
is currently running "offline" and what environment was the application
booted with (development, test, production, or a custom environment).
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getProfile',
function() {

    /**
     * @method getProfile
     * @summary Returns the current boot profile, such as 'development',
     *     'test', or 'production'. This is effectively a readonly property
     *     since it's set at boot time and defines how the boot process loads.
     *     Trying to change this value at runtime is not supported.
     * @returns {String} The current value for environment.
     */

    return TP.sys.cfg('boot.profile');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getState',
function() {

    /**
     * @method getState
     * @summary Returns the current state, which is an application-specific
     *     string representing the current operation or "state" of the
     *     application (editing, viewing, printing, etc).
     * @returns {String} The current value for application state.
     */

    return TP.sys.cfg('tibet.state');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('isExiting',
function(aFlag) {

    /**
     * @method isExiting
     * @summary Controls and returns the state of the exiting flag, which is
     *     set when a valid "logout" sequence has been initiated by the current
     *     application. This allows certain teardown operations to function
     *     properly.
     * @param {Boolean} aFlag True to set exiting state to true.
     * @returns {Boolean} True if TIBET is currently exiting.
     */

    var oldVal;

    if (TP.isBoolean(aFlag)) {
        oldVal = TP.sys.cfg('tibet.exiting');

        if (oldVal !== aFlag) {

            TP.sys.setcfg('tibet.exiting', aFlag);

            TP.sys.changed('tibet.exiting',
                            TP.UPDATE,
                            TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, aFlag));
        }
    }

    //  NOTE the default to false since this flag isn't always there
    return TP.sys.cfg('tibet.exiting', false);
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('isOffline',
function(aFlag) {

    /**
     * @method isOffline
     * @summary Controls and returns the state of the online/offline flag.
     * @description This is set automatically to false when the launch was from
     *     a file:// url. You can still force it back to true if you start
     *     accessing HTTP urls later in your session. Note that the HTML5
     *     'online/offline' events have been wired to set this flag as well.
     * @param {Boolean} aFlag True means we're "offline".
     * @returns {Boolean} Whether or not TIBET is currently running in "offline"
     *     mode.
     */

    var oldVal;

    if (TP.isBoolean(aFlag)) {
        oldVal = TP.sys.cfg('tibet.offline');

        if (TP.sys.cfg('tibet.offline') !== aFlag) {

            TP.sys.setcfg('tibet.offline', aFlag);

            //  altering the offline status may affect uri filtering
            TP.sys.setcfg('tibet.uriprofile', null);

            TP.sys.changed('tibet.offline',
                            TP.UPDATE,
                            TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, aFlag));
        }
    }

    return TP.sys.cfg('tibet.offline');
});

//  ------------------------------------------------------------------------
//  REAL and EFFECTIVE SETTINGS
//  ------------------------------------------------------------------------

/*
To manage the development process and administrative applications more
effectively TIBET employs a UNIX-style "real" and "effective" user model. In
essence, when a user logs in to TIBET there's a presumed "real" user ID that
is associated with that login and the server-side session that's likely to
be in effect for that user ID. Subsequent to initial login the application
may support the ability for the user to alter their "effective" user ID to
simulate operations on behalf of another user. Development and QA processing
can often leverage this feature, but it also comes up in any application
that supports an administrative "mode" where the administrator can perform
actions on behalf of an alternative user.
*/

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getEffectiveUser',
function() {

    /**
     * @method getEffectiveUser
     * @summary Returns the effective user, the user instance for which all
     *     operations are being filtered at the time of this call.
     * @example Get TIBET's current 'effective user':
     *     <code>
     *          TP.sys.getEffectiveUser();
     *          <samp>bedney</samp>
     *     </code>
     * @returns {TP.core.User} The effective TP.core.User instance, if there is
     *     one.
     */

    var type;

    if (TP.isType(type = TP.sys.require('TP.core.User'))) {
        return type.getEffectiveUser();
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getRealUser',
function() {

    /**
     * @method getRealUser
     * @summary Returns the "real" user, the user instance that was the initial
     *     instance constructed during login/session creation.
     * @example Get TIBET's current 'real user':
     *     <code>
     *          TP.sys.getRealUser();
     *          <samp>bedney</samp>
     *     </code>
     * @returns {TP.core.User} The real TP.core.User instance, if there is one.
     */

    var type;

    if (TP.isType(type = TP.sys.require('TP.core.User'))) {
        return type.getRealUser();
    }

    return;
});

//  ------------------------------------------------------------------------

//  Add metadata for the 'bootstrap' methods that got us this far.

//  Defined in TIBETGlobal.js
TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETGlobals.js';

TP.sys.addMetadata(TP, TP.constructOrphanObject, TP.METHOD, TP.PRIMITIVE_TRACK);
TP.sys.addMetadata(TP, TP.defineNamespace, TP.METHOD, TP.PRIMITIVE_TRACK);
TP.sys.addMetadata(TP, TP.isNamespace, TP.METHOD, TP.PRIMITIVE_TRACK);
TP.sys.addMetadata(TP.sys, TP.sys.getGlobals, TP.METHOD, TP.PRIMITIVE_TRACK);
TP.sys.addMetadata(TP.sys, TP.sys.release, TP.METHOD, TP.PRIMITIVE_TRACK);

//  Defined in this file
TP.boot[TP.SOURCE_PATH] = '~lib_src/tibet/kernel/TIBETPrimitivesPre.js';

TP.sys.addMetadata(TP, TP.isCallable, TP.METHOD, TP.PRIMITIVE_TRACK);
TP.sys.addMetadata(TP, TP.canInvoke, TP.METHOD, TP.PRIMITIVE_TRACK);
TP.sys.addMetadata(TP, TP.isValid, TP.METHOD, TP.PRIMITIVE_TRACK);
TP.sys.addMetadata(TP, TP.notValid, TP.METHOD, TP.PRIMITIVE_TRACK);
TP.sys.addMetadata(TP, TP.ifInvalid, TP.METHOD, TP.PRIMITIVE_TRACK);
TP.sys.addMetadata(TP, TP.isDNU, TP.METHOD, TP.PRIMITIVE_TRACK);
TP.sys.addMetadata(TP, TP.isFunction, TP.METHOD, TP.PRIMITIVE_TRACK);
TP.sys.addMetadata(TP, TP.isString, TP.METHOD, TP.PRIMITIVE_TRACK);
TP.sys.addMetadata(TP, TP.owns, TP.METHOD, TP.PRIMITIVE_TRACK);
TP.sys.addMetadata(TP, TP.objectGetLoadNode, TP.METHOD, TP.PRIMITIVE_TRACK);
TP.sys.addMetadata(TP, TP.objectSetLoadNode, TP.METHOD, TP.PRIMITIVE_TRACK);
TP.sys.addMetadata(Function, TP.FunctionProto.asMethod,
                    TP.METHOD, TP.INST_TRACK);
TP.sys.addMetadata(String, TP.StringProto.strip, TP.METHOD, TP.INST_TRACK);
TP.sys.addMetadata(TP.sys, TP.sys.constructOID, TP.METHOD, TP.LOCAL_TRACK);
TP.sys.addMetadata(TP, TP.getFunctionName, TP.METHOD, TP.PRIMITIVE_TRACK);
TP.sys.addMetadata(Function, TP.FunctionProto.$getName,
                    TP.METHOD, TP.INST_TRACK);
TP.sys.addMetadata(TP, TP.objectGetMetadataName, TP.METHOD, TP.PRIMITIVE_TRACK);
TP.sys.addMetadata(TP.sys, TP.sys.addMetadata, TP.METHOD, TP.LOCAL_TRACK);

//  ------------------------------------------------------------------------
//  TIBET - PLUGIN INFORMATION
//  ------------------------------------------------------------------------

TP.ACROBAT_PLUGIN = 'acrobat';
TP.QUICKTIME_PLUGIN = 'quicktime';
TP.DIVX_PLUGIN = 'divx';
TP.DIRECTOR_PLUGIN = 'director';
TP.FLASH_PLUGIN = 'flash';
TP.VLC_PLUGIN = 'vlc';
TP.WINDOWS_MEDIA_PLUGIN = 'windows_media';
TP.JAVA_PLUGIN = 'java';
TP.REALPLAYER_PLUGIN = 'realplayer';
TP.SILVERLIGHT_PLUGIN = 'silverlight';

//  ------------------------------------------------------------------------

TP.PLUGIN_INFO = TP.hc();

TP.PLUGIN_INFO.atPut(
    TP.ACROBAT_PLUGIN,
    TP.hc('classID',
            'CA8A9780-280D-11CF-A24D-444553540000',
        //  No 'codebase'
        'description', 'Adobe Acrobat Plugin',
        'installPage',
            'http://www.adobe.com/products/acrobat/readstep2.html',
        //  No 'mimeType'
        'mimeTypes',
            TP.hc('application/pdf', 'pdf',
                'application/vnd.fdf', 'fdf',
                'application/vnd.adobe.xfdf', 'xfdf',
                'application/vnd.adobe.xdp+xml', 'xdp',
                'application/vnd.adobe.xfd+xml', 'xfd'),
        'name', 'Acrobat',
        'progIDs', TP.ac('PDF.PdfCtrl.7',
                        'PDF.PdfCtrl.6',
                        'PDF.PdfCtrl.5',
                        'PDF.PdfCtrl.4',
                        'PDF.PdfCtrl.3',
                        'AcroPDF.PDF.1')
        ));

//  ---

TP.PLUGIN_INFO.atPut(
    TP.QUICKTIME_PLUGIN,
    TP.hc('classID',
            '02BF25D5-8C17-4B23-BC80-D3488ABDDC6B',
        'codeBase',
            'http://www.apple.com/qtactivex/qtplugin.cab#version=6,0,2,0',
        'description', 'Apple Quicktime Plugin',
        'installPage',
            'http://www.apple.com/quicktime/download/',
        'mimeType',
            'video/quicktime',
        'mimeTypes',
            TP.hc('image/tiff', 'tif,tiff',
                'image/x-tiff', 'tif,tiff',
                'video/x-m4v', 'm4v',
                'image/x-macpaint', 'pntg,pnt,mac',
                'image/pict', 'pict,pic,pct',
                'image/x-pict', 'pict,pic,pct',
                'image/x-quicktime', 'qtif,qti',
                'image/x-sgi', 'sgi,rgb',
                'image/x-targa', 'targa,tga',
                'audio/3gpp', '3gp,3gpp',
                'video/3gpp2', '3g2,3gp2',
                'audio/3gpp2', '3g2,3gp2',
                'video/sd-video', 'sdv',
                'application/x-mpeg', 'amc',
                'video/mp4', 'mp4',
                'audio/mp4', 'mp4',
                'audio/x-m4a', 'm4a',
                'audio/x-m4p', 'm4p',
                'audio/x-m4b', 'm4b',
                'video/mpeg',
                    'mpeg,mpg,m1s,m1v,m1a,m75,m15,mp2,mpm,mpv,mpa',
                'audio/mpeg', 'mpeg,mpg,m1s,m1a,mp2,mpm,mpa,m2a',
                'audio/x-mpeg', 'mpeg,mpg,m1s,m1a,mp2,mpm,mpa,m2a',
                'video/3gpp', '3gp,3gpp',
                'audio/x-gsm', 'gsm',
                'audio/AMR', 'AMR',
                'audio/aac', 'aac,adts',
                'audio/x-aac', 'aac,adts',
                'audio/x-caf', 'caf',
                'video/x-mpeg',
                    'mpeg,mpg,m1s,m1v,m1a,m75,m15,mp2,mpm,mpv,mpa',
                'audio/aiff', 'aiff,aif,aifc,cdda',
                'audio/x-aiff', 'aiff,aif,aifc,cdda',
                'audio/basic', 'au,snd,ulw',
                'audio/mid', 'mid,midi,smf,kar',
                'audio/x-midi', 'mid,midi,smf,kar',
                'audio/midi', 'mid,midi,smf,kar',
                'audio/vnd.qcelp', 'qcp',
                'application/sdp', 'sdp',
                'application/x-sdp', 'sdp',
                'application/x-rtsp', 'rtsp,rts',
                'video/quicktime', 'mov,qt,mqv',
                'video/flc', 'flc,fli,cel',
                'audio/x-wav', 'wav,bwf',
                'audio/wav', 'wav,bwf'),
        'name', 'QuickTime',
        'progIDs', TP.ac('QuickTime.QuickTime',
                        'QuickTimeCheckObject.QuickTimeCheck.1')
        ));

//  ---

TP.PLUGIN_INFO.atPut(
    TP.DIVX_PLUGIN,
    TP.hc('classID',
            '67DABFBF-D0AB-41fa-9C46-CC0F21721616',
        'codeBase',
            'http://go.divx.com/plugin/DivXBrowserPlugin.cab',
        'description', 'DivX Browser Plugin',
        'installPage',
            'http://go.divx.com/plugin/download/',
        'mimeType',
            'video/divx',
        'mimeTypes',
            TP.hc('video/divx', 'dvx,divx'),
        'name', 'DivX',
        'progIDs', TP.ac('npdivx.DivXBrowserPlugin.1',
                        'npdivx.DivXBrowserPlugin')
        ));

//  ---

/* eslint-disable max-len */
TP.PLUGIN_INFO.atPut(
    TP.DIRECTOR_PLUGIN,
    TP.hc('classID',
            '166B1BCA-3F9C-11CF-8075-444553540000',
        'codeBase',
            'http://download.macromedia.com/pub/shockwave/cabs/director/sw.cab#version=8,5,1,0',
        'description', 'Macromedia Director',
        'installPage',
            'http://go.divx.com/plugin/download/',
        'mimeType',
            'application/x-director',
        //  No 'mimeTypes'
        'name', 'Director',
        'progIDs', TP.ac('SWCtl.SWCtl.11',
                        'SWCtl.SWCtl.10',
                        'SWCtl.SWCtl.9',
                        'SWCtl.SWCtl.8',
                        'SWCtl.SWCtl.7',
                        'SWCtl.SWCtl.6',
                        'SWCtl.SWCtl.5',
                        'SWCtl.SWCtl.4')
        ));
/* eslint-enable max-len */

//  ---

/* eslint-disable max-len */
TP.PLUGIN_INFO.atPut(
    TP.FLASH_PLUGIN,
    TP.hc('classID',
            'D27CDB6E-AE6D-11CF-96B8-444553540000',
        'codeBase',
            'http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0',
        'description', 'Macromedia Shockwave Flash',
        'installPage',
            'http://www.macromedia.com/go/getflashplayer',
        'mimeType',
            'application/x-shockwave-flash',
        'mimeTypes',
            TP.hc('application/x-shockwave-flash', 'swf',
                'application/futuresplash', 'spl'),
        'name', 'Flash',
        'progIDs', TP.ac('ShockwaveFlash.ShockwaveFlash.9',
                        'ShockwaveFlash.ShockwaveFlash.8.5',
                        'ShockwaveFlash.ShockwaveFlash.8',
                        'ShockwaveFlash.ShockwaveFlash.7',
                        'ShockwaveFlash.ShockwaveFlash.6',
                        'ShockwaveFlash.ShockwaveFlash.5',
                        'ShockwaveFlash.ShockwaveFlash.4')
        ));
/* eslint-enable max-len */

//  ---

TP.PLUGIN_INFO.atPut(
    TP.VLC_PLUGIN,
    TP.hc(//    No 'classID'
        //  No 'codeBase'
        'description', 'VLC multimedia plugin',
        'installPage',
            'http://www.videolan.org/doc/play-howto/en/ch02.html#id287569',
        'mimeType',
            'application/x-vlc-plugin',
        'mimeTypes',
            TP.hc('audio/mpeg', 'mp2,mp3,mpga,mpega',
                'audio/x-mpeg', 'mp2,mp3,mpga,mpega',
                'video/mpeg', 'mpg,mpeg,mpe',
                'video/x-mpeg', 'mpg,mpeg,mpe',
                'video/mpeg-system', 'mpg,mpeg,vob',
                'video/x-mpeg-system', 'mpg,mpeg,vob',
                'video/mpeg4', 'mp4,mpg4',
                'audio/mpeg4', 'mp4,mpg4',
                'application/mpeg4-iod', 'mp4,mpg4',
                'application/mpeg4-muxcodetable', 'mp4,mpg4',
                'video/x-msvideo', 'avi',
                'video/quicktime', 'mov,qt',
                'application/x-ogg', 'ogg',
                'application/x-vlc-plugin', '*',
                'video/x-ms-asf-plugin', 'asf,asx,*',
                'video/x-ms-asf', 'asf,asx,*',
                'application/x-mplayer2', 'dvx,divx,ivx,xvid,ivf,*',
                'video/x-ms-wmv', 'wmv,*',
                'application/x-google-vlc-plugin', '*'),
        'name', 'VLC'
        //  No 'progIDs'
        ));

//  ---

/* eslint-disable max-len */
TP.PLUGIN_INFO.atPut(
    TP.WINDOWS_MEDIA_PLUGIN,
    TP.hc('classID',
            '22D6f312-B0F6-11D0-94AB-0080C74C7E95', //  WMP6
        'codeBase',
            'http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,0,02,902',
        'description', 'Windows Media Player Plug-in Dynamic Link Library',
        'installPage',
            'http://www.microsoft.com/windows/windowsmedia/',
        'mimeType',
            'application/x-mplayer2',
        'mimeTypes',
            TP.hc('application/asx', '*',
                'video/x-msvideo', 'avi',
                'video/x-ms-asf-plugin', '*',
                'application/x-mplayer2', 'dvx,divx,ivx,xvid,ivf,*',
                'video/x-ms-asf', 'asf,asx,*',
                'video/x-ms-wm', 'wm,*',
                'audio/x-ms-wma', 'wma,*',
                'audio/x-ms-wax', 'wax,*',
                'video/x-ms-wmv', 'wmv,*',
                'video/x-ms-wvx', 'wvx,*'),
        'name', 'Windows Media',
        'progIDs', TP.ac('WMPlayer.OCX',
                        'MediaPlayer.MediaPlayer.1')
        ));
/* eslint-enable max-len */

//  ---

TP.PLUGIN_INFO.atPut(
    TP.JAVA_PLUGIN,
    TP.hc('classID',
            '08B0E5C0-4FCB-11CF-AAA5-00401C608500',
        //  No 'codeBase'
        'description', 'Java Virtual Machine',
        'installPage',
            'http://www.java.com/de/download/manual.jsp',
        //  No 'mimeType',
        'mimeTypes',
            TP.hc('application/x-java-applet', '',
                'application/x-java-bean', '',
                'application/x-java-vm', ''),
        'name', 'Java'
        //  No 'progIDs'
        ));

//  ---

TP.PLUGIN_INFO.atPut(
    TP.REALPLAYER_PLUGIN,
    TP.hc('classID',
            'CFCDAA03-8BE4-11cf-B84B-0020AFBBCCFA',
        //  No 'codeBase'
        'description', 'Realplayer Version Plugin',
        'installPage',
            'http://www.real.com/freeplayer/?rppr=rnwk',
        'mimeType',
            'audio/x-pn-realaudio-plugin',
        'mimeTypes',
            TP.hc('audio/x-pn-realaudio-plugin', 'rpm',
                'application/vnd.rn-realplayer-javascript', 'rpj'),
        'name', 'Realplayer Plugin',
        'progIDs', TP.ac('rmocx.RealPlayer G2 Control',
                        'rmocx.RealPlayer G2 Control.1',
                        'RealPlayer.RealPlayer(tm) ActiveX Control (32-bit)',
                        'RealVideo.RealVideo(tm) ActiveX Control (32-bit)',
                        'RealPlayer')
        ));

//  ---

TP.PLUGIN_INFO.atPut(
    TP.SILVERLIGHT_PLUGIN,
    TP.hc('classID',
            '32C73088-76AE-40F7-AC40-81F62CB2C1DA',
        //  No 'codeBase'
        'description', 'Silverlight Plugin',
        'installPage',
            '',
        'mimeType',
            'application/x-silverlight',
        'mimeTypes',
            TP.hc('application/manifest', 'manifest',
                'application/xaml+xml', 'xaml',
                'application/x-msdownload', 'dll',
                'application/x-ms-xbap', 'xbap',
                'application/octet-stream', 'deploy',
                'application/vnd.ms-xpsdocument', 'xps'
                ),
        'name', 'Silverlight',
        'progIDs', TP.ac('AgControl.AgControl')
        ));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
