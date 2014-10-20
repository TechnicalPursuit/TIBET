//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//	========================================================================

//  Bug fixes for Sinon fake server

//  https://github.com/cjohansen/Sinon.JS/issues/559
TP.extern.sinon.FakeXMLHttpRequest.prototype.overrideMimeType =
    function() {return;};

//  https://github.com/cjohansen/Sinon.JS/issues/558
TP.extern.sinon.log = function() {return;};

//  ------------------------------------------------------------------------

//  Wiring Sinon over to the 'TP.test' namespace
TP.test.spy = TP.extern.sinon.spy;
TP.test.stub = TP.extern.sinon.stub;
TP.test.mock = TP.extern.sinon.mock;
TP.test.useFakeTimers = TP.extern.sinon.useFakeTimers;
TP.test.useFakeXMLHttpRequest = TP.extern.sinon.useXMLHttpRequest;
TP.test.fakeServer = TP.extern.sinon.fakeServer;
TP.test.sandbox = TP.extern.sinon.sandbox;

//  ------------------------------------------------------------------------
//  TP.FunctionProto
//  ------------------------------------------------------------------------

TP.FunctionProto.defineMethod('asSpy',
function() {

    /**
     * @name asSpy
     * @synopsis Creates a Sinon.JS 'spy' from the receiver.
     * @description If the receiver is a method on an object, then this method
     *     will replace that method with a spy. If the receiver is not a method,
     *     but just an unbound Function, this method will wrap it with a spy.
     *     In both cases, it returns the spying Function.
     * @returns {Function} The spying Function object.
     * @raises TP.sig.InvalidFunction
     */

    var name,
        owner;

    //  If the value (i.e. the method body) already has a '$spiedFunc', that
    //  means that a spy or stub has already been installed on it.
    if (TP.isMethod(this.$spiedFunc)) {
        return this.raise('TP.sig.InvalidFunction',
                            'Function is already a spy');
    }

    if (!TP.isMethod(this)) {
        return TP.test.spy(this);
    }

    name = this[TP.NAME];
    owner = this[TP.OWNER];

    return TP.test.spy(owner, name);
});

//  ------------------------------------------------------------------------

TP.FunctionProto.defineMethod('asStub',
function() {

    /**
     * @name asStub
     * @synopsis Creates a Sinon.JS 'stub' from the receiver.
     * @description If the receiver is a method on an object, then this method
     *     will replace that method with a stub. If the receiver is not a
     *     method, this method will raise a TP.sig.InvalidMethod exception.
     * @returns {Function} The stubbing Function object.
     * @raises TP.sig.InvalidParameter,TP.sig.InvalidFunction
     */

    var name,
        owner;

    if (!TP.isMethod(this)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  If the value (i.e. the method body) already has a '$spiedFunc', that
    //  means that a spy or stub has already been installed on it.
    if (TP.isMethod(this.$spiedFunc)) {
        return this.raise('TP.sig.InvalidFunction',
                            'Function is already a stub');
    }

    name = this[TP.NAME];
    owner = this[TP.OWNER];

    return TP.test.stub(owner, name);
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('defineSpy',
function(target, name, value, track, display) {

    /**
     * @name defineSpy
     * @synopsis Defines a Sinon.JS 'spy' on a TIBET-style method.
     * @param {Object} target The target object.
     * @param {String} name The method name.
     * @param {Object} value The method value (aka method 'body').
     * @param {String} track The method track (Inst, Type, Local).
     * @param {String} display The method display name. Defaults to the owner
     *     ID plus the track and name.
     * @returns {Function} The newly defined 'spy' method.
     * @raises TP.sig.InvalidFunction
     */

    var spyMethod;

    //  If the value (i.e. the method body) already has a '$spiedFunc', that
    //  means that a spy or stub has already been installed on it.
    if (TP.isMethod(value.$spiedFunc)) {
        return this.raise('TP.sig.InvalidFunction',
                            'Function is already a spy or stub');
    }

    spyMethod = value.asSpy();

    spyMethod[TP.NAME] = name;
    spyMethod[TP.OWNER] = target;
    spyMethod[TP.TRACK] = track;
    spyMethod[TP.DISPLAY] = display + '.spy';

    //  We also want to make sure we can get back to the original function
    //  that was installed so that we can restore.
    spyMethod.$spiedFunc = value;

    target[name] = spyMethod;

    return spyMethod;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('defineStub',
function(target, name, value, track, display) {

    /**
     * @name defineStub
     * @synopsis Defines a Sinon.JS 'stub' on a TIBET-style method.
     * @param {Object} target The target object.
     * @param {String} name The method name.
     * @param {Object} value The method value (aka method 'body').
     * @param {String} track The method track (Inst, Type, Local).
     * @param {String} display The method display name. Defaults to the owner
     *     ID plus the track and name.
     * @returns {Function} The newly defined 'stub' method.
     * @raises TP.sig.InvalidFunction
     */

    var stubMethod;

    //  If the value (i.e. the method body) already has a '$spiedFunc', that
    //  means that a spy or stub has already been installed on it.
    if (TP.isMethod(value.$spiedFunc)) {
        return this.raise('TP.sig.InvalidFunction',
                            'Function is already a spy or stub');
    }

    stubMethod = value.asStub();

    stubMethod[TP.NAME] = name;
    stubMethod[TP.OWNER] = target;
    stubMethod[TP.TRACK] = track;
    stubMethod[TP.DISPLAY] = display + '.stub';

    //  We also want to make sure we can get back to the original function
    //  that was installed so that we can restore.
    stubMethod.$spiedFunc = value;

    target[name] = stubMethod;

    return stubMethod;
});

//  ------------------------------------------------------------------------

TP.FunctionProto.defineMethod('restore',
function() {

    /**
     * @name restore
     * @synopsis Restores a method or Function that has had a Sinon.JS spy or
     *     stub installed on it.
     * @returns {Function} The original Function object that was spied or
     *     stubbed.
     */

    var spiedFunc,
        name,
        owner;

    //  If there is a $spiedFunc slot, then grab this method's TP.OWNER and set
    //  it back to that.

    if (TP.isMethod(spiedFunc = this.$spiedFunc)) {

        name = this[TP.NAME];
        owner = this[TP.OWNER];

        if (TP.isString(name) && TP.isValid(owner)) {
            owner[name] = spiedFunc;
        }
    }

    return spiedFunc;
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('restoreMethod',
function(methodName) {

    /**
     * @name restoreMethod
     * @synopsis Restores the original method from a Sinon.JS 'spy' or 'stub'
     *     that was placed on the receiver in place of the method named by the
     *     supplied name.
     * @param {String} methodName The name of the method that was spied or
     *     stubbed
     * @returns {Function} The original Function object that was spied or
     *     stubbed.
     * @raises TP.sig.InvalidString
     */

    var methodInfo,
        existingMethod;

    if (!TP.isString(methodName)) {
        return this.raise('TP.sig.InvalidString');
    }

    //  Get the method on the receiver by asking the reflection system.
    methodInfo = this.getMethodInfoFor(methodName);
    existingMethod = methodInfo.at('owner').getMethod(methodName);

    return existingMethod.restore();
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('spyOn',
function(methodName) {

    /**
     * @name spyOn
     * @synopsis Creates a Sinon.JS 'spy' on the receiver in place of the method
     *     named by the supplied name.
     * @param {String} methodName The name of the method to install a spy on.
     * @returns {Function} The spying Function object.
     * @raises TP.sig.InvalidString
     */

    var methodInfo,
        existingMethod;

    if (!TP.isString(methodName)) {
        return this.raise('TP.sig.InvalidString');
    }

    //  Get the method on the receiver by asking the reflection system.
    methodInfo = this.getMethodInfoFor(methodName);
    existingMethod = methodInfo.at('owner').getMethod(methodName);

    return TP.defineSpy(methodInfo.at('owner'),
                        methodInfo.at('name'),
                        existingMethod,
                        methodInfo.at('track'),
                        methodInfo.at('display'));
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('stubOn',
function(methodName) {

    /**
     * @name stubOn
     * @synopsis Creates a Sinon.JS 'stub' on the receiver in place of the method
     *     named by the supplied name.
     * @param {String} methodName The name of the method to install a stub on.
     * @returns {Function} The stubbing Function object.
     * @raises TP.sig.InvalidString
     */

    var methodInfo,
        existingMethod;

    if (!TP.isString(methodName)) {
        return this.raise('TP.sig.InvalidString');
    }

    //  Get the method on the receiver by asking the reflection system.
    methodInfo = this.getMethodInfoFor(methodName);
    existingMethod = methodInfo.at('owner').getMethod(methodName);

    return TP.defineStub(methodInfo.at('owner'),
                            methodInfo.at('name'),
                            existingMethod,
                            methodInfo.at('track'),
                            methodInfo.at('display'));
});

//	------------------------------------------------------------------------
//	end
//	========================================================================
