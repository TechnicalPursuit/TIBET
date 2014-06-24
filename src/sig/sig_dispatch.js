//  ========================================================================
/*
NAME:   sig_dispatch.js
AUTH:   Scott Shattuck (ss)
NOTE:   Copyright (C) 1999-2007 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.2, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.1
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
//  ------------------------------------------------------------------------

/**
 * @type {TP.sig.dispatch}
 * @synopsis An action which manages signal dispatching for TP.sig.dispatch
 *     elements found in the markup.
 * @description The TIBET implementation of this action has extended capability
 *     over XML Events v2 (draft) specification - namely the ability to dispatch
 *     using a target="*" syntax to simulate TIBET's TP.ANY origin behavior and
 *     the ability to specify signal arguments using binding attributes.
 */

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.defineSubtype('sig:dispatch');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sig.dispatch.Type.defineMethod('shouldFailOnEmptyInput',
function() {

    /**
     * @name shouldFailOnEmptyInput
     * @synopsis Returns true when the receiver's type will typically fail() any
     *     request which can't provide viable input data. The default is true.
     * @returns {Boolean} Whether processing should stop if input data is null
     *     or undefined.
     * @todo
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.sig.dispatch.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @name tshExecute
     * @synopsis Dispatches a signal as specified by the receiver's content node
     *     attributes.
     * @description The XForms dispatch action, with extensions. In particular
     *     TIBET allows dispatch to reference a payload which allows it to
     *     integrate seamlessly with TIBET's signaling system's concept of
     *     payload. The payload is defined by standard binding attributes on the
     *     receiver (which isn't allowed in the XForms schema).
     * @param {TP.sig.Request} aRequest The request to process.
     * @returns {Object} An object which controls how outer TSH loop processing
     *     should continue.
     */

    var node,

        signalName,
        signame,

        origin,
        signalTargets,

        win,

        payloadStr,

        payload,
        destWin,

        type,
        policy;

    if (TP.notValid(node = aRequest.at('cmdNode'))) {
        aRequest.fail();

        return TP.BREAK;
    }

    if (TP.isEmpty(signalName = TP.elementGetAttribute(node,
                                                        'sig:name',
                                                        true))) {
        aRequest.fail(TP.FAILURE, 'Missing required "name" attribute.');

        return TP.BREAK;
    }

    //  If the expanded signal name resolves to a real type, then use that
    //  expanded signal name as the signal name. Otherwise, it's a spoofed
    //  signal so just use the supplied signal name.
    signalName = TP.isType(
                    TP.sys.require(
                        signame = TP.expandSignalName(signalName))) ?
                        signame :
                        signalName;

    origin = TP.elementGetAttribute(node, 'sig:origin', true);

    //  If the origin is '*', then the signal target is TP.ANY
    if (origin === '*') {
        signalTargets = TP.ANY;
    } else {
        //  If the origin is empty, then the signal target is this
        //  'dispatch' node.
        if (TP.isEmpty(origin)) {
            signalTargets = TP.ac(node);
        } else {
            if (TP.isEmpty(signalTargets = TP.unwrap(TP.byPath(origin)))) {
                //  note that this allows destinations in other documents to
                //  occur
                signalTargets = TP.ac(TP.unwrap(TP.byOID(origin)));
            }
        }

        if (TP.notValid(signalTargets)) {
            //  couldn't find it in TIBET. Let's try our document.
            if (TP.isWindow(win = TP.nodeGetWindow(node))) {
                if (TP.notValid(signalTargets =
                                TP.ac(TP.byId(origin, win)))) {
                    aRequest.fail(
                        TP.FAILURE,
                        'Specified "origin" element not found: ' +
                                    TP.str(node));

                    return TP.BREAK;
                }
            }
        }
    }

    //  NOTE this is a TIBET extension allowing specification of parameter
    //  data in the form of a binding expression's result (so you can use an
    //  instance as a location for parameter data to be leveraged in an
    //  event handler)
    if (TP.notEmpty(payloadStr =
                    TP.elementGetAttribute(node, 'sig:payload', true))) {
        payload = TP.lang.Hash.from(payloadStr);
    } else {
        payload = this.getActionInput(aRequest);

        //  If we got an Array back, see if we can collapse it, since
        //  'dispatch' will do better with a non-Array payload
        if (TP.isArray(payload)) {
            payload = payload.collapse();
        }
    }

    //  If the signalTargets is TP.ANY, then we just use the 'signal' method
    //  with a null origin
    if (signalTargets === TP.ANY) {
        TP.signal(null, signalName, arguments, payload);
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
                                        TP.LOG, arguments) : 0;

                        destWin = window;
                    }

                    //  We hand in 'null' for the origin since we want to
                    //  force the TP.dispatch() call to compute the global
                    //  ID, etc. from the signalTarget element.
                    destWin.TP.dispatch(null,
                                        signalName,
                                        signalTarget,
                                        payload,
                                        policy,
                                        TP.elementGetAttribute(
                                            node, 'ev:cancelable', true),
                                        TP.elementGetAttribute(
                                            node, 'ev:bubbles', true));
                } else {
                    //  It was a non-element TIBET object, we can just use
                    //  the 'signal' method
                    TP.signal(signalTarget, signalName, arguments, payload);
                }
            });
    }

    return TP.CONTINUE;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
