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
 * @type {TP.xmpp.XEvent}
 * @summary A wrapper for the X_EVENT namespace'd payload element.
 */

//  ------------------------------------------------------------------------

TP.xmpp.XPayload.defineSubtype('XEvent');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.XEvent.set('namespace', TP.xmpp.XMLNS.X_EVENT);

TP.xmpp.XEvent.set('childTags',
        TP.ac('id', 'offline', 'delivered', 'displayed', 'composing'));

TP.xmpp.XEvent.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.XEvent.Inst.defineMethod('getEventMsgID',
function() {

    /**
     * @method getEventMsgID
     * @summary Returns the message ID this event is bound to.
     * @returns {String}
     */

    return this.getChildTextContent('id');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
