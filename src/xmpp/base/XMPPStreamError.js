//  ========================================================================
/*
NAME:   TP.xmpp.StreamError.js
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
 * @type {TP.xmpp.StreamError}
 * @synopsis A wrapper type for error packets in the TP.xmpp.XMLNS.STREAM
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
     * @name getErrorCondition
     * @synopsis Returns an element containing the error condition that
     *     occurred.
     * @returns {TP.core.ElementNode} The element denoting the error condition
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
     * @name getErrorException
     * @synopsis Returns the name of the exception that should be raised when
     *     this error occurs.
     * @returns {String} The type name of the exception.
     */

    return 'TP.sig.InvalidXMPPStream';
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
