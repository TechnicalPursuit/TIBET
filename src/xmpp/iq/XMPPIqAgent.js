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
 * @type {TP.xmpp.IqAgent}
 * @summary A wrapper for the IQ_AGENT namespace'd payload element.
 */

//  ------------------------------------------------------------------------

TP.xmpp.IqPayload.defineSubtype('IqAgent');


//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.IqAgent.set('namespace', TP.xmpp.XMLNS.IQ_AGENT);

TP.xmpp.IqAgent.set('childTags',
        TP.ac('name', 'description', 'transport', 'url', 'service',
        'register', 'search'));

TP.xmpp.IqAgent.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.IqAgent.Inst.defineMethod('getJID',
function() {

    /**
     * @method getJID
     * @summary Returns the string value of the receiver's jid attribute.
     * @returns {String}
     */

    return this.getAttribute('jid');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
