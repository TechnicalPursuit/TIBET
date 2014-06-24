//  ========================================================================
/*
NAME:   TPTestHarness.js
AUTH:   Scott Shattuck (ss)
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
A general-purpose test harness for TIBET and TIBET applications.
*/

/* global AssertionFailed:true
*/

//  ------------------------------------------------------------------------
//  TIBET version 3.0 COMPATIBILITY API
//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('addLocalAttribute',
function(attributeName, attributeValue, hidden) {

    /**
     * @name addLocalAttribute
     * @synopsis Adds/defines a new local attribute for the receiver. The
     *     attribute gets a default value if provided. In the current release
     *     the other three parameters are ignored.
     * @param {String} attributeName
     * @param {Object} attributeValue The default value.
     * @param {Boolean} hidden True if the attribute should not be enumerable.
     * @returns {Object} The newly defined attribute value.
     * @todo
     */

    var track;

    if (this === TP.ObjectProto) {
        track = TP.LOCAL_TRACK;
    } else if (TP.isType(this)) {
        track = TP.TYPE_LOCAL_TRACK;
    } else {
        track = TP.INST_LOCAL_TRACK;
    }

    return TP.defineAttribute(
            this, attributeName, attributeValue, track, hidden);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('addLocalMethod',
function(methodName, methodBody, hidden, display) {

    /**
     * @name addLocalMethod
     * @synopsis Adds the method with name and body provided as a local method.
     *     Local methods are directly methods on the receiving instance. These
     *     methods differ from 'instance' methods in that the behavior is NOT
     *     inherited unless the owner object happens to serve as a prototype.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Boolean} hidden True if the method shouldn't be enumerated.
     * @param {String} display Optional string defining the public display name
     *     for the function.
     * @returns {Function} The installed method.
     * @todo
     */

    var track;

    if (this === TP.ObjectProto) {
        track = TP.LOCAL_TRACK;
    } else if (TP.isType(this)) {
        track = TP.TYPE_LOCAL_TRACK;
    } else {
        track = TP.INST_LOCAL_TRACK;
    }

    return TP.defineMethod(
            this, methodName, methodBody, track, hidden, display);
}, TP.INST_LOCAL_TRACK);

//  ------------------------------------------------------------------------

TP.defineMethod(TP.FunctionProto, 'addTypeMethod',
function(methodName, methodBody, hidden) {

    /**
     * @name addTypeMethod
     * @synopsis Adds the function with name and body provided as a type method.
     *     This is the root method since all other methods can be declared using
     *     this one.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Boolean} hidden True if the method should not be enumerable.
     * @returns {Function} The installed method.
     * @todo
     */

    return TP.defineMethod(
            this, methodName, methodBody, TP.TYPE_TRACK, hidden);
}, TP.TYPE_TRACK, false, 'FunctionProto.addTypeMethod');

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('addInstMethod',
function(methodName, methodBody, hidden) {

    /**
     * @name addInstMethod
     * @synopsis Adds the function with name and body provided as an instance
     *     method.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Boolean} hidden True if the method should not be enumerable.
     * @returns {Function} The installed method.
     * @todo
     */

    var target;

    //  if we're being asked to add an inst method directly to TP.FunctionProto
    //  then we consider it an instance method of Function instances
    if (this === TP.FunctionProto) {
        target = this;
    } else {
        target = this.prototype;
    }

    return TP.defineMethod(
            target, methodName, methodBody, TP.INST_TRACK, hidden, null, this);
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('addLocalMethod',
function(methodName, methodBody, hidden) {

    /**
     * @name addLocalMethod
     * @synopsis Adds the method with name and body provided as a local method.
     *     Local methods are methods on the receiving instance. These methods
     *     differ from 'instance' methods in that the behavior is NOT inherited
     *     although it can be leveraged by any object which does a copy
     *     operation on the receiver. These methods provide support for a
     *     pure-prototype programming model ala Self.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Boolean} hidden True if the method should not be enumerable.
     * @returns {Function} The installed method.
     * @todo
     */

    var track;

    if (this === TP.FunctionProto) {
        track = TP.LOCAL_TRACK;
    } else if (TP.isType(this)) {
        track = TP.TYPE_LOCAL_TRACK;
    } else {
        track = TP.LOCAL_TRACK;
    }

    return TP.defineMethod(
            this, methodName, methodBody, track, hidden);
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('addTypeAttribute',
function(attributeName, attributeValue, hidden) {

    /**
     * @name addTypeAttribute
     * @synopsis Adds/defines a new type attribute for the receiving type.
     * @param {String} attributeName
     * @param {Object} attributeValue The default value.
     * @param {Boolean} hidden True if the attribute should not be enumerable.
     * @returns {Object} The newly defined attribute value.
     * @todo
     */

    return TP.defineAttribute(
            this, attributeName, attributeValue, TP.TYPE_TRACK, hidden);
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('addInstAttribute',
function(attributeName, attributeValue, hidden) {

    /**
     * @name addInstAttribute
     * @synopsis Adds/defines a new instance attribute for the type. The
     *     attribute gets a default value if provided. In the current release
     *     the other three parameters are ignored.
     * @param {String} attributeName
     * @param {Object} attributeValue The default value.
     * @param {Boolean} hidden True if the attribute should not be enumerable.
     * @returns {Object} The newly defined attribute value.
     * @todo
     */

    return TP.defineAttribute(
            this.prototype, attributeName, attributeValue, TP.INST_TRACK,
            hidden);
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('addLocalAttribute',
function(attributeName, attributeValue, hidden) {

    /**
     * @name addLocalAttribute
     * @synopsis Adds/defines a new local attribute for the receiver. The
     *     attribute gets a default value if provided. In the current release
     *     the other three parameters are ignored.
     * @param {String} attributeName
     * @param {Object} attributeValue The default value.
     * @param {Boolean} hidden True if the attribute should not be enumerable.
     * @returns {Object} The newly defined attribute value.
     * @todo
     */

    return TP.defineAttribute(
            this, attributeName, attributeValue, TP.TYPE_LOCAL_TRACK, hidden);
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('addTypeConstant',
function(attributeName, attributeValue, hidden) {

    /**
     * @name addTypeConstant
     * @synopsis Adds/defines a new type constant for the receiver.
     * @param {String} attributeName The constant name.
     * @param {Object} attributeValue The constant value.
     * @param {Boolean} hidden True if the attribute should not be enumerable.
     * @returns {Object} The receiver.
     * @todo
     */

    return TP.defineConstant(
            this, attributeName, attributeValue, TP.TYPE_TRACK, hidden);
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('addInstConstant',
function(attributeName, attributeValue, hidden) {

    /**
     * @name addInstConstant
     * @synopsis Adds/defines a new instance constant for the receiver.
     * @param {String} attributeName The constant name.
     * @param {Object} attributeValue The constant value.
     * @param {Boolean} hidden True if the attribute should not be enumerable.
     * @returns {Object} The receiver.
     * @todo
     */

    return TP.defineConstant(
            this.prototype, attributeName, attributeValue, TP.INST_TRACK,
            hidden);
});

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('addLocalConstant',
function(attributeName, attributeValue, hidden) {

    /**
     * @name addLocalConstant
     * @synopsis Adds/defines a new local constant for the receiver.
     * @param {String} attributeName The constant name.
     * @param {Object} attributeValue The constant value.
     * @param {Boolean} hidden True if the attribute should not be enumerable.
     * @returns {Object} The receiver.
     * @todo
     */

    return TP.defineConstant(
            this, attributeName, attributeValue, TP.TYPE_LOCAL_TRACK, hidden);
});

//  ------------------------------------------------------------------------

TP.defineMethod(TP.lang.RootObject$$Type.prototype, 'addTypeMethod',
function(methodName, methodBody, hidden) {

    /**
     * @name addTypeMethod
     * @synopsis Adds the function with name and body provided as a type method.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Boolean} hidden True if the method should not be enumerable.
     * @returns {Object} The receiver.
     * @todo
     */

    var proto = this.$$Type.prototype;

    return TP.defineMethod(
            proto, methodName, methodBody, TP.TYPE_TRACK, hidden, null, this);
}, TP.TYPE_TRACK, false, 'RootObject.addTypeMethod');

//  ------------------------------------------------------------------------

TP.lang.RootObject.addTypeMethod('addInstMethod',
function(methodName, methodBody, hidden) {

    /**
     * @name addInstMethod
     * @synopsis Adds the method with name and body provided as an instance
     *     method.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Boolean} hidden True if the method should not be enumerable.
     * @returns {Object} The receiver.
     * @todo
     */

    var proto = this.$$Inst.prototype;

    return TP.defineMethod(
            proto, methodName, methodBody, TP.INST_TRACK, hidden, null, this);
});

//  ------------------------------------------------------------------------

Window.Type.defineMethod('addInstMethod',
function(methodName, methodBody, hidden) {

    /**
     * @name addInstMethod
     * @synopsis Adds the method with name and body provided as a instance
     *     method.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Boolean} hidden True if the method should not be enumerable.
     * @returns {Function} The installed method.
     * @todo
     */

    var display = 'Window.' + methodName;

    return TP.defineMethod(
            Window.prototype, methodName, methodBody, TP.INST_TRACK, hidden,
            display, Window);
});

//  ========================================================================
//  TP.lang.RootObject - PART II
//  ========================================================================

/*
Continuing development of the meta-object protocol.
*/

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('addTypeAttribute',
function(attributeName, attributeValue, hidden) {

    /**
     * @name addTypeAttribute
     * @synopsis Adds/defines a new type attribute for the receiving type. The
     *     attribute gets a default value if provided. In the current release
     *     the other three parameters are ignored.
     * @param {String} attributeName
     * @param {Object} attributeValue The default value.
     * @param {Boolean} hidden True if the method should not be enumerable.
     * @returns {Object} The newly defined attribute value.
     * @todo
     */

    var proto = this.$$Type.prototype;

    return TP.defineAttribute(
            proto, attributeName, attributeValue, TP.TYPE_TRACK, hidden);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('addInstAttribute',
function(attributeName, attributeValue, hidden) {

    /**
     * @name addInstAttribute
     * @synopsis Adds/defines a new instance attribute for the receiver. The
     *     attribute gets a default value if provided. In the current release
     *     the other three parameters are ignored.
     * @param {String} attributeName
     * @param {Object} attributeValue The default value.
     * @param {Boolean} hidden True if the method should not be enumerable.
     * @returns {Object} The newly defined attribute value.
     * @todo
     */

    var proto = this.$$Inst.prototype;

    return TP.defineAttribute(
            proto, attributeName, attributeValue, TP.INST_TRACK, hidden);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('addLocalAttribute',
function(attributeName, attributeValue, hidden) {

    /**
     * @name addLocalAttribute
     * @synopsis Adds/defines a new local attribute for the receiver. The
     *     attribute gets a default value if provided. In the current release
     *     the other three parameters are ignored.
     * @param {String} attributeName
     * @param {Object} attributeValue The default value.
     * @param {Boolean} hidden True if the method should not be enumerable.
     * @returns {Object} The newly defined attribute value.
     * @todo
     */

    return TP.defineAttribute(
            this, attributeName, attributeValue, TP.TYPE_LOCAL_TRACK, hidden);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('addTypeConstant',
function(attributeName, attributeValue, hidden) {

    /**
     * @name addTypeConstant
     * @synopsis Adds/defines a new type constant for the receiver.
     * @param {String} attributeName
     * @param {Object} attributeValue The constant value.
     * @param {Boolean} hidden True if the method should not be enumerable.
     * @returns {Object} The newly defined constant value.
     * @todo
     */

    var proto = this.$$Type.prototype;

    return TP.defineConstant(
            proto, attributeName, attributeValue, TP.TYPE_TRACK, hidden);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('addInstConstant',
function(attributeName, attributeValue, hidden) {

    /**
     * @name addInstConstant
     * @synopsis Adds/defines a new instance constant for the receiver.
     * @param {String} attributeName
     * @param {Object} attributeValue The constant value.
     * @param {Boolean} hidden True if the method should not be enumerable.
     * @returns {Object} The newly defined constant value.
     * @todo
     */

    var proto = this.$$Inst.prototype;

    return TP.defineConstant(
            proto, attributeName, attributeValue, TP.INST_TRACK, hidden);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Type.defineMethod('addLocalConstant',
function(attributeName, attributeValue, hidden) {

    /**
     * @name addLocalConstant
     * @synopsis Adds/defines a new local constant for the receiver.
     * @param {String} attributeName
     * @param {Object} attributeValue The constant value.
     * @param {Boolean} hidden True if the method should not be enumerable.
     * @returns {Object} The newly defined constant value.
     * @todo
     */

    return TP.defineConstant(
            this, attributeName, attributeValue, TP.TYPE_LOCAL_TRACK, hidden);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('addLocalMethod',
function(methodName, methodBody, hidden) {

    /**
     * @name addLocalMethod
     * @synopsis Adds the method with name and body provided as a local method.
     *     Local methods are methods on the receiving instance. These methods
     *     differ from 'instance' methods in that the behavior is NOT inherited
     *     although it can be leveraged by any object which does a copy
     *     operation on the receiver. These methods provide support for a
     *     pure-prototype programming model ala Self.
     * @param {String} methodName The name of the new method.
     * @param {Function} methodBody The actual method implementation.
     * @param {Boolean} hidden True if the method should not be enumerable.
     * @returns {Object} The receiver.
     * @todo
     */

    return TP.defineMethod(
            this, methodName, methodBody, TP.INST_LOCAL_TRACK, hidden);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('addLocalAttribute',
function(attributeName, attributeValue, hidden) {

    /**
     * @name addLocalAttribute
     * @synopsis Adds/defines a new local attribute for the receiver. The
     *     attribute gets a default value if provided. In the current release
     *     the other three parameters are ignored.
     * @param {String} attributeName
     * @param {Object} attributeValue The default value.
     * @param {Boolean} hidden True if the method should not be enumerable.
     * @returns {Object} The newly defined attribute value.
     * @todo
     */

    return TP.defineAttribute(
            this, attributeName, attributeValue, TP.INST_LOCAL_TRACK, hidden);
});

//  ------------------------------------------------------------------------

TP.lang.RootObject.Inst.defineMethod('addLocalConstant',
function(attributeName, attributeValue, hidden) {

    /**
     * @name addLocalConstant
     * @synopsis Adds/defines a new local constant for the receiver.
     * @param {String} attributeName
     * @param {Object} attributeValue The constant value.
     * @param {Boolean} hidden True if the method should not be enumerable.
     * @returns {Object} The newly defined constant value.
     * @todo
     */

    return TP.defineConstant(
            this, attributeName, attributeValue, TP.INST_LOCAL_TRACK, hidden);
});

//  ------------------------------------------------------------------------
//  String - Type Masquerading
//  ------------------------------------------------------------------------

/*
There are a number of places where we'd like to be able to use Strings
rather than Type objects to avoid load dependencies, hard object references,
etc.  This requires us to support Strings which masquerade as Types in
various forms. The methods here help with that process.

In many cases the fact that we support certain methods on Strings relies on
the fact that given IE's treatment of String instances as non-mutable we
know that the API wouldn't make sense for the String as a String. We can
therefore assume that when such methods are invoked they imply the
object/type referenced by the String.
*/

//  ------------------------------------------------------------------------

String.Inst.defineMethod('addInstAttribute',
function(attributeName, attributeValue, hidden) {

    /**
     * @name addInstAttribute
     * @synopsis Adds/defines a new instance attribute for the type. The
     *     attribute gets a default value if provided. In the current release
     *     the other three parameters are ignored.
     * @param {String} attributeName The name of the attribute.
     * @param {Object} attributeValue The default value.
     * @param {Boolean} hidden True if the value should not be enumerable.
     * @returns {Object} The newly defined attribute value.
     * @todo
     */

    var typ;

    typ = this.asType();
    if (TP.isType(typ)) {
        return typ.addInstAttribute(attributeName, attributeValue, hidden);
    }

    return this.raise('TP.sig.InvalidType', arguments, this);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('addTypeAttribute',
function(attributeName, attributeValue, hidden) {

    /**
     * @name addTypeAttribute
     * @synopsis Adds a type attribute to the type represented by the receiving
     *     string. This is a common operation particularly in the
     *     TP.core.ElementNode hierarchy.
     * @param {String} attributeName The name of the attribute.
     * @param {Object} attributeValue The default value.
     * @param {Boolean} hidden True if the value should not be enumerable.
     * @returns {Object} The newly defined attribute value.
     * @todo
     */

    var typ;

    typ = this.asType();
    if (TP.isType(typ)) {
        return typ.addTypeAttribute(attributeName, attributeValue, hidden);
    }

    return this.raise('TP.sig.InvalidType', arguments, this);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('addTypeConstant',
function(attributeName, attributeValue, hidden) {

    /**
     * @name addTypeConstant
     * @synopsis Adds a type constant to the type represented by the receiving
     *     string. This is a common operation particularly in the
     *     TP.core.ElementNode hierarchy.
     * @param {String} attributeName The name of the attribute.
     * @param {Object} attributeValue The default value.
     * @param {Boolean} hidden True if the value should not be enumerable.
     * @returns {Object} The newly defined constant value.
     * @todo
     */

    var typ;

    typ = this.asType();
    if (TP.isType(typ)) {
        return typ.addTypeConstant(attributeName, attributeValue, hidden);
    }

    return this.raise('TP.sig.InvalidType', arguments, this);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('addTypeMethod',
function(methodName, methodBody, hidden) {

    /**
     * @name addTypeMethod
     * @synopsis Adds a type method to the type represented by the receiving
     *     string. This is a common operation particularly in the
     *     TP.core.ElementNode hierarchy.
     * @param {String} methodName The name of the method.
     * @param {Function} methodBody The method implementation.
     * @param {Boolean} hidden True if the method should not be enumerable.
     * @returns {Object} The newly defined method.
     * @todo
     */

    var typ;

    typ = this.asType();
    if (TP.isType(typ)) {
        return typ.addTypeMethod(methodName, methodBody, hidden);
    }

    return this.raise('TP.sig.InvalidType', arguments, this);
});

//  ------------------------------------------------------------------------

String.Inst.defineMethod('addInstMethod',
function(methodName, methodBody, hidden) {

    /**
     * @name addInstMethod
     * @synopsis Adds an instance method to the type represented by the
     *     receiving string. This is a common operation particularly in the
     *     TP.core.ElementNode hierarchy.
     * @param {String} methodName The name of the method.
     * @param {Function} methodBody The method implementation.
     * @param {Boolean} hidden True if the method should not be enumerable.
     * @returns {Object} The newly defined method.
     * @todo
     */

    var typ;

    typ = this.asType();
    if (TP.isType(typ)) {
        return typ.addInstMethod(methodName, methodBody, hidden);
    }

    return this.raise('TP.sig.InvalidType', arguments, this);
});

//  ------------------------------------------------------------------------
//  TEST DEFINITION
//  ------------------------------------------------------------------------

/*
The methods in this section provide the API necessary to define new tests,
new setUp, and new tearDown functions for any object within the system.
*/

//  ------------------------------------------------------------------------

var func;

TP.defineMetaInstMethod('addLocalMethodSetUp',
func = function(methodName, setupFunction) {

    /**
     * @name addLocalMethodSetUp
     * @synopsis Adds a setup function to one of the receiver's local methods.
     *     The method name must resolve to a method whose scope is TP.LOCAL for
     *     this operation to succeed.
     * @param {String} methodName The name of the method to test.
     * @param {Function} setupFunction The setup function itself.
     * @returns {Object} The receiver.
     */

    var method;

    method = this[methodName];
    if (TP.notValid(method)) {
        return TP.raise(this, 'TP.sig.MethodNotFound', arguments);
    }

    if (!TP.isLocalMethod(method)) {
        return TP.raise(this, 'TP.sig.MethodNotLocal', arguments);
    }

    method.addLocalSetUp(setupFunction);

    return this;
});

TP.definePrimitiveSetUp = func;
TP.sys.addLocalMethodSetUp = func;

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('addLocalMethodTearDown',
func = function(methodName, teardownFunction) {

    /**
     * @name addLocalMethodTest
     * @synopsis Adds a test to one of the receiver's local methods. The method
     *     name must resolve to a method whose scope is TP.LOCAL for this
     *     operation to succeed.
     * @param {String} methodName The name of the method to test.
     * @param {Function} teardownFunction The teardown function itself.
     * @returns {Object} The receiver.
     */

    var method;

    method = this[methodName];
    if (TP.notValid(method)) {
        return TP.raise(this, 'TP.sig.MethodNotFound', arguments);
    }

    if (!TP.isLocalMethod(method)) {
        return TP.raise(this, 'TP.sig.MethodNotLocal', arguments);
    }

    method.addLocalTearDown(teardownFunction);

    return this;
});

TP.definePrimitiveTearDown = func;
TP.sys.addLocalMethodTearDown = func;

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('addLocalMethodTest',
func = function(methodName, testFunction, testName, isAsync) {

    /**
     * @name addLocalMethodTest
     * @synopsis Adds a test to one of the receiver's local methods. The method
     *     name must resolve to a method whose scope is TP.LOCAL for this
     *     operation to succeed.
     * @param {String} methodName The name of the method to test.
     * @param {Function} testFunction The test function itself.
     * @param {String} testName The name of the test.
     * @param {Boolean} isAsync True if test is async. Default is false.
     * @returns {Object} The receiver.
     */

    var method;

    method = this[methodName];
    if (TP.notValid(method)) {
        return TP.raise(this, 'TP.sig.MethodNotFound', arguments);
    }

    if (!TP.isLocalMethod(method)) {
        return TP.raise(this, 'TP.sig.MethodNotLocal', arguments);
    }

    method.addLocalTest(testName, testFunction, isAsync);

    return this;
});

TP.definePrimitiveTest = func;
TP.sys.addLocalMethodTest = func;

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('addLocalSetUp',
function(setupFunction) {

    /**
     * @name addLocalSetUp
     * @synopsis Adds a setup function directly to the receiver. This setup will
     *     not be shared with any object in the system unless added to other
     *     objects via one of the add*SetUp methods.
     * @param {Function} setupFunction The setup function itself.
     * @returns {Object} The receiver.
     */

    if (!TP.isFunction(setupFunction)) {
        return this.raise('TP.sig.InvalidFunction', arguments);
    }

    this.addLocalMethod(TP.TEST_SETUP_NAME, setupFunction);

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('addLocalTearDown',
function(teardownFunction) {

    /**
     * @name addLocalTearDown
     * @synopsis Adds a teardown function directly to the receiver. This
     *     teardown function will not be shared with any object in the system
     *     unless added to other objects via one of the add*TearDown methods.
     * @param {Function} teardownFunction The teardown function itself.
     * @returns {Object} The receiver.
     */

    if (!TP.isFunction(teardownFunction)) {
        return this.raise('TP.sig.InvalidFunction', arguments);
    }

    this.addLocalMethod(TP.TEST_TEARDOWN_NAME, teardownFunction);

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('addLocalTest',
function(testName, testFunction, isAsync) {

    /**
     * @name addLocalTest
     * @synopsis Adds a test function directly to the receiver. This test will
     *     not be shared with any object in the system unless added to other
     *     objects via one of the add*Test methods.
     * @param {String} testName The name of the test.
     * @param {Function} testFunction The test function itself.
     * @param {Boolean} isAsync True if test is async. Default is false.
     * @returns {Object} The receiver.
     * @todo
     */

    var fName,
        i,
        name;

    //  Test name has to be viable, and not 'test' to avoid problems with
    //  native RegExp.test() etc.
    if (TP.isEmpty(testName) || (testName === 'test')) {
        //  We can manufacture names for functions though
        if (!TP.isFunction(this)) {
            return this.raise('TP.sig.InvalidTestName', arguments);
        }
    }

    if (!TP.isFunction(testFunction)) {
        return this.raise('TP.sig.InvalidFunction', arguments);
    }

    if (isAsync) {
        testFunction.$$async = isAsync;
    }

    //  The method test apis don't require a test name like the others, they
    //  try to default to the name of the function itself (the receiver) and
    //  then add an index.
    if (TP.isFunction(this)) {
        fName = testName || this.getName().asTitleCase();

        fName = (fName.indexOf(TP.TEST_NAME_PREFIX) !== 0) ?
                TP.TEST_NAME_PREFIX + fName :
                testName;

        fName = TP.escapeMethodName(fName);

        if (!TP.isCallable(this[fName])) {
            this.addLocalMethod(fName, testFunction);
        } else {
            //  have to generate a viable new name...
            i = 1;
            name = fName + i;
            while (TP.isCallable(this[name])) {
                i++;
                name = fName + i;
            }

            this.addLocalMethod(name, testFunction);
        }
    } else {
        fName = (testName.indexOf(TP.TEST_NAME_PREFIX) !== 0) ?
                TP.TEST_NAME_PREFIX + testName :
                testName;

        fName = TP.escapeMethodName(fName);

        this.addLocalMethod(fName, testFunction);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('addInstMethodSetUp',
function(methodName, setupFunction) {

    /**
     * @name addInstMethodSetUp
     * @synopsis Adds a setup function to a specific instance method of the
     *     receiver or its instances.
     * @param {String} methodName The name of the method to add setup logic to.
     * @param {Function} setupFunction The setup function itself.
     * @returns {Object} The receiver.
     * @todo
     */

    var method,
        type;

    if (TP.isType(this)) {
        method = this.getInstPrototype()[methodName];
        if (TP.notValid(method)) {
            return TP.raise(this, 'TP.sig.MethodNotFound', arguments);
        }

        method.addLocalSetUp(setupFunction);

        return this;
    }

    type = this.getType();
    if (this !== type) {
        type.addInstMethodSetUp(setupFunction);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('addInstMethodTearDown',
function(methodName, teardownFunction) {

    /**
     * @name addInstMethodTearDown
     * @synopsis Adds a teardown function to a specific instance method of the
     *     receiver or its instances.
     * @param {String} methodName The name of the method to add teardown logic
     *     to.
     * @param {Function} teardownFunction The teardown function itself.
     * @returns {Object} The receiver.
     * @todo
     */

    var method,
        type;

    if (TP.isType(this)) {
        method = this.getInstPrototype()[methodName];
        if (TP.notValid(method)) {
            return TP.raise(this, 'TP.sig.MethodNotFound', arguments);
        }

        method.addLocalTearDown(teardownFunction);

        return this;
    }

    type = this.getType();
    if (this !== type) {
        type.addInstMethodTearDown(teardownFunction);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('addInstMethodTest',
function(methodName, testFunction, testName, isAsync) {

    /**
     * @name addInstMethodTest
     * @synopsis Adds a test function to a specific instance method of the
     *     receiver or its instances.
     * @param {String} methodName The name of the method to test.
     * @param {Function} testFunction The test function itself.
     * @param {String} testName The name of the test.
     * @param {Boolean} isAsync True if test is async. Default is false.
     * @returns {Object} The receiver.
     * @todo
     */

    var method,
        type;

    if (TP.isType(this)) {
        method = this.getInstPrototype()[methodName];
        if (TP.notValid(method)) {
            return TP.raise(this, 'TP.sig.MethodNotFound', arguments);
        }

        method.addLocalTest(testName, testFunction, isAsync);

        return this;
    }

    type = this.getType();
    if (this !== type) {
        type.addInstMethodTest(testName, methodName, testFunction, isAsync);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('addTypeMethodSetUp',
function(methodName, setupFunction) {

    /**
     * @name addTypeMethodSetUp
     * @synopsis Adds a setup function to a specific type method of the receiver
     *     or its type.
     * @param {String} methodName The name of the method to add setup logic to.
     * @param {Function} setupFunction The setup function itself.
     * @returns {Object} The receiver.
     * @todo
     */

    var method,
        type;

    if (TP.isType(this)) {
        method = this.getPrototype()[methodName];
        if (TP.notValid(method)) {
            return TP.raise(this, 'TP.sig.MethodNotFound', arguments);
        }

        method.addLocalSetUp(setupFunction);

        return this;
    }

    type = this.getType();
    if (this !== type) {
        type.addTypeMethodSetUp(setupFunction);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('addTypeMethodTearDown',
function(methodName, teardownFunction) {

    /**
     * @name addTypeMethodTearDown
     * @synopsis Adds a teardown function to a specific type method of the
     *     receiver or its type.
     * @param {String} methodName The name of the method to add teardown logic
     *     to.
     * @param {Function} teardownFunction The teardown function itself.
     * @returns {Object} The receiver.
     * @todo
     */

    var method,
        type;

    if (TP.isType(this)) {
        method = this.getPrototype()[methodName];
        if (TP.notValid(method)) {
            return TP.raise(this, 'TP.sig.MethodNotFound', arguments);
        }

        method.addLocalTearDown(teardownFunction);

        return this;
    }

    type = this.getType();
    if (this !== type) {
        type.addTypeMethodTearDown(teardownFunction);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('addTypeMethodTest',
function(methodName, testFunction, testName, isAsync) {

    /**
     * @name addTypeMethodTest
     * @synopsis Adds a test function to a specific type method of the receiver
     *     or its type.
     * @param {String} methodName The name of the method to test.
     * @param {Function} testFunction The test function itself.
     * @param {String} testName The name of the test.
     * @param {Boolean} isAsync True if test is async. Default is false.
     * @returns {Object} The receiver.
     * @todo
     */

    var method,
        type;

    if (TP.isType(this)) {
        method = this.getPrototype()[methodName];
        if (TP.notValid(method)) {
            return TP.raise(this, 'TP.sig.MethodNotFound', arguments);
        }

        method.addLocalTest(testName, testFunction, isAsync);

        return this;
    }

    type = this.getType();
    if (this !== type) {
        type.addTypeMethodTest(testName, methodName, testFunction, isAsync);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('addTypeSetUp',
function(setupFunction) {

    /**
     * @name addTypeSetUp
     * @synopsis Adds a setup function to be shared by the receiver and its
     *     subtypes. If the receiver is not a type the setup function is
     *     associated with the Type of the receiver.
     * @param {Function} setupFunction The setup function to be run.
     * @returns {Object} The receiver.
     */

    var type;

    if (TP.isType(this)) {
        this.getPrototype().addLocalSetUp(setupFunction);

        return this;
    }

    type = this.getType();
    if (this !== type) {
        type.addTypeSetUp(setupFunction);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('addTypeTearDown',
function(teardownFunction) {

    /**
     * @name addTypeTearDown
     * @synopsis Adds a teardown function to be shared by the receiver and its
     *     subtypes. If the receiver is not a type the teardown function is
     *     associated with the Type of the receiver.
     * @param {Function} teardownFunction The function to be run.
     * @returns {Object} The receiver.
     */

    var type;

    if (TP.isType(this)) {
        this.getPrototype().addLocalTearDown(teardownFunction);

        return this;
    }

    type = this.getType();
    if (this !== type) {
        type.addTypeTearDown(teardownFunction);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('addTypeTest',
function(testName, testFunction, isAsync) {

    /**
     * @name addTypeTest
     * @synopsis Adds a test shared by the receiving type and its subtypes.
     * @param {String} testName The name of the test.
     * @param {Function} testFunction The test function itself.
     * @param {Boolean} isAsync True if test is async. Default is false.
     * @returns {Object} The receiver.
     * @todo
     */

    var type;

    if (TP.isType(this)) {
        this.getPrototype().addLocalTest(testName, testFunction, isAsync);
        testFunction[TP.TRACK] = 'Type';

        return this;
    }

    type = this.getType();
    if (this !== type) {
        type.addTypeTest(testName, testFunction, isAsync);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  TEST ACQUISITION
//  ------------------------------------------------------------------------

/*
*/

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getTestInstance',
function(aRequest) {

    /**
     * @name getTestInstance
     * @synopsis Returns an instance appropriate for testing instances of the
     *     receiving type.
     * @description If the receiver is not a type the instance itself is
     *     presumed to be a viable test instance. The default implementation
     *     simply invokes construct() with no arguments. If a type's construct()
     *     and/or init() methods require parameters you must override this
     *     method to provide a properly configured test instance.
     * @param {TP.sig.Request} aRequest The request used for the current test
     *     execution sequence.
     * @returns {Object} A suitably configured instance for testing.
     * @todo
     */

    if (TP.isType(this)) {
        //  NOTE this requires types with zero-argument constructors if
        //  you're not going to override this method
        return this.construct();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getTestableMethods',
function(aRequest) {

    /**
     * @name getTestableMethods
     * @synopsis Collects and returns methods that are considered to be
     *     'testable' on the receiver. Parameters in the request object
     *     determine how the methods for the receiver should be filtered,
     *     including whether tests should be inherited, whether method tests
     *     should be found, etc.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request providing test
     *     parameters.
     * @returns {Array} An array of test functions.
     * @todo
     */

    var request,

        wantsLocalMethodTests,
        wantsTypeMethodTests,
        wantsInstMethodTests,

        inheritTests,
        filter,

        worklist,
        hasType;

    TP.debug('break.test');

    request = TP.request(aRequest);
    if (!TP.canInvoke(request, 'stdout')) {
        request.stdout = TP.boot.$stdout;
    }

    wantsLocalMethodTests = TP.ifKeyInvalid(request, 'localTests', true);
    wantsTypeMethodTests = TP.ifKeyInvalid(request, 'typeTests', true);
    wantsInstMethodTests = TP.ifKeyInvalid(request, 'instanceTests', true);

    //  lots of overhead here, so we default to testing in a smaller scope
    inheritTests = TP.ifKeyInvalid(request, 'inheritTests', false);
    filter = TP.ifKeyInvalid(request,
                                'tsh:filter',
                                inheritTests ?
                                    'known_methods' :
                                    'known_unique_methods');

    //  start off with local tests, which are rarely turned off, otherwise
    //  why use this object as a test target?
    if (wantsLocalMethodTests) {
        worklist = this.getLocalInterface(filter).collect(
                            function(name) {

                                return this[name];
                            }.bind(this));
    } else {
        worklist = TP.ac();
    }

    hasType = TP.isType(this);

    //  add type or instance tests to any local tests we may already have
    //  collected to complete the "object test" worklist for the target.
    if (hasType && wantsTypeMethodTests) {
        worklist.addAll(this.getTypeInterface(filter).collect(
                                function(name) {

                                    return this.getTypeMethod(name);
                                }.bind(this)));
    } else if (wantsInstMethodTests) {
        worklist.addAll(this.getInstInterface(filter).collect(
                                function(name) {

                                    return this.getInstMethod(name);
                                }.bind(this)));
    }

    //  Types optionally also test their instance interfaces so add in any
    //  tests that fit that criteria if we're requesting instance testing.
    if (hasType && wantsInstMethodTests) {
        worklist.addAll(this.getInstInterface(filter).collect(
                                function(name) {

                                    return this.getInstMethod(name);
                                }.bind(this)));
    }

    //  remove any null slots
    worklist.compact();

    return worklist;
});

//  ------------------------------------------------------------------------
//  TEST EXECUTION
//  ------------------------------------------------------------------------

/*
Methods to support actual test execution.
*/

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('getTests',
function(aRequest) {

    /**
     * @name getTests
     * @synopsis Collects and returns tests on the receiver. Parameters in the
     *     request object determine how test functions for the receiver should
     *     be filtered, including whether tests should be inherited, whether
     *     method tests should be found, etc.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request providing test
     *     parameters.
     * @returns {Array} An ordered pair containing two arrays of test functions,
     *     object tests and method tests in that order.
     * @todo
     */

    var request,

        wantsMethodTests,
        worklist,

        dict,
        methods,
        objectTests,
        
        setup,
        teardown,
        
        methodsWithTests,
        methodTests;

    TP.debug('break.test');

    request = TP.request(aRequest);
    if (!TP.canInvoke(request, 'stdout')) {
        request.stdout = TP.boot.$stdout;
    }

    wantsMethodTests = TP.ifKeyInvalid(request, 'methodTests', true);

    //  get the overall list of methods which is potentially testable based
    //  on the request criteria.
    worklist = this.getTestableMethods(request);

    //  now, if we're supposed to test methods then we split the list into
    //  two sets, the test functions attached to the object, and the
    //  non-test functions which are its methods. The latter list will be
    //  used to collect method-specific tests in a later step.
    if (wantsMethodTests) {
        dict = worklist.groupBy(
                    function(func) {

                        return TP.regex.TEST_FUNCTION.test(func.$getName());
                    });

        methods = TP.ifInvalid(dict.at('false'), TP.ac());
        objectTests = TP.ifInvalid(dict.at('true'), TP.ac());
    } else {
        //  not testing methods? remove non-test functions from the list
        objectTests = worklist.select(
                        function(func) {

                            return TP.regex.TEST_FUNCTION.test(
                                                    func.$getName());
                        });
    }

    objectTests = objectTests.unique().compact();

    setup = this[TP.TEST_SETUP_NAME];
    teardown = this[TP.TEST_TEARDOWN_NAME];

    //  If there are object-level tests, see if there's a setup or teardown on
    //  the object itself and copy that onto the individual test methods.
    if (TP.notEmpty(objectTests) &&
        (TP.isCallable(setup) || TP.isCallable(teardown))) {
        objectTests.perform(
                function(func) {
                    if (TP.isCallable(setup)) {
                        func[TP.TEST_SETUP_NAME] = setup;
                    }
                    if (TP.isCallable(teardown)) {
                        func[TP.TEST_TEARDOWN_NAME] = teardown;
                    }
                });
    }

    if (wantsMethodTests) {

        //  First, grab any methods that have tests
        methodsWithTests = methods.select(
                    function(method) {

                        return TP.isMethod(method) && method.hasTests();
                    });

        //  Then, grab the methods that actually *are* the tests from the
        //  methods that have tests (and make sure they have any setup or
        //  teardown methods slotted on them).
        methodTests = methodsWithTests.collect(
                function(method) {
                    var methodSetup,
                        methodTeardown,
            
                        tests;

                    //  See if there's a setup or teardown on the method
                    //  itself and copy that onto the individual test
                    //  methods.
                    methodSetup = method[TP.TEST_SETUP_NAME];
                    methodTeardown = method[TP.TEST_TEARDOWN_NAME];

                    //  This returns an Array of Arrays (to be
                    //  API-compliant with the Object-level 'getTests'
                    //  call). We're interested in the second Array.
                    tests = method.getTests();
                    tests.at(1).perform(
                        function(test) {
                            if (TP.isCallable(methodSetup)) {
                                test[TP.TEST_SETUP_NAME] = methodSetup;
                            }
                            if (TP.isCallable(methodTeardown)) {
                                test[TP.TEST_TEARDOWN_NAME] = methodTeardown;
                            }
                        });

                    return tests;
                }).flatten().compact();
    }

    return TP.ac(objectTests, methodTests);
});

//  ------------------------------------------------------------------------

//  We need a reference we can call from the Function.prototype slot when
//  the Function in question is a native type.
TP.FunctionProto.getTests$$ = TP.FunctionProto.getTests;

//  For now, we need to manually add this to the 'meta_methods' list
TP.META_INST_OWNER.meta_methods.getTests$$ = TP.FunctionProto.getTests$$;

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('getTests',
function(aRequest) {

    /**
     * @name getTests
     * @synopsis Collects and returns tests on the receiver. Parameters in the
     *     request object determine how test functions for the receiver should
     *     be filtered, including whether tests should be inherited, whether
     *     method tests should be found, etc.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request providing test
     *     parameters.
     * @returns {Array} An ordered pair containing two arrays of test functions,
     *     object tests and method tests in that order.
     * @todo
     */

    var keys;

    //  If we're a type then we want to act like a standard object and defer
    //  to the implementation on TP.ObjectProto.
    if (TP.isType(this)) {
        return this.getTests$$(aRequest);
    }

    //  For individual "method" functions we generate just a single array
    //  containing the method tests for the receiver.
    keys = TP.keys(this).select(
                    function(key) {

                        return TP.regex.TEST_FUNCTION.test(key) &&
                                TP.isFunction(this[key]);
                    }.bind(this));

    //  There won't be any "object" tests here, just method tests, so we pass an
    //  empty Array as the object tests.
    return TP.ac(TP.ac(), keys.collect(
                            function(key) {

                                return this[key];
                            }.bind(this)));
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('hasTests',
function(aRequest) {

    /**
     * @name hasTests
     * @synopsis Returns true if the receiver has unit tests. Parameters in the
     *     request object determine how test functions for the receiver should
     *     be filtered, including whether tests should be inherited, whether
     *     method tests should be found, etc.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request providing test
     *     parameters.
     * @returns {Boolean} Whether or not the receiver has unit tests.
     */

    var request,

        wantsMethodTests,
        worklist,
        test;

    TP.debug('break.test');

    request = TP.request(aRequest);
    if (!TP.canInvoke(request, 'stdout')) {
        request.stdout = TP.boot.$stdout;
    }

    wantsMethodTests = TP.ifKeyInvalid(request, 'methodTests', true);

    //  get the overall list of methods which is potentially testable based
    //  on the request criteria.
    worklist = this.getTestableMethods(request);

    test = worklist.detect(
                function(func) {

                    return TP.regex.TEST_FUNCTION.test(func.$getName());
                });

    if (TP.isValid(test)) {
        return true;
    }

    if (wantsMethodTests) {
        test = worklist.detect(
                    function(func) {

                        return !TP.regex.TEST_FUNCTION.test(
                                                func.$getName()) &&
                                func.hasTests();
                    });

        if (TP.isValid(test)) {
            return true;
        }
    }

    return false;
});

//  ------------------------------------------------------------------------

//  We need a reference we can call from the Function.prototype slot when
//  the Function in question is a native type.
TP.FunctionProto.hasTests$$ = TP.FunctionProto.hasTests;

//  For now, we need to manually add this to the 'meta_methods' list
TP.META_INST_OWNER.meta_methods.hasTests$$ = TP.FunctionProto.hasTests$$;

//  ------------------------------------------------------------------------

TP.defineMetaTypeMethod('hasTests',
function(aRequest) {

    var keys;

    //  If we're a type then we want to act like a standard object and defer
    //  to the implementation on TP.ObjectProto.
    if (TP.isType(this)) {
        return this.hasTests$$(aRequest);
    }

    keys = TP.keys(this);

    return TP.notEmpty(keys.detect(
                        function(key) {

                            return TP.regex.TEST_FUNCTION.test(key) &&
                                    TP.isFunction(this[key]);
                        }.bind(this)));
});

//  ------------------------------------------------------------------------
//  TEST EXECUTION
//  ------------------------------------------------------------------------

/*
Methods to support actual test execution.
*/

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('runUnitTests',
function(aRequest) {

    /**
     * @name runUnitTests
     * @synopsis Runs tests on the receiver. Parameters in the request object
     *     determine how test functions for the receiver should be filtered,
     *     including whether tests should be inherited, whether method tests
     *     should be invoked, etc.
     * @param {TP.sig.Request|TP.lang.Hash} aRequest A request providing test
     *     parameters.
     */

    var req,

        tests,
        objTests,
        methodTests,

        cases,
        len,
        index,
        done,

        verbose,

        params,
        subrequest,

        limitFunc,
        stepFunc,

        test,
        error;

    TP.debug('break.tsh_test');

    req = TP.request(aRequest);

    tests = this.getTests(req);
    objTests = tests.at(0);
    methodTests = tests.at(1);

    if (TP.isEmpty(objTests) && TP.isEmpty(methodTests)) {
        params = TP.hc('cmdAppend', true,
                        'cmdAsIs', true,
                        'cmdAwaken', false,
                        'cmdBox', false,
                        'nobreaks', true);

        req.stdout('No object or method tests found', params);
        req.complete();

        return;
    }

    cases = objTests.addAll(methodTests);
    len = cases.getSize();
    index = 0;
    done = false;

    //  typically invoked via the tsh:test tag/command and as a result we
    //  typically have a request, but if we're called directly we may not.
    if (TP.isValid(req)) {
        verbose = TP.ifKeyInvalid(req,
                                    'tsh:verbose',
                                    TP.ifKeyInvalid(req, 'verbose', false));

        params = req.getPayload().copy();
        params.atPut('verbose', verbose);

        subrequest = TP.sig.TestRequest.construct(params);
        subrequest.configureSTDIO(req);
    } else {
        verbose = false;

        params = TP.hc();
        params.atPut('verbose', verbose);

        subrequest = TP.sig.TestRequest.construct(params);
        subrequest.stdout = TP.boot.$stdout;
    }

    params.atPut('cmdAppend', true);
    params.atPut('cmdAsIs', true);
    params.atPut('cmdAwaken', false);
    params.atPut('cmdBox', false);
    params.atPut('nobreaks', true);

    //  the limit function determines when the job should stop. we're
    //  running with a custom limit which is defined by a shared flag
    //  between our step and limit functions.
    limitFunc =
        function(aJob, jobParams) {

            var time,
                out,
                msg;

            //  check the outer 'done' flag to see if our stepFunc has set
            //  it yet. Until then we're not limited and should keep
            //  running.
            if (done) {
                //  complete any originating request to ensure things
                //  propagate up any request chain.
                req.complete();
            } else if (subrequest && test) {
                time = subrequest.getActiveTime();
                if (time && time > TP.sys.cfg('tsh.test_step_max')) {
                    msg = '&nbsp;Step timeout limit exceeded.';

                    if (verbose) {
                        out = TP.link(test, msg);
                    } else {
                        out = TP.link(test, '^', msg);
                        params.atPut('nobreaks', true);
                    }

                    error = true;
                    subrequest.stderr(out, params);

                    //  Timed out. We're done.
                    subrequest.complete();
                }
            }

            return done;
        };

    //  the step function is what we'll do at each interval. in this
    //  case our mission is to manage/check on the request state for the
    //  internal test request to see if the current test has completed.
    //  once all tests have finished we can complete the inbound request
    //  and exit.
    stepFunc =
        function() {

            var ch,
                out;

            if (subrequest.isCompleted()) {
                //  If we didn't output an 'e' or 'f' now's the time for '.'
                if (!error) {
                    if (verbose) {
                        out = 'PASS';
                        params.atPut('nobreaks', true);
                    } else {
                        out = '.';
                        params.atPut('nobreaks', true);
                    }

                    subrequest.stdout(out, params);
                }

                //  If the completed test has a teardown we need to run
                //  that.
                if (TP.owns(test, TP.TEST_TEARDOWN_NAME)) {
                    try {
                        test[TP.TEST_TEARDOWN_NAME](subrequest);
                    } catch (e) {
                        //  teardown had a hard error, didn't run properly.
                        ch = 't';
                        out = TP.link(test[TP.TEST_TEARDOWN_NAME], ch, e.message);
                        params.atPut('nobreaks', true);

                        subrequest.stderr(out, params);
                    }
                }
            }

            //  if we've processed all tests then we set the outer 'done'
            //  flag so our limitFunc will cause the job to shut down.
            if (index >= len && subrequest.isCompleted()) {
                done = true;

                return;
            }

            //  if we're not just getting started (and hence have no active
            //  object under test) or the current subrequest is still
            //  running then just return and keep waiting.
            if (index !== 0 && !subrequest.isCompleted()) {
                return;
            }

            //  must be starting out or completed the previous object, time
            //  to get a new one.
            test = cases.at(index);

            //  in verbose mode we want to push out the name of each test
            //  before running the actual test. In non-verbose mode we'll
            //  output the symbol based on how the test run went later on.
            if (verbose) {
                out = TP.unescapeMethodName(
                        TP.name(test).slice(TP.TEST_NAME_PREFIX.length)) + ': ';
                params.atPut('nobreaks', false);

                subrequest.stdout(out, params);
            }

            //  clear job control state for upcoming iteration
            subrequest.reset();

            //  reset time for the next single step
            subrequest.set('time', Date.now());

            error = false;
            if (TP.owns(test, TP.TEST_SETUP_NAME)) {
                try {
                    test[TP.TEST_SETUP_NAME](subrequest);
                } catch (e) {
                    error = true;
                    ch = 's';
                    out = TP.link(test[TP.TEST_SETUP_NAME], ch, e.message);
                    params.atPut('nobreaks', true);

                    subrequest.stderr(out, params);
                    subrequest.fail();
                }
            }

            if (!error) {
                try {
                    //  Note this can run async subcontent so we can't
                    //  output or do anything else here, we have to wait
                    //  until the subrequest is completed or it times out.
                    test(subrequest);
                } catch (e) {
                    ch = (e.name === 'AssertionFailed') ? 'f' : 'e';

                    if (verbose) {
                        params.atPut('nobreaks', true);
                        out = TP.link(test, e.message);
                    } else {
                        out = TP.link(test, ch, e.message);
                        params.atPut('nobreaks', true);
                    }

                    error = true;

                    subrequest.stderr(out, params);
                    subrequest.fail();
                }
            }

            index++;
        };

    //  run the job. the step and limit functions handle the rest.
    TP.schedule(TP.hc('step', stepFunc,
                        'limit', limitFunc,
                        'interval', 10));

    return;
});

//  ------------------------------------------------------------------------
//  TEST ASSERTIONS
//  ------------------------------------------------------------------------

/**
 * @The TP.assert* functions here are loosely modeled after those found in other
 *     testing frameworks, however they follow a naming and argument list order
 *     that makes them more consistent with the rest of TIBET. Some alterations
 *     have also been made to help reduce the potential for creating passing
 *     testswhich don't actually test anything should you overlook a parameter.
 * @todo
 */

//  ------------------------------------------------------------------------

//  Create a custom Error for use in Assert processing.
AssertionFailed = function(message) {

                        this.message = message;
                    };

AssertionFailed.prototype = new Error();
AssertionFailed.prototype.name = 'AssertionFailed';

//  ------------------------------------------------------------------------
//  ASSERT BASELINE
//  ------------------------------------------------------------------------

TP.definePrimitive('$assert',
function(aCondition, aComment, aFaultString) {

    /**
     * @name $assert
     * @synopsis Checks the supplied Boolean value and throws a JS-level Error
     *     (our custom AssertionFailed Error object).
     * @param {Boolean} aCondition Whether or not the test succeeded.
     * @param {String} aComment A human-readable comment String.
     * @param {String} aFaultString A String detailing the fault. This will be
     *     appended to the comment if it's supplied.
     * @todo
     */

    var comment;

    if (!aCondition) {
        comment = TP.isEmpty(aComment) ? '' : aComment + ' ';
        throw new AssertionFailed(comment + (aFaultString || ''));
    }

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertMinArguments',
function(anArgArray, aCount, aComment) {

    /**
     * @name assertMinArguments
     * @synopsis Asserts that the supplied argument Array has a minimum number
     *     of items in it.
     * @param {Array} anArgArray The argument Array to check.
     * @param {Number} aCount The minimum number of arguments that the supplied
     *     argument Array should have.
     * @param {String} aComment The comment to use when reporting that the
     *     argument Array does not have the required minimum number of
     *     arguments.
     * @todo
     */

    var comment;

    //  Like JSUnit a comment is optional, but unlike that framework ours
    //  is always the last argument, when present. This approach means its
    //  much harder for an assertion to mistake a comment for a valid input
    //  and implies that the count provided to this method is effectively a
    //  "minimum" count.

    if (anArgArray.length >= aCount) {
        return;
    }

    comment = TP.isEmpty(aComment) ? '' : aComment + ' ';

    throw new AssertionFailed(
                TP.join(comment,
                        TP.sc('Expected: ', aCount, ' arguments.',
                                ' Got: ', anArgArray.length, '.')));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assert',
function(aCondition, aComment, aFaultString) {

    /**
     * @name assert
     * @synopsis Asserts that the supplied condition passes (i.e. returns true).
     * @param {Boolean} aCondition Whether or not the test succeeded.
     * @param {String} aComment A human-readable comment String.
     * @param {String} aFaultString A String detailing the fault. This will be
     *     appended to the comment if it's supplied.
     * @todo
     */

    TP.assertMinArguments(arguments, 1);

    return TP.$assert(aCondition, aComment, aFaultString);
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - GENERAL API / TYPE CHECKING
//  ------------------------------------------------------------------------

TP.definePrimitive('assertCanInvoke',
function(anObject, aMethodName, aComment) {

    TP.assertMinArguments(arguments, 2);

    TP.assert(
        TP.canInvoke(anObject, aMethodName),
        aComment,
        TP.sc('Expected: ', TP.id(anObject),
                ' could invoke: ', aMethodName, '.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsA',
function(anObject, aType, aComment) {

    TP.assertMinArguments(arguments, 2);

    TP.assert(
        TP.validate(anObject, aType),
        aComment,
        TP.sc('Expected: ', TP.id(anObject),
                ' to be isa: ', aType, '.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsAbstract',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isAbstract(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was an abstract type.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsAttribute',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isAttributeNode(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was an attribute.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsCallable',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isCallable(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was callable.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsCollection',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isCollection(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was collection.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsEnhanced',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isEnhanced(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was an enhanced object.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsGlobal',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isGlobal(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was a global.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsKindOf',
function(anObject, aType, aComment) {

    TP.assertMinArguments(arguments, 2);

    TP.assert(
        TP.isKindOf(anObject, aType),
        aComment,
        TP.sc('Expected: ', TP.id(anObject),
                ' was a kind of: ', aType, '.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsGlobalMethod',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isGlobalMethod(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was a global method.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsInstMethod',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isInstMethod(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was a instance method.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsLocalMethod',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isLocalMethod(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was a local method.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsMemberOf',
function(anObject, aType, aComment) {

    TP.assertMinArguments(arguments, 2);

    TP.assert(
        TP.isMemberOf(anObject, aType),
        aComment,
        TP.sc('Expected: ', TP.id(anObject),
                ' was a member of: ', aType, '.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsMethod',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isMethod(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was a method.'));

    return;
});

TP.definePrimitive('assertIsMutable',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isMutable(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was mutable.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsNativeType',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isNativeType(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was a native type.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsPrototype',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isPrototype(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was a prototype.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsPair',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isPair(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was a "pair".'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsProperty',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isProperty(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was a property.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsReferenceType',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isReferenceType(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was a reference type.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsType',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isType(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was a type.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsTypeMethod',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isTypeMethod(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was a type method.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsTypeName',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isTypeName(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was a type name.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertNotA',
function(anObject, aType, aComment) {

    TP.assertMinArguments(arguments, 2);

    TP.assert(
        !TP.validate(anObject, aType),
        aComment,
        TP.sc('Expected: ', TP.id(anObject),
                ' to not be isa: ', aType, '.'));

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - SPECIFIC API / TYPE CHECKING
//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsArgArray',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isArgArray(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject),
                ' was an "arguments" object.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsArray',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isArray(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was an Array.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsBoolean',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isBoolean(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was a Boolean.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsDate',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isDate(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was a Date.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsError',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isError(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was an Error.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsEvent',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isEvent(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was an Event.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsFrame',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isFrame(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was an frame.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsFunction',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isFunction(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was an Function.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsIFrameWindow',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isIFrameWindow(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was an iframe window.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsNaN',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isNaN(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was NaN.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsNumber',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isNumber(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was a Number.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsRegExp',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isRegExp(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was RegExp.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsString',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isString(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was a String.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsStyleDeclaration',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isStyleDeclaration(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was a style.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsURI',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isURI(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was a URI.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsWindow',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isWindow(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was a Window.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsXHR',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isXHR(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was an XHR object.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertNotNaN',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        !TP.isNaN(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was not NaN.'));

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - BOOLEAN
//  ------------------------------------------------------------------------

TP.definePrimitive('assertFalse',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isFalse(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was False.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertFalselike',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        !anObject,
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was false-like.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertNotFalse',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.notFalse(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was not False.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertNotTrue',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.notTrue(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was not True.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertTrue',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isTrue(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was True.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertTruelike',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        anObject,
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was true-like.'));

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - CONTENT/VALUE
//  ------------------------------------------------------------------------

TP.definePrimitive('assertBlank',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isBlank(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was blank.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertContains',
function(anObject, someContent, aComment) {

    TP.assertMinArguments(arguments, 2);

    TP.assert(
        TP.contains(anObject, someContent),
        aComment,
        TP.sc('Expected ', TP.id(anObject),
                ' to contain ', TP.id(someContent)));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertEmpty',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isEmpty(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was empty.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertMatches',
function(anObject, aValue, aComment) {

    TP.assertMinArguments(arguments, 2);

    TP.assert(
        TP.isTrue(aValue.test(anObject)),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to match ', TP.id(aValue), '.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertNotBlank',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.notBlank(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was not blank.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertNotContains',
function(anObject, someContent, aComment) {

    TP.assertMinArguments(arguments, 2);

    TP.assert(
        !TP.contains(anObject, someContent),
        aComment,
        TP.sc('Expected ', TP.id(anObject),
                ' to not contain ', TP.id(someContent)));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertNotEmpty',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.notEmpty(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was not empty.'));

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - EQUALITY/IDENTITY
//  ------------------------------------------------------------------------

TP.definePrimitive('assertEqualAs',
function(anObject, aValue, aType, aComment) {

    TP.assertMinArguments(arguments, 3);

    TP.assert(
        TP.ac(anObject, aValue).equalAs(aType),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' and ', TP.id(aValue),
                ' to be equal as ', TP.name(aType), 's.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertEqualTo',
function(anObject, aValue, aComment) {

    TP.assertMinArguments(arguments, 2);

    TP.assert(
        TP.equal(anObject, aValue),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' and ', TP.id(aValue),
                ' to be equal.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIdenticalTo',
function(anObject, aValue, aComment) {

    TP.assertMinArguments(arguments, 2);

    TP.assert(
        TP.identical(anObject, aValue),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' and ', TP.id(aValue),
                ' to be identical.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertNotEqualAs',
function(anObject, aValue, aType, aComment) {

    TP.assertMinArguments(arguments, 3);

    TP.assert(
        !TP.ac(anObject, aValue).equalAs(aType),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' and ', TP.id(aValue),
                ' to be unequal as ', TP.name(aType), 's.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertNotEqualTo',
function(anObject, aValue, aComment) {

    TP.assertMinArguments(arguments, 2);

    TP.assert(
        !TP.equal(anObject, aValue),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' and ', TP.id(aValue),
                ' not to be equal.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertNotIdenticalTo',
function(anObject, aValue, aComment) {

    TP.assertMinArguments(arguments, 2);

    TP.assert(
        !TP.identical(anObject, aValue),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' and ', TP.id(aValue),
                ' not to be identical.'));

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - CONVERTED VALUE EQUALITY
//  ------------------------------------------------------------------------

TP.definePrimitive('assertHashEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.hash(anObject);

    TP.assertMinArguments(arguments, 2);

    TP.assert(
        TP.equal(val, aValue),
        aComment,
        TP.sc('Expected hash ', val, ' and ', aValue, ' to be equal.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertHTMLEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.htmlstr(anObject);

    TP.assertMinArguments(arguments, 2);

    TP.assert(
        TP.equal(val, aValue),
        aComment,
        TP.sc('Expected HTML ', val, ' and ', aValue, ' to be equal.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertJSONEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.json(anObject);

    TP.assertMinArguments(arguments, 2);

    TP.assert(
        TP.equal(val, aValue),
        aComment,
        TP.sc('Expected JSON ', val, ' and ', aValue, ' to be equal.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertSrcEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.src(anObject);

    TP.assertMinArguments(arguments, 2);

    TP.assert(
        TP.equal(val, aValue),
        aComment,
        TP.sc('Expected JS source ', val, ' and ', aValue, ' to be equal.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertStrEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.str(anObject);

    TP.assertMinArguments(arguments, 2);

    TP.assert(
        TP.equal(val, aValue),
        aComment,
        TP.sc('Expected string ', val, ' and ', aValue, ' to be equal.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertURIEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.uri(anObject);

    TP.assertMinArguments(arguments, 2);

    TP.assert(
        TP.equal(val, aValue),
        aComment,
        TP.sc('Expected URI ', val, ' and ', aValue, ' to be equal.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertValEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.val(anObject);

    TP.assertMinArguments(arguments, 2);

    TP.assert(
        TP.equal(val, aValue),
        aComment,
        TP.sc('Expected value ', val, ' and ', aValue, ' to be equal.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertXHTMLEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.xhtmlstr(anObject);

    TP.assertMinArguments(arguments, 2);

    TP.assert(
        TP.equal(val, aValue),
        aComment,
        TP.sc('Expected XHTML ', val, ' and ', aValue, ' to be equal.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertXMLEqualTo',
function(anObject, aValue, aComment) {

    var val;

    val = TP.xmlstr(anObject);

    TP.assertMinArguments(arguments, 2);

    TP.assert(
        TP.equal(val, aValue),
        aComment,
        TP.sc('Expected XML ', val, ' and ', aValue, ' to be equal.'));

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - INPUT TESTS
//  ------------------------------------------------------------------------

TP.definePrimitive('assertInputInRange',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertInputInvalid',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);
    //TP.assert(TP.notValid(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to have invalid input.');

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertInputOutOfRange',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertInputValid',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);
    //TP.assert(!TP.notValid(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to have valid input.');

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - MARKUP / ENCODING
//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsCommentNode',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isCommentNode(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was a Comment node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsCDATASectionNode',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isCDATASectionNode(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was a CDATASection node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsCollectionNode',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isCollectionNode(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was collection node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsDocument',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isDocument(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was a Document.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsElement',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isElement(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was an Element.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsFragment',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isFragment(anObject),
        aComment,
        TP.sc('Expected: ', TP.id(anObject), ' was an fragment.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsHTML',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsHTMLDocument',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isHTMLDocument(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an HTML document.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsHTMLNode',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isHTMLNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an HTML node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsJSON',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsNode',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was a Node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsNamedNodeMap',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isNamedNodeMap(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was a NamedNodeMap.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsNodeList',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isNodeList(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was a NodeList.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsNodeType',
function(anObject, aNodeType, aComment) {

    TP.assertMinArguments(arguments, 2);

    TP.assert(
        TP.isNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was a Node.'));

    TP.assert(
        anObject.nodeType === aNodeType,
        aComment,
        TP.sc('Expected ', TP.id(anObject),
                ' was a type #', aNodeType, ' Node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsSVGNode',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isSVGNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was an SVG Node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsTextNode',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isTextNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' was a text Node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsXHTML',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsXHTMLDocument',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isXHTMLDocument(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an XHTML document.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsXHTMLNode',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isXHTMLNode(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be an XHTML node.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsXML',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsXMLDocument',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isXMLDocument(anObject),
        aComment,
        TP.ac('Expected ', TP.id(anObject), ' to be an XML document.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsXMLNode',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isXMLNode(anObject),
        aComment,
        TP.ac('Expected ', TP.id(anObject), ' to be an XML node.'));

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - NULL/UNDEFINED/TRUE/FALSE
//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsDefined',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isDefined(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be defined.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsFalse',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isFalse(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be false.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsNull',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isNull(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be null.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsTrue',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isTrue(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be true.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsUndefined',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        !TP.isDefined(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be undefined.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertIsValid',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.isValid(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be defined and non-null.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertNotDefined',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.notDefined(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be undefined.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertNotNull',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.notNull(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be non-null.'));

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertNotValid',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);

    TP.assert(
        TP.notValid(anObject),
        aComment,
        TP.sc('Expected ', TP.id(anObject), ' to be null or undefined.'));

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - SIGNALING
//  ------------------------------------------------------------------------

TP.definePrimitive('assertNoRaise',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertNoSignal',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertNoThrow',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertRaises',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertSignals',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertThrows',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - STATE
//  ------------------------------------------------------------------------

TP.definePrimitive('assertActive',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);
    //TP.assert(TP.isActive(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be active.');

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertBusy',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);
    //TP.assert(TP.isBusy(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be busy.');

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertClosed',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);
    //TP.assert(TP.isClosed(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be closed.');

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertDisabled',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);
    //TP.assert(TP.isDisabled(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be disabled.');

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertEnabled',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);
    //TP.assert(!TP.isDisabled(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be enabled.');

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertFocused',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);
    //TP.assert(TP.isFocused(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be focused.');

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertInactive',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);
    //TP.assert(!TP.isActive(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be inactive.');

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertInvisible',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);
    //TP.assert(TP.isInvisible(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be invisible.');

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertNotBusy',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);
    //TP.assert(TP.isInvisible(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to not be busy.');

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertNotFocused',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);
    //TP.assert(!TP.isFocused(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be unfocused.');

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertNotReadonly',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);
    //TP.assert(!TP.isReadonly(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be writable.');

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertNotRelevant',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);
    //TP.assert(!TP.isRelevant(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be irrelevant.');

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertNotRequired',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);
    //TP.assert(!TP.isRequired(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be unrequired.');

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertNotSelected',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);
    //TP.assert(!TP.isSelected(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be unselected.');

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertOpen',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);
    //TP.assert(!TP.isClosed(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be open.');

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertReadonly',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);
    //TP.assert(TP.isReadonly(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be readonly.');

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertRelevant',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);
    //TP.assert(TP.isRelevant(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be relevant.');

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertRequired',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);
    //TP.assert(TP.isRequired(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be required.');

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertSelected',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);
    //TP.assert(TP.isSelected(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be selected.');

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertVisible',
function(anObject, aComment) {

    TP.assertMinArguments(arguments, 1);
    //TP.assert(!TP.isInvisible(anObject), aComment,
    //  'Expected ' + TP.id(anObject) + ' to be visible.');

    return;
});

//  ------------------------------------------------------------------------
//  ASSERTIONS - STRUCTURE
//  ------------------------------------------------------------------------

TP.definePrimitive('assertInAncestor',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertInDocument',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertInParent',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('assertInWindow',
function() {

    TP.todo();

    return;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('fail',
function(aComment) {

    throw new AssertionFailed(aComment);
});

//  ========================================================================
//  TPMock
//  ========================================================================


//  ------------------------------------------------------------------------


//  ========================================================================
//  TP.sig.TestRequest
//  ========================================================================

TP.sig.CodebaseRequest.defineSubtype('TestRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.TestRequest.addTypeAttribute('responseType', 'TP.sig.TestResponse');

//  ------------------------------------------------------------------------
//  Inst Methods
//  ------------------------------------------------------------------------

TP.sig.TestRequest.addInstMethod('reset',
function() {

    this.callNextMethod();

    //  Clear time/elapsed data or timeout conditions will arise which are
    //  not correct.
    this.$set('time', Date.now());
    this.$set('elapsed', null);

    return this;
});

//  ========================================================================
//  TP.sig.TestResponse
//  ========================================================================

TP.sig.CodebaseResponse.defineSubtype('TestResponse');

//  ========================================================================
//  TP.core.TestService
//  ========================================================================

TP.core.CodebaseService.defineSubtype('TestService');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.TestService.addTypeAttribute('triggerSignals',
                                        'TP.sig.TestRequest');

TP.core.TestService.register();

//  ------------------------------------------------------------------------
//  Inst Methods
//  ------------------------------------------------------------------------

TP.core.TestService.addInstMethod('handleTestRequest',
function(aRequest) {

    /**
     * @name handleTestRequest
     * @synopsis Responds to test requests, typically queued by the tsh:test
     *     command tag. The incoming request should include at least one test
     *     'case' in the targetCases key of the request's parameters.
     * @param {TP.sig.TestRequest} aRequest The test request to handle.
     */

    var shell,
        cases,
        params,

        obj,
        done,
        len,
        index,
        error,
        verbose,

        subrequest,
        limitFunc,
        stepFunc,

        debug,
        raise;

    TP.debug('break.tsh_test');

    if (!TP.canInvoke(aRequest, 'complete')) {
        this.raise('TP.sig.InvalidRequest', arguments);
        return;
    }

    debug = TP.sys.shouldUseDebugger();
    TP.sys.shouldUseDebugger(false);
    raise = TP.sys.shouldLogRaise();
    TP.sys.shouldLogRaise(false);

    //  let the request know we're handling it
    aRequest.isActive(true);

    shell = aRequest.at('cmdShell');
    cases = aRequest.at('targetCases');

    //  need to copy the original to avoid issues with either missing data
    //  or with altering the outer request's content/state during operation.
    params = aRequest.getPayload().copy();
    params.atPut('nobreaks', true);

    done = false;
    len = cases.getSize();
    index = 0;

    //  not all requests have a shell, but when there is one we can ask it
    //  to resolve arguments for us.
    if (TP.isValid(shell)) {
        verbose = shell.getArgument(aRequest, 'tsh:verbose', false);
    } else {
        verbose = TP.ifKeyInvalid(
                    aRequest,
                    'tsh:verbose',
                    TP.ifKeyInvalid(aRequest, 'verbose', false));
    }

    params.atPut('verbose', verbose);

    //  construct a subrequest we can use to manage the invocation of each
    //  object/case's runUnitTests method. Within the runUnitTests method
    //  there is other job/request logic specific to running the individual
    //  cases. all we require is that the subrequest we pass in be completed
    //  or failed so we know to move to the next object. NOTE that we
    //  connect our outer request's STDIO hooks to our subrequest for
    //  consistent IO.
    subrequest = TP.sig.TestRequest.construct(params);
    subrequest.configureSTDIO(aRequest);
    subrequest.set('time', Date.now());

    //  initialize test output
    if (verbose) {
        //  TODO:   expand on this.
        //out = '';
        //subrequest.stdout(out, params);
    }

    //  the limit function determines when the job should stop. we're
    //  running with a custom limit which is defined by a shared flag
    //  between our step and limit functions of 'done'.
    limitFunc =
        function(aJob, jobParams) {

            var out,
                msg;

            //  check the outer 'done' flag to see if our stepFunc has set
            //  it yet. Until then we're not limited and should keep
            //  running.
            if (done) {
                //  output final result summary
                if (verbose) {
                    //  TODO:   expand on this.
                    //out = '';
                    //subrequest.stdout(out, params);
                }

                //  Re-enable the overall debugger hook and logging state.
                TP.sys.shouldUseDebugger(debug);
                TP.sys.shouldLogRaise(raise);

                //  TODO:   Do we want summary data as the result value?
                //  TODO:   Do we want to invoke fail() if any tests failed
                //          or had errors? Probably.
                aRequest.complete();
            } else if (subrequest && obj) {
                if (aJob.getActiveTime() >
                    TP.sys.cfg('tsh.test_series_max')) {
                    msg = ' Series timeout limit exceeded.';
                    if (verbose) {
                        out = TP.link(obj, msg);
                        params.atPut('nobreaks', false);
                    } else {
                        out = TP.link(obj, '!', msg);
                        params.atPut('nobreaks', true);
                    }

                    error = true;
                    subrequest.stderr(out, params);

                    //  Timed out. We're done.
                    aRequest.fail();
                    done = true;
                }
            }

            return done;
        };

    //  the step function is what we'll do at each interval. in this
    //  case our mission is to manage/check on the request state for the
    //  subrequest to see if the current object has completed running its
    //  tests. as the subrequest completes we move to the next object and so
    //  on until all objects have been tested. once that's true we set the
    //  done flag and let the limit function and job control machinery
    //  handle the rest. this approach allows individual tests to be async
    //  such as those which need to simulate server calls, db calls, etc.
    stepFunc =
        function() {

            var ch,
                out;

            //  if the individual test completed it's time to do any
            //  teardown logic that should be done. Note that we don't care
            //  if the test failed or produced errors, teardown is always
            //  invoked.
            if (subrequest.isCompleted() &&
                TP.owns(obj, TP.TEST_TEARDOWN_NAME)) {
                try {
                    obj[TP.TEST_TEARDOWN_NAME](subrequest);
                } catch (e) {
                    ch = 'T';
                    out = TP.link(obj[TP.TEST_TEARDOWN_NAME], ch, e.message);
                    params.atPut('nobreaks', true);
                    subrequest.stderr(out, params);
                }
            }

            //  if we've processed all objects then we set the outer 'done'
            //  flag so our limitFunc will cause the job to shut down.
            if (subrequest.isCompleted()) {
                if (verbose) {
                    out = '';
                    params.atPut('nobreaks', false);
                } else {
                    out = '|';
                    params.atPut('nobreaks', true);
                }
                subrequest.stdout(out, params);

                if (index >= len) {
                    done = true;

                    if (verbose) {
                        out = 'eot';
                        params.atPut('nobreaks', false);
                    } else {
                        out = ';';
                        params.atPut('nobreaks', false);
                    }

                    subrequest.stdout(out, params);

                    return;
                }
            }

            //  if we're not just getting started (and hence have no active
            //  object under test) or the current subrequest is still
            //  running then just return and keep waiting.
            if (index !== 0 && !subrequest.isCompleted()) {
                return;
            }

            //  must be starting out or completed the previous object, time
            //  to get a new one.
            obj = cases.at(index);

            //  at each outer case/object level we'll either output the
            //  object's ID or a simple indicator that we're moving to a new
            //  object. when we're not verbose we also want to be sure to
            //  split output lines to keep the output clean.
            if (verbose) {
                //  TODO:   dress this up. maybe link to the object?
                out = TP.id(obj) + ':: ';
                params.atPut('nobreaks', false);
                subrequest.stdout(out, params);
            } else {
                out = '|';
                params.atPut('nobreaks', false);
                subrequest.stdout(out, params);
            }

            error = false;
            if (TP.owns(obj, TP.TEST_SETUP_NAME)) {
                try {
                    obj[TP.TEST_SETUP_NAME](subrequest);
                } catch (e) {
                    error = true;
                    ch = 'S';
                    out = TP.link(obj[TP.TEST_SETUP_NAME], ch, e.message);
                    params.atPut('nobreaks', true);

                    subrequest.stderr(out, params);
                    subrequest.fail();
                }
            }

            //  there was no error on the 'local' tests of the supplied object.
            //  However, if the supplied object is a type with methods on it
            //  (and not just a Function), then it needs to execute any
            //  type-level object tests and [type|inst|local] method tests that
            //  it has. Therefore, we need to call it's 'runUnitTests' method.
            if (!error) {
                //  make sure the object can handle test invocation.
                if (TP.canInvoke(obj, 'runUnitTests')) {
                    //  clear job control state for upcoming iteration
                    subrequest.reset();

                    try {
                        //  Note this can run async subcontent so we can't
                        //  output or do anything else here, we have to wait
                        //  until the subrequest is completed or it times
                        //  out.
                        obj.runUnitTests(subrequest);
                    } catch (e) {
                        error = true;
                        ch = 'E';
                        out = TP.link(obj, ch, e.message);
                        params.atPut('nobreaks', true);

                        subrequest.stderr(out, params);
                        subrequest.fail();
                    }
                } else {
                    if (verbose) {
                        out = 'no runUnitTests support';
                    } else {
                        out = '?';
                        params.atPut('nobreaks', true);
                    }
                    subrequest.stderr(out, params);
                    subrequest.complete();
                }
            }

            index++;
        };

    setTimeout(
        function() {

            //  run the job. the step and limit functions handle the rest.
            TP.schedule(TP.hc('step', stepFunc,
                                'limit', limitFunc,
                                'interval', 10));
        },0);

    return;
});

//  ========================================================================
//  TP.core.TestCase
//  ========================================================================

TP.lang.Object.defineSubtype('core:TestCase');

//  ========================================================================
//  TP.core.TestSuite
//  ========================================================================

TP.lang.Object.defineSubtype('core:TestSuite');

//  ------------------------------------------------------------------------

TP.core.TestSuite.addTypeMethod('addTestSuite',
function(aSuite) {

    TP.todo('Replace this with something more current.');
});

//  ========================================================================
//  TP.test.Expect
//  ========================================================================

TP.lang.Object.defineSubtype('test:Expect');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.test.Expect.addTypeConstant(
        'VALID_PRECEDING_OPS',
        TP.hc(
            'an', TP.ac('be'),
            'be', TP.ac('not', 'to'),
            'have', TP.ac('not', 'to', 'only'),
            'include', TP.ac('not', 'to'),
            'not', TP.ac('to'),
            'ok', TP.ac('be'),
            'only', TP.ac('not', 'to'),
            'own', TP.ac('have'),
            'to', TP.ac('not')
         ));

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.test.Expect.addInstAttribute('testObj');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.test.Expect.addInstMethod('init',
function(obj) {

    this.callNextMethod();

    this.set('testObj', obj);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.addInstMethod('an',
function(anObject) {

    alert('got to "an": ' + this.get('$methodChainNames').asJSONSource());

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.addInstMethod('be',
function(anObject) {

    alert('got to "be": ' + this.get('$methodChainNames').asJSONSource());

    return this;

    if (this.negated()) {
        TP.assertNotIdenticalTo(this.get('testObj'), anObject);
    } else {
        TP.assertIdenticalTo(this.get('testObj'), anObject);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.addInstMethod('negated',
function() {

    if (TP.isEmpty(this.get('$methodChainNames'))) {
        return false;
    }

    return this.get('$methodChainNames').contains('not');
});

//  ------------------------------------------------------------------------

TP.test.Expect.addInstMethod('not',
function(anObject) {

    alert('got to "not": ' + this.get('$methodChainNames').asJSONSource());

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.addInstMethod('ok',
function(anObject) {

    alert('got to "ok": ' + this.get('$methodChainNames').asJSONSource());

    return this;

    if (this.negated()) {
        TP.assertNotDefined(this.get('testObj'), anObject);
    }

    TP.assertIsDefined(this.get('testObj'), anObject);

    return this;
});

//  ------------------------------------------------------------------------

TP.test.Expect.addInstMethod('to',
function(anObject) {

    alert('got to "to": ' + this.get('$methodChainNames').asJSONSource());

    return this;
});

//  ------------------------------------------------------------------------
//  Instance Getters
//  ------------------------------------------------------------------------

TP.test.Expect.setupMethodChains(TP.test.Expect.VALID_PRECEDING_OPS);

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
