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
 * @type {TP.sig.UserInputRequest}
 * @synopsis The common type used to get direct input from the user. In response
 *     to TP.sig.UserInputRequests the console will give control over the input
 *     cell content to the request, skipping any parsing of content.
 */

//  ------------------------------------------------------------------------

TP.sig.UserIORequest.defineSubtype('UserInputRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.UserInputRequest.Type.defineAttribute('responseType', 'TP.sig.UserInput');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  what type of message? help, request, success, error, etc.
TP.sig.UserInputRequest.Inst.defineAttribute('messageType', 'prompt');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================

