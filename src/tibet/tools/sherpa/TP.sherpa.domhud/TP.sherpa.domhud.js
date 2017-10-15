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
 * @type {TP.sherpa.domhud}
 */

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.defineSubtype('domhud');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.domhud.Type.defineMethod('tagAttachComplete',
function(aRequest) {

    /**
     * @method tagAttachComplete
     * @summary Executes once the tag has been fully processed and its
     *     attachment phases are fully complete.
     * @description Because tibet:data tag content drives binds and we need to
     *     notify even without a full page load, we notify from here once the
     *     attachment is complete (instead of during tagAttachData).
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have a node to work from.
    if (!TP.isElement(elem = aRequest.at('node'))) {
        return;
    }

    tpElem = TP.wrap(elem);

    tpElem.observe(tpElem.get('listcontent'),
                    TP.ac('TP.sig.DOMDNDTargetOver',
                            'TP.sig.DOMDNDTargetOut'));

    tpElem.observe(TP.ANY, 'TP.sig.DOMDNDCompleted');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineAttribute('$currentDNDTarget');
TP.sherpa.domhud.Inst.defineAttribute('$tileContentConstructed');
TP.sherpa.domhud.Inst.defineAttribute('$attributeNames');

TP.sherpa.domhud.Inst.defineAttribute('currentTarget');

TP.sherpa.domhud.Inst.defineAttribute('highlighted');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineMethod('computePeerElement',
function(sidebarElement) {

    /**
     * @method computePeerElement
     * @summary Computes the peer element to the supplied sidebar element in the
     *     current UI canvas DOM.
     * @param {Element} sidebarElement The element to compute the peer element
     *     from.
     * @returns {Element|null} The element in the current UI canvas DOM that is
     *     being represented by the supplied sidebar Element.
     */

    var peerID,

        doc,
        peerElem;

    if (TP.elementHasClass(sidebarElement, 'spacer')) {

        //  If the spacer DND target element has a next sibling, then
        //  try to get it's peerID and set the insertion position to
        //  TP.BEFORE_BEGIN.
        if (TP.isElement(sidebarElement.nextSibling)) {
            //  We go to the item after us to determine the peerID
            peerID = TP.elementGetAttribute(
                        sidebarElement.nextSibling,
                        'peerID',
                        true);
        }

        //  Couldn't find one after the spacer - try the spacer DND
        //  target element before it.
        if (TP.isEmpty(peerID) &&
                TP.isElement(sidebarElement.previousSibling)) {
            //  We go to the item before us to determine the peerID
            peerID = TP.elementGetAttribute(
                            sidebarElement.previousSibling,
                            'peerID',
                            true);
        }
    } else {
        //  We go to ourself to determine the peerID
        peerID = TP.elementGetAttribute(
                            sidebarElement,
                            'peerID',
                            true);
    }

    //  If we succesfully got a peerID, then get the Element it matches
    //  in the UI canvas DOM.
    if (TP.notEmpty(peerID)) {

        doc = TP.sys.uidoc(true);

        peerElem = TP.byId(peerID, doc, false);
        if (TP.isElement(peerElem)) {
            return peerElem;
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineMethod('focusOnTarget',
function(aTPElement) {

    /**
     * @method focusOnTarget
     * @summary Focuses the receiver onto the supplied target.
     * @param {TP.core.UIElementNode} aTPElement The element to focus the
     *     receiver on.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var info,
        nodes,

        children;

    info = TP.ac();

    //  Get the supplied element's ancestor chain and build a list from that.

    nodes = aTPElement.getAncestors();

    //  Unshift the supplied element onto the front.
    nodes.unshift(aTPElement);

    //  Reverse the list so that the top-most anscestor is first and the
    //  supplied element is last.
    nodes.reverse();

    children = aTPElement.getChildElements();

    //  Filter out children that are generated - TIBET generated them and we
    //  don't want them 'visible' to app authors.
    children = children.filter(
                function(aTPElem) {

                    if (TP.isTrue(TP.unwrap(aTPElem)[TP.GENERATED])) {
                        return false;
                    }

                    return true;
                });

    //  Concatenate the filtered child elements onto the list.
    nodes = nodes.concat(children);
    nodes.perform(
        function(aNode) {
            var node,
                arr;

            node = TP.canInvoke(aNode, 'getNativeNode') ?
                                    aNode.getNativeNode() :
                                    aNode;

            if (!TP.isElement(node)) {
                return;
            }

            arr = TP.ac(
                    TP.lid(node, true),
                    TP.elementGetFullName(node));

            if (aNode === aTPElement) {
                arr.push('target');
            } else if (aNode.getParentNode().getNativeNode() ===
                        aTPElement.getNativeNode()) {
                arr.push('child');
            } else {
                arr.push('normal');
            }

            info.push(arr);
        });

    //  List expects an array of arrays containing IDs and full names.
    this.setValue(info);

    //  Scroll our list content to its bottom.
    this.get('listcontent').scrollTo(TP.BOTTOM);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineMethod('focusOnUICanvasRoot',
function() {

    /**
     * @method focusOnUICanvasRoot
     * @summary Focuses the receiver on the UI canvas's 'root' (i.e. document)
     *     element.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var root,
        arr;

    root = TP.sys.getUICanvas().getDocument().getRoot();
    if (TP.notValid(root)) {
        return;
    }

    root = root.getNativeNode();

    arr = TP.ac(
            TP.lid(root, true),
            TP.elementGetFullName(root),
            'normal');

    //  List expects an array of arrays containing IDs and full names.
    this.setValue(TP.ac(arr));

    return this;
});

//  ------------------------------------------------------------------------
//  TP.core.D3Tag Methods
//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineMethod('buildNewContent',
function(enterSelection) {

    /**
     * @method buildNewContent
     * @summary Builds new content onto the receiver by appending or inserting
     *     content into the supplied d3.js 'enter selection'.
     * @param {TP.extern.d3.selection} enterSelection The d3.js enter selection
     *     that new content should be appended to.
     * @returns {TP.extern.d3.selection} The supplied enter selection or a new
     *     selection containing any new content that was added.
     */

    var domContent;

    domContent = enterSelection.append('li');

    domContent.attr(
            'pclass:selected',
            function(d) {
                if (d[2] === 'target') {
                    return true;
                }
            }).attr(
            'child',
            function(d) {
                if (d[2] === 'child') {
                    return true;
                }
            }).attr(
            'indexInData',
            function(d, i) {
                return i;
            }).attr(
            'peerID',
            function(d, i) {
                if (d[1] !== 'spacer') {
                    return d[0];
                }
            }).text(
            function(d) {
                if (d[1] !== 'spacer') {
                    return d[1];
                }
            }).attr(
            'class',
            function(d) {
                var val;

                val = 'item';

                if (d[1] === 'spacer') {
                    val += ' spacer';
                } else {
                    val += ' domnode';
                }

                return val;
            }).each(
            function(d, i) {
                TP.elementSetAttribute(this, 'dnd:accept', 'tofu', true);
            });

    return domContent;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineMethod('computeSelectionData',
function() {

    /**
     * @method computeSelectionData
     * @summary Returns the data that will actually be used for binding into the
     *     d3.js selection.
     * @description The selection data may very well be different than the bound
     *     data that uses TIBET data binding to bind data to this control. This
     *     method allows the receiver to transform it's 'data binding data' into
     *     data appropriate for d3.js selections.
     * @returns {Object} The selection data.
     */

    var data,
        newData,

        len,
        i;

    data = this.get('data');

    newData = TP.ac();

    len = data.getSize();
    for (i = 0; i < len; i++) {

        //  Push in a data row and then a spacer row.
        //  NOTE: We construct the spacer row to take into account the fact, in
        //  the 3rd slot, what the 'condition' (i.e. 'normal', 'target',
        //  'child') is of the data row that it's a spacer for. This is because,
        //  if the data row is being removed for some reason, we want the spacer
        //  row to be removed as well. Otherwise, spurious spacer rows are left
        //  around and, with the 'append' in the buildNewContent method, things
        //  will get out of order in a hurry.
        newData.push(
            data.at(i),
            TP.ac('spacer_' + i, 'spacer', 'spacer_' + data.at(i).at(2)));
    }

    return newData;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineMethod('updateExistingContent',
function(updateSelection) {

    /**
     * @method updateExistingContent
     * @summary Updates any existing content in the receiver by altering the
     *     content in the supplied d3.js 'update selection'.
     * @param {TP.extern.d3.selection} updateSelection The d3.js update
     *     selection that existing content should be altered in.
     * @returns {TP.extern.d3.selection} The supplied update selection.
     */

    updateSelection.attr(
            'pclass:selected',
            function(d) {
                if (d[2] === 'target') {
                    return true;
                }
            }).attr('child',
            function(d) {
                if (d[2] === 'child') {
                    return true;
                }
            }).attr(
            'indexInData',
            function(d, i) {
                return i;
            }).attr(
            'peerID',
            function(d, i) {
                if (d[1] !== 'spacer') {
                    return d[0];
                }
            }).text(
            function(d) {
                if (d[1] !== 'spacer') {
                    return d[1];
                }
            }).attr(
            'class',
            function(d) {
                var val;

                val = 'item';

                if (d[1] === 'spacer') {
                    val += ' spacer';
                } else {
                    val += ' domnode';
                }

                return val;
            }).each(
            function(d, i) {
                TP.elementSetAttribute(this, 'dnd:accept', 'tofu', true);
            });

    return updateSelection;
});

//  ------------------------------------------------------------------------
//  Handlers
//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('ClosedChange',
function(aSignal) {

    /**
     * @method handleClosedChange
     * @summary Handles notifications of HUD closed change signals.
     * @param {TP.sig.ClosedChange} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var hud,
        hudIsHidden;

    //  Grab the HUD and see if it's currently open or closed.
    hud = TP.byId('SherpaHUD', this.getNativeDocument());
    hudIsHidden = TP.bc(hud.getAttribute('closed'));

    if (!hudIsHidden) {
        this.focusOnUICanvasRoot();
    }

    return this;
}, {
    origin: 'SherpaHUD'
});

//  ----------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('DOMDNDTargetOver',
function(aSignal) {

    /**
     * @method handleDOMDNDTargetOver
     * @summary Handles when the drag and drop system enters a possible drop
     *     target.
     * @param {TP.sig.DOMDNDTargetOver} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var dndTargetTPElem,
        dndTargetElem,

        peerElem;

    dndTargetTPElem = aSignal.getDOMTarget();
    dndTargetElem = TP.unwrap(dndTargetTPElem);

    TP.elementAddClass(dndTargetElem, 'sherpa-domhud-droptarget');

    if (!TP.elementHasClass(dndTargetElem, 'spacer')) {
        peerElem = this.computePeerElement(dndTargetElem);
        TP.elementAddClass(peerElem, 'sherpa-outliner-droptarget');
    }

    this.set('$currentDNDTarget', dndTargetElem);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('DOMDNDTargetOut',
function(aSignal) {

    /**
     * @method handleDOMDNDTargetOut
     * @summary Handles when the drag and drop system exits a possible drop
     *     target.
     * @param {TP.sig.DOMDNDTargetOut} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var dndTargetTPElem,
        dndTargetElem,

        peerElem;

    dndTargetTPElem = aSignal.getDOMTarget();
    dndTargetElem = TP.unwrap(dndTargetTPElem);

    //  Remove the CSS class placed on the drop target and set the attribute we
    //  use to track the current DND target to null.
    TP.elementRemoveClass(dndTargetElem, 'sherpa-domhud-droptarget');

    if (!TP.elementHasClass(dndTargetElem, 'spacer')) {
        peerElem = this.computePeerElement(dndTargetElem);
        TP.elementRemoveClass(peerElem, 'sherpa-outliner-droptarget');
    }

    this.set('$currentDNDTarget', null);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('DOMDNDCompleted',
function(aSignal) {

    /**
     * @method handleDOMDNDCompleted
     * @summary Handles when the drag and drop system completes a dragging
     *     session.
     * @param {TP.sig.DOMDNDCompleted} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var dndTargetElem,

        peerID,

        insertionPosition,

        peerElem,

        doc;

    dndTargetElem = this.get('$currentDNDTarget');

    if (TP.isElement(dndTargetElem)) {

        //  Remove the class placed on the drop target and set the attribute we
        //  use to track the current DND target to null.
        TP.elementRemoveClass(dndTargetElem, 'sherpa-domhud-droptarget');
        this.set('$currentDNDTarget', null);

        //  If the sidebar contains the target element, then we want to do the
        //  insertion.
        if (this.contains(dndTargetElem, TP.IDENTITY)) {

            if (TP.elementHasClass(dndTargetElem, 'spacer')) {

                //  If the spacer DND target element has a next sibling, then
                //  try to get it's peerID and set the insertion position to
                //  TP.BEFORE_BEGIN.
                if (TP.isElement(dndTargetElem.nextSibling)) {
                    //  We go to the item after us to determine the peerID
                    peerID = TP.elementGetAttribute(
                                dndTargetElem.nextSibling,
                                'peerID',
                                true);
                    insertionPosition = TP.BEFORE_BEGIN;
                }

                //  Couldn't find one after the spacer - try the spacer DND
                //  target element before it.
                if (TP.isEmpty(peerID) &&
                        TP.isElement(dndTargetElem.previousSibling)) {
                    //  We go to the item before us to determine the peerID
                    peerID = TP.elementGetAttribute(
                                    dndTargetElem.previousSibling,
                                    'peerID',
                                    true);
                    insertionPosition = TP.AFTER_END;
                }
            } else {
                //  We go to ourself to determine the peerID
                peerID = TP.elementGetAttribute(
                                    dndTargetElem,
                                    'peerID',
                                    true);
                insertionPosition = TP.BEFORE_END;
            }

            //  If we succesfully got a peerID, then get the Element it matches
            //  in the UI canvas DOM.
            if (TP.notEmpty(peerID)) {

                doc = TP.sys.uidoc(true);

                peerElem = TP.byId(peerID, doc, false);
                if (TP.isElement(peerElem)) {

                    TP.elementRemoveClass(
                            peerElem, 'sherpa-outliner-droptarget');

                    //  We found a peer ELement. Use it as the insertion point
                    //  and use it's parent node as the receiver of the message
                    //  that the Sherpa dropped tofu.
                    TP.wrap(peerElem.parentNode).sherpaDidInsertTofu(
                        peerElem, insertionPosition);
                }
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('FocusHalo',
function(aSignal) {

    /**
     * @method handleFocusHalo
     * @summary Handles notifications of when the receiver wants to focus the
     *     halo.
     * @param {TP.sig.FocusHalo} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var targetElem,
        peerID,

        newTargetTPElem,

        halo,
        currentTargetTPElem;

    //  Grab the target lozenge tile and get the value of its peerID attribute.
    //  This will be the ID of the element that we're trying to focus.
    targetElem = aSignal.getDOMTarget();
    peerID = TP.elementGetAttribute(targetElem, 'peerID', true);

    //  No peerID? Exit here.
    if (TP.isEmpty(peerID)) {
        return this;
    }

    //  NB: We want to query the current UI canvas here - no node context
    //  necessary.
    newTargetTPElem = TP.byId(peerID);

    halo = TP.byId('SherpaHalo', this.getNativeDocument());

    currentTargetTPElem = halo.get('currentTargetTPElem');
    if (newTargetTPElem !== currentTargetTPElem) {

        if (TP.isValid(currentTargetTPElem) &&
                currentTargetTPElem.haloCanBlur(halo)) {
            halo.blur();
        }

        //  Remove any highlighting that we were doing *on the new target*
        //  because we're going to focus the halo.
        newTargetTPElem.removeClass('sherpa-hud-highlight');
        this.$set('highlighted', null, false);

        if (newTargetTPElem.haloCanFocus(halo)) {
            //  Focus the halo on our new element, passing true to actually
            //  show the halo if it's hidden.
            halo.focusOn(newTargetTPElem, true);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('FocusHaloAndInspect',
function(aSignal) {

    /**
     * @method handleFocusHaloAndInspect
     * @summary Handles notifications of when the receiver wants to focus the
     *     halo and shift the Sherpa's inspector to focus it on the halo's
     *     target.
     * @param {TP.sig.FocusHaloAndInspect} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var targetElem,
        peerID,

        newTargetTPElem,

        halo,
        currentTargetTPElem;

    //  Grab the target lozenge tile and get the value of its peerID attribute.
    //  This will be the ID of the element that we're trying to focus.
    targetElem = aSignal.getDOMTarget();
    peerID = TP.elementGetAttribute(targetElem, 'peerID', true);

    //  No peerID? Exit here.
    if (TP.isEmpty(peerID)) {
        return this;
    }

    //  NB: We want to query the current UI canvas here - no node context
    //  necessary.
    newTargetTPElem = TP.byId(peerID);

    halo = TP.byId('SherpaHalo', this.getNativeDocument());

    currentTargetTPElem = halo.get('currentTargetTPElem');
    if (newTargetTPElem !== currentTargetTPElem) {
        //  Blur and refocus the halo on the newTargetTPElem.

        if (currentTargetTPElem.haloCanBlur(halo)) {

            halo.blur();

            if (newTargetTPElem.haloCanFocus(halo)) {
                halo.focusOn(newTargetTPElem);
            }
        }
    }

    halo.setAttribute('hidden', false);

    //  Fire a 'ConsoleCommand' signal that will be picked up and processed by
    //  the Sherpa console. Send command text asking it to inspect the current
    //  target of the halo.
    TP.signal(null,
                'ConsoleCommand',
                TP.hc('cmdText', ':inspect $HALO'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('HaloDidBlur',
function(aSignal) {

    /**
     * @method handleHaloDidBlur
     * @summary Handles notifications of when the halo blurs on an object.
     * @param {TP.sig.HaloDidBlur} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var sherpaInst;

    this.focusOnUICanvasRoot();

    sherpaInst = TP.bySystemId('Sherpa');
    this.ignore(sherpaInst, 'CanvasChanged');

    //  NB: We don't callNextMethod() here because our supertype will clear our
    //  data and we don't want that (otherwise, focusing on the canvas root
    //  above will have been for naught).

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('ToggleHighlight',
function(aSignal) {

    /**
     * @method ToggleHighlight
     * @summary Responds to mouse over/out notifications by toggling a
     *     class on individual peer elements. The result is that as the user
     *     hovers over elements in the sidebar the corresponding element in
     *     the canvas gets a 'sherpa-hud-highlight' class add/removed.
     * @param {TP.sig.ToggleHighlight} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var targetElem,
        peerID,

        halo,

        target;

    target = this.get('highlighted');

    //  If target then we're leaving...clear and exit.
    if (TP.isValid(target)) {
        TP.elementRemoveClass(target, 'sherpa-hud-highlight');
        this.$set('highlighted', null, false);
        return;
    }

    targetElem = aSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'domnode')) {
        return this;
    }

    peerID = TP.elementGetAttribute(targetElem, 'peerID', true);

    if (TP.isEmpty(peerID)) {
        return this;
    }

    //  NB: We want to query the current UI canvas here - no node context
    //  necessary.
    target = TP.byId(peerID);
    if (TP.notValid(target)) {
        return this;
    }

    halo = TP.byId('SherpaHalo', this.getNativeDocument());

    if (target !== halo.get('currentTargetTPElem')) {

        target = target.getNativeNode();
        TP.elementAddClass(target, 'sherpa-hud-highlight');
        this.$set('highlighted', target, false);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('ShowAttributes',
function(aSignal) {

    /**
     * @method ShowAttributes
     * @summary Responds to mouse contextmenu notifications by toggling a
     *     class on individual peer elements. The result is that as the user
     *     right clicks over elements in the sidebar the attributes panel is
     *     shown for the corresponding element.
     * @param {TP.sig.ShowAttributes} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var targetElem,
        peerID,
        target,

        centerElem,
        centerElemPageRect,

        targetElemPageRect,

        modelObj,
        newInsertionInfo,

        tileTPElem,

        names,

        tagAttrs,

        modelURI,

        existedHandler,
        newHandler;

    targetElem = aSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'domnode')) {
        return this;
    }

    peerID = TP.elementGetAttribute(targetElem, 'peerID', true);

    if (TP.isEmpty(peerID)) {
        return this;
    }

    //  NB: We want to query the current UI canvas here - no node context
    //  necessary.
    target = TP.byId(peerID);
    if (TP.notValid(target)) {
        return this;
    }

    //  Prevent default *on the trigger signal* (which is the GUI signal - the
    //  contextmenu signal) so that any sort of 'right click' menu doesn't show.
    aSignal.at('trigger').preventDefault();

    this.set('currentTarget', target);

    //  Use the same 'X' coordinate where the 'center' div is located in the
    //  page.
    centerElem = TP.byId('center', this.getNativeWindow());
    centerElemPageRect = centerElem.getPageRect();

    //  Use the 'Y' coordinate where the target element is located in the page.
    targetElemPageRect = TP.wrap(targetElem).getPageRect();

    //  ---

    //  Build the model object.
    modelObj = TP.hc();

    //  Register a hash to be placed at the top-level 'info' slot in the model.
    newInsertionInfo = TP.hc();
    modelObj.atPut('info', newInsertionInfo);

    names = TP.ac();

    //  Iterate over the target's attributes and populate the data model with
    //  the name and value.
    tagAttrs = TP.ac();
    target.getAttributes().perform(
        function(kvPair) {
            tagAttrs.push(
                TP.hc('tagAttrName', kvPair.first(),
                        'tagAttrValue', kvPair.last())
            );

            names.push(kvPair.first());
        });
    this.set('$attributeNames', names);

    newInsertionInfo.atPut('tagAttrs', tagAttrs);

    //  Set up a model URI and observe it for change ourself. This will allow us
    //  to regenerate the tag representation as the model changes.
    modelURI = TP.uc('urn:tibet:dom_attr_source');

    //  Construct a JSONContent object around the model object so that we can
    //  bind to it using the more powerful JSONPath constructs
    modelObj = TP.core.JSONContent.construct(TP.js2json(modelObj));

    //  If we've already constructed the tile content, just set the resource on
    //  the model URI. This will cause the bindings to update.
    if (this.get('$tileContentConstructed')) {
        existedHandler =
            function(aTileTPElem) {
                modelURI.setResource(modelObj, TP.hc('signalChange', true));

                //  Position the tile
                tileTPElem = TP.byId('DOMAttributes_Tile',
                                        this.getNativeDocument());
                tileTPElem.setPagePosition(
                    TP.pc(centerElemPageRect.getX(),
                            targetElemPageRect.getY()));
                (function() {
                    tileTPElem.get('body').
                        focusAutofocusedOrFirstFocusableDescendant();
                }).queueForNextRepaint(aTileTPElem.getNativeWindow());
            }.bind(this);
    } else {

        //  Observe the URI for when the whole value changes.
        this.observe(modelURI, 'ValueChange');

        newHandler =
            function(aTileTPElem) {

                var contentElem,
                    newContentTPElem;

                contentElem =
                    TP.xhtmlnode(
                        '<tibet:group wrapWhen="true" autofocus="autofocus">' +
                            '<span class="dom_attributes" bind:scope="urn:tibet:dom_attr_source#jpath($.info)">' +
                                '<div id="domhud_attributes" bind:repeat="tagAttrs">' +
                                        '<input type="text" bind:io="{value: tagAttrName}" tabindex="0"/>' +
                                        '<input type="text" bind:io="{value: tagAttrValue}" tabindex="0"/>' +
                                        '<span class="deleter" on:click="{signal: DeleteItem, origin: \'domhud_attributes\', payload: {index:TP.TARGET}}"/>' +
                                    '<br/>' +
                                '</div>' +
                                '<div class="inserter" on:click="{signal: InsertItem, origin: \'domhud_attributes\', payload: {source: \'urn:tibet:attr_data_blank\', copy: true}}"></div>' +
                            '</span>' +
                        '</tibet:group>');

                newContentTPElem = aTileTPElem.setContent(contentElem);
                newContentTPElem.awaken();

                //  Set the resource of the model URI to the model object,
                //  telling the URI that it should observe changes to the model
                //  (which will allow us to get notifications from the URI which
                //  we're observing above) and to go ahead and signal change to
                //  kick things off.
                modelURI.setResource(
                    modelObj,
                    TP.hc('observeResource', true, 'signalChange', true));

                //  Position the tile
                aTileTPElem.setPagePosition(
                    TP.pc(centerElemPageRect.getX(), targetElemPageRect.getY()));

                this.set('$tileContentConstructed', true);

                (function() {
                    newContentTPElem.
                        focusAutofocusedOrFirstFocusableDescendant();
                }).queueForNextRepaint(aTileTPElem.getNativeWindow());
            }.bind(this);
    }

    //  Show the rule text in the tile. Note how we wrap the content with a span
    //  with a CodeMirror CSS class to make the styling work.
    TP.bySystemId('Sherpa').showTileAt(
        'DOMAttributes_Tile',
        target.getFullName() + ' Attributes',
        existedHandler,
        newHandler);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles when the user changes the value of the underlying model.
     * @param {ValueChange} aSignal The signal that caused this handler to trip.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var aspectPath,

        currentTarget,

        modelObj,

        nameAspectPath,
        valueAspectPath,

        name,
        value,

        allAttrNames,

        attrIndex,
        oldAttrName,

        removedData;

    aspectPath = aSignal.at('aspect');

    //  If the whole value changed, we're not interested.
    if (aspectPath === 'value') {
        return this;
    }

    //  Make sure we have a valid current target.
    currentTarget = this.get('currentTarget');
    if (TP.notValid(currentTarget)) {
        return this;
    }

    //  Grab an ordered list of all of the attribute names.
    allAttrNames = this.get('$attributeNames');

    //  If the action is TP.UPDATE, then the user added an attribute or changed
    //  one of the existing attributes. Note that we don't concern ourselves
    //  with an action of TP.INSERT/TP.CREATE, because that means that the user
    //  has clicked the '+' button to insert a new attribute row, but hasn't
    //  filled out the name and value and we don't want to process blank
    //  attributes..
    if (aSignal.at('action') === TP.UPDATE) {

        //  Grab the model object where our data is located.
        modelObj = TP.uc('urn:tibet:dom_attr_source').getResource().get('result');

        //  Compute a name aspect path by replacing 'tagAttrValue' with
        //  'tagAttrName' in the value aspect path.
        nameAspectPath = aspectPath.slice(0, aspectPath.lastIndexOf('.') + 1) +
                            'tagAttrName';
        valueAspectPath = aspectPath.slice(0, aspectPath.lastIndexOf('.') + 1) +
                            'tagAttrValue';

        //  Grab the name and value from the model.
        name = modelObj.get(nameAspectPath);
        value = modelObj.get(valueAspectPath);

        //  If we're changing the attribute name, but we have an empty value,
        //  then just exit here - no sense in doing a 'set'
        if (aspectPath.endsWith('tagAttrName') && TP.isEmpty(value)) {
            return this;
        }

        //  If we're changing the attribute name at this point (with an
        //  attribute that has a real value)
        if (aspectPath.endsWith('tagAttrName')) {

            //  Slice out the index, convert it to a number and get the
            //  attribute name at that index in our list of all attribute names.
            //  This will tell us the old attribute name.
            attrIndex = aspectPath.slice(
                        aspectPath.indexOf('[') + 1,
                        aspectPath.indexOf(']'));
            attrIndex = attrIndex.asNumber();
            oldAttrName = allAttrNames.at(attrIndex);

            //  If we got one, remove the attribute at that position.
            if (TP.notEmpty(oldAttrName)) {
                currentTarget.removeAttribute(oldAttrName);
            }

            //  Replace the old name with the new name in our list of
            //  attributes.
            allAttrNames.replace(oldAttrName, name);

            //  Set the value using the new name.
            currentTarget.setAttribute(name, value);

        } else {

            //  Set the attribute named by the name to the value
            if (!currentTarget.hasAttribute(name)) {
                allAttrNames.push(name);
            }

            //  Set the value using the computed name and value.
            currentTarget.setAttribute(name, value);
        }
    } else if (aSignal.at('action') === TP.DELETE) {

        //  If we're deleting an attribute (because the user clicked an 'X'),
        //  then grab the removed data's 'name' value and remove the
        //  corresponding attribute.
        removedData = aSignal.at('removedData');
        if (TP.isValid(removedData)) {
            name = removedData.at('tagAttrs').at('tagAttrName');

            //  Remove the name from our list of attribute names.
            allAttrNames.remove(name);

            //  Remove the attribute itself.
            currentTarget.removeAttribute(name);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
