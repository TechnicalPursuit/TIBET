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
 * @type {TP.sig.UserOutputRequest}
 * @synopsis The primary type used to provide output to the user. In response to
 *     requests of this type the console will look up a template and use it to
 *     format output for display.
 */

//  ------------------------------------------------------------------------

TP.sig.UserIORequest.defineSubtype('UserOutputRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.UserOutputRequest.Type.defineAttribute('responseType', 'TP.sig.UserOutput');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  what type of message? help, request, success, error, etc.
TP.sig.UserOutputRequest.Inst.defineAttribute('messageType', 'message');

//  the node used to display the output for this request
TP.sig.UserOutputRequest.Inst.defineAttribute('outputNode');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sig.UserOutputRequest.Inst.defineMethod('getOutputNode',
function() {

    /**
     * @name getOutputNode
     * @synopsis Returns the output node used to display output for this
     *     request. Requestors can leverage this to get a handle to the actual
     *     output cell without having direct knowledge of the console used to
     *     perform the output itself.
     * @returns {Node} 
     */

    return this.$get('outputNode');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

