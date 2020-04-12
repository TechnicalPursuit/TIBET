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
 * Tests for signaling methods.
 */

//  ------------------------------------------------------------------------

TP.sig.Signal.defineSubtype('test.SignalTestFull');
TP.sig.Signal.defineSubtype('SignalTest');

//  ---

TP.test.SignalingTester = TP.lang.Object.construct();

//  Counter for ANY signal FALSE capture ANY origin ANY state
TP.test.SignalingTester.defineAttribute(
            'level1_ANY_FALSE_ANY_ANY');


//  Counter for ANY signal FALSE capture SignalTestOrigin origin ANY state
TP.test.SignalingTester.defineAttribute(
            'level1_ANY_FALSE_SignalTestOrigin_ANY');

//  Counter for TP.test.SignalTestFull signal FALSE capture ANY origin ANY state
TP.test.SignalingTester.defineAttribute(
            'level1_TP_Test_SignalTestFull_FALSE_ANY_ANY');

//  Counter for ANY signal FALSE capture ANY origin TestState state
TP.test.SignalingTester.defineAttribute(
            'level1_TestState_FALSE_ANY_ANY');


//  Counter for TP.test.SignalTestFull signal FALSE capture SignalTestOrigin
//  origin ANY state
TP.test.SignalingTester.defineAttribute(
            'level1_TP_test_SignalTestFull_FALSE_SignalTestOrigin_ANY');

//  Counter for ANY signal FALSE capture SignalTestOrigin origin TestState state
TP.test.SignalingTester.defineAttribute(
            'level1_TestState_FALSE_SignalTestOrigin_ANY');

//  Counter for TP.test.SignalTestFull signal FALSE capture ANY origin
//  TestState state
TP.test.SignalingTester.defineAttribute(
            'level1_TP_test_SignalTestFull_FALSE_ANY_TestState');


//  Counter for TP.test.SignalTestFull signal FALSE capture SignalTestOrigin
//  origin TestState state
TP.test.SignalingTester.defineAttribute(
            'level1_TP_test_SignalTestFull_FALSE_SignalTestOrigin_TestState');

//  ---

TP.test.SignalingTester.defineMethod('incrementCount',
function(propName) {
    this.set(propName, this.get(propName) + 1);
});

//  ---

TP.test.SignalingTester.defineMethod('resetCount',
function(propName) {
    this.set(propName, 0);
});

//  ------------------------------------------------------------------------

TP.lang.Object.Inst.describe('Signaling - expand/contract String signal names',
function() {

    this.it('expand/contract TP signal names', function(test, options) {

        var testname;

        //  Already at full name - leave it.
        testname = TP.expandSignalName('TP.sig.Fluffy');
        test.assert.isEqualTo(testname, 'TP.sig.Fluffy');

        //  Only have partial name - expand it by prefixing with 'TP.sig.'
        testname = TP.expandSignalName('Fluffy');
        test.assert.isEqualTo(testname, 'TP.sig.Fluffy');

        //  Have full name - contract it by slicing off 'TP.sig.'
        testname = TP.contractSignalName('TP.sig.Fluffy');
        test.assert.isEqualTo(testname, 'Fluffy');

        //  Only have partial name - leave it.
        testname = TP.contractSignalName('Fluffy');
        test.assert.isEqualTo(testname, 'Fluffy');
    });

    //  ---

    this.it('expand/contract APP signal names', function(test, options) {

        var testname;

        //  Already at full name - leave it.
        testname = TP.expandSignalName('APP.Fluffy');
        test.assert.isEqualTo(testname, 'APP.Fluffy');

        //  Only have partial name - expand it by prefixing with 'TP.sig.' - we
        //  can't know any different
        testname = TP.expandSignalName('Fluffy');
        test.assert.isEqualTo(testname, 'TP.sig.Fluffy');

        //  Have full name - leave it.
        testname = TP.contractSignalName('APP.Fluffy');
        test.assert.isEqualTo(testname, 'APP.Fluffy');

        //  Only have partial name - leave it.
        testname = TP.contractSignalName('Fluffy');
        test.assert.isEqualTo(testname, 'Fluffy');
    });

    //  ---

    this.it('expand/contract other signal names', function(test, options) {

        var testname;

        //  Already at full name - leave it.
        testname = TP.expandSignalName('FooCorp.Fluffy');
        test.assert.isEqualTo(testname, 'TP.FooCorp.Fluffy');

        //  Only have partial name - expand it by prefixing with 'TP.sig.' - we
        //  can't know any different
        testname = TP.expandSignalName('Fluffy');
        test.assert.isEqualTo(testname, 'TP.sig.Fluffy');

        //  Have full name - leave it.
        testname = TP.contractSignalName('FooCorp.Fluffy');
        test.assert.isEqualTo(testname, 'FooCorp.Fluffy');

        //  Only have partial name - leave it.
        testname = TP.contractSignalName('Fluffy');
        test.assert.isEqualTo(testname, 'Fluffy');
    });
});

//  ------------------------------------------------------------------------

TP.lang.Object.Inst.describe('Signaling - expand/contract Type signal names',
function() {

    this.it('expand/contract TP signal names', function(test, options) {

        var sigType,
            sigInst,

            signame,
            testname;

        sigType = TP.sig.Signal.defineSubtype('TPTestSignal');
        sigInst = sigType.construct();

        //  The signal name will be the 'fully qualified' name
        signame = sigInst.getSignalName();

        //  Already at full name - leave it.
        testname = TP.expandSignalName(signame);
        test.assert.isEqualTo(testname, 'TP.sig.TPTestSignal');

        //  Have full name - contract it by slicing off 'TP.sig.'
        testname = TP.contractSignalName(signame);
        test.assert.isEqualTo(testname, 'TPTestSignal');

        //  Only have partial name - expand it by searching in namespaces. Since
        //  it was defined as a type, it will be found in the 'TP.sig.'
        //  namespace.
        testname = TP.expandSignalName('TPTestSignal');
        test.assert.isEqualTo(testname, 'TP.sig.TPTestSignal');
    });

    //  ---

    this.it('expand/contract APP signal names', function(test, options) {

        var sigType,
            sigInst,

            signame,
            testname;

        sigType = TP.sig.Signal.defineSubtype('APP.sig.APPTestSignal');
        sigInst = sigType.construct();

        //  The signal name will be the 'fully qualified' name
        signame = sigInst.getSignalName();

        //  Already at full name - leave it.
        testname = TP.expandSignalName(signame);
        test.assert.isEqualTo(testname, 'APP.sig.APPTestSignal');

        //  Have full name - leave it.
        testname = TP.contractSignalName(signame);
        test.assert.isEqualTo(testname, 'APP.sig.APPTestSignal');

        //  Only have partial name - expand it by searching in namespaces. Since
        //  it was defined as a type, it will be found in the 'APP.sig.'
        //  namespace.
        testname = TP.expandSignalName('APPTestSignal');
        test.assert.isEqualTo(testname, 'APP.sig.APPTestSignal');
    });

    //  ---

    this.it('expand/contract other signal names', function(test, options) {

        var sigType,
            sigInst,

            signame,
            testname;

        sigType = TP.sig.Signal.defineSubtype(
                                'APP.FooCorp.FluffyTestSignal');
        sigInst = sigType.construct();

        //  The signal name will be the 'fully qualified' name
        signame = sigInst.getSignalName();

        //  Already at full name - leave it.
        testname = TP.expandSignalName(signame);
        test.assert.isEqualTo(testname, 'APP.FooCorp.FluffyTestSignal');

        //  Have full name - leave it.
        testname = TP.contractSignalName(signame);
        test.assert.isEqualTo(testname, 'APP.FooCorp.FluffyTestSignal');

        //  Only have partial name - expand it by searching in namespaces. Since
        //  it was defined as a type, it will be found in the 'APP.FooCorp.'
        //  namespace.
        testname = TP.expandSignalName('FluffyTestSignal');
        test.assert.isEqualTo(testname, 'APP.FooCorp.FluffyTestSignal');
    });
});

//  ------------------------------------------------------------------------

TP.lang.Object.Inst.describe('Signaling - getBestHandler - Level 1',
function() {

    var sigOrigin,

        level1_ANY_FALSE_ANY_ANY,

        level1_ANY_FALSE_SignalTestOrigin_ANY,
        level1_TP_Test_SignalTestFull_FALSE_ANY_ANY,
        level1_TestState_FALSE_ANY_ANY,

        level1_TP_test_SignalTestFull_FALSE_SignalTestOrigin_ANY,
        level1_TestState_FALSE_SignalTestOrigin_ANY,
        level1_TP_test_SignalTestFull_FALSE_ANY_TestState,

        level1_TP_test_SignalTestFull_FALSE_SignalTestOrigin_TestState;

    this.before(
        function(suite, options) {

            sigOrigin = TP.lang.Object.construct();
            sigOrigin.setID('SignalTestOrigin');

            TP.lang.Object.defineSubtype('test.HandlerTestLevel1');

            //  --- Level 1 ANY_FALSE_ANY_ANY

            level1_ANY_FALSE_ANY_ANY =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                                                'level1_ANY_FALSE_ANY_ANY');
                };
            TP.test.HandlerTestLevel1.defineHandler(TP.ANY,
                level1_ANY_FALSE_ANY_ANY);

            //  --- Level 1 ANY_FALSE_SignalTestOrigin_ANY

            level1_ANY_FALSE_SignalTestOrigin_ANY =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                                    'level1_ANY_FALSE_SignalTestOrigin_ANY');
                };
            TP.test.HandlerTestLevel1.defineHandler(TP.ANY,
                level1_ANY_FALSE_SignalTestOrigin_ANY,
                {
                    origin: sigOrigin
                });

            //  --- Level 1 TP_Test_SignalTestFull_FALSE_ANY_ANY

            level1_TP_Test_SignalTestFull_FALSE_ANY_ANY =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                                    'level1_TP_Test_SignalTestFull_FALSE_ANY_ANY');
                };
            TP.test.HandlerTestLevel1.defineHandler(TP.test.SignalTestFull,
                level1_TP_Test_SignalTestFull_FALSE_ANY_ANY);

            //  --- Level 1 TestState_FALSE_ANY_ANY

            level1_TestState_FALSE_ANY_ANY =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                                    'level1_TestState_FALSE_ANY_ANY');
                };
            TP.test.HandlerTestLevel1.defineHandler(TP.ANY,
                level1_TestState_FALSE_ANY_ANY,
                {
                    state: 'TestState'
                });

            //  --- Level 1 TP_test_SignalTestFull_FALSE_SignalTestOrigin_ANY

            level1_TP_test_SignalTestFull_FALSE_SignalTestOrigin_ANY =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                        'level1_TP_test_SignalTestFull_FALSE_SignalTestOrigin_ANY');
                };
            TP.test.HandlerTestLevel1.defineHandler(TP.test.SignalTestFull,
                level1_TP_test_SignalTestFull_FALSE_SignalTestOrigin_ANY,
                {
                    origin: sigOrigin
                });


            //  --- Level 1 TestState_FALSE_SignalTestOrigin_ANY

            level1_TestState_FALSE_SignalTestOrigin_ANY =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                                    'level1_TestState_FALSE_SignalTestOrigin_ANY');
                };
            TP.test.HandlerTestLevel1.defineHandler(TP.ANY,
                level1_TestState_FALSE_SignalTestOrigin_ANY,
                {
                    origin: sigOrigin,
                    state: 'TestState'
                });

            //  --- Level 1 TP_test_SignalTestFull_FALSE_ANY_TestState

            level1_TP_test_SignalTestFull_FALSE_ANY_TestState =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                                'level1_TP_test_SignalTestFull_FALSE_ANY_TestState');
                };
            TP.test.HandlerTestLevel1.defineHandler(TP.test.SignalTestFull,
                level1_TP_test_SignalTestFull_FALSE_ANY_TestState,
                {
                    state: 'TestState'
                });

            //  --- Level 1 TP_test_SignalTestFull_FALSE_SignalTestOrigin_TestState

            level1_TP_test_SignalTestFull_FALSE_SignalTestOrigin_TestState =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                    'level1_TP_test_SignalTestFull_FALSE_SignalTestOrigin_TestState');
                };
            TP.test.HandlerTestLevel1.defineHandler(TP.test.SignalTestFull,
                level1_TP_test_SignalTestFull_FALSE_SignalTestOrigin_TestState,
                {
                    origin: sigOrigin,
                    state: 'TestState'
                });
        });

    this.it('getBestHandler - Level 1 - ANY signal / FALSE capturing / ANY origin / ANY state', function(test, options) {

        var signal,
            handler;

        signal = TP.sig.SignalMap.$getSignalInstance('SignalTest');

        //  We could've also used
        handler = TP.test.HandlerTestLevel1.getBestHandler(signal);

        test.assert.isMethod(handler);
        test.assert.isIdenticalTo(
                        handler,
                        level1_ANY_FALSE_ANY_ANY);
        handler();
        test.assert.isEqualTo(
                TP.test.SignalingTester.get(
                        'level1_ANY_FALSE_ANY_ANY'),
                1);
    });

    //  ---

    this.it('getBestHandler - Level 1 - ANY signal / FALSE capturing / SignalTestOrigin origin / ANY state', function(test, options) {

        var signal,
            handler;

        signal = TP.sig.SignalMap.$getSignalInstance('SignalTest');
        signal.setOrigin(sigOrigin.getID());

        handler = TP.test.HandlerTestLevel1.getBestHandler(signal);

        test.assert.isMethod(handler);
        test.assert.isIdenticalTo(handler,
                        level1_ANY_FALSE_SignalTestOrigin_ANY);
        handler();
        test.assert.isEqualTo(
                TP.test.SignalingTester.get(
                        'level1_ANY_FALSE_SignalTestOrigin_ANY'),
                1);
    });

    this.it('getBestHandler - Level 1 - TP.test.SignalTestFull signal / FALSE capturing / ANY origin / ANY state', function(test, options) {

        var signal,
            handler;

        signal = TP.sig.SignalMap.$getSignalInstance('TP.test.SignalTestFull');

        handler = TP.test.HandlerTestLevel1.getBestHandler(signal);

        test.assert.isMethod(handler);
        test.assert.isIdenticalTo(handler,
                        level1_TP_Test_SignalTestFull_FALSE_ANY_ANY);
        handler();
        test.assert.isEqualTo(
                TP.test.SignalingTester.get(
                        'level1_TP_Test_SignalTestFull_FALSE_ANY_ANY'),
                1);
    });

    this.it('getBestHandler - Level 1 - ANY signal / FALSE capturing / ANY origin / TestState state', function(test, options) {

        var machine,
            signal,
            handler;

        machine = TP.core.StateMachine.construct();
        TP.sys.getApplication().setStateMachine(machine);
        machine.defineState(null, 'TestState');
        machine.activate('TestState');

        signal = TP.sig.SignalMap.$getSignalInstance('SignalTest');

        handler = TP.test.HandlerTestLevel1.getBestHandler(signal);

        test.assert.isMethod(handler);
        test.assert.isIdenticalTo(
                        handler,
                        level1_TestState_FALSE_ANY_ANY);
        handler();
        test.assert.isEqualTo(
                TP.test.SignalingTester.get(
                        'level1_TestState_FALSE_ANY_ANY'),
                1);

        machine.deactivate(true);
        TP.sys.getApplication().removeStateMachine(machine);
    });

    //  ---

    this.it('getBestHandler - Level 1 - TP.test.SignalTestFull signal / FALSE capturing / SignalTestOrigin origin / ANY state', function(test, options) {

        var signal,
            handler;

        signal = TP.sig.SignalMap.$getSignalInstance('TP.test.SignalTestFull');
        signal.setOrigin(sigOrigin.getID());

        handler = TP.test.HandlerTestLevel1.getBestHandler(signal);

        test.assert.isMethod(handler);
        test.assert.isIdenticalTo(handler,
                        level1_TP_test_SignalTestFull_FALSE_SignalTestOrigin_ANY);
        handler();
        test.assert.isEqualTo(
                TP.test.SignalingTester.get(
                        'level1_TP_test_SignalTestFull_FALSE_SignalTestOrigin_ANY'),
                1);
    });

    this.it('getBestHandler - Level 1 - ANY signal / FALSE capturing / SignalTestOrigin origin / TestState state', function(test, options) {

        var machine,
            signal,
            handler;

        machine = TP.core.StateMachine.construct();
        TP.sys.getApplication().setStateMachine(machine);
        machine.defineState(null, 'TestState');
        machine.activate('TestState');

        signal = TP.sig.SignalMap.$getSignalInstance('SignalTest');
        signal.setOrigin(sigOrigin.getID());

        handler = TP.test.HandlerTestLevel1.getBestHandler(signal);

        test.assert.isMethod(handler);
        test.assert.isIdenticalTo(handler,
                        level1_TestState_FALSE_SignalTestOrigin_ANY);
        handler();
        test.assert.isEqualTo(
                TP.test.SignalingTester.get(
                        'level1_TestState_FALSE_SignalTestOrigin_ANY'),
                1);

        machine.deactivate(true);
        TP.sys.getApplication().removeStateMachine(machine);
    });

    this.it('getBestHandler - Level 1 - TP.test.SignalTestFull signal / FALSE capturing / ANY origin / TestState state', function(test, options) {

        var machine,
            signal,
            handler;

        machine = TP.core.StateMachine.construct();
        TP.sys.getApplication().setStateMachine(machine);
        machine.defineState(null, 'TestState');
        machine.activate('TestState');

        signal = TP.sig.SignalMap.$getSignalInstance('TP.test.SignalTestFull');

        handler = TP.test.HandlerTestLevel1.getBestHandler(signal);

        test.assert.isMethod(handler);
        test.assert.isIdenticalTo(handler,
                        level1_TP_test_SignalTestFull_FALSE_ANY_TestState);
        handler();
        test.assert.isEqualTo(
                TP.test.SignalingTester.get(
                        'level1_TP_test_SignalTestFull_FALSE_ANY_TestState'),
                1);

        machine.deactivate(true);
        TP.sys.getApplication().removeStateMachine(machine);
    });

    this.it('getBestHandler - Level 1 - TP.test.SignalTestFull signal / FALSE capturing / SignalTestOrigin origin / TestState state', function(test, options) {

        var machine,
            signal,
            handler;

        machine = TP.core.StateMachine.construct();
        TP.sys.getApplication().setStateMachine(machine);
        machine.defineState(null, 'TestState');
        machine.activate('TestState');

        signal = TP.sig.SignalMap.$getSignalInstance('TP.test.SignalTestFull');
        signal.setOrigin(sigOrigin.getID());

        handler = TP.test.HandlerTestLevel1.getBestHandler(signal);

        test.assert.isMethod(handler);
        test.assert.isIdenticalTo(handler,
                    level1_TP_test_SignalTestFull_FALSE_SignalTestOrigin_TestState);
        handler();
        test.assert.isEqualTo(
                TP.test.SignalingTester.get(
                    'level1_TP_test_SignalTestFull_FALSE_SignalTestOrigin_TestState'),
                1);

        machine.deactivate(true);
        TP.sys.getApplication().removeStateMachine(machine);
    });
});

//  ------------------------------------------------------------------------

TP.lang.Object.Inst.describe('Signaling - URN-registered object handler reference',
function() {

    this.it('URN-registered object handler', function(test, options) {

        var receiverObj,
            receiverObjID,
            senderObj,

            obj;

        //  Construct a TP.lang.Object
        receiverObj = TP.lang.Object.construct();

        receiverObjID = 'URNTestObj1';
        receiverObj.setID(receiverObjID);


        senderObj = TP.lang.Object.construct();

        senderObj.defineAttribute('lastName');
        senderObj.defineAttribute('firstName');
        senderObj.shouldSignalChange(true);

        receiverObj.observe(senderObj, 'LastNameChange');
        receiverObj.observe(senderObj, 'FirstNameChange');

        //  Two observations, this should be valid
        obj = TP.uc('urn:tibet:' + receiverObjID).getResource().get('result');

        test.assert.isValid(obj, 'After initial observes');

        //  Remove one observation - this should still be valid
        receiverObj.ignore(senderObj, 'LastNameChange');
        obj = TP.uc('urn:tibet:' + receiverObjID).getResource().get('result');

        test.assert.isValid(obj, 'After first ignore.');

        //  Remove second observation - this should now be invalid
        receiverObj.ignore(senderObj, 'FirstNameChange');
        obj = TP.uc('urn:tibet:' + receiverObjID).getResource().get('result');

        test.refute.isValid(obj, 'After second ignore.');
    });
}).skip();  // TODO: review. This test is a) weird, b) probably obsolete.

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
