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
//  TP.dom.Node Additions
//  ========================================================================

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.dom.Node.Inst.defineMethod('haloCanBlur',
function(aHalo) {

    /**
     * @method haloCanBlur
     * @summary Returns whether or not the halo can blur (i.e. no longer focus
     *     on) the receiver.
     * @param {TP.lama.Halo} aHalo The halo that is requesting whether or not
     *     it can blur the receiver.
     * @returns {Boolean} Whether or not the halo can blur the receiver.
     */

    //  We return false here because, at this level, the halo should be neither
    //  focusing or blurring.
    return false;
});

//  ------------------------------------------------------------------------

TP.dom.Node.Inst.defineMethod('haloCanDelete',
function(aHalo) {

    /**
     * @method haloCanDelete
     * @summary Returns whether or not the halo can delete the receiver from its
     *     DOM tree.
     * @param {TP.lama.Halo} aHalo The halo that is requesting whether or not
     *     it can delete the receiver.
     * @returns {Boolean} Whether or not the halo can delete the receiver.
     */

    //  We return false here because, at this level, the halo should not be
    //  deleting.
    return false;
});

//  ------------------------------------------------------------------------

TP.dom.Node.Inst.defineMethod('haloCanEmpty',
function(aHalo) {

    /**
     * @method haloCanEmpty
     * @summary Returns whether or not the halo can empty the receiver from its
     *     DOM tree.
     * @param {TP.lama.Halo} aHalo The halo that is requesting whether or not
     *     it can empty the receiver.
     * @returns {Boolean} Whether or not the halo can empty the receiver.
     */

    //  We return false here because, at this level, the halo should not be
    //  emptying.
    return false;
});

//  ------------------------------------------------------------------------

TP.dom.Node.Inst.defineMethod('haloCanFocus',
function(aHalo) {

    /**
     * @method haloCanFocus
     * @summary Returns whether or not the halo can focus on the receiver.
     * @param {TP.lama.Halo} aHalo The halo that is requesting whether or not
     *     it can focus the receiver.
     * @returns {Boolean} Whether or not the halo can focus the receiver.
     */

    //  We return false here because, at this level, the halo should be neither
    //  focusing or blurring.
    return false;
});

//  ------------------------------------------------------------------------

TP.dom.Node.Inst.defineMethod('hudCanConnect',
function(aHUD) {

    /**
     * @method hudCanConnect
     * @summary Returns whether or not the hud should allow the supplied element
     *     to be connected to the supplied element
     * @param {TP.lama.hud} aHUD The hud that is requesting whether or not
     *     it can connect the supplied element to the receiver.
     * @returns {Boolean} Whether or not the hud can connect the supplied target
     *     to the receiver.
     */

    //  We return false here because, at this level, the hud should not be
    //  allowing connecting to anything.
    return false;
});

//  ------------------------------------------------------------------------

TP.dom.Node.Inst.defineMethod('hudCanDrop',
function(aHUD, droppingTPElem) {

    /**
     * @method hudCanDrop
     * @summary Returns whether or not the hud should allow the supplied element
     *     to be dropped into the receiver.
     * @param {TP.lama.hud} aHUD The hud that is requesting whether or not
     *     it can drop the supplied element into the receiver.
     * @param {TP.dom.ElementNode} droppingTPElem The element that is being
     *     dropped.
     * @returns {Boolean} Whether or not the hud can drop the supplied target
     *     into the receiver.
     */

    //  We return false here because, at this level, the hud should not be
    //  allowing dropping into anything.
    return false;
});

//  ------------------------------------------------------------------------

TP.dom.Node.Inst.defineMethod('lamaAllowDescendantMutations',
function(operation, currentAddressPosition, followingAddresses, allAddresses,
attributeName, attributeValue, oldAttributeValue) {

    /**
     * @method lamaAllowDescendantMutations
     * @summary Returns the node that should be modified when the Lama
     *     modifies the visual DOM that was rendered from this content. This
     *     allows the original source DOM node more control over modifications
     *     that the Lama is making
     * @param {String} operation The action such as TP.CREATE, TP.UPDATE or
     *     TP.DELETE that is currently causing the mutation.
     * @param {String} currentAddressPosition The dot-separated document address
     *     of the node being modified.
     * @param {String[]} followingAddresses The Array of dot-separated document
     *     addresses of all of the nodes being modified following the current
     *     node being modified
     * @param {String[]} allAddresses The Array of dot-separated document
     *     addresses of all of the nodes being modified.
     * @param {String} [attributeName] The name of the attribute that is changing
     *     (if this is an 'attributes' mutation).
     * @param {String} [attributeValue] The value of the attribute that is
     *     changing (if this is an 'attributes' mutation).
     * @param {String} [oldAttributeValue] The prior value of the attribute that
     *     is changing (if this is an 'attributes' mutation and the operation is
     *     TP.UPDATE or TP.DELETE).
     * @returns {Boolean}
     */

    return true;
});

//  ========================================================================
//  TP.dom.CollectionNode Additions
//  ========================================================================

TP.dom.CollectionNode.Inst.defineMethod('lamaGetChildNodes',
function() {

    /**
     * @method lamaGetChildNodes
     * @summary Returns an Array of the receiver's child nodes that should be
     *    relevant to the Lama.
     * @returns {Node[]} An Array of the receiver's child nodes that are
     *    relevant to the Lama.
     */

    return this.getChildNodes();
});

//  ------------------------------------------------------------------------

TP.dom.CollectionNode.Inst.defineMethod('lamaGetChildElements',
function() {

    /**
     * @method lamaGetChildElements
     * @summary Returns an Array of the receiver's child elements that should be
     *    relevant to the Lama.
     * @returns {Element[]} An Array of the receiver's child elements that are
     *    relevant to the Lama.
     */

    return this.getChildElements();
});

//  ------------------------------------------------------------------------

TP.dom.Node.Inst.defineMethod('lamaGetNodeForVisualDOMChange',
function(mutatedVisualNode, operation, currentAddressPosition,
followingAddresses, allAddresses, attributeName, attributeValue,
oldAttributeValue) {

    /**
     * @method lamaGetNodeForVisualDOMChange
     * @summary Returns the node that should be modified when the Lama
     *     modifies the visual DOM that was rendered from this content. This
     *     allows the original source DOM node more control over modifications
     *     that the Lama is making.
     * @param {Node} mutatedVisualNode The visual node being mutated.
     * @param {String} operation The action such as TP.CREATE, TP.UPDATE or
     *     TP.DELETE that is currently causing the mutation.
     * @param {String} currentAddressPosition The dot-separated document address
     *     of the node being modified.
     * @param {String[]} followingAddresses The Array of dot-separated document
     *     addresses of all of the nodes being modified following the current
     *     node being modified
     * @param {String[]} allAddresses The Array of dot-separated document
     *     addresses of all of the nodes being modified.
     * @param {String} [attributeName] The name of the attribute that is changing
     *     (if this is an 'attributes' mutation).
     * @param {String} [attributeValue] The value of the attribute that is
     *     changing (if this is an 'attributes' mutation).
     * @param {String} [oldAttributeValue] The prior value of the attribute that
     *     is changing (if this is an 'attributes' mutation and the operation is
     *     TP.UPDATE or TP.DELETE).
     * @returns {Node|TP.CONTINUE} The node that should be the target for
     *     modifications or TP.CONTINUE if this node and it's descendants should
     *     be skipped for modification.
     */

    return this.getNativeNode();
});

//  ------------------------------------------------------------------------

TP.dom.Node.Inst.defineMethod('lamaGetSuccessorEditableTextNode',
function(direction, currentEditingNode) {

    /**
     * @method lamaGetSuccessorEditableTextNode
     * @summary Searches for the next editable text node for use with the
     *     Lama's inline text node editor. The default, at this level, is to
     *     return null to indicate there isn't one.
     * @param {String} aDirection The direction to search for the next editable
     *     text node. This should be TP.NEXT or TP.PREVIOUS.
     * @param {Element} currentEditingElement The element that contains the
     *     text node that is currently being edited.
     * @returns {TP.dom.TextNode|null} The text node to edit next or null.
     */

    return null;
});

//  ------------------------------------------------------------------------

TP.dom.Node.Inst.defineMethod('lamaGetWorldScreen',
function() {

    /**
     * @method lamaGetWorldScreen
     * @summary Returns the 'world screen' element that the receiver is
     *     currently hosted in.
     * @returns {TP.dom.ElementNode} The 'world screen' element containing the
     *     receiver.
     */

    var elemScreenTPElem;

    elemScreenTPElem = TP.wrap(this.getNativeWindow().frameElement.parentNode);

    return elemScreenTPElem;
});

//  ========================================================================
//  TP.dom.ElementNode Additions
//  ========================================================================

TP.dom.ElementNode.addTraitTypes(TP.lama.ToolAPI);

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('canConnectTo',
function(destTPElement) {

    /**
     * @method canConnectTo
     * @summary Returns whether the receiver will allow connection to the
     *     supplied destination element.
     * @param {TP.dom.ElementNode} destTPElement The destination element.
     * @returns {Boolean} Whether or not the receiver will allow connection.
     */

    var vendValue,
        vendValues,

        acceptValue,
        acceptValues;

    //  Get the vending value for comparison to what the target will accept.
    //  Note that there can be multiple vending values.
    vendValue = this.getAttribute('lama:connector-vend');
    vendValues = vendValue.split(' ');
    if (TP.isEmpty(vendValues)) {
        return false;
    }

    //  Get the accepting value to compare against the vending value. Note that
    //  there can be multiple accepting values.
    acceptValue = destTPElement.getAttribute('lama:connector-accept');
    acceptValues = acceptValue.split(' ');
    if (TP.isEmpty(acceptValues)) {
        return false;
    }

    return acceptValues.containsAny(vendValues);
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('canConnectFrom',
function(srcTPElement) {

    /**
     * @method canConnectFrom
     * @summary Returns whether the receiver will allow connection from the
     *     supplied source element.
     * @param {TP.dom.ElementNode} srcTPElement The source element.
     * @returns {Boolean} Whether or not the receiver will allow connection.
     */

    var acceptValue,
        acceptValues,

        vendValue,
        vendValues;

    //  Get the accepting value for comparison to what the target will accept.
    //  Note that there can be multiple accepting values.
    acceptValue = this.getAttribute('lama:connector-accept');
    acceptValues = acceptValue.split(' ');
    if (TP.isEmpty(acceptValues)) {
        return false;
    }

    //  Get the vending value to compare against the accepting value. Note that
    //  there can be multiple vending values.
    vendValue = srcTPElement.getAttribute('lama:connector-vend');
    vendValues = vendValue.split(' ');
    if (TP.isEmpty(vendValues)) {
        return false;
    }

    return vendValues.containsAny(acceptValues);
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('connectorSessionDidStart',
function() {

    /**
     * @method connectorSessionDidStart
     * @summary Informs the receiver that any connector session it is going to
     *     be a part of has started.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var elem;

    elem = this.getNativeNode();

    //  Any element that doesn't have an existing 'lama:connector-vend'
    //  element can be a 'signal source' - add the attribute value here.
    if (!TP.elementHasAttribute(elem, 'lama:connector-vend', true)) {
        TP.elementAddAttributeValue(
                elem, 'lama:connector-vend', 'signalsource', true);
    }

    TP.elementSetAttribute(elem, 'lama:connector-activated', true, true);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('connectorSessionDidStop',
function() {

    /**
     * @method connectorSessionDidStop
     * @summary Informs the receiver that any connector session it was currently
     *     a part of has stopped.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var elem;

    elem = this.getNativeNode();

    //  Any element can be a 'signal source' - remove the attribute value here.
    TP.elementRemoveAttributeValue(
            elem, 'lama:connector-vend', 'signalsource', true);

    TP.elementRemoveAttribute(elem, 'lama:connector-activated', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getConnectorDestination',
function(aConnector) {

    /**
     * @method getConnectorDestination
     * @summary Returns an element to be used as a connector destination. Note
     *     that, at this level, the receiver returns itself as a valid connector
     *     destination (if it has the correct attribute).
     * @param {TP.lama.connector} aConnector The connector that is requesting
     *     the destination to drag to.
     * @returns {TP.dom.ElementNode} The element to use as the connector
     *     destination.
     */

    if (this.hasAttribute('lama:connector-accept')) {
        return this;
    }

    //  If the receiver's document is the UI canvas, then it could always be a
    //  connector destination.
    if (this.getDocument() === TP.sys.uidoc()) {
        return this;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getConnectorDestinationRect',
function(aConnector) {

    /**
     * @method getConnectorDestinationRect
     * @summary Returns a TP.gui.Rect to be used as the connector destination's
     *     rectangle to display when it is currently being highlighted as the
     *     connector destination.
     * @param {TP.lama.connector} aConnector The connector that is requesting
     *     the destination rectangle.
     * @returns {TP.gui.Rect} The rectangle to use to draw the connector
     *     destination.
     */

    var destRect,
        connectorThickness;

    if (!this.hasAttribute('lama:connector-accept')) {
        return TP.rtc(0, 0, 0, 0);
    }

    destRect = this.getGlobalRect();

    //  The default is to 'outset' the rectangle by the thickness of the
    //  connector.

    connectorThickness = aConnector.get('connectorThickness');

    destRect.subtractByPoint(
                TP.pc(connectorThickness, connectorThickness));
    destRect.growByPoint(
                TP.pc(connectorThickness, connectorThickness));

    return destRect;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getConnectorSource',
function(aConnector) {

    /**
     * @method getConnectorSource
     * @summary Returns an element to be used as a connector source. Note that,
     *     at this level, the receiver returns itself as a valid connector
     *     source (if it has the correct attribute).
     * @param {TP.lama.connector} aConnector The connector that is requesting
     *     the source to drag from.
     * @returns {TP.dom.ElementNode} The element to use as the connector source.
     */

    if (this.hasAttribute('lama:connector-vend')) {
        return this;
    }

    //  If the receiver's document is the UI canvas, then it could always be a
    //  connector source.
    if (this.getDocument() === TP.sys.uidoc()) {
        return this;
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('isConnectorOpaque',
function() {

    /**
     * @method isConnectorOpaque
     * @summary Returns whether the receiver is 'connector opaque', which means
     *     that any connections to descendants of the receiver should be made
     *     to the receiver itself.
     * @returns {Boolean} Whether Lama connectors should treat the receiver as
     *     being 'opaque' and not connect to any of its descendants.
     */

    return this.hasAttribute('lama:connector-accept');
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getContentForInspector',
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

        dataURI,
        elem;

    targetAspect = options.at('targetAspect');

    if (targetAspect === 'Node Instance Data' ||
        targetAspect === 'Node Local Data') {

        dataURI = TP.uc(options.at('bindLoc'));

        elem = TP.elem(
                '<xctrls:list filter="true"' +
                ' alwayschange="true" itemtoggle="false"/>');

        TP.elementSetAttribute(
                elem, 'bind:in', '{data: ' + dataURI.asString() + '}', true);

        return elem;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getDataForInspector',
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

TP.dom.ElementNode.Inst.defineMethod('getEntryAt',
function(aSourceName) {

    /**
     * @method getEntryAt
     * @summary Returns the 'entry' in the receiver for the supplied source
     *     name. This will be the singular name used to register the entry.
     * @param {String} aSourceName The name of the entry to retrieve.
     * @returns {Object} The entry object registered under the supplied source
     *     name in the receiver.
     */

    var srcName,

        source;

    //  Sometimes entries come in with escaped slashes. Unescape that.
    srcName = TP.stringUnescapeSlashes(aSourceName);

    if (srcName === 'Node Type') {
        source = this.getType();
    } else {
        /* eslint-disable consistent-this */
        source = this;
        /* eslint-enable consistent-this */
    }

    return source;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getHaloParent',
function(aHalo) {

    /**
     * @method getHaloParent
     * @summary Returns the next 'haloable' ancestor element of the receiver.
     *     Not all ancestors in the receiver's ancestor chain are 'haloable'.
     * @param {TP.lama.Halo} aHalo The halo that is requesting the rectangle
     *     to use to display itself.
     * @returns {TP.dom.ElementNode} The next haloable ancestor of the
     *     receiver.
     */

    var parentElem;

    if (TP.isElement(parentElem = this.getNativeNode().parentNode)) {
        return TP.wrap(parentElem);
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getHaloRect',
function(aHalo) {

    /**
     * @method getHaloRect
     * @summary Returns the rectangle that the halo can use to display itself
     *     when it has the receiver selected. At this level, this method returns
     *     an empty TP.gui.Rect.
     * @param {TP.lama.Halo} aHalo The halo that is requesting the rectangle
     *     to use to display itself.
     * @returns {TP.gui.Rect} The rectangle that the halo will use to display
     *     itself.
     */

    return TP.rtc(0, 0, 0, 0);
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getNearestHaloFocusable',
function(aHalo) {

    /**
     * @method getNearestHaloFocusable
     * @summary Returns the next focusable (by the halo ) ancestor element of
     *     the receiver. Not all ancestors in the receiver's ancestor chain are
     *     'focusable' by the halo. Only ones that respond true to haloCanFocus
     *     are.
     * @param {TP.lama.Halo} aHalo The halo that is requesting the nearest
     *     halo-focusable ancestor.
     * @returns {TP.dom.ElementNode} The next halo-focusable ancestor of the
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

TP.dom.ElementNode.Inst.defineMethod('getNearestHaloGenerator',
function(aHalo) {

    /**
     * @method getNearestHaloGenerator
     * @summary Returns the next 'generator' ancestor element of the receiver.
     * @description This method returns the next parent up the ancestor chain
     *     that is a 'tag generator'. A generator is an Element that is usually
     *     a computed or templated tag that is responsible for generating
     *     content.
     * @param {TP.lama.Halo} aHalo The halo that is requesting the nearest
     *     generator ancestor.
     * @returns {TP.dom.ElementNode} The next generator ancestor of the
     *     receiver.
     */

    var generatorTPElem;

    /* eslint-disable consistent-this */
    generatorTPElem = this;
    /* eslint-enable consistent-this */

    if (TP.isKindOf(generatorTPElem, TP.tag.CustomTag)) {
        return generatorTPElem;
    }

    //  Keep iterating up the *haloable* ancestors of the receiver, looking for
    //  one that is a TP.tag.CustomTag (the parent type of computed and
    //  templated tag types). Return the first one found.
    while (TP.isValid(generatorTPElem = generatorTPElem.getHaloParent(aHalo))) {
        if (TP.isKindOf(generatorTPElem, TP.tag.CustomTag)) {
            return generatorTPElem;
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getNearestGeneratorStylesheet',
function(aHalo) {

    /**
     * @method getNearestGeneratorStylesheet
     * @summary Returns the stylesheet of the next 'generator' ancestor element
     *     of the receiver.
     * @description This method returns the stylesheet of the next parent up the
     *     ancestor chain that is a 'tag generator' *and* has an associated
     *     stylesheet. A generator is an Element that is usually a computed or
     *     templated tag that is responsible for generating content.
     * @param {TP.lama.Halo} aHalo The halo that is requesting the nearest
     *     generator ancestor.
     * @returns {CSSStyleSheet} The stylesheet of the next generator ancestor of
     *     the receiver that has a stylesheet.
     */

    var generatorTPElem,
        generatorSheet;

    /* eslint-disable consistent-this */
    generatorTPElem = this;
    /* eslint-enable consistent-this */

    if (TP.isKindOf(generatorTPElem, TP.tag.CustomTag)) {
        generatorSheet = generatorTPElem.getStylesheetForStyleResource();
        if (TP.isStyleSheet(generatorSheet)) {
            return generatorSheet;
        }
    }

    //  Keep iterating up the ancestors of the receiver, looking for one that is
    //  a TP.tag.CustomTag (the parent type of computed and templated tag types)
    //  and has a stylesheet. Return the stylesheet of the first one found.
    while (TP.isValid(generatorTPElem = generatorTPElem.getParentNode(aHalo))) {
        if (TP.isKindOf(generatorTPElem, TP.tag.CustomTag)) {
            generatorSheet = generatorTPElem.getStylesheetForStyleResource();
            if (TP.isStyleSheet(generatorSheet)) {
                return generatorSheet;
            }
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getNextHaloChild',
function(aHalo, aSignal) {

    /**
     * @method getNextHaloChild
     * @summary Returns the next 'haloable' child element of the receiver.
     * @description This method uses the target of the supplied signal to
     *     compute a possible haloable child. If that child is not haloable, it
     *     then traverses its ancestor chain until it comes to the receiver,
     *     looking for a haloable Element. If it doesn't find one and comes to
     *     the receiver, it exits and returns null.
     * @param {TP.lama.Halo} aHalo The halo that is requesting the next
     *     halo-focusable child.
     * @param {TP.sig.Signal} aSignal The signal that initiated the search for a
     *     haloable child.
     * @returns {TP.dom.ElementNode} The next haloable child between the
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

TP.dom.ElementNode.Inst.defineMethod('getPathPartsForInspector',
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

TP.dom.ElementNode.Inst.defineMethod('getUIEditorType',
function() {

    /**
     * @method getUIEditorType
     * @summary Returns the UIEditor subtype used to edit any UI elements.
     * @returns {null}
     */

    return null;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getContentForAdjusterTileBody',
function() {

    /**
     * @method getContentForAdjusterTileBody
     * @summary
     * @returns {}
     */

    return TP.xhtmlnode('<div class="editor_wrapper"/>');
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getContentForAdjusterTileFooter',
function() {

    /**
     * @method getContentForAdjusterTileBody
     * @summary
     * @returns {}
     */

    return TP.xhtmlnode('<div class="info"/><button class="inserter" on:click="{signal: AddProperty, origin: \'LamaAdjuster\'}"></button>');
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('haloCanBlur',
function(aHalo) {

    /**
     * @method haloCanBlur
     * @summary Returns whether or not the halo can blur (i.e. no longer focus
     *     on) the receiver.
     * @param {TP.lama.Halo} aHalo The halo that is requesting whether or not
     *     it can blur the receiver.
     * @returns {Boolean} Whether or not the halo can blur the receiver.
     */

    //  We can always blur
    return true;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('haloCanDelete',
function(aHalo) {

    /**
     * @method haloCanDelete
     * @summary Returns whether or not the halo can delete the receiver from its
     *     DOM tree.
     * @param {TP.lama.Halo} aHalo The halo that is requesting whether or not
     *     it can delete the receiver.
     * @returns {Boolean} Whether or not the halo can delete the receiver.
     */

    var currentTargetTPElem,

        ourName,
        appTagName;

    currentTargetTPElem = aHalo.get('currentTargetTPElem');

    ourName = currentTargetTPElem.getCanonicalName();

    //  NB: We pass false here to skip returning any Lama tag since we're
    //  running in a Lama-enabled environment.
    appTagName = TP.tibet.root.computeAppTagTypeName(false);

    //  If our (canonical) name is the same as the app tag name, then we don't
    //  allow it to be deleted.
    if (ourName === appTagName) {

        TP.bySystemId('LamaConsoleService').notify(
            'It is not possible to delete the root application tag.');

        return false;
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('haloCanEmpty',
function(aHalo) {

    /**
     * @method haloCanEmpty
     * @summary Returns whether or not the halo can empty the receiver from its
     *     DOM tree.
     * @param {TP.lama.Halo} aHalo The halo that is requesting whether or not
     *     it can empty the receiver.
     * @returns {Boolean} Whether or not the halo can empty the receiver.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('haloCanFocus',
function(aHalo) {

    /**
     * @method haloCanFocus
     * @summary Returns whether or not the halo can focus on the receiver.
     * @param {TP.lama.Halo} aHalo The halo that is requesting whether or not
     *     it can focus the receiver.
     * @returns {Boolean} Whether or not the halo can focus the receiver.
     */

    var ancestors,

        len,
        i;

    //  We cannot focus on elements that are Lama elements themselves, except
    //  'lama:tofu' elements.
    if (this.getNSURI() === TP.w3.Xmlns.LAMA &&
        this.getCanonicalName() !== 'lama:tofu') {
        return false;
    }

    //  We cannot focus on elements that are under a 'lama:tofu' element
    ancestors = this.getAncestors();

    len = ancestors.getSize();
    for (i = 0; i < len; i++) {
        if (ancestors.at(i).getCanonicalName() === 'lama:tofu') {
            return false;
        }
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('haloCornerStartedDragging',
function(aHalo, aSignal, haloCorner) {

    /**
     * @method haloCornerStartedDragging
     * @summary Invoked when a halo corner starts being dragged by the user.
     * @param {TP.lama.Halo} aHalo The halo whose corner is being dragged.
     * @param {TP.sig.DOMDragDown} aSignal The 'drag down' signal that was
     *     generated when the user began to drag.
     * @param {Number} haloCorner A numeric constant, such as TP.SOUTHEAST, that
     *     indicated the corner being dragged.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var manipulator;

    switch (haloCorner) {

        case TP.SOUTHEAST:
            if (aSignal.getAltKey()) {
                manipulator =
                    TP.byId('LamaGridManipulator', TP.win('UIROOT'));
            } else {
                manipulator =
                    TP.byId('LamaDimensionsManipulator', TP.win('UIROOT'));
            }
            manipulator.activate(aHalo.get('currentTargetTPElem'), aSignal);
            break;

        case TP.NORTHWEST:
            manipulator =
                TP.byId('LamaPositionManipulator', TP.win('UIROOT'));
            manipulator.activate(aHalo.get('currentTargetTPElem'), aSignal);
            break;
        default:
            break;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('hudCanConnect',
function(aHUD) {

    /**
     * @method hudCanConnect
     * @summary Returns whether or not the hud should allow the supplied element
     *     to be connected to the supplied element
     * @param {TP.lama.hud} aHUD The hud that is requesting whether or not
     *     it can connect the supplied element to the receiver.
     * @returns {Boolean} Whether or not the hud can connect the supplied target
     *     to the receiver.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('hudCanDrop',
function(aHUD, targetTPElem) {

    /**
     * @method hudCanDrop
     * @summary Returns whether or not the hud should allow the supplied element
     *     to be dropped into the receiver.
     * @param {TP.lama.hud} aHUD The hud that is requesting whether or not
     *     it can drop the supplied element into the receiver.
     * @param {TP.dom.ElementNode} droppingTPElem The element that is being
     *     dropped.
     * @returns {Boolean} Whether or not the hud can drop the supplied target
     *     into the receiver.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('resolveAspectForInspector',
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

    source = TP.lama.SingleEntryInspectorSource.construct();
    source.setPrimaryEntry(this.get(anAspect));

    return source;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('lamaDidInsertBreadcrumb',
function(insertionPointElement, insertionPosition) {

    /**
     * @method lamaDidInsertBreadcrumb
     * @summary Responds to the fact that the Lama initiated a DOM insertion
     *     by dropping a 'breadcrumb' element somewhere in a DOM visualization.
     * @param {Element} insertionPointElement The element that provides the
     *     insertion point to the insertion operation. This, in combination with
     *     the insertion position, will provide the place in the DOM to insert
     *     the new DOM node.
     * @param {String} insertionPosition The insertion position, relative to
     *     the insertion point element, that the new node should be inserted at.
     *     This could be TP.BEFORE_BEGIN, TP.AFTER_BEGIN, TP.BEFORE_END,
     *     TP.AFTER_END.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('lamaDidInsertTofu',
function(insertionPointElement, insertionPosition) {

    /**
     * @method lamaDidInsertTofu
     * @summary Responds to the fact that the Lama initiated a DOM insertion
     *     by dropping a 'tofu' element somewhere in a DOM visualization.
     * @param {Element} insertionPointElement The element that provides the
     *     insertion point to the insertion operation. This, in combination with
     *     the insertion position, will provide the place in the DOM to insert
     *     the new DOM node.
     * @param {String} insertionPosition The insertion position, relative to
     *     the insertion point element, that the new node should be inserted at.
     *     This could be TP.BEFORE_BEGIN, TP.AFTER_BEGIN, TP.BEFORE_END,
     *     TP.AFTER_END.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('lamaShouldAlterStyle',
function() {

    /**
     * @method lamaShouldAlterStyle
     * @summary Returns whether or not the Lama should alter the style for
     *     this type when updating the source document that the visual document
     *     is displaying. Typically, the Lama will alter application
     *     styles, but not TIBET core styles, such as those for XControls.
     * @returns {Boolean} Whether or not the Lama should alter the receiver's
     *     style.
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('lamaShouldAlterTemplate',
function() {

    /**
     * @method lamaShouldAlterTemplate
     * @summary Returns whether or not the Lama should alter the template for
     *     this type when updating the source document that the visual document
     *     is displaying. Typically, the Lama will alter application
     *     templates, but not TIBET core templates, such as those for XControls.
     * @description This method, normally associated with a template tag, is
     *     backstopped here (returning false) to avoid having to test for this
     *     method's presence on altered elements when updating source documents
     *     in the Lama.
     * @returns {Boolean} Whether or not the Lama should alter the receiver's
     *     template.
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getContentForDomHUDLabel',
function() {

    /**
     * @method getContentForDomHUDLabel
     * @summary Returns the label that the Lama's 'domhud' panel will use when
     *     displaying it's representation for this node.
     * @returns {String} The label to use in the 'domhud' panel.
     */

    return this.getFullName();
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getContentForBindsHUDTileBody',
function() {

    /**
     * @method getContentForBindsHUDTileBody
     * @summary Returns the content that the Lama's 'bindshud' panel will use
     *     as the 'tile body' when displaying it's 'tile' panel for this node.
     * @returns {Element} The Element that will be used as the content for the
     *     'body' of the bindshud tile panel.
     */

    return TP.xhtmlnode('<span class="cm-s-elegant">' +
                            'Fetching data...' +
                            '</span>');
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getContentForDomHUDTileBody',
function() {

    /**
     * @method getContentForDomHUDTileBody
     * @summary Returns the content that the Lama's 'domhud' panel will use
     *     as the 'tile body' when displaying it's 'tile' panel for this node.
     * @returns {Element} The Element that will be used as the content for the
     *     'body' of the domhud tile panel.
     */

    return TP.elem('<lama:domhud_genericElementContent/>');
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getContentForDomHUDTileFooter',
function() {

    /**
     * @method getContentForDomHUDTileFooter
     * @summary Returns the content that the Lama's 'domhud' panel will use
     *     as the 'tile footer' when displaying it's 'tile' panel for this node.
     * @returns {Element} The Element that will be used as the content for the
     *     'footer' of the domhud tile panel.
     */

    return TP.xhtmlnode('<button class="inserter" on:click="{signal: InsertItem, origin: \'DOMAttributes_Repeat\', payload: {source: \'urn:tibet:dom_attr_data_blank\', copy: true}}"></button>');
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getContentForStylesHUDTileBody',
function() {

    /**
     * @method getContentForStylesHUDTileBody
     * @summary Returns the content that the Lama's 'styleshud' panel will use
     *     as the 'tile body' when displaying it's 'tile' panel for this node.
     * @returns {Element} The Element that will be used as the content for the
     *     'body' of the styleshud tile panel.
     */

    return TP.elem('<lama:styleshud_ruleContent/>');
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getContentForStylesHUDTileFooter',
function() {

    /**
     * @method getContentForStylesHUDTileFooter
     * @summary Returns the content that the Lama's 'styleshud' panel will use
     *     as the 'tile footer' when displaying it's 'tile' panel for this node.
     * @returns {Element} The Element that will be used as the content for the
     *     'footer' of the styleshud tile panel.
     */

    return TP.xhtmlnode('<button class="inserter" on:click="{signal: InsertItem, origin: \'styleshud_rw_properties\', payload: {source: \'urn:tibet:style_prop_data_blank\', copy: true}}"></button>');
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getContentForRespondersHUDTileBody',
function(params) {

    /**
     * @method getContentForRespondersHUDTileBody
     * @summary Returns the content that the Lama's 'respondershud' panel will
     *     use as the 'tile body' when displaying it's 'tile' panel for this
     *     node.
     * @returns {Element} The Element that will be used as the content for the
     *     'body' of the respondershud tile panel.
     */

    var dataURI;

    dataURI = params.at('dataURI');

    return TP.elem('<xctrls:list id="ResponderMethodList"' +
                        ' bind:in="{data: ' + dataURI.asString() + '}"' +
                        ' on:UISelect="InspectResponderMethod"' +
                        ' tibet:ctrl="RespondersHUD"' +
                        ' filter="true"/>');
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('getContentForRespondersHUDTileFooter',
function() {

    /**
     * @method getContentForRespondersHUDTileFooter
     * @summary Returns the content that the Lama's 'respondershud' panel will
     *     use as the 'tile footer' when displaying it's 'tile' panel for this
     *     node.
     * @returns {Element} The Element that will be used as the content for the
     *     'footer' of the respondershud tile panel.
     */

    return TP.xhtmlnode('<button class="inserter" on:click="{signal: AddSignalHandler, origin: \'RespondersHUD\'}"/>');
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('lamaDidCopyNodeInto',
function(insertionPointElement, insertionPosition) {

    /**
     * @method lamaDidCopyNodeInto
     * @summary Responds to the fact that the Lama initiated a DOM reparenting
     *     operation (with cloning) by dropping a 'tofu' element that was
     *     generated by the halo somewhere in a DOM visualization.
     * @param {Element} insertionPointElement The element that provides the
     *     insertion point to the reparent operation of the cloned node. This,
     *     in combination with the insertion position, will provide the place in
     *     the DOM to reparent the DOM node.
     * @param {String} insertionPosition The insertion position, relative to
     *     the insertion point element, that the cloned node should be
     *     reparented at. This could be TP.BEFORE_BEGIN, TP.AFTER_BEGIN,
     *     TP.BEFORE_END, TP.AFTER_END.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var haloTPElem,
        haloTargetTPElem,

        newTPElem;

    //  The target element that we're moving is the halo's current target.
    haloTPElem = TP.byId('LamaHalo', TP.sys.getUIRoot());
    haloTargetTPElem = haloTPElem.get('currentTargetTPElem');

    //  Make sure to blur the halo to remove any highlighting or extra
    //  attributes from the node that we're copying.
    haloTPElem.blur();

    //  Clone the halo target element and remove the 'id' attribute (can't have
    //  more than 1 element in a document with the same id).
    newTPElem = haloTargetTPElem.clone();
    newTPElem.removeAttribute('id');

    //  NB: We queue this for the next time that the browser wants to repaint
    //  because all of those lovely microtasks that got queued to get us here
    //  (as the caller of this was tearing itself down - removing attributes and
    //  other nodes, etc.) we want to be flushed *before* we set the
    //  'shouldProcessDOMMutations' flag to be true.
    (function() {
        var newInsertedElem,
            newInsertedTPElem;

        //  Tell the main Lama object that it should go ahead and process DOM
        //  mutations to the source DOM.
        TP.bySystemId('Lama').set('shouldProcessDOMMutations', true);

        //  Move the copy of the target element. The deadening/awakening will be
        //  handled by the Mutation Observer machinery.
        newInsertedElem = TP.nodeInsertContent(
                                insertionPointElement,
                                TP.unwrap(newTPElem),
                                insertionPosition);

        newInsertedTPElem = TP.wrap(newInsertedElem);

        //  Focus the halo on our new element, passing true to actually show the
        //  halo if it's hidden.
        if (newInsertedTPElem.haloCanFocus(haloTPElem)) {
            haloTPElem.focusOn(newInsertedTPElem, true);
        }

    }).queueAfterNextRepaint(this.getNativeWindow());

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('lamaDidCopyTDCOutputNodeInto',
function(insertionPointElement, insertionPosition, tdcRequest) {

    /**
     * @method lamaDidCopyTDCOutputNodeInto
     * @summary Responds to the fact that the TDC initiated a DOM cloning
     *     operation of TDC output by dropping a 'tofu' element that was
     *     generated by a particular TDC output cell.
     * @param {Element} insertionPointElement The element that provides the
     *     insertion point to the reparent operation of the cloned node. This,
     *     in combination with the insertion position, will provide the place in
     *     the DOM to reparent the DOM node.
     * @param {String} insertionPosition The insertion position, relative to
     *     the insertion point element, that the cloned node should be
     *     reparented at. This could be TP.BEFORE_BEGIN, TP.AFTER_BEGIN,
     *     TP.BEFORE_END, TP.AFTER_END.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var cmdNode,

        insertedElem,

        haloTPElem;

    cmdNode = tdcRequest.at('cmdNode');

    insertedElem = this.lamaGetContentFromTDCOutputNode(cmdNode);

    haloTPElem = TP.byId('LamaHalo', TP.sys.getUIRoot());

    //  NB: We queue this for the next time that the browser wants to repaint
    //  because all of those lovely microtasks that got queued to get us here
    //  (as the caller of this was tearing itself down - removing attributes and
    //  other nodes, etc.) we want to be flushed *before* we set the
    //  'shouldProcessDOMMutations' flag to be true.
    (function() {

        var newInsertedTPElem;

        //  Tell the main Lama object that it should go ahead and process DOM
        //  mutations to the source DOM.
        TP.bySystemId('Lama').set('shouldProcessDOMMutations', true);

        //  Insert the content and capture the return element.
        newInsertedTPElem = TP.wrap(insertionPointElement).insertContent(
                                        insertedElem, insertionPosition);

        //  Focus the halo on our new element, passing true to actually show the
        //  halo if it's hidden.
        if (newInsertedTPElem.haloCanFocus(haloTPElem)) {
            haloTPElem.focusOn(newInsertedTPElem, true);
        }

    }).queueAfterNextRepaint(this.getNativeWindow());

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('lamaDidReparentNode',
function(insertionPointElement, insertionPosition) {

    /**
     * @method lamaDidReparentNode
     * @summary Responds to the fact that the Lama initiated a DOM reparenting
     *     operation by dropping a 'tofu' element that was generated by the halo
     *     somewhere in a DOM visualization.
     * @param {Element} insertionPointElement The element that provides the
     *     insertion point to the reparenting operation. This, in combination
     *     with the insertion position, will provide the place in the DOM to
     *     reparent the DOM node.
     * @param {String} insertionPosition The insertion position, relative to
     *     the insertion point element, that the node should be reparented at.
     *     This could be TP.BEFORE_BEGIN, TP.AFTER_BEGIN, TP.BEFORE_END,
     *     TP.AFTER_END.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    var haloTPElem,
        haloTargetTPElem;

    //  The target element that we're moving is the halo's current target.
    haloTPElem = TP.byId('LamaHalo', TP.sys.getUIRoot());
    haloTargetTPElem = haloTPElem.get('currentTargetTPElem');

    //  Make sure to blur the halo to remove any highlighting or extra
    //  attributes from the node that we're reparenting.
    haloTPElem.blur();

    //  NB: We queue this for the next time that the browser wants to repaint
    //  because all of those lovely microtasks that got queued to get us here
    //  (as the caller of this was tearing itself down - removing attributes and
    //  other nodes, etc.) we want to be flushed *before* we set the
    //  'shouldProcessDOMMutations' flag to be true.
    (function() {

        var newInsertedElem,
            newInsertedTPElem;

        //  Tell the main Lama object that it should go ahead and process DOM
        //  mutations to the source DOM.
        TP.bySystemId('Lama').set('shouldProcessDOMMutations', true);

        //  Move the target element. The deadening/awakening will be handled by
        //  the Mutation Observer machinery.
        newInsertedElem = TP.nodeInsertContent(
                                insertionPointElement,
                                TP.unwrap(haloTargetTPElem),
                                insertionPosition);

        newInsertedTPElem = TP.wrap(newInsertedElem);

        //  Focus the halo on our new element, passing true to actually show the
        //  halo if it's hidden.
        if (newInsertedTPElem.haloCanFocus(haloTPElem)) {
            haloTPElem.focusOn(newInsertedTPElem, true);
        }

    }).queueAfterNextRepaint(this.getNativeWindow());

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('lamaGetContentFromTDCOutputNode',
function(outputNode) {

    /**
     * @method lamaGetContentFromTDCOutputNode
     * @summary Returns a Node that will be the content that the Lama will
     *     use to insert into the current canvas when the user drops a 'tofu'
     *     element that was generated by a particular TDC output cell.
     * @param {Node} outputNode The node to derive the content from.
     * @returns {Node} The derived content node.
     */

    var newNode,

        insertedNode,
        scriptAncestor;

    //  Clone the outputNode.
    newNode = TP.nodeCloneNode(outputNode);

    //  If the node is an element remove the 'id' attribute (can't have more
    //  than 1 element in a document with the same id).
    if (TP.isElement(newNode)) {
        TP.elementRemoveAttribute(newNode, 'id', true);
    }

    //  If the outputNode is a 'native node' (i.e. XHTML, SVG or other natively
    //  supported element), then we insert it directly. Otherwise, we wrap it
    //  into a 'tsh:script' wrapper.
    if (TP.w3.Xmlns.isNativeNode(newNode)) {
        insertedNode = newNode;
    } else {
        //  Create a 'tsh:script' wrapper (unless we are already in one)
        scriptAncestor = this.getFirstAncestorBySelector('tsh|script');
        if (this.getCanonicalName() !== 'tsh:script' &&
            TP.notValid(scriptAncestor)) {

            scriptAncestor = TP.elem('<tsh:script/>');
            TP.nodeAppendChild(scriptAncestor, newNode, false);
            insertedNode = scriptAncestor;
        } else {
            insertedNode = newNode;
        }
    }

    return insertedNode;
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('lamaGetNearestMultipliedElement',
function() {

    /**
     * @method lamaGetNearestMultipliedElement
     * @summary Returns the node that was be modified when the Lama was in
     *     'grid multiply' mode or null if none can be found.
     * @description If the receiver itself is a grid multiplied element, then
     *     this method will return the receiver. Otherwise, it will return the
     *     nearest grid multiplied element between the receiver and it's
     *     'generator'.
     * @returns {TP.dom.ElementNode|null} The closest 'grid multiplied' element.
     */

    var elem,

        generatorTPElem,

        stopAncestor,

        multiplierGrid;

    elem = this.getNativeNode();

    //  If we're a multiplied element, just return ourself.
    if (TP.elementHasAttribute(elem, 'lama:multiplied')) {
        return this;
    }

    //  Look for an existing multiplied element between us and our halo
    //  generator
    generatorTPElem = this.getNearestHaloGenerator();

    if (TP.isValid(generatorTPElem)) {
        stopAncestor = generatorTPElem.getNativeNode();
    } else {
        stopAncestor = null;
    }

    TP.nodeAncestorsPerform(
        elem,
        function(ancestor) {
            if (TP.elementHasAttribute(ancestor, 'lama:multiplied')) {
                multiplierGrid = ancestor;
                return TP.BREAK;
            }
        },
        stopAncestor);

    return TP.wrap(multiplierGrid);
});

//  ------------------------------------------------------------------------

TP.dom.ElementNode.Inst.defineMethod('lamaGetTextContent',
function() {

    /**
     * @method lamaGetTextContent
     * @summary Returns the text content that the Lama will use when
     *     manipulating the receiver's 'text content'. Note that the Lama
     *     currently only manipulates a single Text node that exists as a leaf
     *     of an Element. If there is mixed Element and Text node content, then
     *     that is ignored and this method returns the empty String.
     * @returns {String} The text content that the Lama will use to manage the
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

TP.dom.ElementNode.Inst.defineMethod('lamaSetTextContent',
function(aContent) {

    /**
     * @method lamaSetTextContent
     * @summary Sets the text content of the receiver as the Lama would do it.
     *     Note that since the Lama currently does not handle more than a
     *     single Text node as a leaf under an Element node, if the receiver has
     *     descendant elements, this method will do nothing.
     * @param {String} aContent The content to set the receiver's text content
     *     to.
     * @returns {TP.dom.ElementNode} The receiver.
     */

    if (TP.notEmpty(this.getDescendantElements())) {
        return this;
    } else {
        this.setTextContent(aContent);
    }

    return this;
});

//  ========================================================================
//  TP.tag.CustomTag Additions
//  ========================================================================

//  ------------------------------------------------------------------------
//  Inspector API
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tag.CustomTag.Inst.defineMethod('getConfigForInspector',
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
     *          TP.ATTR + '_childtype':   The tag name of the content being
     *                                      put into the bay
     *          TP.ATTR + '_class':         Any additional CSS classes to put
     *                                      onto the bay inspector item itself
     *                                      to adjust to the content being
     *                                      placed in it.
     */

    options.atPut(TP.ATTR + '_childtype', 'xctrls:list');

    return options;
});

//  ------------------------------------------------------------------------

TP.tag.CustomTag.Inst.defineMethod('getContentForInspector',
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

    var dataURI,
        elem;

    if (options.at('targetAspect') === this.getID()) {

        dataURI = TP.uc(options.at('bindLoc'));

        elem = TP.elem(
                '<xctrls:list filter="true"' +
                ' alwayschange="true" itemtoggle="false"/>');

        TP.elementSetAttribute(
                elem, 'bind:in', '{data: ' + dataURI.asString() + '}', true);

        return elem;
    }

    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.tag.CustomTag.Inst.defineMethod('getDataForInspector',
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

//  ------------------------------------------------------------------------

TP.tag.CustomTag.Inst.defineMethod('isConnectorOpaque',
function() {

    /**
     * @method isConnectorOpaque
     * @summary Returns whether the receiver is 'connector opaque', which means
     *     that any connections to descendants of the receiver should be made
     *     to the receiver itself.
     * @returns {Boolean} Whether Lama connectors should treat the receiver as
     *     being 'opaque' and not connect to any of its descendants.
     */

    var ourName,
        appTagName;

    if (this.hasAttribute('lama:connector-accept')) {
        return true;
    }

    ourName = this.getCanonicalName();

    //  NB: We pass false here to skip returning any Lama tag since we're
    //  running in a Lama-enabled environment.
    appTagName = TP.tibet.root.computeAppTagTypeName(false);

    //  If our (canonical) name is the same as the app tag name, then we allow
    //  descendants to be connected.
    if (ourName === appTagName) {
        return false;
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.tag.CustomTag.Inst.defineMethod('lamaAllowDescendantMutations',
function(operation, currentAddressPosition, followingAddresses, allAddresses,
attributeName, attributeValue, oldAttributeValue) {

    /**
     * @method lamaAllowDescendantMutations
     * @summary Returns the node that should be modified when the Lama
     *     modifies the visual DOM that was rendered from this content. This
     *     allows the original source DOM node more control over modifications
     *     that the Lama is making
     * @param {String} operation The action such as TP.CREATE, TP.UPDATE or
     *     TP.DELETE that is currently causing the mutation.
     * @param {String} currentAddressPosition The dot-separated document address
     *     of the node being modified.
     * @param {String[]} followingAddresses The Array of dot-separated document
     *     addresses of all of the nodes being modified following the current
     *     node being modified
     * @param {String[]} allAddresses The Array of dot-separated document
     *     addresses of all of the nodes being modified.
     * @param {String} [attributeName] The name of the attribute that is changing
     *     (if this is an 'attributes' mutation).
     * @param {String} [attributeValue] The value of the attribute that is
     *     changing (if this is an 'attributes' mutation).
     * @param {String} [oldAttributeValue] The prior value of the attribute that
     *     is changing (if this is an 'attributes' mutation and the operation is
     *     TP.UPDATE or TP.DELETE).
     * @returns {Node|TP.CONTINUE} The node that should be the target for
     *     modifications or TP.CONTINUE if this node and it's descendants should
     *     be skipped for modification.
     */

    var traversalVal;

    traversalVal = this.getSerializationTraversal();

    if (traversalVal === TP.CONTINUE) {
        return false;
    } else if (traversalVal === TP.DESCEND) {
        return true;
    }

    return false;
});

//  ========================================================================
//  TP.tag.TemplatedTag Additions
//  ========================================================================

//  ------------------------------------------------------------------------
//  Inspector API
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.tag.TemplatedTag.Type.defineMethod('getDataForInspector',
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

TP.tag.TemplatedTag.Type.defineMethod('getEntryAt',
function(aSourceName) {

    /**
     * @method getEntryAt
     * @summary Returns the 'entry' in the receiver for the supplied source
     *     name. This will be the singular name used to register the entry.
     * @param {String} aSourceName The name of the entry to retrieve.
     * @returns {Object} The entry object registered under the supplied source
     *     name in the receiver.
     */

    var srcName,

        source;

    //  Sometimes entries come in with escaped slashes. Unescape that.
    srcName = TP.stringUnescapeSlashes(aSourceName);

    switch (srcName) {

        case 'Structure':
            //  NB: We're returning the TP.uri.URI instance itself here.
            source = this.getResourceURI('template', TP.ietf.mime.XHTML);

            break;

        case 'Style':
            //  NB: We're returning the TP.uri.URI instance itself here.
            source = this.getResourceURI('style', TP.ietf.mime.CSS);

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

TP.tag.TemplatedTag.Inst.defineMethod('resolveAspectForInspector',
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
            //  NB: We're returning the TP.uri.URI instance itself here.
            return thisType.getResourceURI('template', TP.ietf.mime.XHTML);

        case 'Style':
            //  NB: We're returning the TP.uri.URI instance itself here.
            return thisType.getResourceURI('style', TP.ietf.mime.CSS);

        default:
            return this.callNextMethod();
    }
});

//  ------------------------------------------------------------------------
//  Context Menu API
//  ------------------------------------------------------------------------

TP.tag.TemplatedTag.Inst.defineMethod('getContentForContextMenu',
function(options) {

    /**
     * @method getContentForContextMenu
     * @summary Returns the source's content that will be hosted in a Lama
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

    return TP.elem('<lama:templatedTagContextMenuContent/>');
});

//  ------------------------------------------------------------------------

TP.tag.TemplatedTag.Inst.defineMethod('lamaShouldAlterStyle',
function() {

    /**
     * @method lamaShouldAlterStyle
     * @summary Returns whether or not the Lama should alter the style for
     *     this type when updating the source document that the visual document
     *     is displaying. Typically, the Lama will alter application
     *     styles, but not TIBET core styles, such as those for XControls.
     * @returns {Boolean} Whether or not the Lama should alter the receiver's
     *     style.
     */

    var nsRoot;

    //  We only alter styles that are *not* under the lib ('TP') root.
    nsRoot = this.getType().getNamespaceRoot();
    if (nsRoot === 'TP') {
        return false;
    }

    return true;
});

//  ------------------------------------------------------------------------

TP.tag.TemplatedTag.Inst.defineMethod('lamaShouldAlterTemplate',
function() {

    /**
     * @method lamaShouldAlterTemplate
     * @summary Returns whether or not the Lama should alter the template for
     *     this type when updating the source document that the visual document
     *     is displaying. Typically, the Lama will alter application
     *     templates, but not TIBET core templates, such as those for XControls.
     * @returns {Boolean} Whether or not the Lama should alter the receiver's
     *     template.
     */

    var nsRoot;

    //  We only alter templates that are *not* under the lib ('TP') root.
    nsRoot = this.getType().getNamespaceRoot();
    if (nsRoot === 'TP') {
        return false;
    }

    return true;
});

//  ========================================================================
//  TP.tag.ComputedTag Additions
//  ========================================================================

TP.tag.ComputedTag.Inst.defineMethod('lamaGetNodeForVisualDOMChange',
function(mutatedVisualNode, operation, currentAddressPosition,
followingAddresses, allAddresses, attributeName, attributeValue,
oldAttributeValue) {

    /**
     * @method lamaGetNodeForVisualDOMChange
     * @summary Returns the node that should be modified when the Lama
     *     modifies the visual DOM that was rendered from this content. This
     *     allows the original source DOM node more control over modifications
     *     that the Lama is making.
     * @param {Node} mutatedVisualNode The visual node being mutated.
     * @param {String} operation The action such as TP.CREATE, TP.UPDATE or
     *     TP.DELETE that is currently causing the mutation.
     * @param {String} currentAddressPosition The dot-separated document address
     *     of the node being modified.
     * @param {String[]} followingAddresses The Array of dot-separated document
     *     addresses of all of the nodes being modified following the current
     *     node being modified
     * @param {String[]} allAddresses The Array of dot-separated document
     *     addresses of all of the nodes being modified.
     * @param {String} [attributeName] The name of the attribute that is changing
     *     (if this is an 'attributes' mutation).
     * @param {String} [attributeValue] The value of the attribute that is
     *     changing (if this is an 'attributes' mutation).
     * @param {String} [oldAttributeValue] The prior value of the attribute that
     *     is changing (if this is an 'attributes' mutation and the operation is
     *     TP.UPDATE or TP.DELETE).
     * @returns {Node|TP.CONTINUE} The node that should be the target for
     *     modifications or TP.CONTINUE if this node and it's descendants should
     *     be skipped for modification.
     */

    //  NB: We go after the native tag name here - not the element's 'name',
    //  which will be it's spoofed type name.
    if (mutatedVisualNode.tagName === 'a' &&
        TP.elementHasAttribute(mutatedVisualNode, 'tibet:no-rewrite')) {
        return this.callNextMethod();
    }

    return TP.CONTINUE;
});

//  ------------------------------------------------------------------------
//  Inspector API
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.tag.ComputedTag.Inst.defineMethod('resolveAspectForInspector',
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

            //  See if the tag has a type-local tagExpand method. If so, return
            //  it.
            if (TP.owns(thisType, 'tagExpand')) {
                return thisType.tagExpand;
            }

            //  See if the tag has a type tagExpand method. If so, return it.
            if (TP.owns(thisType.Type, 'tagExpand')) {
                return thisType.Type.tagExpand;
            }

            return null;

        case 'Style':

            return thisType.getResourceURI('style', TP.ietf.mime.CSS);

        default:
            return this.callNextMethod();
    }
});

//  ------------------------------------------------------------------------
//  Context Menu API
//  ------------------------------------------------------------------------

TP.tag.ComputedTag.Inst.defineMethod('getContentForContextMenu',
function(options) {

    /**
     * @method getContentForContextMenu
     * @summary Returns the source's content that will be hosted in a Lama
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

    return TP.elem('<lama:ComputedTagContextMenuContent/>');
});

//  ========================================================================
//  TP.dom.UIElementNode Additions
//  ========================================================================

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getHaloRect',
function(aHalo) {

    /**
     * @method getHaloRect
     * @summary Returns the rectangle that the halo can use to display itself
     *     when it has the receiver selected.
     * @param {TP.lama.Halo} aHalo The halo that is requesting the rectangle
     *     to use to display itself.
     * @returns {TP.gui.Rect} The rectangle that the halo will use to display
     *     itself.
     */

    var display,
        overflow,

        coords;

    //  If the element is an inline element with a visible overflow, then we use
    //  the 'global wrapping box' to display the halo. This takes into account
    //  descendants under the element that are visible, positioned and
    //  overflowing out of the bounds of the element.
    display = this.getComputedStyleProperty('display');
    overflow = this.getComputedStyleProperty('overflow');

    if (display === 'inline' && overflow === 'visible') {
        coords = TP.elementGetWrappingGlobalBox(this.getNativeNode());
        return TP.rtc(coords);
    }

    return this.getGlobalRect();
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('getUIEditorType',
function() {

    /**
     * @method getUIEditorType
     * @summary Returns the UIEditor subtype used to edit any UI elements.
     * @returns {TP.meta.dom.UIElementNodeEditor}
     */

    return TP.dom.UIElementNodeEditor;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('lamaDidInsertBreadcrumb',
function(insertionPointElement, insertionPosition) {

    /**
     * @method lamaDidInsertBreadcrumb
     * @summary Responds to the fact that the Lama initiated a DOM insertion
     *     by dropping a 'breadcrumb' element somewhere in a DOM visualization.
     * @param {Element} insertionPointElement The element that provides the
     *     insertion point to the insertion operation. This, in combination with
     *     the insertion position, will provide the place in the DOM to insert
     *     the new DOM node.
     * @param {String} insertionPosition The insertion position, relative to
     *     the insertion point element, that the new node should be inserted at.
     *     This could be TP.BEFORE_BEGIN, TP.AFTER_BEGIN, TP.BEFORE_END,
     *     TP.AFTER_END.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var inspector,
        childType,

        insertedCouchURI,

        assistantData,

        lambdaFunctionName,
        newElement,

        currentServiceTPElems,

        insertedURI,
        insertedLoc,
        contextTPElem,

        fullyExpandedLoc,
        virtualLoc;

    inspector = TP.byId('LamaInspector', TP.sys.getUIRoot());

    childType = inspector.getCurrentPropertyValueForTool(
                                'childType',
                                'canvas');

    switch (childType) {

        case 'remote/CouchDB/document':

            insertedCouchURI = inspector.getCurrentPropertyValueForTool(
                                        'data',
                                        'inspector');

            assistantData = TP.hc(
                'insertionPosition', insertionPosition,
                'insertionPoint', insertionPointElement,
                'uri', insertedCouchURI,
                'localStorageID', 'couch_doc' + TP.genID().replace('$', '_'));

            TP.lama.couchDocumentURIInsertionAssistant.
                                            showAssistant(assistantData);

            break;

        case 'remote/CouchDB/view':

            insertedCouchURI = inspector.getCurrentPropertyValueForTool(
                                        'data',
                                        'inspector');

            assistantData = TP.hc(
                'insertionPosition', insertionPosition,
                'insertionPoint', insertionPointElement,
                'uri', insertedCouchURI,
                'localStorageID', 'couch_view' + TP.genID().replace('$', '_'));

            TP.lama.couchViewURIInsertionAssistant.
                                            showAssistant(assistantData);

            break;

        case 'remote/AWS/lambda':

            lambdaFunctionName = inspector.get('selectedItems').last();

            //  Compute the new AWS service element with a type of 'lambda' and
            //  capturing the Lambda's function name.
            newElement = TP.elem(
                            '<aws:service type="lambda"' +
                            ' lambdaname="' + lambdaFunctionName + '"/>');

            //  Insert the 'aws:service' element into the canvas at the
            //  desired location.
            TP.bySystemId('Lama').insertElementIntoCanvas(
                newElement,
                insertionPointElement,
                insertionPosition,
                true,
                true);

            break;

        case 'uri':

            //  Grab the inserted URI from the data value of the current
            //  inspector selection.
            insertedURI = inspector.getCurrentPropertyValueForTool(
                                        'data',
                                        'inspector').getLocation();
            insertedLoc = insertedURI.getLocation();

            //  First, get the nearest 'generator' element for the supplied
            //  insertion point element. This will give us the nearest 'custom
            //  tag' up the parent chain.
            contextTPElem = TP.wrap(insertionPointElement).
                                            getNearestHaloGenerator();
            if (TP.notValid(contextTPElem)) {
                contextTPElem = TP.wrap(insertionPointElement).
                                            getDocument().getDocumentElement();
            }

            //  Search for 'http:service' elements that have an 'href' equal to
            //  the fully expanded location.
            fullyExpandedLoc = TP.uriExpandPath(insertedLoc);
            currentServiceTPElems =
                TP.byCSSPath('http|service[href="' + fullyExpandedLoc + '"]',
                contextTPElem,
                false,
                true);

            //  If none could be found, search for 'http:service' elements that
            //  have an 'href' equal to the TIBET virtualized location.
            if (TP.isEmpty(currentServiceTPElems)) {
                virtualLoc = TP.uriInTIBETFormat(fullyExpandedLoc);
                currentServiceTPElems =
                    TP.byCSSPath('http|service[href="' + virtualLoc + '"]',
                    contextTPElem,
                    false,
                    true);
            }

            //  If none could be found, tell the Lama to insert a
            //  'http:service' with that href at the insertion point and
            //  position. Note how we also pass true to have the Lama halo the
            //  element and pass true to have the Lama show the DOM property
            //  inspector for the element.
            if (TP.isEmpty(currentServiceTPElems)) {
                //  Insert a 'http:service' element into the canvas at the
                //  desired location.
                TP.bySystemId('Lama').insertServiceElementIntoCanvas(
                    insertedLoc,
                    null,
                    insertionPointElement,
                    insertionPosition,
                    true,
                    true);
            } else {
                //  Otherwise, let the user know that there is already a
                //  'http:service' element with that href.
                TP.alert('A http:service tag with a remote URI of: ' +
                            insertedLoc +
                            ' already exists within this custom element.',
                    TP.hc('dialogWindow', TP.sys.getUIRoot()));
            }

            break;

        default:
            break;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('lamaDidInsertJSONSchema',
function(insertionPointElement, insertionPosition, schemaSourceElement) {

    /**
     * @method lamaDidInsertJSONSchema
     * @summary Responds to the fact that the Lama initiated a DOM insertion
     *     by dropping a 'JSON schema' tile somewhere in a DOM visualization.
     * @param {Element} insertionPointElement The element that provides the
     *     insertion point to the insertion operation. This, in combination with
     *     the insertion position, will provide the place in the DOM to insert
     *     the new DOM node.
     * @param {String} insertionPosition The insertion position, relative to
     *     the insertion point element, that the new node should be inserted at.
     *     This could be TP.BEFORE_BEGIN, TP.AFTER_BEGIN, TP.BEFORE_END,
     *     TP.AFTER_END.
     * @param {Element} schemaSourceElement The element that provides the
     *     link back to the object providing the schema information.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var schemaSourceTPElem,

        dataSource,

        schemaData,
        path,

        schemaType,

        assistantData;

    schemaSourceTPElem = TP.wrap(schemaSourceElement);

    dataSource =
        schemaSourceTPElem.getAttribute('dnd:vend-source');

    if (TP.notEmpty(dataSource)) {

        dataSource = TP.bySystemId(
                        dataSource,
                        schemaSourceTPElem.getNativeDocument());

        if (TP.isValid(dataSource)) {

            schemaData = dataSource.getSchemaData(schemaSourceTPElem);
            path = schemaData.at('path');

            schemaType = schemaData.at('propInfo').at(path).at('schemaType');

            if (schemaType === 'object') {
                assistantData = TP.hc(
                                'insertionPosition',
                                    this.get('insertionPosition'),
                                'insertionPoint',
                                    insertionPointElement,
                                'uri',
                                    schemaData.at('sourceURI').getPrimaryURI(),
                                'localStorageID',
                                    'json_doc' + TP.genID().replace('$', '_'));

                //  Show the assistant.
                TP.lama.formBuilderAssistant.showAssistant(assistantData);
            }
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.UIElementNode.Inst.defineMethod('lamaDidInsertTofu',
function(insertionPointElement, insertionPosition) {

    /**
     * @method lamaDidInsertTofu
     * @summary Responds to the fact that the Lama initiated a DOM insertion
     *     by dropping a 'tofu' element somewhere in a DOM visualization.
     * @param {Element} insertionPointElement The element that provides the
     *     insertion point to the insertion operation. This, in combination with
     *     the insertion position, will provide the place in the DOM to insert
     *     the new DOM node.
     * @param {String} insertionPosition The insertion position, relative to
     *     the insertion point element, that the new node should be inserted at.
     *     This could be TP.BEFORE_BEGIN, TP.AFTER_BEGIN, TP.BEFORE_END,
     *     TP.AFTER_END.
     * @returns {TP.dom.UIElementNode} The receiver.
     */

    var assistantData;

    assistantData = TP.hc('insertionPosition', insertionPosition,
                            'insertionPoint', insertionPointElement);

    TP.lama.tofuInsertionAssistant.showAssistant(assistantData);

    return this;
});

//  ========================================================================
//  TP.tibet.template Additions
//  ========================================================================

TP.tibet.template.Inst.defineMethod('lamaGetNodeForVisualDOMChange',
function(mutatedVisualNode, operation, currentAddressPosition,
followingAddresses, allAddresses, attributeName, attributeValue,
oldAttributeValue) {

    /**
     * @method lamaGetNodeForVisualDOMChange
     * @summary Returns the node that should be modified when the Lama
     *     modifies the visual DOM that was rendered from this content. This
     *     allows the original source DOM node more control over modifications
     *     that the Lama is making.
     * @param {Node} mutatedVisualNode The visual node being mutated.
     * @param {String} operation The action such as TP.CREATE, TP.UPDATE or
     *     TP.DELETE that is currently causing the mutation.
     * @param {String} currentAddressPosition The dot-separated document address
     *     of the node being modified.
     * @param {String[]} followingAddresses The Array of dot-separated document
     *     addresses of all of the nodes being modified following the current
     *     node being modified
     * @param {String[]} allAddresses The Array of dot-separated document
     *     addresses of all of the nodes being modified.
     * @param {String} [attributeName] The name of the attribute that is changing
     *     (if this is an 'attributes' mutation).
     * @param {String} [attributeValue] The value of the attribute that is
     *     changing (if this is an 'attributes' mutation).
     * @param {String} [oldAttributeValue] The prior value of the attribute that
     *     is changing (if this is an 'attributes' mutation and the operation is
     *     TP.UPDATE or TP.DELETE).
     * @returns {Node|TP.CONTINUE} The node that should be the target for
     *     modifications or TP.CONTINUE if this node and it's descendants should
     *     be skipped for modification.
     */

    return TP.CONTINUE;
});

//  ========================================================================
//  TP.dom.MultipliedElement Additions
//  ========================================================================

TP.dom.MultipliedElement.Inst.defineMethod('isConnectorOpaque',
function() {

    /**
     * @method isConnectorOpaque
     * @summary Returns whether the receiver is 'connector opaque', which means
     *     that any connections to descendants of the receiver should be made
     *     to the receiver itself.
     * @returns {Boolean} Whether Lama connectors should treat the receiver as
     *     being 'opaque' and not connect to any of its descendants.
     */

    return false;
});

//  ------------------------------------------------------------------------

TP.dom.MultipliedElement.Inst.defineMethod('lamaGetSuccessorEditableTextNode',
function(direction, currentEditingElement) {

    /**
     * @method lamaGetSuccessorEditableTextNode
     * @summary Searches for the next editable text node for use with the
     *     Lama's inline text node editor. The default, at this level, is to
     *     return null to indicate there isn't one.
     * @param {String} aDirection The direction to search for the next editable
     *     text node. This should be TP.NEXT or TP.PREVIOUS.
     * @param {Element} currentEditingElement The element that contains the
     *     text node that is currently being edited.
     * @returns {TP.dom.TextNode|null} The text node to edit next or null.
     */

    var searchElem,

        cellElem,
        newCellElem,

        query,

        newEditingElement,
        newEditingTextNode;

    cellElem = null;

    searchElem = currentEditingElement;

    //  Search up from the element that contains the text node that we're
    //  currently editing for an Element that has a 'lama:multipliercell'
    //  attribute on it. Every cell created by the grid manipulator has this
    //  attribute, so we should find the one that contains it.
    while (TP.isElement(searchElem)) {
        if (TP.elementHasAttribute(searchElem, 'lama:multipliercell', true)) {
            cellElem = searchElem;
            break;
        }
        searchElem = searchElem.parentNode;
    }

    //  If we successfully found a cell, then try to compute the 'next' or
    //  'previous' one.
    if (TP.isElement(cellElem)) {

        //  Depending on the value of direction, compute the successor element,
        //  'wrapping' if necessary.
        if (direction === TP.NEXT) {
            newCellElem = cellElem.nextElementSibling;
            if (!TP.isElement(newCellElem)) {
                newCellElem = cellElem.parentNode.firstElementChild;
            }
        } else if (direction === TP.PREVIOUS) {
            newCellElem = cellElem.previousElementSibling;
            if (!TP.isElement(newCellElem)) {
                newCellElem = cellElem.parentNode.lastElementChild;
            }
        }

        //  Build a query of the current editing element under the current cell.
        //  Then use this to try to find the element under the new cell that is
        //  the closest match.
        query = TP.name(currentEditingElement).replace(':', '|');

        newEditingElement = TP.byCSSPath(query, newCellElem, true, false);

        //  If we found one, then get it's first Text node, if it has one. If it
        //  does, return that.
        if (TP.isElement(newEditingElement)) {
            newEditingTextNode = TP.nodeGetFirstChildByType(newEditingElement,
                                                            Node.TEXT_NODE);
            if (TP.isTextNode(newEditingTextNode)) {
                return newEditingTextNode;
            }
        }
    }

    return null;
});

//  ------------------------------------------------------------------------

TP.dom.MultipliedElement.Inst.defineMethod('lamaAllowDescendantMutations',
function(operation, currentAddressPosition, followingAddresses, allAddresses,
attributeName, attributeValue, oldAttributeValue) {

    /**
     * @method lamaAllowDescendantMutations
     * @summary Returns the node that should be modified when the Lama
     *     modifies the visual DOM that was rendered from this content. This
     *     allows the original source DOM node more control over modifications
     *     that the Lama is making
     * @param {String} operation The action such as TP.CREATE, TP.UPDATE or
     *     TP.DELETE that is currently causing the mutation.
     * @param {String} currentAddressPosition The dot-separated document address
     *     of the node being modified.
     * @param {String[]} followingAddresses The Array of dot-separated document
     *     addresses of all of the nodes being modified following the current
     *     node being modified
     * @param {String[]} allAddresses The Array of dot-separated document
     *     addresses of all of the nodes being modified.
     * @param {String} [attributeName] The name of the attribute that is changing
     *     (if this is an 'attributes' mutation).
     * @param {String} [attributeValue] The value of the attribute that is
     *     changing (if this is an 'attributes' mutation).
     * @param {String} [oldAttributeValue] The prior value of the attribute that
     *     is changing (if this is an 'attributes' mutation and the operation is
     *     TP.UPDATE or TP.DELETE).
     * @returns {Node|TP.CONTINUE} The node that should be the target for
     *     modifications or TP.CONTINUE if this node and it's descendants should
     *     be skipped for modification.
     */

    return true;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
