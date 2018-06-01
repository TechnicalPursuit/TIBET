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
 * TIBETJobControl.js provides support for a unified "job control" model for
 *     your applications. A number of types in TIBET operate in conjuction with
 *     this job control mechanism so you can manage multiple "threads" of logic
 *     including animations, HTTP calls, XMPP polling, and more.
 */

//  ------------------------------------------------------------------------
//  JOB/STATUS TRAITS
//  ------------------------------------------------------------------------

/**
 * @type {TP.core.JobStatus}
 * @summary An abstract type, designed specifically to be mixed in to other
 *     types which want to use common process/job status functionality.
 * @description The most prevalent consumers of TP.core.JobStatus are
 *     TP.core.Job, TP.core.JobGroup, and TP.core.WorkflowSignal (which provides
 *     the common supertype for TP.sig.Requests and TP.sig.Responses). By
 *     traiting in this type those types are able to work with a common set of
 *     job control operations that help define or query job status.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.JobStatus');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation
TP.core.JobStatus.isAbstract(true);

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineAttribute('result');

TP.core.JobStatus.Inst.defineAttribute('faultCode');
TP.core.JobStatus.Inst.defineAttribute('faultText');
TP.core.JobStatus.Inst.defineAttribute('faultInfo');

TP.core.JobStatus.Inst.defineAttribute('statusCode');
TP.core.JobStatus.Inst.defineAttribute('statusText');

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('didCancel',
function() {

    /**
     * @method didCancel
     * @summary Returns true if the receiver's status code is TP.CANCELLED.
     * @returns {Boolean} Whether or not the job cancelled.
     */

    return this.get('statusCode') === TP.CANCELLED;
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('didComplete',
function() {

    /**
     * @method didComplete
     * @summary Returns true if the receiver is done processing, regardless of
     *     whether that's due to success or failure. You can use the didFail
     *     and/or didSucceed methods to check the final status.
     * @returns {Boolean} Whether or not the job completed.
     */

    var stat;

    stat = this.get('statusCode');

    switch (stat) {
        case TP.CANCELLED:
        case TP.ERRORED:
        case TP.FAILED:
        case TP.TIMED_OUT:
        case TP.SUCCEEDED:
        case TP.COMPLETED:
            return true;

        default:
            return false;
    }
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('didError',
function() {

    /**
     * @method didError
     * @summary Returns true if the receiver's status code represents an error
     *     status. Error and failure differ in that Error implies the job did
     *     not run correctly while failure implied correct execution but a
     *     failed outcome.
     * @returns {Boolean} Whether or not the job errored out.
     */

    return this.get('statusCode') === TP.ERRORED;
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('didFail',
function() {

    /**
     * @method didFail
     * @summary Returns true if the receiver's status code represents a failure
     *     status.
     * @returns {Boolean} Whether or not the job failed.
     */

    return this.get('statusCode') === TP.FAILED;
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('didSkip',
function() {

    /**
     * @method didSkip
     * @summary Returns true if the receiver's fault code represents a skipped
     *     job status meaning it was never really run.
     * @returns {Boolean} Whether or not the job was skipped.
     */

    return this.get('faultCode') === TP.SKIPPED;
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('didSucceed',
function() {

    /**
     * @method didSucceed
     * @summary Returns true if the receiver's status code reflects a
     *     successful completion without incurring any failures.
     * @returns {Boolean} Whether or not the job succeeded.
     */

    var stat;

    stat = this.get('statusCode');

    return stat === TP.SUCCEEDED || stat === TP.COMPLETED;
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('didTimeOut',
function() {

    /**
     * @method didTimeOut
     * @summary Returns true if the receiver's fault code represents a
     *     timed-out status.
     * @returns {Boolean} Whether or not the job timed out.
     */

    return this.get('faultCode') === TP.TIMED_OUT;
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('isActive',
function(aFlag) {

    /**
     * @method isActive
     * @summary Returns true if the receiver is still running in a TP.ACTIVE
     *     state.
     * @description Paused receivers and receivers that are waiting at TP.READY
     *     are not considered "active" by this test. Use isRunnable() to check
     *     for general runnability.
     * @param {Boolean} aFlag True to place the receiver into an active state.
     * @returns {Boolean} The current activity status.
     */

    if (TP.isBoolean(aFlag)) {
        this.set('statusCode', aFlag ? TP.ACTIVE : TP.READY);
    }

    /* eslint-disable no-extra-parens */
    return (this.get('statusCode') === TP.ACTIVE);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('isCancelling',
function() {

    /**
     * @method isCancelling
     * @summary Returns true if the receiver is in the process of being
     *     cancelled.
     * @returns {Boolean} The current activity status.
     */

    return this.get('statusCode') === TP.CANCELLING;
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('isCompleting',
function() {

    /**
     * @method isCompleting
     * @summary Returns true if the receiver is in the process of being
     *     completed. This may be due to either fail, cancel, or success
     *     processing.
     * @returns {Boolean} The current activity status.
     */

    var stat;

    stat = this.get('statusCode');

    switch (stat) {
        case TP.ERRORING:
        case TP.FAILING:
        case TP.CANCELLING:
        case TP.COMPLETING:
            return true;

        default:
            return false;
    }
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('isCompleted',
function() {

    /**
     * @method isCompleted
     * @summary Returns true if the receiver is done processing.
     * @description A true value doesn't mean success, just that the processing
     *     is finished. It may have been cancelled, failed, or completed
     *     properly. You can use the 'did*' methods to check the final status.
     * @returns {Boolean} Whether or not the job is done processing.
     */

    return this.didComplete();
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('isErroring',
function() {

    /**
     * @method isErroring
     * @summary Returns true if the receiver is in the process of being errored
     *     out due to an explicit error/exception.
     * @returns {Boolean} The current activity status.
     */

    return this.get('statusCode') === TP.ERRORING;
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('isFailing',
function() {

    /**
     * @method isFailing
     * @summary Returns true if the receiver is in the process of being failed
     *     due to an explicit error/exception.
     * @returns {Boolean} The current activity status.
     */

    return this.get('statusCode') === TP.FAILING;
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('isPaused',
function(aFlag) {

    /**
     * @method isPaused
     * @summary Combined setter/getter for whether the receiver is paused.
     *     Passing aFlag of true will set the receiver's state to TP.PAUSED.
     *     Passing false will return the state to TP.ACTIVE.
     * @param {Boolean} aFlag True to place the receiver into an active state.
     * @returns {Boolean} Whether or not the job is currently paused.
     */

    if (TP.isBoolean(aFlag)) {
        this.$set('statusCode', aFlag ? TP.PAUSED : TP.ACTIVE);
    }

    return this.get('statusCode') === TP.PAUSED;
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('isRunnable',
function() {

    /**
     * @method isRunnable
     * @summary Returns true if the receiver is in a state that would allow it
     *     to run, or to resume running. These states are TP.READY, TP.ACTIVE,
     *     and TP.PAUSED.
     * @returns {Boolean} Whether or not the job could be run.
     */

    var stat;

    stat = this.get('statusCode');

    switch (stat) {
        case TP.READY:
        case TP.ACTIVE:
        case TP.PAUSED:
            return true;

        default:
            return false;
    }
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('isSucceeding',
function() {

    /**
     * @method isSucceeding
     * @summary Returns true if the receiver is in the process of being failed
     *     due to an explicit error/exception.
     * @returns {Boolean} The current activity status.
     */

    return this.get('statusCode') === TP.SUCCEEDING;
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('cancel',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method cancel
     * @summary Tells the receiver to cancel, meaning it is being rescinded by
     *     the user or calling process. If the receiver has specific behavior to
     *     implement it should override the cancelJob() method invoked as part
     *     of this method's operation.
     * @param {String} aFaultString A string description of the fault.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the cancellation.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the cancellation.
     * @returns {TP.core.JobStatus} The receiver.
     */

    var code,
        text,
        info;

    //  avoid issues with perhaps calling this more than once
    if (this.isCompleting() || this.didComplete()) {
        return this;
    }

    //  TODO: setting undefined here may throw off reflection which depends on
    //  the difference to know what attributes are "known" vs. "unknown".
    this.set('result', undefined);
    this.set('statusCode', TP.CANCELLING);

    //  NB: This logic is duplicated in the 'cancel', 'error' and 'fail' methods
    //  because of problems with PhantomJS when factoring it into a common
    //  method.

    info = TP.hc(aFaultInfo);
    if (TP.isKindOf(aFaultString, 'TP.sig.Exception')) {
        code = TP.ifInvalid(aFaultCode, TP.CANCELLED);
        text = aFaultString.getMessage();
        info.atPut('error', aFaultString.getError());
    } else if (TP.isError(aFaultCode)) {
        code = TP.CANCELLED;
        if (TP.isEmpty(aFaultString)) {
            text = aFaultCode.message;
        } else {
            text = aFaultString;
        }
        info.atPut('error', aFaultCode);
    } else if (TP.isNumber(aFaultCode)) {
        code = aFaultCode;
        text = aFaultString;
    } else if (TP.isString(aFaultCode)) {
        if (TP.isEmpty(aFaultString)) {
            code = TP.CANCELLED;
            text = aFaultCode;
        } else {
            code = aFaultCode;
            text = aFaultString;
        }
    } else {
        code = TP.ifInvalid(aFaultCode, TP.CANCELLED);
        text = aFaultString;
    }

    this.set('faultCode', code);
    this.set('faultText', text);
    this.set('faultInfo', info);

    try {
        this.cancelJob(text, code, info);
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'Job completion error.')) : 0;
    } finally {
        this.set('statusCode', TP.CANCELLED);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('cancelJob',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method cancelJob
     * @summary Template method for processing to cancel a job/request.
     *     Override this method to provide custom job cancellation logic.
     * @param {String} aFaultString A string description of the fault.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the cancellation.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the cancellation.
     * @returns {TP.core.JobStatus} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('complete',
function(aResult) {

    /**
     * @method complete
     * @summary Tells the receiver to complete, meaning the receiver should do
     *     whatever finalization is necessary to reach the TP.SUCCEEDED state.
     *     If the receiver has specific behavior to implement it should override
     *     the completeJob() method invoked as part of this method's operation.
     * @param {Object} aResult An optional object to set as the result for the
     *     request.
     * @returns {TP.core.JobStatus} The receiver.
     */

    //  avoid issues with perhaps calling this more than once
    if (this.isCompleting() || this.didComplete()) {
        return this;
    }

    this.set('statusCode', TP.COMPLETING);

    //  if we got an argument, even when that argument was null or
    //  undefined, use that argument as the new result value.
    if (arguments.length > 0) {
        this.set('result', aResult);
    }

    try {
        if (TP.isDefined(aResult)) {
            this.completeJob(aResult);
        } else {
            this.completeJob();
        }
    } catch (e) {
        //  Make sure we don't think the job succeeded or bury the error.
        this.set('statusCode', TP.FAILED);
        this.set('result', e);

        TP.ifError() ?
            TP.error(TP.ec(e, 'Job completion error.')) : 0;
    } finally {
        //  have to check to see if we already have an failed or cancelled
        //  status since that means we can't set to a success status
        if (!this.isCompleted()) {
            this.set('statusCode', TP.SUCCEEDED);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('completeJob',
function(aResult) {

    /**
     * @method completeJob
     * @summary Template method for processing to complete a job/request.
     *     Override this method to provide custom job completion logic.
     * @param {Object} aResult An optional object to set as the result for the
     *     job/request.
     * @returns {TP.core.JobStatus} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('error',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method error
     * @summary Tells the receiver there was an error in job processing.
     * @param {String} aFaultString A string description of the error.
     * @param {Object} aFaultCode A code providing additional information on
     *     specific nature of the error. Often an exception or Error object.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the error.
     * @returns {TP.core.JobStatus} The receiver.
     */

    var code,
        text,
        info;

    //  avoid issues with perhaps calling this more than once...but allow a
    //  failure that comes in async after the job may believe it finished to
    //  override a "success" status.
    if (this.isCompleting() || this.didComplete()) {
        if (!this.isSucceeding() && !this.didSucceed()) {
            return this;
        }
    }

    this.set('result', undefined);
    this.set('statusCode', TP.ERRORING);

    //  NB: This logic is duplicated in the 'cancel', 'error' and 'fail' methods
    //  because of problems with PhantomJS when factoring it into a common
    //  method.

    info = TP.hc(aFaultInfo);
    if (TP.isKindOf(aFaultString, 'TP.sig.Exception')) {
        code = TP.ifInvalid(aFaultCode, TP.ERRORED);
        text = aFaultString.getMessage();
        info.atPut('error', aFaultString.getError());
    } else if (TP.isError(aFaultCode)) {
        code = TP.ERRORED;
        if (TP.isEmpty(aFaultString)) {
            text = aFaultCode.message;
        } else {
            text = aFaultString;
        }
        info.atPut('error', aFaultCode);
    } else if (TP.isNumber(aFaultCode)) {
        code = aFaultCode;
        text = aFaultString;
    } else if (TP.isString(aFaultCode)) {
        if (TP.isEmpty(aFaultString)) {
            code = TP.ERRORED;
            text = aFaultCode;
        } else {
            code = aFaultCode;
            text = aFaultString;
        }
    } else {
        code = TP.ifInvalid(aFaultCode, TP.ERRORED);
        text = aFaultString;
    }

    this.set('faultCode', code);
    this.set('faultText', text);
    this.set('faultInfo', info);

    try {
        this.errorJob(text, code, info);
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'Job completion error.')) : 0;
    } finally {
        this.set('statusCode', TP.ERRORED);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('errorJob',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method errorJob
     * @summary Template method for job/request error processing. Override
     *     this method to provide custom job error logic.
     * @param {String} aFaultString A string description of the fault.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the error.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the error.
     * @returns {TP.core.JobStatus} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('fail',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method fail
     * @summary Tells the receiver to fail, meaning it failed due to some form
     *     of exception. If the receiver has specific behavior to implement it
     *     should override the failJob method invoked as part of this method's
     *     operation.
     * @param {String} aFaultString A string description of the fault.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the failure.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the failure.
     * @returns {TP.core.JobStatus} The receiver.
     */

    var code,
        text,
        info;

    //  failure that comes in async after the job may believe it finished to
    //  override a "success" status.
    if (this.isCompleting() || this.didComplete()) {
        if (!this.isSucceeding() && !this.didSucceed()) {
            return this;
        }
    }

    this.set('result', undefined);
    this.set('statusCode', TP.FAILING);

    //  NB: This logic is duplicated in the 'cancel', 'error' and 'fail' methods
    //  because of problems with PhantomJS when factoring it into a common
    //  method.

    info = TP.hc(aFaultInfo);
    if (TP.isKindOf(aFaultString, 'TP.sig.Exception')) {
        code = TP.ifInvalid(aFaultCode, TP.FAILED);
        text = aFaultString.getMessage();
        info.atPut('error', aFaultString.getError());
    } else if (TP.isError(aFaultCode)) {
        code = TP.FAILED;
        if (TP.isEmpty(aFaultString)) {
            text = aFaultCode.message;
        } else {
            text = aFaultString;
        }
        info.atPut('error', aFaultCode);
    } else if (TP.isNumber(aFaultCode)) {
        code = aFaultCode;
        text = aFaultString;
    } else if (TP.isString(aFaultCode)) {
        if (TP.isEmpty(aFaultString)) {
            code = TP.FAILED;
            text = aFaultCode;
        } else {
            code = aFaultCode;
            text = aFaultString;
        }
    } else {
        code = TP.ifInvalid(aFaultCode, TP.FAILED);
        text = aFaultString;
    }

    this.set('faultCode', code);
    this.set('faultText', text);
    this.set('faultInfo', info);

    try {
        this.failJob(text, code, info);
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, 'Job completion error.')) : 0;
    } finally {
        this.set('statusCode', TP.FAILED);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('failJob',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method failJob
     * @summary Template method for job/request failure processing. Override
     *     this method to provide custom job failure logic.
     * @param {String} aFaultString A string description of the fault.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the failure.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the failure.
     * @returns {TP.core.JobStatus} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('getFaultCode',
function() {

    /**
     * @method getFaultCode
     * @summary Returns the fault code of the receiver.
     * @returns {Number} A TIBET fault code constant.
     */

    // TODO: direct slot access?
    if (TP.notDefined(this.faultCode)) {
        this.getType().Inst.defineAttribute('faultCode');
    }

    return this.$get('faultCode');
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('getFaultInfo',
function() {

    /**
     * @method getFaultInfo
     * @summary Returns the fault info of the receiver.
     * @returns {TP.core.Hash} A hash that will contain additional information
     *     about the failure.
     */

    // TODO: direct slot access?
    if (TP.notDefined(this.faultInfo)) {
        this.getType().Inst.defineAttribute('faultInfo');
    }

    return this.$get('faultInfo');
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('getFaultText',
function() {

    /**
     * @method getFaultText
     * @summary Returns the fault string (description) of the receiver.
     * @returns {String} A text description of the fault.
     */

    // TODO: direct slot access?
    if (TP.notDefined(this.faultText)) {
        this.getType().Inst.defineAttribute('faultText');
    }

    return this.$get('faultText');
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('getStatusCode',
function() {

    /**
     * @method getStatusCode
     * @summary Returns the job status code of the receiver.
     * @returns {Number} A TIBET status code constant.
     */

    // TODO: direct slot access?
    if (TP.notDefined(this.statusCode)) {
        this.getType().Inst.defineAttribute('statusCode', TP.READY);
    }

    return this.$get('statusCode');
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('getStatusText',
function() {

    /**
     * @method getStatusText
     * @summary Returns the job status of the receiver in text form.
     * @returns {String} The current status in text form.
     */

    // TODO: direct slot access?
    if (TP.notDefined(this.statusText)) {
        this.getType().Inst.defineAttribute('statusText', TP.READY);
    }

    return this.$get('statusText');
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('pause',
function() {

    /**
     * @method pause
     * @summary Pauses the receiver if that operation is supportable by the
     *     particular type.
     * @description Not all receivers of the pause operation are able to pause
     *     effectively (XMLHttpRequest for example), but the job does enter the
     *     TP.PAUSED state as a result of this method.
     * @returns {TP.core.JobStatus} The receiver.
     */

    //  minimum is to set the status code so the job looks paused from a
    //  state perspective
    this.isPaused(true);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('reset',
function() {

    /**
     * @method reset
     * @summary Resets the receiver, returning it to its initial state.
     * @returns {TP.core.JobStatus} The receiver.
     */

    //  clear status code back to original
    this.set('statusCode', TP.READY);

    //  clear failure/fault code back to original
    this.set('faultCode', null);
    this.set('faultText', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('resume',
function() {

    /**
     * @method resume
     * @summary Resumes a paused receiver, if it was actually paused.
     * @description Not all receivers can pause effectively and may ignore this
     *     call along with the pause() call itself. If the job was in a
     *     TP.PAUSED state however, this call will return it to the TP.ACTIVE
     *     state.
     * @returns {TP.core.JobStatus} The receiver.
     */

    //  return to TP.ACTIVE if we were paused
    if (this.isPaused()) {
        this.isPaused(false);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JobStatus.Inst.defineMethod('start',
function(parameters) {

    /**
     * @method start
     * @summary Starts the receiver in "job control" terms. This is the
     *     standard entry point method for activating a receiver relative to the
     *     job control subsystem. One specific effect of this call is that the
     *     job will enter the TP.ACTIVE state.
     * @param {TP.core.Hash} parameters A hash of parameters the job function(s)
     *     can access.
     * @returns {TP.core.JobStatus} The receiver.
     */

    this.isActive(true);

    return this;
});

//  ------------------------------------------------------------------------
//  JOB/PROCESS SUPPORT
//  ------------------------------------------------------------------------

/**
 * @type {TP.core.Job}
 * @summary TP.core.Job provides support for operations consisting of a
 *     sequence of asynchronous calls which follow a scheduling algorithm. In
 *     addition, TP.core.Job instances are tracked by TIBET so you can view and
 *     manage them from a central "process list".
 * @description Job instances are essentially scheduling/control objects that
 *     help you run one or more "work functions" in a particular way. The
 *     primary goal of TP.core.Job is to provide you with a way to run these
 *     work functions with optional pre/post functions and to manage their
 *     scheduling (delay, interval, limit, and repeat count) using more powerful
 *     models than a pure setInterval() or setTimeout() sequence. A secondary
 *     goal is to allow TP.core.Jobs to form the basis for doing "asynchronous
 *     perform" operations that iterate over a collection while yielding to the
 *     display thread after each item. For speed purposes, all ivars in the
 *     following methods are referenced by a 'direct' reference, using their
 *     low-level names: getActiveTime() getElapsedTime() getPauseTime()
 *     getPercentComplete() getProjectedTime() getStepValue() isLimited()
 *     $iterate() $work()
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.Job');

//  add job status code support.
TP.core.Job.addTraits(TP.core.JobStatus);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  all of the keys used for the 'control parameters'. Note that not all of
//  these might be used by the core TP.core.Job machinery, but might be
//  there for other users of TP.core.Jobs, such as animation.
TP.core.Job.Type.defineConstant('CONTROL_PARAM_KEYS',
    TP.ac('config',
            'pre', 'step', 'post',
            'compute', 'delay', 'interval', 'lastInterval',
            'limit', 'count',
            'freeze', 'preserve', 'restore',
            'stats',
            'isAnimation'));

//  ------------------------------------------------------------------------
//  STEP COMPUTE FUNCTIONS
//  ------------------------------------------------------------------------

/*
Animation-like step operations often use different computation functions to
determine the next step's value. A number of these computation routines are
included here to support the most common computations for iteration and
animation. Which compute function is used is based on the 'compute' function
supplied to the job during construction. Note that as a result a particular
job instance is preconfigured to operate in a certain fashion with only the
actual value data (i.e. from, to, or list) varying with each start call.
*/

//  ------------------------------------------------------------------------
//  VALUES array computations
//  ---

TP.core.Job.Type.defineConstant('ITERATION_INDEX_COMPUTE',
function(job, params) {

    /**
     * @method TP.core.Job.ITERATION_INDEX_COMPUTE
     * @summary Returns the proper value from a collection based on the current
     *     job iteration number. The values are assumed to be in a step
     *     parameter set under the key 'values'.
     * @param {TP.core.Job} job The job instance.
     * @param {TP.core.Hash} params The step parameter data for the job.
     * @returns {Object} The object at the computed index.
     */

    var values,
        index;

    values = params.at('values');
    index = job.get('iteration');

    return values.at(index.min(values.getSize() - 1));  //  don't overrun
});

//  ------------------------------------------------------------------------

TP.core.Job.Type.defineConstant('PERCENTAGE_INDEX_COMPUTE',
function(job, params) {

    /**
     * @method TP.core.Job.PERCENTAGE_INDEX_COMPUTE
     * @summary Returns the proper value from a collection based on the current
     *     percentage of job completion. The values are assumed to be in a step
     *     parameter set under the key 'values'.
     * @param {TP.core.Job} job The job instance.
     * @param {TP.core.Hash} params The step parameter data for the job.
     * @returns {Object} The object at the computed index.
     */

    var percent,
        values,
        index;

    //  jobs can run in a variety of forms, so percent complete is better
    //  left to the job than to us
    percent = job.getPercentComplete();

    values = params.at('values');
    index = (values.getSize() * percent).floor();   //  0 indexed so floor

    return values.at(index.min(values.getSize() - 1));  //  don't overrun
});

//  ------------------------------------------------------------------------
//  FROM/TO computations
//  ---

TP.core.Job.Type.defineConstant('LINEAR_COMPUTE',
function(job, params) {

    /**
     * @method TP.core.Job.LINEAR_COMPUTE
     * @summary Returns the proper value between two values ('from' and 'to')
     *     based on current percentage of job completion as computed by a simple
     *     linear algorithm.
     * @param {TP.core.Job} job The job instance.
     * @param {TP.core.Hash} params The step parameter data for the job.
     * @returns {Number} The computed value.
     */

    var percent,
        delta;

    //  jobs can run in a variety of forms, so percent complete is better
    //  left to the job than to us
    percent = job.getPercentComplete();

    //  note that we need a from/to for this model
    delta = params.at('delta');

    /* eslint-disable no-extra-parens */
    return (percent * delta) + params.at('from');
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------
//  INTERVAL FUNCTIONS
//  ------------------------------------------------------------------------

/*
Pre-built options for decaying (aka increasing) the scheduling interval or
performing other "recomputation" of the interval.
*/

//  ------------------------------------------------------------------------

TP.core.Job.Type.defineConstant('DOUBLE_DECAY',
function(aJob) {

    /**
     * @method DOUBLE_DECAY
     * @summary Returns a value which doubles the last delay time with each
     *     invocation. This will cause delays to increase quickly.
     * @param {TP.core.Job} aJob An instance whose processing data may be used
     *     to feed the computation of a new delay time.
     * @returns {Number} A computed delay time.
     */

    return aJob.get('maxInterval').min(aJob.get('lastInterval') * 2);
});

//  ------------------------------------------------------------------------

TP.core.Job.Type.defineConstant('DOUBLE_ON_FAILURE',
function(aJob) {

    /**
     * @method DOUBLE_ON_FAILURE
     * @summary Returns a value which doubles the last delay time with each
     *     unsuccessful invocation. On success it will set the job back to the
     *     firstInterval value.
     * @param {TP.core.Job} aJob An instance whose processing data may be used
     *     to feed the computation of a new delay time.
     * @returns {Number} A computed delay time.
     */

    if (aJob.get('wasSuccessful')) {
        return aJob.get('firstInterval');
    } else {
        return aJob.get('maxInterval').min(aJob.get('lastInterval') * 2);
    }
});

//  ------------------------------------------------------------------------

TP.core.Job.Type.defineConstant('SIMPLE_DECAY',
function(aJob) {

    /**
     * @method SIMPLE_DECAY
     * @summary Returns a value which grows slowly over time by adding 1 second
     *     to the delay with each iteration.
     * @param {TP.core.Job} aJob An instance whose processing data may be used
     *     to feed the computation of a new delay time.
     * @returns {Number} A computed delay time.
     */

    return aJob.get('maxInterval').min(aJob.get('lastInterval') + 1000);
});

//  ------------------------------------------------------------------------

TP.core.Job.Type.defineConstant('SIMPLE_ON_FAILURE',
function(aJob) {

    /**
     * @method SIMPLE_ON_FAILURE
     * @summary Returns a value which grows slowly over time by adding 1 second
     *     to the delay with each unsuccessful invocation. On success it will
     *     set the job back to the firstInterval value.
     * @param {TP.core.Job} aJob An instance whose processing data may be used
     *     to feed the computation of a new delay time.
     * @returns {Number} A computed delay time.
     */

    if (aJob.get('wasSuccessful')) {
        return aJob.get('firstInterval');
    } else {
        return aJob.get('maxInterval').min(aJob.get('lastInterval') + 1000);
    }
});

//  ------------------------------------------------------------------------

TP.core.Job.Type.defineConstant('ZERO_DECAY',
function(aJob) {

    /**
     * @method ZERO_DECAY
     * @summary Returns a value which doesn't vary from the job's current delay
     *     times.
     * @param {TP.core.Job} aJob An instance whose processing data may be used
     *     to feed the computation of a new delay time.
     * @returns {Number} A computed delay time.
     */

    return aJob.get('lastInterval');
});

//  ------------------------------------------------------------------------
//  LIMIT FUNCTIONS
//  ------------------------------------------------------------------------

/*
Pre-built functions for limiting the job's execution count or run time.
*/

//  ------------------------------------------------------------------------

TP.core.Job.Type.defineConstant('ONCE',
function(aJob) {

    /**
     * @method ONCE
     * @summary Returns true if the job 'isLimited' and should stop. For the
     *     ONCE model this test checks the job's iteration count.
     * @param {TP.core.Job} aJob An instance whose processing data may be used
     *     to feed the computation.
     * @returns {Boolean} True if the job is limited and should stop.
     */

    //  NOTE that we test for 0 here since the first iteration is #0 to
    //  support indexing via iteration
    /* eslint-disable no-extra-parens */
    return (aJob.get('iteration') > 0);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.core.Job.Type.defineConstant('UNTIL_FAILURE',
function(aJob) {

    /**
     * @method UNTIL_FAILURE
     * @summary Returns true if the job 'isLimited' and should stop. For
     *     UNTIL_FAILURE this returns true when the job's wasSuccessful flag is
     *     false.
     * @param {TP.core.Job} aJob An instance whose processing data may be used
     *     to feed the computation.
     * @returns {Boolean} True if the job is limited and should stop.
     */

    return TP.isFalse(aJob.get('wasSuccessful'));
});

//  ------------------------------------------------------------------------

TP.core.Job.Type.defineConstant('UNTIL_SUCCESS',
function(aJob) {

    /**
     * @method UNTIL_SUCCESS
     * @summary Returns true if the job 'isLimited' and should stop. For
     *     UNTIL_SUCCESS this returns true when the job's wasSuccessful flag is
     *     true.
     * @param {TP.core.Job} aJob An instance whose processing data may be used
     *     to feed the computation.
     * @returns {Boolean} True if the job is limited and should stop.
     */

    return TP.isTrue(aJob.get('wasSuccessful'));
});

//  ------------------------------------------------------------------------

//  FOREVER is just the same as returning false.
TP.core.Job.Type.defineConstant('FOREVER', TP.RETURN_FALSE);

//  ------------------------------------------------------------------------
//  WORK FUNCTIONS
//  ------------------------------------------------------------------------

/*
Pre-built work functions which perform a task with the current step value.
*/

//  ------------------------------------------------------------------------

TP.core.Job.Type.defineConstant('LOG_STEP_PARAMS',
function(aJob, params) {

    /**
     * @method LOG_STEP_PARAMS
     * @summary Logs the current step parameters for the job. This is a useful
     *     debugging step to add to your job when experiencing problems getting
     *     a task to run.
     * @param {TP.core.Job} aJob An instance whose processing data may be used
     *     to feed the computation.
     * @returns {Boolean} True on success.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.core.Job.Type.defineConstant('LOG_STEP_VALUE',
function(aJob) {

    /**
     * @method LOG_STEP_VALUE
     * @summary Logs the current step value for the job. This is a useful
     *     debugging job that is the default when no function is provided. You
     *     can also add this to a list of step functions to get the overall job
     *     to log the value at each step.
     * @param {TP.core.Job} aJob An instance whose processing data may be used
     *     to feed the computation.
     * @returns {Boolean} True on success.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.core.Job.Type.defineConstant('PUSH_STEP_VALUE',
function(aJob) {

    /**
     * @method PUSH_STEP_VALUE
     * @summary Pushes the current step value for the job into the job's $steps
     *     array. This is a useful debugging job that is the default when no
     *     function is provided. You can also add this to a list of step
     *     functions to get the overall job to log the value at each step.
     * @param {TP.core.Job} aJob An instance whose processing data may be used
     *     to feed the computation.
     * @returns {Boolean} True on success.
     */

    aJob.$steps = aJob.$steps || TP.ac();
    aJob.$steps.push(aJob.getStepValue());

    return true;
});

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  the last PID used for a job instance
TP.core.Job.Type.defineAttribute('lastPID', 0);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.Job.Type.defineMethod('construct',
function(controlParams) {

    /**
     * @method construct
     * @summary Constructs and returns a new instance of the receiver. For a
     *     TP.core.Job this method also ensures that each new instance gets a
     *     unique PID and that it's properly registered with TIBET.
     * @param {TP.core.Hash|TP.sig.Request} controlParams An object which
     *     contains one or more keys defining job configuration. See init() for
     *     more info.
     * @returns {TP.core.Job} A new instance.
     */

    var inst;

    //  make sure it's a proper "request"
    if (!TP.canInvoke(controlParams, 'atIfInvalid')) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  get a clean instance prepared
    inst = this.callNextMethod();

    //  force creation of a new PID and assign it to the instance
    inst.set('PID', this.getPID());

    return inst;
});

//  ------------------------------------------------------------------------

TP.core.Job.Type.defineMethod('getPID',
function() {

    /**
     * @method getPID
     * @summary Returns the next PID to use for an instance.
     * @returns {Number} A new PID.
     */

    var pid;

    pid = this.get('lastPID') + 1;
    this.$set('lastPID', pid);

    return pid;
});

//  ------------------------------------------------------------------------

TP.core.Job.Type.defineMethod('scheduleInvokerJob',
function(anObjectArray, aMethodArray, aParamArray) {

    /**
     * @method scheduleInvokerJob
     * @summary Schedules a job with the system that invokes each of the
     *     supplied methods on the supplied objects using parameters given in
     *     the parameters Array.
     * @param {Object[]} anObjectArray The Array of target objects to invoke the
     *     methods against.
     * @param {String[]} aMethodArray The Array of method names to invoke against
     *     each target object.
     * @param {Object[]} aParamArray The Array of parameters to use when invoking
     *     the methods.
     * @returns {TP.core.Job} The receiver.
     */

    var invokerFunc,
        params;

    //  Can't proceed without an Array of objects or methods
    if (!TP.isArray(anObjectArray) || !TP.isArray(aMethodArray)) {
        return this.raise('TP.sig.InvalidArray');
    }

    params = aParamArray;
    if (TP.notValid(params)) {
        params = TP.ac();
    }

    //  Construct an 'invoker function' that will invoke one method per one
    //  object for each run of the invocation.
    invokerFunc =
        function() {

            var target,
                idx,
                result;

            //  If the methodIndex has reached the size of the method array,
            //  then we 'go on to the next object' and reset the method
            //  index to 0
            if (invokerFunc.methodIndex === invokerFunc.methodArray.getSize()) {
                target = invokerFunc.objArray.shift();
                invokerFunc.methodIndex = 0;
            } else {
                target = invokerFunc.objArray.first();
            }

            //  Attempt to invoke the method against the object, supplying
            //  the params Array in an apply invocation.
            try {
                idx = invokerFunc.methodIndex;

                result = target[invokerFunc.methodArray.at(idx)].apply(
                            target, invokerFunc.paramArray);

                TP.ifInfo() ? TP.info(result) : 0;

                //  Increment the method index to go on to the next method.
                invokerFunc.methodIndex++;
            } catch (e) {
                TP.ifError() ?
                    TP.error(TP.ec(e, 'Error in invocation.')) : 0;

                invokerFunc.stopTest = true;
            }
        };

    //  We put the object, method and params Arrays on the invoker function
    //  itself in case this gets called recursively. Can't used closured
    //  variables.
    invokerFunc.objArray = anObjectArray.copy();
    invokerFunc.methodArray = aMethodArray;
    invokerFunc.paramArray = params;

    //  For the first time around, we set the methodIndex to the size of the
    //  methods Array. See the invoker function above for the logic about
    //  why we do this.
    invokerFunc.methodIndex = aMethodArray.getSize();
    invokerFunc.stopTest = false;

    //  schedule a job to invoke the invokerFunc
    TP.schedule(TP.hc(
                'step', invokerFunc,
                'interval', 50, //  repeat every 50ms
                'limit',
                function(aJob) {

                    //  If the array of objects is empty or someone set the
                    //  'stopTest' flag on the invoker function, stop now.
                    if (TP.isEmpty(invokerFunc.objArray) ||
                        invokerFunc.stopTest) {
                        return true;
                    }

                    return false;
                }));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Job.Type.defineMethod('splitParams',
function(allParams) {

    /**
     * @method splitParams
     * @summary Splits the supplied params into two TP.core.Hashes, one
     *     containing the control parameters and the other containing the step
     *     parameters.
     * @description This method takes all entries from the supplied params hash
     *     that have keys matching those listed in CONTROL_PARAM_KEYS and places
     *     those in the control parameters hash. All remaining parameters will
     *     be in the step parameters hash (including those not strictly listed
     *     as step parameters in TP.core.Job).
     * @param {TP.core.Hash|TP.sig.Request} allParams An object which contains
     *     one or more keys defining job configuration. See init() for more
     *     info.
     * @returns {Array<TP.core.Hash,TP.core.Hash>} The Array containing
     *     ctrlParamsHash and stepParamsHash.
     */

    var ctrlParams,
        stepParams;

    ctrlParams = allParams.copy(TP.core.Job.CONTROL_PARAM_KEYS);
    stepParams = allParams.copy().removeKeys(
                                        TP.core.Job.CONTROL_PARAM_KEYS);

    return TP.ac(ctrlParams, stepParams);
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  the job's process ID from a TIBET perspective. this goes up with each
//  job constructed and allows TIBET to find jobs by ID. Note that a job's
//  ID may not change in response to reset operations.
TP.core.Job.Inst.defineAttribute('PID');

//  run start time. used in computing percentage complete etc.
TP.core.Job.Inst.defineAttribute('runstart');

//  overall job start time, when the first run of the job started
TP.core.Job.Inst.defineAttribute('started');

//  end time for the entire job, when the last run completed/terminated
TP.core.Job.Inst.defineAttribute('ended');

//  used to compute drift based on anticipated time for next step start
TP.core.Job.Inst.defineAttribute('expected', 0);
TP.core.Job.Inst.defineAttribute('lastExpected', 0);

TP.core.Job.Inst.defineAttribute('firstInterval',
                                TP.sys.cfg('job.interval'));
TP.core.Job.Inst.defineAttribute('lastInterval',
                                TP.sys.cfg('job.interval'));
TP.core.Job.Inst.defineAttribute('maxInterval',
                                TP.sys.cfg('job.max_interval'));

//  the last computed offset value used to adjust timing next invocation
TP.core.Job.Inst.defineAttribute('lastOffset', 0);

//  an offset to help track how long it appears the work function takes
TP.core.Job.Inst.defineAttribute('workOffset', 0);

//  pause control variables. last paused at (Date), currently paused, total
//  delay due to pauses, and values of compute vars at time of last pause
TP.core.Job.Inst.defineAttribute('lastPaused');
TP.core.Job.Inst.defineAttribute('totalPause', 0);

//  control values for processing/scheduling
TP.core.Job.Inst.defineAttribute('count', 1);           //  requested count
TP.core.Job.Inst.defineAttribute('totalcount', 1);      //  termination count
TP.core.Job.Inst.defineAttribute('runs', 1);            //  outer count so far
TP.core.Job.Inst.defineAttribute('iteration', 0);       //  run iteration

TP.core.Job.Inst.defineAttribute('delay', TP.sys.cfg('job.delay'));
TP.core.Job.Inst.defineAttribute('$delayms');

TP.core.Job.Inst.defineAttribute('limit', TP.core.Job.ONCE); // one iteration
TP.core.Job.Inst.defineAttribute('$limitms');

TP.core.Job.Inst.defineAttribute('interval', TP.sys.cfg('job.interval'));
TP.core.Job.Inst.defineAttribute('$intervalms');

TP.core.Job.Inst.defineAttribute('parameters');         //  'step' parameters

//  was the last segment successful in its work? this is captured to help
//  certain kinds of polling algorithms compute new intervals, or certain
//  kinds of limit functions operate (run until success) etc.
TP.core.Job.Inst.defineAttribute('wasSuccessful', false);

//  the component function(s)
TP.core.Job.Inst.defineAttribute('config');         //  one-time configuration
TP.core.Job.Inst.defineAttribute('pre');            //  pre-run setup
TP.core.Job.Inst.defineAttribute('post');           //  post-run teardown
TP.core.Job.Inst.defineAttribute('step');           //  the job's real work

//  a handle to the compute function, which must be supplied or it will
//  default to a linear computation that assumes a from/to parameter set
TP.core.Job.Inst.defineAttribute('compute');

//  a handle to the actual work function, a function built to invoke the
//  various functional elements of the job. typically built by the job.
TP.core.Job.Inst.defineAttribute('work');

//  the interval and timer which may be used to drive the job
TP.core.Job.Inst.defineAttribute('$useHeartbeat', false);
TP.core.Job.Inst.defineAttribute('$heartbeat');
TP.core.Job.Inst.defineAttribute('$timer');

//  whether or not to use 'requestAnimationFrame()' to drive the job
TP.core.Job.Inst.defineAttribute('$useRAF', false);

//  the time the last work was done. used for heartbeat sequencing to make
//  sure heartbeat doesn't run faster than the defined interval
TP.core.Job.Inst.defineAttribute('$lastWork');

//  a work invocation function that binds the work method to the instance
TP.core.Job.Inst.defineAttribute('$timedWork');

//  debugging / tuning data
TP.core.Job.Inst.defineAttribute('$stats');
TP.core.Job.Inst.defineAttribute('$steps');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('init',
function(controlParams) {

    /**
     * @method init
     * @summary Initializes new job instances and returns them for use.
     * @description The resulting job can be run multiple times with different
     *     execution data by passing a set of step parameters to the start()
     *     function. The jobs control parameters are fixed by this call, but can
     *     be adjusted using standard set methods on the job instance before
     *     each start() call.
     *
     *     The 'controlParams' hash can contain keys that control the job. It
     *     can have the following keys:
     *
     *     'config' A function to run to do any final job setup such as setting
     *     default values. 'pre' A function to run once before any step work is
     *     done. 'step' The "step" function, which does the actual processing of
     *     each iteration. 'post' A function to run during shutdown after all
     *     step iterations complete. 'compute' A function used to compute the
     *     next value for a step. 'delay' A millisecond delay before steps are
     *     processed. 'interval' A millisecond interval between each step
     *     iteration, or a function to compute it. 'lastInterval' A millisecond
     *     interval to start with when using an interval function. 'limit' A
     *     function returning true if the job/step has reached its limit, or a
     *     number defining the maximum number of times the step function(s)
     *     should be invoked per job, or a string defining an xs:duration for
     *     maximum time for the job to run. 'count' Number of times to repeat
     *     the entire job. Default is 1. 'stats' Boolean defining whether we
     *     want job statistics to be gathered.
     *
     *
     * @param {TP.core.Hash|TP.sig.Request} controlParams A hash of control
     *     parameters that control the job.
     * @returns {TP.core.Job} A new instance.
     */

    var paramVal,

        step,
        thisref;

    //  construct the instance and grab a reference we can close around
    //  below
    this.callNextMethod();

    //  Make sure to set this first, since some of the 'setters' below rely on
    //  this setting.
    if (TP.isTrue(controlParams.at('isAnimation'))) {
        this.$set('$useRAF', true);
    }

    //  note the use of standard set() call here to trigger setters. this
    //  lets us push the resolution logic for these values into those
    //  methods where they can be defined/encached for better runtime
    //  performance

    //  Can't use the atIfInvalid() method here because it wants to run
    //  Function objects supplied as defaults.
    if (TP.notValid(paramVal = controlParams.at('delay'))) {
        paramVal = TP.sys.cfg('job.delay');
    }
    this.set('delay', paramVal);

    if (TP.notValid(paramVal = controlParams.at('interval'))) {
        paramVal = TP.sys.cfg('job.interval');
    }
    this.set('interval', paramVal);

    if (TP.notValid(paramVal = controlParams.at('firstInterval'))) {
        paramVal = TP.sys.cfg('job.interval');
    }
    this.set('firstInterval', paramVal);
    this.set('lastInterval', paramVal);

    if (TP.notValid(paramVal = controlParams.at('maxInterval'))) {
        paramVal = TP.sys.cfg('job.max_interval');
    }
    this.set('maxInterval', paramVal);

    if (TP.notValid(paramVal = controlParams.at('limit'))) {
        paramVal = TP.core.Job.ONCE;
    }
    this.set('limit', paramVal);

    //  how many times do we run the job? normally just once. we set two
    //  values here to manage being able to shut down a multi-run job on a
    //  run boundary cleanly. see complete/shutdown for more
    this.$set('count', controlParams.atIfInvalid('count', 1), false);
    this.$set('totalcount', controlParams.atIfInvalid('count', 1), false);

    //  the compute function should be available now, otherwise default.
    //  NOTE that you can't use atIfInvalid to assign a function value since
    //  it will try to run the function...so we work around that here
    this.$set('compute', controlParams.at('compute'), false);

    //  pre/post and config function hooks
    this.$set('pre', controlParams.at('pre'), false);
    this.$set('post', controlParams.at('post'), false);
    this.$set('config', controlParams.at('config'), false);

    //  make sure we have processing logic in place before we try to build
    //  the work function
    step = controlParams.at('step');
    if (!TP.canInvoke(step, 'apply')) {
        //  use default for this type of job's instances
        step = this.$get('step');
    } else {
        //  store provided step(s) for reference
        this.$set('step', step, false);
    }

    //  allow for the possibility that the construct() call may have built a
    //  custom work function for us...or the consumer may have, and try to
    //  set the work function from that parameter. If not found the
    //  setWork() call will build us one...
    this.set('work', controlParams.at('work'));

    //  build a function we can use repeatedly for queueing the work
    thisref = this;
    this.$timedWork = function() {
        thisref.$work();
    };

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('$clearScheduler',
function() {

    /**
     * @method $clearScheduler
     * @summary Clears the internal timer and/or heartbeat scheduling used by
     *     this job. Normally invoked by the public methods for pausing/stopping
     *     job execution.
     */

    try {
        try {
            if (TP.isValid(this.$heartbeat)) {
                clearInterval(this.$heartbeat);
            }
        } catch (e1) {
            TP.ifError() ?
                TP.error(TP.ec(e1, 'Error clearing scheduler.')) : 0;
        }

        if (TP.isValid(this.$timer)) {
            if (this.$get('$useRAF')) {
                //  if we're using requestAnimationFrame, clear it
                window.cancelAnimFrame(this.$timer);
            } else {
                clearTimeout(this.$timer);
            }
        }
    } finally {
        //  clear the variables so we don't have leftovers and pause/resume
        //  will operate as we'd like
        this.$heartbeat = null;
        this.$timer = null;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('$getEqualityValue',
function() {

    /**
     * @method $getEqualityValue
     * @summary Returns the value which should be used when testing for
     *     equality between two instances. For job instances this is the PID.
     * @returns {String} A value appropriate for use in equality comparisons.
     */

    return this.getPID();
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('complete',
function(aResult) {

    /**
     * @method complete
     * @summary Tells the receiver to complete the current run.
     * @description For a job with a repeat count this method may invoke the
     *     next run if one exists and that will continue until the job is truly
     *     complete. Use shutdown to end processing and close out the job with a
     *     successful status code without running any additional runs which
     *     might have been specified.
     * @param {Object} aResult An optional object to set as the result for the
     *     request.
     * @returns {TP.core.Job} The receiver.
     */

    var runs;

    //  decide if we need to requeue or not based on run count data. NOTE
    //  that we use totalcount here, a slot we allow the shutdown call to
    //  alter to help complete end on a run boundary if desired
    if ((runs = this.$get('runs')) < this.$get('totalcount')) {
        //  do the post-processing work for the current run
        this.$teardown();

        //  don't forget to count each run :)
        this.$set('runs', runs + 1);

        //  start the next run
        this.$startrun();
    } else {
        //  done with the overall job, so kill off any scheduling interval
        this.$clearScheduler();

        //  note that we end before teardown to be symmetrical with how we
        //  track started after $setup
        this.$set('ended', Date.now());

        //  do the post-processing work for the current run
        this.$teardown();

        TP.ifTrace() && TP.sys.shouldLogJobs() ?
            TP.sys.logJob('Job ' + this.getPID() +
                ' completed at ' + TP.dc(this.$get('ended')).asTimestamp(),
                TP.DEBUG) : 0;

        //  have to check to see if we already have an failed or cancelled
        //  status since that would imply we can't reset to a success
        //  status
        if (!this.isCompleted()) {
            this.set('statusCode', TP.SUCCEEDED);
        }

        TP.sys.removeJob(this);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('getActiveTime',
function() {

    /**
     * @method getActiveTime
     * @summary Returns the total time (minus any paused time) that the job has
     *     been active. This is the amount of time the job has been "executing"
     *     by being in an active state.
     * @description The active time does not include initial delay time, so a
     *     job queued 10 seconds ago to start in 5 seconds will show an elapsed
     *     time of 10 seconds, but an active time of 5 seconds. The same job, if
     *     paused for 2 seconds during that period, will still show 10 seconds
     *     of elapsed time but only 3 seconds of active time.
     * @returns {Number} Milliseconds of active time.
     */

    var start,
        end;

    if (TP.notValid(start = this.runstart)) {
        return 0;
    }

    //  adjust out any delay time that was initially used so we appear to
    //  have started a bit later...which we will have if there was a delay
    start = start + TP.ifInvalid(this.$delayms, 0);

    if (TP.notValid(end = this.ended)) {
        end = Date.now();
    }

    //  NOTE that we also remove pause time here so we're only showing
    //  actual time the job could have been running
    /* eslint-disable no-extra-parens */
    return (end - start - this.totalPause);
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('getElapsedTime',
function() {

    /**
     * @method getElapsedTime
     * @summary Returns the total elapsed time (including paused time) that the
     *     job has been active as computed from the runstart time.
     * @description The elapsed time does not include initial delay time, so a
     *     job queued 10 seconds ago to start in 5 seconds will show an elapsed
     *     time of 10 seconds, but an active time of 5 seconds. The same job, if
     *     paused for 2 seconds during that period, will still show 10 seconds
     *     of elapsed time but only 3 seconds of active time.
     * @returns {Number} Milliseconds of elapsed time.
     */

    var start,
        end;

    if (TP.notValid(start = this.runstart)) {
        return 0;
    }

    if (TP.notValid(end = this.ended)) {
        end = Date.now();
    }

    return end - start;
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('getPauseTime',
function() {

    /**
     * @method getPauseTime
     * @summary Returns the total pause time for the job.
     * @returns {Number} Milliseconds of pause time.
     */

    return this.totalPause;
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('getPercentComplete',
function() {

    /**
     * @method getPercentComplete
     * @summary Returns the computed percentage complete for the current job.
     * @description For time-limited jobs this is the relative percentage
     *     between active and total time, but for iteration limited jobs it is
     *     the relative percentage of iterations to total iteration count. Jobs
     *     using a limit function have no value for this function.
     * @returns {Number} A Number between 0 and 1 that represents a percentage
     *     or null if this job is using a limit function and the percentage
     *     complete cannot be determined.
     */

    var type,
        percent;

    type = typeof this.limit;

    switch (type) {
        case 'string':
            //  duration/ms, should have limitms to go by
            percent = this.getActiveTime() / this.$limitms;
            break;

        case 'number':
            //  count, should be able to go by iterations where the first
            //  iteration is iteration 0
            percent = this.iteration / this.limit;
            break;

        case 'function':
        default:
            //  no way to know
            return null;
    }

    //  normalize to something between 0 and 1 so we don't overflow
    //  computation functions etc. NOTE we round to 3 places on percentage
    return percent.max(0).min(1).round(3);
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('getPID',
function() {

    /**
     * @method getPID
     * @summary Returns the unique PID or "job ID" for the receiver.
     * @returns {String}
     */

    return this.PID;
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('getProjectedTime',
function() {

    /**
     * @method getProjectedTime
     * @summary Returns the total time the job is expected to run based on the
     *     limit and interval data supplied.
     * @description The initial delay time is not included in this computation,
     *     making this equivalent to "job duration". The one thing to keep in
     *     mind is that unless limit was provided as a duration this value is
     *     purely an estimate and not a limiting factor.
     * @returns {Number} Milliseconds of projected time.
     */

    var type;

    //  if the limit had a computed ms value that's our answer for sure
    if (TP.isNumber(this.$limitms)) {
        return this.$limitms;
    }

    type = typeof this.limit;

    switch (type) {
        case 'number':
            //  iteration count, we can multiply to estimate but we'll want
            //  to include some latency if we're going to be in the ballpark
            return this.limit * (this.lastOffset + this.$intervalms);

        default:
            break;
    }

    return;
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('getStepValue',
function(stepParams) {

    /**
     * @method getStepValue
     * @summary Computes a value for the current step using the function found
     *     in the job parameters under the key 'compute'.
     * @description If no function is found but 'values' exist then the standard
     *     value indexing compute function is used, if a 'from' and 'to' pair
     *     are found a standard linear from/to computation is used. If all else
     *     fails but a 'value' key exists in the parameter data that value is
     *     used (to allow steps to pass a value).
     *     The 'stepParams' hash can contain keys that are used by the
     *     job to perform its task. It can contain the following keys:
     *
     *     'from' The 'from value' to start the job counting at. 'to' The 'to
     *     value' to end the job counting at. 'values' An Array of values whose
     *     count is used by the job to compute stepping times, etc. 'delta' The
     *     difference between a from and to value used by the job to compute the
     *     next iteration value.
     *
     *     These keys are not actually used by the TP.core.Job type, but are
     *     defined to give a set of common names to commonly used parameters for
     *     TP.core.Jobs:
     *
     *     'target' The target (usually an element or set of elements in an
     *     animation) that is being transformed by the step function of the job.
     *     'property' The property of the target being transformed. 'by' Used
     *     rather than the 'to' parameter above to compute the step values
     *     additively from the 'from' value.
     * @param {TP.core.Hash} stepParams A hash of job-specific parameters passed
     *     to the start() function for the job. Note that this parameter is
     *     optional and will default to the parameters computed by the job.
     * @returns {Object} A step-specific value computed by the compute function.
     * @exception TP.sig.JobException
     */

    var val;

    try {
        if (TP.isCallable(this.compute)) {
            val = this.compute(
                    this,
                    TP.isValid(stepParams) ? stepParams : this.parameters);

            if (TP.isArray(this.$steps)) {
                this.$steps.push(val);
            }
        }
    } catch (e) {
        this.raise('TP.sig.JobException',
                    TP.ec(e, 'Error in compute function'));
    }

    return val;
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('isLimited',
function() {

    /**
     * @method isLimited
     * @summary Returns true if the job can no longer run due to limit settings
     *     and job state. This method is invoked during each iteration to see if
     *     the job should continue to run or not.
     * @returns {Boolean} True if the job should stop running (has hit its
     *     limit).
     */

    var type,
        limit,
        active;

    limit = this.limit;
    type = typeof limit;

    switch (type) {
        case 'number':

            //  run the specified number of times? then we're limited. NOTE
            //  that we add 1 to the iteration here since iterations are
            //  zero-indexed but limits are expressed in terms of counts
            return this.iteration + 1 >= limit;

        case 'string':

            //  run long enough? then we're limited
            active = this.getActiveTime();

            return active >= this.$limitms;

        case 'function':

            return limit(this, this.parameters);

        default:

            return false;
    }
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('kill',
function(silently) {

    /**
     * @method kill
     * @summary Performs an immediate shutdown of the job, setting its status
     *     to TP.CANCELLED and ceasing any future processing.
     * @description This not only cancels any interval-based iterations but it
     *     will also cancel any repeat-count processing that might have
     *     otherwise occurred. No job post-processing functions will be run
     *     either.
     * @param {Boolean} silently True to skip any logging.
     * @returns {TP.core.Job} The receiver.
     */

    //  turn off any "about to happen" processing
    this.$clearScheduler();

    this.$set('ended', Date.now());

    if (TP.notTrue(silently)) {
        TP.ifTrace() && TP.sys.shouldLogJobs() ?
            TP.sys.logJob('Job ' + this.getPID() +
                    ' killed at ' + TP.dc(this.$get('ended')).asTimestamp(),
                    TP.DEBUG) : 0;
    }

    //  note that we cancel, not complete here
    this.cancel();
    TP.sys.removeJob(this);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('pause',
function() {

    /**
     * @method pause
     * @summary Pauses the job. Not all job functions can pause effectively so
     *     this may not work consistently based on the exact nature of the pre,
     *     work, and post functions being executed.
     * @returns {TP.core.Job} The receiver.
     */

    //  turn off any "about to happen" processing
    this.$clearScheduler();

    //  track each pause to help deal with timing offsets. the resume call
    //  will work with this to keep track of total pause time in a job to
    //  compute an offset as needed
    this.$set('lastPaused', Date.now());

    //  set our state properly
    this.isActive(false);
    this.isPaused(true);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('resume',
function() {

    /**
     * @method resume
     * @summary Resumes processing for a paused job. The job is run from the
     *     current state which includes computations to deal with time in the
     *     paused state.
     * @returns {TP.core.Job} The receiver.
     */

    //  when resuming we need to count ms for pauses so that the
    //  computations for delay, interval, runnable time etc. are correct
    this.$set('totalPause', this.$get('totalPause') +
                            (Date.now() -
                            this.$get('lastPaused')));

    //  clear paused state so iterate will actually run, otherwise it'll
    //  think we're still paused and simply return
    this.isPaused(false);
    this.isActive(true);

    //  iterate check various things before asking the work to be performed
    //  which is what we want when resuming...we don't want immediate work
    this.$iterate();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('schedule',
function() {

    /**
     * @method schedule
     * @summary Schedules the first work iteration for the job. This method is
     *     called by the start method to handle delay processing so that the
     *     iterate call can focus purely on interval-based scheduling.
     * @returns {TP.core.Job} The receiver.
     */

    var type,
        delay,
        timer;

    //  if we're paused we can exit immediately
    if (this.isPaused()) {
        return this;
    }

    //  can we run based on limits? if not then complete this job
    if (this.isLimited()) {
        this.complete();
        return this;
    }

    this.isActive(true);

    delay = this.$get('delay');
    type = typeof delay;

    switch (type) {
        case 'string':

            //  duration or ms as number
            delay = this.$delayms;

            break;

        case 'number':

            delay = this.$delayms;

            break;

        case 'function':

            delay = delay(this, this.$get('parameters'));

            break;

        default:

            delay = 0;

            break;
    }

    //  when we've got a real delay
    if (TP.isNumber(delay) && delay > 0) {
        //  if we're using requestAnimationFrame, set it up
        if (this.$get('$useRAF')) {
            timer = window.requestAnimationFrame(this.$timedWork);
        } else {
            //  do the work when the timeout expires...i.e. a delay is our
            //  first interval so when the delay is over we work immediately and
            //  then requeue as needed in that routine
            timer = setTimeout(this.$timedWork, delay);
        }

        this.$set('$timer', timer);
        this.$set('expected', delay);

        return this;
    }

    //  no delay? $work now and let it requeue as it sees fit
    return this.$work();
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('setDelay',
function(aDelay) {

    /**
     * @method setDelay
     * @summary Sets the delay in milliseconds using a Number, String, or
     *     Duration string value, or a function to compute the delay at runtime.
     * @param {Number|String|Duration} aDelay A number of milliseconds in one of
     *     three formats.
     * @returns {TP.core.Job} The receiver.
     */

    var type;

    this.$set('delay', aDelay);
    type = typeof aDelay;

    switch (type) {
        case 'string':

            //  duration or ms as number

            //  see if its a number first
            if (TP.isNaN(this.$delayms = parseFloat(aDelay))) {
                //  it's not - see if its a valid xs:duration
                this.$delayms = Date.getMillisecondsInDuration(aDelay);
            }

            break;

        case 'number':

            this.$delayms = aDelay;

            break;

        case 'function':

            //  explicitly don't want a number in this cache slot
            this.$delayms = null;

            break;

        default:

            this.$delayms = 0;

            break;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('setInterval',
function(anInterval) {

    /**
     * @method setInterval
     * @summary Sets the queuing interval in milliseconds using a Number,
     *     String, or Duration string value or a function to compute that value
     *     at runtime.
     * @param {Number|String|Duration} anInterval A number of milliseconds in
     *     one of three formats.
     * @returns {TP.core.Job} The receiver.
     */

    var type;

    this.$set('interval', anInterval);
    type = typeof anInterval;

    switch (type) {
        case 'string':

            //  duration or ms as number

            //  see if its a number first
            if (TP.isNaN(this.$intervalms = parseFloat(anInterval))) {
                //  it's not - see if its a valid xs:duration
                this.$intervalms = Date.getMillisecondsInDuration(
                                                            anInterval);
            }

            break;

        case 'number':

            this.$intervalms = anInterval;

            break;

        case 'function':

            //  explicitly don't want a number in this cache slot
            this.$intervalms = null;

            break;

        default:

            this.$intervalms = 0;

            break;
    }

    //  set the control flag for heartbeat use based on our interval time
    if (TP.isNumber(this.$intervalms) && TP.notTrue(this.$get('$useRAF'))) {
        this.$useHeartbeat = this.$intervalms <
                                TP.sys.cfg('job.heartbeat_threshold');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('setLimit',
function(aLimit) {

    /**
     * @method setLimit
     * @summary Sets the limit using a Number or String, or Duration string
     *     value. A limit can also be a function which computes this value based
     *     on current job parameters.
     * @description This control parameter is used differently based on the type
     *     of argument supplied here: String Either a number of milliseconds as
     *     a String or an xs:Duration. Number The maximum number of times the
     *     step function(s) will be invoked per execution of the job. Function A
     *     function that returns true if the job/step has reached its limit.
     * @param {Number|String|Duration} aLimit The job limit in one of two
     *     formats or a function to compute it.
     * @returns {TP.core.Job} The receiver.
     */

    var type;

    this.$set('limit', aLimit);
    type = typeof aLimit;

    switch (type) {
        case 'string':

            //  duration or ms as number

            //  see if its a number first
            if (TP.isNaN(this.$limitms = parseFloat(aLimit))) {
                //  it's not - see if its a valid xs:duration
                this.$limitms = Date.getMillisecondsInDuration(aLimit);
            }

            break;

        case 'number':

            //  iteration count, not MS value...
            this.$limitms = null;

            break;

        case 'function':

            //  explicitly don't want a number in this cache slot
            this.$limitms = null;

            break;

        default:

            //  explicitly don't want a number in this cache slot
            this.$limitms = null;

            break;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('setWork',
function(work) {

    /**
     * @method setWork
     * @summary Sets the work function, the function the job actually uses to
     *     perform the steps.
     * @description When the work parameter here is empty this method will build
     *     a default work function from the current step content. The default
     *     function is used primarly to ensure that the work is properly
     *     enclosed in a try/catch to cleanup the job if any errors occur.
     * @param {Function} work The function serving as the work function.
     * @returns {TP.core.Job} The receiver.
     */

    var func,
        step;

    //  if nothing was provided (typical) then build a proper work function
    if (TP.notValid(func = work)) {
        //  grab the actual step function(s) so we can close around them
        step = this.$get('step');

        //  a simple wrapper around a potential set of functions which
        //  allows them all to run as a single work function.
        func = function(job, params) {

            TP.isCallable(step) ?
                        job.wasSuccessful = step(job, params) :
                        job.wasSuccessful = step.apply(null, arguments);

            return job.wasSuccessful;
        };

        //  support access for debugging purposes. this mirrors what we do
        //  with other wrapper functions such as bind (but may not always be
        //  a function if the work is an array of them)
        func.$realFunc = step;
    }

    //  make the wrapper the job's operational function so it's what the job
    //  runs when told to execute
    this.$set('work', func);
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('restart',
function() {

    /**
     * @method restart
     * @summary Restarts the job. Any current timers are cleared, the current
     *     run is torn down, and a new run is begun. Note that restart does not
     *     increment the overall run count, it restarts the current run.
     * @returns {TP.core.Job} The receiver.
     */

    //  stop any timers
    this.$clearScheduler();

    //  do the post-processing work for the current run
    this.$teardown();

    //  start the new run
    this.$startrun();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('shutdown',
function(now) {

    /**
     * @method shutdown
     * @summary Performs a clean shutdown of the job so it doesn't appear to
     *     have been terminated with an error or killed. This includes running
     *     the job's teardown/post-processing logic.
     * @description If "now" is true then any pending steps or job cycles (based
     *     on repeat count) are terminated before the teardown step.
     * @param {Boolean} now True to stop iterations and terminate now.
     * @returns {TP.core.Job} The receiver.
     */

    TP.ifTrace() && TP.sys.shouldLogJobs() ?
        TP.sys.logJob('Job ' + this.getPID() +
                ' shutdown requested at ' + TP.dc().asTimestamp(),
                TP.DEBUG) : 0;

    if (now) {
        //  cancel any pending work
        this.$clearScheduler();

        this.$set('ended', Date.now());

        //  do the post-processing work for the current run
        this.$teardown();
    } else {
        //  by setting our totalcount to the number of runs we cause the
        //  next complete call to terminate cleanly at a job run boundary
        this.$set('totalcount', this.$get('runs'));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('start',
function(stepParams) {

    /**
     * @method start
     * @summary Starts a job, running it from its initial state. This is the
     *     public interface to initiating a job. As a result of this call the
     *     job's parameters will be set and its iterate method will be invoked
     *     to start the job scheduling process.
     * @description The 'stepParams' hash can contain keys that are used by the
     *     job to perform its task. It can contain the following keys:
     *
     *     'from' The 'from value' to start the job counting at. 'to' The 'to
     *     value' to end the job counting at. 'values' An Array of values whose
     *     count is used by the job to compute stepping times, etc. 'delta' The
     *     difference between a from and to value used by the job to compute the
     *     next iteration value.
     *
     *     These keys are not actually used by the TP.core.Job type, but are
     *     defined to give a set of common names to commonly used parameters for
     *     TP.core.Jobs:
     *
     *     'target' The target (usually an element or set of elements in an
     *     animation) that is being transformed by the step function of the job.
     *     'property' The property of the target being transformed. 'by' Used
     *     rather than the 'to' parameter above to compute the step values
     *     additively from the 'from' value.
     * @param {TP.core.Hash} stepParams A hash of job-specific parameters passed
     *     to the start() function for the job.
     * @returns {TP.core.Job} The receiver.
     */

    //  make sure TIBET knows about this job instance
    TP.sys.addJob(this);

    if (TP.isValid(stepParams)) {
        //  tuck away any parameters, effectively clearing previous value
        this.$set('parameters', stepParams, false);
    }

    //  update/default any parameters that might be missing
    this.$configure();

    //  do any pre-run setup before scheduling/running the job
    this.$setup();

    //  capture start time, which is when the job is asked to start
    this.$set('started', Date.now());
    this.$set('runstart', this.started);

    TP.ifTrace() && TP.sys.shouldLogJobs() ?
        TP.sys.logJob('Job ' + this.getPID() +
                ' started at ' + TP.dc(this.$get('started')).asTimestamp(),
                TP.DEBUG) : 0;

    //  schedule so we deal with possible delay, or run right now
    return this.schedule();
});

//  ------------------------------------------------------------------------
//  Internal Support
//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('$configure',
function() {

    /**
     * @method $configure
     * @summary Sets the job's default parameters by running any 'config'
     *     function provided and computing missing values.
     * @returns {TP.core.Job} The receiver.
     */

    var config;

    //  copy over any step parameter values so the job's internal properties
    //  and parameter data are in sync
    this.$$updateTimingFromStepParameters();

    //  run any supplied configuration function(s) to configure job
    config = this.$get('config');
    if (TP.canInvoke(config, 'apply')) {
        try {
            TP.isCallable(config) ?
                config(this, this.$get('parameters')) :
                config.apply(null, TP.ac(this, this.$get('parameters')));
        } catch (e) {
            TP.ifError() ?
                TP.error(
                    TP.ec(e, TP.join('Job ',
                                        this.getPID(),
                                        ' configuration failed.')),
                    TP.JOB_LOG) : 0;
        }
    }

    //  fill in the blanks :)
    this.$$updateMissingParamsAndState();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('$iterate',
function() {

    /**
     * @method $iterate
     * @summary Handles scheduling the next iteration of the job when using a
     *     non-heartbeat scheduling model. This method is invoked once any
     *     initial delay has been dealt with via the schedule call so it works
     *     only with repeat interval and latency to try to schedule the work for
     *     the next iteration.
     * @returns {TP.core.Job} The receiver.
     */

    var interval,

        expected,
        paused,
        now,
        runstart,
        elapsed,
        offset,
        next,

        timer;

    //  if we're paused we can exit immediately, can't work right now
    if (this.isPaused()) {
        return this;
    }

    //  can we run based on limits? if not then complete this run cycle
    if (this.isLimited()) {
        this.complete();
        return this;
    }

    //  two scheduling models in effect. for large-grained intervals we do
    //  our own scheduling computation but for small-grained intervals we
    //  use a "heartbeat" model which wakes us up every chance it gets
    if (this.$useHeartbeat) {
        if (TP.notValid(this.$heartbeat)) {
            //  should be using an interval but it was probably cleared by a
            //  pause...so restart it and let it do the work
            this.$heartbeat = setInterval(
                                this.$timedWork,
                                TP.sys.cfg('job.heartbeat_interval'));
        } else {
            //  no-op, we have an interval and it should be telling the work
            //  to occur. Note that we shouldn't really end up here.
            void 0;
        }

        return this;
    }

    //  get/compute the interval value for this iteration. the interval here
    //  is the one the original job defined...we'll adjust it later for
    //  latency to try to keep the job on target
    interval = this.interval;
    switch (typeof interval) {
        case 'function':

            interval = interval(this, this.parameters);
            if (!TP.isNumber(interval)) {
                interval = this.lastInterval;
            }

            break;

        case 'number':
        case 'string':

            interval = this.$intervalms;

            break;

        default:

            this.complete();
            return this;
    }

    //  save the lastInterval value based on our computation
    this.lastInterval = interval;

    //  tuck away the expected value we'd need to revive if we pause
    this.lastExpected = this.expected;

    expected = this.expected;               //  delay value first time thru
    paused = this.totalPause;               //  0 unless job has paused

    //  update our "expected time" to reflect the computed data...but note
    //  that we do not adjust this based on offset, this is what the job
    //  really expected over time...i.e. the time we'd expect with zero
    //  latency in place
    this.expected = expected + interval;

    //  start computing based on current time
    now = Date.now();

    //  total elapsed time is based on difference between now and the
    //  adjusted "runnable time" of the job which means moving the start
    //  time forward to deal with pause time
    runstart = this.runstart;
    elapsed = now - (runstart + paused);

    //  offset is how long we've been running minus what was expected. so
    //  for example, we may have expected 1100 for the first step in a 100ms
    //  job with a 1s delay, but perhaps have 1108 as elapsed...so we're
    //  over by 8 ms. when negative it means the job triggered slightly
    //  early. for example, if elapsed is 1092 we're early by 8ms so offset
    //  is -8.
    offset = elapsed - expected;
    this.lastOffset = offset;

    //  the next time we want to queue for is the computed interval minus
    //  the offset (which if we're running with a negative offset will end
    //  up adding offset time). one special case here however is when small
    //  interval values don't allow time for long work function runtimes
    //  which can cause the offset to exceed the interval time
    next = ((interval - offset) / 10).round() * 10;

    //  track stats if specified
    if (TP.isArray(this.$stats)) {
        this.$stats.push(TP.join('rs: ', runstart,
                                    ' pa: ', paused,
                                    ' nw: ', now,
                                    ' el: ', elapsed,
                                    ' ex: ', expected,
                                    ' of: ', offset,
                                    ' int: ', interval,
                                    ' nx: ', next));
    }

    //  do the deed, and keep track of the timer so we can clear it

    //  if we're using requestAnimationFrame, set it up
    if (this.$get('$useRAF')) {
        timer = window.requestAnimationFrame(this.$timedWork);
    } else {
        timer = setTimeout(this.$timedWork, next);
    }

    this.$set('$timer', timer);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('reset',
function() {

    /**
     * @method reset
     * @summary Resets the job, returning it to its initial state. Upon
     *     completion of this method a start() call will start the job running
     *     again as if for the first time (other than any side effects from the
     *     pre, work, and post functions themselves).
     * @returns {TP.core.Job} The receiver.
     */

    //  reset all internal params to their initial states. NOTE that we
    //  don't make any changes to step, pre, post, compute, work, count,
    //  delay, interval, limit or other "control parameters" for the job
    this.$clearScheduler();

    this.$set('parameters', null, false);

    this.$set('runstart', null, false);
    this.$set('started', null, false);
    this.$set('ended', null, false);

    this.$set('expected', 0, false);
    this.$set('lastExpected', 0, false);
    this.$set('lastInterval', this.$get('firstInterval'), false);

    this.$set('lastOffset', 0, false);
    this.$set('workOffset', 0, false);

    this.$set('lastPaused', null);
    this.$set('totalPause', 0, false);

    //  update total count so complete/shutdown work from original count
    this.$set('totalcount', this.$get('count'), false);
    this.$set('runs', 1, false);

    this.$set('iteration', 0, false);

    this.$set('wasSuccessful', false, false);

    //  clear cached data from last call
    this.$heartbeat = null;
    this.$lastWork = null;
    this.$timer = null;

    this.$stats = null;
    this.$steps = null;

    //  back to ready state
    this.$set('statusCode', TP.READY, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('$startrun',
function() {

    /**
     * @method $startrun
     * @summary Starts a job's next run. This is a convenience wrapper for
     *     reset()/start() which preserves the current job parameters before the
     *     reset.
     * @returns {TP.core.Job} The receiver.
     */

    var params,
        runs,
        runstart;

    //  TODO:   verify we're in the right state (ACTIVE etc)

    //  capture what we need to hold on to before we reset
    params = this.$get('parameters');
    runs = this.$get('runs');

    //  reset to initial state, which will clear parameters and run count
    //  which is why we held on to them above
    this.reset();

    //  re-establish parameters and run count so iterate will find them
    this.$set('parameters', params, false);
    this.$set('runs', runs, false);

    //  (ss) NOTE that we don't do this here, presuming that we can
    //  configure the defaults once and retain them for all individual runs
    //  update/default any parameters that might be missing
    // this.$configure();

    //  do any pre-run setup before scheduling/running the job
    this.$setup();

    //  capture restart time for this run
    runstart = Date.now();
    this.$set('runstart', runstart, false);

    TP.ifTrace() && TP.sys.shouldLogJobs() ?
        TP.sys.logJob('Job ' + this.getPID() +
                ' re-started at ' + TP.dc(runstart).asTimestamp(),
                TP.DEBUG) : 0;

    //  schedule so we deal with possible delay, or run right now
    return this.schedule();
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('$setup',
function() {

    /**
     * @method $setup
     * @summary Executes the receiver's pre-processing function(s) if any. This
     *     operation is invoked automatically at the start of each job run
     *     (which might be multiple times for a job with a repeat count).
     * @returns {TP.core.Job} The receiver.
     */

    var pre;

    //  before we truly start we run pre func if found
    pre = this.$get('pre');
    if (TP.canInvoke(pre, 'apply')) {
        try {
            TP.isCallable(pre) ?
                    pre(this, this.$get('parameters')) :
                    pre.apply(null, TP.ac(this, this.$get('parameters')));
        } catch (e) {
            TP.ifError() ?
                TP.error(
                    TP.ec(e, TP.join('Job ',
                                        this.getPID(),
                                        ' pre-processing failed.')),
                    TP.JOB_LOG) : 0;
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('$teardown',
function() {

    /**
     * @method $teardown
     * @summary Executes the receiver's post-processing function(s) if any.
     *     This operation is invoked automatically at the end of each job run
     *     (which might be multiple times for a job with a repeat count).
     * @returns {TP.core.Job} The receiver.
     */

    var post;

    //  before we truly end we run post func if found
    post = this.$get('post');
    if (TP.canInvoke(post, 'apply')) {
        try {
            TP.isCallable(post) ?
                    post(this, this.$get('parameters')) :
                    post.apply(null, TP.ac(this, this.$get('parameters')));
        } catch (e) {
            TP.ifError() ?
                TP.error(
                    TP.ec(e, TP.join('Job ',
                                        this.getPID(),
                                        ' pos-processing failed.')),
                    TP.JOB_LOG) : 0;
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('$$updateMissingParamsAndState',
function() {

    /**
     * @method $$updateMissingParamsAndState
     * @summary Sets missing job's parameters and instance state based on
     *     available information. This is the last step in $configure before a
     *     job is considered ready to run.
     * @returns {TP.core.Job} The receiver.
     */

    var params,
        fromVal,
        toVal,
        values,
        limit;

    if (TP.notValid(params = this.$get('parameters'))) {
        return this;
    }

    //  pre-compute delta value for from/to parameter blocks, default
    //  compute and limit functions based on params

    /* eslint-disable no-extra-parens */

    if (TP.isTrue(params.at('stats')) ||
        (!TP.isFalse(params.at('stats')) && TP.sys.shouldTrackJobStats())) {
        this.$stats = TP.ac();
        this.$steps = TP.ac();
    } else {
        this.$stats = null;
        this.$steps = null;
    }

    /* eslint-enable no-extra-parens */

    //  two basic parameter passing models for most jobs, 'from/to/by' and
    //  'values' (iteration). here we try to default those cases so you
    //  don't have to pass other typical parameters. note that 'by' isn't an
    //  official parameter used by TP.core.Jobs, but we check for it here in
    //  order to default the computation function.

    //  notice here how we assign up front. that way we don't have to worry
    //  about 'early bailout' on the OR test (and 't' never being assigned).
    fromVal = params.at('from');
    toVal = params.at('to');

    if (TP.isNumber(fromVal) ||
        TP.isNumber(toVal) ||
        TP.isValid(params.at('by'))) {
        //  if both the from and to are supplied, then we can compute the
        //  delta right here. otherwise, a 'pre' func will have to do that
        //  from other data.
        if (TP.isNumber(fromVal) && TP.isNumber(toVal)) {
            //  when doing a from/to a delta is the typical value used by
            //  compute functions so we compute that once.
            params.atPut('delta', toVal - fromVal);
        }

        //  the default computation for from/to is a linear compute based on
        //  current percentage complete
        if (!TP.isCallable(this.$get('compute'))) {
            this.$set('compute', TP.core.Job.LINEAR_COMPUTE, false);
        }
    } else if (TP.isArray(values = params.at('values'))) {
        limit = this.$get('limit');

        //  when using a value iteration model the compute function varies
        //  by how the job is limited.
        if (TP.notValid(limit)) {
            //  when there's no limit, but a list of values, we limit to the
            //  list size.  we set this here so the TP.isNumber() test below
            //  will work for both "no limit" and "size limit"
            limit = values.getSize();
            this.$set('limit', limit, false);
        }

        if (TP.isNumber(limit)) {
            //  when the limit is an explicit count the typical compute is
            //  iteration number so the indexes are easy.
            if (!TP.isCallable(this.$get('compute'))) {
                this.$set('compute',
                            TP.core.Job.ITERATION_INDEX_COMPUTE,
                            false);
            }
        } else if (TP.isString(limit)) {
            //  other cases are duration strings and functions. the duration
            //  strings are always a percentage complete model
            if (!TP.isCallable(this.$get('compute'))) {
                this.$set('compute',
                            TP.core.Job.PERCENTAGE_INDEX_COMPUTE,
                            false);
            }
        } else {
            //  when limit is a function it's hard to say what we should
            //  compute based on since we have no way to know how close the
            //  job is to being done, so we don't try :)
            void 0;
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('$$updateTimingFromStepParameters',
function() {

    /**
     * @method $$updateTimingFromStepParameters
     * @summary Called internally to update the job's timing configuration from
     *     the current step parameters. This allows an individual start()
     *     invocation to make minor alterations to the job (but not any that
     *     change the actual pre/step/work functions).
     * @returns {TP.core.Job} The receiver.
     */

    var params,
        value;

    if (TP.notValid(params = this.$get('parameters'))) {
        return this;
    }

    //  Note that many of these properties have 'custom setters', so we use
    //  the regular 'set()' method here.

    if (TP.isValid(value = params.at('delay'))) {
        this.set('delay', value);
    }

    if (TP.isValid(value = params.at('firstInterval'))) {
        this.set('firstInterval', value);
        this.set('lastInterval', value);
    }

    if (TP.isValid(value = params.at('maxInterval'))) {
        this.set('maxInterval', value);
    }

    if (TP.isValid(value = params.at('interval'))) {
        this.set('interval', value);
    }

    if (TP.isValid(value = params.at('limit'))) {
        this.set('limit', value);
    }

    if (TP.isValid(value = params.at('count'))) {
        this.set('count', value);
        this.set('totalcount', value);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.Job.Inst.defineMethod('$work',
function() {

    /**
     * @method $work
     * @summary Executes the receiver's work function and determines if the
     *     work needs to be rescheduled to deal with interval repeats.
     * @returns {TP.core.Job} The receiver.
     */

    var work,
        gap,
        exit;

    work = this.work;

    //  if we're paused we can exit immediately, can't work right now
    if (this.isPaused()) {
        return this;
    }

    //  if we're using a heartbeat it's possible we've been called too
    //  early, so "mind the gap" before going any further... ;)
    if (this.$useHeartbeat && TP.isValid(this.$lastWork)) {
        gap = Date.now() - this.$lastWork;

        /* eslint-disable no-extra-parens */
        if ((gap + (TP.sys.cfg('job.heartbeat_interval') / 2)) <
                                                        this.$intervalms) {
            return this;
        }
        /* eslint-enable no-extra-parens */
    }

    try {
        //  track when we do work to help with our gap analysis above
        this.$lastWork = Date.now();

        TP.isCallable(work) ?
                this.wasSuccessful = work(this, this.parameters) :
                this.wasSuccessful = work.apply(
                                        null,
                                        TP.ac(this, this.parameters));

        if (TP.isFalse(this.wasSuccessful) &&
            TP.isValid(this.parameters) &&
            TP.isTrue(this.parameters.at('warn'))) {
            TP.ifWarn() ?
                TP.warn(TP.join('Job ', this.getPID(), ' step ',
                                this.iteration, ' was unsuccessful.'),
                        TP.JOB_LOG) : 0;
        }
    } catch (e) {
        this.wasSuccessful = false;

        TP.ifError() ?
            TP.error(
                TP.ec(e, TP.join('Job ',
                                    this.getPID(),
                                    ' step-processing error.')),
                TP.JOB_LOG) : 0;

        //  bit of a cheat here, but we'll call the private method
        //  and set failed as the status
        this.$clearScheduler();
        this.fail(TP.str(e));

        TP.ifError() ?
            TP.error(
                TP.ec(e, TP.join('Job ',
                                    this.getPID(),
                                    ' failed. ',
                                    'Job remains available in job list.')),
                TP.JOB_LOG) : 0;

        exit = true;
    } finally {
        /* eslint-disable no-unsafe-finally */

        //  if catch block triggered don't bother
        if (exit) {
            return this;
        }

        //  bump iteration count once we've run the function. this means
        //  iteration count remains zero-indexed to allow it to be used
        //  during collection iteration
        this.iteration++;

        //  can we run based on limits? if not then complete this run cycle
        if (this.isLimited()) {
            this.complete();
            return this;
        }

        //  when using heartbeat scheduling we either work now (since we've
        //  been notified) or we set up the first interval if it's never
        //  been configured (this is the first work run)
        if (this.$useHeartbeat) {
            if (TP.notValid(this.$heartbeat)) {
                //  first time through...queue the interval to call us back
                this.$heartbeat = setInterval(
                                    this.$timedWork,
                                    TP.sys.cfg('job.heartbeat_interval'));
            } else {
                //  no-op. already have an interval and it'll call back when
                //  it's ready
                void 0;
            }
        } else {
            //  re-queue via the iterate call for the next interval
            this.$iterate();
        }
        /* eslint-enable no-unsafe-finally */
    }

    return this;
});

//  ------------------------------------------------------------------------
//  JOB LIST MANAGEMENT
//  ------------------------------------------------------------------------

//  the TIBET "process table"
TP.sys.defineAttribute('$jobs');

//  ------------------------------------------------------------------------

TP.sys.defineMethod('addJob',
function(aJob) {

    /**
     * @method addJob
     * @summary Adds a job entry to the list of current jobs.
     * @param {TP.core.Job} aJob The job to add.
     * @returns {TIBET} The receiver.
     */

    this.getJobs().add(aJob);

    return this;
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getJob',
function(aPID) {

    /**
     * @method getJob
     * @summary Returns the job whose PID matches the one provided.
     * @param {Number} aPID The PID to search for.
     * @returns {TP.core.Job} A TP.core.Job instance.
     */

    var jobs;

    jobs = this.get('$jobs');

    return jobs.detect(
                function(item) {

                    return item.getPID() === aPID;
                });
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('getJobs',
function() {

    /**
     * @method getJobs
     * @summary Returns the list of current jobs.
     * @returns {TP.core.Job[]} The TIBET job list.
     */

    //  build lazily so we get "best" collection type/implementation
    if (TP.notValid(this.$get('$jobs'))) {
        this.$set('$jobs', TP.ac());
    }

    return this.$get('$jobs');
});

//  ------------------------------------------------------------------------

TP.sys.defineMethod('removeJob',
function(aJob) {

    /**
     * @method removeJob
     * @summary Removes a job entry from the list of current jobs.
     * @param {TP.core.Job} aJob The job to remove.
     * @returns {TP.sys} The receiver.
     */

    this.getJobs().remove(aJob);

    return this;
});

//  ------------------------------------------------------------------------
//  JOB CONTROL SHORTCUTS
//  ------------------------------------------------------------------------

TP.definePrimitive('job',
function(aPID) {

    /**
     * @method job
     * @summary Returns the job with the PID provided.
     * @param {Number|String} aPID The PID to query for.
     * @returns {TP.core.Job} The named job instance.
     */

    return TP.sys.getJob(aPID);
});

//  ------------------------------------------------------------------------

TP.definePrimitive('kill',
function(aJob) {

    /**
     * @method kill
     * @summary Kills a particular TP.core.Job, by reference or by ID.
     * @param {Number|TP.core.Job} aJob The PID, or Job to kill.
     * @returns {aJob} The "dead" job.
     */

    var job;

    if (TP.notValid(aJob)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  if it's a job, not a pid, then we can just kill it
    if (TP.canInvoke(aJob, 'kill')) {
        return aJob.kill();
    }

    //  if it's a pid then we want to go by that
    if (TP.isValid(job = TP.sys.getJob(aJob))) {
        job.kill();
    }

    return job;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('schedule',
function(controlParams, stepParams) {

    /**
     * @method schedule
     * @summary Replaces setTimeout() and setInterval() calls, allowing you to
     *     manage long-running processes more effectively.
     * @description The 'controlParams' hash can contain keys that control the
     *     job. It can have the following keys:
     *
     *     'config' A function to run to do any final job setup such as setting
     *     default values. 'pre' A function to run once before any step work is
     *     done. 'step' The "step" function, which does the actual processing of
     *     each iteration. 'post' A function to run during shutdown after all
     *     step iterations complete. 'compute' A function used to compute the
     *     next value for a step. 'delay' A millisecond delay before steps are
     *     processed. 'interval' A millisecond interval between each step
     *     iteration, or a function to compute it. 'lastInterval' A millisecond
     *     interval to start with when using an interval function. 'limit' A
     *     function returning true if the job/step has reached its limit, or a
     *     number defining the maximum number of times the step function(s)
     *     should be invoked per job, or a string defining an xs:duration for
     *     maximum time for the job to run. 'count' Number of times to repeat
     *     the entire job. Default is 1. 'stats' Boolean defining whether we
     *     want job statistics to be gathered.
     *
     *     The 'stepParams' hash can contain keys that are used by the job to
     *     perform its task. It can contain the following keys:
     *
     *     'from' The 'from value' to start the job counting at. 'to' The 'to
     *     value' to end the job counting at. 'values' An Array of values whose
     *     count is used by the job to compute stepping times, etc. 'delta' The
     *     difference between a from and to value used by the job to compute the
     *     next iteration value.
     *
     *     These keys are not actually used by the TP.core.Job type, but are
     *     defined to give a set of common names to commonly used parameters for
     *     TP.core.Jobs:
     *
     *     'target' The target (usually an element or set of elements in an
     *     animation) that is being transformed by the step function of the job.
     *     'property' The property of the target being transformed. 'by' Used
     *     rather than the 'to' parameter above to compute the step values
     *     additively from the 'from' value.
     * @param {TP.core.Hash|TP.sig.Request} controlParams A hash of control
     *     parameters that control the job.
     * @param {TP.core.Hash} stepParams A hash of job-specific parameters passed
     *     to the start() function for the job.
     * @returns {TP.core.Job} A TP.core.Job instance which represents the
     *     overall job, regardless of how many individual timeouts may be used
     *     to implement it.
     */

    var job;

    //  goal is to get something we can register with TIBET that won't stay
    //  stuck in the job list when it exits. so the first problem is making
    //  sure we have a function that will remove the job when it completes

    //  the job instance is constructed with the same parameters so it knows
    //  what the original call was provided
    job = TP.core.Job.construct(controlParams);

    if (TP.notValid(job)) {
        //  presume the constructor logged the error here
        return;
    }

    //  start the job, which includes computing delays etc.
    job.start(stepParams);

    return job;
});

//  ------------------------------------------------------------------------

/**
 * @type {TP.core.JobGroup}
 * @summary TP.core.Job provides support for grouping objects that implement
 *     the TP.core.JobStatus trait (which could be TP.core.Job objects or other
 *     TP.core.JobGroups) and controlling them as a complete group. A common
 *     example is animations/effects which are combined into sets so that they
 *     can run as if they were a single effect, even though there are multiple
 *     underlying jobs being run.
 */

//  ------------------------------------------------------------------------

TP.lang.Object.defineSubtype('core.JobGroup');

//  add job status code support.
TP.core.JobGroup.addTraits(TP.core.JobStatus);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.core.JobGroup.Inst.defineAttribute('children');

//  ------------------------------------------------------------------------

TP.core.JobGroup.Inst.defineMethod('$performOverChildren',
function(aMethodName, anArgument) {

    /**
     * @method $performOverChildren
     * @summary Runs a particular method against all children in the job group.
     *     This is used internally to process most of the public interface
     *     methods of this type. Since the methods typically invoked take 0 or 1
     *     argument we make it easy to pass one argument to the function.
     * @param {String} aMethodName The method to invoke on each child job.
     * @param {Object} anArgument An optional argument to pass to the method
     *     with each child invocation.
     * @returns {TP.core.JobGroup} The receiver.
     */

    var children,
        len,
        i;

    children = this.get('children');
    len = children.getSize();

    for (i = 0; i < len; i++) {
        children[i][aMethodName](anArgument);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JobGroup.Inst.defineMethod('addChild',
function(aChild) {

    /**
     * @method addChild
     * @summary Adds a child object implementing the TP.core.JobStatus
     *     implementation to the receiving job group.
     * @param {TP.core.JobStatus} aChild The child TP.core.JobStatus to add to
     *     this group.
     * @returns {TP.core.JobGroup} The receiver.
     */

    var children;

    children = this.getChildren();
    children.add(aChild);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JobGroup.Inst.defineMethod('cancel',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method cancel
     * @summary Tells the receiver to cancel, meaning it is being rescinded by
     *     the user or calling process.
     * @description If the receiver has specific behavior to implement it should
     *     override this method, but be sure to set the status to TP.CANCELLING
     *     during any processing and TP.CANCELLED after processing is complete.
     *     The default implementation simply sets the status to TP.CANCELLED.
     * @param {String} aFaultString A string description of the fault.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the cancellation.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the cancellation.
     * @returns {TP.core.JobGroup} The receiver.
     */

    this.$performOverChildren('cancel', aFaultString, aFaultCode, aFaultInfo);

    if (TP.isValid(aFaultCode)) {
        //  note we don't signal change here
        this.set('faultCode', aFaultCode);
    }

    if (TP.isString(aFaultString)) {
        //  note we don't signal change here
        this.set('faultText', aFaultString);
    }

    if (TP.isValid(aFaultInfo)) {
        //  note we don't signal change here
        this.set('faultInfo', aFaultInfo);
    }

    this.set('statusCode', TP.CANCELLED);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JobGroup.Inst.defineMethod('complete',
function(aResult) {

    /**
     * @method complete
     * @summary Tells the receiver to complete, meaning the receiver should do
     *     whatever finalization is necessary to reach the TP.SUCCEEDED state.
     * @description If the receiver has specific behavior to implement it should
     *     override this method, but be sure to set the status to TP.COMPLETING
     *     during any processing and TP.SUCCEEDED after processing is complete.
     *     The default implementation simply sets the status to TP.SUCCEEDED.
     * @param {Object} aResult An optional object to set as the result for the
     *     request.
     * @returns {TP.core.JobGroup} The receiver.
     */

    this.$performOverChildren('complete', aResult);

    //  have to check to see if we already have an failed or cancelled
    //  status since that would imply we can't reset to a success status
    if (!this.isCompleted()) {
        this.set('statusCode', TP.SUCCEEDED);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JobGroup.Inst.defineMethod('error',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method error
     * @summary Tells the receiver there was an error in job processing.
     * @description If the receiver has specific behavior to implement it should
     *     override this method, but be sure to set the status to TP.ERRORING
     *     during any processing and TP.ERRORED after processing is complete.
     *     The default implementation simply sets the status to TP.ERRORED.
     * @param {String} aFaultString A string description of the error.
     * @param {Object} aFaultCode A code providing additional information on
     *     specific nature of the error. Often an exception or Error object.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the error.
     * @returns {TP.core.JobGroup} The receiver.
     */

    this.$performOverChildren('error', aFaultString, aFaultCode, aFaultInfo);

    if (TP.isValid(aFaultCode)) {
        //  note we don't signal change here
        this.set('faultCode', aFaultCode);
    }

    if (TP.isString(aFaultString)) {
        //  note we don't signal change here
        this.set('faultText', aFaultString);
    }

    if (TP.isValid(aFaultInfo)) {
        //  note we don't signal change here
        this.set('faultInfo', aFaultInfo);
    }

    this.set('statusCode', TP.ERRORED);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JobGroup.Inst.defineMethod('fail',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method fail
     * @summary Tells the receiver to fail, meaning it failed due to some form
     *     of exception. If the receiver has specific behavior to implement it
     *     should override this method, but be sure to set the status to
     *     TP.FAILING during any processing and TP.FAILED after processing is
     *     complete. The default implementation simply sets the fault code and
     *     updates status to TP.FAILED.
     * @param {String} aFaultString A string description of the fault.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the failure.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the failure.
     * @returns {TP.core.JobGroup} The receiver.
     */

    this.$performOverChildren('fail', aFaultString, aFaultCode, aFaultInfo);

    if (TP.isValid(aFaultCode)) {
        //  note we don't signal change here
        this.set('faultCode', aFaultCode);
    }

    if (TP.isString(aFaultString)) {
        //  note we don't signal change here
        this.set('faultText', aFaultString);
    }

    if (TP.isValid(aFaultInfo)) {
        //  note we don't signal change here
        this.set('faultInfo', aFaultInfo);
    }

    this.set('statusCode', TP.FAILED);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JobGroup.Inst.defineMethod('getChildren',
function() {

    /**
     * @method getChildren
     * @summary Returns the child job list.
     * @returns {TP.core.JobGroup} The receiver.
     */

    var children;

    if (TP.notValid(children = this.$get('children'))) {
        children = TP.ac();
        this.$set('children', children, false);
    }

    return children;
});
//  ------------------------------------------------------------------------

TP.core.JobGroup.Inst.defineMethod('pause',
function() {

    /**
     * @method pause
     * @summary Pauses the receiver if that operation is supportable by the
     *     particular type. Not all receivers of the pause operation are able to
     *     pause effectively (XMLHttpRequest for example).
     * @returns {TP.core.JobGroup} The receiver.
     */

    return this.$performOverChildren('pause');
});

//  ------------------------------------------------------------------------

TP.core.JobGroup.Inst.defineMethod('removeChild',
function(aChild) {

    /**
     * @method removeChild
     * @summary Removes a child object implementing the TP.core.JobStatus
     *     implementation from the receiving job group.
     * @param {TP.core.JobStatus} aChild The child TP.core.JobStatus to remove
     *     from this group.
     * @returns {TP.core.JobGroup} The receiver.
     */

    var children;

    children = this.getChildren();
    children.remove(aChild, TP.IDENTITY);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.JobGroup.Inst.defineMethod('reset',
function() {

    /**
     * @method reset
     * @summary Resets the receiver, returning it to its initial state.
     * @returns {TP.core.JobGroup} The receiver.
     */

    return this.$performOverChildren('reset');
});

//  ------------------------------------------------------------------------

TP.core.JobGroup.Inst.defineMethod('resume',
function() {

    /**
     * @method resume
     * @summary Resumes a paused receiver, if it was actually paused. Note that
     *     not all receivers can pause effectively and may ignore this call
     *     along with the pause() call itself.
     * @returns {TP.core.JobGroup} The receiver.
     */

    return this.$performOverChildren('resume');
});

//  ------------------------------------------------------------------------

TP.core.JobGroup.Inst.defineMethod('start',
function(parameters) {

    /**
     * @method start
     * @summary Starts the receiver in "job control" terms. This is the
     *     standard entry point method for activating a receiver relative to the
     *     job control subsystem.
     * @param {TP.core.Hash} parameters A hash of parameters the job function(s)
     *     can access.
     * @returns {TP.core.JobGroup} The receiver.
     */

    return this.$performOverChildren('start', parameters);
});

//  ------------------------------------------------------------------------

TP.core.JobGroup.Inst.defineMethod('shutdown',
function(now) {

    /**
     * @method shutdown
     * @summary Performs a clean shutdown of the receiver so it doesn't appear
     *     to have been terminated with an error or killed. This includes
     *     running the receiver's teardown/post-processing logic.
     * @description If "now" is true then any pending steps or job cycles (based
     *     on repeat count) are terminated before the teardown step.
     * @param {Boolean} now True to stop iterations and terminate now.
     * @returns {TP.core.JobGroup} The receiver.
     */

    return this.$performOverChildren('shutdown', now);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
