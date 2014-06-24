//  ========================================================================
/*
NAME:   TP.sig.ShellResponse.js
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
 * @type {TP.sig.ShellResponse}
 * @synopsis The common response type for TP.sig.ShellRequest instances. These
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
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.ShellResponse.Inst.defineMethod('getMessageType',
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
//  end
//  ========================================================================
