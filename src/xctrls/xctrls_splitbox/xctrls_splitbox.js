//  ========================================================================
/*
NAME:   xctrls_splitbox.js
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
 * @type {TP.xctrls.splitbox}
 * @synopsis Manages splitbox XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:splitbox');

TP.xctrls.splitbox.addTraitsFrom(TP.xctrls.Element,
                                    TP.core.TemplatedNode);
TP.xctrls.splitbox.Type.resolveTrait('tagCompile', TP.core.TemplatedNode);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.splitbox.Inst.defineAttribute(
        'splitbar',
        {'value': TP.cpc('xctrls|splitbar', true)});

TP.xctrls.splitbox.Inst.defineAttribute(
        'beforePanel',
        {'value': TP.xpc('./xctrls:panel[1]', true)});

TP.xctrls.splitbox.Inst.defineAttribute(
        'afterPanel',
        {'value': TP.xpc('./xctrls:panel[2]', true)});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.splitbox.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Gets the display, or visual, value of the receiver's node. This
     *     is the value the HTML, or other UI tag, is actually displaying to the
     *     user at the moment.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    //  We return the splitbar's value here
    return TP.wrap(this.get('splitbar')).get('value');
});

//  ------------------------------------------------------------------------

TP.xctrls.splitbox.Inst.defineMethod('handleValueChange',
function(aSignal) {

    /**
     * @name handleValueChange
     * @synopsis This method is invoked as the value of the splitbar is changed.
     *     This is due to a handler set up in our generated markup.
     * @param {ValueChange} aSignal The signal that caused this handler to trip.
     */

    var bar,
        beforePanel,
        afterPanel,

        ourSize,
        barPosition;

    //  We need to resize the panels to match our bar's position
    bar = this.get('splitbar');

    beforePanel = this.get('beforePanel');
    afterPanel = this.get('afterPanel');

    //  TODO: Right now we assume a vertical orientation.

    ourSize = this.getHeight();
    barPosition = TP.wrap(bar).getOffsetPoint().getY();

    TP.elementGetStyleObj(beforePanel).height = barPosition + 'px';

    TP.elementGetStyleObj(afterPanel).top = barPosition + 'px';

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.splitbox.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.splitbox} The receiver.
     */

    //  NB: This will cause the ValueChange handler above to be triggered,
    //  since we're observing the splitbar for ValueChange. That handler
    //  visually manipulates the panels.

    TP.wrap(this.get('splitbar')).set('value', aValue);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
