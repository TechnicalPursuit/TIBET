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
     * @returns {TP.sig.Request|Number} The request or a TSH shell loop control
     *     constant which controls how the outer TSH processing loop should
     *     continue. Common values are TP.CONTINUE, TP.DESCEND, and TP.BREAK.
     */

    var shell,

        unlisted,

        profile,
        profileParts,

        promise,

        results,

        packageEntries,
        scriptEntries,

        packageOutputEntries,
        scriptOutputEntries,

        libSrcPath,

        shouldFix,

        newArgs,

        str,

        allOutputEntries,

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
        promise = TP.sys.getMissingPackagingInfo(profile);

        promise.then(
            function() {

                //  NB: These contain fully expanded paths
                packageEntries = results.at('packageEntries');
                scriptEntries = results.at('scriptEntries');

                //  We want to make all package and script paths that *start*
                //  with the '~lib_src' path be relative to '~lib_src', since
                //  they're going to be added to the application's 'alacarte'
                //  target, which already has a basedir of '~lib_src'.

                //  Compute the fully expanded path to '~lib_src'.
                libSrcPath = TP.uriExpandPath('~lib_src');

                //  Iterate over all of the package entries and make their
                //  scripts relative to the fully expanded '~lib_src' path *if
                //  they start with it*.
                packageOutputEntries = packageEntries.collect(
                    function(anEntry) {
                        var outEntry,
                            path;

                        outEntry = TP.ac('package',
                                            anEntry[TP.LOAD_INDEX],
                                            anEntry[TP.PACKAGING_REP]);

                        //  The path here was already expanded by the call that
                        //  produced these results.
                        path = anEntry[TP.PACKAGING_REP].split('@').first();

                        if (path.startsWith(libSrcPath)) {
                            outEntry.push(
                                    TP.uriRelativeToPath(path, libSrcPath));
                        } else {
                            outEntry.push(path);
                        }

                        return outEntry;
                    });

                //  Iterate over all of the script entries and make their
                //  scripts relative to the fully expanded '~lib_src' path *if
                //  they start with it*.
                scriptOutputEntries = scriptEntries.collect(
                    function(anEntry) {
                        var outEntry,
                            path;

                        outEntry = TP.ac('script',
                                            anEntry[TP.LOAD_INDEX],
                                            anEntry[TP.PACKAGING_REP]);

                        //  The path here was already expanded by the call that
                        //  produced these results.
                        path = anEntry[TP.PACKAGING_REP];

                        if (path.startsWith(libSrcPath)) {
                            outEntry.push(
                                    TP.uriRelativeToPath(path, libSrcPath));
                        } else {
                            outEntry.push(path);
                        }

                        return outEntry;
                    });

                //  If the user is asking us to fix this situation, then we
                //  invoke a remote command to actually patch these into the
                //  config matching the profile.
                shouldFix = shell.getArgument(aRequest, 'tsh:fix', null, false);

                //  TODO: This line should be removed when '--fix' capability is
                //  available in the TDS version of the 'package' command.
                shouldFix = false;

                if (shouldFix) {

                    //  Iterate over all of the paths and escape spaces, since
                    //  we're going to join them all together on a space.
                    results = results.collect(
                                function(aPath) {
                                    return aPath.replace(/ /g, '\\ ');
                                });

                    //  Join all of the paths together with spaces.
                    results = results.join(' ');

                    //  Build a new set of arguments, leaving out the 'unlisted'
                    //  and 'fix' flags and adding the 'add' flag and the paths
                    //  to be added.
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
                                        'output', 'Profile \'' +
                                                    profile +
                                                    '\' updated.',
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
                    //  Iterate over all of the paths and compose a chunk of
                    //  markup that could be copied and pasted into a cfg file.
                    str = '<ul>';

                    //  Create an Array of all of the output entries by
                    //  concatenating all of the script output entries onto the
                    //  package output entries. Then sort that by the load
                    //  index. This will make sure that scripts or packages that
                    //  require prerequisites to be loaded before they are are
                    //  generated that way.
                    allOutputEntries = packageOutputEntries.concat(
                                                        scriptOutputEntries);
                    allOutputEntries.sort(function(entryA, entryB) {
                        return entryA.at(1) - entryB.at(1);
                    });

                    //  Write those entries properly based on their type.
                    allOutputEntries.forEach(
                        function(anEntry) {
                            var entryType,

                                path,
                                configParts;

                            entryType = anEntry.at(0);

                            //  The path is the 4th item, whether it's a package
                            //  or script.
                            path = TP.uriInTIBETFormat(anEntry.at(3));

                            if (entryType === 'package') {
                                configParts = anEntry.at(2).split('@');

                                str += '<li>' +
                                        '&lt;package src="' +
                                        path +
                                        '" config="' +
                                            configParts.last() +
                                        '"/&gt;' +
                                        '</li>';
                            } else if (entryType === 'script') {
                                str += '<li>' +
                                        '&lt;script src="' + path + '"/&gt;' +
                                        '</li>';
                            }
                        });

                    str += '</ul>';

                    //  Make sure to mark the request 'as is' since we're
                    //  outputting  markup that we don't want processed.
                    aRequest.atPut('cmdAsIs', true);
                    aRequest.complete(str);
                }
        });
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

        TP.boot.$listPackageAssets(uri, profileParts.last()).then(
            function(finalResults) {
                aRequest.complete(finalResults);
            });
    }

    return aRequest;
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
