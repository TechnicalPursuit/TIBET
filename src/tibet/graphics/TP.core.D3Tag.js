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
 * @type {TP.core.D3Tag}
 */

//  ------------------------------------------------------------------------

TP.core.UIElementNode.defineSubtype('D3Tag');

//  This is a mixin-only type.
TP.core.D3Tag.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

/**
 * @type {d3.selection} The data-bound selection set from D3.
 */
TP.core.D3Tag.defineAttribute('boundSelection');

/**
 * @type {d3.selection} The root selection for the element from D3.
 */
TP.core.D3Tag.defineAttribute('selection');

/**
 * @type {String} The CSS-compatible selector for this element.
 */
TP.core.D3Tag.defineAttribute('selector');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('render', function() {

    this.d3Select();
    this.d3Data();

    this.d3Enter();
    this.d3EnterTransition();

    this.d3Exit();
    this.d3ExitTransition();

    return;
})

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('setValue',
function(aValue) {

    /**
     */

    this.set('data', this.d3GetValue(aValue));

    this.render();
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('d3Data',
function() {

    /**
     * @method d3Data
     * @summary Returns the data the element should be using. Analogous to the
     *     data() method of a d3 selection.
     */

    var data,
        selection;

    data = this.get('data');
    selection = this.get('selection');

    this.set('boundSelection', selection.data(data, this.d3DataKey));

    return;
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('d3DataKey',
function(datum) {

    /**
     * @method d3DataKey
     * @summary Returns the data the element should be using. Analogous to the
     *     data() method of a d3 selection.
     */

    return datum;
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('d3Enter',
function() {

    /**
     * @method d3Enter
     * @summary
     */

    var boundSelection;

    boundSelection = this.get('boundSelection');

    //  TODO: use 'child tag name' here?
    boundSelection.enter().append('xhtml:div').text(function(d) {
        return d;
    });
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('d3EnterTransition',
function() {

    /**
     * @method d3EnterTransition
     * @summary
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('d3Exit',
function(selection) {

    /**
     * @method d3Exit
     * @summary
     */

    var boundSelection;

    boundSelection = this.get('boundSelection');

    boundSelection.exit().remove();
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('d3ExitTransition',
function() {

    /**
     * @method d3ExitTransition
     * @summary
     */

    return;
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('d3GetValue',
function(aValue) {

    /**
     */

    return aValue.get('data') || aValue;
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('d3Select',
function(root) {

    /**
     * @method d3Select
     * @summary
     */

    var node;

    node = this.getNativeNode();

    //  TODO: use 'selector' here?
    this.set('selection', TP.extern.d3.select(node).selectAll('div'));
});

