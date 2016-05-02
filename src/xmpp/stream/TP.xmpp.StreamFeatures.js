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
 * @type {TP.xmpp.StreamFeatures}
 * @summary A wrapper for the stream features element
 */

//  ------------------------------------------------------------------------

TP.xmpp.Packet.defineSubtype('StreamFeatures');

TP.xmpp.StreamFeatures.set('namespace', TP.xmpp.XMLNS.STREAM);
TP.xmpp.StreamFeatures.set('tagname', 'features');

TP.xmpp.StreamFeatures.set('template',
        TP.join('<features xmlns="', TP.xmpp.XMLNS.STREAM, '"></features>'));

TP.xmpp.StreamFeatures.register();

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
