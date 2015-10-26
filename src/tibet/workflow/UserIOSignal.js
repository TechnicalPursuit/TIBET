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
 * @type {TP.sig.UserIOSignal}
 * @summary A common MIXIN used for TP.sig.UserIORequest and
 *     TP.sig.UserIOResponse types so they can inherit directly from
 *     Request/Response as needed while sharing common UserIO functionality.
 */

//  ------------------------------------------------------------------------

//  NOTE that we're not a TP.sig.Signal, the attributes and methods here are
//  intended to be mixed in to TP.sig.Signal subtypes
TP.lang.Object.defineSubtype('sig.UserIOSignal');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation
TP.sig.UserIOSignal.isAbstract(true);

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

TP.sig.UserIOSignal.Inst.defineMethod('isError',
function(aFlag) {

    /**
     * @method isError
     * @summary Combined setter/getter for whether the receiver represents an
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
