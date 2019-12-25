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
 * @type {TP.sig.SalesforceAuthenticationRequest}
 * @summary A subtype of TP.sig.IORequest that is used in conjunction with
 *     the TP.Salesforce.SalesforceService type to authenticate with Salesforce.
 */

//  ------------------------------------------------------------------------

TP.sig.AuthenticationRequest.defineSubtype('SalesforceAuthenticationRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.SalesforceAuthenticationRequest.Type.defineAttribute('responseType',
    'TP.sig.SalesforceAuthenticationResponse');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
