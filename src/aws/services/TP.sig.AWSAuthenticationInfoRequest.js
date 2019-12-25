//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.sig.AWSAuthenticationRequest}
 * @summary A subtype of TP.sig.IORequest that is used in conjunction with
 *     the TP.aws.AWSService type to authenticate with Amazon Web Services.
 */

//  ------------------------------------------------------------------------

TP.sig.IORequest.defineSubtype('AWSAuthenticationInfoRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.AWSAuthenticationInfoRequest.Type.defineAttribute('responseType',
    'TP.sig.AWSAuthenticationInfoResponse');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sig.AWSAuthenticationInfoRequest.Inst.defineAttribute('authRequest');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
