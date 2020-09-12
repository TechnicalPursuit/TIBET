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
 * @type {TP.lama.domhud_genericElementContent}
 */

//  ------------------------------------------------------------------------

TP.lama.domhud_elementContent.defineSubtype('domhud_genericElementContent');

//  ------------------------------------------------------------------------
//  Instance Methods
//  ------------------------------------------------------------------------

TP.lama.domhud_genericElementContent.Inst.defineMethod('buildAttributesModel',
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
            var newAttrVal;

            newAttrVal = this.rewriteAttributeValue(
                                targetTPElem, kvPair.first(), kvPair.last());

            if (TP.isEmpty(newAttrVal)) {
                return;
            }

            tagAttrs.push(
                TP.hc('tagAttrName', kvPair.first(),
                        'tagAttrValue', newAttrVal));

            names.push(kvPair.first());
        }.bind(this));
    this.set('$attributeNames', names);

    newInsertionInfo.atPut('tagAttrs', tagAttrs);

    //  Construct a JSONContent object around the model object so that we can
    //  bind to it using the more powerful JSONPath constructs
    modelObj = TP.core.JSONContent.construct(TP.js2json(modelObj));

    return modelObj;
});

//  ------------------------------------------------------------------------

TP.lama.domhud_genericElementContent.Inst.defineMethod('removeAttributeNamed',
function(sourceTPElem, attributeName) {

    /**
     * @method removeAttributeNamed
     * @summary Removes the attribute named by the supplied attribute name.
     *     Note that this method will take into account attributes, like
     *     'class', that need to be handled specially (i.e. not actually
     *     removed, but retained with only the values that are 'special').
     * @param {TP.dom.ElementNode} sourceTPElem The element to remove the
     *     attribute from.
     * @param {String} attributeName The name of the attribute to remove.
     * @returns {TP.lama.domhud_genericElementContent} The receiver.
     */

    var existingClasses,
        lamaClasses,

        wholeValue;

    //  If the attribute being set is 'class', then we need to work around the
    //  fact that the Lama likes to put 'lama-' classes on.
    if (/^class$/.test(attributeName)) {

        //  Grab all existing classes and filter out the 'lama-' class values.
        existingClasses = sourceTPElem.getAttribute('class').split(' ');
        lamaClasses = existingClasses.filter(
            function(aClass) {
                TP.regex.LAMA_CSS_CLASS.lastIndex = 0;
                return TP.regex.LAMA_CSS_CLASS.test(aClass);
            });

        //  If 'lama-' classes were part of the value, compute a value
        //  containing just them and set that on the element.
        if (TP.notEmpty(lamaClasses)) {
            wholeValue = lamaClasses.join(' ');
            sourceTPElem.setClass(wholeValue);
        } else {
            //  Otherwise, just remove the attribute altogether.
            sourceTPElem.removeAttribute(attributeName);
        }

        return this;
    }

    sourceTPElem.removeAttribute(attributeName);

    return this;
});

//  ------------------------------------------------------------------------

TP.lama.domhud_genericElementContent.Inst.defineMethod('rewriteAttributeValue',
function(sourceTPElem, attributeName, attributeValue) {

    /**
     * @method rewriteAttributeValue
     * @summary Rewrites the attribute named by the supplied attribute name with
     *     a possibly rewritten value from the supplied attribute value. Note
     *     that this method will take into account attributes, like 'class',
     *     that need to be handled specially.
     * @param {TP.dom.ElementNode} sourceTPElem The element that is the source
     *     of the attribute.
     * @param {String} attributeName The name of the attribute to get.
     * @param {String} attributeValue The value of the attribute to possibly
     *     rewrite.
     * @returns {TP.lama.domhud_genericElementContent} The receiver.
     */

    var otherAttrValue;

    //  Filters both default and prefixed namespaces.
    if (TP.regex.XMLNS_ATTR.test(attributeName)) {
        return null;
    }

    if (/^pclass:/.test(attributeName)) {
        return null;
    }

    if (/^tibet:/.test(attributeName)) {
        return null;
    }

    if (/^xml:/.test(attributeName)) {
        return null;
    }

    //  If the attribute being set is 'class', then we need to work around the
    //  fact that the Lama likes to put 'lama-' classes on.
    if (/^class$/.test(attributeName)) {
        //  Strip out any 'lama-' classes.
        TP.regex.LAMA_CSS_CLASS.lastIndex = 0;
        return attributeValue.strip(TP.regex.LAMA_CSS_CLASS);
    }

    if (/^href$/.test(attributeName)) {
        //  If the attribute value is '#' and there is an 'onclick' on the
        //  element that has a 'TP.core.Mouse.invokeObservers' call, then this
        //  is a rewritten binding and we need to filter it.
        otherAttrValue = sourceTPElem.getAttribute('onclick');

        if (attributeValue === '#' &&
            otherAttrValue.contains('TP.core.Mouse.invokeObservers')) {
            return null;
        }
    }

    if (/^onclick$/.test(attributeName)) {
        //  If the attribute value contains a 'TP.core.Mouse.invokeObservers'
        //  call and there is an 'href' on the element that has a value of '#',
        //  then this is a rewritten binding and we need to filter it.
        otherAttrValue = sourceTPElem.getAttribute('href');

        if (attributeValue.contains('TP.core.Mouse.invokeObservers') &&
            otherAttrValue === '#') {
            return null;
        }
    }

    return attributeValue;
});

//  ------------------------------------------------------------------------

TP.lama.domhud_genericElementContent.Inst.defineMethod('setAttributeValue',
function(sourceTPElem, attributeName, attributeValue) {

    /**
     * @method setAttributeValue
     * @summary Sets the attribute named by the supplied attribute name to the
     *     value in the supplied attribute value. Note that this method will
     *     take into account attributes, like 'class', that need to be handled
     *     specially.
     * @param {TP.dom.ElementNode} sourceTPElem The element to set the attribute
     *     on.
     * @param {String} attributeName The name of the attribute to set.
     * @param {String} attributeValue The value of the attribute to use.
     * @returns {Boolean} Whether or not to allow the data value in the
     *     attributes data model to change to the desired value.
     */

    var existingClasses,
        lamaClasses,

        wholeValue,

        currentValue,

        otherAttrValue;

    //  If the attribute being set is 'class', then we need to work around the
    //  fact that the Lama likes to put 'lama-' classes on.
    if (/^class$/.test(attributeName)) {

        //  Grab all existing classes and filter out the 'lama-' class values.
        existingClasses = sourceTPElem.getAttribute('class').split(' ');
        lamaClasses = existingClasses.filter(
            function(aClass) {
                TP.regex.LAMA_CSS_CLASS.lastIndex = 0;
                return TP.regex.LAMA_CSS_CLASS.test(aClass);
            });

        //  If the supplied attribute value is empty, then the whole 'class'
        //  value will just be the 'lama-' classes, if there are any.
        if (TP.isEmpty(attributeValue)) {
            wholeValue = lamaClasses.join(' ');
        } else if (TP.notEmpty(lamaClasses)) {
            //  Otherwise, if there were both a supplied value and 'lama-'
            //  classes, compute a value containing both.
            wholeValue = attributeValue + ' ' + lamaClasses.join(' ');
        } else {
            //  Otherwise, there were no 'lama-' classes - just use the
            //  supplied value.
            wholeValue = attributeValue;
        }

        sourceTPElem.setClass(wholeValue);

        return true;
    }

    if (/^href$/.test(attributeName)) {

        currentValue = sourceTPElem.getAttribute(attributeName);

        //  If the attribute value is '#' and there is an 'onclick' on the
        //  element that has a 'TP.core.Mouse.invokeObservers' call, then this
        //  is a rewritten binding and we need to filter it.
        otherAttrValue = sourceTPElem.getAttribute('onclick');

        if (currentValue === '#' &&
            otherAttrValue.contains('TP.core.Mouse.invokeObservers')) {

            return false;
        }
    }

    if (/^onclick$/.test(attributeName)) {

        currentValue = sourceTPElem.getAttribute(attributeName);

        //  If the attribute value contains a 'TP.core.Mouse.invokeObservers'
        //  call and there is an 'href' on the element that has a value of '#',
        //  then this is a rewritten binding and we need to filter it.
        otherAttrValue = sourceTPElem.getAttribute('href');

        if (currentValue.contains('TP.core.Mouse.invokeObservers') &&
            otherAttrValue === '#') {
            return false;
        }
    }

    sourceTPElem.setAttribute(attributeName, attributeValue);

    //  Tell the binding machinery to update its referenced locations, using the
    //  supplied native Element to derive the document that the locations will
    //  be refreshed from (the machinery will refresh all of the binding
    //  locations in the whole document).
    TP.bind.XMLNS.refreshReferencedLocations(sourceTPElem.getNativeNode());

    return true;
});

//  ------------------------------------------------------------------------

TP.lama.domhud_genericElementContent.Inst.defineMethod('updateAttributes',
function(aSignal) {

    /**
     * @method updateAttributes
     * @summary Updates the attributes according to the data in their bound
     *     source.
     * @param {ValueChange} aSignal The signal that caused this update method to
     *     be invoked.
     * @returns {TP.lama.domhud_genericElementContent} The receiver.
     */

    var aspectPath,

        targetTPElem,

        modelObj,
        lastIndex,

        nameAspectPath,
        valueAspectPath,

        name,
        value,

        allAttrNames,

        action,

        attrIndex,
        oldAttrName,

        allowChange,

        hadAttribute,

        removedData;

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
        lastIndex =
            modelObj.get('data').info.tagAttrs.getSize() - 1;

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
        } else {
            hadAttribute = targetTPElem.hasAttribute(name);

            //  If we didn't already have an attribute named the same as the
            //  attribute being set, add it to the list of attribute names that
            //  we're tracking.
            if (!hadAttribute) {
                allAttrNames.push(name);
            }
        }

        //  Set the value using the computed (possibly new) name and value.
        allowChange = this.setAttributeValue(targetTPElem, name, value);

        //  If we don't allow the change, then set the value in the data model
        //  to the empty value.
        if (!allowChange) {
            TP.alert('Cannot change: ' + name + ' as, for this element, TIBET' +
                        ' is already using this attribute internally');

            modelObj.set('jpath($.info.tagAttrs[' +
                            lastIndex +
                            '].tagAttrValue)', '');
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
        if (TP.isValid(removedData) && removedData.first()) {
            name = removedData.first().tagAttrName;

            if (TP.notEmpty(name)) {
                //  Remove the name from our list of attribute names.
                allAttrNames.remove(name);

                //  Remove the attribute.
                this.removeAttributeNamed(targetTPElem, name);
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
