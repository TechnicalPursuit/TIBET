//  ========================================================================
/*
NAME:   TP.xmpp.Payload.js
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
 * @type {TP.xmpp.Payload}
 * @synopsis A common supertype for XMPP elements which can't travel on their
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
     * @name get
     * @synopsis Returns the value, if any, of the attribute provided. For XMPP
     *     nodes, this may reach into child nodes and obtain their 'text value'
     *     if the attribute has been mapped as a 'child tag' in this type.
     * @param {String} attributeName The name of the attribute to return.
     * @returns {String|Object} The value of the desired attribute.
     */

    var funcName,

        tags;

    //  first try default naming of getAttributeName (typical use)
    funcName = 'get' + attributeName.asStartUpper();
    if (TP.canInvoke(this, funcName)) {
        return this[funcName]();
    }

    if (TP.isArray(tags = this.getType().$get('childTags'))) {
        if (tags.containsString(attributeName)) {
            return this.getChildTextContent(attributeName);
        }
    }

    //  otherwise defer to our supertype implementation
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xmpp.Payload.Inst.defineMethod('set',
function(attributeName, attributeValue) {

    /**
     * @name set
     * @synopsis Sets the value of the named attribute to the value provided.
     *     For XMPP nodes, this may reach into child nodes and obtain their
     *     'text value' if the attribute has been mapped as a 'child tag' in
     *     this type.
     * @param {String} attributeName The attribute name to set.
     * @param {Object} attributeValue The value to set.
     * @returns {TP.xmpp.Payload} The receiver.
     * @todo
     */

    var funcName,

        tags,
        elem;

    //  first try default naming of setAttributeName (typical use)
    funcName = 'set' + attributeName.asStartUpper();
    if (TP.canInvoke(this, funcName)) {
        return this[funcName](attributeValue);
    }

    if (TP.isArray(tags = this.getType().get('childTags'))) {
        if (tags.containsString(attributeName)) {
            //  We'll create the named descendant if one can't be found.
            elem = this.getNamedDescendant(attributeName, true);
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
