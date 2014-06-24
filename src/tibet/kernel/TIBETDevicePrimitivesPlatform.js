//  ========================================================================
/*
NAME:   TIBETDevicePrimitivesPlatform.js
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
Platform-specific functionality related to mouse and keyboard.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('eventNormalize',
TP.hc(
    'test',
    TP.boot.getBrowserUI,
    'gecko',
    function(anEvent, currentTarget) {

        /**
         * @name eventNormalize
         * @synopsis Converts the supplied object into a 'W3C plus' event
         *     object, with the attendant W3C-compliant properties, etc. along
         *     with some additional properties, such as 'offsetX / offset Y' and
         *     'wheelDelta' for mousewheel events that are not currently defined
         *     by the W3C.
         * @param {Event} anEvent The event to convert into a 'W3C plus'
         *     compliant event object.
         * @param {HTMLElement} currentTarget The object to make the
         *     currentTarget on the Event object. If absent or null,
         *     currentTarget on the Event object defaults to the srcElement. Not
         *     used in this version of the code since Gecko properly captures
         *     the current target.
         * @raises TP.sig.InvalidEvent
         * @returns {Event} The supplied event object normalized into a 'W3C
         *     plus' Event object.
         * @todo
         */

        var wheelVal,
            deltaX,
            deltaY;

        if (!TP.isEvent(anEvent)) {
            return TP.raise(this, 'TP.sig.InvalidEvent', arguments);
        }

        //  If the Event object has already been normalized, then just return.
        if (anEvent.$normalized) {
            return anEvent;
        }

        //  Make sure to set $normalized here because other calls in this
        //  method may recurse and use this call.
        anEvent.$normalized = true;

        //  The event object supplied might be a 'copy' with certain special
        //  slots defined, but not their 'built-in' equivalents, which is
        //  why we sometimes go after both properties (the '$$' version and
        //  the regular version) here.

        //  Keycode is so messed up, that we always rely on the '$$'
        //  version - make sure its copied here.
        //  In case keyCode === 0, check for charCode.
        anEvent.$$keyCode = anEvent.keyCode || anEvent.charCode;

        if ((anEvent.$$type === 'DOMMouseScroll') ||
            (anEvent.type === 'DOMMouseScroll')) {
            wheelVal = anEvent.detail;

            //  Sometimes Mozilla will supply a really large number - we
            //  clamp the value
            if (wheelVal > 100) {
                wheelVal = 3;
            } else if (wheelVal < -100) {
                wheelVal = -3;
            }

            if (anEvent.axis === anEvent.HORIZONTAL_AXIS) {
                deltaX = wheelVal;
                deltaY = 0;
            } else {
                deltaX = 0;
                deltaY = wheelVal;
            }

            anEvent.$$wheelDelta = wheelVal;
            anEvent.$$wheelDeltaX = deltaX;
            anEvent.$$wheelDeltaY = deltaY;
        }

        //  Set a few of our convenience slots
        anEvent.$$view = anEvent.view;
        anEvent.$$timestamp = anEvent.timeStamp;

        return anEvent;
    },
    'trident',
    function(anEvent, currentTarget) {

        /**
         * @name eventNormalize
         * @synopsis Converts the supplied object into a 'W3C plus' event
         *     object, with the attendant W3C-compliant properties, etc. along
         *     with some additional properties, such as 'offsetX / offset Y' and
         *     'wheelDelta' for mousewheel events that are not currently defined
         *     by the W3C.
         * @param {Event} anEvent The event to convert into a 'W3C plus'
         *     compliant event object.
         * @param {HTMLElement} currentTarget The object to make the
         *     currentTarget on the Event object. If absent or null,
         *     currentTarget on the Event object defaults to the srcElement. Not
         *     used in this version of the code since Gecko properly captures
         *     the current target.
         * @raises TP.sig.InvalidEvent
         * @returns {Event} The supplied event object normalized into a 'W3C
         *     plus' Event object.
         * @todo
         */

        var wheelVal,
            deltaX,
            deltaY;

        //  If the Event object has already been normalized, then just
        //  return.
        if (anEvent.$normalized) {
            return anEvent;
        }

        if (!TP.isEvent(anEvent)) {
            return TP.raise(this, 'TP.sig.InvalidEvent', arguments);
        }

        //  Make sure to set $normalized here because other calls in this
        //  method may recurse and use this call.
        anEvent.$normalized = true;

        //  The event object supplied might be a 'copy' with certain special
        //  slots defined, but not their 'built-in' equivalents, which is
        //  why we sometimes go after both properties (the '$$' version and
        //  the regular version) here.

        //  Keycode is so messed up, that we always rely on the '$$'
        //  version - make sure its copied here.
        anEvent.$$keyCode = anEvent.keyCode;

        if ((anEvent.$$type === 'mousewheel') ||
            (anEvent.type === 'mousewheel')) {
            wheelVal = -anEvent.wheelDelta / 40;

            deltaX = 0;
            deltaY = wheelVal;

            anEvent.$$wheelDelta = wheelVal;
            anEvent.$$wheelDeltaX = deltaX;
            anEvent.$$wheelDeltaY = deltaY;
        }

        //  Set a few of our convenience slots (note that for IE, the
        //  regular 'timeStamp' slot is set in the hook file's handler
        //  wrapper Function).
        anEvent.$$view = anEvent.view;
        anEvent.$$timestamp = anEvent.timeStamp;

        return anEvent;
    },
    'webkit',
    function(anEvent, currentTarget) {

        /**
         * @name eventNormalize
         * @synopsis Converts the supplied object into a 'W3C plus' event
         *     object, with the attendant W3C-compliant properties, etc. along
         *     with some additional properties, such as 'offsetX / offset Y' and
         *     'wheelDelta' for mousewheel events that are not currently defined
         *     by the W3C.
         * @param {Event} anEvent The event to convert into a 'W3C plus'
         *     compliant event object.
         * @param {HTMLElement} currentTarget The object to make the
         *     currentTarget on the Event object. If absent or null,
         *     currentTarget on the Event object defaults to the srcElement. Not
         *     used in this version of the code since Gecko properly captures
         *     the current target.
         * @raises TP.sig.InvalidEvent
         * @returns {Event} The supplied event object normalized into a 'W3C
         *     plus' Event object.
         * @todo
         */

        var wheelVal,
            deltaX,
            deltaY;

        if (!TP.isEvent(anEvent)) {
            return TP.raise(this, 'TP.sig.InvalidEvent', arguments);
        }

        //  If the Event object has already been normalized, then just
        //  return.
        if (anEvent.$normalized) {
            return anEvent;
        }

        //  Make sure to set $normalized here because other calls in this
        //  method may recurse and use this call.
        anEvent.$normalized = true;

        //  The event object supplied might be a 'copy' with certain special
        //  slots defined, but not their 'built-in' equivalents, which is
        //  why we sometimes go after both properties (the '$$' version and
        //  the regular version) here.

        //  Keycode is so messed up, that we always rely on the '$$'
        //  version - make sure its copied here.
        anEvent.$$keyCode = anEvent.keyCode;

        if ((anEvent.$$type === 'mousewheel') ||
            (anEvent.type === 'mousewheel')) {
            wheelVal = -anEvent.wheelDelta / 40;

            deltaX = -anEvent.wheelDeltaX / 40;
            deltaY = -anEvent.wheelDeltaY / 40;

            anEvent.$$wheelDelta = wheelVal;
            anEvent.$$wheelDeltaX = deltaX;
            anEvent.$$wheelDeltaY = deltaY;
        }

        //  Set a few of our convenience slots
        anEvent.$$view = anEvent.view;
        anEvent.$$timestamp = anEvent.timeStamp;

        return anEvent;
    }
));

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
