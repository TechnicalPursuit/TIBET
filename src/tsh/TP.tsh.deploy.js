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
 * @type {TP.tsh.deploy}
 * @summary A subtype of TP.tag.ActionTag used to trigger a deploy.
 */

//  ------------------------------------------------------------------------

TP.tag.ActionTag.defineSubtype('tsh:deploy');

TP.tsh.deploy.addTraits(TP.tsh.Element);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tsh.deploy.Type.defineMethod('tshExecute',
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

    TP.signal(null, 'RemoteConsoleCommand',
        TP.hc('originalRequest', aRequest,
            'timeout', 60000,
            TP.ONSUCCESS, function(aResponse) {
                //  empty
            },
            TP.ONFAIL, function(aResponse) {
                //  empty
            }
        ));

    aRequest.complete('delegated to :cli');

    return;
});

//  ------------------------------------------------------------------------

TP.shell.TSH.addHelpTopic('deploy',
    TP.tsh.deploy.Type.getMethod('tshExecute'),
    'Deploys a release of a TIBET application.',
    ':deploy',
    'See CLI documentation');

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
