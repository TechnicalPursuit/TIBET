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
 * @type {TP.xmpp.XEncrypted}
 * @synopsis A wrapper for the X_ENCRYPTED namespace'd payload element.
 */

//  ------------------------------------------------------------------------

TP.xmpp.XPayload.defineSubtype('XEncrypted');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.XEncrypted.set('namespace', TP.xmpp.XMLNS.X_ENCRYPTED);

TP.xmpp.XEncrypted.register();

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
