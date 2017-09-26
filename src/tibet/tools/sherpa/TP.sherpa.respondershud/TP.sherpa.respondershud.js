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
 * @type {TP.sherpa.respondershud}
 */

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.defineSubtype('respondershud');

TP.sherpa.respondershud.Inst.defineAttribute('currentTarget');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.respondershud.Inst.defineMethod('focusOnTarget',
function(aTPElement) {

    /**
     * @method focusOnTarget
     * @summary Focuses the receiver onto the supplied target.
     * @param {TP.core.UIElementNode} aTPElement The element to focus the
     *     receiver on.
     * @returns {TP.sherpa.respondershud} The receiver.
     */

    var node,
        attr,
        info,
        last;

    info = TP.ac();

    //  If the element is tofu, then we don't show any responders for it.
    if (aTPElement.getCanonicalName() === 'tibet:tofu') {
        this.setValue(info);
        return this;
    }

    node = aTPElement.getNativeNode();
    while (TP.isNode(node)) {
        if (!TP.nodeIsResponder(node)) {
            node = node.parentNode;
            continue;
        }

        //  Tricky part here is that if we're looking at a tag that
        //  also has a controller we want to push both into list.
        attr = node.getAttribute('tibet:ctrl');
        if (TP.notEmpty(attr)) {
            info.push(TP.ac(attr, attr));
        }

        attr = node.getAttribute('tibet:tag');
        if (TP.notEmpty(attr)) {
            info.push(TP.ac(attr, attr));
        } else {
            info.push(TP.ac(TP.lid(node, true), TP.tname(TP.wrap(node))));
        }

        node = node.parentNode;
    }

    //  Add controller stack so we see those as well.
    TP.sys.getApplication().getControllers().perform(
        function(item) {

            var tname;

            tname = TP.tname(item);

            //  NB: We filter out the Sherpa here
            if (tname !== 'TP.core.Sherpa') {
                info.push(TP.ac(TP.lid(item, true), TP.tname(item)));
            }
        });

    //  The list is from 'most specific to least specific' but we want to
    //  display 'top down' in the sidebar.
    info.reverse();

    this.setValue(info);

    //  Halo target is always last in the list, and always considered selected.
    last = this.get('listitems').last();
    if (TP.isValid(last)) {
        last.setAttribute('pclass:selected', 'true');
    }

    return this;
});

//  ------------------------------------------------------------------------
//  Handlers
//  ------------------------------------------------------------------------

TP.sherpa.respondershud.Inst.defineHandler('HaloDidBlur',
function(aSignal) {

    /**
     * @method handleHaloDidBlur
     * @summary Handles notifications of when the halo blurs on an object.
     * @param {TP.sig.HaloDidBlur} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.respondershud} The receiver.
     */

    var tile;

    this.callNextMethod();

    //  Hide the tile.
    tile = TP.byId('ResponderSummary_Tile', this.getNativeWindow());
    if (TP.isValid(tile)) {
        tile.setAttribute('hidden', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.respondershud.Inst.defineHandler('InspectResponderSource',
function(aSignal) {

    /**
     * @method handleInspectResponderSource
     * @summary Handles notifications of when the receiver wants to inspect the
     *     current target and shift the Sherpa's inspector to focus it on that
     *     target.
     * @param {TP.sig.ResponderSource} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.respondershud} The receiver.
     */

    var data,

        targetElem,

        indexInData,
        itemData,

        target,

        tile;

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

    //  Resolve the type from the type name that will be at the second position
    //  in the Array.
    target = TP.sys.getTypeByName(itemData.at(1));

    //  Hide the tile.
    tile = TP.byId('ResponderSummary_Tile', this.getNativeWindow());
    if (TP.isValid(tile)) {
        tile.setAttribute('hidden', true);
    }

    //  Fire the inspector signal on the next repaint (which will ensure the
    //  tile is closed before navigating).
    (function() {
        //  Not an element so focus inspector, not halo.
        this.signal('InspectObject',
                    TP.hc('targetObject', target,
                            'targetAspect', TP.id(target),
                            'showBusy', true));
    }.bind(this)).queueForNextRepaint(this.getNativeWindow());

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.respondershud.Inst.defineHandler('InspectResponderMethod',
function(aSignal) {

    /**
     * @method handleInspectResponderMethod
     * @summary Handles notifications of when the receiver wants to inspect the
     *     selected responder method in the Sherpa inspector.
     * @param {TP.sig.InspectResponderMethod} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.respondershud} The receiver.
     */

    var val,
        target;

    val = TP.wrap(aSignal.getSignalOrigin()).get('value');
    if (TP.notEmpty(val)) {

        //  Grab the method by going to the '.Inst' of our current target (which
        //  should be a type) and looking for that slot.
        target = this.get('currentTarget').Inst[val];

        //  Hide the tile.
        TP.byId('ResponderSummary_Tile', this.getNativeWindow()).setAttribute(
                                                                'hidden', true);

        //  Fire the inspector signal on the next repaint (which will ensure the
        //  tile is closed before navigating).
        (function() {
            this.signal('InspectObject',
                        TP.hc('targetObject', target,
                                'showBusy', true));
        }.bind(this)).queueForNextRepaint(this.getNativeWindow());
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.respondershud.Inst.defineHandler('MutationDetach',
function(aSignal) {

    /**
     * @method handleMutationDetach
     * @summary Handles notifications of node detachment from the current UI
     *     canvas.
     * @param {TP.sig.MutationDetach} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.respondershud} The receiver.
     */

    var tile;

    this.callNextMethod();

    if (this.get('$isRecasting')) {
        return this;
    }

    //  Hide the tile.
    tile = TP.byId('ResponderSummary_Tile', this.getNativeWindow());
    if (TP.isValid(tile)) {
        tile.setAttribute('hidden', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.respondershud.Inst.defineHandler('ShowHandlerList',
function(aSignal) {

    /**
     * @method handleShowHandlerList
     * @summary Handles notifications of when the receiver wants to show the
     *     rule text in a side popup panel.
     * @param {TP.sig.ShowHandlerList} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.respondershud} The receiver.
     */

    var data,

        targetElem,

        indexInData,
        itemData,

        target,

        win,

        centerTPElem,
        centerTPElemPageRect,

        targetElemPageRect,

        dataURI,

        methods;

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

    //  Prevent default *on the trigger signal* (which is the GUI signal - the
    //  contextmenu signal) so that any sort of 'right click' menu doesn't show.
    aSignal.at('trigger').preventDefault();

    //  Convert to a Number and retrieve the entry Array from our data
    indexInData = indexInData.asNumber();
    itemData = data.at(indexInData);

    //  Resolve the type from the type name that will be at the second position
    //  in the Array.
    target = TP.sys.getTypeByName(itemData.at(1));
    this.set('currentTarget', target);

    dataURI = TP.uc('urn:tibet:responder_methods');
    methods = this.getHandlerMethodsFor(target);
    dataURI.setResource(methods);

    // dataURI.setResource(target.getSupertypeNames());

    win = this.getNativeWindow();

    //  Use the same 'X' coordinate where the 'center' div is located in the
    //  page.
    centerTPElem = TP.byId('center', win);
    centerTPElemPageRect = centerTPElem.getPageRect();

    //  Use the 'Y' coordinate where the target element is located in the page.
    targetElemPageRect = TP.wrap(targetElem).getPageRect();

    //  Show the rule text in the tile. Note how we wrap the content with a span
    //  with a CodeMirror CSS class to make the styling work.
    TP.bySystemId('Sherpa').showTileAt(
        'ResponderSummary_Tile',
        'Responder Methods',
        function(aTileTPElem) {
            var tileWidth,
                xCoord,

                contentTPElem;

            //  The tile already existed

            tileWidth = aTileTPElem.getWidth();

            xCoord = centerTPElemPageRect.getX() +
                        centerTPElemPageRect.getWidth() -
                        tileWidth;
            aTileTPElem.setPagePosition(
                        TP.pc(xCoord, targetElemPageRect.getY()));

            contentTPElem = aTileTPElem.getFirstChildElement();
            contentTPElem.refresh();
        },
        function(aTileTPElem) {
            var tileWidth,
                xCoord,

                contentTPElem;

            //  The tile is new

            //  TODO: This is cheesy
            tileWidth = 300;

            xCoord = centerTPElemPageRect.getX() +
                        centerTPElemPageRect.getWidth() -
                        tileWidth;
            aTileTPElem.setPagePosition(
                        TP.pc(xCoord, targetElemPageRect.getY()));

            contentTPElem = aTileTPElem.setContent(
                TP.elem('<xctrls:list id="ResponderMethodList"' +
                        ' bind:in="{data: ' + dataURI.asString() + '}"' +
                        ' on:UISelect="InspectResponderMethod"' +
                        ' tibet:ctrl="RespondersHUD"' +
                        '/>'));

            contentTPElem.awaken();
            contentTPElem.refresh();
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.respondershud.Inst.defineMethod('getHandlerMethodsFor',
function(aType) {

    /**
     * @method getHandlerMethodsFor
     * @summary Retrieves the (instance-level) handler methods for the supplied
     *     type.
     * @param {TP.lang.RootObject} aType The type to produce the handler methods
     *     for.
     * @returns {Array[]} An Array of Arrays containing the names of the
     *     instance-level 'handler only' methods for the supplied type.
     */

    var sourceType,

        result,

        instProto,
        superInstProto,

        rawData;

    sourceType = aType;

    result = TP.ac();

    instProto = sourceType.getInstPrototype();
    superInstProto = sourceType.getSupertype().getInstPrototype();

    //  ---

    //  Methods introduced on the type itself.

    result.push(TP.GROUPING_PREFIX + ' - Introduced');

    rawData = instProto.getInterface(
                    TP.SLOT_FILTERS.known_introduced_methods).sort();

    rawData = rawData.filter(
                    function(anItem) {
                        return /^handle/.test(anItem);
                    });

    result.push(rawData);

    //  ---

    //  Methods overridden from a supertype on the type.

    result.push(TP.GROUPING_PREFIX + ' - Overridden');

    rawData = instProto.getInterface(
                    TP.SLOT_FILTERS.known_overridden_methods).sort();

    rawData = rawData.filter(
                    function(anItem) {
                        return /^handle/.test(anItem);
                    });

    rawData.forEach(
            function(item) {
                var owner;

                //  Note here how we get the owner from our supertype's version
                //  of the method - we know we've overridden it, so we want the
                //  owner we've overridden it from.
                if (TP.isValid(instProto[item]) &&
                    TP.isValid(owner = superInstProto[item][TP.OWNER])) {
                    result.push(item + ' (' + TP.name(owner) + ')');
                } else {
                    result.push(item + ' (none)');
                }
            });

    //  ---

    //  Methods inherited from a supertype on the type.

    result.push(TP.GROUPING_PREFIX + ' - Inherited');

    rawData = instProto.getInterface(
                    TP.SLOT_FILTERS.known_inherited_methods).sort();

    rawData = rawData.filter(
                    function(anItem) {
                        return /^handle/.test(anItem);
                    });

    rawData.forEach(
            function(item) {
                var owner;

                if (TP.isValid(instProto[item]) &&
                    TP.isValid(owner = instProto[item][TP.OWNER])) {
                    result.push(item + ' (' + TP.name(owner) + ')');
                } else {
                    result.push(item + ' (none)');
                }
            });

    result = result.flatten();

    result = result.collect(
                function(entry) {
                    return TP.ac(
                            entry,
                            entry);
                });

    return result;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
