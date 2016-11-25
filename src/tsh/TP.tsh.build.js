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
 * @type {TP.tsh.build}
 * @summary A subtype of TP.core.ActionElementNode used to trigger a build.
 */

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.defineSubtype('tsh:build');

TP.tsh.build.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.build.Type.defineMethod('tshExecute',
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

    var shell;

    shell = aRequest.at('cmdShell');

    TP.signal(null, 'RemoteConsoleCommand',
        TP.hc('originalRequest', aRequest,
            'timeout', 60000,
            TP.ONSUCCESS, function(aResponse) {
            },
            TP.ONFAIL, function(aResponse) {
            }
        ));

    aRequest.complete(TP.TSH_NO_INPUT);

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
