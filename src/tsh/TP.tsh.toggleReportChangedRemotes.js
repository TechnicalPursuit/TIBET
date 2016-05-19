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
 * @type {TP.tsh.toggleReportChangedRemotes}
 * @summary A subtype of TP.core.ActionElementNode that knows how to
 *     conditionally process its child actions based on a binding expression.
 */

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.defineSubtype('tsh:toggleReportChangedRemotes');

TP.tsh.toggleReportChangedRemotes.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.toggleReportChangedRemotes.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Runs the receiver, effectively invoking its action.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue. Common values are TP.CONTINUE, TP.DESCEND, and
     *     TP.BREAK.
     */

    var shell,

        resourceHash,
        handler;

    shell = aRequest.at('cmdShell');

    //  If either one of the debugging flags is turned on, then echo the
    //  debugging information.
    if (shell.getArgument(aRequest, 'tsh:debug', null, false)) {
        return this.printDebug(aRequest, true, false);
    }

    if (shell.getArgument(aRequest, 'tsh:debugresolve', null, false)) {
        return this.printDebug(aRequest, true, true);
    }

    //  No arguments means we dump usage.
    if (!shell.hasArguments(aRequest)) {
        return this.printUsage(aRequest);
    }

    resourceHash = TP.core.URI.get('changedResources');

    handler =
        function(aSignal) {
            var req;

            req = TP.sig.UserOutputRequest.construct(
                        TP.hc('output', 'Changed remote resources:',
                                'cmdAsIs', true,
                                'cmdBox', false,
                                'cmdRecycle', true));

            req.fire(shell);

            //  Set cmdAsIs to false to get fancy JSON formatting.

            //  NB: We do the TP.json2js(resourceHash.asJSONSource())
            //  shuffle because resourceHash has circular references that
            //  freak out the JSON parser.
            req = TP.sig.UserOutputRequest.construct(
                        TP.hc('output',
                                TP.jsoncc(
                                    TP.json2js(
                                        resourceHash.asJSONSource())),
                                'cmdAsIs', false,
                                'cmdBox', false,
                                'cmdRecycle', true));

            req.fire(shell);
        };

    if (shell.get('remoteWatch')) {

        //  Toggle off

        shell.ignore(resourceHash, 'Change', handler);

        shell.set('remoteWatch', false);

        aRequest.stdout('Remote resource change monitoring ended.');

    } else {

        //  Toggle on

        shell.observe(resourceHash, 'Change', handler);

        shell.set('remoteWatch', true);

        aRequest.stdout('Remote resource change monitoring active.');
    }

    aRequest.complete(TP.TSH_NO_INPUT);

    return;
});

//  ------------------------------------------------------------------------

TP.core.TSH.addHelpTopic(
    TP.tsh.toggleReportChangedRemotes.Type.getMethod('tshExecute'),
    'Toggles whether to report remote resource changes. Requires TDS.',
    ':toggleReportChangedRemotes',
    '');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
