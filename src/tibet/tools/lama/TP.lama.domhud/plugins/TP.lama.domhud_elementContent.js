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
 * @type {TP.lama.domhud_elementContent}
 */

//  ------------------------------------------------------------------------

TP.lama.TemplatedTag.defineSubtype('domhud_elementContent');

//  This type is intended to be used as either a trait type or supertype of
//  concrete types, so we don't allow instance creation
TP.lama.domhud_elementContent.isAbstract(true);

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.lama.domhud_elementContent.Type.defineMethod('tagAttachDOM',
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

    tpElem.observe(TP.uc('urn:tibet:domhud_attr_source'), 'ValueChange');
    tpElem.observe(TP.uc('urn:tibet:domhud_content_source'), 'ValueChange');

    return;
});

//  ------------------------------------------------------------------------

TP.lama.domhud_elementContent.Type.defineMethod('tagDetachDOM',
function(aRequest) {

    /**
     * @method tagDetachDOM
     * @summary Tears down runtime machinery for the element in aRequest.
     * @param {TP.sig.Request} aRequest A request containing processing
     *     parameters and other data.
     */

    var elem,
        tpElem;

    //  Make sure that we have an Element to work from
    if (!TP.isElement(elem = aRequest.at('node'))) {
        //  TODO: Raise an exception.
        return;
    }

    tpElem = TP.wrap(elem);

    tpElem.ignore(TP.uc('urn:tibet:domhud_attr_source'), 'ValueChange');
    tpElem.ignore(TP.uc('urn:tibet:domhud_content_source'), 'ValueChange');

    //  this makes sure we maintain parent processing - but we need to do it
    //  last because it nulls out our wrapper reference.
    this.callNextMethod();

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.lama.domhud_elementContent.Inst.defineAttribute('$attributeNames');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.domhud_elementContent.Inst.defineMethod('buildAttributesModel',
function(targetTPElem) {

    /**
     * @method buildAttributesModel
     * @summary Builds the model object used for binding the attributes tile
     *     panel GUI controls.
     * @param {TP.dom.ElementNode} targetTPElem The element to obtain the set of
     *     attributes from.
     * @returns {TP.core.JSONContent} The JSON content object that will be used
     *     as the model.
     */

    var modelObj,
        newInsertionInfo,
        names;

    //  Build the model object.
    modelObj = TP.hc();

    //  Register a hash to be placed at the top-level 'info' slot in the model.
    newInsertionInfo = TP.hc();
    modelObj.atPut('info', newInsertionInfo);

    names = TP.ac();

    //  Iterate over the target's attributes and populate the data model with
    //  the name and value.
    targetTPElem.getAttributes().perform(
        function(kvPair) {
            var name,
                value;

            name = kvPair.first();
            value = kvPair.last();

            names.push(name);

            newInsertionInfo.atPut(name, value);
        });
    this.set('$attributeNames', names);

    //  Construct a JSONContent object around the model object so that we can
    //  bind to it using the more powerful JSONPath constructs
    modelObj = TP.core.JSONContent.construct(TP.js2json(modelObj));

    return modelObj;
});

//  ------------------------------------------------------------------------

TP.lama.domhud_elementContent.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles when the user changes the value of the underlying model.
     * @param {ValueChange} aSignal The signal that caused this handler to trip.
     * @returns {TP.lama.domhud_elementContent} The receiver.
     */

    switch (aSignal.getOrigin()) {

        case TP.uc('urn:tibet:domhud_attr_source'):
            this.updateAttributes(aSignal);
            break;
        case TP.uc('urn:tibet:domhud_content_source'):
            this.updateTextSource(aSignal);
            break;
        default:
            break;
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.domhud_elementContent.Inst.defineMethod('setValue',
function(aValue, shouldSignal) {

    /**
     * @method setValue
     * @summary Sets the value of this content panel. For this type, this
     *     updates the 'attributes model', which is what it's GUI is bound to.
     * @param {Object} aValue The value to set the 'value' of the node to.
     * @param {Boolean} shouldSignal Should changes be notified. If false
     *     changes are not signaled. Defaults to this.shouldSignalChange().
     * @returns {Boolean} Whether or not the value was changed from the value it
     *     had before this method was called.
     */

    var attributesModel,

        modelURI,

        str,

        textContentModel;

    //  NB: In this method, 'value' is the source element that we're currently
    //  inspecting.

    //  Compute the attributes model.
    attributesModel = this.buildAttributesModel(aValue);

    //  Set it as the resource of the URI.
    modelURI = TP.uc('urn:tibet:domhud_attr_source');
    modelURI.setResource(attributesModel, TP.hc('signalChange', true));

    //  Compute the text content model.
    str = aValue.lamaGetTextContent();

    textContentModel = TP.hc('info', str);

    modelURI = TP.uc('urn:tibet:domhud_content_source');
    modelURI.setResource(textContentModel, TP.hc('signalChange', true));

    return true;
});

//  ------------------------------------------------------------------------

TP.lama.domhud_elementContent.Inst.defineMethod('updateAttributes',
function(aSignal) {

    /**
     * @method updateAttributes
     * @summary Updates the attributes according to the data in their bound
     *     source.
     * @param {ValueChange} aSignal The signal that caused this update method to
     *     be invoked.
     * @returns {TP.lama.domhud_elementContent} The receiver.
     */

    var aspectPath,

        targetTPElem,

        name,
        value,

        action,

        modelObj;

    aspectPath = aSignal.at('aspect');

    //  If the whole value or it's dirtiness changed, we're not interested.
    if (aspectPath === 'value' || aspectPath === 'dirty') {
        return this;
    }

    //  Make sure we have a valid attributes target.
    targetTPElem =
        TP.uc('urn:tibet:domhud_target_source').getResource().get('result');
    if (TP.notValid(targetTPElem)) {
        return this;
    }

    //  Tell the main Lama object that it should go ahead and process DOM
    //  mutations to the source DOM.
    TP.bySystemId('Lama').set('shouldProcessDOMMutations', true);

    action = aSignal.at('action');

    //  If the action is TP.UPDATE, then the user added an attribute or changed
    //  one of the existing attributes.
    if (action === TP.UPDATE || action === TP.CREATE) {

        //  Grab the model object where our data is located.
        modelObj =
            TP.uc('urn:tibet:domhud_attr_source').getResource().get('result');

        name = aspectPath.slice(aspectPath.lastIndexOf('.') + 1);
        value = modelObj.get(aspectPath);

        //  Set the value using the computed name and value.
        targetTPElem.setAttribute(name, value);

        targetTPElem.deaden();
        targetTPElem.awaken();

        if (action === TP.UPDATE) {
            targetTPElem.refresh();
        }

    } else if (action === TP.DELETE) {

        //  TODO: Supporting removing attributes
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.domhud_elementContent.Inst.defineMethod('updateTextSource',
function(aSignal) {

    /**
     * @method updateTextSource
     * @summary Updates the text source according to the data in its bound
     *     source.
     * @param {ValueChange} aSignal The signal that caused this update method to
     *     be invoked.
     * @returns {TP.lama.domhud_elementContent} The receiver.
     */

    var aspectPath,
        targetTPElem,

        value,

        haloTPElem;

    aspectPath = aSignal.at('aspect');

    //  If the whole value changed, we're not interested.
    if (aspectPath === 'value') {
        return this;
    }

    //  Make sure we have a valid attributes target.
    targetTPElem =
        TP.uc('urn:tibet:domhud_target_source').getResource().get('result');
    if (TP.notValid(targetTPElem)) {
        return this;
    }

    //  Grab the value from the content source and set that as the text content
    //  of the element.
    value = TP.uc('urn:tibet:domhud_content_source').
                getResource().get('result').get(aspectPath);

    if (TP.isEmpty(TP.trim(value))) {
        return this;
    }

    //  Tell the main Lama object that it should go ahead and process DOM
    //  mutations to the source DOM.
    TP.bySystemId('Lama').set('shouldProcessDOMMutations', true);

    targetTPElem.lamaSetTextContent(value);

    haloTPElem = TP.byId('LamaHalo', this.getNativeDocument());
    haloTPElem.moveAndSizeToTarget(targetTPElem);

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
