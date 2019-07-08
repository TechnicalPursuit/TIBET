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
 * @type {TP.sherpa.manipulator}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('manipulator');

//  This type is intended to be used as a supertype of concrete types, so we
//  don't allow instance creation
TP.sherpa.manipulator.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.manipulator.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    tpElem.setup();

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.manipulator.Inst.defineAttribute('$currentTargetTPElement');
TP.sherpa.manipulator.Inst.defineAttribute('$currentModifyingRule');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.manipulator.Inst.defineMethod('activate',
function(aTargetTPElem) {

    /**
     * @method activate
     * @summary Activates the receiver.
     * @param {TP.dom.ElementNode} aTargetTPElem The element that the receiver
     *     will be activated on.
     * @returns {TP.sherpa.manipulator} The receiver.
     */

    this.setAttribute('hidden', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.manipulator.Inst.defineMethod('deactivate',
function() {

    /**
     * @method deactivate
     * @summary Deactivates the receiver.
     * @returns {TP.sherpa.manipulator} The receiver.
     */

    this.setAttribute('hidden', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.manipulator.Inst.defineHandler('DOMDragMove',
function(aSignal) {

    /**
     * @method handleDOMDragMove
     * @summary Handles notification of when the receiver might need to be
     *     updated because the user is dragging.
     * @param {TP.sig.DOMDragMove} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.manipulator} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.manipulator.Inst.defineHandler('DOMDragUp',
function(aSignal) {

    /**
     * @method handleDOMDragUp
     * @summary Handles notification of when the receiver might need to be
     *     updated because the user is done with dragging and the mouse button
     *     has gone up.
     * @param {TP.sig.DOMDragUp} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.manipulator} The receiver.
     */

    this.deactivate();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.manipulator.Inst.defineHandler('DOMResize',
function(aSignal) {

    /**
     * @method handleDOMResize
     * @summary Handles notifications of document size changes from the overall
     *     canvas that the halo is working with.
     * @param {TP.sig.DOMResize} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.manipulator} The receiver.
     */

    //  If we're not hidden, then we move and resize to the halo's target. It's
    //  size and position might very well have changed due to resizing changes
    //  in the document.
    if (TP.isFalse(this.getAttribute('hidden'))) {
        this.render();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.manipulator.Inst.defineHandler('DOMScroll',
function(aSignal) {

    /**
     * @method handleDOMScroll
     * @summary Handles notifications of document scrolling changes from the
     *     overall canvas that the manipulator is working with.
     * @param {TP.sig.DOMScroll} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.manipulator} The receiver.
     */

    //  If we're not hidden, then we move and resize to the halo's target. It's
    //  size and position might very well have changed due to scrolling changes
    //  in the document.
    if (TP.isFalse(this.getAttribute('hidden'))) {
        this.render();
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.manipulator.Inst.defineHandler('PclassClosedChange',
function(aSignal) {

    /**
     * @method handlePclassClosedChangeFromSherpaHUD
     * @summary Handles notifications of HUD closed change signals.
     * @param {TP.sig.PclassClosedChange} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.manipulator} The receiver.
     */

    var hudIsClosed;

    //  Grab the HUD and see if it's currently open or closed.
    hudIsClosed = TP.bc(aSignal.getOrigin().getAttribute('closed'));

    //  If the HUD is closed, then we also hide ourself. But not before
    //  capturing whether we were 'currently showing' or not (i.e. the HUD can
    //  hide or show independent of us). Otherwise, if the HUD is open, then
    //  we set ourself to whatever value we had when the HUD last hid.
    if (hudIsClosed) {
        this.toggleObservations(false);
    } else {
        this.toggleObservations(true);
    }

    return this;
}, {
    origin: 'SherpaHUD'
});

//  ------------------------------------------------------------------------

TP.sherpa.manipulator.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver. At this type level, this method does
     *     nothing.
     * @returns {TP.sherpa.manipulator} The receiver.
     */

    //  Signal to observers that this control has rendered.
    this.signal('TP.sig.DidRender');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.manipulator.Inst.defineMethod('setAttrHidden',
function(beHidden) {

    /**
     * @method setAttrHidden
     * @summary Sets the 'hidden' attribute of the receiver. This causes the
     *     halo to show or hide itself independent of whether it's focused or
     *     not.
     * @param {Boolean} beHidden Whether or not the halo should be hidden.
     * @returns {Boolean} Whether the receiver's state is hidden.
     */

    var wasHidden,

        toolsLayer,

        haloTPElem,
        targetTPElem,

        stylesHUD,
        sherpaMain,

        modifyingRule,

        generatorTPElem,

        generatorType,
        targetType,

        ruleSelector,

        targetElem,
        sherpaID,
        targetDoc,

        matches,

        generatorSheet,

        newRuleIndex;

    wasHidden = TP.bc(this.getAttribute('hidden'));

    if (wasHidden === beHidden) {
        //  Exit here - no need to call up to our supertype to toggle the
        //  attribute, since it already has the value we desire.
        return wasHidden;
    }

    //  Need to 'call up' to make sure the attribute value is actually captured.
    this.callNextMethod();

    toolsLayer = TP.bySystemId('Sherpa').getToolsLayer();

    haloTPElem = TP.byId('SherpaHalo', this.getNativeDocument());

    targetTPElem = haloTPElem.get('currentTargetTPElem');

    //  If we don't have a valid target element, then we exit here *without
    //  calling up to our supertype*. We don't want the attribute to be
    //  toggled, but we don't have valid target to show the halo on.
    if (TP.notValid(targetTPElem)) {
        return this;
    }

    if (TP.isTrue(beHidden)) {

        this.$set('$currentTargetTPElement', null);
        this.$set('$currentModifyingRule', null);

        this.ignore(TP.core.Mouse, 'TP.sig.DOMDragMove');
        this.ignore(TP.core.Mouse, 'TP.sig.DOMDragUp');

        this.ignore(this.getDocument(),
                    TP.ac('TP.sig.DOMResize', 'TP.sig.DOMScroll'));
        this.ignore(TP.sys.getUICanvas().getDocument(),
                    TP.ac('TP.sig.DOMResize', 'TP.sig.DOMScroll'));

        toolsLayer.removeAttribute('activetool');

    } else {

        stylesHUD = TP.byId('StylesHUD', TP.win('UIROOT'));
        sherpaMain = TP.bySystemId('Sherpa');

        //  Try to obtain a 'modifying rule' that we can use to manipulate.
        modifyingRule = stylesHUD.getModifiableRule(true);
        if (TP.notValid(modifyingRule)) {
            //  Grab the nearest 'generator' element to the target element. This
            //  will be the element (usually a CustomTag) that would have
            //  generated the target element (and which could be the target
            //  element itself).
            generatorTPElem = targetTPElem.getNearestHaloGenerator();
            if (TP.notValid(generatorTPElem)) {
                //  TODO: Raise an exception.
                return;
            }

            //  Compute a unique selector for the targeted element
            generatorType = generatorTPElem.getType();
            targetType = targetTPElem.getType();

            //  First, we scope it by the generator type.
            ruleSelector = generatorType.get('nsPrefix') + '|' +
                            generatorType.get('localName');

            //  With a descendant selector
            ruleSelector += ' ';

            //  Then, add a selector for the tag target itself, which will
            //  depend on whether we're using an XHTML 'translated' tag or an
            //  XML namespaced tag.
            if (generatorTPElem.getNativeNode().namespaceURI ===
                TP.w3.Xmlns.XHTML) {
                ruleSelector += '*[tibet|tag="' +
                                targetType.get('nsPrefix') + ':' +
                                targetType.get('localName');
                                '"]';
            } else {
                ruleSelector += targetType.get('nsPrefix') + '|' +
                                targetType.get('localName');
            }

            targetElem = targetTPElem.getNativeNode();

            sherpaID = TP.elementGetAttribute(targetElem, 'sherpaID', true);
            if (TP.isEmpty(sherpaID)) {
                //  Generate a unique ID for the target element, but do *not*
                //  assign it because we want to use it for a different,
                //  attribute, not 'id'. 'id' attributes have a special XML-ish
                //  meaning and are stripped before the document is saved and we
                //  want this one to persist.
                sherpaID = TP.elemGenID(targetElem, false);

                targetTPElem.setAttribute('sherpaID', sherpaID);

                setTimeout(
                    function() {
                        //  Manually update the canvas source of the target
                        //  element. Because we're in the midst of a D&D
                        //  operation, mutation observers will have been
                        //  temporarily suspended. Therefore, we do this
                        //  manually.
                        sherpaMain.updateUICanvasSource(
                            TP.ac(targetElem),
                            targetElem.parentNode,
                            TP.CREATE,
                            'sherpaID',
                            sherpaID,
                            null);
                    }, 10);
            }

            //  Add the SherpaID as an attribute selector.
            ruleSelector += '[sherpaID="' + sherpaID + '"]';

            targetDoc = targetTPElem.getNativeDocument();

            //  Make sure that the newly generated selector matches (and matches
            //  *only*) the target element.
            matches = TP.byCSSPath(
                            ruleSelector, targetDoc, false, false);
            if (matches.getSize() === 1 &&
                matches.first() === targetElem) {

                //  The match was successful - and we only matched the target
                //  element. Generate a new rule into the stylesheet using our
                //  computed selector.

                //  Grab the style sheet for the generator.
                generatorSheet = generatorTPElem.
                                    getStylesheetForStyleResource();

                //  Create a new rule and add it to the end of the stylesheet.
                newRuleIndex = TP.styleSheetInsertRule(generatorSheet,
                                                        ruleSelector,
                                                        '',
                                                        null,
                                                        true);

                modifyingRule = generatorSheet.cssRules[newRuleIndex];
            }
        }

        //  We immediately got a modifiable rule.
        if (TP.isValid(modifyingRule)) {
            this.$set('$currentTargetTPElement', targetTPElem);
            this.$set('$currentModifyingRule', modifyingRule);

            this.observe(TP.core.Mouse, 'TP.sig.DOMDragMove');
            this.observe(TP.core.Mouse, 'TP.sig.DOMDragUp');

            this.observe(this.getDocument(),
                            TP.ac('TP.sig.DOMResize', 'TP.sig.DOMScroll'));
            this.observe(TP.sys.getUICanvas().getDocument(),
                            TP.ac('TP.sig.DOMResize', 'TP.sig.DOMScroll'));

            toolsLayer.setAttribute('activetool', this.getLocalID());

            this.render();
        }
    }

    //  Need to 'call up' to make sure the attribute value is actually captured.
    return beHidden;
});

//  ------------------------------------------------------------------------

TP.sherpa.manipulator.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.sherpa.manipulator} The receiver.
     */

    this.observe(TP.byId('SherpaHUD', this.getNativeDocument()),
                    'PclassClosedChange');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.manipulator.Inst.defineMethod('toggleObservations',
function(shouldObserve) {

    /**
     * @method toggleObservations
     * @summary Either observe or ignore the signals that the receiver needs to
     *     function.
     * @param {Boolean} shouldObserve Whether or not we should be observing (or
     *     ignoring) signals.
     * @returns {TP.sherpa.manipulator} The receiver.
     */

    if (shouldObserve) {
        this.observe(TP.byId('SherpaHalo', this.getNativeDocument()),
                        TP.ac('TP.sig.HaloDidFocus', 'TP.sig.HaloDidBlur'));

    } else {
        this.ignore(TP.byId('SherpaHalo', this.getNativeDocument()),
                        TP.ac('TP.sig.HaloDidFocus', 'TP.sig.HaloDidBlur'));
    }

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
