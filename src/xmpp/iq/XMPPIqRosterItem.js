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
 * @type {TP.xmpp.IqRosterItem}
 * @synopsis A wrapper for item tags within the the IQ_ROSTER namespace'd
 *     payload element.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Node.defineSubtype('IqRosterItem');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.IqRosterItem.set('namespace', TP.xmpp.XMLNS.IQ_ROSTER);

TP.xmpp.IqRosterItem.set('tagname', 'item');

TP.xmpp.IqRosterItem.set('template', '<item jid="" subscription=""></item>');

TP.xmpp.IqRosterItem.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.IqRosterItem.Inst.defineMethod('getGroupNames',
function() {

    /**
     * @name getGroupNames
     * @synopsis Returns an Array of group names this item belongs to.
     * @returns {Array} 
     */

    var arr;

    arr = this.getElementsByTagName('group');

    return arr.collect(
                function(item) {

                    return item.getTextContent();
                });
});

//  ------------------------------------------------------------------------

TP.xmpp.IqRosterItem.Inst.defineMethod('getJid',
function() {

    /**
     * @name getJid
     * @synopsis Returns the TP.xmpp.JID instance associated with this item.
     * @returns {TP.xmpp.JID} 
     */

    return TP.xmpp.JID.construct(this.getAttribute('jid'));
});

//  ------------------------------------------------------------------------

TP.xmpp.IqRosterItem.Inst.defineMethod('getNickname',
function() {

    /**
     * @name getNickname
     * @synopsis Returns the item's nickname, if any.
     * @returns {String} 
     */

    return this.getAttribute('name');
});

//  ------------------------------------------------------------------------

TP.xmpp.IqRosterItem.Inst.defineMethod('getSubscription',
function() {

    /**
     * @name getSubscription
     * @synopsis Returns the subscription form (none, both, from, to) for the
     *     item.
     * @returns {String} 
     */

    return this.getAttribute('subscription');
});

//  ------------------------------------------------------------------------

TP.xmpp.IqRosterItem.Inst.defineMethod('isPending',
function() {

    /**
     * @name isPending
     * @synopsis Returns true if the item's subscription is pending.
     * @returns {Boolean} 
     */

    var ask;

    ask = this.getAttribute('ask');

    return TP.isValid(ask) && (ask !== '');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
