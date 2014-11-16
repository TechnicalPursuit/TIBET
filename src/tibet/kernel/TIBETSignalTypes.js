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
 * @file TIBETSignalTypes.js
 * @todo
 */

//  ========================================================================
//  TP.core.Monitor
//  ========================================================================

/**
 * @type {TP.core.Monitor}
 * @synopsis A TP.core.Monitor is an object whose responsibility is to
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

TP.lang.Object.defineSubtype('core:Monitor');

TP.core.Monitor.addTraitsFrom(TP.core.JobStatus);

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
     * @name getDefaultSignal
     * @synopsis Returns the default signal type to signal.
     * @returns {String|TP.sig.Signal} The signal type or signal type name.
     * @todo
     */

    return this.$get('defaultSignal');
});

//  ------------------------------------------------------------------------

TP.core.Monitor.Type.defineMethod('getDefaultTest',
function() {

    /**
     * @name getDefaultTest
     * @synopsis Returns the default test function used to detect monitor
     *     events.
     * @returns {Function} The default test function.
     * @todo
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

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Monitor.Inst.defineMethod('init',
function(aTarget, aTest, aSignal) {

    /**
     * @name init
     * @synopsis Initializes a new instance of monitor.
     * @param {Object} aTarget An object or object ID which identifies the
     *     object being monitored. When an ID is used it should be a valid
     *     TP.core.URI or a String which can be resolved via the
     *     TP.sys.getObjectById() call.
     * @param {Function} aTest A function which defines the test being run on
     *     each target object. This should return true to cause the monitor to
     *     signal.
     * @param {String|TP.sig.Signal} aSignal The signal to fire when/if the
     *     test condition passes.
     * @returns {TP.core.Monitor} A newly initialized instance.
     * @todo
     */

    var test,
        signal,
        func;

    this.callNextMethod();

    //  test can be defaulted on a type-by-type basis so that subtypes of
    //  monitor can be constructed for common cases.
    test = TP.ifInvalid(aTest, this.getType().getDefaultTest());
    if (!TP.isCallable(test)) {
        this.raise('TP.sig.InvalidParameter',
                    'Test must be a runnable function.');

        return;
    }

    this.$set('test', test);

    //  signal type can be defaulted on a type-by-type basis so subtypes can
    //  avoid requiring a signal name during instance construction
    signal = TP.ifInvalid(aSignal, this.getType().getDefaultSignal());
    if (TP.notValid(signal)) {
        this.raise('TP.sig.InvalidParameter',
                    'Signal must be valid signal name or type.');

        return;
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
     * @name addTarget
     * @synopsis Adds a new target to the list of objects to monitor.
     * @param {String|TP.core.URI|Function} aTarget A target specification in
     *     one of a variety of forms: TP.core.URI, string ID, or acquisition
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

        if (!TP.isString(target) &&
            !TP.isCallable(target) &&
            !TP.isKindOf(target, TP.core.URI)) {
            this.raise(
                'TP.sig.InvalidParameter',
                'Target must be string ID, URI, or acquisition function.');

            continue;
        }

        this.$get('targets').add(target);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Monitor.Inst.defineMethod('constructJob',
function(controlParameters) {

    /**
     * @name constructJob
     * @synopsis Constructs the job instance used to manage the work of the
     *     monitor in terms of scheduling etc.
     * @param {TP.lang.Hash} controlParameters The job's control parameters, set
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
     * @name constructStepFunction
     * @synopsis Builds a step function specific to the requirements of this
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
                    //  ignore errors in acquisition functions
                }
            } else if (TP.isString(target)) {
                obj = TP.sys.getObjectById(target);
            } else {
                obj = target.getResource();
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
     * @name removeTarget
     * @synopsis Removes a target from the list of objects to monitor.
     * @param {String|TP.core.URI|Function} aTarget A target specification in
     *     one of a variety of forms: TP.core.URI, string ID, or acquisition
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

        if (!TP.isString(target) &&
            !TP.isCallable(target) &&
            !TP.isKindOf(target, TP.core.URI)) {
            this.raise(
                'TP.sig.InvalidParameter',
                'Target must be string ID, URI, or acquisition function.');

            continue;
        }

        this.$get('targets').remove(target);
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Job Configuration Methods
//  ------------------------------------------------------------------------

TP.core.Monitor.Inst.defineMethod('getControlParameters',
function(controlParameters) {

    /**
     * @name getControlParameters
     * @synopsis Returns a hash of control parameters for the receiver's
     *     underlying job instance. The return value is a merged copy of the
     *     receiving type's default parameters and any parameter information
     *     passed in.
     * @param {TP.lang.Hash} controlParameters An optional set of parameters
     *     used during job creation.
     * @returns {TP.lang.Hash} The control parameters for this monitor.
     * @todo
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
     * @name getJob
     * @synopsis Returns the job instance used by this monitor.
     * @returns {TP.core.Job} The receiver's internal job instance.
     */

    return this.$get('job');
});

//  ------------------------------------------------------------------------

TP.core.Monitor.Inst.defineMethod('getStepParameters',
function(stepParameters) {

    /**
     * @name getStepParameters
     * @synopsis Returns a hash of step parameters for the receiver's underlying
     *     job instance. The return value is a merged copy of the receiving
     *     type's default parameters and any parameter information passed in.
     * @param {TP.lang.Hash} stepParameters An optional set of parameters used
     *     to control job steps.
     * @returns {TP.lang.Hash} The step parameters for this monitor.
     * @todo
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
function(aFaultCode, aFaultString) {

    /**
     * @name cancel
     * @synopsis Cancels the monitor, stopping all monitoring.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the cancellation.
     * @param {String} aFaultString A string description of the cancellation.
     * @returns {TP.core.Monitor} The receiver.
     * @todo
     */

    this.getJob().cancel(aFaultCode, aFaultString);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Monitor.Inst.defineMethod('complete',
function(aResult) {

    /**
     * @name complete
     * @synopsis Completes (ends with success) the monitor, stopping it.
     * @param {Object} aResult An optional result object associated with the
     *     job.
     * @returns {TP.core.Monitor} The receiver.
     * @todo
     */

    this.getJob().complete(aResult);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Monitor.Inst.defineMethod('fail',
function(aFaultCode, aFaultString, anException) {

    /**
     * @name fail
     * @synopsis Terminates the monitor, stopping all monitoring.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the failure.
     * @param {String} aFaultString A string description of the fault.
     * @param {TP.sig.Exception|String} anException An optional exception to
     *     raise.
     * @returns {TP.core.Monitor} The receiver.
     * @todo
     */

    this.getJob().fail(aFaultCode, aFaultString, anException);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Monitor.Inst.defineMethod('start',
function(stepParameters) {

    /**
     * @name start
     * @synopsis Starts the monitor, causing it to begin monitoring its targets
     *     for monitor events.
     * @param {TP.lang.Hash} stepParameters An optional set of parameters used
     *     to control job steps.
     * @returns {TP.core.Monitor} The receiver.
     * @todo
     */

    this.getJob().start(this.getStepParameters(stepParameters));

    return this;
});

//  ========================================================================
//  TP.core.ResizeMonitor
//  ========================================================================

/**
 * @type {TP.core.ResizeMonitor}
 * @synopsis A TP.core.Monitor specific to monitoring elements for size changes
 *     which might be triggered via CSS shifts or other activity which won't
 *     normally trigger a native event.
 */

//  ------------------------------------------------------------------------

TP.core.Monitor.defineSubtype('ResizeMonitor');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.core.ResizeMonitor.Type.defineAttribute('defaultSignal', 'TP.sig.DOMResize');

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

        oldHeight = TP.elementGetAttribute(elem, 'tibet:old_height', true);
        oldWidth = TP.elementGetAttribute(elem, 'tibet:old_width', true);

        newHeight = TP.elementGetHeight(elem);
        newWidth = TP.elementGetWidth(elem);

        TP.elementSetAttribute(elem, 'tibet:old_height', newHeight, true);
        TP.elementSetAttribute(elem, 'tibet:old_width', newWidth, true);

        //  don't signal the first time through
        if (TP.isEmpty(oldHeight)) {
            return false;
        }

        if ((oldHeight !== newHeight) || (oldWidth !== newWidth)) {
            return true;
        }

        return false;
    });

//  ========================================================================
//  APP SIGNALS
//  ========================================================================

TP.sig.Signal.defineSubtype('ApplicationSignal');

TP.sig.ApplicationSignal.shouldUseSingleton(true);
TP.sig.ApplicationSignal.isSignalingRoot(true);

TP.sig.ApplicationSignal.defineSubtype('AppStart');
TP.sig.ApplicationSignal.defineSubtype('AppWillStart');
TP.sig.ApplicationSignal.defineSubtype('AppDidStart');

TP.sig.ApplicationSignal.defineSubtype('AppShutdown');

TP.sig.ApplicationSignal.defineSubtype('TargetIn');
TP.sig.ApplicationSignal.defineSubtype('TargetOut');

//  ========================================================================
//  RESPONDER SIGNALS
//  ========================================================================

TP.sig.Signal.defineSubtype('ResponderSignal');

TP.sig.ResponderSignal.Type.defineAttribute('defaultPolicy', TP.RESPONDER_FIRING);

TP.sig.ResponderSignal.Type.defineAttribute('bubbling', true);
TP.sig.ResponderSignal.Type.defineAttribute('cancelable', true);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sig.ResponderSignal.Inst.defineAttribute('currentChain');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.ResponderSignal.Inst.defineMethod('getTargetResponder',
function() {

    /**
     * @name getTargetResponder
     * @synopsis Returns the 'target responder' as computed by the receiver.
     *     This will be the object that the responder chain computation
     *     machinery will use as a starting point.
     * @returns {Object} The object that the chain computation machinery should
     *     use as a starting point.
     */

    var targetElem;

    if (!TP.isElement(targetElem = this.getTarget())) {
        return null;
    }

    return TP.wrap(targetElem);
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

TP.sig.ResponderInteractionSignal.defineSubtype('UIFocusChangeSignal');

//  ------------------------------------------------------------------------

TP.sig.UIFocusChangeSignal.defineSubtype('UIBlur');
TP.sig.UIFocusChangeSignal.defineSubtype('UIFocus');
TP.sig.UIFocusChangeSignal.defineSubtype('UIFocusAndSelect');

//  ------------------------------------------------------------------------

TP.sig.ResponderInteractionSignal.defineSubtype('UIFocusComputationSignal');

//  ------------------------------------------------------------------------

TP.sig.UIFocusComputationSignal.defineSubtype('UIFocusFirst');
TP.sig.UIFocusComputationSignal.defineSubtype('UIFocusLast');
TP.sig.UIFocusComputationSignal.defineSubtype('UIFocusPrevious');
TP.sig.UIFocusComputationSignal.defineSubtype('UIFocusNext');
TP.sig.UIFocusComputationSignal.defineSubtype('UIFocusFollowing');
TP.sig.UIFocusComputationSignal.defineSubtype('UIFocusPreceding');
TP.sig.UIFocusComputationSignal.defineSubtype('UIFocusFirstInGroup');
TP.sig.UIFocusComputationSignal.defineSubtype('UIFocusLastInGroup');
TP.sig.UIFocusComputationSignal.defineSubtype('UIFocusFirstInNextGroup');
TP.sig.UIFocusComputationSignal.defineSubtype('UIFocusFirstInPreviousGroup');

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

TP.sig.ResponderInteractionSignal.defineSubtype('DOMRebuild'); //  XForms
TP.sig.ResponderInteractionSignal.defineSubtype('DOMRefresh'); //  XForms

/*
TP.sig.ResponderInteractionSignal.defineSubtype('DOMRevalidate');  //  XForms
TP.sig.ResponderInteractionSignal.defineSubtype('DOMRecalculate');//   XForms

TP.sig.ResponderInteractionSignal.defineSubtype('DOMReset');   //  XForms
TP.sig.ResponderInteractionSignal.defineSubtype('DOMSubmit');  //  XForms
TP.sig.ResponderInteractionSignal.defineSubtype('DOMSubmitSerialize');//   XForms
*/

//  ------------------------------------------------------------------------

TP.sig.ResponderInteractionSignal.defineSubtype('UIValueChanged'); //  XForms

TP.sig.ResponderInteractionSignal.defineSubtype('UISelect'); //    XForms
TP.sig.ResponderInteractionSignal.defineSubtype('UIDeselect'); //  XForms

TP.sig.ResponderInteractionSignal.defineSubtype('UIScroll');

TP.sig.ResponderInteractionSignal.defineSubtype('UIInsert'); //    XForms
TP.sig.ResponderInteractionSignal.defineSubtype('UIDelete'); //    XForms

TP.sig.ResponderInteractionSignal.defineSubtype('UIDuplicate');

TP.sig.ResponderInteractionSignal.defineSubtype('UIValid'); // XForms
TP.sig.ResponderInteractionSignal.defineSubtype('UIInvalid'); //   XForms

TP.sig.ResponderInteractionSignal.defineSubtype('UIReadonly'); //  XForms
TP.sig.ResponderInteractionSignal.defineSubtype('UIReadwrite'); // XForms

TP.sig.ResponderInteractionSignal.defineSubtype('UIRequired'); //  XForms
TP.sig.ResponderInteractionSignal.defineSubtype('UIOptional'); //  XForms

TP.sig.ResponderInteractionSignal.defineSubtype('UIEnabled'); //   XForms
TP.sig.ResponderInteractionSignal.defineSubtype('UIDisabled'); //  XForms

TP.sig.ResponderInteractionSignal.defineSubtype('UIInRange'); //   XForms
TP.sig.ResponderInteractionSignal.defineSubtype('UIOutOfRange'); //    XForms

//TP.sig.ResponderInteractionSignal.defineSubtype('DOMSubmitDone'); // XForms

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

/*
TP.sig.DOMInitializationSignal.defineSubtype('DOMModelConstruct');     //  XForms
TP.sig.DOMInitializationSignal.defineSubtype('DOMModelConstructDone'); //  XForms
TP.sig.DOMInitializationSignal.defineSubtype('DOMReady');              //  XForms
TP.sig.DOMInitializationSignal.defineSubtype('DOMModelDestruct');      //  XForms
*/

//  ------------------------------------------------------------------------
//  DOM Content Signals
//  ------------------------------------------------------------------------

//  Fired when a DOM node is loaded - this might be an opaque element, like
//  an <object> element
TP.sig.DOMSignal.defineSubtype('DOMLoaded');

//  Fired when the content of a DOM node is loaded when the content is more
//  markup.
TP.sig.DOMLoaded.defineSubtype('DOMContentLoaded');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.DOMLoaded.Type.defineMethod('shouldLog',
function() {

    /**
     * @name shouldLog
     * @synopsis Returns true when the signal can be logged during signal
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
     * @name getLevel
     * @synopsis Returns the error level for the receiving signal.
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
 * @synopsis TP.sig.DOMUISignal is the supertype for all DOM-related UI signals
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
 *     TP.sig.DOMClick -> We don't want to perform the default behavior (esp.
 *     for Links, which would be to follow the link). TP.sig.DOMContextMenu ->
 *     We don't want the context menu to show. TP.sig.DOMMouseDown -> We don't
 *     want the mouse down's default action to happen. TP.sig.DOMMouseUp -> We
 *     don't want the mouse up's default action to happen. TP.sig.DOMReset -> In
 *     general, we don't reset FORMs this way in TIBET. TP.sig.DOMSubmit -> In
 *     general, we don't submit FORMs this way in TIBET.
 *
 *     The following signal types override that behavior and return 'true':
 *
 *     TP.sig.DOMKeySignal -> All subtypes of the key signal want to perform
 *     their default behavior, which is to allow the key stroke.
 *     TP.sig.DOMMouseOver -> Don't show Link URLs in the status bar.
 *
 *     This parameter can always be set to a different value in the signal
 *     handlers themselves.
 * @todo
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
     * @name arm
     * @synopsis Arms one or more origins to ensure they trigger signals of the
     *     receiver's type.
     * @param {Array|Object|String} anOrigin The origin or origins to arm.
     * @param {Function} aHandler An (optional) parameter that defines a native
     *     handler to be used instead of routing the event to TIBET.
     * @param {String|Function} aPolicy An (optional) parameter that defines the
     *     firing policy which should be used when firing.
     * @param {Window} windowContext An optional window to search for the
     *     element(s). If not provided then the TP.context() method is used to
     *     find one.
     * @returns {TP.sig.Signal} The receiver.
     * @todo
     */

    var context,
        handler,
        policy;

    if (!this.requiresArming()) {
        return;
    }

    context = TP.ifInvalid(windowContext, TP.nodeGetWindow(anOrigin));
    context = TP.ifInvalid(context, TP.sys.getUICanvas(true));

    if (TP.isDocument(context)) {
        context = TP.nodeGetWindow(context);
    }

    handler = TP.ifInvalid(aHandler, this.get('armingHandler'));

    policy = TP.ifInvalid(aPolicy, this.get('defaultPolicy'));

    TP.windowArmNode(context,
                        TP.byId(anOrigin, context),
                        this.getSignalName(),
                        handler,
                        policy);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Type.defineMethod('disarm',
function(anOrigin, aHandler, windowContext) {

    /**
     * @name disarm
     * @synopsis Disarms an origin so it no longer triggers events of the
     *     receiver's type. NOTE that this doesn't always work if there have
     *     been additional low-level listeners installed.
     * @param {Array|Object|String} anOrigin The origin or origins to disarm.
     * @param {Function} aHandler An (optional) parameter that defines a native
     *     handler to be used instead of routing the event to TIBET.
     * @param {Window} windowContext An optional window to search for the
     *     element(s). If not provided then the TP.context() method is used to
     *     find one.
     * @returns {TP.sig.Signal} The receiver.
     * @todo
     */

    var context,
        handler;

    if (!this.requiresArming()) {
        return;
    }

    context = TP.ifInvalid(windowContext, TP.nodeGetWindow(anOrigin));
    context = TP.ifInvalid(context, TP.sys.getUICanvas(true));

    if (TP.isDocument(context)) {
        context = TP.nodeGetWindow(context);
    }

    handler = TP.ifInvalid(aHandler, this.get('armingHandler'));

    TP.windowDisarmNode(context,
                        TP.byId(anOrigin, context),
                        this.getSignalName(),
                        handler);

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Type.defineMethod('requiresArming',
function(aFlag) {

    /**
     * @name requiresArming
     * @synopsis Combined setter/getter for the receiver's arming control flag.
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
     * @name init
     * @synopsis Initialize the instance.
     * @description For a TP.sig.DOMUISignal the typical payload is a native
     *     event object or an array whose first item is the native event. You
     *     can also provide a TP.lang.Hash as the payload and it will be treated
     *     as a container for the event properties normally associated with an
     *     Event.
     * @param {Object} aPayload A subtype-specific argument object.
     * @param {Boolean} noEvent True to skip event fabrication when there's no
     *     event provided. [False].
     * @returns {TP.sig.DOMUISignal} The receiver.
     * @todo
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
    //  to allow TP.lang.Hash input, or potentially native object input and
    //  we want to end up with an object that simulates all the event slots
    if (TP.notValid(this.getEvent())) {
        obj = this.$fabricateEvent(aPayload);
        this.setEvent(obj);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('copy',
function() {

    /**
     * @name copy
     * @synopsis Returns a 'copy' of the receiver. Actually, a new instance
     *     whose value is equalTo that of the receiver.
     * @returns {TP.sig.DOMUISignal} A shallow copy of the receiver.
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
     * @name $fabricateEvent
     * @synopsis Constructs a normalized event object suitable for the payload
     *     provided. This is typically only invoked via the init function and
     *     only when a native Event isn't provided.
     * @param {Object} aPayload The signal's payload object.
     * @returns {Event|Object} A native Event or Object with Event slots.
     */

    var hash;

    hash = TP.isKindOf(aPayload, TP.lang.Hash) ? aPayload : TP.hc();
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
    return TP.documentCreateEvent(null, hash) || hash;
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('getAltKey',
function() {

    /**
     * @name getAltKey
     * @synopsis Returns the alt key setting at the time of the event.
     * @returns {Boolean} Returns true if the alt key was pressed, false if it
     *     wasn't.
     */

    return TP.eventGetAltKey(this.getEvent());
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('getCtrlKey',
function() {

    /**
     * @name getCtrlKey
     * @synopsis Returns the ctrl key setting at the time of the event.
     * @returns {Boolean} Returns true if the ctrl key was pressed, false if it
     *     wasn't.
     */

    return TP.eventGetCtrlKey(this.getEvent());
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('getMetaKey',
function() {

    /**
     * @name getMetaKey
     * @synopsis Returns the meta key setting at the time of the event.
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
     * @name getShiftKey
     * @synopsis Returns the shift key setting at the time of the event.
     * @returns {Boolean} Returns true if the shift key was pressed, false if it
     *     wasn't.
     */

    return TP.eventGetShiftKey(this.getEvent());
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('getEvent',
function() {

    /**
     * @name getEvent
     * @synopsis Returns the event object containing event information for this
     *     signal.
     * @returns {Object} The event object for this signal.
     */

    return this.getPayload();
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('getEventType',
function() {

    /**
     * @name getEventType
     * @synopsis Returns the event type of the native event.
     * @returns {String} The event type.
     */

    return TP.eventGetType(this.getEvent());
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('getWindow',
function() {

    /**
     * @name getWindow
     * @synopsis Returns the window object that the native event occurred in.
     * @returns {Window} The window containing the source element that generated
     *     the event.
     */

    return TP.eventGetWindow(this.getEvent());
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('getNativeObject',
function() {

    /**
     * @name getNativeObject
     * @synopsis Returns the native object that the receiver is wrapping. In the
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
     * @name getResolvedTarget
     * @synopsis Returns the 'resolved target', the element that was resolved
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
     * @name getTarget
     * @synopsis Returns the target of the receiver's event.
     * @returns {Node} The target of event/signal.
     */

    return TP.eventGetTarget(this.getEvent());
});

//  ------------------------------------------------------------------------

TP.sig.DOMUISignal.Inst.defineMethod('setEvent',
function(normalizedEvent) {

    /**
     * @name setEvent
     * @synopsis Sets the native event which this signal instance represents.
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
     * @name shouldPrevent
     * @synopsis Returns true if the signal handler(s) should not perform the
     *     default action. If a flag is provided this flag is used to set the
     *     prevent status.
     * @param {Boolean} aFlag Whether or not the signal should perform the
     *     default action.
     * @returns {Boolean} Whether or not this signal is going to prevent the
     *     default action from happening.
     * @todo
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

//  ------------------------------------------------------------------------
//  COMMON SUBTYPES
//  ------------------------------------------------------------------------

//  ========================================================================
//  DOM Level 0 Event Signals
//  ========================================================================

TP.sig.DOMUISignal.defineSubtype('DOMAbort');
TP.sig.DOMAbort.Type.defineConstant('NATIVE_NAME', 'abort');

//  ---

TP.sig.DOMUISignal.defineSubtype('DOMBlur');
TP.sig.DOMBlur.Type.defineConstant('NATIVE_NAME', 'blur');

TP.sig.DOMBlur.Type.defineMethod('shouldLog',
function() {

    /**
     * @name shouldLog
     * @synopsis Returns true when the signal can be logged during signal
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

TP.sig.DOMFocus.Type.defineMethod('shouldLog',
function() {

    /**
     * @name shouldLog
     * @synopsis Returns true when the signal can be logged during signal
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

TP.sig.DOMUISignal.defineSubtype('DOMResize');
TP.sig.DOMResize.Type.defineConstant('NATIVE_NAME', 'resize');

//  ---

TP.sig.DOMUISignal.defineSubtype('DOMSubmit');
TP.sig.DOMSubmit.Type.defineConstant('NATIVE_NAME', 'submit');

//  ---

TP.sig.DOMUISignal.defineSubtype('DOMUnload');
TP.sig.DOMUnload.Type.defineConstant('NATIVE_NAME', 'unload');

//  ========================================================================
//  DOM Level 3 Event Signals
//  ========================================================================

//  This isn't the (now deprecated) DOMFocusIn taken from the XForms spec -
//  this is the TIBET signal wrapper for the (new) 'focusin' event as
//  specc'ed in DOM Level 3.
TP.sig.DOMUISignal.defineSubtype('DOMFocusIn');

TP.sig.DOMFocusIn.Type.defineAttribute('cancelable', false);

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
     * @name shouldLog
     * @synopsis Returns true when the signal can be logged during signal
     *     processing. At this level, this method returns whether TIBET should
     *     be logging 'TP.sig.DOMFocus' signals.
     * @returns {Boolean}
     */

    return TP.sys.shouldLogDOMFocusSignals();
});

//  ------------------------------------------------------------------------

//  This isn't the (now deprecated) DOMFocusOut taken from the XForms spec -
//  this is the TIBET signal wrapper for the (new) 'focusout' event as
//  specc'ed in DOM Level 3.
TP.sig.DOMUISignal.defineSubtype('DOMFocusOut');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

TP.sig.DOMFocusOut.Type.defineConstant('NATIVE_NAME', 'focusout');

//  DOMFocusOut initialization signals are *not* cancelable.
TP.sig.DOMFocusOut.Type.defineAttribute('cancelable', false);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.DOMFocusOut.Type.defineMethod('shouldLog',
function() {

    /**
     * @name shouldLog
     * @synopsis Returns true when the signal can be logged during signal
     *     processing. At this level, this method returns whether TIBET should
     *     be logging 'TP.sig.DOMFocus' signals.
     * @returns {Boolean}
     */

    return TP.sys.shouldLogDOMFocusSignals();
});

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
     * @name getSignalOwner
     * @synopsis Returns the Object or Type responsible for signals of this
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
     * @name getButton
     * @synopsis Returns a TIBET constant signifying which mouse button was
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
     * @name getClientX
     * @synopsis Returns the X coordinate of the signal relative to the window
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
     * @name getClientY
     * @synopsis Returns the Y coordinate of the signal relative to the window
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
     * @name getClientPoint
     * @synopsis Returns the X/Y TP.core.Point of the signal relative to the
     *     window containing the source element.
     * @returns {TP.core.Point} The X/Y point of the signal relative to its
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

TP.sig.DOMMouseSignal.Inst.defineMethod('getOffsetX',
function() {

    /**
     * @name getOffsetX
     * @synopsis Returns the X coordinate of the signal relative to the
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
     * @name getOffsetY
     * @synopsis Returns the Y coordinate of the signal relative to the
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
     * @name getOffsetPoint
     * @synopsis Returns the X/Y TP.core.Point of the signal relative to the
     *     containing source element.
     * @returns {TP.core.Point} The X/Y point of the signal relative to its
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
     * @name getPageX
     * @synopsis Returns the X coordinate of the signal relative to the page
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
     * @name getPageY
     * @synopsis Returns the Y coordinate of the signal relative to the page
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
     * @name getPagePoint
     * @synopsis Returns the X/Y TP.core.Point of the signal relative to the
     *     page containing the source element.
     * @returns {TP.core.Point} The X/Y point of the signal relative to its
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
     * @name getScreenX
     * @synopsis Returns the X coordinate of the signal relative to the video
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
     * @name getScreenY
     * @synopsis Returns the Y coordinate of the signal relative to the video
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
     * @name getScreenPoint
     * @synopsis Returns the X/Y TP.core.Point of the signal relative to the
     *     video screen
     * @returns {TP.core.Point} The X/Y point of the signal relative to its
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
     * @name getTransformedPoint
     * @synopsis Returns the X/Y TP.core.Point of the signal relative to the
     *     target element while taking into account any CSS transformations to
     *     that element.
     * @returns {TP.core.Point} The X/Y point of the signal relative to its
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
     * @name getRelatedTarget
     * @synopsis Returns the related target, the element the mouse is over now,
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
     * @name getRelatedTarget
     * @synopsis Returns the related target, the element the mouse is over now,
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
     * @name getRelatedTarget
     * @synopsis Returns the related target, the element the mouse is over now,
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
     * @name getRelatedTarget
     * @synopsis Returns the related target, the element the mouse was just over
     *     prior to the current event.
     * @returns {Element} The element the mouse was over.
     */

    return TP.eventGetRelatedTarget(this.getEvent());
});

//  ------------------------------------------------------------------------

TP.sig.DOMMouseOver.Inst.defineMethod('shouldPrevent',
function(aFlag) {

    /**
     * @name shouldPrevent
     * @synopsis Returns true if the signal handler(s) should not perform the
     *     default action. If a flag is provided this flag is used to set the
     *     prevent status.
     * @param {Boolean} aFlag yes or no?
     * @returns {Boolean}
     * @todo
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
     * @name shouldLog
     * @synopsis Returns true when the signal can be logged during signal
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
     * @name getDirection
     * @synopsis Returns the mouse wheel direction as either TP.UP or TP.DOWN
     *     depending on the specific delta direction.
     * @returns {TP.UP|TP.DOWN}
     */

    return (this.getWheelDelta() > 0) ? TP.UP : TP.DOWN;
});

//  ------------------------------------------------------------------------

TP.sig.DOMMouseWheel.Inst.defineMethod('getWheelDelta',
function() {

    /**
     * @name getWheelDelta
     * @synopsis Returns the mouse wheel delta value from a mouse wheel event.
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
     * @name setEvent
     * @synopsis Sets the 'native event' of the signal.
     * @param {Event} normalizedEvent The native event containing the signal's
     *     raw data.
     * @returns {TP.sig.DOMMouseHover} The receiver.
     */

    //  Call to supertype to set the event.
    this.callNextMethod();

    //  This is fake, but needed because TP.sig.DOMMouseHover signals reuse
    //  mouse move signals.
    normalizedEvent.$$type = 'mousehover';

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
     * @name getSignalOwner
     * @synopsis Returns the Object or Type responsible for signals of this
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
     * @name computeSignalName
     * @synopsis Computes the signal name. For key signals, the 'default' signal
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

TP.sig.DOMKeySignal.Inst.defineMethod('getKeyCode',
function() {

    /**
     * @name getKeyCode
     * @synopsis Returns the code of the key that was pressed to generate this
     *     key signal.
     * @returns {Number} The key code of the key that was pressed.
     */

    return TP.eventGetKeyCode(this.getEvent());
});

//  ------------------------------------------------------------------------

TP.sig.DOMKeySignal.Inst.defineMethod('getSignalNames',
function() {

    /**
     * @name getSignalNames
     * @synopsis Returns the 'signal names' to use when dispatching signals of
     *     this type.
     * @description TP.sig.DOMKeySignals have a bit of complexity when providing
     * their signal names. First, there is the 'virtual key' signal name (i.e.
     *     'TP.sig.DOM_b_Up', which is the default value. Next, there is
     *     (sometimes) a 'Unicode literal' signal name (i.e.
     *     'TP.sig.DOM_U0062_Up'). Lastly, there is the real type name of this
     *     signal (i.e. 'TP.sig.DOMKeyUp').
     * @returns {Array} An Array of signal names.
     */

    var unicodeSigName;

    if (TP.notEmpty(unicodeSigName = this.getUnicodeSignalName())) {
        return TP.ac(this.getSignalName(),
                        unicodeSigName,
                        this.getTypeName());
    }

    return TP.ac(this.getSignalName(), this.getTypeName());
});

//  ------------------------------------------------------------------------

TP.sig.DOMKeySignal.Inst.defineMethod('getUnicodeSignalName',
function() {

    /**
     * @name getUnicodeSignalName
     * @synopsis Returns the 'Unicode literal' signal name of the receiver.
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

TP.sig.DOMKeySignal.Inst.defineMethod('getVirtualKey',
function() {

    /**
     * @name getVirtualKey
     * @synopsis Returns the normalized virtual key name for the receiver's
     *     event.
     * @description For example, a TP.sig.DOMKeySignal with a keyCode of 13 will
     *     produce the identifier 'Enter'.
     * @returns {String} The virtual key name, such as 'Enter'.
     */

    return TP.core.Keyboard.getEventVirtualKey(this.getEvent());
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
     * @name getSignalNames
     * @synopsis Returns the 'signal names' to use when dispatching signals of
     *     this type.
     * @description Normally, DOMKeySignals return an Array of signal names that
     *     include both their signal name (which will correspond to a particular
     *     key) and the type name. But we want DOMKeyModifierChange signals to
     *     only return their type name so that observers have to observe this
     *     type name directly. If observers want to observe things like the
     *     Shift key going up, they should observe 'DOM_Shift_Up', etc. which
     *     will be sent directly as a result of the Shift key going up, not as a
     *     manufactured event like this one.
     * @returns {Array} An Array of signal names.
     */

    return TP.ac(this.getTypeName());
});

//  ------------------------------------------------------------------------

TP.sig.DOMModifierKeyChange.Inst.defineMethod('setEvent',
function(normalizedEvent) {

    /**
     * @name setEvent
     * @synopsis Sets the native event which this signal instance represents.
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

TP.sig.DOMDNDSignal.defineSubtype('DOMDNDTargetOver');
TP.sig.DOMDNDSignal.defineSubtype('DOMDNDTargetOut');

TP.sig.DOMDNDSignal.defineSubtype('DOMDNDCancelled');

TP.sig.DOMDNDSignal.defineSubtype('DOMDNDCompleted');
TP.sig.DOMDNDSignal.defineSubtype('DOMDNDFailed');
TP.sig.DOMDNDSignal.defineSubtype('DOMDNDSucceeded');

//  ========================================================================
//  GEOLOCATION SIGNALS
//  ========================================================================

TP.sig.Signal.defineSubtype('GeoLocationChanged');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.GeoLocationChanged.Type.defineMethod('getSignalOwner',
function() {

    /**
     * @name getSignalOwner
     * @synopsis Returns the Object or Type responsible for signals of this
     *     type.
     * @returns {Object|TP.lang.RootObject} The signal type's owner.
     */

    return TP.sys.getTypeByName('TP.core.Window');
});

//  ------------------------------------------------------------------------

//  ========================================================================
//  CSS MEDIA SIGNALS
//  ========================================================================

TP.sig.Signal.defineSubtype('CSSMediaChanged');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.CSSMediaChanged.Type.defineMethod('getSignalOwner',
function() {

    /**
     * @name getSignalOwner
     * @synopsis Returns the Object or Type responsible for signals of this
     *     type.
     * @returns {Object|TP.lang.RootObject} The signal type's owner.
     */

    return TP.sys.getTypeByName('TP.core.Window');
});

//  ------------------------------------------------------------------------

TP.sig.CSSMediaChanged.defineSubtype('CSSMediaActive');
TP.sig.CSSMediaChanged.defineSubtype('CSSMediaInactive');

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
TP.sig.ERROR.defineSubtype('InvalidContext');
TP.sig.ERROR.defineSubtype('InvalidDirectory');
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

TP.sig.InvocationSignal.defineSubtype('InvokeNext');
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
