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
 * @type {sig:}
 * @synopsis This type represents the TIBET Signals namespace
 *     (http://www.technicalpursuit.com/1999/signals) in the tag processing
 *     system.
 */

//  ------------------------------------------------------------------------

TP.core.XMLNamespace.defineSubtype('sig:XMLNS');

//  ------------------------------------------------------------------------

TP.sig.XMLNS.Type.defineMethod('dispatchSignal',
function(anElement) {

    /**
     * @name dispatchSignal
     * @synopsis Dispatches a signal as specified by the supplied element's
     *     attributes.
     * @description This method is a slight variation on the 'tshExecute' method
     *     on the sig:dispatch type but that method uses a request object
     *     whereas this operates directly on the supplied element.
     * @param {Element} anElement The element to use to derive dispatching
     *     information such as the signal name, signal origin and optional
     *     signal payload from.
     * @returns {Object} An object which controls how outer TSH loop processing
     *     should continue.
     * @todo
     */

    var signalName,
        signame,

        origin,
        signalTargets,

        win,

        payloadStr,

        payload,
        destWin,

        type,
        policy;

    if (TP.isEmpty(signalName = TP.elementGetAttribute(anElement,
                                                        'sig:name',
                                                        true))) {
        return;
    }

    //  If the expanded signal name resolves to a real type, then use that
    //  expanded signal name as the signal name. Otherwise, it's a spoofed
    //  signal so just use the supplied signal name.
    signalName = TP.isType(
                    TP.sys.require(
                        signame = TP.expandSignalName(signalName))) ?
                        signame :
                        signalName;

    origin = TP.elementGetAttribute(anElement, 'sig:origin', true);

    //  If the origin is '*', then the signal target is TP.ANY
    if (origin === '*') {
        signalTargets = TP.ANY;
    } else {
        //  If the origin is empty, then the signal target is this
        //  'dispatch' node.
        if (TP.isEmpty(origin)) {
            signalTargets = TP.ac(anElement);
        } else {
            if (TP.isEmpty(signalTargets = TP.unwrap(TP.byPath(origin)))) {
                //  note that this allows destinations in other documents to
                //  occur
                signalTargets = TP.ac(TP.unwrap(TP.byOID(origin)));
            }
        }

        if (TP.notValid(signalTargets)) {
            //  couldn't find it in TIBET. Let's try our document.
            if (TP.isWindow(win = TP.nodeGetWindow(anElement))) {
                if (TP.notValid(signalTargets =
                                TP.ac(TP.byId(origin, win)))) {
                    return;
                }
            }
        }
    }

    //  NOTE this is a TIBET extension allowing specification of parameter
    //  data in the form of a binding expression's result (so you can use an
    //  instance as a location for parameter data to be leveraged in an
    //  event handler)
    if (TP.notEmpty(payloadStr =
                    TP.elementGetAttribute(anElement, 'sig:payload', true))) {
        payload = TP.lang.Hash.from(payloadStr);
    }

    //  If the signalTargets is TP.ANY, then we just use the 'signal' method
    //  with a null origin
    if (signalTargets === TP.ANY) {
        TP.signal(null, signalName, payload);
    } else if (TP.notEmpty(signalTargets)) {
        //  See if we can get a firing policy by getting the type of the
        //  signal and querying it for a firing policy.
        if (TP.isType(type = TP.sys.getTypeByName(signalName))) {
            policy = type.getDefaultPolicy();
        } else {
            //  Couldn't get a type for the signal - default to
            //  TP.DOM_FIRING (since we're in a DOM)
            policy = TP.DOM_FIRING;
        }

        signalTargets.perform(
            function(signalTarget) {

                //  If the signalTarget is an element, then we use
                //  TP.dispatch() since we can compute a full set of event
                //  ids from it (and we assume that its in the DOM
                //  somewhere).
                if (TP.isElement(signalTarget)) {
                    destWin = TP.nodeGetWindow(signalTarget);

                    if (TP.notValid(destWin)) {
                        TP.ifWarn() ?
                            TP.warn('No window for target. Defaulting to ' +
                                        'codeframe.',
                                        TP.LOG) : 0;

                        destWin = window;
                    }

                    //  We hand in 'null' for the origin since we want to
                    //  force the TP.dispatch() call to compute the global
                    //  ID, etc. from the signalTarget element.
                    destWin.TP.dispatch(
                                    null,
                                    signalName,
                                    signalTarget,
                                    payload,
                                    policy,
                                    TP.elementGetAttribute(
                                        anElement, 'ev:cancelable', true),
                                    TP.elementGetAttribute(
                                        anElement, 'ev:bubbles', true));
                } else {
                    //  It was a non-element TIBET object, we can just use
                    //  the 'signal' method
                    TP.signal(signalTarget, signalName, payload);
                }
            });
    }

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
