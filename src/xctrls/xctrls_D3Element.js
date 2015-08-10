//  ========================================================================
/**
 * @copyright Copyright (C) 1999 Technical Pursuit Inc. (TPI) All Rights
 *     Reserved. Patents Pending, Technical Pursuit Inc. Licensed under the
 *     OSI-approved Reciprocal Public License (RPL) Version 1.5. See the RPL
 *     for your rights and responsibilities. Contact TPI to purchase optional
 *     privacy waivers if you must keep your TIBET-based source code private.
 */
//  ------------------------------------------------------------------------

/**
 * @type {TP.xctrls.D3Element}
 *
 * @discussion
 *
 *
 *
 */

//  ------------------------------------------------------------------------

TP.xctrls.Element.defineSubtype('D3Element');

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

/**
 * @type {String} The CSS-compatible selector for this element.
 */
TP.xctrls.D3Element.defineAttribute('selection');

/**
 * @type {String} The CSS-compatible selector for this element.
 */
TP.xctrls.D3Element.defineAttribute('selector');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.xctrls.D3Element.Inst.defineMethod('render', function() {

    //TP.elementSetContent(node, 'Hi Bill!!!');

    this.d3Select();
    this.d3Data();

    this.d3Enter();
    this.d3EnterTransition();

    this.d3Exit();
    this.d3ExitTransition();

    return;
})

//  ------------------------------------------------------------------------

TP.xctrls.D3Element.Inst.defineMethod('setValue',
function(aValue) {

    /**
     */

    this.set('data', aValue.get('data'));

    this.render();
});

//  ------------------------------------------------------------------------

TP.xctrls.D3Element.Inst.defineMethod('d3Data',
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

TP.xctrls.D3Element.Inst.defineMethod('d3DataKey',
function(datum) {

    /**
     * @method d3DataKey
     * @summary Returns the data the element should be using. Analogous to the
     *     data() method of a d3 selection.
     */

    return datum;
});

//  ------------------------------------------------------------------------

TP.xctrls.D3Element.Inst.defineMethod('d3Enter',
function() {

    /**
     * @method d3Enter
     * @summary
     */

    var boundSelection;

    boundSelection = this.get('boundSelection');

    boundSelection.enter().append('xhtml:div').text(function(d) {
         return d;
    });
});

//  ------------------------------------------------------------------------

TP.xctrls.D3Element.Inst.defineMethod('d3EnterTransition',
function() {

    /**
     * @method d3EnterTransition
     * @summary
     */

});

//  ------------------------------------------------------------------------

TP.xctrls.D3Element.Inst.defineMethod('d3Exit',
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

TP.xctrls.D3Element.Inst.defineMethod('d3ExitTransition',
function() {

    /**
     * @method d3ExitTransition
     * @summary
     */


});

//  ------------------------------------------------------------------------

TP.xctrls.D3Element.Inst.defineMethod('d3Select',
function(root) {

    /**
     * @method d3Select
     * @summary
     */

    var node;

    node = this.getNativeNode();

    this.set('selection', TP.extern.d3.select(node).selectAll('div'));
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
