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
 * @type {TP.xmpp.Payload}
 * @summary A common supertype for XMPP elements which can't travel on their
 *     own, only as payload within a valid XMPP stanza.
 */

//  ------------------------------------------------------------------------

//  note we're not a packet, just a node. packets are addressable entities.
TP.xmpp.Node.defineSubtype('Payload');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  container for a list of tag names for valid child tags of the receiver
TP.xmpp.Payload.Type.defineAttribute('childTags');

TP.xmpp.Payload.Type.defineAttribute('namespace', null);
TP.xmpp.Payload.Type.defineAttribute('tagname', null);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.Payload.Inst.defineMethod('get',
function(attributeName) {

    /**
     * @method get
     * @summary Returns the value, if any, of the attribute provided. For XMPP
     *     nodes, this may reach into child nodes and obtain their 'text value'
     *     if the attribute has been mapped as a 'child tag' in this type.
     * @param {String} attributeName The name of the attribute to return.
     * @returns {String|Object} The value of the desired attribute.
     */

    var attrName,

        funcName,

        tags;

    //  This might be an access path
    attrName = TP.str(attributeName);

    //  first try default naming of getAttributeName (typical use)
    funcName = 'get' + TP.makeStartUpper(attrName);
    if (TP.canInvoke(this, funcName)) {
        return this[funcName]();
    }

    if (TP.isArray(tags = this.getType().$get('childTags'))) {
        if (tags.containsString(attrName)) {
            return this.getChildTextContent(attrName);
        }
    }

    //  otherwise defer to our supertype implementation
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xmpp.Payload.Inst.defineMethod('set',
function(attributeName, attributeValue) {

    /**
     * @method set
     * @summary Sets the value of the named attribute to the value provided.
     *     For XMPP nodes, this may reach into child nodes and obtain their
     *     'text value' if the attribute has been mapped as a 'child tag' in
     *     this type.
     * @param {String} attributeName The attribute name to set.
     * @param {Object} attributeValue The value to set.
     * @returns {TP.xmpp.Payload} The receiver.
     */

    var attrName,

        funcName,

        tags,
        elem;

    //  This might be an access path
    attrName = TP.str(attributeName);

    //  first try default naming of setAttributeName (typical use)
    funcName = 'set' + TP.makeStartUpper(attrName);
    if (TP.canInvoke(this, funcName)) {
        return this[funcName](attributeValue);
    }

    if (TP.isArray(tags = this.getType().get('childTags'))) {
        if (tags.containsString(attrName)) {
            //  We'll create the named descendant if one can't be found.
            elem = this.getNamedDescendant(attrName, true);
            TP.nodeSetTextContent(elem, attributeValue);

            return this;
        }
    }

    //  otherwise defer to our supertype implementation
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
