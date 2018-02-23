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

    return TP.todo();
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

    this.observe(TP.byId('SherpaHalo', TP.win('UIROOT')), 'TP.sig.HaloDidBlur');

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

        childTPElems;

    ruleSource = TP.unwrap(aValue);

    //  Note here that we pass true to flush the element's cached ruleset. This
    //  ensures the most accurate results when focusing. Also, this method will
    //  return rules in specificity order, from highest to lowest.
    ruleInfo = TP.elementGetAppliedStyleInfo(ruleSource, true);

    tileTPElem = TP.byId('Adjuster_Tile', this.getNativeWindow());

    doc = this.getNativeDocument();

    //  Construct a div to contain all of the individual editors.
    editorsDiv = TP.documentConstructElement(doc, 'div', TP.w3.Xmlns.XHTML);
    TP.elementAddClass(editorsDiv, 'editors');

    //  Iterate over each item in the rule information and construct a property
    //  editor element for each one.
    ruleInfo.perform(
        function(aRuleInfo) {
            var rule,
                info,
                decls,

                len,
                i,

                editorElem;

            rule = aRuleInfo.at('rule');
            info = TP.styleRuleGetSourceInfo(rule, TP.hc());
            decls = info.at('declarations');

            len = decls.getSize();
            for (i = 0; i < len; i++) {

                //  Declarations can contain a comment - we want to skip those.
                if (decls.at(i).type === 'comment') {
                    continue;
                }

                //  Grab a specific editor Element for this property name and
                //  value.
                editorElem = this.getEditorForPropertyNameAndValue(
                                decls.at(i).property, decls.at(i).value);

                TP.nodeAppendChild(
                    editorsDiv,
                    editorElem,
                    false);
            }
        }.bind(this));

    //  Set the body of the tile to be the div containing all of the editors.
    editorsWrapperTPElem = tileTPElem.get('body').setContent(editorsDiv);

    //  Grab all of the child elements - these will have now been processed and
    //  expanded.
    childTPElems = editorsWrapperTPElem.getChildElements();

    //  Iterate over each property editor in the rule information and set the
    //  rule information for each one.
    ruleInfo.perform(
        function(aRuleInfo, index) {
            var rule,
                info,
                decls,

                len,
                i,

                propName,
                propVal,

                editorTPElem;

            rule = aRuleInfo.at('rule');
            info = TP.styleRuleGetSourceInfo(rule, TP.hc());
            decls = info.at('declarations');

            len = decls.getSize();
            for (i = 0; i < len; i++) {

                //  Declarations can contain a comment - we want to skip those.
                if (decls.at(i).type === 'comment') {
                    continue;
                }

                propName = decls.at(i).property;
                propVal = decls.at(i).value;

                //  Set the 'value' of the editor to be a TP.core.Hash of
                //  various bits of information about the property name, value,
                //  selector and rule it came from.
                editorTPElem = childTPElems.at(index + i);
                editorTPElem.set('value',
                                TP.hc('name', propName,
                                        'value', propVal,
                                        'selector', aRuleInfo.at('selector'),
                                        'rule', aRuleInfo.at('rule')));

                //  Now that the 'value' of the editor has been set, render it.
                editorTPElem.render();
            }
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

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
