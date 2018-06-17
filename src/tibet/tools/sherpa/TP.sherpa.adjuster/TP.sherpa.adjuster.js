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
 * @type {TP.sherpa.adjuster}
 */

//  ------------------------------------------------------------------------

TP.sherpa.Element.defineSubtype('adjuster');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.adjuster.Type.defineMethod('tagAttachDOM',
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

TP.sherpa.adjuster.Type.defineMethod('tagDetachDOM',
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

TP.sherpa.adjuster.Inst.defineAttribute('$updateRulesOnly');
TP.sherpa.adjuster.Inst.defineAttribute('cssSchema');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.adjuster.Inst.defineHandler('AddProperty',
function(aSignal) {

    /**
     * @method AddProperty
     * @summary Adds a property to the set of properties currently managed by
     *     the adjuster.
     * @param {TP.sig.AddProperty} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.adjuster} The receiver.
     */

    TP.todo();

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster.Inst.defineHandler('HaloDidBlur',
function(aSignal) {

    /**
     * @method handleHaloDidBlur
     * @summary Handles notifications of when the halo blurs on an object.
     * @param {TP.sig.HaloDidBlur} aSignal The TIBET signal which triggered
     *     this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var tile;

    //  Hide the tile.
    tile = TP.byId('Adjuster_Tile', this.getNativeWindow());
    if (TP.isValid(tile)) {
        tile.setAttribute('hidden', true);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster.Inst.defineHandler('MutationStyleChange',
function(aSignal) {

    /**
     * @method handleMutationStyleChange
     * @summary Handles notifications of node style changes from the overall
     *     canvas that the styleshud is working with.
     * @param {TP.sig.MutationStyleChange} aSignal The TIBET signal which
     *     triggered this method.
     * @returns {TP.sherpa.styleshud} The receiver.
     */

    var tile,
        tileIsHidden,

        modelURI,
        value,

        ruleInfo,

        tileTPElem,
        editorsWrapperTPElem,
        childTPElems,

        leni,
        i,

        editorInfo,

        lenj,
        j;

    //  If there is a mutated rule, (which will happen if the signal is a
    //  TP.sig.MutationStylePropertyChange or TP.sig.MutationStyleRuleChange)
    //  then exit here. We only want to process 'whole stylesheet' changes.
    if (TP.isValid(aSignal.at('mutatedRule'))) {
        return this;
    }

    //  If the adjuster tile is closed, then exit here.
    tile = TP.byId('Adjuster_Tile', this.getNativeWindow());
    if (TP.notValid(tile)) {
        return this;
    }

    tileIsHidden = TP.bc(tile.getAttribute('hidden'));
    if (tileIsHidden) {
        return this;
    }

    //  Grab the styleshud target - this will be the TP.dom.ElementNode that is
    //  currently focused.
    modelURI = TP.uc('urn:tibet:styleshud_target_source');
    value = modelURI.getResource().get('result');

    //  If the change came from a side-effect of changing just one rule, then
    //  this flag will be true. Otherwise, we changed the whole sheet and we
    //  just need to set the value, which will redraw the editors etc.
    if (TP.isFalse(this.get('$updateRulesOnly'))) {
        this.setValue(value);
        return this;
    }

    //  Grab the rule info for the currently focused element.
    ruleInfo = TP.elementGetAppliedStyleInfo(TP.unwrap(value), true);

    tileTPElem = TP.byId('Adjuster_Tile', this.getNativeWindow());

    //  Set the body of the tile to be the div containing all of the editors.
    editorsWrapperTPElem = tileTPElem.get('body').get('.editors');

    //  Grab all of the child elements - these will have now been processed and
    //  expanded.
    childTPElems = editorsWrapperTPElem.getChildElements();

    //  Now we're in a situation where just a declaration of a rule changed, but
    //  the entire sheet got regenerated because of it. Therefore, we just need
    //  to 'wire up' the new rules from the regenerated sheet, replacing the old
    //  rules which are now no longer associated with a real CSS style or link
    //  element. Now, because the old rule will have still had it's declaration
    //  updated *before* it was detached because of sheet regeneration, it's
    //  '.cssText' property will match that of it's new version. Therefore, we
    //  just need to compare that.

    //  Iterate over all of the child elements, which will be adjuster editors,
    //  and then all of the rules found in the applied style information. If the
    //  '.cssText' property of the rules match, then replace the reference to
    //  the old version of the rule with the new version of the rule.
    leni = childTPElems.getSize();
    for (i = 0; i < leni; i++) {
        editorInfo = childTPElems.at(i).get('value');
        lenj = ruleInfo.getSize();
        for (j = 0; j < lenj; j++) {
            if (editorInfo.at('rule').cssText ===
                            ruleInfo.at(j).at('rule').cssText) {
                editorInfo.atPut('rule', ruleInfo.at(j).at('rule'));
            }
        }
    }

    this.set('$updateRulesOnly', false);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster.Inst.defineMethod('getEditorForPropertyNameAndValue',
function(propertyName, propertyValue) {

    /**
     * @method getEditorForPropertyNameAndValue
     * @summary Returns an element that represents an editor for the named
     *     property and value.
     * @param {String} propertyName The name of the property to return the
     *     editor for.
     * @param {String} propertyValue The value of the property to return the
     *     editor for.
     * @returns {Element} The element representing the editor to use for the
     *     supplied CSS property and value.
     */

    //  For now, all properties use a generic property editor.
    return TP.elem('<sherpa:adjuster_genericPropertyEditor/>');
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster.Inst.defineMethod('hideAllExceptEditor',
function(anEditorTPElem) {

    /**
     * @method hideAllExceptEditor
     * @summary Hides all of the editors except for the supplied editor element.
     * @param {TP.sherpa.adjuster_editor} anEditorTPElem The editor element to
     *      *not* hide.
     * @returns {TP.sherpa.adjuster} The receiver.
     */

    var tileTPElem,
        body,
        editors;

    //  Grab all of the editor elements
    tileTPElem = TP.byId('Adjuster_Tile', this.getNativeWindow());
    body = tileTPElem.get('body');
    editors = body.get('.editors').getChildElements();

    //  Set the tile element itself to the 'hiding' state (note that this is
    //  different that the standard 'hidden' attribute).
    tileTPElem.setAttribute('hiding', true);

    //  Iterate over all of the editor elements and set them to be 'inactive'
    editors.perform(
        function(editorTPElem, index) {
            editorTPElem.setAttribute('inactive', true);
        });

    //  Now, go back to the editor element that we're *not* hiding and remove
    //  that 'inactive' attribute and set it to be the 'current' editor.
    anEditorTPElem.removeAttribute('inactive');
    anEditorTPElem.setAttribute('current', true);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster.Inst.defineMethod('setup',
function() {

    /**
     * @method setup
     * @summary Perform the initial setup for the receiver.
     * @returns {TP.sherpa.adjuster} The receiver.
     */

    var url;

    this.observe(TP.byId('SherpaHalo', TP.win('UIROOT')), 'TP.sig.HaloDidBlur');

    this.observe(TP.sys.uidoc(), 'TP.sig.MutationStyleChange');

    this.set('$updateRulesOnly', false);

    //  Preload the CSS info file from this type's directory and set the
    //  cssSchema instance variable to the result.
    url = TP.uc(
            TP.uriJoinPaths(
                TP.objectGetLoadCollectionPath(this),
                'css-schema.xml'));

    url.getResource(TP.hc('resultType', TP.DOM)).then(
        function(result) {
            this.set('cssSchema', result);
        }.bind(this));

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster.Inst.defineMethod('setValue',
function(aValue, shouldSignal) {

    /**
     * @method setValue
     * @summary Sets the value of this content panel. For this type, this
     *     updates the 'attributes model', which is what it's GUI is bound to.
     * @param {Object} aValue The value to set the 'value' of the node to.
     * @param {Boolean} shouldSignal Should changes be notified. If false
     *     changes are not signaled. Defaults to this.shouldSignalChange().
     * @returns {TP.sherpa.adjuster} The receiver.
     */

    var ruleSource,
        ruleInfo,

        tileTPElem,
        editorsWrapperTPElem,

        doc,
        editorsDiv,

        editorEntries,

        sherpaMain,

        childTPElems;

    ruleSource = TP.unwrap(aValue);

    //  Note here that we pass true to flush the element's cached ruleset. This
    //  ensures the most accurate results when focusing. Also, this method will
    //  return rules in specificity order, from highest to lowest.
    ruleInfo = TP.elementGetAppliedStyleInfo(ruleSource, true);

    //  Reverse the info list so that we always process the most specific rules
    //  first.
    ruleInfo.reverse();

    tileTPElem = TP.byId('Adjuster_Tile', this.getNativeWindow());

    doc = this.getNativeDocument();

    //  Construct a div to contain all of the individual editors.
    editorsDiv = TP.documentConstructElement(doc, 'div', TP.w3.Xmlns.XHTML);
    TP.elementAddClass(editorsDiv, 'editors');

    //  Turn off mutation tracking for the editors div. We don't need it and the
    //  overhead.
    TP.elementSetAttribute(editorsDiv, 'tibet:nomutationtracking', 'true', true);

    editorEntries = TP.ac();

    sherpaMain = TP.bySystemId('Sherpa');

    //  Iterate over each item in the rule information and construct a property
    //  editor element for each one.
    ruleInfo.perform(
        function(aRuleInfo) {
            var isMutable,

                rule,
                info,
                decls,

                len,
                i,

                propName,
                propVal,

                editorElem;

            //  Compute whether or not a rule is mutable based on its location.
            isMutable = sherpaMain.styleLocationIsMutable(
                                        aRuleInfo.at('sheetLocation'));

            rule = aRuleInfo.at('rule');
            info = TP.styleRuleGetSourceInfo(rule, TP.hc());

            //  Sometimes we get entries that are not rules - like '@namespace'
            //  or '@import' declarations. If that's the case, move on here.
            if (info.at('type') !== 'rule') {
                return;
            }

            decls = info.at('declarations');

            len = decls.getSize();
            for (i = 0; i < len; i++) {

                //  Declarations can contain a comment - we want to skip those.
                if (decls.at(i).type === 'comment') {
                    continue;
                }

                propName = decls.at(i).property;
                propVal = decls.at(i).value;

                //  Grab a specific editor Element for this property name and
                //  value.
                editorElem = this.getEditorForPropertyNameAndValue(
                                                        propName, propVal);

                editorElem = TP.nodeAppendChild(editorsDiv, editorElem, false);

                editorEntries.push(
                            TP.hc('name', propName,
                                    'value', propVal,
                                    'selector', aRuleInfo.at('selector'),
                                    'rule', aRuleInfo.at('rule'),
                                    'mutable', isMutable));
            }
        }.bind(this));

    //  Set the body of the tile to be the div containing all of the editors.
    editorsWrapperTPElem = tileTPElem.get('body').setContent(editorsDiv);

    //  Grab all of the child elements - these will have now been processed and
    //  expanded.
    childTPElems = editorsWrapperTPElem.getChildElements();

    //  Now that the editor elements have actually been placed into the DOM, we
    //  can set their values from the entries we computed before.
    childTPElems.perform(
        function(aChildTPElem, index) {
            aChildTPElem.set('value', editorEntries.at(index));
            aChildTPElem.render();
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster.Inst.defineMethod('showAll',
function() {

    /**
     * @method showAll
     * @summary Shoes all of the editors.
     * @returns {TP.sherpa.adjuster} The receiver.
     */

    var tileTPElem,
        body,
        editors;

    //  Grab all of the editor elements
    tileTPElem = TP.byId('Adjuster_Tile', this.getNativeWindow());
    body = tileTPElem.get('body');
    editors = body.get('.editors').getChildElements();

    //  Set the tile element itself to *not* be in the 'hiding' state (note that
    //  this is different that the standard 'hidden' attribute).
    tileTPElem.removeAttribute('hiding');

    //  Iterate over all of the editor elements and set them to be 'active' and
    //  not current.
    editors.perform(
        function(anEditorTPElem, index) {
            anEditorTPElem.removeAttribute('inactive');
            anEditorTPElem.removeAttribute('current');
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster.Inst.defineMethod('showAdjusterTile',
function() {

    /**
     * @method showAdjusterTile
     * @summary Shows the adjuster tile.
     * @returns {TP.sherpa.adjuster} The receiver.
     */

    var halo,
        sourceTPElem,

        modelURI,

        newBodyElem,
        newFooterElem,

        tileTPElem,
        newContentTPElem,

        currentBodyElem,
        currentFooterElem,

        value;

    halo = TP.byId('SherpaHalo', this.getNativeDocument());
    sourceTPElem = halo.get('currentTargetTPElem');

    //  Grab the current target source.
    modelURI = TP.uc('urn:tibet:styleshud_target_source');

    tileTPElem = TP.byId('Adjuster_Tile', this.getNativeWindow());

    newBodyElem = TP.getContentForTool(sourceTPElem, 'AdjusterTileBody');
    newFooterElem = TP.getContentForTool(sourceTPElem, 'AdjusterTileFooter');

    //  ---

    if (TP.notValid(tileTPElem)) {

        //  Preload the shared menu. Even though we don't actually preload any
        //  content here, this call will create the popup so that we can
        //  reference it for sizing before we actually load it.
        TP.xctrls.popup.preload(
                TP.hc('triggerTPDocument', this.getDocument(),
                        'overlayID', 'AdjusterPopup'));

        tileTPElem = TP.bySystemId('Sherpa').makeTile('Adjuster_Tile');
        tileTPElem.setHeaderText('Style Adjuster');

        newContentTPElem = tileTPElem.setContent(newBodyElem);
        newContentTPElem.awaken();

        tileTPElem.get('footer').setContent(newFooterElem);

    } else {
        currentBodyElem = TP.unwrap(
                            tileTPElem.get('body').getFirstChildElement());
        currentFooterElem = TP.unwrap(
                            tileTPElem.get('footer').getFirstChildElement());

        if (TP.name(currentBodyElem) !== TP.name(newBodyElem)) {
            newContentTPElem = tileTPElem.setContent(newBodyElem);
            newContentTPElem.awaken();
        }
        if (TP.name(currentFooterElem) !== TP.name(newFooterElem)) {
            tileTPElem.get('footer').setContent(newFooterElem);
        }
    }

    value = modelURI.getResource().get('result');
    this.setValue(value);

    tileTPElem.setAttribute('hidden', false);

    //  Need to 'call up' to make sure the attribute value is actually captured.
    return this.callNextMethod();
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster.Inst.defineMethod('teardown',
function() {

    /**
     * @method teardown
     * @summary Tears down the receiver by performing housekeeping cleanup, like
     *     ignoring signals it's observing, etc.
     * @returns {TP.sherpa.adjuster} The receiver.
     */

    this.ignore(TP.byId('SherpaHalo', TP.win('UIROOT')), 'TP.sig.HaloDidBlur');

    this.ignore(TP.sys.uidoc(), 'TP.sig.MutationStyleChange');

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster.Inst.defineMethod('updateInfoText',
function(content) {

    /**
     * @method updateInfoText
     * @summary Updates the info text in the footer bar to the supplied text
     *     content. Note that this will set the text content of the info text
     *     and therefore does not support embedded markup.
     * @param {String} content The text to set the info text to.
     * @returns {TP.sherpa.adjuster} The receiver.
     */

    var tileTPElem,
        infoDiv;

    tileTPElem = TP.byId('Adjuster_Tile', this.getNativeWindow());
    infoDiv = tileTPElem.get(TP.cpc('> .footer > div.info')).first();

    infoDiv.setTextContent(content);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
