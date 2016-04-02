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
 * @summary A trait type that is used to add simple d3.js behavior to any type
 *     responsible for drawing, in particular those used to display sets of
 *     data.
 */

//  ------------------------------------------------------------------------

TP.core.ElementNode.defineSubtype('D3Tag');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation
TP.core.D3Tag.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Attributes
//  ------------------------------------------------------------------------

/**
 * The data-bound selection set for d3.js.
 * @type {TP.extern.d3.selection}
 */
TP.core.D3Tag.Inst.defineAttribute('boundSelection');

/**
 * The data set to render, via d3.js, into the receiver.
 * @type {Object}
 */
TP.core.D3Tag.Inst.defineAttribute('data');

/**
 * The selector used to select and build the repeating data structure under the
 * selection root
 * @type {String}
 */
TP.core.D3Tag.Inst.defineAttribute('repeatingSelector');

/**
 * The root selection for the element for d3.js.
 * @type {TP.extern.d3.selection}
 */
TP.core.D3Tag.Inst.defineAttribute('selection');

/**
 * The element used as the 'selection root' (i.e. the repeating selector will be
 * executed against this to form the d3.js selection).
 * @type {Element}
 */
TP.core.D3Tag.Inst.defineAttribute('selectionRoot');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('buildNewContent',
function(enterSelection) {

    /**
     * @method buildNewContent
     * @summary Builds new content onto the receiver by appending or inserting
     *     content into the supplied d3.js 'enter selection'.
     * @param {TP.extern.d3.selection} enterSelection The d3.js enter selection
     *     that new content should be appended to.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var repeatingSelector,
        newContent;

    if (TP.isEmpty(repeatingSelector = this.get('repeatingSelector'))) {
        repeatingSelector = 'span';
    }

    newContent = enterSelection.append(repeatingSelector);

    return this.drawSelection(newContent);
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('d3Data',
function() {

    /**
     * @method d3Data
     * @summary Binds the receiver's data set to a d3.js selection. Analogous to
     *     the '.data()' method of a d3.js selection.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var data,
        selection;

    data = this.get('data');
    selection = this.get('selection');

    this.set('boundSelection', selection.data(data, this.getKeyFunction()));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('d3Enter',
function() {

    /**
     * @method d3Enter
     * @summary Processes any 'enter selection' by obtaining the d3.js update
     *     selection and adding it to the drawing 'stage' by calling the
     *     'buildNewContent()' method on the receiver.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var boundSelection;

    boundSelection = this.get('boundSelection');

    this.buildNewContent(boundSelection.enter());

    return this;
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('d3EnterTransition',
function() {

    /**
     * @method d3EnterTransition
     * @summary Provides any 'transition' for the receiver's d3.js 'enter
     *     selection'. This allows for a visual effect when new content is
     *     'entering' the drawing 'stage'.
     * @returns {TP.core.D3Tag} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('d3Exit',
function() {

    /**
     * @method d3Exit
     * @summary Processes any 'exit selection' by obtaining the d3.js exit
     *     selection and removing it from the drawing 'stage'.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var boundSelection;

    boundSelection = this.get('boundSelection');

    boundSelection.exit().remove();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('d3ExitTransition',
function() {

    /**
     * @method d3ExitTransition
     * @summary Provides any 'transition' for the receiver's d3.js 'exit
     *     selection'. This allows for a visual effect when old content is
     *     'exiting' the drawing 'stage'.
     * @returns {TP.core.D3Tag} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('d3Select',
function() {

    /**
     * @method d3Select
     * @summary Using the receiver's 'repeatingSelector', this method performs a
     *     d3.js 'selectAll' to select all of the receiver's content that will
     *     be redrawn with d3.js.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var repeatingSelector;

    repeatingSelector = this.get('repeatingSelector');

    this.set('selection', this.get('selection').selectAll(repeatingSelector));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('d3SelectContainer',
function() {

    /**
     * @method d3SelectContainer
     * @summary Using the receiver's 'selectionRoot', this method performs a
     *     d3.js 'select' to select the root Element under which all of the
     *     receiver's content that will be redrawn with d3.js can be found.
     * @returns {TP.core.D3Tag} The receiver.
     */

    this.set('selection', TP.extern.d3.select(this.get('selectionRoot')));

    return this;
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('d3Update',
function() {

    /**
     * @method d3Update
     * @summary Processes any 'update selection' by obtaining the d3.js update
     *     selection and updating it on the drawing 'stage' by calling the
     *     'updateExistingContent()' method on the receiver.
     * @returns {TP.core.D3Tag} The receiver.
     */

    var boundSelection;

    boundSelection = this.get('boundSelection');

    this.updateExistingContent(boundSelection);

    return this;
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('d3UpdateTransition',
function() {

    /**
     * @method d3UpdateTransition
     * @summary Provides any 'transition' for the receiver's d3.js 'update
     *     selection'. This allows for a visual effect when existing content is
     *     being updated on the drawing 'stage'.
     * @returns {TP.core.D3Tag} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('drawSelection',
function(selection) {

    /**
     * @method drawSelection
     * @summary Draws content by altering the content provided in the supplied
     *     selection.
     * @param {TP.extern.d3.selection} selection The d3.js selection that
     *     content should be updated in.
     * @returns {TP.core.D3Tag} The receiver.
     */

    TP.override();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('getKeyFunction',
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

    keyFunc = function(d) {return d; };

    return keyFunc;
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('getSelectionRoot',
function() {

    /**
     * @method getSelectionRoot
     * @summary Returns the Element that will be used as the 'root' to
     *     add/update/remove content to/from using d3.js functionality. By
     *     default, this returns the receiver's native Element.
     * @returns {Element} The element to use as a root for d3.js
     *     enter/update/exit selections.
     */

    return this.getNativeNode();
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver.
     * @returns {TP.core.D3Tag} The receiver.
     */

    this.d3SelectContainer();

    //  Select any nodes under the 'selection root'
    this.d3Select();

    //  Associate (or 'bind') the data to the selection.
    this.d3Data();

    //  Update any existing update selection
    this.d3Update();
    this.d3UpdateTransition();

    //  Add any content to the enter selection
    this.d3Enter();
    this.d3EnterTransition();

    //  Remove any content from the exit selection
    this.d3Exit();
    this.d3ExitTransition();

    return this;
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('updateExistingContent',
function(updateSelection) {

    /**
     * @method updateExistingContent
     * @summary Updates any existing content in the receiver by altering the
     *     content in the supplied d3.js 'update selection'.
     * @param {TP.extern.d3.selection} updateSelection The d3.js update
     *     selection that existing content should be altered in.
     * @returns {TP.core.D3Tag} The receiver.
     */

    return this.drawSelection(updateSelection);
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('setValue',
function(aValue, shouldSignal) {

    /**
     * @method setValue
     * @summary Sets the value of the receiver's node. For this type, this
     *     method sets the underlying data and renders the receiver.
     * @param {Object} aValue The value to set the 'value' of the node to.
     * @param {Boolean} shouldSignal Should changes be notified. For this type,
     *     this flag is ignored.
     * @returns {TP.core.D3Tag} The receiver.
     */

    this.set('data', aValue);

    this.render();

    return;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
