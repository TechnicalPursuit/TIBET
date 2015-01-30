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
 * @type {TP.xmpp.BindResource}
 * @summary A wrapper for the XMPP resource binding element
 */

//  ------------------------------------------------------------------------

TP.xmpp.Payload.defineSubtype('BindResource');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.BindResource.set('namespace', TP.xmpp.XMLNS.BIND);

TP.xmpp.BindResource.set('tagname', 'bind');

TP.xmpp.BindResource.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.BindResource.Inst.defineMethod('addResource',
function(resourceName) {

    /**
     * @method addResource
     * @summary Adds a resource node to the receiver.
     * @param {String} resourceName A resource name.
     * @exception TP.sig.InvalidResourceName
     * @returns {TP.xmpp.BindResource} The receiver.
     */

    var resourceNode;

    if (TP.isEmpty(resourceName)) {
        return this.raise('TP.sig.InvalidResourceName');
    }

    //  Make a node in the 'resource binding' namespace with a tag name of
    //  'resource'.
    resourceNode = TP.documentCreateElement(this.getNativeDocument(),
                                            'resource',
                                            TP.xmpp.XMLNS.BIND);

    TP.nodeAppendChild(
                resourceNode,
                this.getNativeDocument().createTextNode(resourceName));

    TP.nodeAppendChild(this.getNativeNode(), resourceNode);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
