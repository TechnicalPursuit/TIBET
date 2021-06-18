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
 * @type {TP.xctrls.panelbox}
 * @summary Manages panelbox XControls.
 */

//  ------------------------------------------------------------------------

TP.xctrls.TemplatedTag.defineSubtype('xctrls:panelbox');

TP.xctrls.panelbox.addTraits(TP.xctrls.SwitchableElement);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

//  This type captures no signals - it lets all signals pass through.
TP.xctrls.panelbox.Type.defineAttribute('opaqueCapturingSignalNames', null);

//  Signals that we don't allow to bubble outside of ourself. Since we can
//  process the states associated with these signals, we don't want them to
//  proceed further up the chain.
TP.xctrls.panelbox.Type.defineAttribute('opaqueBubblingSignalNames',
        TP.ac(
            'TP.sig.UIDeselect',
            'TP.sig.UISelect',

            'TP.sig.UIDisabled',
            'TP.sig.UIEnabled'
            ));

//  Note how this property is TYPE_LOCAL, by design.
TP.xctrls.panelbox.defineAttribute('themeURI', TP.NO_RESULT);

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.xctrls.panelbox.Inst.defineAttribute('subitems',
    TP.cpc('> xctrls|panel', TP.hc('shouldCollapse', false)));

TP.xctrls.panelbox.Inst.defineAttribute('selectedItem',
    TP.cpc('> xctrls|panel[pclass|selected]', TP.hc('shouldCollapse', true)));

TP.xctrls.panelbox.Inst.defineAttribute('itemWithValue',
    TP.xpc('./xctrls:panel/xctrls:value[text() = "{{0}}"]/..',
        TP.hc('shouldCollapse', true)));

TP.xctrls.panelbox.Inst.defineAttribute('selectedValue',
    TP.xpc('string(./xctrls:panel[@pclass:selected = "true"]/xctrls:value)',
        TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------

TP.xctrls.panelbox.Inst.defineMethod('addPanel',
function(aValue, aContentObject) {

    /**
     * @method addPanel
     * @summary Adds a panel to the panel box.
     * @param {String} aValue The value that will be assigned to the panel. When
     *     the panelbox gets its value set, it will match the two values to
     *     determine which panel is to be selected.
     * @param {Object} aContentObject An object to use for content.
     * @returns {TP.xctrls.panel} The newly added panel.
     */

    var panelTPElem,

        handler;

    panelTPElem = this.addRawContent(
                    '<xctrls:panel>' +
                        '<xctrls:value>' +
                        aValue +
                        '</xctrls:value>' +
                        '<xctrls:content/>' +
                    '</xctrls:panel>');

    //  NB: We don't need the result here - just ensuring that that new
    //  panel has an ID (hence the 'true' supplied here).
    panelTPElem.getLocalName(true);

    if (TP.isValid(aContentObject)) {

        //  Observe the new panel when it gets attached to the DOM. When it
        //  does, refresh its bound data.
        handler = function() {

            //  Make sure to ignore here - otherwise, we'll fill up the signal
            //  map.
            handler.ignore(panelTPElem, 'TP.sig.AttachComplete');

            panelTPElem.refresh();
        };

        handler.observe(panelTPElem, 'TP.sig.AttachComplete');

        //  Grab the panel's content element and set its content.
        panelTPElem.get('contentElement').setContent(aContentObject);
    }

    return panelTPElem;
});

//  ------------------------------------------------------------------------

TP.xctrls.panelbox.Inst.defineMethod('getContentForRoute',
function(aRoute) {

    /**
     * @method getContentForRoute
     * @summary Returns a content element that the receiver associates with
     *     the supplied route.
     * @param {String} aRoute The route that the receiver should return the
     *     content element for.
     * @returns {TP.dom.ElementNode} The content element to return for the
     *     supplied route.
     */

    var panelTPElem;

    panelTPElem = this.get('itemWithValue', aRoute);
    if (TP.notValid(panelTPElem)) {
        return null;
    }

    return panelTPElem;
});

//  ------------------------------------------------------------------------

TP.xctrls.panelbox.Inst.defineMethod('getDescendantsForSerialization',
function() {

    /**
     * @method getDescendantsForSerialization
     * @summary Returns an Array of descendants of the receiver to include in
     *     the receiver's serialization. Typically, these will be nodes that
     *     will be 'slotted' into the receiver by the author and not nodes that
     *     the template generated 'around' the slotted nodes.
     * @returns {TP.dom.Node[]} An Array of descendant nodes to serialize.
     */

    var selectedDescendants;

    selectedDescendants =
        this.get('./*[not(@tibet:assembly = \'xctrls:panelbox\')]');

    selectedDescendants = TP.expand(selectedDescendants);

    return selectedDescendants;
});

//  ------------------------------------------------------------------------

TP.xctrls.panelbox.Inst.defineMethod('isScalarValued',
function(aspectName) {

    /**
     * @method isScalarValued
     * @summary Returns true if the receiver deals with scalar values.
     * @description See the TP.dom.Node's 'isScalarValued()' instance method
     *     for more information.
     * @param {String} [aspectName] An optional aspect name that is being used
     *     by the caller to determine whether the receiver is scalar valued for.
     * @returns {Boolean} For this type, this returns true.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.xctrls.panelbox.Inst.defineMethod('isSingleValued',
function(aspectName) {

    /**
     * @method isSingleValued
     * @summary Returns true if the receiver deals with single values.
     * @description See the TP.dom.Node's 'isScalarValued()' instance method
     *     for more information.
     * @param {String} [aspectName] An optional aspect name that is being used
     *     by the caller to determine whether the receiver is single valued for.
     * @returns {Boolean} False for this type as it's not single valued.
     */

    return true;
});

//  ------------------------------------------------------------------------

TP.xctrls.panelbox.Inst.defineMethod('refresh',
function(shouldRender, shouldRefreshBindings, localRefreshInfo) {

    /**
     * @method refresh
     * @summary Updates the receiver's content by refreshing all bound aspects
     *     in the receiver and all of the descendants of the receiver that are
     *     bound.
     * @param {Boolean} [shouldRender] Whether or not to force (or not force)
     *     re-rendering if the data source changes. If not supplied, this
     *     parameter will default to true if the bound data changed and false if
     *     it didn't.
     * @param {Boolean} [shouldRefreshBindings=true] Whether or not to refresh
     *     data bindings from the receiver down (in a 'sparse' fashion).
     * @param {TP.core.Hash} [localRefreshInfo] Information about a local-only
     *     refresh that can be used to specifically target binds that occur only
     *     *locally* on the receiver (i.e. where the receiver itself has the
     *     'bind:*' attribute). Note that if this is supplied, that a *local
     *     only* refresh will be performed and it will be the responsibility of
     *     the caller to refresh any descendant bindings, scoped to the receiver
     *     or not.
     * @returns {Boolean} Whether or not the bound value was different than the
     *     receiver already had and, therefore, truly changed.
     */

    var selectedPanel;

    selectedPanel = this.get('selectedItem');

    if (TP.notValid(selectedPanel)) {
        return this.callNextMethod();
    }

    return selectedPanel.refresh(shouldRender,
                                    shouldRefreshBindings,
                                    localRefreshInfo);
});

//  ------------------------------------------------------------------------

TP.xctrls.panelbox.Inst.defineMethod('removePanel',
function(aValue) {

    /**
     * @method removePanel
     * @summary Removes a panel from the panel box.
     * @param {String} aValue The value that is assigned to the panel to be
     *     removed.
     * @returns {TP.xctrls.panel} The newly removed panel.
     */

    var panelTPElem;

    panelTPElem = this.get('itemWithValue', aValue);

    if (TP.isValid(panelTPElem)) {
        panelTPElem.detach();
    }

    return panelTPElem;
});

//  ------------------------------------------------------------------------

TP.xctrls.panelbox.Inst.defineMethod('setContent',
function(aContentObject, aRequest) {

    /**
     * @method setContent
     * @summary Sets the value of the receiver or adds the supplied content as
     *     another panel if the panel matching the value cannot be found.
     * @param {Object} aContentObject An object to use for content.
     * @param {TP.sig.Request} aRequest A request containing control parameters.
     * @returns {TP.xctrls.panel} The xctrls:panel matching the value or the
     *     newly added panel.
     */

    var request,

        contentKey,
        panelTPElem,

        contentTPElem,
        firstContentChildTPElem,

        skipSettingContent,

        tagName;

    request = TP.request(aRequest);

    contentKey = request.at('contentKey');

    //  If there is a valid content key, then try to find an existing panel
    //  whose 'value' matches that key.
    if (TP.isValid(contentKey)) {
        panelTPElem = this.get('itemWithValue', contentKey);
    }

    //  Build a panel with an 'xctrls:value' containing the unique key. That
    //  will allow us to find it later.
    if (TP.isEmpty(panelTPElem)) {
        panelTPElem = this.addRawContent(
                            '<xctrls:panel>' +
                                '<xctrls:value>' +
                                contentKey +
                                '</xctrls:value>' +
                            '<xctrls:content/>' +
                            '</xctrls:panel>');

        //  NB: We don't need the result here - just ensuring that that new
        //  panel has an ID (hence the 'true' supplied here).
        panelTPElem.getLocalName(true);

        if (TP.isValid(aContentObject)) {
            panelTPElem.setContent(aContentObject);
        }
    } else {
        //  Grab the content element under the existing panel that we found with
        //  that content key.
        contentTPElem = panelTPElem.get('contentElement');

        //  And its first content child.
        firstContentChildTPElem = contentTPElem.getFirstChildElement();

        skipSettingContent = false;

        //  If the request doesn't have a 'forceContentSet' flag set to true,
        //  then test the content that's already there.
        if (TP.notTrue(request.at('forceContentSet'))) {
            //  If the supplied content is a TP.dom.ElementNode, then compare
            //  the tag names of the existing content and the supplied content.
            //  If they're the same, then we skip setting content.
            if (TP.isKindOf(aContentObject, TP.dom.ElementNode)) {
                if (aContentObject.getTagName() ===
                    firstContentChildTPElem.getTagName()) {
                    skipSettingContent = true;
                }
            }

            //  If it's a String, then compare the tag name of the existing
            //  content and the the opening content of the supplied content. If
            //  they're the same, then we skip setting content.
            if (TP.isString(aContentObject)) {
                if (TP.regex.OPENING_TAG.test(aContentObject)) {
                    tagName = TP.regex.OPENING_TAG.match(aContentObject).at(1);
                    if (TP.notEmpty(tagName) &&
                        tagName === firstContentChildTPElem.getTagName()) {
                        skipSettingContent = true;
                    }
                }
            }
        }

        //  If we're not skipping setting the content, then we do so. This will
        //  refresh any data.
        if (!skipSettingContent) {
            panelTPElem.setContent(aContentObject);
        } else {
            //  Otherwise, just refresh the panel.
            panelTPElem.refresh();
        }
    }

    this.setValue(contentKey);

    return panelTPElem;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
