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
 * @type {TP.tsh.keys}
 * @summary Dumps a list of keyboard shortcuts for the Sherpa.
 */

//  ------------------------------------------------------------------------

TP.core.ActionElementNode.defineSubtype('tsh:keys');

TP.tsh.keys.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.keys.Type.defineMethod('tshExecute',
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

    if (shell.getArgument(aRequest, 'tsh:debug', null, false)) {
        return this.printDebug(aRequest, true, false);
    }

    if (shell.getArgument(aRequest, 'tsh:debugresolve', null, false)) {
        return this.printDebug(aRequest, true, true);
    }

    keys = TP.hc(
        'Shift-Return', 'Execute',
        'Alt-Up', 'Show/Hide HUD');

    aRequest.complete(keys);

    return;
});

//  ------------------------------------------------------------------------

TP.core.TSH.addHelpTopic('keys',
    TP.tsh.keys.Type.getMethod('tshExecute'),
    'Lists keyboard shortcuts for the Sherpa toolset.',
    ':keys',
    'Coming soon.');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
