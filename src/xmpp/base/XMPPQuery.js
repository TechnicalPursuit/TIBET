//  ========================================================================
/*
NAME:   TP.xmpp.Query.js
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
 * @type {TP.xmpp.Query}
 * @synopsis A convenience wrapper for query tags, typically used with IQ
 *     packets to facilitate operating on their query payloads.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Payload.defineSubtype('Query');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.Query.set('namespace', TP.xmpp.XMLNS.CLIENT);

TP.xmpp.Query.set('tagname', 'query');

TP.xmpp.Query.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.Query.Inst.defineMethod('init',
function(aNode, aNamespace) {

    /**
     * @name init
     * @synopsis Initializes a new instance.
     * @param {Node} aNode A native node, or null to use the type's default
     *     template.
     * @param {String} aNamespace The namespace to qualify the receiver with.
     * @returns {TP.xmpp.Query} A new instance.
     * @todo
     */

    var elem,

        nodeStr,

        startAttrRegEx,
        xmlnsIndex,
        templateWithNS;

    if (TP.isEmpty(aNamespace)) {
        elem = aNode;
    } else {
        nodeStr = TP.nodeAsString(aNode);

        //  Strip out any existing namespace
        TP.regex.XMLNS_STRIP.lastIndex = 0;
        nodeStr = nodeStr.strip(TP.regex.XMLNS_STRIP);

        startAttrRegEx = /^<(\w+)/g;
        startAttrRegEx.lastIndex = 0;
        startAttrRegEx.exec(nodeStr);

        xmlnsIndex = startAttrRegEx.lastIndex;

        templateWithNS = TP.join(nodeStr.slice(0, xmlnsIndex),
                                ' xmlns="', aNamespace, '"',
                                nodeStr.slice(xmlnsIndex));

        elem = TP.elementFromString(templateWithNS);

        if (TP.notValid(elem)) {
            //  TODO: Throw an exception
            return;
        }
    }

    return this.callNextMethod(elem);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
