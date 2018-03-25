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
 * @type {TP.xmpp.SignalPayload}
 * @summary Payload for TIBET signal types, allowing them to move across the
 *     wire within the context of an XMPP packet. We leverage IQ packets to
 *     avoid store/forward issues and remain compliant.
 */

//  ------------------------------------------------------------------------

TP.xmpp.Payload.defineSubtype('SignalPayload');

//  ------------------------------------------------------------------------
//  Type Constants
//  ------------------------------------------------------------------------

//  a list of signal types we won't allow to be published
TP.xmpp.SignalPayload.Type.defineConstant(
                        'EXCLUSIONS',
                        TP.ac('TP.sig.Signal', 'DEBUG', 'INFO', 'TRACE', 'SYSTEM'));

//  Make sure to set the 'namespace', since its cleared by our
//  TP.xmpp.Payload supertype.
TP.xmpp.SignalPayload.set('namespace', TP.xmpp.XMLNS.TIBET_SIGNAL);
TP.xmpp.SignalPayload.set('tagname', 'tibet_signal');

TP.xmpp.SignalPayload.set('template',
        TP.join('<tibet_signal xmlns="',
        TP.xmpp.XMLNS.TIBET_SIGNAL, '"',
        ' type="" origin=""></tibet_signal>'));

TP.xmpp.SignalPayload.register();

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xmpp.SignalPayload.Type.defineMethod('fromTP_sig_Signal',
function(aSignal) {

    /**
     * @method fromTP_sig_Signal
     * @summary Constructs a new instance from a TP.sig.Signal instance.
     * @param {TP.sig.Signal} aSignal The instance to use as a template.
     * @returns {TP.xmpp.SignalPayload} A new instance.
     */

    var sigTPElem,

        args,
        dat;

    if (TP.notValid(aSignal)) {
        return this.raise('TP.sig.InvalidParameter');
    }

    //  get the basic instance constructed with standard template and params
    sigTPElem = this.construct();

    sigTPElem.setAttribute('type', aSignal.getSignalName());

    if (TP.isValid(aSignal.getOrigin())) {
        sigTPElem.setAttribute('origin', aSignal.getOrigin().getID());
    }

    //  process any signal-specific arguments
    if (TP.isValid(args = aSignal.getPayload())) {
        //  signal args are where the real data will be hiding...need that
        //  in a suitable xml form
        try {
            dat = args.as('TP.dom.XMLRPCNode');
            if (TP.isNode(dat)) {
                TP.nodeAppendChild(sigTPElem.getNativeNode(), dat);
            }
        } catch (e) {
            aSignal.raise('TP.sig.XMPPSerializationException',
                            args);
        }
    }

    return sigTPElem;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xmpp.SignalPayload.Inst.defineMethod('asTP_sig_Signal',
function() {

    /**
     * @method asTP_sig_Signal
     * @summary Returns the instance, encoded as a TP.sig.Signal. This
     *     effectively reconstitutes the embedded signal content.
     * @exception TP.sig.SignalNodeNotFound
     * @exception TP.sig.SignalTypeNotFound
     * @exception TP.sig.ReconstitutionFailure
     * @returns {TP.sig.Signal} A new instance.
     */

    var sigTypeName,
        sigType,

        org,
        payload,

        inst;

    sigTypeName = this.getAttribute('type');

    if (!TP.isType(sigType = TP.sys.getTypeByName(sigTypeName))) {
        return this.raise('TP.sig.SignalTypeNotFound');
    }

    org = this.getAttribute('origin');

    try {
        payload = TP.dom.XMLRPCNode.objectFromNode(
                                        this.getNativeNode().firstChild);
    } catch (e) {
        return this.raise('TP.sig.ReconstitutionFailure',
                            TP.ec(e, this.asString()));
    }

    inst = sigType.construct(payload);
    if (TP.isValid(org)) {
        inst.setOrigin(org);
    }

    return inst;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
