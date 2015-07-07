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
 * @type {TP.xctrls.log}
 * @summary Manages log XControls.
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('xctrls:log');

TP.xctrls.log.addTraits(TP.xctrls.Element, TP.xctrls.MultiItemElement,
                        TP.core.TemplatedNode);

TP.xctrls.log.Type.resolveTrait('cmdRunContent', TP.xctrls.Element);
TP.xctrls.log.Type.resolveTrait('tagCompile', TP.core.TemplatedNode);

TP.xctrls.log.Inst.resolveTraits(
        TP.ac('$setAttribute', 'getNextResponder', 'isResponderFor',
                'removeAttribute', 'select', 'signal'),
        TP.xctrls.Element);
TP.xctrls.log.Inst.resolveTrait('addItem', TP.xctrls.MultiItemElement);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.log.Inst.defineAttribute(
        'body',
        {value: TP.cpc('*[tibet|pelem="body"]', TP.hc('shouldCollapse', true))});

TP.xctrls.log.Inst.defineAttribute(
        'firstTransform',
        {value: TP.xpc('.//tsh:transform[1]', TP.hc('shouldCollapse', true))});

TP.xctrls.log.Inst.defineAttribute(
        'transformWithName',
        {value: TP.xpc('.//tsh:transform/tsh:template[@tsh:name = "{{1}}"]/..', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.log.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest.
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

TP.xctrls.log.Inst.defineMethod('handleChange',
function(aSignal) {

    /**
     * @method handleChange
     * @summary Handles any TP.sig.Change signals by logging information to the
     *     receiver.
     * @param {TP.sig.Change} aSignal The signal that caused this handler to
     *     trip.
     */

    var aspect,
        obj,

        val;

    aspect = aSignal.get('aspect');
    obj = TP.wrap(aSignal.getOrigin());

    val = obj.get(aspect);

    this.logData(TP.join('The "', aspect, '" aspect',
                            ' of: "', obj.getID(), '"',
                            ' changed to: "', val, '"'));

    return;
});

//  ------------------------------------------------------------------------

TP.xctrls.log.Inst.defineMethod('logData',
function(aData) {

    /**
     * @method logData
     * @summary Logs the supplied data to the receiver by executing the
     *     receiver's template.
     * @param {Object} aData The data to log to the receiver.
     */

    var bodyElem;

    this.addItem(TP.hc('itemData', aData));

    bodyElem = this.get('body');
    bodyElem.scrollTop = bodyElem.scrollHeight;

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
