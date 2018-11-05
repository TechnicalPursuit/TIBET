//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  Bug fixes for Sinon fake server

//  https://github.com/cjohansen/Sinon.JS/issues/559
TP.extern.sinon.FakeXMLHttpRequest.prototype.overrideMimeType = function() {
    return;
};

//  https://github.com/cjohansen/Sinon.JS/issues/558
TP.extern.sinon.log = function() {
    return;
};

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
     * @method asSpy
     * @summary Creates a Sinon.JS 'spy' from the receiver.
     * @description If the receiver is a method on an object, then this method
     *     will replace that method with a spy. If the receiver is not a method,
     *     but just an unbound Function, this method will wrap it with a spy.
     *     In both cases, it returns the spying Function.
     * @exception TP.sig.InvalidFunction
     * @returns {Function} The spying Function object.
     */

    var spy;

    //  If the value (i.e. the method body) already has a '$spiedFunc', that
    //  means that a spy or stub has already been installed on it.
    if (TP.isMethod(this.$spiedFunc)) {
        return this.raise('TP.sig.InvalidFunction',
                            'Function is already a spy');
    }

    spy = TP.test.spy(this);
    spy.$spiedFunc = this;

    if (!TP.isMethod(this)) {
        return spy;
    }

    spy[TP.NAME] = this[TP.NAME];
    spy[TP.OWNER] = this[TP.OWNER];
    spy[TP.TRACK] = this[TP.TRACK];
    spy[TP.DISPLAY] = this[TP.DISPLAY] + '.spy';

    return spy;
});

//  ------------------------------------------------------------------------

TP.FunctionProto.defineMethod('asStub',
function(altValue) {

    /**
     * @method asStub
     * @summary Creates a Sinon.JS 'stub' from the receiver.
     * @description If the receiver is a method on an object, then this method
     *     will replace that method with a stub. If the receiver is not a
     *     method, this method will raise a TP.sig.InvalidMethod exception.
     * @param {Object} altValue The alternative method value (aka method 'body').
     * @exception TP.sig.InvalidParameter
     * @exception TP.sig.InvalidFunction
     * @returns {Function} The stubbing Function object.
     */

    var stub;

    if (!TP.isMethod(this)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  If the value (i.e. the method body) already has a '$spiedFunc', that
    //  means that a spy or stub has already been installed on it.
    if (TP.isMethod(this.$spiedFunc)) {
        return this.raise('TP.sig.InvalidFunction',
                            'Function is already a stub');
    }

    stub = TP.test.stub(this[TP.OWNER], this[TP.NAME]).callsFake(altValue);
    stub.$spiedFunc = this;

    stub[TP.NAME] = this[TP.NAME];
    stub[TP.OWNER] = this[TP.OWNER];
    stub[TP.TRACK] = this[TP.TRACK];
    stub[TP.DISPLAY] = this[TP.DISPLAY] + '.stub';

    return stub;
});

//  ------------------------------------------------------------------------

TP.FunctionProto.defineMethod('restore',
function() {

    /**
     * @method restore
     * @summary Restores a method or Function that has had a Sinon.JS spy or
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
     * @method restoreMethod
     * @summary Restores the original method from a Sinon.JS 'spy' or 'stub'
     *     that was placed on the receiver in place of the method named by the
     *     supplied name.
     * @param {String} methodName The name of the method that was spied or
     *     stubbed
     * @exception TP.sig.InvalidString
     * @returns {Function} The original Function object that was spied or
     *     stubbed.
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
     * @method spyOn
     * @summary Creates a Sinon.JS 'spy' on the receiver in place of the method
     *     named by the supplied name.
     * @param {String} methodName The name of the method to install a spy on.
     * @exception TP.sig.InvalidString
     * @returns {Function} The spying Function object.
     */

    var methodInfo,
        existingMethod;

    if (!TP.isString(methodName)) {
        return this.raise('TP.sig.InvalidString');
    }

    //  Get the method on the receiver by asking the reflection system.
    methodInfo = this.getMethodInfoFor(methodName);
    existingMethod = methodInfo.at('owner').getMethod(methodName);

    return existingMethod.asSpy();
});

//  ------------------------------------------------------------------------

TP.defineMetaInstMethod('stubOn',
function(methodName, altValue) {

    /**
     * @method stubOn
     * @summary Creates a Sinon.JS 'stub' on the receiver in place of the method
     *     named by the supplied name.
     * @param {String} methodName The name of the method to install a stub on.
     * @param {Object} altValue The alternative method value (aka method 'body').
     * @exception TP.sig.InvalidString
     * @returns {Function} The stubbing Function object.
     */

    var methodInfo,
        existingMethod;

    if (!TP.isString(methodName)) {
        return this.raise('TP.sig.InvalidString');
    }

    //  Get the method on the receiver by asking the reflection system.
    methodInfo = this.getMethodInfoFor(methodName);
    existingMethod = methodInfo.at('owner').getMethod(methodName);

    return existingMethod.asStub(altValue);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
