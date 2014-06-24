//  ========================================================================
/*
NAME:   TP.xmpp.IqPrivate.js
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
 * @type {TP.xmpp.IqPrivate}
 * @synopsis A wrapper for the IQ_PRIVATE namespace'd payload element.
 */

//  ------------------------------------------------------------------------

TP.xmpp.IqPayload.defineSubtype('IqPrivate');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.IqPrivate.set('namespace', TP.xmpp.XMLNS.IQ_PRIVATE);

TP.xmpp.IqPrivate.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.IqPrivate.Inst.defineMethod('getData',
function() {

    /**
     * @name getData
     * @synopsis Returns the private data node associated with this node.
     * @returns {Node} 
     */

    var natNode;

    //  if the native node is a document node we need to drill down to the
    //  actual private query node
    natNode = this.getNativeNode();

    //  the first child of the query node should be the raw data node

    //  TODO:   should this be looking for the first _element_ node?
    return natNode.firstChild;
});

//  ------------------------------------------------------------------------

TP.xmpp.IqPrivate.Inst.defineMethod('setData',
function(aNode) {

    /**
     * @name setData
     * @synopsis Sets the private data node to store, if sent.
     * @param {DOM} aNode Node The data node to store, in node form.
     * @returns {TP.xmpp.IqPrivate} The receiver.
     */

    var natNode,
        node;

    if (!TP.isNode(aNode)) {
        return this.raise('TP.sig.InvalidNode', arguments);
    }

    node = aNode;

    natNode = this.getNativeNode();

    TP.nodeAppendChild(natNode, node);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
