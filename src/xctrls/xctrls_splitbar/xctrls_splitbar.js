//  ========================================================================
/*
NAME:   xctrls_splitbar.js
AUTH:   William J. Edney (wje)
NOTE:   Copyright (C) 1999-2009 Technical Pursuit Inc., All Rights
        Reserved. Patent Pending, Technical Pursuit Inc.

        Unless explicitly acquired and licensed under the Technical
        Pursuit License ("TPL") Version 1.2, the contents of this file
        are subject to the Reciprocal Public License ("RPL") Version 1.1
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
//  ------------------------------------------------------------------------

/**
 * @type {TP.xctrls.splitbar}
 * @synopsis Manages splitbar XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:splitbar');

TP.xctrls.splitbar.addTraitsFrom(TP.xctrls.Element,
                                    TP.core.TemplatedNode);
TP.xctrls.splitbar.Type.resolveTrait('tagCompile', TP.core.TemplatedNode);

//  Resolve the traits right away as type methods of this type are called during
//  content processing when we only have type methods involved.
TP.xctrls.splitbar.executeTraitResolution();

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.splitbar.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Gets the display, or visual, value of the receiver's node. This
     *     is the value the HTML, or other UI tag, is actually displaying to the
     *     user at the moment.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    var offsetParentSize,

        barPosition,

        percentage;

    //  TODO: Right now we assume a vertical orientation.

    offsetParentSize = this.getOffsetParent().getHeight();
    barPosition = this.getOffsetPoint().getY();

    percentage = barPosition / offsetParentSize;

    return percentage;
});

//  ------------------------------------------------------------------------

TP.xctrls.splitbar.Inst.defineMethod('handleDOMDragMove',
function(aSignal) {

    /**
     * @name handleDOMDragMove
     * @synopsis This method is invoked as the splitbar is dragged. It notifies
     *     any observers that the splitbar's value has changed.
     * @param {TP.sig.DOMDragMove} aSignal The signal that caused this handler
     *     to trip.
     */

    if (this.shouldSignalChange()) {
        this.changed('value', TP.UPDATE);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.splitbar.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.splitbar} The receiver.
     */

    var barElem,

        offsetParentSize,
        newPosition;

    if (!TP.isNumber(newPosition = aValue.asNumber())) {
        //  TODO: Throw an exception
        return;
    }

    //  TODO: Right now we assume a vertical orientation.

    barElem = this.getNativeNode();

    offsetParentSize = this.getOffsetParent().getHeight();
    newPosition = newPosition * offsetParentSize;

    TP.elementGetStyleObj(barElem).top = newPosition + 'px';

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
