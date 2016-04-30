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
 * @type {TP.sherpa.typedisplay}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('typedisplay');

TP.sherpa.typedisplay.addTraits(TP.core.D3Tag);

TP.sherpa.typedisplay.Inst.defineAttribute(
        'body',
        {value: TP.cpc('> .body', TP.hc('shouldCollapse', true))});

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.typedisplay.Inst.defineMethod('computeSelectionData',
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

    //  The default version of this just returns the data-binding bound data.
    return TP.getTypeInfoForInspector(this.get('data'));
});

//  ------------------------------------------------------------------------

TP.sherpa.typedisplay.Inst.defineHandler('ReflectOnItem',
function(aSignal) {

    var cmdVal;

    cmdVal = aSignal.getDOMTarget().getAttribute('data-cmd');

    if (TP.isEmpty(cmdVal)) {
        return this;
    }

    TP.bySystemId('SherpaConsoleService').sendConsoleRequest(cmdVal);

    return this;
});

//  ------------------------------------------------------------------------
//  TP.core.D3Tag Methods
//  ------------------------------------------------------------------------

TP.sherpa.typedisplay.Inst.defineMethod('buildNewContent',
function(enterSelection) {

    /**
     * @method buildNewContent
     * @summary Builds new content onto the receiver by appending or inserting
     *     content into the supplied d3.js 'enter selection'.
     * @param {TP.extern.d3.selection} enterSelection The d3.js enter selection
     *     that new content should be appended to.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var sections,

        contentDivs,

        tables,
        rows,
        cells;

    sections = enterSelection.append('div').
        attr('class', 'section');

    sections.append('div').
        attr('class', 'header').
        text(function(d) {
            return d.at('name');
        });

    contentDivs = sections.append('div').
        attr('class', 'content');

    contentDivs.append('table').
        attr('class', 'parent');

    tables = contentDivs.selectAll('table');

    //  one row per child
    rows = tables.selectAll('tr.data').
        data(function(d) {
            return d.at('children');
        });

    rows.enter().
        append('tr').
        attr('class', 'data');

    cells = rows.selectAll('td').
                data(function(d) {

                    if (TP.notValid(d.at('owner'))) {
                        return TP.ac(d.at('name'));
                    }

                    return TP.ac(d.at('name'), d.at('owner'));
                });

    cells.enter().
        append('td').
        attr('data-cmd',
                function(d) {
                    return ':reflect ' + d;
                }).
        text(function(d) {
            return d;
        });

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.typedisplay.Inst.defineMethod('getKeyFunction',
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

    keyFunc = function(d) {
        return d.at('name');
    };

    return keyFunc;
});

//  ------------------------------------------------------------------------

TP.sherpa.typedisplay.Inst.defineMethod('getRootUpdateSelection',
function(rootSelection) {

    /**
     * @method getRootUpdateSelection
     * @summary Creates the 'root' update selection that will be used as the
     *     starting point to begin d3.js drawing operations.
     * @returns {d3.Selection} The receiver.
     */

    return rootSelection.selectAll('div.section');
});

//  ------------------------------------------------------------------------

TP.sherpa.typedisplay.Inst.defineMethod('getSelectionContainer',
function() {

    /**
     * @method getSelectionContainer
     * @summary Returns the Element that will be used as the 'root' to
     *     add/update/remove content to/from using d3.js functionality. By
     *     default, this returns the receiver's native Element.
     * @returns {Element} The element to use as the container for d3.js
     *     enter/update/exit selections.
     */

    return TP.unwrap(this.get('body'));
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
