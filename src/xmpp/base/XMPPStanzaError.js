//  ========================================================================
/*
NAME:   TP.xmpp.StanzaError.js
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
 * @type {TP.xmpp.StanzaError}
 * @synopsis A wrapper type for error packets in the TP.xmpp.XMLNS.CLIENT
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
     * @name getErrorCondition
     * @synopsis Returns an element containing the error condition that
     *     occurred.
     * @returns {TP.core.ElementNode} The element denoting the error condition
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
     * @name getErrorException
     * @synopsis Returns the name of the exception that should be raised when
     *     this error occurs.
     * @returns {String} The type name of the exception.
     */

    return 'TP.sig.InvalidXMPPStanza';
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
