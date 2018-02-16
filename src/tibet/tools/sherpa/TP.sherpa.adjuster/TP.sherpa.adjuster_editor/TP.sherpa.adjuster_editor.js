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
 * @type {TP.sherpa.adjuster_editor}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('adjuster_editor');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.adjuster_editor.Inst.defineAttribute('value');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.adjuster_editor.Inst.defineHandler('UpdatePropertyValue',
function(aSignal) {

    /**
     * @method updatePropertyValue
     * @summary
     * @param {TP.sig.Signal} aSignal
     * @returns {TP.sherpa.adjuster_editor} The receiver.
     */

    var ourInfo,
        fieldVal,

        propName,
        propRule,

        halo,
        currentTargetTPElem;

    ourInfo = this.get('value');

    if (TP.notValid(ourInfo)) {
        return this;
    }

    fieldVal = TP.wrap(aSignal.getTarget()).get('value');

    propName = ourInfo.at('name');
    propRule = ourInfo.at('rule');

    TP.styleRuleSetProperty(propRule, propName, fieldVal, false);

    halo = TP.byId('SherpaHalo', this.getNativeDocument());

    currentTargetTPElem = halo.get('currentTargetTPElem');

    if (TP.isValid(currentTargetTPElem)) {
        this.focusOnTarget(currentTargetTPElem);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_editor.Inst.defineHandler('UpdatePropertyRule',
function(aSignal) {

    /**
     * @method updatePropertyRule
     * @summary
     * @param {TP.sig.Signal} aSignal
     * @returns {TP.sherpa.adjuster_editor} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_editor.Inst.defineMethod('getValue',
function() {

    /**
     * @method getValue
     * @summary
     * @returns {TP.sherpa.adjuster_editor} The receiver.
     */

    return this.$get('value');
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_editor.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary
     * @returns {TP.sherpa.adjuster_editor} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.adjuster_editor.Inst.defineMethod('setValue',
function(aValue) {

    /**
     * @method setValue
     * @summary
     * @returns {TP.sherpa.adjuster_editor} The receiver.
     */

    this.$set('value', aValue, false);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
