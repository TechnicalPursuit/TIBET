//  ========================================================================
/*
NAME:   TP.xmpp.SignalPayload.js
AUTH:   Scott Shattuck (ss), William J. Edney (wje)
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
 * @type {TP.xmpp.SignalPayload}
 * @synopsis Payload for TIBET signal types, allowing them to move across the
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
                        TP.ac('TP.sig.Signal', 'INFO', 'TRACE', 'SYSTEM'));

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
     * @name fromTP_sig_Signal
     * @synopsis Constructs a new instance from a TP.sig.Signal instance.
     * @param {TP.sig.Signal} aSignal The instance to use as a template.
     * @returns {TP.xmpp.SignalPayload} A new instance.
     */

    var sigTPElem,

        args,
        dat;

    if (TP.notValid(aSignal)) {
        return this.raise('TP.sig.InvalidParameter', arguments);
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
            dat = args.as('TP.core.XMLRPCNode');
            if (TP.isNode(dat)) {
                TP.nodeAppendChild(sigTPElem.getNativeNode(), dat);
            }
        } catch (e) {
            aSignal.raise('TP.sig.XMPPSerializationException',
                            arguments,
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
     * @name asTP_sig_Signal
     * @synopsis Returns the instance, encoded as a TP.sig.Signal. This
     *     effectively reconstitutes the embedded signal content.
     * @raises SignalNodeNotFound, SignalTypeNotFound, ReconstitutionFailure
     * @returns {TP.sig.Signal} A new instance.
     */

    var sigTypeName,
        sigType,

        org,
        payload,

        inst;

    sigTypeName = this.getAttribute('type');

    if (!TP.isType(sigType = TP.sys.getTypeByName(sigTypeName))) {
        return this.raise('TP.sig.SignalTypeNotFound', arguments);
    }

    org = this.getAttribute('origin');

    try {
        payload = TP.core.XMLRPCNode.objectFromNode(
                                        this.getNativeNode().firstChild);
    } catch (e) {
        return this.raise('TP.sig.ReconstitutionFailure',
                            arguments,
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
