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
 * @type {TP.xmpp.Message}
 * @summary A message element wrapper. This node type provides convenience
 *     methods for working with XMPP message elements.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Stanza.defineSubtype('Message');

TP.xmpp.Message.set('tagname', 'message');

TP.xmpp.Message.set('stanzaTypes',
        TP.ac('normal', 'chat', 'groupchat', 'headline', 'error'));

TP.xmpp.Message.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.Message.Inst.defineHandler('Request',
function() {

    /**
     * @method handleRequest
     * @summary Constructs an appropriate response object based on the current
     *     packet. For message packets the response uses the same message type
     *     and simply inverts the from/to attributes.
     * @returns {TP.xmpp.Stanza}
     */

    var thread,
        msgID,
        inst;

    inst = TP.xmpp.Message.construct(null,
                                        this.get('tagType'),
                                        this.get('from'));
    inst.set('from', this.get('to'));

    if (TP.isValid(msgID = this.get('msgID')) && msgID !== '') {
        inst.set('msgID', msgID);
    }

    if (TP.isValid(thread = this.get('thread')) && thread !== '') {
        inst.set('thread', thread);
    }

    return inst;
});

//  ------------------------------------------------------------------------

TP.xmpp.Message.Inst.defineMethod('getBody',
function() {

    /**
     * @method getBody
     * @summary Returns the body text, i.e. the message, from the receiver.
     * @returns {String}
     */

    return this.getChildTextContent('body');
});

//  ------------------------------------------------------------------------

TP.xmpp.Message.Inst.defineMethod('getDefaultType',
function() {

    /**
     * @method getDefaultType
     * @summary Returns the default stanza type for the receiver.
     * @returns {String}
     */

    return 'normal';
});

//  ------------------------------------------------------------------------

TP.xmpp.Message.Inst.defineMethod('getHTML',
function() {

    /**
     * @method getHTML
     * @summary Returns the HTML content, if any, of the receiver.
     * @returns {String}
     */

    var tpNodes,
        str;

    //  since it's valid markup, and not escaped, the xhtml content will
    //  end up parsed into DOM structures...so we have to manage that here
    tpNodes = this.getElementsByTagName('html');
    if (TP.isArray(tpNodes) && TP.isValid(tpNodes.at(0))) {
        str = tpNodes.at(0).asString();
        if (TP.isString(str)) {
            //  note that without patches this will fail
            return str.slice(6, -7);
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xmpp.Message.Inst.defineMethod('getSignalName',
function(aStanza) {

    /**
     * @method getSignalName
     * @summary Returns the signal name to use when signaling arrival of
     *     packets of this type. The default is XMPP*Input where the asterisk is
     *     replaced by the current tag/type string, for example
     *     TP.sig.XMPPMessageInput.
     * @description Since this TP.xmpp.Node type *is* a stanza, 'aStanza' will
     *     be null. This method should 'pass along' the receiver to any nested
     *     getSignalName() calls as the stanza.
     * @param {TP.xmpp.Stanza} aStanza The stanza that 'owns' this element.
     * @returns {String}
     */

    var payload;

    payload = this.get('payload');

    //  if we have only one packet, let it determine the signal name
    if (TP.isValid(payload)) {
        if (payload.getSize() === 1) {
            //  Note how we pass ourself along as the 'stanza'.
            return payload.at(0).getSignalName(this);
        } else if (payload.getSize() === 2) {
            if (payload.at(0).getTagName().toLowerCase() === 'headers') {
                //  Note how we pass ourself along as the 'stanza'.
                return payload.at(1).getSignalName(this);
            } else if (payload.at(1).getTagName().toLowerCase() === 'headers') {
                //  Note how we pass ourself along as the 'stanza'.
                return payload.at(0).getSignalName(this);
            }
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xmpp.Message.Inst.defineMethod('getSignalOrigin',
function(aStanza) {

    /**
     * @method getSignalOrigin
     * @summary Returns the signal origin to use when signaling arrival of
     *     packets of this type.
     * @description Since this TP.xmpp.Node type *is* a stanza, 'aStanza' will
     *     be null. This method should 'pass along' the receiver to any nested
     *     getSignalOrigin() calls as the stanza. This method should return
     *     TP.NONE if it does not want the XMPP connection to send a signal on
     *     the receiver's behalf.
     * @param {TP.xmpp.Stanza} aStanza The stanza that 'owns' this element.
     * @returns {Object|String|Object[]} The origin(s) to use when signaling.
     */

    var payload;

    payload = this.get('payload');

    //  if we have only one packet, let it determine the signal name
    if (TP.isValid(payload)) {
        if (payload.getSize() === 1) {
            //  Note how we pass ourself along as the 'stanza'.
            return payload.at(0).getSignalOrigin(this);
        } else if (payload.getSize() === 2) {
            if (payload.at(0).getTagName().toLowerCase() === 'headers') {
                //  Note how we pass ourself along as the 'stanza'.
                return payload.at(1).getSignalOrigin(this);
            } else if (payload.at(1).getTagName().toLowerCase() === 'headers') {
                //  Note how we pass ourself along as the 'stanza'.
                return payload.at(0).getSignalOrigin(this);
            }
        }
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xmpp.Message.Inst.defineMethod('getSubject',
function() {

    /**
     * @method getSubject
     * @summary Returns the subject, if any, of the receiver.
     * @returns {String}
     */

    return this.getChildTextContent('subject');
});

//  ------------------------------------------------------------------------

TP.xmpp.Message.Inst.defineMethod('getThread',
function() {

    /**
     * @method getThread
     * @summary Returns the thread id, if any, of the receiver.
     * @returns {String}
     */

    return this.getChildTextContent('thread');
});

//  ------------------------------------------------------------------------

TP.xmpp.Message.Inst.defineMethod('setBody',
function(aString) {

    /**
     * @method setBody
     * @summary Sets the text message content of the receiver.
     * @param {String} aString The message's text content.
     * @returns {TP.xmpp.Message} The receiver.
     */

    var elem;

    elem = this.getNamedDescendant('body', true);
    TP.nodeSetTextContent(elem, aString);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.Message.Inst.defineMethod('setHTML',
function(aString) {

    /**
     * @method setHTML
     * @summary Sets the HTML content of the receiver. If the content includes
     *     an opening/closing HTML tag pair it is removed.
     * @param {String} aString The HTML content to set.
     * @returns {TP.xmpp.Message} The receiver.
     */

    var str,
        htmlElem,
        elem;

    //  to keep things symmetrical we'll do this as a node
    if (aString.startsWith('<ht' + 'ml>')) {
        //  note that without patches this will fail
        str = aString.slice(6, -7);
    } else {
        str = aString;
    }

    elem = this.getNamedDescendant('html', true);
    htmlElem = TP.elementFromString(str);

    if (!TP.isElement(htmlElem)) {
        return this.raise('TP.sig.InvalidXMPPMarkup', str);
    }

    TP.nodeAppendChild(elem, htmlElem);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.Message.Inst.defineMethod('setSubject',
function(aString) {

    /**
     * @method setSubject
     * @summary Sets the subject value for the receiver.
     * @param {String} aString The subject line text.
     * @returns {TP.xmpp.Message} The receiver.
     */

    var elem;

    elem = this.getNamedDescendant('subject', true);
    TP.nodeSetTextContent(elem, aString);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.Message.Inst.defineMethod('setThread',
function(aString) {

    /**
     * @method setThread
     * @summary Sets the thread ID for the receiver.
     * @param {String} aString The thread ID.
     * @returns {TP.xmpp.Message} The receiver.
     */

    var elem;

    elem = this.getNamedDescendant('thread', true);
    TP.nodeSetTextContent(elem, aString);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
