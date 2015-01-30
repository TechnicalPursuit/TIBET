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
 * @type {TP.sig.ShellResponse}
 * @summary The common response type for TP.sig.ShellRequest instances. These
 *     responses provide the shell's response to incoming requests and are the
 *     common response mechanism between a shell requestor and the shell.
 */

//  ------------------------------------------------------------------------

TP.sig.Response.defineSubtype('ShellResponse');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  what type of message? help, request, success, error, etc.
TP.sig.ShellResponse.Inst.defineAttribute('messageType', 'response');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.ShellResponse.Type.defineMethod('shouldLog',
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
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.ShellResponse.Inst.defineMethod('init',
function(aRequest, aResult) {

    /**
     * @method init
     * @summary Initialize a new instance. The request should be the original
     *     TP.sig.Request instance while the optional result is whatever data
     *     should be assigned to the request as the result.
     * @param {TP.sig.Request} aRequest A request object. In the case of
     *     TP.sig.Response instances the request object provided here must be a
     *     TP.sig.Request instance, not one of the more loosely typed "request
     *     hash" types used by other request-oriented methods.
     * @param {Object} aResult A result object.
     * @returns {TP.sig.Response} A new instance.
     */

    this.$set('result', undefined, false, true);

    switch (arguments.length) {
        case 0:
            return this.callNextMethod();
        case 1:
            return this.callNextMethod(aRequest);
        case 2:
            return this.callNextMethod(aRequest, aResult);
    }
});

//  ------------------------------------------------------------------------

TP.sig.ShellResponse.Inst.defineMethod('getMessageType',
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
//  end
//  ========================================================================
