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

        isClosed;

    sigOriginTPElem = TP.bySystemId(aSignal.getOrigin());

    isClosed = TP.bc(sigOriginTPElem.getAttribute('closed'));

    if (isClosed) {
        sigOriginTPElem.setAttribute('closed', false);
    } else {
        sigOriginTPElem.setAttribute('closed', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.drawer.Inst.defineMethod('setAttrClosed',
function(beClosed) {

    /**
     * @method setAttrClosed
     * @summary
     * @returns {TP.sherpa.hud} The receiver.
     */

    var wasClosed,

        hudTPElem,

        originID,
        drawerElement,
        drawerFinishedFunc;

    wasClosed = TP.bc(this.getAttribute('closed'));

    if (wasClosed === beClosed) {
        //  Exit here - no need to call up to our supertype to toggle the
        //  attribute, since it already has the value we desire.
        return this;
    }

    hudTPElem = TP.byId('SherpaHUD', this.getNativeWindow());

    originID = this.getAttribute('id');
    drawerElement = this.getNativeNode();

    (drawerFinishedFunc = function(aSignal) {

        drawerFinishedFunc.ignore(
            drawerElement, 'TP.sig.DOMTransitionEnd');

        hudTPElem.signal('DrawerClosedDidChange',
                            TP.hc('drawerOriginID', originID),
                            TP.OBSERVER_FIRING);

    }).observe(drawerElement, 'TP.sig.DOMTransitionEnd');

    hudTPElem.signal('DrawerClosedWillChange',
                        TP.hc('drawerOriginID', originID),
                        TP.OBSERVER_FIRING);

    if (TP.isTrue(beClosed)) {
        TP.byId('background',
                this.getDocument()).removeClass('edge-' + originID + '-open');
    } else {
        TP.byId('background',
                this.getDocument()).addClass('edge-' + originID + '-open');
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
