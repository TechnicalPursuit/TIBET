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
 * @type {TP.tsh.types}
 * @summary A subtype of TP.tag.ActionTag that knows how to
 *     conditionally process its child actions based on a binding expression.
 */

//  ------------------------------------------------------------------------

TP.tag.ActionTag.defineSubtype('tsh:types');

TP.tsh.types.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.types.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Runs the receiver, effectively invoking its action.
     * @description This command returns an array of all of the types in the
     *     system. This will include native types if the 'includenative' flag is
     *     supplied.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue. Common values are TP.CONTINUE, TP.DESCEND, and
     *     TP.BREAK.
     */

    var shell,

        includeNatives,
        typesKeys;

    shell = aRequest.at('cmdShell');

    //  If either one of the debugging flags is turned on, then echo the
    //  debugging information.
    if (shell.getArgument(aRequest, 'tsh:debug', null, false)) {
        return this.printDebug(aRequest, true, false);
    }

    if (shell.getArgument(aRequest, 'tsh:debugresolve', null, false)) {
        return this.printDebug(aRequest, true, true);
    }

    if (TP.notValid(aRequest.at('cmdNode'))) {
        return aRequest.fail();
    }

    typesKeys = TP.sys.getCustomTypes().getKeys();

    includeNatives = shell.getArgument(aRequest, 'tsh:includenative');
    if (TP.isValid(includeNatives) && TP.isTrue(TP.bc(includeNatives))) {
        typesKeys.addAll(TP.sys.getNativeTypes().getKeys());
    }

    if (TP.notEmpty(typesKeys)) {
        aRequest.stdout(typesKeys.sort());
    }

    aRequest.complete(TP.TSH_NO_VALUE);

    return;
});

//  ------------------------------------------------------------------------

TP.shell.TSH.addHelpTopic('types',
    TP.tsh.types.Type.getMethod('tshExecute'),
    'Outputs a list of available system types.',
    ':types',
    'Coming Soon');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
