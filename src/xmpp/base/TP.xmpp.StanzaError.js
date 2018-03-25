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
 * @type {TP.xmpp.StanzaError}
 * @summary A wrapper type for error packets in the TP.xmpp.XMLNS.CLIENT
 *     namespace.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Error.defineSubtype('StanzaError');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.StanzaError.set('namespace', TP.xmpp.XMLNS.CLIENT);

TP.xmpp.StanzaError.set('tagname', 'error');

TP.xmpp.StanzaError.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.StanzaError.Inst.defineMethod('getErrorCondition',
function() {

    /**
     * @method getErrorCondition
     * @summary Returns an element containing the error condition that
     *     occurred.
     * @returns {TP.dom.ElementNode} The element denoting the error condition
     *     as per the XMPP 1.0 specification.
     */

    var conditionTPElems;

    //  Grab all of the elements under this element that are in the
    //  TP.xmpp.XMLNS.STANZAS namespace.
    conditionTPElems = this.getElementsByTagName(
                                            '*', TP.xmpp.XMLNS.STANZAS);

    //  Return the first one that is *not* a 'text' element
    return conditionTPElems.detect(
        function(aTPElem) {

            if (aTPElem.getLocalName().toLowerCase() !== 'text') {
                return true;
            }

            return false;
        });
});

//  ------------------------------------------------------------------------

TP.xmpp.StanzaError.Inst.defineMethod('getErrorException',
function() {

    /**
     * @method getErrorException
     * @summary Returns the name of the exception that should be raised when
     *     this error occurs.
     * @returns {String} The type name of the exception.
     */

    return 'TP.sig.InvalidXMPPStanza';
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
