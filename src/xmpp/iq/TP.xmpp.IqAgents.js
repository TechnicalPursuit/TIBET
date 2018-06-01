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
 * @type {TP.xmpp.IqAgents}
 * @summary A wrapper for the IQ_AGENTS namespace'd payload element.
 */

//  ------------------------------------------------------------------------

TP.xmpp.IqPayload.defineSubtype('IqAgents');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.IqAgents.set('namespace', TP.xmpp.XMLNS.IQ_AGENTS);

TP.xmpp.IqAgents.set('childTags', TP.ac('agent'));

TP.xmpp.IqAgents.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.IqAgents.Inst.defineMethod('getAgents',
function() {

    /**
     * @method getAgents
     * @summary Returns an Array of TP.xmpp.IqAgent nodes from the receiver.
     * @returns {Element[]}
     */

    return this.getElementsByTagName('agent');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
