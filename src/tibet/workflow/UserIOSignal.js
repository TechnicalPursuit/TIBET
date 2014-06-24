//  ========================================================================
/*
NAME:   TP.sig.UserIOSignal.js
AUTH:   Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.
*/
//  ========================================================================

/**
 * @type {TP.sig.UserIOSignal}
 * @synopsis A common MIXIN used for TP.sig.UserIORequest and
 *     TP.sig.UserIOResponse types so they can inherit directly from
 *     Request/Response as needed while sharing common UserIO functionality.
 */

//  ------------------------------------------------------------------------

//  NOTE that we're not a TP.sig.Signal, the attributes and methods here are
//  intended to be mixed in to TP.sig.Signal subtypes
TP.lang.Object.defineSubtype('sig:UserIOSignal');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.UserIOSignal.Type.defineMethod('shouldLog',
function() {

    return TP.sys.shouldLogUserIOSignals();
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  what type of message? help, request, success, error, prompt, etc.
TP.sig.UserIOSignal.Inst.defineAttribute('messageType', 'message');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.UserIOSignal.Inst.defineMethod('getMessageType',
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

TP.sig.UserIOSignal.Inst.defineMethod('isError',
function(aFlag) {

    /**
     * @name isError
     * @synopsis Combined setter/getter for whether the receiver represents an
     *     error response request.
     * @param {Boolean} aFlag True will signify the receiver holds an error
     *     message to respond to.
     * @returns {Boolean} 
     */

    if (TP.isBoolean(aFlag)) {
        if (TP.isValid(this.at('messageType'))) {
            this.atPut('messageType', aFlag);
        } else {
            this.$set('messageType', 'failure');
        }
    }

    return this.getMessageType() === 'failure';
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

