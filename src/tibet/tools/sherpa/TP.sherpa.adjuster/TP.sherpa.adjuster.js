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

TP.sherpa.adjuster.Inst.defineMethod('showAdjusterTile',
function() {

    /**
     * @method showAdjusterTile
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

TP.sherpa.adjuster.Inst.defineMethod('getEditorForPropertyAndValue',
function(propertyName, propertyValue) {

    /**
     * @method getEditorForPropertyAndValue
     */

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
        coalesceDiv,

        childTPElems;

    ruleSource = TP.unwrap(aValue);

    //  Note here that we pass true to flush the element's cached ruleset. This
    //  ensures the most accurate results when focusing. Also, this method will
    //  return rules in specificity order, from highest to lowest.
    ruleInfo = TP.elementGetAppliedStyleInfo(ruleSource, true);

    tileTPElem = TP.byId('Adjuster_Tile', this.getNativeWindow());

    editorsWrapperTPElem = tileTPElem.get('.body div.editor_wrapper');
    editorsWrapperTPElem.empty();

    doc = this.getNativeDocument();

    coalesceDiv = TP.documentConstructElement(doc, 'div', TP.w3.Xmlns.XHTML);
    TP.elementAddClass(coalesceDiv, 'editors');

    ruleInfo.perform(
        function(aRuleInfo) {
            var rule,
                info,
                decls,

                len,
                i;

            rule = aRuleInfo.at('rule');
            info = TP.styleRuleGetSourceInfo(rule, TP.hc());
            decls = info.at('declarations');

            len = decls.getSize();
            for (i = 0; i < len; i++) {
                TP.nodeAppendChild(
                    coalesceDiv,
                    TP.elem('<sherpa:adjuster_genericPropertyEditor/>'),
                    false);
            }
        });

    editorsWrapperTPElem = editorsWrapperTPElem.setContent(coalesceDiv);

    childTPElems = editorsWrapperTPElem.getChildElements();

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
                propName = decls.at(i).property;
                propVal = decls.at(i).value;

                editorTPElem = childTPElems.at(index + i);
                editorTPElem.set('value',
                                TP.hc('name', propName,
                                        'value', propVal,
                                        'selector', aRuleInfo.at('selector'),
                                        'rule', aRuleInfo.at('rule')));

                editorTPElem.render();
            }
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster.Inst.defineHandler('AddProperty',
function(aSignal) {

    /**
     * @method AddProperty
     * @summary
     * @param {TP.sig.Signal} aSignal
     * @returns {TP.sherpa.adjuster} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster.Inst.defineMethod('hideExceptEditorAt',
function(editorIndex) {

    /**
     * @method hideExceptEditorAt
     * @summary
     * @param {TP.sig.Signal} aSignal
     * @returns {TP.sherpa.adjuster} The receiver.
     */

    var tileTPElem,
        body,
        editors;

    tileTPElem = TP.byId('Adjuster_Tile', this.getNativeWindow());
    body = tileTPElem.get('body');

    editors = body.get('.editors').getChildElements();

    tileTPElem.setAttribute('hiding', true);

    editors.perform(
        function(anEditorTPElem, index) {

            if (index === editorIndex) {
                anEditorTPElem.removeAttribute('inactive');
                anEditorTPElem.setAttribute('current', true);
            } else {
                anEditorTPElem.setAttribute('inactive', true);
            }
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster.Inst.defineMethod('showAll',
function() {

    /**
     * @method showAllEditors
     * @summary
     * @param {TP.sig.Signal} aSignal
     * @returns {TP.sherpa.adjuster} The receiver.
     */

    var tileTPElem,
        body,
        editors;

    tileTPElem = TP.byId('Adjuster_Tile', this.getNativeWindow());
    body = tileTPElem.get('body');

    editors = body.get('.editors').getChildElements();

    tileTPElem.removeAttribute('hiding');

    editors.perform(
        function(anEditorTPElem, index) {
            anEditorTPElem.removeAttribute('inactive');
            anEditorTPElem.removeAttribute('current');
        });

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
