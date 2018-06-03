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
 * @type {TP.sherpa.domhud_genericElementContent}
 */

//  ------------------------------------------------------------------------

TP.sherpa.domhud_elementContent.defineSubtype('domhud_genericElementContent');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.sherpa.domhud_genericElementContent.Inst.defineMethod('buildAttributesModel',
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

TP.sherpa.domhud_genericElementContent.Inst.defineMethod('updateAttributes',
function(aSignal) {

    /**
     * @method updateAttributes
     * @summary Updates the attributes according to the data in their bound
     *     source.
     * @param {ValueChange} aSignal The signal that caused this update method to
     *     be invoked.
     * @returns {TP.sherpa.domhud_genericElementContent} The receiver.
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

    //  Tell the main Sherpa object that it should go ahead and process DOM
    //  mutations to the source DOM.
    TP.bySystemId('Sherpa').set('shouldProcessDOMMutations', true);

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

        targetTPElem.refresh();
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
//  end
//  ========================================================================
