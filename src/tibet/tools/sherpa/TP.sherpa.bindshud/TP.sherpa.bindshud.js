//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

/**
 * @type {TP.sherpa.bindshud}
 */

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.defineSubtype('bindshud');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.bindshud.Inst.defineMethod('focusOnTarget',
function(aTPElement) {

    /**
     * @method focusOnTarget
     * @summary Focuses the receiver onto the supplied target.
     * @param {TP.core.UIElementNode} aTPElement The element to focus the
     *     receiver on.
     * @return {TP.sherpa.bindshud} The receiver.
     */

    var node,
        ancestors,
        info,
        select,
        last;

    node = aTPElement.getNativeNode();

    info = TP.ac();

    ancestors = TP.nodeGetAncestorsWithNS(node, TP.w3.Xmlns.BIND);
    if (node.namespaceURI === TP.w3.Xmlns.BIND || TP.notEmpty(
            TP.elementGetAttributeNodesInNS(node, null, TP.w3.Xmlns.BIND))) {
        select = true;
        ancestors.unshift(node);
    }
    ancestors.reverse();

    ancestors.forEach(function(item) {
        info.push(TP.ac(
            TP.bySystemId(TP.lid(item, true)).getType().getName(),
            TP.elementGetFullName(item)));
    });

    this.setValue(info);

    //  Halo target is always last in the list, and always considered selected.
    last = this.get('listitems').last();
    if (select === true && TP.isValid(last)) {
        last.setAttribute('pclass:selected', 'true');
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Handlers
//  ------------------------------------------------------------------------

TP.sherpa.bindshud.Inst.defineHandler('InspectTarget',
function(aSignal) {

    /**
     * @method handleInspectTarget
     * @summary Handles notifications of when the receiver wants to inspect the
     *     current target and shift the Sherpa's inspector to focus it on that
     *     target.
     * @param {TP.sig.InspectTarget} aSignal The TIBET signal which triggered
     *     this method.
     * @return {TP.sherpa.bindshud} The receiver.
     */

    var data,

        targetElem,

        indexInData,
        itemData,

        target;

    //  Grab the target and make sure it's an 'item' tile.
    targetElem = aSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'item')) {
        return this;
    }

    //  Grab our data.
    data = this.get('data');

    //  Get the value of the target's indexInData attribute.
    indexInData = TP.elementGetAttribute(targetElem, 'indexInData', true);

    //  No indexInData? Exit here.
    if (TP.isEmpty(indexInData)) {
        return this;
    }

    //  Convert to a Number and retrieve the entry Array from our data
    indexInData = indexInData.asNumber();
    itemData = data.at(indexInData);

    target = TP.bySystemId(itemData.at(0));

    //  Signal to inspect the object with the rule matcher as 'extra targeting
    //  information' under the 'findContent' key.
    this.signal('InspectObject',
                TP.hc('targetObject', target,
                        'targetAspect', TP.id(target),
                        'showBusy', true));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
