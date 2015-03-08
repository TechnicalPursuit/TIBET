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
 *  Simple state machine support for TIBET. State machines in TIBET provide a
 *  way to manage states and to have the system respond to transition signals
 *  as a means of helping manage code. Your signals in TIBET are always aware of
 *  the current application and/or controller state as well so you can easily
 *  define signal handlers dependent on specific states.
 *
 *
 *  Assume the following rough state diagram:
 *
 *           / --- foo --- \
 *          /               \
 *  moo ---                   --- goo
 *          \               /
 *           \ --- bar --- /
 *
 *  You can define that as follows:
 *
 *  stateMachine = TP.core.StateMachine.construct();
 *
 *  stateMachine.defineState(null, 'moo');
 *  stateMachine.defineState('moo', ['foo', 'bar']);
 *  stateMachine.defineState(['foo', 'bar'], 'goo');
 *  stateMachine.defineState('goo', null);
 *
 *  The resulting data structures will resemble the following:
 *
 *  byInitial   key is source state, array is list of target states. If the
 *              list includes a null that indicates potential final state.
 *
 *  {
 *     'foo' :  [ 'goo' ],
 *     'goo' :  [ null ],              //  final state
 *     'moo' :  [ 'foo', 'bar' ],
 *     'bar' :  [ 'goo' ]
 *  };
 *
 *  byTarget    key is target state, array is list of source states. If the
 *              list includes a null that indicates potential start state.
 *  {
 *     'foo' :  [ 'moo' ],
 *     'goo' :  [ 'foo', 'bar' ],
 *     'moo' :  [ null ],              //  start state
 *     'bar' :  [ 'moo' ]
 *  };
 */

//  ========================================================================
//  TP.sig.StateSignal
//  ========================================================================

TP.sig.Signal.defineSubtype('StateSignal');

TP.sig.StateSignal.Type.defineAttribute('defaultPolicy',
    TP.INHERITANCE_FIRING);

TP.sig.StateSignal.defineSubtype('StateInput');

TP.sig.StateSignal.defineSubtype('StateExit');
TP.sig.StateSignal.defineSubtype('StateTransition');
TP.sig.StateSignal.defineSubtype('StateEnter');

//  ========================================================================
//  TP.core.StateMachine
//  ========================================================================

/**
 * @type {TP.core.StateMachine}
 * @summary A small state machine implementation. The basic elements of a state
 *     machine regarding state testing are managed here and signaling is used to
 *     notify when a transition occurs.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('TP.core.StateMachine');

TP.core.StateMachine.addTraits(TP.core.Triggered);

//  Resolve the traits right away as subtypes of this type are used during the
//  booting process.
TP.core.StateMachine.finalizeTraits();

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  The maximum number of entries maintained in a StateMachine transition log.
TP.core.StateMachine.Type.defineConstant('LOG_MAX', 100);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Lookup container for states by initial state. This gives you a list of
//  states a particular state could transition to. "Potential states" per se.
TP.core.StateMachine.Inst.defineAttribute('byInitial');

//  Lookup container for states by target state. This gives you a list of states
//  a particular state can be reached from. "Prerequisite states" as it were.
TP.core.StateMachine.Inst.defineAttribute('byTarget');

//  The current state.
TP.core.StateMachine.Inst.defineAttribute('state');

//  The log of state transitions this state machine has undergone. This is
//  trimmed to TP.core.StateMachine.LOG_MAX avoid large-scale leaking.
TP.core.StateMachine.Inst.defineAttribute('stateLog');

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

    //  Set up our internal configuration containers.
    this.set('stateLog', TP.ac());

    this.set('byInitial', TP.hc());
    this.set('byTarget', TP.hc());

    //  Give subtypes a place to override which would set up a set of
    //  default states and handlers, avoiding too much instance creation
    //  overhead.
    this.defineStates();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('activate',
function(aState) {

    /**
     * @method activate
     * @summary Activates the instance, causing it to transition into its start
     *     state. The state must have no prerequisite states to be a valid start
     *     state and any guard function for that state must return true.
     * @param {String} [aState] An optional start state to use. If not provided
     *     the list of target states is checked for any without initial states.
     *     If one-and-only-one is found that state is used as the start state.
     * @return {Boolean} True if the activation was successful.
     */

    var start,
        states,
        guard;

    //  Can't activate when there's already a current state.
    if (TP.notEmpty(this.get('state'))) {
        this.raise('InvalidOperation',
            'Cannot activate an active state machine.');
        return false;
    }

    //  Can't activate without a valid start state to transition to.
    if (TP.notEmpty(aState)) {
        //  Verify we know about this state...and that it's a viable start state
        //  based on having at least one path with no prereq.
        states = this.$getStartStates();
        if (states.indexOf(aState) !== TP.NOT_FOUND) {
            start = aState;
        } else {
            //  Not a valid start state.
            this.raise('InvalidStartState', aState);
            return false;
        }
    } else {
        //  Find one we can default to by checking our list of known target
        //  states and hopefully finding one (and only one) with no prereq.
        states = this.$getStartStates();
        switch (states.getSize()) {
            case 0:
                this.raise('InvalidStartState', 'No defined start state(s).');
                return false;
            case 1:
                start = states.at(0);
                break;
            default:
                this.raise('InvalidStartState',
                    'Multiple startable states: ' + TP.str(states));
                return false;
        }
    }

    //  Clear the state log.
    this.$get('stateLog').empty();

    //  Verify we can transition to the start state based on any internal guard
    //  functions we may implement. Note we don't need to check against any
    //  "When" clause since there's no current state when not activated.
    guard = 'accept' + this.getStateName(start);
    if (TP.canInvoke(this, guard)) {
        if (TP.notTrue(this[guard]())) {
            return false;
        }
    }

    this.$setState(start);
    this.observeTriggers();

    return true;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('deactivate',
function(force) {

    /**
     * @method deactivate
     * @summary Shuts down the state machine, returning it to an indeterminate
     *     state. This is typically called as part of the final state transition
     *     processing when the state machine transitions to its final state.
     * @raises {TP.sig.InvalidFinalState} If the state machine isn't in its
     *     final state when this method is called.
     * @param {Boolean} [force=false] True to force deactivation regardless of
     *     whether the receiver is in a final state.
     * @return {Boolean} True if deactivation was successful.
     */

    var current,
        states;

    //  Can't deactivate when there's no current state.
    if (TP.notTrue(force) && TP.isEmpty(this.get('state'))) {
        this.raise('InvalidOperation',
            'Cannot deactivate an inactive state machine.');
        return false;
    }

    //  Turn off any observations we may have in place regarding input
    //  events. Regardless of errors we may raise we honor the request to
    //  deactivate the inbound triggering.
    this.ignoreTriggers();

    //  Should be in a final state. If not that's an error.
    current = this.get('state');
    states = this.$getFinalStates();

    if (states.indexOf(current) === TP.NOT_FOUND) {
        //  Not a final state...
        if (TP.notTrue(force)) {
            this.raise('InvalidFinalState', 'Deactivating in non-final state.');
            return false;
        }
    }

    //  Clear the state flag.
    this.$setState(null);

    return true;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('defineStates',
function() {

    /**
     * @method defineStates
     * @summary Invoked by the init method to set up initial states for the
     *     receiver. If this method is not used via a subtype you must use
     *     other direct calls to properly configure the state machine.
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('defineState',
function(initialState, targetState) {

    /**
     * @method defineState
     * @summary Adds a single state pathway, which consists of an initial state
     *     and a target state. The state machine itself serves as a potential
     *     guard function repository. Methods of the form 'accept{State}' will
     *     be invoked during transitions.
     * @param {String|String[]} [initialState] The name of the initial state(s).
     *     Defaults to null since start states may not have an initial state.
     * @param {String|String[]} [targetState] The name of the target state(s).
     *     Defaults to null since final states may not have target states.
     */

    var initials,
        targets,
        arr,
        list;

    initials = this.get('byInitial');
    targets = this.get('byTarget');

    //  ---
    //  start states
    //  ---

    if (TP.notValid(initialState)) {

        if (TP.notValid(targetState)) {
            return this.raise('InvalidStateDefinition');
        }

        arr = TP.isArray(targetState) ? targetState : TP.ac(targetState);
        arr.forEach(function(key) {
            var list;

            list = targets.at(key);
            if (TP.notValid(list)) {
                list = TP.ac();
                targets.atPut(key, list);
            }

            list.push(null);
        });

        return this;
    }

    //  ---
    //  final states
    //  ---

    if (TP.notValid(targetState)) {

        if (TP.notValid(initialState)) {
            return this.raise('InvalidStateDefinition');
        }

        arr = TP.isArray(initialState) ? initialState : TP.ac(initialState);
        arr.forEach(function(key) {
            var list;

            list = initials.at(key);
            if (TP.notValid(list)) {
                list = TP.ac();
                initials.atPut(key, list);
            }

            list.push(null);
        });

        return this;
    }

    //  If we're this far we're dealing with a definition that has valid values
    //  for both initial and target states.

    //  ---
    //  byInitial
    //  ---

    arr = TP.isArray(initialState) ? initialState : TP.ac(initialState);
    arr.forEach(function(key) {

        list = initials.at(key);
        if (TP.notValid(list)) {
            list = TP.ac();
            initials.atPut(key, list);
        }

        if (TP.isArray(targetState)) {
            initials.atPut(key, list.concat(targetState));
        } else {
            list.push(targetState);
        }
    });

    //  ---
    //  byTarget
    //  ---

    arr = TP.isArray(targetState) ? targetState : TP.ac(targetState);
    arr.forEach(function(key) {

        list = targets.at(key);
        if (TP.notValid(list)) {
            list = TP.ac();
            targets.atPut(key, list);
        }

        if (TP.isArray(initialState)) {
            targets.atPut(key, list.concat(initialState));
        } else {
            list.push(initialState);
        }
    });

    return this;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('getActionName',
function(stateAction) {

    /**
     * @method getActionName
     * @summary Constructs a valid signal or function suffix for the provided
     *     action.
     * @param {String} stateAction TP.ENTER, TP.EXIT, or TP.TRANSITION.
     * @returns {String} The action suffix.
     */

    switch (stateAction) {
        case TP.ENTER:
            return 'Enter';
        case TP.EXIT:
            return 'Exit';
        case TP.INPUT:
            return 'Input';
        default:
            return 'Transition';
    }
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('getActionSignal',
function(stateName, stateAction) {

    /**
     * @method getActionSignal
     * @summary Construcs a valid state transition signal for the state name and
     *     state action being processed.
     * @param {String} stateName The name of the state.
     * @param {String} stateAction TP.ENTER, TP.EXIT, or TP.TRANSITION.
     * @returns {TP.sig.StateSignal} The state signal.
     */

    var name,
        signal;

    name = 'State' + this.getStateName(stateName) +
        this.getActionName(stateAction);

    switch (stateAction) {
        case TP.ENTER:
            signal = TP.sig.StateEnter.construct();
            break;
        case TP.EXIT:
            signal = TP.sig.StateExit.construct();
            break;
        case TP.INPUT:
            signal = TP.sig.StateInput.construct();
            break;
        default:
            signal = TP.sig.StateTransition.construct();
            break;
    }

    signal.setSignalName(name);
    signal.setOrigin(this);

    return signal;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('$getFinalStates',
function() {

    /**
     * @method $getFinalStates
     * @summary Scans the list of known states and returns a list of any which
     *     have at least one path to a null targetState.
     * @return {String[]} The list of final state names.
     */

    var hash,
        items;

    hash = this.get('byInitial');
    items = hash.select(function(item) {
        return item.last().contains(null);
    });

    return items.collect(function(item) {
        return item.first();
    });
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('$getStartStates',
function() {

    /**
     * @method $getStartStates
     * @summary Scans the list of known states and returns a list of any which
     *     have at least one path from a null initialState.
     * @return {String[]} The list of start state names.
     */

    var hash,
        items;

    hash = this.get('byTarget');
    items = hash.select(function(item) {
        return item.last().contains(null);
    });

    return items.collect(function(item) {
        return item.first();
    });
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('getStateName',
function(aState) {

    /**
     * @method getStateName
     * @summary Returns the current state as a string with the canonical name.
     * @param {String} [aState] The state name to normalize. Defaults to the
     *     current state.
     * @returns {String} The normalized state name.
     */

    var state;

    state = TP.ifInvalid(aState, this.get('state'));

    //  If the state machine isn't configured/activated the state could be
    //  indeterminate (aka null).
    if (TP.isEmpty(state)) {
        return;
    }

    return state.asTitleCase();
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

TP.core.StateMachine.Inst.defineMethod('setFinalState',
function(aState) {

    /**
     * @method setFinalState
     * @summary Sets the final state of the receiver, the state which will
     *     trigger deactivation on exit.
     * @param {String} aState A final state name.
     * @return {TP.core.StateMachine} The receiver.
     */

    if (TP.isEmpty(aState)) {
        return this.raise('InvalidState');
    }

    this.$set('finalState', aState);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('setStartState',
function(aState) {

    /**
     * @method setStartState
     * @summary Sets the start state of the receiver, the state which will
     *     be entered when the state machine is activated.
     * @param {String} aState A start state name.
     * @return {TP.core.StateMachine} The receiver.
     */

    if (TP.isEmpty(aState)) {
        return this.raise('InvalidState');
    }

    this.$set('startState', aState);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('$setState',
function(newState) {

    /**
     * @method $setState
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

TP.core.StateMachine.Inst.defineMethod('transition',
function(transitionDetails) {

    /**
     * @method transition
     * @summary Performs transition processing for both internal (input only)
     *     and full transitions.
     * @description There are officially two types of transition, so-called
     *     "internal" transitions which simply update internal state variables
     *     and the more general transitions which cause the invocation of any
     *     transition actions such as enter, exit, etc. This method deals with
     *     internal transitions by searching the receiver for any methods which
     *     follow the getBestMethod pattern for handling the input trigger(s).
     *     For general transitions this method simply coordinates signaling of
     *     the proper transition events to allow observers to update based on
     *     the new state and to run any enter/exit/transition methods they have.
     * @param {TP.lang.Hash} transitionDetails Transition information including
     *     'state' (the new state), and 'trigger' (usually a signal).
     */

    var oldState,
        newState,
        internal,
        handler,
        signal,
        states;

    oldState = this.get('state');
    newState = transitionDetails.at('state');

    // If the state isn't changing this is an internal transition request.
    internal = oldState === newState;

    if (internal) {

        //  State{Old}Input or StateInputWhen{Old}
        signal = this.getActionSignal(oldState, TP.INPUT);
        signal.setPayload(transitionDetails);

        //  Try to handle it locally. The state machine itself gets first chance
        //  at any input/internal transition signals. NOTE that we have to watch
        //  out for invoking our update routine recursively via handleSignal :).
        handler = this.getHandler(signal);
        if (TP.isFunction(handler) && handler !== this.handleSignal) {
            handler.call(this, signal);
        }

        //  Note that if the signal has been stopped this won't do much.
        signal.fire();

    } else {

        //  State{Old}Exit or StateExitWhen{Old}
        signal = this.getActionSignal(oldState, TP.EXIT);
        signal.setPayload(transitionDetails);
        signal.fire();

        //  State{New}Transition or StateTransition[When{Old}]
        signal = this.getActionSignal(newState, TP.TRANSITION);
        signal.setPayload(transitionDetails);
        signal.fire();

        //  Transition our state. We do this here to ensure that any "When"
        //  clause construction will be using accurate transition values.
        if (oldState !== newState) {
            this.$setState(newState);
        }

        //  State{New}Enter or StateEnterWhen{New}
        signal = this.getActionSignal(newState, TP.ENTER);
        signal.setPayload(transitionDetails);
        signal.fire();

        //  We can automatically deactivate when we reach the final state if
        //  that state is "final only" meaning it can't transition to any other
        //  state as an alternative route.
        states = this.$getFinalStates();
        if (states.indexOf(newState) !== TP.NOT_FOUND) {
            //  A final state. But it is a "final only" state?
            states = this.get('byInitial').at(newState);
            if (states.length === 1 && states.at(0) === null) {
                this.deactivate();
            }
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('updateCurrentState',
function(signalOrParams) {

    /**
     * @method updateCurrentState
     * @summary Sets the receiver's state as necessary based on parameter input.
     *     In all cases a transition() is requested but it may be an internal
     *     transition if the data doesn't necessitate a full state change.
     * @param {TP.sig.Signal|Object} signalOrParams An object containing
     *     information which might help determine the state. Usually a signal
     *     instance provided from the receiver's trigger configuration.
     * @returns {String} The current state name upon exit.
     */

    var oldState,
        newState,
        stateTargets,
        stateCount,
        len,
        i,
        targetState,
        guard,
        parent,
        stateCheck,
        stateName;

    //  Check the various state test functions and determine what our state
    //  should be.
    oldState = this.get('state');
    newState = oldState;

    //  Get the list of potential target states to be checked.
    stateTargets = this.get('byInitial').at(oldState);

    if (TP.isEmpty(stateTargets)) {
        //  No target states means we're at a final state, but apparently didn't
        //  deactivate since we're still receiving input from our triggers.
        //  TODO:   should we warn about this? deactivate?
        return oldState;
    } else {
        //  We can get 0, which means no new state, 1...which means we have
        //  a new state, or > 1 which means we have an inconsistent state
        //  machine config/definition because more than one state test
        //  passed and we have more than one potential transition.
        stateCount = 0;

        len = stateTargets.getSize();
        for (i = 0; i < len; i++) {
            stateName = stateTargets.at(i);

            guard = 'accept' + this.getStateName(stateName) + 'When' +
                this.getStateName(oldState);
            if (TP.canInvoke(this, guard)) {
                if (TP.isTrue(this[guard](signalOrParams))) {
                    targetState = stateName;
                    stateCount++;
                }
            } else {
                guard = 'accept' + this.getStateName(stateName);
                if (TP.canInvoke(this, guard)) {
                    if (TP.isTrue(this[guard](signalOrParams))) {
                        targetState = stateName;
                        stateCount++;
                    }
                } else {
                    targetState = stateName;
                    stateCount++;
                }
            }
        }

        if (stateCount > 1) {
            this.raise('InvalidStateMachine',
                'Multiple valid states for transition from ' +
                oldState);
            return oldState;
        } else if (stateCount === 1) {
            newState = targetState;
        }
    }

    //  Perform the proper transition logic. The actual setting of a new state
    //  value is handled in the transition call() for signal timing reasons.
    this.transition(
        TP.hc('state', newState,
            'prior', oldState,
            'trigger', signalOrParams));

    return newState;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
