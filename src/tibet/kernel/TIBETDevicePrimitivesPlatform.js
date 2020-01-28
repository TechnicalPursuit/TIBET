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
Platform-specific functionality related to mouse and keyboard.
*/

//  ------------------------------------------------------------------------

TP.definePrimitive('eventNormalize',
TP.hc(
    'test',
    TP.sys.getBrowserUI,
    'gecko',
    function(anEvent, currentTarget) {

        /**
         * @method eventNormalize
         * @summary Converts the supplied object into a 'W3C plus' event
         *     object, with the attendant W3C-compliant properties, etc. along
         *     with some additional properties, such as 'offsetX / offset Y' and
         *     'wheelDelta' for mousewheel events that are not currently defined
         *     by the W3C.
         * @param {Event} anEvent The event to convert into a 'W3C plus'
         *     compliant event object.
         * @param {HTMLElement} currentTarget The object to make the
         *     currentTarget on the Event object. If absent or null,
         *     currentTarget on the Event object defaults to the srcElement.
         * @exception TP.sig.InvalidEvent
         * @returns {Event} The supplied event object normalized into a 'W3C
         *     plus' Event object.
         */

        var wheelVal,
            deltaX,
            deltaY;

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

        if (anEvent.$$type === 'DOMMouseScroll' ||
            anEvent.type === 'DOMMouseScroll') {
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
        anEvent.$$view = TP.$eventGetNormalizedView(anEvent, currentTarget);
        anEvent.$$timestamp = anEvent.timeStamp;

        return anEvent;
    },
    'webkit',
    function(anEvent, currentTarget) {

        /**
         * @method eventNormalize
         * @summary Converts the supplied object into a 'W3C plus' event
         *     object, with the attendant W3C-compliant properties, etc. along
         *     with some additional properties, such as 'offsetX / offset Y' and
         *     'wheelDelta' for mousewheel events that are not currently defined
         *     by the W3C.
         * @param {Event} anEvent The event to convert into a 'W3C plus'
         *     compliant event object.
         * @param {HTMLElement} currentTarget The object to make the
         *     currentTarget on the Event object. If absent or null,
         *     currentTarget on the Event object defaults to the srcElement.
         * @exception TP.sig.InvalidEvent
         * @returns {Event} The supplied event object normalized into a 'W3C
         *     plus' Event object.
         */

        var wheelVal,
            deltaX,
            deltaY;

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

        if (anEvent.$$type === 'mousewheel' ||
            anEvent.type === 'mousewheel') {
            wheelVal = -anEvent.wheelDelta / 40;

            deltaX = -anEvent.wheelDeltaX / 40;
            deltaY = -anEvent.wheelDeltaY / 40;

            anEvent.$$wheelDelta = wheelVal;
            anEvent.$$wheelDeltaX = deltaX;
            anEvent.$$wheelDeltaY = deltaY;
        }

        //  Set a few of our convenience slots
        anEvent.$$view = TP.$eventGetNormalizedView(anEvent, currentTarget);
        anEvent.$$timestamp = anEvent.timeStamp;

        return anEvent;
    }
));

//  ------------------------------------------------------------------------

TP.definePrimitive('$eventGetNormalizedView',
function(anEvent, currentTarget) {

    /**
     * @method $eventGetNormalizedView
     * @summary Returns the native window object associated with the event. This
     *     is a lower-level routine leveraged by the eventNormalize primitive.
     * @param {Event} anEvent The event to convert into a 'W3C plus'
     *     compliant event object.
     * @param {HTMLElement} currentTarget The object to make the
     *     currentTarget on the Event object. If absent or null,
     *     currentTarget on the Event object defaults to the srcElement.
     * @returns Window The native window associated with the event.
     */

    var win;

    if (anEvent.$$view !== undefined) {
        return anEvent.$$view;
    }

    if (anEvent.view !== undefined) {
        return anEvent.view;
    }

    if (currentTarget !== undefined) {
        win = TP.nodeGetWindow(currentTarget);
        if (win !== undefined) {
            return win;
        }
    }

    if (anEvent.currentTarget !== undefined) {
        win = TP.nodeGetWindow(anEvent.currentTarget);
        if (win !== undefined) {
            return win;
        }
    }

    if (anEvent.srcElement !== undefined) {
        win = TP.nodeGetWindow(anEvent.srcElement);
    }

    return win;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
