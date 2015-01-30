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
 * @type {TP.xmpp.IqResult}
 * @summary An Iq 'type="result"' wrapper.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Iq.defineSubtype('IqResult');

//  register as the proper type to use when the stanza is a 'result'
TP.xmpp.XMLNS.defineStanzaType('result', TP.xmpp.IqResult);

TP.xmpp.IqResult.set('template', '<iq type="result"></iq>');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
