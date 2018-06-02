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
 * @type {TP.sig.ShellRequest}
 * @summary The primary type used to make requests of the shell. These requests
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
     * @method construct
     * @summary Constructs a new instance of the receiver, ensuring it is
     *     properly configured for use.
     * @param {String|TP.core.Hash|TP.sig.Request} aPayload A string, hash, or
     *     other request whose value(s) will populate this new request.
     * @returns {TP.sig.ShellRequest|undefined} A new instance.
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
    } else if (TP.canInvokeInterface(aPayload, TP.ac('at', 'atPut'))) {
        //  dictionaries are used as is
        payload = aPayload;
    } else {
        //  nothing else is valid
        this.raise('TP.sig.InvalidParameter');

        return;
    }

    return this.callNextMethod(payload);
});

//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Type.defineMethod('shouldLog',
function() {

    /**
     * @method shouldLog
     * @summary Returns true when the signal can be logged during signal
     *     processing. The default is true for most signals, but this type of
     *     signal checks the 'shouldLogTSHSignals' TIBET configuration flags to
     *     see if it can currently be logged.
     * @returns {Boolean} True if the signal can be logged.
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

TP.sig.ShellRequest.Inst.defineMethod('asDumpString',
function(depth, level) {

    /**
     * @method asDumpString
     * @summary Returns the receiver as a string suitable for use in log
     *     output.
     * @param {Number} [depth=1] Optional max depth to descend into target.
     * @param {Number} [level=1] Passed by machinery, don't provide this.
     * @returns {String} A new String containing the dump string of the
     *     receiver.
     */

    var origPayload,
        payload;

    origPayload = this.getPayload();

    //  Copy the original payload and just make 'cmdShell' and 'cmdPeer' have
    //  values of their ID - this avoids the recursion trap and its output.
    payload = origPayload.copy();
    payload.atPut('cmdShell', TP.id(origPayload.at('cmdShell')));
    payload.atPut('cmdPeer', TP.id(origPayload.at('cmdPeer')));

    this.setPayload(payload);

    this.callNextMethod();

    this.setPayload(origPayload);

    return TP.BREAK;
});

//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Inst.defineMethod('cancel',
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
     * @returns {TP.BREAK}
     */

    this.callNextMethod();

    return TP.BREAK;
});

//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Inst.defineMethod('complete',
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

    var responder;

    this.callNextMethod();

    responder = this.get('responder');
    if (TP.canInvoke(responder, 'saveProfile')) {
        setTimeout(function() {
            responder.saveProfile();
        }, 0);
    }

    return TP.CONTINUE;
});

//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Inst.defineMethod('fail',
function(aFaultString, aFaultCode, aFaultInfo) {

    /**
     * @method fail
     * @summary Tells the receiver to fail, meaning it failed due to some form
     *     of exception. If the receiver has specific behavior to implement it
     *     should override the failJob() method invoked as part of this method's
     *     operation.
     * @param {String} aFaultString A string description of the fault.
     * @param {Object} aFaultCode A code providing additional information on the
     *     reason for the failure.
     * @param {TP.core.Hash} aFaultInfo An optional parameter that will contain
     *     additional information about the failure.
     * @returns {TP.BREAK|undefined}
     */

    if (this.isCompleting() || this.didComplete()) {
        return;
    }

    this.callNextMethod();

    return TP.BREAK;
});

//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Inst.defineMethod('getEvaltime',
function() {

    /**
     * @method getEvaltime
     * @summary Returns the amount of time in milliseconds that 'eval'
     *     processing occurred during request processing.
     * @returns {Number}
     */

    return this.$summarizeSubrequestData('$evaltime');
});

//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Inst.defineMethod('getExectime',
function() {

    /**
     * @method getExectime
     * @summary Returns the amount of time in milliseconds that the entire
     *     request processing took.
     * @returns {Number}
     */

    return this.$get('$exectime');
});

//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Inst.defineMethod('getOriginalCmdText',
function() {

    /**
     * @method getOriginalCmdText
     * @summary
     * @returns {String}
     */

    var text,
        cmds,
        cmdRoot,
        textContentNode;

    text = '';

    //  If we have multiple subrequests then we're dealing with a pipe and the
    //  only real way to respond is via 'cmd' slot.
    cmds = this.get('subrequests');
    if (TP.notEmpty(cmds) && cmds.getSize() > 1) {
        if (TP.isEmpty(text = this.at('cmd'))) {
            text = '';
        }
    }

    if (TP.isEmpty(text)) {
        if (TP.isNode(cmdRoot = this.at('cmdRoot'))) {
            if (TP.isCDATASectionNode(
                    textContentNode = TP.nodeGetFirstDescendantByType(
                                                cmdRoot,
                                                Node.CDATA_SECTION_NODE))) {
                text = TP.nodeGetTextContent(textContentNode);
            }
        }
    }

    //  Some commands (like a history entry) will not have content in the
    //  cmdRoot node, but will in its 'cmdTitle'.

    if (TP.isEmpty(text)) {
        if (TP.isEmpty(text = this.at('cmdTitle'))) {
            text = '';
        }
    }

    //  Some commands (like the ':history' command itself) will not have content
    //  in either place, but will in its 'cmd' property.

    if (TP.isEmpty(text)) {
        if (TP.isEmpty(text = this.at('cmd'))) {
            text = '';
        }
    }

    return text;
});

//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Inst.defineMethod('getTagtime',
function() {

    /**
     * @method getTagtime
     * @summary Returns the amount of time in milliseconds that tag-specific or
     *     built-in processing occurred during request processing.
     * @returns {Number}
     */

    return this.$summarizeSubrequestData('$tagtime');
});

//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Inst.defineMethod('getMessageType',
function() {

    /**
     * @method getMessageType
     * @summary Returns the message type, one of a number of values which map
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
     * @method setMessageType
     * @summary Sets the receiver's message type, which provides information to
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
     * @method stderr
     * @summary Standard function for writing error output during shell
     *     execution.
     * @param {Object} output The object to write to stderr.
     * @param {TP.sig.Request|TP.core.Hash|undefined} request Optional
     *     request/parameters. Defaults to the receiver.
     */

    var req,
        shell;

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
     * @method stdin
     * @summary Provides a common function for reading from "standard input"
     *     during shell execution. Standard input is always provided as an array
     *     of 0 to N items provided by the various stdout, stderr, and input
     *     redirection calls related to a request.
     * @returns {Object[]} An array of 0 to N input objects.
     */

    var stdin;

    stdin = this.at(TP.STDIN);
    if (TP.notValid(stdin)) {
        stdin = TP.ac();
    }

    return stdin;
});

//  ------------------------------------------------------------------------

TP.sig.ShellRequest.Inst.defineMethod('stdout',
function(output, request) {

    /**
     * @method stdout
     * @summary Standard function for writing valid output during shell
     *     execution.
     * @param {Object} output The object to write to stdout.
     * @param {TP.sig.Request|TP.core.Hash|undefined} request Optional
     *     request/parameters. Defaults to the receiver.
     */

    var req,
        shell;

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
     * @method $summarizeSubrequestData
     * @summary When a request is processed via one or more subrequests we
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
