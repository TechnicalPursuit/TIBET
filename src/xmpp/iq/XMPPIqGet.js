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
 * @type {TP.xmpp.IqGet}
 * @synopsis An Iq 'type="get"' wrapper.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Iq.defineSubtype('IqGet');

//  register as the proper type to use when the stanza is a 'get'
TP.xmpp.XMLNS.defineStanzaType('get', TP.xmpp.IqGet);

TP.xmpp.IqGet.set('template', '<iq type="get"></iq>');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.IqGet.Inst.defineMethod('expectsResponse',
function() {

    /**
     * @name expectsResponse
     * @synopsis A combined setter/getter for the 'response expected' flag. This
     *     flag defines whether the receiver will attempt to observe its message
     *     ID for result signals.
     * @param {Boolean} aFlag The new value for the flag, if used as a setter.
     * @returns {Boolean} The current flag value, after optional set.
     */

    return true;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
