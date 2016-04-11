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
 * @type {TP.sherpa.tiledock}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('tiledock');

TP.sherpa.tiledock.addTraits(TP.core.D3Tag);

TP.sherpa.tiledock.Inst.defineAttribute(
        'listcontent',
        {value: TP.cpc('> .content', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  TP.core.D3Tag Methods
//  ------------------------------------------------------------------------

TP.sherpa.tiledock.Inst.defineMethod('computeSelectionData',
function() {

    /**
     * @method computeSelectionData
     * @summary Returns the data that will actually be used for binding into the
     *     d3.js selection.
     * @description The selection data may very well be different than the bound
     *     data that uses TIBET data binding to bind data to this control. This
     *     method allows the receiver to transform it's 'data binding data' into
     *     data appropriate for d3.js selections.
     * @returns {TP.core.D3Tag} The receiver.
     */

    //  Our bound data is a TP.core.Hash, but our d3.js-based drawing routines
    //  want an Array of Arrays, so we convert it to an Array of key-value
    //  pairs.
    return this.get('data').getKVPairs();
});

//  ------------------------------------------------------------------------

TP.sherpa.tiledock.Inst.defineMethod('drawSelection',
function(selection) {

    /**
     * @method drawSelection
     * @summary Draws content by altering the content provided in the supplied
     *     selection.
     * @param {TP.extern.d3.selection} selection The d3.js selection that
     *     content should be updated in.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var windowName;

    windowName = this.getWindow().getName();

    selection.attr(
            'onclick',
            function(d) {
                return 'TP.byId(\'' + d[0] + '\',' +
                        ' TP.win(\'' + windowName + '\'))' +
                        '.toggle(\'hidden\')';
            }).attr(
            'title',
            function(d) {
                return d[1];
            }).text(
            function(d) {
                return d[1];
            });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.tiledock.Inst.defineMethod('getKeyFunction',
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

TP.sherpa.tiledock.Inst.defineMethod('getRepeatingSelector',
function() {

    /**
     * @method getRepeatingSelector
     * @summary Returns the selector to both select and generate repeating items
     *     under the receiver.
     * @returns {String} The selector to use to select and/or generate repeating
     *     items.
     */

    return 'li';
});

//  ------------------------------------------------------------------------

TP.sherpa.tiledock.Inst.defineMethod('getSelectionRoot',
function() {

    /**
     * @method getSelectionRoot
     * @summary Returns the Element that will be used as the 'root' to
     *     add/update/remove content to/from using d3.js functionality. By
     *     default, this returns the receiver's native Element.
     * @returns {Element} The element to use as a root for d3.js
     *     enter/update/exit selections.
     */

    return TP.unwrap(this.get('listcontent'));
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
