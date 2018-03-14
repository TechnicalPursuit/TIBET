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
 * @type {TP.tsh.dump}
 * @summary A subtype of TP.core.ActionTag that knows how to
 *     conditionally process its child actions based on a binding expression.
 */

//  ------------------------------------------------------------------------

TP.core.ActionTag.defineSubtype('tsh:dump');

TP.tsh.dump.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.dump.Type.defineMethod('tshExecute',
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

        arg0,
        obj;

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

    arg0 = shell.getArgument(aRequest, 'ARG0');
    obj = shell.resolveObjectReference(arg0, aRequest);

    if (TP.isValid(obj)) {
        aRequest.stdout(obj, TP.request('cmdTitle', TP.name(obj)));
        aRequest.complete(TP.TSH_NO_VALUE);
    } else {
        aRequest.stdout('Invalid object reference: ' + arg0);

        return aRequest.complete(TP.TSH_NO_VALUE);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.shell.TSH.addHelpTopic('dump',
    TP.tsh.dump.Type.getMethod('tshExecute'),
    'Dumps a detailed version of stdout to stdout.',
    ':dump <target>',
    'Coming Soon');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
