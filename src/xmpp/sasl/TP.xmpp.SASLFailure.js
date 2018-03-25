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
 * @type {TP.xmpp.SASLFailure}
 * @summary A wrapper for the SASL failure element
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
     * @method getErrorCondition
     * @summary Returns an element containing the error condition that
     *     occurred.
     * @returns {TP.dom.ElementNode} The element denoting the error condition
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
     * @method getErrorText
     * @summary Returns a String containing the error message of the error that
     *     occurred. Note that error texts are completely optional as per the
     *     XMPP 1.0 specification.
     * @returns {String} The error text for the current error condition.
     */

    //  SASL 'failure's don't have error text.
    return '';
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
