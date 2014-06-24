//  ========================================================================
/*
NAME:   TP.xmpp.OutputStream.js
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
 * @type {TP.xmpp.OutputStream}
 * @synopsis Stream subtype specific to output directed at the server. This type
 *     acts as a form of connection log, displaying the messages sent by the
 *     connection to the server.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Stream.defineSubtype('OutputStream');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.OutputStream.Inst.defineMethod('close',
function() {

    /**
     * @name close
     * @synopsis Closes the output stream, which serves to close the connection
     *     to the server since it closes the 'send document' being used for one
     *     half of the conversation.
     * @raises TP.sig.InvalidXMPPConnection
     * @returns {Boolean} True on success, false otherwise.
     */

    var conn;

    //  closing our 'document' with the server closes the connection
    if (TP.isValid(this.write(this.get('closingTag')))) {
        //  the write succeeded, we're closed now
        this.isOpen(false);

        //  we'll need data from our connection to do the send
        if (TP.notValid(conn = this.getConnection())) {
            return this.raise('TP.sig.InvalidXMPPConnection', arguments);
        }

        //  Note how we pass 'true' here because, for the stream to be
        //  closing, the server must've closed it and we need to pass that
        //  information along.
        conn.close(true);
    }

    return !this.isOpen();
});

//  ------------------------------------------------------------------------

TP.xmpp.OutputStream.Inst.defineMethod('read',
function() {

    /**
     * @name read
     * @synopsis Invalid operation for an output stream.
     * @raises TP.sig.InvalidOperation
     */

    return this.raise('TP.sig.InvalidOperation', arguments);
});

//  ------------------------------------------------------------------------

TP.xmpp.OutputStream.Inst.defineMethod('write',
function(content) {

    /**
     * @name write
     * @synopsis Writes the XML string provided to the receiver's associated
     *     server, acquired from the stream's connection object. This is the
     *     low-level 'send' operation for the XMPP subsystem.
     * @param {TP.xmpp.Stanza|String} content The content to write. If a stanza
     *     is provided it's converted into string form prior to sending.
     * @returns {TP.xmpp.OutputStream} The receiver.
     */

    var elem,
        str,
        conn;

    if (TP.notValid(content)) {
        return this.raise('TP.sig.InvalidParameter', arguments);
    }

    if (TP.isString(content) && TP.isEmpty(content)) {
        return this;
    }

    //  validate/convert input to a useable form, we need both string and
    //  element content for proper operation
    if (TP.isString(content)) {
        //  as long as we're not trying to close the stream, get an element
        //  if possible so we can keep our output stream content current
        if (!content.startsWith('</stream:stream')) {
            try {
                elem = TP.elementFromString(content);
            } catch (e) {
                return this.raise('TP.sig.DOMParseException',
                                    arguments,
                                    TP.ec(e, content));
            }
        }

        str = content;
    } else if (TP.isKindOf(content, TP.xmpp.Packet)) {
        //  should be a valid stanza
        elem = content.getNativeNode();

        //  NB: We pass false to the asString() here to avoid getting an XML
        //  declaration on the front of the representation.
        str = content.asString(false);
    } else {
        return this.raise('TP.sig.InvalidParameter', arguments);
    }

    //  NB: won't be a element when closing the connection
    if (TP.isValid(elem)) {
        //  capture the data in our stream
        TP.nodeAppendChild(this.getNativeNode(),
                            TP.nodeCloneNode(elem, true));
    }

    //  we'll need data from our connection to do the send
    if (TP.notValid(conn = this.getConnection())) {
        return this.raise('TP.sig.InvalidXMPPConnection', arguments);
    }

    conn.sendRaw(str);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
