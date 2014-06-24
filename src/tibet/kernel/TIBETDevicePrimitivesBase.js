//  ========================================================================
/*
NAME:   TIBETDevicePrimitivesBase.js
AUTH:   Scott Shattuck (ss), William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.5, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.5
        and You may not copy or use this file in either source code or
        executable form, except in compliance with the terms and
        conditions of the RPL.

        You may obtain a copy of both the TPL and RPL (the "Licenses")
        from Technical Pursuit Inc. at http://www.technicalpursuit.com.

        All software distributed under the Licenses is provided strictly
        on an "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER
        EXPRESS OR IMPLIED, AND TECHNICAL PURSUIT INC. HEREBY DISCLAIMS
        ALL SUCH WARRANTIES, INCLUDING WITHOUT LIMITATION, ANY
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        QUIET ENJOYMENT, OR NON-INFRINGEMENT. See Licenses for specific
        language governing rights and limitations under the Licenses.

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
        return TP.raise(this, 'TP.sig.InvalidEvent', arguments);
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
        return TP.raise(this, 'TP.sig.InvalidEvent', arguments);
    }

    anEvent.stopPropagation();

    return anEvent;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
