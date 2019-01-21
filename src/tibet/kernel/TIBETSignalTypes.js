//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 */

//  ========================================================================
//  TP.core.Monitor
//  ========================================================================

/**
 * @type {TP.core.Monitor}
 * @summary A TP.core.Monitor is an object whose responsibility is to
 *     essentially poll one or more target objects, testing them for some
 *     condition and reporting via signal when the condition is true.
 * @description There are a variety of things in a browser which we'd like to be
 *     able to monitor such as style changes or similar aspects which don't have
 *     native events associated with them (yet). In these cases you can use a
 *     TP.core.Monitor to observe the object(s) and test them for a condition.
 *
 *     For example, you might set up a monitor on an element's background color
 *     which signals "UIColorChange" when the background goes from blue to red.
 *     You'd do this by passing the monitor constructor a simple function which
 *     checks the condition you're interested in and returns true when the
 *     signal should be fired.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.Monitor');

TP.core.Monitor.addTraits(TP.core.JobStatus);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  the default testing interval for the monitor's underlying job
TP.core.Monitor.Type.defineAttribute('defaultInterval', 100);

//  the signal type which will be signaled by default for this type
TP.core.Monitor.Type.defineAttribute('defaultSignal');

//  the default test function this type runs to detect monitor events
TP.core.Monitor.Type.defineAttribute('defaultTest');

//  a baseline set of control parameters for the job. these are overlaid
//  with any inbound parameters passed during job construction
TP.core.Monitor.Type.defineAttribute('controlParameters',
                        TP.hc('interval', TP.core.Job.ZERO_DECAY,
                                'limit', TP.core.Job.FOREVER));

//  a baseline set of step parameters for the underlying job. these are
//  merged with any specific parameters passed at job start
TP.core.Monitor.Type.defineAttribute('stepParameters', TP.hc());

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Monitor.Type.defineMethod('getDefaultSignal',
function() {

    /**
     * @method getDefaultSignal
     * @summary Returns the default signal type to signal.
     * @returns {String|TP.sig.Signal} The signal type or signal type name.
     */

    return this.$get('defaultSignal');
});

//  ------------------------------------------------------------------------

TP.core.Monitor.Type.defineMethod('getDefaultTest',
function() {

    /**
     * @method getDefaultTest
     * @summary Returns the default test function used to detect monitor
     *     events.
     * @returns {Function} The default test function.
     */

    return this.$get('defaultTest');
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the TP.core.Job instance used to manage the work of the monitor
TP.core.Monitor.Inst.defineAttribute('job');

//  the (variable) list of target objects to monitor
TP.core.Monitor.Inst.defineAttribute('targets');

//  what test (function) do we run to detect monitor events?
TP.core.Monitor.Inst.defineAttribute('test');

//  what signal should we send out when we detect a valid monitor event?
TP.core.Monitor.Inst.defineAttribute('notifier');

//  the step (function) that will be executed to acquire the target and run the
//  test function against it.
TP.core.Monitor.Inst.defineAttribute('stepFunction');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Monitor.Inst.defineMethod('init',
function(aTarget, aTest, aSignal) {

    /**
     * @method init
     * @summary Initializes a new instance of monitor.
     * @param {Object} aTarget An object or object ID which identifies the
     *     object being monitored. When an ID is used it should be a valid
     *     TP.uri.URI or a String which can be resolved via the
     *     TP.sys.getObjectById() call.
     * @param {Function} [aTest] A function which defines the test being run on
     *     each target object. This should return true to cause the monitor to
     *     signal. If not supplied, the default test as defined by this type
     *     will be used.
     * @param {String|TP.sig.Signal} [aSignal] The signal to fire when/if the
     *     test condition passes. If not supplied, the default signal as defined
     *     by this type will be used.
     * @returns {TP.core.Monitor} A newly initialized instance.
     */

    var test,
        signal,
        func;

    this.callNextMethod();

    //  test can be defaulted on a type-by-type basis so that subtypes of
    //  monitor can be constructed for common cases.
    test = aTest;
    if (TP.notValid(test)) {
        test = this.getType().getDefaultTest();
    }

    if (!TP.isCallable(test)) {
        this.raise('TP.sig.InvalidParameter',
                    'Test must be a runnable function.');

        return this;
    }

    this.$set('test', test);

    //  signal type can be defaulted on a type-by-type basis so subtypes can
    //  avoid requiring a signal name during instance construction
    signal = aSignal;
    if (TP.notValid(signal)) {
        signal = this.getType().getDefaultSignal();
    }

    if (TP.notValid(signal)) {
        this.raise('TP.sig.InvalidParameter',
                    'Signal must be valid signal name or type.');

        return this;
    }

    this.$set('notifier', signal);

    //  configure the target list, which is passed to the test function.
    this.$set('targets', TP.ac());
    this.addTarget(aTarget);

    //  build a step function that incorporates the target/test logic and
    //  construct the job instance we'll use to actually manage the
    //  monitoring
    func = this.constructStepFunction();
    this.constructJob(TP.hc('step', func));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Monitor.Inst.defineMethod('addTarget',
function(aTarget) {

    /**
     * @method addTarget
     * @summary Adds a new target to the list of objects to monitor.
     * @param {String|TP.uri.URI|Function} aTarget A target specification in
     *     one of a variety of forms: TP.uri.URI, string ID, or acquisition
     *     function (or an array of them).
     * @returns {TP.core.Monitor} The receiver.
     */

    var targets,
        len,
        i,
        target;

    if (TP.isArray(aTarget)) {
        targets = aTarget;
    } else {
        targets = TP.ac(aTarget);
    }

    len = targets.getSize();
    for (i = 0; i < len; i++) {
        target = targets.at(i);
        this.$get('targets').add(target);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Monitor.Inst.defineMethod('cleanupResolvedTarget',
function(aTarget) {

    /**
     * @method cleanupResolvedTarget
     * @summary Cleans up any 'instance programmed' state that the monitor might
     *     have placed on the supplied resolved target. At this level, this
     *     method does nothing.
     * @param {Object} aTarget The resolved target (i.e. the Object that was
     *     found by using a piece of targeting information) to clean up.
     * @returns {TP.core.Monitor} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Monitor.Inst.defineMethod('cleanupResolvedTargets',
function() {

    /**
     * @method cleanupResolvedTargets
     * @summary Iterates over the receiver's target, resolves them to an Object
     *     of some type and messages the receiver with the
     *     'cleanupResolvedTarget()' message and that resolved object to clean
     *     up any 'instance programmed' state data that the monitor might have
     *     placed on it.
     * @returns {TP.core.Monitor} The receiver.
     */

    var targets,

        len,
        i,
        target,

        obj;

    targets = this.get('targets');

    //  since we're dealing with a reference type in the form of an
    //  array here the size may vary if add/remove was called between
    //  invocations of the step function
    len = targets.getSize();
    for (i = 0; i < len; i++) {
        target = targets.at(i);
        if (TP.isCallable(target)) {
            try {
                obj = target();
            } catch (e) {
                //  empty
                //  ignore errors in acquisition functions
            }
        } else if (TP.isString(target)) {
            obj = TP.sys.getObjectById(target);
        } else if (TP.isKindOf(target, TP.uri.URI)) {
            //  NB: We assume 'async' of false here.
            obj = target.getResource().get('result');
        } else {
            obj = target;
        }

        //  ignore targets we can't find, it's the same as having not
        //  met the conditional requirements since the monitor might be
        //  testing for existence as the condition to signal for
        if (TP.notValid(obj)) {
            continue;
        }

        this.cleanupResolvedTarget(obj);
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.Monitor.Inst.defineMethod('constructJob',
function(controlParameters) {

    /**
     * @method constructJob
     * @summary Constructs the job instance used to manage the work of the
     *     monitor in terms of scheduling etc.
     * @param {TP.core.Hash} controlParameters The job's control parameters, set
     *     when the job is first constructed.
     * @returns {TP.core.Job} The newly constructed job instance.
     */

    var job;

    job = TP.core.Job.construct(
                    this.getControlParameters(controlParameters));

    this.$set('job', job);

    return job;
});

//  ------------------------------------------------------------------------

TP.core.Monitor.Inst.defineMethod('constructStepFunction',
function() {

    /**
     * @method constructStepFunction
     * @summary Builds a step function specific to the requirements of this
     *     monitor instance. The overall logic of this function is to run
     *     through each target, invoking the test function and signaling the
     *     target signal whenever the test function returns true.
     * @returns {Function} The newly created step function instance.
     */

    var targets,
        test,
        signal,

        retFunc;

    //  we capture these outside the step function so it has the least work
    //  to do internally, just check and return

    targets = this.get('targets');
    test = this.get('test');
    signal = this.get('notifier');

    retFunc = function() {

        var len,
            i,
            target,

            obj;

        //  since we're dealing with a reference type in the form of an
        //  array here the size may vary if add/remove was called between
        //  invocations of the step function
        len = targets.getSize();
        for (i = 0; i < len; i++) {
            target = targets.at(i);
            if (TP.isCallable(target)) {
                try {
                    obj = target();
                } catch (e) {
                    //  empty
                    //  ignore errors in acquisition functions
                }
            } else if (TP.isString(target)) {
                obj = TP.sys.getObjectById(target);
            } else if (TP.isKindOf(target, TP.uri.URI)) {
                //  NB: We assume 'async' of false here.
                obj = target.getResource().get('result');
            } else {
                obj = target;
            }

            //  ignore targets we can't find, it's the same as having not
            //  met the conditional requirements since the monitor might be
            //  testing for existence as the condition to signal for
            if (TP.notValid(obj)) {
                continue;
            }

            try {
                if (test(obj)) {
                    TP.signal(obj, signal);
                }
            } catch (e) {
                TP.ifError() ?
                    TP.error('Couldn\'t process step function signal: ' +
                                    signal.getSignalName()) : 0;
            }
        }

        return;
    };

    //  NOTE that we don't need to bind the function, it has no this refs
    this.$set('stepFunction', retFunc);

    return retFunc;
});

//  ------------------------------------------------------------------------

TP.core.Monitor.Inst.defineMethod('removeTarget',
function(aTarget) {

    /**
     * @method removeTarget
     * @summary Removes a target from the list of objects to monitor.
     * @param {String|TP.uri.URI|Function} aTarget A target specification in
     *     one of a variety of forms: TP.uri.URI, string ID, or acquisition
     *     function (or an array of them).
     * @returns {TP.core.Monitor} The receiver.
     */

    var targets,
        len,
        i,
        target;

    if (TP.isArray(aTarget)) {
        targets = aTarget;
    } else {
        targets = TP.ac(aTarget);
    }

    len = targets.getSize();
    for (i = 0; i < len; i++) {
        target = targets.at(i);
        this.$get('targets').remove(target, TP.IDENTITY);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Job Configuration Methods
//  ------------------------------------------------------------------------

TP.core.Monitor.Inst.defineMethod('getControlParameters',
function(controlParameters) {

    /**
     * @method getControlParameters
     * @summary Returns a hash of control parameters for the receiver's
     *     underlying job instance. The return value is a merged copy of the
     *     receiving type's default parameters and any parameter information
     *     passed in.
     * @param {TP.core.Hash} controlParameters An optional set of parameters
     *     used during job creation.
     * @returns {TP.core.Hash} The control parameters for this monitor.
     */

    var params;

    params = this.getType().get('controlParameters').copy();
    params.atPut('lastInterval', this.getType().get('defaultInterval'));

    if (TP.isValid(controlParameters)) {
        params.addAll(controlParameters);
    }

    return params;
});

//  ------------------------------------------------------------------------

TP.core.Monitor.Inst.defineMethod('getJob',
function() {

    /**
     * @method getJob
     * @summary Returns the job instance used by this monitor.
     * @returns {TP.core.Job} The receiver's internal job instance.
     */

    return this.$get('job');
});

//  ------------------------------------------------------------------------

TP.core.Monitor.Inst.defineMethod('getStepParameters',
function(stepParameters) {

    /**
     * @method getStepParameters
     * @summary Returns a hash of step parameters for the receiver's underlying
     *     job instance. The return value is a merged copy of the receiving
     *     type's default parameters and any parameter information passed in.
     * @param {TP.core.Hash} stepParameters An optional set of parameters used
     *     to control job steps.
     * @returns {TP.core.Hash} The step parameters for this monitor.
     */

    var params;

    params = this.getType().get('stepParameters').copy();
    if (TP.isValid(stepParameters)) {
        params.addAll(stepParameters);
    }

    return params;
});

//  ------------------------------------------------------------------------
//  Job Control Methods
//  ------------------------------------------------------------------------

TP.core.Monitor.Inst.defineMethod('cancel',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method cancel
     * @summary Cancels the monitor, stopping all monitoring.
     * @param {String} aFaultString A string description of the cancellation.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the cancellation.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the cancellation.
     * @returns {TP.core.Monitor} The receiver.
     */

    this.cleanupResolvedTargets();

    this.getJob().cancel(aFaultString, aFaultCode, aFaultInfo);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Monitor.Inst.defineMethod('complete',
function(aResult) {

    /**
     * @method complete
     * @summary Completes (ends with success) the monitor, stopping it.
     * @param {Object} aResult An optional result object associated with the
     *     job.
     * @returns {TP.core.Monitor} The receiver.
     */

    this.cleanupResolvedTargets();

    this.getJob().complete(aResult);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Monitor.Inst.defineMethod('fail',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method fail
     * @summary Terminates the monitor, stopping all monitoring.
     * @param {String} aFaultString A string description of the fault.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the failure.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the failure.
     * @returns {TP.core.Monitor} The receiver.
     */

    this.cleanupResolvedTargets();

    this.getJob().fail(aFaultString, aFaultCode, aFaultInfo);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Monitor.Inst.defineMethod('start',
function(stepParameters) {

    /**
     * @method start
     * @summary Starts the monitor, causing it to begin monitoring its targets
     *     for monitor events.
     * @param {TP.core.Hash} stepParameters An optional set of parameters used
     *     to control job steps.
     * @returns {TP.core.Monitor} The receiver.
     */

    this.getJob().start(this.getStepParameters(stepParameters));

    return this;
});

//  ========================================================================
//  TP.core.DOMElementMonitor
//  ========================================================================

/**
 * @type {TP.core.DOMElementMonitor}
 * @summary A TP.core.Monitor subtype that monitors elements for a variety of
 *     changes which might be triggered via CSS shifts or other activity which
 *     won't normally trigger a native event.
 */

//  ------------------------------------------------------------------------

TP.core.Monitor.defineSubtype('DOMElementMonitor');

//  need a monitor of a specific subtype
TP.core.DOMElementMonitor.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  the monitor singleton instance that we're managing.
TP.core.DOMElementMonitor.Type.defineAttribute('$monitor');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.DOMElementMonitor.Type.defineMethod('addObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method addObserver
     * @summary Adds a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe() call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Object[]} anOrigin One or more origins to observe.
     * @param {Object|Object[]} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to add the observation, false otherwise.
     */

    var origins,
        signals,

        monitor,

        ourDefaultSignalName,

        len,
        i,
        signal,

        len2,
        j,

        obj;

    if (TP.notValid(anOrigin)) {
        return false;
    }

    if (!TP.isArray(anOrigin)) {
        origins = TP.ac(anOrigin);
    } else {
        origins = anOrigin;
    }

    if (TP.isArray(aSignal)) {
        signals = aSignal;
    } else if (TP.isString(aSignal)) {
        signals = aSignal.split(' ');
    } else if (TP.isType(aSignal)) {
        signals = TP.ac(aSignal);
    } else {
        this.raise('TP.sig.InvalidParameter',
                    'Improper signal definition.');

        return false;
    }

    //  Get the singleton instance that we manage for 'auto monitoring' when the
    //  consumer is using this through the signaling interface.
    monitor = this.get('$monitor');

    ourDefaultSignalName = this.getDefaultSignal().getSignalName();

    len = signals.getSize();

    for (i = 0; i < len; i++) {

        signal = signals.at(i).getSignalName();

        //  The only signals we're interested in are our own kind of signals
        if (signal !== ourDefaultSignalName) {
            continue;
        }

        len2 = origins.getSize();
        for (j = 0; j < len2; j++) {

            obj = origins.at(j);

            if (TP.isString(obj)) {
                obj = TP.sys.getObjectById(obj);
            }

            obj = TP.elem(TP.unwrap(obj));

            //  We didn't get an Element, even after resolving and unwrapping -
            //  that's a problem.
            if (!TP.isElement(obj)) {
                return this.raise('TP.sig.InvalidElement');
            }

            //  No valid singleton instance? Create one here and start here
            //  (supplying the target).
            if (TP.notValid(monitor)) {

                monitor = this.construct(obj);
                monitor.start();

                this.set('$monitor', monitor);
            } else {

                //  We already have a running singleton instance - just add the
                //  target.
                monitor.addTarget(obj);
            }
        }
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.core.DOMElementMonitor.Type.defineMethod('removeObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method removeObserver
     * @summary Removes a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Object[]} anOrigin One or more origins to ignore.
     * @param {Object|Object[]} aSignal One or more signals to ignore from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn off observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to remove the observation, false otherwise.
     */

    var origins,
        signals,

        monitor,

        ourDefaultSignalName,

        len,
        i,
        signal,

        len2,
        j,

        obj;

    if (TP.notValid(anOrigin)) {
        return false;
    }

    if (!TP.isArray(anOrigin)) {
        origins = TP.ac(anOrigin);
    } else {
        origins = anOrigin;
    }

    if (TP.isArray(aSignal)) {
        signals = aSignal;
    } else if (TP.isString(aSignal)) {
        signals = aSignal.split(' ');
    } else if (TP.isType(aSignal)) {
        signals = TP.ac(aSignal);
    } else {
        this.raise('TP.sig.InvalidParameter',
                    'Improper signal definition.');

        return false;
    }

    //  Get the singleton instance that we manage for 'auto monitoring' when the
    //  consumer is using this through the signaling interface.
    monitor = this.get('$monitor');

    //  No valid singleton instance? Exit here and return false to not have the
    //  main observation system unregister the observer - it won't be there.
    if (TP.notValid(monitor)) {
        return false;
    }

    ourDefaultSignalName = this.getDefaultSignal().getSignalName();

    len = signals.getSize();

    for (i = 0; i < len; i++) {

        signal = signals.at(i).getSignalName();

        //  The only signals we're interested in are our own kind of signals
        if (signal !== ourDefaultSignalName) {
            continue;
        }

        len2 = origins.getSize();
        for (j = 0; j < len2; j++) {

            obj = origins.at(j);

            if (TP.isString(obj)) {
                obj = TP.sys.getObjectById(obj);
            }

            obj = TP.elem(TP.unwrap(obj));

            //  We didn't get an Element, even after resolving and unwrapping -
            //  that's a problem.
            if (!TP.isElement(obj)) {
                return this.raise('TP.sig.InvalidElement');
            }

            //  Remove the Element from the singleton.
            monitor.removeTarget(obj);
        }
    }

    //  If there are no targets left in the monitor, we shut it down and
    //  set our instance attribute to null
    if (TP.isValid(monitor) && TP.isEmpty(monitor.get('targets'))) {
        monitor.complete();
        this.set('$monitor', null);
    }

    return true;
});

//  ========================================================================
//  TP.core.ResizeMonitor
//  ========================================================================

/**
 * @type {TP.core.ResizeMonitor}
 * @summary A TP.core.DOMElementMonitor subtype that monitors elements for size
 *     changes which might be triggered via CSS shifts or other activity which
 *     won't normally trigger a native event.
 */

//  ------------------------------------------------------------------------

TP.core.DOMElementMonitor.defineSubtype('ResizeMonitor');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.ResizeMonitor.Type.defineAttribute('defaultInterval', 50);
TP.core.ResizeMonitor.Type.defineAttribute('defaultSignal', 'TP.sig.DOMMonitoredResize');

TP.core.ResizeMonitor.Type.defineAttribute(
    'defaultTest',
    function(target) {

        var elem,

            oldHeight,
            oldWidth,

            newHeight,
            newWidth;

        elem = TP.elem(target);
        if (!TP.isElement(elem)) {
            return;
        }

        oldWidth = elem[TP.OLD_WIDTH];
        oldHeight = elem[TP.OLD_HEIGHT];

        //  NB: Since all we're interested in here is a *difference* in width
        //  and height, regular offsetWidth and offsetHeight are fine and are
        //  much faster than the more complete
        //  TP.elementGetWidth()/TP.elementGetHeight() calls.
        newHeight = elem.offsetHeight;
        newWidth = elem.offsetWidth;

        elem[TP.OLD_WIDTH] = newWidth;
        elem[TP.OLD_HEIGHT] = newHeight;

        //  don't signal the first time through
        if (TP.isEmpty(oldHeight)) {
            return false;
        }

        if (oldHeight !== newHeight || oldWidth !== newWidth) {
            return true;
        }

        return false;
    });

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.ResizeMonitor.Type.defineMethod('addObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method addObserver
     * @summary Adds a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe() call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @description This method is overridden on this type because the
     *     TP.sig.DOMMonitoredResize signal is a 'dual purpose' signal in that,
     *     if you observe a Window or Document for 'resized', you will use the
     *     native browser's machinery but if you observe an Element for 'resized',
     *     there is no native browser event for such a thing and so you will use
     *     a shared TP.core.Monitor to monitor the Element(s) for sizing
     *     changes.
     * @param {Object|Object[]} anOrigin One or more origins to observe.
     * @param {Object|Object[]} aSignal One or more signals to observe from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn on observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to add the observation, false otherwise.
     */

    var origin;

    //  Unwrap the supplied origin.
    origin = TP.unwrap(anOrigin);

    //  If its a String, it might be a GID, so try to resolve it.
    if (TP.isString(origin)) {
        origin = TP.sys.getObjectById(origin);
        origin = TP.unwrap(origin);
    }

    //  If it's a Window or Document, just return true to tell the signaling
    //  system to add the observation to the main notification engine.
    if (TP.isWindow(origin) || TP.isDocument(origin)) {
        return true;
    }

    //  Otherwise, it's probably an Element, so do what our supertype does (i.e.
    //  use the singleton Monitor to monitor the element, etc.)
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.ResizeMonitor.Type.defineMethod('removeObserver',
function(anOrigin, aSignal, aHandler, aPolicy) {

    /**
     * @method removeObserver
     * @summary Removes a local signal observation which is roughly like a DOM
     *     element adding an event listener. The observer is typically the
     *     handler provided to an observe call while the signal is a signal or
     *     string which the receiver is likely to signal or is intercepting for
     *     centralized processing purposes.
     * @param {Object|Object[]} anOrigin One or more origins to ignore.
     * @param {Object|Object[]} aSignal One or more signals to ignore from the
     *     origin(s).
     * @param {Function} aHandler The specific handler to turn off observations
     *     for.
     * @param {Function|String} aPolicy An observation policy, such as
     *     TP.CAPTURING or a specific function to manage the observe process.
     *     IGNORED.
     * @returns {Boolean} True if the observer wants the main notification
     *     engine to remove the observation, false otherwise.
     */

    var origin;

    //  Unwrap the supplied origin.
    origin = TP.unwrap(anOrigin);

    //  If its a String, it might be a GID, so try to resolve it.
    if (TP.isString(origin)) {
        origin = TP.sys.getObjectById(origin);
        origin = TP.unwrap(origin);
    }

    //  If it's a Window or Document, just return true to tell the signaling
    //  system to remove the observation from the main notification engine.
    if (TP.isWindow(origin) || TP.isDocument(origin)) {
        return true;
    }

    //  Otherwise, it's probably an Element, so do what our supertype does (i.e.
    //  remove the element from the singleton Monitor, etc.)
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.ResizeMonitor.Inst.defineMethod('cleanupResolvedTarget',
function(aTarget) {

    /**
     * @method cleanupResolvedTarget
     * @summary Cleans up any 'instance programmed' state that the monitor might
     *     have placed on the supplied resolved target.
     * @param {Object} aTarget The resolved target (i.e. the Object that was
     *     found by using a piece of targeting information) to clean up.
     * @returns {TP.core.ResizeMonitor} The receiver.
     */

    aTarget[TP.OLD_WIDTH] = null;
    aTarget[TP.OLD_HEIGHT] = null;

    return this;
});

//  ========================================================================
//  TP.core.RepositionMonitor
//  ========================================================================

/**
 * @type {TP.core.RepositionMonitor}
 * @summary A TP.core.DOMElementMonitor subtype that monitors elements for
 *     position changes which might be triggered via CSS shifts or other
 *     activity which won't normally trigger a native event.
 */

//  ------------------------------------------------------------------------

TP.core.DOMElementMonitor.defineSubtype('RepositionMonitor');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.RepositionMonitor.Type.defineAttribute('defaultInterval', 50);
TP.core.RepositionMonitor.Type.defineAttribute('defaultSignal',
                                                'TP.sig.DOMMonitoredReposition');

TP.core.RepositionMonitor.Type.defineAttribute(
    'defaultTest',
    function(target) {

        var elem,

            win,
            frameOffsetXAndY,

            oldTop,
            oldLeft,

            newTop,
            newLeft;

        elem = TP.elem(target);
        if (!TP.isElement(elem)) {
            return;
        }

        //  This monitor checks global position - if the target element's Window
        //  is not 'top', then we need to make sure to compute the offset.
        win = TP.nodeGetWindow(elem);
        if (win !== top) {
            frameOffsetXAndY = TP.windowComputeWindowOffsets(top, win);
        } else {
            frameOffsetXAndY = TP.ac(0, 0);
        }

        oldLeft = elem[TP.OLD_LEFT];
        oldTop = elem[TP.OLD_TOP];

        //  NB: Since all we're interested in here is a *difference* in left
        //  and/or top, regular offsetLeft and offsetTop are fine and are
        //  much faster than the more complete TP.elementGetBorderBox() calls.
        newLeft = elem.offsetLeft + frameOffsetXAndY.first();
        newTop = elem.offsetTop + frameOffsetXAndY.last();

        elem[TP.OLD_LEFT] = newLeft;
        elem[TP.OLD_TOP] = newTop;

        //  don't signal the first time through
        if (TP.isEmpty(oldTop)) {
            return false;
        }

        if (oldTop !== newTop || oldLeft !== newLeft) {
            return true;
        }

        return false;
    });

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.RepositionMonitor.Inst.defineMethod('cleanupResolvedTarget',
function(aTarget) {

    /**
     * @method cleanupResolvedTarget
     * @summary Cleans up any 'instance programmed' state that the monitor might
     *     have placed on the supplied resolved target.
     * @param {Object} aTarget The resolved target (i.e. the Object that was
     *     found by using a piece of targeting information) to clean up.
     * @returns {TP.core.RepositionMonitor} The receiver.
     */

    aTarget[TP.OLD_LEFT] = null;
    aTarget[TP.OLD_TOP] = null;

    return this;
});

//  ========================================================================
//  TAG PROCESSING SIGNALS
//  ========================================================================

TP.sig.Signal.defineSubtype('ProcessingComplete');

TP.sig.ProcessingComplete.defineSubtype('CompileComplete');
TP.sig.ProcessingComplete.defineSubtype('AttachComplete');
TP.sig.ProcessingComplete.defineSubtype('DetachComplete');

//  ========================================================================
//  MUTATION SIGNALS
//  ========================================================================

TP.sig.Signal.defineSubtype('MutationComplete');

TP.sig.MutationComplete.defineSubtype('MutationAttach');
TP.sig.MutationComplete.defineSubtype('MutationDetach');

TP.sig.MutationComplete.defineSubtype('MutationStyleChange');

TP.sig.MutationStyleChange.Type.defineAttribute('defaultPolicy',
                                                TP.INHERITANCE_FIRING);
TP.sig.MutationStyleChange.defineSubtype('MutationStyleRuleChange');
TP.sig.MutationStyleChange.defineSubtype('MutationStylePropertyChange');

TP.sig.Signal.defineSubtype('NodeWillRecast');
TP.sig.Signal.defineSubtype('NodeDidRecast');

//  ========================================================================
//  SYSTEM SIGNALS
//  ========================================================================

TP.sig.Signal.defineSubtype('RemoteResourceChanged');

TP.sig.Signal.defineSubtype('ScriptImported');

TP.sig.Signal.defineSubtype('TypeAdded');
TP.sig.Signal.defineSubtype('MethodAdded');

//  ========================================================================
//  CHANGE SIGNALS
//  ========================================================================

TP.sig.Change.defineSubtype('AttributeChange');

//  ========================================================================
//  BIND SIGNALS
//  ========================================================================

TP.sig.Signal.defineSubtype('BINDSignal');

TP.sig.BINDSignal.Type.defineAttribute('defaultPolicy', TP.BIND_FIRING);

TP.sig.BINDSignal.Type.defineAttribute('bubbling', true);
TP.sig.BINDSignal.Type.defineAttribute('cancelable', true);

TP.sig.BINDSignal.defineSubtype('BINDItemSignal');

TP.sig.BINDItemSignal.defineSubtype('SetContent');
TP.sig.BINDItemSignal.defineSubtype('ClearContent');

TP.sig.BINDItemSignal.defineSubtype('CloneItem');
TP.sig.BINDItemSignal.defineSubtype('InsertItem');
TP.sig.BINDItemSignal.defineSubtype('DeleteItem');

TP.sig.BINDSignal.defineSubtype('BINDSelectionSignal');

TP.sig.BINDSelectionSignal.defineSubtype('UpdateSelection');
TP.sig.BINDSelectionSignal.defineSubtype('DeleteSelection');

//  ========================================================================
//  RESPONDER SIGNALS
//  ========================================================================

TP.sig.Signal.defineSubtype('ResponderSignal');

TP.sig.ResponderSignal.Type.defineAttribute('defaultPolicy', TP.RESPONDER_FIRING);

//  ResponderSignals should traverse the controller chain...but not
//  ResponderSignal itself. NOTE that being a controller signal is inherited but
//  acting as the root is a LOCAL assignment so it's not inherited.
TP.sig.ResponderSignal.Type.isControllerSignal(true);
TP.sig.ResponderSignal.isControllerRoot(true);

TP.sig.ResponderSignal.Type.defineAttribute('bubbling', true);
TP.sig.ResponderSignal.Type.defineAttribute('cancelable', true);

//  ------------------------------------------------------------------------

TP.sig.ResponderSignal.Type.defineMethod('defineSubtype',
function() {

    /**
     * @method defineSubtype
     * @summary Creates a new subtype. This particular override ensures that all
     *     direct subtypes of TP.sig.ResponderSignal serve as signaling roots,
     *     meaning that you never signal a raw TP.sig.ResponderSignal.
     * @returns {TP.sig.Signal} A new signal-derived type object.
     */

    var type;

    type = this.callNextMethod();

    if (this === TP.sig.ResponderSignal) {
        type.isSignalingRoot(true);
    }

    return type;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.ResponderSignal.Inst.defineMethod('getDocument',
function() {

    /**
     * @method getDocument
     * @summary Returns the document from which the signal originated. For
     *     responder signals, this will be the document that it's trigger signal
     *     occurred in.
     * @returns {TP.dom.Document} The document that the signal originated in.
     */

    var trigger,
        evt,

        domSignal;

    //  Responder signals are *not* DOM signals, but if they've been triggered
    //  because of a DOM signal, they should have the low-level event in their
    //  payload.
    trigger = this.at('trigger');

    if (TP.isValid(trigger)) {
        evt = trigger.getEvent();
        if (TP.isEvent(evt)) {

            //  Wrap the event into a TIBET DOM signal of some type.
            domSignal = TP.wrap(evt);

            return domSignal.getDocument();
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sig.ResponderSignal.Inst.defineMethod('getDOMTarget',
function() {

    /**
     * @method getDOMTarget
     * @summary Returns the DOM target of the receiver. If the receiver was
     *     triggered because of a DOM signal, this method will return the *DOM*
     *     target of the signal.
     * @description When triggered via a DOM signal, Responder signals set their
     *     target to their origin so that responder chain semantics work
     *     properly. This method allows access to the original *DOM* target of
     *     the signal.
     * @returns {TP.dom.UIElementNode} The DOM target of the receiver.
     */

    var trigger,
        evt,

        domSignal;

    //  Responder signals are *not* DOM signals, but if they've been triggered
    //  because of a DOM signal, they should have the low-level event in their
    //  payload.
    trigger = this.at('trigger');

    if (TP.isValid(trigger)) {
        evt = trigger.getEvent();
        if (TP.isEvent(evt)) {

            //  Wrap the event into a TIBET DOM signal of some type.
            domSignal = TP.wrap(evt);

            return domSignal.getTarget();
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.sig.ResponderSignal.Inst.defineMethod('getResolvedDOMTarget',
function() {

    /**
     * @method getResolvedDOMTarget
     * @summary Returns the *resolved* DOM target of the receiver. If the
     *     receiver was triggered because of a DOM signal, this method will
     *     return the *resolved* *DOM* target of the signal. See DOM signals for
     *     more information on the difference between targets and resolved
     *     targets.
     * @description When triggered via a DOM signal, Responder signals set their
     *     target to their origin so that responder chain semantics work
     *     properly. This method allows access to the original *resolved* *DOM*
     *     target of the signal.
     * @returns {TP.dom.UIElementNode} The resolved DOM target of the receiver.
     */

    var evt,
        domSignal;

    //  Responder signals are *not* DOM signals, but if they've been triggered
    //  because of a DOM signal, they should have the low-level event in their
    //  payload.
    if (TP.isEvent(evt = this.at('trigger').getEvent())) {

        //  Wrap the event into a TIBET DOM signal of some type.
        domSignal = TP.wrap(evt);

        return domSignal.getResolvedTarget();
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.sig.Signal.Inst.defineMethod('getWindow',
function() {

    /**
     * @method getWindow
     * @summary Returns the window from which the signal originated. For
     *     responder signals, this will be the document that it's trigger signal
     *     occurred in.
     * @returns {TP.core.Window} The window object that the receiver occurred
     *     in.
     */

    var trigger,
        evt,

        domSignal;

    //  Responder signals are *not* DOM signals, but if they've been triggered
    //  because of a DOM signal, they should have the low-level event in their
    //  payload.
    trigger = this.at('trigger');

    if (TP.isValid(trigger)) {
        evt = trigger.getEvent();
        if (TP.isEvent(evt)) {

            //  Wrap the event into a TIBET DOM signal of some type.
            domSignal = TP.wrap(evt);

            return domSignal.getWindow();
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sig.ResponderSignal.Inst.defineMethod('shouldStop',
function(aFlag) {

    /**
     * @method shouldStop
     * @summary Returns true if the signal should stop propagating. If a flag
     *     is provided this flag is used to set the propagation status.
     * @description This method is overridden from its supertype to return true
     *     if *either the signal itself OR its trigger has been configured to
     *     stop propagating. Note that this method does not signal 'Change',
     *     even if it's 'shouldSignalChange' attribute is true.
     * @param {Boolean} aFlag Stop propagating: yes or no?
     * @returns {Boolean} True if the signal should stop propagation.
     */

    var trigger;

    //  if we're not cancelable this is a no-op
    if (!this.isCancelable()) {
        return false;
    }

    if (TP.isDefined(aFlag)) {
        this.$shouldStop = aFlag;
    }

    //  Responder signals are *not* DOM signals, but if they've been triggered
    //  because of a DOM signal, the trigger will be the DOM signal.
    trigger = this.at('trigger');

    if (TP.isValid(trigger)) {
        //  NB: Note here how we're only interested in the return value of the
        //  shouldStop of the trigger (which is why we don't pass the
        //  parameter).
        return this.$shouldStop || trigger.shouldStop();
    }

    return this.$shouldStop;
});

//  ------------------------------------------------------------------------

TP.sig.ResponderSignal.Inst.defineMethod('shouldStopImmediately',
function(aFlag) {

    /**
     * @method shouldStopImmediately
     * @summary Returns true if the signal should stop propagating immediately.
     *     If a flag is provided this flag is used to set the propagation state.
     * @description This method is overridden from its supertype to return true
     *     if *either the signal itself OR its trigger has been configured to
     *     stop propagating immediately. Note that this method does not signal
     *     'Change', even if it's 'shouldSignalChange' attribute is true.
     * @param {Boolean} aFlag Stop propagating immediately: yes or no?
     * @returns {Boolean} True if the signal should stop propagation
     *     immediately.
     */

    var trigger;

    //  if we're not cancelable this is a no-op
    if (!this.isCancelable()) {
        return false;
    }

    if (TP.isDefined(aFlag)) {
        this.$shouldStopImmediately = aFlag;
    }

    //  Responder signals are *not* DOM signals, but if they've been triggered
    //  because of a DOM signal, the trigger will be the DOM signal.
    trigger = this.at('trigger');

    if (TP.isValid(trigger)) {
        //  NB: Note here how we're only interested in the return value of the
        //  shouldStopImmediately of the trigger (which is why we don't pass the
        //  parameter).
        return this.$shouldStopImmediately || trigger.shouldStopImmediately();
    }

    return this.$shouldStopImmediately;
});

//  ------------------------------------------------------------------------
//  Responder Notification Signals
//  ------------------------------------------------------------------------

TP.sig.ResponderSignal.defineSubtype('ResponderNotificationSignal');

TP.sig.ResponderNotificationSignal.Type.defineAttribute('cancelable', false);

//  ------------------------------------------------------------------------

TP.sig.ResponderNotificationSignal.defineSubtype('UIDidActivate');
TP.sig.ResponderNotificationSignal.defineSubtype('UIDidDeactivate');
TP.sig.ResponderNotificationSignal.defineSubtype('UIDidAlert');
TP.sig.ResponderNotificationSignal.defineSubtype('UIDidBlur');
TP.sig.ResponderNotificationSignal.defineSubtype('UIDidBusy');
TP.sig.ResponderNotificationSignal.defineSubtype('UIDidClose');
TP.sig.ResponderNotificationSignal.defineSubtype('UIDidCollapse');
TP.sig.ResponderNotificationSignal.defineSubtype('UIDidDelete');
TP.sig.ResponderNotificationSignal.defineSubtype('UIDidDeselect');
TP.sig.ResponderNotificationSignal.defineSubtype('UIDidDuplicate');
TP.sig.ResponderNotificationSignal.defineSubtype('UIDidEndEffect');
TP.sig.ResponderNotificationSignal.defineSubtype('UIDidExpand');
TP.sig.ResponderNotificationSignal.defineSubtype('UIDidFocus');
TP.sig.ResponderNotificationSignal.defineSubtype('UIDidPopFocus');
TP.sig.ResponderNotificationSignal.defineSubtype('UIDidPushFocus');
TP.sig.ResponderNotificationSignal.defineSubtype('UIDidIdle');
TP.sig.ResponderNotificationSignal.defineSubtype('UIDidHelp');
TP.sig.ResponderNotificationSignal.defineSubtype('UIDidHide');
TP.sig.ResponderNotificationSignal.defineSubtype('UIDidHint');
TP.sig.ResponderNotificationSignal.defineSubtype('UIDidInsert');
TP.sig.ResponderNotificationSignal.defineSubtype('UIDidOpen');
TP.sig.ResponderNotificationSignal.defineSubtype('UIDidScroll');
TP.sig.ResponderNotificationSignal.defineSubtype('UIDidSelect');
TP.sig.ResponderNotificationSignal.defineSubtype('UIDidShow');

//  ------------------------------------------------------------------------
//  Responder Interaction Signals
//  ------------------------------------------------------------------------

TP.sig.ResponderSignal.defineSubtype('ResponderInteractionSignal');

//  These are interaction signals, since they're cancelable.
TP.sig.ResponderInteractionSignal.defineSubtype('UIActivate');
TP.sig.ResponderInteractionSignal.defineSubtype('UIDeactivate');

//  ------------------------------------------------------------------------
//  Responder Focus Interaction Signals
//  ------------------------------------------------------------------------

TP.sig.ResponderInteractionSignal.defineSubtype('UIFocusChange');

//  ------------------------------------------------------------------------

TP.sig.UIFocusChange.defineSubtype('UIBlur');
TP.sig.UIFocusChange.defineSubtype('UIFocus');
TP.sig.UIFocusChange.defineSubtype('UIFocusAndSelect');

//  ------------------------------------------------------------------------

TP.sig.ResponderInteractionSignal.defineSubtype('UIFocusComputation');

//  ------------------------------------------------------------------------

TP.sig.UIFocusComputation.defineSubtype('UIFocusFirst');
TP.sig.UIFocusFirst.Type.defineAttribute(
                        'moveAction', TP.FIRST);

TP.sig.UIFocusComputation.defineSubtype('UIFocusLast');
TP.sig.UIFocusLast.Type.defineAttribute(
                        'moveAction', TP.LAST);

TP.sig.UIFocusComputation.defineSubtype('UIFocusPrevious');
TP.sig.UIFocusPrevious.Type.defineAttribute(
                        'moveAction', TP.PREVIOUS);

TP.sig.UIFocusComputation.defineSubtype('UIFocusNext');
TP.sig.UIFocusNext.Type.defineAttribute(
                        'moveAction', TP.NEXT);

TP.sig.UIFocusComputation.defineSubtype('UIFocusFollowing');
TP.sig.UIFocusFollowing.Type.defineAttribute(
                        'moveAction', TP.FOLLOWING);

TP.sig.UIFocusComputation.defineSubtype('UIFocusPreceding');
TP.sig.UIFocusPreceding.Type.defineAttribute(
                        'moveAction', TP.PRECEDING);

TP.sig.UIFocusComputation.defineSubtype('UIFocusFirstInGroup');
TP.sig.UIFocusFirstInGroup.Type.defineAttribute(
                        'moveAction', TP.FIRST_IN_GROUP);

TP.sig.UIFocusComputation.defineSubtype('UIFocusLastInGroup');
TP.sig.UIFocusLastInGroup.Type.defineAttribute(
                        'moveAction', TP.LAST_IN_GROUP);

TP.sig.UIFocusComputation.defineSubtype('UIFocusFirstInNextGroup');
TP.sig.UIFocusFirstInNextGroup.Type.defineAttribute(
                        'moveAction', TP.FIRST_IN_NEXT_GROUP);

TP.sig.UIFocusComputation.defineSubtype('UIFocusFirstInPreviousGroup');
TP.sig.UIFocusFirstInPreviousGroup.Type.defineAttribute(
                        'moveAction', TP.FIRST_IN_PREVIOUS_GROUP);

//  ------------------------------------------------------------------------

TP.sig.ResponderInteractionSignal.defineSubtype('UIShow');
TP.sig.ResponderInteractionSignal.defineSubtype('UIHide');

TP.sig.ResponderInteractionSignal.defineSubtype('UIClose');
TP.sig.ResponderInteractionSignal.defineSubtype('UIOpen');

TP.sig.ResponderInteractionSignal.defineSubtype('UICollapse');
TP.sig.ResponderInteractionSignal.defineSubtype('UIExpand');

TP.sig.ResponderInteractionSignal.defineSubtype('UIBusy');
TP.sig.ResponderInteractionSignal.defineSubtype('UIIdle');

TP.sig.ResponderInteractionSignal.defineSubtype('UIAlert');
TP.sig.ResponderInteractionSignal.defineSubtype('UIHelp');     //  XForms
TP.sig.ResponderInteractionSignal.defineSubtype('UIHint');     //  XForms

TP.sig.ResponderInteractionSignal.defineSubtype('UIRefresh');  //  XForms

TP.sig.ResponderInteractionSignal.defineSubtype('UIEdit');

TP.sig.ResponderInteractionSignal.defineSubtype('UIToggle');

/*
TP.sig.ResponderInteractionSignal.defineSubtype('UIRevalidate');   //  XForms
TP.sig.ResponderInteractionSignal.defineSubtype('UIRecalculate');  //  XForms

TP.sig.ResponderInteractionSignal.defineSubtype('UIReset');   //  XForms
*/

//  ------------------------------------------------------------------------

TP.sig.ResponderInteractionSignal.defineSubtype('UIDataWillSend');

//  ------------------------------------------------------------------------

TP.sig.ResponderNotificationSignal.defineSubtype('UIDataSignal');

TP.sig.UIDataSignal.defineSubtype('UIDataReceived');
TP.sig.UIDataSignal.defineSubtype('UIDataFailed');
TP.sig.UIDataSignal.defineSubtype('UIDataSent');
TP.sig.UIDataSignal.defineSubtype('UIDataSerialize');

TP.sig.UIDataSignal.defineSubtype('UIDataConstruct');
TP.sig.UIDataSignal.defineSubtype('UIDataDestruct');

//  ------------------------------------------------------------------------

TP.sig.ResponderInteractionSignal.defineSubtype('UIValueChange');   //  XForms

TP.sig.ResponderInteractionSignal.defineSubtype('UISelect');        //  XForms
TP.sig.ResponderInteractionSignal.defineSubtype('UIDeselect');      //  XForms

TP.sig.ResponderInteractionSignal.defineSubtype('UIScroll');

TP.sig.ResponderInteractionSignal.defineSubtype('UIInsert');        //  XForms
TP.sig.ResponderInteractionSignal.defineSubtype('UIDelete');        //  XForms

TP.sig.ResponderInteractionSignal.defineSubtype('UIDuplicate');

TP.sig.ResponderInteractionSignal.defineSubtype('UIPageEnd');
TP.sig.ResponderInteractionSignal.defineSubtype('UIPageNext');
TP.sig.ResponderInteractionSignal.defineSubtype('UIPagePrevious');
TP.sig.ResponderInteractionSignal.defineSubtype('UIPageStart');

TP.sig.ResponderInteractionSignal.defineSubtype('UIPageSet');

//  ------------------------------------------------------------------------

TP.sig.ResponderInteractionSignal.defineSubtype('UIStateChange');

TP.sig.UIStateChange.defineSubtype('UIFocused');
TP.sig.UIStateChange.defineSubtype('UIBlurred');

TP.sig.UIStateChange.defineSubtype('UIValid');          //  XForms
TP.sig.UIStateChange.defineSubtype('UIInvalid');        //  XForms

TP.sig.UIStateChange.defineSubtype('UIReadonly');       //  XForms
TP.sig.UIStateChange.defineSubtype('UIReadwrite');      //  XForms

TP.sig.UIStateChange.defineSubtype('UIRequired');       //  XForms
TP.sig.UIStateChange.defineSubtype('UIOptional');       //  XForms

TP.sig.UIStateChange.defineSubtype('UIEnabled');        //  XForms
TP.sig.UIStateChange.defineSubtype('UIDisabled');       //  XForms

TP.sig.UIStateChange.defineSubtype('UIInRange');        //  XForms
TP.sig.UIStateChange.defineSubtype('UIOutOfRange');     //  XForms

//  ========================================================================
//  APP SIGNALS
//  ========================================================================

TP.sig.ResponderSignal.defineSubtype('ApplicationSignal');

TP.sig.ApplicationSignal.shouldUseSingleton(true);

TP.sig.ApplicationSignal.defineSubtype('AppWillInitialize');
TP.sig.ApplicationSignal.defineSubtype('AppInitialize');
TP.sig.ApplicationSignal.defineSubtype('AppDidInitialize');

TP.sig.ApplicationSignal.defineSubtype('AppWillStart');
TP.sig.ApplicationSignal.defineSubtype('AppStart');
TP.sig.ApplicationSignal.defineSubtype('AppDidStart');

TP.sig.ApplicationSignal.defineSubtype('AppStop');

TP.sig.ApplicationSignal.defineSubtype('AppWillShutdown');
TP.sig.AppWillShutdown.Type.defineAttribute('cancelable', true);

TP.sig.ApplicationSignal.defineSubtype('AppShutdown');

TP.sig.ApplicationSignal.defineSubtype('TargetIn');
TP.sig.ApplicationSignal.defineSubtype('TargetOut');

//  ========================================================================
//  DOM SIGNALS
//  ========================================================================

TP.sig.Signal.defineSubtype('DOMSignal');

TP.sig.DOMSignal.Type.defineAttribute('defaultPolicy', TP.DOM_FIRING);

TP.sig.DOMSignal.Type.defineAttribute('bubbling', true);
TP.sig.DOMSignal.Type.defineAttribute('cancelable', true);

//  ------------------------------------------------------------------------
//  DOM Initialization Signals
//  ------------------------------------------------------------------------

TP.sig.DOMSignal.defineSubtype('DOMInitializationSignal');

//  DOM initialization signals are *not* cancelable.
TP.sig.DOMInitializationSignal.Type.defineAttribute('cancelable', false);

//  ------------------------------------------------------------------------
//  DOM Content Signals
//  ------------------------------------------------------------------------

//  Fired when a DOM node is loaded - this might be an opaque element, like
//  an <object> element
TP.sig.DOMSignal.defineSubtype('DOMLoaded');

//  Fired when a DOM node is unloaded - this might be an opaque element, like
//  an <object> element
TP.sig.DOMSignal.defineSubtype('DOMUnloaded');

//  Fired when the content of a DOM node is loaded.
TP.sig.DOMLoaded.defineSubtype('DOMContentLoaded');

//  Fired when the content of a DOM node is unloaded.
TP.sig.DOMUnloaded.defineSubtype('DOMContentUnloaded');

//  ------------------------------------------------------------------------

//  Fired when a DOM node is ready - it's dynamic content has been loaded, other
//  dynamically loaded assets are realized, etc.
TP.sig.DOMSignal.defineSubtype('DOMReady');   //  XForms

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.DOMLoaded.Type.defineMethod('shouldLog',
function() {

    /**
     * @method shouldLog
     * @summary Returns true when the signal can be logged during signal
     *     processing. At this level, this method returns whether TIBET should
     *     be logging 'TP.sig.DOMLoaded' signals.
     * @returns {Boolean}
     */

    return TP.sys.shouldLogDOMLoadedSignals();
});

//  ------------------------------------------------------------------------
//  DOM Interaction Signals
//  ------------------------------------------------------------------------

TP.sig.DOMSignal.defineSubtype('DOMInteractionSignal');

TP.sig.DOMInteractionSignal.defineSubtype('DOMClose');

//  ------------------------------------------------------------------------
//  DOM Notification Signals
//  ------------------------------------------------------------------------

TP.sig.DOMSignal.defineSubtype('DOMNotificationSignal');

//  DOM notification signals are *not* cancelable.
TP.sig.DOMNotificationSignal.Type.defineAttribute('cancelable', false);

//  ------------------------------------------------------------------------
//  DOM EXCEPTIONS
//  ------------------------------------------------------------------------

TP.sig.ERROR.defineSubtype('DOMException');

TP.sig.DOMException.defineSubtype('ElementNotFound');

TP.sig.DOMException.defineSubtype('InvalidMarkup');
TP.sig.DOMException.defineSubtype('InvalidNode');
TP.sig.DOMException.defineSubtype('InvalidNodeList');
TP.sig.DOMException.defineSubtype('InvalidNamedNodeMap');

TP.sig.InvalidNode.defineSubtype('InvalidDocument');
TP.sig.InvalidNode.defineSubtype('InvalidXMLDocument');
TP.sig.InvalidNode.defineSubtype('InvalidAttributeNode');
TP.sig.InvalidNode.defineSubtype('InvalidElement');

TP.sig.DOMException.defineSubtype('SerializationException');
TP.sig.DOMException.defineSubtype('DOMParseException');

TP.sig.DOMException.defineSubtype('DOMComponentException');

TP.sig.DOMException.defineSubtype('InvalidStyleDeclaration');
TP.sig.DOMException.defineSubtype('InvalidStyleRule');
TP.sig.DOMException.defineSubtype('InvalidStyleSheet');

//  ------------------------------------------------------------------------
//  DOM Error Indication Signals
//  ------------------------------------------------------------------------

TP.sig.DOMNotificationSignal.defineSubtype('DOMErrorIndicationSignal');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.DOMErrorIndicationSignal.Inst.defineMethod('getLevel',
function() {

    /**
     * @method getLevel
     * @summary Returns the error level for the receiving signal.
     * @returns {Number}
     */

    return TP.ERROR;
});

//  ------------------------------------------------------------------------

TP.sig.DOMErrorIndicationSignal.defineSubtype('DOMOutputError');           //  XForms
TP.sig.DOMErrorIndicationSignal.defineSubtype('DOMSubmitError');           //  XForms

//  ------------------------------------------------------------------------

TP.sig.DOMErrorIndicationSignal.defineSubtype('DOMLinkException');     //  XForms
TP.sig.DOMErrorIndicationSignal.defineSubtype('DOMLinkError');         //  XForms
TP.sig.DOMErrorIndicationSignal.defineSubtype('DOMComputeException');      //  XForms

//  ------------------------------------------------------------------------
//  DOM Service Signals
//  ------------------------------------------------------------------------

TP.sig.DOMInteractionSignal.defineSubtype('DOMService');

TP.sig.DOMInteractionSignal.defineSubtype('DOMServiceRequestConstruct');
TP.sig.DOMInteractionSignal.defineSubtype('DOMServiceRequestConstructDone');

TP.sig.DOMInteractionSignal.defineSubtype('DOMServiceResponseConstruct');
TP.sig.DOMInteractionSignal.defineSubtype('DOMServiceResponseConstructDone');

TP.sig.DOMNotificationSignal.defineSubtype('DOMServiceTransmitDone');

TP.sig.DOMNotificationSignal.defineSubtype('DOMServiceDone');

TP.sig.DOMErrorIndicationSignal.defineSubtype('DOMServiceError');

//  ========================================================================
//  DOM UI signals
//  ========================================================================

/**
 * @type {TP.sig.DOMUISignal}
 * @summary TP.sig.DOMUISignal is the supertype for all DOM-related UI signals
 *     in the TIBET framework.
 * @description TP.sig.DOMUISignal and its subtypes handle UI signals thrown
 *     from pages and are basically types that map a browser's native events
 *     into TIBET signal types.
 *
 *     We do define TIBET signal mappings for some of the DOM Level 3 Events at
 *     the bottom of this file. These are used throughout TIBET in our quest for
 *     standards-compliance :-).
 *
 *     At the TP.sig.DOMUISignal level, all signals are configured to return
 *     'false' to the native event handler. Therefore, the following signals
 *     have the following behavior:
 *
 *     TP.sig.DOMClick: We don't want to perform the default behavior (esp.
 *     for Links, which would be to follow the link).
 *
 *     TP.sig.DOMContextMenu: We don't want the context menu to show.
 *
 *     TP.sig.DOMMouseDown: We don't want the mouse down's default action to
 *     happen.
 *
 *     TP.sig.DOMMouseUp: We don't want the mouse up's default action to happen.
 *
 *     TP.sig.DOMReset: In general, we don't reset FORMs this way in TIBET.
 *
 *     TP.sig.DOMSubmit: In general, we don't submit FORMs this way in TIBET.
 *
 *     The following signal types override that behavior and return 'true':
 *
 *     TP.sig.DOMKeySignal: All subtypes of the key signal want to perform their
 *     default behavior, which is to allow the key stroke.
 *
 *     TP.sig.DOMMouseOver: Don't show Link URLs in the status bar.
 *
 *     This parameter can always be set to a different value in the signal
 *     handlers themselves.
 */
//  ------------------------------------------------------------------------

TP.sig.DOMSignal.defineSubtype('DOMUISignal');

TP.sig.DOMUISignal.isSignalingRoot(true);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  Does this signal type require low-level arming for signal hooks.
TP.sig.DOMUISignal.Type.defineAttribute('needsArming', false);

//  The handler function installed when events of this type are armed
TP.sig.DOMUISignal.Type.defineAttribute('armingHandler',
                                    TP.$dispatchEventToTIBET);

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Type.defineMethod('arm',
function(anOrigin, aHandler, aPolicy, windowContext) {

    /**
     * @method arm
     * @summary Arms one or more origins to ensure they trigger signals of the
     *     receiver's type.
     * @param {Object|Object[]|String} anOrigin The origin or origins to arm.
     * @param {Function} aHandler An (optional) parameter that defines a native
     *     handler to be used instead of routing the event to TIBET.
     * @param {String|Function} aPolicy An (optional) parameter that defines the
     *     firing policy which should be used when firing.
     * @param {Window} windowContext An optional window to search for the
     *     element(s). If not provided then the TP.context() method is used to
     *     find one.
     * @returns {TP.meta.sig.DOMUISignal} The receiver.
     */

    var context,
        handler,
        policy;

    if (!this.requiresArming()) {
        return this;
    }

    context = windowContext;
    if (TP.notValid(context)) {
        context = TP.nodeGetWindow(anOrigin);
        if (TP.notValid(context)) {
            context = TP.sys.getUICanvas(true);
        }
    }

    if (TP.isDocument(context)) {
        context = TP.nodeGetWindow(context);
    }

    handler = aHandler;
    if (TP.notValid(handler)) {
        handler = this.get('armingHandler');
    }

    policy = aPolicy;
    if (TP.notValid(policy)) {
        policy = this.get('defaultPolicy');
    }

    TP.windowArmNode(context,
                        TP.byId(anOrigin, context, false),
                        this.getSignalName(),
                        handler,
                        policy);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Type.defineMethod('disarm',
function(anOrigin, aHandler, windowContext) {

    /**
     * @method disarm
     * @summary Disarms an origin so it no longer triggers events of the
     *     receiver's type. NOTE that this doesn't always work if there have
     *     been additional low-level listeners installed.
     * @param {Object|Object[]|String} anOrigin The origin or origins to disarm.
     * @param {Function} aHandler An (optional) parameter that defines a native
     *     handler to be used instead of routing the event to TIBET.
     * @param {Window} windowContext An optional window to search for the
     *     element(s). If not provided then the TP.context() method is used to
     *     find one.
     * @returns {TP.meta.sig.DOMUISignal} The receiver.
     */

    var context,
        handler;

    if (!this.requiresArming()) {
        return this;
    }

    context = windowContext;
    if (TP.notValid(context)) {
        context = TP.nodeGetWindow(anOrigin);
        if (TP.notValid(context)) {
            context = TP.sys.getUICanvas(true);
        }
    }


    if (TP.isDocument(context)) {
        context = TP.nodeGetWindow(context);
    }

    handler = aHandler;
    if (TP.notValid(handler)) {
        handler = this.get('armingHandler');
    }

    TP.windowDisarmNode(context,
                        TP.byId(anOrigin, context, false),
                        this.getSignalName(),
                        handler);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Type.defineMethod('requiresArming',
function(aFlag) {

    /**
     * @method requiresArming
     * @summary Combined setter/getter for the receiver's arming control flag.
     *     When a signal observation is made the signal is queried to determine
     *     if arming for the origin is required for that type of signal. Most
     *     signal types return false.
     * @param {Boolean} aFlag The new arming flag value.
     * @returns {Boolean} True if the receiving type requires arming of native
     *     nodes or other structures to actually receive events.
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('needsArming', aFlag);
    }

    return this.$get('needsArming');
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('init',
function(aPayload, noEvent) {

    /**
     * @method init
     * @summary Initialize the instance.
     * @description For a TP.sig.DOMUISignal the typical payload is a native
     *     event object or an array whose first item is the native event. You
     *     can also provide a TP.core.Hash as the payload and it will be treated
     *     as a container for the event properties normally associated with an
     *     Event.
     * @param {Object} aPayload A subtype-specific argument object.
     * @param {Boolean} noEvent True to skip event fabrication when there's no
     *     event provided. [False].
     * @returns {TP.sig.DOMUISignal} The receiver.
     */

    var obj;

    //  regardless of payload type this will store the event as our payload
    //  slot. Below we then reset that value (via setEvent()) to a
    //  'normalized' event object.
    this.callNextMethod();

    if (TP.isTrue(noEvent) && TP.notValid(aPayload)) {
        return this;
    }

    //  two cases are common for passing in an actual event, the payload or
    //  a payload whose first element is the event. in either case we want
    //  to normalize the event before we go any further
    if (TP.isEvent(aPayload)) {
        this.setEvent(TP.event(aPayload));
    } else if (TP.isArray(aPayload)) {
        obj = aPayload.first();
        if (TP.isEvent(obj)) {
            this.setEvent(TP.event(obj));
        }
    }

    //  if we don't have a native event its a little trickier since we want
    //  to allow TP.core.Hash input, or potentially native object input and
    //  we want to end up with an object that simulates all the event slots
    if (TP.notValid(this.getEvent())) {
        obj = this.$fabricateEvent(aPayload);
        this.setEvent(obj);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('copy',
function(deep, aFilterNameOrKeys, contentOnly) {

    /**
     * @method copy
     * @summary Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver.
     * @param {Boolean} [deep=false] True to force clones to be deep.
     * @param {String|String[]} aFilterNameOrKeys get*Interface() filter or key
     *     array.
     * @param {Boolean} [contentOnly=true] Copy content only?
     * @returns {TP.sig.DOMUISignal} A copy of the receiver.
     */

    var newinst;

    newinst = this.callNextMethod();

    //  Use the low-level 'copy()' method added to Event.prototype
    newinst.event = this.getEvent().copy();

    return newinst;
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('$fabricateEvent',
function(aPayload) {

    /**
     * @method $fabricateEvent
     * @summary Constructs a normalized event object suitable for the payload
     *     provided. This is typically only invoked via the init function and
     *     only when a native Event isn't provided.
     * @param {Object} aPayload The signal's payload object.
     * @returns {Event|Object} A native Event or Object with Event slots.
     */

    var hash;

    hash = TP.isHash(aPayload) ? aPayload : TP.hc();
    hash.addIfAbsent(
            'target', null,
            'currentTarget', null,
            'relatedTarget', null,

            'type', this.getType().NATIVE_NAME,

            'timeStamp', (new Date()).getTime(),

            'clientX', 0,
            'clientY', 0,
            'offsetX', 0,
            'offsetY', 0,

            'view', null,

            'pageX', 0,
            'pageY', 0,
            'screenX', 0,
            'screenY', 0,

            'keyCode', 0,

            'altKey', false,
            'ctrlKey', false,
            'shiftKey', false,

            'metaKey', false,

            'button', 0,

            'wheelDelta', 0,

            //  Specific to Mozilla/Webkit
            'charCode', 0,

            //  Specific to Mozilla
            'which', null,

            //  Specific to IE
            'returnValue', false,
            'cancelBubble', false
            );


    //  either we can create a native event or we'll use the hash itself and
    //  hope it has the right keys :)
    return TP.documentConstructEvent(null, hash) || hash;
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('getAltKey',
function() {

    /**
     * @method getAltKey
     * @summary Returns the alt key setting at the time of the event.
     * @returns {Boolean} Returns true if the alt key was pressed, false if it
     *     wasn't.
     */

    return TP.eventGetAltKey(this.getEvent());
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('getCtrlKey',
function() {

    /**
     * @method getCtrlKey
     * @summary Returns the ctrl key setting at the time of the event.
     * @returns {Boolean} Returns true if the ctrl key was pressed, false if it
     *     wasn't.
     */

    return TP.eventGetCtrlKey(this.getEvent());
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('getMetaKey',
function() {

    /**
     * @method getMetaKey
     * @summary Returns the meta key setting at the time of the event.
     * @description Internet Explorer does not support a 'meta key' setting,
     *     therefore this method will always return false in that browser.
     * @returns {Boolean} Returns true if the meta key was pressed, false if it
     *     wasn't.
     */

    return TP.eventGetMetaKey(this.getEvent());
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('getShiftKey',
function() {

    /**
     * @method getShiftKey
     * @summary Returns the shift key setting at the time of the event.
     * @returns {Boolean} Returns true if the shift key was pressed, false if it
     *     wasn't.
     */

    return TP.eventGetShiftKey(this.getEvent());
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('getEvent',
function() {

    /**
     * @method getEvent
     * @summary Returns the event object containing event information for this
     *     signal.
     * @returns {Object} The event object for this signal.
     */

    return this.getPayload();
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('getEventType',
function() {

    /**
     * @method getEventType
     * @summary Returns the event type of the native event.
     * @returns {String} The event type.
     */

    return TP.eventGetType(this.getEvent());
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('getNativeObject',
function() {

    /**
     * @method getNativeObject
     * @summary Returns the native object that the receiver is wrapping. In the
     *     case of TP.sig.DOMUISignals, this is the receiver's native Event
     *     object that it contains
     * @returns {Event} The receiver's native Event object.
     */

    return this.getEvent();
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('getResolvedTarget',
function() {

    /**
     * @method getResolvedTarget
     * @summary Returns the 'resolved target', the element that was resolved
     *     using the 'resolvedTarget' getter instrumented onto Event.prototype
     *     in the hook file. That getter method uses TP.eventResolveTarget().
     *     See that method for more information.
     * @returns {Element} The 'resolved target' of the signal.
     */

    return TP.eventGetResolvedTarget(this.getEvent());
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('getTarget',
function() {

    /**
     * @method getTarget
     * @summary Returns the target of the receiver's event.
     * @returns {Node} The target of event/signal.
     */

    return TP.eventGetTarget(this.getEvent());
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('getTime',
function() {

    /**
     * @method getTime
     * @summary Returns the time that the signal/event was fired.
     * @returns {Number} The time that the signal/event was fired.
     */

    var firingTime;

    //  If a firing time isn't in the signal itself (usually, for non-GUI
    //  signals, this is set when the signal is fired), then use the firing time
    //  encoded in the underlying native Event object.
    if (!TP.isNumber(firingTime = this.$get('time'))) {
        firingTime = TP.eventGetTime(this.getEvent());
    }

    return firingTime;
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('getWindow',
function() {

    /**
     * @method getWindow
     * @summary Returns the window object that the native event occurred in.
     * @returns {TP.core.Window} The window containing the source element that
     *     generated the event.
     */

    return TP.tpwin(TP.eventGetWindow(this.getEvent()));
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('setEvent',
function(normalizedEvent) {

    /**
     * @method setEvent
     * @summary Sets the native event which this signal instance represents.
     * @param {Event} normalizedEvent The native event containing the signal's
     *     raw data.
     * @returns {TP.sig.DOMUISignal} The receiver.
     */

    this.setPayload(normalizedEvent);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('shouldPrevent',
function(aFlag) {

    /**
     * @method shouldPrevent
     * @summary Returns true if the signal handler(s) should not perform the
     *     default action. If a flag is provided this flag is used to set the
     *     prevent status.
     * @param {Boolean} aFlag Whether or not the signal should perform the
     *     default action.
     * @returns {Boolean} Whether or not this signal is going to prevent the
     *     default action from happening.
     */

    var retValue,
        evt;

    retValue = this.callNextMethod();

    if (TP.isEvent(evt = this.getEvent())) {
        if (TP.isTrue(aFlag)) {
            //  The hook file patches all native events to support this
            //  call. Note that we put this in an empty try...catch. Some native
            //  events don't like to have preventDefault called on them.
            try {
                evt.preventDefault();
            } catch (e) {
                //  Empty
            }
        }
    }

    return retValue;
});

//  ------------------------------------------------------------------------
//  COMMON SUBTYPES
//  ------------------------------------------------------------------------

//  ========================================================================
//  DOM Level 0 Event Signals
//  ========================================================================

TP.sig.DOMUISignal.defineSubtype('DOMAbort');
TP.sig.DOMAbort.Type.defineConstant('NATIVE_NAME', 'abort');

//  ---

TP.sig.DOMUISignal.defineSubtype('DOMAnimationEnd');
TP.sig.DOMAnimationEnd.Type.defineConstant('NATIVE_NAME', 'animationend');

//  ---

TP.sig.DOMUISignal.defineSubtype('DOMBlur');
TP.sig.DOMBlur.Type.defineConstant('NATIVE_NAME', 'blur');

//  DOMBlur signals are *not* cancelable.
TP.sig.DOMBlur.Type.defineAttribute('cancelable', false);

TP.sig.DOMBlur.Type.defineMethod('shouldLog',
function() {

    /**
     * @method shouldLog
     * @summary Returns true when the signal can be logged during signal
     *     processing. At this level, this method returns whether TIBET should
     *     be logging 'TP.sig.DOMFocus' signals.
     * @returns {Boolean}
     */

    return TP.sys.shouldLogDOMFocusSignals();
});

//  ---

TP.sig.DOMUISignal.defineSubtype('DOMChange');
TP.sig.DOMChange.Type.defineConstant('NATIVE_NAME', 'change');

//  ---

TP.sig.DOMUISignal.defineSubtype('DOMCopy');
TP.sig.DOMCopy.Type.defineConstant('NATIVE_NAME', 'copy');

//  ---

TP.sig.DOMUISignal.defineSubtype('DOMCut');
TP.sig.DOMCut.Type.defineConstant('NATIVE_NAME', 'cut');

//  ---

TP.sig.DOMUISignal.defineSubtype('DOMError');
TP.sig.DOMError.Type.defineConstant('NATIVE_NAME', 'error');

//  ---

TP.sig.DOMUISignal.defineSubtype('DOMFocus');
TP.sig.DOMFocus.Type.defineConstant('NATIVE_NAME', 'focus');

//  DOMFocus signals are *not* cancelable.
TP.sig.DOMFocus.Type.defineAttribute('cancelable', false);

TP.sig.DOMFocus.Type.defineMethod('shouldLog',
function() {

    /**
     * @method shouldLog
     * @summary Returns true when the signal can be logged during signal
     *     processing. At this level, this method returns whether TIBET should
     *     be logging 'TP.sig.DOMFocus' signals.
     * @returns {Boolean}
     */

    return TP.sys.shouldLogDOMFocusSignals();
});

//  ---

TP.sig.DOMUISignal.defineSubtype('DOMLoad');
TP.sig.DOMLoad.Type.defineConstant('NATIVE_NAME', 'load');

//  ---

TP.sig.DOMUISignal.defineSubtype('DOMMove');
TP.sig.DOMMove.Type.defineConstant('NATIVE_NAME', 'move');

//  ---

TP.sig.DOMUISignal.defineSubtype('DOMPaste');
TP.sig.DOMPaste.Type.defineConstant('NATIVE_NAME', 'paste');

//  ---

TP.sig.DOMUISignal.defineSubtype('DOMReset');
TP.sig.DOMReset.Type.defineConstant('NATIVE_NAME', 'reset');

//  ---

TP.sig.DOMUISignal.defineSubtype('DOMMonitoredResize');
TP.sig.DOMMonitoredResize.Type.defineConstant('NATIVE_NAME', 'resize');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.DOMMonitoredResize.Type.defineMethod('getSignalOwner',
function() {

    /**
     * @method getSignalOwner
     * @summary Returns the Object or Type responsible for signals of this
     *     type.
     * @returns {Object|TP.lang.RootObject} The signal type's owner.
     */

    return TP.core.ResizeMonitor;
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.defineSubtype('DOMResize');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.DOMResize.Type.defineMethod('getSignalOwner',
function() {

    /**
     * @method getSignalOwner
     * @summary Returns the Object or Type responsible for signals of this
     *     type.
     * @returns {Object|TP.lang.RootObject} The signal type's owner.
     */

    return TP.sig.ResizeSignalSource;
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.defineSubtype('DOMVisibility');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.DOMVisibility.Type.defineMethod('getSignalOwner',
function() {

    /**
     * @method getSignalOwner
     * @summary Returns the Object or Type responsible for signals of this
     *     type.
     * @returns {Object|TP.lang.RootObject} The signal type's owner.
     */

    return TP.sig.VisibilitySignalSource;
});

//  ---

TP.sig.DOMVisibility.defineSubtype('DOMVisible');
TP.sig.DOMVisibility.defineSubtype('DOMHidden');

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.defineSubtype('DOMScroll');
TP.sig.DOMScroll.Type.defineConstant('NATIVE_NAME', 'scroll');

//  ---

TP.sig.DOMUISignal.defineSubtype('DOMSubmit');
TP.sig.DOMSubmit.Type.defineConstant('NATIVE_NAME', 'submit');

//  ---

TP.sig.DOMUISignal.defineSubtype('DOMTransitionEnd');
TP.sig.DOMTransitionEnd.Type.defineConstant('NATIVE_NAME', 'transitionend');

//  ---

TP.sig.DOMUISignal.defineSubtype('DOMUnload');
TP.sig.DOMUnload.Type.defineConstant('NATIVE_NAME', 'unload');

//  ========================================================================
//  DOM REPOSITION SIGNAL
//  ========================================================================

TP.sig.DOMUISignal.defineSubtype('DOMMonitoredReposition');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.DOMMonitoredReposition.Type.defineMethod('getSignalOwner',
function() {

    /**
     * @method getSignalOwner
     * @summary Returns the Object or Type responsible for signals of this
     *     type.
     * @returns {Object|TP.lang.RootObject} The signal type's owner.
     */

    return TP.core.RepositionMonitor;
});

//  ========================================================================
//  DOM Level 3 Event Signals
//  ========================================================================

//  This isn't the (now deprecated) DOMFocusIn taken from the XForms spec -
//  this is the TIBET signal wrapper for the (new) 'focusin' event as
//  spec'ed in DOM Level 3.
TP.sig.DOMUISignal.defineSubtype('DOMFocusIn');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.sig.DOMFocusIn.Type.defineConstant('NATIVE_NAME', 'focusin');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.DOMFocusIn.Type.defineMethod('shouldLog',
function() {

    /**
     * @method shouldLog
     * @summary Returns true when the signal can be logged during signal
     *     processing. At this level, this method returns whether TIBET should
     *     be logging 'TP.sig.DOMFocus' signals.
     * @returns {Boolean}
     */

    return TP.sys.shouldLogDOMFocusSignals();
});

//  ------------------------------------------------------------------------

//  This isn't the (now deprecated) DOMFocusOut taken from the XForms spec -
//  this is the TIBET signal wrapper for the (new) 'focusout' event as
//  spec'ed in DOM Level 3.
TP.sig.DOMUISignal.defineSubtype('DOMFocusOut');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.sig.DOMFocusOut.Type.defineConstant('NATIVE_NAME', 'focusout');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.DOMFocusOut.Type.defineMethod('shouldLog',
function() {

    /**
     * @method shouldLog
     * @summary Returns true when the signal can be logged during signal
     *     processing. At this level, this method returns whether TIBET should
     *     be logging 'TP.sig.DOMFocus' signals.
     * @returns {Boolean}
     */

    return TP.sys.shouldLogDOMFocusSignals();
});

//  ------------------------------------------------------------------------

//  This is the TIBET signal wrapper for the (new) 'input' event as spec'ed in
//  DOM Level 3.
TP.sig.DOMUISignal.defineSubtype('DOMInput');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.sig.DOMInput.Type.defineConstant('NATIVE_NAME', 'input');

//  ========================================================================
//  DOM MOUSE SIGNALS
//  ========================================================================

TP.sig.DOMUISignal.defineSubtype('DOMMouseSignal');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.DOMMouseSignal.Type.defineMethod('getSignalOwner',
function() {

    /**
     * @method getSignalOwner
     * @summary Returns the Object or Type responsible for signals of this
     *     type.
     * @returns {Object|TP.lang.RootObject} The signal type's owner.
     */

    return TP.sys.getTypeByName('TP.core.Mouse');
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.DOMMouseSignal.Inst.defineMethod('getButton',
function() {

    /**
     * @method getButton
     * @summary Returns a TIBET constant signifying which mouse button was
     *     pressed in the native event that generated this signal.
     * @returns {String} The TIBET constant signifying which button was pressed.
     *     This can be TP.LEFT, TP.MIDDLE, TP.RIGHT.
     */

    return TP.eventGetButton(this.getEvent());
});

//  ------------------------------------------------------------------------

TP.sig.DOMMouseSignal.Inst.defineMethod('getClientX',
function() {

    /**
     * @method getClientX
     * @summary Returns the X coordinate of the signal relative to the window
     *     containing the source element.
     * @returns {Number} The X coordinate of the signal relative to its window.
     */

    var evt;

    evt = this.getEvent();

    return TP.ifInvalid(evt.$$clientX, evt.clientX);
});

//  ------------------------------------------------------------------------

TP.sig.DOMMouseSignal.Inst.defineMethod('getClientY',
function() {

    /**
     * @method getClientY
     * @summary Returns the Y coordinate of the signal relative to the window
     *     containing the source element.
     * @returns {Number} The Y coordinate of the signal relative to its window.
     */

    var evt;

    evt = this.getEvent();

    return TP.ifInvalid(evt.$$clientY, evt.clientY);
});

//  ------------------------------------------------------------------------

TP.sig.DOMMouseSignal.Inst.defineMethod('getClientPoint',
function() {

    /**
     * @method getClientPoint
     * @summary Returns the X/Y TP.gui.Point of the signal relative to the
     *     window containing the source element.
     * @returns {TP.gui.Point} The X/Y point of the signal relative to its
     *     window.
     */

    var evt,
        point;

    evt = this.getEvent();

    if (TP.notValid(point = evt.$$clientPt)) {
        point = TP.pc(this.getClientX(), this.getClientY());
        evt.$$clientPt = point;
    }

    return point;
});

//  ------------------------------------------------------------------------

TP.sig.DOMMouseSignal.Inst.defineMethod('getElementAtPagePoint',
function() {

    /**
     * @method getElementAtPagePoint
     * @summary Returns the element currently under the receiver's 'page point'.
     * @description On occasion, events will be dispatched between nested
     *     iframes from the 'most nested' iframe - not taking into account the
     *     nesting even when the mouse is not 'over' the most nested iframe.
     *     This method allows the caller to consistently compute the element
     *     that the mouse is over, no matter which iframe it is hosted in.
     * @returns {Element|null} The element at the receiver's page point.
     */

    var targetDoc,
        targetWin,

        pageX,
        pageY,

        computedTargetElem,

        frameElementWin,

        frameOffsetXAndY;

    targetDoc = this.getDocument().getNativeNode();
    targetWin = TP.nodeGetWindow(targetDoc);

    pageX = this.at('pageX');
    pageY = this.at('pageY');

    //  Try to get the element from the original target document. This very well
    //  may be hosted in the 'most nested iframe'.
    computedTargetElem = targetDoc.elementFromPoint(pageX, pageY);

    frameElementWin = targetWin;

    //  If we couldn't compute a target element, we iterate up through any
    //  nested frames to try to compute one from the parent frames.
    while (!TP.isElement(computedTargetElem)) {

        //  If the current frame element window is not an iframe window, then we
        //  must have reached 'top' without being able to compute a proper
        //  element. Just return null.
        if (!TP.isIFrameWindow(frameElementWin)) {
            return null;
        }

        //  Reset the current frame element window by obtaining the window of
        //  the frame element's window. This will be its 'parent window'.
        frameElementWin = TP.nodeGetWindow(frameElementWin.frameElement);

        //  We need to offset the pageX/pageY from the original target window to
        //  the frame window that we're currently processing.
        frameOffsetXAndY = TP.windowComputeWindowOffsets(
                            frameElementWin,
                            targetWin,
                            false);
        pageX += frameOffsetXAndY.first();
        pageY += frameOffsetXAndY.last();

        //  Try to compute a target element using the new current frame element
        //  window and translated coordinates.
        computedTargetElem =
            frameElementWin.document.elementFromPoint(pageX, pageY);
    }

    return computedTargetElem;
});

//  ------------------------------------------------------------------------

TP.sig.DOMMouseSignal.Inst.defineMethod('getGlobalX',
function(wantsTransformed) {

    /**
     * @method getGlobalX
     * @summary Returns the X coordinate of the signal relative to its overall
     *     *top level* window.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @returns {Number} The X coordinate of the signal relative to its overall
     *     top level window.
     */

    var globalPoint;

    if (TP.isValid(globalPoint = this.getGlobalPoint())) {
        return globalPoint.getX();
    }

    return -1;
});

//  ------------------------------------------------------------------------

TP.sig.DOMMouseSignal.Inst.defineMethod('getGlobalY',
function(wantsTransformed) {

    /**
     * @method getGlobalY
     * @summary Returns the Y coordinate of the signal relative to its overall
     *     *top level* window.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @returns {Number} The Y coordinate of the signal relative to its overall
     *     top level window.
     */

    var globalPoint;

    if (TP.isValid(globalPoint = this.getGlobalPoint())) {
        return globalPoint.getY();
    }

    return -1;
});

//  ------------------------------------------------------------------------

TP.sig.DOMMouseSignal.Inst.defineMethod('getGlobalPoint',
function(wantsTransformed) {

    /**
     * @method getGlobalPoint
     * @summary Returns the X/Y TP.gui.Point of the signal as a global
     *     position. The global position is the signal's mouse position
     *     relative to its overall *top level* window.
     * @param {Boolean} wantsTransformed An optional parameter that determines
     *     whether to return 'transformed' values if the element has been
     *     transformed with a CSS transformation. The default is false.
     * @returns {TP.gui.Point} The X/Y point of the signal relative to its
     *     overall top level window.
     */

    var evt,
        point,

        evtWin,

        winFrameElem,

        eventOffsetXAndY;

    evt = this.getEvent();

    if (TP.isValid(point = evt.$$globalPt)) {
        return point;
    }

    evtWin = TP.eventGetWindow(this.getEvent());

    if (TP.isElement(winFrameElem = evtWin.frameElement)) {
        //  Note here that we pass 'top' as the first argument since we
        //  really just want the offset of winFrameElem from the top (which
        //  will be 0,0 offset from itself).
        eventOffsetXAndY = TP.windowComputeWindowOffsets(
                            top,
                            TP.elementGetIFrameWindow(winFrameElem),
                            wantsTransformed);
    } else {
        eventOffsetXAndY = TP.ac(0, 0);
    }

    point = TP.pc(this.getPageX() + eventOffsetXAndY.first(),
                    this.getPageY() + eventOffsetXAndY.last());

    evt.$$globalPt = point;

    return point;
});

//  ------------------------------------------------------------------------

TP.sig.DOMMouseSignal.Inst.defineMethod('getOffsetX',
function() {

    /**
     * @method getOffsetX
     * @summary Returns the X coordinate of the signal relative to the
     *     containing source element.
     * @returns {Number} The X coordinate of the signal relative to its
     *     containing element.
     */

    var evt;

    evt = this.getEvent();

    return TP.ifInvalid(evt.$$offsetX, evt.offsetX);
});

//  ------------------------------------------------------------------------

TP.sig.DOMMouseSignal.Inst.defineMethod('getOffsetY',
function() {

    /**
     * @method getOffsetY
     * @summary Returns the Y coordinate of the signal relative to the
     *     containing source element.
     * @returns {Number} The Y coordinate of the signal relative to its
     *     containing element.
     */

    var evt;

    evt = this.getEvent();

    return TP.ifInvalid(evt.$$offsetY, evt.offsetY);
});

//  ------------------------------------------------------------------------

TP.sig.DOMMouseSignal.Inst.defineMethod('getOffsetPoint',
function() {

    /**
     * @method getOffsetPoint
     * @summary Returns the X/Y TP.gui.Point of the signal relative to the
     *     containing source element.
     * @returns {TP.gui.Point} The X/Y point of the signal relative to its
     *     containing element.
     */

    var evt,
        point;

    evt = this.getEvent();

    if (TP.notValid(point = evt.$$offsetPt)) {
        point = TP.pc(this.getOffsetX(), this.getOffsetY());
        evt.$$offsetPt = point;
    }

    return point;
});

//  ------------------------------------------------------------------------

TP.sig.DOMMouseSignal.Inst.defineMethod('getPageX',
function() {

    /**
     * @method getPageX
     * @summary Returns the X coordinate of the signal relative to the page
     *     containing the source element.
     * @returns {Number} The X coordinate of the signal relative to the overall
     *     page.
     */

    var evt;

    evt = this.getEvent();

    return TP.ifInvalid(evt.$$pageX, evt.pageX);
});

//  ------------------------------------------------------------------------

TP.sig.DOMMouseSignal.Inst.defineMethod('getPageY',
function() {

    /**
     * @method getPageY
     * @summary Returns the Y coordinate of the signal relative to the page
     *     containing the source element.
     * @returns {Number} The Y coordinate of the signal relative to the overall
     *     page.
     */

    var evt;

    evt = this.getEvent();

    return TP.ifInvalid(evt.$$pageY, evt.pageY);
});

//  ------------------------------------------------------------------------

TP.sig.DOMMouseSignal.Inst.defineMethod('getPagePoint',
function() {

    /**
     * @method getPagePoint
     * @summary Returns the X/Y TP.gui.Point of the signal relative to the
     *     page containing the source element.
     * @returns {TP.gui.Point} The X/Y point of the signal relative to its
     *     overall page.
     */

    var evt,
        point;

    evt = this.getEvent();

    if (TP.notValid(point = evt.$$pagePt)) {
        point = TP.pc(this.getPageX(), this.getPageY());
        evt.$$pagePt = point;
    }

    return point;
});

//  ------------------------------------------------------------------------

TP.sig.DOMMouseSignal.Inst.defineMethod('getScreenX',
function() {

    /**
     * @method getScreenX
     * @summary Returns the X coordinate of the signal relative to the video
     *     screen.
     * @returns {Number} The X coordinate of the signal relative to the video
     *     screen.
     */

    var evt;

    evt = this.getEvent();

    return TP.ifInvalid(evt.$$screenX, evt.screenX);
});

//  ------------------------------------------------------------------------

TP.sig.DOMMouseSignal.Inst.defineMethod('getScreenY',
function() {

    /**
     * @method getScreenY
     * @summary Returns the Y coordinate of the signal relative to the video
     *     screen.
     * @returns {Number} The Y coordinate of the signal relative to the video
     *     screen.
     */

    var evt;

    evt = this.getEvent();

    return TP.ifInvalid(evt.$$screenY, evt.screenY);
});

//  ------------------------------------------------------------------------

TP.sig.DOMMouseSignal.Inst.defineMethod('getScreenPoint',
function() {

    /**
     * @method getScreenPoint
     * @summary Returns the X/Y TP.gui.Point of the signal relative to the
     *     video screen
     * @returns {TP.gui.Point} The X/Y point of the signal relative to its
     *     video screen.
     */

    var evt,
        point;

    evt = this.getEvent();

    if (TP.notValid(point = evt.$$screenPt)) {
        point = TP.pc(this.getScreenX(), this.getScreenY());
        evt.$$screenPt = point;
    }

    return point;
});

//  ------------------------------------------------------------------------

TP.sig.DOMMouseSignal.Inst.defineMethod('getTransformedPoint',
function() {

    /**
     * @method getTransformedPoint
     * @summary Returns the X/Y TP.gui.Point of the signal relative to the
     *     target element while taking into account any CSS transformations to
     *     that element.
     * @returns {TP.gui.Point} The X/Y point of the signal relative to its
     *     target element, including any CSS transformations.
     */

    var evt,
        point;

    evt = this.getEvent();

    if (TP.notValid(point = evt.$$transPt)) {
        point = TP.pc(TP.elementGlobalToLocalXY(TP.eventGetTarget(evt),
                                                 evt.pageX,
                                                 evt.pageY));
        evt.$$transPt = point;
    }

    return point;
});

//  ------------------------------------------------------------------------
//  COMMON SUBTYPES
//  ------------------------------------------------------------------------

//  ========================================================================
//  TP.sig.DOMMouseDown
//  ========================================================================

TP.sig.DOMMouseSignal.defineSubtype('DOMMouseDown');
TP.sig.DOMMouseDown.Type.defineConstant('NATIVE_NAME', 'mousedown');

//  ========================================================================
//  TP.sig.DOMMouseEnter
//  ========================================================================

TP.sig.DOMMouseSignal.defineSubtype('DOMMouseEnter');
TP.sig.DOMMouseEnter.Type.defineConstant('NATIVE_NAME', 'mouseenter');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.DOMMouseEnter.Inst.defineMethod('getRelatedTarget',
function() {

    /**
     * @method getRelatedTarget
     * @summary Returns the related target, the element the mouse is over now,
     *     having just left the current event's target.
     * @returns {Element} The element the mouse is now over.
     */

    return TP.eventGetRelatedTarget(this.getEvent());
});

//  ========================================================================
//  TP.sig.DOMMouseLeave
//  ========================================================================

TP.sig.DOMMouseSignal.defineSubtype('DOMMouseLeave');
TP.sig.DOMMouseLeave.Type.defineConstant('NATIVE_NAME', 'mouseleave');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.DOMMouseLeave.Inst.defineMethod('getRelatedTarget',
function() {

    /**
     * @method getRelatedTarget
     * @summary Returns the related target, the element the mouse is over now,
     *     having just left the current event's target.
     * @returns {Element} The element the mouse is now over.
     */

    return TP.eventGetRelatedTarget(this.getEvent());
});

//  ---

TP.sig.DOMMouseSignal.defineSubtype('DOMMouseUp');
TP.sig.DOMMouseUp.Type.defineConstant('NATIVE_NAME', 'mouseup');

//  ---

TP.sig.DOMMouseSignal.defineSubtype('DOMClick');
TP.sig.DOMClick.Type.defineConstant('NATIVE_NAME', 'click');

//  ---

TP.sig.DOMMouseSignal.defineSubtype('DOMDblClick');
TP.sig.DOMDblClick.Type.defineConstant('NATIVE_NAME', 'dblclick');

//  ---

TP.sig.DOMMouseSignal.defineSubtype('DOMContextMenu');
TP.sig.DOMContextMenu.Type.defineConstant('NATIVE_NAME', 'contextmenu');

//  ---

TP.sig.DOMMouseSignal.defineSubtype('DOMMouseMove');
TP.sig.DOMMouseMove.Type.defineConstant('NATIVE_NAME', 'mousemove');

//  ========================================================================
//  TP.sig.DOMMouseOut
//  ========================================================================

TP.sig.DOMMouseSignal.defineSubtype('DOMMouseOut');
TP.sig.DOMMouseOut.Type.defineConstant('NATIVE_NAME', 'mouseout');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.DOMMouseOut.Inst.defineMethod('getRelatedTarget',
function() {

    /**
     * @method getRelatedTarget
     * @summary Returns the related target, the element the mouse is over now,
     *     having just left the current event's target.
     * @returns {Element} The element the mouse is now over.
     */

    return TP.eventGetRelatedTarget(this.getEvent());
});

//  ========================================================================
//  TP.sig.DOMMouseOver
//  ========================================================================

TP.sig.DOMMouseSignal.defineSubtype('DOMMouseOver');
TP.sig.DOMMouseOver.Type.defineConstant('NATIVE_NAME', 'mouseover');

//  ------------------------------------------------------------------------

TP.sig.DOMMouseOver.Inst.defineMethod('getRelatedTarget',
function() {

    /**
     * @method getRelatedTarget
     * @summary Returns the related target, the element the mouse was just over
     *     prior to the current event.
     * @returns {Element} The element the mouse was over.
     */

    return TP.eventGetRelatedTarget(this.getEvent());
});

//  ------------------------------------------------------------------------

TP.sig.DOMMouseOver.Inst.defineMethod('shouldPrevent',
function(aFlag) {

    /**
     * @method shouldPrevent
     * @summary Returns true if the signal handler(s) should not perform the
     *     default action. If a flag is provided this flag is used to set the
     *     prevent status.
     * @param {Boolean} aFlag yes or no?
     * @returns {Boolean}
     */

    var retValue,
        evt;

    retValue = this.callNextMethod();

    if (TP.isEvent(evt = this.getEvent())) {
        if (TP.isTrue(aFlag)) {
            //  The hook file patches all native events to support this
            //  call.
            evt.preventDefault();
        }
    }

    return retValue;
});

//  ========================================================================
//  TP.sig.DOMMouseWheel
//  ========================================================================

TP.sig.DOMMouseSignal.defineSubtype('DOMMouseWheel');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

if (TP.sys.isUA('GECKO')) {
    TP.sig.DOMMouseWheel.Type.defineConstant('NATIVE_NAME', 'DOMMouseScroll');
}

if (TP.sys.isUA('IE') || TP.sys.isUA('WEBKIT')) {
    TP.sig.DOMMouseWheel.Type.defineConstant('NATIVE_NAME', 'mousewheel');
}

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.DOMMouseWheel.Type.defineMethod('shouldLog',
function() {

    /**
     * @method shouldLog
     * @summary Returns true when the signal can be logged during signal
     *     processing. At this level, this method returns false.
     * @returns {Boolean}
     */

    return false;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.DOMMouseWheel.Inst.defineMethod('getDirection',
function() {

    /**
     * @method getDirection
     * @summary Returns the mouse wheel direction as either TP.UP or TP.DOWN
     *     depending on the specific delta direction.
     * @returns {TP.UP|TP.DOWN}
     */

    /* eslint-disable no-extra-parens */
    return (this.getWheelDelta() > 0) ? TP.UP : TP.DOWN;
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.sig.DOMMouseWheel.Inst.defineMethod('getWheelDelta',
function() {

    /**
     * @method getWheelDelta
     * @summary Returns the mouse wheel delta value from a mouse wheel event.
     * @returns {Number} The delta. Positive is down, negative is up.
     */

    return TP.eventGetWheelDelta(this.getEvent());
});

//  ========================================================================
//  TP.sig.DOMMouseHover
//  ========================================================================

TP.sig.DOMMouseSignal.defineSubtype('DOMMouseHover');

//  ------------------------------------------------------------------------

TP.sig.DOMMouseHover.Inst.defineMethod('setEvent',
function(normalizedEvent) {

    /**
     * @method setEvent
     * @summary Sets the 'native event' of the signal.
     * @param {Event} normalizedEvent The native event containing the signal's
     *     raw data.
     * @returns {TP.sig.DOMMouseHover} The receiver.
     */

    //  Call to supertype to set the event.
    this.callNextMethod();

    //  Make sure normalizedEvent is real - sometimes it's a null.
    if (TP.isEvent(normalizedEvent)) {
        //  This is fake, but needed because TP.sig.DOMMouseHover signals reuse
        //  mouse move signals.
        normalizedEvent.$$type = 'mousehover';
    }

    return this;
});

//  ========================================================================
//  DOM KEY SIGNALS
//  ========================================================================

TP.sig.DOMUISignal.defineSubtype('DOMKeySignal');

TP.sig.DOMKeySignal.shouldUseSingleton(false);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.DOMKeySignal.Type.defineMethod('getSignalOwner',
function() {

    /**
     * @method getSignalOwner
     * @summary Returns the Object or Type responsible for signals of this
     *     type.
     * @returns {Object|TP.lang.RootObject} The signal type's owner.
     */

    return TP.sys.getTypeByName('TP.core.Keyboard');
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.DOMKeySignal.Inst.defineMethod('computeSignalName',
function() {

    /**
     * @method computeSignalName
     * @summary Computes the signal name. For key signals, the 'default' signal
     *     name is 'TP.sig.' followed by whatever the TP.core.Keyboard type
     *     reports as the 'DOM signal name' for the event that this signal
     *     represents. This would be something like
     *     'TP.sig.DOM_Shift_Enter_Up'.
     * @returns {String} The signal name of the receiver.
     */

    //  NOTE that we return the signal name here based on information in the
    //  key event. This means that all signals of this type are 'spoofed'
    //  signals (i.e. their signal name might be something like
    //  'TP.sig.DOM_Shift_Enter_Up' while their signal *type* name - in that
    //  case - would be 'TP.sig.DOMKeyUp')
    return 'TP.sig.' + TP.core.Keyboard.getDOMSignalName(this.getEvent());
});

//  ------------------------------------------------------------------------

TP.sig.DOMKeySignal.Inst.defineMethod('getKeyName',
function() {

    /**
     * @method getKeyName
     * @summary Returns the 'key name' for the receiver.
     * @description This is a name (e.g. 'DOM_Shift_Enter_up') based on a
     *     computation involving the underlying Event object's charCode,
     *     keyCode, modifier key states all matched with entries in the
     *     currently active keyboard map.
     * @returns {String} The key name of the receiver.
     */

    return TP.core.Keyboard.getDOMSignalName(this.getEvent());
});

//  ------------------------------------------------------------------------

TP.sig.DOMKeySignal.Inst.defineMethod('getKeyCode',
function() {

    /**
     * @method getKeyCode
     * @summary Returns the code of the key that was pressed to generate this
     *     key signal.
     * @returns {Number} The key code of the key that was pressed.
     */

    return TP.eventGetKeyCode(this.getEvent());
});

//  ------------------------------------------------------------------------

TP.sig.DOMKeySignal.Inst.defineMethod('getSignalNames',
function() {

    /**
     * @method getSignalNames
     * @summary Returns the 'signal names' to use when dispatching signals of
     *     this type.
     * @description TP.sig.DOMKeySignals have a bit of complexity when providing
     *     their signal names. First, there is the 'virtual key' signal name
     *     (i.e. 'TP.sig.DOM_b_Up', which is the default value. Next, there is
     *     (sometimes) a 'Unicode literal' signal name (i.e.
     *     'TP.sig.DOM_U0062_Up'). Last, there is hierarchy of real type names
     *     of this signal (i.e. 'TP.sig.DOMKeyUp' and higher).
     * @returns {String[]} An Array of signal names.
     */

    var sigNames,
        unicodeSigName;

    sigNames = this.callNextMethod();

    //  If we can compute a Unicode signal name, we splice it in just after the
    //  signal name (i.e. the specific, spoofed signal name that contains the
    //  exact key in its name) and the signal type name.
    if (TP.notEmpty(unicodeSigName = this.getUnicodeSignalName())) {
        sigNames = TP.copy(sigNames);
        sigNames.splice(1, 0, unicodeSigName);
    }

    return sigNames;
});

//  ------------------------------------------------------------------------

TP.sig.DOMKeySignal.Inst.defineMethod('getUnicodeSignalName',
function() {

    /**
     * @method getUnicodeSignalName
     * @summary Returns the 'Unicode literal' signal name of the receiver.
     *     This would be something like 'TP.sig.DOM_U0062_Up'.
     * @returns {String} The 'Unicode literal' signal name of the receiver.
     */

    var evt,
        keyname,
        signame;

    evt = this.getEvent();

    //  If keyname is empty, it must be a key that doesn't have a corresponding
    //  Unicode value (i.e. an arrow key). Return the empty String.
    if (TP.isEmpty(keyname = TP.eventGetUnicodeCharCode(evt))) {
        return '';
    }

    //  Otherwise, compute the signal name by adding whatever modifiers and
    //  'action' (down, press or up) to the key name. Note how we pass in the
    //  value of whether the Shift key was down separately here for better
    //  control (sometimes we want to spoof).
    signame = 'TP.sig.DOM_' + TP.core.Keyboard.computeFullSignalName(
                                        evt,
                                        keyname,
                                        TP.eventGetShiftKey(evt));

    return signame;
});

//  ------------------------------------------------------------------------

TP.sig.DOMKeySignal.Inst.defineMethod('getVirtualKeyName',
function() {

    /**
     * @method getVirtualKeyName
     * @summary Returns the normalized virtual key name for the receiver's
     *     event.
     * @description For example, a TP.sig.DOMKeySignal with a keyCode of 13 will
     *     produce the identifier 'Enter'.
     * @returns {String} The virtual key name, such as 'Enter'.
     */

    return TP.core.Keyboard.getVirtualKeyName(this.getEvent());
});

//  ------------------------------------------------------------------------
//  COMMON SUBTYPES
//  ------------------------------------------------------------------------

TP.sig.DOMKeySignal.defineSubtype('DOMKeyDown');
TP.sig.DOMKeyDown.Type.defineConstant('NATIVE_NAME', 'keydown');

//  ---

TP.sig.DOMKeySignal.defineSubtype('DOMKeyPress');
TP.sig.DOMKeyPress.Type.defineConstant('NATIVE_NAME', 'keypress');

//  ---

TP.sig.DOMKeySignal.defineSubtype('DOMKeyUp');
TP.sig.DOMKeyUp.Type.defineConstant('NATIVE_NAME', 'keyup');

//  ---

//  ========================================================================
//  TP.sig.DOMModifierKeyChange
//  ========================================================================

TP.sig.DOMKeySignal.defineSubtype('DOMModifierKeyChange');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.DOMModifierKeyChange.Inst.defineMethod('getSignalNames',
function() {

    /**
     * @method getSignalNames
     * @summary Returns the 'signal names' to use when dispatching signals of
     *     this type.
     * @description Normally, DOMKeySignals return an Array of signal names that
     *     include both their signal name (which will correspond to a particular
     *     key) and the hierarchy of type names. But we want
     *     DOMKeyModifierChange signals to only return their type name so that
     *     observers have to observe this type name directly. If observers want
     *     to observe things like the Shift key going up, they should observe
     *     'DOM_Shift_Up', etc. which will be sent directly as a result of the
     *     Shift key going up, not as a manufactured event like this one.
     * @returns {String[]} An Array of signal names.
     */

    return TP.ac(this.getTypeName());
});

//  ------------------------------------------------------------------------

TP.sig.DOMModifierKeyChange.Inst.defineMethod('setEvent',
function(normalizedEvent) {

    /**
     * @method setEvent
     * @summary Sets the native event which this signal instance represents.
     * @param {Event} normalizedEvent The native event containing the signal's
     *     raw data.
     * @returns {TP.sig.DOMModifierKeyChange} The receiver.
     */

    //  NOTE that we don't callNextMethod here specifically to avoid having
    //  the signal name adjusted to match the specifics of the key event.

    this.setPayload(normalizedEvent);

    return this;
});

//  ========================================================================
//  DOM DRAG SIGNALS
//  ========================================================================

TP.sig.DOMMouseDown.defineSubtype('DOMDragDown');
TP.sig.DOMMouseMove.defineSubtype('DOMDragMove');
TP.sig.DOMMouseUp.defineSubtype('DOMDragUp');

TP.sig.DOMMouseOver.defineSubtype('DOMDragOver');
TP.sig.DOMMouseOut.defineSubtype('DOMDragOut');

TP.sig.DOMMouseHover.defineSubtype('DOMDragHover');

//  ========================================================================
//  DOM DND SIGNALS
//  ========================================================================

TP.sig.DOMSignal.defineSubtype('DOMDNDSignal');

TP.sig.DOMDNDSignal.defineSubtype('DOMDNDInitiate');
TP.sig.DOMDNDSignal.defineSubtype('DOMDNDTerminate');

TP.sig.DOMDNDSignal.defineSubtype('DOMDNDWillVend');
TP.sig.DOMDNDSignal.defineSubtype('DOMDNDWillAccept');

TP.sig.DOMDNDSignal.defineSubtype('DOMDNDCancelled');

TP.sig.DOMDNDSignal.defineSubtype('DOMDNDCompleted');
TP.sig.DOMDNDSignal.defineSubtype('DOMDNDFailed');
TP.sig.DOMDNDSignal.defineSubtype('DOMDNDSucceeded');

TP.sig.DOMDNDSignal.defineSubtype('DOMDNDTargetSignal');

TP.sig.DOMDNDTargetSignal.defineSubtype('DOMDNDTargetOver');
TP.sig.DOMDNDTargetSignal.defineSubtype('DOMDNDTargetOut');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.DOMDNDTargetSignal.Inst.defineMethod('getDOMTarget',
function() {

    /**
     * @method getDOMTarget
     * @summary Returns the DOM target of the receiver. If the receiver was
     *     triggered because of a DOM signal, this method will return the *DOM*
     *     target of the signal.
     * @description DND targeting signals, such as TP.sig.DOMDNDTargetOver and
     *     TP.sig.DOMDNDTargetOut capture the event that caused them to trigger.
     *     This can be very useful when wanting to refine the target.
     * @returns {TP.dom.UIElementNode} The DOM target of the receiver.
     */

    var evt,
        domSignal;

    //  Responder signals are *not* DOM signals, but if they've been triggered
    //  because of a DOM signal, they should have the low-level event in their
    //  payload.
    if (TP.isEvent(evt = this.at('event'))) {

        //  Wrap the event into a TIBET DOM signal of some type.
        domSignal = TP.wrap(evt);

        return domSignal.getTarget();
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.sig.DOMDNDTargetSignal.Inst.defineMethod('getResolvedDOMTarget',
function() {

    /**
     * @method getResolvedDOMTarget
     * @summary Returns the *resolved* DOM target of the receiver. If the
     *     receiver was triggered because of a DOM signal, this method will
     *     return the *resolved* *DOM* target of the signal. See DOM signals for
     *     more information on the difference between targets and resolved
     *     targets.
     * @description When triggered via a DOM signal, Responder signals set their
     *     target to their origin so that responder chain semantics work
     *     properly. This method allows access to the original *resolved* *DOM*
     *     target of the signal.
     * @returns {TP.dom.UIElementNode} The resolved DOM target of the receiver.
     */

    var evt,
        domSignal;

    //  Responder signals are *not* DOM signals, but if they've been triggered
    //  because of a DOM signal, they should have the low-level event in their
    //  payload.
    if (TP.isEvent(evt = this.at('event'))) {

        //  Wrap the event into a TIBET DOM signal of some type.
        domSignal = TP.wrap(evt);

        return domSignal.getResolvedTarget();
    }

    return null;
});

//  ========================================================================
//  GEOLOCATION SIGNALS
//  ========================================================================

TP.sig.Signal.defineSubtype('GeoLocationChange');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.GeoLocationChange.Type.defineMethod('getSignalOwner',
function() {

    /**
     * @method getSignalOwner
     * @summary Returns the Object or Type responsible for signals of this
     *     type.
     * @returns {Object|TP.lang.RootObject} The signal type's owner.
     */

    return TP.sys.getTypeByName('TP.core.Window');
});

//  ------------------------------------------------------------------------

//  ========================================================================
//  CSS MEDIA SIGNALS
//  ========================================================================

TP.sig.Signal.defineSubtype('CSSMediaChange');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.CSSMediaChange.Type.defineMethod('getSignalOwner',
function() {

    /**
     * @method getSignalOwner
     * @summary Returns the Object or Type responsible for signals of this
     *     type.
     * @returns {Object|TP.lang.RootObject} The signal type's owner.
     */

    return TP.sys.getTypeByName('TP.core.Window');
});

//  ------------------------------------------------------------------------

TP.sig.CSSMediaChange.defineSubtype('CSSMediaActive');
TP.sig.CSSMediaChange.defineSubtype('CSSMediaInactive');

//  ========================================================================
//  TP.sig.WARNING SIGNALS
//  ========================================================================

TP.sig.WARN.defineSubtype('Deprecated');
TP.sig.WARN.defineSubtype('DoesNotUnderstand');
TP.sig.WARN.defineSubtype('TODO');
TP.sig.WARN.defineSubtype('UnsupportedFeature');

//  ========================================================================
//  TP.sig.ERROR SIGNALS
//  ========================================================================

TP.sig.ERROR.defineSubtype('MissingOverride');

TP.sig.ERROR.defineSubtype('InvalidAccessMode');
TP.sig.ERROR.defineSubtype('InvalidCollection');
TP.sig.ERROR.defineSubtype('InvalidConstraint');
TP.sig.ERROR.defineSubtype('InvalidContext');
TP.sig.ERROR.defineSubtype('InvalidDescriptor');
TP.sig.ERROR.defineSubtype('InvalidDirectory');
TP.sig.ERROR.defineSubtype('InvalidHandlerName');
TP.sig.ERROR.defineSubtype('InvalidFrame');
TP.sig.ERROR.defineSubtype('InvalidFunction');
TP.sig.ERROR.defineSubtype('InvalidModel');
TP.sig.ERROR.defineSubtype('InvalidNumber');
TP.sig.ERROR.defineSubtype('InvalidOperation');
TP.sig.ERROR.defineSubtype('InvalidOrigin');
TP.sig.ERROR.defineSubtype('InvalidParameter');
TP.sig.ERROR.defineSubtype('InvalidQuery');
TP.sig.ERROR.defineSubtype('InvalidRequest');
TP.sig.ERROR.defineSubtype('InvalidSignal');
TP.sig.ERROR.defineSubtype('InvalidValue');
TP.sig.ERROR.defineSubtype('InvalidName');
TP.sig.ERROR.defineSubtype('InvalidURI');
TP.sig.ERROR.defineSubtype('InvalidWindow');
TP.sig.ERROR.defineSubtype('InvalidXML');

TP.sig.ERROR.defineSubtype('AccessViolation');
TP.sig.ERROR.defineSubtype('MutabilityViolation');
TP.sig.ERROR.defineSubtype('PrivilegeViolation');

TP.sig.ERROR.defineSubtype('MarshallingException');

//  ------------------------------------------------------------------------
//  INHERITANCE SIGNALS/EXCEPTIONS
//  ------------------------------------------------------------------------

TP.sig.ERROR.defineSubtype('InheritanceException');

TP.sig.InheritanceException.defineSubtype('TypeNotFound');

TP.sig.InheritanceException.defineSubtype('InvalidType');
TP.sig.InheritanceException.defineSubtype('InvalidInstantiation');
TP.sig.InheritanceException.defineSubtype('InvalidOwnerRequest');
TP.sig.InheritanceException.defineSubtype('InvalidTrackRequest');
TP.sig.InheritanceException.defineSubtype('InvalidFunctionTrack');

TP.sig.InheritanceException.defineSubtype('NoOwner');
TP.sig.InheritanceException.defineSubtype('NoConcreteType');
TP.sig.InheritanceException.defineSubtype('NoMetaInformation');
TP.sig.InheritanceException.defineSubtype('NoNextTypeMethod');
TP.sig.InheritanceException.defineSubtype('NoNextInstMethod');
TP.sig.InheritanceException.defineSubtype('NoNextTypeLocalMethod');
TP.sig.InheritanceException.defineSubtype('NoNextInstLocalMethod');
TP.sig.InheritanceException.defineSubtype('NoNextGlobalMethod');

//  ------------------------------------------------------------------------
//  COLLECTION SIGNALS/EXCEPTIONS
//  ------------------------------------------------------------------------

TP.sig.ERROR.defineSubtype('CollectionException');

TP.sig.CollectionException.defineSubtype('InvalidArrayOperation');
TP.sig.CollectionException.defineSubtype('InvalidHashOperation');
TP.sig.CollectionException.defineSubtype('InvalidStringOperation');

TP.sig.CollectionException.defineSubtype('InvalidCollectionRequest');

TP.sig.InvalidCollectionRequest.defineSubtype('InvalidKeyRequest');
TP.sig.InvalidCollectionRequest.defineSubtype('InvalidItemRequest');
TP.sig.InvalidCollectionRequest.defineSubtype('InvalidPairRequest');
TP.sig.InvalidCollectionRequest.defineSubtype('InvalidValueRequest');

TP.sig.CollectionException.defineSubtype('IndexException');

TP.sig.IndexException.defineSubtype('InvalidIndex');
TP.sig.IndexException.defineSubtype('NotFound');

TP.sig.CollectionException.defineSubtype('ItemException');

TP.sig.ItemException.defineSubtype('InvalidItem');
TP.sig.ItemException.defineSubtype('InvalidPair');

TP.sig.CollectionException.defineSubtype('KeyException');

TP.sig.KeyException.defineSubtype('InvalidKey');
TP.sig.KeyException.defineSubtype('DuplicateKey');

//  ------------------------------------------------------------------------
//  INVOCATION SIGNALS/EXCEPTIONS
//  ------------------------------------------------------------------------

TP.sig.Signal.defineSubtype('InvocationSignal');

TP.sig.InvocationSignal.defineSubtype('InvokeComplete');

TP.sig.ERROR.defineSubtype('InvokeFailed');

//  ------------------------------------------------------------------------
//  IO EXCEPTIONS
//  ------------------------------------------------------------------------

TP.sig.ERROR.defineSubtype('IOException');

TP.sig.IOException.defineSubtype('ConnectionFailed');

TP.sig.IOException.defineSubtype('URIException');

TP.sig.URIException.defineSubtype('URINotFound');
TP.sig.URIException.defineSubtype('URIComponentException');

//  ------------------------------------------------------------------------
//  RESOURCE SIGNALS/EXCEPTIONS
//  ------------------------------------------------------------------------

TP.sig.ERROR.defineSubtype('ResourceException');

TP.sig.ERROR.defineSubtype('TemplateTokenizationFailed');
TP.sig.ERROR.defineSubtype('TemplateCompilationFailed');
TP.sig.ERROR.defineSubtype('TransformFailed');

//  ------------------------------------------------------------------------
//  SERVICE SIGNALS/EXCEPTIONS
//  ------------------------------------------------------------------------

TP.sig.Exception.defineSubtype('ServiceException');

TP.sig.ServiceException.defineSubtype('ServiceUnavailable');
TP.sig.ServiceException.defineSubtype('RequestNotFound');

//  ------------------------------------------------------------------------
//  RENDERING SIGNALS/EXCEPTIONS
//  ------------------------------------------------------------------------

TP.sig.Signal.defineSubtype('DidRender');
TP.sig.DidRender.defineSubtype('DidRenderData');

//  ------------------------------------------------------------------------
//  VALIDATION SIGNALS/EXCEPTIONS
//  ------------------------------------------------------------------------

TP.sig.Signal.defineSubtype('InputNull');

//  ------------------------------------------------------------------------
//  XSLT SIGNALS/EXCEPTIONS
//  ------------------------------------------------------------------------

TP.sig.ERROR.defineSubtype('XSLTException');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
