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
