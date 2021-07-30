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
 * @type {TP.lama.typedisplay}
 */

//  ------------------------------------------------------------------------

TP.lama.TemplatedTag.defineSubtype('typedisplay');

TP.lama.typedisplay.addTraits(TP.dom.D3Tag);

TP.lama.typedisplay.Inst.defineAttribute('body',
    TP.cpc('> .body', TP.hc('shouldCollapse', true)));

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.typedisplay.Inst.defineMethod('computeSelectionData',
function() {

    /**
     * @method computeSelectionData
     * @summary Returns the data that will actually be used for binding into the
     *     d3.js selection.
     * @description The selection data may very well be different than the bound
     *     data that uses TIBET data binding to bind data to this control. This
     *     method allows the receiver to transform it's 'data binding data' into
     *     data appropriate for d3.js selections.
     * @returns {TP.lama.typedisplay} The receiver.
     */

    //  The default version of this just returns the data-binding bound data.
    return TP.getTypeInfoForInspector(this.get('data'));
});

//  ------------------------------------------------------------------------

TP.lama.typedisplay.Inst.defineHandler('ReflectOnItem',
function(aSignal) {

    var cmdVal;

    cmdVal = aSignal.getDOMTarget().getAttribute('data-cmd');

    if (TP.isEmpty(cmdVal)) {
        return this;
    }

    TP.bySystemId('LamaConsoleService').sendConsoleRequest(cmdVal);

    return this;
});

//  ------------------------------------------------------------------------
//  TP.dom.D3Tag Methods
//  ------------------------------------------------------------------------

TP.lama.typedisplay.Inst.defineMethod('buildNewContent',
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

    var sections,

        newContent,

        contentDivs,

        tables,
        rows,
        cells;

    sections = enterSelection.append('div').
        attr('class', 'section');

    newContent = sections;

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

                    //  No owner? Then it's a type. Just use the name.
                    if (TP.notValid(d.at('owner'))) {
                        return TP.ac(d.at('name'));
                    }

                    //  Otherwise, it's a method.
                    return TP.ac(
                            TP.ac(d.at('name'), d.at('owner'), d.at('track')),
                            d.at('owner'));
                });

    cells.enter().
        append('td').
        attr('data-cmd',
                function(d) {

                    var reflectionStatement;

                    //  If it's an Array, then is the owner/track pair.
                    if (TP.isArray(d)) {
                        reflectionStatement =
                                ':reflect ' +
                                d.at(1) + '.' + d.at(2) +
                                '.getMethod(\'' + d.at(0) + '\')';

                    } else {
                        reflectionStatement =
                                ':reflect ' + d;
                    }

                    return reflectionStatement;
                }).
        text(function(d) {

            //  If it's an Array, then is the owner/track pair.
            if (TP.isArray(d)) {
                return d.at(0) + ' (' + d.at(2) + ')';
            } else {
                return d;
            }
        });

    return newContent;
});

//  ------------------------------------------------------------------------

TP.lama.typedisplay.Inst.defineMethod('d3KeyFunction',
function() {

    /**
     * @method d3KeyFunction
     * @summary Returns the Function that should be used to generate keys into
     *     the receiver's data set. By default this method returns a null key
     *     function, thereby causing d3 to use each datum in the data set as the
     *     key.
     * @description This Function should take two arguments, an individual item
     *     from the receiver's data set and it's index in the overall data set,
     *     and return a value that will act as that item's key in the overall
     *     data set.
     * @returns {Function} A Function that provides a key for the supplied data
     *     item.
     */

    var keyFunc;

    keyFunc = function(d, i) {
        return d.at('name');
    };

    return keyFunc;
});

//  ------------------------------------------------------------------------

TP.lama.typedisplay.Inst.defineMethod('getRootUpdateSelection',
function(containerSelection) {

    /**
     * @method getRootUpdateSelection
     * @summary Creates the 'root' update selection that will be used as the
     *     starting point to begin d3.js drawing operations.
     * @param {TP.extern.d3.selection} containerSelection The selection made by
     *     having d3.js select() the receiver's 'selection container'.
     * @returns {TP.extern.d3.Selection}
     */

    return containerSelection.selectAll('div.section');
});

//  ------------------------------------------------------------------------

TP.lama.typedisplay.Inst.defineMethod('getSelectionContainer',
function() {

    /**
     * @method getSelectionContainer
     * @summary Returns the Element that will be used as the 'root' to
     *     add/update/remove content to/from using d3.js functionality. By
     *     default, this returns the receiver's native Element.
     * @returns {Element|null} The element to use as the container for d3.js
     *     enter/update/exit selections.
     */

    var content;

    content = this.get('body');
    if (TP.notValid(content)) {
        return null;
    }

    return TP.unwrap(content);
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
