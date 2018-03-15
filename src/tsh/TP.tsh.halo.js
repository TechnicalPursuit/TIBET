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
 * @type {TP.tsh.halo}
 */

//  ------------------------------------------------------------------------

TP.tag.ActionTag.defineSubtype('tsh:halo');

TP.tsh.halo.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.halo.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Turns on/off whether we are currently watching remote resources.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {Object} A value which controls how the outer TSH processing
     *     loop should continue. Common values are TP.CONTINUE, TP.DESCEND, and
     *     TP.BREAK.
     */

    var shell,

        arg0,
        halo;

    shell = aRequest.at('cmdShell');

    //  If either one of the debugging flags is turned on, then echo the
    //  debugging information.
    if (shell.getArgument(aRequest, 'tsh:debug', null, false)) {
        return this.printDebug(aRequest, true, false);
    }

    if (shell.getArgument(aRequest, 'tsh:debugresolve', null, false)) {
        return this.printDebug(aRequest, true, true);
    }

    //  No arguments and no '--all' parameter means we dump usage.
    if (!shell.hasArguments(aRequest)) {
        return this.printUsage(aRequest);
    }

    arg0 = shell.getArgument(aRequest, 'ARG0');

    if (TP.isValid(arg0)) {

        if (TP.isNode(arg0)) {
            arg0 = TP.wrap(arg0);
        } else if (TP.isString(arg0)) {
            //  Note the lookup on the current UICANVAS.
            arg0 = TP.byId(arg0);
        }

        if (TP.isKindOf(arg0, TP.dom.Node)) {
            halo = TP.byId('SherpaHalo', TP.win('UIROOT'));
            if (TP.isValid(halo)) {

                halo.blur();
                halo.focusOn(arg0);
            }
        }
    }

    aRequest.complete(TP.TSH_NO_VALUE);

    return;
});

//  ------------------------------------------------------------------------

TP.shell.TSH.addHelpTopic('halo',
    TP.tsh.halo.Type.getMethod('tshExecute'),
    'Focuses the halo on the node resolved by the supplied argument',
    ':halo <target>',
    'Coming Soon');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
