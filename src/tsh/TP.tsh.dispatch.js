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
 * @type {TP.tsh.dispatch}
 * @summary A subtype of TP.tag.ActionTag that dispatches a signal according to
 *     the data configured on it.
 */

//  ------------------------------------------------------------------------

TP.tag.ActionTag.defineSubtype('tsh:dispatch');

TP.tsh.dispatch.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.dispatch.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Executes a formatting or template transformation operation on
     *     the current value of stdin.
     * @param {TP.sig.ShellRequest} aRequest The request containing command
     *     input.
     * @returns {TP.sig.Request|Number} The request or a TSH shell loop control
     *     constant which controls how the outer TSH processing loop should
     *     continue. Common values are TP.CONTINUE, TP.DESCEND, and TP.BREAK.
     */

    var shell,

        elem,

        orgid,
        doc,
        target,

        sigName,
        sigPayload,
        sigPolicy;

    if (TP.notValid(elem = aRequest.at('cmdNode'))) {
        return aRequest.fail();
    }

    shell = aRequest.at('cmdShell');

    //  ---
    //  origin
    //  ---

    //  If an 'origin' slot was supplied, then we look that up by ID (using
    //  the original origin's document).
    orgid = shell.getArgument(aRequest, 'tsh:origin', null, true);

    if (TP.notEmpty(orgid)) {
        //  Just in case it was supplied as a quoted value
        orgid = orgid.unquoted();

        doc = TP.nodeGetDocument(elem);

        //  Note how we pass false to avoid getting a wrapped origin, which
        //  we don't want here.
        target = TP.byId(orgid, doc, false);
    } else {
        target = null;
    }

    //  ---
    //  signal
    //  ---

    sigName = shell.getArgument(aRequest, 'tsh:signal', null, true);

    //  If there is no signal name, warn and exit.
    if (TP.isEmpty(sigName)) {
        TP.ifError() ?
            TP.error('No signal name in <tsh:dispatch/> tag.') : 0;

        return;
    }

    //  ---
    //  payload
    //  ---

    sigPayload = shell.getArgument(aRequest, 'tsh:payload', null, true);

    if (TP.notEmpty(sigPayload)) {
        if (sigPayload.startsWith('{')) {
            //  What's left is a JS-formatted String. Parse that into a Hash.
            sigPayload = TP.json2js(TP.reformatJSToJSON(sigPayload));
        } else {
            sigPayload = TP.hc();
        }
    }

    //  ---
    //  policy
    //  ---

    sigPolicy = shell.getArgument(aRequest, 'tsh:policy', null, true);

    //  ---
    //  Dispatch the signal
    //  ---

    TP.wrap(elem).dispatch(sigName, target, sigPayload, sigPolicy);

    /* eslint-enable no-loop-func */

    aRequest.complete();

    return TP.CONTINUE;
});

//  ------------------------------------------------------------------------
//
TP.shell.TSH.addHelpTopic('dispatch',
    TP.tsh.dispatch.Type.getMethod('tshExecute'),
    'Dispatches a signal.',
    ':dispatch [--origin <origin>] [--signal <signal>] [--payload <payload>]');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
