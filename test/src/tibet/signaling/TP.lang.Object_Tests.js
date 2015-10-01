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
        function() {

            sigOrigin = TP.lang.Object.construct();
            sigOrigin.setID('SignalTestOrigin');

            TP.lang.Object.defineSubtype('test.HandlerTestLevel1');

            //  --- Level 1 ANY_FALSE_ANY_ANY

            level1_ANY_FALSE_ANY_ANY =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                                                'level1_ANY_FALSE_ANY_ANY');
                };
            TP.test.HandlerTestLevel1.defineHandler(
                {
                },
                level1_ANY_FALSE_ANY_ANY);

            //  --- Level 1 ANY_FALSE_SignalTestOrigin_ANY

            level1_ANY_FALSE_SignalTestOrigin_ANY =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                                    'level1_ANY_FALSE_SignalTestOrigin_ANY');
                };
            TP.test.HandlerTestLevel1.defineHandler(
                {
                    origin: sigOrigin
                },
                level1_ANY_FALSE_SignalTestOrigin_ANY);

            //  --- Level 1 TP_Test_SignalTestFull_FALSE_ANY_ANY

            level1_TP_Test_SignalTestFull_FALSE_ANY_ANY =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                                    'level1_TP_Test_SignalTestFull_FALSE_ANY_ANY');
                };
            TP.test.HandlerTestLevel1.defineHandler(
                {
                    signal: TP.test.SignalTestFull
                },
                level1_TP_Test_SignalTestFull_FALSE_ANY_ANY);

            //  --- Level 1 TestState_FALSE_ANY_ANY

            level1_TestState_FALSE_ANY_ANY =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                                    'level1_TestState_FALSE_ANY_ANY');
                };
            TP.test.HandlerTestLevel1.defineHandler(
                {
                    state: 'TestState'
                },
                level1_TestState_FALSE_ANY_ANY);

            //  --- Level 1 TP_test_SignalTestFull_FALSE_SignalTestOrigin_ANY

            level1_TP_test_SignalTestFull_FALSE_SignalTestOrigin_ANY =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                        'level1_TP_test_SignalTestFull_FALSE_SignalTestOrigin_ANY');
                };
            TP.test.HandlerTestLevel1.defineHandler(
                {
                    origin: sigOrigin,
                    signal: TP.test.SignalTestFull
                },
                level1_TP_test_SignalTestFull_FALSE_SignalTestOrigin_ANY);

            //  --- Level 1 TestState_FALSE_SignalTestOrigin_ANY

            level1_TestState_FALSE_SignalTestOrigin_ANY =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                                    'level1_TestState_FALSE_SignalTestOrigin_ANY');
                };
            TP.test.HandlerTestLevel1.defineHandler(
                {
                    origin: sigOrigin,
                    state: 'TestState'
                },
                level1_TestState_FALSE_SignalTestOrigin_ANY);

            //  --- Level 1 TP_test_SignalTestFull_FALSE_ANY_TestState

            level1_TP_test_SignalTestFull_FALSE_ANY_TestState =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                                'level1_TP_test_SignalTestFull_FALSE_ANY_TestState');
                };
            TP.test.HandlerTestLevel1.defineHandler(
                {
                    signal: TP.test.SignalTestFull,
                    state: 'TestState'
                },
                level1_TP_test_SignalTestFull_FALSE_ANY_TestState);

            //  --- Level 1 TP_test_SignalTestFull_FALSE_SignalTestOrigin_TestState

            level1_TP_test_SignalTestFull_FALSE_SignalTestOrigin_TestState =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                    'level1_TP_test_SignalTestFull_FALSE_SignalTestOrigin_TestState');
                };
            TP.test.HandlerTestLevel1.defineHandler(
                {
                    origin: sigOrigin,
                    signal: TP.test.SignalTestFull,
                    state: 'TestState'
                },
                level1_TP_test_SignalTestFull_FALSE_SignalTestOrigin_TestState);
        });

    this.it('getBestHandler - Level 1 - ANY signal / FALSE capturing / ANY origin / ANY state', function(test, options) {

        var signal,
            handler;

        signal = TP.sig.SignalMap.$getSignalInstance('SignalTest');

        //  We could've also used
        handler = TP.test.HandlerTestLevel1.getBestHandler(signal)

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
        TP.sys.getApplication().setStateMachine(null);
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
        TP.sys.getApplication().setStateMachine(null);
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
        TP.sys.getApplication().setStateMachine(null);
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
        TP.sys.getApplication().setStateMachine(null);
    });
});

//  ========================================================================
//  Run those babies!
//  ------------------------------------------------------------------------

/*
TP.lang.Object.Inst.runTestSuites();
*/

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
