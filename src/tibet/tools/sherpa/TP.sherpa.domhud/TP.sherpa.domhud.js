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

TP.sherpa.focusablesidebar.defineSubtype('domhud');

TP.sherpa.domhud.addTraits(TP.core.D3Tag);

TP.sherpa.domhud.Inst.defineAttribute('highlighted');

TP.sherpa.domhud.Inst.defineAttribute('listcontent',
    TP.cpc('> .content', TP.hc('shouldCollapse', true)));

TP.sherpa.domhud.Inst.defineAttribute('listitems',
    TP.cpc('> .content > li', TP.hc('shouldCollapse', false)));

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

    tpElem.setup();

    return;
});

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
     * @return {TP.sherpa.domhud} The receiver.
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
     * @return {TP.sherpa.domhud} The receiver.
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

TP.sherpa.domhud.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @return {TP.sherpa.domhud} The receiver.
     */

    this.observe(TP.byId('SherpaHUD', this.getNativeDocument()),
                            'ClosedChange');

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

    var newContent;

    newContent = enterSelection.append('li');
    newContent.attr(
            'pclass:selected',
            function(d) {
                if (TP.isValid(d[2])) {
                    if (d[2] === 'target') {
                        return true;
                    }
                }
            }).attr('child',
            function(d) {
                if (TP.isValid(d[2])) {
                    if (d[2] === 'child') {
                        return true;
                    }
                }
            }).attr(
            'title',
            function(d) {
                return d[1];
            }).attr(
            'peerID',
            function(d, i) {
                return d[0];
            }).text(
            function(d) {
                return d[1];
            });

    return newContent;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineMethod('getKeyFunction',
function() {

    /**
     * @method getKeyFunction
     * @summary Returns the Function that should be used to generate keys into
     *     the receiver's data set.
     * @description This Function should take a single argument, an individual
     *     item from the receiver's data set, and return a value that will act
     *     as that item's key in the overall data set. The default version
     *     returns the item itself.
     * @returns {Function} A Function that provides a key for the supplied data
     *     item.
     */

    var keyFunc;

    keyFunc =
        function(d) {
            return d[0];
        };

    return keyFunc;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineMethod('getRootUpdateSelection',
function(containerSelection) {

    /**
     * @method getRootUpdateSelection
     * @summary Creates the 'root' update selection that will be used as the
     *     starting point to begin d3.js drawing operations.
     * @param {TP.extern.d3.selection} containerSelection The selection made by
     *     having d3.js select() the receiver's 'selection container'.
     * @returns {TP.extern.d3.Selection} The receiver.
     */

    return containerSelection.selectAll('li');
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineMethod('getSelectionContainer',
function() {

    /**
     * @method getSelectionContainer
     * @summary Returns the Element that will be used as the 'root' to
     *     add/update/remove content to/from using d3.js functionality. By
     *     default, this returns the receiver's native Element.
     * @returns {Element} The element to use as the container for d3.js
     *     enter/update/exit selections.
     */

    return TP.unwrap(this.get('listcontent'));
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
                if (TP.isValid(d[2])) {
                    if (d[2] === 'target') {
                        return true;
                    }
                }
            }).attr('child',
            function(d) {
                if (TP.isValid(d[2])) {
                    if (d[2] === 'child') {
                        return true;
                    }
                }
            }).attr(
            'title',
            function(d) {
                return d[1];
            }).attr(
            'peerID',
            function(d, i) {
                return d[0];
            }).text(
            function(d) {
                return d[1];
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
     * @return {TP.sherpa.domhud} The receiver.
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

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('FocusHalo',
function(aSignal) {

    /**
     * @method handleFocusHalo
     * @summary Handles notifications of when the receiver wants to focus the
     *     halo.
     * @param {TP.sig.FocusHalo} aSignal The TIBET signal which triggered this
     *     method.
     * @return {TP.sherpa.domhud} The receiver.
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
     * @return {TP.sherpa.domhud} The receiver.
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

TP.sherpa.domhud.Inst.defineHandler('HaloDidFocus',
function(aSignal) {

    /**
     * @method handleHaloDidFocus
     * @summary Handles notifications of when the halo focuses on an object.
     * @param {TP.sig.HaloDidFocus} aSignal The TIBET signal which triggered
     *     this method.
     * @return {TP.sherpa.domhud} The receiver.
     */

    var haloTarget;

    haloTarget = aSignal.at('haloTarget');

    this.focusOnTarget(haloTarget);

    this.observe(TP.sys.getUICanvas().getDocument(),
                    TP.ac('TP.sig.MutationAttach',
                            'TP.sig.MutationDetach'));

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
     * @return {TP.sherpa.domhud} The receiver.
     */

    this.focusOnUICanvasRoot();

    this.ignore(TP.sys.getUICanvas().getDocument(),
                    TP.ac('TP.sig.MutationAttach',
                            'TP.sig.MutationDetach'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('MutationAttach',
function(aSignal) {

    /**
     * @method handleMutationAttach
     * @summary Handles notifications of node attachment from the current UI
     *     canvas.
     * @param {TP.sig.MutationAttach} aSignal The TIBET signal which triggered
     *     this method.
     * @return {TP.sherpa.domhud} The receiver.
     */

    var halo,
        haloTarget;

    halo = TP.byId('SherpaHalo', this.getNativeDocument());
    haloTarget = halo.get('currentTargetTPElem');

    this.focusOnTarget(haloTarget);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud.Inst.defineHandler('MutationDetach',
function(aSignal) {

    /**
     * @method handleMutationDetach
     * @summary Handles notifications of node detachment from the current UI
     *     canvas.
     * @param {TP.sig.MutationDetach} aSignal The TIBET signal which triggered
     *     this method.
     * @return {TP.sherpa.domhud} The receiver.
     */

    var halo,
        haloTarget;

    halo = TP.byId('SherpaHalo', this.getNativeDocument());
    haloTarget = halo.get('currentTargetTPElem');

    this.focusOnTarget(haloTarget);

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
     *     the canvas gets a 'hud-highlight' class addd/removed.
     * @param {TP.sig.Signal} aSignal The over/out signal with the target.
     * @return {TP.sherpa.domhud} The receiver.
     */

    var targetElem,
        peerID,
        target;

    target = this.get('highlighted');

    //  If target then we're leaving...clear and exit.
    if (TP.isValid(target)) {
        TP.elementRemoveClass(target, 'hud-highlight');
        this.$set('highlighted', null, false);
        return;
    }

    targetElem = aSignal.getDOMTarget();
    peerID = TP.elementGetAttribute(targetElem, 'peerID', true);

    if (TP.isEmpty(peerID)) {
        return this;
    }

    target = TP.byId(peerID);
    if (TP.notValid(target)) {
        return this;
    }

    target = target.getNativeNode();
    TP.elementAddClass(target, 'hud-highlight');
    this.$set('highlighted', target, false);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
