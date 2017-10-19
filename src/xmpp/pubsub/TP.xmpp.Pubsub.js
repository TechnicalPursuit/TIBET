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
 * @type {TP.xmpp.Pubsub}
 * @summary An abstract type for all of the XMPP PubSub element types.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Payload.defineSubtype('Pubsub');

//  can't construct concrete instances of this
TP.xmpp.Pubsub.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  Common access model constants
TP.xmpp.Pubsub.Type.defineConstant('OPEN', 'open');

//  Subscriber access model constants
TP.xmpp.Pubsub.Type.defineConstant('PRESENCE', 'presence');
TP.xmpp.Pubsub.Type.defineConstant('ROSTER', 'roster');
TP.xmpp.Pubsub.Type.defineConstant('AUTHORIZE', 'authorize');
TP.xmpp.Pubsub.Type.defineConstant('WHITELIST', 'whitelist');

//  Publisher access model constants
TP.xmpp.Pubsub.Type.defineConstant('PUBLISHERS', 'publishers');
TP.xmpp.Pubsub.Type.defineConstant('SUBSCRIBERS', 'subscribers');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.xmpp.Pubsub.Type.defineAttribute('pubsubTypeRegistry', TP.hc());

TP.xmpp.Pubsub.Type.defineAttribute('namespace', TP.xmpp.XMLNS.PUBSUB);

TP.xmpp.Pubsub.register();

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xmpp.Pubsub.Type.defineMethod('getConcreteType',
function(aNode) {

    /**
     * @method getConcreteType
     * @summary Returns the subtype to use for the node provided.
     * @param {Node} aNode The native node to wrap.
     * @exception TP.sig.InvalidNode
     * @returns {TP.lang.RootObject.<TP.xmpp.Pubsub>} A TP.xmpp.Pubsub subtype
     *     type object.
     */

    var pubsubTypePair,
        type;

    if (!TP.isNode(aNode)) {
        return this.raise('TP.sig.InvalidNode',
                            'No node provided.');
    }

    //  Run a detect on the pubsub type registry (a TP.core.Hash) which will
    //  return the XPath/type pair that matched the XPath test against the
    //  supplied node.
    pubsubTypePair = this.get('pubsubTypeRegistry').detect(
        function(kvPair) {

            if (TP.isValid(
                TP.nodeEvaluateXPath(aNode, kvPair.first(), TP.FIRST_NODE))) {
                return true;
            }

            return false;
        });

    //  If we successfully got one, return the type object.
    if (TP.isPair(pubsubTypePair)) {
        type = pubsubTypePair.last();
        if (!type.isAbstract()) {
            return type;
        }
    }

    //  Couldn't determine a concrete type at this level. Just return the
    //  generic 'XML Element' concrete type.
    return TP.core.XMLElementNode;
});

//  ------------------------------------------------------------------------

TP.xmpp.Pubsub.Type.defineMethod('registerPubsubType',
function(aNamespace, xPathExpr, aType) {

    /**
     * @method registerPubsubType
     * @summary Registers a PubSub node type with this type for use in node
     *     type resolution.
     * @param {String} aNamespace The namespace belonging to the type being
     *     registered.
     * @param {String} xPathExpr The XPath expression that should be matched in
     *     order for the supplied type to be a valid match.
     * @param {Type} aType The type object that will be returned when the XPath
     *     expression matches.
     * @returns {TP.xmpp.Pubsub} The receiver.
     */

    this.get('pubsubTypeRegistry').atPut(xPathExpr, aType);

    //  We make sure to register *ourself* (the TP.xmpp.Pubsub type) with
    //  the main TP.xmpp.Node type registry using the namespace of the
    //  subtype PubSub node that is registering with us, so that we'll get
    //  properly messaged when the TP.xmpp.Node has a node with 'pubsub' as
    //  its tag name but that namespace as its namespace.
    TP.xmpp.XMLNS.defineNodeType('pubsub', TP.xmpp.Pubsub, aNamespace);

    return this;
}, {
    trackInvocations: false
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
