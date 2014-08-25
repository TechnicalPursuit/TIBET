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
 * @type {TP.xmpp.IqConference}
 * @synopsis A wrapper for the IQ_CONFERENCE namespace'd payload element.
 */

//  ------------------------------------------------------------------------

TP.xmpp.IqPayload.defineSubtype('IqConference');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.IqConference.set('namespace', TP.xmpp.XMLNS.IQ_CONFERENCE);

TP.xmpp.IqConference.set('childTags',
        TP.ac('nick', 'secret', 'name', 'privacy', 'id'));

TP.xmpp.IqConference.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.IqConference.Inst.defineMethod('getConferenceID',
function() {

    /**
     * @name getConferenceID
     * @synopsis Returns the ID of the conference.
     * @returns {String} 
     */

    return this.getChildTextContent('id');
});

//  ------------------------------------------------------------------------

TP.xmpp.IqConference.Inst.defineMethod('shouldHideJID',
function(aFlag) {

    /**
     * @name shouldHideJID
     * @synopsis A combined setter/getter defining whether the JID should be
     *     kept private when interacting with this conference.
     * @param {Boolean} aFlag The new flag value.
     * @returns {Boolean} The flag value, after optional set.
     * @todo
     */

    var child;

    if (TP.isBoolean(aFlag)) {
        if (aFlag) {
            //  force creation if non-existent
            this.getNamedDescendant('privacy', true);
        } else {
            if (TP.isValid(child = this.getNamedDescendant('privacy'))) {
                TP.nodeDetach(child);
            }
        }
    }

    return TP.isValid(this.getNamedDescendant('privacy'));
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
