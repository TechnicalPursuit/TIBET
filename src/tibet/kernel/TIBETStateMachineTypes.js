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

TP.sig.StateSignal.Type.defineAttribute('defaultPolicy', TP.OBSERVER_FIRING);

TP.sig.StateSignal.Inst.defineAttribute('$shouldScanSupers', true);

TP.sig.StateSignal.Type.isControllerSignal(true);
TP.sig.StateSignal.isControllerRoot(true);

// ---

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
//  Local Methods
//  ------------------------------------------------------------------------

TP.core.StateMachine.defineMethod('normalizeState',
function(aState) {

    if (!TP.isString(aState)) {
        if (TP.notValid(aState)) {
            return 'Null';
        }

        return this.raise('InvalidState');
    }

    return aState.asTitleCase();
});

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
     * @returns {Boolean} True if the activation was successful.
     */

    var start,
        state,
        states;

    state = this.getStateName(aState);

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
        if (states.indexOf(state) !== TP.NOT_FOUND) {
            start = state;
        } else {
            //  Not a valid start state.
            this.raise('InvalidStartState', state);
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

    this.transition(start);

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
     * @returns {TP.core.StateMachine} The receiver.
     */

    this.observeTriggers();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('deactivate',
function(force) {

    /**
     * @method deactivate
     * @summary Shuts down the state machine, returning it to an indeterminate
     *     state. This is typically called as part of the final state transition
     *     processing when the state machine transitions to its final state.
     * @exception {TP.sig.InvalidFinalState} If the state machine isn't in its
     *     final state when this method is called.
     * @param {Boolean} [force=false] True to force deactivation regardless of
     *     whether the receiver is in a final state.
     * @returns {Boolean} True if deactivation was successful.
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

    //  Clear the state flag manually. Using the setter will cause either an
    //  error or a true string value.
    this.state = null;

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
     * @returns {TP.core.StateMachine} The receiver.
     */

    this.ignoreTriggers();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('defineStates',
function() {

    /**
     * @method defineStates
     * @summary Invoked by the init method to set up initial states for the
     *     receiver. If this method is not used via a subtype you must use
     *     other direct calls to properly configure the state machine.
     * @returns {TP.core.StateMachine} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('defineState',
function(initialState, targetState, transitionDetails) {

    /**
     * @method defineState
     * @summary Adds a single state pathway, which consists of initial state(s)
     *     and target state(s). The state machine itself serves as a potential
     *     guard function repository. Methods of the form 'accept{State}' will
     *     be invoked during transitions.
     * @param {String|String[]} [initialState] The name of the initial state(s).
     *     Defaults to null since start states may not have an initial state.
     * @param {String|String[]} [targetState] The name of the target state(s).
     *     Defaults to null since final states may not have target states.
     * @param {TP.core.Hash} [transitionDetails] A hash containing details on
     *     the transition such as triggers and nested machine activation.
     * @param {String|String[]} [transitionDetails.signal]
     * @param {TP.core.StateMachine|String} [transitionDetails.nested]. The type
     *     name for a nested state machine, or the state machine itself.
     */

    var initials,
        parents,
        targets,
        initial,
        target,
        nulls,
        options,
        trigger,
        triggers,
        nested,
        machine;

    if (this.isActive()) {
        this.raise('InvalidOperation',
                    'Cannot modify an active state machine.');

        return this;
    }

    /* eslint-disable consistent-this */

    machine = this;

    initial = TP.isArray(initialState) ? initialState : TP.ac(initialState);
    initial = initial.map(
                function(state) {
                    return machine.getStateName(state);
                });

    target = TP.isArray(targetState) ? targetState : TP.ac(targetState);
    target = target.map(
                function(state) {
                    return machine.getStateName(state);
                });

    initials = this.get('byInitial');
    parents = this.get('byParent');
    targets = this.get('byTarget');

    options = TP.hc(transitionDetails);
    nested = options.at('nested');

    //  Normalize singular/multiple triggers into a single set.
    triggers = options.at('triggers');
    if (TP.notValid(triggers)) {
        triggers = TP.ac();
    }

    trigger = options.at('trigger');
    if (TP.isValid(trigger)) {
        //  Clear it so we only look for triggers after this process.
        options.removeKey('trigger');

        //  Trigger should be an array and should include an origin and a
        //  signal. If we're not seeing that we warn and try to treat the
        //  value as a signal (and TP.ANY as the origin).
        if (TP.isArray(trigger)) {
            triggers.push(trigger);
        } else if (TP.isString(trigger) ||
                TP.isKindOf(trigger, TP.sig.Signal)) {
            TP.warn('State machine triggers should define origin and signal.');
            triggers.push(TP.ac(TP.ANY, trigger));
        } else {
            this.raise('InvalidTrigger', trigger);
        }
    }

    //  Register all normalized triggers.
    if (TP.notEmpty(triggers)) {
        options.atPut('triggers', triggers);
        this.addTriggers(triggers);
    }

    //  ---
    //  start states
    //  ---

    if (TP.notValid(initialState)) {

        if (TP.notValid(targetState)) {
            return this.raise('InvalidStateDefinition');
        }

        nulls = initials.at(this.getStateName(null));
        if (TP.notValid(nulls)) {
            nulls = TP.ac();
            initials.atPut(this.getStateName(null), nulls);
        }

        target.forEach(
            function(key) {
                var list,
                    exists;

                list = targets.at(machine.getStateName(key));

                if (TP.notValid(list)) {
                    list = TP.ac();
                    targets.atPut(machine.getStateName(key), list);
                } else {
                    //  Check for duplicates.
                    exists = list.some(
                                function(item) {
                                    return item.at(0) ===
                                        machine.getStateName(null);
                                });

                    if (TP.isTrue(exists)) {
                        machine.raise('DuplicateStateDefinition',
                                    'null -> ' + key);
                    }
                }

                //  Once we know it's not a duplicate push ordered pairs into
                //  the initial list's null keyset and the targeted key's list.
                nulls.push([key, options]);
                list.push([machine.getStateName(null), options]);

                if (TP.isValid(nested)) {
                    parents.atPut(machine.getStateName(key), nested);
                }
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

        nulls = targets.at(this.getStateName(null));
        if (TP.notValid(nulls)) {
            nulls = TP.ac();
            targets.atPut(this.getStateName(null), nulls);
        }

        initial.forEach(
            function(key) {
                var list,
                    exists;

                list = initials.at(machine.getStateName(key));

                if (TP.notValid(list)) {
                    list = TP.ac();
                    initials.atPut(machine.getStateName(key), list);
                } else {
                    //  Check for duplicates.
                    exists = list.some(
                                function(item) {
                                    return item.at(0) ===
                                        machine.getStateName(null);
                                });

                    if (TP.isTrue(exists)) {
                        machine.raise('DuplicateStateDefinition',
                                    key + ' -> null');
                    }
                }

                //  Once we know it's not a duplicate push ordered pairs into
                //  the initial list's null keyset and the targeted key's list.
                nulls.push([key, options]);
                list.push([machine.getStateName(null), options]);
            });

        return this;
    }

    //  If we're this far we're dealing with a definition that has valid values
    //  for both initial and target states.

    //  ---
    //  byInitial
    //  ---

    initial.forEach(
        function(key) {
            var list;

            list = initials.at(machine.getStateName(key));

            if (TP.notValid(list)) {
                list = TP.ac();
                initials.atPut(machine.getStateName(key), list);

                target.forEach(
                    function(item) {
                        list.push([item, options]);
                    });

            } else {

                //  Check for duplicates as we iterate and push new items.
                target.forEach(
                    function(tname) {
                        var exists;

                        exists = list.some(
                            function(item) {
                                return item.at(0) === tname;
                            });

                        if (TP.isTrue(exists)) {
                            machine.raise('DuplicateStateDefinition',
                                        key + ' -> ' + tname);
                        } else {
                            list.push([tname, options]);
                        }
                    });
            }
        });

    //  ---
    //  byTarget
    //  ---

    target.forEach(
        function(key) {
            var list;

            list = targets.at(machine.getStateName(key));

            if (TP.notValid(list)) {
                list = TP.ac();
                targets.atPut(machine.getStateName(key), list);

                initial.forEach(
                    function(item) {
                        list.push([item, options]);
                    });

            } else {

                //  Check for duplicates as we iterate and push new items.
                initial.forEach(
                    function(iname) {
                        var exists;

                        exists = list.some(
                            function(item) {
                                return item.at(0) === iname;
                            });

                        if (TP.isTrue(exists)) {
                            machine.raise('DuplicateStateDefinition',
                                        key + ' -> ' + iname);
                        } else {
                            list.push([iname, options]);
                        }
                    });
            }

            if (TP.isValid(nested)) {
                parents.atPut(machine.getStateName(key), nested);
            }
        });

    /* eslint-enable consistent-this */

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
     *     'state' (the new state), and 'trigger' (origin/signal pair).
     * @param {Boolean} [nested] True if the call is being invoked by a parent
     *     on a nested child state machine.
     * @returns {TP.core.StateMachine} The receiver.
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
     * @param {String} stateAction TP.ENTER, TP.EXIT, TP.INPUT, or TP.TRANSITION.
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
function(childExit) {

    /**
     * @method getCurrentState
     * @summary Returns the current state as a string with the canonical name.
     * @param {Boolean} [childExit=false] True if this is being called by the
     *     child during exit processing. This is required to ensure that when
     *     the parent transitions it knows to ignore client state.
     * @returns {String|undefined} The normalized state name.
     */

    var child,
        state;

    if (TP.notTrue(childExit) && TP.isValid(child = this.get('child'))) {
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
     * @returns {String[]} The list of final state names.
     */

    var hash,
        items;

    hash = this.get('byTarget');
    items = hash.at(this.getStateName(null));

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
     * @returns {String[]} The list of start state names.
     */

    var hash,
        items;

    hash = this.get('byInitial');
    items = hash.at(this.getStateName(null));

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

    return TP.core.StateMachine.normalizeState(aState);
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('getTargetStates',
function(initial) {

    /**
     * @method getTargetStates
     * @summary Returns the list of all potential target state names from a
     *     particular state (or the current state).
     * @param {String} [initial=currentState] The state to use as a start state
     *     in the target state search.
     * @returns {String[]} The list of state names.
     */

    var start,
        initials;

    //  NOTE we use arguments.length test here since we have a null state as the
    //  pre-start state and can use that to list 'start states'.
    start = arguments.length === 0 ? this.getCurrentState() : initial;
    start = this.getStateName(start);

    initials = this.$get('byInitial').at(start);

    if (TP.notValid(initials)) {
        return TP.ac();
    }

    return initials.collect(function(item) {
        return item.first();
    }).unique();
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
     * @returns {TP.core.StateMachine} The receiver.
     */

    this.updateCurrentState(aSignal);

    return this;
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
function(initialState, targetState, trigger) {

    /**
     * @method mayTransition
     * @summary Returns true if no guards or other conditions block the
     *     potential transition being suggested.
     * @param {String} initialState The initial state.
     * @param {String} targetState The target state.
     * @param {String|TP.core.Signal} [trigger] Triggering signal or name.
     * @returns {Boolean} True if the transition isn't blocked by a guard.
     */

    var guard,
        details,
        initial,
        target,
        triggers,
        conditional;

    initial = this.getStateName(initialState);
    target = this.getStateName(targetState);

    if (TP.notValid(initialState)) {
        details = this.get('byInitial').at(this.getStateName(null));
    } else {
        details = this.get('byInitial').at(initial);
    }

    if (TP.isValid(details)) {
        details = details.filter(function(item) {
            return item.at(0) === target;
        }).first().last();
    }

    if (TP.isValid(details)) {

        triggers = details.at('triggers');
        if (TP.notEmpty(triggers)) {

            //  There's at least one trigger 'guarding' the transition. At least
            //  one of them must provide for conditional success to move ahead.
            conditional = triggers.some(function(pair) {
                var signal,
                    origin;

                origin = pair.first();
                signal = pair.last();

                if (TP.isValid(trigger)) {
                    if (origin !== TP.ANY) {
                        if (origin !== trigger.getOrigin()) {
                            return false;
                        }
                    }

                    if (TP.isString(signal)) {
                        return trigger.getSignalNames().contains(signal);
                    } else {
                        return TP.isKindOf(signal, trigger);
                    }
                } else {
                    //  Nothing to match/test against but we had a
                    //  requirement that was specified. When we have a guard
                    //  condition but can't verify we fail.
                    return false;
                }
            });
        } else {
            //  No trigger checks, let any guard functions run. If there aren't
            //  any guards the value here will be returned, implying conditional
            //  success (no triggers filtered it, no guards filtered it).
            conditional = true;
        }

        if (TP.isTrue(conditional)) {
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
        } else {
            return conditional;
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

    var log,
        state;

    state = this.getStateName(newState);

    this.$set('state', state);

    //  Log the new state, truncating the log to ensure that it doesn't grow
    //  beyond a maximum threshold.
    log = this.get('stateLog');
    log.push(newState);
    log.length = log.length.min(TP.core.StateMachine.LOG_MAX);

    return this.get('state');
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('transition',
function(aState, signalOrParams, childExit) {

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
     * @param {String} aState The state to transition to.
     * @param {TP.sig.Signal|TP.core.Hash|Array} signalOrParams
     *     Triggering information, usually a signal or parameter data.
     * @param {Boolean} [childExit=false] True if this is being called by the
     *     child during exit processing. This is required to ensure that when
     *     the parent transitions it knows to ignore client state.
     * @returns {TP.core.StateMachine} The receiver.
     */

    var oldState,
        newState,
        details,
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

    oldState = this.getCurrentState(childExit);
    newState = this.getStateName(aState);
    trigger = signalOrParams;

    details = TP.hc();
    details.atPut('prior', oldState);
    details.atPut('state', newState);
    details.atPut('trigger', trigger);

    // TP.info('TP.core.StateMachine :: transition -' +
    //          ' oldState: ' + oldState +
    //          ' newState: ' + newState +
    //          ' trigger: ' + TP.str(details.at('trigger')));

    //  If the state isn't changing this is an internal transition request.

    //  If we are triggered try to directly respond to that triggering
    //  signal as our first priority.

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
            return this;
        }

        //  If we are triggered try to directly respond to that triggering
        //  signal as our first priority.
        if (TP.isKindOf(trigger, 'TP.sig.Signal')) {

            //  Try to handle locally within this state machine.
            handler = this.getBestHandler(
                trigger,
                {
                    startSignal: null,
                    skipName: 'Signal'
                });

            if (TP.isFunction(handler)) {
                handler.call(this, trigger);
            } else {
                //  Try bubbling to parent if not handled.
                if (TP.isValid(parent = this.get('parent'))) {
                    handler = parent.getBestHandler(
                        trigger,
                        {
                            startSignal: null,
                            skipName: 'Signal'
                        });

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
        handler = this.getBestHandler(
            signal,
            {
                startSignal: null,
                skipName: 'Signal'
            });

        if (TP.isFunction(handler)) {
            handler.call(this, signal);
        } else {
            //  If this is a nested state machine bubble the option to handle
            //  the input to our outer composite state. This is the fundamental
            //  feature of a truly nested state machine.
            if (TP.isValid(parent = this.get('parent'))) {
                handler = parent.getBestHandler(
                    signal,
                    {
                        startSignal: null,
                        skipName: 'Signal'
                    });

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

        if (TP.notEmpty(oldState)) {
            //  The first thing we do before we transition out of the current
            //  state is fire the INPUT signal, as a 'convenience'.

            //  {Old}Input or StateInputWhen{Old}
            signal = this.getActionSignal(oldState, TP.INPUT);
            signal.setPayload(details);

            //  Try to handle it locally. The state machine itself gets first
            //  chance at any input/internal transition signals. NOTE that we
            //  have to watch out for invoking our update routine recursively
            //  via handleSignal :).
            handler = this.getBestHandler(
                signal,
                {
                    startSignal: null,
                    skipName: 'Signal'
                });

            if (TP.isFunction(handler)) {
                handler.call(this, signal);
            } else {
                //  If this is a nested state machine bubble the option to
                //  handle the input to our outer composite state. This is the
                //  fundamental feature of a truly nested state machine.
                if (TP.isValid(parent = this.get('parent'))) {
                    handler = parent.getBestHandler(
                        signal,
                        {
                            startSignal: null,
                            skipName: 'Signal'
                        });

                    if (TP.isFunction(handler)) {
                        handler.call(parent, signal);
                    }
                }
            }

            //  Note that if the signal has been stopped this won't do much.
            if (!signal.shouldStop() && !signal.shouldStopImmediately()) {
                signal.fire();
            }
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
                type = TP.sys.getTypeByName(child);
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
            if (states.length === 1 && states.at(0) ===
                    this.getStateName(null)) {

                this.deactivate();

                //  If we're a nested state machine we're essentially done, but
                //  we need to also trigger our parent to update since the
                //  child has reached a terminal point.
                if (TP.isValid(parent = this.get('parent'))) {
                    //  NOTE that this should cause a parent transition which
                    //  ultimately exits the parent and cleans up references.
                    parent.updateCurrentState(details, true);
                }
            }
        }
    }

    //  Capture the time that the last trigger signal fired.
    this.set('$lastTriggerTime', triggerTime, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.StateMachine.Inst.defineMethod('updateCurrentState',
function(signalOrParams, childExit) {

    /**
     * @method updateCurrentState
     * @summary Sets the receiver's state as necessary based on parameter input.
     *     In all cases a transition is requested but it may be an internal
     *     transition if the data doesn't necessitate a full state change.
     * @param {TP.sig.Signal|Object} signalOrParams An object containing
     *     information which might help determine the state. Usually a signal
     *     instance provided from the receiver's trigger configuration.
     * @param {Boolean} [childExit=false] True if this is being called by the
     *     child during exit processing. This is required to ensure that when
     *     the parent transitions it knows to ignore client state.
     * @returns {String} The current state name upon exit.
     */

    var machine,
        oldState,
        newState,
        stateTargets,
        stateCount,
        len,
        i,
        targetState,
        stateName;

    /* eslint-disable consistent-this */

    machine = this;

    //  Check the various state test functions and determine what our state
    //  should be.

    oldState = this.getCurrentState(childExit);
                // this.getStateName(this.get('state'));

    newState = oldState;

    // TP.info('TP.core.StateMachine :: updateCurrentState -' +
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
                                return target.first() !==
                                    machine.getStateName(null);
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
    this.transition(newState, signalOrParams, childExit);

    /* eslint-enable consistent-this */

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

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation
TP.core.StateResponder.isAbstract(true);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  Optional array of specific states in which responder receives input signals
//  and their associated redirected triggers.
TP.core.StateResponder.Inst.defineAttribute('inputStates');

//  The state machine that the responder is listening to for state changes and
//  input signals.
TP.core.StateResponder.Inst.defineAttribute('stateMachines');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineMethod('addInputState',
function(aState) {

    /**
     * @method addInputState
     * @summary Adds an individual input state name to the list of states in
     *     which the receiver will process input signals from the state machine.
     * @param {String} aState The name of the state to add.
     * @returns {TP.core.StateResponder} The receiver.
     */

    var state,
        inputs;

    state = TP.core.StateMachine.normalizeState(aState);

    inputs = this.$get('inputStates');
    if (TP.notValid(inputs)) {
        inputs = TP.ac();
    }
    inputs.push(state);
    this.$set('inputStates', inputs, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineMethod('addStateMachine',
function(aStateMachine) {

    /**
     * @method addStateMachine
     * @summary Adds a state machine to the list of state machines the receiver
     *     will observe and respond to.
     * @param {TP.core.StateMachine} aStateMachine The state machine to add.
     * @returns {TP.core.StateResponder} The receiver.
     */

    var machines;

    if (TP.notValid(aStateMachine)) {
        return this.raise('InvalidParameter');
    }

    machines = this.getStateMachines();
    machines.push(aStateMachine);

    this.observe(aStateMachine, TP.sig.StateSignal);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineMethod('getStateMachines',
function() {

    /**
     * @method getStateMachines
     * @summary Returns the receiver's list of state machines.
     * @returns {TP.core.StateMachine[]} The list of state machines.
     */

    var machines;

    machines = this.$get('stateMachines');
    if (TP.notValid(machines)) {
        machines = TP.ac();
        this.$set('stateMachines', machines);
    }

    return machines;
});

//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineMethod('removeStateMachine',
function(aStateMachine) {

    /**
     * @method removeStateMachine
     * @summary Removes a state machine from the list of state machines the
     *     receiver observes and responds to.
     * @param {TP.core.StateMachine} aStateMachine The state machine to add.
     * @returns {TP.core.StateResponder} The receiver.
     */

    var machines;

    if (TP.notValid(aStateMachine)) {
        return this.raise('InvalidParameter');
    }

    machines = this.getStateMachines();
    machines.remove(aStateMachine);

    this.ignore(aStateMachine, TP.sig.StateSignal);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineMethod('setInputStates',
function(anArray) {

    /**
     * @method setInputStates
     * @summary Sets an explicit array of input states, states in which the
     *     responder will receive input signals or input-phase trigger signals.
     * @param {String[]} anArray The array of input states.
     * @returns {TP.core.StateResponder} The receiver.
     */

    this.$set('inputStates', anArray, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineMethod('teardownStateResponder',
function() {

    /**
     * @method teardownStateResponder
     * @summary Tears down the responder. This causes the responder to ignore
     *     all known state machines and to then empty its state machine list.
     * @returns {TP.core.StateResponder} The receiver.
     */

    var thisref,
        machines;

    thisref = this;

    machines = this.getStateMachines();
    machines.forEach(
            function(aStateMachine) {
                thisref.ignore(aStateMachine, TP.sig.StateSignal);
            });
    machines.empty();

    return this;
});

//  ------------------------------------------------------------------------
//  Handlers
//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineHandler('StateSignal',
function(aSignal) {

    /**
     * @method handleStateSignal
     * @summary Responder for top-level StateSignal instance. This method serves
     *     as a common backstop for all StateReponders.
     * @returns {TP.core.StateResponder} The receiver.
     */

    if (TP.sys.shouldLogSignals()) {
        TP.debug('StateSignal: ' + TP.str(aSignal));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.StateResponder.Inst.defineHandler('StateInput',
function(aSignal) {

    /**
     * @method handleStateInput
     * @summary Handles 'input signals' from the state machine. This method
     *     serves as a kind of 'redirector' for StateResponder instances,
     *     allowing them to observe state input signals but have their handlers
     *     for the specific triggering signals invoked as a result.
     * @param {TP.sig.StateInput} aSignal The signal that caused the state
     *     machine to get further input. The original triggering signal will
     *     be in this signal's payload under the key 'trigger'.
     * @returns {TP.core.StateResponder} The receiver.
     */

    var inputs,
        trigger,
        triggerSignal;

    inputs = this.$get('inputStates');
    if (TP.isValid(inputs)) {
        //  NOTE we check against 'prior' here since input signals are passed
        //  'prior' (aka current) and 'state' (aka future).
        if (!inputs.contains(aSignal.at('prior'))) {
            return this;
        }
    }

    if (TP.sys.shouldLogSignals()) {
        TP.debug('StateInput: ' + TP.str(aSignal));
    }

    trigger = aSignal.getPayload().at('trigger');
    if (TP.isKindOf(trigger, TP.sig.Signal)) {
        this.handle(trigger);
    } else if (TP.canInvoke(trigger, 'at')) {
        triggerSignal = trigger.at('trigger');
        if (TP.isKindOf(trigger, TP.sig.Signal)) {
            this.handle(triggerSignal);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
