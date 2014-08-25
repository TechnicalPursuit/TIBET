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
 * @type {TP.xmpp.PubsubPubsub}
 * @synopsis 
 */

//  ------------------------------------------------------------------------

TP.xmpp.Pubsub.defineSubtype('PubsubPubsub');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.PubsubPubsub.set('namespace', TP.xmpp.XMLNS.PUBSUB);

TP.xmpp.PubsubPubsub.set('tagname', 'pubsub');

TP.xmpp.PubsubPubsub.set('childTags',
        TP.ac('create', 'configure', 'subscribe', 'options',
        'affiliations', 'items', 'publish', 'retract',
        'subscription', 'subscriptions', 'unsubscribe'));

TP.xmpp.PubsubPubsub.register();

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
