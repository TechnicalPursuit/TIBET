//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  ========================================================================
//  TP.xctrls.* Additions
//  ========================================================================

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.Element.Inst.defineMethod('hudCanDrop',
function(aHUD, targetTPElem) {

    /**
     * @method hudCanDrop
     * @summary Returns whether or not the hud should allow the supplied element
     *     to be dropped into the receiver.
     * @param {TP.sherpa.hud} aHUD The hud that is requesting whether or not
     *     it can drop the supplied element into the receiver.
     * @param {TP.sherpa.hud} droppingTPElem The element that is being dropped.
     * @returns {Boolean} Whether or not the hud can drop the supplied target
     *     into the receiver.
     */

    //  No element can be dropped into any xctrls element by default.
    return false;
});

//  ========================================================================
//  TP.xctrls.button Additions
//  ========================================================================

TP.xctrls.button.Inst.defineMethod('getConnectorSource',
function(aConnector) {

    /**
     * @method getConnectorSource
     * @summary Returns an element to be used as a connector source. Note that,
     *     at this level, the receiver returns itself as a valid connector
     *     source (if it has the correct attribute).
     * @param {TP.sherpa.connector} aConnector The connector that is requesting
     *     the source to drag from.
     * @returns {TP.xctrls.button} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.button.Inst.defineMethod('connectorSessionDidStart',
function() {

    /**
     * @method connectorSessionDidStart
     * @summary Informs the receiver that any connector session it is going to
     *     be a part of has started.
     * @returns {TP.xctrls.button} The receiver.
     */

    this.setAttribute('sherpa:connectorvend', 'signalsource');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.button.Inst.defineMethod('connectorSessionDidStop',
function() {

    /**
     * @method connectorSessionDidStop
     * @summary Informs the receiver that any connector session it was currently
     *     a part of has stopped.
     * @returns {TP.xctrls.button} The receiver.
     */

    this.removeAttribute('sherpa:connectorvend');

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
