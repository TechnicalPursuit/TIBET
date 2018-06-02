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
 * @type {TP.xmpp.BOSHTransport}
 * @summary Implements a subtype of TP.xmpp.Transport that implements the
 *     'XEP-124 Binding' specification.
 *     behavior. Implement a queued sending model.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Transport.defineSubtype('BOSHTransport');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  The maximum number of requests the server should be holding at one time.
//  Since browsers don't really support HTTP Pipelining, this is always set
//  to 1.
TP.xmpp.BOSHTransport.Type.defineConstant('MAXIMUM_HOLD', 1);

//  The maximum time, in seconds, the server should wait before returning
//  from a request.
TP.xmpp.BOSHTransport.Type.defineConstant('MAXIMUM_WAIT', 60);

//  The maximum number of packets that we can send throughout the course of
//  having this transport open. This is important in 'request ID'
//  computations. Currently set to 1 billion.
TP.xmpp.BOSHTransport.Type.defineConstant('MAXIMUM_PACKETS', 1000000000);

//  The number of message keys to generate at once.
TP.xmpp.BOSHTransport.Type.defineConstant('MSG_KEY_COUNT', 20);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xmpp.BOSHTransport.Inst.defineAttribute('$version', 1.6);

TP.xmpp.BOSHTransport.Inst.defineAttribute('httpServerURI');

//  holds the current number of messages for this instance
TP.xmpp.BOSHTransport.Inst.defineAttribute('msgCount', 0);

TP.xmpp.BOSHTransport.Inst.defineAttribute('receiveChannel');
TP.xmpp.BOSHTransport.Inst.defineAttribute('sendChannel');

TP.xmpp.BOSHTransport.Inst.defineAttribute('sessionID');

TP.xmpp.BOSHTransport.Inst.defineAttribute('lastRID');

TP.xmpp.BOSHTransport.Inst.defineAttribute('msgKeys');

TP.xmpp.BOSHTransport.Inst.defineAttribute('wait');

TP.xmpp.BOSHTransport.Inst.defineAttribute('shortestPolling');
TP.xmpp.BOSHTransport.Inst.defineAttribute('inactivity');

TP.xmpp.BOSHTransport.Inst.defineAttribute('authID');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.BOSHTransport.Inst.defineMethod('init',
function(aConnectionInfo) {

    /**
     * @method init
     * @summary Initializes a new instance.
     * @param {TP.core.Hash} aConnectionInfo A hash of connection information.
     *     This hash should contain values for: 'httpServerURI', 'serverName',
     *     'inStream', 'outStream'.
     * @exception TP.sig.InvalidParameter
     * @returns {TP.xmpp.BOSHTransport} A new instance.
     */

    if (TP.notValid(aConnectionInfo)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    this.callNextMethod();

    this.set('httpServerURI', aConnectionInfo.at('httpServerURI'));

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.BOSHTransport.Inst.defineMethod('$computeMessageKeys',
function() {

    /**
     * @method $computeMessageKeys
     * @summary Computes a 'message key sequence' for use between TIBET and the
     *     server.
     * @returns {TP.xmpp.BOSHTransport} The receiver.
     */

    var seed,

        numKeys,
        i,

        msgKeyArray;

    //  We start by computing a seed that is a random number.
    seed = Number.random().toString();

    numKeys = this.getType().MSG_KEY_COUNT;

    msgKeyArray = TP.ac();

    //  We SHA-1 the seed and add it first.
    msgKeyArray.push(TP.hash(seed, TP.HASH_SHA1, TP.HASH_HEX));

    //  Loop from 1 to the number of keys and compute each key by SHA-1'ing
    //  each previous key.
    for (i = 1; i < numKeys; i++) {
        msgKeyArray.push(TP.hash(msgKeyArray.last(), TP.HASH_SHA1, TP.HASH_HEX));
    }

    this.set('msgKeys', msgKeyArray);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.BOSHTransport.Inst.defineMethod('connect',
function() {

    /**
     * @method connect
     * @summary Connects the receiver to the server it is configured to connect
     *     to.
     * @exception TP.sig.XMPPTransportException
     * @returns {Boolean} True if the transport connects successfully to the
     *     server.
     */

    var instr,
        outstr,

        xmlResult,

        bodyElement,

        sid,

        str;

    instr = this.get('inStream');
    outstr = this.get('outStream');

    //  Compute the initial set of message keys we'll be using.
    this.$computeMessageKeys();

    //  Send the initiating request.
    xmlResult = this.sendInitialRequest();

    //  Now we make sure that we didn't get an error or something.
    bodyElement = TP.nodeGetFirstChildElement(xmlResult);

    if (TP.elementGetLocalName(bodyElement) !== 'body' ||
        TP.nodeGetNSURI(bodyElement) !== TP.xmpp.XMLNS.HTTP_BIND) {
        //  the response was not a 'body' element
        return this.raise('TP.sig.XMPPTransportException',
                            'No valid "body" element found.');
    }

    if (TP.elementGetAttribute(bodyElement, 'type') === 'terminate') {
        //  the response was a 'body' element, but the server wants us to
        //  terminate.
        return this.raise('TP.sig.XMPPTransportException',
                            'Server terminated transport.');
    }

    //  Now obtain a regular Jabber stream ID. This is used to uniquely
    //  identify our stream to the Jabber server (which is not necessarily
    //  the same server as the one running the XEP-124 process).

    sid = TP.elementGetAttribute(bodyElement, 'sid');
    this.set('sessionID', sid);

    //  See if this server still sends an 'authid', in which case we will
    //  use that as the 'stream id' and use old non-SASL authentication.
    if (TP.elementHasAttribute(bodyElement, 'authid')) {
        this.set('authID',
                    TP.elementGetAttribute(bodyElement, 'authid'));
    }

    this.set('wait',
                TP.elementGetAttribute(bodyElement, 'wait'));
    this.set('shortestPolling',
                TP.elementGetAttribute(bodyElement, 'polling'));
    this.set('inactivity',
                TP.elementGetAttribute(bodyElement, 'inactivity'));

    //  update the server-to-client stream with the response data
    instr.setAttribute('id', sid);

    //  In a XEP-124 version 1.6 server, only the encryption features are
    //  given here. The resource binding and session management information
    //  is given after the stream is reopened. See this type's version of
    //  the $authDigest() method for more information. TIBET only supports
    //  version 1.6 or higher of the XEP-124 specification.

    //  tell the streams we're open for business
    instr.isOpen(true);
    outstr.isOpen(true);

    str = TP.str(xmlResult);

    instr.write(this.$extractFromBody(str), null);

    //  return true - we successfully opened the transport
    return true;
});

//  ------------------------------------------------------------------------

TP.xmpp.BOSHTransport.Inst.defineMethod('connectionDidAuthenticate',
function() {

    /**
     * @method connectionDidAuthenticate
     * @summary A method that is called by the connection that owns this
     *     transport letting the transport know that the connection did
     *     successfully authenticate with the server.
     * @returns {TP.xmpp.BOSHTransport} The receiver.
     */

    var instr,
        outstr;

    //  If the code in our supertype failed, then we've already failed
    //  authentication, so bail out here.
    if (!this.callNextMethod()) {
        return false;
    }

    //  get a handle to our input stream so we can read
    instr = this.get('inStream');

    //  get a handle to our output stream so we can write
    outstr = this.get('outStream');

    //  Step #10 in the SASL portion of the XMPP 1.0 protocol

    //  Open another stream and we're ready to go (for version 1.6 and
    //  greater servers).

    //  We start by emptying the current input and output streams. This
    //  avoids XML processing errors because of having 2 opening tags in
    //  these streams.
    outstr.empty();
    instr.empty();

    //  Stream reopening for XEP-124 was specified in version 1.6 of that
    //  specification. TIBET only supports version 1.6 or higher of the
    //  XEP-124 specification.

    //  Step #11 in the SASL portion of the XMPP 1.0 protocol

    //  Reopen the stream
    this.transmit('', TP.hc('to', this.get('serverName'),
                            'xml:lang', TP.sys.getTargetLanguage(),
                            'xmpp:xmlns', TP.xmpp.XMLNS.XMPP_BOSH,
                            'xmpp:restart', 'true'
                            ));

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.BOSHTransport.Inst.defineMethod('$extractFromBody',
function(aStr) {

    /**
     * @method $extractFromBody
     * @summary Extracts the contents of the '<body>....</body>' tag used by
     *     BOSH to transport XML to and from the server and returns those
     *     contents.
     * @param {String} aStr The content which is wrapped by a 'body' tag.
     * @returns {String} The unwrapped content.
     */

    //  Only slice out the content if there really is a 'body' tag.
    if (aStr.startsWith('<body') && aStr.endsWith('</body>')) {
        return aStr.slice(aStr.indexOf('>') + 1, aStr.lastIndexOf('<'));
    } else {
        //  Otherwise, we just return the empty String.
        return '';
    }
});

//  ------------------------------------------------------------------------

TP.xmpp.BOSHTransport.Inst.defineMethod('$getNextMessageID',
function() {

    /**
     * @method $getNextMessageID
     * @summary Returns a newly generated message ID for use.
     * @returns {String} The message ID that will be used for the next message.
     */

    var msgID;

    msgID = this.$get('msgCount') + 1;
    this.$set('msgCount', msgID, false);

    return TP.join('tibet_', this.get('lastRID').asString(), '_', msgID);
});

//  ------------------------------------------------------------------------

TP.xmpp.BOSHTransport.Inst.defineMethod('getNextRID',
function() {

    /**
     * @method getNextRID
     * @summary Returns the next 'request ID'. If the 'request ID sequence' has
     *     already begun, this merely increments the request ID and returns
     *     that, per the BOSH specification.
     * @returns {Number} The next request ID that should be used.
     */

    var lastRID;

    if (!TP.isNumber(lastRID = this.get('lastRID'))) {
        lastRID = (Number.random() * 1000000).floor();

        /* eslint-disable no-extra-parens */
        //  Make sure that, even after we increment the RID a
        //  'MAXIMUM_PACKET' number of times, we don't exceed the limit on
        //  IEEE Standard 754 Doubles.
        if ((lastRID + TP.xmpp.BOSHTransport.MAXIMUM_PACKETS) >
                                                        TP.MAX_DOUBLE) {
            //  We exceeded it, so recompute it again. If it still comes up
            //  greater than the limit, throw an exception and set 'lastRID'
            //  to 0.
            lastRID = (Number.random() * 1000000).floor();
            if ((lastRID + TP.xmpp.BOSHTransport.MAXIMUM_PACKETS) >
                                                            TP.MAX_DOUBLE) {
                this.raise('TP.sig.XMPPBOSHTransportRIDError');
                lastRID = 0;
            }
        }
        /* eslint-enable no-extra-parens */
    }

    lastRID += 1;

    this.set('lastRID', lastRID);

    return lastRID;
});

//  ------------------------------------------------------------------------

TP.xmpp.BOSHTransport.Inst.defineMethod('isBusy',
function() {

    /**
     * @method isBusy
     * @summary Whether or not the transport is 'busy' sending something.
     * @returns {Boolean} Whether or not the transport is busy.
     */

    //  If we have a valid send channel, then we're 'busy'.
    return TP.isValid(this.get('sendChannel'));
});

//  ------------------------------------------------------------------------

TP.xmpp.BOSHTransport.Inst.defineMethod('receive',
function() {

    /**
     * @method receive
     * @summary Receives any currently available XMPP data by reading data from
     *     the server.
     * @returns {TP.xmpp.Packet} The currently available XMPP packet read from
     *     the server.
     */

    var instr,

        res,

        errorElement;

    instr = this.get('inStream');

    res = instr.read();

    if (TP.notValid(res)) {
        this.raise('TP.sig.InvalidXMPPResponse');

        return null;
    }

    if (res.isError()) {
        //  A stream error is itself the error element. A stanza error will
        //  be the content of the stanza. The stanza will report itself as
        //  an error, but the actual error element is the content

        if (TP.isKindOf(res, TP.xmpp.StanzaError)) {
            errorElement = res.getPayload();
        } else {
            errorElement = res;
        }

        this.raise(errorElement.get('errorException'),
                    errorElement.get('errorDescription'));
    }

    return res;
});

//  ------------------------------------------------------------------------

TP.xmpp.BOSHTransport.Inst.defineMethod('$processResults',
function(aHref, aRequest) {

    /**
     * @method $processResults
     * @summary Processes any results returned by the server.
     * @param {String} aHref The href that was used to communicate with the
     *     server.
     * @param {TP.core.Hash|TP.sig.Request} aRequest The request object used
     *     for the http call. This should contain a key of 'commObj' with the
     *     native XMLHttpRequest.
     * @returns {TP.xmpp.BOSHTransport} The receiver.
     */

    var httpObj,

        instr,

        hadError,
        errMsg,

        rawStr,
        str,

        condition,

        stat,

        sendChannel;

    httpObj = aRequest.at('commObj');

    instr = this.get('inStream');

    hadError = false;
    errMsg = '';

    //  If we were handed a valid http object and it has content, then write
    //  that content into our input stream.
    if (TP.isXHR(httpObj) &&
        TP.isString(httpObj.responseText) &&
        httpObj.responseText !== '') {
        rawStr = httpObj.responseText;

        str = this.$extractFromBody(rawStr);

        this.writeRecvMessageToLog(TP.hc('async', true,
                                        'body', str,
                                        'commObj', httpObj));

        instr.write(str, httpObj);

        //  If the 'body' element has a 'terminate' and has a condition,
        //  then we can use that in the error message. Otherwise, we can
        //  only say that we've been terminated.
        if (/<body(.+)type=['"]terminate['"]/.test(rawStr)) {
            hadError = true;

            if (TP.notEmpty(condition =
                            rawStr.match(/condition=['"](.+)['"]/).at(1))) {
                errMsg = TP.sc('XMPP BOSH connection terminated.' +
                                ' Condition: ') + condition;
            } else {
                errMsg = TP.sc('XMPP BOSH connection terminated');
            }
        }
    }

    try {
        //  If the status is not 200, then we have a problem.

        //  If the XHR mechanism has aborted in Mozilla, it will cause the
        //  '.status' property to throw an exception if it is read.
        if ((stat = httpObj.status) !== 200) {
            TP.signal(aHref, stat);

            hadError = true;

            if (TP.isEmpty(errMsg)) {
                errMsg = 'HTTP Error: ' + stat;
            }
        }

        if (hadError) {
            //  This should cause the connection (and the associated
            //  streams) to close.
            return this.raise('TP.sig.XMPPTransportException',
                                errMsg);
        }
    } catch (e) {
        //  some kind of problem with the post
        return this.raise('TP.sig.XMPPTransportException',
                            TP.ec(e, httpObj.responseText));
    }

    //  If there is a valid 'send channel', that means the reason that we
    //  are here is because we initiated a connection and the server is
    //  immediately closing the 'receive' channel. In this case, we make the
    //  'send' channel that was opened (and caused this chain of events to
    //  happen) our 'receive' channel and set the 'send' channel to null.
    if (TP.isValid(sendChannel = this.get('sendChannel'))) {
        //  Set the 'receive' channel to be the 'send' channel and null out
        //  the 'send' channel.
        this.set('receiveChannel', sendChannel);
        this.set('sendChannel', null);
    } else {
        //  Otherwise, start receiving again by setting up the 'receive'
        //  channel manually.
        this.startReceiving();
    }

    //  Signal that we're ready for the next operation.
    this.signal('TP.sig.XMPPTransportReady');

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.BOSHTransport.Inst.defineMethod('sendInitialRequest',
function() {

    /**
     * @method sendInitialRequest
     * @summary Sends the 'initial request' to the BOSH server to 'get things
     *     started'.
     * @exception TP.sig.XMPPTransportException
     * @returns {TP.xmpp.BOSHTransport} The receiver.
     */

    var httpServerURI,
        connectStr,
        request,
        href,
        httpObj,
        str,
        xmlResult;

    httpServerURI = this.get('httpServerURI');

    //  XEP-124 says that we send a '<body>' tag with various parameters to
    //  get things going.
    if (this.get('$version') === 1.6) {
        connectStr = TP.join(
                '<body xmlns="', TP.xmpp.XMLNS.HTTP_BIND, '"',
                ' xml:lang="', TP.sys.getTargetLanguage(), '"',
                ' ver="1.6"',
                ' xmpp:xmlns="', TP.xmpp.XMLNS.XMPP_BOSH,
                                                '" xmpp:version="1.0"',
                ' to="', this.get('serverName'), '"',
                ' route="xmpp:', httpServerURI.get('host'), ':',
                                    httpServerURI.get('port'), '"',
                ' wait="', TP.xmpp.BOSHTransport.MAXIMUM_WAIT, '"',
                ' hold="', TP.xmpp.BOSHTransport.MAXIMUM_HOLD, '"',
                ' rid="', this.getNextRID(), '"',
                ' newkey="', this.get('msgKeys').pop(), '"',
                ' secure="false"',
                '/>');
    } else {
        connectStr = TP.join(
                '<body xmlns="', TP.xmpp.XMLNS.HTTP_BIND, '"',
                ' xml:lang="', TP.sys.getTargetLanguage(), '"',
                ' ver="1.5"',
                ' to="', this.get('serverName'), '"',
                ' route="xmpp:', httpServerURI.get('host'), ':',
                                    httpServerURI.get('port'), '"',
                ' wait="', TP.xmpp.BOSHTransport.MAXIMUM_WAIT, '"',
                ' hold="', TP.xmpp.BOSHTransport.MAXIMUM_HOLD, '"',
                ' rid="', this.getNextRID(), '"',
                ' newkey="', this.get('msgKeys').pop(), '"',
                ' secure="false"',
                '/>');
    }

    href = httpServerURI.asString();

    //  Post to the server to get the connection process started

    try {
        //  Write a 'send' message to the log just before we send
        this.writeSendMessageToLog(TP.hc('async', false,
                                        'body', connectStr));

        //  Note the post here with no headers and the connectStr as our
        //  'connection' data. Note also the synchronous nature of this
        //  call.
        request = TP.request('uri', href,
            'headers', TP.hc('Content-Type',
                TP.XML_TEXT_ENCODED + '; ' + 'charset=' + TP.UTF8),
            'body', connectStr);
        TP.httpPost(href, request);
        httpObj = request.at('commObj');

        //  Serious trouble here - TP.httpPost automatically takes care of
        //  redirects, etc. so that means there was a real error.
        if (!TP.httpDidSucceed(httpObj)) {
            return this.raise('TP.sig.XMPPTransportException');
        }
    } catch (e) {
        //  some kind of problem with the post
        return this.raise('TP.sig.XMPPTransportException',
                            TP.ec(e, httpObj.responseText));
    }

    if (TP.notValid(httpObj.responseText) ||
        TP.isEmpty(httpObj.responseText)) {
        //  problem, no text containing stream id
        return this.raise('TP.sig.XMPPTransportException',
                            'No opening stream response from server.');
    }

    //  Make sure that we got a valid XML response from the server.
    try {
        str = httpObj.responseText;

        this.writeRecvMessageToLog(TP.hc('async', false,
                                        'body', str,
                                        'commObj', httpObj));

        xmlResult = TP.documentFromString(str);
        if (TP.notValid(xmlResult)) {
            throw new Error();
        }
    } catch (e) {
        //  some kind of problem parsing the result xmlResult
        return this.raise('TP.sig.DOMParseException',
                            TP.ec(e, httpObj.responseText));
    }

    return xmlResult;
});

//  ------------------------------------------------------------------------

TP.xmpp.BOSHTransport.Inst.defineMethod('transmit',
function(aStr, extraAttrs) {

    /**
     * @method transmit
     * @summary Sends the raw data provided to the server.
     * @param {String} aStr The raw data to be sent over the transport.
     * @param {TP.core.Hash} extraAttrs Any extra attributes to be added to the
     *     '<body>' start tag.
     * @exception TP.sig.XMPPTransportException
     * @returns {TP.xmpp.BOSHTransport} The receiver.
     */

    var href,
        sendStr,
        request,
        httpObj,
        str,
        stat,
        hadError,
        errMsg,
        rawStr,
        sendChannel,
        condition;

    href = this.get('httpServerURI').asString();

    //  If this is the stream object trying to close the connection (which
    //  means its trying to send its closing tag), we intercept that call
    //  and go ahead and close the transport as per the BOSH specification
    //  (which does send a closing 'stream:stream' tag).
    if (aStr === this.get('outStream').getClosingTag()) {
        //  Write a 'send' message to the log just before we send
        this.writeSendMessageToLog(TP.hc('async', false, 'body', ''));

        sendStr = this.$wrapWithBody('', TP.hc('type', 'terminate'));

        try {
            //  Send the closing string.
            request = TP.request('uri', href,
                'headers', TP.hc('Content-Type',
                    TP.XML_TEXT_ENCODED + '; ' + 'charset=' + TP.UTF8),
                'body', sendStr);
            TP.httpPost(href, request);
            httpObj = request.at('commObj');

            if (TP.isXHR(httpObj) &&
                TP.isString(httpObj.responseText) &&
                httpObj.responseText !== '') {
                str = httpObj.responseText;

                this.writeRecvMessageToLog(TP.hc('async', false,
                                                'body', str,
                                                'commObj', httpObj));
            }

            //  If the status is not 200, then we have a problem.

            //  If the XHR mechanism has aborted in Mozilla, it will cause
            //  the '.status' property to throw an exception if it is read.
            if ((stat = httpObj.status) !== 200) {
                TP.signal(href, stat);

                return this.raise('TP.sig.XMPPTransportException',
                                    'HTTP Error: ' + stat);
            }
        } catch (e) {
            //  some kind of problem with the post
            return this.raise('TP.sig.XMPPTransportException',
                                TP.ec(e, httpObj.responseText));
        }

        //  Exit here. We're just closing the transport.
        return this;
    }

    sendStr = this.$wrapWithBody(aStr, extraAttrs);

    //  If we're not authenticated yet, then we just make synchronous calls
    //  to the server to get going.
    if (TP.isFalse(this.get('connectionEstablished'))) {
        //  Write a 'send' message to the log just before we send
        this.writeSendMessageToLog(TP.hc('async', false, 'body', aStr));

        hadError = false;
        errMsg = '';

        try {
            request = TP.request('uri', href,
                'headers', TP.hc('Content-Type',
                    TP.XML_TEXT_ENCODED + '; ' + 'charset=' + TP.UTF8),
                'body', sendStr);
            TP.httpPost(href, request);
            httpObj = request.at('commObj');

            //  server sometimes has data ready, if so be sure to move it to
            //  the input stream. we use the text to avoid any permission
            //  issues
            if (TP.isXHR(httpObj) &&
                TP.isString(httpObj.responseText) &&
                httpObj.responseText !== '') {
                rawStr = httpObj.responseText;

                str = this.$extractFromBody(rawStr);

                this.writeRecvMessageToLog(TP.hc('async', false,
                                                    'body', str,
                                                    'commObj', httpObj));

                this.get('inStream').write(str, httpObj);

                //  If the 'body' element has a 'terminate' and has a
                //  condition, then we can use that in the error message.
                //  Otherwise, we can only say that we've been terminated.
                if (/<body(.+)type=['"]terminate['"]/.test(rawStr)) {
                    hadError = true;

                    if (TP.notEmpty(condition =
                            rawStr.match(/condition=['"](.+)['"]/).at(1))) {
                        errMsg = TP.sc('XMPP BOSH connection terminated.' +
                                        ' Condition: ') + condition;
                    } else {
                        errMsg = TP.sc('XMPP BOSH connection terminated');
                    }
                }
            }

            //  If the status is not 200, then we have a problem.

            //  If the XHR mechanism has aborted in Mozilla, it will cause
            //  the '.status' property to throw an exception if it is read.
            if ((stat = httpObj.status) !== 200) {
                TP.signal(href, stat);

                hadError = true;

                if (TP.isEmpty(errMsg)) {
                    errMsg = 'HTTP Error: ' + stat;
                }
            }

            if (hadError) {
                return this.raise('TP.sig.XMPPTransportException',
                                    errMsg);
            }
        } catch (e) {
            //  some kind of problem with the post
            return this.raise('TP.sig.XMPPTransportException',
                                TP.ec(e, httpObj.responseText));
        }
    } else {
        //  Otherwise, we make a new connection to the server on the 'send'
        //  channel.

        //  If we've already got a 'send channel', then we need to make it
        //  the 'receive channel' since we're about ready to open a new
        //  'send channel'.
        if (TP.isValid(sendChannel = this.get('sendChannel'))) {
            this.set('receiveChannel', sendChannel);
            this.set('sendChannel', null);
        }

        //  Send the content to the server. This will cause the server
        //  to disconnect our 'receive' channel. In our common handler
        //  for both the 'send' and 'receive' channel, if a 'send'
        //  channel is open it becomes the 'receive' channel.
        try {
            request = TP.request('uri', href,
                'headers', TP.hc('Content-Type',
                    TP.XML_TEXT_ENCODED + '; ' + 'charset=' + TP.UTF8),
                'body', sendStr,
                'timeout', TP.MAX_TIMEOUT,
                'async', true);

            request.defineHandler('IOSucceeded',
                        function() {
                            this.$processResults(href, request);
                        }.bind(this));

            //  Write a 'send' message to the log just before we send
            this.writeSendMessageToLog(TP.hc('async', true, 'body', aStr));

            TP.httpPost(href, request);
            httpObj = request.at('commObj');

            //  Cache this channel as the 'send' channel.
            this.set('sendChannel', httpObj);
        } catch (e) {
            //  some kind of problem with the post
            return this.raise('TP.sig.XMPPTransportException',
                                TP.ec(e, httpObj.responseText));
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.BOSHTransport.Inst.defineMethod('startReceiving',
function() {

    /**
     * @method startReceiving
     * @summary Start the transport's 'receiving process'. For transports that
     *     operate over HTTP, this will typically start a polling or listening
     *     process.
     * @returns {TP.xmpp.BOSHTransport} The receiver.
     */

    var href,
        request,
        httpObj;

    this.callNextMethod();

    href = this.get('httpServerURI').asString();

    //  Send an empty 'body' element to the server, as per the BOSH
    //  specification. The server will 'hold open' this connection, until
    //  it has data to return or a MAXIMUM_WAIT number of seconds expires.
    try {
        request = TP.request(
                    'uri', href,
                    'headers', TP.hc('Content-Type',
                                        TP.XML_TEXT_ENCODED + '; ' +
                                        'charset=' + TP.UTF8),
                    'body', this.$wrapWithBody(''),
                    'timeout', TP.MAX_TIMEOUT,
                    'async', true);

        request.defineHandler('IOSucceeded',
                    function() {

                        this.$processResults(href, request);
                    }.bind(this));

        //  Write a 'send' message to the log just before we send
        this.writeSendMessageToLog(TP.hc('async', true, 'body', ''));

        TP.httpPost(href, request);
        httpObj = request.at('commObj');

        //  Cache this channel as the 'receive' channel.
        this.set('receiveChannel', httpObj);
    } catch (e) {
        //  some kind of problem with the post
        return this.raise('TP.sig.XMPPTransportException',
                            TP.ec(e, httpObj.responseText));
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.BOSHTransport.Inst.defineMethod('stopReceiving',
function() {

    /**
     * @method stopReceiving
     * @summary Stop the transport's 'receiving process'. For transports that
     *     operate over HTTP, this will typically stop a polling or listening
     *     process.
     * @returns {TP.xmpp.BOSHTransport} The receiver.
     */

    var channel;

    //  If a 'send' channel is going, abort it.
    if (TP.isValid(channel = this.get('sendChannel'))) {
        TP.httpAbort(channel);
    }

    //  If a 'receive' channel is going, abort it.
    if (TP.isValid(channel = this.get('receiveChannel'))) {
        TP.httpAbort(channel);
    }

    this.set('sendChannel', null);
    this.set('receiveChannel', null);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.BOSHTransport.Inst.defineMethod('$wrapWithBody',
function(aStr, extraAttrs) {

    /**
     * @method $wrapWithBody
     * @summary Wraps the supplied String with a '<body>....</body>' tag as
     *     required by the BOSH specification, including the session ID and a
     *     computed request ID.
     * @param {String} aStr The content to wrap.
     * @param {TP.core.Hash} extraAttrs Any extra attributes to be added to the
     *     '<body>' start tag.
     * @returns {String} The content wrapped with a 'body' tag.
     */

    var msgKey,
        str;

    msgKey = this.get('msgKeys').pop();

    if (TP.isEmpty(this.get('msgKeys'))) {
        this.$computeMessageKeys();

        str = TP.ac(
                '<body xmlns="', TP.xmpp.XMLNS.HTTP_BIND, '"',
                ' rid="', this.getNextRID(), '"',
                ' sid="', this.get('sessionID'), '"',
                ' key="', msgKey, '"',
                ' newkey="', this.get('msgKeys').pop(), '"');
    } else {
        str = TP.ac(
                '<body xmlns="', TP.xmpp.XMLNS.HTTP_BIND, '"',
                ' rid="', this.getNextRID(), '"',
                ' sid="', this.get('sessionID'), '"',
                ' key="', msgKey, '"');
    }

    if (TP.notEmpty(extraAttrs)) {
        extraAttrs.perform(
            function(kvPair) {

                str.push(' ', kvPair.first(), '="', kvPair.last(), '"');
            });
    }

    str.push('>', aStr, '</body>');

    return str.join('');
});

//  ------------------------------------------------------------------------

TP.xmpp.BOSHTransport.Inst.defineMethod('writeRecvMessageToLog',
function(logInfo) {

    /**
     * @method writeRecvMessageToLog
     * @summary Writes the information supplied in the hash to TIBET's IO log,
     *     under the auspices of a 'receive message'. Note that this logging is
     *     in addition to the low-level IO logging that TIBET will do if you
     *     have IO logging switched on.
     * @param {TP.core.Hash} logInfo A hash of information to log. This hash
     *     should contain values for: 'async', 'body', 'commObj'.
     * @returns {TP.xmpp.BOSHTransport} The receiver.
     */

    var flag;

    flag = TP.sys.shouldLogIO();
    TP.sys.shouldLogIO(this.shouldLogRecvs());

    //  don't duplicate normal output logging
    if (!flag && TP.sys.shouldLogIO()) {
        TP.ifInfo() ?
            TP.sys.logIO(
                TP.hc('uri', this.get('httpServerURI'),
                        'direction', TP.RECV,
                        'method', TP.HTTP_POST,
                        'async', logInfo.at('async'),
                        'body', logInfo.at('body'),
                        'commObj', logInfo.at('commObj'),
                        'message', 'XMPP channel input'),
                TP.DEBUG) : 0;
    }

    TP.sys.shouldLogIO(flag);

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.BOSHTransport.Inst.defineMethod('writeSendMessageToLog',
function(logInfo) {

    /**
     * @method writeSendMessageToLog
     * @summary Writes the information supplied in the hash to TIBET's IO log,
     *     under the auspices of a 'send message'. Note that this logging is in
     *     addition to the low-level IO logging that TIBET will do if you have
     *     IO logging switched on.
     * @param {TP.core.Hash} logInfo A hash of information to log. This hash
     *     should contain values for: 'async', 'body', 'commObj'.
     * @returns {TP.xmpp.BOSHTransport} The receiver.
     */

    var flag;

    flag = TP.sys.shouldLogIO();
    TP.sys.shouldLogIO(this.shouldLogSends());

    //  don't duplicate normal output logging
    if (!flag && TP.sys.shouldLogIO()) {
        TP.ifInfo() ?
            TP.sys.logIO(
                TP.hc('uri', this.get('httpServerURI'),
                        'direction', TP.SEND,
                        'method', TP.HTTP_POST,
                        'async', logInfo.at('async'),
                        'body', logInfo.at('body'),
                        'commObj', logInfo.at('commObj'),
                        'message', 'XMPP channel output'),
                TP.DEBUG) : 0;
    }

    TP.sys.shouldLogIO(flag);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
