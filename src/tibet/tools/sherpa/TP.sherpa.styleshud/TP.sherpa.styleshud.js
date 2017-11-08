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
 * @type {TP.sherpa.styleshud}
 */

//  ------------------------------------------------------------------------

TP.sherpa.hudsidebar.defineSubtype('styleshud');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Type.defineMethod('tagAttachComplete',
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
        tpElem,

        westDrawer,
        moveTileFunc;

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

    //  Grab the west drawer and define a function that, when the drawer
    //  animates back and forth into and out of its collapsed position that, if
    //  a tile is showing, will move the tile to the edge of the drawer.
    westDrawer = TP.byId('west', TP.win('UIROOT'));

    moveTileFunc = function(transitionSignal) {

        var tileTPElem,

            centerElem,
            centerElemPageRect;

        tileTPElem = TP.byId('StyleSummary_Tile', this.getNativeDocument());
        if (TP.isValid(tileTPElem) && tileTPElem.isVisible()) {
            //  Grab the center element and it's page rectangle.
            centerElem = TP.byId('center', this.getNativeWindow());
            centerElemPageRect = centerElem.getPageRect();

            tileTPElem.setPageX(centerElemPageRect.getX());
        }

    }.bind(tpElem);

    moveTileFunc.observe(westDrawer, 'TP.sig.DOMTransitionEnd');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineAttribute('$currentDNDTarget');
TP.sherpa.styleshud.Inst.defineAttribute('$tileContentConstructed');
TP.sherpa.styleshud.Inst.defineAttribute('$propertyNames');

TP.sherpa.styleshud.Inst.defineAttribute('attributesTarget');

TP.sherpa.styleshud.Inst.defineAttribute('highlighted');

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineMethod('buildPropertiesModel',
function(ruleInfo) {

    /**
     * @method buildPropertiesModel
     * @summary Builds the model object used for binding the attributes tile
     *     panel GUI controls.
     * @param {TP.core.Element} targetTPElem The element to obtain the set of
     *     attributes from.
     * @returns {TP.core.JSONContent} The JSON content object that will be used
     *     as the model.
     */

    var propertyDeclsStr,

        declsData,
        rule,
        decls,

        modelObj,
        newInsertionInfo,
        names,
        ruleProps;

    //  The property declarations String will be at the 3rd position in our
    //  entry.
    propertyDeclsStr = ruleInfo.at(2);

    declsData = TP.extern.cssParser.parse(propertyDeclsStr);
    rule = declsData.stylesheet.rules[0];
    decls = rule.declarations;

    //  Build the model object.
    modelObj = TP.hc();

    //  Register a hash to be placed at the top-level 'info' slot in the model.
    newInsertionInfo = TP.hc();
    modelObj.atPut('info', newInsertionInfo);

    names = TP.ac();

    //  Iterate over the target's attributes and populate the data model with
    //  the name and value.
    ruleProps = TP.ac();
    decls.forEach(
        function(aDecl) {
            ruleProps.push(
                TP.hc('rulePropName', aDecl.property,
                        'rulePropValue', aDecl.value));

            names.push(aDecl.property);
        });
    this.set('$propertyNames', names);

    newInsertionInfo.atPut('ruleProps', ruleProps);

    //  Construct a JSONContent object around the model object so that we can
    //  bind to it using the more powerful JSONPath constructs
    modelObj = TP.core.JSONContent.construct(TP.js2json(modelObj));

    return modelObj;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineMethod('focusOnTarget',
function(aTPElement) {

    /**
     * @method focusOnTarget
     * @summary Focuses the receiver onto the supplied target.
     * @param {TP.core.UIElementNode} aTPElement The element to focus the
     *     receiver on.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var info,
        node,

        ruleInfo,

        currentRuleIndex,

        tileTPElem,

        propertiesTarget,

        modelObj,
        modelURI,

        centerElem,
        centerElemPageRect,

        currentItemTPElem,

        targetElemPageRect;

    //  If the element is tofu, then we don't show any style for it.
    if (aTPElement.getCanonicalName() === 'tibet:tofu') {
        this.setValue(TP.ac());
        return this;
    }

    info = TP.ac();

    node = TP.canInvoke(aTPElement, 'getNativeNode') ?
                            aTPElement.getNativeNode() :
                            aTPElement;

    if (TP.isElement(node)) {

        //  Note here that we pass true to flush the element's cached ruleset.
        //  This ensures the most accurate results when focusing.
        ruleInfo = TP.elementGetAppliedStyleInfo(node, true);

        //  Finally, we populate the info that will go into the sidebar
        ruleInfo.perform(
            function(aRuleInfo) {
                info.push(
                    TP.ac(
                        TP.uriInTIBETFormat(aRuleInfo.at('sheetLocation')),
                        aRuleInfo.at('originalSelector'),
                        aRuleInfo.at('rule').cssText,
                        aRuleInfo.at('rule')));
            });
    }

    info.reverse();

    currentRuleIndex = this.get('$currentRuleIndex');
    if (TP.notValid(currentRuleIndex)) {
        currentRuleIndex = 0;
    }

    this.set('$currentRuleIndex', currentRuleIndex);

    //  List expects an array of arrays containing IDs and full names.
    this.setValue(info);

    //  Scroll our list content to its bottom.
    this.get('listcontent').scrollTo(TP.BOTTOM);

    tileTPElem = TP.byId('StyleSummary_Tile', this.getNativeDocument());
    if (TP.isValid(tileTPElem) && tileTPElem.isVisible()) {

        propertiesTarget = this.get('propertiesTarget');

        //  Compute a new model from the new target element
        modelObj = this.buildPropertiesModel(propertiesTarget);

        //  Set it as the resource of the URI.
        modelURI = TP.uc('urn:tibet:styles_prop_source');
        modelURI.setResource(modelObj, TP.hc('signalChange', true));

        //  Grab the center element and it's page rectangle.
        centerElem = TP.byId('center', this.getNativeWindow());
        centerElemPageRect = centerElem.getPageRect();

        //  Get the currently displayed lozenge given that the peerID should
        //  be the same as it was for the old lozenge.
        currentItemTPElem = TP.byCSSPath(
                                'li[indexInData="' + currentRuleIndex + '"]',
                                this.getNativeNode(),
                                true);

        //  Grab it's page rect.
        targetElemPageRect = currentItemTPElem.getPageRect();

        //  Set the page position of the tile based on the two rectangles X
        //  and Y, respectively.
        tileTPElem.setPagePosition(
            TP.pc(centerElemPageRect.getX(), targetElemPageRect.getY()));
    }

    return this;
});

//  ------------------------------------------------------------------------
//  TP.core.D3Tag Methods
//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineMethod('buildNewContent',
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

    var domContent,

        currentRuleIndex,
        indexInData;

    domContent = enterSelection.append('li');

    currentRuleIndex = this.get('$currentRuleIndex');
    indexInData = 0;

    domContent.attr(
            'pclass:selected',
            function(d, i) {
                if ((i / 2).floor() === currentRuleIndex) {
                    return true;
                }
            }).attr(
            'indexInData',
            function(d) {
                var currentIndex;

                if (d[1] !== 'spacer') {
                    currentIndex = indexInData;
                    indexInData++;

                    return currentIndex;
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
                    val += ' selector';
                }

                return val;
            }).each(
            function(d) {
                var hintContent,
                    hintElement;

                TP.elementSetAttribute(
                        this, 'dnd:accept', 'tofu', true);

                if (d[1] !== 'spacer') {
                    hintContent = TP.extern.d3.select(this).append(
                                                            'xctrls:hint');
                    hintContent.html(
                        function(d, i) {
                            return '<span xmlns="' + TP.w3.Xmlns.XHTML + '">' +
                                    d[1] +
                                    '</span>';
                        }
                    );

                    hintElement = hintContent.node();

                    TP.xctrls.hint.setupHintOn(
                        this, hintElement, TP.hc('triggerPoint', TP.MOUSE));
                }
            });

    return domContent;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineMethod('computeSelectionData',
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
            TP.ac('spacer_' + i, 'spacer', 'spacer_'));
    }

    return newData;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineMethod('updateExistingContent',
function(updateSelection) {

    /**
     * @method updateExistingContent
     * @summary Updates any existing content in the receiver by altering the
     *     content in the supplied d3.js 'update selection'.
     * @param {TP.extern.d3.selection} updateSelection The d3.js update
     *     selection that existing content should be altered in.
     * @returns {TP.extern.d3.selection} The supplied update selection.
     */

    var currentRuleIndex,
        indexInData;

    currentRuleIndex = this.get('$currentRuleIndex');
    indexInData = 0;

    updateSelection.attr(
            'pclass:selected',
            function(d, i) {
                if ((i / 2).floor() === currentRuleIndex) {
                    return true;
                }
            }).attr(
            'indexInData',
            function(d) {
                var currentIndex;

                if (d[1] !== 'spacer') {
                    currentIndex = indexInData;
                    indexInData++;

                    return currentIndex;
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
                    val += ' selector';
                }

                return val;
            }).each(
            function() {
                TP.elementSetAttribute(
                    this, 'dnd:accept', 'tofu', true);
            });

    return updateSelection;
});

//  ------------------------------------------------------------------------
//  Handlers
//  ----------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineHandler('DOMDNDTargetOver',
function(aSignal) {

    /**
     * @method handleDOMDNDTargetOver
     * @summary Handles when the drag and drop system enters a possible drop
     *     target.
     * @param {TP.sig.DOMDNDTargetOver} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */


    var dndTargetElem;

    dndTargetElem = aSignal.getDOMTarget();

    TP.elementAddClass(dndTargetElem, 'sherpa-styleshud-droptarget');

    this.set('$currentDNDTarget', dndTargetElem);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineHandler('DOMDNDTargetOut',
function(aSignal) {

    /**
     * @method handleDOMDNDTargetOut
     * @summary Handles when the drag and drop system exits a possible drop
     *     target.
     * @param {TP.sig.DOMDNDTargetOut} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var dndTargetElem;

    dndTargetElem = aSignal.getDOMTarget();

    //  Remove the CSS class placed on the drop target and set the attribute we
    //  use to track the current DND target to null.
    TP.elementRemoveClass(dndTargetElem, 'sherpa-styleshud-droptarget');

    this.set('$currentDNDTarget', null);

    return this;
});

//  ----------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineHandler('DOMDNDCompleted',
function(aSignal) {

    /**
     * @method handleDOMDNDCompleted
     * @summary Handles when the drag and drop system completes a dragging
     *     session.
     * @param {TP.sig.DOMDNDCompleted} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var dndTargetElem;

    dndTargetElem = this.get('$currentDNDTarget');

    if (TP.isElement(dndTargetElem)) {

        //  Remove the class placed on the drop target and set the attribute we
        //  use to track the current DND target to null.
        TP.elementRemoveClass(dndTargetElem, 'sherpa-styleshud-droptarget');
        this.set('$currentDNDTarget', null);

        if (TP.elementHasClass(dndTargetElem, 'spacer')) {
            TP.info('Create new rule');
        } else {
            TP.info('Create new property');
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineHandler('HaloDidBlur',
function(aSignal) {

    /**
     * @method handleHaloDidBlur
     * @summary Handles notifications of when the halo blurs on an object.
     * @param {TP.sig.HaloDidBlur} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var tile;

    this.callNextMethod();

    //  Hide the tile.
    tile = TP.byId('StyleSummary_Tile', this.getNativeWindow());
    if (TP.isValid(tile)) {
        tile.setAttribute('hidden', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineHandler('SelectRule',
function(aSignal) {

    /**
     * @method handleSelectRule
     * @summary
     * @param {TP.sig.FocusHalo} aSignal The TIBET signal which triggered this
     *     method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var targetElem,

        indexInData;

    //  Grab the target and make sure it's an 'item' tile.
    targetElem = aSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'item')) {
        return this;
    }

    //  Get the value of the target's indexInData attribute.
    indexInData = TP.elementGetAttribute(targetElem, 'indexInData', true);

    //  No indexInData? Exit here.
    if (TP.isEmpty(indexInData)) {
        return this;
    }

    //  Convert to a Number and retrieve the entry Array from our data
    indexInData = indexInData.asNumber();

    this.set('$currentRuleIndex', indexInData);

    this.render();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineHandler('ShowRuleText',
function(aSignal) {

    /**
     * @method ShowRuleText
     * @summary Responds to mouse contextmenu notifications by toggling a
     *     class on individual peer elements. The result is that as the user
     *     right clicks over elements in the sidebar the attributes panel is
     *     shown for the corresponding element.
     * @param {TP.sig.ShowRuleText} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var targetElem,

        data,
        indexInData,
        itemData,

        centerElem,
        centerElemPageRect,

        targetElemPageRect,

        modelURI,
        modelObj,

        tileTPElem,

        existedHandler,
        newHandler;

    targetElem = aSignal.getDOMTarget();
    if (!TP.elementHasClass(targetElem, 'selector')) {
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

    this.set('propertiesTarget', itemData);

    //  Use the same 'X' coordinate where the 'center' div is located in the
    //  page.
    centerElem = TP.byId('center', this.getNativeWindow());
    centerElemPageRect = centerElem.getPageRect();

    //  Use the 'Y' coordinate where the target element is located in the page.
    targetElemPageRect = TP.wrap(targetElem).getPageRect();

    //  ---

    //  Set up a model URI and observe it for change ourself. This will allow us
    //  to regenerate the tag representation as the model changes.
    modelURI = TP.uc('urn:tibet:styles_prop_source');

    modelObj = this.buildPropertiesModel(itemData);

    //  If we've already constructed the tile content, just set the resource on
    //  the model URI. This will cause the bindings to update.
    if (this.get('$tileContentConstructed')) {
        existedHandler =
            function(aTileTPElem) {

                //  Set the model's URI's resource and signal change. This will
                //  cause the properties to update.
                modelURI.setResource(modelObj, TP.hc('signalChange', true));

                //  Position the tile
                tileTPElem = TP.byId('StyleSummary_Tile',
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
                            '<span class="styles_properties" bind:scope="urn:tibet:styles_prop_source#jpath($.info)">' +
                                '<div id="styleshud_properties" bind:repeat="ruleProps">' +
                                        '<input type="text" bind:io="{value: rulePropName}" tabindex="0"/>' +
                                        '<input type="text" bind:io="{value: rulePropValue}" tabindex="0"/>' +
                                        '<span class="deleter" on:click="{signal: DeleteItem, origin: \'styleshud_properties\', payload: {index:TP.TARGET}}"/>' +
                                    '<br/>' +
                                '</div>' +
                                '<div class="inserter" on:click="{signal: InsertItem, origin: \'styleshud_properties\', payload: {source: \'urn:tibet:style_prop_data_blank\', copy: true}}"></div>' +
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
        'StyleSummary_Tile',
        'Rule Properties',
        existedHandler,
        newHandler);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles when the user changes the value of the underlying model.
     * @param {ValueChange} aSignal The signal that caused this handler to trip.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var aspectPath,

        propertiesTarget,

        rule,

        modelObj,

        nameAspectPath,
        valueAspectPath,

        name,
        value,

        allPropNames,

        action,

        propIndex,
        oldPropName,

        hadProperty,

        removedData,

        haloTPElem,
        haloTargetTPElem;

    aspectPath = aSignal.at('aspect');

    //  If the whole value changed, we're not interested.
    if (aspectPath === 'value') {
        return this;
    }

    //  Make sure we have a valid current target.
    propertiesTarget = this.get('propertiesTarget');
    if (TP.notValid(propertiesTarget)) {
        return this;
    }

    rule = propertiesTarget.at(3);

    //  Grab an ordered list of all of the attribute names.
    allPropNames = this.get('$propertyNames');

    action = aSignal.at('action');

    //  If the action is TP.UPDATE, then the user added an attribute or changed
    //  one of the existing attributes. Note that we don't concern ourselves
    //  with an action of TP.INSERT/TP.CREATE, because that means that the user
    //  has clicked the '+' button to insert a new attribute row, but hasn't
    //  filled out the name and value and we don't want to process blank
    //  attributes..
    if (action === TP.UPDATE) {

        //  Grab the model object where our data is located.
        modelObj =
            TP.uc('urn:tibet:styles_prop_source').getResource().get('result');

        //  Compute a name aspect path by replacing 'rulePropValue' with
        //  'rulePropName' in the value aspect path.
        nameAspectPath = aspectPath.slice(0, aspectPath.lastIndexOf('.') + 1) +
                            'rulePropName';
        valueAspectPath = aspectPath.slice(0, aspectPath.lastIndexOf('.') + 1) +
                            'rulePropValue';

        //  Grab the name and value from the model.
        name = modelObj.get(nameAspectPath);
        value = modelObj.get(valueAspectPath);

        //  If we're changing the attribute name, but we have an empty value,
        //  then just exit here - no sense in doing a 'set'
        if (aspectPath.endsWith('rulePropName') && TP.isEmpty(value)) {
            return this;
        }

        //  If we're changing the attribute name at this point (with an
        //  attribute that has a real value)
        if (aspectPath.endsWith('rulePropName')) {

            //  We always set hadProperty to true for this case, because we're
            //  actually 'removing' an attribute that did exist.
            hadProperty = true;

            //  Slice out the index, convert it to a number and get the
            //  attribute name at that index in our list of all attribute names.
            //  This will tell us the old attribute name.
            propIndex = aspectPath.slice(
                        aspectPath.indexOf('[') + 1,
                        aspectPath.indexOf(']'));
            propIndex = propIndex.asNumber();
            oldPropName = allPropNames.at(propIndex);

            //  If we got one, remove the attribute at that position.
            if (TP.notEmpty(oldPropName)) {
                try {
                    rule.style.removeProperty(oldPropName);
                } catch (e) {
                    TP.ifError() ?
                        TP.error('Error removing old CSS property: ' +
                                    oldPropName) : 0;
                }
            }

            //  Replace the old name with the new name in our list of
            //  attributes.
            allPropNames.replace(oldPropName, name);

            try {
                rule.style.setProperty(name, value);
            } catch (e) {
                TP.ifError() ?
                    TP.error('Error setting CSS property: ' + name) : 0;
            }
        } else {

            hadProperty = TP.notEmpty(rule.style.getPropertyValue(name));

            //  Set the attribute named by the name to the value
            if (!hadProperty) {
                allPropNames.push(name);
            }

            try {
                rule.style.setProperty(name, value);
            } catch (e) {
                TP.ifError() ?
                    TP.error('Error setting CSS property: ' + name) : 0;
            }
        }
    } else if (action === TP.DELETE) {

        //  If we're deleting an attribute (because the user clicked an 'X'),
        //  then grab the removed data's 'name' value and remove the
        //  corresponding attribute.
        removedData = aSignal.at('removedData');
        if (TP.isValid(removedData)) {
            name = removedData.at('ruleProps').at('rulePropName');

            if (TP.notEmpty(name)) {
                //  Remove the name from our list of attribute names.
                allPropNames.remove(name);

                try {
                    rule.style.removeProperty(name);
                } catch (e) {
                    TP.ifError() ?
                        TP.error('Error removing CSS property: ' + name) : 0;
                }
            }
        }
    }

    haloTPElem = TP.byId('SherpaHalo', TP.win('UIROOT'));
    haloTargetTPElem = haloTPElem.get('currentTargetTPElem');

    TP.$elementCSSFlush(TP.unwrap(haloTargetTPElem));

    haloTPElem.moveAndSizeToTarget(haloTargetTPElem);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
