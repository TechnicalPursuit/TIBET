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

TP.sherpa.focusablesidebar.defineSubtype('styleshud');

TP.sherpa.styleshud.addTraits(TP.core.D3Tag);

TP.sherpa.styleshud.Inst.defineAttribute(
        'listcontent',
        {value: TP.cpc('> .content', TP.hc('shouldCollapse', true))});

TP.sherpa.styleshud.Inst.defineAttribute(
        'listitems',
        {value: TP.cpc('> .content > li', TP.hc('shouldCollapse', false))});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

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
     * @returns {TP.core.D3Tag} The receiver.
     */

    var newContent;

    newContent = enterSelection.append('li');
    newContent.attr(
            'pclass:selected',
            function(d) {
                if (TP.isTrue(d[2])) {
                    return true;
                }

                //  Returning null will cause d3.js to remove the
                //  attribute.
                return null;
            }).attr(
            'title',
            function(d) {
                return d[1];
            }).attr(
            'peerID',
            function(d, i) {
                return d[0];
            }).text(
            function(d) {
                return d[1];
            });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineMethod('getKeyFunction',
function() {

    /**
     * @method getKeyFunction
     * @summary Returns the Function that should be used to generate keys into
     *     the receiver's data set.
     * @description This Function should take a single argument, an individual
     *     item from the receiver's data set, and return a value that will act
     *     as that item's key in the overall data set. The default version
     *     returns the item itself.
     * @returns {Function} A Function that provides a key for the supplied data
     *     item.
     */

    var keyFunc;

    keyFunc = function(d) {return d[0]; };

    return keyFunc;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineMethod('getRootUpdateSelection',
function(rootSelection) {

    /**
     * @method getRootUpdateSelection
     * @summary Creates the 'root' update selection that will be used as the
     *     starting point to begin d3.js drawing operations.
     * @returns {d3.Selection} The receiver.
     */

    return rootSelection.selectAll('li');
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineMethod('getSelectionContainer',
function() {

    /**
     * @method getSelectionContainer
     * @summary Returns the Element that will be used as the 'root' to
     *     add/update/remove content to/from using d3.js functionality. By
     *     default, this returns the receiver's native Element.
     * @returns {Element} The element to use as the container for d3.js
     *     enter/update/exit selections.
     */

    return TP.unwrap(this.get('listcontent'));
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
     * @returns {TP.core.D3Tag} The receiver.
     */

    updateSelection.attr(
            'pclass:selected',
            function(d) {
                if (TP.isTrue(d[2])) {
                    return true;
                }

                //  Returning null will cause d3.js to remove the
                //  attribute.
                return null;
            }).attr(
            'title',
            function(d) {
                return d[1];
            }).attr(
            'peerID',
            function(d, i) {
                return d[0];
            }).text(
            function(d) {
                return d[1];
            });

    return this;
});

//  ------------------------------------------------------------------------
//  Handlers
//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineHandler('InspectTarget',
function(aSignal) {

    var targetElem,
        peerID,

        haloTarget,

        halo;

    targetElem = aSignal.getDOMTarget();
    peerID = TP.elementGetAttribute(targetElem, 'peerID', true);

    if (TP.isEmpty(peerID)) {
        return this;
    }

    //  NB: We want to query the current canvas here - no node context
    //  necessary.
    haloTarget = TP.byId(peerID);

    halo = TP.byId('SherpaHalo', this.getNativeDocument());

    halo.blur();
    halo.focusOn(haloTarget);

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.styleshud.Inst.defineHandler('HaloDidFocus',
function(aSignal) {

    /**
     * @method handleHaloDidFocus
     * @summary Handles notifications of when the halo focuses on an object.
     * @param {TP.sig.HaloDidFocus} aSignal The TIBET signal which triggered
     *     this method.
     */

    var haloTarget,
        info,
        last;

    haloTarget = aSignal.at('haloTarget');

    info = TP.ac();

    haloTarget.ancestorsPerform(
            function(aNode) {
                if (TP.isElement(aNode)) {
                    info.push(
                        TP.ac(
                            TP.lid(aNode, true), TP.elementGetFullName(aNode)));
                }
            });

    info.unshift(TP.ac(TP.lid(haloTarget, true), haloTarget.getFullName()));

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

TP.sherpa.styleshud.Inst.defineHandler('HaloDidBlur',
function(aSignal) {

    /**
     * @method handleHaloDidBlur
     * @summary Handles notifications of when the halo blurs on an object.
     * @param {TP.sig.HaloDidBlur} aSignal The TIBET signal which triggered
     *     this method.
     */

    this.setValue(null);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
