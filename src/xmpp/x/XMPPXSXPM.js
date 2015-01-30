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
 * @type {TP.xmpp.XSXPM}
 * @summary A wrapper for the X_SXPM namespace'd payload element.
 */

//  ------------------------------------------------------------------------

TP.xmpp.XPayload.defineSubtype('XSXPM');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.XSXPM.set('namespace', TP.xmpp.XMLNS.X_SXPM);

TP.xmpp.XSXPM.set('childTags', TP.ac('board', 'map', 'data', 'cursor'));

TP.xmpp.XSXPM.register();

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
