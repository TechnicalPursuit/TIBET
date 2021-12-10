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
 * @type {TP.tsh.echo}
 * @summary A subtype of TP.tag.ActionTag that echos its arguments to stdout.
 */

//  ------------------------------------------------------------------------

TP.tag.ActionTag.defineSubtype('tsh:echo');

TP.tsh.echo.addTraitTypes(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.echo.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Executes the command, echoing any arguments for review.
     * @param {TP.sig.ShellRequest} aRequest The request which triggered
     *     this command.
     * @returns {TP.sig.Request|Number} The request or a TSH shell loop control
     *     constant which controls how the outer TSH processing loop should
     *     continue. Common values are TP.CONTINUE, TP.DESCEND, and TP.BREAK.
     */

    var shell,
        args;

    shell = aRequest.at('cmdShell');

    args = shell.getArguments(aRequest);
    aRequest.stdout(args);

    return aRequest.complete();
});

//  ------------------------------------------------------------------------

TP.shell.TSH.addHelpTopic('echo',
    TP.tsh.echo.Type.getMethod('tshExecute'),
    'Echoes the arguments provided for debugging.',
    ':echo args...',
    'Echoes out whatever arguments are supplied to the command.');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
