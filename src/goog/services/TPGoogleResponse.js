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
 * @type {TP.sig.GoogleResponse}
 * @synopsis A subtype of TP.sig.HTTPResponse that knows how to handle responses
 *     from generic Google servers. Usually, subclasses of this type are created
 *     to perform more specific tasks, but one notable exception is that
 *     instances of this type will act as responses for TP.sig.GoogleRequests
 *     that are used for 'ClientLogin' Google authentication functionality.
 */

//  ------------------------------------------------------------------------

TP.sig.HTTPResponse.defineSubtype('GoogleResponse');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
