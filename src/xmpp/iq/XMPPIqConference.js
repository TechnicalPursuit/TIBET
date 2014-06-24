//  ========================================================================
/*
NAME:   TP.xmpp.IqConference.js
AUTH:   Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.
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
