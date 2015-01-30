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
 * @type {TP.xmpp.XHTML}
 * @summary A wrapper for the XHTML content type.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Payload.defineSubtype('XHTML');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.XHTML.set('namespace', TP.xmpp.XMLNS.XHTML);

TP.xmpp.XHTML.set('tagname', 'html');

TP.xmpp.XHTML.register();

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
