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
 * @type {TP.xmpp.Session}
 * @summary A wrapper for the XMPP session element.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Payload.defineSubtype('Session');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.Session.set('namespace', TP.xmpp.XMLNS.SESSION);

TP.xmpp.Session.set('tagname', 'session');

TP.xmpp.Session.register();

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
