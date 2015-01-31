//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @overview Support for state machines in TIBET is provided by a pair of
 *     base types: TP.core.StateMachine and TP.core.StateResponder.
 *     Responsibility for state testing resides in StateMachine, while
 *     responsibility for state transition action processing is in
 *     StateResponder. Subtypes provide the means by which to create custom
 *     state-machine-driven behavior.
 */

//  ========================================================================
//  TP.core.StateObject
//  ========================================================================

/**
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.StateObject');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.StateObject.Inst.defineMethod('getNameForState',
function(state) {

    /**
     * @method getNameForState
     * @summary Returns a viable string state name for a state. This is largely
     *     used to help convert numeric job status states such as TP.ACTIVE and
     *     TP.READY to their English equivalents.
     * @param {Number|String} state A state code or state name.
     * @returns {String} The state code/name in string form.
     */

    if (TP.isEmpty(state)) {
        TP.ifWarn() ?
            TP.warn('No state name in state object.', TP.LOG) : 0;
    }

    if (TP.isNumber(state)) {
        switch (state) {
            case TP.ACTIVE:
                return 'Active';
            case TP.CANCELLED:
                return 'Cancelled';
            case TP.COMPLETED:
                return 'Completed';
            case TP.FAILED:
                return 'Failed';
            case TP.READY:
                return 'Ready';
            case TP.SUCCEEDED:
                return 'Succeeded';
            default:
                return '' + state;
        }
    } else {
        return state.asTitleCase();
    }
});

//  ========================================================================
//  TP.core.StateMachine
//  ========================================================================

/**
 * @type {TP.core.StateMachine}
 * @summary A small state machine implementation. The basic elements of a state
 *     machine regarding state testing are managed here and signaling is used to
 *     notify when a transition occurs. See the TP.core.StateResponder type for
 *     transition "action" handling.
 */

//  ------------------------------------------------------------------------

TP.core.StateObject.defineSubtype('StateMachine');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  The maximum number of entries maintained in a StateMachine transition log.
TP.core.StateMachine.Type.defineConstant('LOG_MAX', 100);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The current state.
TP.core.StateMachine.Inst.defineAttribute('state');

//  The source object for the state machine's event stream. If a state machine
//  is going to have multiple sources for events you have to override
//  activateEventStream and deactivateEventStream.
TP.core.StateMachine.Inst.defineAttribute('eventSource');

//  The list of events which make up the state machine's "event stream".
TP.core.StateMachine.Inst.defineAttribute('eventStream');

//  The log of state transitions this state machine has undergone. This is
//  trimmed to TP.core.StateMachine.LOG_MAX avoid large-scale leaking.
TP.core.StateMachine.Inst.defineAttribute('stateLog');

//  Lookup container for states and their related check functions/handlers.
TP.core.StateMachine.Inst.defineAttribute('stateHash');

//  Lookup container keyed by current state to determine potential "accept
//  states".
TP.core.StateMachine.Inst.defineAttribute('statePrereqs');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('init',
function() {

    /**
     * @method init
     * @summary Initializes a new instance of the receiver.
     * @returns {TP.core.StateMachine} A new instance.
     */

    this.callNextMethod();

    this.set('stateLog', TP.ac());
    this.set('stateHash', TP.hc());
    this.set('statePrereqs', TP.hc());

    //  Note that we can only set this *after* the preceding instance variables
    //  are set up.
    this.set('state', TP.READY);

    //  Give subtypes a place to override which would set up a set of
    //  default states and handlers, avoiding too much instance creation
    //  overhead.
    this.defineDefaultStates();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('activate',
function(startState) {

    /**
     * @method activate
     * @summary Activates the instance, causing it to transition into its start
     *     state. If no start state is provided the default is the job state
     *     TP.ACTIVE. The state must have no prerequisite states or a
     *     prerequisite state of TP.READY to be valid.
     * @param {String|Number} startState The new state to transition to.
     */

    var prereqs;

    //  Clear the state log...
    this.$get('stateLog').empty();

    //  If we got a state we just need to confirm that it's a state without
    //  any prerequisite states...or that it's prereq is TP.READY.
    if (TP.notEmpty(startState)) {
        if (TP.notEmpty(prereqs = this.get('statePrereqs').at(startState))) {
            if (!prereqs.contains(TP.READY)) {
                //  Not a valid start state...
                this.raise('InvalidStartState', startState);

                return;
            }
        }

        this.set('state', startState);

        return;
    }

    //  First state change is to TP.ACTIVE.
    this.set('state', TP.ACTIVE);

    //  Connect the consumer to an optional event stream, typically via one
    //  or more observe() calls.
    this.activateEventStream();

    return;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('activateEventStream',
function() {

    /**
     * @method activateEventStream
     * @summary Turns on an optional input event stream for the receiver by
     *     observing one or more input-related events.
     */

    var events,
        source;

    if (TP.notEmpty(events = this.get('eventStream'))) {
        source = TP.ifInvalid(this.get('eventSource'), TP.ANY);
        this.observe(source, events);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('deactivate',
function(signalState) {

    /**
     * @method deactivate
     * @summary Shuts down the state machine, returning it to a TP.READY state.
     *     The transition is checked to see if the current state was registered
     *     as being able to transition to TP.COMPLETED. If not then an
     *     intermediate transition of TP.CANCELLED is used.
     * @param {String} signalState The state to use in signaling. This may
     *     differ from the current state to avoid signaling with a JobStatus
     *     state.
     * @returns {TP.COMPLETED}
     */

    var current,
        prereqs;

    current = this.get('state');

    //  If the current state is defined as being able to transition to
    //  TP.COMPLETED we can transition without an intermediate state change.
    //  If we can't transition legally to completion we signal TP.CANCELLED
    //  first.
    prereqs = this.get('statePrereqs').at(TP.COMPLETED);
    if (TP.isEmpty(prereqs) || !prereqs.contains(current)) {
        this.signal('TP.sig.StateTransition',
                    TP.hc('oldState', current, 'newState', TP.CANCELLED));
    }

    // Let observers know that the state machine logic has completed.
    this.signal('TP.sig.StateTransition',
                TP.hc('oldState', current, 'newState', TP.COMPLETED));

    //  Turn off any observations we may have in place regarding input
    //  events.
    this.deactivateEventStream();

    //  Set a Job state of ready...no other state is valid at this point.
    //  NOTE that we call $set here to skip the setState method and avoid
    //  logging the transition.
    this.$set('state', TP.READY, false);

    return TP.COMPLETED;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('deactivateEventStream',
function() {

    /**
     * @method deactivateEventStream
     * @summary Turns off an optional input event stream for the receiver by
     *     observing one or more input-related events.
     */

    var events,
        source;

    if (TP.notEmpty(events = this.get('eventStream'))) {
        source = TP.ifInvalid(this.get('eventSource'), TP.ANY);
        this.ignore(source, events);
    }
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('defineDefaultStates',
function() {

    /**
     * @method defineDefaultStates
     * @summary Provides for state configuration by subtypes so different
     *     specialized instances can be created with minimal code.
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('defineState',
function(stateName, stateCheck, statePrereqs) {

    /**
     * @method defineState
     * @summary Adds a state description, which consists of a state name, a
     *     check function or check object, and one or more prerequisite state
     *     names.
     * @param {String} stateName The name of the state.
     * @param {Object|Function} stateCheck A delegate or check function. If an
     *     object is provided it must respond to 'accept' + stateName.
     * @param {String|Array} statePrereqs A string stateName which is the sole
     *     prerequisite state, or an array of such strings.
     */

    var funcName,

        preState,
        prereqHash,
        hash,
        prereqs,
        len,
        i;

    if (!TP.isFunction(stateCheck)) {
        funcName = 'accept' + this.getNameForState(stateName);
        if (!TP.canInvoke(stateCheck, funcName)) {
            this.raise('TP.sig.InvalidStateHandler',
                        funcName + ' not implemented by ' + stateCheck);

            return;
        }
    }

    //  Store the state name if there are any prereqs defined. This allows
    //  us to look up prereqs via the state name, which is needed in
    //  activate().
    prereqHash = this.get('statePrereqs');
    preState = TP.ifEmpty(statePrereqs, TP.ACTIVE);
    prereqHash.atPut(stateName, preState);

    /*
    Get the overall hash containing the map of the state machine in
    dictionary form...keys are the 'current state', values are an array of
    ordered pairs with test function and state name:
    { 'foo' :  [ [ testMoo, 'moo' ], [ testGoo, 'goo' ], ... ],
      'goo' :  ...
      'moo' :  ...
      'bar' :  ...};
    */

    hash = this.get('stateHash');

    //  If the incoming state has prereq states we need to locate any
    //  existing prereq data from the hash. Otherwise we need to create a
    //  new prereq entry for each of the prereq states for this new state.
    if (TP.isArray(preState)) {
        len = preState.getSize();
        for (i = 0; i < len; i++) {
            prereqs = hash.at(preState.at(i));
            if (TP.notValid(prereqs)) {
                prereqs = TP.ac();
                hash.atPut(preState.at(i), prereqs);
            }

            prereqs.push(TP.ac(stateCheck, stateName));
        }
    } else {
        prereqs = hash.at(preState);
        if (TP.notValid(prereqs)) {
            prereqs = TP.ac();
            hash.atPut(preState, prereqs);
        }

        prereqs.push(TP.ac(stateCheck, stateName));
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('getJobState',
function() {

    /**
     * @method getJobState
     * @summary Returns the current Job state, which is one of the state values
     *     such as active, completed, cancelled, etc.
     * @returns {TP.core.Job.STATE}
     */

    var state;

    state = this.get('state');
    switch (state) {
        //  All job control states are returned "as is"...all states which
        //  don't match a valid job control state are converted to TP.ACTIVE
        //  for job state purposes.
        case TP.READY:
        case TP.ACTIVE:
        case TP.CANCELLED:
        case TP.FAILED:
        case TP.SUCCEEDED:
        case TP.COMPLETED:
            return state;
        default:
            return TP.ACTIVE;
    }
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('getStateName',
function() {

    /**
     * @method getStateName
     * @summary Returns the current state as a string with the canonical name.
     *     The result is equivalent to calling getNameForState() on the current
     *     state.
     * @returns {String} The current state name.
     */

    return this.getNameForState(this.get('state'));
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('handleSignal',
function(aSignal) {

    /**
     * @method handleSignal
     * @summary Responds to notifications of a signal/event that makes up part
     *     of the state machine's "input event stream". This method is invoked
     *     when you connect a state machine to an event stream via observe()
     *     without providing an explicit handler.
     * @param {TP.sig.Signal} aSignal The signal.
     */

    this.updateCurrentState(aSignal);

    return;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('isActive',
function() {

    /**
     * @method isActive
     * @summary Returns true if the receiver is in an active state.
     * @returns {Boolean} Whether or not the receiver is in an active state.
     */

    //  If its in any state other than TP.READY, then its active.
    return (this.get('state') !== TP.READY);
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('rollbackState',
function() {

    /**
     * @method rollbackState
     * @summary Rolls back a state transition (without triggering any
     *     handlers). This method is normally invoked by a state responder of
     *     some form when it detects that an *exit, *ToB, or *enter action
     *     function has prevented the default action.
     * @returns {Number} A TP state code for the state after the rollback.
     */

    var newState;

    newState = TP.ifInvalid(this.get('stateLog').pop(), TP.READY);
    this.$set('state', newState);

    return newState;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('setState',
function(newState) {

    /**
     * @method setState
     * @summary Sets the current state of the receiver without invoking any
     *     handlers for state transitions. Note that this call can cause the
     *     state machine to become inconsistent if not used carefully.
     * @param {Number} newState A TP state code value.
     * @returns {Number} A TP state code value.
     */

    var log;

    this.$set('state', newState);

    //  Log the new state, truncating the log to ensure that it doesn't grow
    //  beyond a maximum threshold.
    log = this.get('stateLog');
    log.push(newState);
    log.length = log.length.min(TP.core.StateMachine.LOG_MAX);

    return this.get('state');
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('updateCurrentState',
function(signalOrParams) {

    /**
     * @method updateCurrentState
     * @summary Returns the current (non-job) state. This will be one of the
     *     state values provided during the defineState phase.
     * @param {TP.sig.Signal|Object} signalOrParams An object containing
     *     information which might help determine the state. Usually a signal
     *     instance provided from the receiver's event stream (care of
     *     observe()).
     * @returns {String} The current state name.
     */

    var oldState,
        newState,
        stateOptions,
        stateCount,
        len,
        i,
        targetState,

        stateCheck,
        stateName;

    //  Check the various state test functions and determine what our state
    //  should be.
    oldState = this.get('state');
    newState = oldState;

    //  This should be an array of ordered pairs containing:
    //  test[Object|Function] and stateName to check.
    stateOptions = this.get('stateHash').at(oldState);

    if (TP.isEmpty(stateOptions)) {
        //  What do we do with a state that you can't "leave"...? Call it
        //  success and deactivate. Logic after signaling below will test
        //  and deactivate as needed, we just set the proper "trigger state"
        //  here.
        newState = TP.SUCCEEDED;
    } else {
        //  We can get 0, which means no new state, 1...which means we have
        //  a new state, or > 1 which means we have an inconsistent state
        //  machine config/definition because more than one state test
        //  passed.
        stateCount = 0;

        len = stateOptions.getSize();
        for (i = 0; i < len; i++) {
            stateCheck = stateOptions.at(i).at(0);
            stateName = stateOptions.at(i).at(1);

            if (TP.isFunction(stateCheck)) {
                if (stateCheck(signalOrParams)) {
                    targetState = stateName;
                    stateCount++;
                }
            } else if (TP.canInvoke(
                        stateCheck,
                        'accept' + this.getNameForState(stateName))) {
                if (stateCheck['accept' +
                        this.getNameForState(stateName)](signalOrParams)) {
                    targetState = stateName;
                    stateCount++;
                }
            }
        }

        if (stateCount > 1) {
            newState = TP.FAILED;
            this.raise('InvalidStateMachine',
                        'Multiple valid states for transition from ' +
                            oldState);

            return;
        } else if (stateCount === 1) {
            newState = targetState;
        }
    }

    //  If we end up with a different state then signal it for any
    //  observers.
    if (oldState !== newState) {
        this.set('state', newState);

        this.signal('TP.sig.StateTransition',
                    TP.hc('oldState', oldState, 'newState', newState,
                            'trigger', signalOrParams));

        //  See if the new state is also a "terminal state" meaning nowhere
        //  to go from here...if so we can wrap up with one more call...
        stateOptions = this.get('stateHash').at(newState);
        if (TP.isEmpty(stateOptions) && (newState !== TP.SUCCEEDED)) {
            //  Preserve the new state we just signaled as our old state,
            //  which allows us to signal the next transition pair
            //  correctly, and to have the final deactivation use the true
            //  'oldState' rather than our TP.SUCCEEDED value.
            oldState = newState;
            newState = TP.SUCCEEDED;

            this.set('state', newState);

            this.signal('TP.sig.StateTransition',
                        TP.hc('oldState', oldState, 'newState', newState,
                                'trigger', signalOrParams));
        }

        //  If we reached a terminal state in terms of JobStatus then
        //  deactivate.
        if (newState === TP.SUCCEEDED ||
            newState === TP.CANCELLED ||
            newState === TP.FAILED) {
            return this.deactivate(oldState);
        }
    } else {
        this.signal('TP.sig.StateInput',
                    TP.hc('currentState', oldState,
                            'trigger', signalOrParams));
    }

    return newState;
});

//  ========================================================================
//  TP.core.StateResponder
//  ========================================================================

/**
 * @type {TP.core.StateResponder}
 * @summary An object which observes a state machine and responds to transition
 *     notifications by running one or more handlers.
 */

//  ------------------------------------------------------------------------

TP.core.StateObject.defineSubtype('StateResponder');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineAttribute('stateHandlers');
TP.core.StateResponder.Inst.defineAttribute('stateMachine');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineMethod('init',
function(stateMachine) {

    /**
     * @method init
     * @summary Initializes a new instance of the receiver.
     * @param {TP.core.StateMachine} stateMachine The state machine this
     *     responder should observe.
     * @returns {TP.core.StateResponder} A new instance.
     */

    this.callNextMethod();

    if (!TP.isKindOf(stateMachine, 'TP.core.StateMachine')) {
        this.raise('TP.sig.InvalidParameter');

        return;
    }

    this.set('stateHandlers', TP.hc());
    this.set('stateMachine', stateMachine);

    //  Give subtypes a place to override which would set up a set of
    //  default states and handlers, avoiding too much instance creation
    //  overhead.
    this.defineDefaultHandlers();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineMethod('activate',
function(startState) {

    /**
     * @method activate
     * @summary Activates the instance, causing it to transition into its start
     *     state. If no start state is provided the default is the job state
     *     TP.ACTIVE. The state must have no prerequisite states or a
     *     prerequisite state of TP.READY to be valid.
     * @param {String|Number} startState The new state to transition to.
     */

    var machine;

    machine = this.get('stateMachine');

    //  Start watching the state machine first, then activate it. That way
    //  we're in on any signaling it triggers on startup.
    this.observe(machine, 'TP.sig.StateTransition');
    this.observe(machine, 'TP.sig.StateInput');

    machine.activate(startState);

    return;
});

//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineMethod('deactivate',
function(signalState) {

    /**
     * @method deactivate
     * @summary Shuts down the state machine, returning it to a TP.READY state.
     *     The transition is checked to see if the current state was registered
     *     as being able to transition to TP.COMPLETED. If not then an
     *     intermediate transition of TP.CANCELLED is used.
     * @param {String} signalState The state to use in signaling. This may
     *     differ from the current state to avoid signaling with a JobStatus
     *     state.
     * @returns {TP.COMPLETED}
     */

    var machine;

    machine = this.get('stateMachine');

    //  Deactivate the state machine first, then stop watching it. That way
    //  we're in on any signaling it triggers during shutdown.
    machine.deactivate(signalState);

    this.ignore(machine, 'TP.sig.StateTransition');
    this.ignore(machine, 'TP.sig.StateInput');

    return TP.COMPLETED;
});

//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineMethod('defineDefaultHandlers',
function() {

    /**
     * @method defineDefaultHandlers
     * @summary Provides for state configuration by subtypes so different
     *     specialized instances can be created with minimal code.
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineMethod('defineStateHandler',
function(stateName, stateHandler, statePhase, originState) {

    /**
     * @method defineStateHandler
     * @summary Adds a state handler, a function or object which should be
     *     invoked when a particular state transition is observed.
     * @param {String} stateName The name of the state.
     * @param {Object|Function} stateHandler A handler object or function. If an
     *     object is provided it must respond to 'handle' + stateName.
     * @param {String} statePhase TP.ENTER, TP.EXIT. If null/empty then the
     *     phase defaults to TP.INPUT which means the handler is called when in
     *     the named state on new input.
     * @param {String} originState An optional origin state name used for
     *     TP.TRANSITION actions.
     * @returns {Number} The number of handlers registered for the state.
     */

    var hash,
        handlers,
        name;

    hash = this.get('stateHandlers');

    if (statePhase === TP.TRANSITION) {
        // NOTE the inversion of names here to get back the proper from/to.
        name = this.getActionName(originState, statePhase, stateName);
    } else {
        name = this.getActionName(stateName, statePhase);
    }

    handlers = hash.at(name);
    if (TP.notValid(handlers)) {
        handlers = TP.ac();
        hash.atPut(name, handlers);
    }

    handlers.push(stateHandler);

    return handlers.getSize();
});

//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineMethod('getActionName',
function(stateName, statePhase, toState) {

    /**
     * @method getActionName
     * @summary Computes a valid state transition function name of the form
     *     state[Enter|Exit|State] which can be used to register and/or lookup
     *     handler functions.
     * @param {String} stateName The name of the state.
     * @param {String} statePhase TP.ENTER, TP.EXIT. If null/empty then the
     *     phase defaults to TP.INPUT.
     * @param {String} toState An optional second state name used for
     *     TP.TRANSITION actions.
     * @returns {String} The transition name.
     */

    var name;

    //  Ensure we've got a viable string name, in title case preferably.
    name = this.getNameForState(stateName).asStartLower();

    //  Compute the "phase event" name, either Enter, Exit, or State, which
    //  is used as a suffix when looking up and invoking state handlers.
    switch (statePhase) {
        case TP.ENTER:
            return name + 'Enter';
        case TP.EXIT:
            return name + 'Exit';
        case TP.INPUT:
            return name + 'Input';
        case TP.TRANSITION:
            return name + 'To' + this.getNameForState(toState);
        default:
            return;
    }
});

//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineMethod('getActionHandlers',
function(actionName) {

    /**
     * @method getActionHandlers
     * @summary Returns any registered state handers for the transition name
     *     provided.
     * @param {String} actionName The action name used to lookup handler
     *     functions and/or delegation objects.
     * @returns {Function|Object} The registered handlers for the actionName.
     */

    var hash;

    hash = this.get('stateHandlers');

    return hash.at(actionName);
});

//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineMethod('getPhaseName',
function(statePhase) {

    /**
     * @method getPhaseName
     * @summary Computes a valid state transition phase name for the phase
     *     provided. This converts numeric phase constant values into their
     *     English equivalents.
     * @param {String} statePhase TP.ENTER, TP.EXIT. If null/empty then the
     *     phase defaults to TP.INPUT.
     * @returns {String} The transition name.
     */

    switch (statePhase) {
        case TP.ENTER:
            return 'Enter';
        case TP.EXIT:
            return 'Exit';
        case TP.INPUT:
            return 'Input';
        default:
            return;
    }
});

//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineMethod('handleStateInput',
function(aSignal) {

    /**
     * @method handleStateInput
     * @summary Responds to notifications of new input which didn't cause a
     *     state transition to occur.
     * @description The default implementation passes this data along to the
     *     invokeStateAction() method for TP.INPUT unless a method specific to
     *     the input data can be found. The lookup in this case is based on the
     *     signal and any embedded 'trigger' signal or data it may have for type
     *     specialization.
     * @param {TP.sig.StateInput} aSignal The signal which triggered this
     *     handler.
     */

    var state,
        stateName,
        actionName,
        handlers,
        trigger,
        len,
        i,
        handler,
        methodName;

    //  StateInput signals should contain a currentState reference we can
    //  use to determine what state we should be responding for.
    state = aSignal.at('currentState');
    stateName = this.getNameForState(state);
    actionName = this.getActionName(state, TP.INPUT);

    //  Try to specialize based on trigger type. For example, rather than
    //  just invoking 'draggingInput' first try to invoke
    //  'draggingDOMDragMove' if the trigger is a DOMDragMove signal. That
    //  callBestMethod() pattern just won't go away ;).
    trigger = aSignal.at('trigger');
    if (TP.isValid(trigger)) {
        handlers = this.getActionHandlers(
                        this.getActionName(state, TP.INPUT));

        if (TP.notEmpty(handlers)) {
            len = handlers.length;
            for (i = 0; i < len; i++) {
                try {
                    handler = handlers.at(i);
                    if (TP.isFunction(handler)) {
                        handler(aSignal);
                    } else {
                        methodName = handler.getBestMethodName(
                                    arguments,
                                    trigger,
                                    stateName.asStartLower(),
                                    '',
                                    actionName.asStartLower());

                        if (TP.canInvoke(handler, methodName)) {
                            handler[methodName](aSignal);
                        }
                    }

                    //  If the handler stops propagation we'll terminate the
                    //  loop.
                    if (aSignal.shouldStop()) {
                        return;
                    }
                } catch (e) {
                    this.raise('InvalidStateHandler',
                                TP.ec(e, TP.str(handler)));
                }
            }
        }
    } else {
        this.invokeStateAction(
                this.getActionName(state, TP.INPUT), aSignal);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineMethod('handleStateTransition',
function(aSignal) {

    /**
     * @method handleStateTransition
     * @summary Responds to notifications of state transitions from the
     *     receiver's internal StateMachine object.
     * @description When a transition occurs the receiver attempts to run any
     *     TP.EXIT functions for the old state followed by any TP.ENTER
     *     functions for the new state, and finally any TP.TRANSITION functions
     *     for the new state completing the transition.
     * @param {TPSignal} aSignal The StateTransition signal which triggered this
     *     handler. The states can be found in oldState and newState
     *     respectively. If there is a native event or other signal which drove
     *     the transition that can be found via 'trigger'.
     */

    var oldState,
        newState;

    oldState = aSignal.at('oldState');
    newState = aSignal.at('newState');

    //  Exit the old state...if we can. If the signal prevents default we'll
    //  rollback the transition...the current state can't be exited for some
    //  reason.
    this.invokeStateAction(
            this.getActionName(oldState, TP.EXIT),
            aSignal);

    if (aSignal.shouldPrevent()) {
        this.get('stateMachine').rollbackState();

        return;
    }

    //  Execute the "transition" itself, which might be specialized for a
    //  particular oldState/newState pair.
    this.invokeStateAction(
            this.getActionName(oldState, TP.TRANSITION, newState),
            aSignal);

    if (aSignal.shouldPrevent()) {
        this.get('stateMachine').rollbackState();

        return;
    }

    //  Enter the new state...if we can.
    this.invokeStateAction(
            this.getActionName(newState, TP.ENTER),
            aSignal);

    if (aSignal.shouldPrevent()) {
        this.get('stateMachine').rollbackState();

        return;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineMethod('invokeStateAction',
function(actionName, aSignal) {

    /**
     * @method invokeStateAction
     * @summary Run the functions related to a specific state transition.
     * @param {String} actionName The transition name to process.
     * @param {TP.sig.StateTransition} aSignal The state transition signal which
     *     triggered the invocation.
     */

    var handlers,
        len,
        i,
        handler;

    //  Process registered handlers first.
    handlers = this.getActionHandlers(actionName);
    if (TP.notEmpty(handlers)) {
        len = handlers.getSize();
        for (i = 0; i < len; i++) {
            handler = handlers.at(i);
            try {
                if (TP.isFunction(handler)) {
                    handler(aSignal);
                } else if (TP.canInvoke(handler, actionName)) {
                    handler[actionName](aSignal);
                }

                //  If the handler stops propagation we'll terminate the
                //  loop.
                if (aSignal.shouldStop()) {
                    return;
                }
            } catch (e) {
                this.raise('InvalidStateHandler',
                            TP.ec(e, TP.str(handler)));
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineMethod('isActive',
function() {

    /**
     * @method isActive
     * @summary Returns true if the receiver is in an active state.
     * @returns {Boolean} Whether or not the receiver is in an active state.
     */

    return this.get('stateMachine').isActive();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
