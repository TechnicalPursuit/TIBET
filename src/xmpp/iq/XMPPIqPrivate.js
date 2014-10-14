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
        return this.raise('TP.sig.InvalidNode');
    }

    node = aNode;

    natNode = this.getNativeNode();

    TP.nodeAppendChild(natNode, node);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
