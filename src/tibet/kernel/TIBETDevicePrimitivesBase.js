//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/*
Common mouse and keyboard functions.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('eventPreventDefault',
function(anEvent) {

    /**
     * @name eventPreventDefault
     * @synopsis Prevents the event's default action from occurring.
     * @param {Event} anEvent The native event object.
     * @returns {Event} The native event object.
     * @todo
     */

    if (!TP.isEvent(anEvent)) {
        return TP.raise(this, 'TP.sig.InvalidEvent');
    }

    anEvent.preventDefault();

    return anEvent;
});

//  ------------------------------------------------------------------------

TP.definePrimitive('eventStopPropagation',
function(anEvent) {

    /**
     * @name eventStopPropagation
     * @synopsis Stop an event from propagating any further.
     * @param {Event} anEvent The native event object.
     * @returns {Event} The native event object.
     */

    if (!TP.isEvent(anEvent)) {
        return TP.raise(this, 'TP.sig.InvalidEvent');
    }

    anEvent.stopPropagation();

    return anEvent;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
