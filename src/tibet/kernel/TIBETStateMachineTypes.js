//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/*
 *  Simple state machine support for TIBET. State machines in TIBET provide a
 *  way to manage states and to have the system respond to transition signals
 *  as a means of helping manage code. Your signals in TIBET are always aware of
 *  the current application and/or controller state as well so you can easily
 *  define signal handlers dependent on specific states.
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

//  Lookup container for composite states. This is a simple hash of state names
//  and nested state machines which handle the details of those states.
TP.core.StateMachine.Inst.defineAttribute('byParent');

//  Lookup container for states by target state. This gives you a list of states
//  a particular state can be reached from. "Prerequisite states" as it were.
TP.core.StateMachine.Inst.defineAttribute('byTarget');

//  The receiver's child state machine, if any is currently active.
TP.core.StateMachine.Inst.defineAttribute('child');

//  The receiver's parent state machine, if any. This value is only appropriate
//  for a nested state machine instance.
TP.core.StateMachine.Inst.defineAttribute('parent');

//  The current state.
TP.core.StateMachine.Inst.defineAttribute('state');

//  The log of state transitions this state machine has undergone. This is
//  trimmed to TP.core.StateMachine.LOG_MAX avoid large-scale leaking.
TP.core.StateMachine.Inst.defineAttribute('stateLog');

//  The last time a trigger signal was fired. We track this to avoid multiple
//  firings of the trigger signal when doing a transition.
TP.core.StateMachine.Inst.defineAttribute('$lastTriggerTime');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('init',
function(aParent) {

    /**
     * @method init
     * @summary Initializes a new instance of the receiver.
     * @param {TP.core.StateMachine} [aParent] An optional parent state machine
     *     which should handle inputs which aren't processed by the receiver.
     * @returns {TP.core.StateMachine} A new instance.
     */

    this.callNextMethod();

    //  Set up our internal configuration containers.
    this.set('stateLog', TP.ac());

    this.set('byParent', TP.hc());
    this.set('byInitial', TP.hc());
    this.set('byTarget', TP.hc());

    if (TP.isValid(aParent)) {
        this.set('parent', aParent);
    }

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
        states;

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

    //  Clear the state log since we're starting a new activation sequence.
    this.$get('stateLog').empty();

    //  Verify no guard conditions prevent the transition.
    if (!this.mayTransition(null, start)) {
        return false;
    }

    this.transition(TP.hc('state', start));

    this.activateTriggers();

    return true;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('activateTriggers',
function() {

    /**
     * @method activateTriggers
     * @summary Activates the receiver's triggers, typically by invoking
     *     observeTriggers. This method can be overridden as needed to ensure
     *     any other triggering setup occurs.
     */

    this.observeTriggers();

    return;
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

    var child,
        current,
        states;

    //  Can't deactivate when there's no current state.
    if (TP.notTrue(force) && TP.isEmpty(this.get('state'))) {
        this.raise('InvalidOperation',
            'Cannot deactivate an inactive state machine.');
        return false;
    }

    if (TP.isValid(child = this.get('child'))) {
        child.deactivate(force);
    }

    //  Turn off any observations we may have in place regarding input
    //  events. Regardless of errors we may raise we honor the request to
    //  deactivate the inbound triggering.
    this.deactivateTriggers();

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

TP.core.StateMachine.Inst.defineMethod('deactivateTriggers',
function() {

    /**
     * @method deactivateTriggers
     * @summary Deactivates the receiver's triggers, typically by invoking
     *     ignoreTriggers. This method can be overridden as needed to ensure
     *     any other triggering shutdown occurs.
     */

    this.ignoreTriggers();

    return;
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
function(initialState, targetState, transitionDetails) {

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
     * @param {TP.core.Hash} [transitionDetails] A hash containing details on
     *     the transition such as triggers and nested machine activation.
     * @param {String|Array.<String>} [transitionDetails.signal]
     * @param {TP.core.StateMachine|String} [transitionDetails.nested]. The type
     *     name for a nested state machine, or the state machine itself.
     */

    var initials,
        parents,
        targets,
        nulls,
        arr,
        options,
        trigger,
        nested;

    if (this.isActive()) {
        this.raise('InvalidOperation',
                    'Cannot modify an active state machine.');

        return;
    }

    initials = this.get('byInitial');
    parents = this.get('byParent');
    targets = this.get('byTarget');

    options = TP.hc(transitionDetails);
    nested = options.at('nested');
    trigger = options.at('trigger');

    if (TP.notEmpty(trigger)) {
        this.addTrigger(trigger);
    }

    //  ---
    //  start states
    //  ---

    if (TP.notValid(initialState)) {

        if (TP.notValid(targetState)) {
            return this.raise('InvalidStateDefinition');
        }

        nulls = initials.at('null');
        if (TP.notValid(nulls)) {
            nulls = TP.ac();
            initials.atPut('null', nulls);
        }

        arr = TP.isArray(targetState) ? targetState : TP.ac(targetState);
        arr.forEach(
            function(key) {
                var list,
                    exists;

                list = targets.at(key);

                if (TP.notValid(list)) {
                    list = TP.ac();
                    targets.atPut(key, list);
                } else {
                    //  Check for duplicates.
                    exists = list.some(
                                function(item) {
                                    return item.at(0) === null;
                                });

                    if (TP.isTrue(exists)) {
                        this.raise('DuplicateStateDefinition',
                                    'null -> ' + key);
                    }
                }

                //  Once we know it's not a duplicate push ordered pairs into
                //  the initial list's null keyset and the targeted key's list.
                nulls.push([key, options]);
                list.push([null, options]);

                if (TP.isValid(nested)) {
                    parents.atPut(key, nested);
                }
            }.bind(this));

        return this;
    }

    //  ---
    //  final states
    //  ---

    if (TP.notValid(targetState)) {

        if (TP.notValid(initialState)) {
            return this.raise('InvalidStateDefinition');
        }

        nulls = targets.at('null');
        if (TP.notValid(nulls)) {
            nulls = TP.ac();
            targets.atPut('null', nulls);
        }

        arr = TP.isArray(initialState) ? initialState : TP.ac(initialState);
        arr.forEach(
            function(key) {
                var list,
                    exists;

                list = initials.at(key);

                if (TP.notValid(list)) {
                    list = TP.ac();
                    initials.atPut(key, list);
                } else {
                    //  Check for duplicates.
                    exists = list.some(
                                function(item) {
                                    return item.at(0) === null;
                                });

                    if (TP.isTrue(exists)) {
                        this.raise('DuplicateStateDefinition',
                                    key + ' -> null');
                    }
                }

                //  Once we know it's not a duplicate push ordered pairs into
                //  the initial list's null keyset and the targeted key's list.
                nulls.push([key, options]);
                list.push([null, options]);
            }.bind(this));

        return this;
    }

    //  If we're this far we're dealing with a definition that has valid values
    //  for both initial and target states.

    //  ---
    //  byInitial
    //  ---

    arr = TP.isArray(initialState) ? initialState : TP.ac(initialState);
    arr.forEach(
        function(key) {
            var list,
                exists,
                items;

            list = initials.at(key);

            if (TP.notValid(list)) {
                list = TP.ac();
                initials.atPut(key, list);
            } else {
                //  Check for duplicates.
                exists = list.some(
                            function(item) {
                                return item.at(0) === targetState;
                            });

                if (TP.isTrue(exists)) {
                    this.raise('DuplicateStateDefinition',
                                key + ' -> ' + targetState);
                }
            }

            items = TP.isArray(targetState) ? targetState : TP.ac(targetState);
            items.forEach(
                    function(target) {
                        list.push([target, options]);
                    });

        }.bind(this));

    //  ---
    //  byTarget
    //  ---

    arr = TP.isArray(targetState) ? targetState : TP.ac(targetState);
    arr.forEach(
        function(key) {
            var list,
                exists,
                items;

            list = targets.at(key);

            if (TP.notValid(list)) {
                list = TP.ac();
                targets.atPut(key, list);
            } else {
                //  Check for duplicates.
                exists = list.some(
                            function(item) {
                                return item.at(0) === targetState;
                            });

                if (TP.isTrue(exists)) {
                    this.raise('DuplicateStateDefinition', key + ' -> ' +
                        targetState);
                }
            }

            items = TP.isArray(initialState) ?
                                initialState :
                                TP.ac(initialState);

            items.forEach(
                    function(initial) {
                        list.push([initial, options]);
                    });

            if (TP.isValid(nested)) {
                parents.atPut(key, nested);
            }
        }.bind(this));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('exit',
function(details, nested) {

    /**
     * @method exit
     * @summary Performs exit processing, ensuring that any nested state
     *     machines exit before their outer composite state machines.
     * @param {TP.core.Hash} details Transition information including
     *     'state' (the new state), and 'trigger' (usually a signal).
     * @param {Boolean} [nested] True if the call is being invoked by a parent
     *     on a nested child state machine.
     * @return {TP.core.StateMachine} The receiver.
     */

    var child,
        state,
        signal;

    if (TP.isValid(child = this.get('child'))) {
        //  Exit the child, telling it it's being deactivated by a parent.
        child.exit(details, true);

        //  Clear the child reference. We're exiting the state that "owned" it.
        this.set('child', null);
    }

    //  Exit works with whatever local state we're currently in.
    state = this.get('state');

    //  {Old}Exit or StateExit[When{Old}]
    signal = this.getActionSignal(state, TP.EXIT);
    signal.setPayload(details);
    signal.fire();

    if (TP.isTrue(nested)) {
        //  If we're being exited "top down" from the parent then we need to
        //  clear up any leftover state.
        this.set('parent', null);
        this.deactivate(true);
    }

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
     * @summary Constructs a valid state transition signal for the state name
     *     and state action being processed.
     * @param {String} stateName The name of the state.
     * @param {String} stateAction TP.ENTER, TP.EXIT, or TP.TRANSITION.
     * @returns {TP.sig.StateSignal} The state signal.
     */

    var name,
        sigType,
        signal;

    //  Compute a name based on the state and the action name
    name = this.getStateName(stateName) + this.getActionName(stateAction);

    //  See if that name can be resolved to either an APP.sig or TP.sig signal.
    sigType = TP.sys.getTypeByName('APP.sig.' + name);
    if (!TP.isType(sigType)) {
        sigType = TP.sys.getTypeByName('TP.sig.' + name);
    }

    //  If so, construct one, set it's origin and return that.
    if (TP.isType(sigType)) {
        signal = sigType.construct();
        signal.setOrigin(this);

        return signal;
    }

    //  Otherwise, we construct a 'generic' state signal subtype of
    //  TP.sig.StateSignal, based on the state action.
    switch (stateAction) {
        case TP.ENTER:
            sigType = TP.sig.StateEnter;
            break;
        case TP.EXIT:
            sigType = TP.sig.StateExit;
            break;
        case TP.INPUT:
            sigType = TP.sig.StateInput;
            break;
        default:
            sigType = TP.sig.StateTransition;
            break;
    }

    //  Construct it and set it's name locally to the fully expanded signal name
    //  (if possible - this is a spoofed signal anyway).
    signal = sigType.construct();
    signal.setSignalName(TP.expandSignalName(name));
    signal.setOrigin(this);

    return signal;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('getCurrentState',
function() {

    /**
     * @method getCurrentState
     * @summary Returns the current state as a string with the canonical name.
     * @returns {String} The normalized state name.
     */

    var child,
        state;

    if (TP.isValid(child = this.get('child'))) {
        return child.getCurrentState();
    }

    state = this.$get('state');
    if (TP.notValid(state)) {
        return;
    }

    return state;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('getCurrentStates',
function() {

    /**
     * @method getCurrentStates
     * @summary Returns the list of all current state names from most-nested
     *     child state to the receiver.
     * @returns {String[]} The list of state names.
     */

    var arr,
        child,
        state;

    if (TP.isValid(child = this.get('child'))) {
        arr = child.getCurrentStates();
    } else {
        arr = TP.ac();
    }
    state = this.get('state');

    if (TP.isValid(state)) {
        arr.push(state);
    }

    return arr;
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

    hash = this.get('byTarget');
    items = hash.at('null');

    if (TP.notValid(items)) {
        return TP.ac();
    }

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

    hash = this.get('byInitial');
    items = hash.at('null');

    if (TP.notValid(items)) {
        return TP.ac();
    }

    return items.collect(
                function(item) {
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

    if (TP.isString(aState)) {
        return aState.asTitleCase();
    }

    return TP.str(aState).asStartUpper();
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineHandler('Signal',
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
     * @summary Returns whether or not the receiver is in an active state.
     * @returns {Boolean} Whether or not the receiver is active.
     */

    return TP.notEmpty(this.get('state'));
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('mayTransition',
function(initial, target, trigger) {

    /**
     * @method mayTransition
     * @summary Returns true if no guards or other conditions block the
     *     potential transition being suggested.
     * @param {String} initial The initial state.
     * @param {String} target The target state.
     * @param {String|TP.core.Signal} [trigger] Triggering signal or name.
     * @return {Boolean} True if the transition isn't blocked by a guard.
     */

    var guard,
        details,
        signal,
        conditional;

    conditional = true;

    if (TP.notValid(initial)) {
        details = this.get('byInitial').at('null');
    } else {
        details = this.get('byInitial').at(initial);
    }

    if (TP.isValid(details)) {
        details = details.filter(function(item) {
            return item.at(0) === target;
        }).first().last();
    }

    if (TP.isValid(details)) {
        guard = details.at('guard');
        if (TP.isValid(guard)) {
            if (TP.isFunction(guard)) {
                return guard(trigger);
            } else if (TP.canInvoke(this, guard)) {
                return this[guard](trigger);
            } else {
                this.raise('InvalidStateGuard', guard);
                return false;
            }
        }

        //  Check against trigger. Note however that we only set the result as a
        //  conditional result. If we find a hard-coded accept function on the
        //  receiver we run that to get the real answer.
        signal = details.at('trigger');
        if (TP.isValid(signal)) {
            if (TP.isValid(trigger)) {
                if (TP.isString(signal)) {
                    conditional = trigger.getSignalNames().contains(signal);
                } else {
                    conditional = TP.isKindOf(signal, trigger);
                }
            } else {
                //  Nothing to match/test against but we had a requirement that
                //  was specified. When we have a guard condition but can't
                //  verify we fail.
                conditional = false;
            }
        }
    }

    //  Didn't have a valid guard function. Check for local method guards.
    guard = 'accept' + this.getStateName(target) +
            'When' + this.getStateName(initial);

    if (TP.canInvoke(this, guard)) {
        return this[guard](trigger);
    } else {
        guard = 'accept' + this.getStateName(target);
        if (TP.canInvoke(this, guard)) {
            return this[guard](trigger);
        }
    }

    //  If no local method guard return any conditional trigger value.
    return conditional;
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
function(details) {

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
     * @param {TP.core.Hash} details Transition information including
     *     'state' (the new state), and 'trigger' (usually a signal).
     */

    var oldState,
        newState,

        triggerTime,
        lastTriggerTime,
        internal,
        trigger,
        handler,
        signal,
        parent,
        type,
        child,
        states;

    oldState = details.at('prior');
    newState = details.at('state');

    //TP.info('TP.core.StateMachine :: transition -' +
    //          ' oldState: ' + oldState +
    //          ' newState: ' + newState +
    //          ' trigger: ' + TP.str(details.at('trigger')));

    //  If the state isn't changing this is an internal transition request.

    //  If we are triggered try to directly respond to that triggering
    //  signal as our first priority.
    trigger = details.at('trigger');

    //  If we can obtain a time from the trigger (i.e. it's a TP.sig.Signal of
    //  some sort), then we do so. We'll use this in a comparison below.
    if (TP.isKindOf(trigger, 'TP.sig.Signal')) {
        triggerTime = trigger.get('time');
    } else {
        //  Otherwise, we just set the last trigger time to 0.
        this.set('$lastTriggerTime', 0);
    }

    //  Certain cases seem to misbehave here if we don't force parens.
    /* eslint-disable no-extra-parens */
    internal = (oldState === newState);
    /* eslint-enable no-extra-parens */

    if (internal) {

        //  If our last trigger time matches the trigger time for this signal,
        //  then we exit here. This is because we might have already fired this
        //  signal (as part of our 'fire the INPUT signal' convenience) just
        //  before we transitioned out of a state (see below) and we don't want
        //  it to fire again.
        lastTriggerTime = this.get('$lastTriggerTime');
        if (TP.isNumber(lastTriggerTime) &&
            triggerTime === lastTriggerTime) {
            return;
        }

        //  If we are triggered try to directly respond to that triggering
        //  signal as our first priority.
        if (TP.isKindOf(trigger, 'TP.sig.Signal')) {

            //  Try to handle locally within this state machine.
            handler = this.getBestHandler(trigger, null, null, null, 'Signal');
            if (TP.isFunction(handler)) {
                handler.call(this, trigger);
            } else {
                //  Try bubbling to parent if not handled.
                if (TP.isValid(parent = this.get('parent'))) {
                    handler = parent.getBestHandler(
                        trigger, null, null, null, 'Signal');
                    if (TP.isFunction(handler)) {
                        handler.call(parent, trigger);
                    }
                }
            }
        }

        //  Fire any input signal as a 'convenience'

        //  {Old}Input or StateInputWhen{Old}
        signal = this.getActionSignal(oldState, TP.INPUT);
        signal.setPayload(details);

        //  Try to handle it locally. The state machine itself gets first chance
        //  at any input/internal transition signals. NOTE that we have to watch
        //  out for invoking our update routine recursively via handleSignal :).
        handler = this.getBestHandler(signal, null, null, null, 'Signal');
        if (TP.isFunction(handler)) {
            handler.call(this, signal);
        } else {
            //  If this is a nested state machine bubble the option to handle
            //  the input to our outer composite state. This is the fundamental
            //  feature of a truly nested state machine.
            if (TP.isValid(parent = this.get('parent'))) {
                handler = parent.getBestHandler(signal, null, null, null, 'Signal');
                if (TP.isFunction(handler)) {
                    handler.call(parent, signal);
                }
            }
        }

        //  Note that if the signal has been stopped this won't do much.
        if (!signal.shouldStop() && !signal.shouldStopImmediately()) {
            signal.fire();
        }

    } else {

        //  The first thing we do before we transition out of the current state
        //  is fire the INPUT signal, as a 'convenience'.

        //  {Old}Input or StateInputWhen{Old}
        signal = this.getActionSignal(oldState, TP.INPUT);
        signal.setPayload(details);

        //  Try to handle it locally. The state machine itself gets first chance
        //  at any input/internal transition signals. NOTE that we have to watch
        //  out for invoking our update routine recursively via handleSignal :).
        handler = this.getBestHandler(signal, null, null, null, 'Signal');
        if (TP.isFunction(handler)) {
            handler.call(this, signal);
        } else {
            //  If this is a nested state machine bubble the option to handle
            //  the input to our outer composite state. This is the fundamental
            //  feature of a truly nested state machine.
            if (TP.isValid(parent = this.get('parent'))) {
                handler = parent.getBestHandler(signal, null, null, null, 'Signal');
                if (TP.isFunction(handler)) {
                    handler.call(parent, signal);
                }
            }
        }

        //  Note that if the signal has been stopped this won't do much.
        if (!signal.shouldStop() && !signal.shouldStopImmediately()) {
            signal.fire();
        }

        //  Now go ahead and do the state transition

        //  When processing a start state there is no state to exit.
        if (TP.notEmpty(oldState)) {

            //  Invoke the exit routine to ensure any child exit processing
            //  occurs in the right order.
            this.exit(details);
        }

        //  {New}Transition or StateTransition[When{Old}]
        signal = this.getActionSignal(newState, TP.TRANSITION);
        signal.setPayload(details);
        signal.fire();

        //  Transition our state. We do this here to ensure that any "When"
        //  clause construction will be using accurate transition values.
        if (oldState !== newState) {
            this.$setState(newState);
        }

        //  {New}Enter or StateEnterWhen{New}
        signal = this.getActionSignal(newState, TP.ENTER);
        signal.setPayload(details);
        signal.fire();

        //  If the state is mapped to a nested state machine that machine should
        //  now be activated. This operation is required to occur after the
        //  composite state "enter" function has completed.
        child = this.get('byParent').at(newState);
        if (TP.isValid(child)) {
            if (!TP.isKindOf(child, 'TP.core.StateMachine')) {
                type = TP.sys.require(child);
                if (TP.isType(type)) {
                    child = type.construct();
                } else {
                    this.raise('InvalidStateMachine',
                        'Invalid nested state machine specification: ' +
                        child);
                    child = null;
                }
            }

            if (TP.isValid(child)) {
                this.set('child', child);
                child.set('parent', this);
                child.activate();
            }
        }

        //  We can automatically deactivate when we reach the final state if
        //  that state is "final only" meaning it can't transition to any other
        //  state as an alternative route.
        states = this.$getFinalStates();
        if (states.indexOf(newState) !== TP.NOT_FOUND) {

            //  A final state. But it is a "final only" state?
            states = this.get('byInitial').at(newState);
            states = states.map(
                        function(item) {
                            return item.at(0);
                        });
            if (states.length === 1 && states.at(0) === null) {

                this.deactivate();

                //  If we're a nested state machine we're essentially done, but
                //  we need to also trigger our parent to update since the
                //  child has reached a terminal point.
                if (TP.isValid(parent = this.get('parent'))) {
                    //  NOTE that this should cause a parent transition which
                    //  ultimately exits the parent and cleans up references.
                    parent.updateCurrentState(details);
                }
            }
        }
    }

    //  Capture the time that the last trigger signal fired.
    this.set('$lastTriggerTime', triggerTime);

    return;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('updateCurrentState',
function(signalOrParams) {

    /**
     * @method updateCurrentState
     * @summary Sets the receiver's state as necessary based on parameter input.
     *     In all cases a transition is requested but it may be an internal
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
        stateName;

    //  Check the various state test functions and determine what our state
    //  should be.
    oldState = this.get('state');
    newState = oldState;

    //TP.info('TP.core.StateMachine :: updateCurrentState -' +
    //          ' oldState: ' + oldState +
    //          ' newState: ' + newState);

    //  Get the list of potential target states to be checked.
    stateTargets = this.get('byInitial').at(oldState);

    if (TP.isEmpty(stateTargets)) {

        //  No target states means we're at a final state, but apparently didn't
        //  deactivate since we're still receiving input from our triggers.
        TP.ifWarn() ?
            TP.warn('State update request yielded no targets for: ' +
                    oldState +
                    '.') : 0;

        return oldState;
    } else {
        //  We can get 0, which means no new state, 1...which means we have
        //  a new state, or > 1 which means we have an inconsistent state
        //  machine config/definition because more than one state test
        //  passed and we have more than one potential transition.
        stateCount = 0;

        len = stateTargets.getSize();

        //  If this is not a 'final only' state, then disqualify transitioning
        //  to a deactivated state. Require explicit deactivation instead.
        if (len > 1) {
            stateTargets = stateTargets.filter(
                            function(target) {
                                return target.first() !== null;
                            });
        }

        //  Make sure to refetch len in case we filtered some out.
        len = stateTargets.getSize();
        for (i = 0; i < len; i++) {

            stateName = stateTargets.at(i).first();

            if (this.mayTransition(oldState, stateName, signalOrParams)) {

                targetState = stateName;
                stateCount++;
            }
        }

        if (stateCount > 1) {
            this.raise('InvalidStateTransition',
                'Multiple valid target states for transition from: ' +
                oldState);
            return oldState;
        } else if (stateCount === 1) {
            newState = targetState;
        }
    }

    //  Invoke the transition machinery. Note that there's no requirement here
    //  that the two states (old, new) be different. The transition call deals
    //  with both true transitions and with "internal" transitions/stateInput.
    this.transition(
        TP.hc('state', newState,
                'prior', oldState,
                'trigger', signalOrParams));

    return newState;
});

//  ========================================================================
//  TP.core.StateResponder
//  ========================================================================

/**
 * @type {TP.core.StateResponder}
 * @summary A common supertype for StateMachine event responders.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('TP.core.StateResponder');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  The state machine that the responder is listening to for state changes and
//  input signals.
TP.core.StateResponder.Inst.defineAttribute('stateMachine');

//  The state that, upon entry, will cause the responder to start listening to
//  the state machine for state changes.
TP.core.StateResponder.Inst.defineAttribute('mainState');

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

    if (TP.notValid(stateMachine)) {
        return this.raise('InvalidParameter');
    }

    this.set('stateMachine', stateMachine);

    this.setup();

    //  Make sure to register this object *before* observing
    //  StateEnter/StateExit from the state machine. This will allow the
    //  signaling system to properly manage registering/unregistering of the
    //  same object as its state machines move through various states.
    TP.sys.registerObject(this);

    this.observe(stateMachine, TP.ac('TP.sig.StateEnter', 'TP.sig.StateExit'));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineMethod('didEnter',
function(aSignal) {

    /**
     * @method didEnter
     * @summary Invoked when the receiver enters it's 'main state'.
     * @param {TP.sig.StateEnter} aSignal The signal that caused the state
     *     machine to enter a state that matches the receiver's 'main state'.
     * @returns {TP.core.StateResponder} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineMethod('didExit',
function(aSignal) {

    /**
     * @method didExit
     * @summary Invoked when the receiver exits it's 'main state'.
     * @param {TP.sig.StateExit} aSignal The signal that caused the state
     *     machine to exit a state that matches the receiver's 'main state'.
     * @returns {TP.core.StateResponder} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineMethod('executeTriggerSignalHandler',
function(aSignal) {

    /**
     * @method executeTriggerSignalHandler
     * @summary Executes the handler on the receiver (if there is one) for the
     *     trigger signal (the underlying signal that caused a StateInput signal
     *     to be fired from the state machine to this object).
     * @param {TP.sig.StateInput} aSignal The signal that caused the state
     *     machine to get further input. The original triggering signal will be
     *     in this signal's payload under the key 'trigger'.
     * @returns {TP.core.StateResponder} The receiver.
     */

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineHandler('StateEnter',
function(aSignal) {

    /**
     * @method handleStateEnter
     * @summary Handles 'enter signals' from the state machine.
     * @param {TP.sig.StateEnter} aSignal The signal that caused the state
     *     machine to enter a particular state. If this state matches the
     *     receiver's 'main state', it will start observing StateInput signals
     *     from the state machine.
     * @returns {TP.core.StateResponder} The receiver.
     */

    if (aSignal.at('state') === this.get('mainState')) {
        this.observe(this.get('stateMachine'), TP.sig.StateInput);
        this.didEnter(aSignal);
    }

    return this;
});

//  ----------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineHandler('StateExit',
function(aSignal) {

    /**
     * @method handleStateExit
     * @summary Handles 'exit signals' from the state machine.
     * @param {TP.sig.StateExit} aSignal The signal that caused the state
     *     machine to exit a particular state. If this state matches the
     *     receiver's 'main state', it will stop observing StateInput signals
     *     from the state machine.
     * @returns {TP.core.StateResponder} The receiver.
     */

    if (aSignal.at('prior') === this.get('mainState')) {
        this.ignore(this.get('stateMachine'), TP.sig.StateInput);
        this.didExit(aSignal);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineHandler('StateInput',
function(aSignal) {

    /**
     * @method handleStateInput
     * @summary Handles 'input signals' from the state machine.
     * @param {TP.sig.StateInput} aSignal The signal that caused the state
     *     machine to get further input. The original triggering signal will
     *     be in this signal's payload under the key 'trigger'.
     * @returns {TP.core.StateResponder} The receiver.
     */

    var triggerSignal;

    //  If the signal's 'prior' slot is equal to our main state, then we pluck
    //  out the triggering signal and handle it. Note that we use 'prior'
    //  because, in the case of a state transition, input signals will be
    //  dispatched one last time before transitioning out of the state and this
    //  is what we're typically interested in. For cases where there isn't a
    //  state transition, 'prior' will also have the current state name as a
    //  convenience.

    if (aSignal.at('prior') === this.get('mainState')) {
        triggerSignal = aSignal.getPayload().at('trigger');
        this.executeTriggerSignalHandler(triggerSignal);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Sets up the receiver. Note that any configuration that the
     *     receiver wants to do of the state machine it will be using should be
     *     done here before the receiver becomes a registered object and begins
     *     observing the state machine for enter/exit/input signals.
     * @returns {TP.core.StateResponder} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineMethod('teardown',
function() {

    /**
     * @method teardown
     * @summary Tears down the receiver. At this level, this just ignores the
     *     state transition signals that the receiver was set up to observe on
     *     its state machine when it was created.
     * @returns {TP.core.StateResponder} The receiver.
     */

    this.ignore(this.get('stateMachine'),
                TP.ac('TP.sig.StateEnter', 'TP.sig.StateExit'));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
