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
 * @type {TP.xctrls.tabbar}
 */

//  ------------------------------------------------------------------------

TP.xctrls.itemset.defineSubtype('xctrls:tabbar');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  Signals that we don't allow to bubble outside of ourself. Since we can
//  process the states associated with these signals, we don't want them to
//  proceed further up the chain.
TP.xctrls.tabbar.Type.defineAttribute('opaqueBubblingSignalNames',
        TP.ac(
            'TP.sig.UIActivate',
            'TP.sig.UIDeactivate',

            'TP.sig.UIDeselect',
            'TP.sig.UISelect',

            'TP.sig.UIDisabled',
            'TP.sig.UIEnabled'
            ));

/**
 * The tag name of the tag to use for each item if there is no template.
 * @type {String}
 */
TP.xctrls.tabbar.Type.defineAttribute('defaultItemTagName',
                                        'xctrls:tabitem');

/**
 * Whether or not the tag wants 'close mark' elements to allow individual
 * items to be closed (i.e. removed)
 * @type {String}
 */
TP.xctrls.tabbar.Type.defineAttribute('wantsCloseMarks', true);

//  ------------------------------------------------------------------------

TP.xctrls.tabbar.Inst.defineMethod('buildAdditionalContent',
function(anElement) {

    /**
     * @method buildAdditionalContent
     * @summary Builds additional content onto the supplied element, which will
     *     be an individual item when rendering *new* repeating content in the
     *     receiver's rendering pipeline.
     * @param {Element} anElement The newly created item element. Note that this
     *     will *already* have been placed in the visual DOM.
     * @returns {TP.xctrls.tabbar} The receiver.
     */

    if (this.hasAttribute('draggable')) {
        if (!TP.isArray(this.get('data'))) {
            TP.ifWarn() ?
                TP.warn('Unable to configure ' + this.getLocalID() +
                            ' as draggable. Source is not an Array.') : 0;
            return this;
        }

        TP.elementSetAttribute(anElement, 'drag:mover', 'true', true);

        //  Depending on whether we're vertical or not, we set up different drag
        //  constraining functions.
        if (this.getAttribute('orientation') === 'vertical') {
            TP.elementSetAttribute(
                anElement,
                'drag:constraints',
                'CLAMP_Y_TO_OFFSET_PARENT LOCK_X_TO_START_X', true);
        } else {
            TP.elementSetAttribute(
                anElement,
                'drag:constraints',
                'CLAMP_X_TO_OFFSET_PARENT LOCK_Y_TO_START_Y', true);
        }
    }

    return this;
});

//  ========================================================================
//  TP.xctrls.tabitem
//  ========================================================================

TP.xctrls.item.defineSubtype('xctrls:tabitem');

//  Note how this property is TYPE_LOCAL, by design.
TP.xctrls.tabitem.defineAttribute('styleURI', TP.NO_RESULT);
TP.xctrls.tabitem.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

TP.xctrls.tabitem.Type.defineAttribute('opaqueCapturingSignalNames',
        TP.ac('TP.sig.DOMMouseDown',
                'TP.sig.DOMMouseUp',
                'TP.sig.DOMMouseOver',
                'TP.sig.DOMMouseOut',
                'TP.sig.DOMFocus',
                'TP.sig.DOMBlur'));

//  ------------------------------------------------------------------------

TP.xctrls.tabitem.Inst.defineMethod('didMove',
function(normalizedEvent) {

    /**
     * @method didMove
     * @summary Informs the receiver that it did move as part of a drag
     *     operation.
     * @param {Event} normalizedEvent The native event containing the signal's
     *     raw data.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var thisref,

        tabbar,

        getter,

        dropCoord,

        data,

        item,

        allItems,
        currentIndex,
        newIndex,

        allItemRectCoords,

        len,
        i,

        elem;

    thisref = this;

    tabbar = this.getItemHolder();
    if (tabbar.hasAttribute('draggable')) {

        //  Depending on whether we're vertical or not, we use a different
        //  getter to get the coordinate to test.
        if (tabbar.getAttribute('orientation') === 'vertical') {
            getter = 'getY';
        } else {
            getter = 'getX';
        }

        dropCoord = this.getOffsetRect()[getter]();

        allItems = tabbar.getAllItems();
        currentIndex = allItems.indexOf(this);
        newIndex = TP.NOT_FOUND;

        //  Filter out the receiver itself - we don't want to test it against
        //  itself ;-).
        allItems = allItems.select(
            function(anItem) {
                return anItem !== thisref;
            });

        allItemRectCoords = allItems.collect(
            function(anItem) {
                return anItem.getOffsetRect()[getter]();
            });

        //  Iterate over all of the gathered coordinates and test them against
        //  the coordinate that the receiver was dropped at.
        len = allItemRectCoords.getSize();
        for (i = 0; i < len; i++) {
            if (i === 0) {
                if (dropCoord <= allItemRectCoords.at(0)) {
                    newIndex = 0;
                    break;
                }
            } else if (i === len - 1) {
                if (dropCoord > allItemRectCoords.at(len - 1)) {
                    //  Note that we need to use 'len' here, not 'len - 1' since
                    //  we're computing the *data* index, not the index to the
                    //  number of visible items. We removed ourself from the
                    //  visible index above.
                    newIndex = len;
                    break;
                }
            }

            if (dropCoord > allItemRectCoords.at(i) &&
                dropCoord < allItemRectCoords.at(i + 1)) {
                newIndex = i + 1;
                break;
            }
        }

        //  We need to make a copy of the data, so that the change notification
        //  system will see this as having changed. Otherwise, mutating it
        //  directly will cause the comparison machinery in the change
        //  notification system to be looking at the same Array and none of the
        //  dependents will be notified.
        data = TP.copy(tabbar.getInboundAspect('data'));

        //  Splice out the item at its old index. This returns an Array.
        item = data.splice(currentIndex, 1).first();

        //  Splice it into it's new position.
        data.splice(newIndex, 0, item);

        //  Set the 'data' 'inbound aspect'. This means 'data' was bound using
        //  ':io' (:in may work but may warn).
        tabbar.setInboundAspect('data', data, true);

        if (tabbar.getAttribute('orientation') === 'vertical') {
            TP.elementPopAndSetStyleProperty(tabbar.getNativeNode(), 'height');
        } else {
            TP.elementPopAndSetStyleProperty(tabbar.getNativeNode(), 'width');
        }

        //  Restore all of the local style settings that we made in the willMove
        //  method so that we could actually move the tab.

        elem = this.getNativeNode();

        TP.elementPopAndSetStyleProperty(elem, 'position');
        TP.elementPopAndSetStyleProperty(elem, 'left');
        TP.elementPopAndSetStyleProperty(elem, 'top');
        TP.elementPopAndSetStyleProperty(elem, 'z-index');
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.xctrls.tabitem.Inst.defineMethod('willMove',
function(normalizedEvent) {

    /**
     * @method willMove
     * @summary Returns whether or not the receiver can be moved via a drag
     *     session.
     * @param {Event} normalizedEvent The native event containing the signal's
     *     raw data.
     * @returns {Boolean} Whether or not the receiver can be moved via a drag
     *     session.
     */

    var shouldMove,

        tabbar,

        height,
        width,

        elem,

        offsetPoint;

    shouldMove = this.callNextMethod();
    if (!shouldMove) {
        return false;
    }

    tabbar = this.getItemHolder();

    if (!tabbar.itemWasTemplated(this)) {
        return false;
    }

    if (tabbar.hasAttribute('draggable')) {

        if (tabbar.getAttribute('orientation') === 'vertical') {
            height = this.getOffsetParent().getHeight();
            TP.elementPushAndSetStyleProperty(
                    tabbar.getNativeNode(), 'height', height + 'px');
        } else {
            width = this.getOffsetParent().getWidth();
            TP.elementPushAndSetStyleProperty(
                    tabbar.getNativeNode(), 'width', width + 'px');
        }

        offsetPoint = this.getOffsetPoint();

        elem = this.getNativeNode();

        TP.elementPushAndSetStyleProperty(
                elem, 'position', 'absolute');
        TP.elementPushAndSetStyleProperty(
                elem, 'left', offsetPoint.getX() + 'px');
        TP.elementPushAndSetStyleProperty(
                elem, 'top', offsetPoint.getY() + 'px');
        TP.elementPushAndSetStyleProperty(
                elem, 'z-index', 'var(--tibet-DRAG-DROP-TIER)');
    }

    return shouldMove;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
