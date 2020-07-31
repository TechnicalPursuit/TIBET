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
 * @type {TP.xctrls.picker}
 * @summary Manages picker XControls.
 */

//  ------------------------------------------------------------------------

TP.xctrls.TemplatedTag.defineSubtype('xctrls:picker');

//  This type is intended to be used as a supertype of concrete types, so we
//  don't allow instance creation
TP.xctrls.picker.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This type captures no signals - it lets all signals pass through.
TP.xctrls.picker.Type.defineAttribute('opaqueCapturingSignalNames', null);

//  Signals that we don't allow to bubble outside of ourself. Since we can
//  process the states associated with these signals, we don't want them to
//  proceed further up the chain.
TP.xctrls.picker.Type.defineAttribute('opaqueBubblingSignalNames',
        TP.ac(
            'TP.sig.UIDeselect',
            'TP.sig.UISelect',

            'TP.sig.UIDisabled',
            'TP.sig.UIEnabled'
            ));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Tag Phase Support
//  ------------------------------------------------------------------------

TP.xctrls.picker.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,

        tpElem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return this.raise('TP.sig.InvalidNode');
    }

    tpElem = TP.wrap(elem);

    tpElem.setup();

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.picker.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
     * @summary Tears down runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem;

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return this.raise('TP.sig.InvalidNode');
    }

    TP.wrap(elem).teardown();

    //  this makes sure we maintain parent processing - but we need to do it
    //  last because it nulls out our wrapper reference.
    this.callNextMethod();

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.picker.Inst.defineAttribute('$settingFromSelection');

TP.xctrls.picker.Inst.defineAttribute('popup',
    TP.xpc('//*[@id="XCtrlsPickerPopup"]',
            TP.hc('shouldCollapse', true)));

TP.xctrls.picker.Inst.defineAttribute('popupContentFirstElement',
    TP.xpc('//*[@id="XCtrlsPickerPopup"]/xctrls:content/*',
            TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------

TP.xctrls.picker.Inst.defineMethod('constructContent',
function(valueURI) {

    /**
     * @method constructContent
     * @summary Constructs the content element that will go into the picker.
     * @param {TP.uri.URI} valueURI The URI to use to set the 'value' of the
     *     control.
     * @returns {TP.dom.ElementNode} The content element.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.picker.Inst.defineMethod('getDisplayValue',
function() {

    /**
     * @method getDisplayValue
     * @summary Gets the display, or visual, value of the receiver's node.
     * @returns {Object} The visual value of the receiver's UI node.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.picker.Inst.defineMethod('getValue',
function() {

    /**
     * @method getValue
     * @summary Returns the value of the receiver. For a UI element this method
     *     will ensure any storage formatters are invoked.
     * @returns {String} The value in string form.
     */

    var value,

        type,
        formats;

    value = this.getDisplayValue();

    //  Given that this type can represent multiple items, it may return an
    //  Array. We should check to make sure the Array isn't empty before doing
    //  any more work.
    if (TP.notEmpty(value)) {

        //  If the receiver has a 'ui:type' attribute, then try first to convert
        //  the content to that type before trying to format it.
        if (TP.notEmpty(type = this.getAttribute('ui:type'))) {
            if (!TP.isType(type = TP.sys.getTypeByName(type))) {
                return this.raise('TP.sig.InvalidType');
            } else {
                value = type.fromString(value);
            }
        }

        //  If the receiver has a 'ui:storage' attribute, then format the return
        //  value according to the formats found there.
        //  the content to that type before trying to format it.
        if (TP.notEmpty(formats = this.getAttribute('ui:storage'))) {
            value = this.$formatValue(value, formats);
        }
    }

    return value;
});

//  ------------------------------------------------------------------------

TP.xctrls.picker.Inst.defineHandler('OpenPicker',
function(aSignal) {

    /**
     * @method handleOpenPicker
     * @param {TP.sig.OpenPicker} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.xctrls.picker} The receiver.
     */

    var id,

        overlayTPElem,

        triggerSignal,

        payload;

    id = this.getLocalID();

    overlayTPElem = TP.xctrls.SharedOverlay.getOverlayWithID(
                            this.getDocument(), 'XCtrlsPickerPopup');

    overlayTPElem.setAttribute('tibet:ctrl', id);

    //  Grab the 'trigger signal' - this will be the DOM-level 'context menu'
    //  signal.
    triggerSignal = aSignal.at('trigger');

    payload = TP.hc('overlayID', 'XCtrlsPickerPopup',
                    'contentURI', 'urn:tibet:' + id + '_content',
                    'corner', TP.SOUTHWEST,
                    'trigger', triggerSignal,
                    'triggerPath', '#' + id,
                    'triggerTPDocument', this.getDocument(),
                    'hideOn', 'UIDeactivate',
                    'sticky', true
                    );

    this.signal('OpenPopup', payload);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.picker.Inst.defineHandler('UIDidOpen',
function(aSignal) {

    /**
     * @method handleUIDidOpen
     * @param {TP.sig.UIDidOpen} aSignal The signal that caused this handler to
     *     trip.
     * @returns {TP.xctrls.picker} The receiver.
     */

    var content,
        handler;

    content = this.get('popupContentFirstElement');

    //  Set up a handler that waits until the content renders and then focus it.
    (handler = function(didRenderSignal) {
        handler.ignore(content, 'TP.sig.DidRender');

        content.focus();
    }).observe(content, 'TP.sig.DidRender');

    //  Refresh the content - by passing true here, this will force it to
    //  re-render.
    content.refresh(true);

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.picker.Inst.defineMethod('isScalarValued',
function(aspectName) {

    /**
     * @method isScalarValued
     * @summary Returns true if the receiver deals with scalar values.
     * @description See the TP.dom.Node's 'isScalarValued()' instance method
     *     for more information.
     * @param {String} [aspectName] An optional aspect name that is being used
     *     by the caller to determine whether the receiver is scalar valued for.
     * @returns {Boolean} For this type, this returns true.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.xctrls.picker.Inst.defineMethod('isSingleValued',
function(aspectName) {

    /**
     * @method isSingleValued
     * @summary Returns true if the receiver deals with single values.
     * @description See the TP.dom.Node's 'isScalarValued()' instance method
     *     for more information.
     * @param {String} [aspectName] An optional aspect name that is being used
     *     by the caller to determine whether the receiver is single valued for.
     * @returns {Boolean} False for this type as it's not single valued.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.xctrls.picker.Inst.defineMethod('setAttrDisabled',
function(beDisabled) {

    /**
     * @method setAttrDisabled
     * @summary The setter for the receiver's disabled state.
     * @param {Boolean} beDisabled Whether or not the receiver is in a disabled
     *     state.
     * @returns {Boolean} Whether the receiver's state is disabled.
     */

    var content;

    content = this.get('popupContentFirstElement');

    if (TP.isValid(content)) {
        content.setAttrDisabled(beDisabled);
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.picker.Inst.defineMethod('setDisplayValue',
function(aValue) {

    /**
     * @method setDisplayValue
     * @summary Sets the display, or visual, value of the receiver's node. You
     *     don't normally call this method directly, instead call setValue().
     * @param {Object} aValue The value to set.
     * @returns {TP.xctrls.picker} The receiver.
     */

    return TP.override();
});

//  ------------------------------------------------------------------------

TP.xctrls.picker.Inst.defineMethod('setValue',
function(aValue, shouldSignal) {

    /**
     * @method setValue
     * @summary Sets the value of the receiver's node. For a UI element this
     *     method will ensure any display formatters are invoked. NOTE that this
     *     method does not update the receiver's bound value if it's a bound
     *     control. In fact, this method is used in response to a change in the
     *     bound value to update the display value, so this method should avoid
     *     changes to the bound value to avoid recursions.
     * @param {Object} aValue The value to set the 'value' of the node to.
     * @param {Boolean} shouldSignal Should changes be notified. If false
     *     changes are not signaled. Defaults to this.shouldSignalChange().
     * @returns {Boolean} Whether or not the value was changed from the value it
     *     had before this method was called.
     */

    var oldValue,
        newValue,

        displayValue,

        flag;

    if (TP.notValid(aValue)) {
        return false;
    }

    oldValue = this.getValue();

    newValue = this.produceValue('value', aValue);

    //  If the values are equal, there's nothing to do here - bail out.
    if (TP.equal(TP.str(oldValue), TP.str(newValue))) {
        return false;
    }

    this.setDisplayValue(newValue);

    //  signal as needed

    displayValue = this.getDisplayValue();

    //  Sometimes the display value computed from the new value can be equal to
    //  the old value. If that's *not* the case, then propagate and set the
    //  bound value.
    if (!TP.equal(oldValue, displayValue)) {
        //  NB: Use this construct this way for better performance
        if (TP.notValid(flag = shouldSignal)) {
            flag = this.shouldSignalChange();
        }

        if (flag) {
            this.$changed('value', TP.UPDATE,
                            TP.hc(TP.OLDVAL, oldValue, TP.NEWVAL, newValue));
        }

        //  If the element is bound, then update its bound value.
        this.setBoundValueIfBound(this.getValue());
    }

    //  If this flag is true, then that means that we're setting the value from
    //  the selection and don't want to recurse.
    if (TP.notTrue(this.get('$settingFromSelection'))) {
        this.set('selection', aValue);
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.xctrls.picker.Inst.defineMethod('setSelection',
function(aValue) {

    /**
     * @method setSelection
     * @summary Sets the selection of the receiver. A picker's popup content
     *     usually sets this via a data binding.
     * @param {Object} aValue The value to set the 'selection' of the receiver
     *     to.
     * @returns {Boolean} Whether or not the value was changed from the value it
     *     had before this method was called.
     */

    var didChange;

    //  Sometimes, the popup content will send a null value. We want to ignore
    //  those.
    if (TP.notValid(aValue)) {
        return this;
    }

    //  Set a flag before calling setValue to avoid recursion.
    this.set('$settingFromSelection', true, false);
    didChange = this.set('value', aValue);
    this.set('$settingFromSelection', false, false);

    return didChange;
});

//  ------------------------------------------------------------------------

TP.xctrls.picker.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.xctrls.picker} The receiver.
     */

    var id,

        selectionURI,
        selectionLoc,

        contentTPElem,

        contentURI;

    //  Grab our local ID - we'll use this to qualify various pieces of the
    //  picker control.
    id = this.getLocalID();

    //  Compute a URI to use to hold the 'selection' (which is normally
    //  considered to be the 'value' of this control).
    selectionURI = TP.uc('urn:tibet:' + id + '_selection');
    selectionLoc = selectionURI.getLocation();

    //  Construct the content, supplying the selection URI as the location for
    //  the content element to put the value when setting it. Since we will also
    //  observe this location as our 'value', it will become our value
    contentTPElem = this.constructContent(selectionURI);

    //  Compute a URI to use to hold the actual content of the picker and put
    //  the content element that we just computed into it.
    contentURI = TP.uc('urn:tibet:' + id + '_content');
    contentURI.setResource(contentTPElem);

    //  Add a binding expression to the receiver that binds our 'selection'
    //  aspect to the computed selection location.
    this.addBindingExpressionTo('bind:io', 'selection', selectionLoc);

    //  Obtain the popup's shared overlay. We don't assign it here, since we
    //  don't need a reference here, but we want to make sure it's created so
    //  that we can perform proper sizing before we actually load it.
    TP.xctrls.popup.getOverlayWithID(this.getDocument(), 'XCtrlsPickerPopup');

    return this;
});

//  ------------------------------------------------------------------------

TP.xctrls.picker.Inst.defineMethod('teardown',
function() {

    /**
     * @method teardown
     * @summary Tears down the receiver by performing housekeeping cleanup, like
     *     ignoring signals it's observing, etc.
     * @returns {TP.xctrls.picker} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
