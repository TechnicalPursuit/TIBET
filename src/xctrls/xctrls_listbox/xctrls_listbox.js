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
 * @type {TP.xctrls.listbox}
 * @synopsis Manages listbox XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:listbox');

TP.xctrls.listbox.addTraits(TP.xctrls.Element, TP.xctrls.MultiItemElement,
                            TP.core.TemplatedNode);

TP.xctrls.listbox.Type.resolveTrait('cmdRunContent', TP.xctrls.Element);
TP.xctrls.listbox.Type.resolveTrait('tagCompile', TP.core.TemplatedNode);

TP.xctrls.listbox.Inst.resolveTraits(
        TP.ac('$setAttribute', 'getNextResponder', 'isResponderFor',
                'removeAttribute', 'select', 'signal'),
        TP.xctrls.Element);
TP.xctrls.listbox.Inst.resolveTrait('addItem', TP.xctrls.MultiItemElement);

//  Resolve the traits right away as type methods of this type are called during
//  content processing when we only have type methods involved.
TP.xctrls.listbox.finalizeTraits();

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.listbox.Inst.defineAttribute(
        'items',
        {'value': TP.cpc('*[class~="item"]', false)});

TP.xctrls.listbox.Inst.defineAttribute(
        'selectedItem',
        {'value': TP.cpc('xctrls|textitem[pclass|selected]', true)});

TP.xctrls.listbox.Inst.defineAttribute(
        'itemWithValue',
        {'value': TP.xpc('./html:div/xctrls:textitem/xctrls:value[text() = "{{1}}"]/..', true)});

TP.xctrls.listbox.Inst.defineAttribute(
        'selectedValue',
        {'value': TP.xpc('string(./html:div/xctrls:textitem[@pclass:selected = "true"]/xctrls:value)', true)});

//  TP.xctrls.MultiItemElement getters

TP.xctrls.listbox.Inst.defineAttribute(
        'body',
        {'value': TP.xpc('.//xctrls:body', true)});

TP.xctrls.listbox.Inst.defineAttribute(
        'firstTransform',
        {'value': TP.xpc('.//tsh:transform[1]', true)});

TP.xctrls.listbox.Inst.defineAttribute(
        'transformWithName',
        {'value': TP.xpc('.//tsh:transform/tsh:template[@tsh:name = "{{1}}"]/..', true)});

//  ------------------------------------------------------------------------

TP.xctrls.listbox.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @name tagAttachDOM
     * @synopsis Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    //  When multiple inheritance is fixed, we should be able to do away
    //  with this (and mixin TP.core.EmbeddedTemplateNode properly).
    TP.xctrls.Element.tagAttachDOM.call(this, aRequest);
    TP.core.EmbeddedTemplateNode.tagAttachDOM.call(this, aRequest);

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.listbox.Inst.defineMethod('getDisplayValue',
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

TP.xctrls.listbox.Inst.defineMethod('handleValueChange',
function(aSignal) {

    /**
     * @name handleValueChange
     * @synopsis This method is invoked as the value of the tabbar is changed.
     *     This is due to a handler set up in our generated markup.
     * @param {ValueChange} aSignal The signal that caused this handler to trip.
     */

    //  The value of the tabbar will have already been changed to the new
    //  value, and that's what our get('value') gets here.
    this.toggleSelectedItem(
                this.get('selectedItem'),
                this.get('itemWithValue', this.get('value')));

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.listbox.Inst.defineMethod('handleDOMClick',
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

    //  If the signal target wasn't the 'xctrls:textitem', then we need
    //  to 'search upward' through the ancestor chain to get it.
    if (TP.name(target) !== 'xctrls:textitem') {
        if (TP.notValid(
            target = TP.wrap(target).get('ancestor::xctrls:textitem'))) {
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

TP.xctrls.listbox.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @name setDisplayValue
     * @synopsis Sets the display, or visual, value of the receiver's node. The
     *     value provided to this method is typically already formatted using
     *     the receiver's display formatters (if any). You don't normally call
     *     this method directly, instead call setValue() and it will ensure
     *     proper display formatting.
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.listbox} The receiver.
     */

    this.toggleSelectedItem(this.get('selectedItem'),
                            this.get('itemWithValue', aValue));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
