//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {on:}
 * @summary This type represents the TIBET on namespace
 *     (http://www.technicalpursuit.com/2005/on) in the tag processing system.
 */

//  ------------------------------------------------------------------------

TP.core.XMLNamespace.defineSubtype('on.XMLNS');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.on.XMLNS.Type.defineMethod('setup',
function(anElement) {

    /**
     * @method setup
     * @param {Element} anElement The element to set up.
     * @returns {null}
     */

    var onAttrNodes,

        domSigTypeMapVals,

        len,
        i,

        attrNode,
        sigName;

    //  Grab any Attribute nodes in the TP.w3.Xmlns.ON namespace
    if (TP.notEmpty(onAttrNodes = TP.elementGetAttributeNodesInNS(
                                    anElement, null, TP.w3.Xmlns.ON))) {

        domSigTypeMapVals = TP.NON_OBSERVED_ON_ATTRS.getValues();

        //  Loop over them and process individual attributes into observe()
        //  calls.
        len = onAttrNodes.getSize();
        for (i = 0; i < len; i++) {

            attrNode = onAttrNodes.at(i);

            //  The signal name that we'll be observing is the local name of the
            //  attribute.
            sigName = TP.attributeGetLocalName(attrNode);

            //  If this signal name (or event name) points to a UI signal, then
            //  we exit here. Those are processed separately by the DOM_FIRING
            //  policy.
            if (TP.NON_OBSERVED_ON_ATTRS.hasKey(sigName) ||
                domSigTypeMapVals.indexOf(
                        TP.expandSignalName(sigName)) !== TP.NOT_FOUND ||
                domSigTypeMapVals.indexOf(
                        TP.contractSignalName(sigName)) !== TP.NOT_FOUND) {
                continue;
            }

            //  Observe the Element for that signal.
            this.observe(anElement, sigName);
        }
    }

    return;
});

//  ------------------------------------------------------------------------

TP.on.XMLNS.Type.defineHandler('Signal',
function(aSignal) {

    /**
     * @method handleSignal
     * @summary The top-level handler that can handle any kind of signal sent to
     *     an Element that was configured using an on:* attribute (but only for
     *     non-DOM signals - DOM signals configured by on:* are handled
     *     specially by the DOM_FIRING firing policy in the notification center
     *     code).
     * @param {TP.sig.Signal} aSignal The signal.
     */

    var origin,

        originTPElem,
        originElem,

        sigName,
        sigData;

    origin = aSignal.getOrigin();

    if (TP.isString(origin)) {
        //  Grab the real TP.dom.ElementNode that matches the signal origin
        //  (which will be a full GID).
        originTPElem = TP.bySystemId(origin);
        originElem = TP.unwrap(originTPElem);
    } else {
        originElem = origin;
    }

    sigName = aSignal.getSignalName();

    //  First, try the full signal name, which we should get from
    //  getSignalName() above.
    if (TP.elementHasAttribute(originElem, 'on:' + sigName, true)) {
        sigData = TP.elementGetAttribute(
                    originElem, 'on:' + sigName, true);
    } else {

        //  Next, try the shortened version of that name.
        sigData = TP.elementGetAttribute(
                    originElem, 'on:' + TP.contractSignalName(sigName), true);
    }

    //  If we were able to successfully extract signal data, then queue up a
    //  signal that will fire based on this data.
    if (TP.notEmpty(sigData)) {
        TP.queueSignalFromData(
                    sigData,
                    originElem,
                    aSignal,
                    null,   //  payload
                    null,   //  policy
                    TP.sig.ResponderSignal);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.on.XMLNS.Type.defineMethod('teardown',
function(anElement) {

    /**
     * @method teardown
     * @param {Element} anElement The element to tear down.
     * @returns {null}
     */

    var onAttrNodes,

        domSigTypeMapVals,

        len,
        i,

        attrNode,
        sigName;

    //  Grab any Attribute nodes in the TP.w3.Xmlns.ON namespace
    if (TP.notEmpty(onAttrNodes = TP.elementGetAttributeNodesInNS(
                                    anElement, null, TP.w3.Xmlns.ON))) {

        domSigTypeMapVals = TP.NON_OBSERVED_ON_ATTRS.getValues();

        //  Loop over them and process individual attributes into ignore()
        //  calls.
        len = onAttrNodes.getSize();
        for (i = 0; i < len; i++) {

            attrNode = onAttrNodes.at(i);

            //  The signal name that we'll be ignoring is the local name of the
            //  attribute.
            sigName = TP.attributeGetLocalName(attrNode);

            //  If this signal name (or event name) points to a UI signal, then
            //  we exit here. Those are processed separately by the DOM_FIRING
            //  policy.
            if (TP.NON_OBSERVED_ON_ATTRS.hasKey(sigName) ||
                domSigTypeMapVals.indexOf(
                        TP.expandSignalName(sigName)) !== TP.NOT_FOUND ||
                domSigTypeMapVals.indexOf(
                        TP.contractSignalName(sigName)) !== TP.NOT_FOUND) {
                continue;
            }

            //  Ignore the Element for that signal.
            this.ignore(anElement, sigName);
        }
    }

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
