//  ========================================================================
/*
NAME:   TP.xmpp.XEvent.js
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
 * @type {TP.xmpp.XEvent}
 * @synopsis A wrapper for the X_EVENT namespace'd payload element.
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
     * @name getEventMsgID
     * @synopsis Returns the message ID this event is bound to.
     * @returns {String} 
     */

    return this.getChildTextContent('id');
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
