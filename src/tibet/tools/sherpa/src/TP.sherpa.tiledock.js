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
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.tiledock.Type.defineMethod('tagAttachDOM',
function(aRequest) {

    /**
     * @method tagAttachDOM
     * @summary Sets up runtime machinery for the element in aRequest
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    tpElem.observe(TP.ANY, 'TileDidOpen');
    tpElem.observe(TP.ANY, 'TileWillClose');

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.tiledock.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
     * @summary Tears down runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem;

    //  this makes sure we maintain parent processing
    this.callNextMethod();

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    tpElem.ignore(TP.ANY, 'TileDidOpen');
    tpElem.ignore(TP.ANY, 'TileWillClose');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.tiledock.Inst.defineHandler('TileDidOpen',
function(aSignal) {

    var tileTPElem,
        tileDockData;

    tileTPElem = TP.bySystemId(aSignal.getSignalOrigin());
    if (TP.isValid(tileTPElem)) {
        if (TP.isTrue(tileTPElem.get('shouldDock'))) {
            tileDockData =
                TP.uc('urn:tibet:sherpa_tiledock').getResource().get('result');
            tileDockData.atPut(tileTPElem.getLocalID(), tileTPElem.getName());
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.tiledock.Inst.defineHandler('TileWillClose',
function(aSignal) {

    var tileTPElem,
        tileDockData;

    tileTPElem = TP.bySystemId(aSignal.getSignalOrigin());
    if (TP.isValid(tileTPElem)) {
        tileDockData =
            TP.uc('urn:tibet:sherpa_tiledock').getResource().get('result');
        tileDockData.removeKey(tileTPElem.getLocalID());
    }

    return this;
});

//  ------------------------------------------------------------------------
//  TP.core.D3Tag Methods
//  ------------------------------------------------------------------------

TP.sherpa.tiledock.Inst.defineMethod('buildNewContent',
function(enterSelection) {

    /**
     * @method buildNewContent
     * @summary Builds new content onto the receiver by appending or inserting
     *     content into the supplied d3.js 'enter selection'.
     * @param {TP.extern.d3.selection} enterSelection The d3.js enter selection
     *     that new content should be appended to.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var windowName,
        newContent;

    windowName = this.getWindow().getName();

    newContent = enterSelection.append('li');
    newContent.attr(
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

TP.sherpa.tiledock.Inst.defineMethod('getRootUpdateSelection',
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

TP.sherpa.tiledock.Inst.defineMethod('getSelectionContainer',
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

TP.sherpa.tiledock.Inst.defineMethod('updateExistingContent',
function(updateSelection) {

    /**
     * @method updateExistingContent
     * @summary Updates any existing content in the receiver by altering the
     *     content in the supplied d3.js 'update selection'.
     * @param {TP.extern.d3.selection} updateSelection The d3.js update
     *     selection that existing content should be altered in.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var windowName,
        newContent;

    windowName = this.getWindow().getName();

    newContent = updateSelection.select('li');
    newContent.attr(
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
//  end
//  ========================================================================
