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
 * @type {TP.xmpp.Query}
 * @summary A convenience wrapper for query tags, typically used with IQ
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
     * @method init
     * @summary Initializes a new instance.
     * @param {Node} aNode A native node, or null to use the type's default
     *     template.
     * @param {String} aNamespace The namespace to qualify the receiver with.
     * @returns {TP.xmpp.Query|undefined} A new instance.
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
