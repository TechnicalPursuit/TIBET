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
 * @type {TP.sherpa.thumbnail}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('thumbnail');

//  ------------------------------------------------------------------------

TP.sherpa.thumbnail.Inst.defineHandler('ShowAllScreens',
function(aSignal) {

    /**
     * @method handleShowAllScreens
     * @summary Handles when the user wants to show all the world's screens.
     * @param {TP.sig.ShowAllScreens} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.thumbnail} The receiver.
     */

    var world;

    world = TP.byId('SherpaWorld', TP.sys.getUIRoot());
    world.setAttribute('mode', 'thumbnail');

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
