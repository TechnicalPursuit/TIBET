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
 * @type {TP.tsh.toggleRemoteWatch}
 */

//  ------------------------------------------------------------------------

TP.core.ActionTag.defineSubtype('tsh:toggleRemoteWatch');

TP.tsh.toggleRemoteWatch.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.toggleRemoteWatch.Type.defineMethod('tshExecute',
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
        currentlyWatching,
        includes,
        excludes;

    shell = aRequest.at('cmdShell');

    //  If either one of the debugging flags is turned on, then echo the
    //  debugging information.
    if (shell.getArgument(aRequest, 'tsh:debug', null, false)) {
        return this.printDebug(aRequest, true, false);
    }

    if (shell.getArgument(aRequest, 'tsh:debugresolve', null, false)) {
        return this.printDebug(aRequest, true, true);
    }

    currentlyWatching = TP.sys.cfg('uri.watch_remote_changes');

    //  Fetch and normalize any includes so all consumers see consistent value.
    includes = TP.sys.cfg('tds.watch.include');
    includes.convert(
        function(aLocation) {
            return TP.uriInTIBETFormat(TP.uriExpandPath(aLocation));
        });

    //  Fetch and normalize any excludes so all consumers see consistent value.
    excludes = TP.sys.cfg('tds.watch.exclude');
    excludes.convert(
        function(aLocation) {
            return TP.uriInTIBETFormat(TP.uriExpandPath(aLocation));
        });

    //  The actual 'toggle' happens here.
    if (TP.isTrue(currentlyWatching)) {
        TP.core.RemoteURLWatchHandler.deactivateWatchers();
    } else {
        TP.core.RemoteURLWatchHandler.activateWatchers();
    }

    //  Refetch value since activate/deactivate will potentially toggle it.
    currentlyWatching = TP.sys.cfg('uri.watch_remote_changes');
    if (TP.isTrue(currentlyWatching)) {
        aRequest.stdout('Remote resource change monitoring activated');
        if (TP.notEmpty(includes)) {
            aRequest.stdout('including: ');
            //  Set cmdAsIs to false to get fancy JSON formatting.
            aRequest.stdout(TP.jsoncc(includes), TP.hc('cmdAsIs', false));
        }
        if (TP.notEmpty(excludes)) {
            aRequest.stdout('excluding: ');
            //  Set cmdAsIs to false to get fancy JSON formatting.
            aRequest.stdout(TP.jsoncc(excludes), TP.hc('cmdAsIs', false));
        }
    } else {
        aRequest.stdout('Remote resource change monitoring deactivated');
    }

    aRequest.stdout('Remote resource change processing is ' +
        (TP.sys.cfg('uri.process_remote_changes') === true ? 'on' : 'off'));
    aRequest.stdout('use `TP.sys.setcfg(\'uri.process_remote_changes\',' +
        '[true|false])` to change.');

    aRequest.complete(TP.TSH_NO_VALUE);

    return;
});

//  ------------------------------------------------------------------------

TP.core.TSH.addHelpTopic('toggleRemoteWatch',
    TP.tsh.toggleRemoteWatch.Type.getMethod('tshExecute'),
    'Toggles whether to watch remote resource changes. Requires TDS.',
    ':toggleRemoteWatch',
    'Coming Soon');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
