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

    tpElem.observe(TP.ANY, 'TP.sig.DOMDNDTerminate');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineAttribute('$currentDNDTarget');

TP.sherpa.domhud.Inst.defineAttribute('highlighted');

//  ------------------------------------------------------------------------
//  Instance Methods
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
            }
            info.push(arr);
        });

    //  List expects an array of arrays containing IDs and full names.
    this.setValue(info);

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
            TP.elementGetFullName(root));

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
                if (d[2] !== 'spacer') {
                    return d[0];
                }
            }).text(
            function(d) {
                if (d[2] !== 'spacer') {
                    return d[1];
                }
            }).attr(
            'class',
            function(d) {
                var val;

                val = 'item';

                if (d[2] === 'spacer') {
                    val += ' spacer';
                } else {
                    val += ' domnode';
                }

                return val;
            }).each(
            function(d, i) {
                if (d[2] === 'spacer') {
                    TP.elementSetAttribute(this, 'dnd:accept', 'tofu', true);
                } else {
                    TP.elementRemoveAttribute(this, 'dnd:accept', true);
                }
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
        newData.push(data.at(i), TP.ac('spacer', 'spacer', 'spacer'));
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
                if (d[2] !== 'spacer') {
                    return d[0];
                }
            }).text(
            function(d) {
                if (d[2] !== 'spacer') {
                    return d[1];
                }
            }).attr(
            'class',
            function(d) {
                var val;

                val = 'item';

                if (d[2] === 'spacer') {
                    val += ' spacer';
                } else {
                    val += ' domnode';
                }

                return val;
            }).each(
            function(d, i) {
                if (d[2] === 'spacer') {
                    TP.elementSetAttribute(this, 'dnd:accept', 'tofu', true);
                } else {
                    TP.elementRemoveAttribute(this, 'dnd:accept', true);
                }
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
        dndTargetElem;

    dndTargetTPElem = aSignal.getDOMTarget();
    dndTargetElem = TP.unwrap(dndTargetTPElem);

    this.set('$currentDNDTarget', dndTargetElem);

    //  Put a CSS class on the current drop target element for visual
    //  highlighting purposes
    TP.elementAddClass(dndTargetElem, 'sherpa_droptarget');

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
        dndTargetElem;

    dndTargetTPElem = aSignal.getDOMTarget();
    dndTargetElem = TP.unwrap(dndTargetTPElem);

    //  Remove the CSS class placed on the drop target and set the attribute we
    //  use to track the current DND target to null.
    TP.elementRemoveClass(dndTargetElem, 'sherpa_droptarget');
    this.set('$currentDNDTarget', null);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('DOMDNDTerminate',
function(aSignal) {

    /**
     * @method handleDOMDNDTerminate
     * @summary Handles when the drag and drop system terminates a dragging
     *     session.
     * @param {TP.sig.DOMDNDTerminate} aSignal The TIBET signal which triggered
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
        TP.elementRemoveClass(dndTargetElem, 'sherpa_droptarget');
        this.set('$currentDNDTarget', null);

        //  If the canvas document contains the target element, then we want to
        //  be the controller that does the possible insertion.
        if (this.contains(dndTargetElem, TP.IDENTITY)) {

            //  If the spacer DND target element has a next sibling, then try to
            //  get it's peerID and set the insertion position to
            //  TP.BEFORE_BEGIN.
            if (TP.isElement(dndTargetElem.nextSibling)) {
                //  We go to the item after us to determine the peerID
                peerID = TP.elementGetAttribute(
                            dndTargetElem.nextSibling,
                            'peerID',
                            true);
                insertionPosition = TP.BEFORE_BEGIN;
            }

            //  Couldn't find one after us - try the spacer DND target element
            //  before us.
            if (TP.isEmpty(peerID) &&
                TP.isElement(dndTargetElem.previousSibling)) {
                //  We go to the item before us to determine the peerID
                peerID = TP.elementGetAttribute(
                            dndTargetElem.previousSibling,
                            'peerID',
                            true);
                insertionPosition = TP.AFTER_END;
            }

            //  If we succesfully got a peerID, then get the Element it matches
            //  in the UI canvas DOM.
            if (TP.notEmpty(peerID)) {

                doc = TP.sys.uidoc(true);

                peerElem = TP.byId(peerID, doc, false);
                if (TP.isElement(peerElem)) {

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

        haloTarget,

        halo;

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
    haloTarget = TP.byId(peerID);

    halo = TP.byId('SherpaHalo', this.getNativeDocument());

    if (haloTarget !== halo.get('currentTargetTPElem')) {
        //  Blur and refocus the halo on the haloTarget.
        halo.blur();
        halo.focusOn(haloTarget);
    }

    halo.setAttribute('hidden', false);

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

        haloTarget,

        halo;

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
    haloTarget = TP.byId(peerID);

    halo = TP.byId('SherpaHalo', this.getNativeDocument());

    if (haloTarget !== halo.get('currentTargetTPElem')) {
        //  Blur and refocus the halo on the haloTarget.
        halo.blur();
        halo.focusOn(haloTarget);
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

    this.focusOnUICanvasRoot();

    this.ignore(TP.sys.getUICanvas().getDocument(),
                    TP.ac('TP.sig.MutationAttach',
                            'TP.sig.MutationDetach'));

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
     * @param {TP.sig.Signal} aSignal The over/out signal with the target.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var targetElem,
        peerID,
        target;

    target = this.get('highlighted');

    //  If target then we're leaving...clear and exit.
    if (TP.isValid(target)) {
        TP.elementRemoveClass(target, 'sherpa-hud-highlight');
        this.$set('highlighted', null, false);
        return;
    }

    targetElem = aSignal.getDOMTarget();
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

    target = target.getNativeNode();
    TP.elementAddClass(target, 'sherpa-hud-highlight');
    this.$set('highlighted', target, false);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
