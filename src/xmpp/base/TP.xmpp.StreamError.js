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
 * @type {TP.xmpp.StreamError}
 * @summary A wrapper type for error packets in the TP.xmpp.XMLNS.STREAM
 *     namespace.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Error.defineSubtype('StreamError');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.StreamError.set('namespace', TP.xmpp.XMLNS.STREAM);

TP.xmpp.StreamError.set('tagname', 'error');

TP.xmpp.StreamError.set('template',
        TP.join('<stream:error ',
        'xmlns:stream="http://etherx.jabber.org/streams">',
        '</stream:error>'));

TP.xmpp.StreamError.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.StreamError.Inst.defineMethod('getErrorCondition',
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
    //  TP.xmpp.XMLNS.STREAMS (NB: *not* 'TP.xmpp.XMLNS.STREAM') namespace.
    conditionTPElems = this.getElementsByTagName(
                                        '*', TP.xmpp.XMLNS.STREAMS);

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

TP.xmpp.StreamError.Inst.defineMethod('getErrorException',
function() {

    /**
     * @method getErrorException
     * @summary Returns the name of the exception that should be raised when
     *     this error occurs.
     * @returns {String} The type name of the exception.
     */

    return 'TP.sig.InvalidXMPPStream';
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
