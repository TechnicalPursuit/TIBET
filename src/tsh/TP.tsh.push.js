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
 * @type {TP.tsh.push}
 */

//  ------------------------------------------------------------------------

TP.tag.ActionTag.defineSubtype('tsh:push');

TP.tsh.push.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.push.Type.defineMethod('tshExecute',
function(aRequest) {

    /**
     * @method tshExecute
     * @summary Turns on/off whether we are currently watching remote resources.
     * @param {TP.sig.Request} aRequest The request containing command input for
     *     the shell.
     * @returns {TP.sig.Request} The request.
     */

    var shell,

        localChangeList,

        arg0,
        url,

        saveRequest;

    shell = aRequest.at('cmdShell');

    //  If either one of the debugging flags is turned on, then echo the
    //  debugging information.
    if (shell.getArgument(aRequest, 'tsh:debug', null, false)) {
        return this.printDebug(aRequest, true, false);
    }

    if (shell.getArgument(aRequest, 'tsh:debugresolve', null, false)) {
        return this.printDebug(aRequest, true, true);
    }

    if (shell.getArgument(aRequest, 'tsh:all', null, false)) {

        //  Populate information on all URLs that we're going to push to not
        //  save prefixed XMLNS attributes.
        localChangeList = TP.uri.URI.getLocalChangeList();
        localChangeList.perform(
            function(locURIPair) {
                var req;

                req = locURIPair.last().constructRequest(
                                            TP.hc('method', TP.HTTP_PUT));

                //  Make sure to let the save request know that we're not
                //  interested in serializing 'xmlns:' attributes.
                req.atPut('serializationParams',
                            TP.hc('wantsPrefixedXMLNSAttrs', false,
                                    'lockStore', true));

                //  Do the deed.
                locURIPair.last().save(req);
            });

        //  Call the type method that push all outstanding local changes to the
        //  remote server.
        TP.uri.URI.processRemoteChangeList();
    } else {

        //  No arguments and no '--all' parameter means we dump usage.
        if (!shell.hasArguments(aRequest)) {
            return this.printUsage(aRequest);
        }

        arg0 = shell.getArgument(aRequest, 'ARG0');

        url = TP.uc(arg0);
        if (TP.isURI(url)) {

            saveRequest = url.constructRequest(TP.hc('method', TP.HTTP_PUT));

            //  Make sure to let the save request know that we're not interested
            //  in serializing 'xmlns:' attributes.
            saveRequest.atPut('serializationParams',
                                TP.hc('wantsPrefixedXMLNSAttrs', false,
                                        'lockStore', true));

            //  Do the deed.
            url.save(saveRequest);
        }
    }

    aRequest.complete(TP.TSH_NO_VALUE);

    return aRequest;
});

//  ------------------------------------------------------------------------

TP.shell.TSH.addHelpTopic('push',
    TP.tsh.push.Type.getMethod('tshExecute'),
    'Pushes pending changes in the running system to the remote file system.' +
        ' Requires TDS.',
    ':push [<target>] [--all]',
    'Coming Soon');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
