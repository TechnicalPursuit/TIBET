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
 * @type {TP.sherpa.domhud_genericContent}
 */

//  ------------------------------------------------------------------------

TP.sherpa.TemplatedTag.defineSubtype('domhud_genericContent');

//  ------------------------------------------------------------------------
//  Type Methods
//  ------------------------------------------------------------------------

TP.sherpa.domhud_genericContent.Type.defineMethod('tagAttachDOM',
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

    return;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud_genericContent.Type.defineMethod('tagDetachDOM',
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

    //  this makes sure we maintain parent processing - but we need to do it
    //  last because it nulls out our wrapper reference.
    this.callNextMethod();

    return;
});

//  ------------------------------------------------------------------------
//  Instance Attributes
//  ------------------------------------------------------------------------

TP.sherpa.domhud_genericContent.Inst.defineAttribute('$attributeNames');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.domhud_genericContent.Inst.defineMethod('buildAttributesModel',
function(targetTPElem) {

    /**
     * @method buildAttributesModel
     * @summary Builds the model object used for binding the attributes tile
     *     panel GUI controls.
     * @param {TP.core.Element} targetTPElem The element to obtain the set of
     *     attributes from.
     * @returns {TP.core.JSONContent} The JSON content object that will be used
     *     as the model.
     */

    var modelObj,
        newInsertionInfo,
        names,
        tagAttrs;

    //  Build the model object.
    modelObj = TP.hc();

    //  Register a hash to be placed at the top-level 'info' slot in the model.
    newInsertionInfo = TP.hc();
    modelObj.atPut('info', newInsertionInfo);

    names = TP.ac();

    //  Iterate over the target's attributes and populate the data model with
    //  the name and value.
    tagAttrs = TP.ac();
    targetTPElem.getAttributes().perform(
        function(kvPair) {
            tagAttrs.push(
                TP.hc('tagAttrName', kvPair.first(),
                        'tagAttrValue', kvPair.last())
            );

            names.push(kvPair.first());
        });
    this.set('$attributeNames', names);

    newInsertionInfo.atPut('tagAttrs', tagAttrs);

    //  Construct a JSONContent object around the model object so that we can
    //  bind to it using the more powerful JSONPath constructs
    modelObj = TP.core.JSONContent.construct(TP.js2json(modelObj));

    return modelObj;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud_genericContent.Inst.defineHandler('ValueChange',
function(aSignal) {

    /**
     * @method handleValueChange
     * @summary Handles when the user changes the value of the underlying model.
     * @param {ValueChange} aSignal The signal that caused this handler to trip.
     * @returns {TP.sherpa.domhud} The receiver.
     */

    var aspectPath,

        targetTPElem,

        modelObj,

        nameAspectPath,
        valueAspectPath,

        name,
        value,

        allAttrNames,

        action,

        attrIndex,
        oldAttrName,

        hadAttribute,

        removedData;

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

    //  Grab an ordered list of all of the attribute names.
    allAttrNames = this.get('$attributeNames');

    action = aSignal.at('action');

    //  If the action is TP.UPDATE, then the user added an attribute or changed
    //  one of the existing attributes. Note that we don't concern ourselves
    //  with an action of TP.INSERT/TP.CREATE, because that means that the user
    //  has clicked the '+' button to insert a new attribute row, but hasn't
    //  filled out the name and value and we don't want to process blank
    //  attributes..
    if (action === TP.UPDATE) {

        //  Grab the model object where our data is located.
        modelObj =
            TP.uc('urn:tibet:domhud_attr_source').getResource().get('result');

        //  Compute a name aspect path by replacing 'tagAttrValue' with
        //  'tagAttrName' in the value aspect path.
        nameAspectPath = aspectPath.slice(0, aspectPath.lastIndexOf('.') + 1) +
                            'tagAttrName';
        valueAspectPath = aspectPath.slice(0, aspectPath.lastIndexOf('.') + 1) +
                            'tagAttrValue';

        //  Grab the name and value from the model.
        name = modelObj.get(nameAspectPath);
        value = modelObj.get(valueAspectPath);

        //  If we're changing the attribute name, but we have an empty value,
        //  then just exit here - no sense in doing a 'set'
        if (aspectPath.endsWith('tagAttrName') && TP.isEmpty(value)) {
            return this;
        }

        //  If we're changing the attribute name at this point (with an
        //  attribute that has a real value)
        if (aspectPath.endsWith('tagAttrName')) {

            //  We always set hadAttribute to true for this case, because we're
            //  actually 'removing' an attribute that did exist.
            hadAttribute = true;

            //  Slice out the index, convert it to a number and get the
            //  attribute name at that index in our list of all attribute names.
            //  This will tell us the old attribute name.
            attrIndex = aspectPath.slice(
                        aspectPath.indexOf('[') + 1,
                        aspectPath.indexOf(']'));
            attrIndex = attrIndex.asNumber();
            oldAttrName = allAttrNames.at(attrIndex);

            //  If we got one, remove the attribute at that position.
            if (TP.notEmpty(oldAttrName)) {
                targetTPElem.removeAttribute(oldAttrName);
            }

            //  Replace the old name with the new name in our list of
            //  attributes.
            allAttrNames.replace(oldAttrName, name);

            //  Set the value using the new name.
            targetTPElem.setAttribute(name, value);

        } else {

            hadAttribute = targetTPElem.hasAttribute(name);

            //  Set the attribute named by the name to the value
            if (!hadAttribute) {
                allAttrNames.push(name);
            }

            //  Set the value using the computed name and value.
            targetTPElem.setAttribute(name, value);
        }

        if (hadAttribute) {
            targetTPElem.deaden();
        }

        targetTPElem.awaken();
    } else if (action === TP.DELETE) {

        //  If we're deleting an attribute (because the user clicked an 'X'),
        //  then grab the removed data's 'name' value and remove the
        //  corresponding attribute.
        removedData = aSignal.at('removedData');
        if (TP.isValid(removedData)) {
            name = removedData.at('tagAttrs').at('tagAttrName');

            if (TP.notEmpty(name)) {
                //  Remove the name from our list of attribute names.
                allAttrNames.remove(name);

                //  Remove the attribute itself.
                targetTPElem.removeAttribute(name);
            }
        }

        if (TP.notEmpty(name)) {
            targetTPElem.deaden();
        }
    }

    return this;
});

//  ------------------------------------------------------------------------

TP.sherpa.domhud_genericContent.Inst.defineMethod('setValue',
function(aValue, shouldSignal) {

    /**
     * @method setValue
     * @summary Sets the value of this content panel. For this type, this
     *     updates the 'attributes model', which is what it's GUI is bound to.
     * @param {Object} aValue The value to set the 'value' of the node to.
     * @param {Boolean} shouldSignal Should changes be notified. If false
     *     changes are not signaled. Defaults to this.shouldSignalChange().
     * @returns {TP.sherpa.domhud_genericContent} The receiver.
     */

    var attributesModel,
        textContentModel,

        modelURI;

    //  Compute the attributes model.
    attributesModel = this.buildAttributesModel(aValue);

    //  Set it as the resource of the URI.
    modelURI = TP.uc('urn:tibet:domhud_attr_source');
    modelURI.setResource(attributesModel, TP.hc('signalChange', true));

    //  Compute the text content model.
    textContentModel = aValue.getTextContent();

    modelURI = TP.uc('urn:tibet:domhud_content_source');
    modelURI.setResource(textContentModel, TP.hc('signalChange', true));

    return this;
});

//  ------------------------------------------------------------------------
//  end
//  ========================================================================
