//  ========================================================================
/*
NAME:   TP.xmpp.InputStream.js
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
 * @type {TP.xmpp.InputStream}
 * @synopsis Stream subtype specific to input acquired from the server. The
 *     input stream for a connection is an important component of the TIBET XMPP
 *     implementation. New packets arriving from the server are written into the
 *     input stream by the polling machinery, causing notification via an
 *     TP.sig.XMPPDataAvailable signal. The connection responds by processing
 *     the new packets by reading them until the stream is atEnd.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Stream.defineSubtype('InputStream');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

//  what location will we read next?
TP.xmpp.InputStream.Inst.defineAttribute('index', 0);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.InputStream.Inst.defineMethod('atStart',
function() {

    /**
     * @name atStart
     * @synopsis Returns true if there are no packets in the stream.
     * @returns {Boolean} 
     */

    return (this.get('index') === 0);
});

//  ------------------------------------------------------------------------

TP.xmpp.InputStream.Inst.defineMethod('atEnd',
function() {

    /**
     * @name atEnd
     * @synopsis Returns true if there are no unread packets in the stream.
     * @returns {Boolean} 
     */

    var arr;

    //  note the focus on elements here, not nodes
    arr = TP.nodeGetChildElements(this.get('stream'));

    return ((arr.getSize() === 0) || (this.get('index') >= arr.getSize()));
});

//  ------------------------------------------------------------------------

TP.xmpp.InputStream.Inst.defineMethod('close',
function() {

    /**
     * @name close
     * @synopsis Closes the input stream so no additional reads can be done.
     * @returns {Boolean} True if the stream closes, false otherwise.
     */

    //  essentially a noop, we simply make the stream unreadable this way
    this.isOpen(false);

    return !this.isOpen();
});

//  ------------------------------------------------------------------------

TP.xmpp.InputStream.Inst.defineMethod('empty',
function() {

    /**
     * @name empty
     * @synopsis Removes all content nodes (child nodes) from the receiver's
     *     native node, effectively emptying the node.
     * @returns {TP.xmpp.InputStream} The receiver.
     */

    //  Set the internal index to 0 and then call up to our supertype.
    this.$set('index', 0, false);

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xmpp.InputStream.Inst.defineMethod('getIndex',
function() {

    /**
     * @name getIndex
     * @synopsis Returns the current index location of the stream
     * @returns {Boolean} 
     */

    return this.$get('index');
});

//  ------------------------------------------------------------------------

TP.xmpp.InputStream.Inst.defineMethod('read',
function(anIndex) {

    /**
     * @name read
     * @synopsis Reads the next available stanza from the stream and returns it
     *     in an appropriate wrapper. Normally you call this without any
     *     parameters, but you can use an index (such as -1) to read a
     *     particular packet from the stream.
     * @param {Number} anIndex A numerical index specifying a particular packet
     *     to read.
     * @raises TP.sig.XMPPConnectionNotOpen, TP.sig.XMPPReadException
     * @returns {TP.xmpp.Node} A new packet in the proper wrapper.
     */

    var xmppnode,
        ndx,
        elem;

    if (!this.isOpen()) {
        this.raise('TP.sig.XMPPConnectionNotOpen', arguments);
        return;
    }

    if (this.atEnd() && TP.notValid(anIndex)) {
        return;
    }

    if (TP.notValid(anIndex)) {
        //  capture the index, and regardless of whether we can process the
        //  node properly be sure to increment so we don't get hung up on an
        //  error
        ndx = this.get('index');
        this.$set('index', ndx + 1, false);
    } else {
        //  we're being asked to read a particular item, this won't alter
        //  the stream's internal index, it will simply read the packet in
        //  question and return it
        ndx = anIndex;
    }

    if (TP.notValid(elem = TP.nodeGetChildElementAt(this.get('stream'),
                                                    ndx))) {
        return this.raise('TP.sig.XMPPReadException', arguments);
    }

    try {
        //  reconstitute a proper wrapper and tie it to this connection
        //  NOTE: This will clone 'elem'
        xmppnode = TP.xmpp.Node.fromNode(elem);
        xmppnode.set('connection', this.getConnection());
    } catch (e) {
        TP.ifError() ?
            TP.error(TP.ec(e, TP.join('Error creating TP.xmpp.Node from "',
                                        TP.nodeAsString(elem, false),
                                        '".')),
                        TP.IO_LOG, arguments) : 0;
    }

    return xmppnode;
});

//  ------------------------------------------------------------------------

TP.xmpp.InputStream.Inst.defineMethod('rewind',
function() {

    /**
     * @name rewind
     * @synopsis Repositions the stream index to the first location.
     * @returns {TP.xmpp.InputStream} The receiver.
     */

    TP.todo();

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.InputStream.Inst.defineMethod('seek',
function(anIndex) {

    /**
     * @name seek
     * @synopsis Positions the stream at the index provided. If no index is
     *     provided the stream is positioned at the end. If the index is
     *     negative the stream is positioned that many positions from the end
     *     (standard JS behavior for negative indices). If the index is past the
     *     end of the stream the index is reset to the end.
     * @param {Number} anIndex An integer index for positioning.
     * @returns {TP.xmpp.InputStream} The receiver.
     */

    TP.todo();

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.InputStream.Inst.defineMethod('write',
function(content, response) {

    /**
     * @name write
     * @synopsis Takes raw input, usually as a result of a polling process on
     *     the connection, and makes it available for reading in appropriate
     *     chunks via the read() call.
     * @param {String|TP.xmpp.Stanza} content The content to make available.
     * @param {The} response response object.
     * @raises TP.sig.DOMParseException, TP.sig.InvalidParameter
     * @returns {TP.xmpp.InputStream} The receiver.
     * @signals TP.sig.XMPPDataAvailable
     * @todo
     */

    var i,
        arr,
        str,
        node,
        stream;

    if (TP.notValid(content)) {
        return this.raise('TP.sig.InvalidParameter', arguments);
    }

    if (TP.isString(content) && TP.isEmpty(content)) {
        return this;
    }

    stream = this.getStream();

    //  validate/convert input to a useable form, we need both string and
    //  node content for proper operation
    if (TP.isString(content)) {
        str = content;

        //  dom parser isn't friendly to xml declarations...go figure
        if (str.startsWith('<?xml')) {
            str = str.slice(str.indexOf('>') + 1);
        }

        if (/<\/stream:stream>/.test(str)) {
            //  server is closing connection, we'll need to trim off the
            //  closing entry to parse any final input
            str = str.slice(0, str.indexOf('</stream:stream>'));

            this.get('connection').close(true);
        }

        if (!str.startsWith('<stream:stream')) {
            //  typically we get results that aren't going to be in a node
            //  hierarchy since they're individual stanzas from the server,
            //  but they won't parse without a root node...
            str = '<tmproot>' + str + '</tmproot>';
        }

        try {
            node = TP.elementFromString(str);
            if (TP.isElement(node)) {
                //  to iterate when appendChild will alter childNodes we
                //  have to capture them in an array first
                arr = TP.nodeGetChildElements(node);
                for (i = 0; i < arr.getSize(); i++) {
                    TP.nodeAppendChild(stream, arr.at(i));
                }
            }
        } catch (e) {
            return this.raise('TP.sig.DOMParseException',
                                arguments,
                                TP.ec(e, content));
        }
    } else if (TP.isNode(content)) {
        if (TP.isMethod(content.getNativeNode)) {
            //  if getNativeNode, this is a stanza more than likely
            node = content.getNativeNode();
            if (TP.notValid(node)) {
                node = content;
            }
        } else {
            node = content;
        }

        //  append the content to our stream node as a latest child
        if (TP.isNode(node)) {
            TP.nodeAppendChild(stream, TP.nodeCloneNode(node, true));
        }
    } else {
        return this.raise('TP.sig.InvalidParameter', arguments);
    }

    TP.nodeNormalize(stream);

    //  signal data available, but only after we're authenticated so we
    //  don't intrude on the more "synchronous" connection process
    if (this.get('connection').isAuthenticated()) {
        this.signal('TP.sig.XMPPDataAvailable');
    }

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
