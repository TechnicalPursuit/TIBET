//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/* global importScripts:false */

//  ------------------------------------------------------------------------

self.importJS = function(url) {

    /**
     * @method importJS
     * @summary Imports JavaScript source code from the supplied URL and makes
     *     it available in this thread. Note that this is a synchronous
     *     operation.
     * @param {String} url The URL to load JavaScript code from.
     */

    importScripts(url);
};

//  ------------------------------------------------------------------------

self.evalJS = function(src) {

    /**
     * @method evalJS
     * @summary Evaluates JavaScript source code from the supplied source String
     *     and makes it available in this thread. Note that this is a
     *     synchronous operation.
     * @param {String} src The JavaScript source text.
     * @returns Object The return value produced by the eval invocation.
     */

    /* eslint-disable no-eval */
    return eval(src);
    /* eslint-enable no-eval */
};

//  ------------------------------------------------------------------------

self.evalJSNoReturn = function(src) {

    /**
     * @method evalJSNoReturn
     * @summary Evaluates JavaScript source code from the supplied source String
     *     and makes it available in this thread. This method does not produce a
     *     return value. Note that this is a synchronous operation.
     * @param {String} src The JavaScript source text.
     */

    /* eslint-disable no-eval */
    eval(src);
    /* eslint-enable no-eval */
};

//  ------------------------------------------------------------------------

//  A generic 'dispatcher' sitting inside of the worker helper that can invoke a
//  custom function.
self.addEventListener(
        'message',
        function(evt) {
            var msgData,
                msgResult,

                key,

                resultFunc;

            //  The msgData is the data that was 'sent over' by the call that
            //  triggered this worker to run.
            msgData = evt.data;

            msgResult = {};

            //  Iterate over message data and copy local data to the message
            //  result. This will populate all of the 'sent' data, except the
            //  params, onto the result. This is so that the code that triggered
            //  this worker can attempt to match the call if multiple calls have
            //  been fired.
            //  Note that the reason 'params' are not sent back is that, in
            //  creating them here, the system very well might have create
            //  unclonable objects that cannot be sent back.
            for (key in msgData) {
                if (!msgData.hasOwnProperty(key) || key === 'params') {
                    continue;
                }
                msgResult[key] = msgData[key];
            }

            //  If the call is to be treated as asynchronous, then we need to
            //  set up a callback to post the results back when the callback is
            //  called.
            //  Note that the code that triggered this worker needs to have been
            //  written such that the callback will be the *last* parameter in
            //  its signature.
            if (msgData.async) {

                //  Define a callback function that will gather up the results,
                //  set the msgResult's '.result' to them and post the message
                //  result back to the code that triggered this worker.
                resultFunc = function() {
                    var i,
                        len;

                    //  Gather up results here - it's better to leave the
                    //  'arguments' object alone rather than trying to have the
                    //  system serialize it to send the results back.
                    msgResult.result = [];
                    len = arguments.length;
                    for (i = 0; i < len; i++) {
                        msgResult.result.push(arguments[i]);
                    }

                    self.postMessage(msgResult);
                };

                //  Push the callback function onto the end of the '.params'
                //  before calling apply(). Note that this is why the callback
                //  parameter *must* be last in the method signature of the
                //  method being invoked.
                msgData.params.push(resultFunc);

                //  Invoke the method named in 'msgData.funcRef' against the
                //  object named in 'msgData.thisRef' by using an 'apply' and
                //  the decoded '.params' data structure on the message data.
                //  The callback will handle the result.
                self[msgData.thisRef][msgData.funcRef].apply(
                    self[msgData.thisRef],
                    msgData.params);

            } else {

                //  Invoke the method named in 'msgData.funcRef' against the
                //  object named in 'msgData.thisRef' by using an 'apply' and
                //  the decoded '.params' data structure on the message data.
                //  Set the msgResult's '.result' to the result of the
                //  invocation.
                msgResult.result =
                        self[msgData.thisRef][msgData.funcRef].apply(
                            self[msgData.thisRef],
                            msgData.params);

                //  Post the message result back to the code that triggered this
                //  worker.
                self.postMessage(msgResult);
            }

            return;
        });

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
