//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */

/**
 * @type {TP.xctrls.signalmenucontent}
 * @summary TP.xctrls.TemplatedTag subtype which...
 */

//  ------------------------------------------------------------------------

TP.xctrls.TemplatedTag.defineSubtype('TP.xctrls:signalmenucontent');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.signalmenucontent.Type.defineMethod('populateCompilationAttrs',
function(aRequest, anElement) {

    /**
     * @method populateCompilationAttrs
     * @summary Populates attributes on the element that is produced by this
     *     type when it is processed.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     * @param {Element} anElement The element to populate the attributes onto.
     * @returns {TP.meta.xctrls.signalmenucontent} The receiver.
     */

    var retVal,
        elem,

        menuElement;

    //  Make sure that we have an element to work from.
    if (!TP.isElement(anElement)) {
        return null;
    }

    retVal = this.callNextMethod();

    elem = aRequest.at('node');

    //  Query under the element in the node to see if the xctrls:menu has been
    //  produced yet (the tag processor is multi-cycle, so this may not be true
    //  during the first pass.
    //  If so, merge the attributes starting with 'item' onto the menu.
    menuElement = TP.byCSSPath('xctrls|menu', elem, true, false);
    if (TP.isElement(menuElement)) {
        TP.elementMergeAttributes(elem, menuElement, true, /^item/, false);
    }

    return retVal;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.signalmenucontent.Inst.defineHandler('UISelect',
function(aSignal) {

    /**
     * @method handleUISelect
     * @param {TP.sig.UISelect} aSignal The signal that caused this handler
     *     to trip.
     * @returns {TP.xctrls.signalmenucontent} The receiver.
     */

    var origin,
        sigName,
        dataIndex,

        itemValue,
        item,

        payload;

    //  Grab the signal origin and wrap it. This should be the menu itself.
    origin = TP.wrap(aSignal.getSignalOrigin());
    if (!TP.isKindOf(origin, TP.xctrls.menu)) {
        return this;
    }

    //  Grab the value, which will be the name of the signal to broadcast, and
    //  the value data, which will form the payload of the signal.
    sigName = origin.getValue();
    if (TP.isEmpty(sigName)) {
        return this;
    }

    dataIndex = aSignal.at('index');
    if (TP.notEmpty(dataIndex) && dataIndex >= 0) {
        payload = this.get('data').at(dataIndex);
    } else {
        itemValue = origin.get('value');
        item = origin.get('itemWithValue', itemValue);
        payload = TP.hc('signal', itemValue, 'label', item.getLabelText());
    }

    //  Signal with the signal name that was the selected value.
    this.signal(sigName, payload);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
