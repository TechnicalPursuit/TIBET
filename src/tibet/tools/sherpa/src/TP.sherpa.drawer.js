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
 * @type {TP.sherpa.drawer}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('drawer');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.drawer.Inst.defineHandler('Toggle',
function(aSignal) {

    var sigOriginTPElem,
        originID,

        isClosed;

    sigOriginTPElem = TP.bySystemId(aSignal.getOrigin());

    originID = sigOriginTPElem.getAttribute('id');
    isClosed = TP.bc(sigOriginTPElem.getAttribute('closed'));

    if (isClosed) {
        sigOriginTPElem.setAttribute('closed', false);
        TP.byId('background', this.getDocument()).addClass('edge-' + originID + '-open');
    } else {
        sigOriginTPElem.setAttribute('closed', true);
        TP.byId('background', this.getDocument()).removeClass('edge-' + originID + '-open');
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
