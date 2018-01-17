//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ========================================================================

//  ========================================================================
//  TP.core.Node Additions
//  ========================================================================

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('haloCanBlur',
function(aHalo) {

    /**
     * @method haloCanBlur
     * @summary Returns whether or not the halo can blur (i.e. no longer focus
     *     on) the receiver.
     * @param {TP.sherpa.Halo} aHalo The halo that is requesting whether or not
     *     it can blur the receiver.
     * @returns {Boolean} Whether or not the halo can blur the receiver.
     */

    //  We return false here because, at this level, the halo should be neither
    //  focusing or blurring.
    return false;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('haloCanDelete',
function(aHalo) {

    /**
     * @method haloCanDelete
     * @summary Returns whether or not the halo can delete the receiver from its
     *     DOM tree.
     * @param {TP.sherpa.Halo} aHalo The halo that is requesting whether or not
     *     it can delete the receiver.
     * @returns {Boolean} Whether or not the halo can delete the receiver.
     */

    //  We return false here because, at this level, the halo should not be
    //  deleting.
    return false;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('haloCanEmpty',
function(aHalo) {

    /**
     * @method haloCanEmpty
     * @summary Returns whether or not the halo can empty the receiver from its
     *     DOM tree.
     * @param {TP.sherpa.Halo} aHalo The halo that is requesting whether or not
     *     it can empty the receiver.
     * @returns {Boolean} Whether or not the halo can empty the receiver.
     */

    //  We return false here because, at this level, the halo should not be
    //  emptying.
    return false;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('haloCanFocus',
function(aHalo) {

    /**
     * @method haloCanFocus
     * @summary Returns whether or not the halo can focus on the receiver.
     * @param {TP.sherpa.Halo} aHalo The halo that is requesting whether or not
     *     it can focus the receiver.
     * @returns {Boolean} Whether or not the halo can focus the receiver.
     */

    //  We return false here because, at this level, the halo should be neither
    //  focusing or blurring.
    return false;
});

//  ------------------------------------------------------------------------

TP.core.Node.Inst.defineMethod('hudCanDrop',
function(aHUD, droppingTPElem) {

    /**
     * @method hudCanDrop
     * @summary Returns whether or not the hud should allow the supplied element
     *     to be dropped into the receiver.
     * @param {TP.sherpa.hud} aHUD The hud that is requesting whether or not
     *     it can drop the supplied element into the receiver.
     * @param {TP.sherpa.hud} droppingTPElem The element that is being dropped.
     * @returns {Boolean} Whether or not the hud can drop the supplied target
     *     into the receiver.
     */

    //  We return false here because, at this level, the hud should not be
    //  allowing dropping into anything.
    return false;
});

//  ========================================================================
//  TP.core.ElementNode Additions
//  ========================================================================

TP.core.ElementNode.addTraits(TP.sherpa.ToolAPI);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getContentForInspector',
function(options) {

    /**
     * @method getContentForInspector
     * @summary Returns the source's content that will be hosted in an inspector
     *     bay.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the content. This will have the following keys, amongst
     *     others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     *          'bindLoc':          The URI location where the data for the
     *                              content can be found.
     * @returns {Element} The Element that will be used as the content for the
     *     bay.
     */

    var targetAspect,

        dataURI;

    targetAspect = options.at('targetAspect');

    if (targetAspect === 'Node Instance Data' ||
        targetAspect === 'Node Local Data') {
        dataURI = TP.uc(options.at('bindLoc'));

        return TP.elem(
                '<xctrls:list bind:in="{data: ' + dataURI.asString() + '}"/>');
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getDataForInspector',
function(options) {

    /**
     * @method getDataForInspector
     * @summary Returns the source's data that will be supplied to the content
     *     hosted in an inspector bay. In most cases, this data will be bound to
     *     the content using TIBET data binding. Therefore, when this data
     *     changes, the content will be refreshed to reflect that.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the data. This will have the following keys, amongst others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     *          'bindLoc':          The URI location where the data for the
     *                              content can be found.
     * @returns {Object} The data that will be supplied to the content hosted in
     *     a bay.
     */

    var targetAspect,

        data;

    targetAspect = options.at('targetAspect');

    if (targetAspect === this.getID()) {
        data = TP.ac(TP.ac('Node Type', 'Node Type'),
                        TP.ac('Node Instance Data', 'Node Instance Data'),
                        TP.ac('Node Local Data', 'Node Local Data'));
    } else if (targetAspect === 'Node Instance Data') {
        data = TP.ac();
        this.getKeys().sort().perform(
                    function(aKey) {
                        if (!TP.owns(this, aKey)) {
                            data.add(TP.ac(aKey, aKey));
                        }
                    }.bind(this));
    } else if (targetAspect === 'Node Local Data') {
        data = TP.ac();
        this.getKeys().sort().perform(
                    function(aKey) {
                        if (TP.owns(this, aKey)) {
                            data.add(TP.ac(aKey, aKey));
                        }
                    }.bind(this));
    } else {
        data = this.get(targetAspect);
        if (data === undefined) {
            data = 'undefined';
        } else if (data === null) {
            data = 'null';
        }
    }

    return data;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getEntryAt',
function(aSourceName) {

    /**
     * @method getEntryAt
     * @summary Returns the 'entry' in the receiver for the supplied source
     *     name. This will be the singular name used to register the entry.
     * @param {String} aSourceName The name of the entry to retrieve.
     * @returns {Object} The entry object registered under the supplied source
     *     name in the receiver.
     */

    var source;

    if (aSourceName === 'Node Type') {
        source = this.getType();
    } else {
        /* eslint-disable consistent-this */
        source = this;
        /* eslint-enable consistent-this */
    }

    return source;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getHaloParent',
function(aHalo) {

    /**
     * @method getHaloParent
     * @summary Returns the next 'haloable' ancestor element of the receiver.
     *     Not all ancestors in the receiver's ancestor chain are 'haloable'.
     * @param {TP.sherpa.Halo} aHalo The halo that is requesting the rectangle
     *     to use to display itself.
     * @returns {TP.core.ElementNode} The next haloable ancestor of the
     *     receiver.
     */

    var parentElem;

    if (TP.isElement(parentElem = this.getNativeNode().parentNode)) {
        return TP.wrap(parentElem);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getHaloRect',
function(aHalo) {

    /**
     * @method getHaloRect
     * @summary Returns the rectangle that the halo can use to display itself
     *     when it has the receiver selected. At this level, this method returns
     *     an empty TP.core.Rect.
     * @param {TP.sherpa.Halo} aHalo The halo that is requesting the rectangle
     *     to use to display itself.
     * @returns {TP.core.Rect} The rectangle that the halo will use to display
     *     itself.
     */

    return TP.rtc(0, 0, 0, 0);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getNearestHaloFocusable',
function(aHalo) {

    /**
     * @method getNearestHaloFocusable
     * @summary Returns the next focusable (by the halo ) ancestor element of
     *     the receiver. Not all ancestors in the receiver's ancestor chain are
     *     'focusable' by the halo. Only ones that respond true to haloCanFocus
     *     are.
     * @param {TP.sherpa.Halo} aHalo The halo that is requesting the nearest
     *     halo-focusable ancestor.
     * @returns {TP.core.ElementNode} The next halo-focusable ancestor of the
     *     receiver.
     */

    var canFocus,
        focusableTPElem;

    /* eslint-disable consistent-this */
    focusableTPElem = this;
    /* eslint-enable consistent-this */

    while (TP.isValid(focusableTPElem = focusableTPElem.getHaloParent(aHalo))) {

        canFocus = focusableTPElem.haloCanFocus(aHalo);

        if (canFocus) {
            return focusableTPElem;
        }
    }

    //  Couldn't find one to focus on? Return null.
    if (!canFocus) {
        return null;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getNearestHaloGenerator',
function(aHalo) {

    /**
     * @method getNearestHaloGenerator
     * @summary Returns the next 'generator' ancestor element of the receiver.
     * @description This method returns the next parent up the ancestor chain
     *     that is a 'tag generator'. A generator is an Element that is usually
     *     a compiled or templated tag that is responsible for generating
     *     content.
     * @param {TP.sherpa.Halo} aHalo The halo that is requesting the nearest
     *     generator ancestor.
     * @returns {TP.core.ElementNode} The next generator ancestor of the
     *     receiver.
     */

    var generatorTPElem;

    /* eslint-disable consistent-this */
    generatorTPElem = this;
    /* eslint-enable consistent-this */

    if (TP.isKindOf(generatorTPElem, TP.core.CustomTag)) {
        return generatorTPElem;
    }

    //  Keep iterating up the *haloable* ancestors of the receiver, looking for
    //  one that is a TP.core.CustomTag (the parent type of compiled and
    //  templated tag types). Return the first one found.
    while (TP.isValid(generatorTPElem = generatorTPElem.getHaloParent(aHalo))) {

        if (TP.isKindOf(generatorTPElem, TP.core.CustomTag)) {
            return generatorTPElem;
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getNextHaloChild',
function(aHalo, aSignal) {

    /**
     * @method getNextHaloChild
     * @summary Returns the next 'haloable' child element of the receiver.
     * @description This method uses the target of the supplied signal to
     *     compute a possible haloable child. If that child is not haloable, it
     *     then traverses its ancestor chain until it comes to the receiver,
     *     looking for a haloable Element. If it doesn't find one and comes to
     *     the receiver, it exits and returns null.
     * @param {TP.sherpa.Halo} aHalo The halo that is requesting the next
     *     halo-focusable child.
     * @param {TP.sig.Signal} aSignal The signal that initiated the search for a
     *     haloable child.
     * @returns {TP.core.ElementNode} The next haloable child between the
     *     receiver and the target of the supplied signal.
     */

    var evtTarget,
        existingTarget,
        theElem,
        lastElem;

    evtTarget = aSignal.getTarget();

    existingTarget = aHalo.get('currentTargetTPElem').getNativeNode();

    lastElem = evtTarget;
    theElem = evtTarget.parentNode;

    while (theElem !== existingTarget) {
        if (TP.isDocument(theElem)) {
            lastElem = null;
            break;
        }

        lastElem = theElem;
        theElem = theElem.parentNode;
    }

    //  We went to the top of the DOM hierarchy without finding the event
    //  target. We may be at the 'bottom' of the DOM hierarchy.
    if (TP.notValid(lastElem)) {
        return null;
    }

    return TP.wrap(lastElem);
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getPathPartsForInspector',
function(options) {

    /**
     * @method getPathPartsForInspector
     * @summary Returns the source's path parts that the inspector should be
     *     navigated to when it has neither a current resolver to resolve to or
     *     a path that's been supplied by the caller.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the path parts. This will have the following keys, amongst
     *     others:
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {String[]} The path parts that will navigate the inspector to
     *     the receiver.
     */

    return TP.ac('_HALO_');
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('getUIEditorType',
function() {

    /**
     * @method getUIEditorType
     * @summary Returns the UIEditor subtype used to edit any UI elements.
     * @returns {null}
     */

    return null;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('haloCanBlur',
function(aHalo) {

    /**
     * @method haloCanBlur
     * @summary Returns whether or not the halo can blur (i.e. no longer focus
     *     on) the receiver.
     * @param {TP.sherpa.Halo} aHalo The halo that is requesting whether or not
     *     it can blur the receiver.
     * @returns {Boolean} Whether or not the halo can blur the receiver.
     */

    //  We can always blur
    return true;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('haloCanDelete',
function(aHalo) {

    /**
     * @method haloCanDelete
     * @summary Returns whether or not the halo can delete the receiver from its
     *     DOM tree.
     * @param {TP.sherpa.Halo} aHalo The halo that is requesting whether or not
     *     it can delete the receiver.
     * @returns {Boolean} Whether or not the halo can delete the receiver.
     */

    var currentTargetTPElem,

        ourName,
        appTagName;

    currentTargetTPElem = aHalo.get('currentTargetTPElem');

    ourName = currentTargetTPElem.getCanonicalName();

    //  NB: We pass false here to skip returning any Sherpa tag since we're
    //  running in a Sherpa-enabled environment.
    appTagName = TP.tibet.root.computeAppTagTypeName(false);

    //  If our (canonical) name is the same as the app tag name, then we don't
    //  allow it to be deleted.
    if (ourName === appTagName) {

        TP.bySystemId('SherpaConsoleService').notify(
            'It is not possible to delete the root application tag.');

        return false;
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('haloCanEmpty',
function(aHalo) {

    /**
     * @method haloCanEmpty
     * @summary Returns whether or not the halo can empty the receiver from its
     *     DOM tree.
     * @param {TP.sherpa.Halo} aHalo The halo that is requesting whether or not
     *     it can empty the receiver.
     * @returns {Boolean} Whether or not the halo can empty the receiver.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('haloCanFocus',
function(aHalo) {

    /**
     * @method haloCanFocus
     * @summary Returns whether or not the halo can focus on the receiver.
     * @param {TP.sherpa.Halo} aHalo The halo that is requesting whether or not
     *     it can focus the receiver.
     * @returns {Boolean} Whether or not the halo can focus the receiver.
     */

    var ancestors,

        len,
        i;

    //  We cannot focus on elements that are Sherpa elements themselves.
    if (this.getNSURI() === TP.w3.Xmlns.SHERPA) {
        return false;
    }

    //  We cannot focus on elements that are under a 'tibet:tofu' element
    ancestors = this.getAncestors();

    len = ancestors.getSize();
    for (i = 0; i < len; i++) {
        if (ancestors.at(i).getCanonicalName() === 'tibet:tofu') {
            return false;
        }
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('hudCanDrop',
function(aHUD, targetTPElem) {

    /**
     * @method hudCanDrop
     * @summary Returns whether or not the hud should allow the supplied element
     *     to be dropped into the receiver.
     * @param {TP.sherpa.hud} aHUD The hud that is requesting whether or not
     *     it can drop the supplied element into the receiver.
     * @param {TP.sherpa.hud} droppingTPElem The element that is being dropped.
     * @returns {Boolean} Whether or not the hud can drop the supplied target
     *     into the receiver.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('resolveAspectForInspector',
function(anAspect, options) {

    /**
     * @method resolveAspectForInspector
     * @summary Returns the object that is produced when resolving the aspect
     *     against the receiver.
     * @param {String} anAspect The aspect to resolve against the receiver to
     *     produce the return value.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the configuration data. This will have the following keys,
     *     amongst others:
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {Object} The object produced when resolving the aspect against
     *     the receiver.
     */

    var source;

    if (anAspect === 'Node Type') {
        return this.getType();
    }

    if (anAspect === 'Node Instance Data' || anAspect === 'Node Local Data') {
        return this;
    }

    source = TP.sherpa.SingleEntryInspectorSource.construct();
    source.setPrimaryEntry(this.get(anAspect));

    return source;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('sherpaDidInsertBreadcrumb',
function(insertionPointElement, insertionPosition) {

    /**
     * @method sherpaDidInsertBreadcrumb
     * @summary Responds to the fact that the Sherpa initiated a DOM insertion
     *     by dropping a 'breadcrumb' element somewhere in a DOM visualization.
     * @param {Element} insertionPointElement The element that provides the
     *     insertion point to the insertion operation. This, in combination with
     *     the insertion position, will provide the place in the DOM to insert
     *     the new DOM node.
     * @param {Constant} insertionPosition The insertion position, relative to
     *     the insertion point element, that the new node should be inserted at.
     *     This could be TP.BEFORE_BEGIN, TP.AFTER_BEGIN, TP.BEFORE_END,
     *     TP.AFTER_END.
     * @returns {TP.core.ElementNode} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('sherpaDidInsertTofu',
function(insertionPointElement, insertionPosition) {

    /**
     * @method sherpaDidInsertTofu
     * @summary Responds to the fact that the Sherpa initiated a DOM insertion
     *     by dropping a 'tofu' element somewhere in a DOM visualization.
     * @param {Element} insertionPointElement The element that provides the
     *     insertion point to the insertion operation. This, in combination with
     *     the insertion position, will provide the place in the DOM to insert
     *     the new DOM node.
     * @param {Constant} insertionPosition The insertion position, relative to
     *     the insertion point element, that the new node should be inserted at.
     *     This could be TP.BEFORE_BEGIN, TP.AFTER_BEGIN, TP.BEFORE_END,
     *     TP.AFTER_END.
     * @returns {TP.core.ElementNode} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('sherpaDomHudGetLabel',
function() {

    /**
     * @method sherpaDomHudGetLabel
     * @summary Returns the label that the Sherpa's 'domhud' panel will use when
     *     displaying it's representation for this node.
     * @returns {String} The label to use in the 'domhud' panel.
     */

    return this.getFullName();
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('sherpaDomHudGetTileContent',
function() {

    /**
     * @method sherpaDomHudGetTileContent
     * @summary Returns the label that the Sherpa's 'domhud' panel will use when
     *     displaying it's 'tile' panel for this node.
     * @returns {Element} The Element that will be used as the content for the
     *     domhud tile panel.
     */

    return TP.elem('<sherpa:domhud_genericContent/>');
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('sherpaDidReparentNode',
function(insertionPointElement, insertionPosition) {

    /**
     * @method sherpaDidReparentNode
     * @summary Responds to the fact that the Sherpa initiated a DOM reparenting
     *     operation by dropping a 'tofu' element that was generated by the halo
     *     somewhere in a DOM visualization.
     * @param {Element} insertionPointElement The element that provides the
     *     insertion point to the reparenting operation. This, in combination
     *     with the insertion position, will provide the place in the DOM to
     *     reparent the DOM node.
     * @param {Constant} insertionPosition The insertion position, relative to
     *     the insertion point element, that the node should be reparented at.
     *     This could be TP.BEFORE_BEGIN, TP.AFTER_BEGIN, TP.BEFORE_END,
     *     TP.AFTER_END.
     * @returns {TP.core.ElementNode} The receiver.
     */

    var haloTPElem,
        haloTargetTPElem;

    //  The target element that we're moving is the halo's current target.
    haloTPElem = TP.byId('SherpaHalo', TP.win('UIROOT'));
    haloTargetTPElem = haloTPElem.get('currentTargetTPElem');

    //  Move the target element. The deadening/awakening will be handled by the
    //  Mutation Observer machinery.
    TP.nodeInsertContent(insertionPointElement,
                            TP.unwrap(haloTargetTPElem),
                            insertionPosition);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('sherpaGetTextContent',
function() {

    /**
     * @method sherpaGetTextContent
     * @summary Returns the text content that the Sherpa will use when
     *     manipulating the receiver's 'text content'. Note that the Sherpa
     *     currently only manipulates a single Text node that exists as a leaf
     *     of an Element. If there is mixed Element and Text node content, then
     *     that is ignored and this method returns the empty String.
     * @returns {String} The text content that the Sherpa will use to manage the
     *     receiver's 'text content'.
     */

    var str;

    if (TP.isEmpty(this.getChildNodes())) {
        str = '';
    } else if (TP.notEmpty(this.getDescendantElements())) {
        str = '';
    } else {
        str = this.getTextContent();
    }

    return str;
});

//  ------------------------------------------------------------------------

TP.core.ElementNode.Inst.defineMethod('sherpaSetTextContent',
function(aContent) {

    /**
     * @method sherpaSetTextContent
     * @summary Sets the text content of the receiver as the Sherpa would do it.
     *     Note that since the Sherpa currently does not handle more than a
     *     single Text node as a leaf under an Element node, if the receiver has
     *     descendant elements, this method will do nothing.
     * @param {String} aContent The content to set the receiver's text content
     *     to.
     * @returns {TP.core.ElementNode} The receiver.
     */

    if (TP.notEmpty(this.getDescendantElements())) {
        return this;
    } else {
        this.setTextContent(aContent);
    }

    return this;
});

//  ========================================================================
//  TP.core.CustomTag Additions
//  ========================================================================

//  ------------------------------------------------------------------------
//  Inspector API
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.CustomTag.Inst.defineMethod('getConfigForInspector',
function(options) {

    /**
     * @method getConfigForInspector
     * @summary Returns the source's configuration data to configure the bay
     *     that the source's content will be hosted in.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the configuration data. This will have the following keys,
     *     amongst others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {TP.core.Hash} Configuration data used by the inspector for bay
     *     configuration. This could have the following keys, amongst others:
     *          TP.ATTR + '_contenttype':   The tag name of the content being
     *                                      put into the bay
     *          TP.ATTR + '_class':         Any additional CSS classes to put
     *                                      onto the bay inspector item itself
     *                                      to adjust to the content being
     *                                      placed in it.
     */

    options.atPut(TP.ATTR + '_contenttype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.core.CustomTag.Inst.defineMethod('getContentForInspector',
function(options) {

    /**
     * @method getContentForInspector
     * @summary Returns the source's content that will be hosted in an inspector
     *     bay.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the content. This will have the following keys, amongst
     *     others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     *          'bindLoc':          The URI location where the data for the
     *                              content can be found.
     * @returns {Element} The Element that will be used as the content for the
     *     bay.
     */

    var dataURI;

    if (options.at('targetAspect') === this.getID()) {
        dataURI = TP.uc(options.at('bindLoc'));

        return TP.elem(
                '<xctrls:list bind:in="{data: ' + dataURI.asString() + '}"/>');
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.core.CustomTag.Inst.defineMethod('getDataForInspector',
function(options) {

    /**
     * @method getDataForInspector
     * @summary Returns the source's data that will be supplied to the content
     *     hosted in an inspector bay. In most cases, this data will be bound to
     *     the content using TIBET data binding. Therefore, when this data
     *     changes, the content will be refreshed to reflect that.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the data. This will have the following keys, amongst others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     *          'bindLoc':          The URI location where the data for the
     *                              content can be found.
     * @returns {Object} The data that will be supplied to the content hosted in
     *     a bay.
     */

    var stdSlots,
        customTagSlots,

        data;

    if (options.at('targetAspect') === this.getID()) {
        stdSlots = this.callNextMethod();
        customTagSlots = TP.ac(
                            TP.ac('Structure', 'Structure'),
                            TP.ac('Style', 'Style'));

        data = stdSlots.concat(customTagSlots);
    } else {
        data = this.callNextMethod();
    }

    return data;
});

//  ========================================================================
//  TP.core.TemplatedTag Additions
//  ========================================================================

//  ------------------------------------------------------------------------
//  Inspector API
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.core.TemplatedTag.Type.defineMethod('getDataForInspector',
function(options) {

    /**
     * @method getDataForInspector
     * @summary Returns the source's data that will be supplied to the content
     *     hosted in an inspector bay. In most cases, this data will be bound to
     *     the content using TIBET data binding. Therefore, when this data
     *     changes, the content will be refreshed to reflect that.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the data. This will have the following keys, amongst others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     *          'bindLoc':          The URI location where the data for the
     *                              content can be found.
     * @returns {Object} The data that will be supplied to the content hosted in
     *     a bay.
     */

    var items;

    items = this.callNextMethod();

    items.push(
        TP.ac('Structure', 'Structure'),
        TP.ac('Style', 'Style'));

    return items;
});

//  ------------------------------------------------------------------------

TP.core.TemplatedTag.Type.defineMethod('getEntryAt',
function(aSourceName) {

    /**
     * @method getEntryAt
     * @summary Returns the 'entry' in the receiver for the supplied source
     *     name. This will be the singular name used to register the entry.
     * @param {String} aSourceName The name of the entry to retrieve.
     * @returns {Object} The entry object registered under the supplied source
     *     name in the receiver.
     */

    var source;

    switch (aSourceName) {

        case 'Structure':
            //  NB: We're returning the TP.core.URI instance itself here.
            source = this.getResourceURI('template', TP.ietf.Mime.XHTML);

            break;

        case 'Style':
            //  NB: We're returning the TP.core.URI instance itself here.
            source = this.getResourceURI('style', TP.ietf.Mime.XHTML);

            break;

        default:
            source = this.callNextMethod();
            break;
    }

    return source;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.TemplatedTag.Inst.defineMethod('resolveAspectForInspector',
function(anAspect, options) {

    /**
     * @method resolveAspectForInspector
     * @summary Returns the object that is produced when resolving the aspect
     *     against the receiver.
     * @param {String} anAspect The aspect to resolve against the receiver to
     *     produce the return value.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the configuration data. This will have the following keys,
     *     amongst others:
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {Object} The object produced when resolving the aspect against
     *     the receiver.
     */

    var thisType;

    thisType = this.getType();

    switch (anAspect) {

        case 'Structure':
            //  NB: We're returning the TP.core.URI instance itself here.
            return thisType.getResourceURI('template', TP.ietf.Mime.XHTML);

        case 'Style':
            //  NB: We're returning the TP.core.URI instance itself here.
            return thisType.getResourceURI('style', TP.ietf.Mime.CSS);

        default:
            return this.callNextMethod();
    }
});

//  ------------------------------------------------------------------------
//  Context Menu API
//  ------------------------------------------------------------------------

TP.core.TemplatedTag.Inst.defineMethod('getContentForContextMenu',
function(options) {

    /**
     * @method getContentForContextMenu
     * @summary Returns the source's content that will be hosted in a Sherpa
     *     context menu.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the content. This will have the following keys, amongst
     *     others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {Element} The Element that will be used as the content for the
     *     context menu.
     */

    return TP.elem('<sherpa:templatedTagContextMenuContent/>');
});

//  ========================================================================
//  TP.core.CompiledTag Additions
//  ========================================================================

//  ------------------------------------------------------------------------
//  Inspector API
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.CompiledTag.Inst.defineMethod('resolveAspectForInspector',
function(anAspect, options) {

    /**
     * @method resolveAspectForInspector
     * @summary Returns the object that is produced when resolving the aspect
     *     against the receiver.
     * @param {String} anAspect The aspect to resolve against the receiver to
     *     produce the return value.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the configuration data. This will have the following keys,
     *     amongst others:
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {Object} The object produced when resolving the aspect against
     *     the receiver.
     */

    var thisType;

    thisType = this.getType();

    switch (anAspect) {

        case 'Structure':

            //  See if the tag has a type-local tagCompile method. If so, return
            //  it.
            if (TP.owns(thisType, 'tagCompile')) {
                return thisType.tagCompile;
            }

            //  See if the tag has a type tagCompile method. If so, return it.
            if (TP.owns(thisType.Type, 'tagCompile')) {
                return thisType.Type.tagCompile;
            }

            return null;

        case 'Style':

            return thisType.getResourceURI('template', TP.ietf.Mime.CSS);

        default:
            return this.callNextMethod();
    }
});

//  ------------------------------------------------------------------------
//  Context Menu API
//  ------------------------------------------------------------------------

TP.core.CompiledTag.Inst.defineMethod('getContentForContextMenu',
function(options) {

    /**
     * @method getContentForContextMenu
     * @summary Returns the source's content that will be hosted in a Sherpa
     *     context menu.
     * @param {TP.core.Hash} options A hash of data available to this source to
     *     generate the content. This will have the following keys, amongst
     *     others:
     *          'targetObject':     The object being queried using the
     *                              targetAspect to produce the object being
     *                              displayed.
     *          'targetAspect':     The property of the target object currently
     *                              being displayed.
     *          'pathParts':        The Array of parts that make up the
     *                              currently selected path.
     * @returns {Element} The Element that will be used as the content for the
     *     context menu.
     */

    return TP.elem('<sherpa:compiledTagContextMenuContent/>');
});

//  ========================================================================
//  TP.core.UIElementNode Additions
//  ========================================================================

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getHaloRect',
function(aHalo) {

    /**
     * @method getHaloRect
     * @summary Returns the rectangle that the halo can use to display itself
     *     when it has the receiver selected.
     * @param {TP.sherpa.Halo} aHalo The halo that is requesting the rectangle
     *     to use to display itself.
     * @returns {TP.core.Rect} The rectangle that the halo will use to display
     *     itself.
     */

    var haloWin,
        ourWin,

        ourRect,

        elem,

        transform;

    haloWin = aHalo.getNativeWindow();
    ourWin = this.getNativeWindow();

    ourRect = this.getGlobalRect();

    //  If the halo is operating in the same window as us, so just return our
    //  untransformed 'global rect'
    if (haloWin === ourWin) {
        return ourRect;
    }

    //  If we're not in an iframe window, we must be in a top-level window, so
    //  just return our untransformed global rect.
    if (!TP.isIFrameWindow(ourWin)) {
        return ourRect;
    }

    //  We're not in the same window as the halo and we're in an iframe, so
    //  we need our global rect.

    elem = this.getNativeNode();

    //  If the element is transformed, then we temporarily remove the transform
    //  so that we can measure it 'properly'.
    if (TP.elementIsTransformed(elem)) {

        transform = TP.elementGetStyleObj(elem).transform;
        TP.elementGetStyleObj(elem).transform = 'none';

        //  Take the measurement with no transformations.
        ourRect = this.getGlobalRect(false);

        TP.elementGetStyleObj(elem).transform = transform;
    } else {
        ourRect = this.getGlobalRect(true);
    }

    return ourRect;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('getUIEditorType',
function() {

    /**
     * @method getUIEditorType
     * @summary Returns the UIEditor subtype used to edit any UI elements.
     * @returns {TP.meta.core.UIElementNodeEditor}
     */

    return TP.core.UIElementNodeEditor;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('sherpaDidInsertBreadcrumb',
function(insertionPointElement, insertionPosition) {

    /**
     * @method sherpaDidInsertBreadcrumb
     * @summary Responds to the fact that the Sherpa initiated a DOM insertion
     *     by dropping a 'breadcrumb' element somewhere in a DOM visualization.
     * @param {Element} insertionPointElement The element that provides the
     *     insertion point to the insertion operation. This, in combination with
     *     the insertion position, will provide the place in the DOM to insert
     *     the new DOM node.
     * @param {Constant} insertionPosition The insertion position, relative to
     *     the insertion point element, that the new node should be inserted at.
     *     This could be TP.BEFORE_BEGIN, TP.AFTER_BEGIN, TP.BEFORE_END,
     *     TP.AFTER_END.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var inspector,
        contentType,

        assistantContentTPElem,
        dialogPromise;

    inspector = TP.byId('SherpaInspector', TP.win('UIROOT'));

    contentType = inspector.getCurrentPropertyValueForTool(
                                'contentType',
                                'canvas');

    switch (contentType) {

        case 'uri/CouchDB/document':

            //  Grab the TP.sherpa.insertionAssistant type's template.
            assistantContentTPElem =
                TP.sherpa.couchDocumentURIInsertionAssistant.getResourceElement(
                                'template',
                                TP.ietf.Mime.XHTML);

            //  Open a dialog with the insertion assistant's content.
            dialogPromise = TP.dialog(
                TP.hc(
                    'dialogID', 'CouchDocumentURIAssistantDialog',
                    'isModal', true,
                    'title', 'Insert New Schema-Driven Property Sheet',
                    'templateContent', assistantContentTPElem));

            //  After the dialog is showing, set the assistant parameters on the
            //  content object from those defined in the original signal's
            //  payload.
            dialogPromise.then(
                function(aDialogTPElem) {

                    var contentTPElem,
                        insertedURI;

                    contentTPElem = aDialogTPElem.get('bodyGroup').
                                                getFirstChildElement();

                    insertedURI = inspector.getCurrentPropertyValueForTool(
                                                'data',
                                                'inspector');

                    //  Pass along the insertion position and the peer element
                    //  as the insertion point to the dialog info.
                    contentTPElem.set('data',
                        TP.hc(
                            'insertionPosition', insertionPosition,
                            'insertionPoint', insertionPointElement,
                            'uri', insertedURI,
                            'insertionID',
                                'couch_doc' + TP.genID().replace('$', '_')));
                });

            break;

        case 'uri/CouchDB/view':

            //  Grab the TP.sherpa.insertionAssistant type's template.
            assistantContentTPElem =
                TP.sherpa.couchViewURIInsertionAssistant.getResourceElement(
                                'template',
                                TP.ietf.Mime.XHTML);

            //  Open a dialog with the insertion assistant's content.
            dialogPromise = TP.dialog(
                TP.hc(
                    'dialogID', 'CouchViewURIAssistantDialog',
                    'isModal', true,
                    'title', 'Insert Data Table',
                    'templateContent', assistantContentTPElem));

            //  After the dialog is showing, set the assistant parameters on the
            //  content object from those defined in the original signal's
            //  payload.
            dialogPromise.then(
                function(aDialogTPElem) {

                    var contentTPElem,
                        insertedURI;

                    contentTPElem = aDialogTPElem.get('bodyGroup').
                                                getFirstChildElement();

                    insertedURI = inspector.getCurrentPropertyValueForTool(
                                                'data',
                                                'inspector');

                    //  Pass along the insertion position and the peer element
                    //  as the insertion point to the dialog info.
                    contentTPElem.set('data',
                        TP.hc(
                            'insertionPosition', insertionPosition,
                            'insertionPoint', insertionPointElement,
                            'uri', insertedURI,
                            'insertionID',
                                'couch_view' + TP.genID().replace('$', '_')));
                });

            break;

        default:
            break;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.UIElementNode.Inst.defineMethod('sherpaDidInsertTofu',
function(insertionPointElement, insertionPosition) {

    /**
     * @method sherpaDidInsertTofu
     * @summary Responds to the fact that the Sherpa initiated a DOM insertion
     *     by dropping a 'tofu' element somewhere in a DOM visualization.
     * @param {Element} insertionPointElement The element that provides the
     *     insertion point to the insertion operation. This, in combination with
     *     the insertion position, will provide the place in the DOM to insert
     *     the new DOM node.
     * @param {Constant} insertionPosition The insertion position, relative to
     *     the insertion point element, that the new node should be inserted at.
     *     This could be TP.BEFORE_BEGIN, TP.AFTER_BEGIN, TP.BEFORE_END,
     *     TP.AFTER_END.
     * @returns {TP.core.UIElementNode} The receiver.
     */

    var assistantContentTPElem,
        dialogPromise;

    //  Grab the TP.sherpa.insertionAssistant type's template.
    assistantContentTPElem =
        TP.sherpa.tofuInsertionAssistant.getResourceElement(
                        'template',
                        TP.ietf.Mime.XHTML);

    //  Open a dialog with the insertion assistant's content.
    dialogPromise = TP.dialog(
        TP.hc(
            'dialogID', 'TofuAssistantDialog',
            'isModal', true,
            'title', 'Insert New Tag',
            'templateContent', assistantContentTPElem));

    //  After the dialog is showing, set the assistant parameters on the content
    //  object from those defined in the original signal's payload.
    dialogPromise.then(
        function(aDialogTPElem) {

            var contentTPElem;

            contentTPElem = aDialogTPElem.get('bodyGroup').
                                        getFirstChildElement();

            //  Pass along the insertion position and the peer element as the
            //  insertion point to the dialog info.
            contentTPElem.set('data',
                TP.hc(
                    'insertionPosition', insertionPosition,
                    'insertionPoint', insertionPointElement));
        });

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
