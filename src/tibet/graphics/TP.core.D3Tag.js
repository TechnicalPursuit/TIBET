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
 * The data-bound update selection set for d3.js.
 * @type {TP.extern.d3.selection}
 */
TP.core.D3Tag.Inst.defineAttribute('updateSelection');

/**
 * The data set to render, via d3.js, into the receiver.
 * @type {Object}
 */
TP.core.D3Tag.Inst.defineAttribute('data');

/**
 * The root selection for the element for d3.js.
 * @type {TP.extern.d3.selection}
 */
TP.core.D3Tag.Inst.defineAttribute('rootSelection');

/**
 * The element used as the 'selection container' (i.e. the update selection will
 * be created on this selection root).
 * @type {Element}
 */
TP.core.D3Tag.Inst.defineAttribute('selectionContainer');

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

    return this;
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('computeSelectionData',
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
    return this.get('data');
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
        selection,

        keyFunc;

    data = this.computeSelectionData();
    selection = this.get('rootSelection');

    keyFunc = this.getKeyFunction();
    if (TP.isCallable(keyFunc)) {
        this.set('updateSelection', selection.data(data, keyFunc));
    } else {
        this.set('updateSelection', selection.data(data));
    }

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

    var updateSelection;

    updateSelection = this.get('updateSelection');

    this.buildNewContent(updateSelection.enter());

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

    var updateSelection;

    updateSelection = this.get('updateSelection');

    this.removeOldContent(updateSelection.exit());

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
     * @summary Creates the root selection by performing
     * @returns {TP.core.D3Tag} The receiver.
     */

    var selection;

    selection = this.getRootUpdateSelection(this.get('rootSelection'));

    if (TP.isValid(selection)) {
        this.set('rootSelection', selection);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('d3SelectContainer',
function() {

    /**
     * @method d3SelectContainer
     * @summary Using the receiver's 'selectionContainer', this method performs a
     *     d3.js 'select' to select the root Element under which all of the
     *     receiver's content that will be redrawn with d3.js can be found.
     * @returns {TP.core.D3Tag} The receiver.
     */

    this.set('rootSelection',
                TP.extern.d3.select(this.get('selectionContainer')));

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

    var updateSelection;

    updateSelection = this.get('updateSelection');

    this.updateExistingContent(updateSelection);

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

TP.core.D3Tag.Inst.defineMethod('getKeyFunction',
function() {

    /**
     * @method getKeyFunction
     * @summary Returns the Function that should be used to generate keys into
     *     the receiver's data set. By default this method returns a null key
     *     function, thereby using the index in the data set as the key.
     * @description This Function should take a single argument, an individual
     *     item from the receiver's data set, and return a value that will act
     *     as that item's key in the overall data set. The default version
     *     returns the item itself.
     * @returns {Function} A Function that provides a key for the supplied data
     *     item.
     */

    //  By default we return a null key function.
    return null;
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('getRootUpdateSelection',
function(rootSelection) {

    /**
     * @method getRootUpdateSelection
     * @summary Creates the 'root' update selection that will be used as the
     *     starting point to begin d3.js drawing operations.
     * @returns {d3.Selection} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('getSelectionContainer',
function() {

    /**
     * @method getSelectionContainer
     * @summary Returns the Element that will be used as the 'root' to
     *     add/update/remove content to/from using d3.js functionality. By
     *     default, this returns the receiver's native Element.
     * @returns {Element} The element to use as the container for d3.js
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

    //  If the data is not valid, then empty the root selection (keeping the
    //  root itself intact for future updates).
    if (TP.notValid(this.get('data'))) {

        this.get('rootSelection').selectAll('*').remove();

    } else {

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
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.core.D3Tag.Inst.defineMethod('removeOldContent',
function(exitSelection) {

    /**
     * @method removeOldContent
     * @summary Removes any existing content in the receiver by altering the
     *     content in the supplied d3.js 'exit selection'.
     * @param {TP.extern.d3.selection} exitSelection The d3.js exit selection
     *     that existing content should be altered in.
     * @returns {TP.core.D3Tag} The receiver.
     */

    exitSelection.remove();

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

    return this;
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
