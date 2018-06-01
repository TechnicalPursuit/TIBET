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
 * @type {TP.xmpp.IqRoster}
 * @summary A wrapper for the IQ_ROSTER namespace'd payload element.
 */

//  ------------------------------------------------------------------------

TP.xmpp.IqPayload.defineSubtype('IqRoster');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.IqRoster.set('namespace', TP.xmpp.XMLNS.IQ_ROSTER);

TP.xmpp.IqRoster.set('childTags', TP.ac('item'));

TP.xmpp.IqRoster.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.IqRoster.Inst.defineMethod('getGroupItems',
function(aGroupName) {

    /**
     * @method getGroupItems
     * @summary Returns an Array of TP.xmpp.IqRosterItem instances for the
     *     items which belong to the named group provided.
     * @param {String} aGroupName The group to filter by.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.xmpp.IqRosterItem[]}
     */

    var tpElems;

    if (TP.notValid(aGroupName)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    tpElems = this.getElementsByTagName('item');

    tpElems = tpElems.select(
                function(item) {

                    var i,
                        grps;

                    grps = item.getElementsByTagName('group');

                    for (i = 0; i < grps.getSize(); i++) {
                        if (grps.at(i).getTextContent() === aGroupName) {
                            return true;
                        }
                    }

                    return false;
                });

    return tpElems;
});

//  ------------------------------------------------------------------------

TP.xmpp.IqRoster.Inst.defineMethod('getGroupNames',
function() {

    /**
     * @method getGroupNames
     * @summary Returns an Array of group names in the roster.
     * @returns {Element[]}
     */

    var arr;

    arr = this.getElementsByTagName('group');
    arr.unique();

    return arr.collect(
                function(item) {

                    return item.getTextContent();
                });
});

//  ------------------------------------------------------------------------

TP.xmpp.IqRoster.Inst.defineMethod('getItems',
function() {

    /**
     * @method getItems
     * @summary Returns an Array of TP.xmpp.IqRosterItem instances for this
     *     roster.
     * @returns {Element[]}
     */

    return this.getElementsByTagName('item');
});

//  ------------------------------------------------------------------------

TP.xmpp.IqRoster.Inst.defineMethod('getSignalName',
function(aStanza) {

    /**
     * @method getSignalName
     * @summary Returns the signal name to use when signaling arrival of
     *     packets of this type. The default is XMPP*Input where the asterisk is
     *     replaced by the current tag/type string, for example
     *     TP.sig.XMPPMessageInput.
     * @param {TP.xmpp.Stanza} aStanza The stanza that 'owns' this element.
     * @returns {String}
     */

    return 'TP.sig.XMPPRosterInput';
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
