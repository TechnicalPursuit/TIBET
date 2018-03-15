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
 * @type {TP.xctrls.curtain}
 * @summary Manages curtain XControls.
 */

//  ------------------------------------------------------------------------

TP.xctrls.TemplatedTag.defineSubtype('xctrls:curtain');

//  Note how this property is TYPE_LOCAL, by design.
TP.xctrls.curtain.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  xctrls:curtain controls are initially hidden, so we ensure that here.
TP.xctrls.curtain.set('requiredAttrs', TP.hc('pclass:hidden', true));

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.xctrls.curtain.Type.defineMethod('getSystemCurtainFor',
function(aTPDocument, aCurtainID) {

    /**
     * @method getSystemCurtainFor
     * @summary Returns (and, if necessary, creates) a 'shared system curtain'
     *     for use by the system on the supplied TP.core.Document.
     * @param {TP.core.Document} aTPDocument The document to create the curtain
     *     in, if it can't be found. Note that, in this case, the curtain will
     *     be created as the last child of the document's 'body' element.
     * @param {String} [aCurtainID=systemCurtain] The ID to use to query for the
     *     system curtain.
     * @returns {TP.xctrls.curtain} The system curtain on the supplied
     *     TP.core.Document.
     */

    var tpDocBody,
        curtainID,
        curtainElem,
        curtainTPElem;

    if (TP.notValid(aTPDocument)) {
        return TP.raise(this, 'TP.sig.InvalidParameter');
    }

    curtainID = TP.ifInvalid(aCurtainID, 'systemCurtain');

    curtainElem = aTPDocument.get('//*[@id="' + curtainID + '"]');

    //  If the 'get' expression above didn't find one, it hands back an empty
    //  Array. Otherwise it will hand back the TP.dom.ElementNode that
    //  represents the curtain.
    if (TP.isEmpty(curtainElem)) {

        tpDocBody = aTPDocument.getBody();

        if (TP.isValid(tpDocBody)) {

            curtainElem = TP.elem('<xctrls:curtain id="' + curtainID + '"/>');

            curtainTPElem = tpDocBody.insertContent(
                                    curtainElem,
                                    TP.BEFORE_END,
                                    TP.hc('doc', aTPDocument.getNativeNode()));
        }
    }

    return curtainTPElem;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.curtain.Inst.defineHandler('DOMUISignal',
function(aSignal) {

    /**
     * @method handleDOMUISignal
     * @summary Handles notifications of a variety of mouse and key signals.
     * @param {TP.sig.DOMUISignal} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.xctrls.curtain} The receiver.
     */

    aSignal.preventDefault();
    aSignal.stopPropagation();

    return this;
}, {
    phase: TP.CAPTURING
});

//  ------------------------------------------------------------------------

TP.xctrls.curtain.Inst.defineHandler('DOMDragMove',
function(aSignal) {

    /**
     * @method handleDOMDragMove
     * @summary Handles notifications of 'drag move' signals.
     * @param {TP.sig.DOMDragMove} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.xctrls.curtain} The receiver.
     */

    //  NB: Unlike the trap for all of the other UI signals, we allow 'drag
    //  move' to pass, since otherwise drag will be jittery for things like
    //  dialog panels that overlay the curtain.
    return this;
}, {
    phase: TP.CAPTURING
});

//  ------------------------------------------------------------------------

TP.xctrls.curtain.Inst.defineMethod('setAttrHidden',
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

        trappedSignalNames;

    wasHidden = TP.bc(this.getAttribute('hidden'));

    if (wasHidden === beHidden) {
        //  Exit here - no need to call up to our supertype to toggle the
        //  attribute, since it already has the value we desire.
        return this;
    }

    //  Set up a capturing handler that will capture the following signals:
    trappedSignalNames =
        TP.ac(
            'TP.sig.DOMClick',
            'TP.sig.DOMDblClick',

            'TP.sig.DOMContextMenu',

            'TP.sig.DOMKeyDown',
            'TP.sig.DOMKeyPress',
            'TP.sig.DOMKeyUp',

            'TP.sig.DOMMouseDown',
            'TP.sig.DOMMouseEnter',
            'TP.sig.DOMMouseLeave',
            'TP.sig.DOMMouseMove',
            'TP.sig.DOMMouseOut',
            'TP.sig.DOMMouseOver',
            'TP.sig.DOMMouseUp',
            'TP.sig.DOMMouseWheel',
            'TP.sig.DOMMouseHover',

            'TP.sig.DOMFocus',
            'TP.sig.DOMBlur',

            'TP.sig.DOMCut',
            'TP.sig.DOMCopy',
            'TP.sig.DOMPaste',

            'TP.sig.DOMScroll',

            'TP.sig.DOMFocusIn',
            'TP.sig.DOMFocusOut',

            'TP.sig.DOMKeyDown',
            'TP.sig.DOMKeyPress',
            'TP.sig.DOMKeyUp',
            'TP.sig.DOMModifierKeyChange',

            'TP.sig.DOMDragDown',
            'TP.sig.DOMDragMove',
            'TP.sig.DOMDragOut',
            'TP.sig.DOMDragOver',
            'TP.sig.DOMDragUp',
            'TP.sig.DOMDragHover'
        );

    //  If we're hiding, ignore those signals.
    if (TP.isTrue(beHidden)) {
        this.ignore(
            this,
            trappedSignalNames,
            null,
            TP.sig.SignalMap.REGISTER_CAPTURING);
    } else {
        //  If we're showing, observe those signals.
        this.observe(
            this,
            trappedSignalNames,
            null,
            TP.sig.SignalMap.REGISTER_CAPTURING);
    }

    //  Need to 'call up' to make sure the attribute value is actually captured.
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
