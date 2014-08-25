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
 * @type {TP.sig.RESTRequest}
 * @synopsis Simple REST request type with minimal encoding/serialization.
 */

//  ------------------------------------------------------------------------

TP.sig.HTTPRequest.defineSubtype('RESTRequest');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.sig.RESTRequest.Type.defineAttribute('responseType', 'TP.sig.RESTResponse');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
