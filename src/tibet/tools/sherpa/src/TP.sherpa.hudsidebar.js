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
 * @type {TP.sherpa.popup}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('hudsidebar');

//  This type is intended to be used as a supertype of concrete types, so we
//  don't allow instance creation
TP.sherpa.hudsidebar.isAbstract(true);

TP.sherpa.hudsidebar.addTraits(TP.core.D3Tag);

TP.sherpa.hudsidebar.Inst.defineAttribute('listcontent',
    TP.cpc('> .content', TP.hc('shouldCollapse', true)));

TP.sherpa.hudsidebar.Inst.defineAttribute('listitems',
    TP.cpc('> .content > li', TP.hc('shouldCollapse', false)));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    TP.wrap(elem).setup();

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Type.defineMethod('tagDetachDOM',
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
        //  TODO: Raise an exception.
        return;
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

TP.sherpa.hudsidebar.Inst.defineAttribute('$isRecasting');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineMethod('focusOnTarget',
function(aTPElement) {

    /**
     * @method focusOnTarget
     * @summary Focuses the receiver onto the supplied target.
     * @param {TP.core.UIElementNode} aTPElement The element to focus the
     *     receiver on.
     * @returns {TP.sherpa.hudsidebar} The receiver.
     */

    TP.override();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineHandler('CanvasChanged',
function(aSignal) {

    /**
     * @method handleCanvasChanged
     * @summary Handles notifications of the canvas changing from the Sherpa
     *     object.
     * @param {TP.sig.CanvasChanged} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.hudsidebar} The receiver.
     */

    var halo,
        haloTarget;

    if (this.get('$isRecasting')) {
        return this;
    }

    halo = TP.byId('SherpaHalo', this.getNativeDocument());
    haloTarget = halo.get('currentTargetTPElem');

    this.focusOnTarget(haloTarget);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineHandler('ClosedChange',
function(aSignal) {

    /**
     * @method handleClosedChange
     * @summary Handles notifications of HUD closed change signals.
     * @param {TP.sig.ClosedChange} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.hudsidebar} The receiver.
     */

    return this;
}, {
    origin: 'SherpaHUD'
});

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineHandler('HaloDidFocus',
function(aSignal) {

    /**
     * @method handleHaloDidFocus
     * @summary Handles notifications of when the halo focuses on an object.
     * @param {TP.sig.HaloDidFocus} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.hudsidebar} The receiver.
     */

    var haloTarget,

        sherpaInst;

    haloTarget = aSignal.at('haloTarget');

    this.focusOnTarget(haloTarget);

    sherpaInst = TP.bySystemId('Sherpa');
    this.observe(sherpaInst, 'CanvasChanged');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineHandler('HaloDidBlur',
function(aSignal) {

    /**
     * @method handleHaloDidBlur
     * @summary Handles notifications of when the halo blurs on an object.
     * @param {TP.sig.HaloDidBlur} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.hudsidebar} The receiver.
     */

    var sherpaInst;

    this.setValue(null);

    sherpaInst = TP.bySystemId('Sherpa');
    this.ignore(sherpaInst, 'CanvasChanged');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineHandler('NodeDidRecast',
function(aSignal) {

    /**
     * @method handleNodeDidRecast
     * @summary Handles notifications of when a node is finished being 'recast'
     *     by the TIBET tag processor. This allows the sidebar to provide
     *     feedback to the user that this is happening.
     * @param {TP.sig.NodeDidRecast} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.hudsidebar} The receiver.
     */

    var recastTPNode;

    this.set('$isRecasting', false);

    //  See if we can get a recasting target from the signal. If so, and it's a
    //  type of TP.core.Node, then focus ourself on it.
    recastTPNode = aSignal.at('recastTarget');
    if (TP.isKindOf(recastTPNode, TP.core.Node)) {
        this.focusOnTarget(recastTPNode);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineHandler('NodeWillRecast',
function(aSignal) {

    /**
     * @method handleNodeWillRecast
     * @summary Handles notifications of when a node is about to be 'recast' by
     *     the TIBET tag processor. This allows the sidebar to provide feedback
     *     to the user that this is happening.
     * @param {TP.sig.NodeWillRecast} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.hudsidebar} The receiver.
     */

    this.set('$isRecasting', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.sherpa.hudsidebar} The receiver.
     */

    this.observe(TP.byId('SherpaHalo', TP.win('UIROOT')),
                    TP.ac('TP.sig.HaloDidFocus', 'TP.sig.HaloDidBlur'));

    this.observe(TP.byId('SherpaHUD', this.getNativeDocument()),
                            'ClosedChange');

    this.observe(TP.ANY, TP.ac('NodeWillRecast', 'NodeDidRecast'));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineMethod('teardown',
function() {

    /**
     * @method teardown
     * @summary Tears down the receiver by performing housekeeping cleanup, like
     *     ignoring signals it's observing, etc.
     * @returns {TP.sherpa.hudsidebar} The receiver.
     */

    this.ignore(TP.byId('SherpaHalo', TP.win('UIROOT')), 'TP.sig.HaloDidFocus');
    this.ignore(TP.byId('SherpaHalo', TP.win('UIROOT')), 'TP.sig.HaloDidBlur');

    return this;
});

//  ------------------------------------------------------------------------
//  TP.core.D3Tag Methods
//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineMethod('buildNewContent',
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
                if (TP.isTrue(d[2])) {
                    return true;
                }

                //  Returning null will cause d3.js to remove the
                //  attribute.
                return null;
            }).attr(
            'indexInData',
            function(d, i) {
                return i;
            }).text(
            function(d) {
                return d[1];
            }).classed('item', true);

    return newContent;
});

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineMethod('getKeyFunction',
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
        function(d, i) {
            return d + '__' + i;
        };

    return keyFunc;
});

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.Inst.defineMethod('getRootUpdateSelection',
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

TP.sherpa.hudsidebar.Inst.defineMethod('getSelectionContainer',
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

TP.sherpa.hudsidebar.Inst.defineMethod('updateExistingContent',
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
                if (TP.isTrue(d[2])) {
                    return true;
                }

                //  Returning null will cause d3.js to remove the
                //  attribute.
                return null;
            }).attr(
            'indexInData',
            function(d, i) {
                return i;
            }).text(
            function(d) {
                return d[1];
            }).classed('item', true);

    return updateSelection;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
