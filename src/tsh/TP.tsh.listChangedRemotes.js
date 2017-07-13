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
 * @type {TP.tsh.listChangedRemotes}
 * @summary A subtype of TP.core.ActionTag that knows how to
 *     conditionally process its child actions based on a binding expression.
 */

//  ------------------------------------------------------------------------

TP.core.ActionTag.defineSubtype('tsh:listChangedRemotes');

TP.tsh.listChangedRemotes.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.listChangedRemotes.Type.defineMethod('tshExecute',
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
        resourceHash;

    shell = aRequest.at('cmdShell');

    //  If either one of the debugging flags is turned on, then echo the
    //  debugging information.
    if (shell.getArgument(aRequest, 'tsh:debug', null, false)) {
        return this.printDebug(aRequest, true, false);
    }

    if (shell.getArgument(aRequest, 'tsh:debugresolve', null, false)) {
        return this.printDebug(aRequest, true, true);
    }

    resourceHash = TP.core.URI.get('remoteChangeList');

    //  Set cmdAsIs to false to get fancy JSON formatting.

    //  NB: We do the TP.json2js(resourceHash.asJSONSource()) shuffle because
    //  resourceHash has circular references that freak out the JSON parser.
    aRequest.stdout(TP.jsoncc(TP.json2js(resourceHash.asJSONSource())),
                    TP.hc('cmdAsIs', false));

    return;
});

//  ------------------------------------------------------------------------

TP.core.TSH.addHelpTopic('listChangedRemotes',
    TP.tsh.listChangedRemotes.Type.getMethod('tshExecute'),
    'Displays a list of pending remote resource changes. Requires TDS.',
    ':listChangedRemotes',
    '');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
