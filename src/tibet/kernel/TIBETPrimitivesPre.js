//  ========================================================================
/*
NAME:   TIBETPrimitivesPre.js
AUTH:   Scott Shattuck (ss), William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

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

/* global Window:false,
          $STATUS:true
*/

//  ------------------------------------------------------------------------
//  OBJECT IDENTITY - PART I
//  ------------------------------------------------------------------------

/*
To support a variety of functionality, TIBET requires that objects have a
unique identity which can be used to distinguish them from other objects.

TIBET also allows these objects to be optionally registered so they can be
accessed via their IDs. (See registerObject() for more info). Certain error
logging can optionally "auto-register" objects which report errors to assist
with debugging, but typically objects aren't registered to avoid GC issues.
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

//  -----------------------------------------------------------------------
//  Preliminary bootstrap methods required by TP.defineSlot() and
//  TP.defineMethod()
//  -----------------------------------------------------------------------

//  Needed during boot
TP.getID = function () {return TP[TP.ID];};
TP.sys.getID = function () {return TP.sys[TP.ID];};
TP.boot.getID = function () {return TP.boot[TP.ID];};

//  Needed during boot
TP.getName = function () {return TP[TP.NAME];};
TP.sys.getName = function () {return TP.sys[TP.NAME];};
TP.boot.getName = function () {return TP.boot[TP.NAME];};

//  ------------------------------------------------------------------------

TP.isCallable = function(anObj) {

    /**
     * @name isCallable
     * @synopsis Returns true if the object provided is a function which is not
     *     marked as a DNU. No owner or track testing is performed which is what
     *     disinguishes this call from TP.isMethod(). Methods, unlike more
     *     generic "callables", have an owner and track.
     * @param {Object} anObj The Object to test.
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
     * @todo
     */

    //  NB: Do not replace this logic - it has been optimized to primitives
    //  because this method gets called so much.
    return (anObj && anObj.apply && anObj.$$dnu !== true);
};

//  Manual setup
TP.isCallable[TP.NAME] = 'isCallable';
TP.isCallable[TP.OWNER] = TP;
TP.isCallable[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.isCallable[TP.DISPLAY] = 'TP.isCallable';
TP.isCallable[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];

//  ------------------------------------------------------------------------

TP.canInvoke = function(anObj, anInterface) {

    /**
     * @name canInvoke
     * @synopsis Returns true if the object provided implements the method or
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
     * @todo
     */

    var i,
        len;

    if (TP.notValid(anObj)) {
        return false;
    }

    //  NB: Do not replace this logic - it has been optimized to primitives
    //  because this method (with a String parameter) gets called so much.
    if (anInterface.charAt !== undefined) {
        return (anObj[anInterface] &&
                anObj[anInterface].apply &&
                anObj[anInterface].$$dnu !== true);
    } else if (TP.isArray(anInterface)) {
        len = anInterface.length;
        for (i = 0; i < len; i++) {
            if (!TP.isCallable(anObj[anInterface[i]])) {
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

//  ------------------------------------------------------------------------

TP.isValid = function(aValue) {

    /**
     * @name isValid
     * @synopsis Return true if the receiver is not undefined and not null,
     *     meaning it has some value (empty/false or otherwise).
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is valid:
     *     <code>
     *          if (TP.isValid(anObj)) { TP.alert('its valid'); };
     *     </code>
     * @returns {Boolean} Whether or not the value is not null *and* is not
     *     undefined.
     * @todo
     */

    return aValue !== undefined && aValue !== null;
};

//  Manual setup
TP.isValid[TP.NAME] = 'isValid';
TP.isValid[TP.OWNER] = TP;
TP.isValid[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.isValid[TP.DISPLAY] = 'TP.isValid';
TP.isValid[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];

//  ------------------------------------------------------------------------

TP.notValid = function(aValue) {

    /**
     * @name notValid
     * @synopsis Returns true if the value provided is either null or undefined.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is not valid:
     *     <code>
     *          if (TP.notValid(anObj)) { TP.alert('its not valid'); };
     *     </code>
     * @returns {Boolean} Whether or not the value is not valid (that is, either
     *     null or undefined).
     * @todo
     */

    return aValue === undefined || aValue === null;
};

//  Manual setup
TP.notValid[TP.NAME] = 'notValid';
TP.notValid[TP.OWNER] = TP;
TP.notValid[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.notValid[TP.DISPLAY] = 'TP.notValid';
TP.notValid[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];

//  ------------------------------------------------------------------------

TP.ifInvalid = function(aSuspectValue, aDefaultValue) {

    /**
     * @name ifInvalid
     * @synopsis Returns either aSuspectValue or aDefaultValue based on the
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
     * @todo
     */

    return TP.notValid(aSuspectValue) ? aDefaultValue : aSuspectValue;
};

//  Manual setup
TP.ifInvalid[TP.NAME] = 'ifInvalid';
TP.ifInvalid[TP.OWNER] = TP;
TP.ifInvalid[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.ifInvalid[TP.DISPLAY] = 'TP.ifInvalid';
TP.ifInvalid[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];

//  ------------------------------------------------------------------------

TP.isDNU = function(anObj) {

    /**
     * @name isDNU
     * @synopsis Returns true if the object provided is a TIBET DNU
     *     (DoesNotUnderstand) function. These functions are installed by TIBET
     *     to provide support for delegation, inferencing, and other method
     *     resolution strategies.
     * @description TIBET's support for "missing" methods is driven largely by
     *     the DNU concept, which provides the hooks found in Ruby's missing
     *     methods, Smalltalk/Self's "doesNotUnderstand", etc.
     * @param {Object} anObj The Object to test.
     * @returns {Boolean} Whether or not the supplied object is a DNU.
     */

    //  if the dnu slot is defined we can return its value, otherwise the
    //  proper response is false
    return TP.isFunction(anObj) && anObj.$$dnu === true;
};

//  Manual setup
TP.isDNU[TP.NAME] = 'isDNU';
TP.isDNU[TP.OWNER] = TP;
TP.isDNU[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.isDNU[TP.DISPLAY] = 'TP.isDNU';
TP.isDNU[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];

// TODO: Remove after cleansing old name.
TP.$$isDNU = TP.isDNU;

//  ------------------------------------------------------------------------

TP.isFunction = function(anObj) {

    /**
     * @name isFunction
     * @synopsis Returns true if the object provided is a function instance. No
     *     attempt is made to determine whether that function is a DNU, or
     *     method (an owned function). Use TP.isCallable(), or TP.isMethod() to
     *     test for those cases.
     * @description Perhaps the most glaring example of why we've encapsulated
     *     so heavily in TIBET. Most libraries use typeof == 'function' and call
     *     it a day. Unfortunately many of IE's DOM-associated functions don't
     *     return 'function' in response to a typeof() call and Mozilla is
     *     confused about RegExp objects and typeof (it returns "function"). So
     *     there are at least two cases where typeof() will lie to you with
     *     Function checks. Dates have similar issues, as do Numbers. Our
     *     advice? Don't use typeof() unless you're certain of what you're
     *     really testing against and you're only interested in knowing what the
     *     primitive type (in ECMA-standard terms) of the object is.
     * @param {Object} anObj The Object to test.
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
     * @todo
     */

    return TP.ObjectProto.toString.call(anObj) === '[object Function]';
};

//  Manual setup
TP.isFunction[TP.NAME] = 'isFunction';
TP.isFunction[TP.OWNER] = TP;
TP.isFunction[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.isFunction[TP.DISPLAY] = 'TP.isFunction';
TP.isFunction[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];

//  ------------------------------------------------------------------------

TP.isString = function(anObj) {

    /**
     * @name isString
     * @synopsis Returns true if the object provided is a string primitive or a
     *     String object. This method also allows us to play a few tricks with
     *     "mutable strings" or what a Java developer would think of as a
     *     "string buffer" by returning true if the object can behave like a
     *     string in terms of API. Of course, the caveat here is don't use '+'
     *     to concatenate strings, use TP.join() or one of the collection
     *     methods instead since they're faster and can deal with strings of
     *     different types...but you knew all that :).
     * @param {Object} anObj The Object to test.
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
     * @todo
     */

    return TP.ObjectProto.toString.call(anObj) === '[object String]';
};

//  Manual setup
TP.isString[TP.NAME] = 'isString';
TP.isString[TP.OWNER] = TP;
TP.isString[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.isString[TP.DISPLAY] = 'TP.isString';
TP.isString[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];

//  ------------------------------------------------------------------------

TP.owns = function(anObject, aName) {

    /**
     * @name owns
     * @synopsis Returns true if the object hasOwnProperty() aName. This wrapper
     *     exists because numerous objects which should respond to that method
     *     don't, and will throw errors if you try to use it.
     * @param {Object} anObject The object to test.
     * @param {String} aName The slot name to check.
     * @returns {Boolean} True if the object owns the slot.
     * @todo
     */

    if (anObject === null || anObject === undefined) {
        return false;
    }

    if (TP.canInvoke(anObject, 'hasOwnProperty')) {
        try {
            return anObject.hasOwnProperty(aName) && !TP.isDNU(anObject[aName]);
        } catch (e) {
            // Fall through to common test below.
        }
    } else {
        //  Couldn't invoke 'hasOwnProperty' on the object... let's see if we
        //  can do it the indirect way.
        try {
            return TP.FunctionProto.hasOwnProperty.call(anObject, aName);
        } catch (e) {
            // Fall through to common test below.
        }
    }

    try {
        //  MOZ has a few that like to barf on this call. Unfortunately,
        //  false isn't always the right answer :(
        return anObject[aName] !== anObject.constructor.prototype[aName];
    } catch (e) {
        return false;
    }
};

//  Manual setup
TP.owns[TP.NAME] = 'owns';
TP.owns[TP.OWNER] = TP;
TP.owns[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.owns[TP.DISPLAY] = 'TP.owns';
TP.owns[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];

//  ------------------------------------------------------------------------

TP.objectGetLoadNode = function(anObject) {

    /**
     * @name objectGetLoadNode
     * @synopsis Returns the script node responsible for loading the object.
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

//  ------------------------------------------------------------------------

TP.objectSetLoadNode = function(anObject, aNode) {

    /**
     * @name objectSetLoadNode
     * @synopsis Sets the script node responsible for loading the object.
     * @param {Object} anObject The object to update.
     * @param {Node} aNode A script node, presumably the one responsible for
     *     loading the object.
     * @returns {Object} The updated object.
     * @todo
     */

    anObject[TP.LOAD_NODE] = aNode;

    return anObject;
};

TP.objectSetLoadNode[TP.NAME] = 'objectSetLoadNode';
TP.objectSetLoadNode[TP.OWNER] = TP;
TP.objectSetLoadNode[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.objectSetLoadNode[TP.DISPLAY] = 'TP.objectSetLoadNode';
TP.objectSetLoadNode[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];

//  ------------------------------------------------------------------------

TP.FunctionProto.asMethod = function(owner, name, track, display) {

    /**
     * @name asMethod
     * @synopsis Returns the receiver as a method. In most cases this simply
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
     * @param {String} name The slot name.
     * @param {String} track The slot track (type, inst, local, etc).
     * @param {String} display The slot display name. Defaults to the
     *     owner.track.name triplet.
     * @returns {Function} A properly configured 'method'.
     * @para Object The object receiving the slot.
     * @todo
     */

    var displayName;

    // Build a display name that should work for most cases.
    if (!display) {
        // If the track is local we don't show it, so Obj.method instead of
        // Obj.Local.method, but Obj.Inst.method, or Obj.Type.method as needed.
        if (track.indexOf(TP.LOCAL_TRACK) === TP.NOT_FOUND) {
            try {
            displayName = owner.getID() + '.' + track + '.' + name;
            } catch (e) {
                console.log('name: ' + name + ' track: ' + track + ' stack: ' + e.stack);
            }
        } else {
            displayName = owner.getID() + '.' + name;
        }
    } else {
        displayName = display;
    }

    // Attach reflection metadata.
    this[TP.NAME] = name;
    this[TP.OWNER] = owner;
    this[TP.TRACK] = track;
    this[TP.DISPLAY] = displayName;

    // Attach where we were loaded from (the script file node).
    TP.objectSetLoadNode(this, TP.boot[TP.LOAD_NODE]);

    return this;
};

//  Manual setup
TP.FunctionProto.asMethod[TP.NAME] = 'asMethod';
TP.FunctionProto.asMethod[TP.OWNER] = Function;
TP.FunctionProto.asMethod[TP.TRACK] = TP.INST_TRACK;
TP.FunctionProto.asMethod[TP.DISPLAY] = 'Function.Inst.asMethod';
TP.FunctionProto.asMethod[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];

//  ------------------------------------------------------------------------

TP.StringProto.strip = function(aRegExp) {

    /**
     * @name strip
     * @synopsis Returns a new string with the contents of the receiver after
     *     having removed any characters matching the RegExp passed in.
     * @param {RegExp} aRegexp The pattern to strip from receiver.
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

//  ------------------------------------------------------------------------
//  OBJECT IDENTITY - PART I
//  ------------------------------------------------------------------------

//  allow for custom OID generation routines to be installed prior to
//  this. we install this via a test so it's easy to define your own
//  routine in the tibet.xml file if you like.
if (!TP.sys.constructOID) {
    TP.sys.constructOID = function(aPrefix) {

        /**
         * @name constructOID
         * @synopsis Generates an OID value, optionally prefixing it with
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
         * @todo
         */

        //  NOTE that starting with anything other than a number allows
        //  these to work as ID[REF] values when no prefix is provided
        return ((!!aPrefix) ? aPrefix + TP.OID_PREFIX : TP.OID_PREFIX) +
                Math.random().toString(32).replace('0.',
                        Date.now().toString(32));
    };
}

//  Manual setup
TP.sys.constructOID[TP.NAME] = 'constructOID';
TP.sys.constructOID[TP.OWNER] = TP.sys;
TP.sys.constructOID[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.sys.constructOID[TP.DISPLAY] = 'TP.sys.constructOID';
TP.sys.constructOID[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];

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
     * @name getFunctionName
     * @synopsis Returns the name of the supplied function or the value
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

//  ------------------------------------------------------------------------

TP.FunctionProto.$getName = function() {

    /**
     * @name $getName
     * @synopsis Returns the name of the receiving function or its ID if the
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
TP.ArrayProto.at = function(anIndex, varargs) {

    /**
     * @name at
     * @synopsis Returns the value found at an index. Provides polymorphic
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
     * @param {arguments} varargs A variable list of 0 to N additional indexes
     *     which descend into nested array children.
     * @returns {Object} The value at the index.
     * @addon Array
     * @todo
     */

    return this[anIndex];
};

//  ------------------------------------------------------------------------

//  stub for early calls, replaced later in kernel

//  Add it directly to TP.ArrayProto - we don't worry about capturing metadata
//  about this method as we'll be replacing it very soon with the "real"
//  implementation anyway.
TP.ArrayProto.atPut = function(anIndex, varargs, aValue) {

    /**
     * @name atPut
     * @synopsis Sets the value found at anIndex. Provides polymorphic access to
     *     updating indexed collection data, which isn't possible with literal
     *     bracket syntax. This version does not provide change notification.
     *     NOTE that this initial version does not support vararg values or
     *     negative indices.
     * @description To support multi-dimensional access this method will allow
     *     more than one index parameter as in arr.atPut(1, 2, 'foo') so that,
     *     in reality, aValue is defined by the last argument and is placed in
     *     the location found by traversing to the last index (arguments.length
     *     - 2) provided.
     * @param {Number} anIndex The index to set/update.
     * @param {arguments} varargs A variable list of 0 to N additional indexes
     *     which descend into nested array children.
     * @param {Object} aValue The object to place at anIndex. NOTE that the
     *     position of this attribute may actually vary if multiple indexes are
     *     supplied.
     * @returns {Array} The receiver.
     * @addon Array
     * @todo
     */

    this[anIndex] = varargs;

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
    this.$$hash = new Object();
    /* jshint +W010 */
    this[TP.ID] = TP.sys.constructOID();

    //  no signaling until we're observed
    this.$suspended = true;

    //  populate the instance based on our argument list. we try to mirror
    //  the basic semantics of the full TP.lang.Hash here, but that object
    //  has a number of additional input formats
    if (arguments.length === 1) {
        obj = arguments[0];
        for (i in obj)          //  one of the few places we do this
        {
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
    //  isCollection
    //  ---

    this.$$isCollection = function() {

        /**
         * @name $$isCollection
         * @synopsis Returns true if the receiver is a collection instance. True
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
         * @name $$isMemberOf
         * @synopsis Returns true if the receiver is a direct instance of the
         *     type provided.
         * @param {TP.lang.RootObject|String} aType A Type object, or type name.
         * @returns {Boolean} True if the receiver is an instance of the type or
         *     a subtype.
         */

        return ((aType === 'TP.lang.Hash') || (aType === TP.lang.Hash));
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
         * @name as
         * @synopsis Returns the receiver as an instance of aType. This
         *     implementation is capable only of converting into a TP.lang.Hash
         *     and potentially converting that hash into something else. The
         *     more powerful TP.lang.Hash type may have more efficient or
         *     comprehensive conversion routines.
         * @param {TP.lang.RootObject|String} typeOrFormat The type or format
         *     object or String desired.
         * @returns {Object} An instance of aType.
         */

        if ((aType === 'TP.lang.Hash') || (aType === TP.lang.Hash)) {
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
         * @name asString
         * @synopsis Returns a usable string representation of the hash. The
         *     standard form here uses TIBET syntax, meaning that a hash with a
         *     key of 'a' and a value of 1 appears in string form as
         *     TP.hc('a',1).
         * @returns {String} The receiver in string form.
         */

        var keys,
            len,
            i,
            arr;

        arr = TP.ac();
        arr.push('TP.hc(');

        keys = Object.keys(this.$$hash);
        len = keys.length;

        for (i = 0; i < len; i++) {
            arr.push(TP.src(keys[i]), ', ', TP.src(this.$$hash[keys[i]]));
            if ((i + 1) < len) {
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
         * @name asJSONSource
         * @synopsis Returns a usable JSON representation of the hash, meaning
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
         * @name asSource
         * @synopsis Returns a usable source representation of the hash. The
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
         * @name asTP_lang_Hash
         * @synopsis Converts the receiver to a full TP.lang.Hash type. The
         *     internal hash data structures are migrated to the new instance so
         *     on completion of this method you should release any references
         *     you may have to the older primitive hash instance.
         * @returns {TP.lang.Hash} The full TP.lang.Hash constructed from the
         *     receiver.
         */

        var newHash;

        newHash = TP.lang.Hash.construct();

        newHash.$set('$$hash', this.$$hash);

        return newHash;
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
         * @name at
         * @synopsis Returns the value at the key/index provided.
         * @param {Object} aKey The index to use for locating the value. Note
         *     that this is usually a string, but could be any object supporting
         *     a valid toString method. This method is designed to protect
         *     against returning any of the receiver's properties/methods.
         * @returns {Object} The item at the index provided or undefined.
         */

        if (TP.owns(this.$$hash, aKey)) {
            return this.$$hash[aKey];
        }

        return;
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
         * @name atPut
         * @synopsis Sets the value at aKey to aValue.
         * @param {Object} aKey The key/index to put aValue into.
         * @param {Object} aValue The value to register under aKey.
         * @returns {TP.PHash} The receiver.
         * @todo
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
         * @name $get
         * @synopsis Returns the property with the given name, adjusted for
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
         * @name get
         * @synopsis Returns the value of attributeName from the receiver. NOTE
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
         * @name getName
         * @synopsis Returns the TP.NAME property of the receiver.
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
         * @name getItems
         * @synopsis Returns the items [key,value] of the receiver.
         * @returns {Array} An array containing the receiver's items.
         * @todo
         */

        var arr,
            keys,
            len,
            i;

        arr = TP.ac();

        keys = Object.keys(this.$$hash);
        len = keys.length;

        for (i = 0; i < len; i++) {
            arr.push(keys[i], this.$$hash[keys[i]]);
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
         * @name getKeys
         * @synopsis Returns the unique keys of the receiver. NOTE for
         *     consistency with other getKeys() calls you should treat the
         *     returned array as a read-only object.
         * @returns {Array} An array containing the receiver's keys.
         * @todo
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
         * @name getParameters
         * @synopsis Returns the receiver's parameters. For a TP.lang.Hash this
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
         * @name getSize
         * @synopsis Returns the size of the receiver, which is the count of the
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
         * @name getTypeName
         * @synopsis Returns the type name of the receiver.
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
         * @name getValues
         * @synopsis Returns an array containing the values of the receiver.
         * @returns {Array} An array containing the receiver's values.
         * @todo
         */

        var arr,
            keys,
            len,
            i;

        arr = TP.ac();

        keys = Object.keys(this.$$hash);
        len = keys.length;

        for (i = 0; i < len; i++) {
            arr.push(this.$$hash[keys[i]]);
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
         * @name hasKey
         * @synopsis Returns true if the receiver has a defined value for the
         *     key provided.
         * @param {String} aKey The key to test for.
         * @returns {Boolean} True if the key is defined.
         */

        return TP.owns(Object.keys(this.$$hash), aKey);
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
         * @name perform
         * @synopsis Performs the function with each item of the receiver.
         * @description Perform can be used as an alternative to constructing
         *     for loops to iterate over a collection.
         * @param {Function} aFunction A function which performs some action
         *     with each item.
         * @returns {Object} The receiver.
         */

        var i,
            keys,
            len,
            item;

        item = TP.ac();

        keys = Object.keys(this.$$hash);
        len = keys.length;

        for (i = 0; i < len; i++) {
            //  update iteration edge flags so our function can tell when
            //  its at the start/end of the overall collection
            aFunction.$first = (i === 0) ? true : false;
            aFunction.$last = (i === len - 1) ? true : false;

            item[0] = keys[i];
            item[1] = this.$$hash[keys[i]];

            if (aFunction(item, i) === TP.BREAK) {
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
         * @name removeKey
         * @synopsis Removes the key specified (and its related value).
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
         * @name $set
         * @synopsis Sets the property with the given name, adjusted for
         *     standard TIBET attribute prefixing rules as needed.
         * @param {String} attributeName The attribute name to set.
         * @param {Object} attributeValue The value to set.
         * @returns {Object} The value of the named property.
         * @todo
         */

        var val,
            name;

        if (TP.isDefined(val = this[attributeName])) {
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
                        TP.LOG, arguments) : 0;
        }

        try {
            this[name] = attributeValue;
        } catch (e) {
            return this.raise(
                    'TP.sig.InvalidOperation',
                    arguments,
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
         * @name set
         * @synopsis Sets the value of the named attribute to the value
         *     provided. NOTE that this operates on the hash instance's
         *     properties, not its content. Use atPut for content.
         * @param {String} attributeName The attribute name to set.
         * @param {Object} attributeValue The value to set.
         * @returns {TP.lang.Hash} The receiver.
         * @todo
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
     * @name hc
     * @synopsis Constructs a simple hash (i.e. "dictionary"), which can be used
     *     to contain key/value pairs. This primitive version is limited to
     *     simple key, value, key, value vararg lists.
     * @param {arguments} varargs A variable list of 0 to N elements to place in
     *     the hash.
     * @example Construct a TP.lang.Hash:
     *     <code>
     *          newHash = TP.hc('lname', 'Smith');
     *          <samp>{"lname":"Smith"}</samp>
     *     </code>
     * @returns {TP.lang.Hash} A new instance.
     * @todo
     */

    var dict,
        len,
        i;

    dict = new TP.PHash();
    len = arguments.length;

    for (i = 0; i < len; i = i + 2) {
		if (TP.notValid(arguments[i])) {
			return this.raise('TP.sig.InvalidKey', arguments);
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
    'writable': false,
    'configurable': false
};

TP.DEFAULT_DESCRIPTOR = {};

TP.HIDDEN_DESCRIPTOR = {
    'enumerable': false,
    'configurable': false
};

TP.HIDDEN_CONSTANT_DESCRIPTOR = {
    'enumerable': false,
    'writable': false,
    'configurable': false
};

//  ------------------------------------------------------------------------

//  build the initial metadata and information containers
(function() {

    TP.sys.$$meta_types = TP.hc();
    TP.sys.$$meta_attributes = TP.hc();
    TP.sys.$$meta_methods = TP.hc();
    TP.sys.$$meta_owners = TP.hc();

    TP.sys.$$metadata = TP.hc('types', TP.sys.$$meta_types,
                                'attributes', TP.sys.$$meta_attributes,
                                'methods', TP.sys.$$meta_methods,
                                'owners', TP.sys.$$meta_owners);

 }());

//  ------------------------------------------------------------------------

TP.sys.addMetadata = function(targetType, anItem, itemClass, itemTrack) {

    /**
     * @name addMetadata
     * @synopsis Stores metadata about an object, typically a type or method,
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
     * @todo
     */

    var iname,

        node,
        path,

        tname,
        gname,
        sname,

        owners;

    //  all operations will key off item name, so if that's not available we
    //  can't proceed
    if (anItem.getName && !TP.isString(iname = anItem.getName())) {
        return;
    }

    if (TP.notValid(iname = anItem[TP.NAME])) {
        return;
    }

    //  some things (most notably 'traited' methods) won't have a load node.
    if ((node = TP.boot[TP.LOAD_NODE])) {
        path = node.src || node.source || '';
        path = TP.boot.$uriInTIBETFormat(path);
    } else {
        path = TP.NO_LOAD_PATH;
    }

    switch (itemClass) {
        case TP.SUBTYPE:

            //  don't overlay information we've already collected
            if (TP.notValid(TP.sys.$$meta_types.at(iname))) {
                sname = anItem.getSupertypeName();

                TP.sys.$$meta_types.atPut(
                        iname,
                        {'typeObj': anItem, 'sname': sname, 'path': path});
            }

            break;

        case TP.METHOD:

            tname = targetType.getName();
            gname = tname + '_' + itemTrack + '_' + iname;

            if (TP.notValid(TP.sys.$$meta_methods.at(gname))) {
                TP.sys.$$meta_methods.atPut(
                        gname,
                        {'methodObj': anItem, 'path': path});

                //  owners are keyed by name and point to a vertical-bar
                //  separated list of one or more type names. these are
                //  tracked for all types so the inferencer can do type
                //  conversion checks regardless of whether the type is part
                //  of the kernel or not
                owners = TP.sys.$$meta_owners.at(iname);
                if (!Array.isArray(owners)) {
                    owners = [];
                    TP.sys.$$meta_owners.atPut(iname, owners);
                }

                owners.push(tname);
            }

            break;

        case TP.ATTRIBUTE:

            tname = targetType.getName();
            gname = tname + '_' + itemTrack + '_' + iname;

            if (TP.notValid(TP.sys.$$meta_attributes.at(gname))) {
                TP.sys.$$meta_attributes.atPut(
                        gname,
                        {'descriptorObj': anItem, 'path': path});
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
TP.sys.addMetadata[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.sys.addMetadata[TP.DISPLAY] = 'TP.sys.addMetadata';
TP.sys.addMetadata[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];

//  -----------------------------------------------------------------------
//  SLOT AND METHOD DEFINITION
//  -----------------------------------------------------------------------

TP.defineSlot = function(target, name, value, type, track, desc) {

    /**
     * @name defineSlot
     * @synopsis Defines a slot, which may be an attribute, method, etc.
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
     * @todo
     */

    var constant,
        hidden,
        fixed;

    //  If we were handed a descriptor, then try to use ECMA5's defineProperty()
    //  call
    if (TP.isValid(desc)) {
        constant = desc.writable === false;
        hidden = desc.enumerable === false;
        fixed = desc.configurable === false;

        if (constant && value !== undefined) {
            //  We send in a different object to make sure that if 'get' or
            //  'set' was defined on the supplied descriptor that it won't be
            //  forwarded. Note here that, since this slot is being configured
            //  as a 'constant', a value should've been supplied and we supply
            //  that to the defineProperty() call.
            Object.defineProperty(
                    target,
                    name,
                    {
                        writable: !constant,
                        enumerable: !hidden,
                        configurable: !fixed,
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
                        writable: !constant,
                        enumerable: !hidden,
                        configurable: !fixed
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

//  ------------------------------------------------------------------------

TP.defineMethod = function(target, name, value, track, desc, display,
                           owner) {

    /**
     * @name defineMethod
     * @synopsis Defines a method, tracking all necessary metadata.
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
     * @todo
     */

    var own,
        trk,
        method,
        disp;

    if (!TP.isCallable(value) || !TP.isCallable(value.asMethod)) {
        TP.ifError() ?
            TP.error('Invalid method body for ' +
                        'TP.defineMethod: ' + name,
                        TP.LOG, arguments) : 0;
        return;
    }

    own = TP.ifInvalid(owner, target);
    trk = TP.ifInvalid(track, TP.LOCAL_TRACK);

    //  Ensure metadata is attached along with owner/track etc.
    value.asMethod(own, name, trk, display);

    //  If the body of the function has a reference to methods that need
    //  'callee', then we have to wrap it into a wrapping function so that we
    //  can capture callee (arguments.callee is not valid in ECMA E5 strict
    //  mode). What a pain!
    if (TP.NEEDS_CALLEE.test(value.toString()) && !value.noCalleePatch) {
        method = function () {
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

    TP.defineSlot(target, name, method, TP.METHOD, trk,
            (desc && desc.$$isPDC ? desc : TP.DEFAULT_DESCRIPTOR));

    //  we don't wrap 'self' level methods
    if (method[TP.OWNER] === self) {
        if (TP.notValid(TP.objectGetLoadNode(method))) {
            //  track the node we're loading from for reference
            TP.objectSetLoadNode(method, TP.boot[TP.LOAD_NODE]);
        }

        return method;
    }

    if (TP.notValid(TP.objectGetLoadNode(method))) {
        //  track the node we're loading from for reference
        TP.objectSetLoadNode(method, TP.boot[TP.LOAD_NODE]);
    }

    /*
    //  allow change logging to occur at the base level. note that this only
    //  works if done after owner, track, etc. are set.
    TP.ifTrace(TP.sys.shouldLogCodeChanges()) ?
        TP.sys.logCodeChange(method.asSource(), TP.TRACE, arguments): 0;
    */

    TP.sys.addMetadata(own, value, TP.METHOD, trk);

    return method;
};

//  Manual method registration.
TP.defineMethod[TP.NAME] = 'defineMethod';
TP.defineMethod[TP.OWNER] = TP;
TP.defineMethod[TP.TRACK] = TP.PRIMITIVE_TRACK;
TP.defineMethod[TP.DISPLAY] = 'TP.defineMethod';
TP.defineMethod[TP.LOAD_NODE] = TP.boot[TP.LOAD_NODE];

//  ------------------------------------------------------------------------

//  Add metadata for the 'bootstrap' methods that got us this far.

//  Defined in TIBETGlobal.js

TP.sys.addMetadata(TP, TP.constructOrphanObject, TP.METHOD, TP.PRIMITIVE_TRACK);
TP.sys.addMetadata(TP, TP.defineNamespace, TP.METHOD, TP.PRIMITIVE_TRACK);
TP.sys.addMetadata(TP, TP.isNamespace, TP.METHOD, TP.PRIMITIVE_TRACK);
TP.sys.addMetadata(TP.sys, TP.sys.getGlobals, TP.METHOD, TP.PRIMITIVE_TRACK);

//  Defined in this file

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
TP.sys.addMetadata(TP.sys, TP.sys.constructOID, TP.METHOD, TP.PRIMITIVE_TRACK);
TP.sys.addMetadata(TP, TP.getFunctionName, TP.METHOD, TP.PRIMITIVE_TRACK);
TP.sys.addMetadata(Function, TP.FunctionProto.$getName,
                    TP.METHOD, TP.INST_TRACK);
TP.sys.addMetadata(TP.sys, TP.sys.addMetadata, TP.METHOD, TP.PRIMITIVE_TRACK);

//  ------------------------------------------------------------------------

TP.defineMethod(TP, 'definePrimitive',
function(name, bodyOrConditionals, desc, display, owner) {

    /**
     * @name definePrimitive
     * @synopsis Adds the method supplied as a 'primitive' to the 'TP' object
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
     * @todo
     */

    var test,
        key,
        method;

    if (!bodyOrConditionals) {
        TP.ifError() ?
            TP.error('Invalid method body or conditionals for ' +
                        'TP.definePrimitive: ' + name,
                        TP.LOG, arguments) : 0;
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
            if ((typeof test === 'string') && TP.sys.hasFeatureTest(test)) {
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

    return TP.defineMethod(
            TP, name, method, TP.PRIMITIVE_TRACK, desc, display, owner);

}, TP.PRIMITIVE_TRACK, null, 'TP.definePrimitive');

//  ------------------------------------------------------------------------
//  Object Testing
//  ------------------------------------------------------------------------

TP.definePrimitive('isDefined',
function(aValue) {

    /**
     * @name isDefined
     * @synopsis Returns false if the value passed in is undefined as opposed to
     *     null or valid. In other words, aValue is 'defined' if its got a
     *     value...even if that value is 'null'.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is defined:
     *     <code>
     *          if (TP.isDefined(anObj)) { TP.alert('its defined'); };
     *     </code>
     * @returns {Boolean} Whether or not the value is defined.
     * @todo
     */

    return aValue !== undefined;
}, false, 'TP.isDefined');

//  ------------------------------------------------------------------------

TP.definePrimitive('isNaN',
function(aValue) {

    /**
     * @name isNaN
     * @synopsis Returns true if the value provided is NaN.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is NaN:
     *     <code>
     *          if (TP.isNaN(anObj)) { TP.alert('its NaN'); };
     *     </code>
     * @returns {Boolean} Whether or not the value is NaN.
     * @todo
     */

    try {
        if (TP.isValid(aValue) &&
            isNaN(aValue) &&
            aValue.constructor === Number) {
                return true;
        }
    } catch (e) {
        //  This catch purposely left blank - we'll return false below
    }

    return false;
}, false, 'TP.isNaN');

//  ------------------------------------------------------------------------

TP.definePrimitive('isNull',
function(aValue) {

    /**
     * @name isNull
     * @synopsis Returns true if aValue is truly 'null' (ie. === null) rather
     *     than undefined or a non-null value.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is null:
     *     <code>
     *          if (TP.isNull(anObj)) { TP.alert('its null'); };
     *     </code>
     * @returns {Boolean} Whether or not the value is null.
     * @todo
     */

    return aValue === null;
}, false, 'TP.isNull');

//  ------------------------------------------------------------------------

TP.definePrimitive('notDefined',
function(aValue) {

    /**
     * @name notDefined
     * @synopsis Returns true if the value provided is undefined.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is not defined:
     *     <code>
     *          if (TP.notDefined(anObj)) { TP.alert('its not defined'); };
     *     </code>
     * @returns {Boolean} Whether or not the value is undefined.
     * @todo
     */

    return aValue === undefined;
}, false, 'TP.notDefined');

//  ------------------------------------------------------------------------

TP.definePrimitive('notNaN',
function(aValue) {

    /**
     * @name notNaN
     * @synopsis Returns true if the value provided is not NaN.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is not NaN:
     *     <code>
     *          if (TP.notNaN(anObj)) { TP.alert('its not NaN'); };
     *     </code>
     * @returns {Boolean} Whether or not the value is not NaN.
     * @todo
     */

    return !TP.isNaN(aValue);
}, false, 'TP.notNaN');

//  ------------------------------------------------------------------------

TP.definePrimitive('notNull',
function(aValue) {

    /**
     * @name notNull
     * @synopsis Returns true if the value provided is not null. Be aware, the
     *     value could be undefined and this method will return true. In cases
     *     where you want to test both you should use the *Valid variations.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is not null:
     *     <code>
     *          if (TP.notNull(anObj)) { TP.alert('its not null'); };
     *     </code>
     * @returns {Boolean} Whether or not the value is not null.
     * @todo
     */

    return aValue !== null;
}, false, 'TP.notNull');

//  ------------------------------------------------------------------------
//  Logging Basics
//  ------------------------------------------------------------------------

TP.defineMethod(TP.sys, 'getLogLevel',
function() {

    /**
     * @name getLogLevel
     * @synopsis Returns the numerical level at which log() and its variants
     *     will filter output going to the error and activity logs.
     * @example Get TIBET's current 'log level':
     *     <code>
     *          TP.sys.getLogLevel();
     *          <samp>0</samp>
     *     </code>
     * @returns {Number} The current TIBET log level.
     * @todo
     */

    //  Make sure to return a Number
    return parseInt(TP.sys.cfg('log.level'), 10);
}, TP.PRIMITIVE_TRACK, null, 'TP.sys.getLogLevel');

//  ------------------------------------------------------------------------
//  Value-Based Branching
//  ------------------------------------------------------------------------

TP.definePrimitive('ifNull',
function(aSuspectValue, aDefaultValue) {

    /**
     * @name ifNull
     * @synopsis Returns either aSuspectValue or aDefaultValue based on the
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
     * @todo
     */

    return (aSuspectValue === null) ? aDefaultValue : aSuspectValue;
}, false, 'TP.ifNull');

//  ------------------------------------------------------------------------

TP.definePrimitive('ifUndefined',
function(aSuspectValue, aDefaultValue) {

    /**
     * @name ifUndefined
     * @synopsis Returns either aSuspectValue or aDefaultValue based on the
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
     * @todo
     */

    return (aSuspectValue === undefined) ? aDefaultValue : aSuspectValue;
}, false, 'TP.ifUndefined');

//  ------------------------------------------------------------------------
//  BRANCH DETECTION
//  ------------------------------------------------------------------------

/*
There are some common idioms in TIBET methods related to logging. These
idioms are built to help support stripping these constructs for production
code to reduce overhead and code size. The idioms are:

    //  logging idiom(s)
    TP.ifError() ? TP.error(...) : 0;
    TP.ifFatal() ? TP.fatal(...) : 0;
    TP.ifInfo() ? TP.info(...) : 0;
    TP.ifSevere() ? TP.severe(...) : 0;
    TP.ifSystem() ? TP.system(...) : 0;
    TP.ifTrace() ? TP.trace(...) : 0;
    TP.ifWarn() ? TP.warn(...) : 0;
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('ifLogLevel',
function(aFlag, aLevel) {

    /**
     * @name ifLogLevel
     * @synopsis Returns true if logging is set at or above aLevel. This
     *     function is a common routine used by ifError, ifTrace, ifInfo, etc.
     * @param {Boolean} aFlag An optional flag to control the return value.
     * @param {Constant} aLevel A TP error level constant such as TP.INFO or
     *     TP.TRACE.
     * @returns {Boolean} True if error-level logging is active.
     * @todo
     */

    var level = TP.ifInvalid(aLevel, TP.ERROR);

    if (aFlag === undefined) {
        return TP.sys.getLogLevel() <= level;
    }

    return aFlag && (TP.sys.getLogLevel() <= level);
}, false, 'TP.ifLogLevel');

//  ------------------------------------------------------------------------

TP.definePrimitive('ifError',
function(aFlag) {

    /**
     * @name ifError
     * @synopsis Returns true if logging is set at or above TP.ERROR level. This
     *     function is commonly used in the idiomatic expression:
     *     <code>TP.ifError() ? TP.error(...) : 0;code> This idiom can be
     *     stripped by packaging tools to remove inline logging calls from
     *     production code.
     * @param {Boolean} aFlag An optional flag to control the return value.
     *     Rarely used with this idiomatic variant.
     * @returns {Boolean} True if error-level logging is active.
     * @todo
     */

    return TP.ifLogLevel(aFlag, TP.ERROR);
}, false, 'TP.ifError');

//  ------------------------------------------------------------------------

TP.definePrimitive('ifFatal',
function(aFlag) {

    /**
     * @name ifFatal
     * @synopsis Returns true if logging is set at or above TP.FATAL level. This
     *     function is commonly used in the idiomatic expression:
     *     <code>TP.ifFatal() ? TP.error(...) : 0;code> This idiom can be
     *     stripped by packaging tools to remove inline logging calls from
     *     production code.
     * @param {Boolean} aFlag An optional flag to control the return value.
     *     Rarely used with this idiomatic variant.
     * @returns {Boolean} True if fatal-level logging is active.
     * @todo
     */

    return TP.ifLogLevel(aFlag, TP.FATAL);
}, false, 'TP.ifFatal');

//  ------------------------------------------------------------------------

TP.definePrimitive('ifInfo',
function(aFlag) {

    /**
     * @name ifInfo
     * @synopsis Returns true if logging is set at or above TP.INFO level. This
     *     function is commonly used in the idiomatic expression:
     *     <code>TP.ifInfo() ? TP.info(...) : 0;code> This idiom can be stripped
     *     by packaging tools to remove inline logging calls from production
     *     code.
     * @param {Boolean} aFlag An optional flag to control the return value.
     *     Rarely used with this idiomatic variant.
     * @returns {Boolean} True if info-level logging is active.
     * @todo
     */

    return TP.ifLogLevel(aFlag, TP.INFO);
}, false, 'TP.ifInfo');

//  ------------------------------------------------------------------------

TP.definePrimitive('ifSevere',
function(aFlag) {

    /**
     * @name ifSevere
     * @synopsis Returns true if logging is set at or above TP.SEVERE level.
     *     This function is commonly used in the idiomatic expression:
     *     <code>TP.ifSevere() ? TP.severe(...) : 0;code> This idiom can be
     *     stripped by packaging tools to remove inline logging calls from
     *     production code.
     * @param {Boolean} aFlag An optional flag to control the return value.
     *     Rarely used with this idiomatic variant.
     * @returns {Boolean} True if severe-level logging is active.
     * @todo
     */

    return TP.ifLogLevel(aFlag, TP.SEVERE);
}, false, 'TP.ifSevere');

//  ------------------------------------------------------------------------

TP.definePrimitive('ifSystem',
function(aFlag) {

    /**
     * @name ifSystem
     * @synopsis Returns true if logging is set at or above TP.SYSTEM level.
     *     This function is commonly used in the idiomatic expression:
     *     <code>TP.ifSystem() ? TP.system(...) : 0;code> This idiom can be
     *     stripped by packaging tools to remove inline logging calls from
     *     production code.
     * @param {Boolean} aFlag An optional flag to control the return value.
     *     Rarely used with this idiomatic variant.
     * @returns {Boolean} True if system-level logging is active.
     * @todo
     */

    return TP.ifLogLevel(aFlag, TP.SYSTEM);
}, false, 'TP.ifSystem');

//  ------------------------------------------------------------------------

TP.definePrimitive('ifTrace',
function(aFlag) {

    /**
     * @name ifTrace
     * @synopsis Returns true if logging is set at or above TP.TRACE level. This
     *     function is commonly used in the idiomatic expression:
     *     <code>TP.ifTrace() ? TP.trace(...) : 0;code> This idiom can be
     *     stripped by packaging tools to remove inline logging calls from
     *     production code.
     * @param {Boolean} aFlag An optional flag to control the return value.
     *     Rarely used with this idiomatic variant.
     * @returns {Boolean} True if trace-level logging is active.
     * @todo
     */

    return TP.ifLogLevel(aFlag, TP.TRACE);
}, false, 'TP.ifTrace');

//  ------------------------------------------------------------------------

TP.definePrimitive('ifWarn',
function(aFlag) {

    /**
     * @name ifWarn
     * @synopsis Returns true if logging is set at or above TP.WARN level. This
     *     function is commonly used in the idiomatic expression:
     *     <code>TP.ifWarn() ? TP.warn(...) : 0;code> This idiom can be stripped
     *     by packaging tools to remove inline logging calls from production
     *     code.
     * @param {Boolean} aFlag An optional flag to control the return value.
     *     Rarely used with this idiomatic variant.
     * @returns {Boolean} True if warn-level logging is active.
     * @todo
     */

    return TP.ifLogLevel(aFlag, TP.WARN);
}, false, 'TP.ifWarn');

//  ------------------------------------------------------------------------
//  TYPE CHECKS
//  ------------------------------------------------------------------------

TP.definePrimitive('isNode',
function(anObj) {

    /**
     * @name isNode
     * @synopsis Returns true if the object provided is a DOM node, regardless
     *     of whether it's in an HTML or XML DOM. This is a simple test for a
     *     valid nodeType property.
     * @param {Object} anObj The Object to test.
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
     * @todo
     */

    return TP.isValid(anObj) && typeof anObj.nodeType === 'number';
}, false, 'TP.ifNode');

//  ------------------------------------------------------------------------

TP.definePrimitive('isNonFunctionConstructor',
function(anObj) {

    /**
     * @name isNonFunctionConstructor
     * @synopsis Returns whether or not the supplied object is a 'non Function'
     *     constructor. Host environments have constructors that are not
     *     Functions, but are faked by the platform.
     * @param {Object} anObj The Object to test.
     * @returns {String} Whether or not the supplied object is a non Function
     *     constructor object.
     */

    return TP.isValid(TP.getNonFunctionConstructorName(anObj));
}, false, 'TP.isNonFunctionConstructor');

//  ------------------------------------------------------------------------

TP.definePrimitive('getNonFunctionConstructorName',
function(anObj) {

    /**
     * @name getNonFunctionConstructorName
     * @synopsis Returns a name for a 'non Function' constructor. Host
     *     environments have constructors that are not Functions, but are faked
     *     by the platform. This function will return an appropriate name for
     *     them.
     * @description This method has environment-specific checks in it. This is,
     *     unfortunately, the only way to do this since a) it comes early in the
     *     boot process and b) there is no way to automatically determine which
     *     constructors are non-Function (in general, most Host constructors are
     *     not enumerable on the global in the environment).
     * @param {Object} anObj The Object to return the name for.
     * @returns {String} The name for the supplied non-Function constructor
     *     object.
     */

    var name;

    if (TP.notValid(anObj)) {
        return null;
    }

    //  The object is created by non Function constructors and has an object
    //  name for us to use.
    if ((name = anObj.$$nonFunctionConstructorObjectName)) {
        return name;
    }

    //  Firefox 28
    if (TP.boot.getBrowser() === 'firefox') {
        if (anObj === self.Blob) {
            return 'Blob';
        } else if (anObj === self.CameraCapabilities) {
            return 'CameraCapabilities';
        } else if (anObj === self.CSSConditionRule) {
            return 'CSSConditionRule';
        } else if (anObj === self.CSSGroupingRule) {
            return 'CSSGroupingRule';
        } else if (anObj === self.CSSMediaRule) {
            return 'CSSMediaRule';
        } else if (anObj === self.CSSPageRule) {
            return 'CSSPageRule';
        } else if (anObj === self.CSSRule) {
            return 'CSSRule';
        } else if (anObj === self.CSSRuleList) {
            return 'CSSRuleList';
        } else if (anObj === self.CSSStyleRule) {
            return 'CSSStyleRule';
        } else if (anObj === self.CSSSupportsRule) {
            return 'CSSSupportsRule';
        } else if (anObj === self.DataTransfer) {
            return 'DataTransfer';
        } else if (anObj === self.DeviceAcceleration) {
            return 'DeviceAcceleration';
        } else if (anObj === self.DeviceRotationRate) {
            return 'DeviceRotationRate';
        } else if (anObj === self.DOMStringList) {
            return 'DOMStringList';
        } else if (anObj === self.File) {
            return 'File';
        } else if (anObj === self.Location) {
            return 'Location';
        } else if (anObj === self.MozMmsMessage) {
            return 'MozMmsMessage';
        } else if (anObj === self.MozMobileMessageManager) {
            return 'MozMobileMessageManager';
        } else if (anObj === self.MozMobileMessageThread) {
            return 'MozMobileMessageThread';
        } else if (anObj === self.MozSmsFilter) {
            return 'MozSmsFilter';
        } else if (anObj === self.MozSmsMessage) {
            return 'MozSmsMessage';
        } else if (anObj === self.MozSmsSegmentInfo) {
            return 'MozSmsSegmentInfo';
        } else if (anObj === self.StyleSheetList) {
            return 'StyleSheetList';
        } else if (anObj === self.SVGLength) {
            return 'SVGLength';
        } else if (anObj === self.SVGNumber) {
            return 'SVGNumber';
        } else if (anObj === self.Window) {
            return 'DOMWindow';
        }
    }

    //  Chrome 33
    if (TP.boot.getBrowser() === 'chrome') {
        if (anObj === self.CSS) {
            return 'CSS';
        } else if (anObj === self.Intl) {
            return 'Intl';
        } else if (anObj === self.JSON) {
            return 'JSON';
        } else if (anObj === self.Math) {
            return 'Math';
        }
    }

    //  Safari 7
    if (TP.boot.getBrowser() === 'safari') {
        if (anObj === self.CSS) {
            return 'CSS';
        } else if (anObj === self.Intl) {
            return 'Intl';
        } else if (anObj === self.JSON) {
            return 'JSON';
        } else if (anObj === self.Math) {
            return 'Math';
        } else if (anObj === self.Window) {
            return 'DOMWindow';
        }
    }

    return null;
}, false, 'TP.getNonFunctionConstructorName');

//  ------------------------------------------------------------------------

TP.definePrimitive('isType',
function(anObj) {

    /**
     * @name isType
     * @synopsis Returns true if the object provided acts as a Type/Class. To
     *     properly respond the object must have a META hash reference which
     *     TIBET adds for any object used as a type.
     * @param {Object} anObj The Object to test.
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
     * @todo
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

    if ((anObj === Function) ||
                (TP.isValid(anObj[TP.TYPE]) &&
                (anObj[TP.TYPE] !== TP.FunctionProto[TP.TYPE]))) {
        return true;
    }

    //  native types are tricksy since they'll just say Function...we need
    //  their actual name to see if it starts with an uppercase character
    //  and we need to avoid instance names which all say Function*
    if (tname === 'Function') {
        //  owner and track can't be NONE, which implies a bound function
        if ((anObj[TP.OWNER] === TP.NONE) ||
            (anObj[TP.TRACK] === TP.NONE)) {
            return false;
        }

        //  methods have owners and tracks in TIBET
        if (anObj[TP.OWNER] && anObj[TP.TRACK]) {
            return false;
        }

        name = anObj.$getName();

        //  unfortunately our last option is a bit error prone, but we'll
        //  say types have to match a certain naming standard
        return (name.indexOf('Function' + TP.OID_PREFIX) !== 0) &&
                TP.regex.NATIVE_TYPENAME.test(name);
    }

    return false;
}, false, 'TP.isType');

//  ------------------------------------------------------------------------

TP.definePrimitive('isNativeType',
function(anObj) {

    /**
     * @name isNativeType
     * @synopsis Returns true if the object provided is a native type for the
     *     current browser.
     * @description Because the browsers don't have a common set of types the
     *     results of this method may vary based on the browser in question. The
     *     results are consistent for the "big 8" and the major types which
     *     extend those 8 such as Event, but most HTML/DOM types will vary
     *     between implementations. By also checking for 'non Function'
     *     constructors here, we try to mitigate this problem.
     * @param {Object} anObj The Object to test.
     * @returns {Boolean} Whether or not the supplied object is a native type
     *     (that is, one that is built into the browser).
     */

    //  Many 'native types' on Chrome will report as NaN using the standard
    //  isNaN() test - weird
    if (TP.isNaN(anObj)) {
        return false;
    }

    return ((TP.isFunction(anObj) || TP.isNonFunctionConstructor(anObj)) &&
                 TP.isType(anObj)) ||
            (anObj === Function);
}, false, 'TP.isNativeType');

//  ------------------------------------------------------------------------

TP.definePrimitive('isWindow',
function(anObj) {

    /**
     * @name isWindow
     * @synopsis Returns true if the object to be tested is a window.
     * @param {Object} anObj The Object to test.
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
     * @todo
     */

    return (TP.isValid(anObj) && (anObj.moveBy !== undefined));
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
     * @name isPrototype
     * @synopsis Returns true if the object is being used as a prototypical
     *     instance within the constructor.prototype chain or within TIBET's
     *     inheritance mechanism.
     * @returns {Boolean}
     */

    if (TP.isValid(anObject) &&
        TP.owns(anObject, '$$prototype') &&
        (anObject.$$prototype === anObject)) {

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
     * @name isMutable
     * @synopsis Returns true if the object provided is mutable. NOTE that when
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
     * @param {Object} anObj The Object to test.
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
     * @todo
     */

    if (TP.notValid(anObj)) {
        return false;
    }

    //  Strings, Numbers, Booleans are *not* mutable

    if ((typeof anObj.charAt === 'function') ||
        (typeof anObj.toPrecision === 'function') ||
        (anObj === true) ||
        (anObj === false)) {
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
     * @name isReferenceType
     * @synopsis Returns true if the type provided is a reference type.
     * @description Reference types don't support copy-on-write semantics within
     *     the JS prototype system. This means certain operations need to "do
     *     the right thing" and make a copy when necessary. This is particularly
     *     apparent when working with TIBET attributes -- reference type
     *     attributes are normally initialized in the init() method while the
     *     others can be defined in the add*Attribute definition calls -- unless
     *     you truly want to share one attribute across all instances (or all
     *     subtypes).
     * @param {Object} anObj The Object to test.
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
     *          TP.isReferenceType(function () {alert('hi'));
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
     * @todo
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
function () {

    /**
     * @name genUUID
     * @synopsis Generates an RFC4122 version 4 UUID.
     * @description This solution courtesy of 'broofa' at:
     *      http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
     * @returns {String} An RFC4122 version 4 compliant UUID
     */

    /* jshint bitwise:false */
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
            /[xy]/g,
            function(c) {
                var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
                    return v.toString(16);
            });
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
    TP.sys.$statistics = new Object();
    /* jshint +W010 */
}

//  ------------------------------------------------------------------------
//  Function/Method Enhancements
//  ------------------------------------------------------------------------

TP.definePrimitive('isMethod',
function(anObj) {

    /**
     * @name isMethod
     * @synopsis Returns true if the object provided is a method on some object.
     * @param {Object} anObject The Object to test.
     * @returns {Boolean} Whether or not the supplied object is a method.
     */

    //  methods have owners and tracks in TIBET so those need to be present
    if (TP.notValid(anObj) ||
        TP.notValid(anObj[TP.OWNER]) ||
        TP.notValid(anObj[TP.TRACK])) {
        return false;
    }

    //  owner and track can't be NONE, which implies a bound function
    if ((anObj[TP.OWNER] === TP.NONE) || (anObj[TP.TRACK] === TP.NONE)) {
        return false;
    }

    //  if owner/track are valid is it callable? then it's a method as long
    //  as we don't trip over a native type
    return TP.isCallable(anObj) && !TP.isType(anObj);
}, false, 'TP.isMethod');

//  ------------------------------------------------------------------------

TP.defineMethod(TP.sys, 'shouldLogCodeChanges',
function(aFlag, shouldSignal) {

    /**
     * @name shouldLogCodeChanges
     * @synopsis Controls and returns the state of the 'log changes' flag.
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
     * @todo
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.code_changes', aFlag, shouldSignal);
    }

    return TP.sys.cfg('log.code_changes');
}, TP.PRIMITIVE_TRACK, null, 'TP.sys.shouldLogCodeChanges');

//  ------------------------------------------------------------------------

TP.defineMethod(TP.sys, '$$shouldConstructDNUs',
function(aFlag, shouldSignal) {

    /**
     * @name $$shouldConstructDNUs
     * @synopsis Controls and returns the state of the 'construct DNU' flag.
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
     * @todo
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('tibet.$$construct_dnus', aFlag, shouldSignal);
    }

    return TP.sys.cfg('tibet.$$construct_dnus');
}, TP.PRIMITIVE_TRACK, null, 'TP.sys.$$shouldConstructDNUs');

//  ------------------------------------------------------------------------
//  CHANGE LOG
//  ------------------------------------------------------------------------

//  NOTE that the change log is a separate log to ensure that it cannot be
//  cleared accidentally when clearing the larger activity log.
TP.sys.$changes = TP.ifInvalid(TP.sys.$changes, new TP.boot.Log());

//  ------------------------------------------------------------------------

TP.defineMethod(TP.sys, 'getChangeLog',
function() {

    /**
     * @name getChangeLog
     * @synopsis Returns the TIBET change log, which contains entries for source
     *     code changes made if code change tracking is set to true. These
     *     changes can be exported and merged into a tibet.xml file for loading
     *     as part of the application.
     * @returns {TP.boot.Log} A primitive log object.
     */

    return TP.sys.$changes;
}, TP.PRIMITIVE_TRACK, null, 'TP.sys.getChangeLog');

//  ------------------------------------------------------------------------

TP.defineMethod(TP.sys, 'logCodeChange',
function(anObject, aLogLevel, aContext) {

    /**
     * @name logCodeChange
     * @synopsis Adds source code to the change log. Returns true if the log
     *     entry is successful. This method will have no effect when the
     *     TP.sys.shouldLogCodeChanges() flag is false. NOTE that level does not
     *     affect what is written here, a call to logCodeChange will always
     *     update the change log.
     * @param {Object} anObject The source code change to log.
     * @param {Number} aLogLevel The logging level, from TP.TRACE through
     *     TP.SYSTEM.
     * @param {arguments} aContext An arguments object providing call stack and
     *     context data.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    if (!TP.sys.shouldLogCodeChanges()) {
        return false;
    }

    //  pure source code with no extras here...and notice that unlike the
    //  logs we trim, the change log grows without bound until cleared and
    //  is stored in sequence
    TP.sys.$changes.log(anObject, TP.CHANGE_LOG, TP.SYSTEM,
                        aContext || arguments);

    TP.sys.log(anObject, TP.CHANGE_LOG, aLogLevel, aContext || arguments);

    //  with all logging complete signal change on the change log
    TP.sys.$logChanged(TP.CHANGE_LOG);

    return true;
}, TP.PRIMITIVE_TRACK, null, 'TP.sys.logCodeChange');

//  ------------------------------------------------------------------------

TP.defineMethod(TP.sys, '$logAttributeChange',
function(anObject, aContext, aTrack,
            attributeName, attributeValue, attributeDesc) {

    /**
     * @name $logAttributeChange
     * @synopsis Adds source code to the change log specific to an attribute
     *     operation. See logCodeChange() for more detail on change logging.
     * @param {Object} anObject The source object.
     * @param {arguments} aContext An arguments object providing call stack and
     *     context data.
     * @param {String} aTrack A TIBET Track constant.
     * @param {String} attributeName The attribute name.
     * @param {Object} attributeValue The attribute value.
     * @param {Object} attributeDesc An ECMA5 property descriptor.
     * @returns {Boolean} True if the logging operation succeeded.
     * @todo
     */

    var str,
        id;

    if (!TP.sys.shouldLogCodeChanges()) {
        return false;
    }

    str = TP.ac();

    //  first step is to determine the ID of the object altering an
    //  attribute definition
    if (TP.isType(anObject)) {
        //  the type name is a useable identifier
        str.push(anObject.getTypeName());
    } else {
        //  harder, unless there's a unique ID that can find the object
        if (TP.canInvoke(anObject, 'getID')) {
            id = anObject.getID();

            //  is the object a global reference?
            if (TP.global[id] === anObject) {
                str.push(id);
            } else {
                if (TP.byOID(id) === anObject) {
                    str.push('TP.byOID(\'', id, '\')');
                } else {
                    //  not registered? this is an error
                    TP.ifWarn() ?
                        TP.warn('Unregistered object ' +
                                    id +
                                    ' can\'t log attribute changes.',
                                TP.CHANGE_LOG,
                                aContext || arguments) : 0;

                    return false;
                }
            }
        }
    }

    if (aTrack === 'Type') {
        str.push('.Type.defineAttribute(\'', attributeName, '\'');
    } else if (aTrack === 'Inst') {
        str.push('.Inst.defineAttribute(\'', attributeName, '\'');
    } else if (aTrack !== 'Global') {
        str.push('.defineAttribute(\'', attributeName, '\'');
    } else {
        if (TP.canInvoke(anObject, 'getID')) {
            id = anObject.getID();
        } else {
            id = TP.str(anObject);
        }

        //  global track...this is a different deal and "shouldn't happen"
        TP.ifWarn() ?
            TP.warn(id + ' can\'t log global track attribute changes.',
                    TP.CHANGE_LOG,
                    aContext || arguments) : 0;

        return false;
    }

    if (TP.isValid(attributeValue)) {
        str.push(', ');
        if (TP.canInvoke(attributeValue, 'asSource')) {
            str.push(attributeValue.asSource());
        } else if (TP.canInvoke(attributeValue, 'asString')) {
            str.push(attributeValue.asString());
        } else if (TP.canInvoke(attributeValue, 'toString')) {
            str.push(attributeValue.toString());
        } else if (TP.isString(attributeValue.nodeValue)) {
            str.push(attributeValue.nodeValue);
        } else {
            str.push('');
        }
    }

    str.push(');');

    str = str.join('');

    //  pure source code with no extras here...and notice that unlike the
    //  logs we trim, the change log grows without bound until cleared and
    //  is stored in sequence
    TP.sys.$changes.log(str,
                        TP.CHANGE_LOG,
                        TP.TRACE,
                        aContext || arguments);
    TP.sys.$logChanged('Change');

    return true;
}, TP.PRIMITIVE_TRACK, null, 'TP.sys.$logAttributeChange');

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
var NativeTypeStub = new Function();
NativeTypeStub.prototype = {};
/* jshint +W054 */

//  ---

NativeTypeStub.prototype.get =
    function(attributeName) {

    /**
     * @name get
     * @synopsis Returns the value, if any, for the attribute provided.
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
     * @name defineAttribute
     * @synopsis Adds the attribute with name and value provided as a type
     *     attribute.
     * @param {String} attributeName The attribute name.
     * @param {Object} attributeValue The attribute value or a property
     *     descriptor object.
     * @returns {Object} The newly defined attribute value.
     */

    return TP.defineAttribute(
            this.$$target, attributeName, attributeValue,
            TP.TYPE_TRACK, this[TP.OWNER]);
};

//  ---

NativeTypeStub.prototype.defineConstant =
    function(constantName, constantValue) {

    /**
     * @name defineConstant
     * @synopsis Adds/defines a new type constant for the receiver.
     * @param {String} constantName The constant name.
     * @param {Object} constantValue The constant value or a property descriptor
     *     object.
     * @returns {Object} The newly defined constant value.
     */

    return TP.defineConstant(
            this.$$target, constantName, constantValue,
            TP.TYPE_TRACK, this[TP.OWNER]);
};

//  ---

NativeTypeStub.prototype.defineMethod =
    function(methodName, methodBody, desc) {

    /**
     * @name defineMethod
     * @synopsis Adds the function with name and body provided as a type method.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Object} desc An optional 'property descriptor'. If a 'value' slot
     *     is supplied here, it is ignored in favor of the methodBody parameter
     *     to this method.
     * @returns {Object} The receiver.
     */

    return TP.defineMethod(
            this.$$target, methodName, methodBody, TP.TYPE_TRACK,
            desc, null, this[TP.OWNER]);
};

//  ---

NativeTypeStub.prototype.set =
    function(attributeName, attributeValue, shouldSignal) {

    /**
     * @name set
     * @synopsis Sets the value of the named attribute to the value provided. If
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
var NativeInstStub = new Function();
NativeInstStub.prototype = {};
/* jshint +W054 */

//  ---

NativeInstStub.prototype.get =
    function(attributeName) {

    /**
     * @name get
     * @synopsis Returns the value, if any, for the attribute provided.
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
     * @name defineAttribute
     * @synopsis Adds the attribute with name and value provided as an instance
     *     attribute.
     * @param {String} attributeName The attribute name.
     * @param {Object} attributeValue The attribute value or a property
     *     descriptor object.
     * @returns {Object} The newly defined attribute value.
     */

    return TP.defineAttribute(
            this.$$target, attributeName, attributeValue,
            TP.INST_TRACK, this[TP.OWNER]);
};

//  ---

NativeInstStub.prototype.defineConstant =
    function(constantName, constantValue) {

    /**
     * @name defineConstant
     * @synopsis Adds/defines a new type constant for the receiver.
     * @param {String} constantName The constant name.
     * @param {Object} constantValue The constant value or a property descriptor
     *     object.
     * @returns {Object} The newly defined constant value.
     */

    return TP.defineConstant(
            this.$$target, constantName, constantValue,
            TP.INST_TRACK, this[TP.OWNER]);
};

//  ---

NativeInstStub.prototype.defineMethod =
    function(methodName, methodBody, desc) {

    /**
     * @name defineMethod
     * @synopsis Adds the function with name and body provided as an instance
     *     method.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Object} desc An optional 'property descriptor'. If a 'value' slot
     *     is supplied here, it is ignored in favor of the methodBody parameter
     *     to this method.
     * @returns {Object} The receiver.
     */

    return TP.defineMethod(
            this.$$target, methodName, methodBody, TP.INST_TRACK,
            desc, null, this[TP.OWNER]);
};

//  ---

NativeInstStub.prototype.set =
    function(attributeName, attributeValue, shouldSignal) {

    /**
     * @name set
     * @synopsis Sets the value of the named attribute to the value provided. If
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

TP.defineMethod(TP.FunctionProto, '$constructPrototype',
function() {

    /**
     * @name $constructPrototype
     * @synopsis Returns a new prototype constructed by invoking the receiver as
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
TP.lang.RootObject$$Type = new Function();
TP.lang.RootObject$$Inst = new Function();
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
TP.lang.RootObject.Inst[TP.OWNER]= TP.lang.RootObject;

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
     * @name defineGlobalMethod
     * @synopsis Adds the method with name and body provided as a global
     *     method.
     * @description Global methods are methods on the "Global" object, which
     *     means they overlap with Window methods. For that reason there are
     *     some sanity checks that can be performed to help avoid issues when
     *     overriding a Window method.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @returns {Function} The installed method.
     * @todo
     */

    var method;

    method = TP.defineMethod(
            self, methodName, methodBody,
            TP.GLOBAL_TRACK, null, 'TP.global.' + methodName);

    // TODO: verify this is correct.
    TP.sys.defineGlobal(methodName, method, true);

    return method;
}, false, 'TP.defineGlobalMethod');

//  ------------------------------------------------------------------------

TP.definePrimitive('defineMetaTypeMethod',
function(methodName, methodBody) {

    /**
     * @name defineMetaTypeMethod
     * @synopsis Adds the method with name and body provided as a 'meta type'
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

        TP.defineMethod(
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
     * @name defineMetaInstMethod
     * @synopsis Adds the method with name and body provided as a 'meta
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

        TP.defineMethod(
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
        } else {
            TP.defineMethod(
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
        } else {
            TP.defineMethod(
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
     * @name defineCommonMethod
     * @synopsis Adds the method with name and body provided as a 'common'
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

        TP.defineMethod(
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
    } else {

        TP.defineMethod(
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

TP.definePrimitive('defineAttribute',
function(target, name, value, track, owner) {

    /**
     * @name defineAttribute
     * @synopsis Defines an attribute, tracking all necessary metadata.
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
     * @param {Object} value The attribute value.
     * @param {String} track The attribute track (Inst, Type, Local).
     * @param {Object} owner The owner object. Defaults to target.
     * @returns {Object} The newly defined attribute value.
     * @todo
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
                    TP.LOG, arguments) : 0;

        TP.debug('break.duplicate_attribute');

        return target[name];
    }

    own = TP.ifInvalid(owner, target);
    trk = TP.ifInvalid(track, TP.LOCAL_TRACK);

    if (TP.notValid(value)) {
        desc = TP.DEFAULT_DESCRIPTOR;
        val = undefined;
    } else if (!value.hasOwnProperty('value')) {
        desc = {'value': value};
        val = value;
    } else {
        //  Need to extract the value since we were handed a descriptor
        desc = value;
        val = desc.value;
    }

    attribute = TP.defineSlot(target, name, val, TP.ATTRIBUTE, trk, desc);

    /*
    if (TP.sys.shouldLogCodeChanges()) {
    TP.sys.$logAttributeChange(
            this, arguments,
            'Type', attrName, attributeValue, attributeDesc);
    };
    */

    desc[TP.NAME] = name;

    TP.sys.addMetadata(own, desc, TP.ATTRIBUTE, trk);

    return attribute;
}, false, 'TP.defineAttribute');

//  -----------------------------------------------------------------------

TP.definePrimitive('defineConstant',
function(target, name, value, track, owner) {

    /**
     * @name defineConstant
     * @synopsis Defines a constant , tracking all necessary metadata.
     * @param {Object} target The target object.
     * @param {String} name The constant name.
     * @param {Object} value The constant value or a property descriptor object.
     * @param {String} track The constant track (Inst, Type, Local). Default is
     *     TP.TYPE_TRACK.
     * @param {Object} owner The owner object. Defaults to target.
     * @returns {Object} The newly defined constant value.
     * @todo
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
                    TP.LOG, arguments) : 0;

        TP.debug('break.duplicate_constant');

        return target[name];
    }

    own = TP.ifInvalid(owner, target);
    trk = TP.ifInvalid(track, TP.LOCAL_TRACK);

    if (TP.notValid(value)) {
        desc = TP.DEFAULT_DESCRIPTOR;
        val = undefined;
    } else if (!value.hasOwnProperty('value')) {
        desc = {'value': value};
        val = value;
    } else {
        //  Need to extract the value since we were handed a descriptor
        desc = value;
        val = desc.value;
    }

    constant = TP.defineSlot(target, name, val, TP.CONSTANT, trk, desc);

    /*
    if (TP.sys.shouldLogCodeChanges()) {
    TP.sys.$logAttributeChange(
            this, arguments,
            'Type', attrName, attributeValue, attributeDesc);
    };
    */

    desc[TP.NAME] = name;

    //  NB: We register constants as 'TP.ATTRIBUTE's
    TP.sys.addMetadata(own, desc, TP.ATTRIBUTE, trk);

    return constant;

}, false, 'TP.defineConstant');

//  ------------------------------------------------------------------------

TP.definePrimitive('runConditionalFunction',
function(functionBodyOrTests) {

    /**
     * @name runConditionalFunction
     * @synopsis Runs the function supplied, usually supplied as part of a set
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
                        TP.LOG, arguments) : 0;

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
            if ((typeof test === 'string') && TP.sys.hasFeatureTest(test)) {
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

                    //  No default might must mean we're doing a test that
                    //  doesn't pass for the current platform which has no
                    //  correlary.
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
                        TP.LOG, arguments) : 0;

        return;
    }

    return theFunc();
}, false, 'TP.runConditionalFunction');

//  ------------------------------------------------------------------------

TP.definePrimitive('defineMethodAlias',
function(target, methodName, methodBody) {

    /**
     * @name defineMethodAlias
     * @synopsis Defines an alias to a previously defined method.
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
     * @name getConstructor
     * @synopsis Returns the receiver's constructor function. For simple objects
     *     this is a simple wrapper around returning the constructor property.
     * @returns {Object} The receiver's constructor function.
     */

    return this.constructor;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getPrototype',
function() {

    /**
     * @name getPrototype
     * @synopsis Returns the receiver's prototype instance. The prototype
     *     instance is the object from which behavior is inherited.
     * @returns {Object} The receiver's prototype instance.
     */

    return Object.getPrototypeOf(this);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getInstPrototype',
function() {

    /**
     * @name getInstPrototype
     * @synopsis Returns the receiver's instance prototype -- the object
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
     * @name getType
     * @synopsis Returns the type of the receiver. For top-level objects which
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
     * @name getTypeName
     * @synopsis Returns the type name of the receiver. This method is a synonym
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

        if ((name = str.match(TP.regex.NATIVE_TYPENAME_EXTRACT))) {
            return name[1];
        }
    }

    return TP.isWindow(this) ? 'Window' : 'Object';
});

//  ------------------------------------------------------------------------
//  OBJECT NAMING - PART II
//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('$getName',
function() {

    /**
     * @name $getName
     * @synopsis Default implementation of the $getName operation. Returns the
     *     receiver's ID as the 'Name'.
     * @returns {String}
     * @todo
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
     * @name getName
     * @synopsis Default implementation of the $getName operation. Returns the
     *     receiver's ID as the 'Name'.
     * @returns {String}
     * @todo
     */

    if (TP.owns(this, TP.NAME)) {
        return this[TP.NAME];
    }

    return this.getID();
});

//  ------------------------------------------------------------------------
//  OBJECT IDENTITY - PART II
//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('$getOID',
function(aPrefix) {

    /**
     * @name $getOID
     * @synopsis Returns the unique object ID for the receiver. This can be
     *     thought of as the objects' primary key (sans versioning data) from a
     *     TIBET perspective. Normally you would not call this method directly,
     *     you'd call getID() instead.
     * @param {String} aPrefix An optional prefix which will be prepended to any
     *     generated value.
     * @returns {String} Currently all OID's are String values.
     * @todo
     */

    var type,
        prefix;

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

    //  prefix OIDs with type names so we get a sense of what an
    //  object is along with its random ID
    if (!aPrefix) {
        type = TP.isType(this) ?
                    this :
                    TP.type(this);
        if (TP.isNativeType(type)) {
            if (TP.isNonFunctionConstructor(type)) {
                prefix = TP.getNonFunctionConstructorName(type);
            } else if (TP.isFunction(type)) {
                //  For Functions that live in a TIBET JS context, they can
                //  response to 'getName' (which, if they're anonymous, will
                //  give them a unique ID).
                if (TP.canInvoke(type, 'getName')) {
                    prefix = type.getName();
                } else if (TP.isFunction(type)) {
                    //  Otherwise, we can just try to get the name of the
                    //  Function or the value of TP.ANONYMOUS_FUNCTION_NAME
                    prefix = TP.getFunctionName(type);
                }
            }
        } else {
            prefix = type[TP.TNAME];
        }
    } else {
        prefix = aPrefix;
    }

    //  if it doesn't exist we can create it and bail out
    if ((this.$$oid === undefined) && !TP.isNode(this)) {
        //  some native objects will complain bitterly about this
        try {
            this.$$oid = TP.sys.constructOID(prefix);
        } catch (e) {
        }
    } else if ((this.$$oid === this.getPrototype().$$oid) && !TP.isNode(this)) {
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
     * @name getID
     * @synopsis Returns the public ID of the receiver. If the receiving object
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
     * @todo
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

TP.defineMetaInstMethod('setID',
function(anID) {

    /**
     * @name setID
     * @synopsis Sets the public ID of the receiver.
     * @description Public IDs are useful as handles for acquiring objects from
     *     the TIBET instance hashes. See the comment for getID(). Note that the
     *     object is un-registered under its old ID by this operation.
     * @param {String} anID The value to use as a public ID.
     * @returns {String} The ID that was set.
     */

    var id;

    //  default invalid entries to the OID
    id = TP.notValid(anID) ? this.$getOID() : anID;

    this[TP.ID] = id;

    return this[TP.ID];
});

//  ------------------------------------------------------------------------
//  MOP (Meta-Object Protocol) aka "Universally Common Methods"
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  TP.sys Methods
//  ------------------------------------------------------------------------

TP.defineMethod(TP.sys, 'defineAttribute',
function(attributeName, attributeValue) {

    /**
     * @name defineAttribute
     * @synopsis Adds/defines a new local attribute for the receiver. The
     *     attribute gets a default value if provided. In the current release
     *     the other three parameters are ignored.
     * @param {String} attributeName The attribute name.
     * @param {Object} attributeValue The attribute value or a property
     *     descriptor object.
     * @returns {Object} The newly defined attribute value.
     * @todo
     */

    return TP.defineAttribute(
            TP.sys, attributeName, attributeValue, TP.LOCAL_TRACK);
});

//  ------------------------------------------------------------------------

TP.defineMethod(TP.sys, 'defineMethod',
function(methodName, methodBody, desc, display) {

    /**
     * @name defineMethod
     * @synopsis Adds the method with name and body provided as a local method.
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
     * @returns {Function} The installed method.
     * @todo
     */

    return TP.defineMethod(
            TP.sys, methodName, methodBody, TP.LOCAL_TRACK, desc, display);
});

//  ------------------------------------------------------------------------
//  TP.boot Methods
//  ------------------------------------------------------------------------

TP.defineMethod(TP.boot, 'defineAttribute',
function(attributeName, attributeValue) {

    /**
     * @name defineAttribute
     * @synopsis Adds/defines a new local attribute for the receiver. The
     *     attribute gets a default value if provided. In the current release
     *     the other three parameters are ignored.
     * @param {String} attributeName The attribute name.
     * @param {Object} attributeValue The attribute value or a property
     *     descriptor object.
     * @returns {Object} The newly defined attribute value.
     * @todo
     */

    return TP.defineAttribute(
            TP.boot, attributeName, attributeValue, TP.LOCAL_TRACK);
});

//  ------------------------------------------------------------------------

TP.defineMethod(TP.boot, 'defineMethod',
function(methodName, methodBody, desc, display) {

    /**
     * @name defineMethod
     * @synopsis Adds the method with name and body provided as a local method.
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
     * @returns {Function} The installed method.
     * @todo
     */

    return TP.defineMethod(
            TP.boot, methodName, methodBody, TP.LOCAL_TRACK, desc, display);
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
     * @name ownsMethod
     * @synopsis Returns true if the name represents a unique method on the
     *     receiver, one that is either introduced or overridden so that the
     *     method is "owned" by the receiver.
     * @param {String} aName The method name to check.
     * @returns {Boolean}
     */

    try {
        if (TP.sys.hasInitialized() && TP.isMethod(this[aName])) {
            return this[aName][TP.OWNER] === this;
        }
    } catch (e) {
        //  MOZ has a few that like to barf on this call.
    }

    return false;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('defineAttribute',
function(attributeName, attributeValue) {

    /**
     * @name defineAttribute
     * @synopsis Adds the attribute with name and value provided as a 'local'
     *     attribute. This is the root method that all objects that are
     *     instrumented with meta instance methods will get.
     * @param {String} attributeName The attribute name.
     * @param {Object} attributeValue The attribute value or a property
     *     descriptor object.
     * @returns {Object} The receiver.
     * @todo
     */

    return TP.defineAttribute(
            this, attributeName, attributeValue, TP.LOCAL_TRACK, this);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('defineConstant',
function(constantName, constantValue) {

    /**
     * @name defineConstant
     * @synopsis Adds the constant with name and value provided as a 'local'
     *     constant. This is the root method that all objects that are
     *     instrumented with meta instance methods will get.
     * @param {String} constantName The constant name.
     * @param {Object} constantValue The constant value or a property descriptor
     *     object.
     * @returns {Object} The newly defined constant value.
     */

    return TP.defineConstant(
            this, constantName, constantValue, TP.LOCAL_TRACK, this);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('defineMethod',
function(methodName, methodBody, desc) {

    /**
     * @name defineMethod
     * @synopsis Adds the function with name and body provided as a 'local'
     *     method. This is the root method that all objects that are
     *     instrumented with meta instance methods will get.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Object} desc An optional 'property descriptor'. If a 'value' slot
     *     is supplied here, it is ignored in favor of the methodBody parameter
     *     to this method.
     * @returns {Object} The receiver.
     * @todo
     */

    return TP.defineMethod(
            this, methodName, methodBody, TP.LOCAL_TRACK, desc, null, this);
});

//  ------------------------------------------------------------------------

TP.defineMethod(TP.FunctionProto, 'defineAttribute',
function(attributeName, attributeValue) {

    /**
     * @name defineAttribute
     * @synopsis Adds the attribute with name and value provided as an instance,
     *     'type local' or 'local' attribute. This is 'overridden' from the
     *     meta-method version because TP.FunctionProto plays so many different
     *     roles.
     * @param {String} attributeName The attribute name.
     * @param {Object} attributeValue The attribute value or a property
     *     descriptor object.
     * @returns {Object} The receiver.
     * @todo
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

    return TP.defineAttribute(
            target, attributeName, attributeValue, track, owner);
}, TP.TYPE_TRACK, null, 'TP.FunctionProto.Type.defineAttribute');

//  ------------------------------------------------------------------------

TP.defineMethod(TP.FunctionProto, 'defineConstant',
function(constantName, constantValue) {

    /**
     * @name defineConstant
     * @synopsis Adds the constant with name and value provided as an instance,
     *     'type local' or 'local' constant. This is 'overridden' from the
     *     meta-method version because TP.FunctionProto plays so many different
     *     roles.
     * @param {String} constantName The constant name.
     * @param {Object} constantValue The constant value or a property descriptor
     *     object.
     * @returns {Object} The newly defined constant value.
     * @todo
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

    return TP.defineConstant(
            target, constantName, constantValue, track, owner);
}, TP.TYPE_TRACK, null, 'TP.FunctionProto.Type.defineConstant');

//  ------------------------------------------------------------------------

TP.defineMethod(TP.FunctionProto, 'defineMethod',
function(methodName, methodBody, desc) {

    /**
     * @name defineMethod
     * @synopsis Adds the function with name and body provided as an instance,
     *     'type local' or 'local' method. This is 'overridden' from the
     *     meta-method version because TP.FunctionProto plays so many different
     *     roles.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Object} desc An optional 'property descriptor'. If a 'value' slot
     *     is supplied here, it is ignored in favor of the methodBody parameter
     *     to this method.
     * @returns {Object} The receiver.
     * @todo
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

    return TP.defineMethod(
            target, methodName, methodBody, track, desc, null, owner);
}, TP.TYPE_TRACK, null, 'TP.FunctionProto.Type.defineMethod');

//  ------------------------------------------------------------------------
//  TP.lang.RootObject - TYPE DEFINITION
//  ------------------------------------------------------------------------

TP.defineMethod(TP.lang.RootObject.Type, 'defineAttribute',
function(attributeName, attributeValue) {

    /**
     * @name defineAttribute
     * @synopsis Adds the attribute with name and value provided as a type or
     *     'type local' attribute.
     * @param {String} attributeName The attribute name.
     * @param {Object} attributeValue The attribute value or a property
     *     descriptor object.
     * @returns {Object} The receiver.
     * @todo
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

    return TP.defineAttribute(
                this, attributeName, attributeValue, track, owner);
}, TP.TYPE_TRACK, null, 'TP.lang.RootObject.Type.defineAttribute');

//  ------------------------------------------------------------------------

TP.defineMethod(TP.lang.RootObject.Type, 'defineConstant',
function(constantName, constantValue) {

    /**
     * @name defineConstant
     * @synopsis Adds the constant with name and value provided as a type or
     *     'type local' constant.
     * @param {String} constantName The constant name.
     * @param {Object} constantValue The constant value or a property descriptor
     *     object.
     * @returns {Object} The newly defined constant value.
     * @todo
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

    return TP.defineConstant(
                this, constantName, constantValue, track, owner);
}, TP.TYPE_TRACK, null, 'TP.lang.RootObject.Type.defineConstant');

//  ------------------------------------------------------------------------

TP.defineMethod(TP.lang.RootObject.Type, 'defineMethod',
function(methodName, methodBody, desc) {

    /**
     * @name defineMethod
     * @synopsis Adds the function with name and body provided as a type or
     *     'type local' method.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Object} desc An optional 'property descriptor'. If a 'value' slot
     *     is supplied here, it is ignored in favor of the methodBody parameter
     *     to this method.
     * @returns {Object} The receiver.
     * @todo
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

    return TP.defineMethod(
                this, methodName, methodBody, track, desc, null, owner);
}, TP.TYPE_TRACK, null, 'TP.lang.RootObject.Type.defineMethod');

//  ------------------------------------------------------------------------

TP.defineMethod(TP.lang.RootObject.Inst, 'defineAttribute',
function(attributeName, attributeValue) {

    /**
     * @name defineAttribute
     * @synopsis Adds the attribute with name and value provided as an instance
     *     or 'local' attribute.
     * @param {String} attributeName The attribute name.
     * @param {Object} attributeValue The attribute value or a property
     *     descriptor object.
     * @returns {Object} The receiver.
     * @todo
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

    return TP.defineAttribute(
                this, attributeName, attributeValue, track, owner);
}, TP.TYPE_TRACK, null, 'TP.lang.RootObject.Inst.defineAttribute');

//  ------------------------------------------------------------------------

TP.defineMethod(TP.lang.RootObject.Inst, 'defineConstant',
function(constantName, constantValue) {

    /**
     * @name defineConstant
     * @synopsis Adds the constant with name and value provided as an instance
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

    return TP.defineConstant(
                this, constantName, constantValue, track, owner);
}, TP.TYPE_TRACK, null, 'TP.lang.RootObject.Inst.defineConstant');

//  ------------------------------------------------------------------------

TP.defineMethod(TP.lang.RootObject.Inst, 'defineMethod',
function(methodName, methodBody, desc) {

    /**
     * @name defineMethod
     * @synopsis Adds the function with name and body provided as an instance or
     *     'local' method.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Object} desc An optional 'property descriptor'. If a 'value' slot
     *     is supplied here, it is ignored in favor of the methodBody parameter
     *     to this method.
     * @returns {Object} The receiver.
     * @todo
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

    return TP.defineMethod(
                this, methodName, methodBody, track, desc, null, owner);
}, TP.TYPE_TRACK, null, 'TP.lang.RootObject.Inst.defineMethod');

//  ------------------------------------------------------------------------
//  Window TYPE DEFINITION
//  ------------------------------------------------------------------------

//  We need to define this here, since it's needed by 'Type.defineMethod' below.
//  But then we register it right away as soon as we can.
Window.getName = function () {

    /**
     * @name getName
     * @synopsis Returns the name of the Window constructor which is,
     *     appropriately, 'Window'.
     * @returns {String}
     */

    return 'Window';
};

//  ------------------------------------------------------------------------

Window.Type.defineMethod = function(methodName, methodBody, desc) {

    /**
     * @name defineMethod
     * @synopsis Adds the function with name and body provided as a type method.
     *     This is the root method since all other methods can be declared using
     *     this one.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Object} desc An optional 'property descriptor'. If a 'value' slot
     *     is supplied here, it is ignored in favor of the methodBody parameter
     *     to this method.
     * @returns {Function} The installed method.
     * @todo
     */

    var display = 'Window.Type.' + methodName;

    return TP.defineMethod(
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
function () {

    /**
     * @name $getName
     * @synopsis Allows the top level to act as a function 'owner'. Function
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
function () {

    /**
     * @name getName
     * @synopsis Allows the top level to act as a function 'owner'. Function
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
function (aPrefix) {

    /**
     * @name $getOID
     * @synopsis Returns the unique object ID for the receiver. This can be
     *     thought of as the objects' primary key (sans versioning data) from a
     *     TIBET perspective.
     * @param {String} aPrefix An optional prefix which will be prepended to any
     *     generated value.
     * @returns {String} Currently all OID's are String values.
     * @todo
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
function (aPrefix) {

    /**
     * @name getID
     * @synopsis Returns the public ID of the receiver. If the receiving object
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
     * @todo
     */

    if (TP.notValid(this[TP.ID])) {
        return this.$getOID(aPrefix);
    }

    return this[TP.ID];
});

//  ------------------------------------------------------------------------

Window.Inst.defineMethod('setID',
function (anID) {

    /**
     * @name setID
     * @synopsis Sets the public ID of the receiver. Public IDs are useful as
     *     handles for acquiring objects from the TIBET instance hashes. See the
     *     comment for getID(). Note that the object is un-registered under its
     *     old ID by this operation.
     * @param {String} anID The value to use as a public ID.
     * @returns {String} The ID that was set.
     */

    var id;

    //  default invalid entries to the OID
    id = TP.notValid(anID) ? this.$getOID() : anID;

    this[TP.ID] = id;

    return this[TP.ID];
});

//  ------------------------------------------------------------------------
//  REFLECTION - PART II (PrePatch)
//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getLocalName',
function() {

    /**
     * @name getLocalName
     * @synopsis Returns the local (aka short) name of the receiver without any
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
     * @name getNamespacePrefix
     * @synopsis Returns the namespace (in TIBET terms) of the receiver. For
     *     example, the namespace of the TP.sig.Signal type is 'sig'. At this
     *     level, this returns the empty String.
     * @returns {String} The receiver's namespace.
     */

    return '';
});

//  ------------------------------------------------------------------------
//  STRING PROCESSING
//  ------------------------------------------------------------------------

TP.definePrimitive('sc',
function() {

    /**
     * @name sc
     * @synopsis String.construct shortcut, later replaced by a full-featured
     *     version that ensures the incoming string gets a chance at being
     *     localized. All arguments used in constructing Strings using TP.sc()
     *     are subject to localization based on the current source and target
     *     locale information. See TP.core.Locale for more information.
     * @param {arguments} varargs A variable list of 0 to N values to build the
     *     String from.
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
function(aMessage, aLevel) {

    /**
     * @name alert
     * @synopsis Displays a message to the user. Advanced versions of this
     *     function make use of DHTML controls and a "curtain" to display the
     *     message in a modal fashion, or act in a non-modal fashion, offering
     *     usability improvements.
     * @param {String} aMessage The message for the user.
     * @param {Number|String} aLevel A TIBET logging level or a CSS class name
     *     for styling.
     * @example Notify the user of some event:
     *     <code>
     *          TP.alert('TIBET Rocks!');
     *     </code>
     * @example Notify the user of a condition at the TP.INFO level.
     *     <code>
     *          TP.alert('TIBET Rocks!', TP.INFO);
     *     </code>
     * @todo
     */

    return alert(TP.sc(aMessage));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('confirm',
function(anAction, aLevel) {

    /**
     * @name confirm
     * @synopsis Displays a prompt to the user asking for confirmation of an
     *     action. Advanced versions of this function make use of DHTML controls
     *     and a "curtain" to display the prompt in a modal fashion, or act in a
     *     non-modal fashion, offering usability improvements over the native
     *     confirm function.
     * @param {String} aQuestion The question for the user.
     * @param {Number|String} aLevel A TIBET logging level or a CSS class name
     *     for styling.
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
     * @todo
     */

    return confirm(TP.sc(anAction));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('prompt',
function(aQuestion, aDefaultAnswer, aLevel) {

    /**
     * @name prompt
     * @synopsis Displays a prompt to the user asking for data. Advanced
     *     versions of this function make use of DHTML controls and a "curtain"
     *     to display the prompt. NOTE that the prompt can be non-modal in more
     *     advanced versions. The initial version is a simple wrapper around the
     *     native JS prompt() function.
     * @param {String} aQuestion The question for the user.
     * @param {String} aDefaultAnswer The default answer, provided in the input
     *     field.
     * @param {Number|String} aLevel A TIBET logging level or a CSS class name
     *     for styling.
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
     * @todo
     */

    return prompt(TP.sc(aQuestion), TP.sc(aDefaultAnswer) || '');
});

//  ------------------------------------------------------------------------

TP.definePrimitive('status',
function(aMessage, aTarget) {

    /**
     * @name status
     * @synopsis Displays a message to the user in a window's status bar, or in
     *     a targeted status "zone" such as those found in the standard TIBET
     *     Application Platform (TAP) interface.
     * @param {String} aMessage The message for the user.
     * @param {Window|String|Number} aTarget A window, a window ID, or a status
     *     "zone" number.
     * @example Notify the user of some event:
     *     <code>
     *          TP.status('TIBET Rocks!');
     *     </code>
     * @todo
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

    //  Note here how we use the 'top'-level window of wherever the code
    //  base is being loaded from.
    return;
});

//  ------------------------------------------------------------------------
//  DEBUGGING/LOGGING
//  ------------------------------------------------------------------------

TP.definePrimitive('debug',
function(aFlagOrParam) {

    /**
     * @name debug
     * @synopsis A stand-in for the debugger keyword that won't cause Safari to
     *     complain about syntax errors. Also a convenient way to provide if
     *     (some condition) debugger; logic. By providing either a Boolean or a
     *     configuration parameter name to this function you can simplify coding
     *     as in:
     *
     *     TP.debug('break.uri_construct');
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
     *          TP.debug();
     *     </code>
     * @example Set a conditional "breakpoint" that will trigger when the
     *     configuration parameter break.document_loaded is true.
     *     <code>
     *          TP.debug('break.document_loaded');
     *     </code>
     * @todo
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
        debugger;
        /* jshint +W087 */
    } catch (e) {
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('log',
function(anObject, aLogName, aContext, aLogLevel) {

    /**
     * @name log
     * @synopsis Logs anObject to the named log at the level provided. This
     *     method is a preliminary wrapper for invoking TP.sys.log once enough
     *     of the kernel has been loaded. Typically you'll use a shortcut for
     *     either a specific log or specific level as in TP.sys.logIO, or
     *     TP.warn() etc.
     * @param {Object} anObject The object to log.
     * @param {String} aLogName TP.LOG by default, but any valid TP.*_LOG or
     *     string.
     * @param {arguments} aContext An arguments object providing call stack
     *     information.
     * @param {Number} aLogLevel TP.INFO or a similar level ID.
     * @todo
     */

    var level,
        context,

        name;

    level = TP.ifInvalid(aLogLevel, TP.INFO);
    context = TP.ifInvalid(aContext || arguments);

    if (TP.sys.hasStarted()) {
        name = TP.ifInvalid(aLogName, TP.LOG);
        return TP.sys.log(anObject, name, level, context);
    } else if ((level >= TP.ERROR) && (level < TP.SYSTEM)) {
        return TP.boot.$stderr(anObject, context, level);
    } else {
        return TP.boot.$stdout(anObject, context, level);
    }
});

//  ------------------------------------------------------------------------

TP.definePrimitive('error',
function(anObject, aLogName, aContext) {

    /**
     * @name error
     * @synopsis Logs anObject at TP.ERROR level, if active.
     * @param {Object} anObject The object to log.
     * @param {String} aLogName TP.LOG by default, but any valid TP.*_LOG or
     *     string.
     * @param {arguments} aContext An arguments object providing stack
     *     information.
     * @todo
     */

    return TP.log(anObject,
                    aLogName || TP.LOG,
                    aContext || arguments,
                    TP.ERROR);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('fatal',
function(anObject, aLogName, aContext) {

    /**
     * @name fatal
     * @synopsis Logs anObject at TP.FATAL level, if active.
     * @param {Object} anObject The object to log.
     * @param {String} aLogName TP.LOG by default, but any valid TP.*_LOG or
     *     string.
     * @param {arguments} aContext An arguments object providing stack
     *     information.
     * @todo
     */

    return TP.log(anObject,
                    aLogName || TP.LOG,
                    aContext || arguments,
                    TP.FATAL);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('info',
function(anObject, aLogName, aContext) {

    /**
     * @name info
     * @synopsis Logs anObject at TP.INFO level, if active.
     * @param {Object} anObject The object to log.
     * @param {String} aLogName TP.LOG by default, but any valid TP.*_LOG or
     *     string.
     * @param {arguments} aContext An arguments object providing stack
     *     information.
     * @todo
     */

    return TP.log(anObject,
                    aLogName || TP.LOG,
                    aContext || arguments,
                    TP.INFO);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('severe',
function(anObject, aLogName, aContext) {

    /**
     * @name severe
     * @synopsis Logs anObject at TP.SEVERE level, if active.
     * @param {Object} anObject The object to log.
     * @param {String} aLogName TP.LOG by default, but any valid TP.*_LOG or
     *     string.
     * @param {arguments} aContext An arguments object providing stack
     *     information.
     * @todo
     */

    return TP.log(anObject,
                    aLogName || TP.LOG,
                    aContext || arguments,
                    TP.SEVERE);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('system',
function(anObject, aLogName, aContext) {

    /**
     * @name system
     * @synopsis Logs anObject at TP.SYSTEM level, if active.
     * @param {Object} anObject The object to log.
     * @param {String} aLogName TP.LOG by default, but any valid TP.*_LOG or
     *     string.
     * @param {arguments} aContext An arguments object providing stack
     *     information.
     * @todo
     */

    return TP.log(anObject,
                    aLogName || TP.LOG,
                    aContext || arguments,
                    TP.SYSTEM);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('trace',
function(anObject, aLogName, aContext) {

    /**
     * @name trace
     * @synopsis Logs anObject at TP.TRACE level, if active.
     * @param {Object} anObject The object to log.
     * @param {String} aLogName TP.LOG by default, but any valid TP.*_LOG or
     *     string.
     * @param {arguments} aContext An arguments object providing stack
     *     information.
     * @todo
     */

    return TP.log(anObject,
                    aLogName || TP.LOG,
                    aContext || arguments,
                    TP.TRACE);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('warn',
function(anObject, aLogName, aContext) {

    /**
     * @name warn
     * @synopsis Logs anObject at TP.WARN level, if active.
     * @param {Object} anObject The object to log.
     * @param {String} aLogName TP.LOG by default, but any valid TP.*_LOG or
     *     string.
     * @param {arguments} aContext An arguments object providing stack
     *     information.
     * @todo
     */

    return TP.log(anObject,
                    aLogName || TP.LOG,
                    aContext || arguments,
                    TP.WARN);
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
function(varargs) {

    /**
     * @name ac
     * @synopsis The standard array construction method in TIBET. Constructs and
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
     * @param {arguments} varargs A variable list of 0 to N elements to place in
     *     the array.
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
     * @todo
     */

    var arr;

    //  NOTE that we don't use literal creation syntax since that can have
    //  differing behavior on IE based on current window export state.
    /* jshint -W009 */
    arr = new Array();
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
     * @name args
     * @synopsis Constructs and returns an Array containing the values from
     *     anArgArray from aStart to anEnd. By default the entire arguments
     *     object is copied into the array.
     * @param {arguments} anArgArray A native arguments object.
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
     * @todo
     */

    var len,
        start,
        end;

    len = arguments.length;
    if (len === 0) {
        return this.raise('TP.sig.InvalidParameter', arguments,
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
function(varargs) {

    /**
     * @name join
     * @synopsis Constructs and returns a new string instance by joining the
     *     arguments via an Array. This can be quite a bit faster than the
     *     equivalent += approach depending on the browser.
     * @param {arguments} varargs A variable list of 0 to N strings to join into
     *     a single string.
     * @example Construct a new joined string of markup without using +=:
     *     <code>
     *          str = TP.join('Hello ', username, ' from TIBET!');
     *     </code>
     * @returns {String} A new string.
     * @todo
     */

            /*
    var arr,
        len,
        i;

    //  literal here since we won't be messaging this except with join
    arr = [];

    len = arguments.length;
    for (i = 0; i < len; i++) {
        arr[i] = arguments[i];
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
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('add',
function(varargs) {

    /**
     * @name add
     * @synopsis Appends one or more objects to the receiver. This primitive
     *     version does not provide change notification so it's equivalent to
     *     the native Array push call, but instead of returning a count like
     *     push(), it returns the receiver for easier method chaining.
     * @param {arguments} varargs A variable list of 0 to N elements to place in
     *     the array.
     * @example Add one or more elements to an array:
     *     <code>
     *          arr = TP.ac();
     *          arr.add(varA, varB, varC);
     *     </code>
     * @returns {Array} The receiver.
     * @addon Array
     * @todo
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
     * @name getSize
     * @synopsis Returns the size of the receiver. For simple arrays this is the
     *     length.
     * @returns {Number} The size.
     */

    return this.length;
});

//  ------------------------------------------------------------------------

Array.Inst.defineMethod('item',
function(anIndex) {

    /**
     * @name item
     * @synopsis Returns the value found at anIndex. NOTE that using item() is
     *     actually a deprecated practice in TIBET, you should use at() instead
     *     and convert nodelists to arrays using TP.ac().
     * @param {Number} anIndex The index to use for lookup.
     * @returns {Object} The value at anIndex.
     * @addon Array
     * @todo
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

TP.definePrimitive('stdin', TP.STDIN_PROMPT);
TP.definePrimitive('stdout', TP.STDOUT_LOG);
TP.definePrimitive('stderr', TP.STDERR_LOG);

//  ------------------------------------------------------------------------
//  METADATA
//  ------------------------------------------------------------------------

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

TP.definePrimitive('objectGetLoadModule',
function(anObject) {

    /**
     * @name objectGetLoadModule
     * @synopsis Returns the module name from which the script defining the
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
     * @name objectGetLoadCollectionPath
     * @synopsis Returns the 'collection' path to the file responsible for the
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
     * @name objectGetLoadPath
     * @synopsis Returns the path to the file responsible for the object.
     * @param {Object} anObject The object to query.
     * @returns {String} The load path where the receiver can be found.
     */

    var node;

    if (!TP.isElement(node = this.objectGetLoadNode(anObject))) {
        return;
    }

    return node.getAttribute('src') || node.getAttribute('source');
});

//  ------------------------------------------------------------------------

TP.definePrimitive('objectGetLoadTarget',
function(anObject) {

    /**
     * @name objectGetLoadTarget
     * @synopsis Returns the module target from which the object's node was
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

TP.definePrimitive('uriGetLoadModule',
function(aPath) {

    /**
     * @name uriGetLoadModule
     * @synopsis Returns the module path responsible for loading the file.
     * @param {String} aPath A filename, typically without any root information.
     * @returns {String} The module file path responsible for including the path
     *     in the load.
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
     * @name uriGetLoadNode
     * @synopsis Returns the script node responsible for loading the file. The
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

TP.definePrimitive('uriGetLoadTarget',
function(aPath) {

    /**
     * @name uriGetLoadTarget
     * @synopsis Returns the module target responsible for loading the file.
     * @param {String} aPath A filename, typically without any root information.
     * @returns {String} The module target name responsible for including the
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
     * @name getUICanvas
     * @synopsis Returns the currently active UI canvas object as a TIBET
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
     * @todo
     */

    var obj;

    if (TP.isTrue(unwrapped)) {
        obj = TP.sys.getWindowById(TP.sys.getUICanvasName());
        if (TP.isWindow(obj)) {
            return obj;
        }

        return;
    }

    //  NB: This caches TP.core.Window instances
    return TP.core.Window.construct(TP.sys.getUICanvasName());
});

//  ------------------------------------------------------------------------

//  alias uiwin to getUICanvas
TP.sys.uiwin = TP.sys.getUICanvas;

//  ------------------------------------------------------------------------

TP.sys.defineMethod('uidoc',
function(unwrapped) {

    /**
     * @name uidoc
     * @synopsis Returns the current UI document in either wrapped or unwrapped
     *     form. The default is wrapped.
     * @param {Boolean} unwrapped True to unwrap the document.
     * @returns {TP.core.Document|Document}
     * @todo
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
     * @name getUICanvasName
     * @synopsis Returns the currently active UI canvas object's name.
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
     * @name getUICanvasPath
     * @synopsis Returns the currently active UI canvas object's "path", which
     *     for TIBET means returning the TIBET URI string which can be used to
     *     identify/acquire the UI canvas. This will be a string of the form
     *     'tibet://.../' where the remaining elements of the URI represent a
     *     path to the window object such at 'tibet://top/'.
     * @returns {String} The path containing the path to the active UI canvas.
     */

    return 'tibet://' + TP.sys.getUICanvasName() + '/';
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getUIRoot',
function(unwrapped) {

    /**
     * @name getUIRoot
     * @synopsis Returns the current root UI canvas as a TIBET window/frame
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
     * @name getUIRootName
     * @synopsis Returns the root UI canvas object's name. Defaults on initial
     *     invocation to the UI canvas name.
     * @returns {String} The name of the top UI canvas.
     * @todo
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
     * @name setUICanvas
     * @synopsis Defines the currently active UI canvas for later reference.
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
     * @name setUIRoot
     * @synopsis Defines the root UI canvas for later reference. This is
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
 *     operationswhich may be called prior to the full signaling system being
 *     installed.
 * @todo
 */

//  ------------------------------------------------------------------------

TP.definePrimitive('signal',
function(anOrigin, aSignal, aContext, aPayload, aPolicy, aType) {

    /**
     * @name signal
     * @synopsis Pre-signaling TP.signal() stub. This version gets overlaid with
     *     a more powerful version later in the load process. This avoids load
     *     dependency problems and uses TP.stdout() or TP.boot.$stdout() rather
     *     than actually triggering a signal.
     * @param {Object} anOrigin The object serving as the signal's origin.
     * @param {TP.sig.Signal} aSignal The signal type to be fired.
     * @param {Object} aContext The signaling context, usually an arguments
     *     object.
     * @param {Object} aPayload An object containing optional arguments. Passed
     *     without alteration to handlers -- the "payload".
     * @param {Function} aPolicy A signaling policy which defines how the signal
     *     should be fired.
     * @param {String|TP.sig.Signal} aType An optional default type to use as a
     *     supertype when the signal type isn't found and must be created.
     * @todo
     */

    //  during early kernel load calls to this will simply get written to
    //  stdout

    var str;

    if (TP.sys.cfg('log.signals')) {
        str = TP.join('origin: ', anOrigin,
                        ' signaled: ', aSignal,
                        ' from : ', aContext,
                        ' with: ', aPayload);

        if (TP.isCallable(TP.stdout)) {
            //  kernel version
            TP.stdout(str);
        } else if (TP.isCallable(TP.boot.$stdout)) {
            //  boot system version
            TP.boot.$stdout(str, TP.TRACE);
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('raise',
function(anOrigin, anExceptionType, aContext, aPayload) {

    /**
     * @name raise
     * @synopsis Pre-signaling TP.raise() stub. This version gets overlaid with
     *     a more powerful version later in the load process.
     * @param {Object} anOrigin The object serving as the exception's origin.
     * @param {TP.sig.Exception} anExceptionType The type of exception to fire.
     * @param {Object} aContext The signaling context, should be an arguments
     *     object.
     * @param {Object} aPayload An object containing optional arguments. Passed
     *     without alteration to handlers.
     * @todo
     */

    //  note that we don't mention the firing policy in this version
    return TP.signal(anOrigin, anExceptionType, aContext, aPayload);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('raise',
function(anExceptionType, aContext, aPayload) {

    /**
     * @name raise
     * @synopsis Default error handling call, i.e. this.raise('Something'); The
     *     receiver is used as the origin in a subsequent call to TP.raise()
     *     which provides the functional implementation.
     * @param {TP.sig.Exception} anExceptionType The type of exception to fire.
     * @param {Object} aContext The signaling context, usually an arguments
     *     object.
     * @param {Object} aPayload An object containing optional arguments. Passed
     *     without alteration to handlers.
     * @todo
     */

    return TP.raise(this, anExceptionType, aContext, aPayload);
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('raise',
function(anExceptionType, aContext, aPayload) {

    /**
     * @name raise
     * @synopsis Default error handling call, i.e. this.raise('Something'); The
     *     receiver is used as the origin in a subsequent call to TP.raise()
     *     which provides the functional implementation.
     * @param {TP.sig.Exception} anExceptionType The type of exception to fire.
     * @param {Object} aContext The signaling context, usually an arguments
     *     object.
     * @param {Object} aPayload An object containing optional arguments. Passed
     *     without alteration to handlers.
     * @todo
     */

    return TP.raise(this, anExceptionType, aContext, aPayload);
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
     * @name ifKeyInvalid
     * @synopsis Returns aDefault value when anObject is either invalid, or the
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
     * @todo
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
    }

    return TP.isCallable(aDefault) ? aDefault(aKey) : aDefault;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('ifKeyNull',
function(anObject, aKey, aDefault) {

    /**
     * @name ifKeyNull
     * @synopsis Returns aDefault value when anObject is either specifically
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
     * @todo
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
    }

    return TP.isCallable(aDefault) ? aDefault(aKey) : aDefault;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('ifKeyUndefined',
function(anObject, aKey, aDefault) {

    /**
     * @name ifKeyUndefined
     * @synopsis Returns aDefault value when anObject is specifically undefined,
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
     * @todo
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
    }

    return TP.isCallable(aDefault) ? aDefault(aKey) : aDefault;
});

//  ------------------------------------------------------------------------
//  BOOLEAN TESTS
//  ------------------------------------------------------------------------

TP.definePrimitive('isFalse',
function(aValue) {

    /**
     * @name isFalse
     * @synopsis Return true if the argument is the Boolean 'false'. This is a
     *     more explicit test than 'if (!anObj)' since that test will often lead
     *     your code astray due to bizarre type conversions.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is false:
     *     <code>
     *          if (TP.isFalse(anObj)) { TP.alert('its false'); };
     *     </code>
     * @returns {Boolean} True if aValue === false.
     * @todo
     */

    //  Seems pendantic, but its the best performer

    if (aValue === false) {
        return true;
    }

    if (aValue === true) {
        return false;
    }

    return (TP.isBoolean(aValue) && (aValue.valueOf() === false));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isTrue',
function(aValue) {

    /**
     * @name isTrue
     * @synopsis Return true if the argument is the Boolean 'true'. This is a
     *     more explicit test than 'if (anObj)' since that test will often lead
     *     your code astray due to bizarre type conversions.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is true:
     *     <code>
     *          if (TP.isTrue(anObj)) { TP.alert('its true'); };
     *     </code>
     * @returns {Boolean} True if aValue === true.
     * @todo
     */

    //  Seems pendantic, but its the best performer

    if (aValue === true) {
        return true;
    }

    if (aValue === false) {
        return false;
    }

    return (TP.isBoolean(aValue) && (aValue.valueOf() === true));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('notFalse',
function(aValue) {

    /**
     * @name notFalse
     * @synopsis Return true if the argument is not the Boolean 'false'. This is
     *     a more explicit test than 'if (anObj)' since that test will often
     *     lead your code astray due to bizarre type conversions.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is false:
     *     <code>
     *          if (TP.notFalse(anObj)) { TP.alert('its not false'); };
     *     </code>
     * @returns {Boolean} True if aValue !== false.
     * @todo
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
     * @name notTrue
     * @synopsis Return true if the argument is not the Boolean 'true'. This is
     *     a more explicit test than 'if (!anObj)' since that test will often
     *     lead your code astray due to bizarre type conversions.
     * @param {Object} aValue The value to test.
     * @example Test to see if anObj is false:
     *     <code>
     *          if (TP.notTrue(anObj)) { TP.alert('its not true'); };
     *     </code>
     * @returns {Boolean} True if aValue !== true.
     * @todo
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
     * @name isArgArray
     * @synopsis Returns true if the object provided is an 'arguments' array, a
     *     very special object in JavaScript which isn't an Array.
     * @param {Object} anObj The Object to test.
     * @example Test to see if 'arguments' is an arg Array:
     *     <code>
     *          TP.isArgArray(arguments);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is an 'arguments'
     *     array.
     * @todo
     */

    return TP.isValid(anObj) && (
        TP.ObjectProto.toString.call(anObj) === '[object Arguments]');
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isArray',
function(anObj) {

    /**
     * @name isArray
     * @synopsis Returns true if the object provided is a JavaScript Array.
     * @param {Object} anObj The Object to test.
     * @example Test to see if 'anObj' is an Array:
     *     <code>
     *          anObj = TP.ac();
     *          TP.isArray(anObj);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is a JavaScript
     *     Array.
     * @todo
     */

    //  Defined by ECMAScript edition 5
    return Array.isArray(anObj);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isBoolean',
function(anObj) {

    /**
     * @name isBoolean
     * @synopsis Returns true if the object provided is a boolean primitive or
     *     wrapper object.
     * @param {Object} anObj The Object to test.
     * @returns {Boolean} Whether or not the supplied object is a boolean.
     */

    if ((anObj === true) || (anObj === false)) {
        return true;
    }

    //  if it says so, then it is (a primitive one)
    if (typeof(anObj) === 'boolean') {
        return true;
    }

    //  Boolean objects won't say so unless we check, and if the object
    //  is in another window the constructor test will fail so we have to go
    //  even further.
    return (TP.isValid(anObj) && ((anObj.constructor === Boolean) ||
                                TP.regex.BOOLEAN_CONSTRUCTOR.test(
                                    '' + anObj.constructor)));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isDate',
function(anObj) {

    /**
     * @name isDate
     * @synopsis Returns true if the object provided is a date value.
     * @param {Object} anObj The Object to test.
     * @returns {Boolean}
     */

    //  all dates report object as their primitive type (but so does null)
    if (TP.notValid(anObj) || typeof(anObj) !== 'object') {
        return false;
    }

    //  also watch out for IE/Moz foolishness around 'new Date(blah)'
    //  returning objects which aren't really dates (instead of null)
    if ((anObj.toString() === 'Invalid Date') ||
        (anObj.toString() === 'NaN')) {
        return false;
    }

    //  localizable check
    if (typeof TP.isKindOf === 'function') {
        return TP.isKindOf(anObj, 'Date');
    }

    //  last chance is constructor
    return ((anObj.constructor === Date) ||
            TP.regex.DATE_CONSTRUCTOR.test('' + anObj.constructor));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isNumber',
function(anObj) {

    /**
     * @name isNumber
     * @synopsis Returns true if the object provided is a numeric value. We do
     *     not consider NaN (NotANumber) to be a number for purposes of this
     *     test since our semantic usage of isNumber is based on testing
     *     parseInt results to see if a user has entered a valid numeric value
     *     or if data from a service is numeric.
     * @description The obvious question is why not use typeof() == "number"?
     *     Well, because typeof(NaN) == "number" will return true and, in our
     *     minds anyway, NaN is explicitly by name Not A Number. At the very
     *     least you won't want to do math with it or try to save it to a
     *     numeric column in a database. Sure, the spec says the behavior here
     *     is correct. We didn't say it was a bug, it's just lousy semantics so
     *     we made it work the way we, and other developers, assumed it would
     *     work so that a call like if (TP.isNumber(parseInt(userData)))
     *     doMath(); works the way you'd expect and won't try to compute the sum
     *     of 'foo', 'bar', and 'baz' when the user enters alphas.
     * @param {Object} anObj The Object to test.
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
     * @todo
     */

    //  We have to check NaN first, since typeof(NaN) is considered to be
    //  'number' and we kinda think NotANumber is Not a Number ;)
    if (TP.isNaN(anObj)) {
        return false;
    }

    if (typeof(anObj) === 'number') {
        return true;
    }

    return TP.ObjectProto.toString.call(anObj) === '[object Number]';
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isRegExp',
function(anObj) {

    /**
     * @name isRegExp
     * @synopsis Returns true if the object provided is a regular expression
     *     instance.
     * @param {Object} anObj The Object to test.
     * @returns {Boolean} Whether or not the supplied object is a RegExp.
     */

    //  most regexp tests are done when we're trying to tell the difference
    //  between what might be a regex or a string, so check that first
    if (typeof(anObj) === 'string') {
        return false;
    }

    //  constructor checks are next best option
    return (TP.isValid(anObj) && ((anObj.constructor === RegExp) ||
                                TP.regex.REGEXP_CONSTRUCTOR.test(
                                    '' + anObj.constructor)));
});

//  ------------------------------------------------------------------------
//  Common Type Checking
//  ------------------------------------------------------------------------

TP.definePrimitive('isCollection',
function(anObj) {

    /**
     * @name isCollection
     * @synopsis Returns true if the value passed in is an instance of a
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
     * @name isEnhanced
     * @synopsis Returns true if the object appears to be an enhanced object,
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
     * @name isGlobal
     * @synopsis Returns true if the name/object provided is a global reference,
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
     *     Function that has been registered using TIBET's 'defineGlobal' method.
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
     * @todo
     */

    //  typeof lies about certain edge cases and is indiscriminate in most
    //  others, but for our purposes here it's sufficient
    switch (typeof(anObj)) {
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
                return (anObj[TP.TRACK] === 'Global') ||
                        TP.sys.$windowglobals.contains(TP.name(anObj));
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
     * @name isPair
     * @synopsis Returns true if the object provided is an ordered pair,
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
     * @name $$isTypeProxy
     * @synopsis Returns true if the object provided is a type proxy.
     * @description TIBET supports using proxy objects for types such that when
     *     the proxy is first messaged the named type will automatically be
     *     loaded and the message will be sent to the type. This allows TIBET to
     *     support autoloading of code with no programmer intervention or
     *     additional maintenance coding.
     * @param {Object} anObj The Object to test.
     * @returns {Boolean} Whether or not the supplied object is a proxy.
     */

    return (TP.isValid(anObj) && TP.isCallable(anObj.$$fault));
});

//  ------------------------------------------------------------------------
//  TIBET-specific type checking
//  ------------------------------------------------------------------------

TP.definePrimitive('isProperty',
function(anObj) {

    /**
     * @name isProperty
     * @synopsis Returns true if the object provided is a valid property. A
     *     valid property is a property which is defined but not a DNU
     *     (DoesNotUnderstand) method. Note the syntax is typically
     *     TP.isProperty(someObj[someProperty]) so what we typically get here is
     *     undefined or a real value
     * @param {Object} anObj The Object to test.
     * @returns {Boolean} Whether or not the supplied object is a property (that
     *     is a defined 'slot', but not a DNU).
     */

    //  note that we don't consider a null to be a false condition here, in
    //  fact, a null implies that a value was set at some point
    if (anObj === undefined) {
        return false;
    }

    //  The slot might have been set to 'null'.
    if (anObj === null) {
        return true;
    }

    //  make sure we don't try to get $$dnu from a null
    return !TP.$$isDNU(anObj);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isTypeName',
function(anObj) {

    /**
     * @name isTypeName
     * @synopsis Returns true if the object is a string that represents what
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
     * @name isAttributeNode
     * @synopsis Returns true if the object provided is an XML or HTML attribute
     *     node (Node.ATTRIBUTE_NODE). NOTE that this is quite different from
     *     the TP.isProperty() call, which tests validity of a slot value.
     * @param {Object} anObj The Object to test.
     * @example Test to see if anObj is a DOM attribute node (assume that the
     *     document's body element has a 'style' attribute on it):
     *     <code>
     *          anObj = TP.documentGetBody(document).getAttributeNode('style');
     *          TP.isAttributeNode(anObj);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is an attribute
     *     node.
     * @todo
     */

    return (TP.isValid(anObj) && anObj.nodeType === Node.ATTRIBUTE_NODE);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isCDATASectionNode',
function(anObj) {

    /**
     * @name isCDATASectionNode
     * @synopsis Returns true if the object provided is an XML or HTML CDATA
     *     section node (Node.CDATA_SECTION_NODE).
     * @param {Object} anObj The Object to test.
     * @example Test what's a CDATA section node and what's not:
     *     <code>
     *          TP.isCDATASectionNode(document.documentElement);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is an CDATA section
     *     node.
     * @todo
     */

    return (TP.isValid(anObj) && anObj.nodeType === Node.CDATA_SECTION_NODE);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isCollectionNode',
function(anObj) {

    /**
     * @name isCollectionNode
     * @synopsis Returns true if the object provided is an XML or HTML element
     *     (Node.ELEMENT_NODE), document (Node.DOCUMENT_NODE), or document
     *     fragment (Node.DOCUMENT_FRAGMENT_NODE).
     * @param {Object} anObj The Object to test.
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
     * @todo
     */

    return (TP.isValid(anObj) &&
            ((anObj.nodeType === Node.ELEMENT_NODE) ||
            (anObj.nodeType === Node.DOCUMENT_NODE) ||
            (anObj.nodeType === Node.DOCUMENT_FRAGMENT_NODE)));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isCommentNode',
function(anObj) {

    /**
     * @name isCommentNode
     * @synopsis Returns true if the object provided is an XML or HTML Comment
     *     node (Node.COMMENT_NODE).
     * @param {Object} anObj The Object to test.
     * @example Test what's a comment node and what's not:
     *     <code>
     *          TP.isCommentNode(document.documentElement);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is an Comment node.
     * @todo
     */

    return (TP.isValid(anObj) && anObj.nodeType === Node.COMMENT_NODE);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isDocument',
function(anObj) {

    /**
     * @name isDocument
     * @synopsis Returns true if the object provided TP.isHTMLDocument() or
     *     TP.isXMLDocument().
     * @param {Object} anObj The Object to test.
     * @example Test what's a document and what's not:
     *     <code>
     *          isDocument(window.document);
     *          <samp>true</samp>
     *          isDocument(window);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is an (HTML)
     *     document.
     * @todo
     */

    //  both html and xml documents still report node type as document, but
    //  an xml document won't have an applets property
    return (TP.isValid(anObj) && anObj.nodeType === Node.DOCUMENT_NODE);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isElement',
function(anObj) {

    /**
     * @name isElement
     * @synopsis Returns true if the object provided is an XML or HTML element
     *     node (Node.ELEMENT_NODE).
     * @param {Object} anObj The Object to test.
     * @example Test what's an element and what's not:
     *     <code>
     *          TP.isElement(document.documentElement);
     *          <samp>true</samp>
     *          TP.isElement(document);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is an Element.
     * @todo
     */

    return (TP.isValid(anObj) && anObj.nodeType === Node.ELEMENT_NODE);
});

//  ------------------------------------------------------------------------
//  TP.isError() defined in TIBETPrimitivesPlatform.js
//  ------------------------------------------------------------------------

TP.definePrimitive('isEvent',
function(anObj) {

    /**
     * @name isEvent
     * @synopsis Returns true if the object provided is an Event object.
     * @param {Object} anObj The Object to test.
     * @returns {Boolean} Whether or not the supplied object is an Event object.
     */

    return (TP.isValid(anObj) &&
            (typeof anObj.stopPropagation === 'function') &&
            TP.isValid(anObj.timeStamp));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isFragment',
function(anObj) {

    /**
     * @name isFragment
     * @synopsis Returns true if the object provided is an XML or HTML document
     *     fragment node (Node.DOCUMENT_FRAGMENT_NODE).
     * @param {Object} anObj The Object to test.
     * @example TODO
     * @returns {Boolean} Whether or not the supplied object is a document
     *     fragment.
     */

    return (TP.isValid(anObj) && anObj.nodeType === Node.DOCUMENT_FRAGMENT_NODE);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isFrame',
function(anObj) {

    /**
     * @name isFrame
     * @synopsis Returns true if the object is a frame rather than window.
     * @param {Object} anObj The Object to test.
     * @example Test what's an iframe and what's not:
     *     <code>
     *          TP.isFrame(top);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is a frame.
     * @todo
     */

    //  A top-level window has a parent slot that is set to itself.
    return (TP.isWindow(anObj) && anObj.parent !== anObj);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isHTMLDocument',
function(anObj) {

    /**
     * @name isHTMLDocument
     * @synopsis Returns true if the object contains 'open' and 'applets'
     *     references which seems sufficient to determine whether it is a true
     *     HTML document, a general object, or 'self'.
     * @param {Object} anObj The Object to test.
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
     * @todo
     */

    var testElem;

    //  Check to make sure its some sort of DOCUMENT_NODE first.
    if (TP.notValid(anObj) || anObj.nodeType !== Node.DOCUMENT_NODE) {
        return false;
    }

    //  We may have already been through the test below and captured that
    //  value, so return it if we have.
    if (TP.isDefined(anObj.isXHTML)) {
        return !anObj.isXHTML;
    }

    //  If the document doesn't have a Window, then its not HTML
    if (TP.notValid(anObj.defaultView)) {
        return false;
    }

    if (anObj.documentElement.tagName.toLowerCase() !== 'html') {
        return false;
    }

    //  Now the problem is that, since the DOM for both XML and XHTML
    //  Document objects are so similar, we need a more in-depth test. We
    //  try to insert a piece of markup via 'innerHTML'. This markup is
    //  intentionally 'malformed' from an XML perspective (which will cause
    //  the call to throw an exception), but not from an HTML perspective.

    testElem = anObj.createElement('span');
    if (TP.isElement(anObj.body)) {
        anObj.body.appendChild(testElem);
    } else {
        anObj.documentElement.appendChild(testElem);
    }

    try {
        testElem.innerHTML = '<p>This has no closing tag';

        anObj.isXHTML = false;
    } catch (e) {
        anObj.isXHTML = true;
    } finally {
        testElem.parentNode.removeChild(testElem);
    }

    return !anObj.isXHTML;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isHTMLNode',
function(anObj) {

    /**
     * @name isHTMLNode
     * @synopsis Returns true if the object provided is an HTML node.
     * @param {Object} anObj The Object to test.
     * @example Test what's an html node and what's not:
     *     <code>
     *          TP.isHTMLNode(top.document.documentElement);
     *          <samp>true</samp>
     *          TP.isHTMLNode(newXMLDoc);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is an HTML node.
     * @todo
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
     * @name isIFrameWindow
     * @synopsis Returns whether or not the object is the content window of an
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
     * @todo
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
     * @name isMediaQueryList
     * @param {Object} anObj The Object to test.
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
    return anObj.matches !== undefined &&
            anObj.media !== undefined;
});

//  ------------------------------------------------------------------------
//  TP.isNamedNodeMap() defined in TIBETPrimitivesPlatform.js
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  TP.isNodeList() defined in TIBETPrimitivesPlatform.js
//  ------------------------------------------------------------------------

TP.definePrimitive('isPINode',
function(anObj) {

    /**
     * @name isPINode
     * @synopsis Returns true if the object provided is an XML or HTML
     *     processing instruction node (Node.PROCESSING_INSTRUCTION_NODE).
     * @param {Object} anObj The Object to test.
     * @returns {Boolean} Whether or not the supplied object is a processing
     *     instruction node.
     * @todo
     */

    return (TP.isValid(anObj) && anObj.nodeType ===
            Node.PROCESSING_INSTRUCTION_NODE);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isStyleDeclaration',
function(anObj) {

    /**
     * @name isStyleDeclaration
     * @synopsis Returns true if the object provided is a 'style' object you'd
     *     find on a rendered DOM node or as a declaration in a CSS style rule.
     * @param {Object} anObj The Object to test.
     * @example Test what's a style object and what's not:
     *     <code>
     *          TP.isStyleDeclaration(TP.documentGetBody(document).style);
     *          <samp>true</samp>
     *          TP.isStyleDeclaration(TP.documentGetBody(document).style.color);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is a 'style'
     *     object.
     * @todo
     */

    if (TP.notValid(anObj)) {
        return false;
    }

    return ((anObj.length !== undefined) &&
            (anObj.cssText !== undefined));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isStyleRule',
function(anObj) {

    /**
     * @name isStyleRule
     * @synopsis Returns true if the object provided is a 'style rule' object
     *     you'd find attached to a stylesheet.
     * @param {Object} anObj The Object to test.
     * @example Test what's a style rule object and what's not:
     *     <code>
     *          TP.isStyleRule(TP.styleSheetGetStyleRules(document.styleSheets[0])[0]);
     *          <samp>true</samp>
     *          TP.isStyleRule(TP.documentGetBody(document).style);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is a 'stylesheet'
     *     object.
     * @todo
     */

    if (TP.notValid(anObj)) {
        return false;
    }

    return ((anObj.parentStyleSheet !== undefined) &&
            (anObj.cssText !== undefined));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isStyleSheet',
function(anObj) {

    /**
     * @name isStyleSheet
     * @synopsis Returns true if the object provided is a 'stylesheet' object
     *     you'd find attached to a document.
     * @param {Object} anObj The Object to test.
     * @example Test what's a style sheet object and what's not:
     *     <code>
     *          TP.isStyleSheet(TP.documentGetBody(document).styleSheets[0]);
     *          <samp>true</samp>
     *          TP.isStyleSheet(TP.documentGetBody(document).style.color);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is a 'stylesheet'
     *     object.
     * @todo
     */

    if (TP.notValid(anObj)) {
        return false;
    }

    return ((anObj.parentStyleSheet !== undefined) &&
            (anObj.ownerNode !== undefined));
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isSVGNode',
function(anObj) {

    /**
     * @name isSVGNode
     * @synopsis Returns true if the object provided is an SVG node.
     * @param {Object} anObj The Object to test.
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
     * @name isTextNode
     * @synopsis Returns true if the object provided is an XML or HTML Text node
     *     (Node.TEXT_NODE).
     * @param {Object} anObj The Object to test.
     * @example Test what's a text node and what's not:
     *     <code>
     *          TP.isTextNode(document.documentElement);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is an Text node.
     * @todo
     */

    return TP.isValid(anObj) && anObj.nodeType === Node.TEXT_NODE;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isXHTMLDocument',
function(anObj) {

    /**
     * @name isXHTMLDocument
     * @synopsis Returns true if the object provided is an XHTML document.
     * @param {Object} anObj The Object to test.
     * @returns {Boolean} Whether or not the supplied object is an XHTML
     *     document.
     */

    var testElem;

    //  Check to make sure its some sort of DOCUMENT_NODE first.
    if (TP.notValid(anObj) || anObj.nodeType !== Node.DOCUMENT_NODE) {
        return false;
    }

    //  We may have already been through the test below and captured that
    //  value, so return it if we have.
    if (TP.isDefined(anObj.isXHTML)) {
        return anObj.isXHTML;
    }

    //  If the document doesn't have a Window, then we check to see if the
    //  document element is 'html' - in which case, we can still think of it
    //  as XHTML.
    if (TP.notValid(anObj.defaultView)) {
        return anObj.documentElement.tagName === 'html';
    }

    if (anObj.documentElement.tagName !== 'html') {
        return false;
    }

    //  Now the problem is that, since the DOM for both XML and XHTML
    //  Document objects are so similar, we need a more in-depth test. We
    //  try to insert a piece of markup via 'innerHTML'. This markup is
    //  intentionally 'malformed' from an XML perspective (which will cause
    //  the call to throw an exception), but not from an HTML perspective.

    testElem = anObj.createElement('span');
    if (TP.isElement(anObj.body)) {
        anObj.body.appendChild(testElem);
    } else {
        anObj.documentElement.appendChild(testElem);
    }

    try {
        testElem.innerHTML = '<p>This has no closing tag';

        anObj.isXHTML = false;
    } catch (e) {
        anObj.isXHTML = true;
    } finally {
        testElem.parentNode.removeChild(testElem);
    }

    return anObj.isXHTML;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isXHTMLNode',
function(anObj) {

    /**
     * @name isXHTMLNode
     * @synopsis Returns true if the object provided is an XHTML node.
     * @param {Object} anObj The Object to test.
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
     * @name isXMLDocument
     * @synopsis Returns true if the object provided is an XML document.
     * @param {Object} anObj The Object to test.
     * @example Test what's an xml document and what's not:
     *     <code>
     *          newXMLDoc = TP.doc('<foo/>');
     *          TP.isXMLDocument(newXMLDoc);
     *          <samp>true</samp>
     *          TP.isXMLDocument(top.document);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not the supplied object is an XML document.
     * @todo
     */

    //  Check to make sure its some sort of DOCUMENT_NODE first.
    if (TP.notValid(anObj) || anObj.nodeType !== Node.DOCUMENT_NODE) {
        return false;
    }

    return !TP.isHTMLDocument(anObj);
});

//  ------------------------------------------------------------------------
//  TP.isXHR() defined in TIBETPrimitivesPlatform.js
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  TP.isXMLNode() defined in TIBETPrimitivesPlatform.js
//  ------------------------------------------------------------------------

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
     * @name isEmpty
     * @synopsis Returns true if the object provided is 'empty' meaning it may
     *     be 'invalid' or have a size, length, or empty attribute which defines
     *     it as having zero-length content.
     * @description A common error is using TP.isEmpty() to test a return value
     *     which is a Node. This will return varying results depending on how
     *     many childNodes the Node has. Use TP.isValid() to test whether a node
     *     exists, then use TP.isEmpty() to test for children.
     * @param {Object} anObj The Object to test.
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
     * @todo
     */

    var val,
        type;

    if (TP.notValid(anObj)) {
        return true;
    }

    type = typeof(anObj);

    //  have to be careful here because of IE and its failure to support
    //  toString() on certain node objects
    if (type === 'string') {
        //  Make sure to use a '===' test here since if anObj is false, 0,
        //  null, undefined, etc. a '==' test could actually succeed.
        return anObj === '';
    }

    //  if its either a boolean or a number, it can't be empty.
    if ((type === 'boolean') || (type === 'number')) {
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
        return (TP.notValid(anObj.value) || (anObj.value === ''));
    }

    //  If the object is a DOM Node, then its empty if it has no child
    //  nodes.
    if (TP.isNode(anObj)) {
        return anObj.childNodes.length === 0;
    }

    //  If something can respond to 'getSize', use it. This includes Arrays,
    //  TP.lang.Hashes and String.
    if (TP.canInvoke(anObj, 'getSize')) {
        try {
            return anObj.getSize() === 0;
        } catch (e) {
        }
    }

    //  If the object responds to 'get', see if we can get the value of a
    //  slot named 'empty'.
    if (TP.canInvoke(anObj, 'get')) {
        if (TP.isBoolean(val = anObj.get('empty'))) {
            return val;
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
     * @name ifEmpty
     * @synopsis Returns either aSuspectValue or aDefaultValue based on the
     *     state of aSuspectValue. If aSuspectValue TP.isEmpty() aDefaultValue
     *     is returned.
     * @param {Object} aSuspectValue The value to test.
     * @param {Object} aDefaultValue The value to return if test passes.
     * @example Set the value of theObj to 'Hi there', if anObj is empty:
     *     <code>
     *          theObj = TP.ifEmpty(anObj, 'Hi there');
     *     </code>
     * @returns {Object} One of the two values provided.
     * @todo
     */

    return TP.isEmpty(aSuspectValue) ? aDefaultValue : aSuspectValue;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('notEmpty',
function(anObj) {

    /**
     * @name notEmpty
     * @synopsis Returns true if the object provided is not 'empty' meaning it
     *     must be a valid object with a size, length, or empty attribute which
     *     defines it as having content.
     * @description A common error is using TP.notEmpty() to test a return value
     *     which is a Node. This will return varying results depending on how
     *     many childNodes the Node has. Use TP.isValid() to test whether a node
     *     exists, then use TP.notEmpty() to test for children.
     * @param {Object} anObj The Object to test.
     * @example See the TP.isEmpty() method for examples on 'emptiness'.
     * @returns {Boolean} True if the object has content size > 0.
     */

    return !TP.isEmpty(anObj);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('ifNaN',
function(aSuspectValue, aDefaultValue) {

    /**
     * @name ifNaN
     * @synopsis Returns either aSuspectValue or aDefaultValue based on the
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
     * @todo
     */

    return TP.isNaN(aSuspectValue) === true ? aDefaultValue : aSuspectValue;
});

//  ------------------------------------------------------------------------
//  BLANK (WHITESPACE) ONLY
//  ------------------------------------------------------------------------

TP.definePrimitive('ifBlank',
function(aSuspectValue, aDefaultValue) {

    /**
     * @name ifBlank
     * @synopsis Returns either aSuspectValue or aDefaultValue based on the
     *     state of aSuspectValue. If aSuspectValue TP.isBlank() aDefaultValue
     *     is returned.
     * @param {Object} aSuspectValue The value to test.
     * @param {Object} aDefaultValue The value to return if test passes.
     * @example Set the value of theObj to 'Hi there', if anObj is blank:
     *     <code>
     *          theObj = TP.ifBlank(anObj, 'Hi there');
     *     </code>
     * @returns {Object} One of the two values provided.
     * @todo
     */

    return TP.isBlank(aSuspectValue) ? aDefaultValue : aSuspectValue;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isBlank',
function(anObj) {

    /**
     * @name isBlank
     * @synopsis Returns true if the object is blank. Typically this method is
     *     applied to strings to test whether they are empty or have only
     *     whitespace as content. All other objects return the same result as
     *     testing them with isEmpty. NOTE that for nodes this also will return
     *     true if the node is a text node whose content is empty or whitespace.
     * @param {Object} anObj Typically a string being tested to see if it is
     *     empty or contains only whitespace.
     * @returns {Boolean} True if the object is blank.
     */

    if ((anObj === null) || (anObj === undefined)) {
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
     * @name notBlank
     * @synopsis Returns true if the object provided is not blank meaning it
     *     must be a String containing at least one non-whitespace character or
     *     an object which is notEmpty.
     * @param {Object} anObj The Object to test.
     * @returns {Boolean} True if the object is not blank/empty.
     */

    return !TP.isBlank(anObj);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('isClosed',
function(anObj) {

    /**
     * @name isClosed
     * @synopsis Returns true if the object provided is a window (or control)
     *     that is closed, or resides in one. This is only relevant for window
     *     and DOM objects.
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
     * @name $getOwnKeys
     * @synopsis Returns an Array of the 'own keys' for the supplied object.
     *     These are keys for which the object has a unique value.
     * @param {Object} anObject The object to obtain the keys for.
     * @returns {Array} An Array of the supplied Object's own keys.
     * @todo
     */

    var keys,
        ownKeys,
        len,
        i,
        key;

	if (TP.notValid(anObject)) {
		return this.raise('InvalidParameter', arguments);
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
     * @name asString
     * @synopsis Returns the receiver as a human-readable string. This is the
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
     * @todo
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
    }
    catch (e) {
    }

    /* jshint -W009 */
    arr = new Array();
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
    }
    catch (e) {
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
     * @name pad
     * @synopsis Right or left pads the string with the character provided to
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
     * @todo
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
        //  Make sure to 'toString()' ourself, so that we don't get an Array
        //  of characters ('new' for Firefox 2.0).
        return this.toString();
    }

    theChar = TP.ifInvalid(aChar, TP.DEFAULT_STRPAD);
    theSide = TP.ifInvalid(aSide, TP.LEFT);

    arr = TP.ac();
    count = theSize - this.length;

    for (i = 0; i < count; i++) {
        arr[i] = theChar;
    }

    //  Make sure to 'toString()' ourself, so that we don't get an Array
    //  of characters ('new' for Firefox 2.0).
    return (theSide === TP.LEFT) ?
                arr.join('') + this.toString() :
                this.toString() + arr.join('');
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('startsWith',
function(aPrefix) {

    /**
     * @name startsWith
     * @synopsis Returns true if the receiver begins with the prefix provided.
     * @param {String} aPrefix A String containing the characters to test.
     * @returns {Boolean}
     */

    return this.indexOf(aPrefix) === 0;
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asCamelCase',
function() {

    /**
     * @name asCamelCase
     * @synopsis Returns a new string with the initial character of each word,
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
     * @name asHyphenated
     * @synopsis Returns a new string with each uppercase character in lower
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
     * @name asStartLower
     * @synopsis Returns a new string with the initial character in lower case.
     *     No other transformation is performed.
     * @returns {String}
     */

    return this.charAt(0).toLowerCase() + this.slice(1);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asStartUpper',
function() {

    /**
     * @name asStartUpper
     * @synopsis Returns a new string with the initial character in upper case.
     *     No other transformation is performed.
     * @returns {String}
     */

    return this.charAt(0).toUpperCase() + this.slice(1);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('asTitleCase',
function() {

    /**
     * @name asTitleCase
     * @synopsis Returns a new string with the initial character of each word,
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
     * @name asUnderscored
     * @synopsis Returns a new string with each uppercase character in lower
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
     * @name trim
     * @synopsis Returns a new string with the contents of the receiver after
     *     having stripped leading and trailing whitespace.
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
     * @name asTimestamp
     * @synopsis Returns the date as a timestamp. A string of the form
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
     * @todo
     */

    var s,
        p,
        inD,
        inM;

    p = TP.DEFAULT_NUMPAD;

    inD = TP.isBoolean(includeDate) ? includeDate : true;
    inM = TP.isBoolean(includeMillis) ? includeMillis : true;

    s = (inD) ? this.getFullYear().toString().pad(4, p) +
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
function () {

    /**
     * @name changed
     * @synopsis Notifies observers that some aspect of the receiver has
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
     * @signals Change
     * @todo
     */

    //  This early version does nothing.
    return this;
});

//  ------------------------------------------------------------------------

var func = function(aFlag) {

    /**
     * @name shouldSignalChange
     * @synopsis Defines whether the receiver should actively signal change
     *     notifications.
     * @description In general objects do not signal changes when no observers
     *     exist. This flag is triggered by observe where the signal being
     *     observed is a form of Change signal to "arm" the object for change
     *     notification. You can also manipulate it during multi-step
     *     manipulations to signal only when a series of changes has been
     *     completed.
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
     *          <var>TP.sig.ValueChange @ Array_1119524bba7cc3127febfb45</var>
     *     </code>
     * @returns {Boolean} The current status.
     * @todo
     */

    if (TP.isBoolean(aFlag)) {
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
     * @name expireContentCaches
     * @synopsis When true, TIBET will invalidate all caches used during content
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
var func = function(attributeName) {

    /**
     * @name $get
     * @synopsis The most primitive wrapper for attribute retrieval. This method
     *     is supplied to allow overriding of the primitive operation aspects of
     *     'get' and to provide true getters with a way to access the low-level
     *     slot without any recursion. As with other accessors this method
     *     ignores DNUs.
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

//  ------------------------------------------------------------------------

//  stub for early calls, replaced later in kernel

//  Add it as a 'meta inst method' to all of the objects managed by
//  meta-methods.
var func = function(attributeName, attributeValue) {

    /**
     * @name $set
     * @synopsis Assigns the value attributeValue to the storage location for
     *     attributeName. Later in the kernel a version of $set is installed
     *     that manages change notification etc. We stub in to cover the case
     *     where a config method may be called prior to that during bootup.
     * @param {String} attributeName The slot name to receive data.
     * @param {Object} attributeValue The value to assign.
     * @returns {Object} The receiver.
     * @addon Object
     * @todo
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

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldAllowDuplicateInterests',
function(aFlag, shouldSignal) {

    /**
     * @name shouldAllowDuplicateInterests
     * @synopsis Controls and returns the state of TIBET's interest duplicate
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
     * @todo
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
     * @name $$shouldCacheDeepSubtypes
     * @synopsis Controls and returns the state of the 'deep subtype cache'
     *     flag. When true TIBET will cache the values build from getting deep
     *     lists of subtypes. Normally true.
     * @param {Boolean} aFlag Turn behavior on or off? Default is true.
     * @example Configure TIBET to not cache deep subtype data:
     *     <code>
     *          TP.sys.$$shouldCacheDeepSubtypes(false);
     *          <samp>false</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET caches deep subtype data.
     * @todo
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
     * @name shouldCaptureErrors
     * @synopsis Controls and returns the value of the error forwarding flag.
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
     * @todo
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
     * @name shouldEmbedProgress
     * @synopsis Controls and returns the value of the progress format flag.
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
     * @todo
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
     * @name shouldIgnoreViaFlag
     * @synopsis Controls and returns TIBET's signal interest removal flag.
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
     * @todo
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
     * @name $$shouldInvokeInferences
     * @synopsis Controls and returns the state of TIBET's 'invoke inferences'
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
     * @todo
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
     * @name shouldLogActivities
     * @synopsis Controls and returns the state of the 'log activity' flag.
     * @description This flag determines whether calls to log actually log. Note
     *     that turning on other log status flags won't automatically turn on
     *     the log activity flag. The activity log is the 'meta log' capturing
     *     log data from all the other TIBET logs and providing support for
     *     TRACE, INFO, and SYSTEM messaging. Note that the logging level may
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
     * @todo
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
     * @name shouldLogConsoleSignals
     * @synopsis Controls and returns the state of TIBET's 'log console signals'
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
     * @todo
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
     * @name shouldLogCSS
     * @synopsis Controls and returns the state of the CSS logging flag.
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
     * @todo
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
     * @name shouldLogDOMFocusSignals
     * @synopsis Controls and returns the state of the DOM focus logging flag.
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
     * @todo
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
     * @name shouldLogDOMLoadedSignals
     * @synopsis Controls and returns the state of the DOMLoaded logging flag.
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
     * @todo
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
     * @name shouldLogErrors
     * @synopsis Controls and returns the value of the error log flag.
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
     * @todo
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
     * @name shouldLogInferences
     * @synopsis Controls and returns the state of TIBET's 'log inferences'
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
     * @todo
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
     * @name shouldLogIO
     * @synopsis Controls and returns the state of the IO logging flag.
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
     * @todo
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
     * @name shouldLogJobs
     * @synopsis Controls and returns the state of the job logging flag.
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
     * @todo
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
     * @name shouldLogKeys
     * @synopsis Controls and returns the state of TIBET's key logging flag.
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
     * @todo
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
     * @name shouldLogLinks
     * @synopsis Controls and returns the state of TIBET's link logging flag.
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
     * @todo
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
     * @name shouldLogLoadSignals
     * @synopsis Controls and returns the state of TIBET's 'log load signals'
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
     * @todo
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
     * @name shouldLogNullNamespaces
     * @synopsis Controls and returns the state of TIBET's null namespace
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
     * @todo
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
     * @name shouldLogRaise
     * @synopsis Controls and returns the value of the raise log flag.
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
     * @todo
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
     * @name shouldLogRequestSignals
     * @synopsis Controls and returns the state of TIBET's 'log request signals'
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
     * @todo
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
     * @name shouldLogSecurity
     * @synopsis Controls and returns the state of TIBET's 'log security' flag.
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
     * @todo
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
     * @name shouldLogSignals
     * @synopsis Controls and returns the state of TIBET's 'log signals' flag.
     * @description This flag tells TIBET whether, when the signaling machinery
     *     is invoked, it should log signals.
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
     * @todo
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
     * @name shouldLogSignalStack
     * @synopsis Controls and returns the state of TIBET's 'log signal stack'
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
     * @todo
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
     * @name shouldLogStack
     * @synopsis Controls and returns the value of the error log stack flag.
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
     * @todo
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.stack', aFlag, shouldSignal || false);
    }

    return TP.sys.cfg('log.stack');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogStackArguments',
function(aFlag, shouldSignal) {

    /**
     * @name shouldLogStackArguments
     * @synopsis Controls and returns the value of the error log stack argument
     *     logging flag.
     * @description When logging stack traces TIBET can include argument string
     *     values to assist with debugging, but this can be expensive and
     *     verbose, so we normally turn it off via this flag.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to log stack arguments:
     *     <code>
     *          TP.sys.shouldLogStackArguments(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET logs the error log stack when
     *     logging errors in the system.
     * @todo
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('log.stack_arguments', aFlag, shouldSignal);
    }

    return TP.sys.cfg('log.stack_arguments');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldLogStackFileInfo',
function(aFlag, shouldSignal) {

    /**
     * @name shouldLogStackFileInfo
     * @synopsis Controls and returns the value of the file information stack
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
     * @todo
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
     * @name shouldLogTransforms
     * @synopsis Controls and returns the value of the content transform logging
     *     flag.
     * @description This flag determines whether the content processing system
     *     should log tranformation steps. The logging of this data occurs at
     *     TRACE level so TP.sys.setLogLevel() must be set to TRACE to capture
     *     the output in the logs.
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
     * @todo
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
     * @name shouldLogTSHSignals
     * @synopsis Controls and returns the state of the TSH signal logging flag.
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
     * @todo
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
     * @name shouldLogUserIOSignals
     * @synopsis Controls and returns the state of the User IO logging flag.
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
     * @todo
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
     * @name shouldLogXPaths
     * @synopsis Controls and returns the value of the XPath query logging flag.
     * @description This flag determines whether XPaths should be output to the
     *     activity log, which can help with performance tuning. The logging of
     *     this data occurs at TRACE level so TP.sys.setLogLevel() must be set
     *     to TRACE to capture the output in the logs.
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
     * @todo
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
     * @name shouldQueueLoadSignals
     * @synopsis Controls and returns the value of the queue load signal flag.
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
     * @todo
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
     * @name shouldProcessCSS
     * @synopsis Controls and returns TIBET's CSS Processor.
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
     * @todo
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
     * @name shouldRegisterLoggers
     * @synopsis Controls and returns TIBET's registration policy flag.
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
     * @todo
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
     * @name shouldReportParseErrors
     * @synopsis Controls and returns TIBET's DOM parsing report flag.
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
     * @todo
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
     * @name shouldRequestPrivileges
     * @synopsis Controls and returns TIBET's privilege request flag, which is
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
     * @todo
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
     * @name shouldSignalDOMLoaded
     * @synopsis Controls and returns TIBET's DOMLoaded signal flag.
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
     * @todo
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
     * @name shouldSignalDOMFocusSignals
     * @synopsis Controls and returns the state of the DOM focus signaling flag.
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
     * @todo
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('signal.dom_focus_signals', aFlag, shouldSignal);
    }

    return TP.sys.cfg('signal.dom_focus_signals');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldSignalLogChange',
function(aFlag, shouldSignal) {

    /**
     * @name shouldSignalLogChange
     * @synopsis Controls and returns TIBET's LogChange signal flag. TIBET's
     *     tools alter this flag when they want to interactively display the log
     *     as it changes.
     * @param {Boolean} aFlag Turn behavior on or off? Default is false.
     * @param {Boolean} shouldSignal False to turn off configuration change
     *     signaling for this call.
     * @example Configure TIBET to signal LogChange to help tool display. (You
     *     realize you shouldn't do this right? ;))
     *     <code>
     *          TP.sys.shouldSignalLogChange(true);
     *          <samp>true</samp>
     *     </code>
     * @returns {Boolean} Whether or not TIBET signals *LogChange when the
     *     activity log (or a subset of it) changes.
     * @todo
     */

    if (TP.isBoolean(aFlag)) {
        TP.sys.setcfg('signal.log_change', aFlag, shouldSignal);
    }

    return TP.sys.cfg('signal.log_change');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('shouldThrowEvaluations',
function(aFlag, shouldSignal) {

    /**
     * @name shouldThrowEvaluations
     * @synopsis Controls and returns the state of TIBET's flag for shell
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
     * @todo
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
     * @name shouldThrowExceptions
     * @synopsis Controls and returns the state of TIBET's flag for exception
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
     * @todo
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
     * @name shouldThrowHandlers
     * @synopsis Controls and returns the state of TIBET's flag for handler
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
     * @todo
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
     * @name shouldTrackJobStats
     * @synopsis Controls and returns the state of TIBET's job statistics
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
     * @todo
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
     * @name shouldTrackSignalStats
     * @synopsis Controls and returns the state of TIBET's signaling statistics
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
     * @todo
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
     * @name shouldTrapRecursion
     * @synopsis Controls and returns the flag defining whether TIBET should
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
     * @todo
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
     * @name shouldUniqueTypes
     * @synopsis Controls and returns the state of TIBET's type uniquing flag.
     * @description When true, TIBET will not recreate types in the defineSubtype
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
     * @todo
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
     * @name $$shouldUseBackstop
     * @synopsis Controls and returns the state of TIBET's backstop.
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
     * @todo
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
     * @name shouldUseContentCheckpoints
     * @synopsis Controls and returns the state of TIBET's content checkpointing
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
     * @todo
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
     * @name shouldUseContentCaches
     * @synopsis Controls and returns the state of the content file cache flag.
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
     * @todo
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
     * @name shouldUseDebugger
     * @synopsis Controls and returns the state of TIBET's 'debugger' flag.
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
     * @todo
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
     * @name $$shouldUseInferencing
     * @synopsis Controls and returns the state of TIBET's 'inferencing' flag.
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
     * @todo
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

TP.sys.defineMethod('checkVersion',
function(logDetails) {

    /**
     * @name checkVersion
     * @synopsis Checks whether the current kernel version is the latest
     *     available version by comparing the version ID against the latest
     *     published TIBET kernel build ID.
     * @description This method expects to find a file at the location pointed
     *     to by '~lib_version_file' with the following content:
     *
     *     versionCheck({'$LATEST_HASH': <buildHash>,
     *                      '$LATEST_NAME': <buildName>,
     *                      '$LATEST_MAJOR': <buildVersionMajor>,
     *                      '$LATEST_MINOR': <buildVersionMinor>,
     *                      '$LATEST_STATE': <buildVersionState>,
     *                      '$LATEST_DATE': <buildDate>,
     *                      '$LATEST_URL':<buildURL>})
     *
     *
     * @param {Boolean} logDetails If true, details about new versions will be
     *     written to the TIBET activity log and an 'TP.sig.UpdateAvailable'
     *     signal using TP.sys as the origin is fired.
     */

    var path,
        show,
        current,
        callback;

    path = TP.uriExpandPath('~lib_version_file');

    //  if true this will cause the manifest to be dumped to the console
    show = TP.ifInvalid(logDetails, false);

    //  get the version identifier
    current = TP.sys.getVersionHash();

    TP.ifTrace() ?
        TP.trace('Checking version ' + current + ' for updates.',
            TP.LOG, arguments) : 0;

    //  build up a callback function that'll handle the work once the
    //  actual call is complete
    callback = function(resultData) {

        var hash,
            name,
            major,
            minor,
            state,
            date,
            url;

        //  first callback (this one) wants the $LATEST_HASH if
        //  provided...
        if (TP.isString(hash = resultData.at('$LATEST_HASH'))) {

            if (hash === current) {
                //  this build is up to date...
                TP.ifTrace() ?
                    TP.trace('Current version ' + current + ' is latest.',
                            TP.LOG, arguments) : 0;

                return;
            }

            TP.ifTrace() ? TP.trace(
                        'Latest version is version ' + hash + '.',
                        TP.LOG, arguments) : 0;

            if (TP.isTrue(show)) {
                if (TP.notEmpty(name = resultData.at('$LATEST_NAME'))) {
                    TP.ifTrace() ?
                        TP.trace('Latest version name for ' +
                                    hash + ': ' + name + '\n',
                                TP.LOG, arguments) : 0;
                }
                if (TP.notEmpty(major = resultData.at('$LATEST_MAJOR'))) {
                    TP.ifTrace() ?
                        TP.trace('Latest version major for ' +
                                    hash + ': ' + major + '\n',
                                TP.LOG, arguments) : 0;
                }
                if (TP.notEmpty(minor = resultData.at('$LATEST_MINOR'))) {
                    TP.ifTrace() ?
                        TP.trace('Latest version minor for ' +
                                    hash + ': ' + minor + '\n',
                                TP.LOG, arguments) : 0;
                }
                if (TP.notEmpty(state = resultData.at('$LATEST_STATE'))) {
                    TP.ifTrace() ?
                        TP.trace('Latest version state for ' +
                                    hash + ': ' + state + '\n',
                                TP.LOG, arguments) : 0;
                }
                if (TP.notEmpty(date = resultData.at('$LATEST_DATE'))) {
                    TP.ifTrace() ?
                        TP.trace('Latest version date for ' +
                                    hash + ': ' + date + '\n',
                                TP.LOG, arguments) : 0;
                }
                if (TP.notEmpty(url = resultData.at('$LATEST_URL'))) {
                    TP.ifTrace() ?
                        TP.trace('Latest version url for ' +
                                    hash + ': ' + url + '\n',
                                TP.LOG, arguments) : 0;
                }
            }

            TP.sys.signal(
                'TP.sig.UpdateAvailable',
                arguments,
                TP.hc('hash', hash, 'name', name,
                        'major', major, 'minor', minor,
                        'state', state, 'date', date,
                        'url', url));
        } else {
            TP.ifWarn() ?
                TP.warn('Unable to access ' + path + ' for version data.',
                        TP.LOG, arguments) : 0;

            TP.ifTrace() ?
                TP.trace('Assuming version ' + TP.sys.getVersionHash() +
                            ' is current.',
                        TP.LOG, arguments) : 0;
        }
    };

    //  fire off the call
    try {
        //  typically this is the TIBET web site, but it could be one for
        //  the current application/product instead. NOTE the use of a
        //  jsonpCall here to avoid single-domain restrictions...yeah, it's
        //  a security issue, but no, the browsers are never going to close
        //  it because then how would all those ad servers work? ;)

        //  Note the hardcoded 'versionCheck' callback function name. This
        //  is to avoid having to have anything more than a file with the
        //  content as described in the method discussion above - no CGI
        //  necessary to read the 'callback=' parameter, etc. etc.
        TP.jsonpCall(path, callback, 'versionCheck', null, null, false);
    } catch (e) {
        TP.ifError() ? TP.error(TP.ec(e, 'Unable to access ' + path),
                                TP.LOG, arguments) : 0;

        TP.ifTrace() ? TP.trace('Assuming version ' +
                    TP.sys.getVersionHash() + ' is current.',
                    TP.LOG, arguments) : 0;
    }
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getVersionDate',
function() {

    /**
     * @name getVersionDate
     * @synopsis Returns the value of the version datestamp for this kernel.
     * @returns {String} The version datestamp of this kernel.
     */

    return TP.sys.$VERSION_DATE;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getVersionHash',
function() {

    /**
     * @name getVersionHash
     * @synopsis Returns the build ID for this version of the kernel. This is a
     *     unique identifier identifying the build (usually a Git hash
     *     identifier).
     * @returns {String} The build ID of this kernel.
     */

    return TP.sys.$VERSION_HASH;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getVersionName',
function() {

    /**
     * @name getVersionName
     * @synopsis Returns the value of the version name for this kernel.
     * @returns {String} The version name of this kernel.
     */

    return TP.sys.$VERSION_NAME;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getVersionNumber',
function() {

    /**
     * @name getVersionNumber
     * @synopsis Returns the value of the version number for this kernel.
     * @returns {String} The version number of this kernel.
     */

    return TP.sys.$VERSION_MAJOR + '.' + TP.sys.$VERSION_MINOR;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getVersionState',
function() {

    /**
     * @name getVersionState
     * @synopsis Returns the value of the version state (beta, rc, final, etc.)
     *     for this kernel.
     * @returns {String} The version state of this kernel.
     */

    return TP.sys.$VERSION_STATE;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getVersionString',
function() {

    /**
     * @name getVersionString
     * @synopsis Returns the value of the version identification data for this
     *     kernel as a string.
     * @returns {String} The version string identifier of this kernel.
     */

    var str;

    if (TP.isEmpty(str = TP.sys.$VERSION_STRING)) {
        str = TP.sys.getVersionNumber() + ' ' +
                TP.sys.getVersionState() + ' ' +
                'Built on: ' + TP.sys.getVersionDate() +
                ' (' + TP.sys.getVersionName() + ')';

        TP.sys.$VERSION_STRING = str;
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
     * @name getRuntimeInfo
     * @synopsis Returns an object containing current environmental data
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
     * @todo
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
     * @name getSTATUS
     * @synopsis Returns the global $STATUS flag setting. This method provides a
     *     get() accessible interface to that global.
     * @returns {Number} A status code. Currently TP.SUCCESS/TP.FAILURE.
     */

    return $STATUS;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('setLogLevel',
function(aLevel) {

    /**
     * @name setLogLevel
     * @synopsis Sets the level at which log() calls will filter output.
     * @param {Number|TP.sig.Signal} aLevel A 'logging level number' (see above)
     *     or a TIBET signal type of TRACE, INFO, WARN, ERROR, SEVERE, FATAL, or
     *     SYSTEM. Note that while these signals operate in a leveled scheme,
     *     only WARN thru FATAL are actually TP.sig.Exceptions.
     * @example Set TIBET's current 'log level', using a log level number:
     *     <code>
     *          TP.sys.setLogLevel(1);
     *          <samp>INFO</samp>
     *     </code>
     * @example Set TIBET's current 'log level', using a log level TIBET type
     *     object:
     *     <code>
     *          TP.sys.setLogLevel(INFO);
     *          <samp>INFO</samp>
     *     </code>
     * @returns {Number} The numerical error level set.
     * @todo
     */

    var level,
        oldVal;

    if (TP.notValid(aLevel)) {
        return;
    }

    //  could actually be set via WARN etc.
    if (TP.isNumber(aLevel)) {
        level = aLevel;
    } else if (TP.canInvoke(aLevel, 'get')) {
        level = aLevel.get('level');
    } else {
        //  might be a string, try a couple of options
        if (TP.notValid(level = TP['$' + aLevel.toUpperCase()])) {
            level = TP[aLevel.toUpperCase()];
            if (!TP.isNumber(level)) {
                level = null;
            }
        }
    }

    //  still null? level wasn't valid
    if (TP.notValid(level)) {
        return;
    }

    oldVal = TP.sys.cfg('log.level');

    if (oldVal !== level) {
        TP.sys.setcfg('log.level', level);
        TP.sys.changed('LogLevel',
                        TP.UPDATE,
                        TP.hc(TP.OLDVAL, oldVal, TP.NEWVAL, level));
    }

    return TP.sys.cfg('log.level');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('setSTATUS',
function(aStatusCode) {

    /**
     * @name setSTATUS
     * @synopsis Controls the global $STATUS flag setting. This method provides
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
TP.sys.$httpBased = (window.location.protocol.indexOf('file') !== 0);

TP.sys.$scheme = window.location.protocol;
TP.sys.$pathname = decodeURI(window.location.pathname);

if (TP.sys.$httpBased) {
    TP.sys.$host = window.location.hostname;
    TP.sys.$port = (TP.isEmpty(window.location.port) ||
                    TP.notValid(window.location.port)) ?
                    80 : window.location.port;
} else {
    TP.sys.$host = '';
    TP.sys.$port = '';
}

//  ------------------------------------------------------------------------

TP.sys.defineMethod('isHTTPBased',
function() {

    /**
     * @name isHTTPBased
     * @synopsis Returns true if the TIBET codebase was loaded via HTTP.
     * @returns {Boolean} Whether or not the TIBET codebase was loaded over
     *     HTTP.
     */

    return TP.sys.$httpBased;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getLaunchRoot',
function() {

    /**
     * @name getLaunchRoot
     * @synopsis Returns the "launch root", either the web server's root or the
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
     * @todo
     */

    var str,
        port;

    if (TP.sys.isHTTPBased()) {
        //  on http uris you need the host:port portion as a root
        str = TP.sys.getScheme() + '//' + TP.sys.getHost();
        if (TP.isValid(port = TP.sys.getPort()) &&
            (port.toString() !== '80')) {
            str += ':' + port;
        }
    } else if (TP.boot.isWin()) {
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
     * @name getHost
     * @synopsis Returns the hostname from which TIBET was loaded.
     * @returns {String} The host from which TIBET was loaded.
     */

    return TP.sys.$host;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getPathname',
function() {

    /**
     * @name getPathname
     * @synopsis Returns the pathname from which TIBET was loaded.
     * @returns {String} The pathname from which TIBET was loaded.
     */

    return TP.sys.$pathname;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getPort',
function() {

    /**
     * @name getPort
     * @synopsis Returns the port number string from which TIBET was loaded. If
     *     no port number was specified in the load URL this string is empty.
     * @returns {Number} The port number from which TIBET was loaded.
     */

    return TP.sys.$port;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getScheme',
function() {

    /**
     * @name getScheme
     * @synopsis Returns the scheme used when TIBET was loaded. This is
     *     typically http or https which allows TIBET to determine if a secure
     *     connection is required as the default for future connections to the
     *     server.
     * @returns {String} The scheme used when TIBET was loaded.
     * @todo
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
     * @name getSourceLanguage
     * @synopsis Returns the current source 'lang', the language most source
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
     * @todo
     */

    return TP.sys.cfg('tibet.sourcelang',
                        TP.sys.env('tibet.xmllang', 'en-us'));
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getTargetLanguage',
function() {

    /**
     * @name getTargetLanguage
     * @synopsis Returns the target 'lang', the user's targeted language
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
     * @todo
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
     * @name getSourceLanguage
     * @synopsis Returns the current source 'lang', the language most source
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
     * @todo
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
     * @name getProfile
     * @synopsis Returns the current boot profile, such as 'development',
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
     * @name getState
     * @synopsis Returns the current state, which is an application-specific
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
     * @name isExiting
     * @synopsis Controls and returns the state of the exiting flag, which is
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
     * @name isOffline
     * @synopsis Controls and returns the state of the online/offline flag.
     * @description This is set automatically to false when the launch was from
     *     a file:// url. You can still force it back to true if you start
     *     accessing HTTP urls later in your session. Note that the HTML5
     *     'online/offline' events have been wired to set this flag as well.
     * @description This flag determines which key is used when performing URI
     *     resolution.
     * @param {Boolean} aFlag True means we're "offline".
     * @returns {Boolean} Whether or not TIBET is currently running in "offline"
     *     mode.
     * @todo
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
     * @name getEffectiveUser
     * @synopsis Returns the effective user, the user instance for which all
     *     operations are being filtered at the time of this call.
     * @example Get TIBET's current 'effective user':
     *     <code>
     *          TP.sys.getEffectiveUser();
     *          <samp>bedney</samp>
     *     </code>
     * @returns {TP.core.User} The effective TP.core.User instance, if there is
     *     one.
     * @todo
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
     * @name getRealUser
     * @synopsis Returns the "real" user, the user instance that was the initial
     *     instance constructed during login/session creation.
     * @example Get TIBET's current 'real user':
     *     <code>
     *          TP.sys.getRealUser();
     *          <samp>bedney</samp>
     *     </code>
     * @returns {TP.core.User} The real TP.core.User instance, if there is one.
     * @todo
     */

    var type;

    if (TP.isType(type = TP.sys.require('TP.core.User'))) {
        return type.getRealUser();
    }

    return;
});

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

//  ---

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
