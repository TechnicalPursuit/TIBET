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
 * @summary A wrapper for item tags within the the IQ_ROSTER namespace'd
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
     * @method getGroupNames
     * @summary Returns an Array of group names this item belongs to.
     * @returns {String[]}
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
     * @method getJid
     * @summary Returns the TP.xmpp.JID instance associated with this item.
     * @returns {TP.xmpp.JID}
     */

    return TP.xmpp.JID.construct(this.getAttribute('jid'));
});

//  ------------------------------------------------------------------------

TP.xmpp.IqRosterItem.Inst.defineMethod('getNickname',
function() {

    /**
     * @method getNickname
     * @summary Returns the item's nickname, if any.
     * @returns {String}
     */

    return this.getAttribute('name');
});

//  ------------------------------------------------------------------------

TP.xmpp.IqRosterItem.Inst.defineMethod('getSubscription',
function() {

    /**
     * @method getSubscription
     * @summary Returns the subscription form (none, both, from, to) for the
     *     item.
     * @returns {String}
     */

    return this.getAttribute('subscription');
});

//  ------------------------------------------------------------------------

TP.xmpp.IqRosterItem.Inst.defineMethod('isPending',
function() {

    /**
     * @method isPending
     * @summary Returns true if the item's subscription is pending.
     * @returns {Boolean}
     */

    var ask;

    ask = this.getAttribute('ask');

    /* eslint-disable no-extra-parens */
    return TP.isValid(ask) && (ask !== '');
    /* eslint-enable no-extra-parens */
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
