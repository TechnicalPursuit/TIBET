//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.xctrls.tabbar}
 * @synopsis Manages tabbar XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:tabbar');

TP.xctrls.tabbar.addTraits(TP.xctrls.Element,
                                TP.core.TemplatedNode);
TP.xctrls.tabbar.Type.resolveTrait('tagCompile', TP.core.TemplatedNode);

//  Resolve the traits right away as type methods of this type are called during
//  content processing when we only have type methods involved.
TP.xctrls.tabbar.finalizeTraits();

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.tabbar.Inst.defineAttribute(
        'tabs',
        {'value': TP.cpc('xctrls|tabitem', false)});

TP.xctrls.tabbar.Inst.defineAttribute(
        'selectedTab',
        {'value': TP.cpc('xctrls|tabitem[pclass|selected]', true)});

TP.xctrls.tabbar.Inst.defineAttribute(
        'tabWithValue',
        {'value': TP.xpc('./xctrls:tabitem/xctrls:value[text() = "{{1}}"]/..', true)});

TP.xctrls.tabbar.Inst.defineAttribute(
        'selectedValue',
        {'value': TP.xpc('string(./xctrls:tabitem[@pclass:selected = "true"]/xctrls:value)', true)});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.tabbar.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @name getDisplayValue
     * @synopsis Gets the display, or visual, value of the receiver's node. This
     *     is the value the HTML, or other UI tag, is actually displaying to the
     *     user at the moment.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    return this.get('selectedValue');
});

//  ------------------------------------------------------------------------

TP.xctrls.tabbar.Inst.defineMethod('handleDOMClick',
function(aSignal) {

    /**
     * @name handleDOMClick
     * @synopsis This method is invoked as each tabitem is clicked.
     * @param {TP.sig.DOMClick} aSignal The signal that caused this handler to
     *     trip.
     */

    var target,
        clickedValue;

    if (this.get('disabled') === true) {
        return;
    }

    //  Grab the signal target
    target = aSignal.getTarget();

    //  If the signal target wasn't the 'xctrls:tabitem', then we need
    //  to 'search upward' through the ancestor chain to get it.
    if (TP.name(target) !== 'xctrls:tabitem') {
        if (TP.notValid(
            target = TP.wrap(target).get('ancestor::xctrls:tabitem'))) {
            return;
        }

        //  If we get a valid result, its going to be as an Array
        target = target.first();
    }

    //  Make sure we have a valid target element
    if (!TP.isElement(target)) {
        return;
    }

    //  Grab the value from the 'xctrls:value' element under the item
    clickedValue = TP.wrap(target).get('string(./xctrls:value)');

    if (TP.isValid(clickedValue)) {
        this.set('value', clickedValue);
    }

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.tabbar.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.tabbar} The receiver.
     */

    this.toggleSelectedItem(this.get('selectedTab'),
                            this.get('tabWithValue', aValue));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
