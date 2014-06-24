//  ========================================================================
/*
NAME:   TP.sig.ShellRequest.js
AUTH:   Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        The contents of this file are subject to the terms and conditions of
        the Technical Pursuit License ("TPL") Version 1.5, or subsequent
        versions as allowed by the TPL, and You may not copy or use this
        file in either source code or executable form, except in compliance
        with the terms and conditions of the TPL.  You may obtain a copy of
        the TPL (the "License") from Technical Pursuit Inc. at
        http://www.technicalpursuit.com.

        All software distributed under the License is provided strictly on
        an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR
        IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS ALL SUCH
        WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, QUIET ENJOYMENT,
        OR NON-INFRINGEMENT. See the License for specific language governing
        rights and limitations under the License.
*/
//  ========================================================================

/**
 * @type {TP.sig.ShellRequest}
 * @synopsis The primary type used to make requests of the shell. These requests
 *     can be made with or without a console to get shell processing to occur.
 *     This allows any object in the system to leverage the processing power of
 *     the shell without requiring a console UI.
 */

//  ------------------------------------------------------------------------

TP.sig.Request.defineSubtype('ShellRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Type.defineAttribute('responseType',
                                        'TP.sig.ShellResponse');

TP.sig.ShellRequest.Type.defineAttribute('tableName', 'history');

TP.sig.ShellRequest.Type.defineAttribute('defaultPolicy', TP.FIRE_ONE);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Type.defineMethod('construct',
function(aPayload) {

    /**
     * @name construct
     * @synopsis Constructs a new instance of the receiver, ensuring it is
     *     properly configured for use.
     * @param {String|TP.lang.Hash|TP.sig.Request} aPayload A string, hash, or
     *     other request whose value(s) will populate this new request.
     * @returns {TP.sig.ShellRequest} A new instance.
     */

    var payload;

    //  goal here is to unpackage other request payloads so we always
    //  construct a proper TP.sig.ShellRequest that can provide input to the
    //  shells
    if (TP.isString(aPayload)) {
        //  'cmd' become the command text, all other parameters default
        payload = TP.hc('cmd', aPayload);
    } else if (TP.canInvoke(aPayload, 'getPayload')) {
        //  other requests have their payloads extracted and reused
        payload = aPayload.getPayload();
    } else if (TP.canInvoke(aPayload, TP.ac('at', 'atPut'))) {
        //  dictionaries are used as is
        payload = aPayload;
    } else {
        //  nothing else is valid
        this.raise('TP.sig.InvalidParameter', arguments);

        return;
    }

    return this.callNextMethod(payload);
});

//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Type.defineMethod('shouldLog',
function() {

    /**
     * @name shouldLog
     * @synopsis Returns true when the signal can be logged during signal
     *     processing. The default is true for most signals, but this type of
     *     signal checks the 'shouldLogTSHSignals' TIBET configuration flags to
     *     see if it can currently be logged.
     * @returns {Boolean} True if the signal can be logged.
     * @todo
     */

    return TP.sys.shouldLogTSHSignals();
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  placeholder for command arguments
TP.sig.ShellRequest.Inst.defineAttribute('ARGUMENTS');
TP.sig.ShellRequest.Inst.defineAttribute('PARAMS');

//  what type of message? log, help, request, success, error, etc.
TP.sig.ShellRequest.Inst.defineAttribute('messageType', 'query');

//  the message itself.
TP.sig.ShellRequest.Inst.defineAttribute('message');

//  the subrequests used to process this request, if any.
TP.sig.ShellRequest.Inst.defineAttribute('subrequests');

//  timing variables used to track processing overhead
TP.sig.ShellRequest.Inst.defineAttribute('$timestart');
TP.sig.ShellRequest.Inst.defineAttribute('$evaltime');
TP.sig.ShellRequest.Inst.defineAttribute('$exectime');
TP.sig.ShellRequest.Inst.defineAttribute('$tagtime');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Inst.defineMethod('cancel',
function(aFaultCode, aFaultString) {

    /**
     * @name cancel
     * @synopsis Tells the receiver to cancel, meaning it is being rescinded by
     *     the user or calling process. If the receiver has specific behavior to
     *     implement it should override the cancelJob() method invoked as part
     *     of this method's operation.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the cancellation.
     * @param {String} aFaultString A string description of the fault.
     * @returns {TP.BREAK} 
     * @todo
     */

    this.callNextMethod();

    return TP.BREAK;
});

//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Inst.defineMethod('complete',
function(aResult) {

    /**
     * @name complete
     * @synopsis Tells the receiver to complete, meaning the receiver should do
     *     whatever finalization is necessary to reach the TP.SUCCEEDED state.
     *     If the receiver has specific behavior to implement it should override
     *     the completeJob() method invoked as part of this method's operation.
     * @param {Object} aResult An optional object to set as the result for the
     *     request.
     * @returns {TP.core.JobStatus} The receiver.
     * @todo
     */

    this.callNextMethod();

    return TP.CONTINUE;
});

//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Inst.defineMethod('fail',
function(aFaultCode, aFaultString, anException) {

    /**
     * @name fail
     * @synopsis Tells the receiver to fail, meaning it failed due to some form
     *     of exception. If the receiver has specific behavior to implement it
     *     should override the failJob() method invoked as part of this method's
     *     operation.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the failure.
     * @param {String} aFaultString A string description of the fault.
     * @param {TP.sig.Exception|String} anException An optional exception to
     *     raise.
     * @returns {TP.BREAK} 
     * @todo
     */

    if (this.isCompleting() || this.didComplete()) {
        return;
    }

    if (TP.isValid(anException)) {
        this.raise(anException,
                    arguments,
                    TP.ifInvalid(aFaultString, aFaultCode));
    }

    this.callNextMethod();

    return TP.BREAK;
});

//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Inst.defineMethod('getEvaltime',
function() {

    /**
     * @name getEvaltime
     * @synopsis Returns the amount of time in milliseconds that 'eval'
     *     processing occurred during request processing.
     * @returns {Number} 
     */

    return this.$summarizeSubrequestData('$evaltime');
});

//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Inst.defineMethod('getExectime',
function() {

    /**
     * @name getExectime
     * @synopsis Returns the amount of time in milliseconds that the entire
     *     request processing took.
     * @returns {Number} 
     */

    return this.$get('$exectime');
});

//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Inst.defineMethod('getOriginalCmdText',
function() {

    /**
     * @name getOriginalCmdText
     * @returns {String} 
     * @abstract
     * @todo
     */

    var text,

        cmdRoot,
        textContentNode;

    text = '';

    if (TP.isNode(cmdRoot = this.at('cmdRoot'))) {
        if (TP.isCDATASectionNode(
                textContentNode = TP.nodeGetFirstDescendantByType(
                                            cmdRoot,
                                            Node.CDATA_SECTION_NODE))) {
            text = TP.nodeGetTextContent(textContentNode);
        }
    }

    return text;
});

//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Inst.defineMethod('getTagtime',
function() {

    /**
     * @name getTagtime
     * @synopsis Returns the amount of time in milliseconds that tag-specific or
     *     built-in processing occurred during request processing.
     * @returns {Number} 
     */

    return this.$summarizeSubrequestData('$tagtime');
});

//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Inst.defineMethod('getMessageType',
function() {

    /**
     * @name getMessageType
     * @synopsis Returns the message type, one of a number of values which map
     *     directly to CSS entries and node templates used to provided
     *     theme-able output.
     * @returns {String} 
     */

    var val;

    if (TP.isValid(val = this.at('messageType'))) {
        return val;
    }

    return this.$get('messageType');
});

//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Inst.defineMethod('setMessageType',
function(aMessageType) {

    /**
     * @name setMessageType
     * @synopsis Sets the receiver's message type, which provides information to
     *     the responder on the nature of the request.
     * @param {String} aMessageType The message type. Typically a string such as
     *     message, help, success, error, etc.
     * @returns {TP.sig.ShellRequest} The receiver.
     */

    return this.atPut('messageType', aMessageType);
});

//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Inst.defineMethod('stderr',
function(output, request) {

    /**
     * @name stderr
     * @synopsis Standard function for writing error output during shell
     *     execution.
     * @param {Object} output The object to write to stderr.
     * @param {TP.sig.Request|TP.lang.Hash} request Optional
     *     request/parameters. Defaults to the receiver.
     * @todo
     */

    var req,
        shell;

    TP.debug('break.tsh_stderr');

    req = TP.request(TP.ifInvalid(request, this));
    if (TP.notTrue(req.at('cmdSilent'))) {
        shell = req.at('cmdShell');
        if (TP.canInvoke(shell, 'stderr')) {
            shell.stderr(output, req);
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Inst.defineMethod('stdin',
function() {

    /**
     * @name stdin
     * @synopsis Provides a common function for reading from "standard input"
     *     during shell execution. Standard input is always provided as an array
     *     of 0 to N items provided by the various stdout, stderr, and input
     *     redirection calls related to a request.
     * @returns {Array} An array of 0 to N input objects.
     * @todo
     */

    TP.debug('break.tsh_stdin');

    //  If the receiver has a value in TP.STDIN, use it. Otherwise return an
    //  empty Array.
    return TP.ifInvalid(this.at(TP.STDIN), TP.ac());
});

//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Inst.defineMethod('stdout',
function(output, request) {

    /**
     * @name stdout
     * @synopsis Standard function for writing valid output during shell
     *     execution.
     * @param {Object} output The object to write to stdout.
     * @param {TP.sig.Request|TP.lang.Hash} request Optional
     *     request/parameters. Defaults to the receiver.
     * @todo
     */

    var req,
        shell;

    TP.debug('break.tsh_stdout');

    req = TP.request(TP.ifInvalid(request, this));
    if (TP.notTrue(req.at('cmdSilent'))) {
        shell = req.at('cmdShell');
        if (TP.canInvoke(shell, 'stdout')) {
            shell.stdout(output, req);
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Inst.defineMethod('$summarizeSubrequestData',
function(aPropertyName) {

    /**
     * @name $summarizeSubrequestData
     * @synopsis When a request is processed via one or more subrequests we
     *     often need to provide a summary of that data for requestors.
     * @param {String} aPropertyName The name of the property to sum.
     * @returns {Number} The result of summing subrequest data for a particular
     *     value.
     */

    var cmds,
        data,
        sum;

    cmds = this.get('subrequests');
    if (TP.notEmpty(cmds)) {
        data = cmds.collect(
                function(item) {

                    return TP.ifInvalid(item.get(aPropertyName), 0);
                });

        if (TP.notEmpty(data)) {
            if (TP.isNumber(data.first())) {
                sum = 0;
                data.perform(
                    function(item) {

                        sum += item;
                    });

                return sum;
            }
        }

        return 0;
    }

    return this.get(aPropertyName);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
