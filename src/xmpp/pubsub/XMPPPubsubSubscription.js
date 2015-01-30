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
 * @type {TP.xmpp.PubsubSubscription}
 * @summary A wrapper for the PubSub subscription node type.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Pubsub.defineSubtype('PubsubSubscription');

TP.xmpp.PubsubSubscription.set('tagname', 'subscription');

//  For subtypes of TP.xmpp.Pubsub, we register ourself using an XPath
TP.xmpp.Pubsub.registerPubsubType(TP.xmpp.XMLNS.PUBSUB,
        './$def:subscription', TP.xmpp.PubsubSubscription);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.PubsubSubscription.Inst.defineMethod('getJID',
function() {

    /**
     * @method getJID
     * @summary Returns the string value of the receiver's jid attribute.
     * @returns {String}
     */

    return this.getAttribute('jid');
});

//  ------------------------------------------------------------------------

TP.xmpp.PubsubSubscription.Inst.defineMethod('getNode',
function() {

    /**
     * @method getNode
     * @summary Returns the string value of the receiver's node attribute.
     * @returns {String}
     */

    return this.getAttribute('node');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
