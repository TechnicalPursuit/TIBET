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
 * @type {TP.tsh.pull}
 */

//  ------------------------------------------------------------------------

TP.core.ActionTag.defineSubtype('tsh:pull');

TP.tsh.pull.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.pull.Type.defineMethod('tshExecute',
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

        shouldProcessValue,

        arg0,
        url;

    shell = aRequest.at('cmdShell');

    //  If either one of the debugging flags is turned on, then echo the
    //  debugging information.
    if (shell.getArgument(aRequest, 'tsh:debug', null, false)) {
        return this.printDebug(aRequest, true, false);
    }

    if (shell.getArgument(aRequest, 'tsh:debugresolve', null, false)) {
        return this.printDebug(aRequest, true, true);
    }

    //  We need to turn on 'uri.process_remote_changes' since the user is
    //  forcing it at this point. We capture the existing value first though.
    shouldProcessValue = TP.sys.cfg('uri.process_remote_changes');
    TP.sys.setcfg('uri.process_remote_changes', true);

    if (shell.getArgument(aRequest, 'tsh:all', null, false)) {

        //  Call the type method that processes all outstanding remote changes
        //  from all remotely changed URIs.
        TP.uri.URI.processRemoteChangeList();
    } else {

        //  No arguments and no '--all' parameter means we dump usage.
        if (!shell.hasArguments(aRequest)) {
            return this.printUsage(aRequest);
        }

        arg0 = shell.getArgument(aRequest, 'ARG0');

        url = TP.uc(arg0);
        if (TP.isURI(url)) {
            url.refreshFromRemoteResource();
        }
    }

    //  Put 'uri.process_remote_changes' cfg property back to its original value.
    TP.sys.setcfg('uri.process_remote_changes', shouldProcessValue);

    aRequest.complete(TP.TSH_NO_VALUE);

    return;
});

//  ------------------------------------------------------------------------

TP.shell.TSH.addHelpTopic('pull',
    TP.tsh.pull.Type.getMethod('tshExecute'),
    'Pulls pending remote file system changes into the running system.' +
        ' Requires TDS.',
    ':pull [<target>] [--all]',
    'Coming Soon');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
