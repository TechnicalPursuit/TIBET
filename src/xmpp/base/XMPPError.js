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
