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

//  Counter for ANY origin ANY signal ANY state
TP.test.SignalingTester.defineAttribute('level1_ANY_ANY_ANY');


//  Counter for SignalTestOrigin origin ANY signal ANY state
TP.test.SignalingTester.defineAttribute('level1_SignalTestOrigin_ANY_ANY');

//  Counter for ANY origin TP.test.SignalTestFull signal ANY state
TP.test.SignalingTester.defineAttribute('level1_ANY_TP_test_SignalTestFull_ANY');

//  Counter for ANY origin ANY signal TestState state
TP.test.SignalingTester.defineAttribute('level1_ANY_ANY_TestState');


//  Counter for SignalTestOrigin origin TP.test.SignalTestFull signal ANY state
TP.test.SignalingTester.defineAttribute('level1_SignalTestOrigin_TP_test_SignalTestFull_ANY');

//  Counter for SignalTestOrigin origin ANY signal TestState state
TP.test.SignalingTester.defineAttribute('level1_SignalTestOrigin_ANY_TestState');

//  Counter for ANY origin TP.test.SignalTestFull signal TestState state
TP.test.SignalingTester.defineAttribute('level1_ANY_TP_test_SignalTestFull_TestState');


//  Counter for SignalTestOrigin origin TP.test.SignalTestFull signal TestState state
TP.test.SignalingTester.defineAttribute('level1_SignalTestOrigin_TP_test_SignalTestFull_TestState');

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

TP.lang.Object.Inst.describe('Signaling - getHandler',
function() {

    var sigOrigin,

        level1_ANY_ANY_ANY,

        level1_SignalTestOrigin_ANY_ANY,
        level1_ANY_TP_test_SignalTestFull_ANY,
        level1_ANY_ANY_TestState,

        level1_SignalTestOrigin_TP_test_SignalTestFull_ANY,
        level1_SignalTestOrigin_ANY_TestState,
        level1_ANY_TP_test_SignalTestFull_TestState,

        level1_SignalTestOrigin_TP_test_SignalTestFull_TestState;

    this.before(
        function() {

            sigOrigin = TP.lang.Object.construct();
            sigOrigin.setID('SignalTestOrigin');

            TP.lang.Object.defineSubtype('test.HandlerTestLevel1');

            //  --- Level 1 ANY_ANY_ANY

            level1_ANY_ANY_ANY =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                                                'level1_ANY_ANY_ANY');
                };
            TP.test.HandlerTestLevel1.defineHandler2(
                level1_ANY_ANY_ANY,
                {
                });

            //  --- Level 1 SignalTestOrigin_ANY_ANY

            level1_SignalTestOrigin_ANY_ANY =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                                    'level1_SignalTestOrigin_ANY_ANY');
                };
            TP.test.HandlerTestLevel1.defineHandler2(
                level1_SignalTestOrigin_ANY_ANY,
                {
                    origin: sigOrigin
                });

            //  --- Level 1 ANY_TP.test.SignalTestFull_ANY

            level1_ANY_TP_test_SignalTestFull_ANY =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                                    'level1_ANY_TP_test_SignalTestFull_ANY');
                };
            TP.test.HandlerTestLevel1.defineHandler2(
                level1_ANY_TP_test_SignalTestFull_ANY,
                {
                    signal: TP.test.SignalTestFull
                });

            //  --- Level 1 ANY_ANY_TestState

            level1_ANY_ANY_TestState =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                                    'level1_ANY_ANY_TestState');
                };
            TP.test.HandlerTestLevel1.defineHandler2(
                level1_ANY_ANY_TestState,
                {
                    state: 'TestState'
                });

            //  --- Level 1 SignalTestOrigin_TP.test.SignalTestFull_ANY

            level1_SignalTestOrigin_TP_test_SignalTestFull_ANY =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                                    'level1_SignalTestOrigin_TP_test_SignalTestFull_ANY');
                };
            TP.test.HandlerTestLevel1.defineHandler2(
                level1_SignalTestOrigin_TP_test_SignalTestFull_ANY,
                {
                    origin: sigOrigin,
                    signal: TP.test.SignalTestFull
                });

            //  --- Level 1 SignalTestOrigin_ANY_TestState

            level1_SignalTestOrigin_ANY_TestState =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                                    'level1_SignalTestOrigin_ANY_TestState');
                };
            TP.test.HandlerTestLevel1.defineHandler2(
                level1_SignalTestOrigin_ANY_TestState,
                {
                    origin: sigOrigin,
                    state: 'TestState'
                });

            //  --- Level 1 ANY_TP_test_SignalTestFull_TestState

            level1_ANY_TP_test_SignalTestFull_TestState =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                                'level1_ANY_TP_test_SignalTestFull_TestState');
                };
            TP.test.HandlerTestLevel1.defineHandler2(
                level1_ANY_TP_test_SignalTestFull_TestState,
                {
                    signal: TP.test.SignalTestFull,
                    state: 'TestState'
                });

            //  --- Level 1 SignalTestOrigin_TP_test_SignalTestFull_TestState

            level1_SignalTestOrigin_TP_test_SignalTestFull_TestState =
                function(aSignal) {
                    TP.test.SignalingTester.incrementCount(
                    'level1_SignalTestOrigin_TP_test_SignalTestFull_TestState');
                };
            TP.test.HandlerTestLevel1.defineHandler2(
                level1_SignalTestOrigin_TP_test_SignalTestFull_TestState,
                {
                    origin: sigOrigin,
                    signal: TP.test.SignalTestFull,
                    state: 'TestState'
                });
        });

    this.it('getHandler - Level 1 - ANY origin / ANY signal / ANY state', function(test, options) {

        var signal,
            handler;

        signal = TP.sig.SignalMap.$getSignalInstance('SignalTest');

        handler = TP.test.HandlerTestLevel1.getHandler2(signal);

        test.assert.isMethod(handler);
        test.assert.isIdenticalTo(
                        handler,
                        level1_ANY_ANY_ANY);
        handler();
        test.assert.isEqualTo(
                TP.test.SignalingTester.get(
                        'level1_ANY_ANY_ANY'),
                1);
    });

    //  ---

    this.it('getHandler - Level 1 - SignalTestOrigin origin / ANY signal / ANY state', function(test, options) {

        var signal,
            handler;

        signal = TP.sig.SignalMap.$getSignalInstance('SignalTest');
        signal.setOrigin(sigOrigin.getID());

        handler = TP.test.HandlerTestLevel1.getHandler2(signal);

        test.assert.isMethod(handler);
        test.assert.isIdenticalTo(handler,
                        level1_SignalTestOrigin_ANY_ANY);
        handler();
        test.assert.isEqualTo(
                TP.test.SignalingTester.get(
                        'level1_SignalTestOrigin_ANY_ANY'),
                1);
    });

    this.it('getHandler - Level 1 - ANY origin / TP.test.SignalTestFull signal / ANY state', function(test, options) {

        var signal,
            handler;

        signal = TP.sig.SignalMap.$getSignalInstance('TP.test.SignalTestFull');

        handler = TP.test.HandlerTestLevel1.getHandler2(signal);

        test.assert.isMethod(handler);
        test.assert.isIdenticalTo(handler,
                        level1_ANY_TP_test_SignalTestFull_ANY);
        handler();
        test.assert.isEqualTo(
                TP.test.SignalingTester.get(
                        'level1_ANY_TP_test_SignalTestFull_ANY'),
                1);
    });

    this.it('getHandler - Level 1 - ANY origin / ANY signal / TestState state', function(test, options) {

        var machine,
            signal,
            handler;

        machine = TP.core.StateMachine.construct();
        TP.sys.getApplication().setStateMachine(machine);
        machine.defineState(null, 'TestState');
        machine.activate('TestState');

        signal = TP.sig.SignalMap.$getSignalInstance('SignalTest');

        handler = TP.test.HandlerTestLevel1.getHandler2(signal);

        test.assert.isMethod(handler);
        test.assert.isIdenticalTo(
                        handler,
                        level1_ANY_ANY_TestState);
        handler();
        test.assert.isEqualTo(
                TP.test.SignalingTester.get(
                        'level1_ANY_ANY_TestState'),
                1);

        machine.deactivate(true);
        TP.sys.getApplication().setStateMachine(null);
    });

    //  ---

    this.it('getHandler - Level 1 - SignalTestOrigin origin / TP.test.SignalTestFull signal / ANY state', function(test, options) {

        var signal,
            handler;

        signal = TP.sig.SignalMap.$getSignalInstance('TP.test.SignalTestFull');
        signal.setOrigin(sigOrigin.getID());

        handler = TP.test.HandlerTestLevel1.getHandler2(signal);

        test.assert.isMethod(handler);
        test.assert.isIdenticalTo(handler,
                        level1_SignalTestOrigin_TP_test_SignalTestFull_ANY);
        handler();
        test.assert.isEqualTo(
                TP.test.SignalingTester.get(
                        'level1_SignalTestOrigin_TP_test_SignalTestFull_ANY'),
                1);
    });

    this.it('getHandler - Level 1 - SignalTestOrigin origin / ANY signal / TestState state', function(test, options) {

        var machine,
            signal,
            handler;

        machine = TP.core.StateMachine.construct();
        TP.sys.getApplication().setStateMachine(machine);
        machine.defineState(null, 'TestState');
        machine.activate('TestState');

        signal = TP.sig.SignalMap.$getSignalInstance('SignalTest');
        signal.setOrigin(sigOrigin.getID());

        handler = TP.test.HandlerTestLevel1.getHandler2(signal);

        test.assert.isMethod(handler);
        test.assert.isIdenticalTo(handler,
                        level1_SignalTestOrigin_ANY_TestState);
        handler();
        test.assert.isEqualTo(
                TP.test.SignalingTester.get(
                        'level1_SignalTestOrigin_ANY_TestState'),
                1);

        machine.deactivate(true);
        TP.sys.getApplication().setStateMachine(null);
    });

    this.it('getHandler - Level 1 - ANY origin / TP.test.SignalTestFull signal / TestState state', function(test, options) {

        var machine,
            signal,
            handler;

        machine = TP.core.StateMachine.construct();
        TP.sys.getApplication().setStateMachine(machine);
        machine.defineState(null, 'TestState');
        machine.activate('TestState');

        signal = TP.sig.SignalMap.$getSignalInstance('TP.test.SignalTestFull');

        handler = TP.test.HandlerTestLevel1.getHandler2(signal);

        test.assert.isMethod(handler);
        test.assert.isIdenticalTo(handler,
                        level1_ANY_TP_test_SignalTestFull_TestState);
        handler();
        test.assert.isEqualTo(
                TP.test.SignalingTester.get(
                        'level1_ANY_TP_test_SignalTestFull_TestState'),
                1);

        machine.deactivate(true);
        TP.sys.getApplication().setStateMachine(null);
    });

    this.it('getHandler - Level 1 - SignalTestOrigin origin / TP.test.SignalTestFull signal / TestState state', function(test, options) {

        var machine,
            signal,
            handler;

        machine = TP.core.StateMachine.construct();
        TP.sys.getApplication().setStateMachine(machine);
        machine.defineState(null, 'TestState');
        machine.activate('TestState');

        signal = TP.sig.SignalMap.$getSignalInstance('TP.test.SignalTestFull');
        signal.setOrigin(sigOrigin.getID());

        handler = TP.test.HandlerTestLevel1.getHandler2(signal);

        test.assert.isMethod(handler);
        test.assert.isIdenticalTo(handler,
                    level1_SignalTestOrigin_TP_test_SignalTestFull_TestState);
        handler();
        test.assert.isEqualTo(
                TP.test.SignalingTester.get(
                    'level1_SignalTestOrigin_TP_test_SignalTestFull_TestState'),
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
