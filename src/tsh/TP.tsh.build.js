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
 * @type {TP.tsh.build}
 * @summary A subtype of TP.tag.ActionTag used to trigger a build.
 */

//  ------------------------------------------------------------------------

TP.tag.ActionTag.defineSubtype('tsh:build');

TP.tsh.build.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.build.Type.defineMethod('tshExecute',
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

    var shell;

    shell = aRequest.at('cmdShell');

    TP.signal(null, 'RemoteConsoleCommand',
        TP.hc(
            'originalRequest', aRequest,
            'timeout', 60000,
            TP.ONSUCCESS, function(aResponse) {

                var linkOutputReq,
                    locStr;

                //  Grab the location and trim off any trailing '/'.

                locStr = TP.uc('~app').getLocation();
                if (locStr.endsWith('/')) {
                    locStr = locStr.slice(0, -1);
                }

                //  Construct a UserOutputRequest, with our location wrapped in
                //  an anchor targeting a blank page.
                linkOutputReq =
                    TP.sig.UserOutputRequest.construct(
                        TP.hc(
                        'output',
                            'Click to launch your app: ' +
                            '<a href="' + locStr + '" target="_blank">' +
                            locStr +
                            '</a>',
                        'async', true,
                        'cmdAsIs', true));

                linkOutputReq.fire(shell);
            },
            TP.ONFAIL, function(aResponse) {
                //  empty
            }
        ));

    aRequest.complete('delegated to :cli');

    return aRequest;
});

//  ------------------------------------------------------------------------

TP.shell.TSH.addHelpTopic('build',
    TP.tsh.build.Type.getMethod('tshExecute'),
    'Builds a release of a TIBET application.',
    ':build',
    'See CLI documentation');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
