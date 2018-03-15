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
 * @type {TP.tsh.package}
 * @summary A subtype of TP.tag.ActionTag that knows how to
 *     conditionally process its child actions based on a binding expression.
 */

//  ------------------------------------------------------------------------

TP.tag.ActionTag.defineSubtype('tsh:package');

TP.tsh.package.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.package.Type.defineMethod('tshExecute',
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

        unlisted,

        profile,
        profileParts,

        results,
        packagePaths,
        scriptPaths,

        shouldFix,

        newArgs,

        str,

        uri;

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

    //  Are we looking for unlisted paths?
    unlisted = shell.getArgument(aRequest, 'tsh:unlisted', null, false);

    //  NB: We don't default the value here, because we default it to different
    //  values depending on other flags.
    profile = shell.getArgument(aRequest, 'tsh:profile', null, false);

    if (TP.isString(profile)) {
        profile = profile.unquoted();
    } else if (unlisted) {
        profile = TP.sys.cfg('project.packaging.profile', 'main@base');
    } else {
        profile = TP.sys.cfg('boot.profile', 'main@base');
    }

    //  If we're looking for unlisted paths, then we have to ask the system for
    //  script paths that belong to methods that were actually invoked.
    if (unlisted) {
        results = TP.sys.getMissingPackagingInfo(profile);

        packagePaths = results.at('packagePaths');
        scriptPaths = results.at('scriptPaths');

        //  If the user is asking us to fix this situation, then we invoke a
        //  remote command to actually patch these into the config matching the
        //  profile.
        shouldFix = shell.getArgument(aRequest, 'tsh:fix', null, false);

        //  TODO: This line should be removed when '--fix' capability is
        //  available in the TDS version of the 'package' command.
        shouldFix = false;

        if (shouldFix) {

            //  Iterate over all of the paths and escape spaces, since we're
            //  going to join them all together on a space.
            results = results.collect(
                        function(aPath) {
                            return aPath.replace(/ /g, '\\ ');
                        });

            //  Join all of the paths together with spaces.
            results = results.join(' ');

            //  Build a new set of arguments, leaving out the 'unlisted' and
            //  'fix' flags and adding the 'add' flag and the paths to be added
            newArgs = TP.hc(
                        'ARGV', TP.ac(),
                        'tsh:profile', TP.ac(profile, profile),
                        'tsh:add', TP.ac(results, results));

            aRequest.set('ARGUMENTS', newArgs);

            TP.signal(null, 'RemoteConsoleCommand',
                TP.hc(
                    'originalRequest', aRequest,
                    'timeout', 60000,
                    TP.ONSUCCESS, function(aResponse) {

                        var successOutputReq;

                        successOutputReq =
                            TP.sig.UserOutputRequest.construct(
                                TP.hc(
                                'output', 'Profile \'' + profile + '\' updated.',
                                'async', true,
                                'cmdAsIs', true));

                        successOutputReq.fire(shell);
                    },
                    TP.ONFAIL, function(aResponse) {
                        //  empty
                    }
                ));

            aRequest.complete('delegated to :cli');
        } else {
            //  Iterate over all of the paths and compose a chunk of markup that
            //  could be copied and pasted into a cfg file.
            str = '<ul>';
            packagePaths.forEach(
                function(aPath) {
                    var pathParts;

                    pathParts = aPath.split('@');

                    str += '<li>' +
                            '&lt;package src="' + TP.uriInTIBETFormat(pathParts.first()) + '" config="' + pathParts.last() + '"/&gt;' +
                            '</li>';
                });
            scriptPaths.forEach(
                function(aPath) {
                    var path;

                    path = TP.uriInTIBETFormat(aPath);
                    str += '<li>' +
                            '&lt;script src="' + path + '"/&gt;' +
                            '</li>';
                });
            str += '</ul>';

            //  Make sure to mark the request 'as is' since we're outputting
            //  markup that we don't want processed.
            aRequest.atPut('cmdAsIs', true);
            aRequest.complete(str);
        }
    } else {

        //  Otherwise, we just list the package assets

        profileParts = profile.split('@');

        uri = TP.uriExpandPath(profileParts.first());
        if (!TP.isURIString(uri)) {
            uri = TP.uriJoinPaths('~app_cfg', uri);
        }

        if (TP.isEmpty(TP.uriExtension(uri))) {
            uri += '.xml';
        }

        results = TP.boot.$listPackageAssets(uri, profileParts.last());

        aRequest.complete(results);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.shell.TSH.addHelpTopic('package',
    TP.tsh.package.Type.getMethod('tshExecute'),
    'List package assets either as asset paths or nodes.',
    //  TODO: This line should be uncommented when '--fix' capability is
    //  available in the TDS version of the 'package' command.
    //  ':package [--profile profilename] [--unlisted] [--fix]',
    ':package [--profile profilename] [--unlisted]',
    'Coming Soon');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
