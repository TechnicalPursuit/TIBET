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
 * @type {TP.xmpp.VCard}
 * @summary A wrapper for the VCard content type.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Payload.defineSubtype('VCard');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.VCard.set('namespace', TP.xmpp.XMLNS.VCARD);

TP.xmpp.VCard.set('tagname', 'vcard');

TP.xmpp.VCard.set('template',
        TP.join('<vcard xmlns="',
        TP.xmpp.XMLNS.VCARD,
        '"></vcard>'));

TP.xmpp.VCard.register();

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
