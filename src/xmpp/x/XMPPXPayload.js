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
 * @type {TP.xmpp.XPayload}
 * @synopsis A wrapper for payload objects which use the X namespaces.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Payload.defineSubtype('XPayload');

TP.xmpp.XPayload.Type.defineAttribute('tagname', 'x');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
