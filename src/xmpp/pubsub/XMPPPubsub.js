//  ========================================================================
/*
NAME:   TP.xmpp.Pubsub.js
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
 * @type {TP.xmpp.Pubsub}
 * @synopsis An abstract type for all of the XMPP PubSub element types.
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
     * @name getConcreteType
     * @synopsis Returns the subtype to use for the node provided.
     * @param {Node} aNode The native node to wrap.
     * @raises TP.sig.InvalidNode
     * @returns {TP.lang.RootObject.<TP.xmpp.Pubsub>} A TP.xmpp.Pubsub subtype
     *     type object.
     */

    var pubsubTypePair;

    if (!TP.isNode(aNode)) {
        return this.raise('TP.sig.InvalidNode',
                            arguments,
                            'No node provided.');
    }

    //  Run a detect on the pubsub type registry (a TP.lang.Hash) which will
    //  return the XPath/type pair that matched the XPath test against the
    //  supplied node.
    pubsubTypePair = this.get('pubsubTypeRegistry').detect(
            function(kvPair) {

                if (TP.isValid(TP.nodeEvaluateXPath(aNode,
                                                    kvPair.first(),
                                                    TP.FIRST_NODE))) {
                    return true;
                }

                return false;
            });

    //  If we successfully got one, return the type object.
    if (TP.isPair(pubsubTypePair)) {
        return pubsubTypePair.last();
    }

    //  Couldn't determine a concrete type at this level. Just return the
    //  generic 'XML Element' concrete type.
    return TP.core.XMLElementNode;
});

//  ------------------------------------------------------------------------

TP.xmpp.Pubsub.Type.defineMethod('registerPubsubType',
function(aNamespace, xPathExpr, aType) {

    /**
     * @name registerPubsubType
     * @synopsis Registers a PubSub node type with this type for use in node
     *     type resolution.
     * @param {String} aNamespace The namespace belonging to the type being
     *     registered.
     * @param {String} xPathExpr The XPath expression that should be matched in
     *     order for the supplied type to be a valid match.
     * @param {Type} aType The type object that will be returned when the XPath
     *     expression matches.
     * @returns {TP.lang.RootObject.<TP.xmpp.Pubsub>} A TP.xmpp.Pubsub subtype
     *     type object that will be returned when the XPath expression matches.
     * @returns {TP.xmpp.Pubsub} The receiver.
     * @todo
     */

    this.get('pubsubTypeRegistry').atPut(xPathExpr, aType);

    //  We make sure to register *ourself* (the TP.xmpp.Pubsub type) with
    //  the main TP.xmpp.Node type registry using the namespace of the
    //  subtype PubSub node that is registering with us, so that we'll get
    //  properly messaged when the TP.xmpp.Node has a node with 'pubsub' as
    //  its tag name but that namespace as its namespace.
    TP.xmpp.XMLNS.defineNodeType('pubsub', TP.xmpp.Pubsub, aNamespace);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
