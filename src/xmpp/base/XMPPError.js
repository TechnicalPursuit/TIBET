//  ========================================================================
/*
NAME:   TP.xmpp.Error.js
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
 * @type {TP.xmpp.Error}
 * @synopsis A wrapper for XMPP error nodes. These are typically child nodes of
 *     another packet such as a stream or some kind of stanza packet, like an
 *     message, iq, or presence packet.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Payload.defineSubtype('Error');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.Error.Inst.defineMethod('getErrorCondition',
function() {

    /**
     * @name getErrorCondition
     * @synopsis Returns an element containing the error condition that
     *     occurred.
     * @returns {Element} The element denoting the error condition as per the
     *     XMPP 1.0 specification.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xmpp.Error.Inst.defineMethod('getErrorDescription',
function() {

    /**
     * @name getErrorDescription
     * @synopsis Returns the 'error description'. That is, a description of the
     *     error based on the type of error.
     * @returns {String} The error description.
     */

    var errorCondition,
        errorConditionName;

    errorCondition = this.get('errorCondition');

    if (TP.notValid(errorCondition)) {
        return '';
    }

    errorConditionName = TP.elementGetLocalName(errorCondition);

    return errorConditionName.replace(/-/g, ' ').asTitleCase();
});

//  ------------------------------------------------------------------------

TP.xmpp.Error.Inst.defineMethod('getErrorElement',
function() {

    /**
     * @name getErrorElement
     * @synopsis Returns the native node of the receiver since this type is, by
     *     defintion, an error
     * @returns {TP.core.ElementNode} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.xmpp.Error.Inst.defineMethod('getErrorException',
function() {

    /**
     * @name getErrorException
     * @synopsis Returns the name of the exception that should be raised when
     *     this error occurs.
     * @returns {String} The type name of the exception.
     */

    return 'TP.sig.XMPPException';
});

//  ------------------------------------------------------------------------

TP.xmpp.Error.Inst.defineMethod('getErrorText',
function() {

    /**
     * @name getErrorText
     * @synopsis Returns a String containing the error message of the error that
     *     occurred. Note that error texts are completely optional as per the
     *     XMPP 1.0 specification.
     * @returns {String} The error text for the current error condition.
     * @todo
     */

    var errorText,
        errorTextTPElem;

    errorText = '';

    //  Get the first error 'text' element, if there is one
    if (TP.isValid(errorTextTPElem =
                    this.getElementsByTagName('text').first())) {
        errorText = errorTextTPElem.getTextContent();

        //  See if we can localize the message.
        errorText = errorText.localize(
                            errorTextTPElem.getContentLanguage());
    }

    return errorText;
});

//  ------------------------------------------------------------------------

TP.xmpp.Error.Inst.defineMethod('getSignalName',
function(aStanza) {

    /**
     * @name getSignalName
     * @synopsis Returns the signal name to use when signaling arrival of
     *     packets of this type. The default is XMPP*ErrorInput where the
     *     asterisk is replaced by the error condition tag string, for example:
     *     'TP.sig.XMPPInvalidXmlErrorInput'.
     * @param {TP.xmpp.Stanza} aStanza The stanza that 'owns' this element.
     * @returns {String} 
     * @todo
     */

    var condition,

        localTypeName,
        globalTypeName;

    condition = this.get('errorCondition');

    //  if we have an 'error condition' TP.core.Node, let it determine the
    //  signal name
    if (TP.isValid(condition)) {
        //  This will turn an error condition element name such as
        //  'invalid-xml' into 'TP.sig.XMPPInvalidXmlErrorInput'. It creates
        //  a real subtype of TP.sig.XMPPErrorInput if one isn't available.
        localTypeName = 'XMPP' +
                        condition.getLocalName().asTitleCase().strip('-') +
                        'ErrorInput';
        globalTypeName = 'TP.sig.' + localTypeName;

        if (TP.notValid(TP.sys.require(globalTypeName))) {
            TP.sys.require('TP.sig.XMPPErrorInput').defineSubtype(
                                                    localTypeName, 'sig');
        }

        return globalTypeName;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xmpp.Error.Inst.defineMethod('isError',
function() {

    /**
     * @name isError
     * @synopsis Returns true since this element type is, by definition, an
     *     error.
     * @returns {Boolean} 
     */

    return true;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
