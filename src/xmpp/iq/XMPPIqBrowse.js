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
 * @type {TP.xmpp.IqBrowse}
 * @summary A wrapper for the IQ_BROWSE namespace'd payload element.
 */

//  ------------------------------------------------------------------------

TP.xmpp.IqPayload.defineSubtype('IqBrowse');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.xmpp.IqBrowse.Type.defineAttribute('categories');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.IqBrowse.set('namespace', TP.xmpp.XMLNS.IQ_BROWSE);

TP.xmpp.IqBrowse.set('categories',
        TP.ac('application', 'conference', 'headline', 'item',
        'keyword', 'render', 'service', 'user'));

TP.xmpp.IqBrowse.register();

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
