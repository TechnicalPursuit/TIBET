//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 * @type {TP.sherpa.changes}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('changes');

//  ------------------------------------------------------------------------

TP.sherpa.changes.Inst.defineHandler('ShowClientChanges',
function(aSignal) {

    /**
     * @method handleShowClientChanges
     * @summary Handles notifications of when the user wants to show the client
     *     URIs that have changed.
     * @param {TP.sig.ShowClientChanges} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.changes} The receiver.
     */

    TP.uc('urn:tibet:current_changes_tab#tibet(selection)').setResource(
                                                                    'client');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.changes.Inst.defineHandler('ShowServerChanges',
function(aSignal) {

    /**
     * @method handleShowServerChanges
     * @summary Handles notifications of when the user wants to show the server
     *     URIs that have changed.
     * @param {TP.sig.ShowServerChanges} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.changes} The receiver.
     */

    TP.uc('urn:tibet:current_changes_tab#tibet(selection)').setResource(
                                                                    'server');

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
