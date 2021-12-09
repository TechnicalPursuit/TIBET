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
 * @type {TP.dom.D3Tag}
 * @summary A trait which mixes in common functionality for d3-based UI
 *     components. Data-driven controls such as lists, tables, menus, as well as
 *     more typical d3 components such as graphs and charts can leverage this
 *     mixin to get common d3 functionality.
 */

//  ------------------------------------------------------------------------

TP.dom.ElementNode.defineSubtype('D3Tag');

//  This type is intended to be used as a trait type only, so we don't allow
//  instance creation
TP.dom.D3Tag.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.dom.D3Tag.Type.defineMethod('initialize',
function() {

    /**
     * @method initialize
     * @summary Performs one-time setup for the type on startup/import.
     */

    this.defineDependencies('TP.extern.d3');

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

/**
 * Whether or not d3.js should 'order' the DOM nodes based on the index of their
 * data. The default is true.
 * @type {Boolean}
 */
TP.dom.D3Tag.Type.defineAttribute('shouldOrder');

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

/**
 * The registry of templating expressions used by the rendering methods.
 * @type {TP.core.hash}
 */
TP.dom.D3Tag.Inst.defineAttribute('$templateExprRegistry');

/**
 * Whether or not to render. The default is true.
 * @type {Boolean}
 */
TP.dom.D3Tag.Inst.defineAttribute('shouldRender');

/**
 * The data-bound update selection set for d3.js.
 * @type {TP.extern.d3.selection}
 */
TP.dom.D3Tag.Inst.defineAttribute('updateSelection');

/**
 * The data set to render, via d3.js, into the receiver.
 * @type {Object}
 */
TP.dom.D3Tag.Inst.defineAttribute('data');

/**
 * The container selection for the element for d3.js.
 * @type {TP.extern.d3.selection}
 */
TP.dom.D3Tag.Inst.defineAttribute('containerSelection');

/**
 * The element used as the 'selection container' (i.e. the update selection will
 * be created on this selection root).
 * @type {Element}
 */
TP.dom.D3Tag.Inst.defineAttribute('selectionContainer');

/**
 * Whether or not we have a template.
 * @type {Boolean}
 */
TP.dom.D3Tag.Inst.defineAttribute('$hasTemplate');

/**
 * The template in compiled form.
 * @type {Element}
 */
TP.dom.D3Tag.Inst.defineAttribute('$compiledTemplateContent');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('adjustIterationIndex',
function(anIndex) {

    /**
     * @method adjustIterationIndex
     * @summary Adjusts any iteration index that we use when building or
     *     updating templated content.
     * @param {Number} The initial index as supplied by d3.
     * @returns {Number} The adjusted index.
     */

    //  At this level, this method just returns the number it was handed.
    return anIndex;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('buildNewContent',
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

    return enterSelection;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('buildNewContentFromTemplate',
function(enterSelection) {

    /**
     * @method buildNewContentFromTemplate
     * @summary Builds new content onto the receiver by processing the
     *     receiver's template content and appending that onto the supplied
     *     d3.js 'enter selection'.
     * @param {TP.extern.d3.selection} enterSelection The d3.js enter selection
     *     that new content should be appended to.
     * @returns {TP.extern.d3.selection} The new selection containing any new
     *     content that was added by processing the template.
     */

    var itemSelectionInfo,

        compiledTemplateContent,

        registry,
        elems,
        i,
        attrs,
        j,
        attrName,
        attrVal,

        allData,

        thisref,

        newContent;

    itemSelectionInfo = this.getItemSelectionInfo();

    compiledTemplateContent = this.get('$compiledTemplateContent');

    //  If we haven't constructed the template, make sure to do so here.
    if (!TP.isElement(compiledTemplateContent)) {

        //  Construct the template and obtain it.
        this.constructTemplateFromInline();
        compiledTemplateContent = this.get('$compiledTemplateContent');
    } else {
        //  Clean any id's or other instance specific information from the
        //  compiled content. We pass true to clean it from any descendants as
        //  well.
        //  We have to do this every time we use it because we leave the
        //  template in the overall DOM and it or its descendants might pick up
        //  instance specific information during runtime.
        TP.elementClean(compiledTemplateContent, true);
    }

    registry = this.get('$templateExprRegistry');

    //  Note how we check specifically for 'not valid' here. The registry might
    //  have been created, but empty because there were no template expressions,
    //  only a static template.

    if (TP.notValid(registry)) {
        registry = TP.hc();

        //  Note how we pass 'false' here to not trigger change notification.
        //  Commonly, subtypes of this type will be bound objects, so change
        //  notification will be on by default.

        this.set('$templateExprRegistry', registry, false);

        //  Query the item element for elements with a '*:in' or '*:io' - we'll
        //  filter for the 'bind' namespace below.
        elems = TP.ac(
                    compiledTemplateContent.querySelectorAll(
                        ':scope *[*|in], :scope *[*|io]'));

        //  Additionally, if the supplied Element itself matches that query then
        //  unshift it onto the result.
        if (compiledTemplateContent.matches('*[*|in], *[*|io]')) {
            elems.unshift(compiledTemplateContent);
        }

        //  Loop over all of the elements that were found.
        for (i = 0; i < elems.length; i++) {
            attrs = elems[i].attributes;

            //  Loop over all of the attributes of the found element.
            for (j = 0; j < attrs.length; j++) {

                attrName = attrs[j].nodeName;
                attrVal = attrs[j].value;

                //  If the attribute was in the BIND namespace, then add it to
                //  our list of bound attributes.
                if (attrs[j].namespaceURI === TP.w3.Xmlns.BIND) {
                    registry.atPut(
                        attrVal,
                        this.getType().computeBindingInfo(
                                            elems[i], attrName, attrVal));
                }
            }
        }
    }

    allData = this.get('data');

    thisref = this;

    //  Append new content by cloning the template content element and updating
    //  that clone with data from the d3.js append() call and ourself.
    newContent = enterSelection.append(
        function(datum, index, group) {

            var newElem;

            newElem = TP.nodeCloneNode(compiledTemplateContent);

            thisref.updateTemplatedItemContent(
                        newElem,
                        TP.wrap(datum),
                        index,
                        group,
                        allData,
                        registry);

            //  Compile the element now that we've resolved the outer bindings.
            newElem = TP.elementCompile(
                        newElem,
                        TP.request(
                            'phases', TP.ac(
                                            'TP.tag.PrecompilePhase',
                                            'TP.tag.CompilePhase',
                                            'TP.tag.CompileCompletePhase'
                                            )));

            TP.elementBubbleXMLNSAttributesOnDescendants(newElem);

            //  Build any additional content onto the newly created element.
            thisref.buildAdditionalContent(newElem);

            return newElem;
        }).attr(
            itemSelectionInfo.first(),
            itemSelectionInfo.last());

    return newContent;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('buildAdditionalContent',
function(anElement) {

    /**
     * @method buildAdditionalContent
     * @summary Builds additional content onto the supplied element, which will
     *     be an individual item when rendering *new* repeating content in the
     *     receiver's rendering pipeline.
     * @param {Element} anElement The newly created item element. Note that this
     *     will *already* have been placed in the visual DOM.
     * @returns {TP.dom.D3Tag} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('computeSelectionData',
function() {

    /**
     * @method computeSelectionData
     * @summary Returns the data that will actually be used for binding into the
     *     d3.js selection.
     * @description The selection data may very well be different than the bound
     *     data that uses TIBET data binding to bind data to this control. This
     *     method allows the receiver to transform it's 'data binding data' into
     *     data appropriate for d3.js selections.
     * @returns {Object} The selection data.
     */

    //  The default version of this just returns the data-binding bound data.
    return this.get('data');
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('constructTemplateFromInline',
function() {

    /**
     * @method constructTemplateFromInline
     * @summary Constructs the template used by the receiver to generate
     *     content, if provided by the author.
     * @returns {TP.dom.D3Tag} The receiver.
     */

    var templateContentTPElem,
        compiledTemplateContent;

    //  Grab the first child Element under the template root.
    templateContentTPElem = this.getTemplate().getFirstChildElement();

    //  Grab it's native node and cache that.
    compiledTemplateContent = templateContentTPElem.getNativeNode();

    //  Clean any id's or other instance specific information from the compiled
    //  content. We pass true to clean it from any descendants as well.
    TP.elementClean(compiledTemplateContent, true);

    //  Note how we pass 'false' here to not trigger change notification.
    //  Commonly, subtypes of this type will be bound objects, so change
    //  notification will be on by default.

    this.set('$compiledTemplateContent', compiledTemplateContent, false);

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('d3Data',
function(rootUpdateSelection) {

    /**
     * @method d3Data
     * @summary Binds the receiver's data set to a d3.js selection. Analogous to
     *     the '.data()' method of a d3.js selection.
     * @param {TP.extern.d3.selection} rootUpdateSelection The d3.js update
     *     selection representing the 'root' that is managed by the receiver.
     * @returns {TP.dom.D3Tag} The receiver.
     */

    var data,

        keyFunc;

    data = this.computeSelectionData();

    //  Note how we pass 'false' here to not trigger change notification for the
    //  set() calls in this method. Commonly, subtypes of this type will be
    //  bound objects, so change notification will be on by default.

    if (TP.isValid(data)) {

        keyFunc = this.d3KeyFunction();
        if (TP.isCallable(keyFunc)) {
            this.set('updateSelection',
                        rootUpdateSelection.data(data, keyFunc),
                        false);
        } else {
            this.set('updateSelection',
                        rootUpdateSelection.data(data, TP.RETURN_ARG0),
                        false);
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('d3Enter',
function(updateSelection) {

    /**
     * @method d3Enter
     * @summary Processes any 'enter selection' by obtaining the d3.js enter
     *     selection and adding it to the drawing 'stage' by calling the
     *     'buildNewContent()' or 'buildNewContentFromTemplate()' method on the
     *     receiver.
     * @param {TP.extern.d3.selection} [updateSelection] The d3.js update
     *     selection that new content should be appended to. If this is not
     *     supplied, then an enter selection computed from the receiver's update
     *     selection will be used.
     * @returns {TP.dom.D3Tag} The receiver.
     */

    var selection;

    //  Grab the supplied enter selection or compute one from our update
    //  selection.
    if (TP.notValid(updateSelection)) {
        selection = this.get('updateSelection').enter();
    } else {
        selection = updateSelection;
    }

    //  NB: 'selection.empty' is a d3 method which tests if a selection is
    //  empty. Not to be confused with the TIBET 'empty' method, which empties
    //  an Array.
    if (TP.isValid(selection) && !selection.empty()) {

        //  Note here how, in both cases, we grab the return value (which should
        //  be a selection that was the initial selection but with content
        //  appended to it) and supply that to the finish* call below.

        if (this.hasTemplate()) {
            selection = this.buildNewContentFromTemplate(selection);
        } else {
            selection = this.buildNewContent(selection);
        }

        this.finishBuildingNewContent(selection);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('d3EnterTransition',
function() {

    /**
     * @method d3EnterTransition
     * @summary Provides any 'transition' for the receiver's d3.js 'enter
     *     selection'. This allows for a visual effect when new content is
     *     'entering' the drawing 'stage'.
     * @returns {TP.dom.D3Tag} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('d3Exit',
function(exitSelection) {

    /**
     * @method d3Exit
     * @summary Processes any 'exit selection' by obtaining the d3.js exit
     *     selection and removing it from the drawing 'stage' by calling the
     *     'removeOldContent()' method on the receiver.
     * @param {TP.extern.d3.selection} [exitSelection] The d3.js update
     *     selection that existing content should be removed from. If this is
     *     not supplied, then the receiver's update selection will be used.
     * @returns {TP.dom.D3Tag} The receiver.
     */

    var selection;

    //  Grab the supplied update selection or use ours.
    if (TP.notValid(exitSelection)) {
        selection = this.get('updateSelection').exit();
    } else {
        selection = exitSelection;
    }

    //  NB: 'selection.empty' is a d3 method which tests if a selection is
    //  empty. Not to be confused with the TIBET 'empty' method, which empties
    //  an Array.
    if (TP.isValid(selection) && !selection.empty()) {
        this.removeOldContent(selection);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('d3ExitTransition',
function() {

    /**
     * @method d3ExitTransition
     * @summary Provides any 'transition' for the receiver's d3.js 'exit
     *     selection'. This allows for a visual effect when old content is
     *     'exiting' the drawing 'stage'.
     * @returns {TP.dom.D3Tag} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('d3KeyFunction',
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

    //  By default we return null - this means d3 will use the index.
    return null;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('d3Select',
function() {

    /**
     * @method d3Select
     * @summary Creates the root update selection by obtaining it and returning
     *     it.
     * @returns {TP.extern.d3.selection|null} The d3.js root update selection.
     */

    var container,
        selection;

    //  Grab the container D3 selection. If it's not valid, return null.
    container = this.get('containerSelection');
    if (TP.notValid(container)) {
        return null;
    }

    selection = this.getRootUpdateSelection(container);

    return selection;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('d3SelectContainer',
function() {

    /**
     * @method d3SelectContainer
     * @summary Using the receiver's 'selectionContainer', this method performs
     *     a d3.js 'select' to select the root Element under which all of the
     *     receiver's content that will be redrawn with d3.js can be found.
     * @returns {TP.dom.D3Tag} The receiver.
     */

    var container;

    //  Note how we pass 'false' here to not trigger change notification.
    //  Commonly, subtypes of this type will be bound objects, so change
    //  notification will be on by default.

    container = this.makeContainerSelection();

    if (TP.isValid(container)) {
        this.set('containerSelection', container, false);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('d3Update',
function(updateSelection) {

    /**
     * @method d3Update
     * @summary Processes any 'update selection' by obtaining the d3.js update
     *     selection and updating it on the drawing 'stage' by calling the
     *     'updateExistingContent()' method on the receiver.
     *     'updateExistingContent()' or 'updateExistingContentFromTemplate()'
     *     method on the receiver.
     * @param {TP.extern.d3.selection} [updateSelection] The d3.js update
     *     selection that existing content should be altered in. If this is not
     *     supplied, then the receiver's update selection will be used.
     * @returns {TP.dom.D3Tag} The receiver.
     */

    var selection;

    //  Grab the supplied update selection or use ours.
    if (TP.notValid(updateSelection)) {
        selection = this.get('updateSelection');
    } else {
        selection = updateSelection;
    }

    //  NB: 'selection.empty' is a d3 method which tests if a selection is
    //  empty. Not to be confused with the TIBET 'empty' method, which empties
    //  an Array.
    if (TP.isValid(selection) && !selection.empty()) {

        //  Note here how, in both cases, we grab the return value (which should
        //  be a selection that was the initial selection may have other
        //  alteration) and supply that to the finish* call below.

        if (this.hasTemplate()) {
            selection = this.updateExistingContentFromTemplate(selection);
        } else {
            selection = this.updateExistingContent(selection);
        }

        this.finishUpdatingExistingContent(selection);
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('d3UpdateTransition',
function() {

    /**
     * @method d3UpdateTransition
     * @summary Provides any 'transition' for the receiver's d3.js 'update
     *     selection'. This allows for a visual effect when existing content is
     *     being updated on the drawing 'stage'.
     * @returns {TP.dom.D3Tag} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('finishBuildingNewContent',
function(selection) {

    /**
     * @method finishBuildingNewContent
     * @summary Wrap up building any new content. This is useful if the type
     *     could either use a template or not to build new content, but there is
     *     shared code used to build things no matter which method is used.
     * @param {TP.extern.d3.selection} [selection] The d3.js enter selection
     *     that new content should be appended to or altered.
     * @returns {TP.dom.D3Tag} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('finishUpdatingExistingContent',
function(selection) {

    /**
     * @method finishUpdatingExistingContent
     * @summary Wrap up altering any existing content. This is useful if the
     *     type could either use a template or not to alter existing content,
     *     but there is shared code used to alter things no matter which method
     *     is used.
     * @param {TP.extern.d3.selection} [selection] The d3.js update selection
     *     that new content should be appended to or altered.
     * @returns {TP.dom.D3Tag} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('getItemSelectionInfo',
function() {

    /**
     * @method getItemSelectionInfo
     * @summary Returns an Array that contains an attribute name and attribute
     *     value that will be used to 'select' all of the items in the template
     *     of the receiver.
     *     Therefore, the receiver needs to stamp this attribute and value on
     *     each item in its drawing machinery methods.
     * @returns {String[]} A pair containing the attribute name and value.
     */

    return TP.ac('class', 'item');
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('getRootUpdateSelection',
function(containerSelection) {

    /**
     * @method getRootUpdateSelection
     * @summary Creates the 'root' update selection that will be used as the
     *     starting point to begin d3.js drawing operations.
     * @param {TP.extern.d3.selection} containerSelection The selection made by
     *     having d3.js select() the receiver's 'selection container'.
     * @returns {TP.extern.d3.Selection} The receiver.
     */

    //  At this level, we just return the supplied container selection, which is
    //  a d3.js 'select()'ion of the selection container.
    return containerSelection;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('getSelectionContainer',
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

TP.dom.D3Tag.Inst.defineMethod('getTemplate',
function() {

    /**
     * @method getTemplate
     * @summary Returns the TP.dom.ElementNode that will be used as the
     *     'template' to generate content under the receiver. This template can
     *     include data binding expressions that will be used, along with the
     *     receiver's data, to generate that content.
     * @returns {TP.dom.ElementNode} The TP.dom.ElementNode to use as the
     *     template for the receiver.
     */

    return null;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('hasTemplate',
function() {

    /**
     * @method hasTemplate
     * @summary Returns whether or not the receiver has a template. This will be
     *     used to determine which drawing methods to use (with or without
     *     template).
     * @returns {Boolean} Whether or not the receiver has a template.
     */

    var flag,
        templateTPElem,

        hasTemplate;

    //  If we have compiled template content, then we always have a template.
    if (TP.isElement(this.get('$compiledTemplateContent'))) {
        return true;
    }

    //  Otherwise, check our flag. If it's set, then return it's value, true or
    //  false.
    flag = this.get('$hasTemplate');
    if (TP.isValid(flag)) {
        return flag;
    }

    //  Note how we pass 'false' here to not trigger change notification for the
    //  set() calls in this method. Commonly, subtypes of this type will be
    //  bound objects, so change notification will be on by default.

    //  Grab the template. If we cannot get a valid template element, then set
    //  our flag to false and return false.
    templateTPElem = this.getTemplate();
    if (TP.notValid(templateTPElem)) {
        this.set('$hasTemplate', false, false);
        return false;
    }

    //  Otherwise, check to make sure that we have at least one Element node
    //  under the template element. We may have just a Text node or something
    //  else. In any case, capture the Boolean value from TP.isValid() and set
    //  our flag to it.
    hasTemplate = TP.isValid(templateTPElem.getFirstChildElement());
    this.set('$hasTemplate', hasTemplate, false);

    return hasTemplate;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('makeContainerSelection',
function() {

    /**
     * @method makeContainerSelection
     * @summary Manufactures a d3.js selection around our container.
     * @returns {TP.extern.d3.selection|null} The d3.js selection that was
     *     created.
     */

    var container;

    //  Grab the D3 selection container. If it's not valid, return null.
    container = this.get('selectionContainer');
    if (TP.notValid(container)) {
        return null;
    }

    return TP.extern.d3.select(container);
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('render',
function() {

    /**
     * @method render
     * @summary Renders the receiver.
     * @returns {TP.dom.D3Tag} The receiver.
     */

    var containerSelection,
        rootUpdateSelection;

    //  Note that this is a strict check for the value of 'false' (the Boolean
    //  value of false). This can't just be a 'falsey' value.
    if (TP.isFalse(this.get('shouldRender'))) {
        return this;
    }

    this.d3SelectContainer();

    //  If the data is not valid, then empty the root selection (keeping the
    //  root itself intact for future updates).
    if (TP.notValid(this.get('data'))) {

        containerSelection = this.get('containerSelection');

        //  No valid container selection? Return here.
        if (TP.notValid(containerSelection)) {

            //  Signal to observers that this control has rendered.
            this.signal('TP.sig.DidRender');

            return this;
        }

        containerSelection.selectAll('*').remove();

        //  Signal to observers that this control has rendered.
        this.signal('TP.sig.DidRender');

    } else {

        //  Select any nodes under the 'selection root'
        rootUpdateSelection = this.d3Select();

        //  No valid root update selection? Return here.
        if (TP.notValid(rootUpdateSelection)) {

            //  Signal to observers that this control has rendered.
            this.signal('TP.sig.DidRender');

            return this;
        }

        //  Associate (or 'bind') the data to the root update selection.
        this.d3Data(rootUpdateSelection);

        //  Update any existing update selection
        this.d3Update();
        this.d3UpdateTransition();

        //  Add any content to the enter selection
        this.d3Enter();
        this.d3EnterTransition();

        //  Remove any content from the exit selection
        this.d3Exit();
        this.d3ExitTransition();

        //  If we're supposed to maintain the order between data and DOM, then
        //  do so here.
        if (TP.notFalse(this.getType().get('shouldOrder'))) {
            this.get('updateSelection').order();
        }

        //  Signal to observers that this control has rendered its data.
        this.signal('TP.sig.DidRenderData');
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('removeOldContent',
function(exitSelection) {

    /**
     * @method removeOldContent
     * @summary Removes any existing content in the receiver by altering the
     *     content in the supplied d3.js 'exit selection'.
     * @param {TP.extern.d3.selection} exitSelection The d3.js exit selection
     *     that existing content should be altered in.
     * @returns {TP.dom.D3Tag} The receiver.
     */

    exitSelection.remove();

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('updateAdditionalContent',
function(anElement) {

    /**
     * @method updateAdditionalContent
     * @summary Updates additional content onto the supplied element, which will
     *     be an individual item when rendering *existing* repeating content in
     *     the receiver's rendering pipeline.
     * @param {Element} anElement The existing item element. Note that this will
     *     *already* have been placed in the visual DOM.
     * @returns {TP.dom.D3Tag} The receiver.
     */

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('updateExistingContent',
function(updateSelection) {

    /**
     * @method updateExistingContent
     * @summary Updates any existing content in the receiver by altering the
     *     content in the supplied d3.js 'update selection'.
     * @param {TP.extern.d3.selection} updateSelection The d3.js update
     *     selection that existing content should be altered in.
     * @returns {TP.extern.d3.selection} The supplied update selection.
     */

    return updateSelection;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('updateExistingContentFromTemplate',
function(updateSelection) {

    /**
     * @method updateExistingContentFromTemplate
     * @summary Updates any existing content in the receiver by processing the
     *     receiver's template content and updating that onto the supplied
     *     d3.js 'update selection'.
     * @param {TP.extern.d3.selection} updateSelection The d3.js update
     *     selection that content should be altered in.
     * @returns {TP.extern.d3.selection} The update selection that was altered
     *     by processing the template.
     */

    var allData,
        registry,

        thisref;

    //  Grab our complete set of data.
    allData = this.get('data');

    //  Grab our registry of template expressions. This will have been populated
    //  the first time that the buildNewContentFromTemplate method was invoked.
    registry = this.get('$templateExprRegistry');

    //  We capture 'this' into 'thisref' here, because we'll also want to use
    //  the 'this' reference inside of the Function (it points to the DOM
    //  Element that is being updated).
    thisref = this;

    updateSelection.each(
        function(datum, index, groupIndex) {

            //  Update each element using a combination of parameters provided
            //  by d3.js (this, datum, index & groupIndex) and the ones provided
            //  by us (allData & registry) that we wanted to cache and not
            //  re-obtain through each iteration.
            thisref.updateTemplatedItemContent(
                    this,
                    datum,
                    index,
                    groupIndex,
                    allData,
                    registry);

            //  Update any additional content on the element.
            thisref.updateAdditionalContent(this);
        });

    return updateSelection;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('updateTemplatedItemContent',
function(itemElement, datum, index, groupIndex, allData, registry) {

    /**
     * @method updateTemplatedItemContent
     * @summary Updates the supplied element, which may contain data binding
     *     expressions in it, using the supplied data.
     * @param {Element} itemElement The top-level element to update. Either this
     *     element or its descendants will contain data binding expressions.
     * @param {Object} datum The individual data item out of the receiver's
     *     entire set that is currently being processed.
     * @param {Number} index The 0-based index of the supplied datum in the
     *     overall data set that is currently being processed.
     * @param {Number} groupIndex The index of the current group. This is useful
     *     when processing nested selections.
     * @param {Object[]} allData The receiver's entire data set, provided here
     *     as a convenience.
     * @param {TP.core.Hash} registry The registry of data binding expressions
     *     that was built the first time buildNewContentFromTemplate was called.
     *     This will contain keys of the whole attribute value containing the
     *     whole expression mapped to an Array of the individual data
     *     expressions inside and to a transformation Function that would've
     *     been generated if necessary.
     * @returns {TP.dom.D3Tag} The receiver.
     */

    var elems,

        ind,

        controlScopeValues,

        wrappedDatum,

        len,

        i,
        attrs,

        j,

        ownerElem,
        ownerTPElem,
        scopeValues,

        attrVal,
        entry;

    //  Query the item element for elements with a '*:in' or '*:io' - we'll
    //  filter for the 'bind' namespace below.
    elems = TP.ac(
                itemElement.querySelectorAll(
                    ':scope *[*|in], :scope *[*|io]'));

    //  Additionally, if the supplied Element itself matches that query then
    //  unshift it onto the result.
    if (itemElement.matches('*[*|in], *[*|io]')) {
        elems.unshift(itemElement);
    }

    ind = this.adjustIterationIndex(index);

    controlScopeValues = this.getBindingScopeValues();

    if (TP.isPlainObject(datum)) {
        wrappedDatum = TP.hc(datum);
    } else {
        wrappedDatum = datum;
    }

    //  Loop over all of the elements that were found.
    len = elems.getSize();
    for (i = 0; i < len; i++) {
        attrs = elems.at(i).attributes;

        //  Loop over all of the attributes of the found element.
        for (j = 0; j < attrs.length; j++) {

            if (attrs[j].namespaceURI !== TP.w3.Xmlns.BIND) {
                continue;
            }

            ownerElem = attrs[j].ownerElement;
            ownerTPElem = TP.wrap(ownerElem);

            //  Grab the scoping values from the element that we're currently
            //  processing for *inside the template*. If it has no scope values,
            //  then we use the ones for the overall control.
            scopeValues = ownerTPElem.getBindingScopeValues();
            if (TP.isEmpty(scopeValues)) {
                scopeValues = controlScopeValues;
            }

            attrVal = attrs[j].value;

            //  See if there's an entry in the registry for the expression with
            //  this attribute value.
            entry = registry.at(attrVal);

            /* eslint-disable no-loop-func */
            entry.perform(
                function(kvPair) {

                    var key,
                        record,

                        finalVal;

                    key = kvPair.first();
                    record = kvPair.last();

                    finalVal = this.$computeValueForBoundAspect(
                                    record, scopeValues, wrappedDatum,
                                    allData, ind);

                    //  If the key is 'value', set the text content of the owner
                    //  element to the transformed value. Otherwise, set the
                    //  facet on the owner using that value (it's up to the type
                    //  to decide whether to set an Attribute or not).
                    if (key === 'value') {
                        ownerTPElem.setValue(finalVal);
                    } else if (key[0] === '@') {
                        ownerTPElem.setAttribute(key.slice(1), finalVal);
                    } else {
                        //  The parameters here are:
                        //      aspect, facet (always 'value' here), value
                        ownerTPElem.setFacet(key, 'value', finalVal);
                    }
                }.bind(this));
            /* eslint-enable no-loop-func */
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.dom.D3Tag.Inst.defineMethod('setValue',
function(aValue, shouldSignal) {

    /**
     * @method setValue
     * @summary Sets the value of the receiver's node. For this type, this
     *     method sets the underlying data and renders the receiver.
     * @param {Object} aValue The value to set the 'value' of the node to.
     * @param {Boolean} shouldSignal Should changes be notified. For this type,
     *     this flag is ignored.
     * @returns {Boolean} Whether or not the value was changed from the value it
     *     had before this method was called.
     */

    //  Note how we pass 'false' here to not trigger change notification.
    //  Commonly, subtypes of this type will be bound objects, so change
    //  notification will be on by default.

    this.set('data', aValue, false);

    this.render();

    //  TODO: Optimize the return value here by comparing the old and new data
    //  values.
    return true;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
