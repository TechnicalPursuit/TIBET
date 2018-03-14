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
 * @type {TP.tsh.screen}
 * @summary A subtype of TP.core.ActionTag that knows how to
 *     conditionally process its child actions based on a binding expression.
 */

//  ------------------------------------------------------------------------

TP.core.ActionTag.defineSubtype('tsh:screen');

TP.tsh.screen.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.screen.Type.defineMethod('tshExecute',
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

        screenNum,
        screens;

    shell = aRequest.at('cmdShell');

    //  If either one of the debugging flags is turned on, then echo the
    //  debugging information.
    if (shell.getArgument(aRequest, 'tsh:debug', null, false)) {
        return this.printDebug(aRequest, true, false);
    }

    if (shell.getArgument(aRequest, 'tsh:debugresolve', null, false)) {
        return this.printDebug(aRequest, true, true);
    }

    //  This command only works in the context of a loaded and enabled Sherpa
    if (!TP.sys.hasFeature('sherpa')) {
        aRequest.stdout(
                'The :screen command requires a loaded and enabled Sherpa');
        aRequest.complete(TP.TSH_NO_VALUE);

        return;
    }

    //  No arguments means we dump usage.
    if (!shell.hasArguments(aRequest)) {
        return this.printUsage(aRequest);
    }

    arg0 = shell.getArgument(aRequest, 'ARG0');

    //  :screen 3

    screenNum = TP.nc(arg0);
    if (TP.isNumber(screenNum)) {

        screens = TP.byId('SherpaWorld', TP.win('UIROOT')).get('screens');
        if (screenNum < 0 || screenNum > screens.getSize() - 1) {
            aRequest.stdout('screen index is invalid: ' + screenNum);
            aRequest.complete(TP.TSH_NO_VALUE);
        }

        //  Fire a 'ToggleScreen' signal, supplying the screen index to switch
        //  to.
        TP.signal(null,
                    'ToggleScreen',
                    TP.hc('screenIndex', screenNum));

        aRequest.stdout('world switched to screen ' + screenNum);
        aRequest.complete(TP.TSH_NO_VALUE);
    } else {
        aRequest.stdout('screen switching requires numeric index');
        aRequest.complete(TP.TSH_NO_VALUE);

        return;
    }

    aRequest.complete(TP.TSH_NO_VALUE);

    return;
});

//  ------------------------------------------------------------------------

TP.shell.TSH.addHelpTopic('screen',
    TP.tsh.screen.Type.getMethod('tshExecute'),
    'Sets the canvas being viewed to a screen.',
    ':screen <screen_number>',
    'Coming Soon');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
