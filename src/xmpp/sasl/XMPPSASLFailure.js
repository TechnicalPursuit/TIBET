//  ========================================================================
/*
NAME:   TP.xmpp.SASLFailure.js
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
 * @type {TP.xmpp.SASLFailure}
 * @synopsis A wrapper for the SASL failure element
 */

//  ------------------------------------------------------------------------

TP.xmpp.Error.defineSubtype('SASLFailure');

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.SASLFailure.set('namespace', TP.xmpp.XMLNS.SASL);
TP.xmpp.SASLFailure.set('tagname', 'failure');

TP.xmpp.SASLFailure.register();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.SASLFailure.Inst.defineMethod('getErrorCondition',
function() {

    /**
     * @name getErrorCondition
     * @synopsis Returns an element containing the error condition that
     *     occurred.
     * @returns {TP.core.ElementNode} The element denoting the error condition
     *     as per the XMPP 1.0 specification.
     */

    var conditionElements;

    //  Grab all of the elements under this element that are in the
    //  TP.xmpp.XMLNS.SASL namespace.
    conditionElements = this.getElementsByTagName('*', TP.xmpp.XMLNS.SASL);

    //  Return the first one
    return conditionElements.first();
});

//  ------------------------------------------------------------------------

TP.xmpp.SASLFailure.Inst.defineMethod('getErrorText',
function() {

    /**
     * @name getErrorText
     * @synopsis Returns a String containing the error message of the error that
     *     occurred. Note that error texts are completely optional as per the
     *     XMPP 1.0 specification.
     * @returns {String} The error text for the current error condition.
     * @todo
     */

    //  SASL 'failure's don't have error text.
    return '';
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
